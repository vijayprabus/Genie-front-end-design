import { useParams, NavLink } from "react-router-dom";
import { Database, Mail, MessageSquare } from "lucide-react";


// ---------------------------------------------------------------------------
// Warm Stone palette
// ---------------------------------------------------------------------------

const ws = {
  page: "#FAF8F5", surface: "#FFFDF9", sidebar: "#F5F0EB", muted: "#F0EBE4",
  elevated: "#F5F0EB", border: "#E7E0D8", divider: "#F0EBE4", inputBorder: "#D6D3D1",
  heading: "#292524", body: "#44403C", secondary: "#78716C", muted_text: "#A8A29E",
  disabled: "#D6D3D1", primary: "#7C3AED", primaryHover: "#6D28D9", primaryLight: "#EDE9FE",
  primaryDark: "#5B21B6", success: "#10B981", successFg: "#065F46", successBg: "#ECFDF5",
  warning: "#F59E0B", warningFg: "#92400E", warningBg: "#FFFBEB", error: "#E11D48",
  errorFg: "#9F1239", errorBg: "#FFF1F2", hoverBg: "#EDE8E3",
};

const f = "Inter, sans-serif";

/* ── Tiny helpers ───────────────────────────────────────────────── */

function SectionHeader({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        fontFamily: f,
        color: ws.secondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function StepItem({
  num,
  title,
  desc,
  last,
}: {
  num: number;
  title: string;
  desc: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "14px 0",
        borderBottom: last ? "none" : `1px solid ${ws.divider}`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          backgroundColor: ws.primaryLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 600,
          fontFamily: f,
          color: "#4338CA",
          flexShrink: 0,
        }}
      >
        {num}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: f, color: ws.heading }}>
          {title}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 400,
            fontFamily: f,
            color: ws.secondary,
            lineHeight: 1.5,
          }}
        >
          {desc}
        </span>
      </div>
    </div>
  );
}

function PolicyRow({
  title,
  desc,
  value,
  subtitle,
  last,
}: {
  title: string;
  desc: string;
  value: string;
  subtitle?: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: last ? "none" : `1px solid ${ws.divider}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 13, fontWeight: 500, fontFamily: f, color: ws.body }}>
          {title}
        </span>
        <span style={{ fontSize: 11, fontWeight: 400, fontFamily: f, color: ws.muted_text }}>
          {desc}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: f, color: ws.heading }}>
          {value}
        </span>
        {subtitle && (
          <span style={{ fontSize: 11, fontWeight: 400, fontFamily: f, color: ws.muted_text }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

function RequirementRow({
  icon: Icon,
  name,
  desc,
  status,
  last,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  name: string;
  desc: string;
  status: "Connected" | "Optional";
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 0",
        borderBottom: last ? "none" : `1px solid ${ws.divider}`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: ws.muted,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={14} color={ws.body} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: f, color: ws.body }}>
          {name}
        </span>
        <span style={{ fontSize: 11, fontWeight: 400, fontFamily: f, color: ws.muted_text }}>
          {desc}
        </span>
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 400,
          fontFamily: f,
          color: status === "Connected" ? ws.success : ws.muted_text,
          flexShrink: 0,
        }}
      >
        {status}
      </span>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────── */

export default function RoleDetailPage() {
  const { roleId } = useParams();
  void roleId; // reserved for future dynamic lookup

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: f }}>
        {/* ── Content ────────────────────────────────────── */}
        <div style={{ flex: 1, overflow: "auto", padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* ── Hero Card ────────────────────────────────── */}
          <div
            style={{
              backgroundColor: ws.surface,
              border: `1px solid ${ws.border}`,
              borderRadius: 12,
              padding: 24,
            }}
          >
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Monogram */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: ws.primaryLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: f,
                    color: "#4338CA",
                    flexShrink: 0,
                  }}
                >
                  KY
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 20, fontWeight: 700, fontFamily: f, color: ws.heading }}>
                    KYC Verification Worker
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 400, fontFamily: f, color: ws.muted_text }}>
                    Onboarding &amp; Compliance
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Status pill */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 10,
                    fontWeight: 500,
                    fontFamily: f,
                    color: ws.success,
                    backgroundColor: ws.successBg,
                    padding: "2px 8px",
                    borderRadius: 999,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: ws.success,
                    }}
                  />
                  Deployed
                </span>
                <span style={{ fontSize: 11, fontWeight: 400, fontFamily: f, color: ws.muted_text }}>
                  14 Jan 2026 &middot; Priya Anand
                </span>
              </div>
            </div>

            {/* Description */}
            <p
              style={{
                marginTop: 12,
                marginBottom: 0,
                fontSize: 13,
                fontWeight: 400,
                fontFamily: f,
                color: ws.secondary,
                lineHeight: 1.6,
                maxWidth: 680,
              }}
            >
              Handles end-to-end distributor document verification including PAN, GST Certificate,
              Bank proof, Aadhaar, and CIN. Extracts fields via Vision AI, validates against
              government sources, scores confidence on a numeric threshold for auto-approval.
              Approved records push directly to the ERP with a full audit trail.
            </p>

            {/* Metrics strip */}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                borderTop: `1px solid ${ws.divider}`,
                paddingTop: 16,
              }}
            >
              {(
                [
                  ["HANDLES", "5 document types"],
                  ["SPEED", "~4s per document"],
                  ["MODE", "Continuous, on receipt"],
                  ["ESCALATION", "Email + Slack"],
                  ["OUTPUT", "ERP posting + audit trail"],
                ] as const
              ).map(([label, value]) => (
                <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 500,
                      fontFamily: f,
                      color: ws.muted_text,
                      textTransform: "uppercase",
                      letterSpacing: 0.3,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      fontFamily: f,
                      color: ws.body,
                      marginTop: 3,
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Two-column layout ────────────────────────── */}
          <div style={{ display: "flex", gap: 28, marginTop: 20 }}>
            {/* Left column */}
            <div style={{ flex: 1 }}>
              <SectionHeader>HOW THIS WORKER OPERATES</SectionHeader>

              <StepItem
                num={1}
                title="Receives application"
                desc="Triggered when a distributor submits documents via Javis onboarding portal, or when documents arrive via email."
              />
              <StepItem
                num={2}
                title="Extracts fields"
                desc="Vision AI reads each document and extracts structured fields — names, numbers, addresses, dates. Takes ~4 seconds per document."
              />
              <StepItem
                num={3}
                title="Validates against sources"
                desc="Each document is verified against its government source: PAN via NSDL, GST via GSTN, Bank via NPCI, Aadhaar via UIDAI, CIN via MCA21. Cross-references fields across documents for consistency."
              />
              <StepItem
                num={4}
                title="Scores confidence and routes"
                desc="Each document gets a confidence score. Above your threshold → auto-approved. Below → routed to your assigned reviewer with the specific issue flagged."
              />
              <StepItem
                num={5}
                title="Posts result"
                desc="Approved records are posted to your ERP with a full audit trail. Reviewer is notified for any flagged cases. Rejected applications trigger a resubmission request to the applicant."
                last
              />

              {/* What you control */}
              <div style={{ marginTop: 24 }}>
                <SectionHeader>WHAT YOU CONTROL</SectionHeader>

                <PolicyRow
                  title="Confidence threshold"
                  desc="Documents above this score are approved without human review"
                  value="95%"
                  subtitle="Configurable"
                />
                <PolicyRow
                  title="Escalation routing"
                  desc="Who receives flagged cases, and how they're notified"
                  value="Email + Slack"
                  subtitle="Configurable"
                />
                <PolicyRow
                  title="Document scope"
                  desc="Which document types this worker processes"
                  value="PAN, GST, Bank, Aadhaar, CIN"
                />
                <PolicyRow
                  title="Processing mode"
                  desc="Process on receipt, or hold for scheduled batch"
                  value="On receipt"
                  subtitle="Configurable"
                />
                <PolicyRow
                  title="SLA"
                  desc="Maximum time from receipt to completion"
                  value="24 hours"
                  last
                />
              </div>
            </div>

            {/* Right column */}
            <div style={{ width: 260, flexShrink: 0 }}>
              <div style={{ marginBottom: 20 }}>
                <SectionHeader>REQUIREMENTS</SectionHeader>

                <RequirementRow
                  icon={Database}
                  name="Javis"
                  desc="Distributor data"
                  status="Connected"
                />
                <RequirementRow
                  icon={Mail}
                  name="Gmail"
                  desc="Escalation notifications"
                  status="Connected"
                />
                <RequirementRow
                  icon={MessageSquare}
                  name="Slack"
                  desc="Optional escalation channel"
                  status="Optional"
                  last
                />
              </div>

              {/* Deployed section */}
              <div style={{ marginTop: 8 }}>
                <SectionHeader>THIS WORKER IS DEPLOYED</SectionHeader>

                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    fontFamily: f,
                    color: ws.secondary,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Deployed 14 Jan 2026. Manage configuration, review activity, and monitor records
                  from the worker management page.
                </p>

                <NavLink
                  to="/workers/kyc"
                  style={{
                    display: "block",
                    backgroundColor: ws.primaryLight,
                    color: ws.primary,
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: f,
                    padding: "8px 0",
                    width: "100%",
                    textAlign: "center",
                    borderRadius: 8,
                    border: `1px solid rgba(124, 58, 237, 0.125)`,
                    marginTop: 10,
                    textDecoration: "none",
                    boxSizing: "border-box",
                  }}
                >
                  Manage Worker →
                </NavLink>

                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 400,
                    fontFamily: f,
                    color: ws.muted_text,
                    marginTop: 10,
                    marginBottom: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Typical setup: ~2 hours &middot; Connect integrations, set threshold, assign
                  reviewers, test. No code required.
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
