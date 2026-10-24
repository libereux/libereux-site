import type Anthropic from "@anthropic-ai/sdk";
import { services } from "@/lib/content";
import { scanWebsite, ScanError } from "./scan";
import { SITE_PATHS, type Card, type RoadmapItem } from "./types";

const slugs = services.map((s) => s.slug);

export const TOOLS: Anthropic.Tool[] = [
  {
    name: "show_services",
    description: "Show service cards to the visitor. Use when they ask what Libereux does or which service fits their need.",
    input_schema: {
      type: "object",
      properties: {
        slugs: { type: "array", items: { type: "string", enum: slugs }, minItems: 1, maxItems: 5, description: "Services to show, most relevant first." },
      },
      required: ["slugs"],
    },
  },
  {
    name: "scan_website",
    description:
      "Fetch a public website and run 14 checks for search visibility, mobile use and how easily a customer can act. Returns a score, failed checks and a short text excerpt. Use whenever the visitor shares a website address or asks for a site review.",
    input_schema: {
      type: "object",
      properties: { url: { type: "string", description: "The website address the visitor gave, for example example.com" } },
      required: ["url"],
    },
  },
  {
    name: "build_ai_roadmap",
    description:
      "Show the visitor a personal AI roadmap card. Use once you know their type of business and at least one thing that costs them time. Opportunities must be specific to their business and realistic for a small team.",
    input_schema: {
      type: "object",
      properties: {
        business: { type: "string", description: "Short description of their business, for example 'family restaurant in Cape Town'." },
        items: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Under 8 words." },
              detail: { type: "string", description: "One or two plain sentences on what it does for them." },
              impact: { type: "string", enum: ["High", "Medium"] },
              effort: { type: "string", enum: ["Low", "Medium", "High"] },
            },
            required: ["title", "detail", "impact", "effort"],
          },
        },
        first_step: { type: "string", description: "One concrete first step they could take this week." },
      },
      required: ["business", "items", "first_step"],
    },
  },
  {
    name: "plan_smart_home",
    description:
      "Show a smart home plan card for a space the visitor described. Recommend device types, never brands. Include 2 to 4 scenes that show what one tap would do.",
    input_schema: {
      type: "object",
      properties: {
        space: { type: "string", description: "The space, for example 'two-bedroom rental apartment'." },
        devices: {
          type: "array",
          minItems: 3,
          maxItems: 7,
          items: {
            type: "object",
            properties: { type: { type: "string" }, why: { type: "string" } },
            required: ["type", "why"],
          },
        },
        scenes: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: {
            type: "object",
            properties: { name: { type: "string" }, what: { type: "string" } },
            required: ["name", "what"],
          },
        },
      },
      required: ["space", "devices", "scenes"],
    },
  },
  {
    name: "prepare_consultation_request",
    description:
      "Show the visitor a consultation request card they can edit and send. You cannot send it yourself; the visitor must press Send. Use when they want to book, talk to James, get a quote or start a project.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Visitor's name, or empty if unknown." },
        email: { type: "string", description: "Visitor's email, or empty if unknown. Never guess." },
        location: { type: "string", description: "City and country if known, else empty." },
        interests: { type: "array", items: { type: "string", enum: slugs }, description: "Relevant services." },
        brief: {
          type: "string",
          description: "A brief for James, in English, 2 to 5 sentences: their business, goals, what they asked about, preferred language and anything useful for the call.",
        },
      },
      required: ["name", "email", "location", "interests", "brief"],
    },
  },
  {
    name: "open_page",
    description: "Offer the visitor a button to the most relevant page on this website.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", enum: [...SITE_PATHS] },
        label: { type: "string", description: "Button text, under 6 words, for example 'See the smart home service'." },
      },
      required: ["path", "label"],
    },
  },
];

export type ToolOutcome = {
  label: string; // shown in the step trail while running
  doneDetail?: string;
  card?: Card;
  memo?: string; // short summary kept in chat history
  result: string; // returned to the model
  isError?: boolean;
};

const clip = (s: unknown, n: number) => (typeof s === "string" ? s.slice(0, n) : "");

export function stepLabel(name: string, input: Record<string, unknown>): string {
  switch (name) {
    case "show_services":
      return "Matching services to what you need";
    case "scan_website":
      return `Scanning ${clip(input.url, 60).replace(/^https?:\/\//, "") || "your website"}`;
    case "build_ai_roadmap":
      return "Drafting your AI roadmap";
    case "plan_smart_home":
      return "Designing your smart home plan";
    case "prepare_consultation_request":
      return "Preparing your consultation request";
    case "open_page":
      return "Finding the right page";
    default:
      return "Working";
  }
}

export async function runTool(name: string, input: Record<string, unknown>): Promise<ToolOutcome> {
  const label = stepLabel(name, input);
  switch (name) {
    case "show_services": {
      const list = (Array.isArray(input.slugs) ? input.slugs : []).filter((s): s is string => slugs.includes(s as string));
      if (!list.length) return { label, result: "No valid services given.", isError: true };
      return {
        label,
        doneDetail: `${list.length} matched`,
        card: { kind: "services", slugs: list },
        memo: `[Showed service cards: ${list.join(", ")}]`,
        result: "The service cards are now visible to the visitor.",
      };
    }
    case "scan_website": {
      try {
        const { card, forModel } = await scanWebsite(clip(input.url, 300));
        return {
          label: `Scanning ${card.host}`,
          doneDetail: `${card.checks.length} checks, score ${card.score}`,
          card,
          memo: `[Scanned ${card.host}: score ${card.score}/100; failed: ${card.checks.filter((c) => !c.ok).map((c) => c.label).join(", ") || "none"}]`,
          result: forModel,
        };
      } catch (e) {
        const msg = e instanceof ScanError ? e.message : "The website could not be scanned.";
        return { label, doneDetail: "could not reach it", result: `Scan failed: ${msg}`, isError: true };
      }
    }
    case "build_ai_roadmap": {
      const items = (Array.isArray(input.items) ? input.items : []).slice(0, 5).map((i) => {
        const o = i as Record<string, unknown>;
        return {
          title: clip(o.title, 80),
          detail: clip(o.detail, 280),
          impact: o.impact === "High" ? "High" : "Medium",
          effort: o.effort === "Low" || o.effort === "High" ? o.effort : "Medium",
        } as RoadmapItem;
      });
      const business = clip(input.business, 120);
      return {
        label,
        doneDetail: `${items.length} opportunities ranked`,
        card: { kind: "roadmap", business, items, firstStep: clip(input.first_step, 280) },
        memo: `[Showed AI roadmap for ${business}: ${items.map((i) => i.title).join("; ")}]`,
        result: "The roadmap card is now visible to the visitor.",
      };
    }
    case "plan_smart_home": {
      const devices = (Array.isArray(input.devices) ? input.devices : []).slice(0, 7).map((d) => {
        const o = d as Record<string, unknown>;
        return { type: clip(o.type, 60), why: clip(o.why, 200) };
      });
      const scenes = (Array.isArray(input.scenes) ? input.scenes : []).slice(0, 4).map((d) => {
        const o = d as Record<string, unknown>;
        return { name: clip(o.name, 40), what: clip(o.what, 200) };
      });
      const space = clip(input.space, 100);
      return {
        label,
        doneDetail: `${devices.length} devices, ${scenes.length} scenes`,
        card: { kind: "smarthome", space, devices, scenes },
        memo: `[Showed smart home plan for ${space}]`,
        result: "The smart home plan card is now visible to the visitor.",
      };
    }
    case "prepare_consultation_request": {
      const interests = (Array.isArray(input.interests) ? input.interests : []).filter((s): s is string => slugs.includes(s as string));
      return {
        label,
        doneDetail: "ready for you to review",
        card: {
          kind: "request",
          name: clip(input.name, 120),
          email: clip(input.email, 200),
          location: clip(input.location, 120),
          interests,
          brief: clip(input.brief, 1500),
        },
        memo: "[Showed a consultation request card for the visitor to review and send]",
        result: "The request card is visible. Nothing has been sent. The visitor must review it and press Send. Tell them that briefly.",
      };
    }
    case "open_page": {
      const path = SITE_PATHS.includes(input.path as (typeof SITE_PATHS)[number]) ? (input.path as string) : "/";
      return {
        label,
        card: { kind: "page", path, label: clip(input.label, 60) || "Open page" },
        memo: `[Offered a link to ${path}]`,
        result: "A button to the page is now visible.",
      };
    }
    default:
      return { label, result: "Unknown tool.", isError: true };
  }
}
