import type { CSSProperties } from "react";
import { ws, f } from "@/shared/utils/contentTokens";

const style: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: ws.muted_text,
  margin: "0 0 10px",
  fontFamily: f,
};

export function SectionLabel({ children, style: extra }: { children: React.ReactNode; style?: CSSProperties }) {
  return <h3 style={extra ? { ...style, ...extra } : style}>{children}</h3>;
}
