import { $, esc, md, icon } from '../util.js';
import { chat, getAI } from '../ai.js';
import { aiNotice } from '../components.js';
import { load, save } from '../store.js';
import { t } from '../i18n.js';
import { openDialog } from '../util.js';
import { getProfile, currentAge, AGES, AGE_QUESTIONS, L } from '../profile.js';
import { passageText, localRef, parseRef, refHash, currentVersion } from '../bible.js';

const SUGGEST = () => t('ask.suggest', 'What is the main message of the Bible in a few sentences?|Explain the parable of the prodigal son (Luke 15).|Who wrote the book of Romans, and why?|What is a covenant? Give examples from the Bible.|How do the Old and New Testaments connect?|Help me make a 30-day plan to read the Gospels.').split('|');

export function render(el) {
  let history = load('chat', []);
  let busy = false;
  let ageView = getProfile().age || currentAge().id;
  el.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">${t('navg.learn', 'Learn')}</p><h1>${t('nav.ask', 'Ask AI')}</h1><p>${t('ask.intro', 'Ask anything about the Bible — meanings, background, people, places or how to start reading. Free, with no account.')}</p></div>
      <button class="btn ghost" id="clear">${icon('plus')} ${t('ask.new', 'New conversation')}</button></div>
    ${aiNotice()}
    ${!getAI().chosen ? `<div class="notice">${icon('info')}<span>${t('ask.choose', 'The default is a free online AI (no signup). For full privacy you can download a model that runs entirely on your device.')} <a href="#/settings/ai">${t('ai.settings', 'AI settings')}</a></span></div>` : ''}
    <div class="chat" id="chat" aria-live="polite"></div>
    <form class="chat-form" id="form">
      <label class="sr-only" for="q">${t('ask.q', 'Your question')}</label>
      <textarea class="input" id="q" rows="1" placeholder="${t('ask.ph', 'Ask a question about the Bible…')}"></textarea>
      <button class="btn primary" id="send" aria-label="${t('ask.send', 'Send')}">${icon('chevR')}</button>
    </form>`;
  const box = $('#chat', el);
  const draw = () => {
    box.innerHTML = history.length ? history.map(m => `<div class="msg ${m.role}">${m.role === 'user' ? esc(m.content) : `<div class="ai-out">${md(m.content)}</div>`}</div>`).join('')
      : `<section class="card"><div class="row between"><h2 class="card-title" style="margin:0">${icon('people')} ${t('ask.ageTitle', 'Questions people your age ask')}</h2>
          <select class="pill small" id="ageSel" aria-label="${t('acc.ageGroup', 'Age group')}">${AGES.map(a => `<option value="${a.id}" ${a.id === ageView ? 'selected' : ''}>${esc(L(a.name))} · ${esc(L(a.range))}</option>`).join('')}</select></div>
          <div class="q-list">${(AGE_QUESTIONS[ageView] || []).map((x, i) => `<button class="q-item" data-aq="${i}">${icon('chevR')}<span>${esc(L(x.q))}</span></button>`).join('')}</div></section>
        <div class="card"><p class="muted">${t('ask.try', 'Try one of these:')}</p><div class="chips">${SUGGEST().map(s => `<button class="chip" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`;
    box.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { $('#q', el).value = b.dataset.s; send(); }));
    $('#ageSel', el)?.addEventListener('change', e => { ageView = e.target.value; draw(); });
    box.querySelectorAll('[data-aq]').forEach(b => b.addEventListener('click', async () => {
      const item = AGE_QUESTIONS[ageView][+b.dataset.aq];
      const d = openDialog(L(item.q), `<p class="muted small">${t('ask.whatSays', 'What the Bible says:')}</p><div id="aqv"><span class="spinner"></span></div><div class="row" style="margin-top:14px"><button class="btn primary" id="aqAI">${icon('spark')} ${t('ask.askThis', 'Ask the AI about this')}</button></div>`, { wide: true });
      const vs = await Promise.all(item.refs.map(async r => ({ r, text: await passageText(r, currentVersion()).catch(() => '') })));
      d.querySelector('#aqv').innerHTML = vs.map(v => `<blockquote class="quote"><span>${esc(v.text)}</span> <cite><a href="${refHash(parseRef(v.r))}">${esc(localRef(v.r))}</a></cite></blockquote>`).join('');
      d.querySelector('#aqAI').addEventListener('click', () => { d.close(); $('#q', el).value = L(item.q); send(); });
    }));
  };
  draw();
  const send = async () => {
    const ta = $('#q', el);
    const text = ta.value.trim();
    if (!text || busy) return;
    busy = true; $('#send', el).disabled = true;
    history.push({ role: 'user', content: text });
    ta.value = '';
    draw();
    const bubble = document.createElement('div');
    bubble.className = 'msg assistant';
    bubble.innerHTML = `<div class="ai-status"><span class="spinner"></span><span class="st">${t('ai.thinking', 'Thinking…')}</span></div><div class="ai-out"></div>`;
    box.appendChild(bubble);
    bubble.scrollIntoView({ block: 'end' });
    try {
      const answer = await chat(history.slice(-12), {
        onStatus: s => { const st = bubble.querySelector('.st'); if (st) st.textContent = s; },
        onToken: t => { bubble.querySelector('.ai-status').hidden = true; bubble.querySelector('.ai-out').innerHTML = md(t); },
      });
      history.push({ role: 'assistant', content: answer });
      save('chat', history.slice(-40));
      draw();
      box.lastElementChild?.scrollIntoView({ block: 'nearest' });
    } catch (e) {
      history.pop();
      bubble.innerHTML = `<p class="err">${esc(e.message)}</p><a class="btn small" href="#/settings/ai">${icon('gear')} ${t('ai.settings', 'AI settings')}</a>`;
    }
    busy = false; $('#send', el).disabled = false;
  };
  $('#form', el).addEventListener('submit', e => { e.preventDefault(); send(); });
  $('#q', el).addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
  $('#clear', el).addEventListener('click', () => { history = []; save('chat', []); draw(); });
}
