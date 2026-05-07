import { useState } from "react";
import { Package, BarChart2, TrendingUp, MessageSquare, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { ws, f } from "@/shared/utils/contentTokens";

const TOOLS: { icon: LucideIcon; title: string; desc: string; prompt: string }[] = [
  {
    icon: Package,
    title: "Check order status",
    desc: "Track POs and approvals",
    prompt: "Check the current purchase order status",
  },
  {
    icon: BarChart2,
    title: "Analyze fill rates",
    desc: "Monitor rates across regions",
    prompt: "Analyze the current fill rates by region",
  },
  {
    icon: TrendingUp,
    title: "View sales dashboard",
    desc: "Real-time performance data",
    prompt: "Show me the latest sales performance dashboard",
  },
  {
    icon: MessageSquare,
    title: "Raise a ticket",
    desc: "Submit issues and requests",
    prompt: "I need to raise a new ticket",
  },
];

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  onClick: () => void;
}

function ToolCard({ icon: Icon, title, desc, onClick, compact }: ToolCardProps & { compact?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: compact ? 12 : 16,
        borderRadius: 14,
        backgroundColor: ws.surface,
        border: `1px solid ${ws.border}`,
        cursor: "pointer",
        boxShadow: hovered ? "0 4px 12px rgba(41,37,36,0.08)" : "none",
        transition: "box-shadow 0.15s ease",
        fontFamily: f,
        outline: "none",
      }}
    >
      {/* Naked icon — no container */}
      <Icon
        size={18}
        color={hovered ? ws.primary : ws.secondary}
        style={{ flexShrink: 0, transition: "color 0.15s ease" }}
      />

      {/* Text group */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: ws.heading, fontFamily: f }}>
          {title}
        </div>
        <div style={{ fontSize: 12, fontWeight: 400, color: ws.secondary, fontFamily: f, marginTop: 2 }}>
          {desc}
        </div>
      </div>

      {/* Arrow — fades in on hover */}
      <ArrowRight
        size={12}
        color={ws.muted_text}
        style={{
          flexShrink: 0,
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-4px)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
      />
    </div>
  );
}

export interface ToolGridProps {
  onToolClick: (prompt: string) => void;
}

export function ToolGrid({ onToolClick }: ToolGridProps) {
  const isMobile = useIsMobile();

  return (
    <div style={{ maxWidth: "100%", width: "100%", margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: isMobile ? 8 : 12,
        }}
      >
        {TOOLS.map((tool, i) => (
          <div
            key={tool.title}
            className="landing-card"
            style={{ animationDelay: `${400 + i * 70}ms` }}
          >
            <ToolCard
              icon={tool.icon}
              title={tool.title}
              desc={tool.desc}
              onClick={() => onToolClick(tool.prompt)}
              compact={isMobile}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
