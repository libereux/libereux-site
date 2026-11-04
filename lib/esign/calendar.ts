// Property calendar: leases (signed here or imported), stays entered by hand, and bookings pulled
// from Airbnb, VRBO and similar through each listing's calendar export link (iCal). Free: the
// platforms publish these links at no cost; they refresh every few hours on their side.
import { randomBytes } from "crypto";
import { kv, platformFetch } from "./store";
import { listEnvelopes } from "./envelopes";
import { newId } from "./auth";
import { PROPERTIES, type Booking, type BookingSource, type CalendarFeed } from "./types";

export type CalEvent = {
  id: string;
  property: string;
  start: string; // first night, YYYY-MM-DD
  end: string; // checkout day (exclusive), YYYY-MM-DD
  title: string;
  kind: "lease" | "lease-pending" | "stay" | "feed" | "blocked";
  source: string;
  detail?: string;
  envelopeId?: string;
  bookingId?: string;
};

const FEEDS = "config/calendar-feeds.json";
const ICS = "config/calendar-ics.json";

export const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// ---------- feeds ----------
export async function getFeeds(): Promise<CalendarFeed[]> {
  return (await kv().getJSON<CalendarFeed[]>(FEEDS)) || [];
}
export async function setFeeds(raw: unknown) {
  const list = (Array.isArray(raw) ? raw : []).slice(0, 20).flatMap((r) => {
    const f = r as Record<string, unknown>;
    const url = String(f.url || "").trim();
    const property = String(f.property || "");
    if (!url) return [];
    let u: URL;
    try {
      u = new URL(url.replace(/^webcal:/i, "https:"));
    } catch {
      throw new Error(`That calendar link is not a web address: ${url.slice(0, 60)}`);
    }
    if (u.protocol !== "https:") throw new Error("Calendar links must start with https.");
    if (!(PROPERTIES as readonly string[]).includes(property)) throw new Error("Pick the property for each calendar link.");
    return [{ property, source: (String(f.source || "Airbnb") as BookingSource) || "Airbnb", url: u.toString() }];
  });
  await kv().setJSON(FEEDS, list);
  feedCache.clear();
  return list;
}

// Unfolds and reads VEVENT blocks from an .ics file.
export function parseIcs(text: string) {
  const lines = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
  const out: { uid: string; start: string; end: string; summary: string; description: string }[] = [];
  let cur: Record<string, string> | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") cur = {};
    else if (line === "END:VEVENT" && cur) {
      const day = (v?: string) => (v ? `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}` : "");
      const start = day(cur.DTSTART);
      const end = day(cur.DTEND) || (start ? addDays(start, 1) : "");
      if (start) out.push({ uid: cur.UID || `${start}-${end}`, start, end, summary: cur.SUMMARY || "", description: (cur.DESCRIPTION || "").replace(/\\n/g, "\n").replace(/\\,/g, ",") });
      cur = null;
    } else if (cur) {
      const i = line.indexOf(":");
      if (i > 0) cur[line.slice(0, i).split(";")[0].toUpperCase()] = line.slice(i + 1);
    }
  }
  return out;
}

const feedCache = new Map<string, { at: number; events: CalEvent[]; error?: string }>();

async function readFeed(f: CalendarFeed): Promise<{ events: CalEvent[]; error?: string }> {
  const hit = feedCache.get(f.url);
  if (hit && Date.now() - hit.at < 10 * 60_000) return hit;
  let result: { events: CalEvent[]; error?: string };
  try {
    const r = await platformFetch(f.url, { headers: { Accept: "text/calendar" }, signal: AbortSignal.timeout(12_000) });
    if (!r.ok) throw new Error(`${f.source} calendar link returned ${r.status}`);
    const text = (await r.text()).slice(0, 2_000_000);
    if (!text.includes("BEGIN:VCALENDAR")) throw new Error(`${f.source} link did not return a calendar`);
    const events = parseIcs(text).map((e) => {
      const blocked = /not available|blocked|unavailable/i.test(e.summary);
      const code = /reservations\/details\/([A-Z0-9]+)/i.exec(e.description)?.[1];
      const phone = /Phone Number \(Last 4 Digits\):\s*(\d{4})/i.exec(e.description)?.[1];
      return {
        id: `feed-${f.source}-${e.uid}`.slice(0, 120),
        property: f.property,
        start: e.start,
        end: e.end,
        title: blocked ? `${f.source}: blocked` : `${f.source} guest${/reserved/i.test(e.summary) || !e.summary ? "" : `: ${e.summary}`}`,
        kind: blocked ? "blocked" : "feed",
        source: f.source,
        detail: [code && `Confirmation ${code}`, phone && `Phone ends ${phone}`].filter(Boolean).join(" · ") || undefined,
      } satisfies CalEvent;
    });
    result = { events };
  } catch (e) {
    result = { events: hit?.events || [], error: e instanceof Error ? e.message : "Calendar link failed" };
  }
  feedCache.set(f.url, { at: Date.now(), ...result });
  return result;
}

// ---------- stays entered by hand ----------
export async function listBookings(): Promise<Booking[]> {
  const keys = await kv().list("bookings/");
  const all = await Promise.all(keys.map((k) => kv().getJSON<Booking>(k)));
  return all.filter((b): b is Booking => !!b);
}
export const saveBooking = (b: Booking) => kv().setJSON(`bookings/${b.id}.json`, b);
export const deleteBooking = (id: string) => kv().delete(`bookings/${id.replace(/[^A-Za-z0-9_-]/g, "")}.json`);
export const newBookingId = newId;

// ---------- everything together ----------
export async function allEvents() {
  const [envs, bookings, feeds] = await Promise.all([listEnvelopes(), listBookings(), getFeeds()]);
  const events: CalEvent[] = [];
  for (const e of envs) {
    if (!e.lease || e.status === "voided" || e.status === "draft") continue;
    const done = e.status === "completed";
    events.push({
      id: `lease-${e.id}`,
      property: e.property,
      start: e.lease.start,
      end: addDays(e.lease.end, 1),
      title: `${done ? "Lease" : "Lease awaiting signatures"}: ${e.lease.tenants}`,
      kind: done ? "lease" : "lease-pending",
      source: e.source === "imported" ? "Direct lease (imported)" : "Direct lease",
      detail: [e.lease.rent ? `$${e.lease.rent.toLocaleString("en-US")}/month` : "", e.title].filter(Boolean).join(" · "),
      envelopeId: e.id,
    });
  }
  for (const b of bookings) {
    events.push({
      id: `stay-${b.id}`,
      property: b.property,
      start: b.start,
      end: b.end,
      title: `${b.source === "Direct" ? "Direct stay" : b.source}: ${b.guest}`,
      kind: "stay",
      source: b.source,
      detail: [b.amount ? `$${b.amount.toLocaleString("en-US")}` : "", b.phone, b.email, b.notes].filter(Boolean).join(" · ") || undefined,
      bookingId: b.id,
    });
  }
  const feedErrors: string[] = [];
  const results = await Promise.all(feeds.map(readFeed));
  results.forEach((r) => {
    events.push(...r.events);
    if (r.error) feedErrors.push(r.error);
  });
  events.sort((a, b) => a.start.localeCompare(b.start));
  return { events, feeds, feedErrors, conflicts: findConflicts(events) };
}

// Two real stays on the same property on the same night (blocked dates do not count).
export function findConflicts(events: CalEvent[]) {
  const real = events.filter((e) => e.kind !== "blocked");
  const out: { property: string; a: string; b: string; from: string; to: string }[] = [];
  for (let i = 0; i < real.length; i++)
    for (let j = i + 1; j < real.length; j++) {
      const a = real[i];
      const b = real[j];
      if (a.property !== b.property) continue;
      const from = a.start > b.start ? a.start : b.start;
      const to = a.end < b.end ? a.end : b.end;
      if (from < to) out.push({ property: a.property, a: a.title, b: b.title, from, to: addDays(to, -1) });
    }
  return out;
}

// ---------- subscribe link for Google Calendar / phone calendars ----------
export async function icsKey(rotate = false) {
  const cur = await kv().getJSON<{ key: string }>(ICS);
  if (cur?.key && !rotate) return cur.key;
  const key = randomBytes(24).toString("base64url");
  await kv().setJSON(ICS, { key });
  return key;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const icsDay = (d: string) => d.replace(/-/g, "");
const shortName = (p: string) => (p.startsWith("2098") ? "Morrow" : p.startsWith("2707") ? "Lawrenceville" : p.split(",")[0]);

export function toIcs(events: CalEvent[]) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const body = events
    .filter((e) => e.kind !== "blocked")
    .map((e) =>
      [
        "BEGIN:VEVENT",
        `UID:${e.id}@libereux.com`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${icsDay(e.start)}`,
        `DTEND;VALUE=DATE:${icsDay(e.end)}`,
        `SUMMARY:${esc(`${shortName(e.property)}: ${e.title}`)}`,
        `DESCRIPTION:${esc([e.property, e.source, e.detail].filter(Boolean).join("\n"))}`,
        "TRANSP:TRANSPARENT",
        "END:VEVENT",
      ].join("\r\n"),
    );
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Libereux Holdings//Properties//EN", "CALSCALE:GREGORIAN", "X-WR-CALNAME:Libereux Properties", ...body, "END:VCALENDAR"].join("\r\n") + "\r\n";
}
