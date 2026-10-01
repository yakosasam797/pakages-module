import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { connectDestinationNav } from "./destinationNavigation";
import { connectEmbeddedModuleFrame, connectFrameTabHistory } from "./embeddedModuleFrame";
import type { EmbeddedModuleHandle } from "./embeddedModuleFrame";
import { readActivityBookingHandoffs } from "./bookingActivityHandoff";
import { currentTransportBookingHandoffs, readTransportBookingHandoffs } from "./bookingTransportHandoff";
import { TransportBookingHandoffPanel } from "./TransportBookingHandoffPanel";

interface BookingModuleProps {
  onNavigate: (module: "packages" | "vendors" | "destination" | "finance") => void;
}

const money = (amount: number, currency = "INR") => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

export const BookingModule = forwardRef<EmbeddedModuleHandle, BookingModuleProps>(function BookingModule({ onNavigate }, ref) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [activityHandoffs] = useState(readActivityBookingHandoffs);
  const [transportHandoffs, setTransportHandoffs] = useState(readTransportBookingHandoffs);
  const currentHandoffs = currentTransportBookingHandoffs(transportHandoffs);
  const cleanupRef = useRef<(() => void) | null>(null);
  const goBackLocalRef = useRef<() => boolean>(() => false);

  useEffect(() => () => cleanupRef.current?.(), []);
  useImperativeHandle(ref, () => ({
    openNotes: (mode) => frameRef.current?.contentDocument?.querySelector<HTMLElement>(mode === "compose" ? ".notes-add" : ".notes-main")?.click(),
    clickChrome: (label) => frameRef.current?.contentDocument?.querySelector<HTMLElement>(`.topbar [aria-label^="${label}"]`)?.click(),
    goBackLocal: () => goBackLocalRef.current(),
  }), []);

  const connectNavigation = useCallback(() => {
    const document = frameRef.current?.contentDocument;
    if (!document) return;
    cleanupRef.current?.();
    const disconnectEmbedded = connectEmbeddedModuleFrame(document, "booking");
    const tabHistory = connectFrameTabHistory(document);
    goBackLocalRef.current = tabHistory.goBack;
    const disconnectDestination = connectDestinationNav(document, "booking", () => onNavigate("destination"));

    // Keep the upstream Booking page untouched; only intercept links to other modules.
    const navigate = (event: Event) => {
      const target = event.target as Element | null;
      const item = target?.closest<HTMLElement>(".side .nav-item[data-tip]");
      const destination = item?.dataset.tip;
      if (destination !== "Packages" && destination !== "Vendors" && destination !== "All finances") return;

      event.preventDefault();
      event.stopImmediatePropagation();
      onNavigate(destination === "Packages" ? "packages" : destination === "Vendors" ? "vendors" : "finance");
    };

    document.addEventListener("click", navigate, { capture: true });
    cleanupRef.current = () => {
      disconnectEmbedded();
      tabHistory.disconnect();
      goBackLocalRef.current = () => false;
      disconnectDestination();
      document.removeEventListener("click", navigate, { capture: true });
    };
  }, [onNavigate]);

  return (
    <div className="booking-module__root">
      {currentHandoffs.length ? <details className="booking-module__handoffs"><summary>Accepted transport supplier obligations <span>{currentHandoffs.length} proposal{currentHandoffs.length === 1 ? "" : "s"}</span></summary><div className="booking-module__handoff-list">{currentHandoffs.map((handoff) => <TransportBookingHandoffPanel key={`${handoff.proposalId}-${handoff.acceptedVersion}`} handoff={handoff} onRecorded={() => setTransportHandoffs(readTransportBookingHandoffs())} />)}</div></details> : null}
      {activityHandoffs.length ? <details className="booking-module__handoffs">
        <summary>Accepted activity supplier prices <span>{activityHandoffs.length} proposal{activityHandoffs.length === 1 ? "" : "s"}</span></summary>
        <div className="booking-module__handoff-list">
          {activityHandoffs.map((handoff) => <section key={`${handoff.proposalId}-${handoff.acceptedVersion}`}>
            <strong>{handoff.proposalName}</strong><small>{handoff.proposalId} · Approved version {handoff.acceptedVersion}</small>
            {handoff.services.map((service, index) => <p key={`${service.snapshot.serviceId}-${index}`}><span>{service.title} · {service.snapshot.vendorName} · Rate card v{service.snapshot.version}<small className={service.snapshot.result.availability === "available" ? "is-confirmed" : "is-pending"}>{service.snapshot.result.availability === "available" ? "Supplier session confirmed" : "Supplier availability pending — price snapshot only"}</small></span><b>{service.snapshot.result.supplierTotal == null ? "Unresolved" : new Intl.NumberFormat("en-IN", { style: "currency", currency: service.snapshot.currency, maximumFractionDigits: 0 }).format(service.snapshot.result.supplierTotal)}</b></p>)}
          </section>)}
        </div>
      </details> : null}
      <iframe
      ref={frameRef}
      className="booking-module__frame"
      src="/booking/index.html"
      title="Bookings module"
      loading="eager"
      onLoad={connectNavigation}
      />
    </div>
  );
});
