// Install to home screen, reminders and widget data.
import { load, save } from './store.js';
import { openDialog, icon, esc, toast } from './util.js';
import { t } from './i18n.js';
import { VAPID_PUBLIC_KEY } from './config.js';

// ---------- install ----------
let deferred = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; window.dispatchEvent(new Event('lamp:installable')); });
window.addEventListener('appinstalled', () => { deferred = null; save('installed', true); });
export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const canInstall = () => !isStandalone();

export async function install() {
  if (deferred) { deferred.prompt(); const r = await deferred.userChoice; deferred = null; return r.outcome === 'accepted'; }
  const ios = isIOS();
  const shareIco = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12M7 8l5-5 5 5M5 12v8h14v-8"/></svg>';
  openDialog(t('pwa.title', 'Add Lamp to your home screen'), ios ? `
    <ol class="install-steps">
      <li><span class="n">1</span><span>${t('pwa.ios1', 'Tap the Share button')} ${shareIco} ${t('pwa.ios1b', '(at the bottom in Safari, or at the top right in Chrome).')}</span></li>
      <li><span class="n">2</span><span>${t('pwa.ios2', 'Scroll and tap “Add to Home Screen”.')}</span></li>
      <li><span class="n">3</span><span>${t('pwa.ios3', 'Tap “Add”. Lamp opens like an app, works offline and can send you reminders.')}</span></li>
    </ol>` : `
    <ol class="install-steps">
      <li><span class="n">1</span><span>${t('pwa.and1', 'Open the browser menu (⋮ at the top right).')}</span></li>
      <li><span class="n">2</span><span>${t('pwa.and2', 'Tap “Add to Home screen” or “Install app”.')}</span></li>
      <li><span class="n">3</span><span>${t('pwa.and3', 'On a computer, click the install icon in the address bar.')}</span></li>
    </ol>`);
  return false;
}

// ---------- reminders ----------
export const getReminder = () => ({ on: false, time: '19:00', push: false, ...load('reminder', {}) });
const setReminder = p => { const r = { ...getReminder(), ...p }; save('reminder', r); return r; };
export const notificationsSupported = () => 'Notification' in window && 'serviceWorker' in navigator;
export const pushSupported = () => notificationsSupported() && 'PushManager' in window && !!VAPID_PUBLIC_KEY;

export async function enableReminder(time) {
  if (!notificationsSupported()) throw new Error(t('pwa.noNotif', 'This browser cannot show notifications. Use the calendar reminder instead.'));
  if (isIOS() && !isStandalone()) throw new Error(t('pwa.iosFirst', 'On iPhone and iPad, first add Lamp to your home screen, then turn on reminders from there.'));
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error(t('pwa.denied', 'Notifications are blocked. Allow them in your browser settings.'));
  const reg = await navigator.serviceWorker.ready;
  let push = false;
  // 1) Real push through Supabase (works even when the app is closed), if configured.
  if (pushSupported()) {
    try {
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64(VAPID_PUBLIC_KEY) });
      const { savePushSubscription } = await import('./cloud.js');
      await savePushSubscription(sub.toJSON(), time);
      push = true;
    } catch (e) { console.warn('push', e); }
  }
  // 2) Periodic background sync (Chrome/Android installed app) as a fallback.
  try { if ('periodicSync' in reg) await reg.periodicSync.register('lamp-reminder', { minInterval: 6 * 3600e3 }); } catch {}
  setReminder({ on: true, time, push });
  await writeSW({ reminder: { on: true, time } });
  reg.showNotification('Lamp', { body: t('pwa.testNotif', 'Reminders are on. See you at {time}!', { time }), icon: 'icons/icon-192.png', badge: 'icons/favicon-32.png', tag: 'lamp-test' });
  return { push };
}
export async function disableReminder() {
  setReminder({ on: false });
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager?.getSubscription(); if (sub) { const { removePushSubscription } = await import('./cloud.js'); await removePushSubscription(sub.endpoint).catch(() => {}); await sub.unsubscribe(); } await reg.periodicSync?.unregister('lamp-reminder'); } catch {}
  await writeSW({ reminder: { on: false } });
}
function urlB64(b64) { const pad = '='.repeat((4 - b64.length % 4) % 4); const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...raw].map(c => c.charCodeAt(0))); }

// Calendar reminder (.ics): works on every phone and computer, no account needed.
export function downloadCalendar(time = getReminder().time) {
  const [h, m] = time.split(':');
  const d = new Date(); d.setHours(+h, +m, 0, 0);
  const pad = n => String(n).padStart(2, '0');
  const local = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`;
  const url = location.href.split('#')[0] + '#/challenge';
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lamp//Bible//EN', 'BEGIN:VEVENT', `UID:lamp-daily-${Date.now()}@lamp`, `DTSTAMP:${local}`, `DTSTART:${local}`, `DURATION:PT15M`, 'RRULE:FREQ=DAILY',
    `SUMMARY:${t('pwa.calTitle', 'Lamp — time with God')}`, `DESCRIPTION:${t('pwa.calDesc', 'Read today’s passage and do your daily challenge.')} ${url}`, `URL:${url}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${t('pwa.calTitle', 'Lamp — time with God')}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'lamp-reminder.ics'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---------- data for the service worker (reminder text, widgets) ----------
// The service worker cannot read localStorage, so we store a small JSON in Cache Storage.
export async function writeSW(patch) {
  try {
    const cache = await caches.open('lamp-state');
    const cur = await (await cache.match('state.json'))?.json().catch(() => ({})) || {};
    const next = { ...cur, ...patch, updated: Date.now() };
    await cache.put('state.json', new Response(JSON.stringify(next), { headers: { 'Content-Type': 'application/json' } }));
    navigator.serviceWorker?.controller?.postMessage({ type: 'state-updated' });
  } catch {}
}
export async function publishWidgetData() {
  try { const { widgetData } = await import('./views/widget.js'); await writeSW({ widget: await widgetData() }); } catch {}
}
