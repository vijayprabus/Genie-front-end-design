export interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsed: string;
  maskedKey: string;
  fullKey: string;
}

export interface Webhook {
  id: string;
  name: string;
  description: string;
  url: string | null;
}
