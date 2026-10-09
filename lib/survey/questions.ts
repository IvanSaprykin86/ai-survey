import type { SurveyQuestion } from "./types";

function singleSelected(
  answers: Record<string, unknown>,
  id: string,
): string | undefined {
  const v = answers[id] as { selected?: string } | undefined;
  return v?.selected;
}

function multiSelected(
  answers: Record<string, unknown>,
  id: string,
): string[] {
  const v = answers[id] as { selected?: string[] } | undefined;
  return v?.selected ?? [];
}

export function isEndedEarly(answers: Record<string, unknown>): boolean {
  return multiSelected(answers, "q2").includes("none");
}

const afterUsage = (answers: Record<string, unknown>) => !isEndedEarly(answers);

const usesWorkAi = (answers: Record<string, unknown>) =>
  afterUsage(answers) && !multiSelected(answers, "q3").includes("no_work");

const showDelegateQuestion = (answers: Record<string, unknown>) =>
  usesWorkAi(answers);

const showBarrierQuestion = (answers: Record<string, unknown>) => {
  if (!usesWorkAi(answers)) return false;
  const q4 = singleSelected(answers, "q4");
  if (!q4) return false;
  return q4 !== "rather_no" && q4 !== "no_self" && q4 !== "already_doing";
};

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: "q1",
    title: "Сколько вам лет?",
    description: "Один вариант.",
    type: "single",
    options: [
      { id: "under_25", label: "До 25" },
      { id: "25_29", label: "25–29" },
      { id: "30_34", label: "30–34" },
      { id: "35_44", label: "35–44" },
      { id: "45_54", label: "45–54" },
      { id: "55_plus", label: "55 и старше" },
    ],
  },
  {
    id: "q2",
    title: "Какими чатами и ассистентами на базе ИИ вы пользовались за последние 30 дней?",
    description: "Речь о сервисах для текста и рабочих задач (чат, поиск, документы): ChatGPT, Claude, GigaChat и т.п. Не учитывайте здесь только генерацию картинок, видео или звука без чата. Можно выбрать несколько вариантов.",
    type: "multi",
    options: [
      { id: "chatgpt", label: "ChatGPT" },
      { id: "claude", label: "Claude" },
      { id: "gemini", label: "Gemini" },
      { id: "deepseek", label: "DeepSeek" },
      { id: "grok", label: "Grok" },
      { id: "daisygpt", label: "DaisyGPT" },
      { id: "gigachat", label: "GigaChat" },
      { id: "yandex", label: "Алиса / ЯндексGPT" },
      { id: "tg_bot", label: "Telegram-бот с AI" },
      { id: "foreign_other", label: "Другой зарубежный чат или ассистент на базе ИИ" },
      { id: "ru_other", label: "Другой российский чат или ассистент на базе ИИ" },
      { id: "none", label: "Не пользовался такими сервисами за последние 30 дней", exclusive: true, endsSurvey: true },
    ],
  },
  {
    id: "q3",
    title: "Для каких рабочих задач вы используете ИИ сейчас?",
    description: "Только рабочие сценарии с чатом или ассистентом (текст, файлы, анализ). Генерация картинок, видео или звука «для себя» сюда не относится. Можно выбрать несколько вариантов.",
    type: "multi",
    otherField: true,
    options: [
      { id: "texts", label: "Пишу или редактирую тексты" },
      { id: "search", label: "Ищу информацию в интернете" },
      { id: "docs", label: "Работаю с документами" },
      { id: "email", label: "Пишу письма и сообщения" },
      { id: "slides", label: "Делаю презентации" },
      { id: "tables", label: "Работаю с таблицами" },
      { id: "data", label: "Анализирую данные" },
      { id: "meeting", label: "Готовлюсь к встречам" },
      { id: "multi_files", label: "Обрабатываю несколько файлов" },
      { id: "research", label: "Провожу исследования" },
      { id: "repetitive", label: "Выполняю повторяющиеся рабочие задачи" },
      { id: "other", label: "Другая рабочая задача с ИИ" },
      { id: "no_work", label: "Не использую AI для работы", exclusive: true },
    ],
    showIf: afterUsage,
  },
  {
    id: "q4",
    title: "Бывают ли у вас рабочие задачи, которые вы хотели бы полностью поручить AI?",
    description: "Например: «Изучи сайты конкурентов, собери актуальные цены, сравни их с нашей таблицей и подготовь презентацию с выводами».\n\nВы ставите задачу один раз. AI сам несколько минут или дольше ищет информацию, открывает сайты, читает файлы, работает с таблицами и документами и возвращает готовый результат.",
    type: "single",
    options: [
      { id: "many", label: "Да, таких задач много" },
      { id: "several", label: "Да, есть несколько таких задач" },
      { id: "sometimes", label: "Иногда бывают" },
      { id: "already_doing", label: "Да, и я уже регулярно отдаю AI такие задачи целиком — меня результат устраивает" },
      { id: "rather_no", label: "Скорее нет" },
      { id: "no_self", label: "Нет, мне удобнее всё делать самому" },
    ],
    showIf: showDelegateQuestion,
  },
  {
    id: "q5",
    title: "Что больше всего мешает поручить такую задачу AI целиком?",
    description: "Один вариант.",
    type: "single",
    options: [
      { id: "micro_manage", label: "AI приходится контролировать и разбивать задачу на отдельные запросы" },
      { id: "no_finish", label: "AI не доводит последовательность действий до готового результата" },
      { id: "bad_files", label: "AI плохо работает с моими файлами, таблицами, документами или сайтами" },
      { id: "tried_bad", label: "Уже пробовал отдать задачу целиком, результат пришлось сильно переделывать" },
      { id: "no_trust", label: "Не готов полагаться на результат: без своей проверки отдавать нельзя" },
      { id: "no_barrier", label: "Ничего не мешает: уже отдаю такие задачи AI целиком, серьёзных сложностей нет" },
      { id: "dont_know_how", label: "Не знаю, как правильно поставить такую задачу" },
      { id: "chat_enough", label: "Мне достаточно обычного чата: спрашиваю, что делать, и дальше делаю сам" },
    ],
    showIf: showBarrierQuestion,
  },
  {
    id: "q6",
    title: "Как вы сейчас получаете доступ к зарубежным AI-сервисам?",
    description: "Например ChatGPT, Claude, Gemini, DeepSeek, Grok и другие. Один вариант.",
    type: "single",
    options: [
      { id: "ru_sub", label: "Официальная подписка, плачу российской картой" },
      { id: "foreign_sub", label: "Официальная подписка, плачу зарубежной картой" },
      { id: "intermediary_ok", label: "Посредник, готовая подписка или общий аккаунт, и последний месяц это работало стабильно" },
      { id: "intermediary_broken", label: "Посредник, готовая подписка или общий аккаунт, и за последний месяц доступ ломался" },
      { id: "free_only", label: "Только бесплатная версия: платную не могу нормально оплатить" },
      { id: "ru_enough", label: "Зарубежными не пользуюсь: хватает Алисы, GigaChat или другого российского сервиса" },
      { id: "no_access", label: "Зарубежными не пользуюсь: не могу получить доступ" },
    ],
    showIf: afterUsage,
  },
  {
    id: "q7",
    title: "Что сильнее ограничивает вашу работу с AI?",
    description: "Один вариант. Этот вопрос и разделяет два барьера.",
    type: "single",
    options: [
      { id: "access", label: "Доступ: VPN, оплата, посредник или нестабильный аккаунт" },
      { id: "behavior", label: "То, что AI не доводит задачу до результата и его приходится вести по шагам" },
      { id: "both", label: "И доступ, и отсутствие готового результата примерно в равной степени" },
      { id: "neither_ok", label: "Ни то ни другое: текущий способ меня устраивает" },
    ],
    showIf: afterUsage,
  },
  {
    id: "q8",
    title: "Если оставить привычный чат, убрать VPN и посредника и дать оплату российской картой, как изменится ваше использование?",
    description: "Один вариант.",
    type: "single",
    options: [
      { id: "more", label: "Буду пользоваться заметно чаще" },
      { id: "same", label: "Буду пользоваться так же, как сейчас" },
      { id: "fine_already", label: "Для меня ничего не меняется: я и так нормально захожу" },
      { id: "ru_enough", label: "Больше пользоваться не стану: текущего сервиса хватает" },
    ],
    showIf: afterUsage,
  },
  {
    id: "q9",
    title: "Как часто вы бы отдавали AI задачи «под ключ», если чат уже удобно открывать и платить?",
    description: "Удобный доступ — чат без VPN и посредника, с оплатой российской картой.\n\n«Под ключ» — вы один раз описываете задачу, а AI сам делает работу и отдаёт готовую таблицу, документ или презентацию, без пошаговых уточнений с вашей стороны.\n\nНасколько это для вас полезнее, чем просто спрашивать советы в чате? Один вариант.",
    type: "single",
    options: [
      { id: "weekly", label: "Буду отдавать такие задачи несколько раз в неделю или чаще" },
      { id: "monthly", label: "Буду отдавать такие задачи несколько раз в месяц" },
      { id: "try_once", label: "Скорее попробую один раз" },
      { id: "chat_enough", label: "Почти ничего не добавится: хватит обычного чата" },
      { id: "wont_use", label: "Не стану этим пользоваться" },
      { id: "already_doing", label: "Уже отдаю такие задачи регулярно, и меня результат устраивает" },
    ],
    showIf: afterUsage,
  },
  {
    id: "q10",
    title: "Хотели бы вы попробовать такой способ работы с AI?",
    description: "Представьте, что вы можете просто написать AI:\n\n«Изучи сайты конкурентов, собери информацию в таблицу и подготовь презентацию для руководителя».\n\nПосле этого вам не нужно каждый раз писать ему новые команды — AI сам выполняет необходимые действия и возвращает готовый результат.\n\nОдин вариант.",
    type: "single",
    options: [
      { id: "first", label: "Да, хотел бы попробовать одним из первых" },
      { id: "interested", label: "Да, мне это интересно" },
      { id: "maybe", label: "Возможно, если это будет хорошо работать" },
      { id: "no_need", label: "Пока не вижу необходимости" },
      { id: "chat_enough", label: "Нет, мне достаточно обычного AI-чата" },
      { id: "already_doing", label: "Уже работаю так и меня всё устраивает" },
    ],
    showIf: afterUsage,
  },
];

export function getVisibleQuestions(
  answers: Record<string, unknown>,
): SurveyQuestion[] {
  return SURVEY_QUESTIONS.filter((q) => {
    if (q.bundleWith) return false;
    return !q.showIf || q.showIf(answers);
  });
}

export function getBundledQuestion(
  hostId: string,
): SurveyQuestion | undefined {
  return SURVEY_QUESTIONS.find((q) => q.bundleWith === hostId);
}

export function resolveQuestionCopy(
  question: SurveyQuestion,
  answers: Record<string, unknown>,
): SurveyQuestion {
  const title = question.resolveTitle?.(answers) ?? question.title;
  const description =
    question.resolveDescription?.(answers) ?? question.description;
  if (title === question.title && description === question.description) {
    return question;
  }
  return { ...question, title, description };
}

export function formatAnswerForSheet(
  questionId: string,
  value: unknown,
): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  const v = value as Record<string, unknown>;
  if ("value" in v && typeof v.value === "number") {
    return String(v.value);
  }
  if ("telegram" in v || "email" in v) {
    const parts: string[] = [];
    if (v.telegram) parts.push(`tg:${v.telegram}`);
    if (v.email) parts.push(`email:${v.email}`);
    return parts.join("; ");
  }
  if (Array.isArray(v.selected)) {
    const labels = v.selected.join(", ");
    const other = v.other ? ` | другое: ${v.other}` : "";
    return labels + other;
  }
  if (typeof v.selected === "string") {
    const other = v.other ? ` | другое: ${v.other}` : "";
    return v.selected + other;
  }
  if (typeof v === "object" && "text" in v && v.text != null) {
    return String(v.text);
  }
  return JSON.stringify(value);
}

export const SHEET_COLUMN_IDS = [
  "session_id",
  "created_at",
  "updated_at",
  "status",
  "current_step",
  ...SURVEY_QUESTIONS.map((q) => q.id),
];
