import type { Metadata } from "next";
import { og } from "@/lib/seo";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { Closer, PageHead, Steps, WorkCards } from "@/components/Blocks";
import { custom, site, tiers } from "@/lib/content";

export const metadata: Metadata = {
  title: "Small Business Web Design, Apps and Business Tools",
  description:
    "Websites, web apps, mobile apps and project management tools for small business owners. Flat prices from $99, delivered in 1 to 7 business days.",
  alternates: { canonical: "/digital-solutions" },
  openGraph: og("/digital-solutions"),
};

const services = [
  {
    name: "Websites",
    body: "A clear, fast website that works on every phone. Your hours, your prices, your photos and a button that calls you. This is where most owners start.",
  },
  {
    name: "Web apps",
    body: "Booking, ordering, customer logins and staff portals. Tools that save you phone calls and paperwork, built to grow with your business.",
  },
  {
    name: "Mobile apps",
    body: "An app your customers or your crew can open from their home screen, for check-ins, schedules, loyalty or job updates.",
  },
  {
    name: "Project management tools",
    body: "Checklists, task assignments and dashboards that keep crews, vendors and staff on the same page, even across several job sites.",
  },
];

const serviceLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Small business web design and development",
  provider: { "@id": `${site.url}/#digital-solutions` },
  areaServed: "Worldwide",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Website packages",
    itemListElement: tiers.map((t) => ({
      "@type": "Offer",
      name: `${t.name} website`,
      price: t.price,
      priceCurrency: "USD",
      description: `${t.summary} ${t.turnaround}.`,
      url: `${site.url}/pricing`,
    })),
  },
};

export default function DigitalSolutions() {
  return (
    <>
      <JsonLd data={serviceLd} />
      <PageHead
        crumbs={[{ href: "/", label: "Home" }, { href: "/digital-solutions", label: "Digital Solutions" }]}
        title="Websites and tools for small business owners."
        lede="From a first website to the app your whole team runs on. Plain language, visible prices, and built to last."
      />

      <section className="section" aria-labelledby="services-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="services-title">What we build</h2>
          </div>
          <div className="feature-list">
            {services.map((s) => (
              <div key={s.name}>
                <h3>{s.name}</h3>
                <p className="muted">{s.body}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 28 }}>
            Websites start at $99. {custom.summary} <Link href="/pricing">See every price</Link>.
          </p>
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="who-title">
        <div className="wrap split">
          <div className="prose">
            <h2 id="who-title">Who we work with</h2>
            <p className="muted">
              Owners who run the business themselves and do not have a marketing team. Restaurants,
              salons and barbers, realtors and contractors are our core, and we welcome any small
              business that needs to be found online.
            </p>
            <p className="muted">
              Many of our clients are new to technology, are watching every dollar, or have staff
              and vendors who speak more than one language. We explain everything in plain words and
              can translate proposals and call recaps when English is hard.
            </p>
          </div>
          <div className="prose">
            <h2>How we build</h2>
            <p className="muted">
              We gather the full picture first, then build one layer at a time and check each one
              before moving on. It is slower to start and much faster to finish, because nothing has
              to be torn down and redone.
            </p>
            <p className="muted">
              Everything runs on enterprise-grade secure infrastructure backed by SOC 2, ISO 27001
              and GDPR-aligned practices.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="steps-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="steps-title">From first call to launch</h2>
          </div>
          <Steps />
        </div>
      </section>

      <section className="section on-ink" aria-labelledby="work-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="work-title">Recent work</h2>
          </div>
          <WorkCards />
        </div>
      </section>

      <Closer />
    </>
  );
}
