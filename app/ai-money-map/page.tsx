import type { Metadata } from "next";
import { og } from "@/lib/seo";
import { PageHead } from "@/components/Blocks";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "AI Money Map: Free Weekly Newsletter",
  description:
    "Every Friday, a free interactive map of where the money in AI is going: deals, debt, guarantees and risk, with every number sourced. From Libereux Digital Solutions.",
  alternates: { canonical: "/ai-money-map" },
  openGraph: og("/ai-money-map"),
};

export default function AiMoneyMapPage() {
  return (
    <>
      <PageHead
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/ai-money-map", label: "AI Money Map" },
        ]}
        title="Follow the money behind AI. Free, every Friday."
        lede="The AI Money Map shows who pays whom, who invests in whom, who lends, and who guarantees the debt. We update it every week and send it straight to your inbox."
      />
      <section className="section">
        <div className="wrap split">
          <NewsletterForm mode="subscribe" source="ai-money-map" />
          <div className="prose">
            <h2>What you get</h2>
            <ul className="checks">
              <li>The week&apos;s biggest AI deals, earnings and risk shifts in plain words</li>
              <li>An interactive map you can tap to trace any company&apos;s money</li>
              <li>Every number tied to a source</li>
              <li>One email a week. No spam, and we never sell your email.</li>
            </ul>
            <p className="muted">
              General information only, not investment advice. You can unsubscribe from any email, or on
              our <a href="/unsubscribe">unsubscribe page</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
