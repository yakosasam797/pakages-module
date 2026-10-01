import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  Modal,
  MoneyCell,
  Pagination,
  RowActions,
  SearchField,
  SheetToolbar,
  StackCell,
  StackLine,
  StatusChip,
  Tooltip,
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
import { PackageDetail, packageDaysForProposal } from "./PackageDetail";
import { ProposalDetail } from "./ProposalDetail";
import { ProposalBuilder } from "./ProposalBuilder";
import { PackageBuilder } from "./PackageBuilder";
import { BookingModule } from "./BookingModule";
import { recordActivityBookingHandoff } from "./bookingActivityHandoff";
import { recordTransportBookingHandoff } from "./bookingTransportHandoff";
import { FinanceModule } from "./FinanceModule";
import type { EmbeddedModuleHandle } from "./embeddedModuleFrame";
import { VendorModule } from "./VendorModule";
import { DestinationPage } from "./DestinationPage";
import { WorkspaceNotes } from "./WorkspaceNotes";
import { searchRegions } from "./regionSearch";
import type { RegionSuggestion } from "./regionSearch";
import type { ItineraryMode, ProposalQueryContext, ProposalRecord, ProposalStatus } from "./proposalModel";
import { formatProposalTravel, itineraryCosting } from "./proposalModel";
import { freezeActivityPricing, freezePrivateTransportPricing } from "./serviceCosting";
import type { StepNavigationHandle, StepNavigationSnapshot } from "./useStepNavigation";

export type { ProposalRecord } from "./proposalModel";

type PackageStatus = "Published" | "Draft" | "Archived";

export interface PackageRecord {
  id: string;
  name: string;
  destination: string;
  region: string;
  duration?: string;
  startingPrice?: number;
  priceBasis?: string;
  itineraryMode?: ItineraryMode;
  departureType?: "flexible" | "fixed";
  fixedStart?: string;
  fixedEnd?: string;
  inclusions?: string;
  exclusions?: string;
  importantNotes?: string;
  paymentTerms?: string;
  cancellationPolicy?: string;
  otherTerms?: string;
  markupPercent?: number;
  updated: string;
  status: PackageStatus;
  source: "Your catalog" | "Paryatech";
  image: string;
  imagePosition?: string;
  highlights?: string[];
  proposalDays?: ProposalRecord["days"];
  createdFromProposal?: boolean;
  templateId?: string;
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
    name: "Himachal stays",
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
    name: "Rajasthan heritage experiences",
    destination: "Rajasthan, India",
    region: "Western India",
    duration: "8 days · 7 nights",
    startingPrice: 78000,
    updated: "Jul 25, 2026",
    status: "Published",
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
    source: "Paryatech",
    image: keralaImage,
    imagePosition: "center 55%",
  },
];

const linkedQueries: Record<string, ProposalQueryContext> = {
  "QRY-2042": { id: "QRY-2042", customer: "Aditi Sharma", customerEmail: "aditi.sharma@example.com", destination: "Rajasthan, India", region: "Western India", travelStart: "2027-01-14", travelEnd: "2027-01-21", adults: 2, children: 0, requirements: "Heritage stays, a relaxed Jaipur day and private transfers." },
  "QRY-2038": { id: "QRY-2038", customer: "Devika Menon", customerEmail: "devika.menon@example.com", destination: "Kerala, India", region: "South India", travelStart: "2027-02-08", travelEnd: "2027-02-10", adults: 2, children: 1, requirements: "A gentle first visit with time in Kochi and the backwaters." },
  "QRY-2029": { id: "QRY-2029", customer: "Ananya Mehta", customerEmail: "ananya.mehta@example.com", destination: "Bali, Indonesia", region: "Southeast Asia", adults: 2, children: 1, requirements: "A relaxed family pace, private airport transfers, cultural experiences and two comfortable stays." },
  "QRY-2018": { id: "QRY-2018", customer: "Ira Kapoor", customerEmail: "ira.kapoor@example.com", destination: "Himachal Pradesh, India", region: "North India", adults: 4, children: 0, requirements: "Mountain views, a comfortable hotel in each stop, private car and light sightseeing." },
};

const proposals: ProposalRecord[] = [
  { id: "PRP-1092", name: "Sharma Rajasthan journey", customer: "Aditi Sharma", customerEmail: "aditi.sharma@example.com", queryId: "QRY-2042", sourcePackageId: packages[3].id, packageName: packages[3].name, itineraryMode: "advanced", sharingMode: "priced", version: 2, acceptedVersion: 2, destination: packages[3].destination, region: packages[3].region, travel: "14–21 Jan 2027", travelStart: "2027-01-14", travelEnd: "2027-01-21", travellers: "2 adults", requirements: "Heritage stays, a relaxed Jaipur day and private transfers.", note: "A comfortable Rajasthan route with time for local experiences.", days: packageDaysForProposal(packages[3]), value: 184000, updated: "Sep 28, 2026", status: "Approved" },
  { id: "PRP-1090", name: "Fernandes Bali escape", customer: "Maya Fernandes", customerEmail: "maya.fernandes@example.com", sourcePackageId: packages[1].id, packageName: packages[1].name, itineraryMode: "advanced", sharingMode: "priced", version: 1, acceptedVersion: 1, destination: packages[1].destination, region: packages[1].region, travel: "09–15 Mar 2027", travelStart: "2027-03-09", travelEnd: "2027-03-15", travellers: "2 adults", requirements: "A quiet beach stay with private experiences.", note: "A relaxed Bali escape adapted from the honeymoon package.", days: packageDaysForProposal(packages[1]), value: 298000, updated: "Sep 28, 2026", status: "Approved" },
  { id: "PRP-1088", name: "Menon family Kerala", customer: "Devika Menon", customerEmail: "devika.menon@example.com", queryId: "QRY-2038", packageName: "Custom itinerary", itineraryMode: "simple", sharingMode: "itinerary", version: 1, destination: "Kerala, India", region: "South India", travel: "08–10 Feb 2027", travelStart: "2027-02-08", travelEnd: "2027-02-10", travellers: "2 adults · 1 child", requirements: "A gentle first visit with time in Kochi and the backwaters.", note: "A short Kerala journey to review together before choosing the final stays.", inclusions: "Private airport pickup; accommodation basis to confirm.", exclusions: "Flights; personal expenses.", days: [
    { id: "menon-day-1", title: "Arrive in Kochi", place: "Kochi", description: "Arrive in Kochi and meet your private transfer. Settle in, then spend the evening at your own pace.", highlights: ["Easy arrival", "Evening at leisure"], services: [{ id: "menon-transfer", kind: "transfer", title: "Kochi airport transfer", detail: "Private vehicle, timing to follow flight confirmation.", priceState: "unpriced", routeFrom: "Kochi airport", routeTo: "Kochi stay", vehicleType: "SUV", vehicleCapacity: 4 }] },
    { id: "menon-day-2", title: "Kochi & the backwaters", place: "Kochi", description: "Discover the old harbour and local streets before an unhurried afternoon near the backwaters.", highlights: ["Fort Kochi walk", "Backwater views"], services: [] },
    { id: "menon-day-3", title: "Departure", place: "Kochi", description: "Enjoy breakfast and transfer onward. The final departure time will follow the booked service.", highlights: [], services: [] },
  ], value: 0, updated: "Sep 27, 2026", status: "Itinerary shared" },
  { id: "PRP-1087", name: "Rao family Bali", customer: "Nisha Rao", customerEmail: "nisha.rao@example.com", sourcePackageId: packages[0].id, packageName: packages[0].name, itineraryMode: "advanced", version: 1, destination: packages[0].destination, region: packages[0].region, travel: "12–17 Jan 2027", travelStart: "2027-01-12", travelEnd: "2027-01-17", travellers: "4 adults", requirements: "A family-paced route with more time in Ubud, two rooms and private transport.", note: "Bali at a gentler pace, tailored for the Rao family.", days: packageDaysForProposal(packages[0]).map((day) => ({ ...day, services: day.services.map((service) => ({ ...service, rooms: service.kind === "stay" ? 2 : service.rooms })) })), value: 360000, updated: "Sep 26, 2026", status: "Draft" },
  { id: "PRP-1084", name: "Mehta family Bali", customer: "Ananya Mehta", customerEmail: "ananya.mehta@example.com", queryId: "QRY-2029", sourcePackageId: packages[0].id, packageName: packages[0].name, sharingMode: "priced", destination: packages[0].destination, region: packages[0].region, travel: "05–10 Nov 2026", travellers: "2 adults · 1 child", requirements: "A relaxed family pace, private airport transfers, cultural experiences and two comfortable stays.", note: "We've balanced guided days with time to explore Bali together.", days: packageDaysForProposal(packages[0]), value: 290000, updated: "Sep 25, 2026", status: "Itinerary shared" },
  { id: "PRP-1081", name: "Shah family Dubai", customer: "Rohan Shah", customerEmail: "rohan.shah@example.com", sourcePackageId: packages[4].id, packageName: packages[4].name, destination: packages[4].destination, region: packages[4].region, travel: "12–17 Dec 2026", travellers: "2 adults · 2 children", requirements: "A family-friendly Dubai trip with a desert experience, private transfers and visa assistance.", note: "A city escape built around easy travel days and family time.", days: packageDaysForProposal(packages[4]), value: 235000, updated: "Sep 24, 2026", status: "Draft" },
  { id: "PRP-1076", name: "Kapoor family Himachal", customer: "Ira Kapoor", customerEmail: "ira.kapoor@example.com", queryId: "QRY-2018", sourcePackageId: packages[2].id, packageName: packages[2].name, sharingMode: "priced", destination: packages[2].destination, region: packages[2].region, travel: "18–23 Dec 2026", travellers: "4 adults", requirements: "Mountain views, a comfortable hotel in each stop, private car and light sightseeing.", note: "A mountain journey with space to enjoy each stop.", days: packageDaysForProposal(packages[2]), value: 312000, updated: "Sep 21, 2026", status: "Approved" },
  { id: "PRP-1072", name: "Khanna Bali honeymoon", customer: "Samar Khanna", customerEmail: "samar.khanna@example.com", sourcePackageId: packages[1].id, packageName: packages[1].name, destination: packages[1].destination, region: packages[1].region, travel: "02–07 Jan 2027", travellers: "2 adults", requirements: "Quiet stays, private experiences and more time by the coast.", note: "A personal Bali journey with a calm pace and memorable shared experiences.", days: packageDaysForProposal(packages[1]), value: 268000, updated: "Sep 19, 2026", status: "Changes requested" },
];

const navIcon = (name: IconName) => <Icon name={name} size="nav" />;

const navGroups: NavGroupData[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "home", label: "Home", tip: "Home", icon: navIcon("layoutGrid") },
      { id: "inbox", label: "All inbox", tip: "All inbox", icon: navIcon("inbox") },
      { id: "destination", label: "Destination", tip: "Destination", icon: navIcon("pin") },
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

function ParyatechBrand() {
  return (
    <>
      <img
        className="package-brand-logo package-brand-logo--full"
        src="/brand/paryatech-lockup.png"
        alt="Paryatech"
        width={145}
        height={30}
        fetchPriority="high"
      />
      <img
        className="package-brand-logo package-brand-logo--compact"
        src="/brand/paryatech-mark.png"
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

function DataSheetFill({ columns }: { columns: number }) {
  return (
    <DataSheetRow className="package-sheet-fill" aria-hidden="true">
      {Array.from({ length: columns }, (_, index) => <DataSheetCell key={index} />)}
    </DataSheetRow>
  );
}

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

const statusTone: Record<PackageStatus, StatusTone> = {
  Published: "done",
  Draft: "open",
  Archived: "open",
};

const proposalStatusTone: Record<ProposalStatus, StatusTone> = {
  Draft: "progress",
  "Itinerary shared": "open",
  "Changes requested": "progress",
  Approved: "done",
  Declined: "open",
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type WorkspaceModule = "packages" | "bookings" | "vendors" | "destination" | "finance";

function moduleFromUrl(): WorkspaceModule {
  const module = new URLSearchParams(window.location.search).get("module");
  if (!module && /^\/(settings|account|notifications)(\/|$)/.test(window.location.pathname)) return "vendors";
  return module === "bookings" || module === "vendors" || module === "destination" || module === "finance" ? module : "packages";
}

export default function App() {
  const [activeModule, setActiveModule] = useState<WorkspaceModule>(moduleFromUrl);
  const [workspaceView, setWorkspaceView] = useState<"packages" | "proposals">("packages");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedSearchRegion, setSelectedSearchRegion] = useState<RegionSuggestion | null>(null);
  const [regionSuggestions, setRegionSuggestions] = useState<RegionSuggestion[]>([]);
  const [regionSearchOpen, setRegionSearchOpen] = useState(false);
  const [regionSearchLoading, setRegionSearchLoading] = useState(false);
  const [creatingPackage, setCreatingPackage] = useState(false);
  const [creatingProposal, setCreatingProposal] = useState(false);
  const [proposalSource, setProposalSource] = useState<PackageRecord | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [selectedPackage, setSelectedPackage] = useState<PackageRecord | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<ProposalRecord | null>(null);
  const [queryPreview, setQueryPreview] = useState<ProposalRecord | null>(null);
  const [packageRecords, setPackageRecords] = useState<PackageRecord[]>(packages);
  const [proposalRecords, setProposalRecords] = useState<ProposalRecord[]>(proposals);
  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);
  const tableViewportRef = useRef<HTMLDivElement>(null);
  const bookingModuleRef = useRef<EmbeddedModuleHandle>(null);
  const financeModuleRef = useRef<EmbeddedModuleHandle>(null);
  const packageDetailRef = useRef<StepNavigationHandle>(null);
  const proposalDetailRef = useRef<StepNavigationHandle>(null);
  const [packageInitialNavigation, setPackageInitialNavigation] = useState<StepNavigationSnapshot | null>(null);
  const [proposalInitialNavigation, setProposalInitialNavigation] = useState<StepNavigationSnapshot | null>(null);
  const moduleTrailRef = useRef<WorkspaceModule[]>([]);
  const workspaceTrailRef = useRef<Array<"packages" | "proposals">>([]);
  const recordTrailRef = useRef<Array<{ kind: "package" | "proposal" | "module"; id?: string; navigation?: StepNavigationSnapshot }>>([]);
  const proposalCreationReturnRef = useRef<{ id: string; navigation?: StepNavigationSnapshot } | null>(null);

  useEffect(() => {
    const focusWorkspaceSearch = (event: globalThis.KeyboardEvent) => {
      if (document.body.dataset.workspaceModule === "vendors") return;
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      document.querySelector<HTMLInputElement>(".pt-topbar .pt-search input")?.focus();
    };
    window.addEventListener("keydown", focusWorkspaceSearch);
    return () => window.removeEventListener("keydown", focusWorkspaceSearch);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      const previous = moduleFromUrl();
      if (moduleTrailRef.current.at(-1) === previous) moduleTrailRef.current.pop();
      setActiveModule(previous);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useLayoutEffect(() => {
    document.body.dataset.workspaceModule = activeModule;
    document.title = activeModule === "finance"
      ? "Finance · Paryatech"
      : activeModule === "destination"
      ? "Destination · Paryatech"
      : activeModule === "vendors"
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

      const compactCards = window.innerWidth < 900 || (workspaceView === "proposals" && window.innerWidth < 1300);
      const cardsPerRow = workspaceView === "proposals" && window.innerWidth > 900 && window.innerWidth < 1300 ? 2 : 1;
      const rowHeight = compactCards ? 336 : 80;
      const headerHeight = compactCards ? 0 : 48;
      const footerAllowance = 76;
      const available = window.innerHeight - tableTop - footerAllowance - headerHeight;
      setPageSize(Math.max(1, Math.floor(available / rowHeight)) * cardsPerRow);
    };

    const frame = window.requestAnimationFrame(updatePageSize);
    window.addEventListener("resize", updatePageSize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePageSize);
    };
  }, [workspaceView, query, region, statusFilter, sourceFilter]);

  const filteredPackages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const selectedTerms = selectedSearchRegion?.packageTerms.map((term) => term.toLowerCase());
    const rows = packageRecords.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter;
      const matchesRegion = region === "all" || item.region === region;
      const matchesSource = sourceFilter === "all" || item.source === sourceFilter;
      const searchable = `${item.name} ${item.destination} ${item.region} ${item.id}`.toLowerCase();
      const matchesQuery = selectedTerms
        ? selectedTerms.some((term) => searchable.includes(term))
        : normalized.length === 0 || searchable.includes(normalized);
      return matchesStatus && matchesRegion && matchesSource && matchesQuery;
    });

    return [...rows].sort((a, b) => Date.parse(b.updated) - Date.parse(a.updated));
  }, [packageRecords, query, region, selectedSearchRegion, sourceFilter, statusFilter]);

  const filteredProposals = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const selectedTerms = selectedSearchRegion?.packageTerms.map((term) => term.toLowerCase());
    return proposalRecords.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter;
      const matchesRegion = region === "all" || item.region === region;
      const searchable = `${item.name} ${item.customer} ${item.packageName} ${item.destination} ${item.region} ${item.id} ${item.queryId ?? ""}`.toLowerCase();
      const matchesQuery = selectedTerms
        ? selectedTerms.some((term) => searchable.includes(term))
        : !normalized || searchable.includes(normalized);
      return matchesStatus && matchesRegion && matchesQuery;
    }).sort((a, b) => Date.parse(b.updated) - Date.parse(a.updated));
  }, [proposalRecords, query, region, selectedSearchRegion, statusFilter]);

  const workspaceTabs: TabItem[] = [
    { id: "packages", label: "Packages", count: packageRecords.length },
    { id: "proposals", label: "Proposals", count: proposalRecords.length },
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

  const beginProposal = (source?: PackageRecord) => {
    proposalCreationReturnRef.current = selectedPackage
      ? { id: selectedPackage.id, navigation: packageDetailRef.current?.snapshot() }
      : null;
    if (workspaceView !== "proposals") workspaceTrailRef.current.push(workspaceView);
    setWorkspaceView("proposals");
    setSelectedPackage(null);
    setSelectedProposal(null);
    setProposalSource(source ?? null);
    setCreatingProposal(true);
  };

  const closeProposalBuilder = () => {
    setCreatingProposal(false);
    setProposalSource(null);
    const previous = proposalCreationReturnRef.current;
    proposalCreationReturnRef.current = null;
    if (previous) {
      setWorkspaceView("packages");
      setPackageInitialNavigation(previous.navigation ?? null);
      setSelectedPackage(packageRecords.find((item) => item.id === previous.id) ?? null);
    }
  };

  const selectModule = (module: WorkspaceModule) => {
    if (module === activeModule) {
      if (module === "packages") {
        setCreatingPackage(false);
        setCreatingProposal(false);
        setSelectedPackage(null);
        setSelectedProposal(null);
      }
      return;
    }
    moduleTrailRef.current.push(activeModule);
    if (activeModule === "packages") {
      if (selectedPackage) setPackageInitialNavigation(packageDetailRef.current?.snapshot() ?? null);
      if (selectedProposal) setProposalInitialNavigation(proposalDetailRef.current?.snapshot() ?? null);
    }
    if (module === "packages") {
      setCreatingPackage(false);
      setCreatingProposal(false);
      setSelectedPackage(null);
      setSelectedProposal(null);
    }
    setActiveModule(module);
    const url = new URL(window.location.href);
    url.pathname = import.meta.env.BASE_URL;
    url.hash = "";
    if (module !== "packages") url.searchParams.set("module", module);
    else url.searchParams.delete("module");
    window.history.pushState({ module }, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const goBackModule = () => {
    const previous = moduleTrailRef.current.pop();
    if (!previous) {
      selectModule("packages");
      return;
    }
    setActiveModule(previous);
    const url = new URL(window.location.href);
    url.pathname = import.meta.env.BASE_URL;
    url.hash = "";
    if (previous === "packages") url.searchParams.delete("module");
    else url.searchParams.set("module", previous);
    window.history.replaceState({ module: previous }, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const goBackRecord = (kind: "package" | "proposal") => {
    const detail = kind === "package" ? packageDetailRef.current : proposalDetailRef.current;
    if (detail?.goBack()) return;

    const previous = recordTrailRef.current.pop();
    if (previous?.kind === "proposal") {
      setSelectedPackage(null);
      setProposalInitialNavigation(previous.navigation ?? null);
      setSelectedProposal(proposalRecords.find((item) => item.id === previous.id) ?? null);
    } else if (previous?.kind === "package") {
      setSelectedProposal(null);
      setPackageInitialNavigation(previous.navigation ?? null);
      setSelectedPackage(packageRecords.find((item) => item.id === previous.id) ?? null);
    } else {
      if (kind === "package") setSelectedPackage(null);
      else setSelectedProposal(null);
      if (previous?.kind === "module") goBackModule();
    }
  };

  const shellNavGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      active: item.id === (activeModule === "finance" ? "finances" : activeModule),
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
        if (item.id === "destination") {
          selectModule("destination");
          return;
        }
        if (item.id === "finances") {
          selectModule("finance");
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
    const next = id as "packages" | "proposals";
    if (next !== workspaceView) workspaceTrailRef.current.push(workspaceView);
    setWorkspaceView(next);
    setStatusFilter("all");
    setQuery("");
    setRegion("all");
    setSourceFilter("all");
    setSelectedSearchRegion(null);
    setRegionSuggestions([]);
    setSelectedIds(new Set());
    setPage(1);
  };

  const goBackWorkspace = () => {
    const previous = workspaceTrailRef.current.pop();
    if (previous) {
      setWorkspaceView(previous);
      setPage(1);
    } else if (moduleTrailRef.current.length) {
      goBackModule();
    } else {
      showToast("You are at the start of this workspace");
    }
  };

  const topbarActions = (
    <>
      <IconButton label="Help and support" onClick={() => {
        if (activeModule === "bookings") bookingModuleRef.current?.clickChrome("Help and support");
        else if (activeModule === "finance") financeModuleRef.current?.clickChrome("Help and support");
        else showToast("Help centre opened");
      }}>
        <Icon name="info" size="nav" />
      </IconButton>
      <Tooltip tip="Notifications">
        <IconButton label="Notifications, unread" alert onClick={() => {
          if (activeModule === "bookings") bookingModuleRef.current?.clickChrome("Notifications");
          else if (activeModule === "finance") financeModuleRef.current?.clickChrome("Notifications");
          else showToast("You’re all caught up");
        }}>
          <Icon name="bell" size="nav" />
        </IconButton>
      </Tooltip>
    </>
  );

  if (activeModule === "vendors") {
    return <><VendorModule onNavigate={selectModule} onNotes={(mode) => window.dispatchEvent(new CustomEvent("paryatech-open-vendors-notes", { detail: mode }))} /><WorkspaceNotes key="vendors" module="vendors" hideStrip /></>;
  }

  if (activeModule === "bookings" || activeModule === "finance") {
    const isBooking = activeModule === "bookings";
    const frame = isBooking ? bookingModuleRef : financeModuleRef;
    return (
      <AppShell
        variant="detail"
        brandName=""
        brandMark={<ParyatechBrand />}
        navGroups={shellNavGroups}
        leading={<BackButton label="Back to previous view" onClick={() => {
          if (!frame.current?.goBackLocal()) goBackModule();
        }} />}
        breadcrumbs={[{ label: isBooking ? "Sales" : "Ops" }, { label: isBooking ? "Bookings" : "Finance" }]}
        search={{ placeholder: "Search anything", "aria-label": "Search Paryatech" }}
        account={{ name: "Vrushabh Jain", initials: "VJ", tone: "pink" }}
        credits={{ remaining: 720, total: 1000, onUpgrade: () => showToast("Upgrade options opened") }}
        notes={isBooking ? {
          label: "Booking notes",
          badge: 2,
          onOpen: () => frame.current?.openNotes("browse"),
          onAdd: () => frame.current?.openNotes("compose"),
        } : <WorkspaceNotes key="finance" module="finance" />}
        actions={topbarActions}
      >
        <div className="embedded-module">
          {isBooking
            ? <BookingModule ref={bookingModuleRef} onNavigate={selectModule} />
            : <FinanceModule ref={financeModuleRef} onNavigate={selectModule} />}
        </div>
      </AppShell>
    );
  }

  if (activeModule === "destination") {
    return (
      <AppShell
        variant="detail"
        brandName=""
        brandMark={<ParyatechBrand />}
        navGroups={shellNavGroups}
        leading={<BackButton label="Back to previous workspace" onClick={goBackModule} />}
        breadcrumbs={[{ label: "Home" }, { label: "Destination" }]}
        search={{ placeholder: "Search anything", "aria-label": "Search Paryatech" }}
        account={{ name: "Vrushabh Jain", initials: "VJ", tone: "pink" }}
        credits={{ remaining: 720, total: 1000, onUpgrade: () => showToast("Upgrade options opened") }}
        notes={<WorkspaceNotes key="destination" module="destination" records={packageRecords.map((item) => `${item.name} · ${item.id}`)} />}
        actions={topbarActions}
      >
        <DestinationPage packages={packageRecords} proposals={proposalRecords} onOpenRecord={(kind, id) => {
          if (kind === "package") {
            const record = packageRecords.find((item) => item.id === id);
            if (!record) return;
            recordTrailRef.current.push({ kind: "module" });
            selectModule("packages");
            setWorkspaceView("packages");
            setPackageInitialNavigation(null);
            setSelectedPackage(record);
          } else {
            const record = proposalRecords.find((item) => item.id === id);
            if (!record) return;
            recordTrailRef.current.push({ kind: "module" });
            selectModule("packages");
            setWorkspaceView("proposals");
            setProposalInitialNavigation(null);
            setSelectedProposal(record);
          }
        }} />
      </AppShell>
    );
  }

  if (creatingProposal) {
    const source = proposalSource ?? packageRecords.find((item) => item.id === selectedProposal?.sourcePackageId);
    return (
      <AppShell
        variant="detail"
        brandName=""
        brandMark={<ParyatechBrand />}
        navGroups={shellNavGroups}
        breadcrumbs={[{ label: "Sales", href: "#" }, { label: "Proposals", href: "#" }, { label: selectedProposal ? "Edit proposal" : "New proposal" }]}
        onBack={closeProposalBuilder}
        backLabel="Back to previous view"
        search={{ placeholder: "Search anything", "aria-label": "Search Paryatech" }}
        account={{ name: "Vrushabh Jain", initials: "VJ", tone: "pink" }}
        credits={{ remaining: 720, total: 1000, onUpgrade: () => showToast("Upgrade options opened") }}
        notes={{ label: "Proposal notes", badge: 0, onOpen: () => showToast("Proposal notes opened"), onAdd: () => showToast("New note opened") }}
        actions={topbarActions}
      >
        <ProposalBuilder
          key={selectedProposal?.id ?? source?.id ?? "new"}
          packages={packageRecords}
          initialPackage={source}
          existing={selectedProposal}
          onCancel={closeProposalBuilder}
          onComplete={(record) => {
            setProposalRecords((current) => current.some((item) => item.id === record.id)
              ? current.map((item) => item.id === record.id ? record : item)
              : [record, ...current]);
            setProposalInitialNavigation(null);
            setSelectedProposal(record);
            setCreatingProposal(false);
            setProposalSource(null);
            proposalCreationReturnRef.current = null;
            setWorkspaceView("proposals");
            setStatusFilter("all");
            setQuery("");
            setRegion("all");
            setPage(1);
            showToast(record.status === "Itinerary shared" ? "Itinerary marked as shared" : "Draft proposal saved");
          }}
        />
      </AppShell>
    );
  }

  if (creatingPackage) {
    return (
      <AppShell
        variant="detail"
        brandName=""
        brandMark={<ParyatechBrand />}
        navGroups={shellNavGroups}
        breadcrumbs={[{ label: "Sales", href: "#" }, { label: "Packages", href: "#" }, { label: selectedPackage?.source === "Paryatech" ? "Customize template" : selectedPackage ? "Edit package" : "Add package" }]}
        onBack={() => setCreatingPackage(false)}
        backLabel="Back to packages"
        search={{ placeholder: "Search anything", "aria-label": "Search Paryatech" }}
        account={{ name: "Vrushabh Jain", initials: "VJ", tone: "pink" }}
        credits={{ remaining: 720, total: 1000, onUpgrade: () => showToast("Upgrade options opened") }}
        notes={<WorkspaceNotes key="packages" module="packages" records={packageRecords.map((item) => `${item.name} · ${item.id}`)} />}
        actions={topbarActions}
      >
        <PackageBuilder
          key={selectedPackage?.id ?? "new"}
          existing={selectedPackage?.source === "Paryatech" ? null : selectedPackage}
          initialTemplate={selectedPackage?.source === "Paryatech" ? selectedPackage : null}
          onCancel={() => setCreatingPackage(false)}
          onToast={showToast}
          onComplete={(record) => {
            setPackageRecords((current) => current.some((item) => item.id === record.id)
              ? current.map((item) => item.id === record.id ? record : item)
              : [record, ...current]);
            setCreatingPackage(false);
            setPackageInitialNavigation(null);
            setSelectedPackage(record);
            showToast(selectedPackage?.source === "Paryatech" ? "Agency copy created; platform template unchanged" : selectedPackage ? "Package updated" : "Draft package created");
          }}
        />
        <div className={`package-toast package-toast--builder ${toast ? "package-toast--show" : ""}`} role="status" aria-live="polite">
          <Icon name="checkCircle" size="sm" />
          {toast}
        </div>
      </AppShell>
    );
  }

  const packageNotes = <WorkspaceNotes key="packages" module="packages" records={[
    ...packageRecords.map((item) => `${item.name} · ${item.id}`),
    ...proposalRecords.map((item) => `${item.name} · ${item.id}`),
  ]} />;

  if (selectedPackage) {
    return (
      <AppShell
        variant="detail"
        brandName=""
        brandMark={<ParyatechBrand />}
        navGroups={shellNavGroups}
        breadcrumbs={[
          { label: "Sales", href: "#" },
          { label: workspaceView === "proposals" ? "Proposals" : "Packages", href: "#" },
          { label: selectedPackage.name },
        ]}
        onBack={() => goBackRecord("package")}
        backLabel="Back to previous view"
        search={{ placeholder: "Search anything", "aria-label": "Search Paryatech" }}
        account={{ name: "Vrushabh Jain", initials: "VJ", tone: "pink" }}
        credits={{ remaining: 720, total: 1000, onUpgrade: () => showToast("Upgrade options opened") }}
        notes={packageNotes}
        actions={topbarActions}
      >
        <PackageDetail key={selectedPackage.id} ref={packageDetailRef} record={selectedPackage} relatedProposals={proposalRecords.filter((item) => item.sourcePackageId === selectedPackage.id)} onOpenProposal={(proposal) => { recordTrailRef.current.push({ kind: "package", id: selectedPackage.id, navigation: packageDetailRef.current?.snapshot() }); setSelectedPackage(null); setSelectedProposal(proposal); }} initialNavigation={packageInitialNavigation} onToast={showToast} onUseInProposal={() => beginProposal(selectedPackage)} onEdit={() => setCreatingPackage(true)} onStatusChange={(status) => { if (status === "Published" && selectedPackage.proposalDays) { const days = selectedPackage.proposalDays; if (days.some((day) => day.services.length < Math.max(day.plannedBlockCount ?? 1, 1)) || !selectedPackage.startingPrice || !selectedPackage.priceBasis || itineraryCosting(days).unpricedRequired > 0) { showToast("Fill planned blocks, price included services, and set a starting price before publishing"); return false; } } const updated = { ...selectedPackage, status }; setPackageRecords((current) => current.map((item) => item.id === updated.id ? updated : item)); setSelectedPackage(updated); return true; }} />
        <div className={`package-toast ${toast ? "package-toast--show" : ""}`} role="status" aria-live="polite">
          <Icon name="checkCircle" size="sm" />
          {toast}
        </div>
      </AppShell>
    );
  }

  if (selectedProposal) {
    const sourcePackage = packageRecords.find((item) => item.id === selectedProposal.sourcePackageId)
      ?? packageRecords.find((item) => item.name === selectedProposal.packageName);
    return (
      <AppShell
        variant="detail"
        brandName=""
        brandMark={<ParyatechBrand />}
        navGroups={shellNavGroups}
        breadcrumbs={[
          { label: "Sales", href: "#" },
          { label: "Proposals", href: "#" },
          { label: selectedProposal.name },
        ]}
        onBack={() => goBackRecord("proposal")}
        backLabel="Back to previous view"
        search={{ placeholder: "Search anything", "aria-label": "Search Paryatech" }}
        account={{ name: "Vrushabh Jain", initials: "VJ", tone: "pink" }}
        credits={{ remaining: 720, total: 1000, onUpgrade: () => showToast("Upgrade options opened") }}
        notes={packageNotes}
        actions={topbarActions}
      >
        <ProposalDetail
          key={selectedProposal.id}
          ref={proposalDetailRef}
          record={selectedProposal}
          initialNavigation={proposalInitialNavigation}
          sourcePackage={sourcePackage}
          onEdit={() => { if (selectedProposal.status === "Approved") { recordActivityBookingHandoff(selectedProposal); recordTransportBookingHandoff(selectedProposal); } setProposalSource(sourcePackage ?? null); setCreatingProposal(true); }}
          onStatusChange={(status, changeRequest) => {
            const activityPricing = status === "Approved" ? freezeActivityPricing(selectedProposal.days, selectedProposal.travelStart ?? "") : null;
            const groupTravellers = Number(selectedProposal.travellers.match(/\d+/)?.[0] ?? 0) + Number(selectedProposal.travellers.match(/(\d+) child/)?.[1] ?? 0);
            const pricing = activityPricing ? freezePrivateTransportPricing(activityPricing.days, selectedProposal.travelStart ?? "", groupTravellers) : null;
            if (activityPricing?.issues.length) { showToast(`Resolve supplier pricing before approval: ${activityPricing.issues[0]}`); return; }
            if (pricing?.issues.length) { showToast(`Resolve supplier pricing before approval: ${pricing.issues[0]}`); return; }
            const updated = { ...selectedProposal, days: pricing?.days ?? selectedProposal.days, status, acceptedVersion: status === "Approved" ? selectedProposal.version ?? 1 : selectedProposal.acceptedVersion, changeRequest: changeRequest || selectedProposal.changeRequest };
            setProposalRecords((current) => current.map((item) => item.id === updated.id ? updated : item));
            setSelectedProposal(updated);
            showToast(`Proposal ${status.toLowerCase()}`);
          }}
          onSaveAsPackage={() => {
            if (selectedProposal.itineraryMode === "simple") return;
            recordTrailRef.current.push({ kind: "proposal", id: selectedProposal.id, navigation: proposalDetailRef.current?.snapshot() });
            const record: PackageRecord = {
              id: `PKG-${Math.floor(1000 + Math.random() * 8999)}`,
              name: `Tailored ${selectedProposal.destination.split(",")[0]} journey`,
              destination: selectedProposal.destination,
              region: selectedProposal.region,
              duration: `${selectedProposal.days.length} days`,
              itineraryMode: "advanced",
              departureType: "flexible",
              priceBasis: "Per adult, twin sharing",
              startingPrice: undefined,
              updated: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date()),
              status: "Draft",
              source: "Your catalog",
              image: sourcePackage?.image ?? "",
              highlights: [
                "A complete trip plan with accommodation, transport and experiences together.",
                "Adapt each day and confirm supplier availability before sharing with a new customer.",
              ],
              proposalDays: selectedProposal.days.map((day) => ({ ...day, services: day.services.map((service) => ({ ...service, activitySnapshot: undefined })) })),
              createdFromProposal: true,
              templateId: sourcePackage?.id,
            };
            setPackageRecords((current) => [record, ...current]);
            setSelectedProposal(null);
            setPackageInitialNavigation(null);
            setSelectedPackage(record);
            setWorkspaceView("packages");
            showToast("Draft package created from proposal");
          }}
          onOpenBookings={() => { recordActivityBookingHandoff(selectedProposal); recordTransportBookingHandoff(selectedProposal); selectModule("bookings"); }}
          onOpenPackage={sourcePackage ? () => {
            recordTrailRef.current.push({ kind: "proposal", id: selectedProposal.id, navigation: proposalDetailRef.current?.snapshot() });
            setSelectedProposal(null);
            setPackageInitialNavigation(null);
            setSelectedPackage(sourcePackage);
          } : undefined}
        />
        <div className={`package-toast ${toast ? "package-toast--show" : ""}`} role="status" aria-live="polite">
          <Icon name="checkCircle" size="sm" />
          {toast}
        </div>
      </AppShell>
    );
  }

  const previewQuery = queryPreview?.queryContext ?? (queryPreview?.queryId ? linkedQueries[queryPreview.queryId] : undefined);

  return (
    <AppShell
      variant="detail"
      brandName=""
      brandMark={<ParyatechBrand />}
      navGroups={shellNavGroups}
      leading={<BackButton label="Back to previous view" onClick={goBackWorkspace} />}
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
            {workspaceView === "proposals" ? (
              <Button
                variant="ghost"
                size="toolbar"
                leadingIcon={<Icon name="package" size="sm" />}
                onClick={() => beginProposal()}
              >
                Create from package
              </Button>
            ) : null}
            <Button
              variant="primary"
              size="toolbar"
              leadingIcon={<Icon name="plus" size="sm" />}
              onClick={() => workspaceView === "packages" ? setCreatingPackage(true) : beginProposal()}
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
                    placeholder={workspaceView === "packages" ? "Search packages or regions" : "Search proposals, customers, queries or regions"}
                    aria-label={workspaceView === "packages" ? "Search packages or regions" : "Search proposals, customers, queries or regions"}
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
                  {workspaceView === "packages" ? (
                    <FilterSelect
                      label="Source"
                      value={sourceFilter}
                      onChange={(value) => { setSourceFilter(value); setPage(1); }}
                      options={[
                        { value: "all", label: "All sources" },
                        { value: "Paryatech", label: "From Paryatech" },
                        { value: "Your catalog", label: "Your catalog" },
                      ]}
                    />
                  ) : null}
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
                      { value: "itinerary shared", label: "Itinerary shared" },
                      { value: "changes requested", label: "Changes requested" },
                      { value: "approved", label: "Approved" },
                      { value: "declined", label: "Declined" },
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
              <DataSheetCell>Destination</DataSheetCell>
              <DataSheetCell>Duration</DataSheetCell>
              <DataSheetCell>Price basis</DataSheetCell>
              <DataSheetCell>Source / mode</DataSheetCell>
              <DataSheetCell className="package-status-cell">Status</DataSheetCell>
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
                  if (rowRequestedOpen(event)) { recordTrailRef.current = []; setPackageInitialNavigation(null); setSelectedPackage(item); }
                }}
                onKeyDown={(event) => {
                  if (keyboardRequestedOpen(event)) { recordTrailRef.current = []; setPackageInitialNavigation(null); setSelectedPackage(item); }
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
                        {item.image ? <img
                          className="package-thumbnail"
                          src={item.image}
                          alt=""
                          width={40}
                          height={40}
                          loading="lazy"
                          decoding="async"
                          style={{ objectPosition: item.imagePosition }}
                        /> : <span className="package-thumbnail package-thumbnail--placeholder"><Icon name="package" size="sm" /></span>}
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
                  <StackCell><StackLine>{item.startingPrice ? money.format(item.startingPrice) : "Not set"}</StackLine><StackLine muted>{item.priceBasis ?? "Per adult, twin sharing"}</StackLine></StackCell>
                </DataSheetCell>
                <DataSheetCell>
                  <StackCell>
                    <StackLine>{item.source === "Paryatech" ? "Paryatech" : "Agency"}</StackLine>
                    <StackLine muted>Advanced · {item.updated}</StackLine>
                  </StackCell>
                </DataSheetCell>
                <DataSheetCell className="package-status-cell">
                  <StatusWithDot tone={statusTone[item.status]}>{item.status}</StatusWithDot>
                </DataSheetCell>
                <DataSheetCell className="package-row-actions-cell">
                  <RowActions className="package-row-actions">
                    <IconButton
                      label={`More actions for ${item.name}`}
                      aria-haspopup="menu"
                      aria-expanded={openRowMenu === item.id}
                      onClick={() => setOpenRowMenu((current) => current === item.id ? null : item.id)}
                    ><span className="package-more-vertical"><Icon name="more" size={15} /></span></IconButton>
                    {openRowMenu === item.id ? (
                      <div className="package-row-menu" role="menu" aria-label={`Actions for ${item.name}`}>
                        <button type="button" role="menuitem" onClick={() => { setOpenRowMenu(null); recordTrailRef.current = []; setPackageInitialNavigation(null); setSelectedPackage(item); }}>
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
            <DataSheetFill columns={8} />
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
              <DataSheetCell>Query</DataSheetCell>
              <DataSheetCell>Travel / party</DataSheetCell>
              <DataSheetCell>Quoted total</DataSheetCell>
              <DataSheetCell>Last updated</DataSheetCell>
              <DataSheetCell className="package-status-cell">Status</DataSheetCell>
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
                  if (rowRequestedOpen(event)) { recordTrailRef.current = []; setProposalInitialNavigation(null); setSelectedProposal(item); }
                }}
                onKeyDown={(event) => {
                  if (keyboardRequestedOpen(event)) { recordTrailRef.current = []; setProposalInitialNavigation(null); setSelectedProposal(item); }
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
                  <StackCell><StackLine>{item.customer}</StackLine><StackLine muted>{item.customerEmail || "Email not set"}</StackLine></StackCell>
                </DataSheetCell>
                <DataSheetCell className="proposal-query-cell">
                  {item.queryId ? <button type="button" className="proposal-query-link" onClick={() => setQueryPreview(item)} aria-label={`Open query ${item.queryId} for ${item.customer}`}><Icon name="fileText" size="sm" />{item.queryId}</button> : <span className="pt-muted" aria-label="No linked query">—</span>}
                </DataSheetCell>
                <DataSheetCell>
                  <StackCell><StackLine icon={<Icon name="calendar" size="sm" />}>{item.travel}</StackLine><StackLine muted>{item.travellers}</StackLine></StackCell>
                </DataSheetCell>
                <DataSheetCell>{item.value ? <MoneyCell amount={money.format(item.value)} /> : <span className="pt-muted">Unpriced</span>}</DataSheetCell>
                <DataSheetCell><StackCell><StackLine>{item.updated}</StackLine><StackLine muted>{item.itineraryMode === "simple" ? "Simple" : "Advanced"} · Vrushabh Jain</StackLine></StackCell></DataSheetCell>
                <DataSheetCell className="package-status-cell"><StatusWithDot tone={proposalStatusTone[item.status]}>{item.status}</StatusWithDot></DataSheetCell>
                <DataSheetCell className="package-row-actions-cell">
                  <RowActions className="package-row-actions">
                    <IconButton
                      label={`More actions for ${item.name}`}
                      aria-haspopup="menu"
                      aria-expanded={openRowMenu === item.id}
                      onClick={() => setOpenRowMenu((current) => current === item.id ? null : item.id)}
                    ><span className="package-more-vertical"><Icon name="more" size={15} /></span></IconButton>
                    {openRowMenu === item.id ? (
                      <div className="package-row-menu" role="menu" aria-label={`Actions for ${item.name}`}>
                        <button type="button" role="menuitem" onClick={() => { setOpenRowMenu(null); recordTrailRef.current = []; setProposalInitialNavigation(null); setSelectedProposal(item); }}>
                          <Icon name="openExternal" size="sm" /> Open proposal
                        </button>
                        <button type="button" role="menuitem" onClick={() => { const duplicate: ProposalRecord = { ...item, id: `PRP-${Math.floor(1000 + Math.random() * 8999)}`, name: `${item.name} (copy)`, queryId: undefined, queryContext: undefined, days: item.days.map((day) => ({ ...day, highlights: [...(day.highlights ?? [])], services: day.services.map((service) => ({ ...service, activitySnapshot: undefined, supplements: service.supplements?.map((supplement) => ({ ...supplement })) })) })), status: "Draft", version: 1, acceptedVersion: undefined, changeRequest: undefined, updated: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date()) }; setProposalRecords((current) => [duplicate, ...current]); setOpenRowMenu(null); setSelectedProposal(duplicate); showToast("Draft proposal duplicated; edit its customer details before sharing"); }}>
                          <Icon name="copy" size="sm" /> Duplicate proposal
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
            <DataSheetFill columns={9} />
          </DataSheet>
        ) : (
          <div className="package-empty">
            <span className="package-empty__icon"><Icon name="fileText" size="lg" /></span>
            <h2>No proposals found</h2>
            <p>Try another status, region or search.</p>
            <Button variant="primary" size="sm" onClick={() => { setQuery(""); setSelectedSearchRegion(null); setRegion("all"); setStatusFilter("all"); }}>Clear filters</Button>
          </div>
        ))}
        </div>
      </ListPage>

      <div className={`package-toast ${toast ? "package-toast--show" : ""}`} role="status" aria-live="polite">
        <Icon name="checkCircle" size="sm" />
        {toast}
      </div>
      <Modal open={Boolean(queryPreview)} onClose={() => setQueryPreview(null)} title={queryPreview?.queryId ?? "Linked query"} eyebrow="Linked query" footer={<Button variant="ghost" size="sm" onClick={() => setQueryPreview(null)}>Close</Button>}>
        {previewQuery ? <dl className="proposal-query-preview"><div><dt>Customer</dt><dd>{previewQuery.customer}</dd></div><div><dt>Destination</dt><dd>{previewQuery.destination ?? "Not set"}</dd></div><div><dt>Travel dates</dt><dd>{formatProposalTravel(previewQuery.travelStart ?? "", previewQuery.travelEnd ?? "")}</dd></div><div><dt>Party</dt><dd>{previewQuery.adults ?? 0} adults{previewQuery.children ? ` · ${previewQuery.children} children` : ""}</dd></div><div><dt>Requirements</dt><dd>{previewQuery.requirements ?? "Not recorded"}</dd></div></dl> : <p className="proposal-query-preview__empty">The original query details are not available in this workspace.</p>}
      </Modal>
    </AppShell>
  );
}
