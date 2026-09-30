import { useState } from "react";
import { Button } from "@paryatech/design-system";
import type { OrgRole } from "../../permissions";
import { canSettings, settingsAccess } from "../../permissions";
import {
  getSettingsDestination,
  type SettingsDestinationId,
} from "../../settings/destinations";
import {
  SettingsComingLater,
  SettingsCrumbs,
  SettingsPageHeader,
  SettingsSectionCard,
  UnsavedChangesBar,
} from "../../components/settings/SettingsPageChrome";
import "../../components/settings/settings.css";

export function SettingsHubPage({
  id,
  orgRole,
  onAllSettings,
}: {
  id: SettingsDestinationId;
  orgRole: OrgRole;
  onAllSettings: () => void;
}) {
  const dest = getSettingsDestination(id);
  if (!dest) return null;

  const access = settingsAccess(orgRole, dest.permission);
  if (access === "none") {
    return (
      <div className="settings-page">
        <SettingsCrumbs area="Settings" page={dest.title} onSettingsHome={onAllSettings} />
        <div className="settings-coming">
          <p className="settings-coming__title">Not available for your role</p>
          <p className="settings-coming__desc">
            Members cannot open workspace settings. Ask an owner or admin if you need access.
          </p>
        </div>
      </div>
    );
  }

  const readOnly = access === "view";
  const Icon = dest.Icon;

  return (
    <div className="settings-page">
      <SettingsCrumbs area="Settings" page={dest.title} onSettingsHome={onAllSettings} />
      <SettingsPageHeader
        icon={<Icon size={18} />}
        title={dest.title}
        description={dest.description}
        permission={readOnly ? "view" : "edit"}
        onAllSettings={onAllSettings}
      />
      {dest.implemented ? (
        <ImplementedSettings id={id} readOnly={readOnly} />
      ) : (
        <SettingsComingLater title={dest.title} />
      )}
    </div>
  );
}

function ImplementedSettings({
  id,
  readOnly,
}: {
  id: SettingsDestinationId;
  readOnly: boolean;
}) {
  if (id === "organization") return <OrganizationSettings readOnly={readOnly} />;
  if (id === "access") return <AccessSettings readOnly={readOnly} />;
  if (id === "brand") return <BrandKitSettings readOnly={readOnly} />;
  return <SettingsComingLater title={id} />;
}

function Field({
  label,
  value,
  onChange,
  readOnly,
  hint,
  as = "input",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly: boolean;
  hint?: string;
  as?: "input" | "textarea" | "select";
}) {
  return (
    <label className="settings-field">
      <span className="settings-field__label">{label}</span>
      {as === "textarea" ? (
        <textarea
          className="settings-field__textarea"
          value={value}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : as === "select" ? (
        <select
          className="settings-field__select"
          value={value}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="Asia/Kolkata">Asia/Kolkata</option>
          <option value="UTC">UTC</option>
          <option value="Europe/London">Europe/London</option>
        </select>
      ) : (
        <input
          className="settings-field__input"
          value={value}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint ? <p className="settings-field__hint">{hint}</p> : null}
    </label>
  );
}

function OrganizationSettings({ readOnly }: { readOnly: boolean }) {
  const initial = {
    legalName: "Paryatech Experiences Pvt Ltd",
    tradeName: "Paryatech",
    workspaceUrl: "paryatech.app",
    country: "India",
    timezone: "Asia/Kolkata",
  };
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  return (
    <>
      <SettingsSectionCard
        title="Company identity"
        description="Legal and trade names shown on documents and the workspace."
      >
        <div className="settings-grid-2">
          <Field
            label="Legal name"
            value={draft.legalName}
            readOnly={readOnly}
            onChange={(v) => setDraft((d) => ({ ...d, legalName: v }))}
          />
          <Field
            label="Trade name"
            value={draft.tradeName}
            readOnly={readOnly}
            onChange={(v) => setDraft((d) => ({ ...d, tradeName: v }))}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Regional defaults"
        description="Defaults for dates, currency context and operating region."
      >
        <div className="settings-grid-2">
          <Field
            label="Country"
            value={draft.country}
            readOnly={readOnly}
            onChange={(v) => setDraft((d) => ({ ...d, country: v }))}
          />
          <Field
            label="Timezone"
            value={draft.timezone}
            readOnly={readOnly}
            as="select"
            onChange={(v) => setDraft((d) => ({ ...d, timezone: v }))}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Internal workspace URL"
        description="Used inside the product. Customer-facing domains live under Domains & public links."
      >
        <Field
          label="Workspace URL"
          value={draft.workspaceUrl}
          readOnly={readOnly}
          hint="Internal only — not your public proposal or booking domain."
          onChange={(v) => setDraft((d) => ({ ...d, workspaceUrl: v }))}
        />
      </SettingsSectionCard>

      <UnsavedChangesBar
        dirty={dirty}
        readOnly={readOnly}
        onDiscard={() => setDraft(saved)}
        onSave={() => setSaved(draft)}
      />
    </>
  );
}

function AccessSettings({ readOnly }: { readOnly: boolean }) {
  return (
    <>
      <SettingsSectionCard
        title="Members"
        description="People with access to this workspace."
        action={
          readOnly ? null : (
            <Button variant="primary" size="sm">
              Invite member
            </Button>
          )
        }
      >
        <div className="settings-coming" style={{ textAlign: "left", padding: "16px" }}>
          <p className="settings-coming__title" style={{ textAlign: "left" }}>
            Vrushabh Jain · Owner
          </p>
          <p className="settings-coming__desc" style={{ textAlign: "left" }}>
            Anjali Menon · Admin · Vendor desk
          </p>
          <p className="settings-coming__desc" style={{ textAlign: "left" }}>
            Meera Iyer · Member · Operations
          </p>
        </div>
      </SettingsSectionCard>
      <SettingsSectionCard
        title="Roles"
        description="Owner, Admin and Member control what workspace settings and CRM actions are available."
      >
        <p className="settings-section__desc" style={{ margin: 0 }}>
          Role definitions are fixed for this trial. Use the top-bar role preview to check
          visibility.
        </p>
      </SettingsSectionCard>
    </>
  );
}

function BrandKitSettings({ readOnly }: { readOnly: boolean }) {
  const initial = {
    primary: "#115553",
    secondary: "#0F6E63",
    accent: "#C45B7A",
    displayFont: "Onest",
    bodyFont: "Public Sans",
  };
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  return (
    <>
      <SettingsSectionCard
        title="Logos"
        description="Primary, alternate, light/dark variants and favicon for documents and public pages."
      >
        <div className="settings-grid-2">
          <div className="settings-coming" style={{ padding: 16 }}>
            <p className="settings-coming__title">Primary logo</p>
            <p className="settings-coming__desc">Upload reserved — draft state.</p>
          </div>
          <div className="settings-coming" style={{ padding: 16 }}>
            <p className="settings-coming__title">Favicon</p>
            <p className="settings-coming__desc">Upload reserved — draft state.</p>
          </div>
        </div>
        {!readOnly ? (
          <p className="settings-field__hint">
            Brand Kit is not a media library. Destination photography belongs under Marketing /
            Assets.
          </p>
        ) : null}
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Colors"
        description="Primary, secondary and accent colors for customer-facing surfaces."
      >
        <div className="settings-grid-2">
          <Field
            label="Primary"
            value={draft.primary}
            readOnly={readOnly}
            onChange={(v) => setDraft((d) => ({ ...d, primary: v }))}
          />
          <Field
            label="Secondary"
            value={draft.secondary}
            readOnly={readOnly}
            onChange={(v) => setDraft((d) => ({ ...d, secondary: v }))}
          />
          <Field
            label="Accent"
            value={draft.accent}
            readOnly={readOnly}
            onChange={(v) => setDraft((d) => ({ ...d, accent: v }))}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Typography"
        description="Brand typography for proposals, vouchers and public pages."
      >
        <div className="settings-grid-2">
          <Field
            label="Display"
            value={draft.displayFont}
            readOnly={readOnly}
            onChange={(v) => setDraft((d) => ({ ...d, displayFont: v }))}
          />
          <Field
            label="Body"
            value={draft.bodyFont}
            readOnly={readOnly}
            onChange={(v) => setDraft((d) => ({ ...d, bodyFont: v }))}
          />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Document appearance"
        description="Header/footer and proposal or voucher preview identity. Publish when ready."
        action={
          readOnly ? null : (
            <Button variant="primary" size="sm">
              Preview
            </Button>
          )
        }
      >
        <p className="settings-section__desc" style={{ margin: 0 }}>
          Status: Draft — Brand Kit supplies identity automatically to proposals, vouchers,
          booking documents and public pages once published.
        </p>
      </SettingsSectionCard>

      <UnsavedChangesBar
        dirty={dirty}
        readOnly={readOnly}
        onDiscard={() => setDraft(saved)}
        onSave={() => setSaved(draft)}
      />
    </>
  );
}

/** Exported for setup checklist visibility checks. */
export function memberCanViewSettings(role: OrgRole, id: SettingsDestinationId) {
  const dest = getSettingsDestination(id);
  if (!dest) return false;
  return canSettings(role, dest.permission, "view");
}
