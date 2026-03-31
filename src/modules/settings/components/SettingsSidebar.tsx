import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Sparkles,
  Briefcase,
  Bot,
  Plug,
  Users,
  Building2,
  Settings,
  Bell,
  CreditCard,
  KeyRound,
  Webhook,
  Cpu,
  AppWindow,
  Database,
  X,
} from "lucide-react";
import GenieLogo from "./GenieLogo";

const f = "Inter, sans-serif";

// Warm Stone palette
const ws = {
  sidebar: "#F5F0EB",
  surface: "#FFFDF9",
  page: "#FAF8F5",
  border: "#E7E0D8",
  divider: "#F0EBE4",
  heading: "#292524",
  body: "#44403C",
  secondary: "#78716C",
  muted: "#A8A29E",
  disabled: "#D6D3D1",
  primary: "#7C3AED",
  primaryHover: "#6D28D9",
  primaryLight: "#EDE9FE",
  primaryDark: "#5B21B6",
  hoverBg: "#EDE8E3",
};

const appNavItems = [
  { to: "/home", icon: Home, label: "Home", badge: "4", disabled: false },
  { to: "", icon: Sparkles, label: "Genie", disabled: true },
  { to: "/roles", icon: Briefcase, label: "Roles", disabled: false },
  { to: "/workers", icon: Bot, label: "Workers", disabled: false },
];

interface SectionItem {
  to: string;
  icon: typeof Home;
  label: string;
  disabled?: boolean;
}

const settingsSections: { title: string; items: SectionItem[] }[] = [
  {
    title: "ACCESS MANAGEMENT",
    items: [
      { to: "/settings/members", icon: Users, label: "Users" },
      { to: "/settings/teams", icon: Building2, label: "Teams" },
    ],
  },
  {
    title: "INTEGRATIONS",
    items: [
      { to: "/settings/apps", icon: AppWindow, label: "Apps" },
      { to: "/settings/data", icon: Database, label: "Data" },
      { to: "/settings/models", icon: Cpu, label: "Models" },
    ],
  },
  {
    title: "CONFIGURATION",
    items: [
      { to: "/settings/general", icon: Settings, label: "General" },
      { to: "/settings/notifications", icon: Bell, label: "Notifications" },
    ],
  },
  {
    title: "BILLING",
    items: [
      { to: "/settings/billing", icon: CreditCard, label: "Plans & Usage" },
    ],
  },
  {
    title: "DEVELOPERS",
    items: [
      { to: "/settings/api", icon: KeyRound, label: "API Keys" },
      { to: "", icon: Webhook, label: "Webhooks", disabled: true },
    ],
  },
];

const sectionLabelStyle: React.CSSProperties = {
  padding: "14px 4px 4px 4px",
};

const sectionLabelTextStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 600,
  color: "#A8A29E",
  letterSpacing: 0.5,
  textTransform: "uppercase",
  fontFamily: f,
};

export default function SettingsSidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();

  return (
    <aside
      style={{
        display: "flex",
        flexDirection: "column",
        width: onClose ? 260 : 220,
        flexShrink: 0,
        height: "100%",
        backgroundColor: ws.surface,
        borderRight: onClose ? "none" : `1px solid ${ws.border}`,
        fontFamily: f,
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "0 14px",
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: `1px solid ${ws.border}`,
        }}
      >
        <GenieLogo size={22} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: ws.heading,
              letterSpacing: 0.3,
            }}
          >
            Genie
          </span>
          <span style={{ fontSize: 9, color: ws.muted }}>Marico</span>
        </div>
        {onClose && <div style={{ flex: 1 }} />}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              outline: "none",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <X size={18} color={ws.muted} />
          </button>
        )}
      </div>

      {/* App Navigation */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: 8,
        }}
      >
        {appNavItems.map((item) => {
          if (item.disabled) {
            return (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 12px",
                  borderRadius: 8,
                  cursor: "default",
                }}
              >
                <item.icon
                  size={18}
                  strokeWidth={1.5}
                  style={{ color: ws.body, flexShrink: 0 }}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 400,
                    color: ws.body,
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          }

          const active = location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.label}
              to={item.to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 12px",
                borderRadius: 8,
                textDecoration: "none",
                transition: "background-color 0.1s",
                backgroundColor: active ? ws.primaryLight : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  e.currentTarget.style.backgroundColor = ws.hoverBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = active
                  ? ws.primaryLight
                  : "transparent";
              }}
            >
              <item.icon
                size={18}
                strokeWidth={1.5}
                style={{
                  color: active ? ws.primary : ws.body,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  color: active ? ws.primary : ws.body,
                }}
              >
                {item.label}
              </span>
              {item.badge && (
                <span
                  style={{
                    backgroundColor: active ? ws.primary : ws.primaryLight,
                    color: active ? "#FFF" : ws.primary,
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "1px 6px",
                    borderRadius: 9999,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: ws.border, margin: "0 6px" }} />

      {/* Settings Sections */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0 8px",
          overflowY: "auto",
        }}
      >
        {settingsSections.map((section) => (
          <div key={section.title}>
            {/* Section Label */}
            <div style={sectionLabelStyle}>
              <span style={sectionLabelTextStyle}>{section.title}</span>
            </div>

            {/* Section Items */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {section.items.map((item) => {
                if (item.disabled) {
                  return (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "6px 12px",
                        borderRadius: 8,
                        cursor: "default",
                      }}
                    >
                      <item.icon
                        size={18}
                        strokeWidth={1.5}
                        style={{ color: ws.body, flexShrink: 0 }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          fontWeight: 400,
                          color: ws.body,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                }

                const active =
                  location.pathname === item.to ||
                  location.pathname.startsWith(item.to + "/");

                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "6px 12px",
                      borderRadius: 8,
                      textDecoration: "none",
                      transition: "background-color 0.1s",
                      backgroundColor: active
                        ? ws.primaryLight
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active)
                        e.currentTarget.style.backgroundColor = ws.hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = active
                        ? ws.primaryLight
                        : "transparent";
                    }}
                  >
                    <item.icon
                      size={18}
                      strokeWidth={1.5}
                      style={{
                        color: active ? ws.primary : ws.body,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: active ? 500 : 400,
                        color: active ? ws.primary : ws.body,
                      }}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User Profile */}
      <NavLink
        to="/profile"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 14px",
          textDecoration: "none",
          borderRadius: 8,
          transition: "background-color 0.1s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = ws.hoverBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: ws.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#FFF" }}>
            PA
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: ws.heading }}>
            Priya Anand
          </span>
          <span style={{ fontSize: 10, color: ws.secondary }}>Org Admin</span>
        </div>
      </NavLink>
    </aside>
  );
}
