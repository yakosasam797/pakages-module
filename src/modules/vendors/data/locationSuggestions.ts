import baliImage from "../../../assets/vendors/location-suggestions/bali.jpg";
import dubaiImage from "../../../assets/vendors/location-suggestions/dubai.jpg";
import keralaImage from "../../../assets/vendors/location-suggestions/kerala.jpg";
import rajasthanImage from "../../../assets/vendors/location-suggestions/rajasthan.jpg";
import type { DirectoryService } from "./vendorDirectory";
import type { Vendor } from "./vendors";

export type LocationSuggestion = {
  id: string;
  name: string;
  detail: string;
  image?: string;
  terms: string[];
  aliases?: string[];
};

const places: LocationSuggestion[] = [
  { id: "bali", name: "Bali", detail: "Indonesia", image: baliImage, terms: ["Bali"], aliases: ["Denpasar", "Ubud"] },
  { id: "kochi", name: "Kochi", detail: "Kerala, India", image: keralaImage, terms: ["Kochi"], aliases: ["Cochin"] },
  { id: "munnar", name: "Munnar", detail: "Kerala, India", image: keralaImage, terms: ["Munnar"] },
  { id: "alappuzha", name: "Alleppey", detail: "Kerala, India", image: keralaImage, terms: ["Alleppey", "Alappuzha"] },
  { id: "thekkady", name: "Thekkady", detail: "Kerala, India", image: keralaImage, terms: ["Thekkady"] },
  { id: "kerala", name: "Kerala", detail: "India", image: keralaImage, terms: ["Kerala", "Kochi", "Munnar", "Alleppey", "Alappuzha", "Thekkady", "Kozhikode"] },
  { id: "goa", name: "Goa", detail: "India", terms: ["Goa"] },
  { id: "new-delhi", name: "New Delhi", detail: "India", terms: ["New Delhi", "Delhi"] },
  { id: "udaipur", name: "Udaipur", detail: "Rajasthan, India", image: rajasthanImage, terms: ["Udaipur"] },
  { id: "dubai", name: "Dubai", detail: "United Arab Emirates", image: dubaiImage, terms: ["Dubai"] },
  { id: "uae", name: "UAE", detail: "United Arab Emirates", image: dubaiImage, terms: ["UAE", "Dubai"] },
];

const normalized = (value: string) => value.trim().toLocaleLowerCase();

export function getLocationSuggestions(vendors: Vendor[], services: DirectoryService[]): LocationSuggestion[] {
  const vendorById = new Map(vendors.map((vendor) => [vendor.id, vendor]));
  const locations = new Map<string, LocationSuggestion>();

  for (const place of places) {
    const relatedService = services.find((service) => place.terms.some((term) => normalized(service.location).includes(normalized(term))));
    const relatedVendor = vendors.find((vendor) => place.terms.some((term) => normalized(vendor.location).includes(normalized(term))));
    locations.set(normalized(place.name), {
      ...place,
      image: place.image || relatedVendor?.imageUrl || (relatedService ? vendorById.get(relatedService.profileVendorId)?.imageUrl : undefined),
    });
  }

  for (const location of [...vendors.map((vendor) => ({ name: vendor.location, image: vendor.imageUrl })), ...services.map((service) => ({ name: service.location, image: vendorById.get(service.profileVendorId)?.imageUrl }))]) {
    const [name, ...remainder] = location.name.split(",").map((part) => part.trim());
    if (!name || locations.has(normalized(name))) continue;
    locations.set(normalized(name), {
      id: `workspace-${normalized(name).replace(/[^a-z0-9]+/g, "-")}`,
      name,
      detail: remainder.join(", ") || "Location in your workspace",
      image: location.image,
      terms: [name],
    });
  }
  return [...locations.values()];
}

export function findLocationSuggestions(placesToSearch: LocationSuggestion[], query: string): LocationSuggestion[] {
  const term = normalized(query);
  if (!term) return [];
  return placesToSearch
    .map((place) => {
      const name = normalized(place.name);
      const words = [...place.terms, ...(place.aliases || [])].map(normalized);
      const nameStarts = name.startsWith(term) || name.split(/[^a-z0-9]+/).some((part) => part.startsWith(term));
      const otherStarts = words.some((value) => value.startsWith(term) || value.split(/[^a-z0-9]+/).some((part) => part.startsWith(term)));
      const contains = term.length > 1 && [name, ...words].some((value) => value.includes(term));
      return { place, rank: nameStarts ? 0 : otherStarts ? 1 : contains ? 2 : 3 };
    })
    .filter(({ rank }) => rank < 3)
    .sort((a, b) => a.rank - b.rank || a.place.name.localeCompare(b.place.name))
    .slice(0, 8)
    .map(({ place }) => place);
}

export function matchesLocation(location: string, selected: LocationSuggestion | null) {
  return !selected || selected.terms.some((term) => normalized(location).includes(normalized(term)));
}
