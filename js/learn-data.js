// Content for the learning path. Lessons are generated from the timeline,
// people and places data so they are available in every language.
import { t, tl } from './i18n.js';
import { EVENTS, ERAS } from './data/timeline.js';
import { PLACES } from './data/places.js';
import { PEOPLE } from './data/people.js';
import { BOOKS, parseRef, bookName, localRef } from './bible.js';

export const personId = p => p.name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
export const evTitle = e => tl('event', e.id, 'title', e.title);
export const evAbout = e => tl('event', e.id, 'about', e.about);
export const evDate = e => tl('event', e.id, 'date', e.date);
export const placeName = id => { const p = PLACES.find(x => x.id === id); return p ? tl('place', p.id, 'name', p.name) : id; };
export const personName = p => tl('person', personId(p), 'name', p.name);
export const personAbout = p => tl('person', personId(p), 'about', p.about);
export const eraName = id => tl('era', id, 'name', ERAS.find(e => e.id === id)?.name || id);

export const UNITS = [
  { id: 'study', icon: 'compass', color: '#9a4a1c', verse: 'Psalms 119:105', skills: true },
  { id: 'beginnings', era: 'beginnings', icon: 'sun', verse: 'Genesis 1:1' },
  { id: 'patriarchs', era: 'patriarchs', icon: 'star', verse: 'Genesis 15:6' },
  { id: 'exodus', era: 'exodus', icon: 'wind', verse: 'Exodus 14:14' },
  { id: 'judges', era: 'judges', icon: 'heart', verse: 'Ruth 1:16' },
  { id: 'kingdom', era: 'kingdom', icon: 'crown', verse: '1 Samuel 16:7' },
  { id: 'divided', era: 'divided', icon: 'scroll', verse: 'Isaiah 6:8' },
  { id: 'exile', era: 'exile', icon: 'anchor', verse: 'Jeremiah 29:11' },
  { id: 'jesus', era: 'jesus', icon: 'sun', verse: 'John 3:16' },
  { id: 'church', era: 'church', icon: 'globe', verse: 'Acts 1:8' },
].map(u => ({ ...u, color: u.color || ERAS.find(e => e.id === u.era)?.color }));

export const unitTitle = u => u.skills ? t('u.study', 'How to study the Bible') : eraName(u.era);
export const unitSub = u => u.skills ? t('u.studySub', 'Observe, wrestle well, find the context, interpret and apply.') : t('u.eraSub', 'Key verse: {ref}', { ref: localRef(u.verse) });

export const LESSONS_PER_UNIT = 5; // 4 lessons + unit review
export const lessonTitle = (u, i) => u.skills
  ? [t('ls.s1', 'Observe'), t('ls.s2', 'When it’s hard'), t('ls.s3', 'Context is key'), t('ls.s4', 'Interpret & apply'), t('ls.review', 'Unit review')][i]
  : [t('ls.story', 'The story'), t('ls.pp', 'People & places'), t('ls.order', 'In order'), t('ls.verse', 'Key verse'), t('ls.review', 'Unit review')][i];

// --- seeded random so a lesson is stable within one attempt ---
export function rng(seed) {
  let a = 0; for (const ch of String(seed)) a = (a * 31 + ch.charCodeAt(0)) | 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
const shuf = (arr, r) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pickN = (arr, n, r) => shuf(arr, r).slice(0, n);

// --- exercise generators for a story era ---
function eraExercises(u, kind, r, verseText) {
  const evs = EVENTS.filter(e => e.era === u.era);
  const people = PEOPLE.filter(p => p.era === u.era);
  const allPlaces = PLACES;
  const ex = [];
  const mcEventAbout = () => { const e = evs[Math.floor(r() * evs.length)]; const others = pickN(EVENTS.filter(x => x.id !== e.id), 3, r); return { type: 'mc', q: t('ex.whichEvent', 'Which event is this? “{a}”', { a: evAbout(e) }), opts: shuf([evTitle(e), ...others.map(evTitle)], r), answer: evTitle(e), ref: e.ref }; };
  const mcPlace = () => { const withP = evs.filter(e => e.place); if (!withP.length) return mcEventAbout(); const e = withP[Math.floor(r() * withP.length)]; const right = placeName(e.place); return { type: 'mc', q: t('ex.where', 'Where did this happen: “{e}”?', { e: evTitle(e) }), opts: shuf([right, ...pickN(allPlaces.filter(p => p.id !== e.place), 3, r).map(p => placeName(p.id))], r), answer: right, ref: e.ref, explain: evAbout(e) }; };
  const tfOrder = () => { const [a, b] = pickN(evs.length >= 2 ? evs : EVENTS, 2, r); const truth = r() > 0.5; const [x, y] = truth ? (a.year < b.year ? [a, b] : [b, a]) : (a.year < b.year ? [b, a] : [a, b]); return { type: 'tf', q: t('ex.before', '“{a}” happened before “{b}”.', { a: evTitle(x), b: evTitle(y) }), answer: truth, explain: `${evTitle(a)}: ${evDate(a)} · ${evTitle(b)}: ${evDate(b)}` }; };
  const mcPerson = () => { const pool = people.length ? people : PEOPLE; const p = pool[Math.floor(r() * pool.length)]; const name = personName(p); const clue = personAbout(p).split(name.split(/[ &]/)[0]).join('___'); return { type: 'mc', q: t('ex.who', 'Who is this? {c}', { c: clue }), opts: shuf([name, ...pickN(PEOPLE.filter(x => x !== p && x.name !== 'Jesus'), 3, r).map(personName)], r), answer: name, ref: p.ref }; };
  const match = () => { const pool = people.length >= 3 ? people : PEOPLE.filter(p => p.name !== 'Jesus'); const ps = pickN(pool, Math.min(4, pool.length), r); return { type: 'match', q: t('ex.match', 'Match each person to their story'), pairs: ps.map(p => [personName(p), personAbout(p).split(/[.;—]/)[0]]) }; };
  const order = () => { const list = pickN(evs.length >= 3 ? evs : EVENTS, Math.min(4, evs.length >= 3 ? evs.length : 4), r).sort((a, b) => a.year - b.year); return { type: 'order', q: t('ex.order', 'Put these events in order (earliest first)'), items: list.map(evTitle) }; };
  const book = () => { const withR = evs.filter(e => e.ref); const e = withR[Math.floor(r() * withR.length)]; const rb = parseRef(e.ref).b; const near = BOOKS.map((_, i) => i).filter(i => i !== rb).sort((a, b) => Math.abs(a - rb) - Math.abs(b - rb)).slice(0, 6); return { type: 'mc', q: t('ex.book', 'Which book tells about “{e}”?', { e: evTitle(e) }), opts: shuf([bookName(rb), ...pickN(near, 3, r).map(i => bookName(i))], r), answer: bookName(rb), ref: e.ref }; };
  const verseEx = () => {
    if (!verseText) return mcEventAbout();
    const ws = verseText.split(/\s+/);
    const cand = ws.map((w, i) => ({ w: w.replace(/[^\p{L}'’-]/gu, ''), i })).filter(x => x.w.length > 3);
    const target = cand[Math.floor(r() * cand.length)];
    const fillers = shuf(t('ex.fillers', 'grace,glory,peace,light,truth,kingdom,spirit,mercy').split(','), r);
    return { type: 'fill', q: t('ex.fill', 'Complete the key verse ({ref})', { ref: localRef(u.verse) }), text: ws.map((w, i) => i === target.i ? w.replace(target.w, '_____') : w).join(' '), opts: shuf([target.w, ...fillers.filter(f => f.toLowerCase() !== target.w.toLowerCase()).slice(0, 3)], r), answer: target.w };
  };
  const build = () => verseText ? { type: 'build', q: t('ex.build', 'Build the key verse ({ref})', { ref: localRef(u.verse) }), words: verseText.split(/\s+/).length > 16 ? chunk(verseText, 3) : verseText.split(/\s+/) } : order();
  const plan = {
    0: [mcEventAbout, tfOrder, mcEventAbout, mcPlace, tfOrder, mcEventAbout, book],
    1: [mcPerson, match, mcPlace, mcPerson, mcPlace, match],
    2: [order, tfOrder, book, order, tfOrder, mcEventAbout],
    3: [verseEx, build, verseEx, build, verseEx],
    4: [mcEventAbout, mcPerson, order, mcPlace, match, verseEx, tfOrder, build, book],
  }[kind];
  for (const g of plan) { try { const e = g(); if (e) ex.push(e); } catch {} }
  return ex;
}
const chunk = (s, n) => { const w = s.split(/\s+/); const out = []; for (let i = 0; i < w.length; i += n) out.push(w.slice(i, i + n).join(' ')); return out; };

// --- the "How to study the Bible" unit (from a pastor's sermon on 2 John + classic methods) ---
export const PASTOR_STEPS = () => [
  { icon: 'wind', title: t('ps.1', 'Take a deep breath'), body: t('ps.1b', 'Stress shuts down clear thinking. A long, slow breath calms your body so you can think.') },
  { icon: 'hand', title: t('ps.2', 'Invite God into the wrestle'), body: t('ps.2b', 'God needs no invitation, but he wants open hearts. Tell him honestly what confuses or bothers you.') },
  { icon: 'anchor', title: t('ps.3', 'Trust in God’s goodness'), body: t('ps.3b', 'Lean on what is clear: God is good. We see “through a glass, darkly” for now (1 Corinthians 13:12).') },
  { icon: 'layers', title: t('ps.4', 'Biblical context: local → global'), body: t('ps.4b', 'Start with the sentence, paragraph and book; then the author’s other writings; then the whole Bible.') },
  { icon: 'scroll', title: t('ps.5', 'Historic context'), body: t('ps.5b', 'Who was it written to, and what were they facing? Customs and situations change the meaning.') },
  { icon: 'sun', title: t('ps.6', 'Interpret the unclear through the clear'), body: t('ps.6b', 'Let passages that are plain and repeated guide how you read the ones that are hard.') },
];

function studyExercises(i, r) {
  const steps = PASTOR_STEPS();
  const L = {
    0: [
      { type: 'card', icon: 'eye', title: t('s1.c1t', 'Start by noticing'), body: t('s1.c1b', 'Before asking “what does it mean?”, ask “what does it say?”. Authors repeat words they want you to notice.') },
      { type: 'mc', q: t('s1.q1', 'In 2 John 1–6, which word appears again and again — five times?'), opts: shuf([t('w.truth', 'truth'), t('w.peace', 'peace'), t('w.faith', 'faith'), t('w.joy', 'joy')], r), answer: t('w.truth', 'truth'), ref: '2 John 1:1-6', explain: t('s1.e1', 'John repeats “truth” to show what this letter is about.') },
      { type: 'mc', q: t('s1.q2', 'Which word is linked closely to “truth” in 2 John (four times)?'), opts: shuf([t('w.love', 'love'), t('w.law', 'law'), t('w.fear', 'fear'), t('w.hope', 'hope')], r), answer: t('w.love', 'love'), ref: '2 John 1:3-6', explain: t('s1.e2', 'For John, love and truth are not a balance — they go together fully.') },
      { type: 'card', icon: 'search', title: t('s1.c2t', 'Questions to ask'), body: t('s1.c2b', 'Who is speaking? To whom? What words repeat? What is compared or contrasted? Is “you” singular or plural?') },
      { type: 'tf', q: t('s1.q3', 'In most New Testament letters, “you” usually means the whole church (plural), not just one person.'), answer: true, explain: t('s1.e3', 'English hides it, but most “you”s in the letters are plural — written to a community.') },
      { type: 'mc', q: t('s1.q4', 'What is the first step of the inductive method?'), opts: shuf([t('ind.o', 'Observation'), t('ind.i', 'Interpretation'), t('ind.a', 'Application'), t('ind.c', 'Correlation')], r), answer: t('ind.o', 'Observation'), explain: t('s1.e4', 'Observation → Interpretation → Application (Howard Hendricks, “Living by the Book”).') },
    ],
    1: [
      { type: 'card', icon: 'anchor', title: t('s2.c1t', 'When scripture is hard'), body: t('s2.c1b', 'Some passages confuse or scare us. 2 John 10 says not to greet some teachers — how does that fit with loving strangers and enemies?') },
      ...steps.slice(0, 3).map(s => ({ type: 'card', icon: s.icon, title: s.title, body: s.body })),
      { type: 'order', q: t('s2.q1', 'Put the first steps in order'), items: steps.slice(0, 3).map(s => s.title) },
      { type: 'tf', q: t('s2.q2', 'You have to understand God’s goodness in a hard passage before you can trust it.'), answer: false, explain: t('s2.e2', 'We rest in what is clear about God’s character while we work through what is not yet clear.') },
      { type: 'mc', q: t('s2.q3', 'Why take a deep breath first?'), opts: shuf([t('s2.o1', 'Stress makes it hard to think clearly'), t('s2.o2', 'It is a required ritual'), t('s2.o3', 'To read faster'), t('s2.o4', 'It replaces prayer')], r), answer: t('s2.o1', 'Stress makes it hard to think clearly') },
    ],
    2: [
      { type: 'card', icon: steps[3].icon, title: steps[3].title, body: steps[3].body },
      { type: 'order', q: t('s3.q1', 'Order the circles of biblical context, from closest to widest'), items: [t('ctx.1', 'The sentence & paragraph'), t('ctx.2', 'The whole letter or book'), t('ctx.3', 'The author’s other writings (1–3 John)'), t('ctx.4', 'The whole Bible')] },
      { type: 'card', icon: 'path', title: t('s3.c2t', 'Trace themes back'), body: t('s3.c2b', 'John calls the church “the elect lady”. Election begins in Genesis 12: God blesses Abraham so that all families of the earth would be blessed.') },
      { type: 'mc', q: t('s3.q2', 'In Genesis 12:2-3, why does God bless Abraham?'), opts: shuf([t('s3.o1', 'So he would be a blessing to all nations'), t('s3.o2', 'Because he was better than others'), t('s3.o3', 'To make him rich only'), t('s3.o4', 'Because he asked for it')], r), answer: t('s3.o1', 'So he would be a blessing to all nations'), ref: 'Genesis 12:2-3' },
      { type: 'card', icon: steps[4].icon, title: steps[4].title, body: steps[4].body },
      { type: 'mc', q: t('s3.q3', 'In 2 John’s world, receiving a travelling teacher into your house meant…'), opts: shuf([t('s3.o5', 'Supporting and giving them a platform'), t('s3.o6', 'Just saying hello'), t('s3.o7', 'Becoming their servant'), t('s3.o8', 'Nothing special')], r), answer: t('s3.o5', 'Supporting and giving them a platform'), explain: t('s3.e3', 'So John is not banning kindness — he is saying: don’t fund or platform a message that denies Jesus.'), ref: '2 John 1:10-11' },
    ],
    3: [
      { type: 'card', icon: steps[5].icon, title: steps[5].title, body: steps[5].body },
      { type: 'tf', q: t('s4.q1', 'A single unclear verse should override many clear, repeated teachings.'), answer: false, explain: t('s4.e1', 'Scripture interprets Scripture: the clear guides the unclear.') },
      { type: 'match', q: t('s4.q2', 'Match the S.O.A.P. steps'), pairs: [['S', t('soap.S', 'Scripture — write it out')], ['O', t('soap.O', 'Observation — what it says')], ['A', t('soap.A', 'Application — what I will do')], ['P', t('soap.P', 'Prayer — talk to God about it')]] },
      { type: 'card', icon: 'book', title: t('s4.c2t', 'Read for the genre'), body: t('s4.c2b', 'Poetry, law, history, prophecy, gospel and letters are read differently. Ask: what kind of writing is this?') },
      { type: 'mc', q: t('s4.q3', 'What is the last step that turns study into life?'), opts: shuf([t('ind.a', 'Application'), t('s4.o2', 'Memorizing dates'), t('s4.o3', 'Reading faster'), t('s4.o4', 'Skipping hard parts')], r), answer: t('ind.a', 'Application') },
      { type: 'order', q: t('s4.q4', 'Put all six “hard passage” steps in order'), items: steps.map(s => s.title) },
    ],
  };
  if (i < 4) return L[i];
  // review: mix
  return shuf([...L[0], ...L[1], ...L[2], ...L[3]].filter(x => x.type !== 'card'), r).slice(0, 9);
}

export function buildLesson(u, i, seed, verseText) {
  const r = rng(`${u.id}:${i}:${seed}`);
  return u.skills ? studyExercises(i, r) : eraExercises(u, i, r, verseText);
}

// --- achievements ---
export const BADGES = [
  { id: 'first', icon: 'star', name: () => t('b.first', 'First steps'), desc: () => t('b.firstD', 'Finish your first lesson'), test: s => s.lessons >= 1 },
  { id: 'scholar', icon: 'book', name: () => t('b.bookDone', 'Book finished'), desc: () => t('b.bookDoneD', 'Learn every section of a Bible book'), test: s => s.booksDone >= 1 },
  { id: 'unit', icon: 'crown', name: () => t('b.unit', 'Crowned'), desc: () => t('b.unitD', 'Finish any unit review'), test: s => s.units >= 1 },
  { id: 's3', icon: 'flame', name: () => t('b.s3', 'On fire'), desc: () => t('b.s3D', '3-day streak'), test: s => s.streak >= 3 },
  { id: 's7', icon: 'flame', name: () => t('b.s7', 'Faithful week'), desc: () => t('b.s7D', '7-day streak'), test: s => s.streak >= 7 },
  { id: 's30', icon: 'flame', name: () => t('b.s30', 'Rooted'), desc: () => t('b.s30D', '30-day streak'), test: s => s.streak >= 30 },
  { id: 'xp500', icon: 'bolt', name: () => t('b.xp', 'Rising'), desc: () => t('b.xpD', 'Earn 500 XP'), test: s => s.xp >= 500 },
  { id: 'mem1', icon: 'brain', name: () => t('b.mem1', 'Hidden in my heart'), desc: () => t('b.mem1D', 'Master your first verse'), test: s => s.mastered >= 1 },
  { id: 'mem10', icon: 'brain', name: () => t('b.mem10', 'Verse keeper'), desc: () => t('b.mem10D', 'Master 10 verses'), test: s => s.mastered >= 10 },
  { id: 'read10', icon: 'book', name: () => t('b.read10', 'Reader'), desc: () => t('b.read10D', 'Read 10 chapters'), test: s => s.read >= 10 },
  { id: 'read100', icon: 'book', name: () => t('b.read100', 'Devoted reader'), desc: () => t('b.read100D', 'Read 100 chapters'), test: s => s.read >= 100 },
  { id: 'notes', icon: 'pen', name: () => t('b.notes', 'Study Bible'), desc: () => t('b.notesD', 'Make 10 highlights or notes'), test: s => s.notes >= 10 },
  { id: 'study', icon: 'search', name: () => t('b.study', 'Deep diver'), desc: () => t('b.studyD', 'Save a guided study'), test: s => s.studies >= 1 },
];
