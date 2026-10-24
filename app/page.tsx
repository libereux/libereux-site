import type { Metadata } from "next";
import Link from "next/link";
import { og } from "@/lib/seo";
import HeroDemo from "@/components/HeroDemo";
import OpportunityFinder from "@/components/OpportunityFinder";
import SmartHomeScene from "@/components/SmartHomeScene";
import StepsToYes from "@/components/StepsToYes";
import JsonLd from "@/components/JsonLd";
import { Closer, Faq, Family, ServiceList, Steps } from "@/components/Blocks";
import { faqs, frictionPoints, services, site } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "AI Consultant and Digital Solutions | Libereux" },
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

const smartHome = services.find((s) => s.slug === "smart-home")!;

export default function Home() {
  return (
    <>
      <JsonLd data={faqLd} />

      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title">Make AI work for your business.</h1>
            <p className="lede">
              Your single source for &ldquo;How do I use AI?&rdquo; and &ldquo;Can you build this for
              me?&rdquo; Strategy, assistants and automations, websites and apps, and smart home design,
              from one person who explains it plainly and then builds it.
            </p>
            <div className="btn-row">
              <Link href="/contact" className="btn btn-primary">
                Book a free consultation
              </Link>
              <Link href="/services" className="btn btn-ghost">
                See what we do
              </Link>
            </div>
            <p className="trust-line">
              Free and 30 minutes, with {site.founder}. Online from anywhere, or in person where he is
              working. {site.reach}
            </p>
          </div>
          <HeroDemo />
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="questions-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="questions-title">Two questions, one partner.</h2>
            <p className="lede">
              Advice and delivery usually come from different people, so plans and results drift
              apart. Here they come from the same place.
            </p>
          </div>
          <div className="two-q">
            <div className="q-card">
              <h3>&ldquo;How do I use AI?&rdquo;</h3>
              <p className="muted">
                We look at how your business actually runs, show you where AI saves time or opens new
                revenue, and give you a clear, plain-language plan with quick wins first.
              </p>
              <p>
                <Link href="/services/ai-strategy">AI consultation and strategy</Link>
              </p>
            </div>
            <div className="q-card q-card-dark">
              <h3>&ldquo;Can you build this for me?&rdquo;</h3>
              <p className="muted">
                Assistants, automations, websites, apps and internal tools. You describe the problem,
                and we design, build and launch the answer with you.
              </p>
              <p>
                <Link href="/services/ai-implementation">AI implementation</Link>
                {" or "}
                <Link href="/services/websites-and-apps">Websites and apps</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="finder-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="finder-title">Where could AI help your business?</h2>
            <p className="lede">
              Pick your type of business and what eats most of your time. You will see three places
              to start, ranked the way we rank them in a real consultation.
            </p>
          </div>
          <OpportunityFinder />
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="services-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="services-title">What we do</h2>
          </div>
          <ServiceList />
        </div>
      </section>

      <section className="section" aria-labelledby="approach-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="approach-title">We remove steps. That is the whole idea.</h2>
            <p className="lede">
              The easier something is, the more often it happens. Fewer steps means more bookings,
              more replies and more finished work, so that is how we measure everything we build.
            </p>
          </div>
          <div className="friction">
            {frictionPoints.map((f, i) => (
              <div className="friction-item" key={f.title}>
                <div className="friction-bar" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <span key={j} className={j < [6, 3, 1][i] ? "on" : undefined} />
                  ))}
                </div>
                <h3>{f.title}</h3>
                <p className="muted">{f.body}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 56 }}>
            <StepsToYes />
          </div>
        </div>
      </section>

      <section className="section on-ink" aria-labelledby="smart-title">
        <div className="wrap split">
          <div className="prose">
            <h2 id="smart-title">{smartHome.headline}</h2>
            <p className="lede">
              Send a few photos of a room. You receive product recommendations, before and after
              visuals of your own space, and a narrated walkthrough. Then James sets it up with you
              remotely. No installation visit.
            </p>
            <ul className="checks">
              <li>You buy and place the devices, or hire a local installer.</li>
              <li>Setup happens in accounts you own, on a screen share with you present.</li>
              <li>We never hold your passwords. If we earn a commission on a product, we say so.</li>
            </ul>
            <div className="btn-row">
              <Link href="/services/smart-home" className="btn btn-primary">
                See how it works
              </Link>
            </div>
          </div>
          <SmartHomeScene />
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="how-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="how-title">How it works</h2>
            <p className="lede">You always know what happens next, and what it costs, before work starts.</p>
          </div>
          <Steps />
        </div>
      </section>

      <section className="section" aria-labelledby="founder-title">
        <div className="wrap founder">
          <div className="monogram" aria-hidden="true">
            JC
          </div>
          <div className="prose">
            <h2 id="founder-title">One person who listens, then builds.</h2>
            <p className="lede" style={{ maxWidth: "52ch" }}>
              I am {site.founder}, founder of Libereux. I help people and businesses understand what
              AI can really do for them, and then I build it. You work with me directly, from first
              call to handover.
            </p>
            <p>
              <Link href="/about">More about James and Libereux</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="faq-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="faq-title">Questions people ask</h2>
          </div>
          <Faq />
        </div>
      </section>

      <Family />
      <Closer />
    </>
  );
}
