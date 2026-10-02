import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Avatar,
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
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_TONE,
  VENDOR_BOOKINGS,
  type VendorBookingStatus,
} from "../data/vendorOverview";
import { IconCalendar, IconCheck, IconFilter, IconImport, IconMore, IconPin } from "../icons";
import { BookingViewModal } from "./BookingViewModal";
import { StatusChipWithDot } from "./StatusChipWithDot";
import "./VendorOverview.css";

type BookingStatusFilter = "all" | VendorBookingStatus;

const BOOKING_STATUS_FILTERS: Array<{ value: BookingStatusFilter; label: string }> = [
  { value: "all", label: "All bookings" },
  { value: "upcoming", label: BOOKING_STATUS_LABEL.upcoming },
  { value: "on-trip", label: BOOKING_STATUS_LABEL["on-trip"] },
  { value: "completed", label: BOOKING_STATUS_LABEL.completed },
];

/**
 * Full searchable bookings table for this vendor — lives on the Bookings tab.
 */
export function VendorBookingsPanel({ vendorId, initialBookingId, onCloseBooking }: { vendorId: string; initialBookingId?: string | null; onCloseBooking?: () => void }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [viewBooking, setViewBooking] = useState<(typeof VENDOR_BOOKINGS)[number] | null>(() => VENDOR_BOOKINGS.find((booking) => booking.id === initialBookingId && booking.vendorId === vendorId) ?? null);
  const [actionMenu, setActionMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) setFilterOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [filterOpen]);

  useEffect(() => {
    if (!actionMenu) return;
    const close = () => setActionMenu(null);
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("scroll", close, true);
    };
  }, [actionMenu]);

  const bookings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VENDOR_BOOKINGS.filter((row) => {
      if (row.vendorId !== vendorId) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.ref.toLowerCase().includes(q) ||
        row.service.toLowerCase().includes(q) ||
        row.ownerName.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter, vendorId]);
  const vendorHasBookings = VENDOR_BOOKINGS.some((row) => row.vendorId === vendorId);

  const headerState: CheckboxState =
    selected.length === 0
      ? "off"
      : selected.length === bookings.length && bookings.length > 0
        ? "on"
        : "indeterminate";

  return (
    <div className="vendor-bookings-panel dashboard-table-panel">
      <div className="vendor-overview__toolbar">
        <SearchField
          fullWidth
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected([]);
            setPage(1);
          }}
          placeholder="Search booking, service, or owner"
          aria-label="Search bookings from this vendor"
        />
        <div className="vendor-overview__tools">
          <div className="vendor-bookings-filter" ref={filterRef}>
            <Tooltip tip="Filter by status">
              <IconButton
                className={statusFilter === "all" ? undefined : "is-active"}
                label={`Filter bookings${
                  statusFilter === "all" ? "" : `: ${BOOKING_STATUS_LABEL[statusFilter]}`
                }`}
                aria-expanded={filterOpen}
                aria-haspopup="menu"
                onClick={() => setFilterOpen((open) => !open)}
              >
                <IconFilter />
              </IconButton>
            </Tooltip>
            {filterOpen ? (
              <div
                className="vendor-bookings-filter__menu"
                role="menu"
                aria-label="Filter bookings by status"
              >
                {BOOKING_STATUS_FILTERS.map((option) => (
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
        </div>
      </div>

      {statusFilter !== "all" ? (
        <div className="vendor-bookings-filter__summary" role="status">
          Showing {BOOKING_STATUS_LABEL[statusFilter].toLowerCase()} bookings
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setSelected([]);
              setPage(1);
            }}
          >
            Clear filter
          </button>
        </div>
      ) : null}

      <div className="vendor-overview__sheet dashboard-table-end">
        {bookings.length === 0 ? (
          <EmptyState
            title={vendorHasBookings ? "No bookings match this view" : "No bookings for this vendor yet"}
            description={vendorHasBookings ? "Clear the filter or try another booking name, reference, service, or owner." : "Bookings linked to this vendor will appear here."}
          />
        ) : (
          <>
            <DataSheet className="vendor-bookings-sheet" aria-label="Bookings from this vendor">
              <DataSheetHeader>
                <DataSheetCell check>
                  <Checkbox
                    state={headerState}
                    onCheckedChange={(state) =>
                      setSelected(state === "on" ? bookings.map((r) => r.id) : [])
                    }
                    label="Select all bookings"
                  />
                </DataSheetCell>
                <DataSheetCell>Booking</DataSheetCell>
                <DataSheetCell>Travel</DataSheetCell>
                <DataSheetCell>Service</DataSheetCell>
                <DataSheetCell>Status</DataSheetCell>
                <DataSheetCell>Owner</DataSheetCell>
                <DataSheetCell>Action</DataSheetCell>
              </DataSheetHeader>
              {bookings.map((row) => (
                <DataSheetRow
                  key={row.id}
                  className="data-row--interactive"
                  role="link"
                  tabIndex={0}
                  aria-label={`Open ${row.title}`}
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest("button, a, input, select, textarea")) return;
                    setViewBooking(row);
                  }}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setViewBooking(row);
                    }
                  }}
                >
                  <DataSheetCell check>
                    <Checkbox
                      state={selected.includes(row.id) ? "on" : "off"}
                      onCheckedChange={(state) =>
                        setSelected((cur) =>
                          state === "on"
                            ? cur.includes(row.id)
                              ? cur
                              : [...cur, row.id]
                            : cur.filter((id) => id !== row.id),
                        )
                      }
                      label={`Select ${row.title}`}
                    />
                  </DataSheetCell>
                  <DataSheetCell>
                    <LeadCell icon={<IconPin />} title={row.title} subtitle={row.ref} />
                  </DataSheetCell>
                  <DataSheetCell>
                    <StackCell>
                      <StackLine mono>
                        <span className="vendor-bookings-sheet__travel">
                          <IconCalendar size={13} />
                          {row.travel}
                        </span>
                      </StackLine>
                      <StackLine muted>{row.party}</StackLine>
                    </StackCell>
                  </DataSheetCell>
                  <DataSheetCell>
                    <StackCell>
                      <StackLine>{row.service}</StackLine>
                      <StackLine muted>{row.serviceDetail}</StackLine>
                    </StackCell>
                  </DataSheetCell>
                  <DataSheetCell>
                    <StatusChipWithDot tone={BOOKING_STATUS_TONE[row.status]}>
                      {BOOKING_STATUS_LABEL[row.status]}
                    </StatusChipWithDot>
                  </DataSheetCell>
                  <DataSheetCell>
                    <span className="vendor-bookings-sheet__owner">
                      <Avatar tone="pink" size={26}>
                        {row.ownerInitials}
                      </Avatar>
                      <span className="vendor-bookings-sheet__owner-name">{row.ownerName}</span>
                    </span>
                  </DataSheetCell>
                  <DataSheetCell className="vendor-bookings-sheet__action">
                    <IconButton
                      label={`More actions for ${row.title}`}
                      aria-haspopup="menu"
                      aria-expanded={actionMenu?.id === row.id}
                      onClick={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setActionMenu((current) => current?.id === row.id ? null : {
                          id: row.id,
                          top: Math.min(rect.bottom + 6, window.innerHeight - 90),
                          left: Math.max(12, Math.min(window.innerWidth - 190, rect.right - 178)),
                        });
                      }}
                    ><IconMore /></IconButton>
                  </DataSheetCell>
                </DataSheetRow>
              ))}
              <DashboardDataSheetFill columns={7} />
            </DataSheet>
            {selected.length > 0 ? (
              <ListBulkBar
                label={`${selected.length} booking${selected.length === 1 ? "" : "s"} selected`}
              >
                <Button variant="brand" size="sm">
                  <IconImport />
                  Export
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                  Clear
                </Button>
              </ListBulkBar>
            ) : null}
            <Pagination
              rangeLabel={`Showing 1–${bookings.length} of ${bookings.length}`}
              page={page}
              pageCount={1}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {actionMenu ? createPortal(<div
        className="vendor-bookings-sheet__menu"
        role="menu"
        aria-label="Booking actions"
        style={{ top: actionMenu.top, left: actionMenu.left }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button type="button" role="menuitem" onClick={() => {
          setViewBooking(VENDOR_BOOKINGS.find((booking) => booking.id === actionMenu.id) || null);
          setActionMenu(null);
        }}>View booking</button>
        <button type="button" role="menuitem" onClick={() => {
          const booking = VENDOR_BOOKINGS.find((item) => item.id === actionMenu.id);
          if (booking) void navigator.clipboard?.writeText(booking.ref);
          setActionMenu(null);
        }}>Copy booking reference</button>
      </div>, document.body) : null}

      <BookingViewModal
        open={viewBooking !== null}
        booking={viewBooking}
        onClose={() => { setViewBooking(null); onCloseBooking?.(); }}
      />
    </div>
  );
}
