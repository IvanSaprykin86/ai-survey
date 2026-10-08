"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [i: number]: { transcript: string };
    };
  };
};

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionInstance)
  | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function useSpeechRecognition(options?: { lang?: string }) {
  const lang = options?.lang ?? "ru-RU";
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onFinalRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionCtor()));
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(
    (onFinal: (text: string) => void) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setError("Браузер не поддерживает голосовой ввод");
        return;
      }

      recognitionRef.current?.abort();

      const recognition = new Ctor();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;
      onFinalRef.current = onFinal;
      setError(null);

      recognition.onresult = (event) => {
        let finalChunk = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const piece = result[0]?.transcript ?? "";
          if (result.isFinal) {
            finalChunk += piece;
          }
        }
        if (finalChunk.trim()) {
          onFinalRef.current(finalChunk);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === "aborted" || event.error === "no-speech") return;
        setError(
          event.error === "not-allowed"
            ? "Нет доступа к микрофону"
            : "Не удалось распознать речь",
        );
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
        setListening(true);
      } catch {
        setError("Микрофон уже используется");
        setListening(false);
      }
    },
    [lang],
  );

  const toggle = useCallback(
    (onFinal: (text: string) => void) => {
      if (listening) {
        stop();
      } else {
        start(onFinal);
      }
    },
    [listening, start, stop],
  );

  return { supported, listening, error, toggle, stop };
}

export function appendDictation(current: string, segment: string): string {
  const s = segment.trim();
  if (!s) return current;
  if (!current.trim()) return s;
  const sep = /\s$/.test(current) ? "" : " ";
  return current + sep + s;
}
