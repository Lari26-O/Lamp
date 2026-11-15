// Book-by-book learning: split a book into short sections and build lessons
// from the passage text itself (works in every language and version).
import { BOOKS, getBook, getVersion, currentVersion, defaultVersionFor, bookName } from './bible.js';
import { rng } from './learn-data.js';
import { t } from './i18n.js';

// Books suggested per age group (indexes into BOOKS).
export const RECOMMENDED = {
  kids: [31, 7, 40, 16, 0, 26], preteen: [31, 40, 7, 26, 16, 42], teen: [63, 58, 49, 40, 42, 61],
  young: [49, 58, 42, 47, 48, 44], adult: [58, 44, 48, 42, 0, 57], senior: [7, 18, 42, 49, 61, 22],
};

// Pick a bundled (offline) version so lessons always work.
export function lessonVersion() { const v = getVersion(currentVersion()); return v.src === 'local' ? v.id : defaultVersionFor(v.lang); }

export async function bookText(b) { return getBook(b, lessonVersion()); }

// Sections for a book: each chapter split into chunks of about `size` verses.
export function sections(book, level = 2) {
  const size = { 1: 5, 2: 7, 3: 9 }[level] || 7;
  const out = [];
  book.forEach((ch, ci) => {
    const n = ch.filter(Boolean).length || ch.length;
    // One-chapter books (3 John, Jude, Philemon…) are split into about four parts.
    const sz = book.length === 1 ? Math.max(3, Math.min(size, Math.ceil(n / 4))) : size;
    const k = Math.max(1, Math.round(n / sz));
    for (let i = 0; i < k; i++) {
      const v1 = Math.floor(i * n / k) + 1, v2 = Math.floor((i + 1) * n / k);
      out.push({ c: ci + 1, i, v1, v2, of: k });
    }
  });
  return out;
}
export const secLabel = (b, s) => `${bookName(b)} ${s.c}:${s.v1}${s.v2 > s.v1 ? '–' + s.v2 : ''}`;

const STOP = new Set('the and that for with unto them they shall have this which from were when there their what then thou thee thy your into upon also said hath will saith before after because every these those than been more let may not but all his her him are was who you our out one any some such even very made make come came went says said would could should about over under among against through being Dieu Seigneur Éternel Deus Senhor Dios Señor God Lord LORD'.toLowerCase().split(' '));
const words = s => s.split(/\s+/).filter(Boolean);
const clean = w => w.replace(/[^\p{L}'’-]/gu, '');
const shuf = (a, r) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const keyWord = w => { const c = clean(w); return c.length > 3 && !STOP.has(c.toLowerCase()); };

// Capitalised words that are not at the start of a sentence: likely names.
function names(text) {
  const out = new Set();
  const toks = text.split(/\s+/);
  for (let i = 1; i < toks.length; i++) {
    if (/[.;:!?»"”]$/.test(toks[i - 1])) continue;
    const w = clean(toks[i]);
    if (w.length > 2 && /^\p{Lu}\p{Ll}/u.test(w) && !STOP.has(w.toLowerCase())) out.add(w);
  }
  return [...out];
}

// Build a lesson for one section. `verses` = array of {v, text} for the section,
// `chapter` and `book` give distractors. level 1 (kids) … 3 (adults).
export function passageLesson({ b, sec, book, level = 2, seed = 1, review = false }) {
  const r = rng(`${b}:${sec.c}:${sec.i}:${seed}:${review}`);
  const chapter = book[sec.c - 1].map((text, i) => ({ v: i + 1, text })).filter(x => x.text);
  const verses = chapter.filter(x => x.v >= sec.v1 && x.v <= sec.v2);
  const nOpts = level === 1 ? 3 : 4;
  const bookWords = [...new Set(book.flat().filter(Boolean).slice(0, 4000).flatMap(words).filter(keyWord).map(clean))];
  const ref = secLabel(b, sec);
  const ex = [];

  if (!review) ex.push({ type: 'passage', title: ref, verses });

  // 1. Fill in the blank (word bank)
  const fill = () => {
    const pool = verses.filter(x => words(x.text).length >= 6);
    if (!pool.length) return null;
    const v = pool[Math.floor(r() * pool.length)];
    const ws = words(v.text);
    const cand = ws.map((w, i) => ({ w: clean(w), i })).filter(x => keyWord(x.w));
    if (!cand.length) return null;
    const tg = cand.sort((a, z) => z.w.length - a.w.length)[Math.floor(r() * Math.min(3, cand.length))];
    const local = [...new Set(chapter.flatMap(x => words(x.text)).filter(keyWord).map(clean))];
    const dis = shuf([...local, ...bookWords].filter(w => w.toLowerCase() !== tg.w.toLowerCase()), r).slice(0, nOpts - 1);
    return { type: 'fill', q: t('lb.fill', 'Which word completes verse {v}?', { v: v.v }), text: ws.map((w, i) => i === tg.i ? w.replace(tg.w, '_____') : w).join(' '), opts: shuf([tg.w, ...dis], r), answer: tg.w, ref: `${BOOKS[b].name} ${sec.c}:${v.v}` };
  };
  // 2. True / false: real verse or one with a swapped word
  const tf = () => {
    const pool = verses.filter(x => words(x.text).length >= 6);
    if (!pool.length) return null;
    const v = pool[Math.floor(r() * pool.length)];
    const real = r() > 0.5;
    let shown = v.text;
    if (!real) {
      const ws = words(v.text);
      const cand = ws.map((w, i) => ({ w: clean(w), i })).filter(x => keyWord(x.w));
      if (!cand.length) return null;
      const tg = cand[Math.floor(r() * cand.length)];
      const swap = shuf(bookWords.filter(w => w.toLowerCase() !== tg.w.toLowerCase() && w.length > 3), r)[0];
      if (!swap) return null;
      shown = ws.map((w, i) => i === tg.i ? w.replace(tg.w, swap) : w).join(' ');
    }
    return { type: 'tf', q: t('lb.tf', 'Does this section really say this?') + `\n“${shown}”`, answer: real, explain: real ? '' : t('lb.real', 'It actually says: “{t}”', { t: v.text }) };
  };
  // 3. Put verses in order
  const order = () => {
    if (verses.length < 3) return null;
    const n = Math.min(level === 1 ? 3 : 4, verses.length);
    const start = Math.floor(r() * (verses.length - n + 1));
    const items = verses.slice(start, start + n).map(x => words(x.text).slice(0, level === 1 ? 7 : 9).join(' ') + '…');
    return { type: 'order', q: t('lb.order', 'Put these verses in the order they appear'), items };
  };
  // 4. Who is mentioned?
  const who = () => {
    const here = names(verses.map(x => x.text).join(' '));
    if (!here.length) return null;
    const right = here[Math.floor(r() * here.length)];
    const others = shuf(names(book.flat().filter(Boolean).slice(0, 3000).join(' ')).filter(n => !here.includes(n)), r).slice(0, nOpts - 1);
    if (others.length < nOpts - 1) return null;
    return { type: 'mc', q: t('lb.who', 'Who or what is named in this section?'), opts: shuf([right, ...others], r), answer: right };
  };
  // 5. Which verse number says this?
  const which = () => {
    if (verses.length < 3) return null;
    const v = verses[Math.floor(r() * verses.length)];
    const nums = shuf(verses.map(x => String(x.v)).filter(x => x !== String(v.v)), r).slice(0, nOpts - 1);
    return { type: 'mc', q: t('lb.which', 'Which verse says this?') + `\n“${v.text}”`, opts: shuf([String(v.v), ...nums], r).map(n => t('lb.verseN', 'Verse {n}', { n })), answer: t('lb.verseN', 'Verse {n}', { n: v.v }) };
  };
  // 6. Build the shortest verse
  const build = () => {
    const pool = verses.filter(x => words(x.text).length >= 4 && words(x.text).length <= (level === 1 ? 10 : 16));
    if (!pool.length) return null;
    const v = pool.sort((a, z) => a.text.length - z.text.length)[0];
    return { type: 'build', q: t('lb.build', 'Build verse {v}', { v: v.v }), words: words(v.text) };
  };
  // 7. Match verse numbers to their beginnings
  const match = () => {
    if (verses.length < 3) return null;
    const pick = shuf(verses, r).slice(0, Math.min(4, verses.length));
    return { type: 'match', q: t('lb.match', 'Match each verse number to how it begins'), pairs: pick.map(x => [t('lb.verseN', 'Verse {n}', { n: x.v }), words(x.text).slice(0, 7).join(' ') + '…']) };
  };

  const plan = level === 1 ? [fill, tf, who, fill, order]
    : level === 2 ? [fill, tf, order, who, which, build]
    : [fill, tf, order, which, who, match, build];
  const seq = review ? shuf([...plan, fill, tf], r) : plan;
  for (const g of seq) { try { const e = g(); if (e) ex.push(e); } catch {} }
  // Make sure there are enough questions
  let guard = 0;
  while (ex.filter(x => x.type !== 'passage').length < (level === 1 ? 4 : 5) && guard++ < 6) { const e = (guard % 2 ? fill : tf)(); if (e) ex.push(e); }
  return ex;
}
