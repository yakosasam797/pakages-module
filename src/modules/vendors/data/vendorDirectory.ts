import type { ServiceType } from "./services";
import { PRIVATE_TRANSPORT_FIXTURES } from "./privateTransportFixtures";
import { ACTIVITY_RATE_FIXTURES } from "./activityRateFixtures";
import type { ActivityOption } from "../rateCard/activityPricing";
import { SUPPLIER_RATE_FIXTURES } from "./supplierRateFixtures";

export type DirectoryCategory =
  | "Accommodation"
  | "Transport"
  | "Activities"
  | "Visa"
  | "Flights";

export type SupplierType = "Direct supplier" | "DMC" | "Wholesaler";

export interface DirectoryService {
  id: string;
  serviceId: string;
  profileVendorId: string;
  name: string;
  category: DirectoryCategory;
  location: string;
  description?: string;
  attributes?: Array<{ label: string; value: string }>;
  inclusions?: string[];
  exclusions?: string[];
  /** Service-owned options; vendor rate cards reference their IDs. */
  activityOptions?: ActivityOption[];
}

export interface VendorServiceConnection {
  id: string;
  vendorId: string;
  serviceId: string;
  supplierType: SupplierType;
  productsCovered: string;
  rateCardId: string;
  rateCardName: string;
  validity: string;
}

export const DIRECTORY_CATEGORIES: Array<"all" | DirectoryCategory> = [
  "all",
  "Accommodation",
  "Transport",
  "Activities",
  "Visa",
  "Flights",
];

export const SUPPLIER_TYPES: SupplierType[] = [
  "Direct supplier",
  "DMC",
  "Wholesaler",
];

const createdServicesKey = "paryatech-vendor-directory-services";
const deletedServicesKey = "paryatech-vendor-directory-deleted-service-ids:v1";

export function readDeletedDirectoryServiceIds(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(deletedServicesKey) || "[]");
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function saveDeletedDirectoryServiceIds(ids: string[]) {
  localStorage.setItem(deletedServicesKey, JSON.stringify(ids));
}

export function readCreatedDirectoryServices(): DirectoryService[] {
  try {
    const saved = JSON.parse(localStorage.getItem(createdServicesKey) || "[]");
    return Array.isArray(saved) ? saved.filter((item) => item && typeof item.id === "string" && typeof item.name === "string") : [];
  } catch {
    return [];
  }
}

export function saveCreatedDirectoryServices(services: DirectoryService[]) {
  localStorage.setItem(createdServicesKey, JSON.stringify(services));
}

export const DIRECTORY_SERVICES: DirectoryService[] = [
  ...Array.from(new Map(PRIVATE_TRANSPORT_FIXTURES.map((fixture) => [fixture.serviceId, fixture])).values()).map((fixture) => ({
    id: fixture.serviceId, serviceId: `svc-${fixture.serviceId}`, profileVendorId: fixture.vendorId,
    name: fixture.serviceName, category: "Transport" as const,
    location: fixture.serviceName.includes("Kochi") ? "Kochi" : fixture.serviceName.includes("Jaipur") ? "Jaipur" : fixture.serviceName.includes("Bengaluru") ? "Bengaluru" : fixture.serviceName.includes("South") ? "South India" : "Kerala",
    description: `Private chauffeured transport supplied by ${fixture.vendorName}.`,
  })),
  {
    id: "taj-exotica",
    serviceId: "svc-taj-exotica",
    profileVendorId: "exhosp",
    name: "Taj Exotica Resort & Spa",
    category: "Accommodation",
    location: "Goa",
  },
  {
    id: "taj-lake-palace",
    serviceId: "svc-taj-lake-palace",
    profileVendorId: "kerala-heritage",
    name: "Taj Lake Palace",
    category: "Accommodation",
    location: "Udaipur",
  },
  {
    id: "taj-bekal",
    serviceId: "svc-taj-bekal",
    profileVendorId: "coastal",
    name: "Taj Bekal Resort & Spa",
    category: "Accommodation",
    location: "Kerala",
  },
  {
    id: "example-lake",
    serviceId: "svc-lake",
    profileVendorId: "exhosp",
    name: "Example Lake Resort",
    category: "Accommodation",
    location: "Alleppey",
  },
  {
    id: "example-hill",
    serviceId: "svc-hill",
    profileVendorId: "exhosp",
    name: "Example Hill Retreat",
    category: "Accommodation",
    location: "Munnar",
  },
  {
    id: "munnar-trek",
    serviceId: "svc-trek-munnar",
    profileVendorId: "trailmakers",
    name: "Munnar Ridge Trek",
    category: "Activities",
    location: "Munnar",
    activityOptions: [
      { id: "trek-shared", name: "Shared guided trek", category: "Adventure", delivery: "shared", duration: "Half day", capacity: 12, session: "Morning" },
      { id: "trek-private", name: "Private guided trek", category: "Adventure", delivery: "private", duration: "Half day", capacity: 10, session: "By arrangement" },
    ],
  },
  {
    id: "backwater-kayak",
    serviceId: "svc-kayak",
    profileVendorId: "trailmakers",
    name: "Backwater Kayak",
    category: "Activities",
    location: "Alleppey",
    activityOptions: [
      { id: "kayak-guided", name: "Guided paddle", category: "Adventure", delivery: "shared", duration: "2 hours", capacity: 12, session: "Morning / sunset" },
      { id: "kayak-private", name: "Private guided paddle", category: "Adventure", delivery: "private", duration: "2 hours", capacity: 8, session: "By arrangement" },
      { id: "kayak-rental", name: "Kayak hire", category: "Rental", delivery: "private", duration: "2-hour session", capacity: null, session: "By arrangement" },
    ],
  },
  {
    id: "cardamom-tour",
    serviceId: "svc-cardamom",
    profileVendorId: "exhosp",
    name: "Cardamom Plantation Tour",
    category: "Activities",
    location: "Thekkady",
    activityOptions: [
      { id: "cardamom-shared", name: "Shared plantation walk", category: "Guided tour", delivery: "shared", duration: "3 hours", capacity: 15, session: "09:00 / 14:00" },
      { id: "cardamom-private", name: "Private plantation visit", category: "Guided tour", delivery: "private", duration: "Half day", capacity: 12, session: "By arrangement" },
    ],
  },
  {
    id: "sunset-cruise", serviceId: "svc-sunset-cruise", profileVendorId: "coastal",
    name: "Alleppey Sunset Cruise", category: "Activities", location: "Alleppey",
    activityOptions: [
      { id: "cruise-shared", name: "Shared sunset cruise", category: "Cruise", delivery: "shared", duration: "2 hours", capacity: 30, session: "17:00" },
      { id: "cruise-private", name: "Private sunset cruise", category: "Cruise", delivery: "private", duration: "2 hours", capacity: 12, session: "17:00" },
    ],
  },
  {
    id: "spice-cooking-class", serviceId: "svc-spice-class", profileVendorId: "spice-route",
    name: "Kerala Spice Cooking Class", category: "Activities", location: "Kochi",
    activityOptions: [
      { id: "class-shared", name: "Shared cooking class", category: "Class/workshop", delivery: "shared", duration: "3 hours", capacity: 12, session: "11:00" },
      { id: "class-private", name: "Private kitchen session", category: "Class/workshop", delivery: "private", duration: "3 hours", capacity: 8, session: "By arrangement" },
    ],
  },
  {
    id: "periyar-safari", serviceId: "svc-periyar-safari", profileVendorId: "summit",
    name: "Periyar Wildlife Safari", category: "Activities", location: "Thekkady",
    activityOptions: [
      { id: "safari-jeep", name: "Private jeep safari", category: "Adventure", delivery: "private", duration: "4 hours", capacity: null, session: "Morning / afternoon" },
    ],
  },
  {
    id: "heritage-admission", serviceId: "svc-heritage-entry", profileVendorId: "kerala-heritage",
    name: "Fort Kochi Heritage Admission", category: "Activities", location: "Kochi",
    activityOptions: [
      { id: "heritage-ticket", name: "Museum admission", category: "Admission", delivery: "shared", duration: "Single entry", capacity: null, session: "Opening hours" },
    ],
  },
  {
    id: "uae-visa",
    serviceId: "svc-uae-visa",
    profileVendorId: "atlas-visa",
    name: "UAE Tourist Visa",
    category: "Visa",
    location: "UAE",
  },
  {
    id: "kerala-flights",
    serviceId: "svc-kerala-flights",
    profileVendorId: "trailmakers",
    name: "Kerala Flight Ticketing",
    category: "Flights",
    location: "India",
  },
];

export const VENDOR_SERVICE_CONNECTIONS: VendorServiceConnection[] = [
  ...PRIVATE_TRANSPORT_FIXTURES.map((fixture) => ({
    id: `${fixture.id}-${fixture.vendorId}`, vendorId: fixture.vendorId, serviceId: fixture.serviceId,
    supplierType: "Direct supplier" as const, productsCovered: fixture.tariff.vehicleIds.length + " vehicle offerings",
    rateCardId: fixture.id, rateCardName: fixture.name, validity: "01 Oct 26–31 Mar 27",
  })),
  ...ACTIVITY_RATE_FIXTURES.map((fixture) => ({
    id: `activity-${fixture.id}`, vendorId: fixture.vendorId, serviceId: fixture.serviceId,
    supplierType: "Direct supplier" as const, productsCovered: "Activity options",
    rateCardId: fixture.id, rateCardName: fixture.name, validity: "01 Oct 26–31 Mar 27",
  })),
  { id: "taj-exotica-exhosp", vendorId: "exhosp", serviceId: "taj-exotica", supplierType: "Direct supplier", productsCovered: "12 room types", rateCardId: "rc-acc-2627", rateCardName: "Accommodation tariff 2026–27", validity: "01 Apr 26–31 Mar 27" },
  { id: "taj-exotica-wanderlust", vendorId: "wanderlust", serviceId: "taj-exotica", supplierType: "DMC", productsCovered: "8 room types", rateCardId: "rc-taj-goa-wanderlust", rateCardName: "Taj Goa contracted rates", validity: "01 Oct 26–30 Sep 27" },
  { id: "taj-exotica-coastal", vendorId: "coastal", serviceId: "taj-exotica", supplierType: "Wholesaler", productsCovered: "5 room types", rateCardId: "rc-taj-goa-coastal", rateCardName: "Winter FIT tariff", validity: "01 Oct 26–31 Mar 27" },
  { id: "taj-lake-heritage", vendorId: "kerala-heritage", serviceId: "taj-lake-palace", supplierType: "Direct supplier", productsCovered: "9 room types", rateCardId: "rc-acc-2627", rateCardName: "Palace stay tariff 2026–27", validity: "01 Apr 26–31 Mar 27" },
  { id: "taj-lake-horizon", vendorId: "horizon", serviceId: "taj-lake-palace", supplierType: "DMC", productsCovered: "6 room types", rateCardId: "rc-acc-2526", rateCardName: "Rajasthan DMC rates", validity: "01 Apr 26–31 Mar 27" },
  { id: "taj-bekal-coastal", vendorId: "coastal", serviceId: "taj-bekal", supplierType: "Direct supplier", productsCovered: "10 room types", rateCardId: "rc-acc-2627", rateCardName: "Bekal direct tariff", validity: "01 Apr 26–31 Mar 27" },
  { id: "taj-bekal-exhosp", vendorId: "exhosp", serviceId: "taj-bekal", supplierType: "Wholesaler", productsCovered: "7 room types", rateCardId: "rc-acc-2526", rateCardName: "North Kerala FIT rates", validity: "01 Oct 26–31 Mar 27" },
  { id: "taj-bekal-wanderlust", vendorId: "wanderlust", serviceId: "taj-bekal", supplierType: "DMC", productsCovered: "6 room types", rateCardId: "rc-hill-2627", rateCardName: "Bekal contracted rates", validity: "01 Apr 26–31 Mar 27" },
  { id: "taj-bekal-horizon", vendorId: "horizon", serviceId: "taj-bekal", supplierType: "Wholesaler", productsCovered: "4 room types", rateCardId: "rc-acc-2526", rateCardName: "Seasonal hotel allotment", validity: "01 Oct 26–31 Mar 27" },
  { id: "lake-exhosp", vendorId: "exhosp", serviceId: "example-lake", supplierType: "Direct supplier", productsCovered: "2 room types", rateCardId: "rc-acc-2627", rateCardName: "Accommodation tariff 2026–27", validity: "01 Apr 26–31 Mar 27" },
  { id: "lake-wanderlust", vendorId: "wanderlust", serviceId: "example-lake", supplierType: "DMC", productsCovered: "2 room types", rateCardId: "rc-acc-2526", rateCardName: "Backwater stay rates", validity: "01 Apr 26–31 Mar 27" },
  { id: "hill-exhosp", vendorId: "exhosp", serviceId: "example-hill", supplierType: "Direct supplier", productsCovered: "3 room types", rateCardId: "rc-hill-2627", rateCardName: "Hill Retreat tariff 2026–27", validity: "01 Apr 26–31 Mar 27" },
  { id: "hill-horizon", vendorId: "horizon", serviceId: "example-hill", supplierType: "DMC", productsCovered: "3 room types", rateCardId: "rc-hill-2627", rateCardName: "Munnar winter rates", validity: "01 Oct 26–31 Mar 27" },
  { id: "visa-atlas", vendorId: "atlas-visa", serviceId: "uae-visa", supplierType: "Direct supplier", productsCovered: "30 · 60 · 90 days", rateCardId: "rc-visa-uae", rateCardName: "Visa services tariff · UAE", validity: "01 Apr–30 Sep 26" },
  { id: "visa-horizon", vendorId: "horizon", serviceId: "uae-visa", supplierType: "DMC", productsCovered: "30 · 60 days", rateCardId: "rc-visa-uae", rateCardName: "UAE visa handling", validity: "01 Apr–30 Sep 26" },
];

const linkedServicesKey = "paryatech-vendor-service-connections:v1";
for (const fixture of SUPPLIER_RATE_FIXTURES) {
  const connection = VENDOR_SERVICE_CONNECTIONS.find((item) => item.id === fixture.connectionId);
  if (connection) connection.rateCardId = fixture.id;
}
try {
  const saved = JSON.parse(localStorage.getItem(linkedServicesKey) || "[]") as VendorServiceConnection[];
  if (Array.isArray(saved)) for (const connection of saved) {
    if (connection?.vendorId && connection?.serviceId && !VENDOR_SERVICE_CONNECTIONS.some((item) => item.vendorId === connection.vendorId && item.serviceId === connection.serviceId)) VENDOR_SERVICE_CONNECTIONS.push(connection);
  }
} catch { /* Storage is optional during static rendering. */ }

export function linkVendorService(vendorId: string, serviceId: string): VendorServiceConnection {
  const existing = VENDOR_SERVICE_CONNECTIONS.find((item) => item.vendorId === vendorId && item.serviceId === serviceId);
  if (existing) return existing;
  const service = [...readCreatedDirectoryServices(), ...DIRECTORY_SERVICES].find((item) => item.id === serviceId);
  if (!service) throw new Error("Select an existing service before linking it to a supplier.");
  const connection: VendorServiceConnection = { id: `linked-${vendorId}-${serviceId}`, vendorId, serviceId, supplierType: "Direct supplier", productsCovered: service.category === "Activities" ? "Activity options" : "Service offering", rateCardId: "", rateCardName: "No rate card yet", validity: "Not set" };
  VENDOR_SERVICE_CONNECTIONS.push(connection);
  try { localStorage.setItem(linkedServicesKey, JSON.stringify(VENDOR_SERVICE_CONNECTIONS.filter((item) => item.id.startsWith("linked-")))); } catch { /* Keep the current session usable. */ }
  return connection;
}

export function directoryCategoryForServiceType(type: ServiceType): DirectoryCategory | null {
  if (type === "Activity") return "Activities";
  if (type === "DMC/Ground handling") return null;
  return type;
}

export function serviceByDirectoryId(id: string): DirectoryService | undefined {
  return DIRECTORY_SERVICES.find((service) => service.id === id);
}
