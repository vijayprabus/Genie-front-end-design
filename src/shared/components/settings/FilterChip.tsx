import { ws, f } from "@/shared/utils/contentTokens";

export function FilterChip({ label, active, onClick, isMobile, borderRadius = 8 }: {
  label: string;
  active: boolean;
  onClick: () => void;
  isMobile?: boolean;
  borderRadius?: number;
}) {
  return (
    <button onClick={onClick} style={{
      height: isMobile ? 32 : 26,
      borderRadius,
      padding: isMobile ? "0 12px" : "0 10px",
      fontSize: isMobile ? 12 : 11,
      fontFamily: f,
      fontWeight: active ? 500 : "normal",
      cursor: "pointer",
      transition: "background-color 0.15s, color 0.15s, border-color 0.15s",
      border: active ? "1px solid transparent" : `1px solid ${ws.border}`,
      backgroundColor: active ? ws.primaryLight : "transparent",
      color: active ? ws.primary : ws.secondary,
    }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = ws.hoverBg; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = active ? ws.primaryLight : "transparent"; }}
    >
      {label}
    </button>
  );
}
