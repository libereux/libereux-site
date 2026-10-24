# libereux.com

Website for Libereux Holdings, LLC. Digital Solutions leads, AI first, global and fully virtual,
with Procurement and Real Estate in a "Libereux family" strip (direction approved 2026-10-21).

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Where things live

- `lib/content.ts`: services (copy from the Pitch Kit one-pagers), FAQs, contact details. Edit copy here and it updates everywhere.
- `app/`: one folder per page. `app/services/[slug]` renders the five service pages. `app/sitemap.ts`, `app/robots.ts` and `app/opengraph-image.tsx` handle SEO.
- `components/`: header, footer, contact form, and one interactive demo per service:
  `HeroDemo` (AI assistant chat), `OpportunityFinder` (AI strategy), `StepsToYes` (websites and apps),
  `SmartHomeScene` (smart home), `SearchPreview` (SEO).
- `app/website-check/`, `components/WebsiteCheck.tsx`, `lib/website-check/`: the free website check. 14 weighted checks, plain-language report, shareable link, print to PDF. Runs on free serverless functions with no paid services. Private and internal network addresses are blocked.
- The earlier live AI assistant is archived on the branch `archive/assistant-v1` (it needs a paid API key).
- `proxy.ts`: the one old URL (`/Procurement`) that needs an exact-case redirect.
- `lib/booking/`, `app/api/slots/`, `app/api/book/`, and the time picker in `components/ContactForm.tsx`: online consultation booking with Google Calendar and Google Meet, no paid services. Setup and hours: `docs/BOOKING_SETUP.md`.
- `app/api/contact/route.ts`: sends the consultation form by email (needs `RESEND_API_KEY`).
- `next.config.ts`: redirects from the old site's URLs and security headers.
- `docs/DEPLOY.md`: GitHub, Netlify (free plan) and Squarespace DNS steps.
- `docs/PORTAL_PLAN.md`: phase 2, tenant and admin portals.
- `app/terms/`, `app/refund-policy/`: published terms and refund policy (approved by James 2026-10-24, awaiting legal review). `docs/TERMS_AND_REFUNDS_DRAFT.md` is the original draft.
- `lib/pricing.ts`, `docs/PRICING_V1_DRAFT.md`, `app/packages/`, `components/PackagesOrder.tsx`, `app/api/order/`, `app/api/stripe-webhook/`, `lib/order/`: approved Pricing v1 with a package page and Stripe deposit checkout. Built but hidden: `pricingLive = false`. Not live.

## House rules for copy

- No em dashes.
- No prices until pricing is final. Every engagement is scoped after the free 30-minute consultation. Approved Pricing v1 exists in `lib/pricing.ts` and `docs/PRICING_V1_DRAFT.md`, switched off by `pricingLive = false`. Do not show any price until the blockers in that document are cleared and `pricingLive` is switched on.
- Never name build platforms or AI tools in anything client-facing. Use outcome language.
- No case studies, testimonials or results without the client's written permission and James's approval of the wording. Never mention FASH.
- Every promise on the site needs James's approval.
- Contact: holdings@libereux.com and (678) 463-0804 only. Location: Georgia, no street address.

## Design tokens

Brand: navy `#1B2A4A`, orange `#FF6B35`, ink `#111827`, light `#F9FAFB`. Deep orange `#C2410C` is used only for small text on light backgrounds, where `#FF6B35` fails contrast.
Headlines: Archivo at 125% width. Body: Atkinson Hyperlegible, 19px base, chosen for older and low-vision readers.
