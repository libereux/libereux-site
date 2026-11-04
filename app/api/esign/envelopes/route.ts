// Lease dashboard data. GET lists every envelope. POST uploads a lease PDF, sets the signing order,
// and saves it as a draft so fields can be placed before it is sent.
import { adminFrom, clientIp, sameOrigin } from "@/lib/esign/auth";
import { cleanLease, createEnvelope, listEnvelopes } from "@/lib/esign/envelopes";
import { driveAvailable, driveConfig } from "@/lib/esign/drive";
import { pageCount } from "@/lib/esign/pdf";
import { PROPERTIES, type Envelope } from "@/lib/esign/types";

export const maxDuration = 30;

function publicView(e: Envelope) {
  return {
    ...e,
    signers: e.signers.map((s) => {
      const { tokenHash, userAgent, ...rest } = s;
      void tokenHash;
      void userAgent;
      return rest;
    }),
  };
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function GET(req: Request) {
  const admin = await adminFrom(req);
  if (!admin) return Response.json({ error: "Sign in first." }, { status: 401 });
  const [all, drive] = await Promise.all([listEnvelopes(), driveConfig()]);
  return Response.json({
    admin,
    properties: PROPERTIES,
    drive: { available: driveAvailable(), connected: !!drive, connectedAt: drive?.connectedAt },
    envelopes: all.map(publicView),
  });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Not allowed." }, { status: 403 });
  const admin = await adminFrom(req);
  if (!admin) return Response.json({ error: "Sign in first." }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Could not read the upload. Keep the PDF under 4 MB." }, { status: 400 });
  }
  const title = clean(form.get("title"), 140);
  const property = clean(form.get("property"), 160);
  const notes = clean(form.get("notes"), 2000);
  const file = form.get("file");
  let signers: { name: string; email: string; role: string }[] = [];
  try {
    signers = (JSON.parse(String(form.get("signers") || "[]")) as unknown[])
      .map((s) => s as Record<string, unknown>)
      .map((s) => ({ name: clean(s.name, 120), email: clean(s.email, 200).toLowerCase(), role: clean(s.role, 60) || "Signer" }))
      .filter((s) => s.name || s.email);
  } catch {
    return Response.json({ error: "Signer list is invalid." }, { status: 400 });
  }

  if (!title) return Response.json({ error: "Give the lease a title." }, { status: 400 });
  if (!property) return Response.json({ error: "Pick the property." }, { status: 400 });
  if (!(file instanceof File) || file.size === 0) return Response.json({ error: "Attach the lease PDF." }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return Response.json({ error: "The PDF is over 4 MB." }, { status: 400 });
  if (signers.length < 1 || signers.length > 8) return Response.json({ error: "Add between 1 and 8 signers." }, { status: 400 });
  const bad = signers.find((s) => !s.name || !validEmail(s.email));
  if (bad) return Response.json({ error: `Each signer needs a name and a valid email (check "${bad.name || bad.email}").` }, { status: 400 });

  const tenantNames = signers.filter((s) => /tenant/i.test(s.role)).map((s) => s.name);
  const lease = cleanLease(
    { start: form.get("start"), end: form.get("end"), rent: form.get("rent"), tenants: tenantNames.join(" and ") },
    tenantNames.join(" and ") || signers[0].name,
  );
  if (typeof lease === "string") return Response.json({ error: lease }, { status: 400 });

  const pdf = new Uint8Array(await file.arrayBuffer());
  if (Buffer.from(pdf.slice(0, 5)).toString() !== "%PDF-") return Response.json({ error: "That file is not a PDF." }, { status: 400 });
  let pages = 0;
  try {
    pages = await pageCount(pdf);
  } catch {
    return Response.json({ error: "That PDF could not be opened. Export it again and retry." }, { status: 400 });
  }

  const env = await createEnvelope({
    title,
    property,
    notes,
    createdBy: admin,
    originalName: clean(file.name, 160) || "lease.pdf",
    pdf,
    pages,
    signers,
    lease,
    ip: clientIp(req),
  });
  return Response.json({ ok: true, id: env.id });
}
