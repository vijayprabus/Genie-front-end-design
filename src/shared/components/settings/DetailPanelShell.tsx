import { ws, spring } from "@/shared/utils/contentTokens";

export function DetailPanelShell({
  open,
  onClose,
  children,
  isMobile,
  isDesktop = true,
  width = 480,
  mobileHeight = "85vh",
  top = 80,
  dataAttr,
  panelKey,
  fading = false,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isMobile: boolean;
  isDesktop?: boolean;
  width?: number;
  mobileHeight?: string;
  top?: number;
  dataAttr?: string;
  panelKey?: number;
  fading?: boolean;
}) {
  const dataProps = dataAttr ? { [`data-${dataAttr}`]: "" } : {};

  return (
    <>
      {/* Backdrop — non-desktop only */}
      {!isDesktop && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.25)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transition: `opacity 0.24s ${spring}`,
            zIndex: 9,
          }}
        />
      )}

      {/* Panel container */}
      <div key={panelKey} {...dataProps} style={isMobile ? {
        position: "fixed", bottom: 0, left: 0, right: 0,
        height: mobileHeight,
        transform: open ? "translateY(0)" : "translateY(100%)",
        opacity: open ? 1 : 0,
        transition: `transform 0.32s ${spring}, opacity 0.2s ${spring}`,
        pointerEvents: open ? "auto" : "none",
        zIndex: 10,
      } : {
        position: "fixed",
        top,
        right: isDesktop ? 32 : 20,
        width: isDesktop ? width : `min(${width}px, calc(100vw - 260px))`,
        height: `calc(100vh - ${top + 20}px)`,
        transform: open ? "translateX(0)" : "translateX(calc(100% + 40px))",
        opacity: open ? 1 : 0,
        transition: `transform 0.32s ${spring}, opacity 0.24s ${spring}`,
        pointerEvents: open ? "auto" : "none",
        zIndex: 10,
      }}>
        <div style={{
          width: "100%", height: "100%",
          borderRadius: isMobile ? "20px 20px 0 0" : 14,
          backgroundColor: ws.surface,
          border: isMobile ? "none" : ws.cardBorder,
          boxShadow: isMobile
            ? "0 -4px 24px rgba(0,0,0,0.12)"
            : `0 4px 16px -4px rgba(0,0,0,0.08), 0 1px 4px -1px rgba(0,0,0,0.04), ${ws.cardShadow}`,
          overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}>
          {isMobile && (
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px", flexShrink: 0 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: ws.inputBorder }} />
            </div>
          )}
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden", opacity: fading ? 0 : 1, transition: "opacity 0.2s ease" }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
