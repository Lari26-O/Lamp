// Spaced repetition (a simplified SM-2, like Anki): verses you know well come
// back less often; verses you struggle with come back sooner.
import { load, save, markActivity } from './store.js';
import { t } from './i18n.js';

const DAY = 864e5;
export function getCards() { return load('cards', []); }
function setCards(c) { save('cards', c); window.dispatchEvent(new Event('lamp:nav')); }
export function getCard(id) { return getCards().find(c => c.id === id); }
// Best score (0–1) for each memory game on a card.
export function setGame(id, game, score) {
  const cards = getCards(); const c = cards.find(x => x.id === id); if (!c) return;
  c.games = c.games || {};
  c.games[game] = Math.max(c.games[game] || 0, score);
  setCards(cards);
}

export function addCard(ref, text, translation = 'kjv') {
  const cards = getCards();
  if (cards.some(c => c.ref === ref)) return false;
  cards.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ref, text, translation, added: Date.now(), due: Date.now(), interval: 0, ease: 2.5, reps: 0, lapses: 0 });
  setCards(cards);
  return true;
}
export function removeCard(id) { setCards(getCards().filter(c => c.id !== id)); }
export function hasCard(ref) { return getCards().some(c => c.ref === ref); }
export function dueCards() { const now = Date.now(); return getCards().filter(c => c.due <= now).sort((a, b) => a.due - b.due); }
export function dueCount() { return dueCards().length; }

// grade: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy
export function preview(card, grade) {
  let { interval, ease, reps } = card;
  if (grade === 0) return { interval: 0, ease: Math.max(1.3, ease - 0.2), reps: 0, dueIn: 10 * 60e3 };
  if (grade === 1) { interval = Math.max(1, Math.round((interval || 1) * 1.2)); ease = Math.max(1.3, ease - 0.15); }
  if (grade === 2) interval = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(interval * ease);
  if (grade === 3) { interval = reps === 0 ? 3 : Math.round((reps === 1 ? 4 : interval * ease) * 1.3); ease += 0.15; }
  return { interval, ease, reps: reps + 1, dueIn: interval * DAY };
}
export function grade(id, g) {
  const cards = getCards();
  const c = cards.find(x => x.id === id);
  if (!c) return;
  const p = preview(c, g);
  Object.assign(c, { interval: p.interval, ease: p.ease, reps: p.reps, due: Date.now() + p.dueIn, last: Date.now() });
  if (g === 0) c.lapses = (c.lapses || 0) + 1;
  setCards(cards);
  markActivity('review', 3);
}
export function humanInterval(ms) {
  if (ms < 3600e3) return Math.round(ms / 60e3) + ' min';
  const d = Math.round(ms / DAY);
  if (d < 31) return d + ' ' + (d === 1 ? t('time.day', 'day') : t('time.days', 'days'));
  if (d < 365) return Math.round(d / 30) + ' ' + t('time.mo', 'mo');
  return (d / 365).toFixed(1) + ' ' + t('time.yr', 'yr');
}
export function level(c) {
  if ((c.games?.test || 0) >= 0.9 && c.interval >= 7) return { label: t('mem.lv3', 'Memorized'), n: 3 };
  if (c.reps === 0 && !c.games) return { label: t('mem.lv0', 'New'), n: 0 };
  if (c.interval < 7 && (c.games?.test || 0) < 0.9) return { label: t('mem.lv1', 'Learning'), n: 1 };
  if (c.interval < 21) return { label: t('mem.lv2', 'Familiar'), n: 2 };
  return { label: t('mem.lv3', 'Memorized'), n: 3 };
}
