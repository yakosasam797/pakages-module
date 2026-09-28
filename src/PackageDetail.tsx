import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Avatar,
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  DetailPage,
  FilterSelect,
  Icon,
  IconButton,
  Modal,
  SearchField,
  StatusSelect,
  StackCell,
  StackLine,
  TabBar,
  TextField,
} from "@paryatech/ui";
import type { IconName, TabItem } from "@paryatech/ui";
import type { PackageRecord } from "./App";
import type { ProposalDay, ProposalRecord } from "./proposalModel";
import { useStepNavigation } from "./useStepNavigation";
import type { StepNavigationHandle, StepNavigationSnapshot } from "./useStepNavigation";
import baliHero from "./assets/bali/bali-rice-terraces-hero.jpg";
import baliHotel from "./assets/bali/ubud-resort-suite.jpg";
import baliTemple from "./assets/bali/ubud-temple.jpg";
import baliIsland from "./assets/bali/nusa-penida.jpg";
import privateTransfer from "./assets/bali/private-transfer.jpg";
import honeymoonHero from "./assets/destinations/bali-honeymoon.jpg";
import himachalHero from "./assets/destinations/himachal.jpg";
import rajasthanHero from "./assets/destinations/rajasthan.jpg";
import dubaiHero from "./assets/destinations/dubai.jpg";
import keralaHero from "./assets/destinations/kerala.jpg";

type ItemKind = "flight" | "transfer" | "stay" | "activity" | "meal" | "other";

interface ItineraryItem {
  id: string;
  kind: ItemKind;
  title: string;
  meta: string;
  detail?: string;
  image?: string;
  imageAlt?: string;
  times?: { from: string; fromPlace: string; to: string; toPlace: string };
}

interface ItineraryDay {
  id: string;
  day: number;
  date: string;
  title: string;
  place: string;
  description?: string;
  highlights?: string[];
  image?: string;
  items: ItineraryItem[];
}

interface Profile {
  route: string;
  arrival: string;
  placeA: string;
  placeB: string;
  activityA: string;
  activityB: string;
  hotelA: string;
  hotelB: string;
  hero: string;
  highlights: string[];
}

const profiles: Record<string, Profile> = {
  "PKG-0241": {
    route: "Denpasar · Ubud · Nusa Penida · Seminyak",
    arrival: "Denpasar",
    placeA: "Ubud",
    placeB: "Seminyak",
    activityA: "Ubud temples and rice terraces",
    activityB: "Nusa Penida island experience",
    hotelA: "Teras Ubud Resort",
    hotelB: "The Coast Seminyak",
    hero: baliHero,
    highlights: [
      "Move from Ubud's temple country to Seminyak's coast without rushing the journey.",
      "Pair guided cultural experiences with a full island day in Nusa Penida.",
      "Keep space for independent meals, local discoveries and optional experiences.",
    ],
  },
  "PKG-0238": {
    route: "Denpasar · Ubud · Nusa Dua · Seminyak",
    arrival: "Denpasar",
    placeA: "Ubud",
    placeB: "Nusa Dua",
    activityA: "Private Ubud culture trail",
    activityB: "Sunset coast experience",
    hotelA: "Ubud Valley Retreat",
    hotelB: "Nusa Dua Beach Resort",
    hero: honeymoonHero,
    highlights: ["Stay in two distinct parts of Bali.", "Balance private experiences with relaxed coastal time.", "Use flexible service preferences that can be tailored at proposal time."],
  },
  "PKG-0232": {
    route: "Chandigarh · Shimla · Manali",
    arrival: "Chandigarh",
    placeA: "Shimla",
    placeB: "Manali",
    activityA: "Shimla and Kufri sightseeing",
    activityB: "Solang Valley and Manali trail",
    hotelA: "Woodrina Shimla",
    hotelB: "Shuru House Manali",
    hero: himachalHero,
    highlights: ["Travel through Shimla and Manali at a comfortable pace.", "Combine mountain stays with guided local sightseeing.", "Keep transport flexible until live availability is confirmed."],
  },
  "PKG-0226": {
    route: "Jaipur · Jodhpur · Udaipur",
    arrival: "Jaipur",
    placeA: "Jaipur",
    placeB: "Udaipur",
    activityA: "Amber Fort and old-city walk",
    activityB: "Udaipur lakes and palace circuit",
    hotelA: "Samode Haveli Jaipur",
    hotelB: "Lakeview House Udaipur",
    hero: rajasthanHero,
    highlights: ["Connect Rajasthan's heritage cities in one clear route.", "Mix landmark visits with time inside the old cities.", "Use hand-picked stays as anchors for each destination."],
  },
  "PKG-0219": {
    route: "Dubai · Abu Dhabi · Dubai",
    arrival: "Dubai",
    placeA: "Downtown Dubai",
    placeB: "Dubai Marina",
    activityA: "Old Dubai and desert experience",
    activityB: "Abu Dhabi city and mosque tour",
    hotelA: "Vida Downtown",
    hotelB: "Marina View Hotel",
    hero: dubaiHero,
    highlights: ["See old and new Dubai in a compact city journey.", "Include a full Abu Dhabi day without changing hotels repeatedly.", "Leave live flight selection to the proposal stage."],
  },
  "PKG-0204": {
    route: "Kochi · Munnar · Alleppey",
    arrival: "Kochi",
    placeA: "Munnar",
    placeB: "Alleppey",
    activityA: "Munnar tea-country trail",
    activityB: "Private backwater cruise",
    hotelA: "Munnar Hills Retreat",
    hotelB: "Alleppey Houseboat",
    hero: keralaHero,
    highlights: ["Move from Kochi to tea country and the backwaters.", "Stay overnight on a private houseboat in Alleppey.", "Balance guided travel with slow, scenic experiences."],
  },
};

const detailTabs: TabItem[] = [
  { id: "itinerary", label: "Itinerary" },
  { id: "preview", label: "Preview" },
  { id: "proposals", label: "Proposals" },
  { id: "inclusions", label: "Inclusions" },
  { id: "policies", label: "Policies" },
  { id: "commercials", label: "Commercials" },
  { id: "activity", label: "Activity" },
];

const iconFor: Record<ItemKind, IconName> = {
  flight: "plane",
  transfer: "bus",
  stay: "hotel",
  activity: "camera",
  meal: "sun",
  other: "package",
};

const labelFor: Record<ItemKind, string> = {
  flight: "Flight",
  transfer: "Transfer",
  stay: "Accommodation",
  activity: "Activity",
  meal: "Meal",
  other: "Other service",
};

function makeDays(profile: Profile): ItineraryDay[] {
  return [
    {
      id: "day-1",
      day: 1,
      date: "05 Nov, Thu",
      title: `Arrival in ${profile.arrival}`,
      place: profile.arrival,
      items: [
        {
          id: "arrival-flight",
          kind: "flight",
          title: `Flight required: New Delhi to ${profile.arrival}`,
          meta: "Economy preference · Standard checked baggage · Final schedule selected in proposal",
        },
        {
          id: "arrival-transfer",
          kind: "transfer",
          title: `Private transfer to ${profile.placeA}`,
          meta: "Private AC vehicle · 2 adults · Meet and assist",
          detail: "Flight-tracked pickup with one comfort stop on request.",
          image: privateTransfer,
          imageAlt: "Private airport transfer vehicle",
        },
        {
          id: "first-stay",
          kind: "stay",
          title: `${profile.hotelA} · 3 nights`,
          meta: "Deluxe room · Breakfast included · 2 adults",
          detail: "Flexible check-in requested; confirmation pending from the property.",
          image: profile.hero === baliHero ? baliHotel : profile.hero,
          imageAlt: `${profile.hotelA} accommodation`,
        },
      ],
    },
    {
      id: "day-2",
      day: 2,
      date: "06 Nov, Fri",
      title: profile.activityA,
      place: profile.placeA,
      items: [
        { id: "breakfast-2", kind: "meal", title: `Breakfast at ${profile.hotelA}`, meta: "Included · 07:00–10:00" },
        {
          id: "activity-a",
          kind: "activity",
          title: profile.activityA,
          meta: "Private experience · 8 hours · Local guide",
          detail: "Pickup, entry coordination and destination transfers included.",
          image: profile.hero === baliHero ? baliTemple : profile.hero,
          imageAlt: profile.activityA,
        },
      ],
    },
    {
      id: "day-3",
      day: 3,
      date: "07 Nov, Sat",
      title: `Travel to ${profile.placeB}`,
      place: profile.placeB,
      items: [
        { id: "breakfast-3", kind: "meal", title: `Breakfast at ${profile.hotelA}`, meta: "Included · Before checkout" },
        { id: "checkout-a", kind: "stay", title: `Checkout from ${profile.hotelA}`, meta: "Checkout by 11:00" },
        { id: "intercity", kind: "transfer", title: `${profile.placeA} to ${profile.placeB}`, meta: "Private AC vehicle · Luggage included", detail: "Driver and vehicle details are shared 24 hours before pickup." },
        { id: "second-stay", kind: "stay", title: `${profile.hotelB} · 3 nights`, meta: "Superior room · Breakfast included · 2 adults" },
      ],
    },
    {
      id: "day-4",
      day: 4,
      date: "08 Nov, Sun",
      title: profile.activityB,
      place: profile.placeB,
      items: [
        { id: "breakfast-4", kind: "meal", title: `Breakfast at ${profile.hotelB}`, meta: "Included · 07:00–10:00" },
        {
          id: "activity-b",
          kind: "activity",
          title: profile.activityB,
          meta: "Full day · Shared boat and private road transfers",
          detail: "Admission, local coordination and scheduled transfers included.",
          image: profile.hero === baliHero ? baliIsland : profile.hero,
          imageAlt: profile.activityB,
        },
      ],
    },
    {
      id: "day-5",
      day: 5,
      date: "09 Nov, Mon",
      title: `Flexible day in ${profile.placeB}`,
      place: profile.placeB,
      items: [
        { id: "breakfast-5", kind: "meal", title: `Breakfast at ${profile.hotelB}`, meta: "Included · 07:00–10:00" },
        { id: "leisure", kind: "activity", title: "Open time for an optional experience", meta: "No activity booked", detail: "Add a spa, food walk, cultural show or private local excursion." },
      ],
    },
    {
      id: "day-6",
      day: 6,
      date: "10 Nov, Tue",
      title: `Departure from ${profile.arrival}`,
      place: profile.arrival,
      items: [
        { id: "breakfast-6", kind: "meal", title: `Breakfast at ${profile.hotelB}`, meta: "Included · Before checkout" },
        { id: "checkout-b", kind: "stay", title: `Checkout from ${profile.hotelB}`, meta: "Checkout by 11:00" },
        { id: "departure-transfer", kind: "transfer", title: `Private transfer to ${profile.arrival} airport`, meta: "Pickup scheduled to flight time" },
        {
          id: "departure-flight",
          kind: "flight",
          title: `Flight required: ${profile.arrival} to New Delhi`,
          meta: "Economy preference · Standard checked baggage · Final schedule selected in proposal",
        },
      ],
    },
  ];
}

type PackageItinerarySource = Pick<PackageRecord, "id" | "templateId" | "proposalDays" | "departureType">;

export function packageDaysForProposal(record: PackageItinerarySource): ProposalDay[] {
  if (record.proposalDays) return record.proposalDays.map((day) => ({ ...day, highlights: [...(day.highlights ?? [])], services: day.services.map((service) => ({ ...service, costComponents: service.costComponents?.map((item) => ({ ...item })), stayCheckIn: record.departureType === "fixed" ? service.stayCheckIn : undefined, serviceDate: record.departureType === "fixed" ? service.serviceDate : undefined, supplements: service.supplements?.map((item) => ({ ...item })), stayChildren: service.stayChildren?.map((child) => ({ ...child })) })) }));
  const profile = profiles[record.templateId ?? record.id] ?? profiles["PKG-0241"];
  return makeDays(profile).map((day) => ({
    id: day.id,
    title: day.title,
    place: day.place,
    description: day.description,
    highlights: day.highlights,
    image: day.image,
    services: day.items.map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      detail: (item.detail ? `${item.meta} · ${item.detail}` : item.meta).replaceAll(" · 2 adults", ""),
    })),
  }));
}

/** Only expose itinerary blocks when the package actually has saved days or a known legacy template. */
export function packageDaysForDestination(record: PackageItinerarySource): ProposalDay[] {
  return record.proposalDays || profiles[record.templateId ?? record.id] ? packageDaysForProposal(record) : [];
}

export const PackageDetail = forwardRef<StepNavigationHandle, { record: PackageRecord; relatedProposals?: ProposalRecord[]; onOpenProposal?: (proposal: ProposalRecord) => void; onToast: (message: string) => void; onUseInProposal: () => void; onEdit?: () => void; onStatusChange?: (status: PackageRecord["status"]) => boolean; initialNavigation?: StepNavigationSnapshot | null }>(function PackageDetail({ record, relatedProposals = [], onOpenProposal, onToast, onUseInProposal, onEdit, onStatusChange, initialNavigation }, ref) {
  const profile = profiles[record.templateId ?? record.id] ?? profiles["PKG-0241"];
  const days = useMemo(() => record.proposalDays?.map((day, index): ItineraryDay => ({
    id: day.id,
    day: index + 1,
    date: record.departureType === "fixed" && record.fixedStart ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(Date.parse(`${record.fixedStart}T00:00:00Z`) + index * 86400000)) : "Flexible date",
    title: day.title,
    place: day.place,
    description: day.description,
    highlights: day.highlights,
    image: day.image,
    items: day.services.map((service) => ({ id: service.id, kind: service.kind, title: service.title, meta: service.detail, detail: service.vendor ? `Supplier: ${service.vendor}${service.cost != null ? ` · ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(service.cost)} cost` : ""}` : undefined })),
  })) ?? makeDays(profile), [profile, record.proposalDays, record.departureType, record.fixedStart]);
  const { current: tab, navigate: setTab, goBack, snapshot } = useStepNavigation<string>("itinerary", initialNavigation);
  useImperativeHandle(ref, () => ({ goBack, snapshot }), [goBack, snapshot]);
  const [openDays, setOpenDays] = useState<Set<string>>(() => new Set([record.proposalDays?.[0]?.id ?? "day-1"]));
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [status, setStatus] = useState(record.status.toLowerCase());
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState("activity");
  const [headerActionsOpen, setHeaderActionsOpen] = useState(false);
  const [activityRecords, setActivityRecords] = useState<PackageActivityEvent[]>(record.proposalDays ? [] : activityEvents);
  const [jumpDayId, setJumpDayId] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== "itinerary" || !jumpDayId) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(jumpDayId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setJumpDayId(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [tab, jumpDayId]);

  const toggleDay = (id: string) => {
    setOpenDays((current) => current.has(id) ? new Set() : new Set([id]));
  };

  const gallery = record.proposalDays
    ? (record.image ? [record.image] : [])
    : record.id === "PKG-0241" ? [profile.hero, baliHotel, baliTemple, baliIsland] : [profile.hero];
  const highlights = record.highlights?.length ? record.highlights : profile.highlights;
  const visibleHighlights = storyExpanded ? highlights : highlights.slice(0, 2);
  const allDaysOpen = openDays.size === days.length;
  const serviceCount = (kind: ItemKind) => days.reduce((count, day) => count + day.items.filter((item) => item.kind === kind).length, 0);

  return (
    <DetailPage
      className="package-detail"
      title={
        <span className="package-record-title">
          {record.image ? <img
            className="package-record-title__thumb"
            src={record.image}
            alt=""
            width={52}
            height={52}
            fetchPriority="high"
            style={{ objectPosition: record.imagePosition }}
          /> : <span className="package-record-title__thumb package-record-title__placeholder"><Icon name="package" size="md" /></span>}
          <span>{record.name}</span>
        </span>
      }
      status={
        <StatusSelect
          value={status}
          label="Package status"
          options={[
            { value: "published", label: "Published", tone: "done" },
            { value: "draft", label: "Draft", tone: "open" },
            { value: "archived", label: "Archived", tone: "open" },
          ]}
          onChange={(value) => {
            if (record.source === "Paryatech") { onToast("Create an agency copy to change this platform template"); return; }
            if (onStatusChange?.(value as PackageRecord["status"]) === false) return;
            setStatus(value);
            onToast(`Package status changed to ${value}`);
          }}
        />
      }
      meta={
        <>
          <span className="package-detail__meta-item"><Icon name="pin" size="sm" />{record.destination}</span>
          <span className="package-detail__meta-sep" aria-hidden="true">·</span>
          <span className="package-detail__meta-item">{record.region}</span>
          <span className="package-detail__meta-sep" aria-hidden="true">·</span>
          <span className="package-detail__meta-item"><Icon name="calendar" size="sm" />{record.duration}</span>
          <span className="package-detail__meta-item">{record.source === "Paryatech" ? "Paryatech" : "Agency"} · Advanced itinerary</span>
          <span className="package-detail__meta-sep" aria-hidden="true">·</span>
          <span className="package-id-chip"><span className="package-id-chip__value pt-mono">{record.id}</span></span>
        </>
      }
      owners={
        <span className="package-owner">
          <span className="package-owner__text"><b>Vrushabh Jain</b><span>Owner · Team +2</span></span>
          <span className="package-owner__stack" aria-label="People on this package">
            <Avatar tone="pink" size={26}>VJ</Avatar>
            <Avatar size={26}>NK</Avatar>
            <Avatar size={26}>MI</Avatar>
          </span>
        </span>
      }
      actions={
        <div className="package-detail-actions">
          <Button variant="primary" size="sm" leadingIcon={<Icon name="edit" size="sm" />} onClick={onEdit ?? (() => onToast("Package editor opened"))}>{record.source === "Paryatech" ? "Customize as agency copy" : "Edit package"}</Button>
          <div className="package-detail-actions__more">
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`More actions for ${record.name}`}
              aria-haspopup="menu"
              aria-expanded={headerActionsOpen}
              leadingIcon={<Icon name="more" size="sm" />}
              onClick={() => setHeaderActionsOpen((open) => !open)}
            />
            {headerActionsOpen ? (
              <div className="package-row-menu package-detail-actions__menu" role="menu" aria-label={`Actions for ${record.name}`}>
                <button type="button" role="menuitem" onClick={() => { setHeaderActionsOpen(false); onToast("Package duplicated as a draft"); }}>
                  <Icon name="copy" size="sm" /> Duplicate
                </button>
                <button type="button" role="menuitem" onClick={() => { setHeaderActionsOpen(false); onToast("Share link copied"); }}>
                  <Icon name="export" size="sm" /> Share
                </button>
              </div>
            ) : null}
          </div>
        </div>
      }
      tabs={<TabBar items={detailTabs.map((item) => item.id === "activity" ? { ...item, count: activityRecords.length } : item.id === "proposals" ? { ...item, count: relatedProposals.length } : item)} value={tab} onValueChange={setTab} aria-label="Package sections" />}
    >
      {tab === "itinerary" ? (
        <>
          {gallery.length ? <section className={`package-gallery ${gallery.length === 1 ? "package-gallery--single" : ""}`} aria-label="Package gallery">
            {gallery.map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={index === 0 ? `${record.name} destination` : `${record.name} package view ${index + 1}`} />
            ))}
            <Button className="package-gallery__action" variant="ghost" size="sm" leadingIcon={<Icon name="camera" size="sm" />} onClick={() => onToast("Gallery opened")}>View gallery</Button>
          </section> : null}

          <section className="package-composition" aria-label="Package composition">
            <CompositionStat icon="calendar" value={record.proposalDays ? `${days.length} days` : "6 days"} label="Plan" />
            <CompositionStat icon="plane" value={record.proposalDays ? `${serviceCount("flight")} flight sectors` : "2 flight sectors"} label="To confirm" />
            <CompositionStat icon="bus" value={record.proposalDays ? `${serviceCount("transfer")} transfers` : "3 transfers"} label="On ground" />
            <CompositionStat icon="hotel" value={record.proposalDays ? `${serviceCount("stay")} stays` : "2 stays"} label="Accommodation" />
            <CompositionStat icon="camera" value={record.proposalDays ? `${serviceCount("activity")} activities` : "3 activities"} label="Experiences" />
            <CompositionStat icon="sun" value={record.proposalDays ? `${serviceCount("meal")} meals` : "5 meals"} label="Included" />
          </section>

          <section className={`package-story ${storyExpanded ? "is-expanded" : ""}`} aria-labelledby="package-story-title">
            <div className="package-story__intro">
              <Icon name="bookmark" size="sm" />
              <div>
                <h2 id="package-story-title">Why travellers will love this package</h2>
                <p>A short customer-facing story authored with the package.</p>
              </div>
            </div>
            <ul>
              {visibleHighlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
            </ul>
            {highlights.length > 2 ? (
              <Button variant="ghost" size="xs" onClick={() => setStoryExpanded((current) => !current)}>
                {storyExpanded ? "Show less" : `View all ${highlights.length}`}
              </Button>
            ) : null}
          </section>

          <div className="package-workspace">
            <main className="itinerary-flow">
              <header className="itinerary-flow__bar">
                <div><h2>Day-by-day plan</h2><p>Open a day to see its services and operating detail.</p></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenDays(allDaysOpen ? new Set() : new Set(days.map((day) => day.id)))}
                >
                  {allDaysOpen ? "Collapse all" : "Show all"}
                </Button>
              </header>
              {days.map((day) => {
                const isOpen = openDays.has(day.id);
                return (
                <section className={`itinerary-day ${isOpen ? "is-open" : ""}`} id={day.id} key={day.id}>
                  <header className="itinerary-day__head">
                    <button className="itinerary-day__toggle" type="button" aria-expanded={isOpen} aria-controls={`${day.id}-services`} onClick={() => toggleDay(day.id)}>
                      <span className="itinerary-day__number">Day {day.day}</span>
                      <span className="itinerary-day__summary">
                        <strong>{day.title}</strong>
                        <small>{day.place} · {day.date}</small>
                      </span>
                      <span className="itinerary-day__count">{day.items.length} {day.items.length === 1 ? "service" : "services"}</span>
                      <Icon name="chevronDown" size="sm" />
                    </button>
                    {isOpen ? <Button variant="ghost" size="xs" leadingIcon={<Icon name="plus" size="xs" />} onClick={() => setAddOpen(true)}>Add item</Button> : null}
                  </header>
                  {isOpen ? (
                    <div className="itinerary-day__items" id={`${day.id}-services`}>
                      {day.image ? <img className="itinerary-day__image" src={day.image} alt="" /> : null}
                      {day.description ? <p className="itinerary-day__description">{day.description}</p> : null}
                      {day.highlights?.length ? <ul className="itinerary-day__highlights">{day.highlights.map((item, index) => <li key={index}>{item}</li>)}</ul> : null}
                      {day.items.map((item) => <ItineraryLine key={item.id} item={item} onToast={onToast} />)}
                    </div>
                  ) : null}
                </section>
              );
              })}
            </main>

            <aside className="package-rail" aria-label="Package commercial summary">
              <section>
                <p className="package-rail__label">Starting price</p>
                <strong>{record.startingPrice ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(record.startingPrice) : "Not set"}</strong>
                <span>{record.proposalDays ? (record.startingPrice ? "per adult · confirm before publishing" : "Set a reusable price before publishing") : "per adult · taxes included"}</span>
              </section>
              <section>
                <p className="package-rail__label">Travellers</p>
                {record.proposalDays ? <>
                  <p className="package-rail__line"><Icon name="user" size="sm" />Set traveller basis for this reusable package</p>
                  <p className="package-rail__line"><Icon name="calendar" size="sm" />{days.length} day itinerary · dates flexible</p>
                </> : <>
                  <p className="package-rail__line"><Icon name="user" size="sm" />2 adults · 1 room</p>
                  <p className="package-rail__line"><Icon name="calendar" size="sm" />05–10 Nov 2026</p>
                </>}
              </section>
              <section>
                <p className="package-rail__label">Coverage</p>
                <RailState icon="hotel" label="Accommodation" value={record.proposalDays ? (serviceCount("stay") ? "In plan" : "Not in plan") : "Included"} positive={!record.proposalDays || serviceCount("stay") > 0} />
                <RailState icon="bus" label="Transfers" value={record.proposalDays ? (serviceCount("transfer") ? "In plan" : "Not in plan") : "Included"} positive={!record.proposalDays || serviceCount("transfer") > 0} />
                {record.proposalDays ? null : <><RailState icon="passport" label="Visa" value="Separate" /><RailState icon="briefcase" label="Insurance" value="Optional" /></>}
              </section>
              <section>
                <p className="package-rail__label">Commercials</p>
                {record.proposalDays ? <div className="package-rail__money package-rail__money--total"><span>Price basis</span><span>Review needed</span></div> : <>
                  <div className="package-rail__money"><span>Supplier cost</span><span className="pt-mono">₹1,06,400</span></div>
                  <div className="package-rail__money"><span>Markup</span><span className="pt-mono">₹18,600</span></div>
                  <div className="package-rail__money package-rail__money--total"><span>Selling price</span><span className="pt-mono">₹1,25,000</span></div>
                </>}
              </section>
              <Button className="package-rail__cta" variant="brand" size="md" leadingIcon={<Icon name="fileText" size="sm" />} onClick={onUseInProposal}>Use in proposal</Button>
            </aside>
          </div>
        </>
      ) : null}

      {tab === "preview" ? <div className="package-customer-preview"><p className="package-customer-preview__note">Customer-facing preview · {record.status === "Published" ? "Published package" : "Not published"}</p>{record.image ? <img className="package-customer-preview__cover" src={record.image} alt="" /> : null}<section className="package-customer-preview__intro"><span>{record.destination} · {record.duration}</span><h2>{record.name}</h2><p>{record.highlights?.[0] ?? "A reusable journey ready to personalize."}</p><strong>{record.startingPrice ? `From ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(record.startingPrice)}` : "Price on request"}</strong><small>{record.priceBasis ?? "Final price depends on dates, travellers and availability"}</small></section><section className="package-customer-preview__days"><h3>Day-by-day journey</h3>{days.map((day) => <details key={day.id}><summary>Day {day.day} · {day.title}<span>{day.place}</span></summary><div>{record.itineraryMode !== "simple" && day.image ? <img src={day.image} alt="" /> : null}{day.description ? <p>{day.description}</p> : null}{day.highlights?.length ? <ul>{day.highlights.map((item, index) => <li key={index}>{item}</li>)}</ul> : null}{record.itineraryMode !== "simple" ? day.items.map((item) => <p key={item.id} className="package-customer-preview__service"><Icon name={iconFor[item.kind]} size="sm" /><span>{item.title}</span></p>) : null}</div></details>)}</section><section className="package-customer-preview__terms"><h3>Trip details</h3>{record.inclusions ? <p><strong>Included</strong>{record.inclusions}</p> : null}{record.exclusions ? <p><strong>Not included</strong>{record.exclusions}</p> : null}{record.importantNotes ? <p><strong>Important notes</strong>{record.importantNotes}</p> : null}{record.paymentTerms ? <p><strong>Payment terms</strong>{record.paymentTerms}</p> : null}{record.cancellationPolicy ? <p><strong>Cancellation</strong>{record.cancellationPolicy}</p> : null}</section><div className="package-customer-preview__actions"><Button variant="primary" size="sm" onClick={() => onToast("Enquiry action previewed; no message was sent")}>Enquire about this trip</Button><Button variant="ghost" size="sm" onClick={() => onToast("Customization request previewed; no message was sent")}>Request customization</Button></div></div> : null}
      {tab === "proposals" ? <section className="package-related-proposals"><header><div><h2>Proposals created from this package</h2><p>Each is an independent customer copy. Editing this package will not change an existing proposal.</p></div><Button variant="primary" size="sm" onClick={onUseInProposal}>Create proposal</Button></header>{relatedProposals.length ? <div className="package-related-proposals__rows">{relatedProposals.map((proposal) => <button type="button" key={proposal.id} onClick={() => onOpenProposal?.(proposal)}><span><strong>{proposal.name}</strong><small>{proposal.customer} · {proposal.travel} · {proposal.travellers}</small></span><span>{proposal.itineraryMode === "simple" ? "Simple" : "Advanced"}</span><span>{proposal.status}</span><Icon name="chevronRight" size="sm" /></button>)}</div> : <p>No proposals have been created from this package yet.</p>}</section> : null}
      {tab === "inclusions" ? record.proposalDays ? <div className="package-document"><DocumentSection title="Services in this itinerary" icon="checkCircle" items={days.flatMap((day) => day.items.map((item) => `${day.title}: ${item.title}`))} /></div> : <Inclusions /> : null}
      {tab === "policies" ? record.proposalDays ? <div className="package-document"><DocumentSection title="Policy setup" icon="info" items={[record.createdFromProposal ? "This package was saved from a customer proposal." : "This package was built from service blocks.", "Confirm supplier cancellation and date-change terms before publishing it as a reusable package."]} /></div> : <Policies /> : null}
      {tab === "commercials" ? record.proposalDays ? <div className="package-document"><DocumentSection title="Price setup" icon="wallet" items={[record.createdFromProposal ? "The customer-specific quote was not carried into this reusable package." : (record.startingPrice ? `Starting price: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(record.startingPrice)} per adult.` : "Set a starting price for this reusable package."), "Review traveller basis, supplier costs and markup before offering it to another customer."]} /></div> : <Commercials /> : null}
      {tab === "activity" ? <ActivityLog record={record} rows={activityRecords} onRemove={(id) => setActivityRecords((current) => current.filter((event) => event.id !== id))} onNavigate={(event) => {
        setTab(event.section);
        if (event.dayId) {
          setOpenDays(new Set([event.dayId]));
          setJumpDayId(event.dayId);
        }
      }} /> : null}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        eyebrow="Itinerary"
        title="Add an item"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" leadingIcon={<Icon name="plus" size="sm" />} onClick={() => { setAddOpen(false); onToast(`${labelFor[addType as ItemKind]} added to the day`); }}>Add to day</Button>
          </>
        }
      >
        <FilterSelect label="Item type" value={addType} onChange={setAddType} options={Object.entries(labelFor).map(([value, label]) => ({ value, label }))} />
        <TextField label="Name" placeholder={`Add ${labelFor[addType as ItemKind].toLowerCase()} name`} />
        <TextField label="Details" placeholder="Time, supplier, inclusions or notes" multiline rows={3} />
      </Modal>
    </DetailPage>
  );
});

function CompositionStat({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return <div className="package-composition__item"><Icon name={icon} size="md" /><span><strong>{value}</strong><small>{label}</small></span></div>;
}

function ItineraryLine({ item, onToast }: { item: ItineraryItem; onToast: (message: string) => void }) {
  return (
    <article className={`itinerary-line itinerary-line--${item.kind}`}>
      <div className="itinerary-line__marker"><Icon name={iconFor[item.kind]} size="sm" /></div>
      <div className="itinerary-line__content">
        <div className="itinerary-line__heading">
          <div>
            <p className="itinerary-line__kind">{labelFor[item.kind]}</p>
            <h3>{item.title}</h3>
            <p className="itinerary-line__meta">{item.meta}</p>
          </div>
          <div className="itinerary-line__actions">
            <Button variant="ghost" size="xs" onClick={() => onToast(`${labelFor[item.kind]} editor opened`)}>Change</Button>
            <Button variant="ghost" size="xs" iconOnly aria-label={`More actions for ${item.title}`} leadingIcon={<Icon name="more" size="xs" />} onClick={() => onToast(`More actions for ${item.title}`)} />
          </div>
        </div>
        {item.times ? (
          <div className="flight-route" aria-label={`${item.times.fromPlace} to ${item.times.toPlace}`}>
            <span><strong>{item.times.from}</strong><small>{item.times.fromPlace}</small></span>
            <span className="flight-route__line"><Icon name="plane" size="sm" /></span>
            <span><strong>{item.times.to}</strong><small>{item.times.toPlace}</small></span>
          </div>
        ) : null}
        {item.image ? <div className="itinerary-line__media"><img src={item.image} alt={item.imageAlt ?? ""} /><p>{item.detail}</p></div> : item.detail ? <p className="itinerary-line__detail">{item.detail}</p> : null}
      </div>
    </article>
  );
}

function RailState({ icon, label, value, positive = false }: { icon: IconName; label: string; value: string; positive?: boolean }) {
  return <div className="package-rail__state"><Icon name={icon} size="sm" /><span>{label}</span><b className={positive ? "is-positive" : ""}>{value}</b></div>;
}

function Inclusions() {
  return <div className="package-document"><DocumentSection title="Included in the trip" icon="checkCircle" items={["Return economy flights with standard baggage", "Two verified accommodation stays with breakfast", "Private airport and intercity transfers", "Three guided destination experiences", "On-trip assistance and supplier coordination"]} /><DocumentSection title="Handled separately" icon="passport" items={["Visa processing and government fees", "Travel insurance", "Meals not listed in the day plan", "Personal expenses, tips and optional upgrades"]} /></div>;
}

function Policies() {
  return (
    <div className="package-document package-policies">
      <section className="policy-card" aria-label="Cancellation and date change">
        <header className="policy-card__head">
          <h2>Cancellation &amp; Date Change</h2>
        </header>

        <div className="policy-block">
          <h3>Package Cancellation Policy</h3>
          <p className="policy-sub">
            <span className="policy-sub__ok">Cancellation possible till 10 Oct*</span>
            <span className="policy-sub__muted">After that package is non-refundable.</span>
          </p>
          <div className="policy-track" aria-hidden="true">
            <span className="policy-track__bar" />
            <span className="policy-track__dot policy-track__dot--ok"><Icon name="check" size="xs" /></span>
            <span className="policy-track__dot policy-track__dot--warn"><Icon name="clear" size="xs" /></span>
          </div>
          <div className="policy-range">
            <span><strong>Till 10 Oct 26</strong><small>₹14,250 Cancellation Fee</small></span>
            <span className="policy-range__after"><strong>After 10 Oct 26</strong><small>Non Refundable</small></span>
          </div>
          <ul className="policy-notes">
            <li>These are non-refundable amounts as per the current components attached. If components change, the policy changes accordingly.</li>
            <li>Please check the exact cancellation and date-change policy on the review page before proceeding further.</li>
            <li>TCS once collected cannot be refunded on cancellation. You can claim it as an adjustment against income tax payable.</li>
            <li>Cancellation charges are exclusive of all taxes; taxes will be added as applicable.</li>
          </ul>
        </div>

        <div className="policy-block">
          <h3>Package Date Change Policy</h3>
          <p className="policy-sub">
            <span className="policy-sub__ok">Date change possible till 10 Oct*</span>
            <span className="policy-sub__muted">After that package date cannot be changed.</span>
          </p>
          <div className="policy-track" aria-hidden="true">
            <span className="policy-track__bar" />
            <span className="policy-track__dot policy-track__dot--ok"><Icon name="check" size="xs" /></span>
            <span className="policy-track__dot policy-track__dot--warn"><Icon name="clear" size="xs" /></span>
          </div>
          <div className="policy-range">
            <span><strong>Till 10 Oct 26</strong><small>₹12,000 Date Change Fee</small></span>
            <span className="policy-range__after"><strong>After 10 Oct 26</strong><small>Date cannot be changed</small></span>
          </div>
          <ul className="policy-notes">
            <li>Date-change fee does not include any fare difference on the new date. Fare difference, if any, will be charged separately.</li>
            <li>Date change depends on availability of the components on the newly requested date.</li>
            <li>Please check the exact date-change policy on the review page before proceeding further.</li>
          </ul>
        </div>
      </section>

      <section className="policy-card" aria-label="Terms and conditions">
        <header className="policy-card__head">
          <h2>Terms and Conditions</h2>
        </header>
        <p className="policy-sub"><span className="policy-sub__muted">Simple terms that apply to this package.</span></p>
        <ul className="terms-list">
          <li>Standard hotel check-in is 2:00 pm and check-out is 11:00 am. Early check-in or late check-out is subject to availability.</li>
          <li>A maximum of 3 adults is allowed in one room. The third occupant is provided a mattress or rollaway bed.</li>
          <li>The itinerary is fixed as per the day plan. Transfers are provided as per the itinerary and are not at disposal.</li>
          <li>Flights, hotels and activities are subject to availability at the time of booking. Rates may change until confirmed.</li>
          <li>If a listed hotel is unavailable, an alternate stay of a similar standard will be arranged.</li>
          <li>Visa, insurance, entrance fees, guide charges and personal expenses are not included unless listed in inclusions.</li>
          <li>Travellers must carry valid IDs. Passport must remain valid for six months after the travel date for international trips.</li>
          <li>In case of natural calamity, weather or force-majeure events, refunds follow the supplier&apos;s policy.</li>
        </ul>
      </section>
    </div>
  );
}

function Commercials() {
  return <div className="package-document"><DocumentSection title="Price build-up" icon="wallet" items={["Flights: ₹42,000", "Accommodation: ₹38,400", "Transfers and activities: ₹26,000", "Markup: ₹18,600", "Selling price: ₹1,25,000"]} /><DocumentSection title="Commercial notes" icon="info" items={["Price basis: 2 adults sharing 1 room", "Supplier rates last checked Aug 14, 2026", "Commission is included in the displayed markup"]} /></div>;
}

type PackageActivityEvent = {
  id: string;
  date: string;
  time: string;
  title: string;
  context: string;
  member: string;
  role: string;
  initials: string;
  tone?: "pink";
  section: string;
  dayId?: string;
  actionLabel: string;
};

const activityEvents: PackageActivityEvent[] = [
  { id: "activity-1", date: "17 Sep", time: "15:20", title: "Pricing reviewed", context: "Commercials · Margin and selling price", member: "Priya Nair", role: "Staff member", initials: "PN", tone: "pink", section: "commercials", actionLabel: "Go to commercials" },
  { id: "activity-2", date: "11 Sep", time: "10:45", title: "Route allocation updated", context: "Itinerary · Nights and destinations", member: "Vrushabh Jain", role: "Owner", initials: "VJ", section: "itinerary", actionLabel: "Go to itinerary" },
  { id: "activity-3", date: "04 Sep", time: "12:30", title: "Accommodation replaced", context: "Itinerary · Day 1 accommodation", member: "Priya Nair", role: "Staff member", initials: "PN", tone: "pink", section: "itinerary", dayId: "day-1", actionLabel: "Go to accommodation" },
  { id: "activity-4", date: "29 Aug", time: "16:10", title: "Cover image changed", context: "Itinerary · Package gallery", member: "Mira Iyer", role: "Content manager", initials: "MI", section: "itinerary", actionLabel: "Go to gallery" },
  { id: "activity-5", date: "22 Aug", time: "11:40", title: "Package published", context: "Package profile · Published", member: "Vrushabh Jain", role: "Owner", initials: "VJ", section: "itinerary", actionLabel: "Go to package" },
  { id: "activity-6", date: "14 Aug", time: "09:15", title: "Package created", context: "Package profile · Draft created", member: "Vrushabh Jain", role: "Owner", initials: "VJ", section: "itinerary", actionLabel: "Go to package" },
];

function ActivityLog({ record, rows: activityRows, onRemove, onNavigate }: { record: PackageRecord; rows: PackageActivityEvent[]; onRemove: (id: string) => void; onNavigate: (event: PackageActivityEvent) => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [openMenu, setOpenMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [viewing, setViewing] = useState<PackageActivityEvent | null>(null);
  const [removing, setRemoving] = useState<PackageActivityEvent | null>(null);
  const titleId = useId();
  const normalized = query.trim().toLowerCase();
  const rows = activityRows.filter((event) =>
    !normalized || `${event.date} ${event.time} ${event.title} ${event.context} ${event.member} ${event.role}`.toLowerCase().includes(normalized),
  );
  const allSelected = rows.length > 0 && rows.every((event) => selected.has(event.id));
  const someSelected = rows.some((event) => selected.has(event.id));

  const toggleAll = (state: "on" | "off" | "indeterminate") => {
    setSelected((current) => {
      const next = new Set(current);
      rows.forEach((event) => state === "on" ? next.add(event.id) : next.delete(event.id));
      return next;
    });
  };

  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(null);
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [openMenu]);

  useEffect(() => {
    if (!viewing && !removing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setViewing(null); setRemoving(null); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [viewing, removing]);

  const showMenu = (id: string, anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect();
    setOpenMenu((current) => current?.id === id ? null : {
      id,
      top: Math.min(rect.bottom + 5, window.innerHeight - 92),
      left: Math.max(12, Math.min(rect.right - 172, window.innerWidth - 184)),
    });
  };

  return (
    <section className="package-activity" aria-labelledby="package-activity-title">
      <header className="package-activity__header">
        <div>
          <h2 id="package-activity-title">Recent activities</h2>
          <p>Changes made to {record.name}</p>
        </div>
        <span>{activityRows.length} recent events</span>
      </header>
      <div className="package-activity__search">
        <SearchField
          fullWidth
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search recent activity"
          aria-label="Search recent activity"
        />
      </div>
      <DataSheet className="package-activity-sheet" aria-label={`Recent activity for ${record.name}`}>
        <DataSheetHeader>
          <DataSheetCell check>
            <Checkbox
              state={allSelected ? "on" : someSelected ? "indeterminate" : "off"}
              onCheckedChange={toggleAll}
              label={allSelected ? "Deselect all activities" : "Select all activities"}
            />
          </DataSheetCell>
          <DataSheetCell>Date</DataSheetCell>
          <DataSheetCell>Event</DataSheetCell>
          <DataSheetCell>Member</DataSheetCell>
        </DataSheetHeader>
        {rows.map((event) => (
          <DataSheetRow key={event.id}>
            <DataSheetCell check>
              <Checkbox
                state={selected.has(event.id) ? "on" : "off"}
                onCheckedChange={(state) => setSelected((current) => {
                  const next = new Set(current);
                  if (state === "on") next.add(event.id);
                  else next.delete(event.id);
                  return next;
                })}
                label={`Select ${event.title}`}
              />
            </DataSheetCell>
            <DataSheetCell>
              <StackCell>
                <StackLine icon={<Icon name="calendar" size="sm" />}>{event.date}</StackLine>
                <StackLine icon={<Icon name="clock" size="sm" />} muted>{event.time}</StackLine>
              </StackCell>
            </DataSheetCell>
            <DataSheetCell>
              <StackCell>
                <StackLine>{event.title}</StackLine>
                <StackLine icon={<Icon name="package" size="sm" />} muted>{event.context}</StackLine>
              </StackCell>
            </DataSheetCell>
            <DataSheetCell className="package-activity__member-cell">
              <div className="package-activity__member">
                <Avatar tone={event.tone} size={34}>{event.initials}</Avatar>
                <span className="package-activity__member-text">
                  <strong>{event.member}</strong>
                  <span className="package-activity__role">{event.role}</span>
                </span>
              </div>
              <IconButton label={`More actions for ${event.title}`} aria-haspopup="menu" aria-expanded={openMenu?.id === event.id} onClick={(clickEvent) => showMenu(event.id, clickEvent.currentTarget)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
              </IconButton>
            </DataSheetCell>
          </DataSheetRow>
        ))}
      </DataSheet>
      {rows.length === 0 ? <p className="package-activity__empty">No activities match your search.</p> : null}
      {openMenu ? createPortal(<div className="package-activity__menu" role="menu" aria-label="Activity actions" style={{ top: openMenu.top, left: openMenu.left }} onPointerDown={(event) => event.stopPropagation()}>
        <button type="button" role="menuitem" onClick={() => { setViewing(activityRows.find((event) => event.id === openMenu.id) ?? null); setOpenMenu(null); }}>View Activity</button>
        <button type="button" role="menuitem" className="is-danger" onClick={() => { setRemoving(activityRows.find((event) => event.id === openMenu.id) ?? null); setOpenMenu(null); }}>Remove Activity</button>
      </div>, document.body) : null}
      {viewing ? createPortal(<div className="package-activity__overlay" role="presentation" onClick={() => setViewing(null)}><div className="package-activity__dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()}>
        <header><h2 id={titleId}>{viewing.title}</h2><Button variant="ghost" size="sm" iconOnly aria-label="Close activity details" leadingIcon={<Icon name="clear" size="sm" />} onClick={() => setViewing(null)} /></header>
        <dl className="package-activity__facts">
          <div><dt>Activity</dt><dd>{viewing.title}</dd></div><div><dt>Date and time</dt><dd>{viewing.date} · {viewing.time}</dd></div>
          <div><dt>Related to</dt><dd>{viewing.context}</dd></div><div><dt>Package</dt><dd>{record.name}</dd></div>
          <div><dt>Member</dt><dd>{viewing.member}</dd></div><div><dt>Role</dt><dd>{viewing.role}</dd></div>
          <div><dt>Activity ID</dt><dd className="pt-mono">{viewing.id}</dd></div>
        </dl>
        <footer><Button variant="ghost" size="sm" onClick={() => setViewing(null)}>Close</Button><Button variant="primary" size="sm" onClick={() => { onNavigate(viewing); setViewing(null); }}>{viewing.actionLabel}</Button></footer>
      </div></div>, document.body) : null}
      {removing ? createPortal(<div className="package-activity__overlay" role="presentation" onClick={() => setRemoving(null)}><div className="package-activity__dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()}>
        <header><h2 id={titleId}>Remove Activity</h2><Button variant="ghost" size="sm" iconOnly aria-label="Close remove activity" leadingIcon={<Icon name="clear" size="sm" />} onClick={() => setRemoving(null)} /></header>
        <p className="package-activity__confirm">Remove “{removing.title}” from this package’s activity history?</p>
        <footer><Button variant="ghost" size="sm" onClick={() => setRemoving(null)}>Keep Activity</Button><Button variant="primary" size="sm" onClick={() => { onRemove(removing.id); setSelected((current) => { const next = new Set(current); next.delete(removing.id); return next; }); setRemoving(null); }}>Remove Activity</Button></footer>
      </div></div>, document.body) : null}
    </section>
  );
}

function DocumentSection({ title, icon, items }: { title: string; icon: IconName; items: string[] }) {
  return <section className="package-document__section"><header><Icon name={icon} size="md" /><h2>{title}</h2></header><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}
