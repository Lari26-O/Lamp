import { $, $$, esc, icon, toast } from '../util.js';
import { BOOKS, bookName } from '../bible.js';
import { t } from '../i18n.js';
import { videoSearches, getSavedVideos, saveVideo, removeVideo, youtubeId, embedHtml } from '../components.js';

const CHANNELS = () => [
  { name: 'BibleProject', url: 'https://www.youtube.com/@bibleproject', about: t('vid.c1', 'Free animated videos explaining every book of the Bible and its big themes.') },
  { name: 'BibleProject — Português / Español / Français', url: 'https://www.youtube.com/results?search_query=BibleProject+Portugu%C3%AAs+Espa%C3%B1ol+Fran%C3%A7ais', about: t('vid.c2', 'The same videos in other languages.') },
  { name: t('vid.c3n', 'Bible stories for kids'), url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(t('vid.c3q', 'bible stories for kids')), about: t('vid.c3', 'Animated stories for families.') },
  { name: t('vid.c4n', 'Sign language Bible'), url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(t('vid.c4q', 'ASL bible')), about: t('vid.c4', 'Scripture in sign language.') },
];

export function render(el) {
  let b = 42, c = 1;
  const draw = () => {
    const saved = getSavedVideos();
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">${t('navg.explore', 'Explore')}</p><h1>${t('nav.videos', 'Videos')}</h1><p>${t('vid.intro', 'Find video explanations for any book or chapter, and save the ones that help you. Saved videos play right here.')}</p></div></div>
      <div class="card">
        <h2>${t('vid.find', 'Find videos for a passage')}</h2>
        <div class="row">
          <label class="sr-only" for="vb">${t('read.book', 'Book')}</label>
          <select class="input" id="vb" style="width:auto;margin:0">${BOOKS.map((x, i) => `<option value="${i}" ${i === b ? 'selected' : ''}>${esc(bookName(i))}</option>`).join('')}</select>
          <label class="sr-only" for="vc">${t('read.chapter', 'Chapter')}</label>
          <select class="input" id="vc" style="width:auto;margin:0"><option value="0">${t('vid.whole', 'Whole book')}</option>${Array.from({ length: BOOKS[b].ch }, (_, i) => `<option ${i + 1 === c ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>
        </div>
        <ul class="mini-list" style="margin-top:12px">${videoSearches(bookName(b), c || null).map(v => `<li><a href="${v.url}" target="_blank" rel="noopener">${icon('video')} ${esc(v.label)}</a> <span class="muted small">— ${esc(v.note)}</span></li>`).join('')}</ul>
      </div>
      <div class="card">
        <h2>${t('vid.save', 'Save a video')}</h2>
        <form id="addV" class="stack">
          <label class="field">YouTube<input class="input" id="vu" inputmode="url" placeholder="https://www.youtube.com/watch?v=…" required></label>
          <label class="field">${t('vid.title', 'Title')}<input class="input" id="vt"></label>
          <label class="field">${t('vid.passage', 'Passage it explains')}<input class="input" id="vp" value="${esc(bookName(b) + (c ? ' ' + c : ''))}"></label>
          <button class="btn primary">${icon('plus')} ${t('vid.save', 'Save a video')}</button>
        </form>
      </div>
      <h2 class="section-title">${t('vid.mine', 'My saved videos')}</h2>
      ${saved.length ? `<div class="grid">${saved.map(v => `<div class="card">${embedHtml(v.vid, v.title)}<div class="row between" style="margin-top:8px"><div><b>${esc(v.title)}</b><br><span class="muted small">${esc(v.passage || '')}</span></div><button class="icon-btn" data-del="${v.id}" aria-label="${t('common.remove', 'Remove')}">${icon('trash')}</button></div></div>`).join('')}</div>`
        : `<p class="muted">${t('vid.none', 'No saved videos yet.')}</p>`}
      <h2 class="section-title">${t('vid.channels', 'Helpful channels')}</h2>
      <div class="grid">${CHANNELS().map(ch => `<a class="card tile" href="${ch.url}" target="_blank" rel="noopener"><span class="ico-wrap">${icon('video')}</span><div><b>${esc(ch.name)}</b><p>${esc(ch.about)}</p></div></a>`).join('')}</div>`;
    $('#vb', el).addEventListener('change', e => { b = +e.target.value; c = 0; draw(); });
    $('#vc', el).addEventListener('change', e => { c = +e.target.value; draw(); });
    $('#addV', el).addEventListener('submit', e => {
      e.preventDefault();
      const vid = youtubeId($('#vu', el).value);
      if (!vid) { toast(t('vid.bad', 'That doesn’t look like a YouTube link.')); return; }
      saveVideo({ vid, url: $('#vu', el).value, title: $('#vt', el).value.trim() || t('vid.saved', 'Video saved'), passage: $('#vp', el).value.trim() });
      toast(t('common.saved', 'Saved')); draw();
    });
    $$('[data-del]', el).forEach(x => x.addEventListener('click', () => { removeVideo(x.dataset.del); draw(); }));
  };
  draw();
}
