// Learning path: learn a Bible book section by section (Duolingo-style),
// plus a "big story" track through the whole Bible.
import { $, $$, esc, icon, toast, announce, shuffle, speech } from '../util.js';
import { load, save, getProgress, markActivity, streak, todayXP, levelInfo, getSettings, setSettings, getNotes, getMarks, getStudies } from '../store.js';
import { getCards, level } from '../srs.js';
import { BOOKS, passageText, parseRef, refHash, localRef, currentVersion, bookName, getVersion } from '../bible.js';
import { UNITS, LESSONS_PER_UNIT, unitTitle, unitSub, lessonTitle, buildLesson, BADGES } from '../learn-data.js';
import { RECOMMENDED, bookText, sections, secLabel, passageLesson, lessonVersion } from '../learn-books.js';
import { getProfile, setProfile, currentAge } from '../profile.js';
import { runAI } from '../components.js';
import { t } from '../i18n.js';

const STORY = UNITS.filter(u => !u.skills);
const getLearn = () => ({ done: {}, attempts: {}, books: {}, ...load('learn', {}) });
const key = (u, i) => `${u}.${i}`;
const lvl = () => currentAge().level;

export function stats() {
  const L = getLearn(), p = getProgress(), cards = getCards();
  return {
    lessons: Object.keys(L.done).length,
    units: STORY.filter(u => L.done[key(u.id, LESSONS_PER_UNIT - 1)]).length + Object.values(L.books).filter(x => x.done >= x.total && x.total).length,
    booksDone: Object.values(L.books).filter(x => x.done >= x.total && x.total).length,
    streak: streak(), xp: p.xp || 0,
    mastered: cards.filter(c => level(c).n === 3).length,
    read: Object.keys(p.read).length,
    notes: Object.keys(getNotes()).length + getMarks().length,
    studies: getStudies().length,
  };
}
export const earnedBadges = () => { const s = stats(); return BADGES.filter(b => b.test(s)); };
export const currentBook = () => { const p = getProfile(); return p.learnBook ?? currentAge().book; };

export function render(el, { parts }) {
  const [a, b, c] = parts;
  if (a === 'badges') return badgesView(el);
  if (a === 'books') return bookPicker(el);
  if (a === 'story') return storyPath(el);
  if (a === 'lesson') return storyLesson(el, b, +c);
  if (a === 'sec') return sectionLesson(el, +b, +c, false);
  if (a === 'rev') return sectionLesson(el, +b, +c, true);
  if (a === 'book' && BOOKS[+b]) { setProfile({ learnBook: +b }); }
  return bookPath(el, a === 'book' ? +b : currentBook());
}

// ---------- shared UI ----------
function tabsHtml(active) {
  return `<div class="seg-tabs path-tabs" role="tablist">
    <a role="tab" href="#/learn" aria-selected="${active === 'books'}">${icon('book')} ${t('lp.books', 'Books')}</a>
    <a role="tab" href="#/learn/story" aria-selected="${active === 'story'}">${icon('clock')} ${t('lp.story', 'The big story')}</a></div>`;
}
function sidebar() {
  const s = getSettings(), xp = getProgress().xp || 0, lv = levelInfo(xp), tx = todayXP(), goal = s.dailyGoal;
  const pct = Math.min(1, tx / goal); const earned = earnedBadges();
  return `
    <div class="card goal-card"><div class="ring" style="--p:${pct}"><span>${Math.round(pct * 100)}%</span></div>
      <div><b>${t('learn.daily', 'Daily goal')}</b><p class="muted small">${t('learn.xpToday', '{x} / {g} XP today', { x: tx, g: goal })}</p>
      <select class="pill small" id="goalSel" aria-label="${t('learn.setGoal', 'Set daily goal')}">${[10, 20, 30, 50].map(g => `<option value="${g}" ${g === goal ? 'selected' : ''}>${t('learn.goalN', '{n} XP / day', { n: g })}</option>`).join('')}</select></div></div>
    <div class="card stat-row"><div>${icon('flame')}<b>${streak()}</b><span>${t('learn.streak', 'day streak')}</span></div><div>${icon('bolt')}<b>${xp}</b><span>${t('learn.totalXP', 'total XP')}</span></div><div>${icon('crown')}<b>${lv.lvl}</b><span>${t('learn.level', 'level')}</span></div></div>
    <div class="card"><div class="progress"><i style="width:${lv.pct * 100}%"></i></div><p class="muted small" style="margin:6px 0 0">${t('learn.toNext', '{n} XP to level {l}', { n: lv.next - xp, l: lv.lvl + 1 })}</p></div>
    <a class="card badges-mini" href="#/learn/badges"><b>${t('learn.badges', 'Achievements')}</b><div class="badge-row">${BADGES.slice(0, 6).map(b => `<span class="bdg ${earned.includes(b) ? 'on' : ''}">${icon(b.icon)}</span>`).join('')}</div><span class="muted small">${t('learn.earned', '{n} of {t} earned', { n: earned.length, t: BADGES.length })}</span></a>
    <a class="card tile mini" href="#/quiz"><span class="ico-wrap">${icon('quiz')}</span><div><b>${t('nav.quiz', 'Quiz')}</b><p>${t('lp.quizSide', 'Daily quiz, speed round and more')}</p></div></a>`;
}
const bindSidebar = (el, redraw) => $('#goalSel', el)?.addEventListener('change', e => { setSettings({ dailyGoal: +e.target.value }); redraw(); });
function node({ href, cls, ic, label, current, color }) {
  return `<div class="node-wrap" style="--off:${node.off = ((node.off ?? -1) + 1) % 8, [0, 1, 2, 1, 0, -1, -2, -1][node.off]}">
    ${current ? `<span class="start-bubble">${t('learn.start', 'Start')}</span>` : ''}
    <a class="node ${cls} ${current ? 'current' : ''}" ${href ? `href="${href}"` : 'aria-disabled="true"'} style="--uc:${color}" aria-label="${esc(label)}">${icon(ic)}</a>
    <span class="node-label">${esc(label)}</span></div>`;
}

// ---------- books track ----------
async function bookPath(el, b) {
  el.innerHTML = `<div class="empty"><span class="spinner"></span></div>`;
  const book = await bookText(b);
  const secs = sections(book, lvl());
  const L = getLearn();
  const done = i => L.done[`b${b}.${i}`];
  const color = BOOKS[b].t === 'OT' ? '#9a4a1c' : '#1f6f8b';
  const total = secs.length, doneN = secs.filter((_, i) => done(i)).length;
  let first = secs.findIndex((_, i) => !done(i)); if (first < 0) first = total;
  const curCh = first < total ? secs[first].c : BOOKS[b].ch;
  let showAll = BOOKS[b].ch <= 8;
  const draw = () => {
    node.off = -1;
    const lastCh = showAll ? BOOKS[b].ch : Math.min(BOOKS[b].ch, curCh + 2);
    let html = '';
    for (let c = 1; c <= lastCh; c++) {
      const idxs = secs.map((s, i) => [s, i]).filter(([s]) => s.c === c);
      const chDone = idxs.filter(([, i]) => done(i)).length;
      const nodes = idxs.map(([s, i]) => {
        const isDone = done(i), open = i === 0 || done(i - 1) || isDone;
        return node({ href: open ? `#/learn/sec/${b}/${i}` : null, cls: isDone ? (isDone.perfect ? 'done gold' : 'done') : open ? 'open' : 'locked', ic: !open ? 'lock' : isDone ? 'check' : 'book', label: `${s.v1}–${s.v2}`, current: i === first, color });
      }).join('');
      const revDone = L.done[`b${b}.r${c}`], revOpen = chDone === idxs.length && idxs.length > 1;
      const rev = idxs.length > 1 ? node({ href: revOpen ? `#/learn/rev/${b}/${c}` : null, cls: revDone ? 'done gold' : revOpen ? 'open' : 'locked', ic: revOpen || revDone ? 'trophy' : 'lock', label: t('lp.review', 'Chapter review'), color }) : '';
      html += `<section class="unit"><header class="unit-head" style="--uc:${color}"><div><p class="eyebrow">${t('lp.chapterOf', 'Chapter {c} of {n}', { c, n: BOOKS[b].ch })} · ${chDone}/${idxs.length}</p><h2>${esc(bookName(b))} ${c}</h2><p>${t('lp.sections', '{n} short sections', { n: idxs.length })}</p></div><a class="btn small light" href="#/read/${b}/${c}">${icon('book')} ${t('lp.readCh', 'Read')}</a></header><div class="nodes">${nodes}${rev}</div></section>`;
    }
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">${t('navs.learn', 'Learn')}</p><h1>${t('lp.learnBook', 'Learn {book}', { book: esc(bookName(b)) })}</h1><p>${t('lp.intro', 'Go through the book one short section at a time: read it, then answer a few questions about it.')}</p></div>
        <a class="btn" href="#/learn/books">${icon('book')} ${t('lp.change', 'Choose another book')}</a></div>
      ${tabsHtml('books')}
      <div class="card book-progress"><div class="row between"><b>${esc(bookName(b))}</b><span class="muted small">${t('lp.progress', '{d} of {t} sections', { d: doneN, t: total })} · ${esc(getVersion(lessonVersion()).abbr)}</span></div><div class="progress"><i style="width:${(doneN / total) * 100}%"></i></div></div>
      <div class="learn-layout"><div class="path">${html}${!showAll && lastCh < BOOKS[b].ch ? `<div class="center"><button class="btn" id="more">${t('lp.showAll', 'Show all {n} chapters', { n: BOOKS[b].ch })}</button></div>` : ''}</div><aside class="learn-side">${sidebar()}</aside></div>`;
    $('#more', el)?.addEventListener('click', () => { showAll = true; draw(); });
    bindSidebar(el, draw);
    setTimeout(() => $('.node.current', el)?.scrollIntoView({ block: 'center' }), 50);
  };
  draw();
}

function bookPicker(el) {
  const L = getLearn(); const age = currentAge(); const rec = RECOMMENDED[age.id] || RECOMMENDED.adult;
  const card = i => { const pr = L.books[i]; const pct = pr?.total ? pr.done / pr.total : 0; return `<a class="book-card" href="#/learn/book/${i}"><b>${esc(bookName(i))}</b><small>${t('read.chapters', 'Chapters')}: ${BOOKS[i].ch}</small>${pct ? `<span class="plan-prog"><i style="width:${pct * 100}%"></i></span>` : ''}</a>`; };
  el.innerHTML = `<a class="back" href="#/learn">${icon('chevL')} ${t('navs.learn', 'Learn')}</a>
    <div class="page-head"><div><h1>${t('lp.pick', 'Which book do you want to learn?')}</h1><p>${t('lp.pickSub', 'Short books are a great place to start.')}</p></div></div>
    <h2 class="section-title">${t('lp.rec', 'Recommended for you')}</h2><div class="book-cards">${rec.map(card).join('')}</div>
    <h2 class="section-title">${t('read.nt', 'New Testament')}</h2><div class="book-cards">${BOOKS.map((x, i) => x.t === 'NT' ? card(i) : '').join('')}</div>
    <h2 class="section-title">${t('read.ot', 'Old Testament')}</h2><div class="book-cards">${BOOKS.map((x, i) => x.t === 'OT' ? card(i) : '').join('')}</div>`;
}

async function sectionLesson(el, b, idxOrC, review) {
  el.innerHTML = `<div class="empty"><span class="spinner"></span></div>`;
  const book = await bookText(b);
  const secs = sections(book, lvl());
  const L = getLearn();
  let sec, k, title;
  if (review) {
    const c = idxOrC; const chSecs = secs.filter(s => s.c === c);
    sec = { c, i: 0, v1: 1, v2: chSecs[chSecs.length - 1].v2, of: 1 }; k = `b${b}.r${c}`; title = `${bookName(b)} ${c}`;
  } else {
    sec = secs[idxOrC]; if (!sec) { location.hash = '#/learn'; return; }
    if (idxOrC > 0 && !L.done[`b${b}.${idxOrC - 1}`] && !L.done[`b${b}.${idxOrC}`]) { location.hash = '#/learn'; return; }
    k = `b${b}.${idxOrC}`; title = secLabel(b, sec);
  }
  const attempt = (L.attempts[k] || 0) + 1;
  const exercises = passageLesson({ b, sec, book, level: lvl(), seed: attempt, review });
  return player(el, {
    exercises, back: '#/learn', isReview: review,
    passageRef: `${BOOKS[b].name} ${sec.c}:${sec.v1}-${sec.v2}`,
    onFinish: perfect => {
      const L2 = getLearn();
      L2.done[k] = { at: Date.now(), perfect: perfect || L2.done[k]?.perfect };
      L2.attempts[k] = attempt;
      L2.books[b] = { done: secs.filter((_, i) => L2.done[`b${b}.${i}`]).length, total: secs.length };
      save('learn', L2);
    },
    finishLinks: () => {
      const next = review ? secs.findIndex(s => s.c === sec.c + 1) : idxOrC + 1;
      return next >= 0 && next < secs.length && !review ? `<a class="btn" href="#/learn/sec/${b}/${next}">${t('lp.nextSec', 'Next section')} ${icon('chevR')}</a>` : '';
    },
  });
}

// ---------- big story track ----------
function isUnlocked(ui, li) {
  if (ui === 0 && li === 0) return true;
  const L = getLearn();
  if (li === 0) return !!L.done[key(STORY[ui - 1].id, 0)];
  return !!L.done[key(STORY[ui].id, li - 1)];
}
function storyPath(el) {
  const L = getLearn(); let firstOpen = false; node.off = -1;
  const units = STORY.map((u, ui) => {
    const nodes = Array.from({ length: LESSONS_PER_UNIT }, (_, li) => {
      const done = L.done[key(u.id, li)], open = isUnlocked(ui, li);
      const current = open && !done && !firstOpen; if (current) firstOpen = true;
      const isReview = li === LESSONS_PER_UNIT - 1;
      return node({ href: open ? `#/learn/lesson/${u.id}/${li}` : null, cls: done ? (done.perfect ? 'done gold' : 'done') : open ? 'open' : 'locked', ic: !open ? 'lock' : isReview ? 'trophy' : done ? 'check' : ['book', 'people', 'clock', 'brain'][li], label: lessonTitle(u, li), current, color: u.color });
    }).join('');
    const dc = Array.from({ length: LESSONS_PER_UNIT }, (_, li) => L.done[key(u.id, li)]).filter(Boolean).length;
    return `<section class="unit"><header class="unit-head" style="--uc:${u.color}"><div><p class="eyebrow">${t('learn.unit', 'Unit {n}', { n: ui + 1 })} · ${dc}/${LESSONS_PER_UNIT}</p><h2>${esc(unitTitle(u))}</h2><p>${esc(unitSub(u))}</p></div><span class="unit-ico">${icon(u.icon)}</span></header><div class="nodes">${nodes}</div></section>`;
  }).join('');
  el.innerHTML = `<div class="page-head"><div><p class="eyebrow">${t('navs.learn', 'Learn')}</p><h1>${t('lp.story', 'The big story')}</h1><p>${t('lp.storyIntro', 'The whole Bible story in order — people, places and events from Creation to the early church.')}</p></div></div>
    ${tabsHtml('story')}<div class="learn-layout"><div class="path">${units}</div><aside class="learn-side">${sidebar()}</aside></div>`;
  bindSidebar(el, () => storyPath(el));
  setTimeout(() => $('.node.current', el)?.scrollIntoView({ block: 'center' }), 50);
}
async function storyLesson(el, unitId, li) {
  const ui = STORY.findIndex(u => u.id === unitId); const u = STORY[ui];
  if (!u || !isUnlocked(ui, li)) { location.hash = '#/learn/story'; return; }
  const L = getLearn(); const attempt = (L.attempts[key(u.id, li)] || 0) + 1;
  let verseText = ''; try { verseText = await passageText(u.verse, currentVersion()); } catch {}
  return player(el, {
    exercises: buildLesson(u, li, attempt, verseText), back: '#/learn/story', isReview: li === LESSONS_PER_UNIT - 1,
    onFinish: perfect => { const L2 = getLearn(); const k = key(u.id, li); L2.done[k] = { at: Date.now(), perfect: perfect || L2.done[k]?.perfect }; L2.attempts[k] = attempt; save('learn', L2); },
  });
}

function badgesView(el) {
  const earned = earnedBadges();
  el.innerHTML = `<a class="back" href="#/learn">${icon('chevL')} ${t('navs.learn', 'Learn')}</a>
    <div class="page-head"><div><h1>${t('learn.badges', 'Achievements')}</h1><p>${t('learn.earned', '{n} of {t} earned', { n: earned.length, t: BADGES.length })}</p></div></div>
    <div class="grid">${BADGES.map(b => `<div class="card badge-card ${earned.includes(b) ? 'on' : ''}"><span class="bdg big ${earned.includes(b) ? 'on' : ''}">${icon(b.icon)}</span><div><b>${esc(b.name())}</b><p class="muted small">${esc(b.desc())}</p></div></div>`).join('')}</div>`;
}

// ---------- lesson player ----------
function player(el, { exercises, back, onFinish, isReview, finishLinks, passageRef }) {
  let queue = [...exercises];
  const total = queue.filter(x => x.type !== 'card' && x.type !== 'passage').length;
  let answered = 0, firstTry = 0, idx = 0;
  const wrongOnce = new Set();
  const started = Date.now();
  const before = earnedBadges().map(b => b.id);
  el.innerHTML = `<div class="lesson"><div class="play-head"><a class="icon-btn" href="${back}" aria-label="${t('learn.quit', 'Quit lesson')}">${icon('x')}</a><div class="progress grow"><i id="lp"></i></div></div><div class="lesson-body" id="lb"></div><div class="lesson-foot" id="lf"></div></div>`;
  const lb = $('#lb', el), lf = $('#lf', el), lp = $('#lp', el);
  const show = () => {
    lp.style.width = `${Math.min(100, (answered / Math.max(1, total)) * 100)}%`;
    if (idx >= queue.length) return finish();
    const ex = queue[idx];
    lf.className = 'lesson-foot';
    let getAnswer = null, checkLabel = t('learn.check', 'Check');
    if (ex.type === 'card' || ex.type === 'passage') {
      lb.innerHTML = ex.type === 'card'
        ? `<div class="teach-card"><span class="teach-ico">${icon(ex.icon || 'info')}</span><h2>${esc(ex.title)}</h2><p>${esc(ex.body)}</p></div>`
        : `<div class="passage-card"><p class="eyebrow">${icon('book')} ${t('lp.readFirst', 'Read this section')}</p><h2>${esc(ex.title)}</h2><div class="serif passage-text">${ex.verses.map(v => `<p><sup class="vn">${v.v}</sup>${esc(v.text)}</p>`).join('')}</div><button class="btn small" id="hearP">${icon('speaker')} ${t('read.listen', 'Listen')}</button></div>`;
      lf.innerHTML = `<button class="btn primary wide" id="go">${ex.type === 'passage' ? t('lp.ready', 'I’ve read it — start questions') : t('learn.continue', 'Continue')}</button>`;
      $('#hearP', el)?.addEventListener('click', () => { const s = getSettings(); speech.stop(); speech.speak(ex.verses.map(v => v.text).join(' '), { rate: s.ttsRate, voice: s.ttsVoice, lang: getVersion(lessonVersion()).lang }); });
      $('#go', el).focus();
      $('#go', el).addEventListener('click', () => { speech.stop(); idx++; show(); });
      return;
    }
    if (ex.type === 'mc' || ex.type === 'fill') {
      lb.innerHTML = `<h2 class="ex-q" style="white-space:pre-line">${esc(ex.q)}</h2>${ex.text ? `<p class="serif ex-verse">${esc(ex.text)}</p>` : ''}<div class="options">${ex.opts.map((o, i) => `<button class="option" data-o="${esc(o)}"><kbd>${i + 1}</kbd> ${esc(o)}</button>`).join('')}</div>`;
      let sel = null;
      $$('.option', lb).forEach(b => b.addEventListener('click', () => { sel = b.dataset.o; $$('.option', lb).forEach(x => x.classList.toggle('picked', x === b)); enable(); }));
      getAnswer = () => ({ ok: sel === ex.answer, right: ex.answer });
    }
    if (ex.type === 'tf') {
      lb.innerHTML = `<p class="eyebrow">${t('learn.tf', 'True or false?')}</p><h2 class="ex-q" style="white-space:pre-line">${esc(ex.q)}</h2><div class="options two"><button class="option" data-v="1">${icon('check')} ${t('learn.true', 'True')}</button><button class="option" data-v="0">${icon('x')} ${t('learn.false', 'False')}</button></div>`;
      let sel = null;
      $$('.option', lb).forEach(b => b.addEventListener('click', () => { sel = b.dataset.v === '1'; $$('.option', lb).forEach(x => x.classList.toggle('picked', x === b)); enable(); }));
      getAnswer = () => ({ ok: sel === ex.answer, right: ex.answer ? t('learn.true', 'True') : t('learn.false', 'False') });
    }
    if (ex.type === 'order' || ex.type === 'build') {
      const items = ex.type === 'order' ? ex.items : ex.words;
      const bank = shuffle(items.map((w, k) => ({ w, k }))); let picked = [];
      lb.innerHTML = `<h2 class="ex-q">${esc(ex.q)}</h2><div class="answer-line ${ex.type === 'order' ? 'col' : ''}" id="al"></div><div class="bank ${ex.type === 'order' ? 'col' : ''}" id="bk">${bank.map(x => `<button class="wchip" data-k="${x.k}">${esc(x.w)}</button>`).join('')}</div>`;
      const al = $('#al', lb), bk = $('#bk', lb);
      bk.addEventListener('click', e => { const b = e.target.closest('.wchip'); if (!b || b.disabled) return; picked.push(+b.dataset.k); b.disabled = true; al.insertAdjacentHTML('beforeend', `<button class="wchip placed" data-k="${b.dataset.k}">${b.innerHTML}</button>`); picked.length ? enable() : disable(); });
      al.addEventListener('click', e => { const b = e.target.closest('.wchip'); if (!b) return; picked = picked.filter(k => k !== +b.dataset.k); b.remove(); bk.querySelector(`[data-k="${b.dataset.k}"]`).disabled = false; picked.length ? enable() : disable(); });
      getAnswer = () => ({ ok: picked.length === items.length && picked.every((k, i) => items[k] === items[i]), right: items.join(ex.type === 'order' ? ' → ' : ' ') });
    }
    if (ex.type === 'match') {
      const left = ex.pairs.map((p, i) => ({ s: p[0], i })), right = shuffle(ex.pairs.map((p, i) => ({ s: p[1], i })));
      let selL = null, matched = 0, misses = 0;
      lb.innerHTML = `<h2 class="ex-q">${esc(ex.q)}</h2><div class="match"><div>${left.map(x => `<button class="mchip" data-side="l" data-i="${x.i}">${esc(x.s)}</button>`).join('')}</div><div>${right.map(x => `<button class="mchip" data-side="r" data-i="${x.i}">${esc(x.s)}</button>`).join('')}</div></div>`;
      lb.addEventListener('click', function onM(e) {
        const b = e.target.closest('.mchip'); if (!b || b.disabled) return;
        if (b.dataset.side === 'l') { selL = b; $$('.mchip[data-side="l"]', lb).forEach(x => x.classList.toggle('picked', x === b)); return; }
        if (!selL) return;
        if (selL.dataset.i === b.dataset.i) { [selL, b].forEach(x => { x.disabled = true; x.classList.add('right'); x.classList.remove('picked'); }); matched++; selL = null; if (matched === ex.pairs.length) { lb.removeEventListener('click', onM); enable(); } }
        else { misses++; b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); announce(t('game.tryAgain', 'Try again')); }
      });
      getAnswer = () => ({ ok: misses === 0, right: '', soft: true });
      checkLabel = t('learn.continue', 'Continue');
    }
    lf.innerHTML = `<button class="btn primary wide" id="chk" disabled>${checkLabel}</button>`;
    function enable() { $('#chk', el).disabled = false; }
    function disable() { $('#chk', el).disabled = true; }
    $('#chk', el).addEventListener('click', () => {
      const res = getAnswer();
      answered += 1;
      if (res.ok) { if (!wrongOnce.has(idx)) firstTry++; }
      else if (!res.soft) { wrongOnce.add(queue.length); queue.push(ex); answered -= 1; }
      else wrongOnce.add('m' + idx);
      $$('.option, .wchip, .mchip', lb).forEach(x => x.disabled = true);
      lf.className = `lesson-foot ${res.ok ? 'ok' : 'no'}`;
      lf.innerHTML = `<div class="fb-msg">${icon(res.ok ? 'check' : 'x')}<div><b>${res.ok ? pickPraise() : (res.soft ? t('learn.matchedAll', 'All matched') : t('learn.correctAns', 'Correct answer:'))}</b>${!res.ok && res.right ? `<p>${esc(res.right)}</p>` : ''}${ex.explain ? `<p class="small">${esc(ex.explain)}</p>` : ''}${ex.ref && parseRef(ex.ref) ? `<a class="small" href="${refHash(parseRef(ex.ref))}" target="_blank">${esc(localRef(ex.ref))}</a>` : ''}</div></div><button class="btn primary" id="next">${t('learn.continue', 'Continue')}</button>`;
      announce(res.ok ? t('quiz.correct', 'Correct!') : t('learn.correctAns', 'Correct answer:') + ' ' + res.right);
      $('#next', el).focus();
      $('#next', el).addEventListener('click', () => { idx++; show(); });
    });
  };
  const finish = () => {
    const perfect = [...wrongOnce].length === 0;
    const xp = 10 + (perfect ? 5 : 0) + (isReview ? 10 : 0);
    onFinish(perfect);
    markActivity('lesson', xp);
    const secs = Math.round((Date.now() - started) / 1000);
    const acc = Math.round((firstTry / Math.max(1, total)) * 100);
    const newBadges = earnedBadges().filter(b => !before.includes(b.id));
    const goal = getSettings().dailyGoal, tx = todayXP();
    lp.style.width = '100%';
    lb.innerHTML = `<div class="result-card">
      <div class="big-ico gold">${icon(isReview ? 'crown' : perfect ? 'star' : 'check')}</div>
      <h1>${isReview ? t('learn.unitDone', 'Unit complete!') : perfect ? t('learn.perfect', 'Perfect lesson!') : t('learn.done', 'Lesson complete!')}</h1>
      <div class="result-stats"><div><span>${t('learn.xp', 'XP')}</span><b>+${xp}</b></div><div><span>${t('learn.accuracy', 'Accuracy')}</span><b>${acc}%</b></div><div><span>${t('learn.time', 'Time')}</span><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</b></div></div>
      <p class="muted">${tx >= goal ? t('learn.goalMet', 'Daily goal reached — {n}-day streak!', { n: streak() }) : t('learn.goalLeft', '{n} XP left for today’s goal', { n: goal - tx })}</p>
      ${newBadges.map(b => `<div class="new-badge"><span class="bdg on">${icon(b.icon)}</span><div><b>${t('learn.newBadge', 'New achievement')}: ${esc(b.name())}</b><p class="small muted">${esc(b.desc())}</p></div></div>`).join('')}
      ${passageRef ? `<div class="row center" style="margin-top:12px"><button class="btn small" id="deeper">${icon('spark')} ${t('lp.deeper', 'What does this section mean?')}</button></div><div id="deepOut" style="text-align:left;margin-top:12px"></div>` : ''}
    </div>`;
    lf.className = 'lesson-foot';
    lf.innerHTML = `<div class="row" style="width:100%;justify-content:flex-end">${finishLinks ? finishLinks() : ''}<a class="btn primary" href="${back}" id="cont">${t('learn.continue', 'Continue')}</a></div>`;
    $('#deeper', el)?.addEventListener('click', () => runAI($('#deepOut', el), [{ role: 'user', content: `Explain ${passageRef} at the right level for me: what happens or what is taught, why it matters in the book, and one way to apply it. Keep it short.` }]));
    $('#cont', el).focus();
  };
  const onKey = e => {
    if (e.target.closest('input, textarea')) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) $$('.option:not([disabled])', lb)[n - 1]?.click();
  };
  document.addEventListener('keydown', onKey);
  show();
  return () => { document.removeEventListener('keydown', onKey); speech.stop(); };
}
const pickPraise = () => { const p = t('learn.praise', 'Correct!|Nice work!|Excellent!|Well done!|Great!').split('|'); return p[Math.floor(Math.random() * p.length)]; };
