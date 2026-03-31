import { create } from 'zustand';
import type { ApiKey } from '@/modules/settings/types/index.ts';
import { mockApiKeys } from '@/modules/settings/data/mockData.ts';

interface ApiState {
  apiKeys: ApiKey[];
  addApiKey: (key: ApiKey) => void;
  removeApiKey: (id: string) => void;
  revokeApiKey: (id: string) => void;
}

export const useApiStore = create<ApiState>((set) => ({
  apiKeys: mockApiKeys,

  addApiKey: (key) =>
    set((state) => ({ apiKeys: [...state.apiKeys, key] })),
  removeApiKey: (id) =>
    set((state) => ({ apiKeys: state.apiKeys.filter((k) => k.id !== id) })),
  revokeApiKey: (id) =>
    set((state) => ({
      apiKeys: state.apiKeys.filter((k) => k.id !== id),
    })),
}));
