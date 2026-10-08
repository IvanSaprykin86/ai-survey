"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getVisibleQuestions,
  isEndedEarly,
  resolveQuestionCopy,
} from "@/lib/survey/questions";
import {
  getOrCreateSessionId,
  loadSurveyState,
  saveSurveyState,
  type PersistedSurveyState,
} from "@/lib/survey/session";
import { scheduleSync } from "@/lib/survey/sync";
import type { SurveyQuestion } from "@/lib/survey/types";
import styles from "./SurveyWizard.module.css";
import { QuestionStep } from "./QuestionStep";

/** Задержка отправки, пока человек печатает; переходы между шагами уходят сразу. */
const TYPING_SYNC_DELAY_MS = 1200;

export function SurveyWizard() {
  const searchParams = useSearchParams();
  const resumeRequested = searchParams.get("resume") === "1";
  const [sessionId, setSessionId] = useState("");
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "error">(
    "idle",
  );
  const [hydrated, setHydrated] = useState(false);
  const createdAtRef = useRef<string>("");

  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
    const saved = loadSurveyState();
    const now = new Date().toISOString();
    if (saved && saved.sessionId === id) {
      const visible = getVisibleQuestions(saved.answers);
      const savedStep = saved.stepIndex ?? 0;
      setAnswers(saved.answers);
      setStepIndex(savedStep >= visible.length ? 0 : savedStep);
      setCompleted(saved.completed);
      const created = saved.createdAt || saved.updatedAt || now;
      setCreatedAt(created);
      createdAtRef.current = created;
    } else {
      createdAtRef.current = now;
      setCreatedAt(now);
    }
    setHydrated(true);
  }, []);

  const visibleQuestions = useMemo(
    () => getVisibleQuestions(answers),
    [answers],
  );

  const currentQuestion: SurveyQuestion | undefined = visibleQuestions[
    stepIndex
  ]
    ? resolveQuestionCopy(visibleQuestions[stepIndex], answers)
    : undefined;

  const progress = visibleQuestions.length
    ? Math.round(((stepIndex + (completed ? 1 : 0)) / visibleQuestions.length) * 100)
    : 0;

  const persist = useCallback(
    async (
      nextAnswers: Record<string, unknown>,
      nextStep: number,
      nextCompleted: boolean,
      delayMs = 0,
    ) => {
      const state: PersistedSurveyState = {
        sessionId,
        stepIndex: nextStep,
        answers: nextAnswers,
        completed: nextCompleted,
        createdAt: createdAtRef.current || createdAt,
        updatedAt: new Date().toISOString(),
      };
      saveSurveyState(state);
      if (!sessionId) return;
      setSyncStatus("saving");
      scheduleSync(
        {
          sessionId,
          answers: nextAnswers,
          stepIndex: nextStep,
          completed: nextCompleted,
          createdAt: createdAtRef.current || createdAt,
        },
        delayMs,
        (result) => setSyncStatus(result.ok ? "idle" : "error"),
      );
    },
    [sessionId, createdAt],
  );

  const setAnswer = useCallback(
    (questionId: string, value: unknown) => {
      const next = { ...answers, [questionId]: value };
      setAnswers(next);
      void persist(next, stepIndex, completed, TYPING_SYNC_DELAY_MS);
    },
    [answers, stepIndex, completed, persist],
  );

  const goNext = useCallback(
    async (valueFromStep?: unknown) => {
      const q = visibleQuestions[stepIndex];
      if (!q) return;

      const nextAnswers =
        valueFromStep !== undefined
          ? { ...answers, [q.id]: valueFromStep }
          : answers;
      if (valueFromStep !== undefined) {
        setAnswers(nextAnswers);
      }

      const ends =
        q.id === "q2" &&
        (nextAnswers.q2 as { selected?: string[] })?.selected?.includes("none");

      if (ends) {
        setCompleted(true);
        await persist(nextAnswers, stepIndex, true);
        return;
      }

      const nextVisible = getVisibleQuestions(nextAnswers);
      const nextIndex = stepIndex + 1;
      if (nextIndex >= nextVisible.length) {
        setCompleted(true);
        await persist(nextAnswers, nextIndex - 1, true);
        return;
      }
      setStepIndex(nextIndex);
      await persist(nextAnswers, nextIndex, false);
    },
    [answers, stepIndex, visibleQuestions, persist],
  );

  const goBack = () => {
    if (stepIndex > 0) {
      const next = stepIndex - 1;
      setStepIndex(next);
      void persist(answers, next, false);
    }
  };

  if (!hydrated) {
    return (
      <div className={styles.shell}>
        <p className={styles.loading}>Загрузка…</p>
      </div>
    );
  }

  if (resumeRequested && !loadSurveyState() && !completed) {
    return (
      <div className={styles.shell}>
        <div className={styles.card}>
          <h1 className={styles.doneTitle}>Нет сохранённого прогресса</h1>
          <p className={styles.doneText}>
            На этом устройстве мы не нашли начатый опрос. Можно начать сначала.
          </p>
          <Link href="/survey" className={styles.primaryBtn}>
            Начать опрос
          </Link>
        </div>
      </div>
    );
  }

  if (completed) {
    const early = isEndedEarly(answers);
    return (
      <div className={styles.shell}>
        <div className={styles.card}>
          <h1 className={styles.doneTitle}>Спасибо!</h1>
          <p className={styles.doneText}>
            {early
              ? "Ответы сохранены. Если ситуация изменится — опрос можно пройти снова."
              : "Ваши ответы сохранены. Они помогут понять, как люди реально пользуются ИИ из России."}
          </p>
          <Link href="/" className={styles.secondaryBtn}>
            На главную
          </Link>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const sectionLabel = `Вопрос ${stepIndex + 1}`;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.backHome}>На главную</Link>
        <div className={styles.progressWrap}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={styles.progressLabel}>
          {stepIndex + 1} / {visibleQuestions.length}
          {syncStatus === "saving" && " · сохраняем"}
          {syncStatus === "error" && " · ошибка сохранения"}
        </span>
      </header>

      <div className={styles.card}>
        <p className={styles.stepLabel}>{sectionLabel}</p>
        <QuestionStep
          question={currentQuestion}
          answers={answers}
          value={answers[currentQuestion.id]}
          onChange={(v) => setAnswer(currentQuestion.id, v)}
          onAnswer={setAnswer}
          onSubmit={goNext}
        />
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={goBack}
            disabled={stepIndex === 0}
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}
