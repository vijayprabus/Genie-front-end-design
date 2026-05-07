export interface TextBlock {
  type: "text";
  content: string;
  bold?: boolean; // for headings/titles within response
}

export interface TableColumn {
  key: string;
  label: string;
  width?: number; // fixed width in px, otherwise flex
}

export interface TableBlock {
  type: "table";
  title: string;
  columns: TableColumn[];
  rows: Record<string, string | number>[];
  totalRows?: number; // for "Showing X of Y"
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number; // allow extra data keys
}

export interface ChartBlock {
  type: "chart";
  title: string;
  chartType: "bar" | "line" | "pie" | "area";
  data: ChartDataPoint[];
  dataKey: string;
  color?: string;
}

export type MessageBlock = TextBlock | TableBlock | ChartBlock;

export interface ChatMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  blocks?: MessageBlock[];
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
}
