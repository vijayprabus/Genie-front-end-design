import { useState, useRef } from "react";
import { X, Upload, Download } from "@phosphor-icons/react";
import { ws, f } from "@/shared/utils/contentTokens";

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BulkImportModal({ open, onClose }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.endsWith(".csv") || dropped.name.endsWith(".xlsx"))) {
      setFile(dropped);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.25)",
          zIndex: 50, animation: "bulkFadeIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 520, maxWidth: "calc(100vw - 32px)",
        backgroundColor: ws.surface, borderRadius: 14,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        zIndex: 51, animation: "bulkScaleIn 0.2s ease",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 16px", borderBottom: `1px solid ${ws.divider}`,
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: ws.heading, fontFamily: f }}>Bulk Import Users</span>
          <button onClick={handleClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: ws.muted_text, display: "flex", alignItems: "center" }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Step 1: Download template */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: ws.heading, fontFamily: f }}>1. Download template</span>
            <span style={{ fontSize: 12, color: ws.secondary, fontFamily: f, lineHeight: 1.4 }}>
              Fill in the email, role, and team columns. One row per user.
            </span>
            <button
              onClick={() => { /* TODO: download CSV */ }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
                padding: "6px 12px", borderRadius: 8,
                border: `1px solid ${ws.border}`, backgroundColor: "transparent",
                color: ws.body, fontSize: 12, fontWeight: 500, fontFamily: f,
                cursor: "pointer", transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <Download size={14} />
              Download CSV template
            </button>
          </div>

          {/* Step 2: Upload */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: ws.heading, fontFamily: f }}>2. Upload completed file</span>
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 6, height: 100, borderRadius: 8,
                border: `1px dashed ${dragOver ? ws.primary : ws.inputBorder}`,
                backgroundColor: dragOver ? ws.primaryLight : ws.page,
                cursor: "pointer", transition: "border-color 0.15s, background-color 0.15s",
              }}
            >
              {file ? (
                <>
                  <span style={{ fontSize: 13, fontWeight: 500, color: ws.body, fontFamily: f }}>{file.name}</span>
                  <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>Click to change</span>
                </>
              ) : (
                <>
                  <Upload size={20} color={ws.muted_text} />
                  <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>Drop CSV file here or click to browse</span>
                  <span style={{ fontSize: 10, color: ws.disabled, fontFamily: f }}>Max 500 users per import</span>
                </>
              )}
            </div>
            <input ref={inputRef} type="file" accept=".csv,.xlsx" onChange={handleFileSelect} style={{ display: "none" }} />
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
            <button
              onClick={handleClose}
              style={{
                height: 34, borderRadius: 8, border: `1px solid ${ws.border}`,
                backgroundColor: "transparent", color: ws.secondary,
                fontSize: 12, fontWeight: 500, fontFamily: f,
                cursor: "pointer", padding: "0 16px",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => { /* TODO: import */ handleClose(); }}
              disabled={!file}
              style={{
                height: 34, borderRadius: 8, border: "none",
                backgroundColor: file ? ws.primary : ws.disabled,
                color: ws.onPrimary, fontSize: 12, fontWeight: 600, fontFamily: f,
                cursor: file ? "pointer" : "not-allowed", padding: "0 16px",
                opacity: file ? 1 : 0.6,
              }}
            >
              Import Users
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bulkFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes bulkScaleIn { from { transform: translate(-50%,-50%) scale(0.96); opacity: 0 } to { transform: translate(-50%,-50%) scale(1); opacity: 1 } }
      `}</style>
    </>
  );
}
