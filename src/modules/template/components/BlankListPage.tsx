import { useState, useEffect } from "react";
import { Bell, CaretRight, X } from "@phosphor-icons/react";
import { useBreakpoint } from "@/shared/hooks/useBreakpoint";
import { ws, f, spring } from "@/shared/utils/contentTokens";
import { SearchBar, ListRow, DetailPanelShell } from "@/shared/components/settings";

type Item = { id: string; name: string; meta: string };

const items: Item[] = [
  { id: "1", name: "Item one", meta: "Updated 2 hours ago" },
  { id: "2", name: "Item two", meta: "Updated yesterday" },
  { id: "3", name: "Item three", meta: "Updated 3 days ago" },
  { id: "4", name: "Item four", meta: "Updated last week" },
  { id: "5", name: "Item five", meta: "Updated last month" },
];

export default function BlankListPage() {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isDesktop = bp === "desktop";

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [panelKey, setPanelKey] = useState(0);

  const panelOpen = selectedId !== null;
  const selected = items.find((i) => i.id === selectedId) ?? null;

  const filtered = searchQuery
    ? items.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  const handleSelect = (id: string) => {
    if (id === selectedId) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
      setPanelKey((k) => k + 1);
    }
  };

  // Close panel on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && panelOpen) setSelectedId(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [panelOpen]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: ws.page, fontFamily: f, overflow: "hidden" }}>
      {/* ── Top bar (hidden on mobile — sidebar nav handles it) ── */}
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 32px", flexShrink: 0, gap: 12, minHeight: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: ws.muted_text, fontFamily: f }}>Workspace</span>
            <span style={{ fontSize: 12, color: ws.disabled }}>/</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: ws.secondary, fontFamily: f }}>Blank</span>
          </div>

          <button
            onClick={() => {}}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 4, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 6, outline: "none", position: "relative",
              opacity: 0.6, transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; }}
          >
            <Bell size={16} weight="regular" color={ws.muted_text} />
          </button>
        </div>
      )}

      {/* ── Main content ── */}
      <div
        id="main-content"
        style={{
          flex: 1, display: "flex", flexDirection: "column",
          padding: isMobile ? "0 16px 20px" : "0 32px 28px",
          gap: isMobile ? 14 : 18,
          overflow: "auto",
        }}
      >
        {/* Compressing wrapper — shrinks when panel is open (matches Users/Apps) */}
        <div style={{
          flex: 1, minWidth: 0,
          marginRight: isDesktop && panelOpen ? 496 : 0,
          transition: `margin-right 0.32s ${spring}`,
          display: "flex", flexDirection: "column", gap: isMobile ? 14 : 18,
        }}>
          {/* Heading */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? 24 : 20, fontWeight: 700, color: ws.heading, fontFamily: f }}>
              Blank
            </h1>
            <p style={{ margin: 0, fontSize: isMobile ? 14 : 13, color: ws.secondary, lineHeight: 1.4, fontFamily: f }}>
              A starter scaffold using the shared sidebar, top bar, hero search, list, and detail panel.
            </p>
          </div>

          {/* Hero search */}
          <div style={{ maxWidth: 480 }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search items..."
              variant="prominent"
              width="100%"
            />
          </div>

          {/* List card */}
          <div style={{ borderRadius: 10, backgroundColor: ws.surface, border: `1px solid ${ws.border}`, overflow: "hidden" }}>
            {filtered.map((item, idx) => (
              <ListRow
                key={item.id}
                onClick={() => handleSelect(item.id)}
                selected={item.id === selectedId}
                last={idx === filtered.length - 1}
                padding="0 16px"
                height={48}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: ws.heading, fontFamily: f, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.name}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: ws.muted_text, fontFamily: f }}>{item.meta}</span>
                  <CaretRight size={14} color={ws.disabled} />
                </div>
              </ListRow>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: ws.muted_text, fontFamily: f }}>No items match your search</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Detail panel ── */}
      <DetailPanelShell
        open={panelOpen}
        onClose={() => setSelectedId(null)}
        isMobile={isMobile}
        isDesktop={isDesktop}
        width={480}
        panelKey={panelKey}
      >
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: f }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px", height: 56, borderBottom: `1px solid ${ws.divider}`, flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: ws.heading, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selected.name}
              </span>
              <button
                onClick={() => setSelectedId(null)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", outline: "none", flexShrink: 0 }}
              >
                <X size={16} color={ws.muted_text} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
              <p style={{ margin: 0, fontSize: 12, color: ws.secondary, lineHeight: 1.55 }}>{selected.meta}</p>
              <p style={{ marginTop: 12, fontSize: 13, color: ws.body, lineHeight: 1.55 }}>
                Detail panel content goes here. Replace this body with the fields, tabs, or actions for the selected item.
              </p>
            </div>
          </div>
        )}
      </DetailPanelShell>
    </div>
  );
}
