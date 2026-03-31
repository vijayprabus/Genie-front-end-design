import { create } from 'zustand';
import type { Member, MemberRole, MemberStatus } from '@/modules/settings/types/index.ts';
import { mockMembers } from '@/modules/settings/data/mockData.ts';

interface MembersState {
  members: Member[];
  search: string;
  roleFilter: MemberRole | 'All';
  statusFilter: MemberStatus | 'All';
  filteredMembers: () => Member[];
  setSearch: (search: string) => void;
  setRoleFilter: (role: MemberRole | 'All') => void;
  setStatusFilter: (status: MemberStatus | 'All') => void;
  addMember: (member: Member) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  removeMember: (id: string) => void;
}

export const useMembersStore = create<MembersState>((set, get) => ({
  members: mockMembers,
  search: '',
  roleFilter: 'All',
  statusFilter: 'All',

  filteredMembers: () => {
    const { members, search, roleFilter, statusFilter } = get();
    return members.filter((m) => {
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'All' || m.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  },

  setSearch: (search) => set({ search }),
  setRoleFilter: (roleFilter) => set({ roleFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),

  addMember: (member) =>
    set((state) => ({ members: [...state.members, member] })),
  updateMember: (id, updates) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  removeMember: (id) =>
    set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
}));
