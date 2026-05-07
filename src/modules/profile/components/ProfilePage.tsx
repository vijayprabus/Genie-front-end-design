import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { ws as baseWs, f } from "@/shared/utils/contentTokens";
import { Card } from "@/shared/components/settings";

const ws = { ...baseWs, sidebar: baseWs.elevated };

const teams = [
  {
    initials: "NR",
    bg: ws.primary,
    name: "North Region",
    desc: "Sales and operations for North India \u00B7 12 members",
  },
  {
    initials: "AN",
    bg: ws.primary,
    name: "Analytics",
    desc: "Data science and business intelligence \u00B7 8 members",
  },
];

const workers = [
  { name: "Collections Specialist", via: "North Region", access: "Use" as const },
  { name: "Order Intake Worker", via: "North Region", access: "Configure" as const },
  { name: "KYC Verification Worker", via: "Analytics", access: "Use" as const },
  { name: "Business Analyst", via: "Analytics", access: "Use" as const },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);
  const [hoveredWorker, setHoveredWorker] = useState<number | null>(null);
  const [logoutHover, setLogoutHover] = useState(false);
  const [hoveredBadge, setHoveredBadge] = useState<number | null>(null);

  return (
      <div style={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden", fontFamily: f }}>
        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 28, backgroundColor: ws.page }}>
          {/* Page header */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: ws.heading }}>Profile</h1>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 400, color: ws.secondary }}>
              Your account in this organization.
            </p>
          </div>

          {/* Profile card */}
          <div style={{ marginTop: 16 }}>
          <Card>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Avatar */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: ws.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: ws.onPrimary }}>PA</span>
              </div>
              {/* Info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: ws.heading }}>{"Priya Anand"}</span>
                <span style={{ fontSize: 12, fontWeight: 400, color: ws.secondary }}>
                  priya@javis.tech
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      backgroundColor: ws.muted,
                      border: `1px solid ${ws.border}`,
                      fontSize: 10,
                      fontWeight: 500,
                      color: ws.body,
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    Org Admin
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 400, color: ws.muted_text }}>
                    Provisioned via Javis
                  </span>
                </div>
              </div>
            </div>
          </div>
          </Card>
          </div>

          {/* YOUR TEAMS */}
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: ws.muted_text,
                textTransform: "uppercase" as const,
                letterSpacing: 0.4,
                borderBottom: `1px solid ${ws.border}`,
                paddingBottom: 6,
              }}
            >
              YOUR TEAMS · 2
            </div>
            {teams.map((team, i) => (
              <div
                key={team.initials}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom: i < teams.length - 1 ? `1px solid ${ws.divider}` : "none",
                  cursor: "pointer",
                  backgroundColor: hoveredTeam === i ? ws.hoverBg : "transparent",
                  transition: "background-color 0.1s",
                }}
                onMouseEnter={() => setHoveredTeam(i)}
                onMouseLeave={() => setHoveredTeam(null)}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: team.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 600, color: ws.onPrimary }}>
                    {team.initials}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: ws.body }}>
                    {team.name}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 400, color: ws.muted_text }}>
                    {team.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* WORKER ACCESS */}
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: ws.muted_text,
                textTransform: "uppercase" as const,
                letterSpacing: 0.4,
                borderBottom: `1px solid ${ws.border}`,
                paddingBottom: 6,
              }}
            >
              WORKER ACCESS · 4
            </div>
            {workers.map((worker, i) => {
              const isConfigure = worker.access === "Configure";
              return (
                <div
                  key={worker.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: i < workers.length - 1 ? `1px solid ${ws.divider}` : "none",
                    backgroundColor: hoveredWorker === i ? ws.hoverBg : "transparent",
                    transition: "background-color 0.1s",
                  }}
                  onMouseEnter={() => setHoveredWorker(i)}
                  onMouseLeave={() => setHoveredWorker(null)}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: ws.body }}>
                      {worker.name}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 400, color: ws.muted_text }}>
                      via {worker.via}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      padding: "2px 8px",
                      borderRadius: 4,
                      cursor: "default",
                      transition: "opacity 0.1s",
                      opacity: hoveredBadge === i ? 0.8 : 1,
                      ...(isConfigure
                        ? { backgroundColor: ws.primaryLight, color: ws.primary }
                        : {
                            backgroundColor: ws.muted,
                            color: ws.secondary,
                            border: `1px solid ${ws.border}`,
                          }),
                    }}
                    onMouseEnter={() => setHoveredBadge(i)}
                    onMouseLeave={() => setHoveredBadge(null)}
                  >
                    {worker.access}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Log out button */}
          <button
            style={{
              marginTop: 24,
              display: "inline-flex",
              alignItems: "center",
              fontSize: 12,
              fontWeight: 500,
              color: logoutHover ? ws.errorTextHover : ws.secondary,
              border: `1px solid ${logoutHover ? ws.errorBorder : ws.border}`,
              padding: "6px 14px",
              borderRadius: 8,
              backgroundColor: logoutHover ? ws.errorBg : ws.surface,
              cursor: "pointer",
              fontFamily: f,
              transition: "all 0.15s",
            }}
            onMouseEnter={() => setLogoutHover(true)}
            onMouseLeave={() => setLogoutHover(false)}
            onClick={() => {
              toast("Logged out");
              navigate("/login");
            }}
          >
            <LogOut size={14} style={{ marginRight: 6 }} />
            Log out
          </button>
        </div>
      </div>
  );
}
