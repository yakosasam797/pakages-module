/** Activity / type of the service — used by the Services toolbar filter. */
export type ServiceType =
  | "Accommodation"
  | "Activity"
  | "Transport"
  | "DMC/Ground handling"
  | "Visa"
  | "Flights";

const thumb = (id: string, w = 640, h = 480) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export interface ServiceMedia {
  id: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  /** Defaults to image when omitted */
  kind?: "image" | "video";
  /** Banner marks the hero image used on packages / list thumb */
  usedInBanner?: boolean;
  usedInPackages?: string[];
}

/** Linked rate card shown by name only on the service (opens the rate card). */
export interface ServiceRateCardLink {
  id: string;
  name: string;
}

export interface ServiceProfile {
  category: string;
  duration: string;
  ageSuitability: string;
  difficulty: string;
  seasonality: string;
  searchText: string;
  exclusions: string[];
}

export interface VendorService {
  id: string;
  vendorId: string;
  name: string;
  type: ServiceType;
  details: string;
  /** Short about copy on the service detail */
  about: string;
  location: string;
  inclusions: string[];
  profile: ServiceProfile;
  pricingLabel: string;
  rateCardCount: number;
  /** Linked rate cards — name only in the UI */
  rateCards: ServiceRateCardLink[];
  /** Primary / list thumb (usually the banner media) */
  imageUrl: string;
  imageAlt: string;
  media: ServiceMedia[];
}

export const SERVICE_TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "Accommodation", label: "Accommodation" },
  { value: "Activity", label: "Activity" },
  { value: "Transport", label: "Transport" },
  { value: "DMC/Ground handling", label: "DMC / Ground" },
  { value: "Visa", label: "Visa" },
  { value: "Flights", label: "Flights" },
];

function directoryService(input: {
  id: string;
  vendorId: string;
  name: string;
  type: ServiceType;
  location: string;
  details: string;
  about: string;
  pricingLabel: string;
  rateCards: ServiceRateCardLink[];
  imageId: string;
  imageIds?: string[];
}): VendorService {
  const imageUrl = thumb(input.imageId, 640, 480);
  const galleryIds = input.imageIds?.length ? input.imageIds : [input.imageId];
  return {
    ...input,
    profile: {
      category: input.type,
      duration: input.type === "Accommodation" ? "Overnight or multi-night" : "Service based",
      ageSuitability: "All ages",
      difficulty: "Not applicable",
      seasonality: input.rateCards.length ? "Available according to the linked rate-card validity." : "Subject to supplier availability and a confirmed quote.",
      searchText: `${input.name} ${input.location} ${input.type}`,
      exclusions: ["Items not listed in the confirmed rate card", "Personal expenses"],
    },
    inclusions: input.rateCards.length ? ["Products listed on the linked rate card", "Vendor confirmation and support"] : ["Service scope as confirmed by the supplier"],
    rateCardCount: input.rateCards.length,
    imageUrl,
    imageAlt: input.name,
    media: galleryIds.map((imageId, index) => ({
      id: `${input.id}-media-${index + 1}`,
      title: index === 0 ? `${input.name} primary image` : `${input.name} view ${index + 1}`,
      imageUrl: thumb(imageId, 640, 480),
      imageAlt: `${input.name} ${index === 0 ? "exterior" : `view ${index + 1}`}`,
      usedInBanner: index === 0,
    })),
  };
}

function baliService(input: { id: string; vendorId: string; name: string; type: ServiceType; location: string; details: string; about: string; imageId: string }): VendorService {
  return directoryService({ ...input, pricingLabel: "Supplier quote pending", rateCards: [] });
}

export const VENDOR_SERVICES: VendorService[] = [
  ...[
    { id: "cityride-fixed", vendorId: "cityride", name: "Kochi fixed transfers", location: "Kochi + intercity", details: "Private airport and intercity transfers", cardIds: ["rc-cityride-fixed"] },
    { id: "kochi-local-duty", vendorId: "kochi-local-cabs", name: "Kochi local sightseeing", location: "Kochi", details: "Private local duty packages", cardIds: ["rc-local-cabs"] },
    { id: "jaipur-local-duty", vendorId: "jaipur-local-cabs", name: "Jaipur local sightseeing", location: "Jaipur", details: "Private local duty packages", cardIds: ["rc-jaipur-local"] },
    { id: "bengaluru-local-duty", vendorId: "bengaluru-city-rides", name: "Bengaluru local sightseeing", location: "Bengaluru", details: "Private local duty packages", cardIds: ["rc-bengaluru-local"] },
    { id: "kerala-road-hire", vendorId: "kerala-road-trips", name: "Kerala outstation transport", location: "Kerala", details: "Private outstation hire by kilometre", cardIds: ["rc-road-trips"] },
    { id: "south-coast-daily", vendorId: "south-coast-coaches", name: "Van and coach daily hire", location: "South India", details: "Private van and coach day hire", cardIds: ["rc-south-coast"] },
    { id: "trail-fixed", vendorId: "trailmakers", name: "Kochi fixed transfers", location: "Kochi + intercity", details: "Private airport and intercity transfers", cardIds: ["rc-trail-fixed"] },
    { id: "trail-local", vendorId: "trailmakers", name: "Kochi local sightseeing", location: "Kochi", details: "Private local duty packages", cardIds: ["rc-trail-local"] },
    { id: "trail-outstation", vendorId: "trailmakers", name: "Kerala outstation transport", location: "Kerala", details: "Private outstation hire by kilometre", cardIds: ["rc-trail-km"] },
    { id: "trail-daily", vendorId: "trailmakers", name: "Kerala daily vehicle hire", location: "Kerala", details: "Private daily vehicle hire", cardIds: ["rc-trail-daily"] },
  ].map((item) => directoryService({
    id: `svc-${item.id}`, vendorId: item.vendorId, name: item.name, type: "Transport", location: item.location,
    details: item.details, about: item.details,
    pricingLabel: `${item.cardIds.length} focused rate card${item.cardIds.length === 1 ? "" : "s"}`,
    rateCards: item.cardIds.map((id) => ({ id, name: id.replace(/^rc-/, "").replaceAll("-", " ") })),
    imageId: "photo-1449965408869-eaa3f722e40d",
  })),
  directoryService({
    id: "svc-taj-exotica",
    vendorId: "exhosp",
    name: "Taj Exotica Resort & Spa",
    type: "Accommodation",
    location: "Goa",
    details: "Beach resort · 12 room types",
    about: "A beach resort supplied through direct, DMC, and wholesale contracts, each with its own products and rate card.",
    pricingLabel: "Accommodation tariff · 2026–27",
    rateCards: [{ id: "rc-acc-2627", name: "Accommodation tariff · 2026–27" }],
    imageId: "photo-1582719478250-c89cae4dc85b",
    imageIds: [
      "photo-1582719478250-c89cae4dc85b",
      "photo-1566073771259-6a8506099945",
      "photo-1571896349842-33c89424de2d",
    ],
  }),
  directoryService({
    id: "svc-taj-lake-palace",
    vendorId: "kerala-heritage",
    name: "Taj Lake Palace",
    type: "Accommodation",
    location: "Udaipur",
    details: "Palace hotel · 9 room types",
    about: "Lake-front palace accommodation with direct and DMC supply options.",
    pricingLabel: "Palace stay tariff · 2026–27",
    rateCards: [{ id: "rc-acc-2627", name: "Palace stay tariff · 2026–27" }],
    imageId: "photo-1564501049412-61c2a3083791",
  }),
  directoryService({
    id: "svc-taj-bekal",
    vendorId: "coastal",
    name: "Taj Bekal Resort & Spa",
    type: "Accommodation",
    location: "Kerala",
    details: "Coastal resort · 10 room types",
    about: "A Kerala coastal resort available through direct, DMC, and wholesale supplier relationships.",
    pricingLabel: "Bekal direct tariff · 2026–27",
    rateCards: [{ id: "rc-acc-2627", name: "Bekal direct tariff · 2026–27" }],
    imageId: "photo-1571896349842-33c89424de2d",
  }),
  directoryService({
    id: "svc-uae-visa",
    vendorId: "atlas-visa",
    name: "UAE Tourist Visa",
    type: "Visa",
    location: "UAE",
    details: "30, 60, and 90 day products",
    about: "Tourist visa processing products with government, centre, and vendor fee components.",
    pricingLabel: "Visa services tariff · UAE",
    rateCards: [{ id: "rc-visa-uae", name: "Visa services tariff · UAE" }],
    imageId: "photo-1436491865332-7a61a109cc05",
  }),
  directoryService({
    id: "svc-kerala-flights",
    vendorId: "trailmakers",
    name: "Kerala Flight Ticketing",
    type: "Flights",
    location: "India",
    details: "Domestic and international ticketing",
    about: "Managed air-ticketing support for domestic and international itineraries.",
    pricingLabel: "Air ticketing fees · 2026",
    rateCards: [{ id: "rc-air-2026", name: "Air ticketing fees · 2026" }],
    imageId: "photo-1436491865332-7a61a109cc05",
  }),
  {
    ...directoryService({
      id: "svc-transfer-dps",
      vendorId: "island-wheels-bali",
      name: "Denpasar airport transfer",
      type: "Transport",
      location: "Denpasar, Bali, Indonesia",
      details: "Private airport pickup or drop-off · rate to confirm",
      about: "A Bali airport transfer profile for DPS arrivals and departures. Confirm the hotel route, passenger count, luggage, vehicle and supplier quote before pricing a proposal.",
      pricingLabel: "Supplier quote pending",
      rateCards: [],
      imageId: "photo-1449965408869-eaa3f722e40d",
    }),
    inclusions: ["Private vehicle and driver as confirmed", "Airport pickup or drop-off as booked"],
    profile: {
      category: "Private airport transfer",
      duration: "Route based",
      ageSuitability: "All ages",
      difficulty: "Not applicable",
      seasonality: "Subject to supplier availability and a confirmed quote.",
      searchText: "Bali Denpasar DPS airport transfer private pickup drop off transport",
      exclusions: ["Unconfirmed waiting time", "Unscheduled route changes", "Items outside the supplier quote"],
    },
  },
  {
    ...directoryService({
      id: "svc-ubud-day-car",
      vendorId: "island-wheels-bali",
      name: "Ubud private day car",
      type: "Transport",
      location: "Ubud, Bali, Indonesia",
      details: "Private vehicle with driver · rate to confirm",
      about: "A private day car for Ubud and nearby stops. Confirm the route, hours, vehicle capacity and supplier quote before pricing a proposal.",
      pricingLabel: "Supplier quote pending",
      rateCards: [],
      imageId: "photo-1449965408869-eaa3f722e40d",
    }),
    inclusions: ["Private vehicle and driver as confirmed", "Planned route as agreed with supplier"],
    profile: {
      category: "Private day car",
      duration: "Day based",
      ageSuitability: "All ages",
      difficulty: "Not applicable",
      seasonality: "Subject to supplier availability and a confirmed quote.",
      searchText: "Ubud Bali private day car driver vehicle transport",
      exclusions: ["Unconfirmed overtime", "Unscheduled route changes", "Items outside the supplier quote"],
    },
  },
  baliService({ id: "svc-ubud-garden-suites", vendorId: "ubud-stay-collective", name: "Ubud Garden Suites", type: "Accommodation", location: "Ubud, Bali, Indonesia", details: "Garden suites · breakfast option", about: "An inland Bali stay for multi-day itineraries. Confirm room category, occupancy, dates and meal plan before pricing.", imageId: "photo-1566073771259-6a8506099945" }),
  baliService({ id: "svc-seminyak-coastal-stay", vendorId: "ubud-stay-collective", name: "Seminyak Coastal Stay", type: "Accommodation", location: "Seminyak, Bali, Indonesia", details: "Coastal rooms · family option", about: "A coastal stay for the first or final nights of a Bali trip. Confirm room category, occupancy and dates before pricing.", imageId: "photo-1571896349842-33c89424de2d" }),
  baliService({ id: "svc-tegallalang-rice-walk", vendorId: "bali-heritage-studio", name: "Tegallalang rice terrace walk", type: "Activity", location: "Tegallalang, Bali, Indonesia", details: "Hosted walk · viewpoint stop", about: "A hosted rice terrace walk with viewpoint time. Confirm guide, access and schedule with the supplier.", imageId: "photo-1544735716-392fe2489ffa" }),
  baliService({ id: "svc-uluwatu-sunset-visit", vendorId: "bali-heritage-studio", name: "Uluwatu sunset visit", type: "Activity", location: "Uluwatu, Bali, Indonesia", details: "Cultural visit · sunset timing", about: "A late-day coastal and cultural visit. Confirm admission, guide and transport before pricing.", imageId: "photo-1506905925346-21bda4d32df4" }),
  baliService({ id: "svc-penida-coastal-day", vendorId: "penida-coast-experiences", name: "Nusa Penida coastal day", type: "Activity", location: "Nusa Penida, Bali, Indonesia", details: "Island day · boat and road segments", about: "A coastal island day combining boat coordination and local road transfers. Confirm operating conditions and supplier scope.", imageId: "photo-1469854523086-cc02fe5d8800" }),
  baliService({ id: "svc-denpasar-flight-coordination", vendorId: "bali-ground-desk", name: "Denpasar flight coordination", type: "Flights", location: "Denpasar, Bali, Indonesia", details: "Arrival and return timing", about: "Coordinates flight timings with airport pickups and trip handoffs. Ticketing and supplier fees require separate confirmation.", imageId: "photo-1436491865332-7a61a109cc05" }),
  baliService({ id: "svc-bali-arrival-assistance", vendorId: "bali-ground-desk", name: "Bali arrival assistance", type: "Visa", location: "Denpasar, Bali, Indonesia", details: "Document and arrival support", about: "Planning support for traveler documents and arrival handoff. Confirm current eligibility and requirements for each traveler.", imageId: "photo-1436491865332-7a61a109cc05" }),
  baliService({ id: "svc-bali-ground-coordination", vendorId: "bali-ground-desk", name: "Bali ground coordination", type: "DMC/Ground handling", location: "Bali, Indonesia", details: "Hotel, transfer and activity handoffs", about: "One operations contact for multi-stop Bali trips. Confirm the scope of supplier coordination and any handling fee.", imageId: "photo-1449965408869-eaa3f722e40d" }),
  {
    id: "svc-lake",
    vendorId: "exhosp",
    name: "Example Lake Resort",
    type: "Accommodation",
    details: "Lake resort · 2 room categories",
    about:
      "Lakeside resort on Vembanad with garden and lake-view rooms. Soft check-in from 14:00; pool and jetty access included for staying guests.",
    location: "Alleppey · Kochi corridor",
    inclusions: [
      "Garden View and Lake View room categories",
      "Breakfast options on meal plans",
      "Pool and jetty access for in-house guests",
      "Early check-in subject to availability",
    ],
    profile: {
      category: "Resort stay",
      duration: "Overnight or multi-night",
      ageSuitability: "All ages",
      difficulty: "Not applicable",
      seasonality: "Year-round; peak season from October to March.",
      searchText: "Alleppey lake resort Vembanad backwater stay pool jetty",
      exclusions: ["Transfers unless included in the package", "Meals outside the selected plan", "Personal expenses"],
    },
    pricingLabel: "Accommodation tariff · 2026–27",
    rateCardCount: 2,
    rateCards: [
      { id: "rc-acc-2627", name: "Accommodation tariff · 2026–27" },
      { id: "rc-acc-2526", name: "Accommodation tariff · 2025–26" },
    ],
    imageUrl: thumb("photo-1566073771259-6a8506099945", 96, 96),
    imageAlt: "Example Lake Resort exterior",
    media: [
      {
        id: "m-lake-1",
        title: "Lakeside façade",
        imageUrl: thumb("photo-1566073771259-6a8506099945"),
        imageAlt: "Lakeside resort façade",
        usedInBanner: true,
        usedInPackages: ["Kerala lake escape", "Family Kochi stay"],
      },
      {
        id: "m-lake-2",
        title: "Garden View room",
        imageUrl: thumb("photo-1631049307264-da0ec9d70304"),
        imageAlt: "Garden View guest room",
        usedInPackages: ["Kerala lake escape"],
      },
      {
        id: "m-lake-3",
        title: "Lake View Suite",
        imageUrl: thumb("photo-1582719478250-c89cae4dc85b"),
        imageAlt: "Lake View suite interior",
      },
      {
        id: "m-lake-4",
        title: "Pool deck",
        imageUrl: thumb("photo-1571896349842-33c89424de2d"),
        imageAlt: "Resort pool overlooking water",
      },
    ],
  },
  {
    id: "svc-cardamom",
    vendorId: "exhosp",
    name: "Cardamom plantation tour",
    type: "Activity",
    details: "Guests · included with stay",
    about:
      "Guided walk through working cardamom estates with drying-yard stop. Usually bundled with Hill Retreat stays; half-day timing.",
    location: "Thekkady foothills",
    inclusions: [
      "Guided plantation walk",
      "Drying-yard visit",
      "Bottled water",
      "Transfer from Hill Retreat when bundled",
    ],
    profile: {
      category: "Sightseeing and nature",
      duration: "4 hours",
      ageSuitability: "8 years and above",
      difficulty: "Easy",
      seasonality: "Best from October to March; monsoon visits depend on conditions.",
      searchText: "cardamom plantation tour Thekkady spice walk drying yard",
      exclusions: ["Meals", "Personal purchases", "Transfer when booked separately"],
    },
    pricingLabel: "Accommodation tariff · 2026–27",
    rateCardCount: 2,
    rateCards: [
      { id: "rc-acc-2627", name: "Accommodation tariff · 2026–27" },
      { id: "rc-hill-2627", name: "Hill Retreat tariff · 2026–27" },
    ],
    imageUrl: thumb("photo-1544735716-392fe2489ffa", 96, 96),
    imageAlt: "Cardamom plantation path",
    media: [
      {
        id: "m-tour-1",
        title: "Plantation walk",
        imageUrl: thumb("photo-1544735716-392fe2489ffa"),
        imageAlt: "Plantation walk through spice estates",
        usedInBanner: true,
        usedInPackages: ["Spice belt day"],
      },
      {
        id: "m-tour-2",
        title: "Cardamom drying yard",
        imageUrl: thumb("photo-1464226184884-fa280b87c399"),
        imageAlt: "Cardamom drying yard",
        usedInPackages: ["Spice belt day"],
      },
    ],
  },
  {
    id: "svc-hill",
    vendorId: "exhosp",
    name: "Example Hill Retreat",
    type: "Accommodation",
    details: "Hill resort · 3 room categories",
    about:
      "Valley-facing hill resort with deluxe, premium, and family suites. Winter rates still open — treat unpriced seasons as blocked.",
    location: "Munnar belt",
    inclusions: [
      "Deluxe, Premium, and Family Suite categories",
      "Valley views on premium stock",
      "Bonfire on request",
      "Airport SUV transfer add-on",
    ],
    profile: {
      category: "Hill resort stay",
      duration: "Overnight or multi-night",
      ageSuitability: "All ages",
      difficulty: "Not applicable",
      seasonality: "Year-round; best visibility from September to May.",
      searchText: "Munnar hill retreat valley resort family suite bonfire",
      exclusions: ["Airport transfers", "Bonfire unless confirmed", "Meals outside the selected plan"],
    },
    pricingLabel: "Hill Retreat tariff · 2026–27",
    rateCardCount: 1,
    rateCards: [{ id: "rc-hill-2627", name: "Hill Retreat tariff · 2026–27" }],
    imageUrl: thumb("photo-1506905925346-21bda4d32df4", 96, 96),
    imageAlt: "Example Hill Retreat in the mountains",
    media: [
      {
        id: "m-hill-1",
        title: "Valley approach",
        imageUrl: thumb("photo-1506905925346-21bda4d32df4"),
        imageAlt: "Valley approach to the hill retreat",
        usedInBanner: true,
        usedInPackages: ["Hill weekend"],
      },
      {
        id: "m-hill-2",
        title: "Lobby lounge",
        imageUrl: thumb("photo-1618773928121-c32242e63f39"),
        imageAlt: "Hill retreat lobby lounge",
      },
      {
        id: "m-hill-3",
        title: "Family Suite",
        imageUrl: thumb("photo-1590490360182-c33d57733427"),
        imageAlt: "Family suite living space",
      },
    ],
  },
  {
    id: "svc-trek-munnar",
    vendorId: "trailmakers",
    name: "Munnar ridge trek",
    type: "Activity",
    details: "Guided · half day · max 12",
    about:
      "Guided ridge trek above the tea estates. Half-day outing with a hard cap of 12 guests; tea overlook stop included.",
    location: "Munnar ridge",
    inclusions: [
      "Local guide",
      "Safety briefing",
      "Tea estate overlook stop",
      "Bottled water",
    ],
    profile: {
      category: "Outdoor activity",
      duration: "4–5 hours",
      ageSuitability: "12 years and above",
      difficulty: "Moderate",
      seasonality: "October to March; closed during unsafe monsoon conditions.",
      searchText: "Munnar ridge trek tea estate guided hike hill activity",
      exclusions: ["Hotel transfers", "Meals", "Personal trekking equipment"],
    },
    pricingLabel: "Activity tariff · 2026",
    rateCardCount: 1,
    rateCards: [{ id: "rc-acc-2627", name: "Activity tariff · 2026" }],
    imageUrl: thumb("photo-1506905925346-21bda4d32df4", 96, 96),
    imageAlt: "Ridge path through tea estates",
    media: [
      {
        id: "m-trek-1",
        title: "Ridge path",
        imageUrl: thumb("photo-1506905925346-21bda4d32df4"),
        imageAlt: "Trekking path on the ridge",
        kind: "image",
        usedInBanner: true,
        usedInPackages: ["Hill weekend"],
      },
      {
        id: "m-trek-2",
        title: "Tea estate overlook",
        imageUrl: thumb("photo-1506905925346-21bda4d32df4"),
        imageAlt: "Tea estate overlook",
        kind: "image",
        usedInPackages: ["Hill weekend"],
      },
      {
        id: "m-trek-3",
        title: "Ridge walk reel",
        imageUrl: thumb("photo-1464822759023-fed622ff2c3b"),
        imageAlt: "Video still from ridge walk",
        kind: "video",
        usedInPackages: ["Hill weekend"],
      },
    ],
  },
  {
    id: "svc-kayak",
    vendorId: "trailmakers",
    name: "Backwater kayak",
    type: "Activity",
    details: "Alleppey canals · 2–3 hrs",
    about:
      "Kayak through quiet Alleppey canals. Soft launch near the lake resorts; 2–3 hour outing for couples and small groups.",
    location: "Alleppey canals",
    inclusions: [
      "Kayak and paddle",
      "Life jacket",
      "Local pilot for first-timers",
      "Canal launch point pickup when bundled",
    ],
    profile: {
      category: "Water activity",
      duration: "2–3 hours",
      ageSuitability: "10 years and above",
      difficulty: "Moderate",
      seasonality: "October to May; weather dependent during monsoon.",
      searchText: "Alleppey backwater kayak canal paddle Kerala activity",
      exclusions: ["Meals", "Hotel transfer when booked separately", "Waterproof personal storage"],
    },
    pricingLabel: "Activity tariff · 2026",
    rateCardCount: 1,
    rateCards: [{ id: "rc-acc-2627", name: "Activity tariff · 2026" }],
    imageUrl: thumb("photo-1602216056096-3b40cc0c9944", 96, 96),
    imageAlt: "Kayak on backwater canal",
    media: [
      {
        id: "m-kayak-1",
        title: "Canal launch",
        imageUrl: thumb("photo-1602216056096-3b40cc0c9944"),
        imageAlt: "Canal launch for kayaks",
        kind: "image",
        usedInBanner: true,
        usedInPackages: ["Kerala lake escape"],
      },
      {
        id: "m-kayak-2",
        title: "Palm canal stretch",
        imageUrl: thumb("photo-1439066615861-d1af74d74000"),
        imageAlt: "Palm-lined canal stretch",
        kind: "image",
      },
      {
        id: "m-kayak-3",
        title: "Paddle through canals",
        imageUrl: thumb("photo-1544551763-46a013bb70d5"),
        imageAlt: "Video still of kayak paddle",
        kind: "video",
      },
    ],
  },
];

export function servicesForVendor(vendorId: string): VendorService[] {
  return VENDOR_SERVICES.filter((s) => s.vendorId === vendorId);
}

export function getVendorService(id: string): VendorService | undefined {
  return VENDOR_SERVICES.find((s) => s.id === id);
}
