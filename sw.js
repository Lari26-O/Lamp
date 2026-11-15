// Lamp service worker: offline cache, reminders (push + periodic sync), widgets.
const VERSION = 'lamp-v13';
const SHELL = [
  './', 'index.html', 'css/styles.css', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/favicon-32.png',
  'js/app.js', 'js/util.js', 'js/store.js', 'js/bible.js', 'js/srs.js', 'js/ai.js', 'js/components.js', 'js/i18n.js', 'js/config.js', 'js/connect.js', 'js/learn-data.js',
  'js/i18n/fr.js', 'js/i18n/pt.js', 'js/i18n/es.js', 'js/i18n/fr-more.js', 'js/i18n/pt-more.js', 'js/i18n/es-more.js', 'js/i18n/fr-kids.js', 'js/i18n/pt-kids.js', 'js/i18n/es-kids.js', 'js/data/l10n.js',
  'js/data/books.js', 'js/data/places.js', 'js/data/timeline.js', 'js/data/people.js', 'js/data/trivia.js',
  'js/profile.js', 'js/cloud.js', 'js/plans-data.js', 'js/learn-books.js', 'js/challenges.js', 'js/streaks.js', 'js/pwa.js', 'js/kids-art.js', 'js/kids-data.js', 'js/kids-stories-ot.js', 'js/kids-tales-1.js', 'js/kids-tales-2.js', 'js/kids-tales-3.js', 'js/kids-tales-4.js', 'js/kids-tales-5.js', 'js/kids-more-1.js', 'js/kids-more-2.js', 'js/kids-more-3.js', 'js/kids-more-4.js', 'js/kids-more-5.js', 'js/kids-art-flat.js',
  'js/views/home.js', 'js/views/reader.js', 'js/views/search.js', 'js/views/ask.js', 'js/views/memory.js', 'js/views/quiz.js', 'js/views/notes.js', 'js/views/map.js',
  'js/views/timeline.js', 'js/views/people.js', 'js/views/videos.js', 'js/views/settings.js', 'js/views/learn.js', 'js/views/study.js', 'js/views/plans.js',
  'js/views/prayer.js', 'js/views/account.js', 'js/views/kids.js', 'js/views/challenge.js', 'js/views/widget.js',
  'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION && k !== 'lamp-state').map(k => caches.delete(k)));
    await self.clients.claim();
    await updateWidgets();
  })());
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const sameOrigin = url.origin === location.origin;
  const fonts = url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com';
  const bibleApi = url.host === 'bible-api.com';
  if (!sameOrigin && !fonts && !bibleApi) return;
  if ((sameOrigin && (url.pathname.includes('/data/') || url.pathname.includes('/img/kids/'))) || fonts) {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    })));
    return;
  }
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request).then(hit => hit || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});

// ---------- shared state written by the app (js/pwa.js) ----------
async function state() {
  try { const c = await caches.open('lamp-state'); const r = await c.match('state.json'); return r ? await r.json() : {}; } catch { return {}; }
}
async function setState(patch) {
  const c = await caches.open('lamp-state'); const cur = await state();
  await c.put('state.json', new Response(JSON.stringify({ ...cur, ...patch }), { headers: { 'Content-Type': 'application/json' } }));
}

// ---------- notifications ----------
self.addEventListener('push', e => {
  let data = {}; try { data = e.data.json(); } catch { data = { title: 'Lamp', body: e.data?.text() || '' }; }
  e.waitUntil(self.registration.showNotification(data.title || 'Lamp', { body: data.body, icon: 'icons/icon-192.png', badge: 'icons/favicon-32.png', tag: 'lamp-daily', data: { url: data.url || '#/challenge' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = new URL(e.notification.data?.url || '#/home', self.registration.scope).href;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const w = wins.find(c => c.url.startsWith(self.registration.scope));
    if (w) { await w.focus(); return w.navigate(target); }
    return self.clients.openWindow(target);
  })());
});
// On-device reminder (Chrome/Android installed app): fires a few times a day; show once per day after the chosen time.
self.addEventListener('periodicsync', e => {
  if (e.tag !== 'lamp-reminder') return;
  e.waitUntil((async () => {
    const s = await state();
    if (!s.reminder?.on) return;
    const now = new Date(); const [h, m] = (s.reminder.time || '19:00').split(':').map(Number);
    const today = now.toISOString().slice(0, 10);
    if (s.lastReminder === today || now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
    await self.registration.showNotification(s.widget?.labels?.challenge || 'Lamp', { body: s.widget?.challenge || 'Time with God', icon: 'icons/icon-192.png', badge: 'icons/favicon-32.png', tag: 'lamp-daily', data: { url: '#/challenge' } });
    await setState({ lastReminder: today });
    await updateWidgets();
  })());
});

// ---------- Windows widgets (Edge PWA widgets, Adaptive Cards) ----------
async function renderWidget(widget) {
  const s = await state();
  const tag = widget.definition.tag;
  const tplUrl = widget.definition.msAcTemplate || widget.definition.ms_ac_template || `widgets/${tag}.json`;
  const template = await (await fetch(tplUrl)).text();
  const w = s.widget || {};
  const data = JSON.stringify({ challenge: w.challenge || 'Open Lamp to see today’s challenge', challengeLabel: w.labels?.challenge || 'Today’s challenge', verse: w.verse || '', verseRef: w.verseRef || '', plan: w.plan || w.reading || '', planLabel: w.labels?.plan || 'Today’s reading', streak: String(w.streak ?? 0), open: w.labels?.open || 'Open Lamp' });
  await self.widgets.updateByTag(tag, { template, data });
}
async function updateWidgets() {
  if (!self.widgets) return;
  for (const tag of ['challenge', 'reading']) {
    try { const w = await self.widgets.getByTag(tag); if (w) await renderWidget(w); } catch {}
  }
}
self.addEventListener('widgetinstall', e => e.waitUntil(renderWidget(e.widget)));
self.addEventListener('widgetresume', e => e.waitUntil(renderWidget(e.widget)));
self.addEventListener('widgetclick', e => {
  if (e.action === 'open') e.waitUntil(self.clients.openWindow(e.widget?.definition?.tag === 'reading' ? '#/plans' : '#/challenge'));
});
self.addEventListener('message', e => { if (e.data?.type === 'state-updated') e.waitUntil(updateWidgets()); });
