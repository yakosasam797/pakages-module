import { getDetailCard, listDetailCards } from "../rateCard/cards";
import type { VendorServiceConnection } from "./vendorDirectory";

/** Discovery references the existing vendor-owned records; it never copies tariffs. */
export function serviceRateCardConnections(serviceId: string, existing: VendorServiceConnection[]): VendorServiceConnection[] {
  const cards = listDetailCards().flatMap((seed): VendorServiceConnection[] => {
    const card = getDetailCard(seed.id) ?? seed;
    const owner = card.privateTransport ?? card.activityTariff;
    const linkedServiceId = owner?.serviceId ?? card.serviceId;
    const vendorId = owner?.vendorId ?? card.vendorId;
    if (linkedServiceId !== serviceId || !vendorId) return [];
    const relationship = existing.find((item) => item.vendorId === vendorId && item.rateCardId === card.id) ?? existing.find((item) => item.vendorId === vendorId);
    return [{ id: relationship?.rateCardId === card.id ? relationship.id : `${vendorId}-${card.id}`, vendorId, serviceId, supplierType: relationship?.supplierType ?? "Direct supplier", productsCovered: relationship?.productsCovered ?? card.property, rateCardId: card.id, rateCardName: card.name, validity: card.validity }];
  });
  return [...existing.filter((connection) => !cards.some((card) => card.vendorId === connection.vendorId && (!connection.rateCardId || card.rateCardId === connection.rateCardId))), ...cards];
}
