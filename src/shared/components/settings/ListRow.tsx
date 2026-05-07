import type { CSSProperties } from "react";
import { ws } from "@/shared/utils/contentTokens";

export function ListRow({ children, onClick, selected, last, padding = "10px 14px", height, style: extra, onMouseEnter: onEnter, onMouseLeave: onLeave }: {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  last?: boolean;
  padding?: string;
  height?: number | string;
  style?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const interactive = !!onClick;
  return (
    <div
      {...(interactive ? {
        role: "button", tabIndex: 0,
        onClick,
        onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick!(); } },
      } : {})}
      {...(selected !== undefined ? { "aria-selected": selected } : {})}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding, height,
        borderBottom: last ? "none" : `1px solid ${ws.divider}`,
        cursor: interactive ? "pointer" : undefined,
        transition: interactive ? "background-color 0.15s" : undefined,
        backgroundColor: selected ? ws.elevated : "transparent",
        ...extra,
      }}
      onMouseEnter={interactive ? (e) => { if (!selected) (e.currentTarget as HTMLElement).style.backgroundColor = ws.hoverBg; onEnter?.(); } : onEnter}
      onMouseLeave={interactive ? (e) => { (e.currentTarget as HTMLElement).style.backgroundColor = selected ? ws.elevated : "transparent"; onLeave?.(); } : onLeave}
    >
      {children}
    </div>
  );
}
