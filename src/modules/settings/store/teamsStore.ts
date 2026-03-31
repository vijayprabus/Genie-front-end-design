import { create } from 'zustand';
import type { Team } from '@/modules/settings/types/index.ts';
import { mockTeams } from '@/modules/settings/data/mockData.ts';

interface TeamsState {
  teams: Team[];
  search: string;
  filteredTeams: () => Team[];
  setSearch: (search: string) => void;
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  removeTeam: (id: string) => void;
}

export const useTeamsStore = create<TeamsState>((set, get) => ({
  teams: mockTeams,
  search: '',

  filteredTeams: () => {
    const { teams, search } = get();
    if (!search) return teams;
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()),
    );
  },

  setSearch: (search) => set({ search }),

  addTeam: (team) =>
    set((state) => ({ teams: [...state.teams, team] })),
  updateTeam: (id, updates) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTeam: (id) =>
    set((state) => ({ teams: state.teams.filter((t) => t.id !== id) })),
}));
