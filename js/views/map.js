import { $, $$, esc, icon } from '../util.js';
import { parseRef, refHash, localRef } from '../bible.js';
import { t, tl, LANG } from '../i18n.js';
import { evTitle } from '../learn-data.js';
import { PLACES, JOURNEYS } from '../data/places.js';
import { EVENTS } from '../data/timeline.js';
import { STOPS } from '../data/journey-stops.js';
import { localDate } from '../data/l10n.js';

let leafletReady;
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (!leafletReady) leafletReady = new Promise((res, rej) => {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'vendor/leaflet/leaflet.css'; document.head.appendChild(css);
    const s = document.createElement('script'); s.src = 'vendor/leaflet/leaflet.js';
    s.onload = () => res(window.L); s.onerror = () => { leafletReady = null; rej(new Error(t('map.libErr', 'Could not load the map'))); };
    document.head.appendChild(s);
  });
  return leafletReady;
}

const refLink = r => { const p = parseRef(r); return p ? `<a href="${refHash(p)}">${esc(localRef(r))}</a>` : esc(r); };
const pName = p => tl('place', p.id, 'name', p.name);
const pAbout = p => tl('place', p.id, 'about', p.about);
const jName = j => tl('journey', j.id, 'name', j.name);
const jNote = j => tl('journey', j.id, 'note', j.note);

function popupHtml(p) {
  const evs = EVENTS.filter(e => e.place === p.id);
  return `<b style="font-size:1.05em">${esc(pName(p))}</b>${p.uncertain ? ` <span>(${t('map.approx', 'approx.')})</span>` : ''}
    <p style="margin:6px 0">${esc(pAbout(p))}</p>
    <div><b>${t('map.read', 'Read')}:</b> ${p.refs.map(refLink).join(' · ')}</div>
    ${evs.length ? `<div style="margin-top:6px"><b>${t('nav.timeline', 'Timeline')}:</b> ${evs.map(e => `<a href="#/timeline/${e.id}">${esc(evTitle(e))}</a>`).join(' · ')}</div>` : ''}`;
}

export async function render(el, { parts }) {
  const focus = parts[0];
  el.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">${t('navg.explore', 'Explore')}</p><h1>${t('map.title', 'Bible maps')}</h1><p>${t('map.intro', 'Explore where the story happened. Tap a place to read its passages, or turn on a journey to trace the route.')}</p></div></div>
    <div class="map-wrap">
      <div><div id="map" role="application" aria-label="${t('map.title', 'Bible maps')}"></div>
      <section id="stops" class="card stops" hidden aria-live="polite"></section>
      <p class="muted small">© Esri · © OpenStreetMap · ${t('map.note', 'Ancient locations are approximate; places marked “approx.” are debated.')}</p></div>
      <div class="card place-list-wrap">
        <form id="whereF" class="where-form" role="search">
          <label for="whereQ"><b>${t('map.where', 'Where is…?')}</b></label>
          <div class="row"><input class="input grow" id="whereQ" placeholder="${t('map.whereEx', 'Type a place, e.g. Bethlehem or Nineveh')}" autocomplete="off"><button class="btn primary" type="submit">${icon('search')}<span class="sr-only">${t('map.find', 'Find')}</span></button></div>
          <p id="whereMsg" class="small muted" aria-live="polite"></p>
        </form>
        <h3>${t('map.journeys', 'Journeys')}</h3>
        <div class="stack" id="journeys">${JOURNEYS.map(j => `<label class="switch" style="padding:4px 0"><span><span style="display:inline-block;width:14px;height:4px;background:${j.color};vertical-align:middle;margin-right:6px;border-radius:2px"></span>${esc(jName(j))}</span><input type="checkbox" data-j="${j.id}"></label>`).join('')}</div>
        <div id="jinfo" class="small" style="margin:8px 0" aria-live="polite"></div>
        <h3 style="margin-top:14px">${t('quiz.places', 'Places')}</h3>
        <label class="sr-only" for="pf">${t('map.filter', 'Filter places')}</label>
        <input class="input" id="pf" placeholder="${t('map.filter', 'Filter places')}…" style="margin-bottom:8px">
        <div class="place-list" id="plist" role="list"></div>
      </div>
    </div>`;

  // Accessible list works even if the map fails to load.
  const plist = $('#plist', el);
  const drawList = (f = '') => {
    plist.innerHTML = PLACES.filter(p => pName(p).toLowerCase().includes(f.toLowerCase()))
      .sort((a, b) => pName(a).localeCompare(pName(b)))
      .map(p => `<button role="listitem" data-p="${p.id}" aria-current="${p.id === focus}">${esc(pName(p))}</button>`).join('');
  };
  drawList();
  $('#pf', el).addEventListener('input', e => drawList(e.target.value));

  let L;
  try { L = await loadLeaflet(); }
  catch (e) {
    $('#map', el).innerHTML = `<div class="empty">${esc(e.message)}. ${t('map.listWorks', 'The place list still works.')}</div>`;
    plist.addEventListener('click', ev => { const id = ev.target.closest('[data-p]')?.dataset.p; if (id) location.hash = '#/map/' + id; });
    if (focus) { const p = PLACES.find(x => x.id === focus); if (p) $('#jinfo', el).innerHTML = popupHtml(p); }
    return;
  }
  if (!document.body.contains(el)) return;

  const map = L.map($('#map', el), { scrollWheelZoom: true, worldCopyJump: true }).setView([33.5, 35.5], 6);
  // Esri World Street Map: free, no key, place names in English. If its tiles fail,
  // fall back to the standard OpenStreetMap tiles so the map always shows.
  const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors' }).addTo(map);
  let failed = 0, switched = false;
  esri.on('tileerror', () => { if (++failed < 4 || switched) return; switched = true; map.removeLayer(esri); L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map); });

  const markers = {};
  for (const p of PLACES) {
    const m = L.circleMarker([p.lat, p.lng], { radius: 7, color: '#fff', weight: 2, fillColor: p.uncertain ? '#8a6d3b' : '#9a4a1c', fillOpacity: 0.95 })
      .addTo(map).bindPopup(popupHtml(p), { maxWidth: 300 }).bindTooltip(pName(p), { direction: 'top', offset: [0, -6] });
    markers[p.id] = m;
  }
  const lines = {};
  $$('[data-j]', el).forEach(cb => cb.addEventListener('change', () => {
    const j = JOURNEYS.find(x => x.id === cb.dataset.j);
    if (cb.checked) {
      lines[j.id] = L.polyline(j.path, { color: j.color, weight: 4, opacity: 0.85, dashArray: j.id === 'exodus' ? '8 6' : null }).addTo(map);
      map.fitBounds(lines[j.id].getBounds(), { padding: [30, 30] });
      $('#jinfo', el).innerHTML = `<b>${esc(jName(j))}</b> — ${esc(jNote(j))} ${refLink(j.ref)}`;
      showStops(j);
    } else { lines[j.id]?.remove(); delete lines[j.id]; const open = JOURNEYS.find(x => lines[x.id]); if (open) showStops(open); else $('#stops', el).hidden = true; }
  }));
  // List of stops (place, when, passage) for the chosen journey, under the map.
  function showStops(j) {
    const box = $('#stops', el); const stops = STOPS[j.id];
    if (!stops) { box.hidden = true; return; }
    box.hidden = false; box.style.setProperty('--jc', j.color);
    box.innerHTML = `<h3>${esc(jName(j))}</h3><p class="small muted">${t('map.stopsHelp', 'Where they went, when, and where to read about it. Tap a place to see it on the map.')}</p>
      <ol class="stop-list">${stops.map(([pid, when, ref], i) => { const pl = PLACES.find(x => x.id === pid); return `<li><button class="stop-place" data-stop="${pid}"><span class="stop-n">${i + 1}</span><b>${esc(pl ? pName(pl) : pid)}</b></button><span class="stop-when">${esc(localDate(when, LANG))}</span>${refLink(ref)}</li>`; }).join('')}</ol>`;
    $$('[data-stop]', box).forEach(b => b.addEventListener('click', () => { const id = b.dataset.stop; const pl = PLACES.find(x => x.id === id); if (pl) { map.setView([pl.lat, pl.lng], 8); markers[id]?.openPopup(); $('#map', el).scrollIntoView({ behavior: 'smooth', block: 'center' }); } }));
  }
  plist.addEventListener('click', ev => {
    const id = ev.target.closest('[data-p]')?.dataset.p; if (!id) return;
    history.replaceState(null, '', '#/map/' + id);
    $$('[data-p]', plist).forEach(b => b.setAttribute('aria-current', b.dataset.p === id));
    const p = PLACES.find(x => x.id === id);
    map.setView([p.lat, p.lng], 9); markers[id].openPopup();
  });
  if (focus && markers[focus]) {
    const p = PLACES.find(x => x.id === focus);
    map.setView([p.lat, p.lng], 9); markers[focus].openPopup();
  }
  // "Where is…?" search: Bible places first, then any place in the world.
  let found = null;
  const norm = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  $('#whereF', el).addEventListener('submit', async ev => {
    ev.preventDefault();
    const q = norm($('#whereQ', el).value); const msg = $('#whereMsg', el);
    if (!q) return;
    found?.remove(); found = null;
    const hit = PLACES.find(p => norm(pName(p)) === q || norm(p.name) === q || (p.names || []).some(n => norm(n) === q))
      || PLACES.find(p => norm(pName(p)).includes(q) || norm(p.name).includes(q) || (p.names || []).some(n => norm(n).includes(q)));
    if (hit) {
      map.setView([hit.lat, hit.lng], 9); markers[hit.id].openPopup();
      msg.textContent = t('map.foundBible', '{place} is a Bible place. Here it is on the map!', { place: pName(hit) });
      return;
    }
    msg.textContent = t('map.searching', 'Searching the world map…');
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=${LANG}&q=${encodeURIComponent($('#whereQ', el).value)}`);
      const [g] = await r.json();
      if (!g) { msg.textContent = t('map.notFound', 'Sorry, that place was not found. Try another spelling.'); return; }
      found = L.marker([+g.lat, +g.lon]).addTo(map).bindPopup(`<b>${esc(g.display_name)}</b><p class="small">${t('map.modern', 'This is where it is today.')}</p>`).openPopup();
      map.setView([+g.lat, +g.lon], 8);
      msg.textContent = t('map.foundWorld', 'Found it! This place is not in Lamp’s Bible places, but here is where it is.');
    } catch { msg.textContent = t('map.offline', 'You need to be online to search the world map.'); }
  });

  setTimeout(() => map.invalidateSize(), 100);
  return () => { found?.remove(); map.remove(); };
}
