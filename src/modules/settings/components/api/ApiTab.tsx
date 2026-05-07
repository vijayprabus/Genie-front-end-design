import { Copy, RefreshCw, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  mockApiKeys,
  mockWebhooks,
  mockDocLinks,
} from "@/modules/settings/data/mockData";
import { ws as baseWs, f } from "@/shared/utils/contentTokens";
import { Card } from "@/shared/components/settings";

const ws = { ...baseWs, sidebar: baseWs.sidebarZone };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
      letterSpacing: 0.5, color: ws.secondary, margin: 0,
      borderBottom: `1px solid ${ws.border}`, paddingBottom: 8, marginBottom: 12,
      fontFamily: f,
    }}>
      {children}
    </h3>
  );
}

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: "none", border: "none", cursor: "pointer",
        fontSize: 12, fontWeight: 400, color: ws.secondary, fontFamily: f,
        padding: "5px 10px", borderRadius: 6, transition: "background-color 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ws.hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {children}
    </button>
  );
}

export default function ApiTab() {
  const handleCopyKey = (fullKey: string) => {
    navigator.clipboard.writeText(fullKey).then(() => {
      toast.success("API key copied to clipboard");
    });
  };

  const handleRegenerateKey = (_name: string) => {
    toast(`API key regenerated`);
  };

  const handleCreateKey = () => {
    toast.success("API key created");
  };

  return (
    <div style={{ fontFamily: f }}>
      {/* API Keys section */}
      <div style={{ marginBottom: 32 }}>
        <SectionLabel>API Keys</SectionLabel>

        <Card>
          {mockApiKeys.map((key, i) => (
            <div
              key={key.id}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: i < mockApiKeys.length - 1 ? `1px solid ${ws.divider}` : "none",
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: ws.body, margin: 0 }}>
                  {key.name}
                </p>
                <p style={{ fontSize: 12, fontWeight: 400, color: ws.muted_text, margin: 0, marginTop: 2 }}>
                  {key.createdAt} &middot; {key.lastUsed}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <code style={{
                  fontFamily: "monospace", fontSize: 12,
                  backgroundColor: ws.muted, padding: "4px 10px",
                  borderRadius: 6, color: ws.secondary,
                }}>
                  {key.maskedKey}
                </code>
                <GhostButton onClick={() => handleCopyKey(key.fullKey)}>
                  <Copy size={13} />
                  Copy
                </GhostButton>
                <GhostButton onClick={() => handleRegenerateKey(key.name)}>
                  <RefreshCw size={13} />
                  Regenerate
                </GhostButton>
              </div>
            </div>
          ))}
        </Card>

        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleCreateKey}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 8, border: "none",
              backgroundColor: ws.primary, color: ws.onPrimary,
              fontSize: 13, fontWeight: 500, fontFamily: f, cursor: "pointer",
            }}
          >
            <Plus size={14} strokeWidth={2} />
            Create API Key
          </button>
        </div>
      </div>

      {/* Webhooks section */}
      <div style={{ marginBottom: 32 }}>
        <SectionLabel>Webhooks</SectionLabel>

        <Card>
          {mockWebhooks.map((webhook, i) => (
            <div
              key={webhook.id}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: i < mockWebhooks.length - 1 ? `1px solid ${ws.divider}` : "none",
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: ws.body, margin: 0 }}>
                  {webhook.name}
                </p>
                <p style={{ fontSize: 12, fontWeight: 400, color: ws.muted_text, margin: 0, marginTop: 2 }}>
                  {webhook.description}
                </p>
              </div>
              <span style={{ fontSize: 12, color: webhook.url ? ws.secondary : ws.disabled }}>
                {webhook.url ? webhook.url : "Not configured"}
              </span>
            </div>
          ))}
        </Card>
      </div>

      {/* Documentation section */}
      <div>
        <SectionLabel>Documentation</SectionLabel>

        <Card>
          {mockDocLinks.map((doc, idx) => (
            <div
              key={idx}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: idx < mockDocLinks.length - 1 ? `1px solid ${ws.divider}` : "none",
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: ws.body, margin: 0 }}>
                  {doc.title}
                </p>
                <p style={{ fontSize: 12, fontWeight: 400, color: ws.muted_text, margin: 0, marginTop: 2 }}>
                  {doc.description}
                </p>
              </div>
              <GhostButton>
                Open docs
                <ExternalLink size={13} />
              </GhostButton>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
