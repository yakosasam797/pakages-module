import type { StatusTone } from "@paryatech/design-system";
import type { ActivityRow } from "../components/ActivityPanel";
import type { Vendor } from "./vendors";

export interface TradeMetric {
  id: string;
  label: string;
  value: string;
  note: string;
  tab?: string;
  tone?: "warn" | "ok";
}

export interface ServiceCoverage {
  id: string;
  service: string;
  kind: string;
  coverage: string;
  hubs: string;
  season: string;
}

export interface OperatingFact {
  id: string;
  label: string;
  value: string;
}

export interface CommercialFact {
  id: string;
  label: string;
  value: string;
  note?: string;
  tab?: string;
}

export interface KeyContact {
  id: string;
  name: string;
  initials: string;
  role: string;
  phone: string;
  email: string;
  whatsapp?: string;
}

export interface VendorContact {
  id: string;
  name: string;
  initials: string;
  role: string;
  property: string;
  phone: string;
  email: string;
  primary?: boolean;
}

export type VendorBookingStatus = "upcoming" | "on-trip" | "completed";

export type VendorBookingFinance = "settled" | "to-collect" | "overdue" | "part-paid";

export interface VendorBooking {
  id: string;
  vendorId: string;
  title: string;
  ref: string;
  travel: string;
  party: string;
  service: string;
  serviceDetail: string;
  status: VendorBookingStatus;
  amount: string;
  finance: VendorBookingFinance;
  ownerName: string;
  ownerInitials: string;
}

/**
 * Operational snapshot — coverage / commercial / ops only.
 * Finance lives on its own tab, so it is not repeated here.
 */
export const SNAPSHOT_METRICS: TradeMetric[] = [
  {
    id: "coverage",
    label: "Coverage",
    value: "6 regions",
    note: "14 destinations · Kerala focus",
    tab: "services",
  },
  {
    id: "commercial",
    label: "Commercial readiness",
    value: "1 rate card",
    note: "Valid until 31 Mar 2027",
    tab: "rate-cards",
  },
  {
    id: "services",
    label: "Services",
    value: "3 live",
    note: "Stay · activity · transfers",
    tab: "services",
  },
  {
    id: "operations",
    label: "Operations",
    value: "4 upcoming",
    note: "1 at risk",
    tab: "bookings",
    tone: "warn",
  },
];

/** Services with coverage attached per service (not one global map). */
export const SERVICE_COVERAGE: ServiceCoverage[] = [
  {
    id: "sc1",
    service: "Lake & garden stay",
    kind: "Accommodation",
    coverage: "Alleppey · Kumarakom · Vembanad shore",
    hubs: "Example Lake Resort",
    season: "Year-round · Peak Dec–Jan",
  },
  {
    id: "sc2",
    service: "Hill trek & plantation walk",
    kind: "Activity",
    coverage: "Munnar · Thekkady trails",
    hubs: "Munnar base camp",
    season: "Oct–May · Monsoon closed",
  },
  {
    id: "sc3",
    service: "Airport & intercity transfers",
    kind: "Transport",
    coverage: "All Kerala · COK / TRV hubs",
    hubs: "Kochi · Trivandrum",
    season: "Daily · 05:00–23:00",
  },
];

export const OPERATING_FACTS: OperatingFact[] = [
  { id: "hours", label: "Operating hours", value: "Daily · 05:00–23:00 IST" },
  { id: "notice", label: "Minimum notice", value: "48 hours · 7 days for groups 12+" },
  { id: "capacity", label: "Capacity", value: "Up to 22 pax / booking · 8 rooms block" },
  { id: "languages", label: "Languages", value: "English · Malayalam · Hindi" },
  { id: "blackouts", label: "Blackouts", value: "20–26 Dec · 31 Dec–02 Jan" },
  { id: "hubs", label: "Pickup hubs", value: "COK · TRV · Alleppey jetty" },
];

export const COMMERCIAL_FACTS: CommercialFact[] = [
  {
    id: "rate-card",
    label: "Current rate card",
    value: "Accommodation tariff 2026–27",
    note: "01 Apr 2026 – 31 Mar 2027",
    tab: "rate-cards",
  },
  {
    id: "currency",
    label: "Currency & tax",
    value: "INR · Tax included",
    note: "Confirmed on live card",
  },
  {
    id: "payment",
    label: "Payment terms",
    value: "50% on confirmation",
    note: "Balance 21 days before arrival",
  },
  {
    id: "cancel",
    label: "Cancellation",
    value: "Free ≥30 days",
    note: "25% / 50% / 100% closer in",
  },
  {
    id: "markup",
    label: "Contracted markup",
    value: "12% NET",
    note: "Preferred supplier",
  },
  {
    id: "updated",
    label: "Last price update",
    value: "12 Aug 2026",
    note: "2 cells still missing on Peak",
    tab: "rate-cards",
  },
];

/** Compact role contacts for Overview — full directory stays light. */
export const KEY_CONTACTS: KeyContact[] = [
  {
    id: "kc1",
    name: "Ravi Nair",
    initials: "RN",
    role: "Reservations",
    phone: "+91 98470 11220",
    email: "ravi.nair@examplehosp.in",
    whatsapp: "+919847011220",
  },
  {
    id: "kc2",
    name: "Vikram Das",
    initials: "VD",
    role: "Operations",
    phone: "+91 98470 12402",
    email: "vikram.das@examplehosp.in",
    whatsapp: "+919847012402",
  },
  {
    id: "kc3",
    name: "Deepa Thomas",
    initials: "DT",
    role: "Finance",
    phone: "+91 98470 11884",
    email: "deepa.thomas@examplehosp.in",
  },
  {
    id: "kc4",
    name: "Jose Mathew",
    initials: "JM",
    role: "Emergency",
    phone: "+91 98470 12010",
    email: "jose.mathew@examplehosp.in",
    whatsapp: "+919847012010",
  },
];

export const BOOKING_STATUS_LABEL: Record<VendorBookingStatus, string> = {
  upcoming: "Upcoming",
  "on-trip": "On trip",
  completed: "Completed",
};

export const BOOKING_STATUS_TONE: Record<VendorBookingStatus, StatusTone> = {
  upcoming: "open",
  "on-trip": "progress",
  completed: "done",
};

export const BOOKING_FINANCE_LABEL: Record<VendorBookingFinance, string> = {
  settled: "Settled",
  "to-collect": "To collect",
  overdue: "Overdue",
  "part-paid": "Part paid",
};

export const BOOKING_FINANCE_TONE: Record<VendorBookingFinance, StatusTone> = {
  settled: "done",
  "to-collect": "progress",
  overdue: "blocked",
  "part-paid": "progress",
};

/** Recent bookings that used this vendor — full list lives on Bookings tab. */
export const VENDOR_BOOKINGS: VendorBooking[] = [
  {
    id: "vb1",
    vendorId: "exhosp",
    title: "XYZ Family · Dubai",
    ref: "BK-2026-000003",
    travel: "18–22 Aug",
    party: "3N · 3 pax",
    service: "Lake View Suite",
    serviceDetail: "2 rooms · MAP",
    status: "completed",
    amount: "₹1,65,000",
    finance: "overdue",
    ownerName: "Vrushabh Jain",
    ownerInitials: "VJ",
  },
  {
    id: "vb2",
    vendorId: "exhosp",
    title: "Kapoor group · Alleppey",
    ref: "BK-2026-000010",
    travel: "12–19 Sep",
    party: "7N · 4 pax",
    service: "Premium houseboat",
    serviceDetail: "1 cabin · AP",
    status: "on-trip",
    amount: "₹82,400",
    finance: "to-collect",
    ownerName: "Anjali Menon",
    ownerInitials: "AM",
  },
  {
    id: "vb3",
    vendorId: "exhosp",
    title: "Mehta honeymoon",
    ref: "BK-2026-000014",
    travel: "02–06 Oct",
    party: "4N · 2 pax",
    service: "Hill Retreat suite",
    serviceDetail: "1 suite · CP",
    status: "upcoming",
    amount: "₹48,000",
    finance: "settled",
    ownerName: "Vrushabh Jain",
    ownerInitials: "VJ",
  },
  {
    id: "vb4",
    vendorId: "coastal",
    title: "Singh family · Kochi",
    ref: "BK-2026-000018",
    travel: "10–12 Oct",
    party: "2N · 5 pax",
    service: "Garden Villa",
    serviceDetail: "3 rooms · EP",
    status: "upcoming",
    amount: "₹36,200",
    finance: "part-paid",
    ownerName: "Rahul Sharma",
    ownerInitials: "RS",
  },
  {
    id: "vb5",
    vendorId: "exhosp",
    title: "Corporate retreat · Munnar",
    ref: "BK-2026-000021",
    travel: "20–23 Oct",
    party: "3N · 16 pax",
    service: "Hill Retreat block",
    serviceDetail: "8 rooms · MAP",
    status: "upcoming",
    amount: "₹2,14,000",
    finance: "to-collect",
    ownerName: "Meera Iyer",
    ownerInitials: "MI",
  },
  {
    id: "vb6",
    vendorId: "exhosp",
    title: "Nair anniversary",
    ref: "BK-2026-000025",
    travel: "28–30 Oct",
    party: "2N · 2 pax",
    service: "Lake View Suite",
    serviceDetail: "1 suite · AP",
    status: "upcoming",
    amount: "₹41,500",
    finance: "settled",
    ownerName: "Anjali Menon",
    ownerInitials: "AM",
  },
  {
    id: "vb7",
    vendorId: "spice-route",
    title: "Desai group · Thekkady",
    ref: "BK-2026-000028",
    travel: "05–07 Nov",
    party: "2N · 8 pax",
    service: "Spice lodge",
    serviceDetail: "4 rooms · MAP",
    status: "upcoming",
    amount: "₹72,800",
    finance: "to-collect",
    ownerName: "Rahul Sharma",
    ownerInitials: "RS",
  },
  {
    id: "vb8",
    vendorId: "coastal",
    title: "Iyer family · Varkala",
    ref: "BK-2026-000031",
    travel: "14–17 Nov",
    party: "3N · 4 pax",
    service: "Cliff stay",
    serviceDetail: "2 rooms · CP",
    status: "upcoming",
    amount: "₹54,600",
    finance: "part-paid",
    ownerName: "Vrushabh Jain",
    ownerInitials: "VJ",
  },
  {
    id: "vb9",
    vendorId: "coastal",
    title: "Sharma Family · Goa",
    ref: "BK-2026-000004",
    travel: "02–06 Aug",
    party: "4N · 2 pax",
    service: "Beach cottage",
    serviceDetail: "1 cottage · MAP",
    status: "completed",
    amount: "₹48,000",
    finance: "settled",
    ownerName: "Vrushabh Jain",
    ownerInitials: "VJ",
  },
  {
    id: "vb10",
    vendorId: "wanderlust",
    title: "Patel Family · Manali",
    ref: "BK-2026-000006",
    travel: "24–28 Jul",
    party: "4N · 5 pax",
    service: "Mountain lodge",
    serviceDetail: "2 rooms · EP",
    status: "completed",
    amount: "₹61,200",
    finance: "settled",
    ownerName: "Meera Iyer",
    ownerInitials: "MI",
  },
  {
    id: "vb11",
    vendorId: "exhosp",
    title: "Banerjee wedding party",
    ref: "BK-2026-000001",
    travel: "10–14 Jun",
    party: "4N · 22 pax",
    service: "Lake Resort wing",
    serviceDetail: "11 rooms · AP",
    status: "completed",
    amount: "₹4,80,000",
    finance: "settled",
    ownerName: "Anjali Menon",
    ownerInitials: "AM",
  },
  {
    id: "vb12",
    vendorId: "coastal",
    title: "Thomas family · Kochi",
    ref: "BK-2026-000009",
    travel: "29 Sep–03 Oct",
    party: "4N · 3 pax",
    service: "Garden Villa",
    serviceDetail: "1 room · CP",
    status: "on-trip",
    amount: "₹18,400",
    finance: "settled",
    ownerName: "Rahul Sharma",
    ownerInitials: "RS",
  },
  {
    id: "vb13",
    vendorId: "trailmakers",
    title: "Rao family · Munnar",
    ref: "BK-2026-000041",
    travel: "18–20 Oct",
    party: "2N · 4 pax",
    service: "Munnar ridge trek",
    serviceDetail: "Guided · 4 guests",
    status: "upcoming",
    amount: "₹18,000",
    finance: "to-collect",
    ownerName: "Vrushabh Jain",
    ownerInitials: "VJ",
  },
  {
    id: "vb14",
    vendorId: "trailmakers",
    title: "Patel group · Alleppey",
    ref: "BK-2026-000037",
    travel: "04–06 Oct",
    party: "2N · 6 pax",
    service: "Backwater kayak",
    serviceDetail: "Guided · 6 guests",
    status: "upcoming",
    amount: "₹24,000",
    finance: "part-paid",
    ownerName: "Anjali Menon",
    ownerInitials: "AM",
  },
  {
    id: "vb15",
    vendorId: "trailmakers",
    title: "Mehta team · Munnar",
    ref: "BK-2026-000032",
    travel: "20–22 Aug",
    party: "2N · 8 pax",
    service: "Munnar ridge trek",
    serviceDetail: "Guided · 8 guests",
    status: "completed",
    amount: "₹36,000",
    finance: "settled",
    ownerName: "Meera Iyer",
    ownerInitials: "MI",
  },
];

/** On-trip first, then upcoming — for Overview preview. */
export function overviewBookingsPreview(limit = 5): VendorBooking[] {
  const rank = (s: VendorBookingStatus) =>
    s === "on-trip" ? 0 : s === "upcoming" ? 1 : 9;
  return [...VENDOR_BOOKINGS]
    .filter((b) => b.status === "upcoming" || b.status === "on-trip")
    .sort((a, b) => rank(a.status) - rank(b.status))
    .slice(0, limit);
}

export const VENDOR_CONTACTS: VendorContact[] = [
  {
    id: "c1",
    name: "Ravi Nair",
    initials: "RN",
    role: "Reservations manager",
    property: "Example Lake Resort",
    phone: "+91 98470 11220",
    email: "ravi.nair@examplehosp.in",
    primary: true,
  },
  {
    id: "c2",
    name: "Deepa Thomas",
    initials: "DT",
    role: "Accounts lead",
    property: "Example Hospitality",
    phone: "+91 98470 11884",
    email: "deepa.thomas@examplehosp.in",
  },
  {
    id: "c3",
    name: "Farah Khan",
    initials: "FK",
    role: "Groups desk",
    property: "Example Hospitality",
    phone: "+91 98470 11901",
    email: "farah.khan@examplehosp.in",
  },
  {
    id: "c4",
    name: "Jose Mathew",
    initials: "JM",
    role: "Front office",
    property: "Example Lake Resort",
    phone: "+91 98470 12010",
    email: "jose.mathew@examplehosp.in",
  },
  {
    id: "c5",
    name: "Sneha Pillai",
    initials: "SP",
    role: "Revenue manager",
    property: "Example Hospitality",
    phone: "+91 98470 12155",
    email: "sneha.pillai@examplehosp.in",
  },
  {
    id: "c6",
    name: "Arun Krishnan",
    initials: "AK",
    role: "Sales coordinator",
    property: "Example Lake Resort",
    phone: "+91 98470 12240",
    email: "arun.krishnan@examplehosp.in",
  },
  {
    id: "c7",
    name: "Priya Menon",
    initials: "PM",
    role: "Banquets lead",
    property: "Example Hospitality",
    phone: "+91 98470 12318",
    email: "priya.menon@examplehosp.in",
  },
  {
    id: "c8",
    name: "Vikram Das",
    initials: "VD",
    role: "Transport desk",
    property: "Example Hospitality",
    phone: "+91 98470 12402",
    email: "vikram.das@examplehosp.in",
  },
  {
    id: "c9",
    name: "Leena George",
    initials: "LG",
    role: "Guest relations",
    property: "Example Lake Resort",
    phone: "+91 98470 12566",
    email: "leena.george@examplehosp.in",
  },
  {
    id: "c10",
    name: "Mohammed Irfan",
    initials: "MI",
    role: "Night manager",
    property: "Example Lake Resort",
    phone: "+91 98470 12690",
    email: "m.irfan@examplehosp.in",
  },
  {
    id: "c11",
    name: "Anitha Roy",
    initials: "AR",
    role: "Contracting",
    property: "Example Hospitality",
    phone: "+91 98470 12744",
    email: "anitha.roy@examplehosp.in",
  },
  {
    id: "c12",
    name: "Samuel Joseph",
    initials: "SJ",
    role: "F&B coordinator",
    property: "Example Lake Resort",
    phone: "+91 98470 12811",
    email: "samuel.joseph@examplehosp.in",
  },
];

const EXAMPLE_VENDOR_ACTIVITY: ActivityRow[] = [
  {
    id: "vendor-act-1",
    date: "18 Sep",
    time: "16:42",
    member: "Anjali Menon",
    role: "Vendor desk",
    initials: "AM",
    avatarTone: "pink",
    event: "Contact details updated",
    module: "Vendor",
    context: "Vendor profile",
    description: "The vendor contact record was updated in the profile.",
    details: [{ label: "Primary contact", value: "Anitha Roy" }, { label: "Contact email", value: "anitha.roy@examplehosp.in" }],
  },
  {
    id: "vendor-act-2",
    date: "16 Sep",
    time: "12:10",
    member: "Vrushabh Jain",
    role: "Operations",
    initials: "VJ",
    avatarTone: "default",
    event: "Booking marked at risk",
    module: "Bookings",
    context: "Bookings · BK-2026-000003",
    description: "The linked booking was flagged for the operations team to review.",
    details: [{ label: "Booking", value: "BK-2026-000003" }],
  },
  {
    id: "vendor-act-3",
    date: "12 Sep",
    time: "09:35",
    member: "Deepa Thomas",
    role: "Finance",
    initials: "DT",
    avatarTone: "default",
    event: "Partial settlement recorded",
    module: "Finance",
    context: "Finance · September statement",
    description: "A partial settlement was recorded against the September statement.",
    details: [{ label: "Statement", value: "September statement" }],
  },
  {
    id: "vendor-act-4",
    date: "09 Sep",
    time: "14:18",
    member: "Anjali Menon",
    role: "Vendor desk",
    initials: "AM",
    avatarTone: "pink",
    event: "GST certificate renewed",
    module: "Docs",
    context: "Docs",
    description: "The vendor's GST certificate was renewed in the document record.",
  },
  {
    id: "vendor-act-5",
    date: "05 Sep",
    time: "11:24",
    member: "Anjali Menon",
    role: "Vendor desk",
    initials: "AM",
    avatarTone: "pink",
    event: "Rate card published",
    module: "Rate cards",
    context: "Rate cards · Accommodation 2026–27",
    description: "The accommodation rate card was published for use in quoting.",
    details: [{ label: "Rate card", value: "Accommodation 2026–27" }],
  },
  {
    id: "vendor-act-6",
    date: "02 Sep",
    time: "17:05",
    member: "Rahul Sharma",
    role: "Operations",
    initials: "RS",
    avatarTone: "default",
    event: "Blackout window added",
    module: "Services",
    context: "Services · Example Lake Resort",
    relatedServiceId: "svc-lake",
    description: "A blackout window was added to the linked accommodation service.",
    details: [{ label: "Service", value: "Example Lake Resort" }],
  },
  {
    id: "vendor-act-7",
    date: "28 Aug",
    time: "10:40",
    member: "Meera Iyer",
    role: "Operations",
    initials: "MI",
    avatarTone: "default",
    event: "Supplier handoff completed",
    module: "Bookings",
    context: "Bookings · Kapoor group",
    description: "The supplier handoff for the Kapoor group booking was marked complete.",
    details: [{ label: "Booking group", value: "Kapoor group" }],
  },
  {
    id: "vendor-act-8",
    date: "24 Aug",
    time: "15:12",
    member: "Vrushabh Jain",
    role: "Operations",
    initials: "VJ",
    avatarTone: "default",
    event: "Inventory request sent",
    module: "Communications",
    context: "Communications · WhatsApp",
    description: "An inventory request was sent to the vendor through WhatsApp.",
    details: [{ label: "Channel", value: "WhatsApp" }],
  },
];

function standardVendorActivity(vendor: Vendor): ActivityRow[] {
  const primaryCategory = vendor.categories[0] ?? "supplier";

  return [
    {
      id: `${vendor.id}-activity-coverage`,
      date: "17 Sep",
      time: "15:20",
      member: vendor.owner,
      role: "Vendor desk",
      initials: vendor.ownerInitials,
      avatarTone: "pink",
      event: "Coverage reviewed",
      module: "Services",
      context: `Services · ${primaryCategory}`,
      description: `${vendor.owner} reviewed the service coverage recorded for ${vendor.name}.`,
      details: [{ label: "Service categories", value: vendor.categories.join(" · ") }, { label: "Base location", value: vendor.location }],
    },
    {
      id: `${vendor.id}-activity-location`,
      date: "11 Sep",
      time: "10:45",
      member: vendor.owner,
      role: "Vendor desk",
      initials: vendor.ownerInitials,
      avatarTone: "pink",
      event: "Base location confirmed",
      module: "Vendor",
      context: `Vendor profile · ${vendor.city}`,
      description: `The base location on ${vendor.name}'s vendor profile was confirmed.`,
      details: [{ label: "Base location", value: vendor.location }, { label: "Country", value: vendor.country }],
    },
    {
      id: `${vendor.id}-activity-owner`,
      date: "04 Sep",
      time: "12:30",
      member: "Vrushabh Jain",
      role: "Operations",
      initials: "VJ",
      avatarTone: "default",
      event: "Internal owner assigned",
      module: "Vendor",
      context: `Vendor profile · ${vendor.owner}`,
      description: `${vendor.owner} was assigned as the internal owner for this vendor relationship.`,
      details: [{ label: "Assigned owner", value: vendor.owner }, { label: "Vendor ID", value: vendor.code }],
    },
    {
      id: `${vendor.id}-activity-contact`,
      date: "29 Aug",
      time: "16:10",
      member: vendor.owner,
      role: "Vendor desk",
      initials: vendor.ownerInitials,
      avatarTone: "pink",
      event: "Contact routing verified",
      module: "Communications",
      context: "Communications",
      description: `The contact route recorded for ${vendor.name} was checked by the vendor desk.`,
      details: [{ label: "Primary contact", value: vendor.contactName }, { label: "Contact email", value: vendor.email }],
    },
    {
      id: `${vendor.id}-activity-directory`,
      date: "22 Aug",
      time: "09:15",
      member: "Vrushabh Jain",
      role: "Operations",
      initials: "VJ",
      avatarTone: "default",
      event: "Directory listing added",
      module: "Services",
      context: `Services · ${primaryCategory}`,
      description: `${vendor.name} was added to the service directory.`,
      details: [{ label: "Vendor ID", value: vendor.code }, { label: "Service categories", value: vendor.categories.join(" · ") }],
    },
  ];
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

type WorkspaceAccessRole = "Owner" | "Admin" | "Staff member";

const WORKSPACE_ROLE_BY_MEMBER: Record<string, WorkspaceAccessRole> = {
  "Vrushabh Jain": "Owner",
  "Anjali Menon": "Admin",
};

function workspaceRoleForMember(name: string): WorkspaceAccessRole {
  return WORKSPACE_ROLE_BY_MEMBER[name] ?? "Staff member";
}

export function vendorActivityForVendor(vendor: Vendor): ActivityRow[] {
  const profileEvents = vendor.activity.map((event) => ({
    id: event.id,
    date: event.at === "Just now" ? "Today" : event.at,
    time: event.at === "Just now" ? "Now" : "—",
    member: event.actor,
    role: event.role,
    initials: initialsFor(event.actor),
    avatarTone: "pink" as const,
    event: event.at === "Imported" ? "Vendor profile imported" : event.event,
    module: event.area,
    context: event.area === "Vendor" ? "Vendor profile" : event.area,
  }));

  const recentProfileEvents = profileEvents.filter((event) => event.date !== "Imported");
  const importedProfileEvents = profileEvents.filter((event) => event.date === "Imported");
  const history = vendor.id === "exhosp" ? EXAMPLE_VENDOR_ACTIVITY : standardVendorActivity(vendor);

  return [...recentProfileEvents, ...history, ...importedProfileEvents].map((activity) => ({
    ...activity,
    role: workspaceRoleForMember(activity.member),
  }));
}

export function operatingHistoryForVendor(vendor: Vendor): TradeMetric[] {
  if (vendor.id === "exhosp") {
    return [
      {
        id: "relationship",
        label: "Partner since",
        value: "Apr 2024",
        note: "2 years 5 months",
      },
      {
        id: "fulfilled",
        label: "Bookings fulfilled",
        value: "38",
        note: "Across 6 destinations",
        tone: "ok",
      },
      {
        id: "last-fulfilled",
        label: "Last fulfilled",
        value: "28 Aug 2026",
        note: "Kapoor group · Alleppey",
      },
      {
        id: "exceptions",
        label: "Open exceptions",
        value: "1",
        note: "Booking currently at risk",
        tone: "warn",
      },
    ];
  }

  const activityCount = vendorActivityForVendor(vendor).length;

  return [
    {
      id: "relationship",
      label: "Relationship record",
      value: "Imported",
      note: "Legacy vendor profile",
    },
    {
      id: "activity",
      label: "Recent activity",
      value: String(activityCount),
      note: `${activityCount} recent events`,
    },
    {
      id: "scope",
      label: "Operating scope",
      value: String(vendor.categories.length),
      note: vendor.categories.join(" · ") || "No categories set",
    },
    {
      id: "updated",
      label: "Last updated",
      value: vendor.updated,
      note: `Owned by ${vendor.owner}`,
    },
  ];
}
