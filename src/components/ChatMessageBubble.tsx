/**
 * ChatMessageBubble — Renders a single chat message
 * Bot messages: green-tinted, with humanized avatar
 * User messages: white/card, right-aligned
 * Formats **bold** and bullet points
 */
import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  text: string;
  sender: "user" | "bot";
}

/** Pre-selected rural Indian farmer/worker profile images */
const AVATAR_IMAGES = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop&crop=face",
];

/** Get or set a consistent avatar index for this session */
function getAvatarIndex(): number {
  const stored = localStorage.getItem("gs-chat-avatar");
  if (stored !== null) {
    const idx = parseInt(stored);
    if (!isNaN(idx) && idx >= 0 && idx < AVATAR_IMAGES.length) return idx;
  }
  const idx = Math.floor(Math.random() * AVATAR_IMAGES.length);
  localStorage.setItem("gs-chat-avatar", String(idx));
  return idx;
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
  const avatarIdx = getAvatarIndex();

  return (
    <div className={`flex items-end gap-2 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <div className="shrink-0 rounded-full p-1.5 bg-secondary text-secondary-foreground">
          <User className="h-4 w-4" />
        </div>
      ) : (
        <Avatar className="h-8 w-8 shrink-0 border border-primary/30">
          <AvatarImage
            src={AVATAR_IMAGES[avatarIdx]}
            alt="Gramin Sahayak"
            className="object-cover"
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            GS
          </AvatarFallback>
        </Avatar>
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
