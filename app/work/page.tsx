import type { Metadata } from "next";
import { og } from "@/lib/seo";
import { Closer, PageHead, WorkCards } from "@/components/Blocks";

export const metadata: Metadata = {
  title: "Our Work: Case Studies",
  description:
    "Case studies from Libereux Digital Solutions: a subcontractor management app for a maintenance company and an operating system for a nine-brand marketing agency.",
  alternates: { canonical: "/work" },
  openGraph: og("/work"),
};

export default function WorkPage() {
  return (
    <>
      <PageHead
        crumbs={[{ href: "/", label: "Home" }, { href: "/work", label: "Our work" }]}
        title="Work that runs real businesses."
        lede="Each project started with a conversation about how the business actually works, not a template."
      />
      <section className="section on-ink" aria-label="Case studies">
        <div className="wrap">
          <WorkCards />
        </div>
      </section>
      <Closer title="Your business could be next." />
    </>
  );
}
