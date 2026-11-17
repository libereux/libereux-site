import type { Metadata } from "next";
import AdminLeases from "@/components/esign/AdminLeases";

export const metadata: Metadata = {
  title: "Properties, leases and documents",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <section className="section">
      <div className="wrap">
        <h1>Libereux portal</h1>
        <p className="lede">Who is in each property and when, every lease in one place, and leases and other documents sent for signature.</p>
        <AdminLeases />
      </div>
    </section>
  );
}
