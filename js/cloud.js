// Optional account & sync with Supabase (email + password, same project as Weeklan).
// Without an account everything still works locally.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { exportAll, importAll, load, save } from './store.js';
import { getProfile } from './profile.js';
import { t } from './i18n.js';

const CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm';
let clientP = null;
export const cloudEnabled = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);

async function client() {
  if (!cloudEnabled()) return null;
  if (!clientP) clientP = import(/* @vite-ignore */ CDN).then(m => m.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } }))
    .catch(e => { clientP = null; throw new Error(t('cloud.offline', 'Could not reach the account service. Check your connection.')); });
  return clientP;
}

let cachedUser = null;
export async function getUser() {
  try { const c = await client(); if (!c) return null; const { data } = await c.auth.getSession(); cachedUser = data.session?.user || null; return cachedUser; }
  catch { return null; }
}
export const userNow = () => cachedUser;

const friendly = e => {
  const m = String(e?.message || e || '');
  if (/invalid login/i.test(m)) return t('cloud.badLogin', 'Wrong email or password.');
  if (/already registered|already exists/i.test(m)) return t('cloud.exists', 'This email already has an account. Sign in instead.');
  if (/password/i.test(m) && /6/.test(m)) return t('cloud.shortPass', 'The password must have at least 6 characters.');
  if (/relation .*lamp_data|does not exist|schema cache/i.test(m)) return t('cloud.noTable', 'Sync is not set up yet: the site owner needs to run docs/supabase.sql in Supabase.');
  if (/rate limit|too many|security purposes|after \d+ seconds/i.test(m)) return t('cloud.rate', 'Too many tries for now. Supabase’s free email sender only sends a few emails per hour. Wait about an hour and try again, or ask the site owner to turn off email confirmation or connect an email service.');
  if (/not confirmed/i.test(m)) return t('cloud.notConfirmed', 'Your email is not confirmed yet. Open the email from Supabase (check spam too) and tap the link, then sign in.');
  if (/failed to fetch|network|load failed/i.test(m)) return t('cloud.network', 'Could not reach the account server. Check your internet connection and try again.');
  if (/signups? not allowed|disabled/i.test(m)) return t('cloud.disabled', 'New accounts are turned off in Supabase (Authentication → Sign In / Providers → Email → Allow new users to sign up).');
  if (/invalid.*email|email address .* is invalid/i.test(m)) return t('cloud.badEmail', 'That email address does not look right. Check it and try again.');
  if (/confirm/i.test(m)) return t('cloud.confirm', 'Check your email to confirm your account, then sign in.');
  return m || t('cloud.error', 'Something went wrong with your account.');
};

export async function signUp(email, password) {
  const c = await client();
  const { data, error } = await c.auth.signUp({ email, password, options: { emailRedirectTo: location.href.split('#')[0] } });
  if (error) throw new Error(friendly(error));
  cachedUser = data.user;
  if (!data.session) return { needsConfirm: true };
  await pushNow();
  return { user: data.user };
}
export async function resendConfirm(email) {
  const c = await client();
  const { error } = await c.auth.resend({ type: 'signup', email, options: { emailRedirectTo: location.href.split('#')[0] } });
  if (error) throw new Error(friendly(error));
}
export async function signIn(email, password) {
  const c = await client();
  const { data, error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw new Error(friendly(error));
  cachedUser = data.user;
  return { user: data.user };
}
export async function signOut() { const c = await client(); await c?.auth.signOut(); cachedUser = null; }
export async function resetPassword(email) {
  const c = await client();
  const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: location.href.split('#')[0] });
  if (error) throw new Error(friendly(error));
}

// ---- sync ----
const meta = () => load('syncmeta', { changed: 0, synced: 0 });
export async function pushNow() {
  const c = await client(); const user = await getUser(); if (!c || !user) return false;
  const p = getProfile();
  const { error } = await c.from('lamp_data').upsert({ user_id: user.id, data: exportAll(), name: p.name || null, age_group: p.age || null, updated_at: new Date().toISOString() });
  if (error) throw new Error(friendly(error));
  save('syncmeta', { ...meta(), synced: Date.now() });
  window.dispatchEvent(new Event('lamp:sync'));
  return true;
}
// Returns { exists, updated, data } for the signed-in user.
export async function fetchCloud() {
  const c = await client(); const user = await getUser(); if (!c || !user) return null;
  const { data, error } = await c.from('lamp_data').select('data, updated_at').eq('user_id', user.id).maybeSingle();
  if (error) throw new Error(friendly(error));
  return data ? { exists: true, updated: Date.parse(data.updated_at), data: data.data } : { exists: false };
}
export function applyCloud(data) { importAll(data); save('syncmeta', { changed: 0, synced: Date.now() }); }

let timer = null, started = false;
export function startAutoSync() {
  if (started || !cloudEnabled()) return; started = true;
  window.addEventListener('lamp:data', () => {
    save('syncmeta', { ...meta(), changed: Date.now() });
    if (!cachedUser) return;
    clearTimeout(timer);
    timer = setTimeout(() => pushNow().catch(() => {}), 5000);
  });
  // Restore a session (also picks up a login made in Weeklan on the same site).
  getUser().catch(() => {});
}
export const lastSynced = () => meta().synced;

// ---- push reminders (see docs/REMINDERS.md) ----
export async function savePushSubscription(sub, time) {
  const c = await client(); const user = await getUser();
  if (!c || !user) throw new Error(t('pwa.needAccount', 'Sign in to your account to get reminders when the app is closed.'));
  const [h, m] = time.split(':').map(Number);
  const d = new Date(); d.setHours(h, m, 0, 0);
  const utcMinute = d.getUTCHours() * 60 + d.getUTCMinutes();
  const { error } = await c.from('lamp_push').upsert({ endpoint: sub.endpoint, user_id: user.id, subscription: sub, utc_minute: utcMinute, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, lang: document.documentElement.lang || 'en' });
  if (error) throw new Error(friendly(error));
}
export async function removePushSubscription(endpoint) {
  const c = await client(); if (!c) return;
  await c.from('lamp_push').delete().eq('endpoint', endpoint);
}
