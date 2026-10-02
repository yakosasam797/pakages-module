import { useState } from "react";
import { readSupplierTaxProfiles, saveSupplierTaxProfiles } from "./modules/vendors/rateCard/supplierTax";

/** Shared Finance-owned supplier tax settings consumed by Vendor CRM and Proposal. */
export function SupplierTaxProfilesPanel() {
  const [profiles, setProfiles] = useState(readSupplierTaxProfiles);
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [approvalSource, setApprovalSource] = useState("");
  const [credit, setCredit] = useState("");
  const validRate = rate !== "" && Number(rate) >= 0 && Number(rate) <= 100;

  return <details className="finance-module__transport-obligations">
    <summary>Supplier tax profiles <span>{profiles.length} recorded</span></summary>
    <div>
      {profiles.map((profile) => <p key={profile.id}><span>{profile.name} · {(profile.rate * 100).toFixed(2)}% · {profile.recoverable == null ? "Credit treatment unresolved" : profile.recoverable ? "Input tax recoverable" : "Input tax not recoverable"}</span><small>{profile.approvalSource}</small></p>)}
      <div className="booking-module__transport-actual">
        <label>Profile name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Approved supplier tax profile" /></label>
        <label>Approved rate (%)<input type="number" min="0" max="100" step="0.01" value={rate} onChange={(event) => setRate(event.target.value)} /></label>
        <label>Credit treatment<select value={credit} onChange={(event) => setCredit(event.target.value)}><option value="">Choose approved treatment</option><option value="recoverable">Recoverable</option><option value="not-recoverable">Not recoverable</option></select></label>
        <label>Finance approval reference<input value={approvalSource} onChange={(event) => setApprovalSource(event.target.value)} placeholder="Document or approval reference" /></label>
        <button type="button" disabled={!name.trim() || !validRate || !credit || !approvalSource.trim()} onClick={() => {
          const next = [...profiles, { id: `supplier-tax-${Date.now()}`, name: name.trim(), rate: Number(rate) / 100, approved: true, approvalSource: approvalSource.trim(), recoverable: credit === "recoverable" }];
          saveSupplierTaxProfiles(next);
          setProfiles(next);
          setName(""); setRate(""); setCredit(""); setApprovalSource("");
        }}>Record approved profile</button>
      </div>
    </div>
  </details>;
}
