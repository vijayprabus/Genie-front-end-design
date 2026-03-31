export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    forgotPassword: "/auth/forgot-password",
  },
  users: {
    profile: "/users/profile",
    list: "/users",
    update: (id: string) => `/users/${id}`,
  },
  chat: {
    list: "/chat/sessions",
    create: "/chat/sessions",
    messages: (chatId: string) => `/chat/${chatId}/messages`,
    send: (chatId: string) => `/chat/${chatId}/send`,
  },
  marketplace: {
    list: "/marketplace",
    agents: "/marketplace/agents",
    details: (id: string) => `/marketplace/${id}`,
  },
} as const;
