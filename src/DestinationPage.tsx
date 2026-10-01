import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "@paryatech/ui";
import { buildDestinationSnapshot, loadDestinationBookings, workspaceRegionSuggestions } from "./destinationSources";
import type { DestinationBooking, DestinationItineraryService, DestinationPackage, DestinationProposal, DestinationSnapshot } from "./destinationSources";
import { baliExample } from "./destinationDemoData";
import type { DestinationExampleBase, DestinationExampleService, DestinationExampleVendor, DestinationExampleTrip } from "./destinationDemoData";
import { featuredRegions, regionById, searchRegions } from "./regionSearch";
import type { RegionSuggestion } from "./regionSearch";
import { destinationProfileFor } from "./destinationProfiles";
import type { DestinationProfile } from "./destinationProfiles";
import bengaluruImage from "./assets/destinations/bengaluru-vidhana-soudha.jpg";
import baliTerracesImage from "./assets/bali/bali-rice-terraces-hero.jpg";
import baliTempleImage from "./assets/bali/ubud-temple.jpg";
import baliPenidaImage from "./assets/bali/nusa-penida.jpg";
import "./DestinationPage.css";

interface DestinationPageProps {
  packages: DestinationPackage[];
  proposals: DestinationProposal[];
  onOpenRecord?: (kind: "package" | "proposal", id: string) => void;
}
type SourceModule = "packages" | "bookings" | "vendors";
type DestinationService = DestinationSnapshot["services"][number];
type GuidePlace = { key: string; name: string; detail: string; image?: string; source: string; service?: DestinationService; count: number; sources: string[]; isExample?: boolean };
type ExampleSelection = { kind: string; record: DestinationExampleBase };

function regionFromUrl() { return regionById(new URLSearchParams(window.location.search).get("region")) ?? null; }

function openModule(module: SourceModule) {
  const url = new URL(window.location.href);
  if (module === "packages") url.searchParams.delete("module");
  else url.searchParams.set("module", module);
  window.history.pushState({ module }, "", `${url.pathname}${url.search}${url.hash}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
function jumpTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }
function plural(count: number, singular: string) { return `${count} ${singular}${count === 1 ? "" : "s"}`; }
function money(amount: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount); }
const destinationActivityImages: Record<string, string> = {
  "svc-tegallalang-rice-walk": baliTerracesImage,
  "svc-uluwatu-sunset-visit": baliTempleImage,
  "svc-penida-coastal-day": baliPenidaImage,
};
function photo(service: DestinationService) { return destinationActivityImages[service.record.serviceId] ?? service.profile?.media.find((item) => item.usedInBanner && item.kind !== "video")?.imageUrl ?? service.profile?.imageUrl ?? service.vendors.find((item) => item.imageUrl)?.imageUrl; }
function isActivity(category: string) { return /activit/i.test(category); }
function statusTone(value: string) { return /published|approved|active|confirmed|completed|accepted|live/i.test(value) ? "positive" : /draft|pending|tentative|reprice/i.test(value) ? "pending" : "neutral"; }

function Status({ value }: { value: string }) { return <span className={`destination-status destination-status--${statusTone(value)}`}>{value}</span>; }

function DestinationHero({ name, location, profile, fallbackImage, counts, hasExamples }: {
  name: string;
  location: string;
  profile?: DestinationProfile;
  fallbackImage?: string;
  counts: { packages: number; services: number; activities: number; guides: number; vendors: number };
  hasExamples: boolean;
}) {
  const images = profile?.images ?? (fallbackImage ? [{ src: fallbackImage, alt: `${name} destination`, caption: name }] : []);
  return <section className={`destination-hero${images.length ? " destination-hero--pictured" : ""}`} aria-labelledby="destination-hero-title">
    <div className="destination-hero__content">
      <span className="destination-hero__eyebrow"><Icon name="pin" size="sm" /> Destination profile</span>
      <h2 id="destination-hero-title">{name}</h2>
      <span className="destination-hero__location">{location}</span>
      <p>{profile?.description ?? `Explore the packages, services, guides, and local partners connected to ${name}.`}</p>
      <div className="destination-hero__stats" aria-label="Connected destination content">
        <span><strong>{counts.packages}</strong><small>Packages</small></span>
        <span><strong>{counts.services}</strong><small>Services</small></span>
        <span><strong>{counts.activities}</strong><small>Activities</small></span>
        <span><strong>{counts.guides}</strong><small>Guides</small></span>
        <span><strong>{counts.vendors}</strong><small>Vendors</small></span>
      </div>
      {hasExamples && <span className="destination-hero__example">Includes example data</span>}
    </div>
    {images.length > 0 && <div className={`destination-hero__gallery${images.length === 1 ? " destination-hero__gallery--single" : ""}`} aria-label={`${name} photos`}>
      {images.map((image, index) => <figure className={`destination-hero__image destination-hero__image--${index + 1}`} key={image.src}>
        <img src={image.src} alt={image.alt} />
        <figcaption>{image.caption}</figcaption>
      </figure>)}
    </div>}
  </section>;
}

function Rail({ id, title, count, children, empty }: { id: string; title: string; count: number; children?: ReactNode; empty?: string }) {
  const track = useRef<HTMLDivElement>(null);
  return <section className="destination-rail" id={id} aria-labelledby={`${id}-title`}>
    <div className="destination-rail__header"><h2 id={`${id}-title`}>{title}<span className="destination-count">{count}</span></h2>
      {count > 0 && <div className="destination-rail__arrows"><button type="button" aria-label={`Scroll ${title} left`} onClick={() => track.current?.scrollBy({ left: -600, behavior: "smooth" })}><Icon name="chevronLeft" size="sm" /></button><button type="button" aria-label={`Scroll ${title} right`} onClick={() => track.current?.scrollBy({ left: 600, behavior: "smooth" })}><Icon name="chevronRight" size="sm" /></button></div>}</div>
    {count > 0 ? <div className="destination-rail__track" ref={track} tabIndex={0} aria-label={title}>{children}</div> : <div className="destination-rail__empty">{empty}</div>}
  </section>;
}

function PackageCard({ name, image, destination, note, price, status, source, onClick }: { name: string; image?: string; destination: string; note: string; price: string; status: string; source: string; onClick: () => void }) {
  return <button type="button" className="destination-package-card" onClick={onClick} aria-label={`Open ${name}`}>
    <span className="destination-package-card__photo"><Icon name="package" size="lg" />{image && <img src={image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />}<span>{source}</span></span>
    <span className="destination-package-card__body"><strong>{name}</strong><small>{destination}</small><span className="destination-package-card__note">{note}</span><span className="destination-package-card__foot"><b>{price}</b><Status value={status} /></span></span>
  </button>;
}

function ServiceCard({ item, onClick }: { item: DestinationService; onClick: () => void }) {
  const { record, vendors, profile } = item;
  return <button type="button" className="destination-service-card" onClick={onClick} aria-label={`View ${record.name} details in Destination`}>
    <span className="destination-service-card__photo"><Icon name="package" size="lg" />{photo(item) && <img src={photo(item)} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />}</span>
    <span className="destination-service-card__body"><span className="destination-service-card__type"><span>{record.category}</span></span><strong>{record.name}</strong><span className="destination-service-card__location"><Icon name="pin" size="sm" />{profile?.location ?? record.location}</span><span className="destination-service-card__detail">{profile?.details ?? profile?.about ?? "Service available in this destination"}</span><span className="destination-service-card__suppliers">{vendors.length ? `${plural(vendors.length, "supplier")}: ${vendors.map((vendor) => vendor.name).join(", ")}` : "Supplier not linked"}</span></span>
  </button>;
}

function ItineraryServiceCard({ item, onClick }: { item: DestinationItineraryService; onClick: () => void }) {
  const source = item.sources[0];
  return <button type="button" className="destination-service-card" onClick={onClick} aria-label={`Open ${item.title} in ${source.name}`}>
    <span className="destination-service-card__photo"><Icon name="package" size="lg" />{item.image && <img src={item.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />}</span>
    <span className="destination-service-card__body"><span className="destination-service-card__type"><span>{item.category}</span><span className="destination-service-card__origin">{source.kind === "package" ? "In package" : "In proposal"}</span></span><strong>{item.title}</strong><span className="destination-service-card__location"><Icon name="pin" size="sm" />{item.place}</span><span className="destination-service-card__detail">{item.detail}</span><span className="destination-service-card__suppliers">{item.vendor ? `Supplier noted: ${item.vendor}` : `${source.name}${item.sources.length > 1 ? ` +${item.sources.length - 1} more` : ""}`}</span></span>
  </button>;
}

function ExampleServiceCard({ item, onClick }: { item: DestinationExampleService; onClick: () => void }) {
  return <button type="button" className="destination-service-card" onClick={onClick} aria-label={`View example service ${item.name}`}>
    <span className="destination-service-card__photo"><img src={item.image} alt="" loading="lazy" /></span>
    <span className="destination-service-card__body"><span className="destination-service-card__type"><span>{item.category}</span><span className="destination-service-card__origin">Example</span></span><strong>{item.name}</strong><span className="destination-service-card__location"><Icon name="pin" size="sm" />{item.location}</span><span className="destination-service-card__detail">{item.serviceNote}</span><span className="destination-service-card__suppliers">{item.vendor}</span></span>
  </button>;
}

function ActivityCard({ name, image, location, detail, supplier, onClick }: { name: string; image?: string; location: string; detail: string; supplier: string; onClick: () => void }) {
  return <button type="button" className="destination-activity-card" onClick={onClick} aria-label={`View activity ${name}`}>
    <span className="destination-activity-card__photo"><Icon name="pin" size="lg" />{image && <img src={image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />}</span>
    <span className="destination-activity-card__body"><strong>{name}</strong><small><Icon name="pin" size="sm" />{location}</small><span>{detail}</span><em>{supplier}</em></span>
  </button>;
}

function ExampleVendorCard({ item, onClick }: { item: DestinationExampleVendor; onClick: () => void }) {
  return <button type="button" className="destination-vendor-card destination-vendor-card--example" onClick={onClick} aria-label={`View example vendor ${item.name}`}><div><span className="destination-vendor-card__avatar"><img src={item.image} alt="" loading="lazy" /></span><span><strong>{item.name}</strong><small>{item.location}</small></span></div><p>{item.categories.join(" · ")}</p><span className="destination-vendor-card__contact">Contact: {item.contact}</span><footer><span>{plural(item.serviceCount, "linked service")}</span><Status value="Example" /></footer></button>;
}

function ExampleTripCard({ item, onClick }: { item: DestinationExampleTrip; onClick: () => void }) {
  return <button type="button" className="destination-trip-card" onClick={onClick} aria-label={`View example ${item.kind.toLowerCase()} ${item.name}`}><span>{item.kind} · Example <Status value={item.status} /></span><strong>{item.name}</strong><small>{item.customer} · {item.location}</small><b>{item.travel}</b></button>;
}

function ExampleDetail({ selection, onClose }: { selection: ExampleSelection; onClose: () => void }) {
  const { kind, record } = selection;
  useEffect(() => { const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", escape); return () => window.removeEventListener("keydown", escape); }, [onClose]);
  return <div className="destination-detail-backdrop" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="destination-detail" role="dialog" aria-modal="true" aria-labelledby="destination-example-title"><div className="destination-detail__top"><span>{kind} · Bali example</span><button type="button" onClick={onClose} aria-label="Close example details">×</button></div><img className="destination-detail__image" src={record.image} alt="" /><div className="destination-detail__content"><div className="destination-detail__title"><h2 id="destination-example-title">{record.name}</h2></div><p>{record.description}</p><div className="destination-detail__facts"><span><Icon name="pin" size="sm" />{record.location}</span>{"duration" in record && typeof record.duration === "string" ? <span>{record.duration}</span> : null}{"price" in record && typeof record.price === "number" ? <span>From {money(record.price)}</span> : null}{"vendor" in record && typeof record.vendor === "string" ? <span>Supplier: {record.vendor}</span> : null}{"travel" in record && typeof record.travel === "string" ? <span>{record.travel}</span> : null}</div><section><h3>Details</h3><ul>{record.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></section><section><h3>Connected examples</h3><div className="destination-detail__suppliers">{record.connections.map((connection) => <div key={connection}><strong>{connection}</strong></div>)}</div></section><p className="destination-detail__example-note">Illustrative Destination data. This record is not in the source modules.</p></div></aside></div>;
}

function ServiceDetail({ item, onClose }: { item: DestinationService; onClose: () => void }) {
  const { record, vendors, profile } = item;
  useEffect(() => { const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", escape); return () => window.removeEventListener("keydown", escape); }, [onClose]);
  return <div className="destination-detail-backdrop" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <aside className="destination-detail" role="dialog" aria-modal="true" aria-labelledby="destination-detail-title">
      <div className="destination-detail__top"><span>{record.category} in {record.location}</span><button type="button" onClick={onClose} aria-label="Close service details">×</button></div>
      {photo(item) && <img className="destination-detail__image" src={photo(item)} alt={profile?.imageAlt ?? ""} />}
      <div className="destination-detail__content"><div className="destination-detail__title"><h2 id="destination-detail-title">{record.name}</h2></div><p>{profile?.about ?? profile?.details ?? "This service is listed in Vendor CRM."}</p>
        <div className="destination-detail__facts"><span><Icon name="pin" size="sm" />{profile?.location ?? record.location}</span>{profile?.details && <span>{profile.details}</span>}{profile?.rateCardCount ? <span>{plural(profile.rateCardCount, "rate card")}</span> : null}</div>
        {profile?.inclusions?.length ? <section><h3>What’s included</h3><ul>{profile.inclusions.map((line) => <li key={line}>{line}</li>)}</ul></section> : null}
        <section><h3>Available from {plural(vendors.length, "supplier")}</h3>{vendors.length ? <div className="destination-detail__suppliers">{vendors.map((vendor) => <div key={vendor.id}><strong>{vendor.name}</strong><span>{vendor.location}</span></div>)}</div> : <p>No supplier is linked to this service yet.</p>}</section>
        <button type="button" className="destination-detail__source" onClick={() => openModule("vendors")}>Open Vendor CRM <Icon name="chevronRight" size="sm" /></button>
      </div>
    </aside>
  </div>;
}

function PlaceDetail({ place, onClose, onOpenService }: { place: GuidePlace; onClose: () => void; onOpenService: (service: DestinationService) => void }) {
  useEffect(() => { const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", escape); return () => window.removeEventListener("keydown", escape); }, [onClose]);
  return <div className="destination-detail-backdrop" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="destination-detail" role="dialog" aria-modal="true" aria-labelledby="destination-place-detail-title"><div className="destination-detail__top"><span>{place.isExample ? "Guide · Bali example" : "Guides"}</span><button type="button" onClick={onClose} aria-label="Close guide">×</button></div>{place.image && <img className="destination-detail__image" src={place.image} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />}<div className="destination-detail__content"><div className="destination-detail__title"><h2 id="destination-place-detail-title">{place.name}</h2></div><p>{place.detail}</p><section><h3>Connected trips & experiences</h3><div className="destination-detail__suppliers">{place.sources.map((source) => <div key={source}><strong>{source}</strong></div>)}</div></section>{place.isExample && <p className="destination-detail__example-note">Illustrative Destination data. This guide is not in the source modules.</p>}{place.service && <button type="button" className="destination-detail__source" onClick={() => { onClose(); onOpenService(place.service!); }}>View experience details <Icon name="chevronRight" size="sm" /></button>}</div></aside></div>;
}

function buildPlaceGuide(snapshot: DestinationSnapshot, region: RegionSuggestion): GuidePlace[] {
  const places = new Map<string, GuidePlace>();
  const add = (name: string, detail: string, source: string, image?: string, service?: DestinationService) => {
    const clean = name.trim();
    if (!clean || clean.toLowerCase() === region.label.split(",")[0].trim().toLowerCase() || /^(india|uae|united arab emirates)$/i.test(clean)) return;
    const key = clean.toLowerCase();
    const existing = places.get(key);
    if (existing) { existing.count += 1; if (!existing.image && image) existing.image = image; if (!existing.sources.includes(source)) existing.sources.push(source); return; }
    places.set(key, { key, name: clean, detail, source, image, service, count: 1, sources: [source] });
  };
  for (const item of snapshot.services.filter((service) => service.record.category === "Activities")) {
    const location = item.profile?.location?.split(/[·,]/)[0].trim() || item.record.location;
    add(location, item.profile?.about ?? item.record.name, `${item.record.category} · ${item.record.name}`, photo(item), item);
    if (item.profile?.about.toLowerCase().includes("tea overlook")) add("Tea overlook", "A scenic stop on the Munnar ridge trek above the tea estates.", "Viewpoint · Munnar ridge trek", photo(item), item);
  }
  for (const item of snapshot.vendorPackages) {
    const route = item.detail.split("·").at(-1)?.trim() ?? "";
    for (const stop of route.split(/[–—-]/).map((part) => part.trim())) {
      add(stop, item.summary, `In ${item.name}`, item.imageUrl.replace("w=96", "w=640").replace("h=96", "h=480"));
    }
  }
  for (const { record, package: sourcePackage } of snapshot.proposals) {
    for (const day of record.days ?? []) {
      const experience = day.services.find((service) => service.kind === "activity");
      add(day.place, experience?.title ?? day.title ?? `In ${record.name}`, `From ${record.name}`, sourcePackage?.image);
    }
  }
  const priority = (place: GuidePlace) => place.source.startsWith("Viewpoint") ? 3 : place.service ? 2 : 1;
  return [...places.values()].sort((a, b) => priority(b) - priority(a) || b.count - a.count || a.name.localeCompare(b.name));
}

export function DestinationPage({ packages, proposals, onOpenRecord }: DestinationPageProps) {
  const [query, setQuery] = useState(() => regionFromUrl()?.label ?? "");
  const [selectedRegion, setSelectedRegion] = useState<RegionSuggestion | null>(regionFromUrl);
  const [suggestions, setSuggestions] = useState<RegionSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [bookings, setBookings] = useState<DestinationBooking[]>([]);
  const [bookingState, setBookingState] = useState<"loading" | "ready" | "error">("loading");
  const [openService, setOpenService] = useState<DestinationService | null>(null);
  const [openPlace, setOpenPlace] = useState<GuidePlace | null>(null);
  const [openExample, setOpenExample] = useState<ExampleSelection | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const workspacePlaces = useMemo(() => workspaceRegionSuggestions(packages, proposals, bookings), [packages, proposals, bookings]);

  useEffect(() => { const controller = new AbortController(); loadDestinationBookings(controller.signal).then((records) => { if (!controller.signal.aborted) { setBookings(records); setBookingState("ready"); } }).catch(() => { if (!controller.signal.aborted) setBookingState("error"); }); return () => controller.abort(); }, []);
  useEffect(() => { const syncRegion = () => { const region = regionFromUrl(); setSelectedRegion(region); setQuery(region?.label ?? ""); setOpenExample(null); setOpenPlace(null); setOpenService(null); }; window.addEventListener("popstate", syncRegion); return () => window.removeEventListener("popstate", syncRegion); }, []);
  useEffect(() => { const close = (event: PointerEvent) => { if (!searchRef.current?.contains(event.target as Node)) setSuggestionsOpen(false); }; document.addEventListener("pointerdown", close); return () => document.removeEventListener("pointerdown", close); }, []);
  useEffect(() => {
    if (selectedRegion || !query.trim()) { setSuggestions([]); setSearchLoading(false); setSearchError(false); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchLoading(true); setSearchError(false);
      try {
        const results = await searchRegions(query, controller.signal);
        if (!controller.signal.aborted) {
          const term = query.trim().toLowerCase();
          const fromWorkspace = workspacePlaces.filter((region) => region.label.toLowerCase().split(/[^a-z0-9]+/).some((part) => part.startsWith(term)));
          const known = new Set(results.map((region) => region.label.split(",")[0].trim().toLowerCase()));
          if (results.some((region) => region.id === "bengaluru-karnataka")) known.add("bangalore");
          setSuggestions([...results, ...fromWorkspace.filter((region) => !known.has(region.label.toLowerCase()))].sort((a, b) => Number(b.label.toLowerCase().startsWith(term)) - Number(a.label.toLowerCase().startsWith(term))).slice(0, 12));
          setActiveSuggestion(0); setSuggestionsOpen(true);
        }
      } catch (error) { if (!controller.signal.aborted && !(error instanceof DOMException && error.name === "AbortError")) { setSuggestions([]); setSearchError(true); } }
      finally { if (!controller.signal.aborted) setSearchLoading(false); }
    }, 160);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, selectedRegion, workspacePlaces]);

  const snapshot = useMemo(() => selectedRegion ? buildDestinationSnapshot(selectedRegion, packages, proposals, bookings) : null, [selectedRegion, packages, proposals, bookings]);
  const examples = selectedRegion?.id === "bali-indonesia" ? baliExample : null;
  const featured = useMemo(() => featuredRegions.map((region) => { const data = buildDestinationSnapshot(region, packages, proposals, bookings); const example = region.id === "bali-indonesia" ? baliExample : null; const picturedService = data.services.find((item) => photo(item)); return { region, data, example, image: region.id === "bengaluru-karnataka" ? bengaluruImage : data.packages[0]?.record.image ?? (picturedService ? photo(picturedService) : undefined) }; }).sort((a, b) => (b.data.packages.length + b.data.vendorPackages.length + b.data.services.length + (b.example?.packages.length ?? 0) + (b.example?.services.length ?? 0)) - (a.data.packages.length + a.data.vendorPackages.length + a.data.services.length + (a.example?.packages.length ?? 0) + (a.example?.services.length ?? 0))), [packages, proposals, bookings]);
  const featuredImages = useMemo(() => new Map(featured.map(({ region, image }) => [region.id, image])), [featured]);
  const chooseRegion = (region: RegionSuggestion) => { const chosen = /^bali(?:,|$)/i.test(region.label) ? regionById("bali-indonesia") ?? region : region; setSelectedRegion(chosen); setQuery(chosen.label); setSuggestionsOpen(false); setOpenService(null); setOpenPlace(null); setOpenExample(null); const url = new URL(window.location.href); url.searchParams.set("module", "destination"); url.searchParams.set("region", chosen.id); window.history.pushState({ module: "destination", region: chosen.id }, "", `${url.pathname}${url.search}${url.hash}`); };
  const clearRegion = () => { setQuery(""); setSelectedRegion(null); setSuggestionsOpen(false); setOpenExample(null); setOpenPlace(null); setOpenService(null); const url = new URL(window.location.href); url.searchParams.delete("region"); window.history.pushState({ module: "destination" }, "", `${url.pathname}${url.search}${url.hash}`); inputRef.current?.focus(); };
  const editQuery = (value: string) => { setQuery(value); setSelectedRegion(null); setSuggestionsOpen(Boolean(value.trim())); if (new URLSearchParams(window.location.search).has("region")) { const url = new URL(window.location.href); url.searchParams.delete("region"); window.history.replaceState({ module: "destination" }, "", `${url.pathname}${url.search}${url.hash}`); } };
  const placeName = selectedRegion?.label.split(",")[0] ?? "";
  const destinationProfile = selectedRegion ? destinationProfileFor(selectedRegion.id) : undefined;
  const guide = useMemo(() => {
    if (!snapshot || !selectedRegion) return [];
    const fromSources = buildPlaceGuide(snapshot, selectedRegion);
    if (selectedRegion.id !== "bali-indonesia") return fromSources;
    const examples = baliExample.guides.map((item): GuidePlace => ({ key: item.name.toLowerCase(), name: item.name, detail: item.description, image: item.image, source: item.kind, count: 1, sources: item.connections, isExample: true }));
    const shown = new Set(examples.map((item) => item.key));
    return [...examples, ...fromSources.filter((item) => !shown.has(item.key))];
  }, [snapshot, selectedRegion]);
  const totalPackages = snapshot ? snapshot.packages.length + snapshot.vendorPackages.length + (examples?.packages.length ?? 0) : 0;
  const directoryActivities = snapshot?.services.filter((item) => isActivity(item.record.category)) ?? [];
  const itineraryActivities = snapshot?.itineraryServices.filter((item) => isActivity(item.category)) ?? [];
  const exampleActivities = examples?.services.filter((item) => isActivity(item.category)) ?? [];
  const totalActivities = directoryActivities.length + itineraryActivities.length + exampleActivities.length;
  const totalServices = snapshot ? snapshot.services.length + snapshot.itineraryServices.length + (examples?.services.length ?? 0) - totalActivities : 0;
  const totalVendors = snapshot ? snapshot.vendors.length + (examples?.vendors.length ?? 0) : 0;
  const totalTrips = snapshot ? snapshot.proposals.length + snapshot.bookings.length + (examples?.trips.length ?? 0) : 0;

  return <main className="destination-page">
    <header className="destination-page__header"><h1>Destination</h1>{selectedRegion && <button type="button" className="destination-change" onClick={clearRegion}><Icon name="pin" size="sm" /> Change destination</button>}</header>
    {!selectedRegion && <div className="destination-search" ref={searchRef}><div className="destination-search__field"><Icon name="pin" size="sm" /><input ref={inputRef} type="search" value={query} placeholder="Search a city or region, e.g. Bengaluru" aria-label="Search a city, destination, or region" role="combobox" aria-autocomplete="list" aria-expanded={suggestionsOpen && !selectedRegion} aria-controls="destination-suggestions" aria-activedescendant={suggestionsOpen && suggestions.length ? `destination-suggestion-${activeSuggestion}` : undefined} onFocus={() => { if (query.trim() && !selectedRegion) setSuggestionsOpen(true); }} onChange={(event) => editQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setSuggestionsOpen(false); if (!suggestionsOpen || !suggestions.length) return; if (event.key === "ArrowDown") { event.preventDefault(); setActiveSuggestion((index) => (index + 1) % suggestions.length); } else if (event.key === "ArrowUp") { event.preventDefault(); setActiveSuggestion((index) => (index - 1 + suggestions.length) % suggestions.length); } else if (event.key === "Enter") { event.preventDefault(); chooseRegion(suggestions[activeSuggestion]); } }} />{query && <button type="button" className="destination-search__clear" aria-label="Clear destination" onClick={clearRegion}>×</button>}</div>
      {suggestionsOpen && !selectedRegion && <div id="destination-suggestions" className="destination-search__suggestions" role="listbox" aria-label="Destination suggestions"><div className="destination-search__suggestions-heading">Suggested places</div>{searchLoading ? <div className="destination-search__message" role="status">Finding places…</div> : searchError ? <div className="destination-search__message" role="status">Couldn’t load places. Try again.</div> : suggestions.length ? suggestions.map((region, index) => <button id={`destination-suggestion-${index}`} key={region.id} type="button" role="option" aria-selected={index === activeSuggestion} className={index === activeSuggestion ? "is-active" : undefined} onMouseEnter={() => setActiveSuggestion(index)} onClick={() => chooseRegion(region)}><span className="destination-search__suggestion-photo">{featuredImages.get(region.id) ? <img src={featuredImages.get(region.id)} alt="" /> : <Icon name="pin" size="sm" />}</span><span><strong>{region.label}</strong><small>{region.group}{region.country ? ` · ${region.country}` : ""}</small></span></button>) : <div className="destination-search__message">No matching place found.</div>}</div>}
    </div>}

    {!selectedRegion ? <section className="destination-start"><div className="destination-start__heading"><h2>Explore a destination</h2><p>Choose a place to see what is already in your workspace.</p></div><div className="destination-start__grid">{featured.map(({ region, data, example, image }) => <button type="button" key={region.id} className="destination-start__place" onClick={() => chooseRegion(region)}><span className="destination-start__photo">{image ? <img src={image} alt="" /> : <Icon name="pin" size="lg" />}</span><span className="destination-start__body"><strong>{region.label.split(",")[0]}</strong><small>{region.group} · {region.country}{example ? " · Example data" : ""}</small><span>{plural(data.packages.length + data.vendorPackages.length + (example?.packages.length ?? 0), "package")} · {plural(data.services.length + data.itineraryServices.length + (example?.services.length ?? 0), "service")}</span></span><Icon name="chevronRight" size="sm" /></button>)}</div></section> : snapshot && <div className="destination-explore">
      <DestinationHero name={placeName} location={`${selectedRegion.group}, ${selectedRegion.country}`} profile={destinationProfile} fallbackImage={featuredImages.get(selectedRegion.id)} counts={{ packages: totalPackages, services: totalServices, activities: totalActivities, guides: guide.length, vendors: totalVendors }} hasExamples={Boolean(examples)} />
      <nav className="destination-jump" aria-label="Jump to destination sections"><button type="button" onClick={() => jumpTo("destination-packages")}>Packages <span>{totalPackages}</span></button><button type="button" onClick={() => jumpTo("destination-services")}>Services <span>{totalServices}</span></button><button type="button" onClick={() => jumpTo("destination-activities")}>Activities <span>{totalActivities}</span></button><button type="button" onClick={() => jumpTo("destination-guide")}>Guides <span>{guide.length}</span></button><button type="button" onClick={() => jumpTo("destination-vendors")}>Vendors <span>{totalVendors}</span></button><button type="button" onClick={() => jumpTo("destination-trips")}>Trips <span>{totalTrips}</span></button></nav>

      <section className="destination-block" id="destination-packages"><Rail id="destination-package-rail" title="Packages" count={totalPackages} empty={`No packages are connected to ${placeName} yet.`}>{snapshot.packages.map(({ record }) => <PackageCard key={record.id} name={record.name} image={record.image} destination={record.destination} note={record.duration ?? record.id} price={record.startingPrice != null ? `From ${money(record.startingPrice)}` : "Price not set"} status={record.status} source="Packages" onClick={() => onOpenRecord ? onOpenRecord("package", record.id) : openModule("packages")} />)}{snapshot.vendorPackages.map((record) => <PackageCard key={record.id} name={record.name} image={record.imageUrl.replace("w=96", "w=640").replace("h=96", "h=480")} destination={record.detail} note={record.services} price={record.sellPrice} status={record.status === "live" ? "Live" : record.status === "reprice" ? "Re-price" : "Draft"} source="Vendor CRM" onClick={() => openModule("vendors")} />)}{examples?.packages.map((record) => <PackageCard key={record.id} name={record.name} image={record.image} destination={record.location} note={record.duration} price={`From ${money(record.price)}`} status={record.status} source="Example" onClick={() => setOpenExample({ kind: "Package", record })} />)}</Rail></section>

      <section className="destination-block" id="destination-services"><Rail id="destination-service-rail" title="Services" count={totalServices} empty={`No services are connected to ${placeName} yet.`}>{snapshot.services.filter((item) => !isActivity(item.record.category)).map((item) => <ServiceCard key={item.record.id} item={item} onClick={() => setOpenService(item)} />)}{examples?.services.filter((item) => !isActivity(item.category)).map((item) => <ExampleServiceCard key={item.id} item={item} onClick={() => setOpenExample({ kind: item.category, record: item })} />)}{snapshot.itineraryServices.filter((item) => !isActivity(item.category)).map((item) => <ItineraryServiceCard key={item.key} item={item} onClick={() => { const source = item.sources[0]; if (onOpenRecord) onOpenRecord(source.kind, source.id); else openModule("packages"); }} />)}</Rail></section>

      <section className="destination-block" id="destination-activities"><Rail id="destination-activity-rail" title="Activities" count={totalActivities} empty={`No activities are connected to ${placeName} yet.`}>{directoryActivities.map((item) => <ActivityCard key={item.record.id} name={item.record.name} image={photo(item)} location={item.profile?.location ?? item.record.location} detail={item.profile?.details ?? item.profile?.about ?? "Activity in this destination"} supplier={item.vendors.map((vendor) => vendor.name).join(", ") || "Supplier not linked"} onClick={() => setOpenService(item)} />)}{exampleActivities.map((item) => <ActivityCard key={item.id} name={item.name} image={item.image} location={item.location} detail={item.serviceNote} supplier={item.vendor} onClick={() => setOpenExample({ kind: item.category, record: item })} />)}{itineraryActivities.map((item) => <ActivityCard key={item.key} name={item.title} image={item.image} location={item.place} detail={item.detail} supplier={item.vendor ?? item.sources[0].name} onClick={() => { const source = item.sources[0]; if (onOpenRecord) onOpenRecord(source.kind, source.id); else openModule("packages"); }} />)}</Rail></section>

      <section className="destination-block" id="destination-guide"><Rail id="destination-guide-rail" title="Guides" count={guide.length} empty={`No places or stops are connected to ${placeName} yet.`}>{guide.map((place) => <button type="button" key={place.key} className="destination-guide-card" onClick={() => setOpenPlace(place)}><span className="destination-guide-card__photo"><Icon name="pin" size="lg" />{place.image && <img src={place.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />}</span><span className="destination-guide-card__body"><small>{place.source}</small><strong>{place.name}</strong><span>{place.detail}</span></span></button>)}</Rail></section>

      <section className="destination-block" id="destination-vendors"><Rail id="destination-vendor-rail" title="Vendors" count={totalVendors} empty={`No Vendor CRM profiles are linked to ${placeName} yet. Services referenced in packages are shown above, but their suppliers still need to be linked.`}>{snapshot.vendors.map(({ record, services: linked, basedHere }) => <article className="destination-vendor-card" key={record.id}><div><span className="destination-vendor-card__avatar">{record.imageUrl ? <img src={record.imageUrl} alt="" loading="lazy" /> : record.initials}</span><span><strong>{record.name}</strong><small>{record.location}</small></span></div><p>{record.categories.join(" · ")}</p>{record.contactName && <span className="destination-vendor-card__contact">Contact: {record.contactName}</span>}<footer><span>{basedHere ? "Based here" : "Serves this area"} · {plural(linked.length, "linked service")}</span><Status value={record.status} /></footer></article>)}{examples?.vendors.map((item) => <ExampleVendorCard key={item.id} item={item} onClick={() => setOpenExample({ kind: "Vendor", record: item })} />)}</Rail></section>

      <section className="destination-block" id="destination-trips"><Rail id="destination-trip-rail" title="Trips" count={totalTrips} empty={bookingState === "loading" ? "Reading bookings…" : bookingState === "error" ? "Booking records could not be loaded." : `No proposals or bookings are set in ${placeName} yet.`}>{snapshot.proposals.map(({ record }) => <button className="destination-trip-card" type="button" key={record.id} onClick={() => onOpenRecord ? onOpenRecord("proposal", record.id) : openModule("packages")}><span>Proposal <Status value={record.status} /></span><strong>{record.name}</strong><small>{record.customer} · {record.destination}</small><b>{money(record.value)}</b></button>)}{snapshot.bookings.map((record) => <button className="destination-trip-card" type="button" key={record.id} onClick={() => openModule("bookings")}><span>Booking <Status value={record.status} /></span><strong>{record.name}</strong><small>{record.travel}</small><b>{record.id}</b></button>)}{examples?.trips.map((item) => <ExampleTripCard key={item.id} item={item} onClick={() => setOpenExample({ kind: item.kind, record: item })} />)}</Rail></section>
    </div>}
    {openService && <ServiceDetail item={openService} onClose={() => setOpenService(null)} />}
    {openPlace && <PlaceDetail place={openPlace} onClose={() => setOpenPlace(null)} onOpenService={setOpenService} />}
    {openExample && <ExampleDetail selection={openExample} onClose={() => setOpenExample(null)} />}
  </main>;
}
