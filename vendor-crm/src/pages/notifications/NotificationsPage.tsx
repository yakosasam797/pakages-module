import { useMemo, useState } from "react";
import { Button } from "@paryatech/design-system";
import { IconBell } from "../../icons";
import { SEED_NOTIFICATIONS } from "../../data/notifications";
import {
  SettingsCrumbs,
  SettingsPageHeader,
} from "../../components/settings/SettingsPageChrome";
import "../../components/settings/settings.css";

export function NotificationsPage({
  onOpenPreferences,
}: {
  onOpenPreferences: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [items, setItems] = useState(SEED_NOTIFICATIONS);
  const visible = useMemo(
    () => (filter === "unread" ? items.filter((n) => n.unread) : items),
    [filter, items],
  );

  return (
    <div className="settings-page">
      <SettingsCrumbs area="Notifications" page="All notifications" />
      <SettingsPageHeader
        icon={<IconBell size={18} />}
        title="Notifications"
        description="Mentions, assigned tasks, approvals, booking updates and system notices."
        actions={
          <>
            <Button variant="brand" size="sm" onClick={() => setFilter(filter === "all" ? "unread" : "all")}>
              {filter === "all" ? "Show unread" : "Show all"}
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={() => setItems((cur) => cur.map((n) => ({ ...n, unread: false })))}
            >
              Mark all as read
            </Button>
            <Button variant="primary" size="sm" onClick={onOpenPreferences}>
              Notification preferences
            </Button>
          </>
        }
      />

      <div className="settings-section" style={{ padding: 8 }}>
        {visible.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`notif-panel__item${n.unread ? " is-unread" : ""}`}
            onClick={() =>
              setItems((cur) =>
                cur.map((item) => (item.id === n.id ? { ...item, unread: false } : item)),
              )
            }
          >
            <p className="notif-panel__item-title">{n.title}</p>
            <p className="notif-panel__item-body">{n.body}</p>
            <p className="notif-panel__item-meta">{n.when}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
