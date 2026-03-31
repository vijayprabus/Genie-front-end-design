import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Database,
  Mail,
  MessageSquare,
  Smartphone,
  Box,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Warm Stone palette
// ---------------------------------------------------------------------------
const ws = {
  page: "#FAF8F5", surface: "#FFFDF9", border: "#E7E0D8", divider: "#F0EBE4",
  heading: "#292524", body: "#44403C", secondary: "#78716C", muted: "#A8A29E",
  disabled: "#D6D3D1", successBg: "#ECFDF5", successFg: "#065F46",
  warningBg: "#FFFBEB", warningFg: "#B36800", amber: "#F0B429",
  hoverBg: "#EDE8E3", chipBg: "#FAFAFA", chipBorder: "#E8E8E8",
  catBg: "#F0EBE4", catText: "#78716C", newBg: "#FFF3E0", newText: "#E65100",
  statBg: "#F8F8F8", statBorder: "#EEE",
};

const f = "Inter, sans-serif";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type RoleStatus = "Active" | "In Setup" | "Not Deployed";

interface Integration {
  label: string;
  icon: "mail" | "message-square" | "database" | "smartphone" | "box";
  color: string;
  pending?: boolean;
}

interface RoleCard {
  id: string;
  monogram: string;
  name: string;
  domain: string;
  status: RoleStatus;
  isNew?: boolean;
  integrations: Integration[];
  integrationsLabel: "Needs" | "Uses";
  description: string;
  statValue: string;
  statLabel: string;
  statContext: string;
  footerNote: string;
  ctaLabel: string;
  ctaVariant: "primary" | "ghost" | "setup";
  navigateTo?: string;
}

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------
const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  mail: Mail, "message-square": MessageSquare, database: Database,
  smartphone: Smartphone, box: Box,
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const allRoles: RoleCard[] = [
  {
    id: "distributor-negotiation", monogram: "DN", name: "Distributor Negotiation Worker",
    domain: "Distribution", status: "Not Deployed", isNew: true,
    integrations: [
      { label: "Gmail", icon: "mail", color: "#D93025" },
      { label: "Slack", icon: "message-square", color: "#4A154B" },
      { label: "Javis DB", icon: "database", color: "#78716C" },
    ],
    integrationsLabel: "Needs",
    description: "Handles scheme negotiation with distributors end-to-end — drafts proposals, tracks responses, escalates stalled threads. <strong>Replaces 3\u20134 hrs/day of back-and-forth per region.</strong>",
    statValue: "68%", statLabel: "faster resolution across pilot orgs",
    statContext: "Benchmark \u00B7 3 pilot orgs \u00B7 Q1 2026",
    footerNote: "Not yet deployed", ctaLabel: "Deploy this role \u2192", ctaVariant: "primary",
  },
  {
    id: "business-analytics", monogram: "AN", name: "Business Analytics Worker",
    domain: "Analytics", status: "Not Deployed", isNew: true,
    integrations: [
      { label: "Javis DB", icon: "database", color: "#78716C" },
      { label: "SAP", icon: "box", color: "#0070F2", pending: true },
    ],
    integrationsLabel: "Needs",
    description: "Answers business questions in plain language \u2014 revenue by region, top SKUs, overdue aging. <strong>No SQL, no dashboards.</strong> Ask and get a table or chart back in seconds.",
    statValue: "~40s", statLabel: "avg. answer time for complex queries",
    statContext: "Genie internal benchmark \u00B7 Javis data layer",
    footerNote: "Not yet deployed", ctaLabel: "Deploy this role \u2192", ctaVariant: "primary",
  },
  {
    id: "inventory-forecasting", monogram: "IF", name: "Inventory Forecasting Worker",
    domain: "Supply Chain", status: "Not Deployed", isNew: true,
    integrations: [
      { label: "Javis DB", icon: "database", color: "#78716C" },
      { label: "SAP", icon: "box", color: "#0070F2" },
    ],
    integrationsLabel: "Needs",
    description: "Predicts stock requirements across distribution network. <strong>Reduces stockouts by 34%</strong> while cutting safety stock levels. Weekly forecasts auto-posted to ERP.",
    statValue: "34%", statLabel: "reduction in stockouts across pilot orgs",
    statContext: "Benchmark \u00B7 2 pilot orgs \u00B7 Q4 2025",
    footerNote: "Not yet deployed", ctaLabel: "Deploy this role \u2192", ctaVariant: "primary",
  },
  {
    id: "customer-feedback", monogram: "CF", name: "Customer Feedback Analyzer",
    domain: "Analytics", status: "Not Deployed", isNew: true,
    integrations: [
      { label: "Javis DB", icon: "database", color: "#78716C" },
      { label: "Gmail", icon: "mail", color: "#D93025" },
      { label: "WhatsApp", icon: "smartphone", color: "#25D366" },
    ],
    integrationsLabel: "Needs",
    description: "Processes distributor feedback from email, WhatsApp & surveys. <strong>Sentiment analysis + auto-categorization.</strong> Weekly digest with actionable insights for regional teams.",
    statValue: "~2min", statLabel: "avg. processing time per feedback item",
    statContext: "Genie internal benchmark",
    footerNote: "Not yet deployed", ctaLabel: "Deploy this role \u2192", ctaVariant: "primary",
  },
  {
    id: "kyc-verification", monogram: "KY", name: "KYC Verification Worker",
    domain: "Onboarding", status: "Active",
    integrations: [
      { label: "Javis DB", icon: "database", color: "#78716C" },
      { label: "Gmail", icon: "mail", color: "#D93025" },
    ],
    integrationsLabel: "Uses",
    description: "Validates PAN, GST, Aadhaar, Bank & CIN for distributor onboarding. <strong>3 days \u2192 4 hours.</strong> Flags only discrepancies for manual review.",
    statValue: "97.2%", statLabel: "auto-approved, across Genie orgs",
    statContext: "2.1M+ documents verified to date",
    footerNote: "Running at Marico", ctaLabel: "View in Workers \u2192", ctaVariant: "ghost",
    navigateTo: "/roles/kyc",
  },
  {
    id: "document-processing", monogram: "DP", name: "Document Processing Worker",
    domain: "Onboarding", status: "In Setup",
    integrations: [
      { label: "Javis DB", icon: "database", color: "#78716C" },
      { label: "SAP", icon: "box", color: "#0070F2", pending: true },
    ],
    integrationsLabel: "Uses",
    description: "Extracts structured data from invoices, POs & delivery challans automatically. <strong>2 sec per document</strong> vs 5\u201315 min manual. Escalates unrecognised formats.",
    statValue: "99.1%", statLabel: "accuracy, across Genie orgs",
    statContext: "4.8M+ documents processed to date",
    footerNote: "SAP connection pending", ctaLabel: "Complete setup \u2192", ctaVariant: "setup",
  },
  {
    id: "collections-specialist", monogram: "CO", name: "Collections Specialist",
    domain: "Collections", status: "Active",
    integrations: [
      { label: "Javis DB", icon: "database", color: "#78716C" },
      { label: "SAP", icon: "box", color: "#0070F2" },
      { label: "Gmail", icon: "mail", color: "#D93025" },
    ],
    integrationsLabel: "Uses",
    description: "Works your entire overdue book continuously. <strong>50+ accounts/day</strong> \u2014 follow-ups, reminders, escalation paths. Only disputes reach your team.",
    statValue: "94.3%", statLabel: "auto-resolved, across Genie orgs",
    statContext: "1.2M+ tasks processed to date",
    footerNote: "Running at Marico", ctaLabel: "View in Workers \u2192", ctaVariant: "ghost",
  },
  {
    id: "credit-note-specialist", monogram: "CN", name: "Credit Note Specialist",
    domain: "Collections", status: "Active",
    integrations: [
      { label: "Javis DB", icon: "database", color: "#78716C" },
      { label: "SAP", icon: "box", color: "#0070F2" },
    ],
    integrationsLabel: "Uses",
    description: "Processes your entire credit note backlog overnight. <strong>800+ notes per billing cycle</strong>, auto-posted to ERP. A 2\u20133 day manual task cleared before morning.",
    statValue: "98.1%", statLabel: "auto-posted, across Genie orgs",
    statContext: "840K+ notes processed to date",
    footerNote: "Running at Marico", ctaLabel: "View in Workers \u2192", ctaVariant: "ghost",
  },
  {
    id: "order-intake", monogram: "OR", name: "Order Intake Worker",
    domain: "Order Mgmt", status: "Active",
    integrations: [
      { label: "Javis DB", icon: "database", color: "#78716C" },
      { label: "SAP", icon: "box", color: "#0070F2" },
      { label: "WhatsApp", icon: "smartphone", color: "#25D366" },
    ],
    integrationsLabel: "Uses",
    description: "Captures orders from email, WhatsApp & upload. <strong>300+ orders/day</strong>, validated and entered into ERP without human touch.",
    statValue: "99.2%", statLabel: "auto-validated, across Genie orgs",
    statContext: "3.4M+ orders processed to date",
    footerNote: "Running at Marico", ctaLabel: "View in Workers \u2192", ctaVariant: "ghost",
  },
  {
    id: "cash-recon", monogram: "RC", name: "Cash Recon Specialist",
    domain: "Order Mgmt", status: "Active",
    integrations: [
      { label: "Javis DB", icon: "database", color: "#78716C" },
      { label: "SAP", icon: "box", color: "#0070F2" },
    ],
    integrationsLabel: "Uses",
    description: "Matches payments to invoices and posts to ERP. <strong>500+ entries/day</strong> \u2014 a full-day task done automatically each night.",
    statValue: "96.8%", statLabel: "auto-matched, across Genie orgs",
    statContext: "620K+ entries reconciled to date",
    footerNote: "Running at Marico", ctaLabel: "View in Workers \u2192", ctaVariant: "ghost",
  },
];

const domainFilterOptions = [
  "All functions", "Onboarding & Compliance", "Collections & Recovery",
  "Order Management", "Distribution", "Analytics", "Supply Chain",
];

const domainFilterMap: Record<string, string[]> = {
  "Onboarding & Compliance": ["Onboarding"],
  "Collections & Recovery": ["Collections"],
  "Order Management": ["Order Mgmt"],
  Distribution: ["Distribution"],
  Analytics: ["Analytics"],
  "Supply Chain": ["Supply Chain"],
};

// ---------------------------------------------------------------------------
// Helper components
// ---------------------------------------------------------------------------
function IntegrationChip({ label, icon, color, pending }: Integration) {
  const Icon = iconMap[icon];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      padding: "2px 6px", borderRadius: 4, fontSize: 9, fontFamily: f,
      color: pending ? "#B36800" : "#666",
      backgroundColor: pending ? "#FFFDF0" : ws.chipBg,
      border: pending ? `1px dashed ${ws.amber}` : `1px solid ${ws.chipBorder}`,
      whiteSpace: "nowrap",
    }}>
      {Icon && <Icon size={10} style={{ color }} />}
      {label}
    </span>
  );
}

function StatusRibbon({ status }: { status: RoleStatus }) {
  if (status === "Not Deployed") return null;
  const isActive = status === "Active";
  return (
    <div style={{
      position: "absolute", top: 0, right: 0, padding: "3px 10px",
      fontSize: 9, fontWeight: 600, fontFamily: f,
      borderBottomLeftRadius: 8,
      backgroundColor: isActive ? ws.successBg : ws.warningBg,
      color: isActive ? ws.successFg : ws.warningFg,
      borderLeft: `1px solid ${isActive ? "#C8E6C9" : "#FFE082"}`,
      borderBottom: `1px solid ${isActive ? "#C8E6C9" : "#FFE082"}`,
    }}>
      {isActive ? "\u2713 Active" : "\u25CF In Setup"}
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count?: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: ws.secondary, whiteSpace: "nowrap",
          fontFamily: f,
        }}>{title}</span>
        <div style={{ flex: 1, height: 1, backgroundColor: ws.border }} />
      </div>
      {count && (
        <span style={{ fontSize: 10, color: ws.disabled, fontFamily: f, marginLeft: 12, whiteSpace: "nowrap" }}>
          {count}
        </span>
      )}
    </div>
  );
}

function RoleCardComponent({ role, onCta }: { role: RoleCard; onCta: () => void }) {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();
  return (
    <div
      style={{
        backgroundColor: hover ? ws.hoverBg : ws.surface, border: `1px solid ${ws.border}`,
        borderRadius: 14, position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", fontFamily: f,
        cursor: "pointer", transition: "background-color 0.15s ease",
      }}
      onClick={() => navigate(`/roles/${role.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <StatusRibbon status={role.status} />

      {/* Top section */}
      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 10 }}>
        {/* Monogram */}
        <div style={{
          width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${ws.border}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: ws.secondary }}>{role.monogram}</span>
        </div>

        {/* Name + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: ws.heading }}>{role.name}</span>
            <span style={{
              fontSize: 9, fontWeight: 500, padding: "2px 7px", borderRadius: 4,
              backgroundColor: ws.catBg, color: ws.catText,
            }}>{role.domain}</span>
            {role.isNew && (
              <span style={{
                fontSize: 9, fontWeight: 500, padding: "2px 7px", borderRadius: 4,
                backgroundColor: ws.newBg, color: ws.newText,
              }}>{"\u2726"} New</span>
            )}
          </div>
        </div>

        {/* Integration chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 8, color: ws.muted, marginRight: 2, fontWeight: 600 }}>{role.integrationsLabel}</span>
          {role.integrations.map((integ) => (
            <IntegrationChip key={integ.label} {...integ} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "0 16px 10px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{ fontSize: 12, color: ws.body, lineHeight: 1.55, marginBottom: 10 }}
          dangerouslySetInnerHTML={{ __html: role.description }}
        />

        {/* Stat block */}
        <div style={{
          backgroundColor: ws.statBg, border: `1px solid ${ws.statBorder}`,
          borderRadius: 6, padding: "8px 10px", display: "flex", alignItems: "center", gap: 10,
          marginTop: "auto",
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: ws.heading, flexShrink: 0 }}>
            {role.statValue}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontSize: 10, color: ws.secondary }}>{role.statLabel}</span>
            <span style={{ fontSize: 9, color: ws.muted, fontStyle: "italic" }}>{role.statContext}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "6px 16px 12px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            ...(role.status === "Active"
              ? { backgroundColor: ws.heading }
              : role.status === "In Setup"
              ? { border: `1.5px solid ${ws.amber}` }
              : { border: `1.5px dashed ${ws.disabled}` }),
          }} />
          <span style={{ fontSize: 10, color: ws.muted, fontFamily: f }}>{role.footerNote}</span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onCta(); }}
          style={{
            fontFamily: f, cursor: "pointer", border: "none",
            ...(role.ctaVariant === "primary" ? {
              backgroundColor: ws.heading, color: "#FFF", fontSize: 11,
              fontWeight: 600, padding: "6px 14px", borderRadius: 6,
            } : role.ctaVariant === "setup" ? {
              backgroundColor: "transparent", color: ws.warningFg, fontSize: 11,
              fontWeight: 600, padding: "6px 14px", borderRadius: 6,
              border: `1px solid ${ws.amber}`,
            } : {
              backgroundColor: "transparent", color: ws.muted, fontSize: 10,
              fontWeight: 500, padding: "5px 10px", borderRadius: 6,
              border: `1px solid ${ws.border}`,
            }),
          }}
        >
          {role.ctaLabel}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function RolesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [functionFilter, setFunctionFilter] = useState("All functions");
  const [sort, setSort] = useState("newest");

  const filtered = allRoles.filter((r) => {
    const q = search.toLowerCase();
    if (q && !r.name.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
    if (functionFilter !== "All functions") {
      const allowed = domainFilterMap[functionFilter];
      if (allowed && !allowed.includes(r.domain)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "newest") {
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return 0;
    }
    if (sort === "az") return a.name.localeCompare(b.name);
    return 0;
  });

  const newRoles = sorted.filter((r) => r.isNew);
  const onboarding = sorted.filter((r) => r.domain === "Onboarding");
  const collections = sorted.filter((r) => r.domain === "Collections");
  const orderMgmt = sorted.filter((r) => r.domain === "Order Mgmt");

  const activeCount = allRoles.filter((r) => r.status === "Active").length;

  const handleCta = (role: RoleCard) => {
    if (role.navigateTo) navigate(role.navigateTo);
  };

  const grid = { display: "grid" as const, gridTemplateColumns: "1fr 1fr", gap: 12 };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: f }}>
      <div style={{ flex: 1, overflowY: "auto", padding: 28, backgroundColor: ws.page }}>

        {/* Page header */}
        <div style={{ marginBottom: 6 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: ws.heading, margin: 0 }}>
            Roles
          </h1>
          <p style={{ fontSize: 13, color: ws.secondary, margin: "4px 0 0" }}>
            Genie's managed AI workforce. Pre-built, maintained by Genie, and ready to deploy at your organisation.
          </p>
        </div>

        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 24, flexWrap: "wrap",
        }}>
          <div style={{ position: "relative", width: 300 }}>
            <Search size={14} style={{
              position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              color: ws.muted, pointerEvents: "none",
            }} />
            <input
              type="text" placeholder="Search roles..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", height: 36, fontSize: 12, padding: "0 12px 0 32px",
                border: `1px solid ${ws.border}`, borderRadius: 8, outline: "none",
                fontFamily: f, color: ws.body, backgroundColor: ws.surface, boxSizing: "border-box",
              }}
            />
          </div>

          <select
            value={functionFilter}
            onChange={(e) => setFunctionFilter(e.target.value)}
            style={{
              height: 36, fontSize: 12, padding: "0 10px", fontFamily: f,
              border: `1px solid ${ws.border}`, borderRadius: 8, backgroundColor: ws.surface,
              color: ws.body, outline: "none",
            }}
          >
            {domainFilterOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              height: 36, fontSize: 12, padding: "0 10px", fontFamily: f,
              border: `1px solid ${ws.border}`, borderRadius: 8, backgroundColor: ws.surface,
              color: ws.body, outline: "none",
            }}
          >
            <option value="newest">Newest first</option>
            <option value="automation">Automation rate</option>
            <option value="tasks">Tasks processed</option>
            <option value="az">A\u2013Z</option>
          </select>

          <span style={{ marginLeft: "auto", fontSize: 11, color: ws.muted, whiteSpace: "nowrap" }}>
            {allRoles.length} roles · {activeCount} active in your org
          </span>
        </div>

        {/* New This Month */}
        {newRoles.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: ws.muted, whiteSpace: "nowrap",
              }}>New This Month</span>
              <div style={{ flex: 1, height: 1, backgroundColor: ws.border }} />
            </div>
            <div style={grid}>
              {newRoles.map((r) => (
                <RoleCardComponent key={r.id} role={r} onCta={() => handleCta(r)} />
              ))}
            </div>
          </div>
        )}

        {/* Onboarding & Compliance */}
        {onboarding.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Onboarding & Compliance" count={`${onboarding.length} roles`} />
            <div style={grid}>
              {onboarding.map((r) => (
                <RoleCardComponent key={r.id} role={r} onCta={() => handleCta(r)} />
              ))}
            </div>
          </div>
        )}

        {/* Collections & Recovery */}
        {collections.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Collections & Recovery" count={`${collections.length} roles`} />
            <div style={grid}>
              {collections.map((r) => (
                <RoleCardComponent key={r.id} role={r} onCta={() => handleCta(r)} />
              ))}
            </div>
          </div>
        )}

        {/* Order Management */}
        {orderMgmt.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Order Management" count={`${orderMgmt.length} roles`} />
            <div style={grid}>
              {orderMgmt.map((r) => (
                <RoleCardComponent key={r.id} role={r} onCta={() => handleCta(r)} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {sorted.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: ws.muted, fontSize: 13 }}>
            No roles match your search.
          </div>
        )}

        {/* Bottom utility strip */}
        <div style={{
          borderTop: `2px solid ${ws.border}`, backgroundColor: ws.surface,
          padding: "20px 28px", borderRadius: 10, marginTop: 8,
          display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 28,
        }}>
          <div>
            <div style={{
              fontSize: 9, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", color: ws.muted, marginBottom: 6,
            }}>About benchmarks</div>
            <p style={{ fontSize: 11, color: ws.secondary, lineHeight: 1.6, margin: 0 }}>
              Stats shown are from Genie-verified pilots and internal benchmarks.
              Actual results depend on data quality, integration setup, and org-specific workflows.{" "}
              <a href="/benchmarks" style={{ fontSize: 11, color: ws.secondary, textDecoration: "underline" }}>
                View methodology
              </a>
            </p>
          </div>
          <div style={{ backgroundColor: ws.border }} />
          <div>
            <div style={{
              fontSize: 9, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", color: ws.muted, marginBottom: 6,
            }}>New roles</div>
            <p style={{ fontSize: 11, color: ws.secondary, lineHeight: 1.6, margin: 0 }}>
              Genie ships new roles every month based on customer requests and workflow gaps.{" "}
              <a href="/notifications" style={{ fontSize: 11, color: ws.secondary, textDecoration: "underline" }}>
                Get notified when new roles launch
              </a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
