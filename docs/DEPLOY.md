# Deploying libereux.com

Running cost: $0. Hosting is on Netlify's free plan, which allows commercial sites. Vercel's free
plan does not (it is limited to personal, non-commercial use). The domain stays registered at
Squarespace; only its DNS records change.

## 1. Put the code on GitHub

1. Create a free account at github.com (use holdings@libereux.com).
2. Create a new **private** repository named `libereux-site`. Leave it empty.
3. Upload this project to it (Claude can do this once the repository exists and is connected).

## 2. Create the Netlify site

1. Sign up at netlify.com with "Sign up with GitHub" (free plan).
2. Add new site, Import an existing project, GitHub, pick `libereux-site`.
3. Keep the detected settings (Next.js is configured automatically). Deploy.
4. You get a preview address like `libereux-site.netlify.app`. Review every page there, and run the
   free website check on a few real sites, before touching the domain.

## 3. Turn on the contact form (free)

1. Sign up at resend.com (free plan) and add the domain `libereux.com`. Add the DNS records Resend
   shows you in Squarespace. They are for email only and do not affect the website.
2. Create an API key.
3. In Netlify, Site configuration, Environment variables, add:
   - `RESEND_API_KEY` = the key
   - `CONTACT_TO` = holdings@libereux.com (optional, this is the default)
   - `CONTACT_FROM` = `Libereux Website <website@libereux.com>` (optional, this is the default)
4. Trigger a new deploy.

Until this is done, the form asks people to email holdings@libereux.com directly.

## 4. Point the domain

1. In Netlify, Domain management, add `libereux.com`. Netlify adds `www` too.
2. In Squarespace: Domains, libereux.com, DNS Settings.
3. Remove the existing A, AAAA and CNAME records for `@` and `www` that point to the old platform.
   Do **not** touch MX records (email) or TXT records you did not create for the old site.
4. Add:
   - A record, host `@`, value `75.2.60.5`
   - CNAME record, host `www`, value `<your-site-name>.netlify.app`
   If Netlify shows different values in its "Pending DNS verification" screen, use those.
5. Wait for Netlify to show the domain as verified (minutes to 24 hours). HTTPS is automatic.
6. Disconnect the custom domain from the old Base44 app afterwards. Keep the Base44 account itself
   for client builds.

## 5. After launch

1. Google Search Console: add `libereux.com`, verify with a DNS TXT record in Squarespace, and submit
   `https://libereux.com/sitemap.xml`.
2. Check the old URLs redirect: `/DigitalSolutions`, `/Procurement`, `/PrivacyPolicy`.
3. Run the website check on libereux.com itself. It should score in the 90s.

## Free plan limits to know

Netlify's free plan includes monthly allowances for bandwidth, builds and function runs. A small
business site with a website check tool should sit well inside them. Check the current limits on
your Netlify billing page after signing up, and turn on usage notifications so nothing surprises you.

## Turning on packages and Stripe checkout (not yet)

Only do this after the blockers in `docs/PRICING_V1_DRAFT.md` are cleared.

1. In Netlify, Site configuration, Environment variables, add:
   - `STRIPE_SECRET_KEY` = a Stripe secret key (use a test key first)
   - `STRIPE_WEBHOOK_SECRET` = the signing secret of the webhook endpoint
2. In Stripe, Developers, Webhooks, add `https://libereux.com/api/stripe-webhook` for the event
   `checkout.session.completed`.
3. Stripe charges a fee per transaction and no monthly fee for this setup. That is a cost of sales,
   not a running cost.
4. Place a test order, check the emails, then change `pricingLive` to `true` in `lib/pricing.ts` and deploy.
