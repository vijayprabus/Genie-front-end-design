import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { mockMembers, mockTeams } from "@/modules/settings/data/mockData";
import type { MemberRole } from "@/modules/settings/types";

const workerAccessData = [
  {
    id: "w1",
    name: "Email Summarizer",
    permission: "Full Access",
    team: "Engineering",
  },
  {
    id: "w2",
    name: "Code Reviewer",
    permission: "Full Access",
    team: "Engineering",
  },
  {
    id: "w3",
    name: "Support Agent",
    permission: "Read Only",
    team: "Customer Success",
  },
  {
    id: "w4",
    name: "Data Analyzer",
    permission: "Full Access",
    team: "Data Science",
  },
];

const getRoleBadgeClass = (role: MemberRole) => {
  switch (role) {
    case "Super Admin":
      return "border-foreground font-bold";
    case "Org Admin":
      return "border-foreground";
    default:
      return "border-border";
  }
};

export default function MemberProfileView() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();

  const member = mockMembers.find((m) => m.id === memberId);

  if (!member) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Member not found.</p>
        <Button
          variant="ghost"
          onClick={() => navigate("/settings/members")}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Members
        </Button>
      </div>
    );
  }

  const memberTeams = mockTeams.filter((t) =>
    member.teams.includes(t.name)
  );

  const memberWorkerAccess = workerAccessData.filter((w) =>
    member.teams.includes(w.team)
  );

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate("/settings/members")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Members
      </button>

      {/* Profile card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ backgroundColor: member.avatarColor }}
          >
            {member.initials}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">
              {member.name}
            </h2>
            <p className="text-sm text-muted-foreground">{member.email}</p>
            <div className="flex items-center gap-2 pt-1">
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs ${getRoleBadgeClass(
                  member.role
                )}`}
              >
                {member.role}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs">
                {member.status === "Active" ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full border border-yellow-500" />
                )}
                {member.status}
              </span>
              <span className="text-xs text-muted-foreground">
                Joined {member.joinedAt}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Your Teams section */}
      <div>
        <h3 className="mb-4 border-b pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Your Teams
        </h3>
        <div className="rounded-xl border border-border bg-card">
          {memberTeams.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Not assigned to any teams.
            </div>
          ) : (
            memberTeams.map((team, idx) => (
              <div
                key={team.id}
                className={`flex items-center justify-between px-4 py-4 transition-colors hover:bg-accent/50 ${
                  idx < memberTeams.length - 1
                    ? "border-b border-border"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: team.avatarColor }}
                  >
                    {team.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {team.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {team.memberCount} members · {team.workerCount} workers
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/settings/teams/${team.id}`)}
                  className="text-xs transition-all duration-150"
                >
                  View Team
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Worker Access section */}
      <div>
        <h3 className="mb-4 border-b pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Worker Access
        </h3>
        <div className="rounded-xl border border-border bg-card">
          {memberWorkerAccess.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No worker access configured.
            </div>
          ) : (
            memberWorkerAccess.map((worker, idx) => (
              <div
                key={worker.id}
                className={`flex items-center justify-between px-4 py-4 ${
                  idx < memberWorkerAccess.length - 1
                    ? "border-b border-border"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {worker.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      via {worker.team}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                  {worker.permission}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
