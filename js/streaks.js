// Daily streaks: week strip, milestones and the "you kept your streak" celebration.
import { esc, icon } from './util.js';
import { getProgress, today, streak, bestStreak, load, save, getSettings } from './store.js';
import { t, LANG } from './i18n.js';

export const MILESTONES = [3, 7, 14, 30, 50, 100, 200, 365];
export const nextMilestone = n => MILESTONES.find(m => m > n) || n + 100;
export const earnedMilestones = () => load('streakBadges', []);

// The last 7 days, oldest first: { key, label, done, today }
export function weekDays() {
  const p = getProgress(); const out = []; const d = new Date();
  d.setDate(d.getDate() - 6);
  const fmt = new Intl.DateTimeFormat(LANG, { weekday: 'narrow' });
  for (let i = 0; i < 7; i++) {
    const key = today(d);
    out.push({ key, label: fmt.format(d), done: !!p.days[key], today: i === 6 });
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function weekStrip({ kids = false } = {}) {
  return `<ol class="week-strip ${kids ? 'kids' : ''}" aria-label="${esc(t('st.week', 'This week'))}">${weekDays().map(d =>
    `<li class="${d.done ? 'on' : ''} ${d.today ? 'now' : ''}" aria-label="${esc(d.key)}${d.done ? ' ✓' : ''}"><span class="dot">${d.done ? icon(kids ? 'star' : 'flame') : ''}</span><small>${esc(d.label)}</small></li>`).join('')}</ol>`;
}

// Card for the adult home page.
export function streakCard() {
  const n = streak(), best = bestStreak(), goal = nextMilestone(n);
  const doneToday = !!getProgress().days[today()];
  return `<section class="card streak-card ${doneToday ? 'lit' : ''}" aria-labelledby="stH">
    <div class="streak-head">
      <span class="streak-flame">${icon('flame')}</span>
      <div class="grow"><h2 id="stH">${t('st.days', '{n}-day streak', { n })}</h2>
        <p class="muted">${doneToday ? t('st.keptToday', 'You showed up today. See you tomorrow!') : (n ? t('st.keepIt', 'Do one thing today to keep your streak.') : t('st.start', 'Read, learn or pray today to start a streak.'))}</p></div>
      <div class="streak-best"><b>${best}</b><small>${t('st.best', 'best')}</small></div>
    </div>
    ${weekStrip()}
    <div class="streak-goal"><div class="bar"><i style="width:${Math.min(100, n / goal * 100)}%"></i></div><small>${t('st.next', 'Next badge: {n} days', { n: goal })}</small></div>
    ${earnedMilestones().length ? `<div class="streak-badges">${earnedMilestones().map(m => `<span class="sbadge" title="${esc(t('st.days', '{n}-day streak', { n: m }))}">${icon('trophy')}${m}</span>`).join('')}</div>` : ''}
  </section>`;
}

// Kids home: "You came 3 days in a row!"
export function kidsStreak() {
  const n = streak();
  const text = n > 1 ? t('st.kidsN', 'You came {n} days in a row!', { n }) : t('st.kids1', 'Come back tomorrow to grow your streak!');
  return { text, html: `<section class="kid-card kid-streak"><span class="kid-ico sun">${icon('sun')}<b>${n}</b></span><div class="grow"><b>${esc(text)}</b>${weekStrip({ kids: true })}</div></section>` };
}

// Celebration popup on the first activity of each day.
let shownFor = '';
export function celebrate({ n }, { kids = false, speak } = {}) {
  if (!n || shownFor === today()) return;
  shownFor = today();
  const badges = earnedMilestones();
  const milestone = MILESTONES.includes(n) && !badges.includes(n);
  if (milestone) save('streakBadges', [...badges, n]);
  const title = kids ? (n > 1 ? t('st.kidsN', 'You came {n} days in a row!', { n }) : t('st.kidsFirst', 'Your streak started!'))
    : (milestone ? t('st.milestone', 'New badge: {n}-day streak!', { n }) : (n > 1 ? t('st.days', '{n}-day streak', { n }) : t('st.started', 'Streak started!')));
  const sub = kids ? t('kids.cheers', 'Great job!').split('|')[0]
    : (n > 1 ? t('st.keptToday', 'You showed up today. See you tomorrow!') : t('st.firstSub', 'Come back tomorrow to make it 2.'));
  const box = document.createElement('div');
  box.className = `streak-pop ${kids ? 'kids' : ''} ${milestone ? 'mile' : ''} ${getSettings().reduceMotion ? 'still' : ''}`;
  box.setAttribute('role', 'status');
  box.innerHTML = `<div class="sp-card"><span class="sp-flame">${icon(kids ? 'sun' : (milestone ? 'trophy' : 'flame'))}<b>${n}</b></span><div><b>${esc(title)}</b><p>${esc(sub)}</p></div><button class="icon-btn" aria-label="${esc(t('a11y.close', 'Close'))}">${icon('x')}</button></div>${weekStrip({ kids })}`;
  document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add('in'));
  const close = () => { box.classList.remove('in'); setTimeout(() => box.remove(), 400); };
  box.querySelector('button').addEventListener('click', close);
  box.addEventListener('click', e => { if (!e.target.closest('button')) close(); });
  setTimeout(close, kids ? 6000 : 4500);
  if (kids && speak) speak(title + ' ' + sub);
}
