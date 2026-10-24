# Phase 2: Tenant and Admin Portals

Goal: rebuild the tenant portal and admin portal in this codebase. No tenants were using the old portal and the old lead form held no records, so this is a fresh build with no data migration and no tenant invites. It does not block the website launch.

## What exists today (read from the live app's data model)

| Data | Key fields | Used by |
| --- | --- | --- |
| Property | address, active | Admin |
| Tenant | user_email, full_name, property_address, lease start/end, monthly_rent, lease_document_url | Tenant, Admin |
| PropertyManager | user_email, full_name, assigned_properties | Admin |
| WorkOrder | tenant, property, category, description, contact method, availability, photo_urls, status, admin_notes | Tenant submits, Admin manages |
| LeaseRequest | tenant, property, extension_length, reason, preferred_end_date, status, denial_reason | Tenant submits, Admin decides |
| RentPayment | tenant, property, amount, method (Apple Pay, Zelle), payment_date, month_paid_for, status | Tenant records, Admin confirms |
| PaymentSettings | zelle email, phone, name, rent_due_day | Admin |
| Lead | name, email, company, app type, budget, status | Old website form |

## Proposed stack

- **Database, sign-in and file storage:** Supabase (Postgres). Free tier covers this size. Row Level Security so a tenant can only ever read their own rows.
- **App:** the same Next.js project, under `/tenant` and `/admin`. The redirects for the old URLs are already in `next.config.ts`.
- **Email:** Resend, already used by the contact form, for work order and lease request notifications.

## Build order (one layer at a time)

1. Supabase project, tables mirroring the list above, Row Level Security policies, storage buckets for lease PDFs and work order photos.
2. Sign-in: email magic link (no passwords to forget, easier for tenants).
3. Tenant portal: lease details, submit a work order with photos, request a lease extension, record a rent payment, see Zelle instructions.
4. Admin portal: properties, tenants, managers, work order queue, lease requests, payment confirmation, payment settings, leads.
5. Test with the property manager, then switch the temporary redirects in `next.config.ts` to the new portal pages.

## Decisions needed from James

- Keep magic-link sign-in, or do tenants need passwords?
- Should the website contact form also save leads to the database (like the old Lead table), or is email enough?
- Who besides James gets admin access?
