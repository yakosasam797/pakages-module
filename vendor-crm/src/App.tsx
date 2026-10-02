import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppShell,
  Avatar,
  Button,
  CreditsMeter,
  IconButton,
  NotesStrip,
  Tooltip,
} from "@paryatech/design-system";
import { AccountLauncher } from "./components/account/AccountLauncher";
import { NotificationPanel } from "./components/notifications/NotificationPanel";
import { SettingsLauncherModal } from "./components/settings/SettingsLauncherModal";
import { UniversalSearch, type UniversalSearchItem } from "./components/UniversalSearch";
import { VendorsListPage } from "./components/VendorsListPage";
import { NewVendorPage } from "./components/NewVendorPage";
import { VendorRateCardsPage } from "./components/VendorRateCardsPage";
import { RateCardDetailPage } from "./components/rateCard/RateCardDetailPage";
import { NotesPanel } from "./components/NotesPanel";
import { SEED_VENDORS, type Vendor } from "./data/vendors";
import { getVendorService } from "./data/services";
import { readCreatedDirectoryServices, readDeletedDirectoryServiceIds, saveCreatedDirectoryServices, saveDeletedDirectoryServiceIds, type DirectoryService } from "./data/vendorDirectory";
import { buildNavGroups } from "./nav";
import { AccountHubPage } from "./pages/account/AccountHubPage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { SettingsHubPage } from "./pages/settings/SettingsHubPage";
import { can, canOpenWorkspaceSettings, type OrgRole } from "./permissions";
import { createBlankCard, getDetailCard, saveTransportCard } from "./rateCard/cards";
import { CreateRateCardModal } from "./components/CreateRateCardModal";
import type { RateCardDetail } from "./rateCard/types";
import type { PageNavigationContext } from "./pageNavigation";
import {
  pathForHub,
  parsePathname,
  type CrmRoute,
  type HubRoute,
} from "./routing";
import {
  SETTINGS_DESTINATIONS,
  type AccountDestinationId,
  type SettingsDestinationId,
} from "./settings/destinations";
import {
  IconBell,
  IconBrandCaret,
  IconChevronDown,
  IconChevronLeft,
  IconHelp,
  IconNotes,
  IconSearch,
  IconSparkles,
} from "./icons";
import "./App.css";
import "./components/rateCard/RateCardDetail.css";
import "./components/settings/settings.css";

/** Opens WhatsApp chat for product support (Help). Call logs removed from the top bar. */
const SUPPORT_WHATSAPP_URL =
  "https://wa.me/919876543210?text=" +
  encodeURIComponent("Hi, I need help with Paryatech.");

function blankFromTemplate(templateId: string) {
  return templateId === "visa" ? "rc-new-visa" : "rc-new-hotel";
}

interface AppProps {
  onNavigateModule?: (module: "packages" | "bookings" | "destination" | "finance") => void;
  onWorkspaceNotes?: (mode: "browse" | "compose") => void;
}

export default function App({ onNavigateModule, onWorkspaceNotes }: AppProps = {}) {
  const [activeNav, setActiveNav] = useState("vendors");
  const [crmRoute, setCrmRoute] = useState<CrmRoute>({ name: "vendors" });
  const [hubRoute, setHubRoute] = useState<HubRoute | null>(() =>
    parsePathname(window.location.pathname),
  );
  const [notesOpen, setNotesOpen] = useState(false);
  const orgRole: OrgRole = "Owner";
  const [vendors, setVendors] = useState<Vendor[]>(() =>
    SEED_VENDORS.map((v) => structuredClone(v)),
  );
  const [createdDirectoryServices, setCreatedDirectoryServices] = useState<DirectoryService[]>(readCreatedDirectoryServices);
  useEffect(() => saveCreatedDirectoryServices(createdDirectoryServices), [createdDirectoryServices]);
  const [deletedServiceIds, setDeletedServiceIds] = useState<string[]>(readDeletedDirectoryServiceIds);
  useEffect(() => saveDeletedDirectoryServiceIds(deletedServiceIds), [deletedServiceIds]);
  const [flash, setFlash] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [openServiceId, setOpenServiceId] = useState<string | null>(null);
  const [createCardOpen, setCreateCardOpen] = useState(false);
  const [activeDraft, setActiveDraft] = useState<RateCardDetail | null>(null);
  const [universalSearchOpen, setUniversalSearchOpen] = useState(false);
  const [pageNavigation, setPageNavigation] = useState<PageNavigationContext | null>(null);

  const notifBtnRef = useRef<HTMLElement>(null);
  const accountBtnRef = useRef<HTMLButtonElement>(null);
  const searchBtnRef = useRef<HTMLButtonElement>(null);
  const handlePageNavigationChange = useCallback(
    (context: PageNavigationContext | null) => setPageNavigation(context),
    [],
  );

  const leaveHub = () => {
    setPageNavigation(null);
    setHubRoute(null);
    if (window.location.pathname.startsWith("/settings") ||
      window.location.pathname.startsWith("/account") ||
      window.location.pathname === "/notifications") {
      window.history.pushState({ module: "vendors" }, "", onNavigateModule ? "/?module=vendors" : "/");
    }
  };

  const openVendors = () => {
    setPageNavigation(null);
    leaveHub();
    setActiveNav("vendors");
    setOpenServiceId(null);
    setCrmRoute({ name: "vendors" });
  };
  const goHome = () => {
    setPageNavigation(null);
    leaveHub();
    setActiveNav("home");
    setOpenServiceId(null);
    setCrmRoute({ name: "vendors" });
  };
  const openNavigation = (id: string) => {
    const module = id === "finances" ? "finance" : id;
    if (onNavigateModule && (module === "packages" || module === "bookings" || module === "destination" || module === "finance")) {
      onNavigateModule(module);
      return;
    }
    setPageNavigation(null);
    setActiveNav(id);
    leaveHub();
    setOpenServiceId(null);
    setCrmRoute({ name: "vendors" });
  };
  const openVendor = (id: string, message?: string) => {
    setPageNavigation(null);
    leaveHub();
    setActiveNav("vendors");
    setOpenServiceId(null);
    if (message) setFlash(message);
    setCrmRoute({ name: "vendor", id });
  };
  const openNewVendor = () => {
    setPageNavigation(null);
    leaveHub();
    setActiveNav("vendors");
    setOpenServiceId(null);
    setCrmRoute({ name: "vendor-new" });
  };
  const openCard = (id: string, vendorId: string) => {
    setPageNavigation(null);
    leaveHub();
    setActiveNav("vendors");
    setOpenServiceId(null);
    setCrmRoute({ name: "rate-card", id, vendorId });
  };
  const backFromCard = () => {
    setPageNavigation(null);
    if (crmRoute.name === "rate-card" || crmRoute.name === "rate-card-new") {
      setOpenServiceId(null);
      setCrmRoute({ name: "vendor", id: crmRoute.vendorId });
      return;
    }
    openVendors();
  };

  useEffect(() => {
    const onPop = () => {
      setHubRoute(parsePathname(window.location.pathname));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const onUniversalSearch = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSettingsOpen(false);
        setAccountOpen(false);
        setNotifOpen(false);
        setUniversalSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onUniversalSearch);
    return () => window.removeEventListener("keydown", onUniversalSearch);
  }, []);

  const goHub = (route: HubRoute) => {
    setSettingsOpen(false);
    setAccountOpen(false);
    setNotifOpen(false);
    setHubRoute(route);
    window.history.pushState({ hub: route, module: "vendors" }, "", pathForHub(route) + (onNavigateModule ? "?module=vendors" : ""));
  };

  const openSettingsHome = () => {
    setPageNavigation(null);
    setOpenServiceId(null);
    goHub({ area: "settings", id: "organization" });
  };

  const isHub = hubRoute !== null;
  const navGroups = buildNavGroups(
    isHub && hubRoute.area === "settings" ? "settings" : activeNav,
    openNavigation,
    {
      visible: canOpenWorkspaceSettings(orgRole),
      onSelect: openSettingsHome,
    },
  );
  const isVendorsList = !isHub && crmRoute.name === "vendors" && activeNav === "vendors";
  const isNewVendor = !isHub && crmRoute.name === "vendor-new";
  const isVendorDetail = !isHub && crmRoute.name === "vendor";
  const isHome = !isHub && activeNav === "home" && crmRoute.name === "vendors";
  const isOtherNav =
    !isHub &&
    crmRoute.name === "vendors" &&
    activeNav !== "vendors" &&
    activeNav !== "home";

  const detail =
    !isHub && crmRoute.name === "rate-card"
      ? getDetailCard(crmRoute.id)
      : !isHub && crmRoute.name === "rate-card-new"
        ? (activeDraft ?? getDetailCard(blankFromTemplate(crmRoute.templateId)))
        : undefined;

  const isRateCard =
    !isHub && (crmRoute.name === "rate-card" || crmRoute.name === "rate-card-new");

  const notesTitle = isVendorsList
    ? "Module notes"
    : isNewVendor
      ? "Vendor setup notes"
    : isHome
      ? "Workspace notes"
    : isHub
      ? "Workspace notes"
      : isRateCard
        ? "Rate card notes"
        : "Vendor notes";

  const notesItems = detail?.notes ?? [];
  const notesBadge = notesItems.length || undefined;

  const openNotes = () => setNotesOpen(true);

  const currentVendorId =
    crmRoute.name === "vendor"
      ? crmRoute.id
      : crmRoute.name === "rate-card" || crmRoute.name === "rate-card-new"
        ? crmRoute.vendorId
        : "exhosp";

  const vendorName = (id: string) =>
    vendors.find((v) => v.id === id)?.name ?? "Example Hospitality";

  const openService =
    isVendorDetail && openServiceId ? getVendorService(openServiceId) : undefined;

  const crumbs = isHub ? (
    <ol className="app-shell-crumbs__list">
      <li>
        <button type="button" className="app-shell-crumbs__link" onClick={leaveHub}>
          Workspace
        </button>
      </li>
      <li className="rc-crumb-sep" aria-hidden="true">
        ›
      </li>
      <li aria-current="page">
        {hubRoute.area === "settings"
          ? "Settings"
          : hubRoute.area === "account"
            ? "Account"
            : "Notifications"}
      </li>
    </ol>
  ) : (
    <ol className="app-shell-crumbs__list">
      {isHome ? (
        <li aria-current="page">Home</li>
      ) : isOtherNav ? (
        <li aria-current="page">
          {activeNav === "customers"
            ? "Customers"
            : activeNav.charAt(0).toUpperCase() + activeNav.slice(1).replace(/-/g, " ")}
        </li>
      ) : isVendorsList ? (
        <>
          <li>
            <button type="button" className="app-shell-crumbs__link" onClick={goHome}>
              CRM
            </button>
          </li>
          <li className="rc-crumb-sep" aria-hidden="true">
            ›
          </li>
          {pageNavigation ? (
            <>
              <li>
                <button
                  type="button"
                  className="app-shell-crumbs__link"
                  onClick={pageNavigation.onBack}
                >
                  {pageNavigation.sectionLabel}
                </button>
              </li>
              <li className="rc-crumb-sep" aria-hidden="true">›</li>
              <li aria-current="page">{pageNavigation.title}</li>
            </>
          ) : (
            <li aria-current="page">Vendors</li>
          )}
        </>
      ) : isNewVendor ? (
        <>
          <li>
            <button type="button" className="app-shell-crumbs__link" onClick={openVendors}>
              CRM
            </button>
          </li>
          <li className="rc-crumb-sep" aria-hidden="true">›</li>
          <li>
            <button type="button" className="app-shell-crumbs__link" onClick={openVendors}>
              Vendors
            </button>
          </li>
          <li className="rc-crumb-sep" aria-hidden="true">›</li>
          <li aria-current="page">Add vendor</li>
        </>
      ) : (
        <>
          <li>
            <button type="button" className="app-shell-crumbs__link" onClick={openVendors}>
              CRM
            </button>
          </li>
          <li className="rc-crumb-sep" aria-hidden="true">
            ›
          </li>
          <li>
            <button type="button" className="app-shell-crumbs__link" onClick={openVendors}>
              Vendors
            </button>
          </li>
          <li className="rc-crumb-sep" aria-hidden="true">
            ›
          </li>
          {isVendorDetail ? (
            openService ? (
              <>
                <li>
                  <button
                    type="button"
                    className="app-shell-crumbs__link"
                    onClick={() => openVendor(currentVendorId)}
                  >
                    {vendorName(currentVendorId)}
                  </button>
                </li>
                <li className="rc-crumb-sep" aria-hidden="true">
                  ›
                </li>
                <li>
                  <button
                    type="button"
                    className="app-shell-crumbs__link"
                    onClick={() => setOpenServiceId(null)}
                  >
                    Services
                  </button>
                </li>
                <li className="rc-crumb-sep" aria-hidden="true">
                  ›
                </li>
                <li aria-current="page">{openService.name}</li>
              </>
            ) : pageNavigation ? (
              <>
                <li>
                  <button
                    type="button"
                    className="app-shell-crumbs__link"
                    onClick={() => {
                      pageNavigation.onBack();
                      openVendor(currentVendorId);
                    }}
                  >
                    {vendorName(currentVendorId)}
                  </button>
                </li>
                <li className="rc-crumb-sep" aria-hidden="true">›</li>
                <li>
                  <button
                    type="button"
                    className="app-shell-crumbs__link"
                    onClick={pageNavigation.onBack}
                  >
                    {pageNavigation.sectionLabel}
                  </button>
                </li>
                <li className="rc-crumb-sep" aria-hidden="true">›</li>
                <li aria-current="page">{pageNavigation.title}</li>
              </>
            ) : (
              <li aria-current="page">{vendorName(currentVendorId)}</li>
            )
          ) : (
            <>
              <li>
                <button
                  type="button"
                  className="app-shell-crumbs__link"
                  onClick={() => openVendor(currentVendorId)}
                >
                  {detail?.vendor ?? vendorName(currentVendorId)}
                </button>
              </li>
              <li className="rc-crumb-sep" aria-hidden="true">
                ›
              </li>
              <li aria-current="page">{detail?.name ?? "New rate card"}</li>
            </>
          )}
        </>
      )}
    </ol>
  );

  const openSettingsDestination = (id: SettingsDestinationId) => {
    goHub({ area: "settings", id });
  };

  const openAccountDestination = (id: AccountDestinationId | "notification-preferences") => {
    goHub({ area: "account", id });
  };

  const openUniversalSearch = () => {
    setSettingsOpen(false);
    setAccountOpen(false);
    setNotifOpen(false);
    setUniversalSearchOpen(true);
  };

  const closeUniversalSearch = () => {
    setUniversalSearchOpen(false);
    window.requestAnimationFrame(() => searchBtnRef.current?.focus());
  };

  const universalSearchItems: UniversalSearchItem[] = [
    {
      id: "page-home",
      label: "Home",
      description: "Workspace overview",
      group: "Pages",
      keywords: "dashboard workspace",
      featured: true,
      onSelect: () => openNavigation("home"),
    },
    {
      id: "page-vendors",
      label: "Vendors",
      description: "Browse and manage vendor records",
      group: "Pages",
      keywords: "crm suppliers",
      featured: true,
      onSelect: openVendors,
    },
    {
      id: "page-customers",
      label: "Customers",
      description: "Open customer records",
      group: "Pages",
      keywords: "crm clients",
      featured: true,
      onSelect: () => openNavigation("customers"),
    },
    {
      id: "page-tasks",
      label: "All tasks",
      description: "Review work across the workspace",
      group: "Pages",
      keywords: "todos work",
      featured: true,
      onSelect: () => openNavigation("tasks"),
    },
    {
      id: "page-inbox",
      label: "All inbox",
      description: "Messages and updates",
      group: "Pages",
      keywords: "communications messages email",
      onSelect: () => openNavigation("inbox"),
    },
    {
      id: "page-news",
      label: "News",
      description: "Workspace announcements",
      group: "Pages",
      onSelect: () => openNavigation("news"),
    },
    {
      id: "page-queries",
      label: "Queries",
      description: "Sales enquiries and requests",
      group: "Pages",
      keywords: "sales leads",
      onSelect: () => openNavigation("queries"),
    },
    {
      id: "page-packages",
      label: "Packages",
      description: "Travel packages",
      group: "Pages",
      onSelect: () => openNavigation("packages"),
    },
    {
      id: "page-bookings",
      label: "Bookings",
      description: "Trips and fulfilment",
      group: "Pages",
      featured: true,
      onSelect: () => openNavigation("bookings"),
    },
    {
      id: "page-finances",
      label: "All finances",
      description: "Payments and financial activity",
      group: "Pages",
      keywords: "invoices payables",
      onSelect: () => openNavigation("finances"),
    },
    {
      id: "page-team",
      label: "Team",
      description: "Workspace members",
      group: "Pages",
      onSelect: () => openNavigation("team"),
    },
    {
      id: "page-automations",
      label: "Automations",
      description: "Operational workflows",
      group: "Pages",
      onSelect: () => openNavigation("automations"),
    },
    {
      id: "page-reports",
      label: "Reports",
      description: "Workspace reporting",
      group: "Pages",
      onSelect: () => openNavigation("reports"),
    },
    {
      id: "page-notifications",
      label: "Notifications",
      description: "View all workspace notifications",
      group: "Pages",
      featured: true,
      onSelect: () => goHub({ area: "notifications" }),
    },
    ...vendors.map<UniversalSearchItem>((vendor) => ({
      id: `vendor-${vendor.id}`,
      label: vendor.name,
      description: `${vendor.code} · ${vendor.location}`,
      group: "Vendors",
      keywords: `${vendor.categories.join(" ")} ${vendor.owner}`,
      onSelect: () => openVendor(vendor.id),
    })),
    ...(canOpenWorkspaceSettings(orgRole)
      ? SETTINGS_DESTINATIONS.map<UniversalSearchItem>((destination, index) => ({
          id: `settings-${destination.id}`,
          label: destination.title,
          description: destination.description,
          group: "Settings",
          keywords: destination.group,
          featured: index < 2,
          onSelect: () => openSettingsDestination(destination.id),
        }))
      : []),
  ];

  return (
    <AppShell
      brandName=""
      brandMark={
        <>
          <img
            className="app-brand-logo app-brand-logo--full"
            src="/brand/paryatech-lockup.png"
            alt="Paryatech"
          />
          <img
            className="app-brand-logo app-brand-logo--compact"
            src="/brand/paryatech-mark.png"
            alt="Paryatech"
          />
        </>
      }
      brandAction={<IconBrandCaret />}
      listMode={false}
      search={false}
      notes={
        <NotesStrip
          label={notesTitle}
          icon={<IconNotes />}
          badge={notesBadge}
          tip="Open notes"
          addTip="Write a note"
          onOpen={() => onWorkspaceNotes ? onWorkspaceNotes("browse") : openNotes()}
          onAdd={() => onWorkspaceNotes ? onWorkspaceNotes("compose") : openNotes()}
        />
      }
      navGroups={navGroups}
      sidebarFooter={
        <CreditsMeter
          remaining={720}
          total={1000}
          tip="720 of 1,000 credits remaining"
          upgrade={
            <Tooltip tip="View plans and increase your credit limit" className="pt-credits__upgrade-tip">
              <Button variant="primary" size="sm" className="pt-credits__up">
                <IconSparkles size={14} />
                <span>Upgrade</span>
              </Button>
            </Tooltip>
          }
        />
      }
      leading={
        isHub ? (
          <IconButton label="Back to workspace" onClick={leaveHub}>
            <IconChevronLeft />
          </IconButton>
        ) : pageNavigation ? (
          <IconButton label={pageNavigation.backLabel} onClick={pageNavigation.onBack}>
            <IconChevronLeft />
          </IconButton>
        ) : isHome ? undefined : (
          <IconButton
            label={
              isVendorsList
                ? "Back to home"
                : isNewVendor
                  ? "Back to vendors"
                  : isVendorDetail
                  ? openService
                    ? "Back to services"
                    : "Back to vendors"
                  : "Back to vendor"
            }
            onClick={
              isVendorsList
                ? goHome
                : isNewVendor
                  ? openVendors
                  : isVendorDetail
                  ? openService
                    ? () => setOpenServiceId(null)
                    : openVendors
                  : backFromCard
            }
          >
            <IconChevronLeft />
          </IconButton>
        )
      }
      crumbs={crumbs}
      actions={
        <div className="app-top-actions">
          <button
            ref={searchBtnRef}
            type="button"
            className="app-top-search"
            aria-label="Open universal search"
            aria-haspopup="dialog"
            aria-expanded={universalSearchOpen}
            onClick={openUniversalSearch}
          >
            <IconSearch size={16} />
            <span>Search anything</span>
            <kbd aria-hidden="true">Ctrl K</kbd>
          </button>
          <IconButton
            className="app-top-util"
            label="Help and support"
            onClick={() => window.open(SUPPORT_WHATSAPP_URL, "_blank", "noopener,noreferrer")}
          >
            <IconHelp />
          </IconButton>
          <span ref={notifBtnRef}>
            <Tooltip tip="Notifications">
              <IconButton
                className="app-top-util"
                label="Notifications"
                alert
                onClick={() => {
                  setSettingsOpen(false);
                  setAccountOpen(false);
                  setNotifOpen(true);
                }}
              >
                <IconBell />
              </IconButton>
            </Tooltip>
          </span>
          <div className="account-btn-wrap">
            <button
              ref={accountBtnRef}
              type="button"
              className="account-btn"
              aria-label="Account, Vrushabh Jain"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              onClick={() => {
                setSettingsOpen(false);
                setNotifOpen(false);
                setAccountOpen((open) => !open);
              }}
            >
              <Avatar tone="pink" size={26}>
                VJ
              </Avatar>
              <IconChevronDown size={13} />
            </button>
            <AccountLauncher
              open={accountOpen}
              anchorRef={accountBtnRef}
              onClose={() => setAccountOpen(false)}
              onNavigate={(id) => {
                setAccountOpen(false);
                openAccountDestination(id);
              }}
              onSignOut={() => {
                setAccountOpen(false);
                window.alert("Sign out is a demo action in this trial.");
              }}
            />
          </div>
        </div>
      }
    >
      {isHub && hubRoute.area === "settings" ? (
        <SettingsHubPage
          id={hubRoute.id}
          orgRole={orgRole}
          onAllSettings={() => setSettingsOpen(true)}
        />
      ) : isHub && hubRoute.area === "account" ? (
        <AccountHubPage id={hubRoute.id} onNavigate={openAccountDestination} />
      ) : isHub && hubRoute.area === "notifications" ? (
        <NotificationsPage
          onOpenPreferences={() => openAccountDestination("notification-preferences")}
        />
      ) : isVendorsList ? (
        <VendorsListPage
          vendors={vendors}
          createdServices={createdDirectoryServices}
          onCreatedServicesChange={setCreatedDirectoryServices}
          deletedServiceIds={deletedServiceIds}
          onDeletedServiceIdsChange={setDeletedServiceIds}
          orgRole={orgRole}
          flash={flash}
          onClearFlash={() => setFlash(null)}
          onOpenVendor={(id) => {
            setFlash(null);
            openVendor(id);
          }}
          onAddVendor={openNewVendor}
          onOpenRateCard={(vendorId, rateCardId) => openCard(rateCardId, vendorId)}
          onNavigationContextChange={handlePageNavigationChange}
          onVendorsChange={(next, notice) => {
            setVendors(next);
            setFlash(notice ?? "Vendor details updated successfully.");
          }}
        />
      ) : isNewVendor ? (
        <NewVendorPage
          vendors={vendors}
          orgRole={orgRole}
          onCancel={openVendors}
          onViewExisting={(id) => openVendor(id)}
          onCreated={(created) => {
            setVendors((previous) => [created, ...previous]);
            openVendor(
              created.id,
              "Vendor saved as a draft. Add services when you are ready to build the record.",
            );
          }}
        />
      ) : isVendorDetail && crmRoute.name === "vendor" ? (
        <VendorRateCardsPage
          vendorId={crmRoute.id}
          vendors={vendors}
          createdServices={createdDirectoryServices}
          onCreatedServicesChange={setCreatedDirectoryServices}
          deletedServiceIds={deletedServiceIds}
          orgRole={orgRole}
          flash={flash}
          onClearFlash={() => setFlash(null)}
          openServiceId={openServiceId}
          onOpenServiceIdChange={setOpenServiceId}
          onNavigationContextChange={handlePageNavigationChange}
          onOpenVendor={(id) => openVendor(id)}
          onVendorsChange={(next) => {
            setVendors(next);
            setFlash("Vendor details updated successfully.");
          }}
          onOpenCard={(id, vendorId) => openCard(id, vendorId ?? crmRoute.id)}
          onNewCard={() => setCreateCardOpen(true)}
        />
      ) : (
        <RateCardDetailPage
          key={
            crmRoute.name === "rate-card"
              ? crmRoute.id
              : activeDraft?.id ??
                `new-${crmRoute.name === "rate-card-new" ? crmRoute.templateId : "x"}`
          }
          cardId={
            crmRoute.name === "rate-card"
              ? crmRoute.id
              : (activeDraft?.id ??
                blankFromTemplate(
                  crmRoute.name === "rate-card-new" ? crmRoute.templateId : "hotel",
                ))
          }
          seedCard={
            crmRoute.name === "rate-card-new" ? (activeDraft ?? undefined) : undefined
          }
          startEditing={crmRoute.name === "rate-card-new"}
          canEditMarkup={orgRole === "Owner"}
          canEdit={can(orgRole, "vendor.edit")}
          onDraftChange={
            crmRoute.name === "rate-card-new"
              ? (next) => setActiveDraft(next)
              : undefined
          }
        />
      )}

      {isVendorDetail && crmRoute.name === "vendor" ? (
        <CreateRateCardModal
          open={createCardOpen}
          vendorName={vendorName(crmRoute.id)}
          vendorId={crmRoute.id}
          createdServices={createdDirectoryServices}
          onClose={() => setCreateCardOpen(false)}
          onCreate={(templateId, serviceId) => {
            const draft = createBlankCard(templateId, vendorName(crmRoute.id), crmRoute.id, serviceId);
            if (draft.privateTransport || draft.activityTariff) saveTransportCard(draft);
            setActiveDraft(draft);
            setCreateCardOpen(false);
            setCrmRoute({
              name: "rate-card-new",
              templateId,
              vendorId: crmRoute.id,
            });
          }}
        />
      ) : null}

      {universalSearchOpen ? (
        <UniversalSearch items={universalSearchItems} onClose={closeUniversalSearch} />
      ) : null}

      <SettingsLauncherModal
        open={settingsOpen}
        orgRole={orgRole}
        onClose={() => setSettingsOpen(false)}
        onNavigate={openSettingsDestination}
      />

      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        returnFocusRef={notifBtnRef}
        onViewAll={() => goHub({ area: "notifications" })}
        onOpenPreferences={() => openAccountDestination("notification-preferences")}
      />

      <NotesPanel
        open={notesOpen}
        title={notesTitle}
        notes={notesItems}
        onClose={() => setNotesOpen(false)}
      />
    </AppShell>
  );
}
