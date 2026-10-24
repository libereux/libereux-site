import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { AssistantProvider } from "@/components/assistant/Assistant";
import { services, site } from "@/lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "AI Consultant and Digital Solutions | Libereux",
    template: "%s | Libereux",
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.founder }],
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1b2a4a",
};

const orgLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#org`,
      name: site.name,
      legalName: site.legalName,
      url: site.url,
      logo: `${site.url}/libereux-logo.jpg`,
      email: site.email,
      telephone: "+1-678-463-0804",
      address: { "@type": "PostalAddress", addressRegion: "GA", addressCountry: "US" },
      founder: { "@id": `${site.url}/#james` },
    },
    {
      "@type": "Person",
      "@id": `${site.url}/#james`,
      name: site.founder,
      jobTitle: "Founder",
      worksFor: { "@id": `${site.url}/#org` },
      url: `${site.url}/about`,
      knowsAbout: ["Artificial intelligence", "AI strategy", "Automation", "Web development", "Smart home technology", "Project management"],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${site.url}/#digital-solutions`,
      name: "Libereux Digital Solutions",
      parentOrganization: { "@id": `${site.url}/#org` },
      url: `${site.url}/services`,
      image: `${site.url}/libereux-logo.jpg`,
      email: site.email,
      telephone: "+1-678-463-0804",
      description: site.description,
      areaServed: "Worldwide",
      founder: { "@id": `${site.url}/#james` },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Digital Solutions services",
        itemListElement: services.map((sv) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: sv.name, url: `${site.url}/services/${sv.slug}` },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      publisher: { "@id": `${site.url}/#org` },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={orgLd} />
        <AssistantProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </AssistantProvider>
      </body>
    </html>
  );
}
