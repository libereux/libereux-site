import type { Metadata } from "next";
import AdminLeases from "@/components/esign/AdminLeases";

export const metadata: Metadata = {
  title: "Properties and leases",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>Properties and leases</h1>
        <p className="lede">Who is in each property and when, every lease in one place, and leases sent for signature.</p>
        <AdminLeases />
      </div>
    </section>
  );
}
