import type { RegionalFare, RegionalTransportTariff, TransportCharge } from "./types";

export interface RegionalQuoteInput {
  fareId: string; date: string; routeId?: string; pickup: string; drop: string; pickupTime?: string;
  travellers: number; guideSeats: number; bags: number; vehicles: number;
  plannedKm: number; plannedHours: number; waitingMinutes?: number; additionalStops?: number;
  billableDays: number; dailyKm: number[]; dailyHours?: number[];
}

const qty = (value: number | null | undefined) => Math.max(0, value || 0);
const chargeMatches = (charge: TransportCharge, fare: RegionalFare, input: RegionalQuoteInput) => {
  if (charge.fareIds?.length && !charge.fareIds.includes(fare.id)) return false;
  if (charge.routeIds?.length && !charge.routeIds.includes(fare.routeId || input.routeId || "")) return false;
  if (charge.vehicleIds?.length && !charge.vehicleIds.includes(fare.vehicleId)) return false;
  if (charge.trigger === "night-pickup") {
    if (!input.pickupTime) return false;
    const start = charge.triggerStart || "22:00", end = charge.triggerEnd || "06:00";
    if (!(start > end ? input.pickupTime >= start || input.pickupTime < end : input.pickupTime >= start && input.pickupTime < end)) return false;
  }
  return true;
};
const chargeValue = (charge: TransportCharge, input: RegionalQuoteInput, days: number) => {
  const amount = qty(charge.amount);
  if (charge.unit === "vehicle" || charge.unit === "pickup") return amount * input.vehicles;
  if (charge.unit === "day") return amount * days * input.vehicles;
  if (charge.unit === "hour") return amount * input.plannedHours * input.vehicles;
  return amount;
};

export function calculateRegionalQuote(tariff: RegionalTransportTariff, input: RegionalQuoteInput) {
  const fare = tariff.fares.find((item) => item.id === input.fareId);
  const vehicle = tariff.vehicles.find((item) => item.id === fare?.vehicleId);
  const season = tariff.seasons.find((item) => item.id === fare?.seasonId);
  const blockers: string[] = [];
  if (!fare || !vehicle || !season) blockers.push("Select a valid supplier fare and vehicle.");
  if (fare && tariff.enabledMethods && !tariff.enabledMethods.includes(fare.service)) blockers.push("This fare method is not offered by the supplier.");
  if (!input.pickup.trim() || !input.drop.trim()) blockers.push("Enter the customer pickup and final drop.");
  if (!input.date || !season || input.date < season.start || input.date > season.end) blockers.push("Travel date is outside the rate card validity.");
  if (input.date && tariff.seasons.filter((item) => input.date >= item.start && input.date <= item.end).length > 1) blockers.push("Overlapping validity ranges need review before quoting.");
  const days = Math.max(1, input.billableDays, fare?.minDays || 1);
  if (input.date && season && days > 1 && fare?.crossSeasonPolicy !== "pickup") {
    const end = new Date(`${input.date}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + days - 1);
    if (end.toISOString().slice(0, 10) > season.end) blockers.push("Trip extends beyond this rate card's validity; confirm the remaining dates separately.");
  }
  if (fare?.routeId && fare.routeId !== input.routeId) blockers.push("Select the defined route for this fare.");
  if (fare?.allowedRouteIds?.length && !fare.allowedRouteIds.includes(input.routeId || "")) blockers.push("Selected route is outside this saved tariff.");
  if (fare?.service === "outstation" && tariff.routes?.length && (!input.routeId || !tariff.routes.some((route) => route.id === input.routeId))) blockers.push("Select a saved outstation route or circuit.");
  if (fare?.basis === "fixed" && !fare.routeId && fare.from && fare.to && (!input.pickup.toLowerCase().includes(fare.from.toLowerCase()) || !input.drop.toLowerCase().includes(fare.to.toLowerCase()))) blockers.push(`Fixed fare covers ${fare.from} to ${fare.to}; confirm a new fare for this route.`);
  if (!input.travellers || input.vehicles < 1) blockers.push("Enter travellers and selected vehicles.");
  if (tariff.sourceStatus !== "supplier-confirmed") blockers.push("Supplier tariff and capacity need confirmation.");
  if (tariff.taxPresentation === "unconfirmed") blockers.push("Supplier tax treatment is unconfirmed.");
  if (tariff.availability === "not-held") blockers.push("Vehicle availability is not held.");
  if (fare?.amount == null) blockers.push("This fare has no saved price.");
  if (!vehicle?.passengerSeats || vehicle.luggageBags == null) blockers.push("Confirm passenger and luggage capacity.");
  const minimumVehicles = vehicle?.passengerSeats && vehicle.luggageBags != null
    ? Math.max(Math.ceil((input.travellers + input.guideSeats) / vehicle.passengerSeats), input.bags ? vehicle.luggageBags ? Math.ceil(input.bags / vehicle.luggageBags) : Infinity : 1)
    : null;
  if (minimumVehicles === Infinity || minimumVehicles != null && input.vehicles < minimumVehicles) blockers.push("Selected vehicles do not fit all travellers, guide seats and bags.");

  let billableKm = qty(input.plannedKm);
  if (fare?.basis === "per-km") {
    const positioningKm = qty(fare.additionalGarageKm) + qty(fare.additionalReturnKm);
    billableKm += positioningKm;
    if (fare.distanceRounding === "whole-km") billableKm = Math.ceil(billableKm);
    if (fare.minKmPerDay != null) {
      if (fare.minimumRule === "daily") {
        if (input.dailyKm.length !== days) blockers.push("Enter planned kilometres for every billable day.");
        billableKm = Array.from({ length: days }, (_, index) => Math.max(input.dailyKm[index] || 0, fare.minKmPerDay || 0)).reduce((a, b) => a + b, 0) + positioningKm;
      } else if (fare.minimumRule === "pooled") billableKm = Math.max(billableKm, days * fare.minKmPerDay);
    }
  }
  let extraKm = 0, extraHours = 0;
  if (fare?.basis === "hours-km" || fare?.basis === "fixed" || fare?.basis === "whole-trip") {
    extraKm = Math.max(0, input.plannedKm - qty(fare.includedKm));
    extraHours = Math.max(0, input.plannedHours - (fare.basis === "whole-trip" ? qty(fare.dutyHoursPerDay) * days : qty(fare.includedHours)));
  }
  if (fare?.basis === "per-day") {
    if (!fare.carryUnusedUsage && days > 1) {
      if (input.dailyKm.length !== days || input.dailyHours?.length !== days) blockers.push("Enter kilometres and duty hours for each day; unused allowances do not carry forward.");
      if (input.dailyKm.length === days && Math.abs(input.dailyKm.reduce((a, b) => a + b, 0) - input.plannedKm) > 0.001) blockers.push("Daily kilometres do not match the planned trip total.");
      if (input.dailyHours?.length === days && Math.abs(input.dailyHours.reduce((a, b) => a + b, 0) - input.plannedHours) > 0.001) blockers.push("Daily duty hours do not match the planned trip total.");
      extraKm = Array.from({ length: days }, (_, index) => Math.max(0, (input.dailyKm[index] || 0) - qty(fare.includedKm))).reduce((a, b) => a + b, 0);
      extraHours = Array.from({ length: days }, (_, index) => Math.max(0, (input.dailyHours?.[index] || 0) - qty(fare.includedHours))).reduce((a, b) => a + b, 0);
    } else {
      extraKm = Math.max(0, input.plannedKm - qty(fare.includedKm) * days);
      extraHours = Math.max(0, input.plannedHours - qty(fare.includedHours) * days);
    }
  }
  if (extraKm && fare?.extraKm == null) blockers.push("Extra kilometre rate is missing.");
  if (extraHours && fare?.extraHour == null) blockers.push("Extra hour rate is missing.");
  if (fare?.chargeExcessBoth === false && extraKm && extraHours) blockers.push("Select whether distance or time excess takes priority for this fare.");
  const base = fare?.amount == null ? null : fare.basis === "per-km" ? billableKm * fare.amount * input.vehicles
    : fare.basis === "per-day" ? days * fare.amount * input.vehicles : fare.amount * input.vehicles;
  const overage = (extraKm * qty(fare?.extraKm) + extraHours * qty(fare?.extraHour)) * input.vehicles;
  const driverAllowance = fare?.basis === "per-km" ? days * qty(fare.driverAllowancePerDay) * input.vehicles : 0;
  const waitingMinutes = fare?.basis === "fixed" ? Math.max(0, qty(input.waitingMinutes) - qty(fare.includedWaitingMinutes)) : 0;
  if (waitingMinutes > 0 && !fare?.timeIncrementMinutes) blockers.push("Confirm the transfer's waiting-time billing increment.");
  const waitingHours = Math.ceil(waitingMinutes / Math.max(1, fare?.timeIncrementMinutes || 60)) * Math.max(1, fare?.timeIncrementMinutes || 60) / 60;
  if (waitingHours && fare?.waitingRatePerHour == null) blockers.push("Additional waiting rate is missing.");
  const waitingCharge = waitingHours * qty(fare?.waitingRatePerHour) * input.vehicles;
  const extraStops = fare?.basis === "fixed" ? Math.max(0, qty(input.additionalStops) - qty(fare.includedStops)) : 0;
  if (extraStops && fare?.extraStop == null) blockers.push("Additional stop price is missing.");
  const stopCharge = extraStops * qty(fare?.extraStop) * input.vehicles;
  const extraDays = fare?.basis === "whole-trip" ? Math.max(0, days - qty(fare.includedDays)) : 0;
  if (extraDays && fare?.extraDayRate == null) blockers.push("Whole-trip extension tariff is missing.");
  const extensionCharge = extraDays * qty(fare?.extraDayRate) * input.vehicles;

  if (fare && !input.pickupTime && tariff.charges.some((charge) => charge.trigger === "night-pickup" && (!charge.fareIds?.length || charge.fareIds.includes(fare.id)) && (!charge.routeIds?.length || charge.routeIds.includes(fare.routeId || input.routeId || "")) && (!charge.vehicleIds?.length || charge.vehicleIds.includes(fare.vehicleId)))) blockers.push("Enter pickup time to check night charges.");
  const charges = fare ? tariff.charges.filter((charge) => chargeMatches(charge, fare, input)) : [];
  if (charges.some((charge) => charge.treatment === "unconfirmed" || charge.treatment === "fixed" && charge.amount == null)) blockers.push("A required additional charge has no agreed treatment or amount.");
  if (charges.some((charge) => charge.treatment === "estimated")) blockers.push("An estimated charge needs a supplier-confirmed amount.");
  const fixedExtras = charges.filter((charge) => charge.treatment === "fixed" && !(charge.paidBy === "customer" && charge.collectedBy !== "agency")).reduce((total, charge) => total + chargeValue(charge, input, days), 0);
  const actuals = charges.filter((charge) => charge.treatment === "actuals").map((charge) => `${charge.label} · ${charge.paidBy} pays ${charge.collectedBy}`);
  const directPayments = charges.filter((charge) => charge.treatment === "fixed" && charge.paidBy === "customer" && charge.collectedBy !== "agency").map((charge) => charge.label);
  const adjustments = (tariff.adjustments || []).filter((rule) => fare && (!rule.seasonIds?.length || rule.seasonIds.includes(fare.seasonId)) && (!rule.methods?.length || rule.methods.includes(fare.service)) && (!rule.vehicleIds?.length || rule.vehicleIds.includes(fare.vehicleId)) && (!rule.fareIds.length || rule.fareIds.includes(fare.id)) && (rule.startDate ? input.date >= rule.startDate && input.date <= (rule.endDate || rule.startDate) : rule.trigger === "weekend" ? [0, 6].includes(new Date(`${input.date}T00:00:00Z`).getUTCDay()) : rule.dates.includes(input.date)));
  if (adjustments.some((rule) => rule.treatment === "unavailable")) blockers.push("Selected fare is unavailable on this date.");
  const priced = adjustments.filter((rule) => rule.treatment === "additional");
  const replacements = priced.filter((rule) => rule.stacking === "replace");
  if (replacements.length > 1) blockers.push("Several replacement adjustments match; choose a single applicable rule.");
  const replacement = replacements[0];
  const adjustmentValue = (rule: (typeof priced)[number]) => rule.valueType === "replacement" ? rule.amount * input.vehicles - (base || 0) : rule.valueType === "percent" ? (base || 0) * rule.amount / 100 : rule.amount * input.vehicles;
  const adjustmentCharge = replacement ? adjustmentValue(replacement) : priced.reduce((sum, rule) => sum + adjustmentValue(rule), 0);
  const missingNumber = base == null || extraKm > 0 && fare?.extraKm == null || extraHours > 0 && fare?.extraHour == null || waitingMinutes > 0 && (!fare?.timeIncrementMinutes || fare.waitingRatePerHour == null) || extraStops > 0 && fare?.extraStop == null || extraDays > 0 && fare?.extraDayRate == null || replacements.length > 1 || charges.some((charge) => charge.treatment === "unconfirmed" || charge.treatment === "fixed" && charge.amount == null);
  const knownSubtotal = missingNumber ? null : base! + overage + driverAllowance + waitingCharge + stopCharge + extensionCharge + fixedExtras + adjustmentCharge;
  if (tariff.taxPresentation === "additional") blockers.push("Confirm the excluded tax amount in Finance & docs before finalizing the supplier payable.");
  const taxAmount = null;
  const supplierPayable = tariff.taxPresentation === "included" ? knownSubtotal : null;
  return { fare, vehicle, season, minimumVehicles, billableKm, extraKm, extraHours, base, overage, driverAllowance, waitingCharge, stopCharge, extensionCharge, fixedExtras, adjustmentCharge, knownSubtotal, taxAmount, supplierPayable, blockers, actuals, directPayments, quoteBasis: blockers.length ? "needs-review" : actuals.length ? "base-plus-actuals" : "fixed" };
}
