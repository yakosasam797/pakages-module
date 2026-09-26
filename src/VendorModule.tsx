import { useCallback, useRef } from "react";

interface VendorModuleProps {
  onNavigate: (module: "packages" | "bookings") => void;
}

export function VendorModule({ onNavigate }: VendorModuleProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const connectNavigation = useCallback(() => {
    const document = frameRef.current?.contentDocument;
    if (!document) return;

    // Vendor CRM remains an unmodified app in its own frame. Capture only the
    // two cross-module sidebar choices before its local React handlers run.
    const navigate = (event: Event) => {
      const target = event.target as Element | null;
      const item = target?.closest<HTMLElement>(".pt-side .pt-nav-item");
      const destination = item?.dataset.tip;
      if (destination !== "Packages" && destination !== "Bookings") return;

      event.preventDefault();
      event.stopImmediatePropagation();
      onNavigate(destination === "Packages" ? "packages" : "bookings");
    };

    document.addEventListener("click", navigate, { capture: true, once: false });
  }, [onNavigate]);

  return (
    <iframe
      ref={frameRef}
      className="vendor-module"
      src="/vendor-crm/index.html"
      title="Vendors CRM module"
      loading="eager"
      onLoad={connectNavigation}
    />
  );
}
