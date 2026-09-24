import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Button,
  DetailPage,
  FilterSelect,
  Icon,
  Modal,
  StatusChip,
  TextField,
} from "@paryatech/ui";
import type { IconName } from "@paryatech/ui";
import type { PackageRecord } from "./App";
import baliImage from "./assets/package-images/bali.jpg";
import baliHero from "./assets/bali/bali-rice-terraces-hero.jpg";
import baliHotel from "./assets/bali/ubud-resort-suite.jpg";
import baliTemple from "./assets/bali/ubud-temple.jpg";

type BuilderStep = "foundation" | "route" | "itinerary" | "pricing" | "media" | "review";
type ServiceKind = "flight" | "hotel" | "activity" | "transport" | "car" | "meal";

interface RouteStop {
  id: number;
  city: string;
  nights: number;
}

interface DraftService {
  id: string;
  kind: ServiceKind;
  title: string;
  detail: string;
  state: "planned" | "needs-rate" | "confirmed";
}

interface SupplyResult {
  id: string;
  kind: ServiceKind;
  source: "crm" | "api";
  name: string;
  vendor: string;
  location: string;
  availability: string;
  price: string;
  detail: string;
}

interface PackageBuilderProps {
  onCancel: () => void;
  onComplete: (record: PackageRecord) => void;
  onToast: (message: string) => void;
}

const steps: Array<{ id: BuilderStep; label: string; helper: string; icon: IconName }> = [
  { id: "foundation", label: "Trip setup", helper: "Product, dates and travellers", icon: "calendar" },
  { id: "route", label: "Route", helper: "Stops, nights and connections", icon: "pin" },
  { id: "itinerary", label: "Itinerary", helper: "Day-level services", icon: "list" },
  { id: "pricing", label: "Pricing", helper: "Costs, markup and terms", icon: "wallet" },
  { id: "media", label: "Media", helper: "Photos, video and cover", icon: "camera" },
  { id: "review", label: "Review", helper: "Operational readiness", icon: "clipboardCheck" },
];

const serviceIcon: Record<ServiceKind, IconName> = {
  flight: "plane",
  hotel: "hotel",
  activity: "camera",
  transport: "bus",
  car: "bus",
  meal: "sun",
};

const serviceLabels: Record<ServiceKind, string> = {
  flight: "Flight",
  hotel: "Hotel",
  activity: "Activity",
  transport: "Transport",
  car: "Car",
  meal: "Meal",
};

interface MediaItem {
  id: string;
  name: string;
  url: string;
  kind: "image" | "video";
  isCover: boolean;
}

const initialServices: Record<number, DraftService[]> = {
  1: [
    { id: "flight-in", kind: "flight", title: "Flight required: New Delhi to Denpasar", detail: "Economy preference · Standard checked baggage · Final schedule selected in proposal", state: "needs-rate" },
    { id: "car-arrival", kind: "car", title: "Airport pickup to Ubud", detail: "Private SUV · 2 adults · 2 bags", state: "planned" },
    { id: "hotel-ubud", kind: "hotel", title: "Teras Ubud Resort", detail: "3 nights · Deluxe room · Breakfast", state: "needs-rate" },
  ],
  2: [
    { id: "meal-2", kind: "meal", title: "Breakfast at the hotel", detail: "Included · 07:00–10:00", state: "confirmed" },
    { id: "activity-2", kind: "activity", title: "Ubud temples and rice terraces", detail: "08:30 · 8 hours · Private guide · Pickup included", state: "planned" },
  ],
  3: [
    { id: "meal-3", kind: "meal", title: "Breakfast at the hotel", detail: "Included · 07:00–10:00", state: "confirmed" },
    { id: "activity-3", kind: "activity", title: "Free time in Ubud", detail: "No supplier required", state: "confirmed" },
  ],
  4: [
    { id: "car-intercity", kind: "car", title: "Ubud to Seminyak", detail: "Point-to-point · Private SUV · 11:00 pickup", state: "planned" },
    { id: "hotel-seminyak", kind: "hotel", title: "The Coast Seminyak", detail: "3 nights · Superior room · Breakfast", state: "needs-rate" },
  ],
  5: [
    { id: "meal-5", kind: "meal", title: "Breakfast at the hotel", detail: "Included · 07:00–10:00", state: "confirmed" },
    { id: "activity-5", kind: "activity", title: "Nusa Penida island experience", detail: "07:00 · Full day · Boat and road transfers", state: "planned" },
  ],
  6: [
    { id: "meal-6", kind: "meal", title: "Breakfast at the hotel", detail: "Included · 07:00–10:00", state: "confirmed" },
  ],
  7: [
    { id: "car-departure", kind: "car", title: "Hotel to Denpasar airport", detail: "Point-to-point · Pickup linked to flight", state: "planned" },
    { id: "flight-out", kind: "flight", title: "Flight required: Denpasar to New Delhi", detail: "Economy preference · Standard checked baggage · Final schedule selected in proposal", state: "needs-rate" },
  ],
};

const supplyResults: SupplyResult[] = [
  { id: "crm-hotel-1", kind: "hotel", source: "crm", name: "Teras Ubud Resort", vendor: "Direct hotel contract", location: "Ubud", availability: "12 rooms held", price: "₹6,400 / room", detail: "Deluxe room · Breakfast · Flexible check-in requested" },
  { id: "crm-hotel-2", kind: "hotel", source: "crm", name: "Ubud Valley Retreat", vendor: "Bali Beds & Stays", location: "Ubud", availability: "8 rooms available", price: "₹7,100 / room", detail: "Garden room · Breakfast · 48-hour release" },
  { id: "api-hotel-1", kind: "hotel", source: "api", name: "Komaneka at Bisma", vendor: "Hotelbeds API", location: "Ubud", availability: "Live availability", price: "₹9,850 / room", detail: "Suite · Breakfast · Live cancellation terms" },
  { id: "crm-activity-1", kind: "activity", source: "crm", name: "Ubud temples and rice terraces", vendor: "Bali Heritage Experiences", location: "Ubud", availability: "Guide available", price: "₹8,200 / group", detail: "8 hours · Private guide · Hotel pickup included" },
  { id: "crm-activity-2", kind: "activity", source: "crm", name: "Balinese cooking class", vendor: "Paon Bali", location: "Ubud", availability: "6 seats available", price: "₹3,200 / adult", detail: "3 hours · Market visit · Hotel pickup included" },
  { id: "api-activity-1", kind: "activity", source: "api", name: "Mount Batur sunrise trek", vendor: "Experiences API", location: "Kintamani", availability: "Instant confirmation", price: "₹4,600 / adult", detail: "8 hours · Shared transfer · Breakfast included" },
  { id: "crm-car-1", kind: "car", source: "crm", name: "Private airport pickup", vendor: "Bali Ground Co.", location: "Denpasar → Ubud", availability: "Driver confirmed", price: "₹2,800 / vehicle", detail: "Toyota Innova · 4 seats · 3 large bags · Flight tracked" },
  { id: "crm-car-2", kind: "car", source: "crm", name: "Ubud to Seminyak transfer", vendor: "Island Wheels", location: "Ubud → Seminyak", availability: "Vehicle available", price: "₹2,200 / vehicle", detail: "Private SUV · Point-to-point · 11:00 pickup" },
  { id: "api-car-1", kind: "car", source: "api", name: "Private regional transfer", vendor: "TransferConnect API", location: "Bali", availability: "Live availability", price: "₹2,450 / vehicle", detail: "Sedan · 3 seats · 2 large bags · Free cancellation" },
  { id: "crm-transport-1", kind: "transport", source: "crm", name: "Nusa Penida fast boat", vendor: "BlueWater Express", location: "Sanur → Nusa Penida", availability: "14 seats held", price: "₹3,600 / adult", detail: "Return fast boat · Port assistance included" },
  { id: "api-transport-1", kind: "transport", source: "api", name: "Bali–Lombok ferry", vendor: "Regional Mobility API", location: "Padang Bai → Lombok", availability: "Live schedule", price: "₹1,850 / adult", detail: "Standard ferry · One checked bag" },
  { id: "api-flight-1", kind: "flight", source: "api", name: "New Delhi to Denpasar flight options", vendor: "Flight supply API", location: "New Delhi → Denpasar", availability: "Live options checked when proposed", price: "From ₹21,000 / adult", detail: "Economy preference · Standard baggage · Up to 1 stop" },
  { id: "api-flight-2", kind: "flight", source: "api", name: "Premium flight options via Singapore", vendor: "Flight supply API", location: "New Delhi → Denpasar", availability: "Live options checked when proposed", price: "From ₹28,400 / adult", detail: "Economy preference · 25 kg baggage · Up to 1 stop" },
  { id: "crm-meal-1", kind: "meal", source: "crm", name: "Welcome dinner at Hujan Locale", vendor: "Hujan Locale", location: "Ubud", availability: "Table available", price: "₹2,100 / adult", detail: "Set menu · Vegetarian options · Private transfer extra" },
];

const toDate = (value: string) => new Date(`${value}T12:00:00`);
const addDays = (value: string, days: number) => {
  const next = toDate(value);
  next.setDate(next.getDate() + days);
  return next;
};
const dateLabel = (date: Date) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", weekday: "short" }).format(date);
const dayCount = (start: string, end: string) => Math.max(1, Math.round((toDate(end).getTime() - toDate(start).getTime()) / 86400000) + 1);

export function PackageBuilder({ onCancel, onComplete, onToast }: PackageBuilderProps) {
  const [step, setStep] = useState<BuilderStep>("foundation");
  const [source, setSource] = useState("blank");
  const [tripType, setTripType] = useState("fixed");
  const [name, setName] = useState("Bali family discovery");
  const [region, setRegion] = useState("Southeast Asia");
  const [story, setStory] = useState("Explore Bali through quiet temple mornings and working rice terraces.\nBalance guided experiences with enough free time to make the trip feel personal.\nStay in Ubud and Seminyak to experience two distinct sides of the island.");
  const [startDate, setStartDate] = useState("2026-11-05");
  const [endDate, setEndDate] = useState("2026-11-11");
  const [flexibleDays, setFlexibleDays] = useState("7");
  const [origin, setOrigin] = useState("New Delhi");
  const [arrivalGateway, setArrivalGateway] = useState("Denpasar");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [rooms, setRooms] = useState("1");
  const [stops, setStops] = useState<RouteStop[]>([
    { id: 1, city: "Ubud", nights: 3 },
    { id: 2, city: "Seminyak", nights: 3 },
  ]);
  const [services, setServices] = useState<Record<number, DraftService[]>>(initialServices);
  const [activeDay, setActiveDay] = useState(1);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [serviceType, setServiceType] = useState<ServiceKind>("activity");
  const [serviceName, setServiceName] = useState("");
  const [serviceDetail, setServiceDetail] = useState("");
  const [supplierCosts, setSupplierCosts] = useState({ flights: 42000, stays: 38400, activities: 16500, ground: 9500, meals: 0 });
  const [markup, setMarkup] = useState("18600");
  const [media, setMedia] = useState<MediaItem[]>([
    { id: "cover-bali", name: "Bali rice terraces", url: baliHero, kind: "image", isCover: true },
    { id: "stay-bali", name: "Ubud accommodation", url: baliHotel, kind: "image", isCover: false },
    { id: "experience-bali", name: "Ubud temple", url: baliTemple, kind: "image", isCover: false },
  ]);

  const totalDays = tripType === "fixed" ? dayCount(startDate, endDate) : Math.max(1, Number(flexibleDays || 1));
  const totalNights = totalDays - 1;
  const allocatedNights = stops.reduce((sum, stop) => sum + Number(stop.nights || 0), 0);
  const routeValid = allocatedNights === totalNights;
  const currentIndex = steps.findIndex((item) => item.id === step);
  const currentServices = services[activeDay] ?? [];
  const supplierTotal = Object.values(supplierCosts).reduce((sum, value) => sum + Number(value || 0), 0);
  const sellingPrice = supplierTotal + Number(markup || 0);

  const routeDays = useMemo(() => {
    const result: Array<{ day: number; date: Date; city: string; move?: string }> = [];
    let stopIndex = 0;
    let nightsUsed = 0;
    for (let index = 0; index < totalDays; index += 1) {
      while (stops[stopIndex] && index > 0 && nightsUsed >= stops[stopIndex].nights && stopIndex < stops.length - 1) {
        nightsUsed = 0;
        stopIndex += 1;
      }
      const stop = stops[stopIndex] ?? stops[stops.length - 1];
      const isMove = index > 0 && nightsUsed === 0 && stopIndex > 0;
      result.push({
        day: index + 1,
        date: addDays(startDate, index),
        city: index === totalDays - 1 ? arrivalGateway : (stop?.city || arrivalGateway),
        move: isMove ? `${stops[stopIndex - 1]?.city} to ${stop?.city}` : undefined,
      });
      if (index < totalDays - 1) nightsUsed += 1;
    }
    return result;
  }, [arrivalGateway, startDate, stops, totalDays]);

  const goTo = (next: BuilderStep) => setStep(next);
  const goForward = () => {
    if (step === "foundation") goTo("route");
    else if (step === "route") goTo("itinerary");
    else if (step === "itinerary") goTo("pricing");
    else if (step === "pricing") goTo("media");
    else if (step === "media") goTo("review");
  };
  const goBack = () => {
    const previous = steps[Math.max(0, currentIndex - 1)];
    if (previous) setStep(previous.id);
  };

  const updateStop = (id: number, patch: Partial<RouteStop>) => {
    setStops((current) => current.map((stop) => stop.id === id ? { ...stop, ...patch } : stop));
  };

  const addStop = () => {
    const id = Math.max(...stops.map((item) => item.id), 0) + 1;
    setStops((current) => [...current, { id, city: "New stop", nights: 1 }]);
  };

  const openService = (kind: ServiceKind) => {
    setServiceType(kind);
    setServiceName("");
    setServiceDetail("");
    setServiceOpen(true);
  };

  const addService = () => {
    const title = serviceName.trim() || defaultServiceTitle(serviceType);
    const detail = serviceDetail.trim() || defaultServiceDetail(serviceType);
    setServices((current) => ({
      ...current,
      [activeDay]: [...(current[activeDay] ?? []), { id: `${serviceType}-${Date.now()}`, kind: serviceType, title, detail, state: "planned" }],
    }));
    setServiceOpen(false);
    onToast(`${serviceLabels[serviceType]} added to Day ${activeDay}`);
  };

  const addMediaFiles = (files: File[]) => {
    if (!files.length) return;
    const items: MediaItem[] = files.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      url: URL.createObjectURL(file),
      kind: file.type.startsWith("video/") ? "video" : "image",
      isCover: false,
    }));
    setMedia((current) => {
      const next = [...current, ...items];
      const firstImage = next.find((item) => item.kind === "image");
      if (!next.some((item) => item.isCover) && firstImage) firstImage.isCover = true;
      return next;
    });
    onToast(`${files.length} ${files.length === 1 ? "media file" : "media files"} added to the package`);
  };

  const removeMedia = (id: string) => {
    setMedia((current) => {
      const next = current.filter((item) => item.id !== id);
      const firstImage = next.find((item) => item.kind === "image");
      if (!next.some((item) => item.isCover) && firstImage) firstImage.isCover = true;
      return next;
    });
  };

  const setCover = (id: string) => {
    setMedia((current) => current.map((item) => ({ ...item, isCover: item.id === id })));
    onToast("Cover photo updated");
  };

  const complete = () => {
    const id = `PKG-${Math.floor(1000 + Math.random() * 8999)}`;
    onComplete({
      id,
      name,
      destination: `${stops.map((item) => item.city).join(" and ")}, Indonesia`,
      region,
      duration: `${totalDays} days · ${totalNights} nights`,
      startingPrice: Math.round(sellingPrice / Math.max(1, Number(adults))),
      updated: "Sep 22, 2026",
      status: "Draft",
      source: "Your catalog",
      image: baliImage,
      highlights: story.split("\n").map((item) => item.trim()).filter(Boolean),
    });
  };

  return (
    <DetailPage
      className="package-builder"
      title="Create package"
      status={<StatusChip tone="progress">Draft</StatusChip>}
      meta={<span className="package-builder__meta"><Icon name="checkDone" size="sm" />Changes saved locally</span>}
      actions={<Button variant="ghost" size="sm" onClick={onCancel}>Save and exit</Button>}
    >
      <div className="builder-layout">
        <nav className="builder-steps" aria-label="Package creation steps">
          {steps.map((item, index) => {
            const isDone = index < currentIndex;
            const isActive = item.id === step;
            return (
              <button
                key={item.id}
                type="button"
                className={`${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}`.trim()}
                onClick={() => setStep(item.id)}
              >
                <span className="builder-steps__marker">{isDone ? <Icon name="check" size="xs" /> : index + 1}</span>
                <span><strong>{item.label}</strong><small>{item.helper}</small></span>
              </button>
            );
          })}
        </nav>

        <main className="builder-canvas">
          {step === "foundation" ? (
            <FoundationStep
              source={source}
              setSource={setSource}
              tripType={tripType}
              setTripType={setTripType}
              name={name}
              setName={setName}
              region={region}
              setRegion={setRegion}
              story={story}
              setStory={setStory}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              flexibleDays={flexibleDays}
              setFlexibleDays={setFlexibleDays}
              origin={origin}
              setOrigin={setOrigin}
              arrivalGateway={arrivalGateway}
              setArrivalGateway={setArrivalGateway}
              adults={adults}
              setAdults={setAdults}
              children={children}
              setChildren={setChildren}
              rooms={rooms}
              setRooms={setRooms}
              totalDays={totalDays}
            />
          ) : null}

          {step === "route" ? (
            <RouteStep
              startDate={startDate}
              totalNights={totalNights}
              allocatedNights={allocatedNights}
              stops={stops}
              updateStop={updateStop}
              addStop={addStop}
              onRemove={(id) => setStops((current) => current.filter((item) => item.id !== id))}
              onConnection={(day) => {
                setActiveDay(day);
                openService("car");
              }}
            />
          ) : null}

          {step === "itinerary" ? (
            <ItineraryStep
              days={routeDays}
              activeDay={activeDay}
              setActiveDay={setActiveDay}
              services={currentServices}
              openService={openService}
              onRemove={(id) => setServices((current) => ({ ...current, [activeDay]: (current[activeDay] ?? []).filter((item) => item.id !== id) }))}
            />
          ) : null}

          {step === "pricing" ? (
            <PricingStep
              costs={supplierCosts}
              setCosts={setSupplierCosts}
              markup={markup}
              setMarkup={setMarkup}
              supplierTotal={supplierTotal}
              sellingPrice={sellingPrice}
              adults={Number(adults)}
            />
          ) : null}

          {step === "media" ? (
            <MediaStep
              media={media}
              onAddFiles={addMediaFiles}
              onRemove={removeMedia}
              onCover={setCover}
            />
          ) : null}

          {step === "review" ? (
            <ReviewStep
              name={name}
              route={stops.map((item) => item.city).join(" → ")}
              totalDays={totalDays}
              totalNights={totalNights}
              startDate={startDate}
              endDate={endDate}
              sellingPrice={sellingPrice}
              serviceCount={Object.values(services).flat().length}
              mediaCount={media.length}
              hasCover={media.some((item) => item.isCover)}
              onFixRates={() => setStep("pricing")}
              onFixServices={() => setStep("itinerary")}
              onFixMedia={() => setStep("media")}
            />
          ) : null}

          <footer className="builder-footer">
            <span>{currentIndex + 1} of {steps.length} · {steps[currentIndex].label}</span>
            <div>
              {currentIndex > 0 ? <Button variant="ghost" size="md" onClick={goBack}>Back</Button> : <Button variant="ghost" size="md" onClick={onCancel}>Cancel</Button>}
              {step === "review" ? (
                <Button variant="primary" size="md" leadingIcon={<Icon name="check" size="sm" />} onClick={complete}>Create draft package</Button>
              ) : (
                <Button variant="primary" size="md" trailingIcon={<Icon name="chevronRight" size="sm" />} disabled={step === "route" && !routeValid} onClick={goForward}>Continue</Button>
              )}
            </div>
          </footer>
        </main>

      </div>

      <ServiceModal
        open={serviceOpen}
        kind={serviceType}
        setKind={setServiceType}
        day={activeDay}
        name={serviceName}
        setName={setServiceName}
        detail={serviceDetail}
        setDetail={setServiceDetail}
        region={region}
        onClose={() => setServiceOpen(false)}
        onAdd={addService}
      />
    </DetailPage>
  );
}

function FoundationStep(props: {
  source: string; setSource: (value: string) => void;
  tripType: string; setTripType: (value: string) => void;
  name: string; setName: (value: string) => void;
  region: string; setRegion: (value: string) => void;
  story: string; setStory: (value: string) => void;
  startDate: string; setStartDate: (value: string) => void;
  endDate: string; setEndDate: (value: string) => void;
  flexibleDays: string; setFlexibleDays: (value: string) => void;
  origin: string; setOrigin: (value: string) => void;
  arrivalGateway: string; setArrivalGateway: (value: string) => void;
  adults: string; setAdults: (value: string) => void;
  children: string; setChildren: (value: string) => void;
  rooms: string; setRooms: (value: string) => void;
  totalDays: number;
}) {
  return (
    <BuilderSection title="Set the trip foundation" description="These choices create the route calendar and pricing basis used by every service.">
      <FormGroup title="Starting point" description="Choose how much of the package should be prefilled.">
        <div className="builder-choice-row">
          <ChoiceButton icon="fileSimple" title="Start blank" helper="Build a new itinerary" selected={props.source === "blank"} onClick={() => props.setSource("blank")} />
          <ChoiceButton icon="copy" title="Copy package" helper="Reuse an existing structure" selected={props.source === "copy"} onClick={() => props.setSource("copy")} />
          <ChoiceButton icon="bookmark" title="Paryatech catalog" helper="Adapt a curated template" selected={props.source === "catalog"} onClick={() => props.setSource("catalog")} />
        </div>
      </FormGroup>
      <FormGroup title="Package identity" description="Used internally and in proposals.">
        <div className="builder-fields builder-fields--two">
          <TextField label="Package name" value={props.name} onChange={(event) => props.setName(event.target.value)} />
          <TextField label="Region" value={props.region} onChange={(event) => props.setRegion(event.target.value)} />
        </div>
        <TextField
          label="Why travellers will love this package"
          multiline
          rows={4}
          value={props.story}
          hint="Write one short highlight per line. The package page previews the first two and keeps the full story under View all."
          onChange={(event) => props.setStory(event.target.value)}
        />
      </FormGroup>
      <FormGroup title="Travel pattern" description="Fixed departures use exact dates. Flexible packages use the same day plan for multiple departures.">
        <div className="builder-segment" role="group" aria-label="Travel pattern">
          <button type="button" className={props.tripType === "fixed" ? "is-active" : ""} onClick={() => props.setTripType("fixed")}><Icon name="calendar" size="sm" /><span><strong>Fixed departure</strong><small>Exact operating dates</small></span></button>
          <button type="button" className={props.tripType === "flexible" ? "is-active" : ""} onClick={() => props.setTripType("flexible")}><Icon name="refresh" size="sm" /><span><strong>Flexible dates</strong><small>Reusable itinerary</small></span></button>
        </div>
        {props.tripType === "fixed" ? (
          <div key="fixed-dates" className="builder-fields builder-fields--two">
            <TextField label="Travel starts" type="date" value={props.startDate} onChange={(event) => props.setStartDate(event.target.value)} />
            <TextField label="Travel ends" type="date" value={props.endDate} min={props.startDate} onChange={(event) => props.setEndDate(event.target.value)} hint={`${props.totalDays} dated itinerary days will be created.`} />
          </div>
        ) : (
          <div key="flexible-dates" className="builder-fields builder-fields--two">
            <TextField label="Itinerary length" type="number" min="1" value={props.flexibleDays} onChange={(event) => props.setFlexibleDays(event.target.value)} hint={`${props.totalDays} reusable day templates will be created.`} />
            <TextField label="Travel season" defaultValue="Nov 2026 – Mar 2027" hint="Exact dates are selected when used in a proposal." />
          </div>
        )}
      </FormGroup>
      <FormGroup title="Traveller and gateway basis" description="The base configuration controls rooms, vehicles and per-person pricing.">
        <div className="builder-fields builder-fields--two">
          <TextField label="Origin city" value={props.origin} onChange={(event) => props.setOrigin(event.target.value)} />
          <TextField label="Arrival gateway" value={props.arrivalGateway} onChange={(event) => props.setArrivalGateway(event.target.value)} />
        </div>
        <div className="builder-fields builder-fields--three">
          <TextField label="Adults" type="number" min="1" value={props.adults} onChange={(event) => props.setAdults(event.target.value)} />
          <TextField label="Children" type="number" min="0" value={props.children} onChange={(event) => props.setChildren(event.target.value)} />
          <TextField label="Rooms" type="number" min="1" value={props.rooms} onChange={(event) => props.setRooms(event.target.value)} />
        </div>
      </FormGroup>
    </BuilderSection>
  );
}

function RouteStep({ startDate, totalNights, allocatedNights, stops, updateStop, addStop, onRemove, onConnection }: {
  startDate: string;
  totalNights: number;
  allocatedNights: number;
  stops: RouteStop[];
  updateStop: (id: number, patch: Partial<RouteStop>) => void;
  addStop: () => void;
  onRemove: (id: number) => void;
  onConnection: (day: number) => void;
}) {
  let offset = 0;
  return (
    <BuilderSection title="Map the route and allocate nights" description="A valid route accounts for every overnight stay before hotels and transfers are added.">
      <div className="route-summary" aria-label="Route summary">
        {stops.map((stop, index) => <span key={stop.id}><b>{stop.city}</b><small>{stop.nights} nights</small>{index < stops.length - 1 ? <Icon name="chevronRight" size="sm" /> : null}</span>)}
      </div>
      <div className="route-allocation">
        <span><strong>{allocatedNights}</strong> of {totalNights} nights allocated</span>
        <span className={allocatedNights === totalNights ? "is-valid" : "is-warning"}><Icon name={allocatedNights === totalNights ? "checkCircle" : "alertTriangle"} size="sm" />{allocatedNights === totalNights ? "Route is balanced" : `Adjust by ${Math.abs(totalNights - allocatedNights)} nights`}</span>
      </div>
      <div className="route-editor">
        {stops.map((stop, index) => {
          const arrival = addDays(startDate, offset);
          offset += Number(stop.nights || 0);
          const departure = addDays(startDate, offset);
          const departureDay = offset + 1;
          return (
            <div className="route-block" key={stop.id}>
              <div className="route-stop">
                <span className="route-stop__index">{index + 1}</span>
                <div className="route-stop__fields">
                  <TextField label="Destination" value={stop.city} onChange={(event) => updateStop(stop.id, { city: event.target.value })} />
                  <TextField label="Nights" type="number" min="1" value={stop.nights} onChange={(event) => updateStop(stop.id, { nights: Math.max(1, Number(event.target.value)) })} />
                </div>
                <div className="route-stop__dates"><span>Arrive {dateLabel(arrival)}</span><span>Leave {dateLabel(departure)}</span></div>
                {stops.length > 1 ? <Button variant="ghost" size="xs" iconOnly aria-label={`Remove ${stop.city}`} leadingIcon={<Icon name="clear" size="xs" />} onClick={() => onRemove(stop.id)} /> : null}
              </div>
              {index < stops.length - 1 ? (
                <button type="button" className="route-connection" onClick={() => onConnection(departureDay)}>
                  <Icon name="bus" size="sm" />
                  <span><strong>Connect {stop.city} to {stops[index + 1].city}</strong><small>Private car planned · change mode or timing</small></span>
                  <Icon name="chevronRight" size="sm" />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
      <Button variant="ghost" size="sm" leadingIcon={<Icon name="plus" size="sm" />} onClick={addStop}>Add destination</Button>
    </BuilderSection>
  );
}

function ItineraryStep({ days, activeDay, setActiveDay, services, openService, onRemove }: {
  days: Array<{ day: number; date: Date; city: string; move?: string }>;
  activeDay: number;
  setActiveDay: (day: number) => void;
  services: DraftService[];
  openService: (kind: ServiceKind) => void;
  onRemove: (id: string) => void;
}) {
  const day = days.find((item) => item.day === activeDay) ?? days[0];
  return (
    <BuilderSection title="Build the itinerary day by day" description="Every service is attached to a date and operating location, so handoffs remain visible.">
      <div className="itinerary-builder">
        <nav className="itinerary-builder__days" aria-label="Trip days">
          {days.map((item) => (
            <button key={item.day} type="button" className={item.day === activeDay ? "is-active" : ""} onClick={() => setActiveDay(item.day)}>
              <strong>Day {item.day}</strong><small>{dateLabel(item.date)}</small><span>{item.city}</span>
            </button>
          ))}
        </nav>
        <div className="itinerary-builder__day">
          <header>
            <span className="itinerary-day__number">Day {day.day}</span>
            <div><h2>{day.move || `${day.city} day plan`}</h2><p><Icon name="pin" size="xs" />{day.city} · {dateLabel(day.date)}</p></div>
          </header>
          <div className="service-add-strip" aria-label="Add service">
            {(["hotel", "activity", "transport", "car", "flight"] as ServiceKind[]).map((kind) => (
              <button type="button" key={kind} onClick={() => openService(kind)}><Icon name={serviceIcon[kind]} size="sm" /><span>Add {serviceLabels[kind]}</span></button>
            ))}
          </div>
          <div className="draft-services">
            {services.length ? services.map((service) => (
              <article className="draft-service" key={service.id}>
                <span className={`draft-service__icon draft-service__icon--${service.kind}`}><Icon name={serviceIcon[service.kind]} size="sm" /></span>
                <div><p>{serviceLabels[service.kind]}</p><h3>{service.title}</h3><span>{service.detail}</span></div>
                <StatusChip tone={service.state === "confirmed" ? "done" : service.state === "needs-rate" ? "progress" : "open"}>{service.state === "confirmed" ? "Included" : service.state === "needs-rate" ? "Rate needed" : "Planned"}</StatusChip>
                <Button variant="ghost" size="xs" iconOnly aria-label={`Remove ${service.title}`} leadingIcon={<Icon name="clear" size="xs" />} onClick={() => onRemove(service.id)} />
              </article>
            )) : (
              <div className="draft-services__empty"><Icon name="list" size="lg" /><h3>No services on this day</h3><p>Add an activity, stay, transport, car or flight to make the day operational.</p></div>
            )}
          </div>
        </div>
      </div>
    </BuilderSection>
  );
}

function PricingStep({ costs, setCosts, markup, setMarkup, supplierTotal, sellingPrice, adults }: {
  costs: { flights: number; stays: number; activities: number; ground: number; meals: number };
  setCosts: (value: { flights: number; stays: number; activities: number; ground: number; meals: number }) => void;
  markup: string; setMarkup: (value: string) => void;
  supplierTotal: number; sellingPrice: number; adults: number;
}) {
  const update = (key: keyof typeof costs, value: string) => setCosts({ ...costs, [key]: Number(value) });
  return (
    <BuilderSection title="Build the commercial basis" description="Keep supplier costs inspectable by service type before applying package-level markup.">
      <div className="pricing-sheet">
        <div className="pricing-sheet__head"><span>Component</span><span>Cost basis</span><span>Supplier cost</span></div>
        <PriceRow icon="plane" label="Flights" basis="2 adults · return" value={costs.flights} onChange={(value) => update("flights", value)} />
        <PriceRow icon="hotel" label="Accommodation" basis="6 room nights" value={costs.stays} onChange={(value) => update("stays", value)} />
        <PriceRow icon="camera" label="Activities" basis="3 experiences" value={costs.activities} onChange={(value) => update("activities", value)} />
        <PriceRow icon="bus" label="Cars and transfers" basis="3 movements" value={costs.ground} onChange={(value) => update("ground", value)} />
        <PriceRow icon="sun" label="Meals" basis="Included with stays" value={costs.meals} onChange={(value) => update("meals", value)} />
      </div>
      <div className="pricing-summary">
        <div><span>Supplier total</span><strong>{formatMoney(supplierTotal)}</strong></div>
        <TextField label="Package markup" type="number" value={markup} onChange={(event) => setMarkup(event.target.value)} hint="Fixed amount for this base configuration." />
        <div className="pricing-summary__total"><span>Selling price</span><strong>{formatMoney(sellingPrice)}</strong><small>{formatMoney(Math.round(sellingPrice / Math.max(1, adults)))} per adult</small></div>
      </div>
      <FormGroup title="Payment and validity" description="These terms travel with the package when it is used in a proposal.">
        <div className="builder-fields builder-fields--two">
          <TextField label="Rate valid until" type="date" defaultValue="2026-10-15" />
          <TextField label="Advance required" defaultValue="30%" />
        </div>
        <TextField label="Commercial note" multiline rows={3} defaultValue="Rates are subject to supplier confirmation and airfare availability." />
      </FormGroup>
    </BuilderSection>
  );
}

function MediaStep({ media, onAddFiles, onRemove, onCover }: {
  media: MediaItem[]; onAddFiles: (files: File[]) => void; onRemove: (id: string) => void; onCover: (id: string) => void;
}) {
  return (
    <BuilderSection title="Add package media" description="Upload photos and short videos for the gallery and proposals. The cover leads the package everywhere it appears.">
      <label className="media-drop">
        <Icon name="upload" size="md" />
        <span><strong>Drop media here or browse files</strong><small>JPG, PNG, MP4 or MOV · attached to this draft only</small></span>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(event) => {
            onAddFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </label>
      {media.length ? (
        <div className="media-grid" aria-label="Uploaded package media">
          {media.map((item) => (
            <article className={`media-item ${item.isCover ? "is-cover" : ""}`} key={item.id}>
              {item.kind === "video" ? <video src={item.url} aria-label={item.name} muted controls /> : <img src={item.url} alt={item.name} />}
              {item.isCover ? <span className="media-cover-badge">Cover</span> : null}
              <div className="media-item__bar">
                <span className="media-item__name" title={item.name}>{item.name}</span>
                {!item.isCover && item.kind === "image" ? <button type="button" className="media-item__btn" onClick={() => onCover(item.id)}>Set cover</button> : null}
                <button type="button" className="media-item__btn media-item__btn--danger" aria-label={`Remove ${item.name}`} onClick={() => onRemove(item.id)}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="draft-services__empty"><Icon name="camera" size="lg" /><h3>No media yet</h3><p>Upload at least one image—the first image becomes the cover automatically.</p></div>
      )}
    </BuilderSection>
  );
}

function ReviewStep({ name, route, totalDays, totalNights, startDate, endDate, sellingPrice, serviceCount, mediaCount, hasCover, onFixRates, onFixServices, onFixMedia }: {
  name: string; route: string; totalDays: number; totalNights: number; startDate: string; endDate: string; sellingPrice: number; serviceCount: number; mediaCount: number; hasCover: boolean; onFixRates: () => void; onFixServices: () => void; onFixMedia: () => void;
}) {
  return (
    <BuilderSection title="Review operational readiness" description="The draft can be saved now; flagged items remain visible until suppliers confirm them.">
      <section className="review-hero">
        <div><p>Ready as a working draft</p><h2>{name}</h2><span>{route}</span></div>
        <div><strong>{totalDays} days</strong><span>{dateLabel(toDate(startDate))} – {dateLabel(toDate(endDate))}</span></div>
        <div><strong>{formatMoney(sellingPrice)}</strong><span>base selling price</span></div>
      </section>
      <div className="review-checks">
        <ReviewRow icon="calendar" title="Dates and route" detail={`${totalDays} days · ${totalNights} nights · all nights allocated`} state="ready" />
        <ReviewRow icon="list" title="Itinerary coverage" detail={`${serviceCount} services across ${totalDays} days`} state="ready" action="Review days" onAction={onFixServices} />
        <ReviewRow icon="wallet" title="Supplier rates" detail="4 services still need confirmed rates" state="attention" action="Review pricing" onAction={onFixRates} />
        <ReviewRow icon="camera" title="Package media" detail={mediaCount > 0 ? `${mediaCount} media ${mediaCount === 1 ? "file" : "files"}${hasCover ? " · cover set" : ""}` : "No media uploaded yet"} state={mediaCount > 0 ? "ready" : "attention"} action="Add media" onAction={onFixMedia} />
        <ReviewRow icon="passport" title="Visa and insurance" detail="Kept separate from the package price" state="ready" />
        <ReviewRow icon="fileText" title="Customer-facing content" detail="Images and package summary can be completed after the draft is created" state="later" />
      </div>
      <div className="review-note"><Icon name="info" size="sm" /><p><strong>What happens next</strong><span>The package opens in the same operational workspace where your team can confirm suppliers, add media, refine policies and use it in a proposal.</span></p></div>
    </BuilderSection>
  );
}

function BuilderSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="builder-section"><header className="builder-section__header"><h1>{title}</h1><p>{description}</p></header>{children}</section>;
}

function FormGroup({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="builder-form-group"><div><h2>{title}</h2><p>{description}</p></div><div className="builder-form-group__content">{children}</div></section>;
}

function ChoiceButton({ icon, title, helper, selected, onClick }: { icon: IconName; title: string; helper: string; selected: boolean; onClick: () => void }) {
  return <button type="button" className={`builder-choice ${selected ? "is-selected" : ""}`} onClick={onClick}><Icon name={icon} size="md" /><span><strong>{title}</strong><small>{helper}</small></span>{selected ? <Icon name="checkCircle" size="sm" /> : null}</button>;
}

function PriceRow({ icon, label, basis, value, onChange }: { icon: IconName; label: string; basis: string; value: number; onChange: (value: string) => void }) {
  return <div className="pricing-sheet__row"><span><Icon name={icon} size="sm" />{label}</span><span>{basis}</span><TextField label={`${label} supplier cost`} aria-label={`${label} supplier cost`} type="number" value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function ReviewRow({ icon, title, detail, state, action, onAction }: { icon: IconName; title: string; detail: string; state: "ready" | "attention" | "later"; action?: string; onAction?: () => void }) {
  return <div className="review-row"><span className={`review-row__state review-row__state--${state}`}><Icon name={state === "ready" ? "check" : state === "attention" ? "alertTriangle" : icon} size="sm" /></span><div><h3>{title}</h3><p>{detail}</p></div><StatusChip tone={state === "ready" ? "done" : state === "attention" ? "progress" : "open"}>{state === "ready" ? "Ready" : state === "attention" ? "Attention" : "Later"}</StatusChip>{action ? <Button variant="ghost" size="xs" onClick={onAction}>{action}</Button> : null}</div>;
}

function ServiceModal({ open, kind, setKind, day, name, setName, detail, setDetail, region, onClose, onAdd }: {
  open: boolean; kind: ServiceKind; setKind: (kind: ServiceKind) => void; day: number; name: string; setName: (value: string) => void; detail: string; setDetail: (value: string) => void; region: string; onClose: () => void; onAdd: () => void;
}) {
  const [sourceFilter, setSourceFilter] = useState<"all" | "crm" | "api">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSourceFilter("all");
    setSearch("");
    setSelectedId(null);
  }, [kind, open]);

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return supplyResults
      .filter((entry) => entry.kind === kind)
      .filter((entry) => sourceFilter === "all" || entry.source === sourceFilter)
      .filter((entry) => !query || `${entry.name} ${entry.vendor} ${entry.location}`.toLowerCase().includes(query))
      .slice(0, 4);
  }, [kind, search, sourceFilter]);

  const pickSupply = (entry: SupplyResult) => {
    setSelectedId(entry.id);
    setName(entry.name);
    setDetail(entry.detail);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="wide"
      eyebrow={`Day ${day} · Itinerary`}
      title={`Add ${serviceLabels[kind].toLowerCase()}`}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" leadingIcon={<Icon name="plus" size="sm" />} onClick={onAdd}>Add to Day {day}</Button></>}
    >
      <FilterSelect label="Service type" value={kind} onChange={(value) => setKind(value as ServiceKind)} options={(["hotel", "activity", "transport", "car", "flight", "meal"] as ServiceKind[]).map((value) => ({ value, label: serviceLabels[value] }))} />
      <section className="supply-picker">
        <header><div><h3>Find from supply</h3><p>Search your CRM first, or compare live options available in {region}.</p></div><Icon name="vendors" size="md" /></header>
        <div className="supply-source-tabs" role="group" aria-label="Service source">
          <button type="button" className={sourceFilter === "all" ? "is-active" : ""} onClick={() => setSourceFilter("all")}>All supply</button>
          <button type="button" className={sourceFilter === "crm" ? "is-active" : ""} onClick={() => setSourceFilter("crm")}>CRM inventory</button>
          <button type="button" className={sourceFilter === "api" ? "is-active" : ""} onClick={() => setSourceFilter("api")}>Regional APIs</button>
        </div>
        <TextField label={`Search ${serviceLabels[kind].toLowerCase()} or vendor`} type="search" value={search} placeholder={`Search ${serviceLabels[kind].toLowerCase()} names, vendors or locations`} onChange={(event) => setSearch(event.target.value)} autoFocus />
        <div className="supply-results" role="listbox" aria-label={`Available ${serviceLabels[kind].toLowerCase()} services`}>
          {matches.length ? matches.map((entry) => (
            <button key={entry.id} type="button" role="option" aria-selected={entry.id === selectedId} className={entry.id === selectedId ? "is-selected" : ""} onClick={() => pickSupply(entry)}>
              <span className={`supply-results__icon supply-results__icon--${entry.source}`}><Icon name={entry.source === "crm" ? "vendors" : "zap"} size="sm" /></span>
              <span className="supply-results__body"><strong>{entry.name}</strong><small>{entry.vendor} · {entry.location}</small><em>{entry.availability}</em></span>
              <span className="supply-results__price"><b>{entry.price}</b><small>{entry.source === "crm" ? "CRM" : "API"}</small></span>
            </button>
          )) : <p className="supply-results__empty">No matching supply. You can still add the service manually below.</p>}
        </div>
      </section>
      <div className="supply-manual-divider"><span>Selected service details</span></div>
      <TextField label={`${serviceLabels[kind]} name`} value={name} placeholder={servicePlaceholder(kind)} onChange={(event) => { setSelectedId(null); setName(event.target.value); }} />
      {kind === "hotel" ? <div className="builder-fields builder-fields--two"><TextField label="Check-in" type="date" /><TextField label="Check-out" type="date" /><TextField label="Room category" placeholder="Deluxe room" /><TextField label="Meal plan" placeholder="Breakfast included" /></div> : null}
      {kind === "activity" ? <div className="builder-fields builder-fields--two"><TextField label="Start time" type="time" /><TextField label="Duration" placeholder="8 hours" /><TextField label="Pickup point" placeholder="Hotel lobby" /><TextField label="Transfer" placeholder="Included / not required" /></div> : null}
      {kind === "transport" ? <div className="builder-fields builder-fields--two"><TextField label="Mode" placeholder="Flight, train, ferry or coach" /><TextField label="Departure time" type="time" /><TextField label="From" placeholder="Origin" /><TextField label="To" placeholder="Destination" /></div> : null}
      {kind === "car" ? <div className="builder-fields builder-fields--two"><TextField label="Service basis" placeholder="Transfer, full day or disposal" /><TextField label="Vehicle" placeholder="Sedan, SUV or coach" /><TextField label="Pickup" placeholder="Location and time" /><TextField label="Capacity" placeholder="Seats and luggage" /></div> : null}
      {kind === "flight" ? <div className="builder-fields builder-fields--two"><TextField label="Route" placeholder="e.g. Delhi to Denpasar" /><TextField label="Cabin preference" placeholder="Economy" /><TextField label="Preferred departure window" placeholder="Morning, afternoon or evening" /><TextField label="Baggage preference" placeholder="e.g. 15 kg checked" /></div> : null}
      {kind === "meal" ? <div className="builder-fields builder-fields--two"><TextField label="Meal type" placeholder="Breakfast" /><TextField label="Venue" placeholder="Hotel or restaurant" /></div> : null}
      <TextField label="Operational details" multiline rows={3} value={detail} placeholder={defaultServiceDetail(kind)} onChange={(event) => setDetail(event.target.value)} />
    </Modal>
  );
}

function defaultServiceTitle(kind: ServiceKind) {
  return { flight: "Flight sector", hotel: "Accommodation stay", activity: "Planned experience", transport: "Intercity transport", car: "Private car service", meal: "Included meal" }[kind];
}

function defaultServiceDetail(kind: ServiceKind) {
  return { flight: "Route, cabin and baggage preferences; live flight and timing selected when proposed", hotel: "Room, meal plan and check-in details", activity: "Timing, duration, pickup and inclusions", transport: "Mode, route and preferred operating window", car: "Service basis, vehicle, passengers and luggage", meal: "Meal type, venue and inclusion basis" }[kind];
}

function servicePlaceholder(kind: ServiceKind) {
  return { flight: "e.g. Delhi to Denpasar", hotel: "e.g. Teras Ubud Resort", activity: "e.g. Ubud culture trail", transport: "e.g. Ubud to Seminyak", car: "e.g. Airport pickup", meal: "e.g. Breakfast at hotel" }[kind];
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
