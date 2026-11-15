// Bridge to sister apps (Weeklan planner, Softland companion).
//
// When the apps are hosted on the same origin (for example all on
// https://<user>.github.io/...), they share localStorage. Lamp:
//   • publishes a small summary at  lari:shared:lamp   (streak, XP, verse of the day…)
//   • drops requests into inboxes at lari:inbox:<app>  (e.g. "add this reading to my week")
//   • announces changes on BroadcastChannel('lari-suite') so open tabs update live.
// A sister app only needs to read those keys — see docs/CONNECT.md.
import { SUITE_PREFIX } from './config.js';
import { getProgress, streak, todayXP, getSettings, today } from './store.js';
import { dueCount } from './srs.js';

const chan = (() => { try { return new BroadcastChannel('lari-suite'); } catch { return null; } })();
const read = k => { try { return JSON.parse(localStorage.getItem(SUITE_PREFIX + k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(SUITE_PREFIX + k, JSON.stringify(v)); } catch {} };

export function publishSummary() {
  const p = getProgress();
  const summary = {
    app: 'lamp', version: 1, updated: new Date().toISOString(),
    streak: streak(), xp: p.xp || 0, xpToday: todayXP(), dailyGoal: getSettings().dailyGoal,
    lastRead: p.last, reviewsDue: dueCount(), readToday: !!p.days[today()]?.read,
  };
  write('shared:lamp', summary);
  chan?.postMessage({ type: 'summary', from: 'lamp', summary });
}

// Send an item to another app's inbox. Example:
//   sendTo('weeklan', { type: 'task', title: 'Read John 3', date: '2026-11-16', link: 'https://…/lamp/#/read/42/3' })
export function sendTo(app, item) {
  const box = read('inbox:' + app) || [];
  box.push({ id: Date.now().toString(36), from: 'lamp', created: new Date().toISOString(), ...item });
  write('inbox:' + app, box.slice(-100));
  chan?.postMessage({ type: 'inbox', to: app, from: 'lamp' });
  return true;
}

export const sisterSummary = app => read('shared:' + app);
export const pendingFor = app => (read('inbox:' + app) || []).length;
