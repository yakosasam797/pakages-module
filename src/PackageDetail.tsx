import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  DetailPage,
  FilterSelect,
  Icon,
  Modal,
  StatusSelect,
  TabBar,
  TextField,
} from "@paryatech/ui";
import type { IconName, TabItem } from "@paryatech/ui";
import type { PackageRecord } from "./App";
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

type ItemKind = "flight" | "transfer" | "stay" | "activity" | "meal";

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
  { id: "inclusions", label: "Inclusions" },
  { id: "policies", label: "Policies" },
  { id: "commercials", label: "Commercials" },
];

const iconFor: Record<ItemKind, IconName> = {
  flight: "plane",
  transfer: "bus",
  stay: "hotel",
  activity: "camera",
  meal: "sun",
};

const labelFor: Record<ItemKind, string> = {
  flight: "Flight",
  transfer: "Transfer",
  stay: "Accommodation",
  activity: "Activity",
  meal: "Meal",
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

export function PackageDetail({ record, onToast }: { record: PackageRecord; onToast: (message: string) => void }) {
  const profile = profiles[record.id] ?? profiles["PKG-0241"];
  const days = useMemo(() => makeDays(profile), [profile]);
  const [tab, setTab] = useState("itinerary");
  const [openDays, setOpenDays] = useState<Set<string>>(() => new Set(["day-1"]));
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [status, setStatus] = useState(record.status.toLowerCase());
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState("activity");

  const toggleDay = (id: string) => {
    setOpenDays((current) => current.has(id) ? new Set() : new Set([id]));
  };

  const gallery = record.id === "PKG-0241" ? [profile.hero, baliHotel, baliTemple, baliIsland] : [profile.hero];
  const highlights = record.highlights?.length ? record.highlights : profile.highlights;
  const visibleHighlights = storyExpanded ? highlights : highlights.slice(0, 2);
  const allDaysOpen = openDays.size === days.length;

  return (
    <DetailPage
      className="package-detail"
      title={record.name}
      status={
        <StatusSelect
          value={status}
          label="Package status"
          options={[
            { value: "published", label: "Published", tone: "done" },
            { value: "draft", label: "Draft", tone: "progress" },
            { value: "archived", label: "Archived", tone: "open" },
          ]}
          onChange={(value) => {
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
        <>
          <Button variant="ghost" size="sm" leadingIcon={<Icon name="copy" size="sm" />} onClick={() => onToast("Package duplicated as a draft")}>Duplicate</Button>
          <Button variant="ghost" size="sm" leadingIcon={<Icon name="export" size="sm" />} onClick={() => onToast("Share link copied")}>Share</Button>
          <Button variant="primary" size="sm" leadingIcon={<Icon name="edit" size="sm" />} onClick={() => onToast("Package editor opened")}>Edit package</Button>
        </>
      }
      tabs={<TabBar items={detailTabs} value={tab} onValueChange={setTab} aria-label="Package sections" />}
    >
      {tab === "itinerary" ? (
        <>
          <section className={`package-gallery ${gallery.length === 1 ? "package-gallery--single" : ""}`} aria-label="Package gallery">
            {gallery.map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={index === 0 ? `${record.name} destination` : `${record.name} package view ${index + 1}`} />
            ))}
            <Button className="package-gallery__action" variant="ghost" size="sm" leadingIcon={<Icon name="camera" size="sm" />} onClick={() => onToast("Gallery opened")}>View gallery</Button>
          </section>

          <section className="package-composition" aria-label="Package composition">
            <CompositionStat icon="calendar" value="6 days" label="Plan" />
            <CompositionStat icon="plane" value="2 flight sectors" label="To confirm" />
            <CompositionStat icon="bus" value="3 transfers" label="On ground" />
            <CompositionStat icon="hotel" value="2 stays" label="Accommodation" />
            <CompositionStat icon="camera" value="3 activities" label="Experiences" />
            <CompositionStat icon="sun" value="5 meals" label="Included" />
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
                <span>per adult · taxes included</span>
              </section>
              <section>
                <p className="package-rail__label">Travellers</p>
                <p className="package-rail__line"><Icon name="user" size="sm" />2 adults · 1 room</p>
                <p className="package-rail__line"><Icon name="calendar" size="sm" />05–10 Nov 2026</p>
              </section>
              <section>
                <p className="package-rail__label">Coverage</p>
                <RailState icon="hotel" label="Accommodation" value="Included" positive />
                <RailState icon="bus" label="Transfers" value="Included" positive />
                <RailState icon="passport" label="Visa" value="Separate" />
                <RailState icon="briefcase" label="Insurance" value="Optional" />
              </section>
              <section>
                <p className="package-rail__label">Commercials</p>
                <div className="package-rail__money"><span>Supplier cost</span><span className="pt-mono">₹1,06,400</span></div>
                <div className="package-rail__money"><span>Markup</span><span className="pt-mono">₹18,600</span></div>
                <div className="package-rail__money package-rail__money--total"><span>Selling price</span><span className="pt-mono">₹1,25,000</span></div>
              </section>
              <Button className="package-rail__cta" variant="brand" size="md" leadingIcon={<Icon name="fileText" size="sm" />} onClick={() => onToast("Proposal created from package")}>Use in proposal</Button>
            </aside>
          </div>
        </>
      ) : null}

      {tab === "inclusions" ? <Inclusions /> : null}
      {tab === "policies" ? <Policies /> : null}
      {tab === "commercials" ? <Commercials /> : null}

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
}

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

function DocumentSection({ title, icon, items }: { title: string; icon: IconName; items: string[] }) {
  return <section className="package-document__section"><header><Icon name={icon} size="md" /><h2>{title}</h2></header><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}
