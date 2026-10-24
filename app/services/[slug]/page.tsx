import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { og } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import HeroDemo from "@/components/HeroDemo";
import OpportunityFinder from "@/components/OpportunityFinder";
import SmartHomeScene from "@/components/SmartHomeScene";
import StepsToYes from "@/components/StepsToYes";
import SearchPreview from "@/components/SearchPreview";
import { Closer, PageHead, Steps } from "@/components/Blocks";
import { AskButton } from "@/components/assistant/Assistant";
import { services, site } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) return {};
  return {
    title: s.title,
    description: s.metaDescription,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: og(`/services/${s.slug}`),
  };
}

const live: Record<string, { prompt: string; label: string }> = {
  "ai-strategy": { prompt: "Where could AI save me time? I run a ", label: "Get a personal roadmap from our live AI" },
  "ai-implementation": { prompt: "What could an AI assistant do for my business? I run a ", label: "Talk to a live assistant now" },
  "websites-and-apps": { prompt: "Can you review my website? It's ", label: "Have our live AI review your site" },
  "smart-home": { prompt: "Help me plan a smart home for my ", label: "Plan your own space with our live AI" },
  "website-updates-seo": { prompt: "Can you review my website? It's ", label: "Run a live review of your real site" },
};

const demos: Record<string, { title: string; lede: string; dark?: boolean; node: React.ReactNode }> = {
  "ai-strategy": {
    title: "Try it: where could AI help you?",
    lede: "A taste of the first step of a consultation. Pick your business and your biggest time drain.",
    node: <OpportunityFinder />,
  },
  "ai-implementation": {
    title: "See an assistant at work",
    lede: "Sample conversations from four kinds of business, including a guest who writes in Spanish at 2 am.",
    node: (
      <div style={{ maxWidth: 520 }}>
        <HeroDemo />
      </div>
    ),
  },
  "websites-and-apps": {
    title: "Count the steps to yes",
    lede: "Every site and app we build is judged by how few steps it takes a customer to book, buy or get an answer.",
    node: <StepsToYes />,
  },
  "smart-home": {
    title: "Try a scene",
    lede: "A sample living room. Tap a scene to see what one tap can do once everything is set up.",
    dark: true,
    node: (
      <div style={{ maxWidth: 760 }}>
        <SmartHomeScene />
      </div>
    ),
  },
  "website-updates-seo": {
    title: "Preview your search listing",
    lede: "Type your business details and see how a well-written listing reads, with the checks we run on every page.",
    node: <SearchPreview />,
  },
};

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  if (!s) notFound();
  const demo = demos[s.slug];
  const others = services.filter((x) => x.slug !== s.slug);

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: s.name,
        serviceType: s.name,
        description: s.metaDescription,
        provider: { "@id": `${site.url}/#digital-solutions` },
        areaServed: "Worldwide",
        url: `${site.url}/services/${s.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Services", item: `${site.url}/services` },
          { "@type": "ListItem", position: 3, name: s.name, item: `${site.url}/services/${s.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={ld} />
      <PageHead
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/services", label: "Services" },
          { href: `/services/${s.slug}`, label: s.name },
        ]}
        title={s.headline}
        lede={s.whoFor}
      />

      <section className={`demo-block${demo.dark ? " on-ink" : " section-paper"}`} aria-labelledby="demo-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="demo-title" style={{ fontSize: "var(--step-2)" }}>
              {demo.title}
            </h2>
            <p className="lede">{demo.lede}</p>
          </div>
          {demo.node}
          <div className="live-cta">
            <AskButton prompt={live[s.slug].prompt} className="btn btn-primary">
              {live[s.slug].label}
            </AskButton>
            <span className={demo.dark ? "live-note live-note-dark" : "live-note"}>
              The sample above is scripted. This one is real AI, working on your business.
            </span>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="problems-title">
        <div className="wrap split">
          <div className="prose">
            <h2 id="problems-title">Problems we solve</h2>
            <ul className="plain-list">
              {s.problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div className="prose">
            <h2>What you get</h2>
            <ul className="checks">
              {s.youGet.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="steps-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="steps-title">How it works</h2>
          </div>
          <Steps items={s.steps} />
        </div>
      </section>

      <section className="section" aria-labelledby="why-title">
        <div className="wrap split">
          <div className="prose">
            <h2 id="why-title">Why Libereux</h2>
            <ul className="checks">
              {s.why.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div className="prose">
            <h2>Also from Libereux</h2>
            <ul className="plain-list" style={{ listStyle: "none", paddingLeft: 0 }}>
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/services/${o.slug}`}>{o.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Closer
        title={s.cta}
        body={`Book a free 30-minute consultation with ${site.founder}, in person wherever he is working or online.`}
        service={s.slug}
      />
    </>
  );
}
