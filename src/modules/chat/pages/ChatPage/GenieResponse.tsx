import type { MessageBlock, TextBlock } from "@/modules/chat/types";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { ws, f } from "@/shared/utils/contentTokens";
import { ResponseActions } from "./ResponseActions";
import { InlineTable } from "./InlineTable";
import { InlineChart } from "./InlineChart";

interface GenieResponseProps {
  blocks?: MessageBlock[];
  content: string;
  timestamp: string;
}

export function GenieResponse({ blocks, content, timestamp }: GenieResponseProps) {
  const isMobile = useIsMobile();
  const allTextContent = blocks
    ? blocks
        .filter((b): b is TextBlock => b.type === "text")
        .map((b) => b.content)
        .join("\n")
    : content;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "8px 0",
        gap: 12,
      }}
    >
      {blocks && blocks.length > 0 ? (
        blocks.map((block, i) => {
          if (block.type === "text") {
            return (
              <p
                key={i}
                style={{
                  margin: 0,
                  fontSize: block.bold ? (isMobile ? 15 : 14) : (isMobile ? 14 : 13),
                  fontWeight: block.bold ? 600 : 400,
                  color: block.bold ? ws.heading : ws.body,
                  fontFamily: f,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {block.content}
              </p>
            );
          }

          if (block.type === "table") {
            return (
              <InlineTable
                key={i}
                title={block.title}
                columns={block.columns}
                rows={block.rows}
                totalRows={block.totalRows}
              />
            );
          }

          if (block.type === "chart") {
            return (
              <InlineChart
                key={i}
                title={block.title}
                chartType={block.chartType}
                data={block.data}
                dataKey={block.dataKey}
                color={block.color}
              />
            );
          }

          return null;
        })
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: isMobile ? 14 : 13,
            fontWeight: 400,
            color: ws.body,
            fontFamily: f,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
          }}
        >
          {content}
        </p>
      )}

      <ResponseActions timestamp={timestamp} textContent={allTextContent} />
    </div>
  );
}
