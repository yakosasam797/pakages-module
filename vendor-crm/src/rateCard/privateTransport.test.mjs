import assert from "node:assert/strict";
import { test } from "node:test";
import { calculatePrivateTransportQuote, resolvePrivateTransportDays, validatePrivateTransportTariff } from "./privateTransport.ts";
import { PRIVATE_TRANSPORT_FIXTURES, VEHICLE_OFFERINGS } from "../data/privateTransportFixtures.ts";

const scenarioTax = { id: "scenario-tax", name: "Scenario tax", rate: 0, approved: true, approvalSource: "Test fixture", recoverable: false };
const card = (id) => ({ ...structuredClone(PRIVATE_TRANSPORT_FIXTURES.find((item) => item.id === id).tariff), illustrative: false, sourceConfirmed: true, status: "Active", taxProfileId: scenarioTax.id });
const trip = (tariff, vehicleId, extra = {}) => ({
  date: "2026-10-12", pickupTime: "10:00", pickup: "Kochi Airport", drop: "Kochi Hotel",
  routeId: "route-1", packageId: "full", vehicleId, travellers: 2, guideSeats: 0,
  mediumBags: 2, vehicleCount: 1, plannedKm: 80, plannedHours: 8,
  waitingMinutes: 0, billableDays: 1, dailyKm: [], dailyHours: [], ...extra,
});
const quote = (tariff, input) => calculatePrivateTransportQuote(tariff, VEHICLE_OFFERINGS, input, [scenarioTax]);

test("fixed transfer prices one private vehicle and respects route direction", () => {
  const tariff = card("rc-cityride-fixed");
  const input = trip(tariff, "city-sedan");
  assert.equal(quote(tariff, input).commercialAmount, 1500);
  assert.equal(quote(tariff, { ...input, travellers: 3 }).commercialAmount, 1500);
  assert.equal(quote(tariff, { ...input, vehicleCount: 2 }).commercialAmount, 3000);
  assert.equal(quote(tariff, { ...input, pickup: "Kochi Hotel", drop: "Kochi Airport" }).commercialAmount, null);
});

test("mixed private vehicles combine capacity and their own supplier tariffs", () => {
  const tariff = card("rc-cityride-fixed");
  const input = trip(tariff, "city-sedan", {
    travellers: 10, mediumBags: 10,
    vehicleAllocations: [{ vehicleId: "city-sedan", quantity: 1 }, { vehicleId: "city-van", quantity: 1 }],
  });
  assert.equal(quote(tariff, input).commercialAmount, 5000);
  assert.equal(quote(tariff, { ...input, mediumBags: 13 }).commercialAmount, null);
  assert.equal(quote(tariff, { ...input, vehicleAllocations: [{ vehicleId: "city-sedan", quantity: 1 }] }).commercialAmount, null);
});

test("a mixed vehicle hire charges one per-hire fee only once", () => {
  const tariff = card("rc-cityride-fixed");
  tariff.charges.push({ id: "dispatch", name: "Dispatch", appliesTo: "All routes", treatment: "fixed", amount: 300, chargedPer: "hire", trigger: "always" });
  tariff.charges.push({ id: "van-permit", name: "Van permit", appliesTo: "All routes", treatment: "fixed", amount: 250, chargedPer: "hire", trigger: "always", vehicleIds: ["city-van"] });
  const input = trip(tariff, "city-sedan", { vehicleAllocations: [{ vehicleId: "city-sedan", quantity: 1 }, { vehicleId: "city-van", quantity: 1 }] });
  assert.equal(quote(tariff, input).fixedExtras, 550);
  assert.equal(quote(tariff, input).commercialAmount, 5550);
});

test("local package keeps base and both contracted excess rates separate", () => {
  const tariff = card("rc-local-cabs");
  const result = quote(tariff, trip(tariff, "local-sedan", { pickup: "Kochi", drop: "Kochi", plannedKm: 100, plannedHours: 9 }));
  assert.equal(result.base, 3000);
  assert.equal(result.excess, 700);
  assert.equal(result.commercialAmount, 3700);
  tariff.excessPrices["local-sedan"].extraHour = null;
  assert.equal(quote(tariff, trip(tariff, "local-sedan", { pickup: "Kochi", drop: "Kochi", plannedKm: 100, plannedHours: 9 })).commercialAmount, null);
});

test("local excess method is supplier-defined rather than assumed", () => {
  const tariff = card("rc-local-cabs");
  const input = trip(tariff, "local-sedan", { pickup: "Kochi", drop: "Kochi", plannedKm: 100, plannedHours: 9 });
  tariff.rules.excessMethod = "higher";
  assert.equal(quote(tariff, input).excess, 400);
  tariff.rules.excessMethod = null;
  assert.equal(quote(tariff, input).commercialAmount, null);
});

test("an unconfirmed daily carry rule cannot activate or quote", () => {
  const tariff = card("rc-south-coast");
  tariff.rules.carryUnusedKm = null;
  assert.match(validatePrivateTransportTariff(tariff).join(" "), /carry-forward/);
  assert.equal(quote(tariff, trip(tariff, "coast-van", { pickup: "Kochi", drop: "Kochi" })).commercialAmount, null);
});

test("outstation uses supplier's pooled or per-day minimum rule", () => {
  const tariff = card("rc-road-trips");
  const input = trip(tariff, "road-van", { pickup: "Kochi", drop: "Munnar", endDate: "2026-10-14", dropTime: "18:00", plannedKm: 650, plannedHours: 24, dailyKm: [400, 150, 100] });
  const pooled = quote(tariff, input);
  assert.equal(pooled.billableKm, 750);
  assert.equal(pooled.base, 16500);
  assert.equal(pooled.driver, 1500);
  tariff.rules.minimumMethod = "daily";
  const daily = quote(tariff, input);
  assert.equal(daily.billableKm, 900);
  assert.equal(daily.commercialAmount, 21300);
  assert.equal(quote(tariff, { ...input, dailyKm: [400, 150, 90] }).commercialAmount, null);
});

test("daily minimum handles garage and return kilometres only by the supplier's confirmed method", () => {
  const tariff = card("rc-road-trips");
  tariff.rules.minimumMethod = "daily";
  tariff.rules.garageKm = 100;
  tariff.rules.emptyReturnKm = 50;
  const input = trip(tariff, "road-van", { pickup: "Kochi", drop: "Munnar", endDate: "2026-10-14", dropTime: "18:00", plannedKm: 650, dailyKm: [400, 150, 100] });
  assert.equal(quote(tariff, input).commercialAmount, null);
  tariff.rules.dailyExtraKmTreatment = "within-minimum";
  assert.equal(quote(tariff, input).billableKm, 1000);
  tariff.rules.dailyExtraKmTreatment = "after-minimum";
  assert.equal(quote(tariff, input).billableKm, 1050);
});

test("daily hire checks day usage and carry-forward separately", () => {
  const tariff = card("rc-south-coast");
  const input = trip(tariff, "coast-van", { pickup: "Kochi", drop: "Kochi", endDate: "2026-10-13", dropTime: "18:00", plannedKm: 400, plannedHours: 21, dailyKm: [250, 150], dailyHours: [12, 9] });
  const withoutCarry = quote(tariff, input);
  assert.equal(withoutCarry.base, 20000);
  assert.equal(withoutCarry.excess, 2500);
  tariff.rules.carryUnusedKm = true;
  tariff.rules.carryUnusedHours = true;
  assert.equal(quote(tariff, input).excess, 500);
  tariff.rules.carryUnusedKm = false;
  assert.equal(quote(tariff, { ...input, dailyKm: [] }).commercialAmount, null);
});

test("billable days come from service dates and the supplier's day rule", () => {
  const tariff = card("rc-road-trips");
  const input = trip(tariff, "road-sedan", { pickup: "Kochi", drop: "Munnar", date: "2026-10-12", endDate: "2026-10-13", pickupTime: "10:00", dropTime: "10:00", billableDays: 9 });
  assert.equal(resolvePrivateTransportDays(tariff, input), 2);
  tariff.rules.billableDayMethod = "24-hour";
  assert.equal(resolvePrivateTransportDays(tariff, input), 1);
  assert.equal(resolvePrivateTransportDays(tariff, { ...input, dropTime: "09:00", endDate: "2026-10-12" }), null);
});

test("vehicle capacity and unconfirmed luggage block numerical quotes", () => {
  const tariff = card("rc-cityride-fixed");
  assert.equal(quote(tariff, trip(tariff, "city-sedan", { travellers: 4 })).commercialAmount, null);
  assert.equal(quote(tariff, trip(tariff, "city-sedan", { mediumBags: 3 })).commercialAmount, null);
});

test("actuals and tax do not become an invented final supplier payable", () => {
  const tariff = card("rc-cityride-fixed");
  const input = trip(tariff, "city-sedan", { pickup: "Kochi Airport", drop: "Munnar", routeId: "route-2" });
  const result = quote(tariff, input);
  assert.equal(result.commercialAmount, 4500);
  assert.deepEqual(result.actualCharges, ["Toll"]);
  assert.equal(result.supplierPayable, null);
  tariff.charges = [];
  tariff.taxMode = "exclusive";
  assert.equal(quote(tariff, input).supplierPayable, null);
});

test("exclusive supplier tax requires a shared approved profile before activation or payable", () => {
  const tariff = card("rc-cityride-fixed");
  tariff.sourceConfirmed = true;
  tariff.status = "Active";
  tariff.taxMode = "exclusive";
  tariff.taxProfileId = null;
  assert.ok(validatePrivateTransportTariff(tariff).some((issue) => issue.includes("approved supplier tax profile")));
  const result = quote(tariff, trip(tariff, "city-sedan"));
  assert.equal(result.commercialAmount, 1500);
  assert.equal(result.supplierPayable, null);
  tariff.taxProfileId = "approved-demo-tax";
  const withProfile = calculatePrivateTransportQuote(tariff, VEHICLE_OFFERINGS, trip(tariff, "city-sedan"), [{ id: "approved-demo-tax", name: "Test profile", rate: 0.1, approved: true, approvalSource: "Scenario test", recoverable: false }]);
  assert.equal(withProfile.supplierTax, 150);
  assert.equal(withProfile.supplierPayable, 1650);
});

test("missing fixed additional charge does not silently become zero", () => {
  const tariff = card("rc-cityride-fixed");
  tariff.charges.push({ id: "permit", name: "Permit", appliesTo: "All routes", treatment: "fixed", amount: null, chargedPer: "hire", trigger: "always" });
  assert.equal(quote(tariff, trip(tariff, "city-sedan")).commercialAmount, null);
});

test("fixed-transfer excess distance and waiting apply only when supplier rules are present", () => {
  const tariff = card("rc-cityride-fixed");
  tariff.charges.push({ id: "wait", name: "Extra waiting", appliesTo: "Airport routes", routeIds: ["route-1"], treatment: "fixed", amount: 200, chargedPer: "hour", trigger: "waiting-over", includedWaitingMinutes: 30, waitingIncrementMinutes: 60 });
  tariff.charges.push({ id: "distance", name: "Extra distance", appliesTo: "Airport routes", routeIds: ["route-1"], treatment: "fixed", amount: 20, chargedPer: "km", trigger: "distance-over", includedKm: 40 });
  const result = quote(tariff, trip(tariff, "city-sedan", { plannedKm: 50, waitingMinutes: 45 }));
  assert.equal(result.base, 1500);
  assert.equal(result.fixedExtras, 400);
  assert.equal(result.commercialAmount, 1900);
});
