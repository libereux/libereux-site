"use client";

// Place signature, initials, date, name, text, number and checkbox boxes on the lease,
// one colour per signer, before it goes out. Saves as you go.
import { useCallback, useEffect, useRef, useState } from "react";
import PdfPages from "./PdfPages";

type FieldType = "signature" | "initials" | "date" | "name" | "text" | "number" | "checkbox";
type Field = { id: string; signer: number; type: FieldType; page: number; x: number; y: number; w: number; h: number; required: boolean; label?: string };
type Draft = { id: string; title: string; property: string; status: string; pages: number; fields: Field[]; signers: { name: string; email: string; role: string }[] };

export const SIGNER_COLORS = ["#FF6B35", "#2563EB", "#16A34A", "#9333EA", "#DB2777", "#0891B2", "#CA8A04", "#4B5563"];

const TOOLS: { type: FieldType; label: string; w: number; h: number; hint: string }[] = [
  { type: "signature", label: "Signature", w: 0.26, h: 0.045, hint: "Where they sign" },
  { type: "initials", label: "Initials", w: 0.08, h: 0.035, hint: "Initial a page or clause" },
  { type: "date", label: "Date signed", w: 0.15, h: 0.024, hint: "Filled in automatically" },
  { type: "name", label: "Full name", w: 0.24, h: 0.024, hint: "Filled from the name they type" },
  { type: "text", label: "Text", w: 0.24, h: 0.024, hint: "They type something" },
  { type: "number", label: "Number", w: 0.12, h: 0.024, hint: "Numbers only" },
  { type: "checkbox", label: "Checkbox", w: 0.022, h: 0.017, hint: "They tick a box" },
];
const toolFor = (t: FieldType) => TOOLS.find((x) => x.type === t)!;
const uid = () => Math.random().toString(36).slice(2, 10);

export default function FieldEditor({ id, onClose }: { id: string; onClose: (sent: boolean) => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [signer, setSigner] = useState(0);
  const [tool, setTool] = useState<FieldType | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [save, setSave] = useState<"saved" | "saving" | "unsaved" | "error">("saved");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<Field[]>([]);

  useEffect(() => {
    fetch(`/api/esign/envelope?id=${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Draft) => {
        setDraft(d);
        setFields(d.fields || []);
        latest.current = d.fields || [];
      });
  }, [id]);

  const persist = useCallback(
    async (list: Field[]) => {
      setSave("saving");
      const r = await fetch("/api/esign/envelope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "fields", fields: list }),
      }).catch(() => null);
      setSave(r && r.ok ? "saved" : "error");
    },
    [id],
  );

  const change = (next: Field[] | ((f: Field[]) => Field[])) => {
    setFields((prev) => {
      const list = typeof next === "function" ? next(prev) : next;
      latest.current = list;
      setSave("unsaved");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => persist(latest.current), 700);
      return list;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTool(null);
        setSelected(null);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selected && !(e.target instanceof HTMLInputElement)) {
        change((f) => f.filter((x) => x.id !== selected));
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!draft) return <p className="muted">Loading the lease…</p>;

  const sel = fields.find((f) => f.id === selected) || null;
  const counts = draft.signers.map((_, i) => fields.filter((f) => f.signer === i).length);
  const missing = draft.signers.filter((_, i) => !fields.some((f) => f.signer === i && f.type === "signature"));

  const place = (page: number, x: number, y: number) => {
    if (!tool) {
      setSelected(null);
      return;
    }
    const t = toolFor(tool);
    const f: Field = {
      id: uid(),
      signer,
      type: tool,
      page,
      w: t.w,
      h: t.h,
      x: Math.min(Math.max(0, x - t.w / 2), 1 - t.w),
      y: Math.min(Math.max(0, y - t.h / 2), 1 - t.h),
      required: tool !== "checkbox",
    };
    change((list) => [...list, f]);
    setSelected(f.id);
    setTool(null);
  };

  const send = async () => {
    if (missing.length) return setMsg({ ok: false, text: `Add a signature box for ${missing.map((s) => s.name).join(", ")}.` });
    if (!confirm(`Send "${draft.title}" now?\n\n${draft.signers.map((s, i) => `${i + 1}. ${s.role}: ${s.name} (${counts[i]} boxes)`).join("\n")}\n\n${draft.signers[0].name} gets the email right away.`)) return;
    if (timer.current) clearTimeout(timer.current);
    setSending(true);
    setMsg(null);
    const r = await fetch("/api/esign/envelope", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "send", fields: latest.current }),
    });
    const j = await r.json().catch(() => ({}));
    setSending(false);
    if (!r.ok) return setMsg({ ok: false, text: j.error || "Could not send." });
    onClose(true);
  };

  return (
    <div className="esign-editor">
      <div className="esign-toolbar">
        <div className="esign-toolbar-row">
          <strong>{draft.title}</strong>
          <span className="muted">{save === "saving" ? "Saving…" : save === "unsaved" ? "Unsaved" : save === "error" ? "Not saved, check connection" : "Saved"}</span>
        </div>
        <div className="esign-toolbar-row" role="group" aria-label="Whose box">
          <span className="esign-step">1. Whose box?</span>
          {draft.signers.map((s, i) => (
            <button
              key={i}
              type="button"
              className={`esign-chip ${signer === i ? "is-on" : ""}`}
              style={{ ["--c" as string]: SIGNER_COLORS[i % SIGNER_COLORS.length] }}
              onClick={() => setSigner(i)}
            >
              {s.role}: {s.name} <span className="esign-count">{counts[i]}</span>
            </button>
          ))}
        </div>
        <div className="esign-toolbar-row" role="group" aria-label="Box type">
          <span className="esign-step">2. Pick a box, then click the page</span>
          {TOOLS.map((t) => (
            <button key={t.type} type="button" title={t.hint} className={`esign-tool ${tool === t.type ? "is-on" : ""}`} onClick={() => setTool(tool === t.type ? null : t.type)}>
              {t.label}
            </button>
          ))}
        </div>
        {tool && (
          <p className="esign-hint" role="status">
            Click on the page where {draft.signers[signer].name}&apos;s {toolFor(tool).label.toLowerCase()} should go. Press Esc to cancel.
          </p>
        )}
        {sel && (
          <div className="esign-toolbar-row esign-props">
            <span className="esign-step">Selected {toolFor(sel.type).label}</span>
            <label>
              For{" "}
              <select value={sel.signer} onChange={(e) => change((l) => l.map((f) => (f.id === sel.id ? { ...f, signer: Number(e.target.value) } : f)))}>
                {draft.signers.map((s, i) => (
                  <option key={i} value={i}>
                    {s.role}: {s.name}
                  </option>
                ))}
              </select>
            </label>
            {(sel.type === "text" || sel.type === "number" || sel.type === "checkbox") && (
              <>
                <label>
                  Label{" "}
                  <input
                    value={sel.label || ""}
                    placeholder={sel.type === "checkbox" ? "e.g. I agree to the pet policy" : "e.g. Phone number"}
                    onChange={(e) => change((l) => l.map((f) => (f.id === sel.id ? { ...f, label: e.target.value } : f)))}
                  />
                </label>
                <label className="esign-inline">
                  <input type="checkbox" checked={sel.required} onChange={(e) => change((l) => l.map((f) => (f.id === sel.id ? { ...f, required: e.target.checked } : f)))} /> Required
                </label>
              </>
            )}
            <button
              type="button"
              className="esign-tool"
              onClick={() => {
                const copy = { ...sel, id: uid(), y: Math.min(sel.y + sel.h + 0.01, 1 - sel.h) };
                change((l) => [...l, copy]);
                setSelected(copy.id);
              }}
            >
              Duplicate
            </button>
            <button
              type="button"
              className="esign-tool esign-danger"
              onClick={() => {
                change((l) => l.filter((f) => f.id !== sel.id));
                setSelected(null);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className={tool ? "esign-placing" : ""}>
        <PdfPages
          url={`/api/esign/file?id=${id}&kind=original`}
          onPageClick={place}
          overlay={(page) =>
            fields
              .filter((f) => f.page === page)
              .map((f) => (
                <PlacedField
                  key={f.id}
                  field={f}
                  color={SIGNER_COLORS[f.signer % SIGNER_COLORS.length]}
                  who={draft.signers[f.signer]?.name || ""}
                  selected={selected === f.id}
                  onSelect={() => setSelected(f.id)}
                  onChange={(next) => change((l) => l.map((x) => (x.id === f.id ? next : x)))}
                />
              ))
          }
        />
      </div>

      <div className="esign-sendbar">
        {missing.length > 0 ? (
          <p className="muted">Still needs a signature box: {missing.map((s) => s.name).join(", ")}</p>
        ) : (
          <p className="muted">Every signer has a signature box.</p>
        )}
        <div className="btn-row">
          <button type="button" className="btn btn-ghost" onClick={() => onClose(false)}>
            Finish later
          </button>
          <button type="button" className="btn btn-primary" disabled={sending} onClick={send}>
            {sending ? "Sending…" : "Send for signature"}
          </button>
        </div>
        {msg && (
          <p role="alert" className={msg.ok ? "esign-ok" : "esign-err"}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}

function PlacedField({
  field,
  color,
  who,
  selected,
  onSelect,
  onChange,
}: {
  field: Field;
  color: string;
  who: string;
  selected: boolean;
  onSelect: () => void;
  onChange: (f: Field) => void;
}) {
  const drag = useRef<{ mode: "move" | "size"; sx: number; sy: number; f: Field; pw: number; ph: number } | null>(null);

  const begin = (mode: "move" | "size", e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    const layer = (e.currentTarget as HTMLElement).closest(".esign-layer")!.getBoundingClientRect();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { mode, sx: e.clientX, sy: e.clientY, f: field, pw: layer.width, ph: layer.height };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.sx) / d.pw;
    const dy = (e.clientY - d.sy) / d.ph;
    if (d.mode === "move") {
      onChange({ ...d.f, x: Math.min(Math.max(0, d.f.x + dx), 1 - d.f.w), y: Math.min(Math.max(0, d.f.y + dy), 1 - d.f.h) });
    } else {
      onChange({ ...d.f, w: Math.min(Math.max(0.015, d.f.w + dx), 1 - d.f.x), h: Math.min(Math.max(0.01, d.f.h + dy), 1 - d.f.y) });
    }
  };
  const end = () => (drag.current = null);

  return (
    <div
      className={`esign-box ${selected ? "is-selected" : ""}`}
      style={{ left: `${field.x * 100}%`, top: `${field.y * 100}%`, width: `${field.w * 100}%`, height: `${field.h * 100}%`, ["--c" as string]: color }}
      onPointerDown={(e) => begin("move", e)}
      onPointerMove={move}
      onPointerUp={end}
      onClick={(e) => e.stopPropagation()}
      title={`${toolFor(field.type).label} for ${who}. Drag to move.`}
    >
      <span className="esign-box-label">
        {field.type === "checkbox" ? "" : field.label || toolFor(field.type).label}
        {field.type !== "checkbox" && field.required ? " *" : ""}
      </span>
      <span className="esign-handle" onPointerDown={(e) => begin("size", e)} onPointerMove={move} onPointerUp={end} aria-hidden="true" />
    </div>
  );
}
