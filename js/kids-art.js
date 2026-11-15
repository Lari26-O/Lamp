// Kids illustrations: painted storybook pictures in img/kids/ (listed in img/kids/ready.json).
// Anything not painted yet falls back to the simpler drawn art in kids-art-flat.js.
import { flatScene, flatPic, flatColorSrc, flatRealSrc, FLAT_PIC_IDS, FLAT_SCENES } from './kids-art-flat.js';

const BASE = 'img/kids/';
let READY = new Set();
try {
  const r = await fetch(BASE + 'ready.json');
  if (r.ok) READY = new Set((await r.json()).files || []);
} catch { /* offline first run: drawn art */ }

const COLOR_FROM = {
  creation: 4, christmas: 4, friends: 5, storm: 6, feeding: 4, children: 6, samaritan: 5, blind: 6, zacchaeus: 3, sheep: 5, love: 6, easter: 6, always: 6,
  noah: 3, abraham: 5, joseph: 1, babymoses: 3, redsea: 5, jericho: 4, ruth: 4, samuel: 2, david: 5, jonah: 3, daniel: 5, esther: 5,
};
const has = f => READY.has(f);
// v2 pictures are named <id>-p<n>.webp (8 per story); earlier ones <id>-<n>.webp (6 per story).
// Which earlier (6-page) picture best fits each new page, until the 8-page pictures exist.
const OLD_MAP = {
  christmas: [1, 1, 1, 2, 3, 4, 5, 6], friends: [2, 1, 3, 4, 4, 5, 5, 6], feeding: [1, 2, 3, 4, 4, 5, 6, 6],
  children: [1, 1, 2, 3, 4, 5, 5, 6], samaritan: [1, 1, 2, 3, 4, 5, 5, 6], blind: [2, 1, 2, 3, 4, 3, 5, 6],
};
function pageFile(id, n) {
  if (has(`${id}-p${n}.webp`)) return `${id}-p${n}.webp`;
  const old = `${id}-${OLD_MAP[id]?.[n - 1] || Math.min(6, Math.max(1, Math.round(n * 6 / 8)))}.webp`;
  if (has(old)) return old;
  for (let d = 1; d < 8; d++) for (const m of [n - d, n + d]) if (m >= 1 && m <= 8 && has(`${id}-p${m}.webp`)) return `${id}-p${m}.webp`;
  return null;
}
// A story counts as painted when every one of its 8 pages has a picture (its own or a close one).
const ownPages = id => Array.from({ length: 8 }, (_, i) => i + 1).filter(n => has(`${id}-p${n}.webp`) || has(`${id}-${OLD_MAP[id]?.[n - 1] || Math.min(6, Math.max(1, Math.round(n * 6 / 8)))}.webp`)).length;
export const painted = id => ownPages(id) >= 6 && Array.from({ length: 8 }, (_, i) => pageFile(id, i + 1)).every(Boolean);
const COVER = { christmas: 6, friends: 6, storm: 6, feeding: 4, children: 8, samaritan: 7, blind: 8, zacchaeus: 4, sheep: 7, love: 5, easter: 8, always: 6,
  creation: 6, noah: 4, abraham: 6, joseph: 1, babymoses: 5, redsea: 7, jericho: 8, ruth: 4, samuel: 4, david: 6, jonah: 5, daniel: 8, esther: 6 };
export const cover = id => painted(id) ? (COVER[id] || 3) : 3;
export const hasArt = id => painted(id) || FLAT_SCENES.includes(id);
export const sceneSrc = (id, n = 1) => BASE + pageFile(id, n);
export const colorSrc = id => has(`color/${id}.png`) ? `${BASE}color/${id}.png` : flatColorSrc(id);
export const realSrc = id => painted(id) ? sceneSrc(id, COLOR_FROM[id] || 1) : flatRealSrc(id);
export function scene(id, n = 1, { eager = false } = {}) {
  if (!painted(id)) return flatScene(id, Math.min(4, Math.max(1, Math.ceil(n * 4 / 8))));
  return `<img class="kid-scene" src="${sceneSrc(id, n)}" alt="" width="960" height="630" ${eager ? '' : 'loading="lazy"'} decoding="async">`;
}
export function pic(id) {
  if (!has(`pics/${id}.webp`)) return flatPic(id);
  return `<img class="kid-pic" src="${BASE}pics/${id}.webp" alt="" width="320" height="320" loading="lazy" decoding="async">`;
}
export const hasPic = id => has(`pics/${id}.webp`) || FLAT_PIC_IDS.includes(id);
export const PIC_IDS = ['star', 'baby', 'boat', 'fish', 'bread', 'sheep', 'heart', 'tree', 'sun', 'dove', 'tomb', 'basket', 'people', 'jesus', 'house', 'bandage',
  'ark', 'rainbow', 'coat', 'reeds', 'staff', 'trumpet', 'wall', 'wheat', 'lamp', 'sling', 'whale', 'lion', 'crown'].filter(hasPic);
