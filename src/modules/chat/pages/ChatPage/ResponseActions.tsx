import { useState } from "react";
import { Copy, Shield, Check } from "lucide-react";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { ws, f } from "@/shared/utils/contentTokens";

interface ResponseActionsProps {
  timestamp: string;
  textContent: string;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function ResponseActions({ timestamp, textContent }: ResponseActionsProps) {
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);
  const [copyHover, setCopyHover] = useState(false);
  const [shieldHover, setShieldHover] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(textContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: "4px 0",
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
          width: isMobile ? 36 : "auto",
          height: isMobile ? 36 : "auto",
          color: copied ? ws.success : copyHover ? ws.secondary : ws.muted_text,
        }}
        aria-label="Copy response"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>

      <button
        onMouseEnter={() => setShieldHover(true)}
        onMouseLeave={() => setShieldHover(false)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: isMobile ? 36 : "auto",
          height: isMobile ? 36 : "auto",
          color: shieldHover ? ws.secondary : ws.muted_text,
        }}
        aria-label="Audit trail"
      >
        <Shield size={14} />
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
  );
}
