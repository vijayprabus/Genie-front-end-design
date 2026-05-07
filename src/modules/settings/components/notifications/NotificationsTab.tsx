import { useState } from "react";
import { Switch } from "@/shared/components/ui/switch";
import { toast } from "sonner";
import { ws as baseWs, f } from "@/shared/utils/contentTokens";
import { Card } from "@/shared/components/settings";

const ws = { ...baseWs, sidebar: baseWs.sidebarZone };

interface SettingRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
  isLast?: boolean;
}

function SettingRow({ label, description, children, isLast = false }: SettingRowProps) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: isLast ? "none" : `1px solid ${ws.divider}`,
        fontFamily: f,
      }}
    >
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: ws.body, margin: 0, lineHeight: 1.4 }}>{label}</p>
        <p style={{ fontSize: 12, fontWeight: 400, color: ws.muted_text, margin: 0, marginTop: 1, lineHeight: 1.4 }}>{description}</p>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function NotificationCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Card>
        <div style={{ padding: 20, fontFamily: f }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: ws.heading, margin: 0 }}>{title}</h3>
          <p style={{ fontSize: 12, fontWeight: 400, color: ws.muted_text, margin: 0, marginTop: 4, marginBottom: 16 }}>{description}</p>
          {children}
        </div>
      </Card>
    </div>
  );
}

function ToggleSetting({
  label,
  description,
  defaultChecked = false,
  isLast = false,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
  isLast?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <SettingRow label={label} description={description} isLast={isLast}>
      <Switch
        checked={checked}
        onCheckedChange={(val) => {
          setChecked(val);
          toast("Setting updated");
        }}
      />
    </SettingRow>
  );
}

export default function NotificationsTab() {
  return (
    <section style={{ fontFamily: f }}>
      <NotificationCard
        title="HITL Decision Routing"
        description="How team members receive decision requests when a worker flags for human review."
      >
        <ToggleSetting
          label="Email notifications"
          description="Send HITL requests to assignee's email"
          defaultChecked
        />
        <ToggleSetting
          label="Slack notifications"
          description="Post to team's Slack channel"
          defaultChecked
        />
        <SettingRow
          label="Slack channel"
          description="Where HITL requests are posted"
          isLast
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: ws.body }}>
            #collections-reviews
          </span>
        </SettingRow>
      </NotificationCard>

      <NotificationCard
        title="Daily Digest"
        description="Morning summary of overnight workforce activity sent to all Org Admins."
      >
        <ToggleSetting
          label="Enabled"
          description="Receive daily digest emails"
          defaultChecked
        />
        <SettingRow
          label="Delivery time"
          description="When the digest is sent each morning"
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: ws.body }}>6:00 AM IST</span>
        </SettingRow>
        <SettingRow
          label="Include in digest"
          description="Summary content categories"
          isLast
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: ws.body }}>
            Tasks completed, HITL pending, errors
          </span>
        </SettingRow>
      </NotificationCard>

      <NotificationCard
        title="Escalation Rules"
        description="Automatic escalation when HITL decisions are not acted on within the configured window."
      >
        <SettingRow
          label="Escalation timer"
          description="Reassign to backup after this duration"
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: ws.body }}>6 hours</span>
        </SettingRow>
        <ToggleSetting
          label="Notify admin"
          description="Alert Org Admins when escalation triggers"
          defaultChecked
        />
        <ToggleSetting
          label="Worker pause alert"
          description="Notify when a worker pauses due to blocking issue"
          defaultChecked
        />
        <ToggleSetting
          label="Integration alert"
          description="Notify when a connection fails or token expires"
          defaultChecked
          isLast
        />
      </NotificationCard>
    </section>
  );
}
