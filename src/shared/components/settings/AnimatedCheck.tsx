import { useState } from "react";
import { ws } from "@/shared/utils/contentTokens";

export function AnimatedCheck({ size = 36, color }: { size?: number; color?: string }) {
  const [k] = useState(() => Date.now());
  const strokeColor = color ?? ws.success;
  return (
    <svg key={k} width={size} height={size} viewBox="0 0 52 52" style={{ display: "block" }}>
      <circle cx="26" cy="26" r="24" fill="none" stroke={strokeColor} strokeWidth="2"
        style={{ strokeDasharray: 151, strokeDashoffset: 151, animation: "gf-acheck-circle 0.5s cubic-bezier(0.65,0,0.45,1) forwards" }} />
      <path fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8"
        style={{ strokeDasharray: 36, strokeDashoffset: 36, animation: "gf-acheck-check 0.3s cubic-bezier(0.65,0,0.45,1) 0.5s forwards" }} />
    </svg>
  );
}

export function AnimatedCheckMuted(props: { size?: number }) {
  return <AnimatedCheck {...props} color={ws.muted_text} />;
}
