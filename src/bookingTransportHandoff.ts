import { calculatePrivateTransportQuote, type PrivateTransportTrip } from "./modules/vendors/rateCard/privateTransport.ts";
import type { ProposalRecord, ProposalService } from "./proposalModel";

const storageKey = "paryatech:transport-booking-handoffs:v1";
type Snapshot = NonNullable<ProposalService["privateTransportSnapshot"]>;
export interface TransportAmendment { id: string; recordedAt: string; reason: string; input: PrivateTransportTrip; supplierPayable: number; supplierDelta: number }
export interface TransportBookingHandoff {
  proposalId: string; proposalName: string; acceptedVersion: number; recordedAt: string;
  services: Array<{ serviceId: string; hireId: string; title: string; snapshot: Snapshot; amendments: TransportAmendment[]; confirmedSupplierPayable?: number; confirmedAt?: string; supplierConfirmationRef?: string; confirmedAmendmentCount?: number }>;
}

export function readTransportBookingHandoffs(): TransportBookingHandoff[] {
  if (typeof localStorage === "undefined") return [];
  try { const value: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]"); return Array.isArray(value) ? value as TransportBookingHandoff[] : []; }
  catch { return []; }
}

/** Finance reads one current supplier obligation per accepted hire, including recorded deltas. */
export function currentTransportBookingHandoffs(handoffs: TransportBookingHandoff[] = readTransportBookingHandoffs()) {
  const latestByProposal = new Map<string, TransportBookingHandoff>();
  for (const handoff of handoffs) {
    const current = latestByProposal.get(handoff.proposalId);
    if (!current || handoff.acceptedVersion > current.acceptedVersion) latestByProposal.set(handoff.proposalId, handoff);
  }
  return [...latestByProposal.values()];
}

export function transportSupplierObligations(handoffs: TransportBookingHandoff[] = readTransportBookingHandoffs()) {
  const latestConfirmed = new Map<string, { handoff: TransportBookingHandoff; service: TransportBookingHandoff["services"][number] }>();
  for (const handoff of handoffs) for (const service of handoff.services) {
    if (!service.confirmedAt || !service.supplierConfirmationRef?.trim() || service.confirmedSupplierPayable == null) continue;
    const key = `${handoff.proposalId}:${service.hireId}`;
    const previous = latestConfirmed.get(key);
    if (!previous || handoff.acceptedVersion > previous.handoff.acceptedVersion) latestConfirmed.set(key, { handoff, service });
  }
  return [...latestConfirmed.values()].map(({ handoff, service }) => ({
    id: `${handoff.proposalId}:${handoff.acceptedVersion}:${service.hireId}`,
    proposalName: handoff.proposalName, vendorName: service.snapshot.vendorName, title: service.title,
    currency: service.snapshot.currency,
    original: service.snapshot.result.supplierPayable ?? knownTransportAmount(service.snapshot),
    adjustments: service.amendments.slice(0, service.confirmedAmendmentCount ?? 0).reduce((sum, item) => sum + item.supplierDelta, 0),
    payable: service.confirmedSupplierPayable!,
  }));
}

export function recordTransportBookingHandoff(proposal: ProposalRecord): TransportBookingHandoff | null {
  if (proposal.status !== "Approved") return null;
  const seen = new Set<string>();
  const services = proposal.days.flatMap((day) => day.services.flatMap((service) => {
    if (!service.privateTransportSnapshot) return [];
    const hireId = service.transportHireId ?? service.id;
    if (seen.has(hireId)) return [];
    seen.add(hireId);
    return [{ serviceId: service.id, hireId, title: service.title, snapshot: structuredClone(service.privateTransportSnapshot), amendments: [] }];
  }));
  if (!services.length) return null;
  const record = { proposalId: proposal.id, proposalName: proposal.name, acceptedVersion: proposal.acceptedVersion ?? proposal.version ?? 1, recordedAt: new Date().toISOString(), services };
  const all = readTransportBookingHandoffs();
  const existing = all.find((item) => item.proposalId === record.proposalId && item.acceptedVersion === record.acceptedVersion);
  if (existing) return existing;
  localStorage.setItem(storageKey, JSON.stringify([record, ...all]));
  return record;
}

export function calculateTransportAmendment(snapshot: Snapshot, actualInput: PrivateTransportTrip) {
  const quote = calculatePrivateTransportQuote(snapshot.tariff, snapshot.vehicles, actualInput, snapshot.taxProfiles);
  if (quote.supplierPayable == null || quote.blockers.length) return { quote, issue: quote.blockers[0] ?? "Enter verified supplier invoice amounts for every payable-at-actuals charge." };
  return { quote, issue: null };
}

function knownTransportAmount(snapshot: Snapshot): number | null {
  const result = snapshot.result;
  if (result.commercialAmount == null) return null;
  return snapshot.tariff.taxMode === "inclusive" ? result.commercialAmount : result.supplierTax == null ? null : result.commercialAmount + result.supplierTax;
}

export function recordTransportAmendment(proposalId: string, acceptedVersion: number, serviceId: string, amendmentId: string, actualInput: PrivateTransportTrip, reason: string): TransportAmendment | null {
  if (!reason.trim() || !amendmentId.trim()) return null;
  const all = readTransportBookingHandoffs();
  const handoff = all.find((item) => item.proposalId === proposalId && item.acceptedVersion === acceptedVersion);
  const service = handoff?.services.find((item) => item.serviceId === serviceId);
  if (!service) return null;
  const existing = service.amendments.find((item) => item.id === amendmentId);
  if (existing) return existing;
  const { quote, issue } = calculateTransportAmendment(service.snapshot, actualInput);
  if (issue || quote.supplierPayable == null) return null;
  const prior = service.amendments.at(-1)?.supplierPayable ?? service.snapshot.result.supplierPayable ?? knownTransportAmount(service.snapshot);
  if (prior == null) return null;
  const amendment = { id: amendmentId, recordedAt: new Date().toISOString(), reason: reason.trim(), input: structuredClone(actualInput), supplierPayable: quote.supplierPayable, supplierDelta: quote.supplierPayable - prior };
  service.amendments.push(amendment);
  localStorage.setItem(storageKey, JSON.stringify(all));
  return amendment;
}

/** Finance sees the latest supplier-confirmed payable once per accepted hire. */
export function confirmTransportSupplier(proposalId: string, acceptedVersion: number, serviceId: string, supplierConfirmationRef: string): number | null {
  if (!supplierConfirmationRef.trim()) return null;
  const all = readTransportBookingHandoffs();
  const service = all.find((item) => item.proposalId === proposalId && item.acceptedVersion === acceptedVersion)?.services.find((item) => item.serviceId === serviceId);
  if (!service) return null;
  const payable = service.amendments.at(-1)?.supplierPayable ?? service.snapshot.result.supplierPayable;
  if (payable == null) return null;
  service.confirmedSupplierPayable = payable;
  service.supplierConfirmationRef = supplierConfirmationRef.trim();
  service.confirmedAmendmentCount = service.amendments.length;
  service.confirmedAt = new Date().toISOString();
  localStorage.setItem(storageKey, JSON.stringify(all));
  return payable;
}
