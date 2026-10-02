import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@paryatech/design-system";
import { DIRECTORY_CATEGORIES, type DirectoryCategory, type DirectoryService } from "../data/vendorDirectory";
import type { Vendor } from "../data/vendors";
import type { ActivityOption } from "../rateCard/activityPricing";
import { IconBuilding, IconCheck, IconChevronDown, IconIdCard, IconPackages, IconPin, IconSearch } from "../icons";
import { ServiceTypeIcon } from "./ServiceTypeLabel";
import "./NewVendorPage.css";
import "./NewServicePage.css";

type FieldDefinition = { key: string; label: string; placeholder: string; required?: boolean };

const typeDetails: Record<DirectoryCategory, { description: string; fields: FieldDefinition[] }> = {
  Accommodation: {
    description: "Describe the property and the stays your team can offer.",
    fields: [
      { key: "propertyType", label: "Property type", placeholder: "Hotel, resort, homestay…", required: true },
      { key: "roomTypes", label: "Room types", placeholder: "Deluxe room, suite, villa…" },
      { key: "checkIn", label: "Check-in time", placeholder: "e.g. 14:00" },
      { key: "checkOut", label: "Check-out time", placeholder: "e.g. 11:00" },
    ],
  },
  Transport: {
    description: "Capture the vehicle and route details needed for trip planning.",
    fields: [
      { key: "vehicleType", label: "Vehicle type", placeholder: "Sedan, SUV, coach…", required: true },
      { key: "capacity", label: "Passenger capacity", placeholder: "e.g. 4 passengers" },
      { key: "route", label: "Route or coverage", placeholder: "Airport to city, full-day local…" },
      { key: "luggage", label: "Luggage allowance", placeholder: "e.g. 2 large bags" },
    ],
  },
  Activities: {
    description: "Make the experience clear enough to add to an itinerary.",
    fields: [
      { key: "duration", label: "Duration", placeholder: "e.g. 3 hours", required: true },
      { key: "groupSize", label: "Group size", placeholder: "e.g. Up to 12 guests" },
      { key: "age", label: "Age suitability", placeholder: "e.g. Ages 8 and above" },
      { key: "meetingPoint", label: "Meeting point", placeholder: "Hotel pickup or meeting address" },
    ],
  },
  Visa: {
    description: "Record the destination and processing scope of this visa service.",
    fields: [
      { key: "visaType", label: "Visa type", placeholder: "Tourist, business, transit…", required: true },
      { key: "validity", label: "Visa validity", placeholder: "e.g. 30 days" },
      { key: "processing", label: "Typical processing time", placeholder: "e.g. 5–7 working days" },
      { key: "documents", label: "Key documents", placeholder: "Passport, photograph…" },
    ],
  },
  Flights: {
    description: "Describe the flight product your team will search or quote.",
    fields: [
      { key: "route", label: "Route", placeholder: "e.g. Delhi to Dubai", required: true },
      { key: "airline", label: "Airline", placeholder: "Airline or multiple carriers" },
      { key: "cabin", label: "Cabin", placeholder: "Economy, premium, business…" },
      { key: "baggage", label: "Baggage", placeholder: "e.g. 20 kg checked" },
    ],
  },
};

function Section({ title, description, icon, children }: { title: string; description?: string; icon: ReactNode; children: ReactNode }) {
  const id = `add-service-${title.toLowerCase().replace(/\W+/g, "-")}`;
  return <section className="new-vendor-section" aria-labelledby={id}>
    <div className="new-vendor-section__label"><span aria-hidden="true">{icon}</span><div><h2 id={id}>{title}</h2>{description ? <p>{description}</p> : null}</div></div>
    <div className="new-vendor-section__content">{children}</div>
  </section>;
}

function VendorPicker({ vendors, value, invalid, disabled = false, onChange }: { vendors: Vendor[]; value: string; invalid: boolean; disabled?: boolean; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const labelId = useId();
  const selected = vendors.find((vendor) => vendor.id === value);
  const matches = vendors.filter((vendor) => `${vendor.name} ${vendor.code} ${vendor.location}`.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  return <div className="new-vendor-field new-service-page__vendor" ref={rootRef} onKeyDown={(event) => {
    if (event.key === "Escape") { setOpen(false); event.stopPropagation(); }
    if (event.key === "Enter" && open && document.activeElement === searchRef.current && matches.length) {
      event.preventDefault(); onChange(matches[0].id); setOpen(false);
    }
  }}>
    <span className="new-vendor-field__label" id={labelId}>Provided by *</span>
    <button type="button" className={`new-service-vendor-picker__trigger${open ? " is-open" : ""}`} aria-labelledby={labelId} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined} aria-invalid={invalid} disabled={disabled} onClick={() => { setQuery(""); setOpen((current) => !current); }}>
      <span className="new-service-vendor-picker__avatar" aria-hidden="true">{selected?.imageUrl ? <img src={selected.imageUrl} alt="" /> : selected?.initials ?? <IconBuilding size={17} />}</span>
      <span className="new-service-vendor-picker__selection">{selected ? <><strong>{selected.name}</strong><small>{selected.code} · {selected.location}</small></> : <span className="new-service-vendor-picker__placeholder">Select vendor</span>}</span>
      <IconChevronDown size={17} />
    </button>
    {open && <div className="new-service-vendor-picker__menu">
      <div className="new-service-vendor-picker__search"><IconSearch size={17} /><input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vendors" aria-label="Search vendors" /></div>
      <div className="new-service-vendor-picker__list" id={listId} role="listbox" aria-label="Vendors">
        {matches.length ? matches.map((vendor) => <button key={vendor.id} type="button" role="option" aria-selected={vendor.id === value} className="new-service-vendor-picker__option" onClick={() => { onChange(vendor.id); setOpen(false); }}>
          <span className="new-service-vendor-picker__avatar" aria-hidden="true">{vendor.imageUrl ? <img src={vendor.imageUrl} alt="" /> : vendor.initials}</span>
          <span className="new-service-vendor-picker__option-copy"><strong>{vendor.name}</strong><small>{vendor.code} · {vendor.location}</small></span>
          {vendor.id === value && <IconCheck size={16} />}
        </button>) : <p className="new-service-vendor-picker__empty">No vendors found</p>}
      </div>
    </div>}
  </div>;
}

export function NewServicePage({ existingServices, vendors, vendorId = "", service, onCancel, onCreated }: {
  existingServices: DirectoryService[];
  vendors: Vendor[];
  vendorId?: string;
  service?: DirectoryService;
  onCancel: () => void;
  onCreated: (service: DirectoryService) => void;
}) {
  const [category, setCategory] = useState<DirectoryCategory>(service?.category ?? "Accommodation");
  const [selectedVendorId, setSelectedVendorId] = useState(service?.profileVendorId ?? vendorId);
  const [name, setName] = useState(service?.name ?? "");
  const [location, setLocation] = useState(service?.location ?? "");
  const [activityOptions, setActivityOptions] = useState<ActivityOption[]>(service?.activityOptions ?? []);
  const [details, setDetails] = useState<Record<string, string>>(() => Object.fromEntries(
    (service?.attributes ?? []).flatMap(({ label, value }) => {
      const field = typeDetails[service!.category].fields.find((item) => item.label === label);
      return field ? [[`${service!.category}:${field.key}`, value]] : [];
    }),
  ));
  const [attempted, setAttempted] = useState(false);
  const [id] = useState(() => service?.id ?? `svc-${crypto.randomUUID().slice(0, 8)}`);
  const fields = typeDetails[category].fields;
  const duplicate = existingServices.find((item) => item.id !== id && item.profileVendorId === selectedVendorId && item.category === category && item.name.trim().toLowerCase() === name.trim().toLowerCase());
  const missing = !selectedVendorId || !vendors.some((vendor) => vendor.id === selectedVendorId) || !name.trim() || !location.trim() || (!service && fields.some((field) => field.required && !details[`${category}:${field.key}`]?.trim())) || (category === "Activities" && (!activityOptions.length || activityOptions.some((option) => !option.name.trim() || option.minAge != null && (option.minAge < 0 || option.maxAge != null && option.maxAge < option.minAge) || option.minParticipants != null && (option.minParticipants < 1 || option.capacity != null && option.minParticipants > option.capacity) || option.includedComponents?.some((item) => option.excludedComponents?.includes(item)))));
  const updateActivityOption = (optionId: string, patch: Partial<ActivityOption>) => setActivityOptions((current) => current.map((option) => option.id === optionId ? { ...option, ...patch } : option));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (missing || duplicate) return;
    onCreated({
      ...service,
      id,
      serviceId: service?.serviceId ?? id,
      profileVendorId: selectedVendorId,
      name: name.trim(),
      category,
      location: location.trim(),
      activityOptions: category === "Activities" ? activityOptions.map((option) => ({ ...option, name: option.name.trim() })) : undefined,
      attributes: [
        ...(service?.attributes ?? []).filter(({ label }) => !fields.some((field) => field.label === label)),
        ...fields.map((field) => ({ label: field.label, value: details[`${category}:${field.key}`]?.trim() ?? "" })).filter((field) => field.value),
      ],
    });
  };

  return <div className="new-vendor-page new-service-page">
    <form className="new-vendor-form" onSubmit={submit} noValidate>
      <header className="new-vendor-form__head"><h1>{service ? "Edit service" : "Add service"}</h1></header>
      {(attempted && missing || duplicate) ? <div className="new-vendor-errors" role="alert">
        <strong>{duplicate ? "This service already exists" : "Complete the required details"}</strong>
        <p>{duplicate ? `${duplicate.name} is already listed for this vendor under ${category}.` : category === "Activities" ? "Complete the service and option names, then check minimum age, party size, capacity and included items." : "Choose a vendor and complete the required service details."}</p>
      </div> : null}

      <Section title="Vendor" description={service ? "The linked vendor stays with this service." : "Select the vendor that provides this service."} icon={<IconBuilding size={18} />}>
        <VendorPicker vendors={vendors} value={selectedVendorId} invalid={attempted && !selectedVendorId} disabled={Boolean(service)} onChange={(id) => { setSelectedVendorId(id); setAttempted(false); }} />
      </Section>

      <Section title="Service identity" description="Name the service and choose the type staff will use to find it." icon={<IconPackages size={18} />}>
        <fieldset className="new-vendor-role-field">
          <legend>Service type *</legend>
          <div className="new-service-types">
            {DIRECTORY_CATEGORIES.filter((item): item is DirectoryCategory => item !== "all").map((type) => <button
              key={type}
              type="button"
              className={category === type ? "is-selected" : ""}
              aria-pressed={category === type}
              onClick={() => { setCategory(type); setAttempted(false); }}
            ><ServiceTypeIcon type={type} size={18} /><span>{type}</span></button>)}
          </div>
        </fieldset>
        <div className="new-vendor-grid new-vendor-grid--2">
          <label className="new-vendor-field"><span className="new-vendor-field__label">Service name *</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder={category === "Accommodation" ? "e.g. Coral Bay Resort" : category === "Transport" ? "e.g. Kochi airport transfer" : "Name staff will recognise"} /></label>
          <label className="new-vendor-field"><span className="new-vendor-field__label">Service ID</span><span className="new-vendor-control"><span className="new-vendor-control__icon"><IconIdCard size={17} /></span><input value={id.toUpperCase()} readOnly className="is-readonly" aria-readonly="true" /></span></label>
          <label className="new-vendor-field"><span className="new-vendor-field__label">{category === "Visa" ? "Destination country *" : "Base location *"}</span><span className="new-vendor-control"><span className="new-vendor-control__icon"><IconPin size={17} /></span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder={category === "Visa" ? "e.g. United Arab Emirates" : "City, destination, or operating area"} /></span></label>
        </div>
      </Section>

      <Section title={`${category} details`} description={typeDetails[category].description} icon={<ServiceTypeIcon type={category} size={18} />}>
        <div className="new-vendor-grid new-vendor-grid--2">
          {fields.map((field) => <label className="new-vendor-field" key={field.key}><span className="new-vendor-field__label">{field.label}{field.required ? " *" : ""}</span><input value={details[`${category}:${field.key}`] ?? ""} onChange={(event) => setDetails((current) => ({ ...current, [`${category}:${field.key}`]: event.target.value }))} placeholder={field.placeholder} /></label>)}
        </div>
      </Section>

      {category === "Activities" ? <Section title="Service options" description="Define the sessions or formats that suppliers can price. These stay with the service, not the rate card." icon={<IconPackages size={18} />}>
        <div className="new-service-options">
          {activityOptions.map((option) => <div className="new-service-options__row" key={option.id}>
            <label className="new-vendor-field"><span className="new-vendor-field__label">Option name *</span><input value={option.name} onChange={(event) => updateActivityOption(option.id, { name: event.target.value })} placeholder="e.g. Shared morning tour" /></label>
            <label className="new-vendor-field"><span className="new-vendor-field__label">Activity category</span><select value={option.category} onChange={(event) => updateActivityOption(option.id, { category: event.target.value as ActivityOption["category"] })}>{(["Admission", "Guided tour", "Class/workshop", "Cruise", "Adventure", "Rental"] as const).map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="new-vendor-field"><span className="new-vendor-field__label">Delivery type</span><select value={option.delivery} onChange={(event) => updateActivityOption(option.id, { delivery: event.target.value as ActivityOption["delivery"] })}><option value="shared">Shared</option><option value="private">Private</option><option value="either">Shared or private</option></select></label>
            <label className="new-vendor-field"><span className="new-vendor-field__label">Duration</span><input value={option.duration} onChange={(event) => updateActivityOption(option.id, { duration: event.target.value })} placeholder="e.g. 2 hours" /></label>
            <label className="new-vendor-field"><span className="new-vendor-field__label">Session</span><input value={option.session} onChange={(event) => updateActivityOption(option.id, { session: event.target.value })} placeholder="e.g. 09:00 or by arrangement" /></label>
            <label className="new-vendor-field"><span className="new-vendor-field__label">Maximum participants</span><input type="number" min="1" value={option.capacity ?? ""} onChange={(event) => updateActivityOption(option.id, { capacity: event.target.value ? Number(event.target.value) : null })} placeholder="If applicable" /></label>
            <label className="new-vendor-field"><span className="new-vendor-field__label">Minimum participants</span><input type="number" min="1" value={option.minParticipants ?? ""} onChange={(event) => updateActivityOption(option.id, { minParticipants: event.target.value ? Number(event.target.value) : null })} placeholder="If applicable" /></label>
            <label className="new-vendor-field"><span className="new-vendor-field__label">Minimum age</span><input type="number" min="0" value={option.minAge ?? ""} onChange={(event) => updateActivityOption(option.id, { minAge: event.target.value ? Number(event.target.value) : null })} placeholder="If applicable" /></label>
            <label className="new-vendor-field"><span className="new-vendor-field__label">Maximum age</span><input type="number" min="0" value={option.maxAge ?? ""} onChange={(event) => updateActivityOption(option.id, { maxAge: event.target.value ? Number(event.target.value) : null })} placeholder="If applicable" /></label>
            <label className="new-vendor-field"><span className="new-vendor-field__label">Available session times</span><input value={(option.sessions ?? []).join(", ")} onChange={(event) => updateActivityOption(option.id, { sessions: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} placeholder="e.g. 15:00, 17:00" /></label>
            <label className="new-vendor-field"><span className="new-vendor-field__label">Supplier-confirmed sessions</span><input value={(option.availableSessions ?? []).map((item) => `${item.date} ${item.session}`).join(", ")} onChange={(event) => updateActivityOption(option.id, { availableSessions: event.target.value.split(",").map((entry) => { const [date, ...timeParts] = entry.trim().split(/\s+/); return { date, session: timeParts.join(" ") }; }).filter((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && entry.session) })} placeholder="e.g. 2026-11-18 15:00" /></label>
            <label className="new-vendor-field"><span className="new-vendor-field__label">Unavailable sessions</span><input value={(option.unavailableSessions ?? []).map((item) => `${item.date} ${item.session}`).join(", ")} onChange={(event) => updateActivityOption(option.id, { unavailableSessions: event.target.value.split(",").map((entry) => { const [date, ...timeParts] = entry.trim().split(/\s+/); return { date, session: timeParts.join(" ") }; }).filter((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.date) && entry.session) })} placeholder="e.g. 2026-11-18 17:00" /></label>
            <fieldset className="new-service-options__components"><legend>Other itinerary components</legend>{(["Transport", "Admission", "Meal", "Equipment"] as const).map((component) => <div key={component}><strong>{component}</strong><label><input type="checkbox" checked={option.includedComponents?.includes(component) ?? false} onChange={(event) => updateActivityOption(option.id, { includedComponents: event.target.checked ? [...(option.includedComponents ?? []), component] : (option.includedComponents ?? []).filter((item) => item !== component), excludedComponents: (option.excludedComponents ?? []).filter((item) => item !== component) })} /> Included</label><label><input type="checkbox" checked={option.excludedComponents?.includes(component) ?? false} onChange={(event) => updateActivityOption(option.id, { excludedComponents: event.target.checked ? [...(option.excludedComponents ?? []), component] : (option.excludedComponents ?? []).filter((item) => item !== component), includedComponents: (option.includedComponents ?? []).filter((item) => item !== component) })} /> Separate</label></div>)}</fieldset>
            <button type="button" className="new-service-options__remove" onClick={() => setActivityOptions((current) => current.filter((item) => item.id !== option.id))}>Remove option</button>
          </div>)}
          <button type="button" className="new-service-options__add" onClick={() => setActivityOptions((current) => [...current, { id: `option-${crypto.randomUUID().slice(0, 8)}`, name: "", category: "Guided tour", delivery: "shared", duration: "", capacity: null, session: "" }])}>Add option</button>
        </div>
      </Section> : null}

      <footer className="new-vendor-actions"><div><Button variant="ghost" size="sm" type="button" onClick={onCancel}>Cancel</Button><Button variant="primary" size="sm" type="submit">{service ? "Save changes" : "Create service"}</Button></div></footer>
    </form>
  </div>;
}
