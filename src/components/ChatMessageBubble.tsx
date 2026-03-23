/**
 * ChatMessageBubble — Renders a single chat message
 * Bot messages: green-tinted, with random farmer avatar (persistent per session)
 * User messages: white/card, right-aligned
 * Formats **bold** and bullet points
 */
import { User } from "lucide-react";
import avatar1 from "@/assets/avatar-farmer-1.jpg";
import avatar2 from "@/assets/avatar-farmer-2.jpg";
import avatar3 from "@/assets/avatar-farmer-3.jpg";
import avatar4 from "@/assets/avatar-farmer-4.jpg";
import avatar5 from "@/assets/avatar-farmer-5.jpg";

interface Message {
  text: string;
  sender: "user" | "bot";
}

/** Pick a consistent avatar per session */
const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5];
function getSessionAvatar(): string {
  let idx = sessionStorage.getItem("gs-avatar-idx");
  if (!idx) {
    idx = String(Math.floor(Math.random() * avatars.length));
    sessionStorage.setItem("gs-avatar-idx", idx);
  }
  return avatars[Number(idx)] || avatars[0];
}
const botAvatar = getSessionAvatar();

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
      {/* Avatar */}
      {isUser ? (
        <div className="shrink-0 rounded-full p-1.5 bg-secondary text-secondary-foreground">
          <User className="h-4 w-4" />
        </div>
      ) : (
        <img
          src={botAvatar}
          alt="Assistant"
          className="shrink-0 h-8 w-8 rounded-full object-cover ring-2 ring-primary/30"
        />
      )}
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
