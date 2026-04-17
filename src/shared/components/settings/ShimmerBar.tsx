import { ws } from "@/shared/utils/contentTokens";

export function ShimmerBar({ width, height, mb = 0, delay = 0, radius = 6 }: {
  width: string | number;
  height: number;
  mb?: number;
  delay?: number;
  radius?: number;
}) {
  return (
    <div style={{
      width, height, borderRadius: radius, marginBottom: mb,
      background: `linear-gradient(90deg, ${ws.muted} 25%, ${ws.elevated} 50%, ${ws.muted} 75%)`,
      backgroundSize: "200% 100%",
      animation: "gf-shimmer 1.5s ease-in-out infinite",
      animationDelay: `${delay}ms`,
    }} />
  );
}
