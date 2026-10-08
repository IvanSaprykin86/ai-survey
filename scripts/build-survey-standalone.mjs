import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Load questions via tsx subprocess output
import { execSync } from "node:child_process";
const questionsJson = execSync(
  `npx --yes tsx -e "import { SURVEY_QUESTIONS } from './lib/survey/questions.ts'; console.log(JSON.stringify(SURVEY_QUESTIONS.map(({ showIf, ...r }) => r)));"`,
  { cwd: root, encoding: "utf8" },
).trim();

const SYNC_URL =
  process.env.NEXT_PUBLIC_SURVEY_SYNC_URL?.trim() ||
  readEnvExampleSyncUrl() ||
  "";

function readEnvExampleSyncUrl() {
  try {
    const env = readFileSync(join(root, ".env"), "utf8");
    const m = env.match(/^NEXT_PUBLIC_SURVEY_SYNC_URL=(.*)$/m);
    if (m?.[1]?.trim()) return m[1].trim();
  } catch {
    /* no .env */
  }
  return "";
}

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>ИИ в работе — опрос</title>
  <meta name="description" content="Исследование доступа к ИИ-сервисам из России. 3 минуты, без правильных ответов." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,600;7..72,700&family=Onest:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
:root{--paper:#f4f0e8;--paper-deep:#e8e2d6;--sheet:#fffdf9;--ink:#1f1a14;--ink-soft:#4a4339;--muted:#7a7267;--line:#d4cdc0;--accent:#1f4d3a;--accent-hover:#163a2c;--accent-tint:#e6efe9;--highlight:#c96b4a;--radius:2px;--font-serif:"Literata","Georgia",serif;--font-sans:"Onest",system-ui,sans-serif;--shadow-sheet:0 1px 0 rgba(31,26,20,.06),0 12px 40px rgba(31,26,20,.08);--page-pad-x:clamp(1rem,4.5vw,2rem);--page-pad-bottom:clamp(1.5rem,5vh,3rem);--survey-max:40rem;--touch-min:2.75rem}
*,*::before,*::after{box-sizing:border-box}
html{text-size-adjust:100%}
body{margin:0;min-height:100dvh;background:var(--paper);color:var(--ink);font-family:var(--font-sans);font-size:clamp(1rem,.95rem + .35vw,1.0625rem);line-height:1.55;-webkit-font-smoothing:antialiased;background-image:radial-gradient(ellipse 120% 80% at 50% -20%,#fff9f0 0,transparent 55%),linear-gradient(180deg,var(--paper) 0,#ebe5db 100%)}
a{color:var(--accent);text-decoration-thickness:1px;text-underline-offset:3px}
.shell{max-width:var(--survey-max);margin:0 auto;padding:clamp(.75rem,2vh,1rem) max(var(--page-pad-x),env(safe-area-inset-left)) max(var(--page-pad-bottom),env(safe-area-inset-bottom)) max(var(--page-pad-x),env(safe-area-inset-right));min-width:0}
.hidden{display:none!important}
.masthead{margin-bottom:1.5rem;padding-bottom:.75rem;border-bottom:1px solid var(--line)}
.masthead-tag{font-size:.72rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.kicker{margin:0 0 .5rem;font-size:.82rem;color:var(--muted)}
.hero-title{margin:0 0 .75rem;font-family:var(--font-serif);font-size:clamp(1.55rem,5vw,2rem);font-weight:700;line-height:1.2;letter-spacing:-.02em}
.lead{margin:0 0 1.25rem;font-family:var(--font-serif);font-size:clamp(1rem,2.8vw,1.08rem);line-height:1.55;color:var(--ink-soft)}
.sheet{background:var(--sheet);border:1px solid var(--line);box-shadow:var(--shadow-sheet);padding:clamp(1.15rem,4vw,1.5rem)}
.sheet-intro{margin:0 0 1rem;color:var(--ink-soft);font-size:.95rem}
.actions{display:flex;flex-direction:column;gap:.65rem}
.btn-primary,.btn-secondary{display:flex;align-items:center;justify-content:center;min-height:var(--touch-min);padding:.85rem 1rem;font-size:.95rem;font-weight:600;border-radius:var(--radius);border:none;cursor:pointer;text-align:center;text-decoration:none;font-family:inherit}
.btn-primary{background:var(--accent);color:#f8f6f2}
.btn-primary:hover{background:var(--accent-hover)}
.btn-secondary{background:transparent;color:var(--accent);border:1px solid var(--line)}
.footnote{margin:1rem 0 0;font-size:.78rem;color:var(--muted)}
.footer{margin-top:2rem;font-size:.85rem;color:var(--muted);font-family:var(--font-serif)}
.header{margin-bottom:1.25rem;padding-bottom:.75rem;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:2;background:color-mix(in srgb,var(--paper) 92%,transparent);backdrop-filter:blur(8px);padding-top:max(.25rem,env(safe-area-inset-top))}
.back-link{display:inline-flex;align-items:center;min-height:var(--touch-min);font-size:.82rem;font-weight:500;color:var(--muted);background:none;border:none;cursor:pointer;font-family:inherit;padding:0}
.back-link:hover{color:var(--highlight)}
.progress-wrap{height:3px;background:var(--paper-deep);margin:.5rem 0}
.progress-bar{height:100%;background:var(--highlight);transition:width .3s ease}
.progress-label{font-size:.75rem;color:var(--muted);font-variant-numeric:tabular-nums}
.card{background:var(--sheet);border:1px solid var(--line);box-shadow:var(--shadow-sheet);padding:clamp(1.15rem,4vw,1.5rem) clamp(1rem,3.5vw,1.25rem)}
.section-intro{margin:0 0 1.25rem;padding:.85rem 0 .85rem 1rem;font-family:var(--font-serif);font-size:.95rem;line-height:1.55;color:var(--ink-soft);border-left:3px solid var(--highlight);background:linear-gradient(90deg,var(--accent-tint) 0%,transparent 100%)}
.step-label{margin:0 0 .35rem;font-size:.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.q-title{margin:0 0 .65rem;font-family:var(--font-serif);font-size:clamp(1.2rem,4vw + .5rem,1.45rem);font-weight:600;line-height:1.3}
.q-desc{margin:0 0 1.15rem;font-size:.92rem;color:var(--ink-soft)}
.option-list{list-style:none;margin:0 0 1.25rem;padding:0;border-top:1px solid var(--line)}
.option{display:flex;align-items:flex-start;gap:.75rem;padding:.85rem .15rem;min-height:var(--touch-min);border-bottom:1px solid var(--line);cursor:pointer}
.option:hover{background:rgba(31,77,58,.04)}
.option:has(input:checked){background:var(--accent-tint)}
.option input{margin-top:.2rem;accent-color:var(--accent);flex-shrink:0}
.option span{flex:1;font-size:.98rem;line-height:1.45}
.text-input,.textarea{width:100%;margin-bottom:1.15rem;padding:.75rem .85rem;font-family:var(--font-serif);font-size:max(1rem,16px);color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:var(--radius)}
.textarea{min-height:7rem;resize:vertical}
.text-input:focus,.textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-tint)}
.follow-up{margin-top:1.35rem;padding-top:1.25rem;border-top:1px solid var(--line)}
.follow-up h3{margin:0 0 .85rem;font-size:1rem;font-weight:600;color:var(--ink-soft)}
.scale-labels{display:flex;flex-direction:column;gap:.35rem;font-size:.72rem;color:var(--muted);margin-bottom:.85rem}
@media(min-width:420px){.scale-labels{flex-direction:row;justify-content:space-between}}
.scale-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(2.6rem,1fr));gap:.5rem;margin-bottom:1.25rem}
.scale-btn,.scale-btn-active{min-height:var(--touch-min);border-radius:var(--radius);border:1px solid var(--line);background:var(--paper);font-weight:600;cursor:pointer;font-family:inherit}
.scale-btn-active{background:var(--accent);border-color:var(--accent);color:#f8f6f2}
.field-label{display:block;margin-bottom:1rem;font-size:.85rem;font-weight:500;color:var(--muted)}
.field-label .text-input{margin-top:.35rem;margin-bottom:0}
.nav{margin-top:1.15rem;padding-top:1rem;border-top:1px dashed var(--line)}
.done-title{margin:0 0 .75rem;font-family:var(--font-serif);font-size:1.75rem;font-weight:600}
.done-text{margin:0 0 1rem;font-family:var(--font-serif);font-size:1.05rem;line-height:1.6;color:var(--ink-soft)}
.hint{font-size:.72rem;color:var(--muted);word-break:break-word}
.hint code{font-family:ui-monospace,monospace;background:var(--paper);padding:.1rem .35rem}
.export-actions{display:flex;flex-direction:column;gap:.5rem;margin-top:1rem}
.sync-note{font-size:.78rem;color:var(--highlight);margin-top:.5rem}
  </style>
</head>
<body>
  <div id="app" class="shell"></div>
  <script>
const SURVEY_SYNC_URL = ${JSON.stringify(SYNC_URL)};
const QUESTIONS = ${questionsJson};

const SESSION_KEY = "ai_survey_session_id";
const STATE_KEY = "ai_survey_state";

function isEndedEarly(a) {
  return a.q2?.selected?.includes("none") ?? false;
}
function getVisibleQuestions(answers) {
  return QUESTIONS.filter((q) => {
    if (q.bundleWith) return false;
    if (q.id === "q1" || q.id === "q2") return true;
    if (isEndedEarly(answers)) return false;
    return true;
  });
}
function getBundled(hostId) {
  return QUESTIONS.find((q) => q.bundleWith === hostId);
}
function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY) || "null");
  } catch {
    return null;
  }
}
function saveState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

const app = document.getElementById("app");
let sessionId = getSessionId();
let answers = {};
let stepIndex = 0;
let completed = false;
let createdAt = new Date().toISOString();
let view = "landing";

const saved = loadState();
if (saved && saved.sessionId === sessionId) {
  answers = saved.answers || {};
  stepIndex = saved.stepIndex || 0;
  completed = !!saved.completed;
  createdAt = saved.createdAt || createdAt;
  if (completed) view = "done";
}

function persist(nextCompleted) {
  saveState({
    sessionId,
    stepIndex,
    answers,
    completed: nextCompleted,
    createdAt,
    updatedAt: new Date().toISOString(),
  });
}

async function syncToServer(nextCompleted) {
  if (!SURVEY_SYNC_URL) return { ok: false };
  const payload = {
    sessionId,
    answers,
    stepIndex,
    completed: nextCompleted,
    createdAt,
  };
  try {
    const res = await fetch(SURVEY_SYNC_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch {}
    return { ok: res.ok && data.ok !== false };
  } catch {
    return { ok: false };
  }
}

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function renderLanding(resume) {
  if (resume && !loadState()) {
    app.innerHTML = \`
      <div class="card">
        <h1 class="done-title">Нет сохранённого прогресса</h1>
        <p class="done-text">На этом устройстве мы не нашли начатый опрос.</p>
        <button type="button" class="btn-primary" data-action="start">Начать опрос</button>
      </div>\`;
    return;
  }
  app.innerHTML = \`
    <header class="masthead"><span class="masthead-tag">Независимое исследование</span></header>
    <p class="kicker">≈ 3 минуты · анонимно на устройстве</p>
    <h1 class="hero-title">ИИ в работе: что удобно, а что мешает?</h1>
    <p class="lead">Мы хотим понять, как люди используют ИИ в работе сегодня, чего им не хватает и что мешает пользоваться сильными AI-сервисами чаще.</p>
    <div class="sheet">
      <p class="sheet-intro">Правильных ответов нет. Можно прерваться и вернуться позже — прогресс сохранится в браузере.</p>
      <div class="actions">
        <button type="button" class="btn-primary" data-action="start">Начать опрос</button>
        <button type="button" class="btn-secondary" data-action="resume">Продолжить с того же места</button>
      </div>
    </div>
    <footer class="footer"><p>Ответы помогают понять реальный опыт, а не идеальную картинку из рекламы.</p></footer>\`;
}

function renderDone(syncOk) {
  const early = isEndedEarly(answers);
  app.innerHTML = \`
    <div class="card">
      <h1 class="done-title">Спасибо!</h1>
      <p class="done-text">\${early
        ? "Ответы сохранены. Если ситуация изменится — опрос можно пройти снова."
        : "Ваши ответы сохранены. Они помогут понять, как люди реально пользуются ИИ из России."}</p>
      \${SURVEY_SYNC_URL && !syncOk ? '<p class="sync-note">Не удалось отправить ответы на сервер.</p>' : ''}
      <div class="export-actions">
        <button type="button" class="btn-secondary" data-action="restart">Пройти заново</button>
      </div>
    </div>\`;
}

function renderQuestion() {
  const visible = getVisibleQuestions(answers);
  const q = visible[stepIndex];
  if (!q) {
    if (stepIndex !== 0 && visible.length) {
      stepIndex = 0;
      renderQuestion();
    }
    return;
  }
  const progress = Math.round(((stepIndex + 1) / visible.length) * 100);
  const bundled = getBundled(q.id);
  const descHtml = q.section === "scenario"
    ? (q.description || "").split(/\\n\\n/).filter(Boolean).map((part) => '<p class="q-desc">' + esc(part) + '</p>').join('')
    : (q.description ? '<p class="q-desc">' + esc(q.description) + '</p>' : '');

  let body = '';
  const val = answers[q.id];

  if (q.type === 'multi') {
    const selected = val?.selected || [];
    const other = val?.other || '';
    body = '<ul class="option-list">' + (q.options||[]).map(o => \`
      <li><label class="option"><input type="checkbox" data-opt="\${o.id}" \${selected.includes(o.id)?'checked':''} /><span>\${esc(o.label)}</span></label></li>\`).join('') + '</ul>';
    if (q.otherField) body += \`<input class="text-input other-field \${selected.includes('other')?'':'hidden'}" placeholder="Уточните" value="\${esc(other)}" />\`;
    const ends = (q.options||[]).some(o => selected.includes(o.id) && o.endsSurvey);
    body += \`<button type="button" class="btn-primary continue" \${selected.length?'':'disabled'}>\${ends?'Завершить опрос':'Далее'}</button>\`;
  } else if (q.type === 'single' && bundled?.type === 'text') {
    const selected = val?.selected || '';
    const contact = answers[bundled.id]?.text || '';
    const when = q.showBundledWhenOption || 'yes';
    const needs = selected === when;
    body = '<ul class="option-list">' + (q.options||[]).map(o => \`
      <li><label class="option"><input type="radio" name="q" data-opt="\${o.id}" \${selected===o.id?'checked':''} /><span>\${esc(o.label)}</span></label></li>\`).join('') + '</ul>';
    body += \`<div class="follow-up invite-contact \${needs ? '' : 'hidden'}"><p class="q-desc">\${esc(bundled.title)}</p>
      <input class="text-input invite-field" placeholder="\${esc(bundled.placeholder||'')}" value="\${esc(contact)}" /></div>\`;
    const ok = selected && (!needs || contact.trim());
    body += \`<button type="button" class="btn-primary continue-invite" \${ok ? '' : 'disabled'}>\${needs ? 'Отправить' : 'Завершить опрос'}</button>\`;
  } else if (q.type === 'single') {
    const selected = val?.selected || '';
    const other = val?.other || '';
    body = '<ul class="option-list">' + (q.options||[]).map(o => \`
      <li><label class="option"><input type="radio" name="q" data-opt="\${o.id}" \${selected===o.id?'checked':''} /><span>\${esc(o.label)}</span></label></li>\`).join('') + '</ul>';
    if (q.otherField) body += \`<input class="text-input other-field \${selected==='other'?'':'hidden'}" placeholder="Уточните" value="\${esc(other)}" />\`;
    body += \`<button type="button" class="btn-primary continue" \${selected ? '' : 'disabled'}>Далее</button>\`;
  } else if (q.type === 'text' && bundled?.type === 'single') {
    const text = val?.text || '';
    const action = answers[bundled.id] || {};
    const sel = action.selected || '';
    const other = action.other || '';
    body = \`<textarea class="textarea story">\${esc(text)}</textarea>
      <div class="follow-up"><h3>\${esc(bundled.title)}</h3>
      <ul class="option-list">\${(bundled.options||[]).map(o => \`
        <li><label class="option"><input type="radio" name="fu" data-opt="\${o.id}" \${sel===o.id?'checked':''} /><span>\${esc(o.label)}</span></label></li>\`).join('')}</ul>
      \${bundled.otherField ? \`<input class="text-input fu-other \${sel==='other'?'':'hidden'}" placeholder="Уточните" value="\${esc(other)}" />\` : ''}</div>
      <button type="button" class="btn-primary continue-incident" \${text.trim() && sel ? '' : 'disabled'}>Далее</button>\`;
  } else if (q.type === 'text') {
    const text = val?.text || '';
    body = \`<textarea class="textarea story" placeholder="\${esc(q.placeholder||'')}" >\${esc(text)}</textarea>
      <button type="button" class="btn-primary continue" \${text.trim() ? '' : 'disabled'}>Далее</button>\`;
  } else if (q.type === 'scale') {
    const min = q.min ?? 1, max = q.max ?? 5;
    const cur = val?.value;
    let pts = '';
    for (let i = min; i <= max; i++) pts += \`<button type="button" class="scale-btn \${cur===i?'scale-btn-active':''}" data-scale="\${i}">\${i}</button>\`;
    body = \`<div class="scale-labels"><span>\${esc(q.minLabel||'')}</span><span>\${esc(q.maxLabel||'')}</span></div>
      <div class="scale-row">\${pts}</div>
      <button type="button" class="btn-primary continue" \${cur !== undefined ? '' : 'disabled'}>Далее</button>\`;
  } else if (q.type === 'contact') {
    const tg = val?.telegram || '', em = val?.email || '';
    body = \`<h2 class="q-title">Как с вами связаться?</h2><p class="q-desc">Укажите Telegram или email — что удобнее</p>
      <label class="field-label">Telegram<input class="text-input tg" placeholder="@username" value="\${esc(tg)}" /></label>
      <label class="field-label">Email<input class="text-input em" type="email" placeholder="you@example.com" value="\${esc(em)}" /></label>
      <button type="button" class="btn-primary continue-contact" \${tg.trim() || em.trim() ? '' : 'disabled'}>Завершить</button>\`;
  }

  app.innerHTML = \`
    <header class="header">
      <button type="button" class="back-link" data-action="home">← На главную</button>
      <div class="progress-wrap"><div class="progress-bar" style="width:\${progress}%"></div></div>
      <span class="progress-label">\${stepIndex + 1} / \${visible.length}</span>
    </header>
    <div class="card">
      <p class="step-label">Вопрос \${stepIndex + 1}</p>
      \${q.type !== 'contact' ? (q.section === 'scenario' ? descHtml : '') + \`<h2 class="q-title">\${esc(q.title)}</h2>\` + (q.section === 'scenario' ? '' : descHtml) : ''}
      \${body}
      <div class="nav"><button type="button" class="back-link" data-action="back" \${stepIndex===0?'disabled':''}>Назад</button></div>
    </div>\`;

  wireQuestionHandlers(q, bundled);
}

function wireQuestionHandlers(q, bundled) {
  const visible = () => getVisibleQuestions(answers);

  app.querySelector('[data-action="home"]')?.addEventListener('click', () => { view = 'landing'; renderLanding(false); });
  app.querySelector('[data-action="back"]')?.addEventListener('click', () => {
    if (stepIndex > 0) { stepIndex--; persist(false); renderQuestion(); }
  });

  const updateContinue = () => {
    const btn = app.querySelector('.continue');
    if (!btn) return;
    if (q.type === 'multi') {
      const sel = [...app.querySelectorAll('input[type=checkbox]:checked')].map(el => el.dataset.opt);
      btn.disabled = !sel.length;
      btn.textContent = (q.options||[]).some(o => sel.includes(o.id) && o.endsSurvey) ? 'Завершить опрос' : 'Далее';
    }
  };

  if (q.type === 'multi') {
    const otherIn = app.querySelector('.other-field');
    app.querySelectorAll('input[type=checkbox]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const opts = q.options || [];
        let sel = [...app.querySelectorAll('input[type=checkbox]:checked')].map(el => el.dataset.opt);
        const opt = opts.find(o => o.id === inp.dataset.opt);
        if (opt?.exclusive) {
          app.querySelectorAll('input[type=checkbox]').forEach(c => { c.checked = c.dataset.opt === inp.dataset.opt; });
          sel = [inp.dataset.opt];
        } else {
          sel = sel.filter(id => !opts.find(o => o.id === id)?.exclusive);
          if (inp.checked && !sel.includes(inp.dataset.opt)) sel.push(inp.dataset.opt);
          if (!inp.checked) sel = sel.filter(id => id !== inp.dataset.opt);
          app.querySelectorAll('input[type=checkbox]').forEach(c => {
            if (opts.find(o => o.id === c.dataset.opt)?.exclusive) c.checked = false;
          });
        }
        answers[q.id] = { selected: sel, other: otherIn?.value || '' };
        if (otherIn) otherIn.classList.toggle('hidden', !sel.includes('other'));
        updateContinue();
        persist(false);
      });
    });
    otherIn?.addEventListener('input', () => {
      const sel = answers[q.id]?.selected || [];
      answers[q.id] = { selected: sel, other: otherIn.value };
      persist(false);
    });
    app.querySelector('.continue')?.addEventListener('click', () => goNext(q));
  }

  if (q.type === 'single' && bundled?.type === 'text') {
    const when = q.showBundledWhenOption || 'yes';
    const contactWrap = app.querySelector('.invite-contact');
    const contactIn = app.querySelector('.invite-field');
    const btn = app.querySelector('.continue-invite');
    const check = () => {
      const sel = app.querySelector('input[name=q]:checked')?.dataset.opt || '';
      const needs = sel === when;
      contactWrap?.classList.toggle('hidden', !needs);
      const contact = contactIn?.value?.trim() || '';
      if (btn) {
        btn.disabled = !sel || (needs && !contact);
        btn.textContent = needs ? 'Отправить' : 'Завершить опрос';
      }
    };
    app.querySelectorAll('input[name=q]').forEach((inp) => {
      inp.addEventListener('change', () => {
        answers[q.id] = { selected: inp.dataset.opt, other: '' };
        check();
        persist(false);
      });
    });
    contactIn?.addEventListener('input', () => {
      answers[bundled.id] = { text: contactIn.value };
      check();
      persist(false);
    });
    btn?.addEventListener('click', () => {
      const sel = answers[q.id]?.selected || '';
      if (sel === when) {
        answers[bundled.id] = { text: (contactIn?.value || '').trim() };
      } else {
        answers[bundled.id] = { text: '' };
      }
      goNext(q);
    });
  } else if (q.type === 'single') {
    const otherIn = app.querySelector('.other-field');
    app.querySelectorAll('input[type=radio]').forEach((inp) => {
      inp.addEventListener('change', () => {
        answers[q.id] = { selected: inp.dataset.opt, other: otherIn?.value || '' };
        if (otherIn) otherIn.classList.toggle('hidden', inp.dataset.opt !== 'other');
        app.querySelector('.continue').disabled = false;
        persist(false);
      });
    });
    otherIn?.addEventListener('input', () => {
      answers[q.id] = { ...answers[q.id], other: otherIn.value };
      persist(false);
    });
    app.querySelector('.continue')?.addEventListener('click', () => goNext(q));
  }

  if (q.type === 'text' && bundled) {
    const story = app.querySelector('.story');
    const fuOther = app.querySelector('.fu-other');
    const check = () => {
      const sel = app.querySelector('input[name=fu]:checked')?.dataset.opt || '';
      app.querySelector('.continue-incident').disabled = !story.value.trim() || !sel;
    };
    story?.addEventListener('input', check);
    app.querySelectorAll('input[name=fu]').forEach(inp => {
      inp.addEventListener('change', () => {
        answers[bundled.id] = { selected: inp.dataset.opt, other: fuOther?.value || '' };
        if (fuOther) fuOther.classList.toggle('hidden', inp.dataset.opt !== 'other');
        check();
        persist(false);
      });
    });
    fuOther?.addEventListener('input', () => {
      const sel = answers[bundled.id]?.selected || '';
      answers[bundled.id] = { selected: sel, other: fuOther.value };
      persist(false);
    });
    app.querySelector('.continue-incident')?.addEventListener('click', () => {
      answers[q.id] = { text: story.value.trim() };
      const sel = app.querySelector('input[name=fu]:checked')?.dataset.opt;
      answers[bundled.id] = { selected: sel, other: fuOther?.value || '' };
      goNext(q);
    });
  } else if (q.type === 'text') {
    const story = app.querySelector('.story');
    story?.addEventListener('input', () => {
      app.querySelector('.continue').disabled = !story.value.trim();
      answers[q.id] = { text: story.value };
      persist(false);
    });
    app.querySelector('.continue')?.addEventListener('click', () => {
      answers[q.id] = { text: story.value.trim() };
      goNext(q);
    });
  }

  if (q.type === 'scale') {
    app.querySelectorAll('[data-scale]').forEach(btn => {
      btn.addEventListener('click', () => {
        const n = +btn.dataset.scale;
        answers[q.id] = { value: n };
        app.querySelectorAll('[data-scale]').forEach(b => {
          b.classList.toggle('scale-btn-active', +b.dataset.scale === n);
          b.classList.toggle('scale-btn', +b.dataset.scale !== n);
        });
        app.querySelector('.continue').disabled = false;
        persist(false);
      });
    });
    app.querySelector('.continue')?.addEventListener('click', () => goNext(q));
  }

  if (q.type === 'contact') {
    const tg = app.querySelector('.tg'), em = app.querySelector('.em');
    const check = () => { app.querySelector('.continue-contact').disabled = !(tg.value.trim() || em.value.trim()); };
    tg?.addEventListener('input', check);
    em?.addEventListener('input', check);
    app.querySelector('.continue-contact')?.addEventListener('click', () => {
      answers[q.id] = { telegram: tg.value.trim(), email: em.value.trim() };
      finishSurvey();
    });
  }
}

async function goNext(q) {
  if (q.id === 'q2' && answers.q2?.selected?.includes('none')) {
    await finishSurvey();
    return;
  }
  const nextVisible = getVisibleQuestions(answers);
  const nextIndex = stepIndex + 1;
  if (nextIndex >= nextVisible.length) {
    await finishSurvey();
    return;
  }
  stepIndex = nextIndex;
  persist(false);
  renderQuestion();
}

async function finishSurvey() {
  completed = true;
  persist(true);
  const sync = await syncToServer(true);
  view = 'done';
  renderDone(sync.ok);
}

function wireGlobal() {
  app.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const action = t.dataset.action;
    if (action === 'start') {
      view = 'survey';
      stepIndex = 0;
      answers = {};
      completed = false;
      createdAt = new Date().toISOString();
      persist(false);
      renderQuestion();
    }
    if (action === 'resume') {
      const s = loadState();
      if (!s || s.completed) renderLanding(true);
      else { view = 'survey'; stepIndex = s.stepIndex || 0; answers = s.answers || {}; renderQuestion(); }
    }
    if (action === 'restart') {
      localStorage.removeItem(STATE_KEY);
      sessionId = getSessionId();
      answers = {}; stepIndex = 0; completed = false;
      createdAt = new Date().toISOString();
      view = 'landing';
      renderLanding(false);
    }
  });
}

wireGlobal();
if (view === 'done') renderDone(false);
else if (view === 'survey') renderQuestion();
else renderLanding(false);
  </script>
</body>
</html>`;

const outPath = join(root, "опрос-ии-standalone.html");
writeFileSync(outPath, html, "utf8");
console.log("Wrote", outPath, "(" + Math.round(html.length / 1024) + " KB)");
