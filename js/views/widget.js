// A compact "widget" view: today's challenge, verse of the day, current plan
// and streak. Opened from the home-screen shortcut or as a small desktop window.
import { esc, icon, dayOfYear } from '../util.js';
import { streak, todayXP, getSettings, getProgress } from '../store.js';
import { passageText, localRef, currentVersion, bookName } from '../bible.js';
import { DAILY_VERSES } from '../data/people.js';
import { todayChallenge, challengeText, isDone } from '../challenges.js';
import { PLANS, planTitle } from '../plans-data.js';
import { planState, planInfo } from './plans.js';
import { t } from '../i18n.js';

export async function widgetData() {
  const ref = DAILY_VERSES[dayOfYear() % DAILY_VERSES.length];
  let verse = ''; try { verse = await passageText(ref, currentVersion()); } catch {}
  const ch = todayChallenge();
  const ps = planState(); const plan = PLANS.find(p => ps.active[p.id] && !planInfo(p).finished);
  const pi = plan && planInfo(plan);
  const last = getProgress().last;
  return {
    challenge: challengeText(ch), challengeDone: isDone(ch), verse, verseRef: localRef(ref),
    plan: plan ? `${planTitle(plan)} — ${t('plans.dayN', 'Day {n}', { n: pi.next + 1 })}: ${plan.days[pi.next].map(localRef).join(', ')}` : '',
    reading: last ? `${bookName(last.b)} ${last.c}` : '', streak: streak(), xp: todayXP(), goal: getSettings().dailyGoal,
    labels: { challenge: t('kids.todayChallenge', 'Today’s challenge'), verse: t('home.votd', 'Verse of the day'), plan: t('plans.todayRead', 'Today’s reading'), streak: t('learn.streak', 'day streak'), open: t('wd.open', 'Open Lamp') },
  };
}

export async function render(el) {
  const d = await widgetData();
  el.innerHTML = `<div class="widget-page">
    <div class="wd-head"><img src="icons/icon.svg" alt="" width="34" height="34"><b>Lamp</b><span class="wd-streak">${icon('flame')} ${d.streak}</span></div>
    <a class="wd-card ${d.challengeDone ? 'done' : ''}" href="#/challenge"><span class="eyebrow">${icon(d.challengeDone ? 'check' : 'star')} ${esc(d.labels.challenge)}</span><p>${esc(d.challenge)}</p></a>
    ${d.plan ? `<a class="wd-card" href="#/plans"><span class="eyebrow">${icon('calendar')} ${esc(d.labels.plan)}</span><p>${esc(d.plan)}</p></a>` : ''}
    <a class="wd-card verse" href="#/home"><span class="eyebrow">${icon('book')} ${esc(d.labels.verse)}</span><p class="serif">“${esc(d.verse)}”</p><small>${esc(d.verseRef)}</small></a>
    <div class="wd-goal"><div class="progress"><i style="width:${Math.min(100, d.xp / d.goal * 100)}%"></i></div><small>${d.xp}/${d.goal} XP</small></div>
    <a class="btn primary wide" href="#/home">${esc(d.labels.open)}</a></div>`;
}
