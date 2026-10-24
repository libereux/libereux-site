// Receives Stripe's "checkout.session.completed" event, tells James a deposit was paid, and
// flags it if the billing country on the card does not match the country the price was based on.
// Needs STRIPE_WEBHOOK_SECRET (the signing secret Stripe shows for this endpoint).

import { createHmac, timingSafeEqual } from "node:crypto";
import { sendOrderEmail } from "@/lib/order/email";

function verify(payload: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const t = parts["t"];
  const sig = parts["v1"];
  if (!t || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false; // 5 minute tolerance
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Not configured." }, { status: 503 });

  const payload = await request.text();
  if (!verify(payload, request.headers.get("stripe-signature"), secret)) {
    return Response.json({ error: "Bad signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as {
    type: string;
    data: {
      object: {
        amount_total?: number;
        customer_email?: string;
        customer_details?: { email?: string; name?: string; address?: { country?: string } };
        metadata?: Record<string, string>;
      };
    };
  };

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const m = s.metadata ?? {};
    const billing = (s.customer_details?.address?.country ?? "").toUpperCase();
    const chosen = (m.country ?? "").toUpperCase();
    const mismatch = billing && chosen && billing !== chosen;

    await sendOrderEmail({
      subject: `${mismatch ? "CHECK PRICE TIER: " : ""}Deposit paid: ${m.name ?? s.customer_details?.name ?? ""}`,
      fields: [
        ["Name", m.name ?? s.customer_details?.name ?? ""],
        ["Email", s.customer_details?.email ?? s.customer_email ?? ""],
        ["Business", m.business ?? ""],
        ["Deposit paid (USD)", s.amount_total ? (s.amount_total / 100).toFixed(2) : ""],
        ["Packages", m.packages ?? ""],
        ["Extras to price in scope", m.extras ?? ""],
        ["Country chosen for price", chosen],
        ["Billing country on card", billing],
        ["Price tier used", m.tier ?? ""],
        ["Mismatch", mismatch ? "YES: billing country differs from the country used for the price. Review before starting work." : "No"],
        ["Notes", m.notes ?? ""],
        ["Next step", "Send the one-paragraph scope confirmation. Do not start work until the client confirms it."],
      ],
    });
  }

  return Response.json({ received: true });
}
