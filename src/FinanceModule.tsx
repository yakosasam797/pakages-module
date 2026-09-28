import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { connectEmbeddedModuleFrame, connectFrameTabHistory } from "./embeddedModuleFrame";
import type { EmbeddedModuleHandle } from "./embeddedModuleFrame";

interface FinanceModuleProps {
  onNavigate: (module: "packages" | "bookings" | "vendors" | "destination") => void;
}

const crossModuleNav: Record<string, Parameters<FinanceModuleProps["onNavigate"]>[0]> = {
  Packages: "packages",
  Bookings: "bookings",
  Vendors: "vendors",
  Destination: "destination",
};

export const FinanceModule = forwardRef<EmbeddedModuleHandle, FinanceModuleProps>(function FinanceModule({ onNavigate }, ref) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const goBackLocalRef = useRef<() => boolean>(() => false);

  useEffect(() => () => cleanupRef.current?.(), []);
  useImperativeHandle(ref, () => ({
    openNotes: (mode) => frameRef.current?.contentDocument?.querySelector<HTMLElement>(mode === "compose" ? ".pt-notes__add" : ".pt-notes__main")?.click(),
    clickChrome: (label) => frameRef.current?.contentDocument?.querySelector<HTMLElement>(`.pt-topbar [aria-label^="${label}"]`)?.click(),
    goBackLocal: () => goBackLocalRef.current(),
  }), []);

  const connectNavigation = useCallback(() => {
    const document = frameRef.current?.contentDocument;
    if (!document) return;
    cleanupRef.current?.();
    const disconnectEmbedded = connectEmbeddedModuleFrame(document, "finance");
    const tabHistory = connectFrameTabHistory(document);
    goBackLocalRef.current = tabHistory.goBack;

    // Finance stays an unchanged app in its own frame. Only cross-module
    // sidebar selections are handled by the surrounding workspace.
    const navigate = (event: Event) => {
      const target = event.target as Element | null;
      const item = target?.closest<HTMLElement>(".pt-side .pt-nav-item[data-tip]");
      const module = item && crossModuleNav[item.dataset.tip ?? ""];
      if (!module) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      onNavigate(module);
    };

    document.addEventListener("click", navigate, { capture: true });
    cleanupRef.current = () => {
      disconnectEmbedded();
      tabHistory.disconnect();
      goBackLocalRef.current = () => false;
      document.removeEventListener("click", navigate, { capture: true });
    };
  }, [onNavigate]);

  return (
    <iframe
      ref={frameRef}
      className="finance-module__frame"
      src="/finance/index.html"
      title="Finance module"
      loading="eager"
      onLoad={connectNavigation}
    />
  );
});
