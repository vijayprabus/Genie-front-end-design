import { Upload } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toast } from "sonner";
import { ws as baseWs } from "@/shared/utils/contentTokens";

const ws = { ...baseWs, sidebar: baseWs.sidebarZone };

function SettingRow({
  label,
  description,
  children,
  isLast = false,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: "16px 0",
        borderBottom: isLast ? "none" : `1px solid ${ws.border}`,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div className="flex flex-col" style={{ gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: ws.heading }}>
          {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 400, color: ws.secondary }}>
          {description}
        </span>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function GeneralTab() {
  return (
    <section style={{ fontFamily: "Inter, sans-serif" }}>
      <div
        style={{
          padding: "12px 0",
          borderBottom: `1px solid ${ws.border}`,
          marginBottom: 0,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase" as const,
            color: ws.secondary,
          }}
        >
          Organization
        </span>
      </div>

      <SettingRow
        label="Organization logo"
        description="Displayed in the sidebar. Recommended 128×128px."
      >
        <div className="flex items-center" style={{ gap: 16 }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              border: `2px dashed ${ws.disabled}`,
            }}
          >
            <span style={{ fontSize: 9, color: ws.muted_text, textAlign: "center" as const, lineHeight: 1.3 }}>
              Upload<br />logo
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast("Upload dialog coming soon")}
            style={{ fontSize: 13, fontWeight: 400, color: ws.secondary }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </SettingRow>

      <SettingRow
        label="Organization name"
        description="Displayed in the sidebar and reports"
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: ws.heading }}>
          Marico
        </span>
      </SettingRow>

      <SettingRow
        label="Javis connection"
        description="Parent platform integration"
      >
        <div className="flex flex-col items-end" style={{ gap: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: ws.heading }}>
            Connected
          </span>
          <span style={{ fontSize: 12, fontWeight: 400, color: ws.secondary }}>
            via Javis API · synced 2m ago
          </span>
        </div>
      </SettingRow>

      <SettingRow
        label="Default timezone"
        description="Used for scheduling and timestamps"
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: ws.heading }}>
          IST (UTC+5:30)
        </span>
      </SettingRow>

      <SettingRow
        label="Effort estimation basis"
        description="Used for 'hours saved' on Home. Adjustable per worker."
        isLast
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: ws.heading }}>
          9 min/task
        </span>
      </SettingRow>
    </section>
  );
}
