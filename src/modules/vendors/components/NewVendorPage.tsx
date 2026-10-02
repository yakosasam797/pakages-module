import { useMemo, useState } from "react";
import { Button } from "@paryatech/design-system";
import {
  INTERNAL_OWNERS,
  SERVICE_CATEGORIES,
  VENDOR_COUNTRIES,
  makeVendorCode,
  type ServiceCategory,
  type Vendor,
} from "../data/vendors";
import {
  IconBuilding,
  IconGlobe,
  IconIdCard,
  IconMail,
  IconPhone,
  IconPin,
  IconUser,
  IconVendors,
} from "../icons";
import { ForbiddenError, type OrgRole } from "../permissions";
import {
  createVendor,
  emptyVendorFormValues,
  findDuplicateVendors,
  validateVendorForm,
  type VendorFormValues,
} from "../vendorApi";
import "./NewVendorPage.css";

type NewVendorDetails = VendorFormValues & {
  dmcScope: "Domestic" | "International" | "Both";
  phoneCode: string;
  whatsappCode: string;
};

const ROLE_LABELS: Record<ServiceCategory, string> = {
  Accommodation: "Accommodation",
  "DMC/Ground handling": "DMC",
  Transport: "Transport",
  Activities: "Activities",
  Flights: "Flights",
  Visa: "Visa",
  Cruise: "Cruise",
  Other: "Other",
};

const DIAL_CODES = ["+91", "+971", "+44", "+65", "+66", "+94"];
const CITY_SUGGESTIONS = [
  { city: "Kochi", state: "Kerala", country: "India" },
  { city: "Alleppey", state: "Kerala", country: "India" },
  { city: "Munnar", state: "Kerala", country: "India" },
  { city: "Goa", state: "Goa", country: "India" },
  { city: "Mumbai", state: "Maharashtra", country: "India" },
  { city: "Dubai", state: "Dubai", country: "United Arab Emirates" },
];

function initialValues(): NewVendorDetails {
  return {
    ...emptyVendorFormValues(),
    labels: "",
    dmcScope: "Domestic",
    specializations: "",
    phoneCode: "+91",
    whatsappCode: "+91",
    whatsapp: "",
    state: "",
    address: "",
    postalCode: "",
    legalName: "",
    gstin: "",
    pan: "",
    internalNotes: "",
  };
}

function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`new-vendor-field ${className}`}>
      <span className="new-vendor-field__label">{label}</span>
      {children}
      {hint ? <span className="new-vendor-field__hint">{hint}</span> : null}
    </label>
  );
}

function FormSection({
  id,
  title,
  description,
  icon,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="new-vendor-section" aria-labelledby={id}>
      <div className="new-vendor-section__label">
        <span aria-hidden="true">{icon}</span>
        <div>
          <h2 id={id}>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="new-vendor-section__content">{children}</div>
    </section>
  );
}

export function NewVendorPage({
  vendors,
  orgRole,
  onCancel,
  onCreated,
  onViewExisting,
}: {
  vendors: Vendor[];
  orgRole: OrgRole;
  onCancel: () => void;
  onCreated: (vendor: Vendor) => void;
  onViewExisting: (id: string) => void;
}) {
  const [values, setValues] = useState<NewVendorDetails>(initialValues);
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const phone = values.phone.trim() ? `${values.phoneCode} ${values.phone.trim()}` : "";
  const previewCode = makeVendorCode(values.name || "New vendor", vendors);
  const canSubmit = Boolean(
    values.name.trim() &&
      values.categories.length &&
      values.city.trim() &&
      values.country.trim() &&
      values.owner.trim() &&
      (values.phone.trim() || values.email.trim()),
  );
  const duplicates = useMemo(
    () => findDuplicateVendors(vendors, { name: values.name, phone, email: values.email }),
    [phone, values.email, values.name, vendors],
  );
  const citySuggestions = CITY_SUGGESTIONS.filter(({ city, state, country }) => {
    const query = values.city.trim().toLowerCase();
    return (
      !query ||
      city.toLowerCase().includes(query) ||
      state.toLowerCase().includes(query) ||
      country.toLowerCase().includes(query)
    );
  }).slice(0, 4);

  const setField = <K extends keyof NewVendorDetails>(key: K, value: NewVendorDetails[K]) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (sameAsPhone && key === "phone") next.whatsapp = String(value);
      if (sameAsPhone && key === "phoneCode") next.whatsappCode = String(value);
      return next;
    });
    setSubmitError(null);
  };

  const toggleCategory = (category: ServiceCategory) => {
    setValues((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const coreValues: VendorFormValues = {
      ...values,
      name: values.name,
      categories: values.categories,
      country: values.country,
      city: values.city,
      contactName: values.contactName,
      phone,
      email: values.email,
      whatsapp: values.whatsapp.trim()
        ? `${values.whatsappCode} ${values.whatsapp.trim()}`
        : "",
      owner: values.owner,
      status: "Draft",
    };
    const nextErrors = validateVendorForm(coreValues);
    setErrors(nextErrors);
    if (nextErrors.length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const created = createVendor(vendors, coreValues, orgRole);
      const enriched: Vendor = {
        ...created,
        labels: values.labels.split(",").map((label) => label.trim()).filter(Boolean),
        whatsapp: values.whatsapp.trim()
          ? `${values.whatsappCode} ${values.whatsapp.trim()}`
          : "",
        state: values.state.trim(),
        address: values.address.trim(),
        postalCode: values.postalCode.trim(),
        legalName: values.legalName.trim(),
        gstin: values.gstin.trim().toUpperCase(),
        pan: values.pan.trim().toUpperCase(),
        dmcScope: values.categories.includes("DMC/Ground handling") ? values.dmcScope : "",
        specializations: values.specializations.trim(),
        internalNotes: values.internalNotes.trim(),
      };
      onCreated(enriched);
    } catch (error) {
      if (error instanceof ForbiddenError) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError(error instanceof Error ? error.message : "Vendor could not be created.");
    }
  };

  return (
    <div className="new-vendor-page">
      <form className="new-vendor-form" onSubmit={submit} noValidate>
        <header className="new-vendor-form__head">
          <h1>Add vendor</h1>
        </header>

        {errors.length || submitError ? (
          <div className="new-vendor-errors" role="alert" aria-live="polite">
            <strong>Complete the required details</strong>
            {submitError ? <p>{submitError}</p> : null}
            {errors.map((error) => <p key={error}>{error}</p>)}
          </div>
        ) : null}

        <FormSection id="new-vendor-identity" title="Identity" description="Name the business and define the services it provides." icon={<IconVendors size={18} />}>
          <div className="new-vendor-grid new-vendor-grid--2">
            <Field label="Vendor or business name *">
              <span className="new-vendor-control">
                <span className="new-vendor-control__icon"><IconBuilding size={17} /></span>
                <input name="vendorName" required value={values.name} onChange={(event) => setField("name", event.target.value)} placeholder="e.g. Coral Bay Hospitality…" autoComplete="organization" />
              </span>
            </Field>
            <Field label="Vendor code">
              <span className="new-vendor-control">
                <span className="new-vendor-control__icon"><IconIdCard size={17} /></span>
                <input name="vendorCode" value={previewCode} readOnly className="is-readonly" aria-readonly="true" />
              </span>
            </Field>
          </div>

          <fieldset className="new-vendor-role-field">
            <legend>Service categories *</legend>
            <div className="new-vendor-role-list">
              {SERVICE_CATEGORIES.map((category) => {
                const selected = values.categories.includes(category);
                return (
                  <button key={category} type="button" className={selected ? "is-selected" : ""} aria-pressed={selected} onClick={() => toggleCategory(category)}>
                    {ROLE_LABELS[category]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field label="Labels" hint="Separate labels with commas.">
            <input name="labels" value={values.labels} onChange={(event) => setField("labels", event.target.value)} placeholder="Preferred, premium, Kerala…" autoComplete="off" />
          </Field>

          {values.categories.includes("DMC/Ground handling") ? (
            <div className="new-vendor-subsection">
              <Field label="DMC scope">
                <select name="dmcScope" value={values.dmcScope} onChange={(event) => setField("dmcScope", event.target.value as NewVendorDetails["dmcScope"])}>
                  <option>Domestic</option>
                  <option>International</option>
                  <option>Both</option>
                </select>
              </Field>
              <Field label="Specializations">
                <textarea name="specializations" rows={3} value={values.specializations} onChange={(event) => setField("specializations", event.target.value)} placeholder="Regions, trip styles, or supplier strengths…" />
              </Field>
            </div>
          ) : null}
        </FormSection>

        <FormSection id="new-vendor-contact" title="Primary contact" description="Add the person your team should contact first." icon={<IconUser size={18} />}>
          <div className="new-vendor-grid new-vendor-grid--3 new-vendor-grid--contact">
            <Field label="Contact name">
              <span className="new-vendor-control">
                <span className="new-vendor-control__icon"><IconUser size={17} /></span>
                <input name="contactName" value={values.contactName} onChange={(event) => setField("contactName", event.target.value)} placeholder="Full name…" autoComplete="name" />
              </span>
            </Field>
            <Field label="Phone">
              <span className="new-vendor-phone new-vendor-control">
                <span className="new-vendor-control__icon"><IconPhone size={17} /></span>
                <select name="phoneCode" aria-label="Phone country code" value={values.phoneCode} onChange={(event) => setField("phoneCode", event.target.value)}>
                  {DIAL_CODES.map((code) => <option key={code}>{code}</option>)}
                </select>
                <input name="phone" type="tel" aria-label="Phone number" value={values.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="81234 56789…" inputMode="tel" autoComplete="tel-national" />
              </span>
            </Field>
            <Field label="Email">
              <span className="new-vendor-control">
                <span className="new-vendor-control__icon"><IconMail size={17} /></span>
                <input name="email" type="email" value={values.email} onChange={(event) => setField("email", event.target.value)} placeholder="contact@vendor.com…" inputMode="email" autoComplete="email" spellCheck={false} />
              </span>
            </Field>
          </div>

          <div className="new-vendor-grid new-vendor-grid--2">
            <Field label="WhatsApp number">
              <span className="new-vendor-phone new-vendor-control">
                <span className="new-vendor-control__icon"><IconPhone size={17} /></span>
                <select name="whatsappCode" aria-label="WhatsApp country code" value={values.whatsappCode} disabled={sameAsPhone} onChange={(event) => setField("whatsappCode", event.target.value)}>
                  {DIAL_CODES.map((code) => <option key={code}>{code}</option>)}
                </select>
                <input name="whatsapp" type="tel" aria-label="WhatsApp number" value={values.whatsapp} disabled={sameAsPhone} onChange={(event) => setField("whatsapp", event.target.value)} placeholder="81234 56789…" inputMode="tel" autoComplete="tel-national" />
              </span>
            </Field>
            <label className="new-vendor-check">
              <input
                type="checkbox"
                checked={sameAsPhone}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setSameAsPhone(checked);
                  if (checked) {
                    setValues((current) => ({
                      ...current,
                      whatsapp: current.phone,
                      whatsappCode: current.phoneCode,
                    }));
                  }
                }}
              />
              <span>Same as phone</span>
            </label>
          </div>
        </FormSection>

        <FormSection id="new-vendor-location" title="Location" description="Record the vendor’s operating and mailing location." icon={<IconPin size={18} />}>
          <div className="new-vendor-grid new-vendor-grid--3">
            <Field label="City *">
              <span className="new-vendor-control new-vendor-control--suggestions">
                <span className="new-vendor-control__icon"><IconPin size={17} /></span>
                <input
                  name="city"
                  required
                  value={values.city}
                  onChange={(event) => {
                    setField("city", event.target.value);
                    setShowCitySuggestions(true);
                  }}
                  onFocus={() => setShowCitySuggestions(true)}
                  onBlur={() => window.setTimeout(() => setShowCitySuggestions(false), 120)}
                  placeholder="Search city…"
                  autoComplete="address-level2"
                  aria-autocomplete="list"
                  aria-expanded={showCitySuggestions && citySuggestions.length > 0}
                  aria-controls="vendor-city-suggestions"
                />
                {showCitySuggestions && citySuggestions.length > 0 ? (
                  <div className="new-vendor-suggestions" id="vendor-city-suggestions" role="listbox" aria-label="City suggestions">
                    {citySuggestions.map((suggestion) => (
                      <button
                        key={`${suggestion.city}-${suggestion.country}`}
                        type="button"
                        role="option"
                        aria-selected={values.city === suggestion.city}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setField("city", suggestion.city);
                          setField("state", suggestion.state);
                          setField("country", suggestion.country);
                          setShowCitySuggestions(false);
                        }}
                      >
                        <span><IconPin size={15} /></span>
                        <strong>{suggestion.city}</strong>
                        <small>{suggestion.state}, {suggestion.country}</small>
                      </button>
                    ))}
                  </div>
                ) : null}
              </span>
            </Field>
            <Field label="State or region">
              <span className="new-vendor-control">
                <span className="new-vendor-control__icon"><IconPin size={17} /></span>
                <input name="state" value={values.state} onChange={(event) => setField("state", event.target.value)} placeholder="Kerala…" autoComplete="address-level1" />
              </span>
            </Field>
            <Field label="Country *">
              <span className="new-vendor-control">
                <span className="new-vendor-control__icon"><IconGlobe size={17} /></span>
                <select name="country" required value={values.country} onChange={(event) => setField("country", event.target.value)} autoComplete="country-name">
                  {VENDOR_COUNTRIES.map((country) => <option key={country}>{country}</option>)}
                </select>
              </span>
            </Field>
          </div>

          <Field label="Street address">
            <textarea name="address" rows={3} value={values.address} onChange={(event) => setField("address", event.target.value)} placeholder="Building, street, and district…" autoComplete="street-address" />
          </Field>

          <Field label="Postal code" className="new-vendor-field--short">
            <input name="postalCode" value={values.postalCode} onChange={(event) => setField("postalCode", event.target.value)} placeholder="682001…" autoComplete="postal-code" inputMode="numeric" />
          </Field>
        </FormSection>

        <FormSection id="new-vendor-business" title="Business details" description="Add ownership, compliance, and internal context." icon={<IconBuilding size={18} />}>
          <div className="new-vendor-grid new-vendor-grid--2">
            <Field label="Legal business name">
              <input name="legalName" value={values.legalName} onChange={(event) => setField("legalName", event.target.value)} placeholder="Name shown on contracts and invoices…" autoComplete="organization" />
            </Field>
            <Field label="Internal owner *">
              <span className="new-vendor-control">
                <span className="new-vendor-control__icon"><IconUser size={17} /></span>
                <select name="owner" required value={values.owner} onChange={(event) => setField("owner", event.target.value)}>
                  {INTERNAL_OWNERS.map((owner) => <option key={owner.name}>{owner.name}</option>)}
                </select>
              </span>
            </Field>
            <Field label="GSTIN">
              <input name="gstin" value={values.gstin} onChange={(event) => setField("gstin", event.target.value)} placeholder="GST registration number…" autoComplete="off" spellCheck={false} />
            </Field>
            <Field label="PAN">
              <input name="pan" value={values.pan} onChange={(event) => setField("pan", event.target.value)} placeholder="Permanent account number…" autoComplete="off" spellCheck={false} />
            </Field>
          </div>

          <Field label="Internal notes">
            <textarea name="internalNotes" rows={3} value={values.internalNotes} onChange={(event) => setField("internalNotes", event.target.value)} placeholder="Commercial context, contracting notes, or known constraints…" />
          </Field>
        </FormSection>

        {duplicates.length > 0 ? (
          <aside className="new-vendor-duplicate" aria-live="polite">
            <div><strong>A similar vendor may already exist</strong><span>{duplicates[0].reasons.join(" · ")}</span></div>
            <button type="button" onClick={() => onViewExisting(duplicates[0].vendor.id)}>View {duplicates[0].vendor.name}</button>
          </aside>
        ) : null}

        <footer className="new-vendor-actions">
          <div>
            <Button variant="ghost" size="sm" type="button" onClick={onCancel}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" disabled={!canSubmit}>Create draft vendor</Button>
          </div>
        </footer>
      </form>
    </div>
  );
}
