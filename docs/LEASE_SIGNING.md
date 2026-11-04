# Lease signing (internal)

Private tool for James and Sharo at `/admin/leases`. Not linked from the site, not indexed.

## How it works

1. Sign in at libereux.com/admin/leases with an allowed email. You get a one-time link (15 minutes), then stay signed in for 30 days.
2. Fill in the title, property, the final lease PDF and the signing order (default: tenants, then Sharo, then James). Press "Next: place the boxes". The lease is saved as a draft.
3. Place the boxes: pick whose box it is (each signer has a colour), pick the box type (signature, initials, date signed, full name, text, number, checkbox), then click the page. Drag to move, drag the corner to resize, Delete to remove. It saves as you go. Every signer needs at least one signature box. Press "Send for signature".
4. Each signer gets an email with a personal link only when it is their turn. They set up a signature once (drawn or typed), then tap each orange box. "Sign next box" walks them through on a phone. Date and name boxes fill themselves. Earlier signers' entries show in grey.
5. When the last person signs, the site builds the completed PDF: the original pages with every box filled in where it was placed (stamped with the envelope ID, form fields locked), a signature page, and a certificate with the document fingerprint and the full audit trail. Everyone gets it by email as an attachment.
6. Every lease, its status, original and signed copy stay on the dashboard.

## Settings

- `ADMIN_EMAILS` (optional): comma-separated emails allowed to sign in. Default `holdings@libereux.com,jetblack56@gmail.com,sharocollins@gmail.com`.
- `RESEND_API_KEY`: already set for the contact form; the same key sends signing emails.
- `ESIGN_FROM` (optional): sender, default the contact form sender.

## Storage and cost

Netlify Blobs (store `esign`), free on the current plan. Files are private and only reachable through the signed-in dashboard or a signer's personal link. Running cost: $0.

## Google Drive

Completed leases save automatically to a Drive folder named "Libereux Signed Leases" once Drive is connected. One-time setup in the existing Google Cloud project ("Libereux Website", holdings@libereux.com):

1. APIs and Services, Library: enable **Google Drive API**.
2. APIs and Services, Credentials, the existing OAuth client: add the authorized redirect URI `https://libereux.com/api/esign/drive`.
3. On the dashboard, press **Connect Google Drive** and allow access as holdings@libereux.com.

The permission is `drive.file`: the site can only see files it created. A lease signed before Drive was connected has a "Save to Google Drive" button.

## Local testing

`ESIGN_LOCAL_STORE=1 npm run dev`. Without `RESEND_API_KEY`, emails are printed to the terminal instead of sent.

## Next layers

Property and tenant records, booking calendar per property with Airbnb and VRBO calendar feeds, lease generator from the template.

## Property calendar

The dashboard opens on the Calendar tab: one row per property, with every stay as a bar.

- **Leases** appear from their move-in and last-night dates (entered when sending, or with "Add dates" on any lease). Striped orange while waiting for signatures, solid navy once signed.
- **Leases signed elsewhere**: Leases tab, "Add a lease that was already signed". Upload the signed PDF with the tenants, dates and rent. It joins the records, the calendar and Google Drive.
- **Airbnb, VRBO and similar**: paste each listing's calendar export link under "Airbnb and VRBO calendar links". The platforms refresh these links every few hours. They show dates and the confirmation code, not guest names. Dates you blocked on the platform are hidden unless you tick "Show dates blocked on the platforms".
- **Stays entered by hand**: "Add a stay by hand" for a guest who booked directly without a lease.
- **Double bookings**: two real stays on the same property on the same night show a red warning at the top.
- **Google Calendar or phone**: "See this calendar in Google Calendar" gives a private link to add under Other calendars, From URL. Anyone with the link can see the stays; "Replace link" retires it.
