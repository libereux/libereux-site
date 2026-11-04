// Property calendar for the dashboard. GET: every lease, stay and platform booking.
// POST actions: add or delete a stay entered by hand, save the platform calendar links,
// make a new private subscribe link.
import { adminFrom, baseUrl, sameOrigin } from "@/lib/esign/auth";
import { allEvents, deleteBooking, icsKey, newBookingId, saveBooking, setFeeds } from "@/lib/esign/calendar";
import { BOOKING_SOURCES, PROPERTIES, isDay, type Booking, type BookingSource } from "@/lib/esign/types";

export const maxDuration = 30;

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function GET(req: Request) {
  const admin = await adminFrom(req);
  if (!admin) return Response.json({ error: "Sign in first." }, { status: 401 });
  const [data, key] = await Promise.all([allEvents(), icsKey()]);
  return Response.json({
    properties: PROPERTIES,
    sources: BOOKING_SOURCES,
    subscribeUrl: `${baseUrl(req)}/api/esign/calendar-feed?k=${key}`,
    ...data,
  });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Not allowed." }, { status: 403 });
  const admin = await adminFrom(req);
  if (!admin) return Response.json({ error: "Sign in first." }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.action === "add-stay") {
    const property = clean(body.property, 160);
    const start = String(body.start || "");
    const end = String(body.end || "");
    const guest = clean(body.guest, 120);
    const source = (BOOKING_SOURCES as string[]).includes(String(body.source)) ? (String(body.source) as BookingSource) : "Direct";
    if (!(PROPERTIES as readonly string[]).includes(property)) return Response.json({ error: "Pick the property." }, { status: 400 });
    if (!guest) return Response.json({ error: "Add the guest's name." }, { status: 400 });
    if (!isDay(start) || !isDay(end) || end <= start) return Response.json({ error: "Check-out must be after check-in." }, { status: 400 });
    const amount = Number(String(body.amount || "").replace(/[$,\s]/g, ""));
    const b: Booking = {
      id: newBookingId(),
      property,
      start,
      end,
      guest,
      source,
      phone: clean(body.phone, 40) || undefined,
      email: clean(body.email, 200) || undefined,
      amount: amount > 0 ? amount : undefined,
      notes: clean(body.notes, 500) || undefined,
      createdAt: new Date().toISOString(),
      createdBy: admin,
    };
    await saveBooking(b);
    return Response.json({ ok: true });
  }
  if (body.action === "delete-stay") {
    await deleteBooking(String(body.id || ""));
    return Response.json({ ok: true });
  }
  if (body.action === "feeds") {
    try {
      const feeds = await setFeeds(body.feeds);
      return Response.json({ ok: true, feeds });
    } catch (e) {
      return Response.json({ error: e instanceof Error ? e.message : "Could not save." }, { status: 400 });
    }
  }
  if (body.action === "new-subscribe-link") {
    const key = await icsKey(true);
    return Response.json({ ok: true, subscribeUrl: `${baseUrl(req)}/api/esign/calendar-feed?k=${key}` });
  }
  return Response.json({ error: "Unknown action." }, { status: 400 });
}
