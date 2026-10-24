import Link from "next/link";
import { site } from "@/lib/content";

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
            <h2>Libereux Holdings</h2>
            <p>
              Websites, web apps and business tools for small business owners, with prices you can
              see before you call.
            </p>
            <p style={{ marginTop: 14 }}>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </div>
          <div>
            <h2>Digital Solutions</h2>
            <ul>
              <li><Link href="/digital-solutions">Services</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/work">Our work</Link></li>
              <li><Link href="/contact">Book a free call</Link></li>
            </ul>
          </div>
          <div>
            <h2>Holdings</h2>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/procurement">Procurement</Link></li>
              <li><Link href="/property-management">Property management</Link></li>
            </ul>
          </div>
          <div>
            <h2>Legal</h2>
            <ul>
              <li><Link href="/privacy">Privacy policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-base">
          <span>© <Year /> {site.legalName}. All rights reserved.</span>
          <span>Founded by {site.founder}</span>
        </div>
      </div>
    </footer>
  );
}
