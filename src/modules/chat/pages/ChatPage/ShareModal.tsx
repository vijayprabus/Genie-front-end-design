import { useState, useEffect, useCallback, useRef } from "react";
import { Lock, Building2, Link, Check, X, Loader2 } from "lucide-react";
import { ws, f, spring } from "@/shared/utils/contentTokens";
import { useIsMobile } from "@/shared/hooks/use-mobile";

type Scope = "private" | "team" | "org";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScope: Scope;
  onScopeChange: (scope: Scope) => void;
}

/* ── Scope config ── */
const SCOPE_LABELS: Record<Scope, string> = {
  private: "Private",
  team: "Design Team",
  org: "Marico",
};

const SCOPE_META: Record<Scope, string> = {
  private: "Only you",
  team: "Your team · 12 members",
  org: "Your whole org",
};

const SCOPE_ACTION: Record<Scope, string> = {
  private: "",
  team: "Share with your team",
  org: "Share with your org",
};

/* ── Main component ── */
export function ShareModal({ isOpen, onClose, currentScope, onScopeChange }: ShareModalProps) {
  const isMobile = useIsMobile();
  const [committedScope, setCommittedScope] = useState<Scope>(currentScope);
  const [pendingScope, setPendingScope] = useState<Scope | null>(null);
  const [saveState, setSaveState] = useState<null | "saving" | "saved">(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyHovered, setCopyHovered] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoveredRow, setHoveredRow] = useState<Scope | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setCommittedScope(currentScope); }, [currentScope]);

  // Focus close button on open
  useEffect(() => { if (isOpen) setTimeout(() => closeRef.current?.focus(), 0); }, [isOpen]);

  // Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (saveTimer2Ref.current) clearTimeout(saveTimer2Ref.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Derived
  const displayScope = pendingScope ?? committedScope;
  const hasUnsavedChange = pendingScope !== null && pendingScope !== committedScope;
  const isRevoking = hasUnsavedChange && pendingScope === "private" && committedScope !== "private";
  const isShared = committedScope !== "private";
  const showCopyLink = isShared && !hasUnsavedChange && saveState !== "saving";

  const handleRowClick = (scope: Scope) => {
    if (saveState === "saving") return;
    if (scope === committedScope && pendingScope === null) return;
    if (scope === committedScope && pendingScope !== null) {
      setPendingScope(null);
      return;
    }
    setPendingScope(scope);
  };

  const handleCommit = useCallback(() => {
    if (saveState === "saving") return;
    if (!pendingScope || pendingScope === committedScope) return;
    setSaveState("saving");
    setCopied(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (saveTimer2Ref.current) clearTimeout(saveTimer2Ref.current);
    saveTimerRef.current = setTimeout(() => {
      setCommittedScope(pendingScope);
      onScopeChange(pendingScope);
      setPendingScope(null);
      setSaveState("saved");
      saveTimer2Ref.current = setTimeout(() => setSaveState(null), 1600);
    }, 600);
  }, [pendingScope, committedScope, onScopeChange, saveState]);

  const handleCancel = () => { if (saveState !== "saving") setPendingScope(null); };

  const handleCopyLink = () => {
    if (copied) return;
    navigator.clipboard.writeText(`https://genieforge.app/share/${Math.random().toString(36).slice(2, 10)}`).catch(() => {});
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 1500);
  };

  if (!isOpen) return null;

  // Footer button
  let actionLabel = "";
  let actionDestructive = false;
  if (hasUnsavedChange) {
    if (isRevoking) {
      actionLabel = "Remove access";
      actionDestructive = true;
    } else if (committedScope === "private") {
      actionLabel = SCOPE_ACTION[pendingScope!] || `Share`;
    } else {
      actionLabel = "Update access";
    }
  }

  const scopes: Scope[] = ["private", "team", "org"];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 52,
          backgroundColor: "rgba(41,37,36,0.25)",
          animation: "share-fade-in 0.18s ease-out",
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share conversation"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed", zIndex: 53,
          ...(isMobile ? {
            bottom: 0, left: 0, right: 0, top: "auto",
            width: "100%", height: "auto", maxHeight: "80vh",
            borderRadius: "20px 20px 0 0",
            transform: "none",
            animation: `share-slide-up 0.32s ${spring}`,
          } : {
            top: "20%", left: "50%", transform: "translateX(-50%)",
            width: 420, maxWidth: "calc(100vw - 32px)",
            borderRadius: 14,
            animation: "share-scale-in 0.18s cubic-bezier(0.16,1,0.3,1)",
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

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: `1px solid ${ws.border}`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: ws.heading, fontFamily: f }}>Share</span>
            {committedScope !== "private" && (
              <span style={{ fontSize: 11, fontWeight: 400, color: ws.muted_text, fontFamily: f }}>
                Shared with {SCOPE_LABELS[committedScope]}
              </span>
            )}
          </div>
          <button
            ref={closeRef}
            aria-label="Close"
            onClick={onClose}
            style={{
              width: 28, height: 28, border: "none",
              backgroundColor: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: ws.muted_text, borderRadius: 6,
              transition: "color 0.15s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = ws.primary; e.currentTarget.style.transform = "scale(1.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = ws.muted_text; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <X size={14} color="currentColor" />
          </button>
        </div>

        {/* ── Scope rows — Teams page pattern: full-bleed, dividers, single-line ── */}
        <div role="radiogroup" aria-label="Share scope">
          {scopes.map((key, i) => {
            const isCommitted = key === committedScope && pendingScope === null;
            const isSelected = key === displayScope;
            const isHovered = hoveredRow === key;
            const isNoOp = key === committedScope && pendingScope === null;
            const isLast = i === scopes.length - 1;

            // Background — full bleed, no border radius
            let bg = "transparent";
            if (isSelected) bg = ws.elevated;
            else if (isHovered) bg = ws.hoverBg;

            // Leading 28×28
            let leading: React.ReactNode;
            const iconSize = isMobile ? 24 : 28;
            if (key === "team") {
              leading = (
                <div style={{
                  width: iconSize, height: iconSize, borderRadius: 7,
                  backgroundColor: "#3D6B6B",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: ws.onPrimary, fontFamily: f, lineHeight: 1 }}>DT</span>
                </div>
              );
            } else {
              // Lock or Building in an elevated circle
              const IconComp = key === "private" ? Lock : Building2;
              const iconColor = isSelected ? ws.primary : isHovered ? ws.secondary : ws.muted_text;
              leading = (
                <div style={{
                  width: iconSize, height: iconSize, borderRadius: iconSize / 2,
                  backgroundColor: ws.elevated,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  transition: "background-color 0.12s ease",
                }}>
                  <IconComp size={isMobile ? 16 : 14} color={iconColor} style={{ transition: "color 0.12s ease" }} />
                </div>
              );
            }

            // Right side
            let rightContent: React.ReactNode = null;
            if (isCommitted && saveState !== "saving") {
              // Green check briefly after save, then violet check as resting state
              const checkColor = saveState === "saved" ? ws.success : ws.primary;
              rightContent = (
                <Check size={14} color={checkColor} strokeWidth={2.5} style={{ flexShrink: 0, transition: "color 0.3s ease" }} />
              );
            } else if (!isSelected && SCOPE_META[key]) {
              // Metadata for unselected rows
              rightContent = (
                <span style={{ fontSize: 11, fontWeight: 400, color: ws.muted_text, fontFamily: f, flexShrink: 0 }}>
                  {SCOPE_META[key]}
                </span>
              );
            }

            return (
              <div key={key}>
                <div
                  role="radio"
                  aria-checked={isCommitted}
                  onClick={() => handleRowClick(key)}
                  onMouseEnter={() => !isMobile && !isNoOp && setHoveredRow(key)}
                  onMouseLeave={() => !isMobile && setHoveredRow(null)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "8px 16px", height: isMobile ? 56 : 44,
                    cursor: isNoOp ? "default" : "pointer",
                    backgroundColor: bg,
                    transition: "background-color 0.12s ease",
                    userSelect: "none",
                  }}
                >
                  {leading}
                  <span style={{
                    fontSize: 13, fontWeight: 500, flex: 1,
                    color: isSelected ? ws.heading : ws.body,
                    fontFamily: f,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {SCOPE_LABELS[key]}
                  </span>
                  {rightContent}
                </div>
                {/* Full-width divider between rows (not after last) */}
                {!isLast && (
                  <div style={{ height: 1, backgroundColor: ws.border }} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Copy link (only when shared, committed, not saving) ── */}
        <div style={{
          maxHeight: showCopyLink ? 46 : 0,
          opacity: showCopyLink ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 200ms ease-out, opacity 200ms ease-out",
        }}>
          <div style={{ height: 1, backgroundColor: ws.border }} />
          <div
            onClick={handleCopyLink}
            onMouseEnter={() => setCopyHovered(true)}
            onMouseLeave={() => setCopyHovered(false)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "0 16px", height: 44, cursor: "pointer",
            }}
          >
            {copied ? (
              <Check size={14} color={ws.success} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            ) : (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.15s ease",
                transform: copyHovered ? "scale(1.1)" : "scale(1)",
              }}>
                <Link
                  size={14}
                  color={copyHovered ? ws.primary : ws.muted_text}
                  style={{ transition: "color 0.15s ease", flexShrink: 0 }}
                />
              </div>
            )}
            <span style={{
              fontSize: 13,
              fontWeight: copied ? 500 : 400,
              color: copied ? ws.success : copyHovered ? ws.heading : ws.body,
              fontFamily: f,
              transition: "color 0.15s ease",
            }}>
              {copied ? "Copied!" : "Copy link"}
            </span>
          </div>
        </div>

        {/* ── Footer (only when uncommitted change exists) ── */}
        <div style={{
          maxHeight: hasUnsavedChange ? (isMobile ? 80 : 56) : 0,
          opacity: hasUnsavedChange ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 200ms ease-out, opacity 200ms ease-out",
        }}>
          <div style={{ height: 1, backgroundColor: ws.border }} />
          <div style={{
            display: "flex",
            alignItems: "center",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: isMobile ? "stretch" : "flex-end",
            gap: isMobile ? 8 : 10,
            padding: isMobile ? "10px 16px 16px" : "10px 16px",
          }}>
            {isMobile ? (
              /* Mobile: stacked full-width buttons */
              <>
                <button
                  onClick={handleCommit}
                  disabled={saveState === "saving"}
                  style={{
                    width: "100%", height: 48,
                    border: actionDestructive ? `1px solid ${ws.error}` : "none",
                    backgroundColor: saveState === "saving"
                      ? (actionDestructive ? ws.errorBg : ws.primaryHover)
                      : (actionDestructive ? "transparent" : ws.primary),
                    color: actionDestructive ? ws.error : ws.onPrimary,
                    fontSize: 14, fontWeight: actionDestructive ? 500 : 600,
                    fontFamily: f, borderRadius: 8,
                    cursor: saveState === "saving" ? "default" : "pointer",
                    transition: "background-color 0.15s ease",
                    display: "flex", alignItems: "center", gap: 6,
                    justifyContent: "center",
                  }}
                >
                  {saveState === "saving" ? (
                    <>
                      <Loader2 size={13} color={actionDestructive ? ws.error : ws.onPrimary} style={{ animation: "share-spin 0.8s linear infinite" }} />
                      <span>{actionDestructive ? "Removing..." : "Sharing..."}</span>
                    </>
                  ) : actionLabel}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saveState === "saving"}
                  style={{
                    width: "100%", height: 48,
                    border: `1px solid ${ws.border}`,
                    backgroundColor: "transparent",
                    color: ws.muted_text,
                    fontSize: 14, fontWeight: 500,
                    fontFamily: f, borderRadius: 8,
                    cursor: saveState === "saving" ? "default" : "pointer",
                    opacity: saveState === "saving" ? 0.5 : 1,
                    transition: "background-color 0.15s ease",
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              /* Desktop: inline row */
              <>
                <span
                  onClick={handleCancel}
                  style={{
                    fontSize: 13, fontWeight: 500, color: ws.muted_text,
                    fontFamily: f, cursor: saveState === "saving" ? "default" : "pointer",
                    opacity: saveState === "saving" ? 0.5 : 1,
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => { if (saveState !== "saving") e.currentTarget.style.color = ws.body; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = ws.muted_text; }}
                >
                  Cancel
                </span>
                <button
                  onClick={handleCommit}
                  disabled={saveState === "saving"}
                  style={{
                    border: actionDestructive ? `1px solid ${ws.error}` : "none",
                    backgroundColor: saveState === "saving"
                      ? (actionDestructive ? ws.errorBg : ws.primaryHover)
                      : (actionDestructive ? "transparent" : ws.primary),
                    color: actionDestructive ? ws.error : ws.onPrimary,
                    fontSize: 13, fontWeight: actionDestructive ? 500 : 600,
                    fontFamily: f, borderRadius: 8,
                    padding: "7px 14px",
                    cursor: saveState === "saving" ? "default" : "pointer",
                    transition: "background-color 0.15s ease",
                    display: "inline-flex", alignItems: "center", gap: 6,
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    if (saveState === "saving") return;
                    if (actionDestructive) e.currentTarget.style.backgroundColor = ws.errorBg;
                    else e.currentTarget.style.backgroundColor = ws.primaryHover;
                  }}
                  onMouseLeave={(e) => {
                    if (saveState === "saving") return;
                    if (actionDestructive) e.currentTarget.style.backgroundColor = "transparent";
                    else e.currentTarget.style.backgroundColor = ws.primary;
                  }}
                >
                  {saveState === "saving" ? (
                    <>
                      <Loader2 size={13} color={actionDestructive ? ws.error : ws.onPrimary} style={{ animation: "share-spin 0.8s linear infinite" }} />
                      <span>{actionDestructive ? "Removing..." : "Sharing..."}</span>
                    </>
                  ) : actionLabel}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes share-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes share-scale-in { from { opacity: 0; transform: translateX(-50%) scale(0.98); } to { opacity: 1; transform: translateX(-50%) scale(1); } }
        @keyframes share-slide-up { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes share-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
