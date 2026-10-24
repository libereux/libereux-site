// Open consultation times. Reads James's calendars for busy time; stores nothing.
import { BookingError, bookingConfigured } from "@/lib/booking/google";
import { openSlots } from "@/lib/booking/slots";
import { booking } from "@/lib/booking/config";

export const maxDuration = 20;

const LIMIT_PER_HOUR = 120;
const hits = new Map<string, { n: number; reset: number }>();
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { n: 1, reset: now + 3_600_000 });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  h.n += 1;
  return h.n > LIMIT_PER_HOUR;
}

function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Not allowed." }, { status: 403 });
  if (!bookingConfigured()) {
    // The form still works without a time: it sends a normal request and James replies.
    return Response.json({ configured: false, slots: [] }, { headers: { "Cache-Control": "no-store" } });
  }
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (limited(ip)) return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  try {
    const slots = await openSlots();
    return Response.json(
      { configured: true, minutes: booking.slotMinutes, slots },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    const status = e instanceof BookingError ? e.status : 500;
    // Fall back to the plain request form rather than showing a broken picker.
    return Response.json({ configured: false, slots: [], error: "Times are not available right now." }, { status: status === 429 ? 429 : 200 });
  }
}
