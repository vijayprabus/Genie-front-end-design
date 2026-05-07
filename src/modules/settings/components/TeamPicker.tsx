import { useState, useRef, useEffect, useCallback } from "react";
import { X, Plus, MagnifyingGlass, Check } from "@phosphor-icons/react";
import { ws, f } from "@/shared/utils/contentTokens";
import { mockTeams } from "@/modules/settings/data/mockData";

/* ── Props ──────────────────────────────────────────────────────── */

export interface TeamPickerProps {
  selectedIds: string[];
  onAdd: (teamId: string) => void;
  onRemove: (teamId: string) => void;
  maxHeight?: number;
  confirmActions?: boolean; // true in panels, false/omitted in modals
}

/* ── Animation injection ─────────────────────────────────────────── */

const STYLE_ID = "team-picker-animations";

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes teamPickerDropdownIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes teamPickerFlash {
      0% { background-color: var(--ws-success-bg); }
      100% { background-color: transparent; }
    }
  `;
  document.head.appendChild(style);
}

/* ── Component ──────────────────────────────────────────────────── */

export default function TeamPicker({
  selectedIds,
  onAdd,
  onRemove,
  maxHeight,
  confirmActions = false,
}: TeamPickerProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [flashId, setFlashId] = useState<string | null>(null);
  const [hoveredSelectedId, setHoveredSelectedId] = useState<string | null>(null);
  const [hoveredGhost, setHoveredGhost] = useState(false);
  const [hoveredDropdownId, setHoveredDropdownId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmAddTeam, setConfirmAddTeam] = useState<typeof mockTeams[0] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    injectStyles();
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
    setSearch("");
    setHoveredDropdownId(null);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
        setConfirmAddTeam(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDropdown();
        setConfirmAddTeam(null);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [dropdownOpen, closeDropdown]);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (dropdownOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [dropdownOpen]);

  const selectedTeams = mockTeams.filter((t) => selectedIds.includes(t.id));
  const unselectedTeams = mockTeams.filter(
    (t) =>
      !selectedIds.includes(t.id) &&
      (!search || t.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = (teamId: string) => {
    if (confirmActions) {
      const team = mockTeams.find((t) => t.id === teamId);
      if (team) {
        setConfirmAddTeam(team);
        closeDropdown();
      }
    } else {
      onAdd(teamId);
      setFlashId(teamId);
      setTimeout(() => setFlashId(null), 600);
      closeDropdown();
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", fontFamily: f }}>
      {/* Card */}
      <div
        style={{
          borderRadius: dropdownOpen ? "10px 10px 0 0" : 10,
          border: `1px solid ${dropdownOpen ? ws.primary : ws.border}`,
          borderBottom: dropdownOpen
            ? `1px solid ${ws.divider}`
            : `1px solid ${ws.border}`,
          overflow: "hidden",
          transition: "border-color 0.15s ease",
          maxHeight: maxHeight ?? undefined,
          overflowY: maxHeight ? "auto" : undefined,
        }}
      >
        {/* Selected team rows */}
        {selectedTeams.map((team) => {
          const isHovered = hoveredSelectedId === team.id;
          const isFlashing = flashId === team.id;
          const isConfirmingRemove = confirmRemoveId === team.id;

          // CONFIRM REMOVE state — inline row swap
          if (isConfirmingRemove) {
            return (
              <div
                key={team.id}
                style={{
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  borderBottom: `1px solid ${ws.divider}`,
                  backgroundColor: ws.elevated,
                }}
              >
                <span style={{ flex: 1, fontSize: 12, color: ws.body, fontFamily: f }}>
                  Remove {team.name}?
                </span>
                <span
                  onClick={(e) => { e.stopPropagation(); setConfirmRemoveId(null); }}
                  style={{ fontSize: 12, color: ws.muted_text, cursor: "pointer", fontFamily: f, transition: "color 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = ws.secondary; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = ws.muted_text; }}
                >
                  Cancel
                </span>
                <span
                  onClick={(e) => { e.stopPropagation(); onRemove(team.id); setConfirmRemoveId(null); }}
                  style={{ fontSize: 12, fontWeight: 500, color: ws.error, cursor: "pointer", fontFamily: f, marginLeft: 8, transition: "color 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = ws.errorTextHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = ws.error; }}
                >
                  Remove
                </span>
              </div>
            );
          }

          return (
            <div
              key={team.id}
              onMouseEnter={() => setHoveredSelectedId(team.id)}
              onMouseLeave={() => setHoveredSelectedId(null)}
              style={{
                height: 40,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 12px",
                borderBottom: `1px solid ${ws.divider}`,
                backgroundColor: isFlashing
                  ? ws.successBg
                  : isHovered
                  ? ws.elevated
                  : "transparent",
                animation: isFlashing
                  ? "teamPickerFlash 600ms ease-out"
                  : undefined,
                transition: isFlashing ? undefined : "background-color 0.15s ease",
                cursor: "default",
              }}
            >
              {/* Team badge */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  backgroundColor: team.avatarColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 600,
                    color: ws.onPrimary,
                    lineHeight: 1,
                  }}
                >
                  {team.initials}
                </span>
              </div>

              {/* Team name */}
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: 500,
                  color: isFlashing ? ws.success : ws.body,
                  transition: "color 0.15s",
                }}
              >
                {team.name}
              </span>

              {/* Flash: "Added" + check */}
              {isFlashing && (
                <>
                  <span
                    style={{
                      fontSize: 9,
                      color: ws.success,
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    Added
                  </span>
                  <Check size={12} color={ws.success} weight="bold" />
                </>
              )}

              {/* Hover: metadata or remove button */}
              {!isFlashing && !isHovered && (
                <span
                  style={{
                    fontSize: 10,
                    color: ws.muted_text,
                    flexShrink: 0,
                  }}
                >
                  {team.memberCount} members
                </span>
              )}
              {!isFlashing && isHovered && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirmActions) {
                      setConfirmRemoveId(team.id);
                    } else {
                      onRemove(team.id);
                    }
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={12} color={ws.error} weight="bold" />
                </button>
              )}
            </div>
          );
        })}

        {/* Confirm-add row (between selected rows and ghost row) */}
        {confirmAddTeam && (
          <div
            style={{
              height: 40,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 12px",
              borderBottom: `1px solid ${ws.divider}`,
              backgroundColor: ws.elevated,
            }}
          >
            {/* Team badge (colored rounded square) */}
            <div style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              backgroundColor: confirmAddTeam.avatarColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 8, fontWeight: 600, color: ws.onPrimary, lineHeight: 1 }}>
                {confirmAddTeam.initials}
              </span>
            </div>
            <span style={{ flex: 1, fontSize: 12, color: ws.body, fontFamily: f }}>
              Add to {confirmAddTeam.name}?
            </span>
            <span
              onClick={(e) => { e.stopPropagation(); setConfirmAddTeam(null); }}
              style={{ fontSize: 12, color: ws.muted_text, cursor: "pointer", fontFamily: f, transition: "color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = ws.secondary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ws.muted_text; }}
            >
              Cancel
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onAdd(confirmAddTeam.id);
                setFlashId(confirmAddTeam.id);
                setTimeout(() => setFlashId(null), 600);
                setConfirmAddTeam(null);
              }}
              style={{ fontSize: 12, fontWeight: 500, color: ws.primary, cursor: "pointer", fontFamily: f, marginLeft: 8, transition: "color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = ws.primaryHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ws.primary; }}
            >
              Add
            </span>
          </div>
        )}

        {/* Ghost row / Search row — hidden when confirm-add is showing */}
        {!confirmAddTeam && <div
          onClick={() => {
            if (!dropdownOpen) {
              setDropdownOpen(true);
              setConfirmRemoveId(null);
              setConfirmAddTeam(null);
            }
          }}
          onMouseEnter={() => setHoveredGhost(true)}
          onMouseLeave={() => setHoveredGhost(false)}
          style={{
            height: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 12px",
            cursor: dropdownOpen ? "text" : "pointer",
            backgroundColor: dropdownOpen
              ? ws.primaryLight
              : hoveredGhost
              ? ws.elevated
              : "transparent",
            transition: "background-color 0.15s ease",
          }}
        >
          {dropdownOpen ? (
            <>
              <MagnifyingGlass size={13} color={ws.primary} style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teams..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 12,
                  fontFamily: f,
                  color: ws.body,
                  padding: 0,
                }}
              />
            </>
          ) : (
            <>
              <Plus
                size={12}
                color={hoveredGhost ? ws.secondary : ws.muted_text}
                style={{ flexShrink: 0, transition: "color 0.15s" }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: hoveredGhost ? ws.secondary : ws.muted_text,
                  transition: "color 0.15s",
                }}
              >
                Add to team...
              </span>
            </>
          )}
        </div>}
      </div>

      {/* Dropdown — fused below card */}
      {dropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: -1,
            borderRadius: "0 0 10px 10px",
            backgroundColor: ws.surface,
            border: `1px solid ${ws.primary}`,
            borderTop: `1px solid ${ws.divider}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            maxHeight: 220,
            overflowY: "auto",
            zIndex: 20,
            animation: "teamPickerDropdownIn 150ms ease-out",
          }}
        >
          {unselectedTeams.length === 0 ? (
            <div
              style={{
                padding: 12,
                fontSize: 11,
                color: ws.muted_text,
                textAlign: "center",
              }}
            >
              {search ? "No matching teams" : "All teams already added"}
            </div>
          ) : (
            unselectedTeams.map((team) => {
              const isHovered = hoveredDropdownId === team.id;
              return (
                <div
                  key={team.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(team.id);
                  }}
                  onMouseEnter={() => setHoveredDropdownId(team.id)}
                  onMouseLeave={() => setHoveredDropdownId(null)}
                  style={{
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0 12px",
                    cursor: "pointer",
                    backgroundColor: isHovered ? ws.elevated : "transparent",
                    transition: "background-color 0.1s ease",
                  }}
                >
                  {/* Team badge */}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 5,
                      backgroundColor: team.avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 8,
                        fontWeight: 600,
                        color: ws.onPrimary,
                        lineHeight: 1,
                      }}
                    >
                      {team.initials}
                    </span>
                  </div>

                  {/* Team name */}
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: 400,
                      color: ws.body,
                    }}
                  >
                    {team.name}
                  </span>

                  {/* Member count */}
                  <span
                    style={{
                      fontSize: 10,
                      color: ws.muted_text,
                      flexShrink: 0,
                    }}
                  >
                    {team.memberCount} members
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
