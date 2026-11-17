import type { Metadata } from "next";
import { Suspense } from "react";
import SignLease from "@/components/esign/SignLease";

export const metadata: Metadata = {
  title: "Review and sign",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Page() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>Review and sign</h1>
        <Suspense fallback={<p className="muted">Loading…</p>}>
          <SignLease />
        </Suspense>
      </div>
    </section>
  );
}
