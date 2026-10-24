import type { Metadata } from "next";
import { og } from "@/lib/seo";
import Link from "next/link";
import Pricing from "@/components/Pricing";
import { Closer, Faq, PageHead } from "@/components/Blocks";

export const metadata: Metadata = {
  title: "Website Pricing: $99, $200 or $250",
  description:
    "Flat website prices for small businesses: Starter $99 in 5 to 7 business days, Growth $200 in 3 to 5, Priority $250 next business day. Custom apps quoted after a free call.",
  alternates: { canonical: "/pricing" },
  openGraph: og("/pricing"),
};

export default function PricingPage() {
  return (
    <>
      <PageHead
        crumbs={[{ href: "/", label: "Home" }, { href: "/pricing", label: "Pricing" }]}
        title="Clear prices. No surprises."
        lede="The same three prices for every client, wherever you are. The difference is how fast you need it."
      />

      <section className="section" aria-labelledby="plans-title">
        <div className="wrap">
          <h2 id="plans-title" className="sr-only">
            Plans
          </h2>
          <Pricing />
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="fine-title">
        <div className="wrap split">
          <div className="prose">
            <h2 id="fine-title">The fine print, in plain words</h2>
            <ul className="plain-list">
              <li>The page count and revisions for your plan are written down before you pay.</li>
              <li>
                One round of revisions means one list of changes, sent together, that we make
                together.
              </li>
              <li>Your domain name is registered in your name, so it always belongs to you.</li>
              <li>
                Custom work is split into milestones: kickoff, first look, refinement and launch.
                The first payment reserves your launch date.
              </li>
              <li>Without the care plan, updates are available any time at a flat rate per request.</li>
            </ul>
          </div>
          <div className="prose">
            <h2>Not sure which plan?</h2>
            <p className="muted">
              Start with a free call. We will tell you honestly which plan fits, and if a smaller
              scope or a free tool would serve you better, we will say so.
            </p>
            <p>
              <Link href="/contact" className="btn btn-primary">
                Book a free call
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="faq-title">Common questions</h2>
          </div>
          <Faq />
        </div>
      </section>

      <Closer />
    </>
  );
}
