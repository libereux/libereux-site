// Sends internal order emails through Resend, the same free service the contact form uses.
// Set RESEND_API_KEY. Optional: CONTACT_TO, CONTACT_FROM.

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendOrderEmail(opts: {
  subject: string;
  fields: [string, string][];
  replyTo?: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set; order email not delivered", opts.subject, opts.fields);
    return false;
  }
  const html = opts.fields
    .filter(([, v]) => v)
    .map(([k, v]) => `<p><strong>${escape(k)}:</strong> ${escape(v).replace(/\n/g, "<br>")}</p>`)
    .join("");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || "Libereux Website <website@libereux.com>",
      to: [process.env.CONTACT_TO || "holdings@libereux.com"],
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      subject: opts.subject,
      html,
    }),
  });
  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return false;
  }
  return true;
}
