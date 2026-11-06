"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Mode = "subscribe" | "unsubscribe";
type Status = { kind: "idle" | "sending" | "ok" | "err"; message?: string };

// Posts to the static file in public/__forms.html so Netlify Forms records the entry.
// The weekly newsletter task reads the "ai-money-map-subscribe" and "ai-money-map-unsubscribe" forms by name.
export default function NewsletterForm({ mode = "subscribe", source = "ai-money-map" }: { mode?: Mode; source?: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode !== "unsubscribe") return;
    const q = new URLSearchParams(window.location.search).get("email");
    if (q && emailRef.current && !emailRef.current.value) emailRef.current.value = q.slice(0, 254);
  }, [mode]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = new URLSearchParams();
    body.set("form-name", mode === "subscribe" ? "ai-money-map-subscribe" : "ai-money-map-unsubscribe");
    fd.forEach((v, k) => body.set(k, String(v)));
    if (mode === "subscribe") body.set("source", source);
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus({
        kind: "ok",
        message:
          mode === "subscribe"
            ? "You're in. Your first AI Money Map arrives this Friday from holdings@libereux.com. Add that address to your contacts so it reaches your inbox."
            : "Done. You will not get any more AI Money Map emails.",
      });
    } catch {
      setStatus({ kind: "err", message: "That did not go through. Please try again, or email holdings@libereux.com." });
    }
  }

  return (
    // data-form-name puts the Netlify form name in the page HTML; the weekly Money Map task looks for it there.
    <form className="form" onSubmit={onSubmit} data-form-name={mode === "subscribe" ? "ai-money-map-subscribe" : "ai-money-map-unsubscribe"}>
      <div className="field">
        <label htmlFor={`nl-email-${mode}`}>Your email</label>
        <input
          id={`nl-email-${mode}`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          ref={emailRef}
        />
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor={`nl-company-${mode}`}>Leave this empty</label>
        <input id={`nl-company-${mode}`} name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {mode === "subscribe" && (
        <p className="consent">
          <label>
            <input type="checkbox" name="consent" value="yes" required />{" "}
            Send me the free weekly AI Money Map and occasional news from Libereux Digital Solutions. I can
            unsubscribe any time. See our <Link href="/privacy">privacy policy</Link>.
          </label>
        </p>
      )}

      <div>
        <button type="submit" className="btn btn-primary" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending" : mode === "subscribe" ? "Subscribe free" : "Unsubscribe"}
        </button>
      </div>

      <div aria-live="polite">
        {status.kind === "ok" && <p className="form-status ok">{status.message}</p>}
        {status.kind === "err" && <p className="form-status err">{status.message}</p>}
      </div>
    </form>
  );
}
