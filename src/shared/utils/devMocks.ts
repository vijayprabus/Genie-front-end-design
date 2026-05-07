import type { MessageBlock } from "@/modules/chat/types";

export const MOCK_USER = {
  id: "user-1",
  name: "Demo User",
  email: "demo@genieforge.dev",
  avatar: "",
  permissions: ["chat", "analytics", "marketplace", "settings"] as string[],
};

export const MOCK_CHAT_SESSIONS = [
  { id: "chat-1", title: "Project Planning", lastMessage: "Let's define the roadmap", updatedAt: "2025-10-12T10:00:00Z" },
  { id: "chat-2", title: "Bug Investigation", lastMessage: "Found the root cause", updatedAt: "2025-10-11T15:30:00Z" },
  { id: "chat-3", title: "Feature Discussion", lastMessage: "Looks good to me", updatedAt: "2025-10-10T09:00:00Z" },
  { id: "chat-4", title: "Q2 Marketing Campaign", lastMessage: "Updated the timeline", updatedAt: "2025-10-09T14:20:00Z" },
  { id: "chat-5", title: "Customer Feedback Analysis", lastMessage: "NPS scores are up", updatedAt: "2025-10-08T11:00:00Z" },
  { id: "chat-6", title: "Budget Reallocation", lastMessage: "Shifted 15% to engineering", updatedAt: "2025-10-08T09:30:00Z" },
  { id: "chat-7", title: "Team Standup Notes", lastMessage: "Blocked on API review", updatedAt: "2025-10-07T08:45:00Z" },
  { id: "chat-8", title: "API Integration Issues", lastMessage: "Timeout at 30s mark", updatedAt: "2025-10-07T16:00:00Z" },
  { id: "chat-9", title: "Q1 Revenue Report", lastMessage: "Revenue up 12% YoY", updatedAt: "2025-10-04T10:00:00Z" },
  { id: "chat-10", title: "Onboarding Flow Redesign", lastMessage: "New mockups shared", updatedAt: "2025-10-03T13:00:00Z" },
  { id: "chat-11", title: "Vendor Contract Review", lastMessage: "Legal flagged clause 4.2", updatedAt: "2025-10-01T17:00:00Z" },
  { id: "chat-12", title: "Sprint Retrospective", lastMessage: "Velocity improved this sprint", updatedAt: "2025-09-28T15:00:00Z" },
];

export const MOCK_MESSAGES: Array<{
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  blocks?: MessageBlock[];
  timestamp: string;
}> = [
  {
    id: "msg-1",
    chatId: "chat-1",
    role: "user",
    content: "Check the current purchase order status for Q4 shipments",
    timestamp: "2025-10-12T10:00:00Z",
  },
  {
    id: "msg-2",
    chatId: "chat-1",
    role: "assistant",
    content: "",
    timestamp: "2025-10-12T10:01:00Z",
    blocks: [
      { type: "text", content: "Q4 Purchase Order Summary", bold: true },
      {
        type: "text",
        content:
          "Here's the current status of your Q4 shipments across all regions. 3 orders are pending approval, 12 are in transit, and 5 have been delivered this week.",
      },
      {
        type: "table",
        title: "Q4 Purchase Orders",
        columns: [
          { key: "po", label: "PO Number", width: 120 },
          { key: "supplier", label: "Supplier" },
          { key: "status", label: "Status", width: 110 },
          { key: "amount", label: "Amount", width: 100 },
          { key: "date", label: "Date", width: 90 },
        ],
        rows: [
          { po: "PO-4521", supplier: "Acme Corp", status: "In Transit", amount: "$12,450", date: "Oct 12" },
          { po: "PO-4522", supplier: "GlobalTech", status: "Pending", amount: "$8,200", date: "Oct 13" },
          { po: "PO-4523", supplier: "NovaParts", status: "Delivered", amount: "$15,800", date: "Oct 11" },
          { po: "PO-4524", supplier: "Acme Corp", status: "In Transit", amount: "$6,900", date: "Oct 14" },
          { po: "PO-4525", supplier: "TechFlow", status: "In Transit", amount: "$9,340", date: "Oct 15" },
          { po: "PO-4526", supplier: "NovaParts", status: "Pending", amount: "$4,100", date: "Oct 15" },
          { po: "PO-4527", supplier: "GlobalTech", status: "Delivered", amount: "$11,200", date: "Oct 10" },
          { po: "PO-4528", supplier: "Acme Corp", status: "Pending", amount: "$7,650", date: "Oct 16" },
        ],
        totalRows: 24,
      },
      {
        type: "chart",
        title: "Orders by Region",
        chartType: "bar",
        data: [
          { name: "North", value: 65 },
          { name: "South", value: 45 },
          { name: "East", value: 80 },
          { name: "West", value: 35 },
        ],
        dataKey: "value",
      },
    ] satisfies MessageBlock[],
  },
  {
    id: "msg-3",
    chatId: "chat-1",
    role: "user",
    content: "Can you break down the pending orders by supplier?",
    timestamp: "2025-10-12T10:02:00Z",
  },
  {
    id: "msg-4",
    chatId: "chat-1",
    role: "assistant",
    content: "",
    timestamp: "2025-10-12T10:03:00Z",
    blocks: [
      { type: "text", content: "Pending Orders Breakdown", bold: true },
      {
        type: "text",
        content:
          "There are currently 3 pending purchase orders awaiting approval. Here's the breakdown by supplier:",
      },
      {
        type: "table",
        title: "Pending Orders",
        columns: [
          { key: "po", label: "PO Number", width: 120 },
          { key: "supplier", label: "Supplier" },
          { key: "amount", label: "Amount", width: 100 },
          { key: "submitted", label: "Submitted", width: 100 },
          { key: "approver", label: "Approver" },
        ],
        rows: [
          { po: "PO-4522", supplier: "GlobalTech", amount: "$8,200", submitted: "Oct 13", approver: "Sarah Chen" },
          { po: "PO-4526", supplier: "NovaParts", amount: "$4,100", submitted: "Oct 15", approver: "James Liu" },
          { po: "PO-4528", supplier: "Acme Corp", amount: "$7,650", submitted: "Oct 16", approver: "Sarah Chen" },
        ],
        totalRows: 3,
      },
      {
        type: "chart",
        title: "Pending Amount by Supplier",
        chartType: "bar",
        data: [
          { name: "GlobalTech", value: 8200 },
          { name: "NovaParts", value: 4100 },
          { name: "Acme Corp", value: 7650 },
        ],
        dataKey: "value",
      },
    ] satisfies MessageBlock[],
  },
];
