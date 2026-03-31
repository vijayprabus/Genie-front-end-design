import { useChat } from "@/modules/chat/hooks/useChat.ts";
import { ChatSidebar } from "./ChatSidebar.tsx";
import { ChatInterface } from "./ChatInterface.tsx";
import { useIsMobile } from "@/shared/hooks/use-mobile.tsx";

export default function ChatPage() {
  const { sessions, activeChatId, messages, isSending, setActiveChat, sendMessage, createNewChat } =
    useChat();
  const isMobile = useIsMobile();

  const showSidebar = !isMobile || !activeChatId;
  const showChat = !isMobile || !!activeChatId;

  return (
    <div className="flex h-full">
      {showSidebar && (
        <ChatSidebar
          sessions={sessions}
          activeChatId={activeChatId}
          onSelectChat={setActiveChat}
          onNewChat={createNewChat}
        />
      )}
      {showChat && (
        <div className="flex-1">
          {activeChatId ? (
            <ChatInterface
              messages={messages}
              isSending={isSending}
              onSend={sendMessage}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Select a chat or start a new one
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
