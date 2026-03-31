import { useState } from "react";
import { toast } from "sonner";
import { X, Check } from "lucide-react";
import { mockTeams } from "@/modules/settings/data/mockData";
import type { MemberRole } from "@/modules/settings/types";

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ws = {
  page: "#FAF8F5", surface: "#FFFDF9", elevated: "#F5F0EB", muted: "#F0EBE4",
  border: "#E7E0D8", divider: "#F0EBE4", inputBorder: "#D6D3D1",
  heading: "#44403C", body: "#44403C", secondary: "#78716C", muted_text: "#A8A29E",
  disabled: "#D6D3D1", primary: "#7C3AED", primaryLight: "#EDE9FE",
  error: "#E11D48", hoverBg: "#EDE8E3",
};

const avatarColors = ["#6D28D9", "#8B4F3F", "#9D4B6E", "#5A6E47", "#3D6B6B", "#7E4A6E"];

const f = "Inter, system-ui, sans-serif";

const roleOptions: {
  value: MemberRole;
  label: string;
  description: string;
}[] = [
  {
    value: "Member",
    label: "Member",
    description: "Can access assigned workers via team membership",
  },
  {
    value: "Org Admin",
    label: "Org Admin",
    description: "Can manage users, teams, and resources",
  },
];

export default function InviteUserModal({
  open,
  onOpenChange,
}: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<MemberRole>("Member");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [emailFocused, setEmailFocused] = useState(false);
  const [sendHovered, setSendHovered] = useState(false);

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const resetState = () => {
    setEmail("");
    setSelectedRole("Member");
    setSelectedTeams([]);
    setEmailFocused(false);
    setSendHovered(false);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    toast.success("Invitation sent");
    resetState();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: f,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: 440,
          height: "fit-content",
          borderRadius: 14,
          backgroundColor: ws.surface,
          border: `1px solid ${ws.border}`,
          boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${ws.border}`,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: ws.heading }}>
            Invite Member
          </div>
          <div style={{ fontSize: 13, color: ws.secondary, marginTop: 4 }}>
            Send an invitation to join your organization.
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Email field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: ws.heading,
              }}
            >
              Email address
            </label>
            <input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={{
                height: 40,
                borderRadius: 8,
                border: `1.5px solid ${emailFocused ? ws.primary : ws.border}`,
                backgroundColor: "#FFFFFF",
                padding: "0 14px",
                fontSize: 14,
                fontFamily: f,
                color: ws.body,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Role selection */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: ws.heading,
              }}
            >
              Role
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {roleOptions.map((option) => {
                const isSelected = selectedRole === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedRole(option.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: 8,
                      border: isSelected
                        ? `1.5px solid ${ws.primary}`
                        : `1px solid ${ws.border}`,
                      backgroundColor: isSelected ? "#FDFBFF" : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: f,
                      boxSizing: "border-box",
                      width: "100%",
                    }}
                  >
                    {/* Radio dot */}
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: `2px solid ${isSelected ? ws.primary : ws.disabled}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxSizing: "border-box",
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: ws.primary,
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: ws.heading,
                        }}
                      >
                        {option.label}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: ws.secondary,
                          marginTop: 2,
                        }}
                      >
                        {option.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Team checkboxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: ws.heading,
              }}
            >
              Add to teams (optional)
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {mockTeams.map((team, index) => {
                const isChecked = selectedTeams.includes(team.id);
                const teamColor = avatarColors[index % 6];
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => handleTeamToggle(team.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: isChecked
                        ? `1.5px solid ${ws.primary}`
                        : `1px solid ${ws.border}`,
                      backgroundColor: isChecked ? "#FDFBFF" : "transparent",
                      cursor: "pointer",
                      fontFamily: f,
                      boxSizing: "border-box",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        backgroundColor: isChecked ? ws.primary : "transparent",
                        border: isChecked
                          ? "none"
                          : `1.5px solid ${ws.disabled}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxSizing: "border-box",
                      }}
                    >
                      {isChecked && (
                        <Check
                          size={10}
                          color="#FFFFFF"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    {/* Team avatar */}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 5,
                        backgroundColor: teamColor,
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
                          color: "#FFFFFF",
                          lineHeight: 1,
                        }}
                      >
                        {team.initials}
                      </span>
                    </div>
                    {/* Team name */}
                    <span style={{ fontSize: 13, color: ws.heading }}>
                      {team.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px 20px",
            borderTop: `1px solid ${ws.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              height: 36,
              padding: "0 16px",
              fontSize: 13,
              fontWeight: 500,
              color: ws.secondary,
              cursor: "pointer",
              fontFamily: f,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            onMouseEnter={() => setSendHovered(true)}
            onMouseLeave={() => setSendHovered(false)}
            style={{
              backgroundColor: sendHovered ? "#6D28D9" : ws.primary,
              border: "none",
              height: 36,
              padding: "0 20px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#FFFFFF",
              cursor: "pointer",
              fontFamily: f,
            }}
          >
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}
