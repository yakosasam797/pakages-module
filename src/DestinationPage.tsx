import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "@paryatech/ui";
import type { IconName } from "@paryatech/ui";
import { buildDestinationSnapshot, loadDestinationBookings, workspaceRegionSuggestions } from "./destinationSources";
import type { DestinationBooking, DestinationPackage, DestinationProposal, DestinationSnapshot } from "./destinationSources";
import { featuredRegions, searchRegions } from "./regionSearch";
import type { RegionSuggestion } from "./regionSearch";
import "./DestinationPage.css";

interface DestinationPageProps {
  packages: DestinationPackage[];
  proposals: DestinationProposal[];
  onOpenRecord?: (kind: "package" | "proposal", id: string) => void;
}
type SourceModule = "packages" | "bookings" | "vendors";
type DestinationService = DestinationSnapshot["services"][number];
type GuidePlace = { key: string; name: string; detail: string; image?: string; source: string; service?: DestinationService; count: number; sources: string[] };

const serviceTypes = [
  { name: "Accommodation", label: "Stays", icon: "hotel" },
  { name: "Activities", label: "Activities", icon: "camera" },
  { name: "Transport", label: "Transport", icon: "package" },
  { name: "Flights", label: "Flights", icon: "package" },
  { name: "Visa", label: "Visa", icon: "fileText" },
  { name: "DMC/Ground handling", label: "Ground handling", icon: "vendors" },
] as const satisfies ReadonlyArray<{ name: string; label: string; icon: IconName }>;

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
function photo(service: DestinationService) { return service.profile?.media.find((item) => item.usedInBanner && item.kind !== "video")?.imageUrl ?? service.profile?.imageUrl ?? service.vendors.find((item) => item.imageUrl)?.imageUrl; }
function statusTone(value: string) { return /published|approved|active|confirmed|completed|accepted|live/i.test(value) ? "positive" : /draft|pending|tentative|reprice/i.test(value) ? "pending" : "neutral"; }

function Status({ value }: { value: string }) { return <span className={`destination-status destination-status--${statusTone(value)}`}>{value}</span>; }

function Rail({ id, title, subtitle, count, children, empty }: { id: string; title: string; subtitle?: string; count: number; children?: ReactNode; empty?: string }) {
  const track = useRef<HTMLDivElement>(null);
  return <section className="destination-rail" id={id} aria-labelledby={`${id}-title`}>
    <div className="destination-rail__header"><div><h3 id={`${id}-title`}>{title}<span className="destination-count">{count}</span></h3>{subtitle && <p>{subtitle}</p>}</div>
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
    <span className="destination-service-card__body"><span className="destination-service-card__type">{record.category}<Status value={record.status} /></span><strong>{record.name}</strong><span className="destination-service-card__location"><Icon name="pin" size="sm" />{profile?.location ?? record.location}</span><span className="destination-service-card__detail">{profile?.details ?? profile?.about ?? "Service available in this destination"}</span><span className="destination-service-card__suppliers">{vendors.length ? `${plural(vendors.length, "supplier")}: ${vendors.map((vendor) => vendor.name).join(", ")}` : "Supplier not linked"}</span></span>
  </button>;
}

function ServiceDetail({ item, onClose }: { item: DestinationService; onClose: () => void }) {
  const { record, vendors, profile } = item;
  useEffect(() => { const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", escape); return () => window.removeEventListener("keydown", escape); }, [onClose]);
  return <div className="destination-detail-backdrop" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <aside className="destination-detail" role="dialog" aria-modal="true" aria-labelledby="destination-detail-title">
      <div className="destination-detail__top"><span>{record.category} in {record.location}</span><button type="button" onClick={onClose} aria-label="Close service details">×</button></div>
      {photo(item) && <img className="destination-detail__image" src={photo(item)} alt={profile?.imageAlt ?? ""} />}
      <div className="destination-detail__content"><div className="destination-detail__title"><h2 id="destination-detail-title">{record.name}</h2><Status value={record.status} /></div><p>{profile?.about ?? profile?.details ?? "This service is listed in Vendor CRM."}</p>
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
  return <div className="destination-detail-backdrop" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="destination-detail" role="dialog" aria-modal="true" aria-labelledby="destination-place-detail-title"><div className="destination-detail__top"><span>Place guide</span><button type="button" onClick={onClose} aria-label="Close place guide">×</button></div>{place.image && <img className="destination-detail__image" src={place.image} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />}<div className="destination-detail__content"><div className="destination-detail__title"><h2 id="destination-place-detail-title">{place.name}</h2></div><p>{place.detail}</p><section><h3>Connected trips & experiences</h3><div className="destination-detail__suppliers">{place.sources.map((source) => <div key={source}><strong>{source}</strong></div>)}</div></section>{place.service && <button type="button" className="destination-detail__source" onClick={() => { onClose(); onOpenService(place.service!); }}>View experience details <Icon name="chevronRight" size="sm" /></button>}</div></aside></div>;
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
  const [query, setQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<RegionSuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<RegionSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [bookings, setBookings] = useState<DestinationBooking[]>([]);
  const [bookingState, setBookingState] = useState<"loading" | "ready" | "error">("loading");
  const [openService, setOpenService] = useState<DestinationService | null>(null);
  const [openPlace, setOpenPlace] = useState<GuidePlace | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const workspacePlaces = useMemo(() => workspaceRegionSuggestions(packages, proposals, bookings), [packages, proposals, bookings]);

  useEffect(() => { const controller = new AbortController(); loadDestinationBookings(controller.signal).then((records) => { if (!controller.signal.aborted) { setBookings(records); setBookingState("ready"); } }).catch(() => { if (!controller.signal.aborted) setBookingState("error"); }); return () => controller.abort(); }, []);
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
  const featured = useMemo(() => featuredRegions.map((region) => { const data = buildDestinationSnapshot(region, packages, proposals, bookings); const picturedService = data.services.find((item) => photo(item)); return { region, data, image: data.packages[0]?.record.image ?? (picturedService ? photo(picturedService) : undefined) }; }).sort((a, b) => (b.data.packages.length + b.data.vendorPackages.length + b.data.services.length) - (a.data.packages.length + a.data.vendorPackages.length + a.data.services.length)), [packages, proposals, bookings]);
  const chooseRegion = (region: RegionSuggestion) => { setSelectedRegion(region); setQuery(region.label); setSuggestionsOpen(false); setOpenService(null); setOpenPlace(null); };
  const placeName = selectedRegion?.label.split(",")[0] ?? "";
  const guide = useMemo(() => snapshot && selectedRegion ? buildPlaceGuide(snapshot, selectedRegion) : [], [snapshot, selectedRegion]);
  const totalPackages = snapshot ? snapshot.packages.length + snapshot.vendorPackages.length : 0;
  const categories = snapshot ? serviceTypes.map((type) => ({ ...type, items: snapshot.services.filter((item) => item.record.category === type.name) })) : [];

  return <main className="destination-page">
    <header className="destination-page__header"><div><h1>Destination</h1><p>Explore packages, services, places, and people by region.</p></div></header>
    <div className="destination-search" ref={searchRef}><div className="destination-search__field"><Icon name="pin" size="sm" /><input ref={inputRef} type="search" value={query} placeholder="Search a city or region, e.g. Bengaluru" aria-label="Search a city, destination, or region" role="combobox" aria-autocomplete="list" aria-expanded={suggestionsOpen && !selectedRegion} aria-controls="destination-suggestions" aria-activedescendant={suggestionsOpen && suggestions.length ? `destination-suggestion-${activeSuggestion}` : undefined} onFocus={() => { if (query.trim() && !selectedRegion) setSuggestionsOpen(true); }} onChange={(event) => { setQuery(event.target.value); setSelectedRegion(null); setSuggestionsOpen(Boolean(event.target.value.trim())); }} onKeyDown={(event) => { if (event.key === "Escape") setSuggestionsOpen(false); if (!suggestionsOpen || !suggestions.length) return; if (event.key === "ArrowDown") { event.preventDefault(); setActiveSuggestion((index) => (index + 1) % suggestions.length); } else if (event.key === "ArrowUp") { event.preventDefault(); setActiveSuggestion((index) => (index - 1 + suggestions.length) % suggestions.length); } else if (event.key === "Enter") { event.preventDefault(); chooseRegion(suggestions[activeSuggestion]); } }} />{query && <button type="button" className="destination-search__clear" aria-label="Clear destination" onClick={() => { setQuery(""); setSelectedRegion(null); setSuggestionsOpen(false); inputRef.current?.focus(); }}>×</button>}</div>
      {suggestionsOpen && !selectedRegion && <div id="destination-suggestions" className="destination-search__suggestions" role="listbox" aria-label="Destination suggestions"><div className="destination-search__suggestions-heading">Suggested places</div>{searchLoading ? <div className="destination-search__message" role="status">Finding places…</div> : searchError ? <div className="destination-search__message" role="status">Couldn’t load places. Try again.</div> : suggestions.length ? suggestions.map((region, index) => <button id={`destination-suggestion-${index}`} key={region.id} type="button" role="option" aria-selected={index === activeSuggestion} className={index === activeSuggestion ? "is-active" : undefined} onMouseEnter={() => setActiveSuggestion(index)} onClick={() => chooseRegion(region)}><Icon name="pin" size="sm" /><span><strong>{region.label}</strong><small>{region.group}{region.country ? ` · ${region.country}` : ""}</small></span></button>) : <div className="destination-search__message">No matching place found.</div>}</div>}
    </div>

    {!selectedRegion ? <section className="destination-start"><div className="destination-start__heading"><h2>Explore a destination</h2><p>Choose a place to see what is already in your workspace.</p></div><div className="destination-start__grid">{featured.map(({ region, data, image }) => <button type="button" key={region.id} className="destination-start__place" onClick={() => chooseRegion(region)}><span className="destination-start__photo">{image && region.id !== "bengaluru-karnataka" ? <img src={image} alt="" /> : <Icon name="pin" size="lg" />}</span><span className="destination-start__body"><strong>{region.label.split(",")[0]}</strong><small>{region.group} · {region.country}</small><span>{plural(data.packages.length + data.vendorPackages.length, "package")} · {plural(data.services.length, "service")}</span></span><Icon name="chevronRight" size="sm" /></button>)}</div></section> : snapshot && <div className="destination-explore">
      <section className="destination-place"><div><span className="destination-place__location"><Icon name="pin" size="sm" />{selectedRegion.group} · {selectedRegion.country}</span><h2>{placeName}</h2><p>Packages, local services, places to explore, and vendors in one view.</p></div><div className="destination-place__numbers"><span><strong>{totalPackages}</strong> packages</span><span><strong>{snapshot.services.length}</strong> services</span><span><strong>{guide.length}</strong> places</span><span><strong>{snapshot.vendors.length}</strong> vendors</span></div></section>
      <nav className="destination-jump" aria-label="Jump to destination sections"><button type="button" onClick={() => jumpTo("destination-packages")}>Packages <span>{totalPackages}</span></button><button type="button" onClick={() => jumpTo("destination-services")}>Services <span>{snapshot.services.length}</span></button><button type="button" onClick={() => jumpTo("destination-guide")}>Place guide <span>{guide.length}</span></button><button type="button" onClick={() => jumpTo("destination-vendors")}>Vendors <span>{snapshot.vendors.length}</span></button><button type="button" onClick={() => jumpTo("destination-trips")}>Trips <span>{snapshot.proposals.length + snapshot.bookings.length}</span></button></nav>

      <section className="destination-block" id="destination-packages"><div className="destination-block__heading"><div><h2>Packages</h2><p>Trips and itineraries connected to {placeName}.</p></div><span className="destination-block__total">{plural(totalPackages, "package")}</span></div><Rail id="destination-package-rail" title="Ready to explore" subtitle="Packages from your catalog and Vendor CRM" count={totalPackages} empty={`No packages are connected to ${placeName} yet.`}>{snapshot.packages.map(({ record }) => <PackageCard key={record.id} name={record.name} image={record.image} destination={record.destination} note={record.duration ?? record.id} price={record.startingPrice != null ? `From ${money(record.startingPrice)}` : "Price not set"} status={record.status} source="Packages" onClick={() => onOpenRecord ? onOpenRecord("package", record.id) : openModule("packages")} />)}{snapshot.vendorPackages.map((record) => <PackageCard key={record.id} name={record.name} image={record.imageUrl.replace("w=96", "w=640").replace("h=96", "h=480")} destination={record.detail} note={record.services} price={record.sellPrice} status={record.status === "live" ? "Live" : record.status === "reprice" ? "Re-price" : "Draft"} source="Vendor CRM" onClick={() => openModule("vendors")} />)}</Rail></section>

      <section className="destination-block" id="destination-services"><div className="destination-block__heading"><div><h2>Services</h2><p>See what can actually be arranged in {placeName}, by service type.</p></div><span className="destination-block__total">{plural(snapshot.services.length, "service")}</span></div><div className="destination-types" aria-label="Service types">{categories.map((type) => <button key={type.name} type="button" className={type.items.length ? "is-available" : ""} disabled={!type.items.length} onClick={() => jumpTo(`destination-type-${type.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`)}><Icon name={type.icon} size="sm" /><span>{type.label}</span><strong>{type.items.length}</strong></button>)}</div>{snapshot.services.length === 0 && <div className="destination-rail__empty">No Vendor CRM services are listed for {placeName} yet. Packages for this region are shown above.</div>}{categories.filter((type) => type.items.length > 0).map((type) => <Rail key={type.name} id={`destination-type-${type.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} title={type.label} subtitle={`${plural(type.items.length, "option")} available in this destination`} count={type.items.length}>{type.items.map((item) => <ServiceCard key={item.record.id} item={item} onClick={() => setOpenService(item)} />)}</Rail>)}</section>

      <section className="destination-block" id="destination-guide"><div className="destination-block__heading"><div><h2>Place guide</h2><p>Places to take travelers, drawn from activities and trip itineraries.</p></div><span className="destination-block__total">{plural(guide.length, "place")}</span></div><Rail id="destination-guide-rail" title={`Explore ${placeName}`} subtitle="Experiences, neighborhoods, and scenic stops connected to real trips" count={guide.length} empty={`No places or stops have been described for ${placeName} in the connected records yet.`}>{guide.map((place) => <button type="button" key={place.key} className="destination-guide-card" onClick={() => setOpenPlace(place)}><span className="destination-guide-card__photo"><Icon name="pin" size="lg" />{place.image && <img src={place.image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />}</span><span className="destination-guide-card__body"><small>{place.source}</small><strong>{place.name}</strong><span>{place.detail}</span></span></button>)}</Rail></section>

      <section className="destination-block" id="destination-vendors"><div className="destination-block__heading"><div><h2>Vendors & people</h2><p>The suppliers and contacts connected to this destination.</p></div><span className="destination-block__total">{plural(snapshot.vendors.length, "vendor")}</span></div><Rail id="destination-vendor-rail" title="On the ground" count={snapshot.vendors.length} empty={`No vendors are based in or supplying ${placeName} yet.`}>{snapshot.vendors.map(({ record, services: linked, basedHere }) => <article className="destination-vendor-card" key={record.id}><div><span className="destination-vendor-card__avatar">{record.imageUrl ? <img src={record.imageUrl} alt="" loading="lazy" /> : record.initials}</span><span><strong>{record.name}</strong><small>{record.location}</small></span></div><p>{record.categories.join(" · ")}</p><span className="destination-vendor-card__contact">{record.contactName ? `Contact: ${record.contactName}` : "Contact not listed"}</span><footer><span>{basedHere ? "Based here" : "Serves this area"} · {plural(linked.length, "linked service")}</span><Status value={record.status} /></footer></article>)}</Rail></section>

      <section className="destination-block" id="destination-trips"><div className="destination-block__heading"><div><h2>Trips in motion</h2><p>What your team has proposed or booked for {placeName}.</p></div><span className="destination-block__total">{plural(snapshot.proposals.length + snapshot.bookings.length, "record")}</span></div><Rail id="destination-trip-rail" title="Proposals & bookings" count={snapshot.proposals.length + snapshot.bookings.length} empty={bookingState === "loading" ? "Reading bookings…" : bookingState === "error" ? "Booking records could not be loaded." : `No proposals or bookings are set in ${placeName} yet.`}>{snapshot.proposals.map(({ record }) => <button className="destination-trip-card" type="button" key={record.id} onClick={() => onOpenRecord ? onOpenRecord("proposal", record.id) : openModule("packages")}><span>Proposal <Status value={record.status} /></span><strong>{record.name}</strong><small>{record.customer} · {record.destination}</small><b>{money(record.value)}</b></button>)}{snapshot.bookings.map((record) => <button className="destination-trip-card" type="button" key={record.id} onClick={() => openModule("bookings")}><span>Booking <Status value={record.status} /></span><strong>{record.name}</strong><small>{record.travel}</small><b>{record.id}</b></button>)}</Rail></section>
    </div>}
    {openService && <ServiceDetail item={openService} onClose={() => setOpenService(null)} />}
    {openPlace && <PlaceDetail place={openPlace} onClose={() => setOpenPlace(null)} onOpenService={setOpenService} />}
  </main>;
}
