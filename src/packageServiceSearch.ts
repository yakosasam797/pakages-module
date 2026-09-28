import { DIRECTORY_SERVICES, VENDOR_SERVICE_CONNECTIONS, readCreatedDirectoryServices, type DirectoryCategory } from "../vendor-crm/src/data/vendorDirectory";
import { SEED_VENDORS } from "../vendor-crm/src/data/vendors";
import type { ProposalServiceKind } from "./proposalModel";

export type PackageServiceCategory = DirectoryCategory | "Other";
export type PackageServiceSource = "vendor-crm" | "api";

export interface PackageServiceOption {
  id: string;
  name: string;
  category: PackageServiceCategory;
  location: string;
  description: string;
  vendor?: string;
  image?: string;
  source: PackageServiceSource;
}

const apiExamples: PackageServiceOption[] = [
  { id: "api-taj-hotel-goa", name: "Taj Hotel Goa", category: "Accommodation", location: "Goa", description: "Hotel listing · room and availability details to confirm", source: "api" },
  { id: "api-taj-lake-palace", name: "Taj Lake Palace", category: "Accommodation", location: "Udaipur", description: "Palace hotel listing · room and availability details to confirm", source: "api" },
  { id: "api-dubai-airport-transfer", name: "Dubai airport transfer", category: "Transport", location: "Dubai", description: "Private transfer listing · vehicle and rate to confirm", source: "api" },
  { id: "api-ubud-cultural-tour", name: "Ubud cultural tour", category: "Activities", location: "Ubud", description: "Guided experience listing · schedule to confirm", source: "api" },
  { id: "api-uae-tourist-visa", name: "UAE tourist visa", category: "Visa", location: "United Arab Emirates", description: "Visa listing · eligibility and processing time to confirm", source: "api" },
];

function vendorImage(url?: string): string | undefined {
  if (!url) return undefined;
  const photo = url.match(/photo-\d+-[a-f0-9]+/)?.[0];
  return photo ? `/service-thumbnails/${photo}.jpg` : url;
}

export const packageServiceCategories: PackageServiceCategory[] = ["Accommodation", "Transport", "Activities", "Visa", "Flights", "Other"];

export const kindForCategory: Record<PackageServiceCategory, ProposalServiceKind> = {
  Accommodation: "stay", Transport: "transfer", Activities: "activity",
  Visa: "other", Flights: "flight", Other: "other",
};

export function crmServiceOptions(): PackageServiceOption[] {
  return [...readCreatedDirectoryServices(), ...DIRECTORY_SERVICES].map((service) => {
    const connection = VENDOR_SERVICE_CONNECTIONS.find((item) => item.serviceId === service.id);
    const vendor = SEED_VENDORS.find((item) => item.id === connection?.vendorId);
    return {
      id: service.id,
      name: service.name,
      category: service.category,
      location: service.location,
      description: service.description || service.attributes?.map((item) => item.value).join(" · ") || `${service.category} service in ${service.location}`,
      vendor: vendor?.name,
      image: vendorImage(vendor?.imageUrl),
      source: "vendor-crm" as const,
    };
  });
}

export async function searchApiServices(query: string, signal?: AbortSignal): Promise<PackageServiceOption[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const endpoint = import.meta.env.VITE_SERVICE_SEARCH_API_URL?.trim();
  if (!endpoint) return apiExamples.filter((item) => `${item.name} ${item.category} ${item.location}`.toLowerCase().includes(q.toLowerCase()));
  const url = new URL(endpoint, window.location.origin);
  url.searchParams.set("q", q);
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Service search failed with ${response.status}`);
  const payload = await response.json();
  const results: unknown[] = Array.isArray(payload) ? payload : Array.isArray(payload.results) ? payload.results : [];
  return results.flatMap((value) => {
    if (!value || typeof value !== "object") return [];
    const item = value as Record<string, unknown>;
    if (typeof item.id !== "string" || typeof item.name !== "string") return [];
    const category = packageServiceCategories.includes(item.category as PackageServiceCategory) ? item.category as PackageServiceCategory : "Other";
    return [{ id: item.id, name: item.name, category, location: typeof item.location === "string" ? item.location : "", description: typeof item.description === "string" ? item.description : "Details to confirm", vendor: typeof item.vendor === "string" ? item.vendor : undefined, image: typeof item.image === "string" ? item.image : undefined, source: "api" as const }];
  });
}

export const hasServiceSearchApi = Boolean(import.meta.env.VITE_SERVICE_SEARCH_API_URL?.trim());
