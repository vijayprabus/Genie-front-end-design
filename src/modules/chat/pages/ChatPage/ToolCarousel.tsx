import { useState, useRef, useCallback } from "react";
import { Package, BarChart2, TrendingUp, MessageSquare, Database, FileText, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ws, f } from "@/shared/utils/contentTokens";

const TOOLS: { icon: LucideIcon; title: string; desc: string; prompt: string }[] = [
  { icon: Package, title: "Order status", desc: "Track your orders", prompt: "Check the current purchase order status" },
  { icon: BarChart2, title: "Fill rates", desc: "Inventory levels", prompt: "Analyze the current fill rates by region" },
  { icon: TrendingUp, title: "Sales data", desc: "Revenue trends", prompt: "Show me the latest sales performance dashboard" },
  { icon: MessageSquare, title: "Raise ticket", desc: "Get support", prompt: "I need to raise a new ticket" },
  { icon: Database, title: "Text to SQL", desc: "Query databases", prompt: "Help me query the database" },
  { icon: FileText, title: "KYC flow", desc: "Compliance check", prompt: "Start the KYC verification flow" },
];

const CARD_WIDTH = 176;
const GAP = 8;
const VISIBLE_WIDTH = 544;

function ToolCard({ icon: Icon, title, desc, onClick }: {
  icon: LucideIcon; title: string; desc: string; onClick: () => void;
}) {
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
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px", borderRadius: 8,
        backgroundColor: ws.surface,
        border: `1px solid ${ws.border}`,
        cursor: "pointer",
        width: CARD_WIDTH, minWidth: CARD_WIDTH,
        boxShadow: hovered ? "0 4px 12px rgba(41,37,36,0.08)" : "none",
        transition: "box-shadow 0.15s ease",
        fontFamily: f, outline: "none", boxSizing: "border-box",
      }}
    >
      <Icon
        size={16}
        color={hovered ? ws.primary : ws.secondary}
        style={{ flexShrink: 0, transition: "color 0.15s ease" }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: ws.body, fontFamily: f, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {title}
        </div>
        <div style={{ fontSize: 11, fontWeight: 400, color: ws.muted_text, fontFamily: f, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {desc}
        </div>
      </div>
      <ArrowRight
        size={10}
        color={ws.muted_text}
        style={{
          flexShrink: 0,
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-3px)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
      />
    </div>
  );
}

export interface ToolCarouselProps {
  onToolClick: (prompt: string) => void;
}

export function ToolCarousel({ onToolClick }: ToolCarouselProps) {
  const [offset, setOffset] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const step = CARD_WIDTH + GAP;
  const maxOffset = Math.max(0, TOOLS.length * step - GAP - VISIBLE_WIDTH);

  const scrollBy = useCallback((dir: 1 | -1) => {
    setOffset(prev => {
      const next = Math.max(0, Math.min(prev + dir * step, maxOffset));
      stripRef.current?.scrollTo({ left: next, behavior: "smooth" });
      return next;
    });
  }, [maxOffset, step]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Left arrow */}
      <button
        onClick={() => scrollBy(-1)}
        disabled={offset === 0}
        aria-label="Previous tools"
        style={{
          width: 24, height: 24, borderRadius: 12,
          backgroundColor: ws.elevated, border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: offset === 0 ? "default" : "pointer",
          opacity: offset === 0 ? 0.4 : 1,
          transition: "opacity 0.15s ease, transform 0.15s ease",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { if (offset > 0) e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <ChevronLeft size={14} color={offset === 0 ? ws.disabled : ws.secondary} />
      </button>

      {/* Cards strip */}
      <div
        ref={stripRef}
        style={{
          width: VISIBLE_WIDTH, overflow: "hidden",
          display: "flex", gap: GAP,
          scrollBehavior: "smooth",
        }}
      >
        {TOOLS.map((tool, i) => (
          <div
            key={tool.title}
            className="landing-card"
            style={{ animationDelay: `${400 + i * 70}ms`, flexShrink: 0 }}
          >
            <ToolCard
              icon={tool.icon}
              title={tool.title}
              desc={tool.desc}
              onClick={() => onToolClick(tool.prompt)}
            />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scrollBy(1)}
        disabled={offset >= maxOffset}
        aria-label="More tools"
        style={{
          width: 24, height: 24, borderRadius: 12,
          backgroundColor: ws.elevated, border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: offset >= maxOffset ? "default" : "pointer",
          opacity: offset >= maxOffset ? 0.4 : 1,
          transition: "opacity 0.15s ease, transform 0.15s ease",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { if (offset < maxOffset) e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <ChevronRight size={14} color={offset >= maxOffset ? ws.disabled : ws.secondary} />
      </button>
    </div>
  );
}
