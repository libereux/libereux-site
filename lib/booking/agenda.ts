// Builds the consultation agenda that goes in the calendar event description.
// It is rule based on purpose: no AI service, no running cost, and the same input
// always gives the same agenda. It repeats what the visitor wrote and adds a few
// questions for the service they picked.

export type Intake = {
  name: string;
  email: string;
  phone: string;
  location: string;
  service: string; // slug from lib/content.ts, or "not-sure"
  message: string;
};

const SERVICE_LABEL: Record<string, string> = {
  "ai-strategy": "AI consultation and strategy",
  "ai-implementation": "AI implementation",
  "websites-and-apps": "Websites, apps and project tools",
  "smart-home": "Remote smart home design",
  "website-updates-seo": "Website updates and SEO",
  "not-sure": "Not sure yet",
};

const QUESTIONS: Record<string, string[]> = {
  "ai-strategy": [
    "Which tasks eat the most hours each week, and who does them today?",
    "Which tools or software do you already pay for?",
    "Have you tried any AI tools yet? What happened?",
    "What would a good result look like in 90 days?",
  ],
  "ai-implementation": [
    "Which process do you want automated first, and how is it done by hand today?",
    "What systems hold the data (email, spreadsheets, booking, accounting)?",
    "Who will use it day to day, and how comfortable are they with new tools?",
    "What must never be sent outside the business (customer, payment or health data)?",
  ],
  "websites-and-apps": [
    "Do you have a site or app today? What is wrong with it?",
    "What should a visitor do first: call, book, buy or message?",
    "Does your team or your customers speak more than one language?",
    "Is there a launch date or event driving the deadline?",
  ],
  "smart-home": [
    "Is this a new build, a renovation or an existing home?",
    "Which rooms or systems matter most (lighting, security, climate, entertainment)?",
    "Do you already have devices or a hub installed?",
    "Who lives there, and what is annoying about the home today?",
  ],
  "website-updates-seo": [
    "What is the website address, and who maintains it today?",
    "What do customers search for when they should find you?",
    "Which pages bring in the most enquiries now?",
    "Are you on Google Business Profile, and is it up to date?",
  ],
  "not-sure": [
    "What prompted you to book this call now?",
    "Where does the business lose the most time or money today?",
    "Which tools or software do you already use?",
    "What would make this call a success for you?",
  ],
};

// The visitor is invited to the event, so Google shows them this text too. Write it for both
// of you: no internal notes. Keep calendar text plain and bounded. No links or markup from visitors reach the event.
const plain = (v: string, max: number) =>
  v
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+\n/g, "\n")
    .trim()
    .slice(0, max);

export function buildAgenda(intake: Intake, opts: { visitorTimeLabel: string; meetNote?: string }): string {
  const service = SERVICE_LABEL[intake.service] ? intake.service : "not-sure";
  const lines: string[] = [];
  lines.push("FREE 30 MINUTE CONSULTATION (booked on libereux.com)");
  lines.push("");
  lines.push("WHO");
  lines.push(`Name: ${plain(intake.name, 120)}`);
  lines.push(`Email: ${plain(intake.email, 200)}`);
  if (intake.phone) lines.push(`Phone or WhatsApp: ${plain(intake.phone, 60)}`);
  if (intake.location) lines.push(`Based in: ${plain(intake.location, 120)}`);
  lines.push(`Local time for the visitor: ${opts.visitorTimeLabel}`);
  lines.push("");
  lines.push("TOPIC");
  lines.push(SERVICE_LABEL[service]);
  lines.push("");
  lines.push("WHAT WAS WRITTEN ON THE FORM");
  lines.push(intake.message ? plain(intake.message, 1500) : "(No details added.)");
  lines.push("");
  lines.push("SUGGESTED AGENDA");
  lines.push("1. Two minutes: introductions, confirm the goal for the call.");
  lines.push("2. Ten minutes: the business and what is slowing it down.");
  lines.push("3. Ten minutes: what a good result looks like, and rough options.");
  lines.push("4. Five minutes: agree next steps. Written scope and price come after the call.");
  lines.push("");
  lines.push("QUESTIONS WE WILL COVER (feel free to think about them beforehand)");
  QUESTIONS[service].forEach((q) => lines.push(`- ${q}`));
  if (opts.meetNote) {
    lines.push("");
    lines.push(opts.meetNote);
  }
  return lines.join("\n");
}

/** A readable label such as "Tue 3 Nov, 12:30 (America/New_York)" for the visitor's zone. */
export function visitorTimeLabel(startMs: number, zone: string): string {
  try {
    const text = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(startMs));
    return `${text} (${zone})`;
  } catch {
    return `${new Date(startMs).toISOString()} (UTC)`;
  }
}

export function validZone(zone: unknown): zone is string {
  if (typeof zone !== "string" || zone.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}
