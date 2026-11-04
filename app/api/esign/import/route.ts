// Adds a lease that was already signed elsewhere to the records and the calendar.
import { adminFrom, clientIp, sameOrigin } from "@/lib/esign/auth";
import { cleanLease, importSignedLease, saveToDrive } from "@/lib/esign/envelopes";
import { pageCount } from "@/lib/esign/pdf";
import { PROPERTIES, isDay } from "@/lib/esign/types";

export const maxDuration = 30;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

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
  const property = clean(form.get("property"), 160);
  const tenants = clean(form.get("tenants"), 200)
    .split(/,| and /i)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
  const file = form.get("file");
  const signedOn = clean(form.get("signedOn"), 10);
  if (!(PROPERTIES as readonly string[]).includes(property)) return Response.json({ error: "Pick the property." }, { status: 400 });
  if (!tenants.length) return Response.json({ error: "Add the tenant names." }, { status: 400 });
  if (signedOn && !isDay(signedOn)) return Response.json({ error: "Check the signed date." }, { status: 400 });
  const lease = cleanLease({ start: form.get("start"), end: form.get("end"), rent: form.get("rent"), tenants: tenants.join(" and ") }, tenants.join(" and "));
  if (!lease) return Response.json({ error: "Enter the lease start and end dates." }, { status: 400 });
  if (typeof lease === "string") return Response.json({ error: lease }, { status: 400 });
  if (!(file instanceof File) || file.size === 0) return Response.json({ error: "Attach the signed PDF." }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return Response.json({ error: "The PDF is over 4 MB." }, { status: 400 });
  const pdf = new Uint8Array(await file.arrayBuffer());
  if (Buffer.from(pdf.slice(0, 5)).toString() !== "%PDF-") return Response.json({ error: "That file is not a PDF." }, { status: 400 });
  let pages = 0;
  try {
    pages = await pageCount(pdf);
  } catch {
    return Response.json({ error: "That PDF could not be opened." }, { status: 400 });
  }
  const env = await importSignedLease({
    title: clean(form.get("title"), 140) || `Lease: ${lease.tenants}`,
    property,
    notes: clean(form.get("notes"), 2000),
    createdBy: admin,
    originalName: clean(file.name, 160) || "lease.pdf",
    pdf,
    pages,
    tenants,
    signedOn: signedOn || undefined,
    lease,
    ip: clientIp(req),
  });
  const drive = await saveToDrive(env, pdf);
  return Response.json({ ok: true, id: env.id, drive: drive.ok });
}
