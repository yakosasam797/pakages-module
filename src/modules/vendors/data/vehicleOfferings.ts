import { VEHICLE_OFFERINGS } from "./privateTransportFixtures";
import type { VehicleOffering } from "../rateCard/privateTransport";

const key = "paryatech:vehicle-offerings:v1";

export function readVehicleOfferings(): VehicleOffering[] {
  if (typeof window === "undefined") return VEHICLE_OFFERINGS;
  try {
    const stored = JSON.parse(window.localStorage.getItem(key) || "null");
    if (Array.isArray(stored) && stored.every((item) => item && typeof item.id === "string" && typeof item.vendorId === "string" && Array.isArray(item.serviceIds))) {
      const merged = stored.map((item: VehicleOffering) => {
      const seed = VEHICLE_OFFERINGS.find((offering) => offering.id === item.id);
      const oldDemoCoach = ["city-coach", "coast-coach"].includes(item.id) && item.passengerSeats === 27 && item.mediumBags === 20;
      return { ...seed, ...item, passengerSeats: oldDemoCoach ? seed?.passengerSeats ?? item.passengerSeats : item.passengerSeats, mediumBags: oldDemoCoach ? seed?.mediumBags ?? item.mediumBags : item.mediumBags, largeBags: "largeBags" in item ? item.largeBags : seed?.largeBags ?? null, cabinBags: "cabinBags" in item ? item.cabinBags : seed?.cabinBags ?? null };
      });
      return [...merged, ...VEHICLE_OFFERINGS.filter((seed) => !merged.some((item) => item.id === seed.id))];
    }
  } catch { /* Seed data is still usable. */ }
  return VEHICLE_OFFERINGS;
}

export function saveVehicleOfferings(offerings: VehicleOffering[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(offerings));
}
