import { Avatar } from "@paryatech/design-system";
import "./VendorOwnerSummary.css";

export function VendorOwnerSummary({
  name,
  desk,
  initials,
}: {
  name: string;
  desk: string;
  initials: string;
}) {
  return (
    <div className="owner-summary">
      <div className="owner-summary__copy">
        <p className="owner-summary__name">
          <span className="owner-summary__label">Owner:</span> {name}
        </p>
        <p className="owner-summary__desk">{desk}</p>
      </div>
      <Avatar tone="pink" size={32} aria-hidden="true">
        {initials}
      </Avatar>
    </div>
  );
}
