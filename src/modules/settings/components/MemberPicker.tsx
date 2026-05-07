import { useState, useRef, useEffect, useCallback } from "react";
import { X, Plus, MagnifyingGlass, Check } from "@phosphor-icons/react";
import { ws, f } from "@/shared/utils/contentTokens";
import { mockMembers } from "@/modules/settings/data/mockData";

/* ── Props ──────────────────────────────────────────────────────── */

export interface MemberPickerProps {
  selectedIds: string[];
  onAdd: (memberId: string) => void;
  onRemove: (memberId: string) => void;
  maxHeight?: number;
  confirmActions?: boolean; // true in panels, false/omitted in modals
}

/* ── Animation injection ─────────────────────────────────────────── */

const STYLE_ID = "member-picker-animations";

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes memberPickerDropdownIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes memberPickerFlash {
      0% { background-color: #ECFDF5; }
      100% { background-color: transparent; }
    }
  `;
  document.head.appendChild(style);
}

/* ── Component ──────────────────────────────────────────────────── */

export default function MemberPicker({
  selectedIds,
  onAdd,
  onRemove,
  maxHeight,
  confirmActions = false,
}: MemberPickerProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [flashId, setFlashId] = useState<string | null>(null);
  const [hoveredSelectedId, setHoveredSelectedId] = useState<string | null>(null);
  const [hoveredGhost, setHoveredGhost] = useState(false);
  const [hoveredDropdownId, setHoveredDropdownId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmAddMember, setConfirmAddMember] = useState<typeof mockMembers[0] | null>(null);
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

  // Close on outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
        setConfirmAddMember(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDropdown();
        setConfirmAddMember(null);
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

  const selectedMembers = mockMembers.filter((m) => selectedIds.includes(m.id));
  const unselectedMembers = mockMembers.filter(
    (m) =>
      !selectedIds.includes(m.id) &&
      (!search || m.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = (memberId: string) => {
    if (confirmActions) {
      const member = mockMembers.find((m) => m.id === memberId);
      if (member) {
        setConfirmAddMember(member);
        closeDropdown();
      }
    } else {
      onAdd(memberId);
      setFlashId(memberId);
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
        {/* Selected member rows */}
        {selectedMembers.map((member) => {
          const isHovered = hoveredSelectedId === member.id;
          const isFlashing = flashId === member.id;
          const isConfirmingRemove = confirmRemoveId === member.id;

          // CONFIRM REMOVE state — inline row swap
          if (isConfirmingRemove) {
            return (
              <div
                key={member.id}
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
                  Remove {member.name}?
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
                  onClick={(e) => { e.stopPropagation(); onRemove(member.id); setConfirmRemoveId(null); }}
                  style={{ fontSize: 12, fontWeight: 500, color: ws.error, cursor: "pointer", fontFamily: f, marginLeft: 8, transition: "color 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#DC2626"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = ws.error; }}
                >
                  Remove
                </span>
              </div>
            );
          }

          // FLASH state
          if (isFlashing) {
            return (
              <div
                key={member.id}
                style={{
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0 12px",
                  borderBottom: `1px solid ${ws.divider}`,
                  backgroundColor: ws.successBg,
                  animation: "memberPickerFlash 600ms ease-out",
                  cursor: "default",
                }}
              >
                {/* Member avatar */}
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: ws.elevated,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 8, fontWeight: 600, color: ws.secondary, lineHeight: 1 }}>
                    {member.initials}
                  </span>
                </div>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: ws.success, transition: "color 0.15s" }}>
                  {member.name}
                </span>
                <span style={{ fontSize: 9, color: ws.success, fontWeight: 500, flexShrink: 0 }}>Added</span>
                <Check size={12} color={ws.success} weight="bold" />
              </div>
            );
          }

          // NORMAL state
          return (
            <div
              key={member.id}
              onMouseEnter={() => setHoveredSelectedId(member.id)}
              onMouseLeave={() => setHoveredSelectedId(null)}
              style={{
                height: 40,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 12px",
                borderBottom: `1px solid ${ws.divider}`,
                backgroundColor: isHovered ? ws.elevated : "transparent",
                transition: "background-color 0.15s ease",
                cursor: "default",
              }}
            >
              {/* Member avatar — always grey */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: ws.elevated,
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
                    color: ws.secondary,
                    lineHeight: 1,
                  }}
                >
                  {member.initials}
                </span>
              </div>

              {/* Member name */}
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: 500,
                  color: ws.body,
                  transition: "color 0.15s",
                }}
              >
                {member.name}
              </span>

              {/* Hover: role label or remove button */}
              {!isHovered && (
                <span
                  style={{
                    fontSize: 10,
                    color: ws.muted_text,
                    flexShrink: 0,
                  }}
                >
                  {member.role}
                </span>
              )}
              {isHovered && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirmActions) {
                      setConfirmRemoveId(member.id);
                    } else {
                      onRemove(member.id);
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
        {confirmAddMember && (
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
            {/* Grey circle avatar */}
            <div style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: ws.elevated,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: `1px solid ${ws.border}`,
            }}>
              <span style={{ fontSize: 8, fontWeight: 600, color: ws.secondary, lineHeight: 1 }}>
                {confirmAddMember.initials}
              </span>
            </div>
            <span style={{ flex: 1, fontSize: 12, color: ws.body, fontFamily: f }}>
              Add {confirmAddMember.name}?
            </span>
            <span
              onClick={(e) => { e.stopPropagation(); setConfirmAddMember(null); }}
              style={{ fontSize: 12, color: ws.muted_text, cursor: "pointer", fontFamily: f, transition: "color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = ws.secondary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ws.muted_text; }}
            >
              Cancel
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onAdd(confirmAddMember.id);
                setFlashId(confirmAddMember.id);
                setTimeout(() => setFlashId(null), 600);
                setConfirmAddMember(null);
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
        {!confirmAddMember && <div
          onClick={() => {
            if (!dropdownOpen) {
              setDropdownOpen(true);
              setConfirmRemoveId(null);
              setConfirmAddMember(null);
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
                placeholder="Search members..."
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
                Add member...
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
            animation: "memberPickerDropdownIn 150ms ease-out",
          }}
        >
          {unselectedMembers.length === 0 ? (
            <div
              style={{
                padding: 12,
                fontSize: 11,
                color: ws.muted_text,
                textAlign: "center",
              }}
            >
              {search ? "No matching members" : "All members already added"}
            </div>
          ) : (
            unselectedMembers.map((member) => {
              const isHovered = hoveredDropdownId === member.id;
              return (
                <div
                  key={member.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(member.id);
                  }}
                  onMouseEnter={() => setHoveredDropdownId(member.id)}
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
                  {/* Member avatar — always grey */}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: ws.elevated,
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
                        color: ws.secondary,
                        lineHeight: 1,
                      }}
                    >
                      {member.initials}
                    </span>
                  </div>

                  {/* Member name */}
                  <span
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: 400,
                      color: ws.body,
                    }}
                  >
                    {member.name}
                  </span>

                  {/* Role */}
                  <span
                    style={{
                      fontSize: 10,
                      color: ws.muted_text,
                      flexShrink: 0,
                    }}
                  >
                    {member.role}
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
