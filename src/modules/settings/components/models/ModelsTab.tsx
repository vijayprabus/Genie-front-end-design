import { useState, useEffect } from "react";
import { ChevronRight, Plus, Zap } from "lucide-react";
import { useLayoutContext } from "@/modules/settings/components/SettingsLayout";
import ModelPanel from "../integrations/ModelPanel";
import GenieLogo from "../GenieLogo";
import { providerLogoMap } from "./ProviderLogos";
import {
  type ModelProviderItem,
  genieManaged, configuredProviders, selfHostedConfigured, availableProviders,
} from "../integrations/modelData";
import { useBreakpoint } from "@/shared/hooks/useBreakpoint";

const f = "Inter, sans-serif";

const ws = {
  page: "#FAF8F5", surface: "#FFFDF9", muted: "#F0EBE4",
  elevated: "#F5F0EB", border: "#E7E0D8", divider: "#F0EBE4", inputBorder: "#D6D3D1",
  heading: "#292524", body: "#44403C", secondary: "#78716C", muted_text: "#A8A29E",
  disabled: "#D6D3D1", primary: "#7C3AED", primaryLight: "#EDE9FE",
  success: "#10B981", error: "#E11D48", hoverBg: "#EDE8E3",
};

const GLOBAL_CSS = `
  [data-models-panel] *::-webkit-scrollbar { width: 0; display: none; }
  [data-models-panel] * { scrollbar-width: none; }
  @keyframes mdl-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const spring = "cubic-bezier(0.22, 1, 0.36, 1)";

/* ── Shared components ───────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 11, fontWeight: 500, color: ws.muted_text, margin: "0 0 10px", fontFamily: f }}>{children}</h3>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ backgroundColor: ws.surface, border: `1px solid ${ws.border}`, borderRadius: 14, overflow: "hidden" }}>{children}</div>;
}

/* ── Skeleton shimmer ────────────────────────────────────────── */

function ShimmerBar({ width, height, mb = 0, delay = 0 }: { width: string | number; height: number; mb?: number; delay?: number }) {
  return (
    <div style={{
      width, height, borderRadius: 6, marginBottom: mb,
      background: `linear-gradient(90deg, ${ws.muted} 25%, ${ws.elevated} 50%, ${ws.muted} 75%)`,
      backgroundSize: "200% 100%",
      animation: `mdl-shimmer 1.5s ease-in-out infinite`,
      animationDelay: `${delay}ms`,
    }} />
  );
}

function PageSkeleton() {
  return (
    <div style={{ fontFamily: f }}>
      {/* Title */}
      <ShimmerBar width={140} height={20} mb={8} />
      <ShimmerBar width={320} height={13} mb={18} />

      {/* Search bar */}
      <ShimmerBar width={480} height={40} mb={20} />

      {/* Section label */}
      <ShimmerBar width={60} height={10} mb={12} />

      {/* Default card */}
      <div style={{ borderRadius: 14, border: `1px solid ${ws.border}`, overflow: "hidden", backgroundColor: ws.surface, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShimmerBar width={20} height={20} />
            <ShimmerBar width={110} height={13} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShimmerBar width={130} height={12} />
            <ShimmerBar width={14} height={14} />
          </div>
        </div>
      </div>

      {/* Configured label */}
      <ShimmerBar width={80} height={10} mb={12} />

      {/* Configured card rows */}
      <div style={{ borderRadius: 14, border: `1px solid ${ws.border}`, overflow: "hidden", backgroundColor: ws.surface, marginBottom: 24 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: i < 2 ? `1px solid ${ws.divider}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShimmerBar width={20} height={20} delay={i * 60} />
              <ShimmerBar width={90 + i * 14} height={13} delay={i * 60} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShimmerBar width={80 + i * 8} height={12} delay={i * 60} />
              <ShimmerBar width={14} height={14} delay={i * 60} />
            </div>
          </div>
        ))}
      </div>

      {/* Available label */}
      <ShimmerBar width={60} height={10} mb={12} />

      {/* Available card rows */}
      <div style={{ borderRadius: 14, border: `1px solid ${ws.border}`, overflow: "hidden", backgroundColor: ws.surface }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: i < 5 ? `1px solid ${ws.divider}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShimmerBar width={20} height={20} delay={i * 60} />
              <ShimmerBar width={80 + i * 12} height={13} delay={i * 60} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShimmerBar width={100} height={12} delay={i * 60} />
              <ShimmerBar width={14} height={14} delay={i * 60} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */

export default function ModelsTab() {
  const bp = useBreakpoint();
  const isDesktop = bp === "desktop";
  const isMobile = bp === "mobile";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelFading, setPanelFading] = useState(false);
  const [renderedItem, setRenderedItem] = useState<ModelProviderItem | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const { searchQuery } = useLayoutContext();

  /* Data assembly */
  const addSelfhostedItem: ModelProviderItem = {
    id: "__add-selfhosted", name: "Add Custom Endpoint", description: "Self-hosted or fine-tuned model",
    configured: false, panelMode: "add-selfhosted", providerType: "selfhosted",
  };
  const allItems: ModelProviderItem[] = [genieManaged, ...configuredProviders, ...selfHostedConfigured, ...availableProviders, addSelfhostedItem];

  /* Panel open state */
  const selectedItem = allItems.find(i => i.id === selectedId) ?? null;
  const panelOpen = selectedItem !== null;

  /* Keep rendered item alive during close animation */
  useEffect(() => { if (selectedItem) setRenderedItem(selectedItem); }, [selectedItem]);
  useEffect(() => { if (!panelOpen && renderedItem) { const t = setTimeout(() => setRenderedItem(null), 320); return () => clearTimeout(t); } }, [panelOpen, renderedItem]);

  /* Row click with cross-fade */
  const handleSelectItem = (id: string) => {
    if (id === selectedId) { setSelectedId(null); return; }
    if (selectedId) {
      setPanelFading(true);
      setTimeout(() => {
        const next = allItems.find(i => i.id === id) ?? null;
        if (next) setRenderedItem(next);
        setSelectedId(id);
        requestAnimationFrame(() => setPanelFading(false));
      }, 200);
    } else {
      setSelectedId(id);
    }
  };
  const handleClosePanel = () => setSelectedId(null);

  /* Page loading simulation */
  useEffect(() => { const t = setTimeout(() => setPageLoading(false), 900); return () => clearTimeout(t); }, []);

  /* Model filtering */
  const allConfigured = [...configuredProviders, ...selfHostedConfigured];
  const filteredAvailable = searchQuery
    ? availableProviders.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : availableProviders;

  /* ── Row renderer ────────────────────────────────────────────── */

  function renderModelRow(item: ModelProviderItem, last: boolean) {
    const Logo = providerLogoMap[item.id];
    const isSelected = item.id === selectedId;
    const isGenie = item.providerType === "genie";
    const isSelfHosted = item.selfHosted;
    const isPaused = item.paused;

    return (
      <div key={item.id} role="button" tabIndex={0} aria-selected={isSelected}
        onClick={() => handleSelectItem(item.id)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelectItem(item.id); } }}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "14px 16px" : "10px 14px", cursor: "pointer", transition: "background-color 0.15s",
          borderBottom: last ? "none" : `1px solid ${ws.divider}`,
          backgroundColor: isSelected ? ws.elevated : "transparent",
        }}
        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = ws.hoverBg; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isSelected ? ws.elevated : "transparent"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ flexShrink: 0, opacity: isPaused ? 0.35 : 1 }}>
            {isGenie ? (
              <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: ws.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={11} color="#fff" />
              </div>
            ) : isSelfHosted ? (
              <div style={{ width: 20, height: 20, borderRadius: 5, border: `1.5px dashed ${ws.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, color: ws.secondary, fontFamily: f }}>
                {item.name.charAt(0)}
              </div>
            ) : Logo ? <Logo size={20} /> : <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: "#78716C", flexShrink: 0 }} />}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: isPaused ? ws.muted_text : ws.body, fontFamily: f, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {isPaused && (
            <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 4, backgroundColor: ws.elevated, color: ws.muted_text, fontFamily: f }}>Paused</span>
          )}
          {!isPaused && item.configured && item.maskedKey && (
            <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: "monospace", whiteSpace: "nowrap" }}>{item.maskedKey}</span>
          )}
          {!isPaused && item.configured && isGenie && (
            <span style={{ fontSize: isMobile ? 12 : 11, color: ws.muted_text, fontFamily: f }}>Auto-selects best model</span>
          )}
          {!item.configured && (
            <span style={{ fontSize: isMobile ? 13 : 12, color: ws.muted_text, fontFamily: f, whiteSpace: "nowrap" }}>{item.description}</span>
          )}
          <ChevronRight size={14} color={ws.disabled} />
        </div>
      </div>
    );
  }

  /* ── Render ──────────────────────────────────────────────────── */

  if (pageLoading) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <PageSkeleton />
    </>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ fontFamily: f }}>
        <h1 style={{ fontSize: isMobile ? 24 : 20, fontWeight: 700, color: ws.heading, margin: 0, fontFamily: f }}>Models</h1>
        <p style={{ fontSize: isMobile ? 14 : 13, color: ws.secondary, margin: "4px 0 14px", fontFamily: f }}>
          Connect AI model providers and control which models your Workers can use.
        </p>

        {/* Content area */}
        <div style={{ display: "flex" }}>
          {/* Left: search + list (scrolls with the page) */}
          <div style={{
            flex: 1, minWidth: 0,
            marginRight: isDesktop && panelOpen ? 496 : 0,
            transition: `margin-right 0.32s ${spring}`,
          }}>
            {/* Default */}
            <div style={{ marginBottom: 24 }}>
              <SectionLabel>Default</SectionLabel>
              <Card>{renderModelRow(genieManaged, true)}</Card>
            </div>

            {/* Configured */}
            <div style={{ marginBottom: 24 }}>
              <SectionLabel>Configured</SectionLabel>
              <Card>
                {allConfigured.map((item, i, arr) => renderModelRow(item, i === arr.length - 1))}
              </Card>
            </div>

            {/* Available */}
            <div style={{ marginBottom: 24 }}>
              <SectionLabel>Available</SectionLabel>
              <Card>
                {filteredAvailable.map((item, i) => renderModelRow(item, i === filteredAvailable.length - 1))}
                {filteredAvailable.length === 0 && (
                  <div style={{ padding: "20px 16px", textAlign: "center" }}>
                    <span style={{ fontSize: 13, color: ws.muted_text, fontFamily: f }}>No providers match &ldquo;{searchQuery}&rdquo;</span>
                  </div>
                )}
              </Card>
            </div>

            {/* Add Custom Endpoint */}
            <div style={{ paddingBottom: 80 }}>
              <Card>
                <div
                  role="button" tabIndex={0}
                  onClick={() => handleSelectItem("__add-selfhosted")}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelectItem("__add-selfhosted"); } }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", cursor: "pointer", transition: "background-color 0.15s",
                    backgroundColor: selectedId === "__add-selfhosted" ? ws.elevated : "transparent",
                  }}
                  onMouseEnter={(e) => { if (selectedId !== "__add-selfhosted") e.currentTarget.style.backgroundColor = ws.hoverBg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = selectedId === "__add-selfhosted" ? ws.elevated : "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Plus size={16} color={ws.muted_text} />
                    <span style={{ fontSize: isMobile ? 14 : 13, fontWeight: 500, color: ws.body, fontFamily: f }}>Add custom endpoint</span>
                  </div>
                  <ChevronRight size={14} color={ws.disabled} />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop overlay for non-desktop */}
      {!isDesktop && (
        <div
          onClick={handleClosePanel}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            opacity: panelOpen ? 1 : 0,
            pointerEvents: panelOpen ? "auto" : "none",
            transition: `opacity 0.24s ${spring}`,
            zIndex: 9,
          }}
        />
      )}

      {/* Detail panel — bottom sheet on mobile, side panel otherwise */}
      <div data-models-panel style={isMobile ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "85vh",
        transform: panelOpen ? "translateY(0)" : "translateY(100%)",
        transition: `transform 0.32s ${spring}`,
        pointerEvents: panelOpen ? "auto" : "none",
        zIndex: 10,
      } : {
        position: "fixed",
        top: 80,
        right: isDesktop ? 32 : 20,
        width: isDesktop ? 480 : "min(480px, calc(100vw - 260px))",
        height: "calc(100vh - 100px)",
        transform: panelOpen ? "translateX(0)" : "translateX(calc(100% + 40px))",
        opacity: panelOpen ? 1 : 0,
        transition: `transform 0.32s ${spring}, opacity 0.24s ${spring}`,
        pointerEvents: panelOpen ? "auto" : "none",
        zIndex: 10,
      }}>
        <div style={{
          width: "100%", height: "100%",
          borderRadius: isMobile ? "20px 20px 0 0" : 14,
          backgroundColor: ws.surface,
          border: isMobile ? "none" : `1px solid ${ws.border}`,
          boxShadow: isMobile
            ? "0 -4px 24px rgba(0,0,0,0.12)"
            : "0 4px 16px -4px rgba(0,0,0,0.08), 0 1px 4px -1px rgba(0,0,0,0.04)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {isMobile && (
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px", flexShrink: 0 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#D6D3D1" }} />
            </div>
          )}
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <div style={{ width: "100%", height: "100%", opacity: panelFading ? 0 : 1, transition: "opacity 0.2s ease" }}>
              {renderedItem && <ModelPanel item={renderedItem} onClose={handleClosePanel} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
