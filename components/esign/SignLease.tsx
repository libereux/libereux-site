"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import PdfPages from "./PdfPages";

type FieldType = "signature" | "initials" | "date" | "name" | "text" | "number" | "checkbox";
type SignField = {
  id: string;
  type: FieldType;
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  required: boolean;
  label?: string;
  mine: boolean;
  filled?: string;
};
type Info = {
  title: string;
  property: string;
  pages: number;
  fingerprint: string;
  envelopeStatus: "draft" | "in_progress" | "completed" | "voided";
  yourTurn: boolean;
  signer: { name: string; role: string; email: string; status: string; signedAt?: string };
  order: { name: string; role: string; signed: boolean; you: boolean }[];
  fields: SignField[];
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase())
    .join("")
    .slice(0, 4);

const today = () =>
  new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "2-digit", day: "2-digit", year: "numeric" }).format(new Date());

export default function SignLease() {
  const token = useSearchParams().get("t") || "";
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { completed: boolean }>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/esign/sign?t=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Could not load.");
        setInfo(j);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  const shown = token ? error : "This page needs the link from your email.";
  if (shown)
    return (
      <p role="alert" className="esign-card">
        {shown} Questions? Call (678) 463-0804.
      </p>
    );
  if (!info) return <p className="muted">Loading your lease…</p>;

  const pdfUrl = `/api/esign/sign/pdf?t=${encodeURIComponent(token)}`;

  if (done) {
    return (
      <div className="esign-card">
        <h2>Thank you, you have signed.</h2>
        <p>
          {done.completed
            ? "Everyone has now signed. A completed copy is on its way to your email."
            : "We have emailed the next person in the signing order. You will get the completed copy by email once everyone has signed."}
        </p>
      </div>
    );
  }

  return (
    <div className="esign">
      <div className="esign-card">
        <p className="muted">
          {info.signer.role}: {info.signer.name}
        </p>
        <h2>{info.title}</h2>
        <p>{info.property}</p>
        <ol className="esign-order">
          {info.order.map((o, i) => (
            <li key={i} className={o.signed ? "is-signed" : o.you ? "is-current" : ""}>
              {o.role}: {o.name} {o.signed ? "· Signed" : o.you ? "· You" : ""}
            </li>
          ))}
        </ol>
      </div>

      {info.envelopeStatus === "completed" ? (
        <div className="esign-card">
          <h2>This lease is fully signed.</h2>
          <p>
            <a className="btn btn-primary" href={`${pdfUrl}&kind=signed`} target="_blank" rel="noreferrer">
              Open the signed copy
            </a>
          </p>
        </div>
      ) : info.envelopeStatus === "voided" ? (
        <p className="esign-card">This lease was withdrawn and can no longer be signed. Please contact us at (678) 463-0804.</p>
      ) : info.signer.status === "signed" ? (
        <p className="esign-card">You have signed. We will email you the completed copy once everyone has signed.</p>
      ) : !info.yourTurn ? (
        <p className="esign-card">It is not your turn to sign yet. We will email you when it is.</p>
      ) : (
        <Signing info={info} token={token} pdfUrl={pdfUrl} onDone={setDone} />
      )}
    </div>
  );
}

function Signing({ info, token, pdfUrl, onDone }: { info: Info; token: string; pdfUrl: string; onDone: (d: { completed: boolean }) => void }) {
  const mine = useMemo(() => info.fields.filter((f) => f.mine).sort((a, b) => a.page - b.page || a.y - b.y || a.x - b.x), [info.fields]);
  const others = info.fields.filter((f) => !f.mine);
  const [typed, setTyped] = useState(info.signer.name);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [drawn, setDrawn] = useState(""); // data URL once adopted
  const [adopted, setAdopted] = useState(false);
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [reviewed, setReviewed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [flash, setFlash] = useState("");

  const isDone = (f: SignField) => {
    if (f.type === "signature" || f.type === "initials") return !!applied[f.id];
    if (f.type === "date" || f.type === "name") return true;
    if (f.type === "checkbox") return !f.required || values[f.id] === true;
    return !f.required || String(values[f.id] ?? "").trim() !== "";
  };
  const remaining = mine.filter((f) => !isDone(f));

  const goNext = () => {
    const next = remaining[0];
    if (!next) return;
    if (!adopted && (next.type === "signature" || next.type === "initials")) {
      document.getElementById("adopt")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const el = document.getElementById(`f-${next.id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    // On a phone the boxes are small, so this button also signs the next signature or initials box.
    if (next.type === "signature" || next.type === "initials") setApplied((a) => ({ ...a, [next.id]: true }));
    setFlash(next.id);
    setTimeout(() => setFlash(""), 1600);
    el?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
  };

  const sigPreview = (f: SignField) =>
    f.type === "initials" ? (
      <span className="esign-script">{initialsOf(typed)}</span>
    ) : drawn ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={drawn} alt={`Signature of ${typed}`} />
    ) : (
      <span className="esign-script">{typed}</span>
    );

  return (
    <>
      <Adopt
        typed={typed}
        setTyped={(v) => {
          setTyped(v);
          setAdopted(false);
          setApplied({});
        }}
        mode={mode}
        setMode={setMode}
        adopted={adopted}
        onAdopt={(dataUrl) => {
          setDrawn(dataUrl);
          setAdopted(true);
          setErr("");
        }}
        onChange={() => {
          setAdopted(false);
          setApplied({});
        }}
      />

      {mine.length > 0 && (
        <div className="esign-progress" role="status">
          <span>{remaining.length === 0 ? "All your boxes are done." : `${remaining.length} of ${mine.length} boxes left for you.`}</span>
          {remaining.length > 0 && (
            <button type="button" className="btn btn-primary" onClick={goNext}>
              {remaining[0] && (remaining[0].type === "signature" || remaining[0].type === "initials") && adopted ? "Sign next box" : "Go to next box"}
            </button>
          )}
        </div>
      )}

      <div className="esign-card">
        <h2>{mine.length ? "2. Read the lease and fill your boxes" : "2. Read the lease"}</h2>
        <p className="muted">
          {info.pages} pages. Your boxes are outlined in orange.{" "}
          <a href={pdfUrl} target="_blank" rel="noreferrer">
            Open the PDF in a new tab
          </a>
        </p>
        <PdfPages
          url={pdfUrl}
          overlay={(page) => (
            <>
              {others
                .filter((f) => f.page === page && f.filled)
                .map((f) => (
                  <div
                    key={f.id}
                    className="esign-filled"
                    style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%`, width: `${f.w * 100}%`, height: `${f.h * 100}%` }}
                  >
                    {f.filled}
                  </div>
                ))}
              {mine
                .filter((f) => f.page === page)
                .map((f) => (
                  <div
                    key={f.id}
                    id={`f-${f.id}`}
                    className={`esign-sbox esign-t-${f.type} ${isDone(f) ? "is-done" : ""} ${flash === f.id ? "is-flash" : ""}`}
                    style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%`, width: `${f.w * 100}%`, height: `${f.h * 100}%` }}
                  >
                    {f.type === "signature" || f.type === "initials" ? (
                      applied[f.id] ? (
                        <button type="button" className="esign-sig-applied" title="Tap to remove" onClick={() => setApplied((a) => ({ ...a, [f.id]: false }))}>
                          {sigPreview(f)}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="esign-sig-btn"
                          onClick={() => {
                            if (!adopted) {
                              setErr("First set up your signature at the top, then tap the boxes.");
                              document.getElementById("adopt")?.scrollIntoView({ behavior: "smooth", block: "center" });
                              return;
                            }
                            setApplied((a) => ({ ...a, [f.id]: true }));
                          }}
                        >
                          {f.type === "signature" ? "Sign here" : "Initial"}
                        </button>
                      )
                    ) : f.type === "date" ? (
                      <span className="esign-auto">{today()}</span>
                    ) : f.type === "name" ? (
                      <span className="esign-auto">{typed}</span>
                    ) : f.type === "checkbox" ? (
                      <input
                        type="checkbox"
                        aria-label={f.label || "Checkbox"}
                        checked={values[f.id] === true}
                        onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.checked }))}
                      />
                    ) : (
                      <input
                        aria-label={f.label || (f.type === "number" ? "Number" : "Text")}
                        placeholder={f.label || (f.type === "number" ? "Number" : "Type here")}
                        inputMode={f.type === "number" ? "decimal" : undefined}
                        value={String(values[f.id] ?? "")}
                        onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
            </>
          )}
        />
      </div>

      <form
        className="esign-card"
        onSubmit={async (ev) => {
          ev.preventDefault();
          setErr("");
          if (!adopted) return setErr("Set up your signature at the top first.");
          if (remaining.length) {
            goNext();
            return setErr(`You still have ${remaining.length} box${remaining.length === 1 ? "" : "es"} to complete.`);
          }
          setBusy(true);
          const r = await fetch("/api/esign/sign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ t: token, typedName: typed, signature: mode === "draw" ? drawn : "", values, consent, reviewed }),
          });
          const j = await r.json().catch(() => ({}));
          setBusy(false);
          if (!r.ok) return setErr(j.error || "Something went wrong. Please try again.");
          onDone({ completed: !!j.completed });
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <h2>3. Finish</h2>
        <label className="esign-check">
          <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} />
          <span>I have read the whole lease and agree to its terms.</span>
        </label>
        <label className="esign-check">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            I agree to sign electronically and receive this lease electronically. My electronic signature has the same legal effect as
            signing on paper. I can ask for a paper copy at any time by emailing holdings@libereux.com.
          </span>
        </label>
        <p className="muted esign-fine">
          When you press Finish, we record your name, email, the time, and your internet address with the lease. Document fingerprint (SHA-256):{" "}
          <code>{info.fingerprint.slice(0, 16)}…</code>
        </p>
        <button className="btn btn-primary" disabled={busy || !reviewed || !consent}>
          {busy ? "Signing…" : "Finish and sign"}
        </button>
        {err && (
          <p role="alert" className="esign-err">
            {err}
          </p>
        )}
      </form>
    </>
  );
}

function Adopt({
  typed,
  setTyped,
  mode,
  setMode,
  adopted,
  onAdopt,
  onChange,
}: {
  typed: string;
  setTyped: (v: string) => void;
  mode: "draw" | "type";
  setMode: (m: "draw" | "type") => void;
  adopted: boolean;
  onAdopt: (dataUrl: string) => void;
  onChange: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const c = canvas.current;
    if (!c || mode !== "draw") return;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.clientWidth * ratio;
    c.height = c.clientHeight * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1b2a4a";
  }, [mode]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <div className="esign-card" id="adopt">
      <h2>1. Set up your signature</h2>
      <label className="esign-field">
        <span>Your full legal name</span>
        <input required value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="name" />
      </label>
      <div className="btn-row" role="group" aria-label="How to sign">
        <button
          type="button"
          className={`btn ${mode === "draw" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => {
            setMode("draw");
            setHasInk(false);
            onChange();
          }}
        >
          Draw it
        </button>
        <button
          type="button"
          className={`btn ${mode === "type" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => {
            setMode("type");
            onChange();
          }}
        >
          Type it
        </button>
      </div>
      {mode === "draw" ? (
        <div>
          <canvas
            ref={canvas}
            className="esign-canvas"
            aria-label="Signature pad. Draw your signature with your finger or mouse."
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drawing.current = true;
              const ctx = e.currentTarget.getContext("2d")!;
              const p = pos(e);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              if (adopted) onChange();
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              const ctx = e.currentTarget.getContext("2d")!;
              const p = pos(e);
              ctx.lineTo(p.x, p.y);
              ctx.stroke();
              setHasInk(true);
            }}
            onPointerUp={() => (drawing.current = false)}
            onPointerLeave={() => (drawing.current = false)}
          />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              const c = canvas.current!;
              c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
              setHasInk(false);
              onChange();
            }}
          >
            Clear
          </button>
        </div>
      ) : (
        <p className="esign-typed" aria-label="Typed signature preview">
          {typed}
        </p>
      )}
      <p className="muted">Initials: {initialsOf(typed) || "?"}</p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          if (typed.trim().length < 2) return setErr("Type your full name.");
          if (mode === "draw" && !hasInk) return setErr("Draw your signature in the box, or choose Type it.");
          setErr("");
          onAdopt(mode === "draw" ? canvas.current!.toDataURL("image/png") : "");
        }}
      >
        {adopted ? "Signature ready ✓" : "Use this signature"}
      </button>
      {adopted && <p className="esign-ok">Now tap each orange &ldquo;Sign here&rdquo; box on the lease below.</p>}
      {err && (
        <p role="alert" className="esign-err">
          {err}
        </p>
      )}
    </div>
  );
}
