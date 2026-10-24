import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt";
import { TOOLS, runTool, stepLabel } from "./tools";
import type { ChatTurn, StreamEvent } from "./types";

const MODEL = process.env.ASSISTANT_MODEL || "claude-sonnet-5-5";
const MAX_ROUNDS = 6;

// House rule: no em or en dashes anywhere, including generated text.
export const clean = (s: string) => s.replace(/\s*\u2014\s*/g, ", ").replace(/\u2013/g, "-");

export async function* runAgent(history: ChatTurn[], page: string): AsyncGenerator<StreamEvent> {
  const client = new Anthropic();
  const messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));

  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    { type: "text", text: `The visitor is currently on the page ${page}.` },
  ];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const queue: StreamEvent[] = [];
    let wake: (() => void) | null = null;
    const push = (e: StreamEvent) => {
      queue.push(e);
      wake?.();
    };

    const stream = client.messages.stream({ model: MODEL, max_tokens: 1400, system, tools: TOOLS, messages });
    stream.on("text", (delta) => push({ t: "text", v: clean(delta) }));
    let finished = false;
    let failure: unknown = null;
    const final = stream
      .finalMessage()
      .catch((e) => {
        failure = e;
        return null;
      })
      .finally(() => {
        finished = true;
        wake?.();
      });

    // Forward text deltas as they arrive.
    while (!finished || queue.length) {
      if (queue.length) {
        yield queue.shift()!;
        continue;
      }
      await new Promise<void>((r) => (wake = r));
      wake = null;
    }
    const msg = await final;
    if (failure || !msg) throw failure ?? new Error("No response");

    if (msg.stop_reason !== "tool_use") return;

    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const block of msg.content) {
      if (block.type !== "tool_use") continue;
      const input = (block.input ?? {}) as Record<string, unknown>;
      const id = block.id;
      yield { t: "step", id, label: stepLabel(block.name, input), status: "run" };
      const out = await runTool(block.name, input);
      yield { t: "step", id, label: out.label, status: out.isError ? "error" : "done", detail: out.doneDetail };
      if (out.card) yield { t: "card", card: out.card };
      if (out.memo) yield { t: "memo", v: out.memo };
      results.push({ type: "tool_result", tool_use_id: id, content: out.result, is_error: out.isError });
    }
    messages.push({ role: "assistant", content: msg.content });
    messages.push({ role: "user", content: results });
  }
}
