import { useState, useEffect } from "react";
import { X, SpinnerGap, User, ShieldCheck } from "@phosphor-icons/react";
import type { MemberRole } from "@/modules/settings/types";
import TeamPicker from "../TeamPicker";
import { ws, f, spring } from "@/shared/utils/contentTokens";
import { useIsMobile } from "@/shared/hooks/use-mobile";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onInviteSent: (email: string, role: MemberRole, teams: string[]) => void;
}

const ANIMATION_STYLE_ID = "invite-modal-animations";

function injectAnimations() {
  if (document.getElementById(ANIMATION_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = ANIMATION_STYLE_ID;
  style.textContent = `
    @keyframes inviteModalIn {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes inviteModalSlideUp {
      from { opacity: 0; transform: translateY(100%); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes inviteDropdownIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes inviteDropdownOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-8px); }
    }
    @keyframes inviteSpinnerRotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default function InviteUserModal({
  open,
  onClose,
  onInviteSent,
}: InviteUserModalProps) {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<MemberRole>("Member");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [emailFocused, setEmailFocused] = useState(false);
  const [cancelHovered, setCancelHovered] = useState(false);
  const [sendHovered, setSendHovered] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    injectAnimations();
  }, []);


  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, sending]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setEmail("");
      setSelectedRole("Member");
      setSelectedTeams([]);
      setEmailFocused(false);
      setCancelHovered(false);
      setSendHovered(false);
      setSending(false);
    }
  }, [open]);

  const handleClose = () => {
    if (sending) return;
    onClose();
  };

  const handleSubmit = () => {
    if (!email.trim() || sending) return;
    setSending(true);
    setTimeout(() => {
      onInviteSent(email.trim(), selectedRole, selectedTeams);
      onClose();
    }, 800);
  };

  const canSubmit = email.trim().length > 0 && !sending;

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.2)",
        zIndex: 50,
        fontFamily: f,
        ...(isMobile ? {} : {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }),
      }}
      onClick={handleClose}
    >
      {/* Modal card */}
      <div
        style={{
          ...(isMobile ? {
            position: "fixed",
            bottom: 0, left: 0, right: 0,
            width: "100%",
            height: "auto",
            maxHeight: "90vh",
            borderRadius: "20px 20px 0 0",
            animation: `inviteModalSlideUp 0.32s ${spring}`,
            overflowY: "auto",
          } : {
            width: 480,
            borderRadius: 14,
            animation: "inviteModalIn 200ms ease-out",
            position: "relative",
          }),
          backgroundColor: ws.surface,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile only) */}
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 6px", flexShrink: 0 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: ws.inputBorder }} />
          </div>
        )}

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${ws.divider}`,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: ws.heading }}>
            Invite User
          </span>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              padding: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: ws.muted_text,
              minWidth: 44,
              minHeight: 44,
            }}
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: ws.muted_text, marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={{
                width: "100%", height: isMobile ? 44 : 36, borderRadius: 8,
                border: `1px solid ${emailFocused ? ws.primary : ws.inputBorder}`,
                padding: "0 12px", fontSize: isMobile ? 16 : 13, fontFamily: f, color: ws.body,
                backgroundColor: ws.surface, outline: "none",
                boxSizing: "border-box", transition: "border-color 0.15s",
              }}
            />
          </div>

          {/* Role */}
          <div style={{ display: "flex", gap: 10 }}>
            {([
              { value: "Member" as MemberRole, label: "Member", desc: "Use workers and view dashboards", icon: <User size={16} /> },
              { value: "Org Admin" as MemberRole, label: "Org Admin", desc: "Manage members, teams, and settings", icon: <ShieldCheck size={16} /> },
            ]).map(({ value, label, desc, icon }) => {
              const isActive = selectedRole === value;
              return (
                <div
                  key={value}
                  onClick={() => setSelectedRole(value)}
                  style={{
                    flex: 1, borderRadius: 8, padding: "12px 14px",
                    border: `${isActive ? "1.5px" : "1px"} solid ${isActive ? ws.primary : ws.border}`,
                    backgroundColor: ws.surface,
                    display: "flex", flexDirection: "column", gap: 4,
                    cursor: "pointer", transition: "border-color 0.15s",
                    minHeight: isMobile ? 44 : undefined,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: isActive ? ws.primary : ws.secondary, display: "flex", alignItems: "center" }}>
                      {icon}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: isActive ? ws.primary : ws.body, fontFamily: f }}>
                      {label}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, lineHeight: 1.3 }}>
                    {desc}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Team selector */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: ws.muted_text, marginBottom: 6 }}>
              Team{" "}<span style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <TeamPicker
              selectedIds={selectedTeams}
              onAdd={(id) => setSelectedTeams(prev => [...prev, id])}
              onRemove={(id) => setSelectedTeams(prev => prev.filter(t => t !== id))}
              maxHeight={160}
            />
          </div>

          {/* Footer buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: isMobile ? "stretch" : "flex-end",
              gap: 8,
              paddingTop: 8,
            }}
          >
            {isMobile ? (
              /* Mobile: full-width stacked buttons */
              <>
                <button
                  type="button"
                  onClick={handleSubmit}
                  onMouseEnter={() => setSendHovered(true)}
                  onMouseLeave={() => setSendHovered(false)}
                  disabled={!canSubmit}
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 8,
                    border: "none",
                    backgroundColor: sendHovered && canSubmit ? ws.primaryHover : ws.primary,
                    color: ws.onPrimary,
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: f,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    opacity: canSubmit ? 1 : 0.6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "background-color 0.15s, opacity 0.15s",
                  }}
                >
                  {sending ? (
                    <>
                      <SpinnerGap
                        size={14}
                        color={ws.onPrimary}
                        style={{ animation: "inviteSpinnerRotate 0.8s linear infinite" }}
                      />
                      Sending...
                    </>
                  ) : (
                    "Send Invite"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={sending}
                  style={{
                    width: "100%",
                    height: 48,
                    borderRadius: 8,
                    border: `1px solid ${ws.border}`,
                    backgroundColor: "transparent",
                    color: ws.secondary,
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: f,
                    cursor: sending ? "not-allowed" : "pointer",
                    transition: "background-color 0.15s",
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              /* Desktop: inline row */
              <>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={sending}
                  onMouseEnter={() => setCancelHovered(true)}
                  onMouseLeave={() => setCancelHovered(false)}
                  style={{
                    height: 34,
                    borderRadius: 8,
                    border: `1px solid ${ws.border}`,
                    backgroundColor: cancelHovered ? ws.hoverBg : "transparent",
                    color: ws.secondary,
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: f,
                    padding: "0 16px",
                    cursor: sending ? "not-allowed" : "pointer",
                    transition: "background-color 0.15s",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  onMouseEnter={() => setSendHovered(true)}
                  onMouseLeave={() => setSendHovered(false)}
                  disabled={!canSubmit}
                  style={{
                    height: 34,
                    borderRadius: 8,
                    border: "none",
                    backgroundColor: sendHovered && canSubmit ? ws.primaryHover : ws.primary,
                    color: ws.onPrimary,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: f,
                    padding: "0 16px",
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    opacity: canSubmit ? 1 : 0.6,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "background-color 0.15s, opacity 0.15s",
                  }}
                >
                  {sending ? (
                    <>
                      <SpinnerGap
                        size={14}
                        color={ws.onPrimary}
                        style={{ animation: "inviteSpinnerRotate 0.8s linear infinite" }}
                      />
                      Sending...
                    </>
                  ) : (
                    "Send Invite"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
