"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/digital-solutions", label: "Services" },
  { href: "/work", label: "Our work" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isCurrent = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="site-header">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="wrap">
        <Link href="/" className="brand" aria-label="Libereux Holdings home">
          <Image src="/libereux-mark.png" alt="" width={44} height={45} priority />
          <span>
            <span className="brand-name">LIBEREUX</span>
            <span className="brand-sub">Digital Solutions</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={isCurrent(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="btn btn-primary">
            Book a free call
          </Link>
        </nav>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Main">
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isCurrent(l.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" className="btn btn-primary" onClick={() => setOpen(false)}>
                Book a free call
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
