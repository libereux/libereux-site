// Pricing v1. `pricingLive` false hides everything; `pricingLive` true with `pricingPublic` false is the soft launch.
// Status: James Collins approved these prices on 2026-10-24 (in chat). Checkout was switched on
// for a soft launch (direct link only) the same day, after Stripe was configured and the terms,
// refund policy and privacy update were published. A legal professional has not reviewed them yet,
// and the cross-border legal and accounting review is still open.
// Rules: no em dashes, no build platform or AI tool names in any customer-facing text.

export const pricingLive = true;

// Public launch (2026-10-24, James Collins): /packages is in the sitemap, linked from the menu and indexable.
// Set to false to return to soft launch (direct link only, noindex, no sitemap or menu entry).
export const pricingPublic = true;

export type RegionTier = 1 | 2 | 3;

// Price is set by billing country. Countries not listed here are not assigned a tier and
// route to the custom quote path (decided by James on 2026-10-24).
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
    summary: "More pages, booking or lead capture, and search setup.",
    includes: ["Up to 8 pages", "Booking or lead capture", "Basic search setup", "2 revision rounds"],
    turnaround: "5 business days",
    price: { tier1: 1150, tier2: 575, tier3: 325 },
  },
  {
    id: "website-pro",
    name: "Website Pro",
    summary: "Everything in Plus, with a second language.",
    includes: ["Everything in Website Plus", "A second language"],
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
    summary: "A written plan for where AI helps your business, fully credited toward a build within 30 days.",
    includes: ["Written plan", "Fully credited toward a build within 30 days"],
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

// Add-ons are listed for the order brief only. Their amounts are not set, so they are not
// charged at checkout. They are priced in the written scope confirmation before work starts.
export const addOns = [
  "Extra page",
  "Extra language",
  "Online booking",
  "Extra revision round",
  "Rush delivery",
];

// Orders that get a written quote (within 24 hours) or the paid audit instead of checkout.
export const routeToConsultation = [
  "Integrations with existing systems",
  "Large e-commerce",
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

export const countryOptions: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "TH", name: "Thailand" },
  { code: "MY", name: "Malaysia" },
  { code: "MX", name: "Mexico" },
  { code: "ZA", name: "South Africa" },
  { code: "PH", name: "Philippines" },
  { code: "NG", name: "Nigeria" },
  { code: "IN", name: "India" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "PK", name: "Pakistan" },
];

// The care plan is a subscription and is set up after launch, not at checkout.
export const isCheckoutPackage = (pkg: Package) => pkg.recurring === undefined;

export function findPackage(id: string): Package | undefined {
  return packages.find((p) => p.id === id);
}

// Deposit in US cents for one package at a tier.
export function depositCents(pkg: Package, tier: RegionTier): number {
  return Math.round((priceFor(pkg, tier) * 100 * depositPercent) / 100);
}
