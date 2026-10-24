import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // Old site URLs keep their search ranking by pointing permanently to the new ones.
  // Old URLs keep their search ranking by pointing to the new ones.
  async redirects() {
    return [
      { source: "/Home", destination: "/", permanent: true },
      { source: "/DigitalSolutions", destination: "/services", permanent: true },
      { source: "/digital-solutions", destination: "/services", permanent: true },
      { source: "/PrivacyPolicy", destination: "/privacy", permanent: true },
      { source: "/property-management", destination: "/real-estate", permanent: true },
      // Pages removed until pricing is final and clients approve case studies in writing.
      { source: "/pricing", destination: "/how-it-works", permanent: false },
      { source: "/work", destination: "/services", permanent: false },
      { source: "/work/:slug", destination: "/services", permanent: false },
      // Tenant and admin portals are not public. Revisit when the portals are rebuilt.
      { source: "/TenantLogin", destination: "/real-estate", permanent: false },
      { source: "/TenantRegister", destination: "/real-estate", permanent: false },
      { source: "/TenantPortal", destination: "/real-estate", permanent: false },
      { source: "/AdminPortal", destination: "/", permanent: false },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
