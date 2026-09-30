import { useEffect, useId, useRef, type ComponentType, type RefObject } from "react";
import { IconButton } from "@paryatech/design-system";
import {
  IconBed,
  IconCard,
  IconClose,
  IconFinance,
  IconFile,
  IconPackages,
  IconPencil,
} from "../icons";
import { LauncherGroup, LauncherItem } from "./settings/LauncherParts";
import "./settings/settings.css";
import "./EditVendorLauncher.css";

export type VendorEditDestination =
  | "profile"
  | "services"
  | "rate-cards"
  | "packages"
  | "finance"
  | "docs";

const DESTINATIONS: {
  id: VendorEditDestination;
  title: string;
  description: string;
  group: "profile" | "commercial";
  Icon: ComponentType<{ size?: number }>;
}[] = [
  {
    id: "profile",
    title: "Vendor profile",
    description: "Name, categories (title idea), location, contact, owner, and status — edited on Overview.",
    group: "profile",
    Icon: IconPencil,
  },
  {
    id: "services",
    title: "Services",
    description: "Properties and activities this vendor supplies.",
    group: "commercial",
    Icon: IconBed,
  },
  {
    id: "rate-cards",
    title: "Rate cards",
    description: "Tariffs and pricing schedules for quoting.",
    group: "commercial",
    Icon: IconCard,
  },
  {
    id: "packages",
    title: "Packages",
    description: "Sellable packages built from this vendor’s services.",
    group: "commercial",
    Icon: IconPackages,
  },
  {
    id: "finance",
    title: "Finance",
    description: "Payables, settlements, and payment activity.",
    group: "commercial",
    Icon: IconFinance,
  },
  {
    id: "docs",
    title: "Docs",
    description: "Compliance documents, agreements, and certificates.",
    group: "commercial",
    Icon: IconFile,
  },
];

/**
 * Edit vendor launcher — profile opens the form; commercial areas jump to their tab.
 */
export function EditVendorLauncherModal({
  open,
  onClose,
  onSelect,
  returnFocusRef,
}: {
  open: boolean;
  vendorName: string;
  onClose: () => void;
  onSelect: (id: VendorEditDestination) => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 0);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      returnFocusRef?.current?.focus?.();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) return null;

  const profile = DESTINATIONS.filter((d) => d.group === "profile");
  const commercial = DESTINATIONS.filter((d) => d.group === "commercial");

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
        className="settings-launcher edit-vendor-launcher"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="settings-launcher__head">
          <div>
            <h2 id={titleId} className="settings-launcher__title">
              Edit vendor
            </h2>
          </div>
          <IconButton label="Close" onClick={onClose}>
            <IconClose />
          </IconButton>
        </div>

        <div className="settings-launcher__body">
          <LauncherGroup title="Profile">
            {profile.map((dest) => {
              const Icon = dest.Icon;
              return (
                <LauncherItem
                  key={dest.id}
                  title={dest.title}
                  description={dest.description}
                  icon={<Icon size={16} />}
                  onSelect={() => onSelect(dest.id)}
                />
              );
            })}
          </LauncherGroup>

          <LauncherGroup title="Edit on tab">
            {commercial.map((dest) => {
              const Icon = dest.Icon;
              return (
                <LauncherItem
                  key={dest.id}
                  title={dest.title}
                  description={dest.description}
                  icon={<Icon size={16} />}
                  onSelect={() => onSelect(dest.id)}
                />
              );
            })}
          </LauncherGroup>
        </div>
      </div>
    </div>
  );
}
