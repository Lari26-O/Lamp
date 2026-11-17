// Memory verses: Versify-style games + spaced-repetition review.
import { $, $$, esc, icon, toast, announce, speech, shuffle } from '../util.js';
import { parseRef, refLabel, passageText, refHash, localRef, currentVersion, getVersion } from '../bible.js';
import { getCards, getCard, addCard, removeCard, dueCards, grade, preview, humanInterval, level, setGame } from '../srs.js';
import { getSettings, markActivity } from '../store.js';
import { t, LANG } from '../i18n.js';

export const GAMES = [
  { id: 'read', icon: 'eye', name: () => t('game.read', 'Read'), help: () => t('game.readH', 'Read the verse slowly, out loud, three times.') },
  { id: 'listen', icon: 'headphones', name: () => t('game.listen', 'Listen'), help: () => t('game.listenH', 'Hear the verse phrase by phrase and repeat after it.') },
  { id: 'blanks', icon: 'layers', name: () => t('game.blanks', 'Fill blanks'), help: () => t('game.blanksH', 'Type the missing words.') },
  { id: 'build', icon: 'blocks', name: () => t('game.build', 'Build'), help: () => t('game.buildH', 'Tap the words in the right order.') },
  { id: 'letters', icon: 'letters', name: () => t('game.letters', 'First letters'), help: () => t('game.lettersH', 'Type only the first letter of each word.') },
  { id: 'type', icon: 'keyboard', name: () => t('game.type', 'Type'), help: () => t('game.typeH', 'Type the whole verse with a hint.') },
  { id: 'speak', icon: 'mic', name: () => t('game.speak', 'Speak'), help: () => t('game.speakH', 'Say the verse out loud from memory.') },
  { id: 'test', icon: 'trophy', name: () => t('game.test', 'Test'), help: () => t('game.testH', 'Type it from memory, no hints. 90% or more to master it.') },
];

export const COLLECTIONS = [
  { id: 'peace', icon: 'wind', refs: ['Philippians 4:6-7', 'Isaiah 26:3', 'John 14:27', '1 Peter 5:7', 'Matthew 6:34', 'Psalms 56:3'] },
  { id: 'love', icon: 'heart', refs: ['1 Corinthians 13:4-7', 'John 3:16', 'Romans 5:8', '1 John 4:19', 'John 15:13', 'Romans 8:38-39'] },
  { id: 'faith', icon: 'anchor', refs: ['Hebrews 11:1', 'Hebrews 11:6', 'Proverbs 3:5-6', '2 Corinthians 5:7', 'Romans 10:17', 'Mark 11:24'] },
  { id: 'strength', icon: 'bolt', refs: ['Isaiah 40:31', 'Philippians 4:13', 'Joshua 1:9', 'Psalms 46:1', '2 Corinthians 12:9', 'Isaiah 41:10'] },
  { id: 'gospel', icon: 'sun', refs: ['Romans 3:23', 'Romans 6:23', 'Ephesians 2:8-9', 'John 14:6', 'Romans 10:9', '2 Corinthians 5:17'] },
  { id: 'wisdom', icon: 'compass', refs: ['James 1:5', 'Proverbs 1:7', 'Psalms 119:105', 'Proverbs 16:3', 'Colossians 3:16', '2 Timothy 3:16-17'] },
  { id: 'hope', icon: 'star', refs: ['Jeremiah 29:11', 'Romans 15:13', 'Lamentations 3:22-23', 'Romans 8:28', 'Revelation 21:4', 'Psalms 42:11'] },
  { id: 'forgiveness', icon: 'hand', refs: ['1 John 1:9', 'Ephesians 4:32', 'Colossians 3:13', 'Psalms 103:12', 'Micah 7:18', 'Matthew 6:14'] },
  { id: 'identity', icon: 'people', refs: ['Psalms 139:14', 'Galatians 2:20', 'Ephesians 2:10', '1 Peter 2:9', 'John 1:12', 'Romans 8:1'] },
  { id: 'prayer', icon: 'chat', refs: ['Matthew 6:9-13', '1 Thessalonians 5:16-18', 'Jeremiah 33:3', 'Matthew 7:7', 'James 5:16', 'Psalms 145:18'] },
];
const colName = id => t('col.' + id, { peace: 'Peace & anxiety', love: 'God’s love', faith: 'Faith & trust', strength: 'Strength & courage', gospel: 'The gospel', wisdom: 'Wisdom & the Word', hope: 'Hope', forgiveness: 'Forgiveness', identity: 'Who I am in Christ', prayer: 'Prayer' }[id]);

const words = s => s.split(/\s+/).filter(Boolean);
const normW = w => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

export function render(el, { parts, query }) {
  let cleanup = null;
  const route = () => {
    cleanup?.(); cleanup = null;
    if (parts[0] === 'verse' && parts[1]) return verseDetail(parts[1]);
    if (parts[0] === 'play' && parts[1]) return (cleanup = play(parts[1], parts[2] || 'read'));
    if (parts[0] === 'review') return (cleanup = review());
    if (parts[0] === 'explore') return explore();
    return home();
  };

  function home() {
    const cards = getCards();
    const due = dueCards();
    const mastered = cards.filter(c => level(c).n === 3).length;
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">${t('nav.memory', 'Memorize')}</p><h1>${t('mem.title', 'Memory verses')}</h1>
        <p>${t('mem.intro', 'Learn verses with short games, then keep them with spaced review: verses you know come back less often, hard ones come back sooner.')}</p></div></div>
      <div class="stats">
        <div class="stat"><b>${cards.length}</b><span>${t('mem.inDeck', 'verses in your deck')}</span></div>
        <div class="stat"><b>${due.length}</b><span>${t('mem.dueNow', 'due for review')}</span></div>
        <div class="stat"><b>${mastered}</b><span>${t('mem.mastered', 'mastered')}</span></div>
      </div>
      <div class="row" style="margin-bottom:18px">
        <a class="btn primary ${due.length ? '' : 'disabled'}" href="#/memory/review" ${due.length ? '' : 'aria-disabled="true" tabindex="-1"'}>${icon('play')} ${t('mem.review', 'Daily review')} ${due.length ? `<span class="badge inv">${due.length}</span>` : ''}</a>
        <a class="btn" href="#/memory/explore">${icon('compass')} ${t('mem.explore', 'Explore verses')}</a>
      </div>
      <form class="card row" id="addForm">
        <label class="sr-only" for="addRef">${t('mem.addLabel', 'Add a verse by reference')}</label>
        <input class="input grow" id="addRef" placeholder="${t('mem.addPh', 'Add a verse, e.g. Romans 12:2')}">
        <button class="btn primary">${icon('plus')} ${t('common.add', 'Add')}</button>
      </form>
      <h2 class="section-title">${t('mem.deck', 'Your verses')}</h2>
      ${cards.length ? `<div class="grid">${[...cards].sort((a, b) => a.due - b.due).map(cardHtml).join('')}</div>`
        : `<div class="empty-state">${icon('brain', 'xl')}<h3>${t('mem.emptyT', 'Start your first verse')}</h3><p>${t('mem.empty', 'Add one above, pick from a collection, or tap any verse while reading and choose “Memorize”.')}</p><a class="btn primary" href="#/memory/explore">${icon('compass')} ${t('mem.explore', 'Explore verses')}</a></div>`}`;
    $('#addForm', el).addEventListener('submit', async e => {
      e.preventDefault();
      const r = parseRef($('#addRef', el).value);
      if (!r || !r.v1) { toast(t('mem.needRef', 'Type a reference with a verse, like John 3:16')); return; }
      try {
        const vid = currentVersion();
        const text = await passageText(r, vid);
        if (!text) throw new Error();
        toast(addCard(refLabel(r, 'en'), text, vid) ? t('mem.added', '{ref} added to memory verses', { ref: refLabel(r) }) : t('mem.already', 'Already in your memory verses'));
        home();
      } catch { toast(t('mem.notFound', 'Could not find that verse')); }
    });
  }

  function cardHtml(c) {
    const lv = level(c);
    const done = GAMES.filter(g => (c.games?.[g.id] || 0) >= 0.8).length;
    const dueIn = c.due - Date.now();
    return `<a class="card verse-card" href="#/memory/verse/${c.id}">
      <div class="row between"><b>${esc(localRef(c.ref))}</b><span class="lvl lvl-${lv.n}">${esc(lv.label)}</span></div>
      <p class="serif small clamp3">${esc(c.text)}</p>
      <div class="game-dots" aria-label="${t('mem.gamesDone', '{n} of {total} games done', { n: done, total: GAMES.length })}">${GAMES.map(g => `<i class="${(c.games?.[g.id] || 0) >= 0.8 ? 'on' : ''}"></i>`).join('')}</div>
      <span class="muted small">${dueIn <= 0 ? t('mem.dueNowShort', 'Review due') : t('mem.nextIn', 'Next review in {t}', { t: humanInterval(dueIn) })}</span></a>`;
  }

  function verseDetail(id) {
    const c = getCard(id);
    if (!c) { location.hash = '#/memory'; return; }
    const v = getVersion(c.translation);
    el.innerHTML = `
      <a class="back" href="#/memory">${icon('chevL')} ${t('mem.deck', 'Your verses')}</a>
      <div class="card hero-verse">
        <p class="eyebrow">${esc(v.abbr)}</p>
        <h1>${esc(localRef(c.ref))}</h1>
        <p class="serif big">${esc(c.text)}</p>
        <div class="row"><button class="btn small" id="hear">${icon('speaker')} ${t('mem.hear', 'Hear it')}</button><a class="btn small ghost" href="${refHash(parseRef(c.ref) || { b: 0, c: 1 })}">${icon('book')} ${t('mem.context', 'Read in context')}</a>
        <button class="btn small ghost danger" id="del">${icon('trash')} ${t('common.remove', 'Remove')}</button></div>
      </div>
      <h2 class="section-title">${t('mem.practice', 'Practice')}</h2>
      <p class="muted">${t('mem.practiceHint', 'Work through the games from top to bottom. Each one hides a little more of the verse.')}</p>
      <div class="game-grid">${GAMES.filter(g => g.id !== 'speak' || recognitionSupported()).map((g, i) => {
        const sc = c.games?.[g.id] || 0;
        return `<a class="game-tile ${sc >= 0.8 ? 'done' : ''}" href="#/memory/play/${c.id}/${g.id}"><span class="gi">${icon(g.icon)}</span><span class="gstep">${i + 1}</span><b>${g.name()}</b><small>${g.help()}</small>${sc ? `<span class="gscore">${Math.round(sc * 100)}%</span>` : ''}</a>`;
      }).join('')}</div>`;
    $('#hear', el).addEventListener('click', () => sayIt(c));
    $('#del', el).addEventListener('click', () => { if (confirm(t('mem.confirmDel', 'Remove this verse from your deck?'))) { removeCard(c.id); location.hash = '#/memory'; } });
  }

  async function explore() {
    el.innerHTML = `<a class="back" href="#/memory">${icon('chevL')} ${t('mem.deck', 'Your verses')}</a>
      <div class="page-head"><div><h1>${t('mem.explore', 'Explore verses')}</h1><p>${t('mem.exploreSub', 'Collections of verses people love to memorize. Add any to your deck.')}</p></div></div>
      <div id="cols" class="stack"></div>`;
    const box = $('#cols', el);
    const vid = currentVersion();
    for (const col of COLLECTIONS) {
      const sec = document.createElement('section');
      sec.className = 'card';
      sec.innerHTML = `<h3 class="card-title">${icon(col.icon)} ${esc(colName(col.id))}</h3><div class="col-list"><span class="spinner"></span></div>`;
      box.appendChild(sec);
      const items = await Promise.all(col.refs.map(async r => ({ r, text: await passageText(r, vid).catch(() => '') })));
      const draw = () => {
        sec.querySelector('.col-list').innerHTML = items.map(({ r, text }) => {
          const has = getCards().some(c => c.ref === r);
          return `<div class="col-item"><div><b>${esc(localRef(r))}</b><p class="serif small">${esc(text)}</p></div><button class="btn small ${has ? '' : 'primary'}" data-add="${esc(r)}" ${has ? 'disabled' : ''}>${icon(has ? 'check' : 'plus')} ${has ? t('mem.inDeckShort', 'Added') : t('common.add', 'Add')}</button></div>`;
        }).join('');
        $$('[data-add]', sec).forEach(b => b.addEventListener('click', () => {
          const it = items.find(x => x.r === b.dataset.add);
          if (it?.text && addCard(it.r, it.text, vid)) { toast(t('mem.added', '{ref} added to memory verses', { ref: localRef(it.r) })); draw(); }
        }));
      };
      draw();
    }
  }

  // ---------------- games ----------------
  function play(id, gameId) {
    const c = getCard(id);
    if (!c) { location.hash = '#/memory'; return; }
    const g = GAMES.find(x => x.id === gameId) || GAMES[0];
    const idx = GAMES.indexOf(g);
    const nextGame = GAMES.slice(idx + 1).find(x => x.id !== 'speak' || recognitionSupported());
    const ws = words(c.text);
    let stopFns = [];
    el.innerHTML = `
      <div class="play-head"><a class="icon-btn" href="#/memory/verse/${c.id}" aria-label="${t('common.back', 'Back')}">${icon('x')}</a>
        <div class="progress grow"><i id="pbar" style="width:0%"></i></div></div>
      <div class="card play-card">
        <p class="eyebrow">${icon(g.icon)} ${g.name()}</p>
        <h1 class="ref">${esc(localRef(c.ref))}</h1>
        <p class="muted small">${g.help()}</p>
        <div id="stage"></div>
        <div id="fin"></div>
      </div>`;
    const stage = $('#stage', el), pbar = $('#pbar', el);
    const setP = x => { pbar.style.width = Math.round(x * 100) + '%'; };
    const finish = score => {
      setP(1);
      setGame(c.id, g.id, score);
      markActivity('game', Math.round(score * 5) + 2);
      $('#fin', el).innerHTML = `<div class="feedback ${score >= 0.8 ? 'ok' : 'no'}">${icon(score >= 0.8 ? 'check' : 'target')} <span>${score >= 0.8 ? t('game.great', 'Well done — {p}%', { p: Math.round(score * 100) }) : t('game.keep', '{p}% — try once more to lock it in.', { p: Math.round(score * 100) })}</span></div>
        <div class="row" style="justify-content:center"><a class="btn" href="#/memory/play/${c.id}/${g.id}" id="again">${icon('shuffle')} ${t('game.again', 'Again')}</a>
        ${nextGame ? `<a class="btn primary" href="#/memory/play/${c.id}/${nextGame.id}">${t('game.next', 'Next: {g}', { g: nextGame.name() })} ${icon('chevR')}</a>` : `<a class="btn primary" href="#/memory/verse/${c.id}">${t('common.done', 'Done')}</a>`}</div>`;
      $('#again', el).addEventListener('click', e => { e.preventDefault(); window.dispatchEvent(new HashChangeEvent('hashchange')); });
      if (g.id === 'test' && score >= 0.9) toast(t('game.mastered', 'Verse mastered'));
      $('#fin a.btn.primary', el)?.focus();
    };

    if (g.id === 'read') {
      let n = 0;
      stage.innerHTML = `<p class="play-text serif">${esc(c.text)}</p><div class="row center"><button class="btn" id="hear">${icon('speaker')} ${t('mem.hear', 'Hear it')}</button><button class="btn primary" id="tick">${icon('check')} ${t('game.readOnce', 'I read it')} <span id="cnt">0/3</span></button></div>`;
      $('#hear', el).addEventListener('click', () => sayIt(c));
      $('#tick', el).addEventListener('click', () => { n++; $('#cnt', el).textContent = `${n}/3`; setP(n / 3); if (n >= 3) { $('#tick', el).disabled = true; finish(1); } });
    }

    if (g.id === 'listen') {
      const chunks = phrases(c.text);
      let i = 0;
      stage.innerHTML = `<p class="play-text serif" id="lt">${chunks.map((p, k) => `<span class="chunk" data-k="${k}">${esc(p)}</span>`).join(' ')}</p><div class="row center"><button class="btn primary" id="lp">${icon('play')} ${t('game.playAll', 'Listen to the whole verse')}</button></div><p class="muted small center">${t('game.repeat', 'After each phrase, say it back out loud.')}</p>`;
      if (!speech.supported) stage.insertAdjacentHTML('beforeend', `<p class="muted small center">${t('read.noTTS', 'Read-aloud is not supported in this browser')}</p>`);
      let playing = false;
      $('#lp', el).addEventListener('click', () => {
        if (playing) return; playing = true;
        const s2 = getSettings();
        speech.stop();
        speech.speak(c.text, { parts: chunks, rate: s2.ttsRate * 0.95, voice: s2.ttsVoice, lang: getVersion(c.translation).lang,
          onpart: k => { $$('.chunk', el).forEach((x, j) => x.classList.toggle('on', j === k)); setP((k + 1) / chunks.length); },
          onend: () => { playing = false; $$('.chunk', el).forEach(x => x.classList.remove('on')); setTimeout(() => finish(1), 600); } });
      });
      stopFns.push(() => speech.stop());
    }

    if (g.id === 'blanks') {
      const lvl = Math.min(3, Math.floor((c.games?.blanks || 0) * 4));
      const pct = [0.3, 0.45, 0.6, 0.8][lvl];
      const cand = ws.map((w, k) => k).filter(k => normW(ws[k]).length > 2);
      const hide = new Set(shuffle(cand).slice(0, Math.max(1, Math.round(cand.length * pct))));
      stage.innerHTML = `<p class="play-text serif blanks">${ws.map((w, k) => hide.has(k) ? `<input class="blank-in" data-k="${k}" size="${Math.max(3, w.length)}" aria-label="${t('game.missing', 'Missing word')}" autocomplete="off" autocapitalize="off" spellcheck="false">` : esc(w)).join(' ')}</p><div class="row center"><button class="btn" id="hint">${t('game.hint', 'Hint')}</button><button class="btn primary" id="chk">${t('game.check', 'Check')}</button></div>`;
      const inputs = $$('.blank-in', stage);
      inputs[0]?.focus();
      inputs.forEach((inp, k) => inp.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && inp.value) { e.preventDefault(); (inputs[k + 1] || $('#chk', el)).focus(); } }));
      stage.addEventListener('input', () => setP(inputs.filter(x => x.value).length / inputs.length));
      $('#hint', el).addEventListener('click', () => { const inp = inputs.find(x => normW(x.value) !== normW(ws[+x.dataset.k])); if (inp) { inp.value = ws[+inp.dataset.k].replace(/[^\p{L}\p{N}'’-]/gu, '').slice(0, Math.max(1, inp.value.length + 1)); inp.focus(); } });
      $('#chk', el).addEventListener('click', () => {
        let ok = 0;
        inputs.forEach(inp => { const right = normW(inp.value) === normW(ws[+inp.dataset.k]); if (right) ok++; inp.classList.add(right ? 'right' : 'wrong'); if (!right) { inp.title = ws[+inp.dataset.k]; inp.value = ws[+inp.dataset.k].replace(/[^\p{L}\p{N}'’-]/gu, ''); } inp.readOnly = true; });
        $('#chk', el).disabled = true; $('#hint', el).disabled = true;
        finish(ok / inputs.length);
      });
    }

    if (g.id === 'build') {
      const chunks = ws.length > 18 ? phrases(c.text, 3) : ws;
      const bank = shuffle(chunks.map((w, k) => ({ w, k })));
      let pos = 0, mistakes = 0;
      stage.innerHTML = `<p class="play-text serif built" id="built" aria-live="polite"></p><div class="bank" id="bank">${bank.map(x => `<button class="wchip" data-k="${x.k}">${esc(x.w)}</button>`).join('')}</div>`;
      $('#bank', el).addEventListener('click', e => {
        const b = e.target.closest('.wchip'); if (!b) return;
        const k = +b.dataset.k;
        if (normW(chunks[k]) === normW(chunks[pos])) {
          b.remove(); $('#built', el).insertAdjacentHTML('beforeend', `<span class="placed">${esc(chunks[pos])}</span> `); pos++; setP(pos / chunks.length);
          if (pos >= chunks.length) finish(Math.max(0, 1 - mistakes / chunks.length));
        } else { mistakes++; b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); announce(t('game.tryAgain', 'Try again')); }
      });
    }

    if (g.id === 'letters') {
      let pos = 0, mistakes = 0;
      stage.innerHTML = `<p class="play-text serif" id="lw">${ws.map((w, k) => `<span class="lw" data-k="${k}">${esc(w.replace(/[\p{L}\p{N}]/gu, '_'))}</span>`).join(' ')}</p>
        <label class="sr-only" for="lin">${t('game.typeFirst', 'Type the first letter of the next word')}</label>
        <input id="lin" class="input letter-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${t('game.typeFirst', 'Type the first letter of the next word')}">`;
      const inp = $('#lin', el); inp.focus();
      inp.addEventListener('input', () => {
        const ch = normW(inp.value.slice(-1)); inp.value = '';
        if (!ch || pos >= ws.length) return;
        const want = normW(ws[pos])[0];
        const span = $(`.lw[data-k="${pos}"]`, stage);
        if (ch === want) { span.textContent = ws[pos]; span.classList.add('ok'); pos++; setP(pos / ws.length); if (pos >= ws.length) { inp.disabled = true; finish(Math.max(0, 1 - mistakes / ws.length)); } }
        else { mistakes++; span.classList.remove('bad'); void span.offsetWidth; span.classList.add('bad'); }
      });
    }

    if (g.id === 'type' || g.id === 'test') {
      const hint = g.id === 'type' ? ws.map(w => w.replace(/^([^\p{L}]*)(\p{L})[\p{L}'’-]*/u, '$1$2')).join(' ') : '';
      stage.innerHTML = `${hint ? `<p class="play-text serif hint-letters">${esc(hint)}</p>` : ''}<label class="sr-only" for="typed">${t('game.typeVerse', 'Type the verse')}</label><textarea class="input" id="typed" rows="4" placeholder="${t('game.typeVerse', 'Type the verse')}…" autocapitalize="sentences"></textarea><div class="row center"><button class="btn primary" id="chk">${t('game.check', 'Check')}</button></div>`;
      const ta = $('#typed', el); ta.focus();
      ta.addEventListener('input', () => setP(Math.min(1, words(ta.value).length / ws.length)));
      $('#chk', el).addEventListener('click', () => {
        const { html, score } = diff(c.text, ta.value);
        stage.innerHTML = `<p class="play-text serif diff">${html}</p>`;
        announce(t('game.pct', '{p} percent correct', { p: Math.round(score * 100) }));
        finish(score);
      });
    }

    if (g.id === 'speak') {
      stage.innerHTML = `<div class="center"><button class="mic-btn" id="mic" aria-label="${t('game.startSpeak', 'Start speaking')}">${icon('mic')}</button><p class="muted" id="heard">${t('game.tapMic', 'Tap the microphone and recite the verse.')}</p></div>`;
      const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
      let rec;
      $('#mic', el).addEventListener('click', () => {
        rec = new Rec(); rec.lang = { en: 'en-US', fr: 'fr-FR', pt: 'pt-BR', es: 'es-ES' }[getVersion(c.translation).lang] || 'en-US';
        rec.interimResults = true; rec.continuous = true;
        let final = '';
        $('#mic', el).classList.add('live');
        rec.onresult = e => { let txt = ''; for (const r of e.results) txt += r[0].transcript + ' '; final = txt; $('#heard', el).textContent = txt; setP(Math.min(1, words(txt).length / ws.length)); };
        rec.onerror = () => { $('#mic', el).classList.remove('live'); toast(t('game.micErr', 'Microphone not available')); };
        rec.onend = () => { $('#mic', el).classList.remove('live'); if (final) { const { html, score } = diff(c.text, final); stage.insertAdjacentHTML('beforeend', `<p class="play-text serif diff">${html}</p>`); finish(score); } };
        rec.start();
        setTimeout(() => { try { rec.stop(); } catch {} }, Math.max(8000, ws.length * 700));
      });
      stopFns.push(() => { try { rec?.abort(); } catch {} });
    }
    return () => stopFns.forEach(f => f());
  }

  // ---------------- spaced review ----------------
  function review() {
    const list = dueCards();
    let i = 0;
    const next = () => {
      if (i >= list.length) {
        el.innerHTML = `<div class="result-card card"><div class="big-ico">${icon('check')}</div><h1>${t('mem.reviewDone', 'Review complete')}</h1><p>${t('mem.reviewedN', 'You reviewed {n} verses. See you tomorrow.', { n: list.length })}</p><a class="btn primary" href="#/memory">${t('common.done', 'Done')}</a></div>`;
        return;
      }
      const c = list[i];
      const lvl = Math.min(0.85, 0.35 + (c.reps || 0) * 0.15);
      const ws = words(c.text);
      const hide = new Set(shuffle(ws.map((w, k) => k).filter(k => normW(ws[k]).length > 2)).slice(0, Math.round(ws.length * lvl)));
      el.innerHTML = `
        <div class="play-head"><a class="icon-btn" href="#/memory" aria-label="${t('common.back', 'Back')}">${icon('x')}</a><div class="progress grow"><i style="width:${(i / list.length) * 100}%"></i></div><span class="muted small">${i + 1}/${list.length}</span></div>
        <div class="card play-card">
          <h1 class="ref">${esc(localRef(c.ref))}</h1>
          <p class="muted small">${t('mem.reviewHint', 'Say the verse from memory. Tap blanks to peek, then reveal and rate yourself.')}</p>
          <p class="play-text serif">${ws.map((w, k) => hide.has(k) ? `<button class="blank" aria-label="${t('game.missing', 'Missing word')}">${esc(w)}</button>` : esc(w)).join(' ')}</p>
          <div class="row center"><button class="btn" id="hear">${icon('speaker')}</button><button class="btn primary" id="rev">${t('mem.reveal', 'Reveal')}</button></div>
          <div id="rate"></div>
        </div>`;
      $$('.blank', el).forEach(b => b.addEventListener('click', () => b.classList.add('shown')));
      $('#hear', el).addEventListener('click', () => sayIt(c));
      $('#rev', el).addEventListener('click', () => {
        $$('.blank', el).forEach(b => b.classList.add('shown'));
        const labels = [t('mem.again', 'Again'), t('mem.hard', 'Hard'), t('mem.good', 'Good'), t('mem.easy', 'Easy')];
        $('#rate', el).innerHTML = `<p class="muted small center">${t('mem.how', 'How well did you remember?')}</p><div class="rate">${labels.map((l, g) => `<button class="btn ${g === 2 ? 'primary' : ''}" data-g="${g}">${l}<small>${humanInterval(preview(c, g).dueIn)}</small></button>`).join('')}</div>`;
        $$('[data-g]', el).forEach(b => b.addEventListener('click', () => { grade(c.id, +b.dataset.g); i++; next(); }));
        $('#rate .btn.primary', el).focus();
      });
    };
    next();
    return () => speech.stop();
  }

  route();
  return () => { cleanup?.(); speech.stop(); };
}

function sayIt(c) { const s = getSettings(); speech.stop(); speech.speak(c.text, { rate: s.ttsRate, voice: s.ttsVoice, lang: getVersion(c.translation).lang }); }
const recognitionSupported = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);
// Split a verse into natural phrases (by punctuation, max ~n words otherwise).
function phrases(text, max = 7) {
  const parts = text.split(/(?<=[,;:.!?])\s+/).flatMap(p => { const w = p.split(/\s+/); const out = []; for (let i = 0; i < w.length; i += max) out.push(w.slice(i, i + max).join(' ')); return out; });
  return parts.filter(Boolean);
}

// Word-level comparison using longest common subsequence.
export function diff(original, typed) {
  const a = words(original), b = words(typed);
  const A = a.map(normW), B = b.map(normW);
  const dp = Array.from({ length: A.length + 1 }, () => new Array(B.length + 1).fill(0));
  for (let i = A.length - 1; i >= 0; i--) for (let j = B.length - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  let i = 0, j = 0; const out = [];
  while (i < A.length) {
    if (j < B.length && A[i] === B[j]) { out.push(`<ins>${esc(a[i])}</ins>`); i++; j++; }
    else if (j < B.length && dp[i][j + 1] > dp[i + 1][j]) { out.push(`<del>${esc(b[j])}</del>`); j++; }
    else { out.push(`<span class="miss">${esc(a[i])}</span>`); i++; }
  }
  while (j < B.length) out.push(`<del>${esc(b[j++])}</del>`);
  return { html: out.join(' ') + `<br><span class="small muted legend"><ins>${t('diff.ok', 'correct')}</ins> <span class="miss">${t('diff.miss', 'missed')}</span> <del>${t('diff.extra', 'extra')}</del></span>`, score: A.length ? dp[0][0] / A.length : 0 };
}
