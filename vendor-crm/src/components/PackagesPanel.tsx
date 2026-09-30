import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  EmptyState,
  IconButton,
  LeadCell,
  ListBulkBar,
  Pagination,
  SearchField,
  StackCell,
  StackLine,
  Tooltip,
  type CheckboxState,
} from "@paryatech/design-system";
import { DashboardDataSheetFill } from "./DashboardDataSheet";
import {
  PACKAGE_STATUS_LABEL,
  VENDOR_PACKAGES,
  type PackageStatus,
  type VendorPackage,
} from "../data/packages";
import type { PageNavigationChange } from "../pageNavigation";
import {
  IconCard,
  IconCheck,
  IconClose,
  IconCopy,
  IconFilter,
  IconMore,
  IconPlus,
} from "../icons";
import { PackageDetailPage } from "./PackageDetailPage";
import { ServiceTypeList } from "./ServiceTypeLabel";
import "./VendorFormModal.css";
import "./PackagesPanel.css";

type StatusFilter = "all" | PackageStatus;

const FILTER_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All packages" },
  { value: "live", label: "Live" },
  { value: "reprice", label: "Re-price" },
  { value: "draft", label: "Draft" },
];

const EMPTY_PACKAGE: Pick<VendorPackage, "name" | "detail" | "summary" | "sellPrice"> = {
  name: "",
  detail: "",
  summary: "",
  sellPrice: "",
};

const PACKAGE_IDS_BY_VENDOR: Record<string, string[]> = {
  trailmakers: ["pkg-1", "pkg-2"],
  exhosp: ["pkg-3", "pkg-7"],
  wanderlust: ["pkg-5", "pkg-8"],
  coastal: ["pkg-4", "pkg-6"],
};

function packagesForVendor(vendorId: string) {
  const packageIds = PACKAGE_IDS_BY_VENDOR[vendorId] ?? [];
  return VENDOR_PACKAGES.filter((pkg) => packageIds.includes(pkg.id));
}

export function PackagesPanel({
  vendorId = "trailmakers",
  canEdit = true,
  onDetailOpenChange,
  onNavigationContextChange,
  onOpenService,
}: {
  vendorId?: string;
  canEdit?: boolean;
  onDetailOpenChange?: (open: boolean) => void;
  onNavigationContextChange?: PageNavigationChange;
  onOpenService?: (serviceId: string | undefined, vendorId: string | undefined) => void;
}) {
  const [packages, setPackages] = useState<VendorPackage[]>(() => packagesForVendor(vendorId));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [openPackageId, setOpenPackageId] = useState<string | null>(null);
  const [actionMenu, setActionMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [buildOpen, setBuildOpen] = useState(false);
  const [buildDraft, setBuildDraft] = useState(EMPTY_PACKAGE);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setPackages(packagesForVendor(vendorId));
    setOpenPackageId(null);
    setSelected([]);
    setNotice(null);
  }, [vendorId]);

  const openPackage = openPackageId
    ? packages.find((item) => item.id === openPackageId)
    : undefined;
  const closePackageDetail = useCallback(() => {
    setOpenPackageId(null);
    onDetailOpenChange?.(false);
  }, [onDetailOpenChange]);

  useEffect(() => {
    if (!openPackage) {
      onNavigationContextChange?.(null);
      return;
    }
    onNavigationContextChange?.({
      backLabel: "Back to packages",
      sectionLabel: "Packages",
      title: openPackage.name,
      onBack: closePackageDetail,
    });
    return () => onNavigationContextChange?.(null);
  }, [closePackageDetail, onNavigationContextChange, openPackage]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return packages.filter((pkg) => {
      const matchesStatus = statusFilter === "all" || pkg.status === statusFilter;
      const hay = `${pkg.name} ${pkg.detail} ${pkg.services} ${pkg.pricedFrom}`.toLowerCase();
      return matchesStatus && (!q || hay.includes(q));
    });
  }, [packages, query, statusFilter]);

  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === filtered.length && filtered.length > 0
        ? "on"
        : "indeterminate";

  const toggleAll = (state: CheckboxState) => {
    setSelected(state === "on" ? filtered.map((pkg) => pkg.id) : []);
  };

  const toggleRow = (id: string, state: CheckboxState) => {
    setSelected((current) =>
      state === "on"
        ? current.includes(id)
          ? current
          : [...current, id]
        : current.filter((item) => item !== id),
    );
  };

  const openPackageDetail = (id: string) => {
    setOpenPackageId(id);
    setActionMenu(null);
    onDetailOpenChange?.(true);
  };

  const duplicatePackages = (ids: string[]) => {
    const source = packages.filter((pkg) => ids.includes(pkg.id));
    if (source.length === 0) return;
    const stamp = Date.now();
    const copies = source.map((pkg, index) => ({
      ...pkg,
      id: `${pkg.id}-copy-${stamp}-${index}`,
      name: `${pkg.name} copy`,
      status: "draft" as const,
    }));
    setPackages((current) => [...copies, ...current]);
    setSelected([]);
    setActionMenu(null);
    setNotice(`${copies.length} draft ${copies.length === 1 ? "copy was" : "copies were"} created.`);
  };

  const updatePackageStatus = (id: string, status: PackageStatus) => {
    const item = packages.find((pkg) => pkg.id === id);
    setPackages((current) =>
      current.map((pkg) => (pkg.id === id ? { ...pkg, status } : pkg)),
    );
    setActionMenu(null);
    setNotice(`${item?.name ?? "Package"} is now ${PACKAGE_STATUS_LABEL[status].toLowerCase()}.`);
  };

  const createPackage = () => {
    const name = buildDraft.name.trim();
    if (!name) return;
    const pkg: VendorPackage = {
      id: `pkg-${Date.now()}`,
      name,
      detail: buildDraft.detail.trim() || "Route and duration not added",
      summary: buildDraft.summary.trim() || "Add a short overview that explains the journey, pace and intended experience.",
      services: "Services not added yet",
      serviceTypes: ["Accommodation"],
      pricedFrom: "—",
      pricedFromKind: "Unpriced",
      sellPrice: buildDraft.sellPrice.trim() || "—",
      status: "draft",
      imageUrl: "",
      imageAlt: "",
    };
    setPackages((current) => [pkg, ...current]);
    setBuildDraft(EMPTY_PACKAGE);
    setBuildOpen(false);
    setNotice(`${name} was created as a draft. Add its services and media next.`);
    openPackageDetail(pkg.id);
  };

  if (openPackage) {
    return (
      <PackageDetailPage
        pkg={openPackage}
        canEdit={canEdit}
        onOpenService={onOpenService}
        onUpdate={(next) =>
          setPackages((current) =>
            current.map((pkg) => (pkg.id === next.id ? next : pkg)),
          )
        }
      />
    );
  }

  return (
    <div className="packages-panel dashboard-table-panel">
      <div className="packages-panel__toolbar">
        <SearchField
          fullWidth
          className="packages-panel__search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
            setSelected([]);
          }}
          placeholder="Search package name"
          aria-label="Search package name"
        />
        <div className="packages-panel__tools">
          <div className="packages-filter">
            <Tooltip tip="Filter">
              <IconButton
                label={`Filter packages${statusFilter === "all" ? "" : `: ${PACKAGE_STATUS_LABEL[statusFilter]}`}`}
                aria-expanded={filterOpen}
                onClick={() => {
                  setFilterOpen((open) => !open);
                  setActionMenu(null);
                }}
              >
                <IconFilter />
              </IconButton>
            </Tooltip>
            {filterOpen ? (
              <div className="packages-filter__menu" role="menu" aria-label="Filter packages by status">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={statusFilter === option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setSelected([]);
                      setPage(1);
                      setFilterOpen(false);
                    }}
                  >
                    <span>{option.label}</span>
                    {statusFilter === option.value ? <IconCheck /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {canEdit ? (
            <Button variant="primary" size="sm" onClick={() => setBuildOpen(true)}>
              <IconPlus />
              Build package
            </Button>
          ) : null}
        </div>
      </div>

      {statusFilter !== "all" ? (
        <div className="packages-panel__filter-chip">
          Showing {PACKAGE_STATUS_LABEL[statusFilter].toLowerCase()} packages
          <button type="button" onClick={() => setStatusFilter("all")}>Clear filter</button>
        </div>
      ) : null}

      {notice ? (
        <div className="packages-panel__notice" role="status">
          <IconCheck />
          <span>{notice}</span>
          <IconButton label="Dismiss notification" onClick={() => setNotice(null)}><IconClose /></IconButton>
        </div>
      ) : null}

      <div className="packages-panel__sheet dashboard-table-end">
        {filtered.length === 0 ? (
          <EmptyState title="No packages match this view" description="Clear the filter or try another package name." />
        ) : (
          <>
            <DataSheet className="packages-sheet" aria-label="Packages">
              <DataSheetHeader>
                <DataSheetCell check><Checkbox state={headerState} onCheckedChange={toggleAll} label="Select all packages" /></DataSheetCell>
                <DataSheetCell>Package</DataSheetCell>
                <DataSheetCell>Services</DataSheetCell>
                <DataSheetCell>Priced from</DataSheetCell>
                <DataSheetCell>Sell</DataSheetCell>
                <DataSheetCell className="packages-sheet__action">Action</DataSheetCell>
              </DataSheetHeader>
              {filtered.map((pkg) => (
                <DataSheetRow
                  key={pkg.id}
                  className="packages-sheet__row--interactive"
                  role="link"
                  tabIndex={0}
                  aria-label={`Open ${pkg.name}`}
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest("button, a, input, select, textarea")) return;
                    openPackageDetail(pkg.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openPackageDetail(pkg.id);
                    }
                  }}
                >
                  <DataSheetCell check>
                    <Checkbox state={selected.includes(pkg.id) ? "on" : "off"} onCheckedChange={(state) => toggleRow(pkg.id, state)} label={`Select ${pkg.name}`} />
                  </DataSheetCell>
                  <DataSheetCell>
                    <LeadCell
                      align="start"
                      icon={pkg.imageUrl
                        ? <img className="packages-sheet__thumb" src={pkg.imageUrl} alt={pkg.imageAlt} width={36} height={36} loading="lazy" decoding="async" />
                        : <span className="packages-sheet__thumb packages-sheet__thumb--empty"><IconPlus size={14} /></span>}
                      title={pkg.name}
                      subtitle={pkg.detail}
                    />
                  </DataSheetCell>
                  <DataSheetCell>
                    <div className="packages-sheet__services" title={`Includes: ${pkg.services}`}>
                      <ServiceTypeList compact types={pkg.serviceTypes} ariaLabel={`Service types included in ${pkg.name}`} />
                    </div>
                  </DataSheetCell>
                  <DataSheetCell>
                    <StackCell><StackLine icon={<IconCard size={13} />}>{pkg.pricedFrom}</StackLine><StackLine muted>{pkg.pricedFromKind}</StackLine></StackCell>
                  </DataSheetCell>
                  <DataSheetCell><span className="packages-sheet__price pt-mono">{pkg.sellPrice}</span></DataSheetCell>
                  <DataSheetCell className="packages-sheet__action">
                    {canEdit ? <div className="packages-sheet__act">
                      <Tooltip tip="More actions">
                        <IconButton
                          className="packages-sheet__more"
                          label={`More actions for ${pkg.name}`}
                          aria-expanded={actionMenu?.id === pkg.id}
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={(event) => {
                            event.stopPropagation();
                            const rect = event.currentTarget.getBoundingClientRect();
                            setActionMenu((current) => current?.id === pkg.id ? null : {
                              id: pkg.id,
                              top: rect.bottom + 4,
                              left: Math.max(12, Math.min(window.innerWidth - 200, rect.right - 188)),
                            });
                            setFilterOpen(false);
                          }}
                        ><IconMore /></IconButton>
                      </Tooltip>
                    </div> : null}
                  </DataSheetCell>
                </DataSheetRow>
              ))}
              <DashboardDataSheetFill columns={6} />
            </DataSheet>
            {canEdit && selected.length > 0 ? (
              <ListBulkBar label={`${selected.length} package${selected.length === 1 ? "" : "s"} selected`}>
                <Button variant="brand" size="sm" onClick={() => duplicatePackages(selected)}><IconCopy />Duplicate</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelected([])}>Clear</Button>
              </ListBulkBar>
            ) : null}
            <Pagination rangeLabel={`Showing 1–${filtered.length} of ${filtered.length} packages`} page={page} pageCount={1} onPageChange={setPage} />
          </>
        )}
      </div>

      {actionMenu ? createPortal(
        <div className="packages-sheet__menu-overlay" role="presentation" onClick={() => setActionMenu(null)}>
          {packages.filter((pkg) => pkg.id === actionMenu.id).map((pkg) => (
            <div
              key={pkg.id}
              className="packages-sheet__menu"
              role="menu"
              aria-label={`Actions for ${pkg.name}`}
              style={{ top: actionMenu.top, left: actionMenu.left }}
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" role="menuitem" onClick={() => duplicatePackages([pkg.id])}><IconCopy />Duplicate as draft</button>
              <button type="button" role="menuitem" onClick={() => updatePackageStatus(pkg.id, pkg.status === "live" ? "draft" : "live")}><IconCheck />Mark {pkg.status === "live" ? "as draft" : "live"}</button>
            </div>
          ))}
        </div>,
        document.body,
      ) : null}

      {buildOpen ? (
        <div className="pt-modal-overlay" role="presentation" onClick={() => setBuildOpen(false)}>
          <div className="pt-modal package-build-modal" role="dialog" aria-modal="true" aria-labelledby="package-build-title" onClick={(event) => event.stopPropagation()}>
            <header className="pt-modal__head package-build-modal__head">
              <div>
                <h2 className="pt-modal__title" id="package-build-title">Build package</h2>
              </div>
              <IconButton label="Close build package" onClick={() => setBuildOpen(false)}><IconClose /></IconButton>
            </header>
            <div className="pt-modal__body">
              <label className="pt-mf"><span className="pt-mf__l">Package name</span><input className="pt-mf__i" autoFocus value={buildDraft.name} onChange={(event) => setBuildDraft((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Kerala family escape" /></label>
              <label className="pt-mf"><span className="pt-mf__l">Duration and route</span><input className="pt-mf__i" value={buildDraft.detail} onChange={(event) => setBuildDraft((current) => ({ ...current, detail: event.target.value }))} placeholder="e.g. 4N · Kochi–Alleppey" /></label>
              <label className="pt-mf"><span className="pt-mf__l">Package overview</span><textarea className="pt-mf__i" rows={4} maxLength={600} value={buildDraft.summary} onChange={(event) => setBuildDraft((current) => ({ ...current, summary: event.target.value }))} placeholder="Describe the journey, pace, key experiences and what can remain flexible." /></label>
              <label className="pt-mf"><span className="pt-mf__l">Sell price (optional)</span><input className="pt-mf__i" value={buildDraft.sellPrice} onChange={(event) => setBuildDraft((current) => ({ ...current, sellPrice: event.target.value }))} placeholder="e.g. ₹68,400" /></label>
            </div>
            <footer className="pt-modal__foot">
              <Button variant="brand" size="sm" onClick={() => setBuildOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" disabled={!buildDraft.name.trim()} onClick={createPackage}><IconPlus />Create and continue</Button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
