// Bible search: exact words, exact phrase, or "by idea" (topics + any word form + AI suggestions).
import { $, $$, esc, icon } from '../util.js';
import { search, parseRef, refHash, bookName, getVersion, passageText, localRef, currentVersion } from '../bible.js';
import { t, LANG } from '../i18n.js';
import { matchIdeas, keyWords } from '../data/ideas.js';
import { L } from '../profile.js';
import { chat } from '../ai.js';
import { load, save } from '../store.js';

const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function render(el, { query }) {
  const initial = query.get('q') || '';
  let mode = query.get('m') || load('searchMode', 'words');
  let token = 0;
  el.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">${t('navg.explore', 'Explore')}</p><h1>${t('search.title', 'Search the Bible')}</h1><p>${t('search.intro2', 'Search for words, a phrase or an idea — or type a reference like “Romans 8:28”.')}</p></div></div>
    <form class="card search-card" id="sf" role="search">
      <div class="row">
        <label class="sr-only" for="sq">${t('nav.search', 'Search')}</label>
        <input class="input grow" id="sq" type="search" value="${esc(initial)}" placeholder="${t('search.ph2', 'e.g. loving one another')}">
        <button class="btn primary">${icon('search')} ${t('nav.search', 'Search')}</button>
      </div>
      <div class="row wrap search-opts">
        <div class="seg" role="radiogroup" aria-label="${t('search.how', 'How to search')}">
          <button type="button" role="radio" data-m="idea">${icon('spark')} ${t('search.mIdea', 'By idea')}</button>
          <button type="button" role="radio" data-m="words">${t('search.mWords', 'Exact words')}</button>
          <button type="button" role="radio" data-m="phrase">${t('search.mPhrase', 'Exact phrase')}</button>
        </div>
        <label class="sr-only" for="st">${t('search.testament', 'Testament')}</label>
        <select class="input" id="st" style="width:auto;margin:0"><option value="">${t('search.whole', 'Whole Bible')}</option><option value="OT">${t('read.ot', 'Old Testament')}</option><option value="NT">${t('read.nt', 'New Testament')}</option></select>
      </div>
      <p class="small muted" id="mhelp"></p>
    </form>
    <div id="sr" aria-live="polite" style="margin-top:14px"></div>`;
  const out = $('#sr', el);
  const HELP = {
    idea: t('search.hIdea', 'Finds passages about the meaning, even if the words are different (for example “loving one another”).'),
    words: t('search.hWords', 'Finds verses that contain all of your words.'),
    phrase: t('search.hPhrase', 'Finds verses with exactly this phrase, word for word.'),
  };
  const setMode = m => { mode = m; save('searchMode', m); $$('[data-m]', el).forEach(b => b.setAttribute('aria-checked', b.dataset.m === m)); $('#mhelp', el).textContent = HELP[m]; };
  setMode(mode);
  $$('[data-m]', el).forEach(b => b.addEventListener('click', () => { setMode(b.dataset.m); if ($('#sq', el).value.trim()) run(); }));

  const verseList = (results, words) => {
    const hl = text => text.split(/(\s+)/).map(p => { const f = fold(p); return words.some(w => w && f.includes(w)) ? `<mark>${esc(p)}</mark>` : esc(p); }).join('');
    return results.map(x => `<div class="result"><a href="#/read/${x.b}/${x.c}/${x.v}">${esc(bookName(x.b))} ${x.c}:${x.v}</a><p>${hl(x.text)}</p></div>`).join('');
  };
  const passageCard = async ref => {
    const r = parseRef(ref); if (!r) return '';
    let text = ''; try { text = await passageText(r, currentVersion()); } catch {}
    if (text.length > 360) text = text.slice(0, 360).replace(/\s+\S*$/, '') + '…';
    return `<div class="result"><a href="${refHash(r)}">${esc(localRef(ref))}</a><p>${esc(text)}</p></div>`;
  };

  const run = async () => {
    const q = $('#sq', el).value.trim();
    if (!q) { out.innerHTML = ''; return; }
    const r = parseRef(q);
    if (r) { location.hash = refHash(r); return; }
    history.replaceState(null, '', `#/search?q=${encodeURIComponent(q)}&m=${mode}`);
    const my = ++token;
    const testament = $('#st', el).value || undefined;
    const progress = b => { if (my === token && out.querySelector('.prog')) out.querySelector('.prog').innerHTML = `<span class="spinner"></span> ${esc(bookName(b))}…`; };
    out.innerHTML = `<p class="muted prog"><span class="spinner"></span> ${t('search.searching', 'Searching…')}</p>`;

    if (mode !== 'idea') {
      const { results, version } = await search(mode === 'phrase' ? `"${q.replace(/"/g, '')}"` : q, { testament, onProgress: progress });
      if (my !== token) return;
      const words = mode === 'phrase' ? [fold(q.replace(/"/g, ''))] : fold(q).replace(/"/g, '').split(/\s+/).filter(Boolean);
      out.innerHTML = results.length
        ? `<p class="muted">${t('search.count', '{n} results in {v}', { n: results.length >= 300 ? '300+' : results.length, v: getVersion(version).abbr })}</p>${verseList(results, words)}`
        : `<p class="empty">${t('search.none', 'No verses found. Try fewer or different words.')}</p><button class="btn" id="tryIdea">${icon('spark')} ${t('search.tryIdea', 'Search by idea instead')}</button>`;
      $('#tryIdea', el)?.addEventListener('click', () => { setMode('idea'); run(); });
      return;
    }

    // ---- by idea ----
    const ideas = matchIdeas(q, LANG);
    let html = '';
    if (ideas.length) {
      const cards = await Promise.all(ideas.map(async idea => `<section class="idea-block"><h2 class="section-title">${icon('spark')} ${esc(L(idea.title))}</h2>${(await Promise.all(idea.refs.slice(0, 8).map(passageCard))).join('')}</section>`));
      if (my !== token) return;
      html += `<p class="muted">${t('search.ideaFound', 'Key passages about this idea:')}</p>${cards.join('')}`;
    }
    const stems = keyWords(q);
    let related = [];
    if (stems.length) {
      out.innerHTML = html + `<p class="muted prog"><span class="spinner"></span> ${t('search.searching', 'Searching…')}</p>`;
      const res = await search(stems.join(' '), { testament, limit: 60, onProgress: progress });
      if (my !== token) return;
      related = res.results;
    }
    if (related.length) html += `<h2 class="section-title">${t('search.related', 'Verses with these words (any form)')}</h2>${verseList(related.slice(0, 40), stems)}`;
    if (!ideas.length && !related.length) html += `<p class="empty">${t('search.noIdea', 'No passages found for this idea yet. Try other words, or ask the AI below.')}</p>`;
    html += `<div class="card ai-more"><p class="small">${t('search.aiAsk', 'Want more? The free AI helper can suggest other passages about this idea.')}</p><button class="btn" id="aiMore">${icon('chat')} ${t('search.aiBtn', 'Ask the AI for more passages')}</button><div id="aiOut"></div></div>`;
    out.innerHTML = html;
    $('#aiMore', el).addEventListener('click', async ev => {
      ev.target.disabled = true;
      const box = $('#aiOut', el); box.innerHTML = `<p class="muted"><span class="spinner"></span> ${t('ai.thinking', 'Thinking…')}</p>`;
      try {
        const answer = await chat([{ role: 'user', content: `List 8 Bible passages about this idea: "${q}". Reply ONLY with references in English book names, one per line, like "John 13:34-35". No other text.` }], {});
        const refs = [...new Set(String(answer).split(/\n|;|,(?=\s*\d?\s*[A-Z])/).map(s => s.replace(/^[\s\-*\d.)]+(?=[1-3]?\s?[A-Za-z])/, '').trim()).filter(s => parseRef(s)))].slice(0, 8);
        if (my !== token) return;
        box.innerHTML = refs.length ? (await Promise.all(refs.map(passageCard))).join('') : `<p class="muted">${t('search.aiNone', 'The AI did not suggest any passages. Try again in a moment.')}</p>`;
      } catch (e) { box.innerHTML = `<p class="muted">${esc(e.message || t('search.aiNone', 'The AI did not suggest any passages. Try again in a moment.'))}</p>`; }
    });
  };
  $('#sf', el).addEventListener('submit', e => { e.preventDefault(); run(); });
  if (initial) run(); else $('#sq', el).focus();
}
