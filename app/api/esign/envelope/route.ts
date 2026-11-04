// Actions on one envelope: resend the current signer's email, or void it.
import { adminFrom, baseUrl, clientIp, sameOrigin } from "@/lib/esign/auth";
import { getEnvelope, getFile, inviteCurrent, log, saveEnvelope, sendCompleted } from "@/lib/esign/envelopes";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Not allowed." }, { status: 403 });
  const admin = await adminFrom(req);
  if (!admin) return Response.json({ error: "Sign in first." }, { status: 401 });
  let body: { id?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const env = await getEnvelope(String(body.id || ""));
  if (!env) return Response.json({ error: "Not found." }, { status: 404 });

  if (body.action === "resend") {
    if (env.status === "completed") {
      const signed = await getFile(env.id, "signed.pdf");
      if (!signed) return Response.json({ error: "Signed copy missing." }, { status: 500 });
      const r = await sendCompleted(env, signed);
      return Response.json(r, { status: r.ok ? 200 : 502 });
    }
    if (env.status !== "in_progress") return Response.json({ error: "This envelope is voided." }, { status: 400 });
    const r = await inviteCurrent(env, baseUrl(req), admin);
    return Response.json(r, { status: r.ok ? 200 : 502 });
  }
  if (body.action === "void") {
    if (env.status !== "in_progress") return Response.json({ error: "Only an unfinished envelope can be voided." }, { status: 400 });
    env.status = "voided";
    log(env, { type: "Voided", actor: admin, ip: clientIp(req) });
    await saveEnvelope(env);
    return Response.json({ ok: true });
  }
  return Response.json({ error: "Unknown action." }, { status: 400 });
}
