// Lease envelopes: create, send in order, record views and signatures, finish and distribute.
import { kv } from "./store";
import { newId, newToken, sha256 } from "./auth";
import { buildSignedPdf, eastern } from "./pdf";
import { button, escape, layout, sendEmail } from "./email";
import { driveConfig, uploadToDrive } from "./drive";
import { FIELD_TYPES, type Envelope, type EnvelopeEvent, type Field, type Signer } from "./types";

const envKey = (id: string) => `envelopes/${id}.json`;
const fileKey = (id: string, name: string) => `files/${id}/${name}`;
const tokenKey = (hash: string) => `tokens/${hash}.json`;

export const now = () => new Date().toISOString();

export async function getEnvelope(id: string) {
  if (!/^[A-Za-z0-9_-]{6,40}$/.test(id)) return null;
  return kv().getJSON<Envelope>(envKey(id));
}
export async function saveEnvelope(env: Envelope) {
  await kv().setJSON(envKey(env.id), env);
}
export async function listEnvelopes() {
  const keys = await kv().list("envelopes/");
  const all = await Promise.all(keys.map((k) => kv().getJSON<Envelope>(k)));
  return all.filter((e): e is Envelope => !!e).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export const getFile = (id: string, name: string) => kv().getBytes(fileKey(id, name));

export function log(env: Envelope, e: Omit<EnvelopeEvent, "at">) {
  env.events.push({ at: now(), ...e });
}

export async function createEnvelope(input: {
  title: string;
  property: string;
  notes?: string;
  createdBy: string;
  originalName: string;
  pdf: Uint8Array;
  pages: number;
  signers: { name: string; email: string; role: string }[];
  ip: string;
}): Promise<Envelope> {
  const id = newId();
  await kv().setBytes(fileKey(id, "original.pdf"), input.pdf);
  const env: Envelope = {
    id,
    title: input.title,
    property: input.property,
    notes: input.notes,
    createdAt: now(),
    createdBy: input.createdBy,
    status: "draft",
    originalSha256: sha256(input.pdf),
    originalName: input.originalName,
    pages: input.pages,
    current: 0,
    signers: input.signers.map((s) => ({ ...s, status: "waiting", tokenHash: "" }) as Signer),
    fields: [],
    events: [],
  };
  log(env, { type: "Created", actor: input.createdBy, ip: input.ip, detail: `${input.originalName}, SHA-256 ${env.originalSha256}` });
  await saveEnvelope(env);
  return env;
}

const clamp = (n: unknown, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number(n) || 0));

export function cleanFields(env: Envelope, raw: unknown): Field[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 300).flatMap((r) => {
    const f = r as Record<string, unknown>;
    const type = String(f.type) as Field["type"];
    const signer = Math.floor(Number(f.signer));
    const page = Math.floor(Number(f.page));
    if (!FIELD_TYPES.includes(type) || !(signer >= 0 && signer < env.signers.length) || !(page >= 0 && page < env.pages)) return [];
    const w = clamp(f.w, 0.01, 1);
    const h = clamp(f.h, 0.008, 1);
    return [
      {
        id: String(f.id || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 24) || newId(),
        signer,
        type,
        page,
        x: clamp(f.x, 0, 1 - w),
        y: clamp(f.y, 0, 1 - h),
        w,
        h,
        required: type === "checkbox" ? !!f.required : f.required !== false,
        label: typeof f.label === "string" ? f.label.slice(0, 60) : undefined,
      },
    ];
  });
}

// Every signer needs somewhere to sign before the lease can go out.
export function missingSignatureFields(env: Envelope) {
  return env.signers.filter((_, i) => !(env.fields || []).some((f) => f.signer === i && f.type === "signature"));
}

export async function sendEnvelope(env: Envelope, origin: string, actor: string) {
  env.status = "in_progress";
  env.current = 0;
  log(env, { type: "Fields placed", actor, detail: `${(env.fields || []).length} fields` });
  await saveEnvelope(env);
  return inviteCurrent(env, origin, actor);
}

// Issues a fresh link for the signer whose turn it is and emails it. Older links for that signer stop working.
export async function inviteCurrent(env: Envelope, origin: string, actor: string): Promise<{ ok: boolean; error?: string }> {
  const s = env.signers[env.current];
  if (!s || env.status !== "in_progress") return { ok: false, error: "Nothing to send." };
  if (s.tokenHash) await kv().delete(tokenKey(s.tokenHash));
  const token = newToken();
  s.tokenHash = sha256(token);
  await kv().setJSON(tokenKey(s.tokenHash), { id: env.id, idx: env.current });
  const link = `${origin}/sign?t=${token}`;
  const earlier = env.signers.slice(0, env.current).filter((x) => x.status === "signed");
  const html = layout(`
<p>Hello ${escape(s.name)},</p>
<p>Your lease is ready for your signature: <strong>${escape(env.title)}</strong> for ${escape(env.property)}.</p>
${earlier.length ? `<p>Already signed by: ${earlier.map((x) => escape(x.name)).join(", ")}.</p>` : ""}
<p>Please read it in full, then sign on your phone or computer. It takes about two minutes.</p>
${button(link, "Review and sign the lease")}
<p>This link is personal to you. Please do not forward it. Questions? Reply to this email or call (678) 463-0804.</p>`);
  const sent = await sendEmail({ to: [s.email], subject: `Please sign: ${env.title}`, html });
  if (!sent.ok) {
    log(env, { type: "Email failed", actor, detail: `To ${s.email}: ${sent.error}` });
    await saveEnvelope(env);
    return sent;
  }
  s.status = s.status === "viewed" ? "viewed" : "sent";
  s.sentAt = now();
  log(env, { type: "Sent for signature", actor, detail: `${s.role} ${s.name} <${s.email}>` });
  await saveEnvelope(env);
  return { ok: true };
}

export async function fromToken(token: string) {
  if (!token || token.length < 30 || token.length > 80) return null;
  const hash = sha256(token);
  const ref = await kv().getJSON<{ id: string; idx: number }>(tokenKey(hash));
  if (!ref) return null;
  const env = await getEnvelope(ref.id);
  if (!env) return null;
  const signer = env.signers[ref.idx];
  if (!signer || signer.tokenHash !== hash) return null;
  return { env, idx: ref.idx, signer };
}

export async function recordSignature(opts: {
  env: Envelope;
  idx: number;
  typedName: string;
  png: Uint8Array | null;
  initials: Uint8Array | null;
  values: Record<string, string>;
  ip: string;
  userAgent: string;
  origin: string;
}) {
  const { env, idx } = opts;
  const s = env.signers[idx];
  s.status = "signed";
  s.signedAt = now();
  s.ip = opts.ip;
  s.userAgent = opts.userAgent;
  s.typedName = opts.typedName;
  s.signatureMethod = opts.png ? "drawn" : "typed";
  s.values = opts.values;
  if (opts.png) await kv().setBytes(fileKey(env.id, `sig-${idx}.png`), opts.png);
  if (opts.initials) await kv().setBytes(fileKey(env.id, `ini-${idx}.png`), opts.initials);
  log(env, {
    type: "Signed",
    actor: `${s.role} ${opts.typedName} <${s.email}>`,
    ip: opts.ip,
    detail: `Agreed to sign electronically; ${s.signatureMethod} signature; ${opts.userAgent.slice(0, 120)}`,
  });

  if (idx + 1 < env.signers.length) {
    env.current = idx + 1;
    await saveEnvelope(env);
    await inviteCurrent(env, opts.origin, "System");
    return;
  }
  await finish(env);
}

async function finish(env: Envelope) {
  env.status = "completed";
  env.completedAt = now();
  log(env, { type: "Completed", actor: "System", detail: "All parties signed" });
  const original = await getFile(env.id, "original.pdf");
  if (!original) throw new Error("Original document missing.");
  const sigs = await Promise.all(env.signers.map((_, i) => getFile(env.id, `sig-${i}.png`)));
  const inits = await Promise.all(env.signers.map((_, i) => getFile(env.id, `ini-${i}.png`)));
  const signed = await buildSignedPdf(env, original, sigs, inits);
  env.signedSha256 = sha256(signed);
  await kv().setBytes(fileKey(env.id, "signed.pdf"), signed);
  await saveEnvelope(env);
  await saveToDrive(env, signed);
  await sendCompleted(env, signed);
}

export async function saveToDrive(env: Envelope, signed: Uint8Array) {
  if (!(await driveConfig())) {
    log(env, { type: "Not saved to Drive", actor: "System", detail: "Google Drive is not connected" });
    await saveEnvelope(env);
    return { ok: false, error: "Google Drive is not connected yet." };
  }
  try {
    const file = await uploadToDrive(env, signed);
    env.driveFileId = file.id;
    env.driveLink = file.webViewLink;
    log(env, { type: "Saved to Google Drive", actor: "System", detail: "Libereux Signed Leases folder" });
    await saveEnvelope(env);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Drive upload failed";
    console.error("drive", msg);
    log(env, { type: "Drive save failed", actor: "System", detail: msg });
    await saveEnvelope(env);
    return { ok: false, error: msg };
  }
}

export async function sendCompleted(env: Envelope, signed: Uint8Array) {
  const filename = `${env.title.replace(/[^A-Za-z0-9 _-]+/g, "").trim().replace(/\s+/g, "_") || "Lease"}_signed.pdf`;
  const html = layout(`
<p>Hello,</p>
<p>Everyone has signed <strong>${escape(env.title)}</strong> for ${escape(env.property)}. The completed copy is attached for your records.</p>
<p>Signed by: ${env.signers.map((s) => `${escape(s.typedName || s.name)} (${escape(s.role)}, ${escape(eastern(s.signedAt))})`).join("; ")}.</p>
<p>The last pages are the signature page and a certificate with the audit trail.</p>`);
  const res = await sendEmail({
    to: env.signers.map((s) => s.email),
    subject: `Completed: ${env.title}`,
    html,
    attachments: [{ filename, content: Buffer.from(signed).toString("base64") }],
  });
  log(env, { type: res.ok ? "Completed copy emailed" : "Email failed", actor: "System", detail: env.signers.map((s) => s.email).join(", ") });
  await saveEnvelope(env);
  return res;
}
