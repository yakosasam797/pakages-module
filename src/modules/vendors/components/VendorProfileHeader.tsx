import { Button, StatusChip } from "@paryatech/design-system";
import { IconPencil, IconPin } from "../icons";
import { RecordHeader } from "./RecordHeader";

/**
 * Vendor detail header — same layout language as booking `.record`
 * (new-direction-03): title + one status capsule, location + ID meta,
 * without repeating section-level actions.
 */
export function VendorProfileHeader({
  code,
  location,
  name,
  status = "Active",
  canEdit = false,
  onEdit,
}: {
  code: string;
  location: string;
  name: string;
  /** Short “idea” of the vendor (role / category), like Dubai on a booking */
  status?: string;
  canEdit?: boolean;
  onEdit?: () => void;
}) {
  const tone =
    status === "Active"
      ? "done"
      : status === "Draft" || status === "Setup incomplete"
        ? "progress"
        : "open";

  return (
    <RecordHeader
      title={name}
      tags={<StatusChip tone={tone}>{status}</StatusChip>}
      date={
        <span className="record-header__date">
          <IconPin size={13} />
          {location}
        </span>
      }
      recordId={code}
      idTip="Vendor code"
      aside={canEdit ? (
        <Button variant="primary" size="sm" onClick={onEdit}>
          <IconPencil />
          Edit vendor
        </Button>
      ) : undefined}
    />
  );
}
