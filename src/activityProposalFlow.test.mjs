import assert from "node:assert/strict";
import { test } from "node:test";
import { DETAIL_CARDS, saveTransportCard } from "../vendor-crm/src/rateCard/cards.ts";
import { DIRECTORY_SERVICES, VENDOR_SERVICE_CONNECTIONS, linkVendorService } from "../vendor-crm/src/data/vendorDirectory.ts";
import { activityQuoteForService, freezeActivityPricing } from "./serviceCosting.ts";

const storage = new Map();
const localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: (key) => storage.delete(key) };
globalThis.window = { localStorage };
globalThis.localStorage = localStorage;

const cardId = "rc-act-cruise-coastal";
const service = (update = {}) => ({ id: "activity-1", kind: "activity", title: "Alleppey Sunset Cruise", vendor: "Coastal Stay Properties", rateCardId: cardId, serviceDate: "2026-10-12", activityInput: { date: "2026-10-12", optionId: "cruise-shared", method: "person", participants: [{ category: "Adult", age: 30, quantity: 2 }], groupSize: 2, unitRateId: "", unitQuantity: 0, hours: 1, days: 1, selectedChargeIds: [], transferCostedElsewhere: false }, ...update });
const day = (services) => [{ id: "day-1", place: "Alleppey", services }];
const activeCard = () => {
  const card = structuredClone(DETAIL_CARDS[cardId]);
  card.state = "Active";
  card.activityTariff.sourceConfirmed = true;
  card.activityTariff.sourceDocument = "Supplier agreement fixture";
  card.activityTariff.taxMode = "inclusive";
  card.activityTariff.taxProfileId = "approved-fixture";
  card.activityTariff.approvedTaxRate = 0;
  card.activityTariff.taxApprovalSource = "Approved fixture";
  saveTransportCard(card);
  return card;
};

test("proposal approval snapshots the supplier price; later master edits affect new proposals only", () => {
  const card = activeCard();
  const accepted = freezeActivityPricing(day([service()]), "2026-10-12");
  assert.deepEqual(accepted.issues, []);
  const snapshot = accepted.days[0].services[0].activitySnapshot;
  assert.ok(snapshot);
  const original = snapshot.result.supplierTotal;
  card.activityTariff.personRates.find((row) => row.id === "cruise-adult").amount += 300;
  saveTransportCard(card);
  assert.equal(snapshot.result.supplierTotal, original);
  assert.equal(activityQuoteForService(service(), { tripStart: "2026-10-12", dayIndex: 0 }).result.supplierTotal, original + 600);
});

test("sold-out exact session keeps a price estimate but blocks approval", () => {
  activeCard();
  const option = DIRECTORY_SERVICES.find((item) => item.id === "sunset-cruise").activityOptions.find((item) => item.id === "cruise-shared");
  const previous = { sessions: option.sessions, unavailableSessions: option.unavailableSessions };
  option.sessions = ["15:00", "17:00"];
  option.unavailableSessions = [{ date: "2026-10-12", session: "17:00" }];
  try {
    const selected = service({ activityInput: { ...service().activityInput, session: "17:00" } });
    const quote = activityQuoteForService(selected, { tripStart: "2026-10-12", dayIndex: 0 });
    assert.ok(quote.result.supplierTotal > 0);
    assert.equal(quote.result.availability, "unavailable");
    assert.match(freezeActivityPricing(day([selected]), "2026-10-12").issues.join(" "), /sold out/);
  } finally { option.sessions = previous.sessions; option.unavailableSessions = previous.unavailableSessions; }
});

test("excluded admission needs a linked itinerary service and included transport needs distinct movement confirmation", () => {
  activeCard();
  const option = DIRECTORY_SERVICES.find((item) => item.id === "sunset-cruise").activityOptions.find((item) => item.id === "cruise-shared");
  const previous = { includedComponents: option.includedComponents, excludedComponents: option.excludedComponents };
  option.includedComponents = ["Transport"];
  option.excludedComponents = ["Admission"];
  const transfer = { id: "transfer-1", kind: "transfer", title: "Jetty transfer", vendor: "Driver", priceState: "priced", cost: 1000 };
  const admission = { id: "admission-1", kind: "activity", title: "Museum admission", vendor: "Museum", priceState: "priced", cost: 800 };
  try {
    const base = service();
    assert.match(freezeActivityPricing(day([base, transfer]), "2026-10-12").issues.join(" "), /different movements/);
    const distinct = service({ activityInput: { ...base.activityInput, separateTransportConfirmed: true } });
    assert.match(freezeActivityPricing(day([distinct, transfer]), "2026-10-12").issues.join(" "), /Admission is excluded/);
    const linked = service({ activityInput: { ...base.activityInput, separateTransportConfirmed: true, externalRequirementServiceIds: { Admission: "admission-1" } } });
    const unpricedAdmission = { ...admission, priceState: "unpriced", cost: null };
    assert.match(freezeActivityPricing(day([linked, transfer, unpricedAdmission]), "2026-10-12").issues.join(" "), /linked admission.*resolved supplier price/);
    assert.match(freezeActivityPricing(day([linked, transfer, { ...admission, optional: true }]), "2026-10-12").issues.join(" "), /linked admission.*resolved supplier price/);
    const accepted = freezeActivityPricing(day([linked, transfer, admission]), "2026-10-12");
    assert.deepEqual(accepted.issues, []);
    assert.ok(accepted.days[0].services[0].activitySnapshot);
  } finally { option.includedComponents = previous.includedComponents; option.excludedComponents = previous.excludedComponents; }
});

test("a second supplying vendor can link the shared activity without changing its original supplier", () => {
  const before = VENDOR_SERVICE_CONNECTIONS.filter((item) => item.serviceId === "sunset-cruise").length;
  const connection = linkVendorService("wanderlust", "sunset-cruise");
  assert.equal(connection.vendorId, "wanderlust");
  assert.equal(VENDOR_SERVICE_CONNECTIONS.filter((item) => item.serviceId === "sunset-cruise").length, before + 1);
  assert.equal(linkVendorService("wanderlust", "sunset-cruise").id, connection.id);
  assert.ok(VENDOR_SERVICE_CONNECTIONS.some((item) => item.vendorId === "coastal" && item.serviceId === "sunset-cruise"));
});
