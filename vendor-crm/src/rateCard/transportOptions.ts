import { calculatePrivateTransportQuote, localPackageOptions, suggestVehicleArrangements, type PrivateTransportQuote, type PrivateTransportTariff, type PrivateTransportTrip, type VehicleOffering } from "./privateTransport.ts";
import type { SupplierTaxProfile } from "./supplierTax";

export interface TransportCardOption { id: string; name: string; vendor: string; tariff: PrivateTransportTariff }
export interface ResolvedTransportOption extends TransportCardOption {
  input: PrivateTransportTrip;
  quote: PrivateTransportQuote;
}

/** Compare actual vendor-owned cards against one customer requirement. No rates are copied. */
export function findPrivateTransportOptions(cards: TransportCardOption[], offerings: VehicleOffering[], requirement: PrivateTransportTrip, taxProfiles: SupplierTaxProfile[] = []): ResolvedTransportOption[] {
  return cards.flatMap((card) => {
    const tariff = card.tariff;
    if (tariff.status !== "Active" || !tariff.sourceConfirmed || !requirement.date || requirement.date < tariff.validFrom || requirement.date > tariff.validTo) return [];
    const route = tariff.template === "fixed-transfer" ? tariff.routes.find((item) => item.from.trim().toLowerCase() === requirement.pickup.trim().toLowerCase() && item.to.trim().toLowerCase() === requirement.drop.trim().toLowerCase()) : undefined;
    if (tariff.template === "fixed-transfer" && !route) return [];
    const cardVehicles = offerings.filter((vehicle) => tariff.vehicleIds.includes(vehicle.id) && vehicle.vendorId === tariff.vendorId && vehicle.serviceIds.includes(tariff.serviceId));
    const arrangements = suggestVehicleArrangements(cardVehicles, requirement);
    const resolved = arrangements.flatMap((vehicleAllocations) => {
      const input = { ...requirement, vehicleAllocations, vehicleId: vehicleAllocations[0].vehicleId, vehicleCount: vehicleAllocations[0].quantity, routeId: route?.id ?? "" };
      const pkg = localPackageOptions(tariff, input)[0];
      if (pkg) input.packageId = pkg.id;
      const quote = calculatePrivateTransportQuote(tariff, cardVehicles, input, taxProfiles);
      return quote.commercialAmount != null && !quote.blockers.length ? [{ ...card, input, quote }] : [];
    });
    return resolved.sort((a, b) => (a.quote.commercialAmount ?? Infinity) - (b.quote.commercialAmount ?? Infinity)).slice(0, 1);
  }).sort((a, b) => (a.quote.commercialAmount ?? Infinity) - (b.quote.commercialAmount ?? Infinity));
}
