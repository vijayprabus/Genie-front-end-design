import { cn } from "@/shared/utils/cn.ts";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar.tsx";
import { BlockRenderer } from "./BlockRenderer.tsx";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser && "flex-row-reverse",
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(isUser ? "bg-primary text-primary-foreground" : "bg-accent")}>
          {isUser ? "U" : "G"}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[80%] rounded-xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground",
        )}
      >
        <BlockRenderer content={content} />
      </div>
    </div>
  );
}
