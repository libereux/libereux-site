// The signer's side. GET loads what they are signing (and logs the first view).
// POST records their signature, then emails the next person in the order or finishes the lease.
import { baseUrl, clientIp, limited, sameOrigin } from "@/lib/esign/auth";
import { fromToken, log, recordSignature, saveEnvelope, now } from "@/lib/esign/envelopes";

export const maxDuration = 30;

export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t") || "";
  const found = await fromToken(t);
  if (!found) return Response.json({ error: "This signing link is not valid. It may have been replaced by a newer email." }, { status: 404 });
  const { env, idx, signer } = found;
  if (env.status === "in_progress" && env.current === idx && signer.status !== "signed" && !signer.viewedAt) {
    signer.viewedAt = now();
    signer.status = "viewed";
    log(env, { type: "Opened", actor: `${signer.role} ${signer.name} <${signer.email}>`, ip: clientIp(req) });
    await saveEnvelope(env);
  }
  return Response.json({
    title: env.title,
    property: env.property,
    pages: env.pages,
    fingerprint: env.originalSha256,
    envelopeStatus: env.status,
    yourTurn: env.status === "in_progress" && env.current === idx && signer.status !== "signed",
    signer: { name: signer.name, role: signer.role, email: signer.email, status: signer.status, signedAt: signer.signedAt },
    order: env.signers.map((s, i) => ({ name: s.name, role: s.role, signed: s.status === "signed", you: i === idx })),
  });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Not allowed." }, { status: 403 });
  const ip = clientIp(req);
  if (limited(`sign:${ip}`, 30)) return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  let body: { t?: string; typedName?: string; signature?: string; consent?: boolean; reviewed?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const found = await fromToken(String(body.t || ""));
  if (!found) return Response.json({ error: "This signing link is not valid." }, { status: 404 });
  const { env, idx, signer } = found;
  if (env.status !== "in_progress") return Response.json({ error: "This lease is no longer open for signing." }, { status: 400 });
  if (signer.status === "signed") return Response.json({ error: "You have already signed." }, { status: 400 });
  if (env.current !== idx) return Response.json({ error: "It is not your turn to sign yet." }, { status: 400 });
  if (!body.consent || !body.reviewed) return Response.json({ error: "Please tick both boxes to continue." }, { status: 400 });
  const typedName = String(body.typedName || "").trim().replace(/\s+/g, " ").slice(0, 120);
  if (typedName.length < 2) return Response.json({ error: "Type your full name." }, { status: 400 });

  let png: Uint8Array | null = null;
  const sig = String(body.signature || "");
  if (sig) {
    const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(sig);
    if (!m) return Response.json({ error: "The drawn signature could not be read. Clear it and try again." }, { status: 400 });
    png = new Uint8Array(Buffer.from(m[1], "base64"));
    if (png.length > 400_000) return Response.json({ error: "The drawn signature is too large." }, { status: 400 });
  }

  try {
    await recordSignature({ env, idx, typedName, png, ip, userAgent: req.headers.get("user-agent") || "", origin: baseUrl(req) });
  } catch (e) {
    console.error("sign failed", e);
    return Response.json({ error: "Your signature could not be saved. Please try again." }, { status: 500 });
  }
  return Response.json({ ok: true, completed: (env.status as string) === "completed" });
}
