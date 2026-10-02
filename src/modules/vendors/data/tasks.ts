import type { StatusTone } from "@paryatech/design-system";

export type TaskStatus = "Open" | "In progress" | "Blocked" | "Done";

export interface VendorTask {
  id: string;
  title: string;
  context: string;
  linkedSection?: string;
  linkedRecordId?: string;
  linkedRecordName?: string;
  description?: string;
  priority?: "P1" | "P2" | "P3";
  assigneeName: string;
  assigneeRole: string;
  assigneeInitials: string;
  assigneeTone: "pink" | "default";
  due: string;
  status: TaskStatus;
}

export const TASK_STATUS_TONE: Record<TaskStatus, StatusTone> = {
  Open: "open",
  "In progress": "progress",
  Blocked: "blocked",
  Done: "done",
};

export const OPEN_VENDOR_TASKS: VendorTask[] = [
  {
    id: "TSK-2026-000001",
    title: "Confirm rate card for 2026–27 season",
    context: "Rate cards · Accommodation tariff",
    assigneeName: "Anjali Menon",
    assigneeRole: "Vendor desk",
    assigneeInitials: "AM",
    assigneeTone: "pink",
    due: "Today 4 PM",
    status: "In progress",
  },
  {
    id: "TSK-2026-000002",
    title: "Collect signed contract amendment",
    context: "Docs · Commercial",
    assigneeName: "Meera Joseph",
    assigneeRole: "Operations",
    assigneeInitials: "MJ",
    assigneeTone: "default",
    due: "Today 6 PM",
    status: "Open",
  },
  {
    id: "TSK-2026-000003",
    title: "Update stop-sale notice window",
    context: "Commercial · Terms",
    assigneeName: "Anjali Menon",
    assigneeRole: "Vendor desk",
    assigneeInitials: "AM",
    assigneeTone: "pink",
    due: "13 Aug",
    status: "Open",
  },
  {
    id: "TSK-2026-000004",
    title: "Review group allotment request",
    context: "Services · Example Lake Resort",
    assigneeName: "Vrushabh Jain",
    assigneeRole: "Owner",
    assigneeInitials: "VJ",
    assigneeTone: "pink",
    due: "14 Aug",
    status: "Open",
  },
  {
    id: "TSK-2026-000005",
    title: "Publish Hill Retreat draft tariff",
    context: "Blocked by missing meal plans",
    assigneeName: "Anjali Menon",
    assigneeRole: "Vendor desk",
    assigneeInitials: "AM",
    assigneeTone: "pink",
    due: "—",
    status: "Blocked",
  },
];

export const DONE_VENDOR_TASKS: VendorTask[] = [
  {
    id: "TSK-2026-000006",
    title: "Onboard primary vendor contacts",
    context: "Overview · Contacts",
    assigneeName: "Anjali Menon",
    assigneeRole: "Vendor desk",
    assigneeInitials: "AM",
    assigneeTone: "pink",
    due: "10 Aug",
    status: "Done",
  },
  {
    id: "TSK-2026-000007",
    title: "Import base accommodation tariff",
    context: "Rate cards · Example Lake Resort",
    assigneeName: "Meera Joseph",
    assigneeRole: "Operations",
    assigneeInitials: "MJ",
    assigneeTone: "default",
    due: "8 Aug",
    status: "Done",
  },
  {
    id: "TSK-2026-000008",
    title: "Set payment terms to Net 30",
    context: "Commercial · Terms",
    assigneeName: "Vrushabh Jain",
    assigneeRole: "Owner",
    assigneeInitials: "VJ",
    assigneeTone: "pink",
    due: "7 Aug",
    status: "Done",
  },
];
