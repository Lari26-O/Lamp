// Children's mode (Pre-K – 3rd grade): stories of Jesus, picture games,
// coloring and stickers. Everything can be heard out loud; for children who
// do not read yet (Pre-K – 1st grade) each page is read automatically.
import { $, $$, esc, icon, shuffle, speech } from '../util.js';
import { load, save, markActivity, getSettings } from '../store.js';
import { getProfile, isPreReader, L } from '../profile.js';
import { STORIES, PIC_WORDS, JESUS_ORDER } from '../kids-data.js';
import { scene, pic, PIC_IDS, colorSrc, realSrc, cover } from '../kids-art.js';
import { todayChallenge, challengeText, isDone, completeChallenge } from '../challenges.js';
import { t, LANG } from '../i18n.js';
import { kidsStreak } from '../streaks.js';
import * as VoicePlayer from '../voice-player.js';

const kstate = () => ({ stories: {}, stickers: {}, ...load('kids', {}) });
const ksave = s => { save('kids', s); window.dispatchEvent(new Event('lamp:data')); };
const giveSticker = key => { const s = kstate(); if (!s.stickers[key]) { s.stickers[key] = Date.now(); ksave(s); return true; } return false; };

// ---- voice ----
// Free recorded storyteller voice (Kokoro clips from tools/record_voices.py, played by
// js/voice-player.js); if a sentence can't be played that way, the device's own voice.
let sayId = 0;
export function say(text, opts = {}) {
  if (!text) return;
  const id = ++sayId;
  speech.stop(); VoicePlayer.stop();
  if (getSettings().kidsVoice === 'device') { speakDevice(text, opts); return; }
  VoicePlayer.say(text, LANG, { onend: opts.onend }).then(ok => { if (!ok && id === sayId) speakDevice(text, opts); });
}
function speakDevice(text, opts) {
  if (!speech.supported) return;
  const s = getSettings();
  speech.speak(text, { rate: (s.ttsRate || 1) * 0.95, voice: s.ttsVoice, lang: LANG, ...opts });
}
export const stopSay = () => { sayId++; speech.stop(); VoicePlayer.stop(); };
const hear = (text, cls = '') => `<button class="kid-hear ${cls}" data-say="${esc(text)}" aria-label="${t('kids.hear', 'Hear it')}">${icon('speaker')}</button>`;
const auto = text => { if (isPreReader()) setTimeout(() => say(text), 350); };
const cheer = () => { const c = t('kids.cheers', 'Great job!|Yes! Well done!|Awesome!|You did it!|Super!').split('|'); return c[Math.floor(Math.random() * c.length)]; };
function confetti(host = document.body) {
  if (getSettings().reduceMotion) return;
  const box = document.createElement('div'); box.className = 'confetti';
  const colors = ['#ff5a8a', '#ffd23f', '#00b894', '#0984e3', '#a55eea', '#ff9f43'];
  box.innerHTML = Array.from({ length: 28 }, (_, i) => `<i style="--x:${(Math.random() * 2 - 1) * 260}px;--y:${-160 - Math.random() * 220}px;--r:${Math.random() * 720}deg;background:${colors[i % colors.length]};left:${45 + Math.random() * 10}%"></i>`).join('');
  host.appendChild(box); setTimeout(() => box.remove(), 1600);
}

export function render(el, { parts }) {
  const handler = e => { const b = e.target.closest('[data-say]'); if (b) { e.preventDefault(); say(b.dataset.say); } };
  el.addEventListener('click', handler);
  const [a, b] = parts;
  let cleanup;
  if (a === 'story' && b) cleanup = story(el, b);
  else if (a === 'games') games(el);
  else if (a === 'game' && b === 'memory') cleanup = memory(el);
  else if (a === 'game' && b === 'quiz') pictureQuiz(el);
  else if (a === 'game' && b === 'order') orderGame(el);
  else if (a === 'game' && b === 'color') coloring(el, parts[2]);
  else if (a === 'stickers') stickers(el);
  else if (a === 'today') todayView(el);
  else home(el);
  return () => { el.removeEventListener('click', handler); speech.stop(); cleanup?.(); };
}

function home(el) {
  const st = kstate(); const p = getProfile();
  const next = STORIES.find(s => !st.stories[s.id]) || STORIES[0];
  const ch = todayChallenge(); const done = isDone(ch);
  const hello = p.name ? t('kids.hi', 'Hi, {name}!', { name: p.name }) : t('kids.hiAll', 'Hi, friend!');
  const ks = kidsStreak();
  el.innerHTML = `
    <section class="kid-hero" style="--kc:${next.color}">
      <div class="kid-hero-text"><h1>${esc(hello)} ${hear(hello + ' ' + t('kids.welcome', 'Let’s learn about Jesus!'))}</h1><p>${t('kids.welcome', 'Let’s learn about Jesus!')}</p>
        <a class="kid-btn big" href="#/kids/story/${next.id}">${icon('play')} ${esc(L(next.title))}</a></div>
      <div class="kid-hero-art">${scene(next.scene, cover(next.scene), { eager: true })}</div>
    </section>
    <a class="kid-card challenge ${done ? 'done' : ''}" href="#/kids/today"><span class="kid-ico">${icon(done ? 'check' : 'star')}</span><div><b>${t('kids.todayChallenge', 'Today’s challenge')}</b><p>${esc(challengeText(ch))}</p></div>${hear(challengeText(ch))}</a>
    ${ks.html.replace('</b><ol', '</b> ' + hear(ks.text) + '<ol')}
    ${[['nt', t('kids.stories', 'Stories about Jesus')], ['ot', t('kids.otStories', 'Old Testament stories')]].map(([part, label]) => `<h2 class="kid-title">${label} ${hear(label)}</h2>
    <div class="kid-grid">${STORIES.filter(s => s.part === part).map((s, i) => `<a class="kid-story ${st.stories[s.id] ? 'done' : ''}" href="#/kids/story/${s.id}" style="--kc:${s.color}"><span class="kid-thumb">${scene(s.scene, cover(s.scene))}</span><b><span class="n">${i + 1}</span>${esc(L(s.title))}</b>${st.stories[s.id] ? `<span class="kid-done">${icon('check')}</span>` : ''}</a>`).join('')}</div>`).join('')}
    <div class="kid-row">
      <a class="kid-tile" href="#/kids/games" style="--kc:#a55eea">${pic('star')}<b>${t('kids.games', 'Games')}</b></a>
      <a class="kid-tile" href="#/kids/game/color" style="--kc:#ff9f43">${pic('tree')}<b>${t('kids.color', 'Coloring')}</b></a>
      <a class="kid-tile" href="#/kids/stickers" style="--kc:#ff5a8a">${pic('heart')}<b>${t('kids.stickers', 'My stickers')}</b></a>
    </div>`;
  auto(hello + ' ' + t('kids.welcome', 'Let’s learn about Jesus!'));
}

function story(el, id) {
  const s = STORIES.find(x => x.id === id); if (!s) { location.hash = '#/kids'; return; }
  const steps = [
    ...s.pages.map((pg, n) => ({ kind: 'page', text: L(pg), n: n + 1 })),
    ...(s.summary ? [{ kind: 'summary', text: L(s.summary) }] : []),
    { kind: 'truth', text: L(s.truth) },
    { kind: 'verse', text: L(s.verse.text), ref: s.verse.ref },
    { kind: 'talk', text: L(s.talk) },
    ...s.quiz.map(q => ({ kind: 'quiz', q })),
    { kind: 'order' },
    { kind: 'end' },
  ];
  let i = 0;
  const draw = () => {
    const step = steps[i];
    const dots = `<div class="kid-dots">${steps.map((_, k) => `<i class="${k < i ? 'on' : k === i ? 'cur' : ''}"></i>`).join('')}</div>`;
    let body = '', speakText = '';
    if (step.kind === 'page') { speakText = step.text; body = `<div class="kid-scene-box">${scene(s.scene, step.n, { eager: true })}</div><p class="kid-text" data-say="${esc(step.text)}">${esc(step.text)}</p>`; }
    if (step.kind === 'summary') { speakText = step.text; body = `<div class="kid-recap">${[2, 5, 8].map(n => `<span>${scene(s.scene, n)}</span>`).join('')}</div><p class="kid-label">${t('kids.summary', 'The story in short')}</p><p class="kid-text" data-say="${esc(step.text)}">${esc(step.text)}</p>`; }
    if (step.kind === 'truth') { speakText = step.text; body = `<div class="kid-big-ico" style="--kc:${s.color}">${pic('heart')}</div><p class="kid-label">${t('kids.remember', 'Remember:')}</p><p class="kid-text big" data-say="${esc(step.text)}">${esc(step.text)}</p>`; }
    if (step.kind === 'verse') { speakText = step.text; body = `<div class="kid-big-ico" style="--kc:#ffd23f">${pic('dove')}</div><p class="kid-label">${t('kids.sayWithMe', 'Say it with me!')}</p><p class="kid-text big" data-say="${esc(step.text)}">“${esc(step.text)}”</p><p class="kid-ref">${esc(step.ref)}</p><button class="kid-btn" id="echo">${icon('speaker')} ${t('kids.listenRepeat', 'Listen, then say it')}</button>`; }
    if (step.kind === 'talk') { speakText = step.text; body = `<div class="kid-big-ico" style="--kc:#74b9ff">${pic('people')}</div><p class="kid-label">${t('kids.talk', 'Talk about it')}</p><p class="kid-text big" data-say="${esc(step.text)}">${esc(step.text)}</p>`; }
    if (step.kind === 'quiz') {
      speakText = L(step.q.q);
      body = `<p class="kid-text big" data-say="${esc(speakText)}">${esc(speakText)}</p><div class="kid-choices">${shuffle(step.q.opts).map(o => `<button class="kid-choice" data-o="${o}" aria-label="${esc(L(PIC_WORDS[o]))}">${pic(o)}<span>${esc(L(PIC_WORDS[o]))}</span></button>`).join('')}</div><p class="kid-feedback" id="fb" aria-live="polite"></p>`;
    }
    if (step.kind === 'order') {
      speakText = t('kids.storyOrder', 'What happened first? Tap the pictures in the right order!');
      const picks = [1, 3, 6, 8];
      body = `<p class="kid-label">${t('kids.storyGame', 'Story game')}</p><p class="kid-text big" data-say="${esc(speakText)}">${esc(speakText)}</p>
        <div class="story-order">${shuffle(picks.map((n, k) => ({ n, k }))).map(x => `<button class="so-card" data-k="${x.k}">${scene(s.scene, x.n)}<span class="so-num"></span></button>`).join('')}</div>
        <p class="kid-feedback" id="fb" aria-live="polite"></p>`;
    }
    if (step.kind === 'end') {
      const st = kstate(); const first = !st.stories[s.id]; st.stories[s.id] = Date.now(); ksave(st);
      const newSticker = giveSticker('story-' + s.id);
      if (first) markActivity('kidstory', 10);
      speakText = t('kids.storyDone', 'You finished the story! You got a sticker!');
      body = `<div class="kid-sticker-win" style="--kc:${s.color}">${pic(s.sticker)}</div><p class="kid-text big">${t('kids.storyDone', 'You finished the story! You got a sticker!')}</p>
        <div class="kid-row center"><a class="kid-btn" href="#/kids/game/color/${s.id}">${icon('pen')} ${t('kids.colorThis', 'Color this story')}</a><a class="kid-btn alt" href="#/kids">${icon('home')} ${t('kids.home', 'Home')}</a></div>`;
      if (newSticker) setTimeout(() => confetti(el), 200);
    }
    el.innerHTML = `<div class="kid-reader" style="--kc:${s.color}">
      <div class="kid-top"><a class="kid-round" href="#/kids" aria-label="${t('kids.home', 'Home')}">${icon('x')}</a>${dots}${speakText ? hear(speakText, 'lg') : '<span></span>'}</div>
      <h1 class="kid-story-title">${esc(L(s.title))}</h1>
      <div class="kid-page">${body}</div>
      ${step.kind !== 'end' && step.kind !== 'quiz' && step.kind !== 'order' ? `<div class="kid-nav">${i > 0 ? `<button class="kid-round big" id="prev" aria-label="${t('common.back', 'Back')}">${icon('chevL')}</button>` : '<span></span>'}<button class="kid-btn big" id="next">${t('kids.next', 'Next')} ${icon('chevR')}</button></div>` : ''}
    </div>`;
    $('#next', el)?.addEventListener('click', () => { i++; draw(); });
    $('#prev', el)?.addEventListener('click', () => { i--; draw(); });
    $('#echo', el)?.addEventListener('click', () => say(step.text, { onend: () => setTimeout(() => say(t('kids.yourTurn', 'Now you say it!')), 300) }));
    $$('.kid-choice', el).forEach(btn => btn.addEventListener('click', () => {
      const ok = btn.dataset.o === step.q.a;
      btn.classList.add(ok ? 'right' : 'wrong');
      if (ok) {
        $$('.kid-choice', el).forEach(x => x.disabled = true);
        const msg = cheer() + (step.q.say ? ' ' + L(step.q.say) : '');
        $('#fb', el).textContent = msg; say(msg); confetti(el);
        setTimeout(() => { i++; draw(); }, 1700);
      } else { const msg = t('kids.tryAgain', 'Try again!'); $('#fb', el).textContent = msg; say(msg); }
    }));
    if (step.kind === 'order') {
      let want = 0;
      $$('.so-card', el).forEach(btn => btn.addEventListener('click', () => {
        if (btn.disabled) return;
        if (+btn.dataset.k === want) {
          btn.disabled = true; btn.classList.add('right'); btn.querySelector('.so-num').textContent = ++want;
          if (want === 4) { const msg = cheer() + ' ' + t('kids.understood', 'You remember the whole story!'); $('#fb', el).textContent = msg; say(msg); confetti(el); markActivity('kidgame', 5); setTimeout(() => { i++; draw(); }, 2200); }
        } else {
          btn.classList.add('wrong'); setTimeout(() => btn.classList.remove('wrong'), 400);
          const msg = t('kids.notYet', 'Not yet! What happened before?'); $('#fb', el).textContent = msg; say(msg);
        }
      }));
    }
    if (speakText) auto(speakText);
  };
  draw();
}

function games(el) {
  el.innerHTML = `<div class="kid-top"><a class="kid-round" href="#/kids" aria-label="${t('kids.home', 'Home')}">${icon('chevL')}</a><h1 class="kid-title">${t('kids.games', 'Games')} ${hear(t('kids.games', 'Games'))}</h1><span></span></div>
    <div class="kid-games">
      <a class="kid-game" href="#/kids/game/memory" style="--kc:#a55eea">${pic('sheep')}<b>${t('kids.memory', 'Memory match')}</b>${hear(t('kids.memoryH', 'Find the matching pictures!'))}</a>
      <a class="kid-game" href="#/kids/game/quiz" style="--kc:#00b894">${pic('star')}<b>${t('kids.quiz', 'Picture quiz')}</b>${hear(t('kids.quizH', 'Listen and tap the right picture!'))}</a>
      <a class="kid-game" href="#/kids/game/order" style="--kc:#0984e3">${pic('jesus')}<b>${t('kids.order', 'Jesus’ story in order')}</b>${hear(t('kids.orderH', 'Put the story of Jesus in the right order!'))}</a>
      <a class="kid-game" href="#/kids/game/color" style="--kc:#ff9f43">${pic('tree')}<b>${t('kids.color', 'Coloring')}</b>${hear(t('kids.colorH', 'Pick a color and tap the picture!'))}</a>
    </div>`;
  auto(t('kids.pickGame', 'Pick a game!'));
}

function memory(el) {
  const ids = shuffle(['star', 'sheep', 'fish', 'bread', 'heart', 'boat', 'dove', 'tree', 'sun', 'tomb']).slice(0, 6);
  const cards = shuffle([...ids, ...ids]);
  let open = [], matched = 0, busy = false;
  el.innerHTML = `<div class="kid-top"><a class="kid-round" href="#/kids/games" aria-label="${t('common.back', 'Back')}">${icon('chevL')}</a><h1 class="kid-title">${t('kids.memory', 'Memory match')}</h1>${hear(t('kids.memoryH', 'Find the matching pictures!'), 'lg')}</div>
    <div class="mem-board">${cards.map((c, i) => `<button class="mem-card" data-i="${i}" data-c="${c}" aria-label="${t('kids.card', 'Card')} ${i + 1}"><span class="back">${icon('star')}</span><span class="front">${pic(c)}</span></button>`).join('')}</div><p class="kid-feedback" id="fb" aria-live="polite"></p>`;
  auto(t('kids.memoryH', 'Find the matching pictures!'));
  $$('.mem-card', el).forEach(btn => btn.addEventListener('click', () => {
    if (busy || btn.classList.contains('flip')) return;
    btn.classList.add('flip'); say(L(PIC_WORDS[btn.dataset.c]));
    open.push(btn);
    if (open.length === 2) {
      busy = true;
      const [a, b] = open;
      if (a.dataset.c === b.dataset.c) {
        a.classList.add('got'); b.classList.add('got'); matched++; open = []; busy = false;
        if (matched === ids.length) { const m = cheer(); $('#fb', el).textContent = m; setTimeout(() => say(m), 500); confetti(el); giveSticker('game-memory'); markActivity('kidgame', 5); }
      } else setTimeout(() => { a.classList.remove('flip'); b.classList.remove('flip'); open = []; busy = false; }, 1000);
    }
  }));
}

function pictureQuiz(el) {
  const qs = shuffle(STORIES.flatMap(s => s.quiz.map(q => ({ ...q, s })))).slice(0, 5);
  let i = 0, score = 0;
  const draw = () => {
    if (i >= qs.length) {
      const msg = t('kids.quizDone', 'You got {n} stars!', { n: score });
      el.innerHTML = `<div class="kid-top"><a class="kid-round" href="#/kids/games">${icon('chevL')}</a><span></span>${hear(msg, 'lg')}</div><div class="kid-page center"><div class="kid-stars">${Array.from({ length: qs.length }, (_, k) => `<span class="${k < score ? 'on' : ''}">${pic('star')}</span>`).join('')}</div><p class="kid-text big">${esc(msg)}</p><div class="kid-row center"><button class="kid-btn" id="again">${icon('shuffle')} ${t('game.again', 'Again')}</button><a class="kid-btn alt" href="#/kids">${icon('home')} ${t('kids.home', 'Home')}</a></div></div>`;
      say(msg); confetti(el); giveSticker('game-quiz'); markActivity('kidgame', 5);
      $('#again', el).addEventListener('click', () => pictureQuiz(el));
      return;
    }
    const q = qs[i]; const text = L(q.q);
    el.innerHTML = `<div class="kid-top"><a class="kid-round" href="#/kids/games">${icon('chevL')}</a><div class="kid-dots">${qs.map((_, k) => `<i class="${k < i ? 'on' : k === i ? 'cur' : ''}"></i>`).join('')}</div>${hear(text, 'lg')}</div>
      <div class="kid-page"><div class="kid-scene-box small">${scene(q.s.scene)}</div><p class="kid-text big" data-say="${esc(text)}">${esc(text)}</p>
      <div class="kid-choices">${shuffle(q.opts).map(o => `<button class="kid-choice" data-o="${o}">${pic(o)}<span>${esc(L(PIC_WORDS[o]))}</span></button>`).join('')}</div><p class="kid-feedback" id="fb"></p></div>`;
    auto(text);
    let tried = false;
    $$('.kid-choice', el).forEach(btn => btn.addEventListener('click', () => {
      if (btn.dataset.o === q.a) { if (!tried) score++; btn.classList.add('right'); $$('.kid-choice', el).forEach(x => x.disabled = true); const m = cheer(); $('#fb', el).textContent = m; say(m); setTimeout(() => { i++; draw(); }, 1400); }
      else { tried = true; btn.classList.add('wrong'); const m = t('kids.tryAgain', 'Try again!'); $('#fb', el).textContent = m; say(m); }
    }));
  };
  draw();
}

function orderGame(el) {
  const order = JESUS_ORDER.map(id => STORIES.find(s => s.id === id));
  let next = 0;
  const instr = t('kids.orderH', 'Put the story of Jesus in the right order!');
  el.innerHTML = `<div class="kid-top"><a class="kid-round" href="#/kids/games">${icon('chevL')}</a><h1 class="kid-title">${t('kids.order', 'Jesus’ story in order')}</h1>${hear(instr + ' ' + t('kids.orderTap', 'Tap what happened first.'), 'lg')}</div>
    <p class="kid-text">${t('kids.orderTap', 'Tap what happened first.')}</p>
    <div class="order-slots">${order.map((_, k) => `<span class="slot" data-k="${k}">${k + 1}</span>`).join('')}</div>
    <div class="order-cards">${shuffle(order).map(s => `<button class="order-card" data-id="${s.id}" style="--kc:${s.color}">${scene(s.scene)}<b>${esc(L(s.title))}</b></button>`).join('')}</div><p class="kid-feedback" id="fb"></p>`;
  auto(instr + ' ' + t('kids.orderTap', 'Tap what happened first.'));
  $$('.order-card', el).forEach(btn => btn.addEventListener('click', () => {
    const s = STORIES.find(x => x.id === btn.dataset.id);
    if (s.id === order[next].id) {
      const slot = $(`.slot[data-k="${next}"]`, el); slot.innerHTML = scene(s.scene); slot.classList.add('filled');
      btn.disabled = true; btn.classList.add('used'); say(L(s.title)); next++;
      if (next === order.length) { const m = cheer(); $('#fb', el).textContent = m; setTimeout(() => say(m), 900); confetti(el); giveSticker('game-order'); markActivity('kidgame', 5); }
    } else { btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake'); say(t('kids.notYet', 'Not yet! What happened before?')); }
  }));
}

const PALETTE = ['#ff5a8a', '#ff9f43', '#ffd23f', '#7bd389', '#00b894', '#48dbfb', '#0984e3', '#a55eea', '#8d6e63', '#c98d5e', '#ffffff', '#2d3436'];
function coloring(el, id) {
  if (!id) {
    el.innerHTML = `<div class="kid-top"><a class="kid-round" href="#/kids">${icon('chevL')}</a><h1 class="kid-title">${t('kids.color', 'Coloring')}</h1>${hear(t('kids.pickPicture', 'Pick a picture to color!'), 'lg')}</div>
      <div class="kid-grid">${STORIES.map(s => `<a class="kid-story" href="#/kids/game/color/${s.id}" style="--kc:${s.color}"><span class="kid-thumb"><img class="kid-scene line" src="${colorSrc(s.scene)}" alt="" loading="lazy"></span><b>${esc(L(s.title))}</b></a>`).join('')}</div>`;
    auto(t('kids.pickPicture', 'Pick a picture to color!'));
    return;
  }
  const s = STORIES.find(x => x.id === id) || STORIES[0];
  let color = PALETTE[0];
  el.innerHTML = `<div class="kid-top"><a class="kid-round" href="#/kids/game/color">${icon('chevL')}</a><h1 class="kid-title">${esc(L(s.title))}</h1>${hear(t('kids.colorH', 'Pick a color and tap the picture!'), 'lg')}</div>
    <div class="color-wrap"><div class="color-canvas"><canvas width="960" height="630" aria-label="${esc(L(s.title))}"></canvas></div>
    <div class="palette">${PALETTE.map(c => `<button class="pal" data-c="${c}" style="background:${c}" aria-label="${c}" aria-pressed="${c === color}"></button>`).join('')}</div></div>
    <div class="kid-row center"><button class="kid-btn alt" id="undoC">${icon('chevL')} ${t('kids.undo', 'Undo')}</button><button class="kid-btn alt" id="magic">${icon('spark')} ${t('kids.magic', 'Show real colors')}</button><button class="kid-btn" id="doneC">${icon('check')} ${t('kids.doneColor', 'I’m done!')}</button></div>`;
  auto(t('kids.colorH', 'Pick a color and tap the picture!'));
  const cv = $('canvas', el), ctx = cv.getContext('2d', { willReadFrequently: true });
  const W = cv.width, H = cv.height; let lines = null; const history = [];
  const img = new Image();
  img.onload = () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.drawImage(img, 0, 0, W, H); lines = ctx.getImageData(0, 0, W, H); };
  img.src = colorSrc(s.scene);
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const isLine = i => lines.data[i] < 110 && lines.data[i + 1] < 110 && lines.data[i + 2] < 110;
  function fill(x, y) {
    if (!lines || x < 0 || y < 0 || x >= W || y >= H) return;
    const data = ctx.getImageData(0, 0, W, H); const d = data.data;
    const start = (y * W + x) * 4; if (isLine(start)) return;
    const [r, g, b] = hex(color); const sr = d[start], sg = d[start + 1], sb = d[start + 2];
    if (sr === r && sg === g && sb === b) return;
    history.push(ctx.getImageData(0, 0, W, H)); if (history.length > 20) history.shift();
    const same = i => !isLine(i) && Math.abs(d[i] - sr) < 48 && Math.abs(d[i + 1] - sg) < 48 && Math.abs(d[i + 2] - sb) < 48;
    const seen = new Uint8Array(W * H); const stack = [x, y];
    while (stack.length) {
      const py = stack.pop(), px = stack.pop(); let lx = px;
      while (lx >= 0 && !seen[py * W + lx] && same((py * W + lx) * 4)) lx--;
      lx++; let up = false, dn = false;
      for (let qx = lx; qx < W; qx++) {
        const k = py * W + qx; if (seen[k] || !same(k * 4)) break;
        seen[k] = 1; d[k * 4] = r; d[k * 4 + 1] = g; d[k * 4 + 2] = b;
        if (py > 0) { const u = k - W; if (!seen[u] && same(u * 4)) { if (!up) { stack.push(qx, py - 1); up = true; } } else up = false; }
        if (py < H - 1) { const v = k + W; if (!seen[v] && same(v * 4)) { if (!dn) { stack.push(qx, py + 1); dn = true; } } else dn = false; }
      }
    }
    ctx.putImageData(data, 0, 0);
  }
  cv.addEventListener('click', e => { const rc = cv.getBoundingClientRect(); fill(Math.floor((e.clientX - rc.left) / rc.width * W), Math.floor((e.clientY - rc.top) / rc.height * H)); });
  $$('.pal', el).forEach(b => b.addEventListener('click', () => { color = b.dataset.c; $$('.pal', el).forEach(x => x.setAttribute('aria-pressed', x === b)); }));
  $('#undoC', el).addEventListener('click', () => { const h = history.pop(); if (h) ctx.putImageData(h, 0, 0); });
  $('#magic', el).addEventListener('click', () => { const real = new Image(); real.onload = () => { history.push(ctx.getImageData(0, 0, W, H)); ctx.drawImage(real, 0, 0, W, H); }; real.src = realSrc(s.scene); });
  $('#doneC', el).addEventListener('click', () => { const m = cheer(); say(m); confetti(el); giveSticker('game-color'); markActivity('kidcolor', 5); });
}

function stickers(el) {
  const st = kstate();
  const all = [...STORIES.map(s => ({ key: 'story-' + s.id, pic: s.sticker, color: s.color, name: L(s.title) })),
    { key: 'game-memory', pic: 'sheep', color: '#a55eea', name: t('kids.memory', 'Memory match') }, { key: 'game-quiz', pic: 'star', color: '#00b894', name: t('kids.quiz', 'Picture quiz') },
    { key: 'game-order', pic: 'jesus', color: '#0984e3', name: t('kids.order', 'Jesus’ story in order') }, { key: 'game-color', pic: 'tree', color: '#ff9f43', name: t('kids.color', 'Coloring') }];
  const n = all.filter(x => st.stickers[x.key]).length;
  const msg = t('kids.stickerCount', 'You have {n} stickers!', { n });
  el.innerHTML = `<div class="kid-top"><a class="kid-round" href="#/kids">${icon('chevL')}</a><h1 class="kid-title">${t('kids.stickers', 'My stickers')}</h1>${hear(msg, 'lg')}</div>
    <p class="kid-text">${esc(msg)}</p>
    <div class="sticker-book">${all.map(x => `<div class="sticker ${st.stickers[x.key] ? 'got' : ''}" style="--kc:${x.color}">${st.stickers[x.key] ? pic(x.pic) : `<span class="q">?</span>`}<small>${esc(x.name)}</small></div>`).join('')}</div>`;
  auto(msg);
}

function todayView(el) {
  const ch = todayChallenge(); const text = challengeText(ch); const done = isDone(ch);
  el.innerHTML = `<div class="kid-top"><a class="kid-round" href="#/kids">${icon('chevL')}</a><h1 class="kid-title">${t('kids.todayChallenge', 'Today’s challenge')}</h1>${hear(text, 'lg')}</div>
    <div class="kid-page center"><div class="kid-big-ico" style="--kc:#ffd23f">${pic(done ? 'star' : 'heart')}</div><p class="kid-text big" data-say="${esc(text)}">${esc(text)}</p>
    ${done ? `<p class="kid-text">${t('kids.didIt', 'You did it! See you tomorrow.')}</p>` : `<button class="kid-btn big" id="didIt">${icon('check')} ${t('kids.iDidIt', 'I did it!')}</button>`}
    ${ch.link && !done ? `<a class="kid-btn alt" href="${ch.link}">${icon('play')} ${t('kids.goDoIt', 'Let’s go!')}</a>` : ''}</div>`;
  auto(text);
  $('#didIt', el)?.addEventListener('click', () => { completeChallenge(ch); giveSticker('challenge-' + new Date().toISOString().slice(0, 10)); const m = cheer(); say(m); confetti(el); setTimeout(() => todayView(el), 1200); });
}
