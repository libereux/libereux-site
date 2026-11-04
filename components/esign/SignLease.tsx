"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type Info = {
  title: string;
  property: string;
  pages: number;
  fingerprint: string;
  envelopeStatus: "in_progress" | "completed" | "voided";
  yourTurn: boolean;
  signer: { name: string; role: string; email: string; status: string; signedAt?: string };
  order: { name: string; role: string; signed: boolean; you: boolean }[];
};

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
  if (shown) return <p role="alert" className="esign-card">{shown} Questions? Call (678) 463-0804.</p>;
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
        <>
          <div className="esign-card">
            <h2>1. Read the lease</h2>
            <p>
              {info.pages} pages.{" "}
              <a href={pdfUrl} target="_blank" rel="noreferrer">
                Open it in a new tab
              </a>{" "}
              if it does not show below, or on a phone.
            </p>
            <iframe className="esign-pdf" src={pdfUrl} title="Lease document" />
          </div>
          <SignForm token={token} name={info.signer.name} fingerprint={info.fingerprint} onDone={setDone} />
        </>
      )}
    </div>
  );
}

function SignForm({ token, name, fingerprint, onDone }: { token: string; name: string; fingerprint: string; onDone: (d: { completed: boolean }) => void }) {
  const [typed, setTyped] = useState(name);
  const [reviewed, setReviewed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [hasInk, setHasInk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

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
    setHasInk(false);
  }, [mode]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <form
      className="esign-card"
      onSubmit={async (ev) => {
        ev.preventDefault();
        setErr("");
        if (mode === "draw" && !hasInk) return setErr("Draw your signature in the box, or choose Type it instead.");
        setBusy(true);
        const signature = mode === "draw" ? canvas.current!.toDataURL("image/png") : "";
        const r = await fetch("/api/esign/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ t: token, typedName: typed, signature, consent, reviewed }),
        });
        const j = await r.json().catch(() => ({}));
        setBusy(false);
        if (!r.ok) return setErr(j.error || "Something went wrong. Please try again.");
        onDone({ completed: !!j.completed });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <h2>2. Sign</h2>
      <label className="esign-field">
        <span>Your full legal name</span>
        <input required value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="name" />
      </label>

      <div className="btn-row" role="group" aria-label="How to sign">
        <button type="button" className={`btn ${mode === "draw" ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode("draw")}>
          Draw it
        </button>
        <button type="button" className={`btn ${mode === "type" ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode("type")}>
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
        When you press Sign, we record your name, email, the time, and your internet address with the lease. Document fingerprint (SHA-256):{" "}
        <code>{fingerprint.slice(0, 16)}…</code>
      </p>
      <button className="btn btn-primary" disabled={busy || !reviewed || !consent}>
        {busy ? "Signing…" : "Sign the lease"}
      </button>
      {err && (
        <p role="alert" className="esign-err">
          {err}
        </p>
      )}
    </form>
  );
}
