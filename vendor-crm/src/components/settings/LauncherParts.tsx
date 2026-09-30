import type { ReactNode } from "react";
import { IconChevronRight } from "../../icons";
import type { LauncherStatus } from "../../settings/destinations";
import { statusLabel } from "../../settings/destinations";

export function LauncherGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="settings-launcher__group">
      <h3 className="settings-launcher__group-title">{title}</h3>
      <div className="settings-launcher__grid">{children}</div>
    </section>
  );
}

export function LauncherItem({
  title,
  description,
  icon,
  status,
  disabled,
  onSelect,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  status?: LauncherStatus;
  disabled?: boolean;
  onSelect: () => void;
}) {
  const label = status ? statusLabel(status) : undefined;
  return (
    <button
      type="button"
      className="settings-launcher__item"
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="settings-launcher__item-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="settings-launcher__item-copy">
        <span className="settings-launcher__item-title-row">
          <span className="settings-launcher__item-title">{title}</span>
          {label ? (
            <span
              className={`settings-launcher__status settings-launcher__status--${status}`}
            >
              {label}
            </span>
          ) : null}
        </span>
        <span className="settings-launcher__item-desc">{description}</span>
      </span>
      <span className="settings-launcher__chevron" aria-hidden="true">
        <IconChevronRight size={16} />
      </span>
    </button>
  );
}
