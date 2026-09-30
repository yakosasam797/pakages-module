import { useEffect, useId } from "react";
import { Avatar, Button, IconButton } from "@paryatech/design-system";
import {
  BOOKING_FINANCE_LABEL,
  BOOKING_FINANCE_TONE,
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_TONE,
  type VendorBooking,
} from "../data/vendorOverview";
import { IconCalendar, IconClose } from "../icons";
import { StatusChipWithDot } from "./StatusChipWithDot";
import "./VendorFormModal.css";
import "./BookingViewModal.css";

/**
 * Lightweight booking read modal — opens from Overview / Bookings tables.
 * Full booking workspace can replace this later; same shell language as ND03 modals.
 */
export function BookingViewModal({
  open,
  booking,
  onClose,
}: {
  open: boolean;
  booking: VendorBooking | null;
  onClose: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  if (!open || !booking) return null;

  return (
    <div className="pt-modal-overlay open" role="presentation" onClick={onClose}>
      <div
        className="pt-modal pt-modal--wide booking-view-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-modal__head booking-view-modal__head">
          <div className="booking-view-modal__titles">
            <h2 id={titleId} className="pt-modal__title">
              {booking.title}
            </h2>
          </div>
          <IconButton label="Close booking" onClick={onClose}>
            <IconClose />
          </IconButton>
        </div>

        <div className="pt-modal__body booking-view-modal__body">
          <div className="booking-view-modal__status">
            <StatusChipWithDot tone={BOOKING_STATUS_TONE[booking.status]}>
              {BOOKING_STATUS_LABEL[booking.status]}
            </StatusChipWithDot>
            <StatusChipWithDot tone={BOOKING_FINANCE_TONE[booking.finance]}>
              {BOOKING_FINANCE_LABEL[booking.finance]}
            </StatusChipWithDot>
          </div>

          <dl className="booking-view-modal__facts">
            <div>
              <dt>Booking reference</dt>
              <dd className="pt-mono">{booking.ref}</dd>
            </div>
            <div>
              <dt>Travel</dt>
              <dd>
                <span className="booking-view-modal__travel">
                  <IconCalendar size={13} />
                  {booking.travel}
                </span>
                <span className="booking-view-modal__muted">{booking.party}</span>
              </dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>
                {booking.service}
                <span className="booking-view-modal__muted">{booking.serviceDetail}</span>
              </dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd className="pt-mono">{booking.amount}</dd>
            </div>
            <div>
              <dt>Owner</dt>
              <dd>
                <span className="booking-view-modal__owner">
                  <Avatar tone="pink" size={26}>
                    {booking.ownerInitials}
                  </Avatar>
                  {booking.ownerName}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="pt-modal__foot">
          <Button variant="brand" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm">
            Open full booking
          </Button>
        </div>
      </div>
    </div>
  );
}
