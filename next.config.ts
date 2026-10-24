import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // Old site URLs keep their search ranking by pointing permanently to the new ones.
  async redirects() {
    return [
      { source: "/DigitalSolutions", destination: "/digital-solutions", permanent: true },
      { source: "/Procurement", destination: "/procurement", permanent: true },
      { source: "/PrivacyPolicy", destination: "/privacy", permanent: true },
      { source: "/TenantLogin", destination: "/tenant/login", permanent: true },
      { source: "/TenantRegister", destination: "/tenant/register", permanent: true },
      { source: "/TenantPortal", destination: "/tenant", permanent: true },
      { source: "/AdminPortal", destination: "/admin", permanent: true },
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
