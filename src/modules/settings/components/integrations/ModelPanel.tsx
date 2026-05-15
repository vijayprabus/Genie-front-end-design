import { useState, useEffect } from "react";
import {
  X, ChevronLeft, ChevronRight, ChevronDown,
  Loader2, Eye, EyeOff, Check, TriangleAlert, Trash2,
  Server, Info, Search, Lock, RefreshCw,
  Power, Zap, CircleDollarSign, Activity, Database, XCircle,
} from "lucide-react";
import type { ModelProviderItem, Deployment, FoundationalModel } from "./modelData";
import {
  providerMeta, selfHostedMeta, bedrockRegions, providerNames,
  foundationalModels, providerDeployments, configuredProviders, selfHostedConfigured,
} from "./modelData";
import { providerLogoMap } from "../models/ProviderLogos";
import { ws, f } from "@/shared/utils/contentTokens";
import { AnimatedCheck, AnimatedCheckMuted } from "@/shared/components/settings";

// ─────────────────────────────────────────────────────────────────────────────
// Verbatim copy strings (from Pencil designs §46-49)
// ─────────────────────────────────────────────────────────────────────────────

const COPY = {
  // §46 credential error messages
  err401: "Invalid API key — this key doesn't exist or has been revoked.",
  err403: "Permission denied — the key exists but lacks the required scopes.",
  errNetwork: "Couldn't reach the provider — check your internet connection and try again.",
  // §46 deployment error
  depNotFound: (name: string, providerName: string) =>
    `Deployment '${name}' not found in your ${providerName} account.`,
  depCredsIssue: "Deployment test failed — your provider credentials may be invalid. Check credentials above.",
  depNetwork: "Couldn't reach the provider — check your connection and try again.",
  // §48 confirmation modals
  confirmDeleteTitle: (name: string) => `Delete ${name} connection?`,
  confirmDeleteDesc: "This will permanently remove all credentials and deployments associated with this provider. This action can't be undone.",
  confirmDeleteInUseDesc: (count: number) => `${count} workflow${count !== 1 ? "s" : ""} currently use deployments from this provider. Deleting it will cause those workflows to fail until they're updated.`,
  confirmDeleteTypeHint: "Type the provider name to confirm",
  confirmDeleteTypeMatch: "Match required to enable delete.",
  confirmRemoveDepTitle: (_name: string) => `Remove this deployment?`,
  confirmRemoveDepDesc: (name: string) => `'${name}' will be removed from this provider. Workflows referencing it will need to be updated.`,
  confirmRemoveLastTitle: "Remove the last deployment?",
  confirmRemoveLastDesc: (provName: string) => `This is the only deployment for ${provName}. Removing it will auto-disable the provider — Genie won't be able to route to it until you add another deployment.`,
  confirmDisableTitle: (name: string) => `Disable ${name}?`,
  confirmDisableDesc: "Genie won't route any requests to this provider until re-enabled. Existing deployments remain configured.",
  confirmDisableSubDesc: (count: number) => `${count} deployment${count !== 1 ? "s are" : " is"} currently in use. New requests will be rerouted to other providers if available.`,
  confirmDiscardTitle: "Discard unsaved changes?",
  confirmDiscardDesc: "You've edited the credentials but haven't saved. Closing now will discard those changes.",
  // §49 edge cases
  providerDeletedTitle: "This provider was deleted",
  providerDeletedDesc: "Another admin removed this provider while you had it open. Your view is out of date.",
  readOnlyBanner: "View only — contact your admin to make changes.",
  concurrentEditTitle: "Updated by another user",
  concurrentEditDesc: (user: string, when: string) => `${user} changed credentials ${when}. Your edits won't apply until you reload.`,
  deprecatedWarning: (count: number) => `${count} deployment${count !== 1 ? "s use" : " uses"} a deprecated model. Update before it stops working.`,
  // §48 add deployment
  addDepHelper: "Genie will validate this deployment against your provider.",
  depCreated: "Deployment created",
  depCreatedSub: "Returning to provider detail...",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Panel routing state
// ─────────────────────────────────────────────────────────────────────────────

type PanelRoute =
  | { kind: "provider" }
  | { kind: "deployment"; id: string | "new" };

// ─────────────────────────────────────────────────────────────────────────────
// Micro-helpers
// ─────────────────────────────────────────────────────────────────────────────

const shell: React.CSSProperties = {
  display: "flex", flexDirection: "column", height: "100%", overflow: "hidden",
};
const bodyScroll: React.CSSProperties = {
  flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden",
  WebkitMaskImage: "linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)",
  maskImage: "linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)",
};

function hoverP(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.backgroundColor = ws.primaryHover; }
function leaveP(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.backgroundColor = ws.primary; }

const priBtn: React.CSSProperties = {
  height: 34, borderRadius: 8, border: "none", backgroundColor: ws.primary, color: ws.onPrimary,
  fontSize: 13, fontWeight: 600, fontFamily: f, cursor: "pointer",
  padding: "0 20px", display: "inline-flex", alignItems: "center",
  justifyContent: "center", gap: 6, transition: "background-color 0.15s",
};

function Lbl({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 500, color: ws.body, marginBottom: 6, fontFamily: f, display: "flex", alignItems: "center", ...style }}>
      {children}
    </div>
  );
}

function Inp({
  value, onChange, placeholder, disabled = false, error = false,
}: { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; error?: boolean }) {
  return (
    <input
      type="text" value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled}
      style={{
        width: "100%", boxSizing: "border-box" as const,
        border: `1px solid ${error ? ws.error : ws.inputBorder}`, borderRadius: 8,
        padding: "10px 14px", fontSize: 13, fontFamily: f,
        backgroundColor: disabled ? ws.muted : ws.surface, color: ws.body, outline: "none",
        boxShadow: error ? `0 0 0 3px ${ws.errorBg}` : undefined,
      }}
      onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = ws.primary; }}
      onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = ws.inputBorder; }}
    />
  );
}

function PwdInp({ value, onChange, placeholder, disabled }: { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"} value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{
          width: "100%", boxSizing: "border-box" as const,
          border: `1px solid ${ws.inputBorder}`, borderRadius: 8,
          padding: "10px 40px 10px 14px", fontSize: 13, fontFamily: f,
          backgroundColor: disabled ? ws.muted : ws.surface, color: ws.body, outline: "none",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = ws.primary; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = ws.inputBorder; }}
      />
      <button
        type="button" onClick={() => setShow(!show)}
        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 2, color: ws.muted_text, display: "flex" }}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function MaskedInp({ masked, value, onChange, placeholder: _ph, disabled }: { masked: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const hasNew = value.length > 0;
  const fullKey = masked.replace(/••••/g, "api03kR7x····");
  const inputType = hasNew ? (revealed ? "text" : "password") : "text";
  const displayValue = hasNew ? value : (revealed ? fullKey : masked);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={inputType} value={displayValue} disabled={disabled}
        onChange={(e) => {
          if (!hasNew) {
            const typed = e.target.value;
            if (typed.length < displayValue.length) { onChange(""); }
            else { const newPart = typed.slice(displayValue.length); onChange(newPart || typed); }
          } else { onChange(e.target.value); }
        }}
        style={{
          width: "100%", boxSizing: "border-box" as const,
          border: `1px solid ${ws.inputBorder}`, borderRadius: 8,
          padding: "10px 40px 10px 14px", fontSize: 13, fontFamily: f,
          backgroundColor: disabled ? ws.muted : ws.surface, color: ws.body, outline: "none",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = ws.primary; if (!hasNew) e.currentTarget.select(); }}
        onBlur={(e) => { e.currentTarget.style.borderColor = ws.inputBorder; }}
      />
      <button
        type="button" onClick={() => setRevealed(!revealed)}
        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 2, color: ws.muted_text, display: "flex" }}
      >
        {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function RegSel({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        style={{
          width: "100%", boxSizing: "border-box" as const,
          border: `1px solid ${ws.inputBorder}`, borderRadius: 8,
          padding: "10px 36px 10px 14px", fontSize: 13, fontFamily: f,
          backgroundColor: disabled ? ws.muted : ws.surface, color: ws.body,
          outline: "none", appearance: "none" as const, cursor: disabled ? "default" : "pointer",
        }}
      >
        <option value="">Select region...</option>
        {bedrockRegions.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: ws.muted_text, pointerEvents: "none" as const }} />
    </div>
  );
}

function ModelSel({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const grouped = foundationalModels.reduce<Record<string, FoundationalModel[]>>((acc, m) => {
    (acc[m.family] ||= []).push(m); return acc;
  }, {});
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        style={{
          width: "100%", height: 40, borderRadius: 8,
          border: `1px solid ${ws.inputBorder}`, padding: "0 36px 0 12px",
          fontSize: 13, fontFamily: f, color: value ? ws.body : ws.muted_text,
          backgroundColor: disabled ? ws.muted : ws.surface,
          appearance: "none" as const, cursor: disabled ? "default" : "pointer", outline: "none",
        }}
      >
        <option value="" disabled>Select foundational model...</option>
        {Object.entries(grouped).map(([family, models]) => (
          <optgroup key={family} label={family}>
            {models.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.capabilities.join(", ")}</option>)}
          </optgroup>
        ))}
      </select>
      <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: ws.muted_text, pointerEvents: "none" as const }} />
    </div>
  );
}

function Tog({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      role="switch" aria-checked={on} onClick={() => !disabled && onChange(!on)}
      style={{ width: 32, height: 18, borderRadius: 9, border: "none", cursor: disabled ? "default" : "pointer", backgroundColor: on ? ws.primary : ws.toggleBg, position: "relative", transition: "background-color 0.2s", flexShrink: 0, padding: 0, opacity: disabled ? 0.5 : 1 }}
    >
      <span style={{ position: "absolute", top: 2, left: on ? 16 : 2, width: 14, height: 14, borderRadius: "50%", backgroundColor: ws.onPrimary, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }} />
    </button>
  );
}

function ProvLogo({ id, size = 24 }: { id: string; size?: number }) {
  const L = providerLogoMap[id];
  if (L) return <L size={size} />;
  const initials = id === "azure" ? "Az" : id === "bedrock" ? "Bk" : (id || "?").charAt(0).toUpperCase();
  const bg = id === "azure" ? "#0078D4" : ws.muted;
  return (
    <div style={{ width: size, height: size, borderRadius: 6, backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 700, color: "#fff", fontFamily: f }}>
      {initials}
    </div>
  );
}

// Health status pill shown on deployment rows
function HealthPill({ status }: { status: "ok" | "fail" | "warn" | "deprecated" }) {
  const cfg = {
    ok: { bg: "#DCFCE7", color: "#16A34A", label: "OK" },
    fail: { bg: ws.errorBg, color: ws.error, label: "Failed" },
    warn: { bg: ws.warningBg, color: ws.warningFg, label: "Warning" },
    deprecated: { bg: ws.warningBg, color: ws.warningFg, label: "Deprecated" },
  }[status];
  return (
    <span style={{ fontSize: 10, fontWeight: 600, fontFamily: f, padding: "2px 7px", borderRadius: 999, backgroundColor: cfg.bg, color: cfg.color, flexShrink: 0 }}>
      {cfg.label}
    </span>
  );
}

// Inline banner (error/warning/info)
function Banner({ kind, children }: { kind: "error" | "warning" | "info"; children: React.ReactNode }) {
  const cfg = {
    error: { bg: ws.errorBg, border: ws.errorBorder, color: ws.errorFg, Icon: XCircle },
    warning: { bg: ws.warningBg, border: "#FCD34D", color: ws.warningFg, Icon: TriangleAlert },
    info: { bg: ws.elevated, border: ws.border, color: ws.secondary, Icon: Info },
  }[kind];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 8, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <cfg.Icon size={14} color={cfg.color} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 12, color: cfg.color, fontFamily: f, lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}

// Flash screen (success / muted)
function Flash({ onClose, icon, title, subtitle }: { onClose: () => void; icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div style={shell}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "16px 20px", flexShrink: 0 }}>
        <button aria-label="Close" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: ws.muted_text, borderRadius: 6 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        ><X size={16} /></button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40 }}>
        {icon}
        <span style={{ fontSize: 16, fontWeight: 600, color: ws.heading, fontFamily: f, textAlign: "center" }}>{title}</span>
        {subtitle && <span style={{ fontSize: 13, color: ws.secondary, fontFamily: f, textAlign: "center", lineHeight: 1.5 }}>{subtitle}</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirmation modal overlay (6 variants from §48)
// ─────────────────────────────────────────────────────────────────────────────

type ConfirmVariant =
  | { kind: "delete-connection"; providerName: string; inUseWorkflows?: string[] }
  | { kind: "remove-deployment"; deploymentName: string; isLast: boolean; providerName: string }
  | { kind: "disable-provider"; providerName: string; deploymentCount: number }
  | { kind: "discard-changes" };

function ConfirmOverlay({
  variant, onCancel, onConfirm,
}: { variant: ConfirmVariant; onCancel: () => void; onConfirm: () => void }) {
  const [typeInput, setTypeInput] = useState("");

  let icon: React.ReactNode;
  let title: string;
  let desc: React.ReactNode;
  let subDesc: React.ReactNode = null;
  let confirmLabel: string;
  let confirmColor: string = ws.error;
  let confirmEnabled = true;
  let extraContent: React.ReactNode = null;

  if (variant.kind === "delete-connection") {
    const inUse = variant.inUseWorkflows && variant.inUseWorkflows.length > 0;
    icon = <Trash2 size={inUse ? 24 : 24} color={ws.error} />;
    title = COPY.confirmDeleteTitle(variant.providerName);
    if (inUse) {
      desc = COPY.confirmDeleteInUseDesc(variant.inUseWorkflows!.length);
      extraContent = (
        <>
          <div style={{ backgroundColor: ws.elevated, borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
            {variant.inUseWorkflows!.map((w) => (
              <span key={w} style={{ fontSize: 13, fontWeight: 500, color: ws.body, fontFamily: f }}>{w}</span>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 12 }}>
            <Lbl style={{ marginBottom: 0 }}>{COPY.confirmDeleteTypeHint}</Lbl>
            <Inp value={typeInput} onChange={setTypeInput} placeholder={variant.providerName} />
            <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>{COPY.confirmDeleteTypeMatch}</span>
          </div>
        </>
      );
      confirmEnabled = typeInput === variant.providerName;
    } else {
      desc = COPY.confirmDeleteDesc;
    }
    confirmLabel = "Delete";
  } else if (variant.kind === "remove-deployment") {
    if (variant.isLast) {
      icon = <TriangleAlert size={24} color={ws.warning} />;
      title = COPY.confirmRemoveLastTitle;
      desc = COPY.confirmRemoveLastDesc(variant.providerName);
      confirmColor = ws.error;
    } else {
      icon = <Trash2 size={20} color={ws.error} />;
      title = COPY.confirmRemoveDepTitle(variant.deploymentName);
      desc = COPY.confirmRemoveDepDesc(variant.deploymentName);
    }
    confirmLabel = "Remove";
  } else if (variant.kind === "disable-provider") {
    icon = <Power size={20} color={ws.warning} />;
    title = COPY.confirmDisableTitle(variant.providerName);
    desc = COPY.confirmDisableDesc;
    subDesc = COPY.confirmDisableSubDesc(variant.deploymentCount);
    confirmLabel = "Disable";
    confirmColor = ws.warning;
  } else {
    // discard-changes
    icon = <TriangleAlert size={20} color={ws.warning} />;
    title = COPY.confirmDiscardTitle;
    desc = COPY.confirmDiscardDesc;
    confirmLabel = "Discard";
  }

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, padding: 20 }}>
      <div style={{ backgroundColor: ws.surface, borderRadius: 14, border: `1px solid ${ws.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: 24, width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 12 }}>{icon}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: ws.heading, fontFamily: f, textAlign: "center", marginBottom: 10 }}>{title}</div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: ws.body, fontFamily: f, textAlign: "center", margin: "0 0 8px" }}>{desc}</p>
        {subDesc && <p style={{ fontSize: 12, lineHeight: 1.5, color: ws.muted_text, fontFamily: f, textAlign: "center", margin: "0 0 8px" }}>{subDesc}</p>}
        {extraContent && <div style={{ marginTop: 4 }}>{extraContent}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 20 }}>
          <button
            onClick={onCancel}
            style={{ height: 36, borderRadius: 8, border: `1px solid ${ws.border}`, backgroundColor: "transparent", color: ws.secondary, fontSize: 13, fontWeight: 500, fontFamily: f, cursor: "pointer", padding: "0 16px" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ws.hoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            {variant.kind === "discard-changes" ? "Keep editing" : "Cancel"}
          </button>
          <button
            onClick={confirmEnabled ? onConfirm : undefined}
            disabled={!confirmEnabled}
            style={{ height: 36, borderRadius: 8, border: "none", backgroundColor: confirmEnabled ? confirmColor : ws.disabled, color: ws.onPrimary, fontSize: 13, fontWeight: 600, fontFamily: f, cursor: confirmEnabled ? "pointer" : "default", padding: "0 16px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel header variants
// ─────────────────────────────────────────────────────────────────────────────

function ProviderHeader({
  item, onClose, credentialsSaved, isSetup,
}: { item: ModelProviderItem; onClose: () => void; credentialsSaved: boolean; isSetup: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", flexShrink: 0, borderBottom: `1px solid ${ws.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
        <ProvLogo id={item.id} size={20} />
        <span style={{ fontSize: 16, fontWeight: 600, color: ws.heading, fontFamily: f, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
        {/* Connected pill (edit mode after credentials saved) */}
        {!isSetup && credentialsSaved && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: "#16A34A", backgroundColor: "#DCFCE7", padding: "2px 8px", borderRadius: 999, flexShrink: 0 }}>
            <Check size={10} strokeWidth={3} /> Connected
          </span>
        )}
        {/* Credentials saved pill (step 2 of setup) */}
        {isSetup && credentialsSaved && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: "#16A34A", backgroundColor: "#DCFCE7", padding: "2px 8px", borderRadius: 999, flexShrink: 0 }}>
            <Check size={10} strokeWidth={3} /> Credentials saved
          </span>
        )}
      </div>
      <button aria-label="Close" onClick={onClose}
        style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: 4, display: "flex", color: ws.muted_text, borderRadius: 6 }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      ><X size={16} /></button>
    </div>
  );
}

function DeploymentHeader({ name, onBack, onClose }: { name: string; onBack: () => void; onClose: () => void }) {
  return (
    <div style={{ flexShrink: 0, borderBottom: `1px solid ${ws.border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 8px" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: ws.primary, fontSize: 13, fontWeight: 500, fontFamily: f, padding: 0 }}>
          <ChevronLeft size={14} /> Back
        </button>
        <button aria-label="Close" onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: ws.muted_text, borderRadius: 6 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        ><X size={16} /></button>
      </div>
      <div style={{ padding: "0 20px 16px" }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: ws.heading, fontFamily: f, wordBreak: "break-all" as const }}>{name || "New deployment"}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DeploymentRow — single row in the provider deployment list
// ─────────────────────────────────────────────────────────────────────────────

function DeploymentRow({
  dep, onDrillIn, readOnly, deprecated,
}: { dep: Deployment; onDrillIn: () => void; readOnly?: boolean; deprecated?: boolean }) {
  const model = foundationalModels.find((m) => m.id === dep.foundationalModelId);
  const isFailed = dep.status === "failed";
  return (
    <button
      onClick={readOnly ? undefined : onDrillIn}
      style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "0 12px",
        height: 36, background: "none", border: "none", cursor: readOnly ? "default" : "pointer",
        borderBottom: `1px solid ${ws.divider}`, textAlign: "left" as const,
      }}
      onMouseEnter={(e) => { if (!readOnly) e.currentTarget.style.backgroundColor = ws.hoverBg; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      <span style={{ flex: 1, fontSize: 13, color: ws.body, fontFamily: f, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{dep.name}</span>
      {model && (
        <span style={{ fontSize: 12, color: deprecated ? ws.warningFg : ws.muted_text, fontFamily: f, flexShrink: 0 }}>
          {model.name}{deprecated ? " (deprecated)" : ""}
        </span>
      )}
      {dep.status === "failed" || isFailed ? <HealthPill status="fail" /> : null}
      {deprecated && dep.status !== "failed" ? <HealthPill status="deprecated" /> : null}
      {dep.status === "passed" && !deprecated ? <HealthPill status="ok" /> : null}
      {!readOnly && <ChevronRight size={14} color={ws.muted_text} style={{ flexShrink: 0 }} />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DeploymentDetailPanel — §47 B-states + §48 A-states
// ─────────────────────────────────────────────────────────────────────────────

type DepTestState = "idle" | "testing" | "pass" | "fail-notfound" | "fail-creds" | "fail-network";

interface DepDetailProps {
  depId: string | "new";
  deployments: Deployment[];
  providerName: string;
  readOnly: boolean;
  onBack: () => void;
  onClose: () => void;
  onSave: (dep: Deployment) => void;
  onRemove: (id: string) => void;
  onGoToCredentials: () => void;
}

function DeploymentDetailPanel({
  depId, deployments, providerName, readOnly,
  onBack, onClose, onSave, onRemove, onGoToCredentials,
}: DepDetailProps) {
  const isNew = depId === "new";
  const existing = deployments.find((d) => d.id === depId);

  const [name, setName] = useState(existing?.name ?? "");
  const [modelId, setModelId] = useState(existing?.foundationalModelId ?? "");
  const [testState, setTestState] = useState<DepTestState>("idle");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [createState, setCreateState] = useState<"idle" | "creating" | "created">("idle");
  const [showCreatedSuccess, setShowCreatedSuccess] = useState(false);

  const origName = existing?.name ?? "";
  const origModel = existing?.foundationalModelId ?? "";
  const nameDirty = name !== origName;
  const modelDirty = modelId !== origModel;
  const dirty = nameDirty || modelDirty;

  // Existing deployment: last validated status
  const lastStatus = existing?.status ?? "untested";
  const lastPassed = lastStatus === "passed";
  const lastFailed = lastStatus === "failed";

  // Save button label: "Test & save" if name changed; "Save" otherwise
  const saveBtnLabel = isNew
    ? (name && modelId ? "Create deployment" : "Create deployment")
    : (nameDirty ? "Test & save" : "Save");

  const saveEnabled = isNew
    ? (name.trim().length > 0 && modelId.length > 0 && createState === "idle")
    : (!readOnly && dirty && testState === "idle");

  const runTest = (cb: (passed: boolean, failKind?: "notfound" | "creds" | "network") => void) => {
    setTestState("testing");
    setTimeout(() => {
      const r = Math.random();
      if (r > 0.2) { cb(true); }
      else if (r > 0.12) { cb(false, "notfound"); }
      else if (r > 0.06) { cb(false, "creds"); }
      else { cb(false, "network"); }
    }, 1400);
  };

  const handleSave = () => {
    if (isNew) {
      setCreateState("creating");
      runTest((passed, failKind) => {
        if (passed) {
          setCreateState("created");
          setShowCreatedSuccess(true);
          const newDep: Deployment = { id: `dep-${Date.now()}`, name, foundationalModelId: modelId, status: "passed" };
          setTimeout(() => { onSave(newDep); }, 800);
        } else {
          setCreateState("idle");
          setTestState(failKind === "creds" ? "fail-creds" : failKind === "network" ? "fail-network" : "fail-notfound");
        }
      });
    } else if (nameDirty) {
      // Must re-test when name changes
      runTest((passed, failKind) => {
        if (passed) {
          setTestState("pass");
          const updated: Deployment = { ...existing!, name, foundationalModelId: modelId, status: "passed" };
          onSave(updated);
        } else {
          setTestState(failKind === "creds" ? "fail-creds" : failKind === "network" ? "fail-network" : "fail-notfound");
        }
      });
    } else {
      // Model-only change — no test needed
      const updated: Deployment = { ...existing!, foundationalModelId: modelId };
      onSave(updated);
    }
  };

  const handleTestNow = () => {
    runTest((passed, failKind) => {
      if (passed) { setTestState("pass"); setTimeout(() => setTestState("idle"), 2000); }
      else { setTestState(failKind === "creds" ? "fail-creds" : failKind === "network" ? "fail-network" : "fail-notfound"); }
    });
  };

  const isLocked = testState === "testing" || createState === "creating";
  const isLastDep = deployments.length === 1 && !isNew;

  // Created success transient overlay
  if (showCreatedSuccess) {
    return (
      <div style={shell}>
        <DeploymentHeader name={name} onBack={onBack} onClose={onClose} />
        <div style={bodyScroll}>
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ opacity: 0.5, display: "flex", flexDirection: "column", gap: 14 }}>
              <div><Lbl>Deployment name</Lbl><Inp value={name} onChange={() => {}} disabled /></div>
              <div><Lbl>Foundational model</Lbl><ModelSel value={modelId} onChange={() => {}} disabled /></div>
            </div>
            <div style={{ backgroundColor: "#DCFCE7", borderRadius: 10, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Check size={24} color="#16A34A" />
                <span style={{ fontSize: 15, fontWeight: 600, color: "#15803D", fontFamily: f }}>{COPY.depCreated}</span>
              </div>
              <span style={{ fontSize: 12, color: "#15803D", fontFamily: f }}>{COPY.depCreatedSub}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...shell, position: "relative" }}>
      {confirmRemove && (
        <ConfirmOverlay
          variant={{ kind: "remove-deployment", deploymentName: existing?.name ?? name, isLast: isLastDep, providerName }}
          onCancel={() => setConfirmRemove(false)}
          onConfirm={() => { setConfirmRemove(false); onRemove(depId as string); }}
        />
      )}
      <DeploymentHeader name={isNew ? "New deployment" : name} onBack={onBack} onClose={onClose} />

      {/* Status row — only for existing deployments */}
      {!isNew && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 24px 0" }}>
          {testState === "testing" && <><Loader2 size={14} color={ws.muted_text} style={{ animation: "mdl-spin 1s linear infinite" }} /><span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>Testing...</span></>}
          {testState === "idle" && lastPassed && <><Check size={14} color={ws.success} /><span style={{ fontSize: 12, fontWeight: 500, color: ws.success, fontFamily: f }}>Validated</span><span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>·</span><button onClick={handleTestNow} style={{ fontSize: 12, fontWeight: 500, color: ws.primary, fontFamily: f, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Test now</button></>}
          {testState === "idle" && lastFailed && <><TriangleAlert size={14} color={ws.error} /><span style={{ fontSize: 12, fontWeight: 500, color: ws.error, fontFamily: f }}>Last test failed</span><span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>·</span><button onClick={handleTestNow} style={{ fontSize: 12, fontWeight: 500, color: ws.error, fontFamily: f, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Test again</button></>}
          {testState === "pass" && <><Check size={14} color={ws.success} /><span style={{ fontSize: 12, fontWeight: 500, color: ws.success, fontFamily: f }}>Test passed</span></>}
          {(testState === "fail-notfound" || testState === "fail-creds" || testState === "fail-network") && (
            <><TriangleAlert size={14} color={ws.error} /><span style={{ fontSize: 12, fontWeight: 500, color: ws.error, fontFamily: f }}>Last test failed</span><span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>·</span><button onClick={handleTestNow} style={{ fontSize: 12, fontWeight: 500, color: ws.error, fontFamily: f, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Test again</button></>
          )}
        </div>
      )}

      <div style={bodyScroll}>
        <div style={{ padding: "16px 24px 40px", display: "flex", flexDirection: "column", gap: 16, opacity: isLocked ? 0.6 : 1, transition: "opacity 0.15s" }}>
          {/* Deployment name field */}
          <div>
            <Lbl>Deployment name</Lbl>
            <Inp value={name} onChange={setName} placeholder="e.g. gpt-4o-prod" disabled={isLocked || readOnly} error={testState === "fail-notfound"} />
            {testState === "fail-notfound" && (
              <span style={{ fontSize: 12, color: ws.error, fontFamily: f, marginTop: 4, display: "block", lineHeight: 1.4 }}>
                {COPY.depNotFound(name, providerName)}
              </span>
            )}
          </div>

          {/* Credentials issue banner */}
          {testState === "fail-creds" && (
            <Banner kind="error">
              {COPY.depCredsIssue}{" "}
              <button onClick={onGoToCredentials} style={{ color: ws.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontSize: 12, padding: 0 }}>Go to credentials</button>
            </Banner>
          )}

          {/* Network issue banner */}
          {testState === "fail-network" && (
            <Banner kind="error">{COPY.depNetwork}</Banner>
          )}

          {/* Foundational model field */}
          <div>
            <Lbl>Foundational model</Lbl>
            <ModelSel value={modelId} onChange={setModelId} disabled={isLocked || readOnly} />
          </div>

          {isNew && (
            <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>{COPY.addDepHelper}</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${ws.divider}`, backgroundColor: ws.surface }}>
        {!isNew && !readOnly ? (
          <button onClick={() => setConfirmRemove(true)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 500, color: ws.error, fontFamily: f, padding: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          ><Trash2 size={13} /> Remove deployment</button>
        ) : <span />}
        {!readOnly && (
          <button
            onClick={saveEnabled ? handleSave : undefined}
            disabled={!saveEnabled}
            style={{ ...priBtn, backgroundColor: saveEnabled ? ws.primary : ws.disabled, cursor: saveEnabled ? "pointer" : "default" }}
            onMouseEnter={saveEnabled ? hoverP : undefined}
            onMouseLeave={saveEnabled ? leaveP : undefined}
          >
            {isLocked && <Loader2 size={14} style={{ animation: "mdl-spin 1s linear infinite" }} />}
            {saveBtnLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProviderDetailPanel — Azure or Bedrock, setup or edit mode (§46 + §47 A)
// ─────────────────────────────────────────────────────────────────────────────

interface ProviderDetailProps {
  item: ModelProviderItem;
  route: PanelRoute;
  setRoute: (r: PanelRoute) => void;
  onClose: () => void;
  readOnly?: boolean;
  providerDeleted?: boolean;
  concurrentEdit?: { user: string; when: string } | null;
}

type CredSaveState = "idle" | "saving" | "saved" | "err401" | "err403" | "errNetwork";

function ProviderDetailPanel({
  item, route, setRoute, onClose, readOnly = false, providerDeleted = false, concurrentEdit = null,
}: ProviderDetailProps) {
  const meta = providerMeta[item.id] || { name: item.name, maskedKey: "", workers: [], endpointUrl: "" };
  const isAzure = item.providerType === "hosting";
  const isBedrock = item.providerType === "bedrock";
  const isSetup = !item.configured;
  const [credentialsSaved, setCredentialsSaved] = useState(item.configured);

  // Credentials state
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState(isAzure ? (meta.endpointUrl ?? "") : "");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [region, setRegion] = useState(meta.region ?? "");
  const [authTab, setAuthTab] = useState<"api_key" | "iam">(meta.authMethod ?? "api_key");

  // Credential dirty detection
  const credsDirty = apiKey.length > 0 || endpoint !== (meta.endpointUrl ?? "") ||
    accessKeyId.length > 0 || secretKey.length > 0 || region !== (meta.region ?? "");

  const credsValid = isAzure
    ? (apiKey.length > 0 || meta.maskedKey.length > 0) && endpoint.trim().length > 0
    : isBedrock
      ? authTab === "iam"
        ? ((accessKeyId.length > 0 || (meta.maskedAccessKeyId ?? "").length > 0) && (secretKey.length > 0 || (meta.maskedSecretKey ?? "").length > 0) && region.length > 0)
        : (apiKey.length > 0 || meta.maskedKey.length > 0) && region.length > 0
      : false;

  const [credSaveState, setCredSaveState] = useState<CredSaveState>("idle");
  const [deployments, setDeployments] = useState<Deployment[]>(() =>
    (providerDeployments[item.id] || []).map((d) => ({ ...d }))
  );
  const [providerActive, setProviderActive] = useState(!item.paused);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmVariant, setConfirmVariant] = useState<ConfirmVariant | null>(null);
  const [discardTarget, setDiscardTarget] = useState<(() => void) | null>(null);

  const showSearch = deployments.length >= 10; // show search at 10+ (Pencil shows at 100+, we show earlier as reasonable cutoff — documented below)
  const filteredDeps = showSearch && searchQuery
    ? deployments.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : deployments;

  // Check for deprecated models
  const deprecatedIds = new Set(["gpt-4-0314", "gpt-4-0613"]); // placeholder — real implementation checks against a list
  const hasDeprecated = deployments.some((d) => d.foundationalModelId && deprecatedIds.has(d.foundationalModelId));
  const deprecatedCount = deployments.filter((d) => d.foundationalModelId && deprecatedIds.has(d.foundationalModelId)).length;

  // Guard: attempt to close/navigate while dirty
  const guardDirty = (proceed: () => void) => {
    if (credsDirty && !credentialsSaved) {
      setDiscardTarget(() => proceed);
    } else {
      proceed();
    }
  };

  const handleClose = () => guardDirty(onClose);

  const handleSaveCredentials = () => {
    if (!credsValid) return;
    setCredSaveState("saving");
    setTimeout(() => {
      const r = Math.random();
      if (r > 0.2) {
        setCredSaveState("saved");
        setCredentialsSaved(true);
        setTimeout(() => setCredSaveState("idle"), 2000);
      } else if (r > 0.12) {
        setCredSaveState("err401");
      } else if (r > 0.06) {
        setCredSaveState("err403");
      } else {
        setCredSaveState("errNetwork");
      }
    }, 1400);
  };

  const handleToggleActive = (on: boolean) => {
    if (!on) {
      setConfirmVariant({ kind: "disable-provider", providerName: item.name, deploymentCount: deployments.length });
    } else {
      setProviderActive(true);
    }
  };

  const handleDeleteConnection = () => {
    // Check if in-use (mock: azure is always "in use" for demo)
    const inUseWorkflows = item.id === "azure"
      ? ["Customer support agent", "Invoice classifier", "Daily report generator"]
      : [];
    setConfirmVariant({ kind: "delete-connection", providerName: item.name, inUseWorkflows });
  };

  const credSaveEnabled = credsDirty && credsValid && credSaveState === "idle";
  const credSaving = credSaveState === "saving";

  // If viewing a drilled-in deployment panel
  if (route.kind === "deployment") {
    return (
      <DeploymentDetailPanel
        depId={route.id}
        deployments={deployments}
        providerName={item.name}
        readOnly={readOnly}
        onBack={() => setRoute({ kind: "provider" })}
        onClose={handleClose}
        onSave={(dep) => {
          if (route.id === "new") {
            setDeployments((prev) => [...prev, dep]);
          } else {
            setDeployments((prev) => prev.map((d) => d.id === dep.id ? dep : d));
          }
          setRoute({ kind: "provider" });
        }}
        onRemove={(id) => {
          setDeployments((prev) => prev.filter((d) => d.id !== id));
          setRoute({ kind: "provider" });
        }}
        onGoToCredentials={() => setRoute({ kind: "provider" })}
      />
    );
  }

  return (
    <div style={{ ...shell, position: "relative" }}>
      {/* Confirmation overlay */}
      {confirmVariant && (
        <ConfirmOverlay
          variant={confirmVariant}
          onCancel={() => setConfirmVariant(null)}
          onConfirm={() => {
            if (confirmVariant.kind === "delete-connection") {
              setConfirmVariant(null);
              onClose();
            } else if (confirmVariant.kind === "disable-provider") {
              setProviderActive(false);
              setConfirmVariant(null);
            }
          }}
        />
      )}
      {/* Discard changes overlay */}
      {discardTarget && (
        <ConfirmOverlay
          variant={{ kind: "discard-changes" }}
          onCancel={() => setDiscardTarget(null)}
          onConfirm={() => { const fn = discardTarget; setDiscardTarget(null); fn(); }}
        />
      )}

      <ProviderHeader item={item} onClose={handleClose} credentialsSaved={credentialsSaved} isSetup={isSetup} />

      {/* §49 provider-deleted banner */}
      {providerDeleted && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 20px", backgroundColor: ws.errorBg, borderBottom: `1px solid ${ws.errorBorder}` }}>
          <TriangleAlert size={18} color={ws.errorFg} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: ws.errorFg, fontFamily: f }}>{COPY.providerDeletedTitle}</span>
            <span style={{ fontSize: 12, color: ws.errorFg, fontFamily: f, lineHeight: 1.4 }}>{COPY.providerDeletedDesc}</span>
          </div>
        </div>
      )}

      {/* §49 read-only banner */}
      {readOnly && !providerDeleted && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", backgroundColor: ws.elevated, borderBottom: `1px solid ${ws.border}` }}>
          <Lock size={14} color={ws.muted_text} />
          <span style={{ fontSize: 12, fontWeight: 500, color: ws.muted_text, fontFamily: f }}>{COPY.readOnlyBanner}</span>
        </div>
      )}

      {/* §49 concurrent-edit banner */}
      {concurrentEdit && !readOnly && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", backgroundColor: ws.warningBg, borderBottom: `1px solid #FCD34D`, borderRadius: 0 }}>
          <RefreshCw size={16} color={ws.warningFg} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: ws.warningFg, fontFamily: f }}>{COPY.concurrentEditTitle}</span>
            <span style={{ fontSize: 12, color: ws.warningFg, fontFamily: f, lineHeight: 1.4 }}>
              {COPY.concurrentEditDesc(concurrentEdit.user, concurrentEdit.when)}
            </span>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ fontSize: 12, fontWeight: 500, color: ws.warningFg, fontFamily: f, background: "none", border: `1px solid ${ws.warningFg}`, borderRadius: 6, padding: "6px 10px", cursor: "pointer", flexShrink: 0 }}
          >Reload</button>
        </div>
      )}

      <div style={bodyScroll}>
        <div style={{ padding: "20px 20px 60px", display: "flex", flexDirection: "column", gap: 0 }}>

          {/* Setup step indicator */}
          {isSetup && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: ws.heading, fontFamily: f }}>
                {credentialsSaved ? "Deployments" : "Credentials"}
              </span>
              <span style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, fontFamily: f }}>
                Step {credentialsSaved ? "2" : "1"} of 2
              </span>
            </div>
          )}

          {/* Credentials section — §46 + §47 A */}
          {(!isSetup || !credentialsSaved) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: isSetup ? 0 : 32 }}>
              {!isSetup && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: ws.heading, fontFamily: f }}>Credentials</span>
                </div>
              )}

              {/* Azure — API key + endpoint */}
              {isAzure && (<>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Lbl style={{ marginBottom: 0 }}>API Key</Lbl>
                    <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>Azure Portal ↗</span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    {item.configured
                      ? <MaskedInp masked={meta.maskedKey} value={apiKey} onChange={setApiKey} disabled={credSaving || readOnly} />
                      : <PwdInp value={apiKey} onChange={setApiKey} placeholder="Enter API key..." disabled={credSaving} />
                    }
                  </div>
                </div>
                <div>
                  <Lbl>Endpoint URL</Lbl>
                  <Inp value={endpoint} onChange={setEndpoint} placeholder="https://your-resource.openai.azure.com/" disabled={credSaving || readOnly} />
                </div>
              </>)}

              {/* Bedrock — auth tabs */}
              {isBedrock && (<>
                {!item.configured && (
                  <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${ws.divider}`, marginBottom: 4 }}>
                    {(["api_key", "iam"] as const).map((m) => {
                      const active = authTab === m;
                      return (
                        <button key={m} onClick={() => setAuthTab(m)}
                          style={{ padding: "0 0 8px", marginRight: 16, border: "none", borderBottom: active ? `2px solid ${ws.primary}` : "2px solid transparent", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: f, backgroundColor: "transparent", color: active ? ws.primary : ws.muted_text }}>
                          {m === "api_key" ? "API Key" : "IAM Credentials"}
                        </button>
                      );
                    })}
                  </div>
                )}
                {item.configured && (
                  <div>
                    <Lbl style={{ marginBottom: 2 }}>Auth Method</Lbl>
                    <span style={{ display: "inline-flex", fontSize: 11, fontWeight: 500, color: ws.primary, backgroundColor: ws.primaryLight, padding: "3px 10px", borderRadius: 12, marginBottom: 12 }}>
                      {meta.authMethod === "iam" ? "IAM Credentials" : "API Key"}
                    </span>
                  </div>
                )}
                {(authTab === "iam" || meta.authMethod === "iam") ? (<>
                  <div>
                    <Lbl>Access Key ID</Lbl>
                    {item.configured
                      ? <MaskedInp masked={meta.maskedAccessKeyId ?? ""} value={accessKeyId} onChange={setAccessKeyId} disabled={credSaving || readOnly} />
                      : <Inp value={accessKeyId} onChange={setAccessKeyId} placeholder="AKIA..." disabled={credSaving} />}
                  </div>
                  <div>
                    <Lbl>Secret Access Key</Lbl>
                    {item.configured
                      ? <MaskedInp masked={meta.maskedSecretKey ?? ""} value={secretKey} onChange={setSecretKey} disabled={credSaving || readOnly} />
                      : <PwdInp value={secretKey} onChange={setSecretKey} placeholder="Enter secret..." disabled={credSaving} />}
                  </div>
                </>) : (<>
                  <div>
                    <Lbl>API Key</Lbl>
                    {item.configured
                      ? <MaskedInp masked={meta.maskedKey} value={apiKey} onChange={setApiKey} disabled={credSaving || readOnly} />
                      : <PwdInp value={apiKey} onChange={setApiKey} placeholder="Enter key..." disabled={credSaving} />}
                  </div>
                </>)}
                <div>
                  <Lbl>Region</Lbl>
                  <RegSel value={region} onChange={setRegion} disabled={credSaving || readOnly} />
                </div>
              </>)}

              {/* Credential error messages */}
              {credSaveState === "err401" && <Banner kind="error">{COPY.err401}</Banner>}
              {credSaveState === "err403" && <Banner kind="error">{COPY.err403}</Banner>}
              {credSaveState === "errNetwork" && <Banner kind="error">{COPY.errNetwork}</Banner>}
              {credSaveState === "saved" && <Banner kind="info"><Check size={12} style={{ display: "inline", marginRight: 4 }} />Credentials saved successfully.</Banner>}

              {/* Save credentials button row */}
              {!readOnly && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                  <button
                    onClick={handleSaveCredentials}
                    disabled={!credSaveEnabled && credSaveState !== "errNetwork"}
                    style={{ ...priBtn, backgroundColor: (credSaveEnabled || credSaveState === "errNetwork") ? ws.primary : ws.disabled, cursor: (credSaveEnabled || credSaveState === "errNetwork") ? "pointer" : "default" }}
                    onMouseEnter={(credSaveEnabled || credSaveState === "errNetwork") ? hoverP : undefined}
                    onMouseLeave={(credSaveEnabled || credSaveState === "errNetwork") ? leaveP : undefined}
                  >
                    {credSaving && <Loader2 size={14} style={{ animation: "mdl-spin 1s linear infinite" }} />}
                    {credSaveState === "errNetwork" ? "Try again" : "Save credentials"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Setup step 2 — deployments empty state */}
          {isSetup && credentialsSaved && deployments.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>Add at least one deployment to start using this provider.</span>
              <div style={{ backgroundColor: ws.elevated, borderRadius: 12, padding: "36px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" as const }}>
                <Server size={20} color={ws.muted_text} />
                <span style={{ fontSize: 13, fontWeight: 500, color: ws.body, fontFamily: f }}>No deployments yet</span>
                <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>Click below to add your first deployment.</span>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setRoute({ kind: "deployment", id: "new" })} style={priBtn} onMouseEnter={hoverP} onMouseLeave={leaveP}>
                  + Add deployment
                </button>
              </div>
            </div>
          )}

          {/* Edit mode — provider active toggle + deployments */}
          {!isSetup && credentialsSaved && (
            <>
              {/* Provider active toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderTop: `1px solid ${ws.divider}`, borderBottom: `1px solid ${ws.divider}`, marginBottom: 28 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: ws.heading, fontFamily: f }}>Provider active</span>
                <Tog on={providerActive} onChange={handleToggleActive} disabled={readOnly} />
              </div>

              {/* Deployments section */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: ws.heading, fontFamily: f, flex: 1 }}>Deployments</span>
                  {deployments.length > 0 && (
                    <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>{deployments.length} total</span>
                  )}
                </div>

                {/* §49 deprecated warning banner */}
                {hasDeprecated && (
                  <Banner kind="warning">
                    {COPY.deprecatedWarning(deprecatedCount)}{" "}
                    <button style={{ color: ws.primary, background: "none", border: "none", cursor: "pointer", fontWeight: 500, fontSize: 12, padding: 0 }}>Review</button>
                  </Banner>
                )}

                {/* §49 search input for large lists */}
                {showSearch && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 40, borderRadius: 8, border: `1px solid ${ws.border}` }}>
                    <Search size={14} color={ws.muted_text} />
                    <input
                      type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter deployments..."
                      style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: f, color: ws.body, backgroundColor: "transparent" }}
                    />
                  </div>
                )}

                {/* Deployment rows */}
                {filteredDeps.length > 0 ? (
                  <div style={{ borderRadius: 8, border: `1px solid ${ws.border}`, overflow: "hidden" }}>
                    {filteredDeps.map((dep) => (
                      <DeploymentRow
                        key={dep.id}
                        dep={dep}
                        onDrillIn={() => setRoute({ kind: "deployment", id: dep.id })}
                        readOnly={readOnly}
                        deprecated={dep.foundationalModelId ? deprecatedIds.has(dep.foundationalModelId) : false}
                      />
                    ))}
                    {/* + Add deployment row */}
                    {!readOnly && (
                      <button
                        onClick={() => setRoute({ kind: "deployment", id: "new" })}
                        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "0 12px", height: 40, background: "none", border: "none", cursor: "pointer", borderTop: `1px solid ${ws.divider}` }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 500, color: ws.primary, fontFamily: f }}>+ Add deployment</span>
                      </button>
                    )}
                  </div>
                ) : deployments.length === 0 ? (
                  <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, backgroundColor: ws.elevated, borderRadius: 8, textAlign: "center" as const }}>
                    <Server size={20} color={ws.disabled} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: ws.secondary, fontFamily: f }}>No deployments</span>
                    {!readOnly && (
                      <button onClick={() => setRoute({ kind: "deployment", id: "new" })} style={{ fontSize: 13, fontWeight: 500, color: ws.primary, fontFamily: f, background: "none", border: "none", cursor: "pointer" }}>
                        + Add deployment
                      </button>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f, textAlign: "center" as const, display: "block" }}>No results for "{searchQuery}"</span>
                )}

                {showSearch && filteredDeps.length > 0 && searchQuery === "" && (
                  <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f, textAlign: "center" as const }}>Showing {filteredDeps.length} of {deployments.length}</span>
                )}
              </div>
            </>
          )}

          {/* Setup deployments list (after credentials saved, has some deployments) */}
          {isSetup && credentialsSaved && deployments.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ borderRadius: 8, border: `1px solid ${ws.border}`, overflow: "hidden" }}>
                {deployments.map((dep) => (
                  <DeploymentRow
                    key={dep.id}
                    dep={dep}
                    onDrillIn={() => setRoute({ kind: "deployment", id: dep.id })}
                    readOnly={false}
                  />
                ))}
                <button
                  onClick={() => setRoute({ kind: "deployment", id: "new" })}
                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "0 12px", height: 40, background: "none", border: "none", cursor: "pointer", borderTop: `1px solid ${ws.divider}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: ws.primary, fontFamily: f }}>+ Add deployment</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${ws.divider}`, backgroundColor: ws.surface }}>
        {!isSetup && !readOnly && !providerDeleted ? (
          <button onClick={handleDeleteConnection}
            style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 500, color: ws.error, fontFamily: f, padding: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          ><Trash2 size={13} /> Delete Connection</button>
        ) : providerDeleted ? (
          <button onClick={onClose} style={{ ...priBtn, width: "100%" }} onMouseEnter={hoverP} onMouseLeave={leaveP}>Close</button>
        ) : isSetup ? (
          <button onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, color: ws.muted_text, fontFamily: f, padding: 0 }}
          >Cancel</button>
        ) : <span />}
        {!providerDeleted && isSetup && (
          <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>
            {credentialsSaved ? "Add a deployment to activate this provider." : ""}
          </span>
        )}
        {!providerDeleted && !isSetup && !readOnly && <span />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Non-Azure/Bedrock paths — preserved from original file
// ─────────────────────────────────────────────────────────────────────────────

function Head({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", flexShrink: 0, borderBottom: `1px solid ${ws.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>{children}</div>
      <button aria-label="Close" onClick={onClose}
        style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: 4, display: "flex", color: ws.muted_text, borderRadius: 6 }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      ><X size={16} /></button>
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 16, fontWeight: 700, color: ws.heading, fontFamily: f, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{children}</span>;
}

function Confirm({ onClose, onCancel, onConfirm, iconColor, title, description, confirmLabel, confirmDanger = false }: {
  onClose: () => void; onCancel: () => void; onConfirm: () => void;
  iconColor: string; title: string; description: string; confirmLabel: string; confirmDanger?: boolean;
}) {
  const danBtn: React.CSSProperties = { ...priBtn, backgroundColor: ws.error };
  const hoverD = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = ws.errorTextHover; };
  const leaveD = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = ws.error; };
  return (
    <div style={shell}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "16px 20px", flexShrink: 0, borderBottom: `1px solid ${ws.divider}` }}>
        <button aria-label="Close" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: ws.muted_text, borderRadius: 6 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        ><X size={16} /></button>
      </div>
      <div style={{ flex: 1, padding: "20px 20px" }}>
        <div style={{ width: 24, height: 24, marginBottom: 12 }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: ws.heading, fontFamily: f, marginBottom: 10 }}>{title}</div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: ws.secondary, fontFamily: f, margin: 0 }}>{description}</p>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", justifyContent: "flex-end", gap: 10, backgroundColor: ws.surface }}>
        <button onClick={onCancel} style={{ height: 34, borderRadius: 8, border: `1px solid ${ws.border}`, backgroundColor: "transparent", color: ws.secondary, fontSize: 13, fontWeight: 500, fontFamily: f, cursor: "pointer", padding: "0 16px" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ws.hoverBg)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >Cancel</button>
        <button onClick={onConfirm} style={confirmDanger ? { ...danBtn, padding: "0 16px" } : { ...priBtn, padding: "0 16px" }}
          onMouseEnter={confirmDanger ? hoverD : hoverP} onMouseLeave={confirmDanger ? leaveD : leaveP}
        >{confirmLabel}</button>
      </div>
    </div>
  );
}

// ── Non-hosting EditProvider (simple/catalog/etc.) ────────────────────────────

function EditProvider({ item, onClose }: { item: ModelProviderItem; onClose: () => void }) {
  type Flow = "edit" | "confirmDelete" | "savedFlash" | "deletedFlash" | "confirmPause" | "pausedFlash" | "resumedFlash";
  const meta = providerMeta[item.id] || { name: item.name, maskedKey: "", workers: [] };
  const [flow, setFlow] = useState<Flow>("edit");
  const [providerActive, setProviderActive] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [testFailed] = useState(false);
  const dashboardName = providerNames[item.id] || item.name;

  if (flow === "savedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title="Changes saved" />;
  if (flow === "deletedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title={`${item.name} deleted`} subtitle="Provider has been disconnected." />;
  if (flow === "pausedFlash") return <Flash onClose={onClose} icon={<AnimatedCheckMuted />} title={`${item.name} paused`} subtitle="Requests will not be routed to this provider." />;
  if (flow === "resumedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title={`${item.name} resumed`} subtitle="Provider is now active." />;
  if (flow === "confirmDelete") return (
    <Confirm onClose={onClose} onCancel={() => setFlow("edit")}
      onConfirm={() => { setFlow("deletedFlash"); setTimeout(onClose, 1500); }}
      iconColor={ws.warning} title={`Delete ${item.name} API key?`}
      description={`This will disconnect ${item.name} from Genie. Tasks will no longer be routed to ${item.name} models.`}
      confirmLabel="Delete Key" confirmDanger />
  );
  if (flow === "confirmPause") return (
    <Confirm onClose={onClose} onCancel={() => setFlow("edit")}
      onConfirm={() => { setProviderActive(false); setFlow("pausedFlash"); setTimeout(() => setFlow("edit"), 1500); }}
      iconColor={ws.warning} title={`Pause ${item.name}?`}
      description={`Tasks will not be routed to ${item.name} models until you resume.`}
      confirmLabel="Pause" confirmDanger />
  );

  const handleSave = () => { setFlow("savedFlash"); setTimeout(() => setFlow("edit"), 1200); };
  const handleToggle = (on: boolean) => {
    if (!on) { setFlow("confirmPause"); }
    else { setProviderActive(true); setFlow("resumedFlash"); setTimeout(() => setFlow("edit"), 1500); }
  };

  // Catalog providers have a different path handled upstream — here we just handle simple
  return (
    <div style={shell}>
      <Head onClose={onClose}>
        <ProvLogo id={item.id} /><Title>{item.name}</Title>
        {!providerActive && (
          <span style={{ marginLeft: "auto", marginRight: 8, fontSize: 11, fontWeight: 500, color: ws.muted_text, fontFamily: f, backgroundColor: ws.elevated, padding: "3px 10px", borderRadius: 9999 }}>Paused</span>
        )}
      </Head>
      <div style={bodyScroll}>
        <div style={{ padding: "16px 20px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Lbl>API Key</Lbl>
            <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>{dashboardName} Console ↗</span>
          </div>
          <MaskedInp masked={meta.maskedKey} value={apiKey} onChange={setApiKey} />
          {testFailed && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 6, backgroundColor: ws.errorBg, marginTop: 8 }}>
              <Info size={14} color={ws.error} />
              <span style={{ fontSize: 11, color: ws.errorFg, fontFamily: f }}>Invalid API key — check that the key is active and has the required scopes.</span>
            </div>
          )}
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 8, border: `1px solid ${ws.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: providerActive ? ws.body : ws.muted_text, fontFamily: f }}>{providerActive ? "Provider active" : "Provider paused"}</span>
            <Tog on={providerActive} onChange={handleToggle} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "start", marginTop: 14 }}>
            <Info size={13} color={ws.muted_text} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, lineHeight: 1.5 }}>Genie will use this provider when a task matches its capabilities.</span>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: ws.surface }}>
        <button onClick={() => setFlow("confirmDelete")} style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500, color: ws.error, fontFamily: f, padding: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        ><Trash2 size={13} /> Delete Key</button>
        <button onClick={handleSave} style={priBtn} onMouseEnter={hoverP} onMouseLeave={leaveP}>Save</button>
      </div>
    </div>
  );
}

// ── AddProvider (non-hosting) ─────────────────────────────────────────────────

function AddProvider({ item, onClose }: { item: ModelProviderItem; onClose: () => void }) {
  type Flow = "add" | "connecting" | "connectedFlash";
  const [flow, setFlow] = useState<Flow>("add");
  const [apiKey, setApiKey] = useState("");
  const [hfToken, setHfToken] = useState("");
  const [hfDeployTab, setHfDeployTab] = useState<"inference" | "tgi">("inference");
  const [hfEndpoint, setHfEndpoint] = useState("");
  const [hfModel, setHfModel] = useState("");

  const valid = (): boolean => {
    if (item.providerType === "simple" || item.providerType === "catalog") return apiKey.trim().length > 0;
    if (item.providerType === "huggingface") return hfDeployTab === "inference" ? hfToken.trim().length > 0 : hfEndpoint.trim().length > 0;
    return false;
  };

  const connect = () => {
    if (!valid()) return;
    setFlow("connecting");
    setTimeout(() => { setFlow("connectedFlash"); setTimeout(onClose, 1500); }, 1400);
  };

  if (flow === "connectedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title={`${item.name} connected`} subtitle="API key verified and saved." />;
  const isConnecting = flow === "connecting";

  return (
    <div style={shell}>
      <Head onClose={onClose}><ProvLogo id={item.id} /><Title>Connect {item.name}</Title></Head>
      <div style={bodyScroll}>
        <div style={{ padding: "16px 20px 40px" }}>
          <p style={{ fontSize: 13, lineHeight: 1.5, color: ws.secondary, fontFamily: f, margin: "0 0 16px" }}>Enter your API key to connect {item.name} to Genie.</p>
          {(item.providerType === "simple" || item.providerType === "catalog") && (<>
            <Lbl>API Key</Lbl>
            <PwdInp value={apiKey} onChange={setApiKey} placeholder="Enter your API key..." />
          </>)}
          {item.providerType === "huggingface" && (<>
            <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${ws.divider}`, marginBottom: 12 }}>
              {(["inference", "tgi"] as const).map((m) => {
                const active = hfDeployTab === m;
                return (
                  <button key={m} onClick={() => setHfDeployTab(m)} style={{ padding: "0 0 8px", marginRight: 16, border: "none", borderBottom: active ? `2px solid ${ws.primary}` : "2px solid transparent", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: f, backgroundColor: "transparent", color: active ? ws.primary : ws.muted_text }}>
                    {m === "inference" ? "HF Inference API" : "Self-hosted TGI"}
                  </button>
                );
              })}
            </div>
            {hfDeployTab === "tgi" && (
              <div style={{ marginBottom: 14 }}><Lbl>Endpoint URL</Lbl><Inp value={hfEndpoint} onChange={setHfEndpoint} placeholder="https://your-tgi-server.internal/v1" /></div>
            )}
            <div style={{ marginBottom: 14 }}>
              <Lbl>{hfDeployTab === "inference" ? "API Token" : "API Token (optional)"}</Lbl>
              <PwdInp value={hfToken} onChange={setHfToken} placeholder="Enter HuggingFace token..." />
            </div>
            <Lbl>Model</Lbl>
            <Inp value={hfModel} onChange={setHfModel} placeholder="e.g. meta-llama/Llama-3.1-8B" />
          </>)}
        </div>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, backgroundColor: ws.surface }}>
        <button onClick={connect} disabled={!valid() || isConnecting}
          style={{ ...priBtn, width: "100%", height: 40, padding: 0, backgroundColor: !valid() || isConnecting ? ws.disabled : ws.primary, cursor: !valid() || isConnecting ? "default" : "pointer" }}
          onMouseEnter={valid() && !isConnecting ? hoverP : undefined} onMouseLeave={valid() && !isConnecting ? leaveP : undefined}>
          {isConnecting && <Loader2 size={14} style={{ animation: "mdl-spin 1s linear infinite" }} />}
          {isConnecting ? "Connecting..." : "Connect"}
        </button>
      </div>
    </div>
  );
}

// ── GenieInfo ─────────────────────────────────────────────────────────────────

function GenieInfo({ onClose }: { onClose: () => void }) {
  const hasKeys = configuredProviders.length > 0 || selfHostedConfigured.length > 0;
  type Flow = "info" | "confirmDisable" | "disabledFlash" | "enabledFlash";
  const [flow, setFlow] = useState<Flow>("info");
  const [safetyNet, setSafetyNet] = useState(true);

  const handleToggle = (val: boolean) => {
    if (!val) { setFlow("confirmDisable"); }
    else { setSafetyNet(true); setFlow("enabledFlash"); setTimeout(() => setFlow("info"), 1800); }
  };
  const confirmDisable = () => { setSafetyNet(false); setFlow("disabledFlash"); setTimeout(() => setFlow("info"), 1800); };

  if (flow === "enabledFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title="Safety net enabled" subtitle="Genie will fill gaps when your keys can't cover a task." />;
  if (flow === "disabledFlash") return <Flash onClose={onClose} icon={<AnimatedCheckMuted />} title="Safety net disabled" subtitle="Only your configured providers will be used." />;
  if (flow === "confirmDisable") return (
    <Confirm onClose={onClose} onCancel={() => setFlow("info")} onConfirm={confirmDisable}
      iconColor={ws.error} title="Disable Genie safety net?"
      description="Your workers will only use your configured providers. Tasks that need capabilities not covered by your keys will fail instead of falling back to Genie."
      confirmLabel="Disable" confirmDanger />
  );

  const rows = [
    { icon: <Zap size={16} color={ws.primary} />, text: "Picks the best model for each task type" },
    { icon: <CircleDollarSign size={16} color={ws.primary} />, text: "Optimizes for cost automatically" },
    { icon: <RefreshCw size={16} color={ws.primary} />, text: "Upgrades workers as new models release" },
  ];
  const gapItems = [
    { icon: <Eye size={14} color={ws.muted_text} />, text: "Vision tasks — no vision model in your keys" },
    { icon: <Database size={14} color={ws.muted_text} />, text: "Embedding tasks — not covered by your keys" },
    { icon: <Activity size={14} color={ws.muted_text} />, text: "Overflow — when your provider is rate-limited" },
  ];
  const warnItems = [
    { icon: <TriangleAlert size={14} color={ws.error} />, text: "Vision tasks will fail — no vision model configured" },
    { icon: <TriangleAlert size={14} color={ws.error} />, text: "Embedding tasks will fail — not covered" },
  ];

  return (
    <div style={shell}>
      <Head onClose={onClose}><div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: ws.primary, flexShrink: 0 }} /><Title>Genie Managed</Title></Head>
      <div style={bodyScroll}>
        {hasKeys ? (<>
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: safetyNet ? ws.body : ws.muted_text, fontFamily: f }}>Genie as safety net</span>
              <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>{safetyNet ? "Falls back when your keys can't cover a task" : "Genie will not handle any tasks"}</span>
            </div>
            <Tog on={safetyNet} onChange={handleToggle} />
          </div>
          <div style={{ height: 1, backgroundColor: ws.divider }} />
          {safetyNet ? (
            <div style={{ padding: "16px 20px 20px" }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: ws.body, fontFamily: f, marginBottom: 12 }}>Genie will handle</div>
              {gapItems.map((g, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < gapItems.length - 1 ? 10 : 0 }}>
                  <div style={{ flexShrink: 0, marginTop: 1 }}>{g.icon}</div>
                  <span style={{ fontSize: 13, lineHeight: 1.5, color: ws.body, fontFamily: f }}>{g.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "16px 20px 20px" }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: ws.body, fontFamily: f, marginBottom: 12 }}>Not covered</div>
              {warnItems.map((w, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < warnItems.length - 1 ? 10 : 0 }}>
                  <div style={{ flexShrink: 0, marginTop: 1 }}>{w.icon}</div>
                  <span style={{ fontSize: 13, lineHeight: 1.5, color: ws.body, fontFamily: f }}>{w.text}</span>
                </div>
              ))}
            </div>
          )}
        </>) : (<>
          <div style={{ padding: "20px 20px 16px" }}>
            {rows.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < rows.length - 1 ? 16 : 0 }}>
                <div style={{ flexShrink: 0, marginTop: 1 }}>{r.icon}</div>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: ws.body, fontFamily: f }}>{r.text}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: "0 20px 20px" }}>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: ws.secondary, fontFamily: f, margin: 0 }}>This is the default for all workers. Add your own provider keys to use preferred models — Genie becomes a safety net, filling capability gaps automatically.</p>
          </div>
        </>)}
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, backgroundColor: ws.surface }}>
        <button onClick={onClose} style={{ ...priBtn, width: "100%", height: 40 }} onMouseEnter={hoverP} onMouseLeave={leaveP}>Done</button>
      </div>
    </div>
  );
}

// ── EditSelfHosted ────────────────────────────────────────────────────────────

function EditSelfHosted({ item, onClose }: { item: ModelProviderItem; onClose: () => void }) {
  type Flow = "edit" | "confirmDelete" | "savedFlash" | "deletedFlash" | "confirmPause" | "pausedFlash" | "resumedFlash";
  const meta = selfHostedMeta[item.id] || { name: item.name, endpointUrl: "", maskedKey: "", modelId: "", workers: [] };
  const [flow, setFlow] = useState<Flow>("edit");
  const [name, setName] = useState(meta.name);
  const [url, setUrl] = useState(meta.endpointUrl);
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState(meta.modelId);
  const [foundationalModelId, setFoundationalModelId] = useState(meta.foundationalModelId || "");
  const [providerActive, setProviderActive] = useState(!item.paused);
  const compatTab = meta.compatMethod || "openai";
  const grouped = foundationalModels.reduce<Record<string, typeof foundationalModels>>((acc, m) => { (acc[m.family] ||= []).push(m); return acc; }, {});

  const handleToggle = (on: boolean) => {
    if (!on) { setFlow("confirmPause"); }
    else { setProviderActive(true); setFlow("resumedFlash"); setTimeout(() => setFlow("edit"), 1500); }
  };

  if (flow === "savedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title="Changes saved" />;
  if (flow === "deletedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title={`${name} deleted`} subtitle="Endpoint has been removed." />;
  if (flow === "pausedFlash") return <Flash onClose={onClose} icon={<AnimatedCheckMuted />} title={`${name} paused`} subtitle="Requests will not be routed to this endpoint." />;
  if (flow === "resumedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title={`${name} resumed`} subtitle="Endpoint is now active." />;
  if (flow === "confirmDelete") return (
    <Confirm onClose={onClose} onCancel={() => setFlow("edit")}
      onConfirm={() => { setFlow("deletedFlash"); setTimeout(onClose, 1500); }}
      iconColor={ws.warning} title={`Delete ${name}?`} description="This will remove the custom endpoint. Tasks will no longer be routed to this endpoint." confirmLabel="Delete" confirmDanger />
  );
  if (flow === "confirmPause") return (
    <Confirm onClose={onClose} onCancel={() => setFlow("edit")}
      onConfirm={() => { setProviderActive(false); setFlow("pausedFlash"); setTimeout(() => setFlow("edit"), 1500); }}
      iconColor={ws.warning} title={`Pause ${name}?`} description="Tasks will not be routed to this endpoint until you resume." confirmLabel="Pause" confirmDanger />
  );

  return (
    <div style={shell}>
      <Head onClose={onClose}>
        <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, border: `1.5px dashed ${ws.inputBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: ws.secondary, fontFamily: f }}>{(name || "?").charAt(0).toUpperCase()}</div>
        <Title>{name}</Title>
        <span style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, backgroundColor: ws.muted, padding: "3px 10px", borderRadius: 6, fontFamily: f, flexShrink: 0 }}>
          {compatTab === "openai" ? "OpenAI-compatible" : "Custom schema"}
        </span>
        {!providerActive && <span style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, fontFamily: f, backgroundColor: ws.elevated, padding: "3px 10px", borderRadius: 9999, flexShrink: 0 }}>Paused</span>}
      </Head>
      <div style={bodyScroll}>
        <div style={{ padding: "16px 20px 40px" }}>
          <div style={{ marginBottom: 14 }}>
            <Lbl>Name</Lbl>
            <Inp value={name} onChange={setName} placeholder="Endpoint name" />
          </div>
          <div style={{ marginBottom: 14 }}><Lbl>Endpoint URL</Lbl><Inp value={url} onChange={setUrl} placeholder="https://your-endpoint.com/v1" /></div>
          {compatTab === "openai" && (<>
            <div style={{ marginBottom: 14 }}><Lbl>API Key</Lbl><MaskedInp masked={meta.maskedKey} value={apiKey} onChange={setApiKey} /></div>
            <div style={{ marginBottom: 14 }}><Lbl>Model ID</Lbl><Inp value={modelId} onChange={setModelId} placeholder="e.g. llama-3.1-70b" /></div>
            <div style={{ marginBottom: 14 }}>
              <Lbl>Foundational Model</Lbl>
              <div style={{ position: "relative" }}>
                <select value={foundationalModelId} onChange={(e) => setFoundationalModelId(e.target.value)}
                  style={{ width: "100%", height: 40, borderRadius: 8, border: `1px solid ${ws.inputBorder}`, padding: "0 36px 0 12px", fontSize: 13, fontFamily: f, color: foundationalModelId ? ws.body : ws.muted_text, backgroundColor: ws.surface, appearance: "none" as const, cursor: "pointer", outline: "none" }}>
                  <option value="" disabled>Map to a Genie model...</option>
                  {Object.entries(grouped).map(([family, models]) => (
                    <optgroup key={family} label={family}>{models.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.capabilities.join(", ")}</option>)}</optgroup>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: ws.muted_text, pointerEvents: "none" as const }} />
              </div>
            </div>
          </>)}
          <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 8, border: `1px solid ${ws.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: providerActive ? ws.body : ws.muted_text, fontFamily: f }}>{providerActive ? "Endpoint active" : "Endpoint paused"}</span>
            <Tog on={providerActive} onChange={handleToggle} />
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: ws.surface }}>
        <button onClick={() => setFlow("confirmDelete")} style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500, color: ws.error, fontFamily: f, padding: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        ><Trash2 size={13} /> Delete</button>
        <button onClick={() => { setFlow("savedFlash"); setTimeout(() => setFlow("edit"), 1200); }} style={priBtn} onMouseEnter={hoverP} onMouseLeave={leaveP}>Save</button>
      </div>
    </div>
  );
}

// ── AddSelfHosted ─────────────────────────────────────────────────────────────

function AddSelfHosted({ onClose }: { onClose: () => void }) {
  type Flow = "add" | "adding" | "addedFlash";
  const [flow, setFlow] = useState<Flow>("add");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState("");
  const [foundationalModelId, setFoundationalModelId] = useState("");
  const [compatTab, setCompatTab] = useState<"openai" | "custom">("openai");
  const [authHeader, setAuthHeader] = useState("Authorization: Bearer {key}");
  const [requestBody, setRequestBody] = useState('{\n  "prompt": "{system_prompt}\\n\\n{user_message}",\n  "parameters": { "max_new_tokens": 512 }\n}');
  const [responsePath, setResponsePath] = useState("");
  const grouped = foundationalModels.reduce<Record<string, typeof foundationalModels>>((acc, m) => { (acc[m.family] ||= []).push(m); return acc; }, {});
  const ok = name.trim().length > 0 && url.trim().length > 0 && (compatTab === "openai" ? (modelId.trim().length > 0 && foundationalModelId.length > 0) : responsePath.trim().length > 0);
  const isAdding = flow === "adding";
  const tabStyle = (active: boolean): React.CSSProperties => ({ padding: "0 0 8px", marginRight: 16, border: "none", borderBottom: active ? `2px solid ${ws.primary}` : "2px solid transparent", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: f, backgroundColor: "transparent", color: active ? ws.primary : ws.muted_text });
  if (flow === "addedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title="Endpoint added" subtitle={`${name} is now available.`} />;
  return (
    <div style={shell}>
      <Head onClose={onClose}>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Server size={20} color={ws.secondary} /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Title>Custom endpoint</Title>
          <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>Self-hosted or proprietary inference API</span>
        </div>
      </Head>
      <div style={{ display: "flex", gap: 0, padding: "0 20px", borderBottom: `1px solid ${ws.divider}` }}>
        <button onClick={() => setCompatTab("openai")} style={tabStyle(compatTab === "openai")}>OpenAI-compatible</button>
        <button onClick={() => setCompatTab("custom")} style={tabStyle(compatTab === "custom")}>Custom schema</button>
      </div>
      <div style={bodyScroll}>
        <div style={{ padding: "16px 20px 40px" }}>
          <div style={{ marginBottom: 14 }}><Lbl>Name</Lbl><Inp value={name} onChange={setName} placeholder="e.g. Marico Internal LLM" /></div>
          <div style={{ marginBottom: 14 }}><Lbl>Endpoint URL</Lbl><Inp value={url} onChange={setUrl} placeholder="https://your-endpoint.com/v1" /></div>
          {compatTab === "openai" ? (<>
            <div style={{ marginBottom: 14 }}><Lbl>API Token <span style={{ fontSize: 10, fontWeight: 500, color: ws.muted_text, padding: "1px 6px", borderRadius: 4, backgroundColor: ws.muted, marginLeft: 4 }}>Optional</span></Lbl><PwdInp value={apiKey} onChange={setApiKey} placeholder="Enter key if required..." /></div>
            <div style={{ marginBottom: 14 }}><Lbl>Model ID</Lbl><Inp value={modelId} onChange={setModelId} placeholder="e.g. llama-3.1-70b" /></div>
            <div style={{ marginBottom: 14 }}>
              <Lbl>Foundational Model</Lbl>
              <div style={{ position: "relative" }}>
                <select value={foundationalModelId} onChange={(e) => setFoundationalModelId(e.target.value)}
                  style={{ width: "100%", height: 40, borderRadius: 8, border: `1px solid ${ws.inputBorder}`, padding: "0 36px 0 12px", fontSize: 13, fontFamily: f, color: foundationalModelId ? ws.body : ws.muted_text, backgroundColor: ws.surface, appearance: "none" as const, cursor: "pointer", outline: "none" }}>
                  <option value="" disabled>Map to a Genie model...</option>
                  {Object.entries(grouped).map(([family, models]) => (
                    <optgroup key={family} label={family}>{models.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.capabilities.join(", ")}</option>)}</optgroup>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: ws.muted_text, pointerEvents: "none" as const }} />
              </div>
            </div>
          </>) : (<>
            <div style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, marginBottom: 14, lineHeight: 1.4 }}>Define how Genie constructs requests and extracts responses from this endpoint.</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 6 }}><Lbl style={{ marginBottom: 0 }}>Auth Header</Lbl><span style={{ fontSize: 10, color: ws.muted_text, fontFamily: f }}>Use {"{key}"} as placeholder</span></div>
              <Inp value={authHeader} onChange={setAuthHeader} placeholder="Authorization: Bearer {key}" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 6 }}><Lbl style={{ marginBottom: 0 }}>Request Body Template</Lbl><span style={{ fontSize: 10, color: ws.muted_text, fontFamily: f }}>Variables: {"{system_prompt}"} {"{user_message}"} {"{messages_array}"} {"{model_id}"}</span></div>
              <textarea value={requestBody} onChange={(e) => setRequestBody(e.target.value)} style={{ width: "100%", minHeight: 100, borderRadius: 8, border: `1px solid ${ws.inputBorder}`, padding: "10px 14px", fontSize: 12, fontFamily: "monospace", color: ws.body, backgroundColor: ws.surface, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 6 }}><Lbl style={{ marginBottom: 0 }}>Response Text Path</Lbl><span style={{ fontSize: 10, color: ws.muted_text, fontFamily: f }}>JSONPath to the generated text in the response</span></div>
              <Inp value={responsePath} onChange={setResponsePath} placeholder="e.g. $.generated_text or $.choices[0].message.content" />
            </div>
          </>)}
        </div>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: ws.surface }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, color: ws.secondary, fontFamily: f }}>Cancel</button>
        <button onClick={() => { if (!ok) return; setFlow("adding"); setTimeout(() => { setFlow("addedFlash"); setTimeout(onClose, 1500); }, 1200); }}
          disabled={!ok || isAdding} style={{ ...priBtn, padding: "0 16px", backgroundColor: !ok || isAdding ? ws.disabled : ws.primary, cursor: !ok || isAdding ? "default" : "pointer" }}
          onMouseEnter={ok && !isAdding ? hoverP : undefined} onMouseLeave={ok && !isAdding ? leaveP : undefined}>
          {isAdding && <Loader2 size={14} style={{ animation: "mdl-spin 1s linear infinite" }} />}
          {isAdding ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hosting/Bedrock add-provider flow (setup mode) — wraps ProviderDetailPanel
// ─────────────────────────────────────────────────────────────────────────────

function AddHostingProvider({ item, onClose }: { item: ModelProviderItem; onClose: () => void }) {
  const [route, setRoute] = useState<PanelRoute>({ kind: "provider" });
  // Treat this as setup mode by passing item with configured: false
  const setupItem: ModelProviderItem = { ...item, configured: false };
  return (
    <ProviderDetailPanel
      item={setupItem} route={route} setRoute={setRoute} onClose={onClose}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export — preserved signature
// ─────────────────────────────────────────────────────────────────────────────

export default function ModelPanel({ item, onClose }: {
  item: ModelProviderItem; onClose: () => void;
}) {
  // Panel routing for Azure/Bedrock drill-in
  const [route, setRoute] = useState<PanelRoute>({ kind: "provider" });

  useEffect(() => {
    const id = "mdl-panel-css";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `
        @keyframes mdl-spin { to { transform: rotate(360deg) } }
        @keyframes gf-acheck-circle { to { stroke-dashoffset: 0 } }
        @keyframes gf-acheck-check { to { stroke-dashoffset: 0 } }
      `;
      document.head.appendChild(s);
    }
  }, []);

  switch (item.panelMode) {
    case "genie-info":
      return <GenieInfo onClose={onClose} />;

    case "edit-provider":
      // Azure and Bedrock get the new drill-in state machine
      if (item.providerType === "hosting" || item.providerType === "bedrock") {
        return (
          <ProviderDetailPanel
            item={item} route={route} setRoute={setRoute} onClose={onClose}
            // §49 demo props — in production these come from API/context
            readOnly={false}
            providerDeleted={false}
            concurrentEdit={null}
          />
        );
      }
      return <EditProvider item={item} onClose={onClose} />;

    case "add-provider":
      // Azure and Bedrock setup use the drill-in panel
      if (item.providerType === "hosting" || item.providerType === "bedrock") {
        return <AddHostingProvider item={item} onClose={onClose} />;
      }
      return <AddProvider item={item} onClose={onClose} />;

    case "edit-selfhosted":
      return <EditSelfHosted item={item} onClose={onClose} />;

    case "add-selfhosted":
      return <AddSelfHosted onClose={onClose} />;

    default:
      return null;
  }
}
