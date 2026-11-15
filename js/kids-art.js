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
const v2 = id => Array.from({ length: 8 }, (_, i) => `${id}-p${i + 1}.webp`).every(has);
export const painted = (id, pages = 6) => v2(id) || Array.from({ length: pages }, (_, i) => `${id}-${i + 1}.webp`).every(has);
// Which earlier (6-page) picture best fits each new page, until the 8-page pictures exist.
const OLD_MAP = {
  christmas: [1, 1, 1, 2, 3, 4, 5, 6], friends: [2, 1, 3, 4, 4, 5, 5, 6], feeding: [1, 2, 3, 4, 4, 5, 6, 6],
  children: [1, 1, 2, 3, 4, 5, 5, 6], samaritan: [1, 1, 2, 3, 4, 5, 5, 6], blind: [2, 1, 2, 3, 4, 3, 5, 6],
};
const pageFile = (id, n) => has(`${id}-p${n}.webp`) ? `${id}-p${n}.webp` : `${id}-${OLD_MAP[id]?.[n - 1] || Math.min(6, Math.max(1, Math.round(n * 6 / 8)))}.webp`;
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
