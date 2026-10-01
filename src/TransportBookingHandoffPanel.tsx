import { useState } from "react";
import { calculateTransportAmendment, confirmTransportSupplier, recordTransportAmendment, type TransportBookingHandoff } from "./bookingTransportHandoff";

const money = (amount: number, currency: string) => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

export function TransportBookingHandoffPanel({ handoff, onRecorded }: { handoff: TransportBookingHandoff; onRecorded: () => void }) {
  const [actualKm, setActualKm] = useState<Record<string, string>>({});
  const [actualAmounts, setActualAmounts] = useState<Record<string, string>>({});
  const [reason, setReason] = useState<Record<string, string>>({});
  const [confirmationRefs, setConfirmationRefs] = useState<Record<string, string>>({});

  return <section key={`${handoff.proposalId}-${handoff.acceptedVersion}`}>
    <strong>{handoff.proposalName}</strong><small>{handoff.proposalId} · Approved version {handoff.acceptedVersion}</small>
    {handoff.services.map((service) => {
      const latest = service.amendments.at(-1)?.supplierPayable ?? service.snapshot.result.supplierPayable;
      const pendingActuals = service.snapshot.tariff.charges.filter((charge) => charge.treatment === "actual" && service.snapshot.result.actualCharges.includes(charge.name) &&
        (!charge.routeIds?.length || charge.routeIds.includes(service.snapshot.input.routeId)) &&
        (!charge.vehicleIds?.length || service.snapshot.input.vehicleAllocations?.some((vehicle) => charge.vehicleIds?.includes(vehicle.vehicleId)) || charge.vehicleIds?.includes(service.snapshot.input.vehicleId)));
      const amounts: Record<string, number> = {};
      pendingActuals.forEach((charge) => {
        const raw = actualAmounts[`${service.serviceId}:${charge.id}`];
        if (raw != null && raw !== "") amounts[charge.id] = Number(raw);
      });
      const kmEntered = actualKm[service.serviceId];
      const hasInput = kmEntered !== undefined && kmEntered !== "" || pendingActuals.some((charge) => amounts[charge.id] !== undefined);
      const amendedInput = { ...service.snapshot.input,
        plannedKm: kmEntered === undefined || kmEntered === "" ? service.snapshot.input.plannedKm : Number(kmEntered),
        actualChargeAmounts: { ...service.snapshot.input.actualChargeAmounts, ...amounts },
      };
      const preview = hasInput ? calculateTransportAmendment(service.snapshot, amendedInput) : null;
      const needsConfirmation = latest != null && (!service.supplierConfirmationRef || service.confirmedSupplierPayable !== latest || service.confirmedAmendmentCount !== service.amendments.length);

      return <div className="booking-module__transport-row" key={service.serviceId}>
        <p><span>{service.title} · {service.snapshot.vendorName} · v{service.snapshot.version}</span><b>{latest == null ? "Base + actuals pending" : money(latest, service.snapshot.currency)}</b></p>
        <small>{service.confirmedAt && !needsConfirmation ? `Supplier booking ${service.supplierConfirmationRef} confirmed · available for Finance` : "Supplier booking and payable pending confirmation · not posted to Finance"}</small>
        {service.snapshot.tariff.template === "outstation-km" || pendingActuals.length ? <div className="booking-module__transport-actual">
          {service.snapshot.tariff.template === "outstation-km" ? <label>Actual chargeable km<input type="number" min="0" value={kmEntered ?? ""} onChange={(event) => setActualKm((current) => ({ ...current, [service.serviceId]: event.target.value }))} placeholder={String(service.snapshot.input.plannedKm)} /></label> : null}
          {pendingActuals.map((charge) => <label key={charge.id}>{charge.name} · supplier invoice amount, tax included<input type="number" min="0" value={actualAmounts[`${service.serviceId}:${charge.id}`] ?? ""} onChange={(event) => setActualAmounts((current) => ({ ...current, [`${service.serviceId}:${charge.id}`]: event.target.value }))} placeholder="Enter actual amount" /></label>)}
          <label>Adjustment reason<input value={reason[service.serviceId] ?? ""} onChange={(event) => setReason((current) => ({ ...current, [service.serviceId]: event.target.value }))} placeholder="Supplier invoice or trip sheet reference" /></label>
          <button type="button" disabled={!preview || Boolean(preview.issue) || !reason[service.serviceId]?.trim()} onClick={() => {
            const recorded = recordTransportAmendment(handoff.proposalId, handoff.acceptedVersion, service.serviceId, `invoice-${service.amendments.length + 1}`, amendedInput, reason[service.serviceId]);
            if (recorded) onRecorded();
          }}>Record supplier actuals</button>
        </div> : null}
        {preview ? <small>{preview.issue ?? `Revised payable ${money(preview.quote.supplierPayable!, service.snapshot.currency)} · only the difference will be recorded`}</small> : null}
        {latest != null && needsConfirmation ? <label>Supplier booking confirmation reference<input value={confirmationRefs[service.serviceId] ?? ""} onChange={(event) => setConfirmationRefs((current) => ({ ...current, [service.serviceId]: event.target.value }))} placeholder="Supplier acceptance / booking reference" /></label> : null}
        {latest != null ? <button type="button" disabled={!needsConfirmation || !confirmationRefs[service.serviceId]?.trim()} onClick={() => { if (confirmTransportSupplier(handoff.proposalId, handoff.acceptedVersion, service.serviceId, confirmationRefs[service.serviceId]) != null) onRecorded(); }}>{needsConfirmation ? "Confirm supplier booking and payable" : "Supplier booking confirmed"}</button> : null}
        {service.amendments.map((amendment) => <small key={amendment.id}>{amendment.reason}: {money(amendment.supplierDelta, service.snapshot.currency)} supplier adjustment · review customer terms separately</small>)}
      </div>;
    })}
  </section>;
}
