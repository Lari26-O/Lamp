import { $, esc, icon } from '../util.js';
import { BOOKS, search, parseRef, refHash, bookName, getVersion } from '../bible.js';
import { t } from '../i18n.js';

export function render(el, { query }) {
  const initial = query.get('q') || '';
  let token = 0;
  el.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">${t('navg.explore', 'Explore')}</p><h1>${t('search.title', 'Search the Bible')}</h1><p>${t('search.intro', 'Search for words, or type a reference like “Romans 8:28”. Use quotes for an exact phrase.')}</p></div></div>
    <form class="card row" id="sf" role="search">
      <label class="sr-only" for="sq">${t('nav.search', 'Search')}</label>
      <input class="input grow" id="sq" type="search" value="${esc(initial)}" placeholder="${t('search.ph', 'e.g. faith hope love')}">
      <label class="sr-only" for="st">${t('search.testament', 'Testament')}</label>
      <select class="input" id="st" style="width:auto;margin:0"><option value="">${t('search.whole', 'Whole Bible')}</option><option value="OT">${t('read.ot', 'Old Testament')}</option><option value="NT">${t('read.nt', 'New Testament')}</option></select>
      <button class="btn primary">${icon('search')} ${t('nav.search', 'Search')}</button>
    </form>
    <div id="sr" aria-live="polite" style="margin-top:14px"></div>`;
  const out = $('#sr', el);
  const run = async () => {
    const q = $('#sq', el).value.trim();
    if (!q) { out.innerHTML = ''; return; }
    const r = parseRef(q);
    if (r) { location.hash = refHash(r); return; }
    history.replaceState(null, '', '#/search?q=' + encodeURIComponent(q));
    const my = ++token;
    out.innerHTML = `<p class="muted"><span class="spinner"></span> ${t('search.searching', 'Searching…')}</p>`;
    const { results, version } = await search(q, { testament: $('#st', el).value || undefined, onProgress: b => { if (my === token) out.querySelector('p').innerHTML = `<span class="spinner"></span> ${esc(bookName(b))}…`; } });
    if (my !== token) return;
    const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const words = fold(q).replace(/"/g, '').split(/\s+/).filter(Boolean);
    const hl = text => { let out2 = ''; const parts = text.split(/(\s+)/); for (const p of parts) { const f = fold(p); out2 += words.some(w => f.includes(w)) ? `<mark>${esc(p)}</mark>` : esc(p); } return out2; };
    out.innerHTML = results.length
      ? `<p class="muted">${t('search.count', '{n} results in {v}', { n: results.length >= 300 ? '300+' : results.length, v: getVersion(version).abbr })}</p>` + results.map(x => `<div class="result"><a href="#/read/${x.b}/${x.c}/${x.v}">${esc(bookName(x.b))} ${x.c}:${x.v}</a><p>${hl(x.text)}</p></div>`).join('')
      : `<p class="empty">${t('search.none', 'No verses found. Try fewer or different words.')}</p>`;
  };
  $('#sf', el).addEventListener('submit', e => { e.preventDefault(); run(); });
  if (initial) run(); else $('#sq', el).focus();
}
