import { esc, md, icon, toast } from './util.js';
import { chat, METHODS, getAI } from './ai.js';
import { load, save } from './store.js';
import { t, LANG } from './i18n.js';

// Runs an AI request and streams the answer into `out`.
export async function runAI(out, messages) {
  out.innerHTML = `<div class="ai-status" role="status"><span class="spinner"></span><span class="st">${t('ai.starting', 'Starting…')}</span></div><div class="ai-out" aria-live="polite"></div>`;
  const st = out.querySelector('.st'), body = out.querySelector('.ai-out'), status = out.querySelector('.ai-status');
  try {
    const text = await chat(messages, {
      onStatus: s => { st.textContent = s; },
      onToken: tx => { status.hidden = true; body.innerHTML = md(tx); },
    });
    status.hidden = true;
    body.innerHTML = md(text) + `<p class="muted small">${t('ai.disclaimer', 'AI can make mistakes — check it against the Bible text.')}</p>`;
    return text;
  } catch (e) {
    status.hidden = true;
    body.innerHTML = `<p class="err">${esc(e.message)}</p><a class="btn small" href="#/settings/ai">${icon('gear')} ${t('ai.settings', 'AI settings')}</a>`;
    return null;
  }
}

export function aiNotice() {
  const cfg = getAI();
  const name = { browser: t('ai.p.browser', 'on-device AI (private)'), pollinations: t('ai.p.pollinations', 'free online AI'), custom: t('ai.p.custom', 'your AI provider') }[cfg.provider];
  return `<p class="muted small">${t('ai.using', 'Using {name}', { name: esc(name) })} · <a href="#/settings/ai">${t('common.change', 'change')}</a></p>`;
}

// Study-method buttons for a passage.
export function aiMethods(container, getPassage, { only } = {}) {
  const list = only ? METHODS.filter(m => only.includes(m.id)) : METHODS;
  container.innerHTML = `${aiNotice()}<div class="chips" role="group" aria-label="${t('ai.methods', 'Study methods')}">${list.map(m => `<button class="chip" data-m="${m.id}">${esc(m.label)}</button>`).join('')}</div><div class="ai-result" style="margin-top:12px"></div>`;
  const res = container.querySelector('.ai-result');
  container.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', async () => {
    container.querySelectorAll('[data-m]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    const m = METHODS.find(x => x.id === b.dataset.m);
    runAI(res, [{ role: 'user', content: m.prompt(await getPassage()) }]);
  }));
}

// ---- Videos ----
const yt = q => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
const VQ = {
  en: { bp: 'BibleProject', ov: 'overview', ex: 'explained', st: 'bible study', se: 'sermon', ki: 'bible story for kids', sl: 'ASL bible sign language', au: 'audio bible' },
  fr: { bp: 'BibleProject Français', ov: 'résumé', ex: 'explication', st: 'étude biblique', se: 'prédication', ki: 'histoire biblique pour enfants', sl: 'Bible langue des signes LSF', au: 'Bible audio' },
  pt: { bp: 'BibleProject Português', ov: 'resumo', ex: 'explicação', st: 'estudo bíblico', se: 'pregação', ki: 'história bíblica para crianças', sl: 'Bíblia em Libras', au: 'Bíblia falada' },
  es: { bp: 'BibleProject Español', ov: 'resumen', ex: 'explicación', st: 'estudio bíblico', se: 'predicación', ki: 'historia bíblica para niños', sl: 'Biblia lengua de señas', au: 'Biblia hablada' },
};
export function videoSearches(book, ch) {
  const q = VQ[LANG] || VQ.en;
  const r = ch ? `${book} ${ch}` : book;
  return [
    { label: `${q.bp}: ${book}`, url: yt(`${q.bp} ${book} ${q.ov}`), note: t('vid.bp', 'Animated book overviews') },
    { label: `${r} — ${q.ex}`, url: yt(`${r} ${q.ex}`), note: t('vid.ex', 'Teaching & commentary') },
    { label: `${r} — ${q.st}`, url: yt(`${r} ${q.st}`), note: t('vid.st', 'Verse-by-verse studies') },
    { label: `${r} — ${q.se}`, url: yt(`${r} ${q.se}`), note: t('vid.se', 'Preaching on this passage') },
    { label: `${r} — ${q.ki}`, url: yt(`${r} ${q.ki}`), note: t('vid.ki', 'Kids & families') },
    { label: `${r} — ${q.sl}`, url: yt(`${r} ${q.sl}`), note: t('vid.sl', 'Sign language') },
    { label: `${r} — ${q.au}`, url: yt(`${r} ${q.au}`), note: t('vid.au', 'Listen along') },
  ];
}

export function youtubeId(url) {
  const m = String(url).match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : null;
}
export function getSavedVideos() { return load('videos', []); }
export function saveVideo(v) { const all = getSavedVideos(); all.unshift({ ...v, id: Date.now().toString(36) }); save('videos', all); }
export function removeVideo(id) { save('videos', getSavedVideos().filter(v => v.id !== id)); }

export function embedHtml(vid, title = 'Video') {
  return `<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${esc(vid)}" title="${esc(title)}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
}

export function videoPanel(container, book, ch, key = ch ? `${book} ${ch}` : book) {
  const draw = () => {
    const mine = getSavedVideos().filter(v => v.passage === key);
    container.innerHTML = `
      <ul class="link-list">${videoSearches(book, ch).map(v => `<li><a href="${v.url}" target="_blank" rel="noopener">${icon('video')}<span><b>${esc(v.label)}</b><small>${esc(v.note)}</small></span></a></li>`).join('')}</ul>
      ${mine.map(v => `<div style="margin-top:12px">${embedHtml(v.vid, v.title)}<div class="row between small"><span>${esc(v.title)}</span><button class="btn ghost small" data-del="${v.id}">${t('common.remove', 'Remove')}</button></div></div>`).join('')}
      <form class="row" style="margin-top:10px" data-add>
        <label class="sr-only" for="vurl-${ch}">YouTube</label>
        <input id="vurl-${ch}" class="input" style="flex:1;margin:0" placeholder="${t('vid.paste', 'Paste a YouTube link to save it here')}" inputmode="url">
        <button class="btn small">${icon('plus')} ${t('common.save', 'Save')}</button>
      </form>`;
    container.querySelector('[data-add]').addEventListener('submit', e => {
      e.preventDefault();
      const url = e.target.querySelector('input').value.trim();
      const vid = youtubeId(url);
      if (!vid) { toast(t('vid.bad', 'That doesn’t look like a YouTube link.')); return; }
      saveVideo({ vid, url, passage: key, title: key });
      toast(t('vid.saved', 'Video saved')); draw();
    });
    container.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { removeVideo(b.dataset.del); draw(); }));
  };
  draw();
}

// Simple tabs: [{id, label, icon}] → returns { el, show(id) }
export function tabs(container, items, onShow, active = items[0].id) {
  container.innerHTML = `<div class="tabs" role="tablist">${items.map(i => `<button role="tab" class="tab" data-tab="${i.id}" aria-selected="${i.id === active}">${i.icon ? icon(i.icon) : ''}<span>${esc(i.label)}</span></button>`).join('')}</div><div class="tab-body" role="tabpanel"></div>`;
  const body = container.querySelector('.tab-body');
  const show = id => {
    container.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === id));
    body.innerHTML = '';
    onShow(id, body);
  };
  container.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => show(b.dataset.tab)));
  show(active);
  return { show, body };
}

// ---- Verse image maker ----
const BGS = [
  ['#3b1d0f', '#a3471b'], ['#0f2a3b', '#2f6fb0'], ['#1d3b2a', '#4f9d6a'], ['#2b1d3b', '#7a4fb3'],
  ['#f6e3c5', '#f0b47a'], ['#fdfbf7', '#e9e2d6'], ['#111111', '#3a3a3a'], ['#3b0f24', '#c2477a'],
];
export function verseImage(text, ref, abbr = '') {
  let bg = 0, font = 'serif', align = 'center';
  const d = document.createElement('dialog');
  d.className = 'dlg wide';
  d.innerHTML = `<div class="dlg-head"><h2>${t('img.title', 'Verse image')}</h2><button class="icon-btn" data-close aria-label="${t('common.close', 'Close')}">${icon('x')}</button></div>
    <div class="dlg-body img-maker">
      <canvas width="1080" height="1080" aria-label="${esc(ref)}"></canvas>
      <div class="stack">
        <p class="field" style="margin:0">${t('img.bg', 'Background')}</p>
        <div class="row">${BGS.map((g, i) => `<button class="swatch big" data-bg="${i}" style="background:linear-gradient(135deg,${g[0]},${g[1]})" aria-label="${t('img.bg', 'Background')} ${i + 1}" aria-pressed="${i === 0}"></button>`).join('')}</div>
        <p class="field" style="margin:0">${t('set.font', 'Font')}</p>
        <div class="chips"><button class="chip" data-font="serif" aria-pressed="true">Serif</button><button class="chip" data-font="sans">Sans</button></div>
        <div class="chips"><button class="chip" data-align="center" aria-pressed="true">${t('img.center', 'Centered')}</button><button class="chip" data-align="left">${t('img.left', 'Left')}</button></div>
        <div class="row"><button class="btn primary" data-dl>${icon('download')} ${t('img.download', 'Download')}</button>${navigator.canShare ? `<button class="btn" data-share>${icon('share')} ${t('img.share', 'Share')}</button>` : ''}</div>
      </div>
    </div>`;
  document.body.appendChild(d);
  d.addEventListener('close', () => d.remove());
  d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  const cv = d.querySelector('canvas'), ctx = cv.getContext('2d');
  const paint = () => {
    const [a, z] = BGS[bg];
    const g = ctx.createLinearGradient(0, 0, 1080, 1080); g.addColorStop(0, a); g.addColorStop(1, z);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1080);
    const light = bg === 4 || bg === 5;
    const ink = light ? '#2a1f16' : '#ffffff';
    const family = font === 'serif' ? 'Literata, Georgia, serif' : 'Inter, system-ui, sans-serif';
    const body = `“${text}”`;
    let size = 72, lines = [];
    const wrap = sz => { ctx.font = `${sz}px ${family}`; const out = []; let line = ''; for (const w of body.split(/\s+/)) { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > 860 && line) { out.push(line); line = w; } else line = test; } if (line) out.push(line); return out; };
    for (; size > 26; size -= 3) { lines = wrap(size); if (lines.length * size * 1.4 < 700) break; }
    ctx.fillStyle = ink; ctx.textAlign = align; ctx.textBaseline = 'middle';
    const x = align === 'center' ? 540 : 110;
    const startY = 520 - (lines.length - 1) * size * 1.4 / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, startY + i * size * 1.4));
    ctx.font = `600 38px Inter, system-ui, sans-serif`; ctx.globalAlpha = .85;
    ctx.fillText(`${ref}${abbr ? ' · ' + abbr : ''}`, x, Math.min(1000, startY + lines.length * size * 1.4 + 50));
    ctx.font = `600 26px Inter, system-ui, sans-serif`; ctx.globalAlpha = .55; ctx.textAlign = 'right';
    ctx.fillText('Lamp', 1030, 1040); ctx.globalAlpha = 1;
  };
  const press = (sel, val) => d.querySelectorAll(sel).forEach(b => b.setAttribute('aria-pressed', b.dataset[sel.slice(6, -1)] === String(val)));
  d.querySelectorAll('[data-bg]').forEach(b => b.addEventListener('click', () => { bg = +b.dataset.bg; d.querySelectorAll('[data-bg]').forEach(x => x.setAttribute('aria-pressed', x === b)); paint(); }));
  d.querySelectorAll('[data-font]').forEach(b => b.addEventListener('click', () => { font = b.dataset.font; d.querySelectorAll('[data-font]').forEach(x => x.setAttribute('aria-pressed', x === b)); paint(); }));
  d.querySelectorAll('[data-align]').forEach(b => b.addEventListener('click', () => { align = b.dataset.align; d.querySelectorAll('[data-align]').forEach(x => x.setAttribute('aria-pressed', x === b)); paint(); }));
  const fileName = `${ref.replace(/[^\p{L}\p{N}]+/gu, '-')}.png`;
  d.querySelector('[data-dl]').addEventListener('click', () => cv.toBlob(bl => { const a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = fileName; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }));
  d.querySelector('[data-share]')?.addEventListener('click', () => cv.toBlob(async bl => { try { await navigator.share({ files: [new File([bl], fileName, { type: 'image/png' })], text: `${ref}` }); } catch {} }));
  d.showModal();
  (document.fonts?.ready || Promise.resolve()).then(paint);
  paint();
}
