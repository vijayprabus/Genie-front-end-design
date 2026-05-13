import { useState, useRef, useEffect, useCallback } from "react";
import { MagnifyingGlass, X, Check, Plus } from "@phosphor-icons/react";
import { ws as baseWs, f } from "@/shared/utils/contentTokens";

/* ── Types ──────────────────────────────────────────────────────── */

export interface EntityItem {
  id: string;
  name: string;
  color?: string;
  initials?: string;
  metadata?: string; // e.g., "18 members", "4 workers"
}

export interface EntitySelectorProps {
  items: EntityItem[];
  selectedIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  placeholder?: string;
  showChips?: boolean; // legacy compat — ignored now, always uses inline rows
  maxHeight?: number;  // cap the selected items area height (px), scrolls beyond
}

/* ── Palette ────────────────────────────────────────────────────── */

const ws = { ...baseWs, primaryTint: "#F5F0FF" };

const STYLE_ID = "entity-selector-animations";

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes entityDropdownIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes entityFadeIn {
      from { opacity: 0; transform: translateY(-2px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes entityFlashGreen {
      0% { background-color: #ECFDF5; }
      100% { background-color: transparent; }
    }
  `;
  document.head.appendChild(style);
}

/* ── Component ──────────────────────────────────────────────────── */

export default function EntitySelector({
  items,
  selectedIds,
  onAdd,
  onRemove,
  placeholder = "Search...",
  maxHeight,
}: EntitySelectorProps) {
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [hoveredSelectedId, setHoveredSelectedId] = useState<string | null>(null);
  const [hoveredGhost, setHoveredGhost] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { injectStyles(); }, []);

  const closeDropdown = useCallback(() => {
    setEditing(false);
    setSearch("");
    setHoveredRowId(null);
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    if (!editing) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDropdown();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [editing, closeDropdown]);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const filtered = items.filter(
    (item) => !search || item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddItem = (id: string) => {
    onAdd(id);
    setFlashId(id);
    setTimeout(() => setFlashId(null), 600);
  };

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onRemove(id);
    } else {
      handleAddItem(id);
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", fontFamily: f }}>
      {/* Card with selected rows + ghost input row */}
      <div style={{
        borderRadius: editing ? "10px 10px 0 0" : 10,
        border: `1px solid ${editing ? ws.primary : ws.border}`,
        borderBottom: editing ? `1px solid ${ws.divider}` : `1px solid ${ws.border}`,
        overflow: "hidden",
        transition: "border-color 0.15s ease",
        maxHeight: maxHeight ?? undefined,
        overflowY: maxHeight ? "auto" : undefined,
      }}>
        {/* Selected item rows */}
        {selectedItems.map((item) => {
          const isHovered = hoveredSelectedId === item.id;
          const isFlashing = flashId === item.id;
          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredSelectedId(item.id)}
              onMouseLeave={() => setHoveredSelectedId(null)}
              style={{
                height: 40,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 12px",
                borderBottom: `1px solid ${ws.divider}`,
                backgroundColor: isFlashing ? ws.successBg : isHovered ? ws.elevated : "transparent",
                transition: "background-color 0.15s ease",
                animation: isFlashing ? "entityFlashGreen 600ms ease-out" : undefined,
                cursor: "pointer",
              }}
            >
              {item.color && (
                <div style={{
                  width: 20, height: 20, borderRadius: 5, backgroundColor: item.color,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {item.initials && (
                    <span style={{ fontSize: 8, fontWeight: 600, color: "#FFF", lineHeight: 1 }}>{item.initials}</span>
                  )}
                </div>
              )}
              <span style={{
                flex: 1, fontSize: 12, fontWeight: 500,
                color: isFlashing ? ws.success : ws.body,
                transition: "color 0.15s",
              }}>
                {item.name}
              </span>
              {/* Metadata (e.g., "18 members") — shown when not hovered and not flashing */}
              {item.metadata && !isHovered && !isFlashing && (
                <span style={{ fontSize: 10, color: ws.muted, flexShrink: 0 }}>{item.metadata}</span>
              )}
              {/* Hover: show X to remove */}
              {isHovered && !isFlashing && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: 2, display: "flex", alignItems: "center",
                  }}
                >
                  <X size={12} color={ws.error} weight="bold" />
                </button>
              )}
              {isFlashing && (
                <>
                  <span style={{ fontSize: 9, color: ws.success, fontWeight: 500, flexShrink: 0 }}>Added</span>
                  <Check size={12} color={ws.success} weight="bold" />
                </>
              )}
            </div>
          );
        })}

        {/* Ghost row / Input row */}
        <div
          onClick={() => { if (!editing) setEditing(true); }}
          onMouseEnter={() => setHoveredGhost(true)}
          onMouseLeave={() => setHoveredGhost(false)}
          style={{
            height: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 12px",
            cursor: editing ? "text" : "pointer",
            backgroundColor: editing ? ws.primaryTint : hoveredGhost ? ws.elevated : "transparent",
            transition: "background-color 0.15s ease",
          }}
        >
          {editing ? (
            <>
              <MagnifyingGlass size={13} color={ws.primary} style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                style={{
                  flex: 1, border: "none", outline: "none", background: "transparent",
                  fontSize: 12, fontFamily: f, color: ws.body, padding: 0,
                }}
              />
            </>
          ) : (
            <>
              <Plus size={12} color={hoveredGhost ? ws.secondary : ws.disabled} style={{ flexShrink: 0, transition: "color 0.15s" }} />
              <span style={{ fontSize: 12, color: hoveredGhost ? ws.secondary : ws.disabled, transition: "color 0.15s" }}>{placeholder}</span>
            </>
          )}
        </div>
      </div>

      {/* Dropdown — fused below the card */}
      {editing && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0, right: 0,
          marginTop: -1,
          borderRadius: "0 0 10px 10px",
          backgroundColor: ws.surface,
          border: `1px solid ${ws.primary}`,
          borderTop: `1px solid ${ws.divider}`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          maxHeight: 220,
          overflowY: "auto",
          zIndex: 20,
          animation: "entityDropdownIn 150ms ease-out",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 12, fontSize: 11, color: ws.muted, textAlign: "center" }}>
              No results found
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isHovered = hoveredRowId === item.id;
              const isHoveredSelected = isSelected && isHovered;

              return (
                <div
                  key={item.id}
                  onClick={(e) => { e.stopPropagation(); handleToggle(item.id); }}
                  onMouseEnter={() => setHoveredRowId(item.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                  style={{
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0 12px",
                    cursor: "pointer",
                    backgroundColor: isHoveredSelected
                      ? ws.errorBg
                      : isSelected
                        ? ws.primaryTint
                        : isHovered
                          ? ws.elevated
                          : "transparent",
                    transition: "background-color 0.1s ease",
                  }}
                >
                  {item.color && (
                    <div style={{
                      width: 20, height: 20, borderRadius: 5, backgroundColor: item.color,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {item.initials && (
                        <span style={{ fontSize: 8, fontWeight: 600, color: "#FFF", lineHeight: 1 }}>{item.initials}</span>
                      )}
                    </div>
                  )}
                  <span style={{
                    flex: 1, fontSize: 12,
                    fontWeight: isSelected ? 500 : 400,
                    color: isHoveredSelected ? "#DC2626" : isSelected ? ws.primary : ws.body,
                  }}>
                    {item.name}
                  </span>
                  {isSelected && (
                    isHoveredSelected
                      ? <X size={13} color="#DC2626" weight="bold" />
                      : <Check size={13} color={ws.primary} weight="bold" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
