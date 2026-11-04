// Lease signing emails through Resend, the same free service the contact form uses.
import { platformFetch } from "./store";

export const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const FROM = () => process.env.ESIGN_FROM || process.env.CONTACT_FROM || "Libereux Holdings <website@libereux.com>";

export function layout(body: string) {
  return `<div style="font-family:Verdana,Arial,sans-serif;font-size:16px;line-height:1.55;color:#111827;max-width:560px">
<div style="border-top:6px solid #FF6B35;padding-top:16px"><strong style="color:#1B2A4A;font-size:18px">Libereux Holdings, LLC</strong></div>
${body}
<p style="color:#5b6472;font-size:13px;margin-top:28px">Libereux Holdings, LLC | holdings@libereux.com | (678) 463-0804</p></div>`;
}

export function button(href: string, label: string) {
  return `<p style="margin:24px 0"><a href="${escape(href)}" style="background:#FF6B35;color:#111827;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:6px;display:inline-block">${escape(label)}</a></p>
<p style="font-size:13px;color:#5b6472">If the button does not work, copy this link into your browser:<br>${escape(href)}</p>`;
}

export async function sendEmail(opts: {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY is not set; email not sent:", opts.subject, opts.to);
    if (process.env.NODE_ENV !== "production") {
      console.log("DEV EMAIL\n", opts.html.replace(/<[^>]+>/g, " "));
      return { ok: true };
    }
    return { ok: false, error: "Email is not configured." };
  }
  const res = await platformFetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM(),
      to: opts.to,
      reply_to: opts.replyTo || "holdings@libereux.com",
      subject: opts.subject,
      html: opts.html,
      ...(opts.attachments ? { attachments: opts.attachments } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Resend error", res.status, text);
    return { ok: false, error: `Email failed (${res.status}).` };
  }
  return { ok: true };
}
