import { useState, useMemo, useEffect } from "react";
import { Plus, ListFilter, ChevronDown, ChevronRight, X, Trash2, Bot, Users } from "lucide-react";
import { useLayoutContext } from "@/modules/settings/components/SettingsLayout";
import { mockTeams, mockMembers } from "@/modules/settings/data/mockData";
import type { Team } from "@/modules/settings/types/team";
import CreateTeamModal from "./CreateTeamModal";
import { useBreakpoint } from "@/shared/hooks/useBreakpoint";

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

const mockWorkers = [
  { id: "w1", name: "Brand Health Analyst", type: "Research" },
  { id: "w2", name: "Market Trend Scanner", type: "Intelligence" },
  { id: "w3", name: "Competitive Intel Bot", type: "Analysis" },
  { id: "w4", name: "Social Sentiment Tracker", type: "Monitoring" },
];

const GLOBAL_CSS = `
  [data-teams-panel] *::-webkit-scrollbar { width: 0; display: none; }
  [data-teams-panel] * { scrollbar-width: none; }
`;

/* ── TeamDetailPanel ─────────────────────────────────────────── */

function TeamDetailPanel({
  team,
  teamColor,
  onClose,
}: {
  team: Team;
  teamColor: string;
  onClose: () => void;
}) {
  const teamMembers = mockMembers.filter((m) =>
    team.members.some((tm) => tm.id === m.id)
  );
  const workerSlice = mockWorkers.slice(0, team.workerCount);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", fontFamily: f }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, backgroundColor: teamColor,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#FFF" }}>{team.initials}</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: ws.heading }}>{team.name}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 4,
              borderRadius: 6, color: ws.muted_text, transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = ws.heading)}
            onMouseLeave={(e) => (e.currentTarget.style.color = ws.muted_text)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Description */}
        {team.description && (
          <p style={{ fontSize: 13, color: ws.secondary, margin: "10px 0 0", lineHeight: 1.5 }}>
            {team.description}
          </p>
        )}

        {/* Stat line */}
        <p style={{ fontSize: 12, color: ws.muted_text, margin: "8px 0 0" }}>
          {team.memberCount} members · {team.workerCount} workers · Created Mar 2025
        </p>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 20px 20px" }}>
        {/* Members section */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, textTransform: "uppercase" as const, letterSpacing: 0.4 }}>
              Members
            </span>
            <button
              style={{
                background: "none", border: "none", cursor: "pointer", padding: "2px 8px",
                fontSize: 12, fontWeight: 500, color: ws.primary, fontFamily: f, borderRadius: 4,
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ws.primaryLight)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              + Add
            </button>
          </div>

          <div style={{ borderRadius: 10, border: `1px solid ${ws.border}`, overflow: "hidden" }}>
            {teamMembers.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", fontSize: 12, color: ws.muted_text }}>
                No members assigned
              </div>
            ) : (
              teamMembers.map((member, i) => (
                <div
                  key={member.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                    borderBottom: i < teamMembers.length - 1 ? `1px solid ${ws.divider}` : "none",
                    backgroundColor: ws.surface,
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", backgroundColor: member.avatarColor,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 600, color: "#FFF" }}>{member.initials}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: ws.body, flex: 1 }}>{member.name}</span>
                  <span style={{ fontSize: 12, color: ws.muted_text }}>
                    {member.role === "Super Admin" ? "Admin" : "Member"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Workers section */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, textTransform: "uppercase" as const, letterSpacing: 0.4 }}>
              Workers
            </span>
            <span style={{ fontSize: 10, color: ws.muted_text, fontStyle: "italic" }}>
              Members inherit access
            </span>
          </div>

          <div style={{ borderRadius: 10, border: `1px solid ${ws.border}`, overflow: "hidden" }}>
            {workerSlice.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", fontSize: 12, color: ws.muted_text }}>
                No workers assigned
              </div>
            ) : (
              workerSlice.map((worker, i) => (
                <div
                  key={worker.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                    borderBottom: i < workerSlice.length - 1 ? `1px solid ${ws.divider}` : "none",
                    backgroundColor: ws.surface,
                  }}
                >
                  <Bot size={14} style={{ color: ws.primary, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: ws.body, flex: 1 }}>{worker.name}</span>
                  <span style={{ fontSize: 12, color: ws.muted_text }}>{worker.type}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delete button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <button
            style={{
              display: "flex", alignItems: "center", gap: 6, height: 32,
              padding: "0 16px", borderRadius: 8,
              border: "1px solid #FECACA", backgroundColor: "transparent",
              color: ws.error, fontSize: 12, fontWeight: 500, fontFamily: f,
              cursor: "pointer", transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFF1F2")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Trash2 size={13} />
            Delete Team
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── TeamsTab ────────────────────────────────────────────────── */

export default function TeamsTab() {
  const bp = useBreakpoint();
  const isDesktop = bp === "desktop";
  const isMobile = bp === "mobile";
  const { searchQuery } = useLayoutContext();
  const [createOpen, setCreateOpen] = useState(false);

  /* Panel state — same pattern as IntegrationsTab */
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
    if (selectedTeam) {
      setRenderedTeam(selectedTeam);
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (!panelOpen && renderedTeam) {
      const t = setTimeout(() => setRenderedTeam(null), 320);
      return () => clearTimeout(t);
    }
  }, [panelOpen, renderedTeam]);

  /* Cross-fade when switching between teams */
  const handleRowClick = (id: string) => {
    if (id === selectedId) {
      setSelectedId(null);
      return;
    }
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

  /* Resolve color for a team by its index in mockTeams */
  const getTeamColor = (teamId: string) => {
    const idx = mockTeams.findIndex((t) => t.id === teamId);
    return avatarColors[(idx >= 0 ? idx : 0) % avatarColors.length];
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ fontFamily: f }}>
        {/* Page header */}
        <h1 style={{ fontSize: isMobile ? 24 : 20, fontWeight: 700, color: ws.heading, margin: 0, fontFamily: f }}>Teams</h1>
        <p style={{ fontSize: isMobile ? 14 : 13, color: ws.secondary, margin: "4px 0 14px", fontFamily: f }}>
          {`Organize members into teams and manage Worker access. ${mockTeams.length} teams`}
        </p>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-end", marginBottom: 14 }}>
          <button
            onClick={() => setCreateOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6, height: 36,
              padding: "0 16px", borderRadius: 8,
              backgroundColor: ws.elevated, border: `1px solid ${ws.border}`,
              color: ws.primary, fontSize: 13, fontWeight: 500, fontFamily: f,
              cursor: "pointer", transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ws.muted)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ws.elevated)}
          >
            <Plus size={14} strokeWidth={2} />
            Create Team
          </button>
        </div>

        {/* Content area */}
        <div style={{ display: "flex" }}>
          {/* Left: toolbar + list */}
          <div style={{
            flex: 1, minWidth: 0,
            marginRight: isDesktop && panelOpen ? 576 : 0,
            transition: `margin-right 0.32s ${spring}`,
          }}>
            {/* Toolbar: filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              {/* Filter dropdown */}
              <button
                style={{
                  display: "flex", alignItems: "center", gap: 6, height: 40,
                  padding: "0 14px", borderRadius: 10,
                  backgroundColor: ws.surface, border: `1px solid ${ws.border}`,
                  fontSize: 13, color: ws.secondary, fontFamily: f, cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ws.hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ws.surface)}
              >
                <ListFilter size={14} />
                All teams
                <ChevronDown size={13} />
              </button>
            </div>

            {/* Teams card */}
            <div style={{ backgroundColor: ws.surface, border: `1px solid ${ws.border}`, borderRadius: 14, overflow: "hidden" }}>
              {filteredTeams.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center", fontSize: 13, color: ws.muted_text }}>
                  No teams found.
                </div>
              ) : (
                filteredTeams.map((team, i) => {
                  const color = getTeamColor(team.id);
                  const isSelected = team.id === selectedId;
                  return (
                    <div
                      key={team.id}
                      onClick={() => handleRowClick(team.id)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: isMobile ? "14px 16px" : "10px 16px",
                        borderBottom: i < filteredTeams.length - 1 ? `1px solid ${ws.divider}` : "none",
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
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                        {/* Team avatar square */}
                        <div style={{
                          width: 28, height: 28, borderRadius: 8, backgroundColor: color,
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#FFF" }}>{team.initials}</span>
                        </div>
                        {/* Team name */}
                        <span style={{ fontSize: 13, fontWeight: 500, color: ws.heading }}>{team.name}</span>
                        {/* Members count */}
                        <span style={{ fontSize: 12, color: ws.muted_text, marginLeft: 4 }}>
                          {team.memberCount} members
                        </span>
                        {/* Workers count */}
                        <span style={{ fontSize: 12, color: ws.muted_text }}>
                          {team.workerCount} workers
                        </span>
                      </div>
                      <ChevronRight size={15} style={{ color: ws.disabled, flexShrink: 0 }} />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
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

      {/* Detail panel (bottom sheet on mobile, side panel on desktop/tablet) */}
      <div data-teams-panel style={{
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
            {renderedTeam && (
              <TeamDetailPanel
                team={renderedTeam}
                teamColor={getTeamColor(renderedTeam.id)}
                onClose={handleClosePanel}
              />
            )}
          </div>
        </div>
      </div>

      <CreateTeamModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
