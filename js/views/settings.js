import { $, $$, esc, icon, toast, speech } from '../util.js';
import { getSettings, setSettings, exportAll, importAll, clearAll, today, getProgress } from '../store.js';
import { BOOKS, allVersions, getVersion, getBook, currentVersion, yvKey, refreshYV, POPULAR, LOCAL_VERSIONS, bookName } from '../bible.js';
import { getAI, setAI, BROWSER_MODELS, PRESETS, hasWebGPU } from '../ai.js';
import { runAI } from '../components.js';
import { t, LANG, LANGS, setLang, langName } from '../i18n.js';
import { sendTo, sisterSummary } from '../connect.js';
import { YOUVERSION_APP_KEY } from '../config.js';
import { install, canInstall, isStandalone, getReminder, enableReminder, disableReminder, downloadCalendar, pushSupported, notificationsSupported } from '../pwa.js';

export function render(el, { parts }) {
  const s = getSettings();
  const ai = getAI();
  const root = document.documentElement;
  const vid = currentVersion();
  const sect = (id, ic, title, body) => `<section class="card settings-sec" id="${id}" aria-labelledby="h-${id}"><h2 id="h-${id}" class="card-title">${icon(ic)} ${title}</h2>${body}</section>`;
  const versionsFor = lang => allVersions().filter(v => v.lang === lang);

  el.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">${t('nav.settings', 'Settings')}</p><h1>${t('set.title', 'Settings & accessibility')}</h1><p>${t('set.intro', 'Make Lamp comfortable for your eyes, ears and device. Everything is saved on this device.')}</p></div></div>
    <nav class="chips set-nav">${[['lang', t('set.language', 'Language')], ['bible', t('set.versions', 'Bible versions')], ['look', t('set.display', 'Display')], ['tts', t('set.tts', 'Read aloud')], ['remind', t('set.remind', 'Reminders & app')], ['ai', t('set.aiShort', 'AI helper')], ['apps', t('set.apps', 'Connected apps')], ['data', t('set.data', 'Your data')]].map(([id, l]) => `<a class="chip" href="#/settings/${id}">${esc(l)}</a>`).join('')}</nav>

    ${sect('lang', 'globe', t('set.language', 'Language'), `
      <p class="muted small">${t('set.langHint', 'Changes the app’s language and the default Bible.')}</p>
      <div class="lang-grid">${LANGS.map(l => `<button class="lang-btn" data-lang="${l.id}" aria-pressed="${l.id === LANG}"><b>${l.name}</b><span>${l.id.toUpperCase()}</span></button>`).join('')}</div>`)}

    ${sect('bible', 'book', t('set.versions', 'Bible versions'), `
      <label class="field">${t('set.defVersion', 'Reading version')}
        <select class="input" id="ver">${LANGS.map(l => `<optgroup label="${l.name}">${versionsFor(l.id).map(v => `<option value="${v.id}" ${v.id === vid ? 'selected' : ''} ${v.src === 'yv' && !yvKey() ? 'disabled' : ''}>${esc(v.abbr)} — ${esc(v.name)}</option>`).join('')}</optgroup>`).join('')}</select></label>
      <div class="ver-table">
        ${LANGS.map(l => `<div><h4>${l.name}</h4>
          <p class="small"><b>${t('set.offline', 'Built in, works offline')}:</b> ${LOCAL_VERSIONS.filter(v => v.lang === l.id && v.src === 'local').map(v => esc(v.abbr)).join(', ')}</p>
          <p class="small"><b>${t('set.onlineFree', 'Free online')}:</b> ${LOCAL_VERSIONS.filter(v => v.lang === l.id && v.src === 'bibleapi').map(v => esc(v.abbr)).join(', ') || '—'}</p>
          <p class="small"><b>${t('set.popular', 'Popular (YouVersion)')}:</b> ${POPULAR[l.id].map(p => p[0]).join(', ')}</p></div>`).join('')}
      </div>
      <div class="notice">${icon('info')}<span>${t('set.yvExplain', 'Popular translations like NKJV, NIV, NVI, ARA, RVR1960 and Segond 21 are copyrighted. Lamp shows them legally through YouVersion’s free Bible platform. The site owner can add a free app key in js/config.js, or you can paste your own below.')}</span></div>
      <label class="field">${t('set.yvKey', 'YouVersion app key')}<span class="hint">${YOUVERSION_APP_KEY ? t('set.yvSite', 'This site already has a key. You can override it.') : t('set.yvGet', 'Free at platform.youversion.com → create an app → copy the App Key, and accept the licenses of the versions you want.')}</span>
        <input class="input" id="yvKey" autocomplete="off" value="${esc(getSettings().yvKey || '')}" placeholder="${YOUVERSION_APP_KEY ? '••••••' : ''}"></label>
      <div class="row"><button class="btn" id="yvSave">${icon('check')} ${t('set.yvSaveBtn', 'Save key & load versions')}</button><span class="small muted" id="yvStatus"></span></div>`)}

    ${sect('look', 'eye', t('set.display', 'Display'), `
      <label class="field">${t('set.theme', 'Theme')}
        <select class="input" id="theme">${[['system', t('set.th.system', 'Match my device')], ['light', t('set.th.light', 'Light')], ['dark', t('set.th.dark', 'Dark')], ['sepia', t('set.th.sepia', 'Sepia (warm paper)')], ['contrast', t('set.th.contrast', 'High contrast')]].map(([v, l]) => `<option value="${v}" ${s.theme === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="field">${t('set.font', 'Font')}<span class="hint">${t('set.fontHint', 'Atkinson Hyperlegible and Lexend are designed for low vision and dyslexia.')}</span>
        <select class="input" id="font">${[['serif', t('set.f.serif', 'Classic serif (Literata)')], ['sans', t('set.f.sans', 'Simple sans-serif')], ['atkinson', t('set.f.atk', 'Atkinson Hyperlegible — easiest to read')], ['lexend', t('set.f.lex', 'Lexend — dyslexia friendly')]].map(([v, l]) => `<option value="${v}" ${s.font === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="field">${t('set.size', 'Text size')}: <output id="fsOut">${s.fontSize}px</output><input type="range" id="fs" min="14" max="34" step="1" value="${s.fontSize}"></label>
      <label class="field">${t('set.spacing', 'Line spacing')}: <output id="lhOut">${s.lineHeight}</output><input type="range" id="lh" min="1.3" max="2.4" step="0.05" value="${s.lineHeight}"></label>
      <label class="switch"><span>${t('set.vn', 'Show verse numbers')}</span><input type="checkbox" id="vn" ${s.verseNumbers ? 'checked' : ''}></label>
      <label class="switch"><span>${t('set.heads', 'Show section headings (when the version has them)')}</span><input type="checkbox" id="hd" ${s.headings ? 'checked' : ''}></label>
      <label class="switch"><span>${t('set.para', 'Flowing paragraphs instead of one verse per line')}</span><input type="checkbox" id="pm" ${s.paragraphMode ? 'checked' : ''}></label>
      <label class="switch"><span>${t('set.motion', 'Reduce motion & animations')}</span><input type="checkbox" id="rm" ${s.reduceMotion ? 'checked' : ''}></label>
      <div class="scripture preview-box"><span class="verse"><sup class="vn">105</sup><span class="vt">${t('set.sample', 'Thy word is a lamp unto my feet, and a light unto my path.')}</span></span></div>`)}

    ${sect('tts', 'speaker', t('set.tts', 'Read aloud'), speech.supported ? `
      <label class="field">${t('set.voice', 'Voice')}<select class="input" id="voice"><option value="">${t('set.autoVoice', 'Automatic (most natural voice)')}</option></select></label>
      <label class="field">${t('set.speed', 'Speed')}: <output id="rtOut">${s.ttsRate}×</output><input type="range" id="rt" min="0.5" max="1.8" step="0.1" value="${s.ttsRate}"></label>
      <button class="btn" id="ttsTest">${icon('speaker')} ${t('set.testVoice', 'Test voice')}</button>
      <p class="field" style="margin:14px 0 6px">${t('set.kidsVoice', 'Voice in the children’s area')}</p>
      <div class="chips"><button class="chip" data-kv="lamp" aria-pressed="${s.kidsVoice !== 'device'}">${t('set.kidsVoiceLamp', 'Lamp’s recorded voice')}</button><button class="chip" data-kv="device" aria-pressed="${s.kidsVoice === 'device'}">${t('set.kidsVoiceDevice', 'This device’s voice')}</button></div>
      <p class="muted small">${t('set.voiceTip', 'Voices come from your device. For the most natural voices on iPhone and iPad, go to Settings → Accessibility → Spoken Content → Voices, and download an “Enhanced” or “Premium” voice. On Windows, Microsoft Edge has natural online voices.')}</p>` : `<p class="muted">${t('read.noTTS', 'Read-aloud is not supported in this browser')}</p>`)}

    ${sect('remind', 'calendar', t('set.remind', 'Reminders & app'), `
      <div class="row between"><div><b>${t('pwa.title', 'Add Lamp to your home screen')}</b><p class="small muted" style="margin:2px 0 0">${isStandalone() ? t('pwa.installed', 'Lamp is installed on this device.') : t('pwa.cardSub', 'Add it to your home screen: opens like an app, works offline and can remind you every day.')}</p></div>
        ${canInstall() ? `<button class="btn" id="instS">${icon('download')} ${t('pwa.install', 'Install the app')}</button>` : ''}</div>
      <hr>
      <label class="field">${t('rem.time', 'Daily reminder time')}<input class="input" type="time" id="remTime" value="${getReminder().time}" style="max-width:180px"></label>
      <div class="row">
        ${getReminder().on ? `<button class="btn" id="remOff">${t('rem.off', 'Turn off reminders')}</button>` : `<button class="btn primary" id="remOn">${icon('bolt')} ${t('rem.on', 'Turn on reminders')}</button>`}
        <button class="btn" id="remCal">${icon('calendar')} ${t('rem.cal', 'Add to my calendar')}</button>
      </div>
      <p class="small muted" id="remMsg" aria-live="polite">${getReminder().on ? t('rem.isOn', 'Reminders are on at {time}.', { time: getReminder().time }) + (getReminder().push ? ' ' + t('rem.pushOk', 'They arrive even when the app is closed.') : '') : ''}</p>
      <p class="small muted">${t('rem.how', 'Calendar reminders work on every phone and computer. App notifications need the app installed on your home screen (on iPhone and iPad) and, to arrive when the app is closed, a signed-in account.')}${pushSupported() ? '' : ' ' + t('rem.noPush', 'Push notifications are not configured on this site yet; on-device reminders are used when available.')}</p>`)}

    ${sect('ai', 'spark', t('set.ai', 'AI helper (free)'), `
      <p class="muted small">${t('set.aiIntro', 'Choose how the AI runs. None of these cost money.')}</p>
      <div class="stack" role="radiogroup">
        <label class="radio-card"><input type="radio" name="prov" value="pollinations" ${ai.provider === 'pollinations' ? 'checked' : ''}><span><b>${t('set.p1', 'Free online AI')}</b> <small>Pollinations.ai</small><span class="muted small">${t('set.p1d', 'Works instantly on any device, no signup. A shared free service, so it can sometimes be slow or busy.')}</span></span></label>
        <label class="radio-card"><input type="radio" name="prov" value="browser" ${ai.provider === 'browser' ? 'checked' : ''}><span><b>${t('set.p2', 'On-device AI')}</b> <small>WebLLM</small><span class="muted small">${t('set.p2d', 'Downloads an open model once (about 1 GB) and runs entirely on your device: private and offline. Needs Chrome or Edge with WebGPU.')} ${hasWebGPU() ? t('set.p2ok', 'Supported here.') : t('set.p2no', 'Not supported in this browser.')}</span></span></label>
        <label class="radio-card"><input type="radio" name="prov" value="custom" ${ai.provider === 'custom' ? 'checked' : ''}><span><b>${t('set.p3', 'Your own free key')}</b> <small>Groq · OpenRouter · Gemini · Ollama</small><span class="muted small">${t('set.p3d', 'Usually the smartest and fastest answers.')}</span></span></label>
      </div>
      <div id="provBrowser" class="stack" style="margin-top:14px" ${ai.provider === 'browser' ? '' : 'hidden'}>
        <label class="field">${t('set.model', 'Model')}<select class="input" id="bm">${BROWSER_MODELS.map(m => `<option value="${m.id}" ${ai.browserModel === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
      </div>
      <div id="provCustom" class="stack" style="margin-top:14px" ${ai.provider === 'custom' ? '' : 'hidden'}>
        <div class="chips">${PRESETS.map(p => `<button class="chip" data-preset="${p.id}">${esc(p.name)}</button>`).join('')}</div>
        <p class="small muted" id="keyHelp"></p>
        <label class="field">${t('set.apiUrl', 'API address (OpenAI-compatible)')}<input class="input" id="bu" value="${esc(ai.baseUrl)}"></label>
        <label class="field">${t('set.model', 'Model')}<input class="input" id="md" value="${esc(ai.model)}"></label>
        <label class="field">${t('set.apiKey', 'API key')}<span class="hint">${t('set.apiKeyHint', 'Stored only in this browser and sent only to the address above.')}</span><input class="input" id="key" type="password" autocomplete="off" value="${esc(ai.key)}"></label>
      </div>
      <div class="row" style="margin-top:12px"><button class="btn primary" id="aiSave">${icon('check')} ${t('set.saveTest', 'Save & test')}</button></div>
      <div id="aiTest" style="margin-top:12px"></div>`)}

    ${sect('apps', 'plug', t('set.apps', 'Connected apps'), `
      <p class="small muted">${t('set.appsIntro', 'Lamp can work together with your other apps when they are published on the same website address (for example all on your GitHub Pages).')}</p>
      <div class="grid">
        <div class="card app-card"><div class="row between"><b>Weeklan</b><span class="tag subtle">${sisterSummary('weeklan') ? t('set.found', 'Found') : t('set.notFound', 'Not detected')}</span></div><p class="small muted">${t('set.weeklanD', 'Your weekly planner. Send Bible reading or study time to your week.')}</p><button class="btn small" id="toWeeklan">${icon('plus')} ${t('set.sendReading', 'Add tomorrow’s reading to Weeklan')}</button></div>
        <div class="card app-card"><div class="row between"><b>Softland</b><span class="tag subtle">${sisterSummary('softland') ? t('set.found', 'Found') : t('set.notFound', 'Not detected')}</span></div><p class="small muted">${t('set.softlandD', 'Your calm companion. It can show your verse of the day and streak.')}</p><p class="small">${t('set.sharing', 'Lamp shares: streak, XP, last chapter and reviews due.')}</p></div>
      </div>`)}

    ${sect('data', 'download', t('set.data', 'Your data'), `
      <p class="small">${t('set.dataIntro', 'Your notes, highlights, studies and progress are stored only on this device. Back them up or move them to another device:')}</p>
      <div class="row">
        <button class="btn" id="exp">${icon('download')} ${t('set.export', 'Export backup')}</button>
        <label class="btn" for="imp">${icon('upload')} ${t('set.import', 'Import backup')}</label><input type="file" id="imp" accept="application/json,.json" class="sr-only">
        <button class="btn" id="dlAll">${icon('download')} ${t('set.dlBible', 'Save {v} for offline', { v: esc(getVersion(vid).src === 'local' ? getVersion(vid).abbr : 'KJV') })}</button>
        <button class="btn ghost danger" id="wipe">${icon('trash')} ${t('set.erase', 'Erase everything')}</button>
      </div>
      <div class="progress" style="margin-top:10px" hidden id="dlP"><i style="width:0"></i></div>`)}

    <section class="card"><h2 class="card-title">${icon('info')} ${t('set.about', 'About Lamp')}</h2>
      <p class="small">${t('set.verse', '“Thy word is a lamp unto my feet, and a light unto my path.” — Psalm 119:105')}</p>
      <p class="small muted">${t('set.credits', 'Free and open. Built-in Bibles: KJV, BSB (CC0), Darby, Martin, Reina-Valera 1909/1865 (public domain), Bíblia Livre (CC BY), NVA (CC BY-SA). Other public-domain versions from bible-api.com; licensed versions via YouVersion Platform. Maps © OpenStreetMap, Leaflet. On-device AI by WebLLM. AI answers can be wrong — always check them against Scripture.')}</p>
      <p class="small muted">${t('set.keys', 'Keyboard: ← → change chapter · Tab to a verse and press Enter to select it · Shift+Enter selects a range · 1–4 answer in lessons.')}</p>
    </section>`;

  const apply = patch => setSettings(patch);
  $$('[data-lang]', el).forEach(b => b.addEventListener('click', () => {
    apply({ lang: b.dataset.lang, version: '' }); setLang(b.dataset.lang);
    window.dispatchEvent(new Event('lamp:nav')); location.reload();
  }));
  $('#ver', el).addEventListener('change', e => { apply({ version: e.target.value }); toast(t('common.saved', 'Saved')); });
  $('#yvSave', el).addEventListener('click', async () => {
    apply({ yvKey: $('#yvKey', el).value.trim() });
    try { localStorage.removeItem('lamp:yvVersions'); } catch {}
    $('#yvStatus', el).textContent = t('set.loading', 'Loading…');
    const counts = await Promise.all(LANGS.map(l => refreshYV(l.id).then(x => x.length)));
    const n = counts.reduce((a, b) => a + b, 0);
    $('#yvStatus', el).textContent = yvKey() ? (n ? t('set.yvOk', '{n} versions available', { n }) : t('set.yvNone', 'No versions returned — check the key and accepted licenses.')) : t('set.yvRemoved', 'Key removed');
  });
  $('#theme', el).addEventListener('change', e => { apply({ theme: e.target.value }); if (e.target.value === 'system') delete root.dataset.theme; else root.dataset.theme = e.target.value; });
  $('#font', el).addEventListener('change', e => { apply({ font: e.target.value }); root.dataset.font = e.target.value; });
  $('#fs', el).addEventListener('input', e => { apply({ fontSize: +e.target.value }); root.style.setProperty('--read-size', e.target.value + 'px'); $('#fsOut', el).textContent = e.target.value + 'px'; });
  $('#lh', el).addEventListener('input', e => { apply({ lineHeight: +e.target.value }); root.style.setProperty('--read-lh', e.target.value); $('#lhOut', el).textContent = e.target.value; });
  $('#vn', el).addEventListener('change', e => apply({ verseNumbers: e.target.checked }));
  $('#hd', el).addEventListener('change', e => apply({ headings: e.target.checked }));
  $('#pm', el).addEventListener('change', e => apply({ paragraphMode: e.target.checked }));
  $('#rm', el).addEventListener('change', e => { apply({ reduceMotion: e.target.checked }); if (e.target.checked) root.dataset.motion = 'reduce'; else delete root.dataset.motion; });

  if (speech.supported) {
    const fill = () => {
      const sel = $('#voice', el); if (!sel) return;
      const vs = speech.voices();
      const pref = vs.filter(v => v.lang.startsWith(LANG)).concat(vs.filter(v => !v.lang.startsWith(LANG)));
      sel.innerHTML = `<option value="">${t('set.default', 'Default')}</option>` + pref.map(v => `<option value="${esc(v.voiceURI)}" ${getSettings().ttsVoice === v.voiceURI ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('');
    };
    fill(); speechSynthesis.addEventListener?.('voiceschanged', fill);
    $('#voice', el).addEventListener('change', e => apply({ ttsVoice: e.target.value }));
    $$('[data-kv]', el).forEach(b => b.addEventListener('click', () => { apply({ kidsVoice: b.dataset.kv }); $$('[data-kv]', el).forEach(x => x.setAttribute('aria-pressed', x === b)); toast(t('common.saved', 'Saved')); }));
    $('#rt', el).addEventListener('input', e => { apply({ ttsRate: +e.target.value }); $('#rtOut', el).textContent = e.target.value + '×'; });
    $('#ttsTest', el).addEventListener('click', () => { const st = getSettings(); speech.stop(); speech.speak(t('set.sample', 'Thy word is a lamp unto my feet, and a light unto my path.'), { rate: st.ttsRate, voice: st.ttsVoice, lang: LANG }); });
  }

  // Reminders & install
  $('#instS', el)?.addEventListener('click', () => install());
  $('#remCal', el).addEventListener('click', () => downloadCalendar($('#remTime', el).value || '19:00'));
  $('#remOn', el)?.addEventListener('click', async () => {
    try { await enableReminder($('#remTime', el).value || '19:00'); toast(t('rem.isOn', 'Reminders are on at {time}.', { time: $('#remTime', el).value })); render(el, { parts: ['remind'] }); }
    catch (e) { $('#remMsg', el).textContent = e.message; }
  });
  $('#remOff', el)?.addEventListener('click', async () => { await disableReminder(); toast(t('rem.offDone', 'Reminders turned off')); render(el, { parts: ['remind'] }); });

  const showProv = () => { const p = el.querySelector('[name=prov]:checked').value; $('#provBrowser', el).hidden = p !== 'browser'; $('#provCustom', el).hidden = p !== 'custom'; };
  $$('[name=prov]', el).forEach(r => r.addEventListener('change', showProv));
  $$('[data-preset]', el).forEach(b => b.addEventListener('click', () => {
    const p = PRESETS.find(x => x.id === b.dataset.preset);
    $('#bu', el).value = p.baseUrl; $('#md', el).value = p.model;
    $('#keyHelp', el).innerHTML = `${t('set.getKey', 'Get a free key at')} <a href="${p.keyUrl}" target="_blank" rel="noopener">${esc(new URL(p.keyUrl).host)}</a>`;
  }));
  $('#aiSave', el).addEventListener('click', () => {
    setAI({ provider: el.querySelector('[name=prov]:checked').value, browserModel: $('#bm', el).value, baseUrl: $('#bu', el).value.trim(), model: $('#md', el).value.trim(), key: $('#key', el).value.trim(), chosen: true });
    toast(t('common.saved', 'Saved'));
    runAI($('#aiTest', el), [{ role: 'user', content: 'In one or two sentences, what does Psalm 119:105 mean?' }]);
  });

  $('#toWeeklan', el).addEventListener('click', () => {
    const p = getProgress();
    const last = p.last || { b: 42, c: 0 };
    let b = last.b, c = last.c + 1; if (c > BOOKS[b].ch) { b = Math.min(65, b + 1); c = 1; }
    const d = new Date(); d.setDate(d.getDate() + 1);
    sendTo('weeklan', { type: 'task', title: `${t('set.readTask', 'Read')} ${bookName(b)} ${c}`, date: today(d), minutes: 15, link: location.href.split('#')[0] + `#/read/${b}/${c}` });
    toast(t('set.sent', 'Sent to Weeklan'));
  });

  $('#dlAll', el).addEventListener('click', async e => {
    const v = getVersion(vid).src === 'local' ? vid : 'kjv';
    e.target.disabled = true; const bar = $('#dlP', el); bar.hidden = false; let n = 0;
    try { for (let b = 0; b < BOOKS.length; b++) { await getBook(b, v); n++; bar.firstElementChild.style.width = (n / BOOKS.length * 100) + '%'; } toast(t('set.dlDone', 'Saved for offline use')); }
    catch { toast(t('set.dlFail', 'Download stopped — check your connection')); }
    e.target.disabled = false;
  });
  $('#exp', el).addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(exportAll(), null, 1)], { type: 'application/json' }));
    a.download = `lamp-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('#imp', el).addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try { importAll(JSON.parse(await f.text())); toast(t('set.restored', 'Backup restored')); setTimeout(() => location.reload(), 700); }
    catch (err) { toast(err.message); }
  });
  $('#wipe', el).addEventListener('click', () => { if (confirm(t('set.eraseConfirm', 'Erase all notes, highlights, memory verses and settings on this device? This cannot be undone.'))) { clearAll(); location.reload(); } });
  if (parts[0]) setTimeout(() => document.getElementById(parts[0])?.scrollIntoView({ block: 'start' }), 50);
}
