import { useMemo, useState } from "react";
import {
  AppShell,
  BackButton,
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  FilterSelect,
  Icon,
  IconButton,
  LeadCell,
  ListBulkBar,
  ListPage,
  MoneyCell,
  Pagination,
  RowActions,
  SearchField,
  SheetToolbar,
  StackCell,
  StackLine,
  StatusChip,
  pageCountFor,
  rangeLabel,
} from "@paryatech/ui";
import type { CheckboxState, IconName, NavGroupData, StatusTone, TabItem } from "@paryatech/ui";
import baliImage from "./assets/package-images/bali.jpg";
import dubaiImage from "./assets/package-images/dubai.jpg";
import himachalImage from "./assets/package-images/himachal.jpg";
import keralaImage from "./assets/package-images/kerala.jpg";
import rajasthanImage from "./assets/package-images/rajasthan.jpg";
import { PackageDetail } from "./PackageDetail";
import { PackageBuilder } from "./PackageBuilder";

type PackageStatus = "Published" | "Draft" | "Archived";

export interface PackageRecord {
  id: string;
  name: string;
  destination: string;
  region: string;
  duration?: string;
  startingPrice?: number;
  updated: string;
  status: PackageStatus;
  source: "Your catalog" | "Paryatech";
  image: string;
  imagePosition?: string;
  highlights?: string[];
}

const packages: PackageRecord[] = [
  {
    id: "PKG-0241",
    name: "Bali Indonesia",
    destination: "Bali, Indonesia",
    region: "Southeast Asia",
    duration: "7 days · 6 nights",
    startingPrice: 145000,
    updated: "Aug 14, 2026",
    status: "Published",
    source: "Your catalog",
    image: baliImage,
  },
  {
    id: "PKG-0238",
    name: "Bali Honeymoon",
    destination: "Bali, Indonesia",
    region: "Southeast Asia",
    duration: "7 days · 6 nights",
    startingPrice: 145000,
    updated: "Aug 4, 2026",
    status: "Draft",
    source: "Your catalog",
    image: baliImage,
    imagePosition: "center 62%",
  },
  {
    id: "PKG-0232",
    name: "Delight Himachal",
    destination: "Himachal Pradesh, India",
    region: "North India",
    duration: "6 days · 5 nights",
    startingPrice: 62000,
    updated: "Aug 1, 2026",
    status: "Draft",
    source: "Your catalog",
    image: himachalImage,
  },
  {
    id: "PKG-0226",
    name: "Rajasthan Heritage Trail",
    destination: "Rajasthan, India",
    region: "Western India",
    duration: "8 days · 7 nights",
    startingPrice: 78000,
    updated: "Jul 25, 2026",
    status: "Draft",
    source: "Your catalog",
    image: rajasthanImage,
  },
  {
    id: "PKG-0219",
    name: "Dubai City Break",
    destination: "Dubai, UAE",
    region: "Middle East",
    duration: "5 days · 4 nights",
    startingPrice: 96000,
    updated: "Jul 18, 2026",
    status: "Draft",
    source: "Paryatech",
    image: dubaiImage,
  },
  {
    id: "PKG-0204",
    name: "Kerala Slow Escape",
    destination: "Kerala, India",
    region: "South India",
    duration: "6 days · 5 nights",
    startingPrice: 54000,
    updated: "Jun 30, 2026",
    status: "Archived",
    source: "Your catalog",
    image: keralaImage,
  },
];

const navIcon = (name: IconName) => <Icon name={name} size="nav" />;

const navGroups: NavGroupData[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "home", label: "Home", tip: "Home", icon: navIcon("layoutGrid") },
      { id: "inbox", label: "All inbox", tip: "All inbox", icon: navIcon("inbox") },
      { id: "news", label: "News", tip: "News", icon: navIcon("news") },
      { id: "tasks", label: "All tasks", tip: "All tasks", badge: 4, icon: navIcon("tasksNav") },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    items: [
      { id: "queries", label: "Queries", tip: "Queries", icon: navIcon("fileText2") },
      { id: "packages", label: "Packages", tip: "Packages", active: true, icon: navIcon("package") },
      { id: "bookings", label: "Bookings", tip: "Bookings", icon: navIcon("bookings") },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    items: [
      { id: "customers", label: "Customers", tip: "Customers", icon: navIcon("customers") },
      { id: "vendors", label: "Vendors", tip: "Vendors", icon: navIcon("vendors") },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { id: "finances", label: "All finances", tip: "All finances", icon: navIcon("finances") },
      { id: "team", label: "Team", tip: "Team", icon: navIcon("team") },
      { id: "automations", label: "Automations", tip: "Automations", icon: navIcon("zap") },
      { id: "reports", label: "Reports", tip: "Reports", icon: navIcon("chart") },
    ],
  },
];

const tabs: TabItem[] = [
  { id: "all", label: "All", count: 6 },
  { id: "published", label: "Published", count: 1 },
  { id: "draft", label: "Draft", count: 4 },
  { id: "archived", label: "Archived", count: 1 },
];

const statusTone: Record<PackageStatus, StatusTone> = {
  Published: "done",
  Draft: "progress",
  Archived: "open",
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function App() {
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [sort, setSort] = useState("updated");
  const [page, setPage] = useState(1);
  const [creatingPackage, setCreatingPackage] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [selectedPackage, setSelectedPackage] = useState<PackageRecord | null>(null);
  const [packageRecords, setPackageRecords] = useState<PackageRecord[]>(packages);

  const filteredPackages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const rows = packageRecords.filter((item) => {
      const matchesTab = activeTab === "all" || item.status.toLowerCase() === activeTab;
      const matchesRegion = region === "all" || item.region === region;
      const matchesQuery =
        normalized.length === 0 ||
        `${item.name} ${item.destination} ${item.region} ${item.id}`.toLowerCase().includes(normalized);
      return matchesTab && matchesRegion && matchesQuery;
    });

    return [...rows].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "price") return (b.startingPrice ?? 0) - (a.startingPrice ?? 0);
      return packageRecords.indexOf(a) - packageRecords.indexOf(b);
    });
  }, [activeTab, packageRecords, query, region, sort]);

  const listTabs = useMemo(() => tabs.map((item) => ({
    ...item,
    count: item.id === "all" ? packageRecords.length : packageRecords.filter((record) => record.status.toLowerCase() === item.id).length,
  })), [packageRecords]);

  const visibleSelectedCount = filteredPackages.filter((item) => selectedIds.has(item.id)).length;
  const allVisibleSelected = filteredPackages.length > 0 && visibleSelectedCount === filteredPackages.length;
  const selectionState: CheckboxState = allVisibleSelected
    ? "on"
    : visibleSelectedCount > 0
      ? "indeterminate"
      : "off";

  const toggleVisibleRows = (nextState: CheckboxState) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      filteredPackages.forEach((item) => {
        if (nextState === "on") next.add(item.id);
        else next.delete(item.id);
      });
      return next;
    });
  };

  const toggleRow = (id: string, nextState: CheckboxState) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (nextState === "on") next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const clearAndSetTab = (id: string) => {
    setActiveTab(id);
    setPage(1);
  };

  const topbarActions = (
    <>
      <IconButton label="Settings" onClick={() => showToast("Settings opened")}>
        <Icon name="settings" size="nav" />
      </IconButton>
      <IconButton label="Help and support" onClick={() => showToast("Help centre opened")}>
        <Icon name="help" size="nav" />
      </IconButton>
      <IconButton label="Notifications, unread" alert onClick={() => showToast("You’re all caught up")}>
        <Icon name="bell" size="nav" />
      </IconButton>
    </>
  );

  if (creatingPackage) {
    return (
      <AppShell
        variant="detail"
        navGroups={navGroups}
        breadcrumbs={[{ label: "Sales", href: "#" }, { label: "Packages", href: "#" }, { label: "New package" }]}
        onBack={() => setCreatingPackage(false)}
        backLabel="Back to packages"
        search={{ placeholder: "Search anything", "aria-label": "Search Paryatech" }}
        account={{ name: "Vrushabh Jain", initials: "VJ", tone: "pink" }}
        credits={{ remaining: 720, total: 1000, onUpgrade: () => showToast("Upgrade options opened") }}
        notes={{ label: "Package notes", badge: 0, onOpen: () => showToast("Package notes opened"), onAdd: () => showToast("New note opened") }}
        actions={topbarActions}
      >
        <PackageBuilder
          onCancel={() => setCreatingPackage(false)}
          onToast={showToast}
          onComplete={(record) => {
            setPackageRecords((current) => [record, ...current]);
            setCreatingPackage(false);
            setSelectedPackage(record);
            showToast("Draft package created");
          }}
        />
        <div className={`package-toast package-toast--builder ${toast ? "package-toast--show" : ""}`} role="status" aria-live="polite">
          <Icon name="checkCircle" size="sm" />
          {toast}
        </div>
      </AppShell>
    );
  }

  const packageNotes = {
    label: "Package notes",
    badge: 3,
    onOpen: () => showToast("Package notes opened"),
    onAdd: () => showToast("New note opened"),
  };

  if (selectedPackage) {
    return (
      <AppShell
        variant="detail"
        navGroups={navGroups}
        breadcrumbs={[
          { label: "Sales", href: "#" },
          { label: "Packages", href: "#" },
          { label: selectedPackage.name },
        ]}
        onBack={() => setSelectedPackage(null)}
        backLabel="Back to packages"
        search={{ placeholder: "Search anything", "aria-label": "Search Paryatech" }}
        account={{ name: "Vrushabh Jain", initials: "VJ", tone: "pink" }}
        credits={{ remaining: 720, total: 1000, onUpgrade: () => showToast("Upgrade options opened") }}
        notes={packageNotes}
        actions={topbarActions}
      >
        <PackageDetail record={selectedPackage} onToast={showToast} />
        <div className={`package-toast ${toast ? "package-toast--show" : ""}`} role="status" aria-live="polite">
          <Icon name="checkCircle" size="sm" />
          {toast}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      variant="detail"
      navGroups={navGroups}
      leading={<BackButton label="Back to Sales" onClick={() => showToast("Back to Sales")} />}
      breadcrumbs={[{ label: "Sales", href: "#" }, { label: "Packages" }]}
      search={{ placeholder: "Search anything", "aria-label": "Search Paryatech" }}
      account={{ name: "Vrushabh Jain", initials: "VJ", tone: "pink" }}
      credits={{ remaining: 720, total: 1000, onUpgrade: () => showToast("Upgrade options opened") }}
      notes={packageNotes}
      actions={topbarActions}
    >
      <ListPage
        title="Packages"
        actions={
          <>
            <Button
              variant="ghost"
              size="toolbar"
              leadingIcon={<Icon name="fileText" size="sm" />}
              onClick={() => showToast("Proposal workspace opened")}
            >
              Proposals
            </Button>
            <Button
              variant="ghost"
              size="toolbar"
              leadingIcon={<Icon name="bookmark" size="sm" />}
              onClick={() => showToast("Paryatech catalog opened")}
            >
              From Paryatech
            </Button>
            <Button
              variant="primary"
              size="toolbar"
              leadingIcon={<Icon name="plus" size="sm" />}
              onClick={() => setCreatingPackage(true)}
            >
              New package
            </Button>
          </>
        }
        tabs={listTabs}
        tabValue={activeTab}
        onTabChange={clearAndSetTab}
        toolbar={
          <SheetToolbar
            search={
              <SearchField
                fullWidth
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search packages"
                aria-label="Search packages"
              />
            }
            filters={
              <>
                <FilterSelect
                  label="Region"
                  value={region}
                  onChange={(value) => {
                    setRegion(value);
                    setPage(1);
                  }}
                  options={[
                    { value: "all", label: "All regions" },
                    { value: "Southeast Asia", label: "Southeast Asia" },
                    { value: "North India", label: "North India" },
                    { value: "Western India", label: "Western India" },
                    { value: "South India", label: "South India" },
                    { value: "Middle East", label: "Middle East" },
                  ]}
                />
                <FilterSelect
                  label="Sort"
                  value={sort}
                  onChange={setSort}
                  options={[
                    { value: "updated", label: "Recently updated" },
                    { value: "name", label: "Package name" },
                    { value: "price", label: "Highest price" },
                  ]}
                />
              </>
            }
            actions={<span className="package-result-count">{filteredPackages.length} packages</span>}
          />
        }
        footer={
          filteredPackages.length > 0 ? (
            <Pagination
              rangeLabel={rangeLabel(page, 10, filteredPackages.length)}
              page={page}
              pageCount={pageCountFor(filteredPackages.length, 10)}
              onPageChange={setPage}
            />
          ) : undefined
        }
        bulk={
          selectedIds.size > 0 ? (
            <ListBulkBar label={`${selectedIds.size} ${selectedIds.size === 1 ? "package" : "packages"} selected`}>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                Clear selection
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={() =>
                  showToast(
                    `${selectedIds.size} ${selectedIds.size === 1 ? "package" : "packages"} ready to archive`,
                  )
                }
              >
                Archive
              </Button>
            </ListBulkBar>
          ) : undefined
        }
      >
        {filteredPackages.length > 0 ? (
          <DataSheet className="packages-sheet" aria-label="Package catalog">
            <DataSheetHeader>
              <DataSheetCell check>
                <Checkbox
                  state={selectionState}
                  onCheckedChange={toggleVisibleRows}
                  label={allVisibleSelected ? "Deselect all visible packages" : "Select all visible packages"}
                />
              </DataSheetCell>
              <DataSheetCell>Package</DataSheetCell>
              <DataSheetCell>Destination</DataSheetCell>
              <DataSheetCell>Duration</DataSheetCell>
              <DataSheetCell>Starting from</DataSheetCell>
              <DataSheetCell>Last updated</DataSheetCell>
              <DataSheetCell>Status</DataSheetCell>
              <DataSheetCell aria-label="Actions" />
            </DataSheetHeader>
            {filteredPackages.map((item) => (
              <DataSheetRow
                key={item.id}
                className={selectedIds.has(item.id) ? "packages-sheet__row--selected" : ""}
              >
                <DataSheetCell check>
                  <Checkbox
                    state={selectedIds.has(item.id) ? "on" : "off"}
                    onCheckedChange={(nextState) => toggleRow(item.id, nextState)}
                    label={`Select ${item.name}`}
                  />
                </DataSheetCell>
                <DataSheetCell>
                  <LeadCell
                    icon={
                      <span className="package-thumbnail-wrap">
                        <img
                          className="package-thumbnail"
                          src={item.image}
                          alt=""
                          style={{ objectPosition: item.imagePosition }}
                        />
                        {item.source === "Paryatech" ? (
                          <span className="package-thumbnail__source" aria-label="From Paryatech">
                            <Icon name="package" size="2xs" />
                          </span>
                        ) : null}
                      </span>
                    }
                    title={item.name}
                    subtitle={item.id}
                  />
                </DataSheetCell>
                <DataSheetCell>
                  <StackCell>
                    <StackLine icon={<Icon name="pin" size="sm" />}>{item.destination}</StackLine>
                    <StackLine muted>{item.region}</StackLine>
                  </StackCell>
                </DataSheetCell>
                <DataSheetCell>
                  <StackLine icon={<Icon name="calendar" size="sm" />} muted>
                    {item.duration ?? "Add duration"}
                  </StackLine>
                </DataSheetCell>
                <DataSheetCell>
                  {item.startingPrice ? <MoneyCell amount={money.format(item.startingPrice)} /> : <span className="pt-muted">Not set</span>}
                </DataSheetCell>
                <DataSheetCell>
                  <StackCell>
                    <StackLine>{item.updated}</StackLine>
                    <StackLine muted>by Vrushabh Jain</StackLine>
                  </StackCell>
                </DataSheetCell>
                <DataSheetCell>
                  <StatusChip tone={statusTone[item.status]}>{item.status}</StatusChip>
                </DataSheetCell>
                <DataSheetCell>
                  <RowActions>
                    <Button
                      variant="brand"
                      size="sm"
                      leadingIcon={<Icon name="openExternal" size="sm" />}
                      onClick={() => setSelectedPackage(item)}
                    >
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label={`More actions for ${item.name}`}
                      leadingIcon={<Icon name="more" size={15} />}
                      onClick={() => showToast(`More actions for ${item.name}`)}
                    />
                  </RowActions>
                </DataSheetCell>
              </DataSheetRow>
            ))}
          </DataSheet>
        ) : (
          <div className="package-empty">
            <span className="package-empty__icon"><Icon name="package" size="lg" /></span>
            <h2>No packages found</h2>
            <p>Try a different search or clear the current filters.</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setQuery("");
                setRegion("all");
                setActiveTab("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </ListPage>

      <div className={`package-toast ${toast ? "package-toast--show" : ""}`} role="status" aria-live="polite">
        <Icon name="checkCircle" size="sm" />
        {toast}
      </div>
    </AppShell>
  );
}
