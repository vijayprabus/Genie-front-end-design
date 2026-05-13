import { useState, useEffect, useRef } from "react";
import { History, SquarePen, Share2, Pencil, Loader2, Check, MessageSquare, ChevronDown } from "lucide-react";
import { Sun, SunHorizon, Moon } from "@phosphor-icons/react";
import { useChat } from "@/modules/chat/hooks/useChat";
import { QuickSwitcher } from "./QuickSwitcher";
import { ShareModal } from "./ShareModal";
import { UserBubble } from "./UserBubble";
import { GenieResponse } from "./GenieResponse";
import { MessageInput } from "./MessageInput";
import { ToolCarousel } from "./ToolCarousel";
import { ToolGrid } from "./ToolGrid";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { ws, f } from "@/shared/utils/contentTokens";

function getGreeting(): { text: string; icon: typeof Sun; color: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sun, color: ws.warning };
  if (hour < 17) return { text: "Good afternoon", icon: SunHorizon, color: "#F97316" };
  return { text: "Good evening", icon: Moon, color: ws.primary };
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1d";
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── Dark pill tooltip — fixed position, viewport-clamped ── */
function Tooltip({ text, anchorRef }: { text: string; anchorRef: React.RefObject<HTMLElement | null> }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    const tip = tipRef.current;
    if (!anchor || !tip) return;
    const r = anchor.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
    let top = r.bottom + 6;
    if (top + th > window.innerHeight - 8) {
      top = r.top - th - 6;
    }
    setPos({ top, left });
  }, [anchorRef]);

  return (
    <div
      ref={tipRef}
      style={{
        position: "fixed", zIndex: 100,
        top: pos?.top ?? -9999, left: pos?.left ?? -9999,
        opacity: pos ? 1 : 0,
        transition: "opacity 0.15s ease",
        pointerEvents: "none", whiteSpace: "nowrap",
        backgroundColor: ws.heading, color: ws.onPrimary,
        fontSize: 10, fontWeight: 500, fontFamily: f,
        padding: "4px 8px", borderRadius: 4,
      }}
    >
      {text}
    </div>
  );
}

/* ── Top bar icon — darker, 16px ── */
function TopBarIcon({ icon: Icon, tooltip, onClick }: {
  icon: typeof History;
  tooltip: string;
  onClick?: () => void;
}) {
  const [showTip, setShowTip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleEnter = () => {
    timerRef.current = setTimeout(() => setShowTip(true), 600);
  };
  const handleLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowTip(false);
  };

  return (
    <div style={{ position: "relative" }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        ref={btnRef}
        onClick={onClick}
        className="topbar-icon"
        aria-label={tooltip}
        style={{
          width: 32, height: 32, borderRadius: 6, border: "none",
          backgroundColor: "transparent", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: ws.secondary,
          transition: "transform 0.15s ease, color 0.15s ease",
        }}
      >
        <Icon size={16} color="currentColor" />
      </button>
      {showTip && (
        <Tooltip text={tooltip} anchorRef={btnRef} />
      )}
    </div>
  );
}

/* ── Recent history row ── */
function RecentRow({ title, time, onClick }: { title: string; time: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "4px 8px", borderRadius: 6,
        cursor: "pointer",
        backgroundColor: hovered ? ws.elevated : "transparent",
        transition: "background-color 0.12s ease",
      }}
    >
      <MessageSquare
        size={12}
        color={ws.muted_text}
        style={{ flexShrink: 0 }}
      />
      <span style={{
        flex: 1, fontSize: 12, fontWeight: 400, fontFamily: f,
        color: hovered ? ws.body : ws.muted_text,
        transition: "color 0.12s ease",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {title}
      </span>
      <span style={{
        fontSize: 11, fontWeight: 400, fontFamily: f,
        color: ws.muted_text, flexShrink: 0,
      }}>
        {time}
      </span>
    </div>
  );
}

export default function ChatPage() {
  const { sessions, activeChatId, messages, isLoading, isSending, setActiveChat, sendMessage, createNewChat, fetchSessions } = useChat();
  const isMobile = useIsMobile();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareScope, setShareScope] = useState<"private" | "team" | "org">("private");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleHovered, setTitleHovered] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [titleSaveState, setTitleSaveState] = useState<null | "saving" | "saved">(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setShareScope("private");
    setShareOpen(false);
  }, [activeChatId]);

  const activeSession = sessions.find(s => s.id === activeChatId);
  const recentSessions = sessions.slice(0, 3);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSwitcherOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        createNewChat();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [createNewChat]);

  const [viewAllHovered, setViewAllHovered] = useState(false);

  function handleMessagesScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollFab(distFromBottom > 200);
  }

  function scrollToBottom() {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", fontFamily: f, backgroundColor: ws.page }}>

      {/* ── Header ──────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "8px 16px" : "8px 24px",
        height: isMobile ? 44 : 48,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <TopBarIcon icon={SquarePen} tooltip="New conversation ⌘N" onClick={() => createNewChat()} />
          <TopBarIcon icon={History} tooltip="Chat history ⌘K" onClick={() => setSwitcherOpen(true)} />

          {!activeSession && (
            <span style={{
              fontSize: 14, fontWeight: 500, color: ws.heading, fontFamily: f,
              marginLeft: 8,
            }}>
              New conversation
            </span>
          )}

          {activeSession && (
            <div
              onMouseEnter={() => setTitleHovered(true)}
              onMouseLeave={() => setTitleHovered(false)}
              style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8, minWidth: 0 }}
            >
              {editingTitle ? (
                <div style={{ borderBottom: `1.5px solid ${ws.primary}`, paddingBottom: 1 }}>
                  <input
                    ref={titleRef}
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setEditingTitle(false);
                        setTitleSaveState("saving");
                        setTimeout(() => setTitleSaveState("saved"), 500);
                        setTimeout(() => setTitleSaveState(null), 1800);
                      }
                      if (e.key === "Escape") { setEditingTitle(false); }
                    }}
                    onBlur={() => {
                      setEditingTitle(false);
                      setTitleSaveState("saving");
                      setTimeout(() => setTitleSaveState("saved"), 500);
                      setTimeout(() => setTitleSaveState(null), 1800);
                    }}
                    style={{
                      border: "none", outline: "none", backgroundColor: "transparent",
                      fontSize: 14, fontWeight: 500, fontFamily: f, color: ws.heading,
                      padding: 0, margin: 0, width: `${Math.max(titleValue.length, 1)}ch`,
                    }}
                  />
                </div>
              ) : (
                <span
                  onClick={() => {
                    setTitleValue(activeSession.title);
                    setEditingTitle(true);
                    setTimeout(() => titleRef.current?.focus(), 0);
                  }}
                  style={{
                    fontSize: 14, fontWeight: 500, color: ws.heading, fontFamily: f,
                    cursor: "text", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}
                >
                  {activeSession.title}
                </span>
              )}

              {!editingTitle && (
                <span style={{
                  opacity: titleSaveState ? 1 : titleHovered ? 0.4 : 0,
                  transition: "opacity 0.15s ease",
                  display: "flex", alignItems: "center",
                }}>
                  {titleSaveState === "saving"
                    ? <Loader2 size={11} color={ws.muted_text} style={{ animation: "topbar-spin 0.8s linear infinite" }} />
                    : titleSaveState === "saved"
                    ? <Check size={11} color={ws.success} />
                    : <Pencil size={11} color={ws.muted_text} />
                  }
                </span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {activeSession && (
            <div style={{ position: "relative" }}>
              <TopBarIcon icon={Share2} tooltip="Share conversation" onClick={() => setShareOpen(true)} />
              {shareScope !== "private" && (
                <div style={{
                  position: "absolute", top: 4, right: 4,
                  width: 6, height: 6, borderRadius: 3,
                  backgroundColor: ws.primary,
                  border: `1.5px solid ${ws.page}`,
                }} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .topbar-icon:hover { color: ${ws.primary} !important; transform: scale(1.15); }
        @keyframes topbar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @media (prefers-reduced-motion: no-preference) {
          .landing-greeting { opacity: 0; transform: scale(0.97); animation: greetSettle 0.4s ease-out forwards; }
          @keyframes greetSettle { to { opacity: 1; transform: scale(1); } }
          .landing-time-icon { animation: iconGlow 1s ease-out forwards; }
          @keyframes iconGlow {
            0% { filter: drop-shadow(0 0 0px transparent); }
            30% { filter: drop-shadow(0 0 6px currentColor); }
            100% { filter: drop-shadow(0 0 0px transparent); }
          }
          .landing-card { opacity: 0; transform: scale(0.96); animation: cardEmerge 0.35s ease-out forwards; }
          @keyframes cardEmerge { to { opacity: 1; transform: scale(1); } }
          .landing-history { opacity: 0; animation: histFade 0.3s ease-out forwards; }
          @keyframes histFade { to { opacity: 1; } }
        }
        @media (prefers-reduced-motion: reduce) {
          .landing-greeting, .landing-card, .landing-history { opacity: 1 !important; transform: none !important; animation: none !important; }
          .landing-time-icon { animation: none !important; }
        }
      `}</style>

      {/* ── Messages / Landing ───────────────────────────── */}
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflowY: "auto", padding: isMobile ? "0 16px" : "0 24px" }}
      >
        {!activeChatId ? (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 0, padding: "0 24px",
          }}>
            {/* Spacer — pushes content to visual center without layout shift */}
            <div style={{ flex: "1 1 0", minHeight: 40, maxHeight: isMobile ? "15vh" : "25vh" }} />
            {/* Greeting — settles in */}
            <div
              className="landing-greeting"
              style={{ textAlign: "center", marginBottom: 28, animationDelay: "80ms" }}
            >
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                {(() => { const g = getGreeting(); const GIcon = g.icon; return (
                  <>
                    <GIcon
                      className="landing-time-icon"
                      size={28}
                      color={g.color}
                      weight="fill"
                      style={{ animationDelay: "300ms" }}
                    />
                    <h1 style={{
                      fontSize: isMobile ? 20 : 24, fontWeight: 700, color: ws.heading,
                      fontFamily: f, margin: 0, lineHeight: 1.3,
                    }}>
                      {g.text}, Vijay
                    </h1>
                  </>
                ); })()}
              </div>
              <p style={{
                fontSize: 13, fontWeight: 400, color: ws.secondary,
                fontFamily: f, margin: "6px 0 0",
              }}>
                What would you like to explore today?
              </p>
            </div>

            {/* Input bar — immediate */}
            <div style={{ maxWidth: isMobile ? "100%" : 780, width: "100%", marginBottom: 14 }}>
              <MessageInput
                onSend={(text) => {
                  createNewChat();
                  sendMessage(text);
                }}
                disabled={false}
              />
            </div>

            {/* Tool carousel / grid */}
            {isMobile ? (
              <ToolGrid onToolClick={(prompt) => {
                createNewChat();
                sendMessage(prompt);
              }} />
            ) : (
              <ToolCarousel onToolClick={(prompt) => {
                createNewChat();
                sendMessage(prompt);
              }} />
            )}

            {/* Recent conversations */}
            {recentSessions.length > 0 && (
              <div
                className="landing-history"
                style={{ width: isMobile ? "100%" : 440, marginTop: 20, animationDelay: "550ms" }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 500, color: ws.muted_text,
                  fontFamily: f, marginBottom: 4, paddingLeft: 8,
                }}>
                  Recent
                </div>
                {recentSessions.map((session) => (
                  <RecentRow
                    key={session.id}
                    title={session.title}
                    time={formatTime(session.updatedAt)}
                    onClick={() => setActiveChat(session.id)}
                  />
                ))}
                {!isMobile && (
                  <div style={{ display: "flex", justifyContent: "flex-end", padding: "2px 8px 0" }}>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => setSwitcherOpen(true)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSwitcherOpen(true); }}
                      onMouseEnter={() => setViewAllHovered(true)}
                      onMouseLeave={() => setViewAllHovered(false)}
                      style={{
                        fontSize: 11, fontWeight: 500, fontFamily: f,
                        color: viewAllHovered ? ws.body : ws.muted_text,
                        cursor: "pointer",
                        transition: "color 0.12s ease",
                      }}
                    >
                      View all →
                    </span>
                  </div>
                )}
              </div>
            )}
            {/* Bottom spacer — balances the top spacer */}
            <div style={{ flex: "1.5 1 0", minHeight: 20 }} />
          </div>
        ) : (
          <div style={{ maxWidth: isMobile ? "100%" : 780, margin: "0 auto", width: "100%" }}>
            {isLoading && messages.length === 0 ? (
              /* Skeleton loader — warm shimmer */
              <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "12px 0" }}>
                {/* User bubble skeleton */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    width: isMobile ? 200 : 260, height: 44, borderRadius: "18px 18px 4px 18px",
                    background: `linear-gradient(90deg, ${ws.elevated} 0%, ${ws.hoverBg} 50%, ${ws.elevated} 100%)`,
                    backgroundSize: "800px 44px", animation: "shimmer 1.5s ease-in-out infinite",
                  }} />
                </div>
                {/* Genie response skeleton */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{
                    width: 180, height: 16, borderRadius: 6,
                    background: `linear-gradient(90deg, ${ws.elevated} 0%, ${ws.hoverBg} 50%, ${ws.elevated} 100%)`,
                    backgroundSize: "800px 16px", animation: "shimmer 1.5s ease-in-out infinite",
                  }} />
                  <div style={{
                    width: "90%", height: 12, borderRadius: 6,
                    background: `linear-gradient(90deg, ${ws.elevated} 0%, ${ws.hoverBg} 50%, ${ws.elevated} 100%)`,
                    backgroundSize: "800px 12px", animation: "shimmer 1.5s ease-in-out infinite", animationDelay: "0.1s",
                  }} />
                  <div style={{
                    width: "75%", height: 12, borderRadius: 6,
                    background: `linear-gradient(90deg, ${ws.elevated} 0%, ${ws.hoverBg} 50%, ${ws.elevated} 100%)`,
                    backgroundSize: "800px 12px", animation: "shimmer 1.5s ease-in-out infinite", animationDelay: "0.2s",
                  }} />
                  {/* Table skeleton */}
                  <div style={{
                    width: "100%", height: 120, borderRadius: 14, marginTop: 4,
                    background: `linear-gradient(90deg, ${ws.elevated} 0%, ${ws.hoverBg} 50%, ${ws.elevated} 100%)`,
                    backgroundSize: "800px 120px", animation: "shimmer 1.5s ease-in-out infinite", animationDelay: "0.3s",
                  }} />
                </div>
                {/* Second user bubble skeleton */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    width: isMobile ? 160 : 200, height: 36, borderRadius: "18px 18px 4px 18px",
                    background: `linear-gradient(90deg, ${ws.elevated} 0%, ${ws.hoverBg} 50%, ${ws.elevated} 100%)`,
                    backgroundSize: "800px 36px", animation: "shimmer 1.5s ease-in-out infinite", animationDelay: "0.4s",
                  }} />
                </div>
              </div>
            ) : messages.map((msg) => (
              msg.role === "user" ? (
                <UserBubble key={msg.id} content={msg.content} timestamp={msg.timestamp} />
              ) : (
                <GenieResponse key={msg.id} blocks={(msg as { blocks?: import("@/modules/chat/types").MessageBlock[] }).blocks} content={msg.content} timestamp={msg.timestamp} />
              )
            ))}
            {isSending && (
              <div style={{ display: "flex", gap: 12, padding: "12px 0" }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ws.primary, opacity: 0.4, animation: "teams-fade-in 0.8s ease infinite alternate" }} />
                <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ws.primary, opacity: 0.4, animation: "teams-fade-in 0.8s ease 0.2s infinite alternate" }} />
                <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ws.primary, opacity: 0.4, animation: "teams-fade-in 0.8s ease 0.4s infinite alternate" }} />
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      {/* ── Input (conversation mode) ─────────────────── */}
      {activeChatId && (
        <div style={{ padding: isMobile ? "8px 16px 16px" : "12px 24px 20px", flexShrink: 0 }}>
          <div style={{ maxWidth: isMobile ? "100%" : 780, margin: "0 auto" }}>
            <MessageInput
              onSend={(text) => { sendMessage(text); }}
              disabled={isSending}
            />
          </div>
        </div>
      )}

      {/* ── Scroll-to-bottom FAB ──────────────────────── */}
      {activeChatId && (
        <button
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          style={{
            position: "fixed",
            bottom: 80,
            right: isMobile ? 16 : 24,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: ws.surface,
            border: `1px solid ${ws.border}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            opacity: showScrollFab ? 1 : 0,
            pointerEvents: showScrollFab ? "auto" : "none",
            transition: "opacity 0.15s ease",
            zIndex: 10,
          }}
        >
          <ChevronDown size={18} color={ws.secondary} />
        </button>
      )}

      {/* ── Quick Switcher ─────────────────────────────── */}
      {switcherOpen && (
        <QuickSwitcher
          sessions={sessions}
          activeChatId={activeChatId}
          onSelect={(id) => { setActiveChat(id); setSwitcherOpen(false); }}
          onNewChat={() => { createNewChat(); setSwitcherOpen(false); }}
          onClose={() => setSwitcherOpen(false)}
        />
      )}

      {/* ── Share Modal ───────────────────────────────── */}
      {shareOpen && (
        <ShareModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          currentScope={shareScope}
          onScopeChange={setShareScope}
        />
      )}
    </div>
  );
}
