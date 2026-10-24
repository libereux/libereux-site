import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { serviceAreas, site } from "@/lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Affordable Websites for Small Businesses from $99 | Libereux",
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
  themeColor: "#17222d",
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
      founder: { "@type": "Person", name: site.founder },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${site.url}/#digital-solutions`,
      name: "Libereux Digital Solutions",
      parentOrganization: { "@id": `${site.url}/#org` },
      url: `${site.url}/digital-solutions`,
      image: `${site.url}/libereux-logo.jpg`,
      email: site.email,
      priceRange: "$99 to $250",
      description: site.description,
      areaServed: [
        ...serviceAreas.map((c) => ({ "@type": "City", name: `${c}, GA` })),
        { "@type": "Country", name: "United States" },
        { "@type": "Country", name: "Thailand" },
      ],
      knowsAbout: ["Web design", "Small business websites", "Web apps", "Mobile apps", "Project management tools"],
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
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
