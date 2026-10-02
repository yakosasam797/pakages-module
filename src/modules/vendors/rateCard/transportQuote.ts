import type { TransportTariff } from "./types";

export interface TransportQuoteInput {
  travelDate: string;
  routeId: string;
  additionalStops: string;
  offeringId: string;
  travellers: number;
  staffSeats: number;
  bags: number;
  passengerSeats: number | null;
  luggageBags: number | null;
  vehicles: number;
  plannedKm: number;
  billableWaitingHours: number;
}

export interface TransportQuoteResult {
  minimumVehicles: number | null;
  baseFare: number | null;
  waitingCharge: number;
  fixedExtras: number;
  estimatedExtras: number;
  knownSupplierAmount: number | null;
  planningAmount: number | null;
  blockers: string[];
  actuals: string[];
  estimates: string[];
  directPayments: string[];
  quoteBasis: "needs-review" | "estimate" | "fixed-plus-actuals" | "fixed";
}

export function calculateTransportQuote(tariff: TransportTariff, input: TransportQuoteInput): TransportQuoteResult {
  const route = tariff.routes.find((item) => item.id === input.routeId);
  const offering = tariff.offerings.find((item) => item.id === input.offeringId);
  const blockers: string[] = [];
  const actuals: string[] = [];
  const estimates: string[] = [];
  const directPayments: string[] = [];
  const passengerSeats = input.passengerSeats ?? offering?.passengerSeats ?? null;
  const luggageBags = input.luggageBags ?? offering?.luggageBags ?? null;

  if (!route || !offering) blockers.push("Select a priced route and vehicle offering.");
  if (input.travellers < 1) blockers.push("Enter at least one traveller needing a seat.");
  if (input.additionalStops.trim() && tariff.charges.find((charge) => charge.id === "stops")?.treatment === "not-applicable") blockers.push("This tariff does not cover additional stops; request a revised route quote.");
  if (!input.travelDate || input.travelDate < tariff.validFrom || input.travelDate > tariff.validTo) blockers.push("Travel date is outside this supplier rate's validity.");
  if (!tariff.quoteValidUntil) blockers.push("Confirm when this supplier quote expires.");
  else if (tariff.quoteValidUntil < new Date().toISOString().slice(0, 10)) blockers.push("The supplier quote has expired; request a current rate.");
  if (tariff.taxPresentation === "unconfirmed") blockers.push("Confirm whether supplier fare tax is included or additional.");
  if (tariff.taxPresentation === "additional") blockers.push("Apply the approved supplier tax treatment before finalizing the total.");
  if (!passengerSeats || passengerSeats < 1) blockers.push("Confirm passenger seats excluding the driver.");
  if (input.bags > 0 && (!luggageBags || luggageBags < 1)) blockers.push("Confirm luggage capacity for this vehicle.");
  if (input.plannedKm > (route?.includedKm ?? 0)) blockers.push("Route exceeds this transfer's included distance; request a new supplier price.");
  if (input.plannedKm <= 0) blockers.push("Enter the planned route distance.");
  if (input.vehicles < 1) blockers.push("Select at least one vehicle.");
  if (input.billableWaitingHours > 0 && tariff.waitingRounding.startsWith("Unconfirmed")) {
    blockers.push("Confirm the supplier's waiting-time rounding before quoting the extra charge.");
  }

  const seatVehicles = passengerSeats ? Math.ceil((input.travellers + input.staffSeats) / passengerSeats) : null;
  const bagVehicles = input.bags === 0 ? 0 : luggageBags ? Math.ceil(input.bags / luggageBags) : null;
  const minimumVehicles = seatVehicles != null && bagVehicles != null ? Math.max(1, seatVehicles, bagVehicles) : null;
  if (minimumVehicles != null && input.vehicles < minimumVehicles) {
    blockers.push(`${minimumVehicles} vehicles are needed for the confirmed seats and bags.`);
  }

  let fixedExtras = 0;
  let estimatedExtras = 0;
  for (const charge of tariff.charges) {
    if (charge.treatment === "unconfirmed") blockers.push(`Confirm ${charge.label.toLowerCase()} treatment.`);
    if (charge.treatment === "actuals") actuals.push(charge.label);
    if (charge.treatment === "estimated") estimates.push(charge.label);
    if (charge.treatment === "fixed" && charge.amount == null) blockers.push(`Set the fixed ${charge.label.toLowerCase()} amount.`);
    if (charge.treatment === "estimated" && charge.amount == null) blockers.push(`Enter the ${charge.label.toLowerCase()} estimate.`);
    if (charge.paidBy === "unconfirmed" && charge.treatment !== "unconfirmed" && charge.treatment !== "included" && charge.treatment !== "not-applicable") {
      blockers.push(`Confirm who pays ${charge.label.toLowerCase()}.`);
    }
    if (charge.collectedBy === "unconfirmed" && charge.treatment !== "unconfirmed" && charge.treatment !== "included" && charge.treatment !== "not-applicable") {
      blockers.push(`Confirm who collects ${charge.label.toLowerCase()}.`);
    }
    if (charge.paidBy === "customer" && charge.collectedBy !== "agency" && (charge.treatment === "actuals" || charge.treatment === "fixed" || charge.treatment === "estimated")) {
      directPayments.push(charge.label);
    }
    const quantity = charge.unit === "vehicle" ? input.vehicles : charge.unit === "hour" ? input.billableWaitingHours : 1;
    if (charge.paidBy === "agency" && charge.amount != null) {
      if (charge.treatment === "fixed") fixedExtras += charge.amount * quantity;
      if (charge.treatment === "estimated") estimatedExtras += charge.amount * quantity;
    }
  }

  const pricePerVehicle = route?.prices[offering?.id ?? ""] ?? null;
  if (pricePerVehicle == null) blockers.push("This vehicle has no supplier price for the selected route.");
  const baseFare = pricePerVehicle == null ? null : pricePerVehicle * input.vehicles;
  const waitingCharge = tariff.waitingRatePerHour * Math.max(0, input.billableWaitingHours) * input.vehicles;
  const knownSupplierAmount = baseFare == null ? null : baseFare + waitingCharge + fixedExtras;
  const planningAmount = knownSupplierAmount == null ? null : knownSupplierAmount + estimatedExtras;
  const quoteBasis = blockers.length
    ? "needs-review"
    : estimates.length
      ? "estimate"
      : actuals.length
        ? "fixed-plus-actuals"
        : "fixed";

  return { minimumVehicles, baseFare, waitingCharge, fixedExtras, estimatedExtras, knownSupplierAmount, planningAmount, blockers, actuals, estimates, directPayments, quoteBasis };
}
