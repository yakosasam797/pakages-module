import { forwardRef, useImperativeHandle, useState } from "react";
import { Button, DetailPage, Icon, StatusChip, TabBar } from "@paryatech/ui";
import type { IconName, StatusTone, TabItem } from "@paryatech/ui";
import type { PackageRecord } from "./App";
import type { ProposalRecord, ProposalServiceKind, ProposalStatus } from "./proposalModel";
import { itineraryCosting, servicePriceState, serviceTotalCost } from "./proposalModel";
import { useStepNavigation } from "./useStepNavigation";
import type { StepNavigationHandle, StepNavigationSnapshot } from "./useStepNavigation";
import "./ProposalDetail.css";

const tabs: TabItem[] = [
  { id: "itinerary", label: "Itinerary" },
  { id: "requirements", label: "Customer brief" },
  { id: "commercials", label: "Commercials" },
  { id: "activity", label: "Activity" },
];

const serviceIcon: Record<ProposalServiceKind, IconName> = {
  flight: "plane",
  transfer: "bus",
  stay: "hotel",
  activity: "camera",
  meal: "sun",
  other: "package",
};

const statusTone: Record<ProposalStatus, StatusTone> = {
  Draft: "progress",
  "Itinerary shared": "open",
  Sent: "open",
  "Changes requested": "progress",
  Accepted: "done",
  Declined: "open",
};

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export const ProposalDetail = forwardRef<StepNavigationHandle, {
  record: ProposalRecord;
  sourcePackage?: PackageRecord;
  onOpenPackage?: () => void;
  onEdit: () => void;
  onStatusChange: (status: ProposalStatus, changeRequest?: string) => void;
  onSaveAsPackage: () => void;
  onOpenBookings: () => void;
  initialNavigation?: StepNavigationSnapshot | null;
}>(function ProposalDetail({
  record,
  sourcePackage,
  onOpenPackage,
  onEdit,
  onStatusChange,
  onSaveAsPackage,
  onOpenBookings,
  initialNavigation,
}, ref) {
  const { current: tab, navigate: setTab, goBack: goBackTab, snapshot } = useStepNavigation<string>("itinerary", initialNavigation);
  const [customerView, setCustomerView] = useState(false);
  useImperativeHandle(ref, () => ({
    goBack: () => {
      if (customerView) {
        setCustomerView(false);
        return true;
      }
      return goBackTab();
    },
    snapshot,
  }), [customerView, goBackTab, snapshot]);
  const [openDay, setOpenDay] = useState(record.days[0]?.id ?? "");
  const [feedback, setFeedback] = useState("");
  const [changeBoxOpen, setChangeBoxOpen] = useState(false);
  const cover = record.coverImage || sourcePackage?.image;
  const serviceCount = record.days.reduce((sum, day) => sum + day.services.length, 0);
  const costing = itineraryCosting(record.days);

  const statusUpdate = (next: ProposalStatus) => {
    onStatusChange(next, next === "Changes requested" ? feedback.trim() : undefined);
    setChangeBoxOpen(false);
  };

  return (
    <DetailPage
      className={`proposal-detail${customerView ? " proposal-detail--customer" : ""}`}
      title={<span className="proposal-detail__record-title">{cover ? <img src={cover} alt="" /> : <span><Icon name="fileText" size="md" /></span>}{record.name}</span>}
      status={<StatusChip tone={statusTone[record.status]}>{record.status}</StatusChip>}
      meta={<>
        <span className="package-detail__meta-item"><Icon name="user" size="sm" />{record.customer}</span>
        <span className="package-detail__meta-sep" aria-hidden="true">·</span>
        <span className="package-detail__meta-item"><Icon name="pin" size="sm" />{record.destination}</span>
        <span className="package-detail__meta-sep" aria-hidden="true">·</span>
        <span className="package-detail__meta-item"><Icon name="calendar" size="sm" />{record.travel}</span>
        <span className="package-detail__meta-item">{record.itineraryMode === "simple" ? "Simple" : "Advanced"} itinerary · v{record.version ?? 1}</span>
        <span className="package-detail__meta-sep" aria-hidden="true">·</span>
        <span className="package-id-chip"><span className="package-id-chip__value pt-mono">{record.id}</span></span>
      </>}
      actions={<div className="proposal-detail__header-actions">
        {customerView ? <Button variant="ghost" size="sm" onClick={() => setCustomerView(false)}>Back to team view</Button> : <>
          <Button variant="ghost" size="sm" leadingIcon={<Icon name="openExternal" size="sm" />} onClick={() => setCustomerView(true)}>Preview customer view</Button>
          <Button variant="primary" size="sm" leadingIcon={<Icon name="edit" size="sm" />} onClick={onEdit}>Edit proposal</Button>
        </>}
      </div>}
      tabs={customerView ? undefined : <TabBar items={tabs} value={tab} onValueChange={setTab} aria-label="Proposal sections" />}
    >
      {customerView ? (
        <div className="proposal-customer-view">
          <p className="proposal-customer-view__notice"><Icon name="info" size="sm" />Customer preview · Responses here are simulated in this local prototype.</p>
          <section className="proposal-customer-view__hero">
            {cover ? <img src={cover} alt={`${record.destination} trip`} /> : null}
            <div><span>Prepared for {record.customer}</span><h2>{record.name}</h2><p>{record.note}</p><div><span><Icon name="pin" size="sm" />{record.destination}</span><span><Icon name="calendar" size="sm" />{record.travel}</span><span><Icon name="user" size="sm" />{record.travellers}</span></div></div>
          </section>
          <div className="proposal-detail__workspace">
            <main className="proposal-detail__main">
              <div className="proposal-detail__section-heading"><h2>Your journey</h2><p>Accommodation, transport and experiences planned together for your trip.</p></div>
              {record.itineraryMode === "simple" ? <SimpleDayList record={record} openDay={openDay} onToggle={setOpenDay} /> : <DayList record={record} openDay={openDay} onToggle={setOpenDay} />}
            </main>
            <aside className="proposal-detail__rail" aria-label="Proposal response">
              <section><span className="proposal-detail__eyebrow">{record.sharingMode === "itinerary" || !record.value ? "Itinerary for review" : "Your proposal"}</span><strong className="proposal-detail__price">{record.sharingMode === "itinerary" || !record.value ? "Price not shown" : money.format(record.value)}</strong><small>Final availability and supplier terms are confirmed before booking.</small></section>
              <section><p className="proposal-detail__rail-title">Plan at a glance</p><p>{record.days.length} itinerary days</p><p>{serviceCount} planned services</p><p>{record.travellers}</p></section>
              {record.status === "Draft" ? <section className="proposal-detail__response"><p>This draft has not been shared with the customer.</p></section> : record.status === "Accepted" ? <section className="proposal-detail__response proposal-detail__response--accepted"><Icon name="checkCircle" size="md" /><strong>Version {record.acceptedVersion ?? record.version ?? 1} accepted</strong><p>The team can now continue to booking.</p></section> : record.status === "Declined" ? <section className="proposal-detail__response"><strong>Proposal declined</strong><p>This is distinct from a request for changes.</p></section> : <section className="proposal-detail__response"><p>{record.sharingMode === "itinerary" || record.status === "Itinerary shared" ? "Review this itinerary and tell us what you would change." : `Does proposal version ${record.version ?? 1} feel right?`}</p>{record.sharingMode !== "itinerary" && record.status !== "Itinerary shared" ? <Button variant="primary" size="sm" onClick={() => statusUpdate("Accepted")}>Accept proposal</Button> : null}<Button variant="ghost" size="sm" onClick={() => setChangeBoxOpen((open) => !open)}>Request a change</Button>{record.sharingMode !== "itinerary" && record.status !== "Itinerary shared" ? <Button variant="ghost" size="sm" onClick={() => statusUpdate("Declined")}>Decline offer</Button> : null}{changeBoxOpen ? <div className="proposal-detail__feedback"><label htmlFor="proposal-feedback">What would you change?</label><textarea id="proposal-feedback" value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={3} placeholder="Tell us what to adjust" /><Button variant="primary" size="sm" disabled={!feedback.trim()} onClick={() => statusUpdate("Changes requested")}>Send request</Button></div> : null}</section>}
            </aside>
          </div>
          <section className="proposal-customer-view__terms"><h2>Trip details</h2>{record.inclusions ? <p><strong>Included</strong>{record.inclusions}</p> : null}{record.exclusions ? <p><strong>Not included</strong>{record.exclusions}</p> : null}{record.importantNotes ? <p><strong>Important notes</strong>{record.importantNotes}</p> : null}{record.paymentTerms ? <p><strong>Payment terms</strong>{record.paymentTerms}</p> : null}{record.cancellationPolicy ? <p><strong>Cancellation</strong>{record.cancellationPolicy}</p> : null}{record.otherTerms ? <p><strong>Other terms</strong>{record.otherTerms}</p> : null}</section>
        </div>
      ) : null}

      {!customerView && tab === "itinerary" ? <>
        <section className="proposal-detail__intro">
          <div><span className="proposal-detail__eyebrow">Prepared for {record.customer}</span><h2>{record.note}</h2><p>{record.requirements}</p></div>
          <div><span>Trip plan</span><strong>{record.days.length} days</strong><span>{serviceCount} planned services</span></div>
        </section>
        <div className="proposal-detail__workspace">
          <main className="proposal-detail__main">
            <div className="proposal-detail__section-heading"><h2>Day-by-day plan</h2><p>A customer-specific itinerary using stays, transport and experiences together.</p></div>
            {record.itineraryMode === "simple" ? <SimpleDayList record={record} openDay={openDay} onToggle={setOpenDay} /> : <DayList record={record} openDay={openDay} onToggle={setOpenDay} showOperations />}
          </main>
          <aside className="proposal-detail__rail" aria-label="Proposal summary">
            <section><span className="proposal-detail__eyebrow">Customer quote</span><strong className="proposal-detail__price">{record.value ? money.format(record.value) : "Unpriced"}</strong><small>For {record.travellers} · {record.travel}</small></section>
            <section><p className="proposal-detail__rail-title">From the brief</p><p>{record.requirements}</p></section>
            {record.changeRequest ? <section><p className="proposal-detail__rail-title">Customer requested</p><p>{record.changeRequest}</p></section> : null}
            <section><p className="proposal-detail__rail-title">Starting point</p><p>{sourcePackage ? sourcePackage.name : "Custom itinerary"}</p>{onOpenPackage ? <Button variant="ghost" size="sm" onClick={onOpenPackage}>Open source package</Button> : null}</section>
            <section className="proposal-detail__rail-actions">{record.status === "Draft" ? <><Button variant="primary" size="sm" onClick={() => statusUpdate(record.value ? "Sent" : "Itinerary shared")}>{record.value ? "Mark priced proposal as sent" : "Mark itinerary shared for review"}</Button><small>Prototype status only — no message is delivered.</small></> : null}{record.status === "Accepted" ? <Button variant="primary" size="sm" onClick={onOpenBookings}>Open Bookings · v{record.acceptedVersion ?? record.version ?? 1}</Button> : null}{record.itineraryMode !== "simple" ? <Button variant="ghost" size="sm" onClick={onSaveAsPackage}>Save as package</Button> : null}</section>
          </aside>
        </div>
      </> : null}

      {!customerView && tab === "requirements" ? <div className="proposal-detail__content">
        <section className="proposal-detail__section"><div className="proposal-detail__section-head"><h2>Customer requirements</h2><p>The difference between this proposal and a reusable package.</p></div><p className="proposal-detail__paragraph">{record.requirements}</p>{record.changeRequest ? <p className="proposal-detail__paragraph"><strong>Change requested:</strong> {record.changeRequest}</p> : null}<dl className="proposal-detail__facts"><div><dt>Customer</dt><dd>{record.customer}</dd></div><div><dt>Email</dt><dd>{record.customerEmail || "Not provided"}</dd></div><div><dt>Travellers</dt><dd>{record.travellers}</dd></div><div><dt>Travel</dt><dd>{record.travel}</dd></div></dl></section>
        <section className="proposal-detail__section"><div className="proposal-detail__section-head"><h2>Package foundation</h2><p>A source package is copied into the proposal, then tailored for the customer.</p></div><div className="proposal-detail__source">{sourcePackage?.image ? <img src={sourcePackage.image} alt="" /> : <span className="proposal-detail__source-icon"><Icon name="package" size="md" /></span>}<div><strong>{sourcePackage?.name ?? "Custom itinerary"}</strong><span>{sourcePackage?.id ?? "Built from scratch"} · {record.destination}</span></div>{onOpenPackage ? <Button variant="ghost" size="sm" onClick={onOpenPackage}>Open package</Button> : null}</div></section>
      </div> : null}

      {!customerView && tab === "commercials" ? <div className="proposal-detail__content"><section className="proposal-detail__section"><div className="proposal-detail__section-head"><h2>Customer quote</h2><p>The complete proposed journey, not just a package starting price.</p></div><div className="proposal-detail__commercial"><span>Total proposal price</span><strong>{record.value ? money.format(record.value) : "Unpriced"}</strong><small>{record.travellers} · {record.travel}</small></div><p className="proposal-detail__paragraph">Supplier availability and final service terms are confirmed before a booking is created.</p></section><section className="proposal-detail__section"><div className="proposal-detail__section-head"><h2>Booking handoff</h2></div><p className="proposal-detail__paragraph">Only an accepted proposal is ready to continue into Bookings. Current status: <strong>{record.status}</strong>{record.acceptedVersion ? ` · Accepted version ${record.acceptedVersion}` : ""}.</p>{record.status === "Accepted" ? <Button variant="primary" size="sm" onClick={onOpenBookings}>Open Bookings</Button> : null}</section></div> : null}

      {!customerView && tab === "commercials" ? <div className="proposal-detail__content"><section className="proposal-detail__section"><div className="proposal-detail__section-head"><h2>Service costing</h2><p>Stays, transport and experiences are the same records used in the itinerary.</p></div><div className="proposal-detail__cost-summary"><span>Included supplier cost <strong>{money.format(costing.baseCost)}</strong></span><span>Optional extras <strong>{money.format(costing.optionalCost)}</strong></span><span>Unpriced <strong>{costing.unpriced}</strong></span></div><div className="proposal-detail__cost-rows">{record.days.flatMap((day, dayIndex) => day.services.map((service) => <div key={service.id}><span>Day {dayIndex + 1} · {service.kind === "stay" ? "Accommodation" : service.kind === "transfer" ? "Transport" : service.kind === "activity" ? "Activity" : service.kind}</span><div><strong>{service.title}</strong><small>{service.kind === "stay" ? `${service.rooms ?? 1} room × ${service.nights ?? 1} nights${service.supplements?.length ? ` · ${service.supplements.map((item) => `${item.label} × ${item.quantity}`).join(", ")}` : ""}` : service.kind === "transfer" ? `${service.routeFrom ?? "Pickup to confirm"} → ${service.routeTo ?? "drop-off to confirm"}${service.vehicleType ? ` · ${service.vehicleType}` : ""}` : service.kind === "activity" ? `${service.participants ?? 1} participants${service.guideCost ? " · guide" : ""}${service.admissionCost ? " · admission" : ""}` : service.detail}{service.optional ? " · Optional" : ""}</small></div><strong>{servicePriceState(service) === "unpriced" ? "Unpriced" : servicePriceState(service) === "included" ? "Included" : money.format(serviceTotalCost(service))}</strong></div>))}</div></section></div> : null}
      {!customerView && tab === "activity" ? <div className="proposal-detail__content"><section className="proposal-detail__section"><div className="proposal-detail__section-head"><h2>Recent activity</h2></div>{record.changeRequest ? <div className="proposal-detail__activity"><span>Customer</span><div><strong>Change requested</strong><span>{record.changeRequest}</span></div><span>{record.customer}</span></div> : null}<div className="proposal-detail__activity"><span>{record.updated}</span><div><strong>Proposal updated</strong><span>Current status: {record.status}</span></div><span>Vrushabh Jain</span></div></section></div> : null}
    </DetailPage>
  );
});

function SimpleDayList({ record, openDay, onToggle }: { record: ProposalRecord; openDay: string; onToggle: (id: string) => void }) {
  const stays = record.days.flatMap((day) => day.services.filter((service) => service.kind === "stay"));
  const transport = record.days.flatMap((day) => day.services.filter((service) => service.kind === "transfer" || service.kind === "flight"));
  return <><div className="proposal-detail__days">{record.days.map((day, index) => <section className="proposal-detail__day" key={day.id}><button type="button" className="proposal-detail__day-toggle" aria-expanded={openDay === day.id} onClick={() => onToggle(openDay === day.id ? "" : day.id)}><span>Day {index + 1}</span><span><strong>{day.title}</strong><small>{day.place}</small></span><Icon name="chevronDown" size="sm" /></button>{openDay === day.id ? <div className="proposal-detail__simple-day">{day.description ? <p>{day.description}</p> : <p>Day details to be confirmed.</p>}{day.highlights?.length ? <ul>{day.highlights.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul> : null}</div> : null}</section>)}</div><div className="proposal-detail__simple-summary"><section><h3>Accommodation</h3>{stays.length ? stays.map((item) => <p key={item.id}>{item.title}{item.mealPlan ? ` · ${item.mealPlan}` : ""}</p>) : <p>To be confirmed</p>}</section><section><h3>Transport</h3>{transport.length ? transport.map((item) => <p key={item.id}>{item.title}</p>) : <p>To be confirmed</p>}</section></div></>;
}

function DayList({ record, openDay, onToggle, showOperations = false }: { record: ProposalRecord; openDay: string; onToggle: (id: string) => void; showOperations?: boolean }) {
  return <div className="proposal-detail__days">{record.days.map((day, index) => <section className="proposal-detail__day" key={day.id}><button type="button" className="proposal-detail__day-toggle" aria-expanded={openDay === day.id} onClick={() => onToggle(openDay === day.id ? "" : day.id)}><span>Day {index + 1}</span><span><strong>{day.title}</strong><small>{day.place} · {day.services.length} services</small></span><Icon name="chevronDown" size="sm" /></button>{openDay === day.id ? <div className="proposal-detail__advanced-day">{day.image ? <img src={day.image} alt="" /> : null}{day.description ? <p>{day.description}</p> : null}{day.highlights?.length ? <ul className="proposal-detail__highlights">{day.highlights.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul> : null}<ul className="proposal-detail__services">{day.services.map((service) => <li key={service.id}><span className="proposal-detail__service-icon"><Icon name={serviceIcon[service.kind]} size="sm" /></span><span><strong>{service.title}</strong><small>{service.detail}</small>{showOperations && service.vendor ? <small className="proposal-detail__service-vendor">{service.vendor}{service.cost != null ? ` · ${money.format(service.cost)} supplier cost` : ""}</small> : null}</span></li>)}</ul></div> : null}</section>)}</div>;
}
