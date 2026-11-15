import { $, $$, esc, icon, toast } from '../util.js';
import { BOOKS, bookName, getVersion, localRef } from '../bible.js';
import { getNotes, setNote, allTags, getMarks, removeMark, allJournal, getStudies } from '../store.js';
import { t, fmtDate } from '../i18n.js';

export function render(el, { query }) {
  let tag = query.get('tag') || '';
  let q = '';
  let kind = query.get('kind') || 'all';

  const collect = () => {
    const items = [];
    for (const [k, n] of Object.entries(getNotes())) {
      const [b, c, v] = k.split('.').map(Number);
      items.push({ kind: n.note || n.tags?.length ? 'note' : 'hl', key: k, b, c, v, ref: `${bookName(b)} ${c}:${v}${n.v2 ? '-' + n.v2 : ''}`, text: n.text || '', note: n.note || '', tags: n.tags || [], color: n.color, updated: n.updated || 0 });
    }
    const seen = new Set();
    for (const m of getMarks()) {
      if (m.group) { if (seen.has(m.group)) continue; seen.add(m.group); }
      items.push({ kind: 'phrase', id: m.id, b: m.b, c: m.c, v: m.v, ref: `${bookName(m.b)} ${m.c}:${m.v}`, ver: getVersion(m.ver).abbr, text: m.text, note: m.note || '', tags: m.tags || [], color: m.color, style: m.style, updated: m.updated || m.created || 0 });
    }
    for (const [k, txt] of Object.entries(allJournal())) {
      const [b, c] = k.split('.').map(Number);
      items.push({ kind: 'journal', b, c, v: 1, ref: `${bookName(b)} ${c}`, note: txt, tags: [], updated: 0 });
    }
    for (const s of getStudies()) items.push({ kind: 'study', id: s.id, method: s.method, ref: localRef(s.ref), sref: s.ref, note: Object.values(s.answers || {}).filter(Boolean).join('\n\n'), tags: [], updated: s.updated || 0 });
    return items;
  };

  const draw = () => {
    const all = collect();
    let list = all;
    if (kind !== 'all') list = list.filter(x => kind === 'notes' ? (x.kind === 'note' || (x.kind === 'phrase' && x.note)) : kind === 'hl' ? (x.kind === 'hl' || x.kind === 'phrase') : x.kind === kind);
    if (tag) list = list.filter(x => x.tags.includes(tag));
    if (q) list = list.filter(x => (x.ref + ' ' + x.note + ' ' + x.text + ' ' + x.tags.join(' ')).toLowerCase().includes(q.toLowerCase()));
    list.sort((a, b) => (b.updated || 0) - (a.updated || 0) || a.b - b.b || a.c - b.c || a.v - b.v);
    const tags = allTags();
    const kinds = [['all', t('notes.all', 'All')], ['notes', t('notes.notes', 'Notes')], ['hl', t('notes.hl', 'Highlights')], ['journal', t('notes.journal', 'Chapter journals')], ['study', t('notes.studies', 'Studies')]];

    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">${t('navg.remember', 'Remember')}</p><h1>${t('nav.notes', 'My study Bible')}</h1><p>${t('notes.intro', 'Everything you have highlighted, underlined, tagged and written. Saved privately on this device.')}</p></div>
        <button class="btn" id="exportMd">${icon('download')} ${t('notes.export', 'Download as text')}</button></div>
      <div class="card">
        <div class="seg-tabs" role="tablist">${kinds.map(([id, l]) => `<button role="tab" data-kind="${id}" aria-selected="${id === kind}">${esc(l)}</button>`).join('')}</div>
        <label class="sr-only" for="nq">${t('notes.search', 'Search your notes')}</label>
        <input class="input" id="nq" placeholder="${t('notes.search', 'Search your notes')}…" value="${esc(q)}" style="margin:12px 0">
        ${tags.length ? `<div class="chips" role="group" aria-label="${t('read.tags', 'Tags')}"><button class="chip" data-tag="" aria-pressed="${!tag}">${t('notes.allTags', 'All tags')}</button>${tags.map(([x, n]) => `<button class="chip" data-tag="${esc(x)}" aria-pressed="${x === tag}">#${esc(x)} <span class="muted">${n}</span></button>`).join('')}</div>` : ''}
      </div>
      <div class="stack" style="margin-top:14px">${list.length ? list.map(item).join('') : `<div class="empty-state">${icon('pen', 'xl')}<h3>${all.length ? t('notes.noMatch', 'Nothing matches') : t('notes.emptyT', 'Your study Bible is empty')}</h3><p>${t('notes.empty', 'While reading, select words to highlight them or tap a verse to write what you understand.')}</p><a class="btn primary" href="#/read">${icon('book')} ${t('home.startReading', 'Start reading')}</a></div>`}</div>`;

    $('#nq', el).addEventListener('input', e => { q = e.target.value; const pos = e.target.selectionStart; draw(); const i = $('#nq', el); i.focus(); i.setSelectionRange(pos, pos); });
    $$('[data-kind]', el).forEach(b => b.addEventListener('click', () => { kind = b.dataset.kind; draw(); }));
    $$('[data-tag]', el).forEach(b => b.addEventListener('click', () => { tag = b.dataset.tag; draw(); }));
    $$('[data-del-note]', el).forEach(b => b.addEventListener('click', () => { if (confirm(t('notes.confirm', 'Delete this?'))) { setNote(b.dataset.delNote, { note: '', tags: [], color: '' }); toast(t('common.deleted', 'Deleted')); draw(); } }));
    $$('[data-del-mark]', el).forEach(b => b.addEventListener('click', () => { if (confirm(t('notes.confirm', 'Delete this?'))) { removeMark(b.dataset.delMark); toast(t('common.deleted', 'Deleted')); draw(); } }));
    $('#exportMd', el).addEventListener('click', () => {
      const txt = list.map(n => `## ${n.ref}${n.ver ? ' (' + n.ver + ')' : ''}\n${n.text ? '> ' + n.text + '\n' : ''}${n.tags.length ? n.tags.map(x => '#' + x).join(' ') + '\n' : ''}${n.note ? '\n' + n.note + '\n' : ''}`).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([`# ${t('nav.notes', 'My study Bible')}\n\n${txt}`], { type: 'text/markdown' }));
      a.download = 'my-study-bible.md'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
  };

  function item(n) {
    const href = n.kind === 'study' ? `#/study/guide?method=${n.method}&ref=${encodeURIComponent(n.sref)}&id=${n.id}` : `#/read/${n.b}/${n.c}${n.kind === 'journal' ? '' : '/' + n.v}`;
    const label = { note: t('notes.note', 'Note'), hl: t('notes.hl1', 'Highlight'), phrase: n.style === 'ul' ? t('read.underline', 'Underline') : t('notes.phrase', 'Phrase'), journal: t('read.journal', 'Chapter journal'), study: t('notes.study', 'Study') }[n.kind];
    return `<article class="card note-item">
      <div class="row between"><a href="${href}" class="note-ref"><b>${esc(n.ref)}</b></a>
        <span class="row"><span class="tag subtle">${esc(label)}${n.ver ? ' · ' + esc(n.ver) : ''}</span>
        ${n.kind === 'note' || n.kind === 'hl' ? `<button class="icon-btn sm" data-del-note="${n.key}" aria-label="${t('common.delete', 'Delete')}">${icon('trash')}</button>` : ''}
        ${n.kind === 'phrase' ? `<button class="icon-btn sm" data-del-mark="${n.id}" aria-label="${t('common.delete', 'Delete')}">${icon('trash')}</button>` : ''}</span></div>
      ${n.text ? `<blockquote class="quote ${n.style === 'ul' ? 'ul' : ''}" style="--c:var(--hl-${n.color || 'yellow'})">${esc(n.text)}</blockquote>` : ''}
      ${n.tags.length ? `<div class="chips" style="margin-bottom:6px">${n.tags.map(x => `<button class="tag" data-tag="${esc(x)}">#${esc(x)}</button>`).join('')}</div>` : ''}
      ${n.note ? `<div class="mine">${esc(n.note.length > 600 ? n.note.slice(0, 600) + '…' : n.note)}</div>` : ''}
      ${n.updated ? `<p class="muted small" style="margin:8px 0 0">${fmtDate(n.updated)}</p>` : ''}
    </article>`;
  }
  draw();
}
