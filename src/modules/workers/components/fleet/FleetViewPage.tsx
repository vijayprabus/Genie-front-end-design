import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";


const f = "Inter, sans-serif";

// ---------------------------------------------------------------------------
// Warm Stone + Deep Violet palette
// ---------------------------------------------------------------------------
const ws = {
  page: "#FAF8F5",
  surface: "#FFFDF9",
  sidebar: "#F5F0EB",
  muted: "#F0EBE4",
  elevated: "#F5F0EB",
  border: "#E7E0D8",
  divider: "#F0EBE4",
  inputBorder: "#D6D3D1",
  heading: "#292524",
  body: "#44403C",
  secondary: "#78716C",
  muted_text: "#A8A29E",
  disabled: "#D6D3D1",
  primary: "#7C3AED",
  primaryHover: "#6D28D9",
  primaryLight: "#EDE9FE",
  primaryDark: "#5B21B6",
  success: "#10B981",
  successFg: "#065F46",
  successBg: "#ECFDF5",
  warning: "#F59E0B",
  warningFg: "#92400E",
  warningBg: "#FFFBEB",
  error: "#E11D48",
  errorFg: "#9F1239",
  errorBg: "#FFF1F2",
  hoverBg: "#EDE8E3",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkerStatus = "Live" | "Paused" | "Draft";
type ActionVariant = "outline" | "primary";

interface WorkerRow {
  name: string;
  description: string;
  status: WorkerStatus;
  today: string | null;
  todayItalic?: boolean;
  open: string | null;
  openSub?: string;
  success: string | null;
  lastRun: string | null;
  lastRunItalic?: boolean;
  team: string | null;
  action: { label: string; variant: ActionVariant };
  navigateTo?: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const workers: WorkerRow[] = [
  {
    name: "Collections Specialist",
    description: "Overdue follow-up, dispute review",
    status: "Live",
    today: "48",
    open: "2",
    openSub: "HITL",
    success: "96.4%",
    lastRun: "6:14 AM",
    team: "Arjun, Rohit",
    action: { label: "Manage \u2192", variant: "outline" },
  },
  {
    name: "Order Intake Worker",
    description: "Captures, validates, routes orders",
    status: "Live",
    today: "312",
    open: "0",
    success: "100%",
    lastRun: "8:41 AM",
    team: null,
    action: { label: "Manage \u2192", variant: "outline" },
  },
  {
    name: "Credit Note Specialist",
    description: "Credit note creation, ERP posting",
    status: "Live",
    today: "870",
    open: "0",
    success: "99.8%",
    lastRun: "2:00 AM",
    team: null,
    action: { label: "Manage \u2192", variant: "outline" },
  },
  {
    name: "KYC Verification Worker",
    description: "Document collection, validation",
    status: "Live",
    today: "12",
    open: "1",
    openSub: "flag",
    success: "91.7%",
    lastRun: "9:14 AM",
    team: "Priya",
    action: { label: "Manage \u2192", variant: "outline" },
    navigateTo: "/workers/kyc",
  },
  {
    name: "Cash Recon Specialist",
    description: "Invoice matching, ERP posting",
    status: "Paused",
    today: null,
    open: "1",
    openSub: "blocked",
    success: "74%",
    lastRun: "7:30 AM",
    team: "Priya",
    action: { label: "Manage \u2192", variant: "outline" },
  },
  {
    name: "Business Analyst",
    description: "Ad-hoc queries, data pulls",
    status: "Live",
    today: null,
    todayItalic: true,
    open: null,
    success: null,
    lastRun: null,
    lastRunItalic: true,
    team: "All",
    action: { label: "Manage \u2192", variant: "outline" },
  },
  {
    name: "Doc Processing Worker",
    description: "Reads documents, extracts data",
    status: "Draft",
    today: null,
    open: null,
    success: null,
    lastRun: null,
    team: null,
    action: { label: "Set up \u2192", variant: "primary" },
  },
];

const stats: { value: string; label: string }[] = [
  { value: "1,242", label: "TASKS TODAY" },
  { value: "98.2%", label: "SUCCESS (7D)" },
  { value: "\u20B94.2L", label: "VALUE IN REVIEW" },
  { value: "23", label: "TEAM ASSIGNED" },
];

// ---------------------------------------------------------------------------
// Inline helper components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: WorkerStatus }) {
  const cfg = {
    Live: { bg: ws.successBg, color: ws.successFg, dot: ws.success },
    Paused: { bg: ws.warningBg, color: ws.warningFg, dot: ws.warning },
    Draft: { bg: ws.muted, color: ws.secondary, dot: null },
  }[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 7px",
        borderRadius: 9999,
        backgroundColor: cfg.bg,
        fontSize: 10,
        fontWeight: 500,
        color: cfg.color,
        whiteSpace: "nowrap",
        fontFamily: f,
      }}
    >
      {cfg.dot && (
        <span
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            backgroundColor: cfg.dot,
            flexShrink: 0,
          }}
        />
      )}
      {status}
    </span>
  );
}

function ActionButton({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: ActionVariant;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 6,
        border: isPrimary ? "none" : `1px solid ${ws.border}`,
        backgroundColor: isPrimary ? ws.primary : ws.surface,
        color: isPrimary ? "#FFF" : ws.body,
        fontSize: 11,
        fontWeight: 500,
        fontFamily: f,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "background-color 0.1s, border-color 0.1s",
      }}
      onMouseEnter={(e) => {
        if (isPrimary) {
          e.currentTarget.style.backgroundColor = ws.primaryHover;
        } else {
          e.currentTarget.style.backgroundColor = ws.elevated;
          e.currentTarget.style.borderColor = ws.disabled;
        }
      }}
      onMouseLeave={(e) => {
        if (isPrimary) {
          e.currentTarget.style.backgroundColor = ws.primary;
        } else {
          e.currentTarget.style.backgroundColor = ws.surface;
          e.currentTarget.style.borderColor = ws.border;
        }
      }}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function FleetViewPage() {
  const navigate = useNavigate();

  return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Scrollable Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
          {/* Page Header */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: ws.heading,
                margin: 0,
              }}
            >
              AI Workers
            </h1>
            <p
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: ws.secondary,
                margin: 0,
              }}
            >
              All workers — deployed, in setup, or paused. Click any row to
              manage.
            </p>
          </div>

          {/* Stats Bar */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              backgroundColor: ws.surface,
              border: `1px solid ${ws.border}`,
              borderRadius: 10,
            }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  borderRight:
                    i < stats.length - 1 ? `1px solid ${ws.border}` : "none",
                }}
              >
                <span
                  style={{ fontSize: 24, fontWeight: 700, color: ws.heading }}
                >
                  {s.value}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: ws.muted_text,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Section Header */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: ws.muted_text,
                textTransform: "uppercase",
                letterSpacing: 0.3,
              }}
            >
              ALL WORKERS ({workers.length})
            </span>
            <button
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 12px",
                borderRadius: 6,
                border: "none",
                backgroundColor: ws.primary,
                color: "#FFF",
                fontSize: 11,
                fontWeight: 500,
                fontFamily: f,
                cursor: "pointer",
                transition: "background-color 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = ws.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = ws.primary;
              }}
            >
              <Plus size={12} />
              Add Role
            </button>
          </div>

          {/* Workers Table */}
          <div
            style={{
              marginTop: 12,
              backgroundColor: ws.surface,
              border: `1px solid ${ws.border}`,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 16px",
                backgroundColor: ws.elevated,
                borderBottom: `1px solid ${ws.border}`,
              }}
            >
              {[
                { label: "WORKER", width: undefined, flex: 1 },
                { label: "STATE", width: 80 },
                { label: "TODAY", width: 70 },
                { label: "OPEN", width: 80 },
                { label: "SUCCESS", width: 80 },
                { label: "LAST RUN", width: 90 },
                { label: "TEAM", width: 100 },
                { label: "", width: 90 },
              ].map((col, colIdx) => (
                <span
                  key={col.label || `col-${colIdx}`}
                  style={{
                    flex: col.flex ?? "none",
                    width: col.width,
                    fontSize: 10,
                    fontWeight: 500,
                    color: ws.muted_text,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  {col.label}
                </span>
              ))}
            </div>

            {/* Table Rows */}
            {workers.map((w, idx) => (
              <div
                key={w.name}
                onClick={() => {
                  if (w.navigateTo) navigate(w.navigateTo);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 16px",
                  borderBottom:
                    idx < workers.length - 1
                      ? `1px solid ${ws.divider}`
                      : "none",
                  cursor: "pointer",
                  transition: "background-color 0.1s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = ws.hoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {/* WORKER */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: ws.body,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {w.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 400,
                      color: ws.disabled,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {w.description}
                  </span>
                </div>

                {/* STATE */}
                <div style={{ width: 80 }}>
                  <StatusBadge status={w.status} />
                </div>

                {/* TODAY */}
                <div style={{ width: 70 }}>
                  {w.today ? (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: ws.heading,
                      }}
                    >
                      {w.today}
                    </span>
                  ) : w.todayItalic ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontStyle: "italic",
                        color: ws.muted_text,
                      }}
                    >
                      On demand
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: ws.disabled }}>
                      &mdash;
                    </span>
                  )}
                </div>

                {/* OPEN */}
                <div
                  style={{
                    width: 80,
                    display: "flex",
                    alignItems: "baseline",
                    gap: 3,
                  }}
                >
                  {w.open ? (
                    <>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color:
                            w.open === "0" ? ws.disabled : ws.heading,
                        }}
                      >
                        {w.open}
                      </span>
                      {w.openSub && (
                        <span
                          style={{
                            fontSize: 10,
                            color: ws.disabled,
                          }}
                        >
                          {w.openSub}
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: 11, color: ws.disabled }}>
                      &mdash;
                    </span>
                  )}
                </div>

                {/* SUCCESS */}
                <div style={{ width: 80 }}>
                  {w.success ? (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 400,
                        color: ws.secondary,
                      }}
                    >
                      {w.success}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: ws.disabled }}>
                      &mdash;
                    </span>
                  )}
                </div>

                {/* LAST RUN */}
                <div style={{ width: 90 }}>
                  {w.lastRun ? (
                    <span style={{ fontSize: 12, fontWeight: 400, color: ws.muted_text }}>
                      {w.lastRun}
                    </span>
                  ) : w.lastRunItalic ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontStyle: "italic",
                        color: ws.muted_text,
                      }}
                    >
                      On demand
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: ws.disabled }}>
                      &mdash;
                    </span>
                  )}
                </div>

                {/* TEAM */}
                <div style={{ width: 100 }}>
                  {w.team ? (
                    <span style={{ fontSize: 12, fontWeight: 400, color: ws.muted_text }}>
                      {w.team}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: ws.disabled }}>
                      &mdash;
                    </span>
                  )}
                </div>

                {/* ACTION */}
                <div style={{ width: 90 }}>
                  <ActionButton
                    label={w.action.label}
                    variant={w.action.variant}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (w.navigateTo) navigate(w.navigateTo);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
