import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  MessageSquare,
  BarChart3,
  Store,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils/cn.ts";
import { Button } from "@/shared/components/ui/button.tsx";
import { ScrollArea } from "@/shared/components/ui/scroll-area.tsx";
import { Separator } from "@/shared/components/ui/separator.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";
import { useAuthStore } from "@/modules/auth/store/authStore.ts";
import { useIsMobile } from "@/shared/hooks/use-mobile.tsx";

interface SubItem {
  id: string;
  label: string;
  path: string;
  requiredPermissions?: string[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  requiredPermissions?: string[];
  subItems?: SubItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    path: "/chat",
    requiredPermissions: ["chat"],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    path: "/analytics",
    requiredPermissions: ["analytics"],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: Store,
    requiredPermissions: ["marketplace"],
    subItems: [
      { id: "browse", label: "Browse", path: "/marketplace/browse" },
      { id: "agents", label: "Agents", path: "/marketplace/agents" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const toggleSubmenu = (id: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.requiredPermissions) return true;
    if (user?.permissions?.includes("admin")) return true;
    return item.requiredPermissions.some((p) => user?.permissions?.includes(p));
  });

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 px-4">
        <span className="text-lg font-semibold text-foreground">Genie Forge</span>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-3 py-2">
        <nav aria-label="Main navigation">
          <ul className="space-y-1" role="list">
            {visibleMenuItems.map((item) => (
              <li key={item.id}>
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/87 transition-colors hover:bg-accent touch-target-min",
                        location.pathname.startsWith(`/${item.id}`) && "bg-accent text-foreground",
                      )}
                      aria-expanded={expandedMenus.has(item.id)}
                    >
                      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {expandedMenus.has(item.id) ? (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                    {expandedMenus.has(item.id) && (
                      <ul className="ml-8 mt-1 space-y-1" role="list">
                        {item.subItems.map((sub) => (
                          <li key={sub.id}>
                            <NavLink
                              to={sub.path}
                              onClick={() => isMobile && setMobileOpen(false)}
                              className={({ isActive }) =>
                                cn(
                                  "block rounded-lg px-3 py-2 text-sm text-foreground/87 transition-colors hover:bg-accent touch-target-min",
                                  isActive && "bg-primary/10 font-medium text-primary",
                                )
                              }
                            >
                              {sub.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path!}
                    onClick={() => isMobile && setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/87 transition-colors hover:bg-accent touch-target-min",
                        isActive && "bg-primary/10 text-primary",
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>

      <Separator />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="truncate text-sm text-muted-foreground">
          {user?.name || "Guest"}
        </span>
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="fixed left-3 top-3 z-40 lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      )}

      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-sidebar text-sidebar-foreground transition-transform lg:relative lg:translate-x-0",
          isMobile && !mobileOpen && "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
