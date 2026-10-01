import type { PackageRecord } from "./App";
import type { ProposalQueryContext, ProposalRecord } from "./proposalModel";
import { formatProposalTravel } from "./proposalModel";
import { TripComposer } from "./TripComposer";

export function ProposalBuilder({ packages, initialPackage, existing, queryContext, onCancel, onComplete }: {
  packages: PackageRecord[];
  initialPackage?: PackageRecord | null;
  existing?: ProposalRecord | null;
  queryContext?: ProposalQueryContext | null;
  onCancel: () => void;
  onComplete: (record: ProposalRecord) => void;
}) {
  return <TripComposer
    mode="proposal"
    packages={packages}
    initialPackage={initialPackage}
    existing={existing}
    queryContext={queryContext}
    onCancel={onCancel}
    onSave={(draft, status) => onComplete({
      id: existing?.id ?? `PRP-${Math.floor(1000 + Math.random() * 8999)}`,
      name: draft.name,
      customer: draft.customer,
      customerEmail: draft.customerEmail,
      queryId: existing?.queryId ?? queryContext?.id,
      queryContext: existing?.queryContext ?? queryContext ?? undefined,
      sourcePackageId: draft.source?.id,
      itineraryMode: draft.itineraryMode,
      sharingMode: draft.sharingMode,
      version: existing?.version ? existing.version + 1 : 1,
      acceptedVersion: existing?.acceptedVersion,
      acceptedRevisions: existing?.status === "Approved" && !existing.acceptedRevisions?.some((revision) => revision.version === (existing.acceptedVersion ?? existing.version ?? 1))
        ? [...(existing.acceptedRevisions ?? []), { version: existing.acceptedVersion ?? existing.version ?? 1, acceptedAt: new Date().toISOString(), days: structuredClone(existing.days), value: existing.value }]
        : existing?.acceptedRevisions,
      inclusions: draft.inclusions,
      exclusions: draft.exclusions,
      importantNotes: draft.importantNotes,
      paymentTerms: draft.paymentTerms,
      cancellationPolicy: draft.cancellationPolicy,
      otherTerms: draft.otherTerms,
      markupPercent: draft.markupPercent,
      packageName: draft.source?.name ?? "Custom itinerary",
      destination: draft.destination,
      region: draft.region,
      travel: formatProposalTravel(draft.startDate, draft.endDate),
      travelStart: draft.startDate,
      travelEnd: draft.endDate,
      travellers: `${draft.adults || "1"} adult${draft.adults === "1" ? "" : "s"}${Number(draft.children) ? ` · ${draft.children} child${draft.children === "1" ? "" : "ren"}` : ""}`,
      requirements: draft.requirements || "Customer preferences to be confirmed.",
      changeRequest: existing?.changeRequest,
      note: draft.note || `A ${draft.destination.split(",")[0]} journey prepared for ${draft.customer}.`,
      coverImage: draft.image,
      days: draft.days,
      value: draft.price ?? 0,
      updated: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date()),
      status,
    })}
  />;
}
