#!/usr/bin/env node
/**
 * Generates a single-file HTML survey from lib/survey/questions.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const { SURVEY_QUESTIONS } = await import(
  join(root, "lib/survey/questions.ts")
);

const questionsForEmbed = SURVEY_QUESTIONS.map(
  ({ showIf, ...rest }) => rest,
);

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
:root {
  --paper: #f4f0e8;
  --paper-deep: #e8e2d6;
  --sheet: #fffdf9;
  --ink: #1f1a14;
  --ink-soft: #4a4339;
  --muted: #7a7267;
  --line: #d4cdc0;
  --accent: #1f4d3a;
  --accent-hover: #163a2c;
  --accent-tint: #e6efe9;
  --highlight: #c96b4a;
  --radius: 2px;
  --font-serif: "Literata", Georgia, serif;
  --font-sans: "Onest", system-ui, sans-serif;
  --shadow-sheet: 0 1px 0 rgba(31, 26, 20, 0.06), 0 12px 40px rgba(31, 26, 20, 0.08);
  --page-pad-x: clamp(1rem, 4.5vw, 2rem);
  --page-pad-bottom: clamp(1.5rem, 5vh, 3rem);
  --survey-max: 40rem;
  --touch-min: 2.75rem;
}
*, *::before, *::after { box-sizing: border-box; }
html { text-size-adjust: 100%; }
body {
  margin: 0;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: clamp(1rem, 0.95rem + 0.35vw, 1.0625rem);
  line-height: 1.55;
  background-image: radial-gradient(ellipse 120% 80% at 50% -20%, #fff9f0 0, transparent 55%),
    linear-gradient(180deg, var(--paper) 0, #ebe5db 100%);
}
.shell {
  max-width: var(--survey-max);
  margin: 0 auto;
  padding: clamp(0.75rem, 2vh, 1rem) var(--page-pad-x) max(var(--page-pad-bottom), env(safe-area-inset-bottom, 0px));
}
.header {
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 2;
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter: blur(8px);
}
.intro {
  margin: 0 0 0.5rem;
  font-size: 0.82rem;
  color: var(--muted);
}
.progress-wrap { height: 3px; background: var(--paper-deep); margin: 0.5rem 0; overflow: hidden; }
.progress-bar { height: 100%; background: var(--highlight); transition: width 0.3s ease; }
.progress-label { font-size: 0.75rem; color: var(--muted); font-variant-numeric: tabular-nums; }
.card {
  background: var(--sheet);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sheet);
  padding: clamp(1.15rem, 4vw, 1.5rem) clamp(1rem, 3.5vw, 1.25rem);
}
.step-label {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.title {
  margin: 0 0 0.65rem;
  font-family: var(--font-serif);
  font-size: clamp(1.2rem, 4vw + 0.5rem, 1.45rem);
  font-weight: 600;
  line-height: 1.3;
}
.desc { margin: 0 0 1.15rem; font-size: 0.92rem; color: var(--ink-soft); }
.section-intro {
  margin: 0 0 1.25rem;
  padding: 0.85rem 1rem;
  font-family: var(--font-serif);
  font-size: 0.95rem;
  color: var(--ink-soft);
  border-left: 3px solid var(--highlight);
  background: linear-gradient(90deg, var(--accent-tint) 0%, transparent 100%);
}
.option-list { list-style: none; margin: 0 0 1.25rem; padding: 0; border-top: 1px solid var(--line); }
.option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 0.15rem;
  min-height: var(--touch-min);
  border-bottom: 1px solid var(--line);
  cursor: pointer;
}
.option:hover { background: rgba(31, 77, 58, 0.04); }
.option:has(input:checked) { background: var(--accent-tint); }
.option input { margin-top: 0.2rem; accent-color: var(--accent); }
.follow-up-block { margin-top: 1.35rem; padding-top: 1.25rem; border-top: 1px solid var(--line); }
.follow-up-title { margin: 0 0 0.85rem; font-size: 1rem; font-weight: 600; color: var(--ink-soft); }
.text-input, .textarea {
  width: 100%;
  margin-bottom: 1.15rem;
  padding: 0.75rem 0.85rem;
  font-family: var(--font-serif);
  font-size: max(1rem, 16px);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--paper);
}
.textarea { min-height: 7rem; resize: vertical; }
.text-input:focus, .textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-tint);
}
.field-label { display: block; margin-bottom: 1rem; font-size: 0.85rem; font-weight: 500; color: var(--muted); }
.scale-labels { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.72rem; color: var(--muted); margin-bottom: 0.85rem; }
@media (min-width: 420px) {
  .scale-labels { flex-direction: row; justify-content: space-between; }
  .scale-labels span:last-child { text-align: right; max-width: 48%; }
}
.scale-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(2.6rem, 1fr));
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.scale-btn, .scale-btn-active {
  min-height: var(--touch-min);
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: var(--paper);
  font-weight: 600;
  cursor: pointer;
}
.scale-btn-active { background: var(--accent); border-color: var(--accent); color: #f8f6f2; }
.primary-btn {
  width: 100%;
  min-height: var(--touch-min);
  padding: 0.95rem 1rem;
  font-weight: 600;
  border: none;
  border-radius: var(--radius);
  background: var(--accent);
  color: #f8f6f2;
  cursor: pointer;
}
.primary-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.primary-btn:not(:disabled):hover { background: var(--accent-hover); }
.nav { margin-top: 1.15rem; padding-top: 1rem; border-top: 1px dashed var(--line); }
.back-btn {
  min-height: var(--touch-min);
  font-weight: 500;
  color: var(--muted);
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}
.back-btn:disabled { opacity: 0.3; cursor: not-allowed; text-decoration: none; }
.done-title { font-family: var(--font-serif); font-size: 1.75rem; margin: 0 0 0.75rem; }
.done-text { font-family: var(--font-serif); color: var(--ink-soft); line-height: 1.6; }
.session-hint { font-size: 0.72rem; color: var(--muted); word-break: break-word; }
.session-hint code { background: var(--paper); padding: 0.1rem 0.35rem; }
.actions { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem; }
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--touch-min);
  font-weight: 600;
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  cursor: pointer;
}
.sync-ok { color: var(--accent); font-size: 0.8rem; }
.sync-err { color: var(--highlight); font-size: 0.8rem; }
.hidden { display: none !important; }
  </style>
</head>
<body>
  <div class="shell" id="app"></div>
  <script>
  /** Вставьте URL веб-приложения Google Apps Script для записи в таблицу (как NEXT_PUBLIC_SURVEY_SYNC_URL) */
  const SURVEY_SYNC_URL = "";

  const SESSION_KEY = "ai_survey_session_id";
  const STATE_KEY = "ai_survey_state";

  const QUESTIONS = ${JSON.stringify(questionsForEmbed, null, 2)};

  function isEndedEarly(answers) {
    const q2 = answers.q2;
    return q2 && Array.isArray(q2.selected) && q2.selected.includes("none");
  }
  function isQuestionVisible(q, answers) {
    if (q.bundleWith) return false;
    if (q.id === "q1" || q.id === "q2") return true;
    if (isEndedEarly(answers)) return false;
    return true;
  }
  function getVisibleQuestions(answers) {
    return QUESTIONS.filter((q) => isQuestionVisible(q, answers));
  }
  function getBundled(hostId) {
    return QUESTIONS.find((q) => q.bundleWith === hostId);
  }
  function getOrCreateSessionId() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
  function saveState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }
  async function syncToServer(payload) {
    const url = (SURVEY_SYNC_URL || "").trim();
    if (!url) return { ok: false, skipped: true };
    try {
      const res = await fetch(url, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch {}
      if (!res.ok || data.ok === false) return { ok: false, error: data.error || "http_" + res.status };
      return { ok: true };
    } catch {
      return { ok: false, error: "network" };
    }
  }

  const state = {
    sessionId: getOrCreateSessionId(),
    answers: {},
    stepIndex: 0,
    completed: false,
    createdAt: new Date().toISOString(),
    syncStatus: "idle",
  };

  const saved = loadState();
  if (saved && saved.sessionId === state.sessionId) {
    state.answers = saved.answers || {};
    state.stepIndex = saved.stepIndex || 0;
    state.completed = !!saved.completed;
    state.createdAt = saved.createdAt || state.createdAt;
  }

  const app = document.getElementById("app");

  function persist() {
    saveState({
      sessionId: state.sessionId,
      stepIndex: state.stepIndex,
      answers: state.answers,
      completed: state.completed,
      createdAt: state.createdAt,
      updatedAt: new Date().toISOString(),
    });
  }

  async function persistAndSync() {
    persist();
    const payload = {
      sessionId: state.sessionId,
      answers: state.answers,
      stepIndex: state.stepIndex,
      completed: state.completed,
      createdAt: state.createdAt,
    };
    state.syncStatus = "saving";
    render();
    const result = await syncToServer(payload);
    state.syncStatus = result.ok ? "idle" : result.skipped ? "skipped" : "error";
    render();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function goNext(valueFromStep) {
    const visible = getVisibleQuestions(state.answers);
    const q = visible[state.stepIndex];
    if (!q) return;

    if (valueFromStep !== undefined) state.answers[q.id] = valueFromStep;

    if (q.id === "q2" && state.answers.q2?.selected?.includes("none")) {
      state.completed = true;
      void persistAndSync();
      return;
    }

    const nextVisible = getVisibleQuestions(state.answers);
    const nextIndex = state.stepIndex + 1;
    if (nextIndex >= nextVisible.length) {
      state.completed = true;
      void persistAndSync();
      return;
    }
    state.stepIndex = nextIndex;
    void persistAndSync();
  }

  function goBack() {
    if (state.stepIndex > 0) {
      state.stepIndex--;
      persist();
      render();
    }
  }

  function renderQuestion(q) {
    const bundled = getBundled(q.id);
    const val = state.answers[q.id];

    if (q.type === "text" && bundled && bundled.type === "single") {
      return renderIncidentStep(q, bundled);
    }
    if (q.type === "single" && bundled && bundled.type === "text") {
      return renderInviteStep(q, bundled);
    }
    switch (q.type) {
      case "multi": return renderMulti(q);
      case "single": return renderSingle(q);
      case "text": return renderText(q);
      case "scale": return renderScale(q);
      case "contact": return renderContact();
      default: return "";
    }
  }

  function renderMulti(q) {
    const v = state.answers[q.id] || { selected: [], other: "" };
    const opts = q.options || [];
    let html = '<ul class="option-list">';
    for (const o of opts) {
      const checked = v.selected.includes(o.id);
      html += '<li><label class="option"><input type="checkbox" data-q="' + q.id + '" data-opt="' + o.id + '" ' + (checked ? "checked" : "") + ' /><span>' + escapeHtml(o.label) + '</span></label></li>';
    }
    html += "</ul>";
    if (q.otherField && v.selected.includes("other")) {
      html += '<input class="text-input" data-other="' + q.id + '" placeholder="Уточните" value="' + escapeHtml(v.other || "") + '" />';
    }
    const ends = opts.some((o) => v.selected.includes(o.id) && o.endsSurvey);
    html += '<button type="button" class="primary-btn" data-submit="' + q.id + '" ' + (v.selected.length ? "" : "disabled") + '>' + (ends ? "Завершить опрос" : "Далее") + '</button>';
    return html;
  }

  function renderInviteStep(q, contactField) {
    const v = state.answers[q.id] || { selected: "", other: "" };
    const contact = state.answers[contactField.id] || { text: "" };
    const when = q.showBundledWhenOption || "yes";
    const needsContact = v.selected === when;
    let html = '<ul class="option-list">';
    for (const o of q.options || []) {
      html += '<li><label class="option"><input type="radio" name="' + q.id + '" data-q="' + q.id + '" data-single="' + o.id + '" ' + (v.selected === o.id ? "checked" : "") + ' /><span>' + escapeHtml(o.label) + '</span></label></li>';
    }
    html += "</ul>";
    if (needsContact) {
      html += '<div class="follow-up-block"><p class="follow-up-title">' + escapeHtml(contactField.title) + '</p>';
      html += '<input class="text-input" data-invite-contact="' + contactField.id + '" placeholder="' + escapeHtml(contactField.placeholder || "") + '" value="' + escapeHtml(contact.text || "") + '" /></div>';
    }
    const ok = v.selected && (!needsContact || contact.text?.trim());
    const label = needsContact ? "Отправить" : "Завершить опрос";
    html += '<button type="button" class="primary-btn" data-submit-invite="' + q.id + '" data-contact="' + contactField.id + '" data-when="' + when + '" ' + (ok ? "" : "disabled") + '>' + label + '</button>';
    return html;
  }

  function renderSingle(q) {
    const v = state.answers[q.id] || { selected: "", other: "" };
    let html = '<ul class="option-list">';
    for (const o of q.options || []) {
      html += '<li><label class="option"><input type="radio" name="' + q.id + '" data-q="' + q.id + '" data-single="' + o.id + '" ' + (v.selected === o.id ? "checked" : "") + ' /><span>' + escapeHtml(o.label) + '</span></label></li>';
    }
    html += "</ul>";
    if (q.otherField && v.selected === "other") {
      html += '<input class="text-input" data-other="' + q.id + '" placeholder="Уточните" value="' + escapeHtml(v.other || "") + '" />';
    }
    html += '<button type="button" class="primary-btn" data-submit="' + q.id + '" ' + (v.selected ? "" : "disabled") + '>Далее</button>';
    return html;
  }

  function renderText(q) {
    const v = state.answers[q.id] || { text: "" };
    let html = '<textarea class="textarea" data-text="' + q.id + '" placeholder="' + escapeHtml(q.placeholder || "") + '">' + escapeHtml(v.text || "") + '</textarea>';
    html += '<button type="button" class="primary-btn" data-submit="' + q.id + '" ' + (v.text?.trim() ? "" : "disabled") + '>Далее</button>';
    return html;
  }

  function renderIncidentStep(q, followUp) {
    const story = state.answers[q.id] || { text: "" };
    const action = state.answers[followUp.id] || { selected: "", other: "" };
    let html = '<textarea class="textarea" data-text="' + q.id + '" placeholder="' + escapeHtml(q.placeholder || "") + '">' + escapeHtml(story.text || "") + '</textarea>';
    html += '<div class="follow-up-block"><h3 class="follow-up-title">' + escapeHtml(followUp.title) + '</h3><ul class="option-list">';
    for (const o of followUp.options || []) {
      html += '<li><label class="option"><input type="radio" name="' + followUp.id + '" data-q="' + followUp.id + '" data-single="' + o.id + '" ' + (action.selected === o.id ? "checked" : "") + ' /><span>' + escapeHtml(o.label) + '</span></label></li>';
    }
    html += "</ul>";
    if (followUp.otherField && action.selected === "other") {
      html += '<input class="text-input" data-other="' + followUp.id + '" placeholder="Уточните" value="' + escapeHtml(action.other || "") + '" />';
    }
    html += "</div>";
    const ok = story.text?.trim() && action.selected;
    html += '<button type="button" class="primary-btn" data-submit-incident="' + q.id + '" data-follow="' + followUp.id + '" ' + (ok ? "" : "disabled") + '>Далее</button>';
    return html;
  }

  function renderScale(q) {
    const min = q.min ?? 1;
    const max = q.max ?? 5;
    const v = state.answers[q.id] || {};
    let html = '<div class="scale-labels"><span>' + escapeHtml(q.minLabel || "") + '</span><span>' + escapeHtml(q.maxLabel || "") + '</span></div><div class="scale-row">';
    for (let n = min; n <= max; n++) {
      const cls = v.value === n ? "scale-btn-active" : "scale-btn";
      html += '<button type="button" class="' + cls + '" data-scale="' + q.id + '" data-val="' + n + '">' + n + '</button>';
    }
    html += '</div><button type="button" class="primary-btn" data-submit="' + q.id + '" ' + (v.value !== undefined ? "" : "disabled") + '>Далее</button>';
    return html;
  }

  function renderContact() {
    const v = state.answers.q25_contact || { telegram: "", email: "" };
    const ok = (v.telegram || "").trim() || (v.email || "").trim();
    return (
      '<h2 class="title">Как с вами связаться?</h2>' +
      '<p class="desc">Укажите Telegram или email — что удобнее</p>' +
      '<label class="field-label">Telegram<input class="text-input" data-contact="telegram" placeholder="@username" value="' + escapeHtml(v.telegram || "") + '" /></label>' +
      '<label class="field-label">Email<input class="text-input" data-contact="email" type="email" placeholder="you@example.com" value="' + escapeHtml(v.email || "") + '" /></label>' +
      '<button type="button" class="primary-btn" data-submit="q25_contact" ' + (ok ? "" : "disabled") + '>Завершить</button>'
    );
  }

  function toggleMulti(qid, optId) {
    const q = QUESTIONS.find((x) => x.id === qid);
    const opts = q.options || [];
    const opt = opts.find((o) => o.id === optId);
    const cur = state.answers[qid] || { selected: [], other: "" };
    let selected = [...(cur.selected || [])];
    if (opt?.exclusive) {
      selected = [optId];
    } else {
      selected = selected.filter((s) => !opts.find((o) => o.id === s)?.exclusive);
      if (selected.includes(optId)) selected = selected.filter((s) => s !== optId);
      else selected.push(optId);
    }
    state.answers[qid] = { selected, other: cur.other || "" };
    persist();
    render();
  }

  function bindEvents() {
    app.querySelectorAll('input[type="checkbox"][data-q]').forEach((el) => {
      el.addEventListener("change", () => toggleMulti(el.dataset.q, el.dataset.opt));
    });
    app.querySelectorAll('input[type="radio"][data-single]').forEach((el) => {
      el.addEventListener("change", () => {
        const qid = el.dataset.q;
        const cur = state.answers[qid] || { other: "" };
        state.answers[qid] = { selected: el.dataset.single, other: cur.other || "" };
        persist();
        render();
      });
    });
    app.querySelectorAll("[data-other]").forEach((el) => {
      el.addEventListener("input", () => {
        const qid = el.dataset.other;
        const cur = state.answers[qid] || { selected: qid === "q25_contact" ? undefined : (Array.isArray(state.answers[qid]?.selected) ? state.answers[qid].selected : state.answers[qid]?.selected || "") };
        if (Array.isArray(cur.selected)) state.answers[qid] = { ...cur, other: el.value };
        else state.answers[qid] = { selected: cur.selected || "", other: el.value };
        persist();
        render();
      });
    });
    app.querySelectorAll("[data-text]").forEach((el) => {
      el.addEventListener("input", () => {
        state.answers[el.dataset.text] = { text: el.value };
        persist();
        const btn = app.querySelector('[data-submit="' + el.dataset.text + '"], [data-submit-incident="' + el.dataset.text + '"]');
        if (btn) btn.disabled = !el.value.trim();
      });
    });
    app.querySelectorAll("[data-scale]").forEach((el) => {
      el.addEventListener("click", () => {
        const qid = el.dataset.scale;
        state.answers[qid] = { value: Number(el.dataset.val) };
        persist();
        render();
      });
    });
    app.querySelectorAll("[data-contact]").forEach((el) => {
      el.addEventListener("input", () => {
        const cur = state.answers.q25_contact || { telegram: "", email: "" };
        cur[el.dataset.contact] = el.value;
        state.answers.q25_contact = cur;
        persist();
        render();
      });
    });
    app.querySelectorAll("[data-submit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.dataset.submit;
        if (qid === "q25_contact") {
          const v = state.answers.q25_contact;
          goNext({ telegram: (v.telegram || "").trim(), email: (v.email || "").trim() });
        } else goNext(state.answers[qid]);
      });
    });
    app.querySelectorAll("[data-submit-incident]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.dataset.submitIncident;
        const text = (state.answers[qid]?.text || "").trim();
        goNext({ text });
      });
    });
    app.querySelectorAll("[data-invite-contact]").forEach((el) => {
      el.addEventListener("input", () => {
        state.answers[el.dataset.inviteContact] = { text: el.value };
        persist();
        const btn = app.querySelector("[data-submit-invite]");
        if (!btn) return;
        const qid = btn.dataset.submitInvite;
        const when = btn.dataset.when || "yes";
        const sel = state.answers[qid]?.selected;
        const needs = sel === when;
        const text = (state.answers[el.dataset.inviteContact]?.text || "").trim();
        btn.disabled = !sel || (needs && !text);
      });
    });
    app.querySelectorAll("[data-submit-invite]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const qid = btn.dataset.submitInvite;
        const contactId = btn.dataset.contact;
        const when = btn.dataset.when || "yes";
        const v = state.answers[qid] || { selected: "", other: "" };
        if (v.selected === when) {
          const text = (state.answers[contactId]?.text || "").trim();
          state.answers[contactId] = { text };
        } else {
          state.answers[contactId] = { text: "" };
        }
        goNext(v);
      });
    });
    const back = app.querySelector("[data-back]");
    if (back) back.addEventListener("click", goBack);
    const restart = app.querySelector("[data-restart]");
    if (restart) restart.addEventListener("click", () => {
      if (!confirm("Начать опрос заново? Текущие ответы на этом устройстве будут сброшены.")) return;
      localStorage.removeItem(STATE_KEY);
      state.answers = {};
      state.stepIndex = 0;
      state.completed = false;
      state.createdAt = new Date().toISOString();
      render();
    });
  }

  function render() {
    if (state.completed) {
      const early = isEndedEarly(state.answers);
      let syncNote = "";
      if (state.syncStatus === "saving") syncNote = '<p class="sync-ok">Сохраняем ответы…</p>';
      else if (state.syncStatus === "error") syncNote = '<p class="sync-err">Не удалось отправить ответы на сервер.</p>';
      else if (state.syncStatus === "idle") syncNote = '<p class="sync-ok">Ответы отправлены.</p>';

      app.innerHTML =
        '<div class="card">' +
        '<h1 class="done-title">Спасибо!</h1>' +
        '<p class="done-text">' + (early
          ? "Ответы сохранены. Если ситуация изменится — опрос можно пройти снова."
          : "Ваши ответы сохранены. Они помогут понять, как люди реально пользуются ИИ из России.") + '</p>' +
        syncNote +
        '<div class="actions">' +
        '<button type="button" class="secondary-btn" data-restart>Начать заново</button>' +
        '</div></div>';
      bindEvents();
      return;
    }

    const visible = getVisibleQuestions(state.answers);
    const q = visible[state.stepIndex];
    if (!q) {
      app.innerHTML = "<p>Загрузка…</p>";
      return;
    }
    const progress = Math.round(((state.stepIndex + 1) / visible.length) * 100);
    let syncLabel = "";
    if (state.syncStatus === "saving") syncLabel = " · сохраняем";
    if (state.syncStatus === "error") syncLabel = " · ошибка сохранения";

    const descParts = (q.description || "").split(/\\n\\n/).filter(Boolean);
    const descHtml = q.section === "scenario"
      ? descParts.map((part) => '<p class="desc">' + escapeHtml(part) + '</p>').join("")
      : (q.description ? '<p class="desc">' + escapeHtml(q.description) + '</p>' : "");

    app.innerHTML =
      '<header class="header">' +
      '<p class="intro">Исследование доступа к ИИ из России · ~3 мин · без правильных ответов</p>' +
      '<div class="progress-wrap"><div class="progress-bar" style="width:' + progress + '%"></div></div>' +
      '<span class="progress-label">' + (state.stepIndex + 1) + " / " + visible.length + syncLabel + '</span>' +
      '</header>' +
      '<div class="card">' +
      '<p class="step-label">Вопрос ' + (state.stepIndex + 1) + '</p>' +
      (q.type === "contact" ? "" : (q.section === "scenario" ? descHtml : "") +
      '<h2 class="title">' + escapeHtml(q.title) + '</h2>' +
      (q.section === "scenario" ? "" : descHtml)) +
      renderQuestion(q) +
      '<div class="nav"><button type="button" class="back-btn" data-back ' + (state.stepIndex === 0 ? "disabled" : "") + '>Назад</button></div>' +
      '</div>';
    bindEvents();
  }

  render();
  </script>
</body>
</html>`;

const outPath = join(root, "opros-ii-standalone.html");
writeFileSync(outPath, html, "utf8");
console.log("Wrote", outPath, "(" + html.length + " bytes)");
