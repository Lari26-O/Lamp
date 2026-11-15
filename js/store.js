// Everything the user creates is saved in this browser only (localStorage).
// Export/Import in Settings lets people back up or move their data.
const PREFIX = 'lamp:';

export function load(name, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    return raw == null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}
export function save(name, value) {
  try { localStorage.setItem(PREFIX + name, JSON.stringify(value)); return true; }
  catch { return false; }
}
const emit = () => window.dispatchEvent(new Event('lamp:data'));

const KEYS = ['settings', 'notes', 'marks', 'journal', 'studies', 'cards', 'progress', 'learn', 'ai', 'videos', 'quizstats', 'chat', 'profile', 'plans', 'prayers'];
export function exportAll() {
  const out = { app: 'lamp', version: 2, exported: new Date().toISOString() };
  for (const k of KEYS) out[k] = load(k, null);
  if (out.ai) delete out.ai.key; // never export API keys
  if (out.settings) delete out.settings.yvKey;
  return out;
}
export function importAll(data) {
  if (!data || data.app !== 'lamp') throw new Error('This file is not a Lamp backup.');
  for (const k of KEYS) if (data[k] != null && k !== 'ai') save(k, data[k]);
}
export function clearAll() { for (const k of KEYS) { try { localStorage.removeItem(PREFIX + k); } catch {} } }

// ---- Settings ----
export const DEFAULT_SETTINGS = {
  theme: 'system', fontSize: 19, lineHeight: 1.75, font: 'serif', verseNumbers: true, headings: true,
  reduceMotion: false, version: '', ttsRate: 1, ttsVoice: '', paragraphMode: false, studyPanel: true, dailyGoal: 20,
};
export function getSettings() { return { ...DEFAULT_SETTINGS, ...load('settings', {}) }; }
export function setSettings(patch) { const s = { ...getSettings(), ...patch }; save('settings', s); return s; }

// ---- Verse notes, tags and verse highlights: keyed "book.chapter.verse" (any translation) ----
export function getNotes() { return load('notes', {}); }
export function getNote(key) { return getNotes()[key] || null; }
export function setNote(key, patch) {
  const all = getNotes();
  const cur = all[key] || { tags: [], note: '', color: '', created: Date.now() };
  const next = { ...cur, ...patch, updated: Date.now() };
  if (!next.note && !next.color && !(next.tags && next.tags.length)) delete all[key];
  else all[key] = next;
  save('notes', all); emit();
  return all[key] || null;
}

// ---- Phrase marks: highlight/underline/note on words inside a verse (per translation) ----
// { id, ver, b, c, v, s, e, text, color, style: 'hl'|'ul', note, tags, group, created, updated }
export function getMarks() { return load('marks', []); }
export function chapterMarks(ver, b, c) { return getMarks().filter(m => m.ver === ver && m.b === b && m.c === c); }
export function addMarks(list) { const all = getMarks(); all.push(...list); save('marks', all); emit(); }
export function updateMark(id, patch) {
  const all = getMarks(); const m = all.find(x => x.id === id);
  if (!m) return;
  Object.assign(m, patch, { updated: Date.now() });
  if (m.group) for (const o of all) if (o.group === m.group && o.id !== id && ('color' in patch || 'style' in patch)) Object.assign(o, { color: m.color, style: m.style });
  save('marks', all); emit();
}
export function removeMark(id) {
  const all = getMarks(); const m = all.find(x => x.id === id);
  save('marks', all.filter(x => x.id !== id && !(m?.group && x.group === m.group))); emit();
}

// ---- Chapter journal (free-form study notes per chapter) ----
export function getJournal(b, c) { return load('journal', {})[`${b}.${c}`] || ''; }
export function setJournal(b, c, text) {
  const all = load('journal', {});
  if (text.trim()) all[`${b}.${c}`] = text; else delete all[`${b}.${c}`];
  save('journal', all); emit();
}
export function allJournal() { return load('journal', {}); }

// ---- Guided studies ----
export function getStudies() { return load('studies', []); }
export function saveStudy(st) {
  const all = getStudies().filter(x => x.id !== st.id);
  all.unshift({ ...st, updated: Date.now() });
  save('studies', all); emit();
}
export function removeStudy(id) { save('studies', getStudies().filter(x => x.id !== id)); emit(); }

export function allTags() {
  const counts = {};
  for (const n of Object.values(getNotes())) for (const t of n.tags || []) counts[t] = (counts[t] || 0) + 1;
  for (const m of getMarks()) for (const t of m.tags || []) counts[t] = (counts[t] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

// ---- Reading progress, XP & streak ----
export function today(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
export function getProgress() { return { last: null, read: {}, days: {}, xp: 0, ...load('progress', {}) }; }
export function markActivity(kind, xp = 0) {
  const p = getProgress();
  const t = today();
  const first = !p.days[t];
  p.days[t] = p.days[t] || {};
  p.days[t][kind] = (p.days[t][kind] || 0) + 1;
  if (xp) { p.days[t].xp = (p.days[t].xp || 0) + xp; p.xp = (p.xp || 0) + xp; }
  if (first) { const n = streakOf(p); if (n > (p.best || 0)) p.best = n; }
  save('progress', p); emit();
  if (first) { try { window.dispatchEvent(new CustomEvent('lamp:streak', { detail: { n: streakOf(p), best: p.best || 0 } })); } catch {} }
  return p;
}
export function markRead(b, c) {
  const p = getProgress();
  const first = !p.read[`${b}.${c}`];
  p.last = { b, c };
  p.read[`${b}.${c}`] = Date.now();
  save('progress', p);
  markActivity('read', first ? 5 : 0);
}
export const streak = () => streakOf(getProgress());
export const bestStreak = () => Math.max(getProgress().best || 0, streak());
function streakOf(p) {
  let n = 0; const d = new Date();
  if (!p.days[today(d)]) d.setDate(d.getDate() - 1);
  while (p.days[today(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
export const todayXP = () => getProgress().days[today()]?.xp || 0;
export const levelInfo = xp => { const lvl = Math.floor(Math.sqrt(xp / 50)) + 1; const cur = 50 * (lvl - 1) ** 2, next = 50 * lvl ** 2; return { lvl, cur, next, pct: (xp - cur) / (next - cur) }; };
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
