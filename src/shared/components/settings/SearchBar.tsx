import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { ws, f } from "@/shared/utils/contentTokens";

type Variant = "prominent" | "inline";

const specs: Record<Variant, { height: number; radius: number; fontSize: number; iconSize: number; width: number | string; shadow: string | undefined; border: string }> = {
  prominent: { height: 44, radius: 12, fontSize: 14, iconSize: 18, width: 480, shadow: ws.searchShadow, border: ws.searchBorder },
  inline:    { height: 36, radius: 10, fontSize: 13, iconSize: 16, width: 360, shadow: undefined, border: `1px solid ${ws.inputBorder}` },
};

export function SearchBar({ value, onChange, placeholder, variant = "inline", width }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  variant?: Variant;
  width?: number | string;
}) {
  const s = specs[variant];
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  // ⌘K / Ctrl+K to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleClear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div
      role="search"
      style={{
        display: "flex", alignItems: "center", gap: variant === "prominent" ? 10 : 8,
        width: width ?? s.width, height: s.height,
        borderRadius: s.radius,
        backgroundColor: ws.surface,
        border: focused ? `1px solid ${ws.primary}` : s.border,
        boxShadow: focused ? ws.focusRing : s.shadow,
        padding: variant === "prominent" ? "0 14px" : "0 12px",
        transition: "border-color 150ms ease, box-shadow 150ms ease",
      }}
    >
      <Search size={s.iconSize} color={ws.muted_text} style={{ flexShrink: 0 }} />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (value) { onChange(""); } else { inputRef.current?.blur(); }
          }
        }}
        aria-label={placeholder}
        style={{
          flex: 1, border: "none", outline: "none",
          backgroundColor: "transparent",
          fontSize: s.fontSize, fontFamily: f, color: ws.body,
        }}
      />
      {value ? (
        <button onClick={handleClear} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center", flexShrink: 0, outline: "none" }}>
          <X size={14} color={ws.muted_text} />
        </button>
      ) : variant === "prominent" ? (
        <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
          <kbd style={{ fontSize: 10, fontWeight: 600, color: ws.muted_text, backgroundColor: ws.elevated, border: `1px solid ${ws.inputBorder}`, borderRadius: 4, padding: "1px 5px", lineHeight: "18px" }}>⌘</kbd>
          <kbd style={{ fontSize: 10, fontWeight: 600, color: ws.muted_text, backgroundColor: ws.elevated, border: `1px solid ${ws.inputBorder}`, borderRadius: 4, padding: "1px 5px", lineHeight: "18px" }}>K</kbd>
        </div>
      ) : null}
    </div>
  );
}
