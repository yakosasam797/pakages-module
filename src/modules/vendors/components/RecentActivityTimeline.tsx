import { Avatar } from "@paryatech/design-system";
import {
  IconBookings,
  IconBriefcase,
  IconCalendar,
  IconCard,
  IconFile,
  IconFinance,
  IconMail,
  IconModule,
  IconPackages,
  IconTasks,
  IconVendors,
} from "../icons";
import type { ActivityRow } from "./ActivityPanel";

function ActivityContextIcon({ module }: { module: string }) {
  const key = module.trim().toLowerCase();

  if (key.includes("communication")) return <IconMail size={13} />;
  if (key.includes("service")) return <IconBriefcase size={13} />;
  if (key.includes("vendor")) return <IconVendors size={13} />;
  if (key.includes("booking")) return <IconBookings size={13} />;
  if (key.includes("finance")) return <IconFinance size={13} />;
  if (key.includes("doc") || key.includes("source")) return <IconFile size={13} />;
  if (key.includes("package")) return <IconPackages size={13} />;
  if (key.includes("task")) return <IconTasks size={13} />;
  if (key.includes("rate") || key === "card") return <IconCard size={13} />;
  if (key.includes("rule") || key.includes("season")) return <IconCalendar size={13} />;

  return <IconModule size={13} />;
}

export function RecentActivityTimeline({ rows }: { rows: ActivityRow[] }) {
  if (rows.length === 0) {
    return <p className="vo-activity-stream__empty">No recent activity yet.</p>;
  }

  return (
    <ol className="vo-activity-stream" aria-label="Recent vendor activity timeline">
      {rows.map((row, index) => (
        <li className="vo-activity-stream__item" key={row.id}>
          <time className="vo-activity-stream__when">
            <span className="vo-activity-stream__date">{row.date}</span>
            <span className="vo-activity-stream__time">{row.time}</span>
          </time>

          <div className="vo-activity-stream__rail" aria-hidden="true">
            <span
              className={`vo-activity-stream__marker${index === 0 ? " is-latest" : ""}`}
            />
          </div>

          <div className="vo-activity-stream__event">
            <span className="vo-activity-stream__event-title">{row.event}</span>
            <span className="vo-activity-stream__context">
              <ActivityContextIcon module={row.module} />
              {row.context ?? row.module}
            </span>
          </div>

          <div className="vo-activity-stream__member">
            <Avatar tone={row.avatarTone === "pink" ? "pink" : "default"} size={30}>
              {row.initials}
            </Avatar>
            <div className="vo-activity-stream__member-copy">
              <span className="vo-activity-stream__member-name">{row.member}</span>
              <span className="vo-activity-stream__member-role">{row.role}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
