// Lamp storybook art: original flat illustrations drawn in SVG (no outside images, no logos).
// scene(id, n)          → picture for page n (1–4) of a story, 800×520
// scene(id, n, {outline}) → the same picture as a coloring page
// pic(id)               → round sticker / picture card
// colorSrc(id) / realSrc(id) → data URLs for the coloring canvas

let OUT = false, P = 'a', defs = [], uid = 0, K = 1, PIC = false;
const nid = () => `${P}${uid++}`;
const mix = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
  return '#' + [f(r), f(g), f(b)].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
};
const INK = '#3a3048';
const F = c => OUT ? `fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round" class="cz" data-c="${c}"` : `fill="${c}"`;
const LG = (c1, c2, x2 = 0, y2 = 1) => {
  if (OUT) return F(c1);
  const g = nid(); defs.push(`<linearGradient id="${g}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`);
  return `fill="url(#${g})"`;
};
const RG = (c, o1 = 1, o2 = 0) => {
  const g = nid(); defs.push(`<radialGradient id="${g}"><stop offset="0" stop-color="${c}" stop-opacity="${o1}"/><stop offset="1" stop-color="${c}" stop-opacity="${o2}"/></radialGradient>`);
  return `fill="url(#${g})"`;
};
const D = s => OUT ? '' : s;
const GL = s => (OUT || PIC) ? '' : s;  // big soft glows               // decoration only in color mode
const shadow = (x, y, w) => D(`<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * .2}" fill="#2c2045" opacity=".15"/>`);
const G = (x, y, s, inner, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">${inner}</g>`;

// ------------------------------------------------------------------ people
export const SKIN = { a: '#f2c29b', b: '#d9a073', c: '#b77b52', d: '#8f5a3a' };
const HAIR = { brown: '#5b3a24', dark: '#2e211b', light: '#a0663a', black: '#1d1717', gray: '#c2bab2', red: '#a2492c' };

export function person(x, y, s = 1, o = {}) {
  s *= K;
  const J = !!o.jesus;
  const robe = J ? '#fbf7ef' : (o.robe || '#6cb4ee');
  const sash = J ? '#d9534f' : o.sash;
  const skin = o.skin || SKIN.b;
  const hair = J ? HAIR.brown : (o.hair || HAIR.brown);
  const style = J ? 'long' : (o.hairStyle || 'short');
  const beard = J || o.beard;
  const child = !!o.child;
  const kneel = !!o.kneel;
  const pose = o.pose || 'stand';
  const hs = child ? 1.18 : 1;
  const bh = (child ? .74 : 1) * (kneel ? .66 : 1);
  const top = -82 * bh;
  const hy = top - 24 * hs;
  const cid = nid();
  const w = kneel ? 1.18 : 1;
  const robeD = `M-15 ${top} C-27 ${top + 2} -31 ${top + 22 * bh} ${-33 * w} ${-30 * bh} C${-35 * w} ${-14 * bh} ${-38 * w} -6 ${-36 * w} -2 Q0 5 ${36 * w} -2 C${38 * w} -6 ${35 * w} ${-14 * bh} ${33 * w} ${-30 * bh} C31 ${top + 22 * bh} 27 ${top + 2} 15 ${top} Q0 ${top - 4} -15 ${top} Z`;
  const H = {
    stand: [[-27, -42 * bh], [27, -42 * bh]],
    wave: [[-27, -42 * bh], [36, top - 30]],
    open: [[-48, top + 8], [48, top + 8]],
    up: [[-30, top - 40], [30, top - 40]],
    hold: [[-13, top + 28], [13, top + 28]],
    pray: [[-4, top + 16], [4, top + 16]],
    point: [[-27, -42 * bh], [54, top]],
    stop: [[-27, -42 * bh], [44, top - 14]],
    reach: [[-40, top + 22], [40, top + 22]],
    give: [[22, top + 26], [34, top + 22]],
    hug: [[-30, top + 34], [30, top + 34]],
    face: [[-12, hy + 14 - top + top], [12, hy + 14]],
  }[pose];
  const sleeve = (hx, hy2, side) => {
    const sx = side * 17, sy = top + 7;
    const dx = hx - sx, dy = hy2 - sy, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const w1 = 10, w2 = 7.5;
    const mx = (sx + hx) / 2 + side * 3, my = (sy + hy2) / 2 + 3;
    const d = `M${sx + nx * w1} ${sy + ny * w1} Q${mx + nx * 9.5} ${my + ny * 9.5} ${hx + nx * w2} ${hy2 + ny * w2} L${hx - nx * w2} ${hy2 - ny * w2} Q${mx - nx * 9.5} ${my - ny * 9.5} ${sx - nx * w1} ${sy - ny * w1} Z`;
    const ux = dx / L, uy = dy / L;
    return `<path d="${d}" ${F(mix(robe, -.05))}/><ellipse cx="${hx + ux * 7}" cy="${hy2 + uy * 7}" rx="7" ry="8" ${F(skin)}/>`;
  };
  const backHair = {
    long: `<path d="M-27 ${hy - 4} C-31 ${hy + 26} -27 ${hy + 40} -15 ${hy + 42} L15 ${hy + 42} C27 ${hy + 40} 31 ${hy + 26} 27 ${hy - 4} Z" ${F(mix(hair, -.12))}/>`,
    veil: `<path d="M-32 ${hy - 2} C-36 ${hy - 40} 36 ${hy - 40} 32 ${hy - 2} L38 ${hy + 46} Q0 ${hy + 54} -38 ${hy + 46} Z" ${F(o.veil || '#4e8fd6')}/>`,
    bun: `<circle cx="0" cy="${hy - 27}" r="11" ${F(hair)}/>`,
    curly: `<circle cx="-21" cy="${hy - 6}" r="12" ${F(hair)}/><circle cx="21" cy="${hy - 6}" r="12" ${F(hair)}/>`,
    pony: `<path d="M18 ${hy - 14} C40 ${hy - 10} 40 ${hy + 22} 28 ${hy + 30} C32 ${hy + 14} 28 ${hy} 16 ${hy - 4} Z" ${F(hair)}/>`,
    short: '', bald: '',
  }[style] || '';
  const fringe = {
    long: `M-26 ${hy - 2} C-28 ${hy - 30} -6 ${hy - 36} 4 ${hy - 31} C18 ${hy - 33} 30 ${hy - 22} 26 ${hy - 2} C22 ${hy - 14} 12 ${hy - 21} 2 ${hy - 20} C-6 ${hy - 22} -18 ${hy - 16} -26 ${hy - 2} Z`,
    veil: `M-26 ${hy - 2} C-28 ${hy - 30} 28 ${hy - 30} 26 ${hy - 2} C18 ${hy - 16} -18 ${hy - 16} -26 ${hy - 2} Z`,
    short: `M-25 ${hy - 4} C-27 ${hy - 30} 22 ${hy - 36} 25 ${hy - 6} C20 ${hy - 16} 8 ${hy - 19} -2 ${hy - 17} C-12 ${hy - 21} -20 ${hy - 14} -25 ${hy - 4} Z`,
    bun: `M-25 ${hy - 2} C-26 ${hy - 30} 26 ${hy - 30} 25 ${hy - 2} C18 ${hy - 18} -18 ${hy - 18} -25 ${hy - 2} Z`,
    pony: `M-25 ${hy - 2} C-26 ${hy - 30} 26 ${hy - 30} 25 ${hy - 2} C18 ${hy - 18} -18 ${hy - 18} -25 ${hy - 2} Z`,
    curly: `M-26 ${hy - 2} C-30 ${hy - 34} 30 ${hy - 34} 26 ${hy - 2} C22 ${hy - 12} 14 ${hy - 20} 6 ${hy - 16} C0 ${hy - 22} -10 ${hy - 18} -14 ${hy - 14} C-20 ${hy - 16} -24 ${hy - 10} -26 ${hy - 2} Z`,
    bald: `M-24 ${hy - 2} C-26 ${hy - 8} -24 ${hy - 14} -20 ${hy - 16} L-18 ${hy - 4} Z M24 ${hy - 2} C26 ${hy - 8} 24 ${hy - 14} 20 ${hy - 16} L18 ${hy - 4} Z`,
  }[style];
  const eyes = o.eyes || 'open';
  const eye = ex => eyes === 'closed' ? `<path d="M${ex - 4} ${hy + 2} Q${ex} ${hy + 6} ${ex + 4} ${hy + 2}" fill="none" stroke="#2a1d18" stroke-width="2.4" stroke-linecap="round"/>`
    : eyes === 'happy' ? `<path d="M${ex - 4.5} ${hy + 3} Q${ex} ${hy - 3.5} ${ex + 4.5} ${hy + 3}" fill="none" stroke="#2a1d18" stroke-width="2.6" stroke-linecap="round"/>`
    : `<ellipse cx="${ex}" cy="${hy + 1}" rx="3.7" ry="4.7" fill="#2a1d18"/>${D(`<circle cx="${ex + 1.3}" cy="${hy - 1}" r="1.5" fill="#fff"/><circle cx="${ex - 1.2}" cy="${hy + 3}" r=".7" fill="#fff"/>`)}`;
  const mouth = o.mouth || 'smile';
  const M = mouth === 'sad' ? `<path d="M-5 ${hy + 15} Q0 ${hy + 10} 5 ${hy + 15}" fill="none" stroke="${OUT ? INK : '#8a3434'}" stroke-width="2.2" stroke-linecap="round"/>`
    : mouth === 'o' ? `<ellipse cx="0" cy="${hy + 14}" rx="3.5" ry="4.5" fill="${OUT ? INK : '#8a3434'}"/>`
    : mouth === 'big' ? `<path d="M-8 ${hy + 10} Q0 ${hy + 22} 8 ${hy + 10} Z" fill="${OUT ? INK : '#8a3434'}" stroke="${OUT ? INK : '#8a3434'}" stroke-width="1.5" stroke-linejoin="round"/>${D(`<path d="M-4 ${hy + 15.5} Q0 ${hy + 18} 4 ${hy + 15.5} Q0 ${hy + 13} -4 ${hy + 15.5}" fill="#e87a7a"/>`)}`
    : `<path d="M-6 ${hy + 11} Q0 ${hy + 17} 6 ${hy + 11} Q0 ${hy + 13} -6 ${hy + 11} Z" fill="${OUT ? INK : '#9a3b3b'}" stroke="${OUT ? INK : '#9a3b3b'}" stroke-width="1.6" stroke-linejoin="round"/>`;
  const brows = mouth === 'sad' ? `M-13 ${hy - 9} Q-9 ${hy - 7} -5 ${hy - 6} M5 ${hy - 6} Q9 ${hy - 7} 13 ${hy - 9}` : `M-13 ${hy - 8} Q-9 ${hy - 10} -5 ${hy - 8} M5 ${hy - 8} Q9 ${hy - 10} 13 ${hy - 8}`;
  const face = `
    <ellipse cx="-25" cy="${hy + 3}" rx="5" ry="6.5" ${F(mix(skin, -.06))}/><ellipse cx="25" cy="${hy + 3}" rx="5" ry="6.5" ${F(mix(skin, -.06))}/>
    <ellipse cx="0" cy="${hy}" rx="25" ry="24" ${F(skin)}/>
    ${D(`<path d="M8 ${hy - 22} C30 ${hy - 14} 28 ${hy + 18} 4 ${hy + 24} C18 ${hy + 12} 20 ${hy - 6} 8 ${hy - 22} Z" fill="${mix(skin, -.1)}" opacity=".45"/>`)}
    ${beard ? `<path d="M-23 ${hy + 2} C-22 ${hy + 30} 22 ${hy + 30} 23 ${hy + 2} C20 ${hy + 12} 12 ${hy + 14} 6 ${hy + 11} Q0 ${hy + 9} -6 ${hy + 11} C-12 ${hy + 14} -20 ${hy + 12} -23 ${hy + 2} Z" ${F(o.beardColor || hair)}/>` : ''}
    <path d="${fringe}" ${F(style === 'veil' ? hair : hair)}/>
    ${style === 'veil' ? `<path d="M-30 ${hy - 4} C-32 ${hy - 36} 32 ${hy - 36} 30 ${hy - 4} C24 ${hy - 26} -24 ${hy - 26} -30 ${hy - 4} Z" ${F(o.veil || '#4e8fd6')}/>` : ''}
    ${D(`<path d="M-12 ${hy - 24} Q2 ${hy - 30} 14 ${hy - 24}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="3" stroke-linecap="round"/>`)}
    ${eye(-9)}${eye(9)}
    ${D(`<path d="${brows}" fill="none" stroke="${mix(hair === HAIR.gray ? '#8a7f75' : hair, -.2)}" stroke-width="1.9" stroke-linecap="round"/>`)}
    ${D(`<ellipse cx="-15" cy="${hy + 9}" rx="4.5" ry="3" fill="#ff8a8a" opacity=".45"/><ellipse cx="15" cy="${hy + 9}" rx="4.5" ry="3" fill="#ff8a8a" opacity=".45"/>`)}
    ${M}`;
  const halo = J && !OUT && !PIC && !o.noGlow ? `<circle cx="0" cy="${hy}" r="50" ${RG('#fff4c7', .95, 0)}/>` : '';
  const wings = o.wings ? `<path d="M-14 ${top + 10} C-60 ${top - 30} -78 ${top + 10} -70 ${top + 40} C-56 ${top + 30} -40 ${top + 40} -14 ${top + 30} Z" ${F('#ffffff')}/><path d="M14 ${top + 10} C60 ${top - 30} 78 ${top + 10} 70 ${top + 40} C56 ${top + 30} 40 ${top + 40} 14 ${top + 30} Z" ${F('#ffffff')}/>${D(`<path d="M-24 ${top + 22} C-44 ${top + 14} -56 ${top + 16} -62 ${top + 28} M24 ${top + 22} C44 ${top + 14} 56 ${top + 16} 62 ${top + 28}" stroke="#d9e4f2" stroke-width="3" fill="none" stroke-linecap="round"/>`)}` : '';
  const ring = o.wings ? `<ellipse cx="0" cy="${hy - 34}" rx="15" ry="4.5" fill="none" stroke="${OUT ? INK : '#ffd54a'}" stroke-width="3.5"/>` : '';
  const feet = kneel ? '' : `<ellipse cx="-11" cy="-2" rx="9" ry="4.5" ${F('#8a5a3a')}/><ellipse cx="11" cy="-2" rx="9" ry="4.5" ${F('#8a5a3a')}/>`;
  const front = ['hold', 'pray', 'give', 'hug', 'face'].includes(pose);
  const arms = sleeve(H[0][0], H[0][1], -1) + sleeve(H[1][0], H[1][1], 1);
  return `<g transform="translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})">
    ${o.noShadow ? '' : shadow(0, 0, 34)}${halo}${wings}
    ${backHair}${feet}
    <clipPath id="${cid}"><path d="${robeD}"/></clipPath>
    <path d="${robeD}" ${F(robe)}/>
    ${D(`<g clip-path="url(#${cid})"><path d="M10 ${top} C26 ${top + 30} 30 -30 44 0 L44 ${top} Z" fill="${mix(robe, -.13)}" opacity=".7"/><path d="M-6 ${top + 30} C-8 -40 -10 -20 -12 0" fill="none" stroke="${mix(robe, -.1)}" stroke-width="2"/></g>`)}
    ${sash ? `<g clip-path="url(#${cid})"><path d="M10 ${top - 2} L22 ${top + 4} L-20 0 L-34 -4 Z" ${F(sash)}/></g>` : ''}
    ${o.belt ? `<g clip-path="url(#${cid})"><rect x="-44" y="${-44 * bh}" width="88" height="6" ${F(o.belt)}/></g>` : ''}
    ${D(`<path d="M-10 ${top - 1} Q0 ${top + 7} 10 ${top - 1}" fill="none" stroke="${mix(robe, -.2)}" stroke-width="2" stroke-linecap="round"/>`)}
    ${front ? '' : arms}
    ${o.carry || ''}
    ${face}${ring}
    ${front ? arms : ''}
    ${o.inFront || ''}
  </g>`;
}
const kid = (x, y, s, robe, o = {}) => person(x, y, s, { child: true, robe, ...o });

// ------------------------------------------------------------------ nature & things
const sky = (a, b) => OUT ? `<rect width="800" height="520" fill="#fff"/>` : `<rect width="800" height="520" ${LG(a, b)}/>`;
function sun(x, y, r = 44, c = '#ffd34d') {
  return GL(`<circle cx="${x}" cy="${y}" r="${r * 2.6}" ${RG('#fff6cf', .9, 0)}/>`) + `<circle cx="${x}" cy="${y}" r="${r}" ${F(c)}/>` + D(`<circle cx="${x}" cy="${y}" r="${r * .72}" fill="#ffe27a"/>`);
}
function moon(x, y, r = 30) {
  return D(`<circle cx="${x}" cy="${y}" r="${r * 2.4}" ${RG('#fffbe6', .5, 0)}/>`) + `<path d="M${x + r * .3} ${y - r} A${r} ${r} 0 1 0 ${x + r * .3} ${y + r} A${r * .78} ${r * .78} 0 1 1 ${x + r * .3} ${y - r} Z" ${F('#fff3c2')}/>`;
}
const cloud = (x, y, s = 1, c = '#ffffff') => G(x, y, s, `<path d="M-70 20 C-90 20 -92 -6 -68 -8 C-66 -36 -30 -44 -14 -22 C-4 -48 40 -46 44 -14 C70 -18 84 20 60 20 Z" ${F(c)}/>${D(`<path d="M-70 20 L60 20 C70 20 76 14 74 8 L-82 8 C-84 14 -78 20 -70 20 Z" fill="${mix(c, -.06)}"/>`)}`);
function hills(cfg = {}) {
  const far = cfg.far || '#bfe6b6', mid = cfg.mid || '#8fd486', near = cfg.near || '#6cc46a', y = cfg.y || 300;
  return `<path d="M0 ${y} C120 ${y - 60} 230 ${y - 50} 330 ${y - 10} C430 ${y - 70} 600 ${y - 76} 800 ${y - 20} L800 520 L0 520 Z" ${F(far)}/>
    <path d="M0 ${y + 60} C160 ${y + 10} 300 ${y + 20} 420 ${y + 56} C540 ${y + 20} 690 ${y + 18} 800 ${y + 48} L800 520 L0 520 Z" ${F(mid)}/>
    <path d="M0 ${y + 130} C200 ${y + 96} 420 ${y + 104} 800 ${y + 122} L800 520 L0 520 Z" ${F(near)}/>`;
}
const tuft = (x, y, c = '#4fa957') => D(`<path d="M${x - 9} ${y} Q${x - 8} ${y - 14} ${x - 3} ${y - 18} Q${x - 4} ${y - 8} ${x} ${y} Q${x + 2} ${y - 16} ${x + 8} ${y - 20} Q${x + 5} ${y - 8} ${x + 9} ${y} Z" fill="${c}"/>`);
function flower(x, y, c = '#ff7aa2', s = 1) {
  const pet = [0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-7" rx="5" ry="7" transform="rotate(${a})" ${F(c)}/>`).join('');
  return G(x, y, s, `<path d="M0 26 Q-2 12 0 0" stroke="${OUT ? INK : '#4fa957'}" stroke-width="3" fill="none"/>${D('<ellipse cx="-6" cy="18" rx="6" ry="3" transform="rotate(-30 -6 18)" fill="#5bb765"/>')}${pet}<circle r="4.5" ${F('#ffd34d')}/>`);
}
function tree(x, y, s = 1, fruit = true) {
  return G(x, y, s, `${shadow(0, 0, 40)}
    <path d="M-10 0 C-7 -30 -9 -60 -5 -80 L5 -80 C9 -60 7 -30 10 0 Z" ${F('#9b6236')}/>
    <circle cx="-30" cy="-100" r="36" ${F('#4fb466')}/><circle cx="30" cy="-104" r="38" ${F('#4fb466')}/><circle cx="0" cy="-134" r="42" ${F('#5cc272')}/>
    ${D(`<circle cx="26" cy="-92" r="30" fill="#3f9e57" opacity=".55"/><circle cx="-14" cy="-148" r="14" fill="#fff" opacity=".14"/>`)}
    ${fruit ? `<circle cx="-24" cy="-104" r="6" ${F('#ff6464')}/><circle cx="20" cy="-128" r="6" ${F('#ff6464')}/><circle cx="36" cy="-96" r="6" ${F('#ff6464')}/>` : ''}`);
}
function palm(x, y, s = 1) {
  return G(x, y, s, `${shadow(0, 0, 30)}<path d="M-6 0 C-4 -50 4 -100 14 -150 L22 -148 C14 -100 8 -50 8 0 Z" ${F('#b07a48')}/>
    ${[[-70, -140, -20], [70, -150, 30], [-50, -176, -60], [56, -180, 50], [0, -190, 0]].map(([dx, dy, r]) => `<path d="M18 -150 Q${18 + dx * .5} ${dy - 30} ${18 + dx} ${dy + 6} Q${18 + dx * .4} ${dy - 6} 18 -150 Z" ${F('#5cbf6a')}/>`).join('')}`);
}
const bush = (x, y, s = 1, c = '#5cc272') => G(x, y, s, `<circle cx="-22" cy="-16" r="22" ${F(c)}/><circle cx="20" cy="-18" r="24" ${F(c)}/><circle cx="0" cy="-30" r="26" ${F(mix(c, .08))}/>${D(`<path d="M-44 -4 L44 -4 L40 0 L-40 0 Z" fill="${mix(c, -.2)}" opacity=".4"/>`)}`);
const rock = (x, y, s = 1, c = '#b9b0a6') => G(x, y, s, `<path d="M-40 0 C-44 -24 -20 -40 4 -36 C30 -34 46 -18 40 0 Z" ${F(c)}/>${D(`<path d="M8 -34 C30 -30 44 -16 40 0 L12 0 C20 -12 18 -24 8 -34 Z" fill="${mix(c, -.12)}"/>`)}`);
function water(y, c1 = '#5cc0f2', c2 = '#2f8fd6', amp = 10) {
  const wave = (yy, a) => `M0 ${yy} ${Array.from({ length: 10 }, (_, i) => `Q${i * 80 + 40} ${yy - a} ${i * 80 + 80} ${yy}`).join(' ')} L800 520 L0 520 Z`;
  return `<path d="${wave(y, amp)}" ${F(c1)}/>${D(`<path d="${wave(y + 34, amp * .8)}" fill="${mix(c1, -.08)}"/><path d="${wave(y + 80, amp * .7)}" fill="${c2}" opacity=".5"/>`)}
    ${D(Array.from({ length: 7 }, (_, i) => `<path d="M${40 + i * 110} ${y + 22 + (i % 3) * 22} q14 -6 28 0" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round"/>`).join(''))}`;
}
function stormSea(y) {
  const wave = (yy, a, ph) => `M-40 ${yy} ${Array.from({ length: 9 }, (_, i) => `C${i * 110 - 40 + 30} ${yy - a} ${i * 110 - 40 + 70} ${yy - a} ${i * 110 + 70 - 40 + ph} ${yy + 4}`).join(' ')} L840 520 L-40 520 Z`;
  return `<path d="${wave(y, 46, 0)}" ${F('#2f7fc4')}/>${D(`<path d="${wave(y, 46, 0)}" fill="none" stroke="#bfe6ff" stroke-width="5" stroke-opacity=".6"/>`)}`;
}
const stormFront = y => `<path d="M-40 ${y} ${Array.from({ length: 9 }, (_, i) => `C${i * 110 - 10} ${y - 40} ${i * 110 + 30} ${y - 40} ${i * 110 + 70} ${y + 4}`).join(' ')} L840 520 L-40 520 Z" ${F('#3d95dc')}/>${D(`<path d="M-40 ${y} ${Array.from({ length: 9 }, (_, i) => `C${i * 110 - 10} ${y - 40} ${i * 110 + 30} ${y - 40} ${i * 110 + 70} ${y + 4}`).join(' ')}" fill="none" stroke="#e3f4ff" stroke-width="6" stroke-opacity=".7"/>`)}`;
function boat(x, y, s = 1, rot = 0, sail = true) {
  s *= K;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    ${sail ? `<rect x="-4" y="-200" width="8" height="200" rx="3" ${F('#7a4a2a')}/><path d="M8 -192 C70 -160 90 -96 80 -54 L8 -54 Z" ${F('#fffaf0')}/>${D('<path d="M8 -192 C40 -150 50 -100 44 -54 L8 -54 Z" fill="#efe4cf"/>')}` : ''}
    <path d="M-150 -40 Q0 -26 150 -40 L118 14 Q0 28 -118 14 Z" ${F('#c27a43')}/>
    ${D('<path d="M-140 -24 Q0 -10 140 -24 L134 -14 Q0 0 -134 -14 Z" fill="#a86434"/><path d="M-150 -40 Q0 -26 150 -40 L146 -32 Q0 -18 -146 -32 Z" fill="#e0a06a"/>')}
  </g>`;
}
function sheep(x, y, s = 1, flip = false, c = '#ffffff') {
  s *= K;
  return G(x, y, s, `${shadow(0, 2, 40)}
    <rect x="-24" y="-20" width="9" height="22" rx="4.5" ${F('#4a3a35')}/><rect x="12" y="-20" width="9" height="22" rx="4.5" ${F('#4a3a35')}/>
    <circle cx="-22" cy="-34" r="20" ${F(c)}/><circle cx="2" cy="-42" r="24" ${F(c)}/><circle cx="24" cy="-32" r="18" ${F(c)}/><circle cx="-4" cy="-24" r="20" ${F(c)}/>
    ${D(`<circle cx="-4" cy="-24" r="20" fill="#e9e4f2" opacity=".5"/><circle cx="-8" cy="-52" r="7" fill="#fff"/>`)}
    <ellipse cx="38" cy="-44" rx="14" ry="17" ${F('#4a3a35')}/>
    <ellipse cx="26" cy="-52" rx="9" ry="4.5" transform="rotate(-20 26 -52)" ${F('#4a3a35')}/>
    <circle cx="36" cy="-60" r="9" ${F(c)}/>
    ${D('<circle cx="34" cy="-44" r="2.4" fill="#fff"/><circle cx="44" cy="-44" r="2.4" fill="#fff"/><circle cx="34.5" cy="-44" r="1.3" fill="#1b1414"/><circle cx="44.5" cy="-44" r="1.3" fill="#1b1414"/><ellipse cx="40" cy="-34" rx="5" ry="2.5" fill="#e88f9a" opacity=".6"/>')}`, flip);
}
function donkey(x, y, s = 1, flip = false) {
  s *= K;
  const c = '#a89b91';
  return G(x, y, s, `${shadow(0, 2, 60)}
    ${[-38, -20, 22, 40].map(lx => `<rect x="${lx - 5}" y="-46" width="11" height="46" rx="5" ${F(mix(c, -.12))}/>`).join('')}
    <path d="M-62 -60 C-62 -92 40 -98 56 -70 C62 -50 44 -38 0 -38 C-44 -38 -62 -44 -62 -60 Z" ${F(c)}/>
    <path d="M42 -80 C48 -110 70 -124 86 -114 C98 -104 96 -84 80 -78 Z" ${F(c)}/>
    <ellipse cx="90" cy="-96" rx="13" ry="10" ${F('#d9cfc6')}/>
    <path d="M64 -116 L60 -150 Q72 -138 74 -118 Z" ${F(c)}/><path d="M74 -114 L78 -146 Q86 -132 82 -112 Z" ${F(mix(c, -.08))}/>
    ${D('<circle cx="78" cy="-104" r="2.6" fill="#1b1414"/><path d="M-62 -62 q-14 10 -10 32" stroke="#7d7068" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M50 -110 Q30 -80 40 -66" stroke="#6b5e55" stroke-width="6" fill="none" stroke-linecap="round"/>')}`, flip);
}
function cow(x, y, s = 1, flip = false) {
  s *= K;
  return G(x, y, s, `${shadow(0, 2, 56)}
    ${[-36, -18, 20, 36].map(lx => `<rect x="${lx - 5}" y="-40" width="11" height="40" rx="5" ${F('#e8e0d6')}/>`).join('')}
    <path d="M-56 -50 C-58 -82 40 -86 52 -60 C58 -42 40 -32 0 -32 C-40 -32 -56 -36 -56 -50 Z" ${F('#fbf7f1')}/>
    ${D('<path d="M-30 -72 C-10 -78 0 -60 -16 -50 C-30 -46 -40 -60 -30 -72 Z" fill="#8a6a55"/><path d="M14 -52 C26 -60 40 -54 34 -42 C24 -36 12 -42 14 -52 Z" fill="#8a6a55"/>')}
    <ellipse cx="66" cy="-70" rx="22" ry="20" ${F('#fbf7f1')}/><ellipse cx="74" cy="-58" rx="16" ry="11" ${F('#f4b8b8')}/>
    <path d="M50 -86 L42 -100 L56 -92 Z" ${F('#e7d6b5')}/><path d="M80 -88 L90 -100 L86 -86 Z" ${F('#e7d6b5')}/>
    ${D('<circle cx="60" cy="-74" r="2.6" fill="#1b1414"/><circle cx="76" cy="-74" r="2.6" fill="#1b1414"/>')}`, flip);
}
function rabbit(x, y, s = 1, flip = false) {
  s *= K;
  return G(x, y, s, `${shadow(0, 1, 20)}<ellipse cx="0" cy="-16" rx="20" ry="16" ${F('#f2ece4')}/><circle cx="16" cy="-30" r="12" ${F('#f2ece4')}/>
    <ellipse cx="12" cy="-52" rx="4.5" ry="14" ${F('#f2ece4')}/><ellipse cx="21" cy="-50" rx="4.5" ry="14" transform="rotate(14 21 -50)" ${F('#f2ece4')}/>
    <circle cx="-20" cy="-18" r="6" ${F('#fff')}/>${D('<circle cx="20" cy="-32" r="2" fill="#1b1414"/><circle cx="27" cy="-28" r="1.8" fill="#f08a9a"/>')}`, flip);
}
function bird(x, y, s = 1, c = '#ff9a3c', flip = false) {
  return G(x, y, s, `<ellipse cx="0" cy="0" rx="14" ry="10" ${F(c)}/><circle cx="10" cy="-8" r="7" ${F(c)}/><path d="M16 -8 L24 -6 L16 -4 Z" ${F('#ffcf3d')}/><path d="M-4 -4 C-14 -20 -24 -14 -20 -2 Z" ${F(mix(c, -.15))}/>${D('<circle cx="12" cy="-10" r="1.6" fill="#1b1414"/>')}`, flip);
}
const birdsV = (x, y) => D(`<path d="M${x} ${y} q8 -9 16 0 q8 -9 16 0 M${x + 44} ${y - 18} q6 -7 12 0 q6 -7 12 0" stroke="#3b3550" stroke-width="3" fill="none" stroke-linecap="round"/>`);
function fishJump(x, y, s = 1, c = '#ffa94d', rot = -30) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-22 0 C-10 -16 14 -16 22 0 C14 16 -10 16 -22 0 Z" ${F(c)}/><path d="M20 0 L34 -12 L32 0 L34 12 Z" ${F(mix(c, -.1))}/>${D('<circle cx="-12" cy="-3" r="2.6" fill="#1b1414"/><path d="M-2 -8 Q2 0 -2 8" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/>')}</g>`;
}
function star(x, y, r = 22, glow = true) {
  let d = ''; for (let i = 0; i < 10; i++) { const a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * .46 : r; d += (i ? 'L' : 'M') + (x + rr * Math.cos(a)).toFixed(1) + ' ' + (y + rr * Math.sin(a)).toFixed(1); }
  return (glow ? GL(`<circle cx="${x}" cy="${y}" r="${r * 3.2}" ${RG('#fff4b8', .8, 0)}/>`) : '') + `<path d="${d}Z" ${F('#ffd34d')} stroke-linejoin="round"/>`;
}
const twinkle = (x, y, s = 1, c = '#fff8d6') => D(`<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10 Z" fill="${c}"/>`);
function heart(x, y, s = 1, c = '#ff5c7a') {
  return G(x, y, s, `<path d="M0 22 C-44 -6 -28 -46 0 -24 C28 -46 44 -6 0 22 Z" ${F(c)}/>${D(`<path d="M0 22 C30 2 34 -22 22 -32 C34 -14 20 6 0 22 Z" fill="${mix(c, -.12)}"/><ellipse cx="-14" cy="-20" rx="6" ry="4" transform="rotate(-35 -14 -20)" fill="#fff" opacity=".6"/>`)}`);
}
function stable(x, y, s = 1) {
  return G(x, y, s, `<rect x="-190" y="-170" width="380" height="170" ${F('#c98a52')}/>
    ${D([-140, -90, -40, 10, 60, 110, 160].map(px => `<rect x="${px - 2}" y="-170" width="4" height="170" fill="#a96d3c" opacity=".5"/>`).join(''))}
    <rect x="-130" y="-140" width="260" height="140" ${F('#7a4a2a')}/>
    <path d="M-230 -160 L0 -280 L230 -160 Z" ${F('#e6b85c')}/>${D('<path d="M-230 -160 L0 -280 L0 -262 L-200 -160 Z" fill="#f2cd7a"/><path d="M-230 -160 L230 -160 L222 -150 L-222 -150 Z" fill="#b8883a"/>')}
    <rect x="-200" y="-160" width="16" height="160" ${F('#9b6236')}/><rect x="184" y="-160" width="16" height="160" ${F('#9b6236')}/>`);
}
function manger(x, y, s = 1, baby = true) {
  s *= K;
  return G(x, y, s, `${shadow(0, 2, 70)}<path d="M-58 0 L-70 -50 M58 0 L70 -50" stroke="${OUT ? INK : '#7a4a2a'}" stroke-width="10" stroke-linecap="round"/>
    <path d="M-78 -56 Q0 -36 78 -56 L64 -8 Q0 6 -64 -8 Z" ${F('#b8783e')}/>
    <path d="M-76 -56 C-60 -76 60 -76 76 -56 Q0 -40 -76 -56 Z" ${F('#ffd772')}/>${D('<path d="M-60 -62 l-8 -10 M-30 -66 l-4 -12 M20 -66 l6 -12 M54 -62 l10 -10" stroke="#e8b648" stroke-width="3" stroke-linecap="round"/>')}
    ${baby ? `<ellipse cx="6" cy="-72" rx="40" ry="20" ${F('#fdfbf6')}/>${D('<path d="M-20 -72 Q6 -60 34 -74" stroke="#e8e1d2" stroke-width="3" fill="none"/>')}<circle cx="-26" cy="-80" r="17" ${F(SKIN.b)}/><path d="M-42 -84 C-40 -100 -14 -100 -10 -86 C-18 -92 -32 -92 -42 -84 Z" ${F(HAIR.brown)}/>${D('<path d="M-33 -80 q3 3 6 0 M-23 -80 q3 3 6 0" stroke="#2a1d18" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="-36" cy="-74" rx="3.5" ry="2.5" fill="#ff8a8a" opacity=".5"/>')}${GL(`<circle cx="-26" cy="-80" r="40" ${RG('#fff4c7', .6, 0)}/>`)}` : ''}`);
}
function tomb(x, y, s = 1, open = true) {
  return G(x, y, s, `${shadow(0, 2, 170)}<path d="M-180 0 C-190 -110 -110 -190 0 -190 C110 -190 190 -110 180 0 Z" ${F('#c3b8aa')}/>
    ${D('<path d="M40 -186 C130 -168 190 -100 180 0 L110 0 C130 -80 100 -150 40 -186 Z" fill="#aea293"/>')}
    <path d="M-56 0 C-58 -60 -30 -92 0 -92 C30 -92 58 -60 56 0 Z" fill="${OUT ? '#fff' : (open ? '#4a3d36' : '#6c5f55')}" ${OUT ? `stroke="${INK}" stroke-width="3"` : ''}/>
    ${open ? D(`<path d="M-56 0 C-58 -60 -30 -92 0 -92 C30 -92 58 -60 56 0 Z" ${RG('#fff1b8', .75, 0)}/>`) : ''}
    <circle cx="${open ? 130 : 0}" cy="-62" r="62" ${F('#a99d8f')}/>${D(`<path d="M${open ? 100 : -30} -104 Q${open ? 130 : 0} -120 ${open ? 164 : 34} -100" stroke="#fff" stroke-opacity=".3" stroke-width="6" fill="none" stroke-linecap="round"/>`)}`);
}
function basket(x, y, s = 1, food = true) {
  s *= K;
  return G(x, y, s, `${food ? `<ellipse cx="-16" cy="-30" rx="20" ry="13" ${F('#f0b45a')}/><ellipse cx="14" cy="-34" rx="20" ry="13" ${F('#f6c46c')}/>${fishJump(0, -46, .7, '#7fc8f2', -8)}` : ''}
    <path d="M-44 -30 L44 -30 L34 6 Q0 14 -34 6 Z" ${F('#c98a4a')}/>${D('<path d="M-40 -18 Q0 -10 40 -18 M-37 -6 Q0 2 37 -6" stroke="#a36a32" stroke-width="3" fill="none"/><path d="M-44 -30 L44 -30 L42 -24 L-42 -24 Z" fill="#dca464"/>')}`);
}
function table(x, y, s = 1) {
  return G(x, y, s, `${shadow(0, 2, 250)}<rect x="-230" y="-80" width="20" height="80" rx="6" ${F('#7a4a2a')}/><rect x="210" y="-80" width="20" height="80" rx="6" ${F('#7a4a2a')}/>
    <rect x="-260" y="-100" width="520" height="28" rx="12" ${F('#b8783e')}/>${D('<rect x="-260" y="-80" width="520" height="8" rx="4" fill="#94592b"/>')}
    <ellipse cx="-120" cy="-108" rx="30" ry="12" ${F('#f0b45a')}/><ellipse cx="-80" cy="-110" rx="24" ry="10" ${F('#f6c46c')}/>
    <path d="M30 -150 L58 -150 L52 -100 L36 -100 Z" ${F('#c25b9b')}/><path d="M120 -146 L144 -146 L140 -100 L124 -100 Z" ${F('#5aa7dc')}/>
    <ellipse cx="200" cy="-110" rx="34" ry="10" ${F('#e8e0d0')}/><circle cx="190" cy="-118" r="9" ${F('#9b59b6')}/><circle cx="206" cy="-120" r="9" ${F('#a96ac4')}/>`);
}
const bowl = (x, y, s = 1) => G(x, y, s, `${shadow(0, 2, 40)}<path d="M-40 -26 H40 C38 -4 22 4 0 4 C-22 4 -38 -4 -40 -26 Z" ${F('#7fc4ef')}/><ellipse cx="0" cy="-26" rx="40" ry="9" ${F('#d8f0ff')}/>${D('<path d="M-24 -10 Q0 -2 24 -10" stroke="#fff" stroke-opacity=".5" stroke-width="3" fill="none"/>')}`);
function house(x, y, s = 1, c = '#f3e2c4', door = '#8a5a3a') {
  return G(x, y, s, `<rect x="-60" y="-110" width="120" height="110" ${F(c)}/>${D(`<rect x="20" y="-110" width="40" height="110" fill="${mix(c, -.08)}"/>`)}
    <rect x="-66" y="-120" width="132" height="14" rx="4" ${F(mix(c, -.12))}/>
    <path d="M-16 0 V-44 Q0 -60 16 -44 V0 Z" ${F(door)}/><rect x="-46" y="-86" width="22" height="22" rx="4" ${F('#7fb8d8')}/><rect x="26" y="-86" width="22" height="22" rx="4" ${F('#7fb8d8')}/>`);
}
const town = (y, c = '#e9d3b0') => `<g opacity="${OUT ? 1 : .9}">${[[90, .5], [170, .62], [260, .46], [560, .55], [650, .66], [740, .48]].map(([hx, hs]) => house(hx, y, hs, c, '#9c6b45')).join('')}</g>`;
const road = (c = '#f0d9a8') => `<path d="M300 520 C340 440 380 380 420 330 L460 330 C470 380 520 440 600 520 Z" ${F(c)}/>`;
function crossHill() {
  const cross = (x, y, s) => G(x, y, s, `<rect x="-6" y="-120" width="12" height="120" rx="3" ${F('#8a5a3a')}/><rect x="-40" y="-96" width="80" height="12" rx="3" ${F('#8a5a3a')}/>`);
  return `<path d="M0 360 C180 280 330 230 420 230 C520 230 640 290 800 340 L800 520 L0 520 Z" ${F('#9a8bb0')}/>${cross(320, 262, .8)}${cross(420, 236, 1.05)}${cross(520, 262, .8)}`;
}
const rainbow = (x, y, r) => D(['#ff8a8a', '#ffc46b', '#ffe57a', '#9be08a', '#7cc8f2', '#b49cf0'].map((c, i) => `<path d="M${x - r + i * 12} ${y} A${r - i * 12} ${r - i * 12} 0 0 1 ${x + r - i * 12} ${y}" stroke="${c}" stroke-width="12" fill="none" opacity=".75"/>`).join(''));
const rays = (x, y, c = '#fff6c9') => D(`<g opacity=".55">${Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return `<path d="M${x} ${y} L${x + 900 * Math.cos(a - .07)} ${y + 900 * Math.sin(a - .07)} L${x + 900 * Math.cos(a + .07)} ${y + 900 * Math.sin(a + .07)} Z" fill="${c}"/>`; }).join('')}</g>`);
const coins = (x, y, s = 1) => G(x, y, s, [[-14, 0], [6, 0], [-4, -10], [16, -8], [-20, -12]].map(([cx, cy]) => `<ellipse cx="${cx}" cy="${cy}" rx="12" ry="5" ${F('#ffcf3d')}/>`).join('') + `<rect x="-24" y="-30" width="18" height="16" rx="3" ${F('#ffcf3d')}/>`);
function net(x, y, s = 1, full = true) {
  return G(x, y, s, `<path d="M-90 -20 Q0 60 90 -20 L70 30 Q0 80 -70 30 Z" ${F('#d8c7a0')}/>
    ${D('<path d="M-80 0 Q0 60 80 0 M-74 18 Q0 72 74 18 M-50 -6 L-30 50 M-10 0 L-2 60 M30 -4 L28 56 M60 -10 L50 40" stroke="#b9a57a" stroke-width="2" fill="none"/>')}
    ${full ? [[-40, 20, '#7fc8f2'], [0, 34, '#ffa94d'], [36, 20, '#7fc8f2'], [-16, 44, '#ffd34d'], [22, 46, '#ff8a8a']].map(([fx, fy, c]) => fishJump(fx, fy, .7, c, 0)).join('') : ''}`);
}
const lightning = (x, y) => D(`<path d="M${x} ${y} l-26 54 h22 l-18 46 l52 -64 h-24 l18 -36 z" fill="#ffe14d"/>`);
const rain = () => D(Array.from({ length: 40 }, (_, i) => `<path d="M${(i * 53) % 800} ${(i * 37) % 300} l-8 18" stroke="#cfe6ff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>`).join(''));
const WINDOWS = () => [150, 600].map(x => `<path d="M${x} 250 V150 Q${x + 50} 96 ${x + 100} 150 V250 Z" ${F('#2e3f7a')}/>` + D(`<circle cx="${x + 66}" cy="160" r="12" fill="#fff3c2"/><path d="M${x} 250 V150 Q${x + 50} 96 ${x + 100} 150 V250 Z" fill="none" stroke="#c79a6a" stroke-width="8"/>`)).join('');
const bandageMan = (x, y, s = 1, o = {}) => person(x, y, s, { kneel: true, robe: '#cbd5e3', beard: true, hair: HAIR.dark, skin: SKIN.c, mouth: 'sad', pose: 'hold', inFront: band(), ...o });
const band = () => `<rect x="-27" y="-100" width="54" height="9" rx="4.5" transform="rotate(-8 0 -96)" ${F('#ffffff')}/>`;

// ------------------------------------------------------------------ cast
const MARY = { robe: '#ffffff', hairStyle: 'veil', veil: '#4e8fd6', skin: SKIN.b, hair: HAIR.dark };
const JOSEPH = { robe: '#9b7a5c', beard: true, hair: HAIR.dark, skin: SKIN.c, belt: '#6b4a30' };
const PETER = { robe: '#e9a23b', beard: true, hair: HAIR.dark, skin: SKIN.c, belt: '#8a5a3a' };
const JOHN = { robe: '#5bbf8a', hair: HAIR.light, skin: SKIN.b };
const ANDREW = { robe: '#d96f6f', beard: true, hair: HAIR.brown, skin: SKIN.b, belt: '#7a4a2a' };
const SHEP = { robe: '#8d7a6a', beard: true, hair: HAIR.brown, skin: SKIN.c, belt: '#5c4636' };
const J = { jesus: true };
const meadow = (extra = {}) => sky(extra.top || '#9fdcff', extra.bot || '#e6f7ff') + sun(extra.sx ?? 640, extra.sy ?? 150, 44) + cloud(150, 90, 1) + cloud(420, 60, .7) + hills(extra);
const tufts = (list) => list.map(([x, y]) => tuft(x, y)).join('');
const flowers = list => list.map(([x, y, c]) => flower(x, y, c)).join('');
const FL = [[60, 470, '#ff7aa2'], [140, 500, '#ffd34d'], [700, 480, '#b17cff'], [760, 505, '#ff7aa2'], [250, 505, '#ff9a3c']];
const crowd = (y, n, s, x0 = 40, x1 = 760, seed = 0) => Array.from({ length: n }, (_, i) => {
  const robes = ['#ff8fa3', '#7fc8f2', '#ffd36b', '#8fd48a', '#b49cf0', '#ffa96b', '#6fd1c7'], skins = Object.values(SKIN), hairs = Object.values(HAIR);
  const k = i + seed; const ch = k % 3 === 0;
  return person(x0 + (x1 - x0) * (i + .5) / n, y + (k % 2) * 10, s * (ch ? 1 : .96), { child: ch, robe: robes[k % robes.length], skin: skins[k % 4], hair: hairs[k % 5], hairStyle: ['short', 'long', 'curly', 'bun', 'pony'][k % 5], pose: k % 4 === 1 ? 'wave' : 'stand', eyes: k % 3 === 2 ? 'happy' : 'open', beard: !ch && k % 4 === 0 });
}).join('');

// ------------------------------------------------------------------ the 52 pictures
const SCENES = {
  creation: [
    () => sky('#ffb27a', '#fff1c9') + sun(400, 330, 70) + rays(400, 330) + cloud(140, 175, .9, '#fff3e3') + cloud(640, 145, 1.1, '#fff3e3') + birdsV(220, 200) + birdsV(520, 170) + `<path d="M0 360 C200 320 600 320 800 360 L800 520 L0 520 Z" ${F('#7fcf7a')}/>` + `<path d="M0 430 C260 400 540 410 800 430 L800 520 L0 520 Z" ${F('#5fbf63')}/>`,
    () => meadow() + water(400, '#7fd0f5', '#47a6e0', 6) + tree(110, 400, 1.1) + tree(690, 390, .9) + palm(600, 400, .8) + fishJump(330, 420, 1.2, '#ffa94d') + fishJump(470, 440, 1, '#ff7aa2', 20) + rabbit(200, 390, 1.1) + bird(300, 210, 1.2, '#ff9a3c') + bird(520, 180, 1, '#5aa7ff', true) + sheep(720, 500, .9, true) + flowers([[40, 500, '#ff7aa2'], [160, 506, '#ffd34d'], [600, 506, '#b17cff']]),
    () => meadow({ sx: 120 }) + tree(90, 380, 1) + tree(720, 380, 1.1) + bush(600, 400, 1) + bush(200, 405, .8) + person(330, 470, 1.15, { robe: '#d8b58a', hair: HAIR.brown, beard: true, skin: SKIN.c, pose: 'wave' }) + person(460, 470, 1.15, { robe: '#e8c9a0', hairStyle: 'long', hair: HAIR.dark, skin: SKIN.b, pose: 'open', eyes: 'happy' }) + rabbit(580, 480, 1) + sheep(200, 490, .9) + bird(560, 230, 1.1, '#ff6b9a') + flowers(FL),
    () => meadow({ sx: 680 }) + rainbow(400, 330, 300) + tree(100, 380, .9) + palm(700, 400, .8) + sheep(200, 480, 1) + sheep(290, 470, .8, true) + rabbit(520, 470, 1) + cow(620, 480, .9, true) + bird(400, 200, 1.2) + flowers(FL) + tufts([[380, 500], [460, 490]]),
  ],
  christmas: [
    () => sky('#ff9e7a', '#ffd9a8') + sun(640, 260, 56, '#ffb44d') + town(316, '#e2c39a') + `<path d="M0 306 C200 298 600 300 800 306 L800 520 L0 520 Z" ${F('#d8b47a')}/>` + road('#f2dcac') + donkey(380, 470, 1.1) + person(360, 400, .95, { ...MARY, kneel: true, noShadow: true, pose: 'hold' }) + person(520, 480, 1.1, { ...JOSEPH, pose: 'point', flip: true }) + palm(120, 420, .9) + palm(720, 420, .8),
    () => sky('#1e2a6e', '#4a3f9a') + star(640, 115, 20) + twinkle(120, 100) + twinkle(260, 150, .7) + twinkle(520, 80, .8) + twinkle(740, 160, .6) + `<path d="M0 460 Q400 420 800 460 L800 520 L0 520 Z" ${F('#5a4632')}/>` + stable(400, 470, 1.05) + cow(250, 470, .8) + sheep(560, 470, .75, true) + donkey(600, 470, .7, true) + person(330, 470, 1.05, { ...MARY, pose: 'pray' }) + person(470, 470, 1.05, { ...JOSEPH, pose: 'hold' }),
    () => sky('#1e2a6e', '#4a3f9a') + star(400, 105, 26) + D(`<path d="M400 60 L320 430 L480 430 Z" fill="#fff4b8" opacity=".18"/>`) + twinkle(150, 120) + twinkle(650, 140) + twinkle(260, 150, .6) + `<path d="M0 460 Q400 420 800 460 L800 520 L0 520 Z" ${F('#5a4632')}/>` + stable(400, 470, 1.05) + manger(400, 470, 1.1) + person(250, 470, 1.05, { ...MARY, pose: 'reach' }) + person(560, 470, 1.05, { ...JOSEPH, pose: 'stand', eyes: 'happy' }) + sheep(130, 480, .7) + sheep(680, 480, .7, true),
    () => sky('#17205a', '#3b3388') + twinkle(80, 90) + twinkle(700, 100) + twinkle(400, 70, .8) + twinkle(560, 160, .6) + person(250, 300, 1, { robe: '#fffaf0', hairStyle: 'long', hair: '#e8b04a', skin: SKIN.a, wings: true, pose: 'up', eyes: 'happy', mouth: 'big', noShadow: true }) + person(550, 285, 1, { robe: '#fffaf0', hairStyle: 'curly', hair: HAIR.dark, skin: SKIN.c, wings: true, pose: 'open', eyes: 'happy', mouth: 'big', noShadow: true }) + `<path d="M0 400 C200 360 600 370 800 400 L800 520 L0 520 Z" ${F('#3f6b4a')}/>` + person(190, 480, 1, { ...SHEP, pose: 'up', mouth: 'o' }) + person(620, 485, .9, { robe: '#c98a52', hair: HAIR.light, skin: SKIN.a, child: true, pose: 'wave', mouth: 'o' }) + sheep(340, 470, .9) + sheep(450, 490, .8, true) + sheep(720, 500, .7),
  ],
  friends: [
    () => sky('#ffcf9e', '#d9ecff') + sun(140, 240, 40, '#ffc35a') + water(270) + boat(420, 380, 1) + person(360, 345, .82, { ...PETER, eyes: 'closed', mouth: 'sad', noShadow: true }) + person(470, 345, .82, { ...ANDREW, mouth: 'sad', noShadow: true, pose: 'hold' }) + net(560, 300, .5, false),
    () => sky('#bfe6ff', '#eef8ff') + sun(680, 145, 40) + water(260) + boat(470, 360, .9) + person(420, 330, .75, { ...PETER, pose: 'up', mouth: 'big', noShadow: true }) + person(520, 330, .75, { ...ANDREW, pose: 'reach', mouth: 'o', noShadow: true }) + net(640, 330, .8) + `<path d="M0 420 C70 400 170 410 240 440 L240 520 L0 520 Z" ${F('#f4dca6')}/>` + person(110, 500, 1.1, { ...J, pose: 'point' }),
    () => sky('#a8dcff', '#eaf7ff') + sun(120, 145, 40) + water(250) + boat(640, 330, .7, 0, true) + `<path d="M0 360 C240 330 520 340 800 380 L800 520 L0 520 Z" ${F('#f4dca6')}/>` + D(`<path d="M0 360 C240 330 520 340 800 380 L800 392 C520 352 240 342 0 372 Z" fill="#fff" opacity=".5"/>`) + person(300, 480, 1.15, { ...J, pose: 'open' }) + person(470, 485, 1.05, { ...PETER, pose: 'stand', mouth: 'o' }) + person(570, 490, 1, { ...ANDREW, pose: 'pray', eyes: 'happy' }) + rock(700, 500, .8),
    () => sky('#9fdcff', '#eaf8ff') + sun(680, 145) + water(250, '#7fd0f5', '#47a6e0', 6) + `<path d="M0 330 C240 310 520 320 800 340 L800 520 L0 520 Z" ${F('#f4dca6')}/>` + palm(90, 420, .9) + person(220, 470, 1.05, { ...PETER, pose: 'wave', eyes: 'happy' }) + person(340, 480, 1.12, { ...J, pose: 'stand' }) + person(460, 475, 1.02, { ...JOHN, pose: 'stand', eyes: 'happy' }) + person(570, 480, 1, { ...ANDREW, pose: 'wave', flip: true }) + rock(720, 500, .7),
  ],
  storm: [
    () => sky('#9fdcff', '#eaf8ff') + sun(660, 145) + cloud(170, 145) + water(300) + boat(400, 400, 1) + person(330, 360, .82, { ...J, noShadow: true, eyes: 'happy' }) + person(440, 360, .82, { ...PETER, noShadow: true, pose: 'wave' }) + person(520, 360, .7, { ...JOHN, noShadow: true }) + birdsV(560, 200),
    () => sky('#3a4170', '#6a6f99') + cloud(160, 135, 1.6, '#8890b6') + cloud(560, 115, 1.9, '#7b84ac') + lightning(660, 120) + rain() + stormSea(300) + boat(400, 380, 1, -12) + person(330, 350, .78, { ...PETER, noShadow: true, pose: 'up', mouth: 'o' }) + person(450, 330, .78, { ...JOHN, noShadow: true, pose: 'face', mouth: 'o' }) + stormFront(420),
    () => sky('#4a5285', '#9aa3c9') + cloud(140, 125, 1.4, '#9aa2c4') + D(`<circle cx="430" cy="120" r="200" ${RG('#fff6c9', .55, 0)}/>`) + stormSea(320) + boat(400, 400, 1, -4) + person(330, 360, .8, { ...PETER, noShadow: true, mouth: 'o' }) + person(440, 350, .92, { ...J, noShadow: true, pose: 'stop' }) + person(530, 362, .74, { ...JOHN, noShadow: true, pose: 'pray', mouth: 'o' }) + stormFront(450),
    () => sky('#a8e0ff', '#f0faff') + rainbow(400, 330, 320) + sun(120, 145, 40) + water(300) + boat(400, 400, 1) + person(320, 360, .8, { ...PETER, noShadow: true, pose: 'up', mouth: 'big' }) + person(420, 352, .88, { ...J, noShadow: true, pose: 'open' }) + person(520, 362, .76, { ...JOHN, noShadow: true, eyes: 'happy', pose: 'wave' }) + birdsV(600, 190),
  ],
  feeding: [
    () => meadow({ far: '#cde9a0', mid: '#a6d76f', near: '#8cc85a' }) + crowd(360, 7, .55, 60, 740) + crowd(450, 5, .7, 80, 300, 3) + person(560, 470, 1.15, { ...J, pose: 'open' }) + crowd(500, 2, .8, 650, 790, 5),
    () => meadow({ far: '#cde9a0', mid: '#a6d76f', near: '#8cc85a', sx: 120 }) + crowd(330, 9, .45, 40, 760, 2) + kid(400, 480, 1.4, '#7fc8f2', { hair: HAIR.dark, skin: SKIN.b, pose: 'hold', eyes: 'happy', inFront: basket(0, -26, .8) }) + flowers(FL),
    () => meadow({ far: '#cde9a0', mid: '#a6d76f', near: '#8cc85a' }) + crowd(330, 8, .45, 40, 760, 4) + person(480, 480, 1.2, { ...J, pose: 'reach', eyes: 'happy' }) + kid(320, 485, 1.25, '#7fc8f2', { hair: HAIR.dark, skin: SKIN.b, pose: 'give', mouth: 'big', inFront: basket(44, -34, .65) }) + flowers([[70, 490, '#ff7aa2'], [720, 495, '#ffd34d']]),
    () => meadow({ far: '#cde9a0', mid: '#a6d76f', near: '#8cc85a' }) + crowd(350, 7, .55, 60, 740, 1) + crowd(450, 6, .72, 40, 760, 6) + basket(140, 500, .9) + basket(400, 505, .9) + basket(660, 500, .9),
  ],
  children: [
    () => sky('#bfe6ff', '#f2fbff') + sun(680, 145) + town(316) + `<path d="M0 304 C200 296 600 298 800 304 L800 520 L0 520 Z" ${F('#a6d98a')}/>` + road() + person(200, 470, 1, { robe: '#b49cf0', hairStyle: 'veil', veil: '#ff9fb5', skin: SKIN.b, pose: 'hold' }) + kid(290, 480, 1, '#ffd36b', { hair: HAIR.dark, pose: 'wave', mouth: 'big' }) + person(560, 470, 1, { robe: '#6fb3e0', beard: true, skin: SKIN.c, hair: HAIR.dark }) + kid(480, 485, 1, '#ff8fa3', { hairStyle: 'pony', hair: HAIR.light, skin: SKIN.a, pose: 'up', eyes: 'happy' }) + kid(650, 490, .9, '#8fd48a', { hairStyle: 'curly', hair: HAIR.black, skin: SKIN.d, pose: 'wave' }),
    () => meadow() + person(250, 470, 1.05, { ...PETER, pose: 'stop', flip: true, mouth: 'sad' }) + person(370, 470, 1, { ...ANDREW, pose: 'stop', flip: true }) + kid(560, 485, 1, '#ff8fa3', { hairStyle: 'pony', hair: HAIR.light, skin: SKIN.a, mouth: 'sad' }) + kid(660, 490, .95, '#ffd36b', { hair: HAIR.dark, mouth: 'sad' }) + tree(90, 390, .8),
    () => meadow({ sx: 120 }) + tree(700, 380, .9) + person(400, 470, 1.15, { ...J, kneel: true, pose: 'open' }) + kid(230, 480, 1.05, '#ff8fa3', { hairStyle: 'pony', hair: HAIR.light, skin: SKIN.a, pose: 'reach', mouth: 'big', flip: true }) + kid(570, 482, 1, '#ffd36b', { hair: HAIR.dark, skin: SKIN.b, pose: 'up', mouth: 'big' }) + kid(660, 490, .95, '#8fd48a', { hairStyle: 'curly', hair: HAIR.black, skin: SKIN.d, pose: 'wave', eyes: 'happy' }) + flowers(FL),
    () => meadow() + heart(400, 150, 1.4) + heart(260, 190, .7, '#ff9a3c') + heart(560, 180, .8, '#b17cff') + kid(290, 488, 1.05, '#ff8fa3', { hairStyle: 'pony', hair: HAIR.light, skin: SKIN.a, eyes: 'happy', mouth: 'big' }) + person(400, 475, 1.15, { ...J, pose: 'hug', eyes: 'happy' }) + kid(510, 488, 1.05, '#8fd48a', { hairStyle: 'curly', hair: HAIR.black, skin: SKIN.d, eyes: 'happy', mouth: 'big' }) + kid(610, 495, .9, '#ffd36b', { hair: HAIR.dark, pose: 'up', eyes: 'happy' }) + flowers(FL),
  ],
  samaritan: [
    () => sky('#ffd7a3', '#fff3dd') + sun(140, 155, 46) + hills({ far: '#ead8a8', mid: '#dcc28a', near: '#cfb071' }) + road('#f5e3bd') + rock(640, 470, 1.1) + rock(160, 460, .7) + bandageMan(470, 470, 1.15),
    () => sky('#ffd7a3', '#fff3dd') + sun(140, 155, 46) + hills({ far: '#ead8a8', mid: '#dcc28a', near: '#cfb071' }) + road('#f5e3bd') + bandageMan(250, 480, .9) + person(560, 450, .9, { robe: '#7a5ab8', beard: true, hair: HAIR.gray, skin: SKIN.a, flip: true, sash: '#f2c94c' }) + person(680, 460, .9, { robe: '#3d7fb8', beard: true, hair: HAIR.dark, skin: SKIN.b, flip: true, belt: '#f2c94c' }),
    () => sky('#ffd7a3', '#fff3dd') + sun(660, 155, 46) + hills({ far: '#ead8a8', mid: '#dcc28a', near: '#cfb071' }) + road('#f5e3bd') + donkey(640, 470, .95, true) + bandageMan(330, 480, 1.05) + person(450, 480, 1.1, { robe: '#3fae7a', beard: true, hair: HAIR.dark, skin: SKIN.c, kneel: true, pose: 'reach', belt: '#8a5a3a' }),
    () => sky('#ffc89a', '#fff0d8') + sun(140, 175, 46) + hills({ far: '#ead8a8', mid: '#dcc28a', near: '#cfb071', y: 360 }) + house(630, 440, 1.3, '#f3e2c4') + donkey(380, 490, 1.1) + bandageMan(370, 420, .85, { noShadow: true, eyes: 'happy', mouth: 'smile', pose: 'stand' }) + person(220, 490, 1.05, { robe: '#3fae7a', beard: true, hair: HAIR.dark, skin: SKIN.c, belt: '#8a5a3a', pose: 'point' }),
  ],
  blind: [
    () => sky('#c8e8ff', '#f5fbff') + sun(660, 145) + town(316, '#ecd7b4') + `<path d="M0 304 C200 296 600 298 800 304 L800 520 L0 520 Z" ${F('#e6cf9c')}/>` + road('#f5e3bd') + rock(560, 480, .9) + person(400, 480, 1.15, { robe: '#a58ad6', beard: true, hair: HAIR.dark, skin: SKIN.c, kneel: true, eyes: 'closed', mouth: 'sad', pose: 'hold', inFront: `<rect x="34" y="-160" width="7" height="160" rx="3" ${F('#8a5a3a')}/>` }),
    () => sky('#c8e8ff', '#f5fbff') + sun(660, 145) + town(316, '#ecd7b4') + `<path d="M0 304 C200 296 600 298 800 304 L800 520 L0 520 Z" ${F('#e6cf9c')}/>` + crowd(400, 4, .7, 420, 780, 2) + person(520, 470, 1, { ...J }) + person(220, 490, 1.1, { robe: '#a58ad6', beard: true, hair: HAIR.dark, skin: SKIN.c, kneel: true, eyes: 'closed', mouth: 'o', pose: 'up' }),
    () => sky('#c8e8ff', '#f5fbff') + sun(120, 145) + town(316, '#ecd7b4') + `<path d="M0 304 C200 296 600 298 800 304 L800 520 L0 520 Z" ${F('#e6cf9c')}/>` + person(330, 490, 1.15, { robe: '#a58ad6', beard: true, hair: HAIR.dark, skin: SKIN.c, kneel: true, eyes: 'closed', pose: 'pray' }) + person(480, 490, 1.15, { ...J, kneel: true, pose: 'reach', flip: true }),
    () => sky('#fff2b0', '#fffbe8') + rays(400, 200) + sun(400, 200, 50) + hills({ far: '#d9efa0', mid: '#b9e070', near: '#9fd05a' }) + person(400, 470, 1.25, { robe: '#a58ad6', beard: true, hair: HAIR.dark, skin: SKIN.c, pose: 'up', mouth: 'big' }) + twinkle(270, 260, 1.4) + twinkle(540, 240, 1.2) + twinkle(310, 340, .8) + twinkle(500, 330, 1) + bird(200, 200, 1.2, '#ff6b9a') + bird(620, 210, 1.1, '#5aa7ff', true) + flowers(FL),
  ],
  zacchaeus: [
    () => sky('#c8e8ff', '#f5fbff') + town(316, '#ecd7b4') + `<path d="M0 304 C200 296 600 298 800 304 L800 520 L0 520 Z" ${F('#e6cf9c')}/>` + G(400, 470, 1, `<rect x="-120" y="-70" width="240" height="18" rx="7" ${F('#b8783e')}/><rect x="-100" y="-56" width="14" height="56" ${F('#7a4a2a')}/><rect x="86" y="-56" width="14" height="56" ${F('#7a4a2a')}/>`) + coins(380, 395, 1.1) + coins(440, 398, .8) + person(400, 470, .9, { robe: '#3f6fd1', sash: '#ffcf3d', beard: true, hairStyle: 'bald', hair: HAIR.dark, skin: SKIN.b, child: true, pose: 'hold', eyes: 'happy' }) + person(200, 480, 1.15, { robe: '#d96f6f', beard: true, hair: HAIR.dark, mouth: 'sad' }) + person(610, 480, 1.15, { robe: '#5bbf8a', hairStyle: 'veil', veil: '#ffa96b', mouth: 'sad' }),
    () => meadow({ sx: 680 }) + tree(400, 480, 2.2, false) + person(430, 330, .8, { robe: '#3f6fd1', sash: '#ffcf3d', beard: true, hairStyle: 'bald', hair: HAIR.dark, skin: SKIN.b, child: true, pose: 'up', mouth: 'o', noShadow: true }) + crowd(490, 4, .9, 80, 260, 1) + crowd(495, 3, .9, 560, 780, 5),
    () => meadow({ sx: 120 }) + tree(500, 480, 2.2, false) + person(530, 325, .8, { robe: '#3f6fd1', sash: '#ffcf3d', beard: true, hairStyle: 'bald', hair: HAIR.dark, skin: SKIN.b, child: true, pose: 'open', mouth: 'big', noShadow: true }) + person(250, 480, 1.2, { ...J, pose: 'wave' }) + crowd(500, 2, .85, 60, 140, 3) + flowers([[700, 500, '#ff7aa2']]),
    () => sky('#c8e8ff', '#f5fbff') + sun(660, 145) + house(400, 330, 1.5, '#f6e7cc') + `<path d="M0 330 C200 316 600 320 800 330 L800 520 L0 520 Z" ${F('#e6cf9c')}/>` + person(400, 470, .95, { robe: '#3f6fd1', sash: '#ffcf3d', beard: true, hairStyle: 'bald', hair: HAIR.dark, skin: SKIN.b, child: true, pose: 'open', mouth: 'big' }) + coins(320, 400, .9) + person(220, 480, 1.1, { robe: '#d96f6f', beard: true, hair: HAIR.dark, pose: 'up', eyes: 'happy' }) + person(590, 480, 1.1, { robe: '#5bbf8a', hairStyle: 'veil', veil: '#ffa96b', pose: 'reach', eyes: 'happy', flip: true }) + heart(400, 150, .9),
  ],
  sheep: [
    () => meadow({ far: '#c4ecb4', mid: '#94dc8a', near: '#74cc72' }) + person(170, 470, 1.15, { ...SHEP, pose: 'hold', inFront: `<rect x="20" y="-210" width="8" height="210" rx="4" ${F('#8a5a3a')}/><path d="M24 -210 C24 -240 60 -240 58 -214" stroke="${OUT ? INK : '#8a5a3a'}" stroke-width="8" fill="none" stroke-linecap="round"/>` }) + sheep(330, 430, .8) + sheep(430, 450, .9, true) + sheep(540, 420, .7) + sheep(620, 470, .95) + sheep(720, 440, .75, true) + sheep(480, 500, .8) + tufts([[300, 500], [600, 505]]),
    () => sky('#c9d9e8', '#eef3f8') + cloud(200, 145, 1.2, '#f4f6fa') + cloud(600, 125, 1, '#f4f6fa') + hills({ far: '#b9cfa8', mid: '#9cbd86', near: '#86ad70' }) + rock(250, 470, 1.4) + rock(560, 460, 1.2, '#a89f95') + bush(680, 470, 1, '#5aa76a') + bush(120, 480, .9, '#5aa76a') + sheep(400, 480, 1.2) + D('<path d="M466 370 q8 -10 2 -20" stroke="#6b6f80" stroke-width="3" fill="none" stroke-linecap="round"/>'),
    () => meadow({ far: '#c4ecb4', mid: '#94dc8a', near: '#74cc72' }) + rock(560, 470, 1.4) + bush(680, 470, 1) + sheep(470, 490, .8, true) + person(260, 480, 1.15, { ...SHEP, kneel: true, pose: 'reach', mouth: 'big' }),
    () => meadow({ far: '#c4ecb4', mid: '#94dc8a', near: '#74cc72', sx: 120 }) + heart(400, 155, 1) + heart(300, 160, .6, '#ff9a3c') + heart(500, 150, .7, '#b17cff') + person(400, 480, 1.25, { ...SHEP, pose: 'up', eyes: 'happy', mouth: 'big', carry: sheep(-30, -72, .7) }) + sheep(160, 480, .8) + sheep(640, 480, .8, true) + person(250, 490, .8, { robe: '#ffa96b', child: true, pose: 'up', eyes: 'happy' }) + person(560, 490, .8, { robe: '#7fc8f2', child: true, hairStyle: 'pony', pose: 'wave', eyes: 'happy', flip: true }),
  ],
  love: [
    () => sky('#ffe0c2', '#fff3e6') + `<rect x="0" y="300" width="800" height="220" ${F('#e9c9a4')}/>` + WINDOWS() + person(180, 400, .85, { ...PETER, noShadow: true }) + person(300, 395, .85, { ...JOHN, noShadow: true, eyes: 'happy' }) + person(420, 390, .95, { ...J, noShadow: true, pose: 'open', noGlow: true }) + person(540, 395, .85, { ...ANDREW, noShadow: true }) + person(650, 400, .85, { robe: '#b49cf0', beard: true, hair: HAIR.light, skin: SKIN.a, noShadow: true }) + table(400, 480, 1),
    () => sky('#ffe0c2', '#fff3e6') + `<rect x="0" y="300" width="800" height="220" ${F('#e9c9a4')}/>` + person(520, 470, 1.15, { ...PETER, kneel: true, mouth: 'o', pose: 'hold' }) + person(330, 480, 1.15, { ...J, kneel: true, pose: 'reach', flip: true, noGlow: true }) + bowl(420, 490, 1.1),
    () => sky('#ffe0c2', '#fff3e6') + `<rect x="0" y="300" width="800" height="220" ${F('#e9c9a4')}/>` + heart(400, 155, .8) + person(180, 410, .85, { ...PETER, noShadow: true, eyes: 'happy' }) + person(300, 405, .85, { ...JOHN, noShadow: true }) + person(420, 400, .95, { ...J, noShadow: true, pose: 'point', noGlow: true }) + person(560, 405, .85, { ...ANDREW, noShadow: true, eyes: 'happy' }) + table(400, 490, 1),
    () => meadow() + heart(200, 150, .8) + heart(400, 155, 1.1, '#ff9a3c') + heart(600, 150, .8, '#b17cff') + kid(180, 480, 1.1, '#ff8fa3', { hairStyle: 'pony', hair: HAIR.light, skin: SKIN.a, pose: 'give', eyes: 'happy', inFront: G(40, -80, .6, `<rect x="-24" y="-24" width="48" height="48" rx="8" ${F('#5aa7ff')}/><rect x="-24" y="-6" width="48" height="10" ${F('#ffd34d')}/>`) }) + kid(320, 485, 1.1, '#8fd48a', { hairStyle: 'curly', hair: HAIR.black, skin: SKIN.d, pose: 'reach', mouth: 'big', flip: true }) + kid(500, 485, 1.1, '#ffd36b', { hair: HAIR.dark, pose: 'hug', eyes: 'happy' }) + kid(610, 488, 1.05, '#b49cf0', { hairStyle: 'bun', hair: HAIR.brown, skin: SKIN.b, pose: 'hug', eyes: 'happy', flip: true }) + flowers(FL),
  ],
  easter: [
    () => sky('#c9a0c9', '#ffd2b0') + sun(400, 300, 56, '#ffb47a') + crossHill() + D('<path d="M0 470 C200 450 600 450 800 470 L800 520 L0 520 Z" fill="#7d6f96"/>'),
    () => sky('#9a8bc4', '#ffd8bf') + `<path d="M0 360 C200 320 600 320 800 360 L800 520 L0 520 Z" ${F('#8f80ac')}/>` + D(`<circle cx="400" cy="230" r="220" ${RG('#fff1c2', .8, 0)}/>`) + rays(400, 230, '#fff4d6') + heart(400, 230, 2.6, '#ff6f8a') + twinkle(250, 180) + twinkle(560, 150) + twinkle(300, 330, .7) + twinkle(530, 320, .8),
    () => sky('#8a90c4', '#d9c9e8') + moon(640, 145) + `<path d="M0 380 C200 360 600 360 800 380 L800 520 L0 520 Z" ${F('#7fa880')}/>` + tomb(470, 440, 1, false) + person(160, 490, 1.05, { ...MARY, veil: '#7a6ab8', mouth: 'sad', eyes: 'closed', pose: 'pray' }) + person(270, 495, 1, { ...JOHN, mouth: 'sad', pose: 'hold' }) + bush(720, 440, .8, '#5a9a68'),
    () => sky('#ffd2a0', '#fff6e0') + sun(660, 165, 56) + rays(660, 110) + hills({ far: '#c9eeb0', mid: '#9be08a', near: '#7ad074', y: 330 }) + tomb(250, 430, .95, true) + person(540, 480, 1.25, { ...J, pose: 'open' }) + flowers([[420, 500, '#ff7aa2'], [680, 490, '#ffd34d'], [740, 505, '#b17cff'], [60, 500, '#ff9a3c'], [460, 470, '#b17cff']]) + bird(380, 200, 1.1, '#ffd34d') + twinkle(470, 260) + twinkle(620, 300, .8),
  ],
  always: [
    () => sky('#9fdcff', '#eaf8ff') + cloud(150, 135) + cloud(600, 115, .8) + `<path d="M0 520 L0 400 C150 300 260 230 400 220 C540 230 650 300 800 400 L800 520 Z" ${F('#8fd486')}/>` + D('<path d="M400 220 C540 230 650 300 800 400 L800 520 L560 520 C560 400 500 300 400 220 Z" fill="#7cc674"/>') + person(400, 330, 1.05, { ...J, pose: 'open' }) + person(270, 380, .95, { ...PETER, eyes: 'happy' }) + person(540, 380, .95, { ...JOHN, pose: 'wave' }) + person(180, 430, .9, { ...ANDREW }) + person(630, 430, .9, { robe: '#b49cf0', beard: true, hair: HAIR.light, skin: SKIN.a }),
    () => sky('#9fdcff', '#eaf8ff') + sun(120, 145) + town(330, '#e9d3b0') + `<path d="M0 520 L0 380 C200 340 600 340 800 380 L800 520 Z" ${F('#8fd486')}/>` + person(250, 480, 1.2, { ...J, pose: 'point' }) + person(420, 490, 1, { ...PETER, flip: true, eyes: 'happy' }) + person(530, 495, 1, { ...JOHN, flip: true, mouth: 'big' }) + person(640, 495, .95, { ...ANDREW, flip: true }),
    () => sky('#8fd0ff', '#fff6e0') + rays(400, 160, '#fffbe6') + cloud(400, 290, 1.8) + person(400, 290, 1.05, { ...J, pose: 'up', noShadow: true }) + cloud(270, 300, 1) + cloud(540, 295, 1.1) + `<path d="M0 420 C200 400 600 400 800 420 L800 520 L0 520 Z" ${F('#8fd486')}/>` + person(200, 500, .9, { ...PETER, mouth: 'o', pose: 'face' }) + person(330, 505, .9, { ...JOHN, mouth: 'o' }) + person(470, 505, .9, { ...MARY, mouth: 'o', pose: 'pray' }) + person(610, 500, .9, { ...ANDREW, mouth: 'o', pose: 'up' }),
    () => sky('#ffe6a8', '#fff8e6') + rays(400, 160) + sun(400, 160, 50) + hills({ far: '#d9efa0', mid: '#b9e070', near: '#9fd05a' }) + heart(250, 175, .7) + heart(560, 165, .8, '#b17cff') + person(400, 470, 1.25, { ...J, pose: 'open' }) + kid(240, 485, 1.05, '#ff8fa3', { hairStyle: 'pony', hair: HAIR.light, skin: SKIN.a, pose: 'up', eyes: 'happy' }) + kid(560, 485, 1.05, '#8fd48a', { hairStyle: 'curly', hair: HAIR.black, skin: SKIN.d, pose: 'wave', mouth: 'big' }) + kid(130, 495, .9, '#7fc8f2', { hair: HAIR.dark, eyes: 'happy' }) + kid(670, 495, .9, '#ffd36b', { hairStyle: 'bun', hair: HAIR.brown, eyes: 'happy', pose: 'up' }) + flowers(FL),
  ],
};

const DEFS = () => '';
function wrap(body, w, h, cls, vb = `0 0 ${w} ${h}`) {
  return `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice"><defs>${defs.join('')}</defs>${body}</svg>`;
}
export function scene(sid, n = 1, opts = {}) {
  if (typeof n === 'object') { opts = n; n = 1; }
  const outline = !!opts.outline;
  OUT = outline; P = `s${sid}${n}${outline ? 'o' : ''}x`; defs = []; uid = 0; K = 1.18; PIC = false;
  const list = SCENES[sid] || SCENES.creation;
  const body = list[Math.max(0, Math.min(list.length - 1, n - 1))]();
  K = 1;
  const svg = wrap(body, 800, 520, `kid-scene ${outline ? 'coloring' : ''}`, '60 80 680 442');
  OUT = false;
  return svg;
}
// Coloring uses page 4 for stories whose first picture is very dark or very busy.
const COLOR_PAGE = { christmas: 3, storm: 4, easter: 4, feeding: 2, creation: 2 };
const toData = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg width="880" height="572" '));
export const colorSrc = sid => toData(scene(sid, COLOR_PAGE[sid] || 1, { outline: true }));
export const realSrc = sid => toData(scene(sid, COLOR_PAGE[sid] || 1));
export const coloringThumb = sid => scene(sid, COLOR_PAGE[sid] || 1, { outline: true });

// ------------------------------------------------------------------ picture cards
const PICS = {
  star: () => star(100, 104, 70),
  baby: () => manger(110, 170, 1),
  boat: () => `<path d="M10 150 Q55 136 100 150 T190 150 Q190 186 100 190 Q10 186 10 150 Z" ${F('#7fd0f5')}/>` + boat(100, 158, .6),
  fish: () => fishJump(96, 100, 3, '#5aa7ff', 0),
  bread: () => G(100, 120, 1.6, `<path d="M-50 10 C-54 -34 54 -34 50 10 C40 22 -40 22 -50 10 Z" ${F('#f0b45a')}/>${D('<path d="M-26 -14 q6 -8 12 0 M-4 -18 q6 -8 12 0 M18 -14 q6 -8 12 0" stroke="#c98a3a" stroke-width="4" fill="none" stroke-linecap="round"/>')}`),
  sheep: () => sheep(84, 160, 1.75, false, '#f1ecf8'),
  heart: () => heart(100, 104, 2.6),
  tree: () => tree(100, 190, .78),
  sun: () => sun(100, 100, 52) + D('<path d="M84 104 q4 5 8 0 M108 104 q4 5 8 0" stroke="#b07a00" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M88 118 Q100 128 112 118" stroke="#b07a00" stroke-width="4" fill="none" stroke-linecap="round"/>'),
  dove: () => G(100, 104, 1.6, `<path d="M-50 10 C-30 -30 10 -20 20 -6 C34 -34 56 -36 62 -28 C50 -10 36 0 28 4 C20 30 -24 34 -50 10 Z" ${F('#eef3fb')}/><path d="M-20 4 C-6 -14 10 -10 18 0" stroke="${OUT ? INK : '#d4dcea'}" stroke-width="3" fill="none"/><path d="M60 -28 l14 3 l-14 6 z" ${F('#ff9a3c')}/>${D('<circle cx="48" cy="-24" r="3" fill="#1b1414"/>')}<path d="M-30 22 q-10 14 -2 24 M-20 26 q-2 14 8 22" stroke="${OUT ? INK : '#4fa957'}" stroke-width="4" fill="none" stroke-linecap="round"/>`),
  tomb: () => tomb(100, 170, .48, true),
  basket: () => basket(100, 150, 1.9),
  people: () => kid(66, 192, 1, '#ff8fa3', { hairStyle: 'pony', hair: HAIR.light, skin: SKIN.a, eyes: 'happy', noShadow: true }) + kid(134, 192, 1, '#7fc8f2', { hair: HAIR.dark, skin: SKIN.c, eyes: 'happy', noShadow: true }) + heart(100, 40, .7),
  jesus: () => person(100, 228, 1.3, { ...J, pose: 'open', noShadow: true }),
  house: () => house(100, 180, 1.2, '#f6e7cc', '#c27a43'),
  bandage: () => G(100, 100, 1, `<g transform="rotate(-30)"><rect x="-80" y="-26" width="160" height="52" rx="26" ${F('#ffd6b0')}/><rect x="-26" y="-26" width="52" height="52" ${F('#fff3e3')}/>${D('<circle cx="-10" cy="-8" r="3" fill="#e8b48a"/><circle cx="10" cy="8" r="3" fill="#e8b48a"/><circle cx="10" cy="-8" r="3" fill="#e8b48a"/><circle cx="-10" cy="8" r="3" fill="#e8b48a"/>')}</g>`),
};
export function pic(pid) {
  OUT = false; P = `p${pid}x`; defs = []; uid = 0; K = 1; PIC = true;
  const body = (PICS[pid] || PICS.heart)();
  PIC = false;
  return `<svg class="kid-pic" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${defs.join('')}</defs>${body}</svg>`;
}
export const PIC_IDS = Object.keys(PICS);
