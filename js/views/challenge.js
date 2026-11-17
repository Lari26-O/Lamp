import { $, esc, icon, toast } from '../util.js';
import { todayChallenge, challengeText, isDone, completeChallenge, challengeStreak, challengeHistory } from '../challenges.js';
import { t, fmtDate } from '../i18n.js';

export function render(el) {
  const draw = () => {
    const ch = todayChallenge(); const done = isDone(ch);
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    el.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">${t('ch.eyebrow', 'Every day a new one')}</p><h1>${t('ch.title', 'Daily challenge')}</h1><p>${t('ch.intro', 'One small step of faith each day — some in the app, some in real life.')}</p></div></div>
      <section class="card challenge-hero ${done ? 'done' : ''}">
        <span class="ch-ico">${icon(done ? 'check' : ch.icon)}</span>
        <p class="eyebrow">${ch.kind === 'app' ? t('ch.inApp', 'In the app') : t('ch.life', 'In real life')} · ${fmtDate(Date.now())}</p>
        <h2 class="ch-text">${esc(challengeText(ch))}</h2>
        <div class="row center">
          ${done ? `<p class="ch-done">${icon('check')} ${t('ch.done', 'Done! +10 XP')}</p>` : `<button class="btn primary" id="did">${icon('check')} ${t('ch.didIt', 'I did it')}</button>`}
          ${ch.link && !done ? `<a class="btn" href="${ch.link}">${icon('play')} ${t('ch.go', 'Do it now')}</a>` : ''}
        </div>
        ${ch.kind === 'app' && ch.check && !done ? `<p class="small muted">${t('ch.auto', 'This one completes by itself when you do it in the app.')}</p>` : ''}
      </section>
      <div class="card"><div class="row between"><b>${t('ch.streak', 'Challenge streak')}</b><span class="tag">${icon('flame')} ${challengeStreak()}</span></div>
        <div class="ch-week">${challengeHistory(7).map(d => `<span class="${d.done ? 'on' : ''}" title="${d.date}">${d.done ? icon('check') : ''}</span>`).join('')}</div>
        <p class="small muted" style="margin:8px 0 0">${t('ch.tomorrow', 'Tomorrow:')} ${esc(challengeText(todayChallenge(tomorrow)))}</p></div>`;
    $('#did', el)?.addEventListener('click', () => { completeChallenge(ch); toast(t('ch.done', 'Done! +10 XP')); draw(); });
  };
  draw();
}
