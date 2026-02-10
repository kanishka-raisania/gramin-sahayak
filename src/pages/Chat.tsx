import { useState } from "react";
import { getChatResponse } from "@/data/api";
import { Send, Bot, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Message {
  text: string;
  sender: "user" | "bot";
}

// Voice input integration here later

const Chat = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { text: t("chatGreeting"), sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text) return;

    const userMsg: Message = { text, sender: "user" };
    const botResponse = getChatResponse(text);
    const botMsg: Message = { text: botResponse, sender: "bot" };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick action buttons for common queries
  const quickActions = [
    { labelKey: "quickWage" as const, query: "wage" },
    { labelKey: "quickFarming" as const, query: "farming" },
    { labelKey: "quickRation" as const, query: "ration" },
  ];

  return (
    <div className="flex min-h-screen flex-col pb-20">
      {/* Chat header */}
      <div className="bg-primary px-4 py-3 text-primary-foreground">
        <div className="container mx-auto flex items-center gap-2">
          <Bot className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-bold">💬 {t("chatTitle")}</h2>
            <p className="text-xs opacity-80">{t("chatSubtitle")}</p>
          </div>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="container mx-auto px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto">
          {quickActions.map(({ labelKey, query }) => (
            <button
              key={query}
              onClick={() => handleSend(query)}
              className="shrink-0 rounded-full bg-muted px-4 py-2.5 text-sm font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95"
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 container mx-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 animate-fade-in ${
              msg.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`shrink-0 rounded-full p-1.5 ${
                msg.sender === "user"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {msg.sender === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "bg-secondary text-secondary-foreground rounded-br-sm"
                  : "bg-card text-card-foreground border border-border rounded-bl-sm"
              }`}
            >
              {msg.text.split("\n").map((line, j) => (
                <p key={j} className={j > 0 ? "mt-1" : ""}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-border bg-card px-4 py-3">
        <div className="container mx-auto flex items-center gap-2">
          {/* Voice input button placeholder here later */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chatPlaceholder")}
            className="flex-1 rounded-full border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="rounded-full bg-primary p-3 text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
