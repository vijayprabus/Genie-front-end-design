import { ws, f } from "@/shared/utils/contentTokens";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      padding: "8px 0",
    }}>
      <div style={{
        maxWidth: isUser ? 440 : "100%",
        padding: isUser ? "10px 16px" : "14px 18px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        backgroundColor: isUser ? ws.elevated : ws.surface,
        border: isUser ? "none" : `1px solid ${ws.divider}`,
      }}>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 400,
          color: ws.body, fontFamily: f, lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}>
          {content}
        </p>
      </div>
    </div>
  );
}
