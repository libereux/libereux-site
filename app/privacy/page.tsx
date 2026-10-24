import type { Metadata } from "next";
import { og } from "@/lib/seo";
import { PageHead } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Libereux Holdings, LLC collects, uses and protects your information, wherever you are in the world.",
  alternates: { canonical: "/privacy" },
  openGraph: og("/privacy"),
};

// Order and payment details added 2026-10-24. Direction (2026-10-21): have this reviewed by a legal professional.
export default function PrivacyPage() {
  return (
    <>
      <PageHead
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/privacy", label: "Privacy policy" },
        ]}
        title="Privacy policy"
        lede="Last updated October 24, 2026."
      />
      <section className="section">
        <div className="wrap">
          <div className="prose legal">
            <h2>Who we are</h2>
            <p className="muted">
              This website is run by {site.legalName}, registered in {site.location}. We work with
              clients worldwide. You can reach us at <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>

            <h2>What we collect</h2>
            <p className="muted">
              When you use the consultation form, we collect what you type: your name, email, and
              optionally your phone or WhatsApp number, where you are based, and a description of your
              business. If you use our smart home service, we also receive the photos of your space
              that you choose to send.
            </p>
            <p className="muted">
              Our hosting provider records basic technical information, such as your browser type and
              the pages you visit, to keep the site secure and working.
            </p>

            <h2>Orders and payments</h2>
            <p className="muted">
              When you order a package, we collect your name, email, business name, billing country, the packages you
              chose and any notes you add. Payments are processed by Stripe. Stripe collects your card details and
              billing address directly; we never see or store your card number. We receive your name, email, billing
              country and the amount paid. We keep order records for as long as we need them to deliver your order, keep
              our accounts, and meet legal duties. Stripe&apos;s own privacy policy applies to the information it collects.
            </p>

            <h2>The free website check</h2>
            <p className="muted">
              When you run the website check, our server visits the public address you enter, reads that one page
              and shows you the results. We do not store the address or the results.
            </p>

            <h2>How we use it</h2>
            <p className="muted">
              We use your information only to reply to you, arrange and hold your consultation, and
              provide the services you ask for. We do not sell your information.
            </p>

            <h2>Smart home photos and accounts</h2>
            <p className="muted">
              Photos you send are used only to prepare your recommendations, visuals and walkthrough.
              Remote setup happens in accounts you own, on a screen share with you present, and we
              never ask for or keep your passwords.
            </p>

            <h2>Who we share it with</h2>
            <p className="muted">
              We share information only with service providers that help us run the business, such as
              our website host and email provider, and only as needed for them to do that work, or
              when the law requires it. Some of these providers may store data outside your country.
            </p>

            <h2>Your choices</h2>
            <p className="muted">
              Wherever you live, you can ask us to see, correct or delete the information we hold
              about you by writing to <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
