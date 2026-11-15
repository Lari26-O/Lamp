// Prayer list: requests, answered prayers, and a simple "pray now" mode.
import { $, $$, esc, icon, toast } from '../util.js';
import { load, save, uid, markActivity } from '../store.js';
import { parseRef, refHash, localRef, passageText, currentVersion, refLabel } from '../bible.js';
import { t, fmtDate } from '../i18n.js';

const CATS = () => [['me', t('pr.me', 'Me')], ['family', t('pr.family', 'Family')], ['friends', t('pr.friends', 'Friends')], ['church', t('pr.church', 'Church')], ['world', t('pr.world', 'World')]];
const get = () => load('prayers', []);
const put = list => { save('prayers', list); window.dispatchEvent(new Event('lamp:data')); };

export function render(el) {
  let tab = 'active';
  const draw = () => {
    const all = get();
    const list = all.filter(p => tab === 'active' ? !p.answered : p.answered).sort((a, b) => (b.answered || b.created) - (a.answered || a.created));
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">${t('navg.remember', 'Remember')}</p><h1>${t('pr.title', 'Prayer')}</h1><p>${t('pr.intro', 'Keep a list of what you are praying for, and remember how God answered.')}</p></div>
        ${all.some(p => !p.answered) ? `<button class="btn primary" id="prayNow">${icon('hand')} ${t('pr.prayNow', 'Pray now')}</button>` : ''}</div>
      <form class="card" id="addP">
        <label class="field">${t('pr.new', 'New prayer request')}<input class="input" id="pTitle" required placeholder="${t('pr.ph', 'e.g. Healing for grandma')}"></label>
        <div class="row">
          <select class="input" id="pCat" style="width:auto;margin:0">${CATS().map(([id, l]) => `<option value="${id}">${esc(l)}</option>`).join('')}</select>
          <input class="input grow" id="pRef" style="margin:0" placeholder="${t('pr.verse', 'Verse to pray (optional), e.g. Philippians 4:6')}">
          <button class="btn primary">${icon('plus')} ${t('common.add', 'Add')}</button>
        </div>
      </form>
      <div class="seg-tabs" role="tablist" style="margin:16px 0">
        <button role="tab" data-tab="active" aria-selected="${tab === 'active'}">${t('pr.praying', 'Praying')} (${all.filter(p => !p.answered).length})</button>
        <button role="tab" data-tab="answered" aria-selected="${tab === 'answered'}">${t('pr.answered', 'Answered')} (${all.filter(p => p.answered).length})</button>
      </div>
      <div class="stack">${list.length ? list.map(p => `
        <article class="card prayer ${p.answered ? 'answered' : ''}">
          <div class="row between"><b>${esc(p.title)}</b><span class="tag subtle">${esc(CATS().find(c => c[0] === p.cat)?.[1] || '')}</span></div>
          ${p.ref && parseRef(p.ref) ? `<a class="small" href="${refHash(parseRef(p.ref))}">${icon('book')} ${esc(localRef(p.ref))}</a>` : ''}
          ${p.answered ? `<p class="small answered-note">${icon('check')} ${t('pr.answeredOn', 'Answered {d}', { d: fmtDate(p.answered) })}${p.answer ? ' — ' + esc(p.answer) : ''}</p>` : `<p class="small muted">${t('pr.since', 'Praying since {d}', { d: fmtDate(p.created) })}${p.count ? ' · ' + t('pr.count', 'prayed {n}×', { n: p.count }) : ''}</p>`}
          <div class="row">
            ${p.answered ? '' : `<button class="btn small" data-ans="${p.id}">${icon('check')} ${t('pr.markAnswered', 'Mark answered')}</button>`}
            <button class="icon-btn sm" data-del="${p.id}" aria-label="${t('common.delete', 'Delete')}">${icon('trash')}</button>
          </div>
        </article>`).join('') : `<div class="empty-state">${icon('hand', 'xl')}<p>${tab === 'active' ? t('pr.empty', 'Add something you would like to pray about.') : t('pr.emptyAns', 'Answered prayers will appear here.')}</p></div>`}</div>`;
    $('#addP', el).addEventListener('submit', e => {
      e.preventDefault();
      const r = parseRef($('#pRef', el).value);
      put([{ id: uid(), title: $('#pTitle', el).value.trim(), cat: $('#pCat', el).value, ref: r ? refLabel(r, 'en') : '', created: Date.now(), count: 0 }, ...get()]);
      toast(t('common.saved', 'Saved')); draw();
    });
    $$('[data-tab]', el).forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; draw(); }));
    $$('[data-del]', el).forEach(b => b.addEventListener('click', () => { if (confirm(t('notes.confirm', 'Delete this?'))) { put(get().filter(p => p.id !== b.dataset.del)); draw(); } }));
    $$('[data-ans]', el).forEach(b => b.addEventListener('click', () => {
      const note = prompt(t('pr.howAnswered', 'How did God answer? (optional)')) || '';
      put(get().map(p => p.id === b.dataset.ans ? { ...p, answered: Date.now(), answer: note } : p)); toast(t('pr.praise', 'Praise God!')); draw();
    }));
    $('#prayNow', el)?.addEventListener('click', prayNow);
  };

  async function prayNow() {
    const list = get().filter(p => !p.answered);
    let i = 0;
    const step = async () => {
      if (i >= list.length) {
        el.innerHTML = `<div class="card result-card"><div class="big-ico">${icon('hand')}</div><h1>${t('pr.amen', 'Amen')}</h1><p>${t('pr.done', 'You prayed for {n} requests.', { n: list.length })}</p><button class="btn primary" id="back">${t('common.done', 'Done')}</button></div>`;
        markActivity('prayer', 5);
        $('#back', el).addEventListener('click', draw);
        return;
      }
      const p = list[i];
      const verse = p.ref ? await passageText(p.ref, currentVersion()).catch(() => '') : '';
      el.innerHTML = `<div class="play-head"><button class="icon-btn" id="x" aria-label="${t('common.close', 'Close')}">${icon('x')}</button><div class="progress grow"><i style="width:${(i / list.length) * 100}%"></i></div></div>
        <div class="card play-card"><p class="eyebrow">${esc(CATS().find(c => c[0] === p.cat)?.[1] || '')}</p><h1>${esc(p.title)}</h1>
        ${verse ? `<blockquote class="quote">${esc(verse)} <cite>${esc(localRef(p.ref))}</cite></blockquote>` : ''}
        <p class="muted">${t('pr.take', 'Take a moment to pray for this.')}</p>
        <button class="btn primary" id="next">${t('pr.prayed', 'I prayed')} ${icon('chevR')}</button></div>`;
      $('#x', el).addEventListener('click', draw);
      $('#next', el).addEventListener('click', () => { put(get().map(x => x.id === p.id ? { ...x, count: (x.count || 0) + 1 } : x)); i++; step(); });
    };
    step();
  }
  draw();
}
