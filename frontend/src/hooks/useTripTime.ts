// ── Trip time utilities ─────────────────────────────────────────────────────
// The whole trip (Sep 5–7, 2026) sits in America/Detroit (Eastern). The trip
// dates fall within EDT (UTC-4); TRIP_UTC_OFFSET hardcodes that so event times
// resolve without a timezone library. A trip straddling a DST change would
// need real zone math here.
//
// DEMO MODE: pretend it's a specific moment during the trip, to preview the
// "today" highlighting / countdown before the real dates arrive. Flip to false
// (do this before launch) to use the real clock.
export const DEMO_MODE = false;
const DEMO_DATE = new Date("2026-09-06T10:30:00-04:00"); // unused when DEMO_MODE=false

const TRIP_TZ = "America/Detroit";
const TRIP_UTC_OFFSET = "-04:00";

export function getNow(): Date {
  return DEMO_MODE ? DEMO_DATE : new Date();
}

// Parse "8:30 pm" → { h: 20, m: 30 }
export function parseTime12(timeStr: string): { h: number; m: number } | null {
  const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3].toLowerCase();
  if (ampm === "pm" && h !== 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;
  return { h, m };
}

// Build a full Date in trip-local time from an ISO date + optional time string
export function toTripDate(isoDate: string, timeStr?: string): Date {
  if (!timeStr) return new Date(`${isoDate}T23:59:59${TRIP_UTC_OFFSET}`);
  const t = parseTime12(timeStr);
  if (!t) return new Date(`${isoDate}T23:59:59${TRIP_UTC_OFFSET}`);
  return new Date(
    `${isoDate}T${String(t.h).padStart(2, "0")}:${String(t.m).padStart(2, "0")}:00${TRIP_UTC_OFFSET}`,
  );
}

// Today's date in trip-local time as YYYY-MM-DD
export function todayIsoDate(): string {
  return getNow().toLocaleDateString("en-CA", { timeZone: TRIP_TZ });
}

export function isDayPast(isoDate: string): boolean {
  return isoDate < todayIsoDate();
}

export function isDayToday(isoDate: string): boolean {
  return isoDate === todayIsoDate();
}

export function isEventPast(isoDate: string, timeStr?: string): boolean {
  const now = getNow();
  const eventDate = toTripDate(isoDate, timeStr ?? "00:00 am");
  return now > eventDate;
}

export function isTomorrow(isoDate: string): boolean {
  const now = getNow();
  const tomorrowMs = now.getTime() + 24 * 60 * 60 * 1000;
  const tomorrowStr = new Date(tomorrowMs).toLocaleDateString("en-CA", { timeZone: TRIP_TZ });
  return isoDate === tomorrowStr;
}

// Format ms gap → "45m", "2h 15m", or "2d 3h" (never raw hours past 24)
export function fmtCountdown(ms: number): string {
  if (ms <= 0) return "now";
  const totalMins = Math.floor(ms / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const remH = h % 24;
    return remH > 0 ? `${d}d ${remH}h` : `${d}d`;
  }
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
