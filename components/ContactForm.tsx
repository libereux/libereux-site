"use client";

import { useEffect, useRef, useState } from "react";
import { site, tiers } from "@/lib/content";

type Status = { kind: "idle" | "sending" | "ok" | "err"; message?: string };

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const planRef = useRef<HTMLSelectElement>(null);

  // Preselect the plan when arriving from a "Start with ..." button.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("plan");
    if (p && planRef.current && tiers.some((t) => t.id === p)) planRef.current.value = p;
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error || "Request failed");
      form.reset();
      setStatus({
        kind: "ok",
        message: "Request sent. James will reply soon to set up your call.",
      });
    } catch (err) {
      setStatus({
        kind: "err",
        message: `Your request did not send. Email ${site.email} instead and we will reply soon.`,
      });
      console.error(err);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      <div className="field">
        <label htmlFor="name">Your name</label>
        <input id="name" name="name" autoComplete="name" required />
      </div>

      <div className="field">
        <label htmlFor="business">Business name</label>
        <input id="business" name="business" autoComplete="organization" />
      </div>

      <div className="field">
        <label htmlFor="type">Type of business</label>
        <select id="type" name="type" defaultValue="">
          <option value="" disabled>
            Choose one
          </option>
          <option>Restaurant or food</option>
          <option>Salon or barber</option>
          <option>Real estate</option>
          <option>Contractor or home services</option>
          <option>Something else</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="field">
        <label htmlFor="phone">Phone (optional)</label>
        <span className="hint" id="phone-hint">
          Add it if you would rather we call or text.
        </span>
        <input id="phone" name="phone" type="tel" autoComplete="tel" aria-describedby="phone-hint" />
      </div>

      <div className="field">
        <label htmlFor="plan">Plan you are interested in</label>
        <select id="plan" name="plan" ref={planRef} defaultValue="not-sure">
          <option value="not-sure">Not sure yet</option>
          {tiers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}, ${t.price}
            </option>
          ))}
          <option value="custom">Custom app or tool</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="message">What do you need?</label>
        <span className="hint" id="message-hint">
          A few sentences is plenty. Any language is fine.
        </span>
        <textarea id="message" name="message" aria-describedby="message-hint" />
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <button type="submit" className="btn btn-primary" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending request" : "Send request"}
        </button>
      </div>

      <div aria-live="polite">
        {status.kind === "ok" && <p className="form-status ok">{status.message}</p>}
        {status.kind === "err" && <p className="form-status err">{status.message}</p>}
      </div>
    </form>
  );
}
