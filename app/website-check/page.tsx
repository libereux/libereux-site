import type { Metadata } from "next";
import { og } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import WebsiteCheck from "@/components/WebsiteCheck";
import { Closer, Faq } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Free Website Check: Is Your Site Winning Customers?",
  description:
    "Free website check in about 10 seconds. 14 checks on phones, speed, search results and how easily customers can call, book or buy. No sign-up.",
  alternates: { canonical: "/website-check" },
  openGraph: og("/website-check"),
};

const groups = [
  {
    title: "Can customers act?",
    items: ["A clear next step: book, order or contact", "Phone and messaging links that open with one tap"],
  },
  {
    title: "Does it work on phones?",
    items: ["A layout set up for phone screens", "How quickly the page starts loading", "How heavy the page is"],
  },
  {
    title: "Can people find you?",
    items: [
      "The title shown in search results",
      "The description shown in search results",
      "One clear main heading",
      "Business details for search engines",
      "Image descriptions",
      "Preview image when the link is shared",
      "Page language",
      "Main address",
    ],
  },
  {
    title: "Can they trust it?",
    items: ["A secure connection, so browsers do not warn visitors"],
  },
];

const checkFaqs = [
  {
    q: "Is the website check really free?",
    a: "Yes. There is no sign-up and no cost. If you want help with the fixes, you can book a free 30-minute walkthrough with James Collins.",
  },
  {
    q: "Do you store my website or my results?",
    a: "No. We read the public page once to run the checks, and the results are not saved. The link to your report simply runs the check again.",
  },
  {
    q: "Why is my score different from other tools?",
    a: "Most tools score technical details. This check is weighted toward what wins customers: a clear next step, tap to call, phones, trust and being found in search.",
  },
  {
    q: "Can it check any website?",
    a: "Any public website. It cannot check pages behind a login, and content that only appears after scripts run may not be counted.",
  },
];

const ld = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Libereux Free Website Check",
  url: `${site.url}/website-check`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  provider: { "@id": `${site.url}/#org` },
  description: "A free 14-point check of how well a website turns visitors into customers.",
};

export default function WebsiteCheckPage() {
  return (
    <>
      <JsonLd data={ld} />
      <section className="wc-hero" aria-labelledby="wc-title">
        <div className="wrap">
          <div className="wc-hero-head">
            <h1 id="wc-title">Is your website winning you customers?</h1>
            <p className="lede">
              A free check in about 10 seconds. Fourteen checks on the things that decide whether a visitor
              calls, books or buys, ranked by what matters most.
            </p>
          </div>
          <WebsiteCheck />
        </div>
      </section>

      <section className="section section-paper" aria-labelledby="what-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="what-title">What we check</h2>
            <p className="lede">Weighted toward customers, not code. A missing booking button counts for more than a missing image description.</p>
          </div>
          <div className="wc-groups">
            {groups.map((g) => (
              <div key={g.title} className="wc-group">
                <h3>{g.title}</h3>
                <ul className="checks">
                  {g.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="faq-title">About the check</h2>
          </div>
          <Faq items={checkFaqs} />
        </div>
      </section>

      <Closer
        title="Want the fixes done for you?"
        body="Book a free 30-minute consultation with James Collins. We will walk you through your report and what to fix first, online from anywhere or in person where we are working."
        service="website-updates-seo"
      />
    </>
  );
}
