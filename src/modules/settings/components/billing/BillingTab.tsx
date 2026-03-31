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

const stats = [
  { value: "8,412", label: "TASKS THIS MONTH", sub: "Mar 1 – 16, 2026" },
  { value: "6", label: "WORKERS DEPLOYED", sub: "5 live, 1 draft" },
  { value: "9", label: "TEAM MEMBERS", sub: "7 active, 2 pending" },
  { value: "1,240 hrs", label: "EFFORT SAVED (MTD)", sub: "\u2248 155 person-days" },
];

const usageData = [
  { worker: "Collections Specialist", tasks: "1,420", success: "96.4%", effort: "213 hrs" },
  { worker: "Order Intake Worker", tasks: "3,840", success: "99.8%", effort: "576 hrs" },
  { worker: "Credit Note Specialist", tasks: "2,460", success: "99.2%", effort: "369 hrs" },
  { worker: "KYC Verification Worker", tasks: "340", success: "97.2%", effort: "51 hrs" },
  { worker: "Cash Recon Specialist", tasks: "352", success: "74%", effort: "31 hrs" },
];

const headerCols = [
  { label: "WORKER", flex: true },
  { label: "TASKS (MTD)", w: 120 },
  { label: "SUCCESS", w: 100 },
  { label: "EFFORT SAVED", w: 120 },
];

export default function BillingTab() {
  return (
    <section style={{ fontFamily: f }}>
      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: ws.surface, border: `1px solid ${ws.border}`,
              borderRadius: 12, padding: 16,
            }}
          >
            <p style={{ fontSize: 24, fontWeight: 700, color: ws.heading, margin: 0 }}>{stat.value}</p>
            <p style={{
              fontSize: 10, fontWeight: 500, textTransform: "uppercase" as const,
              letterSpacing: 0.4, color: ws.muted_text, margin: 0, marginTop: 4,
            }}>
              {stat.label}
            </p>
            <p style={{ fontSize: 11, fontWeight: 400, color: ws.disabled, margin: 0, marginTop: 2 }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Usage by Worker */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
          letterSpacing: 0.5, color: ws.secondary, margin: 0,
          borderBottom: `1px solid ${ws.border}`, paddingBottom: 8, marginBottom: 12,
        }}>
          Usage by Worker
        </h2>
        <div style={{ borderRadius: 12, border: `1px solid ${ws.border}`, backgroundColor: ws.surface, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "flex", alignItems: "center", padding: "10px 16px",
            backgroundColor: ws.elevated, borderBottom: `1px solid ${ws.border}`,
          }}>
            {headerCols.map((col, i) => (
              <div key={i} style={{
                ...(col.flex ? { flex: 1 } : { width: col.w }),
                fontSize: 11, fontWeight: 500, letterSpacing: 0.4,
                textTransform: "uppercase" as const, color: ws.muted_text,
              }}>
                {col.label}
              </div>
            ))}
          </div>
          {/* Table rows */}
          {usageData.map((row, i) => (
            <div key={row.worker} style={{
              display: "flex", alignItems: "center", padding: "10px 16px",
              borderBottom: i < usageData.length - 1 ? `1px solid ${ws.divider}` : "none",
            }}>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: ws.body }}>{row.worker}</div>
              <div style={{ width: 120, fontSize: 13, fontWeight: 400, color: ws.secondary }}>{row.tasks}</div>
              <div style={{ width: 100, fontSize: 13, fontWeight: 400, color: ws.secondary }}>{row.success}</div>
              <div style={{ width: 120, fontSize: 13, fontWeight: 400, color: ws.secondary }}>{row.effort}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan & Billing */}
      <div>
        <h2 style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
          letterSpacing: 0.5, color: ws.secondary, margin: 0,
          borderBottom: `1px solid ${ws.border}`, paddingBottom: 8, marginBottom: 12,
        }}>
          Plan & Billing
        </h2>
        <div style={{ borderRadius: 12, border: `1px solid ${ws.border}`, backgroundColor: ws.surface, overflow: "hidden" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderBottom: `1px solid ${ws.divider}`,
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: ws.body, margin: 0 }}>Current plan</p>
              <p style={{ fontSize: 12, fontWeight: 400, color: ws.muted_text, margin: 0, marginTop: 2 }}>
                Managed by Javis Technologies
              </p>
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: ws.body }}>Enterprise</span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px",
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: ws.body, margin: 0 }}>Billing contact</p>
              <p style={{ fontSize: 12, fontWeight: 400, color: ws.muted_text, margin: 0, marginTop: 2 }}>
                For plan changes, upgrades, or billing questions
              </p>
            </div>
            <button
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 400, color: ws.secondary, fontFamily: f,
                padding: "7px 12px", borderRadius: 6, transition: "background-color 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ws.hoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Contact Javis &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
