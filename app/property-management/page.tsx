import type { Metadata } from "next";
import { og } from "@/lib/seo";
import Link from "next/link";
import { PageHead } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Property Management in Georgia",
  description:
    "Libereux Property Management operates residential rentals in Clayton and Gwinnett counties, Georgia, with an online portal for tenants.",
  alternates: { canonical: "/property-management" },
  openGraph: og("/property-management"),
};

export default function PropertyPage() {
  return (
    <>
      <PageHead
        crumbs={[{ href: "/", label: "Home" }, { href: "/property-management", label: "Property management" }]}
        title="Well-kept rental homes in Georgia."
        lede="Residential rentals in Clayton and Gwinnett counties, managed locally, with an online portal for tenants."
      />
      <section className="section">
        <div className="wrap split">
          <div className="prose">
            <h2>Current tenants</h2>
            <p className="muted">
              Sign in to the tenant portal to stay in touch with your
              property manager.
            </p>
            <div className="btn-row">
              <Link href="/tenant/login" className="btn btn-primary">
                Tenant sign in
              </Link>
              <Link href="/tenant/register" className="btn btn-ghost">
                Create tenant account
              </Link>
            </div>
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
