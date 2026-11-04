// Admin sign-in for the lease tool. POST sends a one-time link to an allow-listed email.
// GET (the link) sets a 30-day session cookie and opens the lease dashboard.
import { adminEmails, baseUrl, limited, clientIp, makeSession, newToken, sameOrigin, sessionCookie, sha256 } from "@/lib/esign/auth";
import { kv } from "@/lib/esign/store";
import { button, layout, sendEmail } from "@/lib/esign/email";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Not allowed." }, { status: 403 });
  if (limited(`login:${clientIp(req)}`, 8)) return Response.json({ error: "Too many tries. Try again in an hour." }, { status: 429 });
  let email = "";
  try {
    email = String((await req.json()).email || "").trim().toLowerCase().slice(0, 200);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  // Same answer either way, so the form never reveals which emails have access.
  if (adminEmails().includes(email)) {
    const token = newToken();
    await kv().setJSON(`logins/${sha256(token)}.json`, { email, exp: Date.now() + 15 * 60_000 });
    const link = `${baseUrl(req)}/api/esign/login?t=${token}`;
    await sendEmail({
      to: [email],
      subject: "Your sign-in link for Libereux leases",
      html: layout(`<p>Use this link to open the lease dashboard. It works once and expires in 15 minutes.</p>${button(link, "Open the lease dashboard")}<p>If you did not ask for this, ignore this email.</p>`),
    });
  }
  return Response.json({ ok: true });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t") || "";
  const home = `${baseUrl(req)}/admin/leases`;
  if (token.length < 30 || token.length > 80) return Response.redirect(`${home}?login=invalid`, 303);
  const key = `logins/${sha256(token)}.json`;
  const rec = await kv().getJSON<{ email: string; exp: number }>(key);
  await kv().delete(key);
  if (!rec || rec.exp < Date.now() || !adminEmails().includes(rec.email)) {
    return Response.redirect(`${home}?login=expired`, 303);
  }
  const s = await makeSession(rec.email);
  return new Response(null, { status: 303, headers: { Location: home, "Set-Cookie": sessionCookie(s.value, s.maxAge) } });
}
