import { useMemo, useState } from "react";
import { Button, DetailPage, Icon, Modal, StatusChip } from "@paryatech/ui";
import type { IconName } from "@paryatech/ui";
import type { PackageRecord } from "./App";
import { packageDaysForProposal } from "./PackageDetail";
import type { ItineraryMode, ProposalDay, ProposalQueryContext, ProposalRecord, ProposalService, ProposalServiceKind, ProposalStatus, ServicePriceState, ServiceSupplement } from "./proposalModel";
import { formatProposalTravel, itineraryCosting, servicePriceState, serviceQuantity, serviceTotalCost } from "./proposalModel";
import "./TripComposer.css";

export type TripDraft = {
  itineraryMode: ItineraryMode;
  name: string;
  destination: string;
  region: string;
  startDate: string;
  endDate: string;
  customer: string;
  customerEmail: string;
  adults: string;
  children: string;
  requirements: string;
  note: string;
  price: number | undefined;
  image: string;
  days: ProposalDay[];
  source: PackageRecord | null;
  priceBasis: string;
  departureType: "flexible" | "fixed";
  inclusions: string;
  exclusions: string;
  importantNotes: string;
  paymentTerms: string;
  cancellationPolicy: string;
  otherTerms: string;
  markupPercent: number;
  sharingMode: "itinerary" | "priced";
};

type Mode = "package" | "proposal";

type Props = {
  mode: Mode;
  packages?: PackageRecord[];
  initialPackage?: PackageRecord | null;
  existingPackage?: PackageRecord | null;
  existing?: ProposalRecord | null;
  queryContext?: ProposalQueryContext | null;
  onCancel: () => void;
  onSave: (draft: TripDraft, status: ProposalStatus) => void;
};

type Supplier = {
  kind: ProposalServiceKind;
  name: string;
  vendor: string;
  location: string;
  detail: string;
  cost: number;
};

const serviceTypes: Array<{ kind: ProposalServiceKind; label: string; icon: IconName; hint: string }> = [
  { kind: "stay", label: "Accommodation", icon: "hotel", hint: "Hotels, rooms and nights" },
  { kind: "transfer", label: "Transport", icon: "bus", hint: "Cars, trains, boats and transfers" },
  { kind: "activity", label: "Activity", icon: "camera", hint: "Experiences and guided visits" },
  { kind: "flight", label: "Flight", icon: "plane", hint: "Routes and flight preferences" },
  { kind: "meal", label: "Meal", icon: "sun", hint: "Included dining" },
  { kind: "other", label: "Other service", icon: "package", hint: "Guides, visas and more" },
];

const sampleSupply: Supplier[] = [
  { kind: "stay", name: "Teras Ubud Resort", vendor: "Direct hotel contract", location: "Ubud, Bali", detail: "Deluxe room · breakfast included · flexible check-in on request", cost: 6400 },
  { kind: "stay", name: "Ubud Valley Retreat", vendor: "Bali Beds & Stays", location: "Ubud, Bali", detail: "Garden room · breakfast included", cost: 7100 },
  { kind: "stay", name: "Munnar Hills Retreat", vendor: "Hill Country Stays", location: "Munnar, Kerala", detail: "Valley-view room · breakfast included", cost: 5800 },
  { kind: "stay", name: "Samode Haveli Jaipur", vendor: "Heritage Hotels India", location: "Jaipur, Rajasthan", detail: "Heritage room · breakfast included", cost: 9200 },
  { kind: "stay", name: "Vida Downtown", vendor: "Dubai City Hotels", location: "Dubai, UAE", detail: "City-view room · breakfast included", cost: 11000 },
  { kind: "transfer", name: "Private airport pickup", vendor: "Bali Ground Co.", location: "Denpasar, Bali", detail: "Private SUV · flight-tracked pickup · 4 seats", cost: 2800 },
  { kind: "transfer", name: "Ubud to Seminyak transfer", vendor: "Island Wheels", location: "Bali, Indonesia", detail: "Private SUV · point-to-point · luggage included", cost: 2200 },
  { kind: "transfer", name: "Kochi to Munnar car", vendor: "Kerala Ground Services", location: "Kerala, India", detail: "Private car · hotel pickup · comfort stops", cost: 6800 },
  { kind: "transfer", name: "Dubai private city car", vendor: "Desert Drive", location: "Dubai, UAE", detail: "Private vehicle · 8-hour service", cost: 8200 },
  { kind: "activity", name: "Ubud temples and rice terraces", vendor: "Bali Heritage Experiences", location: "Ubud, Bali", detail: "Private guide · 8 hours · hotel pickup", cost: 8200 },
  { kind: "activity", name: "Nusa Penida island day", vendor: "Island Day Co.", location: "Bali, Indonesia", detail: "Full-day island experience · boat and road transfers", cost: 9800 },
  { kind: "activity", name: "Munnar tea-country trail", vendor: "Kerala Trails", location: "Munnar, Kerala", detail: "Guided walk · tea estate visit", cost: 4200 },
  { kind: "activity", name: "Dubai desert evening", vendor: "Desert Heritage Experiences", location: "Dubai, UAE", detail: "Dune drive · dinner · return transfer", cost: 6900 },
  { kind: "flight", name: "New Delhi to Denpasar", vendor: "Flight supply", location: "Delhi → Bali", detail: "Economy preference · checked baggage · schedule to confirm", cost: 21000 },
  { kind: "flight", name: "Dubai return flights", vendor: "Flight supply", location: "India → Dubai", detail: "Economy preference · schedule to confirm", cost: 18500 },
  { kind: "meal", name: "Breakfast at the hotel", vendor: "Included with accommodation", location: "At the stay", detail: "Breakfast included with room", cost: 0 },
  { kind: "meal", name: "Welcome dinner", vendor: "Hujan Locale", location: "Ubud, Bali", detail: "Set menu · vegetarian options", cost: 2100 },
];

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const makeDay = (index: number, place = ""): ProposalDay => ({ id: `day-${Date.now()}-${index}`, title: index === 1 ? "Arrival day" : `Day ${index} plan`, place, services: [] });
const cloneDays = (days: ProposalDay[]) => days.map((day) => ({ ...day, highlights: [...(day.highlights ?? [])], services: day.services.map((service) => ({ ...service, supplements: service.supplements?.map((item) => ({ ...item })) })) }));

export function TripComposer({ mode, packages = [], initialPackage, existingPackage, existing, queryContext, onCancel, onSave }: Props) {
  const isProposal = mode === "proposal";
  const [step, setStep] = useState(0);
  const [itineraryMode, setItineraryMode] = useState<ItineraryMode>(isProposal ? existing?.itineraryMode ?? (initialPackage ? "advanced" : "simple") : "advanced");
  const [creationChoice, setCreationChoice] = useState<"choose" | "ready">(isProposal && !existing && !initialPackage ? "choose" : "ready");
  const [source, setSource] = useState<PackageRecord | null>(initialPackage ?? packages.find((item) => item.id === existing?.sourcePackageId) ?? null);
  const [name, setName] = useState(existing?.name ?? existingPackage?.name ?? (initialPackage && isProposal ? `${initialPackage.destination.split(",")[0]} trip` : queryContext?.customer && queryContext.destination ? `${queryContext.customer} · ${queryContext.destination.split(",")[0]}` : ""));
  const [destination, setDestination] = useState(existing?.destination ?? existingPackage?.destination ?? initialPackage?.destination ?? queryContext?.destination ?? "");
  const [region, setRegion] = useState(existing?.region ?? existingPackage?.region ?? initialPackage?.region ?? queryContext?.region ?? "");
  const [startDate, setStartDate] = useState(existing?.travelStart ?? existingPackage?.fixedStart ?? (initialPackage?.departureType === "fixed" ? initialPackage.fixedStart ?? "" : queryContext?.travelStart ?? ""));
  const [endDate, setEndDate] = useState(existing?.travelEnd ?? existingPackage?.fixedEnd ?? (initialPackage?.departureType === "fixed" ? initialPackage.fixedEnd ?? "" : queryContext?.travelEnd ?? ""));
  const [customer, setCustomer] = useState(existing?.customer ?? queryContext?.customer ?? "");
  const [customerEmail, setCustomerEmail] = useState(existing?.customerEmail ?? queryContext?.customerEmail ?? "");
  const [adults, setAdults] = useState(existing?.travellers.match(/\d+ adult/)?.[0].split(" ")[0] ?? String(queryContext?.adults ?? 2));
  const [children, setChildren] = useState(existing?.travellers.match(/\d+ child/)?.[0].split(" ")[0] ?? String(queryContext?.children ?? 0));
  const [requirements, setRequirements] = useState(existing?.requirements ?? queryContext?.requirements ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [inclusions, setInclusions] = useState(existing?.inclusions ?? existingPackage?.inclusions ?? initialPackage?.inclusions ?? "");
  const [exclusions, setExclusions] = useState(existing?.exclusions ?? existingPackage?.exclusions ?? initialPackage?.exclusions ?? "");
  const [importantNotes, setImportantNotes] = useState(existing?.importantNotes ?? existingPackage?.importantNotes ?? initialPackage?.importantNotes ?? "");
  const [paymentTerms, setPaymentTerms] = useState(existing?.paymentTerms ?? existingPackage?.paymentTerms ?? initialPackage?.paymentTerms ?? "");
  const [cancellationPolicy, setCancellationPolicy] = useState(existing?.cancellationPolicy ?? existingPackage?.cancellationPolicy ?? initialPackage?.cancellationPolicy ?? "");
  const [otherTerms, setOtherTerms] = useState(existing?.otherTerms ?? existingPackage?.otherTerms ?? initialPackage?.otherTerms ?? "");
  const [priceBasis, setPriceBasis] = useState(existingPackage?.priceBasis ?? initialPackage?.priceBasis ?? "Per adult, twin sharing");
  const [departureType, setDepartureType] = useState<"flexible" | "fixed">(existingPackage?.departureType ?? "flexible");
  const [markupPercent, setMarkupPercent] = useState(String(existing?.markupPercent ?? existingPackage?.markupPercent ?? initialPackage?.markupPercent ?? 9));
  const [sharingMode, setSharingMode] = useState<"itinerary" | "priced">(existing?.sharingMode ?? "priced");
  const [price, setPrice] = useState(existing?.value ? String(existing.value) : existingPackage?.startingPrice ? String(existingPackage.startingPrice) : "");
  const [coverImage, setCoverImage] = useState(existing?.coverImage ?? existingPackage?.image ?? initialPackage?.image ?? "");
  const [days, setDays] = useState<ProposalDay[]>(() => existing ? cloneDays(existing.days) : existingPackage ? packageDaysForProposal(existingPackage) : initialPackage ? packageDaysForProposal(initialPackage) : [makeDay(1)]);
  const [activeDayId, setActiveDayId] = useState(() => days[0]?.id ?? "");
  const [blockOpen, setBlockOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [blockKind, setBlockKind] = useState<ProposalServiceKind>("stay");
  const [blockTitle, setBlockTitle] = useState("");
  const [blockDetail, setBlockDetail] = useState("");
  const [blockVendor, setBlockVendor] = useState("");
  const [blockCost, setBlockCost] = useState("");
  const [blockPriceState, setBlockPriceState] = useState<ServicePriceState>("unpriced");
  const [blockQuantity, setBlockQuantity] = useState("1");
  const [blockUnit, setBlockUnit] = useState("service");
  const [blockOptional, setBlockOptional] = useState(false);
  const [blockRooms, setBlockRooms] = useState("1");
  const [blockNights, setBlockNights] = useState("1");
  const [blockMealPlan, setBlockMealPlan] = useState("Breakfast included");
  const [blockRouteFrom, setBlockRouteFrom] = useState("");
  const [blockRouteTo, setBlockRouteTo] = useState("");
  const [blockVehicleType, setBlockVehicleType] = useState("");
  const [blockCapacity, setBlockCapacity] = useState("4");
  const [blockDriverIncluded, setBlockDriverIncluded] = useState(true);
  const [blockGuideCost, setBlockGuideCost] = useState("");
  const [blockAdmissionCost, setBlockAdmissionCost] = useState("");
  const [blockParticipants, setBlockParticipants] = useState("2");
  const [adultSupplement, setAdultSupplement] = useState("");
  const [adultSupplementQty, setAdultSupplementQty] = useState("0");
  const [childSupplement, setChildSupplement] = useState("");
  const [childSupplementQty, setChildSupplementQty] = useState("0");
  const [supplierQuery, setSupplierQuery] = useState("");
  const [packagePickerOpen, setPackagePickerOpen] = useState(false);
  const [packageQuery, setPackageQuery] = useState("");
  const [pendingPackage, setPendingPackage] = useState<PackageRecord | null>(null);
  const [error, setError] = useState("");

  const activeDay = days.find((day) => day.id === activeDayId) ?? days[0];
  const activeIndex = days.findIndex((day) => day.id === activeDay?.id);
  const blockCount = days.reduce((sum, day) => sum + day.services.length, 0);
  const costing = itineraryCosting(days);
  const suggestedPrice = Math.round(costing.baseCost * (1 + Math.max(0, Number(markupPercent) || 0) / 100));
  const plannedDays = days.filter((day) => Boolean(day.description?.trim() || day.highlights?.some((item) => item.trim()))).length;
  const suppliers = useMemo(() => sampleSupply.filter((entry) => entry.kind === blockKind && `${entry.name} ${entry.vendor} ${entry.location}`.toLowerCase().includes(supplierQuery.toLowerCase())), [blockKind, supplierQuery]);
  const packageMatches = useMemo(() => packages.filter((item) => `${item.name} ${item.destination}`.toLowerCase().includes(packageQuery.toLowerCase())), [packages, packageQuery]);

  const updateDay = (id: string, patch: Partial<ProposalDay>) => setDays((current) => current.map((day) => day.id === id ? { ...day, ...patch } : day));
  const addDay = () => {
    const next = makeDay(days.length + 1, destination.split(",")[0]);
    setDays((current) => [...current, next]);
    setActiveDayId(next.id);
  };
  const moveDay = (direction: -1 | 1) => {
    const nextIndex = activeIndex + direction;
    if (nextIndex < 0 || nextIndex >= days.length) return;
    setDays((current) => {
      const next = [...current];
      [next[activeIndex], next[nextIndex]] = [next[nextIndex], next[activeIndex]];
      return next;
    });
  };
  const removeDay = () => {
    if (days.length <= 1) return;
    const next = days.filter((day) => day.id !== activeDay.id);
    setDays(next);
    setActiveDayId(next[Math.max(0, activeIndex - 1)].id);
  };
  const openBlock = (service?: ProposalService) => {
    setEditingId(service?.id ?? null);
    setBlockKind(service?.kind ?? "stay");
    setBlockTitle(service?.title ?? "");
    setBlockDetail(service?.detail ?? "");
    setBlockVendor(service?.vendor ?? "");
    setBlockCost(service?.cost == null ? "" : String(service.cost));
    setBlockPriceState(service ? servicePriceState(service) : "unpriced");
    setBlockQuantity(String(service?.quantity ?? 1));
    setBlockUnit(service?.unit ?? (service?.kind === "activity" ? "person" : service?.kind === "transfer" ? "vehicle" : "service"));
    setBlockOptional(Boolean(service?.optional));
    setBlockRooms(String(service?.rooms ?? 1));
    setBlockNights(String(service?.nights ?? 1));
    setBlockMealPlan(service?.mealPlan ?? "Breakfast included");
    setBlockRouteFrom(service?.routeFrom ?? "");
    setBlockRouteTo(service?.routeTo ?? "");
    setBlockVehicleType(service?.vehicleType ?? "");
    setBlockCapacity(String(service?.vehicleCapacity ?? 4));
    setBlockDriverIncluded(service?.driverIncluded ?? true);
    setBlockGuideCost(service?.guideCost == null ? "" : String(service.guideCost));
    setBlockAdmissionCost(service?.admissionCost == null ? "" : String(service.admissionCost));
    setBlockParticipants(String(service?.participants ?? 2));
    const adult = service?.supplements?.find((item) => item.label === "Extra adult");
    const child = service?.supplements?.find((item) => item.label === "Child with bed");
    setAdultSupplement(adult ? String(adult.unitCost) : "");
    setAdultSupplementQty(String(adult?.quantity ?? 0));
    setChildSupplement(child ? String(child.unitCost) : "");
    setChildSupplementQty(String(child?.quantity ?? 0));
    setSupplierQuery("");
    setBlockOpen(true);
  };
  const openBlockForDay = (dayId: string, service?: ProposalService) => {
    setActiveDayId(dayId);
    openBlock(service);
  };
  const saveBlock = () => {
    if (!blockTitle.trim()) return;
    const effectivePriceState: ServicePriceState = blockKind === "activity" && (Number(blockGuideCost) > 0 || Number(blockAdmissionCost) > 0) && blockPriceState === "unpriced" ? "priced" : blockPriceState;
    const supplements: ServiceSupplement[] = blockKind === "stay" ? [
      { label: "Extra adult", quantity: Math.max(0, Number(adultSupplementQty) || 0), unitCost: Math.max(0, Number(adultSupplement) || 0) },
      { label: "Child with bed", quantity: Math.max(0, Number(childSupplementQty) || 0), unitCost: Math.max(0, Number(childSupplement) || 0) },
    ].filter((item) => item.quantity > 0) : [];
    const service: ProposalService = {
      id: editingId ?? `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      kind: blockKind,
      title: blockTitle.trim(),
      detail: blockDetail.trim(),
      vendor: blockVendor.trim() || undefined,
      cost: effectivePriceState === "unpriced" ? undefined : effectivePriceState === "included" ? 0 : Math.max(0, Number(blockCost) || 0),
      priceState: effectivePriceState,
      quantity: Math.max(1, Number(blockQuantity) || 1),
      unit: blockUnit.trim() || "service",
      optional: blockOptional,
      rooms: blockKind === "stay" ? Math.max(1, Number(blockRooms) || 1) : undefined,
      nights: blockKind === "stay" ? Math.max(1, Number(blockNights) || 1) : undefined,
      mealPlan: blockKind === "stay" ? blockMealPlan.trim() : undefined,
      supplements,
      routeFrom: blockKind === "transfer" ? blockRouteFrom.trim() : undefined,
      routeTo: blockKind === "transfer" ? blockRouteTo.trim() : undefined,
      vehicleType: blockKind === "transfer" ? blockVehicleType.trim() : undefined,
      vehicleCapacity: blockKind === "transfer" ? Math.max(1, Number(blockCapacity) || 1) : undefined,
      driverIncluded: blockKind === "transfer" ? blockDriverIncluded : undefined,
      guideCost: blockKind === "activity" ? Math.max(0, Number(blockGuideCost) || 0) : undefined,
      admissionCost: blockKind === "activity" ? Math.max(0, Number(blockAdmissionCost) || 0) : undefined,
      participants: blockKind === "activity" ? Math.max(1, Number(blockParticipants) || 1) : undefined,
    };
    setDays((current) => current.map((day) => day.id === activeDay.id ? {
      ...day,
      services: editingId ? day.services.map((item) => item.id === editingId ? service : item) : [...day.services, service],
    } : day));
    setBlockOpen(false);
    setError("");
  };
  const moveBlock = (id: string, direction: -1 | 1) => setDays((current) => current.map((day) => {
    if (day.id !== activeDay.id) return day;
    const next = [...day.services];
    const index = next.findIndex((item) => item.id === id);
    if (index < 0 || index + direction < 0 || index + direction >= next.length) return day;
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    return { ...day, services: next };
  }));
  const applyPackage = (item: PackageRecord) => {
    const copied = packageDaysForProposal(item);
    setSource(item);
    setItineraryMode("advanced");
    setDays(copied);
    setActiveDayId(copied[0]?.id ?? "");
    setDestination(item.destination);
    setRegion(item.region);
    if (item.departureType === "fixed") { setStartDate(item.fixedStart ?? ""); setEndDate(item.fixedEnd ?? ""); }
    setCoverImage(item.image);
    setInclusions(item.inclusions ?? "");
    setExclusions(item.exclusions ?? "");
    setImportantNotes(item.importantNotes ?? "");
    setPaymentTerms(item.paymentTerms ?? "");
    setCancellationPolicy(item.cancellationPolicy ?? "");
    setOtherTerms(item.otherTerms ?? "");
    setMarkupPercent(String(item.markupPercent ?? 9));
    setCreationChoice("ready");
    if (!name.trim()) setName(`${item.destination.split(",")[0]} trip`);
    setPackagePickerOpen(false);
    setPendingPackage(null);
    setError("");
  };
  const choosePackage = (item: PackageRecord) => {
    if (plannedDays && source?.id !== item.id) setPendingPackage(item);
    else applyPackage(item);
  };
  const save = (status: ProposalStatus) => {
    if (!name.trim() || !destination.trim()) { setError("Add a trip name and destination before saving."); return; }
    if (!isProposal && departureType === "fixed" && (!startDate || !endDate)) { setError("A fixed-departure package needs both departure dates."); setStep(0); return; }
    if (isProposal && !customer.trim()) { setError("Add the customer name before saving the proposal."); return; }
    if (isProposal && status !== "Draft" && !customerEmail.trim()) { setError("Add the customer email before sharing this proposal."); setStep(0); return; }
    if ((isProposal || departureType === "fixed") && (Boolean(startDate) !== Boolean(endDate) || (startDate && endDate < startDate))) { setError("Add both travel dates in the correct order, or leave both open."); setStep(0); return; }
    if (status !== "Draft" && plannedDays !== days.length) { setError("Describe the purpose of every day before sharing. Arrival, leisure and transfer days can be planned without an activity."); setStep(0); return; }
    if (isProposal && status === "Sent" && (!Number(price) || Number(price) <= 0)) { setError("Add a customer quote, or share the itinerary without pricing."); setStep(2); return; }
    setError("");
    onSave({ itineraryMode: isProposal ? itineraryMode : "advanced", name: name.trim(), destination: destination.trim(), region: region.trim() || "Other", startDate: isProposal || departureType === "fixed" ? startDate : "", endDate: isProposal || departureType === "fixed" ? endDate : "", customer: isProposal ? customer.trim() : "", customerEmail: isProposal ? customerEmail.trim() : "", adults, children, requirements: requirements.trim(), note: note.trim(), price: price ? Number(price) : undefined, image: coverImage, days: cloneDays(days), source, priceBasis, departureType, inclusions, exclusions, importantNotes, paymentTerms, cancellationPolicy, otherTerms, markupPercent: Math.max(0, Number(markupPercent) || 0), sharingMode: status === "Itinerary shared" ? "itinerary" : status === "Sent" ? "priced" : sharingMode }, status);
  };

  return <DetailPage
    className={`trip-composer trip-composer--${mode}`}
    title={existing || existingPackage ? `Edit ${mode}` : `New ${mode}`}
    status={<StatusChip tone="progress">{existing?.status ?? "Draft"}</StatusChip>}
    meta={<span className="trip-composer__meta"><Icon name={isProposal ? "user" : "package"} size="sm" />{isProposal && creationChoice === "choose" ? "Choose a proposal template" : isProposal ? `${itineraryMode === "simple" ? "Simple" : "Advanced"} itinerary · Customer offer` : "Advanced itinerary · Reusable package"}</span>}
    actions={<div className="trip-composer__top-actions"><Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button></div>}
  >
    <div className="trip-composer__content">
      {creationChoice === "choose" ? <section className="trip-composer__template-choice" aria-labelledby="proposal-template-title"><header><h1 id="proposal-template-title">Choose an itinerary template</h1><p>The proposal uses one fixed template throughout. Choose how much day-by-day detail this customer needs.</p></header><div className="trip-composer__template-options" role="radiogroup" aria-label="Proposal itinerary template"><button type="button" role="radio" aria-checked={itineraryMode === "simple"} className={itineraryMode === "simple" ? "is-selected" : ""} onClick={() => setItineraryMode("simple")}><span className="trip-composer__template-mark" aria-hidden="true" /><span><strong>Simple itinerary</strong><small>A clear written plan: destination, day descriptions and highlights. Service costs stay in Costing; no day images or service blocks in the itinerary.</small></span></button><button type="button" role="radio" aria-checked={itineraryMode === "advanced"} className={itineraryMode === "advanced" ? "is-selected" : ""} onClick={() => setItineraryMode("advanced")}><span className="trip-composer__template-mark" aria-hidden="true" /><span><strong>Advanced itinerary</strong><small>The same detailed day builder as a package: accommodation, transport, activities, flights and optional day images.</small></span></button></div><footer><span>Template structure stays fixed after you begin. A package always uses Advanced.</span><Button variant="primary" size="sm" onClick={() => setCreationChoice("ready")}>Continue with {itineraryMode === "simple" ? "Simple" : "Advanced"}</Button></footer></section> : null}
      {creationChoice === "ready" ? <>
      <nav className="trip-composer__steps" aria-label="Builder steps">{["Build itinerary", "Content & policies", "Costing", "Preview"].map((label, index) => <button key={label} type="button" className={step === index ? "is-active" : ""} aria-current={step === index ? "step" : undefined} onClick={() => { setStep(index); setError(""); }}><span>{index + 1}</span>{label}</button>)}</nav>
      {step === 0 ? <>
      <div className="trip-composer__build-header"><div><h2>Trip setup</h2><p>{isProposal ? "Customer details and dates for this proposal." : "A reusable route with relative days; add fixed dates only for a departure."}</p></div><span>{days.length} {days.length === 1 ? "day" : "days"} · {plannedDays} planned</span></div>
      {isProposal ? <section className="trip-composer__customer-fields" aria-label="Customer details"><div><strong>Customer</strong><span>{queryContext ? `From Query ${queryContext.id}` : "Independent proposal"}</span></div><Field label="Customer name" value={customer} onChange={setCustomer} placeholder="Who is this for?" /><Field label="Email" type="email" value={customerEmail} onChange={setCustomerEmail} placeholder="customer@example.com" /><Field label="Adults" type="number" value={adults} onChange={setAdults} /><Field label="Children" type="number" value={children} onChange={setChildren} /><details className="trip-composer__brief"><summary>Customer brief</summary><Field label="Requirements" value={requirements} onChange={setRequirements} multiline placeholder="Pace, rooms and must-see places" /></details></section> : null}

      <section className="trip-composer__setup" aria-label="Trip details">
        <Field label={isProposal ? "Proposal name" : "Package name"} value={name} onChange={setName} placeholder={isProposal ? "e.g. Mehta family Bali" : "e.g. Bali family discovery"} wide />
        <Field label="Destination" value={destination} onChange={setDestination} placeholder="e.g. Bali, Indonesia" />
        <Field label="Region" value={region} onChange={setRegion} placeholder="e.g. Southeast Asia" />
        {isProposal || departureType === "fixed" ? <><Field label={isProposal ? "Travel starts" : "Departure starts"} value={startDate} onChange={setStartDate} type="date" /><Field label={isProposal ? "Travel ends" : "Departure ends"} value={endDate} onChange={setEndDate} type="date" /></> : null}
      </section>
      {!isProposal ? <div className="trip-composer__departure"><span>Departure</span><button type="button" className={departureType === "flexible" ? "is-active" : ""} onClick={() => setDepartureType("flexible")}>Flexible dates</button><button type="button" className={departureType === "fixed" ? "is-active" : ""} onClick={() => setDepartureType("fixed")}>Fixed departure</button><small>{departureType === "flexible" ? "Use relative days; customer dates are applied in a proposal." : "Only this departure uses calendar dates."}</small></div> : itineraryMode === "advanced" ? <div className="trip-composer__source-row"><span>{source ? `Based on ${source.name} · ${source.id}` : "Building a custom Advanced itinerary"}</span>{!existing ? <Button variant="ghost" size="sm" onClick={() => setPackagePickerOpen(true)}>{source ? "Change package" : "Start from a package"}</Button> : null}</div> : null}

      <div className="trip-composer__workspace">
        <nav className="trip-composer__day-nav" aria-label="Itinerary days">
          <div className="trip-composer__rail-heading"><strong>Itinerary</strong><span>{days.length} {days.length === 1 ? "day" : "days"}</span></div>
          <div className="trip-composer__day-links">{days.map((day, index) => <button key={day.id} type="button" className={day.id === activeDay.id ? "is-active" : ""} aria-current={day.id === activeDay.id ? "step" : undefined} onClick={() => setActiveDayId(day.id)}><span>Day {index + 1}</span><strong>{day.title || "Untitled day"}</strong><small>{day.description?.trim() || day.highlights?.some((item) => item.trim()) ? "Planned" : "Needs a plan"}</small></button>)}</div>
          <Button variant="ghost" size="sm" leadingIcon={<Icon name="plus" size="sm" />} onClick={addDay}>Add day</Button>
        </nav>

        <main className="trip-composer__canvas">
          <div className="trip-composer__day-head"><div><span>Day {activeIndex + 1} of {days.length}</span><h2>{activeDay.title || "Untitled day"}</h2><p>{activeDay.place || destination || "Set a place for this day"}</p></div><div className="trip-composer__day-actions"><button type="button" onClick={() => moveDay(-1)} disabled={activeIndex === 0} aria-label="Move day earlier"><Icon name="chevronUp" size="sm" /></button><button type="button" onClick={() => moveDay(1)} disabled={activeIndex === days.length - 1} aria-label="Move day later"><Icon name="chevronDown" size="sm" /></button><button type="button" onClick={removeDay} disabled={days.length === 1} aria-label="Remove day"><Icon name="clear" size="sm" /></button></div></div>
          <div className="trip-composer__day-fields"><Field label="Day title" value={activeDay.title} onChange={(value) => updateDay(activeDay.id, { title: value })} placeholder="What happens this day?" /><Field label="Place" value={activeDay.place} onChange={(value) => updateDay(activeDay.id, { place: value })} placeholder="e.g. Ubud" /><Field label="Day description" value={activeDay.description ?? ""} onChange={(value) => updateDay(activeDay.id, { description: value })} placeholder="Describe arrival, sightseeing, transfer or leisure" multiline wide /><Field label="Activity highlights (one per line)" value={(activeDay.highlights ?? []).join("\n")} onChange={(value) => updateDay(activeDay.id, { highlights: value.split("\n").filter(Boolean) })} placeholder="Optional highlights, not automatically chargeable services" multiline wide /></div>
          {itineraryMode === "advanced" ? <><div className="trip-composer__day-media"><div><strong>Day image</strong><span>Optional image for this detailed itinerary</span></div><CoverPicker image={activeDay.image ?? ""} onChange={(value) => updateDay(activeDay.id, { image: value })} /></div>
          <div className="trip-composer__block-list">{activeDay.services.length ? activeDay.services.map((service, index) => {
            const type = serviceTypes.find((item) => item.kind === service.kind)!;
            return <article className="trip-composer__block" key={service.id}>
              <span className={`trip-composer__block-icon trip-composer__block-icon--${service.kind}`}><Icon name={type.icon} size="sm" /></span>
              <div className="trip-composer__block-body"><span>{type.label}</span><strong>{service.title}</strong>{service.detail ? <p>{service.detail}</p> : null}{service.vendor ? <small><Icon name="vendors" size="xs" />{service.vendor}{service.cost != null ? ` · ${money.format(service.cost)} supplier cost` : ""}</small> : null}</div>
              <div className="trip-composer__block-actions"><button type="button" aria-label={`Move ${service.title} up`} disabled={index === 0} onClick={() => moveBlock(service.id, -1)}><Icon name="chevronUp" size="xs" /></button><button type="button" aria-label={`Move ${service.title} down`} disabled={index === activeDay.services.length - 1} onClick={() => moveBlock(service.id, 1)}><Icon name="chevronDown" size="xs" /></button><button type="button" aria-label={`Edit ${service.title}`} onClick={() => openBlock(service)}><Icon name="edit" size="xs" /></button><button type="button" aria-label={`Remove ${service.title}`} onClick={() => updateDay(activeDay.id, { services: activeDay.services.filter((item) => item.id !== service.id) })}><Icon name="clear" size="xs" /></button></div>
            </article>;
          }) : <div className="trip-composer__empty"><Icon name="package" size="lg" /><strong>No blocks on this day</strong><p>Add accommodation, transport, activities or another service to shape the itinerary.</p></div>}</div>
          <button className="trip-composer__add-block" type="button" onClick={() => openBlock()}><Icon name="plus" size="sm" /><span><strong>Add a block</strong><small>Choose a service type or a vendor from your supply</small></span></button></> : <p className="trip-composer__simple-note">Simple stays text-led. Add chargeable services in Costing; they remain attached to this day.</p>}
        </main>

      </div>
      </> : null}
      {step === 1 ? <section className="trip-composer__editor-section" aria-label="Content and policies"><div className="trip-composer__section-heading"><span>02 / CONTENT</span><h2>Content & policies</h2><p>{isProposal ? "Write this customer’s offer. Changes here do not alter its source package." : "Set reusable package content and policies for future proposals."}</p></div><div className="trip-composer__content-fields"><Field label="Overview / introduction" value={note} onChange={setNote} multiline wide /><Field label="Inclusions" value={inclusions} onChange={setInclusions} multiline /><Field label="Exclusions" value={exclusions} onChange={setExclusions} multiline /><Field label="Important notes" value={importantNotes} onChange={setImportantNotes} multiline /><Field label="Payment terms" value={paymentTerms} onChange={setPaymentTerms} multiline /><Field label="Cancellation policy" value={cancellationPolicy} onChange={setCancellationPolicy} multiline /><Field label="Other terms" value={otherTerms} onChange={setOtherTerms} multiline /></div><div className="trip-composer__cover-row"><div><strong>Trip cover</strong><p>One catalogue or proposal cover; day-level images belong only in Advanced.</p></div><CoverPicker image={coverImage} onChange={setCoverImage} /></div></section> : null}
      {step === 2 ? <section className="trip-composer__editor-section" aria-label="Costing"><div className="trip-composer__section-heading"><span>03 / COSTING</span><h2>Costing</h2><p>The same services used in the itinerary appear here. Descriptive highlights do not create supplier charges.</p></div><div className="trip-composer__costing-summary"><span><small>Included supplier cost</small><strong>{money.format(costing.baseCost)}</strong></span><span><small>Optional extras</small><strong>{money.format(costing.optionalCost)}</strong></span><span><small>Still unpriced</small><strong>{costing.unpricedCount} services</strong></span></div><div className="trip-composer__costing-days">{days.map((day, index) => <section key={day.id}><header><div><span>DAY {index + 1}</span><strong>{day.title}</strong></div><button type="button" onClick={() => openBlockForDay(day.id)}><Icon name="plus" size="sm" /> Add service</button></header>{day.services.length ? day.services.map((service) => <div className="trip-composer__costing-row" key={service.id}><div><strong>{service.title}</strong><small>{serviceTypes.find((type) => type.kind === service.kind)?.label} · {service.kind === "stay" ? `${service.rooms ?? 1} room × ${service.nights ?? 1} night${(service.nights ?? 1) === 1 ? "" : "s"}` : `${serviceQuantity(service)} ${service.unit ?? "service"}${serviceQuantity(service) === 1 ? "" : "s"}`}{service.optional ? " · Optional" : ""}</small>{service.kind === "stay" ? <small>{service.mealPlan || "Meal plan not set"}{service.supplements?.length ? ` · ${service.supplements.map((item) => `${item.label} × ${item.quantity}`).join(", ")}` : ""}</small> : null}</div><span className={servicePriceState(service) === "unpriced" ? "is-unpriced" : ""}>{servicePriceState(service) === "unpriced" ? "Unpriced" : servicePriceState(service) === "included" ? "Included" : money.format(serviceTotalCost(service))}</span><button type="button" onClick={() => openBlockForDay(day.id, service)}>Edit</button></div>) : <p className="trip-composer__no-services">No chargeable services yet. This day may still be intentionally planned.</p>}</section>)}</div><div className="trip-composer__pricing-fields"><Field label="Markup on cost (%)" type="number" value={markupPercent} onChange={setMarkupPercent} /><div><span>Calculated selling basis</span><strong>{money.format(suggestedPrice)}</strong><small>Included supplier cost + markup. Optional extras and unpriced services are excluded.</small></div>{isProposal ? <><Field label="Customer quote (total)" type="number" value={price} onChange={setPrice} placeholder="Leave blank for itinerary-only review" /><button type="button" onClick={() => setPrice(String(suggestedPrice))}>Use calculated amount</button></> : <><Field label="Published starting price" type="number" value={price} onChange={setPrice} placeholder="Optional for draft" /><Field label="Price basis" value={priceBasis} onChange={setPriceBasis} placeholder="e.g. Per adult, twin sharing" /></>}</div></section> : null}
      {step === 3 ? <section className="trip-composer__editor-section trip-composer__preview" aria-label="Preview"><div className="trip-composer__section-heading"><span>04 / PREVIEW</span><h2>Customer-facing preview</h2><p>{isProposal ? "Review this customer's own copy and decide whether to share an itinerary or a priced offer." : "Review this reusable package before publication or creating a customer proposal."}</p></div>{coverImage ? <img className="trip-composer__preview-cover" src={coverImage} alt="" /> : null}<div className="trip-composer__preview-intro"><small>{isProposal ? `Prepared for ${customer || "customer"}` : "Reusable package"} · {itineraryMode === "simple" ? "Simple" : "Advanced"} itinerary</small><h2>{name || "Your journey"}</h2><p>{note || `A journey through ${destination || "your destination"}.`}</p><div className="trip-composer__preview-meta"><span>{destination || "Destination to confirm"}</span><span>{isProposal ? formatProposalTravel(startDate, endDate) : `${days.length} days · ${Math.max(days.length - 1, 0)} nights${departureType === "fixed" && startDate ? ` · ${formatProposalTravel(startDate, endDate)}` : ""}`}</span>{isProposal ? <span>{adults} adults{Number(children) ? ` · ${children} children` : ""}</span> : null}</div></div><div className="trip-composer__preview-days">{days.map((day, index) => <section key={day.id}><h3>Day {index + 1} · {day.title}</h3><small>{day.place}</small>{itineraryMode === "advanced" && day.image ? <img className="trip-composer__preview-day-image" src={day.image} alt="" /> : null}{day.description ? <p>{day.description}</p> : null}{day.highlights?.length ? <ul>{day.highlights.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul> : null}{itineraryMode === "advanced" ? day.services.map((item) => <p key={item.id} className="trip-composer__preview-service"><Icon name={serviceTypes.find((type) => type.kind === item.kind)!.icon} size="sm" /><span><strong>{item.title}</strong>{item.detail ? <small>{item.detail}</small> : null}</span></p>) : null}</section>)}</div><div className="trip-composer__preview-terms"><h3>Trip details</h3>{inclusions ? <p><strong>Included</strong>{inclusions}</p> : null}{exclusions ? <p><strong>Not included</strong>{exclusions}</p> : null}{importantNotes ? <p><strong>Important notes</strong>{importantNotes}</p> : null}{paymentTerms ? <p><strong>Payment terms</strong>{paymentTerms}</p> : null}{cancellationPolicy ? <p><strong>Cancellation</strong>{cancellationPolicy}</p> : null}{otherTerms ? <p><strong>Other terms</strong>{otherTerms}</p> : null}</div><div className="trip-composer__preview-price"><span>{isProposal ? "Customer price" : `Starting from · ${priceBasis}`}</span><strong>{price ? money.format(Number(price)) : "Price to confirm"}</strong><small>Availability and final rates are confirmed before booking.</small></div></section> : null}
      {error ? <p className="trip-composer__error" role="alert">{error}</p> : null}
      {step === 3 ? <div className="trip-composer__readiness"><strong>Readiness check</strong><span>{plannedDays === days.length ? "All days intentionally described" : `${days.length - plannedDays} days need a description or highlights`}</span><span>{costing.unpriced ? `${costing.unpriced} services still unpriced` : "All services have a pricing state"}</span>{isProposal ? <span>{customerEmail ? "Customer email present" : "Customer email needed before sharing"} · {price ? "Priced offer available" : "Itinerary-only review available"}</span> : <span>{priceBasis ? `Price basis: ${priceBasis}` : "Price basis needed before publishing"}</span>}</div> : null}
      <footer className="trip-composer__footer"><span>{isProposal ? "This prototype saves status only; it does not send email." : "Package edits do not update proposals already created from it."}</span><div>{step > 0 ? <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>Back</Button> : null}<Button variant="ghost" size="sm" onClick={() => save("Draft")}>Save draft</Button>{step < 3 ? <Button variant="primary" size="sm" onClick={() => setStep(step + 1)}>Continue</Button> : isProposal ? <><Button variant="ghost" size="sm" onClick={() => save("Itinerary shared")}>Share itinerary for review</Button><Button variant="primary" size="sm" onClick={() => save("Sent")}>Save priced proposal as sent</Button></> : <Button variant="primary" size="sm" onClick={() => save("Draft")}>{existingPackage ? "Save package" : "Save draft package"}</Button>}</div></footer>
      </> : null}
    </div>

    <Modal open={blockOpen} onClose={() => setBlockOpen(false)} size="wide" title={editingId ? "Edit service block" : "Add a service block"} eyebrow={`Day ${activeIndex + 1} · ${activeDay.place || destination || "Itinerary"}`} footer={<><Button variant="ghost" onClick={() => setBlockOpen(false)}>Cancel</Button><Button variant="primary" disabled={!blockTitle.trim()} onClick={saveBlock}>{editingId ? "Save block" : "Add block"}</Button></>}>
      <div className="trip-composer__type-picker" role="group" aria-label="Service type">{serviceTypes.map((type) => <button key={type.kind} type="button" className={blockKind === type.kind ? "is-selected" : ""} aria-pressed={blockKind === type.kind} onClick={() => { setBlockKind(type.kind); setSupplierQuery(""); }}><Icon name={type.icon} size="sm" /><strong>{type.label}</strong><small>{type.hint}</small></button>)}</div>
      <div className="trip-composer__supplier-head"><div><h3>Choose from supply</h3><p>Example vendor options for this UI prototype. Search or enter your own details below.</p></div><span>{suppliers.length} options</span></div>
      <Field label="Search services or vendors" value={supplierQuery} onChange={setSupplierQuery} placeholder="Search name, vendor or place" />
      <div className="trip-composer__suppliers">{suppliers.length ? suppliers.map((item) => <button type="button" key={`${item.vendor}-${item.name}`} onClick={() => { setBlockTitle(item.name); setBlockDetail(item.detail); setBlockVendor(item.vendor); setBlockCost(String(item.cost)); setBlockPriceState(item.cost ? "priced" : "included"); }}><span><strong>{item.name}</strong><small>{item.vendor} · {item.location}</small></span><span>{money.format(item.cost)}</span></button>) : <p>No matching examples. You can still add this block manually.</p>}</div>
      <div className="trip-composer__block-form"><Field label="Service name" value={blockTitle} onChange={setBlockTitle} placeholder="e.g. Private airport pickup" /><Field label="Vendor / supplier" value={blockVendor} onChange={setBlockVendor} placeholder="Search CRM or enter a name" /><label className="trip-composer__field"><span>Pricing status</span><select value={blockPriceState} onChange={(event) => setBlockPriceState(event.target.value as ServicePriceState)}><option value="unpriced">Unpriced / to confirm</option><option value="included">Included at no extra cost</option><option value="priced">Supplier rate entered</option></select></label>{blockPriceState === "priced" ? <Field label={blockKind === "stay" ? "Rate per room-night" : "Rate per unit"} type="number" value={blockCost} onChange={setBlockCost} placeholder="0" /> : null}{blockKind === "stay" ? <><Field label="Rooms" type="number" value={blockRooms} onChange={setBlockRooms} /><Field label="Nights" type="number" value={blockNights} onChange={setBlockNights} /><Field label="Meal plan" value={blockMealPlan} onChange={setBlockMealPlan} /><Field label="Extra-adult supplement / unit" type="number" value={adultSupplement} onChange={setAdultSupplement} /><Field label="Extra-adult quantity" type="number" value={adultSupplementQty} onChange={setAdultSupplementQty} /><Field label="Child-with-bed supplement / unit" type="number" value={childSupplement} onChange={setChildSupplement} /><Field label="Child-with-bed quantity" type="number" value={childSupplementQty} onChange={setChildSupplementQty} /></> : <><Field label="Quantity" type="number" value={blockQuantity} onChange={setBlockQuantity} /><Field label="Unit" value={blockUnit} onChange={setBlockUnit} placeholder="vehicle, person, ticket" /></>}<label className="trip-composer__check"><input type="checkbox" checked={blockOptional} onChange={(event) => setBlockOptional(event.target.checked)} />Optional extra, excluded from the base price</label><Field label="Details shown in the itinerary" value={blockDetail} onChange={setBlockDetail} multiline placeholder="Service scope and inclusions, not an unconfirmed exact flight time" wide /></div>
      {blockKind === "transfer" ? <div className="trip-composer__service-details"><h3>Transport allocation</h3><p>Describe a route and vehicle class; exact departure times can be confirmed with the booking.</p><div><Field label="From" value={blockRouteFrom} onChange={setBlockRouteFrom} placeholder="Pickup place" /><Field label="To" value={blockRouteTo} onChange={setBlockRouteTo} placeholder="Drop-off place" /><Field label="Vehicle type" value={blockVehicleType} onChange={setBlockVehicleType} placeholder="e.g. SUV" /><Field label="Seats per vehicle" type="number" value={blockCapacity} onChange={setBlockCapacity} /></div><label className="trip-composer__check"><input type="checkbox" checked={blockDriverIncluded} onChange={(event) => setBlockDriverIncluded(event.target.checked)} />Driver included in the supplier rate</label></div> : null}
      {blockKind === "activity" ? <div className="trip-composer__service-details"><h3>Sightseeing & guide costs</h3><p>Only charge what is actually supplied. A descriptive highlight alone remains free text.</p><div><Field label="Guide cost (fixed)" type="number" value={blockGuideCost} onChange={setBlockGuideCost} placeholder="Optional" /><Field label="Admission per person" type="number" value={blockAdmissionCost} onChange={setBlockAdmissionCost} placeholder="Optional" /><Field label="Participants" type="number" value={blockParticipants} onChange={setBlockParticipants} /></div></div> : null}
    </Modal>

    <Modal open={packagePickerOpen} onClose={() => setPackagePickerOpen(false)} size="wide" title="Use an existing package" eyebrow="Proposal starting point" footer={<Button variant="ghost" onClick={() => setPackagePickerOpen(false)}>Close</Button>}>
      <p className="trip-composer__modal-copy">Copy a package itinerary into this proposal, then change any day or service block for the customer.</p><Field label="Find a package" value={packageQuery} onChange={setPackageQuery} placeholder="Search packages or destinations" />
      {pendingPackage ? <div className="trip-composer__replace"><p><strong>Replace this itinerary?</strong> The {blockCount} current blocks will be replaced by {pendingPackage.name}. Customer and quote details stay as they are.</p><div><Button variant="ghost" size="sm" onClick={() => setPendingPackage(null)}>Keep current blocks</Button><Button variant="primary" size="sm" onClick={() => applyPackage(pendingPackage)}>Replace blocks</Button></div></div> : null}
      <div className="trip-composer__packages">{packageMatches.map((item) => <button key={item.id} type="button" onClick={() => choosePackage(item)}>{item.image ? <img src={item.image} alt="" /> : <span><Icon name="package" size="md" /></span>}<span><strong>{item.name}</strong><small>{item.destination} · {item.duration ?? "Flexible plan"}</small></span><Icon name="plus" size="sm" /></button>)}{packageMatches.length === 0 ? <p>No packages match. You can keep building from scratch.</p> : null}</div>
    </Modal>

  </DetailPage>;
}

function Field({ label, value, onChange, placeholder, type = "text", multiline = false, wide = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; multiline?: boolean; wide?: boolean }) {
  return <label className={`trip-composer__field${wide ? " trip-composer__field--wide" : ""}`}><span>{label}</span>{multiline ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} /> : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} min={type === "number" ? "0" : undefined} />}</label>;
}

function CoverPicker({ image, onChange }: { image: string; onChange: (value: string) => void }) {
  return <label className="trip-composer__cover-picker">{image ? <img src={image} alt="Current cover" /> : <span><Icon name="camera" size="md" />No cover yet</span>}<strong>{image ? "Change cover" : "Upload cover"}</strong><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) onChange(URL.createObjectURL(file)); event.target.value = ""; }} /></label>;
}
