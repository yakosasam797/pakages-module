import { useCallback, useEffect, useRef } from "react";
import { connectDestinationNav } from "./destinationNavigation";
import { connectFrameTabHistory } from "./embeddedModuleFrame";

interface VendorModuleProps {
  onNavigate: (module: "packages" | "bookings" | "destination" | "finance") => void;
  onNotes: (mode: "browse" | "compose") => void;
}

export function VendorModule({ onNavigate, onNotes }: VendorModuleProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanupRef.current?.(), []);

  const connectNavigation = useCallback(() => {
    const document = frameRef.current?.contentDocument;
    if (!document) return;
    cleanupRef.current?.();
    const disconnectDestination = connectDestinationNav(document, "vendor", () => onNavigate("destination"));
    const tabHistory = connectFrameTabHistory(document, true);

    // Integration-only layout fix; the pinned Vendor CRM source stays untouched.
    if (!document.querySelector('link[data-paryatech-integration="vendor-tabs"]')) {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = `${import.meta.env.BASE_URL}vendor-crm-integration.css`;
      stylesheet.dataset.paryatechIntegration = "vendor-tabs";
      document.head.appendChild(stylesheet);
    }

    // Vendor CRM remains an unmodified app in its own frame. Capture only the
    // two cross-module sidebar choices before its local React handlers run.
    const navigate = (event: Event) => {
      const target = event.target as Element | null;
      const notesButton = target?.closest<HTMLElement>(".pt-notes__main, .pt-notes__add");
      if (notesButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        onNotes(notesButton.classList.contains("pt-notes__add") ? "compose" : "browse");
        return;
      }
      const item = target?.closest<HTMLElement>(".pt-side .pt-nav-item");
      const destination = item?.dataset.tip;
      if (destination !== "Packages" && destination !== "Bookings" && destination !== "All finances") return;

      event.preventDefault();
      event.stopImmediatePropagation();
      onNavigate(destination === "Packages" ? "packages" : destination === "Bookings" ? "bookings" : "finance");
    };

    document.addEventListener("click", navigate, { capture: true, once: false });
    cleanupRef.current = () => {
      disconnectDestination();
      tabHistory.disconnect();
      document.removeEventListener("click", navigate, { capture: true });
    };
  }, [onNavigate, onNotes]);

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
