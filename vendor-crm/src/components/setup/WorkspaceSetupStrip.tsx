import { Button } from "@paryatech/design-system";
import type { OrgRole } from "../../permissions";
import { canSettings } from "../../permissions";
import {
  SETTINGS_DESTINATIONS,
  type SettingsDestinationId,
} from "../../settings/destinations";

const SETUP_IDS: SettingsDestinationId[] = [
  "organization",
  "brand",
  "access",
  "billing",
];

/** Lightweight workspace setup prompt — opens real settings destinations. */
export function WorkspaceSetupStrip({
  orgRole,
  dismissed,
  onDismiss,
  onOpen,
}: {
  orgRole: OrgRole;
  dismissed: boolean;
  onDismiss: () => void;
  onOpen: (id: SettingsDestinationId) => void;
}) {
  if (dismissed || orgRole === "Member") return null;

  const items = SETUP_IDS.filter((id) => {
    const dest = SETTINGS_DESTINATIONS.find((d) => d.id === id);
    return dest && canSettings(orgRole, dest.permission, "view");
  });

  if (items.length === 0) return null;

  return (
    <div className="setup-strip" role="region" aria-label="Workspace setup">
      <div>
        <p className="setup-strip__title">Workspace setup</p>
        <p className="setup-strip__desc">
          Finish organization identity and brand so customer-facing documents are ready.
          This is not Settings itself — each item opens the real destination.
        </p>
      </div>
      <div className="setup-strip__actions">
        {items.map((id) => {
          const dest = SETTINGS_DESTINATIONS.find((d) => d.id === id)!;
          return (
            <Button key={id} variant="brand" size="sm" onClick={() => onOpen(id)}>
              {dest.title}
            </Button>
          );
        })}
        <Button variant="primary" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
