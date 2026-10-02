import { DIRECTORY_SERVICES, VENDOR_SERVICE_CONNECTIONS, readCreatedDirectoryServices, type DirectoryCategory } from "./modules/vendors/data/vendorDirectory";
import { SEED_VENDORS } from "./modules/vendors/data/vendors";
import { VENDOR_SERVICES } from "./modules/vendors/data/services";
import { listDetailCards } from "./modules/vendors/rateCard/cards";
import type { ProposalServiceKind } from "./proposalModel";

export type PackageServiceCategory = DirectoryCategory | "DMC/Ground handling" | "Other";
export type PackageServiceSource = "vendor-crm" | "api";

export interface PackageServiceOption {
  id: string;
  name: string;
  category: PackageServiceCategory;
  location: string;
  description: string;
  vendor?: string;
  vendorId?: string;
  image?: string;
  rateCardIds?: string[];
  source: PackageServiceSource;
}

function vendorImage(url?: string): string | undefined {
  if (!url) return undefined;
  const photo = url.match(/photo-\d+-[a-f0-9]+/)?.[0];
  return photo ? `/service-thumbnails/${photo}.jpg` : url;
}

export const packageServiceCategories: PackageServiceCategory[] = ["Accommodation", "Transport", "Activities", "Visa", "Flights", "DMC/Ground handling", "Other"];

export const kindForCategory: Record<PackageServiceCategory, ProposalServiceKind> = {
  Accommodation: "stay", Transport: "transfer", Activities: "activity",
  Visa: "other", Flights: "flight", "DMC/Ground handling": "other", Other: "other",
};

export function crmServiceOptions(): PackageServiceOption[] {
  const cards = listDetailCards();
  return [...readCreatedDirectoryServices(), ...DIRECTORY_SERVICES].flatMap((service) => {
    const connections = VENDOR_SERVICE_CONNECTIONS.filter((item) => item.serviceId === service.id);
    const suppliers = connections.length ? connections.map((item) => item.vendorId) : [service.profileVendorId];
    const profile = VENDOR_SERVICES.find((item) => item.id === service.serviceId);
    return suppliers.map((vendorId) => {
    const vendor = SEED_VENDORS.find((item) => item.id === vendorId);
    return {
      id: service.id,
      name: service.name,
      category: service.category,
      location: service.location,
      description: service.description || service.attributes?.map((item) => item.value).join(" · ") || `${service.category} service in ${service.location}`,
      vendor: vendor?.name,
      vendorId,
      image: vendorImage(profile?.imageUrl ?? vendor?.imageUrl),
      rateCardIds: service.category === "Activities"
        ? cards.filter((card) => card.activityTariff?.serviceId === service.id && card.activityTariff.vendorId === vendorId).map((card) => card.id)
        : service.category === "Transport"
          ? cards.filter((card) => card.privateTransport?.serviceId === service.id && card.privateTransport.vendorId === vendorId).map((card) => card.id)
          : profile?.rateCards.map((card) => card.id) ?? [],
      source: "vendor-crm" as const,
    };
    });
  });
}

export async function searchApiServices(query: string, signal?: AbortSignal): Promise<PackageServiceOption[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const endpoint = import.meta.env.VITE_SERVICE_SEARCH_API_URL?.trim();
  if (!endpoint) return [];
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
