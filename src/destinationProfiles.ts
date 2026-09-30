import baliTerraces from "./assets/bali/bali-rice-terraces-hero.jpg";
import baliTemple from "./assets/bali/ubud-temple.jpg";
import nusaPenida from "./assets/bali/nusa-penida.jpg";

export interface DestinationProfile {
  description: string;
  images: { src: string; alt: string; caption: string }[];
}

// Destination-owned presentation content. Package and service records remain linked separately.
const destinationProfiles: Record<string, DestinationProfile> = {
  "bali-indonesia": {
    description:
      "From the green rice terraces and temples of Ubud to warm coastal sunsets and island escapes, Bali brings nature, culture, and slower days together in one destination.",
    images: [
      { src: baliTerraces, alt: "Sunset over Bali's green rice terraces", caption: "Rice terraces" },
      { src: baliTemple, alt: "Temple architecture in Ubud", caption: "Ubud" },
      { src: nusaPenida, alt: "Coastline of Nusa Penida", caption: "Nusa Penida" },
    ],
  },
};

export function destinationProfileFor(id: string) {
  return destinationProfiles[id];
}
