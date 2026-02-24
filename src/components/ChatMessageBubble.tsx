/**
 * ChatMessageBubble — Renders a single chat message
 * Bot messages: green-tinted, with avatar
 * User messages: white/card, right-aligned
 * Formats **bold** and bullet points
 */
import { Bot, User } from "lucide-react";

interface Message {
  text: string;
  sender: "user" | "bot";
}

/** Convert markdown-like formatting to simple HTML-safe rendering */
function formatMessageText(text: string): React.ReactNode[] {
  return text.split("\n").map((line, j) => {
    // Convert **bold** to <strong>
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, k) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={k}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    // Detect bullet lines
    const isBullet = line.trimStart().startsWith("•") || line.trimStart().startsWith("-");

    return (
      <p key={j} className={`${j > 0 ? "mt-1" : ""} ${isBullet ? "pl-1" : ""}`}>
        {parts}
      </p>
    );
  });
}

const ChatMessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.sender === "user";

  return (
    <div className={`flex items-end gap-2 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`shrink-0 rounded-full p-1.5 ${
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-card text-card-foreground border border-border rounded-br-sm"
            : "bg-primary/10 text-foreground border border-primary/20 rounded-bl-sm"
        }`}
      >
        {formatMessageText(message.text)}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
