import Link from "next/link";
import { services, site } from "@/lib/content";

async function Year() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <h2>Libereux Digital Solutions</h2>
            <p>AI consultation, AI implementation, and digital builds for businesses anywhere in the world.</p>
            <ul className="contact-lines" style={{ marginTop: 16 }}>
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <a href={site.phoneHref}>{site.phone}</a>
              </li>
              <li>{site.reach}</li>
            </ul>
          </div>
          <div>
            <h2>Services</h2>
            <ul>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`}>{s.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Company</h2>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/how-it-works">How it works</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/privacy">Privacy policy</Link></li>
            </ul>
          </div>
          <div>
            <h2>Libereux family</h2>
            <ul>
              <li><Link href="/procurement">Procurement</Link></li>
              <li><Link href="/real-estate">Real Estate</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-base">
          <span>
            © <Year /> {site.legalName}. Registered in {site.location}.
          </span>
          <span>Founded by {site.founder}</span>
        </div>
      </div>
    </footer>
  );
}
