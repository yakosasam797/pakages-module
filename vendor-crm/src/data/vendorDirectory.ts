import type { ServiceType } from "./services";

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
  {
    id: "kochi-local-transfers", serviceId: "svc-kochi-local", profileVendorId: "bluewave",
    name: "Kochi airport and local transport", category: "Transport", location: "Kochi",
    description: "Private airport transfers and local hire within the Kochi operating area.",
    attributes: [{ label: "Service scope", value: "Fixed transfer, local package" }],
  },
  {
    id: "kerala-outstation-hire", serviceId: "svc-kerala-outstation", profileVendorId: "trailmakers",
    name: "Kerala outstation transport", category: "Transport", location: "Kerala",
    description: "Private outstation vehicles hired by kilometre or day from Kochi.",
    attributes: [{ label: "Service scope", value: "Outstation per km, daily hire" }],
  },
  {
    id: "kerala-private-hire",
    serviceId: "svc-kerala-private-hire",
    profileVendorId: "bluewave",
    name: "Kerala private transport",
    category: "Transport",
    location: "Kerala",
    description: "Private vehicle hire with pickup, drop and route defined for each customer trip.",
    attributes: [{ label: "Service scope", value: "One-way, local, outstation, daily" }],
  },
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
    id: "kochi-transfer",
    serviceId: "svc-transfer-cok",
    profileVendorId: "trailmakers",
    name: "Kochi Airport Transfer",
    category: "Transport",
    location: "Kochi",
  },
  {
    id: "munnar-trek",
    serviceId: "svc-trek-munnar",
    profileVendorId: "trailmakers",
    name: "Munnar Ridge Trek",
    category: "Activities",
    location: "Munnar",
  },
  {
    id: "backwater-kayak",
    serviceId: "svc-kayak",
    profileVendorId: "trailmakers",
    name: "Backwater Kayak",
    category: "Activities",
    location: "Alleppey",
  },
  {
    id: "cardamom-tour",
    serviceId: "svc-cardamom",
    profileVendorId: "exhosp",
    name: "Cardamom Plantation Tour",
    category: "Activities",
    location: "Thekkady",
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
  { id: "kochi-local-bluewave", vendorId: "bluewave", serviceId: "kochi-local-transfers", supplierType: "Direct supplier", productsCovered: "Fixed transfer · Local package", rateCardId: "rc-kochi-local-transfers", rateCardName: "Kochi airport and local transfers", validity: "01 Oct 26–31 Mar 27" },
  { id: "kerala-km-trailmakers", vendorId: "trailmakers", serviceId: "kerala-outstation-hire", supplierType: "Direct supplier", productsCovered: "Outstation per km · Daily hire", rateCardId: "rc-kerala-km-tariff", rateCardName: "Kerala outstation kilometre tariff", validity: "01 Oct 26–31 Mar 27" },
  { id: "kerala-hire-bluewave", vendorId: "bluewave", serviceId: "kerala-private-hire", supplierType: "Direct supplier", productsCovered: "Sedan · MUV · Van · Coach", rateCardId: "rc-kerala-private-hire", rateCardName: "Kerala private hire rates", validity: "01 Oct 26–31 Mar 27" },
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
  { id: "transfer-bluewave", vendorId: "bluewave", serviceId: "kochi-transfer", supplierType: "Direct supplier", productsCovered: "Sedan · SUV · Tempo", rateCardId: "rc-air-2026", rateCardName: "Airport transfer rates 2026", validity: "01 Jan–31 Dec 26" },
  { id: "transfer-trailmakers", vendorId: "trailmakers", serviceId: "kochi-transfer", supplierType: "DMC", productsCovered: "Sedan · Tempo", rateCardId: "rc-air-2026", rateCardName: "Kerala transfers 2026", validity: "01 Jan–31 Dec 26" },
  { id: "transfer-wanderlust", vendorId: "wanderlust", serviceId: "kochi-transfer", supplierType: "DMC", productsCovered: "Sedan · SUV", rateCardId: "rc-air-2026", rateCardName: "Kochi ground rates", validity: "01 Jan–31 Dec 26" },
  { id: "transfer-spice", vendorId: "spice-route", serviceId: "kochi-transfer", supplierType: "Wholesaler", productsCovered: "Sedan", rateCardId: "rc-air-2026", rateCardName: "Airport FIT transfers", validity: "01 Jan–31 Dec 26" },
  { id: "trek-trailmakers", vendorId: "trailmakers", serviceId: "munnar-trek", supplierType: "Direct supplier", productsCovered: "Half day · max 12", rateCardId: "rc-acc-2627", rateCardName: "Activity tariff 2026", validity: "01 Jan–31 Dec 26" },
  { id: "trek-summit", vendorId: "summit", serviceId: "munnar-trek", supplierType: "Direct supplier", productsCovered: "Half day · max 10", rateCardId: "rc-acc-2526", rateCardName: "Guided trek rates", validity: "01 Oct 26–31 Mar 27" },
  { id: "trek-spice", vendorId: "spice-route", serviceId: "munnar-trek", supplierType: "DMC", productsCovered: "Private groups", rateCardId: "rc-hill-2627", rateCardName: "Munnar experiences", validity: "01 Oct 26–31 Mar 27" },
  { id: "kayak-trailmakers", vendorId: "trailmakers", serviceId: "backwater-kayak", supplierType: "Direct supplier", productsCovered: "Single · tandem kayak", rateCardId: "rc-acc-2627", rateCardName: "Activity tariff 2026", validity: "01 Jan–31 Dec 26" },
  { id: "kayak-spice", vendorId: "spice-route", serviceId: "backwater-kayak", supplierType: "DMC", productsCovered: "Private groups", rateCardId: "rc-acc-2526", rateCardName: "Backwater experiences", validity: "01 Oct 26–31 Mar 27" },
  { id: "cardamom-exhosp", vendorId: "exhosp", serviceId: "cardamom-tour", supplierType: "DMC", productsCovered: "Half day tour", rateCardId: "rc-hill-2627", rateCardName: "Hill Retreat tariff 2026–27", validity: "01 Apr 26–31 Mar 27" },
  { id: "cardamom-spice", vendorId: "spice-route", serviceId: "cardamom-tour", supplierType: "Direct supplier", productsCovered: "Private · shared", rateCardId: "rc-acc-2627", rateCardName: "Spice plantation rates", validity: "01 Jan–31 Dec 26" },
  { id: "visa-atlas", vendorId: "atlas-visa", serviceId: "uae-visa", supplierType: "Direct supplier", productsCovered: "30 · 60 · 90 days", rateCardId: "rc-visa-uae", rateCardName: "Visa services tariff · UAE", validity: "01 Apr–30 Sep 26" },
  { id: "visa-horizon", vendorId: "horizon", serviceId: "uae-visa", supplierType: "DMC", productsCovered: "30 · 60 days", rateCardId: "rc-visa-uae", rateCardName: "UAE visa handling", validity: "01 Apr–30 Sep 26" },
  { id: "flights-trailmakers", vendorId: "trailmakers", serviceId: "kerala-flights", supplierType: "Wholesaler", productsCovered: "Domestic · international", rateCardId: "rc-air-2026", rateCardName: "Air ticketing fees 2026", validity: "01 Jan–31 Dec 26" },
  { id: "flights-wanderlust", vendorId: "wanderlust", serviceId: "kerala-flights", supplierType: "Direct supplier", productsCovered: "Domestic · regional", rateCardId: "rc-air-2026", rateCardName: "Flight desk contract 2026", validity: "01 Jan–31 Dec 26" },
  { id: "flights-horizon", vendorId: "horizon", serviceId: "kerala-flights", supplierType: "DMC", productsCovered: "Domestic · international", rateCardId: "rc-air-2026", rateCardName: "Air consolidation rates 2026", validity: "01 Jan–31 Dec 26" },
];

export function directoryCategoryForServiceType(type: ServiceType): DirectoryCategory | null {
  if (type === "Activity") return "Activities";
  if (type === "DMC/Ground handling") return null;
  return type;
}

export function serviceByDirectoryId(id: string): DirectoryService | undefined {
  return DIRECTORY_SERVICES.find((service) => service.id === id);
}
