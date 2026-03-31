import type { Member, Team, NotificationCard, BillingStat, WorkerUsage, ApiKey, Webhook } from '@/modules/settings/types/index.ts';

// ── Members ──────────────────────────────────────────────────────────
export const mockMembers: Member[] = [
  {
    id: 'm1',
    name: 'Chirag Mehta',
    email: 'chirag.mehta@marico.com',
    initials: 'CM',
    avatarColor: '#4361EE',
    role: 'Super Admin',
    teams: [],
    status: 'Active',
    joinedAt: '2024-01-15',
  },
  {
    id: 'm2',
    name: 'Priya Patel',
    email: 'priya.patel@marico.com',
    initials: 'PP',
    avatarColor: '#7C3AED',
    role: 'Member',
    teams: ['North Region', 'Analytics'],
    status: 'Active',
    joinedAt: '2024-02-10',
  },
  {
    id: 'm3',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@marico.com',
    initials: 'RS',
    avatarColor: '#F97316',
    role: 'Org Admin',
    teams: [],
    status: 'Active',
    joinedAt: '2024-01-20',
  },
  {
    id: 'm4',
    name: 'Anita Desai',
    email: 'anita.desai@marico.com',
    initials: 'AD',
    avatarColor: '#10B981',
    role: 'Member',
    teams: ['North Region'],
    status: 'Active',
    joinedAt: '2024-03-05',
  },
  {
    id: 'm5',
    name: 'Vikram Singh',
    email: 'vikram.singh@marico.com',
    initials: 'VS',
    avatarColor: '#EF4444',
    role: 'Member',
    teams: ['Field Ops'],
    status: 'Active',
    joinedAt: '2024-03-12',
  },
  {
    id: 'm6',
    name: 'Meera Krishnan',
    email: 'meera.k@marico.com',
    initials: 'MK',
    avatarColor: '#EC4899',
    role: 'Member',
    teams: ['Analytics'],
    status: 'Pending',
    joinedAt: '2025-03-01',
  },
  {
    id: 'm7',
    name: 'Arjun Reddy',
    email: 'arjun.r@marico.com',
    initials: 'AR',
    avatarColor: '#4361EE',
    role: 'Member',
    teams: ['South Region', 'Finance'],
    status: 'Active',
    joinedAt: '2024-04-18',
  },
  {
    id: 'm8',
    name: 'Sneha Gupta',
    email: 'sneha.g@marico.com',
    initials: 'SG',
    avatarColor: '#7C3AED',
    role: 'Org Admin',
    teams: [],
    status: 'Active',
    joinedAt: '2024-02-25',
  },
  {
    id: 'm9',
    name: 'Karthik Iyer',
    email: 'karthik.i@marico.com',
    initials: 'KI',
    avatarColor: '#F97316',
    role: 'Member',
    teams: ['Finance'],
    status: 'Pending',
    joinedAt: '2025-03-10',
  },
];

// ── Teams ────────────────────────────────────────────────────────────
export const mockTeams: Team[] = [
  {
    id: 't1',
    name: 'Field Operations',
    initials: 'FO',
    description: 'Ground operations and distribution management',
    members: [
      { id: 'm5', initials: 'VS', avatarColor: '#EF4444', name: 'Vikram Singh' },
    ],
    memberCount: 45,
    workerCount: 4,
    avatarColor: '#4361EE',
  },
  {
    id: 't2',
    name: 'South Region',
    initials: 'SR',
    description: 'Sales and operations for South India',
    members: [
      { id: 'm7', initials: 'AR', avatarColor: '#4361EE', name: 'Arjun Reddy' },
    ],
    memberCount: 18,
    workerCount: 2,
    avatarColor: '#EF4444',
  },
  {
    id: 't3',
    name: 'North Region',
    initials: 'NR',
    description: 'Sales and operations for North India',
    members: [
      { id: 'm2', initials: 'PP', avatarColor: '#7C3AED', name: 'Priya Patel' },
      { id: 'm4', initials: 'AD', avatarColor: '#10B981', name: 'Anita Desai' },
    ],
    memberCount: 12,
    workerCount: 2,
    avatarColor: '#F97316',
  },
  {
    id: 't4',
    name: 'Analytics',
    initials: 'AN',
    description: 'Data science and business intelligence',
    members: [
      { id: 'm2', initials: 'PP', avatarColor: '#7C3AED', name: 'Priya Patel' },
      { id: 'm6', initials: 'MK', avatarColor: '#EC4899', name: 'Meera Krishnan' },
    ],
    memberCount: 8,
    workerCount: 1,
    avatarColor: '#7C3AED',
  },
  {
    id: 't5',
    name: 'Finance',
    initials: 'FI',
    description: 'Accounting, reporting, and planning',
    members: [
      { id: 'm7', initials: 'AR', avatarColor: '#4361EE', name: 'Arjun Reddy' },
      { id: 'm9', initials: 'KI', avatarColor: '#F97316', name: 'Karthik Iyer' },
    ],
    memberCount: 6,
    workerCount: 0,
    avatarColor: '#10B981',
  },
  {
    id: 't6',
    name: 'KYC Team',
    initials: 'KY',
    description: 'Verification and compliance',
    members: [],
    memberCount: 4,
    workerCount: 3,
    avatarColor: '#EC4899',
  },
];

// ── Notifications ────────────────────────────────────────────────────
export const mockNotificationCards: NotificationCard[] = [
  {
    id: 'nc1',
    title: 'Worker Notifications',
    description: 'Get notified about worker activity and status changes.',
    settings: [
      { id: 'n1', label: 'Task completion alerts', description: 'Receive alerts when a worker completes a task', enabled: true },
      { id: 'n2', label: 'Task failure alerts', description: 'Receive alerts when a worker encounters an error', enabled: true },
      { id: 'n3', label: 'Worker status changes', description: 'Notifications when workers go online or offline', enabled: false },
    ],
  },
  {
    id: 'nc2',
    title: 'Team & Member Notifications',
    description: 'Stay updated on team and member activities.',
    settings: [
      { id: 'n4', label: 'New member joins', description: 'When a new member is added to your team', enabled: true },
      { id: 'n5', label: 'Role changes', description: 'When a member role is updated', enabled: false },
      { id: 'n6', label: 'Team updates', description: 'Changes to team structure or settings', enabled: true },
    ],
  },
  {
    id: 'nc3',
    title: 'Billing & Usage',
    description: 'Alerts related to billing and resource usage.',
    settings: [
      { id: 'n7', label: 'Usage threshold alerts', description: 'When usage reaches 80% of your plan limit', enabled: true },
      { id: 'n8', label: 'Invoice notifications', description: 'When a new invoice is generated', enabled: true },
      { id: 'n9', label: 'Digest frequency', value: 'weekly' },
    ],
  },
];

// ── Billing ──────────────────────────────────────────────────────────
export const mockBillingStats: BillingStat[] = [
  { value: '8,412', label: 'TASKS THIS MONTH', detail: 'Mar 1 – 16, 2026' },
  { value: '6', label: 'WORKERS DEPLOYED', detail: '5 live, 1 draft' },
  { value: '9', label: 'TEAM MEMBERS', detail: '7 active, 2 pending' },
  { value: '1,240 hrs', label: 'EFFORT SAVED (MTD)', detail: '\u2248 155 person-days' },
];

export const mockWorkerUsage: WorkerUsage[] = [
  { name: 'Collections Specialist', tasksMTD: '1,420', success: '96.4%', effortSaved: '213 hrs' },
  { name: 'Order Intake Worker', tasksMTD: '3,840', success: '99.8%', effortSaved: '576 hrs' },
  { name: 'Credit Note Specialist', tasksMTD: '2,460', success: '99.2%', effortSaved: '369 hrs' },
  { name: 'KYC Verification Worker', tasksMTD: '340', success: '97.2%', effortSaved: '51 hrs' },
  { name: 'Cash Recon Specialist', tasksMTD: '352', success: '74%', effortSaved: '31 hrs' },
];

// ── API & Integrations ──────────────────────────────────────────────
export const mockApiKeys: ApiKey[] = [
  {
    id: 'ak1',
    name: 'Production API Key',
    createdAt: 'Created Mar 1, 2026',
    lastUsed: 'Last used 2 hours ago',
    maskedKey: 'genie_prod_sk_...x4mK',
    fullKey: 'genie_prod_sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4mK',
  },
  {
    id: 'ak2',
    name: 'Development API Key',
    createdAt: 'Created Feb 15, 2026',
    lastUsed: 'Last used 3 days ago',
    maskedKey: 'genie_dev_sk_...r2pQ',
    fullKey: 'genie_dev_sk_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4r2pQ',
  },
];

export const mockWebhooks: Webhook[] = [
  {
    id: 'wh1',
    name: 'HITL webhook',
    description: 'POST when a worker flags a decision for human review',
    url: null,
  },
  {
    id: 'wh2',
    name: 'Worker status webhook',
    description: 'POST when a worker starts, completes, pauses, or errors',
    url: null,
  },
  {
    id: 'wh3',
    name: 'Task completion webhook',
    description: 'POST for every completed task with result payload',
    url: null,
  },
];

export const mockDocLinks = [
  { id: 'doc1', title: 'API Reference', description: 'REST API documentation for programmatic access', url: 'https://docs.genieforge.dev/api' },
  { id: 'doc2', title: 'Text-to-SQL API', description: 'Query your data sources programmatically via Genie\u2019s analytics engine', url: 'https://docs.genieforge.dev/text-to-sql' },
];

// ── General Settings ─────────────────────────────────────────────────
export const mockGeneralSettings = {
  orgName: 'Marico',
  timezone: 'IST (UTC+5:30)',
  connectionStatus: 'Connected' as const,
  connectionDetail: 'via Javis API \u00b7 synced 2m ago',
  effortBasis: '9 min/task' as const,
};
