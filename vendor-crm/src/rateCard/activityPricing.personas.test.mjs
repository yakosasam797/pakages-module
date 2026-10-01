import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateActivityQuote, snapshotActivityQuote, validateActivityTariff } from "./activityPricing.ts";

const option = (id, update = {}) => ({ id, name: id, category: "Guided tour", delivery: "shared", duration: "2 hours", capacity: null, session: "", ...update });
const tariff = (vendorId, serviceId, update = {}) => ({ schemaVersion: 1, vendorId, serviceId, version: 1, validFrom: "2026-04-01", validTo: "2027-03-31", sourceDocument: "Isolated supplier fixture", sourceConfirmed: true, methods: ["person"], personRates: [], bookingRates: [], unitRates: [], charges: [], adjustments: [], taxMode: "inclusive", taxProfileId: "approved-fixture", approvedTaxRate: 0, taxApprovalSource: "Approved fixture", commercialPolicy: "", ...update });
const person = (id, optionId, category, minAge, maxAge, amount, update = {}) => ({ id, optionId, category, minAge, maxAge, minGroup: null, maxGroup: null, state: amount === 0 ? "complimentary" : "priced", amount, ...update });
const group = (id, optionId, minGroup, maxGroup, amount) => ({ id, optionId, minGroup, maxGroup, basisLabel: "Per group", state: "priced", amount });
const unit = (id, optionId, name, amount, capacityPerUnit, basis = "session") => ({ id, optionId, unit: name, basis, duration: basis === "session" ? 2 : null, capacityPerUnit, state: "priced", amount });
const input = (optionId, method, update = {}) => ({ date: "2026-10-12", optionId, method, participants: [], groupSize: 0, unitRateId: "", unitQuantity: 0, hours: 2, days: 1, selectedChargeIds: [], transferCostedElsewhere: false, ...update });
const people = (...rows) => rows.map(([category, age, quantity]) => ({ category, age, quantity }));
const total = (card, options, request) => calculateActivityQuote(card, options, request).supplierTotal;

test("1. family age bands price museum and cruise; complimentary child still occupies a seat", () => {
  const museum = option("museum");
  const cruise = option("cruise", { capacity: 4 });
  const party = people(["Adult", 35, 2], ["Child", 8, 1], ["Infant", 3, 1]);
  const museumCard = tariff("museum-vendor", "museum-service", { personRates: [person("ma", "museum", "Adult", 13, null, 800), person("mc", "museum", "Child", 4, 12, 400), person("mi", "museum", "Infant", 0, 3, 0)] });
  const cruiseCard = tariff("cruise-vendor", "cruise-service", { personRates: [person("ca", "cruise", "Adult", 12, null, 1500), person("cc", "cruise", "Child", 4, 11, 900), person("ci", "cruise", "Infant", 0, 3, 0)] });
  assert.equal(total(museumCard, [museum], input("museum", "person", { participants: party })), 2000);
  assert.equal(total(cruiseCard, [cruise], input("cruise", "person", { participants: party })), 3900);
  assert.match(calculateActivityQuote(cruiseCard, [{ ...cruise, capacity: 3 }], input("cruise", "person", { participants: party })).blockers.join(" "), /capacity of 3/);
});

test("2. shared and private are alternative base fares; included vehicle is not an activity extra", () => {
  const shared = option("shared"); const privateOption = option("private", { delivery: "private", capacity: 4 });
  const card = tariff("guide", "city-tour", { methods: ["person", "booking"], personRates: [person("shared-adult", "shared", "Adult", null, null, 1200)], bookingRates: [group("private", "private", 1, 4, 5000)], charges: [{ id: "vehicle", name: "Local sightseeing vehicle", optionIds: ["private"], treatment: "included", mandatory: true, basis: "booking", amount: null, taxProfileId: null }] });
  assert.equal(total(card, [shared, privateOption], input("shared", "person", { participants: people(["Adult", 30, 2]) })), 2400);
  assert.equal(total(card, [shared, privateOption], input("private", "booking", { groupSize: 2 })), 5000);
});

test("3. one group-size tier applies to all class participants and capacity is enforced", () => {
  const classOption = option("class", { capacity: 15 });
  const card = tariff("chef", "class-service", { personRates: [person("t1", "class", "Adult", null, null, 2000, { minGroup: 1, maxGroup: 5 }), person("t2", "class", "Adult", null, null, 1800, { minGroup: 6, maxGroup: 10 }), person("t3", "class", "Adult", null, null, 1600, { minGroup: 11, maxGroup: 15 })] });
  for (const [quantity, expected] of [[5, 10000], [6, 10800], [10, 18000], [11, 17600], [12, 19200], [15, 24000]]) assert.equal(total(card, [classOption], input("class", "person", { participants: people(["Adult", 30, quantity]) })), expected);
  assert.equal(total(card, [classOption], input("class", "person", { participants: people(["Adult", 30, 16]) })), null);
});

test("4. safari jeeps need explicit quantity and category-specific mandatory admission", () => {
  const safari = option("safari");
  const card = tariff("park", "safari-service", { methods: ["unit"], unitRates: [unit("jeep", "safari", "Jeep", 6000, 6)], charges: [
    { id: "adult-admission", name: "Adult park admission", optionIds: ["safari"], treatment: "additional", mandatory: true, basis: "person", participantCategory: "Adult", amount: 500, taxProfileId: null },
    { id: "child-admission", name: "Child park admission", optionIds: ["safari"], treatment: "additional", mandatory: true, basis: "person", participantCategory: "Child", amount: 250, taxProfileId: null },
  ] });
  const request = input("safari", "unit", { groupSize: 7, participants: people(["Adult", 30, 5], ["Child", 8, 2]), unitRateId: "jeep", unitQuantity: 2 });
  assert.equal(total(card, [safari], request), 15000);
  assert.equal(total(card, [safari], { ...request, unitQuantity: 1 }), null);
});

test("5. mixed kayak units price separately and their capacities combine", () => {
  const kayak = option("kayak");
  const card = tariff("outfitter", "kayak-service", { methods: ["unit"], unitRates: [unit("tandem", "kayak", "Tandem kayak", 800, 2, "hour"), unit("single", "kayak", "Single kayak", 500, 1, "hour")], charges: [{ id: "jackets", name: "Life jackets", optionIds: ["kayak"], treatment: "included", mandatory: true, basis: "person", amount: null, taxProfileId: null }] });
  const request = input("kayak", "unit", { groupSize: 5, unitSelections: [{ rateId: "tandem", quantity: 2, hours: 2 }, { rateId: "single", quantity: 1, hours: 2 }] });
  assert.equal(total(card, [kayak], request), 4200);
  assert.equal(total(card, [kayak], { ...request, unitSelections: request.unitSelections.slice(0, 1) }), null);
});

test("6. guide group band charges once and never auto-splits nine travellers", () => {
  const walk = option("walk", { capacity: 8 });
  const card = tariff("guide", "walk-service", { methods: ["booking"], bookingRates: [group("g1", "walk", 1, 4, 3000), group("g2", "walk", 5, 8, 4500)] });
  assert.equal(total(card, [walk], input("walk", "booking", { groupSize: 7 })), 4500);
  assert.equal(total(card, [walk], input("walk", "booking", { groupSize: 9 })), null);
});

test("7. minimum participation blocks solo unless a supplier minimum bill is saved", () => {
  const reef = option("reef", { minParticipants: 2 });
  const card = tariff("reef-guide", "reef-service", { personRates: [person("p", "reef", "Adult", null, null, 1000)] });
  const request = input("reef", "person", { participants: people(["Adult", 30, 1]) });
  assert.equal(total(card, [reef], request), null);
  card.minimumCharges = [{ optionId: "reef", amount: 2000 }];
  const result = calculateActivityQuote(card, [reef], request);
  assert.equal(result.supplierTotal, 2000);
  assert.ok(result.lines.some((line) => line.label === "Supplier minimum bill"));
});

test("8. option age eligibility rejects child zipline and prices eligible participants only", () => {
  const zipline = option("zipline", { minAge: 12 }); const scuba = option("scuba", { minAge: 10 });
  const card = tariff("adventure", "adventure-service", { personRates: [person("z", "zipline", "Everyone", null, null, 1800), person("s", "scuba", "Everyone", null, null, 3500)], charges: [{ id: "equipment", name: "Scuba equipment", optionIds: ["scuba"], treatment: "included", mandatory: true, basis: "person", amount: null, taxProfileId: null }] });
  assert.equal(total(card, [zipline, scuba], input("zipline", "person", { participants: people(["Everyone", 10, 3]) })), null);
  assert.equal(total(card, [zipline, scuba], input("zipline", "person", { participants: people(["Everyone", 30, 2]) })), 3600);
  assert.equal(total(card, [zipline, scuba], input("scuba", "person", { participants: people(["Everyone", 30, 2], ["Everyone", 10, 1]) })), 10500);
});

test("9. optional pickup charges once, included dinner stays included, and transfer duplication blocks", () => {
  const cruise = option("dinner-cruise");
  const card = tariff("cruise", "cruise-service", { personRates: [person("adult", "dinner-cruise", "Adult", 12, null, 2000), person("child", "dinner-cruise", "Child", 4, 11, 1200)], charges: [
    { id: "dinner", name: "Dinner", optionIds: ["dinner-cruise"], treatment: "included", mandatory: true, basis: "person", amount: null, taxProfileId: null },
    { id: "pickup", name: "Pickup", optionIds: ["dinner-cruise"], treatment: "additional", mandatory: false, basis: "booking", amount: 800, capacity: 4, taxProfileId: null },
  ] });
  const request = input("dinner-cruise", "person", { participants: people(["Adult", 30, 2], ["Child", 7, 1], ["Child", 9, 1]) });
  assert.equal(total(card, [cruise], request), 6400);
  assert.equal(total(card, [cruise], { ...request, selectedChargeIds: ["pickup"] }), 7200);
  assert.equal(total(card, [cruise], { ...request, selectedChargeIds: ["pickup"], transferCostedElsewhere: true }), null);
});

test("10. dated participant replacement prices combine with a dated mandatory fee", () => {
  const show = option("show");
  const card = tariff("theatre", "show-service", { personRates: [person("adult", "show", "Adult", 12, null, 1000), person("child", "show", "Child", 4, 11, 600)], adjustments: [
    { id: "adult-holiday", name: "Holiday adult fare", optionIds: ["show"], from: "2026-12-24", to: "2026-12-31", treatment: "replacement", amount: 1400, stacking: "replace", personRateId: "adult" },
    { id: "child-holiday", name: "Holiday child fare", optionIds: ["show"], from: "2026-12-24", to: "2026-12-31", treatment: "replacement", amount: 800, stacking: "replace", personRateId: "child" },
  ], charges: [{ id: "fee", name: "Holiday fee", optionIds: ["show"], treatment: "additional", mandatory: true, basis: "booking", amount: 200, from: "2026-12-24", to: "2026-12-31", taxProfileId: null }] });
  const request = input("show", "person", { participants: people(["Adult", 30, 2], ["Child", 8, 1]) });
  for (const [date, expected] of [["2026-12-23", 2600], ["2026-12-24", 3800], ["2026-12-31", 3800], ["2027-01-01", 2600]]) assert.equal(total(card, [show], { ...request, date }), expected);
  assert.equal(total(card, [show], { ...request, date: "2027-04-01" }), null);
});

test("dated group and unit replacements target only their matching base-rate rows", () => {
  const groupOption = option("private"); const kayak = option("kayak");
  const card = tariff("supplier", "offering", { methods: ["booking", "unit"], bookingRates: [group("small", "private", 1, 4, 3000), group("large", "private", 5, 8, 4500)], unitRates: [unit("tandem", "kayak", "Tandem", 800, 2, "hour"), unit("single", "kayak", "Single", 500, 1, "hour")], adjustments: [
    { id: "group-holiday", name: "Holiday small group", optionIds: ["private"], from: "2026-12-24", to: "2026-12-31", treatment: "replacement", amount: 3500, stacking: "replace", bookingRateId: "small" },
    { id: "kayak-holiday", name: "Holiday tandem", optionIds: ["kayak"], from: "2026-12-24", to: "2026-12-31", treatment: "replacement", amount: 900, stacking: "replace", unitRateId: "tandem" },
  ] });
  assert.equal(total(card, [groupOption, kayak], input("private", "booking", { date: "2026-12-24", groupSize: 3 })), 3500);
  assert.equal(total(card, [groupOption, kayak], input("private", "booking", { date: "2026-12-24", groupSize: 7 })), 4500);
  assert.equal(total(card, [groupOption, kayak], input("kayak", "unit", { date: "2026-12-24", groupSize: 5, unitSelections: [{ rateId: "tandem", quantity: 2, hours: 2 }, { rateId: "single", quantity: 1, hours: 2 }] })), 4600);
  assert.deepEqual(validateActivityTariff(card, [groupOption, kayak], ["offering"]), []);
});

test("11. supplier ownership keeps headline prices and dinner inclusions distinct", () => {
  const cruise = option("bluewater");
  const a = tariff("vendor-a", "bluewater-service", { personRates: [person("a", "bluewater", "Adult", null, null, 1500)], charges: [{ id: "dinner-a", name: "Dinner", optionIds: ["bluewater"], treatment: "included", mandatory: true, basis: "person", amount: null, taxProfileId: null }] });
  const b = tariff("vendor-b", "bluewater-service", { personRates: [person("b", "bluewater", "Adult", null, null, 1350)], charges: [{ id: "dinner-b", name: "Dinner", optionIds: ["bluewater"], treatment: "additional", mandatory: false, basis: "person", amount: 300, taxProfileId: null }] });
  const request = input("bluewater", "person", { participants: people(["Adult", 30, 3]) });
  assert.equal(total(a, [cruise], request), 4500);
  assert.equal(total(b, [cruise], request), 4050);
  assert.equal(total(b, [cruise], { ...request, selectedChargeIds: ["dinner-b"] }), 4950);
  assert.equal(snapshotActivityQuote(b, request, calculateActivityQuote(b, [cruise], request)).vendorId, "vendor-b");
});

test("12. missing and on-request remain unresolved until a sourced, valid proposal quote is entered", () => {
  const standard = option("standard"); const premium = option("premium");
  const card = tariff("photographer", "photo-service", { methods: ["booking"], bookingRates: [group("missing", "standard", 1, 4, null), group("request", "premium", 1, 4, null)] });
  card.bookingRates[0].state = "missing"; card.bookingRates[1].state = "on-request";
  assert.equal(total(card, [standard, premium], input("standard", "booking", { groupSize: 4 })), null);
  const request = input("premium", "booking", { groupSize: 4, quoteAsOfDate: "2026-10-12" });
  assert.equal(total(card, [standard, premium], request), null);
  assert.equal(total(card, [standard, premium], { ...request, confirmedOnRequestRates: { request: { amount: 8000, source: "Supplier email", validUntil: "2026-10-31" } } }), 8000);
  assert.equal(total(card, [standard, premium], { ...request, confirmedOnRequestRates: { request: { amount: 8000, source: "Supplier email", validUntil: "2026-10-01" } } }), null);
  assert.equal(card.bookingRates[1].amount, null);
});

test("13. a valid rate estimates price while exact sold-out session stays unavailable", () => {
  const cruise = option("sunset", { sessions: ["15:00", "17:00"], availableSessions: [{ date: "2026-11-18", session: "15:00" }], unavailableSessions: [{ date: "2026-11-18", session: "17:00" }] });
  const card = tariff("cruise", "sunset-service", { personRates: [person("adult", "sunset", "Adult", null, null, 1500)] });
  const request = input("sunset", "person", { date: "2026-11-18", session: "17:00", participants: people(["Adult", 30, 4]) });
  const result = calculateActivityQuote(card, [cruise], request);
  assert.equal(result.supplierTotal, 6000);
  assert.equal(result.availability, "unavailable");
  assert.equal(calculateActivityQuote(card, [cruise], { ...request, session: "15:00" }).availability, "available");
  assert.equal(calculateActivityQuote(card, [cruise], { ...request, session: "" }).availability, "unconfirmed");
});

test("14. accepted supplier snapshot does not change when the reusable card is edited", () => {
  const classOption = option("class"); const cruise = option("cruise");
  const classCard = tariff("chef", "class-service", { personRates: [person("class-adult", "class", "Adult", null, null, 2000)] });
  const cruiseCard = tariff("boat", "cruise-service", { personRates: [person("cruise-adult", "cruise", "Adult", null, null, 1500)] });
  const request = (id) => input(id, "person", { participants: people(["Adult", 30, 2]) });
  const accepted = [snapshotActivityQuote(classCard, request("class"), calculateActivityQuote(classCard, [classOption], request("class"))), snapshotActivityQuote(cruiseCard, request("cruise"), calculateActivityQuote(cruiseCard, [cruise], request("cruise")))];
  assert.equal(accepted.reduce((sum, item) => sum + item.result.supplierTotal, 0), 7000);
  classCard.personRates[0].amount = 2200;
  assert.equal(accepted.reduce((sum, item) => sum + item.result.supplierTotal, 0), 7000);
  assert.equal(total(classCard, [classOption], request("class")) + total(cruiseCard, [cruise], request("cruise")), 7400);
});

test("invalid tariff configuration is flagged before activation", () => {
  const one = option("one");
  const card = tariff("right-vendor", "service", { methods: ["person", "booking", "unit"], personRates: [person("a", "one", "Adult", 13, null, 100), person("c", "one", "Child", 10, 15, 50)], bookingRates: [group("g1", "one", 1, 4, 100), group("g2", "one", 4, 8, 200)], unitRates: [unit("u1", "one", "Boat", 100, 4), unit("u2", "one", "Boat", 100, 4)], charges: [
    { id: "x", name: "Pickup", optionIds: [], treatment: "additional", mandatory: true, basis: "booking", amount: null, taxProfileId: null },
    { id: "y", name: "Dinner", optionIds: ["one"], treatment: "included", mandatory: true, basis: "booking", amount: null, taxProfileId: null },
    { id: "z", name: "Dinner", optionIds: ["one"], treatment: "additional", mandatory: true, basis: "booking", amount: 100, taxProfileId: null },
  ] });
  card.unitRates.push({ ...unit("u3", "one", "Jeep", 100, 4), duration: null });
  const errors = validateActivityTariff(card, [one], []);
  for (const text of ["not offered", "age or group-size bands overlap", "group-size bands overlap", "duplicate unit", "select service options", "conflicting charge treatments", "additional-charge amount", "session duration"]) assert.ok(errors.some((error) => error.includes(text)), `${text}: ${errors.join("; ")}`);
});

test("a mandatory per-person extra needs the whole party even on a per-booking fare", () => {
  const tour = option("private-tour", { delivery: "private", capacity: 8 });
  const card = tariff("guide", "tour-service", {
    methods: ["booking"], bookingRates: [group("private", "private-tour", 1, 8, 1000)],
    charges: [{ id: "admission", name: "Mandatory admission", optionIds: ["private-tour"], treatment: "additional", mandatory: true, basis: "person", amount: 100, taxProfileId: null }],
  });
  const request = input("private-tour", "booking", { groupSize: 4, participants: [] });
  const missingPeople = calculateActivityQuote(card, [tour], request);
  assert.equal(missingPeople.supplierTotal, null);
  assert.match(missingPeople.blockers.join(" "), /participant categories for every traveller/);
  assert.equal(total(card, [tour], { ...request, participants: people(["Everyone", 30, 4]) }), 1400);
});

test("unit capacity cannot pass without a stated party size", () => {
  const kayak = option("kayak");
  const card = tariff("outfitter", "kayak-service", { methods: ["unit"], unitRates: [unit("tandem", "kayak", "Tandem kayak", 800, 2, "hour")] });
  const request = input("kayak", "unit", { groupSize: 0, unitRateId: "tandem", unitQuantity: 1, hours: 2 });
  const unknownParty = calculateActivityQuote(card, [kayak], request);
  assert.equal(unknownParty.supplierTotal, null);
  assert.match(unknownParty.blockers.join(" "), /number of travellers/);
  assert.equal(total(card, [kayak], { ...request, groupSize: 2 }), 1600);
  assert.equal(total(card, [kayak], { ...request, groupSize: 3 }), null);
});
