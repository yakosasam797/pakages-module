import type { OrgRole } from "../permissions";

export type ServiceCategory =
  | "Accommodation"
  | "DMC/Ground handling"
  | "Transport"
  | "Activities"
  | "Flights"
  | "Visa"
  | "Cruise"
  | "Other";

/** Legacy list-filter chips — mapped from service categories */
export type VendorRole =
  | "DMC"
  | "Hotelier"
  | "Transport"
  | "Activity"
  | "Visa"
  | "Airline";

export type VendorStatus =
  | "Draft"
  | "Setup incomplete"
  | "Active"
  | "Inactive"
  | "Archived";

export interface VendorActivityEvent {
  id: string;
  at: string;
  actor: string;
  role: string;
  event: string;
  area: string;
}

export interface VendorSetup {
  profileComplete: boolean;
  hasService: boolean;
  hasContactsDocs: boolean;
  hasRateCard: boolean;
  activated: boolean;
}

export interface VendorContact {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  phone: string;
  primary?: boolean;
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  initials: string;
  /** Optional vendor photo or brand image used in directory rows */
  imageUrl?: string;
  /** Canonical multi-select from Add/Edit vendor */
  categories: ServiceCategory[];
  /** Derived filter chips for the All Vendors tabs */
  roles: VendorRole[];
  country: string;
  city: string;
  location: string;
  contactName: string;
  phone: string;
  email: string;
  contacts?: VendorContact[];
  labels: string[];
  whatsapp?: string;
  state?: string;
  address?: string;
  postalCode?: string;
  legalName?: string;
  gstin?: string;
  pan?: string;
  dmcScope?: string;
  specializations?: string;
  reservationsEmail?: string;
  emergencyPhone?: string;
  confirmationSla?: string;
  confirmationChannel?: string;
  paymentTerms?: string;
  internalNotes?: string;
  updated: string;
  owner: string;
  ownerInitials: string;
  status: VendorStatus;
  setup: VendorSetup;
  activity: VendorActivityEvent[];
  /** Members who can view this vendor when role is Member */
  assignedMemberIds: string[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "Accommodation",
  "DMC/Ground handling",
  "Transport",
  "Activities",
  "Flights",
  "Visa",
  "Cruise",
  "Other",
];

export const VENDOR_COUNTRIES = [
  "India",
  "United Arab Emirates",
  "Maldives",
  "Sri Lanka",
  "Thailand",
  "Singapore",
] as const;

export const INTERNAL_OWNERS = [
  { name: "Anjali Menon", initials: "AM" },
  { name: "Priya Nair", initials: "PN" },
  { name: "Rahul Iyer", initials: "RI" },
  { name: "Sneha Rao", initials: "SR" },
  { name: "Dev Krishnan", initials: "DK" },
  { name: "Meera Joseph", initials: "MJ" },
  { name: "Arjun Pillai", initials: "AP" },
  { name: "Nisha Thomas", initials: "NT" },
  { name: "Vivek Menon", initials: "VM" },
  { name: "Lakshmi Das", initials: "LD" },
  { name: "Vrushabh Jain", initials: "VJ" },
] as const;

export const VENDOR_STATUS_OPTIONS: VendorStatus[] = [
  "Draft",
  "Active",
  "Inactive",
  "Archived",
];

export const CATEGORY_TO_ROLE: Partial<Record<ServiceCategory, VendorRole>> = {
  Accommodation: "Hotelier",
  "DMC/Ground handling": "DMC",
  Transport: "Transport",
  Activities: "Activity",
  Flights: "Airline",
  Visa: "Visa",
};

export const ROLE_TO_CATEGORY: Record<VendorRole, ServiceCategory> = {
  Hotelier: "Accommodation",
  DMC: "DMC/Ground handling",
  Transport: "Transport",
  Activity: "Activities",
  Airline: "Flights",
  Visa: "Visa",
};

export const VENDOR_ROLE_FILTERS: Array<"all" | VendorRole> = [
  "all",
  "DMC",
  "Hotelier",
  "Transport",
  "Activity",
  "Visa",
  "Airline",
];

export function categoriesToRoles(categories: ServiceCategory[]): VendorRole[] {
  const roles: VendorRole[] = [];
  for (const cat of categories) {
    const role = CATEGORY_TO_ROLE[cat];
    if (role && !roles.includes(role)) roles.push(role);
  }
  return roles;
}

export function rolesToCategories(roles: VendorRole[]): ServiceCategory[] {
  return roles.map((role) => ROLE_TO_CATEGORY[role]);
}

export function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function makeVendorCode(name: string, existing: Vendor[]): string {
  const slug = name
    .replace(/[^a-zA-Z0-9]+/g, "")
    .slice(0, 10)
    .toUpperCase();
  const base = `V-${slug || "VENDOR"}`;
  if (!existing.some((v) => v.code === base)) return base;
  let n = 2;
  while (existing.some((v) => v.code === `${base}${n}`)) n += 1;
  return `${base}${n}`;
}

export function makeVendorId(name: string, existing: Vendor[]): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24) || "vendor";
  if (!existing.some((v) => v.id === base)) return base;
  let n = 2;
  while (existing.some((v) => v.id === `${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function seedVendor(
  partial: Omit<
    Vendor,
    | "categories"
    | "setup"
    | "activity"
    | "contactName"
    | "phone"
    | "email"
    | "country"
    | "city"
    | "assignedMemberIds"
    | "status"
  > & {
    roles: VendorRole[];
    status?: VendorStatus;
    location: string;
    contactName?: string;
    phone?: string;
    email?: string;
  },
): Vendor {
  const categories = rolesToCategories(partial.roles);
  const [city = "Kochi", country = "India"] = partial.location.split(",").map((s: string) => s.trim());
  const status = partial.status ?? "Active";
  const isDraft = status === "Draft";
  return {
    ...partial,
    categories,
    country,
    city,
    location: `${city}, ${country}`,
    contactName: partial.contactName ?? "",
    phone: partial.phone ?? "",
    email: partial.email ?? "",
    status,
    setup: {
      profileComplete: true,
      hasService: !isDraft,
      hasContactsDocs: !isDraft,
      hasRateCard: !isDraft,
      activated: status === "Active",
    },
    activity: [
      {
        id: `${partial.id}-seed`,
        at: "Imported",
        actor: partial.owner,
        role: "Vendor desk",
        event: "Vendor profile available in the workspace",
        area: "Vendor",
      },
    ],
    assignedMemberIds: partial.id === "exhosp" || partial.id === "coastal" ? ["member-vj"] : [],
  };
}

function baliExampleVendor(id: string, code: string, name: string, initials: string, roles: VendorRole[], location: string, imageId: string): Vendor {
  const vendor = seedVendor({
    id, code, name, initials, roles, location,
    imageUrl: `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=160&h=160&q=80`,
    labels: ["Bali example"], updated: "Just now", owner: "Vendor desk", ownerInitials: "VD", status: "Setup incomplete",
  });
  return { ...vendor, setup: { profileComplete: true, hasService: true, hasContactsDocs: false, hasRateCard: false, activated: false } };
}

export const SEED_VENDORS: Vendor[] = [
  seedVendor({ id: "cityride", code: "V-CITYRIDE", name: "CityRide Transfers", initials: "CT", roles: ["Transport"], location: "Kochi, India", contactName: "Arun Menon", phone: "+91 98470 36121", email: "bookings@cityride.example", labels: [], updated: "2 days ago", owner: "Priya Nair", ownerInitials: "PN" }),
  seedVendor({ id: "kochi-local-cabs", code: "V-LOCALCABS", name: "Kochi Local Cabs", initials: "KC", roles: ["Transport"], location: "Kochi, India", contactName: "Lina Joseph", phone: "+91 98470 36122", email: "desk@kochilocal.example", labels: [], updated: "2 days ago", owner: "Priya Nair", ownerInitials: "PN" }),
  seedVendor({ id: "jaipur-local-cabs", code: "V-JAIPURCABS", name: "Jaipur Local Cabs", initials: "JC", roles: ["Transport"], location: "Jaipur, India", contactName: "Anil Sharma", phone: "+91 98470 36125", email: "desk@jaipurlocal.example", labels: [], updated: "2 days ago", owner: "Priya Nair", ownerInitials: "PN" }),
  seedVendor({ id: "bengaluru-city-rides", code: "V-BLRCITY", name: "Bengaluru City Rides", initials: "BR", roles: ["Transport"], location: "Bengaluru, India", contactName: "Meera Rao", phone: "+91 98470 36126", email: "desk@bengalururides.example", labels: [], updated: "2 days ago", owner: "Priya Nair", ownerInitials: "PN" }),
  seedVendor({ id: "kerala-road-trips", code: "V-ROADTRIPS", name: "Kerala Road Trips", initials: "KR", roles: ["Transport"], location: "Kochi, India", contactName: "Manu Thomas", phone: "+91 98470 36123", email: "ops@keralaroad.example", labels: [], updated: "2 days ago", owner: "Priya Nair", ownerInitials: "PN" }),
  seedVendor({ id: "south-coast-coaches", code: "V-SOUTHCOAST", name: "South Coast Coaches", initials: "SC", roles: ["Transport"], location: "Kochi, India", contactName: "Dev Nair", phone: "+91 98470 36124", email: "hire@southcoast.example", labels: [], updated: "2 days ago", owner: "Priya Nair", ownerInitials: "PN" }),
  seedVendor({
    id: "trailmakers",
    code: "V-TRAILMAKERS",
    name: "Trailmakers Experiences",
    initials: "TE",
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=160&h=160&q=80",
    roles: ["Activity", "Airline", "Transport"],
    location: "Kochi, India",
    contactName: "Nikhil Thomas",
    phone: "+91 98470 21458",
    email: "nikhil@trailmakers.in",
    reservationsEmail: "reservations@trailmakers.in",
    contacts: [
      {
        id: "trailmakers-partnerships",
        name: "Nikhil Thomas",
        initials: "NT",
        role: "Partnerships",
        email: "nikhil@trailmakers.in",
        phone: "+91 98470 21458",
        primary: true,
      },
      {
        id: "trailmakers-reservations",
        name: "Maya Joseph",
        initials: "MJ",
        role: "Reservations",
        email: "reservations@trailmakers.in",
        phone: "+91 98471 55204",
      },
      {
        id: "trailmakers-accounts",
        name: "Deepa Mathew",
        initials: "DM",
        role: "Accounts",
        email: "accounts@trailmakers.in",
        phone: "+91 98472 81307",
      },
    ],
    labels: [],
    updated: "3 months ago",
    owner: "Priya Nair",
    ownerInitials: "PN",
  }),
  seedVendor({
    id: "exhosp",
    code: "V-EXHOSP",
    name: "Example Hospitality",
    initials: "EH",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=160&h=160&q=80",
    roles: ["DMC", "Hotelier"],
    location: "Kochi, India",
    labels: [],
    updated: "3 months ago",
    owner: "Anjali Menon",
    ownerInitials: "AM",
    contactName: "Ravi Nair",
    phone: "+91 98470 11220",
    email: "ravi.nair@examplehosp.in",
  }),
  seedVendor({
    id: "wanderlust",
    code: "V-WANDERLUST",
    name: "Wanderlust Trails",
    initials: "WT",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=160&h=160&q=80",
    roles: ["DMC", "Hotelier", "Transport"],
    location: "Kochi, India",
    labels: [],
    updated: "3 months ago",
    owner: "Rahul Iyer",
    ownerInitials: "RI",
  }),
  seedVendor({
    id: "atlas-visa",
    code: "V-ATLASVISA",
    name: "Atlas Visa Services",
    initials: "AV",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=160&h=160&q=80",
    roles: ["Visa"],
    location: "Kochi, India",
    labels: [],
    updated: "3 months ago",
    owner: "Sneha Rao",
    ownerInitials: "SR",
  }),
  seedVendor({
    id: "summit",
    code: "V-SUMMIT",
    name: "Summit Adventures",
    initials: "SA",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=160&h=160&q=80",
    roles: ["Activity", "Transport"],
    location: "Kochi, India",
    labels: [],
    updated: "3 months ago",
    owner: "Dev Krishnan",
    ownerInitials: "DK",
  }),
  seedVendor({
    id: "coastal",
    code: "V-COASTAL",
    name: "Coastal Stay Properties",
    initials: "CS",
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=160&h=160&q=80",
    roles: ["Hotelier"],
    location: "Kochi, India",
    labels: [],
    updated: "3 months ago",
    owner: "Meera Joseph",
    ownerInitials: "MJ",
  }),
  seedVendor({
    id: "horizon",
    code: "V-HORIZON",
    name: "Horizon DMC Partners",
    initials: "HD",
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=160&h=160&q=80",
    roles: ["DMC", "Transport", "Hotelier"],
    location: "Kochi, India",
    labels: [],
    updated: "3 months ago",
    owner: "Arjun Pillai",
    ownerInitials: "AP",
  }),
  seedVendor({
    id: "bluewave",
    code: "V-BLUEWAVE",
    name: "BlueWave Transfers",
    initials: "BT",
    imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=160&h=160&q=80",
    roles: ["Transport"],
    location: "Kochi, India",
    labels: [],
    updated: "3 months ago",
    owner: "Nisha Thomas",
    ownerInitials: "NT",
  }),
  seedVendor({
    id: "kerala-heritage",
    code: "V-KHERITAGE",
    name: "Kerala Heritage Hotels",
    initials: "KH",
    imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=160&h=160&q=80",
    roles: ["Hotelier", "DMC"],
    location: "Kochi, India",
    labels: [],
    updated: "3 months ago",
    owner: "Vivek Menon",
    ownerInitials: "VM",
  }),
  seedVendor({
    id: "spice-route",
    code: "V-SPICEROUTE",
    name: "Spice Route Experiences",
    initials: "SR",
    imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=160&h=160&q=80",
    roles: ["Activity", "DMC", "Transport"],
    location: "Kochi, India",
    labels: [],
    updated: "3 months ago",
    owner: "Lakshmi Das",
    ownerInitials: "LD",
  }),
  seedVendor({
    id: "harbour-light-stays",
    code: "V-HARBOURLIGHT",
    name: "Harbour Light Stays",
    initials: "HL",
    roles: ["Hotelier"],
    location: "Alappuzha, India",
    contactName: "Naveen Joseph",
    phone: "+91 98471 24018",
    email: "naveen@harbourlight.in",
    labels: [],
    updated: "Just now",
    owner: "Meera Joseph",
    ownerInitials: "MJ",
    status: "Draft",
  }),
  seedVendor({
    id: "malabar-transit",
    code: "V-MALABARTRANSIT",
    name: "Malabar Transit Co.",
    initials: "MT",
    roles: ["Transport"],
    location: "Kozhikode, India",
    contactName: "Fathima Rahman",
    phone: "+91 98951 76304",
    email: "fathima@malabartransit.in",
    labels: [],
    updated: "Just now",
    owner: "Nisha Thomas",
    ownerInitials: "NT",
    status: "Draft",
  }),
  baliExampleVendor("island-wheels-bali", "V-ISLANDWHEELS", "Island Wheels Bali", "IW", ["Transport"], "Denpasar, Indonesia", "photo-1449965408869-eaa3f722e40d"),
  baliExampleVendor("ubud-stay-collective", "V-UBUDSTAY", "Ubud Stay Collective", "US", ["Hotelier"], "Ubud, Indonesia", "photo-1566073771259-6a8506099945"),
  baliExampleVendor("bali-heritage-studio", "V-BALITHERITAGE", "Bali Heritage Studio", "BH", ["Activity"], "Ubud, Indonesia", "photo-1544735716-392fe2489ffa"),
  baliExampleVendor("penida-coast-experiences", "V-PENIDACOAST", "Penida Coast Experiences", "PC", ["Activity", "Transport"], "Nusa Penida, Indonesia", "photo-1506905925346-21bda4d32df4"),
  baliExampleVendor("bali-ground-desk", "V-BALIGROUND", "Bali Ground Desk", "BG", ["DMC", "Airline", "Visa"], "Denpasar, Indonesia", "photo-1436491865332-7a61a109cc05"),
];

/** Mutable working copy — App owns React state seeded from this */
export let VENDORS: Vendor[] = SEED_VENDORS.map((v) => structuredClone(v));

export function resetVendors(): void {
  VENDORS = SEED_VENDORS.map((v) => structuredClone(v));
}

export function getVendor(id: string, list: Vendor[] = VENDORS): Vendor | undefined {
  return list.find((vendor) => vendor.id === id);
}

export function vendorIdea(vendor: Vendor): string {
  return vendor.categories[0] ?? vendor.roles[0] ?? "Supplier";
}

export function visibleVendorsForRole(list: Vendor[], role: OrgRole, memberId = "member-vj"): Vendor[] {
  if (role !== "Member") return list.filter((v) => v.status !== "Archived");
  return list.filter(
    (v) => v.status !== "Archived" && v.assignedMemberIds.includes(memberId),
  );
}

/** Short “idea” of the vendor — maps to Dubai on a booking title */
export function vendorDisplayStatus(vendor: Vendor): string {
  return vendor.status;
}
