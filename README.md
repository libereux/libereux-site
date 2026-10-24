# libereux.com

Website for Libereux Holdings, LLC, led by Digital Solutions.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Where things live

- `lib/content.ts`: prices, case studies, FAQs, service areas. Edit copy here and it updates everywhere.
- `app/`: one folder per page. `app/sitemap.ts`, `app/robots.ts` and `app/opengraph-image.tsx` handle SEO.
- `components/`: header, footer, hero demo, pricing, contact form.
- `app/api/contact/route.ts`: sends the consultation form by email (needs `RESEND_API_KEY`).
- `next.config.ts`: redirects from the old site's URLs and security headers.
- `docs/DEPLOY.md`: GitHub, Vercel and Squarespace DNS steps.
- `docs/PORTAL_PLAN.md`: phase 2, tenant and admin portals.

## House rules for copy

- No em dashes.
- Never name the build platform in anything client-facing. Use outcome language.
- Show real prices. Do not invent client details; case studies come from the Digital Solutions Marketing folder in Drive.

## Design tokens

Ink `#17222D`, signal orange `#EE6A1F`, deep orange `#B44A0E` for small text, paper `#F5F7F8`, steel `#56626C`.
Headlines: Archivo at 125% width. Body: Atkinson Hyperlegible, 19px base, chosen for older and low-vision readers.
