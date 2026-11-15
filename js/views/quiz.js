// Quizzes: daily quiz, trivia by level, book quizzes, speed round and topics.
import { $, $$, esc, icon, shuffle, pick, announce } from '../util.js';
import { BOOKS, parseRef, passageText, refHash, bookName, localRef, currentVersion } from '../bible.js';
import { EVENTS, ERAS } from '../data/timeline.js';
import { PLACES } from '../data/places.js';
import { PEOPLE, DAILY_VERSES } from '../data/people.js';
import { TRIVIA } from '../data/trivia.js';
import { getCards } from '../srs.js';
import { load, save, markActivity, today } from '../store.js';
import { evTitle, evAbout, evDate, placeName, personName, personAbout, eraName } from '../learn-data.js';
import { bookText, sections, passageLesson, RECOMMENDED } from '../learn-books.js';
import { currentAge, L } from '../profile.js';
import { t } from '../i18n.js';

const LEVELS = () => [[1, t('qz.easy', 'Easy')], [2, t('qz.medium', 'Medium')], [3, t('qz.hard', 'Hard')]];
const CATS = () => [
  { id: 'mixed', label: t('quiz.mixed', 'Mixed') }, { id: 'timeline', label: t('nav.timeline', 'Timeline') }, { id: 'places', label: t('quiz.places', 'Places') },
  { id: 'people', label: t('nav.people', 'People') }, { id: 'books', label: t('quiz.books', 'Books') }, { id: 'mine', label: t('quiz.mine', 'My verses') },
];

// ---- question generators (data-driven, translated) ----
const GEN = {
  order() {
    const pool = EVENTS.filter(e => e.era !== 'between' && e.era !== 'beginnings');
    let a, b; do { [a, b] = shuffle(pool).slice(0, 2); } while (Math.abs(a.year - b.year) < 30);
    const first = a.year < b.year ? a : b;
    return { q: t('quiz.first', 'Which happened first?'), opts: shuffle([evTitle(a), evTitle(b)]), answer: evTitle(first), explain: `${evTitle(a)}: ${evDate(a)}. ${evTitle(b)}: ${evDate(b)}.`, ref: first.ref };
  },
  place() {
    const ev = pick(EVENTS.filter(e => e.place && e.ref)); const right = placeName(ev.place);
    return { q: t('ex.where', 'Where did this happen: “{e}”?', { e: evTitle(ev) }), opts: shuffle([right, ...shuffle(PLACES.filter(p => p.id !== ev.place)).slice(0, 3).map(p => placeName(p.id))]), answer: right, explain: evAbout(ev), ref: ev.ref, link: `#/map/${ev.place}` };
  },
  era() {
    const ev = pick(EVENTS.filter(e => e.ref)); const right = eraName(ev.era);
    return { q: t('quiz.era', 'In which period of the story is “{e}”?', { e: evTitle(ev) }), opts: shuffle([right, ...shuffle(ERAS.filter(e => e.id !== ev.era)).slice(0, 3).map(e => eraName(e.id))]), answer: right, explain: `${evDate(ev)}. ${evAbout(ev)}`, ref: ev.ref };
  },
  person() {
    const p = pick(PEOPLE.filter(x => x.name !== 'Jesus')); const name = personName(p);
    return { q: t('ex.who', 'Who is this? {c}', { c: personAbout(p).split(name.split(/[ &]/)[0]).join('___') }), opts: shuffle([name, ...shuffle(PEOPLE.filter(x => x !== p && x.name !== 'Jesus')).slice(0, 3).map(personName)]), answer: name, explain: personAbout(p), ref: p.ref };
  },
  book() {
    const ev = pick(EVENTS.filter(e => e.ref)); const r = parseRef(ev.ref);
    const near = BOOKS.map((b, i) => i).filter(i => i !== r.b).sort((a, b) => Math.abs(a - r.b) - Math.abs(b - r.b)).slice(0, 8);
    return { q: t('ex.book', 'Which book tells about “{e}”?', { e: evTitle(ev) }), opts: shuffle([bookName(r.b), ...shuffle(near).slice(0, 3).map(i => bookName(i))]), answer: bookName(r.b), explain: evAbout(ev), ref: ev.ref };
  },
  async verseBook() {
    const ref = pick(DAILY_VERSES); const r = parseRef(ref); const text = await passageText(r, currentVersion());
    return { q: t('quiz.verseBook', 'Which book is this verse from?') + `\n“${text}”`, opts: shuffle([bookName(r.b), ...shuffle(BOOKS.map((b, i) => i).filter(i => i !== r.b)).slice(0, 3).map(i => bookName(i))]), answer: bookName(r.b), explain: localRef(ref), ref };
  },
  mine() {
    const cards = getCards(); if (!cards.length) return null;
    const c = pick(cards); const words = c.text.split(/\s+/);
    const cand = words.map((w, i) => ({ w: w.replace(/[^\p{L}'-]/gu, ''), i })).filter(x => x.w.length > 3); if (cand.length < 2) return null;
    const tg = pick(cand);
    const pool = [...new Set(cards.flatMap(x => x.text.split(/\s+/).map(w => w.replace(/[^\p{L}'-]/gu, ''))).filter(w => w.length > 3 && w.toLowerCase() !== tg.w.toLowerCase()))];
    const fillers = t('ex.fillers', 'grace,glory,peace,light,truth,kingdom,spirit,mercy').split(',');
    return { q: `${localRef(c.ref)}: ${t('quiz.fillWord', 'fill in the missing word.')}\n“${words.map((w, i) => i === tg.i ? w.replace(tg.w, '_____') : w).join(' ')}”`, opts: shuffle([tg.w, ...shuffle([...pool, ...fillers].filter(w => w.toLowerCase() !== tg.w.toLowerCase())).slice(0, 3)]), answer: tg.w, explain: c.text, ref: c.ref };
  },
};
const BY_CAT = { mixed: ['order', 'place', 'era', 'person', 'book', 'verseBook', 'mine'], timeline: ['order', 'era'], places: ['place'], people: ['person'], books: ['book', 'verseBook'], mine: ['mine'] };
const trivia = lvl => { const pool = TRIVIA.filter(x => x.lvl === lvl); const q = pick(pool.length ? pool : TRIVIA); return { q: L(q.q), opts: shuffle([L(q.a), ...q.w.map(L)]), answer: L(q.a), ref: q.ref }; };

// Turn a generated passage exercise into a multiple-choice question.
function fromExercise(ex) {
  if (ex.type === 'fill') return { q: ex.q + '\n“' + ex.text + '”', opts: ex.opts, answer: ex.answer, ref: ex.ref };
  if (ex.type === 'mc') return { q: ex.q, opts: ex.opts, answer: ex.answer };
  if (ex.type === 'tf') return { q: ex.q, opts: [t('learn.true', 'True'), t('learn.false', 'False')], answer: ex.answer ? t('learn.true', 'True') : t('learn.false', 'False'), explain: ex.explain };
  return null;
}
// Kids get three options instead of four.
function fitLevel(q) {
  if (currentAge().level === 1 && q.opts.length > 3) { const wrong = q.opts.filter(o => o !== q.answer).slice(0, 2); q.opts = shuffle([q.answer, ...wrong]); }
  return q;
}

export function render(el, { query }) {
  const stats = load('quizstats', { played: 0, correct: 0, best: 0, daily: {} });
  stats.daily = stats.daily || {};
  const age = currentAge();
  let cat = 'mixed', lvl = age.level;

  function start() {
    const dailyDone = stats.daily[today()];
    const rec = RECOMMENDED[age.id] || RECOMMENDED.adult;
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">${t('navg.remember', 'Remember')}</p><h1>${t('nav.quiz', 'Quiz')}</h1><p>${t('quiz.intro2', 'Test what you know. Answering questions makes memories stronger than re-reading.')}</p></div>
      ${stats.played ? `<div class="muted small">${t('quiz.lifetime', 'Lifetime: {c}/{p} correct · best round {b}/10', { c: stats.correct, p: stats.played, b: stats.best })}</div>` : ''}</div>
      <div class="quiz-modes">
        <button class="card mode-card accent" id="mDaily"><span class="ico-wrap">${icon('calendar')}</span><b>${t('qz.daily', 'Daily quiz')}</b><p>${dailyDone ? t('qz.dailyDone', 'Done today: {s}/5. Come back tomorrow!', { s: dailyDone }) : t('qz.dailySub', '5 questions, a new set every day.')}</p></button>
        <button class="card mode-card" id="mSpeed"><span class="ico-wrap">${icon('timer')}</span><b>${t('qz.speed', 'Speed round')}</b><p>${t('qz.speedSub', 'As many as you can in 60 seconds.')}</p></button>
        <div class="card mode-card"><span class="ico-wrap">${icon('star')}</span><b>${t('qz.trivia', 'Bible trivia')}</b><p>${t('qz.triviaSub', '10 questions at your level.')}</p>
          <div class="chips">${LEVELS().map(([n, l]) => `<button class="chip" data-lvl="${n}" aria-pressed="${n === lvl}">${esc(l)}</button>`).join('')}</div>
          <button class="btn small primary" id="mTrivia">${icon('play')} ${t('quiz.startRound', 'Start round')}</button></div>
        <div class="card mode-card"><span class="ico-wrap">${icon('book')}</span><b>${t('qz.book', 'Quiz on a book')}</b><p>${t('qz.bookSub', 'Questions from the text of any book.')}</p>
          <select class="input" id="qBook" style="margin:6px 0">${rec.map(i => `<option value="${i}">${esc(bookName(i))}</option>`).join('')}<option disabled>──────</option>${BOOKS.map((b, i) => `<option value="${i}">${esc(bookName(i))}</option>`).join('')}</select>
          <button class="btn small primary" id="mBook">${icon('play')} ${t('quiz.startRound', 'Start round')}</button></div>
      </div>
      <div class="card"><h2>${t('quiz.topic', 'Choose a topic')}</h2><div class="chips" role="group">${CATS().map(c => `<button class="chip" data-cat="${c.id}" aria-pressed="${c.id === cat}">${esc(c.label)}</button>`).join('')}</div>
      ${cat === 'mine' && !getCards().length ? `<p class="muted small" style="margin-top:10px">${t('quiz.needVerses', 'Add memory verses first to quiz yourself on them.')}</p>` : ''}
      <div class="row" style="margin-top:16px"><button class="btn primary" id="go">${icon('play')} ${t('quiz.startRound', 'Start round')}</button></div></div>`;
    $$('[data-cat]', el).forEach(b => b.addEventListener('click', () => { cat = b.dataset.cat; start(); }));
    $$('[data-lvl]', el).forEach(b => b.addEventListener('click', () => { lvl = +b.dataset.lvl; $$('[data-lvl]', el).forEach(x => x.setAttribute('aria-pressed', x === b)); }));
    $('#go', el).addEventListener('click', () => round({ make: topicQ, count: 10 }));
    $('#mTrivia', el).addEventListener('click', () => round({ make: async () => trivia(lvl), count: 10 }));
    $('#mSpeed', el).addEventListener('click', () => round({ make: async () => (Math.random() < 0.4 ? trivia(Math.min(lvl, 2)) : await topicQ('mixed')), count: 999, seconds: 60 }));
    $('#mDaily', el).addEventListener('click', () => { if (!dailyDone) round({ make: dailyQ(), count: 5, daily: true }); });
    $('#mBook', el).addEventListener('click', async () => {
      const b = +$('#qBook', el).value; el.innerHTML = '<div class="empty"><span class="spinner"></span></div>';
      const book = await bookText(b); const secs = sections(book, age.level); const qs = [];
      for (const s of shuffle(secs).slice(0, 8)) for (const ex of passageLesson({ b, sec: s, book, level: age.level, seed: Math.random(), review: true })) { const q = fromExercise(ex); if (q) qs.push(q); }
      const list = shuffle(qs).slice(0, 10);
      round({ make: async () => list.shift() || trivia(lvl), count: Math.min(10, qs.length || 10), label: bookName(b) });
    });
  }
  async function topicQ(c = cat) {
    for (let tries = 0; tries < 8; tries++) { try { const q = await GEN[pick(BY_CAT[c])](); if (q) return q; } catch {} }
    return GEN.order();
  }
  // Daily quiz: same 5 question types for everyone today, mixed with trivia.
  function dailyQ() {
    const order = ['person', 'place', 'verseBook', 'order', 'trivia'];
    let i = 0;
    return async () => { const k = order[i++ % order.length]; return k === 'trivia' ? trivia(age.level) : GEN[k](); };
  }

  async function round({ make, count, seconds, daily, label }) {
    let n = 0, score = 0; const seen = new Set();
    let deadline = seconds ? Date.now() + seconds * 1000 : 0, timer = null;
    const ask = async () => {
      if (n >= count || (deadline && Date.now() >= deadline)) return finish();
      el.innerHTML = '<div class="empty"><span class="spinner"></span></div>';
      let q, guard = 0;
      do { q = await make(); } while (q && seen.has(q.q) && guard++ < 10);
      if (!q) return finish();
      seen.add(q.q); fitLevel(q);
      el.innerHTML = `
        <div class="play-head"><button class="icon-btn" id="quit" aria-label="${t('common.back', 'Back')}">${icon('x')}</button>
          <div class="progress grow"><i id="qbar" style="width:${seconds ? 100 : (n / count) * 100}%"></i></div>
          <span class="muted small" id="qinfo">${seconds ? '' : `${n + 1}/${count}`}</span></div>
        <div class="card">${label ? `<p class="eyebrow">${esc(label)}</p>` : ''}<h1 class="ex-q" style="white-space:pre-line">${esc(q.q)}</h1>
        <div class="options">${q.opts.map((o, i) => `<button class="option" data-o="${esc(o)}"><kbd>${'ABCD'[i]}</kbd> ${esc(o)}</button>`).join('')}</div>
        <div id="fb" aria-live="polite"></div></div>`;
      $('#quit', el).addEventListener('click', () => { clearInterval(timer); start(); });
      if (seconds) {
        clearInterval(timer);
        const tick = () => { const left = Math.max(0, deadline - Date.now()); const bar = $('#qbar', el); if (!bar) return; bar.style.width = (left / (seconds * 1000)) * 100 + '%'; $('#qinfo', el).textContent = `${Math.ceil(left / 1000)}s · ${score}`; if (!left) { clearInterval(timer); finish(); } };
        tick(); timer = setInterval(tick, 250);
      }
      $$('.option', el).forEach(btn => btn.addEventListener('click', () => {
        const ok = btn.dataset.o === q.answer;
        if (ok) score++;
        $$('.option', el).forEach(x => { x.disabled = true; if (x.dataset.o === q.answer) x.classList.add('right'); });
        if (!ok) btn.classList.add('wrong');
        announce(ok ? t('quiz.correct', 'Correct!') : t('quiz.answerIs', 'The answer is “{a}”.', { a: q.answer }));
        if (seconds) { setTimeout(() => { n++; ask(); }, ok ? 350 : 900); return; }
        $('#fb', el).innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}">${icon(ok ? 'check' : 'x')}<span><b>${ok ? t('quiz.correct', 'Correct!') : t('quiz.answerIs', 'The answer is “{a}”.', { a: esc(q.answer) })}</b> ${esc(q.explain || '')}</span></div>
          <div class="row">${q.ref && parseRef(q.ref) ? `<a class="btn small" href="${refHash(parseRef(q.ref))}">${icon('book')} ${esc(localRef(q.ref))}</a>` : ''}${q.link ? `<a class="btn small" href="${q.link}">${icon('map')} ${t('quiz.onMap', 'See on map')}</a>` : ''}
          <button class="btn primary" id="next">${t('common.next', 'Next')} ${icon('chevR')}</button></div>`;
        $('#next', el).focus();
        $('#next', el).addEventListener('click', () => { n++; ask(); });
      }));
    };
    const finish = () => {
      clearInterval(timer);
      const played = seconds ? n : count;
      stats.played += played; stats.correct += score;
      if (!seconds && count === 10) stats.best = Math.max(stats.best, score);
      if (seconds) stats.speedBest = Math.max(stats.speedBest || 0, score);
      if (daily) stats.daily[today()] = score;
      save('quizstats', stats); markActivity('quiz', score * 2 + (daily ? 5 : 0));
      const ratio = played ? score / played : 0;
      el.innerHTML = `<div class="card result-card"><div class="big-ico ${ratio >= .9 ? 'gold' : ''}">${icon(ratio >= .9 ? 'trophy' : ratio >= .6 ? 'star' : 'target')}</div>
        <h1>${seconds ? t('qz.speedScore', '{n} correct in 60 seconds', { n: score }) : `${score}/${count}`}</h1>
        <p>${seconds ? t('qz.speedBest', 'Your best: {n}', { n: stats.speedBest || score }) : ratio >= .9 ? t('quiz.r1', 'Outstanding!') : ratio >= .7 ? t('quiz.r2', 'Great work!') : ratio >= .5 ? t('quiz.r3', 'Good effort — keep going!') : t('quiz.r4', 'Every round helps you remember more. Try again!')}</p>
        <p class="muted">+${score * 2 + (daily ? 5 : 0)} XP</p>
        <div class="row center">${daily ? '' : `<button class="btn primary" id="again">${t('quiz.playAgain', 'Play again')}</button>`}<button class="btn" id="topics">${t('qz.allQuizzes', 'All quizzes')}</button></div></div>`;
      $('#again', el)?.addEventListener('click', () => round({ make, count, seconds, label }));
      $('#topics', el).addEventListener('click', start);
    };
    ask();
  }
  start();
}
