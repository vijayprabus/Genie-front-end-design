import { useState } from "react";
import { toast } from "sonner";
import { mockMembers } from "@/modules/settings/data/mockData";
import { Search, Check, X } from "lucide-react";

const f = "Inter, system-ui, sans-serif";
const ws = {
  page: "#FAF8F5", surface: "#FFFDF9", elevated: "#F5F0EB", muted: "#F0EBE4",
  border: "#E7E0D8", divider: "#F0EBE4", inputBorder: "#D6D3D1",
  heading: "#44403C", body: "#44403C", secondary: "#78716C", muted_text: "#A8A29E",
  disabled: "#D6D3D1", primary: "#7C3AED", primaryLight: "#EDE9FE",
  error: "#E11D48", hoverBg: "#EDE8E3",
};
const avatarColors = ["#6D28D9", "#8B4F3F", "#9D4B6E", "#5A6E47", "#3D6B6B", "#7E4A6E"];

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTeamModal({
  open,
  onOpenChange,
}: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [nameFocused, setNameFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredCancel, setHoveredCancel] = useState(false);
  const [hoveredCreate, setHoveredCreate] = useState(false);

  const filteredMembers = mockMembers.filter(
    (m) =>
      !memberSearch ||
      m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const resetState = () => {
    setName("");
    setDescription("");
    setMemberSearch("");
    setSelectedMembers([]);
    setNameFocused(false);
    setDescFocused(false);
    setSearchFocused(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter a team name");
      return;
    }
    toast.success("Team created");
    resetState();
    onOpenChange(false);
  };

  const handleCancel = () => {
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
      onClick={handleCancel}
    >
      <div
        style={{
          width: 440,
          height: "fit-content",
          borderRadius: 14,
          backgroundColor: ws.surface,
          border: `1px solid ${ws.border}`,
          boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
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
          <div style={{ fontSize: 16, fontWeight: 700, color: ws.heading, fontFamily: f }}>
            Create Team
          </div>
          <div style={{ fontSize: 13, color: ws.secondary, fontFamily: f, marginTop: 4 }}>
            Set up a new team and add members.
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
          {/* Team name field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: ws.heading, fontFamily: f }}>
              Team name
            </label>
            <input
              type="text"
              placeholder="e.g. Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              style={{
                height: 40,
                borderRadius: 8,
                border: `1.5px solid ${nameFocused ? ws.primary : ws.border}`,
                backgroundColor: "#FFFFFF",
                padding: "0 14px",
                fontSize: 13,
                fontFamily: f,
                color: ws.body,
                outline: "none",
                transition: "border-color 0.15s",
              }}
            />
          </div>

          {/* Description field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: ws.heading, fontFamily: f }}>
              Description{" "}
              <span style={{ color: ws.muted_text }}>(optional)</span>
            </label>
            <textarea
              placeholder="What does this team do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setDescFocused(true)}
              onBlur={() => setDescFocused(false)}
              style={{
                height: 72,
                borderRadius: 8,
                border: `1.5px solid ${descFocused ? ws.primary : ws.border}`,
                backgroundColor: "#FFFFFF",
                padding: "10px 14px",
                fontSize: 13,
                fontFamily: f,
                color: ws.body,
                outline: "none",
                resize: "none",
                transition: "border-color 0.15s",
              }}
            />
          </div>

          {/* Add members */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: ws.heading, fontFamily: f }}>
              Add members
            </label>
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: ws.secondary,
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  width: "100%",
                  height: 36,
                  borderRadius: 8,
                  border: `1.5px solid ${searchFocused ? ws.primary : ws.border}`,
                  backgroundColor: "#FFFFFF",
                  padding: "0 14px 0 34px",
                  fontSize: 13,
                  fontFamily: f,
                  color: ws.body,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                maxHeight: 192,
                overflowY: "auto",
              }}
            >
              {filteredMembers.map((member, index) => {
                const isChecked = selectedMembers.includes(member.id);
                const color = avatarColors[index % 6];
                const initial = member.name.charAt(0);
                return (
                  <div
                    key={member.id}
                    onClick={() => handleMemberToggle(member.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isChecked ? ws.primary : "transparent",
                        border: isChecked ? "none" : `1.5px solid ${ws.inputBorder}`,
                      }}
                    >
                      {isChecked && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                    {/* Avatar */}
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundColor: color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#FFFFFF",
                          fontFamily: f,
                        }}
                      >
                        {initial}
                      </span>
                    </div>
                    {/* Name */}
                    <span style={{ fontSize: 13, color: ws.body, fontFamily: f }}>
                      {member.name}
                    </span>
                  </div>
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
            onClick={handleCancel}
            onMouseEnter={() => setHoveredCancel(true)}
            onMouseLeave={() => setHoveredCancel(false)}
            style={{
              height: 36,
              padding: "0 16px",
              borderRadius: 8,
              border: "none",
              backgroundColor: hoveredCancel ? ws.hoverBg : "transparent",
              cursor: "pointer",
              fontFamily: f,
              fontSize: 13,
              fontWeight: 500,
              color: ws.secondary,
              transition: "background-color 0.15s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            onMouseEnter={() => setHoveredCreate(true)}
            onMouseLeave={() => setHoveredCreate(false)}
            style={{
              height: 36,
              padding: "0 20px",
              borderRadius: 8,
              border: "none",
              backgroundColor: hoveredCreate ? "#6D28D9" : ws.primary,
              cursor: "pointer",
              fontFamily: f,
              fontSize: 13,
              fontWeight: 600,
              color: "#FFFFFF",
              transition: "background-color 0.15s",
            }}
          >
            Create Team
          </button>
        </div>
      </div>
    </div>
  );
}
