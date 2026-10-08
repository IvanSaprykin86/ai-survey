/**
 * Приём ответов опроса с GitHub Pages → Google Sheets.
 *
 * 1. Создайте таблицу, укажите SPREADSHEET_ID и SHEET_NAME ниже.
 * 2. Extensions → Apps Script, вставьте этот файл.
 * 3. Deploy → New deployment → Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. URL веб-приложения → секрет SURVEY_SYNC_URL в GitHub (Settings → Secrets → Actions).
 *
 * Адрес веб-приложения виден в коде сайта, поэтому защищаемся на стороне скрипта:
 * ограничиваем размер и формат данных, экранируем формулы, сериализуем запись.
 */

const SPREADSHEET_ID = "PASTE_SPREADSHEET_ID";
const SHEET_NAME = "Responses";

/** Максимальный размер тела запроса и одной ячейки. */
const MAX_BODY_CHARS = 20000;
const MAX_CELL_CHARS = 2000;
const SESSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

/** Контакт (q12) сохраняется только при согласии респондента. */
const CONTACT_QUESTION_ID = "q12";
const CONTACT_CONSENT_ID = "q12_consent";

const QUESTION_IDS = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "q8",
  "q9",
  "q10",
  "q11",
  "q12",
];

const COLUMN_IDS = [
  "session_id",
  "created_at",
  "updated_at",
  "status",
  "current_step",
].concat(QUESTION_IDS);

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) || "";
    if (raw.length > MAX_BODY_CHARS) {
      return jsonResponse({ ok: false, error: "payload_too_large" });
    }
    const payload = JSON.parse(raw);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      upsertSurveyRow(payload);
    } finally {
      lock.releaseLock();
    }
    return jsonResponse({ ok: true });
  } catch (err) {
    console.error(err);
    return jsonResponse({ ok: false, error: "server_error" });
  }
}

function doGet() {
  return jsonResponse({ ok: true, message: "survey sync endpoint" });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Текст, начинающийся с = + - @ (или табуляции/перевода строки), таблица
 * выполнила бы как формулу. Апостроф заставляет считать значение текстом.
 */
function safeCell(value) {
  var s = String(value == null ? "" : value);
  if (s.length > MAX_CELL_CHARS) s = s.slice(0, MAX_CELL_CHARS);
  if (/^[=+\-@\t\r\n]/.test(s)) s = "'" + s;
  return s;
}

function isIsoDate(value) {
  return (
    typeof value === "string" &&
    value.length <= 40 &&
    !isNaN(new Date(value).getTime())
  );
}

function upsertSurveyRow(payload) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  ensureHeader(sheet);

  const sessionId = String((payload && payload.sessionId) || "").trim();
  if (!SESSION_ID_RE.test(sessionId)) throw new Error("bad sessionId");

  const answers =
    payload.answers && typeof payload.answers === "object" ? payload.answers : {};
  if (answers[CONTACT_CONSENT_ID] !== true) {
    delete answers[CONTACT_QUESTION_ID];
  }
  const stepIndex = Math.max(0, Math.min(100, Number(payload.stepIndex) || 0));
  const completed = Boolean(payload.completed);
  const now = new Date().toISOString();

  const early =
    answers.q2 &&
    Array.isArray(answers.q2.selected) &&
    answers.q2.selected.indexOf("none") !== -1;
  const status = completed ? (early ? "completed_early" : "completed") : "in_progress";

  const rowIndex = findRowBySessionId(sheet, sessionId);
  let createdAt = isIsoDate(payload.createdAt) ? payload.createdAt : now;
  if (rowIndex > 0) {
    const existing = sheet.getRange(rowIndex, 2).getValue();
    if (existing) createdAt = String(existing);
  }

  const row = buildRow({
    sessionId,
    createdAt,
    updatedAt: now,
    status,
    stepIndex,
    answers,
  }).map(safeCell);

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function ensureHeader(sheet) {
  const first = sheet.getRange(1, 1, 1, COLUMN_IDS.length).getValues()[0];
  if (first[0] === "session_id") return;
  sheet.getRange(1, 1, 1, COLUMN_IDS.length).setValues([COLUMN_IDS]);
}

function findRowBySessionId(sheet, sessionId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === sessionId) return i + 2;
  }
  return -1;
}

function buildRow(ctx) {
  const byId = {
    session_id: ctx.sessionId,
    created_at: ctx.createdAt,
    updated_at: ctx.updatedAt,
    status: ctx.status,
    current_step: String(ctx.stepIndex),
  };
  for (var i = 0; i < QUESTION_IDS.length; i++) {
    var qid = QUESTION_IDS[i];
    byId[qid] = formatAnswer(ctx.answers[qid]);
  }
  return COLUMN_IDS.map(function (col) {
    return byId[col] !== undefined ? byId[col] : "";
  });
}

function formatAnswer(value) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value.value === "number") return String(value.value);
  if (value.telegram || value.email) {
    var parts = [];
    if (value.telegram) parts.push("tg:" + value.telegram);
    if (value.email) parts.push("email:" + value.email);
    return parts.join("; ");
  }
  if (Array.isArray(value.selected)) {
    var s = value.selected.join(", ");
    if (value.other) s += " | другое: " + value.other;
    return s;
  }
  if (typeof value.selected === "string") {
    var s2 = value.selected;
    if (value.other) s2 += " | другое: " + value.other;
    return s2;
  }
  if (value.text != null) return String(value.text);
  return JSON.stringify(value);
}
