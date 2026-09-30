import type { NavGroupData } from "@paryatech/design-system";
import {
  IconAutomations,
  IconBookings,
  IconCustomers,
  IconFinance,
  IconHome,
  IconInbox,
  IconNews,
  IconPackages,
  IconQueries,
  IconReports,
  IconSettings,
  IconTasks,
  IconTeam,
  IconVendors,
} from "./icons";

/** AppShell Storybook `exampleNav` — Patterns/AppShell. Vendors is active on this screen. */
export function buildNavGroups(
  activeId: string,
  onSelect?: (id: string) => void,
  settings?: { visible: boolean; onSelect: () => void },
): NavGroupData[] {
  const item = (
    id: string,
    label: string,
    icon: NavGroupData["items"][number]["icon"],
    extra?: {
      badge?: NavGroupData["items"][number]["badge"];
      onSelect?: () => void;
    },
  ): NavGroupData["items"][number] => ({
    id,
    label,
    tip: label,
    icon,
    badge: extra?.badge,
    active: activeId === id,
    onSelect: extra?.onSelect ?? (onSelect ? () => onSelect(id) : undefined),
  });

  return [
    {
      id: "workspace",
      label: "Workspace",
      items: [
        item("home", "Home", <IconHome />),
        item("inbox", "All inbox", <IconInbox />),
        item("news", "News", <IconNews />),
        item("tasks", "All tasks", <IconTasks />, { badge: 4 }),
      ],
    },
    {
      id: "sales",
      label: "Sales",
      items: [
        item("queries", "Queries", <IconQueries />),
        item("packages", "Packages", <IconPackages />),
        item("bookings", "Bookings", <IconBookings />),
      ],
    },
    {
      id: "crm",
      label: "CRM",
      items: [
        item("customers", "Customers", <IconCustomers />),
        item("vendors", "Vendors", <IconVendors />),
      ],
    },
    {
      id: "ops",
      label: "Operations",
      items: [
        item("finances", "All finances", <IconFinance />),
        item("team", "Team", <IconTeam />),
        item("automations", "Automations", <IconAutomations />),
        item("reports", "Reports", <IconReports />),
        ...(settings?.visible
          ? [item("settings", "Settings", <IconSettings />, { onSelect: settings.onSelect })]
          : []),
      ],
    },
  ];
}
