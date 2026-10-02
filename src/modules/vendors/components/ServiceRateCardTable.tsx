import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Checkbox, DataSheet, DataSheetCell, DataSheetHeader, DataSheetRow, IconButton, LeadCell, Pagination, type CheckboxState } from "@paryatech/design-system";
import type { VendorServiceConnection } from "../data/vendorDirectory";
import type { Vendor } from "../data/vendors";
import { getDetailCard } from "../rateCard/cards";
import { IconCard, IconMore, IconPin } from "../icons";
import { DashboardDataSheetFill } from "./DashboardDataSheet";
import "./ServiceRateCardTable.css";

const PAGE_SIZE = 5;

export function ServiceRateCardTable({ connections, vendors, activeId, onSelect, onOpenRateCard }: {
  connections: VendorServiceConnection[];
  vendors: Vendor[];
  activeId: string;
  onSelect: (id: string) => void;
  onOpenRateCard: (vendorId: string, rateCardId: string) => void;
}) {
  const cards = connections.filter((connection) => connection.rateCardId);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const pageCount = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const first = (currentPage - 1) * PAGE_SIZE;
  const visible = cards.slice(first, first + PAGE_SIZE);
  const visibleIds = visible.map((item) => item.id);
  const selectedVisible = visibleIds.filter((id) => selected.includes(id));
  const headerState: CheckboxState = !selectedVisible.length ? "off" : selectedVisible.length === visibleIds.length ? "on" : "indeterminate";

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("scroll", close, true);
    };
  }, [menu]);

  if (!cards.length) return null;
  const menuConnection = cards.find((item) => item.id === menu?.id);
  return <section className="service-rate-card-list" aria-label="Linked rate cards">
    <div className="service-rate-card-list__sheet dashboard-table-end">
      <DataSheet className="service-rate-card-sheet" aria-label="Rate cards for this service">
        <DataSheetHeader>
          <DataSheetCell check><Checkbox state={headerState} label="Select all rate cards on this page" onCheckedChange={(state) => setSelected((current) => state === "on" ? [...new Set([...current, ...visibleIds])] : current.filter((id) => !visibleIds.includes(id)))} /></DataSheetCell>
          <DataSheetCell>Rate card</DataSheetCell>
          <DataSheetCell>Vendors</DataSheetCell>
          <DataSheetCell>Regions served</DataSheetCell>
          <DataSheetCell className="service-rate-card-sheet__action">Action</DataSheetCell>
        </DataSheetHeader>
        {visible.map((item) => {
          const vendor = vendors.find((candidate) => candidate.id === item.vendorId);
          const detail = getDetailCard(item.rateCardId);
          return <DataSheetRow key={item.id} className={`data-row--interactive${activeId === item.id ? " service-rate-card-sheet__row--active" : ""}`} role="button" tabIndex={0} aria-label={`Show details for ${item.rateCardName}`} onClick={(event) => { if (!(event.target as HTMLElement).closest("button, input")) onSelect(item.id); }} onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onSelect(item.id); } }}>
            <DataSheetCell check><Checkbox state={selected.includes(item.id) ? "on" : "off"} label={`Select ${item.rateCardName}`} onCheckedChange={(state) => setSelected((current) => state === "on" ? [...new Set([...current, item.id])] : current.filter((id) => id !== item.id))} /></DataSheetCell>
            <DataSheetCell><LeadCell icon={<IconCard size={18} />} title={item.rateCardName} subtitle={detail?.ref ?? item.rateCardId.toUpperCase()} /></DataSheetCell>
            <DataSheetCell><span className="service-rate-card-sheet__vendor">{vendor?.imageUrl ? <img src={vendor.imageUrl} alt="" width={34} height={34} /> : <span aria-hidden="true">{vendor?.initials ?? "?"}</span>}<strong>{vendor?.name ?? "Vendor unavailable"}</strong></span></DataSheetCell>
            <DataSheetCell><span className="service-rate-card-sheet__region"><IconPin size={15} />{vendor?.location ?? "Not set"}</span></DataSheetCell>
            <DataSheetCell className="service-rate-card-sheet__action"><IconButton label={`More actions for ${item.rateCardName}`} aria-haspopup="menu" aria-expanded={menu?.id === item.id} onClick={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setMenu((current) => current?.id === item.id ? null : { id: item.id, top: rect.bottom + 6, left: Math.max(12, Math.min(window.innerWidth - 184, rect.right - 172)) }); }}><IconMore /></IconButton></DataSheetCell>
          </DataSheetRow>;
        })}
        <DashboardDataSheetFill columns={5} />
      </DataSheet>
      <Pagination rangeLabel={`Showing ${first + 1}–${Math.min(first + PAGE_SIZE, cards.length)} of ${cards.length} rate cards`} page={currentPage} pageCount={pageCount} onPageChange={setPage} />
    </div>
    {menu && menuConnection ? createPortal(<div className="service-rate-card-sheet__menu" role="menu" aria-label="Rate card actions" style={{ top: menu.top, left: menu.left }} onPointerDown={(event) => event.stopPropagation()}>
      <button type="button" role="menuitem" onClick={() => { onSelect(menuConnection.id); setMenu(null); }}>View rate details</button>
      <button type="button" role="menuitem" onClick={() => { onOpenRateCard(menuConnection.vendorId, menuConnection.rateCardId); setMenu(null); }}>Open rate card</button>
    </div>, document.body) : null}
  </section>;
}
