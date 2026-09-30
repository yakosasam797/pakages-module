import { StatusChip, type StatusTone } from "@paryatech/design-system";
import type { ReactNode } from "react";
import "./StatusChipWithDot.css";

export function StatusChipWithDot({
  tone,
  children,
}: {
  tone: StatusTone;
  children: ReactNode;
}) {
  return (
    <StatusChip tone={tone}>
      <span className="status-dot" aria-hidden="true" />
      {children}
    </StatusChip>
  );
}
