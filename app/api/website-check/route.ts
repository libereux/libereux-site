// Free website check. Runs on the host's free serverless functions; no paid services.
import { checkWebsite, ScanError } from "@/lib/website-check/scan";

export const maxDuration = 30;

const LIMIT_PER_HOUR = 20;
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

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Not allowed." }, { status: 403 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (limited(ip)) {
    return Response.json({ error: "You have run a lot of checks this hour. Please try again later." }, { status: 429 });
  }
  let body: { url?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const url = typeof body.url === "string" ? body.url.slice(0, 300) : "";
  if (!url.trim()) return Response.json({ error: "Enter your website address." }, { status: 400 });
  try {
    const report = await checkWebsite(url);
    return Response.json({ report }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const msg = e instanceof ScanError ? e.message : "We could not check that website. Please try again.";
    return Response.json({ error: msg }, { status: 422 });
  }
}
