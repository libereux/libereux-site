import type { Metadata } from "next";
import { og } from "@/lib/seo";
import { Closer, Family, PageHead, ServiceList, Steps } from "@/components/Blocks";

export const metadata: Metadata = {
  title: "AI Consulting, Automation, Web and Smart Home",
  description:
    "AI strategy, assistants and automations, websites and apps, remote smart home design, and SEO. One partner from first question to finished build.",
  alternates: { canonical: "/services" },
  openGraph: og("/services"),
};

export default function ServicesPage() {
  return (
    <>
      <PageHead
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/services", label: "Services" },
        ]}
        title="Everything from your first AI question to the finished build."
        lede="Five services, one partner. Each page has a live example you can try."
      />
      <section className="section" aria-label="Services">
        <div className="wrap">
          <ServiceList />
        </div>
      </section>
      <section className="section section-paper" aria-labelledby="how-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="how-title">Every engagement works the same way</h2>
          </div>
          <Steps />
        </div>
      </section>
      <Family />
      <Closer />
    </>
  );
}
