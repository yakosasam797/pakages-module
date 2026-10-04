import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  EmptyState,
  FilterSelect,
  IconButton,
  LeadCell,
  Pagination,
  SearchField,
  StackCell,
  StackLine,
  TabBar,
  Tooltip,
  type CheckboxState,
  type TabItem,
} from "@paryatech/design-system";
import {
  RATE_CARDS,
  STATUS_LABEL,
  type RateCard,
  type RateCardStatus,
} from "../data/rateCards";
import { getVendor, type Vendor } from "../data/vendors";
import { VENDOR_BOOKINGS, vendorActivityForVendor } from "../data/vendorOverview";
import { COMPLIANCE_DOCS, PAYABLES } from "../data/vendorFinance";
import { VENDOR_CONVERSATIONS } from "../data/communications";
import { VENDOR_PACKAGES } from "../data/packages";
import { can, type OrgRole } from "../permissions";
import type { PageNavigationChange } from "../pageNavigation";
import { IconCard, IconCheck, IconFilter, IconMore, IconPin, IconPlus } from "../icons";
import { AnchoredImport } from "./AnchoredImport";
import { CommunicationPanel } from "./CommunicationPanel";
import { PackagesPanel } from "./PackagesPanel";
import { ServicesPanel } from "./ServicesPanel";
import { TasksPanel, type TaskLinkGroup } from "./TasksPanel";
import { VendorBookingsPanel } from "./VendorBookingsPanel";
import { VendorActivityPanel } from "./VendorActivityPanel";
import type { ActivityRow } from "./ActivityPanel";
import { VendorDocsPanel } from "./VendorDocsPanel";
import { VendorFinancePanel } from "./VendorFinancePanel";
import { VendorFormModal } from "./VendorFormModal";
import { VendorOverview } from "./VendorOverview";
import { VendorProfileHeader } from "./VendorProfileHeader";
import { DashboardDataSheetFill } from "./DashboardDataSheet";
import { SERVICE_TYPE_FILTERS, getVendorService, servicesForVendor, type VendorService } from "../data/services";
import { DIRECTORY_SERVICES, VENDOR_SERVICE_CONNECTIONS, linkVendorService, readCreatedDirectoryServices, type DirectoryService } from "../data/vendorDirectory";
import { getDetailCard, listCreatedActivityCards, listCreatedPrivateTransportCards, listCreatedSupplierCards } from "../rateCard/cards";
import { TRANSPORT_TEMPLATE_LABELS } from "../rateCard/privateTransport";
import type { DraftLinkedService } from "./AddServicesModal";
import { NewServicePage } from "./NewServicePage";
import { ServiceTypeIcon, ServiceTypeLabel, type ServiceTypeName } from "./ServiceTypeLabel";
import "./VendorRateCardsPage.css";

const BASE_TABS: TabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Services" },
  { id: "rate-cards", label: "Rate cards" },
  { id: "packages", label: "Packages" },
  { id: "bookings", label: "Bookings" },
  { id: "finance", label: "Finance" },
  { id: "docs", label: "Docs" },
  { id: "tasks", label: "Tasks" },
  { id: "comms", label: "Communications" },
  { id: "activity", label: "Activity" },
];

function vendorServiceFromDirectory(service: DirectoryService, vendor: Vendor): VendorService {
  const attributes = Object.fromEntries((service.attributes ?? []).map(({ label, value }) => [label, value]));
  const description = service.description?.trim() ?? "";
  const original = getVendorService(service.serviceId);
  return {
    id: service.serviceId,
    vendorId: vendor.id,
    name: service.name,
    type: service.category === "Activities" ? "Activity" : service.category,
    details: description || original?.details || (service.attributes ?? []).map(({ value }) => value).join(" · ") || service.location,
    about: description || original?.about || `${service.name} is supplied by ${vendor.name}.`,
    location: service.location,
    inclusions: service.inclusions ?? original?.inclusions ?? [],
    profile: {
      category: service.category,
      duration: attributes.Duration ?? original?.profile.duration ?? "Service based",
      ageSuitability: attributes["Age suitability"] ?? original?.profile.ageSuitability ?? "All ages",
      difficulty: attributes.Difficulty ?? original?.profile.difficulty ?? "Not applicable",
      seasonality: attributes.Seasonality ?? original?.profile.seasonality ?? "Available year-round",
      searchText: `${service.name} ${service.location} ${service.category}`,
      exclusions: service.exclusions ?? original?.profile.exclusions ?? [],
    },
    pricingLabel: original?.pricingLabel ?? "No pricing linked",
    rateCardCount: original?.rateCardCount ?? 0,
    rateCards: original?.rateCards ?? [],
    imageUrl: original?.imageUrl ?? "",
    imageAlt: original?.imageAlt ?? `${service.name} service image`,
    media: original?.media ?? [],
  };
}

const TASK_PACKAGE_IDS_BY_VENDOR: Record<string, string[]> = {
  trailmakers: ["pkg-1", "pkg-2"],
  exhosp: ["pkg-3", "pkg-7"],
  wanderlust: ["pkg-5", "pkg-8"],
  coastal: ["pkg-4", "pkg-6"],
};

function taskPackagesForVendor(vendorId: string) {
  const packageIds = TASK_PACKAGE_IDS_BY_VENDOR[vendorId] ?? [];
  return VENDOR_PACKAGES.filter((item) => packageIds.includes(item.id));
}

type RateCardStatusFilter = "all" | RateCardStatus;

const RATE_CARD_FILTER_OPTIONS: Array<{
  value: RateCardStatusFilter;
  label: string;
}> = [
  { value: "all", label: "All rate cards" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
];

const DRAFT_TAB_COPY: Record<string, { title: string; description: string; action?: string }> = {
  services: {
    title: "No services yet",
    description: "Add the first service to start building this vendor record.",
    action: "Add services",
  },
  "rate-cards": {
    title: "No rate cards yet",
    description: "Rate cards can be added after the vendor's first service is available.",
    action: "Add rate card",
  },
  packages: {
    title: "No packages yet",
    description: "Packages created with this vendor will appear here.",
    action: "Build package",
  },
  bookings: {
    title: "No bookings yet",
    description: "Bookings linked to this vendor will appear here.",
    action: "Add booking",
  },
  finance: {
    title: "No finance details yet",
    description: "Add bank details and finance terms for staff reference.",
    action: "Add bank details",
  },
  docs: {
    title: "No documents yet",
    description: "Upload the first compliance or vendor document.",
    action: "Upload document",
  },
  tasks: {
    title: "No tasks yet",
    description: "Create a task when this draft needs follow-up.",
    action: "Add task",
  },
  comms: {
    title: "No communications yet",
    description: "Messages linked to this vendor will appear here.",
    action: "Start communication",
  },
  activity: {
    title: "No activity yet",
    description: "Changes to this draft will appear here.",
  },
};

function DraftVendorTab({
  tab,
  canEdit,
  onAction,
  onNewCard,
}: {
  tab: string;
  canEdit: boolean;
  onAction?: () => void;
  onNewCard?: () => void;
}) {
  const copy = DRAFT_TAB_COPY[tab] ?? {
    title: "Nothing here yet",
    description: "Add details when this vendor is ready.",
  };

  return (
    <div className="vendor-draft-tab">
      <EmptyState
        title={copy.title}
        description={copy.description}
        action={
          copy.action && canEdit ? (
            <Button
              variant="primary"
              size="sm"
              onClick={tab === "rate-cards" ? onNewCard : onAction}
            >
              <IconPlus />
              {copy.action}
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}

function serviceTypeForTable(type: ServiceTypeName): ServiceTypeName {
  if (type === "Activities") return "Activity";
  if (type === "DMC") return "DMC/Ground handling";
  return type;
}

function DraftServicesPanel({
  services,
  canEdit,
  onAdd,
}: {
  services: DraftLinkedService[];
  canEdit: boolean;
  onAdd: () => void;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((service) => {
      const serviceType = serviceTypeForTable(service.type);
      if (typeFilter !== "all" && serviceType !== typeFilter) return false;
      if (!q) return true;
      return `${service.name} ${serviceType} ${service.location} ${service.sourceDetail}`
        .toLowerCase()
        .includes(q);
    });
  }, [query, services, typeFilter]);

  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === filtered.length && filtered.length > 0
        ? "on"
        : "indeterminate";

  const toggleAll = (state: CheckboxState) => {
    setSelected(state === "on" ? filtered.map((service) => service.id) : []);
  };

  const toggleRow = (id: string, state: CheckboxState) => {
    setSelected((current) =>
      state === "on"
        ? current.includes(id) ? current : [...current, id]
        : current.filter((item) => item !== id),
    );
  };

  const emptyTitle = services.length === 0 ? "No services added yet" : "No services match this search";
  const emptyDescription = services.length === 0
    ? "Use Add service to link the first service to this vendor."
    : "Try another service name or clear the type filter.";

  return (
    <div className="draft-services-panel dashboard-table-panel">
      <div className="vendor-page__toolbar services-panel__toolbar">
        <SearchField
          fullWidth
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
            setSelected([]);
          }}
          placeholder="Search service name"
          aria-label="Search service name"
        />
        <div className="vendor-page__tools">
          <FilterSelect
            tip="Filter by service type"
            label="Type"
            options={SERVICE_TYPE_FILTERS}
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              setPage(1);
              setSelected([]);
            }}
          />
        </div>
        {canEdit ? (
          <div className="vendor-page__actions">
            <AnchoredImport buttonLabel="Import services" />
            <Button variant="primary" size="sm" onClick={onAdd}>
              <IconPlus />
              Add service
            </Button>
          </div>
        ) : null}
      </div>

      <div className="vendor-page__sheet dashboard-table-end">
        <DataSheet className="services-sheet draft-services-sheet" aria-label="Vendor services">
          <DataSheetHeader>
            <DataSheetCell check>
              <Checkbox state={headerState} onCheckedChange={toggleAll} label="Select all services" />
            </DataSheetCell>
            <DataSheetCell>Service</DataSheetCell>
            <DataSheetCell>Service type</DataSheetCell>
            <DataSheetCell>Important details</DataSheetCell>
            <DataSheetCell>Media</DataSheetCell>
            <DataSheetCell>Current pricing</DataSheetCell>
          </DataSheetHeader>
          {filtered.map((service) => {
            const serviceType = serviceTypeForTable(service.type);
            return (
              <DataSheetRow key={service.id}>
                <DataSheetCell check>
                  <Checkbox
                    state={selected.includes(service.id) ? "on" : "off"}
                    onCheckedChange={(state) => toggleRow(service.id, state)}
                    label={`Select ${service.name}`}
                  />
                </DataSheetCell>
                <DataSheetCell>
                  <LeadCell
                    align="start"
                    icon={
                      <span className="draft-services-sheet__thumb" aria-hidden="true">
                        <ServiceTypeIcon type={serviceType} size={15} />
                      </span>
                    }
                    title={service.name}
                    subtitle={service.location}
                  />
                </DataSheetCell>
                <DataSheetCell><ServiceTypeLabel type={serviceType} /></DataSheetCell>
                <DataSheetCell><span className="services-sheet__details">{service.sourceDetail}</span></DataSheetCell>
                <DataSheetCell><span className="svc-media-cell__count">0 images</span></DataSheetCell>
                <DataSheetCell>
                  <StackCell>
                    <StackLine>Not priced</StackLine>
                    <StackLine muted><span className="services-sheet__rate-count pt-mono">0</span> Rate cards</StackLine>
                  </StackCell>
                </DataSheetCell>
              </DataSheetRow>
            );
          })}
          {filtered.length === 0 ? (
            <DataSheetRow className="services-sheet__empty-row">
              <DataSheetCell className="services-sheet__empty-cell">
                <div>
                  <strong>{emptyTitle}</strong>
                  <span>{emptyDescription}</span>
                </div>
              </DataSheetCell>
            </DataSheetRow>
          ) : null}
          <DashboardDataSheetFill columns={7} />
        </DataSheet>
        <Pagination
          rangeLabel={filtered.length ? `Showing 1–${filtered.length} of ${filtered.length} services` : "Showing 0 of 0 services"}
          page={page}
          pageCount={1}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export function VendorRateCardsPage({
  vendorId,
  vendors,
  createdServices,
  onCreatedServicesChange,
  deletedServiceIds,
  orgRole,
  flash,
  onClearFlash,
  onOpenCard,
  onNewCard,
  onNewRateCard,
  onVendorsChange,
  onOpenVendor,
  openServiceId = null,
  onOpenServiceIdChange,
  onNavigationContextChange,
}: {
  vendorId: string;
  vendors: Vendor[];
  createdServices: DirectoryService[];
  onCreatedServicesChange: (next: DirectoryService[]) => void;
  deletedServiceIds: string[];
  orgRole: OrgRole;
  flash?: string | null;
  onClearFlash?: () => void;
  onOpenCard: (id: string, vendorId?: string) => void;
  onNewCard?: () => void;
  onNewRateCard?: (vendorId: string, serviceId: string) => void;
  onVendorsChange: (next: Vendor[]) => void;
  onOpenVendor: (id: string) => void;
  openServiceId?: string | null;
  onOpenServiceIdChange?: (id: string | null) => void;
  onNavigationContextChange?: PageNavigationChange;
}) {
  const vendor = getVendor(vendorId, vendors) ?? getVendor("exhosp", vendors)!;
  const [tab, setTab] = useState("overview");
  const [financeBookingId, setFinanceBookingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [rateCardStatusFilter, setRateCardStatusFilter] =
    useState<RateCardStatusFilter>("all");
  const [rateCardServiceFilter, setRateCardServiceFilter] = useState("all");
  const [rateCardTypeFilter, setRateCardTypeFilter] = useState("all");
  const [rateCardValidityFilter, setRateCardValidityFilter] = useState("all");
  const [rateCardFilterOpen, setRateCardFilterOpen] = useState(false);
  const [rateCardMenu, setRateCardMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addServicesOpen, setAddServicesOpen] = useState(false);
  const [linkedActivityId, setLinkedActivityId] = useState("");
  const [linkRevision, setLinkRevision] = useState(0);
  const [packageDetailOpen, setPackageDetailOpen] = useState(false);
  const [documentRequestDraft, setDocumentRequestDraft] = useState<{
    id: number;
    body: string;
  } | null>(null);
  const [removedActivityIdsByVendor, setRemovedActivityIdsByVendor] = useState<Record<string, string[]>>({});
  const rateCardFilterRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!rateCardMenu) return;
    const close = () => setRateCardMenu(null);
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("scroll", close, true);
    };
  }, [rateCardMenu]);
  const canEdit = can(orgRole, "vendor.edit");
  const canAddTask = can(orgRole, "vendor.task.add");
  const isDraft = vendor.status === "Draft";
  const draftLinkedServices: DraftLinkedService[] = createdServices.filter((service) => service.profileVendorId === vendor.id && !deletedServiceIds.includes(service.id)).map((service) => ({
    id: service.id,
    name: service.name,
    type: service.category,
    location: service.location,
    source: "Manual entry",
    sourceDetail: service.description || service.attributes?.map(({ value }) => value).join(" · ") || "Service profile",
  }));

  const createdVendorServices = createdServices.filter((service) => service.profileVendorId === vendor.id && !deletedServiceIds.includes(service.id)).map((service) => vendorServiceFromDirectory(service, vendor));
  const deletedProfileServiceIds = new Set(DIRECTORY_SERVICES.filter((service) => deletedServiceIds.includes(service.id)).map((service) => service.serviceId));
  const overriddenProfileServiceIds = new Set(createdVendorServices.map((service) => service.id));
  const vendorServices = [...servicesForVendor(vendor.id).filter((service) => !deletedProfileServiceIds.has(service.id) && !overriddenProfileServiceIds.has(service.id)), ...createdVendorServices];
  const vendorRateCardRows = useMemo(() => {
    const linked = new Map<string, { id: string; card: RateCard; title: string; services: DirectoryService[] }>();
    VENDOR_SERVICE_CONNECTIONS.filter((connection) => connection.vendorId === vendor.id && connection.rateCardId).forEach((connection) => {
      const service = deletedServiceIds.includes(connection.serviceId)
        ? undefined
        : createdServices.find((item) => item.id === connection.serviceId) ?? DIRECTORY_SERVICES.find((item) => item.id === connection.serviceId);
      const card = RATE_CARDS.find((item) => item.id === connection.rateCardId);
      if (!card) return;
      const id = card.id;
      const current = linked.get(id);
      if (current) {
        if (service && !current.services.some((item) => item.id === service.id)) current.services.push(service);
      } else linked.set(id, { id, card, title: connection.rateCardName, services: service ? [service] : [] });
    });
    listCreatedPrivateTransportCards().filter((detail) => detail.privateTransport?.vendorId === vendor.id).forEach((detail) => {
      const tariff = detail.privateTransport!;
      const service = createdServices.find((item) => item.id === tariff.serviceId) ?? DIRECTORY_SERVICES.find((item) => item.id === tariff.serviceId);
      const card: RateCard = {
        id: detail.id, ref: detail.ref, title: detail.name, category: "Transport", currency: detail.currency,
        property: detail.property, propertyImageUrl: "", propertyImageAlt: "", validity: `${tariff.validFrom} – ${tariff.validTo}`,
        validityNote: TRANSPORT_TEMPLATE_LABELS[tariff.template], status: tariff.status.toLowerCase() as RateCardStatus,
        coverageCount: tariff.vehicleIds.length, coverageUnit: "vehicles", coverageDetail: "Vendor tariff", action: "continue",
      };
      linked.set(detail.id, { id: detail.id, card, title: detail.name, services: service ? [service] : [] });
    });
    listCreatedActivityCards().filter((detail) => detail.activityTariff?.vendorId === vendor.id).forEach((detail) => {
      const tariff = detail.activityTariff!;
      const service = createdServices.find((item) => item.id === tariff.serviceId) ?? DIRECTORY_SERVICES.find((item) => item.id === tariff.serviceId);
      const card: RateCard = {
        id: detail.id, ref: detail.ref, title: detail.name, category: "Activities", currency: detail.currency,
        property: detail.property, propertyImageUrl: "", propertyImageAlt: "", validity: `${tariff.validFrom} – ${tariff.validTo}`,
        validityNote: "Supplier cost", status: "draft", coverageCount: tariff.personRates.length + tariff.bookingRates.length + tariff.unitRates.length,
        coverageUnit: "prices", coverageDetail: "Vendor activity tariff", action: "continue",
      };
      linked.set(detail.id, { id: detail.id, card, title: detail.name, services: service ? [service] : [] });
    });
    listCreatedSupplierCards().filter((detail) => detail.vendorId === vendor.id).forEach((detail) => {
      const service = createdServices.find((item) => item.id === detail.serviceId) ?? DIRECTORY_SERVICES.find((item) => item.id === detail.serviceId);
      const card: RateCard = {
        id: detail.id, ref: detail.ref, title: detail.name, category: detail.service as RateCard["category"], currency: detail.currency,
        property: detail.property, propertyImageUrl: "", propertyImageAlt: "", validity: detail.validity,
        validityNote: "Supplier tariff", status: "draft", coverageCount: detail.rooms.length,
        coverageUnit: "products", coverageDetail: "Vendor tariff", action: "continue",
      };
      linked.set(detail.id, { id: detail.id, card, title: detail.name, services: service ? [service] : [] });
    });
    return Array.from(linked.values());
  }, [createdServices, deletedServiceIds, vendor.id]);
  const vendorActivity = vendorActivityForVendor(vendor).filter((row) => !removedActivityIdsByVendor[vendor.id]?.includes(row.id));
  const removeActivity = (id: string) => setRemovedActivityIdsByVendor((current) => ({
    ...current,
    [vendor.id]: [...new Set([...(current[vendor.id] ?? []), id])],
  }));
  const taskLinkGroups: TaskLinkGroup[] = [
      {
        id: "overview",
        label: "Overview",
        recordLabel: "Vendor record",
        options: [{ id: vendor.id, label: vendor.name, meta: vendor.code }],
      },
      {
        id: "services",
        label: "Services",
        recordLabel: "Service",
        options: vendorServices.map((service) => ({
          id: service.id,
          label: service.name,
          meta: `${service.type} · ${service.location}`,
        })),
      },
      {
        id: "rate-cards",
        label: "Rate cards",
        recordLabel: "Rate card",
        options: RATE_CARDS.map((card) => ({ id: card.id, label: card.title, meta: card.ref })),
      },
      {
        id: "packages",
        label: "Packages",
        recordLabel: "Package",
        options: taskPackagesForVendor(vendor.id).map((item) => ({ id: item.id, label: item.name, meta: item.detail })),
      },
      {
        id: "bookings",
        label: "Bookings",
        recordLabel: "Booking",
        options: VENDOR_BOOKINGS.filter((booking) => booking.vendorId === vendor.id).map((booking) => ({ id: booking.id, label: booking.title, meta: booking.ref })),
      },
      {
        id: "finance",
        label: "Finance",
        recordLabel: "Invoice",
        options: PAYABLES.filter((payable) => payable.vendorId === vendor.id).map((payable) => ({ id: payable.id, label: payable.invoice, meta: payable.booking })),
      },
      {
        id: "docs",
        label: "Documents",
        recordLabel: "Document",
        options: COMPLIANCE_DOCS.map((document) => ({ id: document.id, label: document.name, meta: document.reference })),
      },
      {
        id: "comms",
        label: "Communications",
        recordLabel: "Conversation",
        options: VENDOR_CONVERSATIONS.map((conversation) => ({
          id: conversation.id,
          label: conversation.name,
          meta: conversation.role,
        })),
      },
  ].filter((group) => group.options.length > 0);
  const activeService = openServiceId
    ? vendorServices.find((service) => service.id === openServiceId)
    : undefined;
  const tabs: TabItem[] = BASE_TABS;

  const setVendorTab = (next: string) => {
    if (next !== "services") onOpenServiceIdChange?.(null);
    if (next !== "packages") setPackageDetailOpen(false);
    if (next !== "comms") setDocumentRequestDraft(null);
    if (next !== "rate-cards") setRateCardFilterOpen(false);
    setTab(next);
  };

  const openActivityRelated = (row: ActivityRow) => {
    const key = row.module.trim().toLowerCase();
    if (row.relatedServiceId) {
      setVendorTab("services");
      onOpenServiceIdChange?.(row.relatedServiceId);
      return;
    }
    const target = key.includes("service") ? "services"
      : key.includes("vendor") ? "overview"
      : key.includes("booking") ? "bookings"
      : key.includes("rate") ? "rate-cards"
      : key.includes("package") ? "packages"
      : key.includes("finance") ? "finance"
      : key.includes("doc") ? "docs"
      : key.includes("task") ? "tasks"
      : key.includes("communication") ? "comms"
      : "overview";
    setVendorTab(target);
  };

  useEffect(() => {
    if (openServiceId) setTab("services");
  }, [openServiceId]);

  useEffect(() => {
    if (!rateCardFilterOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rateCardFilterRef.current?.contains(event.target as Node)) {
        setRateCardFilterOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRateCardFilterOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [rateCardFilterOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendorRateCardRows.filter((row) => {
      const detail = getDetailCard(row.card.id);
      const status = detail?.activityTariff ? detail.state.toLowerCase() : detail?.privateTransport?.status.toLowerCase() || row.card.status;
      const type = detail?.privateTransport?.template || row.card.category;
      const validity = detail?.activityTariff?.validTo || detail?.privateTransport?.validTo || (row.card.status === "expired" ? "2000-01-01" : "9999-12-31");
      if (rateCardStatusFilter !== "all" && status !== rateCardStatusFilter) {
        return false;
      }
      if (rateCardServiceFilter !== "all" && !row.services.some((service) => service.name === rateCardServiceFilter)) return false;
      if (rateCardTypeFilter !== "all" && type !== rateCardTypeFilter) return false;
      if (rateCardValidityFilter === "current" && validity < new Date().toISOString().slice(0, 10)) return false;
      if (rateCardValidityFilter === "expired" && validity >= new Date().toISOString().slice(0, 10)) return false;
      return (
        !q ||
        row.title.toLowerCase().includes(q) ||
        row.services.some((service) => `${service.name} ${service.location}`.toLowerCase().includes(q))
      );
    });
  }, [query, rateCardStatusFilter, rateCardServiceFilter, rateCardTypeFilter, rateCardValidityFilter, vendorRateCardRows]);

  const headerState: CheckboxState =
    selected.length === 0 ? "off" : selected.length === filtered.length && filtered.length > 0 ? "on" : "indeterminate";

  const toggleAll = (state: CheckboxState) => {
    if (state === "on") setSelected(filtered.map((row) => row.id));
    else setSelected([]);
  };

  const toggleRow = (id: string, state: CheckboxState) => {
    setSelected((current) => {
      if (state === "on") return current.includes(id) ? current : [...current, id];
      return current.filter((item) => item !== id);
    });
  };

  const openDocumentRequest = (
    documentName?: string,
    action?: "request-renewal" | "chase",
  ) => {
    const body = documentName
      ? action === "request-renewal"
        ? `Hi, could you please share a renewed copy of ${documentName} for ${vendor.name}? Thank you!`
        : `Hi, following up on ${documentName} for ${vendor.name}. Could you please send the completed document? Thank you!`
      : `Hi, could you please share the pending compliance documents for ${vendor.name} at your earliest convenience? Thank you!`;
    setDocumentRequestDraft({ id: Date.now(), body });
    setVendorTab("comms");
  };

  useEffect(() => {
    if (!addServicesOpen) return;
    onNavigationContextChange?.({
      backLabel: "Back to services",
      sectionLabel: "Services",
      title: "Add service",
      onBack: () => setAddServicesOpen(false),
    });
    return () => onNavigationContextChange?.(null);
  }, [addServicesOpen, onNavigationContextChange]);

  if (addServicesOpen) {
    return (
      <NewServicePage
        vendorId={vendor.id}
        vendors={vendors}
        existingServices={[...createdServices, ...DIRECTORY_SERVICES]}
        onCancel={() => setAddServicesOpen(false)}
        onCreated={(service) => {
          onCreatedServicesChange([service, ...createdServices]);
          if (service.profileVendorId !== vendor.id) {
            setAddServicesOpen(false);
            onOpenVendor(service.profileVendorId);
            return;
          }
          if (!isDraft) onOpenServiceIdChange?.(service.id);
          setAddServicesOpen(false);
          setTab("services");
        }}
      />
    );
  }

  return (
    <div className="vendor-page">
      {activeService || packageDetailOpen ? null : (
        <>
          <VendorProfileHeader
            code={vendor.code}
            location={vendor.location}
            name={vendor.name}
            status={vendor.status}
            canEdit={canEdit}
            onEdit={() => setEditProfileOpen(true)}
          />

          <div className="vendor-page__tabs">
            <TabBar items={tabs} value={tab} onValueChange={setVendorTab} aria-label="Vendor sections" />
          </div>
        </>
      )}

      {tab === "overview" ? (
        <VendorOverview
          vendor={vendor}
          activity={vendorActivity}
          onRemoveActivity={removeActivity}
          onOpenRelated={openActivityRelated}
          flash={flash}
          canEdit={canEdit}
          onJumpTab={(next) => {
            onClearFlash?.();
            setVendorTab(next);
          }}
          onEditProfile={() => setEditProfileOpen(true)}
        />
      ) : isDraft && tab === "services" ? (
        <DraftServicesPanel
          services={draftLinkedServices}
          canEdit={canEdit}
          onAdd={() => setAddServicesOpen(true)}
        />
      ) : isDraft ? (
        <DraftVendorTab
          tab={tab}
          canEdit={canEdit}
          onAction={tab === "services" ? () => setAddServicesOpen(true) : undefined}
          onNewCard={onNewCard}
        />
      ) : tab === "activity" ? (
        <VendorActivityPanel vendor={vendor} activity={vendorActivity} onRemoveActivity={removeActivity} onOpenRelated={openActivityRelated} />
      ) : tab === "services" ? (
        <><div className="vendor-page__link-activity">{canEdit ? <><label>Offer an existing activity <select value={linkedActivityId} onChange={(event) => setLinkedActivityId(event.target.value)}><option value="">Select activity</option>{[...readCreatedDirectoryServices(), ...DIRECTORY_SERVICES].filter((service) => service.category === "Activities" && service.profileVendorId !== vendor.id && !VENDOR_SERVICE_CONNECTIONS.some((connection) => connection.vendorId === vendor.id && connection.serviceId === service.id)).map((service) => <option key={service.id} value={service.id}>{service.name} · {service.location}</option>)}</select></label><button type="button" disabled={!linkedActivityId} onClick={() => { linkVendorService(vendor.id, linkedActivityId); setLinkedActivityId(""); setLinkRevision((value) => value + 1); }}>Link activity</button></> : null}</div><ServicesPanel
          key={`${vendor.id}-${linkRevision}`}
          vendorId={vendor.id}
          vendors={vendors}
          canEdit={canEdit}
          createdServices={createdVendorServices}
          deletedProfileServiceIds={[...deletedProfileServiceIds]}
          onAddService={() => setAddServicesOpen(true)}
          openServiceId={openServiceId}
          onOpenServiceIdChange={(id) => {
            onOpenServiceIdChange?.(id);
            if (id) setTab("services");
          }}
          onOpenRateCard={onOpenCard}
          onNewRateCard={onNewRateCard}
          onOpenVendor={onOpenVendor}
        /></>
      ) : tab === "packages" ? (
        <PackagesPanel
          vendorId={vendor.id}
          canEdit={canEdit}
          onDetailOpenChange={setPackageDetailOpen}
          onNavigationContextChange={onNavigationContextChange}
          onOpenService={(serviceId, serviceVendorId) => {
            setTab("services");
            if (serviceVendorId && serviceVendorId !== vendor.id) onOpenVendor(serviceVendorId);
            onOpenServiceIdChange?.(serviceId ?? null);
          }}
        />
      ) : tab === "bookings" ? (
        <VendorBookingsPanel key={vendor.id} vendorId={vendor.id} initialBookingId={financeBookingId} onCloseBooking={() => setFinanceBookingId(null)} />
      ) : tab === "finance" ? (
        <VendorFinancePanel vendorId={vendor.id} vendorName={vendor.name} canEdit={canEdit}
          onOpenBooking={(id) => { setFinanceBookingId(id); setVendorTab("bookings"); }}
          onOpenService={(id) => { setVendorTab("services"); onOpenServiceIdChange?.(id); }}
        />
      ) : tab === "docs" ? (
        <VendorDocsPanel canEdit={canEdit} onRequestDocuments={openDocumentRequest} />
      ) : tab === "tasks" ? (
        <TasksPanel
          canAddTask={canAddTask}
          vendorName={vendor.name}
          linkGroups={taskLinkGroups}
        />
      ) : tab === "comms" ? (
        <CommunicationPanel
          contactName={vendor.name}
          contactEmail={vendor.reservationsEmail || vendor.email}
          initials={vendor.initials}
          contacts={vendor.contacts}
          canCompose={canEdit}
          requestDraft={documentRequestDraft}
        />
      ) : tab !== "rate-cards" ? (
        <EmptyState
          title="Nothing in this section yet"
          description="This trial recreates Overview, Services, Packages, Bookings, Finance, Docs, Tasks, Communications, and Activity."
        />
      ) : (
        <>
          <div className="vendor-page__toolbar rate-card-toolbar">
            <SearchField
              fullWidth
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
                setSelected([]);
              }}
              placeholder="Search rate cards or services"
              aria-label="Search rate cards or services"
            />
            <div className="vendor-page__tools">
              <FilterSelect tip="Filter by service" label="Service" value={rateCardServiceFilter} options={[{ value: "all", label: "All services" }, ...Array.from(new Set(vendorRateCardRows.flatMap((row) => row.services.map((service) => service.name)))).map((name) => ({ value: name, label: name }))]} onChange={(value) => { setRateCardServiceFilter(value); setSelected([]); setPage(1); }} />
              <FilterSelect tip="Filter by rate-card type" label="Type" value={rateCardTypeFilter} options={[{ value: "all", label: "All types" }, ...Array.from(new Set(vendorRateCardRows.map((row) => getDetailCard(row.card.id)?.privateTransport?.template || row.card.category))).map((value) => ({ value, label: value in TRANSPORT_TEMPLATE_LABELS ? TRANSPORT_TEMPLATE_LABELS[value as keyof typeof TRANSPORT_TEMPLATE_LABELS] : value }))]} onChange={(value) => { setRateCardTypeFilter(value); setSelected([]); setPage(1); }} />
              <FilterSelect tip="Filter by validity" label="Validity" value={rateCardValidityFilter} options={[{ value: "all", label: "Any validity" }, { value: "current", label: "Current" }, { value: "expired", label: "Expired" }]} onChange={(value) => { setRateCardValidityFilter(value); setSelected([]); setPage(1); }} />
              <div className="rate-card-filter" ref={rateCardFilterRef}>
                <Tooltip tip="Filter by status">
                  <IconButton
                    className={rateCardStatusFilter === "all" ? undefined : "is-active"}
                    label={`Filter rate cards${
                      rateCardStatusFilter === "all"
                        ? ""
                        : `: ${STATUS_LABEL[rateCardStatusFilter]}`
                    }`}
                    aria-expanded={rateCardFilterOpen}
                    aria-haspopup="menu"
                    onClick={() => setRateCardFilterOpen((open) => !open)}
                  >
                    <IconFilter />
                  </IconButton>
                </Tooltip>
                {rateCardFilterOpen ? (
                  <div
                    className="rate-card-filter__menu"
                    role="menu"
                    aria-label="Filter rate cards by status"
                  >
                    {RATE_CARD_FILTER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={rateCardStatusFilter === option.value}
                        onClick={() => {
                          setRateCardStatusFilter(option.value);
                          setSelected([]);
                          setPage(1);
                          setRateCardFilterOpen(false);
                        }}
                      >
                        <span>{option.label}</span>
                        {rateCardStatusFilter === option.value ? <IconCheck /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="vendor-page__actions">
              <AnchoredImport buttonLabel="Import tariff" />
              <Button variant="primary" size="sm" onClick={onNewCard}>
                <IconPlus />
                New rate card
              </Button>
            </div>
          </div>

          {rateCardStatusFilter !== "all" ? (
            <div className="rate-card-filter__summary" role="status">
              Showing {STATUS_LABEL[rateCardStatusFilter].toLowerCase()} rate cards
              <button
                type="button"
                onClick={() => {
                  setRateCardStatusFilter("all");
                  setSelected([]);
                  setPage(1);
                }}
              >
                Clear filter
              </button>
            </div>
          ) : null}

          <div className="vendor-page__sheet dashboard-table-end">
            {filtered.length === 0 ? (
              <EmptyState
                title="No rate cards match this view"
                description="Try another rate card, service, or status filter."
              />
            ) : (
              <>
              <DataSheet className="rate-card-sheet" aria-label="Rate cards">
                <DataSheetHeader>
                  <DataSheetCell check>
                    <Checkbox state={headerState} onCheckedChange={toggleAll} label="Select all rate cards" />
                  </DataSheetCell>
                  <DataSheetCell>Rate card</DataSheetCell>
                  <DataSheetCell>Services</DataSheetCell>
                  <DataSheetCell>Type</DataSheetCell>
                  <DataSheetCell>Status</DataSheetCell>
                  <DataSheetCell className="rate-card-sheet__action">Action</DataSheetCell>
                </DataSheetHeader>
                {filtered.map((row) => (
                  <DataSheetRow
                    key={row.id}
                    className="data-row--interactive"
                    role="link"
                    tabIndex={0}
                    aria-label={`Open ${row.title}`}
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest("button, a, input, select, textarea")) return;
                      onOpenCard(row.card.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onOpenCard(row.card.id);
                      }
                    }}
                  >
                    <DataSheetCell check>
                      <Checkbox
                        state={selected.includes(row.id) ? "on" : "off"}
                        onCheckedChange={(state) => toggleRow(row.id, state)}
                        label={`Select ${row.title}`}
                      />
                    </DataSheetCell>
                    <DataSheetCell>
                      <LeadCell icon={<IconPin />} title={row.title} subtitle={row.card.ref} />
                    </DataSheetCell>
                    <DataSheetCell><div className="rate-card-sheet__services">
                      <span className="rate-card-sheet__service-icon" aria-hidden="true">{row.services[0] ? <ServiceTypeIcon type={row.services[0].category as ServiceTypeName} size={18} /> : <IconCard size={18} />}</span>
                      <span>{row.services.length ? row.services.map((service) => service.name).join(" · ") : "No linked services"}</span>
                    </div></DataSheetCell>
                    <DataSheetCell>{getDetailCard(row.card.id)?.privateTransport ? TRANSPORT_TEMPLATE_LABELS[getDetailCard(row.card.id)!.privateTransport!.template] : row.card.category}</DataSheetCell>
                    <DataSheetCell>{getDetailCard(row.card.id)?.activityTariff ? getDetailCard(row.card.id)?.state : getDetailCard(row.card.id)?.privateTransport?.status || STATUS_LABEL[row.card.status]}</DataSheetCell>
                    <DataSheetCell className="rate-card-sheet__action"><IconButton label={`More actions for ${row.title}`} aria-haspopup="menu" aria-expanded={rateCardMenu?.id === row.id} onClick={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      setRateCardMenu((current) => current?.id === row.id ? null : { id: row.id, top: rect.bottom + 6, left: Math.max(12, Math.min(window.innerWidth - 184, rect.right - 172)) });
                    }}><IconMore /></IconButton></DataSheetCell>
                  </DataSheetRow>
                ))}
                <DashboardDataSheetFill columns={6} />
              </DataSheet>
                <Pagination
                  rangeLabel={`Showing 1–${filtered.length} of ${filtered.length} rate cards`}
                  page={page}
                  pageCount={1}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
          {rateCardMenu ? createPortal(<div className="rate-card-sheet__menu" role="menu" aria-label="Rate card actions" style={{ top: rateCardMenu.top, left: rateCardMenu.left }} onPointerDown={(event) => event.stopPropagation()}>
            <button type="button" role="menuitem" onClick={() => { const row = vendorRateCardRows.find((item) => item.id === rateCardMenu.id); if (row) onOpenCard(row.card.id); setRateCardMenu(null); }}>Open rate card</button>
            <button type="button" role="menuitem" onClick={() => { const row = vendorRateCardRows.find((item) => item.id === rateCardMenu.id); if (row) void navigator.clipboard?.writeText(row.card.ref); setRateCardMenu(null); }}>Copy rate card ID</button>
          </div>, document.body) : null}
        </>
      )}

      <VendorFormModal
        mode="edit"
        open={editProfileOpen}
        vendor={vendor}
        vendors={vendors}
        orgRole={orgRole}
        onClose={() => setEditProfileOpen(false)}
        onCreated={() => undefined}
        onUpdated={(updated) => {
          onVendorsChange(vendors.map((v) => (v.id === updated.id ? updated : v)));
          setEditProfileOpen(false);
          setTab("overview");
        }}
        onViewExisting={(id) => {
          setEditProfileOpen(false);
          onOpenVendor(id);
        }}
        onNavigateTab={(next) => setVendorTab(next)}
      />

    </div>
  );
}
