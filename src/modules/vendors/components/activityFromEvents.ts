import type { ActivityEvent } from "../rateCard/types";
import type { ActivityRow } from "./ActivityPanel";

export function activityFromEvents(events: ActivityEvent[]): ActivityRow[] {
  return events.map((e, i) => {
    // ND03 stamp uses short date + clock time (e.g. "02 Sep" / "11:24")
    const date = e.date
      .replace(/\s*20\d{2}\s*$/, "")
      .replace(/\s*IST\s*$/i, "")
      .trim();
    const time = e.time.replace(/\s*IST\s*$/i, "").trim();
    return {
      id: `act-${i}-${e.date}-${e.time}`,
      date,
      time,
      member: e.member,
      role: e.role,
      initials: e.initials,
      avatarTone: e.avatarTone,
      event: e.event,
      module: e.area,
    };
  });
}
