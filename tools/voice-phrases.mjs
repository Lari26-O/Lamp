// Writes every sentence Lamp's kids area can say out loud, one file per language:
// tools/phrases/<lang>.txt (one per line). Used by tools/record_voices.py.
// Run from the project folder: node tools/voice-phrases.mjs
import fs from 'node:fs';
globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.fetch = async () => ({ ok: false, json: async () => ({}) });
globalThis.addEventListener = () => {};
globalThis.dispatchEvent = () => {};
globalThis.navigator ??= { language: 'en' };
globalThis.document ??= { documentElement: { lang: 'en' }, addEventListener() {}, querySelector: () => null };

const root = new URL('..', import.meta.url);
const { ALL_STORIES, PIC_WORDS } = await import(new URL('js/kids-data.js', root));
const { KIDS_CHALLENGES } = await import(new URL('js/challenges.js', root));
const kidsSrc = fs.readFileSync(new URL('js/views/kids.js', root), 'utf8');
// English text the kids screens say, straight from t('key', 'English') in the code.
const EN = {};
for (const m of kidsSrc.matchAll(/t\('((?:kids|kidsnav|game)\.[\w.]+)',\s*'((?:[^'\\]|\\.)*)'/g)) EN[m[1]] ??= m[2].replace(/\\'/g, "'");
const extra = ['Hear it', 'Jesus loves you!'];
fs.mkdirSync(new URL('tools/phrases/', root), { recursive: true });
for (const lang of ['en', 'fr', 'pt', 'es']) {
  const L = o => (o && (o[lang] || o.en)) || '';
  const dict = lang === 'en' ? {} : (await import(new URL(`js/i18n/${lang}-kids.js`, root))).default;
  const set = new Set();
  const add = x => { const v = String(x || '').replace(/\{[^}]*\}/g, '').trim(); if (v) v.split('|').forEach(p => p.trim() && set.add(p.trim())); };
  for (const s of ALL_STORIES) [s.title, ...s.pages, s.summary, s.truth, s.verse?.text, s.talk, ...s.quiz.flatMap(q => [q.q, q.say, ...(q.optsText || [])])].forEach(x => add(L(x)));
  Object.values(PIC_WORDS).forEach(w => add(L(w)));
  KIDS_CHALLENGES.forEach(c => add(L(c.text)));
  for (const [k, en] of Object.entries(EN)) add(dict[k] || en);
  extra.forEach(add);
  fs.writeFileSync(new URL(`tools/phrases/${lang}.txt`, root), [...set].join('\n') + '\n');
  console.log(lang, set.size, 'lines');
}
