/** Distinct supplier drafts for legacy discovery rows that reused another vendor's card. */
export const SUPPLIER_RATE_FIXTURES = [
  { connectionId: "taj-lake-heritage", id: "rc-palace-heritage", vendorId: "kerala-heritage", serviceId: "taj-lake-palace", name: "Palace stay tariff 2026–27", service: "Accommodation", validFrom: "2026-04-01", validTo: "2027-03-31" },
  { connectionId: "taj-lake-horizon", id: "rc-palace-horizon", vendorId: "horizon", serviceId: "taj-lake-palace", name: "Rajasthan DMC rates", service: "Accommodation", validFrom: "2026-04-01", validTo: "2027-03-31" },
  { connectionId: "taj-bekal-coastal", id: "rc-bekal-coastal", vendorId: "coastal", serviceId: "taj-bekal", name: "Bekal direct tariff", service: "Accommodation", validFrom: "2026-04-01", validTo: "2027-03-31" },
  { connectionId: "taj-bekal-wanderlust", id: "rc-bekal-wanderlust", vendorId: "wanderlust", serviceId: "taj-bekal", name: "Bekal contracted rates", service: "Accommodation", validFrom: "2026-04-01", validTo: "2027-03-31" },
  { connectionId: "taj-bekal-horizon", id: "rc-bekal-horizon", vendorId: "horizon", serviceId: "taj-bekal", name: "Seasonal hotel allotment", service: "Accommodation", validFrom: "2026-10-01", validTo: "2027-03-31" },
  { connectionId: "lake-wanderlust", id: "rc-lake-wanderlust", vendorId: "wanderlust", serviceId: "example-lake", name: "Backwater stay rates", service: "Accommodation", validFrom: "2026-04-01", validTo: "2027-03-31" },
  { connectionId: "hill-horizon", id: "rc-hill-horizon", vendorId: "horizon", serviceId: "example-hill", name: "Munnar winter rates", service: "Accommodation", validFrom: "2026-10-01", validTo: "2027-03-31" },
  { connectionId: "visa-horizon", id: "rc-visa-horizon", vendorId: "horizon", serviceId: "uae-visa", name: "UAE visa handling", service: "Visa", validFrom: "2026-04-01", validTo: "2026-09-30" },
] as const;
