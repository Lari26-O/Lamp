// How to study the Bible: methods library + guided step-by-step studies.
import { $, $$, esc, icon, toast, md } from '../util.js';
import { parseRef, refLabel, getPassage, refHash, localRef, currentVersion, getVersion, BOOKS, bookName } from '../bible.js';
import { getStudies, saveStudy, removeStudy, uid, markActivity, getSettings } from '../store.js';
import { runAI } from '../components.js';
import { PASTOR_STEPS } from '../learn-data.js';
import { t, fmtDate } from '../i18n.js';

const ANCHORS = ['Psalms 34:8', 'Psalms 100:5', '1 John 4:16', 'James 1:17', 'Lamentations 3:22-23', 'Romans 8:28', '1 Corinthians 13:12'];

// Step tools: passage, breath, repeated, anchors, context, ai:<kind>
export const METHODS = () => [
  { id: 'hard', icon: 'anchor', source: t('m.hardSrc', 'From a pastor’s teaching on 2 John'), name: t('m.hard', 'When Scripture is hard'), sub: t('m.hardSub', 'Six steps for confusing or difficult passages.'),
    steps: [
      { icon: 'eye', title: t('st.observe', 'Read & notice'), help: t('st.observeH', 'Read the passage slowly. What words repeat? What seems important to the author?'), tools: ['passage', 'repeated'] },
      ...PASTOR_STEPS().map((s, i) => ({ icon: s.icon, title: s.title, help: s.body, tools: [['breath'], ['prayer'], ['anchors'], ['context', 'ai:cross'], ['ai:history'], ['ai:clear']][i] })),
      { icon: 'check', title: t('st.apply', 'Apply & pray'), help: t('st.applyH', 'What is God inviting you to believe or do? Write a short prayer.'), tools: [] },
    ] },
  { id: 'inductive', icon: 'search', source: t('m.indSrc', 'Howard & William Hendricks, “Living by the Book”'), name: t('m.ind', 'Inductive study'), sub: t('m.indSub', 'Observation → Interpretation → Application.'),
    steps: [
      { icon: 'eye', title: t('ind.o', 'Observation'), help: t('ind.oH', 'What does it say? Who, what, where, when? Repeated words, contrasts, lists, commands.'), tools: ['passage', 'repeated'] },
      { icon: 'search', title: t('ind.i', 'Interpretation'), help: t('ind.iH', 'What did it mean to the first readers? Look at context, genre and cross-references.'), tools: ['context', 'ai:history', 'ai:cross'] },
      { icon: 'link', title: t('ind.c', 'Correlation'), help: t('ind.cH', 'How does it fit with the rest of the Bible?'), tools: ['ai:clear'] },
      { icon: 'check', title: t('ind.a', 'Application'), help: t('ind.aH', 'How does this truth change what I believe, feel or do this week?'), tools: [] },
    ] },
  { id: 'soap', icon: 'pen', source: t('m.soapSrc', 'Wayne Cordeiro'), name: 'S.O.A.P.', sub: t('m.soapSub', 'A simple daily journaling method.'),
    steps: [
      { icon: 'book', title: t('soap.S', 'Scripture — write it out'), help: t('soap.SH', 'Copy the verse that stands out to you.'), tools: ['passage'] },
      { icon: 'eye', title: t('soap.O', 'Observation — what it says'), help: t('soap.OH', 'What do you notice? What does it say about God and people?'), tools: ['repeated'] },
      { icon: 'check', title: t('soap.A', 'Application — what I will do'), help: t('soap.AH', 'How will you live this out today?'), tools: [] },
      { icon: 'hand', title: t('soap.P', 'Prayer — talk to God about it'), help: t('soap.PH', 'Write a short prayer in your own words.'), tools: [] },
    ] },
  { id: 'swedish', icon: 'sun', source: t('m.swSrc', 'Used in many small groups'), name: t('m.sw', 'Swedish method'), sub: t('m.swSub', 'Light bulb, question mark, arrow.'),
    steps: [
      { icon: 'sun', title: t('sw.1', 'Light bulb'), help: t('sw.1H', 'What shines out to you? What is new or striking?'), tools: ['passage'] },
      { icon: 'quiz', title: t('sw.2', 'Question mark'), help: t('sw.2H', 'What is hard to understand? What would you ask the author?'), tools: ['ai:simple'] },
      { icon: 'chevR', title: t('sw.3', 'Arrow'), help: t('sw.3H', 'What does it point to in your own life?'), tools: [] },
    ] },
  { id: 'dbs', icon: 'people', source: t('m.dbsSrc', 'Discovery Bible Study'), name: t('m.dbs', 'Discovery Bible Study'), sub: t('m.dbsSub', 'Great for groups and new believers.'),
    steps: [
      { icon: 'book', title: t('dbs.1', 'Read & retell'), help: t('dbs.1H', 'Read it twice, then retell it in your own words.'), tools: ['passage'] },
      { icon: 'sun', title: t('dbs.2', 'What does this teach about God?'), help: '', tools: [] },
      { icon: 'people', title: t('dbs.3', 'What does this teach about people?'), help: '', tools: [] },
      { icon: 'check', title: t('dbs.4', 'How will I obey this?'), help: t('dbs.4H', 'Make it specific: “This week I will…”'), tools: [] },
      { icon: 'chat', title: t('dbs.5', 'Who will I share this with?'), help: '', tools: [] },
    ] },
  { id: 'lectio', icon: 'heart', source: t('m.lecSrc', 'An ancient Christian practice'), name: 'Lectio Divina', sub: t('m.lecSub', 'Slow, prayerful reading.'),
    steps: [
      { icon: 'wind', title: t('lec.0', 'Be still'), help: t('lec.0H', 'Take a moment of quiet.'), tools: ['breath'] },
      { icon: 'book', title: t('lec.1', 'Read (lectio)'), help: t('lec.1H', 'Read slowly. Which word or phrase catches your attention?'), tools: ['passage'] },
      { icon: 'eye', title: t('lec.2', 'Reflect (meditatio)'), help: t('lec.2H', 'Read again. Why does that phrase stand out today?'), tools: [] },
      { icon: 'hand', title: t('lec.3', 'Respond (oratio)'), help: t('lec.3H', 'Talk to God about it.'), tools: [] },
      { icon: 'heart', title: t('lec.4', 'Rest (contemplatio)'), help: t('lec.4H', 'Rest in God’s presence. Write anything you sense.'), tools: [] },
    ] },
  { id: 'genre', icon: 'scroll', source: t('m.genSrc', 'Fee & Stuart, “How to Read the Bible for All Its Worth”'), name: t('m.gen', 'Then & now'), sub: t('m.genSub', 'Genre, original meaning, and meaning today.'),
    steps: [
      { icon: 'book', title: t('gen.1', 'What kind of writing is it?'), help: t('gen.1H', 'Story, law, poetry, wisdom, prophecy, gospel, letter or apocalyptic?'), tools: ['passage', 'ai:genre'] },
      { icon: 'scroll', title: t('gen.2', 'Then & there'), help: t('gen.2H', 'What did it mean to the original audience?'), tools: ['ai:history', 'context'] },
      { icon: 'path', title: t('gen.3', 'The bridge'), help: t('gen.3H', 'What timeless truth carries across to us?'), tools: ['ai:clear'] },
      { icon: 'check', title: t('gen.4', 'Here & now'), help: t('gen.4H', 'How does it apply to my life and community?'), tools: [] },
    ] },
];

const STOP = new Set(('the and of to a in that he i it his for is was with unto they be not shall him them all but as my are you your have from this which there their when we by thy thee thou ye me so on were what then or one had out who will an at hath said also upon if her she up no do did any into our us its own because even let may might every these those than now been more has would should could about like just come came go went say saith o let ' +
  'le la les de des du un une et en à au aux que qui ne pas il elle ils elles je tu nous vous se sa son ses leur leurs pour dans par sur avec est sont a été mais ou car donc ce cette ces y lui dit comme tout tous plus ' +
  'o a os as de do da dos das um uma e em no na nos nas que não se ele ela eles elas eu tu nós vós seu sua seus suas para por com é foi mas ou como mais pelo pela lhe lhes disse isso este esta ' +
  'el la los las de del un una y en que no se él ella ellos ellas yo tú nosotros su sus para por con es fue pero o como más le les dijo al lo este esta').split(/\s+/));
const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function render(el, { parts, query }) {
  if (parts[0] === 'method') return methodView(el, parts[1], query.get('ref'));
  if (parts[0] === 'guide') return guide(el, query.get('method') || 'inductive', query.get('ref'), query.get('id'));
  return overview(el);
}

function overview(el) {
  const studies = getStudies();
  const steps = PASTOR_STEPS();
  el.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">${t('navs.study', 'Study')}</p><h1>${t('study.title', 'How to study the Bible')}</h1><p>${t('study.intro', 'Proven ways to read the Bible for yourself — choose a method and Lamp walks you through it step by step, saving your answers in your study journal.')}</p></div>
      <a class="btn primary" href="#/study/guide?method=inductive">${icon('compass')} ${t('study.start', 'Start a study')}</a></div>
    <section class="card feature">
      <div class="feature-head"><span class="ico-wrap lg">${icon('anchor')}</span><div><p class="eyebrow">${t('m.hardSrc', 'From a pastor’s teaching on 2 John')}</p><h2>${t('m.hard', 'When Scripture is hard')}</h2><p class="muted">${t('study.hardIntro', 'Some passages confuse or even scare us. Before trying to figure them out, settle your heart — then do the careful work of context.')}</p></div></div>
      <ol class="steps-list">${steps.map(s => `<li><span class="step-ico">${icon(s.icon)}</span><div><b>${esc(s.title)}</b><p>${esc(s.body)}</p></div></li>`).join('')}</ol>
      <div class="row"><a class="btn primary" href="#/study/method/hard">${icon('play')} ${t('study.tryHard', 'See the 2 John example')}</a><a class="btn" href="#/study/guide?method=hard">${t('study.useHard', 'Use it on a passage')}</a></div>
    </section>
    <h2 class="section-title">${t('study.methods', 'More study methods')}</h2>
    <div class="grid">${METHODS().filter(m => m.id !== 'hard').map(m => `<a class="card method-card" href="#/study/method/${m.id}"><span class="ico-wrap">${icon(m.icon)}</span><b>${esc(m.name)}</b><p>${esc(m.sub)}</p><span class="muted small">${esc(m.source)}</span></a>`).join('')}</div>
    <h2 class="section-title">${t('study.mine', 'My studies')}</h2>
    ${studies.length ? `<div class="stack">${studies.map(s => `<div class="card row between"><div><b>${esc(localRef(s.ref))}</b> <span class="tag">${esc(METHODS().find(m => m.id === s.method)?.name || s.method)}</span><p class="muted small" style="margin:4px 0 0">${fmtDate(s.updated)}</p></div><div class="row"><a class="btn small" href="#/study/guide?method=${s.method}&ref=${encodeURIComponent(s.ref)}&id=${s.id}">${t('common.open', 'Open')}</a><button class="icon-btn" data-del="${s.id}" aria-label="${t('common.delete', 'Delete')}">${icon('trash')}</button></div></div>`).join('')}</div>`
      : `<p class="muted">${t('study.none', 'No saved studies yet.')}</p>`}`;
  $$('[data-del]', el).forEach(b => b.addEventListener('click', () => { if (confirm(t('study.confirmDel', 'Delete this study?'))) { removeStudy(b.dataset.del); overview(el); } }));
}

function methodView(el, id, ref) {
  const m = METHODS().find(x => x.id === id) || METHODS()[0];
  const example = id === 'hard' ? [
    t('ex2j.0', '2 John 1–6 repeats “truth” five times and “love” four times. John wants us to see they belong together.'),
    t('ex2j.1', 'Verse 10 says “receive him not into your house, neither bid him God speed”. That sounds unloving — so pause and breathe.'),
    t('ex2j.2', 'Pray honestly: “God, this confuses me. Lead me as I study.”'),
    t('ex2j.3', 'We know Jesus told us to love strangers and enemies (Matthew 5:44; 25:35; Hebrews 13:2). God is good, so there must be more here.'),
    t('ex2j.4', 'Locally: John writes to “the elect lady” — the church (“you” is plural). Globally: election starts in Genesis 12 — God blesses people so they will bless all nations.'),
    t('ex2j.5', 'Historically: hosting a travelling teacher meant funding and platforming their message. Some had left the church teaching a different Jesus (1 John 2:19).'),
    t('ex2j.6', 'Read through the clear: we still love everyone, but the church should not support or platform a message that denies Jesus — it would dim the light we carry.'),
  ] : null;
  el.innerHTML = `
    <a class="back" href="#/study">${icon('chevL')} ${t('study.title', 'How to study the Bible')}</a>
    <div class="page-head"><div><p class="eyebrow">${esc(m.source)}</p><h1>${esc(m.name)}</h1><p>${esc(m.sub)}</p></div></div>
    <form class="card row" id="startForm">
      <label class="sr-only" for="sref">${t('study.passage', 'Passage')}</label>
      <input class="input grow" id="sref" value="${esc(ref ? localRef(ref) : '')}" placeholder="${t('study.passagePh', 'Passage to study, e.g. 2 John 1 or Romans 8')}">
      <button class="btn primary">${icon('play')} ${t('study.begin', 'Begin guided study')}</button>
    </form>
    <ol class="steps-list big">${m.steps.map((s, i) => `<li><span class="step-ico">${icon(s.icon)}</span><div><b>${i + 1}. ${esc(s.title)}</b>${s.help ? `<p>${esc(s.help)}</p>` : ''}${example ? `<p class="example">${icon('info')} <span>${esc(example[i] || '')}</span></p>` : ''}</div></li>`).join('')}</ol>`;
  $('#startForm', el).addEventListener('submit', e => {
    e.preventDefault();
    const r = parseRef($('#sref', el).value);
    if (!r) { toast(t('study.badRef', 'Type a passage like “2 John 1”')); return; }
    location.hash = `#/study/guide?method=${m.id}&ref=${encodeURIComponent(refLabel(r, 'en'))}`;
  });
}

async function guide(el, methodId, refStr, studyId) {
  const m = METHODS().find(x => x.id === methodId) || METHODS()[1];
  const existing = studyId ? getStudies().find(s => s.id === studyId) : null;
  if (!refStr) {
    el.innerHTML = `<a class="back" href="#/study">${icon('chevL')} ${t('study.title', 'How to study the Bible')}</a>
      <div class="card"><h1>${esc(m.name)}</h1>
      <div class="chips" style="margin:10px 0">${METHODS().map(x => `<a class="chip" href="#/study/guide?method=${x.id}" aria-pressed="${x.id === m.id}">${esc(x.name)}</a>`).join('')}</div>
      <form class="row" id="sf"><input class="input grow" id="sref" placeholder="${t('study.passagePh', 'Passage to study, e.g. 2 John 1 or Romans 8')}"><button class="btn primary">${t('study.begin', 'Begin guided study')}</button></form></div>`;
    $('#sf', el).addEventListener('submit', e => { e.preventDefault(); const r = parseRef($('#sref', el).value); if (!r) return toast(t('study.badRef', 'Type a passage like “2 John 1”')); location.hash = `#/study/guide?method=${m.id}&ref=${encodeURIComponent(refLabel(r, 'en'))}`; });
    $('#sref', el).focus();
    return;
  }
  const r = parseRef(refStr);
  if (!r) { location.hash = '#/study'; return; }
  const vid = currentVersion();
  const passage = await getPassage(r, vid).catch(() => []);
  const ptext = passage.map(x => `${x.v} ${x.text}`).join('\n');
  const study = existing || { id: uid(), method: m.id, ref: refLabel(r, 'en'), answers: {}, created: Date.now() };
  let step = 0;
  let breathTimer = null;

  const draw = () => {
    clearInterval(breathTimer);
    const s = m.steps[step];
    el.innerHTML = `
      <div class="guide-head"><a class="icon-btn" href="#/study" aria-label="${t('common.close', 'Close')}">${icon('x')}</a>
        <div class="grow"><p class="eyebrow">${esc(m.name)} · ${esc(localRef(study.ref))}</p>
        <div class="stepper">${m.steps.map((x, i) => `<button class="stp ${i === step ? 'on' : ''} ${study.answers[i] ? 'filled' : ''}" data-step="${i}" aria-label="${t('study.stepN', 'Step {n}', { n: i + 1 })}: ${esc(x.title)}"></button>`).join('')}</div></div></div>
      <div class="guide-grid">
        <section class="card guide-step">
          <p class="eyebrow">${t('study.stepOf', 'Step {n} of {t}', { n: step + 1, t: m.steps.length })}</p>
          <h1 class="step-title">${icon(s.icon)} ${esc(s.title)}</h1>
          ${s.help ? `<p class="lead">${esc(s.help)}</p>` : ''}
          <div id="tools"></div>
          <label class="field">${t('study.yourAnswer', 'Your notes')}<textarea class="input" id="ans" rows="6" placeholder="${t('study.write', 'Write your thoughts…')}">${esc(study.answers[step] || '')}</textarea></label>
          <div class="row between">
            <button class="btn" id="prev" ${step === 0 ? 'disabled' : ''}>${icon('chevL')} ${t('common.back', 'Back')}</button>
            ${step < m.steps.length - 1 ? `<button class="btn primary" id="nextS">${t('common.next', 'Next')} ${icon('chevR')}</button>` : `<button class="btn primary" id="saveS">${icon('check')} ${t('study.save', 'Save study')}</button>`}
          </div>
        </section>
        <aside class="card guide-text"><h3 class="card-title">${icon('book')} ${esc(localRef(study.ref))} <span class="ver-badge">${esc(getVersion(vid).abbr)}</span></h3><div class="serif passage" id="ptext">${passage.map(x => `<p><sup class="vn">${x.v}</sup>${esc(x.text)}</p>`).join('')}</div>
          <a class="btn small ghost" href="${refHash(r)}">${t('study.openReader', 'Open in reader')}</a></aside>
      </div>`;
    const tools = $('#tools', el);
    for (const tool of s.tools) renderTool(tool, tools);
    const ans = $('#ans', el);
    ans.addEventListener('input', () => { study.answers[step] = ans.value; });
    $('#prev', el)?.addEventListener('click', () => { step--; draw(); });
    $('#nextS', el)?.addEventListener('click', () => { step++; draw(); window.scrollTo(0, 0); });
    $('#saveS', el)?.addEventListener('click', () => { saveStudy(study); markActivity('study', 15); toast(t('study.saved', 'Study saved to your journal')); location.hash = '#/study'; });
    $$('[data-step]', el).forEach(b => b.addEventListener('click', () => { step = +b.dataset.step; draw(); }));
  };

  function renderTool(tool, box) {
    const div = document.createElement('div');
    div.className = 'tool';
    box.appendChild(div);
    if (tool === 'passage') { div.innerHTML = `<p class="muted small">${icon('info')} ${t('study.readSide', 'The passage is shown alongside. Read it slowly, maybe twice.')}</p>`; }
    if (tool === 'breath') {
      div.innerHTML = `<div class="breath"><div class="breath-circle" id="bc"></div><p id="bt" aria-live="polite">${t('br.ready', 'Ready')}</p><button class="btn small" id="bgo">${icon('play')} ${t('br.start', 'Breathe with me (3 breaths)')}</button></div>`;
      $('#bgo', div).addEventListener('click', () => {
        const phases = [[t('br.in', 'Breathe in…'), 4000, 'in'], [t('br.hold', 'Hold…'), 2000, 'hold'], [t('br.out', 'Breathe out slowly, like blowing out a candle…'), 6000, 'out']];
        let n = 0, p = 0; const bc = $('#bc', div), bt = $('#bt', div);
        const run = () => { if (n >= 3) { bt.textContent = t('br.done', 'Well done. Your mind is ready.'); bc.className = 'breath-circle'; return; } const [label, ms, cls] = phases[p]; bt.textContent = label; bc.className = 'breath-circle ' + cls; breathTimer = setTimeout(() => { p++; if (p >= phases.length) { p = 0; n++; } run(); }, getSettings().reduceMotion ? ms / 2 : ms); };
        run();
      });
    }
    if (tool === 'prayer') div.innerHTML = `<blockquote class="quote">${t('study.prayer', '“Father, I want to be honest: this is hard for me. Be with me as I study. Lead me, guide me and give me clarity. In Jesus’ name, amen.”')}</blockquote>`;
    if (tool === 'repeated') {
      div.innerHTML = `<button class="btn small" id="rep">${icon('search')} ${t('study.findRep', 'Find repeated words')}</button><div class="chips" id="repOut" style="margin-top:8px"></div>`;
      $('#rep', div).addEventListener('click', () => {
        const counts = {};
        for (const x of passage) for (const w of x.text.split(/[^\p{L}'’]+/u)) { const f = fold(w).replace(/['’].*$/, ''); if (f.length > 2 && !STOP.has(f)) counts[f] = (counts[f] || 0) + 1; }
        const top = Object.entries(counts).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 10);
        $('#repOut', div).innerHTML = top.length ? top.map(([w, n]) => `<button class="chip" data-w="${esc(w)}">${esc(w)} <b>${n}×</b></button>`).join('') : `<span class="muted small">${t('study.noRep', 'No strongly repeated words — try a longer passage.')}</span>`;
        $$('[data-w]', div).forEach(b => b.addEventListener('click', () => {
          const w = b.dataset.w;
          $$('[data-w]', div).forEach(x => x.setAttribute('aria-pressed', x === b));
          $('#ptext', el).innerHTML = passage.map(x => `<p><sup class="vn">${x.v}</sup>${esc(x.text).replace(/[\p{L}'’]+/gu, m2 => fold(m2).replace(/['’].*$/, '') === w ? `<mark>${m2}</mark>` : m2)}</p>`).join('');
        }));
      });
    }
    if (tool === 'anchors') {
      div.innerHTML = `<p class="small muted">${t('study.anchors', 'Things that are clear about God’s character:')}</p><div class="anchor-list"><span class="spinner"></span></div>`;
      Promise.all(ANCHORS.map(async a => ({ a, text: (await getPassage(parseRef(a), vid).catch(() => [])).map(x => x.text).join(' ') }))).then(list => {
        div.querySelector('.anchor-list').innerHTML = list.map(x => `<blockquote class="quote small"><span>${esc(x.text)}</span> <cite>${esc(localRef(x.a))}</cite></blockquote>`).join('');
      });
    }
    if (tool === 'context') {
      const prev = r.c > 1 ? { b: r.b, c: r.c - 1 } : null, next = r.c < BOOKS[r.b].ch ? { b: r.b, c: r.c + 1 } : null;
      div.innerHTML = `<div class="chips">
        ${prev ? `<a class="chip" href="${refHash(prev)}" target="_blank">${icon('chevL')} ${esc(bookName(prev.b))} ${prev.c}</a>` : ''}
        <a class="chip" href="${refHash({ b: r.b, c: r.c })}" target="_blank">${t('study.wholeCh', 'Whole chapter')}</a>
        ${next ? `<a class="chip" href="${refHash(next)}" target="_blank">${esc(bookName(next.b))} ${next.c} ${icon('chevR')}</a>` : ''}
        <a class="chip" href="#/timeline" target="_blank">${icon('clock')} ${t('nav.timeline', 'Timeline')}</a>
        <a class="chip" href="#/map" target="_blank">${icon('map')} ${t('nav.map', 'Maps')}</a></div>
        <div style="margin-top:8px"><button class="btn small" id="bk">${icon('spark')} ${t('study.bookBg', 'Book background (author, audience, purpose)')}</button></div><div id="bkOut"></div>`;
      $('#bk', div).addEventListener('click', () => runAI($('#bkOut', div), [{ role: 'user', content: `For a reader studying ${refLabel(r, 'en')}: summarise the book of ${BOOKS[r.b].name} — author, original audience, date, genre and purpose — and explain how this passage fits in the surrounding chapters (local context) and in the whole Bible story (global context). If the author wrote related books, mention how they help.` }]));
    }
    if (tool.startsWith('ai:')) {
      const kind = tool.slice(3);
      const label = { cross: t('ai.m.cross', 'Cross-references'), history: t('ai.m.context', 'Historical context'), clear: t('study.aiClear', 'Clearer passages on this topic'), simple: t('ai.m.simple', 'Explain simply'), genre: t('study.aiGenre', 'What genre is this?') }[kind];
      const prompt = {
        cross: `List 5–7 passages elsewhere in the Bible that connect to ${refLabel(r, 'en')} (same theme, quotation, fulfilment, contrast). One sentence each.\n\n${ptext}`,
        history: `Explain the historical and cultural context of ${refLabel(r, 'en')}: who wrote it, to whom, their situation, and customs or events that change how we read it.\n\n${ptext}`,
        clear: `Some parts of ${refLabel(r, 'en')} may be hard to understand. Following the principle "interpret unclear scripture through clear scripture", identify what might be unclear here and list the clearest, most repeated passages in the Bible on the same topic, explaining how they help.\n\n${ptext}`,
        simple: `Explain ${refLabel(r, 'en')} simply and answer the questions a first-time reader would likely have.\n\n${ptext}`,
        genre: `What genre is ${refLabel(r, 'en')} (narrative, law, poetry, wisdom, prophecy, gospel, letter, apocalyptic)? Explain how that genre should be read and what to watch for in this passage.\n\n${ptext}`,
      }[kind];
      div.innerHTML = `<button class="btn small">${icon('spark')} ${esc(label)}</button><div class="ai-box"></div>`;
      div.querySelector('button').addEventListener('click', () => runAI(div.querySelector('.ai-box'), [{ role: 'user', content: prompt }]));
    }
  }
  draw();
  return () => clearTimeout(breathTimer);
}
