import { lazy, Suspense } from "react";
import "../vendor-crm/src/index.css";

const VendorApp = lazy(() => import("../vendor-crm/src/App"));

interface VendorModuleProps {
  onNavigate: (module: "packages" | "bookings" | "destination" | "finance") => void;
  onNotes: (mode: "browse" | "compose") => void;
}

export function VendorModule({ onNavigate, onNotes }: VendorModuleProps) {
  return <Suspense fallback={<div className="module-loading" role="status">Loading Vendor CRM...</div>}>
    <VendorApp onNavigateModule={onNavigate} onWorkspaceNotes={onNotes} />
  </Suspense>;
}
