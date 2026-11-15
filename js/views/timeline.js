import { $, $$, esc, icon } from '../util.js';
import { parseRef, refHash, localRef } from '../bible.js';
import { t, tl } from '../i18n.js';
import { evTitle, evAbout, evDate, eraName, placeName } from '../learn-data.js';
import { ERAS, EVENTS } from '../data/timeline.js';
import { PLACES } from '../data/places.js';
import { runAI } from '../components.js';
import { openDialog } from '../util.js';

export function render(el, { parts }) {
  const focus = parts[0];
  let era = 'all';
  el.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">${t('navg.explore', 'Explore')}</p><h1>${t('nav.timeline', 'Timeline')}</h1><p>${t('tl.intro', 'The whole Bible story in order. Dates before about 1000 BC are traditional estimates — scholars debate many of them.')}</p></div></div>
    <div class="chips" role="group" aria-label="${t('tl.filter', 'Filter by period')}" style="margin-bottom:16px">
      <button class="chip" data-era="all" aria-pressed="true">${t('notes.all', 'All')}</button>
      ${ERAS.map(e => `<button class="chip" data-era="${e.id}" aria-pressed="false"><span style="width:10px;height:10px;border-radius:50%;background:${e.color}"></span>${esc(eraName(e.id))}</button>`).join('')}
    </div>
    <div class="timeline" id="tl"></div>`;
  const tl = $('#tl', el);
  const draw = () => {
    const sorted = [...EVENTS].sort((a, b) => a.year - b.year);
    let html = '';
    for (const e of ERAS) {
      if (era !== 'all' && era !== e.id) continue;
      const items = sorted.filter(x => x.era === e.id);
      html += `<section aria-labelledby="era-${e.id}"><div class="tl-era"><span class="dot" style="background:${e.color}"></span><h2 id="era-${e.id}">${esc(eraName(e.id))}</h2></div>
        ${items.map(x => {
          const r = x.ref && parseRef(x.ref);
          const place = x.place && PLACES.find(p => p.id === x.place);
          return `<div class="tl-item" id="ev-${x.id}" style="--c:${e.color}"><div class="card" ${x.id === focus ? 'style="border-color:var(--accent);border-width:2px"' : ''}>
            <div class="when">${esc(evDate(x))}</div><h3>${esc(evTitle(x))}</h3><p>${esc(evAbout(x))}</p>
            <div class="row">${r ? `<a class="btn small" href="${refHash(r)}">${icon('book')} ${esc(localRef(x.ref))}</a>` : ''}
            ${place ? `<a class="btn small ghost" href="#/map/${place.id}">${icon('map')} ${esc(placeName(place.id))}</a>` : ''}
            <button class="btn small ghost" data-ai="${x.id}">${icon('spark')} ${t('tl.more', 'Tell me more')}</button></div></div></div>`;
        }).join('')}</section>`;
    }
    tl.innerHTML = html;
  };
  draw();
  $$('[data-era]', el).forEach(b => b.addEventListener('click', () => {
    era = b.dataset.era;
    $$('[data-era]', el).forEach(x => x.setAttribute('aria-pressed', x === b));
    draw();
  }));
  tl.addEventListener('click', e => {
    const id = e.target.closest('[data-ai]')?.dataset.ai; if (!id) return;
    const ev = EVENTS.find(x => x.id === id);
    const d = openDialog(evTitle(ev), '<div id="tlai"></div>', { wide: true });
    runAI($('#tlai', d), [{ role: 'user', content: `Tell me about this event in the Bible story: "${ev.title}" (${ev.date}${ev.ref ? ', ' + ev.ref : ''}). Explain what happened, why it matters in the bigger story of the Bible, and what came before and after.` }]);
  });
  if (focus) setTimeout(() => document.getElementById('ev-' + focus)?.scrollIntoView({ block: 'center' }), 60);
}
