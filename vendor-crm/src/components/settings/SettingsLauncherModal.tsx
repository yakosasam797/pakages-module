import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { IconButton, SearchField } from "@paryatech/design-system";
import { IconClose } from "../../icons";
import type { OrgRole } from "../../permissions";
import { canSettings } from "../../permissions";
import {
  SETTINGS_DESTINATIONS,
  SETTINGS_GROUP_LABEL,
  launcherStatusFor,
  type SettingsDestination,
  type SettingsDestinationId,
} from "../../settings/destinations";
import { LauncherGroup, LauncherItem } from "./LauncherParts";
import "./settings.css";

const GROUP_ORDER: SettingsDestination["group"][] = [
  "workspace",
  "brand",
  "documents",
  "business",
];

export function SettingsLauncherModal({
  open,
  orgRole,
  onClose,
  onNavigate,
  anchorRef,
  returnFocusRef,
}: {
  open: boolean;
  orgRole: OrgRole;
  onClose: () => void;
  onNavigate: (id: SettingsDestinationId) => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<React.CSSProperties>();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SETTINGS_DESTINATIONS.filter((d) => {
      if (!canSettings(orgRole, d.permission, "view")) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        SETTINGS_GROUP_LABEL[d.group].toLowerCase().includes(q)
      );
    });
  }, [orgRole, query]);

  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const anchor = anchorRef?.current;
      if (!anchor) {
        setPosition(undefined);
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const viewportInset = 12;
      const gap = 8;
      const top = rect.bottom + gap;

      setPosition({
        top,
        right: Math.max(viewportInset, window.innerWidth - rect.right),
        maxHeight: Math.max(240, window.innerHeight - top - viewportInset),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef, open]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>("input,button")?.focus();
    }, 0);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusables = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      const host = returnFocusRef?.current;
      const btn = host?.querySelector?.("button") ?? host;
      if (btn && "focus" in btn) (btn as HTMLElement).focus();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) return null;

  return (
    <div
      className="settings-launcher-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="settings-launcher"
        style={position}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="settings-launcher__head">
          <div>
            <h2 id={titleId} className="settings-launcher__title">
              Workspace settings
            </h2>
          </div>
          <IconButton label="Close workspace settings" onClick={onClose}>
            <IconClose />
          </IconButton>
        </div>

        <div className="settings-launcher__search">
          <SearchField
            fullWidth
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a setting"
            aria-label="Find a setting"
          />
        </div>

        <div className="settings-launcher__body">
          {GROUP_ORDER.map((group) => {
            const items = visible.filter((d) => d.group === group);
            if (items.length === 0) return null;
            return (
              <LauncherGroup key={group} title={SETTINGS_GROUP_LABEL[group]}>
                {items.map((dest) => {
                  const status = launcherStatusFor(dest, orgRole);
                  const Icon = dest.Icon;
                  return (
                    <LauncherItem
                      key={dest.id}
                      title={dest.title}
                      description={dest.description}
                      icon={<Icon size={16} />}
                      status={status === "ready" ? undefined : status}
                      onSelect={() => onNavigate(dest.id)}
                    />
                  );
                })}
              </LauncherGroup>
            );
          })}
          {visible.length === 0 ? (
            <div className="settings-coming">
              <p className="settings-coming__title">No matching settings</p>
              <p className="settings-coming__desc">
                Try another keyword, or ask an owner for access to workspace configuration.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
