// Sends consultation requests by email through Resend (https://resend.com).
// Set RESEND_API_KEY in Vercel. Optional: CONTACT_TO, CONTACT_FROM.

const clean = (v: unknown, max = 2000) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success.
  if (clean(body.website)) return Response.json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Name and a valid email are required." }, { status: 400 });
  }

  const fields: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Phone or WhatsApp", clean(body.phone, 60)],
    ["Based in", clean(body.location, 120)],
    ["Help with", clean(body.service, 60)],
    ["About the business", clean(body.message, 4000)],
  ];

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set; contact request not delivered", fields);
    return Response.json({ error: "Email delivery is not configured." }, { status: 503 });
  }

  const html = fields
    .filter(([, v]) => v)
    .map(([k, v]) => `<p><strong>${k}:</strong> ${escape(v).replace(/\n/g, "<br>")}</p>`)
    .join("");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || "Libereux Website <website@libereux.com>",
      to: [process.env.CONTACT_TO || "holdings@libereux.com"],
      reply_to: email,
      subject: `New consultation request: ${name}`,
      html,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return Response.json({ error: "Could not send." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
