export type SyncPayload = {
  sessionId: string;
  answers: Record<string, unknown>;
  stepIndex: number;
  completed: boolean;
  createdAt?: string;
};

export type SyncResult = { ok: boolean; error?: string };

export async function syncToServer(
  payload: SyncPayload,
): Promise<SyncResult> {
  const url = process.env.NEXT_PUBLIC_SURVEY_SYNC_URL?.trim();

  if (!url) {
    if (process.env.NODE_ENV === "development") {
      console.info("[survey sync dev]", payload);
      return { ok: true };
    }
    return { ok: false, error: "sync_url_missing" };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data: { ok?: boolean; error?: string } = {};
    try {
      data = JSON.parse(text) as { ok?: boolean; error?: string };
    } catch {
      /* Apps Script may wrap response */
    }
    if (!res.ok || data.ok === false) {
      return { ok: false, error: data.error || `http_${res.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "network" };
  }
}

/*
 * Очередь отправки: пока пользователь печатает, запросы не уходят на каждую
 * клавишу (задержка), и в полёте всегда не больше одного запроса — иначе
 * ответы могут прийти в таблицу не по порядку и старое состояние затрёт новое.
 */
let pending: SyncPayload | undefined;
let running = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let onResultLatest: ((result: SyncResult) => void) | undefined;

export function scheduleSync(
  payload: SyncPayload,
  delayMs: number,
  onResult: (result: SyncResult) => void,
): void {
  pending = payload;
  onResultLatest = onResult;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = undefined;
    void drain();
  }, delayMs);
}

async function drain(): Promise<void> {
  if (running) return; // текущий цикл подхватит pending после своего запроса
  running = true;
  try {
    while (pending) {
      const next = pending;
      pending = undefined;
      const result = await syncToServer(next);
      onResultLatest?.(result);
    }
  } finally {
    running = false;
  }
}
