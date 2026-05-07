import { useState } from "react";
import { Copy, RotateCcw, Check } from "lucide-react";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { ws, f } from "@/shared/utils/contentTokens";

interface UserBubbleProps {
  content: string;
  timestamp: string;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function UserBubble({ content, timestamp }: UserBubbleProps) {
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);
  const [copyHover, setCopyHover] = useState(false);
  const [retryHover, setRetryHover] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        padding: "8px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
        }}
      >
        <div
          style={{
            maxWidth: isMobile ? 280 : 440,
            backgroundColor: ws.divider,
            padding: "10px 16px",
            borderRadius: "18px 18px 4px 18px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: isMobile ? 14 : 13,
              fontWeight: 400,
              color: ws.body,
              fontFamily: f,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {content}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: "0 4px",
          }}
        >
          <button
            onClick={handleCopy}
            onMouseEnter={() => setCopyHover(true)}
            onMouseLeave={() => setCopyHover(false)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: isMobile ? 32 : "auto",
              height: isMobile ? 32 : "auto",
              color: copied ? ws.success : copyHover ? ws.secondary : ws.muted_text,
            }}
            aria-label="Copy message"
          >
            {copied ? (
              <Check size={14} />
            ) : (
              <Copy size={14} />
            )}
          </button>

          <button
            onMouseEnter={() => setRetryHover(true)}
            onMouseLeave={() => setRetryHover(false)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: isMobile ? 32 : "auto",
              height: isMobile ? 32 : "auto",
              color: retryHover ? ws.secondary : ws.muted_text,
            }}
            aria-label="Retry message"
          >
            <RotateCcw size={14} />
          </button>

          <span
            style={{
              fontSize: 11,
              color: ws.muted_text,
              fontFamily: f,
            }}
          >
            {formatTime(timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
