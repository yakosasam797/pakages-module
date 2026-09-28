export type ProposalStatus = "Draft" | "Itinerary shared" | "Sent" | "Changes requested" | "Accepted" | "Declined";
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

export interface ProposalService {
  id: string;
  kind: ProposalServiceKind;
  title: string;
  detail: string;
  vendor?: string;
  cost?: number;
  priceState?: ServicePriceState;
  quantity?: number;
  unit?: string;
  optional?: boolean;
  rooms?: number;
  nights?: number;
  mealPlan?: string;
  supplements?: ServiceSupplement[];
  routeFrom?: string;
  routeTo?: string;
  vehicleType?: string;
  vehicleCapacity?: number;
  driverIncluded?: boolean;
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
  services: ProposalService[];
}

export interface ProposalRecord {
  id: string;
  name: string;
  customer: string;
  customerEmail: string;
  sourcePackageId?: string;
  queryId?: string;
  packageName: string;
  itineraryMode?: ItineraryMode;
  sharingMode?: "itinerary" | "priced";
  version?: number;
  acceptedVersion?: number;
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
  return service.priceState ?? (service.cost == null ? "unpriced" : service.cost === 0 ? "included" : "priced");
}

export function serviceQuantity(service: ProposalService): number {
  if (service.kind === "stay") return Math.max(1, service.rooms ?? 1) * Math.max(1, service.nights ?? 1);
  return Math.max(1, service.quantity ?? 1);
}

export function serviceTotalCost(service: ProposalService): number {
  if (servicePriceState(service) === "unpriced") return 0;
  const base = (service.cost ?? 0) * serviceQuantity(service);
  const supplements = service.supplements?.reduce((sum, item) => sum + item.quantity * item.unitCost, 0) ?? 0;
  const activityExtras = service.kind === "activity" ? (service.guideCost ?? 0) + (service.admissionCost ?? 0) * Math.max(1, service.participants ?? 1) : 0;
  return Math.round(base + supplements + activityExtras);
}

export function itineraryCosting(days: ProposalDay[]) {
  const services = days.flatMap((day) => day.services);
  return {
    services,
    stays: services.filter((service) => service.kind === "stay").length,
    unpriced: services.filter((service) => servicePriceState(service) === "unpriced").length,
    unpricedCount: services.filter((service) => servicePriceState(service) === "unpriced").length,
    baseCost: services.reduce((sum, service) => sum + (service.optional ? 0 : serviceTotalCost(service) ?? 0), 0),
    optionalCost: services.reduce((sum, service) => sum + (service.optional ? serviceTotalCost(service) ?? 0 : 0), 0),
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
