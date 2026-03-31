import { create } from 'zustand';

interface NotificationsState {
  toggles: Record<string, boolean>;
  values: Record<string, string>;
  setToggle: (id: string, enabled: boolean) => void;
  setValue: (id: string, value: string) => void;
  getToggle: (id: string) => boolean;
  getValue: (id: string) => string;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  toggles: {
    n1: true,
    n2: true,
    n3: false,
    n4: true,
    n5: false,
    n6: true,
    n7: true,
    n8: true,
  },
  values: {
    n9: 'weekly',
  },

  setToggle: (id, enabled) =>
    set((state) => ({ toggles: { ...state.toggles, [id]: enabled } })),
  setValue: (id, value) =>
    set((state) => ({ values: { ...state.values, [id]: value } })),
  getToggle: (id) => get().toggles[id] ?? false,
  getValue: (id) => get().values[id] ?? '',
}));
