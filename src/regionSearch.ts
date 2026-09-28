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
    id: "bangkok-thailand",
    label: "Bangkok",
    country: "Thailand",
    group: "Southeast Asia",
    aliases: ["Bangkok", "Thailand", "BKK"],
    packageTerms: ["Bangkok", "Thailand"],
  },
  {
    id: "bhopal-india",
    label: "Bhopal, Madhya Pradesh",
    country: "India",
    group: "Central India",
    aliases: ["Bhopal", "Madhya Pradesh"],
    packageTerms: ["Bhopal", "Madhya Pradesh"],
  },
  {
    id: "bhubaneswar-india",
    label: "Bhubaneswar, Odisha",
    country: "India",
    group: "East India",
    aliases: ["Bhubaneswar", "Bhubaneshwar", "Odisha"],
    packageTerms: ["Bhubaneswar", "Bhubaneshwar", "Odisha"],
  },
  {
    id: "barcelona-spain",
    label: "Barcelona",
    country: "Spain",
    group: "Europe",
    aliases: ["Barcelona", "Spain"],
    packageTerms: ["Barcelona", "Spain"],
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
  if (!normalized) return [];

  return fallbackRegions
    .map((region) => {
      const values = [region.label, region.country, region.group, ...region.aliases].map((value) => value.toLowerCase());
      const prefixMatch = values.some((value) => value.split(/[\s,/-]+/).some((part) => part.startsWith(normalized)));
      const containsMatch = normalized.length > 1 && values.some((value) => value.includes(normalized));
      return { region, rank: prefixMatch ? 0 : containsMatch ? 1 : 2 };
    })
    .filter((result) => result.rank < 2)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 8)
    .map(({ region }) => region);
}

export const featuredRegions = fallbackRegions.filter((region) =>
  ["bengaluru-karnataka", "kerala-india", "bali-indonesia", "dubai-uae"].includes(region.id),
);

export function regionById(id: string | null): RegionSuggestion | undefined {
  return fallbackRegions.find((region) => region.id === id);
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
