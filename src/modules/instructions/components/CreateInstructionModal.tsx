import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronDown } from "lucide-react";
import { ws as baseWs, f } from "@/shared/utils/contentTokens";

const ws = { ...baseWs };

// Detect Mac vs non-Mac for keyboard hint
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform);

interface CreateInstructionModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description: string }) => void;
}

export default function CreateInstructionModal({ open, onClose, onCreate }: CreateInstructionModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [descOpen, setDescOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Mount/unmount animation
  useEffect(() => {
    if (open) {
      setVisible(true);
      // Allow DOM to paint before animating in
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimIn(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setAnimIn(false);
      const t = setTimeout(() => {
        setVisible(false);
        setName("");
        setDescription("");
        setDescOpen(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Auto-focus name input when modal opens
  useEffect(() => {
    if (animIn && nameRef.current) {
      nameRef.current.focus();
    }
  }, [animIn]);

  const handleCreate = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate({ name: trimmed, description: description.trim() });
  }, [name, description, onCreate]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      // ⌘↵ / Ctrl+↵ to create
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleCreate();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose, handleCreate]);

  if (!visible) return null;

  const canCreate = name.trim().length > 0;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.40)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        opacity: animIn ? 1 : 0,
        transition: "opacity 200ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480,
          backgroundColor: ws.surface,
          border: `1px solid ${ws.border}`,
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          transform: animIn ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
          transition: "transform 240ms cubic-bezier(0.32, 0.72, 0, 1), opacity 240ms cubic-bezier(0.32, 0.72, 0, 1)",
          opacity: animIn ? 1 : 0,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 0",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: ws.heading, fontFamily: f }}>
            New instruction
          </span>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              color: ws.secondary,
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = ws.elevated; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 24px 0" }}>
          {/* Name field */}
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: ws.secondary, fontFamily: f, marginBottom: 6 }}>
            Name
          </label>
          <input
            ref={nameRef}
            type="text"
            placeholder="What's this workflow called?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                handleCreate();
              }
            }}
            style={{
              width: "100%",
              height: 40,
              borderRadius: 8,
              border: `1px solid ${ws.inputBorder}`,
              padding: "0 14px",
              fontSize: 14,
              fontFamily: f,
              color: ws.body,
              background: ws.surface,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = `1px solid ${ws.primary}`;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${ws.primaryLight}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = `1px solid ${ws.inputBorder}`;
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          {/* Description toggle */}
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => setDescOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                color: ws.primary,
                fontFamily: f,
              }}
            >
              <ChevronDown
                size={14}
                style={{
                  transform: descOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
              {descOpen ? "Hide description" : "+ Add description"}
            </button>

            {descOpen && (
              <div style={{ marginTop: 10 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: ws.secondary, fontFamily: f, marginBottom: 6 }}>
                  Description
                </label>
                <textarea
                  placeholder="What does this workflow do?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 80,
                    borderRadius: 8,
                    border: `1px solid ${ws.inputBorder}`,
                    padding: "12px 14px",
                    fontSize: 13,
                    fontFamily: f,
                    color: ws.body,
                    background: ws.surface,
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = `1px solid ${ws.primary}`;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${ws.primaryLight}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = `1px solid ${ws.inputBorder}`;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px 20px",
            marginTop: 16,
            borderTop: `1px solid ${ws.divider}`,
          }}
        >
          {/* Keyboard hint */}
          <span style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, fontFamily: f }}>
            {isMac ? "⌘↵" : "Ctrl+↵"} to create
          </span>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                height: 36,
                padding: "0 16px",
                borderRadius: 8,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                color: ws.body,
                fontFamily: f,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = ws.elevated; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!canCreate}
              style={{
                height: 36,
                padding: "0 16px",
                borderRadius: 8,
                border: "none",
                background: canCreate ? ws.primary : ws.disabled,
                cursor: canCreate ? "pointer" : "not-allowed",
                fontSize: 13,
                fontWeight: 600,
                color: "#FFF",
                fontFamily: f,
                transition: "background 0.15s ease",
              }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
