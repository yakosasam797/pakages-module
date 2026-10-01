import { serviceCostBreakdown, type CostContext } from "./serviceCosting";
import type { PrivateTransportQuote, PrivateTransportTariff, PrivateTransportTrip, VehicleOffering } from "../vendor-crm/src/rateCard/privateTransport";
import type { SupplierTaxProfile } from "../vendor-crm/src/rateCard/supplierTax";
import type { ActivityQuoteInput, ActivityQuoteResult } from "../vendor-crm/src/rateCard/activityPricing";

export type ProposalStatus = "Draft" | "Itinerary shared" | "Changes requested" | "Approved" | "Declined";
export type ProposalServiceKind = "flight" | "transfer" | "stay" | "activity" | "meal" | "other";
export type ItineraryMode = "simple" | "advanced";
export type ServicePriceState = "priced" | "included" | "unpriced";

/** Optional context supplied by the Query workspace when it opens this proposal template. */
export interface ProposalQueryContext {
  id: string;
  customer: string;
  customerEmail?: string;
  destination?: string;
  region?: string;
  travelStart?: string;
  travelEnd?: string;
  adults?: number;
  children?: number;
  requirements?: string;
}

export interface ServiceSupplement {
  label: string;
  quantity: number;
  unitCost: number;
}

export interface ServiceCostComponent {
  id: string;
  label: string;
  quantity: number;
  unitCost: number;
  unit: string;
}

export interface StayChild {
  age: number;
  bed: boolean;
}

export interface ProposalService {
  id: string;
  kind: ProposalServiceKind;
  title: string;
  detail: string;
  vendor?: string;
  supplierQuoteReference?: string;
  supplierRateValidUntil?: string;
  costNote?: string;
  image?: string;
  sourceType?: "vendor-crm" | "api";
  sourceId?: string;
  sourceVendorId?: string;
  serviceCategory?: string;
  cost?: number;
  costComponents?: ServiceCostComponent[];
  priceState?: ServicePriceState;
  quantity?: number;
  unit?: string;
  optional?: boolean;
  rooms?: number;
  nights?: number;
  mealPlan?: string;
  rateCardId?: string;
  activityInput?: ActivityQuoteInput;
  activitySnapshot?: { vendorId: string; serviceId: string; vendorName: string; cardName: string; currency: string; version: number; pricedAt: string; input: ActivityQuoteInput; result: ActivityQuoteResult };
  privateTransportInput?: PrivateTransportTrip;
  privateTransportSnapshot?: { vendorId: string; serviceId: string; vendorName: string; cardName: string; currency: string; version: number; pricedAt: string; input: PrivateTransportTrip; result: PrivateTransportQuote; tariff: PrivateTransportTariff; vehicles: VehicleOffering[]; taxProfiles: SupplierTaxProfile[] };
  /** Same retained hire may appear on several itinerary days but is costed once. */
  transportHireId?: string;
  transportCoversEntireGroup?: boolean;
  /** Who bears supplier charges that remain payable at actuals after quoting. */
  transportActualsTerm?: "agency-absorbs" | "customer-pays";
  roomTypeId?: string;
  mealPlanCode?: string;
  stayCheckIn?: string;
  stayAdults?: number;
  stayChildren?: StayChild[];
  supplements?: ServiceSupplement[];
  routeFrom?: string;
  routeTo?: string;
  serviceDate?: string;
  vehicleType?: string;
  vehicleTier?: "standard" | "premium" | "luxury";
  vehicleCapacity?: number;
  transportPricingMode?: "transfer" | "local" | "outstation";
  driverIncluded?: boolean;
  transportUnits?: number;
  plannedKm?: number;
  includedKm?: number;
  extraKmRate?: number;
  plannedHours?: number;
  includedHours?: number;
  extraHourRate?: number;
  minimumKmPerDay?: number;
  transportChargesStatus?: "to_confirm" | "included" | "entered";
  waitingHours?: number;
  waitingRate?: number;
  tolls?: number;
  parking?: number;
  permitFees?: number;
  supplierTax?: number;
  driverAllowance?: number;
  guideCost?: number;
  admissionCost?: number;
  participants?: number;
}

export interface ProposalDay {
  id: string;
  title: string;
  place: string;
  description?: string;
  highlights?: string[];
  image?: string;
  images?: string[];
  services: ProposalService[];
  plannedBlockCount?: number;
}

export interface ProposalRecord {
  id: string;
  name: string;
  customer: string;
  customerEmail: string;
  sourcePackageId?: string;
  queryId?: string;
  queryContext?: ProposalQueryContext;
  packageName: string;
  itineraryMode?: ItineraryMode;
  sharingMode?: "itinerary" | "priced";
  version?: number;
  acceptedVersion?: number;
  acceptedRevisions?: Array<{ version: number; acceptedAt: string; days: ProposalDay[]; value: number }>;
  destination: string;
  region: string;
  travel: string;
  travelStart?: string;
  travelEnd?: string;
  travellers: string;
  requirements: string;
  changeRequest?: string;
  note: string;
  inclusions?: string;
  exclusions?: string;
  importantNotes?: string;
  paymentTerms?: string;
  cancellationPolicy?: string;
  otherTerms?: string;
  markupPercent?: number;
  coverImage?: string;
  days: ProposalDay[];
  value: number;
  updated: string;
  status: ProposalStatus;
}

export function servicePriceState(service: ProposalService): ServicePriceState {
  return serviceCostBreakdown(service).status;
}

export function serviceQuantity(service: ProposalService): number {
  if (service.kind === "stay") return Math.max(1, service.rooms ?? 1) * Math.max(1, service.nights ?? 1);
  return Math.max(1, service.quantity ?? 1);
}

export function serviceTotalCost(service: ProposalService, context?: CostContext): number {
  return serviceCostBreakdown(service, context).total;
}

export function itineraryCosting(days: ProposalDay[], context: Omit<CostContext, "dayIndex"> = {}) {
  const services = days.flatMap((day) => day.services);
  const seenHires = new Map<string, ProposalService>();
  const quotes = days.flatMap((day, dayIndex) => day.services.map((service) => {
    const first = service.kind === "transfer" && service.transportHireId ? seenHires.get(service.transportHireId) : undefined;
    if (service.kind === "transfer" && service.transportHireId && !first) seenHires.set(service.transportHireId, service);
    const sameHire = first && first.rateCardId === service.rateCardId && JSON.stringify(first.privateTransportInput) === JSON.stringify(service.privateTransportInput);
    return { service, quote: first ? sameHire ? { status: "included" as const, total: 0, lines: [{ label: "Retained transport hire", basis: "Costed on its first itinerary day", amount: 0 }] } : { status: "unpriced" as const, total: 0, lines: [], issue: "This retained hire has different pricing details on another day." } : serviceCostBreakdown(service, { ...context, dayIndex }) };
  }));
  return {
    services,
    quotes,
    stays: services.filter((service) => service.kind === "stay").length,
    unpriced: quotes.filter(({ quote }) => quote.status === "unpriced").length,
    unpricedCount: quotes.filter(({ quote }) => quote.status === "unpriced").length,
    unpricedRequired: quotes.filter(({ service, quote }) => !service.optional && quote.status === "unpriced").length,
    baseCost: quotes.reduce((sum, { service, quote }) => sum + (service.optional ? 0 : quote.total), 0),
    markupBaseCost: quotes.reduce((sum, { service, quote }) => sum + (service.optional ? 0 : "markupBasis" in quote && typeof quote.markupBasis === "number" ? quote.markupBasis : quote.total), 0),
    optionalCost: quotes.reduce((sum, { service, quote }) => sum + (service.optional ? quote.total : 0), 0),
  };
}

interface PackageSource {
  id: string;
  name: string;
  destination: string;
  region: string;
}

const stopByDestination: Record<string, { arrival: string; first: string; second: string; experience: string; finalExperience: string }> = {
  Bali: { arrival: "Denpasar", first: "Ubud", second: "Seminyak", experience: "Ubud temples and rice terraces", finalExperience: "Nusa Penida island day" },
  Himachal: { arrival: "Chandigarh", first: "Shimla", second: "Manali", experience: "Shimla and Kufri discovery", finalExperience: "Solang Valley experience" },
  Rajasthan: { arrival: "Jaipur", first: "Jaipur", second: "Udaipur", experience: "Amber Fort and old-city walk", finalExperience: "Udaipur lakes and palace circuit" },
  Dubai: { arrival: "Dubai", first: "Downtown Dubai", second: "Dubai Marina", experience: "Old Dubai and desert experience", finalExperience: "Abu Dhabi city and mosque tour" },
  Kerala: { arrival: "Kochi", first: "Munnar", second: "Alleppey", experience: "Munnar tea-country trail", finalExperience: "Private backwater cruise" },
};

const service = (day: number, kind: ProposalServiceKind, title: string, detail: string): ProposalService => ({
  id: `day-${day}-${kind}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  kind,
  title,
  detail,
});

export function proposalDaysFromPackage(source?: PackageSource): ProposalDay[] {
  const key = Object.keys(stopByDestination).find((place) => source?.destination.includes(place));
  const destination = source?.destination.split(",")[0] || "your destination";
  const route = key ? stopByDestination[key] : {
    arrival: destination,
    first: destination,
    second: destination,
    experience: `Private ${destination} experience`,
    finalExperience: `Explore more of ${destination}`,
  };

  return [
    {
      id: "proposal-day-1",
      title: `Arrive in ${route.arrival}`,
      place: route.first,
      services: [
        service(1, "flight", `Arrival flight to ${route.arrival}`, "Flight preference and final schedule tailored to the traveller."),
        service(1, "transfer", `Private transfer to ${route.first}`, "Airport meet-and-assist with a private vehicle."),
        service(1, "stay", `Stay in ${route.first}`, "Room and hotel selection matched to the customer's preferences."),
      ],
    },
    {
      id: "proposal-day-2",
      title: route.experience,
      place: route.first,
      services: [
        service(2, "meal", "Breakfast at the hotel", "Included with the stay."),
        service(2, "activity", route.experience, "Private guided experience with local coordination."),
      ],
    },
    {
      id: "proposal-day-3",
      title: `Continue to ${route.second}`,
      place: route.second,
      services: [
        service(3, "transfer", `${route.first} to ${route.second}`, "Private point-to-point transport with luggage."),
        service(3, "stay", `Stay in ${route.second}`, "Accommodation selected for the second part of the journey."),
        service(3, "activity", route.finalExperience, "Included experience, subject to final availability."),
      ],
    },
    {
      id: "proposal-day-4",
      title: "Your final day",
      place: route.second,
      services: [
        service(4, "meal", "Breakfast at the hotel", "Included before checkout."),
        service(4, "transfer", `Private transfer to ${route.arrival} airport`, "Pickup timed to the departure flight."),
        service(4, "flight", "Return flight", "Final flight option confirmed after the customer accepts."),
      ],
    },
  ];
}

export function formatProposalTravel(start: string, end: string): string {
  if (!start || !end) return "Dates to be confirmed";
  const date = (value: string) => new Date(`${value}T12:00:00`);
  const first = date(start);
  const last = date(end);
  if (Number.isNaN(first.getTime()) || Number.isNaN(last.getTime())) return "Dates to be confirmed";
  const day = new Intl.DateTimeFormat("en-IN", { day: "2-digit" });
  const monthYear = new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" });
  if (first.getMonth() !== last.getMonth() || first.getFullYear() !== last.getFullYear()) {
    return `${day.format(first)} ${monthYear.format(first)}–${day.format(last)} ${monthYear.format(last)}`;
  }
  return `${day.format(first)}–${day.format(last)} ${monthYear.format(last)}`;
}
