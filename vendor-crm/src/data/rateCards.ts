import type { StatusTone } from "@paryatech/design-system";

export type RateCardStatus = "published" | "expired" | "draft";
export type RateCardAction = "open" | "continue";

export interface RateCard {
  id: string;
  ref: string;
  title: string;
  category: string;
  currency: string;
  property: string;
  /** Property / fleet / activity banner used as the list thumb */
  propertyImageUrl: string;
  propertyImageAlt: string;
  validity: string;
  validityNote: string;
  status: RateCardStatus;
  coverageCount: number;
  coverageUnit: string;
  coverageDetail: string;
  action: RateCardAction;
}

const thumb = (id: string, w = 96, h = 96) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

/** Shared property imagery — same asset wherever this property appears */
export const PROPERTY_IMAGES: Record<
  string,
  { imageUrl: string; imageAlt: string }
> = {
  "Example Lake Resort": {
    imageUrl: thumb("photo-1566073771259-6a8506099945"),
    imageAlt: "Lake resort exterior",
  },
  "Example Hill Retreat": {
    imageUrl: thumb("photo-1506905925346-21bda4d32df4"),
    imageAlt: "Hill retreat in the mountains",
  },
  "Fleet — Kochi": {
    imageUrl: thumb("photo-1449965408869-eaa3f722e40d"),
    imageAlt: "Transfer fleet vehicle",
  },
  "Atlas Visa Services": {
    imageUrl: thumb("photo-1436491865332-7a61a109cc05"),
    imageAlt: "Passport and travel documents",
  },
};

function propertyMedia(name: string) {
  const hit = PROPERTY_IMAGES[name];
  return {
    property: name,
    propertyImageUrl: hit?.imageUrl ?? thumb("photo-1566073771259-6a8506099945"),
    propertyImageAlt: hit?.imageAlt ?? name,
  };
}

export const RATE_CARDS: RateCard[] = [
  {
    id: "rc-kochi-local-transfers", ref: "RC-KOCHI-LOCAL", title: "Kochi airport and local transfers",
    category: "Transport", currency: "INR", ...propertyMedia("Fleet — Kochi"),
    validity: "01 Oct 2026 – 31 Mar 2027", validityNote: "Fixed transfer · Local package",
    status: "draft", coverageCount: 2, coverageUnit: "fare methods", coverageDetail: "Supplier review needed", action: "continue",
  },
  {
    id: "rc-kerala-km-tariff", ref: "RC-KERALA-KM", title: "Kerala outstation kilometre tariff",
    category: "Transport", currency: "INR", ...propertyMedia("Fleet — Kochi"),
    validity: "01 Oct 2026 – 31 Mar 2027", validityNote: "Outstation per km · Daily hire",
    status: "draft", coverageCount: 2, coverageUnit: "fare methods", coverageDetail: "Supplier review needed", action: "continue",
  },
  {
    id: "rc-taj-goa-wanderlust",
    ref: "RC-TAJ-WANDERLUST",
    title: "Taj Goa contracted rates",
    category: "Accommodation",
    currency: "INR",
    ...propertyMedia("Example Lake Resort"),
    property: "Taj Exotica Resort & Spa",
    validity: "01 Oct 2026 – 30 Sep 2027",
    validityNote: "Supplier prices pending",
    status: "draft",
    coverageCount: 0,
    coverageUnit: "priced rooms",
    coverageDetail: "Enter supplier rates",
    action: "continue",
  },
  {
    id: "rc-taj-goa-coastal",
    ref: "RC-TAJ-COASTAL",
    title: "Winter FIT tariff",
    category: "Accommodation",
    currency: "INR",
    ...propertyMedia("Example Lake Resort"),
    property: "Taj Exotica Resort & Spa",
    validity: "01 Oct 2026 – 31 Mar 2027",
    validityNote: "Supplier prices pending",
    status: "draft",
    coverageCount: 0,
    coverageUnit: "priced rooms",
    coverageDetail: "Enter supplier rates",
    action: "continue",
  },
  {
    id: "rc-kerala-private-hire",
    ref: "RC-KERALA-HIRE",
    title: "Kerala private hire rates",
    category: "Transport",
    currency: "INR",
    ...propertyMedia("Fleet — Kochi"),
    validity: "01 Oct 2026 – 31 Mar 2027",
    validityNote: "Supplier confirmation pending",
    status: "draft",
    coverageCount: 5,
    coverageUnit: "fare methods",
    coverageDetail: "Supplier review needed",
    action: "continue",
  },
  {
    id: "rc-acc-2627",
    ref: "RC-2026-0114",
    title: "Accommodation tariff · 2026–27",
    category: "Accommodation",
    currency: "INR",
    ...propertyMedia("Example Lake Resort"),
    validity: "01 Apr 2026 – 31 Mar 2027",
    validityNote: "2 price sets",
    status: "published",
    coverageCount: 4,
    coverageUnit: "combinations",
    coverageDetail: "8 prices",
    action: "open",
  },
  {
    id: "rc-acc-2526",
    ref: "RC-2025-0114",
    title: "Accommodation tariff · 2025–26",
    category: "Accommodation",
    currency: "INR",
    ...propertyMedia("Example Lake Resort"),
    validity: "01 Apr 2025 – 31 Mar 2026",
    validityNote: "Superseded",
    status: "expired",
    coverageCount: 4,
    coverageUnit: "combinations",
    coverageDetail: "8 prices",
    action: "open",
  },
  {
    id: "rc-hill-2627",
    ref: "RC-2026-0218",
    title: "Hill Retreat tariff · 2026–27",
    category: "Accommodation",
    currency: "INR",
    ...propertyMedia("Example Hill Retreat"),
    validity: "01 Apr 2026 – 31 Mar 2027",
    validityNote: "3 price sets",
    status: "draft",
    coverageCount: 6,
    coverageUnit: "combinations",
    coverageDetail: "2 unpriced",
    action: "continue",
  },
  {
    id: "rc-air-2026",
    ref: "RC-2026-0301",
    title: "Airport transfer rates · 2026",
    category: "Transport",
    currency: "INR",
    ...propertyMedia("Fleet — Kochi"),
    validity: "01 Jan – 31 Dec 2026",
    validityNote: "Supplier terms need confirmation",
    status: "draft",
    coverageCount: 6,
    coverageUnit: "transfer fares",
    coverageDetail: "2 routes · 3 vehicles",
    action: "open",
  },
  {
    id: "rc-visa-uae",
    ref: "RC-2026-0301",
    title: "Visa services tariff · UAE",
    category: "Visa",
    currency: "INR",
    ...propertyMedia("Atlas Visa Services"),
    validity: "01 Apr – 30 Sep 2026",
    validityNote: "Single price set",
    status: "published",
    coverageCount: 4,
    coverageUnit: "products",
    coverageDetail: "1 unpriced",
    action: "open",
  },
];

export const STATUS_TONE: Record<RateCardStatus, StatusTone> = {
  published: "done",
  expired: "open",
  draft: "progress",
};

export const STATUS_LABEL: Record<RateCardStatus, string> = {
  published: "Published",
  expired: "Expired",
  draft: "Draft",
};

export const VENDOR = {
  code: "V-EXHOSP",
  location: "Kochi, India",
  updated: "Updated 3 days ago",
  name: "Example Hospitality",
  supplierState: "Active supplier",
  category: "Accommodation",
  ownerName: "Anjali Menon",
  ownerDesk: "Vendor desk",
  ownerInitials: "AM",
};
