import { useState, useEffect, useMemo, useRef } from "react";
import {
  X, CaretRight, CaretDown, Check,
} from "@phosphor-icons/react";
import { useLayoutContext } from "@/modules/settings/components/SettingsLayout";
import { mockMembers, mockTeams } from "@/modules/settings/data/mockData";
import type { Member } from "@/modules/settings/types";
import InviteUserModal from "./InviteUserModal";
import BulkImportModal from "./BulkImportModal";
import { useBreakpoint } from "@/shared/hooks/useBreakpoint";
import TeamPicker from "../TeamPicker";
import { ws, f } from "@/shared/utils/contentTokens";
import { ShimmerBar, AnimatedCheck, AnimatedCheckMuted, FilterChip, ListRow, SearchBar, Card } from "@/shared/components/settings";

const spring = "cubic-bezier(0.22, 1, 0.36, 1)";

const GLOBAL_CSS = `
  @keyframes members-spring-in {
    from { opacity: 0; transform: translateY(-8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes members-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  [data-members-panel] *::-webkit-scrollbar { width: 0; display: none; }
  [data-members-panel] * { scrollbar-width: none; }
`;

/* ── Filter types ─────────────────────────────────────────────── */

type FilterOption = "All" | "Active" | "Pending" | "Admins" | "Members";

const filterChips: FilterOption[] = ["All", "Active", "Pending", "Admins", "Members"];

/* ── Helpers ──────────────────────────────────────────────────── */

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatJoined(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getTeamsForMember(member: Member) {
  return mockTeams.filter(
    (t) => t.members.some((tm) => tm.id === member.id)
  );
}

/* ── PageSkeleton ────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div style={{ fontFamily: f }}>
      {/* Title */}
      <ShimmerBar width={100} height={20} mb={8} />
      <ShimmerBar width={340} height={13} mb={18} />

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
        {[40, 55, 60, 55, 65].map((w, i) => <ShimmerBar key={i} width={w} height={26} delay={i * 60} />)}
      </div>

      {/* Section label */}
      <ShimmerBar width={60} height={10} mb={12} />

      {/* User rows */}
      <div style={{ borderRadius: 14, border: `1px solid ${ws.border}`, overflow: "hidden", backgroundColor: ws.surface }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < 4 ? `1px solid ${ws.divider}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ShimmerBar width={100 + i * 12} height={13} delay={i * 60} />
              <ShimmerBar width={140 + i * 8} height={11} delay={i * 60} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShimmerBar width={60} height={11} delay={i * 60} />
              <ShimmerBar width={14} height={14} delay={i * 60} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Split Invite Button (collapsed state for panel-open + mobile) ── */

function SplitInviteButton({ onInvite, onBulk }: { onInvite: () => void; onBulk: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ display: "flex", height: 30, borderRadius: 8, overflow: "hidden" }}>
        <button
          onClick={onInvite}
          style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 10px", border: "none", backgroundColor: ws.primary, color: ws.onPrimary, fontSize: 11, fontWeight: 600, fontFamily: f, cursor: "pointer" }}
        >
          Invite
        </button>
        <div style={{ width: 1, backgroundColor: ws.primaryDark }} />
        <button
          onClick={() => setOpen(!open)}
          style={{ display: "flex", alignItems: "center", padding: "0 6px", border: "none", backgroundColor: ws.primary, color: ws.onPrimary, cursor: "pointer" }}
        >
          <CaretRight size={12} weight="bold" style={{ transform: "rotate(90deg)" }} />
        </button>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: 34, right: 0, width: 160,
          backgroundColor: ws.surface, border: `1px solid ${ws.border}`, borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)", overflow: "hidden", zIndex: 20,
        }}>
          <div
            onClick={() => { onInvite(); setOpen(false); }}
            style={{ padding: "8px 12px", fontSize: 12, fontFamily: f, color: ws.body, cursor: "pointer", transition: "background-color 0.1s" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            Quick invite
          </div>
          <div
            onClick={() => { onBulk(); setOpen(false); }}
            style={{ padding: "8px 12px", fontSize: 12, fontFamily: f, color: ws.body, cursor: "pointer", borderTop: `1px solid ${ws.divider}`, transition: "background-color 0.1s" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            Bulk import
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Active User Detail Panel ─────────────────────────────────── */

type FlashState = null | "deactivateConfirm" | "deactivatedFlash" | "roleConfirm" | "roleFlash";

/* ── Panel Header (shared across all panel variants) ────────── */

function PanelHeader({ member, meta, onClose }: { member: Member; meta: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 20px 16px", flexShrink: 0, borderBottom: `1px solid ${ws.divider}` }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: ws.elevated, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: ws.secondary, fontFamily: f }}>{member.initials}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: ws.heading, fontFamily: f }}>{member.status === "Pending" ? member.email : member.name}</span>
          {member.status !== "Pending" && <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>{member.email}</span>}
          <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>{meta}</span>
        </div>
      </div>
      <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: ws.muted_text, display: "flex", alignItems: "center" }}>
        <X size={16} />
      </button>
    </div>
  );
}

/* ── Flash screen (shared) ────────────────────────────────── */

function FlashScreen({ member, onClose, icon, title, subtitle }: { member: Member; onClose: () => void; icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: f }}>
      <PanelHeader member={member} meta="" onClose={onClose} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40 }}>
        {icon}
        <span style={{ fontSize: 14, fontWeight: 500, color: ws.heading, fontFamily: f, textAlign: "center" }}>{title}</span>
        {subtitle && <span style={{ fontSize: 13, color: ws.secondary, fontFamily: f, textAlign: "center" }}>{subtitle}</span>}
      </div>
    </div>
  );
}

/* ── Active User Panel ────────────────────────────────────── */

function ActiveUserPanel({
  member,
  onClose,
}: {
  member: Member;
  onClose: () => void;
}) {
  const memberTeams = getTeamsForMember(member);
  const [addedTeamIds, setAddedTeamIds] = useState<string[]>(memberTeams.map(t => t.id));
  const [flowState, setFlowState] = useState<FlashState>(null);
  const [removedFlashMsg, setRemovedFlashMsg] = useState<string | null>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const teams = getTeamsForMember(member);
    setAddedTeamIds(teams.map(t => t.id));
    setFlowState(null);
    setRoleDropdownOpen(false);
  }, [member.id]);

  useEffect(() => {
    if (!roleDropdownOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (roleContainerRef.current && !roleContainerRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [roleDropdownOpen]);

  const handleAddTeam = (teamId: string) => {
    setAddedTeamIds(prev => [...prev, teamId]);
  };

  const handleRemoveTeam = (teamId: string) => {
    const team = mockTeams.find(t => t.id === teamId);
    setAddedTeamIds(prev => prev.filter(id => id !== teamId));
    if (team) {
      setRemovedFlashMsg(`Removed from ${team.name}`);
      setTimeout(() => setRemovedFlashMsg(null), 1500);
    }
  };

  const handleDeactivate = () => {
    setFlowState("deactivatedFlash");
    setTimeout(() => onClose(), 1500);
  };

  const isAdmin = member.role === "Super Admin" || member.role === "Org Admin";
  const newRole = isAdmin ? "Member" : "Admin";

  if (flowState === "deactivatedFlash") {
    return <FlashScreen member={member} onClose={onClose} icon={<AnimatedCheckMuted />} title="User deactivated" subtitle="Removed from all teams and workers" />;
  }

  if (flowState === "roleFlash") {
    return <FlashScreen member={member} onClose={onClose} icon={<AnimatedCheck />} title={`Role updated to ${newRole}`} />;
  }

  if (flowState === "roleConfirm") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: f }}>
        <PanelHeader member={member} meta={`${member.role} · Active · Joined ${formatJoined(member.joinedAt)}`} onClose={onClose} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 40px" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: ws.heading, fontFamily: f, textAlign: "center" }}>Change role to {newRole}?</span>
          <span style={{ fontSize: 13, color: ws.secondary, fontFamily: f, textAlign: "center", lineHeight: 1.5 }}>
            {newRole === "Admin" ? "Admins can manage members, teams, and organization settings." : "Members can use Workers and view dashboards."}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setFlowState(null)}
              style={{ height: 34, borderRadius: 8, border: `1px solid ${ws.border}`, backgroundColor: "transparent", color: ws.secondary, fontSize: 12, fontWeight: 500, fontFamily: f, cursor: "pointer", padding: "0 16px", transition: "background-color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              Cancel
            </button>
            <button
              onClick={() => { setFlowState("roleFlash"); setTimeout(() => setFlowState(null), 1500); }}
              style={{ height: 34, borderRadius: 8, border: "none", backgroundColor: ws.primary, color: ws.onPrimary, fontSize: 12, fontWeight: 500, fontFamily: f, cursor: "pointer", padding: "0 16px", transition: "background-color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.primaryHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ws.primary; }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (flowState === "deactivateConfirm") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: f }}>
        <PanelHeader member={member} meta={`${member.role} · Active · Joined ${formatJoined(member.joinedAt)}`} onClose={onClose} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 40px" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: ws.heading, fontFamily: f, textAlign: "center" }}>Deactivate {member.name}?</span>
          <span style={{ fontSize: 13, color: ws.secondary, fontFamily: f, textAlign: "center", lineHeight: 1.5 }}>This will immediately revoke access to Genie and remove them from all teams.</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setFlowState(null)}
              style={{ height: 34, borderRadius: 8, border: `1px solid ${ws.border}`, backgroundColor: "transparent", color: ws.secondary, fontSize: 12, fontWeight: 500, fontFamily: f, cursor: "pointer", padding: "0 16px", transition: "background-color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeactivate}
              style={{ height: 34, borderRadius: 8, border: "none", backgroundColor: ws.error, color: ws.onPrimary, fontSize: 12, fontWeight: 500, fontFamily: f, cursor: "pointer", padding: "0 16px", transition: "background-color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.errorTextHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ws.error; }}
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>
    );
  }

  const meta = `${member.role} · Active · Joined ${formatJoined(member.joinedAt)}`;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: f }}>
      <PanelHeader member={member} meta={meta} onClose={onClose} />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Role */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, fontFamily: f }}>Role</span>
            <div ref={roleContainerRef} style={{ position: "relative" }}>
              <div onClick={() => setRoleDropdownOpen(!roleDropdownOpen)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 36, padding: "0 12px", borderRadius: 8, border: `1px solid ${ws.border}`, backgroundColor: ws.surface, cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = ws.muted_text; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ws.border; }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: ws.body, fontFamily: f }}>{isAdmin ? "Admin" : "Member"}</span>
                <CaretDown size={14} color={ws.muted_text} />
              </div>
              {roleDropdownOpen && (
                <div style={{
                  position: "absolute", left: 0, right: 0, marginTop: 4,
                  backgroundColor: ws.surface, border: `1px solid ${ws.border}`,
                  borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  overflow: "hidden", zIndex: 10,
                }}>
                  {["Member", "Org Admin"].map((role) => {
                    const isCurrent = (isAdmin && role === "Org Admin") || (!isAdmin && role === "Member");
                    return (
                      <div
                        key={role}
                        onClick={() => {
                          if (!isCurrent) {
                            setRoleDropdownOpen(false);
                            setFlowState("roleConfirm");
                          }
                        }}
                        onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = ws.elevated; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                        style={{
                          height: 36, display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "0 12px", cursor: isCurrent ? "default" : "pointer",
                          backgroundColor: "transparent", transition: "background-color 0.15s",
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: isCurrent ? 500 : 400, color: isCurrent ? ws.primary : ws.body, fontFamily: f }}>{role}</span>
                        {isCurrent && <Check size={14} color={ws.primary} weight="bold" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Teams */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, fontFamily: f }}>Teams ({addedTeamIds.length})</span>
            {removedFlashMsg && (
              <div style={{ fontSize: 12, color: ws.muted_text, fontFamily: f, padding: "6px 12px", borderRadius: 6, backgroundColor: ws.elevated, animation: "members-fade-in 150ms ease-out" }}>
                {removedFlashMsg}
              </div>
            )}
            <TeamPicker
              selectedIds={addedTeamIds}
              onAdd={handleAddTeam}
              onRemove={handleRemoveTeam}
              confirmActions
            />
          </div>
        </div>
      </div>

      {/* Footer: deactivate */}
      <div style={{ padding: "16px 20px", borderTop: `1px solid ${ws.divider}`, flexShrink: 0, textAlign: "center" }}>
        <span
          onClick={() => setFlowState("deactivateConfirm")}
          style={{ fontSize: 12, fontWeight: 500, color: ws.error, cursor: "pointer", fontFamily: f, transition: "color 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = ws.errorTextHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = ws.error; }}
        >
          Deactivate user
        </span>
      </div>
    </div>
  );
}

/* ── Deactivated User Panel ───────────────────────────────── */

function DeactivatedUserPanel({ member, onClose }: { member: Member; onClose: () => void }) {
  const [flashState, setFlashState] = useState<"reactivatedFlash" | null>(null);

  useEffect(() => { setFlashState(null); }, [member.id]);

  if (flashState === "reactivatedFlash") {
    return <FlashScreen member={member} onClose={onClose} icon={<AnimatedCheck />} title="User reactivated" />;
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: f }}>
      <PanelHeader member={member} meta={`Deactivated · Last active ${formatJoined(member.joinedAt)}`} onClose={onClose} />
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {([
            ["Last role", (member.role === "Super Admin" || member.role === "Org Admin") ? "Admin" : "Member"],
            ["Deactivated", formatJoined(member.joinedAt)],
            ["Last active", formatJoined(member.joinedAt)],
            ["Was in", member.teams.length > 0 ? member.teams.join(", ") : "No teams"],
          ]).map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, fontFamily: f }}>{label}</span>
              <span style={{ fontSize: 13, color: ws.body, fontFamily: f }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Footer: reactivate */}
      <div style={{ padding: "12px 20px 16px", borderTop: `1px solid ${ws.divider}`, flexShrink: 0, display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => { setFlashState("reactivatedFlash"); setTimeout(() => onClose(), 1500); }}
          style={{ height: 34, borderRadius: 8, border: "none", backgroundColor: ws.primary, color: ws.onPrimary, fontSize: 13, fontWeight: 600, fontFamily: f, cursor: "pointer", padding: "0 20px" }}
        >
          Reactivate User
        </button>
      </div>
    </div>
  );
}

/* ── Pending User Detail Panel ────────────────────────────────── */

type PendingFlash = null | "cancelledFlash" | "resentFlash";

function PendingUserPanel({
  member,
  onClose,
}: {
  member: Member;
  onClose: () => void;
}) {
  const invitedDays = daysAgo(member.joinedAt);
  const [flashState, setFlashState] = useState<PendingFlash>(null);

  useEffect(() => { setFlashState(null); }, [member.id]);

  const handleResend = () => {
    setFlashState("resentFlash");
    setTimeout(() => setFlashState(null), 1500);
  };

  const handleCancel = () => {
    setFlashState("cancelledFlash");
    setTimeout(() => onClose(), 1500);
  };

  if (flashState === "cancelledFlash") {
    return <FlashScreen member={member} onClose={onClose} icon={<AnimatedCheckMuted />} title="Invite revoked" subtitle={member.email} />;
  }
  if (flashState === "resentFlash") {
    return <FlashScreen member={member} onClose={onClose} icon={<AnimatedCheck />} title="Invite resent" subtitle={member.email} />;
  }

  const meta = `Invited as ${member.role} · Pending · ${invitedDays}d ago`;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: f }}>
      <PanelHeader member={member} meta={meta} onClose={onClose} />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["Role", member.role],
            ["Invited", `${invitedDays} days ago`],
            ["Expires", invitedDays > 25 ? "Expired" : `In ${30 - invitedDays} days`],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, fontFamily: f }}>{label}</span>
              <span style={{ fontSize: 13, color: label === "Expires" && invitedDays > 25 ? ws.error : label === "Expires" ? ws.warning : ws.body, fontWeight: label === "Expires" ? 500 : 400, fontFamily: f }}>{value}</span>
            </div>
          ))}
        </div>
        {/* Spacer pushes revoke to bottom */}
        <div style={{ flex: 1 }} />
        {/* Revoke link in body, not footer */}
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <span
            onClick={handleCancel}
            style={{ fontSize: 12, fontWeight: 500, color: ws.error, cursor: "pointer", fontFamily: f, transition: "color 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = ws.errorTextHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = ws.error; }}
          >
            Revoke invite
          </span>
        </div>
      </div>

      {/* Footer: resend button only */}
      <div style={{ padding: "12px 20px 16px", borderTop: `1px solid ${ws.divider}`, flexShrink: 0, display: "flex", justifyContent: "center" }}>
        <button
          onClick={handleResend}
          style={{ height: 34, borderRadius: 8, border: "none", backgroundColor: ws.primary, color: ws.onPrimary, fontSize: 13, fontWeight: 600, fontFamily: f, cursor: "pointer", padding: "0 20px" }}
        >
          Resend Invite
        </button>
      </div>
    </div>
  );
}

/* ── Main UsersTab ──────────────────────────────────────────── */

export default function UsersTab() {
  const bp = useBreakpoint();
  const isDesktop = bp === "desktop";
  const isMobile = bp === "mobile";
  const { searchQuery, setSearchQuery } = useLayoutContext();
  const [filter, setFilter] = useState<FilterOption>("All");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  /* Panel state — same pattern as AppsTab */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelFading, setPanelFading] = useState(false);
  const [renderedMember, setRenderedMember] = useState<Member | null>(null);

  const selectedMember = mockMembers.find((m) => m.id === selectedId) ?? null;
  const panelOpen = selectedMember !== null;

  /* Keep rendered member alive during close animation */
  useEffect(() => {
    if (selectedMember) setRenderedMember(selectedMember);
  }, [selectedMember]);

  useEffect(() => {
    if (!panelOpen && renderedMember) {
      const t = setTimeout(() => setRenderedMember(null), 320);
      return () => clearTimeout(t);
    }
  }, [panelOpen, renderedMember]);

  /* Simulate initial page load */
  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

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

      if (filter === "Active") return m.status === "Active";
      if (filter === "Pending") return m.status === "Pending";
      if (filter === "Admins") return (m.role === "Super Admin" || m.role === "Org Admin") && m.status === "Active";
      if (filter === "Members") return m.role === "Member" && m.status === "Active";
      return true;
    });

    const active = list.filter((m) => m.status === "Active").sort((a, b) => a.name.localeCompare(b.name));
    const pending = list.filter((m) => m.status === "Pending").sort((a, b) => a.name.localeCompare(b.name));
    const deactivated = list.filter((m) => m.status === "Deactivated").sort((a, b) => a.name.localeCompare(b.name));
    return [...active, ...pending, ...deactivated];
  }, [searchQuery, filter]);

  const activeCount = mockMembers.filter((m) => m.status === "Active").length;
  const pendingCount = mockMembers.filter((m) => m.status === "Pending").length;

  if (pageLoading) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <PageSkeleton />
    </>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ fontFamily: f }}>
        {/* ── Content area (everything inside compressing div) ── */}
        <div style={{ display: "flex" }}>
          <div style={{
            flex: 1, minWidth: 0,
            marginRight: isDesktop && panelOpen ? 496 : 0,
            transition: `margin-right 0.32s ${spring}`,
          }}>
            {/* Page header */}
            <h1 style={{ fontSize: isMobile ? 24 : 20, fontWeight: 700, color: ws.heading, margin: 0, fontFamily: f }}>Users</h1>
            <p style={{ fontSize: isMobile ? 14 : 13, color: ws.secondary, margin: "4px 0 0", fontFamily: f }}>
              Manage users and access for your organization. {activeCount} user{activeCount !== 1 ? "s" : ""} &middot; {pendingCount} pending
            </p>

            <div style={{ margin: "14px 0" }}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search members..."
                variant="prominent"
              />
            </div>

            {/* Filter chips + Invite button */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 16, flexWrap: "wrap" }}>
              {filterChips.map((chip) => (
                <FilterChip key={chip} label={chip} active={filter === chip} onClick={() => setFilter(chip)} isMobile={isMobile} borderRadius={13} />
              ))}

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Action buttons — collapse to split button when panel open or mobile */}
              {panelOpen || isMobile ? (
                <SplitInviteButton onInvite={() => setInviteOpen(true)} onBulk={() => setBulkOpen(true)} />
              ) : (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => setBulkOpen(true)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      height: 30, padding: "0 12px", borderRadius: 8,
                      border: `1px solid ${ws.border}`, backgroundColor: "transparent",
                      color: ws.body, fontSize: 11, fontWeight: 500, fontFamily: f,
                      cursor: "pointer", transition: "background-color 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    Bulk Import
                  </button>
                  <button
                    onClick={() => setInviteOpen(true)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      height: 30, padding: "0 12px", borderRadius: 8,
                      border: "none", backgroundColor: ws.primary,
                      color: ws.onPrimary, fontSize: 11, fontWeight: 600, fontFamily: f,
                      cursor: "pointer", transition: "background-color 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.primaryHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ws.primary; }}
                  >
                    Invite User
                  </button>
                </div>
              )}
            </div>
            {/* Single card */}
            <Card>
              {filteredMembers.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center", fontSize: 13, color: ws.muted_text, fontFamily: f }}>
                  No users found.
                </div>
              ) : (
                filteredMembers.map((member, i) => {
                  const isPending = member.status === "Pending";
                  const isDeactivated = member.status === "Deactivated";
                  const isSelected = member.id === selectedId;
                  const isAdmin = member.role === "Super Admin" || member.role === "Org Admin";

                  return (
                    <ListRow key={member.id} onClick={() => handleRowClick(member.id)} selected={isSelected} last={i === filteredMembers.length - 1} height={isMobile ? 52 : 48} padding={isMobile ? "0 14px" : "0 16px"} style={isPending ? { opacity: 0.7 } : isDeactivated ? { opacity: 0.5 } : undefined}>
                      {/* Left side */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                        {isPending ? (
                          <span style={{ fontSize: isMobile ? 14 : 13, fontWeight: 500, color: ws.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: f }}>
                            {member.email}
                          </span>
                        ) : (
                          <>
                            <div style={{ width: isMobile ? 32 : 28, height: isMobile ? 32 : 28, borderRadius: isMobile ? 16 : 14, backgroundColor: ws.elevated, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ fontSize: isMobile ? 11 : 10, fontWeight: 600, color: ws.secondary, fontFamily: f }}>{member.initials}</span>
                            </div>
                            <span style={{ fontSize: isMobile ? 14 : 13, fontWeight: 500, color: isDeactivated ? ws.muted_text : ws.heading, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: f }}>
                              {member.name}
                            </span>
                            {!isMobile && (
                              <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexShrink: 1, minWidth: 0 }}>
                                {member.email}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Right side */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 12 }}>
                        {isPending && (
                          <span style={{ display: "inline-flex", padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 600, backgroundColor: ws.warningBg, color: ws.warningFg }}>
                            Pending
                          </span>
                        )}
                        {isDeactivated && (
                          <span style={{ fontSize: isMobile ? 12 : 11, color: ws.muted_text, fontFamily: f }}>Deactivated</span>
                        )}
                        {!isPending && !isDeactivated && (
                          <span style={{ fontSize: isMobile ? 12 : 11, fontWeight: isAdmin ? 500 : 400, color: isAdmin ? ws.primary : ws.muted_text, fontFamily: f }}>
                            {isAdmin ? "Admin" : "Member"}
                          </span>
                        )}
                        <CaretRight size={isMobile ? 16 : 14} color={ws.disabled} />
                      </div>
                    </ListRow>
                  );
                })
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* ── Backdrop overlay ────────────────────────────────────── */}
      {!isDesktop && (
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
      )}

      {/* ── Detail panel (side panel desktop/tablet, bottom sheet mobile) ── */}
      <div data-members-panel style={isMobile ? {
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        height: "90vh",
        transform: panelOpen ? "translateY(0)" : "translateY(100%)",
        opacity: panelOpen ? 1 : 0,
        transition: `transform 0.32s ${spring}, opacity 0.2s ${spring}`,
        pointerEvents: panelOpen ? "auto" : "none",
        zIndex: 10,
      } : {
        position: "fixed",
        top: 80,
        right: isDesktop ? 32 : 20,
        width: isDesktop ? 480 : "min(480px, calc(100vw - 260px))",
        height: "calc(100vh - 100px)",
        transform: panelOpen ? "translateX(0)" : "translateX(calc(100% + 40px))",
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
            ? "0 -4px 20px rgba(0,0,0,0.08)"
            : "0 4px 16px -4px rgba(0,0,0,0.08), 0 1px 4px -1px rgba(0,0,0,0.04)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Drag handle -- mobile only */}
          {isMobile && (
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px", flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: ws.disabled }} />
            </div>
          )}
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden", opacity: panelFading ? 0 : 1, transition: "opacity 0.2s ease" }}>
            {renderedMember && renderedMember.status === "Pending" && (
              <PendingUserPanel member={renderedMember} onClose={handleClosePanel} />
            )}
            {renderedMember && renderedMember.status === "Deactivated" && (
              <DeactivatedUserPanel member={renderedMember} onClose={handleClosePanel} />
            )}
            {renderedMember && renderedMember.status === "Active" && (
              <ActiveUserPanel member={renderedMember} onClose={handleClosePanel} />
            )}
          </div>
        </div>
      </div>

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInviteSent={(_email, _role, _teams) => { setInviteOpen(false); }}
      />
      <BulkImportModal open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </>
  );
}
