import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { Button, IconButton, StatusChip } from "@paryatech/design-system";
import {
  INTERNAL_OWNERS,
  SERVICE_CATEGORIES,
  VENDOR_COUNTRIES,
  VENDOR_STATUS_OPTIONS,
  type Vendor,
} from "../data/vendors";
import { ForbiddenError, type OrgRole } from "../permissions";
import { IconClose } from "../icons";
import {
  createVendor,
  emptyVendorFormValues,
  findDuplicateVendors,
  updateVendor,
  validateVendorForm,
  vendorToFormValues,
  type VendorFormValues,
} from "../vendorApi";
import "./VendorFormModal.css";

export type VendorFormMode = "create" | "edit";

const VENDOR_EDIT_LINKS = [
  { id: "overview", label: "Profile" },
  { id: "services", label: "Services" },
  { id: "rate-cards", label: "Rate cards" },
  { id: "packages", label: "Packages" },
  { id: "bookings", label: "Bookings" },
  { id: "finance", label: "Finance" },
  { id: "docs", label: "Documents" },
  { id: "tasks", label: "Tasks" },
  { id: "comms", label: "Communications" },
  { id: "activity", label: "Activity" },
] as const;

function ProfileSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="pt-profile-section">
      <div className="pt-profile-section__intro">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="pt-profile-section__content">{children}</div>
    </section>
  );
}

function ProfileField({
  label,
  htmlFor,
  note,
  wide = false,
  children,
}: {
  label: string;
  htmlFor?: string;
  note?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`pt-mf${wide ? " pt-mf--wide" : ""}`}>
      <label className="pt-mf__l" htmlFor={htmlFor}>{label}</label>
      {children}
      {note ? <p className="pt-mf__note">{note}</p> : null}
    </div>
  );
}

export function VendorFormModal({
  mode,
  open,
  vendor,
  vendors,
  orgRole,
  onClose,
  onCreated,
  onUpdated,
  onViewExisting,
  onNavigateTab,
}: {
  mode: VendorFormMode;
  open: boolean;
  vendor?: Vendor | null;
  vendors: Vendor[];
  orgRole: OrgRole;
  onClose: () => void;
  onCreated: (vendor: Vendor) => void;
  onUpdated: (vendor: Vendor) => void;
  onViewExisting: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
}) {
  const titleId = useId();
  const [values, setValues] = useState<VendorFormValues>(emptyVendorFormValues());
  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrors([]);
    setSubmitError(null);
    setValues(mode === "edit" && vendor ? vendorToFormValues(vendor) : emptyVendorFormValues());
  }, [open, mode, vendor]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  const duplicates = useMemo(
    () =>
      open
        ? findDuplicateVendors(
            vendors,
            { name: values.name, phone: values.phone, email: values.email },
            mode === "edit" ? vendor?.id : undefined,
          )
        : [],
    [open, vendors, values.name, values.phone, values.email, mode, vendor?.id],
  );

  if (!open) return null;

  const setField = <K extends keyof VendorFormValues>(key: K, value: VendorFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setSubmitError(null);
  };

  const toggleCategory = (category: (typeof SERVICE_CATEGORIES)[number]) => {
    setValues((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
    setSubmitError(null);
  };

  const submit = () => {
    const nextErrors = validateVendorForm(values);
    setErrors(nextErrors);
    if (nextErrors.length) return;

    try {
      if (mode === "create") {
        onCreated(createVendor(vendors, values, orgRole));
        return;
      }
      if (!vendor) return;
      onUpdated(updateVendor(vendors, vendor.id, values, orgRole));
    } catch (error) {
      if (error instanceof ForbiddenError) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError(error instanceof Error ? error.message : "Something went wrong.");
    }
  };

  return (
    <div className="pt-modal-overlay open" role="presentation" onClick={onClose}>
      <form
        className="pt-modal pt-modal--profile"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="pt-modal__head">
          <h2 id={titleId} className="pt-modal__title">
            {mode === "create" ? "Add vendor" : "Edit vendor"}
          </h2>
          <IconButton className="pt-modal__close" label="Close" onClick={onClose}>
            <IconClose />
          </IconButton>
        </div>

        {mode === "edit" ? (
          <nav className="pt-profile-links" aria-label="Vendor sections">
            {VENDOR_EDIT_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                className={link.id === "overview" ? "is-active" : undefined}
                aria-current={link.id === "overview" ? "page" : undefined}
                onClick={() => {
                  if (link.id === "overview") return;
                  onClose();
                  onNavigateTab?.(link.id);
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>
        ) : null}

        <div className="pt-modal__body pt-profile-form">
          {errors.length || submitError ? (
            <div className="pt-mf__errors" role="alert">
              {submitError ? <p>{submitError}</p> : null}
              {errors.map((error) => <p key={error}>{error}</p>)}
            </div>
          ) : null}

          <ProfileSection title="Identity" description="Update the vendor’s name, status, and service identity.">
            <div className="pt-profile-grid pt-profile-grid--2">
              <ProfileField label="Vendor or business name *" htmlFor="vf-name">
                <input
                  id="vf-name"
                  className={`pt-mf__i${errors.some((error) => error.includes("name")) ? " is-invalid" : ""}`}
                  value={values.name}
                  onChange={(event) => setField("name", event.target.value)}
                  placeholder="e.g. Coral Bay Hospitality"
                  autoComplete="organization"
                />
              </ProfileField>
              {mode === "edit" && vendor ? (
                <ProfileField label="Vendor ID" htmlFor="vf-code">
                  <input id="vf-code" className="pt-mf__i pt-mf__i--readonly pt-mono" value={vendor.code} readOnly />
                </ProfileField>
              ) : null}
              <ProfileField label="Status" htmlFor="vf-status">
                <select
                  id="vf-status"
                  className="pt-mf__i"
                  value={values.status}
                  onChange={(event) => setField("status", event.target.value as VendorFormValues["status"])}
                >
                  {VENDOR_STATUS_OPTIONS.filter((status) => status !== "Archived" || orgRole === "Owner").map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </ProfileField>
              <ProfileField label="Labels" htmlFor="vf-labels">
                <input id="vf-labels" className="pt-mf__i" value={values.labels} onChange={(event) => setField("labels", event.target.value)} placeholder="Preferred, premium, Kerala" />
              </ProfileField>
            </div>
            <fieldset className="pt-mf pt-mf--wide">
              <legend className="pt-mf__l">Service categories *</legend>
              <div className="pt-mf__chips">
                {SERVICE_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`pt-mf__chip${values.categories.includes(category) ? " is-on" : ""}`}
                    aria-pressed={values.categories.includes(category)}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </fieldset>
          </ProfileSection>

          <ProfileSection title="Primary contact" description="Keep the main contact channels current for your team.">
            <div className="pt-profile-grid pt-profile-grid--2">
              <ProfileField label="Contact name" htmlFor="vf-contact">
                <input id="vf-contact" className="pt-mf__i" value={values.contactName} onChange={(event) => setField("contactName", event.target.value)} placeholder="Full name" autoComplete="name" />
              </ProfileField>
              <ProfileField label="Email" htmlFor="vf-email">
                <input id="vf-email" className="pt-mf__i" type="email" value={values.email} onChange={(event) => setField("email", event.target.value)} placeholder="contact@vendor.com" autoComplete="email" />
              </ProfileField>
              <ProfileField label="Phone" htmlFor="vf-phone">
                <input id="vf-phone" className="pt-mf__i" value={values.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="+91 98470 10001" inputMode="tel" autoComplete="tel" />
              </ProfileField>
              <ProfileField label="WhatsApp" htmlFor="vf-whatsapp">
                <input id="vf-whatsapp" className="pt-mf__i" value={values.whatsapp} onChange={(event) => setField("whatsapp", event.target.value)} placeholder="+91 98470 10001" inputMode="tel" />
              </ProfileField>
            </div>
            <p className="pt-profile-section__note">At least one of phone or email is required.</p>
          </ProfileSection>

          <ProfileSection title="Location" description="Maintain the vendor’s operating and mailing address.">
            <div className="pt-profile-grid pt-profile-grid--3">
              <ProfileField label="City *" htmlFor="vf-city">
                <input id="vf-city" className="pt-mf__i" value={values.city} onChange={(event) => setField("city", event.target.value)} placeholder="Kochi" autoComplete="address-level2" />
              </ProfileField>
              <ProfileField label="State or region" htmlFor="vf-state">
                <input id="vf-state" className="pt-mf__i" value={values.state} onChange={(event) => setField("state", event.target.value)} placeholder="Kerala" autoComplete="address-level1" />
              </ProfileField>
              <ProfileField label="Country *" htmlFor="vf-country">
                <select id="vf-country" className="pt-mf__i" value={values.country} onChange={(event) => setField("country", event.target.value)}>
                  {VENDOR_COUNTRIES.map((country) => <option key={country}>{country}</option>)}
                </select>
              </ProfileField>
              <ProfileField label="Street address" htmlFor="vf-address" wide>
                <textarea id="vf-address" className="pt-mf__i pt-mf__i--area" rows={2} value={values.address} onChange={(event) => setField("address", event.target.value)} placeholder="Building, street, and district" autoComplete="street-address" />
              </ProfileField>
              <ProfileField label="Postal code" htmlFor="vf-postal">
                <input id="vf-postal" className="pt-mf__i" value={values.postalCode} onChange={(event) => setField("postalCode", event.target.value)} placeholder="682001" autoComplete="postal-code" />
              </ProfileField>
            </div>
          </ProfileSection>

          <ProfileSection title="Business details" description="Manage ownership and statutory information.">
            <div className="pt-profile-grid pt-profile-grid--2">
              <ProfileField label="Legal business name" htmlFor="vf-legal">
                <input id="vf-legal" className="pt-mf__i" value={values.legalName} onChange={(event) => setField("legalName", event.target.value)} placeholder="Name on contracts and invoices" />
              </ProfileField>
              <ProfileField label="Internal owner *" htmlFor="vf-owner">
                <select id="vf-owner" className="pt-mf__i" value={values.owner} onChange={(event) => setField("owner", event.target.value)}>
                  {INTERNAL_OWNERS.map((owner) => <option key={owner.name}>{owner.name}</option>)}
                </select>
              </ProfileField>
              <ProfileField label="GSTIN" htmlFor="vf-gstin">
                <input id="vf-gstin" className="pt-mf__i" value={values.gstin} onChange={(event) => setField("gstin", event.target.value)} placeholder="GST registration number" />
              </ProfileField>
              <ProfileField label="PAN" htmlFor="vf-pan">
                <input id="vf-pan" className="pt-mf__i" value={values.pan} onChange={(event) => setField("pan", event.target.value)} placeholder="Permanent account number" />
              </ProfileField>
            </div>
          </ProfileSection>

          <ProfileSection title="Operations" description="Set the communication and fulfilment details used by operations.">
            <div className="pt-profile-grid pt-profile-grid--2">
              {values.categories.includes("DMC/Ground handling") ? (
                <ProfileField label="DMC scope" htmlFor="vf-dmc-scope">
                  <select id="vf-dmc-scope" className="pt-mf__i" value={values.dmcScope} onChange={(event) => setField("dmcScope", event.target.value)}>
                    <option value="">Not set</option>
                    <option>Domestic</option>
                    <option>International</option>
                    <option>Both</option>
                  </select>
                </ProfileField>
              ) : null}
              <ProfileField label="Reservations email" htmlFor="vf-reservations-email">
                <input id="vf-reservations-email" className="pt-mf__i" type="email" value={values.reservationsEmail} onChange={(event) => setField("reservationsEmail", event.target.value)} placeholder="reservations@vendor.com" />
              </ProfileField>
              <ProfileField label="Emergency phone" htmlFor="vf-emergency-phone">
                <input id="vf-emergency-phone" className="pt-mf__i" value={values.emergencyPhone} onChange={(event) => setField("emergencyPhone", event.target.value)} placeholder="24-hour contact" inputMode="tel" />
              </ProfileField>
              <ProfileField label="Confirmation SLA" htmlFor="vf-sla">
                <input id="vf-sla" className="pt-mf__i" value={values.confirmationSla} onChange={(event) => setField("confirmationSla", event.target.value)} placeholder="e.g. Within 4 hours" />
              </ProfileField>
              <ProfileField label="Confirmation channel" htmlFor="vf-channel">
                <select id="vf-channel" className="pt-mf__i" value={values.confirmationChannel} onChange={(event) => setField("confirmationChannel", event.target.value)}>
                  <option value="">Not set</option>
                  <option>Email</option>
                  <option>Phone</option>
                  <option>WhatsApp</option>
                  <option>Extranet</option>
                </select>
              </ProfileField>
              <ProfileField label="Payment terms" htmlFor="vf-payment-terms">
                <input id="vf-payment-terms" className="pt-mf__i" value={values.paymentTerms} onChange={(event) => setField("paymentTerms", event.target.value)} placeholder="e.g. Net 30" />
              </ProfileField>
              <ProfileField label="Specializations" htmlFor="vf-specializations" wide>
                <textarea id="vf-specializations" className="pt-mf__i pt-mf__i--area" rows={2} value={values.specializations} onChange={(event) => setField("specializations", event.target.value)} placeholder="Regions, trip styles, or supplier strengths" />
              </ProfileField>
              <ProfileField label="Internal notes" htmlFor="vf-notes" wide>
                <textarea id="vf-notes" className="pt-mf__i pt-mf__i--area" rows={3} value={values.internalNotes} onChange={(event) => setField("internalNotes", event.target.value)} placeholder="Commercial context, contracting notes, or known constraints" />
              </ProfileField>
            </div>
          </ProfileSection>

          {duplicates.length > 0 ? (
            <div className="pt-dup" role="status">
              <div className="pt-dup__title">A similar vendor may already exist</div>
              <ul className="pt-dup__list">
                {duplicates.slice(0, 3).map(({ vendor: match, reasons }) => (
                  <li key={match.id} className="pt-dup__item">
                    <div className="pt-dup__main">
                      <strong>{match.name}</strong>
                      <span className="pt-dup__meta">{match.location} · {match.status}</span>
                      <span className="pt-dup__reasons">{reasons.join(" · ")}</span>
                    </div>
                    <div className="pt-dup__side">
                      <StatusChip tone={match.status === "Active" ? "done" : "open"}>{match.status}</StatusChip>
                      <Button variant="brand" size="sm" type="button" onClick={() => { onClose(); onViewExisting(match.id); }}>
                        View existing vendor
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="pt-modal__foot">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" type="submit">
            {mode === "create" ? "Create vendor" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
