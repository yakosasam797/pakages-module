import baliCover from "./assets/package-images/bali.jpg";
import honeymoonImage from "./assets/destinations/bali-honeymoon.jpg";
import riceTerracesImage from "./assets/bali/bali-rice-terraces-hero.jpg";
import templeImage from "./assets/bali/ubud-temple.jpg";
import resortImage from "./assets/bali/ubud-resort-suite.jpg";
import penidaImage from "./assets/bali/nusa-penida.jpg";
import transferImage from "./assets/bali/private-transfer.jpg";

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
  services: [
    { id: "BALI-SVC-01", name: "Ubud Garden Suites", image: resortImage, location: "Ubud, Bali", category: "Accommodation", vendor: "Ubud Stay Collective", serviceNote: "Garden suites · breakfast option", description: "A quiet Ubud stay that can be used as the inland base for multi-day itineraries.", highlights: ["Garden-facing rooms", "Breakfast option", "Private transfer can be arranged"], connections: ["Ubud & Penida discovery", "Slow Bali wellness stay"] },
    { id: "BALI-SVC-02", name: "Seminyak Coastal Stay", image: honeymoonImage, location: "Seminyak, Bali", category: "Accommodation", vendor: "Ubud Stay Collective", serviceNote: "Coastal rooms · family option", description: "A coastal accommodation option for the first or final nights of a Bali trip.", highlights: ["Coastal location", "Family room option", "Airport transfer pairing"], connections: ["Bali family coast & culture", "Slow Bali wellness stay"] },
    { id: "BALI-SVC-03", name: "Denpasar airport transfer", image: transferImage, location: "Denpasar · Ubud", category: "Transport", vendor: "Island Wheels Bali", serviceNote: "Private vehicle · arrival or departure", description: "Private airport pickup or drop-off with the route and vehicle confirmed against the travel party.", highlights: ["Airport meet-and-greet", "Private vehicle", "Luggage allowance confirmed before booking"], connections: ["Ubud & Penida discovery", "Bali family coast & culture"] },
    { id: "BALI-SVC-04", name: "Ubud private day car", image: transferImage, location: "Ubud, Bali", category: "Transport", vendor: "Island Wheels Bali", serviceNote: "Private car · flexible route", description: "A private vehicle for a full day of stops around Ubud and nearby areas.", highlights: ["Driver-led route", "Flexible stop order", "Vehicle size matched to party"], connections: ["Bali family coast & culture", "Tegallalang rice terrace walk"] },
    { id: "BALI-SVC-05", name: "Tegallalang rice terrace walk", image: riceTerracesImage, location: "Tegallalang, Bali", category: "Activities", vendor: "Bali Heritage Studio", serviceNote: "Walking visit · local host", description: "A guided visit through the rice terrace area with time for viewpoints and photos.", highlights: ["Local host", "Walking route", "Viewpoint stop"], connections: ["Ubud & Penida discovery", "Tegallalang rice terraces"] },
    { id: "BALI-SVC-06", name: "Uluwatu sunset visit", image: templeImage, location: "Uluwatu, Bali", category: "Activities", vendor: "Bali Heritage Studio", serviceNote: "Temple area · sunset timing", description: "A late-day cultural stop that can be paired with a private car and coastal itinerary.", highlights: ["Cultural site visit", "Sunset viewpoint", "Private transport pairing"], connections: ["Bali family coast & culture", "Uluwatu Temple"] },
    { id: "BALI-SVC-07", name: "Nusa Penida coastal day", image: penidaImage, location: "Nusa Penida, Bali", category: "Activities", vendor: "Penida Coast Experiences", serviceNote: "Island day · local road transfers", description: "An island day with coastal viewpoints and the boat and road segments planned together.", highlights: ["Boat coordination", "Local driver", "Coastal stops"], connections: ["Ubud & Penida discovery", "Kelingking overlook"] },
    { id: "BALI-SVC-08", name: "Denpasar flight coordination", image: baliCover, location: "Denpasar, Bali", category: "Flights", vendor: "Bali Ground Desk", serviceNote: "Arrival and return coordination", description: "Flight timing coordination for arrivals and departures in a Bali itinerary.", highlights: ["Arrival timing", "Transfer handoff", "Return schedule check"], connections: ["Bali family coast & culture"] },
    { id: "BALI-SVC-09", name: "Bali arrival assistance", image: baliCover, location: "Denpasar, Bali", category: "Visa", vendor: "Bali Ground Desk", serviceNote: "Travel document support", description: "A planning record for arrival-document guidance and traveler handoff; requirements are confirmed for each traveler.", highlights: ["Traveler checklist", "Document review", "Airport handoff note"], connections: ["Bali family coast & culture"] },
    { id: "BALI-SVC-10", name: "Bali ground coordination", image: transferImage, location: "Across Bali", category: "Ground handling", vendor: "Bali Ground Desk", serviceNote: "Multi-service operations", description: "One coordination point for hotel, transfer and activity handoffs on a multi-stop trip.", highlights: ["Supplier schedule", "Transfer handoffs", "Day-by-day operating notes"], connections: ["Ubud & Penida discovery", "Bali family coast & culture"] },
  ] satisfies DestinationExampleService[],
  guides: [
    { id: "BALI-GDE-01", name: "Tegallalang rice terraces", image: riceTerracesImage, location: "Tegallalang, Bali", kind: "Viewpoint", description: "An inland viewpoint and walking stop to pair with an Ubud day.", highlights: ["Rice terrace outlook", "Walking route", "Pairs with Ubud private day car"], connections: ["Tegallalang rice terrace walk", "Ubud & Penida discovery"] },
    { id: "BALI-GDE-02", name: "Kelingking overlook", image: penidaImage, location: "Nusa Penida, Bali", kind: "Viewpoint", description: "A coastal viewpoint on a Nusa Penida day route.", highlights: ["Coastal outlook", "Road transfer planning", "Part of an island day"], connections: ["Nusa Penida coastal day", "Ubud & Penida discovery"] },
    { id: "BALI-GDE-03", name: "Uluwatu Temple", image: templeImage, location: "Uluwatu, Bali", kind: "Culture", description: "A cultural stop for a south-coast day, often planned around late-day light.", highlights: ["Temple area", "Coastal viewpoint", "Private car pairing"], connections: ["Uluwatu sunset visit", "Bali family coast & culture"] },
    { id: "BALI-GDE-04", name: "Campuhan Ridge Walk", image: riceTerracesImage, location: "Ubud, Bali", kind: "Nature", description: "An easy-to-place outdoor stop within an Ubud-focused day.", highlights: ["Walking stop", "Ubud location", "Fits a slower itinerary"], connections: ["Slow Bali wellness stay"] },
    { id: "BALI-GDE-05", name: "Seminyak coastline", image: honeymoonImage, location: "Seminyak, Bali", kind: "Coast", description: "Coastal time that can be kept open rather than scheduled as a fixed activity.", highlights: ["Beach time", "Coastal stay pairing", "Flexible evening"], connections: ["Seminyak Coastal Stay", "Slow Bali wellness stay"] },
    { id: "BALI-GDE-06", name: "Ubud temple quarter", image: templeImage, location: "Ubud, Bali", kind: "Culture", description: "A cluster of cultural stops that can be explored as part of an Ubud day.", highlights: ["Cultural stops", "Short local transfers", "Ubud base"], connections: ["Ubud private day car", "Bali Heritage Studio"] },
  ] satisfies DestinationExampleGuide[],
  vendors: [
    { id: "BALI-VND-01", name: "Ubud Stay Collective", image: resortImage, location: "Ubud, Bali", description: "Accommodation partner for inland and coastal stay examples.", highlights: ["Garden suites", "Coastal rooms", "Family option"], connections: ["Ubud Garden Suites", "Seminyak Coastal Stay"], categories: ["Accommodation"], contact: "Made Sari", serviceCount: 2 },
    { id: "BALI-VND-02", name: "Island Wheels Bali", image: transferImage, location: "Denpasar, Bali", description: "Private transport partner for airport and day-car examples.", highlights: ["Airport transfers", "Private day car", "Party-size vehicle matching"], connections: ["Denpasar airport transfer", "Ubud private day car"], categories: ["Transport"], contact: "Adi Pratama", serviceCount: 2 },
    { id: "BALI-VND-03", name: "Bali Heritage Studio", image: templeImage, location: "Ubud, Bali", description: "Activity partner for cultural and inland walking visits.", highlights: ["Rice terrace walk", "Uluwatu visit", "Local host"], connections: ["Tegallalang rice terrace walk", "Uluwatu sunset visit"], categories: ["Activities"], contact: "Wayan Putra", serviceCount: 2 },
    { id: "BALI-VND-04", name: "Penida Coast Experiences", image: penidaImage, location: "Nusa Penida, Bali", description: "Island-day partner for boat, road and coastal-stop planning.", highlights: ["Island day", "Local road transfer", "Coastal viewpoints"], connections: ["Nusa Penida coastal day", "Kelingking overlook"], categories: ["Activities", "Transport"], contact: "Komang Dewi", serviceCount: 1 },
    { id: "BALI-VND-05", name: "Bali Ground Desk", image: baliCover, location: "Denpasar, Bali", description: "Operations contact for arrival support and multi-service handoffs.", highlights: ["Flight coordination", "Document checklist", "Ground handling"], connections: ["Denpasar flight coordination", "Bali arrival assistance", "Bali ground coordination"], categories: ["Flights", "Visa", "Ground handling"], contact: "Ayu Kartika", serviceCount: 3 },
  ] satisfies DestinationExampleVendor[],
  trips: [
    { id: "BALI-TRP-01", name: "Ubud & Penida family plan", image: riceTerracesImage, location: "Ubud · Nusa Penida", kind: "Proposal", customer: "Family travel example", travel: "April 2027 · dates open", status: "Draft", description: "An example proposal assembled from the Ubud and Penida package and linked services.", highlights: ["5-day itinerary", "Private transfers", "Island day"], connections: ["Ubud & Penida discovery", "Island Wheels Bali", "Penida Coast Experiences"] },
    { id: "BALI-TRP-02", name: "Bali coast arrival plan", image: honeymoonImage, location: "Seminyak, Bali", kind: "Booking", customer: "Couple travel example", travel: "May 2027 · dates open", status: "Planning", description: "An example booking handoff showing a coastal stay and airport transfer together.", highlights: ["Coastal stay", "Airport pickup", "Arrival coordination"], connections: ["Seminyak Coastal Stay", "Denpasar airport transfer", "Bali Ground Desk"] },
  ] satisfies DestinationExampleTrip[],
};
