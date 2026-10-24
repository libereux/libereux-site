// Single source of truth for site copy that appears in more than one place.
// Rules: no em dashes, never name a build platform, show real prices.

export const site = {
  name: "Libereux Holdings",
  legalName: "Libereux Holdings, LLC",
  url: "https://libereux.com",
  email: "holdings@libereux.com",
  founder: "James Collins",
  description:
    "Affordable websites, web apps and business tools for small business owners. Visible prices from $99, delivered in as little as one business day, by Libereux Digital Solutions.",
};

export type Tier = {
  id: string;
  name: string;
  price: number;
  turnaround: string;
  summary: string;
  includes: string[];
  featured?: boolean;
};

export const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
    turnaround: "Ready in 5 to 7 business days",
    summary: "A clean, professional website for a business that has none yet.",
    includes: [
      "Free consultation call",
      "Up to 5 pages",
      "Works on phones, tablets and computers",
      "1 round of revisions",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 200,
    turnaround: "Ready in 3 to 5 business days",
    summary: "More room to show your work, your menu or your listings.",
    includes: [
      "Everything in Starter",
      "More pages",
      "More revision rounds",
      "Faster delivery",
    ],
  },
  {
    id: "priority",
    name: "Priority",
    price: 250,
    turnaround: "Ready the next business day",
    summary: "Everything in Growth, built first and delivered fastest.",
    includes: [
      "Everything in Growth",
      "Your project goes to the front of the line",
      "Delivered the next business day",
    ],
    featured: true,
  },
];

export const custom = {
  name: "Custom builds",
  summary:
    "Booking systems, online payments, customer logins, staff portals and internal tools. Quoted after a free consultation, paid in milestones, never one lump sum up front.",
  addOns: [
    { name: "Online booking or payments added to your site", price: "from $150" },
    { name: "Customer or staff logins with different access levels", price: "from $200" },
    { name: "Custom web apps and business tools", price: "from $500" },
  ],
};

export const maintenance = {
  price: 10,
  includes: [
    "Hosting, so there is no separate hosting bill",
    "1 content update each month (text, photos, prices, hours)",
    "Fixes for anything we built that stops working",
    "Help connecting your own domain name, at no charge",
  ],
};

export const audiences = [
  {
    id: "restaurant",
    name: "Restaurants",
    line: "Menu, hours and a call button customers can tap from the parking lot.",
  },
  {
    id: "salon",
    name: "Salons and barbers",
    line: "Services, prices and booking, so the phone rings less and the chair stays full.",
  },
  {
    id: "realtor",
    name: "Realtors",
    line: "Listings and a contact form that make you look like the established agent you are.",
  },
  {
    id: "contractor",
    name: "Contractors",
    line: "Photos of finished jobs, service areas and a quote request that lands in your inbox.",
  },
];

export const steps = [
  {
    title: "Free consultation",
    body: "A short call about your business and what you need. No cost, no pressure, and you will know the price before we hang up.",
  },
  {
    title: "We build it",
    body: "You pick the speed that fits. We build in layers and check each one, so nothing fragile goes out the door.",
  },
  {
    title: "You review",
    body: "You see the site before it goes live and send one batch of changes. We make them together.",
  },
  {
    title: "You go live",
    body: "We connect your domain, show you around, and stay on call if you choose the maintenance plan.",
  },
];

export type CaseStudy = {
  slug: string;
  client: string;
  kind: string;
  title: string;
  summary: string;
  stats: { value: string; label: string }[];
  challenge: string[];
  built: { heading: string; body: string }[];
  outcome: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "pinnacle-maintenance-services",
    client: "Pinnacle Maintenance Services",
    kind: "Subcontractor management app",
    title: "Keeping subcontractor crews aligned across every job site",
    summary:
      "A dedicated app that turns every job into clear checklists and task assignments each subcontractor can follow without guessing.",
    stats: [
      { value: "Multi-site", label: "crews coordinated in one place" },
      { value: "1 owner", label: "for every task on every job" },
    ],
    challenge: [
      "Pinnacle Maintenance Services runs subcontractor crews across several active job sites at once, often with different vendors handling different parts of the same project.",
      "Missed instructions and unclear task ownership were costing time and money.",
    ],
    built: [
      {
        heading: "Jobs organized as checklists",
        body: "Every job is broken into checklists, so crews see exactly what needs doing and in what order.",
      },
      {
        heading: "Clear task assignments",
        body: "Each task has one subcontractor responsible for it, which removes the question of who owns what.",
      },
      {
        heading: "Secure by default",
        body: "Built on enterprise-grade secure infrastructure backed by SOC 2, ISO 27001 and GDPR-aligned practices.",
      },
    ],
    outcome: [
      "Fewer miscommunications on site, clearer accountability, and a system the team can rely on as they add more crews and more sites.",
    ],
  },
  {
    slug: "enjoyment-os",
    client: "Enjoyment Department",
    kind: "Agency operating system",
    title: "One platform for a marketing agency running nine brands",
    summary:
      "An internal operating system that replaced a patchwork of social apps, booking tools and inboxes with one place the whole team can see.",
    stats: [
      { value: "9", label: "client brands onboarded" },
      { value: "3", label: "core modules in phase 1" },
      { value: "6", label: "team accounts" },
    ],
    challenge: [
      "Enjoyment Department is a multimedia marketing and brand activation agency managing nine active client brands with a six-person team.",
      "Account ownership, flyer approvals and event details lived in people's heads and inboxes instead of one place everyone could see.",
    ],
    built: [
      {
        heading: "Client and brand management",
        body: "A profile for every brand with its points of contact. Every event, post and asset in the platform ties back to a brand here.",
      },
      {
        heading: "Event and venue dashboard",
        body: "Clickable stat cards that open the records behind them, plus an alerts section that only appears when something needs attention.",
      },
      {
        heading: "Content planner and flyer workflow",
        body: "A content calendar filterable by brand, a six-stage flyer pipeline with an owner at every stage, and a warning badge on anything scheduled less than 14 days before its event.",
      },
      {
        heading: "Brand asset library",
        body: "Logos, color palettes, templates and reference files per brand, all previewable without downloading.",
      },
      {
        heading: "AI meeting notes",
        body: "Raw notes go in, and one click returns a summary, action items, key decisions and follow-ups, stored alongside the original.",
      },
      {
        heading: "Voice dictation, honestly labeled",
        body: "Browsers limit how long they will listen. Instead of hiding that, the mic shows a live timer, pauses at 60 seconds without losing a word, and resumes with one tap.",
      },
    ],
    outcome: [
      "The platform runs on the agency's own domain in the agency's own brand colors, and was built in phases so the next modules (staff scheduling, analytics, a client portal) can be added without rework.",
    ],
  },
];

export const faqs = [
  {
    q: "Is $99 really the whole price?",
    a: "Yes. Starter is $99 for up to 5 pages and 1 round of revisions. The scope is stated before you pay, so there are no surprises later. Hosting and monthly updates are optional at $10 a month.",
  },
  {
    q: "I am not good with technology. Can I still do this?",
    a: "Yes. Most of our clients have never had a website before. You talk, we listen, and we handle the technical side. You will get a plain-language walkthrough when your site goes live.",
  },
  {
    q: "Do I need to buy a domain name?",
    a: "You register your own domain so it always belongs to you. We walk you through it and connect it for you at no charge.",
  },
  {
    q: "What if English is not my first language, or my staff speak another language?",
    a: "Calls are in English by default. If that is hard for you, we can work by email and translate proposals and call recaps in both directions.",
  },
  {
    q: "Do you work with businesses outside the United States?",
    a: "Yes. Prices are the same everywhere, and consultations happen over video call.",
  },
  {
    q: "What if I cannot afford it right now?",
    a: "Tell us. We can shrink the scope, start smaller and grow later, or point you to free tools you can set up yourself. We would rather you spend wisely than stretch.",
  },
];

export const serviceAreas = [
  "Morrow",
  "Forest Park",
  "Jonesboro",
  "Riverdale",
  "East Point",
  "College Park",
];
