import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Pause, Settings } from "lucide-react";

const f = "Inter, sans-serif";

const ws = {
  page: "#FAF8F5", surface: "#FFFDF9", sidebar: "#F5F0EB", muted: "#F0EBE4",
  elevated: "#F5F0EB", border: "#E7E0D8", divider: "#F0EBE4", inputBorder: "#D6D3D1",
  heading: "#292524", body: "#44403C", secondary: "#78716C", muted_text: "#A8A29E",
  disabled: "#D6D3D1", primary: "#7C3AED", primaryHover: "#6D28D9", primaryLight: "#EDE9FE",
  primaryDark: "#5B21B6", success: "#10B981", successFg: "#065F46", successBg: "#ECFDF5",
  warning: "#F59E0B", warningFg: "#92400E", warningBg: "#FFFBEB", error: "#E11D48",
  errorFg: "#9F1239", errorBg: "#FFF1F2", hoverBg: "#EDE8E3",
};

const perfMetrics = [
  { value: "97.2%", label: "auto-approved", trend: "↑ 0.4%", trendColor: ws.success },
  { value: "340", label: "processed (7d)", trend: "↑ 12%", trendColor: ws.success },
  { value: "298", label: "completed", trend: null, trendColor: null },
  { value: "2.1%", label: "flag rate", trend: "↓ 0.3%", trendColor: ws.error },
];

const tabs = [
  { label: "Activity", to: "/workers/kyc/activity" },
  { label: "Records", to: "/workers/kyc/records" },
  { label: "Configuration", to: "/workers/kyc/configuration" },
];

export default function KycWorkerLayout() {
  const location = useLocation();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Hero card */}
            <div style={{
              backgroundColor: ws.surface,
              border: `1px solid ${ws.border}`,
              borderRadius: 14,
              padding: 24,
              display: "flex",
              flexDirection: "column" as const,
              gap: 12,
            }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h1 style={{ fontSize: 20, fontWeight: 700, color: ws.heading, margin: 0 }}>KYC Verification Worker</h1>
                  <p style={{ fontSize: 13, color: ws.muted_text, marginTop: 4, maxWidth: 620, lineHeight: 1.5 }}>
                    Receives distributor onboarding applications, verifies documents against government sources, escalates flagged cases, and posts approved records to ERP.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
                    border: `1px solid ${ws.border}`, background: ws.surface, fontSize: 12, fontWeight: 400,
                    color: ws.secondary, cursor: "pointer", fontFamily: f,
                  }}>
                    <Pause size={13} /> Pause
                  </button>
                  <button style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8,
                    border: `1px solid ${ws.border}`, background: ws.surface, fontSize: 12, fontWeight: 500,
                    color: ws.body, cursor: "pointer", fontFamily: f,
                  }}>
                    <Settings size={13} /> Edit Config →
                  </button>
                </div>
              </div>

              {/* Status + Performance */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px",
                    borderRadius: 9999, backgroundColor: ws.successBg, fontSize: 10, fontWeight: 500, color: ws.successFg,
                  }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: ws.success }} />
                    Live
                  </span>
                  <span style={{ fontSize: 12, color: ws.muted_text }}>Deployed 14 Jan 2026 · Last run 9:14 AM</span>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
                  {perfMetrics.map((m) => (
                    <div key={m.label} style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: ws.heading }}>{m.value}</span>
                      <span style={{ fontSize: 11, color: ws.muted_text }}>{m.label}</span>
                      {m.trend && (
                        <span style={{ fontSize: 10, color: m.trendColor ?? ws.muted_text }}>{m.trend}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: `1px solid ${ws.border}`, marginTop: 16 }}>
              {tabs.map((tab) => {
                const active = location.pathname === tab.to;
                return (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    style={{
                      padding: "8px 14px", fontSize: 13, fontWeight: active ? 500 : 400,
                      color: active ? ws.primary : ws.secondary, textDecoration: "none",
                      borderBottom: active ? `2px solid ${ws.primary}` : "2px solid transparent",
                      marginBottom: -1, transition: "color 0.12s, border-color 0.12s",
                    }}
                  >
                    {tab.label}
                  </NavLink>
                );
              })}
            </div>

            {/* Tab content */}
            <Outlet />
          </div>
        </div>
    </div>
  );
}
