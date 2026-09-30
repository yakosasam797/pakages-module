import { useState, type ChangeEvent } from "react";
import type { RateCardDetail, TransportCharge, TransportTariff } from "../rateCard/types";
import { calculateTransportQuote, type TransportQuoteInput } from "../rateCard/transportQuote";
import { formatMoney } from "../rateCard/cards";
import "./TransportRateWorkspace.css";

const TREATMENTS: Array<{ value: TransportCharge["treatment"]; label: string }> = [
  { value: "unconfirmed", label: "Confirm with supplier" },
  { value: "included", label: "Included" },
  { value: "fixed", label: "Fixed extra" },
  { value: "estimated", label: "Estimated" },
  { value: "actuals", label: "Payable at actuals" },
  { value: "not-applicable", label: "Not applicable" },
];

const COLLECTORS: Array<{ value: TransportCharge["collectedBy"]; label: string }> = [
  { value: "unconfirmed", label: "Confirm collector" },
  { value: "agency", label: "Agency" },
  { value: "supplier", label: "Supplier" },
  { value: "driver", label: "Driver" },
];

const PAYERS: Array<{ value: TransportCharge["paidBy"]; label: string }> = [
  { value: "unconfirmed", label: "Confirm payer" },
  { value: "agency", label: "Agency pays" },
  { value: "customer", label: "Customer pays" },
];

function money(amount: number | null, currency: string) {
  return amount == null ? "—" : formatMoney(amount, currency);
}

function numberOrNull(value: string) {
  return value.trim() === "" ? null : Math.max(0, Number(value) || 0);
}

function treatmentLabel(charge: TransportCharge, currency: string) {
  if (charge.treatment === "fixed" && charge.amount != null) return `${money(charge.amount, currency)} / ${charge.unit}`;
  return TREATMENTS.find((item) => item.value === charge.treatment)?.label ?? charge.treatment;
}

function paymentLabel(charge: TransportCharge) {
  if (charge.treatment === "included" || charge.treatment === "not-applicable") return "No separate payment";
  if (charge.paidBy === "unconfirmed" || charge.collectedBy === "unconfirmed") return "Payment routing to confirm";
  return `${charge.paidBy === "agency" ? "Agency" : "Customer"} pays · ${COLLECTORS.find((item) => item.value === charge.collectedBy)?.label} collects`;
}

export function TransportRateDetails({ card, editing = false, onChange }: {
  card: RateCardDetail;
  editing?: boolean;
  onChange?: (next: TransportTariff) => void;
}) {
  const tariff = card.transport;
  if (!tariff) return null;

  const updateOffering = (id: string, patch: Partial<TransportTariff["offerings"][number]>) => {
    onChange?.({ ...tariff, offerings: tariff.offerings.map((item) => item.id === id ? { ...item, ...patch } : item) });
  };
  const updateCharge = (id: string, patch: Partial<TransportCharge>) => {
    onChange?.({ ...tariff, charges: tariff.charges.map((item) => item.id === id ? { ...item, ...patch } : item) });
  };
  const updatePrice = (routeId: string, offeringId: string, amount: number | null) => {
    onChange?.({ ...tariff, routes: tariff.routes.map((route) => route.id === routeId
      ? { ...route, prices: { ...route.prices, [offeringId]: amount } }
      : route) });
  };

  return (
    <div className="transport-workspace">
      <section className="transport-workspace__intro" aria-label="Transport rate basis">
        <div><span>Service</span><strong>Airport transfer</strong></div>
        <div><span>Fare method</span><strong>Fixed per vehicle · per transfer</strong></div>
        <div><span>Tax on supplier fare</span>{editing ? <select aria-label="Supplier fare tax presentation" value={tariff.taxPresentation} onChange={(event) => onChange?.({ ...tariff, taxPresentation: event.target.value as TransportTariff["taxPresentation"] })}><option value="unconfirmed">Confirm</option><option value="included">Included</option><option value="additional">Added separately</option></select> : <strong>{tariff.taxPresentation === "included" ? "Included" : tariff.taxPresentation === "additional" ? "Added separately" : "Confirm with supplier"}</strong>}</div>
        <div><span>Availability</span>{editing ? <select aria-label="Vehicle availability" value={tariff.availability} onChange={(event) => onChange?.({ ...tariff, availability: event.target.value as TransportTariff["availability"] })}><option value="not-held">Vehicle not held</option><option value="held">Held</option><option value="confirmed">Confirmed</option></select> : <strong>{tariff.availability === "not-held" ? "Vehicle not held" : tariff.availability === "held" ? "Held" : "Confirmed"}</strong>}</div>
      </section>

      <section className="transport-workspace__section" aria-labelledby="transport-route-rates">
        <div className="transport-workspace__head"><div><h2 id="transport-route-rates">Transfer fares</h2><p>One fare buys one vehicle for the selected direction. The route limit selects the fare; kilometres are not charged again.</p></div><span className="transport-workspace__tag">Supplier cost · {card.currency}</span></div>
        <div className="transport-workspace__scroll">
          <table className="transport-workspace__table">
            <thead><tr><th scope="col">Route</th>{tariff.offerings.map((offering) => <th scope="col" key={offering.id}>{offering.label}</th>)}</tr></thead>
            <tbody>{tariff.routes.map((route) => <tr key={route.id}>
              <th scope="row"><strong>{route.label}</strong>{editing ? <label className="transport-workspace__route-limit"><span>Included kilometres</span><input type="number" min="1" value={route.includedKm} onChange={(event) => onChange?.({ ...tariff, routes: tariff.routes.map((item) => item.id === route.id ? { ...item, includedKm: Math.max(1, Number(event.target.value) || 1) } : item) })} /></label> : <small>One way · up to {route.includedKm} km</small>}</th>
              {tariff.offerings.map((offering) => <td key={offering.id}>{editing ? <label className="transport-workspace__edit-price"><span className="sr-only">{route.label} {offering.label} price</span><input type="number" min="0" inputMode="numeric" value={route.prices[offering.id] ?? ""} onChange={(event) => updatePrice(route.id, offering.id, numberOrNull(event.target.value))} /></label> : <><strong className="transport-workspace__money">{money(route.prices[offering.id] ?? null, card.currency)}</strong><small>per vehicle · tax {tariff.taxPresentation}</small></>}</td>)}
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="transport-workspace__section" aria-labelledby="transport-vehicles">
        <div className="transport-workspace__head"><div><h2 id="transport-vehicles">Vehicle suitability</h2><p>Confirm customer seats excluding the driver and the bag limit for the actual supplier offering.</p></div></div>
        <div className="transport-workspace__vehicles">{tariff.offerings.map((offering) => <article key={offering.id}>
          <div className="transport-workspace__vehicle-title"><strong>{offering.label}</strong><span>{offering.passengerSeats && offering.luggageBags ? "Capacity recorded" : "Capacity to confirm"}</span></div>
          {editing ? <label className="transport-workspace__model"><span>Model or equivalent</span><input value={offering.modelOrEquivalent} onChange={(event) => updateOffering(offering.id, { modelOrEquivalent: event.target.value })} /></label> : <p>{offering.modelOrEquivalent}</p>}
          <div className="transport-workspace__vehicle-facts">
            <label><span>Passenger seats</span>{editing ? <input type="number" min="1" value={offering.passengerSeats ?? ""} placeholder="Confirm" onChange={(event) => updateOffering(offering.id, { passengerSeats: numberOrNull(event.target.value) })} /> : <strong>{offering.passengerSeats ?? "Not confirmed"}</strong>}</label>
            <label><span>Bags</span>{editing ? <input type="number" min="0" value={offering.luggageBags ?? ""} placeholder="Confirm" onChange={(event) => updateOffering(offering.id, { luggageBags: numberOrNull(event.target.value) })} /> : <strong>{offering.luggageBags ?? "Not confirmed"}</strong>}</label>
          </div>
        </article>)}</div>
      </section>

      <section className="transport-workspace__section" aria-labelledby="transport-fare-terms">
        <div className="transport-workspace__head"><div><h2 id="transport-fare-terms">Usage and fare rules</h2><p>These conditions belong to this supplier rate, not to every transport service.</p></div></div>
        <div className="transport-workspace__terms">
          <div><span>Distance measurement</span>{editing ? <input value={tariff.distanceBasis} onChange={(event) => onChange?.({ ...tariff, distanceBasis: event.target.value })} /> : <strong>{tariff.distanceBasis}</strong>}</div>
          <div><span>Waiting allowance and rate</span>{editing ? <div className="transport-workspace__inline-fields"><label><input type="number" min="0" value={tariff.waitingIncludedMinutes} onChange={(event) => onChange?.({ ...tariff, waitingIncludedMinutes: Math.max(0, Number(event.target.value) || 0) })} /><small>Minutes included</small></label><label><input type="number" min="0" value={tariff.waitingRatePerHour} onChange={(event) => onChange?.({ ...tariff, waitingRatePerHour: Math.max(0, Number(event.target.value) || 0) })} /><small>Per billable hour / vehicle</small></label></div> : <><strong>{tariff.waitingIncludedMinutes} minutes</strong><small>After the allowance: {money(tariff.waitingRatePerHour, card.currency)} per billable hour, per vehicle</small></>}</div>
          <div><span>Waiting rounding</span>{editing ? <input value={tariff.waitingRounding} onChange={(event) => onChange?.({ ...tariff, waitingRounding: event.target.value })} /> : <strong>{tariff.waitingRounding}</strong>}</div>
          <div><span>Quote validity</span>{editing ? <input type="date" value={tariff.quoteValidUntil ?? ""} onChange={(event) => onChange?.({ ...tariff, quoteValidUntil: event.target.value || null })} /> : <strong>{tariff.quoteValidUntil || "Confirm before customer issue"}</strong>}</div>
        </div>
      </section>

      <section className="transport-workspace__section" aria-labelledby="transport-charges">
        <div className="transport-workspace__head"><div><h2 id="transport-charges">Charge treatment</h2><p>Included amounts are never added again. Unconfirmed charges keep the quote in review.</p></div></div>
        <div className="transport-workspace__charges">{tariff.charges.map((charge) => <div key={charge.id} className="transport-workspace__charge">
          <div><strong>{charge.label}</strong><small>{charge.note}</small></div>
          {editing ? <><select aria-label={`${charge.label} treatment`} value={charge.treatment} onChange={(event) => updateCharge(charge.id, { treatment: event.target.value as TransportCharge["treatment"] })}>{TREATMENTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><label className="transport-workspace__charge-amount"><span className="sr-only">{charge.label} amount</span><input type="number" min="0" placeholder="Amount" disabled={charge.treatment !== "fixed" && charge.treatment !== "estimated"} value={charge.amount ?? ""} onChange={(event) => updateCharge(charge.id, { amount: numberOrNull(event.target.value) })} /></label><select aria-label={`${charge.label} unit`} value={charge.unit} onChange={(event) => updateCharge(charge.id, { unit: event.target.value as TransportCharge["unit"] })}><option value="transfer">Per transfer</option><option value="vehicle">Per vehicle</option><option value="hour">Per hour</option></select><select aria-label={`${charge.label} payer`} value={charge.paidBy} onChange={(event) => updateCharge(charge.id, { paidBy: event.target.value as TransportCharge["paidBy"] })}>{PAYERS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><select aria-label={`${charge.label} collector`} value={charge.collectedBy} onChange={(event) => updateCharge(charge.id, { collectedBy: event.target.value as TransportCharge["collectedBy"] })}>{COLLECTORS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></>
            : <><span className={`transport-workspace__treatment is-${charge.treatment}`}>{treatmentLabel(charge, card.currency)}</span><span className="transport-workspace__collector">{paymentLabel(charge)}</span></>}
        </div>)}</div>
      </section>
    </div>
  );
}

const DEFAULT_TEST = { travelDate: "2026-10-12", routeId: "cok-city", additionalStops: "", offeringId: "SEDAN", travellers: 2, staffSeats: 0, bags: 0, passengerSeats: null, luggageBags: null, vehicles: 1, plannedKm: 30, billableWaitingHours: 0 } satisfies TransportQuoteInput;

export function TransportTestRate({ card }: { card: RateCardDetail }) {
  const tariff = card.transport;
  const [input, setInput] = useState<TransportQuoteInput>(DEFAULT_TEST);
  const [pickup, setPickup] = useState("Cochin International Airport (COK)");
  const [drop, setDrop] = useState("Kochi city");
  const [time, setTime] = useState("10:00");
  const [dropTime, setDropTime] = useState("11:30");
  if (!tariff) return null;
  const route = tariff.routes.find((item) => item.id === input.routeId) ?? tariff.routes[0];
  const offering = tariff.offerings.find((item) => item.id === input.offeringId) ?? tariff.offerings[0];
  const result = calculateTransportQuote(tariff, input);
  const setField = <K extends keyof TransportQuoteInput>(key: K, value: TransportQuoteInput[K]) => setInput((current) => ({ ...current, [key]: value }));
  const numberInput = (key: "travellers" | "staffSeats" | "bags" | "vehicles" | "plannedKm", min = 0) => ({
    type: "number" as const, min, inputMode: "numeric" as const,
    value: input[key] ?? "",
    onChange: (event: ChangeEvent<HTMLInputElement>) => setField(key, numberOrNull(event.target.value) ?? 0),
  });

  return <div className="transport-test">
    <section className="transport-test__inputs" aria-labelledby="transport-test-inputs">
      <div className="transport-test__head"><span>TEST RATE · {card.ref}</span><h2 id="transport-test-inputs">Set the transfer scope</h2><p>Enter the actual group and journey. A vehicle rate is charged once per transfer, not once per traveller.</p></div>
      <div className="transport-test__group"><h3>01 · Journey</h3><div className="transport-test__fields">
        <label><span>Direction</span><select value={input.routeId} onChange={(event) => { const next = tariff.routes.find((item) => item.id === event.target.value); setField("routeId", event.target.value); if (next) { setPickup(next.from); setDrop(next.to); } }}>{tariff.routes.map((item) => <option key={item.id} value={item.id}>{item.label} · up to {item.includedKm} km</option>)}</select></label>
        <label><span>Travel date</span><input type="date" value={input.travelDate} onChange={(event) => setField("travelDate", event.target.value)} /></label>
        <label><span>Pickup · {tariff.timezone}</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
        <label><span>Expected drop · {tariff.timezone}</span><input type="time" value={dropTime} onChange={(event) => setDropTime(event.target.value)} /></label>
        <label><span>Planned distance · km</span><input {...numberInput("plannedKm", 1)} /></label>
        <label><span>Actual pickup</span><input value={pickup} onChange={(event) => setPickup(event.target.value)} /></label>
        <label><span>Final drop</span><input value={drop} onChange={(event) => setDrop(event.target.value)} /></label>
        <label className="transport-test__wide"><span>Additional stops or pickup points</span><input value={input.additionalStops} placeholder="None for the standard transfer" onChange={(event) => setField("additionalStops", event.target.value)} /></label>
      </div></div>
      <div className="transport-test__group"><h3>02 · Group and vehicle</h3><div className="transport-test__fields">
        <label><span>Travellers needing seats</span><input {...numberInput("travellers", 1)} /></label>
        <label><span>Guide / staff seats</span><input {...numberInput("staffSeats")} /></label>
        <label><span>Bags</span><input {...numberInput("bags")} /></label>
        <label><span>Vehicle offering</span><select value={input.offeringId} onChange={(event) => { setField("offeringId", event.target.value); setInput((current) => ({ ...current, offeringId: event.target.value, passengerSeats: null, luggageBags: null })); }}>{tariff.offerings.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label><span>Passenger seats · supplier confirmed</span><input type="number" min="1" placeholder="Confirm" value={input.passengerSeats ?? offering?.passengerSeats ?? ""} onChange={(event) => setField("passengerSeats", numberOrNull(event.target.value))} /></label>
        <label><span>Bags per vehicle · supplier confirmed</span><input type="number" min="0" placeholder="Confirm" value={input.luggageBags ?? offering?.luggageBags ?? ""} onChange={(event) => setField("luggageBags", numberOrNull(event.target.value))} /></label>
        <label><span>Vehicles selected</span><input {...numberInput("vehicles", 1)} /></label>
        <label><span>Chargeable waiting hours</span><input type="number" min="0" step="0.25" value={input.billableWaitingHours} onChange={(event) => setField("billableWaitingHours", numberOrNull(event.target.value) ?? 0)} /></label>
      </div><p className="transport-test__hint">{result.minimumVehicles == null ? "Confirm capacity to see the minimum vehicle quantity." : `Minimum needed for seats and bags: ${result.minimumVehicles} ${result.minimumVehicles === 1 ? "vehicle" : "vehicles"}. Agency staff chooses the final arrangement.`}</p><div className="transport-test__alternatives"><strong>Other vehicle offerings</strong>{tariff.offerings.filter((item) => item.id !== input.offeringId).map((item) => {
          const bagsNeeded = input.bags === 0 ? 0 : item.luggageBags ? Math.ceil(input.bags / item.luggageBags) : null;
          const vehiclesNeeded = item.passengerSeats && bagsNeeded != null ? Math.max(1, Math.ceil((input.travellers + input.staffSeats) / item.passengerSeats), bagsNeeded) : null;
          return <button type="button" key={item.id} onClick={() => setInput((current) => ({ ...current, offeringId: item.id, passengerSeats: null, luggageBags: null }))}><span>{item.label}<small>{vehiclesNeeded == null ? "Capacity to confirm" : `${vehiclesNeeded} ${vehiclesNeeded === 1 ? "vehicle" : "vehicles"} needed`}</small></span><b>{money(route?.prices[item.id] ?? null, card.currency)} / vehicle</b></button>;
        })}</div></div>
      <div className="transport-test__foot"><button type="button" onClick={() => { setInput(DEFAULT_TEST); setPickup(tariff.routes[0]?.from ?? ""); setDrop(tariff.routes[0]?.to ?? ""); setTime("10:00"); setDropTime("11:30"); }}>Reset inputs</button><span>Availability is not reserved by testing a rate.</span></div>
    </section>
    <section className="transport-test__result" aria-labelledby="transport-test-result">
      <div className="transport-test__head"><span>CALCULATION · SUPPLIER RATE</span><h2 id="transport-test-result">Transfer cost</h2><p>{route?.label} · {offering?.label} · {input.vehicles} {input.vehicles === 1 ? "vehicle" : "vehicles"} · {tariff.availability === "not-held" ? "availability not held" : tariff.availability}</p></div>
      <div className="transport-test__amount"><span>{result.estimatedExtras ? "Supplier planning amount" : "Known supplier amount"}</span><strong>{money(result.planningAmount, card.currency)}</strong><small>{result.quoteBasis === "needs-review" ? "Needs review before customer issue" : result.quoteBasis === "fixed" ? "Fixed for the confirmed scope" : result.quoteBasis === "fixed-plus-actuals" ? "Fixed fare plus listed actuals" : "Estimate for the confirmed scope"}</small></div>
      <div className="transport-test__lines"><div><span>Fixed transfer fare <small>{money(route?.prices[input.offeringId] ?? null, card.currency)} × {input.vehicles} {input.vehicles === 1 ? "vehicle" : "vehicles"}</small></span><strong>{money(result.baseFare, card.currency)}</strong></div><div><span>Chargeable waiting <small>{input.billableWaitingHours} h × {money(tariff.waitingRatePerHour, card.currency)} × {input.vehicles}</small></span><strong>{money(result.waitingCharge, card.currency)}</strong></div><div><span>Confirmed fixed extras</span><strong>{money(result.fixedExtras, card.currency)}</strong></div>{result.estimatedExtras ? <div><span>Estimated supplier extras</span><strong>{money(result.estimatedExtras, card.currency)}</strong></div> : null}</div>
      <div className="transport-test__review"><h3>{result.blockers.length ? `${result.blockers.length} items need confirmation` : "Rate scope checked"}</h3>{result.blockers.length ? <ul>{result.blockers.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Seats, bags and listed charges are accounted for. Confirm availability and validity before issuing.</p>}</div>
      {result.actuals.length || result.estimates.length || result.directPayments.length ? <div className="transport-test__notes">{result.actuals.length ? <p><strong>Payable at actuals:</strong> {result.actuals.join(", ")}</p> : null}{result.estimates.length ? <p><strong>Estimated:</strong> {result.estimates.join(", ")}</p> : null}{result.directPayments.length ? <p><strong>Customer pays directly:</strong> {result.directPayments.join(", ")}</p> : null}</div> : null}
      <div className="transport-test__selling"><span>Supplier cost only</span><strong>{result.blockers.length ? "Needs review" : money(result.planningAmount, card.currency)}</strong><small>Customer selling price and tax presentation are set in the proposal. Supplier fare tax: {tariff.taxPresentation}.</small></div>
    </section>
  </div>;
}
