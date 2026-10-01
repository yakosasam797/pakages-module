import { useState } from "react";
import { readVehicleOfferings, saveVehicleOfferings } from "../data/vehicleOfferings";
import type { VehicleOffering } from "../rateCard/privateTransport";
import "./VehicleOfferingsPanel.css";

export function VehicleOfferingsPanel({ vendorId, serviceId, canEdit }: { vendorId: string; serviceId: string; canEdit: boolean }) {
  const [offerings, setOfferings] = useState(readVehicleOfferings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<VehicleOffering | null>(null);
  const rows = offerings.filter((item) => item.vendorId === vendorId && item.serviceIds.includes(serviceId));
  const begin = (item?: VehicleOffering) => {
    const next = item ? { ...item } : { id: `vehicle-${Date.now().toString(36)}`, vendorId, serviceIds: [serviceId], label: "", category: "", model: "", passengerSeats: null, mediumBags: null, largeBags: null, cabinBags: null, combinedBagUnits: null, airConditioned: true };
    setDraft(next);
    setEditingId(next.id);
  };
  const save = () => {
    if (!draft?.label.trim() || !draft.category.trim()) return;
    const next = offerings.some((item) => item.id === draft.id) ? offerings.map((item) => item.id === draft.id ? draft : item) : [...offerings, draft];
    saveVehicleOfferings(next);
    setOfferings(next);
    setDraft(null);
    setEditingId(null);
  };
  const input = (label: string, value: string | number | null, onChange: (value: string) => void, type = "text") => <label><span>{label}</span><input aria-label={label} type={type} min={type === "number" ? 0 : undefined} value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></label>;
  return <section className="vehicle-offerings service-detail-panel" aria-label="Vehicle offerings">
    <div className="service-detail-panel__head"><h2>Vehicle offerings</h2>{canEdit && !editingId ? <button type="button" className="vehicle-offerings__button" onClick={() => begin()}>+ Add vehicle</button> : null}</div>
    <div className="vehicle-offerings__table"><div className="vehicle-offerings__row vehicle-offerings__row--head"><span>Vehicle</span><span>Class / model</span><span>Passenger seats</span><span>Bag allowance</span><span>Air conditioning</span><span>Action</span></div>
      {rows.map((item) => <div className="vehicle-offerings__row" key={item.id}><strong>{item.label}</strong><span>{item.category}{item.model ? ` · ${item.model}` : ""}</span><span>{item.passengerSeats ?? "Unconfirmed"}</span><span>{item.mediumBags ?? "?"} medium · {item.largeBags ?? "?"} large · {item.cabinBags ?? "?"} cabin</span><span>{item.airConditioned ? "AC" : "Non-AC"}</span><span>{canEdit ? <button type="button" className="vehicle-offerings__link" onClick={() => begin(item)}>Edit</button> : null}</span></div>)}
      {!rows.length ? <div className="vehicle-offerings__empty">No vehicle offerings for this service.</div> : null}
    </div>
    {draft && editingId ? <div className="vehicle-offerings__form"><div className="vehicle-offerings__fields">
      {input("Vehicle label", draft.label, (label) => setDraft({ ...draft, label }))}
      {input("Vehicle category", draft.category, (category) => setDraft({ ...draft, category }))}
      {input("Class or model", draft.model, (model) => setDraft({ ...draft, model }))}
      {input("Passenger seats excluding driver", draft.passengerSeats, (value) => setDraft({ ...draft, passengerSeats: value === "" ? null : Number(value) }), "number")}
      {input("Medium bags", draft.mediumBags, (value) => setDraft({ ...draft, mediumBags: value === "" ? null : Number(value) }), "number")}
      {input("Large suitcases", draft.largeBags ?? null, (value) => setDraft({ ...draft, largeBags: value === "" ? null : Number(value) }), "number")}
      {input("Cabin bags", draft.cabinBags ?? null, (value) => setDraft({ ...draft, cabinBags: value === "" ? null : Number(value) }), "number")}
      {input("Combined luggage · medium-bag equivalents", draft.combinedBagUnits ?? null, (value) => setDraft({ ...draft, combinedBagUnits: value === "" ? null : Number(value) }), "number")}
      <label><span>Air conditioning</span><select value={draft.airConditioned ? "ac" : "non-ac"} onChange={(event) => setDraft({ ...draft, airConditioned: event.target.value === "ac" })}><option value="ac">AC</option><option value="non-ac">Non-AC</option></select></label>
    </div><div className="vehicle-offerings__actions"><button type="button" className="vehicle-offerings__button" onClick={() => { setDraft(null); setEditingId(null); }}>Cancel</button><button type="button" className="vehicle-offerings__button vehicle-offerings__button--primary" disabled={!draft.label.trim() || !draft.category.trim()} onClick={save}>Save vehicle</button></div></div> : null}
  </section>;
}
