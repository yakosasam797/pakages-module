import { useEffect, useId, useState } from "react";
import { Button } from "@paryatech/design-system";
import { TEMPLATES } from "../rateCard/types";
import { DIRECTORY_SERVICES, VENDOR_SERVICE_CONNECTIONS, type DirectoryService } from "../data/vendorDirectory";
import { IconClose } from "../icons";
import "./VendorFormModal.css";
import "./CreateRateCardModal.css";

/**
 * Template picker for New rate card — each service type owns a fixed worksheet.
 */
export function CreateRateCardModal({
  open,
  vendorName,
  vendorId,
  createdServices = [],
  onClose,
  onCreate,
}: {
  open: boolean;
  vendorName: string;
  vendorId: string;
  createdServices?: DirectoryService[];
  onClose: () => void;
  onCreate: (templateId: string, serviceId: string) => void;
}) {
  const titleId = useId();
  const [pick, setPick] = useState("hotel");
  const [serviceId, setServiceId] = useState("");
  const hasTransport = [...DIRECTORY_SERVICES, ...createdServices].some((service) => service.profileVendorId === vendorId && service.category === "Transport");

  useEffect(() => {
    if (!open) return;
    setPick(hasTransport ? "transport-fixed-transfer" : "hotel");
    setServiceId("");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose, hasTransport]);

  if (!open) return null;

  const selected = TEMPLATES.find((t) => t.id === pick);
  const isTransport = pick.startsWith("transport-");
  const needsService = isTransport || pick === "activity";
  const matchingServices = [...DIRECTORY_SERVICES, ...createdServices].filter((service) => (service.profileVendorId === vendorId || VENDOR_SERVICE_CONNECTIONS.some((connection) => connection.vendorId === vendorId && connection.serviceId === service.id)) && service.category === (isTransport ? "Transport" : "Activities") && (isTransport || Boolean(service.activityOptions?.length)));
  const orderedTemplates = hasTransport ? [...TEMPLATES.filter((template) => template.id.startsWith("transport-")), ...TEMPLATES.filter((template) => !template.id.startsWith("transport-"))] : TEMPLATES;
  const canCreate = Boolean(selected?.enabled && (!needsService || serviceId));

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
          {needsService ? <label className="create-rc-modal__service"><span>{isTransport ? "Transport" : "Activity"} service *</span><select value={serviceId} onChange={(event) => setServiceId(event.target.value)}><option value="">Select this vendor's service</option>{matchingServices.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select>{matchingServices.length === 0 ? <small>Add an {isTransport ? "transport" : "activity"} service to this vendor before creating its rate card.</small> : null}</label> : null}
          <div className="create-rc-modal__list" role="listbox" aria-label="Rate card templates">
            {orderedTemplates.map((tp) => {
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
                  onClick={() => { if (tp.enabled) { setPick(tp.id); setServiceId(""); } }}
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
            {pick === "activity" ? "Choose the supported pricing methods in the activity card." : isTransport ? "One transport pricing method per vendor-owned rate card." : "Choose a supplier rate-card template."}
          </p>
          <div className="pt-modal__foot-acts">
            <Button variant="brand" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!canCreate}
              onClick={() => canCreate && onCreate(pick, serviceId)}
            >
              Create draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
