import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateRegionalQuote } from "./regionalTransportQuote.ts";

const tariff = {
  coverage: "Kerala", source: "Test fixture", sourceStatus: "supplier-confirmed", taxPresentation: "included", timezone: "Asia/Kolkata",
  seasons: [{ id: "s1", name: "Oct", start: "2026-10-01", end: "2026-10-31" }],
  vehicles: [{ id: "suv", label: "SUV", passengerSeats: 6, luggageBags: 3, modelOrEquivalent: "" }],
  fares: [
    { id: "fixed", service: "one-way", label: "Kochi to Alleppey", basis: "fixed", vehicleId: "suv", seasonId: "s1", amount: 3200, from: "Kochi", to: "Alleppey", routeScope: "direct" },
    { id: "local", service: "local", label: "8h / 80km", basis: "hours-km", vehicleId: "suv", seasonId: "s1", amount: 3000, includedHours: 8, includedKm: 80, extraHour: 300, extraKm: 20, routeScope: "local" },
    { id: "out", service: "outstation", label: "Multi-day", basis: "per-km", vehicleId: "suv", seasonId: "s1", amount: 22, minKmPerDay: 250, minimumRule: "pooled", routeScope: "Kerala" },
  ], charges: [], distanceBasis: "pickup to drop", availability: "confirmed",
};
const input = { fareId: "local", date: "2026-10-12", pickup: "Kochi", drop: "Alleppey", travellers: 2, guideSeats: 0, bags: 2, vehicles: 1, plannedKm: 100, plannedHours: 9, billableDays: 1, dailyKm: [100] };

test("local package applies both contracted excess rates per vehicle", () => {
  const result = calculateRegionalQuote(tariff, input);
  assert.equal(result.knownSubtotal, 3700);
  assert.equal(calculateRegionalQuote(tariff, { ...input, travellers: 6 }).knownSubtotal, 3700);
  assert.equal(calculateRegionalQuote(tariff, { ...input, vehicles: 2 }).knownSubtotal, 7400);
});

test("outstation minimum can be pooled or charged per day", () => {
  const trip = { ...input, fareId: "out", billableDays: 3, plannedKm: 650, dailyKm: [400, 150, 100] };
  const pooled = calculateRegionalQuote(tariff, trip);
  assert.equal(pooled.billableKm, 750);
  assert.equal(pooled.knownSubtotal, 16500);
  const daily = calculateRegionalQuote({ ...tariff, fares: tariff.fares.map((fare) => fare.id === "out" ? { ...fare, minimumRule: "daily" } : fare) }, trip);
  assert.equal(daily.billableKm, 900);
  assert.equal(daily.knownSubtotal, 19800);
});

test("capacity, route and season boundaries block use of an otherwise priced fare", () => {
  const result = calculateRegionalQuote(tariff, { ...input, fareId: "fixed", pickup: "Munnar", travellers: 7, vehicles: 1, date: "2026-10-31", billableDays: 2 });
  assert.match(result.blockers.join(" "), /Fixed fare covers Kochi to Alleppey/);
  assert.match(result.blockers.join(" "), /do not fit/);
  assert.match(result.blockers.join(" "), /rate card's validity/);
});

test("charges collected directly from the customer stay outside supplier subtotal", () => {
  const withCharges = { ...tariff, charges: [
    { id: "driver", label: "Driver", treatment: "fixed", amount: 500, unit: "day", paidBy: "agency", collectedBy: "supplier", note: "" },
    { id: "parking", label: "Parking", treatment: "fixed", amount: 200, unit: "transfer", paidBy: "customer", collectedBy: "driver", note: "" },
  ] };
  const result = calculateRegionalQuote(withCharges, input);
  assert.equal(result.knownSubtotal, 4200);
  assert.deepEqual(result.directPayments, ["Parking"]);
});

test("saved outstation van numbers produce the 19,200 supplier example", () => {
  const configured = { ...tariff, routes: [{ id: "circuit", name: "Kerala circuit", from: "Kochi", to: "Kochi", areaId: "kerala" }], fares: [{ ...tariff.fares[2], driverAllowancePerDay: 500, minDays: 1, crossSeasonPolicy: "pickup" }], charges: [
    { id: "tolls", label: "Circuit tolls", treatment: "fixed", amount: 900, unit: "vehicle", paidBy: "agency", collectedBy: "supplier", routeIds: ["circuit"], vehicleIds: ["suv"] },
    { id: "parking", label: "Circuit parking", treatment: "fixed", amount: 300, unit: "vehicle", paidBy: "agency", collectedBy: "supplier", routeIds: ["circuit"], vehicleIds: ["suv"] },
  ] };
  const result = calculateRegionalQuote(configured, { ...input, fareId: "out", routeId: "circuit", plannedKm: 650, billableDays: 3, dailyKm: [250, 250, 150] });
  assert.equal(result.billableKm, 750);
  assert.equal(result.base, 16500);
  assert.equal(result.driverAllowance, 1500);
  assert.equal(result.fixedExtras, 1200);
  assert.equal(result.knownSubtotal, 19200);
});

test("fixed transfer charges excess, waiting and stops without multiplying its base by km", () => {
  const transfer = { ...tariff.fares[0], amount: 1800, routeId: "airport", includedKm: 40, includedHours: 2, extraKm: 20, extraHour: 300, includedWaitingMinutes: 30, waitingRatePerHour: 200, timeIncrementMinutes: 15, includedStops: 0, extraStop: 150 };
  const result = calculateRegionalQuote({ ...tariff, fares: [transfer] }, { ...input, fareId: "fixed", routeId: "airport", plannedKm: 50, plannedHours: 2, waitingMinutes: 45, additionalStops: 1 });
  assert.equal(result.base, 1800);
  assert.equal(result.overage, 200);
  assert.equal(result.waitingCharge, 50);
  assert.equal(result.stopCharge, 150);
  assert.equal(result.knownSubtotal, 2200);
});

test("daily hire and whole trip use their own base fare and saved excess rules", () => {
  const daily = { ...tariff.fares[1], id: "daily", service: "daily", basis: "per-day", amount: 5000, includedKm: 150, includedHours: 10, carryUnusedUsage: false };
  const whole = { ...tariff.fares[1], id: "whole", service: "whole-trip", basis: "whole-trip", amount: 21000, includedKm: 750, includedDays: 3, dutyHoursPerDay: 12, extraDayRate: 7000, extraKm: 30, extraHour: 500 };
  const dailyResult = calculateRegionalQuote({ ...tariff, fares: [daily] }, { ...input, fareId: "daily", billableDays: 2, plannedKm: 300, plannedHours: 18, dailyKm: [180, 120], dailyHours: [11, 7] });
  assert.equal(dailyResult.base, 10000);
  assert.equal(dailyResult.overage, 900);
  const wholeResult = calculateRegionalQuote({ ...tariff, fares: [whole] }, { ...input, fareId: "whole", billableDays: 4, plannedKm: 800, plannedHours: 48 });
  assert.equal(wholeResult.base, 21000);
  assert.equal(wholeResult.overage, 1500);
  assert.equal(wholeResult.extensionCharge, 7000);
});

test("scoped charges do not leak to another route and unknown mandatory charges block the quote", () => {
  const charge = { id: "circuit", label: "Circuit tolls", treatment: "fixed", amount: 900, unit: "vehicle", paidBy: "agency", collectedBy: "supplier", routeIds: ["circuit"] };
  assert.equal(calculateRegionalQuote({ ...tariff, charges: [charge] }, { ...input, routeId: "city" }).fixedExtras, 0);
  const unknown = calculateRegionalQuote({ ...tariff, charges: [{ ...charge, amount: null, routeIds: ["city"] }] }, { ...input, routeId: "city" });
  assert.match(unknown.blockers.join(" "), /no agreed treatment or amount/);
  assert.equal(unknown.knownSubtotal, null);
});

test("card-level tax treatment does not invent a tax amount", () => {
  const included = calculateRegionalQuote(tariff, input);
  assert.equal(included.knownSubtotal, 3700);
  assert.equal(included.taxAmount, null);
  assert.equal(included.supplierPayable, 3700);
  const excluded = calculateRegionalQuote({ ...tariff, taxPresentation: "additional" }, input);
  assert.equal(excluded.knownSubtotal, 3700);
  assert.equal(excluded.supplierPayable, null);
  assert.match(excluded.blockers.join(" "), /Finance & docs/);
});

test("night charges need a pickup time and date rules are scoped to their season", () => {
  const night = { id: "night", label: "Night pickup", treatment: "fixed", amount: 500, unit: "pickup", paidBy: "agency", collectedBy: "supplier", trigger: "night-pickup", triggerStart: "22:00", triggerEnd: "06:00" };
  const missingTime = calculateRegionalQuote({ ...tariff, charges: [night] }, { ...input, pickupTime: "" });
  assert.match(missingTime.blockers.join(" "), /Enter pickup time/);
  const late = calculateRegionalQuote({ ...tariff, charges: [night] }, { ...input, pickupTime: "23:00" });
  assert.equal(late.fixedExtras, 500);
  const scoped = { ...tariff, adjustments: [{ id: "festival", name: "Festival", trigger: "dates", dates: [input.date], seasonIds: ["another-season"], fareIds: [], methods: ["local"], amount: 500, treatment: "additional", stacking: "replace" }] };
  assert.equal(calculateRegionalQuote(scoped, input).adjustmentCharge, 0);
});

test("unsupported routes and overlapping seasons are held for review", () => {
  const configured = { ...tariff, routes: [{ id: "circuit", name: "Circuit", from: "Kochi", to: "Kochi", areaId: "kerala" }], fares: [{ ...tariff.fares[2], allowedRouteIds: ["circuit"] }], seasons: [...tariff.seasons, { id: "overlap", name: "Overlap", start: "2026-10-10", end: "2026-10-20" }] };
  const result = calculateRegionalQuote(configured, { ...input, fareId: "out", routeId: "other" });
  assert.match(result.blockers.join(" "), /outside this saved tariff/);
  assert.match(result.blockers.join(" "), /Overlapping validity ranges/);
});

test("enabled fare methods block a supplier method the card does not offer", () => {
  const focused = { ...tariff, enabledMethods: ["one-way", "local"] };
  const result = calculateRegionalQuote(focused, { ...input, fareId: "out" });
  assert.match(result.blockers.join(" "), /not offered by the supplier/);
});

test("special-date adjustments respect range, vehicle and value type", () => {
  const baseRule = { id: "holiday", name: "Holiday", trigger: "dates", dates: [], startDate: "2026-10-10", endDate: "2026-10-14", fareIds: [], methods: ["local"], vehicleIds: ["suv"], treatment: "additional", stacking: "combine" };
  const percent = calculateRegionalQuote({ ...tariff, adjustments: [{ ...baseRule, amount: 10, valueType: "percent" }] }, input);
  assert.equal(percent.adjustmentCharge, 300);
  const replacement = calculateRegionalQuote({ ...tariff, adjustments: [{ ...baseRule, amount: 2500, valueType: "replacement" }] }, input);
  assert.equal(replacement.adjustmentCharge, -500);
  const outside = calculateRegionalQuote({ ...tariff, adjustments: [{ ...baseRule, amount: 500, valueType: "fixed" }] }, { ...input, date: "2026-10-15" });
  assert.equal(outside.adjustmentCharge, 0);
  const otherVehicle = calculateRegionalQuote({ ...tariff, adjustments: [{ ...baseRule, vehicleIds: ["van"], amount: 500, valueType: "fixed" }] }, input);
  assert.equal(otherVehicle.adjustmentCharge, 0);
});
