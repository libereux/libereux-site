// Shared between the assistant API route and the browser.

export type ServicesCard = { kind: "services"; slugs: string[] };

export type AuditCheck = { label: string; ok: boolean; detail: string };
export type AuditCard = {
  kind: "audit";
  url: string;
  host: string;
  score: number;
  checks: AuditCheck[];
  loadMs: number;
  sizeKb: number;
};

export type RoadmapItem = { title: string; detail: string; impact: "High" | "Medium"; effort: "Low" | "Medium" | "High" };
export type RoadmapCard = { kind: "roadmap"; business: string; items: RoadmapItem[]; firstStep: string };

export type SmartHomeCard = {
  kind: "smarthome";
  space: string;
  devices: { type: string; why: string }[];
  scenes: { name: string; what: string }[];
};

export type RequestCard = {
  kind: "request";
  name: string;
  email: string;
  location: string;
  interests: string[];
  brief: string;
};

export type PageCard = { kind: "page"; path: string; label: string };

export type Card = ServicesCard | AuditCard | RoadmapCard | SmartHomeCard | RequestCard | PageCard;

// One line of the streamed response (newline-delimited JSON).
export type StreamEvent =
  | { t: "text"; v: string }
  | { t: "step"; id: string; label: string; status: "run" | "done" | "error"; detail?: string }
  | { t: "card"; card: Card }
  | { t: "memo"; v: string } // short text summary of a card, kept in history for context
  | { t: "error"; v: string }
  | { t: "done" };

export type ChatTurn = { role: "user" | "assistant"; content: string };

export const SITE_PATHS = [
  "/",
  "/services",
  "/services/ai-strategy",
  "/services/ai-implementation",
  "/services/websites-and-apps",
  "/services/smart-home",
  "/services/website-updates-seo",
  "/how-it-works",
  "/about",
  "/contact",
  "/procurement",
  "/real-estate",
  "/privacy",
] as const;
