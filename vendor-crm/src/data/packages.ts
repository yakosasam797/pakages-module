import type { StatusTone } from "@paryatech/design-system";
import type { ServiceCategory } from "./vendors";

export type PackageStatus = "live" | "reprice" | "draft";

export interface VendorPackage {
  id: string;
  name: string;
  detail: string;
  summary: string;
  services: string;
  serviceTypes: ServiceCategory[];
  pricedFrom: string;
  pricedFromKind: string;
  sellPrice: string;
  status: PackageStatus;
  /** Banner / hero photo used as the package thumb in the list */
  imageUrl: string;
  imageAlt: string;
}

export const PACKAGE_STATUS_LABEL: Record<PackageStatus, string> = {
  live: "Live",
  reprice: "Re-price",
  draft: "Draft",
};

export const PACKAGE_STATUS_TONE: Record<PackageStatus, StatusTone> = {
  live: "done",
  reprice: "progress",
  draft: "open",
};

/** Cropped Unsplash banners — distinct scenes so staff can scan by image */
const thumb = (id: string, w = 96, h = 96) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const VENDOR_PACKAGES: VendorPackage[] = [
  {
    id: "pkg-1",
    name: "Kerala Backwaters Escape",
    detail: "4N · Kochi–Alleppey",
    summary: "A relaxed Kerala journey through Fort Kochi, Alleppey and Kumarakom, combining heritage neighbourhoods, private transfers, a backwater houseboat and a lakeside stay. The daily structure is reusable, while suppliers, flight schedules and final timings are confirmed for each booking.",
    services: "Lake Resort 2N · houseboat 1N · transfer",
    serviceTypes: ["Accommodation", "Transport"],
    pricedFrom: "Accom. 2026–27",
    pricedFromKind: "Rate card",
    sellPrice: "₹68,400",
    status: "live",
    imageUrl: thumb("photo-1602216056096-3b40cc0c9944"),
    imageAlt: "Houseboat on Kerala backwaters",
  },
  {
    id: "pkg-2",
    name: "Cardamom Trail Weekend",
    detail: "2N · Thekkady",
    summary: "A compact hill-country escape with a plantation stay, guided spice experience and flexible wildlife activity options.",
    services: "Hill Retreat 2N · tour · safari",
    serviceTypes: ["Accommodation", "Activities"],
    pricedFrom: "Accom. 2025–26",
    pricedFromKind: "Rate card",
    sellPrice: "₹32,800",
    status: "reprice",
    imageUrl: thumb("photo-1544735716-392fe2489ffa"),
    imageAlt: "Misty hill forest trail",
  },
  {
    id: "pkg-3",
    name: "Family Kochi Stay",
    detail: "3N · Kochi",
    summary: "A family-friendly Kochi base with a comfortable resort stay, private arrival transfer and an easy-paced city experience.",
    services: "Lake Resort 3N · city tour · transfer",
    serviceTypes: ["Accommodation", "Activities", "Transport"],
    pricedFrom: "Accom. 2026–27",
    pricedFromKind: "Rate card",
    sellPrice: "₹54,200",
    status: "live",
    imageUrl: thumb("photo-1582510003544-4d00b7f39d87"),
    imageAlt: "Chinese fishing nets at Kochi harbour",
  },
  {
    id: "pkg-4",
    name: "Spice Belt Day",
    detail: "Day · Munnar foothills",
    summary: "A flexible day journey through the Munnar foothills with plantation visits, a local lunch and private transport.",
    services: "Plantation tour · lunch · transfers",
    serviceTypes: ["Activities", "Transport"],
    pricedFrom: "Activity 2026",
    pricedFromKind: "Rate card",
    sellPrice: "₹8,900",
    status: "live",
    imageUrl: thumb("photo-1566073771259-6a8506099945"),
    imageAlt: "Spice plantation walkway",
  },
  {
    id: "pkg-5",
    name: "Hill Weekend Circuit",
    detail: "3N · Munnar–Thekkady",
    summary: "A short highland circuit joining Munnar and Thekkady with scenic drives, two stays and private intercity transfers.",
    services: "Hill 2N · Lake 1N · transfers",
    serviceTypes: ["Accommodation", "Transport"],
    pricedFrom: "Accom. 2025–26",
    pricedFromKind: "Rate card",
    sellPrice: "₹41,600",
    status: "reprice",
    imageUrl: thumb("photo-1506905925346-21bda4d32df4"),
    imageAlt: "Mountain hills at sunrise",
  },
  {
    id: "pkg-6",
    name: "Monsoon Lake Soft Launch",
    detail: "2N · Kochi",
    summary: "A draft monsoon stay designed around slow lake experiences, flexible indoor time and a guided seasonal walk.",
    services: "Lake Resort 2N · monsoon walk",
    serviceTypes: ["Accommodation", "Activities"],
    pricedFrom: "—",
    pricedFromKind: "Unpriced",
    sellPrice: "—",
    status: "draft",
    imageUrl: thumb("photo-1439066615861-d1af74d74000"),
    imageAlt: "Lake shore in monsoon light",
  },
  {
    id: "pkg-7",
    name: "Corporate Offsite Kochi",
    detail: "2N · Kochi",
    summary: "A practical two-night offsite structure with meeting space, group transfers and room to add facilitated team activities.",
    services: "Lake 2N · meeting room · transfers",
    serviceTypes: ["Accommodation", "Transport"],
    pricedFrom: "Accom. 2026–27",
    pricedFromKind: "Rate card",
    sellPrice: "₹96,000",
    status: "live",
    imageUrl: thumb("photo-1497366216548-37526070297c"),
    imageAlt: "Meeting room for corporate offsite",
  },
  {
    id: "pkg-8",
    name: "Honeymoon Backwaters",
    detail: "5N · Alleppey–Kumarakom",
    summary: "A private backwater itinerary pairing an overnight houseboat experience with a longer lakeside resort stay and curated dining.",
    services: "Houseboat 2N · Lake 3N · dinner",
    serviceTypes: ["Accommodation", "Cruise"],
    pricedFrom: "Accom. 2026–27",
    pricedFromKind: "Rate card",
    sellPrice: "₹1,12,500",
    status: "live",
    imageUrl: thumb("photo-1571896349842-33c89424de2d"),
    imageAlt: "Resort pool overlooking water",
  },
];

export function packageStats(packages: VendorPackage[] = VENDOR_PACKAGES) {
  const live = packages.filter((p) => p.status === "live").length;
  const reprice = packages.filter((p) => p.status === "reprice").length;
  return { live, reprice, total: packages.length };
}
