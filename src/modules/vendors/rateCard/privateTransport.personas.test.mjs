import assert from "node:assert/strict";
import { test } from "node:test";
import { calculatePrivateTransportQuote, initialPrivateTransportTrip, localPackageOptions, suggestVehicleArrangements } from "./privateTransport.ts";
import { findPrivateTransportOptions } from "./transportOptions.ts";
import { PRIVATE_TRANSPORT_FIXTURES, VEHICLE_OFFERINGS } from "../data/privateTransportFixtures.ts";

const scenarioTax = { id: "scenario-tax", name: "Scenario tax", rate: 0, approved: true, approvalSource: "Test fixture", recoverable: false };
const fixture = (id) => {
  const card = structuredClone(PRIVATE_TRANSPORT_FIXTURES.find((item) => item.id === id));
  card.tariff = { ...card.tariff, illustrative: false, sourceConfirmed: true, status: "Active", taxProfileId: scenarioTax.id };
  return card;
};
const input = (tariff, changes = {}) => ({ ...initialPrivateTransportTrip(tariff, "2026-10-10", 2), ...changes });
const quote = (tariff, trip, tax = [scenarioTax]) => calculatePrivateTransportQuote(tariff, VEHICLE_OFFERINGS, trip, tax);
const noActuals = (tariff) => { tariff.charges = tariff.charges.map((charge) => charge.treatment === "actual" ? { ...charge, treatment: "included" } : charge); return tariff; };

test("P1 couple: the vehicle, bags, covered airport route and inclusive amount resolve", () => {
  const tariff = fixture("rc-cityride-fixed").tariff;
  const trip = input(tariff, { routeId: "route-fort-kochi", pickup: "Kochi Airport", drop: "Fort Kochi hotel", vehicleId: "city-sedan", vehicleAllocations: [{ vehicleId: "city-sedan", quantity: 1 }], largeBags: 2, cabinBags: 2, mediumBags: 0 });
  assert.equal(quote(tariff, trip).supplierPayable, 1800);
  assert.equal(quote(tariff, { ...trip, travellers: 3 }).base, 1800);
});

test("P2 late family: child seats and luggage select MUV or Van and trigger night once", () => {
  const tariff = fixture("rc-cityride-fixed").tariff;
  const trip = input(tariff, { routeId: "route-2", pickup: "Kochi Airport", drop: "Munnar", pickupTime: "23:45", travellers: 6, mediumBags: 0, largeBags: 4, cabinBags: 3 });
  const suggested = suggestVehicleArrangements(VEHICLE_OFFERINGS.filter((item) => tariff.vehicleIds.includes(item.id)), trip);
  assert.ok(suggested.some((rows) => rows.length === 1 && rows[0].vehicleId === "city-muv"));
  const result = quote(tariff, { ...trip, vehicleId: "city-muv", vehicleAllocations: [{ vehicleId: "city-muv", quantity: 1 }] });
  assert.equal(result.base, 5500);
  assert.equal(result.fixedExtras, 500);
  assert.deepEqual(result.actualCharges, ["Toll"]);
  assert.equal(result.supplierPayable, null);
});

test("P3 Jaipur 9h/95km uses full MUV package plus both overages", () => {
  const tariff = fixture("rc-jaipur-local").tariff;
  const trip = input(tariff, { pickup: "Jaipur", drop: "Jaipur", travellers: 5, mediumBags: 0, vehicleId: "jaipur-muv", vehicleAllocations: [{ vehicleId: "jaipur-muv", quantity: 1 }], plannedKm: 95, plannedHours: 9 });
  assert.equal(localPackageOptions(tariff, trip)[0].id, "full");
  const result = quote(tariff, { ...trip, packageId: "full" });
  assert.equal(result.base, 4200);
  assert.equal(result.excess, 775);
  assert.equal(result.commercialAmount, 4975);
});

test("P4 Bengaluru 7h/65km pays only its full package", () => {
  const tariff = fixture("rc-bengaluru-local").tariff;
  const trip = input(tariff, { pickup: "Bengaluru", drop: "Bengaluru", travellers: 4, mediumBags: 0, vehicleId: "bengaluru-muv", vehicleAllocations: [{ vehicleId: "bengaluru-muv", quantity: 1 }], plannedKm: 65, plannedHours: 7 });
  assert.equal(localPackageOptions(tariff, trip)[0].id, "full");
  const result = quote(tariff, { ...trip, packageId: "full" });
  assert.equal(result.commercialAmount, 4200);
  assert.equal(result.excess, 0);
});

test("P5 intercity is still a fixed transfer; bags make the Van suitable", () => {
  const tariff = fixture("rc-cityride-fixed").tariff;
  const trip = input(tariff, { routeId: "route-3", pickup: "Munnar", drop: "Thekkady", travellers: 6, mediumBags: 6, vehicleId: "city-van", vehicleAllocations: [{ vehicleId: "city-van", quantity: 1 }] });
  assert.equal(quote(tariff, trip).base, 7000);
  assert.equal(quote(tariff, { ...trip, vehicleId: "city-muv", vehicleAllocations: [{ vehicleId: "city-muv", quantity: 1 }] }).commercialAmount, null);
});

test("P6 one five-day hire pools minimum kilometres and includes tour manager seat", () => {
  const tariff = fixture("rc-road-trips").tariff;
  const trip = input(tariff, { pickup: "Kochi", drop: "Kochi Airport", date: "2026-10-10", endDate: "2026-10-14", dropTime: "18:00", travellers: 10, guideSeats: 1, mediumBags: 10, vehicleId: "road-van", vehicleAllocations: [{ vehicleId: "road-van", quantity: 1 }], plannedKm: 850 });
  const result = quote(tariff, trip);
  assert.equal(result.billableKm, 1250);
  assert.equal(result.base, 27500);
  assert.equal(result.driver, 2500);
  assert.equal(result.commercialAmount, 30000);
});

test("P7 distance above minimum wins and driver is separate", () => {
  const tariff = noActuals(fixture("rc-road-trips").tariff);
  tariff.outstationPrices["road-coach"] = { ratePerKm: 25, minKmPerDay: 250, driverPerDay: 600 };
  const trip = input(tariff, { pickup: "Kochi", drop: "Kochi", date: "2026-10-10", endDate: "2026-10-13", dropTime: "18:00", travellers: 14, mediumBags: 14, vehicleId: "road-coach", vehicleAllocations: [{ vehicleId: "road-coach", quantity: 1 }], plannedKm: 1350 });
  const result = quote(tariff, trip);
  assert.equal(result.billableKm, 1350);
  assert.equal(result.base, 33750);
  assert.equal(result.driver, 2400);
  assert.equal(result.supplierPayable, 36150);
});

test("P8 daily Van hire charges two days and only Day 2 extra hours", () => {
  const tariff = fixture("rc-south-coast").tariff;
  const trip = input(tariff, { pickup: "Bengaluru", drop: "Bengaluru", date: "2026-10-10", endDate: "2026-10-11", dropTime: "18:00", travellers: 7, mediumBags: 0, vehicleId: "coast-van", vehicleAllocations: [{ vehicleId: "coast-van", quantity: 1 }], plannedKm: 320, plannedHours: 21, dailyKm: [140, 180], dailyHours: [9, 12] });
  const result = quote(tariff, trip);
  assert.equal(result.base, 20000);
  assert.equal(result.excess, 1000);
  assert.equal(result.commercialAmount, 21000);
});

test("P9/P10 coach and mixed fleets respect both seats and luggage", () => {
  const coast = fixture("rc-south-coast").tariff;
  const group = input(coast, { travellers: 31, mediumBags: 25 });
  const coastOptions = suggestVehicleArrangements(VEHICLE_OFFERINGS.filter((item) => coast.vehicleIds.includes(item.id)), group);
  assert.ok(coastOptions.some((rows) => rows.length === 1 && rows[0].vehicleId === "coast-coach"));
  const fixed = fixture("rc-cityride-fixed").tariff;
  const wedding = input(fixed, { travellers: 18, mediumBags: 0, largeBags: 16 });
  const options = suggestVehicleArrangements(VEHICLE_OFFERINGS.filter((item) => fixed.vehicleIds.includes(item.id)), wedding);
  assert.ok(options.some((rows) => rows.length === 1 && rows[0].vehicleId === "city-coach"));
  assert.ok(!options.some((rows) => rows.length === 2 && rows.some((row) => row.vehicleId === "city-van" && row.quantity === 1) && rows.some((row) => row.vehicleId === "city-muv" && row.quantity === 1)));
});

test("P11/P12 split arrivals and multi-method vendor keep separate requirements/cards", () => {
  const card = fixture("rc-cityride-fixed");
  const first = input(card.tariff, { travellers: 5, vehicleId: "city-muv", vehicleAllocations: [{ vehicleId: "city-muv", quantity: 1 }] });
  const second = input(card.tariff, { travellers: 3, pickupTime: "18:30", vehicleId: "city-sedan", vehicleAllocations: [{ vehicleId: "city-sedan", quantity: 1 }] });
  assert.equal(quote(card.tariff, first).base, 2000);
  assert.equal(quote(card.tariff, second).base, 1500);
  assert.equal(PRIVATE_TRANSPORT_FIXTURES.filter((item) => item.vendorId === "trailmakers").length, 4);
});

test("P13 same route finds two distinct fixed-transfer vendors and their own fares", () => {
  const cards = PRIVATE_TRANSPORT_FIXTURES.filter((item) => item.tariff.template === "fixed-transfer").map((item) => ({ id: item.id, name: item.name, vendor: item.vendorName, tariff: fixture(item.id).tariff }));
  const trip = input(cards[0].tariff, { pickup: "Kochi Airport", drop: "Munnar", routeId: "route-2", travellers: 5, mediumBags: 0 });
  const options = findPrivateTransportOptions(cards, VEHICLE_OFFERINGS, trip, [scenarioTax]);
  assert.deepEqual(options.map((item) => [item.vendor, item.quote.base]), [["Trailmakers Experiences", 5200], ["CityRide Transfers", 5500]]);
});

test("P13 alternative per-km pricing appears only after the trip distance is entered", () => {
  const cards = PRIVATE_TRANSPORT_FIXTURES.filter((item) => ["rc-cityride-fixed", "rc-road-trips"].includes(item.id)).map((item) => ({ id: item.id, name: item.name, vendor: item.vendorName, tariff: fixture(item.id).tariff }));
  const transfer = input(cards[0].tariff, { pickup: "Kochi Airport", drop: "Munnar", routeId: "route-2", travellers: 5, mediumBags: 0 });
  assert.deepEqual(findPrivateTransportOptions(cards, VEHICLE_OFFERINGS, transfer, [scenarioTax]).map((item) => item.tariff.template), ["fixed-transfer"]);
  const alternatives = findPrivateTransportOptions(cards, VEHICLE_OFFERINGS, { ...transfer, plannedKm: 300, endDate: "2026-10-10", dropTime: "18:00" }, [scenarioTax]);
  assert.deepEqual(new Set(alternatives.map((item) => item.tariff.template)), new Set(["fixed-transfer", "outstation-km"]));
  assert.ok(alternatives.find((item) => item.tariff.template === "outstation-km")?.quote.actualCharges.includes("Toll"));
});

test("P14 unknown required permit cannot be treated as zero", () => {
  const tariff = fixture("rc-road-trips").tariff;
  tariff.charges = tariff.charges.map((charge) => charge.name === "Permit" ? { ...charge, treatment: "unconfirmed" } : charge);
  const trip = input(tariff, { pickup: "Kochi", drop: "Munnar", vehicleId: "road-sedan", vehicleAllocations: [{ vehicleId: "road-sedan", quantity: 1 }], plannedKm: 350 });
  assert.equal(quote(tariff, trip).commercialAmount, null);
});

test("P15/P16 shared approved profile extracts inclusive tax or adds exclusive tax", () => {
  const tariff = noActuals(fixture("rc-cityride-fixed").tariff);
  tariff.routes[0].prices["city-sedan"] = 5250;
  tariff.taxProfileId = "test-only-tax";
  const profiles = [{ id: "test-only-tax", name: "Hypothetical scenario rate", rate: 0.1, approved: true, approvalSource: "Scenario test only", recoverable: false }];
  const trip = input(tariff, { vehicleId: "city-sedan", vehicleAllocations: [{ vehicleId: "city-sedan", quantity: 1 }] });
  const inclusive = quote(tariff, trip, profiles);
  assert.equal(inclusive.supplierPayable, 5250);
  assert.equal(inclusive.supplierTax, 477);
  tariff.routes[0].prices["city-sedan"] = 5000;
  tariff.taxMode = "exclusive";
  const exclusive = quote(tariff, trip, profiles);
  assert.equal(exclusive.commercialAmount, 5000);
  assert.equal(exclusive.supplierTax, 500);
  assert.equal(exclusive.supplierPayable, 5500);
});

test("supplier payable stays separate from agency cost when approved input tax is recoverable", () => {
  const tariff = noActuals(fixture("rc-cityride-fixed").tariff);
  tariff.routes[0].prices["city-sedan"] = 5250;
  tariff.taxProfileId = "recoverable-scenario";
  const profiles = [{ id: "recoverable-scenario", name: "Scenario tax", rate: 0.1, approved: true, approvalSource: "Test fixture", recoverable: true }];
  const trip = input(tariff, { vehicleId: "city-sedan", vehicleAllocations: [{ vehicleId: "city-sedan", quantity: 1 }] });
  const inclusive = quote(tariff, trip, profiles);
  assert.equal(inclusive.supplierPayable, 5250);
  assert.equal(inclusive.costBasis, 4773);
  tariff.taxMode = "exclusive";
  tariff.routes[0].prices["city-sedan"] = 5000;
  const exclusive = quote(tariff, trip, profiles);
  assert.equal(exclusive.supplierPayable, 5500);
  assert.equal(exclusive.costBasis, 5000);
});

test("P17 larger revised group invalidates original Van arrangement", () => {
  const tariff = fixture("rc-cityride-fixed").tariff;
  const original = input(tariff, { routeId: "route-resort", pickup: "Kochi Airport", drop: "Kochi Resort", travellers: 8, mediumBags: 8, vehicleId: "city-van", vehicleAllocations: [{ vehicleId: "city-van", quantity: 1 }] });
  assert.equal(quote(tariff, original).base, 4800);
  const updated = quote(tariff, { ...original, travellers: 15, mediumBags: 15 });
  assert.equal(updated.commercialAmount, null);
  assert.ok(updated.blockers.some((issue) => issue.includes("do not fit")));
});

test("P18 actual 900 km revises original 750 km once by the difference", () => {
  const tariff = noActuals(fixture("rc-road-trips").tariff);
  const trip = input(tariff, { pickup: "Kochi", drop: "Kochi", date: "2026-10-10", endDate: "2026-10-12", dropTime: "18:00", travellers: 10, mediumBags: 10, vehicleId: "road-van", vehicleAllocations: [{ vehicleId: "road-van", quantity: 1 }], plannedKm: 750 });
  const accepted = quote(tariff, trip);
  const actual = quote(tariff, { ...trip, plannedKm: 900 });
  assert.equal(accepted.supplierPayable, 18000);
  assert.equal(actual.supplierPayable, 21300);
  assert.equal(actual.supplierPayable - accepted.supplierPayable, 3300);
});

test("demo tariffs remain visible for testing but cannot become approved supplier payables", () => {
  const tariff = structuredClone(PRIVATE_TRANSPORT_FIXTURES.find((item) => item.id === "rc-cityride-fixed").tariff);
  const result = quote(tariff, input(tariff, { vehicleId: "city-sedan", vehicleAllocations: [{ vehicleId: "city-sedan", quantity: 1 }] }));
  assert.equal(tariff.status, "Draft");
  assert.equal(result.commercialAmount, 1500);
  assert.equal(result.supplierPayable, null);
});

test("a newly priced route needs explicit toll, parking and permit treatment", () => {
  const tariff = fixture("rc-cityride-fixed").tariff;
  tariff.routes.push({ id: "new-route", from: "Kochi Airport", to: "New Resort", prices: Object.fromEntries(tariff.vehicleIds.map((id) => [id, 2000])) });
  const result = quote(tariff, input(tariff, { routeId: "new-route", pickup: "Kochi Airport", drop: "New Resort", vehicleId: "city-sedan", vehicleAllocations: [{ vehicleId: "city-sedan", quantity: 1 }] }));
  assert.equal(result.commercialAmount, null);
  assert.match(result.blockers.join(" "), /required supplier charge/);
});

test("overlapping included and payable charge rules cannot silently double-charge a route", () => {
  const tariff = fixture("rc-cityride-fixed").tariff;
  tariff.charges.push({ id: "second-toll", name: "Toll", appliesTo: "Intercity routes", routeIds: ["route-2"], treatment: "fixed", amount: 300, chargedPer: "hire", trigger: "always" });
  const result = quote(tariff, input(tariff, { routeId: "route-2", pickup: "Kochi Airport", drop: "Munnar", vehicleId: "city-sedan", vehicleAllocations: [{ vehicleId: "city-sedan", quantity: 1 }] }));
  assert.equal(result.commercialAmount, null);
  assert.match(result.blockers.join(" "), /overlapping treatments/);
});

test("combined luggage cannot use independent category maximums at the same time", () => {
  const tariff = fixture("rc-cityride-fixed").tariff;
  const result = quote(tariff, input(tariff, { vehicleId: "city-sedan", vehicleAllocations: [{ vehicleId: "city-sedan", quantity: 1 }], mediumBags: 2, largeBags: 2, cabinBags: 2 }));
  assert.equal(result.commercialAmount, null);
  assert.match(result.blockers.join(" "), /combined luggage/);
});

test("a night surcharge has no assumed time window", () => {
  const tariff = fixture("rc-cityride-fixed").tariff;
  tariff.charges.find((charge) => charge.id === "night").triggerStart = undefined;
  const result = quote(tariff, input(tariff, { vehicleId: "city-sedan", vehicleAllocations: [{ vehicleId: "city-sedan", quantity: 1 }], pickupTime: "23:45" }));
  assert.equal(result.commercialAmount, null);
  assert.match(result.blockers.join(" "), /night-charge time window/);
});

test("negative large and cabin bag counts cannot make a vehicle appear suitable", () => {
  const tariff = fixture("rc-cityride-fixed").tariff;
  const result = quote(tariff, input(tariff, { vehicleId: "city-sedan", vehicleAllocations: [{ vehicleId: "city-sedan", quantity: 1 }], largeBags: -2, cabinBags: -2 }));
  assert.equal(result.commercialAmount, null);
  assert.match(result.blockers.join(" "), /valid traveller and luggage counts/);
});

test("P18 supplier actuals and added distance resolve against the same approved tariff", () => {
  const tariff = fixture("rc-road-trips").tariff;
  const original = input(tariff, { pickup: "Kochi", drop: "Kochi", date: "2026-10-10", endDate: "2026-10-12", dropTime: "18:00", travellers: 10, mediumBags: 10, vehicleId: "road-van", vehicleAllocations: [{ vehicleId: "road-van", quantity: 1 }], plannedKm: 750 });
  assert.equal(quote(tariff, original).supplierPayable, null);
  const actual = quote(tariff, { ...original, plannedKm: 900, actualChargeAmounts: { permit: 0, toll: 500, parking: 300 } });
  assert.equal(actual.base, 19800);
  assert.equal(actual.driver, 1500);
  assert.equal(actual.verifiedActuals, 800);
  assert.equal(actual.supplierPayable, 22100);
});
