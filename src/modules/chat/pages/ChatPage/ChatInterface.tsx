import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/shared/components/ui/button.tsx";
import { Input } from "@/shared/components/ui/input.tsx";
import { ScrollArea } from "@/shared/components/ui/scroll-area.tsx";
import { MessageBubble } from "./MessageBubble.tsx";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  isSending: boolean;
  onSend: (content: string) => void;
}

export function ChatInterface({ messages, isSending, onSend }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isSending) return;
      onSend(trimmed);
      setInput("");
    },
    [input, isSending, onSend],
  );

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Send a message to start the conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}
            {isSending && (
              <div className="flex gap-3">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-accent" />
                <div className="h-12 w-48 animate-pulse rounded-xl bg-accent" />
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Type your message
          </label>
          <Input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon-sm"
            disabled={!input.trim() || isSending}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  );
}
