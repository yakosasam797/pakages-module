import { DETAIL_CARDS } from "../vendor-crm/src/rateCard/cards";
import type { RateCardDetail } from "../vendor-crm/src/rateCard/types";
import type { ProposalService, ServicePriceState } from "./proposalModel";

export type CostLine = { label: string; basis: string; amount: number };
export type CostContext = { tripStart?: string; dayIndex?: number; travellers?: number };
export type CostBreakdown = { status: ServicePriceState; total: number; lines: CostLine[]; issue?: string; source?: string };

export const accommodationCards = Object.values(DETAIL_CARDS).filter((card) => card.service === "Accommodation" && card.id !== "rc-new-hotel");
export const availableAccommodationCards = accommodationCards.filter((card) => card.state === "Published");
export const availableTransportCards = Object.values(DETAIL_CARDS).filter((card) => card.service === "Transport" && card.state === "Published");

const count = (value: number | undefined, fallback = 1) => Math.max(0, Number.isFinite(value) ? Number(value) : fallback);
const positive = (value: number | undefined, fallback = 1) => Math.max(1, count(value, fallback));
const dayAt = (date: string, offset = 0) => {
  const start = new Date(`${date}T12:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  start.setDate(start.getDate() + offset);
  return start;
};
const addDays = (date: Date, offset: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + offset);
  return next;
};
const dateLabel = (date: Date) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
const monthIndex = (name: string) => ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(name.toLowerCase().slice(0, 3));

function dateRange(value: string): { start: Date; end: Date } | null {
  const parts = value.split(/[–—]/).map((part) => part.trim());
  if (parts.length !== 2) return null;
  const read = (part: string, fallbackYear?: number) => {
    const match = part.match(/(\d{1,2})\s+([A-Za-z]{3,})\s*(\d{4})?/);
    if (!match) return null;
    const month = monthIndex(match[2]);
    if (month < 0) return null;
    return { day: Number(match[1]), month, year: Number(match[3] ?? fallbackYear) };
  };
  const endParts = read(parts[1]);
  if (!endParts) return null;
  const startParts = read(parts[0], endParts.year);
  if (!startParts) return null;
  if (!/\d{4}/.test(parts[0]) && startParts.month > endParts.month) startParts.year -= 1;
  return { start: new Date(startParts.year, startParts.month, startParts.day), end: new Date(endParts.year, endParts.month, endParts.day) };
}

function inRange(date: Date, range: { start: Date; end: Date } | null) {
  if (!range) return false;
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return day >= range.start.getTime() && day <= range.end.getTime();
}

function guestAgeMatches(age: number, band: string) {
  const plus = band.match(/(\d+)\+/);
  if (plus) return age >= Number(plus[1]);
  const range = band.match(/(\d+)\s*[–-]\s*(\d+)/);
  return Boolean(range && age >= Number(range[1]) && age <= Number(range[2]));
}

function blocked(issue: string, source?: string): CostBreakdown {
  return { status: "unpriced", total: 0, lines: [], issue, source };
}

function quoteAccommodation(service: ProposalService, card: RateCardDetail, context: CostContext): CostBreakdown {
  const source = `${card.vendor} · ${card.name}`;
  if (card.state !== "Published") return blocked("This CRM rate card is not published.", source);
  if (card.currency !== "INR") return blocked("Convert and confirm this vendor rate before including it in an INR proposal.", source);
  if (!card.taxConfirmed) return blocked("The vendor has not confirmed the tax treatment.", source);
  const roomIndex = card.rooms.findIndex((room) => room.id === service.roomTypeId);
  const mealIndex = card.meals.findIndex((meal) => meal.code === service.mealPlanCode);
  if (roomIndex < 0 || mealIndex < 0) return blocked("Select a room type and meal plan from this rate card.", source);
  const checkIn = dayAt(service.stayCheckIn || context.tripStart || "", service.stayCheckIn ? 0 : context.dayIndex ?? 0);
  if (!checkIn) return blocked("Set travel dates before using a seasonal accommodation rate.", source);
  const rooms = positive(service.rooms);
  const nights = positive(service.nights);
  const adults = count(service.stayAdults, 2);
  const children = service.stayChildren ?? [];
  const room = card.rooms[roomIndex];
  if (adults + children.length > room.maxOccupancy * rooms) return blocked(`${room.name} allows at most ${room.maxOccupancy * rooms} guests across ${rooms} rooms.`, source);
  if (children.some((child) => child.age < 0 || child.age > 17)) return blocked("Enter each child's age to apply the correct guest band.", source);
  const extraAdults = Math.max(0, adults - room.baseOccupancy * rooms);
  if (extraAdults + children.filter((child) => child.bed).length > room.maxBeds * rooms) return blocked(`${room.name} allows at most ${room.maxBeds * rooms} extra beds across ${rooms} rooms.`, source);
  const extraAdultRule = card.guests.find((rule) => rule[0] === room.id && rule[1] === "Extra adult");
  if (extraAdults && extraAdultRule?.[5] == null) return blocked("The extra-adult rate is not confirmed on this card.", source);
  const childRates: number[] = [];
  const childRuleCounts = new Map<string, number>();
  for (const child of children) {
    const rule = card.guests.find((entry) => entry[0] === room.id && entry[1] !== "Extra adult" && guestAgeMatches(child.age, entry[2]) && (child.bed ? entry[3] === "extra_bed" : ["no_bed", "existing_bed", "cot"].includes(entry[3])));
    if (!rule || rule[5] == null) return blocked(`No confirmed ${child.bed ? "with-bed" : "without-bed"} rate for a child aged ${child.age}.`, source);
    const ruleKey = `${rule[0]}-${rule[1]}-${rule[2]}-${rule[3]}`;
    const ruleCount = (childRuleCounts.get(ruleKey) ?? 0) + 1;
    if (ruleCount > rule[6] * rooms) return blocked(`The ${rule[1]} ${rule[2]} guest band allows at most ${rule[6] * rooms} for ${rooms} rooms.`, source);
    childRuleCounts.set(ruleKey, ruleCount);
    childRates.push(rule[5]);
  }
  const lines: CostLine[] = [];
  for (let night = 0; night < nights; night++) {
    const date = addDays(checkIn, night);
    const seasonIndex = card.seasons.findIndex((season) => inRange(date, dateRange(season.dates)));
    if (seasonIndex < 0) return blocked(`${dateLabel(date)} has no published season rate.`, source);
    const rate = card.prices[roomIndex]?.[mealIndex]?.[seasonIndex];
    if (rate == null) return blocked(`${room.name} · ${card.meals[mealIndex].code} has no rate for ${dateLabel(date)}.`, source);
    const weekend = [0, 6].includes(date.getDay()) ? card.weekendExtra?.[roomIndex]?.[seasonIndex] ?? 0 : 0;
    lines.push({ label: `${dateLabel(date)} · ${card.seasons[seasonIndex].name}`, basis: `${rooms} room${rooms === 1 ? "" : "s"} × ${room.name} · ${card.meals[mealIndex].code}${weekend ? " · weekend rate" : ""}`, amount: (rate + weekend) * rooms });
  }
  const stayDates = Array.from({ length: nights }, (_, night) => addDays(checkIn, night));
  for (const [rule, window, value] of card.rules) {
    if (!stayDates.some((date) => inRange(date, dateRange(window)) || window.includes(dateLabel(date)))) continue;
    if (["Blackout", "Road closure"].includes(rule)) return blocked(`${rule}: ${window}. This stay cannot be quoted.`, source);
    if (rule === "Minimum stay" && nights < Number.parseInt(value, 10)) return blocked(`${window} requires at least ${Number.parseInt(value, 10)} nights.`, source);
  }
  if (extraAdults) lines.push({ label: "Extra adult", basis: `${extraAdults} guest${extraAdults === 1 ? "" : "s"} × ${nights} nights`, amount: Number(extraAdultRule?.[5] ?? 0) * extraAdults * nights });
  children.forEach((child, index) => lines.push({ label: `Child aged ${child.age}${child.bed ? " · with bed" : " · no bed"}`, basis: `${nights} nights`, amount: childRates[index] * nights }));
  card.supplements.filter((item) => item.basis === "Mandatory").forEach((item) => {
    if (item.amount == null) return;
    const matchingNights = stayDates.filter((date) => inRange(date, dateRange(item.applies)) || item.applies.includes(dateLabel(date)) || item.applies.includes(dateLabel(date).slice(0, 6)));
    if (!matchingNights.length) return;
    const units = /per adult/i.test(item.unit) ? adults : /per room/i.test(item.unit) ? rooms : 1;
    const repeats = /night/i.test(item.unit) ? matchingNights.length : 1;
    lines.push({ label: item.name, basis: `${units} × ${repeats} · ${item.unit}`, amount: item.amount * units * repeats });
  });
  lines.push({ label: "Tax", basis: "Included in the vendor rate", amount: 0 });
  return { status: "priced", total: lines.reduce((sum, line) => sum + line.amount, 0), lines, source };
}

function quoteTransport(service: ProposalService, card: RateCardDetail, context: CostContext): CostBreakdown {
  const source = `${card.vendor} · ${card.name}`;
  if (card.currency !== "INR") return blocked("Convert and confirm this vendor rate before including it in an INR proposal.", source);
  if (!card.taxConfirmed) return blocked("The vendor has not confirmed the tax treatment.", source);
  const routeIndex = card.rooms.findIndex((route) => route.id === service.roomTypeId);
  const vehicleIndex = card.meals.findIndex((vehicle) => vehicle.code === service.mealPlanCode);
  if (routeIndex < 0 || vehicleIndex < 0) return blocked("Select a covered route and vehicle class from this card.", source);
  const serviceDate = dayAt(service.serviceDate || context.tripStart || "", service.serviceDate ? 0 : context.dayIndex ?? 0);
  if (!serviceDate) return blocked("Set travel dates before applying this transport card.", source);
  const seasonIndex = card.seasons.findIndex((season) => inRange(serviceDate, dateRange(season.dates)));
  if (seasonIndex < 0) return blocked(`${dateLabel(serviceDate)} has no published transport rate.`, source);
  const rate = card.prices[routeIndex]?.[vehicleIndex]?.[seasonIndex];
  if (rate == null) return blocked("The selected route and vehicle class have no confirmed rate.", source);
  const vehicles = positive(service.quantity);
  const trips = positive(service.transportUnits);
  if (!Number.isInteger(service.vehicleCapacity) || !service.vehicleCapacity || service.vehicleCapacity < 1) return blocked("Confirm usable passenger seats per vehicle for the selected class.", source);
  if (context.travellers && service.vehicleCapacity && context.travellers > vehicles * service.vehicleCapacity) return blocked(`${context.travellers} travellers exceed ${vehicles} × ${service.vehicleCapacity} seats. Add a vehicle or choose a larger class.`, source);
  const lines: CostLine[] = [{ label: "Vehicle rate", basis: `${card.rooms[routeIndex].name} (${card.rooms[routeIndex].note}) · ${card.meals[vehicleIndex].label} · ${vehicles} vehicle${vehicles === 1 ? "" : "s"} × ${trips} trip${trips === 1 ? "" : "s"}`, amount: rate * vehicles * trips }];
  if (service.waitingHours) {
    const waitingRate = card.supplements.find((item) => /waiting/i.test(item.name))?.amount;
    if (waitingRate == null) return blocked("Waiting is requested but this card has no confirmed waiting rate.", source);
    lines.push({ label: "Waiting beyond included time", basis: `${service.waitingHours} hours × ${vehicles} vehicles`, amount: service.waitingHours * waitingRate * vehicles });
  }
  if (service.tolls) lines.push({ label: "Tolls", basis: "Trip total", amount: service.tolls });
  if (service.parking) lines.push({ label: "Parking", basis: "Trip total", amount: service.parking });
  if (service.driverIncluded === false) {
    if (!service.driverAllowance) return blocked("Enter the driver allowance or mark the driver as included.", source);
    lines.push({ label: "Driver allowance", basis: `${trips} trips`, amount: service.driverAllowance * trips });
  }
  lines.push({ label: "Tax", basis: "Included in the vendor rate", amount: 0 });
  return { status: "priced", total: lines.reduce((sum, line) => sum + line.amount, 0), lines, source };
}

function quoteGroundTransport(service: ProposalService, context: CostContext): CostBreakdown {
  const classLabel = [service.vehicleTier === "standard" ? "standard" : service.vehicleTier, service.vehicleType].filter(Boolean).join(" ");
  const source = service.vendor ? `${service.vendor} · ${classLabel ? `${classLabel} · ` : ""}confirmed supplier quote` : undefined;
  const mode = service.transportPricingMode;
  const vehicles = service.quantity;
  const units = service.transportUnits;
  const capacity = service.vehicleCapacity;
  const rate = service.cost;
  if (service.priceState === "unpriced") return blocked("Confirm a supplier rate before including this vehicle in the cost.", source);
  if (!service.vendor?.trim()) return blocked("Name the supplier whose rate is being used.");
  if (!service.routeFrom?.trim() || !service.routeTo?.trim()) return blocked("Enter the covered pickup and drop-off locations.", source);
  if (!service.vehicleType?.trim()) return blocked("Choose the vehicle class quoted by the supplier.", source);
  if (!Number.isInteger(vehicles) || !vehicles || vehicles < 1) return blocked("Enter the number of vehicles.", source);
  if (!Number.isInteger(capacity) || !capacity || capacity < 1) return blocked("Enter the confirmed passenger seats per vehicle, excluding the driver.", source);
  if (context.travellers && context.travellers > vehicles * capacity) return blocked(`${context.travellers} travellers exceed ${vehicles} × ${capacity} passenger seats. Add a vehicle or choose a larger class.`, source);
  if (!Number.isInteger(units) || !units || units < 1) return blocked(mode === "transfer" ? "Enter the number of trips." : "Enter the number of service days.", source);
  if (rate == null || !Number.isFinite(rate) || rate <= 0) return blocked(mode === "outstation" ? "Enter the confirmed rate per kilometre." : "Enter the confirmed supplier base rate.", source);
  if (service.transportChargesStatus === "to_confirm" || !service.transportChargesStatus) return blocked("Confirm how tolls, parking, permits and supplier tax are covered.", source);

  const lines: CostLine[] = [];
  const addExcess = (label: string, planned: number | undefined, included: number | undefined, extraRate: number | undefined, allowance: number, unit: string) => {
    if (planned == null || !Number.isFinite(planned) || planned < 0) return `Enter the planned ${unit} for this service.`;
    if (included == null || !Number.isFinite(included) || included < 0) return `Enter the supplier's included ${unit}.`;
    const excess = Math.max(0, planned - included * allowance);
    if (excess > 0 && (extraRate == null || !Number.isFinite(extraRate) || extraRate <= 0)) return `Enter the supplier's extra ${unit} rate.`;
    if (excess > 0) lines.push({ label, basis: `${excess} ${unit} × ${vehicles} vehicle${vehicles === 1 ? "" : "s"}`, amount: excess * Number(extraRate) * vehicles });
    return null;
  };

  if (mode === "transfer") {
    lines.push({ label: "Point-to-point vehicle rate", basis: `${vehicles} vehicle${vehicles === 1 ? "" : "s"} × ${units} trip${units === 1 ? "" : "s"}`, amount: rate * vehicles * units });
    if (service.includedKm != null || service.plannedKm != null) {
      const issue = addExcess("Extra distance", service.plannedKm, service.includedKm, service.extraKmRate, units, "km");
      if (issue) return blocked(issue, source);
    }
    if (service.includedHours != null || service.plannedHours != null) {
      const issue = addExcess("Extra time", service.plannedHours, service.includedHours, service.extraHourRate, units, "hours");
      if (issue) return blocked(issue, source);
    }
  } else if (mode === "local") {
    lines.push({ label: "Local vehicle package", basis: `${vehicles} vehicle${vehicles === 1 ? "" : "s"} × ${units} day${units === 1 ? "" : "s"}`, amount: rate * vehicles * units });
    const distanceIssue = addExcess("Extra distance", service.plannedKm, service.includedKm, service.extraKmRate, units, "km");
    if (distanceIssue) return blocked(distanceIssue, source);
    const timeIssue = addExcess("Extra time", service.plannedHours, service.includedHours, service.extraHourRate, units, "hours");
    if (timeIssue) return blocked(timeIssue, source);
  } else if (mode === "outstation") {
    const planned = service.plannedKm;
    const minimum = service.minimumKmPerDay;
    if (planned == null || !Number.isFinite(planned) || planned <= 0) return blocked("Enter the planned total distance, including any supplier-billable return distance.", source);
    if (minimum == null || !Number.isFinite(minimum) || minimum < 0) return blocked("Enter the supplier's minimum billable km per day, or 0 if none.", source);
    const billable = Math.max(planned, minimum * units);
    lines.push({ label: "Outstation distance", basis: `${billable} billable km${billable > planned ? ` (minimum ${minimum} km/day × ${units} days)` : ""} × ${vehicles} vehicle${vehicles === 1 ? "" : "s"}`, amount: billable * rate * vehicles });
  }

  if (service.driverIncluded === false) {
    if (!Number.isFinite(service.driverAllowance) || !service.driverAllowance || service.driverAllowance <= 0) return blocked("Enter the confirmed driver allowance per vehicle per day or trip.", source);
    lines.push({ label: "Driver allowance", basis: `${vehicles} vehicle${vehicles === 1 ? "" : "s"} × ${units} ${mode === "transfer" ? "trips" : "days"}`, amount: service.driverAllowance * vehicles * units });
  }
  if (service.transportChargesStatus === "entered") {
    for (const [label, amount] of [["Tolls", service.tolls], ["Parking", service.parking], ["Permits / state entry", service.permitFees], ["Supplier tax", service.supplierTax]] as const) {
      if (amount == null || !Number.isFinite(amount) || amount < 0) return blocked(`Enter the confirmed ${label.toLowerCase()} amount, or 0 if none.`, source);
      if (amount > 0) lines.push({ label, basis: "Confirmed trip total", amount });
    }
  }
  if (service.transportChargesStatus === "included") lines.push({ label: "Tolls, parking, permits and tax", basis: "Confirmed included in supplier rate", amount: 0 });
  return { status: "priced", total: lines.reduce((sum, line) => sum + line.amount, 0), lines, source };
}

export function serviceCostBreakdown(service: ProposalService, context: CostContext = {}): CostBreakdown {
  if (service.priceState === "included") return { status: "included", total: 0, lines: [{ label: "Included", basis: "No separate supplier charge", amount: 0 }] };
  if (service.costComponents?.length && service.kind !== "stay" && service.kind !== "transfer") {
    if (service.priceState !== "priced") return blocked("Confirm the supplier's line item rates before including this service.");
    const items = service.costComponents;
    if (items.some((item) => !item.label.trim() || !Number.isFinite(item.quantity) || item.quantity < 0 || !Number.isFinite(item.unitCost) || item.unitCost < 0)) return blocked("Complete each charge with a valid label, quantity and supplier rate.");
    if (!items.some((item) => item.quantity > 0 && item.unitCost > 0)) return blocked("Enter at least one confirmed supplier charge.");
    const lines = items.filter((item) => item.quantity > 0 && item.unitCost > 0).map((item) => ({ label: item.label, basis: `${item.quantity} ${item.unit}${item.quantity === 1 ? "" : "s"} × ${item.unitCost.toLocaleString("en-IN")}`, amount: item.quantity * item.unitCost }));
    return { status: "priced", total: lines.reduce((sum, item) => sum + item.amount, 0), lines, source: service.vendor ? `${service.vendor} · supplier quote` : undefined };
  }
  if (service.kind === "stay" && service.rateCardId) {
    const card = DETAIL_CARDS[service.rateCardId];
    return card ? quoteAccommodation(service, card, context) : blocked("The selected CRM rate card is unavailable.");
  }
  if (service.kind === "transfer" && service.rateCardId) {
    const card = DETAIL_CARDS[service.rateCardId];
    return card?.service === "Transport" && card.state === "Published" ? quoteTransport(service, card, context) : blocked("The selected CRM transport card is unavailable.");
  }
  if (service.kind === "transfer" && service.transportPricingMode) return quoteGroundTransport(service, context);
  if (service.priceState === "unpriced" && service.cost == null && !service.guideCost && !service.admissionCost) return blocked("Enter a supplier rate or mark this service as included.");
  if (!service.priceState && service.cost === 0 && !service.guideCost && !service.admissionCost) return { status: "included", total: 0, lines: [{ label: "Included", basis: "No separate supplier charge", amount: 0 }] };
  if (service.cost == null && service.kind !== "activity") return blocked("Enter a supplier rate or mark this service as included.");
  const lines: CostLine[] = [];
  const rate = count(service.cost, 0);
  if (service.kind === "stay") {
    const rooms = positive(service.rooms);
    const nights = positive(service.nights);
    lines.push({ label: "Room rate", basis: `${rooms} room${rooms === 1 ? "" : "s"} × ${nights} night${nights === 1 ? "" : "s"}`, amount: rate * rooms * nights });
    service.supplements?.forEach((item) => lines.push({ label: item.label, basis: `${item.quantity} guest${item.quantity === 1 ? "" : "s"} × ${nights} nights`, amount: item.unitCost * item.quantity * nights }));
  } else if (service.kind === "transfer") {
    const vehicles = positive(service.quantity);
    const units = positive(service.transportUnits);
    if (context.travellers && service.vehicleCapacity && context.travellers > vehicles * service.vehicleCapacity) return blocked(`${context.travellers} travellers exceed ${vehicles} × ${service.vehicleCapacity} seats. Add a vehicle or choose a larger class.`);
    if (service.waitingHours && !service.waitingRate) return blocked("Enter a waiting rate for the requested waiting hours.");
    if (service.driverIncluded === false && !service.driverAllowance) return blocked("Enter the driver allowance or mark the driver as included.");
    lines.push({ label: "Vehicle rate", basis: `${vehicles} vehicle${vehicles === 1 ? "" : "s"} × ${units} ${service.unit === "day" ? "day" : "trip"}${units === 1 ? "" : "s"}`, amount: rate * vehicles * units });
    if (service.waitingHours && service.waitingRate) lines.push({ label: "Waiting", basis: `${service.waitingHours} hours × ${vehicles} vehicles`, amount: service.waitingHours * service.waitingRate * vehicles });
    if (service.tolls) lines.push({ label: "Tolls", basis: "Trip total", amount: service.tolls });
    if (service.parking) lines.push({ label: "Parking", basis: "Trip total", amount: service.parking });
    if (service.driverIncluded === false && service.driverAllowance) lines.push({ label: "Driver allowance", basis: `${units} ${service.unit === "day" ? "days" : "trips"}`, amount: service.driverAllowance * units });
  } else if (service.kind === "activity") {
    const participants = positive(service.participants ?? service.quantity);
    const units = service.unit === "person" ? participants : positive(service.quantity);
    if (service.cost == null && !service.guideCost && !service.admissionCost) return blocked("Enter the experience, guide or admission rate.");
    if (service.cost != null) lines.push({ label: "Experience", basis: service.unit === "person" ? `${participants} participants` : `${units} ${service.unit ?? "group"}${units === 1 ? "" : "s"}`, amount: rate * units });
    if (service.guideCost) lines.push({ label: "Guide", basis: "Fixed for this visit", amount: service.guideCost });
    if (service.admissionCost) lines.push({ label: "Admission / viewpoint", basis: `${participants} participants`, amount: service.admissionCost * participants });
  } else {
    const units = positive(service.quantity);
    lines.push({ label: service.kind === "meal" ? "Meal" : "Supplier rate", basis: `${units} ${service.unit ?? "unit"}${units === 1 ? "" : "s"}`, amount: rate * units });
  }
  return { status: "priced", total: lines.reduce((sum, line) => sum + line.amount, 0), lines };
}
