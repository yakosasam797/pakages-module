import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import {
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  EmptyState,
  IconButton,
  ListBulkBar,
  Pagination,
  SearchField,
  TabBar,
  type CheckboxState,
  type TabItem,
} from "@paryatech/design-system";
import { getVendorService } from "../data/services";
import { findLocationSuggestions, getLocationSuggestions, matchesLocation, type LocationSuggestion } from "../data/locationSuggestions";
import {
  DIRECTORY_CATEGORIES,
  DIRECTORY_SERVICES,
  SUPPLIER_TYPES,
  VENDOR_SERVICE_CONNECTIONS,
  type DirectoryCategory,
  type DirectoryService,
  type SupplierType,
  type VendorServiceConnection,
} from "../data/vendorDirectory";
import { visibleVendorsForRole, type Vendor } from "../data/vendors";
import { can, type OrgRole } from "../permissions";
import type { PageNavigationChange } from "../pageNavigation";
import { BED_LABEL, formatMoney, getDetailCard, listCreatedPrivateTransportCards } from "../rateCard/cards";
import { readVehicleOfferings } from "../data/vehicleOfferings";
import type { RateCardDetail } from "../rateCard/types";
import {
  IconBed,
  IconBuilding,
  IconCard,
  IconCheck,
  IconChevronDown,
  IconClose,
  IconFilter,
  IconImage,
  IconImport,
  IconMore,
  IconPackages,
  IconPencil,
  IconPin,
  IconPlus,
  IconTrash,
  IconUser,
} from "../icons";
import { StatusChipWithDot } from "./StatusChipWithDot";
import { VendorFormModal } from "./VendorFormModal";
import { AnchoredImport } from "./AnchoredImport";
import { DashboardDataSheetFill } from "./DashboardDataSheet";
import { SummaryStrip, type SummaryField } from "./SummaryStrip";
import { ServiceTestRate } from "./ServiceTestRate";
import { ServiceRateCardTable } from "./ServiceRateCardTable";
import { TransportRateDetails, TransportTestRate } from "./TransportRateWorkspace";
import { RegionalTransportRates, RegionalTransportTest } from "./RegionalTransportWorkspace";
import { PrivateTransportRates, PrivateTransportTest } from "./PrivateTransportWorkspace";
import { VehicleOfferingsPanel } from "./VehicleOfferingsPanel";
import { ServicePolicies } from "./ServicePolicies";
import { ServiceTypeIcon, ServiceTypeLabel, ServiceTypeList } from "./ServiceTypeLabel";
import { NewServicePage } from "./NewServicePage";
import { VendorLocationSearch } from "./VendorLocationSearch";
import "./VendorsListPage.css";

type Perspective = "vendors" | "services";
const DIRECTORY_PAGE_SIZE = 6;
type ServiceDetailTab = "overview" | "vendors" | "test-rate" | "policies";

type VendorDirectoryRow = {
  vendor: Vendor;
  connections: VendorServiceConnection[];
  regionsServed: string[];
  matchedThrough?: string;
};

type ServiceDirectoryRow = {
  service: DirectoryService;
  connections: VendorServiceConnection[];
  providedBy?: string;
};

const DEFAULT_VENDOR_IMAGE = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=160&h=160&q=80";

function DirectoryEntity({ vendor, imageUrl, imageAlt, title, subtitle, match, onClick }: {
  vendor?: Vendor;
  imageUrl?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  match?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="directory-entity" onClick={onClick} aria-label={`Open ${title}`}>
      {vendor || imageUrl ? (
        <span className="vendors-sheet__image">
          <img
            src={imageUrl ?? vendor?.imageUrl ?? DEFAULT_VENDOR_IMAGE}
            alt={imageAlt ?? (vendor ? `${vendor.name} image` : `${title} image`)}
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
          />
        </span>
      ) : null}
        <span className="directory-entity__copy">
          <span className="directory-entity__title-row">
            <span className="directory-link directory-link--strong">{title}</span>
          </span>
        {subtitle && !match ? <span className="directory-entity__sub">{subtitle}</span> : null}
        {match ? <span className="directory-entity__match">{match}</span> : null}
      </span>
    </button>
  );
}

function rateCardStatusTone(card: RateCardDetail): "done" | "progress" | "blocked" | "open" {
  if (card.tone === "success") return "done";
  if (card.tone === "warning") return "progress";
  if (card.tone === "danger") return "blocked";
  return "open";
}

type ServiceRateSelectOption = {
  value: string;
  title: string;
};

function ServiceRateSelect({
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  options: ServiceRateSelectOption[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className={`service-rate-select${open ? " is-open" : ""} ${className}`.trim()} ref={menuRef}>
      <span className="service-rate-select__label">{label}</span>
      <button
        type="button"
        className="service-rate-select__trigger"
        aria-label={`${label}: ${selected?.title ?? "Choose"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="service-rate-select__copy">
          <strong>{selected?.title ?? "Choose"}</strong>
        </span>
        <IconChevronDown size={15} />
      </button>
      {open ? (
        <div className="service-rate-select__menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={option.value === value ? "is-selected" : undefined}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span className="service-rate-select__copy">
                <strong>{option.title}</strong>
              </span>
              {option.value === value ? <IconCheck size={14} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ServiceRateDetails({
  connections,
  vendors,
  onOpenRateCard,
}: {
  connections: VendorServiceConnection[];
  vendors: Vendor[];
  onOpenRateCard: (vendorId: string, rateCardId: string) => void;
}) {
  const [connectionId, setConnectionId] = useState(connections[0]?.id ?? "");
  const [seasonIndex, setSeasonIndex] = useState(0);
  const connection = connections.find((item) => item.id === connectionId) ?? connections[0];
  const card = connection ? getDetailCard(connection.rateCardId) : undefined;
  const safeSeasonIndex = card
    ? Math.min(seasonIndex, Math.max(0, card.seasons.length - 1))
    : 0;
  const rateCardOptions = connections.map((item) => {
    const itemVendor = vendors.find((candidate) => candidate.id === item.vendorId);
    return {
      value: item.id,
      title: itemVendor?.name ?? item.vendorId,
    };
  });
  const seasonOptions = card?.seasons.map((item, index) => ({
    value: String(index),
    title: `${item.name} · ${item.dates}`,
  })) ?? [];

  const guestRules = useMemo(() => {
    if (!card) return [];
    const grouped = new Map<string, {
      guest: string;
      age: string;
      bed: string;
      meal: string;
      amount: number | null;
      max: number;
      rooms: Set<string>;
    }>();
    card.guests.forEach(([roomId, guest, age, bed, meal, amount, max]) => {
      const key = [guest, age, bed, meal, amount ?? "missing", max].join("|");
      const current = grouped.get(key);
      if (current) current.rooms.add(roomId);
      else grouped.set(key, { guest, age, bed, meal, amount, max, rooms: new Set([roomId]) });
    });
    return Array.from(grouped.values());
  }, [card]);

  const linkedCards = <ServiceRateCardTable connections={connections} vendors={vendors} activeId={connection?.id ?? ""} onSelect={(id) => { setConnectionId(id); setSeasonIndex(0); }} onOpenRateCard={onOpenRateCard} />;

  if (!connection) {
    return (
      <EmptyState
        title="No rate details available"
        description="Link a vendor rate card to show pricing, guest rules, services, and activities here."
      />
    );
  }

  if (!card) {
    return (
      <section className="service-rate-details service-rate-details--empty">
        {linkedCards}
        <div>
          <h2>{connection.rateCardName}</h2>
          <p>The rate card is linked, but its detailed pricing structure is not available in this workspace.</p>
        </div>
        <Button variant="brand" size="sm" onClick={() => onOpenRateCard(connection.vendorId, connection.rateCardId)}>
          Open rate card
        </Button>
      </section>
    );
  }

  if (!connection.rateCardId) {
    return <EmptyState title="No rate card linked" description="Add a supplier rate card to test or display pricing for this service." />;
  }

  if (card.privateTransport) {
    return <div className="service-rate-details">
      {linkedCards}
      <div className="service-rate-details__record"><div className="service-rate-details__record-copy"><span className="service-rate-details__record-icon" aria-hidden="true"><IconCard size={16} /></span><div><span className="service-rate-details__record-label">Linked vendor rate card</span><div className="service-rate-details__record-title"><strong>{connection.rateCardName}</strong><StatusChipWithDot tone={rateCardStatusTone(card)}>{card.state}</StatusChipWithDot></div></div></div><div className="service-rate-details__record-actions"><Button variant="brand" size="sm" onClick={() => onOpenRateCard(connection.vendorId, connection.rateCardId)}>Open rate card</Button></div></div>
      <PrivateTransportRates card={card} editing={false} onChange={() => {}} />
    </div>;
  }
  if (card.regionalTransport) {
    return <div className="service-rate-details">
      {linkedCards}
      <div className="service-rate-details__record"><div className="service-rate-details__record-copy"><span className="service-rate-details__record-icon" aria-hidden="true"><IconCard size={16} /></span><div><span className="service-rate-details__record-label">Linked rate card</span><div className="service-rate-details__record-title"><strong>{connection.rateCardName}</strong><StatusChipWithDot tone={rateCardStatusTone(card)}>{card.state}</StatusChipWithDot></div></div></div><div className="service-rate-details__record-actions"><Button variant="brand" size="sm" onClick={() => onOpenRateCard(connection.vendorId, connection.rateCardId)}>Open rate card</Button></div></div>
      <RegionalTransportRates card={card} />
    </div>;
  }
  if (card.transport) {
    return <div className="service-rate-details">
      {linkedCards}
      <div className="service-rate-details__record">
        <div className="service-rate-details__record-copy">
          <span className="service-rate-details__record-icon" aria-hidden="true"><IconCard size={16} /></span>
          <div><span className="service-rate-details__record-label">Linked rate card</span><div className="service-rate-details__record-title"><strong>{connection.rateCardName}</strong><StatusChipWithDot tone={rateCardStatusTone(card)}>{card.state}</StatusChipWithDot></div></div>
        </div>
        <div className="service-rate-details__record-actions">
          <ServiceRateSelect className="service-rate-details__source" label="Rate card" value={connection.id} options={rateCardOptions} onChange={(value) => { setConnectionId(value); setSeasonIndex(0); }} />
          <Button variant="brand" size="sm" onClick={() => onOpenRateCard(connection.vendorId, connection.rateCardId)}>Open rate card</Button>
        </div>
      </div>
      <TransportRateDetails card={card} />
    </div>;
  }

  return (
    <div className="service-rate-details">
      {linkedCards}
      <div className="service-rate-details__record">
        <div className="service-rate-details__record-copy">
          <span className="service-rate-details__record-icon" aria-hidden="true"><IconCard size={16} /></span>
          <div>
            <span className="service-rate-details__record-label">Linked rate card</span>
            <div className="service-rate-details__record-title">
              <strong>{connection.rateCardName}</strong>
              <StatusChipWithDot tone={rateCardStatusTone(card)}>{card.state}</StatusChipWithDot>
            </div>
          </div>
        </div>
        <div className="service-rate-details__record-actions">
          <ServiceRateSelect
            className="service-rate-details__source"
            label="Rate card"
            value={connection.id}
            options={rateCardOptions}
            onChange={(value) => {
              setConnectionId(value);
              setSeasonIndex(0);
            }}
          />
          <Button variant="brand" size="sm" onClick={() => onOpenRateCard(connection.vendorId, connection.rateCardId)}>
            Open rate card
          </Button>
        </div>
      </div>

      <section className="service-rate-block" aria-labelledby="service-rate-pricing-title">
        <div className="service-rate-block__head">
          <h3 id="service-rate-pricing-title">{card.catLabels?.accommodation ?? "Stay / product pricing"}</h3>
          <ServiceRateSelect
            className="service-rate-details__season"
            label="Price set"
            value={String(safeSeasonIndex)}
            options={seasonOptions}
            onChange={(value) => setSeasonIndex(Number(value))}
          />
        </div>
        <div className="service-rate-rooms">
          <div className="service-rate-pricing-head" aria-hidden="true">
            <span>Room / product</span>
            <div
              className="service-rate-pricing-head__plans"
              style={{ "--service-plan-count": Math.max(1, card.meals.length) } as CSSProperties}
            >
              {card.meals.map((meal) => <span key={meal.code}>{meal.label}</span>)}
            </div>
          </div>
          {card.rooms.map((room, roomIndex) => (
            <article className="service-rate-room" key={room.id}>
              <div className="service-rate-room__identity">
                <span className="service-rate-room__icon" aria-hidden="true"><IconBed size={15} /></span>
                <div>
                  <h4>{room.name}</h4>
                  <p>{room.note}</p>
                  <span>Includes {room.baseOccupancy} · maximum {room.maxOccupancy} · {room.maxBeds} extra bed</span>
                </div>
              </div>
              <div
                className="service-rate-room__plans"
                style={{ "--service-plan-count": Math.max(1, card.meals.length) } as CSSProperties}
              >
                {card.meals.map((meal, mealIndex) => {
                  const amount = card.prices[roomIndex]?.[mealIndex]?.[safeSeasonIndex] ?? null;
                  const weekend = card.weekendExtra?.[roomIndex]?.[safeSeasonIndex] ?? null;
                  return (
                    <div className="service-rate-room__plan" data-label={meal.label} key={meal.code}>
                      <strong className="pt-mono">{formatMoney(amount, card.currency)}</strong>
                      {weekend != null ? <small>+{formatMoney(weekend, card.currency)} Fri–Sat</small> : <small>{card.mealBasis}</small>}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      {guestRules.length ? (
        <section className="service-rate-block" aria-labelledby="service-rate-guests-title">
          <div className="service-rate-block__head">
            <h3 id="service-rate-guests-title">{card.catLabels?.guests ?? "Extra guest and bed charges"}</h3>
          </div>
          <div className="service-rate-guest-list" role="table" aria-label="Guest and bed charges">
            <div className="service-rate-guest service-rate-guest--head" role="row">
              <span>Guest</span><span>Age</span><span>Bed</span><span>Charge</span><span>Maximum</span>
            </div>
            {guestRules.map((rule) => (
              <div className="service-rate-guest" role="row" key={`${rule.guest}-${rule.age}-${rule.bed}`}>
                <strong><IconUser size={14} />{rule.guest}</strong>
                <span>{rule.age}</span>
                <span><IconBed size={14} />{BED_LABEL[rule.bed] ?? rule.bed}</span>
                <span className="pt-mono">{rule.amount === 0 ? "Included" : formatMoney(rule.amount, card.currency)}</span>
                <span>{rule.max} · {rule.rooms.size === card.rooms.length ? "all rooms" : `${rule.rooms.size} rooms`}</span>
              </div>
            ))}
          </div>
          {card.guestNote ? <p className="service-rate-guest-note">{card.guestNote}</p> : null}
        </section>
      ) : null}

      <div className="service-rate-details__columns">
        <section className="service-rate-compact" aria-labelledby="service-rate-services-title">
          <div className="service-rate-compact__head">
            <h3 id="service-rate-services-title">{card.catLabels?.services ?? "Services"}</h3>
            <span>{card.services.length} items</span>
          </div>
          <div className="service-rate-compact__list">
            {card.services.length ? card.services.map((item) => (
              <div key={`${item.name}-${item.applies}`}>
                <div><strong>{item.name}</strong><span>{item.note}</span></div>
                <div><span>{item.applies} · {item.basis}</span><strong className="pt-mono">{item.amount === 0 ? "Included" : formatMoney(item.amount, card.currency)}</strong></div>
              </div>
            )) : <p className="service-rate-compact__empty">No services on this rate card.</p>}
          </div>
        </section>

        <section className="service-rate-compact" aria-labelledby="service-rate-activities-title">
          <div className="service-rate-compact__head">
            <h3 id="service-rate-activities-title">{card.catLabels?.activities ?? "Activities"}</h3>
            <span>{card.activities.length} items</span>
          </div>
          <div className="service-rate-compact__list">
            {card.activities.length ? card.activities.map((item) => (
              <div key={`${item.name}-${item.group}`}>
                <div><strong>{item.name}</strong><span>{item.note}</span></div>
                <div><span>{item.group} · {item.basis}</span><strong className="pt-mono">{formatMoney(item.amount, card.currency)}</strong></div>
              </div>
            )) : <p className="service-rate-compact__empty">No activities on this rate card.</p>}
          </div>
        </section>
      </div>

      {card.supplements.length ? (
        <section className="service-rate-block" aria-labelledby="service-rate-supplements-title">
          <div className="service-rate-block__head">
            <h3 id="service-rate-supplements-title">{card.catLabels?.special ?? "Supplements"}</h3>
          </div>
          <div className="service-rate-supplements">
            {card.supplements.map((item) => (
              <div key={`${item.name}-${item.applies}`}>
                <div><strong>{item.name}</strong><span>{item.applies}</span></div>
                <div><span>{item.basis} · {item.unit}</span><strong className="pt-mono">{formatMoney(item.amount, card.currency)}</strong></div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <details className="service-rate-disclosure">
        <summary>
          <strong>Stay rules, cancellation and policies</strong>
          <IconChevronDown size={16} />
        </summary>
        <div className="service-rate-disclosure__body">
          <section>
            <h3>Stay rules</h3>
            {card.rules.map(([name, applies, value, behavior]) => <div key={`${name}-${applies}`}><span><strong>{name}</strong><small>{applies}</small></span><span>{value} · {behavior}</span></div>)}
          </section>
          <section>
            <h3>Cancellation</h3>
            {card.cancel.map((item) => <div key={item.window}><span><strong>{item.window}</strong><small>{item.basis}</small></span><span>{item.charge}</span></div>)}
          </section>
          <section className="service-rate-disclosure__policies">
            <h3>Policies</h3>
            {card.policies.map((item) => <div key={item.id}><span><strong>{item.title}</strong><small>{item.category}</small></span><span>{item.summary}</span></div>)}
          </section>
        </div>
      </details>
    </div>
  );
}

function ServiceDirectoryDetail({
  service,
  vendors,
  canEdit,
  onOpenVendor,
  onOpenRateCard,
  onEdit,
}: {
  service: DirectoryService;
  vendors: Vendor[];
  canEdit: boolean;
  onOpenVendor: (id: string) => void;
  onOpenRateCard: (vendorId: string, rateCardId: string) => void;
  onEdit: () => void;
}) {
  const [tab, setTab] = useState<ServiceDetailTab>("overview");
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [vendorMenuId, setVendorMenuId] = useState<string | null>(null);
  const vendorMenuRef = useRef<HTMLDivElement>(null);
  const vendorIds = useMemo(() => new Set(vendors.map((vendor) => vendor.id)), [vendors]);
  const connections = useMemo(() => {
    const linked = VENDOR_SERVICE_CONNECTIONS.filter((connection) => connection.serviceId === service.id && vendorIds.has(connection.vendorId));
    const created = listCreatedPrivateTransportCards().filter((card) => card.privateTransport?.serviceId === service.id && vendorIds.has(card.privateTransport.vendorId)).map((card) => ({
      id: `${card.privateTransport!.vendorId}-${card.id}`, vendorId: card.privateTransport!.vendorId,
      serviceId: service.id, supplierType: "Direct supplier" as const,
      productsCovered: card.property, rateCardId: card.id, rateCardName: card.name,
      validity: `${card.privateTransport!.validFrom} – ${card.privateTransport!.validTo}`,
    }));
    if (linked.length || created.length || !vendorIds.has(service.profileVendorId)) return [...linked, ...created];
    return [{ id: `created-${service.id}`, vendorId: service.profileVendorId, serviceId: service.id, supplierType: "Direct supplier" as const, productsCovered: service.category, rateCardId: "", rateCardName: "No rate card linked", validity: "Not set" }];
  }, [service, vendorIds]);
  const transportCard = connections.map((connection) => getDetailCard(connection.rateCardId)).find((card) => card?.privateTransport || card?.transport || card?.regionalTransport);
  const vendorConnections = Array.from(new Map(connections.map((connection) => [connection.vendorId, connection])).values());
  const serviceProfile = getVendorService(service.serviceId);
  const connectedVendorIds = vendorConnections.map((connection) => connection.vendorId);
  const linkedRateCardCount = new Set(connections.map((connection) => connection.rateCardId).filter(Boolean)).size;
  const mediaItems = serviceProfile?.media ?? [];
  const primaryMediaCount = mediaItems.filter((item) => item.usedInBanner).length;
  const serviceSummary: SummaryField[] = [
    {
      id: "location",
      label: "Base location",
      value: service.location,
      note: service.category,
      icon: <IconPin size={15} />,
    },
    {
      id: "vendors",
      label: "Vendor coverage",
      value: vendorConnections.length,
      note: "Supplier relationships",
      icon: <IconBuilding size={15} />,
    },
    {
      id: "rate-cards",
      label: "Rate cards",
      value: linkedRateCardCount,
      note: "Linked pricing records",
      icon: <IconCard size={15} />,
    },
    {
      id: "media",
      label: "Media",
      value: mediaItems.length,
      note: `${primaryMediaCount} primary banner${primaryMediaCount === 1 ? "" : "s"}`,
      icon: <IconImage size={15} />,
    },
  ];
  const vendorHeaderState: CheckboxState = selectedVendorIds.length === 0
    ? "off"
    : selectedVendorIds.length === connectedVendorIds.length
      ? "on"
      : "indeterminate";
  const tabs: TabItem[] = [
    { id: "overview", label: "Overview" },
    { id: "vendors", label: "Vendors" },
    { id: "test-rate", label: "Test rate" },
    { id: "policies", label: "Policies" },
  ];

  useEffect(() => {
    if (!vendorMenuId) return;
    const closeMenu = (event: MouseEvent) => {
      if (!vendorMenuRef.current?.contains(event.target as Node)) setVendorMenuId(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVendorMenuId(null);
    };
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [vendorMenuId]);

  return (
    <div className="service-directory-detail">
      <header className="service-directory-detail__record">
        <div className="service-directory-detail__identity">
          {serviceProfile?.imageUrl ? <img className="service-directory-detail__image" src={serviceProfile.imageUrl} alt={`${service.name} primary view`} /> : null}
          <div className="service-directory-detail__identity-copy">
            <div className="service-directory-detail__title-row">
              <h1>{service.name}</h1>
            </div>
            <p>
              <IconPin size={14} />{service.location}
              <span aria-hidden="true">·</span>
              <span className="pt-mono">{service.serviceId.toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              {service.category}
            </p>
          </div>
        </div>
        <div className="service-directory-detail__aside">
          {canEdit ? <Button variant="primary" size="sm" onClick={onEdit}><IconPencil />Edit service</Button> : null}
        </div>
      </header>

      <div className="service-directory-detail__tabs">
        <TabBar items={tabs} value={tab} onValueChange={(value) => setTab(value as ServiceDetailTab)} aria-label="Service sections" />
      </div>

      {tab === "overview" ? (
        <div className="service-overview">
          <div className="service-overview__summary">
            <SummaryStrip title="Service overview" columns={4} fields={serviceSummary} />
          </div>

          <div className="service-detail-panels">
            <div className="service-detail-panels__layout">
              <section className="service-detail-panel" aria-labelledby="service-profile-title">
                <div className="service-detail-panel__head">
                  <h2 id="service-profile-title">Profile</h2>
                  {canEdit ? <Button variant="brand" size="sm"><IconPencil />Edit details</Button> : null}
                </div>
                <div className="service-detail-panel__body">
                  <dl className="service-detail-profile">
                    <div className="service-detail-profile__field"><dt>Service title</dt><dd>{service.name}</dd></div>
                    <div className="service-detail-profile__field"><dt>Service ID</dt><dd className="pt-mono">{service.serviceId.toUpperCase()}</dd></div>
                    <div className="service-detail-profile__field"><dt>Category</dt><dd>{serviceProfile?.profile.category ?? service.category}</dd></div>
                    {!serviceProfile ? <div className="service-detail-profile__field"><dt>Vendor</dt><dd>{vendors.find((vendor) => vendor.id === service.profileVendorId)?.name ?? "Vendor unavailable"}</dd></div> : null}
                    {service.attributes?.map((field) => <div className="service-detail-profile__field" key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}
                    {!service.attributes && <>
                      <div className="service-detail-profile__field"><dt>Duration</dt><dd>{serviceProfile?.profile.duration ?? "Service based"}</dd></div>
                      <div className="service-detail-profile__field"><dt>Age suitability</dt><dd>{serviceProfile?.profile.ageSuitability ?? "All ages"}</dd></div>
                      <div className="service-detail-profile__field"><dt>Difficulty</dt><dd>{serviceProfile?.profile.difficulty ?? "Not applicable"}</dd></div>
                      <div className="service-detail-profile__field"><dt>Seasonality</dt><dd>{serviceProfile?.profile.seasonality ?? "Available year-round"}</dd></div>
                    </>}
                    <div className="service-detail-profile__field"><dt>Base location</dt><dd>{service.location}</dd></div>
                    <div className="service-detail-profile__field"><dt>Search keywords</dt><dd>{serviceProfile?.profile.searchText ?? `${service.name} ${service.location}`}</dd></div>
                    <div className="service-detail-profile__field service-detail-profile__field--wide"><dt>Description</dt><dd>{service.description || serviceProfile?.about || "No description added yet."}</dd></div>
                    <div className="service-detail-profile__field"><dt>Included</dt><dd>{service.inclusions?.join(", ") || serviceProfile?.inclusions.join(", ") || "Not specified"}</dd></div>
                    <div className="service-detail-profile__field"><dt>Excluded</dt><dd>{service.exclusions?.join(", ") || serviceProfile?.profile.exclusions.join(", ") || "Not specified"}</dd></div>
                  </dl>
                </div>
              </section>

              <section className="service-detail-panel" aria-labelledby="service-media-title">
                <div className="service-detail-panel__head">
                  <h2 id="service-media-title">Media</h2>
                  <span className="service-detail-panel__count pt-mono">{mediaItems.length} image{mediaItems.length === 1 ? "" : "s"}</span>
                </div>
                <div className="service-detail-panel__body">
                  {mediaItems.length ? (
                    <ul className="service-detail-media">
                      {mediaItems.map((item) => (
                        <li key={item.id} className={item.usedInBanner ? "is-primary" : undefined}>
                          <div className="service-detail-media__image-wrap">
                            <img src={item.imageUrl} alt={item.imageAlt} width={420} height={240} />
                            {item.usedInBanner ? <span>Primary banner</span> : null}
                          </div>
                          <p>{item.title}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="service-detail-media__empty">No media uploaded yet.</p>}
                  {canEdit ? (
                    <div className="service-detail-media__actions">
                      <Button variant="brand" size="sm"><IconPencil />Edit media</Button>
                      <Button variant="primary" size="sm"><IconPlus />Upload media</Button>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
          {service.category === "Transport" ? <VehicleOfferingsPanel vendorId={service.profileVendorId} serviceId={service.id} canEdit={canEdit} /> : null}
        </div>
      ) : tab === "test-rate" ? (
        !connections.some((connection) => connection.rateCardId)
          ? <EmptyState title="No rate card linked" description="Add a supplier rate card before testing this service's price." />
          : transportCard?.privateTransport
          ? <PrivateTransportTest card={transportCard} />
          : transportCard?.regionalTransport
          ? <RegionalTransportTest card={transportCard} />
          : transportCard
          ? <TransportTestRate card={transportCard} />
          : <ServiceTestRate service={service} connections={connections} vendors={vendors} />
      ) : tab === "vendors" ? (
        <div className="service-vendors-overview">
          <section className="service-suppliers" aria-labelledby="service-suppliers-title">
            <div className="service-section-head">
              <h2 id="service-suppliers-title">Linked vendors</h2>
            </div>
            {vendorConnections.length === 0 ? (
              <EmptyState title="No vendors linked" description="Link a vendor to make this service available for costing." />
            ) : (
              <div className="service-directory-detail__sheet dashboard-table-end">
                <DataSheet className="service-suppliers-sheet" aria-label={`Vendors providing ${service.name}`}>
            <DataSheetHeader>
              <DataSheetCell check><Checkbox state={vendorHeaderState} onCheckedChange={(state) => setSelectedVendorIds(state === "on" ? connectedVendorIds : [])} label="Select all vendors" /></DataSheetCell>
              <DataSheetCell>Vendor</DataSheetCell>
              <DataSheetCell>{service.category === "Transport" ? "Service coverage" : "Supplier relationship"}</DataSheetCell>
              <DataSheetCell>{service.category === "Transport" ? "Vehicle offerings" : "Location"}</DataSheetCell>
              <DataSheetCell>{service.category === "Transport" ? "Rate cards" : "Rate card"}</DataSheetCell>
              <DataSheetCell className="service-suppliers-sheet__action">Action</DataSheetCell>
            </DataSheetHeader>
            {vendorConnections.map((connection) => {
              const vendor = vendors.find((item) => item.id === connection.vendorId);
              if (!vendor) return null;
              return (
                <DataSheetRow
                  key={connection.id}
                  className="data-row--interactive"
                  role="link"
                  tabIndex={0}
                  aria-label={`Open ${vendor.name}`}
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest("button, a, input, select, textarea")) return;
                    onOpenVendor(vendor.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onOpenVendor(vendor.id);
                    }
                  }}
                >
                  <DataSheetCell check><Checkbox state={selectedVendorIds.includes(vendor.id) ? "on" : "off"} onCheckedChange={(state) => setSelectedVendorIds((current) => state === "on" ? current.includes(vendor.id) ? current : [...current, vendor.id] : current.filter((id) => id !== vendor.id))} label={`Select ${vendor.name}`} /></DataSheetCell>
                  <DataSheetCell><DirectoryEntity vendor={vendor} title={vendor.name} subtitle={vendor.code} onClick={() => onOpenVendor(vendor.id)} /></DataSheetCell>
                  <DataSheetCell>{service.category === "Transport" ? service.location : <span className="directory-relationship"><strong>{connection.supplierType}</strong><span>{connection.productsCovered}</span></span>}</DataSheetCell>
                  <DataSheetCell>{service.category === "Transport" ? readVehicleOfferings().filter((item) => item.vendorId === vendor.id && item.serviceIds.includes(service.id)).map((item) => item.label).join(" / ") || "None yet" : <span className="vendors-sheet__location"><IconPin size={14} />{vendor.location}</span>}</DataSheetCell>
                  <DataSheetCell>{service.category === "Transport" ? <button type="button" className="directory-link service-suppliers-sheet__rate-card" onClick={() => onOpenVendor(vendor.id)} aria-label={`Open ${vendor.name} rate cards`}><IconCard size={16} aria-hidden="true" /><span>{connections.filter((item) => item.vendorId === vendor.id && item.rateCardId).length} rate card{connections.filter((item) => item.vendorId === vendor.id && item.rateCardId).length === 1 ? "" : "s"}</span></button> : connection.rateCardId ? <button type="button" className="directory-link service-suppliers-sheet__rate-card" onClick={() => onOpenRateCard(vendor.id, connection.rateCardId)} aria-label={`Open ${connection.rateCardName} for ${vendor.name}`}><IconCard size={16} aria-hidden="true" /><span>{connection.rateCardName}</span></button> : <span>No rate card linked</span>}</DataSheetCell>
                  <DataSheetCell className="service-suppliers-sheet__action">
                    <div
                      className="vendors-sheet__more"
                      ref={vendorMenuId === vendor.id ? vendorMenuRef : undefined}
                    >
                      <IconButton
                        label={`More actions for ${vendor.name}`}
                        aria-expanded={vendorMenuId === vendor.id}
                        aria-haspopup="menu"
                        onClick={() => setVendorMenuId((current) => current === vendor.id ? null : vendor.id)}
                      >
                        <IconMore />
                      </IconButton>
                      {vendorMenuId === vendor.id ? (
                        <div className="vendors-sheet__menu" role="menu">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setVendorMenuId(null);
                              onOpenVendor(vendor.id);
                            }}
                          >
                            Open vendor
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </DataSheetCell>
                </DataSheetRow>
              );
            })}
                <DashboardDataSheetFill columns={7} />
                </DataSheet>
                {selectedVendorIds.length > 0 ? <ListBulkBar label={`${selectedVendorIds.length} vendor${selectedVendorIds.length === 1 ? "" : "s"} selected`}><Button variant="brand" size="sm"><IconImport />Export</Button><Button variant="ghost" size="sm" onClick={() => setSelectedVendorIds([])}>Clear</Button></ListBulkBar> : null}
                <Pagination rangeLabel={`Showing 1–${vendorConnections.length} of ${vendorConnections.length} vendors`} page={1} pageCount={1} onPageChange={() => {}} />
              </div>
            )}
          </section>
        </div>
      ) : tab === "policies" ? (
        <ServicePolicies serviceName={service.name} category={service.category} />
      ) : null}
    </div>
  );
}

export function VendorsListPage({
  vendors,
  createdServices,
  onCreatedServicesChange,
  deletedServiceIds,
  onDeletedServiceIdsChange,
  orgRole,
  flash,
  onClearFlash,
  onOpenVendor,
  onAddVendor,
  onOpenRateCard,
  onNavigationContextChange,
  onVendorsChange,
}: {
  vendors: Vendor[];
  createdServices: DirectoryService[];
  onCreatedServicesChange: (next: DirectoryService[]) => void;
  deletedServiceIds: string[];
  onDeletedServiceIdsChange: (next: string[]) => void;
  orgRole: OrgRole;
  flash?: string | null;
  onClearFlash?: () => void;
  onOpenVendor: (id: string) => void;
  onAddVendor: () => void;
  onOpenRateCard: (vendorId: string, rateCardId: string) => void;
  onNavigationContextChange?: PageNavigationChange;
  onVendorsChange: (next: Vendor[], notice?: string) => void;
}) {
  const [perspective, setPerspective] = useState<Perspective>("vendors");
  const [openServiceId, setOpenServiceId] = useState<string | null>(null);
  const [creatingService, setCreatingService] = useState(false);
  const [editingService, setEditingService] = useState<DirectoryService | null>(null);
  const [deletingService, setDeletingService] = useState<DirectoryService | null>(null);
  const [createdNotice, setCreatedNotice] = useState("");
  const [serviceCategory, setServiceCategory] = useState<"all" | DirectoryCategory>("all");
  const [categoryFilters, setCategoryFilters] = useState<DirectoryCategory[]>([]);
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [supplierTypes, setSupplierTypes] = useState<SupplierType[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<"edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const canAdd = can(orgRole, "vendor.add");
  const canEdit = can(orgRole, "vendor.edit");
  const scoped = useMemo(() => visibleVendorsForRole(vendors, orgRole), [vendors, orgRole]);
  const scopedIds = useMemo(() => new Set(scoped.map((vendor) => vendor.id)), [scoped]);
  const scopedConnections = useMemo(() => [
    ...VENDOR_SERVICE_CONNECTIONS.filter((connection) => scopedIds.has(connection.vendorId) && !deletedServiceIds.includes(connection.serviceId)),
    ...createdServices.filter((service) => scopedIds.has(service.profileVendorId) && !deletedServiceIds.includes(service.id) && !DIRECTORY_SERVICES.some((seed) => seed.id === service.id)).map((service): VendorServiceConnection => ({
      id: `created-${service.id}`,
      vendorId: service.profileVendorId,
      serviceId: service.id,
      supplierType: "Direct supplier",
      productsCovered: service.category,
      rateCardId: "",
      rateCardName: "No rate card linked",
      validity: "Not set",
    })),
  ], [createdServices, deletedServiceIds, scopedIds]);
  const activeConnections = useMemo(() => scopedConnections.filter((connection) => supplierTypes.length === 0 || supplierTypes.includes(connection.supplierType)), [scopedConnections, supplierTypes]);
  const visibleServiceIds = useMemo(() => new Set(activeConnections.map((connection) => connection.serviceId)), [activeConnections]);
  const availableServices = useMemo(() => {
    const overrides = new Map(createdServices.map((service) => [service.id, service]));
    return [
      ...createdServices.filter((service) => !DIRECTORY_SERVICES.some((seed) => seed.id === service.id) && scopedIds.has(service.profileVendorId) && !deletedServiceIds.includes(service.id)),
      ...DIRECTORY_SERVICES.filter((service) => visibleServiceIds.has(service.id) && !deletedServiceIds.includes(service.id)).map((service) => overrides.get(service.id) ?? service),
    ];
  }, [createdServices, deletedServiceIds, scopedIds, visibleServiceIds]);
  const locationSuggestions = useMemo(() => getLocationSuggestions(scoped, availableServices), [scoped, availableServices]);
  const matchingLocations = useMemo(() => findLocationSuggestions(locationSuggestions, locationQuery), [locationSuggestions, locationQuery]);
  const activeService = openServiceId ? availableServices.find((service) => service.id === openServiceId) : undefined;
  const closeServiceDetail = useCallback(() => setOpenServiceId(null), []);
  const closeCreateService = useCallback(() => setCreatingService(false), []);
  const closeEditService = useCallback(() => setEditingService(null), []);

  useEffect(() => {
    if (creatingService || editingService) {
      onNavigationContextChange?.({
        backLabel: editingService && openServiceId ? "Back to service" : "Back to services",
        sectionLabel: "Services",
        title: editingService ? "Edit service" : "Add service",
        onBack: editingService ? closeEditService : closeCreateService,
      });
      return () => onNavigationContextChange?.(null);
    }
    if (!activeService) {
      onNavigationContextChange?.(null);
      return;
    }
    onNavigationContextChange?.({
      backLabel: "Back to services",
      sectionLabel: "Services",
      title: activeService.name,
      onBack: closeServiceDetail,
    });
    return () => onNavigationContextChange?.(null);
  }, [activeService, closeCreateService, closeEditService, closeServiceDetail, creatingService, editingService, onNavigationContextChange, openServiceId]);

  useEffect(() => {
    if (!deletingService) return;
    const focusFrame = requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(".service-delete-confirm__cancel")?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDeletingService(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { cancelAnimationFrame(focusFrame); document.removeEventListener("keydown", onKeyDown); };
  }, [deletingService]);

  useEffect(() => {
    if (!deleteId) return;
    const focusFrame = requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(".vendors-delete-confirm__cancel")?.focus());
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setDeleteId(null); };
    document.addEventListener("keydown", onKeyDown);
    return () => { cancelAnimationFrame(focusFrame); document.removeEventListener("keydown", onKeyDown); };
  }, [deleteId]);

  const viewTabs: TabItem[] = [
    { id: "vendors", label: "Vendors" },
    { id: "services", label: "Services" },
  ];

  const serviceCategoryTabs = DIRECTORY_CATEGORIES.map((category) => ({
    id: category,
    label: category === "all" ? "All services" : category,
  }));

  const vendorRows = useMemo<VendorDirectoryRow[]>(() => {
    const q = query.trim().toLowerCase();
    return scoped.flatMap((vendor) => {
      const connections = activeConnections.filter((connection) => connection.vendorId === vendor.id);
      const related = connections.map((connection) => availableServices.find((service) => service.id === connection.serviceId)).filter((service): service is DirectoryService => Boolean(service));
      if (categoryFilters.length > 0 && !related.some((service) => categoryFilters.includes(service.category))) return [];
      if (supplierTypes.length > 0 && connections.length === 0) return [];
      if (!matchesLocation(vendor.location, selectedLocation) && !related.some((service) => matchesLocation(service.location, selectedLocation))) return [];
      const directMatch = `${vendor.name} ${vendor.code} ${vendor.owner}`.toLowerCase().includes(q);
      const relatedMatch = q ? related.find((service) => `${service.name} ${service.category} ${service.location}`.toLowerCase().includes(q)) : undefined;
      if (q && !directMatch && !relatedMatch) return [];
      return [{ vendor, connections, regionsServed: [...new Set(related.map((service) => service.location))], matchedThrough: !directMatch && relatedMatch ? relatedMatch.name : undefined }];
    });
  }, [activeConnections, availableServices, categoryFilters, query, scoped, selectedLocation, supplierTypes.length]);

  const serviceRows = useMemo<ServiceDirectoryRow[]>(() => {
    const q = query.trim().toLowerCase();
    return availableServices.flatMap((service) => {
      if (serviceCategory !== "all" && service.category !== serviceCategory) return [];
      if (!matchesLocation(service.location, selectedLocation)) return [];
      const connections = activeConnections.filter((connection) => connection.serviceId === service.id);
      const relatedVendors = connections.map((connection) => scoped.find((vendor) => vendor.id === connection.vendorId)).filter((vendor): vendor is Vendor => Boolean(vendor));
      const directMatch = `${service.name} ${service.category} ${service.location}`.toLowerCase().includes(q);
      const vendorMatch = q ? relatedVendors.find((vendor) => `${vendor.name} ${vendor.code}`.toLowerCase().includes(q)) : undefined;
      if (q && !directMatch && !vendorMatch) return [];
      return [{ service, connections, providedBy: !directMatch && vendorMatch ? vendorMatch.name : undefined }];
    });
  }, [activeConnections, availableServices, query, scoped, selectedLocation, serviceCategory]);

  const rows = perspective === "vendors" ? vendorRows : serviceRows;
  const pageCount = Math.max(1, Math.ceil(rows.length / DIRECTORY_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const firstRow = (currentPage - 1) * DIRECTORY_PAGE_SIZE;
  const visibleVendorRows = vendorRows.slice(firstRow, firstRow + DIRECTORY_PAGE_SIZE);
  const visibleServiceRows = serviceRows.slice(firstRow, firstRow + DIRECTORY_PAGE_SIZE);
  const visibleRows = perspective === "vendors" ? visibleVendorRows : visibleServiceRows;
  const visibleRowIds = visibleRows.map((row) => perspective === "vendors" ? (row as VendorDirectoryRow).vendor.id : (row as ServiceDirectoryRow).service.id);
  const editVendor = editId ? vendors.find((vendor) => vendor.id === editId) ?? null : null;
  const deleteVendor = deleteId ? vendors.find((vendor) => vendor.id === deleteId) ?? null : null;

  useEffect(() => {
    if (!menuId && !filtersOpen) return;
    const onDocumentPointer = (event: MouseEvent) => {
      const node = event.target as Node;
      if (menuId && !menuRef.current?.contains(node)) setMenuId(null);
      if (filtersOpen && !filterRef.current?.contains(node)) setFiltersOpen(false);
    };
    document.addEventListener("mousedown", onDocumentPointer);
    return () => document.removeEventListener("mousedown", onDocumentPointer);
  }, [filtersOpen, menuId]);

  const selectedOnPage = visibleRowIds.filter((id) => selected.includes(id)).length;
  const headerState: CheckboxState = selectedOnPage === 0 ? "off" : selectedOnPage === visibleRowIds.length ? "on" : "indeterminate";
  const resetRows = () => { setSelected([]); setPage(1); };
  const toggleAll = (state: CheckboxState) => setSelected((current) => state === "on" ? [...new Set([...current, ...visibleRowIds])] : current.filter((id) => !visibleRowIds.includes(id)));
  const toggleRow = (id: string, state: CheckboxState) => setSelected((current) => state === "on" ? current.includes(id) ? current : [...current, id] : current.filter((item) => item !== id));
  const toggleSupplierType = (type: SupplierType) => { setSupplierTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]); resetRows(); };
  const toggleCategory = (type: DirectoryCategory) => { setCategoryFilters((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]); resetRows(); };
  const setBrowseBy = (id: string) => {
    const next = id as Perspective;
    setPerspective(next);
    if (next === "services") setCategoryFilters([]);
    resetRows();
  };
  const selectServiceCategory = (category: "all" | DirectoryCategory) => {
    setServiceCategory(category);
    resetRows();
  };
  const activeFilterCount = supplierTypes.length + (perspective === "vendors" ? categoryFilters.length : 0);

  if (editingService) {
    return <NewServicePage
      key={editingService.id}
      service={editingService}
      existingServices={availableServices}
      vendors={vendors}
      onCancel={closeEditService}
      onCreated={(updated) => {
        onCreatedServicesChange([updated, ...createdServices.filter((service) => service.id !== updated.id)]);
        setEditingService(null);
        setCreatedNotice(`${updated.name} updated.`);
      }}
    />;
  }

  if (activeService) {
    return (
      <ServiceDirectoryDetail
        service={activeService}
        vendors={scoped}
        canEdit={canEdit}
        onOpenVendor={onOpenVendor}
        onOpenRateCard={onOpenRateCard}
        onEdit={() => setEditingService(activeService)}
      />
    );
  }

  if (creatingService) {
    return <NewServicePage
      existingServices={availableServices}
      vendors={vendors}
      onCancel={closeCreateService}
      onCreated={(service) => {
        onCreatedServicesChange([service, ...createdServices]);
        setCreatingService(false);
        setServiceCategory("all");
        setQuery("");
        setLocationQuery("");
        setSelectedLocation(null);
        setSupplierTypes([]);
        setPage(1);
        setCreatedNotice(`${service.name} created.`);
      }}
    />;
  }

  return (
    <div className="vendors-page">
      <header className="vendors-page__head">
        <h1 className="vendors-page__title">
          {perspective === "vendors" ? "Vendors" : "Services"}
        </h1>
        <div className="vendors-page__actions">
          <AnchoredImport buttonLabel="Import" title={perspective === "vendors" ? "Import vendors" : "Import services"} />
          {canAdd ? <Button variant="primary" size="sm" onClick={perspective === "vendors" ? onAddVendor : () => setCreatingService(true)}><IconPlus />{perspective === "vendors" ? "Add vendor" : "Add service"}</Button> : null}
        </div>
      </header>

      {flash || createdNotice ? <div className="vendors-page__flash" role="status"><span>{flash || createdNotice}</span><button type="button" className="vendors-page__flash-dismiss" onClick={() => { onClearFlash?.(); setCreatedNotice(""); }}>Dismiss</button></div> : null}

      <div className="directory-view-tabs"><TabBar items={viewTabs} value={perspective} onValueChange={setBrowseBy} aria-label="Vendor directory view" /></div>

      {perspective === "services" ? (
        <div className="service-category-tabs" role="tablist" aria-label="Service categories">
          {serviceCategoryTabs.map((category) => (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={serviceCategory === category.id}
              className={serviceCategory === category.id ? "is-active" : undefined}
              onClick={() => selectServiceCategory(category.id)}
            >
              <span className="service-category-tabs__icon" aria-hidden="true">
                {category.id === "all" ? <IconPackages size={14} /> : <ServiceTypeIcon type={category.id} size={14} />}
              </span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="vendors-page__toolbar">
        <SearchField fullWidth className="vendors-page__search" value={query} onChange={(event) => { setQuery(event.target.value); resetRows(); }} placeholder={perspective === "vendors" ? "Search vendors" : "Search services"} aria-label={perspective === "vendors" ? "Search vendors" : "Search services"} />
        <VendorLocationSearch perspective={perspective} query={locationQuery} selected={selectedLocation} suggestions={matchingLocations} onQueryChange={(value) => { setLocationQuery(value); setSelectedLocation(null); resetRows(); }} onSelect={(place) => { setSelectedLocation(place); setLocationQuery(place?.name || ""); resetRows(); }} />
        <div className="directory-filters" ref={filterRef}>
          <Button variant="brand" size="sm" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><IconFilter />Filters{activeFilterCount > 0 ? ` ${activeFilterCount}` : ""}</Button>
          {filtersOpen ? (
            <div className="directory-filters__menu" role="dialog" aria-label="Directory filters">
              <div className="directory-filters__head"><div><strong>Filters</strong><span>Narrow this directory</span></div>{activeFilterCount > 0 ? <button type="button" onClick={() => { setSupplierTypes([]); setCategoryFilters([]); resetRows(); }}>Clear all</button> : null}</div>
              {perspective === "vendors" ? (
                <fieldset className="directory-filters__group">
                  <legend>Service category</legend>
                  {DIRECTORY_CATEGORIES.filter((item): item is DirectoryCategory => item !== "all").map((type) => <label key={type} className="directory-filters__option"><Checkbox state={categoryFilters.includes(type) ? "on" : "off"} onCheckedChange={() => toggleCategory(type)} label={type} /><span>{type}</span></label>)}
                </fieldset>
              ) : null}
              <fieldset className="directory-filters__group">
                <legend>Supplier type</legend>
                {SUPPLIER_TYPES.map((type) => <label key={type} className="directory-filters__option"><Checkbox state={supplierTypes.includes(type) ? "on" : "off"} onCheckedChange={() => toggleSupplierType(type)} label={type} /><span>{type}</span></label>)}
              </fieldset>
            </div>
          ) : null}
        </div>
      </div>

      <div className="vendors-page__sheet dashboard-table-end">
        {rows.length === 0 ? (
          <EmptyState title={`No ${perspective} match these filters`} description={orgRole === "Member" ? "Members only see assigned vendor relationships." : "Try another vendor, service, category, location, or supplier type."} />
        ) : (
          <>
            {perspective === "vendors" ? (
              <DataSheet className="vendors-sheet vendors-sheet--vendors" aria-label="Vendors">
                <DataSheetHeader>
                  <DataSheetCell check><Checkbox state={headerState} onCheckedChange={toggleAll} label="Select all vendors" /></DataSheetCell>
                  <DataSheetCell>Vendor</DataSheetCell><DataSheetCell>Regions served</DataSheetCell><DataSheetCell>Services offered</DataSheetCell><DataSheetCell>Action</DataSheetCell>
                </DataSheetHeader>
                {visibleVendorRows.map((row) => (
                  <DataSheetRow
                    key={row.vendor.id}
                    className="data-row--interactive"
                    role="link"
                    tabIndex={0}
                    aria-label={`Open ${row.vendor.name}`}
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("button, a, input, select, textarea")) return;
                      onOpenVendor(row.vendor.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpenVendor(row.vendor.id);
                      }
                    }}
                  >
                    <DataSheetCell check><Checkbox state={selected.includes(row.vendor.id) ? "on" : "off"} onCheckedChange={(state) => toggleRow(row.vendor.id, state)} label={`Select ${row.vendor.name}`} /></DataSheetCell>
                    <DataSheetCell><DirectoryEntity vendor={row.vendor} title={row.vendor.name} subtitle={row.vendor.code} match={row.matchedThrough ? `Matched through ${row.matchedThrough}` : undefined} onClick={() => onOpenVendor(row.vendor.id)} /></DataSheetCell>
                    <DataSheetCell><span className="vendors-sheet__regions"><IconPin size={14} />{row.regionsServed.length ? row.regionsServed.join(" · ") : "Not set"}</span></DataSheetCell>
                    <DataSheetCell>
                      <ServiceTypeList
                        compact
                        types={row.connections.map((connection) => availableServices.find((service) => service.id === connection.serviceId)?.category).filter((value): value is DirectoryCategory => Boolean(value))}
                        ariaLabel={`Services offered by ${row.vendor.name}`}
                        className="directory-services-offered"
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <div className="vendors-sheet__more" ref={menuId === row.vendor.id ? menuRef : undefined}>
                        <IconButton label={`More actions for ${row.vendor.name}`} aria-expanded={menuId === row.vendor.id} aria-haspopup="menu" onClick={() => setMenuId((current) => current === row.vendor.id ? null : row.vendor.id)}><IconMore /></IconButton>
                        {menuId === row.vendor.id ? <div className="vendors-sheet__menu" role="menu" aria-label={`Actions for ${row.vendor.name}`}>
                          <button type="button" role="menuitem" onClick={() => { onOpenVendor(row.vendor.id); setMenuId(null); }}><IconUser size={15} /><span>Open vendor</span></button>
                          {canEdit ? <>
                            <button type="button" role="menuitem" onClick={() => { setEditId(row.vendor.id); setModal("edit"); setMenuId(null); }}><IconPencil size={15} /><span>Edit vendor</span></button>
                            <button type="button" role="menuitem" className="vendors-sheet__menu-danger" onClick={() => { setDeleteId(row.vendor.id); setMenuId(null); }}><IconTrash size={15} /><span>Delete vendor</span></button>
                          </> : null}
                        </div> : null}
                      </div>
                    </DataSheetCell>
                  </DataSheetRow>
                ))}
                <DashboardDataSheetFill columns={5} />
              </DataSheet>
            ) : (
              <DataSheet className="vendors-sheet vendors-sheet--services" aria-label="Services">
                <DataSheetHeader>
                  <DataSheetCell check><Checkbox state={headerState} onCheckedChange={toggleAll} label="Select all services" /></DataSheetCell>
                  <DataSheetCell>Service</DataSheetCell><DataSheetCell>Service type</DataSheetCell><DataSheetCell>Location</DataSheetCell><DataSheetCell>Vendors</DataSheetCell><DataSheetCell>Action</DataSheetCell>
                </DataSheetHeader>
                {visibleServiceRows.map((row) => (
                  <DataSheetRow
                    key={row.service.id}
                    className="data-row--interactive"
                    role="link"
                    tabIndex={0}
                    aria-label={`Open ${row.service.name}`}
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("button, a, input, select, textarea")) return;
                      setOpenServiceId(row.service.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setOpenServiceId(row.service.id);
                      }
                    }}
                  >
                    <DataSheetCell check><Checkbox state={selected.includes(row.service.id) ? "on" : "off"} onCheckedChange={(state) => toggleRow(row.service.id, state)} label={`Select ${row.service.name}`} /></DataSheetCell>
                    <DataSheetCell><DirectoryEntity imageUrl={getVendorService(row.service.serviceId)?.imageUrl} imageAlt={`${row.service.name} primary view`} title={row.service.name} subtitle={row.service.category} match={row.providedBy ? `Provided by ${row.providedBy}` : undefined} onClick={() => setOpenServiceId(row.service.id)} /></DataSheetCell>
                    <DataSheetCell><ServiceTypeLabel type={row.service.category} /></DataSheetCell>
                    <DataSheetCell><span className="vendors-sheet__location"><IconPin size={14} />{row.service.location}</span></DataSheetCell>
                    <DataSheetCell><span className="directory-count">{new Set(row.connections.map((connection) => connection.vendorId)).size}</span></DataSheetCell>
                    <DataSheetCell>
                      <div
                        className="vendors-sheet__more"
                        ref={menuId === row.service.id ? menuRef : undefined}
                      >
                        <IconButton
                          label={`More actions for ${row.service.name}`}
                          aria-expanded={menuId === row.service.id}
                          aria-haspopup="menu"
                          onClick={() => setMenuId((current) => current === row.service.id ? null : row.service.id)}
                        >
                          <IconMore />
                        </IconButton>
                        {menuId === row.service.id ? (
                          <div className="vendors-sheet__menu" role="menu">
                            <button type="button" role="menuitem" onClick={() => { setOpenServiceId(row.service.id); setMenuId(null); }}>Open service</button>
                            {canEdit ? <>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setOpenServiceId(null);
                                setEditingService(row.service);
                                setMenuId(null);
                              }}
                            >
                              Edit service
                            </button>
                            <button type="button" role="menuitem" className="vendors-sheet__menu-danger" onClick={() => { setDeletingService(row.service); setMenuId(null); }}>Delete service</button>
                            </> : null}
                          </div>
                        ) : null}
                      </div>
                    </DataSheetCell>
                  </DataSheetRow>
                ))}
                <DashboardDataSheetFill columns={7} />
              </DataSheet>
            )}
            {selected.length > 0 ? <ListBulkBar label={`${selected.length} ${perspective === "vendors" ? "vendor" : "service"}${selected.length === 1 ? "" : "s"} selected`}><Button variant="brand" size="sm"><IconImport />Export</Button><Button variant="ghost" size="sm" onClick={() => setSelected([])}>Clear</Button></ListBulkBar> : null}
            <Pagination rangeLabel={`Showing ${firstRow + 1}–${Math.min(firstRow + DIRECTORY_PAGE_SIZE, rows.length)} of ${rows.length}`} page={currentPage} pageCount={pageCount} onPageChange={setPage} />
          </>
        )}
      </div>

      <VendorFormModal
        mode="edit"
        open={modal === "edit"}
        vendor={editVendor}
        vendors={vendors}
        orgRole={orgRole}
        onClose={() => { setModal(null); setEditId(null); }}
        onCreated={() => {}}
        onUpdated={(updated) => { onVendorsChange(vendors.map((vendor) => vendor.id === updated.id ? updated : vendor)); setModal(null); setEditId(null); }}
        onViewExisting={onOpenVendor}
      />
      {deleteVendor ? createPortal(
        <div className="pt-modal-overlay open" role="presentation" onClick={() => setDeleteId(null)}>
          <div className="pt-modal vendors-delete-confirm" role="alertdialog" aria-modal="true" aria-labelledby="delete-vendor-title" aria-describedby="delete-vendor-description" onClick={(event) => event.stopPropagation()}>
            <header className="pt-modal__head"><h2 className="pt-modal__title" id="delete-vendor-title">Delete {deleteVendor.name}?</h2><IconButton label="Close delete confirmation" onClick={() => setDeleteId(null)}><IconClose /></IconButton></header>
            <div className="pt-modal__body"><p id="delete-vendor-description">This vendor will be removed from the directory and its linked services.</p></div>
            <footer className="pt-modal__foot"><Button variant="ghost" size="sm" className="vendors-delete-confirm__cancel" onClick={() => setDeleteId(null)}>Keep vendor</Button><Button variant="primary" size="sm" className="vendors-delete-confirm__button" onClick={() => {
              onVendorsChange(vendors.filter((vendor) => vendor.id !== deleteVendor.id), `${deleteVendor.name} deleted.`);
              setSelected((current) => current.filter((id) => id !== deleteVendor.id));
              setDeleteId(null);
            }}><IconTrash />Delete vendor</Button></footer>
          </div>
        </div>,
        document.body,
      ) : null}
      {deletingService ? createPortal(
        <div className="pt-modal-overlay open" role="presentation" onClick={() => setDeletingService(null)}>
          <div className="pt-modal service-delete-confirm" role="alertdialog" aria-modal="true" aria-labelledby="delete-service-title" aria-describedby="delete-service-description" onClick={(event) => event.stopPropagation()}>
            <header className="pt-modal__head"><h2 className="pt-modal__title" id="delete-service-title">Delete service?</h2><IconButton label="Close delete confirmation" onClick={() => setDeletingService(null)}><IconClose /></IconButton></header>
            <div className="pt-modal__body"><p id="delete-service-description">Delete <strong>{deletingService.name}</strong> from the service directory? It will also disappear from vendor service lists. Rate cards stay with their vendors.</p></div>
            <footer className="pt-modal__foot"><Button variant="ghost" size="sm" className="service-delete-confirm__cancel" onClick={() => setDeletingService(null)}>Cancel</Button><Button variant="primary" size="sm" className="service-delete-confirm__button" onClick={() => {
              onCreatedServicesChange(createdServices.filter((service) => service.id !== deletingService.id));
              onDeletedServiceIdsChange([...new Set([...deletedServiceIds, deletingService.id])]);
              setSelected((current) => current.filter((id) => id !== deletingService.id));
              setCreatedNotice(`${deletingService.name} deleted.`);
              setDeletingService(null);
            }}><IconTrash />Delete service</Button></footer>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
