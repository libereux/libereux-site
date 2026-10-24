// Single source of truth for site copy.
// Direction approved by James Collins on 2026-10-21: Digital Solutions leads, AI first,
// global and fully virtual, Procurement and Real Estate in a "Libereux family" strip.
// Rules: no em dashes, no prices, no build platform or AI tool names, no case studies or
// testimonials without the client's written permission, every promise approved by James.
// Service copy comes from the Pitch Kit one-pagers in Drive (Libereux / Digital Solutions).

export const site = {
  name: "Libereux Holdings",
  legalName: "Libereux Holdings, LLC",
  url: "https://libereux.com",
  email: "holdings@libereux.com",
  phone: "(678) 463-0804",
  phoneHref: "tel:+16784630804",
  founder: "James Collins",
  location: "Georgia, USA",
  reach: "Fully remote. Working with clients worldwide.",
  consultation: "free 30-minute consultation",
  description:
    "AI consulting, assistants and automations, websites and apps, smart home design and SEO. Free 30-minute consultation with James Collins, online worldwide.",
};

export type Service = {
  slug: string;
  name: string;
  short: string;
  title: string; // SEO title
  metaDescription: string;
  headline: string;
  whoFor: string;
  problems: string[];
  youGet: string[];
  steps: { title: string; body: string }[];
  why: string[];
  cta: string;
};

export const services: Service[] = [
  {
    slug: "ai-strategy",
    name: "AI consultation and strategy",
    short: "A clear, practical plan for where AI helps your business most, what to try first, and what to skip.",
    title: "AI Consultation and Strategy for Businesses",
    metaDescription:
      "Know where AI fits in your business and what to do first. A practical, plain-language AI roadmap. Free 30-minute consultation, online worldwide.",
    headline: "Know exactly where AI fits in your business, and what to do first.",
    whoFor:
      "Owners and leaders who are curious about AI, feel pressure to act, and want honest, practical guidance before investing time or budget.",
    problems: [
      "Too many options and too much noise to know where to start.",
      "Worry about wasting effort on ideas that do not fit the business.",
      "Uncertainty about what is safe to use with customer and company information.",
      "A team that is unsure how AI will change their day-to-day work.",
    ],
    youGet: [
      "A review of how your business runs today and where time is lost.",
      "A prioritized list of AI opportunities, ranked by impact and effort.",
      "A practical roadmap with quick wins and longer-term moves.",
      "Simple guidelines for using AI responsibly with your information.",
      "A plain-language session to bring your team on board.",
    ],
    steps: [
      { title: "Discovery", body: "A conversation about your goals, workflows and challenges." },
      { title: "Review", body: "We map your processes and spot the highest-value opportunities." },
      { title: "Roadmap", body: "You receive a clear written plan with priorities and next steps." },
      { title: "Walkthrough", body: "We review the plan together and answer every question." },
      { title: "Optional build", body: "When you are ready, we can implement the plan for you." },
    ],
    why: [
      "Advice from the same person who can build what is recommended.",
      "Clear, jargon-free explanations that make decisions easier.",
      "Recommendations shaped around your business, never a generic template.",
      "Available in person where James is working, or online anywhere.",
    ],
    cta: "Get your AI roadmap.",
  },
  {
    slug: "ai-implementation",
    name: "AI implementation",
    short: "Assistants that answer customers, automations that move work forward, and operations that run with less manual effort.",
    title: "AI Implementation: Assistants and Automations",
    metaDescription:
      "AI assistants, automations and workflows that answer customers after hours and take repetitive admin off your team. Designed, built and supported.",
    headline: "Put AI to work in your business, quietly handling the tasks that slow your team down.",
    whoFor:
      "Businesses ready to move from talking about AI to using it, especially teams buried in repetitive admin, customer questions or manual handoffs.",
    problems: [
      "Customer questions that go unanswered after hours.",
      "Staff time spent copying information between systems.",
      "Follow-ups, reminders and reports that depend on someone remembering.",
      "Processes that break down as the business grows.",
    ],
    youGet: [
      "Custom assistants that answer customer and team questions in your voice.",
      "Automations that move information, send follow-ups and prepare reports.",
      "AI-driven workflows for intake, scheduling, sorting and summarizing.",
      "Clear documentation and hands-on training for your team.",
      "A review period to fine-tune everything once it is live.",
    ],
    steps: [
      { title: "Discover", body: "We identify the tasks and processes that matter most." },
      { title: "Design", body: "We map how the assistant or automation will work, step by step." },
      { title: "Build", body: "We create it and test it carefully with real scenarios." },
      { title: "Launch", body: "We switch it on and guide your team through it." },
      { title: "Refine", body: "We adjust based on how it performs in daily use." },
    ],
    why: [
      "One partner who understands both the strategy and the build.",
      "Solutions designed around how your business already works.",
      "Practical, reliable automations rather than experiments.",
      "Ongoing support so your systems keep improving.",
    ],
    cta: "Let us automate your first workflow.",
  },
  {
    slug: "websites-and-apps",
    name: "Websites, apps and project tools",
    short: "Modern websites, web and mobile apps, and project management tools built around how your team really works.",
    title: "Websites, Web Apps, Mobile Apps and Project Tools",
    metaDescription:
      "Websites, web apps, mobile apps and custom project management tools for businesses, with AI built in where it adds real value.",
    headline: "Have an idea for a site, app or internal tool? We can build it for you.",
    whoFor:
      "Business owners who need a professional website, a web or mobile app for customers, or a project management tool that fits how their team really works.",
    problems: [
      "An outdated website that does not reflect the quality of your business.",
      "A great app idea with no clear path to launch.",
      "Projects tracked across scattered messages and spreadsheets.",
      "Off-the-shelf tools that never quite fit the way you work.",
    ],
    youGet: [
      "Modern, fast websites that work on every device.",
      "Web apps and mobile apps designed around your customers.",
      "Custom project management tools built for your team's workflow.",
      "AI features built in where they add real value.",
      "A smooth handover with training and support.",
    ],
    steps: [
      { title: "Discovery", body: "We define your goals, audience and must-have features." },
      { title: "Design", body: "You review layouts and flows before anything is built." },
      { title: "Build", body: "We develop in stages with regular check-ins and previews." },
      { title: "Launch", body: "We test thoroughly and take it live with you." },
      { title: "Grow", body: "We support updates and new features as you expand." },
    ],
    why: [
      "More than a web developer: strategy, AI and build in one place.",
      "Clear communication and visible progress at every stage.",
      "Built to be easy for you and your team to use and update.",
      "Work with James in person where he is, or online anywhere.",
    ],
    cta: "Tell us what you want to build.",
  },
  {
    slug: "smart-home",
    name: "Remote smart home design",
    short: "See your own space as a smart home before you buy a single device, then set it up together on a screen share.",
    title: "Remote Smart Home Design and Setup",
    metaDescription:
      "Smart home recommendations, before and after visuals of your own rooms, a narrated walkthrough, and remote setup in accounts you own. Worldwide.",
    headline: "See your own space as a smart home before you buy a single device.",
    whoFor:
      "Homeowners, renters, property owners and hosts who want a smarter, more comfortable space, clear advice on what to buy, and setup help without an in-person visit.",
    problems: [
      "Too many devices to choose from, and no idea which ones work well together.",
      "Hard to picture how a smart setup would look and feel in your space.",
      "Worry about buying the wrong products or ending up with a confusing setup.",
      "Uncertainty about who should have access to your home accounts.",
    ],
    youGet: [
      "Personalized product recommendations for your space and lifestyle.",
      "Before and after visuals of your own rooms, created from photos you send.",
      "A narrated walkthrough of your space showing how everything works together.",
      "Remote setup by James himself, in accounts you own, on a screen share with you present.",
      "Simple guidance so everyone at home feels confident using it.",
    ],
    steps: [
      { title: "Share", body: "Send a few photos of your space and tell us how you live." },
      { title: "Plan", body: "We recommend products that fit your rooms, routines and style." },
      { title: "Visualize", body: "You receive before and after visuals and a narrated walkthrough." },
      { title: "Buy and place", body: "You buy the devices and place them yourself, or hire a local installer." },
      { title: "Set up together", body: "James configures everything remotely in your own accounts, on a screen share with you present." },
    ],
    why: [
      "You see the result in your own space before you commit.",
      "Your home stays yours: we never hold your passwords, and you sign in yourself.",
      "Recommendations are based on your needs. If we earn a commission on a recommended product, we say so.",
      "Available wherever you are, fully online.",
    ],
    cta: "See your space, transformed.",
  },
  {
    slug: "website-updates-seo",
    name: "Website updates and SEO",
    short: "Keep your website current and make it easier for customers to find you in search.",
    title: "Website Updates and SEO for Businesses",
    metaDescription:
      "Website reviews, content updates and search improvements that make your business easier to find and turn more visitors into enquiries.",
    headline: "Keep your website current, and make it easier for customers to find you.",
    whoFor:
      "Businesses with an existing website that feels out of date, is hard to update, or is not bringing in the visitors and enquiries it should.",
    problems: [
      "Outdated content, broken links or pages that load slowly.",
      "A site that is hard to find in search results.",
      "Updates that wait weeks because nobody has the time or access.",
      "Unclear messaging that does not turn visitors into enquiries.",
    ],
    youGet: [
      "A review of your site's content, speed, structure and search visibility.",
      "Content and design updates that reflect your business today.",
      "Search improvements: page titles, descriptions, structure and local listings.",
      "Clearer calls to action that guide visitors to get in touch.",
      "Ongoing update support, so your site never falls behind.",
    ],
    steps: [
      { title: "Review", body: "We assess your current site and how customers find you." },
      { title: "Plan", body: "You receive a prioritized list of improvements." },
      { title: "Update", body: "We make the changes, starting with the highest impact." },
      { title: "Check", body: "We confirm everything works well on every device." },
      { title: "Maintain", body: "We keep your site fresh with regular updates." },
    ],
    why: [
      "Practical improvements focused on visibility and enquiries.",
      "Updates handled for you, so your team can focus on the business.",
      "AI-assisted content support where it helps you move faster.",
      "One partner for updates today and bigger builds tomorrow.",
    ],
    cta: "Request a website review.",
  },
];

export const engagementSteps = [
  {
    title: "Conversation",
    body: "A free 30-minute consultation about your business, your goals and what is slowing you down. Online, or in person where James is working.",
  },
  {
    title: "Recommendation",
    body: "You receive a focused plan with clear priorities and a written scope, so you know what will be done before any work starts.",
  },
  {
    title: "Build",
    body: "We deliver the pieces you choose, with regular check-ins so you always know where things stand.",
  },
  {
    title: "Support",
    body: "We refine, train your team, and help you take the next step.",
  },
];

export const frictionPoints = [
  {
    title: "Count the steps",
    body: "We walk the path your customer takes to book, buy or get an answer, and the path your team takes to finish a task.",
  },
  {
    title: "Remove what is not needed",
    body: "Every extra click, call or copy-and-paste is a reason for someone to give up. We take out the ones that do not earn their place.",
  },
  {
    title: "Let AI carry the rest",
    body: "What is left gets easier: assistants answer, automations follow up, and the right information shows up without anyone chasing it.",
  },
];

export const faqs = [

  {
    q: "Do I need to understand AI before we talk?",
    a: "No. That is our job. Tell us how your business runs and what frustrates you, and we will explain what AI can and cannot do for you in plain language.",
  },
  {
    q: "Is the consultation really free?",
    a: "Yes. The first consultation is 30 minutes, free, and comes with no obligation.",
  },
  {
    q: "What does it cost?",
    a: "Every engagement is different, so we scope it after the free consultation. You receive a written scope with the price before any work starts.",
  },
  {
    q: "Do you work outside the United States?",
    a: "Yes. Everything can be done online, from anywhere in the world, and James also meets clients in person in the cities where he is working.",
  },
  {
    q: "What if English is not my first language?",
    a: "Calls are in English. If that is hard for you or your team, we can work by email and translate proposals and call recaps in both directions.",
  },
  {
    q: "Do you install smart home devices?",
    a: "No. You buy and place the devices yourself, or hire a local installer. James then configures everything remotely, in accounts you own, on a screen share with you present. We never hold your passwords.",
  },
];

export const family = [
  {
    href: "/procurement",
    name: "Libereux Procurement",
    body: "International sourcing between the United States and the Bahamas, with clear estimates and matching invoices.",
  },
  {
    href: "/real-estate",
    name: "Libereux Real Estate",
    body: "Furnished stays and long-term rentals in Georgia, managed locally.",
  },
];
