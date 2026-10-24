# Pricing v1 (approved, built, switched off)

Status: James Collins approved the prices, Stripe as the processor, and the custom-quote rule for
unlisted countries on 2026-10-24. The packages page, order form and Stripe checkout are built but
hidden: `pricingLive` in `lib/pricing.ts` is `false`, so `/packages` returns a 404 and the order API
refuses requests. Nothing here is visible on libereux.com until that flag is switched to `true`.

## What changes in strategy

Today the site is consultation first, with no prices. Version 1 moves to fixed-price packages that
can be ordered without a call, keeps the free 30-minute consultation as an option beside them, and
sends complex work to a consultation or a paid audit.

## Three ways to start

1. Buy a package. Add to cart, fill a short brief, pay a 50 percent deposit at checkout.
2. "Not sure / custom". Describe the business and goals, receive a written quote within 24 hours.
3. Free 15-minute fit call, always visible, never required.

Auto-route to a consultation or the paid audit when the order includes: integrations with existing
systems, large e-commerce, storing customer data, multiple locations, custom apps, or any health data.

Scope protection: the free-text box is labeled "notes". Before work starts, the client receives a
one-paragraph scope confirmation listing what is and is not included. No work starts without that
confirmation and the deposit.

## Regional pricing

Price is set by billing country and labeled "regional pricing". One price is shown per visitor.

- Tier 1: US, UK, Canada, Australia
- Tier 2: Thailand, Malaysia, Mexico, South Africa
- Tier 3: Philippines, Nigeria, India, Kenya, Ghana, Pakistan

Countries not listed are not assigned a tier and go to the custom quote path (decided by James).

## Packages (USD)

| Item | Tier 1 | Tier 2 | Tier 3 | Included |
|---|---|---|---|---|
| Website Starter | 699 | 349 | 199 | Up to 5 pages, mobile ready, contact form, 1 revision round, 7 business days |
| Website Plus | 1,150 | 575 | 325 | Up to 8 pages, booking or lead capture, basic search setup, 2 revision rounds, 5 business days |
| Website Pro | 1,600 | 800 | 450 | Everything in Plus, a second language, 3 business days |
| Website update and search tune-up | 249 | 129 | 79 | Text and image swaps, speed and search fixes, no new features |
| AI assistant (one channel) | 899 | 449 | 249 | Setup, trained on business info, 30 days of adjustments |
| Single workflow automation | 499 | 249 | 149 | One process, tested and documented |
| AI Opportunity Audit | 149 | 79 | 49 | Written plan, credited toward a build within 30 days |
| Care plan (per month) | 10 | 10 | 10 | Text and image swaps only |

Add-ons (extra page, extra language, online booking, extra revision round, rush delivery) have no
set amounts. They are collected on the order form and priced in the written scope confirmation
before work starts. They are not charged at checkout.

The care plan ($10 per month) is a subscription, so it is set up after launch and is not part of
checkout.

Note: only the three Starter figures came from James's earlier tier structure. The rest were
proposed by Claude and approved by James without delivery-time or cost data, so review them after
the first real orders.

## Test plan

Run cart-first in some markets and consultation-first in others. Track reply rate, checkout
starts, completed deposits, refunds and scope disputes by market. Indigo reports this weekly.
Start only in markets rated GREEN on email compliance.

## What is built

- `/packages`: package list with the regional price, extras, a "does your project include any of
  these" check, and the order form. Hidden while `pricingLive` is false.
- `/packages/thanks`: what happens after the deposit.
- `POST /api/order`: validates the brief and recomputes the price on the server from `lib/pricing.ts`.
  Sends complex projects, unlisted countries, "not sure" requests and empty carts to a written-quote
  email. Otherwise creates a Stripe Checkout Session for the 50 percent deposit (one line per package,
  billing address required) and emails James that a checkout started.
- `POST /api/stripe-webhook`: verifies Stripe's signature, emails James when a deposit is paid, and
  flags the order if the billing country on the card differs from the country the price was based on.
- The sitemap lists `/packages` only when `pricingLive` is true.

Tested locally with the flag off (pages 404, API 404, no sitemap entry) and on (pages 200, bad input
400, no Stripe key 503, unlisted country goes to the quote path, signed webhook accepted, forged
webhook rejected, mismatch flagged). Not tested against real Stripe or real email: that needs the keys.

## Blockers before switching it on

1. Create the Stripe account for Libereux Holdings, LLC and confirm which countries and payment
   methods it can accept. Support for the Tier 3 countries is unverified.
2. In Netlify, add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. In Stripe, add a webhook endpoint
   at `https://libereux.com/api/stripe-webhook` for `checkout.session.completed`. Use test keys first.
3. The cross-border legal and accounting review clears checkout for each market.
4. DONE 2026-10-24: terms, refund policy and the privacy update are published at `/terms`, `/refund-policy` and `/privacy`, linked from the footer, and checkout requires agreement. Still to do: have a legal professional review them.
5. Olive has the order intake, scope confirmation template and deposit tracking ready in Drive.
6. Update the site copy that still says every engagement is scoped after a consultation: the FAQ
   ("What does it cost?"), `/how-it-works`, the home and services pages, `site.description`, and the
   README house rule on prices. Add a link to `/packages` in the header and footer.
7. Run a test purchase in Stripe test mode end to end, then set `pricingLive = true`.

## Not decided yet

- Whether prices should also be shown on the service pages.
- Whether to auto-detect country as a suggestion. Today the visitor chooses their billing country
  and the webhook flags a mismatch.
