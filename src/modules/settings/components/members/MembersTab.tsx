import { useState, useEffect, useMemo } from "react";
import {
  UserPlus, ListFilter, ChevronDown, ChevronRight, X,
  UserMinus, Plus, Send, Users,
} from "lucide-react";
import { useLayoutContext } from "@/modules/settings/components/SettingsLayout";
import { mockMembers, mockTeams } from "@/modules/settings/data/mockData";
import type { Member, MemberRole, MemberStatus } from "@/modules/settings/types";
import InviteUserModal from "./InviteUserModal";
import { useBreakpoint } from "@/shared/hooks/useBreakpoint";

/* ── Design-system constants ──────────────────────────────────── */

const f = "Inter, system-ui, sans-serif";
const ws = {
  page: "#FAF8F5", surface: "#FFFDF9", elevated: "#F5F0EB", muted: "#F0EBE4",
  border: "#E7E0D8", divider: "#F0EBE4", inputBorder: "#D6D3D1",
  heading: "#44403C", body: "#44403C", secondary: "#78716C", muted_text: "#A8A29E",
  disabled: "#D6D3D1", primary: "#7C3AED", primaryLight: "#EDE9FE",
  error: "#E11D48", hoverBg: "#EDE8E3", success: "#10B981",
};
const spring = "cubic-bezier(0.22, 1, 0.36, 1)";
const avatarColors = ["#6D28D9", "#8B4F3F", "#9D4B6E", "#5A6E47", "#3D6B6B", "#7E4A6E"];

const GLOBAL_CSS = `
  [data-members-panel] *::-webkit-scrollbar { width: 0; display: none; }
  [data-members-panel] * { scrollbar-width: none; }
`;

/* ── Filter types ─────────────────────────────────────────────── */

type FilterOption = "All members" | "Admins" | "Members" | "Pending";

/* ── Helper: days ago ─────────────────────────────────────────── */

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));
}

function hoursAgo(_dateStr: string): string {
  // Simulate last active hours for demo
  const hours = Math.floor(Math.random() * 24) + 1;
  return `${hours}h ago`;
}

/* ── MemberDetailPanel ────────────────────────────────────────── */

function MemberDetailPanel({
  member,
  memberIndex,
  onClose,
}: {
  member: Member;
  memberIndex: number;
  onClose: () => void;
}) {
  const color = avatarColors[memberIndex % avatarColors.length];
  const memberTeams = mockTeams.filter((t) =>
    member.teams.some((tn) => t.name.includes(tn) || tn.includes(t.name.replace(" Operations", " Ops").replace("Field Operations", "Field Ops")))
    || t.members.some((tm) => tm.id === member.id)
  );

  const [hoverDeactivate, setHoverDeactivate] = useState(false);
  const [hoverAddTeam, setHoverAddTeam] = useState(false);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: f }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${ws.divider}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", backgroundColor: color,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#FFF" }}>{member.initials}</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: ws.heading }}>{member.name}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 4,
              borderRadius: 6, color: ws.muted_text, display: "flex", alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Role badge + stat line */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{
            display: "inline-flex", padding: "2px 8px", borderRadius: 4,
            fontSize: 11, fontWeight: 500, backgroundColor: ws.primaryLight, color: ws.primary,
          }}>
            {member.role}
          </span>
        </div>
        <div style={{ fontSize: 12, color: ws.muted_text, marginTop: 6 }}>
          {memberTeams.length} team{memberTeams.length !== 1 ? "s" : ""} &middot; Last active {hoursAgo(member.joinedAt)}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
        {/* Details section */}
        <div style={{ borderBottom: `1px solid ${ws.divider}`, paddingBottom: 16, marginBottom: 16, paddingTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, marginBottom: 12 }}>Details</div>

          {/* Email */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: ws.secondary }}>Email</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: ws.body }}>{member.email}</span>
          </div>

          {/* Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: ws.secondary }}>Status</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 500, color: ws.body }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ws.success, display: "inline-block" }} />
              Active
            </span>
          </div>

          {/* Joined */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: ws.secondary }}>Joined</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: ws.body }}>
              {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Teams section */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text }}>Teams</span>
            <button
              onMouseEnter={() => setHoverAddTeam(true)}
              onMouseLeave={() => setHoverAddTeam(false)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 500, color: ws.primary, padding: "2px 6px",
                borderRadius: 4, backgroundColor: hoverAddTeam ? ws.primaryLight : "transparent",
                transition: "background-color 0.12s",
              }}
            >
              <Plus size={12} />
              Add
            </button>
          </div>

          {memberTeams.length > 0 ? (
            <div style={{ border: `1px solid ${ws.border}`, borderRadius: 10, overflow: "hidden" }}>
              {memberTeams.map((team, i) => {
                const teamColor = avatarColors[i % avatarColors.length];
                return (
                  <div
                    key={team.id}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 12px",
                      borderBottom: i < memberTeams.length - 1 ? `1px solid ${ws.divider}` : "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 5, backgroundColor: teamColor,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 8, fontWeight: 600, color: "#FFF" }}>{team.initials}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: ws.body }}>{team.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: ws.muted_text }}>{team.workerCount} worker{team.workerCount !== 1 ? "s" : ""}</span>
                      <ChevronRight size={14} color={ws.disabled} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: ws.muted_text, padding: "12px 0" }}>Not assigned to any teams</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: `1px solid ${ws.divider}` }}>
        <button
          onMouseEnter={() => setHoverDeactivate(true)}
          onMouseLeave={() => setHoverDeactivate(false)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            width: "100%", height: 34, borderRadius: 8,
            border: `1px solid #FECACA`, backgroundColor: hoverDeactivate ? "#FFF1F2" : "transparent",
            color: ws.error, fontSize: 13, fontWeight: 500, fontFamily: f, cursor: "pointer",
            transition: "background-color 0.12s",
          }}
        >
          <UserMinus size={14} />
          Deactivate User
        </button>
      </div>
    </div>
  );
}

/* ── PendingMemberPanel ───────────────────────────────────────── */

function PendingMemberPanel({
  member,
  memberIndex,
  onClose,
}: {
  member: Member;
  memberIndex: number;
  onClose: () => void;
}) {
  const color = avatarColors[memberIndex % avatarColors.length];
  const invitedDays = daysAgo(member.joinedAt);

  const [hoverResend, setHoverResend] = useState(false);
  const [hoverCancel, setHoverCancel] = useState(false);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: f }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${ws.divider}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              border: `2px dashed ${color}`, opacity: 0.6,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color }}>{member.initials}</span>
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, color: ws.muted_text }}>{member.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span style={{
                  display: "inline-flex", padding: "2px 8px", borderRadius: 4,
                  fontSize: 11, fontWeight: 500, backgroundColor: ws.muted, color: ws.muted_text,
                }}>
                  Pending invite
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 4,
              borderRadius: 6, color: ws.muted_text, display: "flex", alignItems: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
        {/* Invite details */}
        <div style={{ paddingTop: 16, paddingBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, marginBottom: 12 }}>Invite Details</div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: ws.secondary }}>Email</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: ws.body }}>{member.email}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: ws.secondary }}>Invited as</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: ws.body }}>{member.role}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: ws.secondary }}>Invited by</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: ws.body }}>Chirag Mehta</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: ws.secondary }}>Invited on</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: ws.body }}>
              {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: `1px solid ${ws.divider}`, display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onMouseEnter={() => setHoverResend(true)}
          onMouseLeave={() => setHoverResend(false)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            width: "100%", height: 34, borderRadius: 8,
            border: "none", backgroundColor: hoverResend ? "#6D28D9" : ws.primary,
            color: "#FFF", fontSize: 13, fontWeight: 500, fontFamily: f, cursor: "pointer",
            transition: "background-color 0.12s",
          }}
        >
          <Send size={14} />
          Resend Invite
        </button>
        <button
          onMouseEnter={() => setHoverCancel(true)}
          onMouseLeave={() => setHoverCancel(false)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            width: "100%", height: 34, borderRadius: 8,
            border: `1px solid #FECACA`, backgroundColor: hoverCancel ? "#FFF1F2" : "transparent",
            color: ws.error, fontSize: 13, fontWeight: 500, fontFamily: f, cursor: "pointer",
            transition: "background-color 0.12s",
          }}
        >
          Cancel Invite
        </button>
      </div>
    </div>
  );
}

/* ── Main MembersTab ──────────────────────────────────────────── */

export default function MembersTab() {
  const bp = useBreakpoint();
  const isDesktop = bp === "desktop";
  const isMobile = bp === "mobile";
  const { searchQuery } = useLayoutContext();
  const [filter, setFilter] = useState<FilterOption>("All members");
  const [inviteOpen, setInviteOpen] = useState(false);

  /* Panel state — same pattern as IntegrationsTab */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelFading, setPanelFading] = useState(false);
  const [renderedMember, setRenderedMember] = useState<Member | null>(null);

  const selectedMember = mockMembers.find((m) => m.id === selectedId) ?? null;
  const panelOpen = selectedMember !== null;

  useEffect(() => {
    if (selectedMember) {
      setRenderedMember(selectedMember);
    }
  }, [selectedMember]);

  useEffect(() => {
    if (!panelOpen && renderedMember) {
      const t = setTimeout(() => setRenderedMember(null), 320);
      return () => clearTimeout(t);
    }
  }, [panelOpen, renderedMember]);

  const handleRowClick = (id: string) => {
    if (id === selectedId) { setSelectedId(null); return; }
    if (selectedId) {
      setPanelFading(true);
      setTimeout(() => {
        const next = mockMembers.find((m) => m.id === id) ?? null;
        if (next) setRenderedMember(next);
        setSelectedId(id);
        requestAnimationFrame(() => setPanelFading(false));
      }, 200);
    } else {
      setSelectedId(id);
    }
  };

  const handleClosePanel = () => setSelectedId(null);

  /* Filtering */
  const filteredMembers = useMemo(() => {
    let list = mockMembers.filter((m) => {
      const matchesSearch = !searchQuery
        || m.name.toLowerCase().includes(searchQuery.toLowerCase())
        || m.email.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === "Admins") return m.role === "Super Admin" || m.role === "Org Admin";
      if (filter === "Members") return m.role === "Member" && m.status !== "Pending";
      if (filter === "Pending") return m.status === "Pending";
      return true;
    });

    // Sort: active members alphabetically, pending at bottom
    const active = list.filter((m) => m.status !== "Pending").sort((a, b) => a.name.localeCompare(b.name));
    const pending = list.filter((m) => m.status === "Pending").sort((a, b) => a.name.localeCompare(b.name));
    return [...active, ...pending];
  }, [searchQuery, filter]);

  const activeCount = mockMembers.filter((m) => m.status === "Active").length;
  const pendingCount = mockMembers.filter((m) => m.status === "Pending").length;


  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ fontFamily: f }}>

        {/* ── Page header ─────────────────────────────────────── */}
        <h1 style={{ fontSize: isMobile ? 24 : 20, fontWeight: 700, color: ws.heading, margin: 0, fontFamily: f }}>Members</h1>
        <p style={{ fontSize: isMobile ? 14 : 13, color: ws.secondary, margin: "4px 0 14px", fontFamily: f }}>
          {`Manage members and access for your organization. ${activeCount} member${activeCount !== 1 ? "s" : ""} \u00b7 ${pendingCount} pending`}
        </p>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-end", marginBottom: 20 }}>
          <button
            onClick={() => setInviteOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0 14px", height: 36, borderRadius: 8,
              border: `1px solid ${ws.border}`, backgroundColor: ws.elevated,
              color: ws.primary, fontSize: 13, fontWeight: 500, fontFamily: f,
              cursor: "pointer", transition: "background-color 0.12s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.muted; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ws.elevated; }}
          >
            <UserPlus size={14} strokeWidth={2} />
            Add Member
          </button>
        </div>

        {/* ── Toolbar: Filter ───────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          {/* Filter dropdown (static for wireframe) */}
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              height: 40, padding: "0 12px", borderRadius: 8,
              border: `1px solid ${ws.border}`, backgroundColor: ws.surface,
              fontSize: 13, fontFamily: f, color: ws.secondary, cursor: "pointer",
              position: "relative",
            }}
            onClick={() => {
              const options: FilterOption[] = ["All members", "Admins", "Members", "Pending"];
              const idx = options.indexOf(filter);
              setFilter(options[(idx + 1) % options.length]);
            }}
          >
            <ListFilter size={14} color={ws.muted_text} />
            <span>{filter}</span>
            <ChevronDown size={14} color={ws.muted_text} />
          </div>
        </div>

        {/* ── Content area ────────────────────────────────────── */}
        <div style={{ display: "flex" }}>
          <div style={{
            flex: 1, minWidth: 0,
            marginRight: isDesktop && panelOpen ? 576 : 0,
            transition: `margin-right 0.32s ${spring}`,
          }}>
            {/* Card */}
            <div style={{
              borderRadius: 14, border: `1px solid ${ws.border}`,
              backgroundColor: ws.surface, overflow: "hidden",
            }}>
              {filteredMembers.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center", fontSize: 13, color: ws.muted_text }}>
                  No members found.
                </div>
              ) : (
                filteredMembers.map((member, i) => {
                  const isPending = member.status === "Pending";
                  const isSelected = member.id === selectedId;
                  const color = avatarColors[i % avatarColors.length];
                  const memberTeams = mockTeams.filter(
                    (t) => t.members.some((tm) => tm.id === member.id)
                  );
                  const teamCount = memberTeams.length;

                  return (
                    <div
                      key={member.id}
                      onClick={() => handleRowClick(member.id)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: isMobile ? "14px 16px" : "8px 16px",
                        borderBottom: i < filteredMembers.length - 1 ? `1px solid ${ws.border}` : "none",
                        cursor: "pointer",
                        transition: "background-color 0.1s",
                        backgroundColor: isSelected ? ws.elevated : ws.surface,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = ws.hoverBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isSelected ? ws.elevated : ws.surface;
                      }}
                    >
                      {/* Left: avatar + name + teams */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                        {/* Avatar */}
                        {isPending ? (
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            border: `2px dashed ${color}`, opacity: 0.5,
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color }}>{member.initials}</span>
                          </div>
                        ) : (
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%", backgroundColor: color,
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#FFF" }}>{member.initials}</span>
                          </div>
                        )}

                        {/* Name */}
                        <span style={{
                          fontSize: 13, fontWeight: 500,
                          color: isPending ? ws.muted_text : ws.body,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {member.name}
                        </span>

                        {/* Team count or pending info */}
                        {isPending ? (
                          <span style={{ fontSize: 12, color: ws.muted_text, flexShrink: 0 }}>
                            Invited {daysAgo(member.joinedAt)}d ago
                          </span>
                        ) : teamCount > 0 ? (
                          <span style={{ fontSize: 12, color: ws.muted_text, flexShrink: 0 }}>
                            {teamCount} team{teamCount !== 1 ? "s" : ""}
                          </span>
                        ) : null}
                      </div>

                      {/* Right: pending tag + chevron */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {isPending && (
                          <span style={{
                            fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 4,
                            backgroundColor: ws.muted, color: ws.muted_text,
                          }}>
                            Pending
                          </span>
                        )}
                        <ChevronRight size={14} color={ws.disabled} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Backdrop overlay ────────────────────────────────────── */}
      <div
        onClick={handleClosePanel}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.25)",
          opacity: panelOpen ? 1 : 0,
          pointerEvents: panelOpen ? "auto" : "none",
          transition: `opacity 0.24s ${spring}`,
          zIndex: 9,
        }}
      />

      {/* ── Detail panel (bottom sheet on mobile, side panel on desktop/tablet) ── */}
      <div data-members-panel style={{
        position: "fixed",
        ...(isMobile
          ? {
              bottom: 0, left: 0, right: 0,
              height: "90vh",
              transform: panelOpen ? "translateY(0)" : "translateY(100%)",
            }
          : {
              top: 80,
              right: isDesktop ? 32 : 20,
              width: isDesktop ? 560 : "min(560px, calc(100vw - 260px))",
              height: "calc(100vh - 100px)",
              transform: panelOpen ? "translateX(0)" : "translateX(calc(100% + 40px))",
            }),
        opacity: panelOpen ? 1 : 0,
        transition: `transform 0.32s ${spring}, opacity 0.24s ${spring}`,
        pointerEvents: panelOpen ? "auto" : "none",
        zIndex: 10,
      }}>
        <div style={{
          width: "100%", height: "100%",
          borderRadius: isMobile ? "20px 20px 0 0" : 14,
          backgroundColor: ws.surface,
          border: isMobile ? "none" : `1px solid ${ws.border}`,
          boxShadow: isMobile
            ? "0 -4px 24px rgba(0,0,0,0.12)"
            : "0 4px 16px -4px rgba(0,0,0,0.08), 0 1px 4px -1px rgba(0,0,0,0.04)",
          overflow: "hidden",
          display: "flex", flexDirection: "column" as const,
        }}>
          {/* Drag handle (mobile only) */}
          {isMobile && (
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: ws.disabled }} />
            </div>
          )}
          <div style={{ flex: 1, overflow: "hidden", opacity: panelFading ? 0 : 1, transition: "opacity 0.2s ease" }}>
            {renderedMember && renderedMember.status === "Pending" && (
              <PendingMemberPanel
                member={renderedMember}
                memberIndex={mockMembers.findIndex((m) => m.id === renderedMember.id)}
                onClose={handleClosePanel}
              />
            )}
            {renderedMember && renderedMember.status !== "Pending" && (
              <MemberDetailPanel
                member={renderedMember}
                memberIndex={mockMembers.findIndex((m) => m.id === renderedMember.id)}
                onClose={handleClosePanel}
              />
            )}
          </div>
        </div>
      </div>

      <InviteUserModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
}
