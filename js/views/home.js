import { $, icon, esc, dayOfYear, toast } from '../util.js';
import { parseRef, passageText, refHash, localRef, currentVersion, getVersion, bookName } from '../bible.js';
import { getProgress, streak, getNotes, getMarks, todayXP, getSettings, levelInfo } from '../store.js';
import { dueCount, getCards, addCard, level } from '../srs.js';
import { DAILY_VERSES } from '../data/people.js';
import { load } from '../store.js';
import { getProfile, currentAge, L } from '../profile.js';
import { PLANS, planTitle } from '../plans-data.js';
import { planState, planInfo } from './plans.js';
import { todayChallenge, challengeText, isDone } from '../challenges.js';
import { canInstall, install } from '../pwa.js';
import { t } from '../i18n.js';
import { streakCard } from '../streaks.js';


export async function render(el) {
  const p = getProgress();
  const ref = DAILY_VERSES[dayOfYear() % DAILY_VERSES.length];
  const r = parseRef(ref);
  const cards = getCards();
  const due = dueCount();
  const last = p.last;
  const hour = new Date().getHours();
  const greet = hour < 12 ? t('home.morning', 'Good morning') : hour < 18 ? t('home.afternoon', 'Good afternoon') : t('home.evening', 'Good evening');
  const goal = getSettings().dailyGoal, tx = todayXP(), pct = Math.min(1, tx / goal);
  const prof = getProfile(); const age = currentAge();
  const learnBook = prof.learnBook ?? age.book;
  const bp = (load('learn', {}).books || {})[learnBook];
  const ps = planState();
  const activePlans = PLANS.filter(pl => ps.active[pl.id] && !planInfo(pl).finished);
  const suggest = PLANS.find(pl => pl.id === age.plans[0]);
  const lv = levelInfo(p.xp || 0);
  const vid = currentVersion();

  el.innerHTML = `
    <h1 class="sr-only">Lamp</h1>
    <div class="home-top">
      <section class="hero" aria-labelledby="votd-h">
        <p class="eyebrow">${greet}${prof.name ? ', ' + esc(prof.name) : ''} · <span id="votd-h">${t('home.votd', 'Verse of the day')}</span></p>
        <blockquote class="votd" id="votd"><span class="spinner"></span></blockquote>
        <div class="row">
          <a class="btn primary" href="${refHash(r)}">${icon('book')} ${t('home.readCtx', 'Read in context')}</a>
          <button class="btn" id="votdMem">${icon('brain')} ${t('home.memorize', 'Memorize')}</button>
        </div>
      </section>
      <section class="card today">
        <div class="ring big" style="--p:${pct}"><span>${tx}<small>/${goal} XP</small></span></div>
        <div class="today-stats">
          <div>${icon('flame')}<b>${streak()}</b><span>${t('learn.streak', 'day streak')}</span></div>
          <div>${icon('crown')}<b>${lv.lvl}</b><span>${t('learn.level', 'level')}</span></div>
          <div>${icon('book')}<b>${Object.keys(p.read).length}</b><span>${t('home.chapters', 'chapters')}</span></div>
        </div>
      </section>
    </div>

    ${streakCard()}
    <h2 class="section-title">${t('home.today', 'Today')}</h2>
    ${(() => { const ch = todayChallenge(); const dn = isDone(ch); return `<a class="card challenge-strip ${dn ? 'done' : ''}" href="#/challenge"><span class="ch-ico sm">${icon(dn ? 'check' : ch.icon)}</span><div class="grow"><p class="eyebrow">${t('ch.title', 'Daily challenge')}</p><b>${esc(challengeText(ch))}</b></div>${icon('chevR')}</a>`; })()}
    <div class="grid">
      ${activePlans.map(pl => { const info = planInfo(pl); return `<a class="card tile accent" href="#/plans/${pl.id}"><span class="ico-wrap">${icon('calendar')}</span><div><b>${esc(planTitle(pl))}</b><p>${t('plans.dayOf', 'Day {n} of {t}', { n: info.next + 1, t: pl.days.length })} · ${pl.days[info.next].map(localRef).join(', ')}</p></div></a>`; }).join('')}
      ${!activePlans.length && suggest ? `<a class="card tile accent" href="#/plans/${suggest.id}"><span class="ico-wrap">${icon('calendar')}</span><div><b>${t('home.startPlan', 'Start a reading plan')}</b><p>${esc(planTitle(suggest))} · ${t('plans.days', '{n} days', { n: suggest.days.length })}</p></div></a>` : ''}
      <a class="card tile" href="#/learn"><span class="ico-wrap">${icon('path')}</span><div><b>${t('home.lesson', 'Continue learning')}</b><p>${t('lp.learnBook', 'Learn {book}', { book: esc(bookName(learnBook)) })}${bp?.total ? ` · ${Math.round(bp.done / bp.total * 100)}%` : ''}</p></div></a>
      ${last ? `<a class="card tile" href="#/read/${last.b}/${last.c}"><span class="ico-wrap">${icon('book')}</span><div><b>${t('home.keepReading', 'Keep reading')}</b><p>${esc(bookName(last.b))} ${last.c} · ${esc(getVersion(vid).abbr)}</p></div></a>`
             : `<a class="card tile" href="#/read/42/1"><span class="ico-wrap">${icon('book')}</span><div><b>${t('home.startReading', 'Start reading')}</b><p>${t('home.startJohn', 'New here? The Gospel of John is a great place to begin.')}</p></div></a>`}
      <a class="card tile" href="${due ? '#/memory/review' : '#/memory'}"><span class="ico-wrap">${icon('brain')}</span><div><b>${t('home.review', 'Memory verses')}</b><p>${due ? t('home.dueN', '{n} ready for review', { n: due }) : t('home.caught', 'All caught up — learn a new verse.')}</p></div></a>
    </div>

    <h2 class="section-title">${t('home.grow', 'Study & explore')}</h2>
    <div class="grid">
      <a class="card tile" href="#/study"><span class="ico-wrap">${icon('compass')}</span><div><b>${t('nav.study', 'How to study')}</b><p>${t('home.studySub', 'Guided methods, including what to do when a passage is hard.')}</p></div></a>
      <a class="card tile" href="#/ask"><span class="ico-wrap">${icon('chat')}</span><div><b>${t('nav.ask', 'Ask AI')}</b><p>${t('home.askSub', 'A free AI helper that explains passages, context and words.')}</p></div></a>
      <a class="card tile" href="#/notes"><span class="ico-wrap">${icon('pen')}</span><div><b>${t('nav.notes', 'My study Bible')}</b><p>${t('home.notesSub', '{n} highlights & notes', { n: Object.keys(getNotes()).length + getMarks().length })}</p></div></a>
      <a class="card tile" href="#/map"><span class="ico-wrap">${icon('map')}</span><div><b>${t('nav.map', 'Maps')}</b><p>${t('home.mapSub', 'Places and journeys — Abraham, the Exodus, Jesus and Paul.')}</p></div></a>
      <a class="card tile" href="#/timeline"><span class="ico-wrap">${icon('clock')}</span><div><b>${t('nav.timeline', 'Timeline')}</b><p>${t('home.tlSub', 'The whole story, from Creation to Revelation.')}</p></div></a>
      <a class="card tile" href="#/quiz"><span class="ico-wrap">${icon('quiz')}</span><div><b>${t('nav.quiz', 'Quiz')}</b><p>${t('home.quizSub2', 'Daily quiz, trivia and a speed round.')}</p></div></a>
      <a class="card tile" href="#/prayer"><span class="ico-wrap">${icon('hand')}</span><div><b>${t('nav.prayer', 'Prayer')}</b><p>${t('home.prayerSub', 'Your prayer list and answered prayers.')}</p></div></a>
      <a class="card tile" href="#/ask"><span class="ico-wrap">${icon('quiz')}</span><div><b>${t('home.ageQ', 'Questions people your age ask')}</b><p>${esc(L(age.name))} · ${esc(L(age.range))}</p></div></a>
    </div>`;

  if (canInstall()) {
    const box = document.createElement('div');
    box.className = 'card install-card';
    box.innerHTML = `<img src="icons/icon.svg" alt="" width="48" height="48"><div class="grow"><b>${t('pwa.cardTitle', 'Get the Lamp app')}</b><p class="small muted">${t('pwa.cardSub', 'Add it to your home screen: opens like an app, works offline and can remind you every day.')}</p></div><button class="btn primary small" id="instBtn">${icon('download')} ${t('pwa.install', 'Install the app')}</button>`;
    el.appendChild(box);
    box.querySelector('#instBtn').addEventListener('click', () => install());
  }
  let text = '';
  try {
    text = await passageText(r, vid);
    const q = el.querySelector('#votd');
    if (q) q.innerHTML = `<span>“${esc(text)}”</span><footer>${esc(localRef(ref))} · ${esc(getVersion(vid).abbr)}</footer>`;
  } catch { const q = el.querySelector('#votd'); if (q) q.textContent = localRef(ref); }
  el.querySelector('#votdMem').addEventListener('click', () => {
    toast(addCard(ref, text, vid) ? t('mem.added', '{ref} added to memory verses', { ref: localRef(ref) }) : t('mem.already', 'Already in your memory verses'));
  });
}
