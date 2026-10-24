import { booking, type Window } from "./config";
import { getBusy, type Busy } from "./google";

// Time zone maths with Intl only, so there are no packages to maintain.

function zoneOffsetMs(utcMs: number, zone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second"));
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/** The UTC instant at which the wall clock in `zone` reads y-m-d h:mi. */
export function wallToUtc(zone: string, y: number, mo: number, d: number, h: number, mi: number): number {
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  let t = wall - zoneOffsetMs(wall, zone);
  t = wall - zoneOffsetMs(t, zone);
  return t;
}

function localDate(utcMs: number, zone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(utcMs));
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: n("year"), m: n("month"), d: n("day") };
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Every slot start (UTC ms) the windows allow, before checking the calendar. */
export function candidateSlots(nowMs: number, windows: Window[] = booking.windows): number[] {
  const out: number[] = [];
  const earliest = nowMs + booking.minNoticeHours * 3_600_000;
  const latest = nowMs + booking.horizonDays * 86_400_000;
  const first = localDate(nowMs, booking.zone);
  for (let i = 0; i <= booking.horizonDays + 1; i++) {
    // Calendar arithmetic on the local date; the day of week does not depend on the zone.
    const day = new Date(Date.UTC(first.y, first.m - 1, first.d + i));
    const y = day.getUTCFullYear();
    const m = day.getUTCMonth() + 1;
    const d = day.getUTCDate();
    const dow = day.getUTCDay();
    for (const w of windows) {
      if (!w.days.includes(dow)) continue;
      for (let t = toMin(w.start); t + booking.slotMinutes <= toMin(w.end); t += booking.slotMinutes) {
        const start = wallToUtc(booking.zone, y, m, d, Math.floor(t / 60), t % 60);
        if (start >= earliest && start <= latest) out.push(start);
      }
    }
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

function isFree(start: number, busy: Busy[]) {
  const pad = booking.bufferMinutes * 60_000;
  const end = start + booking.slotMinutes * 60_000;
  return !busy.some((b) => b.start < end + pad && b.end > start - pad);
}

/** Open slots (UTC ms): inside the windows and clear of anything on the calendars. */
export async function openSlots(nowMs = Date.now()): Promise<number[]> {
  const candidates = candidateSlots(nowMs);
  if (!candidates.length) return [];
  const busy = await getBusy(candidates[0], candidates[candidates.length - 1] + booking.slotMinutes * 60_000);
  return candidates.filter((s) => isFree(s, busy));
}
