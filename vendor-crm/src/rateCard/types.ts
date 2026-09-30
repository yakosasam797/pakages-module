export type CardTone = "success" | "warning" | "danger" | "neutral" | "info";
export type DetailPageTab = "ratecard" | "test" | "policies" | "activity";

export interface MealPlan {
  code: string;
  label: string;
}

export interface Room {
  id: string;
  name: string;
  note: string;
  baseOccupancy: number;
  maxOccupancy: number;
  maxBeds: number;
}

export interface Season {
  name: string;
  colorToken: "ink-3" | "accent" | "pink" | "warn";
  dates: string;
  summary: string;
  nights: number;
  priority: string;
}

/** roomId, guestClass, ageBand, bed, mealPlanId, amount|null, max */
export type GuestRule = [string, string, string, string, string, number | null, number];

export interface Supplement {
  name: string;
  applies: string;
  amount: number | null;
  unit: string;
  basis: string;
  tone: CardTone;
}

export interface ServiceRow {
  name: string;
  note: string;
  applies: string;
  basis: string;
  amount: number | null;
}

export interface ActivityRow {
  name: string;
  note: string;
  group: string;
  basis: string;
  amount: number | null;
}

export interface CancelRow {
  window: string;
  charge: string;
  basis: string;
  tone: CardTone;
}

export interface PolicyDocument {
  name: string;
  file: string;
  size: string;
}

/** Terms & conditions row shown on the Policies DataSheet. */
export interface PolicyRow {
  id: string;
  title: string;
  category: string;
  /** Short line shown in the table. */
  summary: string;
  /** Full readable policy text shown in the View policy modal. */
  body: string;
  document: PolicyDocument | null;
  status: "ok" | "unresolved" | "none";
}

export interface ActivityEvent {
  date: string;
  time: string;
  member: string;
  role: string;
  initials: string;
  avatarTone: "pink" | "default" | "warn" | "channel";
  event: string;
  area: string;
}

export interface RateCardNote {
  body: string;
  author: string;
  when: string;
}

export type TransportChargeTreatment = "included" | "fixed" | "estimated" | "actuals" | "not-applicable" | "unconfirmed";

export interface TransportCharge {
  id: string;
  label: string;
  treatment: TransportChargeTreatment;
  amount: number | null;
  unit: "transfer" | "vehicle" | "hour" | "day" | "pickup" | "hire";
  paidBy: "agency" | "customer" | "unconfirmed";
  collectedBy: "agency" | "supplier" | "driver" | "unconfirmed";
  note: string;
  fareIds?: string[];
  routeIds?: string[];
  vehicleIds?: string[];
  trigger?: "always" | "night-pickup";
  triggerStart?: string;
  triggerEnd?: string;
  taxProfileId?: string;
  taxPresentation?: "included" | "additional";
}

export interface TransportOffering {
  id: string;
  label: string;
  passengerSeats: number | null;
  luggageBags: number | null;
  modelOrEquivalent: string;
}

export interface TransportRoute {
  id: string;
  label: string;
  from: string;
  to: string;
  includedKm: number;
  prices: Record<string, number | null>;
}

export interface TransportTariff {
  serviceType: "airport-transfer";
  pricingMethod: "fixed-per-vehicle";
  timezone: string;
  validFrom: string;
  validTo: string;
  offerings: TransportOffering[];
  routes: TransportRoute[];
  waitingIncludedMinutes: number;
  waitingRatePerHour: number;
  waitingRounding: string;
  charges: TransportCharge[];
  availability: "not-held" | "held" | "confirmed";
  quoteValidUntil: string | null;
  distanceBasis: string;
  taxPresentation: "included" | "additional" | "unconfirmed";
}

/** Supplier worksheet for a regional private-hire service. Prices are per vehicle. */
export interface RegionalFare {
  id: string;
  service: "one-way" | "local" | "outstation" | "daily" | "whole-trip";
  label: string;
  basis: "fixed" | "hours-km" | "per-km" | "per-day" | "whole-trip";
  vehicleId: string;
  seasonId: string;
  amount: number | null;
  includedHours?: number | null;
  includedKm?: number | null;
  extraHour?: number | null;
  extraKm?: number | null;
  minKmPerDay?: number | null;
  tripType?: "round-trip" | "one-way";
  minimumRule?: "pooled" | "daily" | "none";
  routeScope: string;
  from?: string;
  to?: string;
  routeId?: string;
  allowedRouteIds?: string[];
  packageId?: string;
  minDays?: number;
  driverAllowancePerDay?: number | null;
  additionalGarageKm?: number;
  additionalReturnKm?: number;
  billableDayMethod?: "calendar" | "24-hour";
  distanceRounding?: "whole-km" | "exact";
  crossSeasonPolicy?: "pickup" | "split";
  includedWaitingMinutes?: number;
  waitingRatePerHour?: number | null;
  timeIncrementMinutes?: number;
  includedStops?: number;
  extraStop?: number | null;
  chargeExcessBoth?: boolean;
  includedDays?: number;
  dutyHoursPerDay?: number;
  extraDayRate?: number | null;
  carryUnusedUsage?: boolean;
  fuelIncluded?: boolean;
  driverIncluded?: boolean;
  taxProfileId?: string;
  taxPresentation?: "included" | "additional";
}

export interface RegionalRoute { id: string; name: string; from: string; to: string; areaId: string; }
export interface RegionalPackage { id: string; name: string; hours: number; km: number; sharedExcess?: boolean; }
export interface RegionalTaxProfile { id: string; name: string; rate: number; approved: boolean; }
export interface RegionalAdjustment {
  id: string;
  name: string;
  trigger: "weekend" | "dates";
  dates: string[];
  startDate?: string;
  endDate?: string;
  vehicleIds?: string[];
  valueType?: "fixed" | "percent" | "replacement";
  fareIds: string[];
  methods?: RegionalFare["service"][];
  seasonIds?: string[];
  amount: number;
  treatment: "additional" | "unavailable";
  stacking: "combine" | "replace";
}

export interface RegionalTransportTariff {
  schemaVersion?: number;
  coverage: string;
  startingHub?: string;
  source: string;
  sourceDocument?: string;
  sourceStatus: "illustrative" | "supplier-confirmed";
  taxPresentation: "included" | "additional" | "unconfirmed";
  timezone: string;
  seasons: { id: string; name: string; start: string; end: string }[];
  enabledMethods?: RegionalFare["service"][];
  operatingAreas?: { id: string; name: string }[];
  activeAreaIds?: string[];
  routes?: RegionalRoute[];
  localPackages?: RegionalPackage[];
  taxProfiles?: RegionalTaxProfile[];
  adjustments?: RegionalAdjustment[];
  vehicles: TransportOffering[];
  fares: RegionalFare[];
  charges: TransportCharge[];
  distanceBasis: string;
  availability: "not-held" | "held" | "confirmed";
}

export interface RateCardDetail {
  id: string;
  name: string;
  ref: string;
  vendor: string;
  property: string;
  service: string;
  currency: string;
  validity: string;
  state: string;
  tone: CardTone;
  ready: string;
  readyTone: CardTone;
  taxConfirmed: boolean;
  /** Global selling markup on this rate card, as a percentage */
  markupPercent: number;
  mealBasis: string;
  mealLabel: string;
  hasWeekendExtra?: boolean;
  meals: MealPlan[];
  rooms: Room[];
  /** [room][meal][season] */
  prices: (number | null)[][][];
  weekendExtra?: (number | null)[][];
  seasons: Season[];
  guests: GuestRule[];
  guestNote?: string;
  supplements: Supplement[];
  services: ServiceRow[];
  activities: ActivityRow[];
  rules: [string, string, string, string, CardTone][];
  cancel: CancelRow[];
  policies: PolicyRow[];
  activity: ActivityEvent[];
  notes: RateCardNote[];
  catLabels?: Partial<Record<string, string>>;
  transport?: TransportTariff;
  regionalTransport?: RegionalTransportTariff;
}

export const TEMPLATES = [
  {
    id: "hotel",
    label: "Accommodation",
    enabled: true,
    blurb: "Hotels, resorts, houseboats and villas priced per night.",
    detail: "Season × meal plan price matrix, per-night quoting.",
  },
  {
    id: "flight",
    label: "Flight",
    enabled: false,
    blurb: "Air tickets issued outside Paryatech, with the agency’s own fees carded here.",
    detail: "Travel period × passenger type, fare captured as an actual at booking.",
  },
  {
    id: "trip",
    label: "Trip",
    enabled: false,
    blurb: "DMC FIT packages with a contracted per-person rate and a named itinerary.",
    detail: "Departure window × occupancy slab, per-person quoting.",
  },
  {
    id: "visa",
    label: "Visa",
    enabled: true,
    blurb: "Visa service fees from a processing partner — not a hotel grid and not a case file.",
    detail: "Destination × nationality × apply-from × category × applicant × processing tier.",
  },
  {
    id: "cruise",
    label: "Cruise",
    enabled: false,
    blurb: "Sailings priced per cabin grade and berth occupancy, with port charges.",
    detail: "Sailing date × cabin grade × occupancy, per-cabin quoting.",
  },
  {
    id: "transport",
    label: "Transport",
    enabled: true,
    blurb: "Vehicles on point-to-point routes, hourly hire or per-day disposal.",
    detail: "Journey date × vehicle class × route, per-vehicle quoting.",
  },
] as const;

export const DEFAULT_ACTIVITIES: ActivityRow[] = [
  {
    name: "Sunrise kayak",
    note: "Experience · 06:30 · 2 hrs",
    group: "1A min · max 6",
    basis: "Per person",
    amount: 1800,
  },
  {
    name: "Guided reef walk",
    note: "Experience · 08:00 · 3 hrs",
    group: "2A min · max 10",
    basis: "Per person",
    amount: 2400,
  },
  {
    name: "Sunset cruise",
    note: "Experience · 17:30 · 2 hrs",
    group: "2A min · max 12",
    basis: "Per person",
    amount: 3200,
  },
];

export const TEST_DATES: [string, number][] = [
  ["20 Sep 2026", 0],
  ["21 Sep 2026", 0],
  ["05 Oct 2026", 1],
  ["12 Oct 2026", 1],
  ["02 Nov 2026", 1],
  ["15 Nov 2026", 1],
  ["10 Dec 2026", 1],
  ["22 Dec 2026", 2],
  ["24 Dec 2026", 2],
  ["31 Dec 2026", 2],
];

/** Calendar season index per night for each card */
export const TEST_CAL: Record<string, [number, string][]> = {
  "rc-acc-2627": [
    [0, "Low"],
    [0, "Low"],
    [1, "Shoulder"],
    [1, "Shoulder"],
    [1, "Shoulder"],
    [1, "Shoulder"],
    [1, "Shoulder"],
    [2, "Peak"],
    [2, "Peak"],
    [2, "Peak"],
  ],
  "rc-hill-2627": [
    [0, "Off season"],
    [0, "Off season"],
    [1, "Season"],
    [1, "Season"],
    [1, "Season"],
    [1, "Season"],
    [1, "Season"],
    [-1, "Unpriced"],
    [-1, "Unpriced"],
    [-1, "Unpriced"],
  ],
  "rc-visa-uae": [
    [0, "Current"],
    [0, "Current"],
    [0, "Current"],
    [0, "Current"],
    [0, "Current"],
    [1, "Announced"],
    [1, "Announced"],
    [1, "Announced"],
    [1, "Announced"],
    [1, "Announced"],
  ],
};
