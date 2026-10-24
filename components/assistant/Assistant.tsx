"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CardView } from "./Cards";
import type { Card, ChatTurn, StreamEvent } from "@/lib/assistant/types";

type Part =
  | { type: "text"; text: string }
  | { type: "step"; id: string; label: string; status: "run" | "done" | "error"; detail?: string }
  | { type: "card"; card: Card }
  | { type: "notice"; text: string; offline?: boolean };

type Msg = { role: "user"; text: string } | { role: "assistant"; parts: Part[]; memos: string[]; streaming: boolean };

type Ctx = { open: (prompt?: string) => void; close: () => void; isOpen: boolean };
const AssistantContext = createContext<Ctx>({ open: () => {}, close: () => {}, isOpen: false });
export const useAssistant = () => useContext(AssistantContext);

export const STARTERS = [
  { label: "Review my website", prompt: "Can you review my website? It's " },
  { label: "Where could AI save me time?", prompt: "Where could AI save me time? I run a " },
  { label: "Plan a smart home", prompt: "Help me plan a smart home for my " },
  { label: "What does Libereux do?", prompt: "What does Libereux do?" },
  { label: "¿Hablas español?", prompt: "Hola, ¿puedes ayudarme en español?" },
  { label: "Book a free consultation", prompt: "I'd like to book a free consultation with James." },
];

// A prompt ending in a space is a sentence for the visitor to finish, so it goes in the
// input instead of being sent straight away.
const needsFinishing = (p: string) => /\s$/.test(p);

/* ---------- tiny, safe text formatting: paragraphs, lists, bold, internal links ---------- */
function inline(text: string, onNavigate: () => void) {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((\/[^)\s]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={m.index}>{m[1]}</strong>);
    else
      out.push(
        <Link key={m.index} href={m[3]} onClick={onNavigate}>
          {m[2]}
        </Link>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Formatted({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*([-*]|\d+\.)\s+/.test(l))) {
          const ordered = /^\s*\d+\./.test(lines[0]);
          const items = lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*([-*]|\d+\.)\s+/, ""), onNavigate)}</li>);
          return ordered ? <ol key={i}>{items}</ol> : <ul key={i}>{items}</ul>;
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {inline(l, onNavigate)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

/* ---------- provider, launcher and panel ---------- */
export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const pathname = usePathname();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const msgsRef = useRef<Msg[]>([]);
  useEffect(() => {
    msgsRef.current = msgs;
  }, [msgs]);

  const close = useCallback(() => setOpen(false), []);

  const update = (fn: (m: Extract<Msg, { role: "assistant" }>) => void) =>
    setMsgs((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (!last || last.role !== "assistant") return prev;
      const next = { ...last, parts: [...last.parts], memos: [...last.memos] };
      fn(next);
      copy[copy.length - 1] = next;
      return copy;
    });

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      setBusy(true);
      setDraft("");

      const history: ChatTurn[] = [];
      for (const m of msgsRef.current) {
        if (m.role === "user") history.push({ role: "user", content: m.text });
        else {
          const content = [m.parts.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join(""), ...m.memos]
            .join("\n")
            .trim();
          if (content) history.push({ role: "assistant", content });
        }
      }
      history.push({ role: "user", content: q });

      setMsgs((prev) => [...prev, { role: "user", text: q }, { role: "assistant", parts: [], memos: [], streaming: true }]);

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, page: pathname }),
        });
        if (!res.ok || !res.body) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          const offline = body.error === "offline";
          update((m) => {
            m.parts.push({
              type: "notice",
              offline,
              text: offline
                ? "The live assistant is switched off right now. You can still book a free consultation, and James will reply personally."
                : body.error === "busy"
                  ? "You have reached the hourly limit for the assistant. Please try again later, or book a consultation directly."
                  : "Something went wrong. Please try again.",
            });
          });
          return;
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const e = JSON.parse(line) as StreamEvent;
            update((m) => {
              const last = m.parts[m.parts.length - 1];
              if (e.t === "text") {
                if (last?.type === "text") m.parts[m.parts.length - 1] = { type: "text", text: last.text + e.v };
                else m.parts.push({ type: "text", text: e.v });
              } else if (e.t === "step") {
                const i = m.parts.findIndex((p) => p.type === "step" && p.id === e.id);
                const step: Part = { type: "step", id: e.id, label: e.label, status: e.status, detail: e.detail };
                if (i >= 0) m.parts[i] = step;
                else m.parts.push(step);
              } else if (e.t === "card") m.parts.push({ type: "card", card: e.card });
              else if (e.t === "memo") m.memos.push(e.v);
              else if (e.t === "error") m.parts.push({ type: "notice", text: `${e.v} Please try again.` });
            });
          }
        }
      } catch {
        update((m) => m.parts.push({ type: "notice", text: "The connection dropped. Please try again." }));
      } finally {
        update((m) => {
          m.streaming = false;
        });
        setBusy(false);
      }
    },
    [busy, pathname],
  );

  const open = useCallback(
    (prompt?: string) => {
      setOpen(true);
      if (prompt) {
        if (needsFinishing(prompt)) {
          setDraft(prompt);
          setTimeout(() => {
            const el = inputRef.current;
            if (el) {
              el.focus();
              el.setSelectionRange(el.value.length, el.value.length);
            }
          }, 60);
        } else {
          void send(prompt);
        }
      } else setTimeout(() => inputRef.current?.focus(), 60);
    },
    [send],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  // Hide the floating button while an on-page ask bar is visible, so the two never overlap.
  const [bar, setBar] = useState({ path: "", visible: false });
  const barVisible = bar.path === pathname && bar.visible;
  useEffect(() => {
    const el = document.querySelector(".askbar");
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setBar({ path: pathname, visible: entry.isIntersecting }), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [pathname]);

  const onNavigate = () => {
    if (window.matchMedia("(max-width: 720px)").matches) setOpen(false);
  };

  return (
    <AssistantContext.Provider value={{ open, close, isOpen }}>
      {children}

      {!isOpen && !barVisible && (
        <button type="button" className="ai-launch" onClick={() => open()} aria-haspopup="dialog">
          <span className="ai-dot" aria-hidden="true" />
          Ask Libereux AI
        </button>
      )}

      {isOpen && (
        <section className="ai-panel" role="dialog" aria-modal="false" aria-labelledby="ai-title">
          <header className="ai-head">
            <div>
              <h2 id="ai-title">Libereux assistant</h2>
              <p>
                <span className="ai-dot" aria-hidden="true" /> Live AI. Shows every step it takes.
              </p>
            </div>
            <div className="ai-head-actions">
            {msgs.length > 0 && !busy && (
              <button type="button" className="ai-new" onClick={() => setMsgs([])}>
                New chat
              </button>
            )}
            <button type="button" className="ai-x" onClick={close} aria-label="Close assistant">
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
            </div>
          </header>

          <div className="ai-list" ref={listRef} aria-live="polite" aria-busy={busy}>
            {msgs.length === 0 && (
              <div className="ai-intro">
                <p className="ai-hello">
                  Hi, I am the assistant on this site, and a working example of what Libereux builds for businesses.
                </p>
                <p className="ai-sub">I can review your website, draft an AI plan for your business, plan a smart home, or set up your free consultation. In your language.</p>
                <div className="ai-starters">
                  {STARTERS.map((s) => (
                    <button key={s.label} type="button" className="chip" onClick={() => open(s.prompt)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ai-user">
                  {m.text}
                </div>
              ) : (
                <div key={i} className="ai-bot">
                  {m.parts.map((p, j) => {
                    if (p.type === "text")
                      return (
                        <div key={j} className="ai-text">
                          <Formatted text={p.text} onNavigate={onNavigate} />
                        </div>
                      );
                    if (p.type === "step")
                      return (
                        <div key={j} className={`ai-step ai-step-${p.status}`}>
                          <span className="ai-step-icon" aria-hidden="true" />
                          <span>
                            {p.label}
                            {p.detail ? `, ${p.detail}` : p.status === "run" ? "..." : ""}
                          </span>
                        </div>
                      );
                    if (p.type === "card") return <CardView key={j} card={p.card} onNavigate={onNavigate} />;
                    return (
                      <div key={j} className="ai-notice">
                        <p>{p.text}</p>
                        {p.offline && (
                          <Link href="/contact" className="btn btn-primary" onClick={onNavigate}>
                            Book a free consultation
                          </Link>
                        )}
                      </div>
                    );
                  })}
                  {m.streaming && m.parts.length === 0 && (
                    <span className="typing" aria-label="Thinking">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                </div>
              ),
            )}
          </div>

          <form
            className="ai-form"
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(draft);
                }
              }}
              placeholder="Ask anything, or paste your website address"
              rows={1}
              maxLength={2000}
              aria-label="Message the assistant"
            />
            <button type="submit" className="ai-send" disabled={busy || !draft.trim()} aria-label="Send message">
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
          <p className="ai-fine">
            AI can make mistakes. Please do not share passwords or payment details. <Link href="/privacy" onClick={onNavigate}>Privacy</Link>
          </p>
        </section>
      )}
    </AssistantContext.Provider>
  );
}

/* ---------- entry points used around the site ---------- */
export function AskBar() {
  const { open } = useAssistant();
  const [q, setQ] = useState("");
  return (
    <div className="askbar">
      <form
        className="askbar-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) {
            open(q.trim());
            setQ("");
          } else open();
        }}
      >
        <span className="ai-dot" aria-hidden="true" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask our AI anything"
          aria-label="Ask the Libereux assistant"
          maxLength={2000}
        />
        <button type="submit" className="btn btn-primary">
          Ask
        </button>
      </form>
      <div className="askbar-chips">
        {STARTERS.slice(0, 3).map((s) => (
          <button key={s.label} type="button" className="chip" onClick={() => open(s.prompt)}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AskButton({ prompt, children, className = "btn btn-primary" }: { prompt?: string; children: React.ReactNode; className?: string }) {
  const { open } = useAssistant();
  return (
    <button type="button" className={className} onClick={() => open(prompt)}>
      {children}
    </button>
  );
}
