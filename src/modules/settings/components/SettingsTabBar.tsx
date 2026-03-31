import { NavLink } from "react-router-dom";

const ws = {
  page: "#FAF8F5", surface: "#FFFDF9", sidebar: "#F5F0EB", muted: "#F0EBE4",
  elevated: "#F5F0EB", border: "#E7E0D8", divider: "#F0EBE4", inputBorder: "#D6D3D1",
  heading: "#292524", body: "#44403C", secondary: "#78716C", muted_text: "#A8A29E",
  disabled: "#D6D3D1", primary: "#7C3AED", primaryHover: "#6D28D9", primaryLight: "#EDE9FE",
  primaryDark: "#5B21B6", success: "#10B981", successFg: "#065F46", successBg: "#ECFDF5",
  warning: "#F59E0B", warningFg: "#92400E", warningBg: "#FFFBEB", error: "#E11D48",
  errorFg: "#9F1239", errorBg: "#FFF1F2", hoverBg: "#EDE8E3",
};

const tabs = [
  { label: "General", to: "/settings/general" },
  { label: "Members", to: "/settings/members" },
  { label: "Teams", to: "/settings/teams" },
  { label: "Notifications", to: "/settings/notifications" },
  { label: "Billing & Usage", to: "/settings/billing" },
  { label: "API", to: "/settings/api" },
];

export default function SettingsTabBar() {
  return (
    <nav
      className="flex"
      style={{
        borderBottom: `1px solid ${ws.border}`,
        fontFamily: "Inter, sans-serif",
      }}
      aria-label="Settings tabs"
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          style={({ isActive }) => ({
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: isActive ? 500 : 400,
            color: isActive ? ws.primary : ws.secondary,
            borderBottom: isActive ? `2px solid ${ws.primary}` : "2px solid transparent",
            marginBottom: -1,
            transition: "color 0.15s, border-color 0.15s",
            textDecoration: "none",
          })}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
