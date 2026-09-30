import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Avatar,
  Button,
  Checkbox,
  DataSheet,
  DataSheetCell,
  DataSheetHeader,
  DataSheetRow,
  IconButton,
  Pagination,
  SearchField,
  StackCell,
  StackLine,
  type CheckboxState,
} from "@paryatech/design-system";
import { DashboardDataSheetFill } from "./DashboardDataSheet";
import {
  IconBookings,
  IconBriefcase,
  IconCalendar,
  IconCard,
  IconClock,
  IconClose,
  IconFile,
  IconFinance,
  IconMail,
  IconModule,
  IconMore,
  IconPackages,
  IconTasks,
  IconTrash,
  IconVendors,
} from "../icons";
import "./ActivityPanel.css";

export type ActivityRow = {
  id: string;
  date: string;
  time: string;
  member: string;
  role: string;
  initials: string;
  avatarTone: "pink" | "default" | "warn" | "channel";
  event: string;
  module: string;
  context?: string;
  relatedServiceId?: string;
  description?: string;
  details?: { label: string; value: string }[];
};

const ACTIVITY_PAGE_SIZE = 5;

function ActivityModuleIcon({ module, size = 15 }: { module: string; size?: number }) {
  const key = module.trim().toLowerCase();
  if (key.includes("communication")) return <IconMail size={size} />;
  if (key.includes("service")) return <IconBriefcase size={size} />;
  if (key.includes("vendor")) return <IconVendors size={size} />;
  if (key.includes("booking")) return <IconBookings size={size} />;
  if (key.includes("finance")) return <IconFinance size={size} />;
  if (key.includes("doc") || key.includes("source")) return <IconFile size={size} />;
  if (key.includes("package")) return <IconPackages size={size} />;
  if (key.includes("task")) return <IconTasks size={size} />;
  if (key.includes("rate") || key === "card") return <IconCard size={size} />;
  if (key.includes("rule") || key.includes("season")) return <IconCalendar size={size} />;
  return <IconModule size={size} />;
}

export function relatedActivityLabel(row: ActivityRow): string {
  const key = row.module.trim().toLowerCase();
  if (row.relatedServiceId) return "Go to service";
  if (key.includes("service")) return "Go to services";
  if (key.includes("vendor")) return "Go to vendor overview";
  if (key.includes("booking")) return "Go to bookings";
  if (key.includes("rate")) return "Go to rate cards";
  if (key.includes("package")) return "Go to packages";
  if (key.includes("finance")) return "Go to finance";
  if (key.includes("doc")) return "Go to docs";
  if (key.includes("task")) return "Go to tasks";
  if (key.includes("communication")) return "Go to communications";
  return "Go to related section";
}

export function ActivityPanel({
  rows,
  searchPlaceholder = "Search activity",
  ariaLabel = "Activity",
  vendorName,
  onRemoveActivity,
  onOpenRelated,
  showPagination = true,
  variant = "sheet",
}: {
  rows: ActivityRow[];
  searchPlaceholder?: string;
  ariaLabel?: string;
  vendorName?: string;
  onRemoveActivity?: (id: string) => void;
  onOpenRelated?: (row: ActivityRow) => void;
  showPagination?: boolean;
  variant?: "sheet" | "timeline";
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [viewing, setViewing] = useState<ActivityRow | null>(null);
  const [removing, setRemoving] = useState<ActivityRow | null>(null);
  const titleId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) =>
      !q || `${row.date} ${row.time} ${row.event} ${row.member} ${row.role} ${row.module} ${row.context ?? ""}`.toLowerCase().includes(q),
    );
  }, [rows, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / ACTIVITY_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const firstRow = (currentPage - 1) * ACTIVITY_PAGE_SIZE;
  const visibleRows = showPagination ? filtered.slice(firstRow, firstRow + ACTIVITY_PAGE_SIZE) : filtered;
  const visibleIds = visibleRows.map((row) => row.id);
  const visibleSelected = visibleIds.filter((id) => selected.includes(id));
  const headerState: CheckboxState = visibleSelected.length === 0 ? "off" : visibleSelected.length === visibleIds.length ? "on" : "indeterminate";

  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(null);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("wheel", close, { passive: true });
    document.addEventListener("touchmove", close, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("wheel", close);
      document.removeEventListener("touchmove", close);
    };
  }, [openMenu]);

  useEffect(() => {
    if (!viewing && !removing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setViewing(null); setRemoving(null); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [viewing, removing]);

  const toggleAll = (state: CheckboxState) => {
    setSelected((current) => state === "on"
      ? [...new Set([...current, ...visibleIds])]
      : current.filter((id) => !visibleIds.includes(id)));
  };
  const toggleRow = (id: string, state: CheckboxState) => {
    setSelected((current) => state === "on" ? [...new Set([...current, id])] : current.filter((item) => item !== id));
  };
  const showMenu = (id: string, anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect();
    setOpenMenu((current) => current?.id === id ? null : {
      id,
      top: Math.min(rect.bottom + 5, window.innerHeight - 92),
      left: Math.max(12, Math.min(rect.right - 172, window.innerWidth - 184)),
    });
  };

  return (
    <div className={`act dashboard-table-panel${variant === "timeline" ? " act--timeline" : ""}`}>
      <div className="act-toolbar">
        <SearchField fullWidth value={query} onChange={(event) => {
          setQuery(event.target.value);
          setPage(1);
          setSelected([]);
        }} placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
      </div>

      <div className="act-sheet-wrap dashboard-table-end">
        {variant === "timeline" ? <div className="act-timeline" role="region" aria-label={ariaLabel}>
          <div className="act-timeline__select-all"><Checkbox state={headerState} label="Select all activity" onCheckedChange={toggleAll} /><span>Select all</span></div>
          {filtered.length === 0 ? <p className="act-timeline__empty">No activity matches this search.</p> : <ol className="act-timeline__list">
            {visibleRows.map((row) => <li className="act-timeline__item" key={row.id}>
              <div className="act-timeline__select"><Checkbox state={selected.includes(row.id) ? "on" : "off"} label={`Select ${row.event}`} onCheckedChange={(state) => toggleRow(row.id, state)} /></div>
              <div className="act-timeline__when">
                <span className="act-timeline__rail" aria-hidden="true"><span className="act-timeline__icon"><ActivityModuleIcon module={row.module} size={16} /></span></span>
                <span className="act-timeline__date pt-mono"><span>{row.date}</span><span>{row.time}</span></span>
              </div>
              <div className="act-timeline__entry">
                <div className="act-timeline__heading"><strong>{row.event}</strong></div>
                <span className="act-timeline__context"><ActivityModuleIcon module={row.module} size={13} />{row.context ?? row.module}</span>
              </div>
              <span className="act-timeline__member"><Avatar tone={row.avatarTone === "pink" ? "pink" : "default"} size={28}>{row.initials}</Avatar><span className="act-timeline__member-copy"><strong>{row.member}</strong><small>{row.role}</small></span></span>
              <div className="act-timeline__actions"><IconButton label={`More actions for ${row.event}`} aria-haspopup="menu" aria-expanded={openMenu?.id === row.id} onClick={(event) => showMenu(row.id, event.currentTarget)}><IconMore /></IconButton></div>
            </li>)}
          </ol>}
          {selected.length > 0 ? <div className="act-bulk"><span>{selected.length} event{selected.length === 1 ? "" : "s"} selected</span><Button variant="ghost" size="sm" onClick={() => setSelected([])}>Clear</Button></div> : null}
        </div> :
        <DataSheet className="act-sheet" aria-label={ariaLabel}>
          <DataSheetHeader>
            <DataSheetCell check><Checkbox state={headerState} label="Select all activity" onCheckedChange={toggleAll} /></DataSheetCell>
            <DataSheetCell>Date</DataSheetCell>
            <DataSheetCell>Event</DataSheetCell>
            <DataSheetCell>Member</DataSheetCell>
            <DataSheetCell>Role</DataSheetCell>
            <DataSheetCell>Action</DataSheetCell>
          </DataSheetHeader>
          {filtered.length === 0 ? (
            <DataSheetRow><DataSheetCell className="act-empty-cell">No activity matches this search.</DataSheetCell></DataSheetRow>
          ) : visibleRows.map((row) => (
            <DataSheetRow key={row.id}>
              <DataSheetCell check><Checkbox state={selected.includes(row.id) ? "on" : "off"} label={`Select ${row.event}`} onCheckedChange={(state) => toggleRow(row.id, state)} /></DataSheetCell>
              <DataSheetCell><StackCell>
                <StackLine mono icon={<IconCalendar size={13} />}>{row.date}</StackLine>
                <StackLine muted mono icon={<IconClock />}>{row.time}</StackLine>
              </StackCell></DataSheetCell>
              <DataSheetCell><div className="act-event">
                <span className="act-event__title" title={row.event}>{row.event}</span>
                <span className="act-event__context"><ActivityModuleIcon module={row.module} size={13} />{row.context ?? row.module}</span>
              </div></DataSheetCell>
              <DataSheetCell><div className="act-member">
                <Avatar tone={row.avatarTone === "pink" ? "pink" : "default"} size={28}>{row.initials}</Avatar>
                <span className="act-member__name">{row.member}</span>
              </div></DataSheetCell>
              <DataSheetCell><span className="act-role">{row.role}</span></DataSheetCell>
              <DataSheetCell className="act-action"><IconButton label={`More actions for ${row.event}`} aria-haspopup="menu" aria-expanded={openMenu?.id === row.id} onClick={(event) => showMenu(row.id, event.currentTarget)}><IconMore /></IconButton></DataSheetCell>
            </DataSheetRow>
          ))}
          <DashboardDataSheetFill columns={6} />
        </DataSheet>}

        {variant === "timeline" && showPagination ? <div className="act-timeline__pagination"><Pagination rangeLabel={`Showing ${filtered.length ? firstRow + 1 : 0}–${Math.min(firstRow + ACTIVITY_PAGE_SIZE, filtered.length)} of ${filtered.length}`} page={currentPage} pageCount={pageCount} onPageChange={setPage} /></div> : null}
        {variant === "sheet" && selected.length > 0 ? <div className="act-bulk"><span>{selected.length} event{selected.length === 1 ? "" : "s"} selected</span><Button variant="ghost" size="sm" onClick={() => setSelected([])}>Clear</Button></div> : null}
        {variant === "sheet" && showPagination ? <Pagination rangeLabel={`Showing ${filtered.length ? firstRow + 1 : 0}–${Math.min(firstRow + ACTIVITY_PAGE_SIZE, filtered.length)} of ${filtered.length}`} page={currentPage} pageCount={pageCount} onPageChange={setPage} /> : null}
      </div>

      {openMenu ? createPortal(<div className="act-menu" role="menu" aria-label="Activity actions" style={{ top: openMenu.top, left: openMenu.left }} onPointerDown={(event) => event.stopPropagation()}>
        <button type="button" role="menuitem" onClick={() => { setViewing(rows.find((row) => row.id === openMenu.id) ?? null); setOpenMenu(null); }}>View Activity</button>
        {onRemoveActivity ? <button type="button" role="menuitem" className="act-menu__danger" onClick={() => { setRemoving(rows.find((row) => row.id === openMenu.id) ?? null); setOpenMenu(null); }}>Remove Activity</button> : null}
      </div>, document.body) : null}

      {viewing ? createPortal(<div className="pt-modal-overlay open" role="presentation" onClick={() => setViewing(null)}><div className="pt-modal act-detail-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()}>
        <header className="pt-modal__head"><h2 className="pt-modal__title" id={titleId}>Activity details</h2><IconButton label="Close activity details" onClick={() => setViewing(null)}><IconClose /></IconButton></header>
        <div className="pt-modal__body act-detail-body">
          <div className="act-detail-hero"><span className="act-detail-hero__icon" aria-hidden="true"><ActivityModuleIcon module={viewing.module} size={19} /></span><div><h3>{viewing.event}</h3><p>{viewing.date} · {viewing.time} · {viewing.context ?? viewing.module}</p></div></div>
          <div className="act-detail-section"><h4>What happened</h4><p>{viewing.description ?? "No additional notes were recorded for this activity."}</p></div>
          {viewing.details?.length ? <dl className="act-detail-facts">{viewing.details.map((detail) => <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}</dl> : null}
          <div className="act-detail-meta"><Avatar tone={viewing.avatarTone === "pink" ? "pink" : "default"} size={32}>{viewing.initials}</Avatar><span><strong>{viewing.member}</strong><small>{viewing.role} · {vendorName ?? viewing.module}</small></span></div>
        </div>
        <footer className="pt-modal__foot"><Button variant="ghost" size="sm" onClick={() => setViewing(null)}>Close</Button>{onOpenRelated ? <Button variant="primary" size="sm" onClick={() => { onOpenRelated(viewing); setViewing(null); }}>{relatedActivityLabel(viewing)}</Button> : null}</footer>
      </div></div>, document.body) : null}

      {removing ? createPortal(<div className="pt-modal-overlay open" role="presentation" onClick={() => setRemoving(null)}><div className="pt-modal act-detail-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()}>
        <header className="pt-modal__head"><h2 className="pt-modal__title" id={titleId}>Remove Activity</h2><IconButton label="Close remove activity" onClick={() => setRemoving(null)}><IconClose /></IconButton></header>
        <div className="pt-modal__body"><p className="act-remove-copy">Remove “{removing.event}” from this vendor’s activity history?</p></div>
        <footer className="pt-modal__foot"><Button variant="ghost" size="sm" onClick={() => setRemoving(null)}>Keep Activity</Button><Button variant="primary" size="sm" onClick={() => { onRemoveActivity?.(removing.id); setSelected((current) => current.filter((id) => id !== removing.id)); setRemoving(null); }}><IconTrash />Remove Activity</Button></footer>
      </div></div>, document.body) : null}
    </div>
  );
}
