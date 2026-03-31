import { create } from "zustand";

interface AnalyticsState {
  isLoading: boolean;
}

export const useAnalyticsStore = create<AnalyticsState>(() => ({
  isLoading: false,
}));
