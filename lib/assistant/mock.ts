// Scripted stand-in for the live model, used only when ASSISTANT_MOCK=1.
// It runs the real tools (including the real website scanner) so the interface,
// the cards and the scanner can be tested without an API key.
import { runTool, stepLabel } from "./tools";
import type { ChatTurn, StreamEvent } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function* say(text: string): AsyncGenerator<StreamEvent> {
  for (const word of text.split(/(\s+)/)) {
    yield { t: "text", v: word };
    await sleep(12);
  }
}

async function* tool(name: string, input: Record<string, unknown>): AsyncGenerator<StreamEvent> {
  const id = `mock_${name}_${Math.random().toString(36).slice(2, 8)}`;
  yield { t: "step", id, label: stepLabel(name, input), status: "run" };
  await sleep(400);
  const out = await runTool(name, input);
  yield { t: "step", id, label: out.label, status: out.isError ? "error" : "done", detail: out.doneDetail };
  if (out.card) yield { t: "card", card: out.card };
  if (out.memo) yield { t: "memo", v: out.memo };
}

export async function* runMock(history: ChatTurn[]): AsyncGenerator<StreamEvent> {
  const last = history[history.length - 1]?.content ?? "";
  const lower = last.toLowerCase();
  const url = last.match(/(https?:\/\/[^\s]+|\b[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?(\/[^\s]*)?)/i)?.[0];

  if (url && !lower.includes("@")) {
    yield* say("Let me take a look at that site for you.\n\n");
    yield* tool("scan_website", { url });
    yield* say(
      "The biggest wins are usually the **clear next step** and **tap to call**: they decide whether a visitor becomes a customer. [Website updates and SEO](/services/website-updates-seo) covers fixes like these. Want me to prepare a consultation request?",
    );
    return;
  }
  if (/hola|habla|español|espanol/.test(lower)) {
    yield* say("¡Hola! Sí, puedo ayudarle en español. Libereux ayuda a negocios de todo el mundo a usar la IA. ¿A qué se dedica su negocio?");
    return;
  }
  if (/smart home|room|living|apartment|rental|house/.test(lower)) {
    yield* tool("plan_smart_home", {
      space: "Two-bedroom rental apartment",
      devices: [
        { type: "Smart lock with guest codes", why: "Guests check in without a key handover." },
        { type: "Smart thermostat", why: "Saves energy between stays." },
        { type: "Dimmable smart bulbs", why: "Welcoming lights on arrival." },
        { type: "Leak sensor under the sink", why: "Alerts you before damage spreads." },
      ],
      scenes: [
        { name: "Guest arriving", what: "Unlocks with the guest code, lights on warm, heating to 21°C." },
        { name: "Checked out", what: "Locks the door, lights off, eco temperature." },
      ],
    });
    yield* say("You would see before and after visuals of your own rooms in a consultation, and James sets it up with you on a screen share.");
    return;
  }
  if (/book|consult|call|james|quote|start/.test(lower)) {
    yield* tool("prepare_consultation_request", {
      name: "",
      email: "",
      location: "",
      interests: ["ai-strategy"],
      brief: "Visitor asked to book a consultation from the website assistant.",
    });
    yield* say("Fill in your details and press **Send**. Nothing goes out until you do, and James replies to confirm a time.");
    return;
  }
  if (/restaurant|salon|shop|business|time|roadmap|save/.test(lower)) {
    yield* tool("build_ai_roadmap", {
      business: "Small restaurant",
      items: [
        { title: "Assistant for bookings and questions", detail: "Answers hours, menu and table requests day and night.", impact: "High", effort: "Low" },
        { title: "Automatic review requests", detail: "Asks happy diners for a review the morning after.", impact: "Medium", effort: "Low" },
        { title: "Supplier order drafts", detail: "Turns a photo of your stock shelf into a draft order.", impact: "Medium", effort: "Medium" },
      ],
      first_step: "List the five questions customers ask most this week.",
    });
    yield* say("Number one usually pays for itself first. Want to talk it through with James?");
    return;
  }
  yield* say("I can review your website, draft an AI roadmap for your business, plan a smart home, or set up a free consultation with James. Here is what Libereux does:\n\n");
  yield* tool("show_services", { slugs: ["ai-strategy", "ai-implementation", "websites-and-apps"] });
}
