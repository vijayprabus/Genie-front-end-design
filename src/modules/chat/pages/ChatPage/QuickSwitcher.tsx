import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, X, MessageSquare } from "lucide-react";
import { ws, f, spring } from "@/shared/utils/contentTokens";
import { useIsMobile } from "@/shared/hooks/use-mobile";

interface Session {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
}

interface QuickSwitcherProps {
  sessions: Session[];
  activeChatId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: ws.divider }} />;
}

export function QuickSwitcher({ sessions, activeChatId, onSelect, onNewChat, onClose }: QuickSwitcherProps) {
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    const t = setTimeout(() => setContentReady(true), 180);
    return () => clearTimeout(t);
  }, []);

  // Escape to close (only if not renaming)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !renamingId) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, renamingId]);

  // Filter sessions
  const filtered = query.trim()
    ? sessions.filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.lastMessage.toLowerCase().includes(query.toLowerCase())
      )
    : sessions;

  // Track overflow for scroll affordance
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setIsOverflowing(el.scrollHeight > el.clientHeight);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length, query]);

  const totalItems = 1 + filtered.length;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isMobile) return; // touch scrolling on mobile, no keyboard nav
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, totalItems - 1));
      setHoveredIndex(null);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
      setHoveredIndex(null);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = selectedIndex;
      if (idx === 0) onNewChat();
      else if (idx > 0 && filtered[idx - 1]) onSelect(filtered[idx - 1].id);
    }
  }, [isMobile, selectedIndex, totalItems, filtered, onNewChat, onSelect]);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          backgroundColor: "rgba(41, 37, 36, 0.25)",
          animation: "qs-fade-in 0.18s ease-out",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed", zIndex: 51,
          ...(isMobile ? {
            bottom: 0, left: 0, right: 0, top: "auto",
            width: "100%", height: "85vh",
            borderRadius: "20px 20px 0 0",
            transform: "none",
            animation: `qs-slide-up 0.32s ${spring}`,
          } : {
            top: "20%", left: "50%", transform: "translateX(-50%)",
            width: 480, maxWidth: "calc(100vw - 32px)",
            borderRadius: 14,
            animation: "qs-scale-in 0.18s cubic-bezier(0.16,1,0.3,1)",
          }),
          backgroundColor: ws.surface,
          border: `1px solid ${ws.border}`,
          boxShadow: "0 0 0 1px rgba(41,37,36,0.04), 0 8px 24px rgba(41,37,36,0.14), 0 24px 48px rgba(41,37,36,0.08)",
          overflow: "hidden",
          fontFamily: f,
          display: "flex", flexDirection: "column" as const,
        }}
      >
        {/* ── Drag handle (mobile only) ── */}
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 6px", flexShrink: 0 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: ws.inputBorder }} />
          </div>
        )}

        {/* ── Search (pinned, never scrolls) ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "14px 16px",
          borderBottom: `1px solid ${ws.divider}`, flexShrink: 0,
        }}>
          <Search size={16} color={ws.muted_text} style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); }}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            style={{
              flex: 1, border: "none", outline: "none", backgroundColor: "transparent",
              fontSize: isMobile ? 16 : 15, fontWeight: 400, fontFamily: f, color: ws.body,
              height: isMobile ? 44 : undefined,
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              style={{
                border: "none", backgroundColor: "transparent", cursor: "pointer",
                display: "flex", alignItems: "center", padding: 4,
              }}
            >
              <X size={14} color={ws.muted_text} />
            </button>
          )}
        </div>

        {/* ── Scrollable list area ── */}
        <div ref={scrollRef} className="qs-scroll-area" style={{ maxHeight: isMobile ? undefined : 360, flex: isMobile ? 1 : undefined, overflowY: "auto", position: "relative" }}>

          {/* New conversation — pinned first row */}
          <div
            onClick={onNewChat}
            onMouseEnter={() => !isMobile && setHoveredIndex(0)}
            onMouseLeave={() => !isMobile && setHoveredIndex(null)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: isMobile ? "12px 20px" : "12px 14px", cursor: "pointer",
              backgroundColor: ws.primaryLight,
              transition: "background-color 0.15s ease",
            }}
          >
            <Plus size={16} color={ws.primary} strokeWidth={2.5} style={{
              flexShrink: 0,
              transform: (hoveredIndex === 0) ? "scale(1.15)" : "scale(1)",
              transition: "transform 0.15s ease",
            }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: ws.primary, fontFamily: f, flex: 1 }}>
              New conversation
            </span>
            <span style={{
              fontSize: 10, fontWeight: 500, color: ws.muted_text, fontFamily: f,
              padding: "2px 5px", borderRadius: 6, backgroundColor: ws.elevated,
            }}>
              ⌘N
            </span>
          </div>
          <Divider />

          {/* Conversation items */}
          {!contentReady ? (
            /* ── Skeleton rows — single line, matches real row height ── */
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: isMobile ? "12px 20px" : "10px 14px",
                  height: isMobile ? 52 : undefined,
                  borderBottom: i < 5 ? `1px solid ${ws.divider}` : "none",
                }}>
                  <div style={{
                    width: `${55 + (i % 4) * 12}%`, height: 12, borderRadius: 4,
                    background: `linear-gradient(90deg, ${ws.elevated} 0%, ${ws.hoverBg} 50%, ${ws.elevated} 100%)`,
                    backgroundSize: "400px 12px", animation: "qs-shimmer 1.5s ease-in-out infinite",
                    animationDelay: `${i * 0.05}s`,
                  }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 && query.trim() ? (
            /* ── No results ── */
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "32px 24px", gap: 6,
            }}>
              <span style={{ fontSize: 13, fontWeight: 400, color: ws.muted_text, fontFamily: f }}>
                No results for &ldquo;{query}&rdquo;
              </span>
            </div>
          ) : (
            filtered.map((session, i) => {
              const itemIndex = i + 1;
              const isActive = session.id === activeChatId;
              const isHovered = hoveredIndex === itemIndex;
              const isKeySelected = hoveredIndex === null && selectedIndex === itemIndex;
              const isLast = i === filtered.length - 1;

              const bg = isActive
                ? ws.elevated
                : isHovered ? ws.hoverBg : isKeySelected ? ws.primaryLight : "transparent";

              return (
                <div key={session.id}>
                  <div
                    onClick={() => onSelect(session.id)}
                    onMouseEnter={() => !isMobile && setHoveredIndex(itemIndex)}
                    onMouseLeave={() => !isMobile && setHoveredIndex(null)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: isMobile ? "12px 20px" : "10px 14px",
                      height: isMobile ? 52 : undefined,
                      cursor: "pointer",
                      backgroundColor: bg,
                      transition: "background-color 0.12s ease",
                    }}
                  >
                    {/* ── Title (always visible) ── */}
                    {renamingId === session.id ? (
                      <input
                        ref={renameRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && renameValue.trim()) { setRenamingId(null); }
                          if (e.key === "Escape") setRenamingId(null);
                          e.stopPropagation();
                        }}
                        onBlur={() => setRenamingId(null)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1, minWidth: 0, border: "none", outline: "none",
                          backgroundColor: "transparent",
                          fontSize: 13, fontWeight: 500, color: ws.body, fontFamily: f,
                          padding: 0, margin: 0,
                        }}
                      />
                    ) : (
                      <span style={{
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: confirmDeleteId === session.id ? ws.error : isActive ? ws.heading : ws.body,
                        fontFamily: f,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                        transition: "color 0.12s ease",
                      }}>
                        {session.title}
                      </span>
                    )}

                    {/* ── Right side: timestamp / actions / delete confirm ── */}
                    {renamingId !== session.id && (
                      <div style={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center" }}>
                        {/* Timestamp (fades out on hover) */}
                        <span style={{
                          fontSize: 11, color: isActive ? ws.primary : ws.secondary, fontFamily: f,
                          fontWeight: isActive ? 500 : 400,
                          opacity: (isHovered || confirmDeleteId === session.id) ? 0 : 1, transition: "opacity 0.1s ease",
                        }}>
                          {isActive ? "Open" : formatTime(session.updatedAt)}
                        </span>

                        {confirmDeleteId === session.id ? (
                          /* ── Delete confirm: Cancel + Delete in same position as icons ── */
                          <div style={{
                            position: "absolute", right: 0, display: "flex", gap: 8, alignItems: "center",
                            animation: "qs-fade-in 0.12s ease-out",
                          }}>
                            <span
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                              style={{ fontSize: 11, fontWeight: 400, color: ws.muted_text, cursor: "pointer", fontFamily: f, transition: "color 0.12s ease" }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = ws.body; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = ws.muted_text; }}
                            >
                              Cancel
                            </span>
                            <span
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                              style={{ fontSize: 11, fontWeight: 500, color: ws.error, cursor: "pointer", fontFamily: f, transition: "opacity 0.12s ease" }}
                              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                            >
                              Delete
                            </span>
                          </div>
                        ) : (
                          /* ── Hover actions: pencil + trash ── */
                          <div style={{
                            position: "absolute", right: 0, display: "flex", gap: 2,
                            opacity: isHovered ? 1 : 0, transition: "opacity 0.1s ease",
                            pointerEvents: isHovered ? "auto" : "none",
                          }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setRenamingId(session.id); setRenameValue(session.title); setTimeout(() => renameRef.current?.focus(), 0); }}
                              style={{
                                width: 26, height: 26, border: "none",
                                backgroundColor: "transparent", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: ws.muted_text,
                                transition: "transform 0.15s ease, color 0.15s ease",
                                transform: "scale(1)",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; e.currentTarget.style.color = ws.primary; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.color = ws.muted_text; }}
                            >
                              <Pencil size={13} color="currentColor" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(session.id); }}
                              style={{
                                width: 26, height: 26, border: "none",
                                backgroundColor: "transparent", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: ws.muted_text,
                                transition: "transform 0.15s ease, color 0.15s ease",
                                transform: "scale(1)",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; e.currentTarget.style.color = ws.error; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.color = ws.muted_text; }}
                            >
                              <Trash2 size={13} color="currentColor" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {!isLast && <Divider />}
                </div>
              );
            })
          )}

          {/* Empty state for new users */}
          {sessions.length === 0 && !query.trim() && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px", gap: 12 }}>
              <MessageSquare size={28} color={ws.disabled} />
              <span style={{ fontSize: 13, color: ws.muted_text, fontFamily: f }}>Your conversations will appear here</span>
            </div>
          )}
        </div>

        {/* ── Bottom fade gradient (only when content overflows) ── */}
        {isOverflowing && (
          <div style={{
            height: 32, marginTop: -32, position: "relative", zIndex: 1,
            background: `linear-gradient(to bottom, transparent, ${ws.surface})`,
            pointerEvents: "none",
            borderRadius: "0 0 14px 14px",
          }} />
        )}
      </div>

      {/* Animations + scrollbar styling */}
      <style>{`
        @keyframes qs-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes qs-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes qs-scale-in { from { opacity: 0; transform: translateX(-50%) scale(0.98); } to { opacity: 1; transform: translateX(-50%) scale(1); } }
        @keyframes qs-slide-up { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        .qs-scroll-area::-webkit-scrollbar { width: 3px; }
        .qs-scroll-area::-webkit-scrollbar-track { background: transparent; }
        .qs-scroll-area::-webkit-scrollbar-thumb { background: ${ws.inputBorder}; border-radius: 2px; }
        .qs-scroll-area::-webkit-scrollbar-thumb:hover { background: ${ws.muted_text}; }
        .qs-scroll-area { scrollbar-width: thin; scrollbar-color: ${ws.inputBorder} transparent; }
      `}</style>
    </>
  );
}
