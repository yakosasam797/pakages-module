import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, IconButton } from "@paryatech/design-system";
import {
  PACKAGE_STATUS_LABEL,
  PACKAGE_STATUS_TONE,
  type PackageStatus,
  type VendorPackage,
} from "../data/packages";
import type { ServiceCategory } from "../data/vendors";
import {
  VENDOR_SERVICES,
} from "../data/services";
import {
  IconCamera,
  IconCard,
  IconCheck,
  IconChevronDown,
  IconClose,
  IconHotel,
  IconIdCard,
  IconImage,
  IconMore,
  IconOpenOut,
  IconPackages,
  IconPencil,
  IconPin,
  IconPlane,
  IconPlus,
  IconSearch,
  IconTrash,
  IconVan,
} from "../icons";
import { StatusChipWithDot } from "./StatusChipWithDot";
import "./VendorFormModal.css";
import "./PackageDetailPage.css";

type PackageTab = "itinerary" | "policies" | "summary";
type EventKind = "flight" | "transfer" | "stay" | "activity" | "meal" | "visa" | "checkout" | "note";
type PackageModal = "edit-package" | "media" | "block-picker" | "edit-event" | "remove-event" | "service-preview" | null;

type PackageMedia = {
  id: string;
  src: string;
  alt: string;
  label: string;
  primary: boolean;
};

type PackageEvent = {
  id: string;
  kind: EventKind;
  kicker: string;
  title: string;
  meta?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  service?: string;
  serviceId?: string;
  serviceVendorId?: string;
  vendor?: string;
  rateCard?: string;
  amount?: string;
};

type PackageDay = {
  day: number;
  date: string;
  place: string;
  events: PackageEvent[];
};

type BlockTemplate = {
  kind: EventKind;
  label: string;
  description: string;
  group: "Recently used" | "Travel" | "Experience" | "Trip essentials" | "Content";
};

const photo = (id: string, w = 1000, h = 640) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=84`;

const SUPPORTING_MEDIA: Omit<PackageMedia, "primary">[] = [
  { id: "resort", src: photo("photo-1566073771259-6a8506099945", 720, 440), alt: "Lakeside resort and pool", label: "Accommodation" },
  { id: "kochi", src: photo("photo-1582510003544-4d00b7f39d87", 720, 440), alt: "Chinese fishing nets in Kochi", label: "Kochi" },
  { id: "experience", src: photo("photo-1544735716-392fe2489ffa", 720, 440), alt: "Green hills in Kerala", label: "Experiences" },
];

const BLOCK_LIBRARY: BlockTemplate[] = [
  { kind: "stay", label: "Accommodation", description: "Hotel, room, meal plan, and check-in details", group: "Recently used" },
  { kind: "transfer", label: "Transfer", description: "Airport, hotel, or intercity private transfer", group: "Recently used" },
  { kind: "flight", label: "Flight", description: "Flight sector, timing, baggage, and fare", group: "Recently used" },
  { kind: "activity", label: "Activity", description: "Sightseeing, attraction, guide, or experience", group: "Experience" },
  { kind: "meal", label: "Meal", description: "Breakfast, restaurant, or included dining", group: "Experience" },
  { kind: "visa", label: "Visa", description: "Visa service, documents, and processing notes", group: "Trip essentials" },
  { kind: "checkout", label: "Checkout", description: "Hotel checkout or departure instruction", group: "Trip essentials" },
  { kind: "note", label: "Note or free time", description: "Flexible time, guidance, or itinerary content", group: "Content" },
];

const INITIAL_ITINERARY: PackageDay[] = [
  {
    day: 1,
    date: "Kochi",
    place: "Arrival and Fort Kochi",
    events: [
      { id: "d1-flight", kind: "flight", kicker: "Arrival flight", title: "Flight to Kochi", meta: "Arrival airport: COK", description: "Airline, sector and schedule are confirmed for each booking." },
      { id: "d1-transfer", kind: "transfer", kicker: "Private arrival transfer", title: "Kochi airport to Fort Kochi", meta: "Private AC vehicle · Airport pickup", description: "Pickup follows the confirmed flight arrival.", service: "Kochi Airport Transfer", serviceId: "svc-transfer-cok", serviceVendorId: "trailmakers", vendor: "Bluewave Transport", rateCard: "Airport transfer rates 2026", amount: "₹1,850" },
      { id: "d1-stay", kind: "stay", kicker: "Hotel · 2 nights", title: "Example Lake Resort", meta: "Garden View · Breakfast included", description: "Standard check-in; checkout after breakfast on Day 3.", imageUrl: SUPPORTING_MEDIA[0].src, imageAlt: SUPPORTING_MEDIA[0].alt, service: "Example Lake Resort", serviceId: "svc-lake", serviceVendorId: "exhosp", vendor: "Example Hospitality", rateCard: "Accommodation tariff 2026–27", amount: "₹14,400" },
    ],
  },
  {
    day: 2,
    date: "Kochi",
    place: "Heritage and culture",
    events: [
      { id: "d2-meal", kind: "meal", kicker: "Meal", title: "Breakfast at the resort", meta: "Included in CP meal plan" },
      { id: "d2-activity", kind: "activity", kicker: "Guided sightseeing", title: "Fort Kochi and Mattancherry trail", meta: "Fishing nets · Dutch Palace · Jew Town", description: "Private guide and entry tickets included; timing stays flexible.", imageUrl: SUPPORTING_MEDIA[1].src, imageAlt: SUPPORTING_MEDIA[1].alt, service: "Kochi heritage walk", serviceVendorId: "kerala-heritage", vendor: "Kerala Heritage Co.", rateCard: "Kochi experiences 2026", amount: "₹4,800" },
      { id: "d2-note", kind: "note", kicker: "Open time", title: "Evening at leisure", meta: "No pre-booked service" },
    ],
  },
  {
    day: 3,
    date: "Alleppey",
    place: "Backwater journey",
    events: [
      { id: "d3-meal", kind: "meal", kicker: "Meal", title: "Breakfast and hotel checkout", meta: "Depart after breakfast" },
      { id: "d3-transfer", kind: "transfer", kicker: "Private intercity transfer", title: "Fort Kochi to Alleppey jetty", meta: "Private AC vehicle · Hotel pickup", description: "Pickup is coordinated with houseboat boarding.", service: "Kochi–Alleppey transfer", serviceId: "svc-transfer-cok", serviceVendorId: "trailmakers", vendor: "Bluewave Transport", rateCard: "Kerala transfers 2026", amount: "₹3,400" },
      { id: "d3-activity", kind: "activity", kicker: "Overnight cruise", title: "Private backwater houseboat", meta: "Village route · Sunset anchorage", description: "Meals included with an overnight stay on the backwaters.", imageUrl: photo("photo-1602216056096-3b40cc0c9944", 1300, 820), imageAlt: "Houseboat crossing the Kerala backwaters", service: "Alleppey houseboat", serviceVendorId: "coastal", vendor: "Coastal Stay Properties", rateCard: "Houseboat FIT tariff", amount: "₹18,500" },
    ],
  },
  {
    day: 4,
    date: "Kumarakom",
    place: "Lake and village experience",
    events: [
      { id: "d4-meal", kind: "meal", kicker: "Meal", title: "Breakfast on the houseboat", meta: "Disembark after breakfast" },
      { id: "d4-transfer", kind: "transfer", kicker: "Private transfer", title: "Alleppey jetty to Kumarakom", meta: "Private AC vehicle · Assisted check-in", service: "Backwater corridor transfer", serviceId: "svc-transfer-cok", serviceVendorId: "trailmakers", vendor: "Bluewave Transport", rateCard: "Kerala transfers 2026", amount: "₹1,600" },
      { id: "d4-stay", kind: "stay", kicker: "Hotel · 1 night", title: "Kumarakom Lake Retreat", meta: "Lake View · Breakfast and dinner", description: "Standard check-in with dinner and next-day breakfast included.", imageUrl: photo("photo-1571896349842-33c89424de2d", 900, 600), imageAlt: "Pool at a lakeside resort", service: "Kumarakom Lake Retreat", serviceVendorId: "wanderlust", vendor: "Wanderlust Trails", rateCard: "Backwater stay rates 2026–27", amount: "₹9,800" },
      { id: "d4-activity", kind: "activity", kicker: "Guided activity", title: "Sunset canoe and village visit", meta: "Private guide · Safety equipment · Tea stop", service: "Backwater Kayak", serviceId: "svc-kayak", serviceVendorId: "trailmakers", vendor: "Trailmaker Experiences", rateCard: "Activity tariff 2026", amount: "₹3,200" },
    ],
  },
  {
    day: 5,
    date: "Kochi",
    place: "Departure",
    events: [
      { id: "d5-meal", kind: "meal", kicker: "Meal", title: "Breakfast at the resort", meta: "Included in MAP meal plan" },
      { id: "d5-checkout", kind: "checkout", kicker: "Hotel checkout", title: "Kumarakom Lake Retreat", meta: "Standard checkout" },
      { id: "d5-transfer", kind: "transfer", kicker: "Private departure transfer", title: "Kumarakom to Kochi airport", meta: "Private AC vehicle · Airport drop", description: "Departure time follows the confirmed flight schedule.", service: "Kochi Airport Transfer", serviceId: "svc-transfer-cok", serviceVendorId: "trailmakers", vendor: "Bluewave Transport", rateCard: "Airport transfer rates 2026", amount: "₹3,600" },
      { id: "d5-flight", kind: "flight", kicker: "Departure flight", title: "Flight from Kochi", meta: "Departure airport: COK", description: "Airline, destination and schedule are confirmed for each booking." },
    ],
  },
];

const NEW_SERVICE: PackageEvent = {
  id: "",
  kind: "activity",
  kicker: "Activity",
  title: "",
  meta: "",
  service: "",
  vendor: "",
  rateCard: "",
  amount: "",
};

function EventIcon({ kind }: { kind: EventKind }) {
  const icons: Record<EventKind, ReactNode> = {
    flight: <IconPlane size={15} />,
    transfer: <IconVan size={15} />,
    stay: <IconHotel size={15} />,
    activity: <IconCamera size={15} />,
    meal: <IconCheck size={15} />,
    visa: <IconIdCard size={15} />,
    checkout: <IconHotel size={15} />,
    note: <IconPlus size={15} />,
  };
  return <span className="package-event__icon" data-kind={kind} aria-hidden="true">{icons[kind]}</span>;
}

function sellPriceValue(sellPrice: string) {
  return Number(sellPrice.replace(/[^0-9.]/g, ""));
}

function formatRupees(value: number) {
  return value ? `₹${Math.round(value).toLocaleString("en-IN")}` : "—";
}

function estimatedPackageCost(sellPrice: string) {
  return formatRupees(sellPriceValue(sellPrice) * 0.76);
}

function estimatedCategoryCost(sellPrice: string, share: number) {
  return formatRupees(sellPriceValue(sellPrice) * 0.76 * share);
}

function includedSummary(events: PackageEvent[]) {
  const labels: Array<[EventKind, string]> = [
    ["flight", "flight"],
    ["transfer", "transfer"],
    ["stay", "hotel"],
    ["activity", "activity"],
    ["meal", "meal"],
    ["visa", "visa"],
  ];
  return labels
    .map(([kind, label]) => {
      const count = events.filter((event) => event.kind === kind).length;
      return count ? `${count} ${label}${count === 1 ? "" : "s"}` : "";
    })
    .filter(Boolean)
    .join(" · ");
}

function PackageEventRow({
  event,
  position,
  isEditing,
  onEdit,
  onRemove,
  onOpenService,
}: {
  event: PackageEvent;
  position: number;
  isEditing: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onOpenService: () => void;
}) {
  const isLinked = Boolean(event.service && event.vendor);
  const sourceFallback = event.kind === "meal"
    ? "Included in package"
    : event.kind === "note"
      ? "Package note"
      : "Needs service link";
  const [imageFailed, setImageFailed] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!actionsOpen) return;
    const close = (pointerEvent: PointerEvent) => {
      if (!actionsRef.current?.contains(pointerEvent.target as Node)) setActionsOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [actionsOpen]);

  return (
    <article
      className={`package-event${isEditing ? " is-editing" : " is-readonly"}${isLinked ? " is-linked" : ""}`}
    >
      <div className="package-event__sequence" aria-label={`Block ${position}`}>
        <span>{String(position).padStart(2, "0")}</span>
      </div>

      <div className="package-event__media">
        {event.imageUrl && !imageFailed ? (
          <img
            src={event.imageUrl}
            alt={event.imageAlt ?? ""}
            width={76}
            height={54}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : <EventIcon kind={event.kind} />}
      </div>

      <div className="package-event__body">
        <span className="package-event__kicker">{event.kicker}</span>
        <h3>{event.title}</h3>
      </div>

      <div className="package-event__summary">
        {event.meta ? <p>{event.meta}</p> : <p>{event.description ?? "Package itinerary item"}</p>}
        {event.meta && event.description ? <span>{event.description}</span> : null}
      </div>

      <div className="package-event__source">
        {event.vendor || event.rateCard ? (
          <>
            {event.vendor ? <strong>{event.vendor}</strong> : null}
            {event.rateCard ? <span>{event.rateCard}</span> : null}
          </>
        ) : <span className={sourceFallback === "Needs service link" ? "is-attention" : undefined}>{sourceFallback}</span>}
      </div>

      <div className="package-event__cost">
        <span>{event.amount ? "Cost" : event.kind === "meal" ? "Price" : "Cost"}</span>
        <strong>{event.amount ?? (event.kind === "meal" ? "Included" : "—")}</strong>
      </div>

      <div className="package-event__actions" ref={actionsRef}>
        {isLinked ? (
          <button
            type="button"
            className="package-event__service-link"
            aria-label={`View ${event.title}`}
            aria-haspopup="dialog"
            onClick={onOpenService}
          >
            View
          </button>
        ) : null}
        {isEditing ? (
          <>
            <IconButton
              label={`More actions for ${event.title}`}
              aria-expanded={actionsOpen}
              aria-haspopup="menu"
              onClick={() => setActionsOpen((open) => !open)}
            ><IconMore /></IconButton>
            {actionsOpen ? (
              <div className="package-event__actions-menu" role="menu" aria-label={`Actions for ${event.title}`}>
                <button type="button" role="menuitem" onClick={() => { setActionsOpen(false); onEdit(); }}><IconPencil />Edit block</button>
                <button type="button" role="menuitem" className="is-danger" onClick={() => { setActionsOpen(false); onRemove(); }}><IconTrash />Delete block</button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}

export function PackageDetailPage({
  pkg,
  canEdit = true,
  onUpdate,
  onOpenService,
}: {
  pkg: VendorPackage;
  canEdit?: boolean;
  onUpdate?: (next: VendorPackage) => void;
  onOpenService?: (serviceId: string | undefined, vendorId: string | undefined) => void;
}) {
  const [record, setRecord] = useState(pkg);
  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab] = useState<PackageTab>("itinerary");
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [days, setDays] = useState<PackageDay[]>(() => pkg.services === "Services not added yet"
    ? [{ day: 1, date: "Date not set", place: "Plan this day", events: [] }]
    : INITIAL_ITINERARY);
  const [collapsedDays, setCollapsedDays] = useState<number[]>(() => pkg.services === "Services not added yet"
    ? []
    : INITIAL_ITINERARY.slice(1).map((day) => day.day));
  const [media, setMedia] = useState<PackageMedia[]>(() => pkg.imageUrl
    ? [
        { id: "primary", src: pkg.imageUrl, alt: pkg.imageAlt, label: "Primary banner", primary: true },
        ...SUPPORTING_MEDIA.map((item) => ({ ...item, primary: false })),
      ]
    : []);
  const [modal, setModal] = useState<PackageModal>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [target, setTarget] = useState<{ day: number; eventId: string } | null>(null);
  const [eventDraft, setEventDraft] = useState<PackageEvent>(NEW_SERVICE);
  const [addDay, setAddDay] = useState<number | null>(null);
  const [blockQuery, setBlockQuery] = useState("");
  const [packageDraft, setPackageDraft] = useState({ name: pkg.name, detail: pkg.detail, summary: pkg.summary, sellPrice: pkg.sellPrice, status: pkg.status });
  const uploadRef = useRef<HTMLInputElement>(null);
  const eventCounterRef = useRef(0);
  const editSnapshotRef = useRef<{ record: VendorPackage; days: PackageDay[]; media: PackageMedia[] } | null>(null);

  const orderedMedia = useMemo(
    () => [...media].sort((a, b) => Number(b.primary) - Number(a.primary)),
    [media],
  );
  const metrics = useMemo(() => {
    const events = days.flatMap((day) => day.events);
    const linked = events.filter((event) => event.service && event.vendor).length;
    return { events, linked };
  }, [days]);
  const nightCount = Number(record.detail.match(/(\d+)\s*N/i)?.[1] ?? Math.max(days.length - 1, 0));
  const destination = record.detail.split("\u00b7").at(-1)?.trim() || record.detail;
  const visibleBlocks = useMemo(() => {
    const query = blockQuery.trim().toLowerCase();
    return query
      ? BLOCK_LIBRARY.filter((block) => `${block.label} ${block.description} ${block.group}`.toLowerCase().includes(query))
      : BLOCK_LIBRARY;
  }, [blockQuery]);
  const previewService = useMemo(() => {
    const serviceName = eventDraft.service?.trim().toLowerCase();
    return VENDOR_SERVICES.find((service) => service.id === eventDraft.serviceId)
      ?? VENDOR_SERVICES.find(
        (service) => Boolean(serviceName) && service.name.toLowerCase() === serviceName,
      )
      ?? null;
  }, [eventDraft.service, eventDraft.serviceId]);
  const previewMedia = previewService?.media.length
    ? previewService.media
    : eventDraft.imageUrl
      ? [{
          id: `${eventDraft.id}-preview`,
          title: eventDraft.title,
          imageUrl: eventDraft.imageUrl,
          imageAlt: eventDraft.imageAlt ?? eventDraft.title,
        }]
      : [];

  const updateRecord = (next: VendorPackage) => {
    setRecord(next);
    onUpdate?.(next);
  };

  const syncItinerary = (nextDays: PackageDay[]) => {
    const operational = nextDays.flatMap((day) => day.events).filter((event) => event.kind !== "note");
    const categoryByKind: Partial<Record<EventKind, ServiceCategory>> = {
      stay: "Accommodation",
      checkout: "Accommodation",
      transfer: "Transport",
      flight: "Flights",
      activity: "Activities",
      meal: "Other",
      visa: "Visa",
    };
    const serviceTypes = Array.from(new Set(operational
      .map((event) => categoryByKind[event.kind])
      .filter((category): category is ServiceCategory => Boolean(category))));
    const serviceNames = operational
      .map((event) => event.service?.trim() || event.title.trim())
      .filter(Boolean);
    setDays(nextDays);
    updateRecord({
      ...record,
      services: serviceNames.length ? serviceNames.slice(0, 3).join(" · ") : "Services not added yet",
      serviceTypes,
    });
  };

  const toggleDay = (day: number) => {
    setCollapsedDays((current) => current.includes(day)
      ? current.filter((item) => item !== day)
      : [...current, day]);
  };

  const allDaysCollapsed = days.length > 0 && collapsedDays.length === days.length;
  const toggleAllDays = () => {
    setCollapsedDays(allDaysCollapsed ? [] : days.map((day) => day.day));
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice((current) => (current === message ? null : current)), 5000);
  };

  const openPackageSettings = () => {
    setPackageDraft({ name: record.name, detail: record.detail, summary: record.summary, sellPrice: record.sellPrice, status: record.status });
    setModal("edit-package");
  };

  const beginEditPackage = () => {
    editSnapshotRef.current = {
      record: { ...record },
      days: days.map((day) => ({ ...day, events: day.events.map((event) => ({ ...event })) })),
      media: media.map((item) => ({ ...item })),
    };
    setNotice(null);
    setTab("itinerary");
    setIsEditing(true);
  };

  const cancelPackageEdit = () => {
    const snapshot = editSnapshotRef.current;
    if (snapshot) {
      setRecord(snapshot.record);
      setDays(snapshot.days);
      setMedia(snapshot.media);
      onUpdate?.(snapshot.record);
    }
    editSnapshotRef.current = null;
    setModal(null);
    setNotice(null);
    setIsEditing(false);
  };

  const finishPackageEdit = () => {
    editSnapshotRef.current = null;
    setModal(null);
    setIsEditing(false);
    showNotice("Package changes saved. Review pricing and policies before publishing.");
  };

  useEffect(() => {
    if (canEdit || !isEditing) return;
    const snapshot = editSnapshotRef.current;
    if (snapshot) {
      setRecord(snapshot.record);
      setDays(snapshot.days);
      setMedia(snapshot.media);
      onUpdate?.(snapshot.record);
    }
    editSnapshotRef.current = null;
    setModal(null);
    setIsEditing(false);
  }, [canEdit, isEditing, onUpdate]);

  const savePackage = () => {
    if (!packageDraft.name.trim()) return;
    updateRecord({ ...record, ...packageDraft, name: packageDraft.name.trim(), detail: packageDraft.detail.trim() });
    setModal(null);
    showNotice("Package settings updated. Continue editing the itinerary or save the package.");
  };

  const beginAddService = (day: number) => {
    setAddDay(day);
    setBlockQuery("");
    setModal("block-picker");
  };

  const addBlockFromTemplate = (template: BlockTemplate) => {
    if (!addDay) return;
    eventCounterRef.current += 1;
    const nextEvent: PackageEvent = {
      id: `event-${eventCounterRef.current}`,
      kind: template.kind,
      kicker: template.label,
      title: template.kind === "note" ? "New itinerary note" : `Choose ${template.label.toLowerCase()}`,
      meta: template.description,
    };
    syncItinerary(days.map((day) => day.day === addDay ? { ...day, events: [...day.events, nextEvent] } : day));
    setModal(null);
    showNotice(`${template.label} block added to Day ${addDay}. Use Edit to add its final details.`);
  };

  const addItineraryDay = () => {
    const day = days.length + 1;
    setDays((current) => [...current, { day, date: "Date not set", place: "Plan this day", events: [] }]);
    showNotice(`Day ${day} added. Add its accommodation, transport, activities, or notes next.`);
  };

  const beginEditEvent = (day: number, event: PackageEvent) => {
    setTarget({ day, eventId: event.id });
    setEventDraft({ ...event });
    setModal("edit-event");
  };

  const saveEvent = () => {
    if (!target || !eventDraft.title.trim()) return;
    syncItinerary(days.map((day) => day.day === target.day
      ? { ...day, events: day.events.map((event) => event.id === target.eventId ? { ...eventDraft, title: eventDraft.title.trim() } : event) }
      : day));
    setModal(null);
    showNotice(`${eventDraft.title} updated. Review the day plan and Summary next.`);
  };

  const beginRemoveEvent = (day: number, event: PackageEvent) => {
    setTarget({ day, eventId: event.id });
    setEventDraft(event);
    setModal("remove-event");
  };

  const beginPreviewService = (day: number, event: PackageEvent) => {
    setTarget({ day, eventId: event.id });
    setEventDraft(event);
    setModal("service-preview");
  };

  const openLinkedService = () => {
    setModal(null);
    onOpenService?.(eventDraft.serviceId, eventDraft.serviceVendorId);
  };

  const removeEvent = () => {
    if (!target) return;
    syncItinerary(days.map((day) => day.day === target.day
      ? { ...day, events: day.events.filter((event) => event.id !== target.eventId) }
      : day));
    setModal(null);
    showNotice(`${eventDraft.title} removed from Day ${target.day}. Review the package total next.`);
  };

  const uploadMedia = (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!selected.length) return;
    const firstUploaded = selected[0];
    const firstUploadedUrl = URL.createObjectURL(firstUploaded);
    setMedia((current) => {
      const needsPrimary = !current.some((item) => item.primary);
      return [...current, ...selected.map((file, index) => ({
        id: `package-media-${Date.now()}-${index}`,
        src: index === 0 ? firstUploadedUrl : URL.createObjectURL(file),
        alt: file.name.replace(/\.[^.]+$/, ""),
        label: file.name.replace(/\.[^.]+$/, ""),
        primary: needsPrimary && index === 0,
      }))];
    });
    if (!media.some((item) => item.primary)) {
      const alt = firstUploaded.name.replace(/\.[^.]+$/, "");
      updateRecord({ ...record, imageUrl: firstUploadedUrl, imageAlt: alt });
    }
    if (uploadRef.current) uploadRef.current.value = "";
    showNotice(`${selected.length} photo${selected.length === 1 ? "" : "s"} added. Choose one as the package banner.`);
  };

  const setPrimaryMedia = (id: string) => {
    const selected = media.find((item) => item.id === id);
    if (!selected) return;
    setMedia((current) => current.map((item) => ({ ...item, primary: item.id === id })));
    updateRecord({ ...record, imageUrl: selected.src, imageAlt: selected.alt });
    showNotice(`${selected.label} is now the primary banner. The package table thumbnail was updated.`);
  };

  const updateMediaLabel = (id: string, label: string) => {
    setMedia((current) => current.map((item) => item.id === id ? { ...item, label, alt: label || item.alt } : item));
  };

  const removeMedia = (id: string) => {
    const removed = media.find((item) => item.id === id);
    const remaining = media.filter((item) => item.id !== id);
    if (removed?.src.startsWith("blob:")) URL.revokeObjectURL(removed.src);
    if (removed?.primary && remaining[0]) {
      const next = remaining.map((item, index) => ({ ...item, primary: index === 0 }));
      setMedia(next);
      updateRecord({ ...record, imageUrl: next[0].src, imageAlt: next[0].alt });
    } else {
      setMedia(remaining);
      if (removed?.primary) updateRecord({ ...record, imageUrl: "", imageAlt: "" });
    }
    showNotice(`${removed?.label ?? "Photo"} removed. ${remaining.length ? "Review the remaining banner selection." : "Upload a new banner next."}`);
  };

  return (
    <div className="package-detail">
      <header className="package-detail__header">
        <div className="package-detail__identity">
          {record.imageUrl ? (
            <img
              className="package-detail__image"
              src={record.imageUrl}
              alt={record.imageAlt}
              width={56}
              height={56}
              fetchPriority="high"
            />
          ) : (
            <span className="package-detail__image package-detail__image--empty" aria-hidden="true">
              <IconImage size={20} />
            </span>
          )}
          <div className="package-detail__identity-copy">
            <div className="package-detail__title-row"><h1>{record.name}</h1><StatusChipWithDot tone={PACKAGE_STATUS_TONE[record.status]}>{PACKAGE_STATUS_LABEL[record.status]}</StatusChipWithDot></div>
            <p><IconPin size={14} />{destination} <span aria-hidden="true">·</span> <span className="pt-mono">{record.id.toUpperCase()}</span> <span aria-hidden="true">·</span> {days.length} day{days.length === 1 ? "" : "s"} / {nightCount} night{nightCount === 1 ? "" : "s"}</p>
          </div>
        </div>
        <div className="package-detail__header-actions">
          <div className="package-detail__commercial-summary">
            <span>Sell price</span>
            <strong>{record.sellPrice}</strong>
            <small>Cost {estimatedPackageCost(record.sellPrice)} · Margin 24%</small>
          </div>
          {isEditing ? (
            <div className="package-detail__edit-actions">
              <Button variant="brand" size="sm" onClick={cancelPackageEdit}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={finishPackageEdit}><IconCheck />Save package</Button>
            </div>
          ) : canEdit ? (
            <Button variant="primary" size="sm" onClick={beginEditPackage}><IconPencil />Edit package</Button>
          ) : null}
        </div>
      </header>

      {isEditing ? (
        <div className="package-edit-mode" role="status">
          <div><IconPencil size={15} /><span><strong>Editing package</strong><small>Update package settings, media, days, and service blocks. Save when the package is ready.</small></span></div>
          <span>{metrics.events.length} blocks · {metrics.linked} linked services</span>
        </div>
      ) : null}

      {notice ? (
        <div className="package-detail__notice" role="status">
          <IconCheck size={15} />
          <span>{notice}</span>
          <button type="button" onClick={() => { setTab("summary"); setNotice(null); }}>Review summary</button>
          <IconButton label="Dismiss update" onClick={() => setNotice(null)}><IconClose size={14} /></IconButton>
        </div>
      ) : null}

      <nav className="package-detail__tabs" aria-label="Package sections">
        {([
          ["itinerary", "Build"],
          ["summary", "Pricing & summary"],
          ["policies", "Policies"],
        ] as Array<[PackageTab, string]>).map(([item, label]) => (
          <button type="button" key={item} className={tab === item ? "is-active" : undefined} onClick={() => setTab(item)}>{label}</button>
        ))}
      </nav>

      {tab === "itinerary" ? (
        <>
          <div className="package-builder-bar">
            <div className="package-builder-bar__summary">
              <span><strong>Itinerary</strong><small>{days.length} days · {metrics.events.length} blocks · {metrics.linked} linked services</small></span>
            </div>
            <div className="package-builder-bar__actions">
              <button type="button" className="package-builder-bar__toggle" onClick={toggleAllDays}>{allDaysCollapsed ? "Expand all" : "Collapse all"}</button>
              {isEditing ? (
                <>
                <Button variant="brand" size="sm" onClick={openPackageSettings}><IconPencil />Package settings</Button>
                <Button variant="brand" size="sm" onClick={() => setModal("media")}><IconImage />Media</Button>
                <Button variant="primary" size="sm" onClick={addItineraryDay}><IconPlus />Add day</Button>
                </>
              ) : null}
            </div>
          </div>

          {record.summary ? (
            <section className="package-overview" aria-label="Package overview">
              <div>
                <strong>Package overview</strong>
                <p className={summaryExpanded ? "is-expanded" : undefined}>{record.summary}</p>
              </div>
              {record.summary.length > 150 ? (
                <button type="button" onClick={() => setSummaryExpanded((expanded) => !expanded)} aria-expanded={summaryExpanded}>{summaryExpanded ? "Show less" : "View all"}</button>
              ) : null}
            </section>
          ) : null}

          <div className="package-itinerary">
            <main className="package-days">
              {days.map((day) => {
                const isCollapsed = collapsedDays.includes(day.day);
                return (
                  <section className={`package-day ${isCollapsed ? "is-collapsed" : "is-expanded"}`} id={`package-day-${day.day}`} key={day.day}>
                    <header className="package-day__head">
                      <div className="package-day__title"><span className="package-day__number">Day {day.day}</span><span className="package-day__separator" aria-hidden="true">·</span><h2>{day.date}</h2><p>{day.place}</p></div>
                      <div className="package-day__summary">
                        <span>{day.events.length} block{day.events.length === 1 ? "" : "s"}{includedSummary(day.events) ? ` · ${includedSummary(day.events)}` : " · Ready to structure"}</span>
                      </div>
                      <IconButton label={`${isCollapsed ? "Expand" : "Collapse"} Day ${day.day}`} onClick={() => toggleDay(day.day)}>
                        <span className={isCollapsed ? "package-day__chevron is-collapsed" : "package-day__chevron"}><IconChevronDown /></span>
                      </IconButton>
                    </header>
                    {!isCollapsed ? (
                      <>
                        {day.events.length ? (
                          <div className="package-day__events">{day.events.map((event, index) => (
                            <PackageEventRow
                              event={event}
                              position={index + 1}
                              isEditing={isEditing}
                              key={event.id}
                              onEdit={() => beginEditEvent(day.day, event)}
                              onRemove={() => beginRemoveEvent(day.day, event)}
                              onOpenService={() => beginPreviewService(day.day, event)}
                            />
                          ))}</div>
                        ) : (
                          <div className="package-day__empty"><IconPackages size={18} /><span><strong>No blocks yet</strong><small>Add a flight, stay, transfer, activity, visa, meal, or custom note.</small></span></div>
                        )}
                        {isEditing ? <button type="button" className="package-day__add" onClick={() => beginAddService(day.day)}><IconPlus size={14} />Add block to Day {day.day}</button> : null}
                      </>
                    ) : null}
                  </section>
                );
              })}
              {isEditing ? <button type="button" className="package-itinerary__add-day" onClick={addItineraryDay}><IconPlus size={14} />Add another day</button> : null}
            </main>
          </div>
        </>
      ) : tab === "policies" ? (
        <section className="package-info-page package-policy-page" aria-label="Package policy details">
          <article className="package-policy-document">
            <section>
              <h2>Cancellation</h2>
              <div className="package-policy-document__copy">
                <p>Cancellations received more than 30 days before the scheduled arrival date will not attract a package cancellation charge. Any non-refundable amount already paid to an airline, hotel, transport operator, activity provider or other supplier will still be retained.</p>
                <p>Cancellations received 15–29 days before arrival will be charged at 50% of the total package value. Cancellations received within 14 days of arrival, failure to travel, or an early departure after the trip has started will be charged at 100% of the total package value.</p>
                <p>A cancellation is effective only after the travel agency receives it in writing and confirms receipt. The applicable date is the date on which that written request is acknowledged.</p>
              </div>
            </section>
            <section>
              <h2>Refund</h2>
              <div className="package-policy-document__copy">
                <p>Where a refund is due, the amount will be calculated after deducting the applicable cancellation charge, supplier penalties, payment-gateway costs, foreign-exchange differences and any service already delivered. Air tickets, visas, permits and promotional hotel rates may remain fully non-refundable even when other package components qualify for a refund.</p>
                <p>Approved refunds will be returned to the original payment method after the agency receives the corresponding credit from each supplier. Processing normally takes 10–15 working days, but international suppliers and airlines may require additional time.</p>
              </div>
            </section>
            <section>
              <h2>Terms and conditions</h2>
              <div className="package-policy-document__copy">
                <p>The quoted itinerary, services and price are based on the travel dates, room occupancy and traveller details recorded in this package. Availability is not guaranteed until the required deposit has been received and every supplier has confirmed the booking. A change in dates, route, room type, meal plan, traveller count or traveller age may result in a revised price.</p>
                <p>Travellers are responsible for carrying valid passports, visas, permits, identification, insurance and health documents required for the journey. Names must match the travel documents exactly. The agency is not responsible for denied boarding, denied entry or loss caused by incomplete, expired or incorrect documents.</p>
                <p>Hotel check-in and checkout times are controlled by the individual property. Early check-in, late checkout, adjoining rooms, specific views and special requests are subject to availability unless they are expressly shown as confirmed in the itinerary. Any incidental deposit, minibar use, room service or personal expense must be settled directly by the traveller.</p>
                <p>Transport timings are indicative and may change because of traffic, weather, local restrictions or operational conditions. Flights are governed by the operating airline's conditions of carriage. Schedule changes, cancellations, baggage rules and seat assignments remain subject to the airline's final confirmation.</p>
                <p>Houseboat routes, water activities and outdoor experiences may be modified, delayed or cancelled where the supplier considers conditions unsafe. Where possible, the agency will arrange a comparable alternative. A change made for safety or circumstances beyond reasonable control does not automatically create a right to a full package refund.</p>
                <p>The package price includes only the services specifically listed in the confirmed itinerary. Personal expenses, optional activities, meals not listed by day, tips, local charges, medical costs and services purchased directly during the trip are excluded. By making payment, the lead traveller confirms that these terms have been read and accepted on behalf of everyone included in the booking.</p>
              </div>
            </section>
          </article>
        </section>
      ) : (
        <section className="package-info-page package-summary-page">
          <header><span>Commercial summary</span><h2>Cost and readiness</h2><p>One operational view of every service used to build this package.</p></header>
          {metrics.events.length ? <div className="package-cost-table">
            <div className="package-cost-table__head"><span>Service group</span><span>Linked items</span><span>Cost</span><span>Status</span></div>
            <div><strong>Accommodation</strong><span>3 stays · 4 nights</span><span>{estimatedCategoryCost(record.sellPrice, 0.625)}</span><StatusChipWithDot tone="done">Priced</StatusChipWithDot></div>
            <div><strong>Transport</strong><span>4 private transfers</span><span>{estimatedCategoryCost(record.sellPrice, 0.153)}</span><StatusChipWithDot tone="done">Priced</StatusChipWithDot></div>
            <div><strong>Activities</strong><span>3 experiences</span><span>{estimatedCategoryCost(record.sellPrice, 0.113)}</span><StatusChipWithDot tone="done">Priced</StatusChipWithDot></div>
            <div><strong>Flights</strong><span>2 sectors · actual at booking</span><span>{estimatedCategoryCost(record.sellPrice, 0.109)}</span><StatusChipWithDot tone="progress">Indicative</StatusChipWithDot></div>
            <div className="package-cost-table__total"><strong>Total cost</strong><span>{metrics.events.length} blocks · {metrics.linked} linked services</span><span>{estimatedPackageCost(record.sellPrice)}</span><strong>Cost basis</strong></div>
            <div className="package-cost-table__sell"><strong>Sell price</strong><span>Customer-facing package price</span><span>{record.sellPrice}</span><strong>24% margin</strong></div>
          </div> : <div className="package-summary-empty"><IconPackages size={20} /><strong>No services in this package yet</strong><span>Return to Itinerary and add the first service. Cost and readiness will appear here as the day plan is built.</span><Button variant="brand" size="sm" onClick={() => setTab("itinerary")}>Build itinerary</Button></div>}
          <div className={`package-readiness${metrics.events.length ? "" : " package-readiness--incomplete"}`}><IconCard size={16} /><div><strong>{metrics.events.length ? "Ready for pricing review" : "Setup incomplete"}</strong><span>{metrics.events.length ? "Review linked services and current prices before publishing. Flights remain indicative until ticketed." : "Add at least one itinerary service and a banner before publishing this package."}</span></div></div>
        </section>
      )}

      {modal === "edit-package" ? (
        <div className="pt-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="pt-modal package-action-modal" role="dialog" aria-modal="true" aria-labelledby="edit-package-title" onClick={(event) => event.stopPropagation()}>
            <header className="pt-modal__head package-action-modal__head"><h2 className="pt-modal__title" id="edit-package-title">Package settings</h2><IconButton label="Close package settings" onClick={() => setModal(null)}><IconClose /></IconButton></header>
            <div className="pt-modal__body">
              <label className="pt-mf"><span className="pt-mf__l">Package name</span><input className="pt-mf__i" value={packageDraft.name} onChange={(event) => setPackageDraft({ ...packageDraft, name: event.target.value })} /></label>
              <label className="pt-mf"><span className="pt-mf__l">Route / duration</span><input className="pt-mf__i" value={packageDraft.detail} onChange={(event) => setPackageDraft({ ...packageDraft, detail: event.target.value })} /></label>
              <label className="pt-mf"><span className="pt-mf__l">Package overview</span><textarea className="pt-mf__i" rows={5} maxLength={600} value={packageDraft.summary} onChange={(event) => setPackageDraft({ ...packageDraft, summary: event.target.value })} /></label>
              <div className="pt-mf-row">
                <label className="pt-mf"><span className="pt-mf__l">Sell price</span><input className="pt-mf__i" value={packageDraft.sellPrice} onChange={(event) => setPackageDraft({ ...packageDraft, sellPrice: event.target.value })} /></label>
                <label className="pt-mf"><span className="pt-mf__l">Status</span><select className="pt-mf__i" value={packageDraft.status} onChange={(event) => setPackageDraft({ ...packageDraft, status: event.target.value as PackageStatus })}><option value="live">Live</option><option value="reprice">Re-price</option><option value="draft">Draft</option></select></label>
              </div>
            </div>
            <footer className="pt-modal__foot"><Button variant="brand" size="sm" onClick={() => setModal(null)}>Cancel</Button><Button variant="primary" size="sm" onClick={savePackage} disabled={!packageDraft.name.trim()}><IconCheck />Update settings</Button></footer>
          </div>
        </div>
      ) : null}

      {modal === "media" ? (
        <div className="pt-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="pt-modal pt-modal--wide package-media-modal" role="dialog" aria-modal="true" aria-labelledby="package-media-title" onClick={(event) => event.stopPropagation()}>
            <header className="pt-modal__head package-action-modal__head"><h2 className="pt-modal__title" id="package-media-title">Photos and banner</h2><IconButton label="Close package media" onClick={() => setModal(null)}><IconClose /></IconButton></header>
            <div className="pt-modal__body package-media-modal__body">
              {orderedMedia.length ? orderedMedia.map((item) => (
                <article className="package-media-row" key={item.id}>
                  <img src={item.src} alt={item.alt} width={132} height={84} />
                  <div><input aria-label={`Media label for ${item.label}`} value={item.label} onChange={(event) => updateMediaLabel(item.id, event.target.value)} /><span>{item.primary ? "Primary package banner" : "Gallery photo"}</span></div>
                  <div className="package-media-row__actions">{item.primary ? <StatusChipWithDot tone="done">Banner</StatusChipWithDot> : <button type="button" onClick={() => setPrimaryMedia(item.id)}>Use as banner</button>}<IconButton label={`Remove ${item.label}`} onClick={() => removeMedia(item.id)}><IconTrash /></IconButton></div>
                </article>
              )) : <div className="package-media-empty"><IconImage size={22} /><strong>No package photos</strong><span>Upload one or more images to create the gallery.</span></div>}
              <input ref={uploadRef} className="package-media-input" type="file" accept="image/*" multiple onChange={(event) => uploadMedia(event.target.files)} />
            </div>
            <footer className="pt-modal__foot"><Button variant="brand" size="sm" onClick={() => uploadRef.current?.click()}><IconPlus />Upload photos</Button><Button variant="primary" size="sm" onClick={() => setModal(null)}>Done</Button></footer>
          </div>
        </div>
      ) : null}

      {modal === "block-picker" ? (
        <div className="pt-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="pt-modal package-block-picker" role="dialog" aria-modal="true" aria-labelledby="block-picker-title" onClick={(event) => event.stopPropagation()}>
            <header className="pt-modal__head package-action-modal__head">
              <div><h2 className="pt-modal__title" id="block-picker-title">Add block to Day {addDay}</h2><p>Choose the content or service structure you need.</p></div>
              <IconButton label="Close block picker" onClick={() => setModal(null)}><IconClose /></IconButton>
            </header>
            <div className="package-block-picker__search">
              <IconSearch size={16} />
              <input aria-label="Search block types" value={blockQuery} onChange={(event) => setBlockQuery(event.target.value)} placeholder="Search block types…" />
            </div>
            <div className="package-block-picker__body">
              {(["Recently used", "Travel", "Experience", "Trip essentials", "Content"] as BlockTemplate["group"][]).map((group) => {
                const blocks = visibleBlocks.filter((block) => block.group === group);
                return blocks.length ? (
                  <section className="package-block-picker__group" key={group}>
                    <h3>{group}</h3>
                    <div className="package-block-picker__grid">
                      {blocks.map((block) => (
                        <button type="button" className={`package-block-option package-block-option--${block.kind}`} key={block.kind} onClick={() => addBlockFromTemplate(block)}>
                          <EventIcon kind={block.kind} />
                          <span><strong>{block.label}</strong><small>{block.description}</small></span>
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null;
              })}
              {!visibleBlocks.length ? <div className="package-block-picker__empty"><strong>No block types found</strong><span>Try accommodation, transfer, flight, activity, meal, visa, or note.</span></div> : null}
            </div>
          </div>
        </div>
      ) : null}

      {modal === "edit-event" ? (
        <div className="pt-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="pt-modal pt-modal--wide package-action-modal" role="dialog" aria-modal="true" aria-labelledby="package-event-title" onClick={(event) => event.stopPropagation()}>
            <header className="pt-modal__head package-action-modal__head"><h2 className="pt-modal__title" id="package-event-title">Change Day {target?.day} itinerary item</h2><IconButton label="Close itinerary editor" onClick={() => setModal(null)}><IconClose /></IconButton></header>
            <div className="pt-modal__body">
              <div className="pt-mf-row">
                <label className="pt-mf"><span className="pt-mf__l">Type</span><select className="pt-mf__i" value={eventDraft.kind} onChange={(event) => setEventDraft({ ...eventDraft, kind: event.target.value as EventKind, kicker: event.target.selectedOptions[0].text })}><option value="stay">Hotel</option><option value="transfer">Transfer</option><option value="activity">Activity</option><option value="flight">Flight</option><option value="visa">Visa</option><option value="meal">Meal</option><option value="note">Open time</option></select></label>
                <label className="pt-mf"><span className="pt-mf__l">Label</span><input className="pt-mf__i" value={eventDraft.kicker} onChange={(event) => setEventDraft({ ...eventDraft, kicker: event.target.value })} /></label>
              </div>
              <label className="pt-mf"><span className="pt-mf__l">Title</span><input className="pt-mf__i" value={eventDraft.title} onChange={(event) => setEventDraft({ ...eventDraft, title: event.target.value })} placeholder="Service or itinerary item" /></label>
              <label className="pt-mf"><span className="pt-mf__l">Operational details</span><input className="pt-mf__i" value={eventDraft.meta ?? ""} onChange={(event) => setEventDraft({ ...eventDraft, meta: event.target.value })} placeholder="Time, room, vehicle, duration or inclusions" /></label>
              <div className="pt-mf-row">
                <label className="pt-mf"><span className="pt-mf__l">Linked service</span><input className="pt-mf__i" value={eventDraft.service ?? ""} onChange={(event) => setEventDraft({ ...eventDraft, service: event.target.value })} /></label>
                <label className="pt-mf"><span className="pt-mf__l">Vendor</span><input className="pt-mf__i" value={eventDraft.vendor ?? ""} onChange={(event) => setEventDraft({ ...eventDraft, vendor: event.target.value })} /></label>
              </div>
              <div className="pt-mf-row">
                <label className="pt-mf"><span className="pt-mf__l">Rate card</span><input className="pt-mf__i" value={eventDraft.rateCard ?? ""} onChange={(event) => setEventDraft({ ...eventDraft, rateCard: event.target.value })} /></label>
                <label className="pt-mf"><span className="pt-mf__l">Cost</span><input className="pt-mf__i" value={eventDraft.amount ?? ""} onChange={(event) => setEventDraft({ ...eventDraft, amount: event.target.value })} placeholder="₹0" /></label>
              </div>
            </div>
            <footer className="pt-modal__foot"><Button variant="brand" size="sm" onClick={() => setModal(null)}>Cancel</Button><Button variant="primary" size="sm" disabled={!eventDraft.title.trim()} onClick={saveEvent}><IconCheck />Save changes</Button></footer>
          </div>
        </div>
      ) : null}

      {modal === "service-preview" ? (
        <div className="pt-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="pt-modal package-service-preview" role="dialog" aria-modal="true" aria-labelledby="service-preview-title" onClick={(event) => event.stopPropagation()}>
            <header className="pt-modal__head package-service-preview__head">
              <div>
                <h2 className="pt-modal__title" id="service-preview-title">{previewService?.name ?? eventDraft.service ?? eventDraft.title}</h2>
                <p><IconPin size={13} />{previewService?.location ?? eventDraft.meta ?? "Linked package service"}</p>
              </div>
              <IconButton label="Close service preview" onClick={() => setModal(null)}><IconClose /></IconButton>
            </header>
            <div className="package-service-preview__body">
              {previewMedia.length ? (
                <div className={`package-service-preview__media package-service-preview__media--${Math.min(previewMedia.length, 4)}`}>
                  {previewMedia.slice(0, 4).map((item, index) => (
                    <figure key={item.id} className={index === 0 ? "is-primary" : undefined}>
                      <img src={item.imageUrl} alt={item.imageAlt} />
                      <figcaption>{item.title}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="package-service-preview__media-empty">
                  <EventIcon kind={eventDraft.kind} />
                  <span>No service media uploaded</span>
                </div>
              )}

              <div className="package-service-preview__details">
                <p className="package-service-preview__about">
                  {previewService?.about ?? eventDraft.description ?? eventDraft.meta ?? "This service is linked to the package itinerary."}
                </p>
                <dl>
                  <div><dt>Service type</dt><dd>{previewService?.type ?? eventDraft.kicker}</dd></div>
                  <div><dt>Vendor</dt><dd>{eventDraft.vendor ?? "Linked vendor"}</dd></div>
                  <div><dt>Rate card</dt><dd>{eventDraft.rateCard ?? previewService?.pricingLabel ?? "Not linked"}</dd></div>
                  <div><dt>Package cost</dt><dd>{eventDraft.amount ?? "Included"}</dd></div>
                </dl>
                {previewService ? (
                  <div className="package-service-preview__included">
                    <strong>Included</strong>
                    <span>{previewService.inclusions.slice(0, 3).join(" · ")}</span>
                  </div>
                ) : null}
              </div>
            </div>
            <footer className="pt-modal__foot">
              <div className="package-service-preview__footer-actions">
                <Button variant="brand" size="sm" onClick={() => setModal(null)}>Close</Button>
                <Button variant="primary" size="sm" onClick={openLinkedService}>View service <IconOpenOut size={14} /></Button>
              </div>
            </footer>
          </div>
        </div>
      ) : null}

      {modal === "remove-event" ? (
        <div className="pt-modal-overlay" role="presentation" onClick={() => setModal(null)}>
          <div className="pt-modal package-action-modal" role="alertdialog" aria-modal="true" aria-labelledby="remove-event-title" onClick={(event) => event.stopPropagation()}>
            <header className="pt-modal__head"><h2 className="pt-modal__title" id="remove-event-title">Remove {eventDraft.title} from Day {target?.day}?</h2></header>
            <div className="pt-modal__body"><p className="pt-modal__message">This removes the item from the day plan and changes the included-service count. You can add it again later.</p></div>
            <footer className="pt-modal__foot"><Button variant="brand" size="sm" onClick={() => setModal(null)}>Keep item</Button><Button variant="primary" size="sm" onClick={removeEvent}><IconTrash />Remove item</Button></footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
