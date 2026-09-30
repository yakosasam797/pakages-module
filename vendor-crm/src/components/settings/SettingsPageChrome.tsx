import type { ReactNode } from "react";
import { Button } from "@paryatech/design-system";

export function SettingsPageHeader({
  icon,
  title,
  description,
  permission,
  onAllSettings,
  actions,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  permission?: "edit" | "view";
  onAllSettings?: () => void;
  actions?: ReactNode;
}) {
  return (
    <header className="settings-page__header">
      <div className="settings-page__header-main">
        <div className="settings-page__icon" aria-hidden="true">
          {icon}
        </div>
        <div>
          <h1 className="settings-page__title">{title}</h1>
          <p className="settings-page__desc">{description}</p>
        </div>
      </div>
      <div className="settings-page__header-actions">
        {permission === "view" ? (
          <span className="settings-perm settings-perm--readonly" role="status">
            Read only
          </span>
        ) : null}
        {onAllSettings ? (
          <Button variant="brand" size="sm" onClick={onAllSettings}>
            All settings
          </Button>
        ) : null}
        {actions}
      </div>
    </header>
  );
}

export function SettingsSectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="settings-section">
      <div className="settings-section__head">
        <div>
          <h2 className="settings-section__title">{title}</h2>
          {description ? <p className="settings-section__desc">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="settings-section__body">{children}</div>
    </section>
  );
}

export function SettingsComingLater({ title }: { title: string }) {
  return (
    <div className="settings-coming" role="status">
      <p className="settings-coming__title">{title} — coming later</p>
      <p className="settings-coming__desc">
        This destination is reserved in Workspace settings. The dedicated configuration
        surface has not been built yet.
      </p>
    </div>
  );
}

export function UnsavedChangesBar({
  dirty,
  onDiscard,
  onSave,
  readOnly,
}: {
  dirty: boolean;
  onDiscard: () => void;
  onSave: () => void;
  readOnly?: boolean;
}) {
  if (!dirty || readOnly) return null;
  return (
    <div className="settings-unsaved" role="status">
      <p className="settings-unsaved__label">You have unsaved changes</p>
      <div className="settings-unsaved__actions">
        <Button variant="brand" size="sm" onClick={onDiscard}>
          Discard
        </Button>
        <Button variant="primary" size="sm" onClick={onSave}>
          Save changes
        </Button>
      </div>
    </div>
  );
}

export function SettingsCrumbs({
  area,
  page,
  onSettingsHome,
}: {
  area: "Settings" | "Account" | "Notifications";
  page: string;
  onSettingsHome?: () => void;
}) {
  return (
    <ol className="settings-page__crumbs">
      <li>
        {onSettingsHome && area === "Settings" ? (
          <button type="button" className="settings-page__crumb-btn" onClick={onSettingsHome}>
            Settings
          </button>
        ) : (
          area
        )}
      </li>
      <li aria-hidden="true">/</li>
      <li aria-current="page">{page}</li>
    </ol>
  );
}
