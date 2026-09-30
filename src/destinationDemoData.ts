import honeymoonImage from "./assets/destinations/bali-honeymoon.jpg";
import riceTerracesImage from "./assets/bali/bali-rice-terraces-hero.jpg";
import templeImage from "./assets/bali/ubud-temple.jpg";
import penidaImage from "./assets/bali/nusa-penida.jpg";

/** Illustrative Bali records used only by Destination. They do not enter the source modules. */
export interface DestinationExampleBase {
  id: string;
  name: string;
  image: string;
  location: string;
  description: string;
  highlights: string[];
  connections: string[];
}

export interface DestinationExamplePackage extends DestinationExampleBase {
  duration: string;
  price: number;
  status: "Draft" | "Published";
}

export interface DestinationExampleService extends DestinationExampleBase {
  category: "Accommodation" | "Activities" | "Transport" | "Flights" | "Visa" | "Ground handling";
  vendor: string;
  serviceNote: string;
}

export interface DestinationExampleGuide extends DestinationExampleBase {
  kind: "Viewpoint" | "Culture" | "Nature" | "Coast";
}

export interface DestinationExampleVendor extends DestinationExampleBase {
  categories: string[];
  contact: string;
  serviceCount: number;
}

export interface DestinationExampleTrip extends DestinationExampleBase {
  kind: "Proposal" | "Booking";
  customer: string;
  travel: string;
  status: string;
}

export const baliExample = {
  packages: [
    { id: "BALI-PKG-01", name: "Ubud & Penida discovery", image: riceTerracesImage, location: "Ubud · Nusa Penida", description: "A five-day route linking Ubud's inland stops with a day on Nusa Penida.", highlights: ["Ubud stay · 3 nights", "Rice terrace walk", "Nusa Penida coastal day", "Private airport transfers"], connections: ["Ubud Garden Suites", "Bali Heritage Studio", "Penida Coast Experiences", "Island Wheels Bali"], duration: "5 days · 4 nights", price: 82500, status: "Published" },
    { id: "BALI-PKG-02", name: "Bali family coast & culture", image: templeImage, location: "Ubud · Uluwatu", description: "A family-paced itinerary with cultural visits, beach time and private transport.", highlights: ["Family accommodation", "Uluwatu temple visit", "Private day car", "Flexible leisure day"], connections: ["Seminyak Coastal Stay", "Uluwatu Sunset Visit", "Island Wheels Bali"], duration: "6 days · 5 nights", price: 108000, status: "Published" },
    { id: "BALI-PKG-03", name: "Slow Bali wellness stay", image: honeymoonImage, location: "Seminyak · Ubud", description: "A slower itinerary with a coastal stay, Ubud time and unhurried day plans.", highlights: ["Seminyak coastal stay", "Ubud garden suite", "Campuhan Ridge Walk", "Private point-to-point transfers"], connections: ["Ubud Stay Collective", "Seminyak Coastal Stay", "Island Wheels Bali"], duration: "4 days · 3 nights", price: 69500, status: "Draft" },
  ] satisfies DestinationExamplePackage[],
  services: [] as DestinationExampleService[],
  guides: [
    { id: "BALI-GDE-01", name: "Tegallalang rice terraces", image: riceTerracesImage, location: "Tegallalang, Bali", kind: "Viewpoint", description: "An inland viewpoint and walking stop to pair with an Ubud day.", highlights: ["Rice terrace outlook", "Walking route", "Pairs with Ubud private day car"], connections: ["Tegallalang rice terrace walk", "Ubud & Penida discovery"] },
    { id: "BALI-GDE-02", name: "Kelingking overlook", image: penidaImage, location: "Nusa Penida, Bali", kind: "Viewpoint", description: "A coastal viewpoint on a Nusa Penida day route.", highlights: ["Coastal outlook", "Road transfer planning", "Part of an island day"], connections: ["Nusa Penida coastal day", "Ubud & Penida discovery"] },
    { id: "BALI-GDE-03", name: "Uluwatu Temple", image: templeImage, location: "Uluwatu, Bali", kind: "Culture", description: "A cultural stop for a south-coast day, often planned around late-day light.", highlights: ["Temple area", "Coastal viewpoint", "Private car pairing"], connections: ["Uluwatu sunset visit", "Bali family coast & culture"] },
    { id: "BALI-GDE-04", name: "Campuhan Ridge Walk", image: riceTerracesImage, location: "Ubud, Bali", kind: "Nature", description: "An easy-to-place outdoor stop within an Ubud-focused day.", highlights: ["Walking stop", "Ubud location", "Fits a slower itinerary"], connections: ["Slow Bali wellness stay"] },
    { id: "BALI-GDE-05", name: "Seminyak coastline", image: honeymoonImage, location: "Seminyak, Bali", kind: "Coast", description: "Coastal time that can be kept open rather than scheduled as a fixed activity.", highlights: ["Beach time", "Coastal stay pairing", "Flexible evening"], connections: ["Seminyak Coastal Stay", "Slow Bali wellness stay"] },
    { id: "BALI-GDE-06", name: "Ubud temple quarter", image: templeImage, location: "Ubud, Bali", kind: "Culture", description: "A cluster of cultural stops that can be explored as part of an Ubud day.", highlights: ["Cultural stops", "Short local transfers", "Ubud base"], connections: ["Ubud private day car", "Bali Heritage Studio"] },
  ] satisfies DestinationExampleGuide[],
  vendors: [] as DestinationExampleVendor[],
  trips: [
    { id: "BALI-TRP-01", name: "Ubud & Penida family plan", image: riceTerracesImage, location: "Ubud · Nusa Penida", kind: "Proposal", customer: "Family travel example", travel: "April 2027 · dates open", status: "Draft", description: "An example proposal assembled from the Ubud and Penida package and linked services.", highlights: ["5-day itinerary", "Private transfers", "Island day"], connections: ["Ubud & Penida discovery", "Island Wheels Bali", "Penida Coast Experiences"] },
    { id: "BALI-TRP-02", name: "Bali coast arrival plan", image: honeymoonImage, location: "Seminyak, Bali", kind: "Booking", customer: "Couple travel example", travel: "May 2027 · dates open", status: "Planning", description: "An example booking handoff showing a coastal stay and airport transfer together.", highlights: ["Coastal stay", "Airport pickup", "Arrival coordination"], connections: ["Seminyak Coastal Stay", "Denpasar airport transfer", "Bali Ground Desk"] },
  ] satisfies DestinationExampleTrip[],
};
