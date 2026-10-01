import type { ActivityMethod, ActivityTariff, BookingRate, PersonRate, UnitRate } from "../rateCard/activityPricing";

export interface ActivityRateFixture { id: string; ref: string; name: string; vendorId: string; vendorName: string; serviceId: string; serviceName: string; tariff: ActivityTariff; }

const person = (id: string, optionId: string, category: string, amount: number, minAge: number | null = null, maxAge: number | null = null): PersonRate => ({ id, optionId, category, minAge, maxAge, minGroup: null, maxGroup: null, state: "priced", amount });
const booking = (id: string, optionId: string, minGroup: number, maxGroup: number, amount: number, basisLabel: BookingRate["basisLabel"] = "Per group"): BookingRate => ({ id, optionId, minGroup, maxGroup, amount, basisLabel, state: "priced" });
const unit = (id: string, optionId: string, label: string, basis: UnitRate["basis"], amount: number, capacityPerUnit: number | null, duration: number | null = null): UnitRate => ({ id, optionId, unit: label, basis, duration, capacityPerUnit, amount, state: "priced" });
const tariff = (vendorId: string, serviceId: string, methods: ActivityMethod[], personRates: PersonRate[] = [], bookingRates: BookingRate[] = [], unitRates: UnitRate[] = []): ActivityTariff => ({
  schemaVersion: 1, vendorId, serviceId, version: 1, validFrom: "2026-10-01", validTo: "2027-03-31",
  sourceDocument: "Supplier tariff to attach", sourceConfirmed: false, methods, personRates, bookingRates, unitRates,
  charges: [], adjustments: [], taxMode: "exclusive", taxProfileId: null, approvedTaxRate: null, taxApprovalSource: "",
  commercialPolicy: "Supplier cost only. Session availability is confirmed separately.",
});
const fixture = (id: string, name: string, vendorId: string, vendorName: string, serviceId: string, serviceName: string, data: ActivityTariff): ActivityRateFixture => ({ id, ref: id.toUpperCase(), name, vendorId, vendorName, serviceId, serviceName, tariff: data });

const cruise = tariff("coastal", "sunset-cruise", ["person", "booking"], [
  person("cruise-adult", "cruise-shared", "Adult", 2200, 12, null),
  person("cruise-child", "cruise-shared", "Child", 1100, 5, 11),
  { ...person("cruise-infant", "cruise-shared", "Infant", 0, 0, 4), state: "complimentary" },
], [booking("cruise-private-1", "cruise-private", 1, 6, 14500, "Per booking"), booking("cruise-private-2", "cruise-private", 7, 12, 21000, "Per booking")]);
cruise.charges = [
  { id: "cruise-dinner", name: "Dinner upgrade", optionIds: ["cruise-shared"], treatment: "additional", mandatory: false, basis: "person", amount: 650, taxProfileId: null },
  { id: "cruise-pickup", name: "Hotel pickup", optionIds: [], allOptions: true, treatment: "additional", mandatory: false, basis: "booking", amount: 1200, taxProfileId: null },
  { id: "cruise-lifejackets", name: "Safety equipment", optionIds: [], allOptions: true, treatment: "included", mandatory: true, basis: "booking", amount: null, taxProfileId: null },
];
cruise.adjustments = [{ id: "cruise-holiday", name: "Holiday sailing surcharge", optionIds: ["cruise-shared"], from: "2026-12-24", to: "2026-12-26", treatment: "additional", amount: 350, stacking: "combine" }];

export const ACTIVITY_RATE_FIXTURES: ActivityRateFixture[] = [
  fixture("rc-act-trek-trail", "Munnar trek supplier rates", "trailmakers", "Trailmakers Experiences", "munnar-trek", "Munnar Ridge Trek", tariff("trailmakers", "munnar-trek", ["person", "booking"], [person("trek-adult", "trek-shared", "Adult", 1800, 12, null), person("trek-child", "trek-shared", "Child", 1100, 6, 11)], [booking("trek-private", "trek-private", 1, 10, 9800)])),
  fixture("rc-act-trek-summit", "Guided trek rates", "summit", "Summit Adventures", "munnar-trek", "Munnar Ridge Trek", tariff("summit", "munnar-trek", ["person"], [person("summit-adult", "trek-shared", "Everyone", 2100)])),
  fixture("rc-act-trek-spice", "Munnar private trek", "spice-route", "Spice Route Experiences", "munnar-trek", "Munnar Ridge Trek", tariff("spice-route", "munnar-trek", ["booking"], [], [booking("spice-trek", "trek-private", 1, 8, 11200)])),
  fixture("rc-act-kayak-trail", "Backwater kayak rates", "trailmakers", "Trailmakers Experiences", "backwater-kayak", "Backwater Kayak", tariff("trailmakers", "backwater-kayak", ["person", "unit"], [person("kayak-guided", "kayak-guided", "Everyone", 1800)], [], [unit("kayak-single", "kayak-rental", "Kayak", "session", 2500, 1, 2), unit("kayak-tandem", "kayak-rental", "Tandem kayak", "session", 3600, 2, 2)])),
  fixture("rc-act-kayak-spice", "Private backwater kayaking", "spice-route", "Spice Route Experiences", "backwater-kayak", "Backwater Kayak", tariff("spice-route", "backwater-kayak", ["booking", "unit"], [], [booking("kayak-group", "kayak-private", 2, 8, 9800)], [unit("kayak-hourly", "kayak-rental", "Kayak", "hour", 900, 1)])),
  fixture("rc-act-cardamom-exhosp", "Plantation walk tariff", "exhosp", "Example Hospitality", "cardamom-tour", "Cardamom Plantation Tour", tariff("exhosp", "cardamom-tour", ["person"], [person("cardamom-adult", "cardamom-shared", "Adult", 1400, 12, null), person("cardamom-child", "cardamom-shared", "Child", 700, 6, 11)])),
  fixture("rc-act-cardamom-spice", "Spice plantation rates", "spice-route", "Spice Route Experiences", "cardamom-tour", "Cardamom Plantation Tour", tariff("spice-route", "cardamom-tour", ["person", "booking"], [person("spice-walk", "cardamom-shared", "Everyone", 1600)], [booking("spice-private", "cardamom-private", 1, 12, 8700, "Per booking")])),
  fixture("rc-act-cruise-coastal", "Sunset cruise supplier tariff", "coastal", "Coastal Stay Properties", "sunset-cruise", "Alleppey Sunset Cruise", cruise),
  fixture("rc-act-class-spice", "Kerala cooking class rates", "spice-route", "Spice Route Experiences", "spice-cooking-class", "Kerala Spice Cooking Class", tariff("spice-route", "spice-cooking-class", ["person", "booking"], [person("class-everyone", "class-shared", "Everyone", 3200)], [booking("class-private", "class-private", 1, 8, 14500, "Per group")])),
  fixture("rc-act-safari-summit", "Private jeep safari tariff", "summit", "Summit Adventures", "periyar-safari", "Periyar Wildlife Safari", tariff("summit", "periyar-safari", ["unit"], [], [], [unit("safari-jeep", "safari-jeep", "Jeep", "session", 6800, 6, 4)])),
  fixture("rc-act-admission-heritage", "Fort Kochi admission tariff", "kerala-heritage", "Kerala Heritage Hotels", "heritage-admission", "Fort Kochi Heritage Admission", tariff("kerala-heritage", "heritage-admission", ["person"], [person("entry-adult", "heritage-ticket", "Adult", 600, 13, null), person("entry-child", "heritage-ticket", "Child", 300, 5, 12), { ...person("entry-infant", "heritage-ticket", "Infant", 0, 0, 4), state: "complimentary" }])),
];
