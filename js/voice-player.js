// Plays the free pre-recorded Kokoro voice clips made by tools/record_voices.py
// (based on the Chore Buddies voice kit). No paid service, works offline once cached.
// say(text, lang) plays the recorded sentences. If one was not recorded it returns false
// so the caller can use the device's own voice. iPhone/iPad only allow sound after a tap.
const V = { man: {}, manP: {}, packs: {}, packP: {}, bufs: {}, srcs: [], ctx: null, token: 0 };
const norm = s => String(s).toLowerCase().replace(/[’‘]/g, "'").normalize('NFC').replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').trim();
const split = t => String(t).replace(/<[^>]+>/g, '').split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
const base = lang => `voice/${lang}/`;
const manifest = lang => V.man[lang] !== undefined ? Promise.resolve(V.man[lang])
  : (V.manP[lang] ||= fetch(base(lang) + 'manifest.json').then(r => r.ok ? r.json() : null).catch(() => null).then(m => (V.man[lang] = m)));
const pack = (lang, i) => { const id = lang + i; return V.packs[id] ? Promise.resolve(V.packs[id]) : (V.packP[id] ||= fetch(base(lang) + V.man[lang].packs[i]).then(r => r.json()).then(p => (V.packs[id] = p))); };

// Only whole recorded sentences are played. Speech stitched from single words sounds
// choppy, so if any sentence was not recorded the caller uses the device voice instead.
function plan(text, keys) {
  const out = [];
  for (const s of split(text)) {
    const n = norm(s); if (!n) continue;
    if (keys[n] == null) return null;
    out.push({ k: n, gap: .3 });
  }
  return out.length ? out : null;
}
function unlock() {
  if (!V.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) V.ctx = new C(); }
  if (V.ctx && V.ctx.state === 'suspended') V.ctx.resume();
}
['pointerdown', 'touchend', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, { capture: true, passive: true }));
async function buffer(lang, k) {
  const id = lang + '|' + k; if (V.bufs[id]) return V.bufs[id];
  const p = await pack(lang, V.man[lang].keys[k]), bin = atob(p[k]), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return (V.bufs[id] = await new Promise((res, rej) => V.ctx.decodeAudioData(u.buffer, res, rej)));
}
export function stop() { V.token++; V.srcs.forEach(s => { try { s.onended = null; s.stop(); } catch { /* already stopped */ } }); V.srcs = []; }
// Resolves true when the recorded voice played (onend fires at the end), false if it could not.
export async function say(text, lang = 'en', { onend } = {}) {
  stop(); unlock();
  const token = V.token;
  const man = await manifest(lang), p = man && V.ctx && plan(text, man.keys);
  if (!p) return false;
  let bufs; try { bufs = await Promise.all(p.map(x => buffer(lang, x.k))); } catch { return false; }
  if (token !== V.token) return true; // something else started meanwhile
  let at = V.ctx.currentTime + .03, last;
  bufs.forEach((b, i) => { const s = V.ctx.createBufferSource(); s.buffer = b; s.connect(V.ctx.destination); s.start(at); V.srcs.push(s); at += b.duration + p[i].gap; last = s; });
  last.onended = () => { if (token === V.token) onend?.(); };
  return true;
}
export const hasVoice = async lang => !!(await manifest(lang));
