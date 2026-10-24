import type { Metadata } from "next";
import { og } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { Closer, PageHead } from "@/components/Blocks";
import { caseStudies, site } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = caseStudies.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `${c.client} Case Study`,
    description: c.summary,
    alternates: { canonical: `/work/${c.slug}` },
    openGraph: og(`/work/${c.slug}`, "article"),
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const c = caseStudies.find((x) => x.slug === slug);
  if (!c) notFound();

  const others = caseStudies.filter((x) => x.slug !== c.slug);

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: c.title,
        description: c.summary,
        author: { "@type": "Person", name: site.founder },
        publisher: { "@id": `${site.url}/#org` },
        mainEntityOfPage: `${site.url}/work/${c.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Our work", item: `${site.url}/work` },
          { "@type": "ListItem", position: 3, name: c.client, item: `${site.url}/work/${c.slug}` },
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
          { href: "/work", label: "Our work" },
          { href: `/work/${c.slug}`, label: c.client },
        ]}
        title={c.title}
        lede={`${c.client}. ${c.kind}.`}
      />

      <section className="section" aria-labelledby="challenge-title">
        <div className="wrap split">
          <div className="prose">
            <h2 id="challenge-title">The challenge</h2>
            {c.challenge.map((p) => (
              <p key={p} className="muted">
                {p}
              </p>
            ))}
          </div>
          <div>
            <div className="case-stats">
              {c.stats.map((s) => (
                <div key={s.label}>
                  <b>{s.value}</b>
                  <span className="muted">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="built-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="built-title">What we built</h2>
          </div>
          <div className="feature-list">
            {c.built.map((b) => (
              <div key={b.heading}>
                <h3>{b.heading}</h3>
                <p className="muted">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="outcome-title">
        <div className="wrap">
          <div className="prose">
            <h2 id="outcome-title">The result</h2>
            {c.outcome.map((p) => (
              <p key={p} className="lede" style={{ maxWidth: "60ch" }}>
                {p}
              </p>
            ))}
            {others.map((o) => (
              <p key={o.slug}>
                Next: <Link href={`/work/${o.slug}`}>{o.title}</Link>
              </p>
            ))}
          </div>
        </div>
      </section>

      <Closer title="Need something like this?" body="Tell us how your business runs today. We will tell you what we would build, what it costs, and how long it takes." />
    </>
  );
}
