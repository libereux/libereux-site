import type { Metadata } from "next";
import { og } from "@/lib/seo";
import { PageHead } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Property Management in Georgia",
  description:
    "Libereux Property Management operates residential rentals in Clayton and Gwinnett counties, Georgia, managed locally.",
  alternates: { canonical: "/property-management" },
  openGraph: og("/property-management"),
};

export default function PropertyPage() {
  return (
    <>
      <PageHead
        crumbs={[{ href: "/", label: "Home" }, { href: "/property-management", label: "Property management" }]}
        title="Well-kept rental homes in Georgia."
        lede="Residential rentals in Clayton and Gwinnett counties, managed locally."
      />
      <section className="section">
        <div className="wrap split">
          <div className="prose">
            <h2>Current tenants</h2>
            <p className="muted">
              For maintenance requests, lease questions or rent, email{" "}
              <a href={`mailto:${site.email}?subject=Tenant%20request`}>{site.email}</a> with your
              address in the subject line. An online tenant portal is on the way.
            </p>
          </div>
          <div className="prose">
            <h2>Looking for a home?</h2>
            <p className="muted">
              Ask about upcoming availability at{" "}
              <a href={`mailto:${site.email}?subject=Rental%20availability`}>{site.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
