import type { Metadata } from "next";
import { og } from "@/lib/seo";
import { PageHead } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Libereux Holdings, LLC collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
  openGraph: og("/privacy"),
};

export default function PrivacyPage() {
  return (
    <>
      <PageHead
        crumbs={[{ href: "/", label: "Home" }, { href: "/privacy", label: "Privacy policy" }]}
        title="Privacy policy"
        lede="Last updated October 24, 2026."
      />
      <section className="section">
        <div className="wrap">
          <div className="prose legal">
          <h2>What we collect</h2>
          <p className="muted">
            When you fill out a form on this site, we collect what you type: usually your name,
            email, phone number, business name and message. If you are a tenant, the tenant portal
            stores the account and lease information needed to manage your rental.
          </p>
          <p className="muted">
            Like most websites, our hosting provider records basic technical information such as
            your browser type and the pages you visit, to keep the site secure and working.
          </p>

          <h2>How we use it</h2>
          <p className="muted">
            We use your information only to respond to you, provide the services you ask for, manage
            rentals, and send invoices. We do not sell your information.
          </p>

          <h2>Who we share it with</h2>
          <p className="muted">
            We share information only with service providers that help us run the business, such as
            our website host and email provider, and only as needed for them to do that work, or
            when the law requires it.
          </p>

          <h2>Your choices</h2>
          <p className="muted">
            You can ask us to see, correct or delete the information we hold about you by writing to{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>

          <h2>Contact</h2>
          <p className="muted">
            {site.legalName}. Questions about this policy go to{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
        </div>
      </section>
    </>
  );
}
