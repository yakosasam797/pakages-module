import { useEffect, useMemo, useState } from "react";
import { Button, DetailPage, Icon, Modal, StatusChip } from "@paryatech/ui";
import type { IconName } from "@paryatech/ui";
import type { PackageRecord } from "./App";
import { packageDaysForProposal } from "./PackageDetail";
import { ProposalCustomerView } from "./ProposalDetail";
import type { ItineraryMode, ProposalDay, ProposalQueryContext, ProposalRecord, ProposalService, ProposalServiceKind, ProposalStatus, ServicePriceState, ServiceSupplement } from "./proposalModel";
import { formatProposalTravel, itineraryCosting, servicePriceState } from "./proposalModel";
import { availableAccommodationCards, availableTransportCards, serviceCostBreakdown, type CostContext } from "./serviceCosting";
import { crmServiceOptions, kindForCategory, searchApiServices, type PackageServiceOption } from "./packageServiceSearch";
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

const serviceTypes: Array<{ kind: ProposalServiceKind; label: string; icon: IconName; hint: string }> = [
  { kind: "stay", label: "Accommodation", icon: "hotel", hint: "Hotels, rooms and nights" },
  { kind: "transfer", label: "Road transport", icon: "bus", hint: "Cars, SUVs, vans and transfers" },
  { kind: "activity", label: "Activity", icon: "camera", hint: "Experiences and guided visits" },
  { kind: "flight", label: "Flight", icon: "plane", hint: "Routes and flight preferences" },
  { kind: "meal", label: "Meal", icon: "sun", hint: "Included dining" },
  { kind: "other", label: "Other service", icon: "package", hint: "Guides, visas and more" },
];

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const makeDay = (index: number, place = "", simple = false): ProposalDay => ({ id: `day-${Date.now()}-${index}`, title: simple ? place : index === 1 ? "Arrival day" : `Day ${index} plan`, place, services: [] });
const cloneDays = (days: ProposalDay[]) => days.map((day) => ({ ...day, highlights: [...(day.highlights ?? [])], images: day.images ? [...day.images] : undefined, services: day.services.map((service) => ({ ...service, costComponents: service.costComponents?.map((item) => ({ ...item })), supplements: service.supplements?.map((item) => ({ ...item })), stayChildren: service.stayChildren?.map((child) => ({ ...child })) })) }));

function ComposerSection({ title, description, icon, children }: { title: string; description: string; icon: IconName; children: React.ReactNode }) {
  return <section className="trip-composer__form-section"><div className="trip-composer__form-section-label"><span className="trip-composer__form-section-icon"><Icon name={icon} size="sm" /></span><div><h2>{title}</h2><p>{description}</p></div></div><div className="trip-composer__form-section-content">{children}</div></section>;
}

function DayImages({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const addImages = (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files).filter((file) => file.type.startsWith("image/")).slice(0, Math.max(0, 6 - images.length));
    Promise.all(selected.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    }))).then((next) => onChange([...images, ...next])).catch(() => undefined);
  };
  return <div className="trip-composer__simple-images"><div className="trip-composer__simple-images-heading"><strong>Place photos</strong><span>Optional · up to 6 images</span></div><div className="trip-composer__simple-images-grid">{images.map((image, index) => <div className="trip-composer__simple-image" key={`${image.slice(0, 32)}-${index}`}><img src={image} alt={`Place photo ${index + 1}`} /><button type="button" aria-label={`Remove place photo ${index + 1}`} onClick={() => onChange(images.filter((_, imageIndex) => imageIndex !== index))}><Icon name="clear" size="xs" /></button></div>)}{images.length < 6 ? <label className="trip-composer__simple-image-add"><Icon name="plus" size="sm" /><span>Add photos</span><input type="file" accept="image/*" multiple onChange={(event) => { addImages(event.target.files); event.target.value = ""; }} /></label> : null}</div></div>;
}

export function TripComposer({ mode, packages = [], initialPackage, existingPackage, existing, queryContext, onCancel, onSave }: Props) {
  const isProposal = mode === "proposal";
  const isNewPackage = mode === "package" && !existingPackage && !initialPackage;
  const [step, setStep] = useState(isProposal ? -1 : 0);
  const [itineraryMode, setItineraryMode] = useState<ItineraryMode>(isProposal ? existing?.itineraryMode ?? (initialPackage ? "advanced" : "simple") : "advanced");
  const [creationChoice, setCreationChoice] = useState<"choose" | "ready">(isProposal && !existing && !initialPackage ? "choose" : "ready");
  useEffect(() => { document.querySelector(".pt-scroll")?.scrollTo({ top: 0 }); }, [step, creationChoice]);
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
  const [days, setDays] = useState<ProposalDay[]>(() => existing ? cloneDays(existing.days) : existingPackage ? packageDaysForProposal(existingPackage) : initialPackage ? packageDaysForProposal(initialPackage) : [makeDay(1, "", isProposal)]);
  const [activeDayId, setActiveDayId] = useState(() => days[0]?.id ?? "");
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockStage, setBlockStage] = useState<"type" | "service" | "details">("type");
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
  const [blockRateCardId, setBlockRateCardId] = useState("");
  const [blockRoomTypeId, setBlockRoomTypeId] = useState("");
  const [blockMealPlanCode, setBlockMealPlanCode] = useState("");
  const [blockStayCheckIn, setBlockStayCheckIn] = useState("");
  const [blockStayAdults, setBlockStayAdults] = useState(adults);
  const [blockStayChildren, setBlockStayChildren] = useState<NonNullable<ProposalService["stayChildren"]>>([]);
  const [blockRouteFrom, setBlockRouteFrom] = useState("");
  const [blockRouteTo, setBlockRouteTo] = useState("");
  const [blockServiceDate, setBlockServiceDate] = useState("");
  const [blockVehicleType, setBlockVehicleType] = useState("");
  const [blockCapacity, setBlockCapacity] = useState("");
  const [blockTransportPricingMode, setBlockTransportPricingMode] = useState<"transfer" | "local" | "outstation">("transfer");
  const [blockPlannedKm, setBlockPlannedKm] = useState("");
  const [blockIncludedKm, setBlockIncludedKm] = useState("");
  const [blockExtraKmRate, setBlockExtraKmRate] = useState("");
  const [blockPlannedHours, setBlockPlannedHours] = useState("");
  const [blockIncludedHours, setBlockIncludedHours] = useState("");
  const [blockExtraHourRate, setBlockExtraHourRate] = useState("");
  const [blockMinimumKmPerDay, setBlockMinimumKmPerDay] = useState("");
  const [blockTransportChargesStatus, setBlockTransportChargesStatus] = useState<"to_confirm" | "included" | "entered">("to_confirm");
  const [blockPermitFees, setBlockPermitFees] = useState("0");
  const [blockSupplierTax, setBlockSupplierTax] = useState("0");
  const [blockDriverIncluded, setBlockDriverIncluded] = useState(true);
  const [blockTransportUnits, setBlockTransportUnits] = useState("1");
  const [blockWaitingHours, setBlockWaitingHours] = useState("0");
  const [blockWaitingRate, setBlockWaitingRate] = useState("0");
  const [blockTolls, setBlockTolls] = useState("0");
  const [blockParking, setBlockParking] = useState("0");
  const [blockDriverAllowance, setBlockDriverAllowance] = useState("0");
  const [blockGuideCost, setBlockGuideCost] = useState("");
  const [blockAdmissionCost, setBlockAdmissionCost] = useState("");
  const [blockParticipants, setBlockParticipants] = useState("2");
  const [adultSupplement, setAdultSupplement] = useState("");
  const [adultSupplementQty, setAdultSupplementQty] = useState("0");
  const [childSupplement, setChildSupplement] = useState("");
  const [childSupplementQty, setChildSupplementQty] = useState("0");
  const [supplierQuery, setSupplierQuery] = useState("");
  const [externalServices, setExternalServices] = useState<PackageServiceOption[]>([]);
  const [serviceSearchBusy, setServiceSearchBusy] = useState(false);
  const [serviceSearchError, setServiceSearchError] = useState("");
  const [blockSource, setBlockSource] = useState<PackageServiceOption | null>(null);
  const [packagePickerOpen, setPackagePickerOpen] = useState(false);
  const [packageQuery, setPackageQuery] = useState("");
  const [pendingPackage, setPendingPackage] = useState<PackageRecord | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (isNewPackage && error) document.querySelector(".trip-composer__form-error")?.scrollIntoView({ block: "start" });
  }, [error, isNewPackage]);

  const activeDay = days.find((day) => day.id === activeDayId) ?? days[0];
  const activeIndex = days.findIndex((day) => day.id === activeDay?.id);
  const blockCount = days.reduce((sum, day) => sum + day.services.length, 0);
  const costingContext = { tripStart: startDate, travellers: Math.max(0, Number(adults) || 0) + Math.max(0, Number(children) || 0) };
  const costing = itineraryCosting(days, costingContext);
  const activeRateCard = availableAccommodationCards.find((card) => card.id === blockRateCardId);
  const matchingAccommodationCards = availableAccommodationCards.filter((card) => !blockSource || card.property.toLowerCase() === blockSource.name.toLowerCase() || card.id === blockRateCardId);
  const matchingTransportCards = availableTransportCards.filter((card) => blockSource?.source !== "vendor-crm" || blockSource.rateCardIds?.includes(card.id));
  const activeTransportCard = matchingTransportCards.find((card) => card.id === blockRateCardId);
  const cardPreview = activeRateCard ? serviceCostBreakdown({
    id: "preview", kind: "stay", title: blockTitle, detail: blockDetail, rateCardId: activeRateCard.id,
    roomTypeId: blockRoomTypeId, mealPlanCode: blockMealPlanCode, rooms: Number(blockRooms), nights: Number(blockNights),
    stayCheckIn: blockStayCheckIn || undefined, stayAdults: Number(blockStayAdults), stayChildren: blockStayChildren,
  }, { ...costingContext, dayIndex: activeIndex }) : activeTransportCard ? serviceCostBreakdown({
    id: "preview", kind: "transfer", title: blockTitle, detail: blockDetail, rateCardId: activeTransportCard.id,
    roomTypeId: blockRoomTypeId, mealPlanCode: blockMealPlanCode, quantity: Number(blockQuantity),
    unit: blockUnit, transportUnits: Number(blockTransportUnits), vehicleCapacity: Number(blockCapacity),
    serviceDate: blockServiceDate || undefined,
    waitingHours: Number(blockWaitingHours), tolls: Number(blockTolls), parking: Number(blockParking),
    driverIncluded: blockDriverIncluded, driverAllowance: Number(blockDriverAllowance),
  }, { ...costingContext, dayIndex: activeIndex }) : null;
  const transportPreview = blockKind === "transfer" && !activeTransportCard ? serviceCostBreakdown({
    id: "preview", kind: "transfer", title: blockTitle, detail: blockDetail, vendor: blockVendor,
    cost: blockCost === "" ? undefined : Number(blockCost), priceState: blockPriceState,
    quantity: Number(blockQuantity), transportUnits: Number(blockTransportUnits),
    transportPricingMode: blockTransportPricingMode, vehicleType: blockVehicleType,
    routeFrom: blockRouteFrom, routeTo: blockRouteTo,
    vehicleCapacity: blockCapacity === "" ? undefined : Number(blockCapacity),
    plannedKm: blockPlannedKm === "" ? undefined : Number(blockPlannedKm),
    includedKm: blockIncludedKm === "" ? undefined : Number(blockIncludedKm),
    extraKmRate: blockExtraKmRate === "" ? undefined : Number(blockExtraKmRate),
    plannedHours: blockPlannedHours === "" ? undefined : Number(blockPlannedHours),
    includedHours: blockIncludedHours === "" ? undefined : Number(blockIncludedHours),
    extraHourRate: blockExtraHourRate === "" ? undefined : Number(blockExtraHourRate),
    minimumKmPerDay: blockMinimumKmPerDay === "" ? undefined : Number(blockMinimumKmPerDay),
    transportChargesStatus: blockTransportChargesStatus, driverIncluded: blockDriverIncluded,
    driverAllowance: Number(blockDriverAllowance), tolls: Number(blockTolls), parking: Number(blockParking),
    permitFees: Number(blockPermitFees), supplierTax: Number(blockSupplierTax),
  }, { ...costingContext, dayIndex: activeIndex }) : null;
  const ratePreview = cardPreview ?? transportPreview;
  const suggestedPrice = Math.round(costing.baseCost * (1 + Math.max(0, Number(markupPercent) || 0) / 100));
  const previewRecord: ProposalRecord = {
    id: existing?.id ?? "Draft preview",
    name: name.trim() || "Your proposal",
    customer: customer.trim() || "your customer",
    customerEmail: customerEmail.trim(),
    sourcePackageId: source?.id,
    packageName: source?.name ?? "Custom itinerary",
    itineraryMode,
    sharingMode: price ? sharingMode : "itinerary",
    version: existing?.version ?? 1,
    destination: destination.trim() || "Destination to confirm",
    region: region.trim(),
    travel: formatProposalTravel(startDate, endDate),
    travelStart: startDate,
    travelEnd: endDate,
    travellers: `${adults || "0"} adults${Number(children) ? ` · ${children} children` : ""}`,
    requirements: requirements.trim(),
    note: note.trim(),
    inclusions, exclusions, importantNotes, paymentTerms, cancellationPolicy, otherTerms,
    coverImage,
    days,
    value: Number(price) || 0,
    updated: existing?.updated ?? "",
    status: "Draft",
  };
  const plannedDays = days.filter((day) => Boolean(day.description?.trim() || day.highlights?.some((item) => item.trim()))).length;
  const crmServices = useMemo(crmServiceOptions, []);
  useEffect(() => {
    if (!blockOpen || blockStage !== "service" || supplierQuery.trim().length < 2) { setExternalServices([]); setServiceSearchBusy(false); setServiceSearchError(""); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setServiceSearchBusy(true);
      searchApiServices(supplierQuery, controller.signal)
        .then((items) => { if (!controller.signal.aborted) { setExternalServices(items); setServiceSearchError(""); } })
        .catch(() => { if (!controller.signal.aborted) setServiceSearchError("More results are unavailable right now."); })
        .finally(() => { if (!controller.signal.aborted) setServiceSearchBusy(false); });
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [blockOpen, blockStage, supplierQuery]);
  const suppliers = [...crmServices, ...externalServices].filter((item) =>
    kindForCategory[item.category] === blockKind &&
    (!supplierQuery.trim() || `${item.name} ${item.vendor ?? ""} ${item.location} ${item.description}`.toLowerCase().includes(supplierQuery.trim().toLowerCase())),
  );
  const serviceSearchName = blockKind === "stay" ? "accommodation" : blockKind === "transfer" ? "transport" : blockKind === "activity" ? "activity" : blockKind === "flight" ? "flight" : blockKind === "meal" ? "meal" : "service";
  const packageMatches = useMemo(() => packages.filter((item) => `${item.name} ${item.destination}`.toLowerCase().includes(packageQuery.toLowerCase())), [packages, packageQuery]);

  const updateDay = (id: string, patch: Partial<ProposalDay>) => setDays((current) => current.map((day) => day.id === id ? { ...day, ...patch } : day));
  const addDay = () => {
    const next = makeDay(days.length + 1, itineraryMode === "simple" ? "" : destination.split(",")[0], isProposal && itineraryMode === "simple");
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
    setBlockStage(service ? "details" : "type");
    setBlockSource(service?.sourceId ? { id: service.sourceId, source: service.sourceType ?? "vendor-crm", name: service.title, category: (service.serviceCategory as PackageServiceOption["category"]) ?? "Other", location: "", description: service.detail, vendor: service.vendor, image: service.image, rateCardIds: crmServices.find((item) => item.id === service.sourceId)?.rateCardIds } : null);
    setBlockKind(service?.kind ?? "stay");
    setBlockTitle(service?.title ?? "");
    setBlockDetail(service?.detail ?? "");
    setBlockVendor(service?.vendor ?? "");
    setBlockCost(service?.cost == null ? "" : String(service.cost));
    setBlockPriceState(service?.kind === "transfer" && service.cost != null ? "priced" : service ? servicePriceState(service) : "unpriced");
    setBlockQuantity(String(service?.quantity ?? 1));
    setBlockUnit(service?.unit ?? (service?.kind === "activity" ? "person" : service?.kind === "transfer" ? "vehicle" : "service"));
    setBlockOptional(Boolean(service?.optional));
    setBlockRooms(String(service?.rooms ?? 1));
    setBlockNights(String(service?.nights ?? 1));
    setBlockMealPlan(service?.mealPlan ?? "Breakfast included");
    setBlockRateCardId(service?.rateCardId ?? "");
    setBlockRoomTypeId(service?.roomTypeId ?? "");
    setBlockMealPlanCode(service?.mealPlanCode ?? "");
    setBlockStayCheckIn(service?.stayCheckIn ?? "");
    setBlockStayAdults(String(service?.stayAdults ?? adults));
    setBlockStayChildren(service?.stayChildren?.map((child) => ({ ...child })) ?? Array.from({ length: Math.max(0, Number(children) || 0) }, () => ({ age: -1, bed: false })));
    setBlockRouteFrom(service?.routeFrom ?? "");
    setBlockRouteTo(service?.routeTo ?? "");
    setBlockServiceDate(service?.serviceDate ?? "");
    setBlockVehicleType(service?.vehicleType ?? "");
    setBlockCapacity(service?.vehicleCapacity == null ? "" : String(service.vehicleCapacity));
    setBlockTransportPricingMode(service?.transportPricingMode ?? (service?.unit === "day" ? "local" : "transfer"));
    setBlockPlannedKm(service?.plannedKm == null ? "" : String(service.plannedKm));
    setBlockIncludedKm(service?.includedKm == null ? "" : String(service.includedKm));
    setBlockExtraKmRate(service?.extraKmRate == null ? "" : String(service.extraKmRate));
    setBlockPlannedHours(service?.plannedHours == null ? "" : String(service.plannedHours));
    setBlockIncludedHours(service?.includedHours == null ? "" : String(service.includedHours));
    setBlockExtraHourRate(service?.extraHourRate == null ? "" : String(service.extraHourRate));
    setBlockMinimumKmPerDay(service?.minimumKmPerDay == null ? "" : String(service.minimumKmPerDay));
    setBlockTransportChargesStatus(service?.transportChargesStatus ?? "to_confirm");
    setBlockPermitFees(String(service?.permitFees ?? 0));
    setBlockSupplierTax(String(service?.supplierTax ?? 0));
    setBlockDriverIncluded(service?.driverIncluded ?? true);
    setBlockTransportUnits(String(service?.transportUnits ?? 1));
    setBlockWaitingHours(String(service?.waitingHours ?? 0));
    setBlockWaitingRate(String(service?.waitingRate ?? 0));
    setBlockTolls(String(service?.tolls ?? 0));
    setBlockParking(String(service?.parking ?? 0));
    setBlockDriverAllowance(String(service?.driverAllowance ?? 0));
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
    const hasActivityExtras = blockKind === "activity" && (Number(blockGuideCost) > 0 || Number(blockAdmissionCost) > 0);
    const existingDetailedCharges = editingId ? activeDay.services.find((item) => item.id === editingId)?.costComponents?.length : 0;
    const effectivePriceState: ServicePriceState = (blockKind === "stay" || blockKind === "transfer") && blockRateCardId ? "priced" : hasActivityExtras && blockPriceState === "unpriced" ? "priced" : blockPriceState === "priced" && !blockCost.trim() && !hasActivityExtras && !existingDetailedCharges ? "unpriced" : blockPriceState;
    const supplements: ServiceSupplement[] = blockKind === "stay" && !blockRateCardId ? [
      { label: "Extra adult", quantity: Math.max(0, Number(adultSupplementQty) || 0), unitCost: Math.max(0, Number(adultSupplement) || 0) },
      { label: "Child with bed", quantity: Math.max(0, Number(childSupplementQty) || 0), unitCost: Math.max(0, Number(childSupplement) || 0) },
    ].filter((item) => item.quantity > 0) : [];
    const originalService = editingId ? activeDay.services.find((item) => item.id === editingId) : undefined;
    const service: ProposalService = {
      id: editingId ?? `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      kind: blockKind,
      title: blockTitle.trim(),
      detail: blockDetail.trim(),
      vendor: blockVendor.trim() || undefined,
      image: blockSource?.image,
      sourceId: blockSource?.id,
      sourceType: blockSource?.source,
      serviceCategory: blockSource?.category,
      costComponents: originalService?.kind === blockKind && originalService.cost === (blockCost.trim() ? Number(blockCost) : undefined) ? originalService.costComponents?.map((item) => ({ ...item })) : undefined,
      supplierQuoteReference: originalService?.supplierQuoteReference,
      supplierRateValidUntil: originalService?.supplierRateValidUntil,
      costNote: originalService?.costNote,
      cost: blockRateCardId && (blockKind === "stay" || blockKind === "transfer") || effectivePriceState === "unpriced" ? undefined : effectivePriceState === "included" ? 0 : blockCost.trim() ? Math.max(0, Number(blockCost) || 0) : undefined,
      priceState: effectivePriceState,
      quantity: Math.max(1, Number(blockQuantity) || 1),
      unit: blockUnit.trim() || "service",
      optional: blockOptional,
      rooms: blockKind === "stay" ? Math.max(1, Number(blockRooms) || 1) : undefined,
      nights: blockKind === "stay" ? Math.max(1, Number(blockNights) || 1) : undefined,
      mealPlan: blockKind === "stay" ? blockMealPlan.trim() : undefined,
      rateCardId: blockKind === "stay" || blockKind === "transfer" ? blockRateCardId || undefined : undefined,
      roomTypeId: (blockKind === "stay" || blockKind === "transfer") && blockRateCardId ? blockRoomTypeId : undefined,
      mealPlanCode: (blockKind === "stay" || blockKind === "transfer") && blockRateCardId ? blockMealPlanCode : undefined,
      stayCheckIn: blockKind === "stay" && blockStayCheckIn ? blockStayCheckIn : undefined,
      stayAdults: blockKind === "stay" ? Math.max(0, Number(blockStayAdults) || 0) : undefined,
      stayChildren: blockKind === "stay" ? blockStayChildren.map((child) => ({ ...child })) : undefined,
      supplements,
      routeFrom: blockKind === "transfer" ? blockRouteFrom.trim() : undefined,
      routeTo: blockKind === "transfer" ? blockRouteTo.trim() : undefined,
      serviceDate: blockKind === "transfer" && blockServiceDate ? blockServiceDate : undefined,
      vehicleType: blockKind === "transfer" ? blockVehicleType.trim() : undefined,
      vehicleTier: blockKind === "transfer" ? originalService?.vehicleTier : undefined,
      vehicleCapacity: blockKind === "transfer" && blockCapacity !== "" ? Number(blockCapacity) : undefined,
      transportPricingMode: blockKind === "transfer" ? blockTransportPricingMode : undefined,
      plannedKm: blockKind === "transfer" && blockPlannedKm !== "" ? Number(blockPlannedKm) : undefined,
      includedKm: blockKind === "transfer" && blockIncludedKm !== "" ? Number(blockIncludedKm) : undefined,
      extraKmRate: blockKind === "transfer" && blockExtraKmRate !== "" ? Number(blockExtraKmRate) : undefined,
      plannedHours: blockKind === "transfer" && blockPlannedHours !== "" ? Number(blockPlannedHours) : undefined,
      includedHours: blockKind === "transfer" && blockIncludedHours !== "" ? Number(blockIncludedHours) : undefined,
      extraHourRate: blockKind === "transfer" && blockExtraHourRate !== "" ? Number(blockExtraHourRate) : undefined,
      minimumKmPerDay: blockKind === "transfer" && blockMinimumKmPerDay !== "" ? Number(blockMinimumKmPerDay) : undefined,
      transportChargesStatus: blockKind === "transfer" ? blockTransportChargesStatus : undefined,
      driverIncluded: blockKind === "transfer" ? blockDriverIncluded : undefined,
      transportUnits: blockKind === "transfer" ? Math.max(1, Number(blockTransportUnits) || 1) : undefined,
      waitingHours: blockKind === "transfer" ? Math.max(0, Number(blockWaitingHours) || 0) : undefined,
      waitingRate: blockKind === "transfer" ? Math.max(0, Number(blockWaitingRate) || 0) : undefined,
      tolls: blockKind === "transfer" ? Math.max(0, Number(blockTolls) || 0) : undefined,
      parking: blockKind === "transfer" ? Math.max(0, Number(blockParking) || 0) : undefined,
      permitFees: blockKind === "transfer" ? Math.max(0, Number(blockPermitFees) || 0) : undefined,
      supplierTax: blockKind === "transfer" ? Math.max(0, Number(blockSupplierTax) || 0) : undefined,
      driverAllowance: blockKind === "transfer" ? Math.max(0, Number(blockDriverAllowance) || 0) : undefined,
      guideCost: blockKind === "activity" ? Math.max(0, Number(blockGuideCost) || 0) : undefined,
      admissionCost: blockKind === "activity" ? Math.max(0, Number(blockAdmissionCost) || 0) : undefined,
      participants: blockKind === "activity" ? Math.max(1, Number(blockParticipants) || 1) : undefined,
    };
    service.priceState = serviceCostBreakdown(service, { ...costingContext, dayIndex: activeIndex }).status;
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
  const save = (status: ProposalStatus, requestedSharingMode?: "itinerary" | "priced") => {
    if (!name.trim() || !destination.trim()) { setError("Add a trip name and destination before saving."); return; }
    if (isProposal && itineraryMode === "simple" && status !== "Draft" && days.some((day) => !day.place.trim())) { setError("Add a place name for every day before sharing."); setStep(0); return; }
    if (!isProposal && departureType === "fixed" && (!startDate || !endDate)) { setError("A fixed-departure package needs both departure dates."); setStep(0); return; }
    if (isProposal && !customer.trim()) { setError("Add the customer name before saving the proposal."); return; }
    if (isProposal && status !== "Draft" && !customerEmail.trim()) { setError("Add the customer email before sharing this proposal."); setStep(0); return; }
    if ((isProposal || departureType === "fixed") && (Boolean(startDate) !== Boolean(endDate) || (startDate && endDate < startDate))) { setError("Add both travel dates in the correct order, or leave both open."); setStep(0); return; }
    if (status !== "Draft" && plannedDays !== days.length) { setError("Describe the purpose of every day before sharing. Arrival, leisure and transfer days can be planned without an activity."); setStep(0); return; }
    if (isProposal && status === "Itinerary shared" && requestedSharingMode === "priced" && costing.unpricedRequired > 0) { setError(`Resolve ${costing.unpricedRequired} included service${costing.unpricedRequired === 1 ? "" : "s"} without a supplier rate before sharing a priced proposal, or share the itinerary for review.`); setStep(2); return; }
    if (isProposal && status === "Itinerary shared" && requestedSharingMode === "priced" && (!Number(price) || Number(price) <= 0)) { setError("Add a customer quote, or share the itinerary without pricing."); setStep(2); return; }
    setError("");
    onSave({ itineraryMode: isProposal ? itineraryMode : "advanced", name: name.trim(), destination: destination.trim(), region: region.trim() || "Other", startDate: isProposal || departureType === "fixed" ? startDate : "", endDate: isProposal || departureType === "fixed" ? endDate : "", customer: isProposal ? customer.trim() : "", customerEmail: isProposal ? customerEmail.trim() : "", adults, children, requirements: requirements.trim(), note: note.trim(), price: price ? Number(price) : undefined, image: coverImage, days: cloneDays(days).map((day) => isProposal && itineraryMode === "simple" ? { ...day, title: day.place.trim() || day.title } : day), source, priceBasis, departureType, inclusions, exclusions, importantNotes, paymentTerms, cancellationPolicy, otherTerms, markupPercent: Math.max(0, Number(markupPercent) || 0), sharingMode: requestedSharingMode ?? sharingMode }, status);
  };

  return <DetailPage
    className={`trip-composer trip-composer--${mode}${isNewPackage ? " trip-composer--new-package" : ""}`}
    title={existing || existingPackage ? `Edit ${mode}` : isProposal ? "Add proposal" : "Add package"}
    status={isNewPackage ? undefined : <StatusChip tone="progress">{existing?.status ?? "Draft"}</StatusChip>}
    meta={isNewPackage ? undefined : <span className="trip-composer__meta"><Icon name={isProposal ? "user" : "package"} size="sm" />{isProposal && creationChoice === "choose" ? "Customer offer" : isProposal ? `${itineraryMode === "simple" ? "Simple" : "Advanced"} itinerary · Customer offer` : "Advanced itinerary · Reusable package"}</span>}
    actions={isNewPackage ? undefined : <div className="trip-composer__top-actions"><Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button></div>}
  >
    <div className="trip-composer__content">
      {creationChoice === "choose" ? <><section className="trip-composer__template-choice" aria-labelledby="proposal-template-title"><header><h3 id="proposal-template-title">Itinerary format</h3><p>Choose how the customer will see each day.</p></header><div className="trip-composer__template-options" role="radiogroup" aria-label="Proposal itinerary template"><button type="button" role="radio" aria-checked={itineraryMode === "simple"} className={itineraryMode === "simple" ? "is-selected" : ""} onClick={() => setItineraryMode("simple")}><span className="trip-composer__template-mark" aria-hidden="true" /><span><strong>Simple itinerary</strong><small>Write a short day story with places and photos, then add the services needed for each day.</small></span></button><button type="button" role="radio" aria-checked={itineraryMode === "advanced"} className={itineraryMode === "advanced" ? "is-selected" : ""} onClick={() => setItineraryMode("advanced")}><span className="trip-composer__template-mark" aria-hidden="true" /><span><strong>Advanced itinerary</strong><small>Build each day with stays, transport, activities, flights, and service details.</small></span></button></div><footer><Button variant="primary" size="sm" onClick={() => setCreationChoice("ready")}>Continue with {itineraryMode === "simple" ? "Simple" : "Advanced"}</Button></footer></section></> : null}
      {creationChoice === "ready" ? <>
      {!isNewPackage ? <nav className="trip-composer__steps" aria-label="Builder steps">{(isProposal ? ["Basic details", "Itinerary", "Content & policies", "Costing", "Preview"] : ["Build itinerary", "Content & policies", "Costing", "Preview"]).map((label, index) => { const target = isProposal ? index - 1 : index; return <button key={label} type="button" className={step === target ? "is-active" : ""} aria-current={step === target ? "step" : undefined} onClick={() => { setStep(target); setError(""); }}><span>{index + 1}</span>{label}</button>; })}</nav> : null}
      {isNewPackage && error ? <div className="trip-composer__form-error" role="alert"><strong>Complete the required details</strong><p>{error}</p></div> : null}
      {(isProposal ? step === -1 : step === 0) || isNewPackage ? <>
      <section className={isProposal ? "trip-composer__basics-stage" : "trip-composer__basics-stage--plain"}>
      {isProposal ? <header className="trip-composer__basics-head"><span>STEP 01 / THE ESSENTIALS</span><h2>Start with the trip basics</h2><p>Enter who this is for and where they are going. You will build the day-by-day itinerary next.</p></header> : !isNewPackage ? <div className="trip-composer__build-header"><div><h2>Trip setup</h2><p>A reusable route with relative days; add fixed dates only for a departure.</p></div><span>{days.length} {days.length === 1 ? "day" : "days"} · {plannedDays} planned</span></div> : null}
      {isProposal ? <ComposerSection title="Customer" description={queryContext ? `From Query ${queryContext.id}. Confirm who this proposal is for.` : "Add the person this proposal is for."} icon="user"><div className="trip-composer__customer-fields"><Field label="Customer name *" value={customer} onChange={setCustomer} placeholder="e.g. Ananya Mehta" /><Field label="Email" type="email" value={customerEmail} onChange={setCustomerEmail} placeholder="customer@example.com" /><Field label="Adults" type="number" value={adults} onChange={setAdults} /><Field label="Children" type="number" value={children} onChange={setChildren} /><details className="trip-composer__brief"><summary>Customer brief</summary><Field label="Requirements" value={requirements} onChange={setRequirements} multiline placeholder="Pace, rooms and must-see places" /></details></div></ComposerSection> : null}

      {isProposal ? <ComposerSection title="Proposal details" description="Name the proposal and set the journey dates." icon="package"><div className="trip-composer__setup" aria-label="Trip details">
        <Field label={isProposal ? "Proposal name" : "Package name"} value={name} onChange={setName} placeholder={isProposal ? "e.g. Mehta family Bali" : "e.g. Bali family discovery"} wide />
        <Field label="Destination" value={destination} onChange={setDestination} placeholder="e.g. Bali, Indonesia" />
        <Field label="Region" value={region} onChange={setRegion} placeholder="e.g. Southeast Asia" />
        {isProposal || departureType === "fixed" ? <><Field label={isProposal ? "Travel starts" : "Departure starts"} value={startDate} onChange={setStartDate} type="date" /><Field label={isProposal ? "Travel ends" : "Departure ends"} value={endDate} onChange={setEndDate} type="date" /></> : null}
      </div></ComposerSection> : isNewPackage ? <>
        <ComposerSection title="Package details" description="Name this reusable trip and place it in your catalogue." icon="package"><div className="trip-composer__setup" aria-label="Package details"><Field label="Package name *" value={name} onChange={setName} placeholder="e.g. Bali family discovery" wide /><Field label="Destination *" value={destination} onChange={setDestination} placeholder="e.g. Bali, Indonesia" /><Field label="Region" value={region} onChange={setRegion} placeholder="e.g. Southeast Asia" /></div></ComposerSection>
        <ComposerSection title="Departure" description="Choose whether travel dates stay flexible or belong to one departure." icon="plane"><div className="trip-composer__departure"><button type="button" className={departureType === "flexible" ? "is-active" : ""} aria-pressed={departureType === "flexible"} onClick={() => setDepartureType("flexible")}>Flexible dates</button><button type="button" className={departureType === "fixed" ? "is-active" : ""} aria-pressed={departureType === "fixed"} onClick={() => setDepartureType("fixed")}>Fixed departure</button></div><p className="trip-composer__departure-hint">{departureType === "flexible" ? "Use relative days; customer dates are added in a proposal." : "This package uses specific departure dates."}</p>{departureType === "fixed" ? <div className="trip-composer__setup trip-composer__departure-dates"><Field label="Departure starts *" value={startDate} onChange={setStartDate} type="date" /><Field label="Departure ends *" value={endDate} onChange={setEndDate} type="date" /></div> : null}</ComposerSection>
      </> : <section className="trip-composer__setup" aria-label="Trip details"><Field label="Package name" value={name} onChange={setName} placeholder="e.g. Bali family discovery" wide /><Field label="Destination" value={destination} onChange={setDestination} placeholder="e.g. Bali, Indonesia" /><Field label="Region" value={region} onChange={setRegion} placeholder="e.g. Southeast Asia" />{departureType === "fixed" ? <><Field label="Departure starts" value={startDate} onChange={setStartDate} type="date" /><Field label="Departure ends" value={endDate} onChange={setEndDate} type="date" /></> : null}</section>}
      {isProposal ? itineraryMode === "advanced" ? <div className="trip-composer__source-row"><span>{source ? `Based on ${source.name} · ${source.id}` : "Building a custom Advanced itinerary"}</span>{!existing ? <Button variant="ghost" size="sm" onClick={() => setPackagePickerOpen(true)}>{source ? "Change package" : "Start from a package"}</Button> : null}</div> : null : !isNewPackage ? <div className="trip-composer__departure"><span>Departure</span><button type="button" className={departureType === "flexible" ? "is-active" : ""} onClick={() => setDepartureType("flexible")}>Flexible dates</button><button type="button" className={departureType === "fixed" ? "is-active" : ""} onClick={() => setDepartureType("fixed")}>Fixed departure</button><small>{departureType === "flexible" ? "Use relative days; customer dates are applied in a proposal." : "Only this departure uses calendar dates."}</small></div> : null}

      </section>
      </> : null}
      {step === 0 || isNewPackage ? <>
      <section className={isProposal ? "trip-composer__itinerary-shell" : "trip-composer__itinerary-shell--plain"}>{isProposal ? <header className="trip-composer__itinerary-shell-head"><div><span>ITINERARY WORKSPACE</span><h2>{name || "Your itinerary"}</h2><p>{days.length} {days.length === 1 ? "day" : "days"} · {days.reduce((count, day) => count + day.services.length, 0)} service blocks · {destination || "Destination to confirm"}</p></div><div><Button variant="ghost" size="sm" leadingIcon={<Icon name="plus" size="sm" />} onClick={() => openBlock()}>Add block</Button><Button variant="primary" size="sm" leadingIcon={<Icon name="plus" size="sm" />} onClick={addDay}>Add day</Button></div></header> : null}
      <div className={`trip-composer__itinerary-layout${isProposal || isNewPackage ? " is-proposal" : ""}`}>
        {isProposal || isNewPackage ? <div className="trip-composer__form-section-label"><span className="trip-composer__form-section-icon"><Icon name="pin" size="sm" /></span><div><h2>Itinerary</h2><p>{isProposal && itineraryMode === "simple" ? "Add a place, description, and photos for each day." : "Build each day with places and service blocks."}</p></div></div> : null}
      <div className="trip-composer__workspace">
        <nav className="trip-composer__day-nav" aria-label="Itinerary days">
          {isProposal || isNewPackage ? null : <div className="trip-composer__rail-heading"><strong>Itinerary</strong><span>{days.length} {days.length === 1 ? "day" : "days"}</span></div>}
           <div className="trip-composer__day-links">{days.map((day, index) => <button key={day.id} type="button" className={day.id === activeDay.id ? "is-active" : ""} aria-current={day.id === activeDay.id ? "step" : undefined} onClick={() => setActiveDayId(day.id)}><span>Day {index + 1}</span><strong>{isProposal && itineraryMode === "simple" ? day.place || "Add a place" : day.title || "Untitled day"}</strong><small>{day.description?.trim() || day.highlights?.some((item) => item.trim()) ? "Planned" : "Needs a plan"}</small></button>)}</div>
          <Button variant="ghost" size="sm" leadingIcon={<Icon name="plus" size="sm" />} onClick={addDay}>Add day</Button>
        </nav>

        <main className="trip-composer__canvas">
           <div className="trip-composer__day-head"><div><span>Day {activeIndex + 1} of {days.length}</span><h2>{isProposal && itineraryMode === "simple" ? activeDay.place || "Add a place" : activeDay.title || "Untitled day"}</h2>{itineraryMode === "advanced" ? <p>{activeDay.place || destination || "Set a place for this day"}</p> : null}</div><div className="trip-composer__day-actions"><button type="button" onClick={() => moveDay(-1)} disabled={activeIndex === 0} aria-label="Move day earlier"><Icon name="chevronUp" size="sm" /></button><button type="button" onClick={() => moveDay(1)} disabled={activeIndex === days.length - 1} aria-label="Move day later"><Icon name="chevronDown" size="sm" /></button><button type="button" className="trip-composer__remove-day" onClick={removeDay} disabled={days.length === 1} aria-label={`Remove day ${activeIndex + 1}`}><Icon name="clear" size="sm" />Remove day</button></div></div>
           {isProposal && itineraryMode === "simple" ? <><div className="trip-composer__day-fields trip-composer__day-fields--simple"><Field label="Place name *" value={activeDay.place} onChange={(value) => updateDay(activeDay.id, { place: value, title: value })} placeholder="e.g. Ubud" wide /><Field label="Description" value={activeDay.description ?? ""} onChange={(value) => updateDay(activeDay.id, { description: value })} placeholder="Describe what the traveller will see or do here" multiline wide /></div><DayImages images={activeDay.images ?? (activeDay.image ? [activeDay.image] : [])} onChange={(images) => updateDay(activeDay.id, { images, image: images[0] ?? "" })} /></> : <div className="trip-composer__day-fields"><Field label="Day title" value={activeDay.title} onChange={(value) => updateDay(activeDay.id, { title: value })} placeholder="What happens this day?" /><Field label="Place" value={activeDay.place} onChange={(value) => updateDay(activeDay.id, { place: value })} placeholder="e.g. Ubud" /><Field label="Day description" value={activeDay.description ?? ""} onChange={(value) => updateDay(activeDay.id, { description: value })} placeholder="Describe arrival, sightseeing, transfer or leisure" multiline wide /><Field label="Activity highlights (one per line)" value={(activeDay.highlights ?? []).join("\n")} onChange={(value) => updateDay(activeDay.id, { highlights: value.split("\n").filter(Boolean) })} placeholder="Optional highlights, not automatically chargeable services" multiline wide /></div>}
          {itineraryMode === "advanced" ? <div className="trip-composer__day-media"><div><strong>Day image</strong><span>Optional image for this detailed itinerary</span></div><CoverPicker image={activeDay.image ?? ""} onChange={(value) => updateDay(activeDay.id, { image: value })} /></div> : null}
          {(itineraryMode === "advanced" || isProposal) ? <><div className="trip-composer__block-list">{activeDay.services.length ? activeDay.services.map((service, index) => {
            const type = serviceTypes.find((item) => item.kind === service.kind)!;
            return <article className="trip-composer__block" key={service.id}>
              <span className={`trip-composer__block-icon trip-composer__block-icon--${service.kind}`}>{service.image ? <img src={service.image} alt="" /> : <Icon name={type.icon} size="sm" />}</span>
              <div className="trip-composer__block-body"><span>{type.label}</span><strong>{service.title}</strong>{service.detail ? <p>{service.detail}</p> : null}{service.vendor ? <small><Icon name="vendors" size="xs" />{service.vendor}{service.cost != null ? ` · ${money.format(service.cost)} supplier cost` : ""}</small> : null}</div>
              <div className="trip-composer__block-actions"><button type="button" aria-label={`Move ${service.title} up`} disabled={index === 0} onClick={() => moveBlock(service.id, -1)}><Icon name="chevronUp" size="xs" /></button><button type="button" aria-label={`Move ${service.title} down`} disabled={index === activeDay.services.length - 1} onClick={() => moveBlock(service.id, 1)}><Icon name="chevronDown" size="xs" /></button><button type="button" aria-label={`Edit ${service.title}`} onClick={() => openBlock(service)}><Icon name="edit" size="xs" /></button><button type="button" aria-label={`Remove ${service.title}`} onClick={() => updateDay(activeDay.id, { services: activeDay.services.filter((item) => item.id !== service.id) })}><Icon name="clear" size="xs" /></button></div>
            </article>;
          }) : <div className="trip-composer__empty"><Icon name="package" size="lg" /><strong>No blocks on this day</strong><p>Add accommodation, transport, activities or another service to shape the itinerary.</p></div>}</div>
          <button className="trip-composer__add-block" type="button" onClick={() => openBlock()}><Icon name="plus" size="sm" /><span><strong>Add a block</strong><small>Choose a service type or a vendor from your supply</small></span></button></> : null}
        </main>

      </div>
      </div>
      </section>
      </> : null}
      {step === 1 || isNewPackage ? <section className="trip-composer__editor-section" aria-label="Content and policies"><div className="trip-composer__section-heading">{isNewPackage ? <span className="trip-composer__form-section-icon"><Icon name="fileText" size="sm" /></span> : <span>02 / CONTENT</span>}<div><h2>Content & policies</h2><p>{isProposal ? "Write this customer’s offer. Changes here do not alter its source package." : "Set reusable package content and policies for future proposals."}</p></div></div><div className="trip-composer__content-fields"><Field label="Overview / introduction" value={note} onChange={setNote} multiline wide /><Field label="Inclusions" value={inclusions} onChange={setInclusions} multiline /><Field label="Exclusions" value={exclusions} onChange={setExclusions} multiline /><Field label="Important notes" value={importantNotes} onChange={setImportantNotes} multiline /><Field label="Payment terms" value={paymentTerms} onChange={setPaymentTerms} multiline /><Field label="Cancellation policy" value={cancellationPolicy} onChange={setCancellationPolicy} multiline /><Field label="Other terms" value={otherTerms} onChange={setOtherTerms} multiline /></div><div className="trip-composer__cover-row"><div><strong>Package cover</strong><p>{isNewPackage ? "Choose the image shown in your package catalogue." : "One catalogue or proposal cover; add place photos in the Simple itinerary."}</p></div><CoverPicker image={coverImage} onChange={setCoverImage} /></div></section> : null}
      {step === 2 || isNewPackage ? <section className="trip-composer__editor-section" aria-label="Costing">
        <div className="trip-composer__section-heading">{isNewPackage ? <span className="trip-composer__form-section-icon"><Icon name="wallet" size="sm" /></span> : <span>03 / COSTING</span>}<div><h2>Costing</h2><p>Rates belong to the services attached to each day. A written highlight alone never creates a supplier charge.</p></div></div>
        <div className="trip-composer__costing-summary"><span><small>Included supplier cost</small><strong>{money.format(costing.baseCost)}</strong></span><span><small>Optional extras</small><strong>{money.format(costing.optionalCost)}</strong></span><span><small>Still unpriced</small><strong>{costing.unpricedCount} services</strong></span></div>
        <div className="trip-composer__costing-days">{days.map((day, index) => <section key={day.id}><header><div><span>DAY {index + 1}</span><strong>{day.title}</strong></div><button type="button" onClick={() => openBlockForDay(day.id)}><Icon name="plus" size="sm" /> Add service</button></header>{day.services.length ? day.services.map((service) => <CostingRow key={service.id} service={service} context={{ ...costingContext, dayIndex: index }} onEdit={() => openBlockForDay(day.id, service)} />) : <p className="trip-composer__no-services">No chargeable services yet. This day may still be intentionally planned.</p>}</section>)}</div>
        <div className="trip-composer__pricing-fields"><Field label="Markup on cost (%)" type="number" value={markupPercent} onChange={setMarkupPercent} /><div><span>Calculated selling basis</span><strong>{money.format(suggestedPrice)}</strong><small>Included supplier cost + markup. Optional extras and unpriced services are excluded.</small></div>{isProposal ? <><Field label="Customer quote (total)" type="number" value={price} onChange={setPrice} placeholder="Leave blank for itinerary-only review" /><button type="button" onClick={() => setPrice(String(suggestedPrice))}>Use calculated amount</button></> : <><Field label="Published starting price" type="number" value={price} onChange={setPrice} placeholder="Optional for draft" /><Field label="Price basis" value={priceBasis} onChange={setPriceBasis} placeholder="e.g. Per adult, twin sharing" /></>}</div>
      </section> : null}
      {step === 3 && isProposal ? <div className="trip-composer__customer-preview"><ProposalCustomerView record={previewRecord} cover={coverImage || source?.image} previewOnly /></div> : null}
      {(step === 3 && !isProposal) || isNewPackage ? <section className="trip-composer__editor-section trip-composer__preview" aria-label="Preview"><div className="trip-composer__section-heading"><span>04 / PREVIEW</span><h2>{isProposal ? "Customer-facing preview" : "Package preview"}</h2><p>{isProposal ? "Review this customer's own copy and decide whether to share an itinerary or a priced offer." : "Review this reusable package before publication or creating a customer proposal."}</p></div>{coverImage ? <img className="trip-composer__preview-cover" src={coverImage} alt="" /> : null}<div className="trip-composer__preview-intro"><small>{isProposal ? `Prepared for ${customer || "customer"}` : "Reusable package"} · {itineraryMode === "simple" ? "Simple" : "Advanced"} itinerary</small><h2>{name || "Your journey"}</h2><p>{note || `A journey through ${destination || "your destination"}.`}</p><div className="trip-composer__preview-meta"><span>{destination || "Destination to confirm"}</span><span>{isProposal ? formatProposalTravel(startDate, endDate) : `${days.length} days · ${Math.max(days.length - 1, 0)} nights${departureType === "fixed" && startDate ? ` · ${formatProposalTravel(startDate, endDate)}` : ""}`}</span>{isProposal ? <span>{adults} adults{Number(children) ? ` · ${children} children` : ""}</span> : null}</div></div><div className="trip-composer__preview-days">{days.map((day, index) => <section key={day.id}><h3>Day {index + 1} · {itineraryMode === "simple" ? day.place || day.title : day.title}</h3>{itineraryMode === "advanced" ? <small>{day.place}</small> : null}{(itineraryMode === "simple" ? day.images ?? (day.image ? [day.image] : []) : day.image ? [day.image] : []).map((image, imageIndex) => <img key={imageIndex} className="trip-composer__preview-day-image" src={image} alt={`${day.place || day.title}, photo ${imageIndex + 1}`} />)}{day.description ? <p>{day.description}</p> : null}{itineraryMode === "advanced" && day.highlights?.length ? <ul>{day.highlights.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul> : null}{itineraryMode === "advanced" ? day.services.map((item) => <p key={item.id} className="trip-composer__preview-service"><Icon name={serviceTypes.find((type) => type.kind === item.kind)!.icon} size="sm" /><span><strong>{item.title}</strong>{item.detail ? <small>{item.detail}</small> : null}</span></p>) : null}</section>)}</div><div className="trip-composer__preview-terms"><h3>Trip details</h3>{inclusions ? <p><strong>Included</strong>{inclusions}</p> : null}{exclusions ? <p><strong>Not included</strong>{exclusions}</p> : null}{importantNotes ? <p><strong>Important notes</strong>{importantNotes}</p> : null}{paymentTerms ? <p><strong>Payment terms</strong>{paymentTerms}</p> : null}{cancellationPolicy ? <p><strong>Cancellation</strong>{cancellationPolicy}</p> : null}{otherTerms ? <p><strong>Other terms</strong>{otherTerms}</p> : null}</div><div className="trip-composer__preview-price"><span>{isProposal ? "Customer price" : `Starting from · ${priceBasis}`}</span><strong>{price ? money.format(Number(price)) : "Price to confirm"}</strong><small>Availability and final rates are confirmed before booking.</small></div></section> : null}
      {!isNewPackage && error ? <p className="trip-composer__error" role="alert">{error}</p> : null}
      {step === 3 && !isNewPackage ? <div className="trip-composer__readiness"><strong>Readiness check</strong><span>{plannedDays === days.length ? "All days intentionally described" : `${days.length - plannedDays} days need a description or highlights`}</span><span>{costing.unpriced ? `${costing.unpriced} services still unpriced` : "All services have a pricing state"}</span>{isProposal ? <span>{customerEmail ? "Customer email present" : "Customer email needed before sharing"} · {price ? "Priced offer available" : "Itinerary-only review available"}</span> : <span>{priceBasis ? `Price basis: ${priceBasis}` : "Price basis needed before publishing"}</span>}</div> : null}
      {isNewPackage ? <footer className="trip-composer__footer trip-composer__form-actions"><div><Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button><Button variant="primary" size="sm" disabled={!name.trim() || !destination.trim() || (departureType === "fixed" && (!startDate || !endDate || endDate < startDate))} onClick={() => save("Draft")}>Create draft package</Button></div></footer> : <footer className={`trip-composer__footer${isProposal && step === -1 ? " trip-composer__footer--basics" : ""}`}><span>{isProposal ? step === -1 ? "Next: build the itinerary, day by day." : "Save your work as a draft or continue to review." : "Package edits do not update proposals already created from it."}</span><div>{step > (isProposal ? -1 : 0) ? <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>Back</Button> : null}<Button variant="ghost" size="sm" onClick={() => save("Draft")}>Save draft</Button>{step < 3 ? <Button variant="primary" size="sm" onClick={() => { if (isProposal && step === -1 && (!customer.trim() || !name.trim() || !destination.trim() || (Boolean(startDate) !== Boolean(endDate)) || (startDate && endDate < startDate))) { setError("Add the customer, proposal name, destination and a valid date range before building the itinerary."); return; } setError(""); setStep(step + 1); }}>{isProposal && step === -1 ? "Continue to itinerary" : "Continue"}</Button> : isProposal ? <><Button variant="ghost" size="sm" onClick={() => save("Itinerary shared", "itinerary")}>Share itinerary for review</Button><Button variant="primary" size="sm" onClick={() => save("Itinerary shared", "priced")}>Share priced itinerary</Button></> : <Button variant="primary" size="sm" onClick={() => save("Draft")}>{existingPackage ? "Save package" : "Save draft package"}</Button>}</div></footer>}
      </> : null}
    </div>

    <Modal open={blockOpen} onClose={() => setBlockOpen(false)} size="wide" title={blockStage === "type" ? "Choose a block type" : blockStage === "service" ? `Add ${serviceSearchName} block` : editingId ? "Edit service block" : "Complete service block"} eyebrow={`Day ${activeIndex + 1} · ${activeDay.place || destination || "Itinerary"}`} footer={blockStage === "type" ? <Button variant="ghost" onClick={() => setBlockOpen(false)}>Cancel</Button> : blockStage === "service" ? <><Button variant="ghost" onClick={() => setBlockStage("type")}>Back to block types</Button><Button variant="ghost" onClick={() => { setBlockSource(null); setBlockTitle(supplierQuery); setBlockDetail(""); setBlockVendor(""); setBlockCost(""); setBlockPriceState("unpriced"); setBlockStage("details"); }}>Enter a custom service</Button></> : <><Button variant="ghost" onClick={() => setBlockStage("service")}>Back to services</Button><Button variant="primary" disabled={!blockTitle.trim()} onClick={saveBlock}>{editingId ? "Save block" : "Add block"}</Button></>}>
      {blockStage === "type" ? <div className="trip-composer__block-step"><div className="trip-composer__block-step-intro"><strong>What kind of service is this?</strong><p>Choose a block type first. You can add several services to the same day.</p></div><div className="trip-composer__type-picker" role="group" aria-label="Service type">{serviceTypes.map((type) => <button key={type.kind} type="button" onClick={() => { if (type.kind !== blockKind) { setBlockRateCardId(""); setBlockRoomTypeId(""); setBlockMealPlanCode(""); setBlockSource(null); } setBlockKind(type.kind); setSupplierQuery(""); setBlockUnit(type.kind === "transfer" ? "vehicle" : type.kind === "activity" || type.kind === "meal" ? "person" : "service"); if (type.kind === "meal") setBlockQuantity(String(costingContext.travellers || 1)); if (type.kind === "activity") setBlockParticipants(String(costingContext.travellers || 1)); setBlockStage("service"); }}><span><Icon name={type.icon} size="md" /></span><strong>{type.label}</strong><small>{type.hint}</small><Icon name="chevronRight" size="sm" /></button>)}</div></div> : null}
      {blockStage === "service" ? <div className="trip-composer__block-step"><div className="trip-composer__block-step-intro"><strong>Choose a service</strong><p>Search by service name, supplier, or place. Available matches appear in one list.</p></div><label className="trip-composer__service-search"><Icon name="search" size="sm" /><input autoFocus value={supplierQuery} onChange={(event) => setSupplierQuery(event.target.value)} placeholder={`Search ${serviceSearchName} services`} aria-label="Search services" /></label><div className="trip-composer__suppliers trip-composer__service-results">{suppliers.length ? suppliers.map((item) => <button type="button" key={`${item.source}-${item.id}`} onClick={() => { setBlockSource(item); setBlockRateCardId(""); setBlockRoomTypeId(""); setBlockMealPlanCode(""); setBlockTitle(item.name); setBlockDetail(item.description); setBlockVendor(item.vendor ?? ""); setBlockCost(""); setBlockPriceState("unpriced"); setBlockStage("details"); }}><span className="trip-composer__service-result-image">{item.image ? <img src={item.image} alt="" /> : <Icon name={serviceTypes.find((type) => type.kind === blockKind)?.icon ?? "package"} size="sm" />}</span><span className="trip-composer__service-result-copy"><strong>{item.name}</strong><small>{item.vendor ? `${item.vendor} · ` : ""}{item.location}</small><em>{item.description}</em></span><Icon name="chevronRight" size="sm" /></button>) : <p>No matching services. Try another name or enter a custom service.</p>}{serviceSearchBusy ? <p>Finding more services…</p> : null}{serviceSearchError ? <p role="status">{serviceSearchError}</p> : null}</div></div> : null}
      {blockStage === "details" ? <div className="trip-composer__block-details"><div className="trip-composer__block-details-head"><span className="trip-composer__block-details-icon">{blockSource?.image ? <img src={blockSource.image} alt="" /> : <Icon name={serviceTypes.find((item) => item.kind === blockKind)?.icon ?? "package"} size="sm" />}</span><div><small>{serviceTypes.find((item) => item.kind === blockKind)?.label}</small><strong>{blockTitle || "Custom service"}</strong><span>{blockVendor || "Enter supplier and service details"}</span></div><button type="button" onClick={() => setBlockStage("service")}>Change service</button></div>
      {blockKind === "stay" ? <div className="trip-composer__rate-source"><label className="trip-composer__field"><span>Accommodation pricing source</span><select value={blockRateCardId} onChange={(event) => { const card = availableAccommodationCards.find((item) => item.id === event.target.value); setBlockRateCardId(event.target.value); if (card) { setBlockTitle(card.property); setBlockVendor(card.vendor); setBlockRoomTypeId(card.rooms[0]?.id ?? ""); setBlockMealPlanCode(card.meals[0]?.code ?? ""); setBlockPriceState("priced"); } }}><option value="">Manual supplier rate</option>{matchingAccommodationCards.map((card) => <option key={card.id} value={card.id}>{card.property} · {card.vendor} · {card.name}</option>)}</select></label><span>{activeRateCard ? `${activeRateCard.ref} · ${activeRateCard.validity} · ${activeRateCard.mealBasis}` : matchingAccommodationCards.length ? "Choose an available rate card or enter a confirmed supplier rate." : "No rate card for this stay yet. Enter a confirmed supplier rate."}</span></div> : null}
      {blockKind === "transfer" ? <div className="trip-composer__rate-source"><label className="trip-composer__field"><span>Transport pricing source</span><select value={activeTransportCard?.id ?? ""} onChange={(event) => { const card = matchingTransportCards.find((item) => item.id === event.target.value); setBlockRateCardId(card?.id ?? ""); if (card) { setBlockVendor(card.vendor); setBlockRoomTypeId(card.rooms[0]?.id ?? ""); setBlockMealPlanCode(card.meals[0]?.code ?? ""); setBlockVehicleType(card.meals[0]?.label ?? ""); setBlockCapacity(""); setBlockPriceState("priced"); } }}><option value="">Manual supplier vehicle quote</option>{matchingTransportCards.map((card) => <option key={card.id} value={card.id}>{card.vendor} · {card.name}</option>)}</select></label><span>{activeTransportCard ? `${activeTransportCard.ref} · ${activeTransportCard.validity} · Confirm passenger seats for the selected class.` : blockSource?.source === "vendor-crm" && !matchingTransportCards.length ? "No published CRM rate card for this service. Confirm a supplier quote before pricing." : "Enter the confirmed route, vehicle class, usable seats and supplier rate."}</span></div> : null}
      <div className="trip-composer__block-form">
        <Field label="Service name" value={blockTitle} onChange={setBlockTitle} placeholder="e.g. Private airport pickup" />
        <Field label="Vendor / supplier" value={blockVendor} onChange={setBlockVendor} placeholder="Choose a service or enter a name" />
        <label className="trip-composer__field"><span>Pricing status</span><select value={activeRateCard || activeTransportCard ? "priced" : blockPriceState} disabled={Boolean(activeRateCard || activeTransportCard)} onChange={(event) => setBlockPriceState(event.target.value as ServicePriceState)}><option value="unpriced">Unpriced / to confirm</option><option value="included">Included at no extra cost</option><option value="priced">Supplier rate entered</option></select></label>
        {blockPriceState === "priced" && !activeRateCard && !activeTransportCard ? <Field label={blockKind === "stay" ? "Rate per room-night" : blockKind === "transfer" ? blockTransportPricingMode === "outstation" ? "Supplier rate per km" : blockTransportPricingMode === "local" ? "Supplier rate per vehicle-day" : "Supplier rate per vehicle-trip" : blockKind === "activity" ? "Experience rate" : blockKind === "meal" ? "Rate per meal" : "Rate per unit"} type="number" value={blockCost} onChange={setBlockCost} placeholder="0" /> : null}
        {blockKind === "stay" ? <>
          {activeRateCard ? <><label className="trip-composer__field"><span>Room type</span><select value={blockRoomTypeId} onChange={(event) => setBlockRoomTypeId(event.target.value)}>{activeRateCard.rooms.map((room) => <option key={room.id} value={room.id}>{room.name} · {room.baseOccupancy} included, max {room.maxOccupancy}</option>)}</select></label><label className="trip-composer__field"><span>Meal plan</span><select value={blockMealPlanCode} onChange={(event) => setBlockMealPlanCode(event.target.value)}>{activeRateCard.meals.map((meal) => <option key={meal.code} value={meal.code}>{meal.code} · {meal.label}</option>)}</select></label></> : <Field label="Meal plan" value={blockMealPlan} onChange={setBlockMealPlan} />}
          <Field label="Rooms" type="number" value={blockRooms} onChange={setBlockRooms} /><Field label="Nights" type="number" value={blockNights} onChange={setBlockNights} />
          {activeRateCard ? <><Field label="Adults staying" type="number" value={blockStayAdults} onChange={setBlockStayAdults} /><Field label="Check-in override" type="date" value={blockStayCheckIn} onChange={setBlockStayCheckIn} /></> : <><Field label="Extra-adult rate / person-night" type="number" value={adultSupplement} onChange={setAdultSupplement} /><Field label="Extra adults" type="number" value={adultSupplementQty} onChange={setAdultSupplementQty} /><Field label="Child-with-bed rate / person-night" type="number" value={childSupplement} onChange={setChildSupplement} /><Field label="Children with bed" type="number" value={childSupplementQty} onChange={setChildSupplementQty} /></>}
        </> : blockKind === "activity" ? <><label className="trip-composer__field"><span>Experience rate basis</span><select value={blockUnit} onChange={(event) => setBlockUnit(event.target.value)}><option value="person">Per person</option><option value="group">Per group / visit</option></select></label>{blockUnit === "group" ? <Field label="Groups / visits" type="number" value={blockQuantity} onChange={setBlockQuantity} /> : null}</> : <><Field label={blockKind === "transfer" ? "Vehicles" : blockKind === "meal" ? "Meals / diners" : "Quantity"} type="number" value={blockQuantity} onChange={setBlockQuantity} />{blockKind === "transfer" ? null : <Field label="Unit" value={blockUnit} onChange={setBlockUnit} placeholder="person, ticket" />}</>}
        <label className="trip-composer__check"><input type="checkbox" checked={blockOptional} onChange={(event) => setBlockOptional(event.target.checked)} />Optional extra, excluded from the base price</label>
        <Field label="Details shown in the itinerary" value={blockDetail} onChange={setBlockDetail} multiline placeholder="Service scope and inclusions, not an unconfirmed exact flight time" wide />
      </div>
      {blockKind === "meal" ? <p className="trip-composer__meal-note">If this meal is already covered by the hotel's meal plan, mark it as included rather than costing it again.</p> : null}
      {activeRateCard && blockKind === "stay" ? <div className="trip-composer__child-guests"><header><div><strong>Children staying</strong><small>Age and bed choice determine the card's guest charge.</small></div><button type="button" onClick={() => setBlockStayChildren((current) => [...current, { age: -1, bed: false }])}>Add child</button></header>{blockStayChildren.map((child, index) => <div key={index}><Field label={`Child ${index + 1} age`} type="number" value={child.age < 0 ? "" : String(child.age)} onChange={(value) => setBlockStayChildren((current) => current.map((item, childIndex) => childIndex === index ? { ...item, age: value === "" ? -1 : Number(value) } : item))} /><label className="trip-composer__field"><span>Bed</span><select value={child.bed ? "with" : "without"} onChange={(event) => setBlockStayChildren((current) => current.map((item, childIndex) => childIndex === index ? { ...item, bed: event.target.value === "with" } : item))}><option value="without">Without extra bed</option><option value="with">With extra bed</option></select></label><button type="button" aria-label={`Remove child ${index + 1}`} onClick={() => setBlockStayChildren((current) => current.filter((_, childIndex) => childIndex !== index))}><Icon name="clear" size="sm" /></button></div>)}</div> : null}
      {!isProposal && activeRateCard ? <p className="trip-composer__reference-note">For a flexible package, “Check-in override” is only a pricing reference. Customer dates are applied when a proposal is created.</p> : null}
      {activeTransportCard ? <div className="trip-composer__transport-date"><Field label={isProposal ? "Service date override" : "Pricing reference date"} type="date" value={blockServiceDate} onChange={setBlockServiceDate} /><small>{isProposal ? "Leave blank to use this itinerary day's travel date." : "Only sets the indicative package cost; it does not fix a departure."}</small></div> : null}
      {ratePreview && blockPriceState === "priced" ? <div className="trip-composer__rate-preview"><div><strong>{ratePreview.issue ? "Rate cannot be applied yet" : "Supplier cost breakdown"}</strong><span>{ratePreview.issue ?? ratePreview.source}</span></div>{!ratePreview.issue ? <><strong>{money.format(ratePreview.total)}</strong><details><summary>View rate breakdown</summary>{ratePreview.lines.map((line, index) => <p key={`${line.label}-${index}`}><span>{line.label}<small>{line.basis}</small></span><strong>{money.format(line.amount)}</strong></p>)}</details></> : null}</div> : null}
      {activeTransportCard ? <div className="trip-composer__service-details trip-composer__ground-transport"><h3>CRM vehicle card</h3><p>Select the covered route and vehicle class. Confirm usable passenger seats before applying the card rate.</p><div><label className="trip-composer__field"><span>Covered route</span><select value={blockRoomTypeId} onChange={(event) => setBlockRoomTypeId(event.target.value)}>{activeTransportCard.rooms.map((route) => <option key={route.id} value={route.id}>{route.name} · {route.note}</option>)}</select></label><label className="trip-composer__field"><span>Vehicle class</span><select value={blockMealPlanCode} onChange={(event) => { setBlockMealPlanCode(event.target.value); setBlockVehicleType(activeTransportCard.meals.find((item) => item.code === event.target.value)?.label ?? ""); setBlockCapacity(""); }}>{activeTransportCard.meals.map((vehicle) => <option key={vehicle.code} value={vehicle.code}>{vehicle.label}</option>)}</select></label><Field label="Usable passenger seats / vehicle" type="number" value={blockCapacity} onChange={setBlockCapacity} placeholder="Exclude driver and luggage space" /><Field label="Trips / legs" type="number" value={blockTransportUnits} onChange={setBlockTransportUnits} /></div></div> : null}
      {blockKind === "transfer" && !activeTransportCard ? <div className="trip-composer__service-details trip-composer__ground-transport">
        <h3>Ground transport quote</h3>
        <p>Use the supplier's confirmed vehicle class, passenger capacity, rate and charge rules. No price is inferred from the number of travellers.</p>
        <div>
          <label className="trip-composer__field"><span>Pricing basis</span><select value={blockTransportPricingMode} onChange={(event) => { const mode = event.target.value as "transfer" | "local" | "outstation"; setBlockTransportPricingMode(mode); setBlockUnit(mode === "transfer" ? "vehicle" : "day"); }}><option value="transfer">Point-to-point transfer</option><option value="local">Local vehicle by day</option><option value="outstation">Outstation by km</option></select></label>
          <label className="trip-composer__field"><span>Vehicle class</span><select value={blockVehicleType} onChange={(event) => setBlockVehicleType(event.target.value)}><option value="">Choose supplier vehicle class</option><option value="Sedan">Sedan</option><option value="SUV">SUV</option><option value="MPV">MPV / people carrier</option><option value="Van">Van / Tempo Traveller</option><option value="Other">Other vehicle</option></select></label>
          <Field label="Passenger seats / vehicle (excluding driver)" type="number" value={blockCapacity} onChange={setBlockCapacity} placeholder="Confirm with supplier" />
          <Field label={blockTransportPricingMode === "transfer" ? "Trips / legs" : "Service days"} type="number" value={blockTransportUnits} onChange={setBlockTransportUnits} />
          <Field label="From" value={blockRouteFrom} onChange={setBlockRouteFrom} placeholder="Pickup place" />
          <Field label="To" value={blockRouteTo} onChange={setBlockRouteTo} placeholder="Drop-off place" />
          {blockTransportPricingMode === "transfer" ? <><Field label="Included km / trip (if capped)" type="number" value={blockIncludedKm} onChange={setBlockIncludedKm} /><Field label="Planned km (all trips)" type="number" value={blockPlannedKm} onChange={setBlockPlannedKm} /><Field label="Extra rate / km" type="number" value={blockExtraKmRate} onChange={setBlockExtraKmRate} /><Field label="Included hours / trip (if capped)" type="number" value={blockIncludedHours} onChange={setBlockIncludedHours} /><Field label="Planned hours (all trips)" type="number" value={blockPlannedHours} onChange={setBlockPlannedHours} /><Field label="Extra rate / hour" type="number" value={blockExtraHourRate} onChange={setBlockExtraHourRate} /></> : null}
          {blockTransportPricingMode === "local" ? <><Field label="Included km / day" type="number" value={blockIncludedKm} onChange={setBlockIncludedKm} /><Field label="Planned km (all days)" type="number" value={blockPlannedKm} onChange={setBlockPlannedKm} /><Field label="Extra rate / km" type="number" value={blockExtraKmRate} onChange={setBlockExtraKmRate} /><Field label="Included hours / day" type="number" value={blockIncludedHours} onChange={setBlockIncludedHours} /><Field label="Planned hours (all days)" type="number" value={blockPlannedHours} onChange={setBlockPlannedHours} /><Field label="Extra rate / hour" type="number" value={blockExtraHourRate} onChange={setBlockExtraHourRate} /></> : null}
          {blockTransportPricingMode === "outstation" ? <><Field label="Planned total km (include billable return)" type="number" value={blockPlannedKm} onChange={setBlockPlannedKm} /><Field label="Minimum billable km / day" type="number" value={blockMinimumKmPerDay} onChange={setBlockMinimumKmPerDay} placeholder="0 if none" /></> : null}
        </div>
        <p className="trip-composer__transport-hint">Confirm usable seats and luggage space with the supplier. A vehicle marketed as seven seats may have fewer passenger seats after the driver and luggage are accounted for.</p>
        <label className="trip-composer__field trip-composer__transport-charges"><span>Tolls, parking, permits and supplier tax</span><select value={blockTransportChargesStatus} onChange={(event) => setBlockTransportChargesStatus(event.target.value as "to_confirm" | "included" | "entered")}><option value="to_confirm">To confirm with supplier</option><option value="included">Confirmed included in rate</option><option value="entered">Enter confirmed amounts</option></select></label>
        {blockTransportChargesStatus === "entered" ? <div><Field label="Tolls (trip total)" type="number" value={blockTolls} onChange={setBlockTolls} /><Field label="Parking (trip total)" type="number" value={blockParking} onChange={setBlockParking} /><Field label="Permits / state entry (trip total)" type="number" value={blockPermitFees} onChange={setBlockPermitFees} /><Field label="Supplier tax (trip total)" type="number" value={blockSupplierTax} onChange={setBlockSupplierTax} /></div> : null}
        <label className="trip-composer__check"><input type="checkbox" checked={blockDriverIncluded} onChange={(event) => setBlockDriverIncluded(event.target.checked)} />Driver allowance included in supplier rate</label>
        {!blockDriverIncluded ? <Field label={blockTransportPricingMode === "transfer" ? "Driver allowance / vehicle-trip" : "Driver allowance / vehicle-day"} type="number" value={blockDriverAllowance} onChange={setBlockDriverAllowance} /> : null}
      </div> : null}
      {blockKind === "activity" ? <div className="trip-composer__service-details"><h3>Sightseeing & guide costs</h3><p>Only charge what is actually supplied. A descriptive highlight alone remains free text.</p><div><Field label="Guide cost (fixed)" type="number" value={blockGuideCost} onChange={setBlockGuideCost} placeholder="Optional" /><Field label="Admission per person" type="number" value={blockAdmissionCost} onChange={setBlockAdmissionCost} placeholder="Optional" /><Field label="Participants" type="number" value={blockParticipants} onChange={setBlockParticipants} /></div></div> : null}
      </div> : null}
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

function CostingRow({ service, context, onEdit }: { service: ProposalService; context: CostContext; onEdit: () => void }) {
  const quote = serviceCostBreakdown(service, context);
  const type = serviceTypes.find((item) => item.kind === service.kind)?.label ?? "Service";
  const scope = service.kind === "stay" ? `${service.rooms ?? 1} room${service.rooms === 1 ? "" : "s"} × ${service.nights ?? 1} nights${service.mealPlanCode ? ` · ${service.mealPlanCode}` : service.mealPlan ? ` · ${service.mealPlan}` : ""}`
    : service.kind === "transfer" ? `${service.quantity ?? 1} vehicle${service.quantity === 1 ? "" : "s"} × ${service.transportUnits ?? 1} ${service.unit === "day" ? (service.transportUnits === 1 ? "day" : "days") : service.transportUnits === 1 ? "trip" : "trips"}${service.vehicleType ? ` · ${service.vehicleType}` : ""}`
      : service.kind === "activity" ? `${service.participants ?? service.quantity ?? 1} participants` : `${service.quantity ?? 1} ${service.unit ?? "units"}`;
  return <details className="trip-composer__cost-item"><summary><span className="trip-composer__cost-item-icon"><Icon name={serviceTypes.find((item) => item.kind === service.kind)?.icon ?? "package"} size="sm" /></span><span className="trip-composer__cost-item-name"><strong>{service.title}</strong><small>{type} · {scope}{service.optional ? " · Optional" : ""}</small></span><span className={quote.status === "unpriced" ? "trip-composer__cost-item-amount is-unpriced" : "trip-composer__cost-item-amount"}>{quote.status === "unpriced" ? "Unpriced" : quote.status === "included" ? "Included" : money.format(quote.total)}</span><Icon name="chevronDown" size="sm" /></summary><div className="trip-composer__cost-item-body">{quote.source ? <p className="trip-composer__cost-item-source">{quote.source}</p> : null}{quote.issue ? <p className="trip-composer__cost-item-issue">{quote.issue}</p> : quote.lines.map((line, index) => <div className="trip-composer__cost-line" key={`${line.label}-${index}`}><span><strong>{line.label}</strong><small>{line.basis}</small></span><strong>{money.format(line.amount)}</strong></div>)}<button type="button" onClick={onEdit}>Edit service and rate</button></div></details>;
}

function CoverPicker({ image, onChange }: { image: string; onChange: (value: string) => void }) {
  return <label className="trip-composer__cover-picker">{image ? <img src={image} alt="Current cover" /> : <span><Icon name="camera" size="md" />No cover yet</span>}<strong>{image ? "Change cover" : "Upload cover"}</strong><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) onChange(URL.createObjectURL(file)); event.target.value = ""; }} /></label>;
}
