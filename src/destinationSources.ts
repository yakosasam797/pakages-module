import { DIRECTORY_SERVICES, VENDOR_SERVICE_CONNECTIONS, readCreatedDirectoryServices } from "./modules/vendors/data/vendorDirectory";
import type { DirectoryService } from "./modules/vendors/data/vendorDirectory";
import { SEED_VENDORS } from "./modules/vendors/data/vendors";
import type { Vendor } from "./modules/vendors/data/vendors";
import { VENDOR_SERVICES } from "./modules/vendors/data/services";
import type { VendorService } from "./modules/vendors/data/services";
import { VENDOR_PACKAGES } from "./modules/vendors/data/packages";
import type { VendorPackage } from "./modules/vendors/data/packages";
import { packageDaysForDestination } from "./PackageDetail";
import type { ProposalDay, ProposalServiceKind } from "./proposalModel";
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
  templateId?: string;
  proposalDays?: ProposalDay[];
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
  sourcePackageId?: string;
  days?: Array<{ place: string; title?: string; image?: string; services: Array<{ kind: string; title: string; detail?: string; vendor?: string }> }>;
}

export interface DestinationItineraryService {
  key: string;
  title: string;
  category: string;
  detail: string;
  place: string;
  image?: string;
  vendor?: string;
  sources: Array<{ kind: "package" | "proposal"; id: string; name: string }>;
}

export interface DestinationBooking {
  id: string;
  name: string;
  destination: string;
  travel: string;
  stage: string;
  status: string;
}

type DestinationServiceRecord = Omit<DirectoryService, "category"> & { category: string };

export interface DestinationSnapshot {
  packages: Array<{ record: DestinationPackage; proposals: DestinationProposal[] }>;
  vendorPackages: VendorPackage[];
  proposals: Array<{ record: DestinationProposal; package?: DestinationPackage }>;
  bookings: DestinationBooking[];
  services: Array<{ record: DestinationServiceRecord; vendors: Vendor[]; profile?: VendorService }>;
  itineraryServices: DestinationItineraryService[];
  vendors: Array<{ record: Vendor; services: DestinationServiceRecord[]; basedHere: boolean }>;
}

const categoryByKind: Record<ProposalServiceKind, string> = {
  stay: "Accommodation", transfer: "Transport", activity: "Activities",
  flight: "Flights", meal: "Meals", other: "Other service",
};

function itineraryServiceKey(kind: string, title: string) {
  return `${kind}:${normalize(title.replace(/\s*[·•]\s*\d+\s*nights?\b.*$/i, ""))}`;
}

function itineraryServicesFor(
  matchingPackages: DestinationPackage[],
  matchingProposals: DestinationProposal[],
  directoryServices: Array<{ name: string }>,
): DestinationItineraryService[] {
  const byKey = new Map<string, DestinationItineraryService>();
  const crmNames = new Set(directoryServices.map((service) => normalize(service.name)));
  const packageById = new Map(matchingPackages.map((item) => [item.id, item]));
  const addDays = (
    days: NonNullable<DestinationProposal["days"]>,
    source: DestinationItineraryService["sources"][number],
    image?: string,
  ) => {
    for (const day of days) for (const service of day.services) {
      const title = service.title.trim();
      if (!title || !Object.hasOwn(categoryByKind, service.kind)) continue;
      // These describe time or an unselected option, not a bookable service.
      if (/^checkout\b|^breakfast at\b|^open time\b|^flight required\b/i.test(title)) continue;
      const key = itineraryServiceKey(service.kind, title);
      if (crmNames.has(normalize(title.replace(/\s*[·•]\s*\d+\s*nights?\b.*$/i, "")))) continue;
      const existing = byKey.get(key);
      if (existing) {
        if (!existing.sources.some((item) => item.kind === source.kind && item.id === source.id)) existing.sources.push(source);
        if (!existing.vendor && service.vendor) existing.vendor = service.vendor;
        continue;
      }
      byKey.set(key, {
        key, title, category: categoryByKind[service.kind as ProposalServiceKind],
        detail: service.detail ?? "Included in the itinerary", place: day.place,
        image: day.image ?? image, vendor: service.vendor, sources: [source],
      });
    }
  };

  for (const record of matchingPackages) {
    addDays(packageDaysForDestination(record), { kind: "package", id: record.id, name: record.name }, record.image);
  }
  for (const record of matchingProposals) {
    if (!record.days) continue;
    const sourcePackage = record.sourcePackageId ? packageById.get(record.sourcePackageId) : undefined;
    addDays(record.days, sourcePackage
      ? { kind: "package", id: sourcePackage.id, name: sourcePackage.name }
      : { kind: "proposal", id: record.id, name: record.name }, sourcePackage?.image);
  }
  return [...byKey.values()];
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
    ...[...readCreatedDirectoryServices(), ...DIRECTORY_SERVICES].map((item) => item.location),
    ...VENDOR_SERVICES.map((item) => item.location),
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
  const directoryServices = [...readCreatedDirectoryServices(), ...DIRECTORY_SERVICES];
  const directoryProfileIds = new Set(directoryServices.map((item) => item.serviceId));
  const profileOnlyServices: DestinationServiceRecord[] = VENDOR_SERVICES.filter((item) => !directoryProfileIds.has(item.id)).map((item) => ({
    id: item.id,
    serviceId: item.id,
    profileVendorId: item.vendorId,
    name: item.name,
    category: item.type === "Activity" ? "Activities" : item.type,
    location: item.location,
    description: item.about,
  }));
  const matchingServices: DestinationServiceRecord[] = [...directoryServices, ...profileOnlyServices].filter((item) => belongsToRegion(item.location, region) || belongsToRegion(item.name, region));
  const vendorById = new Map(SEED_VENDORS.map((vendor) => [vendor.id, vendor]));
  const serviceProfileById = new Map(VENDOR_SERVICES.map((service) => [service.id, service]));

  const providersFor = (service: DestinationServiceRecord) => {
    const ids = new Set([
      service.profileVendorId,
      ...VENDOR_SERVICE_CONNECTIONS.filter((connection) => connection.serviceId === service.id).map((connection) => connection.vendorId),
    ]);
    return [...ids].map((id) => vendorById.get(id)).filter((vendor): vendor is Vendor => Boolean(vendor));
  };

  const services = matchingServices.map((record) => ({ record, vendors: providersFor(record), profile: serviceProfileById.get(record.serviceId) }));
  const itineraryServices = itineraryServicesFor(matchingPackages, matchingProposals, matchingServices);
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
    itineraryServices,
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
