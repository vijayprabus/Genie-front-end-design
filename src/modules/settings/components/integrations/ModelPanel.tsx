import { useState, useEffect } from "react";
import {
  X, Zap, CircleDollarSign, RefreshCw, Trash2, FlaskConical,
  Loader2, Eye, EyeOff, ChevronDown, Server, Info,
} from "lucide-react";
import type { ModelProviderItem } from "./modelData";
import { providerMeta, selfHostedMeta, testMessages, bedrockRegions, providerNames } from "./modelData";
import { providerLogoMap } from "../models/ProviderLogos";

const f = "Inter, sans-serif";
const ws = {
  surface: "#FFFDF9", muted: "#F0EBE4", elevated: "#F5F0EB",
  border: "#E7E0D8", divider: "#F0EBE4", inputBorder: "#D6D3D1",
  heading: "#292524", body: "#44403C", secondary: "#78716C", muted_text: "#A8A29E",
  disabled: "#D6D3D1", primary: "#7C3AED", primaryLight: "#EDE9FE",
  success: "#10B981", error: "#E11D48", hoverBg: "#EDE8E3",
};

/* ── Helpers ──────────────────────────────────────────────────── */

function Lbl({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontSize: 12, fontWeight: 500, color: ws.body, marginBottom: 6, fontFamily: f, display: "flex", alignItems: "center", ...style }}>{children}</div>;
}

function Inp({ value, onChange, placeholder, disabled = false }: { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
    style={{ width: "100%", boxSizing: "border-box" as const, border: `1px solid ${ws.inputBorder}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, fontFamily: f, backgroundColor: disabled ? ws.muted : "#fff", color: ws.body, outline: "none" }}
    onFocus={(e) => { e.currentTarget.style.borderColor = ws.primary; }} onBlur={(e) => { e.currentTarget.style.borderColor = ws.inputBorder; }} />;
}

function PwdInp({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", boxSizing: "border-box" as const, border: `1px solid ${ws.inputBorder}`, borderRadius: 8, padding: "10px 40px 10px 14px", fontSize: 13, fontFamily: f, backgroundColor: "#fff", color: ws.body, outline: "none" }}
        onFocus={(e) => { e.currentTarget.style.borderColor = ws.primary; }} onBlur={(e) => { e.currentTarget.style.borderColor = ws.inputBorder; }} />
      <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 2, color: ws.muted_text, display: "flex" }}>
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function MaskedInp({ masked, value, onChange, placeholder: _placeholder }: { masked: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [revealed, setRevealed] = useState(false);
  const hasNew = value.length > 0;

  // Simulated full key (in production, eye click would call an API to fetch this)
  const fullKey = masked.replace(/••••/g, "api03kR7x····");

  // Two modes:
  // 1. Showing stored key: plain text, eye reveals/hides the full version
  // 2. Showing new key user typed: password dots, eye reveals/hides what they typed
  const inputType = hasNew
    ? (revealed ? "text" : "password")   // new key: password by default, eye reveals
    : "text";                             // stored key: always text (masked or full)

  const displayValue = hasNew
    ? value                               // show what user typed
    : (revealed ? fullKey : masked);      // show masked or revealed stored key

  return (
    <div style={{ position: "relative" }}>
      <input
        type={inputType}
        value={displayValue}
        onChange={(e) => {
          // If they're editing the masked/revealed display text, treat any change as "start fresh"
          if (!hasNew) {
            // User started typing over the displayed key — capture only what they typed
            const typed = e.target.value;
            // If they deleted characters from the masked display, clear to let them start fresh
            if (typed.length < displayValue.length) {
              onChange("");
            } else {
              // They pasted or typed — extract the new characters after the original display
              const newPart = typed.slice(displayValue.length);
              onChange(newPart || typed);
            }
          } else {
            onChange(e.target.value);
          }
        }}
        style={{
          width: "100%", boxSizing: "border-box" as const,
          border: `1px solid ${ws.inputBorder}`, borderRadius: 8,
          padding: "10px 40px 10px 14px", fontSize: 13, fontFamily: f,
          backgroundColor: "#fff", color: ws.body, outline: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = ws.primary;
          if (!hasNew) e.currentTarget.select();
        }}
        onBlur={(e) => { e.currentTarget.style.borderColor = ws.inputBorder; }}
      />
      <button
        type="button"
        onClick={() => setRevealed(!revealed)}
        title={revealed ? "Hide key" : "Show key"}
        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 2, color: ws.muted_text, display: "flex" }}
      >
        {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

/* ── Animated checkmark (SVG stroke-dashoffset) ──────────────── */

function AnimatedCheck({ size = 36 }: { size?: number }) {
  const [k] = useState(() => Date.now());
  return (
    <svg key={k} width={size} height={size} viewBox="0 0 52 52" style={{ display: "block" }}>
      <circle cx="26" cy="26" r="24" fill="none" stroke="#10B981" strokeWidth="2"
        style={{ strokeDasharray: 151, strokeDashoffset: 151, animation: "mdl-circle 0.5s cubic-bezier(0.65,0,0.45,1) forwards" }} />
      <path fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8"
        style={{ strokeDasharray: 36, strokeDashoffset: 36, animation: "mdl-check 0.3s cubic-bezier(0.65,0,0.45,1) 0.5s forwards" }} />
    </svg>
  );
}

function AnimatedCheckMuted({ size = 36 }: { size?: number }) {
  const [k] = useState(() => Date.now());
  return (
    <svg key={k} width={size} height={size} viewBox="0 0 52 52" style={{ display: "block" }}>
      <circle cx="26" cy="26" r="24" fill="none" stroke="#A8A29E" strokeWidth="2"
        style={{ strokeDasharray: 151, strokeDashoffset: 151, animation: "mdl-circle 0.5s cubic-bezier(0.65,0,0.45,1) forwards" }} />
      <path fill="none" stroke="#A8A29E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8"
        style={{ strokeDasharray: 36, strokeDashoffset: 36, animation: "mdl-check 0.3s cubic-bezier(0.65,0,0.45,1) 0.5s forwards" }} />
    </svg>
  );
}

function AnimatedCheckSmall() {
  const [k] = useState(() => Date.now());
  return (
    <svg key={k} width={16} height={16} viewBox="0 0 52 52" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="26" cy="26" r="24" fill="none" stroke="#10B981" strokeWidth="3"
        style={{ strokeDasharray: 151, strokeDashoffset: 151, animation: "mdl-circle 0.4s cubic-bezier(0.65,0,0.45,1) forwards" }} />
      <path fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8"
        style={{ strokeDasharray: 36, strokeDashoffset: 36, animation: "mdl-check 0.25s cubic-bezier(0.65,0,0.45,1) 0.4s forwards" }} />
    </svg>
  );
}

function RegSel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box" as const, border: `1px solid ${ws.inputBorder}`, borderRadius: 8, padding: "10px 36px 10px 14px", fontSize: 13, fontFamily: f, backgroundColor: "#fff", color: ws.body, outline: "none", appearance: "none" as const, cursor: "pointer" }}>
        <option value="">Select region...</option>
        {bedrockRegions.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: ws.muted_text, pointerEvents: "none" as const }} />
    </div>
  );
}

function Tog({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} style={{ width: 32, height: 18, borderRadius: 9, border: "none", cursor: "pointer", backgroundColor: "#F0EBE4", position: "relative", transition: "background-color 0.2s", flexShrink: 0, padding: 0 }}>
      <span style={{ position: "absolute", top: 2, left: on ? 16 : 2, width: 14, height: 14, borderRadius: "50%", backgroundColor: on ? "#7C3AED" : "#A8A29E", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }} />
    </button>
  );
}

function Workers({ workers }: { workers: { model: string; workerCount: number }[] }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 0.3, color: ws.muted_text, fontFamily: f, marginBottom: 10 }}>Workers using this provider</div>
      {workers.length === 0 ? (
        <div style={{ fontSize: 12, color: ws.muted_text, fontFamily: f, fontStyle: "italic" }}>No workers configured yet.</div>
      ) : (
        <div style={{ borderRadius: 8, border: `1px solid ${ws.divider}`, overflow: "hidden" }}>
          {workers.map((w, i) => (
            <div key={w.model} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderBottom: i < workers.length - 1 ? `1px solid ${ws.divider}` : "none" }}>
              <span style={{ fontSize: 13, color: ws.body, fontFamily: f }}>{w.model}</span>
              <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>{w.workerCount} worker{w.workerCount !== 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProvLogo({ id, size = 24 }: { id: string; size?: number }) {
  const L = providerLogoMap[id];
  if (L) return <L size={size} />;
  return <div style={{ width: size, height: size, borderRadius: 6, backgroundColor: ws.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: ws.secondary, fontFamily: f }}>{(id || "?").charAt(0).toUpperCase()}</div>;
}

/* ── Layout shells ───────────────────────────────────────────── */

const shell: React.CSSProperties = { display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" };
const bodyFade: React.CSSProperties = {
  flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden",
  WebkitMaskImage: "linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)",
  maskImage: "linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)",
};

function Head({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", flexShrink: 0, borderBottom: `1px solid ${ws.divider}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>{children}</div>
      <button aria-label="Close" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: 4, display: "flex", color: ws.muted_text, borderRadius: 6 }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      ><X size={16} /></button>
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 16, fontWeight: 700, color: ws.heading, fontFamily: f, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{children}</span>;
}

function hoverP(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.backgroundColor = "#6D28D9"; }
function leaveP(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.backgroundColor = ws.primary; }
function hoverD(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.backgroundColor = "#BE123C"; }
function leaveD(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.backgroundColor = ws.error; }

const priBtn: React.CSSProperties = { height: 34, borderRadius: 8, border: "none", backgroundColor: ws.primary, color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: f, cursor: "pointer", padding: "0 20px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background-color 0.15s" };
const danBtn: React.CSSProperties = { ...priBtn, backgroundColor: ws.error };

/* ── Flash screen (reusable) ─────────────────────────────────── */

function Flash({ onClose, icon, title, subtitle }: { onClose: () => void; icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div style={shell}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "16px 20px", flexShrink: 0 }}>
        <button aria-label="Close" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: ws.muted_text, borderRadius: 6 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
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

/* ── Confirmation screen (reusable) ──────────────────────────── */

function Confirm({ onClose, onCancel, onConfirm, iconColor, title, description, confirmLabel, confirmDanger = false }: {
  onClose: () => void; onCancel: () => void; onConfirm: () => void;
  iconColor: string; title: string; description: string; confirmLabel: string; confirmDanger?: boolean;
}) {
  return (
    <div style={shell}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "16px 20px", flexShrink: 0, borderBottom: `1px solid ${ws.divider}` }}>
        <button aria-label="Close" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: ws.muted_text, borderRadius: 6 }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        ><X size={16} /></button>
      </div>
      <div style={{ flex: 1, padding: "20px 20px" }}>
        <div style={{ width: 24, height: 24, marginBottom: 12 }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: ws.heading, fontFamily: f, marginBottom: 10 }}>{title}</div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: ws.secondary, fontFamily: f, margin: 0 }}>{description}</p>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", justifyContent: "flex-end", gap: 10, backgroundColor: ws.surface }}>
        <button onClick={onCancel} style={{ height: 34, borderRadius: 8, border: `1px solid ${ws.border}`, backgroundColor: "transparent", color: ws.secondary, fontSize: 13, fontWeight: 500, fontFamily: f, cursor: "pointer", padding: "0 16px", transition: "background-color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ws.hoverBg)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >Cancel</button>
        <button onClick={onConfirm} style={confirmDanger ? { ...danBtn, padding: "0 16px" } : { ...priBtn, padding: "0 16px" }}
          onMouseEnter={confirmDanger ? hoverD : hoverP} onMouseLeave={confirmDanger ? leaveD : leaveP}
        >{confirmLabel}</button>
      </div>
    </div>
  );
}

/* ── Test button with inline verified state ──────────────────── */

function TestBtn({ providerId, onFail }: { providerId: string; modelId?: string; onFail?: () => void }) {
  const [state, setState] = useState<"idle" | "testing" | "pass" | "fail">("idle");

  const doTest = () => {
    setState("testing");
    // Simulate: 90% pass, 10% fail for demo
    const willPass = Math.random() > 0.1;
    setTimeout(() => {
      if (willPass) {
        setState("pass");
        setTimeout(() => setState("idle"), 2000);
      } else {
        setState("fail");
        onFail?.();
      }
    }, 1200);
  };

  const btnColors = {
    idle: { bg: "transparent", border: "#C4B5FD", color: ws.primary, cursor: "pointer" },
    testing: { bg: "transparent", border: ws.divider, color: ws.muted_text, cursor: "default" },
    pass: { bg: "#F0FDF4", border: "#BBF7D0", color: "#16A34A", cursor: "default" },
    fail: { bg: "#FEF2F2", border: "#FECACA", color: "#DC2626", cursor: "pointer" },
  }[state];

  return (
    <button onClick={state === "testing" || state === "pass" ? undefined : doTest} disabled={state === "testing" || state === "pass"} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      height: 40, width: 78, padding: 0,
      borderRadius: 8, border: `1.5px solid ${btnColors.border}`,
      backgroundColor: btnColors.bg, cursor: btnColors.cursor,
      fontSize: 13, fontWeight: 500, color: btnColors.color,
      fontFamily: f, flexShrink: 0, transition: "all 0.15s",
    }}>
      {state === "testing" && <Loader2 size={16} style={{ animation: "mdl-spin 1s linear infinite" }} />}
      {state === "idle" && <><FlaskConical size={14} />Test</>}
      {state === "pass" && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>Pass</>}
      {state === "fail" && <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>Fail</>}
      {state === "fail" && "Fail"}
    </button>
  );
}

/* ── GenieInfo ───────────────────────────────────────────────── */

function GenieInfo({ onClose }: { onClose: () => void }) {
  const rows = [
    { icon: <Zap size={16} color={ws.primary} />, text: "Picks the best model for each task type" },
    { icon: <CircleDollarSign size={16} color={ws.primary} />, text: "Optimizes for cost automatically" },
    { icon: <RefreshCw size={16} color={ws.primary} />, text: "Upgrades workers as new models release" },
  ];
  return (
    <div style={shell}>
      <Head onClose={onClose}><div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: ws.primary, flexShrink: 0 }} /><Title>Genie Managed</Title></Head>
      <div style={bodyFade}>
        <div style={{ padding: "20px 20px 16px" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < rows.length - 1 ? 16 : 0 }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}>{r.icon}</div>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: ws.body, fontFamily: f }}>{r.text}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: ws.secondary, fontFamily: f, margin: 0 }}>This is the default for all workers unless a specific provider is assigned.</p>
        </div>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, backgroundColor: ws.surface }}>
        <button onClick={onClose} style={{ ...priBtn, width: "100%", height: 40 }} onMouseEnter={hoverP} onMouseLeave={leaveP}>Done</button>
      </div>
    </div>
  );
}

/* ── EditProvider ─────────────────────────────────────────────── */

function EditProvider({ item, onClose }: { item: ModelProviderItem; onClose: () => void }) {
  type Flow = "edit" | "confirmDelete" | "savedFlash" | "deletedFlash" | "confirmPause" | "pausedFlash" | "resumedFlash";
  const meta = providerMeta[item.id] || { name: item.name, maskedKey: "", workers: [] };
  const [flow, setFlow] = useState<Flow>("edit");
  const [providerActive, setProviderActive] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [region, setRegion] = useState(meta.region || "");
  const [bApiKey, setBApiKey] = useState("");
  const [azKey, setAzKey] = useState("");
  const [endpoint, setEndpoint] = useState(meta.endpointUrl || "");
  const [deployment, setDeployment] = useState(meta.deploymentName || "");
  const [testFailed, setTestFailed] = useState(false);

  if (flow === "savedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title="Changes saved" />;
  if (flow === "deletedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title={`${item.name} deleted`} subtitle="Provider has been disconnected." />;
  if (flow === "pausedFlash") return <Flash onClose={onClose} icon={<AnimatedCheckMuted />} title={`${item.name} paused`} subtitle="Requests will not be routed to this provider." />;
  if (flow === "resumedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title={`${item.name} resumed`} subtitle="Provider is now active." />;
  if (flow === "confirmDelete") return (
    <Confirm onClose={onClose} onCancel={() => setFlow("edit")}
      onConfirm={() => { setFlow("deletedFlash"); setTimeout(onClose, 1500); }}
      iconColor="#F59E0B" title={`Delete ${item.name} API key?`}
      description={`This will disconnect ${item.name} from Genie. Tasks will no longer be routed to ${item.name} models.`}
      confirmLabel="Delete Key" confirmDanger />
  );
  if (flow === "confirmPause") return (
    <Confirm onClose={onClose} onCancel={() => setFlow("edit")}
      onConfirm={() => { setProviderActive(false); setFlow("pausedFlash"); setTimeout(() => setFlow("edit"), 1500); }}
      iconColor="#F59E0B" title={`Pause ${item.name}?`}
      description={`Tasks will not be routed to ${item.name} models until you resume.`}
      confirmLabel="Pause" confirmDanger />
  );

  const handleSave = () => { setFlow("savedFlash"); setTimeout(() => setFlow("edit"), 1200); };
  const handleToggle = (on: boolean) => {
    if (!on) { setFlow("confirmPause"); }
    else { setProviderActive(true); setFlow("resumedFlash"); setTimeout(() => setFlow("edit"), 1500); }
  };

  const dashboardName = providerNames[item.id] || item.name;

  return (
    <div style={shell}>
      <Head onClose={onClose}>
        <ProvLogo id={item.id} /><Title>{item.name}</Title>
        {!providerActive && (
          <span style={{ marginLeft: "auto", marginRight: 8, fontSize: 11, fontWeight: 500, color: ws.muted_text, fontFamily: f, backgroundColor: ws.elevated, padding: "3px 10px", borderRadius: 9999 }}>Paused</span>
        )}
      </Head>
      <div style={bodyFade}>
        <div style={{ padding: "16px 20px 40px" }}>
          {/* Simple providers */}
          {item.providerType === "simple" && (<>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><Lbl>API Key</Lbl><span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>{dashboardName} Console ↗</span></div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ flex: 1 }}><MaskedInp masked={meta.maskedKey} value={apiKey} onChange={setApiKey} placeholder="Enter new key..." /></div>
              <TestBtn providerId={item.id} onFail={() => setTestFailed(true)} />
            </div>
            {testFailed && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 6, backgroundColor: "#FEF2F2", marginTop: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                <span style={{ fontSize: 11, color: "#991B1B", fontFamily: f }}>Invalid API key — check that the key is active and has the required scopes.</span>
              </div>
            )}
          </>)}
          {/* Bedrock */}
          {item.providerType === "bedrock" && (<>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><Lbl>Auth Method</Lbl><span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>AWS Console ↗</span></div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 12, backgroundColor: ws.primaryLight, fontSize: 11, fontWeight: 500, color: ws.primary, fontFamily: f }}>
                {meta.authMethod === "iam" ? "IAM Credentials" : "API Key"}
              </span>
            </div>
            {meta.authMethod === "iam" ? (<>
              <div style={{ marginBottom: 14 }}><Lbl>Access Key ID</Lbl><MaskedInp masked={meta.maskedAccessKeyId || ""} value={accessKeyId} onChange={setAccessKeyId} /></div>
              <div style={{ marginBottom: 14 }}><Lbl>Secret Access Key</Lbl><MaskedInp masked={meta.maskedSecretKey || ""} value={secretKey} onChange={setSecretKey} /></div>
              <div><Lbl>Region</Lbl><RegSel value={region} onChange={setRegion} /></div>
            </>) : (<>
              <div style={{ marginBottom: 14 }}><Lbl>API Key</Lbl><MaskedInp masked={meta.maskedKey} value={bApiKey} onChange={setBApiKey} /></div>
              <div><Lbl>Region</Lbl><RegSel value={region} onChange={setRegion} /></div>
            </>)}
            <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-start" }}><TestBtn providerId={item.id} /></div>
          </>)}
          {/* Azure */}
          {item.providerType === "azure" && (<>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}><Lbl>API Key</Lbl><span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>Azure Portal ↗</span></div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ flex: 1 }}><MaskedInp masked={meta.maskedKey} value={azKey} onChange={setAzKey} placeholder="Enter key..." /></div>
              <TestBtn providerId={item.id} />
            </div>
            <div style={{ marginTop: 14 }}><Lbl>Endpoint URL</Lbl><Inp value={endpoint} onChange={setEndpoint} placeholder="https://your-resource.openai.azure.com/" /></div>
            <div style={{ marginTop: 14 }}><Lbl>Deployment Name</Lbl><Inp value={deployment} onChange={setDeployment} placeholder="e.g. gpt-4o-prod" /></div>
          </>)}

          {/* Provider active toggle */}
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 8, border: `1px solid ${ws.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: providerActive ? ws.body : ws.muted_text, fontFamily: f }}>{providerActive ? "Provider active" : "Provider paused"}</span>
            <Tog on={providerActive} onChange={handleToggle} />
          </div>

          {/* Info text */}
          <div style={{ display: "flex", gap: 8, alignItems: "start", marginTop: 4 }}>
            <Info size={13} color={ws.muted_text} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, lineHeight: 1.5 }}>Genie will use this provider when a task matches its capabilities.</span>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: ws.surface }}>
        <button onClick={() => setFlow("confirmDelete")} style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500, color: ws.error, fontFamily: f, padding: 0, transition: "opacity 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        ><Trash2 size={13} /> Delete Key</button>
        <button onClick={handleSave} style={priBtn} onMouseEnter={hoverP} onMouseLeave={leaveP}>Save</button>
      </div>
    </div>
  );
}

/* ── AddProvider ──────────────────────────────────────────────── */

function AddProvider({ item, onClose }: { item: ModelProviderItem; onClose: () => void }) {
  type Flow = "add" | "connecting" | "connectedFlash";
  const [flow, setFlow] = useState<Flow>("add");
  const [apiKey, setApiKey] = useState("");
  const [authTab, setAuthTab] = useState<"api_key" | "iam">("api_key");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [region, setRegion] = useState("");
  const [bApiKey, setBApiKey] = useState("");
  const [azKey, setAzKey] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [deployment, setDeployment] = useState("");
  const [hfDeployTab, setHfDeployTab] = useState<"inference" | "tgi">("inference");
  const [hfToken, setHfToken] = useState("");
  const [hfEndpoint, setHfEndpoint] = useState("");
  const [hfModel, setHfModel] = useState("");

  const valid = (): boolean => {
    if (item.providerType === "simple") return apiKey.trim().length > 0;
    if (item.providerType === "bedrock") return authTab === "iam" ? accessKeyId.trim().length > 0 && secretKey.trim().length > 0 : bApiKey.trim().length > 0;
    if (item.providerType === "azure") return azKey.trim().length > 0 && endpoint.trim().length > 0 && deployment.trim().length > 0;
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
      <div style={bodyFade}>
        <div style={{ padding: "16px 20px 40px" }}>
          <p style={{ fontSize: 13, lineHeight: 1.5, color: ws.secondary, fontFamily: f, margin: "0 0 16px" }}>Enter your API key to connect {item.name} to Genie.</p>
          {item.providerType === "simple" && (<>
            <Lbl>API Key</Lbl>
            <PwdInp value={apiKey} onChange={setApiKey} placeholder="Enter your API key..." />
            <div style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, marginTop: 6 }}>
              Find your key in the <span style={{ color: ws.primary, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>{
                ({ openai: "OpenAI Dashboard", gemini: "Google AI Studio", mistral: "Mistral Console", cohere: "Cohere Dashboard", deepseek: "DeepSeek Platform", minimax: "MiniMax Dashboard", moonshot: "Moonshot Platform", groq: "Groq Console", xai: "xAI Dashboard" } as Record<string, string>)[item.id] || "provider dashboard"
              }</span> ↗
            </div>
          </>)}
          {item.providerType === "bedrock" && (<>
            <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${ws.divider}`, marginBottom: 16 }}>
              {(["api_key", "iam"] as const).map((m) => {
                const active = authTab === m;
                return (
                  <button key={m} onClick={() => setAuthTab(m)} style={{
                    padding: "0 0 8px", marginRight: 16, border: "none", borderBottom: active ? `2px solid ${ws.primary}` : "2px solid transparent",
                    cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: f,
                    backgroundColor: "transparent", color: active ? ws.primary : ws.muted_text, transition: "color 0.15s, border-color 0.15s",
                  }}>
                    {m === "api_key" ? "API Key" : "IAM Credentials"}
                  </button>
                );
              })}
            </div>
            {authTab === "iam" ? (<>
              <div style={{ marginBottom: 14 }}><Lbl>Access Key ID</Lbl><Inp value={accessKeyId} onChange={setAccessKeyId} placeholder="AKIA..." /></div>
              <div style={{ marginBottom: 14 }}><Lbl>Secret Access Key</Lbl><PwdInp value={secretKey} onChange={setSecretKey} placeholder="Enter secret..." /></div>
              <div><Lbl>Region</Lbl><RegSel value={region} onChange={setRegion} /></div>
            </>) : (<>
              <div style={{ marginBottom: 14 }}><Lbl>API Key</Lbl><PwdInp value={bApiKey} onChange={setBApiKey} placeholder="Enter key..." /></div>
              <div><Lbl>Region</Lbl><RegSel value={region} onChange={setRegion} /></div>
            </>)}
          </>)}
          {item.providerType === "azure" && (<>
            <div style={{ marginBottom: 14 }}><Lbl>API Key</Lbl><PwdInp value={azKey} onChange={setAzKey} placeholder="Enter Azure key..." /></div>
            <div style={{ marginBottom: 14 }}><Lbl>Endpoint URL</Lbl><Inp value={endpoint} onChange={setEndpoint} placeholder="https://your-resource.openai.azure.com/" /></div>
            <div><Lbl>Deployment Name</Lbl><Inp value={deployment} onChange={setDeployment} placeholder="e.g. gpt-4o-prod" /></div>
          </>)}
          {item.providerType === "huggingface" && (<>
            <Lbl>Deployment</Lbl>
            <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${ws.divider}`, marginBottom: 12 }}>
              {(["inference", "tgi"] as const).map((m) => {
                const active = hfDeployTab === m;
                return (
                  <button key={m} onClick={() => setHfDeployTab(m)} style={{
                    padding: "0 0 8px", marginRight: 16, border: "none", borderBottom: active ? `2px solid ${ws.primary}` : "2px solid transparent",
                    cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: f,
                    backgroundColor: "transparent", color: active ? ws.primary : ws.muted_text, transition: "color 0.15s, border-color 0.15s",
                  }}>
                    {m === "inference" ? "HF Inference API" : "Self-hosted TGI"}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, marginBottom: 14 }}>
              {hfDeployTab === "inference" ? "Models served by HuggingFace. No infrastructure to manage." : "Your own TGI server. You manage the infrastructure."}
            </div>
            {hfDeployTab === "tgi" && (
              <div style={{ marginBottom: 14 }}><Lbl>Endpoint URL</Lbl><Inp value={hfEndpoint} onChange={setHfEndpoint} placeholder="https://your-tgi-server.internal/v1" /></div>
            )}
            <div style={{ marginBottom: 14 }}>
              <Lbl>{hfDeployTab === "inference" ? "API Token" : "API Token (optional)"}</Lbl>
              <PwdInp value={hfToken} onChange={setHfToken} placeholder="Enter HuggingFace token..." />
              {hfDeployTab === "inference" && (
                <div style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, marginTop: 6 }}>
                  Needs read access. Get one at <span style={{ color: ws.primary, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>huggingface.co/settings/tokens</span> ↗
                </div>
              )}
              {hfDeployTab === "tgi" && (
                <div style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, marginTop: 6 }}>Leave blank if your server has no auth configured.</div>
              )}
            </div>
            <Lbl>Model</Lbl>
            <div style={{ position: "relative" }}>
              <Inp value={hfModel} onChange={setHfModel} placeholder="e.g. meta-llama/Llama-3.1-8B" />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "start", marginTop: 12 }}>
              <Info size={13} color={ws.muted_text} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, lineHeight: 1.5 }}>Genie will use this provider when a task matches its capabilities.</span>
            </div>
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

/* ── EditSelfHosted ──────────────────────────────────────────── */

function EditSelfHosted({ item, onClose }: { item: ModelProviderItem; onClose: () => void }) {
  type Flow = "edit" | "confirmDelete" | "savedFlash" | "deletedFlash";
  const meta = selfHostedMeta[item.id] || { name: item.name, endpointUrl: "", maskedKey: "", modelId: "", workers: [] };
  const [flow, setFlow] = useState<Flow>("edit");
  const [name, setName] = useState(meta.name);
  const [url, setUrl] = useState(meta.endpointUrl);
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState(meta.modelId);
  const [compatTab, setCompatTab] = useState<"openai" | "custom">("openai");
  const [authHeader, setAuthHeader] = useState("Authorization: Bearer {key}");
  const [requestBody, setRequestBody] = useState('{\n  "prompt": "{system_prompt}\\n\\n{user_message}",\n  "parameters": { "max_new_tokens": 512 }\n}');
  const [responsePath, setResponsePath] = useState("");

  if (flow === "savedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title="Changes saved" />;
  if (flow === "deletedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title={`${name} deleted`} subtitle="Endpoint has been removed." />;
  if (flow === "confirmDelete") return (
    <Confirm onClose={onClose} onCancel={() => setFlow("edit")}
      onConfirm={() => { setFlow("deletedFlash"); setTimeout(onClose, 1500); }}
      iconColor="#F59E0B" title={`Delete ${name}?`}
      description={`This will remove the custom endpoint. Tasks will no longer be routed to this endpoint.`}
      confirmLabel="Delete" confirmDanger />
  );

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0 0 8px", marginRight: 16, border: "none",
    borderBottom: active ? `2px solid ${ws.primary}` : "2px solid transparent",
    cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: f,
    backgroundColor: "transparent", color: active ? ws.primary : ws.muted_text,
    transition: "color 0.15s, border-color 0.15s",
  });

  return (
    <div style={shell}>
      <Head onClose={onClose}>
        <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, border: `1.5px dashed ${ws.inputBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: ws.secondary, fontFamily: f }}>{(name || "?").charAt(0).toUpperCase()}</div>
        <Title>{name}</Title>
      </Head>
      {/* Compatibility tabs */}
      <div style={{ display: "flex", gap: 0, padding: "0 20px", borderBottom: `1px solid ${ws.divider}` }}>
        <button onClick={() => setCompatTab("openai")} style={tabStyle(compatTab === "openai")}>OpenAI-compatible</button>
        <button onClick={() => setCompatTab("custom")} style={tabStyle(compatTab === "custom")}>Custom schema</button>
      </div>
      <div style={bodyFade}>
        <div style={{ padding: "16px 20px 40px" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><Lbl style={{ marginBottom: 0 }}>Name</Lbl><TestBtn providerId={item.id} modelId={modelId} /></div>
            <Inp value={name} onChange={setName} placeholder="Endpoint name" />
          </div>
          <div style={{ marginBottom: 14 }}><Lbl>Endpoint URL</Lbl><Inp value={url} onChange={setUrl} placeholder="https://your-endpoint.com/v1" /></div>

          {compatTab === "openai" ? (<>
            <div style={{ marginBottom: 14 }}><Lbl>API Key</Lbl><MaskedInp masked={meta.maskedKey} value={apiKey} onChange={setApiKey} placeholder="Enter key..." /></div>
            <div style={{ marginBottom: 14 }}><Lbl>Model ID</Lbl><Inp value={modelId} onChange={setModelId} placeholder="e.g. llama-3.1-70b" /></div>
            <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
              <Info size={13} color={ws.muted_text} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, lineHeight: 1.5 }}>Genie will use this provider when a task matches its capabilities.</span>
            </div>
          </>) : (<>
            <div style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, marginBottom: 14, lineHeight: 1.4 }}>Define how Genie constructs requests and extracts responses from this endpoint.</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 6 }}>
                <Lbl style={{ marginBottom: 0 }}>Auth Header</Lbl>
                <span style={{ fontSize: 10, color: ws.muted_text, fontFamily: f }}>Use {"{key}"} as placeholder</span>
              </div>
              <Inp value={authHeader} onChange={setAuthHeader} placeholder="Authorization: Bearer {key}" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 6 }}>
                <Lbl style={{ marginBottom: 0 }}>Request Body Template</Lbl>
                <span style={{ fontSize: 10, color: ws.muted_text, fontFamily: f }}>Variables: {"{system_prompt}"} {"{user_message}"} {"{messages_array}"} {"{model_id}"}</span>
              </div>
              <textarea value={requestBody} onChange={(e) => setRequestBody(e.target.value)}
                style={{ width: "100%", minHeight: 100, borderRadius: 8, border: `1px solid ${ws.inputBorder}`, padding: "10px 14px", fontSize: 12, fontFamily: "monospace, Inter, sans-serif", color: ws.body, backgroundColor: ws.surface, resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 6 }}>
                <Lbl style={{ marginBottom: 0 }}>Response Text Path</Lbl>
                <span style={{ fontSize: 10, color: ws.muted_text, fontFamily: f }}>JSONPath to the generated text in the response</span>
              </div>
              <Inp value={responsePath} onChange={setResponsePath} placeholder="e.g. $.generated_text or $.choices[0].message.content" />
            </div>
          </>)}
        </div>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: ws.surface }}>
        <button onClick={() => setFlow("confirmDelete")} style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500, color: ws.error, fontFamily: f, padding: 0, transition: "opacity 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        ><Trash2 size={13} /> Delete</button>
        <button onClick={() => { setFlow("savedFlash"); setTimeout(() => setFlow("edit"), 1200); }} style={priBtn} onMouseEnter={hoverP} onMouseLeave={leaveP}>Save</button>
      </div>
    </div>
  );
}

/* ── AddSelfHosted ───────────────────────────────────────────── */

function AddSelfHosted({ onClose }: { onClose: () => void }) {
  type Flow = "add" | "adding" | "addedFlash";
  const [flow, setFlow] = useState<Flow>("add");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState("");
  const [compatTab, setCompatTab] = useState<"openai" | "custom">("openai");
  const [authHeader, setAuthHeader] = useState("Authorization: Bearer {key}");
  const [requestBody, setRequestBody] = useState('{\n  "prompt": "{system_prompt}\\n\\n{user_message}",\n  "parameters": { "max_new_tokens": 512 }\n}');
  const [responsePath, setResponsePath] = useState("");
  const [testState, setTestState] = useState<"idle" | "testing" | "pass" | "fail">("idle");

  const ok = name.trim().length > 0 && url.trim().length > 0 && (compatTab === "openai" ? modelId.trim().length > 0 : responsePath.trim().length > 0);

  if (flow === "addedFlash") return <Flash onClose={onClose} icon={<AnimatedCheck />} title="Endpoint added" subtitle={`${name} is now available.`} />;

  const isAdding = flow === "adding";

  const handleTest = () => {
    setTestState("testing");
    setTimeout(() => {
      setTestState(Math.random() > 0.1 ? "pass" : "fail");
      setTimeout(() => setTestState("idle"), 2000);
    }, 1200);
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0 0 8px", marginRight: 16, border: "none",
    borderBottom: active ? `2px solid ${ws.primary}` : "2px solid transparent",
    cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 500, fontFamily: f,
    backgroundColor: "transparent", color: active ? ws.primary : ws.muted_text,
    transition: "color 0.15s, border-color 0.15s",
  });

  return (
    <div style={shell}>
      <Head onClose={onClose}>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Server size={20} color={ws.secondary} /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Title>Custom endpoint</Title>
          <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>Self-hosted or proprietary inference API</span>
        </div>
      </Head>
      {/* Compatibility tabs */}
      <div style={{ display: "flex", gap: 0, padding: "0 20px", borderBottom: `1px solid ${ws.divider}` }}>
        <button onClick={() => setCompatTab("openai")} style={tabStyle(compatTab === "openai")}>OpenAI-compatible</button>
        <button onClick={() => setCompatTab("custom")} style={tabStyle(compatTab === "custom")}>Custom schema</button>
      </div>
      <div style={bodyFade}>
        <div style={{ padding: "16px 20px 40px" }}>
          {/* Shared fields */}
          <div style={{ marginBottom: 14 }}><Lbl>Name</Lbl><Inp value={name} onChange={setName} placeholder="e.g. Marico Internal LLM" /></div>
          <div style={{ marginBottom: 14 }}><Lbl>Endpoint URL</Lbl><Inp value={url} onChange={setUrl} placeholder="https://your-endpoint.com/v1" /></div>

          {compatTab === "openai" ? (<>
            {/* OpenAI-compatible fields */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Lbl style={{ marginBottom: 0 }}>API Token</Lbl>
                <span style={{ fontSize: 10, fontWeight: 500, color: ws.muted_text, fontFamily: f, padding: "1px 6px", borderRadius: 4, backgroundColor: ws.muted, marginBottom: 6 }}>Optional</span>
              </div>
              <PwdInp value={apiKey} onChange={setApiKey} placeholder="Enter key if required..." />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Lbl>Model</Lbl>
                <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, marginBottom: 6 }}>From Genie model registry</span>
              </div>
              <Inp value={modelId} onChange={setModelId} placeholder="e.g. llama-3.1-70b" />
            </div>
            <div style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, marginBottom: 14 }}>Works with vLLM, Ollama, LiteLLM, NVIDIA NIM.</div>
            <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
              <Info size={13} color={ws.muted_text} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, lineHeight: 1.5 }}>Genie will use this provider when a task matches its capabilities.</span>
            </div>
          </>) : (<>
            {/* Custom schema fields */}
            <div style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, marginBottom: 14, lineHeight: 1.4 }}>Define how Genie constructs requests and extracts responses from this endpoint.</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 6 }}>
                <Lbl style={{ marginBottom: 0 }}>Auth Header</Lbl>
                <span style={{ fontSize: 10, color: ws.muted_text, fontFamily: f }}>Use {"{key}"} as placeholder</span>
              </div>
              <Inp value={authHeader} onChange={setAuthHeader} placeholder="Authorization: Bearer {key}" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 6 }}>
                <Lbl style={{ marginBottom: 0 }}>Request Body Template</Lbl>
                <span style={{ fontSize: 10, color: ws.muted_text, fontFamily: f }}>Variables: {"{system_prompt}"} {"{user_message}"} {"{messages_array}"} {"{model_id}"}</span>
              </div>
              <textarea value={requestBody} onChange={(e) => setRequestBody(e.target.value)}
                style={{ width: "100%", minHeight: 100, borderRadius: 8, border: `1px solid ${ws.inputBorder}`, padding: "10px 14px", fontSize: 12, fontFamily: "monospace", color: ws.body, backgroundColor: ws.surface, resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 6 }}>
                <Lbl style={{ marginBottom: 0 }}>Response Text Path</Lbl>
                <span style={{ fontSize: 10, color: ws.muted_text, fontFamily: f }}>JSONPath to the generated text in the response</span>
              </div>
              <Inp value={responsePath} onChange={setResponsePath} placeholder="e.g. $.generated_text or $.choices[0].message.content" />
            </div>
            {/* Test Connection */}
            <div style={{ borderTop: `1px solid ${ws.divider}`, paddingTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <Lbl style={{ marginBottom: 0 }}>Test Connection</Lbl>
                <button onClick={handleTest} disabled={testState === "testing"}
                  style={{
                    height: 30, padding: "0 14px", borderRadius: 8, border: `1px solid ${ws.primaryLight}`,
                    backgroundColor: "transparent", display: "flex", alignItems: "center", gap: 6,
                    cursor: testState === "testing" ? "default" : "pointer", fontSize: 12, fontWeight: 500,
                    color: testState === "pass" ? ws.success : testState === "fail" ? ws.error : ws.primary,
                    fontFamily: f, transition: "color 0.15s",
                  }}
                >
                  {testState === "testing" && <Loader2 size={12} style={{ animation: "mdl-spin 1s linear infinite" }} />}
                  {testState === "idle" && <FlaskConical size={12} />}
                  {testState === "idle" ? "Run test" : testState === "testing" ? "Testing..." : testState === "pass" ? "✓ Pass" : "✗ Fail"}
                </button>
              </div>
              <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, lineHeight: 1.4 }}>Sends a minimal probe via Genie backend. Confirms auth and model availability.</span>
            </div>
          </>)}
        </div>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: ws.surface }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, color: ws.secondary, fontFamily: f, transition: "opacity 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >Cancel</button>
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

/* ── Main export ─────────────────────────────────────────────── */

export default function ModelPanel({ item, onClose }: {
  item: ModelProviderItem; onClose: () => void;
}) {
  useEffect(() => {
    const id = "mdl-panel-css";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `@keyframes mdl-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}@keyframes mdl-spin{to{transform:rotate(360deg)}}@keyframes mdl-circle{100%{stroke-dashoffset:0}}@keyframes mdl-check{100%{stroke-dashoffset:0}}`;
      document.head.appendChild(s);
    }
  }, []);

  switch (item.panelMode) {
    case "genie-info": return <GenieInfo onClose={onClose} />;
    case "edit-provider": return <EditProvider item={item} onClose={onClose} />;
    case "add-provider": return <AddProvider item={item} onClose={onClose} />;
    case "edit-selfhosted": return <EditSelfHosted item={item} onClose={onClose} />;
    case "add-selfhosted": return <AddSelfHosted onClose={onClose} />;
    default: return null;
  }
}
