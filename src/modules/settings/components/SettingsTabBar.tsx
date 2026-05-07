import { NavLink } from "react-router-dom";
import { ws as baseWs } from "@/shared/utils/contentTokens";

const ws = { ...baseWs, sidebar: baseWs.sidebarZone };

const tabs = [
  { label: "General", to: "/settings/general" },
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
