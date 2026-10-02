import type { OrgRole } from "../permissions";
import "./RoleSwitcher.css";

const ROLES: OrgRole[] = ["Owner", "Admin", "Member"];

export function RoleSwitcher({
  value,
  onChange,
}: {
  value: OrgRole;
  onChange: (role: OrgRole) => void;
}) {
  return (
    <div className="role-switch" role="group" aria-label="Preview permissions as">
      {ROLES.map((role) => (
        <button
          key={role}
          type="button"
          className={`role-switch__btn${value === role ? " is-active" : ""}`}
          aria-pressed={value === role}
          onClick={() => onChange(role)}
        >
          {role}
        </button>
      ))}
    </div>
  );
}
