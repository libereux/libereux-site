import type { Metadata } from "next";
import { og } from "@/lib/seo";
import { PageHead } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Libereux Real Estate: Rentals in Georgia",
  description:
    "Libereux Real Estate offers furnished stays and long-term rentals in Georgia, managed locally. Part of Libereux Holdings, LLC.",
  alternates: { canonical: "/real-estate" },
  openGraph: og("/real-estate"),
};

export default function RealEstatePage() {
  return (
    <>
      <PageHead
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/real-estate", label: "Real Estate" },
        ]}
        title="Furnished stays and long-term rentals in Georgia."
        lede="Libereux Real Estate is part of Libereux Holdings, LLC. Our homes are managed locally."
      />
      <section className="section">
        <div className="wrap split">
          <div className="prose">
            <h2>Current tenants and guests</h2>
            <p className="muted">
              For maintenance, lease questions or anything about your stay, email{" "}
              <a href={`mailto:${site.email}?subject=Tenant%20request`}>{site.email}</a> with your
              address in the subject line.
            </p>
          </div>
          <div className="prose">
            <h2>Looking for a place?</h2>
            <p className="muted">
              Ask about availability at{" "}
              <a href={`mailto:${site.email}?subject=Rental%20availability`}>{site.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
