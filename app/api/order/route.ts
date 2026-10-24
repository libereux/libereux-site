// Takes an order brief. Either starts a Stripe Checkout for the 50 percent deposit,
// or sends a written-quote request by email. The price is always computed here from
// lib/pricing.ts; the browser's numbers are never trusted.
// Needs STRIPE_SECRET_KEY for checkout and RESEND_API_KEY for email.

import { site } from "@/lib/content";
import { sendOrderEmail } from "@/lib/order/email";
import {
  addOns as knownAddOns,
  depositCents,
  findPackage,
  isCheckoutPackage,
  priceFor,
  pricingLive,
  routeToConsultation,
  tierForCountry,
} from "@/lib/pricing";

const clean = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, max = 20) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, max) : [];

export async function POST(request: Request) {
  if (!pricingLive) return Response.json({ error: "Not available." }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success.
  if (clean(body.website)) return Response.json({ ok: true, kind: "quote" });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Name and a valid email are required." }, { status: 400 });
  }

  const country = clean(body.country, 8).toUpperCase();
  const tier = tierForCountry(country);
  const packageIds = list(body.packages);
  const flags = list(body.flags).filter((f) => routeToConsultation.includes(f));
  const extras = list(body.addOns).filter((a) => knownAddOns.includes(a));
  const business = clean(body.business, 160);
  const notes = clean(body.notes, 4000);
  const wantsQuote = body.wantsQuote === true;

  const packs = packageIds
    .map((id) => findPackage(id))
    .filter((p): p is NonNullable<typeof p> => !!p && isCheckoutPackage(p));

  const baseFields: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Business", business],
    ["Billing country", country],
    ["Packages", packs.map((p) => p.name).join(", ")],
    ["Extras to price in scope", extras.join(", ")],
    ["Needs written quote because", flags.join(", ")],
    ["Notes", notes],
  ];

  // Quote path: not sure, complex project, no tier for the country, or nothing picked.
  const quoteReason = wantsQuote
    ? "asked for a quote"
    : flags.length > 0
      ? "complex project"
      : tier === null
        ? "country has no tier"
        : packs.length === 0
          ? "nothing selected"
          : null;

  if (quoteReason || tier === null) {
    const sent = await sendOrderEmail({
      subject: `Quote request (${quoteReason ?? "review"}): ${name}`,
      fields: [["Reason", quoteReason ?? "review"], ...baseFields],
      replyTo: email,
    });
    if (!sent) return Response.json({ error: "Could not send." }, { status: 502 });
    return Response.json({ ok: true, kind: "quote" });
  }

  // Checkout needs the client's agreement to the terms and refund policy.
  if (body.agreed !== true) {
    return Response.json({ error: "Please agree to the terms and refund policy to continue." }, { status: 400 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("STRIPE_SECRET_KEY is not set; checkout unavailable");
    return Response.json({ error: "Checkout is not configured." }, { status: 503 });
  }

  // Build the Stripe Checkout Session with plain form encoding (no SDK, no extra dependency).
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", `${site.url}/packages/thanks`);
  form.set("cancel_url", `${site.url}/packages`);
  form.set("customer_email", email);
  form.set("billing_address_collection", "required");
  packs.forEach((p, i) => {
    form.set(`line_items[${i}][quantity]`, "1");
    form.set(`line_items[${i}][price_data][currency]`, "usd");
    form.set(`line_items[${i}][price_data][unit_amount]`, String(depositCents(p, tier)));
    form.set(`line_items[${i}][price_data][product_data][name]`, `${p.name}: 50% deposit`);
    form.set(
      `line_items[${i}][price_data][product_data][description]`,
      `Total ${priceFor(p, tier)} USD. Balance due at handover. Written scope sent before work starts.`,
    );
  });
  form.set("metadata[terms_version]", "2026-10-24");
  form.set("metadata[terms_accepted_at]", new Date().toISOString());
  form.set("metadata[country]", country);
  form.set("metadata[tier]", String(tier));
  form.set("metadata[packages]", packs.map((p) => p.id).join(",").slice(0, 480));
  form.set("metadata[name]", name.slice(0, 120));
  form.set("metadata[business]", business.slice(0, 120));
  form.set("metadata[extras]", extras.join(",").slice(0, 480));
  form.set("metadata[notes]", notes.slice(0, 480));

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!res.ok) {
    console.error("Stripe error", res.status, await res.text());
    return Response.json({ error: "Could not start checkout." }, { status: 502 });
  }
  const session = (await res.json()) as { url?: string };
  if (!session.url) return Response.json({ error: "Could not start checkout." }, { status: 502 });

  // Heads up to James that a checkout started (the paid email comes from the webhook).
  await sendOrderEmail({ subject: `Checkout started: ${name}`, fields: baseFields, replyTo: email });
  return Response.json({ ok: true, kind: "checkout", url: session.url });
}
