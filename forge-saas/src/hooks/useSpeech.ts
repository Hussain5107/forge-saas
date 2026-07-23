"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Chrome/Edge/Android expose speech recognition under a webkit-prefixed
// global; Safari (and therefore every iOS browser) never implemented it.
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionEventLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null;
}

export function useSpeech() {
  const [supportsSpeaking, setSupportsSpeaking] = useState(false);
  const [supportsListening, setSupportsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupportsSpeaking(typeof window !== "undefined" && "speechSynthesis" in window);
    setSupportsListening(getSpeechRecognitionCtor() !== null);
  }, []);

  const speak = useCallback((text: string, opts?: { interrupt?: boolean }) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (opts?.interrupt ?? true) window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancelSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  /** Listens for one utterance and resolves with the transcript, or rejects on error/timeout. */
  const listenOnce = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        reject(new Error("Speech recognition not supported in this browser."));
        return;
      }
      const recognition = new Ctor();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      const timeout = setTimeout(() => {
        recognition.stop();
        reject(new Error("Listening timed out."));
      }, 8000);

      recognition.onresult = (event) => {
        clearTimeout(timeout);
        const transcript = event.results[0]?.[0]?.transcript ?? "";
        resolve(transcript);
      };
      recognition.onerror = (event) => {
        clearTimeout(timeout);
        reject(event);
      };
      recognition.onend = () => clearTimeout(timeout);

      recognition.start();
    });
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { supportsSpeaking, supportsListening, speak, cancelSpeaking, listenOnce, stopListening };
}
