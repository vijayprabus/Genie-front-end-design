import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Maximize2,
  X,
  Columns3,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Download,
  Check,
} from "lucide-react";
import { ws, f } from "@/shared/utils/contentTokens";
import type { TableColumn } from "@/modules/chat/types";
import { useIsMobile } from "@/shared/hooks/use-mobile";

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE_DESKTOP = 10;
const PAGE_SIZE_MOBILE = 5;

type SortDir = "asc" | "desc";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { bg: string; color: string }> = {
  "in transit": { bg: ws.primaryLight, color: ws.primary },
  active:       { bg: ws.primaryLight, color: ws.primary },
  pending:      { bg: ws.warningBg,    color: ws.warningFg },
  delivered:    { bg: ws.successBg,    color: ws.successFg },
  inactive:     { bg: ws.elevated,     color: ws.muted_text },
};

function isStatusValue(val: string | number): boolean {
  if (typeof val !== "string") return false;
  return val.toLowerCase() in STATUS_MAP;
}

function StatusBadge({ value }: { value: string }) {
  const token = STATUS_MAP[value.toLowerCase()] ?? {
    bg: ws.elevated,
    color: ws.muted_text,
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        fontFamily: f,
        backgroundColor: token.bg,
        color: token.color,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 16,
        height: 16,
        flexShrink: 0,
        borderRadius: 4,
        border: `1px solid ${checked ? ws.primary : ws.inputBorder}`,
        backgroundColor: checked ? ws.primary : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        outline: "none",
        transition: "background 0.1s, border-color 0.1s",
      }}
    >
      {checked && <Check size={10} color={ws.onPrimary} strokeWidth={3} />}
    </button>
  );
}

// ─── Ghost button (toolbar) ───────────────────────────────────────────────────

function GhostButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 8,
        border: `1px solid ${active ? ws.primary : ws.border}`,
        backgroundColor: active
          ? ws.primaryLight
          : hovered
          ? ws.hoverBg
          : ws.surface,
        color: active ? ws.primary : ws.body,
        fontSize: 12,
        fontWeight: 500,
        fontFamily: f,
        cursor: "pointer",
        outline: "none",
        transition: "background 0.1s, border-color 0.1s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

// ─── Search input ─────────────────────────────────────────────────────────────

function SearchInput({
  value,
  onChange,
  width = 180,
}: {
  value: string;
  onChange: (v: string) => void;
  width?: number | string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        width,
        height: 32,
        backgroundColor: ws.surface,
        border: `1px solid ${focused ? ws.primary : ws.inputBorder}`,
        borderRadius: 8,
        padding: "0 10px",
        boxShadow: focused
          ? "0 0 0 2px rgba(124,58,237,0.1)"
          : "none",
        transition: "border-color 0.12s, box-shadow 0.12s",
        flexShrink: 0,
      }}
    >
      <Search size={14} color={ws.muted_text} strokeWidth={2} style={{ flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search..."
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          backgroundColor: "transparent",
          fontSize: 12,
          fontFamily: f,
          color: ws.body,
          minWidth: 0,
        }}
      />
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  totalRows,
  pageSize,
  onPage,
  isMobile,
}: {
  currentPage: number;
  totalPages: number;
  totalRows: number;
  pageSize: number;
  onPage: (p: number) => void;
  isMobile?: boolean;
}) {
  const start = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRows);

  // Build page numbers with ellipsis — on mobile, show fewer
  const pages: (number | "…")[] = [];
  if (isMobile) {
    // Mobile: just prev/next + current page indicator — no number buttons
    // We render differently below
  } else if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    const lo = Math.max(2, currentPage - 1);
    const hi = Math.min(totalPages - 1, currentPage + 1);
    for (let i = lo; i <= hi; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: isMobile ? 44 : 28,
    height: isMobile ? 44 : 28,
    borderRadius: 6,
    border: `1px solid ${ws.border}`,
    backgroundColor: ws.surface,
    color: disabled ? ws.disabled : ws.muted_text,
    fontSize: 13,
    fontFamily: f,
    cursor: disabled ? "not-allowed" : "pointer",
    outline: "none",
    transition: "color 0.1s",
  });

  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          fontFamily: f,
        }}
      >
        <span style={{ fontSize: 12, color: ws.muted_text }}>
          {totalRows === 0
            ? "No results"
            : `${start}–${end} of ${totalRows}`}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            disabled={currentPage === 1}
            onClick={() => onPage(currentPage - 1)}
            style={navBtnStyle(currentPage === 1)}
          >
            ‹
          </button>
          <span style={{ fontSize: 12, color: ws.body, fontFamily: f, minWidth: 40, textAlign: "center" }}>
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => onPage(currentPage + 1)}
            style={navBtnStyle(currentPage === totalPages || totalPages === 0)}
          >
            ›
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        fontFamily: f,
      }}
    >
      <span style={{ fontSize: 12, color: ws.muted_text }}>
        {totalRows === 0
          ? "No results"
          : `Showing ${start}–${end} of ${totalRows}`}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {/* Prev */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPage(currentPage - 1)}
          style={navBtnStyle(currentPage === 1)}
        >
          ‹
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              style={{ fontSize: 12, color: ws.muted_text, padding: "0 4px" }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: 6,
                border: `1px solid ${p === currentPage ? ws.primary : ws.border}`,
                backgroundColor:
                  p === currentPage ? ws.primaryLight : ws.surface,
                color: p === currentPage ? ws.primary : ws.muted_text,
                fontSize: 12,
                fontFamily: f,
                cursor: "pointer",
                fontWeight: p === currentPage ? 600 : 400,
                outline: "none",
                transition: "color 0.1s, background 0.1s",
              }}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPage(currentPage + 1)}
          style={navBtnStyle(currentPage === totalPages || totalPages === 0)}
        >
          ›
        </button>
      </div>
    </div>
  );
}

// ─── Table header + rows ──────────────────────────────────────────────────────

function TableHeader({
  columns,
  sortColumn,
  sortDir,
  onSort,
  isMobile,
}: {
  columns: TableColumn[];
  sortColumn: string | null;
  sortDir: SortDir;
  onSort: (key: string) => void;
  isMobile?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "8px 16px",
        backgroundColor: ws.elevated,
        borderBottom: `1px solid ${ws.divider}`,
      }}
    >
      {columns.map((col) => {
        const isActive = sortColumn === col.key;
        return (
          <button
            key={col.key}
            onClick={() => onSort(col.key)}
            style={{
              flex: col.width ? "none" : 1,
              width: col.width ? col.width : undefined,
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textAlign: "left",
              outline: "none",
              fontFamily: f,
              fontSize: isMobile ? 11 : 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: isActive ? ws.primary : ws.secondary,
              transition: "color 0.1s",
              whiteSpace: "nowrap",
            }}
          >
            {col.label}
            {isActive ? (
              sortDir === "asc" ? (
                <ArrowUp size={10} color={ws.primary} strokeWidth={2.5} />
              ) : (
                <ArrowDown size={10} color={ws.primary} strokeWidth={2.5} />
              )
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function TableRow({
  row,
  columns,
  isLast,
  isMobile,
}: {
  row: Record<string, string | number>;
  columns: TableColumn[];
  isLast: boolean;
  isMobile?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "10px 16px",
        borderBottom: isLast ? "none" : `1px solid ${ws.divider}`,
        backgroundColor: hovered ? ws.hoverBg : "transparent",
        transition: "background-color 0.12s",
      }}
    >
      {columns.map((col) => {
        const val = row[col.key] ?? "";
        const isStatus = isStatusValue(val);
        return (
          <div
            key={col.key}
            style={{
              flex: col.width ? "none" : 1,
              width: col.width ? col.width : undefined,
              fontSize: isMobile ? 13 : 12,
              fontFamily: f,
              color: ws.body,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {isStatus ? (
              <StatusBadge value={String(val)} />
            ) : (
              String(val)
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Columns dropdown ─────────────────────────────────────────────────────────

function ColumnsDropdown({
  allColumns,
  visibleKeys,
  onToggle,
  onClose,
}: {
  allColumns: TableColumn[];
  visibleKeys: string[];
  onToggle: (key: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        left: 0,
        zIndex: 100,
        backgroundColor: ws.surface,
        border: `1px solid ${ws.border}`,
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        minWidth: 180,
        overflow: "hidden",
      }}
    >
      {allColumns.map((col) => {
        const visible = visibleKeys.includes(col.key);
        return (
          <button
            key={col.key}
            onClick={() => onToggle(col.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              height: 32,
              padding: "0 12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: f,
              fontSize: 12,
              color: visible ? ws.body : ws.muted_text,
              textAlign: "left",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = ws.hoverBg)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <Checkbox checked={visible} onChange={() => onToggle(col.key)} />
            {col.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Core table logic hook ────────────────────────────────────────────────────

function useTableState(
  rows: Record<string, string | number>[],
  columns: TableColumn[],
  totalRows?: number,
  pageSize: number = PAGE_SIZE_DESKTOP
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((c) => c.key)
  );

  const handleSort = useCallback(
    (key: string) => {
      if (sortColumn === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(key);
        setSortDir("asc");
      }
      setCurrentPage(1);
    },
    [sortColumn]
  );

  const handleSearch = useCallback((v: string) => {
    setSearchQuery(v);
    setCurrentPage(1);
  }, []);

  const toggleColumn = useCallback((key: string) => {
    setVisibleColumns((prev) => {
      if (prev.includes(key)) {
        // Never hide all columns
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      }
      // Restore original order
      return columns.map((c) => c.key).filter((k) => k === key || prev.includes(k));
    });
  }, [columns]);

  // Filtered rows
  const filteredRows = searchQuery
    ? rows.filter((row) =>
        Object.values(row).some((v) =>
          String(v).toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : rows;

  // Sorted rows
  const sortedRows =
    sortColumn === null
      ? filteredRows
      : [...filteredRows].sort((a, b) => {
          const av = a[sortColumn] ?? "";
          const bv = b[sortColumn] ?? "";
          const cmp =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av).localeCompare(String(bv));
          return sortDir === "asc" ? cmp : -cmp;
        });

  const effectiveTotal = totalRows ?? sortedRows.length;
  const displayTotal = searchQuery ? sortedRows.length : effectiveTotal;
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageRows = sortedRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const visibleCols = columns.filter((c) => visibleColumns.includes(c.key));

  return {
    searchQuery,
    sortColumn,
    sortDir,
    currentPage: safePage,
    visibleColumns,
    visibleCols,
    pageRows,
    sortedFilteredRows: sortedRows,
    displayTotal,
    totalPages,
    handleSort,
    handleSearch,
    setCurrentPage,
    toggleColumn,
  };
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function buildCSV(
  title: string,
  visibleCols: TableColumn[],
  rows: Record<string, string | number>[]
) {
  const headers = visibleCols.map((c) => c.label).join(",");
  const body = rows
    .map((row) => visibleCols.map((c) => `"${row[c.key] ?? ""}"`).join(","))
    .join("\n");
  const blob = new Blob([headers + "\n" + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InlineTableProps {
  title: string;
  columns: TableColumn[];
  rows: Record<string, string | number>[];
  totalRows?: number;
}

// ─── Drag handle (mobile bottom sheet) ───────────────────────────────────────

function DragHandle() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "12px 0 8px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: ws.inputBorder,
        }}
      />
    </div>
  );
}

// ─── Fullscreen modal ─────────────────────────────────────────────────────────

function FullscreenModal({
  title,
  columns,
  rows,
  totalRows,
  onClose,
  isMobile,
}: InlineTableProps & { onClose: () => void; isMobile: boolean }) {
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const columnsButtonRef = useRef<HTMLDivElement>(null);

  const pageSize = isMobile ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP;

  const {
    searchQuery,
    sortColumn,
    sortDir,
    currentPage,
    visibleColumns,
    visibleCols,
    pageRows,
    sortedFilteredRows,
    displayTotal,
    totalPages,
    handleSort,
    handleSearch,
    setCurrentPage,
    toggleColumn,
  } = useTableState(rows, columns, totalRows, pageSize);

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Mobile: full-screen bottom sheet, no backdrop click to close
  // Desktop: centered modal with backdrop click to close
  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        inset: 0,
        backgroundColor: ws.surface,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(90vw, 900px)",
        height: "min(85vh, 700px)",
        backgroundColor: ws.surface,
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: isMobile ? undefined : "rgba(0,0,0,0.4)",
        zIndex: 50,
        display: isMobile ? "block" : "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={isMobile ? undefined : onClose}
    >
      {/* Modal panel */}
      <div
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        {isMobile && <DragHandle />}

        {/* Modal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "8px 16px 12px" : "16px 20px",
            borderBottom: `1px solid ${ws.divider}`,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              fontFamily: f,
              color: ws.heading,
            }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: isMobile ? 44 : undefined,
              height: isMobile ? 44 : undefined,
              color: ws.muted_text,
              outline: "none",
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = ws.body)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = ws.muted_text)
            }
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Modal toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: isMobile ? "10px 16px" : "10px 20px",
            borderBottom: `1px solid ${ws.divider}`,
            flexShrink: 0,
          }}
        >
          <SearchInput
            value={searchQuery}
            onChange={handleSearch}
            width={isMobile ? "100%" : 240}
          />

          {!isMobile && (
            <>
              {/* Columns button + dropdown */}
              <div ref={columnsButtonRef} style={{ position: "relative" }}>
                <GhostButton
                  active={columnsDropdownOpen}
                  onClick={() => setColumnsDropdownOpen((v) => !v)}
                >
                  <Columns3 size={14} strokeWidth={2} />
                  Columns
                </GhostButton>
                {columnsDropdownOpen && (
                  <ColumnsDropdown
                    allColumns={columns}
                    visibleKeys={visibleColumns}
                    onToggle={toggleColumn}
                    onClose={() => setColumnsDropdownOpen(false)}
                  />
                )}
              </div>

              {/* Sort indicator button */}
              <GhostButton active={sortColumn !== null} onClick={() => {}}>
                <ArrowUpDown size={14} strokeWidth={2} />
                Sort
              </GhostButton>
            </>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Export CSV */}
          <button
            onClick={() => buildCSV(title, visibleCols, sortedFilteredRows)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: isMobile ? "0 12px" : "6px 12px",
              height: isMobile ? 44 : undefined,
              borderRadius: 8,
              border: "none",
              backgroundColor: ws.primary,
              color: ws.onPrimary,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: f,
              cursor: "pointer",
              outline: "none",
              transition: "background 0.1s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = ws.primaryHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = ws.primary)
            }
          >
            <Download size={14} strokeWidth={2} />
            Export CSV
          </button>
        </div>

        {/* Table — scrollable body */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Scrollable container with horizontal scroll on mobile */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: isMobile ? "auto" : "hidden",
              WebkitOverflowScrolling: "touch",
            } as React.CSSProperties}
          >
            <div style={{ minWidth: isMobile ? 500 : undefined }}>
              {/* Fixed header */}
              <TableHeader
                columns={visibleCols}
                sortColumn={sortColumn}
                sortDir={sortDir}
                onSort={handleSort}
                isMobile={isMobile}
              />
              {/* Rows */}
              {pageRows.map((row, i) => (
                <TableRow
                  key={i}
                  row={row}
                  columns={visibleCols}
                  isLast={i === pageRows.length - 1}
                  isMobile={isMobile}
                />
              ))}
              {pageRows.length === 0 && (
                <div
                  style={{
                    padding: "32px 16px",
                    textAlign: "center",
                    fontSize: 13,
                    fontFamily: f,
                    color: ws.muted_text,
                  }}
                >
                  No results found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${ws.divider}`, flexShrink: 0 }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRows={displayTotal}
            pageSize={pageSize}
            onPage={setCurrentPage}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function InlineTable({
  title,
  columns,
  rows,
  totalRows,
}: InlineTableProps) {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandTooltip, setExpandTooltip] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const expandedSearchRef = useRef<HTMLInputElement>(null);

  const pageSize = isMobile ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP;

  const {
    searchQuery,
    sortColumn,
    sortDir,
    currentPage,
    visibleCols,
    pageRows,
    displayTotal,
    totalPages,
    handleSort,
    handleSearch,
    setCurrentPage,
  } = useTableState(rows, columns, totalRows, pageSize);

  // Focus the expanded search input when it opens
  useEffect(() => {
    if (searchExpanded && expandedSearchRef.current) {
      expandedSearchRef.current.focus();
    }
  }, [searchExpanded]);

  return (
    <>
      {/* Inline container */}
      <div
        style={{
          width: "100%",
          backgroundColor: ws.surface,
          border: `1px solid ${ws.border}`,
          borderRadius: 14,
          overflow: "hidden",
          fontFamily: f,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            gap: 8,
          }}
        >
          {/* Left: search — desktop always-visible vs mobile expandable */}
          {isMobile ? (
            searchExpanded ? (
              /* Expanded search — full width */
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: 44,
                    backgroundColor: ws.surface,
                    border: `1px solid ${ws.primary}`,
                    borderRadius: 8,
                    padding: "0 10px",
                    boxShadow: "0 0 0 2px rgba(124,58,237,0.1)",
                  }}
                >
                  <Search size={14} color={ws.muted_text} strokeWidth={2} style={{ flexShrink: 0 }} />
                  <input
                    ref={expandedSearchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search..."
                    style={{
                      flex: 1,
                      border: "none",
                      outline: "none",
                      backgroundColor: "transparent",
                      fontSize: 14,
                      fontFamily: f,
                      color: ws.body,
                      minWidth: 0,
                    }}
                  />
                </div>
                {/* Collapse button */}
                <button
                  onClick={() => {
                    setSearchExpanded(false);
                    handleSearch("");
                  }}
                  style={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: ws.muted_text,
                    borderRadius: 8,
                    outline: "none",
                  }}
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            ) : (
              /* Collapsed — icon buttons only */
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => setSearchExpanded(true)}
                  style={{
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: ws.muted_text,
                    borderRadius: 8,
                    outline: "none",
                  }}
                >
                  <Search size={18} strokeWidth={2} />
                </button>
                <button
                  onClick={() => setIsFullscreen(true)}
                  style={{
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: ws.muted_text,
                    borderRadius: 8,
                    outline: "none",
                  }}
                >
                  <Maximize2 size={18} strokeWidth={2} />
                </button>
              </div>
            )
          ) : (
            /* Desktop: always-visible search */
            <SearchInput value={searchQuery} onChange={handleSearch} width={180} />
          )}

          {/* Right: hint + expand — desktop only */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  color: ws.muted_text,
                  fontStyle: "italic",
                  fontFamily: f,
                }}
              >
                More options in fullscreen
              </span>

              {/* Expand button with tooltip */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setIsFullscreen(true)}
                  onMouseEnter={() => setExpandTooltip(true)}
                  onMouseLeave={() => setExpandTooltip(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 4,
                    borderRadius: 6,
                    color: ws.muted_text,
                    outline: "none",
                    transition: "color 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = ws.primary;
                    setExpandTooltip(true);
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = ws.muted_text;
                    setExpandTooltip(false);
                  }}
                >
                  <Maximize2 size={16} strokeWidth={2} />
                </button>

                {/* Tooltip */}
                {expandTooltip && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 6px)",
                      right: 0,
                      backgroundColor: ws.heading,
                      color: ws.onPrimary,
                      fontSize: 11,
                      fontFamily: f,
                      fontWeight: 500,
                      padding: "4px 8px",
                      borderRadius: 6,
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      zIndex: 10,
                    }}
                  >
                    Expand to fullscreen
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: ws.divider }} />

        {/* Table content — horizontal scroll on mobile */}
        <div
          style={{
            overflowX: isMobile ? "auto" : undefined,
            WebkitOverflowScrolling: "touch",
          } as React.CSSProperties}
        >
          <div style={{ minWidth: isMobile ? 500 : undefined }}>
            {/* Header */}
            <TableHeader
              columns={visibleCols}
              sortColumn={sortColumn}
              sortDir={sortDir}
              onSort={handleSort}
              isMobile={isMobile}
            />

            {/* Rows */}
            <div>
              {pageRows.map((row, i) => (
                <TableRow
                  key={i}
                  row={row}
                  columns={visibleCols}
                  isLast={i === pageRows.length - 1}
                  isMobile={isMobile}
                />
              ))}
              {pageRows.length === 0 && (
                <div
                  style={{
                    padding: "32px 16px",
                    textAlign: "center",
                    fontSize: 13,
                    fontFamily: f,
                    color: ws.muted_text,
                  }}
                >
                  No results found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination footer */}
        <div style={{ borderTop: `1px solid ${ws.divider}` }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRows={displayTotal}
            pageSize={pageSize}
            onPage={setCurrentPage}
            isMobile={isMobile}
          />
        </div>
      </div>

      {/* Fullscreen modal (portal) */}
      {isFullscreen && (
        <FullscreenModal
          title={title}
          columns={columns}
          rows={rows}
          totalRows={totalRows}
          onClose={() => setIsFullscreen(false)}
          isMobile={isMobile}
        />
      )}
    </>
  );
}
