import type { Metadata } from "next";
import { og } from "@/lib/seo";
import { Closer, Faq, PageHead, Steps } from "@/components/Blocks";
import StepsToYes from "@/components/StepsToYes";
import { frictionPoints, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "How It Works: From First Step to Finished Build",
  description:
    "Choose a fixed-price package or book a free consultation, get a written scope before work starts, regular check-ins during the build, and support after launch.",
  alternates: { canonical: "/how-it-works" },
  openGraph: og("/how-it-works"),
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHead
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/how-it-works", label: "How it works" },
        ]}
        title="Clear steps, no surprises."
        lede="Whether you need advice, an assistant, a website or a smarter home, every engagement follows the same four steps."
      />

      <section className="section" aria-label="The four steps">
        <div className="wrap">
          <Steps />
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="count-title">
        <div className="wrap split">
          <div className="prose">
            <h2 id="count-title">What you can count on</h2>
            <ul className="checks">
              <li>You work directly with {site.founder}, from the first call to handover.</li>
              <li>A written scope with the price before any work starts.</li>
              <li>Plain language, with no jargon and no hard sell.</li>
              <li>Online from anywhere, or in person where James is working.</li>
              <li>Translated proposals and call recaps when English is hard for you or your team.</li>
            </ul>
          </div>
          <div className="prose">
            <h2>How we decide what to build</h2>
            {frictionPoints.map((f) => (
              <p key={f.title}>
                <strong>{f.title}.</strong> <span className="muted">{f.body}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="yes-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="yes-title" style={{ fontSize: "var(--step-2)" }}>
              What removing steps looks like
            </h2>
          </div>
          <StepsToYes />
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

      <Closer />
    </>
  );
}
