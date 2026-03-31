import { Suspense, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import { toast } from "sonner";
import SettingsSidebar from "@/modules/settings/components/SettingsSidebar";
import { useBreakpoint } from "@/shared/hooks/useBreakpoint";

const ws = {
  page: "#FAF8F5",
  primary: "#7C3AED",
};

const spring = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Subtle inline loader */
function ContentLoader() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: ws.page,
      }}
    >
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg, transparent 0%, ${ws.primary}40 50%, transparent 100%)`,
          animation: "genieShimmer 1.2s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes genieShimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function GenieLayout() {
  const bp = useBreakpoint();
  const isDesktop = bp === "desktop";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (for non-desktop)
  const location = useLocation();
  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [location.pathname, isDesktop]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Desktop: sidebar always visible in flow */}
      {isDesktop && <SettingsSidebar />}

      {/* Non-desktop: sidebar as overlay */}
      {!isDesktop && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.25)",
              opacity: sidebarOpen ? 1 : 0,
              pointerEvents: sidebarOpen ? "auto" : "none",
              transition: `opacity 0.24s ${spring}`,
              zIndex: 50,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: 260,
              height: "100vh",
              transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
              transition: `transform 0.28s ${spring}`,
              zIndex: 51,
              boxShadow: sidebarOpen ? "4px 0 20px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <SettingsSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Content area — no topbar, content fills the space */}
      <div
        data-genie-content
        data-sidebar-toggle={!isDesktop ? "true" : undefined}
        data-sidebar-open={sidebarOpen ? "true" : undefined}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: ws.page,
        }}
      >
        {/* Minimal nav for non-settings pages */}
        {!location.pathname.startsWith("/settings") && !isDesktop && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            flexShrink: 0,
            fontFamily: "Inter, sans-serif",
          }}>
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 6, display: "flex", alignItems: "center",
                justifyContent: "center", borderRadius: 6, outline: "none",
              }}
            >
              <Menu size={18} color="#44403C" />
            </button>
            <button
              onClick={() => toast("Notifications coming soon")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 4, display: "flex", alignItems: "center",
                justifyContent: "center", borderRadius: 6, outline: "none",
                position: "relative", opacity: 0.6,
              }}
            >
              <Bell size={16} color="#A8A29E" />
              <span style={{
                position: "absolute", top: 0, right: -1,
                width: 14, height: 14, borderRadius: "50%",
                backgroundColor: "#E11D48", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 8, fontWeight: 700, color: "white",
              }}>3</span>
            </button>
          </div>
        )}

        <Suspense fallback={<ContentLoader />}>
          <Outlet context={{ showHamburger: !isDesktop, onToggleSidebar: () => setSidebarOpen((p) => !p) }} />
        </Suspense>
      </div>
    </div>
  );
}
