import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_USER } from "@/shared/utils/devMocks.ts";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, _password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Dev mock - replace with real API call
          await new Promise((resolve) => setTimeout(resolve, 800));
          set({
            user: { ...MOCK_USER, email },
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch {
          set({ error: "Invalid email or password.", isLoading: false });
          return false;
        }
      },

      signup: async (name: string, email: string, _password: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          set({
            user: { ...MOCK_USER, name, email },
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch {
          set({ error: "Signup failed. Please try again.", isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
