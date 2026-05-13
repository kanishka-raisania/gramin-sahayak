/**
 * useVoice — Voice input (Web Speech API) + Text-to-Speech
 *
 * TTS priority:
 *   1. Sarvam AI API  — natural Indian-language voices (hi, ta, bn, pa, en)
 *   2. Browser SpeechSynthesis — automatic fallback if Sarvam fails / key not set
 *
 * TTS is ON by default. Also includes:
 *   - Best browser-voice selection per language
 *   - Chrome 15-second synthesis heartbeat fix
 *   - Markdown stripping before speech
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const speechLangMap: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  pa: "pa-IN",
  bn: "bn-IN",
  ta: "ta-IN",
};

/** Strip markdown so symbols aren't read aloud. */
function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")  // bold
    .replace(/\*(.*?)\*/g, "$1")       // italic
    .replace(/#{1,6}\s/g, "")          // headings
    .replace(/[•\-–]\s/g, "")         // bullets / dashes
    .replace(/`[^`]*`/g, "")          // inline code
    .replace(/\n{2,}/g, ". ")         // paragraph breaks → natural pause
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Pick the best browser voice for a language (used as fallback). */
function getBestVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const target = speechLangMap[lang] || "en-IN";
  const base   = target.split("-")[0];
  return (
    voices.find((v) => v.lang === target) ||
    voices.find((v) => v.lang.startsWith(base + "-") || v.lang === base) ||
    null
  );
}

/**
 * Decode a base64 WAV string and play it via HTMLAudioElement.
 * Returns a cleanup function that stops playback.
 */
function playBase64Wav(
  base64: string,
  onStart: () => void,
  onEnd: () => void
): () => void {
  const binary = atob(base64);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "audio/wav" });
  const url  = URL.createObjectURL(blob);
  const audio = new Audio(url);

  audio.onplay  = onStart;
  audio.onended = () => { URL.revokeObjectURL(url); onEnd(); };
  audio.onerror = () => { URL.revokeObjectURL(url); onEnd(); };
  audio.play().catch(onEnd);

  return () => {
    audio.pause();
    URL.revokeObjectURL(url);
    onEnd();
  };
}

interface UseVoiceOptions {
  language: string;
  onTranscript?: (text: string) => void;
}

export function useVoice({ language, onTranscript }: UseVoiceOptions) {
  const [isListening,  setIsListening]  = useState(false);
  const [isSpeaking,   setIsSpeaking]   = useState(false);
  // "sarvam" | "browser" | null — which engine is active this session
  const [ttsEngine,    setTtsEngine]    = useState<"sarvam" | "browser" | null>(null);

  // TTS ON by default (first launch); respects whatever the user last saved.
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem("gs-voice-mode");
      return stored === null ? true : stored === "true";
    } catch { return true; }
  });

  const recognitionRef  = useRef<any>(null);
  const synthRef        = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const heartbeatRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  // Cleanup function for the currently playing Sarvam audio
  const sarvamStopRef   = useRef<(() => void) | null>(null);

  const hasRecognition =
    typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const hasSynthesis =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // ── Stop all audio (Sarvam + browser synthesis) ──────────────────────────
  const stopAll = useCallback(() => {
    sarvamStopRef.current?.();
    sarvamStopRef.current = null;
    synthRef.current?.cancel();
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    setIsSpeaking(false);
  }, []);

  // ── Toggle TTS on/off ─────────────────────────────────────────────────────
  const toggleVoiceMode = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem("gs-voice-mode", String(next)); } catch {}
      if (!next) stopAll();
      return next;
    });
  }, [stopAll]);

  // ── Browser SpeechSynthesis fallback ──────────────────────────────────────
  const speakBrowser = useCallback(
    (text: string) => {
      if (!hasSynthesis || !synthRef.current) return;
      synthRef.current.cancel();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);

      const utterance   = new SpeechSynthesisUtterance(text.slice(0, 800));
      utterance.lang    = speechLangMap[language] || "en-IN";
      utterance.rate    = 0.88;
      utterance.pitch   = 1;
      const voice       = getBestVoice(language);
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setTtsEngine("browser");
        // Chrome 15-second heartbeat fix
        heartbeatRef.current = setInterval(() => {
          if (synthRef.current?.speaking) {
            synthRef.current.pause();
            synthRef.current.resume();
          } else {
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
          }
        }, 10_000);
      };

      const onDone = () => {
        setIsSpeaking(false);
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      };
      utterance.onend   = onDone;
      utterance.onerror = onDone;

      if (!voice && !window.speechSynthesis.getVoices().length) {
        const retry = () => {
          window.speechSynthesis.removeEventListener("voiceschanged", retry);
          const v = getBestVoice(language);
          if (v) utterance.voice = v;
          synthRef.current?.speak(utterance);
        };
        window.speechSynthesis.addEventListener("voiceschanged", retry);
      } else {
        synthRef.current.speak(utterance);
      }
    },
    [language, hasSynthesis]
  );

  // ── Sarvam AI TTS (primary) ───────────────────────────────────────────────
  const speakViaSarvam = useCallback(
    async (rawText: string): Promise<boolean> => {
      try {
        // Read gender preference set by the user in their Profile page
        const gender = (() => {
          try { return localStorage.getItem("gs-voice-gender") || "female"; } catch { return "female"; }
        })();

        const { data, error } = await supabase.functions.invoke("tts-sarvam", {
          body: { text: rawText, language, gender },
        });

        if (error || !data?.audio) {
          console.warn("Sarvam TTS unavailable:", error?.message ?? "no audio");
          return false;
        }

        // Stop anything already playing before starting new audio
        stopAll();

        const stopFn = playBase64Wav(
          data.audio,
          () => { setIsSpeaking(true); setTtsEngine("sarvam"); },
          () => { setIsSpeaking(false); sarvamStopRef.current = null; }
        );
        sarvamStopRef.current = stopFn;
        return true;
      } catch (e) {
        console.warn("Sarvam TTS error:", e);
        return false;
      }
    },
    [language, stopAll]
  );

  // ── Main speak() — tries Sarvam first, falls back to browser ─────────────
  const speak = useCallback(
    async (rawText: string) => {
      if (!voiceEnabled) return;
      const text = cleanForSpeech(rawText);
      if (!text) return;

      // Stop whatever is playing now
      stopAll();

      // Try Sarvam. If it fails (key not set, network error, etc.) use browser.
      const usedSarvam = await speakViaSarvam(text);
      if (!usedSarvam) {
        speakBrowser(text);
      }
    },
    [voiceEnabled, stopAll, speakViaSarvam, speakBrowser]
  );

  // ── Microphone (speech-to-text) ───────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!hasRecognition) return;
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang          = speechLangMap[language] || "en-IN";
    recognition.continuous    = false;
    recognition.interimResults = false;

    recognition.onstart  = () => setIsListening(true);
    recognition.onend    = () => setIsListening(false);
    recognition.onerror  = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript && onTranscript) onTranscript(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language, onTranscript, hasRecognition]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const stopSpeaking = useCallback(() => stopAll(), [stopAll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      stopAll();
    };
  }, [stopAll]);

  return {
    isListening,
    isSpeaking,
    ttsEngine,      // "sarvam" | "browser" | null — useful for debug/display
    voiceEnabled,
    hasRecognition,
    hasSynthesis,
    toggleVoiceMode,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
