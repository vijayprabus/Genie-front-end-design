import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { mockTeams, mockMembers } from "@/modules/settings/data/mockData";
import type { MemberRole } from "@/modules/settings/types";

type InnerTab = "members" | "resources" | "settings";

const hardcodedWorkers = [
  { id: "w1", name: "Email Summarizer", permission: "Full Access" },
  { id: "w2", name: "Code Reviewer", permission: "Full Access" },
  { id: "w3", name: "Support Agent", permission: "Read Only" },
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

export default function TeamDetailView() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<InnerTab>("members");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const team = mockTeams.find((t) => t.id === teamId);

  if (!team) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Team not found.</p>
        <Button
          variant="ghost"
          onClick={() => navigate("/settings/teams")}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams
        </Button>
      </div>
    );
  }

  // Find full member objects for team members
  const teamMemberDetails = team.members
    .map((tm) => mockMembers.find((m) => m.id === tm.id))
    .filter(Boolean);

  const tabs: { label: string; value: InnerTab }[] = [
    { label: "Members", value: "members" },
    { label: "Resources", value: "resources" },
    { label: "Settings", value: "settings" },
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate("/settings/teams")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Teams
      </button>

      {/* Team header card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ backgroundColor: team.avatarColor }}
          >
            {team.initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{team.name}</h2>
            <p className="text-sm text-muted-foreground">
              {team.description}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {team.memberCount} members · {team.workerCount} workers
            </p>
          </div>
        </div>
      </div>

      {/* Inner tabs */}
      <div>
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                activeTab === tab.value
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pt-4">
          {/* Members tab content */}
          {activeTab === "members" && (
            <div className="rounded-xl border border-border bg-card">
              {teamMemberDetails.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No members in this team.
                </div>
              ) : (
                teamMemberDetails.map((member, idx) => {
                  if (!member) return null;
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between px-4 py-4 transition-colors hover:bg-accent/50 ${
                        idx < teamMemberDetails.length - 1
                          ? "border-b border-border"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
                          style={{
                            backgroundColor: member.avatarColor,
                          }}
                        >
                          {member.initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs ${getRoleBadgeClass(
                            member.role
                          )}`}
                        >
                          {member.role}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground transition-all duration-150 hover:text-destructive"
                          onClick={() =>
                            toast("Member removed from team")
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Resources tab content */}
          {activeTab === "resources" && (
            <div className="rounded-xl border border-border bg-card">
              {hardcodedWorkers.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No workers assigned.
                </div>
              ) : (
                hardcodedWorkers.map((worker, idx) => (
                  <div
                    key={worker.id}
                    className={`flex items-center justify-between px-4 py-4 ${
                      idx < hardcodedWorkers.length - 1
                        ? "border-b border-border"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {worker.name}
                      </span>
                    </div>
                    <select
                      defaultValue={worker.permission}
                      onChange={() =>
                        toast.success("Permission updated")
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="Full Access">Full Access</option>
                      <option value="Read Only">Read Only</option>
                      <option value="No Access">No Access</option>
                    </select>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Settings tab content */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Team name
                    </label>
                    <Input
                      placeholder={team.name}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="transition-all duration-150"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Description
                    </label>
                    <textarea
                      placeholder={team.description}
                      value={editDescription}
                      onChange={(e) =>
                        setEditDescription(e.target.value)
                      }
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-150 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                  <Button
                    onClick={() => toast.success("Team settings saved")}
                    className="transition-all duration-150 hover:scale-[1.02]"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="rounded-xl border border-destructive/30 bg-card p-6">
                <h4 className="text-sm font-semibold text-destructive">
                  Danger Zone
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Deleting this team will remove all member associations and
                  worker assignments. This action cannot be undone.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-destructive/50 text-destructive transition-all duration-150 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    toast("Team deleted");
                    navigate("/settings/teams");
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Team
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
