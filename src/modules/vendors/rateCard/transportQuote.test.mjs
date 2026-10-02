import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateTransportQuote } from "./transportQuote.ts";

const tariff = {
  serviceType: "airport-transfer",
  pricingMethod: "fixed-per-vehicle",
  timezone: "Asia/Kolkata",
  validFrom: "2026-01-01",
  validTo: "2026-12-31",
  quoteValidUntil: "2099-12-31",
  availability: "not-held",
  taxPresentation: "included",
  distanceBasis: "Pickup to drop",
  waitingIncludedMinutes: 45,
  waitingRatePerHour: 300,
  waitingRounding: "Whole hours after 45 minutes, supplier confirmed",
  offerings: [{ id: "SUV", label: "SUV", passengerSeats: 6, luggageBags: 3, modelOrEquivalent: "SUV or equivalent" }],
  routes: [{ id: "airport-city", label: "Airport to city", from: "Airport", to: "City", includedKm: 40, prices: { SUV: 3200 } }],
  charges: [{ id: "fuel", label: "Fuel", treatment: "included", amount: null, unit: "transfer", paidBy: "agency", collectedBy: "supplier", note: "" }],
};
const input = {
  travelDate: "2026-10-12", routeId: "airport-city", additionalStops: "", offeringId: "SUV", travellers: 2, staffSeats: 0, bags: 2,
  passengerSeats: null, luggageBags: null, vehicles: 1, plannedKm: 30, billableWaitingHours: 0,
};

test("fixed transfer is priced per vehicle rather than per traveller", () => {
  assert.equal(calculateTransportQuote(tariff, input).knownSupplierAmount, 3200);
  assert.equal(calculateTransportQuote(tariff, { ...input, travellers: 6 }).knownSupplierAmount, 3200);
  assert.equal(calculateTransportQuote(tariff, { ...input, travellers: 7, vehicles: 2 }).knownSupplierAmount, 6400);
});

test("seat and luggage requirements both determine the minimum vehicle count", () => {
  const result = calculateTransportQuote(tariff, { ...input, travellers: 7, bags: 7 });
  assert.equal(result.minimumVehicles, 3);
  assert.match(result.blockers.join(" "), /3 vehicles are needed/);
});

test("included charges do not stack; confirmed waiting and fixed extras do", () => {
  const withExtras = { ...tariff, charges: [...tariff.charges, { id: "parking", label: "Parking", treatment: "fixed", amount: 500, unit: "transfer", paidBy: "agency", collectedBy: "supplier", note: "" }] };
  const result = calculateTransportQuote(withExtras, { ...input, billableWaitingHours: 1 });
  assert.equal(result.baseFare, 3200);
  assert.equal(result.waitingCharge, 300);
  assert.equal(result.fixedExtras, 500);
  assert.equal(result.knownSupplierAmount, 4000);
});

test("route and unresolved supplier terms prevent a fixed quote", () => {
  const unresolved = { ...tariff, charges: [{ id: "tolls", label: "Tolls", treatment: "unconfirmed", amount: null, unit: "transfer", paidBy: "unconfirmed", collectedBy: "unconfirmed", note: "" }] };
  const result = calculateTransportQuote(unresolved, { ...input, plannedKm: 45 });
  assert.equal(result.quoteBasis, "needs-review");
  assert.match(result.blockers.join(" "), /exceeds this transfer/);
  assert.match(result.blockers.join(" "), /Confirm tolls treatment/);
});

test("direct customer payments stay out of the agency supplier amount", () => {
  const direct = { ...tariff, charges: [...tariff.charges, { id: "parking", label: "Parking", treatment: "fixed", amount: 500, unit: "transfer", paidBy: "customer", collectedBy: "driver", note: "" }] };
  const result = calculateTransportQuote(direct, input);
  assert.equal(result.knownSupplierAmount, 3200);
  assert.deepEqual(result.directPayments, ["Parking"]);
});
