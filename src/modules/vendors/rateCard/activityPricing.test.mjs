import assert from "node:assert/strict";
import { test } from "node:test";
import { ACTIVITY_RATE_FIXTURES } from "../data/activityRateFixtures.ts";
import { calculateActivityQuote, snapshotActivityQuote, validateActivityTariff } from "./activityPricing.ts";

const cruise = () => {
  const tariff = structuredClone(ACTIVITY_RATE_FIXTURES.find((item) => item.id === "rc-act-cruise-coastal").tariff);
  tariff.sourceConfirmed = true;
  tariff.sourceDocument = "Supplier agreement 2026";
  tariff.taxProfileId = "approved-test-profile";
  tariff.approvedTaxRate = 0.1;
  tariff.taxApprovalSource = "Approved supplier tax memo 2026";
  return tariff;
};
const options = [
  { id: "cruise-shared", name: "Shared cruise", category: "Cruise", delivery: "shared", duration: "2 hours", capacity: 30, session: "Evening" },
  { id: "cruise-private", name: "Private cruise", category: "Cruise", delivery: "private", duration: "2 hours", capacity: 12, session: "Evening" },
];
const input = (update = {}) => ({
  date: "2026-10-12", quoteAsOfDate: "2026-10-12", optionId: "cruise-shared", method: "person",
  participants: [{ category: "Adult", age: 30, quantity: 2 }, { category: "Child", age: 8, quantity: 1 }],
  groupSize: 3, unitRateId: "", unitQuantity: 1, hours: 1, days: 1,
  selectedChargeIds: [], transferCostedElsewhere: false, ...update,
});

test("shared cruise totals participant categories and only selected extras", () => {
  const tariff = cruise();
  const basic = calculateActivityQuote(tariff, options, input());
  assert.equal(basic.base, 5500);
  assert.equal(basic.extras, 0);
  assert.equal(basic.supplierTotal, 6050);
  const dinner = calculateActivityQuote(tariff, options, input({ selectedChargeIds: ["cruise-dinner"] }));
  assert.equal(dinner.extras, 1950);
  assert.equal(dinner.supplierTotal, 8195);
});

test("private group price is charged once and capacity never auto-splits", () => {
  const tariff = cruise();
  const privateInput = input({ optionId: "cruise-private", method: "booking", participants: [], groupSize: 6 });
  assert.equal(calculateActivityQuote(tariff, options, privateInput).base, 14500);
  assert.equal(calculateActivityQuote(tariff, options, { ...privateInput, groupSize: 7 }).base, 21000);
  const tooLarge = calculateActivityQuote(tariff, options, { ...privateInput, groupSize: 13 });
  assert.equal(tooLarge.supplierTotal, null);
  assert.ok(tooLarge.blockers.some((message) => message.includes("Do not split")));
});

test("unit session and hourly prices use explicit unit quantities", () => {
  const tariff = structuredClone(ACTIVITY_RATE_FIXTURES.find((item) => item.id === "rc-act-kayak-spice").tariff);
  tariff.sourceConfirmed = true;
  tariff.sourceDocument = "Supplier kayak tariff 2026";
  tariff.taxProfileId = "approved-test-profile";
  tariff.approvedTaxRate = 0;
  tariff.taxApprovalSource = "Approved supplier tax memo 2026";
  const kayakOptions = [{ id: "kayak-rental", name: "Kayak rental", category: "Rental", delivery: "shared", duration: "Flexible", capacity: null, session: "Flexible" }];
  const quote = calculateActivityQuote(tariff, kayakOptions, input({ method: "unit", optionId: "kayak-rental", unitRateId: "kayak-hourly", unitQuantity: 2, hours: 3, groupSize: 2, participants: [] }));
  assert.equal(quote.base, 5400);
  assert.equal(quote.supplierTotal, 5400);
  assert.equal(calculateActivityQuote(tariff, kayakOptions, input({ method: "unit", optionId: "kayak-rental", unitRateId: "kayak-hourly", unitQuantity: 1, hours: 3, groupSize: 2, participants: [] })).supplierTotal, null);
});

test("overlapping age and group bands are rejected before save", () => {
  const tariff = cruise();
  tariff.personRates.push({ ...tariff.personRates[0], id: "duplicate", minAge: 18 });
  tariff.bookingRates.push({ ...tariff.bookingRates[0], id: "duplicate-group", minGroup: 4, maxGroup: 9 });
  const issues = validateActivityTariff(tariff, options);
  assert.ok(issues.some((message) => message.includes("age or group-size bands overlap")));
  assert.ok(issues.some((message) => message.includes("group-size bands overlap")));
});

test("unconfirmed rates, actuals and unknown tax never become zero-cost totals", () => {
  const tariff = cruise();
  tariff.charges.push({ id: "port-fee", name: "Port fee", optionIds: [], allOptions: true, treatment: "actuals", mandatory: true, basis: "booking", amount: null, taxProfileId: null });
  assert.equal(calculateActivityQuote(tariff, options, input()).supplierTotal, null);
  tariff.charges.pop();
  tariff.approvedTaxRate = null;
  assert.equal(calculateActivityQuote(tariff, options, input()).supplierTotal, null);
  tariff.approvedTaxRate = 0.1;
  tariff.sourceConfirmed = false;
  assert.equal(calculateActivityQuote(tariff, options, input()).supplierTotal, null);
});

test("date replacement changes the matching person fares and accepted snapshot stays unchanged", () => {
  const tariff = cruise();
  tariff.adjustments = [
    { id: "festival-adult", name: "Festival adult fare", optionIds: ["cruise-shared"], from: "2026-10-12", to: "2026-10-12", treatment: "replacement", amount: 3000, stacking: "replace", personRateId: "cruise-adult" },
    { id: "festival-child", name: "Festival child fare", optionIds: ["cruise-shared"], from: "2026-10-12", to: "2026-10-12", treatment: "replacement", amount: 1000, stacking: "replace", personRateId: "cruise-child" },
  ];
  const result = calculateActivityQuote(tariff, options, input());
  assert.equal(result.base, 7000);
  assert.equal(result.lines.filter((line) => line.label === "Adult").length, 1);
  assert.equal(result.supplierTotal, 7700);
  const accepted = snapshotActivityQuote(tariff, input(), result);
  tariff.adjustments[0].amount = 4000;
  assert.equal(accepted.result.supplierTotal, 7700);
});

test("a charge with a different approved tax profile uses its own rate", () => {
  const tariff = cruise();
  const pickup = tariff.charges.find((charge) => charge.id === "cruise-pickup");
  pickup.taxProfileId = "approved-exception";
  pickup.approvedTaxRate = 0.05;
  pickup.taxApprovalSource = "Supplier tax memo for pickup";
  const result = calculateActivityQuote(tariff, options, input({ selectedChargeIds: ["cruise-pickup"] }));
  assert.equal(result.base, 5500);
  assert.equal(result.extras, 1200);
  assert.equal(result.tax, 610);
  assert.equal(result.supplierTotal, 7310);
  pickup.taxApprovalSource = "";
  assert.equal(calculateActivityQuote(tariff, options, input({ selectedChargeIds: ["cruise-pickup"] })).supplierTotal, null);
});

test("separate on-request participant categories need separate confirmed quotes", () => {
  const tariff = cruise();
  tariff.personRates.find((row) => row.id === "cruise-adult").state = "on-request";
  tariff.personRates.find((row) => row.id === "cruise-child").state = "on-request";
  const singleQuote = calculateActivityQuote(tariff, options, input({ confirmedOnRequestAmount: 2000, confirmedOnRequestSource: "Email" }));
  assert.equal(singleQuote.supplierTotal, null);
  const confirmed = calculateActivityQuote(tariff, options, input({ confirmedOnRequestRates: { "cruise-adult": { amount: 2000, source: "Email A", validUntil: "2026-10-31" }, "cruise-child": { amount: 1000, source: "Email A", validUntil: "2026-10-31" } } }));
  assert.equal(confirmed.base, 5000);
  assert.equal(confirmed.supplierTotal, 5500);
});
