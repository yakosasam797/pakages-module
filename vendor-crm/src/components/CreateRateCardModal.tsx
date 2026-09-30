import { useEffect, useId, useState } from "react";
import { Button } from "@paryatech/design-system";
import { TEMPLATES } from "../rateCard/types";
import { IconClose } from "../icons";
import "./VendorFormModal.css";
import "./CreateRateCardModal.css";

/**
 * Template picker for New rate card — each service type owns a fixed worksheet.
 */
export function CreateRateCardModal({
  open,
  vendorName,
  onClose,
  onCreate,
}: {
  open: boolean;
  vendorName: string;
  onClose: () => void;
  onCreate: (templateId: string) => void;
}) {
  const titleId = useId();
  const [pick, setPick] = useState("hotel");

  useEffect(() => {
    if (!open) return;
    setPick("hotel");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  if (!open) return null;

  const selected = TEMPLATES.find((t) => t.id === pick);
  const canCreate = Boolean(selected?.enabled);

  return (
    <div className="pt-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="pt-modal pt-modal--wide create-rc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-modal__head">
          <div className="create-rc-modal__titles">
            <h2 id={titleId} className="pt-modal__title">
              New rate card — {vendorName}
            </h2>
          </div>
          <button type="button" className="pt-modal__icon-close" onClick={onClose} aria-label="Close">
            <IconClose size={15} />
          </button>
        </div>

        <div className="pt-modal__body create-rc-modal__body">
          <div className="create-rc-modal__list" role="listbox" aria-label="Rate card templates">
            {TEMPLATES.map((tp) => {
              const on = pick === tp.id;
              return (
                <button
                  key={tp.id}
                  type="button"
                  role="option"
                  aria-selected={on}
                  aria-disabled={!tp.enabled}
                  disabled={!tp.enabled}
                  className={`create-rc-modal__option${on ? " create-rc-modal__option--on" : ""}${
                    !tp.enabled ? " create-rc-modal__option--off" : ""
                  }`}
                  onClick={() => tp.enabled && setPick(tp.id)}
                >
                  <div className="create-rc-modal__option-top">
                    <span className="create-rc-modal__option-label">{tp.label}</span>
                    {!tp.enabled ? (
                      <span className="create-rc-modal__soon">Coming soon</span>
                    ) : null}
                  </div>
                  <div className="create-rc-modal__option-blurb">{tp.blurb}</div>
                  <div className="create-rc-modal__option-axes">{tp.detail}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-modal__foot">
          <p className="create-rc-modal__foot-note">
            The worksheet, columns and blockers are fixed by the service type — never reshaped
            afterward.
          </p>
          <div className="pt-modal__foot-acts">
            <Button variant="brand" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!canCreate}
              onClick={() => canCreate && onCreate(pick)}
            >
              Create draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
