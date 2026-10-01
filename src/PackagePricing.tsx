import { Icon } from "@paryatech/ui";
import type { Dispatch, SetStateAction } from "react";
import { itineraryCosting, type ProposalDay, type ProposalService, type ServiceCostComponent, type ServicePriceState } from "./proposalModel";
import { serviceCostBreakdown } from "./serviceCosting";
import { PackageStructuredPricing } from "./PackageStructuredPricing";
import "./PackagePricing.css";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
type CostCategory = "Activities" | "Visa" | "Flights" | "Other";

export function defaultPackageCharges(category: string): ServiceCostComponent[] {
  const templates: Record<CostCategory, Array<[string, string]>> = {
    Activities: [["Experience fee", "person"], ["Admission", "person"], ["Guide", "group"]],
    Visa: [["Government fee", "applicant"], ["Processing fee", "applicant"], ["Biometrics", "applicant"]],
    Flights: [["Base airfare", "traveller"], ["Airline taxes and surcharges", "traveller"], ["Baggage", "traveller"], ["Booking fee", "booking"]],
    Other: [["Supplier rate", "service"], ["Additional charge", "service"]],
  };
  return (templates[category as CostCategory] ?? templates.Other).map(([label, unit]) => ({ id: crypto.randomUUID(), label, quantity: 1, unitCost: 0, unit }));
}

export function PackagePricing({ days, setDays, markup, setMarkup, price, setPrice, priceBasis, setPriceBasis }: {
  days: ProposalDay[];
  setDays: Dispatch<SetStateAction<ProposalDay[]>>;
  markup: string;
  setMarkup: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  priceBasis: string;
  setPriceBasis: (value: string) => void;
}) {
  const eligible = days.flatMap((day, dayIndex) => day.services.map((service) => ({ day, dayIndex, service })));
  const costing = itineraryCosting(days);
  const partialSell = Math.round(costing.markupBaseCost * (1 + Math.max(0, Number(markup) || 0) / 100));

  const updateService = (dayId: string, serviceId: string, change: (service: ProposalService) => ProposalService) => {
    setDays((current) => current.map((day) => day.id === dayId ? { ...day, services: day.services.map((service) => service.id === serviceId ? change(service) : service) } : day));
  };
  const updateCharge = (dayId: string, serviceId: string, chargeId: string, change: Partial<ServiceCostComponent>) => updateService(dayId, serviceId, (service) => ({ ...service, costComponents: (service.costComponents ?? []).map((item) => item.id === chargeId ? { ...item, ...change } : item) }));

  return <div className="package-pricing">
    <div className="package-pricing__intro"><div><span className="package-pricing__eyebrow">SERVICE COSTING</span><h2>Build the supplier cost</h2><p>Enter the confirmed charges for each service. Amounts stay attached to their itinerary blocks when the package is used in a proposal.</p></div><span className="package-pricing__currency">All amounts in INR</span></div>
    {eligible.length ? <div className="package-pricing__services">{eligible.map(({ day, dayIndex, service }) => {
      if (service.serviceCategory === "Accommodation" || service.serviceCategory === "Transport" || service.serviceCategory === "Activities" && Boolean(service.rateCardId)) return <PackageStructuredPricing key={service.id} service={service} dayIndex={dayIndex} onChange={(patch) => updateService(day.id, service.id, (item) => ({ ...item, ...patch }))} />;
      const charges = service.costComponents ?? defaultPackageCharges(service.serviceCategory ?? "Other");
      const quote = serviceCostBreakdown(service);
      return <section className="package-pricing__service" key={service.id} aria-label={`${service.title} costing`}>
        <header><div className="package-pricing__service-icon"><Icon name={service.kind === "activity" ? "camera" : service.kind === "flight" ? "plane" : service.serviceCategory === "Visa" ? "passport" : "package"} size="sm" /></div><div><span>Day {dayIndex + 1} · {service.serviceCategory}</span><h3>{service.title}</h3><small>{service.vendor ? `Supplier: ${service.vendor}` : service.sourceType === "api" ? "API service · confirm supplier" : "Supplier to confirm"}</small></div><strong className={quote.status === "unpriced" ? "is-unpriced" : ""}>{quote.status === "unpriced" ? "Unpriced" : quote.status === "included" ? "Included" : money.format(quote.total)}</strong></header>
        <div className="package-pricing__body"><div className="package-pricing__settings"><label><span>Pricing status</span><select value={service.priceState ?? "unpriced"} onChange={(event) => updateService(day.id, service.id, (item) => ({ ...item, priceState: event.target.value as ServicePriceState, costComponents: item.costComponents ?? charges }))}><option value="unpriced">Awaiting supplier rate</option><option value="priced">Supplier rates confirmed</option><option value="included">Included at no charge</option></select></label><label className="package-pricing__optional"><input type="checkbox" checked={Boolean(service.optional)} onChange={(event) => updateService(day.id, service.id, (item) => ({ ...item, optional: event.target.checked }))} /><span>Optional extra</span></label></div>
        <div className="package-pricing__source-fields"><label><span>Supplier</span><input value={service.vendor ?? ""} onChange={(event) => updateService(day.id, service.id, (item) => ({ ...item, vendor: event.target.value }))} placeholder="Supplier name" /></label><label><span>Quote / rate reference</span><input value={service.supplierQuoteReference ?? ""} onChange={(event) => updateService(day.id, service.id, (item) => ({ ...item, supplierQuoteReference: event.target.value }))} placeholder="e.g. Rate card or quote ID" /></label><label><span>Rate valid until</span><input type="date" value={service.supplierRateValidUntil ?? ""} onChange={(event) => updateService(day.id, service.id, (item) => ({ ...item, supplierRateValidUntil: event.target.value }))} /></label></div>
        {service.priceState !== "included" ? <><div className="package-pricing__table"><div className="package-pricing__table-head"><span>Supplier charge</span><span>Quantity</span><span>Rate (₹)</span><span>Total</span><span /></div>{charges.map((charge) => <div className="package-pricing__charge" key={charge.id}><input aria-label="Charge name" value={charge.label} onChange={(event) => updateCharge(day.id, service.id, charge.id, { label: event.target.value })} /><div className="package-pricing__quantity"><input type="number" min="0" aria-label={`${charge.label} quantity`} value={charge.quantity} onChange={(event) => updateCharge(day.id, service.id, charge.id, { quantity: Math.max(0, Number(event.target.value) || 0) })} /><input aria-label={`${charge.label} unit`} value={charge.unit} onChange={(event) => updateCharge(day.id, service.id, charge.id, { unit: event.target.value })} /></div><input type="number" min="0" aria-label={`${charge.label} rate`} value={charge.unitCost || ""} placeholder="0" onChange={(event) => updateCharge(day.id, service.id, charge.id, { unitCost: Math.max(0, Number(event.target.value) || 0) })} /><strong>{money.format(charge.quantity * charge.unitCost)}</strong><button type="button" aria-label={`Remove ${charge.label} charge`} onClick={() => updateService(day.id, service.id, (item) => ({ ...item, costComponents: (item.costComponents ?? charges).filter((row) => row.id !== charge.id) }))}><Icon name="clear" size="xs" /></button></div>)}</div><button type="button" className="package-pricing__add-charge" onClick={() => updateService(day.id, service.id, (item) => ({ ...item, costComponents: [...(item.costComponents ?? charges), { id: crypto.randomUUID(), label: "Additional charge", quantity: 1, unitCost: 0, unit: "service" }] }))}><Icon name="plus" size="xs" /> Add charge</button>{service.priceState === "priced" && quote.issue ? <p className="package-pricing__issue">{quote.issue}</p> : null}</> : <p className="package-pricing__included">This service has no separate supplier charge.</p>}
        <label className="package-pricing__note"><span>Costing notes</span><input value={service.costNote ?? ""} onChange={(event) => updateService(day.id, service.id, (item) => ({ ...item, costNote: event.target.value }))} placeholder="Scope, exclusions, or supplier conditions" /></label>
        <div className="package-pricing__service-total"><span>{service.optional ? "Optional supplier cost" : "Included supplier cost"}</span><strong>{quote.status === "priced" ? money.format(quote.total) : quote.status === "included" ? money.format(0) : "To confirm"}</strong></div></div>
      </section>;
    })}</div> : <div className="package-pricing__empty">Add services in the itinerary to build their supplier costs here.</div>}
    <div className="package-pricing__summary"><div><span>Confirmed included supplier cost</span><strong>{money.format(costing.baseCost)}</strong><small>{costing.unpricedRequired ? `${costing.unpricedRequired} included service${costing.unpricedRequired === 1 ? "" : "s"} still unpriced` : "All added services have a pricing state"}</small></div><div><span>Optional supplier cost</span><strong>{money.format(costing.optionalCost)}</strong><small>Excluded from the base package price</small></div><label><span>Markup on confirmed cost (%)</span><input type="number" min="0" value={markup} onChange={(event) => setMarkup(event.target.value)} /></label><div><span>Indicative sell on priced items</span><strong>{money.format(partialSell)}</strong><small>{costing.unpricedRequired ? "Partial while included services remain unpriced" : "Based on the added services and confirmed rates"}</small></div></div>
    <div className="package-pricing__selling"><div><h3>Catalogue starting price</h3><p>Set the customer-facing starting price separately. The indicative amount above covers confirmed items only.</p></div><label><span>Starting price (₹)</span><input type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Enter starting price" /></label><label><span>Price basis</span><input value={priceBasis} onChange={(event) => setPriceBasis(event.target.value)} placeholder="Per adult, twin sharing" /></label></div>
  </div>;
}
