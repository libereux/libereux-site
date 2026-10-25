// Books a consultation: re-checks the time, creates the Google Calendar event with a Meet link
// (which invites the visitor and blocks James's calendar), and emails James a backup copy.
import { BookingError, bookingConfigured, createMeetEvent } from "@/lib/booking/google";
import { openSlots } from "@/lib/booking/slots";
import { booking } from "@/lib/booking/config";
import { buildAgenda, validZone, visitorTimeLabel, type Intake } from "@/lib/booking/agenda";

export const maxDuration = 30;

const LIMIT_PER_HOUR = 6;
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

const clean = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Not allowed." }, { status: 403 });
  if (!bookingConfigured()) return Response.json({ error: "Online booking is not switched on yet." }, { status: 503 });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (limited(ip)) return Response.json({ error: "Too many bookings from this connection. Please email us instead." }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success.
  if (clean(body.website)) return Response.json({ ok: true });

  const intake: Intake = {
    name: clean(body.name, 120),
    email: clean(body.email, 200),
    phone: clean(body.phone, 60),
    location: clean(body.location, 120),
    service: clean(body.service, 60) || "not-sure",
    message: clean(body.message, 4000),
  };
  if (!intake.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(intake.email)) {
    return Response.json({ error: "Name and a valid email are required." }, { status: 400 });
  }
  const startMs = typeof body.slot === "number" ? body.slot : NaN;
  if (!Number.isFinite(startMs)) return Response.json({ error: "Choose a time first." }, { status: 400 });
  const zone = validZone(body.timeZone) ? (body.timeZone as string) : "UTC";

  try {
    // Re-check on the server: the time must still be open. This blocks stale pages and tampering.
    const open = await openSlots();
    if (!open.includes(startMs)) {
      return Response.json({ error: "That time was just taken. Please pick another.", code: "slot_taken" }, { status: 409 });
    }
    const label = visitorTimeLabel(startMs, zone);
    const event = await createMeetEvent({
      summary: `Free consultation: ${intake.name}`,
      description: buildAgenda(intake, { visitorTimeLabel: label }),
      startMs,
      endMs: startMs + booking.slotMinutes * 60_000,
      attendeeEmail: intake.email,
      attendeeName: intake.name,
    });

    // Best effort backup email to James. A failure here never undoes the booking.
    const key = process.env.RESEND_API_KEY;
    if (key) {
      const rows: [string, string][] = [
        ["Booked", label],
        ["Name", intake.name],
        ["Email", intake.email],
        ["Phone or WhatsApp", intake.phone],
        ["Based in", intake.location],
        ["Help with", intake.service],
        ["About the business", intake.message],
        ["Meet link", event.meetLink],
      ];
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM || "Libereux Website <website@libereux.com>",
          to: [process.env.CONTACT_TO || "holdings@libereux.com"],
          reply_to: intake.email,
          subject: `Consultation booked: ${intake.name}`,
          html: rows
            .filter(([, v]) => v)
            .map(([k, v]) => `<p><strong>${k}:</strong> ${escape(v).replace(/\n/g, "<br>")}</p>`)
            .join(""),
        }),
      }).catch((err) => console.error("Backup email failed", err));
    }

    return Response.json({ ok: true, whenLabel: label, meetLink: event.meetLink });
  } catch (e) {
    console.error("Booking failed", e);
    const status = e instanceof BookingError ? e.status : 500;
    return Response.json(
      { error: "We could not complete the booking. You can still send a normal request and we will reply." },
      { status: status === 503 ? 503 : 502 },
    );
  }
}
