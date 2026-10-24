import Link from "next/link";
import { custom, maintenance, tiers } from "@/lib/content";

export default function Pricing({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h3" : "h4";
  return (
    <>
      <div className="tiers">
        {tiers.map((t) => (
          <article key={t.id} className={`tier${t.featured ? " tier-featured" : ""}`} aria-labelledby={`tier-${t.id}`}>
            {t.featured && <span className="tier-badge">Best value</span>}
            <H id={`tier-${t.id}`} className="tier-name">
              {t.name}
            </H>
            <div>
              <div className="tier-price">
                <sup>$</sup>
                {t.price}
              </div>
              <p className="tier-time">{t.turnaround}</p>
            </div>
            <p className="tier-summary">{t.summary}</p>
            <ul className="checks">
              {t.includes.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <Link
              href={`/contact?plan=${t.id}`}
              className={`btn ${t.featured ? "btn-primary" : "btn-ghost"}`}
            >
              Start with {t.name}
            </Link>
          </article>
        ))}
      </div>

      <div className="extras">
        <div className="extra">
          <H>{custom.name}</H>
          <p className="muted">{custom.summary}</p>
          <ul className="price-list">
            {custom.addOns.map((a) => (
              <li key={a.name}>
                <span>{a.name}</span>
                <span>{a.price}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="extra">
          <H>Care plan, ${maintenance.price} a month</H>
          <ul className="checks">
            {maintenance.includes.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <p className="muted">Optional. Without it, updates are a flat rate per request.</p>
        </div>
      </div>
    </>
  );
}
