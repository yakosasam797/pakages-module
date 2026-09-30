import type { ComponentType } from "react";
import type { OrgRole } from "../permissions";
import { canSettings, type SettingsPermission } from "../permissions";
import {
  IconBuilding,
  IconCustomers,
  IconFile,
  IconFinance,
  IconGlobe,
  IconImage,
  IconMail,
  IconModule,
  IconTeam,
} from "../icons";

export type SettingsDestinationId =
  | "organization"
  | "access"
  | "brand"
  | "domains"
  | "documents"
  | "communications"
  | "crm"
  | "billing"
  | "integrations";

export type LauncherStatus = "ready" | "incomplete" | "coming-later" | "read-only";

export type SettingsDestination = {
  id: SettingsDestinationId;
  group: "workspace" | "brand" | "documents" | "business";
  title: string;
  description: string;
  path: string;
  Icon: ComponentType<{ size?: number }>;
  /** Product surface implemented beyond a Coming-later stub. */
  implemented: boolean;
  permission: SettingsPermission;
};

export const SETTINGS_GROUP_LABEL: Record<SettingsDestination["group"], string> = {
  workspace: "Workspace",
  brand: "Brand & public experience",
  documents: "Documents & operations",
  business: "Business",
};

export const SETTINGS_DESTINATIONS: SettingsDestination[] = [
  {
    id: "organization",
    group: "workspace",
    title: "Organization",
    description: "Company identity, legal details, regional defaults and workspace URL.",
    path: "/settings/organization",
    Icon: IconBuilding,
    implemented: true,
    permission: "settings.organization",
  },
  {
    id: "access",
    group: "workspace",
    title: "Team & permissions",
    description: "Members, roles, invitations and workspace access.",
    path: "/settings/access",
    Icon: IconTeam,
    implemented: true,
    permission: "settings.access",
  },
  {
    id: "brand",
    group: "brand",
    title: "Brand kit",
    description: "Logos, colors, typography and customer-facing document identity.",
    path: "/settings/brand",
    Icon: IconImage,
    implemented: true,
    permission: "settings.brand",
  },
  {
    id: "domains",
    group: "brand",
    title: "Domains & public links",
    description: "Public website, proposal and booking-document domains.",
    path: "/settings/domains",
    Icon: IconGlobe,
    implemented: false,
    permission: "settings.domains",
  },
  {
    id: "documents",
    group: "documents",
    title: "Documents & numbering",
    description: "Proposal, voucher and booking-document defaults and numbering.",
    path: "/settings/documents",
    Icon: IconFile,
    implemented: false,
    permission: "settings.documents",
  },
  {
    id: "communications",
    group: "documents",
    title: "Communication channels",
    description: "WhatsApp, email senders, routing and reusable communication defaults.",
    path: "/settings/communications",
    Icon: IconMail,
    implemented: false,
    permission: "settings.communications",
  },
  {
    id: "crm",
    group: "documents",
    title: "CRM defaults",
    description: "Customer tiers, reusable classifications and operational defaults.",
    path: "/settings/crm",
    Icon: IconCustomers,
    implemented: false,
    permission: "settings.crm",
  },
  {
    id: "billing",
    group: "business",
    title: "Billing & usage",
    description: "Subscription, seats, storage, invoices and AI usage.",
    path: "/settings/billing",
    Icon: IconFinance,
    implemented: false,
    permission: "settings.billing",
  },
  {
    id: "integrations",
    group: "business",
    title: "Integrations & data",
    description: "Connected services, API access, webhooks and data controls.",
    path: "/settings/integrations",
    Icon: IconModule,
    implemented: false,
    permission: "settings.integrations",
  },
];

export function getSettingsDestination(id: string): SettingsDestination | undefined {
  return SETTINGS_DESTINATIONS.find((d) => d.id === id);
}

export function launcherStatusFor(
  dest: SettingsDestination,
  role: OrgRole,
): LauncherStatus {
  if (!canSettings(role, dest.permission, "view")) return "read-only";
  if (!dest.implemented) return "coming-later";
  if (!canSettings(role, dest.permission, "edit")) return "read-only";
  if (dest.id === "organization" || dest.id === "brand") return "incomplete";
  return "ready";
}

export function statusLabel(status: LauncherStatus): string | undefined {
  switch (status) {
    case "incomplete":
      return "Incomplete";
    case "coming-later":
      return "Coming later";
    case "read-only":
      return "Read only";
    default:
      return undefined;
  }
}

export const ACCOUNT_DESTINATIONS = [
  {
    id: "profile",
    title: "My profile",
    description: "Name, photo and contact details.",
    path: "/account/profile",
  },
  {
    id: "security",
    title: "Security and sign-in",
    description: "Password and two-factor authentication.",
    path: "/account/security",
  },
  {
    id: "sessions",
    title: "Devices and sessions",
    description: "Signed-in devices and active sessions.",
    path: "/account/sessions",
  },
  {
    id: "preferences",
    title: "Personal preferences",
    description: "Language, time zone and display preferences.",
    path: "/account/preferences",
  },
  {
    id: "workspaces",
    title: "Workspace role and memberships",
    description: "Workspaces you belong to and your roles.",
    path: "/account/workspaces",
  },
] as const;

export type AccountDestinationId = (typeof ACCOUNT_DESTINATIONS)[number]["id"];

export function getAccountDestination(id: string) {
  return ACCOUNT_DESTINATIONS.find((d) => d.id === id);
}
