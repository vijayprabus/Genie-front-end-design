import { useState, useEffect } from "react";
import { ChevronRight, X, Plus, Copy } from "lucide-react";
import { toast } from "sonner";
import { integrationLogoMap } from "./IntegrationLogos";
import { useBreakpoint } from "@/shared/hooks/useBreakpoint";
import { useLayoutContext } from "@/modules/settings/components/SettingsLayout";

const f = "Inter, sans-serif";

const ws = {
  page: "#FAF8F5", surface: "#FFFDF9", muted: "#F0EBE4",
  elevated: "#F5F0EB", border: "#E7E0D8", divider: "#F0EBE4", inputBorder: "#D6D3D1",
  heading: "#292524", body: "#44403C", secondary: "#78716C", muted_text: "#A8A29E",
  disabled: "#D6D3D1", primary: "#7C3AED", primaryLight: "#EDE9FE",
  success: "#10B981", error: "#E11D48", hoverBg: "#EDE8E3",
};

const GLOBAL_CSS = `
  @keyframes int-pulse {
    0%, 100% { opacity: 0.15; transform: scale(1); }
    50% { opacity: 0; transform: scale(1.6); }
  }
  @keyframes int-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes int-acheck-circle { 100% { stroke-dashoffset: 0; } }
  @keyframes int-acheck-check { 100% { stroke-dashoffset: 0; } }
  @keyframes int-toggle-glow {
    0% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
    50% { box-shadow: 0 0 0 4px rgba(124,58,237,0.15); }
    100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
  }

  /* Thin scrollbar for page */
  #main-content::-webkit-scrollbar { width: 6px; }
  #main-content::-webkit-scrollbar-track { background: transparent; }
  #main-content::-webkit-scrollbar-thumb { background: #D6D3D1; border-radius: 3px; }
  #main-content::-webkit-scrollbar-thumb:hover { background: #A8A29E; }
  #main-content { scrollbar-width: thin; scrollbar-color: #D6D3D1 transparent; }
  /* Hide scrollbar inside the detail panel — target any scrollable child of the fixed panel */
  [data-int-panel] *::-webkit-scrollbar { width: 0; display: none; }
  [data-int-panel] * { scrollbar-width: none; }
`;

const spring = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ── Shared components ───────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, margin: "0 0 10px", fontFamily: f }}>{children}</h3>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ backgroundColor: ws.surface, border: `1px solid ${ws.border}`, borderRadius: 14, overflow: "hidden" }}>{children}</div>;
}

function ColorCircle({ color }: { color: string }) {
  return <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />;
}

function HealthDot({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color, fontFamily: f }}>
      <span style={{ position: "relative", width: 8, height: 8, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ position: "absolute", width: 8, height: 8, borderRadius: "50%", backgroundColor: color, opacity: 0.25, animation: "int-pulse 3s ease-in-out infinite" }} />
        <span style={{ position: "relative", width: 6, height: 6, borderRadius: "50%", backgroundColor: color }} />
      </span>
      {label}
    </span>
  );
}

function Toggle({ on, onChange, pulsing }: { on: boolean; onChange: (v: boolean) => void; pulsing?: boolean }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} style={{
      width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
      backgroundColor: "#F0EBE4", position: "relative",
      transition: "background-color 0.2s", flexShrink: 0, padding: 0,
    }}>
      <span style={{
        position: "absolute", top: 2, left: on ? 18 : 2,
        width: 16, height: 16, borderRadius: "50%",
        backgroundColor: on ? "#7C3AED" : "#A8A29E",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        animation: pulsing ? "int-toggle-glow 0.8s ease-out" : "none",
      }} />
    </button>
  );
}

/* ── Skeleton shimmer ────────────────────────────────────────── */

function ShimmerBar({ width, height, mb = 0, delay = 0 }: { width: string | number; height: number; mb?: number; delay?: number }) {
  return <div style={{ width, height, borderRadius: 6, marginBottom: mb, background: `linear-gradient(90deg, ${ws.muted} 25%, ${ws.elevated} 50%, ${ws.muted} 75%)`, backgroundSize: "200% 100%", animation: `int-shimmer 1.5s ease-in-out infinite`, animationDelay: `${delay}ms` }} />;
}

/* ── Animated checkmark (SVG stroke-dashoffset) ──────────────── */

function AnimatedCheck({ size = 36 }: { size?: number }) {
  const [k] = useState(() => Date.now());
  return (
    <svg key={k} width={size} height={size} viewBox="0 0 52 52" style={{ display: "block" }}>
      <circle cx="26" cy="26" r="24" fill="none" stroke="#10B981" strokeWidth="2"
        style={{ strokeDasharray: 151, strokeDashoffset: 151, animation: "int-acheck-circle 0.5s cubic-bezier(0.65,0,0.45,1) forwards" }} />
      <path fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8"
        style={{ strokeDasharray: 36, strokeDashoffset: 36, animation: "int-acheck-check 0.3s cubic-bezier(0.65,0,0.45,1) 0.5s forwards" }} />
    </svg>
  );
}

function AnimatedCheckMuted({ size = 36 }: { size?: number }) {
  const [k] = useState(() => Date.now());
  return (
    <svg key={k} width={size} height={size} viewBox="0 0 52 52" style={{ display: "block" }}>
      <circle cx="26" cy="26" r="24" fill="none" stroke="#A8A29E" strokeWidth="2"
        style={{ strokeDasharray: 151, strokeDashoffset: 151, animation: "int-acheck-circle 0.5s cubic-bezier(0.65,0,0.45,1) forwards" }} />
      <path fill="none" stroke="#A8A29E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8"
        style={{ strokeDasharray: 36, strokeDashoffset: 36, animation: "int-acheck-check 0.3s cubic-bezier(0.65,0,0.45,1) 0.5s forwards" }} />
    </svg>
  );
}

/* ── Shared button styles ─────────────────────────────────────── */

const primaryBtnStyle: React.CSSProperties = {
  height: 40, borderRadius: 8, border: "none", backgroundColor: ws.primary,
  color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: f, cursor: "pointer",
  transition: "background-color 0.15s",
};

const primaryBtnSmStyle: React.CSSProperties = {
  ...primaryBtnStyle, height: 34, padding: "0 20px", width: "auto",
};

const dangerBtnStyle: React.CSSProperties = {
  ...primaryBtnStyle, backgroundColor: ws.error,
};

function hoverPrimary(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.backgroundColor = "#6D28D9"; }
function leavePrimary(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.backgroundColor = ws.primary; }
function hoverDanger(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.backgroundColor = "#BE123C"; }
function leaveDanger(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.backgroundColor = ws.error; }
function hoverText(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.opacity = "0.7"; }
function leaveText(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.opacity = "1"; }

/* ── Data types ──────────────────────────────────────────────── */

type PanelState = "enable" | "connect" | "manage";
interface IntegrationTool { name: string; group: string; defaultOn: boolean; }
interface IntegrationItem {
  id: string; name: string; color: string; description: string;
  enabled: boolean; connected?: boolean;
  panelState: PanelState; aboutText: string; tools: IntegrationTool[]; accountEmail?: string;
}

/* ── Data — tools & items ────────────────────────────────────── */

const genericTools: IntegrationTool[] = [
  { name: "Read Data", group: "Access", defaultOn: true },
  { name: "Write Data", group: "Access", defaultOn: true },
  { name: "List Resources", group: "Access", defaultOn: true },
];

const allIntegrations: IntegrationItem[] = [
  { id: "sales-db", name: "Sales Analytics DB", color: "#4361EE", description: "PostgreSQL", enabled: true, connected: true, panelState: "manage", aboutText: "Query and analyze your sales analytics database.", tools: [{ name: "Read Tables", group: "Access", defaultOn: true }, { name: "Run Queries", group: "Access", defaultOn: true }], accountEmail: "sales-db.marico.com:5432" },
  { id: "brand-db", name: "Branding Metrics DB", color: "#4361EE", description: "PostgreSQL", enabled: true, connected: true, panelState: "manage", aboutText: "Access branding and marketing metrics data.", tools: [{ name: "Read Tables", group: "Access", defaultOn: true }, { name: "Run Queries", group: "Access", defaultOn: true }], accountEmail: "brand-db.marico.com:5432" },
  { id: "mysql", name: "MySQL", color: "#00758F", description: "Relational database", enabled: false, panelState: "enable", aboutText: "Connect MySQL for data queries.", tools: genericTools },
  { id: "postgresql", name: "PostgreSQL", color: "#336791", description: "Relational database", enabled: false, panelState: "enable", aboutText: "Connect PostgreSQL for analytics.", tools: genericTools },
  { id: "snowflake", name: "Snowflake", color: "#29B5E8", description: "Cloud data warehouse", enabled: false, panelState: "enable", aboutText: "Connect Snowflake for enterprise warehousing.", tools: genericTools },
  { id: "bigquery", name: "BigQuery", color: "#4285F4", description: "Analytics warehouse", enabled: false, panelState: "enable", aboutText: "Connect BigQuery for large-scale analytics.", tools: genericTools },
  { id: "mongodb", name: "MongoDB", color: "#47A248", description: "Document database", enabled: false, panelState: "enable", aboutText: "Connect MongoDB for document data.", tools: genericTools },
  { id: "oracle", name: "Oracle", color: "#C74634", description: "Enterprise database", enabled: false, panelState: "enable", aboutText: "Connect Oracle for enterprise data.", tools: genericTools },
  { id: "sap", name: "SAP HANA", color: "#0066B3", description: "In-memory database", enabled: false, panelState: "enable", aboutText: "Connect SAP HANA for real-time analytics.", tools: genericTools },
];

/* ── Detail Panel with full enablement flow ──────────────────── */

type FlowState = "enable" | "confirmEnable" | "enabledFlash" | "connect" | "waitingOAuth" | "connectedFlash" | "manage" | "savedFlash" | "confirmDisconnect" | "disconnectedFlash" | "confirmDisable" | "disabledFlash";

function DetailPanel({ item, onClose }: { item: IntegrationItem; onClose: () => void }) {
  const initialFlow: FlowState = item.panelState === "manage" ? "manage" : item.panelState === "connect" ? "connect" : "enable";
  const [flow, setFlow] = useState<FlowState>(initialFlow);
  const [toolStates, setToolStates] = useState<Record<string, boolean>>({});
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const init: Record<string, boolean> = {};
    item.tools.forEach((t) => { init[t.name] = t.defaultOn; });
    setToolStates(init);
    setFlow(item.panelState === "manage" ? "manage" : item.panelState === "connect" ? "connect" : "enable");
  }, [item.id]);

  const [pulsingTool, setPulsingTool] = useState<string | null>(null);
  const toggleTool = (name: string) => {
    setToolStates((p) => ({ ...p, [name]: !p[name] }));
    setPulsingTool(name);
    setTimeout(() => setPulsingTool(null), 800);
  };

  /* Cross-fade transition helper */
  const transitionTo = (next: FlowState, delay = 0) => {
    setFadingOut(true);
    setTimeout(() => { setFlow(next); setFadingOut(false); }, delay || 250);
  };

  /* Enable → Confirm → Enabled flash → Connect */
  const handleEnable = () => {
    transitionTo("confirmEnable");
  };

  const handleConfirmEnable = () => {
    transitionTo("enabledFlash");
    setTimeout(() => transitionTo("connect"), 3000);
  };

  /* Connect → Waiting → simulated OAuth return → Connected flash → Manage */
  const handleConnect = () => {
    transitionTo("waitingOAuth");
    // Simulate OAuth: user "returns" after 3s
    setTimeout(() => transitionTo("connectedFlash"), 3500);
    setTimeout(() => transitionTo("manage"), 5000);
  };

  const Logo = integrationLogoMap[item.id];
  const groups: Record<string, IntegrationTool[]> = {};
  item.tools.forEach((t) => { if (!groups[t.group]) groups[t.group] = []; groups[t.group].push(t); });
  const groupEntries = Object.entries(groups);

  /* Shared panel header */
  const header = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", flexShrink: 0, borderBottom: `1px solid ${ws.divider}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div style={{ flexShrink: 0 }}>{Logo ? <Logo size={24} /> : <ColorCircle color={item.color} />}</div>
        <span style={{ fontSize: 16, fontWeight: 700, color: ws.heading, fontFamily: f, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
      </div>
      <button aria-label="Close panel" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: 4, display: "flex", color: ws.muted_text, borderRadius: 6 }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ws.hoverBg)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      ><X size={16} /></button>
    </div>
  );

  /* Shared tools list (plain text, no toggles) */
  const toolsList = (
    <div style={{ padding: "16px 20px 40px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontStyle: "italic", color: ws.muted_text, fontFamily: f }}>Available after connecting</div>
      </div>
      <div style={{ borderRadius: 8, border: `1px solid ${ws.divider}`, overflow: "hidden" }}>
        {item.tools.map((tool, ti) => (
          <div key={tool.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderBottom: ti < item.tools.length - 1 ? `1px solid ${ws.divider}` : "none" }}>
            <span style={{ fontSize: 13, color: ws.muted_text, fontFamily: f }}>{tool.name}</span>
            <div style={{ width: 36, height: 20, borderRadius: 10, backgroundColor: "#E7E5E4", position: "relative", opacity: 0.5 }}>
              <span style={{ position: "absolute", top: 2, left: 2, width: 16, height: 16, borderRadius: "50%", backgroundColor: ws.disabled }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* Shared tools with toggles (manage state) */
  const toolsWithToggles = (
    <div style={{ padding: "16px 20px 40px" }}>
      {groupEntries.map(([groupName, tools], gi) => (
        <div key={groupName} style={{ marginBottom: gi < groupEntries.length - 1 ? 16 : 0 }}>
          <div style={{ borderRadius: 8, border: `1px solid ${ws.divider}`, overflow: "hidden" }}>
            {groupEntries.length > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: `1px solid ${ws.divider}` }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: ws.body, fontFamily: f }}>{groupName}</span>
                <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>{tools.filter(t => toolStates[t.name]).length} of {tools.length}</span>
              </div>
            )}
            {tools.map((tool, ti) => (
              <div key={tool.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderBottom: ti < tools.length - 1 ? `1px solid ${ws.divider}` : "none" }}>
                <span style={{ fontSize: 13, color: ws.body, fontFamily: f }}>{tool.name}</span>
                <Toggle on={!!toolStates[tool.name]} onChange={() => toggleTool(tool.name)} pulsing={pulsingTool === tool.name} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const bodyFade: React.CSSProperties = {
    flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden",
    WebkitMaskImage: "linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)",
    maskImage: "linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)",
    opacity: fadingOut ? 0 : 1, transition: "opacity 0.2s ease",
  };

  const shell: React.CSSProperties = { display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" };

  /* ── FLOW: Enable ──────────────────────────────────── */
  if (flow === "enable") return (
    <div style={shell}>
      {header}
      <div style={bodyFade}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${ws.divider}` }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, fontFamily: f, marginBottom: 8 }}>About this integration</div>
          <p style={{ fontSize: 13, lineHeight: 1.5, color: ws.body, fontFamily: f, margin: 0 }}>{item.aboutText}</p>
        </div>
        {toolsList}
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, backgroundColor: ws.surface }}>
        <button onClick={handleEnable} style={{ ...primaryBtnStyle, width: "100%" }} onMouseEnter={hoverPrimary} onMouseLeave={leavePrimary}>Enable for Organization</button>
      </div>
    </div>
  );

  /* ── FLOW: Confirm Enable ────────────────────────────── */
  if (flow === "confirmEnable") return (
    <div style={shell}>
      {header}
      <div style={{ ...bodyFade, padding: "20px 20px" }}>
        <div style={{ width: 24, height: 24, marginBottom: 12 }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: ws.heading, fontFamily: f, marginBottom: 10 }}>Enable {item.name} for your organization?</div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: ws.secondary, fontFamily: f, margin: 0 }}>
          All 45 members will be able to connect their accounts, and Workers will gain access to {item.name} tools.
        </p>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", justifyContent: "flex-end", gap: 10, backgroundColor: ws.surface }}>
        <button onClick={() => setFlow("enable")} style={{ height: 34, borderRadius: 8, border: `1px solid ${ws.border}`, backgroundColor: "transparent", color: ws.secondary, fontSize: 13, fontWeight: 500, fontFamily: f, cursor: "pointer", padding: "0 16px", transition: "background-color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ws.hoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >Cancel</button>
        <button onClick={handleConfirmEnable} style={{ ...primaryBtnSmStyle, padding: "0 16px" }} onMouseEnter={hoverPrimary} onMouseLeave={leavePrimary}>Enable for 45 members</button>
      </div>
    </div>
  );

  /* ── FLOW: Enabled Flash ───────────────────────────── */
  if (flow === "enabledFlash") return (
    <div style={shell}>
      {header}
      <div style={{ ...bodyFade, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40 }}>
        <AnimatedCheck />
        <span style={{ fontSize: 16, fontWeight: 600, color: ws.heading, fontFamily: f, textAlign: "center" }}>Enabled for your organization</span>
        <span style={{ fontSize: 13, color: ws.secondary, fontFamily: f, textAlign: "center", lineHeight: 1.5 }}>Now connect your {item.name} account to start using it.</span>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, backgroundColor: ws.surface }}>
        <button onClick={() => transitionTo("connect")} style={{ ...primaryBtnStyle, width: "100%" }} onMouseEnter={hoverPrimary} onMouseLeave={leavePrimary}>Connect Account</button>
      </div>
    </div>
  );

  /* ── FLOW: Connect ─────────────────────────────────── */
  if (flow === "connect") return (
    <div style={shell}>
      {header}
      <div style={bodyFade}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${ws.divider}` }}>
          <p style={{ fontSize: 13, lineHeight: 1.5, color: ws.body, fontFamily: f, margin: 0 }}>{item.aboutText}</p>
        </div>
        {toolsList}
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, backgroundColor: ws.surface }}>
        <button onClick={handleConnect} style={{ ...primaryBtnStyle, width: "100%" }} onMouseEnter={hoverPrimary} onMouseLeave={leavePrimary}>Connect Account</button>
      </div>
    </div>
  );

  /* ── FLOW: Waiting for OAuth ───────────────────────── */
  if (flow === "waitingOAuth") return (
    <div style={shell}>
      {header}
      <div style={{ ...bodyFade, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 40 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ws.inputBorder, animation: "int-pulse 1.5s ease-in-out infinite" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ws.muted_text, animation: "int-pulse 1.5s ease-in-out 0.3s infinite" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ws.inputBorder, animation: "int-pulse 1.5s ease-in-out 0.6s infinite" }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, color: ws.body, fontFamily: f, textAlign: "center" }}>Waiting for authentication...</span>
        <span style={{ fontSize: 13, color: ws.muted_text, fontFamily: f, textAlign: "center", lineHeight: 1.5 }}>Complete sign-in in the browser tab that just opened.</span>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", justifyContent: "center", backgroundColor: ws.surface }}>
        <button onClick={() => transitionTo("connect")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, color: ws.secondary, fontFamily: f }} onMouseEnter={hoverText} onMouseLeave={leaveText}>Cancel</button>
      </div>
    </div>
  );

  /* ── FLOW: Connected Flash ─────────────────────────── */
  if (flow === "connectedFlash") return (
    <div style={shell}>
      {header}
      <div style={{ ...bodyFade, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40 }}>
        <AnimatedCheck />
        <span style={{ fontSize: 16, fontWeight: 600, color: ws.heading, fontFamily: f, textAlign: "center" }}>Account connected</span>
        <span style={{ fontSize: 13, color: ws.secondary, fontFamily: f, textAlign: "center", lineHeight: 1.5 }}>{item.accountEmail || item.name}<br />Connected successfully</span>
      </div>
    </div>
  );

  /* ── FLOW: Confirm Disconnect ──────────────────────── */
  if (flow === "confirmDisconnect") return (
    <div style={shell}>
      {header}
      <div style={{ ...bodyFade, padding: "20px 20px" }}>
        <div style={{ width: 24, height: 24, marginBottom: 12 }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: ws.heading, fontFamily: f, marginBottom: 10 }}>Disconnect this account?</div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: ws.secondary, fontFamily: f, margin: 0 }}>
          This will revoke access for {item.accountEmail || "this account"}. Workers using this account will lose capabilities until reconnected.
        </p>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", justifyContent: "flex-end", gap: 10, backgroundColor: ws.surface }}>
        <button onClick={() => setFlow("manage")} style={{ height: 34, borderRadius: 8, border: `1px solid ${ws.border}`, backgroundColor: "transparent", color: ws.secondary, fontSize: 13, fontWeight: 500, fontFamily: f, cursor: "pointer", padding: "0 16px", transition: "background-color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ws.hoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >Cancel</button>
        <button onClick={() => { transitionTo("disconnectedFlash"); setTimeout(() => transitionTo("connect"), 1500); }} style={{ ...dangerBtnStyle, height: 34, padding: "0 16px" }} onMouseEnter={hoverDanger} onMouseLeave={leaveDanger}>Disconnect</button>
      </div>
    </div>
  );

  /* ── FLOW: Confirm Disable ─────────────────────────── */
  if (flow === "confirmDisable") return (
    <div style={shell}>
      {header}
      <div style={{ ...bodyFade, padding: "20px 20px" }}>
        <div style={{ width: 24, height: 24, marginBottom: 12 }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: ws.heading, fontFamily: f, marginBottom: 10 }}>Disable {item.name} for your organization?</div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: ws.secondary, fontFamily: f, margin: 0 }}>
          All connected accounts will be disconnected. Workers using {item.name} tools will lose access immediately. This cannot be undone without re-enabling and reconnecting.
        </p>
      </div>
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", justifyContent: "flex-end", gap: 10, backgroundColor: ws.surface }}>
        <button onClick={() => setFlow("manage")} style={{ height: 34, borderRadius: 8, border: `1px solid ${ws.border}`, backgroundColor: "transparent", color: ws.secondary, fontSize: 13, fontWeight: 500, fontFamily: f, cursor: "pointer", padding: "0 16px", transition: "background-color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ws.hoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >Cancel</button>
        <button onClick={() => { transitionTo("disabledFlash"); setTimeout(() => onClose(), 2000); }} style={{ ...dangerBtnStyle, height: 34, padding: "0 16px" }} onMouseEnter={hoverDanger} onMouseLeave={leaveDanger}>Disable Integration</button>
      </div>
    </div>
  );

  /* ── FLOW: Disconnected Flash ────────────────────────── */
  if (flow === "disconnectedFlash") return (
    <div style={shell}>
      {header}
      <div style={{ ...bodyFade, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40 }}>
        <AnimatedCheckMuted />
        <span style={{ fontSize: 16, fontWeight: 600, color: ws.heading, fontFamily: f, textAlign: "center" }}>Account disconnected</span>
        <span style={{ fontSize: 13, color: ws.secondary, fontFamily: f, textAlign: "center", lineHeight: 1.5 }}>{item.accountEmail || item.name} has been removed.</span>
      </div>
    </div>
  );

  /* ── FLOW: Saved Flash ──────────────────────────────── */
  if (flow === "savedFlash") return (
    <div style={shell}>
      {header}
      <div style={{ ...bodyFade, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40 }}>
        <AnimatedCheck />
        <span style={{ fontSize: 16, fontWeight: 600, color: ws.heading, fontFamily: f, textAlign: "center" }}>Changes saved</span>
      </div>
    </div>
  );

  /* ── FLOW: Disabled Flash ──────────────────────────── */
  if (flow === "disabledFlash") return (
    <div style={shell}>
      {header}
      <div style={{ ...bodyFade, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40 }}>
        <AnimatedCheckMuted />
        <span style={{ fontSize: 16, fontWeight: 600, color: ws.heading, fontFamily: f, textAlign: "center" }}>Integration disabled</span>
        <span style={{ fontSize: 13, color: ws.secondary, fontFamily: f, textAlign: "center", lineHeight: 1.5 }}>{item.name} has been disabled for your organization.</span>
      </div>
    </div>
  );

  /* ── FLOW: Manage ──────────────────────────────────── */
  return (
    <div style={shell}>
      {header}
      <div style={bodyFade}>
        {/* Account section */}
        {item.accountEmail && (
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${ws.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: ws.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#fff", fontFamily: f, flexShrink: 0 }}>{item.accountEmail.charAt(0).toUpperCase()}</div>
              <span style={{ fontSize: 13, color: ws.body, fontFamily: f, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.accountEmail}</span>
            </div>
            <button onClick={() => setFlow("confirmDisconnect")} style={{ background: "none", border: `1px solid ${ws.border}`, borderRadius: 6, cursor: "pointer", flexShrink: 0, fontSize: 11, fontWeight: 500, color: ws.secondary, fontFamily: f, whiteSpace: "nowrap", padding: "4px 10px", transition: "border-color 0.15s, color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = ws.error; e.currentTarget.style.color = ws.error; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = ws.border; e.currentTarget.style.color = ws.secondary; }}
            >Disconnect</button>
          </div>
        )}
        {/* Tools with toggles */}
        {toolsWithToggles}
      </div>
      {/* Footer */}
      <div style={{ padding: "12px 20px 16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <button onClick={() => setFlow("confirmDisable")} style={{ background: "none", border: "1px solid #FECACA", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 500, color: ws.error, fontFamily: f, whiteSpace: "nowrap", padding: "6px 14px", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FEF2F2"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
        >Disable for Org</button>
      </div>
    </div>
  );
}

/* ── Page-level skeleton (initial load) ──────────────────────── */

function PageSkeleton() {
  return (
    <div style={{ fontFamily: f }}>
      {/* Title */}
      <ShimmerBar width={140} height={20} mb={8} />
      <ShimmerBar width={320} height={13} mb={18} />

      {/* Search bar + button */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <ShimmerBar width={480} height={40} />
        <ShimmerBar width={150} height={34} />
      </div>

      {/* Section label */}
      <ShimmerBar width={80} height={10} mb={12} />

      {/* Connected card rows */}
      <div style={{ borderRadius: 14, border: `1px solid ${ws.border}`, overflow: "hidden", backgroundColor: ws.surface, marginBottom: 24 }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: i < 1 ? `1px solid ${ws.divider}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShimmerBar width={20} height={20} delay={i * 60} />
              <ShimmerBar width={90 + i * 14} height={13} delay={i * 60} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShimmerBar width={80 + i * 8} height={12} delay={i * 60} />
              <ShimmerBar width={14} height={14} delay={i * 60} />
            </div>
          </div>
        ))}
      </div>

      {/* Available label */}
      <ShimmerBar width={60} height={10} mb={12} />

      {/* Available card rows */}
      <div style={{ borderRadius: 14, border: `1px solid ${ws.border}`, overflow: "hidden", backgroundColor: ws.surface }}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: i < 5 ? `1px solid ${ws.divider}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShimmerBar width={20} height={20} delay={i * 60} />
              <ShimmerBar width={80 + i * 12} height={13} delay={i * 60} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShimmerBar width={100} height={12} delay={i * 60} />
              <ShimmerBar width={14} height={14} delay={i * 60} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */

export default function DataTab() {
  const bp = useBreakpoint();
  const isDesktop = bp === "desktop";
  const isMobile = bp === "mobile";
  const { searchQuery } = useLayoutContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelFading, setPanelFading] = useState(false);
  const [renderedItem, setRenderedItem] = useState<IntegrationItem | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  /* Integration data */
  const selectedIntegration = allIntegrations.find((i) => i.id === selectedId) ?? null;
  const panelOpen = selectedIntegration !== null;

  /* Keep rendered item alive during close animation */
  useEffect(() => { if (selectedIntegration) { setRenderedItem(selectedIntegration); } }, [selectedIntegration]);
  useEffect(() => { if (!panelOpen && renderedItem) { const t = setTimeout(() => { setRenderedItem(null); }, 320); return () => clearTimeout(t); } }, [panelOpen, renderedItem]);

  /* Connected count */
  const connectedCount = allIntegrations.filter((i) => i.enabled && i.connected).length;

  /* Filter by search only */
  const filteredItems = allIntegrations.filter((item) => {
    return !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const connectedItems = filteredItems.filter((i) => i.enabled && i.connected);
  const availableItems = filteredItems.filter((i) => !(i.enabled && i.connected));

  /* Simulate initial page load */
  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const handleSelectItem = (id: string) => {
    if (id === selectedId) { setSelectedId(null); return; }
    if (selectedId) {
      setPanelFading(true);
      setTimeout(() => {
        const nextIntegration = allIntegrations.find((i) => i.id === id) ?? null;
        if (nextIntegration) { setRenderedItem(nextIntegration); }
        setSelectedId(id);
        requestAnimationFrame(() => setPanelFading(false));
      }, 200);
    } else {
      setSelectedId(id);
    }
  };
  const handleClosePanel = () => setSelectedId(null);

  function renderRow(item: IntegrationItem, last: boolean) {
    const Logo = integrationLogoMap[item.id];
    const isSelected = item.id === selectedId;
    const isConnected = item.enabled && item.connected;
    const isHovered = hoveredRowId === item.id;
    return (
      <div key={item.id} role="button" tabIndex={0} aria-selected={isSelected}
        onClick={() => handleSelectItem(item.id)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelectItem(item.id); } }}
        onMouseEnter={(e) => { setHoveredRowId(item.id); if (!isSelected) e.currentTarget.style.backgroundColor = ws.hoverBg; }}
        onMouseLeave={(e) => { setHoveredRowId(null); e.currentTarget.style.backgroundColor = isSelected ? ws.elevated : "transparent"; }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "14px 14px" : "10px 14px", cursor: "pointer", transition: "background-color 0.15s",
          borderBottom: last ? "none" : `1px solid ${ws.divider}`,
          backgroundColor: isSelected ? ws.elevated : "transparent",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ flexShrink: 0 }}>{Logo ? <Logo size={20} /> : <ColorCircle color={item.color} />}</div>
          <span style={{ fontSize: isMobile ? 14 : 13, fontWeight: 500, color: ws.body, fontFamily: f, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {isConnected && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: isMobile ? 13 : 12, color: ws.muted_text, fontFamily: f }}><span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ws.success, flexShrink: 0 }} />Connected</span>}
          {isConnected && (
            <button
              onClick={(e) => { e.stopPropagation(); toast("Duplicate connection coming soon"); }}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 4,
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: isHovered ? 1 : 0, transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.muted; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              title="Duplicate connection"
            >
              <Copy size={13} color={ws.muted_text} />
            </button>
          )}
          {item.enabled && !item.connected && <span style={{ fontSize: isMobile ? 13 : 12, color: ws.disabled, fontFamily: f }}>Not connected</span>}
          {!item.enabled && <span style={{ fontSize: isMobile ? 13 : 12, color: ws.muted_text, fontFamily: f, whiteSpace: "nowrap" }}>{item.description}</span>}
          <ChevronRight size={14} color={ws.disabled} />
        </div>
      </div>
    );
  }

  if (pageLoading) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <PageSkeleton />
    </>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ fontFamily: f }}>
        <h1 style={{ fontSize: isMobile ? 24 : 20, fontWeight: 700, color: ws.heading, margin: 0, fontFamily: f }}>Data</h1>
        <p style={{ fontSize: isMobile ? 14 : 13, color: ws.secondary, margin: "4px 0 14px", fontFamily: f }}>
          Connect databases and data sources for your Workers. {connectedCount} connected
        </p>

        {/* Content area */}
        <div style={{ display: "flex" }}>
          {/* Left: search + list */}
          <div style={{
            flex: 1, minWidth: 0,
            marginRight: isDesktop && panelOpen ? 496 : 0,
            transition: `margin-right 0.32s ${spring}`,
          }}>
            {/* Add Connection button */}
            <div style={{ marginBottom: 20 }}>
              <button
                onClick={() => toast("Add connection coming soon")}
                style={{
                  height: 34, borderRadius: 8, border: "none", backgroundColor: ws.primary,
                  color: "#fff", fontSize: 13, fontWeight: 500, fontFamily: f, cursor: "pointer",
                  padding: "0 16px", display: "flex", alignItems: "center", gap: 6,
                  transition: "background-color 0.15s", whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#6D28D9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ws.primary; }}
              >
                <Plus size={15} strokeWidth={2} />
                Add Connection
              </button>
            </div>

            {/* Connected section */}
            {connectedItems.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <SectionLabel>Connected</SectionLabel>
                <Card>{connectedItems.map((item, i) => renderRow(item, i === connectedItems.length - 1))}</Card>
              </div>
            )}

            {/* Available section */}
            <div style={{ paddingBottom: 80 }}>
              {availableItems.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <SectionLabel>Available</SectionLabel>
                  <Card>{availableItems.map((item, i) => renderRow(item, i === availableItems.length - 1))}</Card>
                </div>
              )}
              {availableItems.length === 0 && connectedItems.length === 0 && (
                <div style={{ padding: "20px 16px", textAlign: "center" }}>
                  <span style={{ fontSize: 13, color: ws.muted_text, fontFamily: f }}>No results match &ldquo;{searchQuery}&rdquo;</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop overlay — non-desktop */}
      {!isDesktop && (
        <div
          onClick={handleClosePanel}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            opacity: panelOpen ? 1 : 0,
            pointerEvents: panelOpen ? "auto" : "none",
            transition: `opacity 0.24s ${spring}`,
            zIndex: 9,
          }}
        />
      )}

      {/* Panel — side panel or bottom sheet */}
      <div data-int-panel style={isMobile ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "85vh",
        transform: panelOpen ? "translateY(0)" : "translateY(100%)",
        opacity: panelOpen ? 1 : 0,
        transition: `transform 0.32s ${spring}, opacity 0.2s ${spring}`,
        pointerEvents: panelOpen ? "auto" : "none",
        zIndex: 10,
      } : {
        position: "fixed",
        top: 80,
        right: isDesktop ? 32 : 20,
        width: isDesktop ? 480 : "min(480px, calc(100vw - 260px))",
        height: "calc(100vh - 100px)",
        transform: panelOpen ? "translateX(0)" : "translateX(calc(100% + 40px))",
        opacity: panelOpen ? 1 : 0,
        transition: `transform 0.32s ${spring}, opacity 0.24s ${spring}`,
        pointerEvents: panelOpen ? "auto" : "none",
        zIndex: 10,
      }}>
        <div style={{
          width: "100%", height: "100%",
          borderRadius: isMobile ? "20px 20px 0 0" : 14,
          backgroundColor: ws.surface,
          border: isMobile ? "none" : `1px solid ${ws.border}`,
          boxShadow: isMobile
            ? "0 -4px 20px rgba(0,0,0,0.08)"
            : "0 4px 16px -4px rgba(0,0,0,0.08), 0 1px 4px -1px rgba(0,0,0,0.04)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {isMobile && (
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px", flexShrink: 0 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#D6D3D1" }} />
            </div>
          )}
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden", opacity: panelFading ? 0 : 1, transition: "opacity 0.2s ease" }}>
            {renderedItem && <DetailPanel item={renderedItem} onClose={handleClosePanel} />}
          </div>
        </div>
      </div>
    </>
  );
}
