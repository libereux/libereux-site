// Connects Google Drive once. Without a code: sends the signed-in admin to Google's consent screen.
// With a code (Google sends them back here): stores the Drive permission and returns to the dashboard.
import { adminFrom, baseUrl, newToken, sha256 } from "@/lib/esign/auth";
import { connect, consentUrl, driveAvailable } from "@/lib/esign/drive";
import { kv } from "@/lib/esign/store";

export async function GET(req: Request) {
  const origin = baseUrl(req);
  const home = `${origin}/admin/leases`;
  const admin = await adminFrom(req);
  if (!admin) return Response.redirect(home, 303);
  if (!driveAvailable()) return Response.redirect(`${home}?drive=unavailable`, 303);

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    if (url.searchParams.get("error")) return Response.redirect(`${home}?drive=declined`, 303);
    const state = newToken();
    await kv().setJSON(`drive-states/${sha256(state)}.json`, { admin, exp: Date.now() + 10 * 60_000 });
    return Response.redirect(consentUrl(origin, state), 303);
  }
  const state = url.searchParams.get("state") || "";
  const key = `drive-states/${sha256(state)}.json`;
  const rec = await kv().getJSON<{ admin: string; exp: number }>(key);
  await kv().delete(key);
  if (!rec || rec.exp < Date.now()) return Response.redirect(`${home}?drive=expired`, 303);
  try {
    await connect(code, origin, admin);
  } catch (e) {
    console.error("drive connect", e);
    return Response.redirect(`${home}?drive=failed`, 303);
  }
  return Response.redirect(`${home}?drive=connected`, 303);
}
