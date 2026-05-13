import { useState, useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Eye,
  Code,
  Copy,
  Check,
  Bell,
  CaretRight,
  SpinnerGap,
} from "@phosphor-icons/react";
import { Plus } from "lucide-react";
import { useBreakpoint } from "@/shared/hooks/useBreakpoint";
import { instructions, type Instruction, type PublicationStatus, createInstruction } from "./instructionData";
import { ws as baseWs, f } from "@/shared/utils/contentTokens";
import { ShimmerBar, SearchBar, Card } from "@/shared/components/settings";
import CreateInstructionModal from "./CreateInstructionModal";

const spring = "cubic-bezier(0.32, 0.72, 0, 1)";

/* ── Tooltip ────────────────────────────────────────────────── */

function Tip({ label, children, style: wrapStyle }: { label: string; children: ReactNode; style?: CSSProperties }) {
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    timerRef.current = setTimeout(() => setShow(true), 400);
  };
  const handleLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(false);
  };

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ position: "relative", display: "inline-flex", ...wrapStyle }}
    >
      {children}
      {show && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", zIndex: 100, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 8, height: 8, backgroundColor: "#292524" }} />
          <div style={{ backgroundColor: "#292524", color: "#FFFFFF", fontSize: 10, fontWeight: 500, padding: "5px 10px", borderRadius: 6, whiteSpace: "nowrap", fontFamily: f }}>
            {label}
          </div>
        </div>
      )}
    </div>
  );
}

/** Instructions page extends the base tokens with page-specific values */
const ws = {
  ...baseWs,
  // Instructions-specific overrides & additions
  panelBg: "#EBE7E2",
  cardBg: "#FFFDF9",
  bodyHover: "#44403C",
  muted: "#A8A29E",       // alias (base uses muted_text for this)
  mutedBg: "#F0EBE4",
  iconRest: "#8C857E",
  kbHint: "#C4B5B0",
  pillBg: "#E5E0DA",
  pillText: "#78716C",
  panelPillBg: "#D6D0C8",
  panelToggleBg: "#D6D0C8",
  panelToggleActive: "#C4BCB3",
  pendingBg: "#EDE9FE",
  pendingText: "#7C3AED",
};

const PANEL_WIDTH = 540;

/* ── Page Skeleton (list loading state) ────────────────────── */

function ListSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, fontFamily: f }}>
      <style>{`
        @keyframes il-shimmer-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
      {/* Title + description */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <ShimmerBar width={140} height={22} />
        <ShimmerBar width={420} height={13} delay={60} />
      </div>
      {/* List card */}
      <Card>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 44,
            borderBottom: i < 5 ? `1px solid ${ws.border}` : undefined,
          }}>
            <ShimmerBar width={120 + (i * 17 + 13) % 80} height={12} delay={i * 60} radius={5} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {i === 1 && <ShimmerBar width={48} height={16} delay={i * 60 + 30} radius={4} />}
              <ShimmerBar width={60} height={10} delay={i * 60 + 30} radius={5} />
              <ShimmerBar width={8} height={8} delay={i * 60 + 60} radius={4} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ── Status Indicator (right-aligned) ───────────────────────── */

function StatusIndicator({ status }: { status: PublicationStatus }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
      {/* Pending review pill — only for published_with_draft */}
      {status === "published_with_draft" && (
        <span style={{
          fontSize: 9, fontWeight: 600, color: ws.pendingText,
          backgroundColor: ws.pendingBg, padding: "2px 8px",
          borderRadius: 4, fontFamily: f, whiteSpace: "nowrap",
        }}>
          Pending review
        </span>
      )}
      {/* Draft pill — only for draft-only */}
      {status === "draft" && (
        <span style={{
          fontSize: 9, fontWeight: 600, color: ws.pillText,
          backgroundColor: ws.pillBg, padding: "2px 8px",
          borderRadius: 4, fontFamily: f,
        }}>
          Draft
        </span>
      )}
      {/* Green dot + Published — for published and published_with_draft */}
      {status !== "draft" && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ws.success }} />
          <span style={{ fontSize: 11, fontWeight: 400, color: ws.muted, fontFamily: f }}>Published</span>
        </span>
      )}
    </div>
  );
}

/* ── Instruction Row (no icon — clean like Models) ──────────── */

function InstructionRow({
  item,
  isSelected,
  compact,
  onSelect,
}: {
  item: Instruction;
  isSelected: boolean;
  compact: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const height = compact ? 48 : 44;
  const fontSize = compact ? 14 : 13;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        height,
        cursor: "pointer",
        transition: "background-color 0.15s",
        borderBottom: `1px solid ${ws.border}`,
        backgroundColor: isSelected ? ws.elevated : hovered ? ws.hoverBg : "transparent",
        fontFamily: f,
      }}
    >
      {/* Left: name + issue badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{ fontSize, fontWeight: 500, color: ws.heading, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.name}
        </span>
      </div>

      {/* Right: status indicators + chevron */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <StatusIndicator status={item.status} />
        <CaretRight size={14} color={ws.disabled} />
      </div>
    </div>
  );
}

/* ── Code View with Line Numbers ────────────────────────────── */

function CodeView({ content }: { content: string }) {
  const lines = content.split("\n");
  const gutterWidth = lines.length >= 100 ? 48 : 36;
  return (
    <div style={{ display: "flex", fontSize: 11, lineHeight: 1.7, fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace" }}>
      <div
        style={{
          flexShrink: 0, width: gutterWidth, textAlign: "right",
          paddingRight: 12, borderRight: `1px solid ${ws.border}`,
          marginRight: 16, userSelect: "none", color: ws.disabled,
        }}
      >
        {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <pre style={{ margin: 0, flex: 1, whiteSpace: "pre-wrap", wordBreak: "break-word", color: ws.body }}>
        {content}
      </pre>
    </div>
  );
}

/* ── Rendered MD View ───────────────────────────────────────── */

function RenderedView({ content }: { content: string }) {
  // Extract frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n*([\s\S]*)$/);
  if (!fmMatch) return <pre style={{ fontSize: 12, color: ws.body, whiteSpace: "pre-wrap" }}>{content}</pre>;

  const frontmatter = fmMatch[1];
  const body = fmMatch[2];

  // Parse name and description from frontmatter
  const nameMatch = frontmatter.match(/name:\s*(.+)/);
  const descMatch = frontmatter.match(/description:\s*(.+)/);
  const name = nameMatch?.[1] || "";
  const description = descMatch?.[1] || "";

  // Split body into sections
  const sections = body.split(/\n## /).filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Title from frontmatter */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: ws.heading, fontFamily: f }}>{name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</h1>
        <p style={{ margin: 0, fontSize: 12, color: ws.secondary, lineHeight: 1.5, fontFamily: f }}>{description}</p>
      </div>

      {/* Body description (text before first ## heading) */}
      {sections.length > 0 && !sections[0].startsWith("Step") && !sections[0].startsWith("Input") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sections[0].trim().split("\n\n").filter(Boolean).map((para, i) => (
            <p key={i} style={{ margin: 0, fontSize: 12, color: ws.body, lineHeight: 1.55, fontFamily: f }}>{para}</p>
          ))}
          <div style={{ height: 1, backgroundColor: ws.border, margin: "4px 0" }} />
        </div>
      )}

      {/* Sections after body */}
      {sections.slice(sections[0] && !sections[0].startsWith("Step") && !sections[0].startsWith("Input") ? 1 : 0).map((sec, i) => {
        const lines = sec.split("\n");
        const heading = lines[0] || "";
        const bodyText = lines.slice(1).join("\n").trim();
        const parts = bodyText.split("\n\n").filter(Boolean);

        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: ws.heading, fontFamily: f }}>{heading}</h2>
            {parts.map((part, j) => {
              // Bold label lines like **Description**: ...
              if (part.includes("**")) {
                return (
                  <div key={j} style={{ fontSize: 12, color: ws.body, lineHeight: 1.55, fontFamily: f, whiteSpace: "pre-wrap" }}>
                    {part.split("\n").map((line, k) => {
                      const boldMatch = line.match(/^\*\*(.+?)\*\*:?\s*(.*)/);
                      if (boldMatch) {
                        return (
                          <div key={k}>
                            <span style={{ fontWeight: 600, color: ws.heading }}>{boldMatch[1]}</span>
                            {boldMatch[2] && <span>: {boldMatch[2]}</span>}
                          </div>
                        );
                      }
                      return <div key={k}>{line}</div>;
                    })}
                  </div>
                );
              }
              // List items
              if (part.startsWith("- ")) {
                return (
                  <div key={j} style={{ fontSize: 12, color: ws.body, lineHeight: 1.55, fontFamily: f, whiteSpace: "pre-wrap" }}>{part}</div>
                );
              }
              return (
                <p key={j} style={{ margin: 0, fontSize: 12, color: ws.body, lineHeight: 1.55, fontFamily: f, whiteSpace: "pre-wrap" }}>{part}</p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ── Detail Panel ───────────────────────────────────────────── */

function InstructionPanel({
  item,
  onClose,
  isMobile = false,
}: {
  item: Instruction;
  onClose: () => void;
  isMobile?: boolean;
}) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"rendered" | "source">("rendered");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const hasDraft = item.status === "published_with_draft";

  const [copied, setCopied] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const handleOpenEditor = () => {
    setNavigating(true);
    setTimeout(() => navigate(`/instructions/${item.id}/edit`), 600);
  };

  return (
    <div
      style={isMobile ? {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: ws.surface,
        padding: "0 12px 12px",
        gap: 8,
        fontFamily: f,
      } : {
        width: PANEL_WIDTH,
        display: "flex",
        flexDirection: "column",
        backgroundColor: ws.surface,
        flexShrink: 0,
        fontFamily: f,
        borderRadius: 14,
        margin: "10px 10px 10px 0",
        height: "calc(100% - 20px)",
        border: ws.cardBorder,
        boxShadow: ws.cardShadow,
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: `transform 0.28s ${spring}`,
        overflow: "hidden",
      }}
    >
      {/* ── Header: Name + close ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px", height: 56, borderBottom: `1px solid #F0EBE4`, flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: ws.heading, fontFamily: f, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.name}
        </span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", outline: "none", flexShrink: 0 }}
        >
          <X size={16} color={ws.muted} />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflow: "auto", scrollbarWidth: "thin", scrollbarColor: `${ws.disabled} transparent` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 20px" }}>

          {/* Row 1: Status meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {item.status !== "draft" && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ws.success, flexShrink: 0 }} />
            )}
            <span style={{ fontSize: 12, color: ws.secondary, fontFamily: f }}>
              {item.status === "draft" ? "Draft" : `Published · ${item.version}`} · {item.lastModifiedAt}
            </span>
            {hasDraft && (
              <span style={{ fontSize: 9, fontWeight: 600, color: ws.pendingText, backgroundColor: ws.pendingBg, padding: "2px 7px", borderRadius: 4, fontFamily: f }}>
                Pending review
              </span>
            )}
          </div>

          {/* Row 2: View toggle + copy + editor button */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Tip label="Rendered view">
              <button
                onClick={() => setViewMode("rendered")}
                style={{
                  width: 30, height: 30, borderRadius: 6, border: "none", cursor: "pointer",
                  backgroundColor: viewMode === "rendered" ? "#F0EBE4" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", outline: "none",
                }}
              >
                <Eye size={15} weight={viewMode === "rendered" ? "fill" : "regular"} color={viewMode === "rendered" ? ws.body : ws.muted} />
              </button>
            </Tip>
            <Tip label="Source view">
              <button
                onClick={() => setViewMode("source")}
                style={{
                  width: 30, height: 30, borderRadius: 6, border: "none", cursor: "pointer",
                  backgroundColor: viewMode === "source" ? "#F0EBE4" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", outline: "none",
                }}
              >
                <Code size={15} weight={viewMode === "source" ? "fill" : "regular"} color={viewMode === "source" ? ws.body : ws.muted} />
              </button>
            </Tip>
            <Tip label={copied ? "Copied!" : "Copy source"}>
              <button
                onClick={handleCopy}
                style={{
                  width: 30, height: 30, borderRadius: 6, border: "none", cursor: "pointer",
                  backgroundColor: "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", outline: "none",
                }}
              >
                {copied ? <Check size={15} weight="bold" color={ws.muted} /> : <Copy size={15} weight="regular" color={ws.muted} />}
              </button>
            </Tip>

            <div style={{ flex: 1 }} />

            <button
              onClick={handleOpenEditor}
              disabled={navigating}
              style={{
                height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                gap: 6, padding: "0 14px", borderRadius: 7,
                minWidth: 156,
                backgroundColor: ws.primary, border: "none",
                cursor: navigating ? "default" : "pointer", outline: "none", fontFamily: f, flexShrink: 0,
              }}
              onMouseEnter={(e) => { if (!navigating) e.currentTarget.style.backgroundColor = ws.primaryDark; }}
              onMouseLeave={(e) => { if (!navigating) e.currentTarget.style.backgroundColor = ws.primary; }}
            >
              {navigating ? (
                <SpinnerGap size={14} weight="bold" color="#FFFFFF" style={{ animation: "il-shimmer-spin 1s linear infinite" }} />
              ) : (
                <>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>Instruction Editor</span>
                  <CaretRight size={12} color="#FFFFFF" weight="bold" />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: "#F0EBE4" }} />

          {/* MD content directly on surface */}
          <div style={{
            padding: viewMode === "source" ? 0 : 0,
          }}>
            {viewMode === "rendered" ? (
              <RenderedView content={item.content} />
            ) : (
              <CodeView content={item.content} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */

export default function InstructionsPage() {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [panelKey, setPanelKey] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Page load simulation
  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const panelOpen = selectedId !== null;
  const selectedItem = instructions.find((i) => i.id === selectedId) ?? null;

  const filtered = searchQuery
    ? instructions.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : instructions;

  const handleSelect = (id: string) => {
    if (id === selectedId) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
      setPanelKey((k) => k + 1);
    }
  };

  const handleCreate = ({ name, description }: { name: string; description: string }) => {
    const newId = createInstruction({ name, description });
    setCreateModalOpen(false);
    navigate(`/instructions/${newId}/edit`);
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", fontFamily: f, overflow: "hidden" }}>
      <style>{`
        @keyframes il-shimmer-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
      {/* ── List side ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: ws.page, minWidth: 0 }}>

        {/* ── Header (hidden on mobile — GenieLayout handles nav) ── */}
        {!isMobile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 32px",
            flexShrink: 0,
            gap: 12,
            minHeight: 40,
          }}
        >
          {/* Left: breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: ws.muted, fontFamily: f }}>Settings</span>
            <span style={{ fontSize: 12, color: ws.disabled }}>/</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: ws.secondary, fontFamily: f }}>Instructions</span>
          </div>

          {/* Right: bell */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => {}}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 4, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 6, outline: "none", position: "relative",
                opacity: 0.6, transition: "opacity 0.15s", flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; }}
            >
              <Bell size={16} weight="regular" color={ws.muted} />
              <span style={{
                position: "absolute", top: 0, right: -1,
                width: 14, height: 14, borderRadius: "50%",
                backgroundColor: ws.primary, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 8, fontWeight: 700, color: "#FFF",
              }}>3</span>
            </button>
          </div>
        </div>
        )}

        {/* ── Page content ── */}
        <div
          id="main-content"
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            padding: isMobile ? "0 16px 20px" : "0 32px 28px",
            gap: isMobile ? 14 : 18,
            overflow: "auto",
            transition: "padding 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          {pageLoading ? (
            <ListSkeleton />
          ) : (
            <>
              {/* Heading + copy text + New instruction button */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <h1 style={{
                    margin: 0,
                    fontSize: isMobile ? 24 : 20,
                    fontWeight: 700,
                    color: ws.heading,
                    fontFamily: f,
                    transition: "font-size 0.2s ease",
                  }}>
                    Instructions
                  </h1>
                  <p style={{ margin: 0, fontSize: isMobile ? 14 : 13, color: ws.secondary, lineHeight: 1.4, fontFamily: f }}>
                    Manage the instructions.md files that control how each Worker behaves in production.
                  </p>
                </div>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: 36,
                    padding: "0 16px",
                    borderRadius: 8,
                    border: "none",
                    background: ws.primary,
                    color: "#FFF",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: f,
                    cursor: "pointer",
                    flexShrink: 0,
                    boxShadow: "0 1px 3px rgba(80,40,236,0.2)",
                    transition: "background 0.15s ease, transform 0.1s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = ws.primaryHover;
                    e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = ws.primary;
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <Plus size={14} />
                  New instruction
                </button>
              </div>

              {/* Hero search — caps at 480, shrinks when the detail panel opens */}
              <div style={{ marginTop: -4, maxWidth: 480 }}>
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search instructions..."
                  variant="prominent"
                  width="100%"
                />
              </div>

              {/* List */}
              <Card>
                {filtered.map((item) => (
                  <InstructionRow
                    key={item.id}
                    item={item}
                    isSelected={item.id === selectedId}
                    compact={isMobile}
                    onSelect={() => handleSelect(item.id)}
                  />
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding: 40, textAlign: "center" }}>
                    <p style={{ fontSize: 13, color: ws.muted, fontFamily: f }}>No instructions match your search</p>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>

      {/* ── Mobile backdrop ── */}
      {isMobile && (
        <div
          onClick={() => setSelectedId(null)}
          style={{
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            opacity: panelOpen ? 1 : 0,
            pointerEvents: panelOpen ? "auto" : "none",
            transition: `opacity 0.24s ${spring}`,
            zIndex: 9,
          }}
        />
      )}

      {/* ── Panel ── */}
      {isMobile ? (
        /* Mobile: bottom sheet */
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: "88vh",
          transform: panelOpen ? "translateY(0)" : "translateY(100%)",
          transition: `transform 0.32s ${spring}`,
          pointerEvents: panelOpen ? "auto" : "none",
          zIndex: 10,
        }}>
          <div style={{
            width: "100%", height: "100%", display: "flex", flexDirection: "column",
            borderRadius: "20px 20px 0 0",
            backgroundColor: ws.panelBg,
            boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}>
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px", flexShrink: 0 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#D6D3D1" }} />
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              {selectedItem && (
                <InstructionPanel
                  key={panelKey}
                  item={selectedItem}
                  onClose={() => setSelectedId(null)}
                  isMobile
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Desktop: inline floating card */
        selectedItem && (
          <InstructionPanel
            key={panelKey}
            item={selectedItem}
            onClose={() => setSelectedId(null)}
          />
        )
      )}

      {/* Create Instruction Modal */}
      <CreateInstructionModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
