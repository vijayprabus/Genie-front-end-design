import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  X,
  Home,
  Sparkles,
  Briefcase,
  BookOpen,
  Bot,
  Users,
  Building2,
  LayoutGrid,
  Database,
  Cpu,
  Settings,
  MoreHorizontal,
  UserPlus,
  Plus,
  MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ws as baseWs, f } from "@/shared/utils/contentTokens";

/* ── Sidebar palette ─────────────────────────────────────────── */
const ws = {
  ...baseWs,
  sidebarBg:       baseWs.sidebarBg,
  settingsZone:    baseWs.sidebarZone,
  divider:         baseWs.sidebarDivider,
  body:            baseWs.sidebarBody,
  muted:           baseWs.muted_text,
  iconRest:        baseWs.sidebarIconRest,
  iconHover:       baseWs.sidebarIconHover,
  kbHint:          baseWs.sidebarKbHint,
  activeText:      baseWs.sidebarActiveText,
  activeIcon:      baseWs.sidebarActiveIcon,
  activeBg:        baseWs.activePillBg,
  activeHoverBg:   baseWs.activePillHover,
  hoverBg:         baseWs.hoverBg,
  focusRing:       baseWs.sidebarFocusRing,
  soonBg:          baseWs.sidebarHoverBg,
};

/* ── Nav item types ──────────────────────────────────────────── */
interface NavItemDef {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: string;
  shortcut?: string;
  hoverIcon?: LucideIcon;
  hoverTooltip?: string;
  hoverReveal?: boolean;
}

/* ── Group 1 — Workspace ─────────────────────────────────────── */
const workspaceItems: NavItemDef[] = [
  { to: "/home",         icon: Home,      label: "Home",         badge: "4" },
  { to: "/chat",         icon: Sparkles,  label: "Genie" },
  { to: "/roles",        icon: Briefcase, label: "Roles" },
  { to: "/instructions", icon: BookOpen,  label: "Instructions" },
  { to: "/workers",      icon: Bot,       label: "Workers" },
];

/* ── Group 2 — Access ────────────────────────────────────────── */
const accessItems: NavItemDef[] = [
  { to: "/settings/users", icon: Users,    label: "Users", hoverIcon: UserPlus, hoverTooltip: "Invite user" },
  { to: "/settings/teams", icon: Building2, label: "Teams", hoverIcon: Plus,    hoverTooltip: "Create team" },
];

/* ── Group 3 — Integrations ──────────────────────────────────── */
const integrationItems: NavItemDef[] = [
  { to: "/settings/apps",   icon: LayoutGrid, label: "Apps",   hoverReveal: true },
  { to: "/settings/data",   icon: Database,   label: "Data",   hoverReveal: true },
  { to: "/settings/models", icon: Cpu,        label: "Models", hoverReveal: true },
];

/* ── Scrollbar CSS ───────────────────────────────────────────── */
const SCROLLBAR_CSS = `
.genie-sidebar-scroll{scrollbar-width:thin;scrollbar-color:transparent transparent}
.genie-sidebar-scroll:hover{scrollbar-color:var(--ws-sidebar-scrollbar) transparent}
.genie-sidebar-scroll::-webkit-scrollbar{width:4px}
.genie-sidebar-scroll::-webkit-scrollbar-track{background:transparent}
.genie-sidebar-scroll::-webkit-scrollbar-thumb{background:transparent;border-radius:4px}
.genie-sidebar-scroll:hover::-webkit-scrollbar-thumb{background:var(--ws-sidebar-scrollbar)}
.genie-sidebar-scroll:hover::-webkit-scrollbar-thumb:hover{background:var(--ws-sidebar-scrollbar-hover)}
.genie-sidebar-navlink{outline:none}
.genie-sidebar-navlink:focus-visible .genie-sidebar-row{box-shadow:0 0 0 2px var(--ws-primary);border-radius:7px}
`;

/* ════════════════════════════════════════════════════════════════
   NavItem — single nav row with all 7 micro-interactions
   ══════════════════════════════════════════════════════════════ */
function NavItem({
  item,
  isActive,
  onHoveredChange,
  isHovered,
}: {
  item: NavItemDef;
  isActive: boolean;
  onHoveredChange: (h: boolean) => void;
  isHovered: boolean;
}) {
  const reduced = useReducedMotion();
  const springTransition = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 400, damping: 35 };
  const tapTransition = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 600, damping: 25 };

  return (
    <NavLink
      to={item.to}
      className="genie-sidebar-navlink"
      style={{ textDecoration: "none", display: "block", position: "relative" }}
      onMouseEnter={() => onHoveredChange(true)}
      onMouseLeave={() => onHoveredChange(false)}
    >
      {/* Micro-interaction #1 — sliding edge bar (layoutId morph) */}
      {isActive && (
        <motion.div
          layoutId="app-sidebar-active-bar"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: ws.primary,
            borderRadius: "0 2px 2px 0",
            zIndex: 2,
          }}
          transition={springTransition}
        />
      )}

      {/* Micro-interaction #3 — press spring (whileTap) */}
      <motion.div
        whileTap={reduced ? {} : { scale: 0.97 }}
        transition={tapTransition}
        style={{ position: "relative" }}
      >
        {/* Hover background (non-active only) */}
        {!isActive && isHovered && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 7,
              backgroundColor: ws.hoverBg,
            }}
          />
        )}

        <div
          className="genie-sidebar-row"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "0 10px 0 13px",
            height: 32,
            borderRadius: 7,
          }}
        >
          {/* Micro-interaction #2 — icon Y-nudge on hover */}
          <motion.div
            animate={
              reduced ? {} : { y: isHovered && !isActive ? -1 : 0 }
            }
            transition={reduced ? { duration: 0 } : { duration: 0.12, ease: "easeOut" }}
            style={{ flexShrink: 0, display: "flex", alignItems: "center" }}
          >
            <item.icon
              size={16}
              strokeWidth={isActive ? 2 : 1.75}
              color={isActive ? ws.activeIcon : isHovered ? ws.iconHover : ws.iconRest}
            />
          </motion.div>

          <span
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? ws.activeText : ws.body,
              fontFamily: f,
            }}
          >
            {item.label}
          </span>

          {/* Micro-interaction #4 — badge mount spring */}
          {item.badge && (
            <motion.span
              initial={reduced ? { scale: 1 } : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={
                reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 12 }
              }
              className="badge-idle-pulse"
              style={{
                backgroundColor: "#DCDCDF",
                color: "#52525B",
                fontSize: 9,
                fontWeight: 600,
                padding: "1px 7px",
                borderRadius: 8,
                flexShrink: 0,
                fontFamily: f,
              }}
            >
              {item.badge}
            </motion.span>
          )}

          {/* Hover-reveal icon (Users/Teams) */}
          {item.hoverIcon && (
            <HoverRevealIcon
              Icon={item.hoverIcon}
              tooltip={item.hoverTooltip}
              visible={isHovered}
              reduced={reduced ?? false}
            />
          )}

          {/* Micro-interaction #6 — DotsThree slide-in */}
          {item.hoverReveal && !item.badge && !item.hoverIcon && (
            <motion.span
              initial={{ x: 4, opacity: 0 }}
              animate={
                reduced
                  ? { x: 0, opacity: isHovered ? 1 : 0 }
                  : { x: isHovered ? 0 : 4, opacity: isHovered ? 1 : 0 }
              }
              transition={reduced ? { duration: 0 } : { duration: 0.12, ease: "easeOut" }}
              style={{ flexShrink: 0, display: "flex", alignItems: "center" }}
            >
              <MoreHorizontal size={14} strokeWidth={2} color={ws.muted} />
            </motion.span>
          )}
        </div>
      </motion.div>
    </NavLink>
  );
}

/* ════════════════════════════════════════════════════════════════
   HoverRevealIcon — slide-in action icon (#6) + tooltip (#5)
   No grey box; color shift only when icon itself is hovered.
   ══════════════════════════════════════════════════════════════ */
function HoverRevealIcon({
  Icon,
  tooltip,
  visible,
  reduced,
}: {
  Icon: LucideIcon;
  tooltip?: string;
  visible: boolean;
  reduced: boolean;
}) {
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {/* Micro-interaction #6 — slide-in */}
      <motion.div
        initial={{ x: 4, opacity: 0 }}
        animate={
          reduced
            ? { x: 0, opacity: visible ? 1 : 0 }
            : { x: visible ? 0 : 4, opacity: visible ? 1 : 0 }
        }
        transition={reduced ? { duration: 0 } : { duration: 0.12, ease: "easeOut" }}
      >
        <button
          onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); }}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <Icon
            size={15}
            strokeWidth={1.75}
            color={btnHovered ? "#52525B" : "#71717A"}
          />
        </button>
      </motion.div>

      {/* Micro-interaction #5 — tooltip Y-slide */}
      {tooltip && (
        <div
          className="sidebar-tooltip"
          data-show={btnHovered ? "true" : "false"}
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            right: "50%",
            transform: "translateX(50%)",
            backgroundColor: ws.sidebarTooltipBg,
            color: ws.sidebarTooltipText,
            fontSize: 10,
            fontWeight: 500,
            fontFamily: f,
            padding: "3px 8px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SettingsEntry — the single Settings row (below divider)
   ══════════════════════════════════════════════════════════════ */
function SettingsEntry({
  isActive,
  isHovered,
  onHoveredChange,
}: {
  isActive: boolean;
  isHovered: boolean;
  onHoveredChange: (h: boolean) => void;
}) {
  const reduced = useReducedMotion();
  const springTransition = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 400, damping: 35 };
  const tapTransition = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 600, damping: 25 };

  return (
    <NavLink
      to="/settings"
      className="genie-sidebar-navlink"
      style={{ textDecoration: "none", display: "block", position: "relative" }}
      onMouseEnter={() => onHoveredChange(true)}
      onMouseLeave={() => onHoveredChange(false)}
    >
      {isActive && (
        <motion.div
          layoutId="app-sidebar-active-bar"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: ws.primary,
            borderRadius: "0 2px 2px 0",
            zIndex: 2,
          }}
          transition={springTransition}
        />
      )}

      <motion.div
        whileTap={reduced ? {} : { scale: 0.97 }}
        transition={tapTransition}
        style={{ position: "relative" }}
      >
        {/* Hover background (non-active only) */}
        {!isActive && isHovered && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 7,
              backgroundColor: ws.hoverBg,
            }}
          />
        )}

        <div
          className="genie-sidebar-row"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "0 10px 0 13px",
            height: 32,
            borderRadius: 7,
          }}
        >
          <motion.div
            animate={reduced ? {} : { y: isHovered && !isActive ? -1 : 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.12, ease: "easeOut" }}
            style={{ flexShrink: 0, display: "flex", alignItems: "center" }}
          >
            <Settings
              size={16}
              strokeWidth={isActive ? 2 : 1.75}
              color={isActive ? ws.activeIcon : isHovered ? ws.iconHover : ws.iconRest}
            />
          </motion.div>

          <span
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? ws.activeText : ws.body,
              fontFamily: f,
            }}
          >
            Settings
          </span>

        </div>
      </motion.div>
    </NavLink>
  );
}

/* ════════════════════════════════════════════════════════════════
   NavGroup — renders an array of NavItems with spacing
   ══════════════════════════════════════════════════════════════ */
function NavGroup({
  items,
  location,
  hoveredItem,
  onHoveredChange,
}: {
  items: NavItemDef[];
  location: { pathname: string };
  hoveredItem: string | null;
  onHoveredChange: (to: string | null) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {items.map((item) => {
        const isActive =
          item.to === "/settings"
            ? location.pathname === "/settings" || location.pathname.startsWith("/settings/")
            : location.pathname === item.to || location.pathname.startsWith(item.to + "/");

        return (
          <NavItem
            key={item.to}
            item={item}
            isActive={isActive}
            isHovered={hoveredItem === item.to}
            onHoveredChange={(h) => onHoveredChange(h ? item.to : null)}
          />
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ProfileZone — bottom-anchored, single-line horizontal layout
   ══════════════════════════════════════════════════════════════ */
function ProfileZone() {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to="/profile"
      className="genie-sidebar-profile"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px",
        height: 36,
        borderTop: `1px solid ${ws.border}`,
        textDecoration: "none",
        transition: "background-color var(--dur-fast) ease-out",
        flexShrink: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Micro-interaction #7 — avatar ring on hover (22×22) */}
      <motion.div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          backgroundColor: ws.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: reduced
            ? "none"
            : `box-shadow var(--dur-mid) ease-out`,
          boxShadow: hovered ? `0 0 0 2px ${ws.primary}` : "none",
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 600, color: ws.onPrimary, fontFamily: f }}>
          PA
        </span>
      </motion.div>

      {/* Name — single line, NO secondary text below */}
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: ws.heading,
          flexShrink: 0,
          fontFamily: f,
        }}
      >
        Priya Anand
      </span>

      {/* Flex spacer */}
      <div style={{ flex: 1 }} />

      {/* Admin chip */}
      <span
        style={{
          padding: "1px 6px",
          borderRadius: 999,
          backgroundColor: ws.hoverBg,
          fontSize: 10,
          fontWeight: 500,
          color: ws.secondary,
          flexShrink: 0,
          fontFamily: f,
        }}
      >
        Admin
      </span>
    </NavLink>
  );
}

/* ════════════════════════════════════════════════════════════════
   BrandBar — 36px header, single-line horizontal layout
   ══════════════════════════════════════════════════════════════ */
function BrandBar({ onClose }: { onClose?: () => void }) {
  return (
    <div
      style={{
        padding: "0 12px",
        height: 36,
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      {/* Blue rounded-square icon with white chat icon inside */}
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          backgroundColor: ws.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <MessageCircle size={12} strokeWidth={2} color={ws.onPrimary} />
      </div>

      {/* Genie wordmark — single line */}
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: ws.heading,
          flexShrink: 0,
          fontFamily: f,
        }}
      >
        Genie
      </span>

      {/* Flex spacer pushes chip to right */}
      <div style={{ flex: 1 }} />

      {/* Marico chip — small rounded pill */}
      <span
        style={{
          padding: "1px 6px",
          borderRadius: 999,
          backgroundColor: ws.hoverBg,
          fontSize: 10,
          fontWeight: 500,
          color: ws.secondary,
          flexShrink: 0,
          fontFamily: f,
        }}
      >
        Marico
      </span>

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
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = ws.hoverBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <X size={18} color={ws.muted} />
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SettingsSidebar — root export
   ══════════════════════════════════════════════════════════════ */
export default function SettingsSidebar({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [settingsHovered, setSettingsHovered] = useState(false);

  const settingsActive =
    location.pathname === "/settings" ||
    (location.pathname.startsWith("/settings/") &&
      /* Don't match access/integration sub-paths as Settings active */
      !accessItems.some((i) => location.pathname.startsWith(i.to)) &&
      !integrationItems.some((i) => location.pathname.startsWith(i.to)));

  return (
    <>
      <style>{SCROLLBAR_CSS}</style>
      <aside
        style={{
          display: "flex",
          flexDirection: "column",
          width: onClose ? 260 : 220,
          flexShrink: 0,
          height: "100%",
          backgroundColor: ws.sidebarBg,
          borderRight: onClose ? "none" : ws.sidebarEdge,
          fontFamily: f,
          overflow: "hidden",
        }}
      >
        {/* Brand bar */}
        <BrandBar onClose={onClose} />

        {/* Scrollable nav area — no left/right padding here so bar can be left: 0 flush */}
        <div
          className="genie-sidebar-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0,
            paddingTop: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Nav content — no horizontal padding here; row content has 13px left pad */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Group 1 — Workspace */}
            <NavGroup
              items={workspaceItems}
              location={location}
              hoveredItem={hoveredItem}
              onHoveredChange={setHoveredItem}
            />

            {/* 16px spacing gap (Group 1 → Group 2) */}
            <div style={{ height: 16 }} />

            {/* Group 2 — Access */}
            <NavGroup
              items={accessItems}
              location={location}
              hoveredItem={hoveredItem}
              onHoveredChange={setHoveredItem}
            />

            {/* 16px spacing gap (Group 2 → Group 3) */}
            <div style={{ height: 16 }} />

            {/* Group 3 — Integrations */}
            <NavGroup
              items={integrationItems}
              location={location}
              hoveredItem={hoveredItem}
              onHoveredChange={setHoveredItem}
            />
          </div>

          {/* Decorative divider before Settings — full width, 12px inset each side */}
          <div style={{ height: 12 }} />
          <div style={{ height: 1, backgroundColor: ws.divider, margin: "0 12px" }} />
          <div style={{ height: 12 }} />

          {/* Settings entry — no wrapper padding; row content is padded */}
          <div>
            <SettingsEntry
              isActive={settingsActive}
              isHovered={settingsHovered}
              onHoveredChange={setSettingsHovered}
            />
          </div>

          {/* Flex spacer pushes profile to bottom */}
          <div style={{ flex: 1 }} />
        </div>

        {/* Profile zone — bottom-anchored */}
        <ProfileZone />
      </aside>
    </>
  );
}
