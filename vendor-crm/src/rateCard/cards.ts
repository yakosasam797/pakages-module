import { DEFAULT_ACTIVITIES, type PolicyRow, type RateCardDetail, type RegionalTransportTariff } from "./types";
import { PRIVATE_TRANSPORT_FIXTURES } from "../data/privateTransportFixtures";
import { readVehicleOfferings } from "../data/vehicleOfferings";
import { DIRECTORY_SERVICES, VENDOR_SERVICE_CONNECTIONS, readCreatedDirectoryServices } from "../data/vendorDirectory";
import { TRANSPORT_TEMPLATE_LABELS, type PrivateTransportTemplate } from "./privateTransport";
import { ACTIVITY_RATE_FIXTURES } from "../data/activityRateFixtures";
import type { ActivityTariff } from "./activityPricing";

function policy(
  id: string,
  title: string,
  category: string,
  summary: string,
  body: string,
  status: PolicyRow["status"] = "ok",
  document: PolicyRow["document"] = null,
): PolicyRow {
  return { id, title, category, summary, body, status, document };
}

const coralGuests = (): RateCardDetail["guests"] => {
  const rules: [string, string, string, number, number][] = [
    ["Extra adult", "12+", "extra_bed", 2400, 1],
    ["Child", "6–11", "extra_bed", 1600, 1],
    ["Child", "6–11", "no_bed", 900, 1],
    ["Child", "2–5", "existing_bed", 0, 2],
    ["Infant", "0–1", "cot", 0, 1],
  ];
  const rooms = ["garden-view", "sea-view", "sea-view-suite"];
  const out: RateCardDetail["guests"] = [];
  rooms.forEach((roomId) =>
    rules.forEach(([cls, band, bed, amount, max]) => out.push([roomId, cls, band, bed, "all", amount, max])),
  );
  return out;
};

const tashiGuests = (): RateCardDetail["guests"] => {
  const rules: [string, string, string, number | null, number][] = [
    ["Extra adult", "12+", "extra_bed", 1800, 1],
    ["Child", "5–11", "extra_bed", 1200, 1],
    ["Child", "5–11", "no_bed", null, 1],
    ["Child", "0–4", "existing_bed", 0, 1],
  ];
  const rooms = ["deluxe", "premium", "family-suite"];
  const out: RateCardDetail["guests"] = [];
  rooms.forEach((roomId) =>
    rules.forEach(([cls, band, bed, amount, max]) => out.push([roomId, cls, band, bed, "all", amount, max])),
  );
  return out;
};

const blankHotel = (): RateCardDetail => ({
  id: "rc-new-hotel",
  name: "New accommodation tariff",
  ref: "RC-DRAFT",
  vendor: "Example Hospitality",
  property: "Untitled property",
  service: "Accommodation",
  currency: "INR",
  validity: "Not set",
  state: "Draft",
  tone: "warning",
  ready: "Blank — add seasons and prices",
  readyTone: "warning",
  taxConfirmed: false,
  markupPercent: 15,
  mealBasis: "Tax unconfirmed",
  mealLabel: "Meal plan",
  meals: [
    { code: "EP", label: "Room only" },
    { code: "CP", label: "With breakfast" },
  ],
  rooms: [{ id: "room-1", name: "Standard", note: "Add detail", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 }],
  prices: [[[null], [null]]],
  seasons: [
    {
      name: "Season 1",
      colorToken: "accent",
      dates: "Not set",
      summary: "Add date ranges",
      nights: 0,
      priority: "Base",
    },
  ],
  guests: [
    ["room-1", "Extra adult", "12+", "extra_bed", "all", null, 1],
    ["room-1", "Child", "6–11", "no_bed", "all", null, 1],
    ["room-1", "Toddler", "2–5", "existing_bed", "all", 0, 1],
  ],
  supplements: [
    {
      name: "Supplement 1",
      applies: "Add dates or condition",
      amount: null,
      unit: "per person",
      basis: "Optional",
      tone: "neutral",
    },
  ],
  services: [
    {
      name: "Service 1",
      note: "Add service detail",
      applies: "On request",
      basis: "Per booking",
      amount: null,
    },
  ],
  activities: [
    {
      name: "Activity 1",
      note: "Add activity detail",
      group: "Add capacity",
      basis: "Per person",
      amount: null,
    },
  ],
  rules: [],
  cancel: [],
  policies: [
    policy(
      "tax",
      "Tax treatment",
      "Commercial",
      "Not confirmed",
      "Tax treatment for this draft has not been confirmed with the supplier. Confirm whether published rates are inclusive or exclusive of GST before quoting.",
      "unresolved",
    ),
    policy(
      "currency",
      "Currency",
      "Commercial",
      "INR",
      "All amounts on this rate card are denominated in Indian Rupees (INR) unless a separate currency schedule is attached.",
    ),
  ],
  activity: [
    {
      date: "Today",
      time: "—",
      member: "You",
      role: "Vendor desk",
      initials: "YO",
      avatarTone: "pink",
      event: "Created draft from Accommodation template",
      area: "Card",
    },
  ],
  notes: [],
});

const blankVisa = (): RateCardDetail => ({
  id: "rc-new-visa",
  name: "New visa services tariff",
  ref: "RC-DRAFT",
  vendor: "Example Hospitality",
  property: "Untitled visa product",
  service: "Visa",
  currency: "INR",
  validity: "Not set",
  state: "Draft",
  tone: "warning",
  ready: "Blank — add products and fees",
  readyTone: "warning",
  taxConfirmed: false,
  markupPercent: 15,
  mealBasis: "Tax unconfirmed",
  mealLabel: "Fee component",
  meals: [
    { code: "GOVT", label: "Government fee" },
    { code: "VENDOR", label: "Vendor fee" },
  ],
  rooms: [{ id: "product-1", name: "Tourist entry", note: "Add detail", baseOccupancy: 1, maxOccupancy: 1, maxBeds: 0 }],
  prices: [[[null], [null]]],
  seasons: [
    {
      name: "Current",
      colorToken: "accent",
      dates: "Not set",
      summary: "Add coverage",
      nights: 0,
      priority: "Base",
    },
  ],
  guests: [],
  supplements: [],
  services: [],
  activities: [],
  rules: [],
  cancel: [],
  policies: [
    policy(
      "tax",
      "Tax treatment",
      "Commercial",
      "Not confirmed",
      "Tax treatment for this draft has not been confirmed with the supplier. Confirm whether fees are inclusive or exclusive of GST before quoting.",
      "unresolved",
    ),
    policy(
      "basis",
      "Charging basis",
      "Commercial",
      "Per applicant",
      "Fees on this card are charged per applicant. Companion or dependent applicants are priced as separate lines unless a family schedule is attached.",
    ),
  ],
  activity: [
    {
      date: "Today",
      time: "—",
      member: "You",
      role: "Vendor desk",
      initials: "YO",
      avatarTone: "pink",
      event: "Created draft from Visa template",
      area: "Card",
    },
  ],
  notes: [],
  catLabels: {
    accommodation: "Visa products",
    special: "Optional services",
    activities: "Vendor services",
    services: "Financial rules",
    seasons: "Coverage",
  },
});

export const DETAIL_CARDS: Record<string, RateCardDetail> = {
  "rc-taj-goa-wanderlust": {
    ...blankHotel(),
    id: "rc-taj-goa-wanderlust",
    name: "Taj Goa contracted rates",
    ref: "RC-TAJ-WANDERLUST",
    vendor: "Wanderlust Trails",
    property: "Taj Exotica Resort & Spa",
    validity: "01 Oct 2026 – 30 Sep 2027",
    ready: "Supplier prices pending",
  },
  "rc-taj-goa-coastal": {
    ...blankHotel(),
    id: "rc-taj-goa-coastal",
    name: "Winter FIT tariff",
    ref: "RC-TAJ-COASTAL",
    vendor: "Coastal Stay Properties",
    property: "Taj Exotica Resort & Spa",
    validity: "01 Oct 2026 – 31 Mar 2027",
    ready: "Supplier prices pending",
  },
  "rc-new-hotel": blankHotel(),
  "rc-new-visa": blankVisa(),
  "rc-acc-2627": {
    id: "rc-acc-2627",
    name: "Accommodation tariff · 2026–27",
    ref: "RC-2026-0114",
    vendor: "Example Hospitality",
    property: "Example Lake Resort",
    service: "Accommodation",
    currency: "INR",
    validity: "01 Apr 2026 – 31 Mar 2027",
    state: "Published",
    tone: "success",
    ready: "Usable in proposals",
    readyTone: "success",
    taxConfirmed: true,
    markupPercent: 15,
    mealBasis: "Tax included",
    mealLabel: "Meal plan",
    hasWeekendExtra: true,
    meals: [
      { code: "EP", label: "Room only" },
      { code: "CP", label: "With breakfast" },
      { code: "MAP", label: "Breakfast + one meal" },
      { code: "AP", label: "All meals" },
    ],
    rooms: [
      { id: "garden-view", name: "Garden View", note: "Ground floor · 28 sqm", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 },
      { id: "sea-view", name: "Lake View", note: "Upper floors · 32 sqm", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 },
      { id: "sea-view-suite", name: "Lake View Suite", note: "Separate living area · 48 sqm", baseOccupancy: 2, maxOccupancy: 4, maxBeds: 1 },
    ],
    prices: [
      [
        [5200, 6400, 8600],
        [6000, 7200, 9400],
        [7100, 8300, 10500],
        [8400, 9600, 11800],
      ],
      [
        [6800, 8200, 11000],
        [7600, 9000, 11800],
        [8700, 10100, 12900],
        [10000, 11400, 14200],
      ],
      [
        [11500, 13800, 18400],
        [12300, 14600, 19200],
        [13400, 15700, 20300],
        [14700, 17000, 21600],
      ],
    ],
    weekendExtra: [
      [900, 1100, 1600],
      [1200, 1500, 2100],
      [1800, 2200, 3200],
    ],
    seasons: [
      { name: "Low", colorToken: "ink-3", dates: "15 Apr – 30 Sep 2026", summary: "2 ranges · 145 nights", nights: 145, priority: "Base" },
      { name: "Shoulder", colorToken: "accent", dates: "01 Oct – 19 Dec 2026", summary: "3 ranges · 118 nights", nights: 118, priority: "Base" },
      { name: "Peak", colorToken: "pink", dates: "20 Dec 2026 – 14 Apr 2027", summary: "2 ranges · 102 nights", nights: 102, priority: "Overrides base" },
    ],
    guests: coralGuests(),
    guestNote: "A child charge and an extra-adult charge never stack on the same guest.",
    supplements: [
      { name: "Christmas Eve gala", applies: "24 Dec 2026", amount: 3500, unit: "per adult · mandatory", basis: "Mandatory", tone: "danger" },
      { name: "New Year gala", applies: "31 Dec 2026", amount: 4500, unit: "per adult · mandatory", basis: "Mandatory", tone: "danger" },
    ],
    services: [
      { name: "Airport pickup", note: "Transfer · sedan · up to 3 pax", applies: "One way", basis: "Per vehicle", amount: 2200 },
      { name: "Airport drop", note: "Transfer · sedan · up to 3 pax", applies: "One way", basis: "Per vehicle", amount: 2200 },
      { name: "Early check-in", note: "Before 10:00 · subject to availability", applies: "Per booking", basis: "Complimentary", amount: 0 },
      { name: "Laundry service", note: "In-room · same day", applies: "Per item", basis: "Per item", amount: null },
    ],
    activities: DEFAULT_ACTIVITIES,
    rules: [
      ["Minimum stay", "20 Dec 2026 – 02 Jan 2027", "3 nights", "Block", "danger"],
      ["Minimum stay", "15 Apr – 30 Sep 2026", "1 night", "Allow", "success"],
      ["Blackout", "25 Dec 2026", "Closed", "Block", "danger"],
      ["Check-out night", "All dates", "Not charged", "Allow", "success"],
    ],
    cancel: [
      { window: "30 days or more", charge: "Free", basis: "No charge", tone: "success" },
      { window: "15–29 days", charge: "25%", basis: "Of total booking value", tone: "warning" },
      { window: "7–14 days", charge: "50%", basis: "Of total booking value", tone: "warning" },
      { window: "Under 7 days", charge: "100%", basis: "Of total booking value", tone: "danger" },
    ],
    policies: [
      policy(
        "cancel",
        "Cancellation & refunds",
        "Cancellation",
        "Free ≥30 days · 25% / 50% / 100% closer in",
        [
          "Cancellations are measured from the scheduled check-in date at the property.",
          "",
          "• 30 days or more before check-in — free cancellation; no charge.",
          "• 15–29 days before check-in — 25% of the total booking value.",
          "• 7–14 days before check-in — 50% of the total booking value.",
          "• Under 7 days, including no-shows — 100% of the total booking value.",
          "",
          "Refunds, where due, are processed to the original payment method within 14 working days of written confirmation from the vendor desk.",
        ].join("\n"),
        "ok",
        {
          name: "Cancellation schedule",
          file: "EH-Lake-Cancel-2026-27.pdf",
          size: "184 KB",
        },
      ),
      policy(
        "stay",
        "Stay rules & blackouts",
        "Stay",
        "3-night festive minimum · 25 Dec blackout",
        [
          "Minimum stay and blackout rules override season rates when they conflict.",
          "",
          "• 20 Dec 2026 – 02 Jan 2027 — minimum stay of 3 nights. Shorter stays must be refused, not repriced.",
          "• 15 Apr – 30 Sep 2026 — minimum stay of 1 night.",
          "• 25 Dec 2026 — property closed for a private event. Hard blackout; do not sell.",
          "• Check-out night is not charged on any date.",
        ].join("\n"),
        "ok",
        {
          name: "Stay rules extract",
          file: "EH-Lake-StayRules-2026-27.pdf",
          size: "96 KB",
        },
      ),
      policy(
        "tax",
        "Tax treatment",
        "Commercial",
        "Included in rate",
        "Published room and meal rates on this card already include applicable GST. Do not add tax again when costing proposals from this card.",
        "ok",
        {
          name: "Tax confirmation",
          file: "EH-Lake-Tax-Confirm-2026.pdf",
          size: "72 KB",
        },
      ),
      policy(
        "basis",
        "Charging basis",
        "Commercial",
        "Per room / night",
        "Accommodation is sold per room, per night. Meal plans follow the same room-night basis. Extra adult and child rates are applied per person, per night as listed on the guest schedule.",
      ),
      policy(
        "checkin",
        "Check-in & check-out",
        "Stay",
        "Check-in 14:00 · Check-out 11:00",
        [
          "Standard check-in is from 14:00 on the arrival date.",
          "Standard check-out is by 11:00 on the departure date.",
          "",
          "Early check-in before 10:00 is complimentary when the property confirms availability. Late check-out is subject to room availability and may attract a half-day charge.",
        ].join("\n"),
      ),
      policy(
        "currency",
        "Currency",
        "Commercial",
        "INR",
        "All amounts on this rate card are denominated in Indian Rupees (INR). Cross-currency conversions are not offered by the property.",
      ),
      policy(
        "rate-type",
        "Rate type",
        "Commercial",
        "Net non-commissionable",
        "Rates on this card are net and non-commissionable. The agency costs from the net column only. Any published retail figure shown by the resort is for reference and is not used for proposals.",
        "ok",
        {
          name: "Commercial terms",
          file: "EH-Lake-Commercial-2026-27.pdf",
          size: "210 KB",
        },
      ),
      policy(
        "child",
        "Child age proof",
        "Guests",
        "Passport at check-in",
        "Child age bands on this card are verified against passport (or government ID) at check-in. Incorrect age declarations may be re-rated to the adult extra-bed charge for the full stay.",
      ),
      policy(
        "payment",
        "Payment terms",
        "Commercial",
        "50% on confirmation",
        [
          "A deposit of 50% of the total booking value is due on confirmation.",
          "The balance is due no later than 21 days before check-in.",
          "",
          "Bookings made inside 21 days of arrival require full payment at confirmation.",
        ].join("\n"),
        "ok",
        {
          name: "Payment schedule",
          file: "EH-Lake-Payment-2026-27.pdf",
          size: "128 KB",
        },
      ),
      policy(
        "amendment",
        "Amendment fee",
        "Commercial",
        "Not offered",
        "Date and room amendments after confirmation are not offered as a paid service on this card. Changes are treated as a cancellation of the original booking plus a new booking at the rates then in force.",
        "none",
      ),
    ],
    activity: [
      { date: "02 Sep 2026", time: "11:24 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Published card after confirming gala supplements", area: "Rates" },
      { date: "02 Sep 2026", time: "10:05 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Confirmed net rate as the cost basis", area: "Finance" },
      { date: "01 Sep 2026", time: "16:40 IST", member: "Rahul Sharma", role: "Operations", initials: "RS", avatarTone: "channel", event: "Added Lake View Suite across all 4 meal plans", area: "Rates" },
      { date: "01 Sep 2026", time: "14:12 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Set 3-night minimum for the festive window", area: "Stay rules" },
      { date: "31 Aug 2026", time: "09:30 IST", member: "Meera Iyer", role: "Operations", initials: "MI", avatarTone: "warn", event: "Imported tariff · mapped 3 rooms, 4 meal plans", area: "Sources" },
      { date: "30 Aug 2026", time: "17:02 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Created draft from Accommodation template", area: "Card" },
    ],
    notes: [
      { body: "Net rate is the only column we cost from. Published rate is the resort’s own retail figure.", author: "Anjali Menon", when: "02 Sep · 10:05" },
      { body: "Both galas are mandatory and charge per adult, not per room. Children are exempt.", author: "Anjali Menon", when: "01 Sep · 14:30" },
      { body: "25 Dec the property is closed for a private event — hard blackout, not a rate gap.", author: "Rahul Sharma", when: "01 Sep · 11:15" },
      { body: "Festive window carries a 3-night minimum. Shorter stays must be refused, not repriced.", author: "Anjali Menon", when: "31 Aug · 16:20" },
    ],
  },
  "rc-hill-2627": {
    id: "rc-hill-2627",
    name: "Hill Retreat tariff · 2026–27",
    ref: "RC-2026-0119",
    vendor: "Example Hospitality",
    property: "Example Hill Retreat",
    service: "Accommodation",
    currency: "INR",
    validity: "01 Apr 2026 – 31 Mar 2027",
    state: "Draft",
    tone: "warning",
    ready: "7 clarifications open",
    readyTone: "warning",
    taxConfirmed: false,
    markupPercent: 15,
    mealBasis: "Tax unconfirmed",
    mealLabel: "Meal plan",
    meals: [
      { code: "CP", label: "With breakfast" },
      { code: "MAP", label: "Breakfast + dinner" },
      { code: "AP", label: "All meals" },
    ],
    rooms: [
      { id: "deluxe", name: "Deluxe", note: "Valley facing · 24 sqm", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 },
      { id: "premium", name: "Premium", note: "Corner room · 30 sqm", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 },
      { id: "family-suite", name: "Family Suite", note: "Two bedrooms · 44 sqm", baseOccupancy: 4, maxOccupancy: 6, maxBeds: 2 },
    ],
    prices: [
      [
        [4500, 5800, null],
        [5400, 6700, null],
        [6200, 7500, null],
      ],
      [
        [5800, 7200, null],
        [6700, 8100, null],
        [7500, 8900, null],
      ],
      [
        [9500, 11800, null],
        [10800, 13100, null],
        [12000, 14300, null],
      ],
    ],
    seasons: [
      { name: "Off season", colorToken: "ink-3", dates: "15 Jun – 15 Sep 2026", summary: "1 range · 93 nights", nights: 93, priority: "Base" },
      { name: "Season", colorToken: "accent", dates: "16 Sep – 30 Nov 2026", summary: "2 ranges · 76 nights", nights: 76, priority: "Base" },
      { name: "Winter", colorToken: "pink", dates: "Not provided", summary: "Supplier has not released", nights: 0, priority: "Unpriced" },
    ],
    guests: tashiGuests(),
    guestNote: "Without-bed child charge is unconfirmed.",
    supplements: [
      { name: "Heating charge", applies: "01 Nov – 28 Feb", amount: 500, unit: "per room / night", basis: "Mandatory", tone: "danger" },
      { name: "Permit assistance", applies: "On request", amount: null, unit: "not confirmed", basis: "Unresolved", tone: "warning" },
      { name: "Bonfire", applies: "On request", amount: 1500, unit: "per booking", basis: "Optional", tone: "neutral" },
    ],
    services: [
      { name: "Airport pickup", note: "Transfer · SUV", applies: "One way", basis: "Per vehicle", amount: 3500 },
      { name: "Airport drop", note: "Transfer · SUV", applies: "One way", basis: "Per vehicle", amount: 3500 },
    ],
    activities: [
      { name: "Village walk", note: "Experience · 09:00 · 3 hrs", group: "2A min · max 8", basis: "Per person", amount: 1200 },
    ],
    rules: [
      ["Minimum stay", "16 Sep – 30 Nov 2026", "2 nights", "Block", "danger"],
      ["Road closure", "01 Dec – 14 Jun", "Unpriced", "Block", "danger"],
      ["Check-out night", "All dates", "Not charged", "Allow", "success"],
    ],
    cancel: [
      { window: "21 days or more", charge: "Free", basis: "No charge", tone: "success" },
      { window: "7–20 days", charge: "30%", basis: "Of total booking value", tone: "warning" },
      { window: "Under 7 days", charge: "Not provided", basis: "Awaiting supplier", tone: "warning" },
    ],
    policies: [
      policy(
        "cancel",
        "Cancellation & refunds",
        "Cancellation",
        "Free ≥21 days · under 7 days pending",
        [
          "• 21 days or more before check-in — free cancellation.",
          "• 7–20 days before check-in — 30% of the total booking value.",
          "• Under 7 days — charge not yet confirmed by the supplier. Do not quote firm cancellation terms until resolved.",
        ].join("\n"),
        "unresolved",
        {
          name: "Cancellation draft",
          file: "EH-Hill-Cancel-Draft.pdf",
          size: "64 KB",
        },
      ),
      policy(
        "tax",
        "Tax treatment",
        "Commercial",
        "Not confirmed",
        "Tax treatment has not been confirmed. Clarify whether rates are inclusive or exclusive of GST before publishing.",
        "unresolved",
      ),
      policy(
        "basis",
        "Charging basis",
        "Commercial",
        "Per room / night",
        "Accommodation is sold per room, per night. Meal plans follow the same room-night basis.",
      ),
      policy(
        "checkin",
        "Check-in & check-out",
        "Stay",
        "Check-in 13:00 · Check-out 10:00",
        "Standard check-in is from 13:00. Standard check-out is by 10:00. Early check-in and late check-out are subject to availability.",
      ),
      policy(
        "currency",
        "Currency",
        "Commercial",
        "INR",
        "All amounts on this rate card are denominated in Indian Rupees (INR).",
      ),
      policy(
        "rate-type",
        "Rate type",
        "Commercial",
        "Not confirmed",
        "Whether rates are net, commissionable, or rack has not been confirmed with the supplier.",
        "unresolved",
      ),
      policy(
        "child",
        "Child age proof",
        "Guests",
        "Not stated",
        "The supplier has not stated how child ages are verified at check-in. Hold proposals that rely on child pricing until this is confirmed.",
        "unresolved",
      ),
      policy(
        "payment",
        "Payment terms",
        "Commercial",
        "Not confirmed",
        "Deposit and balance schedule has not been confirmed with the supplier.",
        "unresolved",
      ),
      policy(
        "amendment",
        "Amendment fee",
        "Commercial",
        "Not offered",
        "Amendments after confirmation are not offered as a paid service on this draft.",
        "none",
      ),
    ],
    activity: [
      { date: "05 Sep 2026", time: "15:20 IST", member: "Meera Iyer", role: "Operations", initials: "MI", avatarTone: "warn", event: "Raised 7 clarifications with the supplier", area: "Card" },
      { date: "05 Sep 2026", time: "14:02 IST", member: "Meera Iyer", role: "Operations", initials: "MI", avatarTone: "warn", event: "Flagged winter season as unpriced, not zero", area: "Seasons" },
      { date: "04 Sep 2026", time: "11:40 IST", member: "Meera Iyer", role: "Operations", initials: "MI", avatarTone: "warn", event: "Entered off season and season rates for 3 rooms", area: "Rates" },
      { date: "04 Sep 2026", time: "09:15 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Created draft from Accommodation template", area: "Card" },
    ],
    notes: [
      { body: "Supplier has not released winter rates. Leave unpriced — do not carry season rates forward.", author: "Meera Iyer", when: "05 Sep · 14:02" },
      { body: "Without-bed child charge still unanswered. Third follow-up sent.", author: "Meera Iyer", when: "05 Sep · 15:20" },
    ],
  },
  "rc-visa-uae": {
    id: "rc-visa-uae",
    name: "Visa services tariff · UAE · 2026",
    ref: "RC-2026-0218",
    vendor: "Atlas Visa Services",
    property: "Atlas Visa Services",
    service: "Visa",
    currency: "INR",
    validity: "01 Apr – 30 Sep 2026",
    state: "Published",
    tone: "success",
    ready: "Usable in proposals",
    readyTone: "success",
    taxConfirmed: true,
    markupPercent: 15,
    mealBasis: "Exclusive of tax",
    mealLabel: "Fee component",
    meals: [
      { code: "GOVT", label: "Government fee" },
      { code: "CENTRE", label: "Visa-centre fee" },
      { code: "VENDOR", label: "Vendor fee" },
      { code: "BIO", label: "Biometrics" },
    ],
    rooms: [
      { id: "tourist-30", name: "Tourist 30 days", note: "Single entry · online", baseOccupancy: 1, maxOccupancy: 1, maxBeds: 0 },
      { id: "tourist-60", name: "Tourist 60 days", note: "Single entry · online", baseOccupancy: 1, maxOccupancy: 1, maxBeds: 0 },
      { id: "tourist-90", name: "Tourist 90 days", note: "Multiple entry · centre", baseOccupancy: 1, maxOccupancy: 1, maxBeds: 0 },
    ],
    prices: [
      [
        [3200, 3400],
        [1800, 1900],
        [2500, 2600],
        [900, 900],
      ],
      [
        [4800, 5100],
        [1800, 1900],
        [2800, 2900],
        [900, 900],
      ],
      [
        [7200, 7600],
        [2200, 2300],
        [3200, 3400],
        [1200, null],
      ],
    ],
    seasons: [
      { name: "Current", colorToken: "accent", dates: "01 Apr – 30 Jun 2026", summary: "Live schedule", nights: 91, priority: "Base" },
      { name: "Announced", colorToken: "pink", dates: "01 Jul – 30 Sep 2026", summary: "Published advance", nights: 92, priority: "Base" },
    ],
    guests: [],
    supplements: [
      { name: "Express processing", applies: "On request", amount: 4500, unit: "per applicant", basis: "Optional", tone: "neutral" },
    ],
    services: [
      { name: "Document review", note: "Vendor desk", applies: "Per case", basis: "Included", amount: 0 },
    ],
    activities: [],
    rules: [["Validity", "Application country", "India", "Allow", "success"]],
    cancel: [
      { window: "Before biometrics", charge: "Vendor fee retained", basis: "Government fee refundable", tone: "warning" },
      { window: "After submission", charge: "100%", basis: "Non-refundable", tone: "danger" },
    ],
    policies: [
      policy(
        "cancel",
        "Cancellation & refunds",
        "Cancellation",
        "Vendor fee retained after biometrics",
        [
          "• Before biometrics — government fee is refundable; vendor processing fee is retained.",
          "• After submission — 100% non-refundable.",
        ].join("\n"),
        "ok",
        {
          name: "Visa cancellation note",
          file: "Atlas-UAE-Cancel-2026.pdf",
          size: "88 KB",
        },
      ),
      policy(
        "tax",
        "Tax treatment",
        "Commercial",
        "Exclusive — add GST",
        "Fees on this card are exclusive of GST. Add applicable GST when costing proposals.",
        "ok",
        {
          name: "Fee schedule",
          file: "Atlas-UAE-Fees-2026.pdf",
          size: "156 KB",
        },
      ),
      policy(
        "basis",
        "Charging basis",
        "Commercial",
        "Per applicant",
        "All visa products on this card are priced per applicant.",
      ),
      policy(
        "currency",
        "Currency",
        "Commercial",
        "INR",
        "All amounts are denominated in Indian Rupees (INR).",
      ),
      policy(
        "scope",
        "Nationality scope",
        "Eligibility",
        "Indian passport holders",
        "This schedule applies to Indian passport holders only. Other nationalities require a separate quote from the vendor.",
      ),
      policy(
        "payment",
        "Payment terms",
        "Commercial",
        "At submission",
        "Full payment is due at case submission. Express processing, where selected, is charged with the same settlement.",
      ),
    ],
    activity: [
      { date: "01 Sep 2026", time: "15:10 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Confirmed vendor processing fee as the exclusive-tax cost basis", area: "Finance" },
      { date: "28 Aug 2026", time: "11:00 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Published UAE tourist products for FY schedule", area: "Rates" },
    ],
    notes: [
      { body: "Biometrics for 90-day multiple entry still missing on the announced season.", author: "Anjali Menon", when: "01 Sep · 15:10" },
    ],
    catLabels: {
      accommodation: "Visa products",
      special: "Optional services",
      activities: "Vendor services",
      services: "Financial rules",
      seasons: "Coverage",
    },
  },
  "rc-acc-2526": {
    id: "rc-acc-2526",
    name: "Accommodation tariff · 2025–26",
    ref: "RC-2025-0114",
    vendor: "Example Hospitality",
    property: "Example Lake Resort",
    service: "Accommodation",
    currency: "INR",
    validity: "01 Apr 2025 – 31 Mar 2026",
    state: "Expired",
    tone: "neutral",
    ready: "Superseded",
    readyTone: "neutral",
    taxConfirmed: true,
    markupPercent: 15,
    mealBasis: "Tax included",
    mealLabel: "Meal plan",
    meals: [
      { code: "EP", label: "Room only" },
      { code: "CP", label: "With breakfast" },
    ],
    rooms: [
      { id: "garden-view", name: "Garden View", note: "Ground floor · 28 sqm", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 },
      { id: "sea-view", name: "Lake View", note: "Upper floors · 32 sqm", baseOccupancy: 2, maxOccupancy: 3, maxBeds: 1 },
    ],
    prices: [
      [[4800], [5500]],
      [[6200], [7000]],
    ],
    seasons: [
      { name: "Full year", colorToken: "ink-3", dates: "01 Apr 2025 – 31 Mar 2026", summary: "1 range · 365 nights", nights: 365, priority: "Base" },
    ],
    guests: [],
    supplements: [],
    services: [],
    activities: [],
    rules: [],
    cancel: [{ window: "Under 7 days", charge: "100%", basis: "Of total booking value", tone: "danger" }],
    policies: [
      policy(
        "cancel",
        "Cancellation & refunds",
        "Cancellation",
        "100% under 7 days",
        "Cancellations within 7 days of check-in, including no-shows, are charged at 100% of the total booking value. This card is expired and superseded by the 2026–27 tariff.",
        "ok",
        {
          name: "Archived cancellation",
          file: "EH-Lake-Cancel-2025-26.pdf",
          size: "140 KB",
        },
      ),
      policy(
        "tax",
        "Tax treatment",
        "Commercial",
        "Included in rate",
        "Published rates on this archived card included applicable GST.",
      ),
      policy(
        "currency",
        "Currency",
        "Commercial",
        "INR",
        "All amounts were denominated in Indian Rupees (INR).",
      ),
    ],
    activity: [
      { date: "01 Apr 2026", time: "09:00 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Marked expired — superseded by 2026–27 card", area: "Card" },
    ],
    notes: [],
  },
  "rc-air-2026": {
    id: "rc-air-2026",
    name: "Airport transfer rates · 2026",
    ref: "RC-2026-0301",
    vendor: "BlueWave Transfers",
    property: "Kochi transfer fleet",
    service: "Transport",
    currency: "INR",
    validity: "01 Jan – 31 Dec 2026",
    state: "Draft",
    tone: "warning",
    ready: "Confirm transport terms before quoting",
    readyTone: "warning",
    taxConfirmed: true,
    markupPercent: 15,
    transport: {
      serviceType: "airport-transfer",
      pricingMethod: "fixed-per-vehicle",
      timezone: "Asia/Kolkata",
      validFrom: "2026-01-01",
      validTo: "2026-12-31",
      distanceBasis: "Airport pickup to final city drop; route limit is 40 km. Garage travel and detours need supplier confirmation.",
      availability: "not-held",
      quoteValidUntil: null,
      taxPresentation: "included",
      offerings: [
        { id: "SEDAN", label: "Sedan", passengerSeats: null, luggageBags: null, modelOrEquivalent: "Supplier-confirmed category or equivalent" },
        { id: "SUV", label: "SUV", passengerSeats: null, luggageBags: null, modelOrEquivalent: "Supplier-confirmed category or equivalent" },
        { id: "TEMPO", label: "Tempo traveller", passengerSeats: null, luggageBags: null, modelOrEquivalent: "Supplier-confirmed category or equivalent" },
      ],
      routes: [
        { id: "cok-city", label: "COK → City", from: "Cochin International Airport (COK)", to: "Kochi city", includedKm: 40, prices: { SEDAN: 2200, SUV: 3200, TEMPO: 4500 } },
        { id: "city-cok", label: "City → COK", from: "Kochi city", to: "Cochin International Airport (COK)", includedKm: 40, prices: { SEDAN: 2200, SUV: 3200, TEMPO: 4500 } },
      ],
      waitingIncludedMinutes: 45,
      waitingRatePerHour: 300,
      waitingRounding: "Unconfirmed — enter supplier-confirmed billable hours",
      charges: [
        { id: "driver", label: "Driver allowance", treatment: "unconfirmed", amount: null, unit: "transfer", paidBy: "unconfirmed", collectedBy: "unconfirmed", note: "Confirm whether included in the fixed fare." },
        { id: "fuel", label: "Fuel", treatment: "unconfirmed", amount: null, unit: "transfer", paidBy: "unconfirmed", collectedBy: "unconfirmed", note: "Confirm whether included in the fixed fare." },
        { id: "tolls", label: "Tolls and permits", treatment: "unconfirmed", amount: null, unit: "transfer", paidBy: "unconfirmed", collectedBy: "unconfirmed", note: "Confirm inclusion and who collects any actuals." },
        { id: "parking", label: "Airport parking", treatment: "unconfirmed", amount: null, unit: "transfer", paidBy: "unconfirmed", collectedBy: "unconfirmed", note: "Confirm inclusion and who collects any actuals." },
        { id: "night", label: "Night or early pickup", treatment: "unconfirmed", amount: null, unit: "transfer", paidBy: "unconfirmed", collectedBy: "unconfirmed", note: "Confirm applicable time window and charge." },
        { id: "stops", label: "Additional stops", treatment: "unconfirmed", amount: null, unit: "transfer", paidBy: "unconfirmed", collectedBy: "unconfirmed", note: "Quoted route covers the agreed pickup and drop only." },
      ],
    },
    mealBasis: "Tax included",
    mealLabel: "Vehicle class",
    meals: [
      { code: "SEDAN", label: "Sedan" },
      { code: "SUV", label: "SUV" },
      { code: "TEMPO", label: "Tempo" },
    ],
    rooms: [
      { id: "cok-city", name: "COK → City", note: "One way · up to 40 km", baseOccupancy: 3, maxOccupancy: 3, maxBeds: 0 },
      { id: "city-cok", name: "City → COK", note: "One way · up to 40 km", baseOccupancy: 3, maxOccupancy: 3, maxBeds: 0 },
    ],
    prices: [
      [[2200], [3200], [4500]],
      [[2200], [3200], [4500]],
    ],
    seasons: [
      { name: "2026", colorToken: "accent", dates: "01 Jan – 31 Dec 2026", summary: "Single price set", nights: 365, priority: "Base" },
    ],
    guests: [],
    supplements: [
      { name: "Waiting charge", applies: "After 45 min", amount: 300, unit: "per hour", basis: "Mandatory", tone: "danger" },
    ],
    services: [],
    activities: [],
    rules: [],
    cancel: [{ window: "Same day", charge: "50%", basis: "Of transfer value", tone: "warning" }],
    policies: [
      policy(
        "cancel",
        "Cancellation & refunds",
        "Cancellation",
        "50% same-day",
        "Same-day cancellations after the vehicle is dispatched are charged at 50% of the transfer value. Cancellations before dispatch are free.",
        "ok",
        {
          name: "Transfer cancellation",
          file: "EH-Kochi-Transfer-Cancel-2026.pdf",
          size: "74 KB",
        },
      ),
      policy(
        "tax",
        "Tax treatment",
        "Commercial",
        "Included in rate",
        "Published transfer rates include applicable GST.",
      ),
      policy(
        "basis",
        "Charging basis",
        "Commercial",
        "Per vehicle",
        "Transfers are charged per vehicle for the stated passenger capacity. Waiting beyond 45 minutes attracts the waiting charge listed on the card.",
      ),
    ],
    activity: [
      { date: "12 Jan 2026", time: "10:00 IST", member: "Anjali Menon", role: "Vendor desk", initials: "AM", avatarTone: "pink", event: "Published Kochi fleet transfer rates", area: "Rates" },
    ],
    notes: [],
  },
};

const regionalVehicles: RegionalTransportTariff["vehicles"] = [
  { id: "sedan", label: "Sedan", passengerSeats: 4, luggageBags: 2, modelOrEquivalent: "Supplier capacity to confirm" },
  { id: "muv", label: "MUV", passengerSeats: 6, luggageBags: 4, modelOrEquivalent: "Supplier capacity to confirm" },
  { id: "van", label: "Van", passengerSeats: 17, luggageBags: 12, modelOrEquivalent: "Supplier capacity to confirm" },
  { id: "coach", label: "Coach", passengerSeats: 35, luggageBags: 30, modelOrEquivalent: "Supplier capacity to confirm" },
];
const regionalPackages = [
  { id: "4h40", name: "4 hours / 40 km", hours: 4, km: 40, sharedExcess: true },
  { id: "8h80", name: "8 hours / 80 km", hours: 8, km: 80, sharedExcess: true },
  { id: "12h120", name: "12 hours / 120 km", hours: 12, km: 120, sharedExcess: true },
];
const regionalLocalPrices: Record<string, [number, number, number, number, number]> = {
  sedan: [1800, 3000, 4200, 20, 300], muv: [2500, 4200, 6000, 25, 400],
  van: [4000, 6500, 8500, 30, 500], coach: [7000, 11000, 15000, 50, 800],
};
const regionalOutstation: Record<string, [number, number, number]> = {
  sedan: [14, 250, 400], muv: [20, 250, 500], van: [22, 250, 500], coach: [45, 300, 800],
};
const regionalDaily: Record<string, [number, number, number, number, number]> = {
  sedan: [5000, 150, 10, 20, 300], muv: [6500, 150, 10, 25, 400],
  van: [10000, 200, 10, 30, 500], coach: [16000, 200, 10, 50, 800],
};
const regionalTransferPrices: Record<string, number[]> = {
  "airport-city": [1800, 2600, 4500, 8000], "city-airport": [1700, 2500, 4300, 7800],
};
const regionalSeasonId = "standard-2026-27";
const regionalPrivateHire: RegionalTransportTariff = {
  schemaVersion: 2,
  coverage: "Kochi and selected Kerala circuits",
  source: "Supplier tariff pending confirmation",
  sourceDocument: "No vendor tariff uploaded",
  sourceStatus: "illustrative",
  taxPresentation: "additional",
  timezone: "Asia/Kolkata",
  seasons: [{ id: regionalSeasonId, name: "Standard", start: "2026-10-01", end: "2027-03-31" }],
  enabledMethods: ["local", "outstation", "one-way", "daily", "whole-trip"],
  operatingAreas: [{ id: "kochi", name: "Kochi local area" }, { id: "kerala-circuit", name: "Kerala circuit" }],
  activeAreaIds: ["kochi", "kerala-circuit"],
  routes: [
    { id: "airport-city", name: "Kochi Airport → City Zone A", from: "Kochi Airport", to: "City Zone A", areaId: "kochi" },
    { id: "city-airport", name: "City Zone A → Kochi Airport", from: "City Zone A", to: "Kochi Airport", areaId: "kochi" },
    { id: "kerala-circuit", name: "3-day Kerala circuit", from: "Kochi", to: "Kochi", areaId: "kerala-circuit" },
  ],
  localPackages: regionalPackages,
  vehicles: regionalVehicles,
  fares: [
    ...regionalVehicles.flatMap((vehicle) => regionalPackages.map((pkg, index) => ({
      id: `local-${pkg.id}-${vehicle.id}`, service: "local" as const, label: pkg.name, basis: "hours-km" as const,
      vehicleId: vehicle.id, seasonId: regionalSeasonId, packageId: pkg.id, amount: regionalLocalPrices[vehicle.id][index],
      includedHours: pkg.hours, includedKm: pkg.km, extraKm: regionalLocalPrices[vehicle.id][3], extraHour: regionalLocalPrices[vehicle.id][4],
      routeScope: "Kochi local area", fuelIncluded: true, driverIncluded: true, taxProfileId: "approved-transport", taxPresentation: "additional" as const,
    }))),
    ...regionalVehicles.map((vehicle) => ({
      id: `outstation-${vehicle.id}`, service: "outstation" as const, label: "Outstation per kilometre", basis: "per-km" as const,
      vehicleId: vehicle.id, seasonId: regionalSeasonId, amount: regionalOutstation[vehicle.id][0],
      minKmPerDay: regionalOutstation[vehicle.id][1], minDays: 1, driverAllowancePerDay: regionalOutstation[vehicle.id][2],
      allowedRouteIds: ["kerala-circuit"],
      tripType: "round-trip" as const,
      minimumRule: "pooled" as const, billableDayMethod: "calendar" as const, distanceRounding: "whole-km" as const,
      additionalGarageKm: 0, additionalReturnKm: 0, crossSeasonPolicy: "pickup" as const, routeScope: "Kerala circuit",
      fuelIncluded: true, driverIncluded: false, taxProfileId: "approved-transport", taxPresentation: "additional" as const,
    })),
    ...Object.entries(regionalTransferPrices).flatMap(([routeId, prices]) => regionalVehicles.map((vehicle, index) => ({
      id: `transfer-${routeId}-${vehicle.id}`, service: "one-way" as const, label: routeId === "airport-city" ? "Airport to city" : "City to airport",
      basis: "fixed" as const, routeId, vehicleId: vehicle.id, seasonId: regionalSeasonId, amount: prices[index],
      includedKm: 40, includedHours: 2, includedWaitingMinutes: 30, extraKm: regionalLocalPrices[vehicle.id][3],
      extraHour: regionalLocalPrices[vehicle.id][4], waitingRatePerHour: 200, timeIncrementMinutes: 15,
      includedStops: 0, extraStop: 150, chargeExcessBoth: true, routeScope: "Defined one-way route",
      fuelIncluded: true, driverIncluded: true, taxProfileId: "approved-transport", taxPresentation: "additional" as const,
    }))),
    ...regionalVehicles.map((vehicle) => ({
      id: `daily-${vehicle.id}`, service: "daily" as const, label: "Daily hire", basis: "per-day" as const,
      vehicleId: vehicle.id, seasonId: regionalSeasonId, amount: regionalDaily[vehicle.id][0],
      includedKm: regionalDaily[vehicle.id][1], includedHours: regionalDaily[vehicle.id][2],
      extraKm: regionalDaily[vehicle.id][3], extraHour: regionalDaily[vehicle.id][4], carryUnusedUsage: false,
      routeScope: "Kochi local area", fuelIncluded: true, driverIncluded: true,
      taxProfileId: "approved-transport", taxPresentation: "additional" as const,
    })),
    { id: "whole-kerala-van", service: "whole-trip", label: "3-day Kerala circuit", basis: "whole-trip", routeId: "kerala-circuit",
      vehicleId: "van", seasonId: regionalSeasonId, amount: 21000, includedDays: 3, includedKm: 750, dutyHoursPerDay: 12,
      extraKm: 30, extraHour: 500, extraDayRate: 7000, routeScope: "Defined Kerala circuit", fuelIncluded: true,
      driverIncluded: true, taxProfileId: "approved-transport", taxPresentation: "additional" },
  ],
  charges: [
    { id: "night-pickup", label: "Night pickup", treatment: "fixed", amount: 500, unit: "pickup", paidBy: "agency", collectedBy: "supplier", note: "22:00–06:00", fareIds: [], routeIds: ["airport-city", "city-airport"], trigger: "night-pickup", triggerStart: "22:00", triggerEnd: "06:00", taxProfileId: "approved-transport", taxPresentation: "additional" },
    { id: "circuit-tolls", label: "Circuit tolls", treatment: "fixed", amount: 900, unit: "vehicle", paidBy: "agency", collectedBy: "supplier", note: "Van circuit only", routeIds: ["kerala-circuit"], vehicleIds: ["van"], taxProfileId: "approved-transport", taxPresentation: "additional" },
    { id: "circuit-parking", label: "Circuit parking", treatment: "fixed", amount: 300, unit: "vehicle", paidBy: "agency", collectedBy: "supplier", note: "Van circuit only", routeIds: ["kerala-circuit"], vehicleIds: ["van"], taxProfileId: "approved-transport", taxPresentation: "additional" },
    { id: "circuit-permit", label: "Circuit permit", treatment: "not-applicable", amount: null, unit: "hire", paidBy: "agency", collectedBy: "supplier", note: "Van circuit only", routeIds: ["kerala-circuit"], vehicleIds: ["van"] },
  ],
  adjustments: [
    { id: "festival-transfer", name: "Christmas transfer surcharge", trigger: "dates", dates: [], startDate: "2026-12-24", endDate: "2026-12-26", fareIds: [], methods: ["one-way"], vehicleIds: [], amount: 500, valueType: "fixed", treatment: "additional", stacking: "combine" },
  ],
  taxProfiles: [{ id: "approved-transport", name: "Transport tax profile pending approval", rate: 0, approved: false }],
  distanceBasis: "Customer pickup to final drop",
  availability: "not-held",
};

const regionalCard = (): RateCardDetail => ({
  ...blankHotel(),
  id: "rc-kerala-private-hire",
  name: "Kerala private hire rates",
  ref: "RC-KERALA-HIRE",
  vendor: "BlueWave Transfers",
  property: "Kerala private transport",
  service: "Transport",
  validity: "01 Oct 2026 – 31 Mar 2027",
  ready: "Confirm rates, capacity and terms with supplier",
  supplements: [], services: [], activities: [], rules: [], cancel: [], policies: [], activity: [],
  seasons: [{ name: "Standard", colorToken: "accent", dates: "01 Oct 2026 – 31 Mar 2027", summary: "Supplier confirmation pending", nights: 182, priority: "Base" }],
  regionalTransport: regionalPrivateHire,
});

DETAIL_CARDS["rc-kerala-private-hire"] = regionalCard();

function focusedTransportCard(id: string, name: string, methods: RegionalTransportTariff["enabledMethods"], vendor: string, property: string): RateCardDetail {
  const card = structuredClone(regionalCard());
  const selected = methods || [];
  const tariff = card.regionalTransport!;
  card.id = id;
  card.ref = id === "rc-kochi-local-transfers" ? "RC-KOCHI-LOCAL" : "RC-KERALA-KM";
  card.name = name;
  card.vendor = vendor;
  card.property = property;
  card.regionalTransport = {
    ...tariff,
    enabledMethods: selected,
    fares: tariff.fares.filter((fare) => selected.includes(fare.service)).map((fare) => ({ ...fare, allowedRouteIds: selected.includes("one-way") ? fare.allowedRouteIds : [] })),
    routes: selected.includes("one-way") ? tariff.routes?.filter((route) => route.id !== "kerala-circuit") : [],
    localPackages: selected.includes("local") ? tariff.localPackages : [],
    operatingAreas: selected.includes("one-way") ? [{ id: "kochi", name: "Kochi local area" }] : [{ id: "kerala-circuit", name: "Kerala circuit" }],
    activeAreaIds: selected.includes("one-way") ? ["kochi"] : ["kerala-circuit"],
    coverage: selected.includes("one-way") ? "Kochi airport and local area" : "Kerala outstation routes",
    startingHub: selected.includes("outstation") ? "Kochi" : undefined,
    charges: tariff.charges.filter((charge) => selected.includes("one-way") ? charge.id === "night-pickup" : charge.id !== "night-pickup").map((charge) => selected.includes("one-way") ? charge : { ...charge, routeIds: [] }),
    adjustments: [],
    source: "Illustrative supplier terms; confirm before quoting",
    sourceDocument: "Reference card",
  };
  return card;
}

DETAIL_CARDS["rc-kochi-local-transfers"] = focusedTransportCard("rc-kochi-local-transfers", "Kochi airport and local transfers", ["one-way", "local"], "BlueWave Transfers", "Kochi airport and local transport");
DETAIL_CARDS["rc-kerala-km-tariff"] = focusedTransportCard("rc-kerala-km-tariff", "Kerala outstation kilometre tariff", ["outstation", "daily"], "Trailmakers Experiences", "Kerala outstation transport");

function airportTransferWorkbook(card: RateCardDetail): RegionalTransportTariff | undefined {
  const old = card.transport;
  if (!old) return undefined;
  const seasonId = "airport-2026";
  return {
    schemaVersion: 2,
    coverage: "Kochi airport and city transfer routes",
    source: "Supplier transfer tariff; ancillary terms need confirmation",
    sourceDocument: "Transfer tariff on file",
    sourceStatus: "supplier-confirmed",
    taxPresentation: old.taxPresentation,
    timezone: old.timezone,
    seasons: [{ id: seasonId, name: "2026", start: old.validFrom, end: old.validTo }],
    enabledMethods: ["one-way"],
    operatingAreas: [{ id: "kochi", name: "Kochi airport area" }],
    activeAreaIds: ["kochi"],
    routes: old.routes.map((route) => ({ id: route.id, name: route.label, from: route.from, to: route.to, areaId: "kochi" })),
    localPackages: [],
    vehicles: old.offerings,
    fares: old.routes.flatMap((route) => old.offerings.map((vehicle) => ({
      id: `transfer-${route.id}-${vehicle.id}`, service: "one-way" as const, label: route.label, basis: "fixed" as const,
      vehicleId: vehicle.id, routeId: route.id, seasonId, amount: route.prices[vehicle.id] ?? null,
      includedKm: route.includedKm, includedHours: null, includedWaitingMinutes: old.waitingIncludedMinutes,
      extraKm: null, extraHour: null, waitingRatePerHour: old.waitingRatePerHour, timeIncrementMinutes: undefined,
      includedStops: 0, extraStop: null, routeScope: route.label, fuelIncluded: false, driverIncluded: false,
      taxPresentation: old.taxPresentation === "included" ? "included" as const : "additional" as const,
      taxProfileId: "airport-tax",
    }))),
    charges: old.charges,
    adjustments: [],
    taxProfiles: [{ id: "airport-tax", name: "Airport transfer tax profile pending approval", rate: 0, approved: false }],
    distanceBasis: "Customer pickup to final drop",
    availability: old.availability,
  };
}

const airportCard = DETAIL_CARDS["rc-air-2026"];
if (airportCard?.transport) airportCard.regionalTransport = airportTransferWorkbook(airportCard);

for (const fixture of PRIVATE_TRANSPORT_FIXTURES) {
  DETAIL_CARDS[fixture.id] = {
    ...blankHotel(), id: fixture.id, ref: fixture.ref, name: fixture.name,
    vendor: fixture.vendorName, property: fixture.serviceName, service: "Transport",
    currency: "INR", validity: "01 Oct 2026 – 31 Mar 2027",
    state: fixture.tariff.status, tone: fixture.tariff.status === "Active" ? "success" : "warning",
    ready: "Demo tariff · illustrative prices", readyTone: "warning", markupPercent: 0,
    supplements: [], services: [], activities: [], rules: [], cancel: [], policies: [], activity: [],
    privateTransport: structuredClone(fixture.tariff),
  };
}

for (const fixture of ACTIVITY_RATE_FIXTURES) {
  DETAIL_CARDS[fixture.id] = {
    ...blankHotel(), id: fixture.id, ref: fixture.ref, name: fixture.name,
    vendor: fixture.vendorName, property: fixture.serviceName, service: "Activities",
    currency: "INR", validity: "01 Oct 2026 – 31 Mar 2027",
    state: "Draft", tone: "warning", ready: "Supplier confirmation pending",
    readyTone: "warning", markupPercent: 0,
    supplements: [], services: [], activities: [], rules: [], cancel: [], policies: [], activity: [],
    activityTariff: structuredClone(fixture.tariff), activityVersions: [],
  };
}

const activityCardKey = (id: string) => `paryatech:activity-rate:v1:${id}`;
const createdActivityIndexKey = "paryatech:activity-rate-created:v1";
const createdTransportIndexKey = "paryatech:transport-rate-created:v3";

export function listCreatedPrivateTransportCards(): RateCardDetail[] {
  if (typeof window === "undefined") return [];
  try {
    const ids = JSON.parse(window.localStorage.getItem(createdTransportIndexKey) || "[]") as string[];
    return ids.map((id) => {
      const raw = window.localStorage.getItem(`paryatech:transport-rate:v3:${id}`);
      return raw ? JSON.parse(raw) as RateCardDetail : null;
    }).filter((card): card is RateCardDetail => Boolean(card?.privateTransport?.schemaVersion === 1));
  } catch { return []; }
}

export function listCreatedActivityCards(): RateCardDetail[] {
  if (typeof window === "undefined") return [];
  try {
    const ids = JSON.parse(window.localStorage.getItem(createdActivityIndexKey) || "[]") as string[];
    return ids.map((id) => {
      const raw = window.localStorage.getItem(activityCardKey(id));
      return raw ? JSON.parse(raw) as RateCardDetail : null;
    }).filter((card): card is RateCardDetail => Boolean(card?.activityTariff?.schemaVersion === 1));
  } catch { return []; }
}

export function getDetailCard(id: string): RateCardDetail | undefined {
  const seed = DETAIL_CARDS[id] ?? listCreatedActivityCards().find((card) => card.id === id) ?? listCreatedPrivateTransportCards().find((card) => card.id === id);
  if (seed?.activityTariff && typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(activityCardKey(id));
      const saved = raw ? JSON.parse(raw) as RateCardDetail : null;
      return saved?.activityTariff?.schemaVersion === 1 && saved.activityTariff.vendorId === seed.activityTariff.vendorId && saved.activityTariff.serviceId === seed.activityTariff.serviceId ? saved : seed;
    } catch { return seed; }
  }
  if ((!seed?.transport && !seed?.regionalTransport && !seed?.privateTransport) || typeof window === "undefined") return seed;
  try {
    const stored = window.localStorage.getItem(`paryatech:transport-rate:${seed.privateTransport ? "v3" : "v2"}:${id}`);
    if (!stored) return seed;
    const parsed = JSON.parse(stored) as RateCardDetail;
    if (parsed.id !== id || !(parsed.privateTransport?.schemaVersion === 1 || parsed.transport?.routes && parsed.transport?.offerings || parsed.regionalTransport?.fares && parsed.regionalTransport?.seasons)) return seed;
    if (parsed.regionalTransport && parsed.regionalTransport.schemaVersion !== 2) return seed;
    if (parsed.privateTransport && parsed.privateTransport.illustrative === undefined && /demo tariff|illustrative/i.test(parsed.privateTransport.sourceDocument)) {
      parsed.privateTransport = { ...parsed.privateTransport, illustrative: true, sourceConfirmed: false, status: "Draft" };
      parsed.state = "Draft";
      parsed.tone = "warning";
    }
    return seed?.regionalTransport && parsed.transport && !parsed.regionalTransport ? { ...parsed, regionalTransport: airportTransferWorkbook(parsed) } : parsed;
  } catch {
    return seed;
  }
}

export function saveTransportCard(card: RateCardDetail): void {
  if (card.activityTariff && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(activityCardKey(card.id), JSON.stringify(card));
      if (!DETAIL_CARDS[card.id]) {
        const ids = JSON.parse(window.localStorage.getItem(createdActivityIndexKey) || "[]") as string[];
        window.localStorage.setItem(createdActivityIndexKey, JSON.stringify([...new Set([...ids, card.id])]));
      }
    } catch { /* Keep the on-screen draft when browser storage is unavailable. */ }
    return;
  }
  if ((!card.transport && !card.regionalTransport && !card.privateTransport) || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`paryatech:transport-rate:${card.privateTransport ? "v3" : "v2"}:${card.id}`, JSON.stringify(card));
    if (card.privateTransport && !DETAIL_CARDS[card.id]) {
      const ids = JSON.parse(window.localStorage.getItem(createdTransportIndexKey) || "[]") as string[];
      window.localStorage.setItem(createdTransportIndexKey, JSON.stringify([...new Set([...ids, card.id])]));
    }
  } catch {
    // The on-screen draft still works when browser storage is unavailable.
  }
}

export function listDetailCards(): RateCardDetail[] {
  return [...Object.values(DETAIL_CARDS), ...listCreatedActivityCards(), ...listCreatedPrivateTransportCards()];
}

/** Fresh draft from an enabled template, stamped with the current vendor. */
export function createBlankCard(templateId: string, vendorName: string, vendorId = "", serviceId = ""): RateCardDetail {
  const transportTemplate = templateId.startsWith("transport-") ? templateId.slice(10) as PrivateTransportTemplate : null;
  const base = structuredClone(templateId === "visa" ? blankVisa() : blankHotel());
  const stamp = Date.now().toString(36);
  const example = transportTemplate ? PRIVATE_TRANSPORT_FIXTURES.find((fixture) => fixture.tariff.template === transportTemplate) : undefined;
  const vehicleIds = readVehicleOfferings().filter((offering) => offering.vendorId === vendorId && offering.serviceIds.includes(serviceId)).map((offering) => offering.id);
  const newTariff = example && transportTemplate ? structuredClone(example.tariff) : undefined;
  const activityService = templateId === "activity" ? [...DIRECTORY_SERVICES, ...readCreatedDirectoryServices()].find((service) => service.id === serviceId && service.category === "Activities" && (service.profileVendorId === vendorId || VENDOR_SERVICE_CONNECTIONS.some((connection) => connection.vendorId === vendorId && connection.serviceId === service.id))) : undefined;
  const activityTariff: ActivityTariff | undefined = templateId === "activity" ? {
    schemaVersion: 1, vendorId, serviceId, version: 1, validFrom: "", validTo: "", sourceDocument: "", sourceConfirmed: false,
    methods: [], personRates: [], bookingRates: [], unitRates: [], charges: [], adjustments: [],
    taxMode: "exclusive", taxProfileId: null, approvedTaxRate: null, taxApprovalSource: "", commercialPolicy: "",
  } : undefined;
  if (newTariff) {
    newTariff.vendorId = vendorId;
    newTariff.serviceId = serviceId;
    newTariff.vehicleIds = vehicleIds;
    newTariff.coverageAreas = [];
    newTariff.validFrom = "";
    newTariff.validTo = "";
    newTariff.sourceDocument = "";
    newTariff.sourceConfirmed = false;
    newTariff.illustrative = false;
    newTariff.status = "Draft";
    newTariff.taxMode = null;
    newTariff.taxProfileId = null;
    newTariff.routes = [];
    newTariff.packages = [];
    newTariff.rules = { ...newTariff.rules, minimumMethod: null, distanceBasis: "", billableDayMethod: null, timezone: "", garageKm: null, emptyReturnKm: null, fuelIncluded: null, carryUnusedKm: null, carryUnusedHours: null, excessMethod: null };
    newTariff.routes = newTariff.routes.map((route) => ({ ...route, prices: Object.fromEntries(vehicleIds.map((id) => [id, null])) }));
    newTariff.packagePrices = Object.fromEntries(vehicleIds.map((id) => [id, Object.fromEntries(newTariff.packages.map((pkg) => [pkg.id, null]))]));
    newTariff.outstationPrices = Object.fromEntries(vehicleIds.map((id) => [id, { ratePerKm: null, minKmPerDay: null, driverPerDay: null }]));
    newTariff.dailyPrices = Object.fromEntries(vehicleIds.map((id) => [id, { pricePerDay: null, includedKmPerDay: null, includedHoursPerDay: null }]));
    newTariff.excessPrices = Object.fromEntries(vehicleIds.map((id) => [id, { extraKm: null, extraHour: null }]));
    newTariff.charges = [];
  }
  return {
    ...base,
    id: `rc-draft-${templateId}-${stamp}`,
    ref: transportTemplate ? `RC-${stamp.toUpperCase()}` : base.ref,
    vendor: vendorName,
    property: activityService?.name ?? (transportTemplate ? DIRECTORY_SERVICES.find((service) => service.id === serviceId && service.profileVendorId === vendorId)?.name || "Transport service" : templateId === "visa" ? "Untitled visa product" : "Untitled property"),
    name: templateId === "activity" ? `${activityService?.name ?? "Activity"} supplier rates` : transportTemplate ? `New ${TRANSPORT_TEMPLATE_LABELS[transportTemplate]} rate card` : base.name,
    service: templateId === "activity" ? "Activities" : transportTemplate ? "Transport" : base.service,
    state: "Draft", tone: "warning", markupPercent: transportTemplate ? 0 : base.markupPercent,
    privateTransport: newTariff,
    activityTariff,
    activityVersions: activityTariff ? [] : undefined,
  };
}

export function formatMoney(amount: number | null | undefined, currency = "INR"): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const BED_LABEL: Record<string, string> = {
  extra_bed: "With extra bed",
  existing_bed: "Sharing existing bed",
  cot: "Cot on request",
  no_bed: "Without extra bed",
};
