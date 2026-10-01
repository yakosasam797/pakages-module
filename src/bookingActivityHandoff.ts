import type { ProposalRecord, ProposalService } from "./proposalModel";

const STORAGE_KEY = "paryatech-activity-booking-handoffs-v1";

export interface ActivityBookingHandoff {
  proposalId: string;
  proposalName: string;
  acceptedVersion: number;
  recordedAt: string;
  services: Array<{ title: string; snapshot: NonNullable<ProposalService["activitySnapshot"]> }>;
}

export function readActivityBookingHandoffs(): ActivityBookingHandoff[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function recordActivityBookingHandoff(proposal: ProposalRecord): ActivityBookingHandoff | null {
  if (proposal.status !== "Approved") return null;
  const services = proposal.days.flatMap((day) => day.services.flatMap((service) =>
    service.activitySnapshot ? [{ title: service.title, snapshot: structuredClone(service.activitySnapshot) }] : []));
  if (!services.length) return null;
  const record: ActivityBookingHandoff = {
    proposalId: proposal.id,
    proposalName: proposal.name,
    acceptedVersion: proposal.acceptedVersion ?? proposal.version ?? 1,
    recordedAt: new Date().toISOString(),
    services,
  };
  const existing = readActivityBookingHandoffs().filter((item) => item.proposalId !== proposal.id || item.acceptedVersion !== record.acceptedVersion);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...existing]));
  return record;
}
