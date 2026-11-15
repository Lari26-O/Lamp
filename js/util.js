export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Tiny, safe Markdown renderer for AI answers (escapes first, then formats).
export function md(text) {
  const lines = esc(text).split('\n');
  let html = '', list = null;
  const inline = s => s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  const close = () => { if (list) { html += `</${list}>`; list = null; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if ((m = line.match(/^\s*#{1,6}\s+(.*)/))) { close(); html += `<h4>${inline(m[1])}</h4>`; }
    else if ((m = line.match(/^\s*[-*•]\s+(.*)/))) { if (list !== 'ul') { close(); html += '<ul>'; list = 'ul'; } html += `<li>${inline(m[1])}</li>`; }
    else if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== 'ol') { close(); html += '<ol>'; list = 'ol'; } html += `<li>${inline(m[1])}</li>`; }
    else if (!line.trim()) { close(); }
    else { close(); html += `<p>${inline(line)}</p>`; }
  }
  close();
  return html;
}

// Line icons (24x24, stroke = currentColor).
const P = {
  home: '<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20v3H6.5"/>',
  brain: '<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h1V3z"/><path d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3h-1V3z"/>',
  map: '<path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3z"/><path d="M9 3v15M15 6v15"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  tag: '<path d="M20 12 12 20 3 11V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  pause: '<path d="M7 4h4v16H7zM13 4h4v16h-4z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  video: '<rect x="2" y="5" width="15" height="14" rx="2"/><path d="m17 10 5-3v10l-5-3z"/>',
  people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2A5 5 0 0 1 21.5 19"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>', chevR: '<path d="m9 18 6-6-6-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12 5 5 9-10"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  speaker: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  flame: '<path d="M12 21c4 0 7-2.7 7-6.5 0-3-2-5.5-3.5-7-.3 2-1.3 3-2.5 3.5C13 7 11.5 4.5 9 3c.3 3-1.3 5-3 7-1 1.2-1 2.7-1 4.5C5 18.3 8 21 12 21z"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  path: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  crown: '<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  highlighter: '<path d="m9 15-3 3H3l3-3"/><path d="m6 15 9-9 4 4-9 9z"/><path d="M14 21h7"/>',
  underline: '<path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
  columns: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  shuffle: '<path d="M3 7h3c4 0 6 10 10 10h5M3 17h3c1.6 0 2.8-1.6 4-3.5M21 7h-5c-1.6 0-2.8 1.6-4 3.5"/><path d="m18 4 3 3-3 3M18 14l3 3-3 3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
  letters: '<path d="M4 18 8 6l4 12M5.5 14h5M15 18v-6a3 3 0 0 1 6 0v6M15 15h6"/>',
  blocks: '<rect x="3" y="4" width="8" height="6" rx="1.5"/><rect x="13" y="4" width="8" height="6" rx="1.5"/><rect x="3" y="14" width="5" height="6" rx="1.5"/><rect x="10" y="14" width="11" height="6" rx="1.5"/>',
  headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  heart: '<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
  anchor: '<circle cx="12" cy="5" r="2"/><path d="M12 7v14M5 13a7 7 0 0 0 14 0M8 11h8"/>',
  scroll: '<path d="M6 3h11a2 2 0 0 1 2 2v12"/><path d="M6 3a2 2 0 0 0-2 2v2h4"/><path d="M8 7v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-2H10"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 5 18l-1.7-3.5a1.5 1.5 0 0 1 2.6-1.5L8 15"/>',
  plug: '<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
};
export function icon(name, cls = '') {
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[name] || ''}</svg>`;
}

let toastTimer;
export function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

// Announce to screen readers.
export function announce(msg) {
  const a = document.getElementById('sr-live');
  a.textContent = '';
  setTimeout(() => { a.textContent = msg; }, 30);
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export function dayOfYear() {
  const d = new Date();
  return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
}

// Modal dialog helper. Returns the <dialog> element.
export function openDialog(title, bodyHtml, { wide = false, onClose } = {}) {
  const d = document.createElement('dialog');
  d.className = 'dlg' + (wide ? ' wide' : '');
  d.innerHTML = `<div class="dlg-head"><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div><div class="dlg-body">${bodyHtml}</div>`;
  document.body.appendChild(d);
  d.addEventListener('close', () => { onClose?.(); d.remove(); });
  d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  d.showModal();
  return d;
}

// ---- Text to speech ----
// Picks the most natural voice the device has (Enhanced / Premium / Natural / Siri / Google voices),
// avoids robotic and novelty voices, and reads sentence by sentence for natural pauses.
const ROBOTIC = /espeak|compact|albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|junior|kathy|organ|ralph|fred|superstar|trinoids|whisper|wobble|zarvox|grandma|grandpa|rocko|shelley|flo|eddy|reed|sandy/i;
const NICE = /samantha|ava|allison|zoe|evan|nathan|joelle|noelle|susan|serena|daniel|karen|moira|tessa|amélie|amelie|thomas|audrey|aurélie|marie|luciana|felipe|fernanda|joana|catarina|paulina|mónica|monica|jorge|marisol|francisca|helena|sabina|jenny|aria|guy|denise|henri|francisca|antonio|elvira|alvaro|dalia/i;
function voiceScore(v, lang) {
  const n = v.name;
  let sc = 0;
  if (v.lang.toLowerCase().startsWith(lang.toLowerCase())) sc += 100; else return -1;
  if (/natural|neural|online/i.test(n)) sc += 60;
  if (/premium/i.test(n)) sc += 55;
  if (/enhanced|improved/i.test(n)) sc += 50;
  if (/siri/i.test(n)) sc += 45;
  if (/google/i.test(n)) sc += 35;
  if (NICE.test(n)) sc += 20;
  if (ROBOTIC.test(n)) sc -= 200;
  if (v.localService === false) sc += 5;
  const pref = { en: 'en-US', fr: 'fr-FR', pt: 'pt-BR', es: 'es-MX' }[lang.slice(0, 2)];
  if (pref && v.lang === pref) sc += 8;
  return sc;
}
export function bestVoice(lang) {
  if (!('speechSynthesis' in window)) return null;
  const list = speechSynthesis.getVoices().map(v => [voiceScore(v, lang.slice(0, 2)), v]).filter(([sc]) => sc > 0).sort((a, b) => b[0] - a[0]);
  return list[0]?.[1] || null;
}
const sentences = text => (String(text).match(/[^.!?…]+[.!?…]+["”»’)]*|[^.!?…]+$/g) || [text]).map(x => x.trim()).filter(Boolean);
let speakToken = 0;
export const speech = {
  supported: 'speechSynthesis' in window,
  voices() { return this.supported ? speechSynthesis.getVoices() : []; },
  stop() { speakToken++; if (this.supported) speechSynthesis.cancel(); },
  speak(text, { rate = 1, voice = '', lang = 'en', pitch = 1, onend, onstart } = {}) {
    if (!this.supported) return null;
    const chosen = this.voices().find(x => x.voiceURI === voice && x.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
    const v = chosen || bestVoice(lang);
    const parts = sentences(text);
    const token = ++speakToken;
    let first = null;
    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part);
      u.rate = rate * 0.96; u.pitch = pitch;
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang;
      if (i === 0) { u.onstart = onstart; first = u; }
      if (i === parts.length - 1) { u.onend = () => { if (token === speakToken) onend?.(); }; u.onerror = u.onend; }
      speechSynthesis.speak(u);
    });
    return first;
  },
};
