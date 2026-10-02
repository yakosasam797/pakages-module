import assert from "node:assert/strict";
import { test } from "node:test";
import { calculatePrivateTransportQuote, initialPrivateTransportTrip } from "../src/modules/vendors/rateCard/privateTransport.ts";
import { PRIVATE_TRANSPORT_FIXTURES, VEHICLE_OFFERINGS } from "../src/modules/vendors/data/privateTransportFixtures.ts";
import { confirmTransportSupplier, recordTransportAmendment, recordTransportBookingHandoff, readTransportBookingHandoffs, transportSupplierObligations } from "../src/bookingTransportHandoff.ts";

test("an accepted transport hire and its actual-distance revision create one current supplier obligation", () => {
  const data = new Map();
  globalThis.localStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  const tariff = structuredClone(PRIVATE_TRANSPORT_FIXTURES.find((item) => item.id === "rc-road-trips").tariff);
  tariff.illustrative = false;
  tariff.sourceConfirmed = true;
  tariff.status = "Active";
  tariff.taxProfileId = "scenario-tax";
  const taxProfiles = [{ id: "scenario-tax", name: "Scenario tax", rate: 0, approved: true, approvalSource: "Test fixture", recoverable: false }];
  tariff.charges = tariff.charges.map((charge) => charge.treatment === "actual" ? { ...charge, treatment: "included" } : charge);
  const input = { ...initialPrivateTransportTrip(tariff, "2026-10-10", 10), pickup: "Kochi", drop: "Kochi", endDate: "2026-10-12", dropTime: "18:00", mediumBags: 10, plannedKm: 750, vehicleId: "road-van", vehicleAllocations: [{ vehicleId: "road-van", quantity: 1 }] };
  const snapshot = { vendorId: tariff.vendorId, serviceId: tariff.serviceId, vendorName: "Kerala Road Trips", cardName: "Kerala outstation kilometre tariff", currency: "INR", version: 1, pricedAt: "2026-10-01T00:00:00Z", input, result: calculatePrivateTransportQuote(tariff, VEHICLE_OFFERINGS, input, taxProfiles), tariff, vehicles: VEHICLE_OFFERINGS, taxProfiles };
  assert.equal(snapshot.result.supplierPayable, 18000);
  const proposal = { id: "PRP-TEST", name: "Kapoor Kerala trip", status: "Approved", acceptedVersion: 1, days: [{ id: "day-1", services: [{ id: "transport-1", title: "Five-day private hire", transportHireId: "hire-1", privateTransportSnapshot: snapshot }] }, { id: "day-2", services: [{ id: "transport-2", title: "Same retained hire", transportHireId: "hire-1", privateTransportSnapshot: snapshot }] }] };
  recordTransportBookingHandoff(proposal);
  recordTransportBookingHandoff(proposal);
  assert.equal(readTransportBookingHandoffs()[0].services.length, 1);
  const actual = { ...input, plannedKm: 900 };
  const first = recordTransportAmendment("PRP-TEST", 1, "transport-1", "supplier-trip-sheet-1", actual, "Trip sheet confirmed");
  const again = recordTransportAmendment("PRP-TEST", 1, "transport-1", "supplier-trip-sheet-1", actual, "Trip sheet confirmed");
  assert.equal(first.supplierDelta, 3300);
  assert.deepEqual(again, first);
  assert.equal(readTransportBookingHandoffs()[0].services[0].amendments.length, 1);
  assert.equal(transportSupplierObligations().length, 0);
  confirmTransportSupplier("PRP-TEST", 1, "transport-1", "SUPPLIER-BOOKING-1");
  assert.equal(transportSupplierObligations()[0].payable, 21300);
});

test("a newly accepted proposal version supersedes its earlier supplier obligation", () => {
  const result = transportSupplierObligations([
    { proposalId: "PRP-ONE", acceptedVersion: 1, proposalName: "Trip", services: [{ hireId: "hire-1", title: "Old hire", snapshot: { vendorName: "Vendor", currency: "INR", result: { supplierPayable: 18000 } }, amendments: [], confirmedAt: "2026-10-01", supplierConfirmationRef: "OLD-BOOKING", confirmedSupplierPayable: 18000 }] },
    { proposalId: "PRP-ONE", acceptedVersion: 2, proposalName: "Trip", services: [{ hireId: "hire-1", title: "Revised hire", snapshot: { vendorName: "Vendor", currency: "INR", result: { supplierPayable: 22000 } }, amendments: [], confirmedAt: "2026-10-02", supplierConfirmationRef: "NEW-BOOKING", confirmedSupplierPayable: 22000 }] },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].payable, 22000);
});

test("Finance keeps independently confirmed hires while another hire or revision awaits confirmation", () => {
  const snapshot = (payable) => ({ vendorName: "Vendor", currency: "INR", result: { supplierPayable: payable } });
  const confirmed = (hireId, payable) => ({ hireId, title: hireId, snapshot: snapshot(payable), amendments: [], confirmedAt: "2026-10-01", supplierConfirmationRef: `SUP-${hireId}`, confirmedSupplierPayable: payable });
  const pending = (hireId, payable) => ({ hireId, title: hireId, snapshot: snapshot(payable), amendments: [] });
  const result = transportSupplierObligations([
    { proposalId: "PRP-MULTI", acceptedVersion: 1, proposalName: "Trip", services: [confirmed("arrival", 1500), confirmed("departure", 2200)] },
    { proposalId: "PRP-MULTI", acceptedVersion: 2, proposalName: "Trip", services: [pending("arrival", 1800), confirmed("sightseeing", 4200)] },
  ]);
  assert.equal(result.length, 3);
  assert.equal(result.find((item) => item.id === "PRP-MULTI:1:arrival")?.payable, 1500);
  assert.equal(result.find((item) => item.id === "PRP-MULTI:1:departure")?.payable, 2200);
  assert.equal(result.find((item) => item.id === "PRP-MULTI:2:sightseeing")?.payable, 4200);
});

test("accepted base-plus-actuals hire waits for invoice and confirmation before Finance", () => {
  const data = new Map();
  globalThis.localStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  const tariff = structuredClone(PRIVATE_TRANSPORT_FIXTURES.find((item) => item.id === "rc-road-trips").tariff);
  Object.assign(tariff, { illustrative: false, sourceConfirmed: true, status: "Active", taxProfileId: "scenario-tax" });
  const taxProfiles = [{ id: "scenario-tax", name: "Scenario tax", rate: 0, approved: true, approvalSource: "Test fixture", recoverable: false }];
  const input = { ...initialPrivateTransportTrip(tariff, "2026-10-10", 10), pickup: "Kochi", drop: "Kochi", endDate: "2026-10-12", dropTime: "18:00", mediumBags: 10, plannedKm: 750, vehicleId: "road-van", vehicleAllocations: [{ vehicleId: "road-van", quantity: 1 }] };
  const result = calculatePrivateTransportQuote(tariff, VEHICLE_OFFERINGS, input, taxProfiles);
  assert.equal(result.commercialAmount, 18000);
  assert.equal(result.supplierPayable, null);
  const snapshot = { vendorId: tariff.vendorId, serviceId: tariff.serviceId, vendorName: "Kerala Road Trips", cardName: "Kerala outstation kilometre tariff", currency: "INR", version: 1, pricedAt: "2026-10-01T00:00:00Z", input, result, tariff, vehicles: VEHICLE_OFFERINGS, taxProfiles };
  const proposal = { id: "PRP-ACTUALS", name: "Kerala trip", status: "Approved", acceptedVersion: 1, days: [{ id: "day-1", services: [{ id: "hire-actuals", title: "Private hire", transportHireId: "hire-actuals", privateTransportSnapshot: snapshot }] }] };
  recordTransportBookingHandoff(proposal);
  assert.equal(transportSupplierObligations().length, 0);
  assert.equal(recordTransportAmendment("PRP-ACTUALS", 1, "hire-actuals", "invoice-1", { ...input, plannedKm: 900, actualChargeAmounts: { toll: 500, parking: 300 } }, "Incomplete invoice"), null);
  const amendment = recordTransportAmendment("PRP-ACTUALS", 1, "hire-actuals", "invoice-1", { ...input, plannedKm: 900, actualChargeAmounts: { permit: 0, toll: 500, parking: 300 } }, "Supplier invoice");
  assert.equal(amendment.supplierPayable, 22100);
  assert.equal(amendment.supplierDelta, 4100);
  assert.equal(transportSupplierObligations().length, 0);
  assert.equal(confirmTransportSupplier("PRP-ACTUALS", 1, "hire-actuals", ""), null);
  assert.equal(confirmTransportSupplier("PRP-ACTUALS", 1, "hire-actuals", "SUPPLIER-BOOKING-2"), 22100);
  assert.equal(transportSupplierObligations()[0].payable, 22100);
  assert.equal(transportSupplierObligations().length, 1);
});
