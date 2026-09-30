import { lazy, Suspense, forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { connectFrameTabHistory } from "./embeddedModuleFrame";
import type { EmbeddedModuleHandle } from "./embeddedModuleFrame";

const FinanceApp = lazy(() => import("../finance-module/src/FinanceApp"));

interface FinanceModuleProps {
  onNavigate: (module: "packages" | "bookings" | "vendors" | "destination") => void;
}

export const FinanceModule = forwardRef<EmbeddedModuleHandle, FinanceModuleProps>(function FinanceModule(_props, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const goBackRef = useRef<() => boolean>(() => false);

  useEffect(() => {
    const history = connectFrameTabHistory(document);
    goBackRef.current = history.goBack;
    return () => {
      history.disconnect();
      goBackRef.current = () => false;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    openNotes: (mode) => rootRef.current?.querySelector<HTMLElement>(mode === "compose" ? ".pt-notes__add" : ".pt-notes__main")?.click(),
    clickChrome: (label) => rootRef.current?.querySelector<HTMLElement>(`.pt-topbar [aria-label^="${label}"]`)?.click(),
    goBackLocal: () => goBackRef.current(),
  }), []);

  return <div ref={rootRef} className="finance-module__root"><Suspense fallback={<div className="finance-module__loading" role="status">Loading Finance...</div>}><FinanceApp /></Suspense></div>;
});
