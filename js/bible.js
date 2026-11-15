import { BOOKS } from './data/books.js';
import { LANG, BOOK_NAMES, t } from './i18n.js';
import { YOUVERSION_APP_KEY } from './config.js';
import { load, save } from './store.js';
export { BOOKS };

export const USFM = 'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ');

// ---------------------------------------------------------------------------
// Bible versions
//   src 'local'    – bundled with the app, works offline (public domain / CC)
//   src 'bibleapi' – public domain, fetched free from bible-api.com
//   src 'yv'       – licensed translations via the free YouVersion Platform API
// ---------------------------------------------------------------------------
export const LOCAL_VERSIONS = [
  { id: 'kjv', lang: 'en', abbr: 'KJV', name: 'King James Version', src: 'local', license: 'Public domain' },
  { id: 'bsb', lang: 'en', abbr: 'BSB', name: 'Berean Standard Bible', src: 'local', license: 'CC0 — public domain' },
  { id: 'darby-fr', lang: 'fr', abbr: 'DBY', name: 'Bible Darby (1885)', src: 'local', license: 'Domaine public' },
  { id: 'martin', lang: 'fr', abbr: 'MAR', name: 'Bible David Martin (1744)', src: 'local', license: 'Domaine public' },
  { id: 'blivre', lang: 'pt', abbr: 'BLIVRE', name: 'Bíblia Livre', src: 'local', license: 'CC BY 3.0 BR — Diego Santos' },
  { id: 'nva', lang: 'pt', abbr: 'NVA', name: 'Nova Versão de Acesso Livre', src: 'local', license: 'CC BY-SA 4.0' },
  { id: 'rv1909', lang: 'es', abbr: 'RV1909', name: 'Reina-Valera 1909', src: 'local', license: 'Dominio público' },
  { id: 'rv1865', lang: 'es', abbr: 'RV1865', name: 'Reina-Valera 1865', src: 'local', license: 'Dominio público' },
  { id: 'web', lang: 'en', abbr: 'WEB', name: 'World English Bible', src: 'bibleapi', api: 'web', license: 'Public domain' },
  { id: 'bbe', lang: 'en', abbr: 'BBE', name: 'Bible in Basic English', src: 'bibleapi', api: 'bbe', license: 'Public domain' },
  { id: 'asv', lang: 'en', abbr: 'ASV', name: 'American Standard Version', src: 'bibleapi', api: 'asv', license: 'Public domain' },
  { id: 'almeida', lang: 'pt', abbr: 'ALM', name: 'João Ferreira de Almeida', src: 'bibleapi', api: 'almeida', license: 'Domínio público' },
];

// Most-used translations per language (YouVersion abbreviations, in order of popularity).
// `id` is the usual YouVersion id; the live list from the API is preferred when available.
export const POPULAR = {
  en: [['NKJV', 114, 'New King James Version'], ['NIV', 111, 'New International Version'], ['ESV', 59, 'English Standard Version'], ['NLT', 116, 'New Living Translation'], ['CSB', 1713, 'Christian Standard Bible'], ['NASB2020', 2692, 'New American Standard Bible'], ['AMP', 1588, 'Amplified Bible']],
  pt: [['NVI', 129, 'Nova Versão Internacional'], ['ARA', 1608, 'Almeida Revista e Atualizada'], ['ARC', 212, 'Almeida Revista e Corrigida'], ['NVT', 1930, 'Nova Versão Transformadora'], ['NAA', 1840, 'Nova Almeida Atualizada'], ['NTLH', 211, 'Nova Tradução na Linguagem de Hoje']],
  es: [['RVR1960', 149, 'Reina-Valera 1960'], ['NVI', 128, 'Nueva Versión Internacional'], ['NTV', 127, 'Nueva Traducción Viviente'], ['LBLA', 89, 'La Biblia de las Américas'], ['RVC', 146, 'Reina Valera Contemporánea'], ['DHH', null, 'Dios Habla Hoy']],
  fr: [['LSG', 93, 'Louis Segond 1910'], ['S21', 152, 'Segond 21'], ['BDS', 21, 'Bible du Semeur'], ['NEG79', 106, 'Nouvelle Edition de Genève 1979'], ['PDV2017', 133, 'Parole de Vie 2017'], ['NBS', null, 'Nouvelle Bible Segond']],
};

export function yvKey() { return (load('settings', {}).yvKey || YOUVERSION_APP_KEY || '').trim(); }

// Builds the version list for the selector: local + online + popular (YouVersion).
export function allVersions() {
  const yvCache = load('yvVersions', {});
  const out = [...LOCAL_VERSIONS];
  for (const [lang, list] of Object.entries(POPULAR)) {
    const live = yvCache[lang]?.list || [];
    for (const [abbr, id, name] of list) {
      const hit = live.find(v => norm(v.abbreviation) === norm(abbr) || norm(v.localized_abbreviation) === norm(abbr));
      const yvId = hit?.id ?? id;
      if (yvId == null) continue;
      out.push({ id: 'yv' + yvId, yvId, lang, abbr, name: hit?.localized_title || hit?.title || name, src: 'yv', popular: true, copyright: hit?.copyright || '' });
    }
    for (const v of live) {
      if (out.some(o => o.yvId === v.id)) continue;
      out.push({ id: 'yv' + v.id, yvId: v.id, lang, abbr: v.localized_abbreviation || v.abbreviation, name: v.localized_title || v.title, src: 'yv', copyright: v.copyright || '' });
    }
  }
  return out;
}
export function getVersion(id) { return allVersions().find(v => v.id === id) || LOCAL_VERSIONS[0]; }
export function defaultVersionFor(lang) { return { en: 'kjv', fr: 'darby-fr', pt: 'blivre', es: 'rv1909' }[lang] || 'kjv'; }
export const isAvailable = v => v.src !== 'yv' || !!yvKey();

// Fetches the list of versions the YouVersion key can use for a language (cached a week).
export async function refreshYV(lang) {
  const key = yvKey(); if (!key) return [];
  const cache = load('yvVersions', {});
  if (cache[lang] && Date.now() - cache[lang].at < 7 * 864e5) return cache[lang].list;
  try {
    const url = `https://api.youversion.com/v1/bibles?language_ranges[]=${encodeURIComponent(lang)}&page_size=100`;
    const r = await fetch(url, { headers: { 'X-YVP-App-Key': key } });
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    cache[lang] = { at: Date.now(), list: (j.data || []).map(v => ({ id: v.id, abbreviation: v.abbreviation, localized_abbreviation: v.localized_abbreviation, title: v.title, localized_title: v.localized_title, copyright: v.copyright })) };
    save('yvVersions', cache);
    return cache[lang].list;
  } catch { return cache[lang]?.list || []; }
}

// ---------------------------------------------------------------------------
// Text loading
// ---------------------------------------------------------------------------
const bookCache = new Map();
export function getBook(b, vid = 'kjv') {
  const key = vid + ':' + b;
  if (!bookCache.has(key)) {
    const p = fetch(`data/${vid}/${b}.json`).then(r => { if (!r.ok) throw new Error('Could not load ' + bookName(b)); return r.json(); });
    p.catch(() => bookCache.delete(key));
    bookCache.set(key, p);
  }
  return bookCache.get(key);
}

const memCache = new Map();
// Returns { verses: [{v, text}], headings: {v: text}, copyright }
export async function loadChapter(b, c, vid = 'kjv') {
  const v = getVersion(vid);
  const key = `${v.id}:${b}:${c}`;
  if (memCache.has(key)) return memCache.get(key);
  let res;
  if (v.src === 'local') {
    const book = await getBook(b, v.id);
    const ch = book[c - 1];
    if (!ch) throw new Error('Chapter not found');
    res = { verses: ch.map((text, i) => ({ v: i + 1, text })).filter(x => x.text), headings: {}, copyright: v.license };
  } else if (v.src === 'bibleapi') {
    const r = await fetch(`https://bible-api.com/${encodeURIComponent(BOOKS[b].name + ' ' + c)}?translation=${v.api}`);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    res = { verses: (data.verses || []).map(x => ({ v: x.verse, text: String(x.text).replace(/\s+/g, ' ').trim() })), headings: {}, copyright: v.license };
  } else {
    res = await loadYV(v, b, c);
  }
  if (!res.verses.length) throw new Error('empty');
  memCache.set(key, res);
  return res;
}

async function loadYV(v, b, c) {
  const key = yvKey();
  if (!key) { const e = new Error(t('bible.needKey', 'This version needs a free YouVersion key (Settings → Bible versions).')); e.code = 'nokey'; throw e; }
  const url = `https://api.youversion.com/v1/bibles/${v.yvId}/passages/${USFM[b]}.${c}?format=html&include_headings=true&include_notes=false`;
  const r = await fetch(url, { headers: { 'X-YVP-App-Key': key } });
  if (r.status === 401 || r.status === 403) { const e = new Error(t('bible.noLicense', 'Your YouVersion key is not licensed for {v}. Accept its license at platform.youversion.com.', { v: v.abbr })); e.code = 'license'; throw e; }
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  const parsed = parseYVHtml(j.content || '');
  return { ...parsed, copyright: v.copyright || 'YouVersion' };
}

// Turns YouVersion passage HTML into verses. Verse markers are `.yv-v[v]`,
// labels `.yv-vlbl`, footnotes `.yv-n`, headings `.yv-h`.
export function parseYVHtml(html) {
  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, 'text/html');
  const root = doc.getElementById('root');
  root.querySelectorAll('.yv-n, .yv-vf, .note, sup.fn').forEach(n => n.remove());
  const text = {}, headings = {};
  let cur = 0, pendingHead = '';
  const walk = node => {
    for (const ch of [...node.childNodes]) {
      if (ch.nodeType === 3) { if (cur) text[cur] = (text[cur] || '') + ch.textContent; continue; }
      if (ch.nodeType !== 1) continue;
      if (ch.matches('.yv-vlbl, .label')) continue;
      if (ch.matches('.yv-h, h1, h2, h3, h4, .s, .s1, .s2, .heading')) { const h = ch.textContent.trim(); if (h) pendingHead = h; continue; }
      if (ch.matches('.yv-v[v], [data-verse]')) {
        const n = parseInt(ch.getAttribute('v') || ch.getAttribute('data-verse'), 10);
        if (n) { cur = n; if (pendingHead) { headings[n] = pendingHead; pendingHead = ''; } }
      }
      walk(ch);
      if (ch.matches('p, div') && cur) text[cur] = (text[cur] || '') + ' ';
    }
  };
  walk(root);
  let verses = Object.entries(text).map(([v, s]) => ({ v: +v, text: s.replace(/\s+/g, ' ').trim() })).filter(x => x.text).sort((a, z) => a.v - z.v);
  if (!verses.length) {
    // Fallback: plain text with inline numbers.
    const plain = root.textContent.replace(/\s+/g, ' ');
    verses = plain.split(/(?:^|\s)(\d{1,3})\s+/).reduce((acc, part, i, arr) => { if (i % 2 === 1) acc.push({ v: +part, text: (arr[i + 1] || '').trim() }); return acc; }, []);
  }
  return { verses, headings };
}

// ---------------------------------------------------------------------------
// Names & references
// ---------------------------------------------------------------------------
export function bookName(b, lang = LANG) { return (BOOK_NAMES[lang] || [])[b] || BOOKS[b].name; }

const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const ALIASES = {
  gen: 0, ge: 0, gn: 0, ex: 1, exo: 1, exod: 1, lev: 2, lv: 2, num: 3, nm: 3, deut: 4, dt: 4, josh: 5, jos: 5, judg: 6, jdg: 6, jg: 6, jue: 6, jz: 6,
  rth: 7, ru: 7, '1sam': 8, '1sa': 8, '1s': 8, '2sam': 9, '2sa': 9, '2s': 9, '1kgs': 10, '1ki': 10, '1r': 10, '1re': 10, '2kgs': 11, '2ki': 11, '2r': 11, '2re': 11,
  '1chr': 12, '1ch': 12, '1cr': 12, '2chr': 13, '2ch': 13, '2cr': 13, neh: 15, ne: 15, est: 16, esth: 16, jb: 17, ps: 18, psa: 18, psalm: 18, sl: 18, sal: 18,
  prov: 19, pr: 19, pv: 19, eccl: 20, ecc: 20, ec: 20, song: 21, sos: 21, ct: 21, cant: 21, isa: 22, is: 22, es: 22, jer: 23, jr: 23, lam: 24, lm: 24,
  ezek: 25, eze: 25, ezk: 25, ez: 25, dan: 26, dn: 26, hos: 27, os: 27, joe: 28, jl: 28, am: 29, obad: 30, ob: 30, ab: 30, jon: 31, jnh: 31, mic: 32, mq: 32,
  nah: 33, na: 33, hab: 34, hc: 34, zeph: 35, zep: 35, sf: 35, hag: 36, ag: 36, zech: 37, zec: 37, zc: 37, mal: 38, ml: 38,
  mt: 39, matt: 39, mat: 39, mk: 40, mc: 40, mrk: 40, lk: 41, lc: 41, luk: 41, jn: 42, jhn: 42, joh: 42, jo: 42, ac: 43, at: 43, hch: 43, rom: 44, rm: 44,
  '1cor': 45, '1co': 45, '2cor': 46, '2co': 46, gal: 47, gl: 47, eph: 48, ef: 48, phil: 49, php: 49, fp: 49, flp: 49, col: 50, cl: 50,
  '1thess': 51, '1th': 51, '1ts': 51, '2thess': 52, '2th': 52, '2ts': 52, '1tim': 53, '1ti': 53, '1tm': 53, '2tim': 54, '2ti': 54, '2tm': 54,
  tit: 55, tt: 55, phlm: 56, phm: 56, fm: 56, heb: 57, hb: 57, jas: 58, jm: 58, tg: 58, stg: 58, '1pet': 59, '1pe': 59, '1pd': 59, '2pet': 60, '2pe': 60, '2pd': 60,
  '1jn': 61, '1jo': 61, '2jn': 62, '2jo': 62, '3jn': 63, '3jo': 63, jud: 64, jude: 64, jd: 64, rev: 65, re: 65, rv: 65, ap: 65, apoc: 65, revelations: 65,
};
const NAME_SETS = () => [BOOKS.map(b => b.name), ...Object.values(BOOK_NAMES)].map(list => list.map(norm));

export function findBook(text) {
  let s = norm(String(text).replace(/^\s*(i{1,3})\s+/i, m => String(m.trim().length)));
  s = s.replace(/^(first|premier|primeiro|primero)/, '1').replace(/^(second|deuxieme|segundo)/, '2').replace(/^(third|troisieme|terceiro|tercero)/, '3');
  if (!s) return -1;
  const sets = NAME_SETS();
  const cur = (BOOK_NAMES[LANG] || BOOKS.map(b => b.name)).map(norm);
  let i = cur.indexOf(s); if (i >= 0) return i;
  for (const set of sets) { i = set.indexOf(s); if (i >= 0) return i; }
  if (s in ALIASES) return ALIASES[s];
  i = cur.findIndex(n => n.startsWith(s)); if (i >= 0) return i;
  for (const set of sets) { i = set.findIndex(n => n.startsWith(s)); if (i >= 0) return i; }
  return -1;
}

// "John 3:16-18", "Jean 3.16", "1 Cor 13", "Salmos 23:1", "Genesis 1:1-2:3"
export function parseRef(str) {
  if (!str) return null;
  const m = String(str).trim().match(/^((?:[1-3]|i{1,3})?\s*\p{L}[\p{L} .']*?)\s*(\d+)(?:\s*[:.,]\s*(\d+)(?:\s*[-–]\s*(\d+)(?:\s*[:.]\s*(\d+))?)?)?\s*$/iu);
  if (!m) return null;
  const b = findBook(m[1]);
  if (b < 0) return null;
  const c = parseInt(m[2], 10);
  if (c < 1 || c > BOOKS[b].ch) return null;
  const ref = { b, c };
  if (m[3]) {
    ref.v1 = parseInt(m[3], 10);
    if (m[5]) { ref.c2 = parseInt(m[4], 10); ref.v2 = parseInt(m[5], 10); }
    else if (m[4]) ref.v2 = parseInt(m[4], 10);
  }
  return ref;
}

export function refLabel(r, lang = LANG) {
  if (!r) return '';
  let s = `${bookName(r.b, lang)} ${r.c}`;
  if (r.v1) s += `:${r.v1}`;
  if (r.c2) s += `-${r.c2}:${r.v2}`;
  else if (r.v2 && r.v2 !== r.v1) s += `-${r.v2}`;
  return s;
}
// Re-label an English reference string in the current language.
export const localRef = str => { const r = parseRef(str); return r ? refLabel(r) : str; };
export const refHash = r => `#/read/${r.b}/${r.c}${r.v1 ? '/' + r.v1 : ''}`;

export async function getPassage(r, vid) {
  if (!r) return [];
  vid = vid || currentVersion();
  const out = [];
  const endC = r.c2 || r.c;
  for (let c = r.c; c <= endC; c++) {
    let verses;
    try { verses = (await loadChapter(r.b, c, vid)).verses; }
    catch { verses = (await loadChapter(r.b, c, defaultVersionFor(LANG))).verses; }
    for (const x of verses) {
      if (r.v1) {
        if (c === r.c && x.v < r.v1) continue;
        if (r.c2) { if (c === r.c2 && x.v > r.v2) continue; }
        else if (x.v > (r.v2 || r.v1)) continue;
      }
      out.push({ c, ...x });
    }
  }
  return out;
}
export async function passageText(ref, vid) {
  const r = typeof ref === 'string' ? parseRef(ref) : ref;
  return (await getPassage(r, vid)).map(v => v.text).join(' ');
}

export function currentVersion() {
  const s = load('settings', {});
  const v = s.version;
  if (v && allVersions().some(x => x.id === v)) return v;
  return defaultVersionFor(LANG);
}

// Full-text search across a bundled (offline) version.
export async function search(query, { limit = 300, onProgress, testament, vid } = {}) {
  const q = query.trim();
  if (!q) return [];
  const v = getVersion(vid || currentVersion());
  const local = v.src === 'local' ? v.id : defaultVersionFor(v.lang);
  const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const words = fold(q).replace(/"/g, '').split(/\s+/).filter(Boolean);
  const phrase = /^".*"$/.test(q) ? fold(q.slice(1, -1)) : null;
  const results = [];
  for (let b = 0; b < BOOKS.length && results.length < limit; b++) {
    if (testament && BOOKS[b].t !== testament) continue;
    const book = await getBook(b, local);
    onProgress?.(b);
    book.forEach((ch, ci) => ch.forEach((text, vi) => {
      if (results.length >= limit || !text) return;
      const low = fold(text);
      if (phrase ? low.includes(phrase) : words.every(w => low.includes(w))) results.push({ b, c: ci + 1, v: vi + 1, text });
    }));
  }
  return { results, version: local };
}
