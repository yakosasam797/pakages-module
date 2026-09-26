import { useCallback, useRef } from "react";

interface BookingModuleProps {
  onNavigate: (module: "packages" | "vendors") => void;
}

export function BookingModule({ onNavigate }: BookingModuleProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const connectNavigation = useCallback(() => {
    const document = frameRef.current?.contentDocument;
    if (!document) return;

    // Keep the upstream Booking page untouched; only intercept links to other modules.
    const navigate = (event: Event) => {
      const target = event.target as Element | null;
      const item = target?.closest<HTMLElement>(".side .nav-item[data-tip]");
      const destination = item?.dataset.tip;
      if (destination !== "Packages" && destination !== "Vendors") return;

      event.preventDefault();
      event.stopImmediatePropagation();
      onNavigate(destination === "Packages" ? "packages" : "vendors");
    };

    document.addEventListener("click", navigate, { capture: true });
  }, [onNavigate]);

  return (
    <iframe
      ref={frameRef}
      className="booking-module__frame"
      src="/booking/index.html"
      title="Bookings module"
      loading="eager"
      onLoad={connectNavigation}
    />
  );
}
