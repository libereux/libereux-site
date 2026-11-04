// Private calendar link for Google Calendar or a phone calendar (Add calendar, From URL).
// Anyone with the link can read the stays, so it is long and random, and can be replaced
// from the dashboard at any time.
import { timingSafeEqual } from "crypto";
import { allEvents, icsKey, toIcs } from "@/lib/esign/calendar";

export async function GET(req: Request) {
  const given = Buffer.from(new URL(req.url).searchParams.get("k") || "");
  const key = Buffer.from(await icsKey());
  if (given.length !== key.length || !timingSafeEqual(given, key)) return new Response("Not found.", { status: 404 });
  const { events } = await allEvents();
  return new Response(toIcs(events), {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "private, max-age=900", "X-Robots-Tag": "noindex" },
  });
}
