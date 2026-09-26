export interface RegionSuggestion {
  id: string;
  label: string;
  country: string;
  group: string;
  aliases: string[];
  packageTerms: string[];
}

const fallbackRegions: RegionSuggestion[] = [
  {
    id: "bengaluru-karnataka",
    label: "Bengaluru, Karnataka",
    country: "India",
    group: "South India",
    aliases: ["Bangalore", "Bengaluru", "Karnataka", "BLR"],
    packageTerms: ["Bangalore", "Bengaluru", "Karnataka"],
  },
  {
    id: "bali-indonesia",
    label: "Bali",
    country: "Indonesia",
    group: "Southeast Asia",
    aliases: ["Bali", "Denpasar", "Indonesia"],
    packageTerms: ["Bali", "Denpasar", "Indonesia"],
  },
  {
    id: "dubai-uae",
    label: "Dubai",
    country: "United Arab Emirates",
    group: "Middle East",
    aliases: ["Dubai", "UAE", "United Arab Emirates"],
    packageTerms: ["Dubai", "UAE"],
  },
  {
    id: "himachal-pradesh-india",
    label: "Himachal Pradesh",
    country: "India",
    group: "North India",
    aliases: ["Himachal", "Manali", "Shimla", "North India"],
    packageTerms: ["Himachal", "Manali", "Shimla"],
  },
  {
    id: "rajasthan-india",
    label: "Rajasthan",
    country: "India",
    group: "Western India",
    aliases: ["Rajasthan", "Jaipur", "Udaipur", "Western India"],
    packageTerms: ["Rajasthan", "Jaipur", "Udaipur"],
  },
  {
    id: "kerala-india",
    label: "Kerala",
    country: "India",
    group: "South India",
    aliases: ["Kerala", "Kochi", "Munnar", "South India"],
    packageTerms: ["Kerala", "Kochi", "Munnar"],
  },
  {
    id: "delhi-india",
    label: "Delhi",
    country: "India",
    group: "North India",
    aliases: ["Delhi", "New Delhi", "NCR", "North India"],
    packageTerms: ["Delhi", "New Delhi", "NCR"],
  },
];

function localSearch(query: string) {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];

  return fallbackRegions
    .filter((region) =>
      [region.label, region.country, region.group, ...region.aliases]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    )
    .slice(0, 6);
}

/**
 * Searches the configured backend region endpoint when available. The local
 * catalog keeps the prototype usable until the production endpoint is wired.
 */
export async function searchRegions(query: string, signal?: AbortSignal): Promise<RegionSuggestion[]> {
  const endpoint = import.meta.env.VITE_REGION_SEARCH_API_URL?.trim();
  if (!endpoint) return localSearch(query);

  const url = new URL(endpoint, window.location.origin);
  url.searchParams.set("q", query.trim());
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Region search failed with ${response.status}`);

  const payload = await response.json();
  return Array.isArray(payload) ? payload : payload.results ?? [];
}
