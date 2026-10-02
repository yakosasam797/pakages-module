import { lazy, Suspense, forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { connectFrameTabHistory } from "./embeddedModuleFrame";
import type { EmbeddedModuleHandle } from "./embeddedModuleFrame";
import { transportSupplierObligations } from "./bookingTransportHandoff";
import { SupplierTaxProfilesPanel } from "./SupplierTaxProfilesPanel";

const FinanceApp = lazy(() => import("./modules/finance/FinanceApp"));

interface FinanceModuleProps {
  onNavigate: (module: "packages" | "bookings" | "vendors" | "destination") => void;
}

export const FinanceModule = forwardRef<EmbeddedModuleHandle, FinanceModuleProps>(function FinanceModule(_props, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const obligations = transportSupplierObligations();
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

  return <div ref={rootRef} className="finance-module__root"><SupplierTaxProfilesPanel />{obligations.length ? <details className="finance-module__transport-obligations"><summary>Confirmed transport supplier obligations <span>{obligations.length} hire{obligations.length === 1 ? "" : "s"}</span></summary><div>{obligations.map((item) => <p key={item.id}><span>{item.proposalName} · {item.vendorName} · {item.title}</span><strong>{item.payable == null ? "Pending actual charges" : new Intl.NumberFormat("en-IN", { style: "currency", currency: item.currency, maximumFractionDigits: 0 }).format(item.payable)}</strong>{item.adjustments ? <small>Includes {new Intl.NumberFormat("en-IN", { style: "currency", currency: item.currency, maximumFractionDigits: 0 }).format(item.adjustments)} in recorded supplier adjustments</small> : null}</p>)}</div></details> : null}<Suspense fallback={<div className="finance-module__loading" role="status">Loading Finance...</div>}><FinanceApp /></Suspense></div>;
});
