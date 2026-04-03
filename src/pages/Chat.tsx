/**
 * Chat — AI chatbot with voice input/output, streaming, personalized context
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Bot, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useVoice } from "@/hooks/useVoice";
import type { TranslationKey } from "@/i18n/translations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import ChatMessageBubble from "@/components/ChatMessageBubble";

interface Message {
  text: string;
  sender: "user" | "bot";
}

function getSessionId(): string {
  let id = localStorage.getItem("gs-session-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("gs-session-id", id);
  }
  return id;
}

const Chat = () => {
  const { t, language } = useLanguage();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { text: getPersonalizedGreeting(), sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getSessionId());

  // Voice hook
  const voice = useVoice({
    language,
    onTranscript: (text) => {
      setInput(text);
      // Auto-send after voice input
      setTimeout(() => handleSend(text), 300);
    },
  });

  function getPersonalizedGreeting(): string {
    if (!profile?.name) return t("chatGreeting");
    const greetMap: Record<string, string> = {
      en: `Hello ${profile.name} ji! I am your Gramin Sahayak. How can I help you today?`,
      hi: `नमस्ते ${profile.name} जी! मैं आपका ग्रामीण सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?`,
      pa: `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${profile.name} ਜੀ! ਮੈਂ ਤੁਹਾਡਾ ਗ੍ਰਾਮੀਣ ਸਹਾਇਕ ਹਾਂ।`,
      bn: `নমস্কার ${profile.name} জি! আমি আপনার গ্রামীণ সহায়ক।`,
      ta: `வணக்கம் ${profile.name} ஜி! நான் உங்கள் கிராமிய உதவியாளர்.`,
    };
    return greetMap[language] || greetMap.en;
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = { text, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Stop any ongoing speech
    voice.stopSpeaking();

    const history = messages.slice(-10).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      text: m.text,
    }));

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          message: text,
          session_id: sessionId.current,
          language,
          history,
          user_context: profile ? {
            role: profile.role,
            state: profile.state,
            age_group: profile.age_group,
            gender: profile.gender,
            name: profile.name,
          } : undefined,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }
      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantText = "";
      let streamDone = false;

      setMessages((prev) => [...prev, { text: "", sender: "bot" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantText += content;
              const currentText = assistantText;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { text: currentText, sender: "bot" };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantText += content;
              const currentText = assistantText;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { text: currentText, sender: "bot" };
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }

      if (!assistantText) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { text: t("chatFallback" as TranslationKey), sender: "bot" };
          return updated;
        });
      }

      // Voice output — speak the response
      if (assistantText && voice.voiceEnabled) {
        // Strip markdown for speech
        const cleanText = assistantText.replace(/\*\*/g, "").replace(/[•\-]\s/g, "").slice(0, 500);
        voice.speak(cleanText);
      }
    } catch (e) {
      console.error("Chat error:", e);
      const errorMessage = e instanceof Error ? e.message : "Something went wrong";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      setMessages((prev) => [...prev, { text: errorMessage, sender: "bot" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQueries: Record<string, Record<string, string>> = {
    quickWage: { en: "Tell me about wages", hi: "मजदूरी के बारे में बताएं", pa: "ਮਜ਼ਦੂਰੀ ਬਾਰੇ ਦੱਸੋ", bn: "মজুরি সম্পর্কে বলুন", ta: "கூலி பற்றி சொல்லுங்கள்" },
    quickFarming: { en: "I need farming help", hi: "खेती में मदद चाहिए", pa: "ਖੇਤੀ ਵਿੱਚ ਮਦਦ ਚਾਹੀਦੀ", bn: "চাষে সাহায্য চাই", ta: "விவசாய உதவி தேவை" },
    quickRation: { en: "How to get ration card", hi: "राशन कार्ड कैसे बनवाएं", pa: "ਰਾਸ਼ਨ ਕਾਰਡ ਕਿਵੇਂ ਬਣਵਾਈਏ", bn: "রেশন কার্ড কীভাবে পাবো", ta: "ரேஷன் அட்டை எப்படி பெறுவது" },
    quickLegal: { en: "Tell me about my legal rights", hi: "मेरे कानूनी अधिकार बताएं", pa: "ਮੇਰੇ ਕਾਨੂੰਨੀ ਅਧਿਕਾਰ ਦੱਸੋ", bn: "আমার আইনি অধিকার বলুন", ta: "எனது சட்ட உரிமைகள் சொல்லுங்கள்" },
  };

  const quickActions = [
    { labelKey: "quickWage" as const, query: quickQueries.quickWage[language] || quickQueries.quickWage.en },
    { labelKey: "quickFarming" as const, query: quickQueries.quickFarming[language] || quickQueries.quickFarming.en },
    { labelKey: "quickRation" as const, query: quickQueries.quickRation[language] || quickQueries.quickRation.en },
    { labelKey: "quickLegal" as const, query: quickQueries.quickLegal[language] || quickQueries.quickLegal.en },
  ];

  const botAvatarSrc = (() => {
    let idx = sessionStorage.getItem("gs-avatar-idx");
    if (!idx) {
      idx = String(Math.floor(Math.random() * 5));
      sessionStorage.setItem("gs-avatar-idx", idx);
    }
    const avatarImports = [
      "/src/assets/avatar-farmer-1.jpg",
      "/src/assets/avatar-farmer-2.jpg",
      "/src/assets/avatar-farmer-3.jpg",
      "/src/assets/avatar-farmer-4.jpg",
      "/src/assets/avatar-farmer-5.jpg",
    ];
    return avatarImports[Number(idx)] || avatarImports[0];
  })();

  return (
    <div className="flex min-h-screen flex-col pb-20">
      {/* Header */}
      <div className="bg-primary px-4 py-3 text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary-foreground/30">
              <AvatarImage src={botAvatarSrc} alt="Assistant" />
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold">{t("chatTitle")}</h2>
              <p className="text-xs opacity-80">{t("chatSubtitle")}</p>
            </div>
          </div>

          {/* Voice mode toggle */}
          {voice.hasSynthesis && (
            <button
              onClick={voice.toggleVoiceMode}
              className={`rounded-full p-2.5 transition-colors ${
                voice.voiceEnabled
                  ? "bg-primary-foreground/30 text-primary-foreground"
                  : "bg-primary-foreground/10 text-primary-foreground/60"
              }`}
              title={voice.voiceEnabled ? "Voice ON" : "Voice OFF"}
            >
              {voice.voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="container mx-auto px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto">
          {quickActions.map(({ labelKey, query }) => (
            <button
              key={labelKey}
              onClick={() => handleSend(query)}
              disabled={isLoading}
              className="shrink-0 rounded-2xl bg-muted px-5 py-3 text-sm font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95 disabled:opacity-50 border border-border"
            >
              {t(labelKey as TranslationKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4 container mx-auto">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <ChatMessageBubble key={i} message={msg} />
          ))}

          {/* Typing indicator */}
          {isLoading && messages[messages.length - 1]?.sender === "user" && (
            <div className="flex items-end gap-2 animate-fade-in">
              <div className="shrink-0 rounded-full p-1.5 bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-card border border-border rounded-bl-sm">
                <p className="text-xs text-muted-foreground mb-1 font-medium">
                  {t("typingIndicator" as TranslationKey)}
                </p>
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input with voice */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-border bg-card px-4 py-3">
        <div className="container mx-auto flex items-center gap-2">
          {/* Mic button */}
          {voice.hasRecognition && (
            <button
              onClick={voice.isListening ? voice.stopListening : voice.startListening}
              disabled={isLoading}
              className={`rounded-full p-3 transition-all ${
                voice.isListening
                  ? "bg-destructive text-destructive-foreground animate-pulse shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              title={voice.isListening ? "Stop listening" : "Speak"}
            >
              {voice.isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={voice.isListening ? t("voiceListening" as TranslationKey) : t("chatPlaceholder")}
            disabled={isLoading}
            className="flex-1 rounded-full border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="rounded-full bg-primary p-3 text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>

        {/* Listening indicator */}
        {voice.isListening && (
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-destructive font-semibold animate-fade-in">
            <div className="flex gap-0.5">
              <span className="h-3 w-1 rounded-full bg-destructive animate-pulse" style={{ animationDelay: "0ms" }} />
              <span className="h-4 w-1 rounded-full bg-destructive animate-pulse" style={{ animationDelay: "100ms" }} />
              <span className="h-2 w-1 rounded-full bg-destructive animate-pulse" style={{ animationDelay: "200ms" }} />
              <span className="h-5 w-1 rounded-full bg-destructive animate-pulse" style={{ animationDelay: "300ms" }} />
              <span className="h-3 w-1 rounded-full bg-destructive animate-pulse" style={{ animationDelay: "400ms" }} />
            </div>
            {t("voiceListening" as TranslationKey)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
