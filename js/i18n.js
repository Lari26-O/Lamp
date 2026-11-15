// Interface language. English text lives in the code as the fallback:
// t('key', 'English text', { vars }). Other languages come from ./i18n/*.js.
import FR from './i18n/fr.js';
import PT from './i18n/pt.js';
import ES from './i18n/es.js';
import FR2 from './i18n/fr-more.js';
import PT2 from './i18n/pt-more.js';
import ES2 from './i18n/es-more.js';
import FR3 from './i18n/fr-kids.js';
import PT3 from './i18n/pt-kids.js';
import ES3 from './i18n/es-kids.js';
import { L10N } from './data/l10n.js';

export const LANGS = [
  { id: 'en', name: 'English', bcp: 'en-US' },
  { id: 'fr', name: 'Français', bcp: 'fr-FR' },
  { id: 'pt', name: 'Português', bcp: 'pt-BR' },
  { id: 'es', name: 'Español', bcp: 'es-ES' },
];
const DICTS = { fr: { ...FR, ...FR2, ...FR3 }, pt: { ...PT, ...PT2, ...PT3 }, es: { ...ES, ...ES2, ...ES3 } };

function detect() {
  try {
    const saved = JSON.parse(localStorage.getItem('lamp:settings') || '{}').lang;
    if (saved && LANGS.some(l => l.id === saved)) return saved;
  } catch {}
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return LANGS.some(l => l.id === nav) ? nav : 'en';
}

export let LANG = detect();
export function setLang(id) { LANG = id; document.documentElement.lang = id; }
document.documentElement.lang = LANG;
export const langName = id => LANGS.find(l => l.id === id)?.name || id;
export const bcp = () => LANGS.find(l => l.id === LANG)?.bcp || 'en-US';

export function t(key, en, vars) {
  let s = (LANG !== 'en' && DICTS[LANG]?.[key]) || en || key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
  return s;
}

// Plural helper: t pick between one/other.
export function tn(n, key, one, other, vars = {}) {
  return n === 1 ? t(key + '.one', one, { n, ...vars }) : t(key + '.other', other, { n, ...vars });
}

// Localized data text (places, events, people): returns field in current language.
export function tl(kind, id, field, fallback) {
  if (LANG === 'en') return fallback;
  return L10N[LANG]?.[kind]?.[id]?.[field] ?? fallback;
}

export const BOOK_NAMES = {
  fr: ['Genèse', 'Exode', 'Lévitique', 'Nombres', 'Deutéronome', 'Josué', 'Juges', 'Ruth', '1 Samuel', '2 Samuel', '1 Rois', '2 Rois', '1 Chroniques', '2 Chroniques', 'Esdras', 'Néhémie', 'Esther', 'Job', 'Psaumes', 'Proverbes', 'Ecclésiaste', 'Cantique des Cantiques', 'Ésaïe', 'Jérémie', 'Lamentations', 'Ézéchiel', 'Daniel', 'Osée', 'Joël', 'Amos', 'Abdias', 'Jonas', 'Michée', 'Nahum', 'Habacuc', 'Sophonie', 'Aggée', 'Zacharie', 'Malachie', 'Matthieu', 'Marc', 'Luc', 'Jean', 'Actes', 'Romains', '1 Corinthiens', '2 Corinthiens', 'Galates', 'Éphésiens', 'Philippiens', 'Colossiens', '1 Thessaloniciens', '2 Thessaloniciens', '1 Timothée', '2 Timothée', 'Tite', 'Philémon', 'Hébreux', 'Jacques', '1 Pierre', '2 Pierre', '1 Jean', '2 Jean', '3 Jean', 'Jude', 'Apocalypse'],
  pt: ['Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio', 'Josué', 'Juízes', 'Rute', '1 Samuel', '2 Samuel', '1 Reis', '2 Reis', '1 Crônicas', '2 Crônicas', 'Esdras', 'Neemias', 'Ester', 'Jó', 'Salmos', 'Provérbios', 'Eclesiastes', 'Cânticos', 'Isaías', 'Jeremias', 'Lamentações', 'Ezequiel', 'Daniel', 'Oseias', 'Joel', 'Amós', 'Obadias', 'Jonas', 'Miqueias', 'Naum', 'Habacuque', 'Sofonias', 'Ageu', 'Zacarias', 'Malaquias', 'Mateus', 'Marcos', 'Lucas', 'João', 'Atos', 'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios', 'Filipenses', 'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses', '1 Timóteo', '2 Timóteo', 'Tito', 'Filemom', 'Hebreus', 'Tiago', '1 Pedro', '2 Pedro', '1 João', '2 João', '3 João', 'Judas', 'Apocalipse'],
  es: ['Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio', 'Josué', 'Jueces', 'Rut', '1 Samuel', '2 Samuel', '1 Reyes', '2 Reyes', '1 Crónicas', '2 Crónicas', 'Esdras', 'Nehemías', 'Ester', 'Job', 'Salmos', 'Proverbios', 'Eclesiastés', 'Cantares', 'Isaías', 'Jeremías', 'Lamentaciones', 'Ezequiel', 'Daniel', 'Oseas', 'Joel', 'Amós', 'Abdías', 'Jonás', 'Miqueas', 'Nahúm', 'Habacuc', 'Sofonías', 'Hageo', 'Zacarías', 'Malaquías', 'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos', 'Romanos', '1 Corintios', '2 Corintios', 'Gálatas', 'Efesios', 'Filipenses', 'Colosenses', '1 Tesalonicenses', '2 Tesalonicenses', '1 Timoteo', '2 Timoteo', 'Tito', 'Filemón', 'Hebreos', 'Santiago', '1 Pedro', '2 Pedro', '1 Juan', '2 Juan', '3 Juan', 'Judas', 'Apocalipsis'],
};

export function fmtDate(ts) {
  try { return new Date(ts).toLocaleDateString(bcp(), { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return ''; }
}
