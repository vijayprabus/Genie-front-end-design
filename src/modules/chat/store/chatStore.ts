import { create } from "zustand";
import { MOCK_CHAT_SESSIONS, MOCK_MESSAGES } from "@/shared/utils/devMocks.ts";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatState {
  sessions: ChatSession[];
  activeChatId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  fetchSessions: () => Promise<void>;
  setActiveChat: (chatId: string) => void;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  createNewChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeChatId: null,
  messages: [],
  isLoading: false,
  isSending: false,

  fetchSessions: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ sessions: [...MOCK_CHAT_SESSIONS], isLoading: false });
  },

  setActiveChat: (chatId: string) => {
    set({ activeChatId: chatId });
    get().fetchMessages(chatId);
  },

  fetchMessages: async (chatId: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 200));
    const msgs = MOCK_MESSAGES.filter((m) => m.chatId === chatId);
    set({ messages: msgs, isLoading: false });
  },

  sendMessage: async (content: string) => {
    const { activeChatId, messages } = get();
    if (!activeChatId) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      chatId: activeChatId,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    set({ messages: [...messages, userMsg], isSending: true });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      chatId: activeChatId,
      role: "assistant",
      content: `I received your message: "${content}". This is a mock response.`,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, assistantMsg],
      isSending: false,
    }));
  },

  createNewChat: () => {
    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      title: "New Chat",
      lastMessage: "",
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      sessions: [newChat, ...state.sessions],
      activeChatId: newChat.id,
      messages: [],
    }));
  },
}));
