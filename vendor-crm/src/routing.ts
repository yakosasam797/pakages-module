import type { AccountDestinationId, SettingsDestinationId } from "./settings/destinations";

export type CrmRoute =
  | { name: "vendors" }
  | { name: "vendor-new" }
  | { name: "vendor"; id: string }
  | { name: "rate-card"; id: string; vendorId: string }
  | { name: "rate-card-new"; templateId: string; vendorId: string };

export type HubRoute =
  | { area: "settings"; id: SettingsDestinationId }
  | { area: "account"; id: AccountDestinationId | "notification-preferences" }
  | { area: "notifications" };

export type AppLocation =
  | { kind: "crm"; route: CrmRoute }
  | { kind: "hub"; route: HubRoute };

const SETTINGS_IDS = new Set<string>([
  "organization",
  "access",
  "brand",
  "domains",
  "documents",
  "communications",
  "crm",
  "billing",
  "integrations",
]);

const ACCOUNT_IDS = new Set<string>([
  "profile",
  "security",
  "sessions",
  "preferences",
  "workspaces",
  "notification-preferences",
]);

export function pathForHub(route: HubRoute): string {
  if (route.area === "settings") return `/settings/${route.id}`;
  if (route.area === "notifications") return "/notifications";
  return `/account/${route.id}`;
}

export function parsePathname(pathname: string): HubRoute | null {
  const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  if (parts[0] === "settings" && parts[1] && SETTINGS_IDS.has(parts[1])) {
    return { area: "settings", id: parts[1] as SettingsDestinationId };
  }
  if (parts[0] === "account" && parts[1] && ACCOUNT_IDS.has(parts[1])) {
    return {
      area: "account",
      id: parts[1] as AccountDestinationId | "notification-preferences",
    };
  }
  if (parts[0] === "notifications") {
    return { area: "notifications" };
  }
  return null;
}

export function titleForHub(route: HubRoute): string {
  if (route.area === "notifications") return "Notifications";
  if (route.area === "account") {
    if (route.id === "notification-preferences") return "Notification preferences";
    const map: Record<string, string> = {
      profile: "My profile",
      security: "Security and sign-in",
      sessions: "Devices and sessions",
      preferences: "Personal preferences",
      workspaces: "Workspace role and memberships",
    };
    return map[route.id] ?? "Account";
  }
  return route.id;
}
