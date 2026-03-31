import { create } from 'zustand';

interface GeneralSettings {
  orgName: string;
  timezone: string;
  connectionStatus: 'Connected' | 'Disconnected';
  effortBasis: string;
}

interface SettingsState {
  general: GeneralSettings;
  setOrgName: (name: string) => void;
  setTimezone: (tz: string) => void;
  setConnectionStatus: (status: 'Connected' | 'Disconnected') => void;
  setEffortBasis: (basis: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  general: {
    orgName: 'Acme Corporation',
    timezone: 'Asia/Kolkata (UTC+5:30)',
    connectionStatus: 'Connected',
    effortBasis: 'Per task average',
  },
  setOrgName: (name) =>
    set((state) => ({ general: { ...state.general, orgName: name } })),
  setTimezone: (tz) =>
    set((state) => ({ general: { ...state.general, timezone: tz } })),
  setConnectionStatus: (status) =>
    set((state) => ({ general: { ...state.general, connectionStatus: status } })),
  setEffortBasis: (basis) =>
    set((state) => ({ general: { ...state.general, effortBasis: basis } })),
}));
