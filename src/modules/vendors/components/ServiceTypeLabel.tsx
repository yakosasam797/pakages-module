import type { ReactNode } from "react";
import {
  IconBriefcase,
  IconCar,
  IconCompass,
  IconGlobe,
  IconHotel,
  IconIdCard,
  IconPackages,
  IconPlane,
} from "../icons";
import "./ServiceTypeLabel.css";

export type ServiceTypeName =
  | "Accommodation"
  | "Activity"
  | "Activities"
  | "Transport"
  | "Flights"
  | "Visa"
  | "DMC"
  | "DMC/Ground handling"
  | "Cruise"
  | "Other";

function canonicalType(type: ServiceTypeName): string {
  if (type === "Activity") return "Activities";
  if (type === "DMC") return "DMC/Ground handling";
  return type;
}

export function ServiceTypeIcon({
  type,
  size = 15,
}: {
  type: ServiceTypeName;
  size?: number;
}): ReactNode {
  switch (canonicalType(type)) {
    case "Accommodation":
      return <IconHotel size={size} />;
    case "Activities":
      return <IconCompass size={size} />;
    case "Transport":
      return <IconCar size={size} />;
    case "Flights":
      return <IconPlane size={size} />;
    case "Visa":
      return <IconIdCard size={size} />;
    case "DMC/Ground handling":
      return <IconBriefcase size={size} />;
    case "Cruise":
      return <IconGlobe size={size} />;
    default:
      return <IconPackages size={size} />;
  }
}

export function ServiceTypeLabel({
  type,
  compact = false,
}: {
  type: ServiceTypeName;
  compact?: boolean;
}) {
  return (
    <span className={`service-type-label${compact ? " service-type-label--compact" : ""}`}>
      <span className="service-type-label__icon" aria-hidden="true">
        <ServiceTypeIcon type={type} size={compact ? 13 : 15} />
      </span>
      <span className="service-type-label__text">{type}</span>
    </span>
  );
}

export function ServiceTypeList({
  types,
  compact = false,
  ariaLabel = "Service types",
  className = "",
}: {
  types: readonly ServiceTypeName[];
  compact?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  const uniqueTypes = types.filter(
    (type, index) =>
      types.findIndex((candidate) => canonicalType(candidate) === canonicalType(type)) === index,
  );

  if (uniqueTypes.length === 0) {
    return <span className="service-type-list__empty">—</span>;
  }

  return (
    <ul className={`service-type-list${className ? ` ${className}` : ""}`} aria-label={ariaLabel}>
      {uniqueTypes.map((type) => (
        <li key={canonicalType(type)}>
          <ServiceTypeLabel type={type} compact={compact} />
        </li>
      ))}
    </ul>
  );
}
