export interface TeamMember {
  id: string;
  initials: string;
  avatarColor: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  initials: string;
  description: string;
  members: TeamMember[];
  memberCount: number;
  workerCount: number;
  avatarColor: string;
}
