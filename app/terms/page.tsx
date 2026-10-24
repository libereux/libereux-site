import type { Metadata } from "next";
import Link from "next/link";
import { og } from "@/lib/seo";
import { PageHead } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you order a package or project from Libereux Holdings, LLC.",
  alternates: { canonical: "/terms" },
  openGraph: og("/terms"),
};

export default function TermsPage() {
  return (
    <>
      <PageHead
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/terms", label: "Terms of service" },
        ]}
        title="Terms of service"
        lede="Last updated October 24, 2026."
      />
      <section className="section">
        <div className="wrap">
          <div className="prose legal">
            <p className="muted">
              {site.legalName} (&quot;Libereux&quot;, &quot;we&quot;, &quot;us&quot;) is based in Georgia, USA. These terms cover
              the packages and projects we sell. For larger work, your written quote or scope says what applies. Our{" "}
              <Link href="/refund-policy">refund policy</Link> is part of these terms.
            </p>

            <h2>1. What you are buying</h2>
            <p className="muted">
              You are buying the package you chose, as described on the package page and in the written scope we send
              you. Nothing outside that scope is included. Extras are priced in the written scope before work starts.
            </p>

            <h2>2. Prices and payment</h2>
            <ul className="checks">
              <li>Prices are in US dollars and depend on your billing country.</li>
              <li>
                You pay a 50 percent deposit at checkout. The balance is due at handover. We release the final files,
                access or launch once the balance is paid.
              </li>
              <li>Payments are handled by Stripe. We do not see or store your card number.</li>
              <li>You are responsible for any taxes or duties that apply in your country.</li>
            </ul>

            <h2>3. The written scope</h2>
            <p className="muted">
              After your deposit we send a short written scope listing what is and is not included. Work starts when you
              confirm it by replying. Delivery times in the package start from the day you confirm. If you do not reply
              to the scope within 14 days, we may close the order and refund the deposit under our refund policy.
            </p>

            <h2>4. Revisions and changes</h2>
            <p className="muted">
              Each package includes the number of revision rounds it lists. A revision round is one set of changes you
              send together. Changes beyond that, or changes that go beyond the confirmed scope, are quoted before we do
              them.
            </p>

            <h2>5. What we need from you</h2>
            <p className="muted">
              You agree to give us the text, images, logins and decisions we ask for, and to reply within a reasonable
              time. If you are late, the delivery time moves by the same amount. You confirm that you own or have
              permission to use everything you give us.
            </p>

            <h2>6. Refunds and cancellations</h2>
            <p className="muted">
              These are set out in our <Link href="/refund-policy">refund policy</Link>.
            </p>

            <h2>7. Ownership</h2>
            <p className="muted">
              When the balance is paid in full, you own the finished work we made for you, such as your website text,
              design and files. We keep ownership of our own tools and methods, and third-party services keep their own
              terms. We will not use your name, business, site or results in our own marketing without your written
              permission.
            </p>

            <h2>8. Third-party services</h2>
            <p className="muted">
              Your project may rely on services run by other companies, such as hosting, a domain, email or payment
              providers. Their prices and terms apply. We will tell you about any recurring costs in the written scope.
            </p>

            <h2>9. Limits</h2>
            <p className="muted">
              We do our work carefully, but we cannot promise particular results such as search rankings, sales or
              traffic. To the extent the law allows, our total responsibility for any claim about an order is limited to
              the amount you paid for it. We are not responsible for losses we could not reasonably have foreseen.
              Nothing in these terms limits any rights you have under the law of your country.
            </p>

            <h2>10. Software tools and your information</h2>
            <p className="muted">
              We may use software tools, including AI tools, to help produce your work. We review everything before
              delivery. We use your information only to deliver your order and reply to you, as described in our{" "}
              <Link href="/privacy">privacy policy</Link>.
            </p>

            <h2>11. Disagreements</h2>
            <p className="muted">
              Please contact us first at <a href={`mailto:${site.email}`}>{site.email}</a>. We will try to fix it. These
              terms are governed by the laws of the State of Georgia, USA, and disputes are handled in the courts of
              Georgia.
            </p>

            <h2>12. Changes to these terms</h2>
            <p className="muted">The terms in force when you place your order apply to that order.</p>

            <h2>Contact</h2>
            <p className="muted">
              <a href={`mailto:${site.email}`}>{site.email}</a>, <a href={site.phoneHref}>{site.phone}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
