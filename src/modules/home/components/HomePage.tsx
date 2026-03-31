import { useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

const f = "Inter, sans-serif";

const ws = {
  page: "#FAF8F5", surface: "#FFFDF9", sidebar: "#F5F0EB", muted: "#F0EBE4",
  elevated: "#F5F0EB", border: "#E7E0D8", divider: "#F0EBE4", inputBorder: "#D6D3D1",
  heading: "#292524", body: "#44403C", secondary: "#78716C", muted_text: "#A8A29E",
  disabled: "#D6D3D1", primary: "#7C3AED", primaryHover: "#6D28D9",
  primaryLight: "#EDE9FE", primaryDark: "#5B21B6", success: "#10B981",
  successFg: "#065F46", successBg: "#ECFDF5", warning: "#F59E0B",
  warningFg: "#92400E", warningBg: "#FFFBEB", error: "#E11D48",
  errorFg: "#9F1239", errorBg: "#FFF1F2", hoverBg: "#EDE8E3",
};

const actionItems = [
  { id: 1, urgent: true, title: "Cash Recon Specialist is paused", badge: "Blocked",
    badgeColor: ws.error, subtitle: "Unmatched entry \u00b7 ITC Chennai", time: "2h 11m",
    button: "Resolve \u2192", primary: true, route: "/workers/cash-recon" },
  { id: 2, urgent: false, title: "Collections needs a decision", badge: "HITL",
    badgeColor: null, subtitle: "HUL Mumbai \u00b7 \u20b92.4L dispute \u00b7 61%", time: "3h 27m",
    button: "Open \u2192", primary: false, route: "/workers/collections" },
  { id: 3, urgent: false, title: "Collections just scored a collection", badge: "VIP",
    badgeColor: null, subtitle: "PepsiCo Pune \u00b7 \u20b987K overdue", time: "1h 10m",
    button: "View \u2192", primary: false, route: "/workers/collections" },
  { id: 4, urgent: false, title: "KYC Worker: Flagged address discrepancy", badge: null,
    badgeColor: null, subtitle: "Reliance #R-2291 \u00b7 Missing GST", time: "27m",
    button: "Open \u2192", primary: false, route: "/workers/kyc" },
] as const;

const workforceData = [
  { name: "Collections Specialist", desc: "Autonomous collections & follow-ups",
    dotColor: ws.success, hollow: false, draft: false, statValue: "48 today",
    statTrend: "96.4% success", trendColor: ws.success },
  { name: "Order Intake Worker", desc: "Processes incoming purchase orders",
    dotColor: ws.success, hollow: false, draft: false, statValue: "312 today",
    statTrend: "100% success", trendColor: ws.success },
  { name: "Credit Note Specialist", desc: "Automated credit note processing",
    dotColor: ws.success, hollow: false, draft: false, statValue: "870 today",
    statTrend: "99.8% success", trendColor: ws.success },
  { name: "KYC Verification Worker", desc: "Customer verification & compliance",
    dotColor: ws.success, hollow: false, draft: false, statValue: "12 today",
    statTrend: "91.7% success", trendColor: "#F59E0B" },
  { name: "Cash Recon Specialist", desc: "Bank statement reconciliation",
    dotColor: "#F59E0B", hollow: false, draft: false, statValue: "Paused",
    statTrend: "74% success", trendColor: ws.muted_text },
  { name: "Doc Processing Worker", desc: "Document intake & classification",
    dotColor: "#D6D3D1", hollow: true, draft: true, statValue: "Draft",
    statTrend: "Not deployed", trendColor: ws.disabled },
] as const;

const cardStyle: CSSProperties = {
  backgroundColor: ws.surface, border: `1px solid ${ws.border}`,
  borderRadius: 14, overflow: "hidden",
};
const sectionLabel: CSSProperties = {
  fontSize: 10, fontWeight: 600, color: "#A8A29E", letterSpacing: 0.3,
  textTransform: "uppercase", fontFamily: f, marginBottom: 8,
};

function StatCell({ value, label, sub, amber }: { value: string; label: string; sub: string; amber?: boolean }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3,
      ...(amber ? { background: ws.warningBg, borderRadius: 8, padding: "8px 12px" } : {}) }}>
      <span style={{ fontSize: 22, fontWeight: 700, color: amber ? "#F59E0B" : ws.heading, fontFamily: f, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase",
        color: amber ? "#92400E" : ws.muted_text, letterSpacing: 0.3, fontFamily: f }}>
        {label}
      </span>
      <span style={{ fontSize: 10, color: ws.muted_text, fontFamily: f }}>{sub}</span>
    </div>
  );
}

function SparklineBand() {
  const area = "M0,50 C100,48 150,35 250,20 C350,8 450,12 570,10 C650,14 750,30 850,45 C900,48 950,50 1000,52 L1000,56 L0,56 Z";
  const line = "M0,50 C100,48 150,35 250,20 C350,8 450,12 570,10 C650,14 750,30 850,45 C900,48 950,50 1000,52";
  return (
    <svg viewBox="0 0 1000 56" width="100%" height={56} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED14" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkGrad)" />
      <path d={line} fill="none" stroke="#7C3AED40" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={570} cy={15} r={4} fill={ws.primary} stroke="#FFFDF9" strokeWidth={2} />
      {["M","T","W","T","F","S","S"].map((d, i) => (
        <text key={i} x={71 + i * 143} y={54} textAnchor="middle" fontSize={9} fill="#A8A29E" fontFamily={f}>{d}</text>
      ))}
    </svg>
  );
}

function ActionRow({ item, last, navigate }: {
  item: (typeof actionItems)[number]; last: boolean; navigate: ReturnType<typeof useNavigate>;
}) {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const btnBase = { fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 6,
    cursor: "pointer" as const, whiteSpace: "nowrap" as const, fontFamily: f, flexShrink: 0 };
  const btnStyle: CSSProperties = item.primary
    ? { ...btnBase, background: btnHovered ? ws.primaryHover : ws.primary, color: "#FFF", border: "none" }
    : { ...btnBase, background: btnHovered ? ws.elevated : ws.surface, color: ws.body, border: `1px solid ${ws.border}` };

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        backgroundColor: hovered ? ws.hoverBg : "transparent", transition: "background-color 0.1s ease",
        cursor: "pointer", ...(item.urgent ? { borderLeft: "3px solid #EF4444" } : {}),
        ...(!last ? { borderBottom: `1px solid ${ws.divider}` } : {}) }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(item.route)}
    >
      <div style={{ width: 8, height: 8, backgroundColor: ws.body, borderRadius: 1, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: ws.heading, fontFamily: f }}>{item.title}</span>
          {item.badge && (
            <span style={{ fontSize: 9, fontWeight: 500, padding: "1px 6px", borderRadius: 4, fontFamily: f,
              ...(item.badgeColor === ws.error
                ? { background: ws.errorBg, color: ws.errorFg, border: `1px solid ${ws.error}` }
                : { background: ws.muted, color: ws.body, border: `1px solid ${ws.border}` }) }}>
              {item.badge}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>{item.subtitle}</span>
          <span style={{ fontSize: 10, fontWeight: 500, color: ws.secondary, background: ws.elevated,
            border: `1px solid ${ws.border}`, padding: "0px 5px", borderRadius: 4, fontFamily: f }}>
            {item.time}
          </span>
        </div>
      </div>
      <button style={btnStyle}
        onMouseEnter={(e) => { e.stopPropagation(); setBtnHovered(true); }}
        onMouseLeave={(e) => { e.stopPropagation(); setBtnHovered(false); }}
        onClick={(e) => { e.stopPropagation(); navigate(item.route); }}>
        {item.button}
      </button>
    </div>
  );
}

function WorkerRow({ worker, last }: { worker: (typeof workforceData)[number]; last: boolean }) {
  const dotBase = { width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 2 } as const;
  const dotStyle: CSSProperties = worker.hollow
    ? { ...dotBase, border: `1.5px solid ${worker.dotColor}`, backgroundColor: "transparent" }
    : { ...dotBase, backgroundColor: worker.dotColor };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
      ...(!last ? { borderBottom: `1px solid ${ws.divider}` } : {}) }}>
      <div style={dotStyle} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: worker.draft ? ws.muted_text : ws.body, fontFamily: f }}>
          {worker.name}
        </span>
        <span style={{ fontSize: 11, color: worker.draft ? ws.disabled : ws.muted_text, fontFamily: f }}>
          {worker.desc}
        </span>
      </div>
      <div style={{ width: 100, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: f,
          color: worker.draft ? ws.muted_text : worker.statValue === "Paused" ? "#F59E0B" : ws.heading }}>
          {worker.statValue}
        </span>
        <span style={{ fontSize: 10, color: worker.trendColor, fontFamily: f }}>{worker.statTrend}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, overflow: "auto", background: ws.page, padding: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Hero Card — Stacked Greeting + Sparkline Band */}
          <div style={cardStyle}>
            <div style={{ padding: 28 }}>
              <span style={{ fontSize: 36, fontWeight: 300, color: "#78716C", lineHeight: 1.15, fontFamily: f }}>
                Good morning,
              </span>
              <br />
              <span style={{ fontSize: 36, fontWeight: 600, color: ws.primary, lineHeight: 1.15, fontFamily: f }}>
                Priya.
              </span>
            </div>
            <SparklineBand />
            <div style={{ display: "flex", alignItems: "stretch", borderTop: `1px solid ${ws.muted}`, padding: "16px 28px 20px" }}>
              <StatCell value="8,420" label="TASKS THIS WEEK" sub="Since Monday" />
              <StatCell value="5 of 6" label="WORKERS ACTIVE" sub="1 paused" />
              <StatCell value="97.4%" label="AUTOMATION RATE" sub="No human needed" />
              <StatCell value="4" label="NEEDS ATTENTION" sub="HITL + blocked" amber />
            </div>
          </div>

          {/* Needs Your Action */}
          <div>
            <div style={sectionLabel}>NEEDS YOUR ACTION (4)</div>
            <div style={cardStyle}>
              {actionItems.map((item, i) => (
                <ActionRow key={item.id} item={item} last={i === actionItems.length - 1} navigate={navigate} />
              ))}
            </div>
          </div>

          {/* Your Workforce Today */}
          <div>
            <div style={{ ...sectionLabel, marginTop: 16 }}>YOUR WORKFORCE TODAY</div>
            <div style={cardStyle}>
              {workforceData.map((worker, i) => (
                <WorkerRow key={worker.name} worker={worker} last={i === workforceData.length - 1} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
