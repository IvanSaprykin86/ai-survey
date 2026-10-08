"use client";

import type { ReactNode } from "react";
import {
  appendDictation,
  useSpeechRecognition,
} from "@/lib/speech/useSpeechRecognition";
import styles from "./SurveyWizard.module.css";

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={active ? styles.micIconActive : styles.micIcon}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M19 11v1a7 7 0 0 1-14 0v-1M12 18v3M8 21h8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

type BaseProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  voiceLabel?: string;
};

export function VoiceTextInput({
  value,
  onChange,
  placeholder,
  voiceLabel = "поле",
  type = "text",
}: BaseProps & { type?: string }) {
  const voice = useVoiceField(value, onChange, voiceLabel);

  return (
    <FieldShell voice={voice} multiline={false}>
      <input
        type={type}
        className={styles.textInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function VoiceTextArea({
  value,
  onChange,
  placeholder,
  voiceLabel = "ответ",
  rows = 5,
}: BaseProps & { rows?: number }) {
  const voice = useVoiceField(value, onChange, voiceLabel);

  return (
    <FieldShell voice={voice} multiline>
      <textarea
        className={styles.textarea}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

function useVoiceField(
  value: string,
  onChange: (v: string) => void,
  voiceLabel: string,
) {
  const { supported, listening, error, toggle } = useSpeechRecognition();

  const onMicClick = () => {
    toggle((spoken) => {
      onChange(appendDictation(value, spoken));
    });
  };

  return { supported, listening, error, onMicClick, voiceLabel };
}

function FieldShell({
  voice,
  multiline,
  children,
}: {
  voice: ReturnType<typeof useVoiceField>;
  multiline: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles.inputVoiceWrap}>
      <div
        className={
          multiline ? styles.inputVoiceInnerMultiline : styles.inputVoiceInner
        }
      >
        {children}
        {voice.supported && (
          <button
            type="button"
            className={
              voice.listening ? styles.micInFieldActive : styles.micInField
            }
            aria-pressed={voice.listening}
            aria-label={
              voice.listening
                ? `Остановить запись: ${voice.voiceLabel}`
                : `Голосовой ввод: ${voice.voiceLabel}`
            }
            onClick={voice.onMicClick}
          >
            <MicIcon active={voice.listening} />
          </button>
        )}
      </div>
      {voice.listening && (
        <p className={styles.voiceStatusInline}>Слушаю…</p>
      )}
      {voice.error && <p className={styles.voiceErrorInline}>{voice.error}</p>}
    </div>
  );
}
