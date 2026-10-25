import Link from "next/link";
import { engagementSteps, faqs, family, services } from "@/lib/content";

export function Steps({ items = engagementSteps }: { items?: { title: string; body: string }[] }) {
  return (
    <ol className="steps" data-count={items.length}>
      {items.map((s) => (
        <li className="step" key={s.title}>
          <h3>{s.title}</h3>
          <p className="muted">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function ServiceList() {
  return (
    <div className="service-list">
      {services.map((s) => (
        <Link className="service-row" href={`/services/${s.slug}`} key={s.slug}>
          <h3>{s.name}</h3>
          <p className="muted">{s.short}</p>
          <span className="go">Learn more</span>
        </Link>
      ))}
    </div>
  );
}

export function Faq({ items = faqs }: { items?: { q: string; a: string }[] }) {
  return (
    <div className="faq">
      {items.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Family() {
  return (
    <section className="section-tight" aria-labelledby="family-title">
      <div className="wrap">
        <div className="section-head" style={{ marginBottom: 28 }}>
          <h2 id="family-title" style={{ fontSize: "var(--step-2)" }}>
            The Libereux family
          </h2>
          <p className="muted">
            Digital Solutions is part of Libereux Holdings, LLC, alongside two other businesses.
          </p>
        </div>
        <div className="divisions">
          {family.map((f) => (
            <Link className="division" href={f.href} key={f.href}>
              <h3>{f.name}</h3>
              <p className="muted">{f.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Closer({
  title = "Have a question about AI, or something you want built?",
  body = "Start with a free 30-minute consultation with James Collins, on an online video call. You will leave with clear next steps, and no obligation.",
  service,
}: {
  title?: string;
  body?: string;
  service?: string;
}) {
  return (
    <section className="section on-ink" aria-labelledby="closer-title">
      <div className="wrap closer">
        <h2 id="closer-title">{title}</h2>
        <p className="lede">{body}</p>
        <div className="btn-row">
          <Link href={service ? `/contact?service=${service}` : "/contact"} className="btn btn-primary">
            Book a free 30-minute consultation
          </Link>
          <Link href="/how-it-works" className="btn btn-ghost">
            How it works
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
