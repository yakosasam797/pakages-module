import { useEffect, useId, useMemo, useState } from "react";
import { Button, Checkbox, SearchField } from "@paryatech/design-system";
import {
  DIRECTORY_SERVICES,
  VENDOR_SERVICE_CONNECTIONS,
  type DirectoryCategory,
} from "../data/vendorDirectory";
import { SERVICE_CATEGORIES } from "../data/vendors";
import { IconChevronLeft, IconClose, IconPlus } from "../icons";
import { ServiceTypeIcon, type ServiceTypeName } from "./ServiceTypeLabel";
import "./VendorFormModal.css";
import "./AddServicesModal.css";

export interface DraftLinkedService {
  id: string;
  name: string;
  type: ServiceTypeName;
  location: string;
  source: "Service catalogue" | "Manual entry";
  sourceDetail: string;
}

interface ApiService {
  id: string;
  name: string;
  type: DirectoryCategory;
  location: string;
  provider: "RateHawk" | "Hotelbeds" | "Viator" | "Amadeus";
  providerRef: string;
}

interface CatalogueService {
  id: string;
  name: string;
  type: DirectoryCategory;
  location: string;
  vendorCount: number | null;
}

const API_SERVICES: ApiService[] = [
  { id: "api-brunton-boatyard", name: "Brunton Boatyard", type: "Accommodation", location: "Fort Kochi", provider: "RateHawk", providerRef: "RH-108421" },
  { id: "api-forte-kochi", name: "Forte Kochi", type: "Accommodation", location: "Fort Kochi", provider: "RateHawk", providerRef: "RH-114809" },
  { id: "api-taj-malabar", name: "Taj Malabar Resort & Spa", type: "Accommodation", location: "Willingdon Island, Kochi", provider: "Hotelbeds", providerRef: "HB-102776" },
  { id: "api-kayak-kumbalangi", name: "Kumbalangi Backwater Kayak", type: "Activities", location: "Kochi", provider: "Viator", providerRef: "VT-88420" },
  { id: "api-kochi-transfer", name: "Cochin Airport Private Transfer", type: "Transport", location: "Kochi", provider: "Amadeus", providerRef: "AM-TR-49102" },
];

function pluralServices(count: number): string {
  return `${count} service${count === 1 ? "" : "s"}`;
}

export function AddServicesModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  vendorName: string;
  onClose: () => void;
  onAdd: (services: DraftLinkedService[]) => void;
}) {
  const titleId = useId();
  const [view, setView] = useState<"catalogue" | "manual">("catalogue");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [manualName, setManualName] = useState("");
  const [manualType, setManualType] = useState<ServiceTypeName>("Accommodation");
  const [manualLocation, setManualLocation] = useState("");
  const [manualDescription, setManualDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [onClose, open]);

  const resetAndClose = () => {
    setView("catalogue");
    setQuery("");
    setCategory("all");
    setSelectedIds([]);
    setManualName("");
    setManualType("Accommodation");
    setManualLocation("");
    setManualDescription("");
    onClose();
  };

  const catalogue = useMemo<CatalogueService[]>(() => {
    const crmServices = DIRECTORY_SERVICES.map((service) => ({
      id: `crm-${service.id}`,
      name: service.name,
      type: service.category,
      location: service.location,
      vendorCount: VENDOR_SERVICE_CONNECTIONS.filter(
        (connection) => connection.serviceId === service.id,
      ).length,
    }));
    const connectedServices = API_SERVICES.map((service) => ({
      id: service.id,
      name: service.name,
      type: service.type,
      location: service.location,
      vendorCount: null,
    }));
    return [...crmServices, ...connectedServices];
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalogue.filter((service) => {
      if (category !== "all" && service.type !== category) return false;
      if (!q) return true;
      return `${service.name} ${service.location} ${service.type}`.toLowerCase().includes(q);
    });
  }, [catalogue, category, query]);

  const toggleResult = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const addSelected = () => {
    const selected = catalogue
      .filter((service) => selectedIds.includes(service.id))
      .map(
        (service): DraftLinkedService => ({
          id: service.id,
          name: service.name,
          type: service.type,
          location: service.location,
          source: "Service catalogue",
          sourceDetail: "Existing service profile",
        }),
      );
    if (selected.length) onAdd(selected);
    resetAndClose();
  };

  const addManual = () => {
    if (!manualName.trim() || !manualLocation.trim()) return;
    onAdd([
      {
        id: `manual-${Date.now()}`,
        name: manualName.trim(),
        type: manualType,
        location: manualLocation.trim(),
        source: "Manual entry",
        sourceDetail: manualDescription.trim() || "New service profile",
      },
    ]);
    resetAndClose();
  };

  if (!open) return null;

  const manualReady = Boolean(manualName.trim() && manualLocation.trim());

  return (
    <div className="pt-modal-overlay" role="presentation" onClick={resetAndClose}>
      <div
        className="pt-modal add-services-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="pt-modal__head add-services-modal__head">
          <div>
            <h2 id={titleId} className="pt-modal__title">
              {view === "catalogue" ? "Add services" : "Create a new service"}
            </h2>
          </div>
          <button type="button" className="pt-modal__icon-close" onClick={resetAndClose} aria-label="Close add services">
            <IconClose size={15} />
          </button>
        </header>

        {view === "catalogue" ? (
          <div className="pt-modal__body add-services-modal__body">
            <div className="add-services-search-row">
              <SearchField
                fullWidth
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search service, product or location"
                aria-label="Search services and products"
                autoFocus
              />
              <label className="add-services-category-filter">
                <span className="visually-hidden">Service type</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="all">All service types</option>
                  <option>Accommodation</option>
                  <option>Activities</option>
                  <option>Transport</option>
                  <option>Visa</option>
                  <option>Flights</option>
                </select>
              </label>
            </div>

            <div className="add-services-results-head">
              <strong>{query.trim() ? `${results.length} found` : "Available services"}</strong>
              <span>Searches your CRM and connected catalogues automatically.</span>
            </div>

            <div className="add-service-results" aria-label="Available services">
              {results.map((service) => {
                const checked = selectedIds.includes(service.id);
                return (
                  <label key={service.id} className={`add-service-result${checked ? " is-selected" : ""}`}>
                    <Checkbox state={checked ? "on" : "off"} onCheckedChange={() => toggleResult(service.id)} label={`Select ${service.name}`} />
                    <span className="add-service-result__icon" aria-hidden="true">
                      <ServiceTypeIcon type={service.type} size={15} />
                    </span>
                    <span className="add-service-result__copy">
                      <strong>{service.name}</strong>
                      <span>{service.type} · {service.location}</span>
                    </span>
                    {service.vendorCount ? (
                      <span className="add-service-result__meta">
                        Used by {service.vendorCount} vendor{service.vendorCount === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </label>
                );
              })}
              {results.length === 0 ? (
                <div className="add-service-results__empty">
                  <strong>No matching services</strong>
                  <span>Try another name or create a new service.</span>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className="add-services-create"
              onClick={() => {
                setManualName(query.trim());
                setView("manual");
              }}
            >
              <IconPlus size={14} />
              Can’t find it? Create a new service
            </button>
          </div>
        ) : (
          <div className="pt-modal__body add-services-modal__body add-services-modal__body--manual">
            <button type="button" className="add-services-modal__back" onClick={() => setView("catalogue")}>
              <IconChevronLeft size={14} />
              Back to search
            </button>

            <div className="add-services-manual">
              <label className="pt-mf">
                <span className="pt-mf__l">Service name</span>
                <input className="pt-mf__i" value={manualName} onChange={(event) => setManualName(event.target.value)} placeholder="For example, Harbour View Deluxe Room" autoFocus />
              </label>
              <div className="pt-mf-row">
                <label className="pt-mf">
                  <span className="pt-mf__l">Service type</span>
                  <select className="pt-mf__i" value={manualType} onChange={(event) => setManualType(event.target.value as ServiceTypeName)}>
                    {SERVICE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="pt-mf">
                  <span className="pt-mf__l">Location</span>
                  <input className="pt-mf__i" value={manualLocation} onChange={(event) => setManualLocation(event.target.value)} placeholder="City or destination" />
                </label>
              </div>
              <label className="pt-mf">
                <span className="pt-mf__l">Short description <span className="add-services-optional">Optional</span></span>
                <textarea className="pt-mf__i add-services-manual__textarea" value={manualDescription} onChange={(event) => setManualDescription(event.target.value)} placeholder="What should staff know about this service?" />
              </label>
            </div>
          </div>
        )}

        <footer className="pt-modal__foot add-services-modal__foot">
          <div className="add-services-modal__foot-copy">
            {view === "catalogue"
              ? selectedIds.length
                ? `${pluralServices(selectedIds.length)} selected`
                : "Select one or more services."
              : "Creates one new service profile."}
          </div>
          <div className="pt-modal__foot-acts">
            <Button variant="brand" size="sm" onClick={resetAndClose}>Cancel</Button>
            {view === "catalogue" ? (
              <Button variant="primary" size="sm" disabled={selectedIds.length === 0} onClick={addSelected}>
                <IconPlus />
                {selectedIds.length ? `Add ${pluralServices(selectedIds.length)}` : "Add services"}
              </Button>
            ) : (
              <Button variant="primary" size="sm" disabled={!manualReady} onClick={addManual}>
                <IconPlus />
                Add service
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
