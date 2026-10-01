/** Approved supplier tax rates live outside individual rate cards. Rates are decimal fractions. */
export interface SupplierTaxProfile {
  id: string;
  name: string;
  rate: number;
  approved: boolean;
  approvalSource: string;
  /** Finance-approved input tax credit treatment for agency cost calculations. */
  recoverable?: boolean | null;
}

const storageKey = "paryatech:supplier-tax-profiles:v1";

export function readSupplierTaxProfiles(): SupplierTaxProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
    return Array.isArray(value) ? value.filter((item): item is SupplierTaxProfile => Boolean(item && typeof item.id === "string" && typeof item.name === "string" && typeof item.rate === "number" && typeof item.approved === "boolean" && typeof item.approvalSource === "string")) : [];
  } catch { return []; }
}

export function saveSupplierTaxProfiles(profiles: SupplierTaxProfile[]): void {
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(profiles));
}

export function approvedSupplierTaxRate(profiles: SupplierTaxProfile[], id: string | null): number | null {
  return approvedSupplierTaxProfile(profiles, id)?.rate ?? null;
}

export function approvedSupplierTaxProfile(profiles: SupplierTaxProfile[], id: string | null): SupplierTaxProfile | null {
  const profile = profiles.find((item) => item.id === id);
  return profile?.approved && profile.approvalSource.trim() && Number.isFinite(profile.rate) && profile.rate >= 0 && profile.rate <= 1 ? profile : null;
}
