import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart2,
  TrendingUp,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  ChevronDown,
  Maximize2,
  Download,
  X,
} from "lucide-react";
import { ws, f } from "@/shared/utils/contentTokens";
import { useIsMobile } from "@/shared/hooks/use-mobile";

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface ChartBlock {
  type: "chart";
  title: string;
  chartType: "bar" | "line" | "pie" | "area";
  data: ChartDataPoint[];
  dataKey: string;
  color?: string;
}

interface InlineChartProps {
  title: string;
  chartType: "bar" | "line" | "pie" | "area";
  data: ChartDataPoint[];
  dataKey: string;
  color?: string;
}

const PIE_COLORS = [ws.primary, "#A78BFA", "#C4B5FD", "#DDD6FE"];

const CHART_TYPE_OPTIONS: {
  value: "bar" | "line" | "pie" | "area";
  label: string;
  shortLabel: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}[] = [
  { value: "bar",  label: "Bar Chart",  shortLabel: "Bar",  Icon: BarChart2 },
  { value: "line", label: "Line Chart", shortLabel: "Line", Icon: TrendingUp },
  { value: "pie",  label: "Pie Chart",  shortLabel: "Pie",  Icon: PieChartIcon },
  { value: "area", label: "Area Chart", shortLabel: "Area", Icon: AreaChartIcon },
];

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: ws.heading,
        padding: "8px 12px",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: ws.onPrimary, fontFamily: f }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: ws.onPrimary,
          fontFamily: f,
          marginTop: 2,
        }}
      >
        {payload[0].value}
      </div>
    </div>
  );
}

// ─── Mobile fixed tooltip ─────────────────────────────────────────────────────

function MobileTooltipFixed({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: ws.heading,
        padding: "6px 12px",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 10,
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: ws.onPrimary, fontFamily: f }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: ws.onPrimary, fontFamily: f, marginTop: 2 }}>
        {payload[0].value}
      </div>
    </div>
  );
}

// ─── Chart content ────────────────────────────────────────────────────────────

function ChartContent({
  activeChartType,
  data,
  dataKey,
  chartColor,
  height,
  isMobile,
}: {
  activeChartType: "bar" | "line" | "pie" | "area";
  data: ChartDataPoint[];
  dataKey: string;
  chartColor: string;
  height: number;
  isMobile?: boolean;
}) {
  const axisTickStyle = { fontSize: 11, fill: ws.muted_text, fontFamily: f };
  const yAxisTickStyle = { fontSize: 10, fill: ws.muted_text, fontFamily: f };

  // Mobile tooltip state — pinned at top-center
  const [mobileTooltip, setMobileTooltip] = useState<{
    active: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }>({ active: false });

  const handleMobileClick = useCallback((data: { activePayload?: Array<{ value: number }>; activeLabel?: string } | null) => {
    if (!data?.activePayload?.length) {
      setMobileTooltip({ active: false });
      return;
    }
    setMobileTooltip({
      active: true,
      payload: data.activePayload,
      label: data.activeLabel,
    });
  }, []);

  const tooltipProps = isMobile
    ? {
        content: () => null, // suppress recharts tooltip
      }
    : {
        content: <CustomTooltip />,
      };

  const barTooltipProps = isMobile
    ? { content: () => null }
    : { content: <CustomTooltip />, cursor: { fill: ws.hoverBg } };

  const containerStyle: React.CSSProperties = isMobile
    ? { position: "relative" }
    : {};

  if (activeChartType === "bar") {
    return (
      <div style={containerStyle}>
        {isMobile && (
          <MobileTooltipFixed
            active={mobileTooltip.active}
            payload={mobileTooltip.payload}
            label={mobileTooltip.label}
          />
        )}
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            margin={{ top: isMobile ? 20 : 5, right: 5, bottom: 5, left: -10 }}
            onClick={isMobile ? handleMobileClick : undefined}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={ws.divider} vertical={false} />
            <XAxis
              dataKey="name"
              tick={axisTickStyle}
              axisLine={{ stroke: ws.divider }}
              tickLine={false}
            />
            <YAxis
              tick={yAxisTickStyle}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip {...barTooltipProps} />
            <Bar dataKey={dataKey} fill={chartColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (activeChartType === "line") {
    return (
      <div style={containerStyle}>
        {isMobile && (
          <MobileTooltipFixed
            active={mobileTooltip.active}
            payload={mobileTooltip.payload}
            label={mobileTooltip.label}
          />
        )}
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            margin={{ top: isMobile ? 20 : 5, right: 5, bottom: 5, left: -10 }}
            onClick={isMobile ? handleMobileClick : undefined}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={ws.divider} vertical={false} />
            <XAxis
              dataKey="name"
              tick={axisTickStyle}
              axisLine={{ stroke: ws.divider }}
              tickLine={false}
            />
            <YAxis
              tick={yAxisTickStyle}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip {...tooltipProps} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={chartColor}
              strokeWidth={2}
              dot={{ r: 4, fill: chartColor, stroke: ws.surface, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (activeChartType === "area") {
    return (
      <div style={containerStyle}>
        {isMobile && (
          <MobileTooltipFixed
            active={mobileTooltip.active}
            payload={mobileTooltip.payload}
            label={mobileTooltip.label}
          />
        )}
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{ top: isMobile ? 20 : 5, right: 5, bottom: 5, left: -10 }}
            onClick={isMobile ? handleMobileClick : undefined}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={ws.divider} vertical={false} />
            <XAxis
              dataKey="name"
              tick={axisTickStyle}
              axisLine={{ stroke: ws.divider }}
              tickLine={false}
            />
            <YAxis
              tick={yAxisTickStyle}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip {...tooltipProps} />
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={chartColor}
              strokeWidth={2}
              fill="url(#areaFill)"
              dot={{ r: 4, fill: chartColor, stroke: ws.surface, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // pie
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={Math.min(height * 0.35, 80)}
          innerRadius={Math.min(height * 0.175, 40)}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconSize={8}
          wrapperStyle={{ fontSize: 11, fontFamily: f, color: ws.muted_text }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Type dropdown (desktop only) ─────────────────────────────────────────────

function TypeDropdown({
  activeChartType,
  onSelect,
}: {
  activeChartType: "bar" | "line" | "pie" | "area";
  onSelect: (type: "bar" | "line" | "pie" | "area") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const current = CHART_TYPE_OPTIONS.find((o) => o.value === activeChartType);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          padding: "2px 6px",
          borderRadius: 6,
          background: open ? ws.hoverBg : "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: 12,
          color: ws.secondary,
          fontFamily: f,
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = ws.hoverBg)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = open ? ws.hoverBg : "transparent")
        }
      >
        {current && <current.Icon size={12} color={ws.secondary} />}
        <span>{current?.label ?? "Chart type"}</span>
        <ChevronDown size={10} color={ws.muted_text} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            backgroundColor: ws.surface,
            border: `1px solid ${ws.border}`,
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 10,
            minWidth: 140,
            overflow: "hidden",
          }}
        >
          {CHART_TYPE_OPTIONS.map((opt) => {
            const isActive = opt.value === activeChartType;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onSelect(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  height: 36,
                  padding: "0 12px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: f,
                  backgroundColor: isActive ? ws.primaryLight : "transparent",
                  color: isActive ? ws.primary : ws.body,
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.backgroundColor = ws.hoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isActive
                    ? ws.primaryLight
                    : "transparent";
                }}
              >
                <opt.Icon size={13} color={isActive ? ws.primary : ws.secondary} />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Mobile segmented control ─────────────────────────────────────────────────

function MobileSegmentedControl({
  activeChartType,
  onSelect,
}: {
  activeChartType: "bar" | "line" | "pie" | "area";
  onSelect: (type: "bar" | "line" | "pie" | "area") => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        backgroundColor: ws.elevated,
        border: `1px solid ${ws.border}`,
        borderRadius: 8,
        padding: 2,
        gap: 2,
        marginTop: 4,
        marginBottom: 8,
      }}
    >
      {CHART_TYPE_OPTIONS.map((opt) => {
        const isActive = opt.value === activeChartType;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "6px 4px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 500,
              fontFamily: f,
              backgroundColor: isActive ? ws.primaryLight : "transparent",
              color: isActive ? ws.primary : ws.muted_text,
              transition: "all 0.1s",
              whiteSpace: "nowrap",
            }}
          >
            <opt.Icon size={12} color={isActive ? ws.primary : ws.muted_text} />
            {opt.shortLabel}
          </button>
        );
      })}
    </div>
  );
}

// ─── Drag handle ──────────────────────────────────────────────────────────────

function DragHandle() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "12px 0 8px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: ws.inputBorder,
        }}
      />
    </div>
  );
}

// ─── Fullscreen modal ─────────────────────────────────────────────────────────

function FullscreenModal({
  title,
  data,
  dataKey,
  chartColor,
  activeChartType,
  onChangeChartType,
  onClose,
  onExport,
  isMobile,
}: {
  title: string;
  data: ChartDataPoint[];
  dataKey: string;
  chartColor: string;
  activeChartType: "bar" | "line" | "pie" | "area";
  onChangeChartType: (type: "bar" | "line" | "pie" | "area") => void;
  onClose: () => void;
  onExport: () => void;
  isMobile: boolean;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        inset: 0,
        backgroundColor: ws.surface,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }
    : {
        width: "min(90vw, 900px)",
        height: "min(85vh, 600px)",
        backgroundColor: ws.surface,
        borderRadius: 14,
        border: `1px solid ${ws.border}`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: isMobile ? undefined : "rgba(0,0,0,0.4)",
        zIndex: 50,
        display: isMobile ? "block" : "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? 0 : 20,
      }}
      onClick={(e) => {
        if (!isMobile && e.target === e.currentTarget) onClose();
      }}
    >
      <div style={panelStyle}>
        {/* Mobile drag handle */}
        {isMobile && <DragHandle />}

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "8px 16px 12px" : "16px 20px",
            borderBottom: `1px solid ${ws.border}`,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: ws.heading,
              fontFamily: f,
            }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: isMobile ? 44 : 28,
              height: isMobile ? 44 : 28,
              borderRadius: 6,
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: ws.muted_text,
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = ws.hoverBg)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <X size={16} />
          </button>
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "10px 16px" : "12px 20px",
            borderBottom: `1px solid ${ws.border}`,
            flexShrink: 0,
          }}
        >
          {/* Segmented control — always shown in fullscreen (both mobile and desktop) */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              backgroundColor: ws.elevated,
              border: `1px solid ${ws.border}`,
              borderRadius: 8,
              padding: 2,
              gap: 2,
              flex: isMobile ? 1 : undefined,
            }}
          >
            {CHART_TYPE_OPTIONS.map((opt) => {
              const isActive = opt.value === activeChartType;
              return (
                <button
                  key={opt.value}
                  onClick={() => onChangeChartType(opt.value)}
                  style={{
                    flex: isMobile ? 1 : undefined,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isMobile ? "center" : undefined,
                    gap: 6,
                    padding: isMobile ? "8px 4px" : "6px 12px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: f,
                    backgroundColor: isActive ? ws.primaryLight : "transparent",
                    color: isActive ? ws.primary : ws.muted_text,
                    transition: "all 0.1s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = ws.body;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = ws.muted_text;
                  }}
                >
                  <opt.Icon size={12} />
                  {isMobile ? opt.shortLabel : opt.label}
                </button>
              );
            })}
          </div>

          {/* Legend + Export — on desktop only show legend; on mobile just show export */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {activeChartType !== "pie" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: chartColor,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: ws.muted_text,
                      fontFamily: f,
                    }}
                  >
                    {dataKey}
                  </span>
                </div>
              )}
              <button
                onClick={onExport}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: `1px solid ${ws.border}`,
                  backgroundColor: ws.surface,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                  color: ws.body,
                  fontFamily: f,
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = ws.hoverBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = ws.surface)
                }
              >
                <Download size={13} />
                Export PNG
              </button>
            </div>
          )}

          {/* Mobile: export button with 44px touch target */}
          {isMobile && (
            <button
              onClick={onExport}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 8,
                border: `1px solid ${ws.border}`,
                backgroundColor: ws.surface,
                cursor: "pointer",
                color: ws.body,
                flexShrink: 0,
                marginLeft: 8,
              }}
            >
              <Download size={18} />
            </button>
          )}
        </div>

        {/* Chart */}
        <div
          ref={chartRef}
          data-fullscreen-chart
          style={{ flex: 1, padding: isMobile ? "12px 16px" : "16px 20px", overflow: "hidden" }}
        >
          <ChartContent
            activeChartType={activeChartType}
            data={data}
            dataKey={dataKey}
            chartColor={chartColor}
            height={300}
            isMobile={isMobile}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "8px 16px" : "10px 20px",
            borderTop: `1px solid ${ws.border}`,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>
            {data.length} data points
          </span>
          <span style={{ fontSize: 12, color: ws.muted_text, fontFamily: f }}>
            {isMobile ? "Tap to inspect" : "Click and hover to interact"}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function InlineChart({
  title,
  chartType,
  data,
  dataKey,
  color,
}: InlineChartProps) {
  const isMobile = useIsMobile();
  const [activeChartType, setActiveChartType] = useState<
    "bar" | "line" | "pie" | "area"
  >(chartType);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartColor = color ?? ws.primary;

  const exportPNG = useCallback(() => {
    const container = isFullscreen
      ? document.querySelector("[data-fullscreen-chart]")
      : chartRef.current;
    const svgEl = container?.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.scale(2, 2);
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${title}.png`;
      a.click();
    };
    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  }, [title, isFullscreen]);

  const chartHeight = isMobile ? 160 : 200;

  return (
    <>
      {/* Inline card */}
      <div
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        style={{
          position: "relative",
          width: "100%",
          backgroundColor: ws.surface,
          border: `1px solid ${ws.border}`,
          borderRadius: 14,
          padding: 16,
        }}
      >
        {/* Title row — on mobile, includes action buttons inline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: isMobile ? 4 : 8,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: ws.heading,
              fontFamily: f,
            }}
          >
            {title}
          </div>

          {/* Mobile: always-visible action buttons */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => setIsFullscreen(true)}
                title="Expand"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  color: ws.muted_text,
                }}
              >
                <Maximize2 size={18} />
              </button>
              <button
                onClick={exportPNG}
                title="Download PNG"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  color: ws.muted_text,
                }}
              >
                <Download size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile: segmented type switcher below title */}
        {isMobile && (
          <MobileSegmentedControl
            activeChartType={activeChartType}
            onSelect={setActiveChartType}
          />
        )}

        {/* Desktop: hover toolbar (absolute) */}
        {!isMobile && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: ws.surface,
              border: `1px solid ${ws.border}`,
              borderRadius: 8,
              padding: "4px 8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "translateY(0)" : "translateY(-4px)",
              transition: "opacity 0.15s, transform 0.15s",
              pointerEvents: isHovered ? "auto" : "none",
              zIndex: 5,
            }}
          >
            {/* Type switcher */}
            <TypeDropdown
              activeChartType={activeChartType}
              onSelect={setActiveChartType}
            />

            {/* Divider */}
            <div
              style={{
                width: 1,
                height: 16,
                backgroundColor: ws.border,
                margin: "0 2px",
              }}
            />

            {/* Expand */}
            <button
              onClick={() => setIsFullscreen(true)}
              title="Expand"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: 6,
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: ws.muted_text,
                transition: "color 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = ws.primary)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = ws.muted_text)
              }
            >
              <Maximize2 size={16} />
            </button>

            {/* Download */}
            <button
              onClick={exportPNG}
              title="Download PNG"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: 6,
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                color: ws.muted_text,
                transition: "color 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = ws.primary)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = ws.muted_text)
              }
            >
              <Download size={16} />
            </button>
          </div>
        )}

        {/* Chart area */}
        <div ref={chartRef}>
          <ChartContent
            activeChartType={activeChartType}
            data={data}
            dataKey={dataKey}
            chartColor={chartColor}
            height={chartHeight}
            isMobile={isMobile}
          />
        </div>

        {/* Legend (non-pie) */}
        {activeChartType !== "pie" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: chartColor,
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: ws.muted_text,
                fontFamily: f,
              }}
            >
              {dataKey}
            </span>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <FullscreenModal
          title={title}
          data={data}
          dataKey={dataKey}
          chartColor={chartColor}
          activeChartType={activeChartType}
          onChangeChartType={setActiveChartType}
          onClose={() => setIsFullscreen(false)}
          onExport={exportPNG}
          isMobile={isMobile}
        />
      )}
    </>
  );
}
