import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

type Status = "Review" | "ERP Posting" | "Complete" | "Failed";
type Filter = "All" | "Complete" | "Active" | "Failed";

interface DocViz {
  done: number;
  active: number;
  pending: number;
  note?: string;
}

interface Record {
  name: string;
  subtitle: string;
  status: Status;
  docs: DocViz;
  customerCode: string | null;
  submitted: string;
  completed: string | null;
  source: string;
}

const records: Record[] = [
  {
    name: "Reliance Retail Ltd",
    subtitle: "#R-2291 · Maharashtra West",
    status: "Review",
    docs: { done: 3, active: 1, pending: 1, note: "3/5 · GST flagged" },
    customerCode: null,
    submitted: "8 Mar",
    completed: null,
    source: "API",
  },
  {
    name: "PepsiCo Dist. #P-3302",
    subtitle: "Uttar Pradesh",
    status: "Review",
    docs: { done: 2, active: 1, pending: 2, note: "2/5 · Bank flagged" },
    customerCode: null,
    submitted: "8 Mar",
    completed: null,
    source: "API",
  },
  {
    name: "ITC Ltd #I-4401",
    subtitle: "Tamil Nadu",
    status: "ERP Posting",
    docs: { done: 5, active: 0, pending: 0, note: "5/5" },
    customerCode: null,
    submitted: "8 Mar",
    completed: null,
    source: "API",
  },
  {
    name: "Marico Dist. #M-0044",
    subtitle: "Gujarat",
    status: "Complete",
    docs: { done: 5, active: 0, pending: 0, note: "5/5" },
    customerCode: "GJ-04412",
    submitted: "7 Mar",
    completed: "7 Mar",
    source: "API",
  },
  {
    name: "Godrej Dist. #G-1102",
    subtitle: "Maharashtra",
    status: "Complete",
    docs: { done: 5, active: 0, pending: 0, note: "5/5" },
    customerCode: "MH-08841",
    submitted: "6 Mar",
    completed: "7 Mar",
    source: "Email",
  },
  {
    name: "DMart #D-1192",
    subtitle: "Gujarat",
    status: "Failed",
    docs: { done: 4, active: 0, pending: 0, note: "4/5 · CIN rejected" },
    customerCode: null,
    submitted: "8 Mar",
    completed: "8 Mar",
    source: "API",
  },
  {
    name: "Colgate Dist. #C-0091",
    subtitle: "Tamil Nadu",
    status: "Complete",
    docs: { done: 5, active: 0, pending: 0, note: "5/5" },
    customerCode: "TN-03319",
    submitted: "5 Mar",
    completed: "5 Mar",
    source: "API",
  },
  {
    name: "Britannia #B-0441",
    subtitle: "Kerala",
    status: "Complete",
    docs: { done: 5, active: 0, pending: 0, note: "5/5" },
    customerCode: "KL-01182",
    submitted: "3 Mar",
    completed: "3 Mar",
    source: "API",
  },
];

const filterCounts: { label: Filter; count: number }[] = [
  { label: "All", count: 340 },
  { label: "Complete", count: 298 },
  { label: "Active", count: 25 },
  { label: "Failed", count: 17 },
];

function matchesFilter(status: Status, filter: Filter): boolean {
  if (filter === "All") return true;
  if (filter === "Complete") return status === "Complete";
  if (filter === "Active") return status === "Review" || status === "ERP Posting";
  if (filter === "Failed") return status === "Failed";
  return true;
}

function StatusPill({ status }: { status: Status }) {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 9999,
    fontSize: 10,
    fontWeight: 500,
    fontFamily: f,
    whiteSpace: "nowrap",
  };

  if (status === "Review") {
    return (
      <span style={{ ...base, border: `1px solid ${ws.border}`, background: "transparent", color: ws.body }}>
        &#9656; Review
      </span>
    );
  }
  if (status === "ERP Posting") {
    return (
      <span style={{ ...base, background: ws.muted, color: ws.secondary }}>
        ERP Posting
      </span>
    );
  }
  if (status === "Complete") {
    return (
      <span style={{ ...base, background: ws.successBg, color: ws.successFg }}>
        &#10003; Complete
      </span>
    );
  }
  return (
    <span style={{ ...base, background: ws.errorBg, color: ws.errorFg }}>
      &#10007; Failed
    </span>
  );
}

function DocDots({ docs }: { docs: DocViz }) {
  const squares: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    let style: React.CSSProperties = {
      width: 7,
      height: 7,
      borderRadius: 1,
      display: "inline-block",
    };
    if (i < docs.done) {
      style.background = ws.body;
    } else if (i < docs.done + docs.active) {
      style.border = `1.5px solid ${ws.body}`;
      style.boxSizing = "border-box";
    } else {
      style.border = `1px solid ${ws.disabled}`;
      style.boxSizing = "border-box";
    }
    squares.push(<span key={i} style={style} />);
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", gap: 2 }}>{squares}</div>
      {docs.note && (
        <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, marginLeft: 4 }}>
          {docs.note}
        </span>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={ws.muted_text}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function RecordsTab() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const totalRecords = 340;
  const perPage = 8;
  const totalPages = Math.ceil(totalRecords / perPage);

  const filtered = records.filter((r) => {
    if (!matchesFilter(r.status, activeFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        (r.customerCode && r.customerCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const rangeStart = (currentPage - 1) * perPage + 1;
  const rangeEnd = Math.min(currentPage * perPage, totalRecords);

  const pageNumbers: (number | string)[] = [1, 2, 3, "...", totalPages];

  return (
    <div style={{ fontFamily: f }}>
      {/* Table */}
      <div
        style={{
          border: `1px solid ${ws.border}`,
          borderRadius: 12,
          background: ws.surface,
          overflow: "hidden",
        }}
      >
        {/* Filter toolbar (inside table card) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#F5F0EB",
            padding: "12px 16px",
            borderBottom: `1px solid ${ws.border}`,
          }}
        >
          {/* Left: filter chips */}
          <div style={{ display: "flex", gap: 4 }}>
            {filterCounts.map((fc) => {
              const isActive = activeFilter === fc.label;
              return (
                <button
                  key={fc.label}
                  onClick={() => { setActiveFilter(fc.label); setCurrentPage(1); }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 9999,
                    fontSize: 11,
                    fontFamily: f,
                    cursor: "pointer",
                    backgroundColor: isActive ? "#EDE8E3" : "#FAF8F5",
                    color: isActive ? "#292524" : "#78716C",
                    fontWeight: isActive ? 600 : 500,
                    border: isActive ? "1px solid #D6D3D1" : "1px solid #E7E0D8",
                  }}
                >
                  {fc.label} ({fc.count})
                </button>
              );
            })}
          </div>

          {/* Right: search */}
          <div style={{ position: "relative" }}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search applicant, code..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{
                width: 180,
                fontSize: 12,
                fontFamily: f,
                padding: "7px 12px 7px 34px",
                border: `1px solid ${ws.border}`,
                borderRadius: 8,
                background: ws.surface,
                outline: "none",
                color: ws.body,
              }}
            />
            <style>{`input::placeholder { color: ${ws.disabled} !important; }`}</style>
          </div>
        </div>

        {/* Column Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 16px",
            background: ws.elevated,
            borderBottom: `1px solid ${ws.border}`,
          }}
        >
          {[
            { label: "APPLICANT", style: { flex: 1 } as React.CSSProperties },
            { label: "STATUS", style: { width: 80 } as React.CSSProperties },
            { label: "DOCUMENTS", style: { width: 130 } as React.CSSProperties },
            { label: "CUSTOMER CODE", style: { width: 100 } as React.CSSProperties },
            { label: "SUBMITTED", style: { width: 60 } as React.CSSProperties },
            { label: "COMPLETED", style: { width: 60 } as React.CSSProperties },
            { label: "SOURCE", style: { width: 45 } as React.CSSProperties },
          ].map((col) => (
            <div
              key={col.label}
              style={{
                ...col.style,
                fontSize: 10,
                fontWeight: 500,
                textTransform: "uppercase",
                color: ws.muted_text,
                fontFamily: f,
              }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filtered.map((rec, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 16px",
              borderBottom: idx < filtered.length - 1 ? `1px solid ${ws.muted}` : "none",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = ws.hoverBg;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "transparent";
            }}
          >
            {/* Applicant */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: ws.heading, fontFamily: f }}>
                {rec.name}
              </div>
              <div style={{ fontSize: 11, fontWeight: 400, color: ws.disabled, fontFamily: f, marginTop: 1 }}>
                {rec.subtitle}
              </div>
            </div>

            {/* Status */}
            <div style={{ width: 80 }}>
              <StatusPill status={rec.status} />
            </div>

            {/* Documents */}
            <div style={{ width: 130 }}>
              <DocDots docs={rec.docs} />
            </div>

            {/* Customer Code */}
            <div style={{ width: 100 }}>
              {rec.customerCode ? (
                <span style={{ fontSize: 12, fontWeight: 600, color: ws.body, fontFamily: f }}>
                  {rec.customerCode}
                </span>
              ) : (
                <span style={{ fontSize: 11, color: ws.disabled, fontFamily: f }}>&mdash;</span>
              )}
            </div>

            {/* Submitted */}
            <div style={{ width: 60, fontSize: 11, fontWeight: 400, color: ws.muted_text, fontFamily: f }}>
              {rec.submitted}
            </div>

            {/* Completed */}
            <div style={{ width: 60, fontSize: 11, fontWeight: 400, color: ws.muted_text, fontFamily: f }}>
              {rec.completed ? rec.completed : (
                <span style={{ fontSize: 11, color: ws.disabled }}>&mdash;</span>
              )}
            </div>

            {/* Source */}
            <div style={{ width: 45, fontSize: 11, fontWeight: 400, color: ws.muted_text, fontFamily: f }}>
              {rec.source}
            </div>
          </div>
        ))}

        {/* Pagination Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 16px",
            borderTop: `1px solid ${ws.border}`,
          }}
        >
          {/* Left: record range */}
          <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>
            Showing {rangeStart}&ndash;{rangeEnd} of {totalRecords} records
          </span>

          {/* Right: pagination controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Previous button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: `1px solid ${ws.border}`,
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: currentPage === 1 ? "default" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
                padding: 0,
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 1) (e.currentTarget as HTMLButtonElement).style.backgroundColor = ws.hoverBg;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              }}
            >
              <ChevronLeft size={14} color={ws.muted_text} />
            </button>

            {/* Page numbers */}
            {pageNumbers.map((pg, i) => {
              if (pg === "...") {
                return (
                  <span
                    key={`ellipsis-${i}`}
                    style={{
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: ws.muted_text,
                      fontFamily: f,
                    }}
                  >
                    ...
                  </span>
                );
              }
              const pageNum = pg as number;
              const isActivePage = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: "none",
                    background: isActivePage ? ws.primary : "transparent",
                    color: isActivePage ? "#FFFFFF" : ws.secondary,
                    fontWeight: isActivePage ? 600 : 400,
                    fontSize: 12,
                    fontFamily: f,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActivePage) (e.currentTarget as HTMLButtonElement).style.backgroundColor = ws.hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActivePage) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: `1px solid ${ws.border}`,
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: currentPage === totalPages ? "default" : "pointer",
                opacity: currentPage === totalPages ? 0.5 : 1,
                padding: 0,
              }}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) (e.currentTarget as HTMLButtonElement).style.backgroundColor = ws.hoverBg;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              }}
            >
              <ChevronRight size={14} color={ws.body} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
