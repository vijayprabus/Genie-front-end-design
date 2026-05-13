import { useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";
import { applyTheme, getStoredTheme, type Theme } from "@/shared/utils/theme";
import { ws, f } from "@/shared/utils/contentTokens";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  return (
    <button
      onClick={handleClick}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
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
        flexShrink: 0,
        color: ws.sidebarIconRest,
        fontFamily: f,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = ws.hoverBg;
        (e.currentTarget.querySelector("svg") as SVGElement | null)?.setAttribute(
          "style",
          `color: ${ws.sidebarIconHover}`,
        );
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        (e.currentTarget.querySelector("svg") as SVGElement | null)?.setAttribute(
          "style",
          `color: ${ws.sidebarIconRest}`,
        );
      }}
    >
      {theme === "dark" ? (
        <Sun size={16} weight="regular" aria-hidden="true" />
      ) : (
        <Moon size={16} weight="regular" aria-hidden="true" />
      )}
    </button>
  );
}
