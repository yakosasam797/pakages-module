import type { PackageRecord } from "./App";
import baliImage from "./assets/package-images/bali.jpg";
import dubaiImage from "./assets/package-images/dubai.jpg";
import himachalImage from "./assets/package-images/himachal.jpg";
import keralaImage from "./assets/package-images/kerala.jpg";
import rajasthanImage from "./assets/package-images/rajasthan.jpg";
import { PackageComposer } from "./PackageComposer";

function imageFor(destination: string) {
  const place = destination.toLowerCase();
  if (place.includes("dubai")) return dubaiImage;
  if (place.includes("himachal") || place.includes("manali")) return himachalImage;
  if (place.includes("kerala") || place.includes("kochi")) return keralaImage;
  if (place.includes("rajasthan") || place.includes("jaipur")) return rajasthanImage;
  return baliImage;
}

export function PackageBuilder({ existing, initialTemplate, onCancel, onComplete }: {
  existing?: PackageRecord | null;
  initialTemplate?: PackageRecord | null;
  onCancel: () => void;
  onComplete: (record: PackageRecord) => void;
  onToast: (message: string) => void;
}) {
  return <PackageComposer
    existing={existing}
    initialTemplate={initialTemplate}
    onCancel={onCancel}
    onSave={(outline) => onComplete({
      id: existing?.id ?? `PKG-${Math.floor(1000 + Math.random() * 8999)}`,
      name: outline.name,
      destination: outline.destination,
      region: outline.region,
      duration: `${outline.days.length} ${outline.days.length === 1 ? "day" : "days"}${outline.days.length > 1 ? ` · ${outline.days.length - 1} nights` : ""}`,
      startingPrice: outline.startingPrice,
      priceBasis: outline.priceBasis,
      itineraryMode: "simple",
      departureType: existing?.departureType ?? "flexible",
      fixedStart: existing?.fixedStart,
      fixedEnd: existing?.fixedEnd,
      inclusions: outline.inclusions,
      exclusions: outline.exclusions,
      importantNotes: existing?.importantNotes ?? initialTemplate?.importantNotes,
      paymentTerms: existing?.paymentTerms ?? initialTemplate?.paymentTerms,
      cancellationPolicy: existing?.cancellationPolicy ?? initialTemplate?.cancellationPolicy,
      otherTerms: existing?.otherTerms ?? initialTemplate?.otherTerms,
      markupPercent: outline.markupPercent,
      updated: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date()),
      status: existing?.status ?? "Draft",
      source: "Your catalog",
      image: outline.image || imageFor(outline.destination),
      highlights: outline.overview ? [outline.overview] : existing?.highlights ?? initialTemplate?.highlights ?? [],
      proposalDays: outline.days,
      createdFromProposal: existing?.createdFromProposal,
      templateId: existing?.templateId ?? initialTemplate?.id,
    })}
  />;
}
