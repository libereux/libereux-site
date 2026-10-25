import type { Metadata } from "next";
import { og } from "@/lib/seo";
import { Closer, Family, PageHead } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "About James Collins and Libereux",
  description:
    "Libereux is led by James Collins, who helps businesses understand what AI can really do for them, then builds it. Fully remote, working with clients worldwide.",
  alternates: { canonical: "/about" },
  openGraph: og("/about"),
};

export default function AboutPage() {
  return (
    <>
      <PageHead
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
        ]}
        title="One trusted person for AI advice and the build that follows."
      />
      <section className="section">
        <div className="wrap founder">
          <div className="monogram" aria-hidden="true">
            JC
          </div>
          <div className="prose">
            <h2>Meet James</h2>
            <p className="lede" style={{ maxWidth: "56ch" }}>
              I am {site.founder}, founder of Libereux. I help people and businesses understand what
              AI can really do for them, and then I build it. You work with me directly, from the first
              call to handover.
            </p>
            <p className="muted">
              My background is in enterprise project management and Agile delivery, keeping complex
              technology programs on track inside large organizations. I bring the same discipline to every
              engagement, whatever its size: understand the business first, scope it honestly, and deliver what was agreed.
            </p>
            <p className="muted">
              I work fully remotely with clients anywhere in the world, and every meeting is an online
              video call.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="why-title">
        <div className="wrap split">
          <div className="prose">
            <h2 id="why-title">Why Libereux exists</h2>
            <p className="muted">
              Most business owners hear about AI every day and are not sure where it fits. When they
              do find help, advice comes from one person and the build from another, and the plan and
              the result drift apart.
            </p>
            <p className="muted">
              Libereux Digital Solutions puts both in one place: honest guidance on what is worth
              doing, and the build that delivers it.
            </p>
          </div>
          <div className="prose">
            <h2>How we work</h2>
            <ul className="checks">
              <li>Outcome focused: every recommendation ties back to time saved, customers served or growth.</li>
              <li>Plain-language guidance, with no jargon and no hard sell.</li>
              <li>Fewer steps for your customers and your team, measured on everything we build.</li>
            </ul>
          </div>
        </div>
      </section>

      <Family />
      <Closer />
    </>
  );
}
