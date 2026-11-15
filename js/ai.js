// Free AI helpers. Three options, all free:
//  1. "browser"      – an open model (Llama / Qwen) that downloads once and runs
//                      100% on your device with WebLLM. Private, no account, works offline after.
//  2. "pollinations" – Pollinations.ai free text API. No signup, but shared & may be rate-limited.
//  3. "custom"       – any OpenAI-compatible API with your own free key
//                      (Groq, OpenRouter free models, Google Gemini free tier, a local Ollama…).
import { load, save } from './store.js';
import { t, LANG, langName } from './i18n.js';
import { getProfile, ageById } from './profile.js';

export const WEBLLM_URL = 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.84/+esm';

export const BROWSER_MODELS = [
  { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', name: 'Qwen 2.5 1.5B — balanced (~1 GB)' },
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', name: 'Llama 3.2 1B — fastest (~0.9 GB)' },
  { id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', name: 'Llama 3.2 3B — smarter, needs a good GPU (~2.3 GB)' },
];

export const PRESETS = [
  { id: 'groq', name: 'Groq (free key)', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile', keyUrl: 'https://console.groq.com/keys' },
  { id: 'openrouter', name: 'OpenRouter (free models)', baseUrl: 'https://openrouter.ai/api/v1', model: 'meta-llama/llama-3.3-70b-instruct:free', keyUrl: 'https://openrouter.ai/keys' },
  { id: 'gemini', name: 'Google Gemini (free tier)', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash', keyUrl: 'https://aistudio.google.com/apikey' },
  { id: 'ollama', name: 'Ollama on this computer', baseUrl: 'http://localhost:11434/v1', model: 'llama3.2', keyUrl: 'https://ollama.com' },
];

const DEFAULTS = { provider: 'pollinations', browserModel: BROWSER_MODELS[0].id, baseUrl: PRESETS[0].baseUrl, model: PRESETS[0].model, key: '', chosen: false };
export function getAI() { return { ...DEFAULTS, ...load('ai', {}) }; }
export function setAI(patch) { const v = { ...getAI(), ...patch }; save('ai', v); return v; }
export const hasWebGPU = () => typeof navigator !== 'undefined' && 'gpu' in navigator;

const SYSTEM_BASE = `You are "Lamp", a warm, humble Bible study helper for people of all ages and backgrounds.
- Be faithful to what the text actually says. Quote carefully and always give references (e.g. John 3:16).
- Explain historical and cultural background when helpful.
- Where Christian traditions (Catholic, Orthodox, Protestant) or scholars differ, say so briefly and fairly instead of picking a side.
- Never invent verses, quotes, or facts. If unsure, say so.
- Use clear, simple language and short paragraphs or bullet points. Keep answers under about 250 words unless asked for more.
- Encourage the reader to read the passage themselves and to talk with their church or community.`;
export const systemPrompt = () => {
  const p = getProfile();
  const age = p.age ? `\n- ${ageById(p.age).tone}` : '';
  const name = p.name ? `\n- The reader's name is ${p.name}.` : '';
  return SYSTEM_BASE + age + name + `\n- Always answer in ${langName(LANG)}.`;
};

let engine = null, engineModel = null, enginePromise = null;

async function getEngine(model, onStatus) {
  if (engine && engineModel === model) return engine;
  if (enginePromise && engineModel === model) return enginePromise;
  if (!hasWebGPU()) throw new Error(t('ai.noWebgpu', 'This browser does not support WebGPU, which the on-device AI needs. Try Chrome or Edge on a computer, or choose the free online option in AI settings.'));
  engineModel = model;
  enginePromise = (async () => {
    onStatus?.(t('ai.loadingLib', 'Loading AI library…'));
    const webllm = await import(/* @vite-ignore */ WEBLLM_URL);
    const e = await webllm.CreateMLCEngine(model, {
      initProgressCallback: p => onStatus?.(p.text || `Loading model… ${Math.round((p.progress || 0) * 100)}%`),
    });
    engine = e;
    return e;
  })();
  try { return await enginePromise; } catch (err) { enginePromise = null; engineModel = null; throw err; }
}

// messages: [{role, content}] (system prompt added automatically)
export async function chat(messages, { onToken, onStatus, signal } = {}) {
  const cfg = getAI();
  const msgs = [{ role: 'system', content: systemPrompt() }, ...messages];

  if (cfg.provider === 'browser') {
    const e = await getEngine(cfg.browserModel, onStatus);
    onStatus?.(t('ai.thinking', 'Thinking…'));
    const stream = await e.chat.completions.create({ messages: msgs, stream: true, temperature: 0.6, max_tokens: 700 });
    let out = '';
    for await (const chunk of stream) {
      if (signal?.aborted) { e.interruptGenerate?.(); break; }
      const d = chunk.choices?.[0]?.delta?.content || '';
      if (d) { out += d; onToken?.(out); }
    }
    return out;
  }

  let url, headers = { 'Content-Type': 'application/json' }, body;
  if (cfg.provider === 'pollinations') {
    url = 'https://text.pollinations.ai/openai';
    body = { model: 'openai', messages: msgs, private: true, referrer: 'lamp-bible' };
  } else {
    if (!cfg.baseUrl) throw new Error('Add an API address in AI settings.');
    url = cfg.baseUrl.replace(/\/+$/, '') + '/chat/completions';
    if (cfg.key) headers.Authorization = 'Bearer ' + cfg.key;
    body = { model: cfg.model, messages: msgs, temperature: 0.6, max_tokens: 900 };
  }
  onStatus?.(t('ai.thinking', 'Thinking…'));
  let r;
  try {
    r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new Error(t('ai.unreachable', 'Could not reach the AI service. Check your internet connection, or switch AI provider in Settings → AI.'));
  }
  const raw = await r.text();
  if (!r.ok) {
    let msg = raw.slice(0, 300);
    try { const j = JSON.parse(raw); msg = j.error?.message || j.error || j.message || msg; } catch {}
    if (r.status === 429) msg = t('ai.busy', 'The free AI service is busy. Wait a minute, or switch provider in Settings → AI.');
    if (r.status === 401 || r.status === 403) msg = 'The AI service refused the request (' + r.status + '). Check your API key in Settings → AI. ' + msg;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  let text = raw;
  try { const j = JSON.parse(raw); text = j.choices?.[0]?.message?.content ?? raw; } catch {}
  text = String(text).replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  onToken?.(text);
  return text;
}

// Study "methods" offered for any passage.
export const METHODS = [
  { id: 'simple', get label() { return t('ai.m.simple', 'Explain simply'); }, prompt: p => `Explain this passage in simple, clear language. What is happening and what is the main message?\n\n${p}` },
  { id: 'context', get label() { return t('ai.m.context', 'Historical context'); }, prompt: p => `Give the historical, cultural and literary background that helps understand this passage: who wrote it, to whom, when, and what customs or events matter.\n\n${p}` },
  { id: 'words', get label() { return t('ai.m.words', 'Key words'); }, prompt: p => `Pick 3–5 key words or phrases in this passage. For each, explain its meaning (mention the original Hebrew or Greek word when you are confident of it) and why it matters.\n\n${p}` },
  { id: 'cross', get label() { return t('ai.m.cross', 'Cross-references'); }, prompt: p => `List 5–7 other Bible passages that connect to this one (same theme, prophecy & fulfilment, quotation or contrast). For each give the reference and one sentence on the connection.\n\n${p}` },
  { id: 'apply', get label() { return t('ai.m.apply', 'Apply to life'); }, prompt: p => `How might someone apply this passage to everyday life today? Give 3 practical, gentle reflections and one short prayer idea.\n\n${p}` },
  { id: 'kids', get label() { return t('ai.m.kids', 'For kids'); }, prompt: p => `Explain this passage to a 9-year-old, warmly, in under 150 words, with a simple example from daily life.\n\n${p}` },
  { id: 'questions', get label() { return t('ai.m.questions', 'Study questions'); }, prompt: p => `Write 5 thoughtful discussion questions for a small group studying this passage (observation → interpretation → application).\n\n${p}` },
  { id: 'quiz', get label() { return t('ai.m.quiz', 'Quiz me'); }, prompt: p => `Write 5 multiple-choice questions (A–D) to test understanding of this passage. Put all the correct answers, with references, in a list at the very end under "Answers".\n\n${p}` },
];
