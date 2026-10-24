# Deploying libereux.com

The domain stays registered at Squarespace. Only its DNS records change. No transfer needed.

## 1. Put the code on GitHub

1. Create a free account at github.com (use holdings@libereux.com).
2. Create a new **private** repository named `libereux-site`. Leave it empty.
3. Upload this project to it (Claude can do this once the repository exists and is connected).

## 2. Create the Vercel project

1. Sign up at vercel.com with "Continue with GitHub".
2. Add New Project, pick `libereux-site`, keep the defaults, Deploy.
3. You get a preview address like `libereux-site.vercel.app`. Review everything there.

## 3. Turn on the contact form

1. Sign up at resend.com, add the domain `libereux.com`, and add the DNS records Resend shows you in Squarespace (they do not affect the website).
2. Create an API key.
3. In Vercel, Project Settings, Environment Variables, add:
   - `RESEND_API_KEY` = the key
   - `CONTACT_TO` = holdings@libereux.com (optional, this is the default)
   - `CONTACT_FROM` = `Libereux Website <website@libereux.com>` (optional, this is the default)
4. Redeploy.

Until this is done, the form shows a message asking people to email holdings@libereux.com directly.

## 3b. Turn on the live assistant

1. Create an API key at console.anthropic.com (Libereux account, holdings@libereux.com).
2. In the Console, set a **monthly spend limit** first. This caps the cost no matter how much traffic arrives.
3. In Vercel, add `ANTHROPIC_API_KEY` = the key. Optional: `ASSISTANT_MODEL=claude-haiku-5-5` for lower cost per chat.
4. Redeploy. Until the key is set, the assistant shows a friendly "switched off" message with a button to book a consultation.

Built-in protections: 40 messages per visitor per hour, requests only from libereux.com, messages capped at 2,000 characters, and the website scanner refuses private or internal network addresses.

## 4. Point the domain

No tenants use the old portal, so the domain can move as soon as you approve the Vercel preview. Old portal URLs temporarily redirect to the property management page until the portals are rebuilt (see PORTAL_PLAN.md).

1. In Vercel, Project Settings, Domains, add `libereux.com` and `www.libereux.com`. Vercel shows the exact records to use.
2. In Squarespace: Domains, libereux.com, DNS Settings.
3. Remove the existing A, AAAA and CNAME records for `@` and `www` that point to the old platform. Do **not** touch MX records (email) or TXT records you did not create for the old site.
4. Add the records Vercel showed. Typically:
   - A record, host `@`, value `76.76.21.21`
   - CNAME record, host `www`, value `cname.vercel-dns.com`
   Use whatever Vercel displays if it differs.
5. Wait for Vercel to show both domains as Valid (minutes to a few hours). HTTPS is automatic.
6. Disconnect the custom domain from the old app afterwards.

## 5. After launch

1. Google Search Console: add `libereux.com`, verify with a DNS TXT record in Squarespace, submit `https://libereux.com/sitemap.xml`.
2. Google Business Profile for Libereux Digital Solutions, linking to `https://libereux.com/digital-solutions`.
3. Check the old URLs redirect: `/DigitalSolutions`, `/Procurement`, `/PrivacyPolicy`.
