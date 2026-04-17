import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CaretDoubleLeft,
  X,
  ChatCircle,
  GitFork,
  FileCode,
} from "@phosphor-icons/react";
import { Copy, Check, ArrowUp, RotateCcw, SquarePen, ChevronsLeft, Shield, Paperclip, Mic, Sparkles, PanelLeftClose, PanelRightClose, Maximize2, GitBranch as LucideGitBranch, FileCode as LucideFileCode, FlaskConical, CircleCheck, BookOpen, TriangleAlert, PanelRightOpen, PanelLeftOpen, Plus, Minus, Scan, Brain, Plug, Layers, ChevronDown, Eye } from "lucide-react";
import { instructions } from "./instructionData";
import { ws as baseWs, f, spring } from "@/shared/utils/contentTokens";
import { ShimmerBar } from "@/shared/components/settings";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const mono = "'JetBrains Mono', 'Fira Code', 'Consolas', monospace";

const ws = {
  ...baseWs,
  page: "#EBE7E2",
  topBar: "#FFFDF9",
  statusBar: "#F5F0EB",
  gutter: "#C4B5B0",
  pillBg: "#E5E0DA",
  pillText: "#78716C",
};

const CHAT_W = 280;
const DAG_W = 480;
const STRIP_W = 36;

// ---------------------------------------------------------------------------
// PageSkeleton
// ---------------------------------------------------------------------------
function PageSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
        background: ws.page,
        fontFamily: f,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 48,
          background: ws.topBar,
          borderBottom: `1px solid ${ws.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <ShimmerBar width={28} height={28} radius={6} />
        <ShimmerBar width={140} height={16} radius={4} />
        <ShimmerBar width={40} height={18} radius={10} />
      </div>
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ width: CHAT_W, flexShrink: 0, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <ShimmerBar width="100%" height={20} radius={4} />
          <ShimmerBar width="80%" height={14} radius={4} />
          <ShimmerBar width="90%" height={14} radius={4} />
        </div>
        <div
          style={{
            flex: 1,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            borderLeft: `1px solid ${ws.border}`,
          }}
        >
          <ShimmerBar width="90%" height={12} radius={4} />
          <ShimmerBar width="70%" height={12} radius={4} />
          <ShimmerBar width="80%" height={12} radius={4} />
          <ShimmerBar width="50%" height={12} radius={4} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PanelStrip — collapsed panel indicator (36px wide vertical strip)
// ---------------------------------------------------------------------------
function PanelStrip({
  icon,
  label,
  side,
  onClick,
}: {
  icon: "chat" | "code" | "dag";
  label: string;
  side: "left" | "center" | "right";
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const iconColor = hovered ? ws.primary : ws.muted_text;

  const IdentityIcon =
    icon === "chat" ? (
      <Sparkles size={16} color={iconColor} />
    ) : icon === "code" ? (
      <LucideFileCode size={16} color={iconColor} />
    ) : (
      <LucideGitBranch size={16} color={iconColor} />
    );

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: STRIP_W,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 10,
        background: hovered ? ws.elevated : ws.surface,
        border: "none",
        cursor: "pointer",
        transition: "background 150ms ease",
        padding: "12px 0",
        borderRadius: 10,
      }}
    >
      <span style={{ transition: "transform 0.15s ease, color 0.15s ease", transform: hovered ? "scale(1.15)" : "scale(1)", display: "flex" }}>
        {IdentityIcon}
      </span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: hovered ? ws.primary : ws.muted_text,
          fontFamily: f,
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          letterSpacing: "0.02em",
          userSelect: "none",
          transition: "color 150ms ease",
        }}
      >
        {label}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Chat message types and mock data
// ---------------------------------------------------------------------------
interface EditorChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  title?: string; // optional bold title for assistant messages
  timestamp: string; // ISO string
}

const MOCK_MESSAGES: EditorChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    title: "Ready to help",
    content: "I can help you refine this instruction. What would you like to change?",
    timestamp: "2026-04-16T10:05:00Z",
  },
  {
    id: "2",
    role: "user",
    content: "Add a fraud detection step before risk scoring",
    timestamp: "2026-04-16T10:06:00Z",
  },
  {
    id: "3",
    role: "assistant",
    title: "Updated",
    content: "Fraud signal detection step added before Step 4. It will analyze behavioral patterns and device fingerprints.",
    timestamp: "2026-04-16T10:06:15Z",
  },
];

// ---------------------------------------------------------------------------
// formatTime helper
// ---------------------------------------------------------------------------
function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ---------------------------------------------------------------------------
// GhostButton — design system ghost button pattern
// ---------------------------------------------------------------------------
function GhostButton({
  onClick,
  ariaLabel,
  size = 22,
  children,
}: {
  onClick?: () => void;
  ariaLabel: string;
  size?: number;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={ariaLabel}
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.15s ease, color 0.15s ease",
        padding: 0,
        color: hovered ? ws.primary : ws.muted_text,
        transform: hovered ? "scale(1.15)" : "scale(1)",
      }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// EditorUserBubble — right-aligned user message with copy + retry + timestamp
// ---------------------------------------------------------------------------
function EditorUserBubble({ content, timestamp }: { content: string; timestamp: string }) {
  const [copied, setCopied] = useState(false);
  const [copyHovered, setCopyHovered] = useState(false);
  const [retryHovered, setRetryHovered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      {/* Bubble */}
      <div
        style={{
          maxWidth: "85%",
          padding: "10px 16px",
          borderRadius: "18px 18px 4px 18px",
          background: ws.divider,
          fontSize: 12,
          lineHeight: 1.4,
          color: ws.body,
          fontFamily: f,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content}
      </div>

      {/* Action row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "2px 2px 0",
        }}
      >
        {/* Copy */}
        <button
          onClick={handleCopy}
          onMouseEnter={() => setCopyHovered(true)}
          onMouseLeave={() => setCopyHovered(false)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: copied ? ws.success : copyHovered ? "#44403C" : ws.muted_text,
            transition: "color 120ms ease",
          }}
          aria-label="Copy message"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>

        {/* Retry */}
        <button
          onMouseEnter={() => setRetryHovered(true)}
          onMouseLeave={() => setRetryHovered(false)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: retryHovered ? "#44403C" : ws.muted_text,
            transition: "color 120ms ease",
          }}
          aria-label="Retry message"
        >
          <RotateCcw size={14} />
        </button>

        {/* Timestamp */}
        <span
          style={{
            fontSize: 10,
            color: ws.muted_text,
            fontFamily: f,
          }}
        >
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EditorGenieMessage — left-aligned assistant message, no bubble/background
// ---------------------------------------------------------------------------
function EditorGenieMessage({ content, title, timestamp }: { content: string; title?: string; timestamp: string }) {
  const [copied, setCopied] = useState(false);
  const [copyHovered, setCopyHovered] = useState(false);
  const [shieldHovered, setShieldHovered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      {/* Plain text — no bubble, no background */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {title && (
          <div style={{ fontSize: 12, fontWeight: 600, color: ws.heading, fontFamily: f }}>
            {title}
          </div>
        )}
        <div
          style={{
            fontSize: 12,
            lineHeight: 1.4,
            color: ws.body,
            fontFamily: f,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {content}
        </div>
      </div>

      {/* Action row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "2px 0 0",
        }}
      >
        {/* Copy */}
        <button
          onClick={handleCopy}
          onMouseEnter={() => setCopyHovered(true)}
          onMouseLeave={() => setCopyHovered(false)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: copied ? ws.success : copyHovered ? "#44403C" : ws.muted_text,
            transition: "color 120ms ease",
          }}
          aria-label="Copy message"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>

        {/* Shield */}
        <button
          onMouseEnter={() => setShieldHovered(true)}
          onMouseLeave={() => setShieldHovered(false)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: shieldHovered ? "#44403C" : ws.muted_text,
            transition: "color 120ms ease",
          }}
          aria-label="Trust message"
        >
          <Shield size={14} />
        </button>

        {/* Timestamp */}
        <span
          style={{
            fontSize: 10,
            color: ws.muted_text,
            fontFamily: f,
          }}
        >
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EditorInput — F1 design: editor zone + hairline divider + toolbar
// ---------------------------------------------------------------------------
function EditorInput({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [sendHovered, setSendHovered] = useState(false);
  const [attachHovered, setAttachHovered] = useState(false);
  const [slashHovered, setSlashHovered] = useState(false);
  const [micHovered, setMicHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasContent = value.trim().length > 0;

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    autoResize();
  };

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const containerBorder = focused
    ? `1.5px solid ${ws.primary}`
    : `1px solid ${ws.inputBorder}`;

  const containerShadow = focused
    ? `0 0 0 1.5px ${ws.primaryLight}`
    : "none";

  const toolbarBtnBase = (hov: boolean): React.CSSProperties => ({
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "none",
    background: hov ? "#EDE8E3" : "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.15s ease",
    padding: 0,
    flexShrink: 0,
  });

  return (
    <div
      style={{
        borderRadius: 10,
        border: containerBorder,
        boxShadow: containerShadow,
        background: ws.elevated,
        transition: "border-color 150ms ease, box-shadow 150ms ease",
        overflow: "hidden",
      }}
    >
      {/* Editor zone */}
      <div style={{ padding: "14px 14px 6px 14px" }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Describe workflow changes..."
          rows={1}
          style={{
            display: "block",
            width: "100%",
            minHeight: 18,
            maxHeight: 120,
            overflowY: "auto",
            padding: 0,
            fontSize: 12,
            lineHeight: 1.5,
            color: ws.body,
            fontFamily: f,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Hairline divider */}
      <div style={{ height: 1, background: ws.border, width: "100%" }} />

      {/* Toolbar */}
      <div
        style={{
          height: 44,
          padding: "8px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Left group */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Attach */}
          <button
            onMouseEnter={() => setAttachHovered(true)}
            onMouseLeave={() => setAttachHovered(false)}
            aria-label="Attach file"
            style={toolbarBtnBase(attachHovered)}
          >
            <Paperclip size={15} color={attachHovered ? "#44403C" : "#A8A29E"} />
          </button>
          {/* Slash */}
          <button
            onMouseEnter={() => setSlashHovered(true)}
            onMouseLeave={() => setSlashHovered(false)}
            aria-label="Slash commands"
            style={toolbarBtnBase(slashHovered)}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: slashHovered ? "#44403C" : "#A8A29E",
                lineHeight: 1,
                fontFamily: f,
              }}
            >
              /
            </span>
          </button>
          {/* Hint */}
          <span
            style={{
              fontSize: 10,
              color: "#A8A29E",
              fontFamily: f,
              userSelect: "none",
            }}
          >
            / commands
          </span>
        </div>

        {/* Right group */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Mic */}
          <button
            onMouseEnter={() => setMicHovered(true)}
            onMouseLeave={() => setMicHovered(false)}
            aria-label="Voice input"
            style={toolbarBtnBase(micHovered)}
          >
            <Mic size={15} color={micHovered ? "#44403C" : "#A8A29E"} />
          </button>
          {/* Send */}
          <button
            onClick={handleSend}
            onMouseEnter={() => setSendHovered(true)}
            onMouseLeave={() => setSendHovered(false)}
            disabled={!hasContent}
            aria-label="Send message"
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: "none",
              background: hasContent
                ? sendHovered
                  ? "#6D28D9"
                  : ws.primary
                : ws.elevated,
              cursor: hasContent ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.15s ease",
              padding: 0,
              flexShrink: 0,
            }}
          >
            <ArrowUp size={15} color={hasContent ? "#fff" : "#A8A29E"} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChatPanel — Forge Assistant chat with proper message components
// ---------------------------------------------------------------------------
function ChatPanel({ onCollapse, instructionName, lineCount }: { onCollapse: () => void; instructionName: string; lineCount: number }) {
  const [messages, setMessages] = useState<EditorChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = (text: string) => {
    const newMsg: EditorChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: ws.surface,
        overflow: "hidden",
      }}
    >
      {/* Header — blended, no border */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 44,
          padding: "0 12px",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={14} color={ws.primary} />
          <span style={{ fontSize: 13, fontWeight: 500, color: ws.heading, fontFamily: f }}>
            Forge Assistant
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <GhostButton ariaLabel="New chat" size={28}>
            <SquarePen size={14} />
          </GhostButton>
          <GhostButton onClick={onCollapse} ariaLabel="Collapse chat" size={28}>
            <PanelLeftClose size={14} />
          </GhostButton>
        </div>
      </div>

      {/* Content area — welcome or messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 ? (
          <>
            {/* Welcome state */}
            <div style={{ padding: "24px 14px 0", display: "flex", flexDirection: "column", gap: 16, maxWidth: 520, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
              {/* Fused context */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: ws.heading, fontFamily: f }}>
                  {instructionName}
                </span>
                <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>
                  {lineCount} lines · 5 steps · 2h ago
                </span>
              </div>

              {/* Suggestion cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 252 }}>
                {[
                  { icon: "book-open", label: "Explain this workflow" },
                  { icon: "git-branch", label: "Add a fallback step" },
                  { icon: "triangle-alert", label: "Handle doc failures" },
                ].map((card) => (
                  <button
                    key={card.label}
                    onClick={() => handleSend(card.label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 6,
                      background: ws.elevated,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: f,
                    }}
                  >
                    {card.icon === "book-open" && <BookOpen size={14} color={ws.secondary} />}
                    {card.icon === "git-branch" && <LucideGitBranch size={14} color={ws.secondary} />}
                    {card.icon === "triangle-alert" && <TriangleAlert size={14} color={ws.secondary} />}
                    <span style={{ fontSize: 12, color: ws.body, fontWeight: 400 }}>{card.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Spacer to push input to bottom */}
            <div style={{ flex: 1 }} />
          </>
        ) : (
          /* Messages list */
          <div
            style={{
              maxWidth: 520,
              margin: "0 auto",
              padding: "12px 12px 8px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              boxSizing: "border-box",
            }}
          >
            {messages.map((msg) =>
              msg.role === "user" ? (
                <EditorUserBubble
                  key={msg.id}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ) : (
                <EditorGenieMessage
                  key={msg.id}
                  content={msg.content}
                  title={msg.title}
                  timestamp={msg.timestamp}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Input section */}
      <div
        style={{
          flexShrink: 0,
          padding: "8px 10px 10px",
          maxWidth: 520,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <EditorInput onSend={handleSend} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VersionPill — interactive version history dropdown
// ---------------------------------------------------------------------------
interface VersionEntry {
  version: number;
  status: "draft" | "live" | "published";
  author: string;
  timeAgo: string;
}

const VERSIONS: VersionEntry[] = [
  { version: 4, status: "draft", author: "You", timeAgo: "2m" },
  { version: 3, status: "live", author: "Priya", timeAgo: "3d" },
  { version: 2, status: "published", author: "Ravi", timeAgo: "2w" },
  { version: 1, status: "published", author: "Ravi", timeAgo: "1mo" },
];

function VersionPill({ currentVersion, versions }: { currentVersion: number; versions: VersionEntry[] }) {
  const [open, setOpen] = useState(false);
  const [pillHover, setPillHover] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [confirmingVersion, setConfirmingVersion] = useState<number | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const current = versions.find((v) => v.version === currentVersion);

  // Open/close animation: show dropdown in DOM when opening, hide after close
  useEffect(() => {
    if (open) {
      setDropdownVisible(true);
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmingVersion(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setConfirmingVersion(null);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const pillActive = open || pillHover;

  const pillStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    height: 26,
    padding: "0 8px",
    borderRadius: 10,
    gap: 5,
    cursor: "pointer",
    border: pillActive
      ? `1px solid rgba(124,58,237,0.2)`
      : `1px solid ${ws.border}`,
    background: pillActive ? ws.primaryLight : ws.elevated,
    boxShadow: open ? `0 0 0 2px rgba(124,58,237,0.12)` : "none",
    transition: "background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
    fontFamily: f,
    outline: "none",
  };

  const dotColor = {
    draft: ws.primary,
    live: ws.success,
    published: ws.disabled,
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", display: "inline-flex" }}>
      {/* Pill button */}
      <button
        onClick={() => { setOpen((p) => !p); setConfirmingVersion(null); }}
        onMouseEnter={() => setPillHover(true)}
        onMouseLeave={() => setPillHover(false)}
        style={pillStyle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: pillActive ? ws.primary : ws.heading,
            fontFamily: f,
            transition: "color 0.15s ease",
          }}
        >
          v{currentVersion}
        </span>

        {current?.status === "live" ? (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: ws.success,
              flexShrink: 0,
            }}
          />
        ) : (
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: pillActive ? ws.primary : ws.muted_text,
              fontFamily: f,
              transition: "color 0.15s ease",
            }}
          >
            · {current?.status === "draft" ? "Draft" : current?.status}
          </span>
        )}

        <ChevronDown
          size={12}
          color={pillActive ? ws.primary : ws.muted_text}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease, color 0.15s ease",
            flexShrink: 0,
          }}
        />
      </button>

      {/* Dropdown */}
      {dropdownVisible && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            width: 260,
            borderRadius: 10,
            background: ws.surface,
            border: `1px solid ${ws.border}`,
            boxShadow: "0 4px 16px rgba(120,100,80,0.08), 0 1px 2px rgba(120,100,80,0.04)",
            overflow: "hidden",
            zIndex: 50,
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(-4px)",
            transition: "opacity 150ms ease-out, transform 150ms ease-out",
            pointerEvents: open ? "auto" : "none",
          }}
          onTransitionEnd={() => { if (!open) setDropdownVisible(false); }}
        >
          {versions.map((entry, idx) => {
            const isCurrent = entry.version === currentVersion;
            const isConfirming = confirmingVersion === entry.version;
            const isHovered = hoveredRow === entry.version;
            const isLast = idx === versions.length - 1;

            // Inline restore confirmation row
            if (isConfirming) {
              return (
                <div
                  key={entry.version}
                  style={{
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: ws.elevated,
                    borderBottom: isLast ? "none" : `1px solid #F0EBE4`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: dotColor[entry.status],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 12, color: ws.body, fontFamily: f }}>
                      Restore v{entry.version}?
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <span
                      style={{ fontSize: 12, color: ws.muted_text, cursor: "pointer", transition: "color 0.15s" }}
                      onClick={(e) => { e.stopPropagation(); setConfirmingVersion(null); }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = ws.secondary; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = ws.muted_text; }}
                    >
                      Cancel
                    </span>
                    <span
                      style={{ fontSize: 12, fontWeight: 500, color: ws.primary, marginLeft: 8, cursor: "pointer", transition: "color 0.15s" }}
                      onClick={(e) => { e.stopPropagation(); setOpen(false); setConfirmingVersion(null); }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = ws.primaryHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = ws.primary; }}
                    >
                      Restore
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={entry.version}
                onMouseEnter={() => setHoveredRow(entry.version)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => {
                  if (!isCurrent) setConfirmingVersion(entry.version);
                }}
                style={{
                  padding: "8px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: isCurrent ? ws.elevated : isHovered ? "#EDE8E3" : "transparent",
                  borderBottom: isLast ? "none" : `1px solid #F0EBE4`,
                  cursor: isCurrent ? "default" : "pointer",
                  transition: "background-color 120ms ease",
                }}
              >
                {/* Left: dot + version label */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: dotColor[entry.status],
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isCurrent ? 600 : 500,
                      color: ws.body,
                      fontFamily: f,
                    }}
                  >
                    {isCurrent
                      ? `v${entry.version} · ${entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}`
                      : `v${entry.version}`}
                  </span>
                </div>

                {/* Right: restore icon on hover (non-current), else author · timeAgo */}
                <div style={{ position: "relative", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  {!isCurrent && (
                    <RotateCcw
                      size={14}
                      color={ws.primary}
                      style={{
                        position: "absolute",
                        opacity: isHovered ? 1 : 0,
                        transition: "opacity 150ms ease",
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: 11,
                      color: ws.muted_text,
                      fontFamily: f,
                      opacity: isCurrent || !isHovered ? 1 : 0,
                      transition: "opacity 150ms ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.author} · {entry.timeAgo} ago
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DAGPanel — simple mock DAG nodes
// ---------------------------------------------------------------------------
const DAG_NODES: { label: string; type: "agent" | "tool" | "capability"; status: string; meta: string; x: number; y: number }[] = [
  { label: "Ticket Router", type: "agent", status: "ok", meta: "3 tools", x: 155, y: 40 },
  { label: "Email Builder", type: "agent", status: "ok", meta: "Agent", x: 20, y: 170 },
  { label: "KB Search", type: "tool", status: "ok", meta: "Slack API", x: 180, y: 170 },
  { label: "Doc Processing", type: "capability", status: "ok", meta: "3 nested", x: 340, y: 170 },
  { label: "Quality Checker", type: "agent", status: "ok", meta: "Agent", x: 160, y: 300 },
];

function DAGPanel({ onCollapse }: { onCollapse: () => void }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: ws.surface,
        overflow: "hidden",
      }}
    >
      {/* Header — blended, no border */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 40,
          padding: "0 12px",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <LucideGitBranch size={16} color={ws.secondary} />
          <span style={{ fontSize: 13, fontWeight: 500, color: ws.heading, fontFamily: f }}>
            Workflow
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              padding: "2px 6px",
              borderRadius: 6,
              background: ws.hoverBg,
              color: ws.secondary,
              fontFamily: f,
            }}
          >
            {DAG_NODES.length} nodes
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <GhostButton ariaLabel="Fit to view" size={28}>
            <Maximize2 size={14} />
          </GhostButton>
          <GhostButton onClick={onCollapse} ariaLabel="Collapse DAG" size={28}>
            <PanelRightClose size={14} />
          </GhostButton>
        </div>
      </div>

      {/* Canvas with dot grid */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          backgroundImage: `radial-gradient(circle, ${ws.disabled} 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      >
        {/* Nodes — positioned absolutely on canvas */}
        {DAG_NODES.map((node, i) => {
          const gradientStart = node.type === "agent" ? "#EDE9FE"
            : node.type === "tool" ? "#FFFBEB"
            : "#ECFDF5";
          const iconColor = node.type === "agent" ? ws.primary
            : node.type === "tool" ? ws.warning
            : ws.success;
          const ringColor = node.type === "agent" ? "#7C3AED50"
            : node.type === "tool" ? "#F59E0B50"
            : "#10B98150";
          const badgeBg = node.type === "agent" ? ws.primaryLight
            : node.type === "tool" ? ws.warningBg
            : ws.successBg;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: node.x,
                top: node.y,
                width: 170,
                display: "flex",
                flexDirection: "column",
                padding: "8px 10px",
                gap: 4,
                borderRadius: 8,
                background: `linear-gradient(90deg, ${gradientStart} 0%, ${ws.surface} 40%)`,
                border: `1px solid ${ws.border}`,
                cursor: "pointer",
                fontFamily: f,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: ws.heading }}>{node.label}</span>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    background: badgeBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 0 2px ${ringColor}`,
                  }}
                >
                  {node.type === "agent" && <Brain size={12} color={iconColor} />}
                  {node.type === "tool" && <Plug size={12} color={iconColor} />}
                  {node.type === "capability" && <Layers size={12} color={iconColor} />}
                </div>
              </div>
              <span style={{ fontSize: 10, color: ws.muted_text }}>{node.meta}</span>
            </div>
          );
        })}

        {/* Connectors */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {/* Root to branch line */}
          <line x1={240} y1={96} x2={240} y2={148} stroke={ws.border} strokeWidth={2} />
          {/* Horizontal branch */}
          <line x1={95} y1={148} x2={420} y2={148} stroke={ws.border} strokeWidth={2} />
          {/* Drop to Email Builder */}
          <line x1={95} y1={148} x2={95} y2={170} stroke={ws.border} strokeWidth={2} />
          {/* Drop to KB Search */}
          <line x1={265} y1={148} x2={265} y2={170} stroke={ws.border} strokeWidth={2} />
          {/* Drop to Doc Processing */}
          <line x1={420} y1={148} x2={420} y2={170} stroke={ws.border} strokeWidth={2} />
          {/* Doc Processing to Quality Checker */}
          <line x1={255} y1={226} x2={255} y2={300} stroke={ws.border} strokeWidth={2} />
        </svg>

        {/* Floating controls — bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            display: "flex",
            flexDirection: "column",
            borderRadius: 8,
            background: ws.surface,
            border: `1px solid ${ws.border}`,
            overflow: "hidden",
          }}
        >
          <button style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus size={14} color={ws.secondary} />
          </button>
          <div style={{ height: 1, background: ws.border }} />
          <button style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Minus size={14} color={ws.secondary} />
          </button>
          <div style={{ height: 1, background: ws.border }} />
          <button style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Scan size={14} color={ws.secondary} />
          </button>
        </div>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// DragDivider — 3px visible / 12px hit-target divider between panels
// ---------------------------------------------------------------------------
function DragDivider({
  onDrag,
  onDragEnd,
}: {
  onDrag: (delta: number) => void;
  onDragEnd?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const draggingRef = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      draggingRef.current = true;

      const onMouseMove = (ev: MouseEvent) => {
        if (!draggingRef.current) return;
        onDrag(ev.movementX);
      };

      const onMouseUp = () => {
        draggingRef.current = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        onDragEnd?.();
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [onDrag, onDragEnd]
  );

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        height: "100%",
        flexShrink: 0,
        cursor: "col-resize",
        position: "relative",
        background: "transparent",
        zIndex: 10,
      }}
    >
      {/* Wide invisible hit area */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: -5,
          width: 13,
          cursor: "col-resize",
        }}
      />
      {/* Hover reveal line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 2,
          borderRadius: 1,
          background: hovered ? `${ws.primary}4D` : "transparent",
          transition: "background 150ms ease",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// InstructionEditor — main export
// ---------------------------------------------------------------------------
export default function InstructionEditor() {
  const { instructionId } = useParams<{ instructionId: string }>();
  const navigate = useNavigate();
  const instruction = useMemo(
    () => instructions.find((i) => i.id === instructionId),
    [instructionId]
  );

  const [chatOpen, setChatOpen] = useState(true);
  const [yamlState, setYamlState] = useState<"open" | "collapsed-left" | "collapsed-right">("open");
  const [dagOpen, setDagOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(CHAT_W);
  const [dagWidth, setDagWidth] = useState(DAG_W);
  const [isDragging, setIsDragging] = useState(false);
  const [backHover, setBackHover] = useState(false);
  const [saveDraftHover, setSaveDraftHover] = useState(false);
  const [testHover, setTestHover] = useState(false);
  const [content, setContent] = useState(instruction?.content ?? "");
  const [isLocked, setIsLocked] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const columnsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const lineNumbers = useMemo(
    () => content.split("\n").map((_, i) => i + 1),
    [content]
  );

  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  // Compute remaining YAML space after a drag and auto-collapse if too narrow
  const YAML_COLLAPSE_THRESHOLD = 150;
  const DIVIDER_W = 6;

  const getYamlAvailable = useCallback(
    (cw: number, dw: number) => {
      const total = columnsRef.current?.offsetWidth ?? window.innerWidth;
      const chatUsed = chatOpen ? cw : STRIP_W;
      const dagUsed = dagOpen ? dw : STRIP_W;
      const dividers = (chatOpen ? DIVIDER_W : 0) + (dagOpen ? DIVIDER_W : 0);
      return total - chatUsed - dagUsed - dividers;
    },
    [chatOpen, dagOpen]
  );

  const handleChatDrag = useCallback(
    (delta: number) => {
      setIsDragging(true);
      setChatWidth((prev) => {
        const next = prev + delta;
        if (next < 200) { setChatOpen(false); return CHAT_W; }
        // Auto-collapse YAML if squeezed
        if (yamlState === "open" && getYamlAvailable(next, dagWidth) < YAML_COLLAPSE_THRESHOLD) {
          setYamlState("collapsed-left");
        }
        return next;
      });
    },
    [yamlState, dagWidth, getYamlAvailable]
  );

  const handleDagDrag = useCallback(
    (delta: number) => {
      setIsDragging(true);
      setDagWidth((prev) => {
        const next = prev - delta;
        if (next < 280) { setDagOpen(false); return DAG_W; }
        // Auto-collapse YAML if squeezed
        if (yamlState === "open" && getYamlAvailable(chatWidth, next) < YAML_COLLAPSE_THRESHOLD) {
          setYamlState("collapsed-right");
        }
        return next;
      });
    },
    [yamlState, chatWidth, getYamlAvailable]
  );

  if (pageLoading) {
    return <PageSkeleton />;
  }

  if (!instruction) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: f,
          color: ws.body,
          fontSize: 14,
        }}
      >
        Instruction not found.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
        background: ws.page,
        fontFamily: f,
        overflow: "hidden",
      }}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Top bar — 48px                                                   */}
      {/* ---------------------------------------------------------------- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: 48,
          padding: "0 16px",
          gap: 10,
          background: ws.page,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate("/instructions")}
          aria-label="Back to instructions"
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: "none",
            background: backHover ? ws.elevated : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={14} color={ws.secondary} />
        </button>

        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: ws.heading,
          }}
        >
          {instruction.name}
        </span>

        <div style={{ position: "relative" }}>
          <VersionPill currentVersion={4} versions={VERSIONS} />
        </div>

        <div style={{ flex: 1 }} />

        {/* Validation status */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <CircleCheck size={14} color={ws.success} />
          <span style={{ fontSize: 11, fontWeight: 500, color: ws.body, fontFamily: f }}>Valid</span>
        </div>

        {/* Save Draft */}
        <button
          onMouseEnter={() => setSaveDraftHover(true)}
          onMouseLeave={() => setSaveDraftHover(false)}
          style={{
            height: 30,
            padding: "0 14px",
            borderRadius: 8,
            border: "none",
            background: saveDraftHover ? ws.elevated : "transparent",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 500,
            color: ws.body,
            fontFamily: f,
          }}
        >
          Save Draft
        </button>

        {/* Test */}
        <button
          onMouseEnter={() => setTestHover(true)}
          onMouseLeave={() => setTestHover(false)}
          style={{
            height: 30,
            padding: "0 12px",
            borderRadius: 8,
            border: "none",
            background: testHover ? ws.elevated : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: f,
          }}
        >
          <FlaskConical size={12} color={ws.body} />
          <span style={{ fontSize: 11, fontWeight: 500, color: ws.body }}>Test</span>
        </button>

        {/* Publish */}
        <button
          style={{
            height: 30,
            padding: "0 16px",
            borderRadius: 8,
            border: "none",
            background: ws.primary,
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
            color: "#FFF",
            fontFamily: f,
            boxShadow: "0 1px 3px rgba(124,58,237,0.2)",
          }}
        >
          Publish
        </button>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Three columns                                                    */}
      {/* ---------------------------------------------------------------- */}
      <div ref={columnsRef} style={{ display: "flex", flex: 1, minHeight: 0, gap: 0, padding: "6px" }}>

        {/* Chat column */}
        <div
          style={{
            ...(chatOpen && yamlState === "collapsed-right"
              ? { flex: 1, minWidth: chatWidth }
              : { width: chatOpen ? chatWidth : STRIP_W }),
            flexShrink: 0,
            overflow: "hidden",
            background: ws.surface,
            borderRadius: 10,
            boxShadow: "0 1px 3px rgba(120,100,80,0.07), 0 4px 12px rgba(120,100,80,0.04)",
            transition: isDragging ? "none" : `width 320ms ${spring}`,
          }}
        >
          {chatOpen ? (
            <ChatPanel onCollapse={() => setChatOpen(false)} instructionName={instruction.name} lineCount={lineNumbers.length} />
          ) : (
            <PanelStrip
              icon="chat"
              label="Chat"
              side="left"
              onClick={() => { setChatWidth(CHAT_W); setChatOpen(true); }}
            />
          )}
        </div>

        {/* Left gap — consistent 6px, draggable when chat is open */}
        <div style={{ width: 6, flexShrink: 0, position: "relative" }}>
          {chatOpen && (
            <div style={{ position: "absolute", inset: 0 }}>
              <DragDivider onDrag={handleChatDrag} onDragEnd={handleDragEnd} />
            </div>
          )}
        </div>

        {/* YAML column — flex:1 when open, fixed strip when collapsed */}
        <div
          style={{
            ...(yamlState === "open"
              ? { flex: 1, minWidth: 200 }
              : { width: STRIP_W, flexShrink: 0 }),
            display: "flex",
            overflow: "hidden",
            background: "#FFFFFF",
            borderRadius: 10,
            boxShadow: "0 1px 3px rgba(120,100,80,0.07), 0 4px 12px rgba(120,100,80,0.04)",
            transition: `width 320ms ${spring}`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            {yamlState === "open" ? (
              <>
                {/* YAML header — blended, no border */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 36,
                    padding: "0 12px",
                    justifyContent: "space-between",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <LucideFileCode size={14} color={ws.secondary} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: ws.heading, fontFamily: f }}>
                      instructions.md
                    </span>
                    <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>
                      L {lineNumbers.length}
                    </span>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: ws.success, display: "inline-block" }} />
                  </div>
                  <GhostButton onClick={() => setYamlState("collapsed-left")} ariaLabel="Collapse editor" size={28}>
                    <PanelLeftClose size={14} />
                  </GhostButton>
                </div>

                {/* Editor body */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    overflow: "hidden",
                    background: "#FFFFFF",
                  }}
                >
                  {/* Line numbers */}
                  <div
                    aria-hidden
                    style={{
                      width: 36,
                      flexShrink: 0,
                      padding: "12px 4px 12px 0",
                      textAlign: "right",
                      userSelect: "none",
                      overflowY: "hidden",
                      background: "#FFFFFF",
                    }}
                  >
                    {lineNumbers.map((n) => (
                      <div
                        key={n}
                        style={{
                          fontSize: 11,
                          fontFamily: mono,
                          color: ws.gutter,
                          lineHeight: "20px",
                          height: 20,
                          paddingRight: 4,
                        }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      setIsLocked(false);
                    }}
                    readOnly={isLocked}
                    spellCheck={false}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      resize: "none",
                      fontSize: 12,
                      fontFamily: mono,
                      color: isLocked ? ws.secondary : ws.body,
                      lineHeight: "20px",
                      caretColor: ws.primary,
                    }}
                  />
                </div>
              </>
            ) : (
              <PanelStrip
                icon="code"
                label="Editor"
                side="center"
                onClick={() => setYamlState("open")}
              />
            )}
          </div>
        </div>

        {/* Right gap — consistent 6px, draggable when DAG is open */}
        <div style={{ width: 6, flexShrink: 0, position: "relative" }}>
          {dagOpen && (
            <div style={{ position: "absolute", inset: 0 }}>
              <DragDivider onDrag={handleDagDrag} onDragEnd={handleDragEnd} />
            </div>
          )}
        </div>

        {/* DAG column */}
        <div
          style={{
            ...(dagOpen && yamlState === "collapsed-left"
              ? { flex: 1, minWidth: dagWidth }
              : { width: dagOpen ? dagWidth : STRIP_W }),
            flexShrink: 0,
            overflow: "hidden",
            background: ws.surface,
            borderRadius: 10,
            boxShadow: "0 1px 3px rgba(120,100,80,0.07), 0 4px 12px rgba(120,100,80,0.04)",
            transition: isDragging ? "none" : `width 320ms ${spring}`,
          }}
        >
          {dagOpen ? (
            <DAGPanel onCollapse={() => setDagOpen(false)} />
          ) : (
            <PanelStrip
              icon="dag"
              label="DAG"
              side="right"
              onClick={() => { setDagWidth(DAG_W); setDagOpen(true); }}
            />
          )}
        </div>
      </div>

    </div>
  );
}
