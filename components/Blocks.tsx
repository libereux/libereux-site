import Link from "next/link";
import { caseStudies, faqs, steps } from "@/lib/content";

export function Steps() {
  return (
    <ol className="steps">
      {steps.map((s) => (
        <li className="step" key={s.title}>
          <h3>{s.title}</h3>
          <p className="muted">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function WorkCards() {
  return (
    <div className="work-grid">
      {caseStudies.map((c) => (
        <Link className="work-card" href={`/work/${c.slug}`} key={c.slug}>
          <span className="work-kind">
            {c.client}, {c.kind.toLowerCase()}
          </span>
          <h3>{c.title}</h3>
          <p style={{ color: "var(--on-ink-muted)" }}>{c.summary}</p>
          <div className="work-stats">
            {c.stats.map((s) => (
              <div key={s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <span className="read-more">Read the case study</span>
        </Link>
      ))}
    </div>
  );
}

export function Faq() {
  return (
    <div className="faq">
      {faqs.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Closer({
  title = "Let's talk about your business.",
  body = "Book a free consultation call. You will hear a plain-language plan and a firm price before we hang up. No obligation.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="section on-ink" aria-labelledby="closer-title">
      <div className="wrap closer">
        <h2 id="closer-title">{title}</h2>
        <p className="lede">{body}</p>
        <div className="btn-row">
          <Link href="/contact" className="btn btn-primary">
            Book a free call
          </Link>
          <Link href="/pricing" className="btn btn-ghost">
            See all prices
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PageHead({
  crumbs,
  title,
  lede,
}: {
  crumbs?: { href: string; label: string }[];
  title: string;
  lede?: string;
}) {
  return (
    <div className="page-head">
      <div className="wrap">
        {crumbs && (
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={c.href}>
                <Link href={c.href}>{c.label}</Link>
                {i < crumbs.length - 1 ? " / " : ""}
              </span>
            ))}
          </nav>
        )}
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
    </div>
  );
}
