import type { Metadata } from "next";
import { og } from "@/lib/seo";
import ContactForm from "@/components/ContactForm";
import { PageHead } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Book a Free Consultation",
  description:
    "Book a free, no-pressure consultation with Libereux Digital Solutions. Tell us about your business and get a plain-language plan and a firm price.",
  alternates: { canonical: "/contact" },
  openGraph: og("/contact"),
};

export default function ContactPage() {
  return (
    <>
      <PageHead
        crumbs={[{ href: "/", label: "Home" }, { href: "/contact", label: "Book a free call" }]}
        title="Book a free consultation."
        lede="Tell us a little about your business. We will reply to find a time that works for you."
      />
      <section className="section">
        <div className="wrap split">
          <ContactForm />
          <div className="prose">
            <h2 style={{ fontSize: "var(--step-2)" }}>What happens next</h2>
            <ol className="plain-list">
              <li>We reply to set up a short video or phone call.</li>
              <li>We talk about your business, your customers and what you need.</li>
              <li>You get a plain-language plan and a firm price, with no obligation.</li>
            </ol>
            <p className="muted">
              Prefer email? Write to <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
            <p className="muted">
              Calls are in English. If that is hard for you, we can work by email and translate
              proposals and recaps.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
