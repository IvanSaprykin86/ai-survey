const SESSION_KEY = "ai_survey_session_id";
const STATE_KEY = "ai_survey_state";

export type PersistedSurveyState = {
  sessionId: string;
  stepIndex: number;
  answers: Record<string, unknown>;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function loadSurveyState(): PersistedSurveyState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedSurveyState;
  } catch {
    return null;
  }
}

export function saveSurveyState(state: PersistedSurveyState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export function clearSurveyState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STATE_KEY);
}
