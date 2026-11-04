# Lease signing (internal)

Private tool for James and Sharo at `/admin/leases`. Not linked from the site, not indexed.

## How it works

1. Sign in at libereux.com/admin/leases with an allowed email. You get a one-time link (15 minutes), then stay signed in for 30 days.
2. Fill in the title, property, the final lease PDF and the signing order (default: tenants, then Sharo, then James). Press Send.
3. Each signer gets an email with a personal link only when it is their turn. They read the lease, type their name, draw or type a signature, and agree to sign electronically.
4. When the last person signs, the site builds the completed PDF: the original pages (stamped with the envelope ID, form fields locked), a signature page, and a certificate with the document fingerprint and the full audit trail. Everyone gets it by email as an attachment.
5. Every lease, its status, original and signed copy stay on the dashboard.

## Settings

- `ADMIN_EMAILS` (optional): comma-separated emails allowed to sign in. Default `holdings@libereux.com,jetblack56@gmail.com`. Add Sharo's email here to give her dashboard access.
- `RESEND_API_KEY`: already set for the contact form; the same key sends signing emails.
- `ESIGN_FROM` (optional): sender, default the contact form sender.

## Storage and cost

Netlify Blobs (store `esign`), free on the current plan. Files are private and only reachable through the signed-in dashboard or a signer's personal link. Running cost: $0.

Back up signed leases: download each completed copy to Google Drive. Blobs has no automatic backup.

## Local testing

`ESIGN_LOCAL_STORE=1 npm run dev`. Without `RESEND_API_KEY`, emails are printed to the terminal instead of sent.

## Next layers

Property and tenant records, booking calendar per property with Airbnb and VRBO calendar feeds, lease generator from the template.
