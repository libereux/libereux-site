import type { Metadata } from "next";
import { og } from "@/lib/seo";
import Link from "next/link";
import HeroDemo from "@/components/HeroDemo";
import Pricing from "@/components/Pricing";
import JsonLd from "@/components/JsonLd";
import { Closer, Faq, Steps, WorkCards } from "@/components/Blocks";
import { audiences, faqs, serviceAreas, site } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Affordable Websites for Small Businesses from $99 | Libereux" },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: og("/"),
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Home() {
  return (
    <>
      <JsonLd data={faqLd} />

      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title">A website that brings customers to your door.</h1>
            <p className="price-callout">
              <strong>From $99.</strong>
              <span>Ready in as little as one business day.</span>
            </p>
            <p className="lede">
              Websites, apps and business tools for restaurants, salons, realtors and contractors.
              Plain talk, prices you can see, and a real person who picks up.
            </p>
            <div className="btn-row">
              <Link href="/contact" className="btn btn-primary">
                Book a free consultation
              </Link>
              <Link href="/pricing" className="btn btn-ghost">
                See prices
              </Link>
            </div>
            <p className="trust-line">
              The consultation is free. You see your site before it goes live.
            </p>
          </div>
          <HeroDemo />
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="who-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="who-title">Built for the businesses big agencies skip.</h2>
            <p className="lede">
              Most of our clients have never had a website, or have one they are embarrassed by.
              Customers search on their phones first. We make sure they find you.
            </p>
          </div>
          <div className="audience">
            {audiences.map((a) => (
              <div className="audience-item" key={a.id}>
                <h3>{a.name}</h3>
                <p className="muted">{a.line}</p>
              </div>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 28 }}>
            Serving owners in {serviceAreas.slice(0, -1).join(", ")} and {serviceAreas.at(-1)}, the
            rest of metro Atlanta, and clients worldwide over video call.
          </p>
        </div>
      </section>

      <section className="section" id="pricing" aria-labelledby="pricing-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="pricing-title">Three prices. Pick your speed.</h2>
            <p className="lede">
              Same price wherever you are. The scope is written down before you pay, so you always
              know what you are getting.
            </p>
          </div>
          <Pricing />
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="how-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="how-title">How it works</h2>
            <p className="lede">Four steps. You are never left guessing what happens next.</p>
          </div>
          <Steps />
        </div>
      </section>

      <section className="section on-ink" aria-labelledby="work-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="work-title">Real tools, running real businesses.</h2>
            <p className="lede">
              Beyond websites, we build the apps owners use every day to run crews, brands and
              schedules.
            </p>
          </div>
          <WorkCards />
        </div>
      </section>

      <section className="section" aria-labelledby="honest-title">
        <div className="wrap split">
          <div className="prose">
            <h2 id="honest-title">If now is not the right time, here is what to do for free.</h2>
            <p className="muted">
              We would rather you spend wisely than stretch. If a website is not in the budget yet,
              these steps cost nothing and help customers find you today.
            </p>
            <ol className="plain-list">
              <li>Claim your free Google Business Profile, with your hours, phone number and photos.</li>
              <li>Ask your five happiest customers to leave a Google review.</li>
              <li>Make sure your name, address and phone match everywhere you are listed.</li>
              <li>Post a few photos of your work or your food every month.</li>
            </ol>
            <p>
              When you are ready, <Link href="/contact">we are a call away</Link>.
            </p>
          </div>
          <div className="prose">
            <h2>Why owners choose us</h2>
            <ul className="checks">
              <li>Prices on the page, not hidden behind a sales call.</li>
              <li>You talk to {site.founder}, the person responsible for your project.</li>
              <li>Built on enterprise-grade secure infrastructure backed by SOC 2, ISO 27001 and GDPR-aligned practices.</li>
              <li>Help in plain language, with translated proposals and recaps when English is hard.</li>
              <li>Custom work is paid in milestones, never one big payment up front.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="faq-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="faq-title">Questions owners ask us</h2>
          </div>
          <Faq />
        </div>
      </section>

      <section className="section-tight" aria-labelledby="divisions-title">
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: 28 }}>
            <h2 id="divisions-title" style={{ fontSize: "var(--step-2)" }}>
              Part of Libereux Holdings
            </h2>
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
