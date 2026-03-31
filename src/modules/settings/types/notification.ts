export interface NotificationToggle {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
}

export interface NotificationCard {
  id: string;
  title: string;
  description: string;
  settings: (NotificationToggle | { id: string; label: string; description?: string; value: string })[];
}
