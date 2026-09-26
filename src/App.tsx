import { useEffect, useMemo, useRef, useState } from "react";
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
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import type { CheckboxState, IconName, NavGroupData, StatusTone, TabItem } from "@paryatech/ui";
import baliImage from "./assets/package-images/bali.jpg";
import dubaiImage from "./assets/package-images/dubai.jpg";
import himachalImage from "./assets/package-images/himachal.jpg";
import keralaImage from "./assets/package-images/kerala.jpg";
import rajasthanImage from "./assets/package-images/rajasthan.jpg";
import { PackageDetail } from "./PackageDetail";
import { PackageBuilder } from "./PackageBuilder";
import { BookingModule } from "./BookingModule";
import { VendorModule } from "./VendorModule";
import { searchRegions } from "./regionSearch";
import type { RegionSuggestion } from "./regionSearch";

type PackageStatus = "Published" | "Draft" | "Archived";
type PackageType =
  | "complete"
  | "accommodation"
  | "transport"
  | "activities"
  | "visa"
  | "flights"
  | "meals"
  | "guides"
  | "insurance"
  | "cruises"
  | "rail";
type ProposalStatus = "Draft" | "Shared" | "Approved";

export interface PackageRecord {
  id: string;
  name: string;
  destination: string;
  region: string;
  duration?: string;
  startingPrice?: number;
  updated: string;
  status: PackageStatus;
  packageType: PackageType;
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
    packageType: "complete",
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
    packageType: "complete",
    source: "Your catalog",
    image: baliImage,
    imagePosition: "center 62%",
  },
  {
    id: "PKG-0232",
    name: "Himachal stays",
    destination: "Himachal Pradesh, India",
    region: "North India",
    duration: "6 days · 5 nights",
    startingPrice: 62000,
    updated: "Aug 1, 2026",
    status: "Draft",
    packageType: "accommodation",
    source: "Your catalog",
    image: himachalImage,
  },
  {
    id: "PKG-0226",
    name: "Rajasthan heritage experiences",
    destination: "Rajasthan, India",
    region: "Western India",
    duration: "8 days · 7 nights",
    startingPrice: 78000,
    updated: "Jul 25, 2026",
    status: "Published",
    packageType: "activities",
    source: "Your catalog",
    image: rajasthanImage,
  },
  {
    id: "PKG-0219",
    name: "Dubai visa assistance",
    destination: "Dubai, UAE",
    region: "Middle East",
    duration: "5 days · 4 nights",
    startingPrice: 96000,
    updated: "Jul 18, 2026",
    status: "Draft",
    packageType: "visa",
    source: "Paryatech",
    image: dubaiImage,
  },
  {
    id: "PKG-0204",
    name: "Kerala private transfers",
    destination: "Kerala, India",
    region: "South India",
    duration: "6 days · 5 nights",
    startingPrice: 54000,
    updated: "Jun 30, 2026",
    status: "Archived",
    packageType: "transport",
    source: "Your catalog",
    image: keralaImage,
  },
  {
    id: "PKG-0198",
    name: "Delhi to Denpasar flight plan",
    destination: "Bali, Indonesia",
    region: "Southeast Asia",
    duration: "Return journey",
    startingPrice: 42000,
    updated: "Jun 24, 2026",
    status: "Draft",
    packageType: "flights",
    source: "Paryatech",
    image: baliImage,
    imagePosition: "center 72%",
  },
  {
    id: "PKG-0192",
    name: "Bangalore city discovery",
    destination: "Bangalore, India",
    region: "South India",
    duration: "4 days · 3 nights",
    startingPrice: 36000,
    updated: "Jun 18, 2026",
    status: "Published",
    packageType: "complete",
    source: "Your catalog",
    image: keralaImage,
    imagePosition: "center 42%",
  },
  {
    id: "PKG-0189",
    name: "Bangalore airport transfers",
    destination: "Bengaluru, Karnataka",
    region: "South India",
    duration: "Private transfer",
    startingPrice: 4800,
    updated: "Jun 12, 2026",
    status: "Draft",
    packageType: "transport",
    source: "Paryatech",
    image: keralaImage,
    imagePosition: "center 55%",
  },
];

interface ProposalRecord {
  id: string;
  name: string;
  customer: string;
  packageName: string;
  packageType: PackageType;
  destination: string;
  region: string;
  travel: string;
  value: number;
  updated: string;
  status: ProposalStatus;
}

const proposals: ProposalRecord[] = [
  { id: "PRP-1084", name: "Mehta family Bali", customer: "Ananya Mehta", packageName: "Bali Indonesia", packageType: "complete", destination: "Bali, Indonesia", region: "Southeast Asia", travel: "05–11 Nov 2026", value: 290000, updated: "Sep 25, 2026", status: "Shared" },
  { id: "PRP-1081", name: "Dubai visa support", customer: "Rohan Shah", packageName: "Dubai visa assistance", packageType: "visa", destination: "Dubai, UAE", region: "Middle East", travel: "Travel date pending", value: 18500, updated: "Sep 24, 2026", status: "Draft" },
  { id: "PRP-1076", name: "Himachal hotel plan", customer: "Ira Kapoor", packageName: "Himachal stays", packageType: "accommodation", destination: "Himachal Pradesh, India", region: "North India", travel: "18–23 Dec 2026", value: 78000, updated: "Sep 21, 2026", status: "Approved" },
  { id: "PRP-1072", name: "Bali flights for Khannas", customer: "Samar Khanna", packageName: "Delhi to Denpasar flight plan", packageType: "flights", destination: "Bali, Indonesia", region: "Southeast Asia", travel: "02–09 Jan 2027", value: 168000, updated: "Sep 19, 2026", status: "Draft" },
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
      { id: "settings", label: "Settings", tip: "Settings", icon: navIcon("settings") },
    ],
  },
];

const vendorCrmCommit = "a20fa66563cd3a7d05ca6058a5f2aaf7403f57ed";
const vendorCrmAssetRoot = `https://raw.githubusercontent.com/yakosasam797/Vendor-CRM/${vendorCrmCommit}/public/brand`;

function ParyatechBrand() {
  return (
    <>
      <img
        className="package-brand-logo package-brand-logo--full"
        src={`${vendorCrmAssetRoot}/paryatech-lockup.png`}
        alt="Paryatech"
        width={145}
        height={30}
        fetchPriority="high"
      />
      <img
        className="package-brand-logo package-brand-logo--compact"
        src={`${vendorCrmAssetRoot}/paryatech-mark.png`}
        alt="Paryatech"
        width={28}
        height={28}
        fetchPriority="high"
      />
    </>
  );
}

function StatusWithDot({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <StatusChip tone={tone}>
      <span className="package-status-dot" aria-hidden="true" />
      {children}
    </StatusChip>
  );
}

const packageTypeOptions: Array<{ value: "all" | PackageType; label: string }> = [
  { value: "all", label: "All package types" },
  { value: "complete", label: "Complete trips" },
  { value: "accommodation", label: "Accommodation" },
  { value: "transport", label: "Transport" },
  { value: "activities", label: "Activities" },
  { value: "visa", label: "Visa" },
  { value: "flights", label: "Flights" },
  { value: "meals", label: "Meals & dining" },
  { value: "guides", label: "Guides" },
  { value: "insurance", label: "Travel insurance" },
  { value: "cruises", label: "Cruises" },
  { value: "rail", label: "Rail" },
];

const regionOptions = [
  { value: "all", label: "All regions" },
  { value: "North India", label: "North India" },
  { value: "South India", label: "South India" },
  { value: "Western India", label: "Western India" },
  { value: "Central India", label: "Central India" },
  { value: "East India", label: "East India" },
  { value: "Northeast India", label: "Northeast India" },
  { value: "South Asia", label: "South Asia" },
  { value: "Southeast Asia", label: "Southeast Asia" },
  { value: "East Asia", label: "East Asia" },
  { value: "Middle East", label: "Middle East" },
  { value: "Europe", label: "Europe" },
  { value: "Africa", label: "Africa" },
  { value: "North America", label: "North America" },
  { value: "South America", label: "South America" },
  { value: "Oceania", label: "Oceania" },
];

const packageTypeLabel: Record<PackageType, string> = {
  complete: "Complete trip",
  accommodation: "Accommodation",
  transport: "Transport",
  activities: "Activities",
  visa: "Visa",
  flights: "Flights",
  meals: "Meals & dining",
  guides: "Guides",
  insurance: "Travel insurance",
  cruises: "Cruises",
  rail: "Rail",
};

const packageTypeIcon: Record<PackageType, IconName> = {
  complete: "bookings",
  accommodation: "hotel",
  transport: "bus",
  activities: "camera",
  visa: "passport",
  flights: "plane",
  meals: "ticket",
  guides: "user",
  insurance: "clipboardCheck",
  cruises: "bus",
  rail: "bus",
};

const statusTone: Record<PackageStatus, StatusTone> = {
  Published: "done",
  Draft: "open",
  Archived: "open",
};

const proposalStatusTone: Record<ProposalStatus, StatusTone> = {
  Draft: "progress",
  Shared: "open",
  Approved: "done",
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type WorkspaceModule = "packages" | "bookings" | "vendors";

function moduleFromUrl(): WorkspaceModule {
  const module = new URLSearchParams(window.location.search).get("module");
  return module === "bookings" || module === "vendors" ? module : "packages";
}

export default function App() {
  const [activeModule, setActiveModule] = useState<WorkspaceModule>(moduleFromUrl);
  const [workspaceView, setWorkspaceView] = useState<"packages" | "proposals">("packages");
  const [typeFilter, setTypeFilter] = useState<"all" | PackageType>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedSearchRegion, setSelectedSearchRegion] = useState<RegionSuggestion | null>(null);
  const [regionSuggestions, setRegionSuggestions] = useState<RegionSuggestion[]>([]);
  const [regionSearchOpen, setRegionSearchOpen] = useState(false);
  const [regionSearchLoading, setRegionSearchLoading] = useState(false);
  const [creatingPackage, setCreatingPackage] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [selectedPackage, setSelectedPackage] = useState<PackageRecord | null>(null);
  const [packageRecords, setPackageRecords] = useState<PackageRecord[]>(packages);
  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);
  const tableViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPopState = () => {
      setActiveModule(moduleFromUrl());
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    document.title = activeModule === "vendors"
      ? "Vendors · Paryatech"
      : activeModule === "bookings"
      ? "Bookings · Paryatech"
      : "Packages · Paryatech";
  }, [activeModule]);

  useEffect(() => {
    if (selectedSearchRegion || query.trim().length < 2) {
      setRegionSuggestions([]);
      setRegionSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setRegionSearchLoading(true);
      try {
        const suggestions = await searchRegions(query, controller.signal);
        setRegionSuggestions(suggestions);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setRegionSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setRegionSearchLoading(false);
      }
    }, 140);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, selectedSearchRegion]);

  useEffect(() => {
    const updatePageSize = () => {
      const tableTop = tableViewportRef.current?.getBoundingClientRect().top;
      if (tableTop == null) return;

      const compactCards = window.innerWidth < 900;
      const rowHeight = compactCards ? 336 : 80;
      const headerHeight = compactCards ? 0 : 48;
      const footerAllowance = 76;
      const available = window.innerHeight - tableTop - footerAllowance - headerHeight;
      setPageSize(Math.max(1, Math.floor(available / rowHeight)));
    };

    const frame = window.requestAnimationFrame(updatePageSize);
    window.addEventListener("resize", updatePageSize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePageSize);
    };
  }, [workspaceView, query, region, statusFilter, typeFilter]);

  const filteredPackages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const selectedTerms = selectedSearchRegion?.packageTerms.map((term) => term.toLowerCase());
    const rows = packageRecords.filter((item) => {
      const matchesType = typeFilter === "all" || item.packageType === typeFilter;
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter;
      const matchesRegion = region === "all" || item.region === region;
      const searchable = `${item.name} ${item.destination} ${item.region} ${item.id} ${packageTypeLabel[item.packageType]}`.toLowerCase();
      const matchesQuery = selectedTerms
        ? selectedTerms.some((term) => searchable.includes(term))
        : normalized.length === 0 || searchable.includes(normalized);
      return matchesType && matchesStatus && matchesRegion && matchesQuery;
    });

    return [...rows].sort((a, b) => Date.parse(b.updated) - Date.parse(a.updated));
  }, [packageRecords, query, region, selectedSearchRegion, statusFilter, typeFilter]);

  const filteredProposals = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const selectedTerms = selectedSearchRegion?.packageTerms.map((term) => term.toLowerCase());
    return proposals.filter((item) => {
      const matchesType = typeFilter === "all" || item.packageType === typeFilter;
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter;
      const matchesRegion = region === "all" || item.region === region;
      const searchable = `${item.name} ${item.customer} ${item.packageName} ${item.destination} ${item.region} ${item.id}`.toLowerCase();
      const matchesQuery = selectedTerms
        ? selectedTerms.some((term) => searchable.includes(term))
        : !normalized || searchable.includes(normalized);
      return matchesType && matchesStatus && matchesRegion && matchesQuery;
    }).sort((a, b) => Date.parse(b.updated) - Date.parse(a.updated));
  }, [query, region, selectedSearchRegion, statusFilter, typeFilter]);

  const workspaceTabs: TabItem[] = [
    { id: "packages", label: "Packages", count: packageRecords.length },
    { id: "proposals", label: "Proposals", count: proposals.length },
  ];

  const totalRecords = workspaceView === "packages" ? filteredPackages.length : filteredProposals.length;
  const totalPages = pageCountFor(totalRecords, pageSize);
  const startIndex = (page - 1) * pageSize;
  const pagedPackages = filteredPackages.slice(startIndex, startIndex + pageSize);
  const pagedProposals = filteredProposals.slice(startIndex, startIndex + pageSize);
  const visibleRecords = workspaceView === "packages" ? pagedPackages : pagedProposals;
  const visibleIds = visibleRecords.map((item) => item.id);

  useEffect(() => {
    if (page > totalPages) setPage(Math.max(1, totalPages));
  }, [page, totalPages]);

  const visibleSelectedCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && visibleSelectedCount === visibleIds.length;
  const selectionState: CheckboxState = allVisibleSelected
    ? "on"
    : visibleSelectedCount > 0
      ? "indeterminate"
      : "off";

  const toggleVisibleRows = (nextState: CheckboxState) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      visibleIds.forEach((id) => {
        if (nextState === "on") next.add(id);
        else next.delete(id);
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

  const selectModule = (module: WorkspaceModule) => {
    if (module === activeModule) {
      if (module === "packages") {
        setCreatingPackage(false);
        setSelectedPackage(null);
      }
      return;
    }
    if (module === "packages") {
      setCreatingPackage(false);
      setSelectedPackage(null);
    }
    setActiveModule(module);
    const url = new URL(window.location.href);
    if (module !== "packages") url.searchParams.set("module", module);
    else url.searchParams.delete("module");
    window.history.pushState({ module }, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const shellNavGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      active: item.id === activeModule,
      onSelect: () => {
        if (item.id === "packages") {
          selectModule("packages");
          return;
        }
        if (item.id === "bookings") {
          selectModule("bookings");
          return;
        }
        if (item.id === "vendors") {
          selectModule("vendors");
          return;
        }
        showToast(`${item.label} opened`);
      },
    })),
  }));

  const rowRequestedOpen = (event: MouseEvent<HTMLElement>) =>
    !(event.target as HTMLElement).closest("button, a, input, [role='checkbox'], [role='menu']");

  const keyboardRequestedOpen = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return false;
    if (event.key !== "Enter" && event.key !== " ") return false;
    event.preventDefault();
    return true;
  };

  const changeWorkspace = (id: string) => {
    setWorkspaceView(id as "packages" | "proposals");
    setTypeFilter("all");
    setStatusFilter("all");
    setQuery("");
    setRegion("all");
    setSelectedSearchRegion(null);
    setRegionSuggestions([]);
    setSelectedIds(new Set());
    setPage(1);
  };

  const topbarActions = (
    <>
      <IconButton label="Help and support" onClick={() => showToast("Help centre opened")}>
        <Icon name="help" size="nav" />
      </IconButton>
      <IconButton label="Notifications, unread" alert onClick={() => showToast("You’re all caught up")}>
        <Icon name="bell" size="nav" />
      </IconButton>
    </>
  );

  if (activeModule === "vendors") {
    return <VendorModule onNavigate={selectModule} />;
  }

  if (activeModule === "bookings") {
    return <BookingModule onNavigate={selectModule} />;
  }

  if (creatingPackage) {
    return (
      <AppShell
        variant="detail"
        brandName=""
        brandMark={<ParyatechBrand />}
        navGroups={shellNavGroups}
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
        brandName=""
        brandMark={<ParyatechBrand />}
        navGroups={shellNavGroups}
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
      brandName=""
      brandMark={<ParyatechBrand />}
      navGroups={shellNavGroups}
      leading={<BackButton label="Back to Sales" onClick={() => showToast("Back to Sales")} />}
      breadcrumbs={[{ label: "Sales", href: "#" }, { label: "Packages" }]}
      search={{ placeholder: "Search anything", "aria-label": "Search Paryatech" }}
      account={{ name: "Vrushabh Jain", initials: "VJ", tone: "pink" }}
      credits={{ remaining: 720, total: 1000, onUpgrade: () => showToast("Upgrade options opened") }}
      notes={packageNotes}
      actions={topbarActions}
    >
      <ListPage
        title={workspaceView === "packages" ? "Packages" : "Proposals"}
        actions={
          <>
            <Button
              variant="ghost"
              size="toolbar"
              leadingIcon={<Icon name={workspaceView === "packages" ? "bookmark" : "package"} size="sm" />}
              onClick={() => showToast(workspaceView === "packages" ? "Paryatech catalog opened" : "Package picker opened")}
            >
              {workspaceView === "packages" ? "From Paryatech" : "Create from package"}
            </Button>
            <Button
              variant="primary"
              size="toolbar"
              leadingIcon={<Icon name="plus" size="sm" />}
              onClick={() => workspaceView === "packages" ? setCreatingPackage(true) : showToast("New proposal opened")}
            >
              {workspaceView === "packages" ? "New package" : "New proposal"}
            </Button>
          </>
        }
        tabs={workspaceTabs}
        tabValue={workspaceView}
        onTabChange={changeWorkspace}
        toolbar={
          <div className="package-list-controls">
            <SheetToolbar
              search={
                <div className="package-region-search">
                  <SearchField
                    fullWidth
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setSelectedSearchRegion(null);
                      setRegionSearchOpen(true);
                      setPage(1);
                    }}
                    onFocus={() => setRegionSearchOpen(true)}
                    onBlur={() => window.setTimeout(() => setRegionSearchOpen(false), 120)}
                    placeholder={workspaceView === "packages" ? "Search packages or regions" : "Search proposals, customers or regions"}
                    aria-label={workspaceView === "packages" ? "Search packages or regions" : "Search proposals, customers or regions"}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={regionSearchOpen && query.trim().length >= 2}
                    aria-controls="package-region-suggestions"
                  />
                  {regionSearchOpen && query.trim().length >= 2 ? (
                    <div className="package-region-search__menu" id="package-region-suggestions" role="listbox" aria-label="Suggested regions">
                      {regionSearchLoading ? (
                        <div className="package-region-search__state" role="status">Searching regions…</div>
                      ) : regionSuggestions.length > 0 ? (
                        <>
                          <div className="package-region-search__label">Suggested regions</div>
                          {regionSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              type="button"
                              role="option"
                              aria-selected={selectedSearchRegion?.id === suggestion.id}
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => {
                                setQuery(suggestion.label);
                                setSelectedSearchRegion(suggestion);
                                setRegionSearchOpen(false);
                                setRegionSuggestions([]);
                                setPage(1);
                              }}
                            >
                              <span className="package-region-search__pin"><Icon name="pin" size="sm" /></span>
                              <span>
                                <strong>{suggestion.label}</strong>
                                <small>{suggestion.country} · {suggestion.group}</small>
                              </span>
                              <span className="package-region-search__select">Show packages</span>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="package-region-search__state">No matching regions. Package names are still searched.</div>
                      )}
                    </div>
                  ) : null}
                </div>
              }
              filters={
                <>
                  <FilterSelect
                    label="Package type"
                    value={typeFilter}
                    onChange={(value) => {
                      setTypeFilter(value as "all" | PackageType);
                      setPage(1);
                      setSelectedIds(new Set());
                    }}
                    options={packageTypeOptions}
                  />
                  <FilterSelect
                    label="Region"
                    value={region}
                    onChange={(value) => {
                      setRegion(value);
                      setPage(1);
                    }}
                    options={regionOptions}
                  />
                  <FilterSelect
                    label="Status"
                    value={statusFilter}
                    onChange={(value) => { setStatusFilter(value); setPage(1); }}
                    options={workspaceView === "packages" ? [
                      { value: "all", label: "All statuses" },
                      { value: "published", label: "Published" },
                      { value: "draft", label: "Draft" },
                      { value: "archived", label: "Archived" },
                    ] : [
                      { value: "all", label: "All statuses" },
                      { value: "draft", label: "Draft" },
                      { value: "shared", label: "Shared" },
                      { value: "approved", label: "Approved" },
                    ]}
                  />
                </>
              }
            />
          </div>
        }
        footer={
          totalRecords > 0 ? (
            <Pagination
              rangeLabel={rangeLabel(page, pageSize, totalRecords)}
              page={page}
              pageCount={totalPages}
              onPageChange={setPage}
            />
          ) : undefined
        }
        bulk={
          selectedIds.size > 0 ? (
            <ListBulkBar label={`${selectedIds.size} ${selectedIds.size === 1 ? workspaceView.slice(0, -1) : workspaceView} selected`}>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                Clear selection
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={() =>
                  showToast(
                    `${selectedIds.size} ${selectedIds.size === 1 ? workspaceView.slice(0, -1) : workspaceView} ready for bulk action`,
                  )
                }
              >
                {workspaceView === "packages" ? "Archive" : "Export"}
              </Button>
            </ListBulkBar>
          ) : undefined
        }
      >
        <div className="package-table-viewport" ref={tableViewportRef}>
        {workspaceView === "packages" ? (filteredPackages.length > 0 ? (
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
              <DataSheetCell>Package type</DataSheetCell>
              <DataSheetCell>Destination</DataSheetCell>
              <DataSheetCell>Duration</DataSheetCell>
              <DataSheetCell>Starting from</DataSheetCell>
              <DataSheetCell>Last updated</DataSheetCell>
              <DataSheetCell>Status</DataSheetCell>
              <DataSheetCell>Action</DataSheetCell>
            </DataSheetHeader>
            {pagedPackages.map((item) => (
              <DataSheetRow
                key={item.id}
                className={`package-data-row${selectedIds.has(item.id) ? " packages-sheet__row--selected" : ""}`}
                role="link"
                tabIndex={0}
                aria-label={`Open ${item.name}`}
                onClick={(event) => {
                  if (rowRequestedOpen(event)) setSelectedPackage(item);
                }}
                onKeyDown={(event) => {
                  if (keyboardRequestedOpen(event)) setSelectedPackage(item);
                }}
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
                          width={40}
                          height={40}
                          loading="lazy"
                          decoding="async"
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
                  <StackLine icon={<Icon name={packageTypeIcon[item.packageType]} size="sm" />}>
                    {packageTypeLabel[item.packageType]}
                  </StackLine>
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
                  <StatusWithDot tone={statusTone[item.status]}>{item.status}</StatusWithDot>
                </DataSheetCell>
                <DataSheetCell className="package-row-actions-cell">
                  <RowActions className="package-row-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label={`More actions for ${item.name}`}
                      aria-haspopup="menu"
                      aria-expanded={openRowMenu === item.id}
                      leadingIcon={<Icon name="more" size={15} />}
                      onClick={() => setOpenRowMenu((current) => current === item.id ? null : item.id)}
                    />
                    {openRowMenu === item.id ? (
                      <div className="package-row-menu" role="menu" aria-label={`Actions for ${item.name}`}>
                        <button type="button" role="menuitem" onClick={() => { setOpenRowMenu(null); setSelectedPackage(item); }}>
                          <Icon name="openExternal" size="sm" /> Open package
                        </button>
                        <button type="button" role="menuitem" onClick={() => { setOpenRowMenu(null); showToast(`${item.name} duplicated as a draft`); }}>
                          <Icon name="copy" size="sm" /> Duplicate
                        </button>
                        <button type="button" role="menuitem" onClick={() => { setOpenRowMenu(null); setPackageRecords((current) => current.map((record) => record.id === item.id ? { ...record, status: "Archived" } : record)); showToast(`${item.name} archived`); }}>
                          <Icon name="fileMinus" size="sm" /> Archive
                        </button>
                      </div>
                    ) : null}
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
                setSelectedSearchRegion(null);
                setRegion("all");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )) : (filteredProposals.length > 0 ? (
          <DataSheet className="proposals-sheet" aria-label="Proposal workspace">
            <DataSheetHeader>
              <DataSheetCell check>
                <Checkbox
                  state={selectionState}
                  onCheckedChange={toggleVisibleRows}
                  label={allVisibleSelected ? "Deselect all visible proposals" : "Select all visible proposals"}
                />
              </DataSheetCell>
              <DataSheetCell>Proposal</DataSheetCell>
              <DataSheetCell>Customer</DataSheetCell>
              <DataSheetCell>Package type</DataSheetCell>
              <DataSheetCell>Travel</DataSheetCell>
              <DataSheetCell>Value</DataSheetCell>
              <DataSheetCell>Last updated</DataSheetCell>
              <DataSheetCell>Status</DataSheetCell>
              <DataSheetCell>Action</DataSheetCell>
            </DataSheetHeader>
            {pagedProposals.map((item) => (
              <DataSheetRow
                key={item.id}
                className={`package-data-row${selectedIds.has(item.id) ? " packages-sheet__row--selected" : ""}`}
                role="link"
                tabIndex={0}
                aria-label={`Open ${item.name}`}
                onClick={(event) => {
                  if (rowRequestedOpen(event)) showToast(`${item.name} opened`);
                }}
                onKeyDown={(event) => {
                  if (keyboardRequestedOpen(event)) showToast(`${item.name} opened`);
                }}
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
                    icon={<span className="proposal-record-icon"><Icon name="fileText" size="sm" /></span>}
                    title={item.name}
                    subtitle={item.id}
                  />
                </DataSheetCell>
                <DataSheetCell>
                  <StackCell><StackLine>{item.customer}</StackLine><StackLine muted>{item.packageName}</StackLine></StackCell>
                </DataSheetCell>
                <DataSheetCell>
                  <StackLine icon={<Icon name={packageTypeIcon[item.packageType]} size="sm" />}>{packageTypeLabel[item.packageType]}</StackLine>
                </DataSheetCell>
                <DataSheetCell>
                  <StackCell><StackLine icon={<Icon name="calendar" size="sm" />}>{item.travel}</StackLine><StackLine muted>{item.destination}</StackLine></StackCell>
                </DataSheetCell>
                <DataSheetCell><MoneyCell amount={money.format(item.value)} /></DataSheetCell>
                <DataSheetCell><StackCell><StackLine>{item.updated}</StackLine><StackLine muted>by Vrushabh Jain</StackLine></StackCell></DataSheetCell>
                <DataSheetCell><StatusWithDot tone={proposalStatusTone[item.status]}>{item.status}</StatusWithDot></DataSheetCell>
                <DataSheetCell className="package-row-actions-cell">
                  <RowActions className="package-row-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label={`More actions for ${item.name}`}
                      aria-haspopup="menu"
                      aria-expanded={openRowMenu === item.id}
                      leadingIcon={<Icon name="more" size={15} />}
                      onClick={() => setOpenRowMenu((current) => current === item.id ? null : item.id)}
                    />
                    {openRowMenu === item.id ? (
                      <div className="package-row-menu" role="menu" aria-label={`Actions for ${item.name}`}>
                        <button type="button" role="menuitem" onClick={() => { setOpenRowMenu(null); showToast(`${item.name} opened`); }}>
                          <Icon name="openExternal" size="sm" /> Open proposal
                        </button>
                        <button type="button" role="menuitem" onClick={() => { setOpenRowMenu(null); showToast(`${item.name} duplicated`); }}>
                          <Icon name="copy" size="sm" /> Duplicate
                        </button>
                        <button type="button" role="menuitem" onClick={() => { setOpenRowMenu(null); showToast(`${item.name} exported`); }}>
                          <Icon name="export" size="sm" /> Export
                        </button>
                      </div>
                    ) : null}
                  </RowActions>
                </DataSheetCell>
              </DataSheetRow>
            ))}
          </DataSheet>
        ) : (
          <div className="package-empty">
            <span className="package-empty__icon"><Icon name="fileText" size="lg" /></span>
            <h2>No proposals found</h2>
            <p>Try another package type, status, region or search.</p>
            <Button variant="primary" size="sm" onClick={() => { setQuery(""); setSelectedSearchRegion(null); setRegion("all"); setTypeFilter("all"); setStatusFilter("all"); }}>Clear filters</Button>
          </div>
        ))}
        </div>
      </ListPage>

      <div className={`package-toast ${toast ? "package-toast--show" : ""}`} role="status" aria-live="polite">
        <Icon name="checkCircle" size="sm" />
        {toast}
      </div>
    </AppShell>
  );
}
