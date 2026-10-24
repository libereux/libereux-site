// Minimal Google Calendar client using plain fetch. No packages, no paid services.
//
// Auth is one OAuth refresh token for holdings@libereux.com, so the site acts as that account.
// That account creates the events (with a Google Meet link) and invites the visitor.
// See docs/BOOKING_SETUP.md for the one-time setup.

export class BookingError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
  }
}

export function bookingConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN,
  );
}

let cached: { token: string; expires: number } | null = null;

async function accessToken(): Promise<string> {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN || "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    console.error("Google token error", res.status, await res.text());
    throw new BookingError("Calendar sign-in failed.", 502);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await accessToken();
  const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok) {
    console.error("Google Calendar error", res.status, await res.text());
    throw new BookingError("Calendar request failed.", 502);
  }
  return (await res.json()) as T;
}

/** Calendars checked for busy time. "primary" is holdings@libereux.com. */
export function busyCalendars(): string[] {
  const list = (process.env.BOOKING_BUSY_CALENDARS || "primary")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : ["primary"];
}

export type Busy = { start: number; end: number };

/** Busy intervals (UTC milliseconds) across all configured calendars. Fails loudly if one cannot be read. */
export async function getBusy(fromMs: number, toMs: number): Promise<Busy[]> {
  const ids = busyCalendars();
  const data = await api<{
    calendars: Record<string, { busy?: { start: string; end: string }[]; errors?: unknown[] }>;
  }>("/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin: new Date(fromMs).toISOString(),
      timeMax: new Date(toMs).toISOString(),
      items: ids.map((id) => ({ id })),
    }),
  });
  const out: Busy[] = [];
  for (const id of ids) {
    const cal = data.calendars?.[id];
    // If a calendar cannot be read, offering times would risk a double booking. Stop instead.
    if (!cal || (cal.errors && cal.errors.length)) {
      console.error("Calendar not readable for availability", id, cal?.errors);
      throw new BookingError("Availability is not available right now.", 503);
    }
    for (const b of cal.busy || []) out.push({ start: Date.parse(b.start), end: Date.parse(b.end) });
  }
  return out;
}

export type NewEvent = {
  summary: string;
  description: string;
  startMs: number;
  endMs: number;
  attendeeEmail: string;
  attendeeName: string;
};

export async function createMeetEvent(e: NewEvent): Promise<{ id: string; meetLink: string; htmlLink: string }> {
  const created = await api<{ id: string; hangoutLink?: string; htmlLink: string }>(
    "/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
    {
      method: "POST",
      body: JSON.stringify({
        summary: e.summary,
        description: e.description,
        start: { dateTime: new Date(e.startMs).toISOString() },
        end: { dateTime: new Date(e.endMs).toISOString() },
        attendees: [{ email: e.attendeeEmail, displayName: e.attendeeName }],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 60 },
            { method: "popup", minutes: 10 },
          ],
        },
        guestsCanModify: false,
        guestsCanInviteOthers: false,
      }),
    },
  );
  return { id: created.id, meetLink: created.hangoutLink || "", htmlLink: created.htmlLink };
}
