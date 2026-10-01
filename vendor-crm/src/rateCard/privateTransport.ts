import { approvedSupplierTaxProfile, approvedSupplierTaxRate, readSupplierTaxProfiles, type SupplierTaxProfile } from "./supplierTax.ts";

export type PrivateTransportTemplate = "fixed-transfer" | "local-package" | "outstation-km" | "daily-hire";
export type PrivateTransportStatus = "Draft" | "Review" | "Active";

/** A vehicle is owned by a vendor's service offering, never by a rate card. */
export interface VehicleOffering {
  id: string;
  vendorId: string;
  serviceIds: string[];
  label: string;
  category: string;
  model: string;
  passengerSeats: number | null;
  mediumBags: number | null;
  largeBags?: number | null;
  cabinBags?: number | null;
  /** Vendor-confirmed combined luggage allowance, in medium-bag equivalents. */
  combinedBagUnits?: number | null;
  airConditioned: boolean;
  attributes?: string[];
}

export interface PrivateTransportCharge {
  id: string;
  name: string;
  appliesTo: string;
  treatment: "included" | "fixed" | "actual" | "not-applicable" | "unconfirmed";
  amount: number | null;
  chargedPer: "hire" | "vehicle" | "day" | "night" | "hour" | "km";
  trigger: "always" | "night-pickup" | "waiting-over" | "distance-over";
  triggerStart?: string;
  triggerEnd?: string;
  includedWaitingMinutes?: number;
  waitingIncrementMinutes?: number;
  includedKm?: number;
  routeIds?: string[];
  vehicleIds?: string[];
  /** Whether this cost is payable to the supplier or directly by the customer. */
  paidBy?: "agency" | "customer";
  collectedBy?: "supplier" | "driver" | "third-party";
}

export interface PrivateTransportTariff {
  schemaVersion: 1;
  template: PrivateTransportTemplate;
  vendorId: string;
  serviceId: string;
  vehicleIds: string[];
  coverageAreas?: string[];
  requiredChargeNames?: string[];
  validFrom: string;
  validTo: string;
  sourceDocument: string;
  sourceConfirmed: boolean;
  illustrative?: boolean;
  status: PrivateTransportStatus;
  version: number;
  taxMode: "inclusive" | "exclusive" | null;
  taxProfileId: string | null;
  routes: Array<{ id: string; from: string; to: string; prices: Record<string, number | null> }>;
  packages: Array<{ id: string; name: string; hours: number; km: number }>;
  packagePrices: Record<string, Record<string, number | null>>;
  outstationPrices: Record<string, { ratePerKm: number | null; minKmPerDay: number | null; driverPerDay: number | null }>;
  dailyPrices: Record<string, { pricePerDay: number | null; includedKmPerDay: number | null; includedHoursPerDay: number | null }>;
  excessPrices: Record<string, { extraKm: number | null; extraHour: number | null }>;
  rules: {
    minimumMethod: "pooled" | "daily" | "none" | null;
    dailyExtraKmTreatment?: "within-minimum" | "after-minimum" | null;
    distanceBasis: string;
    billableDayMethod: "calendar" | "24-hour" | null;
    timezone: string;
    garageKm: number | null;
    emptyReturnKm: number | null;
    roundKmUp: boolean;
    fuelIncluded: boolean | null;
    carryUnusedKm: boolean | null;
    carryUnusedHours: boolean | null;
    excessMethod: "both" | "higher" | "km-only" | "hour-only" | null;
  };
  charges: PrivateTransportCharge[];
}

export const TRANSPORT_TEMPLATE_LABELS: Record<PrivateTransportTemplate, string> = {
  "fixed-transfer": "Fixed transfer",
  "local-package": "Local package",
  "outstation-km": "Outstation per km",
  "daily-hire": "Daily hire",
};

export function validatePrivateTransportTariff(tariff: PrivateTransportTariff, taxProfiles: SupplierTaxProfile[] = readSupplierTaxProfiles()): string[] {
  const issues: string[] = [];
  if (tariff.illustrative) issues.push("Replace the illustrative prices with a vendor-confirmed tariff.");
  if (!tariff.sourceConfirmed) issues.push("Verify the tariff with the vendor.");
  if (!tariff.validFrom || !tariff.validTo || tariff.validFrom > tariff.validTo) issues.push("Enter a valid date range.");
  if (!tariff.vehicleIds.length) issues.push("Select at least one vehicle offering.");
  if (tariff.template !== "fixed-transfer" && !tariff.coverageAreas?.length) issues.push("Record the service's operating areas.");
  if (!tariff.taxMode) issues.push("Select the supplier tax mode.");
  if (tariff.taxMode && approvedSupplierTaxRate(taxProfiles, tariff.taxProfileId) == null) issues.push("Select an approved supplier tax profile.");
  if (tariff.taxMode && approvedSupplierTaxProfile(taxProfiles, tariff.taxProfileId)?.recoverable == null) issues.push("Confirm the supplier tax credit treatment in Finance.");
  if (missingRequiredChargeTreatments(tariff).length) issues.push("Set each required charge's treatment for every route and vehicle.");
  if (conflictingChargeTreatments(tariff).length) issues.push("Remove overlapping treatments for the same charge, route and vehicle.");
  if (tariff.template === "fixed-transfer" && tariff.charges.some((charge) => charge.appliesTo !== "All routes" && !charge.routeIds?.length)) issues.push("Select the routes for each scoped charge.");
  if (tariff.template === "fixed-transfer" && (!tariff.routes.length || tariff.routes.some((route) => !route.from.trim() || !route.to.trim() || tariff.vehicleIds.some((id) => !present(route.prices[id]))))) issues.push("Complete each route and vehicle price.");
  if (tariff.template === "local-package" && (
    !tariff.packages.length ||
    tariff.packages.some((pkg) => !pkg.name.trim() || pkg.hours <= 0 || pkg.km < 0) ||
    tariff.rules.excessMethod == null ||
    tariff.vehicleIds.some((id) =>
      tariff.packages.some((pkg) => !present(tariff.packagePrices[id]?.[pkg.id])) ||
      !present(tariff.excessPrices[id]?.extraKm) ||
      !present(tariff.excessPrices[id]?.extraHour)
    )
  )) issues.push("Complete package prices and excess rates.");
  if (tariff.template === "outstation-km" && (tariff.vehicleIds.some((id) => !present(tariff.outstationPrices[id]?.ratePerKm) || !present(tariff.outstationPrices[id]?.driverPerDay) || tariff.rules.minimumMethod !== "none" && !present(tariff.outstationPrices[id]?.minKmPerDay)) || !tariff.rules.distanceBasis.trim() || !present(tariff.rules.garageKm) || !present(tariff.rules.emptyReturnKm))) issues.push("Complete outstation rates and shared pricing rules.");
  if (tariff.template === "outstation-km" && (!tariff.rules.minimumMethod || !tariff.rules.billableDayMethod || !tariff.rules.timezone.trim() || tariff.rules.fuelIncluded == null)) issues.push("Confirm minimum, billable-day, timezone and fuel rules.");
  if (tariff.template === "outstation-km" && tariff.rules.minimumMethod === "daily" && ((tariff.rules.garageKm ?? 0) > 0 || (tariff.rules.emptyReturnKm ?? 0) > 0) && !tariff.rules.dailyExtraKmTreatment) issues.push("Confirm how garage and empty-return kilometres count against each daily minimum.");
  if (tariff.template === "outstation-km" && tariff.rules.fuelIncluded === false && !tariff.charges.some((charge) => /fuel/i.test(charge.name) && (charge.treatment === "fixed" || charge.treatment === "actual"))) issues.push("Record the supplier's separate fuel charge.");
  if (tariff.template === "daily-hire" && tariff.vehicleIds.some((id) => !present(tariff.dailyPrices[id]?.pricePerDay) || !present(tariff.dailyPrices[id]?.includedKmPerDay) || !present(tariff.dailyPrices[id]?.includedHoursPerDay) || !present(tariff.excessPrices[id]?.extraKm) || !present(tariff.excessPrices[id]?.extraHour))) issues.push("Complete daily rates and excess usage.");
  if (tariff.template === "daily-hire" && (!tariff.rules.billableDayMethod || !tariff.rules.timezone.trim() || tariff.rules.carryUnusedKm == null || tariff.rules.carryUnusedHours == null)) issues.push("Confirm billable-day, timezone and carry-forward rules.");
  if (tariff.charges.some((charge) => !charge.name.trim() || charge.treatment === "fixed" && !present(charge.amount) || charge.treatment === "unconfirmed")) issues.push("Resolve every additional charge.");
  if (tariff.charges.some((charge) => charge.trigger === "waiting-over" && (!present(charge.includedWaitingMinutes) || !present(charge.waitingIncrementMinutes) || charge.waitingIncrementMinutes === 0) || charge.trigger === "distance-over" && !present(charge.includedKm))) issues.push("Complete additional-charge trigger limits.");
  if (tariff.charges.some((charge) => charge.trigger === "night-pickup" && (!validTime(charge.triggerStart) || !validTime(charge.triggerEnd)))) issues.push("Enter the vendor's night-charge start and end times.");
  return issues;
}

export interface PrivateTransportTrip {
  date: string;
  endDate?: string;
  pickupTime: string;
  dropTime?: string;
  pickup: string;
  drop: string;
  routeId: string;
  packageId: string;
  vehicleId: string;
  vehicleAllocations?: Array<{ vehicleId: string; quantity: number }>;
  travellers: number;
  guideSeats: number;
  mediumBags: number;
  largeBags?: number;
  cabinBags?: number;
  acRequired?: boolean;
  vehicleCount: number;
  plannedKm: number;
  plannedHours: number;
  waitingMinutes: number;
  billableDays: number;
  dailyKm: number[];
  dailyHours: number[];
  /** Amounts verified at Booking; absent values remain payable at actuals. */
  actualChargeAmounts?: Record<string, number>;
}

const bagUnits = (trip: PrivateTransportTrip) => trip.mediumBags + (trip.largeBags ?? 0) * 2 + (trip.cabinBags ?? 0) * 0.5;

const chargeCovers = (charge: PrivateTransportCharge, routeId: string, vehicleId: string) =>
  (!charge.routeIds?.length || charge.routeIds.includes(routeId)) && (!charge.vehicleIds?.length || charge.vehicleIds.includes(vehicleId));

/** Every required charge needs an explicit treatment for each priced route and vehicle. */
export function missingRequiredChargeTreatments(tariff: PrivateTransportTariff, routeId?: string, vehicleId?: string): string[] {
  const routes = tariff.template === "fixed-transfer" ? (routeId ? [routeId] : tariff.routes.map((route) => route.id)) : [""];
  const vehicles = vehicleId ? [vehicleId] : tariff.vehicleIds;
  return (tariff.requiredChargeNames ?? []).flatMap((name) => routes.flatMap((route) => vehicles.flatMap((vehicle) =>
    tariff.charges.some((charge) => charge.name.trim().toLowerCase() === name.trim().toLowerCase() && chargeCovers(charge, route, vehicle)) ? [] : [`${name}${route ? ` · ${route}` : ""} · ${vehicle}`]
  )));
}

/** Two rules for the same required charge must not both price one vehicle and route. */
export function conflictingChargeTreatments(tariff: PrivateTransportTariff, routeId?: string, vehicleId?: string): string[] {
  const routes = tariff.template === "fixed-transfer" ? (routeId ? [routeId] : tariff.routes.map((route) => route.id)) : [""];
  const vehicles = vehicleId ? [vehicleId] : tariff.vehicleIds;
  return (tariff.requiredChargeNames ?? []).flatMap((name) => routes.flatMap((route) => vehicles.flatMap((vehicle) =>
    tariff.charges.filter((charge) => charge.name.trim().toLowerCase() === name.trim().toLowerCase() && chargeCovers(charge, route, vehicle)).length > 1
      ? [`${name}: ${route || "all routes"} / ${vehicle}`] : []
  )));
}

export function initialPrivateTransportTrip(tariff: PrivateTransportTariff, date = "", travellers = 0): PrivateTransportTrip {
  const route = tariff.routes[0];
  return {
    date, pickupTime: "10:00", pickup: route?.from ?? tariff.coverageAreas?.[0] ?? "", drop: route?.to ?? tariff.coverageAreas?.[0] ?? "",
    routeId: route?.id ?? "", packageId: tariff.packages[0]?.id ?? "", vehicleId: tariff.vehicleIds[0] ?? "",
    vehicleAllocations: tariff.vehicleIds[0] ? [{ vehicleId: tariff.vehicleIds[0], quantity: 1 }] : [],
    travellers, guideSeats: 0, mediumBags: 0, largeBags: 0, cabinBags: 0, acRequired: true, vehicleCount: 1,
    plannedKm: 0, plannedHours: 0, waitingMinutes: 0, billableDays: 1, dailyKm: [], dailyHours: [],
  };
}

export interface PrivateTransportQuote {
  base: number | null;
  driver: number | null;
  excess: number | null;
  fixedExtras: number | null;
  commercialAmount: number | null;
  supplierTax: number | null;
  supplierPayable: number | null;
  /** Agency cost basis after Finance's input-tax-credit treatment. */
  costBasis?: number | null;
  billableKm: number | null;
  vehicleLines?: Array<{ vehicleId: string; quantity: number; base: number | null; driver: number | null; excess: number | null; fixedExtras: number | null }>;
  actualCharges: string[];
  verifiedActuals?: number;
  blockers: string[];
  quoteBasis: "unpriced" | "base-plus-actuals" | "fixed";
}

const present = (value: number | null | undefined): value is number => value != null && Number.isFinite(value) && value >= 0;
const validTime = (value: string | undefined) => Boolean(value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value));

/** Date/time fields are entered in the rate card's local timezone. */
export function resolvePrivateTransportDays(tariff: PrivateTransportTariff, trip: PrivateTransportTrip): number | null {
  if (tariff.template === "fixed-transfer" || tariff.template === "local-package") return 1;
  if (!trip.date || !trip.endDate || !trip.pickupTime || !trip.dropTime || !tariff.rules.billableDayMethod || !tariff.rules.timezone.trim()) return null;
  const start = Date.parse(`${trip.date}T${trip.pickupTime}:00Z`);
  const end = Date.parse(`${trip.endDate}T${trip.dropTime}:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return tariff.rules.billableDayMethod === "calendar"
    ? Math.floor((Date.parse(`${trip.endDate}T00:00:00Z`) - Date.parse(`${trip.date}T00:00:00Z`)) / 86400000) + 1
    : Math.ceil((end - start) / 86400000);
}

const matchesArea = (place: string, areas: string[]) => areas.some((area) => place.toLocaleLowerCase().includes(area.toLocaleLowerCase()));

export function vehicleSuitability(vehicle: VehicleOffering, trip: PrivateTransportTrip, quantity = 1): string[] {
  const issues: string[] = [];
  const requiredSeats = trip.travellers + trip.guideSeats;
  if (!present(vehicle.passengerSeats) || vehicle.passengerSeats * quantity < requiredSeats) issues.push("passenger seats");
  if (!present(vehicle.mediumBags) || vehicle.mediumBags * quantity < trip.mediumBags) issues.push("medium bags");
  if (trip.largeBags && (!present(vehicle.largeBags) || vehicle.largeBags * quantity < trip.largeBags)) issues.push("large bags");
  if (trip.cabinBags && (!present(vehicle.cabinBags) || vehicle.cabinBags * quantity < trip.cabinBags)) issues.push("cabin bags");
  if (bagUnits(trip) > 0 && (!present(vehicle.combinedBagUnits) || vehicle.combinedBagUnits * quantity < bagUnits(trip))) issues.push("combined luggage");
  if (trip.acRequired && !vehicle.airConditioned) issues.push("air conditioning");
  return issues;
}

/** Candidate arrangements are suggestions; staff chooses the final fleet. */
export function suggestVehicleArrangements(vehicles: VehicleOffering[], trip: PrivateTransportTrip): Array<Array<{ vehicleId: string; quantity: number }>> {
  const eligible = vehicles.filter((vehicle) => vehicle.passengerSeats && vehicle.mediumBags != null && (!trip.acRequired || vehicle.airConditioned));
  const fits = (rows: Array<{ vehicleId: string; quantity: number }>) => {
    const total = (key: "passengerSeats" | "mediumBags" | "largeBags" | "cabinBags") => rows.reduce((sum, row) => sum + (eligible.find((vehicle) => vehicle.id === row.vehicleId)?.[key] ?? 0) * row.quantity, 0);
    const combined = rows.reduce((sum, row) => sum + (eligible.find((vehicle) => vehicle.id === row.vehicleId)?.combinedBagUnits ?? 0) * row.quantity, 0);
    return total("passengerSeats") >= trip.travellers + trip.guideSeats && total("mediumBags") >= trip.mediumBags && total("largeBags") >= (trip.largeBags ?? 0) && total("cabinBags") >= (trip.cabinBags ?? 0) && combined >= bagUnits(trip);
  };
  const suggestions: Array<Array<{ vehicleId: string; quantity: number }>> = [];
  for (const vehicle of eligible) {
    const seats = Math.ceil((trip.travellers + trip.guideSeats) / vehicle.passengerSeats!);
    const medium = vehicle.mediumBags ? Math.ceil(trip.mediumBags / vehicle.mediumBags) : trip.mediumBags ? Infinity : 0;
    const large = vehicle.largeBags ? Math.ceil((trip.largeBags ?? 0) / vehicle.largeBags) : trip.largeBags ? Infinity : 0;
    const cabin = vehicle.cabinBags ? Math.ceil((trip.cabinBags ?? 0) / vehicle.cabinBags) : trip.cabinBags ? Infinity : 0;
    const combined = vehicle.combinedBagUnits ? Math.ceil(bagUnits(trip) / vehicle.combinedBagUnits) : bagUnits(trip) ? Infinity : 0;
    const quantity = Math.max(1, seats, medium, large, cabin, combined);
    if (Number.isFinite(quantity) && quantity <= 8) suggestions.push([{ vehicleId: vehicle.id, quantity }]);
  }
  for (let first = 0; first < eligible.length; first++) for (let second = first + 1; second < eligible.length; second++) {
    for (let left = 1; left <= 4; left++) for (let right = 1; right <= 4; right++) {
      const arrangement = [{ vehicleId: eligible[first].id, quantity: left }, { vehicleId: eligible[second].id, quantity: right }];
      if (fits(arrangement) && !fits([{ vehicleId: eligible[first].id, quantity: left - 1 }, arrangement[1]]) && !fits([arrangement[0], { vehicleId: eligible[second].id, quantity: right - 1 }])) suggestions.push(arrangement);
    }
  }
  return suggestions.sort((a, b) => a.reduce((sum, row) => sum + row.quantity, 0) - b.reduce((sum, row) => sum + row.quantity, 0)).slice(0, 24);
}

export function localPackageOptions(tariff: PrivateTransportTariff, trip: PrivateTransportTrip): Array<{ id: string; name: string; amount: number; extraKm: number; extraHours: number }> {
  if (tariff.template !== "local-package") return [];
  const allocations = trip.vehicleAllocations?.length ? trip.vehicleAllocations : [{ vehicleId: trip.vehicleId, quantity: trip.vehicleCount }];
  return tariff.packages.flatMap((pkg) => {
    const extraKm = Math.max(0, trip.plannedKm - pkg.km);
    const extraHours = Math.max(0, trip.plannedHours - pkg.hours);
    let amount = 0;
    for (const { vehicleId, quantity } of allocations) {
      const base = tariff.packagePrices[vehicleId]?.[pkg.id];
      const rates = tariff.excessPrices[vehicleId];
      if (!present(base) || !present(rates?.extraKm) || !present(rates?.extraHour) || !tariff.rules.excessMethod) return [];
      const kmCost = extraKm * rates.extraKm;
      const hourCost = extraHours * rates.extraHour;
      const excess = tariff.rules.excessMethod === "higher" ? Math.max(kmCost, hourCost) : tariff.rules.excessMethod === "km-only" ? kmCost : tariff.rules.excessMethod === "hour-only" ? hourCost : kmCost + hourCost;
      amount += quantity * (base + excess);
    }
    return [{ id: pkg.id, name: pkg.name, amount, extraKm, extraHours }];
  }).sort((a, b) => a.amount - b.amount);
}

/** Shared commercial calculation used by Test Rate and future Proposal costing. */
export function calculatePrivateTransportQuote(tariff: PrivateTransportTariff, offerings: VehicleOffering[], trip: PrivateTransportTrip, taxProfiles: SupplierTaxProfile[] = []): PrivateTransportQuote {
  if (!trip.vehicleAllocations) return withVerifiedActuals(tariff, trip, calculateSingleVehicleQuote(tariff, offerings, trip, null, taxProfiles));

  const blockers: string[] = [];
  const quantities = new Map<string, number>();
  for (const allocation of trip.vehicleAllocations) {
    if (!allocation.vehicleId || !Number.isInteger(allocation.quantity) || allocation.quantity < 1) blockers.push("Select a vehicle and enter a valid quantity for each row.");
    else quantities.set(allocation.vehicleId, (quantities.get(allocation.vehicleId) ?? 0) + allocation.quantity);
  }
  if (quantities.size === 0) blockers.push("Add at least one vehicle.");

  let passengerSeats = 0;
  let luggageBags = 0;
  let largeBags = 0;
  let cabinBags = 0;
  let combinedBagUnits = 0;
  let acSuitable = true;
  for (const [vehicleId, quantity] of quantities) {
    const offering = offerings.find((item) => item.id === vehicleId && item.vendorId === tariff.vendorId && item.serviceIds.includes(tariff.serviceId));
    if (!offering || !tariff.vehicleIds.includes(vehicleId) || !present(offering.passengerSeats) || !present(offering.mediumBags)) {
      blockers.push("A selected vehicle is unavailable or its capacity is unconfirmed.");
      continue;
    }
    passengerSeats += offering.passengerSeats * quantity;
    luggageBags += offering.mediumBags * quantity;
    largeBags += (offering.largeBags ?? 0) * quantity;
    cabinBags += (offering.cabinBags ?? 0) * quantity;
    combinedBagUnits += (offering.combinedBagUnits ?? 0) * quantity;
    if (trip.acRequired && !offering.airConditioned) acSuitable = false;
  }
  if (!Number.isInteger(trip.travellers) || trip.travellers < 1 || !Number.isInteger(trip.guideSeats) || trip.guideSeats < 0 || !Number.isInteger(trip.mediumBags) || trip.mediumBags < 0 || !Number.isInteger(trip.largeBags ?? 0) || (trip.largeBags ?? 0) < 0 || !Number.isInteger(trip.cabinBags ?? 0) || (trip.cabinBags ?? 0) < 0) blockers.push("Enter valid traveller and luggage counts.");
  else if (passengerSeats < trip.travellers + trip.guideSeats || luggageBags < trip.mediumBags || largeBags < (trip.largeBags ?? 0) || cabinBags < (trip.cabinBags ?? 0) || combinedBagUnits < bagUnits(trip) || !acSuitable) blockers.push("Selected vehicles do not fit the travellers, combined luggage or AC preference.");

  const selectedVehicles = [...quantities];
  const quotes = selectedVehicles.map(([vehicleId, quantity], index) => {
    const hireChargeIds = new Set(tariff.charges.filter((charge) => charge.chargedPer === "hire" && (!charge.vehicleIds?.length || charge.vehicleIds.includes(vehicleId)) && !selectedVehicles.slice(0, index).some(([earlierId]) => !charge.vehicleIds?.length || charge.vehicleIds.includes(earlierId))).map((charge) => charge.id));
    return calculateSingleVehicleQuote(tariff, offerings, {
      ...trip, vehicleAllocations: undefined, vehicleId, vehicleCount: quantity,
      travellers: 1, guideSeats: 0, mediumBags: 0, largeBags: 0, cabinBags: 0,
    }, hireChargeIds, taxProfiles);
  });
  const allBlockers = [...new Set([...blockers, ...quotes.flatMap((quote) => quote.blockers)])];
  const sum = (field: "base" | "driver" | "excess" | "fixedExtras" | "commercialAmount" | "supplierTax" | "supplierPayable" | "costBasis") =>
    blockers.length || quotes.length === 0 || quotes.some((quote) => quote[field] == null) ? null : quotes.reduce((total, quote) => total + quote[field]!, 0);
  const commercialAmount = sum("commercialAmount");
  const actualCharges = [...new Set(quotes.flatMap((quote) => quote.actualCharges))];
  const kilometres = quotes.map((quote) => quote.billableKm);
  return withVerifiedActuals(tariff, trip, {
    base: sum("base"), driver: sum("driver"), excess: sum("excess"), fixedExtras: sum("fixedExtras"),
    commercialAmount, supplierTax: sum("supplierTax"), supplierPayable: sum("supplierPayable"), costBasis: sum("costBasis"),
    billableKm: kilometres.every((km) => km === kilometres[0]) ? kilometres[0] ?? null : null,
    vehicleLines: selectedVehicles.map(([vehicleId, quantity], index) => ({ vehicleId, quantity, base: quotes[index].base, driver: quotes[index].driver, excess: quotes[index].excess, fixedExtras: quotes[index].fixedExtras })),
    actualCharges, blockers: allBlockers,
    quoteBasis: commercialAmount == null ? "unpriced" : actualCharges.length ? "base-plus-actuals" : sum("supplierPayable") == null ? "unpriced" : "fixed",
  });
}

/** Booking enters confirmed, tax-inclusive supplier invoice amounts for each Actual charge. */
function withVerifiedActuals(tariff: PrivateTransportTariff, trip: PrivateTransportTrip, quote: PrivateTransportQuote): PrivateTransportQuote {
  const applicable = tariff.charges.filter((charge) => charge.treatment === "actual" && quote.actualCharges.includes(charge.name) &&
    (!charge.routeIds?.length || charge.routeIds.includes(trip.routeId)) &&
    (!charge.vehicleIds?.length || (trip.vehicleAllocations?.length ? trip.vehicleAllocations.some((row) => charge.vehicleIds!.includes(row.vehicleId)) : charge.vehicleIds.includes(trip.vehicleId))));
  const amounts = applicable.map((charge) => trip.actualChargeAmounts?.[charge.id]);
  const complete = applicable.length > 0 && amounts.every(present);
  const verifiedActuals = complete ? amounts.reduce((sum, amount) => sum + amount!, 0) : 0;
  const pending = applicable.some((charge) => !present(trip.actualChargeAmounts?.[charge.id]));
  const customerPaid = applicable.some((charge) => charge.paidBy === "customer");
  const supplierPayable = !pending && !customerPaid && quote.blockers.length === 0 && quote.commercialAmount != null && quote.actualCharges.length
    ? tariff.taxMode === "inclusive" ? quote.commercialAmount + verifiedActuals : quote.supplierTax == null ? null : quote.commercialAmount + quote.supplierTax + verifiedActuals
    : quote.supplierPayable;
  return { ...quote, verifiedActuals, supplierPayable, costBasis: quote.costBasis == null ? null : quote.costBasis + verifiedActuals,
    quoteBasis: quote.commercialAmount == null ? "unpriced" : quote.actualCharges.length && (pending || customerPaid) ? "base-plus-actuals" : supplierPayable == null ? "unpriced" : "fixed" };
}

function calculateSingleVehicleQuote(tariff: PrivateTransportTariff, offerings: VehicleOffering[], trip: PrivateTransportTrip, hireChargeIds: Set<string> | null, taxProfiles: SupplierTaxProfile[]): PrivateTransportQuote {
  const blockers: string[] = [];
  const vehicle = offerings.find((item) => item.id === trip.vehicleId && item.vendorId === tariff.vendorId && item.serviceIds.includes(tariff.serviceId));
  if (!vehicle || !tariff.vehicleIds.includes(trip.vehicleId)) blockers.push("Select a vehicle offered for this service.");
  if (!trip.date || trip.date < tariff.validFrom || trip.date > tariff.validTo) blockers.push("Travel date is outside rate-card validity.");
  if (!trip.pickup.trim() || !trip.drop.trim()) blockers.push("Enter pickup and final drop.");
  if (missingRequiredChargeTreatments(tariff, trip.routeId, trip.vehicleId).length) blockers.push("A required supplier charge has no treatment for this route and vehicle.");
  if (conflictingChargeTreatments(tariff, trip.routeId, trip.vehicleId).length) blockers.push("The same supplier charge has overlapping treatments for this route and vehicle.");
  if (tariff.template === "fixed-transfer" && tariff.charges.some((charge) => charge.appliesTo !== "All routes" && !charge.routeIds?.length)) blockers.push("An additional charge needs its applicable routes.");
  if (trip.travellers < 1 || trip.vehicleCount < 1) blockers.push("Enter travellers and vehicle quantity.");
  if (!vehicle || !present(vehicle.passengerSeats) || vehicle.passengerSeats === 0 || !present(vehicle.mediumBags)) blockers.push("Vehicle seating or luggage allowance is unconfirmed.");
  else if (vehicleSuitability(vehicle, trip, trip.vehicleCount).length) blockers.push("Selected vehicles do not fit the travellers, luggage or AC preference.");
  if (tariff.template !== "fixed-transfer" && tariff.coverageAreas?.length && (!matchesArea(trip.pickup, tariff.coverageAreas) || !matchesArea(trip.drop, tariff.coverageAreas))) blockers.push("Pickup and drop are outside this vendor's operating area.");
  const resolvedDays = resolvePrivateTransportDays(tariff, trip);
  if (!resolvedDays) blockers.push("Enter valid service dates and times for the supplier's billable-day rule.");
  if (!Number.isInteger(trip.vehicleCount) || trip.vehicleCount < 1) blockers.push("Enter a valid vehicle quantity.");
  if (!present(trip.plannedKm) || !present(trip.plannedHours)) blockers.push("Planned kilometres and hours must be valid.");
  if (!present(trip.waitingMinutes)) blockers.push("Waiting time must be valid.");
  if (!validTime(trip.pickupTime) || trip.dropTime && !validTime(trip.dropTime)) blockers.push("Enter valid local pickup and drop times.");
  if (!tariff.taxMode) blockers.push("Supplier tax mode is unresolved.");
  if ((tariff.template === "outstation-km" || tariff.template === "daily-hire") && !tariff.rules.billableDayMethod) blockers.push("Supplier billable-day rule is unresolved.");
  if (tariff.template === "outstation-km" && tariff.rules.fuelIncluded == null) blockers.push("Supplier fuel treatment is unresolved.");
  if (tariff.template === "outstation-km" && tariff.rules.fuelIncluded === false && !tariff.charges.some((charge) => /fuel/i.test(charge.name) && (charge.treatment === "fixed" || charge.treatment === "actual"))) blockers.push("Separate fuel charge is missing.");
  const days = resolvedDays ?? 1;
  if (days > 1 && trip.date) {
    const end = new Date(`${trip.date}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + days - 1);
    if (end.toISOString().slice(0, 10) > tariff.validTo) blockers.push("Hire extends beyond this rate card's validity.");
  }
  let unitBase: number | null = null;
  let unitDriver = 0;
  let unitExcess = 0;
  let billableKm: number | null = null;
  if (tariff.template === "fixed-transfer") {
    const route = tariff.routes.find((item) => item.id === trip.routeId);
    if (!route) blockers.push("Select a defined route.");
    else {
      if (route.from.trim().toLowerCase() !== trip.pickup.trim().toLowerCase() || route.to.trim().toLowerCase() !== trip.drop.trim().toLowerCase()) blockers.push("Pickup and drop must match the saved route direction.");
      unitBase = route.prices[trip.vehicleId] ?? null;
    }
  } else if (tariff.template === "local-package") {
    if (trip.plannedHours <= 0) blockers.push("Enter planned local service hours before applying a package.");
    const pkg = tariff.packages.find((item) => item.id === trip.packageId);
    if (!pkg) blockers.push("Select a local package.");
    else {
      unitBase = tariff.packagePrices[trip.vehicleId]?.[pkg.id] ?? null;
      const extraKm = Math.max(0, trip.plannedKm - pkg.km);
      const extraHours = Math.max(0, trip.plannedHours - pkg.hours);
      const rates = tariff.excessPrices[trip.vehicleId];
      const method = tariff.rules.excessMethod;
      const needsKm = extraKm > 0 && method !== "hour-only";
      const needsHours = extraHours > 0 && method !== "km-only";
      if (!method) blockers.push("Supplier excess-usage method is unresolved.");
      if (needsKm && !present(rates?.extraKm)) blockers.push("Extra kilometre price is missing.");
      if (needsHours && !present(rates?.extraHour)) blockers.push("Extra hour price is missing.");
      if ((!needsKm || present(rates?.extraKm)) && (!needsHours || present(rates?.extraHour))) {
        const kmAmount = needsKm ? extraKm * (rates?.extraKm ?? 0) : 0;
        const hourAmount = needsHours ? extraHours * (rates?.extraHour ?? 0) : 0;
        unitExcess = method === "higher" ? Math.max(kmAmount, hourAmount) : kmAmount + hourAmount;
      }
    }
  } else if (tariff.template === "outstation-km") {
    const price = tariff.outstationPrices[trip.vehicleId];
    if (!present(trip.plannedKm) || trip.plannedKm === 0) blockers.push("Enter planned chargeable kilometres.");
    if (!present(tariff.rules.garageKm) || !present(tariff.rules.emptyReturnKm)) blockers.push("Confirm garage and empty-return kilometres.");
    if (price) {
      const journeyKm = trip.plannedKm + (tariff.rules.garageKm ?? 0) + (tariff.rules.emptyReturnKm ?? 0);
      if (tariff.rules.minimumMethod === "pooled") {
        if (!present(price.minKmPerDay)) blockers.push("Minimum kilometres per day are missing.");
        billableKm = Math.max(journeyKm, (price.minKmPerDay ?? 0) * days);
      } else if (tariff.rules.minimumMethod === "daily") {
        if (!present(price.minKmPerDay)) blockers.push("Minimum kilometres per day are missing.");
        if (trip.dailyKm.length !== days || trip.dailyKm.some((km) => !present(km)) || Math.abs(trip.dailyKm.reduce((sum, km) => sum + km, 0) - trip.plannedKm) > 0.01) blockers.push("Daily kilometres must match the planned trip distance.");
        else {
          const garageKm = tariff.rules.garageKm ?? 0;
          const returnKm = tariff.rules.emptyReturnKm ?? 0;
          const treatment = tariff.rules.dailyExtraKmTreatment;
          if ((garageKm || returnKm) && !treatment) blockers.push("Confirm whether garage and empty-return kilometres are inside or after the daily minimum.");
          else {
            const chargeableDays = [...trip.dailyKm];
            if (treatment === "within-minimum") {
              chargeableDays[0] += garageKm;
              chargeableDays[chargeableDays.length - 1] += returnKm;
            }
            billableKm = chargeableDays.reduce((sum, km) => sum + Math.max(km, price.minKmPerDay ?? 0), 0)
              + (treatment === "after-minimum" ? garageKm + returnKm : 0);
          }
        }
      } else if (tariff.rules.minimumMethod === "none") billableKm = journeyKm;
      else blockers.push("Supplier minimum kilometre rule is unresolved.");
      if (billableKm != null && tariff.rules.roundKmUp) billableKm = Math.ceil(billableKm);
      if (present(price.ratePerKm) && billableKm != null) unitBase = billableKm * price.ratePerKm;
      if (!present(price.driverPerDay)) blockers.push("Driver allowance per day is missing.");
      else unitDriver = price.driverPerDay * days;
    }
  } else {
    if (trip.plannedHours <= 0) blockers.push("Enter planned hire hours before applying the daily tariff.");
    const price = tariff.dailyPrices[trip.vehicleId];
    if (tariff.rules.carryUnusedKm == null || tariff.rules.carryUnusedHours == null) blockers.push("Supplier carry-forward rule is unresolved.");
    if (price && present(price.pricePerDay)) unitBase = price.pricePerDay * days;
    if (price && present(price.includedKmPerDay) && present(price.includedHoursPerDay)) {
      if (days > 1 && !tariff.rules.carryUnusedKm && (trip.dailyKm.length !== days || trip.dailyKm.some((km) => !present(km)) || Math.abs(trip.dailyKm.reduce((sum, km) => sum + km, 0) - trip.plannedKm) > 0.01)) blockers.push("Daily kilometres must match the planned trip distance.");
      if (days > 1 && !tariff.rules.carryUnusedHours && (trip.dailyHours.length !== days || trip.dailyHours.some((hours) => !present(hours)) || Math.abs(trip.dailyHours.reduce((sum, hours) => sum + hours, 0) - trip.plannedHours) > 0.01)) blockers.push("Daily hours must match the planned trip duration.");
      const extraKm = tariff.rules.carryUnusedKm ? Math.max(0, trip.plannedKm - price.includedKmPerDay * days) : trip.dailyKm.length === days ? trip.dailyKm.reduce((sum, km) => sum + Math.max(0, km - price.includedKmPerDay!), 0) : Math.max(0, trip.plannedKm - price.includedKmPerDay);
      const extraHours = tariff.rules.carryUnusedHours ? Math.max(0, trip.plannedHours - price.includedHoursPerDay * days) : trip.dailyHours.length === days ? trip.dailyHours.reduce((sum, hours) => sum + Math.max(0, hours - price.includedHoursPerDay!), 0) : Math.max(0, trip.plannedHours - price.includedHoursPerDay);
      const rates = tariff.excessPrices[trip.vehicleId];
      if (extraKm && !present(rates?.extraKm)) blockers.push("Extra kilometre price is missing.");
      if (extraHours && !present(rates?.extraHour)) blockers.push("Extra hour price is missing.");
      if ((!extraKm || present(rates?.extraKm)) && (!extraHours || present(rates?.extraHour))) unitExcess = extraKm * (rates?.extraKm ?? 0) + extraHours * (rates?.extraHour ?? 0);
    } else blockers.push("Daily included usage is incomplete.");
  }
  if (unitBase == null) blockers.push("The selected vehicle has no supplier price.");
  if (!tariff.sourceConfirmed || tariff.illustrative) blockers.push("Tariff needs vendor verification.");
  if (tariff.status !== "Active") blockers.push("Only an Active rate card can be reused in Proposal.");
  const applicable = tariff.charges.filter((charge) => {
    if (charge.chargedPer === "hire" && hireChargeIds && !hireChargeIds.has(charge.id)) return false;
    if (charge.routeIds?.length && !charge.routeIds.includes(trip.routeId)) return false;
    if (charge.vehicleIds?.length && !charge.vehicleIds.includes(trip.vehicleId)) return false;
    if (charge.trigger === "waiting-over") {
      if (!present(charge.includedWaitingMinutes)) { blockers.push(`${charge.name}: included waiting time is missing.`); return false; }
      return trip.waitingMinutes > charge.includedWaitingMinutes;
    }
    if (charge.trigger === "distance-over") {
      if (!present(charge.includedKm)) { blockers.push(`${charge.name}: included distance is missing.`); return false; }
      return trip.plannedKm > charge.includedKm;
    }
    if (charge.trigger !== "night-pickup") return true;
    if (!validTime(trip.pickupTime) || !validTime(charge.triggerStart) || !validTime(charge.triggerEnd)) {
      blockers.push(`${charge.name}: confirm the night-charge time window.`);
      return false;
    }
    const start = charge.triggerStart!;
    const end = charge.triggerEnd!;
    return start > end ? trip.pickupTime >= start || trip.pickupTime < end : trip.pickupTime >= start && trip.pickupTime < end;
  });
  if (tariff.charges.some((charge) => charge.trigger === "night-pickup") && !trip.pickupTime) blockers.push("Enter pickup time to check night charges.");
  const actualCharges = applicable.filter((charge) => charge.treatment === "actual").map((charge) => charge.name);
  if (applicable.some((charge) => charge.treatment === "fixed" && !present(charge.amount))) blockers.push("A fixed additional charge has no amount.");
  if (applicable.some((charge) => charge.treatment === "unconfirmed")) blockers.push("A required additional charge needs supplier clarification.");
  const chargeQuantity = (charge: PrivateTransportCharge) => {
    if (charge.trigger === "waiting-over") return trip.vehicleCount * Math.ceil((trip.waitingMinutes - charge.includedWaitingMinutes!) / (charge.waitingIncrementMinutes || 60));
    if (charge.trigger === "distance-over") return trip.vehicleCount * (trip.plannedKm - charge.includedKm!);
    if (charge.trigger === "night-pickup") return charge.chargedPer === "hire" ? 1 : trip.vehicleCount;
    return charge.chargedPer === "hire" ? 1 : charge.chargedPer === "day" || charge.chargedPer === "night" ? trip.vehicleCount * days : charge.chargedPer === "hour" ? trip.vehicleCount * trip.plannedHours : charge.chargedPer === "km" ? trip.vehicleCount * trip.plannedKm : trip.vehicleCount;
  };
  const fixedExtras = applicable.filter((charge) => charge.treatment === "fixed" && present(charge.amount)).reduce((sum, charge) => sum + charge.amount! * chargeQuantity(charge), 0);
  // Supplier confirmation is a publication blocker, but a complete illustrative
  // tariff can still show its provisional commercial calculation in Test Rate.
  const numeric = unitBase != null && blockers.every((message) => message === "Tariff needs vendor verification." || message === "Only an Active rate card can be reused in Proposal.");
  const usageUnresolved = (tariff.template === "outstation-km" || tariff.template === "daily-hire") && (resolvedDays == null || tariff.template === "outstation-km" && trip.plannedKm <= 0 || tariff.template === "daily-hire" && trip.plannedHours <= 0)
    || tariff.template === "local-package" && trip.plannedHours <= 0;
  if (usageUnresolved) billableKm = null;
  const base = unitBase == null || usageUnresolved ? null : unitBase * trip.vehicleCount;
  const driver = unitBase == null || usageUnresolved ? null : unitDriver * trip.vehicleCount;
  const excess = unitBase == null || usageUnresolved ? null : unitExcess * trip.vehicleCount;
  const commercialAmount = numeric ? base! + driver! + excess! + fixedExtras : null;
  const taxProfile = approvedSupplierTaxProfile(taxProfiles, tariff.taxProfileId);
  const taxRate = taxProfile?.rate ?? null;
  const supplierTax = commercialAmount == null || taxRate == null ? null : tariff.taxMode === "inclusive" ? Math.round(commercialAmount - commercialAmount / (1 + taxRate)) : Math.round(commercialAmount * taxRate);
  if (taxRate == null) blockers.push("Select an approved supplier tax profile before confirming the payable amount.");
  if (taxProfile && taxProfile.recoverable == null) blockers.push("Confirm supplier tax credit treatment in Finance.");
  const costBasis = commercialAmount == null || supplierTax == null || taxProfile?.recoverable == null ? null : taxProfile.recoverable
    ? tariff.taxMode === "inclusive" ? commercialAmount - supplierTax : commercialAmount
    : tariff.taxMode === "inclusive" ? commercialAmount : commercialAmount + supplierTax;
  const supplierPayable = tariff.status === "Active" && tariff.sourceConfirmed && !tariff.illustrative && taxProfile?.recoverable != null && actualCharges.length === 0 && commercialAmount != null
    ? tariff.taxMode === "inclusive" ? commercialAmount : supplierTax == null ? null : commercialAmount + supplierTax
    : null;
  return { base, driver, excess, fixedExtras: numeric ? fixedExtras : null, commercialAmount, supplierTax, supplierPayable, costBasis, billableKm, actualCharges, blockers, quoteBasis: commercialAmount == null ? "unpriced" : actualCharges.length ? "base-plus-actuals" : supplierPayable == null ? "unpriced" : "fixed" };
}
