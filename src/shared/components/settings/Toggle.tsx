import { ws } from "@/shared/utils/contentTokens";

export function Toggle({ on, onChange, pulsing }: { on: boolean; onChange: (v: boolean) => void; pulsing?: boolean }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} style={{
      width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
      backgroundColor: ws.muted, position: "relative",
      transition: "background-color 0.2s", flexShrink: 0, padding: 0,
    }}>
      <span style={{
        position: "absolute", top: 2, left: on ? 18 : 2,
        width: 16, height: 16, borderRadius: "50%",
        backgroundColor: on ? ws.primary : ws.muted_text,
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        animation: pulsing ? "gf-toggle-glow 0.8s ease-out" : "none",
      }} />
    </button>
  );
}
