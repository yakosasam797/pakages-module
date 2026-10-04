import { useState } from "react";
import { Button, EmptyState, FilterSelect, SearchField } from "@paryatech/design-system";
import type { DirectoryService, VendorServiceConnection } from "../data/vendorDirectory";
import type { Vendor } from "../data/vendors";
import { getDetailCard } from "../rateCard/cards";
import { IconPlus } from "../icons";
import { ServiceRateCardTable } from "./ServiceRateCardTable";

export function ServiceRateCardsPanel({ service, connections, vendors, canEdit, onOpenRateCard, onNewRateCard, initialVendorId = "all" }: {
  service: DirectoryService;
  connections: VendorServiceConnection[];
  vendors: Vendor[];
  canEdit: boolean;
  onOpenRateCard: (vendorId: string, rateCardId: string) => void;
  onNewRateCard?: (vendorId: string, serviceId: string) => void;
  initialVendorId?: string;
}) {
  const [query, setQuery] = useState("");
  const [vendorId, setVendorId] = useState(initialVendorId);
  const linkedVendors = vendors.filter((vendor) => connections.some((item) => item.vendorId === vendor.id) || vendor.id === service.profileVendorId);
  const cards = Array.from(new Map(connections.filter((item) => item.rateCardId && getDetailCard(item.rateCardId)).map((item) => [`${item.vendorId}:${item.rateCardId}`, item])).values());
  const filtered = cards.filter((item) => {
    const card = getDetailCard(item.rateCardId);
    const vendor = vendors.find((candidate) => candidate.id === item.vendorId);
    return (vendorId === "all" || item.vendorId === vendorId) && `${card?.name ?? item.rateCardName} ${card?.ref ?? ""} ${vendor?.name ?? ""}`.toLowerCase().includes(query.trim().toLowerCase());
  });
  const createVendorId = vendorId !== "all" ? vendorId : linkedVendors.length === 1 ? linkedVendors[0].id : "";
  const open = (id: string) => {
    const connection = filtered.find((item) => item.id === id);
    if (connection) onOpenRateCard(connection.vendorId, connection.rateCardId);
  };
  return <div className="service-rate-cards-panel">
    <div className="service-rate-cards-panel__toolbar">
      <SearchField fullWidth value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rate cards or vendors" aria-label="Search rate cards or vendors" />
      <FilterSelect label="Vendor" value={vendorId} onChange={setVendorId} options={[{ value: "all", label: "All vendors" }, ...linkedVendors.map((vendor) => ({ value: vendor.id, label: vendor.name }))]} />
      {canEdit && onNewRateCard ? <Button variant="primary" size="sm" disabled={!createVendorId} title={!createVendorId ? "Select a vendor to add their rate card" : undefined} onClick={() => onNewRateCard(createVendorId, service.id)}><IconPlus />Add rate card</Button> : null}
    </div>
    {filtered.length ? <ServiceRateCardTable key={`${vendorId}-${query}`} connections={filtered} vendors={vendors} activeId="" onSelect={open} onOpenRateCard={onOpenRateCard} serviceLocation={service.location} directNavigation /> : <EmptyState title={cards.length ? "No matching rate cards" : "No rate cards yet"} description={cards.length ? "Try another search or vendor." : "Select a vendor and add their rate card for this service."} />}
  </div>;
}
