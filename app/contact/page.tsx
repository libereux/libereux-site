import type { Metadata } from "next";
import { og } from "@/lib/seo";
import ContactForm from "@/components/ContactForm";
import { PageHead } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Book a Free 30-Minute Consultation",
  description:
    "Book a free 30-minute consultation with James Collins about AI, automation, websites, apps or smart home. Held as an online video call, worldwide.",
  alternates: { canonical: "/contact" },
  openGraph: og("/contact"),
};

export default function ContactPage() {
  return (
    <>
      <PageHead
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/contact", label: "Contact" },
        ]}
        title="Book a free consultation."
        lede="Thirty minutes with James Collins, on an online video call from wherever you are. Tell us a little about your business and we will find a time."
      />
      <section className="section">
        <div className="wrap split">
          <ContactForm />
          <div className="prose">
            <h2>What happens next</h2>
            <ol className="plain-list">
              <li>Pick a time that suits your time zone and you get a calendar invite with a video link straight away. If none fits, send your details and we reply to find one.</li>
              <li>We talk about your business, your goals and what is slowing you down.</li>
              <li>You leave with clear next steps. If you want our help, you get a written scope with the price before any work starts.</li>
            </ol>
            <h2>Prefer to reach out directly?</h2>
            <ul className="contact-lines">
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <a href={site.phoneHref}>{site.phone}</a>
              </li>
              <li className="muted">{site.reach}</li>
            </ul>
            <p className="muted">
              Proposals and call recaps can be translated in both directions. Calls are in English,
              and if that is hard for you, we can work by email.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
