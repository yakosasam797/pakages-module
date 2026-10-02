import type { ReactNode } from "react";
import "./SheetLeadButton.css";

/** Clickable lead column for DataSheet rows that open a detail. */
export function SheetLeadButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  /** Accessible name — usually “Open {entity}” */
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="sheet-lead-btn"
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
  );
}
