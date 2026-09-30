import { BED_LABEL, formatMoney } from "./cards";
import { TEST_CAL, TEST_DATES, type GuestRule, type RateCardDetail } from "./types";

export interface QuoteInput {
  checkIn: number;
  nights: number;
  roomIndex: number;
  mealIndex: number;
  adults: number;
  rooms: number;
  children: { age: number; bed: "yes" | "no" }[];
}

export interface QuoteLine {
  label: string;
  note?: string;
  amount: number | null;
  emphasis?: boolean;
}

export interface NightRow {
  date: string;
  season: string;
  rule: string;
  ruleTone: "ok" | "weekend" | "warn" | "danger";
  roomAmount: number | null;
  guestAmount: number;
}

export interface QuoteResult {
  blocker: string;
  trace: { step: string; detail: string }[];
  lines: QuoteLine[];
  nights: NightRow[];
  total: number | null;
  totalLabel: string;
  totalNote: string;
  indicative: boolean;
  nightsLabel: string;
  paxSummary: string;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function parseDMY(str: string): Date | null {
  const m = (str || "").trim().match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/);
  if (!m) return null;
  const mi = MONTHS.indexOf(m[2].toLowerCase());
  if (mi < 0) return null;
  return new Date(Number(m[3]), mi, Number(m[1]));
}

function formatDMY(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  next.setDate(next.getDate() + n);
  return next;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Parse "15 Apr – 30 Sep 2026" or "20 Dec 2026 – 14 Apr 2027". */
function parseSeasonBounds(dates: string): { start: Date; end: Date } | null {
  const parts = dates.split(/\u2013|–|-/).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const end = parseDMY(parts[parts.length - 1]);
  if (!end) return null;
  let start = parseDMY(parts[0]);
  if (!start) {
    // "15 Apr" without year — use end year, or end year - 1 if month > end month
    const m = parts[0].match(/(\d{1,2})\s+([A-Za-z]{3})/);
    if (!m) return null;
    const mi = MONTHS.indexOf(m[2].toLowerCase());
    if (mi < 0) return null;
    const day = Number(m[1]);
    let year = end.getFullYear();
    if (mi > end.getMonth() || (mi === end.getMonth() && day > end.getDate())) year -= 1;
    start = new Date(year, mi, day);
  }
  return { start, end };
}

function resolveSeason(
  card: RateCardDetail,
  date: Date,
  fallbackCal: [number, string][] | undefined,
  sampleIdx: number,
): { si: number; sname: string } {
  for (let i = 0; i < card.seasons.length; i++) {
    const bounds = parseSeasonBounds(card.seasons[i].dates);
    if (!bounds) continue;
    const t = startOfDay(date);
    if (t >= startOfDay(bounds.start) && t <= startOfDay(bounds.end)) {
      return { si: i, sname: card.seasons[i].name };
    }
  }
  if (fallbackCal && sampleIdx >= 0 && sampleIdx < fallbackCal.length) {
    const [si, sname] = fallbackCal[sampleIdx];
    return { si, sname };
  }
  return { si: -1, sname: "Unpriced" };
}

function ageMatchesBand(age: number, band: string): boolean {
  const plus = band.match(/(\d+)\+/);
  if (plus) return age >= Number(plus[1]);
  const range = band.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (!range) return false;
  return age >= Number(range[1]) && age <= Number(range[2]);
}

function bedMatches(ruleBed: string, wantsExtraBed: boolean): boolean {
  if (wantsExtraBed) return ruleBed === "extra_bed";
  return ruleBed === "no_bed" || ruleBed === "existing_bed" || ruleBed === "cot";
}

function findChildRule(
  guests: GuestRule[],
  roomId: string,
  age: number,
  bed: "yes" | "no",
): GuestRule | undefined {
  return guests.find((g) => {
    if (g[0] !== roomId) return false;
    if (g[1] === "Extra adult") return false;
    if (!ageMatchesBand(age, g[2])) return false;
    return bedMatches(g[3], bed === "yes");
  });
}

function findExtraAdultRule(guests: GuestRule[], roomId: string): GuestRule | undefined {
  return guests.find((g) => g[0] === roomId && g[1] === "Extra adult");
}

function guestLineKey(rule: GuestRule): string {
  const bed = BED_LABEL[rule[3]] ?? rule[3];
  return `${rule[1]} ${rule[2]} · ${bed.toLowerCase()}`;
}

/**
 * Live quote engine — consecutive nights from check-in, season from card ranges,
 * weekend flat extra, child age/bed bands, extra adults only beyond included occupancy.
 */
export function runQuote(card: RateCardDetail, input: QuoteInput): QuoteResult {
  const cal = TEST_CAL[card.id];
  const room = card.rooms[Math.min(input.roomIndex, card.rooms.length - 1)];
  const mealIdx = Math.min(input.mealIndex, card.meals.length - 1);
  const roomIdx = Math.min(input.roomIndex, card.rooms.length - 1);
  const nights = Math.max(1, Math.min(14, input.nights));
  const startIdx = Math.min(Math.max(0, input.checkIn), TEST_DATES.length - 1);
  const checkInLabel = TEST_DATES[startIdx]?.[0] ?? "12 Oct 2026";
  const checkInDate = parseDMY(checkInLabel) ?? new Date(2026, 9, 12);

  const childCount = input.children.length;
  const pax = input.adults + childCount;
  const basePax = room.baseOccupancy * input.rooms;
  const maxPax = room.maxOccupancy * input.rooms;
  const meal = card.meals[mealIdx];

  const trace: QuoteResult["trace"] = [];
  let blocker = "";

  const perNight: { date: string; dateObj: Date; si: number; sname: string }[] = [];
  for (let i = 0; i < nights; i++) {
    const dateObj = addDays(checkInDate, i);
    const { si, sname } = resolveSeason(card, dateObj, cal, startIdx + i);
    perNight.push({ date: formatDMY(dateObj), dateObj, si, sname });
  }

  const spans = [...new Set(perNight.map((n) => n.sname))];
  trace.push({
    step: "Resolve season per night",
    detail:
      spans.length > 1
        ? `Stay crosses ${spans.length} price sets: ${spans.join(" → ")}. Each night takes its own rate.`
        : `All ${nights} nights fall in ${spans[0]}.`,
  });

  const unpriced = perNight.find((n) => n.si < 0);
  const blackout =
    card.id === "rc-acc-2627" && perNight.some((n) => n.date === "25 Dec 2026");
  if (unpriced) {
    blocker = `${unpriced.date} falls in a window the supplier has not priced. The engine will not carry another season's rate forward.`;
    trace.push({ step: "Refuse unpriced night", detail: `${unpriced.date} has no price set. Blocked.` });
  }
  if (!blocker && blackout) {
    blocker = "25 Dec 2026 is a hard blackout. The stay must be refused.";
    trace.push({ step: "Refuse blackout", detail: "Property closed for a private event." });
  }

  let minStay = 1;
  let minWindow = "";
  for (const [rule, window, value] of card.rules) {
    if (rule !== "Minimum stay") continue;
    const n = parseInt(value, 10);
    if (!n) continue;
    const applies = perNight.some((pn) => {
      if (window.includes("20 Dec")) return pn.si === 2;
      if (window.includes("16 Sep") || window.includes("01 Oct")) return pn.si === 1;
      return pn.si === 0;
    });
    if (applies && n > minStay) {
      minStay = n;
      minWindow = window;
    }
  }
  if (!blocker && minStay > 1 && nights < minStay) {
    blocker = `${minWindow} carries a ${minStay}-night minimum. This ${nights}-night stay must be refused, not repriced.`;
    trace.push({ step: "Enforce minimum stay", detail: blocker });
  } else if (minStay > 1 && !blocker) {
    trace.push({
      step: "Check minimum stay",
      detail: `${minStay}-night minimum satisfied (${nights} nights).`,
    });
  }

  if (!blocker && pax > maxPax) {
    blocker = `${pax} guests exceed the maximum of ${maxPax} for ${input.rooms} × ${room.name}. Add a room or change room type.`;
    trace.push({ step: "Check capacity", detail: blocker });
  } else if (!blocker) {
    trace.push({
      step: "Check capacity",
      detail: `${pax} guests within the ${maxPax}-guest maximum for ${input.rooms} × ${room.name}.`,
    });
  }

  const nightRows: NightRow[] = [];
  const guestLines: Record<string, number> = {};
  let roomTotal = 0;
  let guestTotal = 0;
  let weekendNights = 0;
  const missingCell: string[] = [];
  let childBlocker = "";

  const weekendOn = Boolean(card.hasWeekendExtra && card.weekendExtra);
  const extraAdults = Math.max(0, input.adults - basePax);
  const adultRule = findExtraAdultRule(card.guests, room.id);

  for (const pn of perNight) {
    const raw = pn.si < 0 ? null : (card.prices[roomIdx]?.[mealIdx]?.[pn.si] ?? null);
    const dow = pn.dateObj.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const weekendAdd =
      isWeekend && weekendOn
        ? (card.weekendExtra?.[roomIdx]?.[pn.si] ?? 0)
        : 0;
    if (isWeekend && weekendAdd) weekendNights += 1;
    const roomAmount = raw == null ? null : (raw + weekendAdd) * input.rooms;
    if (raw == null) missingCell.push(pn.date);

    let nightGuests = 0;

    if (extraAdults > 0) {
      if (adultRule && adultRule[5] != null) {
        const amt = adultRule[5] * extraAdults;
        nightGuests += amt;
        const key = guestLineKey(adultRule);
        guestLines[key] = (guestLines[key] ?? 0) + amt;
      } else if (!childBlocker) {
        childBlocker = "Extra guest charge is unconfirmed for this room.";
      }
    }

    for (const ch of input.children) {
      const band = findChildRule(card.guests, room.id, ch.age, ch.bed);
      if (!band) continue;
      if (band[5] == null) {
        childBlocker = `A child aged ${ch.age} ${ch.bed === "yes" ? "with" : "without"} an extra bed has no confirmed charge on this card. The engine refuses rather than assuming free.`;
        continue;
      }
      nightGuests += band[5];
      const key = guestLineKey(band);
      guestLines[key] = (guestLines[key] ?? 0) + band[5];
    }

    if (roomAmount != null) roomTotal += roomAmount;
    guestTotal += nightGuests;

    let rule: NightRow["rule"] = "Base rate";
    let ruleTone: NightRow["ruleTone"] = "ok";
    if (pn.si < 0) {
      rule = "Unpriced";
      ruleTone = "danger";
    } else if (raw == null) {
      rule = "Missing";
      ruleTone = "danger";
    } else if (isWeekend && weekendAdd) {
      rule = "Weekend + surcharge";
      ruleTone = "weekend";
    } else if (spans.length > 1) {
      rule = "Season boundary";
      ruleTone = "warn";
    }

    nightRows.push({
      date: pn.date,
      season: pn.sname,
      rule,
      ruleTone,
      roomAmount,
      guestAmount: nightGuests,
    });
  }

  if (!blocker && childBlocker) blocker = childBlocker;
  if (!blocker && missingCell.length) {
    blocker = `${room.name} · ${meal?.label ?? "meal"} has no price for ${missingCell[0]}. Missing is not zero.`;
    trace.push({ step: "Read room rate", detail: `No amount recorded for ${missingCell.join(", ")}. Blocked.` });
  } else if (!blocker) {
    const first = card.prices[roomIdx]?.[mealIdx]?.[perNight[0]?.si ?? 0];
    trace.push({
      step: "Read room rate",
      detail: `${formatMoney(first, card.currency)} × ${input.rooms} room${input.rooms === 1 ? "" : "s"} on the first night; later nights follow their own season.`,
    });
  }

  if (weekendNights > 0) {
    trace.push({
      step: "Apply weekend surcharge",
      detail: `${weekendNights} night${weekendNights === 1 ? "" : "s"} landed on Saturday or Sunday — the flat weekend extra for ${room.name} was added on top of that night’s rate.`,
    });
  }

  if (extraAdults > 0 || childCount > 0) {
    trace.push({
      step: "Apply guest charges",
      detail: `${basePax} guests are included in the room rate. ${
        extraAdults > 0
          ? `${extraAdults} extra adult${extraAdults === 1 ? "" : "s"}`
          : "No extra adults"
      }${
        childCount > 0
          ? ` and ${childCount} child${childCount === 1 ? "" : "ren"} priced from their age band`
          : ""
      }. A child band and an extra-adult band never stack on the same guest.`,
    });
  } else {
    trace.push({
      step: "Apply guest charges",
      detail: `${input.adults} adults are within the ${basePax} included in the room rate. No guest charges.`,
    });
  }

  let supplementTotal = 0;
  const lines: QuoteLine[] = [];

  if (!blocker) {
    lines.push({
      label: "Room rate",
      note: `${nights} night${nights === 1 ? "" : "s"} · ${input.rooms} room${input.rooms === 1 ? "" : "s"} · ${room.name} · ${meal?.code ?? meal?.label ?? ""}`,
      amount: roomTotal,
    });
    for (const [label, amount] of Object.entries(guestLines)) {
      lines.push({
        label,
        note: `across ${nights} night${nights === 1 ? "" : "s"}`,
        amount,
      });
    }
  }

  if (!blocker) {
    for (const s of card.supplements.filter((x) => x.basis === "Mandatory" && x.amount != null)) {
      const hits = perNight.filter(
        (n) =>
          s.applies.includes(n.date) ||
          (s.applies.includes("24 Dec") && n.date === "24 Dec 2026") ||
          (s.applies.includes("31 Dec") && n.date === "31 Dec 2026") ||
          (s.applies.includes("Christmas") && n.date.includes("24 Dec")) ||
          (s.applies.includes("New Year") && n.date.includes("31 Dec")),
      );
      if (hits.length === 0) continue;
      const amount = s.amount ?? 0;
      const perAdult = /per adult/i.test(s.unit);
      const perRoom = /per room/i.test(s.unit);
      const perNightUnit = /night/i.test(s.unit);
      const qty = perAdult ? input.adults : perRoom ? input.rooms : 1;
      const nightsHit = perNightUnit ? hits.length : 1;
      const amt = amount * qty * nightsHit;
      supplementTotal += amt;
      lines.push({
        label: s.name,
        note: `${formatMoney(amount, card.currency)} × ${qty}${nightsHit > 1 ? ` × ${nightsHit} nights` : ""} · ${s.unit}`,
        amount: amt,
      });
    }
    if (supplementTotal > 0) {
      trace.push({
        step: "Add mandatory supplements",
        detail: formatMoney(supplementTotal, card.currency),
      });
    } else {
      trace.push({
        step: "Add mandatory supplements",
        detail: "No mandatory supplements fall in this window.",
      });
    }
  }

  lines.push({
    label: "Tax",
    note: card.taxConfirmed ? "Included in the supplier rate" : "Treatment unconfirmed",
    amount: 0,
  });

  const total = blocker ? null : roomTotal + guestTotal + supplementTotal;
  if (!blocker) {
    lines.push({ label: "Stay total", amount: total, emphasis: true });
    trace.push({
      step: "Apply tax",
      detail: card.taxConfirmed
        ? "Tax is already included in the supplier rate. Nothing added."
        : "Tax treatment is unconfirmed. Total is indicative and cannot be used in a sent proposal.",
    });
  }

  return {
    blocker,
    trace,
    lines,
    nights: nightRows,
    total,
    totalLabel: blocker ? "Cannot price this stay" : card.taxConfirmed ? "Net total" : "Indicative total",
    totalNote: blocker
      ? "Resolve the blocker above"
      : card.taxConfirmed
        ? `${card.mealBasis} · selling price set in proposal`
        : "Tax treatment unconfirmed — indicative only",
    indicative: !card.taxConfirmed && !blocker,
    nightsLabel: `${nights} night${nights === 1 ? "" : "s"} · ${spans.length} price set${spans.length === 1 ? "" : "s"}`,
    paxSummary: `${input.adults} adult${input.adults === 1 ? "" : "s"}${
      childCount ? ` · ${childCount} child${childCount === 1 ? "" : "ren"}` : ""
    } · ${input.rooms} room${input.rooms === 1 ? "" : "s"}`,
  };
}

export const DEFAULT_QUOTE: QuoteInput = {
  checkIn: 3,
  nights: 3,
  roomIndex: 0,
  mealIndex: 1,
  adults: 2,
  rooms: 1,
  children: [{ age: 8, bed: "no" }],
};
