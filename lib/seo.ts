import type { Metadata } from "next";
import { site } from "@/lib/content";

// Next.js replaces nested openGraph objects per page instead of merging them,
// so every page builds its Open Graph block here to keep the share image.
export function og(path: string, type: "website" | "article" = "website"): Metadata["openGraph"] {
  return {
    type,
    url: path,
    siteName: site.name,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Libereux Digital Solutions: make AI work for your business",
      },
    ],
  };
}
