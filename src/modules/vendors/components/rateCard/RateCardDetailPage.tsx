import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  Button,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  LeadCell,
  StatusChip,
  TabBar,
  type StatusTone,
  type TabItem,
} from "@paryatech/design-system";
import {
  BED_LABEL,
  formatMoney,
  getDetailCard,
  saveTransportCard,
} from "../../rateCard/cards";
import { runQuote, DEFAULT_QUOTE, type QuoteInput } from "../../rateCard/engine";
import {
  TEST_DATES,
  type CardTone,
  type DetailPageTab,
  type RateCardDetail,
  type Season,
} from "../../rateCard/types";
import {
  IconBed,
  IconBookmark,
  IconCalendar,
  IconCamera,
  IconCard,
  IconChevronDown,
  IconClose,
  IconDownload,
  IconHotel,
  IconPencil,
  IconPin,
  IconPlus,
  IconUser,
} from "../../icons";
import { RecordHeader } from "../RecordHeader";
import { StatusChipWithDot } from "../StatusChipWithDot";
import { ActivityPanel } from "../ActivityPanel";
import { ActivityRateDetails, ActivityTestRate } from "../ActivityRateWorkspace";
import { validateActivityTariff } from "../../rateCard/activityPricing";
import { DIRECTORY_SERVICES, VENDOR_SERVICE_CONNECTIONS, readCreatedDirectoryServices } from "../../data/vendorDirectory";
import { TransportRateDetails, TransportTestRate } from "../TransportRateWorkspace";
import { RegionalTransportRates, RegionalTransportTest } from "../RegionalTransportWorkspace";
import { PrivateTransportRates, PrivateTransportTest } from "../PrivateTransportWorkspace";
import { readVehicleOfferings } from "../../data/vehicleOfferings";
import { TRANSPORT_TEMPLATE_LABELS } from "../../rateCard/privateTransport";
import { activityFromEvents } from "../activityFromEvents";
import { PoliciesPanel } from "./PoliciesPanel";
import { SeasonEditorModal, type SeasonDraft } from "./SeasonEditorModal";
import "./RateCardDetail.css";

function toneToStatus(tone: CardTone): StatusTone {
  if (tone === "success") return "done";
  if (tone === "warning") return "progress";
  if (tone === "danger") return "blocked";
  return "open";
}

function catLabel(card: RateCardDetail, key: string, fallback: string) {
  return card.catLabels?.[key] ?? fallback;
}

function priceTone(amount: number | null, taxConfirmed: boolean): "ok" | "missing" | "warn" {
  if (amount == null) return "missing";
  if (!taxConfirmed) return "warn";
  return "ok";
}

function PriceChip({
  amount,
  currency,
  taxConfirmed,
  sub,
  editing,
  onChange,
}: {
  amount: number | null;
  currency: string;
  taxConfirmed: boolean;
  sub?: string;
  editing?: boolean;
  onChange?: (next: number | null) => void;
}) {
  const tone = priceTone(amount, taxConfirmed);
  if (editing && onChange) {
    return (
      <label className={`rc-price rc-price--edit rc-price--${tone === "ok" ? "ok" : tone}`}>
        <input
          className="rc-price__input"
          type="text"
          inputMode="numeric"
          placeholder="Missing"
          aria-label="Rate amount"
          value={amount == null ? "" : String(amount)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, "");
            onChange(raw === "" ? null : Number(raw));
          }}
        />
        {sub ? <span className="rc-price__sub">{sub}</span> : null}
      </label>
    );
  }
  return (
    <span className={`rc-price rc-price--${tone === "ok" ? "ok" : tone}`}>
      <span className="rc-price__main">
        {amount == null ? "Missing" : formatMoney(amount, currency)}
      </span>
      {sub ? <span className="rc-price__sub">{sub}</span> : null}
    </span>
  );
}

function Section({
  title,
  desc,
  action,
  children,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rc-section">
      <div className="rc-section__head">
        <div>
          <h2 className="rc-section__title">{title}</h2>
          {desc ? <p className="rc-section__desc">{desc}</p> : null}
        </div>
        {action}
      </div>
      <div className="rc-section__sheet">{children}</div>
    </section>
  );
}

function sheetCols(template: string): CSSProperties {
  return { ["--rc-cols" as string]: template };
}

function CellIcon({
  icon,
  children,
  className = "",
}: {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`rc-sheet__icon-cell${className ? ` ${className}` : ""}`}>
      <span className="rc-sheet__icon-cell-glyph" aria-hidden="true">
        {icon}
      </span>
      <span className="rc-sheet__icon-cell-text">{children}</span>
    </span>
  );
}

export function RateCardDetailPage({
  cardId,
  seedCard,
  startEditing = false,
  canEditMarkup = false,
  canEdit = true,
  onDraftChange,
}: {
  cardId: string;
  /** Prefers this over the seed catalog — used for newly created drafts. */
  seedCard?: RateCardDetail;
  startEditing?: boolean;
  /** Markup is commercially sensitive and can only be changed by an Owner. */
  canEditMarkup?: boolean;
  canEdit?: boolean;
  /** Called whenever local draft changes (keeps App draft in sync). */
  onDraftChange?: (card: RateCardDetail) => void;
}) {
  const catalog = getDetailCard(cardId);
  const seed = seedCard ?? catalog;
  const [draft, setDraft] = useState<RateCardDetail | null>(() =>
    startEditing && canEdit && seed ? structuredClone(seed) : null,
  );
  const card = draft?.id === (seed?.id ?? cardId) ? draft : seed ?? draft;
  const [page, setPage] = useState<DetailPageTab>("ratecard");
  const [seasonIdx, setSeasonIdx] = useState(0);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [editing, setEditing] = useState(startEditing && canEdit);
  const [saveErrors, setSaveErrors] = useState<string[]>([]);
  const [markupEditing, setMarkupEditing] = useState(false);
  const [markupDraft, setMarkupDraft] = useState("15");
  const [seasonModal, setSeasonModal] = useState<SeasonDraft | null>(null);
  const seasonRef = useRef<HTMLDivElement>(null);
  const markupInputRef = useRef<HTMLInputElement>(null);

  const [quote, setQuote] = useState<QuoteInput>({ ...DEFAULT_QUOTE });

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (seasonRef.current && !seasonRef.current.contains(e.target as Node)) setSeasonOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!canEditMarkup && markupEditing) setMarkupEditing(false);
  }, [canEditMarkup, markupEditing]);

  useEffect(() => {
    if (markupEditing) markupInputRef.current?.focus();
  }, [markupEditing]);

  const commitDraft = (next: RateCardDetail) => {
    const previous = draft?.id === next.id ? draft : seed;
    const changedActiveTariff = previous?.privateTransport?.status === "Active" && next.privateTransport &&
      JSON.stringify(previous.privateTransport) !== JSON.stringify(next.privateTransport);
    const saved: RateCardDetail = changedActiveTariff && next.privateTransport?.status === "Active"
      ? { ...next, state: "Draft", tone: "warning" as const, privateTransport: { ...next.privateTransport, status: "Draft" as const, sourceConfirmed: false, version: next.privateTransport.version + 1 } }
      : next;
    if (saved.privateTransport) {
      saved.ready = saved.privateTransport.illustrative ? "Illustrative demo prices" : saved.privateTransport.status === "Active" ? "Supplier tariff verified" : "Supplier confirmation pending";
      saved.readyTone = saved.privateTransport.status === "Active" ? "success" : "warning";
    }
    setDraft(saved);
    if (next.activityTariff) return;
    saveTransportCard(saved);
    onDraftChange?.(saved);
  };

  const updateCard = (fn: (c: RateCardDetail) => RateCardDetail) => {
    const base = draft?.id === (seed?.id ?? cardId) && draft ? draft : seed;
    if (!base) return;
    commitDraft(fn(structuredClone(base)));
  };

  if (!card) {
    return (
      <div className="rc-detail">
        <p>Rate card not found.</p>
      </div>
    );
  }

  const tabs: TabItem[] = [
    { id: "ratecard", label: "Rate card" },
    { id: "test", label: "Test rate" },
    { id: "policies", label: "Policies" },
    ...(card.activityTariff ? [{ id: "versions", label: "Versions" }] : []),
    { id: "activity", label: "Activity" },
  ];

  const activityOptions = card.activityTariff ? ([...DIRECTORY_SERVICES, ...readCreatedDirectoryServices()].find((service) => service.id === card.activityTariff!.serviceId)?.activityOptions ?? []) : [];
  const offeredActivityIds = [...DIRECTORY_SERVICES, ...readCreatedDirectoryServices()].filter((service) => service.profileVendorId === card.activityTariff?.vendorId || VENDOR_SERVICE_CONNECTIONS.some((connection) => connection.vendorId === card.activityTariff?.vendorId && connection.serviceId === service.id)).map((service) => service.id);

  const saveActivity = () => {
    if (!canEdit || !card.activityTariff) return;
    const errors = validateActivityTariff(card.activityTariff, activityOptions, offeredActivityIds);
    setSaveErrors(errors);
    if (errors.length) return;
    const version = card.activityVersions?.length ? Math.max(...card.activityVersions.map((item) => item.version)) + 1 : card.activityTariff.version;
    const tariff = { ...card.activityTariff, version };
    const saved = { ...card, state: "Draft", tone: "warning" as const, activityTariff: tariff, validity: `${tariff.validFrom} – ${tariff.validTo}`, activityVersions: [...(card.activityVersions ?? []), { version, savedAt: new Date().toISOString(), tariff: structuredClone(tariff) }] };
    saveTransportCard(saved);
    setDraft(saved);
    onDraftChange?.(saved);
    setEditing(false);
  };

  const activateActivity = () => {
    if (!canEdit || !card.activityTariff) return;
    const tariff = card.activityTariff;
    const errors = validateActivityTariff(tariff, activityOptions, offeredActivityIds);
    if (!tariff.sourceConfirmed) errors.push("Confirm the supplier numbers against their source document.");
    if (!tariff.taxProfileId || tariff.approvedTaxRate == null || !tariff.taxApprovalSource?.trim()) errors.push("Record the approved supplier tax profile, rate and approval source.");
    if (![...tariff.personRates, ...tariff.bookingRates, ...tariff.unitRates].some((row) => ["priced", "complimentary", "on-request"].includes(row.state))) errors.push("Add at least one priced, complimentary or on-request offering.");
    setSaveErrors(errors);
    if (errors.length) return;
    const active = { ...card, state: "Active", tone: "success" as const };
    saveTransportCard(active);
    setDraft(active);
    onDraftChange?.(active);
  };

  const season = card.seasons[Math.min(seasonIdx, Math.max(0, card.seasons.length - 1))];
  const quoteResult = runQuote(card, quote);

  const beginMarkupEdit = () => {
    if (!canEditMarkup) return;
    setMarkupDraft(String(card.markupPercent));
    setMarkupEditing(true);
  };

  const cancelMarkupEdit = () => {
    setMarkupEditing(false);
    setMarkupDraft(String(card.markupPercent));
  };

  const saveMarkup = () => {
    if (!canEditMarkup) return;
    const next = Number(markupDraft);
    if (!Number.isFinite(next) || !markupDraft.trim()) {
      cancelMarkupEdit();
      return;
    }
    const clamped = Math.min(100, Math.max(0, Math.round(next * 10) / 10));
    const saved = { ...card, markupPercent: clamped };
    setDraft(saved);
    // Activity tariff edits have their own validation/save action.
    const persisted = card.activityTariff && editing ? { ...(getDetailCard(card.id) ?? seed ?? card), markupPercent: clamped } : saved;
    saveTransportCard(persisted);
    onDraftChange?.(saved);
    setMarkupDraft(String(clamped));
    setMarkupEditing(false);
  };

  const renameCard = (name: string) => {
    updateCard((base) => ({ ...base, name }));
  };

  const downloadRateCard = () => {
    const csvCell = (value: string | number | null | undefined) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    const currentSeasonIndex = Math.min(seasonIdx, Math.max(0, card.seasons.length - 1));
    const rows: Array<Array<string | number | null | undefined>> = card.activityTariff ? [
      ["Rate card", card.name], ["Reference", card.ref], ["Vendor", card.vendor], ["Service", card.property], ["Currency", card.currency], ["Version", card.activityTariff.version], ["Valid from", card.activityTariff.validFrom], ["Valid until", card.activityTariff.validTo], [],
      ["Method", "Option ID", "Category / unit", "Minimum", "Maximum", "Basis", "State", "Supplier amount"],
      ...card.activityTariff.personRates.map((row) => ["Per person", row.optionId, row.category, row.minAge, row.maxAge, `Group ${row.minGroup ?? "any"}-${row.maxGroup ?? "any"}`, row.state, row.amount]),
      ...card.activityTariff.bookingRates.map((row) => ["Per booking/group", row.optionId, "", row.minGroup, row.maxGroup, row.basisLabel, row.state, row.amount]),
      ...card.activityTariff.unitRates.map((row) => ["Per unit", row.optionId, row.unit, row.capacityPerUnit, row.duration, row.basis, row.state, row.amount]), [],
      ["Charge", "Option IDs", "Treatment", "Mandatory", "Basis", "Amount"],
      ...card.activityTariff.charges.map((row) => [row.name, row.optionIds.join("; ") || "All", row.treatment, row.mandatory ? "Yes" : "No", row.basis, row.amount]), [],
      ["Adjustment", "Option IDs", "From", "To", "Treatment", "Amount", "Stacking"],
      ...card.activityTariff.adjustments.map((row) => [row.name, row.optionIds.join("; ") || "All", row.from, row.to, row.treatment, row.amount, row.stacking]),
    ] : card.privateTransport ? (() => {
      const tariff = card.privateTransport!;
      const vehicles = readVehicleOfferings().filter((vehicle) => tariff.vehicleIds.includes(vehicle.id));
      const base: Array<Array<string | number | null | undefined>> = [["Rate card", card.name], ["Vendor", card.vendor], ["Service", card.property], ["Template", TRANSPORT_TEMPLATE_LABELS[tariff.template]], ["Valid from", tariff.validFrom], ["Valid until", tariff.validTo], ["Currency", card.currency], ["Supplier tax", tariff.taxMode === "inclusive" ? "Included in listed prices" : tariff.taxMode === "exclusive" ? "Added separately" : "Not set"], []];
      if (tariff.template === "fixed-transfer") base.push(["Route", ...vehicles.map((vehicle) => vehicle.label)], ...tariff.routes.map((route) => [`${route.from} → ${route.to}`, ...vehicles.map((vehicle) => route.prices[vehicle.id])])) ;
      if (tariff.template === "local-package") base.push(["Vehicle", ...tariff.packages.map((pkg) => pkg.name)], ...vehicles.map((vehicle) => [vehicle.label, ...tariff.packages.map((pkg) => tariff.packagePrices[vehicle.id]?.[pkg.id])]), [], ["Vehicle", "Extra km", "Extra hour"], ...vehicles.map((vehicle) => [vehicle.label, tariff.excessPrices[vehicle.id]?.extraKm, tariff.excessPrices[vehicle.id]?.extraHour]));
      if (tariff.template === "outstation-km") base.push(["Vehicle", "Rate / km", "Minimum km / day", "Driver / day"], ...vehicles.map((vehicle) => [vehicle.label, tariff.outstationPrices[vehicle.id]?.ratePerKm, tariff.outstationPrices[vehicle.id]?.minKmPerDay, tariff.outstationPrices[vehicle.id]?.driverPerDay]));
      if (tariff.template === "daily-hire") base.push(["Vehicle", "Price / day", "Included km / day", "Included hours / day"], ...vehicles.map((vehicle) => [vehicle.label, tariff.dailyPrices[vehicle.id]?.pricePerDay, tariff.dailyPrices[vehicle.id]?.includedKmPerDay, tariff.dailyPrices[vehicle.id]?.includedHoursPerDay]), [], ["Vehicle", "Extra km", "Extra hour"], ...vehicles.map((vehicle) => [vehicle.label, tariff.excessPrices[vehicle.id]?.extraKm, tariff.excessPrices[vehicle.id]?.extraHour]));
      base.push([], ["Charge", "Applies to", "Treatment", "Amount", "Charged per", "Trigger"], ...tariff.charges.map((charge) => [charge.name, charge.appliesTo, charge.treatment, charge.amount, charge.chargedPer, charge.trigger]));
      return base;
    })() : card.regionalTransport ? [
      ["Rate card", card.name], ["Vendor", card.vendor], ["Service", card.property], ["Currency", card.currency], ["Price type", "Supplier cost"], ["Source", card.regionalTransport.source], ["Source document", card.regionalTransport.sourceDocument], ["Timezone", card.regionalTransport.timezone], [],
      ["Valid from", card.regionalTransport.seasons[0]?.start], ["Valid until", card.regionalTransport.seasons[0]?.end], ["Tax treatment", card.regionalTransport.taxPresentation], [],
      ["Vehicle", "Passenger seats", "Medium bags"], ...card.regionalTransport.vehicles.map((vehicle) => [vehicle.label, vehicle.passengerSeats, vehicle.luggageBags]), [],
      ...(card.regionalTransport.enabledMethods?.includes("one-way") || card.regionalTransport.enabledMethods?.includes("whole-trip") ? [["Route", "Origin", "Destination", "Area"], ...(card.regionalTransport.routes || []).map((route) => [route.name, route.from, route.to, route.areaId]), []] : []),
      ...(card.regionalTransport.enabledMethods?.includes("local") ? [["Local package", "Included hours", "Included km", "Shared excess"], ...(card.regionalTransport.localPackages || []).map((pkg) => [pkg.name, pkg.hours, pkg.km, pkg.sharedExcess === false ? "No" : "Yes"]), []] : []),
      ["Method", "Fare", "Route", "Vehicle", "Package", "Basis", "Supplier amount", "Included km", "Included hours", "Minimum km/day", "Minimum days", "Driver/day", "Extra/km", "Extra/hour", "Waiting min", "Waiting/hour", "Time increment", "Stops included", "Extra/stop", "Included days", "Duty hours/day", "Extra/day", "Minimum method", "Trip type", "Billable day method", "Garage km", "Empty return km", "Fuel included", "Driver included"],
      ...card.regionalTransport.fares.filter((fare) => !card.regionalTransport?.enabledMethods || card.regionalTransport.enabledMethods.includes(fare.service)).map((fare) => [fare.service, fare.label, fare.routeId, fare.vehicleId, fare.packageId, fare.basis, fare.amount, fare.includedKm, fare.includedHours, fare.minKmPerDay, fare.minDays, fare.driverAllowancePerDay, fare.extraKm, fare.extraHour, fare.includedWaitingMinutes, fare.waitingRatePerHour, fare.timeIncrementMinutes, fare.includedStops, fare.extraStop, fare.includedDays, fare.dutyHoursPerDay, fare.extraDayRate, fare.minimumRule, fare.tripType, fare.billableDayMethod, fare.additionalGarageKm, fare.additionalReturnKm, fare.fuelIncluded ? "Yes" : "No", fare.driverIncluded ? "Yes" : "No"]), [],
      ["Charge", "Treatment", "Amount", "Unit", "Route IDs", "Vehicle IDs", "Fare IDs", "Trigger", "Start", "End", "Paid by", "Collected by"],
      ...card.regionalTransport.charges.map((charge) => [charge.label, charge.treatment, charge.amount, charge.unit, charge.routeIds?.join("; "), charge.vehicleIds?.join("; "), charge.fareIds?.join("; "), charge.trigger, charge.triggerStart, charge.triggerEnd, charge.paidBy, charge.collectedBy]), [],
      ["Special-date adjustment", "From", "To", "Fare methods", "Vehicles", "Value type", "Amount", "Combination"],
      ...(card.regionalTransport.adjustments || []).map((rule) => [rule.name, rule.startDate || rule.dates[0], rule.endDate || rule.startDate || rule.dates[0], rule.methods?.join("; "), rule.vehicleIds?.join("; "), rule.valueType || "fixed", rule.amount, rule.stacking]),
    ] : card.transport ? [
      ["Rate card", card.name], ["Reference", card.ref], ["Vendor", card.vendor], ["Validity", card.validity],
      ["Service", "Airport transfer"], ["Pricing method", "Fixed per vehicle, per transfer"], ["Currency", card.currency], [],
      ["Route", "Included km", ...card.transport.offerings.map((offering) => `${offering.label} · per vehicle`)],
      ...card.transport.routes.map((route) => [route.label, route.includedKm, ...card.transport!.offerings.map((offering) => route.prices[offering.id] ?? "")]),
      [], ["Vehicle", "Passenger seats excluding driver", "Bags", "Model or equivalent"],
      ...card.transport.offerings.map((offering) => [offering.label, offering.passengerSeats ?? "Unconfirmed", offering.luggageBags ?? "Unconfirmed", offering.modelOrEquivalent]),
      [], ["Waiting included (minutes)", card.transport.waitingIncludedMinutes], ["Waiting rate per billable hour, per vehicle", card.transport.waitingRatePerHour], ["Waiting rounding", card.transport.waitingRounding],
      [], ["Charge", "Treatment", "Amount", "Unit", "Paid by", "Collected by"],
      ...card.transport.charges.map((charge) => [charge.label, charge.treatment, charge.amount, charge.unit, charge.paidBy, charge.collectedBy]),
    ] : [
      ["Rate card", card.name], ["Reference", card.ref], ["Vendor", card.vendor], ["Validity", card.validity], ["Currency", card.currency], ["Season", season?.name ?? ""], [],
      ["Room / product", "Details", ...card.meals.map((meal) => meal.label)],
      ...card.rooms.map((room, roomIndex) => [room.name, room.note, ...card.meals.map((_, mealIndex) => card.prices[roomIndex]?.[mealIndex]?.[currentSeasonIndex] ?? "")]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${card.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "rate-card"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const setPrice = (roomIdx: number, mealIdx: number, value: number | null) => {
    updateCard((base) => {
      const prices = structuredClone(base.prices);
      while (prices.length <= roomIdx) {
        prices.push(base.meals.map(() => base.seasons.map(() => null as number | null)));
      }
      while (prices[roomIdx].length <= mealIdx) {
        prices[roomIdx].push(base.seasons.map(() => null as number | null));
      }
      while (prices[roomIdx][mealIdx].length <= seasonIdx) {
        prices[roomIdx][mealIdx].push(null);
      }
      prices[roomIdx][mealIdx][seasonIdx] = value;
      return { ...base, prices };
    });
  };

  const openEditSeason = () => {
    if (!editing || !season) return;
    setSeasonModal({
      mode: "edit",
      index: seasonIdx,
      name: season.name,
      priority: season.priority === "Overrides base" ? "Override" : "Base",
      ranges: [{ start: "", end: "" }],
    });
  };

  const openAddSeason = () => {
    if (!editing) return;
    setSeasonModal({
      mode: "add",
      name: "",
      priority: "Base",
      ranges: [{ start: "", end: "" }],
    });
  };

  const saveSeason = (nextSeason: Season, mode: "add" | "edit", index?: number) => {
    updateCard((base) => {
      if (mode === "edit" && index != null) {
        const current = base.seasons[index];
        const safeSeason = nextSeason.dates === "Not set" && current
          ? { ...nextSeason, dates: current.dates, summary: current.summary, nights: current.nights }
          : nextSeason;
        const seasons = base.seasons.map((s, i) => (i === index ? safeSeason : s));
        return { ...base, seasons };
      }
      const seasons = [...base.seasons, nextSeason];
      const prices = base.prices.map((room) => room.map((meal) => [...meal, null]));
      const weekendExtra = base.weekendExtra?.map((room) => [...room, null]);
      return { ...base, seasons, prices, weekendExtra };
    });
    if (mode === "add") setSeasonIdx(card.seasons.length);
    setSeasonModal(null);
  };

  const addRoom = () => {
    if (!editing) return;
    updateCard((base) => {
      const n = base.rooms.length + 1;
      const id = `room-${Date.now().toString(36)}`;
      const rooms = [
        ...base.rooms,
        {
          id,
          name: `Room ${n}`,
          note: "Add detail",
          baseOccupancy: 2,
          maxOccupancy: 3,
          maxBeds: 1,
        },
      ];
      const prices = [
        ...base.prices,
        base.meals.map(() => base.seasons.map(() => null as number | null)),
      ];
      const weekendExtra = base.weekendExtra
        ? [...base.weekendExtra, base.seasons.map(() => null as number | null)]
        : base.weekendExtra;
      return { ...base, rooms, prices, weekendExtra };
    });
  };

  const updateSeasonName = (name: string) => {
    updateCard((base) => ({
      ...base,
      seasons: base.seasons.map((item, index) => index === seasonIdx ? { ...item, name } : item),
    }));
  };

  const updateMeal = (index: number, label: string) => {
    updateCard((base) => ({
      ...base,
      meals: base.meals.map((meal, mealIndex) => mealIndex === index ? { ...meal, label } : meal),
    }));
  };

  const updateRoom = (index: number, patch: Partial<RateCardDetail["rooms"][number]>) => {
    updateCard((base) => ({
      ...base,
      rooms: base.rooms.map((room, roomIndex) => roomIndex === index ? { ...room, ...patch } : room),
    }));
  };

  const removeRoom = (index: number) => {
    updateCard((base) => {
      if (base.rooms.length <= 1) return base;
      const removedId = base.rooms[index]?.id;
      return {
        ...base,
        rooms: base.rooms.filter((_, roomIndex) => roomIndex !== index),
        prices: base.prices.filter((_, roomIndex) => roomIndex !== index),
        weekendExtra: base.weekendExtra?.filter((_, roomIndex) => roomIndex !== index),
        guests: base.guests.filter((guest) => guest[0] !== removedId),
      };
    });
  };

  const addGuest = () => {
    updateCard((base) => ({
      ...base,
      guests: [
        ...base.guests,
        [base.rooms[0]?.id ?? "room-1", "Guest", "Age band", "no_bed", "all", null, 1],
      ],
    }));
  };

  const updateGuest = (index: number, field: number, value: string | number | null) => {
    updateCard((base) => ({
      ...base,
      guests: base.guests.map((guest, guestIndex) => {
        if (guestIndex !== index) return guest;
        const next = [...guest] as RateCardDetail["guests"][number];
        next[field] = value as never;
        return next;
      }),
    }));
  };

  const removeGuest = (index: number) => {
    updateCard((base) => ({ ...base, guests: base.guests.filter((_, rowIndex) => rowIndex !== index) }));
  };

  const addSupplement = () => {
    updateCard((base) => ({
      ...base,
      supplements: [...base.supplements, { name: `Supplement ${base.supplements.length + 1}`, applies: "On request", amount: null, unit: "per person", basis: "Optional", tone: "neutral" }],
    }));
  };

  const updateSupplement = (index: number, patch: Partial<RateCardDetail["supplements"][number]>) => {
    updateCard((base) => ({ ...base, supplements: base.supplements.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row) }));
  };

  const addActivity = () => {
    updateCard((base) => ({
      ...base,
      activities: [...base.activities, { name: `Activity ${base.activities.length + 1}`, note: "Add activity detail", group: "Add capacity", basis: "Per person", amount: null }],
    }));
  };

  const updateActivity = (index: number, patch: Partial<RateCardDetail["activities"][number]>) => {
    updateCard((base) => ({ ...base, activities: base.activities.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row) }));
  };

  const addService = () => {
    updateCard((base) => ({
      ...base,
      services: [...base.services, { name: `Service ${base.services.length + 1}`, note: "Add service detail", applies: "On request", basis: "Per booking", amount: null }],
    }));
  };

  const updateService = (index: number, patch: Partial<RateCardDetail["services"][number]>) => {
    updateCard((base) => ({ ...base, services: base.services.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row) }));
  };

  const markupSection = (
    <section className="rc-markup" aria-labelledby="rc-markup-title">
      <div className="rc-markup__copy">
        <h2 id="rc-markup-title" className="rc-markup__title">Markup</h2>
        <p className="rc-markup__desc">
          Percentage added to contracted rates when calculating the selling price.
          {!canEditMarkup ? " Only owners can edit this value." : ""}
        </p>
      </div>
      <div className="rc-markup__aside">
        {markupEditing ? (
          <>
            <div className="rc-markup__field">
              <label className="rc-markup__label" htmlFor="rc-markup-pct">
                Percentage
              </label>
              <div className="rc-markup__control">
                <input
                  ref={markupInputRef}
                  id="rc-markup-pct"
                  className="rc-markup__input"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  inputMode="decimal"
                  value={markupDraft}
                  onChange={(e) => setMarkupDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveMarkup();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      cancelMarkupEdit();
                    }
                  }}
                />
                <span className="rc-markup__suffix" aria-hidden="true">%</span>
              </div>
            </div>
            <div className="rc-markup__actions">
              <Button variant="brand" size="sm" onClick={cancelMarkupEdit}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={saveMarkup}>Save</Button>
            </div>
          </>
        ) : (
          <>
            <div className="rc-markup__value" aria-live="polite">
              <span className="rc-markup__value-num pt-mono">{card.markupPercent}</span>
              <span className="rc-markup__value-unit">%</span>
            </div>
            {canEditMarkup ? (
              <Button variant="brand" size="sm" onClick={beginMarkupEdit}>
                <IconPencil />
                Edit
              </Button>
            ) : null}
          </>
        )}
      </div>
    </section>
  );

  return (
    <div className="rc-detail">
      <RecordHeader
        title={card.name}
        titleNode={
          editing ? (
            <input
              className="record-header__title"
              style={{
                width: "100%",
                maxWidth: 520,
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-md)",
                padding: "6px 12px",
                background: "var(--surface)",
                whiteSpace: "normal",
              }}
              value={card.name}
              onChange={(e) => renameCard(e.target.value)}
              aria-label="Rate card title"
            />
          ) : undefined
        }
        tags={<StatusChipWithDot tone={toneToStatus(card.tone)}>{card.state}</StatusChipWithDot>}
        date={
          <span className="record-header__date">
            <IconCalendar size={13} />
            {card.validity}
          </span>
        }
        recordId={card.ref}
        idTip="Rate card reference"
        metaExtra={
          <>
            <span className="record-header__sep" aria-hidden="true">
              ·
            </span>
            <span>{card.vendor}</span>
            <span className="record-header__sep" aria-hidden="true">
              ·
            </span>
            <span>{card.currency}</span>
          </>
        }
        aside={
          <div className="rc-record-acts">
            <Button variant="brand" size="sm" onClick={downloadRateCard}>
              <IconDownload />
              Download rate card
            </Button>
            {editing ? <>
              {card.activityTariff ? <Button variant="brand" size="sm" onClick={() => { setDraft(null); setSaveErrors([]); setEditing(false); }}>Cancel</Button> : null}
              <Button variant="primary" size="sm" onClick={card.activityTariff ? saveActivity : () => setEditing(false)}>
                {card.activityTariff ? "Save draft" : "Done editing"}
              </Button>
            </> : canEdit ? <>
              {card.activityTariff && card.state !== "Active" ? <Button variant="brand" size="sm" onClick={activateActivity}>Activate rate card</Button> : null}
              <Button variant="primary" size="sm" onClick={() => setEditing(true)}>
                <IconPencil />
                Edit rate card
              </Button>
            </> : null}
          </div>
        }
      />

      <div className="rc-tabs">
        <TabBar
          items={tabs}
          value={page}
          onValueChange={(id) => setPage(id as DetailPageTab)}
          aria-label="Rate card sections"
        />
      </div>

      {saveErrors.length ? <div className="activity-rate-save-errors" role="alert"><strong>Complete these rate-card details</strong><ul>{saveErrors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}

      {page === "ratecard" && card.activityTariff ? <div className="rc-ratecard rc-ratecard--transport"><ActivityRateDetails card={card} options={activityOptions} editing={editing && canEdit} onChange={(activityTariff) => { setSaveErrors([]); updateCard((base) => ({ ...base, activityTariff })); }} />{markupSection}</div> : page === "ratecard" && card.privateTransport ? (
        <div className="rc-ratecard rc-ratecard--transport"><PrivateTransportRates card={card} editing={editing} onChange={(privateTransport) => updateCard((base) => ({ ...base, privateTransport, state: privateTransport.status, tone: privateTransport.status === "Active" ? "success" : "warning", validity: `${privateTransport.validFrom} – ${privateTransport.validTo}` }))} />{markupSection}</div>
      ) : page === "ratecard" && card.regionalTransport ? (
        <div className="rc-ratecard rc-ratecard--transport"><RegionalTransportRates card={card} editing={editing} onChange={(regionalTransport) => updateCard((base) => {
          const ordered = [...regionalTransport.seasons].sort((a, b) => a.start.localeCompare(b.start));
          const formatDate = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
          const validity = ordered.length ? `${formatDate(ordered[0].start)} – ${formatDate(ordered.reduce((latest, item) => item.end > latest ? item.end : latest, ordered[0].end))}` : base.validity;
          return { ...base, regionalTransport, validity, seasons: regionalTransport.seasons.map((item) => ({ name: item.name, colorToken: "accent" as const, dates: `${formatDate(item.start)} – ${formatDate(item.end)}`, summary: "Supplier cost", nights: Math.max(1, Math.round((Date.parse(item.end) - Date.parse(item.start)) / 86400000) + 1), priority: "Base" })) };
        })} />{markupSection}</div>
      ) : page === "ratecard" && card.transport ? (
        <div className="rc-ratecard rc-ratecard--transport">
          <TransportRateDetails
            card={card}
            editing={editing}
            onChange={(transport) => updateCard((base) => ({
              ...base,
              transport,
              prices: transport.routes.map((route) => transport.offerings.map((offering) => [route.prices[offering.id] ?? null])),
            }))}
          />
          {markupSection}
        </div>
      ) : page === "ratecard" ? (
        <div className="rc-ratecard">
          <div className="rc-season">
            <div className="rc-season__picker" ref={seasonRef}>
              <span className="rc-season__label">Season</span>
              {editing && season ? (
                <div className={`rc-season__edit-control${seasonOpen ? " rc-season__edit-control--open" : ""}`}>
                  <IconCalendar size={13} />
                  <div className="rc-season__edit-copy">
                    <input
                      className="rc-season__name-input"
                      value={season.name}
                      onChange={(event) => updateSeasonName(event.target.value)}
                      aria-label="Season name"
                    />
                    <span>{season.dates} · {season.priority}</span>
                  </div>
                  <button
                    type="button"
                    className="rc-season__choose"
                    onClick={() => setSeasonOpen((open) => !open)}
                    aria-label="Choose season"
                    aria-expanded={seasonOpen}
                    aria-haspopup="listbox"
                  >
                    <IconChevronDown size={13} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={`rc-season__btn${seasonOpen ? " rc-season__btn--open" : ""}`}
                  onClick={() => setSeasonOpen((o) => !o)}
                  aria-expanded={seasonOpen}
                  aria-haspopup="listbox"
                >
                  <span className="rc-season__value">
                    <IconCalendar size={13} />
                    {season
                      ? `${season.name} · ${season.dates} · ${season.priority}`
                      : "No seasons yet"}
                  </span>
                  <IconChevronDown size={13} />
                </button>
              )}
              {seasonOpen ? (
                <div className="rc-season__menu" role="listbox">
                  {card.seasons.map((s, i) => (
                    <button
                      key={s.name}
                      type="button"
                      role="option"
                      aria-selected={i === seasonIdx}
                      className={`rc-season__option${i === seasonIdx ? " rc-season__option--on" : ""}`}
                      onClick={() => {
                        setSeasonIdx(i);
                        setSeasonOpen(false);
                      }}
                    >
                      <span className="rc-season__option-copy">
                        <span className="rc-season__option-name">{s.name}</span>
                        <span className="rc-season__option-dates">{s.dates}</span>
                      </span>
                      <StatusChip tone="open">{s.priority}</StatusChip>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="rc-season__actions">
              <Button
                variant="brand"
                size="sm"
                disabled={!editing}
                onClick={openEditSeason}
              >
                Edit current season
              </Button>
              <Button variant="primary" size="sm" disabled={!editing} onClick={openAddSeason}>
                <IconPlus />
                Add season
              </Button>
            </div>
          </div>

          <Section
            title={catLabel(card, "accommodation", "Stay / product pricing")}
            action={
              editing ? (
                <Button variant="brand" size="sm" onClick={addRoom}>
                  <IconPlus />
                  Add room
                </Button>
              ) : undefined
            }
          >
            <DataSheet
              className="rc-sheet rc-sheet--pricing"
              style={sheetCols(
                `minmax(220px, 1.6fr) repeat(${card.meals.length}, minmax(130px, 1fr))`,
              )}
              aria-label={catLabel(card, "accommodation", "Stay / product pricing")}
            >
              <DataSheetHeader>
                <DataSheetCell>Room / product</DataSheetCell>
                {card.meals.map((m, mealIndex) => (
                  <DataSheetCell key={m.code}>
                    {editing ? (
                      <input
                        className="rc-edit-input rc-edit-input--header"
                        value={m.label}
                        onChange={(event) => updateMeal(mealIndex, event.target.value)}
                        aria-label={`${m.code} product name`}
                      />
                    ) : m.label}
                  </DataSheetCell>
                ))}
              </DataSheetHeader>
              {card.rooms.map((room, ri) => (
                <DataSheetRow key={room.id}>
                  <DataSheetCell>
                    {editing ? (
                      <div className="rc-room-editor">
                        <div className="rc-room-editor__head">
                          <input
                            className="rc-edit-input rc-edit-input--strong"
                            value={room.name}
                            onChange={(event) => updateRoom(ri, { name: event.target.value })}
                            aria-label={`Room ${ri + 1} name`}
                          />
                          {card.rooms.length > 1 ? (
                            <button type="button" className="rc-edit-remove" onClick={() => removeRoom(ri)} aria-label={`Remove ${room.name}`}>
                              <IconClose size={13} />
                            </button>
                          ) : null}
                        </div>
                        <input
                          className="rc-edit-input"
                          value={room.note}
                          onChange={(event) => updateRoom(ri, { note: event.target.value })}
                          aria-label={`${room.name} detail`}
                        />
                        <div className="rc-room-editor__occupancy">
                          <label><span>Base adults</span><input type="number" min={1} value={room.baseOccupancy} onChange={(event) => updateRoom(ri, { baseOccupancy: Math.max(1, Number(event.target.value) || 1) })} /></label>
                          <label><span>Max adults</span><input type="number" min={1} value={room.maxOccupancy} onChange={(event) => updateRoom(ri, { maxOccupancy: Math.max(1, Number(event.target.value) || 1) })} /></label>
                          <label><span>Max toddlers / beds</span><input type="number" min={0} value={room.maxBeds} onChange={(event) => updateRoom(ri, { maxBeds: Math.max(0, Number(event.target.value) || 0) })} /></label>
                        </div>
                      </div>
                    ) : (
                      <LeadCell
                        align="start"
                        icon={<IconBed size={15} />}
                        title={room.name}
                        subtitle={`${room.note} · incl. ${room.baseOccupancy} / max ${room.maxOccupancy}`}
                      />
                    )}
                  </DataSheetCell>
                  {card.meals.map((_, mi) => {
                    const amount = card.prices[ri]?.[mi]?.[seasonIdx] ?? null;
                    const weekend = card.weekendExtra?.[ri]?.[seasonIdx];
                    return (
                      <DataSheetCell key={`${room.id}-${mi}`}>
                        <PriceChip
                          amount={amount}
                          currency={card.currency}
                          taxConfirmed={card.taxConfirmed}
                          editing={editing}
                          onChange={(next) => setPrice(ri, mi, next)}
                          sub={
                            weekend != null && card.hasWeekendExtra
                              ? `+${formatMoney(weekend, card.currency)} Fri–Sat`
                              : undefined
                          }
                        />
                      </DataSheetCell>
                    );
                  })}
                </DataSheetRow>
              ))}
            </DataSheet>
          </Section>

          {card.guests.length > 0 || editing ? (
            <Section
              title={catLabel(card, "guests", "Extra guest and bed charges")}
              action={editing ? <Button variant="brand" size="sm" onClick={addGuest}><IconPlus />Add guest charge</Button> : undefined}
            >
              <DataSheet
                className="rc-sheet rc-sheet--guests"
                style={sheetCols(
                  `minmax(180px, 1.2fr) minmax(120px, 1fr) minmax(100px, 0.9fr) minmax(140px, 1.1fr) minmax(120px, 0.9fr) minmax(80px, 0.6fr)${editing ? " 64px" : ""}`,
                )}
                aria-label={catLabel(card, "guests", "Extra guest and bed charges")}
              >
                <DataSheetHeader>
                  <DataSheetCell>Room</DataSheetCell>
                  <DataSheetCell>Guest</DataSheetCell>
                  <DataSheetCell>Age</DataSheetCell>
                  <DataSheetCell>Bed</DataSheetCell>
                  <DataSheetCell>Charge</DataSheetCell>
                  <DataSheetCell>Max</DataSheetCell>
                  {editing ? <DataSheetCell>Action</DataSheetCell> : null}
                </DataSheetHeader>
                {card.guests.slice(0, 12).map((g, i) => {
                  const room = card.rooms.find((r) => r.id === g[0]);
                  return (
                    <DataSheetRow key={i}>
                      <DataSheetCell>
                        {editing ? (
                          <select className="rc-edit-input" value={g[0]} onChange={(event) => updateGuest(i, 0, event.target.value)} aria-label={`Guest row ${i + 1} room`}>
                            {card.rooms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                          </select>
                        ) : <LeadCell icon={<IconHotel size={15} />} title={room?.name ?? g[0]} />}
                      </DataSheetCell>
                      <DataSheetCell>
                        {editing ? <input className="rc-edit-input" value={g[1]} onChange={(event) => updateGuest(i, 1, event.target.value)} aria-label={`Guest row ${i + 1} type`} /> : <CellIcon icon={<IconUser size={13} />}>{g[1]}</CellIcon>}
                      </DataSheetCell>
                      <DataSheetCell>
                        {editing ? <input className="rc-edit-input" value={g[2]} onChange={(event) => updateGuest(i, 2, event.target.value)} aria-label={`Guest row ${i + 1} age`} /> : <CellIcon icon={<IconCalendar size={13} />}>{g[2]}</CellIcon>}
                      </DataSheetCell>
                      <DataSheetCell>
                        {editing ? (
                          <select className="rc-edit-input" value={g[3]} onChange={(event) => updateGuest(i, 3, event.target.value)} aria-label={`Guest row ${i + 1} bed`}>
                            {Object.entries(BED_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                        ) : <CellIcon icon={<IconBed size={13} />}>{BED_LABEL[g[3]] ?? g[3]}</CellIcon>}
                      </DataSheetCell>
                      <DataSheetCell>
                        <PriceChip
                          amount={g[5]}
                          currency={card.currency}
                          taxConfirmed={card.taxConfirmed}
                          editing={editing}
                          onChange={(next) => updateGuest(i, 5, next)}
                        />
                      </DataSheetCell>
                      <DataSheetCell>
                        {editing ? <input className="rc-edit-input rc-edit-input--number" type="number" min={0} value={g[6]} onChange={(event) => updateGuest(i, 6, Math.max(0, Number(event.target.value) || 0))} aria-label={`Guest row ${i + 1} maximum`} /> : <span className="pt-mono rc-sheet__max">{g[6]}</span>}
                      </DataSheetCell>
                      {editing ? <DataSheetCell><button type="button" className="rc-edit-remove" onClick={() => removeGuest(i)} aria-label={`Remove guest charge ${i + 1}`}><IconClose size={13} /></button></DataSheetCell> : null}
                    </DataSheetRow>
                  );
                })}
              </DataSheet>
            </Section>
          ) : null}

          <Section
            title={catLabel(card, "special", "Supplements")}
            action={editing ? <Button variant="brand" size="sm" onClick={addSupplement}><IconPlus />Add supplement</Button> : undefined}
          >
            <DataSheet
              className="rc-sheet rc-sheet--supplements"
              style={sheetCols(
                `minmax(200px, 1.5fr) minmax(160px, 1.2fr) minmax(120px, 0.9fr) minmax(120px, 0.9fr)${editing ? " 64px" : ""}`,
              )}
              aria-label={catLabel(card, "special", "Supplements")}
            >
              <DataSheetHeader>
                <DataSheetCell>Supplement</DataSheetCell>
                <DataSheetCell>Applies</DataSheetCell>
                <DataSheetCell>Basis</DataSheetCell>
                <DataSheetCell>Amount</DataSheetCell>
                {editing ? <DataSheetCell>Action</DataSheetCell> : null}
              </DataSheetHeader>
              {card.supplements.length === 0 ? (
                <DataSheetRow>
                  <DataSheetCell>
                    <span className="rc-sheet__empty">No supplements on this card.</span>
                  </DataSheetCell>
                  <DataSheetCell />
                  <DataSheetCell />
                  <DataSheetCell />
                  {editing ? <DataSheetCell /> : null}
                </DataSheetRow>
              ) : (
                card.supplements.map((s, supplementIndex) => (
                  <DataSheetRow key={`${supplementIndex}-${s.name}`}>
                    <DataSheetCell>
                      {editing ? <div className="rc-edit-stack"><input className="rc-edit-input rc-edit-input--strong" value={s.name} onChange={(event) => updateSupplement(supplementIndex, { name: event.target.value })} aria-label={`Supplement ${supplementIndex + 1} name`} /><input className="rc-edit-input" value={s.unit} onChange={(event) => updateSupplement(supplementIndex, { unit: event.target.value })} aria-label={`${s.name} unit`} /></div> : <LeadCell align="start" icon={<IconCard size={15} />} title={s.name} subtitle={s.unit} />}
                    </DataSheetCell>
                    <DataSheetCell>
                      {editing ? <input className="rc-edit-input" value={s.applies} onChange={(event) => updateSupplement(supplementIndex, { applies: event.target.value })} aria-label={`${s.name} applies`} /> : <CellIcon icon={<IconCalendar size={13} />}>{s.applies}</CellIcon>}
                    </DataSheetCell>
                    <DataSheetCell>
                      {editing ? <select className="rc-edit-input" value={s.basis} onChange={(event) => updateSupplement(supplementIndex, { basis: event.target.value, tone: event.target.value === "Mandatory" ? "danger" : event.target.value === "Unresolved" ? "warning" : "neutral" })} aria-label={`${s.name} basis`}><option>Mandatory</option><option>Optional</option><option>Unresolved</option><option>Included</option></select> : <StatusChip tone={toneToStatus(s.tone)}>{s.basis}</StatusChip>}
                    </DataSheetCell>
                    <DataSheetCell>
                      <PriceChip
                        amount={s.amount}
                        currency={card.currency}
                        taxConfirmed={card.taxConfirmed}
                        editing={editing}
                        onChange={(next) => updateSupplement(supplementIndex, { amount: next })}
                      />
                    </DataSheetCell>
                    {editing ? <DataSheetCell><button type="button" className="rc-edit-remove" onClick={() => updateCard((base) => ({ ...base, supplements: base.supplements.filter((_, index) => index !== supplementIndex) }))} aria-label={`Remove ${s.name}`}><IconClose size={13} /></button></DataSheetCell> : null}
                  </DataSheetRow>
                ))
              )}
            </DataSheet>
          </Section>

          <Section
            title={catLabel(card, "activities", "Activities")}
            action={editing ? <Button variant="brand" size="sm" onClick={addActivity}><IconPlus />Add activity</Button> : undefined}
          >
            <DataSheet
              className="rc-sheet rc-sheet--activities"
              style={sheetCols(
                `minmax(220px, 1.6fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(120px, 0.9fr)${editing ? " 64px" : ""}`,
              )}
              aria-label={catLabel(card, "activities", "Activities")}
            >
              <DataSheetHeader>
                <DataSheetCell>Activity</DataSheetCell>
                <DataSheetCell>Group</DataSheetCell>
                <DataSheetCell>Basis</DataSheetCell>
                <DataSheetCell>Amount</DataSheetCell>
                {editing ? <DataSheetCell>Action</DataSheetCell> : null}
              </DataSheetHeader>
              {card.activities.length === 0 ? (
                <DataSheetRow>
                  <DataSheetCell>
                    <span className="rc-sheet__empty">No activities on this card.</span>
                  </DataSheetCell>
                  <DataSheetCell />
                  <DataSheetCell />
                  <DataSheetCell />
                  {editing ? <DataSheetCell /> : null}
                </DataSheetRow>
              ) : (
                card.activities.map((a, activityIndex) => (
                  <DataSheetRow key={`${activityIndex}-${a.name}`}>
                    <DataSheetCell>
                      {editing ? <div className="rc-edit-stack"><input className="rc-edit-input rc-edit-input--strong" value={a.name} onChange={(event) => updateActivity(activityIndex, { name: event.target.value })} aria-label={`Activity ${activityIndex + 1} name`} /><input className="rc-edit-input" value={a.note} onChange={(event) => updateActivity(activityIndex, { note: event.target.value })} aria-label={`${a.name} detail`} /></div> : <LeadCell align="start" icon={<IconCamera size={15} />} title={a.name} subtitle={a.note} />}
                    </DataSheetCell>
                    <DataSheetCell>
                      {editing ? <input className="rc-edit-input" value={a.group} onChange={(event) => updateActivity(activityIndex, { group: event.target.value })} aria-label={`${a.name} capacity`} /> : <CellIcon icon={<IconPin size={13} />}>{a.group}</CellIcon>}
                    </DataSheetCell>
                    <DataSheetCell>
                      {editing ? <input className="rc-edit-input" value={a.basis} onChange={(event) => updateActivity(activityIndex, { basis: event.target.value })} aria-label={`${a.name} basis`} /> : <CellIcon icon={<IconBookmark size={12} />}>{a.basis}</CellIcon>}
                    </DataSheetCell>
                    <DataSheetCell>
                      <PriceChip
                        amount={a.amount}
                        currency={card.currency}
                        taxConfirmed={card.taxConfirmed}
                        editing={editing}
                        onChange={(next) => updateActivity(activityIndex, { amount: next })}
                      />
                    </DataSheetCell>
                    {editing ? <DataSheetCell><button type="button" className="rc-edit-remove" onClick={() => updateCard((base) => ({ ...base, activities: base.activities.filter((_, index) => index !== activityIndex) }))} aria-label={`Remove ${a.name}`}><IconClose size={13} /></button></DataSheetCell> : null}
                  </DataSheetRow>
                ))
              )}
            </DataSheet>
          </Section>

          <Section
            title={catLabel(card, "services", "Services")}
            action={editing ? <Button variant="brand" size="sm" onClick={addService}><IconPlus />Add service</Button> : undefined}
          >
            <DataSheet
              className="rc-sheet rc-sheet--services"
              style={sheetCols(
                `minmax(220px, 1.6fr) minmax(140px, 1fr) minmax(120px, 1fr) minmax(120px, 0.9fr)${editing ? " 64px" : ""}`,
              )}
              aria-label={catLabel(card, "services", "Services")}
            >
              <DataSheetHeader>
                <DataSheetCell>Service</DataSheetCell>
                <DataSheetCell>Applies</DataSheetCell>
                <DataSheetCell>Basis</DataSheetCell>
                <DataSheetCell>Amount</DataSheetCell>
                {editing ? <DataSheetCell>Action</DataSheetCell> : null}
              </DataSheetHeader>
              {card.services.length === 0 ? (
                <DataSheetRow>
                  <DataSheetCell>
                    <span className="rc-sheet__empty">No services on this card.</span>
                  </DataSheetCell>
                  <DataSheetCell />
                  <DataSheetCell />
                  <DataSheetCell />
                  {editing ? <DataSheetCell /> : null}
                </DataSheetRow>
              ) : (
                card.services.map((s, serviceIndex) => (
                  <DataSheetRow key={`${serviceIndex}-${s.name}`}>
                    <DataSheetCell>
                      {editing ? <div className="rc-edit-stack"><input className="rc-edit-input rc-edit-input--strong" value={s.name} onChange={(event) => updateService(serviceIndex, { name: event.target.value })} aria-label={`Service ${serviceIndex + 1} name`} /><input className="rc-edit-input" value={s.note} onChange={(event) => updateService(serviceIndex, { note: event.target.value })} aria-label={`${s.name} detail`} /></div> : <LeadCell align="start" icon={<IconPin size={15} />} title={s.name} subtitle={s.note} />}
                    </DataSheetCell>
                    <DataSheetCell>
                      {editing ? <input className="rc-edit-input" value={s.applies} onChange={(event) => updateService(serviceIndex, { applies: event.target.value })} aria-label={`${s.name} applies`} /> : <CellIcon icon={<IconCalendar size={13} />}>{s.applies}</CellIcon>}
                    </DataSheetCell>
                    <DataSheetCell>
                      {editing ? <input className="rc-edit-input" value={s.basis} onChange={(event) => updateService(serviceIndex, { basis: event.target.value })} aria-label={`${s.name} basis`} /> : <CellIcon icon={<IconBookmark size={12} />}>{s.basis}</CellIcon>}
                    </DataSheetCell>
                    <DataSheetCell>
                      <PriceChip
                        amount={s.amount}
                        currency={card.currency}
                        taxConfirmed={card.taxConfirmed}
                        sub={s.amount === 0 ? "Complimentary" : undefined}
                        editing={editing}
                        onChange={(next) => updateService(serviceIndex, { amount: next })}
                      />
                    </DataSheetCell>
                    {editing ? <DataSheetCell><button type="button" className="rc-edit-remove" onClick={() => updateCard((base) => ({ ...base, services: base.services.filter((_, index) => index !== serviceIndex) }))} aria-label={`Remove ${s.name}`}><IconClose size={13} /></button></DataSheetCell> : null}
                  </DataSheetRow>
                ))
              )}
            </DataSheet>
          </Section>

          {markupSection}
        </div>
      ) : null}

      {page === "test" && card.activityTariff ? <ActivityTestRate card={card} options={activityOptions} /> : page === "test" && card.privateTransport ? <PrivateTransportTest card={card} /> : page === "test" && card.regionalTransport ? <RegionalTransportTest card={card} /> : page === "test" && card.transport ? <TransportTestRate card={card} /> : page === "test" ? (
        <div className="rc-test">
          <div className="rc-test__layout">
            <section className="rc-test__block" aria-labelledby="rc-test-inputs-title">
              <div className="rc-test__block-head">
                <div>
                  <p className="rc-test__eyebrow">Rate card · {card.ref}</p>
                  <h2 id="rc-test-inputs-title" className="rc-test__title">
                    Stay inputs
                  </h2>
                  <p className="rc-test__sub">
                    Quote recalculates from this card’s seasons, weekend extras, occupancy, and guest bands.
                  </p>
                </div>
              </div>
              <div className="rc-test__block-body">
                <div className="rc-test__fields">
                  <div className="rc-test__field">
                    <label className="rc-test__label" htmlFor="rc-checkin">
                      Check-in
                    </label>
                    <select
                      id="rc-checkin"
                      className="rc-test__control"
                      value={quote.checkIn}
                      onChange={(e) => setQuote((q) => ({ ...q, checkIn: Number(e.target.value) }))}
                    >
                      {TEST_DATES.map(([label], i) => (
                        <option key={label} value={i}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rc-test__field">
                    <label className="rc-test__label" htmlFor="rc-nights">
                      Nights
                    </label>
                    <input
                      id="rc-nights"
                      className="rc-test__control"
                      type="number"
                      min={1}
                      max={14}
                      value={quote.nights}
                      onChange={(e) =>
                        setQuote((q) => ({ ...q, nights: Number(e.target.value) || 1 }))
                      }
                    />
                  </div>
                  <div className="rc-test__field">
                    <label className="rc-test__label" htmlFor="rc-room">
                      Room type
                    </label>
                    <select
                      id="rc-room"
                      className="rc-test__control"
                      value={quote.roomIndex}
                      onChange={(e) =>
                        setQuote((q) => ({ ...q, roomIndex: Number(e.target.value) }))
                      }
                    >
                      {card.rooms.map((r, i) => (
                        <option key={r.id} value={i}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="rc-test__field">
                    <label className="rc-test__label" htmlFor="rc-meal">
                      {card.mealLabel}
                    </label>
                    <select
                      id="rc-meal"
                      className="rc-test__control"
                      value={quote.mealIndex}
                      onChange={(e) =>
                        setQuote((q) => ({ ...q, mealIndex: Number(e.target.value) }))
                      }
                    >
                      {card.meals.map((m, i) => (
                        <option key={m.code} value={i}>
                          {m.code} — {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="rc-test__travellers">
                  <div className="rc-test__travellers-head">
                    <span className="rc-test__travellers-label">Travellers</span>
                    <span className="rc-test__pax">{quoteResult.paxSummary}</span>
                  </div>

                  <div className="rc-test__fields rc-test__fields--2">
                    <div className="rc-test__field">
                      <label className="rc-test__label" htmlFor="rc-adults">
                        Adults
                      </label>
                      <select
                        id="rc-adults"
                        className="rc-test__control"
                        value={quote.adults}
                        onChange={(e) =>
                          setQuote((q) => ({ ...q, adults: Number(e.target.value) || 1 }))
                        }
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="rc-test__field">
                      <label className="rc-test__label" htmlFor="rc-rooms">
                        Rooms
                      </label>
                      <select
                        id="rc-rooms"
                        className="rc-test__control"
                        value={quote.rooms}
                        onChange={(e) =>
                          setQuote((q) => ({ ...q, rooms: Number(e.target.value) || 1 }))
                        }
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="rc-test__children">
                    {quote.children.map((ch, i) => (
                      <div key={i} className="rc-test__child-row">
                        <span className="rc-test__child-label">Child {i + 1}</span>
                        <select
                          className="rc-test__control rc-test__control--sm"
                          aria-label={`Child ${i + 1} age`}
                          value={ch.age}
                          onChange={(e) => {
                            const age = Number(e.target.value);
                            setQuote((q) => ({
                              ...q,
                              children: q.children.map((c, j) => (j === i ? { ...c, age } : c)),
                            }));
                          }}
                        >
                          {Array.from({ length: 17 }, (_, a) => (
                            <option key={a} value={a}>
                              {a} yrs
                            </option>
                          ))}
                        </select>
                        <select
                          className="rc-test__control rc-test__control--sm"
                          aria-label={`Child ${i + 1} extra bed`}
                          value={ch.bed}
                          onChange={(e) => {
                            const bed = e.target.value as "yes" | "no";
                            setQuote((q) => ({
                              ...q,
                              children: q.children.map((c, j) => (j === i ? { ...c, bed } : c)),
                            }));
                          }}
                        >
                          <option value="no">No extra bed</option>
                          <option value="yes">With extra bed</option>
                        </select>
                        <button
                          type="button"
                          className="rc-test__child-remove"
                          aria-label={`Remove child ${i + 1}`}
                          onClick={() =>
                            setQuote((q) => ({
                              ...q,
                              children: q.children.filter((_, j) => j !== i),
                            }))
                          }
                        >
                          <IconClose size={13} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="rc-test__add-child"
                      onClick={() =>
                        setQuote((q) => ({
                          ...q,
                          children: [...q.children, { age: 8, bed: "no" }],
                        }))
                      }
                    >
                      <IconPlus />
                      Add child
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="rc-test__reset"
                  onClick={() => setQuote({ ...DEFAULT_QUOTE })}
                >
                  Reset to defaults
                </button>

                <p className="rc-test__note">
                  Nights are consecutive from check-in. Weekend flat extras apply on Sat/Sun. Child
                  charges use age and bed bands from Extra guest charges — they never stack with an
                  extra-adult charge on the same guest.
                </p>
              </div>
            </section>

            <section className="rc-test__block rc-test__block--quote" aria-labelledby="rc-test-quote-title">
              <div className="rc-test__block-head">
                <div>
                  <p className="rc-test__eyebrow">Live quote</p>
                  <h2 id="rc-test-quote-title" className="rc-test__title">
                    Quote
                  </h2>
                  <p className="rc-test__sub">{quoteResult.nightsLabel}</p>
                </div>
                <div className="rc-test__total" aria-live="polite">
                  <span className="rc-test__total-label">{quoteResult.totalLabel}</span>
                  <span className="rc-test__total-value">
                    {quoteResult.total == null
                      ? "—"
                      : formatMoney(quoteResult.total, card.currency)}
                  </span>
                  <span className="rc-test__total-note">{quoteResult.totalNote}</span>
                </div>
              </div>

              <div className="rc-test__block-body">
                {quoteResult.blocker ? (
                  <div className="rc-test__blocker" role="alert">
                    <StatusChip tone="blocked">Blocked</StatusChip>
                    <span>{quoteResult.blocker}</span>
                  </div>
                ) : null}

                <div className="rc-test__nights" aria-label="Night-by-night resolution">
                  <div className="rc-test__nights-head">
                    <span>Night</span>
                    <span>Price set</span>
                    <span>Rule</span>
                    <span>Room</span>
                    <span>Guests</span>
                  </div>
                  {quoteResult.nights.map((n) => (
                    <div key={n.date} className="rc-test__nights-row">
                      <span className="rc-test__nights-date">{n.date}</span>
                      <span className="rc-test__nights-season">
                        <StatusChipWithDot
                          tone={
                            n.ruleTone === "danger"
                              ? "blocked"
                              : n.season.toLowerCase().includes("peak")
                                ? "progress"
                                : "done"
                          }
                        >
                          {n.season}
                        </StatusChipWithDot>
                      </span>
                      <span>
                        <StatusChip
                          tone={
                            n.ruleTone === "danger"
                              ? "blocked"
                              : n.ruleTone === "weekend"
                                ? "open"
                                : n.ruleTone === "warn"
                                  ? "progress"
                                  : "open"
                          }
                        >
                          {n.rule}
                        </StatusChip>
                      </span>
                      <span className="pt-mono">
                        {n.roomAmount == null ? "—" : formatMoney(n.roomAmount, card.currency)}
                      </span>
                      <span className="pt-mono">
                        {n.guestAmount === 0 ? "—" : formatMoney(n.guestAmount, card.currency)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rc-test__lines" aria-label="Quote buildup">
                  {quoteResult.lines.map((line, i) => (
                    <div
                      key={i}
                      className={`rc-test__line${line.emphasis ? " rc-test__line--emphasis" : ""}`}
                    >
                      <div className="rc-test__line-copy">
                        <div className="rc-test__line-label">{line.label}</div>
                        {line.note ? <div className="rc-test__line-note">{line.note}</div> : null}
                      </div>
                      <div className="rc-test__line-amount pt-mono">
                        {line.label === "Tax" && line.amount === 0
                          ? "—"
                          : line.amount == null
                            ? "—"
                            : formatMoney(line.amount, card.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {page === "policies" ? <PoliciesPanel policies={card.activityTariff ? [{ id: "activity-commercial", title: "Supplier commercial policy", category: "Commercial", summary: card.activityTariff.commercialPolicy || "Not yet recorded", body: card.activityTariff.commercialPolicy || "Add supplier commercial terms to the rate card.", document: null, status: card.activityTariff.commercialPolicy ? "ok" : "unresolved" }] : card.policies} /> : null}

      {page === "versions" && card.activityTariff ? <section className="rtw-section activity-rate__versions"><div className="rtw-section__head"><h2>Saved versions</h2></div><div className="rtw-scroll"><table className="rtw-table"><thead><tr><th>Version</th><th>Saved</th><th>Validity</th><th>Prices</th></tr></thead><tbody>{(card.activityVersions ?? []).map((item) => <tr key={item.version}><td>Version {item.version}</td><td>{new Date(item.savedAt).toLocaleString()}</td><td>{item.tariff.validFrom} – {item.tariff.validTo}</td><td>{item.tariff.personRates.length + item.tariff.bookingRates.length + item.tariff.unitRates.length} rows</td></tr>)}</tbody></table></div>{!card.activityVersions?.length ? <div className="rtw-table-foot">The first saved draft will appear here.</div> : null}</section> : null}

      {page === "activity" ? (
        <ActivityPanel
          rows={activityFromEvents(card.activity)}
          searchPlaceholder="Search rate card activity"
          variant="timeline"
        />
      ) : null}

      <SeasonEditorModal
        open={Boolean(seasonModal)}
        draft={seasonModal}
        onChange={setSeasonModal}
        onClose={() => setSeasonModal(null)}
        onSave={saveSeason}
      />
    </div>
  );
}
