import type { Metadata } from "next";
import { Suspense } from "react";
import SignLease from "@/components/esign/SignLease";

export const metadata: Metadata = {
  title: "Sign your lease",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Page() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>Sign your lease</h1>
        <Suspense fallback={<p className="muted">Loading your lease…</p>}>
          <SignLease />
        </Suspense>
      </div>
    </section>
  );
}
