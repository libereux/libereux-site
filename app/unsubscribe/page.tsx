import type { Metadata } from "next";
import { PageHead } from "@/components/Blocks";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Stop receiving the AI Money Map newsletter.",
  alternates: { canonical: "/unsubscribe" },
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <>
      <PageHead
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/unsubscribe", label: "Unsubscribe" },
        ]}
        title="Unsubscribe from the AI Money Map"
        lede="Enter your email and you will be removed before the next Friday send."
      />
      <section className="section">
        <div className="wrap" style={{ maxWidth: 560 }}>
          <NewsletterForm mode="unsubscribe" />
        </div>
      </section>
    </>
  );
}
