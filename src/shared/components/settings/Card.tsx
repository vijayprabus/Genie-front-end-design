import type { CSSProperties } from "react";
import { ws } from "@/shared/utils/contentTokens";

const style: CSSProperties = {
  backgroundColor: ws.surface,
  border: ws.cardBorder,
  boxShadow: ws.cardShadow,
  borderRadius: 14,
  overflow: "hidden",
};

export function Card({ children }: { children: React.ReactNode }) {
  return <div style={style}>{children}</div>;
}
