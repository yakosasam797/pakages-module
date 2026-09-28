import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button, Icon, Modal } from "@paryatech/ui";
import type { IconName } from "@paryatech/ui";
import type { PackageRecord } from "./App";
import { packageDaysForProposal } from "./PackageDetail";
import type { ProposalDay, ProposalService } from "./proposalModel";
import { PackagePricing, defaultPackageCharges } from "./PackagePricing";
import {
  crmServiceOptions, kindForCategory,
  packageServiceCategories, searchApiServices,
  type PackageServiceCategory, type PackageServiceOption,
} from "./packageServiceSearch";
import "./PackageComposer.css";

const icons: Record<PackageServiceCategory, IconName> = {
  Accommodation: "hotel", Transport: "bus", Activities: "camera",
  Visa: "passport", Flights: "plane", Other: "package",
};
const blockLabels: Record<PackageServiceCategory, string> = {
  Accommodation: "accommodation", Transport: "transport", Activities: "activity",
  Visa: "visa", Flights: "flight", Other: "service",
};

const makeDay = (index: number): ProposalDay => ({ id: crypto.randomUUID(), title: `Day ${index} plan`, place: "", services: [], plannedBlockCount: 1 });

function initialDays(source?: PackageRecord | null): ProposalDay[] {
  if (source) return packageDaysForProposal(source).map((day) => ({ ...day, plannedBlockCount: Math.max(day.plannedBlockCount ?? 1, day.services.length), services: day.services.map((item) => {
    if (item.serviceCategory === "Transport") return { ...item, transportPricingMode: item.rateCardId ? undefined : item.transportPricingMode ?? "transfer", transportChargesStatus: item.transportChargesStatus ?? "to_confirm", quantity: item.quantity ?? 1, transportUnits: item.transportUnits ?? 1 };
    if (item.costComponents || !["Activities", "Visa", "Flights", "Other"].includes(item.serviceCategory ?? "")) return { ...item, costComponents: item.costComponents?.map((charge) => ({ ...charge })) };
    const charges = defaultPackageCharges(item.serviceCategory ?? "Other");
    if (item.cost != null) { charges[0].unitCost = item.cost; charges[0].quantity = item.quantity ?? 1; }
    return { ...item, costComponents: charges };
  }) }));
  return Array.from({ length: 3 }, (_, index) => makeDay(index + 1));
}

export interface PackageOutline {
  name: string;
  destination: string;
  region: string;
  days: ProposalDay[];
  overview: string;
  inclusions: string;
  exclusions: string;
  startingPrice?: number;
  markupPercent: number;
  priceBasis: string;
  image: string;
}

export function PackageComposer({ existing, initialTemplate, onCancel, onSave }: {
  existing?: PackageRecord | null;
  initialTemplate?: PackageRecord | null;
  onCancel: () => void;
  onSave: (outline: PackageOutline) => void;
}) {
  const source = existing ?? initialTemplate;
  const [name, setName] = useState(source?.name ?? "");
  const [destination, setDestination] = useState(source?.destination ?? "");
  const [region, setRegion] = useState(source?.region ?? "");
  const [days, setDays] = useState<ProposalDay[]>(() => initialDays(source));
  const [overview, setOverview] = useState(source?.highlights?.[0] ?? "");
  const [inclusions, setInclusions] = useState(source?.inclusions ?? "");
  const [exclusions, setExclusions] = useState(source?.exclusions ?? "");
  const [price, setPrice] = useState(source?.startingPrice ? String(source.startingPrice) : "");
  const [priceBasis, setPriceBasis] = useState(source?.priceBasis ?? "Per adult, twin sharing");
  const [markup, setMarkup] = useState(String(source?.markupPercent ?? 9));
  const [pickerDayId, setPickerDayId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"details" | "itinerary" | "content">("details");
  useEffect(() => { document.querySelector(".pt-scroll")?.scrollTo({ top: 0 }); }, [phase]);
  const [category, setCategory] = useState<PackageServiceCategory | null>(null);
  const [query, setQuery] = useState("");
  const [apiResults, setApiResults] = useState<PackageServiceOption[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [error, setError] = useState("");
  const crmOptions = useMemo(crmServiceOptions, []);
  const blockCount = days.reduce((sum, day) => sum + day.services.length, 0);

  useEffect(() => {
    if (!pickerDayId || query.trim().length < 2) { setApiResults([]); setApiLoading(false); setApiError(""); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setApiLoading(true);
      searchApiServices(query, controller.signal)
        .then((items) => { setApiResults(items); setApiError(""); })
        .catch((cause) => { if (!controller.signal.aborted) setApiError(cause instanceof Error ? cause.message : "Search failed. Try again."); })
        .finally(() => { if (!controller.signal.aborted) setApiLoading(false); });
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [pickerDayId, query]);

  const visibleOptions = [...crmOptions, ...apiResults].filter((item) =>
    item.category === category &&
    (!query.trim() || `${item.name} ${item.location} ${item.vendor ?? ""} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase())),
  );

  const addOption = (option: PackageServiceOption) => {
    if (!pickerDayId) return;
    const service: ProposalService = {
      id: crypto.randomUUID(),
      kind: kindForCategory[option.category],
      title: option.name,
      detail: option.description,
      vendor: option.vendor,
      image: option.image,
      sourceType: option.source,
      sourceId: option.id,
      serviceCategory: option.category,
      transportPricingMode: option.category === "Transport" ? "transfer" : undefined,
      transportChargesStatus: option.category === "Transport" ? "to_confirm" : undefined,
      quantity: option.category === "Transport" ? 1 : undefined,
      transportUnits: option.category === "Transport" ? 1 : undefined,
      driverIncluded: option.category === "Transport" ? true : undefined,
      vehicleTier: option.category === "Transport" ? "standard" : undefined,
      costComponents: ["Activities", "Visa", "Flights", "Other"].includes(option.category) ? defaultPackageCharges(option.category) : undefined,
      priceState: "unpriced",
    };
    setDays((current) => current.map((day) => day.id === pickerDayId ? { ...day, plannedBlockCount: Math.max(day.plannedBlockCount ?? 1, day.services.length + 1), services: [...day.services, service] } : day));
    setPickerDayId(null);
    setCategory(null);
    setQuery("");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const finalDays = days.map((day, index) => ({ ...day, title: day.place.trim() || `Day ${index + 1} plan`, plannedBlockCount: day.services.length }));
    if (!name.trim() || !destination.trim()) { setError("Add a package name and destination."); return; }
    if (!finalDays.some((day) => day.services.length)) { setError("Add at least one service block to the itinerary."); setPhase("itinerary"); return; }
    onSave({ name: name.trim(), destination: destination.trim(), region: region.trim() || "Other", days: finalDays, overview: overview.trim(), inclusions: inclusions.trim(), exclusions: exclusions.trim(), startingPrice: price ? Math.max(0, Number(price) || 0) : undefined, markupPercent: Math.max(0, Number(markup) || 0), priceBasis, image: source?.image ?? "" });
  };

  return <form className={`package-composer package-composer--${phase}`} onSubmit={submit} noValidate>
    {phase !== "itinerary" ? <header className="package-composer__head"><div><span className="package-composer__eyebrow">{phase === "details" ? "STEP 01 / START" : "STEP 03 / FINISH"}</span><h1>{phase === "details" ? existing ? "Edit package details" : "Start your package" : "Content & pricing"}</h1><p>{phase === "details" ? "Name the trip and choose its destination. The itinerary workspace comes next." : "Review service costing, then set your catalogue price."}</p></div>{phase === "content" ? <span className="package-composer__summary">{days.length} days · {blockCount} {blockCount === 1 ? "service" : "services"} added</span> : null}</header> : null}
    <nav className="package-composer__stages" aria-label="Package builder steps">{(["details", "itinerary", "content"] as const).map((stage, index) => <button type="button" key={stage} className={phase === stage ? "is-active" : ""} onClick={() => { setPhase(stage); setError(""); }}><span>{index + 1}</span>{stage === "details" ? "Basic details" : stage === "itinerary" ? "Build itinerary" : "Content & pricing"}</button>)}</nav>
    {error && <p className="package-composer__error" role="alert">{error}</p>}

    {phase === "details" ? <>
    <section className="package-composer__section" aria-labelledby="package-identity-title"><div className="package-composer__section-label"><span><Icon name="package" size="sm" /></span><div><h2 id="package-identity-title">Package details</h2><p>Name the reusable trip and where it goes.</p></div></div><div className="package-composer__section-content"><div className="package-composer__grid"><label><span>Package name *</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Bali family discovery" /></label><label><span>Destination *</span><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="e.g. Bali, Indonesia" /></label><label><span>Region</span><input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="e.g. Southeast Asia" /></label></div></div></section>

    </> : null}
    {phase === "itinerary" ? <section className="package-composer__section package-composer__section--itinerary" aria-label="Build itinerary"><div className="package-composer__section-content">
      <div className="package-composer__itinerary-toolbar"><div><strong>{days.length} {days.length === 1 ? "day" : "days"}</strong><span>{blockCount} {blockCount === 1 ? "service" : "services"} added</span></div><Button type="button" variant="ghost" size="sm" leadingIcon={<Icon name="plus" size="sm" />} disabled={days.length >= 30} onClick={() => { setDays((current) => [...current, makeDay(current.length + 1)]); setError(""); }}>Add day</Button></div>
      <div className="package-composer__days">{days.map((day, index) => <article className="package-composer__day" key={day.id}>
        <div className="package-composer__day-rail"><span className="package-composer__day-number">{String(index + 1).padStart(2, "0")}</span><h3>Day {index + 1}</h3><small>{day.services.length} {day.services.length === 1 ? "service" : "services"}</small><button type="button" disabled={days.length === 1} onClick={() => { setDays((current) => current.filter((item) => item.id !== day.id)); setError(""); }} aria-label={`Remove day ${index + 1}`}><Icon name="clear" size="xs" /> Remove day</button></div>
        <div className="package-composer__day-main"><label className="package-composer__place-field"><span>Place or city <em>Optional</em></span><input value={day.place} onChange={(event) => setDays((current) => current.map((item) => item.id === day.id ? { ...item, place: event.target.value } : item))} placeholder="e.g. Ubud, Bali" /></label>
          <div className="package-composer__blocks">{day.services.length ? day.services.map((service) => <div className="package-composer__block" key={service.id}><span className="package-composer__block-icon">{service.image ? <img src={service.image} alt="" /> : <Icon name={icons[(service.serviceCategory as PackageServiceCategory) || "Other"] ?? "package"} size="sm" />}</span><div><small>{service.serviceCategory ?? "Service"}</small><strong>{service.title}</strong>{service.vendor ? <em>{service.vendor}</em> : null}</div><button type="button" aria-label={`Remove ${service.title} from day ${index + 1}`} onClick={() => setDays((current) => current.map((item) => item.id === day.id ? { ...item, services: item.services.filter((block) => block.id !== service.id) } : item))}><Icon name="clear" size="sm" /></button></div>) : <p className="package-composer__day-empty">No services added to this day yet.</p>}</div>
          <button type="button" className="package-composer__add-block" onClick={() => { setPickerDayId(day.id); setCategory(null); setQuery(""); }}><Icon name="plus" size="sm" /><span>Add service block</span></button>
        </div>
      </article>)}</div>
    </div></section> : null}

    {phase === "content" ? <>
      <PackagePricing days={days} setDays={setDays} markup={markup} setMarkup={setMarkup} price={price} setPrice={setPrice} priceBasis={priceBasis} setPriceBasis={setPriceBasis} />
      <section className="package-composer__section package-composer__section--content" aria-labelledby="package-content-title"><div className="package-composer__section-label"><span><Icon name="fileText" size="sm" /></span><div><h2 id="package-content-title">Package content</h2><p>Reusable copy for your catalogue and proposals.</p></div></div><div className="package-composer__section-content"><div className="package-composer__grid"><label className="package-composer__wide"><span>Overview</span><textarea value={overview} onChange={(event) => setOverview(event.target.value)} rows={3} placeholder="A short description of the trip" /></label><label><span>Inclusions</span><textarea value={inclusions} onChange={(event) => setInclusions(event.target.value)} rows={3} placeholder="What is included" /></label><label><span>Exclusions</span><textarea value={exclusions} onChange={(event) => setExclusions(event.target.value)} rows={3} placeholder="What is not included" /></label></div></div></section>
    </> : null}

    <footer className="package-composer__footer"><Button type="button" variant="ghost" size="sm" onClick={phase === "details" ? onCancel : () => setPhase(phase === "content" ? "itinerary" : "details")}>{phase === "details" ? "Cancel" : "Back"}</Button>{phase === "content" ? <Button type="submit" variant="primary" size="sm">{existing ? "Save package" : "Create draft package"}</Button> : <Button type="button" variant="primary" size="sm" onClick={(event) => { event.preventDefault(); if (phase === "details" && (!name.trim() || !destination.trim())) { setError("Add a package name and destination before building the itinerary."); return; } setError(""); setPhase(phase === "details" ? "itinerary" : "content"); }}>{phase === "details" ? "Continue to itinerary" : "Continue"}</Button>}</footer>

    <Modal open={Boolean(pickerDayId)} onClose={() => { setPickerDayId(null); setCategory(null); }} title={category ? `Add ${blockLabels[category]} block` : "Choose a block type"} eyebrow={`Day ${days.findIndex((day) => day.id === pickerDayId) + 1}`} size="wide" className="package-composer__picker" footer={<><Button variant="ghost" size="sm" onClick={() => category ? setCategory(null) : setPickerDayId(null)}>{category ? "Back to block types" : "Cancel"}</Button></>}>
      {!category ? <div className="package-composer__picker-types"><div className="package-composer__picker-intro"><strong>What happens on this day?</strong><p>Choose the kind of service first. You can add more than one block to any day.</p></div><div className="package-composer__picker-type-grid">{packageServiceCategories.map((item) => <button key={item} type="button" onClick={() => { setCategory(item); setQuery(""); }}><span><Icon name={icons[item]} size="md" /></span><strong>{item}</strong><small>{item === "Accommodation" ? "Hotels and stays" : item === "Transport" ? "Cars and transfers" : item === "Activities" ? "Experiences and visits" : item === "Visa" ? "Travel documents" : item === "Flights" ? "Air travel" : "Other services"}</small><Icon name="chevronRight" size="sm" /></button>)}</div></div> : <div className="package-composer__picker-service-step"><div className="package-composer__picker-intro"><strong>Find {category === "Activities" ? "an" : "a"} {blockLabels[category]} service</strong><p>Search by service name, vendor, or place. All available matches appear together.</p></div><label className="package-composer__picker-search"><span className="visually-hidden">Search {blockLabels[category]} services</span><Icon name="search" size="sm" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${blockLabels[category]} services`} /></label><div className="package-composer__picker-results">{visibleOptions.length ? visibleOptions.map((option) => <button type="button" key={`${option.source}-${option.id}`} onClick={() => addOption(option)}><span className="package-composer__result-icon">{option.image ? <img src={option.image} alt="" /> : <Icon name={icons[option.category]} size="sm" />}</span><span><strong>{option.name}</strong><small>{option.location}{option.vendor ? ` · ${option.vendor}` : ""}</small><em>{option.description}</em></span><Icon name="plus" size="sm" /></button>) : <p>No matching services. Try another name or place.</p>}{apiLoading ? <p>Finding more services…</p> : null}{apiError ? <p role="status">{apiError}</p> : null}</div></div>}
    </Modal>
  </form>;
}
