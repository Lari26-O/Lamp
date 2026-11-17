// Onboarding (first launch) and the account/profile page.
import { $, $$, esc, icon, toast } from '../util.js';
import { t, LANG, LANGS, setLang, fmtDate } from '../i18n.js';
import { getSettings, setSettings, getNotes, getMarks } from '../store.js';
import { getProfile, setProfile, AGES, GOALS, L, ageById } from '../profile.js';
import { cloudEnabled, getUser, signIn, signUp, signOut, pushNow, fetchCloud, applyCloud, resetPassword, lastSynced, resendConfirm } from '../cloud.js';
import { PLANS, planTitle } from '../plans-data.js';
import { bookName } from '../bible.js';

// ---- shared sign-in / sign-up form ----
export function authForm(box, { onDone, compact = false } = {}) {
  let mode = 'signup';
  const draw = () => {
    box.innerHTML = `
      <div class="seg-tabs" role="tablist" style="margin-bottom:12px">
        <button role="tab" data-mode="signup" aria-selected="${mode === 'signup'}">${t('acc.create', 'Create account')}</button>
        <button role="tab" data-mode="signin" aria-selected="${mode === 'signin'}">${t('acc.signin', 'Sign in')}</button>
      </div>
      <form id="authF" class="stack">
        <label class="field">${t('acc.email', 'Email')}<input class="input" type="email" id="aEmail" autocomplete="email" required></label>
        <label class="field">${t('acc.password', 'Password')}<span class="hint">${mode === 'signup' ? t('acc.passHint', 'At least 6 characters.') : ''}</span><input class="input" type="password" id="aPass" minlength="6" autocomplete="${mode === 'signup' ? 'new-password' : 'current-password'}" required></label>
        <button class="btn primary wide" id="aGo">${mode === 'signup' ? t('acc.create', 'Create account') : t('acc.signin', 'Sign in')}</button>
        ${mode === 'signin' ? `<button type="button" class="btn ghost small" id="aForgot">${t('acc.forgot', 'Forgot password?')}</button>` : ''}
        <p class="small muted" id="aMsg" aria-live="polite"></p>
        ${compact ? '' : `<p class="small muted">${t('acc.same', 'The same account works in Weeklan.')}</p>`}
      </form>`;
    $$('[data-mode]', box).forEach(b => b.addEventListener('click', () => { mode = b.dataset.mode; draw(); }));
    $('#aForgot', box)?.addEventListener('click', async () => {
      const email = $('#aEmail', box).value.trim();
      if (!email) { $('#aMsg', box).textContent = t('acc.typeEmail', 'Type your email first.'); return; }
      try { await resetPassword(email); $('#aMsg', box).textContent = t('acc.resetSent', 'We sent you an email to reset your password.'); } catch (e) { $('#aMsg', box).textContent = e.message; }
    });
    $('#authF', box).addEventListener('submit', async e => {
      e.preventDefault();
      const email = $('#aEmail', box).value.trim(), pass = $('#aPass', box).value;
      const btn = $('#aGo', box); btn.disabled = true;
      $('#aMsg', box).innerHTML = `<span class="spinner"></span>`;
      try {
        if (mode === 'signup') {
          const r = await signUp(email, pass);
          if (r.needsConfirm) { $('#aMsg', box).textContent = t('cloud.confirm', 'Check your email to confirm your account, then sign in.'); mode = 'signin'; btn.disabled = false; return; }
          toast(t('acc.created', 'Account created — your progress is saved'));
        } else {
          await signIn(email, pass);
          const cloud = await fetchCloud().catch(err => { throw err; });
          const hasLocal = Object.keys(getNotes()).length + getMarks().length > 0;
          if (cloud?.exists && cloud.data && (!hasLocal || confirm(t('acc.useCloud', 'Load the progress saved in your account? This replaces what is on this device.')))) {
            applyCloud(cloud.data); toast(t('acc.loaded', 'Your progress was loaded')); setTimeout(() => location.reload(), 600); return;
          }
          await pushNow().catch(() => {});
          toast(t('acc.welcome', 'Signed in'));
        }
        onDone?.();
      } catch (err) {
        $('#aMsg', box).textContent = err.message; btn.disabled = false;
        if (/confirm/i.test(err.message) && email) {
          $('#aMsg', box).insertAdjacentHTML('beforeend', ` <button class="btn small ghost" type="button" id="aResend">${t('cloud.resend', 'Send the confirmation email again')}</button>`);
          $('#aResend', box).addEventListener('click', async ev => { ev.target.disabled = true; try { await resendConfirm(email); $('#aMsg', box).textContent = t('cloud.resent', 'Sent! Check your email (and the spam folder).'); } catch (e2) { $('#aMsg', box).textContent = e2.message; } });
        }
      }
    });
  };
  draw();
}

// ---- onboarding ----
export function render(el, { parts }) {
  if (!getProfile().done) return onboarding(el);
  if (parts[0] === 'welcome') { location.replace('#/home'); return; }
  return accountPage(el);
}

function onboarding(el) {
  const p = getProfile();
  const st = { step: 0, learn: 'yes', lang: LANG, name: p.name, age: p.age, goals: new Set(p.goals || []), minutes: p.minutes || 10 };
  const total = 6;
  const draw = () => {
    const head = st.step > 0 ? `<div class="play-head"><button class="icon-btn" id="obBack" aria-label="${t('common.back', 'Back')}">${icon('chevL')}</button><div class="progress grow"><i style="width:${(st.step / total) * 100}%"></i></div></div>` : '';
    let body = '', canNext = true;
    if (st.step === 0) {
      body = `<div class="ob-hero"><img src="icons/icon.svg" alt="" width="84" height="84"><h1>${t('ob.title', 'Welcome to Lamp')}</h1><p class="lead">${t('ob.sub', 'Read, understand and remember the Bible — with reading plans, short lessons, games and a study Bible of your own.')}</p>
        <button class="btn primary wide" id="obStart">${t('ob.start', 'Get started')}</button>
        ${cloudEnabled() ? `<button class="btn ghost wide" id="obHave">${t('ob.have', 'I already have an account')}</button>` : ''}<div id="obAuth"></div></div>`;
    }
    if (st.step === 1) body = `<h1 class="ob-q">${t('ob.lang', 'Which language?')}</h1><div class="choice-list">${LANGS.map(l => `<button class="choice ${st.lang === l.id ? 'on' : ''}" data-lang="${l.id}"><b>${l.name}</b><span>${l.id.toUpperCase()}</span></button>`).join('')}</div>`;
    if (st.step === 2) { body = `<h1 class="ob-q">${t('ob.name', 'What should we call you?')}</h1><label class="sr-only" for="obName">${t('ob.nameL', 'Your name')}</label><input class="input big-input" id="obName" value="${esc(st.name)}" placeholder="${t('ob.nameL', 'Your name')}" autocomplete="given-name"><p class="muted small">${t('ob.nameHint', 'Optional. Only used to greet you.')}</p>`; }
    if (st.step === 3) { canNext = !!st.age; body = `<h1 class="ob-q">${t('ob.age', 'How old are you?')}</h1><p class="muted">${t('ob.ageWhy', 'Lessons, quizzes, questions and the AI helper adapt to your age.')}</p><div class="choice-grid">${AGES.map(a => `<button class="choice ${st.age === a.id ? 'on' : ''}" data-age="${a.id}"><b>${esc(L(a.name))}</b><span>${esc(L(a.range))}</span></button>`).join('')}</div>`; }
    if (st.step === 4) body = `<h1 class="ob-q">${t('ob.goals', 'What would you like to do?')}</h1><p class="muted">${t('ob.pickAny', 'Pick as many as you like.')}</p><div class="choice-list">${GOALS.map(g => `<button class="choice ${st.goals.has(g.id) ? 'on' : ''}" data-goal="${g.id}">${icon(g.icon)}<b>${esc(L(g.name))}</b></button>`).join('')}</div>`;
    if (st.step === 5) body = `<h1 class="ob-q">${t('ob.time', 'How much time each day?')}</h1><div class="choice-list">${[[5, t('ob.t5', 'Casual')], [10, t('ob.t10', 'Regular')], [15, t('ob.t15', 'Serious')], [20, t('ob.t20', 'Intense')]].map(([m, l]) => `<button class="choice ${st.minutes === m ? 'on' : ''}" data-min="${m}"><b>${t('ob.min', '{n} minutes a day', { n: m })}</b><span>${l}</span></button>`).join('')}</div>`;
    if (st.step === 6) {
      const age = ageById(st.age);
      const plans = age.plans.map(id => PLANS.find(x => x.id === id)).filter(Boolean);
      if (age.kids) { body = `<h1 class="ob-q">${st.name ? t('ob.readyName', 'You’re all set, {name}!', { name: esc(st.name) }) : t('ob.ready', 'You’re all set!')}</h1>
        <p class="muted">${t('ob.kidsIntro', 'Lamp will open in the children’s area: colorful stories about Jesus, picture games, coloring and stickers. Everything can be heard out loud.')}${age.preReader ? ' ' + t('ob.kidsAuto', 'Because your child may not read yet, each page will be read aloud automatically.') : ''}</p>
        <p class="small muted">${t('ob.kidsGate', 'Grown-ups can open the full app with the “Grown-ups” button.')}</p>`; } else
      body = `<h1 class="ob-q">${st.name ? t('ob.readyName', 'You’re all set, {name}!', { name: esc(st.name) }) : t('ob.ready', 'You’re all set!')}</h1>
        <p class="muted">${t('ob.recommend', 'Here is a good place to start:')}</p>
        <div class="choice-list">
          <button class="choice ${st.learn === 'yes' ? 'on' : ''}" data-learn="yes">${icon('path')}<b>${t('ob.learnBook', 'Learn the book of {book}', { book: esc(bookName(age.book)) })}</b><span>${t('ob.learnBookSub', 'Short lessons, section by section.')}</span></button>
          <button class="choice ${st.learn === 'pick' ? 'on' : ''}" data-learn="pick">${icon('book')}<b>${t('ob.learnPick', 'I’ll choose a different book')}</b><span>${t('ob.learnPickSub', 'Pick any book of the Bible to learn.')}</span></button>
          <button class="choice ${st.learn === 'none' ? 'on' : ''}" data-learn="none">${icon('compass')}<b>${t('ob.learnNone', 'No lessons for now, I’ll just explore')}</b><span>${t('ob.learnNoneSub', 'Read the Bible, take notes and use everything freely.')}</span></button>
        </div>
        ${plans.length ? `<p class="muted small" style="margin-top:14px">${t('ob.plansOptional', 'Reading plans you might like (optional, start them any time from Plans):')} ${plans.map(pl => esc(planTitle(pl))).join(' · ')}</p>` : ''}
        ${cloudEnabled() ? `<section class="card" style="margin-top:16px"><h3 class="card-title">${icon('globe')} ${t('ob.save', 'Save your progress')}</h3><p class="small muted">${t('ob.saveSub', 'Create a free account to keep your notes and progress on any device.')}</p><div id="obAuth2"></div></section>` : ''}`;
    }
    el.innerHTML = `<div class="onboard">${head}<div class="ob-body">${body}</div>${st.step > 0 ? `<div class="lesson-foot"><button class="btn primary wide" id="obNext" ${canNext ? '' : 'disabled'}>${st.step === 6 ? t('ob.finish', 'Start') : t('learn.continue', 'Continue')}</button></div>` : ''}</div>`;

    $('#obStart', el)?.addEventListener('click', () => { st.step = 1; draw(); });
    $('#obHave', el)?.addEventListener('click', () => authForm($('#obAuth', el), { compact: true, onDone: () => { if (getProfile().done) location.hash = '#/home'; else { st.step = 1; draw(); } } }));
    $('#obBack', el)?.addEventListener('click', () => { st.step--; draw(); });
    $$('[data-lang]', el).forEach(b => b.addEventListener('click', () => { st.lang = b.dataset.lang; setSettings({ lang: st.lang, version: '' }); setLang(st.lang); window.dispatchEvent(new Event('lamp:nav')); draw(); }));
    $$('[data-age]', el).forEach(b => b.addEventListener('click', () => { st.age = b.dataset.age; draw(); }));
    $$('[data-goal]', el).forEach(b => b.addEventListener('click', () => { st.goals.has(b.dataset.goal) ? st.goals.delete(b.dataset.goal) : st.goals.add(b.dataset.goal); draw(); }));
    $$('[data-min]', el).forEach(b => b.addEventListener('click', () => { st.minutes = +b.dataset.min; draw(); }));
    $('#obName', el)?.addEventListener('input', e => { st.name = e.target.value.trim(); });
    $('#obName', el)?.focus();
    if ($('#obAuth2', el)) authForm($('#obAuth2', el), { compact: true });
    $('#obNext', el)?.addEventListener('click', () => {
      if (st.step < 6) { st.step++; draw(); return; }
      const age = ageById(st.age);
      setProfile({ done: true, name: st.name, age: st.age, goals: [...st.goals], minutes: st.minutes, created: Date.now(), learnBook: st.learn === 'yes' ? age.book : -1 });
      const s = getSettings();
      setSettings({ dailyGoal: { 5: 10, 10: 20, 15: 30, 20: 50 }[st.minutes], ...(st.age === 'senior' && s.fontSize === 19 ? { fontSize: 22 } : {}), ...(st.age === 'kids' && s.font === 'serif' ? { font: 'atkinson' } : {}) });
      document.documentElement.style.setProperty('--read-size', getSettings().fontSize + 'px');
      document.documentElement.dataset.font = getSettings().font;
      window.dispatchEvent(new Event('lamp:nav'));
      location.hash = st.learn === 'pick' && !age.kids ? '#/learn/books' : '#/home';
    });
    el.querySelectorAll('[data-learn]').forEach(btn => btn.addEventListener('click', () => { st.learn = btn.dataset.learn; el.querySelectorAll('[data-learn]').forEach(x => x.classList.toggle('on', x === btn)); }));
  };
  draw();
}

// ---- account & profile page ----
async function accountPage(el) {
  const p = getProfile();
  el.innerHTML = `
    <div class="page-head"><div><p class="eyebrow">${t('acc.eyebrow', 'You')}</p><h1>${t('acc.title', 'Profile & account')}</h1><p>${t('acc.intro', 'Your age group shapes lessons, quizzes, questions and the AI helper.')}</p></div></div>
    <section class="card"><h2 class="card-title">${icon('people')} ${t('acc.profile', 'Profile')}</h2>
      <label class="field">${t('ob.nameL', 'Your name')}<input class="input" id="pName" value="${esc(p.name)}"></label>
      <p class="field" style="margin-bottom:6px">${t('acc.ageGroup', 'Age group')}</p>
      <div class="choice-grid small">${AGES.map(a => `<button class="choice ${p.age === a.id ? 'on' : ''}" data-age="${a.id}"><b>${esc(L(a.name))}</b><span>${esc(L(a.range))}</span></button>`).join('')}</div>
      <p class="field" style="margin:14px 0 6px">${t('acc.goals', 'Goals')}</p>
      <div class="chips">${GOALS.map(g => `<button class="chip" data-goal="${g.id}" aria-pressed="${(p.goals || []).includes(g.id)}">${icon(g.icon)} ${esc(L(g.name))}</button>`).join('')}</div>
    </section>
    <section class="card" id="accBox"><h2 class="card-title">${icon('globe')} ${t('acc.account', 'Account & sync')}</h2><div id="accInner"><span class="spinner"></span></div></section>`;
  $('#pName', el).addEventListener('change', e => { setProfile({ name: e.target.value.trim() }); toast(t('common.saved', 'Saved')); });
  $$('[data-age]', el).forEach(b => b.addEventListener('click', () => { setProfile({ age: b.dataset.age }); window.dispatchEvent(new Event('lamp:age')); $$('[data-age]', el).forEach(x => x.classList.toggle('on', x === b)); toast(t('common.saved', 'Saved')); }));
  $$('[data-goal]', el).forEach(b => b.addEventListener('click', () => {
    const goals = new Set(getProfile().goals || []); goals.has(b.dataset.goal) ? goals.delete(b.dataset.goal) : goals.add(b.dataset.goal);
    setProfile({ goals: [...goals] }); b.setAttribute('aria-pressed', goals.has(b.dataset.goal));
  }));
  const inner = $('#accInner', el);
  if (!cloudEnabled()) { inner.innerHTML = `<p class="muted">${t('acc.disabled', 'Accounts are not configured on this site. Your data is saved on this device.')}</p>`; return; }
  const user = await getUser();
  if (!document.body.contains(inner)) return;
  if (!user) {
    inner.innerHTML = `<p class="small muted">${t('acc.why', 'Your progress is saved on this device. Create a free account to keep it safe and use it on your phone and computer.')}</p><div id="authBox"></div>`;
    authForm($('#authBox', el), { onDone: () => accountPage(el) });
    return;
  }
  const ls = lastSynced();
  inner.innerHTML = `
    <p>${t('acc.signedAs', 'Signed in as {email}', { email: `<b>${esc(user.email)}</b>` })}</p>
    <p class="small muted">${ls ? t('acc.lastSync', 'Last saved {d}', { d: fmtDate(ls) + ' ' + new Date(ls).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }) : t('acc.notYet', 'Not saved yet.')}</p>
    <div class="row"><button class="btn primary" id="syncNow">${icon('upload')} ${t('acc.syncNow', 'Save now')}</button><button class="btn" id="pullNow">${icon('download')} ${t('acc.pull', 'Load from account')}</button><button class="btn ghost" id="out">${t('acc.signout', 'Sign out')}</button></div>
    <p class="small muted" id="syncMsg" aria-live="polite"></p>`;
  $('#syncNow', el).addEventListener('click', async () => { try { await pushNow(); toast(t('acc.saved', 'Saved to your account')); accountPage(el); } catch (e) { $('#syncMsg', el).textContent = e.message; } });
  $('#pullNow', el).addEventListener('click', async () => {
    try { const c = await fetchCloud(); if (!c?.exists) { $('#syncMsg', el).textContent = t('acc.nothing', 'Nothing saved in your account yet.'); return; }
      if (confirm(t('acc.useCloud', 'Load the progress saved in your account? This replaces what is on this device.'))) { applyCloud(c.data); location.reload(); } }
    catch (e) { $('#syncMsg', el).textContent = e.message; }
  });
  $('#out', el).addEventListener('click', async () => { await signOut(); toast(t('acc.out', 'Signed out')); accountPage(el); });
}
