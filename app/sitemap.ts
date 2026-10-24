import type { MetadataRoute } from "next";
import { services, site } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-24");
  const pages: [string, number][] = [
    ["", 1],
    ["/services", 0.9],
    ["/contact", 0.8],
    ["/how-it-works", 0.7],
    ["/about", 0.6],
    ["/procurement", 0.4],
    ["/real-estate", 0.4],
    ["/privacy", 0.1],
  ];
  return [
    ...pages.map(([path, priority]) => ({ url: `${site.url}${path}`, lastModified, priority })),
    ...services.map((s) => ({ url: `${site.url}/services/${s.slug}`, lastModified, priority: 0.9 })),
  ];
}
