import { useState, useEffect } from "react";

/**
 * Breakpoint definitions for responsive layout:
 *   desktop  — ≥1280px  (sidebar visible, panel pushes content)
 *   tablet   — 768–1279 (sidebar visible, panel overlays content)
 *   mobile   — <768     (sidebar hidden, panel = bottom sheet) [Phase 3]
 */
export type Breakpoint = "desktop" | "tablet" | "mobile";

const DESKTOP_MIN = 1280;
const TABLET_MIN = 768;

function getBreakpoint(width: number): Breakpoint {
  if (width >= DESKTOP_MIN) return "desktop";
  if (width >= TABLET_MIN) return "tablet";
  return "mobile";
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window !== "undefined" ? getBreakpoint(window.innerWidth) : "desktop"
  );

  useEffect(() => {
    const desktopMql = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
    const tabletMql = window.matchMedia(`(min-width: ${TABLET_MIN}px)`);

    const update = () => {
      if (desktopMql.matches) setBp("desktop");
      else if (tabletMql.matches) setBp("tablet");
      else setBp("mobile");
    };

    update();
    desktopMql.addEventListener("change", update);
    tabletMql.addEventListener("change", update);
    return () => {
      desktopMql.removeEventListener("change", update);
      tabletMql.removeEventListener("change", update);
    };
  }, []);

  return bp;
}
