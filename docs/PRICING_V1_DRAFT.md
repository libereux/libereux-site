# Pricing v1 (DRAFT, not live)

Status: proposed 2026-10-24. The numbers are test values and are not approved. Nothing in this
document is shown on libereux.com. The data lives in `lib/pricing.ts` behind `pricingLive = false`.

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

Countries not listed are not assigned a tier and go to the custom quote path. Open decision for James.

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

Add-ons (extra page, extra language, online booking, extra revision round, rush delivery) are
planned at roughly 10 to 15 percent of the package price. Amounts not set.

Confidence: only the three Starter figures come from James's earlier tier structure. Everything
else is a guess and needs delivery-time and cost data before approval.

## Test plan

Run cart-first in some markets and consultation-first in others. Track reply rate, checkout
starts, completed deposits, refunds and scope disputes by market. Indigo reports this weekly.
Start only in markets rated GREEN on email compliance.

## Blockers before anything goes live

1. James approves the numbers and the copy in writing (house rule: every promise needs approval).
2. Payments are set up for each country, and the cross-border legal and accounting review has cleared
   checkout for that market.
3. A decision on a payment processor. Any processor charges per transaction; that is a sales cost,
   not a running cost, but it should be a conscious choice.
4. A decision on countries outside the three tiers.
5. Olive's order intake, scope confirmation template and deposit tracking exist in Drive.

## Site work still to build (not started)

- `/packages` page showing the cart, with the regional price and a "regional pricing" label.
- Order brief form (short, plain language), stored by email or Drive, no paid services.
- "Not sure / custom" request path and the 24 hour quote promise.
- Updates to the FAQ ("What does it cost?"), how-it-works steps, the home page and services pages,
  the `site.description`, and the README house rule on prices.
- Billing-country price selection that cannot be changed by browsing from another country.
- Sitemap and structured data for the new page.
- Release only by switching `pricingLive` to true after the blockers above are cleared.
