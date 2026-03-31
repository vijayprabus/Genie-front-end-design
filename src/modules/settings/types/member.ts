export type MemberRole = 'Super Admin' | 'Org Admin' | 'Member';
export type MemberStatus = 'Active' | 'Pending' | 'Deactivated';

export interface Member {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor: string;
  role: MemberRole;
  teams: string[];
  status: MemberStatus;
  joinedAt: string;
}
