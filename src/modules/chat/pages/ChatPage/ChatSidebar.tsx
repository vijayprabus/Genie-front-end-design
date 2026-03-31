import { Plus, MessageSquare } from "lucide-react";
import { cn } from "@/shared/utils/cn.ts";
import { Button } from "@/shared/components/ui/button.tsx";
import { ScrollArea } from "@/shared/components/ui/scroll-area.tsx";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({ sessions, activeChatId, onSelectChat, onNewChat }: ChatSidebarProps) {
  return (
    <div className="flex h-full w-full flex-col border-r md:w-72">
      <div className="flex items-center justify-between p-3">
        <h2 className="text-sm font-semibold">Chats</h2>
        <Button variant="ghost" size="icon-sm" onClick={onNewChat} aria-label="New chat">
          <Plus className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
            <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">No chats yet</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onNewChat}>
              Start a chat
            </Button>
          </div>
        ) : (
          <ul className="space-y-1 px-2" role="list">
            {sessions.map((session) => (
              <li key={session.id}>
                <button
                  onClick={() => onSelectChat(session.id)}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent touch-target-min",
                    activeChatId === session.id && "bg-accent",
                  )}
                >
                  <span className="font-medium text-foreground">{session.title}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {session.lastMessage || "No messages"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
