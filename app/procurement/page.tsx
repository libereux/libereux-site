import type { Metadata } from "next";
import { og } from "@/lib/seo";
import { PageHead } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Libereux Procurement: US and Bahamas Sourcing",
  description:
    "Libereux Procurement sources goods in the United States for buyers in the Bahamas, handling purchasing, estimates and invoicing.",
  alternates: { canonical: "/procurement" },
  openGraph: og("/procurement"),
};

export default function ProcurementPage() {
  return (
    <>
      <PageHead
        crumbs={[{ href: "/", label: "Home" }, { href: "/procurement", label: "Procurement" }]}
        title="Sourcing between the United States and the Bahamas."
        lede="Tell us what you need. We find it, price it, and send you a clear estimate before anything is purchased."
      />
      <section className="section">
        <div className="wrap split">
          <div className="prose">
            <h2>How it works</h2>
            <ol className="plain-list">
              <li>Send us your list: products, quantities and any brands you prefer.</li>
              <li>We return an itemized estimate for your approval.</li>
              <li>Once you approve, we purchase your items.</li>
              <li>You receive an invoice that matches the estimate you approved.</li>
            </ol>
          </div>
          <div className="prose">
            <h2>Request an estimate</h2>
            <p className="muted">
              Email your list to <a href={`mailto:${site.email}?subject=Procurement%20estimate`}>{site.email}</a>{" "}
              with &ldquo;Procurement estimate&rdquo; in the subject line.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
