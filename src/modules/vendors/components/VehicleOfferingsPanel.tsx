import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Button, Checkbox, FilterSelect, IconButton, TextField } from "@paryatech/design-system";
import { DIRECTORY_SERVICES, VENDOR_SERVICE_CONNECTIONS, readCreatedDirectoryServices } from "../data/vendorDirectory";
import { readVehicleOfferings, saveVehicleOfferings } from "../data/vehicleOfferings";
import type { VehicleOffering } from "../rateCard/privateTransport";
import { IconClose, IconPencil, IconPlus } from "../icons";
import "./VendorFormModal.css";
import "./VehicleOfferingsPanel.css";

const CATEGORIES = ["Sedan", "MUV", "SUV", "Van", "Tempo Traveller", "Minibus", "Coach"];

export function VehicleOfferingsPanel({ vendorId, serviceId, canEdit }: { vendorId: string; serviceId: string; canEdit: boolean }) {
  const [offerings, setOfferings] = useState(readVehicleOfferings);
  const [draft, setDraft] = useState<VehicleOffering | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const formId = useId();
  const open = Boolean(draft);
  const rows = offerings.filter((item) => item.vendorId === vendorId && item.serviceIds.includes(serviceId));
  const services = [...readCreatedDirectoryServices(), ...DIRECTORY_SERVICES].filter((item, index, all) => item.category === "Transport" && all.findIndex((candidate) => candidate.id === item.id) === index && (item.profileVendorId === vendorId || VENDOR_SERVICE_CONNECTIONS.some((connection) => connection.vendorId === vendorId && connection.serviceId === item.id)));
  const editing = draft ? offerings.some((item) => item.id === draft.id) : false;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const dropdown = dialogRef.current?.querySelector('[role="listbox"]');
        if (dropdown) {
          const trigger = dropdown.parentElement?.querySelector<HTMLButtonElement>('.pt-filter-btn');
          trigger?.click();
          trigger?.focus();
          event.preventDefault();
          return;
        }
        event.preventDefault();
        setDraft(null);
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [tabindex="0"]')].filter((item) => item.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      returnFocusRef.current?.focus();
    };
  }, [open]);

  const change = (update: Partial<VehicleOffering>) => {
    setErrors([]);
    setDraft((current) => current ? { ...current, ...update } : current);
  };

  const begin = (item?: VehicleOffering) => {
    returnFocusRef.current = document.activeElement as HTMLElement;
    setOfferings(readVehicleOfferings());
    setNotice("");
    setErrors([]);
    setDraft(item ? structuredClone(item) : { id: `vehicle-${crypto.randomUUID()}`, vendorId, serviceIds: [serviceId], label: "", category: "", model: "", passengerSeats: null, mediumBags: null, largeBags: null, cabinBags: null, combinedBagUnits: null, airConditioned: true, attributes: [] });
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!draft || !canEdit) return;
    const issues: string[] = [];
    if (!draft.label.trim()) issues.push("Enter a vehicle name.");
    if (!draft.category.trim()) issues.push("Choose a vehicle category.");
    if (!Number.isInteger(draft.passengerSeats) || (draft.passengerSeats ?? 0) < 1) issues.push("Enter the passenger seats, excluding the driver.");
    for (const [label, value] of [["Medium bags", draft.mediumBags], ["Large suitcases", draft.largeBags], ["Cabin bags", draft.cabinBags]] as const) {
      if (value != null && (!Number.isInteger(value) || value < 0)) issues.push(`${label} must be a whole number of zero or more.`);
    }
    if (draft.combinedBagUnits != null && (!Number.isFinite(draft.combinedBagUnits) || draft.combinedBagUnits < 0)) issues.push("Combined luggage allowance must be zero or more.");
    if (!draft.serviceIds.includes(serviceId)) issues.push("Keep this vehicle linked to the current service.");
    const current = readVehicleOfferings();
    if (current.some((item) => item.id !== draft.id && item.vendorId === vendorId && item.label.trim().toLowerCase() === draft.label.trim().toLowerCase())) issues.push("This vendor already has a vehicle with that name. Use a distinct class or model name.");
    setErrors(issues);
    if (issues.length) return;
    const saved = { ...draft, label: draft.label.trim(), category: draft.category.trim(), model: draft.model.trim(), attributes: draft.attributes?.filter(Boolean) };
    const next = current.some((item) => item.id === saved.id) ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved];
    try {
      saveVehicleOfferings(next);
      setOfferings(next);
      setDraft(null);
      setNotice(`${saved.label} ${editing ? "updated" : "added"}.`);
    } catch { setErrors(["The vehicle could not be saved in this browser. Please try again."]); }
  };
  const countField = (label: string, key: "passengerSeats" | "mediumBags" | "largeBags" | "cabinBags" | "combinedBagUnits", hint?: string) => draft ? <TextField label={label} aria-label={label} type="number" min={key === "passengerSeats" ? 1 : 0} step={key === "combinedBagUnits" ? 0.5 : 1} value={draft[key] ?? ""} hint={hint} onChange={(event) => change({ [key]: event.target.value === "" ? null : Number(event.target.value) })} /> : null;

  return <section className="vehicle-offerings service-detail-panel" aria-label="Vehicle offerings">
    <div className="service-detail-panel__head"><h2>Vehicle offerings</h2>{canEdit ? <Button variant="primary" size="sm" onClick={() => begin()}><IconPlus />Add vehicle</Button> : null}</div>
    {notice ? <p className="vehicle-offerings__notice" role="status">{notice}</p> : null}
    <div className="vehicle-offerings__table" role="table" aria-label="Vehicle offerings">
      <div className="vehicle-offerings__row vehicle-offerings__row--head" role="row"><span role="columnheader">Vehicle</span><span role="columnheader">Class / model</span><span role="columnheader">Passenger seats</span><span role="columnheader">Luggage allowance</span><span role="columnheader">AC</span><span role="columnheader">Action</span></div>
      {rows.map((item) => <div className="vehicle-offerings__row" role="row" key={item.id}><strong role="cell">{item.label}</strong><span role="cell">{item.category}{item.model ? ` · ${item.model}` : ""}</span><span role="cell">{item.passengerSeats ?? "Unconfirmed"}</span><span role="cell" className="vehicle-offerings__luggage">{item.mediumBags ?? "?"} medium · {item.largeBags ?? "?"} large · {item.cabinBags ?? "?"} cabin<small>{item.combinedBagUnits == null ? "Combined allowance unconfirmed" : `${item.combinedBagUnits} combined bag units`}</small></span><span role="cell">{item.airConditioned ? "AC" : "Non-AC"}</span><span role="cell">{canEdit ? <IconButton label={`Edit ${item.label}`} onClick={() => begin(item)}><IconPencil /></IconButton> : null}</span></div>)}
      {!rows.length ? <div className="vehicle-offerings__empty">No vehicle offerings for this service.</div> : null}
    </div>
    {draft && canEdit ? createPortal(<div className="pt-modal-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(null); }}>
      <div className="pt-modal pt-modal--wide vehicle-offerings__dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="pt-modal__head"><h2 className="pt-modal__title" id={titleId}>{editing ? "Edit vehicle" : "Add vehicle"}</h2><IconButton label="Close vehicle form" onClick={() => setDraft(null)}><IconClose /></IconButton></div>
        <form className="pt-modal__body" id={formId} onSubmit={save} noValidate>
          {errors.length ? <div className="vehicle-offerings__errors" role="alert"><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}
          <div className="vehicle-offerings__fields">
            <TextField label="Vehicle name *" aria-label="Vehicle name" value={draft.label} placeholder="e.g. AC 12-seat Van" onChange={(event) => change({ label: event.target.value })} />
            <div className="vehicle-offerings__select"><span>Vehicle category *</span><FilterSelect aria-label="Vehicle category" value={draft.category} options={[{ value: "", label: "Select category" }, ...[...new Set([...CATEGORIES, ...offerings.filter((item) => item.vendorId === vendorId).map((item) => item.category).filter(Boolean)])].map((category) => ({ value: category, label: category }))]} onChange={(category) => change({ category })} /></div>
            <TextField label="Class / model" aria-label="Class or model" value={draft.model} placeholder="Model or permitted equivalent" onChange={(event) => change({ model: event.target.value })} />
            {countField("Passenger seats *", "passengerSeats", "Excluding the driver; include seats used by guides.")}
            {countField("Medium bags", "mediumBags")}
            {countField("Large suitcases", "largeBags")}
            {countField("Cabin bags", "cabinBags")}
            {countField("Combined luggage allowance", "combinedBagUnits", "Supplier-confirmed total: medium = 1, large = 2, cabin = 0.5 units. Blank means unconfirmed.")}
            <div className="vehicle-offerings__select"><span>Air conditioning</span><FilterSelect aria-label="Air conditioning" value={draft.airConditioned ? "ac" : "non-ac"} options={[{ value: "ac", label: "AC" }, { value: "non-ac", label: "Non-AC" }]} onChange={(value) => change({ airConditioned: value === "ac" })} /></div>
            <TextField label="Other attributes" aria-label="Other vehicle attributes" value={draft.attributes?.join(", ") ?? ""} placeholder="e.g. child seat, luggage carrier" onChange={(event) => change({ attributes: event.target.value.split(",").map((item) => item.trim()) })} />
          </div>
          {services.length > 1 ? <fieldset className="vehicle-offerings__services"><legend>Available for transport services</legend>{services.map((service) => <label key={service.id}><Checkbox label={service.name} state={draft.serviceIds.includes(service.id) ? "on" : "off"} disabled={service.id === serviceId} onCheckedChange={(state) => change({ serviceIds: state === "on" ? [...new Set([...draft.serviceIds, service.id])] : draft.serviceIds.filter((id) => id !== service.id) })} /><span>{service.name}</span></label>)}</fieldset> : null}
        </form>
        <div className="pt-modal__foot vehicle-offerings__actions"><Button variant="brand" size="sm" onClick={() => setDraft(null)}>Cancel</Button><Button variant="primary" size="sm" type="submit" form={formId}>{editing ? "Save changes" : "Add vehicle"}</Button></div>
      </div>
    </div>, document.body) : null}
  </section>;
}
