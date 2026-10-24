import type { MetadataRoute } from "next";
import { caseStudies, site } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-10-24");
  const pages: [string, number][] = [
    ["", 1],
    ["/digital-solutions", 0.9],
    ["/pricing", 0.9],
    ["/work", 0.7],
    ["/contact", 0.8],
    ["/about", 0.5],
    ["/procurement", 0.4],
    ["/property-management", 0.4],
    ["/privacy", 0.1],
  ];
  return [
    ...pages.map(([path, priority]) => ({
      url: `${site.url}${path}`,
      lastModified: now,
      priority,
    })),
    ...caseStudies.map((c) => ({
      url: `${site.url}/work/${c.slug}`,
      lastModified: now,
      priority: 0.6,
    })),
  ];
}
