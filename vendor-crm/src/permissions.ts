export type OrgRole = "Owner" | "Admin" | "Member";

export type VendorPermission =
  | "vendor.view"
  | "vendor.add"
  | "vendor.edit"
  | "vendor.deactivate"
  | "vendor.archive"
  | "vendor.manage_access"
  | "vendor.task.add";

export type SettingsPermission =
  | "settings.organization"
  | "settings.access"
  | "settings.brand"
  | "settings.domains"
  | "settings.documents"
  | "settings.communications"
  | "settings.crm"
  | "settings.billing"
  | "settings.integrations";

type AccessLevel = "none" | "view" | "edit";

const ROLE_PERMISSIONS: Record<OrgRole, ReadonlySet<VendorPermission>> = {
  Owner: new Set([
    "vendor.view",
    "vendor.add",
    "vendor.edit",
    "vendor.deactivate",
    "vendor.archive",
    "vendor.manage_access",
    "vendor.task.add",
  ]),
  Admin: new Set([
    "vendor.view",
    "vendor.add",
    "vendor.edit",
    "vendor.deactivate",
    "vendor.task.add",
  ]),
  Member: new Set(["vendor.view"]),
};

/** Owner: full edit. Admin: operational edit, billing/domains view-only. Member: hidden/none. */
const SETTINGS_ACCESS: Record<OrgRole, Record<SettingsPermission, AccessLevel>> = {
  Owner: {
    "settings.organization": "edit",
    "settings.access": "edit",
    "settings.brand": "edit",
    "settings.domains": "edit",
    "settings.documents": "edit",
    "settings.communications": "edit",
    "settings.crm": "edit",
    "settings.billing": "edit",
    "settings.integrations": "edit",
  },
  Admin: {
    "settings.organization": "edit",
    "settings.access": "view",
    "settings.brand": "edit",
    "settings.domains": "view",
    "settings.documents": "edit",
    "settings.communications": "edit",
    "settings.crm": "edit",
    "settings.billing": "view",
    "settings.integrations": "view",
  },
  Member: {
    "settings.organization": "none",
    "settings.access": "none",
    "settings.brand": "none",
    "settings.domains": "none",
    "settings.documents": "none",
    "settings.communications": "none",
    "settings.crm": "none",
    "settings.billing": "none",
    "settings.integrations": "none",
  },
};

export function can(role: OrgRole, permission: VendorPermission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

export function settingsAccess(role: OrgRole, permission: SettingsPermission): AccessLevel {
  return SETTINGS_ACCESS[role][permission];
}

export function canSettings(
  role: OrgRole,
  permission: SettingsPermission,
  level: "view" | "edit",
): boolean {
  const access = settingsAccess(role, permission);
  if (level === "view") return access === "view" || access === "edit";
  return access === "edit";
}

export function canOpenWorkspaceSettings(role: OrgRole): boolean {
  return Object.values(SETTINGS_ACCESS[role]).some((level) => level !== "none");
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function assertCan(role: OrgRole, permission: VendorPermission): void {
  if (!can(role, permission)) {
    throw new ForbiddenError(`403 Forbidden — missing ${permission}`);
  }
}
