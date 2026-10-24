import type { Metadata } from "next";
import { og } from "@/lib/seo";
import Link from "next/link";
import { Closer, PageHead } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Libereux Holdings",
  description:
    "Libereux Holdings, LLC is a holding company founded by James Collins, with divisions in digital solutions, international procurement and property management.",
  alternates: { canonical: "/about" },
  openGraph: og("/about"),
};

export default function AboutPage() {
  return (
    <>
      <PageHead
        crumbs={[{ href: "/", label: "Home" }, { href: "/about", label: "About" }]}
        title="Real help for the owners who keep neighborhoods running."
      />
      <section className="section">
        <div className="wrap split">
          <div className="prose">
            <h2>Why we exist</h2>
            <p className="muted">
              The corner restaurant, the salon down the street and the contractor who fixed your
              neighbor&apos;s roof are often the businesses with the least help online. Agencies price
              them out, and do-it-yourself tools assume time and know-how they do not have.
            </p>
            <p className="muted">
              Libereux Digital Solutions was started to close that gap: professional websites and
              tools at prices a small business can say yes to, explained in plain language, with
              the price on the page.
            </p>
          </div>
          <div className="prose">
            <h2>Who you work with</h2>
            <p className="muted">
              {site.founder} founded {site.legalName} and leads every Digital Solutions project
              personally. His background is in enterprise project management and Agile delivery,
              keeping large technology programs on schedule. He brings that same discipline to
              every small business build: gather the full picture, scope it honestly, and deliver
              what was promised.
            </p>
            <p className="muted">
              Write to him any time at <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="divisions-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="divisions-title">Libereux Holdings</h2>
            <p className="lede">One company, three divisions.</p>
          </div>
          <div className="divisions">
            <Link className="division division-lead" href="/digital-solutions">
              <h3>Digital Solutions</h3>
              <p className="muted">Websites, web apps, mobile apps and project tools for small businesses.</p>
            </Link>
            <Link className="division" href="/procurement">
              <h3>Procurement</h3>
              <p className="muted">International sourcing between the United States and the Bahamas.</p>
            </Link>
            <Link className="division" href="/property-management">
              <h3>Property management</h3>
              <p className="muted">Residential rentals in Georgia, managed locally.</p>
            </Link>
          </div>
        </div>
      </section>

      <Closer />
    </>
  );
}
