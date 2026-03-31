export const MOCK_USER = {
  id: "user-1",
  name: "Demo User",
  email: "demo@genieforge.dev",
  avatar: "",
  permissions: ["chat", "analytics", "marketplace", "settings"] as string[],
};

export const MOCK_CHAT_SESSIONS = [
  { id: "chat-1", title: "Project Planning", lastMessage: "Let's define the roadmap", updatedAt: "2025-10-12T10:00:00Z" },
  { id: "chat-2", title: "Bug Investigation", lastMessage: "Found the root cause", updatedAt: "2025-10-11T15:30:00Z" },
  { id: "chat-3", title: "Feature Discussion", lastMessage: "Looks good to me", updatedAt: "2025-10-10T09:00:00Z" },
];

export const MOCK_MESSAGES = [
  { id: "msg-1", chatId: "chat-1", role: "user" as const, content: "Can you help me plan the project?", timestamp: "2025-10-12T10:00:00Z" },
  { id: "msg-2", chatId: "chat-1", role: "assistant" as const, content: "Of course! Let's start by defining the key milestones.", timestamp: "2025-10-12T10:01:00Z" },
];
