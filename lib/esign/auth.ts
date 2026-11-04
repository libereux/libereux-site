// Admin sign-in for the lease tool: email link to an allow-listed address, then a signed cookie.
// No passwords. The signing key is generated once and kept in private storage, so no secret
// has to be configured by hand.
import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { kv } from "./store";

export const SESSION_COOKIE = "lx_admin";
const SESSION_DAYS = 30;

export function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || "holdings@libereux.com,jetblack56@gmail.com";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const sha256 = (b: Uint8Array | string) => createHash("sha256").update(b).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");
export const newId = () => randomBytes(9).toString("base64url");

let secret: string | null = null;
async function appSecret(): Promise<string> {
  if (secret) return secret;
  const store = kv();
  const existing = await store.getJSON<{ v: string }>("config/secret");
  if (existing?.v) return (secret = existing.v);
  await store.setJSON("config/secret", { v: randomBytes(48).toString("base64url") }, { onlyIfNew: true });
  const saved = await store.getJSON<{ v: string }>("config/secret");
  if (!saved?.v) throw new Error("Could not create signing key.");
  return (secret = saved.v);
}

const sign = async (payload: string) => createHmac("sha256", await appSecret()).update(payload).digest("base64url");

export async function makeSession(email: string) {
  const exp = Date.now() + SESSION_DAYS * 86_400_000;
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString("base64url");
  return { value: `${payload}.${await sign(payload)}`, maxAge: SESSION_DAYS * 86_400 };
}

function readCookie(req: Request, name: string) {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return "";
}

export async function adminFrom(req: Request): Promise<string | null> {
  const value = readCookie(req, SESSION_COOKIE);
  const [payload, mac] = value.split(".");
  if (!payload || !mac) return null;
  const expected = await sign(payload);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { email, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof exp !== "number" || exp < Date.now()) return null;
    if (!adminEmails().includes(String(email).toLowerCase())) return null;
    return String(email);
  } catch {
    return null;
  }
}

export function sessionCookie(value: string, maxAge: number) {
  return `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clientIp(req: Request) {
  return (
    req.headers.get("x-nf-client-connection-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") || req.headers.get("host"));
  } catch {
    return false;
  }
}

export function baseUrl(req: Request) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.startsWith("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : "https://libereux.com";
}

const hits = new Map<string, { n: number; reset: number }>();
export function limited(key: string, max: number) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + 3_600_000 });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  h.n += 1;
  return h.n > max;
}
