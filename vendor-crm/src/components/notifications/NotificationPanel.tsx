import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Button, IconButton } from "@paryatech/design-system";
import { IconClose } from "../../icons";
import {
  SEED_NOTIFICATIONS,
  type AppNotification,
} from "../../data/notifications";
import "../settings/settings.css";

type Filter = "unread" | "all";

export function NotificationPanel({
  open,
  onClose,
  onViewAll,
  onOpenPreferences,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  onViewAll: () => void;
  onOpenPreferences: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>("unread");
  const [items, setItems] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [position, setPosition] = useState({ top: 68, right: 16 });

  const visible = useMemo(
    () => (filter === "unread" ? items.filter((n) => n.unread) : items),
    [filter, items],
  );

  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const host = returnFocusRef?.current;
      const anchor = host?.querySelector?.("button") ?? host;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: Math.max(12, window.innerWidth - rect.right),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [open, returnFocusRef]);

  useEffect(() => {
    if (!open) return;
    const host = returnFocusRef?.current;
    const returnTarget = host?.querySelector?.("button") ?? host;
    const t = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 0);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      if (returnTarget && "focus" in returnTarget) (returnTarget as HTMLElement).focus();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) return null;

  return (
    <div
      className="settings-launcher-overlay notif-popover-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="settings-launcher notif-modal notif-popover"
        role="dialog"
        aria-labelledby={titleId}
        style={
          {
            "--notif-top": `${position.top}px`,
            "--notif-right": `${position.right}px`,
          } as CSSProperties
        }
      >
        <div className="settings-launcher__head">
          <div>
            <h2 id={titleId} className="settings-launcher__title">
              Notification center
            </h2>
          </div>
          <IconButton label="Close notifications" onClick={onClose}>
            <IconClose />
          </IconButton>
        </div>

        <div className="notif-modal__filters" role="tablist" aria-label="Notification filters">
          <button
            type="button"
            role="tab"
            aria-selected={filter === "unread"}
            className={`notif-modal__filter${filter === "unread" ? " is-active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            className={`notif-modal__filter${filter === "all" ? " is-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <Button
            variant="brand"
            size="sm"
            className="notif-modal__mark"
            onClick={() => setItems((cur) => cur.map((n) => ({ ...n, unread: false })))}
          >
            Mark all as read
          </Button>
        </div>

        <div className="notif-modal__list">
          {visible.length === 0 ? (
            <div className="settings-coming">
              <p className="settings-coming__title">You’re all caught up</p>
              <p className="settings-coming__desc">No unread notifications right now.</p>
            </div>
          ) : (
            visible.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`notif-modal__item${n.unread ? " is-unread" : ""}`}
                onClick={() =>
                  setItems((cur) =>
                    cur.map((item) => (item.id === n.id ? { ...item, unread: false } : item)),
                  )
                }
              >
                <p className="notif-modal__item-title">{n.title}</p>
                <p className="notif-modal__item-body">{n.body}</p>
                <p className="notif-modal__item-meta">
                  {kindLabel(n.kind)} · {n.when}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="notif-modal__foot">
          <Button
            variant="brand"
            size="sm"
            onClick={() => {
              onClose();
              onViewAll();
            }}
          >
            View all notifications
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onOpenPreferences();
            }}
          >
            Notification preferences
          </Button>
        </div>
      </div>
    </div>
  );
}

function kindLabel(kind: AppNotification["kind"]) {
  switch (kind) {
    case "mention":
      return "Mentions";
    case "task":
      return "Assigned tasks";
    case "approval":
      return "Approval requests";
    case "booking":
      return "Booking updates";
    case "finance":
      return "Payment or finance";
    case "system":
      return "System notices";
  }
}
