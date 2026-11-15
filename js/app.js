import { $, icon, esc } from './util.js';
import { parseRef, refHash } from './bible.js';
import { getSettings, setSettings, streak } from './store.js';
import { dueCount } from './srs.js';
import { t, LANG, LANGS, setLang } from './i18n.js';
import { publishSummary } from './connect.js';
import { getProfile, isKids } from './profile.js';
import { install, canInstall, publishWidgetData } from './pwa.js';
import { openDialog, shuffle } from './util.js';
import { startAutoSync } from './cloud.js';
import { celebrate } from './streaks.js';
import { say } from './views/kids.js';

const NAV = () => [
  { group: t('navg.learn', 'Learn') },
  { id: 'home', label: t('nav.home', 'Home'), icon: 'home' },
  { id: 'challenge', label: t('nav.challenge', 'Daily challenge'), icon: 'star' },
  { id: 'plans', label: t('nav.plans', 'Reading plans'), icon: 'calendar' },
  { id: 'learn', label: t('nav.learn', 'Learning path'), icon: 'path' },
  { id: 'read', label: t('nav.read', 'Read'), icon: 'book' },
  { id: 'study', label: t('nav.study', 'How to study'), icon: 'compass' },
  { id: 'ask', label: t('nav.ask', 'Ask AI'), icon: 'chat' },
  { group: t('navg.remember', 'Remember') },
  { id: 'memory', label: t('nav.memory', 'Memorize'), icon: 'brain', badge: true },
  { id: 'quiz', label: t('nav.quiz', 'Quiz'), icon: 'quiz' },
  { id: 'prayer', label: t('nav.prayer', 'Prayer'), icon: 'hand' },
  { id: 'notes', label: t('nav.notes', 'My study Bible'), icon: 'pen' },
  { group: t('navg.explore', 'Explore') },
  { id: 'map', label: t('nav.map', 'Maps'), icon: 'map' },
  { id: 'timeline', label: t('nav.timeline', 'Timeline'), icon: 'clock' },
  { id: 'people', label: t('nav.people', 'People'), icon: 'people' },
  { id: 'videos', label: t('nav.videos', 'Videos'), icon: 'video' },
  { id: 'search', label: t('nav.search', 'Search'), icon: 'search' },
  { group: '' },
  { id: 'account', label: t('nav.account', 'Profile & account'), icon: 'user' },
  { id: 'settings', label: t('nav.settings', 'Settings'), icon: 'gear' },
];
const BOTTOM = ['home', 'plans', 'learn', 'read', 'memory'];

const VIEWS = {
  home: () => import('./views/home.js'),
  learn: () => import('./views/learn.js'),
  plans: () => import('./views/plans.js'),
  prayer: () => import('./views/prayer.js'),
  account: () => import('./views/account.js'),
  welcome: () => import('./views/account.js'),
  kids: () => import('./views/kids.js'),
  challenge: () => import('./views/challenge.js'),
  widget: () => import('./views/widget.js'),
  read: () => import('./views/reader.js'),
  study: () => import('./views/study.js'),
  search: () => import('./views/search.js'),
  ask: () => import('./views/ask.js'),
  memory: () => import('./views/memory.js'),
  quiz: () => import('./views/quiz.js'),
  notes: () => import('./views/notes.js'),
  map: () => import('./views/map.js'),
  timeline: () => import('./views/timeline.js'),
  people: () => import('./views/people.js'),
  videos: () => import('./views/videos.js'),
  settings: () => import('./views/settings.js'),
};

const grownup = () => { try { return sessionStorage.getItem('lamp-grownup') === '1'; } catch { return false; } };
export const kidsOn = () => isKids() && !grownup();

// Simple gate so children stay in the children's area.
export function grownupGate() {
  const a = 2 + Math.floor(Math.random() * 7), b = 2 + Math.floor(Math.random() * 7), ans = a + b;
  const opts = shuffle([ans, ans + 1, ans - 1, ans + 3].filter((x, i, arr) => x > 0 && arr.indexOf(x) === i)).slice(0, 3);
  if (!opts.includes(ans)) opts[0] = ans;
  const d = openDialog(t('gate.title', 'For grown-ups'), `<p>${t('gate.q', 'Ask a grown-up to answer:')}</p><p class="gate-q">${a} + ${b} = ?</p><div class="row center">${shuffle(opts).map(o => `<button class="btn big-num" data-n="${o}">${o}</button>`).join('')}</div><p class="small muted" id="gateMsg"></p>`);
  d.querySelectorAll('[data-n]').forEach(btn => btn.addEventListener('click', () => {
    if (+btn.dataset.n === ans) { try { sessionStorage.setItem('lamp-grownup', '1'); } catch {} d.close(); buildChrome(); location.hash = '#/home'; }
    else d.querySelector('#gateMsg').textContent = t('gate.no', 'That’s not right. Ask a grown-up!');
  }));
}
function backToKids() { try { sessionStorage.removeItem('lamp-grownup'); } catch {} buildChrome(); location.hash = '#/kids'; }

function buildChrome() {
  const kids = kidsOn();
  document.documentElement.dataset.mode = kids ? 'kids' : '';
  $('#kidsExit').hidden = !kids;
  $('#kidsBack').hidden = !(isKids() && !kids);
  if (kids) {
    $('#sidenav').innerHTML = '';
    const items = [['kids', 'home', t('kidsnav.home', 'Home')], ['kids/games', 'star', t('kids.games', 'Games')], ['kids/game/color', 'pen', t('kids.color', 'Coloring')], ['kids/stickers', 'heart', t('kids.stickers', 'My stickers')], ['kids/today', 'sun', t('kidsnav.today', 'Today')]];
    $('#bottomnav').innerHTML = items.map(([h, ic, l]) => `<a href="#/${h}" data-id="${h}">${icon(ic)}<span>${l}</span></a>`).join('');
    $('#kidsExit').textContent = t('gate.btn', 'Grown-ups');
    return;
  }
  $('#kidsBack').innerHTML = `${icon('sun')} <span>${t('gate.back', 'Kids mode')}</span>`;
  const due = dueCount();
  const nav = NAV();
  $('#sidenav').innerHTML = nav.map(n => n.group !== undefined
    ? (n.group ? `<div class="group">${esc(n.group)}</div>` : '<hr>')
    : `<a href="#/${n.id}" data-id="${n.id}">${icon(n.icon)}<span>${esc(n.label)}</span>${n.badge && due ? `<span class="badge" aria-label="${due}">${due}</span>` : ''}</a>`).join('')
    + (canInstall() ? `<button class="nav-install" id="navInstall">${icon('download')}<span>${t('pwa.install', 'Install the app')}</span></button>` : '');
  $('#navInstall')?.addEventListener('click', () => install());
  const short = { home: t('navs.home', 'Home'), plans: t('navs.plans', 'Plans'), learn: t('navs.learn', 'Learn'), read: t('navs.read', 'Bible'), memory: t('navs.memory', 'Memorize'), study: t('navs.study', 'Study') };
  $('#bottomnav').innerHTML = BOTTOM.map(id => `<a href="#/${id}" data-id="${id}">${icon(nav.find(x => x.id === id).icon)}<span>${short[id]}</span></a>`).join('');
  $('#goInput').placeholder = t('top.search', 'John 3:16, Psalm 23, or a word…');
  $('#goInput').previousElementSibling.textContent = t('top.searchLabel', 'Go to a passage or search');
  $('#menuBtn').setAttribute('aria-label', t('top.menu', 'Open menu'));
  $('.skip').textContent = t('top.skip', 'Skip to content');
  $('#langSel').innerHTML = LANGS.map(l => `<option value="${l.id}" ${l.id === LANG ? 'selected' : ''}>${l.id.toUpperCase()} · ${l.name}</option>`).join('');
  $('#langSel').setAttribute('aria-label', t('top.lang', 'Language'));
  $('#streakChip').innerHTML = `${icon('flame')}<span>${streak()}</span>`;
  $('#streakChip').title = t('learn.streak', 'day streak');
  const pr = getProfile();
  const ini = (pr.name || '').trim().charAt(0).toUpperCase();
  $('#avatar').innerHTML = ini ? esc(ini) : icon('user');
  $('#avatar').classList.toggle('empty', !pr.name);
  $('#avatar').setAttribute('aria-label', t('nav.account', 'Profile & account'));
}
export function refreshNav() { buildChrome(); markCurrent(currentId); }

let currentId = null, cleanup = null, renderToken = 0;
function markCurrent(id) {
  const h = location.hash.replace(/^#\/?/, '').split('?')[0];
  document.querySelectorAll('.sidenav a, .bottomnav a').forEach(a => {
    if (a.dataset.id === id || a.dataset.id === h) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

async function route() {
  const hash = location.hash.replace(/^#\/?/, '') || 'home';
  const [path, query = ''] = hash.split('?');
  const parts = path.split('/').map(decodeURIComponent);
  let id = VIEWS[parts[0]] ? parts[0] : 'home';
  if (!getProfile().done && id !== 'welcome' && id !== 'account') { location.replace('#/welcome'); return; }
  const params = { parts: parts.slice(1), query: new URLSearchParams(query) };
  if (id === 'welcome') params.parts.unshift('welcome');
  // Children stay in the children's area (grown-ups can pass the gate).
  if (kidsOn() && !['kids', 'welcome', 'widget'].includes(id)) { location.replace('#/kids'); return; }
  const token = ++renderToken;
  closeMenu();
  document.querySelectorAll('dialog[open]').forEach(d => d.close());
  try { cleanup?.(); } catch {}
  cleanup = null;
  const view = $('#view');
  const sameView = id === currentId;
  currentId = id;
  markCurrent(id);
  document.body.dataset.view = (id === 'kids' && params.parts[0] && params.parts[0] !== 'games' && params.parts[0] !== 'stickers' ? 'kids-focus' : id) + (params.parts[0] === 'lesson' || params.parts[0] === 'play' || params.parts[0] === 'review' ? '-focus' : '');
  try {
    const mod = await VIEWS[id]();
    if (token !== renderToken) return;
    view.innerHTML = '';
    cleanup = (await mod.render(view, params)) || null;
    if (token !== renderToken) return;
    if (!sameView || id !== 'read') window.scrollTo(0, 0);
    if (!sameView) view.focus({ preventScroll: true });
    const h1 = view.querySelector('h1');
    document.title = (h1 && h1.textContent.trim() !== 'Lamp' ? h1.textContent.trim() + ' · ' : '') + 'Lamp';
  } catch (e) {
    console.error(e);
    view.innerHTML = `<div class="card"><h1>${t('err.title', 'Something went wrong')}</h1><p>${esc(e.message)}</p><a class="btn" href="#/home">${t('nav.home', 'Home')}</a></div>`;
  }
  publishSummary();
  publishWidgetData();
  const sp = document.getElementById('splash'); if (sp) { sp.classList.add('hide'); setTimeout(() => sp.remove(), 600); }
}

function openMenu() { $('#sidenav').classList.add('open'); $('#scrim').hidden = false; $('#menuBtn').setAttribute('aria-expanded', 'true'); $('#sidenav a')?.focus(); }
function closeMenu() { $('#sidenav').classList.remove('open'); $('#scrim').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); }

function init() {
  const s = getSettings();
  document.documentElement.dataset.font = s.font;
  buildChrome();
  $('#menuBtn').addEventListener('click', () => $('#sidenav').classList.contains('open') ? closeMenu() : openMenu());
  $('#scrim').addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  $('#langSel').addEventListener('change', e => {
    const lang = e.target.value;
    const cur = getSettings();
    // Switch the Bible to that language's default unless the user picked a version in it.
    setSettings({ lang, version: '' });
    setLang(lang);
    buildChrome();
    route();
  });
  $('#goSearch').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#goInput');
    const v = input.value.trim();
    if (!v) return;
    const r = parseRef(v);
    location.hash = r ? refHash(r) : '#/search?q=' + encodeURIComponent(v);
    input.blur();
  });
  window.addEventListener('hashchange', route);
  window.addEventListener('lamp:nav', refreshNav);
  window.addEventListener('lamp:data', () => { $('#streakChip').innerHTML = `${icon('flame')}<span>${streak()}</span>`; });
  startAutoSync();
  window.addEventListener('lamp:streak', e => setTimeout(() => celebrate(e.detail, { kids: kidsOn(), speak: say }), 900));
  window.addEventListener('lamp:data', () => { const ini = (getProfile().name || '').trim().charAt(0).toUpperCase(); $('#avatar').innerHTML = ini ? esc(ini) : icon('user'); });
  $('#kidsExit').addEventListener('click', grownupGate);
  $('#kidsBack').addEventListener('click', backToKids);
  window.addEventListener('lamp:installable', () => buildChrome());
  route();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
}
init();
