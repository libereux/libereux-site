import type { Metadata } from "next";
import Link from "next/link";
import { og } from "@/lib/seo";
import { PageHead } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "When you can cancel an order and get a refund from Libereux Holdings, LLC.",
  alternates: { canonical: "/refund-policy" },
  openGraph: og("/refund-policy"),
};

export default function RefundPolicyPage() {
  return (
    <>
      <PageHead
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/refund-policy", label: "Refund policy" },
        ]}
        title="Refund policy"
        lede="Last updated October 24, 2026."
      />
      <section className="section">
        <div className="wrap">
          <div className="prose legal">
            <p className="muted">
              This policy is part of our <Link href="/terms">terms of service</Link>. You pay a 50 percent deposit when you
              order. Here is what happens if you cancel or something goes wrong.
            </p>

            <h2>Before we send the written scope</h2>
            <p className="muted">You can cancel and receive a full refund of your deposit.</p>

            <h2>After you confirm the scope, before work starts</h2>
            <p className="muted">
              You can cancel and receive your deposit back, less 10 percent to cover time already spent.
            </p>

            <h2>After work has started</h2>
            <p className="muted">
              The deposit is not refundable, because the time is already spent. If we fail to deliver what the scope
              promises and cannot fix it within a reasonable time, we will refund the part of your payment that relates
              to what we did not deliver.
            </p>

            <h2>After handover</h2>
            <p className="muted">
              We fix defects in what we delivered for 30 days at no charge. We do not refund completed and delivered
              work.
            </p>

            <h2>How refunds are paid</h2>
            <p className="muted">
              Refunds go back to the original payment method and can take several days to appear.
            </p>

            <h2>Your legal rights</h2>
            <p className="muted">Nothing in this policy limits any rights you have under the consumer laws of your country.</p>

            <h2>How to ask for a refund</h2>
            <p className="muted">
              Email <a href={`mailto:${site.email}`}>{site.email}</a> with your name and the email you used to order, or
              call <a href={site.phoneHref}>{site.phone}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
