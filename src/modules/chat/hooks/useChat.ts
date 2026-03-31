import { useEffect } from "react";
import { useChatStore } from "@/modules/chat/store/chatStore.ts";

export function useChat() {
  const store = useChatStore();

  useEffect(() => {
    store.fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
