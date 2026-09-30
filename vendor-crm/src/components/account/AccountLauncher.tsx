import { useEffect, useId, useRef } from "react";
import { Avatar } from "@paryatech/design-system";
import {
  IconChevronRight,
  IconDevices,
  IconLogout,
  IconSettings,
  IconShield,
  IconUser,
} from "../../icons";
import {
  ACCOUNT_DESTINATIONS,
  type AccountDestinationId,
} from "../../settings/destinations";
import "../settings/settings.css";

const ICONS: Record<AccountDestinationId, typeof IconUser> = {
  profile: IconUser,
  security: IconShield,
  sessions: IconDevices,
  preferences: IconSettings,
  workspaces: IconUser,
};

export function AccountLauncher({
  open,
  onClose,
  onNavigate,
  onSignOut,
  anchorRef,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (id: AccountDestinationId) => void;
  onSignOut: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="account-launcher"
      role="menu"
      aria-labelledby={titleId}
    >
      <div className="account-launcher__who">
        <Avatar tone="pink" size={36}>
          VJ
        </Avatar>
        <div>
          <p id={titleId} className="account-launcher__name">
            Vrushabh Jain
          </p>
          <p className="account-launcher__meta">Personal account</p>
        </div>
      </div>

      {ACCOUNT_DESTINATIONS.map((dest) => {
        const Icon = ICONS[dest.id];
        return (
          <button
            key={dest.id}
            type="button"
            role="menuitem"
            className="account-launcher__item"
            onClick={() => onNavigate(dest.id)}
          >
            <Icon size={16} />
            <span className="account-launcher__item-copy">
              <span className="account-launcher__item-title">{dest.title}</span>
              <span className="account-launcher__item-desc">{dest.description}</span>
            </span>
            <span className="account-launcher__item-chevron" aria-hidden="true">
              <IconChevronRight size={14} />
            </span>
          </button>
        );
      })}

      <button
        type="button"
        role="menuitem"
        className="account-launcher__item account-launcher__item--signout"
        onClick={onSignOut}
      >
        <IconLogout size={16} />
        <span className="account-launcher__item-copy">
          <span className="account-launcher__item-title">Sign out</span>
          <span className="account-launcher__item-desc">End this session on this device.</span>
        </span>
      </button>
    </div>
  );
}
