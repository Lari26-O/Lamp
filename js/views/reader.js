import { $, $$, esc, icon, toast, announce, openDialog, speech, shuffle } from '../util.js';
import { BOOKS, allVersions, getVersion, loadChapter, parseRef, bookName, refLabel, currentVersion, defaultVersionFor, isAvailable, refreshYV } from '../bible.js';
import { getSettings, setSettings, getNotes, getNote, setNote, allTags, markRead, getProgress, chapterMarks, addMarks, updateMark, removeMark, getJournal, setJournal, uid, markActivity } from '../store.js';
import { addCard, hasCard } from '../srs.js';
import { PLACES } from '../data/places.js';
import { EVENTS, ERAS } from '../data/timeline.js';
import { aiMethods, runAI, videoPanel, tabs } from '../components.js';
import { t, tl, LANG, LANGS, langName } from '../i18n.js';
import { PLANS, planTitle, findPlan, allKnownPlans, dailyPlan } from '../plans-data.js';
import { markReading } from './plans.js';
import { verseImage } from '../components.js';

const COLORS = ['yellow', 'green', 'blue', 'pink', 'purple'];
const colorName = c => t('color.' + c, c);

export async function render(el, { parts, query }) {
  const [b, c, v] = parts.map(n => parseInt(n, 10));
  if (isNaN(b) || !BOOKS[b]) return bookPicker(el);
  if (isNaN(c) || c < 1 || c > BOOKS[b].ch) return chapterPicker(el, b);
  return chapterView(el, b, c, v, query);
}

function bookPicker(el) {
  const last = getProgress().last;
  const grid = tt => BOOKS.map((bk, i) => bk.t === tt ? `<button data-b="${i}">${esc(bookName(i))}</button>` : '').join('');
  el.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">${t('nav.read', 'Read')}</p><h1>${t('read.title', 'The Bible')}</h1><p>${t('read.pick', 'Choose a book to start reading. Your highlights and notes turn it into your own study Bible.')}</p></div>
    ${last ? `<a class="btn primary" href="#/read/${last.b}/${last.c}">${icon('book')} ${t('read.continue', 'Continue {ref}', { ref: esc(bookName(last.b) + ' ' + last.c) })}</a>` : ''}</div>
    <h2 class="section-title">${t('read.ot', 'Old Testament')}</h2><div class="book-grid">${grid('OT')}</div>
    <h2 class="section-title">${t('read.nt', 'New Testament')}</h2><div class="book-grid">${grid('NT')}</div>`;
  $$('[data-b]', el).forEach(btn => btn.addEventListener('click', () => {
    const i = +btn.dataset.b;
    location.hash = BOOKS[i].ch === 1 ? `#/read/${i}/1` : `#/read/${i}`;
  }));
}

function chapterPicker(el, b) {
  const read = getProgress().read;
  el.innerHTML = `<div class="page-head"><div><a href="#/read" class="back">${icon('chevL')} ${t('read.allBooks', 'All books')}</a><h1>${esc(bookName(b))}</h1><p>${t('read.pickCh', 'Choose a chapter. Shaded chapters are ones you have read.')}</p></div></div>
    <div class="ch-grid">${Array.from({ length: BOOKS[b].ch }, (_, i) => `<button class="${read[`${b}.${i + 1}`] ? 'read' : ''}" data-c="${i + 1}">${i + 1}</button>`).join('')}</div>
    <section class="card" style="margin-top:24px"><h3 class="card-title">${icon('video')} ${t('read.videosAbout', 'Videos about {book}', { book: esc(bookName(b)) })}</h3><div id="bookVideos"></div></section>`;
  $$('[data-c]', el).forEach(btn => btn.addEventListener('click', () => { location.hash = `#/read/${b}/${btn.dataset.c}`; }));
  videoPanel($('#bookVideos', el), bookName(b), null);
}

function versionOptions(selected) {
  const vs = allVersions();
  const order = [LANG, ...LANGS.map(l => l.id).filter(x => x !== LANG)];
  return order.map(lang => {
    const list = vs.filter(v => v.lang === lang);
    const off = list.filter(v => v.src === 'local');
    const on = list.filter(v => v.src !== 'local');
    const opt = v => `<option value="${v.id}" ${v.id === selected ? 'selected' : ''} ${isAvailable(v) ? '' : 'disabled'}>${esc(v.abbr)} — ${esc(v.name)}${v.src === 'local' ? '' : isAvailable(v) ? ' ↗' : ' (' + t('read.needsKey', 'needs key') + ')'}</option>`;
    return `<optgroup label="${esc(langName(lang))}">${off.map(opt).join('')}${on.map(opt).join('')}</optgroup>`;
  }).join('');
}

async function chapterView(el, b, c, focusV, query = new URLSearchParams()) {
  const plan = findPlan(query.get('plan'));
  const planDay = +query.get('day') || 0, planI = +query.get('i') || 0;
  const s = getSettings();
  const name = bookName(b);
  const label = `${name} ${c}`;
  let vid = currentVersion();
  let data, fellBack = '';
  el.innerHTML = `<div class="empty"><span class="spinner"></span> ${esc(label)}…</div>`;
  refreshYV(LANG).catch(() => {});
  try { data = await loadChapter(b, c, vid); }
  catch (e) {
    fellBack = e.message;
    vid = defaultVersionFor(getVersion(vid).lang);
    data = await loadChapter(b, c, vid);
  }
  const ver = getVersion(vid);
  const verses = data.verses;
  markRead(b, c);

  const prev = c > 1 ? [b, c - 1] : b > 0 ? [b - 1, BOOKS[b - 1].ch] : null;
  const next = c < BOOKS[b].ch ? [b, c + 1] : b < BOOKS.length - 1 ? [b + 1, 1] : null;
  let compareId = sessionGet('lamp-compare') || '';
  let panelOn = s.studyPanel;

  el.innerHTML = `
    <div class="reader-bar" role="toolbar" aria-label="${t('read.controls', 'Reading controls')}">
      <div class="seg">
        <label class="sr-only" for="selBook">${t('read.book', 'Book')}</label>
        <select id="selBook" class="pill">${BOOKS.map((bk, i) => `<option value="${i}" ${i === b ? 'selected' : ''}>${esc(bookName(i))}</option>`).join('')}</select>
        <label class="sr-only" for="selCh">${t('read.chapter', 'Chapter')}</label>
        <select id="selCh" class="pill narrow">${Array.from({ length: BOOKS[b].ch }, (_, i) => `<option ${i + 1 === c ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>
        <label class="sr-only" for="selVer">${t('read.version', 'Bible version')}</label>
        <select id="selVer" class="pill ver" title="${t('read.version', 'Bible version')}">${versionOptions(vid)}</select>
      </div>
      <div class="seg tools">
        <button class="icon-btn" id="cmpBtn" aria-pressed="${!!compareId}" title="${t('read.compare', 'Compare versions')}" aria-label="${t('read.compare', 'Compare versions')}">${icon('columns')}</button>
        <button class="icon-btn" id="fontDown" aria-label="${t('read.smaller', 'Smaller text')}" title="${t('read.smaller', 'Smaller text')}"><span class="aa">A</span></button>
        <button class="icon-btn" id="fontUp" aria-label="${t('read.larger', 'Larger text')}" title="${t('read.larger', 'Larger text')}"><span class="aa big">A</span></button>
        <button class="icon-btn" id="listen" aria-pressed="false" aria-label="${t('read.listen', 'Listen')}" title="${t('read.listen', 'Listen')}">${icon('speaker')}</button>
        <button class="btn small" id="panelBtn" aria-pressed="${panelOn}" aria-controls="studyPanel">${icon('panel')} <span>${t('read.studyPanel', 'Study notes')}</span></button>
      </div>
    </div>
    ${fellBack ? `<div class="notice" role="alert">${icon('info')} <span>${esc(fellBack)} ${t('read.showing', 'Showing {v} instead.', { v: esc(ver.abbr) })}</span></div>` : ''}
    <div class="reader-layout ${panelOn ? 'with-panel' : ''}" id="layout">
      <div class="reader-main">
        ${plan ? `<div class="plan-banner" style="--pc:${plan.color}">${icon('calendar')}<span class="grow"><b>${esc(planTitle(plan))}</b><br><small>${t('plans.dayN', 'Day {n}', { n: planDay + 1 })} · ${planI + 1}/${plan.days[planDay].length}</small></span><button class="btn small primary" id="planDone">${icon('check')} ${t('plans.readNext', 'Done — continue')}</button></div>` : ''}
        <div id="cmpRow" class="cmp-row" ${compareId ? '' : 'hidden'}>
          <label class="small muted" for="selCmp">${t('read.compareWith', 'Compare with')}</label>
          <select id="selCmp" class="pill ver">${versionOptions(compareId)}</select>
        </div>
        <article class="scripture ${s.verseNumbers ? '' : 'no-nums'} ${s.paragraphMode ? '' : 'lines'}" lang="${ver.lang}" aria-label="${esc(label)}">
          <header class="chap-head"><h1>${esc(label)}</h1><span class="ver-badge">${esc(ver.abbr)}</span></header>
          <div id="verses"></div>
          <p class="copyright">${esc(ver.name)}${data.copyright ? ' · ' + esc(data.copyright) : ''}</p>
          <nav class="chapter-nav" aria-label="${t('read.chapters', 'Chapters')}">
            ${prev ? `<a class="btn" href="#/read/${prev[0]}/${prev[1]}">${icon('chevL')} ${esc(bookName(prev[0]))} ${prev[1]}</a>` : '<span></span>'}
            ${next ? `<a class="btn" href="#/read/${next[0]}/${next[1]}">${esc(bookName(next[0]))} ${next[1]} ${icon('chevR')}</a>` : '<span></span>'}
          </nav>
          <p class="hint">${icon('info')} ${t('read.tip', 'Tap a verse for actions. Select any word or phrase to highlight, underline or add a note to it.')}</p>
        </article>
      </div>
      <aside class="study-panel ${panelOn ? 'open' : ''}" id="studyPanel" aria-label="${t('read.studyPanel', 'Study notes')}">
        <div class="panel-head"><b>${t('read.myStudy', 'My study Bible')}</b><button class="icon-btn" id="panelClose" aria-label="${t('common.close', 'Close')}">${icon('x')}</button></div>
        <div id="panelTabs"></div>
      </aside>
    </div>
    <div class="sel-bar" id="selBar" hidden role="toolbar" aria-label="${t('read.selTools', 'Selection tools')}"></div>
    <div class="sheet" id="sheet" hidden role="dialog" aria-label="${t('read.verseActions', 'Verse actions')}"></div>`;

  const versesEl = $('#verses', el);
  let compareData = null;

  // ---------- rendering ----------
  function verseHtml(x) {
    const n = getNote(`${b}.${c}.${x.v}`);
    const marks = chapterMarks(vid, b, c).filter(m => m.v === x.v);
    const cls = n?.color ? ` hl-${n.color}` : '';
    const dot = n && (n.note || n.tags?.length) ? `<span class="vnote" role="button" tabindex="0" data-vnote="${x.v}" aria-label="${t('read.hasNote', 'Has a note')}">${icon('pen')}</span>` : '';
    const head = s.headings && data.headings?.[x.v] ? `<h3 class="sec-h">${esc(data.headings[x.v])}</h3>` : '';
    return `${head}<span class="verse${cls}" data-v="${x.v}" tabindex="0" role="button" aria-pressed="false"><sup class="vn">${x.v}</sup><span class="vt">${segments(x.text, marks)}</span>${dot}</span>`;
  }
  function segments(text, marks) {
    if (!marks.length) return esc(text);
    const cuts = new Set([0, text.length]);
    marks.forEach(m => { cuts.add(Math.max(0, Math.min(text.length, m.s))); cuts.add(Math.max(0, Math.min(text.length, m.e))); });
    const pts = [...cuts].sort((a, z) => a - z);
    let out = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], z = pts[i + 1];
      const seg = esc(text.slice(a, z));
      const cover = marks.filter(m => m.s <= a && m.e >= z).sort((p, q) => p.created - q.created);
      if (!cover.length) { out += seg; continue; }
      const top = cover.filter(m => m.style !== 'ul').pop();
      const ul = cover.some(m => m.style === 'ul');
      const klass = `pm${top ? ' hl-' + top.color : ''}${ul ? ' ul ul-' + (cover.filter(m => m.style === 'ul').pop().color) : ''}`;
      out += `<mark class="${klass}" data-mids="${cover.map(m => m.id).join(',')}">${seg}</mark>`;
      const ending = cover.filter(m => m.e === z && m.note);
      for (const m of ending) out += `<span class="mnote" role="button" tabindex="0" data-mid="${m.id}" aria-label="${t('read.phraseNote', 'Note on “{p}”', { p: esc(m.text) })}">${icon('pen')}</span>`;
    }
    return out;
  }
  function drawVerses() {
    if (compareData) {
      const cv = getVersion(compareId);
      const map = Object.fromEntries(compareData.verses.map(x => [x.v, x.text]));
      versesEl.className = 'parallel';
      versesEl.innerHTML = `<div class="par-head"><span>${esc(ver.abbr)}</span><span>${esc(cv.abbr)}</span></div>` +
        verses.map(x => `<div class="par-row"><div>${verseHtml(x)}</div><div class="par-alt" lang="${cv.lang}"><sup class="vn">${x.v}</sup>${esc(map[x.v] || '')}</div></div>`).join('');
    } else {
      versesEl.className = '';
      versesEl.innerHTML = verses.map(verseHtml).join(' ');
    }
    paintSelection();
  }
  async function loadCompare() {
    compareData = null;
    if (compareId && compareId !== vid) {
      try { compareData = await loadChapter(b, c, compareId); }
      catch (e) { toast(e.message); }
    }
    drawVerses();
  }

  // ---------- plan mode ----------
  $('#planDone', el)?.addEventListener('click', () => {
    markReading(plan.id, planDay, planI);
    const nextRef = plan.days[planDay][planI + 1];
    if (nextRef) { const r = parseRef(nextRef); location.hash = `#/read/${r.b}/${r.c}${r.v1 ? '/' + r.v1 : ''}?plan=${plan.id}&day=${planDay}&i=${planI + 1}`; }
    else location.hash = `#/plans/${plan.id}/${planDay}`;
  });

  // ---------- controls ----------
  $('#selBook', el).addEventListener('change', e => { location.hash = `#/read/${e.target.value}/1`; });
  $('#selCh', el).addEventListener('change', e => { location.hash = `#/read/${b}/${e.target.value}`; });
  $('#selVer', el).addEventListener('change', e => { setSettings({ version: e.target.value }); window.dispatchEvent(new HashChangeEvent('hashchange')); });
  $('#cmpBtn', el).addEventListener('click', () => {
    const row = $('#cmpRow', el);
    if (compareId) { compareId = ''; sessionSet('lamp-compare', ''); row.hidden = true; $('#cmpBtn', el).setAttribute('aria-pressed', 'false'); loadCompare(); return; }
    row.hidden = false; $('#cmpBtn', el).setAttribute('aria-pressed', 'true');
    const sel = $('#selCmp', el);
    if (sel.value === vid) { const alt = allVersions().find(x => x.id !== vid && x.src === 'local' && x.lang === ver.lang) || allVersions().find(x => x.id !== vid && x.src === 'local'); sel.value = alt.id; }
    compareId = sel.value; sessionSet('lamp-compare', compareId); loadCompare();
  });
  $('#selCmp', el).addEventListener('change', e => { compareId = e.target.value; sessionSet('lamp-compare', compareId); loadCompare(); });
  const setFont = d => {
    const size = Math.min(34, Math.max(14, getSettings().fontSize + d));
    setSettings({ fontSize: size });
    document.documentElement.style.setProperty('--read-size', size + 'px');
    announce(t('read.size', 'Text size {n}', { n: size }));
  };
  $('#fontDown', el).addEventListener('click', () => setFont(-2));
  $('#fontUp', el).addEventListener('click', () => setFont(2));
  const setPanel = on => {
    panelOn = on; setSettings({ studyPanel: on });
    $('#layout', el).classList.toggle('with-panel', on);
    $('#studyPanel', el).classList.toggle('open', on);
    $('#panelBtn', el).setAttribute('aria-pressed', on);
  };
  $('#panelBtn', el).addEventListener('click', () => setPanel(!panelOn));
  $('#panelClose', el).addEventListener('click', () => setPanel(false));

  // ---------- study panel ----------
  const fullText = () => `${label} (${ver.abbr}):\n${verses.map(x => `${x.v} ${x.text}`).join('\n')}`;
  let notesTabBody = null;
  const panel = tabs($('#panelTabs', el), [
    { id: 'notes', label: t('tab.notes', 'Notes'), icon: 'pen' },
    { id: 'study', label: t('tab.study', 'Study'), icon: 'spark' },
    { id: 'context', label: t('tab.context', 'Context'), icon: 'compass' },
    { id: 'videos', label: t('tab.videos', 'Videos'), icon: 'video' },
  ], (id, body) => {
    notesTabBody = id === 'notes' ? body : null;
    if (id === 'notes') drawNotes(body);
    if (id === 'study') {
      body.innerHTML = `
        <a class="card tile mini" href="#/study/guide?ref=${encodeURIComponent(refLabel({ b, c }, 'en'))}"><span class="ico-wrap">${icon('compass')}</span><div><b>${t('read.guided', 'Guided study of this chapter')}</b><p>${t('read.guidedSub', 'Step by step: observe, context, interpret, apply.')}</p></div></a>
        <a class="card tile mini" href="#/study/method/hard?ref=${encodeURIComponent(refLabel({ b, c }, 'en'))}"><span class="ico-wrap">${icon('anchor')}</span><div><b>${t('read.hard', 'Hard to understand?')}</b><p>${t('read.hardSub', 'Breathe, invite God in, trust his goodness, then context.')}</p></div></a>
        <h4 class="panel-sub">${t('read.askAI', 'Ask the AI helper')}</h4><div id="aiBox"></div>
        <h4 class="panel-sub">${t('read.remember', 'Remember it')}</h4>
        <button class="btn small" id="chQuiz">${icon('quiz')} ${t('read.chQuiz', 'Chapter quiz')}</button>`;
      aiMethods($('#aiBox', body), async () => fullText());
      $('#chQuiz', body).addEventListener('click', () => chapterQuiz(label, verses));
    }
    if (id === 'context') drawContext(body);
    if (id === 'videos') videoPanel(body, name, c, `${b}:${c}`);
  });

  function drawNotes(body) {
    const notes = Object.entries(getNotes()).filter(([k, n]) => k.startsWith(`${b}.${c}.`)).map(([k, n]) => ({ kind: 'verse', v: +k.split('.')[2], key: k, ...n }));
    const marks = chapterMarks(vid, b, c).map(m => ({ kind: 'mark', ...m }));
    const seenGroup = new Set();
    const items = [...notes, ...marks].filter(x => {
      if (x.kind === 'mark' && x.group) { if (seenGroup.has(x.group)) return false; seenGroup.add(x.group); }
      return true;
    }).sort((p, q) => p.v - q.v || (p.s || 0) - (q.s || 0));
    body.innerHTML = `
      <label class="field">${t('read.journal', 'Chapter journal')}<span class="hint">${t('read.journalHint', 'Your thoughts on the whole chapter. Saved automatically.')}</span>
        <textarea class="input" id="journal" rows="4" placeholder="${t('read.journalPh', 'What is God showing you here?')}">${esc(getJournal(b, c))}</textarea></label>
      <div class="notes-list">${items.length ? items.map(x => x.kind === 'mark' ? `
        <div class="nitem" data-mid="${x.id}">
          <button class="nquote ${x.style === 'ul' ? 'ul' : ''}" style="--c:var(--hl-${x.color})" data-goto="${x.v}">“${esc(x.text)}”<small>${esc(name)} ${c}:${x.v}</small></button>
          <textarea class="input ntext" rows="2" placeholder="${t('read.addNote', 'Add a note…')}" data-mnote="${x.id}">${esc(x.note || '')}</textarea>
          <div class="row between"><div class="chips">${(x.tags || []).map(tg => `<span class="tag">#${esc(tg)}</span>`).join('')}</div><button class="icon-btn sm" data-medit="${x.id}" aria-label="${t('common.edit', 'Edit')}">${icon('gear')}</button></div>
        </div>` : `
        <div class="nitem">
          <button class="nquote verse-q ${x.color ? '' : 'plain'}" style="--c:var(--hl-${x.color || 'yellow'})" data-goto="${x.v}">${esc(name)} ${c}:${x.v}${x.v2 ? '-' + x.v2 : ''}<small>${esc((verses.find(y => y.v === x.v)?.text || '').slice(0, 90))}…</small></button>
          <textarea class="input ntext" rows="2" placeholder="${t('read.addNote', 'Add a note…')}" data-vnote-edit="${x.key}">${esc(x.note || '')}</textarea>
          ${(x.tags || []).length ? `<div class="chips">${x.tags.map(tg => `<a class="tag" href="#/notes?tag=${encodeURIComponent(tg)}">#${esc(tg)}</a>`).join('')}</div>` : ''}
        </div>`).join('') : `<p class="muted small">${t('read.noNotes', 'No notes yet. Select words in the text to highlight them, or tap a verse to add a note.')}</p>`}</div>`;
    let jt;
    $('#journal', body).addEventListener('input', e => { clearTimeout(jt); jt = setTimeout(() => setJournal(b, c, e.target.value), 400); });
    $$('[data-mnote]', body).forEach(ta => { let tm; ta.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { updateMark(ta.dataset.mnote, { note: ta.value }); refreshText(); }, 500); }); });
    $$('[data-vnote-edit]', body).forEach(ta => { let tm; ta.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { setNote(ta.dataset.vnoteEdit, { note: ta.value }); refreshText(); }, 500); }); });
    $$('[data-goto]', body).forEach(btn => btn.addEventListener('click', () => flashVerse(+btn.dataset.goto)));
    $$('[data-medit]', body).forEach(btn => btn.addEventListener('click', () => markEditor(btn.dataset.medit)));
  }

  async function drawContext(body) {
    body.innerHTML = `<div class="empty small"><span class="spinner"></span></div>`;
    let en = verses.map(x => x.text).join(' ');
    if (ver.lang !== 'en') { try { en = (await loadChapter(b, c, 'kjv')).verses.map(x => x.text).join(' '); } catch {} }
    const places = PLACES.filter(p => p.names.some(n => new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(en)));
    const events = EVENTS.filter(ev => { const r = ev.ref && parseRef(ev.ref); return r && r.b === b && c >= r.c && c <= (r.c2 || r.c); });
    body.innerHTML = `
      <h4 class="panel-sub">${icon('map')} ${t('read.places', 'Places in this chapter')}</h4>
      ${places.length ? `<div class="chips">${places.map(p => `<a class="chip" href="#/map/${p.id}">${esc(tl('place', p.id, 'name', p.name))}</a>`).join('')}</div>` : `<p class="muted small">${t('read.noPlaces', 'No mapped places mentioned.')}</p>`}
      <h4 class="panel-sub">${icon('clock')} ${t('read.onTimeline', 'On the timeline')}</h4>
      ${events.length ? `<ul class="mini-list">${events.map(ev => `<li><a href="#/timeline/${ev.id}">${esc(tl('event', ev.id, 'title', ev.title))}</a><br><span class="muted small">${esc(tl('event', ev.id, 'date', ev.date))} · ${esc(tl('era', ev.era, 'name', ERAS.find(e => e.id === ev.era).name))}</span></li>`).join('')}</ul>` : `<p class="muted small">${t('read.noEvents', 'No timeline events for this chapter.')}</p>`}
      <h4 class="panel-sub">${icon('scroll')} ${t('read.bookCtx', 'Book background')}</h4>
      <div id="bookCtx"><button class="btn small" id="bookCtxBtn">${icon('spark')} ${t('read.bookCtxBtn', 'Who wrote {book}, when and why?', { book: esc(name) })}</button></div>`;
    $('#bookCtxBtn', body)?.addEventListener('click', () => runAI($('#bookCtx', body), [{ role: 'user', content: `Give a short background of the book of ${BOOKS[b].name}: author, date, original audience, genre, purpose, and how chapter ${c} fits into the book's structure. Then mention 2–3 historical or cultural facts that help read chapter ${c}.` }]));
  }

  function refreshText() { drawVerses(); }
  function refreshAll() { drawVerses(); if (notesTabBody) drawNotes(notesTabBody); }
  window.addEventListener('lamp:data', onData);
  function onData() { /* other views may change data; keep text in sync lazily */ }

  function flashVerse(n) {
    const sp = $(`.verse[data-v="${n}"]`, versesEl);
    if (!sp) return;
    sp.scrollIntoView({ block: 'center', behavior: s.reduceMotion ? 'auto' : 'smooth' });
    sp.classList.add('flash'); setTimeout(() => sp.classList.remove('flash'), 1400);
  }

  // ---------- phrase selection (study Bible) ----------
  const selBar = $('#selBar', el);
  let pending = null;
  const offsetIn = (vt, node, off) => {
    if (!vt.contains(node)) {
      const pos = vt.compareDocumentPosition(node);
      return (pos & Node.DOCUMENT_POSITION_PRECEDING) ? 0 : vt.textContent.length;
    }
    const r = document.createRange(); r.setStart(vt, 0); r.setEnd(node, off);
    return r.toString().length;
  };
  const snap = (text, s0, e0) => {
    let s1 = s0, e1 = e0;
    while (s1 > 0 && /[\p{L}\p{N}'’-]/u.test(text[s1 - 1])) s1--;
    while (e1 < text.length && /[\p{L}\p{N}'’-]/u.test(text[e1])) e1++;
    while (s1 < e1 && /\s/.test(text[s1])) s1++;
    while (e1 > s1 && /\s/.test(text[e1 - 1])) e1--;
    return [s1, e1];
  };
  function readSelection() {
    const sel = document.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
    const range = sel.getRangeAt(0);
    if (!versesEl.contains(range.commonAncestorContainer)) return null;
    const spans = $$('.verse', versesEl).filter(sp => range.intersectsNode(sp));
    if (!spans.length) return null;
    const parts = [];
    for (const sp of spans) {
      const vt = $('.vt', sp); const text = verses.find(x => x.v === +sp.dataset.v)?.text || vt.textContent;
      let s0 = sp === spans[0] ? offsetIn(vt, range.startContainer, range.startOffset) : 0;
      let e0 = sp === spans[spans.length - 1] ? offsetIn(vt, range.endContainer, range.endOffset) : text.length;
      [s0, e0] = snap(text, s0, e0);
      if (e0 > s0) parts.push({ v: +sp.dataset.v, s: s0, e: e0, text: text.slice(s0, e0) });
    }
    return parts.length ? parts : null;
  }
  let selTimer;
  const onSelChange = () => {
    clearTimeout(selTimer);
    selTimer = setTimeout(() => {
      const parts = readSelection();
      if (!parts) { if (!selBar.matches(':focus-within')) { selBar.hidden = true; pending = null; } return; }
      pending = parts;
      const phrase = parts.map(p => p.text).join(' ');
      const oneWord = parts.length === 1 && !/\s/.test(phrase);
      selBar.innerHTML = `
        <div class="sel-colors">${COLORS.map(col => `<button class="swatch" style="background:var(--hl-${col})" data-hl="${col}" aria-label="${t('read.highlight', 'Highlight')} ${colorName(col)}"></button>`).join('')}</div>
        <button class="icon-btn" data-act="ul" title="${t('read.underline', 'Underline')}" aria-label="${t('read.underline', 'Underline')}">${icon('underline')}</button>
        <button class="icon-btn" data-act="note" title="${t('read.noteOn', 'Note on this')}" aria-label="${t('read.noteOn', 'Note on this')}">${icon('pen')}</button>
        <button class="icon-btn" data-act="ask" title="${oneWord ? t('read.wordStudy', 'Word study') : t('read.explainPhrase', 'Explain phrase')}" aria-label="${oneWord ? t('read.wordStudy', 'Word study') : t('read.explainPhrase', 'Explain phrase')}">${icon('spark')}</button>
        <button class="icon-btn" data-act="copy" title="${t('common.copy', 'Copy')}" aria-label="${t('common.copy', 'Copy')}">${icon('copy')}</button>`;
      selBar.hidden = false;
      const rect = document.getSelection().getRangeAt(0).getBoundingClientRect();
      if (window.innerWidth > 860) {
        selBar.style.top = Math.max(70, rect.top + window.scrollY - 56) + 'px';
        selBar.style.left = Math.min(window.innerWidth - 330, Math.max(12, rect.left + rect.width / 2 - 160)) + 'px';
      }
    }, 220);
  };
  document.addEventListener('selectionchange', onSelChange);
  selBar.addEventListener('mousedown', e => e.preventDefault()); // keep the text selection
  selBar.addEventListener('click', e => {
    const btn = e.target.closest('button'); if (!btn || !pending) return;
    const phrase = pending.map(p => p.text).join(' … ');
    const where = pending.length === 1 ? `${name} ${c}:${pending[0].v}` : `${name} ${c}:${pending[0].v}-${pending[pending.length - 1].v}`;
    const make = (patch) => { const group = pending.length > 1 ? uid() : undefined; const list = pending.map(p => ({ id: uid(), ver: vid, b, c, ...p, color: 'yellow', style: 'hl', note: '', tags: [], group, created: Date.now(), ...patch })); addMarks(list); markActivity('mark', 1); return list; };
    if (btn.dataset.hl) { make({ color: btn.dataset.hl }); done(t('read.highlighted', 'Highlighted')); }
    else if (btn.dataset.act === 'ul') { make({ style: 'ul', color: 'blue' }); done(t('read.underlined', 'Underlined')); }
    else if (btn.dataset.act === 'note') { const list = make({ color: 'yellow' }); done(); markEditor(list[0].id, true); }
    else if (btn.dataset.act === 'copy') { navigator.clipboard?.writeText(`“${phrase}” — ${where} (${ver.abbr})`).then(() => toast(t('common.copied', 'Copied'))).catch(() => {}); clearSel(); }
    else if (btn.dataset.act === 'ask') {
      const one = pending.length === 1 && !/\s/.test(phrase);
      const d = openDialog(one ? t('read.wordStudy', 'Word study') + ': ' + phrase : t('read.explainPhrase', 'Explain phrase'), `<blockquote class="quote">“${esc(phrase)}” <cite>${esc(where)} · ${esc(ver.abbr)}</cite></blockquote><div id="phAI"></div>`, { wide: true });
      const verseText = pending.map(p => verses.find(x => x.v === p.v)?.text).join(' ');
      runAI($('#phAI', d), [{ role: 'user', content: one
        ? `Do a short word study of "${phrase}" as used in ${BOOKS[b].name} ${c}:${pending[0].v} ("${verseText}"). Give the original Hebrew/Greek word (transliterated) if you are confident, its range of meaning, how it is used elsewhere in the Bible (2–3 references), and what it means here.`
        : `Explain the phrase "${phrase}" in ${BOOKS[b].name} ${c} (full verse: "${verseText}"). What does it mean in context, and why might the author have chosen these words?` }]);
      clearSel();
    }
    function done(msg) { clearSel(); refreshAll(); if (msg) toast(msg); }
  });
  function clearSel() { document.getSelection()?.removeAllRanges(); selBar.hidden = true; pending = null; }

  function markEditor(id, isNew = false) {
    const m = chapterMarks(vid, b, c).find(x => x.id === id);
    if (!m) return;
    const d = openDialog(t('read.phraseTitle', 'Highlight & note'), `
      <blockquote class="quote ${m.style === 'ul' ? 'ul' : ''}" style="--c:var(--hl-${m.color})">“${esc(m.text)}” <cite>${esc(name)} ${c}:${m.v} · ${esc(ver.abbr)}</cite></blockquote>
      <div class="row" style="margin-bottom:12px" role="group" aria-label="${t('read.color', 'Colour')}">
        ${COLORS.map(col => `<button class="swatch" style="background:var(--hl-${col})" data-c="${col}" aria-pressed="${m.color === col}" aria-label="${colorName(col)}"></button>`).join('')}
        <span class="sep"></span>
        <button class="chip" data-st="hl" aria-pressed="${m.style !== 'ul'}">${icon('highlighter')} ${t('read.highlight', 'Highlight')}</button>
        <button class="chip" data-st="ul" aria-pressed="${m.style === 'ul'}">${icon('underline')} ${t('read.underline', 'Underline')}</button>
      </div>
      <label class="field">${t('read.myNote', 'My note')}<textarea class="input" id="mNote" rows="5" placeholder="${t('read.myNotePh', 'What does this word or phrase mean to you?')}">${esc(m.note || '')}</textarea></label>
      <label class="field">${t('read.tags', 'Tags')}<span class="hint">${t('read.tagsHint', 'Separate with commas, e.g. faith, promise')}</span><input class="input" id="mTags" value="${esc((m.tags || []).join(', '))}"></label>
      <div class="row between"><button class="btn ghost danger" id="mDel">${icon('trash')} ${t('common.delete', 'Delete')}</button><button class="btn primary" id="mSave">${icon('check')} ${t('common.save', 'Save')}</button></div>`, { onClose: () => refreshAll() });
    let color = m.color, style = m.style;
    $$('[data-c]', d).forEach(x => x.addEventListener('click', () => { color = x.dataset.c; $$('[data-c]', d).forEach(y => y.setAttribute('aria-pressed', y === x)); }));
    $$('[data-st]', d).forEach(x => x.addEventListener('click', () => { style = x.dataset.st; $$('[data-st]', d).forEach(y => y.setAttribute('aria-pressed', y === x)); }));
    $('#mDel', d).addEventListener('click', () => { removeMark(id); d.close(); toast(t('common.deleted', 'Deleted')); });
    $('#mSave', d).addEventListener('click', () => {
      updateMark(id, { color, style, note: $('#mNote', d).value.trim(), tags: $('#mTags', d).value.split(',').map(x => x.trim().replace(/^#/, '').toLowerCase()).filter(Boolean) });
      d.close(); toast(t('common.saved', 'Saved'));
    });
    if (isNew) setTimeout(() => $('#mNote', d).focus(), 50);
  }

  // ---------- verse selection ----------
  const selected = new Set();
  const sheet = $('#sheet', el);
  versesEl.addEventListener('click', e => {
    const mn = e.target.closest('.mnote'); if (mn) { e.stopPropagation(); markEditor(mn.dataset.mid); return; }
    const vn = e.target.closest('.vnote'); if (vn) { e.stopPropagation(); noteDialog([+vn.dataset.vnote]); return; }
    const pm = e.target.closest('mark.pm');
    if (pm && document.getSelection().isCollapsed) { markEditor(pm.dataset.mids.split(',').pop()); return; }
    if (!document.getSelection().isCollapsed) return;
    onVerse(e);
  });
  versesEl.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const mn = e.target.closest('.mnote'); if (mn) { e.preventDefault(); markEditor(mn.dataset.mid); return; }
    const vn = e.target.closest('.vnote'); if (vn) { e.preventDefault(); noteDialog([+vn.dataset.vnote]); return; }
    onVerse(e);
  });
  function onVerse(e) {
    const span = e.target.closest('.verse'); if (!span) return;
    e.preventDefault();
    const n = +span.dataset.v;
    if (selected.has(n)) selected.delete(n);
    else if (e.shiftKey && selected.size) { const lo = Math.min(n, ...selected), hi = Math.max(n, ...selected); for (let i = lo; i <= hi; i++) selected.add(i); }
    else selected.add(n);
    paintSelection();
  }
  function paintSelection() {
    $$('.verse', versesEl).forEach(sp => { const on = selected.has(+sp.dataset.v); sp.classList.toggle('sel', on); sp.setAttribute('aria-pressed', on); });
    if (!selected.size) { sheet.hidden = true; return; }
    const vs = [...selected].sort((a, z) => a - z);
    const refStr = rangeLabel(name, c, vs);
    const first = getNote(`${b}.${c}.${vs[0]}`);
    sheet.hidden = false;
    sheet.innerHTML = `
      <div class="sheet-head"><b>${esc(refStr)}</b><button class="icon-btn" data-act="close" aria-label="${t('common.close', 'Close')}">${icon('x')}</button></div>
      <div class="row" role="group" aria-label="${t('read.highlightVerse', 'Highlight verse')}">
        ${COLORS.map(col => `<button class="swatch" style="background:var(--hl-${col})" data-hl="${col}" aria-label="${t('read.highlight', 'Highlight')} ${colorName(col)}" aria-pressed="${first?.color === col}"></button>`).join('')}
        <button class="swatch none" data-hl="" aria-label="${t('read.removeHl', 'Remove highlight')}">${icon('x')}</button>
      </div>
      <div class="actions">
        <button class="act" data-act="note">${icon('pen')}<span>${t('read.tagNote', 'Tag & note')}</span></button>
        <button class="act" data-act="mem">${icon('brain')}<span>${t('read.memorize', 'Memorize')}</span></button>
        <button class="act" data-act="explain">${icon('spark')}<span>${t('read.explain', 'Explain')}</span></button>
        <button class="act" data-act="listen">${icon('speaker')}<span>${t('read.listen', 'Listen')}</span></button>
        <button class="act" data-act="copy">${icon('copy')}<span>${t('common.copy', 'Copy')}</span></button>
        <button class="act" data-act="image">${icon('image')}<span>${t('read.image', 'Image')}</span></button>
      </div>`;
  }
  const selText = () => [...selected].sort((a, z) => a - z).map(n => verses.find(x => x.v === n)?.text).join(' ');
  sheet.addEventListener('click', async e => {
    const btn = e.target.closest('button'); if (!btn) return;
    const vs = [...selected].sort((a, z) => a - z);
    const refStr = rangeLabel(name, c, vs);
    if (btn.dataset.hl !== undefined) { for (const n of vs) setNote(`${b}.${c}.${n}`, { color: btn.dataset.hl }); refreshAll(); return; }
    const act = btn.dataset.act;
    if (act === 'close') { selected.clear(); paintSelection(); }
    if (act === 'copy') { try { await navigator.clipboard.writeText(`“${selText()}” — ${refStr} (${ver.abbr})`); toast(t('common.copied', 'Copied')); } catch {} }
    if (act === 'mem') {
      const enRef = rangeLabelEn(c, vs);
      if (hasCard(enRef)) toast(t('mem.already', 'Already in your memory verses'));
      else { addCard(enRef, selText(), vid); toast(t('mem.added', '{ref} added to memory verses', { ref: refStr })); }
    }
    if (act === 'listen') readAloud(vs);
    if (act === 'image') verseImage(selText(), refStr, ver.abbr);
    if (act === 'note') noteDialog(vs);
    if (act === 'explain') {
      const d = openDialog(`${t('read.explain', 'Explain')} ${refStr}`, `<blockquote class="quote">${esc(selText())}</blockquote><div id="exBox"></div>`, { wide: true });
      aiMethods($('#exBox', d), async () => `${refStr} (${ver.abbr}): "${selText()}"\n\nChapter: ${BOOKS[b].name} ${c}.`);
      $('#exBox [data-m="simple"]', d)?.click();
    }
  });
  function rangeLabelEn(cc, vs) { return rangeLabel(BOOKS[b].name, cc, vs); }

  function noteDialog(vs) {
    if (!vs.length) return;
    const refStr = rangeLabel(name, c, vs);
    const key = `${b}.${c}.${vs[0]}`;
    const cur = getNote(key) || { tags: [], note: '' };
    const tagsSet = new Set(cur.tags || []);
    const known = allTags().map(x => x[0]);
    const suggestions = [...new Set([...known, ...t('read.tagSuggest', 'faith,hope,love,prayer,promise,question,comfort,wisdom,grace').split(',')])].slice(0, 16);
    const text = vs.map(n => verses.find(x => x.v === n)?.text).join(' ');
    const d = openDialog(`${t('read.tagNote', 'Tag & note')} — ${refStr}`, `
      <blockquote class="quote">${esc(text)}</blockquote>
      <label class="field">${t('read.tags', 'Tags')}<span class="hint">${t('read.tagsHint2', 'Tap to add, or type your own and press Enter.')}</span><input class="input" id="tagIn"></label>
      <div class="chips" id="tagChips" style="margin-bottom:14px"></div>
      <label class="field">${t('read.understand', 'What I understand')}<span class="hint">${t('read.understandHint', 'Explain it in your own words — one of the best ways to remember.')}</span>
        <textarea class="input" id="noteIn" rows="6">${esc(cur.note || '')}</textarea></label>
      <details class="soap"><summary>${t('read.soap', 'Need a prompt? Try S.O.A.P.')}</summary>
        <div class="chips" style="margin-top:8px">${[['S', t('soap.s', 'Scripture: the words that stand out to me are…')], ['O', t('soap.o', 'Observation: this passage shows…')], ['A', t('soap.a', 'Application: today I can…')], ['P', t('soap.p', 'Prayer: Lord, help me…')]].map(([k, v]) => `<button class="chip" data-prompt="${esc(v)}">${k} · ${esc(v.split(':')[0])}</button>`).join('')}</div>
      </details>
      <div class="row between" style="margin-top:14px"><button class="btn" id="noteAI">${icon('spark')} ${t('read.checkAI', 'Check my understanding')}</button><button class="btn primary" id="noteSave">${icon('check')} ${t('common.save', 'Save')}</button></div>
      <div id="noteAIout" style="margin-top:12px"></div>`, { wide: true });
    const drawChips = () => { $('#tagChips', d).innerHTML = [...new Set([...tagsSet, ...suggestions])].map(x => `<button class="chip" data-tag="${esc(x)}" aria-pressed="${tagsSet.has(x)}">#${esc(x)}</button>`).join(''); };
    drawChips();
    $('#tagChips', d).addEventListener('click', e => { const x = e.target.closest('[data-tag]')?.dataset.tag; if (!x) return; tagsSet.has(x) ? tagsSet.delete(x) : tagsSet.add(x); drawChips(); });
    const addTyped = inp => { inp.value.split(',').map(x => x.trim().replace(/^#/, '').toLowerCase()).filter(Boolean).forEach(x => tagsSet.add(x)); inp.value = ''; drawChips(); };
    $('#tagIn', d).addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTyped(e.target); } });
    $$('[data-prompt]', d).forEach(p => p.addEventListener('click', () => { const ta = $('#noteIn', d); ta.value += (ta.value && !ta.value.endsWith('\n') ? '\n' : '') + p.dataset.prompt + ' '; ta.focus(); }));
    $('#noteAI', d).addEventListener('click', () => {
      const mine = $('#noteIn', d).value.trim();
      if (!mine) { toast(t('read.writeFirst', 'Write what you understand first')); return; }
      runAI($('#noteAIout', d), [{ role: 'user', content: `I am studying ${refStr}: "${text}"\n\nHere is what I understand it to mean:\n"${mine}"\n\nKindly give feedback: what I understood well, anything I may have missed in context, and one question to help me go deeper. Be encouraging.` }]);
    });
    $('#noteSave', d).addEventListener('click', () => {
      addTyped($('#tagIn', d));
      setNote(key, { tags: [...tagsSet], note: $('#noteIn', d).value.trim(), v2: vs.length > 1 ? vs[vs.length - 1] : undefined, ref: rangeLabelEn(c, vs) });
      d.close(); refreshAll(); toast(t('common.saved', 'Saved'));
    });
  }

  // ---------- read aloud ----------
  const listenBtn = $('#listen', el);
  let reading = false;
  function stopReading() {
    reading = false; speech.stop();
    $$('.verse.reading', versesEl).forEach(x => x.classList.remove('reading'));
    listenBtn.setAttribute('aria-pressed', 'false');
  }
  function readAloud(list) {
    if (!speech.supported) { toast(t('read.noTTS', 'Read-aloud is not supported in this browser')); return; }
    stopReading(); reading = true; listenBtn.setAttribute('aria-pressed', 'true');
    const set = getSettings(); let i = 0;
    const step = () => {
      if (!reading) return;
      $$('.verse.reading', versesEl).forEach(x => x.classList.remove('reading'));
      if (i >= list.length) { stopReading(); return; }
      const n = list[i++];
      const sp = $(`.verse[data-v="${n}"]`, versesEl);
      sp?.classList.add('reading');
      sp?.scrollIntoView({ block: 'center', behavior: set.reduceMotion ? 'auto' : 'smooth' });
      speech.speak(verses.find(x => x.v === n).text, { rate: set.ttsRate, voice: set.ttsVoice, lang: ver.lang, onend: step });
    };
    step();
  }
  listenBtn.addEventListener('click', () => reading ? stopReading() : readAloud(selected.size ? [...selected].sort((a, z) => a - z) : verses.map(x => x.v)));

  // ---------- keyboard ----------
  const onKey = e => {
    if (e.target.closest('input, textarea, select, dialog, .study-panel')) return;
    if (e.key === 'ArrowLeft' && prev) location.hash = `#/read/${prev[0]}/${prev[1]}`;
    if (e.key === 'ArrowRight' && next) location.hash = `#/read/${next[0]}/${next[1]}`;
  };
  document.addEventListener('keydown', onKey);

  await loadCompare();
  if (focusV) { selected.add(focusV); paintSelection(); setTimeout(() => flashVerse(focusV), 60); }

  return () => {
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('selectionchange', onSelChange);
    window.removeEventListener('lamp:data', onData);
    stopReading();
  };
}

function rangeLabel(name, c, vs) {
  if (vs.length === 1) return `${name} ${c}:${vs[0]}`;
  const contiguous = vs.every((n, i) => i === 0 || n === vs[i - 1] + 1);
  return contiguous ? `${name} ${c}:${vs[0]}-${vs[vs.length - 1]}` : `${name} ${c}:${vs.join(',')}`;
}
function sessionGet(k) { try { return sessionStorage.getItem(k); } catch { return null; } }
function sessionSet(k, v) { try { sessionStorage.setItem(k, v); } catch {} }

// Fill-in-the-missing-word quiz built from the chapter text (no AI needed).
const STOP = new Set('that which there their these those shall unto them with from have were what when then they this thou thee thy your into upon also said hath will saith before after because even every pour avec dans leur elle sont mais comme tout quand para como pero porque cuando todo esta este também quando porque sobre'.split(' '));
export function chapterQuiz(label, verses) {
  const words = w => w.split(/\s+/);
  const clean = w => w.replace(/[^\p{L}'’-]/gu, '');
  const pool = [...new Set(verses.flatMap(v => words(v.text).map(clean)).filter(w => w.length > 4 && !STOP.has(w.toLowerCase())))];
  const candidates = shuffle(verses.filter(v => words(v.text).length >= 8)).slice(0, 5);
  if (candidates.length < 2 || pool.length < 4) { toast(t('quiz.tooShort', 'This chapter is too short for a quiz')); return; }
  const qs = candidates.map(v => {
    const ws = words(v.text);
    const scored = ws.map((w, i) => ({ w: clean(w), i })).filter(x => x.w.length > 4 && !STOP.has(x.w.toLowerCase()));
    const target = scored.sort((a, z) => z.w.length - a.w.length)[Math.floor(Math.random() * Math.min(3, scored.length))];
    const opts = shuffle([target.w, ...shuffle(pool.filter(p => p.toLowerCase() !== target.w.toLowerCase())).slice(0, 3)]);
    const shown = ws.map((w, i) => i === target.i ? w.replace(clean(w), '_____') : w).join(' ');
    return { v: v.v, shown, answer: target.w, opts };
  });
  let i = 0, score = 0;
  const d = openDialog(`${t('read.chQuiz', 'Chapter quiz')} — ${label}`, '<div id="cq"></div>', { wide: true });
  const box = $('#cq', d);
  const draw = () => {
    if (i >= qs.length) {
      box.innerHTML = `<div class="result-card"><div class="big-ico">${icon(score === qs.length ? 'trophy' : 'target')}</div><h2>${t('quiz.score', '{n} of {total} correct', { n: score, total: qs.length })}</h2><p>${score === qs.length ? t('quiz.perfect', 'Perfect!') : t('quiz.again', 'Read the chapter again and try once more — repetition builds memory.')}</p><button class="btn primary" data-close>${t('common.done', 'Done')}</button></div>`;
      if (score) markActivity('quiz', score * 2);
      return;
    }
    const q = qs[i];
    box.innerHTML = `<p class="muted small">${t('quiz.qOf', 'Question {n} of {total}', { n: i + 1, total: qs.length })} · ${t('quiz.verse', 'verse')} ${q.v}</p><p class="q-text serif">${esc(q.shown)}</p>
      <div class="options">${q.opts.map(o => `<button class="option" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><div id="cqf" aria-live="polite"></div>`;
    $$('.option', box).forEach(btn => btn.addEventListener('click', () => {
      const ok = btn.dataset.o === q.answer;
      if (ok) score++;
      $$('.option', box).forEach(x => { x.disabled = true; if (x.dataset.o === q.answer) x.classList.add('right'); });
      if (!ok) btn.classList.add('wrong');
      $('#cqf', box).innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}">${icon(ok ? 'check' : 'x')} <span>${ok ? t('quiz.correct', 'Correct!') : t('quiz.answerIs', 'The answer is “{a}”.', { a: esc(q.answer) })}</span></div><button class="btn primary" id="cqn">${t('common.next', 'Next')} ${icon('chevR')}</button>`;
      $('#cqn', box).focus();
      $('#cqn', box).addEventListener('click', () => { i++; draw(); });
    }));
  };
  draw();
}
