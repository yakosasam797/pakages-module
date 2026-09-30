import type { NavGroupData } from "@paryatech/design-system";
import {
  IconAutomations,
  IconBookings,
  IconCustomers,
  IconDestination,
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

export function buildNavGroups(onInactiveSelect: (label: string) => void): NavGroupData[] {
  const item = (
    id: string,
    label: string,
    icon: NavGroupData["items"][number]["icon"],
    active = false,
    badge?: number,
  ): NavGroupData["items"][number] => ({
    id,
    label,
    tip: label,
    icon,
    active,
    badge,
    onSelect: active ? undefined : () => onInactiveSelect(label),
  });

  return [
    {
      id: "workspace",
      label: "Workspace",
      items: [
        item("home", "Home", <IconHome />),
        item("inbox", "All inbox", <IconInbox />),
        item("destination", "Destination", <IconDestination />),
        item("news", "News", <IconNews />),
        item("tasks", "All tasks", <IconTasks />, false, 4),
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
      id: "operations",
      label: "Operations",
      items: [
        item("finances", "All finances", <IconFinance />, true),
        item("team", "Team", <IconTeam />),
        item("automations", "Automations", <IconAutomations />),
        item("reports", "Reports", <IconReports />),
        item("settings", "Settings", <IconSettings />),
      ],
    },
  ];
}
