import { useState, useMemo, useEffect } from "react";
import {
  X, CaretRight, Plus, Trash,
  Robot,
} from "@phosphor-icons/react";
import { useLayoutContext } from "@/modules/settings/components/SettingsLayout";
import { mockTeams } from "@/modules/settings/data/mockData";
import type { Team } from "@/modules/settings/types/team";
import MemberPicker from "@/modules/settings/components/MemberPicker";
import CreateTeamModal from "./CreateTeamModal";
import { useBreakpoint } from "@/shared/hooks/useBreakpoint";
import { ws, f, spring } from "@/shared/utils/contentTokens";
import { ShimmerBar, AnimatedCheckMuted, ListRow, DetailPanelShell, Card } from "@/shared/components/settings";
import { Pencil, Check, Loader2 } from "lucide-react";

const mockWorkers = [
  { name: "Brand Health Analyst", type: "Research" },
  { name: "Market Trend Scanner", type: "Intelligence" },
  { name: "Competitive Intel Bot", type: "Analysis" },
  { name: "Social Sentiment Tracker", type: "Monitoring" },
];

const GLOBAL_CSS = `
  @keyframes teams-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes teams-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  [data-teams-panel] *::-webkit-scrollbar { width: 0; display: none; }
  [data-teams-panel] * { scrollbar-width: none; }
`;

/* ── PageSkeleton ────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div style={{ fontFamily: f }}>
      <ShimmerBar width={80} height={20} mb={8} />
      <ShimmerBar width={340} height={13} mb={18} />

      {/* Create button placeholder */}
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
        <ShimmerBar width={120} height={30} />
      </div>

      {/* Team rows */}
      <div style={{ borderRadius: 14, border: `1px solid ${ws.border}`, overflow: "hidden", backgroundColor: ws.surface }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 48, padding: "0 16px", borderBottom: i < 5 ? `1px solid ${ws.border}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShimmerBar width={28} height={28} delay={i * 60} />
              <ShimmerBar width={100 + i * 12} height={13} delay={i * 60} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShimmerBar width={120} height={11} delay={i * 60} />
              <ShimmerBar width={14} height={14} delay={i * 60} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── TeamDetailPanel ─────────────────────────────────────────── */

type FlashState = null | "deleteConfirm" | "deletedFlash";

function TeamDetailPanel({
  team,
  onClose,
}: {
  team: Team;
  onClose: () => void;
}) {
  const teamMemberIds = team.members.map((m) => m.id);
  const [memberIds, setMemberIds] = useState<string[]>(teamMemberIds);
  const [flowState, setFlowState] = useState<FlashState>(null);

  // Inline editing
  const [editingField, setEditingField] = useState<null | "name" | "desc">(null);
  const [editName, setEditName] = useState(team.name);
  const [editDesc, setEditDesc] = useState(team.description);
  const [hoveringField, setHoveringField] = useState<null | "name" | "desc">(null);
  const [saveState, setSaveState] = useState<Record<string, "saving" | "saved" | null>>({});

  const handleSaveField = (field: "name" | "desc") => {
    setSaveState(prev => ({ ...prev, [field]: "saving" }));
    setEditingField(null);
    // Simulate save
    setTimeout(() => {
      setSaveState(prev => ({ ...prev, [field]: "saved" }));
      setTimeout(() => {
        setSaveState(prev => ({ ...prev, [field]: null }));
      }, 1600);
    }, 500);
  };

  const handleCancelField = (field: "name" | "desc") => {
    setEditingField(null);
    if (field === "name") setEditName(team.name);
    if (field === "desc") setEditDesc(team.description);
  };

  // Reset all state when team changes
  useEffect(() => {
    const ids = team.members.map((m) => m.id);
    setMemberIds(ids);
    setFlowState(null);
    setEditingField(null);
    setEditName(team.name);
    setEditDesc(team.description);
    setHoveringField(null);
    setSaveState({});
  }, [team.id]);

  const workerSlice = mockWorkers.slice(0, team.workerCount);

  const handleAddMember = (id: string) => {
    setMemberIds((prev) => [...prev, id]);
  };

  const handleRemoveMember = (id: string) => {
    setMemberIds((prev) => prev.filter((mid) => mid !== id));
  };

  const handleDelete = () => {
    setFlowState("deletedFlash");
    setTimeout(() => onClose(), 1500);
  };

  // Deleted flash state
  if (flowState === "deletedFlash") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: f }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 16px", flexShrink: 0, borderBottom: `1px solid ${ws.divider}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, backgroundColor: team.avatarColor,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: ws.onPrimary }}>{team.initials}</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: ws.heading, fontFamily: f }}>{team.name}</span>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: ws.muted_text, display: "flex", alignItems: "center" }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40 }}>
          <AnimatedCheckMuted />
          <span style={{ fontSize: 16, fontWeight: 600, color: ws.heading, fontFamily: f, textAlign: "center" }}>Team deleted</span>
        </div>
      </div>
    );
  }

  // Delete confirm — full panel screen
  if (flowState === "deleteConfirm") {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: f }}>
        {/* Header (same as normal) */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 20px 16px", flexShrink: 0, borderBottom: `1px solid ${ws.divider}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, backgroundColor: team.avatarColor,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: ws.onPrimary }}>{team.initials}</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: ws.heading, fontFamily: f }}>{team.name}</span>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: ws.muted_text, display: "flex", alignItems: "center", flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Centered confirmation */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 40px" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: ws.heading, fontFamily: f, textAlign: "center" }}>
            Delete {team.name}?
          </span>
          <span style={{ fontSize: 13, color: ws.secondary, fontFamily: f, textAlign: "center", lineHeight: 1.5 }}>
            All members will lose access to this team. {team.workerCount} {team.workerCount === 1 ? "worker" : "workers"} will be unassigned.
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setFlowState(null)}
              style={{
                height: 34, borderRadius: 8, border: `1px solid ${ws.border}`,
                backgroundColor: "transparent", color: ws.secondary,
                fontSize: 12, fontWeight: 500, fontFamily: f, cursor: "pointer", padding: "0 16px",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              style={{
                height: 34, borderRadius: 8, border: "none",
                backgroundColor: ws.error, color: ws.onPrimary,
                fontSize: 12, fontWeight: 500, fontFamily: f, cursor: "pointer", padding: "0 16px",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.errorTextHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ws.error; }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: f }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 20px 16px", flexShrink: 0, borderBottom: `1px solid ${ws.divider}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
          {/* Team badge */}
          <div style={{
            width: 28, height: 28, borderRadius: 7, backgroundColor: team.avatarColor,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: ws.onPrimary }}>{team.initials}</span>
          </div>

          {editingField === "name" ? (
            <span style={{ display: "inline-grid", alignItems: "center", minWidth: 40 }}>
              <span style={{ gridArea: "1/1", visibility: "hidden", whiteSpace: "pre", fontSize: 16, fontWeight: 700, fontFamily: f }}>{editName || " "}</span>
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && editName.trim()) handleSaveField("name");
                  if (e.key === "Escape") handleCancelField("name");
                }}
                onBlur={() => { if (editName.trim()) handleSaveField("name"); else handleCancelField("name"); }}
                style={{
                  gridArea: "1/1", width: "100%", border: "none",
                  background: "transparent", fontSize: 16, fontWeight: 700,
                  color: ws.heading, fontFamily: f, outline: "none",
                }}
              />
            </span>
          ) : (
            <span
              onMouseEnter={() => setHoveringField("name")}
              onMouseLeave={() => setHoveringField(null)}
              onClick={() => { if (!saveState.name) { setEditingField("name"); setEditName(team.name); } }}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, cursor: saveState.name ? "default" : "text" }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: ws.heading, fontFamily: f, whiteSpace: "nowrap" }}>
                {team.name}
              </span>
              {saveState.name === "saving" && (
                <Loader2 size={12} color={ws.primary} style={{ animation: "teams-spin 1s linear infinite", flexShrink: 0 }} />
              )}
              {saveState.name === "saved" && (
                <Check size={13} color={ws.success} strokeWidth={2.5} style={{ flexShrink: 0 }} />
              )}
              {hoveringField === "name" && !saveState.name && (
                <Pencil size={11} color={ws.muted_text} style={{ flexShrink: 0, opacity: 0.4 }} />
              )}
            </span>
          )}
        </div>
        <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: ws.muted_text, display: "flex", alignItems: "center", flexShrink: 0 }}>
          <X size={16} />
        </button>
      </div>

      {/* ── Body (scrollable) ─────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Info section — inline editable */}
        <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Description — inline editable */}
          {editingField === "desc" ? (
            <textarea
              autoFocus
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleSaveField("desc"); }
                if (e.key === "Escape") handleCancelField("desc");
              }}
              onBlur={() => handleSaveField("desc")}
              style={{
                width: "100%", border: "none",
                padding: 0, margin: 0, fontSize: 13, fontFamily: f,
                color: ws.secondary, outline: "none", resize: "none",
                backgroundColor: "transparent", lineHeight: 1.5,
                boxSizing: "border-box", minHeight: 20,
              }}
            />
          ) : team.description ? (
            <div
              onMouseEnter={() => setHoveringField("desc")}
              onMouseLeave={() => setHoveringField(null)}
              onClick={() => { if (!saveState.desc) { setEditingField("desc"); setEditDesc(team.description); } }}
              style={{ cursor: saveState.desc ? "default" : "text" }}
            >
              <p style={{ fontSize: 13, color: ws.secondary, margin: 0, lineHeight: 1.5, fontFamily: f, display: "inline" }}>
                {team.description}
              </p>
              {saveState.desc === "saving" && (
                <Loader2 size={11} color={ws.primary} style={{ animation: "teams-spin 1s linear infinite", display: "inline-block", verticalAlign: "middle", marginLeft: 6 }} />
              )}
              {saveState.desc === "saved" && (
                <Check size={12} color={ws.success} strokeWidth={2.5} style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 6 }} />
              )}
              {hoveringField === "desc" && !saveState.desc && (
                <Pencil size={11} color={ws.muted_text} style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 6, opacity: 0.4 }} />
              )}
            </div>
          ) : null}

          {/* Metadata */}
          <div style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>
            {memberIds.length} members · {team.workerCount} workers · Created Mar 2025
          </div>
        </div>

        {/* Members section */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, fontFamily: f, marginBottom: 10 }}>
            Members ({memberIds.length})
          </div>
          <MemberPicker
            selectedIds={memberIds}
            onAdd={handleAddMember}
            onRemove={handleRemoveMember}
            confirmActions
          />
        </div>

        {/* Workers section */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, fontFamily: f, marginBottom: 10 }}>
            Workers ({workerSlice.length})
          </div>
          {workerSlice.length === 0 ? (
            <div style={{ fontSize: 12, color: ws.muted_text, fontFamily: f, padding: "8px 0" }}>
              No workers assigned
            </div>
          ) : (
            <div style={{ border: `1px solid ${ws.border}`, borderRadius: 10, overflow: "hidden" }}>
              {workerSlice.map((worker, i) => (
                <div
                  key={worker.name}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                    borderBottom: i < workerSlice.length - 1 ? `1px solid ${ws.divider}` : "none",
                    backgroundColor: ws.surface,
                  }}
                >
                  <Robot size={14} color={ws.primary} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: ws.body, flex: 1, fontFamily: f }}>{worker.name}</span>
                  <span style={{ fontSize: 10, color: ws.muted_text, fontFamily: f }}>{worker.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div style={{ padding: "16px 20px", borderTop: `1px solid ${ws.divider}`, flexShrink: 0, textAlign: "center" }}>
        <div
          onClick={() => setFlowState("deleteConfirm")}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: 12, fontWeight: 500, color: ws.error,
            cursor: "pointer", fontFamily: f, padding: "4px 0", transition: "color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = ws.errorTextHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = ws.error; }}
        >
          <Trash size={13} />
          Delete team
        </div>
      </div>
    </div>
  );
}

/* ── Main TeamsTab ──────────────────────────────────────────────── */

export default function TeamsTab() {
  const bp = useBreakpoint();
  const isDesktop = bp === "desktop";
  const isMobile = bp === "mobile";
  const { searchQuery } = useLayoutContext();
  const [createOpen, setCreateOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  /* Panel state — same pattern as UsersTab/AppsTab */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelFading, setPanelFading] = useState(false);
  const [renderedTeam, setRenderedTeam] = useState<Team | null>(null);

  const filteredTeams = useMemo(() => {
    if (!searchQuery) return mockTeams;
    const q = searchQuery.toLowerCase();
    return mockTeams.filter((team) => team.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const selectedTeam = mockTeams.find((t) => t.id === selectedId) ?? null;
  const panelOpen = selectedTeam !== null;

  /* Keep rendered team alive during close animation */
  useEffect(() => {
    if (selectedTeam) setRenderedTeam(selectedTeam);
  }, [selectedTeam]);

  useEffect(() => {
    if (!panelOpen && renderedTeam) {
      const t = setTimeout(() => setRenderedTeam(null), 320);
      return () => clearTimeout(t);
    }
  }, [panelOpen, renderedTeam]);

  /* Simulate initial page load */
  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  /* Cross-fade when switching between teams */
  const handleRowClick = (id: string) => {
    if (id === selectedId) { setSelectedId(null); return; }
    if (selectedId) {
      setPanelFading(true);
      setTimeout(() => {
        const nextTeam = mockTeams.find((t) => t.id === id) ?? null;
        if (nextTeam) setRenderedTeam(nextTeam);
        setSelectedId(id);
        requestAnimationFrame(() => setPanelFading(false));
      }, 200);
    } else {
      setSelectedId(id);
    }
  };

  const handleClosePanel = () => setSelectedId(null);

  const handleTeamCreated = (_name: string, _description: string, _memberIds: string[]) => {
    // In a real app, create the team here
    setCreateOpen(false);
  };

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
        {/* ── Content area ─────────────────────────────────────── */}
        <div style={{ display: "flex" }}>
          <div style={{
            flex: 1, minWidth: 0,
            marginRight: isDesktop && panelOpen ? 496 : 0,
            transition: `margin-right 0.32s ${spring}`,
          }}>
            {/* Title block */}
            <div style={{ marginBottom: 14 }}>
              <h1 style={{ fontSize: isMobile ? 24 : 20, fontWeight: 700, color: ws.heading, margin: 0, fontFamily: f }}>Teams</h1>
              <p style={{ fontSize: isMobile ? 14 : 13, color: ws.secondary, margin: "4px 0 0", fontFamily: f }}>
                Organize users into teams and manage Worker access. {mockTeams.length} teams
              </p>
            </div>

            {/* Toolbar row: Create Team button left-aligned */}
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
              <button
                onClick={() => setCreateOpen(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  height: 30, padding: "0 12px", borderRadius: 8,
                  border: `1px solid ${ws.border}`,
                  backgroundColor: "transparent",
                  color: ws.body, fontSize: 11, fontWeight: 500, fontFamily: f,
                  cursor: "pointer", transition: "background-color 0.15s, border-color 0.15s", flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.primaryLight; e.currentTarget.style.borderColor = ws.primary; e.currentTarget.style.color = ws.primary; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = ws.border; e.currentTarget.style.color = ws.body; }}
              >
                <Plus size={12} />
                Create Team
              </button>
            </div>

            {/* Teams list card */}
            <Card>
              {filteredTeams.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center", fontSize: 13, color: ws.muted_text, fontFamily: f }}>
                  No teams found.
                </div>
              ) : (
                filteredTeams.map((team, i) => {
                  const isSelected = team.id === selectedId;
                  return (
                    <ListRow key={team.id} onClick={() => handleRowClick(team.id)} selected={isSelected} last={i === filteredTeams.length - 1} height={48} padding="0 16px" style={{ gap: 10, justifyContent: "flex-start" }}>
                      {/* Team badge using avatarColor from mock data */}
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, backgroundColor: team.avatarColor,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: ws.onPrimary }}>{team.initials}</span>
                      </div>
                      {/* Team name */}
                      <span style={{
                        fontSize: 13, fontWeight: 500, color: ws.heading, fontFamily: f,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        flex: 1,
                      }}>
                        {team.name}
                      </span>
                      {/* Right: stats + chevron */}
                      <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f, flexShrink: 0 }}>
                        {team.memberCount} members &middot; {team.workerCount} {team.workerCount === 1 ? "worker" : "workers"}
                      </span>
                      <CaretRight size={14} color={ws.disabled} style={{ flexShrink: 0 }} />
                    </ListRow>
                  );
                })
              )}
            </Card>
          </div>
        </div>
      </div>

      <DetailPanelShell open={panelOpen} onClose={handleClosePanel} isMobile={isMobile} isDesktop={isDesktop} mobileHeight="90vh" dataAttr="teams-panel" fading={panelFading}>
        {renderedTeam && <TeamDetailPanel team={renderedTeam} onClose={handleClosePanel} />}
      </DetailPanelShell>

      <CreateTeamModal open={createOpen} onClose={() => setCreateOpen(false)} onTeamCreated={handleTeamCreated} />
    </>
  );
}
