import type { Metadata } from "next";
import AdminLeases from "@/components/esign/AdminLeases";

export const metadata: Metadata = {
  title: "Leases",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>Leases</h1>
        <p className="lede">Send leases for signature, track who has signed, and keep every signed copy in one place.</p>
        <AdminLeases />
      </div>
    </section>
  );
}
