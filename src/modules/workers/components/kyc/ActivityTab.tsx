import React from "react";

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

type DotType = "hollow" | "filled" | "action";

interface LogEntry {
  time: string;
  dot: DotType;
  title: string;
  description: string;
  transcript?: string[];
}

const logEntries: LogEntry[] = [
  {
    time: "9:38 AM",
    dot: "hollow",
    title: "Verifying: Metro Cash #M-881",
    description: "Bank verification via NPCI. 1/5 docs verified.",
  },
  {
    time: "9:22 AM",
    dot: "filled",
    title: "ERP posting: ITC #I-4401",
    description: "5/5 verified. Creating customer master in SAP.",
  },
  {
    time: "9:14 AM",
    dot: "action",
    title: "Flagged: Reliance #R-2291 — GST address mismatch",
    description: "72% confidence. HITL email sent to Priya Anand.",
    transcript: [
      "→ GSTN: Name match ✓ · Status: Active ✓",
      "→ Address: \"3rd Floor\" vs \"Ground Floor\" — mismatch",
      "→ 72% → email sent to priya@marico.com",
    ],
  },
  {
    time: "9:12 AM",
    dot: "filled",
    title: "Auto-approved: Reliance #R-2291 — PAN, Aadhaar, Bank",
    description: "3 docs. PAN 99%, Aadhaar 96%, Bank 94%.",
  },
  {
    time: "8:55 AM",
    dot: "action",
    title: "Failed: DMart #D-1192 — CIN not found",
    description: "58% confidence. Resubmission email sent.",
  },
  {
    time: "8:30 AM",
    dot: "hollow",
    title: "Worker started",
    description: "All sources connected. UIDAI degraded.",
  },
];

function Dot({ type }: { type: DotType }) {
  const base: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: 0,
    flexShrink: 0,
  };

  const styles: Record<DotType, React.CSSProperties> = {
    hollow: {
      ...base,
      border: `1.5px solid ${ws.disabled}`,
      background: "transparent",
    },
    filled: {
      ...base,
      background: ws.body,
    },
    action: {
      ...base,
      border: `2.5px solid ${ws.body}`,
      background: "transparent",
    },
  };

  return <div style={styles[type]} />;
}

export default function ActivityTab() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div style={{ fontFamily: f }}>
      {/* Section label */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          color: ws.muted_text,
          letterSpacing: 0.3,
          marginBottom: 8,
        }}
      >
        Today — Mon 9 Mar 2026
      </div>

      {/* Log entries */}
      <div>
        {logEntries.map((entry, index) => {
          const isLast = index === logEntries.length - 1;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                padding: "12px 0",
                borderBottom: isLast ? "none" : `1px solid ${ws.muted}`,
                background: isHovered ? ws.hoverBg : "transparent",
                transition: "background 0.1s",
                borderRadius: 4,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Time */}
              <div
                style={{
                  width: 64,
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 400,
                  color: ws.muted_text,
                  textAlign: "right",
                  paddingTop: 1,
                }}
              >
                {entry.time}
              </div>

              {/* Dot */}
              <div
                style={{
                  width: 14,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: 3,
                }}
              >
                <Dot type={entry.dot} />
              </div>

              {/* Body */}
              <div style={{ flex: 1, minWidth: 0, paddingLeft: 8 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: ws.body,
                    lineHeight: 1.4,
                  }}
                >
                  {entry.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: ws.muted_text,
                    lineHeight: 1.4,
                    marginTop: 2,
                  }}
                >
                  {entry.description}
                </div>

                {/* Transcript box */}
                {entry.transcript && (
                  <div
                    style={{
                      background: ws.elevated,
                      border: `1px solid ${ws.muted}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: ws.disabled,
                        letterSpacing: 0.3,
                        marginBottom: 4,
                      }}
                    >
                      Reasoning
                    </div>
                    {entry.transcript.map((line, lineIndex) => (
                      <div
                        key={lineIndex}
                        style={{
                          fontSize: 11,
                          fontWeight: 400,
                          color: ws.secondary,
                          lineHeight: 1.5,
                        }}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more link */}
      <div
        style={{
          textAlign: "center",
          padding: "16px 0",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: ws.primary,
            textDecoration: "underline",
            cursor: "pointer",
            fontFamily: f,
            marginTop: 8,
          }}
        >
          Load previous days
        </span>
      </div>
    </div>
  );
}
