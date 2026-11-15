// Reading plans (YouVersion-style): discover, start, read day by day, reflect.
import { $, $$, esc, icon, toast } from '../util.js';
import { load, save, markActivity, today } from '../store.js';
import { parseRef, refHash, localRef } from '../bible.js';
import { PLANS, PLAN_CATS, PROMPTS, planTitle, planDesc } from '../plans-data.js';
import { L, currentAge, getProfile } from '../profile.js';
import { runAI } from '../components.js';
import { sendTo } from '../connect.js';
import { t, fmtDate } from '../i18n.js';

const DAY = 864e5;
export const planState = () => ({ active: {}, finished: [], ...load('plans', {}) });
const setState = s => { save('plans', s); window.dispatchEvent(new Event('lamp:data')); };
const startOfDay = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
export function planInfo(p, st = planState().active[p.id]) {
  if (!st) return null;
  const doneDays = Object.keys(st.done || {}).length;
  const dayToday = Math.min(p.days.length - 1, Math.floor((startOfDay(Date.now()) - startOfDay(st.start)) / DAY));
  const next = p.days.findIndex((_, i) => !st.done?.[i]);
  return { doneDays, dayToday, next: next < 0 ? p.days.length - 1 : next, behind: Math.max(0, dayToday + 1 - doneDays), pct: doneDays / p.days.length, finished: doneDays >= p.days.length };
}
export function startPlan(id) { const s = planState(); s.active[id] = { start: Date.now(), done: {}, read: {}, notes: {} }; setState(s); }
export function markReading(id, day, i) {
  const s = planState(); const st = s.active[id]; if (!st) return;
  const p = PLANS.find(x => x.id === id);
  st.read = st.read || {}; st.read[`${day}:${i}`] = Date.now();
  if (p.days[day].every((_, k) => st.read[`${day}:${k}`]) && !st.done[day]) { st.done[day] = Date.now(); markActivity('plan', 10); toast(t('plans.dayDone', 'Day {n} complete', { n: day + 1 })); }
  if (Object.keys(st.done).length >= p.days.length && !s.finished.includes(id)) { s.finished.push(id); toast(t('plans.finished', 'Plan finished — well done!')); }
  setState(s);
}

export function render(el, { parts }) {
  if (parts[0]) return detail(el, parts[0], parts[1] != null ? +parts[1] : null);
  return discover(el);
}

function planCard(p) {
  const info = planInfo(p);
  return `<a class="plan-card" href="#/plans/${p.id}" style="--pc:${p.color}">
    <span class="plan-art">${icon(p.icon)}</span>
    <span class="plan-body"><b>${esc(planTitle(p))}</b><small>${t('plans.days', '{n} days', { n: p.days.length })}${info ? ' · ' + Math.round(info.pct * 100) + '%' : ''}</small></span>
    ${info ? `<span class="plan-prog"><i style="width:${info.pct * 100}%"></i></span>` : ''}</a>`;
}

function discover(el) {
  const st = planState();
  const active = PLANS.filter(p => st.active[p.id] && !planInfo(p).finished);
  const age = currentAge();
  let cat = 'foryou';
  const draw = () => {
    const list = cat === 'foryou' ? [...age.plans.map(id => PLANS.find(p => p.id === id)), ...PLANS.filter(p => !age.plans.includes(p.id) && getProfile().age && (p.cat === 'topic'))].filter(Boolean) : PLANS.filter(p => p.cat === cat);
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">${t('navg.learn', 'Learn')}</p><h1>${t('plans.title', 'Reading plans')}</h1><p>${t('plans.intro', 'Read a little every day. Plans guide you through books, topics or the whole Bible, with a question to reflect on.')}</p></div></div>
      ${active.length ? `<h2 class="section-title">${t('plans.mine', 'My plans')}</h2><div class="stack">${active.map(p => {
        const info = planInfo(p);
        return `<a class="card active-plan" href="#/plans/${p.id}" style="--pc:${p.color}"><span class="plan-art sm">${icon(p.icon)}</span><div class="grow"><b>${esc(planTitle(p))}</b>
          <p class="small muted">${t('plans.dayOf', 'Day {n} of {t}', { n: info.next + 1, t: p.days.length })} · ${p.days[info.next].map(localRef).join(', ')}</p>
          <div class="progress"><i style="width:${info.pct * 100}%"></i></div>
          ${info.behind > 1 ? `<p class="small warn">${t('plans.behind', '{n} days behind — no pressure, just pick up where you left off.', { n: info.behind - 1 })}</p>` : ''}</div>${icon('chevR')}</a>`;
      }).join('')}</div>` : ''}
      <h2 class="section-title">${t('plans.discover', 'Find a plan')}</h2>
      <div class="chips" role="group" style="margin-bottom:14px">${PLAN_CATS.map(c => `<button class="chip" data-cat="${c.id}" aria-pressed="${c.id === cat}">${esc(L(c.name))}</button>`).join('')}</div>
      <div class="plan-grid">${list.map(planCard).join('')}</div>
      ${st.finished.length ? `<h2 class="section-title">${t('plans.done', 'Completed')}</h2><div class="plan-grid">${st.finished.map(id => PLANS.find(p => p.id === id)).filter(Boolean).map(planCard).join('')}</div>` : ''}`;
    $$('[data-cat]', el).forEach(b => b.addEventListener('click', () => { cat = b.dataset.cat; draw(); }));
  };
  draw();
}

function detail(el, id, dayParam) {
  const p = PLANS.find(x => x.id === id);
  if (!p) { location.hash = '#/plans'; return; }
  const draw = () => {
    const s = planState(); const st = s.active[id]; const info = planInfo(p, st);
    if (!st) {
      el.innerHTML = `<a class="back" href="#/plans">${icon('chevL')} ${t('plans.title', 'Reading plans')}</a>
        <div class="plan-hero" style="--pc:${p.color}"><span class="plan-art lg">${icon(p.icon)}</span><div><h1>${esc(planTitle(p))}</h1><p>${esc(planDesc(p))}</p><p class="small">${t('plans.days', '{n} days', { n: p.days.length })}</p>
        <button class="btn primary" id="start">${icon('play')} ${t('plans.start', 'Start plan')}</button></div></div>
        <h2 class="section-title">${t('plans.whatYouRead', 'What you will read')}</h2>
        <ol class="day-list preview">${p.days.slice(0, 40).map((d, i) => `<li><span class="day-n">${i + 1}</span><span>${d.map(localRef).join(' · ')}</span></li>`).join('')}${p.days.length > 40 ? `<li class="muted small">… +${p.days.length - 40}</li>` : ''}</ol>`;
      $('#start', el).addEventListener('click', () => { startPlan(id); toast(t('plans.started', 'Plan started — day 1 is ready')); draw(); });
      return;
    }
    const day = dayParam != null && dayParam < p.days.length ? dayParam : info.next;
    const readings = p.days[day];
    const prompt = L(PROMPTS[day % PROMPTS.length]);
    el.innerHTML = `
      <a class="back" href="#/plans">${icon('chevL')} ${t('plans.title', 'Reading plans')}</a>
      <div class="plan-hero compact" style="--pc:${p.color}"><span class="plan-art">${icon(p.icon)}</span><div class="grow"><h1>${esc(planTitle(p))}</h1>
        <div class="progress light"><i style="width:${info.pct * 100}%"></i></div><p class="small">${t('plans.progress', '{d} of {t} days · started {date}', { d: info.doneDays, t: p.days.length, date: fmtDate(st.start) })}</p></div></div>
      ${info.behind > 1 ? `<div class="notice">${icon('info')}<span>${t('plans.behind', '{n} days behind — no pressure, just pick up where you left off.', { n: info.behind - 1 })} <button class="btn small ghost" id="catchup">${t('plans.reschedule', 'Reset schedule to today')}</button></span></div>` : ''}
      <div class="day-strip" role="tablist">${p.days.map((_, i) => `<a role="tab" class="day-dot ${st.done[i] ? 'done' : ''} ${i === day ? 'on' : ''}" href="#/plans/${id}/${i}" aria-label="${t('plans.dayN', 'Day {n}', { n: i + 1 })}">${st.done[i] ? icon('check') : i + 1}</a>`).join('')}</div>
      <section class="card">
        <p class="eyebrow">${t('plans.dayN', 'Day {n}', { n: day + 1 })}${st.done[day] ? ' · ' + t('learn.completed', 'completed') : ''}</p>
        <h2>${t('plans.todayRead', 'Today’s reading')}</h2>
        <div class="readings">${readings.map((ref, i) => { const r = parseRef(ref); const done = st.read?.[`${day}:${i}`]; return `<a class="reading ${done ? 'done' : ''}" href="${refHash(r)}?plan=${id}&day=${day}&i=${i}"><span class="check">${icon(done ? 'check' : 'book')}</span><b>${esc(localRef(ref))}</b>${icon('chevR')}</a>`; }).join('')}</div>
        <h3 style="margin-top:20px">${icon('pen')} ${t('plans.reflect', 'Reflect')}</h3>
        <p class="lead">${esc(prompt)}</p>
        <textarea class="input" id="refl" rows="4" placeholder="${t('study.write', 'Write your thoughts…')}">${esc(st.notes?.[day] || '')}</textarea>
        <div class="row" style="margin-top:10px">
          ${!st.done[day] ? `<button class="btn primary" id="markDay">${icon('check')} ${t('plans.markDay', 'Mark day as complete')}</button>` : ''}
          <button class="btn" id="askAI">${icon('spark')} ${t('plans.talk', 'Talk about it with AI')}</button>
          <button class="btn ghost" id="toWeek">${icon('plus')} ${t('plans.toWeeklan', 'Add to Weeklan')}</button>
        </div>
        <div id="aiOut" style="margin-top:12px"></div>
      </section>
      <div class="row" style="margin-top:16px"><button class="btn ghost danger small" id="quit">${t('plans.stop', 'Stop this plan')}</button></div>`;
    let tm;
    $('#refl', el).addEventListener('input', e => { clearTimeout(tm); tm = setTimeout(() => { const s2 = planState(); s2.active[id].notes = { ...(s2.active[id].notes || {}), [day]: e.target.value }; setState(s2); }, 500); });
    $('#markDay', el)?.addEventListener('click', () => { readings.forEach((_, i) => markReading(id, day, i)); draw(); });
    $('#askAI', el).addEventListener('click', () => runAI($('#aiOut', el), [{ role: 'user', content: `I am on day ${day + 1} of the reading plan "${p.title.en}". Today's reading: ${readings.join(', ')}. Give a short devotional: the main idea, one insight from the context, and one simple way to live it out today.${$('#refl', el).value ? `\n\nMy reflection: "${$('#refl', el).value}". Respond kindly to it.` : ''}` }]));
    $('#toWeek', el).addEventListener('click', () => { sendTo('weeklan', { type: 'task', title: `${planTitle(p)} — ${t('plans.dayN', 'Day {n}', { n: day + 1 })}: ${readings.map(localRef).join(', ')}`, date: today(), minutes: 10, link: location.href }); toast(t('set.sent', 'Sent to Weeklan')); });
    $('#catchup', el)?.addEventListener('click', () => { const s2 = planState(); s2.active[id].start = Date.now() - info.doneDays * DAY; setState(s2); draw(); });
    $('#quit', el).addEventListener('click', () => { if (confirm(t('plans.stopConfirm', 'Stop this plan? Your progress will be removed.'))) { const s2 = planState(); delete s2.active[id]; setState(s2); location.hash = '#/plans'; } });
  };
  draw();
}
