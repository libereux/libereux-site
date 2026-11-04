// Saves completed leases to Google Drive (holdings@libereux.com), in a folder the site creates.
// Uses the Google Cloud project already set up for booking, with the narrow "drive.file" permission:
// the site can only see files it created, nothing else in the Drive. Connect once from the dashboard.
import { kv, platformFetch } from "./store";
import type { Envelope } from "./types";

const CONFIG = "config/drive.json";
const FOLDER_NAME = "Libereux Signed Leases";
type DriveConfig = { refreshToken: string; connectedAt: string; connectedBy: string; folderId?: string };

export const driveAvailable = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
export const driveConfig = () => kv().getJSON<DriveConfig>(CONFIG);
export const redirectUri = (origin: string) => `${origin}/api/esign/drive`;

export function consentUrl(origin: string, state: string) {
  const q = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.file",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "false",
    login_hint: "holdings@libereux.com",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

export async function connect(code: string, origin: string, by: string) {
  const res = await platformFetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  const data = (await res.json()) as { refresh_token?: string; error?: string };
  if (!res.ok || !data.refresh_token) throw new Error(data.error || `Google returned ${res.status}`);
  await kv().setJSON(CONFIG, { refreshToken: data.refresh_token, connectedAt: new Date().toISOString(), connectedBy: by });
}

async function token(cfg: DriveConfig) {
  const res = await platformFetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: cfg.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google Drive sign-in failed (${res.status}). Reconnect Drive on the dashboard.`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function folder(cfg: DriveConfig, access: string) {
  if (cfg.folderId) {
    const r = await platformFetch(`https://www.googleapis.com/drive/v3/files/${cfg.folderId}?fields=id,trashed`, {
      headers: { Authorization: `Bearer ${access}` },
    });
    if (r.ok && !((await r.json()) as { trashed?: boolean }).trashed) return cfg.folderId;
  }
  const r = await platformFetch("https://www.googleapis.com/drive/v3/files?fields=id", {
    method: "POST",
    headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: "application/vnd.google-apps.folder" }),
  });
  if (!r.ok) throw new Error(`Could not create the Drive folder (${r.status}).`);
  cfg.folderId = ((await r.json()) as { id: string }).id;
  await kv().setJSON(CONFIG, cfg);
  return cfg.folderId;
}

export function signedFileName(env: Envelope) {
  const day = (env.completedAt || new Date().toISOString()).slice(0, 10);
  return `${day} ${env.title} (signed).pdf`.replace(/[\\/:*?"<>|]+/g, "-");
}

export async function uploadToDrive(env: Envelope, pdf: Uint8Array) {
  const cfg = await driveConfig();
  if (!cfg) throw new Error("Google Drive is not connected yet.");
  const access = await token(cfg);
  const parent = await folder(cfg, access);
  const boundary = "lx" + Math.random().toString(36).slice(2);
  const meta = JSON.stringify({
    name: signedFileName(env),
    parents: [parent],
    description: `${env.property}. Envelope ${env.id}. Signed by ${env.signers.map((s) => s.typedName || s.name).join(", ")}.`,
  });
  const head = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`;
  const tail = `\r\n--${boundary}--`;
  const body = new Uint8Array([...Buffer.from(head), ...pdf, ...Buffer.from(tail)]);
  const r = await platformFetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink", {
    method: "POST",
    headers: { Authorization: `Bearer ${access}`, "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
  if (!r.ok) throw new Error(`Drive upload failed (${r.status}): ${(await r.text()).slice(0, 200)}`);
  return (await r.json()) as { id: string; webViewLink: string };
}
