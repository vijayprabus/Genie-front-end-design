import { useState, useRef, useEffect, useCallback } from "react";
import { Outlet, useOutletContext, useLocation, NavLink } from "react-router-dom";
import { Bell, Menu, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useBreakpoint } from "@/shared/hooks/useBreakpoint";

export interface LayoutContext {
  showHamburger?: boolean;
  onToggleSidebar?: () => void;
  /** Global search query — replaces per-page search */
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function useLayoutContext(): LayoutContext {
  return useOutletContext<LayoutContext>() || { searchQuery: "", setSearchQuery: () => {} };
}

const f = "Inter, sans-serif";

const ws = {
  page: "#FAF8F5",
  surface: "#FFFDF9",
  body: "#44403C",
  secondary: "#78716C",
  muted_text: "#A8A29E",
  disabled: "#D6D3D1",
  border: "#E7E0D8",
  muted: "#F0EBE4",
  hoverBg: "#EDE8E3",
  error: "#E11D48",
  primary: "#7C3AED",
};

/** Map route segment to breadcrumb info */
function useBreadcrumb() {
  const { pathname } = useLocation();
  const segment = pathname.split("/")[2] || "general";

  const integrationPages = ["apps", "data", "models"];
  const isIntegration = integrationPages.includes(segment);

  const labelMap: Record<string, string> = {
    general: "General", members: "Members", teams: "Teams",
    notifications: "Notifications", billing: "Plans & Usage",
    api: "API Keys", models: "Models", integrations: "Integrations",
    apps: "Apps", data: "Data",
    "integrations-v2": "Integrations V2", "integrations-v3": "Integrations V3",
    "integrations-v4": "Integrations V4", "integrations-v5": "Integrations V5",
  };

  return {
    parent: isIntegration ? "Integrations" : "Settings",
    parentTo: isIntegration ? "/settings/apps" : "/settings/general",
    current: labelMap[segment] || segment,
  };
}

/** Placeholder text per page */
function useSearchPlaceholder() {
  const { pathname } = useLocation();
  const segment = pathname.split("/")[2] || "general";
  const map: Record<string, string> = {
    apps: "Search integrations...",
    data: "Search data sources...",
    models: "Search providers...",
    members: "Search members...",
    teams: "Search teams...",
    integrations: "Search integrations...",
  };
  return map[segment] || "Search...";
}

export default function SettingsLayout() {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const contentPad = bp === "desktop" ? "0 32px 28px" : bp === "tablet" ? "0 20px 24px" : "0 16px 20px";
  const hPad = bp === "desktop" ? 32 : bp === "tablet" ? 20 : 16;
  const parentCtx = useOutletContext<{ showHamburger?: boolean; onToggleSidebar?: () => void }>() || {};
  const { parent, parentTo, current } = useBreadcrumb();
  const placeholder = useSearchPlaceholder();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus input when expanded
  useEffect(() => {
    if (searchExpanded && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchExpanded]);

  // Clear search on route change
  const location = useLocation();
  useEffect(() => {
    setSearchQuery("");
    setSearchExpanded(false);
  }, [location.pathname]);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchExpanded(true);
      }
      if (e.key === "Escape" && searchExpanded) {
        setSearchExpanded(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchExpanded]);

  const collapseSearch = useCallback(() => {
    setSearchExpanded(false);
    setSearchQuery("");
  }, []);

  const ctx: LayoutContext = {
    ...parentCtx,
    searchQuery,
    setSearchQuery,
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: ws.page,
        fontFamily: f,
      }}
    >
      {/* Sticky nav row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `8px ${hPad}px`,
          flexShrink: 0,
          gap: 12,
          minHeight: 40,
        }}
      >
        {/* Left side */}
        {/* Mobile expanded: hide breadcrumb, show only hamburger */}
        {isMobile && searchExpanded ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            {parentCtx.showHamburger && (
              <button
                onClick={parentCtx.onToggleSidebar}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, outline: "none", flexShrink: 0 }}
              >
                <Menu size={18} color={ws.body} />
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            {parentCtx.showHamburger && (
              <button
                onClick={parentCtx.onToggleSidebar}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, outline: "none", flexShrink: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ws.hoverBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <Menu size={18} color={ws.body} />
              </button>
            )}
            {/* Desktop/Tablet: full breadcrumb. Mobile: parent only */}
            <NavLink
              to={parentTo}
              style={{ fontSize: isMobile ? 14 : 12, fontWeight: 500, color: ws.muted_text, textDecoration: "none", transition: "color 0.15s", whiteSpace: "nowrap" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = ws.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ws.muted_text; }}
            >
              {parent}
            </NavLink>
            {!isMobile && (
              <>
                <span style={{ fontSize: 12, color: ws.disabled }}>/</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: ws.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{current}</span>
              </>
            )}
          </div>
        )}

        {/* Right side: search + bell */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: searchExpanded ? 0 : undefined, flex: searchExpanded ? 1 : undefined, justifyContent: "flex-end" }}>
          {/* Search — collapsed pill or expanded bar */}
          {searchExpanded ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: isMobile ? "100%" : 320,
                height: 34,
                borderRadius: 10,
                backgroundColor: ws.surface,
                border: `1.5px solid ${ws.muted_text}`,
                padding: "0 12px",
                transition: "width 0.2s ease",
              }}
            >
              <Search size={15} color={ws.muted_text} style={{ flexShrink: 0 }} />
              <input
                ref={searchRef}
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: "none", outline: "none", backgroundColor: "transparent", fontSize: isMobile ? 15 : 13, fontFamily: f, color: ws.body }}
              />
              <button
                onClick={collapseSearch}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, outline: "none" }}
              >
                <X size={14} color={ws.muted_text} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchExpanded(true)}
              style={{
                height: isMobile ? 32 : 30,
                borderRadius: 8,
                border: isMobile ? "none" : `1px solid ${ws.border}`,
                backgroundColor: "transparent",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: isMobile ? "0 6px" : "0 10px",
                cursor: "pointer",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => { if (!isMobile) e.currentTarget.style.borderColor = ws.muted_text; }}
              onMouseLeave={(e) => { if (!isMobile) e.currentTarget.style.borderColor = ws.border; }}
            >
              <Search size={isMobile ? 18 : 14} color={ws.muted_text} />
              {!isMobile && <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>Search</span>}
              {!isMobile && <span style={{ backgroundColor: ws.muted, borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 600, color: ws.muted_text }}>/</span>}
            </button>
          )}

          {/* Bell — hidden when mobile search expanded */}
          {!(isMobile && searchExpanded) && (
            <button
              onClick={() => toast("Notifications coming soon")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 4, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 6, outline: "none", position: "relative",
                opacity: 0.6, transition: "opacity 0.15s", flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; }}
            >
              <Bell size={16} color={ws.muted_text} />
              <span style={{
                position: "absolute", top: 0, right: -1,
                width: 14, height: 14, borderRadius: "50%",
                backgroundColor: ws.error, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 8, fontWeight: 700, color: "white",
              }}>3</span>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable page content */}
      <div style={{ flex: 1, overflow: "auto", padding: contentPad }}>
        <Outlet context={ctx} />
      </div>
    </div>
  );
}
