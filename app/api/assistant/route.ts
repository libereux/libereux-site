// Live website assistant. Streams newline-delimited JSON events (see lib/assistant/types.ts).
// Needs ANTHROPIC_API_KEY. Optional: ASSISTANT_MODEL. ASSISTANT_MOCK=1 runs a scripted
// stand-in for local testing.
import { runAgent } from "@/lib/assistant/agent";
import { runMock } from "@/lib/assistant/mock";
import type { ChatTurn, StreamEvent } from "@/lib/assistant/types";

export const maxDuration = 60;

const MAX_TURNS = 24;
const MAX_USER_CHARS = 2000;
const LIMIT_PER_HOUR = 40;

// Best-effort per-instance limiter. Enough to stop casual abuse of the API key.
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

  const mock = process.env.ASSISTANT_MOCK === "1";
  if (!mock && !process.env.ANTHROPIC_API_KEY) return Response.json({ error: "offline" }, { status: 503 });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (limited(ip)) return Response.json({ error: "busy" }, { status: 429 });

  let body: { messages?: unknown; page?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const history: ChatTurn[] = raw
    .filter((m): m is ChatTurn => {
      const o = m as ChatTurn;
      return (o?.role === "user" || o?.role === "assistant") && typeof o.content === "string" && o.content.trim().length > 0;
    })
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.role === "user" ? m.content.slice(0, MAX_USER_CHARS) : m.content.slice(0, 6000) }));

  // The API expects the conversation to start with the visitor and end with their message.
  while (history.length && history[0].role !== "user") history.shift();
  if (!history.length || history[history.length - 1].role !== "user") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const page = typeof body.page === "string" && body.page.startsWith("/") ? body.page.slice(0, 80) : "/";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: StreamEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        const events = mock ? runMock(history) : runAgent(history, page);
        for await (const e of events) send(e);
        send({ t: "done" });
      } catch (err) {
        console.error("assistant error", err);
        send({ t: "error", v: "Something went wrong on our side." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
