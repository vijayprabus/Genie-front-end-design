import { useState, useEffect } from "react";
import { X, SpinnerGap } from "@phosphor-icons/react";
import MemberPicker from "@/modules/settings/components/MemberPicker";
import { ws, f, spring } from "@/shared/utils/contentTokens";
import { useIsMobile } from "@/shared/hooks/use-mobile";

const MODAL_CSS = `
  @keyframes teams-modal-in {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes teams-modal-backdrop {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes teams-modal-slide-up {
    from { opacity: 0; transform: translateY(100%); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes teams-spinner {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

/* ── Props ────────────────────────────────────────────────────── */

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onTeamCreated: (name: string, description: string, memberIds: string[]) => void;
}

/* ── Component ────────────────────────────────────────────────── */

export default function CreateTeamModal({
  open,
  onClose,
  onTeamCreated,
}: CreateTeamModalProps) {
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [nameFocused, setNameFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setSelectedMemberIds([]);
      setSubmitting(false);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, submitting]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      onTeamCreated(name.trim(), description.trim(), selectedMemberIds);
      setSubmitting(false);
    }, 800);
  };

  const handleCancel = () => {
    if (submitting) return;
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 50,
          fontFamily: f,
          animation: "teams-modal-backdrop 200ms ease-out",
          ...(isMobile ? {} : {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }),
        }}
        onClick={handleCancel}
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
              animation: `teams-modal-slide-up 0.32s ${spring}`,
              overflowY: "auto",
            } : {
              width: 440,
              borderRadius: 14,
              animation: "teams-modal-in 200ms ease-out",
            }),
            backgroundColor: ws.surface,
            border: `1px solid ${ws.border}`,
            boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
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
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${ws.border}`,
          }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: ws.heading, fontFamily: f }}>
              Create Team
            </span>
            <button
              onClick={handleCancel}
              aria-label="Close"
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 4, borderRadius: 6, color: ws.muted_text,
                display: "flex", alignItems: "center",
                minWidth: 44, minHeight: 44, justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Team name input */}
            <input
              type="text"
              placeholder="Team name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              autoFocus={!isMobile}
              style={{
                height: isMobile ? 44 : 40,
                borderRadius: 8,
                border: `1px solid ${nameFocused ? ws.primary : ws.border}`,
                backgroundColor: "#FFFFFF",
                padding: "0 14px",
                fontSize: isMobile ? 16 : 13,
                fontFamily: f,
                color: ws.body,
                outline: "none",
                transition: "border-color 0.15s",
              }}
            />

            {/* Description textarea */}
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setDescFocused(true)}
              onBlur={() => setDescFocused(false)}
              style={{
                height: 70,
                borderRadius: 8,
                border: `1px solid ${descFocused ? ws.primary : ws.border}`,
                backgroundColor: "#FFFFFF",
                padding: "10px 14px",
                fontSize: isMobile ? 16 : 13,
                fontFamily: f,
                color: ws.body,
                outline: "none",
                resize: "none",
                transition: "border-color 0.15s",
              }}
            />

            {/* Members section */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: ws.muted_text, marginBottom: 6, fontFamily: f }}>
                Members <span style={{ fontWeight: 400 }}>(optional)</span>
              </label>
              <MemberPicker
                selectedIds={selectedMemberIds}
                onAdd={(id) => setSelectedMemberIds((prev) => [...prev, id])}
                onRemove={(id) => setSelectedMemberIds((prev) => prev.filter((mid) => mid !== id))}
                maxHeight={120}
              />
            </div>
          </div>

          {/* CTA */}
          <div style={{ padding: "0 20px 20px" }}>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || submitting}
              style={{
                width: "100%",
                height: isMobile ? 48 : 40,
                borderRadius: 8,
                border: "none",
                backgroundColor: !name.trim() ? ws.disabled : ws.primary,
                color: "#FFF",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: f,
                cursor: !name.trim() ? "not-allowed" : "pointer",
                transition: "background-color 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (name.trim() && !submitting) e.currentTarget.style.backgroundColor = ws.primaryHover;
              }}
              onMouseLeave={(e) => {
                if (name.trim() && !submitting) e.currentTarget.style.backgroundColor = ws.primary;
              }}
            >
              {submitting && (
                <SpinnerGap
                  size={14}
                  weight="bold"
                  style={{ animation: "teams-spinner 0.8s linear infinite" }}
                />
              )}
              {submitting ? "Creating..." : "Create Team"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
