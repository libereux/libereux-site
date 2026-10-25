import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pricingLive } from "@/lib/pricing";
import { PageHead } from "@/components/Blocks";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  if (!pricingLive) notFound();

  return (
    <>
      <PageHead
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/packages", label: "Packages" },
        ]}
        title="Thank you. Your deposit is in."
        lede="Here is what happens next."
      />
      <section className="section">
        <div className="wrap prose">
          <ol className="plain-list">
            <li>You will receive a receipt from our payment provider by email.</li>
            <li>
              Before any work starts, we send you a short written scope listing exactly what is and is not
              included. Reply to confirm it.
            </li>
            <li>Work begins once you have confirmed the scope.</li>
          </ol>
          <p className="muted">
            Questions? Email <a href={`mailto:${site.email}`}>{site.email}</a> or call{" "}
            <a href={site.phoneHref}>{site.phone}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
