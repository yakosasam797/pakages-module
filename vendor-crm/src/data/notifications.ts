export type NotificationKind =
  | "mention"
  | "task"
  | "approval"
  | "booking"
  | "finance"
  | "system";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  when: string;
  unread: boolean;
};

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    kind: "mention",
    title: "Anjali mentioned you",
    body: "Can you confirm the Lake View Suite MAP price for XYZ Family?",
    when: "12 min ago",
    unread: true,
  },
  {
    id: "n2",
    kind: "task",
    title: "Task assigned",
    body: "Upload remaining vouchers for Kapoor group · Alleppey.",
    when: "1 hr ago",
    unread: true,
  },
  {
    id: "n3",
    kind: "approval",
    title: "Approval requested",
    body: "Accommodation tariff · 2026–27 is waiting for publish approval.",
    when: "Yesterday",
    unread: true,
  },
  {
    id: "n4",
    kind: "booking",
    title: "Booking update",
    body: "Mehta honeymoon moved to On trip.",
    when: "Yesterday",
    unread: false,
  },
  {
    id: "n5",
    kind: "finance",
    title: "Payment overdue",
    body: "₹1,65,000 is overdue on XYZ Family · Dubai.",
    when: "2 days ago",
    unread: false,
  },
  {
    id: "n6",
    kind: "system",
    title: "Workspace notice",
    body: "Storage is at 72% of your current plan.",
    when: "3 days ago",
    unread: false,
  },
];
