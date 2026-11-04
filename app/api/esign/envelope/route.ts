// One envelope. GET returns it with its fields (for the field editor).
// POST actions: save fields, send, resend the current email, void, save to Google Drive.
import { adminFrom, baseUrl, clientIp, sameOrigin } from "@/lib/esign/auth";
import {
  cleanFields,
  getEnvelope,
  getFile,
  inviteCurrent,
  log,
  missingSignatureFields,
  saveEnvelope,
  saveToDrive,
  sendCompleted,
  sendEnvelope,
} from "@/lib/esign/envelopes";

export const maxDuration = 30;

export async function GET(req: Request) {
  const admin = await adminFrom(req);
  if (!admin) return Response.json({ error: "Sign in first." }, { status: 401 });
  const env = await getEnvelope(new URL(req.url).searchParams.get("id") || "");
  if (!env) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json({
    id: env.id,
    title: env.title,
    property: env.property,
    status: env.status,
    pages: env.pages,
    fields: env.fields || [],
    signers: env.signers.map((s) => ({ name: s.name, email: s.email, role: s.role, status: s.status })),
  });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Not allowed." }, { status: 403 });
  const admin = await adminFrom(req);
  if (!admin) return Response.json({ error: "Sign in first." }, { status: 401 });
  let body: { id?: string; action?: string; fields?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const env = await getEnvelope(String(body.id || ""));
  if (!env) return Response.json({ error: "Not found." }, { status: 404 });

  if (body.action === "fields" || body.action === "send") {
    if (env.status !== "draft") return Response.json({ error: "This lease was already sent. Void it and send a new one to change fields." }, { status: 400 });
    if (body.fields !== undefined) env.fields = cleanFields(env, body.fields);
    if (body.action === "fields") {
      await saveEnvelope(env);
      return Response.json({ ok: true, fields: env.fields });
    }
    const missing = missingSignatureFields(env);
    if (missing.length) {
      await saveEnvelope(env);
      return Response.json({ error: `Add a signature box for ${missing.map((s) => s.name).join(", ")}.` }, { status: 400 });
    }
    const r = await sendEnvelope(env, baseUrl(req), admin);
    return Response.json(r, { status: r.ok ? 200 : 502 });
  }

  if (body.action === "resend") {
    if (env.status === "completed") {
      const signed = await getFile(env.id, "signed.pdf");
      if (!signed) return Response.json({ error: "Signed copy missing." }, { status: 500 });
      const r = await sendCompleted(env, signed);
      return Response.json(r, { status: r.ok ? 200 : 502 });
    }
    if (env.status !== "in_progress") return Response.json({ error: "This lease is not out for signature." }, { status: 400 });
    const r = await inviteCurrent(env, baseUrl(req), admin);
    return Response.json(r, { status: r.ok ? 200 : 502 });
  }

  if (body.action === "drive") {
    if (env.status !== "completed") return Response.json({ error: "Only signed leases go to Drive." }, { status: 400 });
    const signed = await getFile(env.id, "signed.pdf");
    if (!signed) return Response.json({ error: "Signed copy missing." }, { status: 500 });
    const r = await saveToDrive(env, signed);
    return Response.json(r, { status: r.ok ? 200 : 502 });
  }

  if (body.action === "void") {
    if (env.status !== "in_progress" && env.status !== "draft") return Response.json({ error: "Only an unfinished lease can be voided." }, { status: 400 });
    env.status = "voided";
    log(env, { type: "Voided", actor: admin, ip: clientIp(req) });
    await saveEnvelope(env);
    return Response.json({ ok: true });
  }
  return Response.json({ error: "Unknown action." }, { status: 400 });
}
