import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { og } from "@/lib/seo";
import { pricingLive } from "@/lib/pricing";
import { PageHead } from "@/components/Blocks";
import PackagesOrder from "@/components/PackagesOrder";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Packages and Prices",
  description:
    "Fixed-price websites, AI assistants and automations. Choose a package, pay a 50 percent deposit, and get a written scope before work starts. Or book a free consultation.",
  alternates: { canonical: "/packages" },
  openGraph: og("/packages"),
};

export default function PackagesPage() {
  // The page does not exist until pricing is switched on in lib/pricing.ts.
  if (!pricingLive) notFound();

  return (
    <>
      <PageHead
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/packages", label: "Packages" },
        ]}
        title="Pick what you need. See the price first."
        lede="Fixed prices, a written scope before any work starts, and a 50 percent deposit to begin. Not sure what you need? Ask for a written quote, or book a free consultation."
      />
      <section className="section">
        <div className="wrap">
          <PackagesOrder />
          <p className="muted" style={{ marginTop: "1.5rem" }}>
            Prices are in US dollars and set by your billing country. Questions? Email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> or call <a href={site.phoneHref}>{site.phone}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
