import { DIRECTORY_SERVICES, VENDOR_SERVICE_CONNECTIONS } from "../vendor-crm/src/data/vendorDirectory";
import type { DirectoryService } from "../vendor-crm/src/data/vendorDirectory";
import { SEED_VENDORS } from "../vendor-crm/src/data/vendors";
import type { Vendor } from "../vendor-crm/src/data/vendors";
import { VENDOR_SERVICES } from "../vendor-crm/src/data/services";
import type { VendorService } from "../vendor-crm/src/data/services";
import { VENDOR_PACKAGES } from "../vendor-crm/src/data/packages";
import type { VendorPackage } from "../vendor-crm/src/data/packages";
import type { RegionSuggestion } from "./regionSearch";

export interface DestinationPackage {
  id: string;
  name: string;
  destination: string;
  region: string;
  status: string;
  image: string;
  duration?: string;
  startingPrice?: number;
}

export interface DestinationProposal {
  id: string;
  name: string;
  customer: string;
  packageName: string;
  destination: string;
  region: string;
  status: string;
  value: number;
  days?: Array<{ place: string; title?: string; services: Array<{ kind: string; title: string; detail?: string }> }>;
}

export interface DestinationBooking {
  id: string;
  name: string;
  destination: string;
  travel: string;
  stage: string;
  status: string;
}

export interface DestinationSnapshot {
  packages: Array<{ record: DestinationPackage; proposals: DestinationProposal[] }>;
  vendorPackages: VendorPackage[];
  proposals: Array<{ record: DestinationProposal; package?: DestinationPackage }>;
  bookings: DestinationBooking[];
  services: Array<{ record: DirectoryService; vendors: Vendor[]; profile?: VendorService }>;
  vendors: Array<{ record: Vendor; services: DirectoryService[]; basedHere: boolean }>;
}

// These are location relationships visible in the current module data. The
// region API can later supply canonical area IDs instead of these aliases.
const localitiesByRegion: Record<string, string[]> = {
  "bengaluru-karnataka": ["bengaluru", "bangalore"],
  "bali-indonesia": ["bali", "denpasar", "ubud"],
  "dubai-uae": ["dubai", "uae"],
  "himachal-pradesh-india": ["himachal", "manali", "shimla"],
  "rajasthan-india": ["rajasthan", "jaipur", "udaipur", "jodhpur"],
  "kerala-india": ["kerala", "kochi", "fort kochi", "munnar", "bekal", "alleppey", "alappuzha", "kozhikode", "thekkady"],
  "delhi-india": ["delhi", "new delhi", "ncr"],
};

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function termsFor(region: RegionSuggestion) {
  if (localitiesByRegion[region.id]) return localitiesByRegion[region.id];
  const place = region.label.split(",")[0];
  // A city in the workspace can also be served by a package covering its wider region.
  const parent = Object.values(localitiesByRegion).find((places) => places.slice(1).some((item) => normalize(item) === normalize(place)))?.[0];
  return [
    place,
    ...(parent ? [parent] : []),
    ...region.packageTerms.filter((term) =>
      normalize(term) !== normalize(region.country) && normalize(term) !== normalize(region.group),
    ),
  ];
}

export function belongsToRegion(place: string, region: RegionSuggestion) {
  const value = ` ${normalize(place)} `;
  return termsFor(region).some((term) => value.includes(` ${normalize(term)} `));
}

/** Location suggestions sourced from records, so places absent from the fallback catalog remain searchable. */
export function workspaceRegionSuggestions(
  packages: DestinationPackage[],
  proposals: DestinationProposal[],
  bookings: DestinationBooking[],
): RegionSuggestion[] {
  const locations = [
    ...packages.map((item) => item.destination),
    ...proposals.map((item) => item.destination),
    ...bookings.map((item) => item.destination),
    ...DIRECTORY_SERVICES.map((item) => item.location),
    ...SEED_VENDORS.map((item) => item.location),
  ];
  const byPlace = new Map<string, RegionSuggestion>();
  for (const location of locations) {
    const [place, country = ""] = location.split(",").map((part) => part.trim());
    const key = normalize(place);
    if (!key || byPlace.has(key)) continue;
    byPlace.set(key, {
      id: `workspace-${key.replace(/\s+/g, "-")}`,
      label: place,
      country,
      group: "In workspace",
      aliases: [place],
      packageTerms: [place],
    });
  }
  return [...byPlace.values()];
}

export function buildDestinationSnapshot(
  region: RegionSuggestion,
  packages: DestinationPackage[],
  proposals: DestinationProposal[],
  bookings: DestinationBooking[],
): DestinationSnapshot {
  const matchingPackages = packages.filter((item) => belongsToRegion(`${item.destination} ${item.region}`, region));
  const matchingProposals = proposals.filter((item) => belongsToRegion(`${item.destination} ${item.region}`, region));
  const packageByName = new Map(packages.map((item) => [normalize(item.name), item]));
  const matchingServices = DIRECTORY_SERVICES.filter((item) => belongsToRegion(item.location, region) || belongsToRegion(item.name, region));
  const vendorById = new Map(SEED_VENDORS.map((vendor) => [vendor.id, vendor]));
  const serviceProfileById = new Map(VENDOR_SERVICES.map((service) => [service.id, service]));

  const providersFor = (service: DirectoryService) => {
    const ids = new Set([
      service.profileVendorId,
      ...VENDOR_SERVICE_CONNECTIONS.filter((connection) => connection.serviceId === service.id).map((connection) => connection.vendorId),
    ]);
    return [...ids].map((id) => vendorById.get(id)).filter((vendor): vendor is Vendor => Boolean(vendor));
  };

  const services = matchingServices.map((record) => ({ record, vendors: providersFor(record), profile: serviceProfileById.get(record.serviceId) }));
  const vendors = SEED_VENDORS.flatMap((record) => {
    const relatedServices = services.filter((service) => service.vendors.some((vendor) => vendor.id === record.id)).map((service) => service.record);
    const basedHere = belongsToRegion(record.location, region);
    return basedHere || relatedServices.length ? [{ record, services: relatedServices, basedHere }] : [];
  });

  return {
    packages: matchingPackages.map((record) => ({
      record,
      proposals: matchingProposals.filter((proposal) => normalize(proposal.packageName) === normalize(record.name)),
    })),
    vendorPackages: VENDOR_PACKAGES.filter((item) => belongsToRegion(`${item.name} ${item.detail} ${item.summary}`, region)),
    proposals: matchingProposals.map((record) => ({ record, package: packageByName.get(normalize(record.packageName)) })),
    bookings: bookings.filter((item) => belongsToRegion(item.destination, region)),
    services,
    vendors,
  };
}

/** Reads the unchanged Booking module's list instead of maintaining a second set of booking mock data. */
export async function loadDestinationBookings(signal?: AbortSignal): Promise<DestinationBooking[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}booking/index.html`, { signal });
  if (!response.ok) throw new Error(`Booking source returned ${response.status}`);
  const html = await response.text();
  const document = new DOMParser().parseFromString(html, "text/html");

  return [...document.querySelectorAll<HTMLElement>("#bkBody .bk-row")].flatMap((row) => {
    const id = row.querySelector(".bk-id")?.textContent?.trim();
    const name = row.querySelector(".bk-title")?.textContent?.trim();
    const destination = name?.split(/\s*[·•]\s*/).at(-1)?.trim();
    if (!id || !name || !destination) return [];
    const stage = row.dataset.stage ?? "upcoming";
    return [{
      id,
      name,
      destination,
      travel: row.querySelector(".bk-line.mono.primary-cell")?.textContent?.trim() ?? "Travel date pending",
      stage,
      status: row.querySelector(".st-cap")?.textContent?.trim() ?? stage,
    }];
  });
}
