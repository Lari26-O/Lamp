import { $, $$, esc, icon, openDialog } from '../util.js';
import { parseRef, refHash, localRef } from '../bible.js';
import { t } from '../i18n.js';
import { personName, personAbout, eraName } from '../learn-data.js';
import { PEOPLE } from '../data/people.js';
import { ERAS } from '../data/timeline.js';
import { runAI } from '../components.js';

export function render(el) {
  el.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">${t('navg.explore', 'Explore')}</p><h1>${t('people.title', 'People of the Bible')}</h1><p>${t('people.intro', 'Meet the key people of the story, in the order they appear.')}</p></div></div>
    <label class="sr-only" for="pq">${t('people.search', 'Search people')}</label>
    <input class="input" id="pq" placeholder="${t('people.search', 'Search people')}…" style="max-width:420px;margin-bottom:16px">
    <div class="grid" id="pl"></div>`;
  const draw = (f = '') => {
    $('#pl', el).innerHTML = PEOPLE.filter(p => (personName(p) + ' ' + personAbout(p)).toLowerCase().includes(f.toLowerCase())).map(p => {
      const era = ERAS.find(e => e.id === p.era);
      const r = parseRef(p.ref);
      return `<div class="card"><div class="row between"><h3 style="margin:0">${esc(personName(p))}</h3><span class="tag" style="background:none;border:1px solid ${era.color};color:var(--ink-2)">${esc(eraName(era.id))}</span></div>
        <p style="margin:8px 0">${esc(personAbout(p))}</p>
        <div class="row">${r ? `<a class="btn small" href="${refHash(r)}">${icon('book')} ${esc(localRef(p.ref))}</a>` : ''}<button class="btn small ghost" data-ai="${esc(p.name)}">${icon('spark')} ${t('people.story', 'Life story')}</button></div></div>`;
    }).join('') || `<p class="empty">${t('people.none', 'No one found.')}</p>`;
  };
  draw();
  $('#pq', el).addEventListener('input', e => draw(e.target.value));
  $('#pl', el).addEventListener('click', e => {
    const name = e.target.closest('[data-ai]')?.dataset.ai; if (!name) return;
    const d = openDialog(name, '<div id="pai"></div>', { wide: true });
    runAI($('#pai', d), [{ role: 'user', content: `Give a short biography of ${name} from the Bible: key events in order with references, their strengths and weaknesses, and one lesson from their life.` }]);
  });
}
