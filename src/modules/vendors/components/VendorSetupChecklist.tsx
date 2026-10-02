import { Button, StatusChip } from "@paryatech/design-system";
import type { Vendor } from "../data/vendors";
import "./VendorSetupChecklist.css";

const STEPS = [
  {
    id: "profile",
    label: "Complete vendor profile",
    doneKey: "profileComplete" as const,
    tab: null,
  },
  {
    id: "service",
    label: "Add a service or property",
    doneKey: "hasService" as const,
    tab: "services",
  },
  {
    id: "contacts",
    label: "Add compliance documents",
    doneKey: "hasContactsDocs" as const,
    tab: "docs",
  },
  {
    id: "rate-card",
    label: "Create a rate card",
    doneKey: "hasRateCard" as const,
    tab: "rate-cards",
  },
  {
    id: "activate",
    label: "Activate vendor",
    doneKey: "activated" as const,
    tab: null,
  },
] as const;

export function VendorSetupChecklist({
  vendor,
  flash,
  canEdit = false,
  onJumpTab,
  onEditProfile,
}: {
  vendor: Vendor;
  flash?: string | null;
  canEdit?: boolean;
  onJumpTab: (tab: string) => void;
  onEditProfile: () => void;
}) {
  if (vendor.status !== "Setup incomplete" && !flash) return null;

  const remaining = STEPS.filter((step) => !vendor.setup[step.doneKey]).length;

  return (
    <section className="vendor-setup" aria-label="Vendor setup">
      {flash ? (
        <div className="vendor-setup__flash" role="status">
          {flash}
        </div>
      ) : null}

      {vendor.status === "Setup incomplete" ? (
        <div className="vendor-setup__card">
          <div className="vendor-setup__head">
            <div>
              <h2 className="vendor-setup__title">Finish setup</h2>
              <p className="vendor-setup__desc">
                Relationship path: Vendor → Service / property → Rate card. Example: Coral Bay
                Hospitality → Coral Bay Resort → Accommodation tariff 2026–27.
              </p>
            </div>
            <StatusChip tone="progress">
              {remaining} step{remaining === 1 ? "" : "s"} left
            </StatusChip>
          </div>
          <ol className="vendor-setup__list">
            {STEPS.map((step) => {
              const done = vendor.setup[step.doneKey];
              return (
                <li key={step.id} className={`vendor-setup__item${done ? " is-done" : ""}`}>
                  <span className="vendor-setup__check" aria-hidden="true">
                    {done ? "✓" : ""}
                  </span>
                  <span className="vendor-setup__label">{step.label}</span>
                  {!done && step.id === "profile" && canEdit ? (
                    <Button variant="brand" size="sm" type="button" onClick={onEditProfile}>
                      Edit vendor
                    </Button>
                  ) : null}
                  {!done && step.tab ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => onJumpTab(step.tab!)}
                    >
                      Open
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
