import { TextBlock } from "./blocks/TextBlock.tsx";
import { CodeBlock } from "./blocks/CodeBlock.tsx";

interface BlockRendererProps {
  content: string;
}

export function BlockRenderer({ content }: BlockRendererProps) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: Array<{ type: "text" | "code"; content: string; language?: string }> = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: content.slice(lastIndex, match.index).trim() });
    }
    parts.push({ type: "code", content: match[2], language: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const remaining = content.slice(lastIndex).trim();
    if (remaining) parts.push({ type: "text", content: remaining });
  }

  if (parts.length === 0) {
    return <TextBlock content={content} />;
  }

  return (
    <div className="space-y-3">
      {parts.map((part, index) =>
        part.type === "code" ? (
          <CodeBlock key={index} code={part.content} language={part.language} />
        ) : (
          <TextBlock key={index} content={part.content} />
        ),
      )}
    </div>
  );
}
