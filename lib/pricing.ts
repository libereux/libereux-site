// Pricing v1 (DRAFT). Not shown anywhere on the site while `pricingLive` is false.
// Status: prices are test values proposed on 2026-10-24 and NOT approved by James Collins.
// Do not turn this on, and do not render any value from this file, until James approves
// the numbers in writing, payments are set up per country, and the cross-border legal and
// accounting review has cleared checkout for that market.
// Rules: no em dashes, no build platform or AI tool names in any customer-facing text.

export const pricingLive = false;

export type RegionTier = 1 | 2 | 3;

// Price is set by billing country. Countries not listed here are not assigned a tier and
// route to the custom quote path until James decides (open decision).
export const regionTierByCountry: Record<string, RegionTier> = {
  // Tier 1
  US: 1,
  GB: 1,
  CA: 1,
  AU: 1,
  // Tier 2
  TH: 2,
  MY: 2,
  MX: 2,
  ZA: 2,
  // Tier 3
  PH: 3,
  NG: 3,
  IN: 3,
  KE: 3,
  GH: 3,
  PK: 3,
};

export type PriceByTier = { tier1: number; tier2: number; tier3: number };

export type Package = {
  id: string;
  name: string;
  summary: string;
  includes: string[];
  turnaround?: string;
  price: PriceByTier;
  recurring?: "month";
  creditedToBuild?: boolean; // the audit credits toward a build within 30 days
};

export const packages: Package[] = [
  {
    id: "website-starter",
    name: "Website Starter",
    summary: "A clean, mobile-ready site to get you online.",
    includes: ["Up to 5 pages", "Mobile ready", "Contact form", "1 revision round"],
    turnaround: "7 business days",
    price: { tier1: 699, tier2: 349, tier3: 199 },
  },
  {
    id: "website-plus",
    name: "Website Plus",
    summary: "The one most owners choose: more pages, booking or lead capture, and search setup.",
    includes: ["Up to 8 pages", "Booking or lead capture", "Basic search setup", "2 revision rounds"],
    turnaround: "5 business days",
    price: { tier1: 1150, tier2: 575, tier3: 325 },
  },
  {
    id: "website-pro",
    name: "Website Pro",
    summary: "Everything in Plus, with a second language and priority delivery.",
    includes: ["Everything in Website Plus", "A second language", "Priority turnaround"],
    turnaround: "3 business days",
    price: { tier1: 1600, tier2: 800, tier3: 450 },
  },
  {
    id: "update-seo",
    name: "Website update and search tune-up",
    summary: "Text and image swaps, speed and search fixes. No new features.",
    includes: ["Text and image updates", "Speed fixes", "Search fixes"],
    price: { tier1: 249, tier2: 129, tier3: 79 },
  },
  {
    id: "ai-assistant",
    name: "AI assistant (one channel)",
    summary: "An FAQ or booking assistant trained on your business information.",
    includes: ["Setup", "Trained on your business information", "30 days of adjustments"],
    price: { tier1: 899, tier2: 449, tier3: 249 },
  },
  {
    id: "workflow-automation",
    name: "Single workflow automation",
    summary: "One defined process, built, tested and documented.",
    includes: ["One process", "Testing", "Documentation"],
    price: { tier1: 499, tier2: 249, tier3: 149 },
  },
  {
    id: "ai-audit",
    name: "AI Opportunity Audit",
    summary: "A written plan for where AI helps your business. Credited toward any build within 30 days.",
    includes: ["Written plan", "Prioritized opportunities", "Credit toward a build within 30 days"],
    price: { tier1: 149, tier2: 79, tier3: 49 },
    creditedToBuild: true,
  },
  {
    id: "care-plan",
    name: "Care plan",
    summary: "Ongoing care for your site.",
    includes: ["Text and image swaps only"],
    price: { tier1: 10, tier2: 10, tier3: 10 },
    recurring: "month",
  },
];

// Add-ons, roughly 10 to 15 percent of the package price each. Placeholder percentages
// until James sets real amounts.
export const addOns = [
  "Extra page",
  "Extra language",
  "Online booking",
  "Extra revision round",
  "Rush delivery",
];

// Orders that must go to a consultation or the paid audit instead of checkout.
export const routeToConsultation = [
  "Integrations with existing systems",
  "E-commerce beyond the agreed limit",
  "Storing customer data",
  "Multiple locations",
  "Custom apps",
  "Health data of any kind",
];

export const depositPercent = 50;

export function tierForCountry(countryCode: string | null | undefined): RegionTier | null {
  if (!countryCode) return null;
  return regionTierByCountry[countryCode.toUpperCase()] ?? null;
}

export function priceFor(pkg: Package, tier: RegionTier): number {
  return tier === 1 ? pkg.price.tier1 : tier === 2 ? pkg.price.tier2 : pkg.price.tier3;
}
