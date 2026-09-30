import { useCallback, useEffect, useRef, useState } from "react";
import { Button, IconButton } from "@paryatech/design-system";
import type { ServiceMedia, ServiceType, VendorService } from "../data/services";
import type { PageNavigationChange } from "../pageNavigation";
import {
  IconCheck,
  IconImage,
  IconPin,
  IconPlus,
  IconTrash,
} from "../icons";
import "./CreateVendorServicePage.css";

type ServiceDraft = {
  name: string;
  type: ServiceType;
  location: string;
  duration: string;
  ageSuitability: string;
  difficulty: string;
  seasonality: string;
  searchText: string;
  description: string;
  inclusions: string;
  exclusions: string;
};

const SERVICE_TYPES: ServiceType[] = [
  "Accommodation",
  "Activity",
  "Transport",
  "DMC/Ground handling",
  "Visa",
  "Flights",
];

function initialDraft(type: ServiceType): ServiceDraft {
  return {
    name: "",
    type,
    location: "",
    duration: type === "Accommodation" ? "Overnight or multi-night" : "Service based",
    ageSuitability: "All ages",
    difficulty: "Not applicable",
    seasonality: "Available year-round",
    searchText: "",
    description: "",
    inclusions: "",
    exclusions: "Personal expenses",
  };
}

function serviceId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 28);
  return `svc-${slug || "new-service"}`;
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function CreateVendorServicePage({
  vendorId,
  vendorName,
  initialType = "Accommodation",
  onCancel,
  onNavigationContextChange,
  onCreate,
}: {
  vendorId: string;
  vendorName: string;
  initialType?: ServiceType;
  onCancel: () => void;
  onNavigationContextChange?: PageNavigationChange;
  onCreate: (service: VendorService) => void;
}) {
  const [draft, setDraft] = useState<ServiceDraft>(() => initialDraft(initialType));
  const [media, setMedia] = useState<ServiceMedia[]>([]);
  const uploadRef = useRef<HTMLInputElement>(null);
  const previewId = serviceId(draft.name);
  const primaryMedia = media.find((item) => item.usedInBanner) ?? media[0];
  const completed = [draft.name.trim(), draft.location.trim(), draft.description.trim(), media.length > 0]
    .filter(Boolean).length;
  const ready = Boolean(draft.name.trim() && draft.location.trim());

  const setField = <K extends keyof ServiceDraft>(key: K, value: ServiceDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const uploadMedia = (files: FileList | null) => {
    if (!files?.length) return;
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!images.length) return;
    setMedia((current) => {
      const needsPrimary = !current.some((item) => item.usedInBanner);
      return [
        ...current,
        ...images.map((file, index) => ({
          id: `new-media-${Date.now()}-${index}`,
          title: file.name.replace(/\.[^.]+$/, ""),
          imageUrl: URL.createObjectURL(file),
          imageAlt: file.name.replace(/\.[^.]+$/, ""),
          kind: "image" as const,
          usedInBanner: needsPrimary && index === 0,
        })),
      ];
    });
    if (uploadRef.current) uploadRef.current.value = "";
  };

  const removeMedia = (id: string) => {
    setMedia((current) => {
      const removed = current.find((item) => item.id === id);
      const remaining = current.filter((item) => item.id !== id);
      if (removed?.imageUrl.startsWith("blob:")) URL.revokeObjectURL(removed.imageUrl);
      if (removed?.usedInBanner && remaining.length) {
        return remaining.map((item, index) => ({ ...item, usedInBanner: index === 0 }));
      }
      return remaining;
    });
  };

  const cancel = useCallback(() => {
    media.forEach((item) => {
      if (item.imageUrl.startsWith("blob:")) URL.revokeObjectURL(item.imageUrl);
    });
    onCancel();
  }, [media, onCancel]);

  useEffect(() => {
    onNavigationContextChange?.({
      backLabel: "Back to services",
      sectionLabel: "Services",
      title: draft.name.trim() || "New service",
      onBack: cancel,
    });
    return () => onNavigationContextChange?.(null);
  }, [cancel, draft.name, onNavigationContextChange]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    const description = draft.description.trim();
    const service: VendorService = {
      id: `${previewId}-${Date.now().toString(36)}`,
      vendorId,
      name: draft.name.trim(),
      type: draft.type,
      details: description || `${draft.duration} · ${draft.location.trim()}`,
      about: description || `${draft.name.trim()} is supplied by ${vendorName}.`,
      location: draft.location.trim(),
      inclusions: splitLines(draft.inclusions),
      profile: {
        category: draft.type,
        duration: draft.duration.trim(),
        ageSuitability: draft.ageSuitability.trim(),
        difficulty: draft.difficulty.trim(),
        seasonality: draft.seasonality.trim(),
        searchText: draft.searchText.trim() || `${draft.name.trim()} ${draft.location.trim()} ${draft.type}`,
        exclusions: splitLines(draft.exclusions),
      },
      pricingLabel: "No pricing linked",
      rateCardCount: 0,
      rateCards: [],
      imageUrl: primaryMedia?.imageUrl ?? "",
      imageAlt: primaryMedia?.imageAlt ?? `${draft.name.trim()} service image`,
      media,
    };
    onCreate(service);
  };

  return (
    <div className="service-directory-detail service-create-page">
      <form onSubmit={submit} noValidate>
        <header className="service-directory-detail__record service-create-page__record">
          <div className="service-directory-detail__identity">
            {primaryMedia ? (
              <img
                className="service-directory-detail__image"
                src={primaryMedia.imageUrl}
                alt={primaryMedia.imageAlt}
                width={72}
                height={72}
              />
            ) : (
              <button
                type="button"
                className="service-create-page__image-placeholder"
                onClick={() => uploadRef.current?.click()}
                aria-label="Upload a service image"
              >
                <IconImage size={20} />
              </button>
            )}
            <div className="service-directory-detail__identity-copy">
              <div className="service-directory-detail__title-row">
                <h1>{draft.name.trim() || "Untitled service"}</h1>
              </div>
              <p>
                <IconPin size={14} />
                {draft.location.trim() || "Add a base location"}
                <span aria-hidden="true">·</span>
                <span className="pt-mono">{previewId.toUpperCase()}</span>
                <span aria-hidden="true">·</span>
                {draft.type}
              </p>
            </div>
          </div>
          <div className="service-create-page__completion">
            <strong className="pt-mono">{completed}/4</strong>
            <span>profile essentials</span>
          </div>
        </header>

        <div className="service-create-page__section-bar">
          <span>Profile &amp; media</span>
          <small>Fields marked * are required</small>
        </div>

        <div className="service-detail-panels service-create-page__panels">
          <div className="service-detail-panels__layout">
            <section className="service-detail-panel" aria-labelledby="create-service-profile-title">
              <div className="service-detail-panel__head">
                <div>
                  <h2 id="create-service-profile-title">Profile</h2>
                  <p>Describe the service staff will search, cost, and add to trips.</p>
                </div>
              </div>
              <div className="service-detail-panel__body">
                <div className="service-create-page__fields">
                  <label className="service-create-page__field service-create-page__field--wide">
                    <span>Service title *</span>
                    <input
                      value={draft.name}
                      onChange={(event) => setField("name", event.target.value)}
                      placeholder="For example, Munnar ridge trek"
                      autoFocus
                    />
                  </label>
                  <label className="service-create-page__field">
                    <span>Service type *</span>
                    <select
                      value={draft.type}
                      onChange={(event) => setField("type", event.target.value as ServiceType)}
                    >
                      {SERVICE_TYPES.map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </label>
                  <label className="service-create-page__field">
                    <span>Base location *</span>
                    <input
                      value={draft.location}
                      onChange={(event) => setField("location", event.target.value)}
                      placeholder="City or destination"
                    />
                  </label>
                  <label className="service-create-page__field">
                    <span>Duration</span>
                    <input value={draft.duration} onChange={(event) => setField("duration", event.target.value)} />
                  </label>
                  <label className="service-create-page__field">
                    <span>Age suitability</span>
                    <input value={draft.ageSuitability} onChange={(event) => setField("ageSuitability", event.target.value)} />
                  </label>
                  <label className="service-create-page__field">
                    <span>Difficulty</span>
                    <input value={draft.difficulty} onChange={(event) => setField("difficulty", event.target.value)} />
                  </label>
                  <label className="service-create-page__field">
                    <span>Seasonality</span>
                    <input value={draft.seasonality} onChange={(event) => setField("seasonality", event.target.value)} />
                  </label>
                  <label className="service-create-page__field service-create-page__field--wide">
                    <span>Search keywords</span>
                    <input
                      value={draft.searchText}
                      onChange={(event) => setField("searchText", event.target.value)}
                      placeholder="Terms staff may use to find this service"
                    />
                  </label>
                  <label className="service-create-page__field service-create-page__field--wide">
                    <span>Description</span>
                    <textarea
                      value={draft.description}
                      onChange={(event) => setField("description", event.target.value)}
                      placeholder="What the service is, how it works, and what makes it useful"
                      rows={4}
                    />
                  </label>
                  <label className="service-create-page__field">
                    <span>Included</span>
                    <textarea
                      value={draft.inclusions}
                      onChange={(event) => setField("inclusions", event.target.value)}
                      placeholder="One item per line"
                      rows={3}
                    />
                  </label>
                  <label className="service-create-page__field">
                    <span>Excluded</span>
                    <textarea
                      value={draft.exclusions}
                      onChange={(event) => setField("exclusions", event.target.value)}
                      placeholder="One item per line"
                      rows={3}
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="service-detail-panel" aria-labelledby="create-service-media-title">
              <div className="service-detail-panel__head">
                <div>
                  <h2 id="create-service-media-title">Media</h2>
                  <p>Add the images staff will see in service results and proposals.</p>
                </div>
                <span className="service-detail-panel__count pt-mono">
                  {media.length} image{media.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="service-detail-panel__body service-create-page__media-body">
                {media.length ? (
                  <ul className="service-create-page__media-list">
                    {[...media]
                      .sort((a, b) => Number(Boolean(b.usedInBanner)) - Number(Boolean(a.usedInBanner)))
                      .map((item) => (
                        <li key={item.id} className={item.usedInBanner ? "is-primary" : undefined}>
                          <div className="service-create-page__media-image">
                            <img src={item.imageUrl} alt={item.imageAlt} width={420} height={240} />
                            {item.usedInBanner ? <span>Primary banner</span> : null}
                          </div>
                          <div className="service-create-page__media-meta">
                            <input
                              value={item.title}
                              aria-label={`Title for ${item.title}`}
                              onChange={(event) => setMedia((current) => current.map((mediaItem) =>
                                mediaItem.id === item.id ? { ...mediaItem, title: event.target.value } : mediaItem,
                              ))}
                            />
                            <div>
                              {!item.usedInBanner ? (
                                <button
                                  type="button"
                                  onClick={() => setMedia((current) => current.map((mediaItem) => ({
                                    ...mediaItem,
                                    usedInBanner: mediaItem.id === item.id,
                                  })))}
                                >
                                  Set as primary
                                </button>
                              ) : <span>Used in the service header</span>}
                              <IconButton label={`Remove ${item.title}`} onClick={() => removeMedia(item.id)}>
                                <IconTrash />
                              </IconButton>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <button
                    type="button"
                    className="service-create-page__media-empty"
                    onClick={() => uploadRef.current?.click()}
                  >
                    <span><IconImage size={22} /></span>
                    <strong>Add service images</strong>
                    <small>The first image becomes the primary banner. JPG, PNG, or WebP.</small>
                  </button>
                )}
                <div className="service-create-page__media-actions">
                  <Button variant="brand" size="sm" type="button" onClick={() => uploadRef.current?.click()}>
                    <IconPlus />
                    Upload media
                  </Button>
                  <input
                    ref={uploadRef}
                    className="service-create-page__file"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => uploadMedia(event.target.files)}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        <footer className="service-create-page__actions">
          <p>
            <strong>{ready ? "Ready to create." : "Add a service title and location."}</strong>
            {media.length ? " Media will be saved with the profile." : " Media can be added now or later."}
          </p>
          <div>
            <Button variant="ghost" size="sm" type="button" onClick={cancel}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" disabled={!ready}>
              <IconCheck />
              Create service
            </Button>
          </div>
        </footer>
      </form>
    </div>
  );
}
