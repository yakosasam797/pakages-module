import type { PackageRecord } from "./App";
import { TripComposer } from "./TripComposer";

export function PackageBuilder({ existing, initialTemplate, onCancel, onComplete }: { existing?: PackageRecord | null; initialTemplate?: PackageRecord | null; onCancel: () => void; onComplete: (record: PackageRecord) => void; onToast: (message: string) => void }) {
  return <TripComposer
    mode="package"
    existingPackage={existing}
    initialPackage={initialTemplate}
    onCancel={onCancel}
    onSave={(draft) => onComplete({
      id: existing?.id ?? `PKG-${Math.floor(1000 + Math.random() * 8999)}`,
      name: draft.name,
      destination: draft.destination,
      region: draft.region,
      duration: `${draft.days.length} ${draft.days.length === 1 ? "day" : "days"}${draft.days.length > 1 ? ` · ${draft.days.length - 1} nights` : ""}`,
      startingPrice: draft.price,
      priceBasis: draft.priceBasis,
      itineraryMode: "advanced",
      departureType: draft.departureType,
      fixedStart: draft.departureType === "fixed" ? draft.startDate : undefined,
      fixedEnd: draft.departureType === "fixed" ? draft.endDate : undefined,
      inclusions: draft.inclusions,
      exclusions: draft.exclusions,
      importantNotes: draft.importantNotes,
      paymentTerms: draft.paymentTerms,
      cancellationPolicy: draft.cancellationPolicy,
      otherTerms: draft.otherTerms,
      markupPercent: draft.markupPercent,
      updated: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date()),
      status: existing?.status ?? "Draft",
      source: "Your catalog",
      image: draft.image,
      highlights: existing?.highlights ?? [draft.note || "A reusable day-by-day trip.", "Tailor the plan for each traveller without changing this package."],
      proposalDays: draft.days,
      createdFromProposal: existing?.createdFromProposal,
      templateId: existing?.templateId ?? initialTemplate?.id,
    })}
  />;
}
