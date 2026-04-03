/**
 * useVoice — Voice input (Web Speech API) and output (SpeechSynthesis)
 * Provides mic recording, speech-to-text, and text-to-speech
 */
import { useState, useCallback, useRef, useEffect } from "react";

// Language code mapping for speech recognition
const speechLangMap: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  pa: "pa-IN",
  bn: "bn-IN",
  ta: "ta-IN",
};

interface UseVoiceOptions {
  language: string;
  onTranscript?: (text: string) => void;
}

export function useVoice({ language, onTranscript }: UseVoiceOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    try { return localStorage.getItem("gs-voice-mode") === "true"; } catch { return false; }
  });
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(window.speechSynthesis);

  // Check browser support
  const hasRecognition = typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const hasSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;

  const toggleVoiceMode = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem("gs-voice-mode", String(next)); } catch {}
      return next;
    });
  }, []);

  const startListening = useCallback(() => {
    if (!hasRecognition) return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = speechLangMap[language] || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript && onTranscript) {
        onTranscript(transcript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language, onTranscript, hasRecognition]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!hasSynthesis || !voiceEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLangMap[language] || "en-IN";
    utterance.rate = 0.85; // Slow and clear for rural users
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, [language, voiceEnabled, hasSynthesis]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
    };
  }, []);

  return {
    isListening,
    isSpeaking,
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
