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
export const painted = (id, pages = 6) => Array.from({ length: pages }, (_, i) => `${id}-${i + 1}.webp`).every(has);
export const hasArt = id => painted(id) || FLAT_SCENES.includes(id);
export const sceneSrc = (id, n = 1) => `${BASE}${id}-${n}.webp`;
export const colorSrc = id => has(`color/${id}.png`) ? `${BASE}color/${id}.png` : flatColorSrc(id);
export const realSrc = id => painted(id) ? sceneSrc(id, COLOR_FROM[id] || 1) : flatRealSrc(id);
export function scene(id, n = 1, { eager = false } = {}) {
  if (!painted(id)) return flatScene(id, Math.min(4, Math.ceil(n * 4 / 6)));
  return `<img class="kid-scene" src="${sceneSrc(id, n)}" alt="" width="960" height="630" ${eager ? '' : 'loading="lazy"'} decoding="async">`;
}
export function pic(id) {
  if (!has(`pics/${id}.webp`)) return flatPic(id);
  return `<img class="kid-pic" src="${BASE}pics/${id}.webp" alt="" width="320" height="320" loading="lazy" decoding="async">`;
}
export const hasPic = id => has(`pics/${id}.webp`) || FLAT_PIC_IDS.includes(id);
export const PIC_IDS = ['star', 'baby', 'boat', 'fish', 'bread', 'sheep', 'heart', 'tree', 'sun', 'dove', 'tomb', 'basket', 'people', 'jesus', 'house', 'bandage',
  'ark', 'rainbow', 'coat', 'reeds', 'staff', 'trumpet', 'wall', 'wheat', 'lamp', 'sling', 'whale', 'lion', 'crown'].filter(hasPic);
