"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { services, site } from "@/lib/content";

type Status = { kind: "idle" | "sending" | "ok" | "err"; message?: string };

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const serviceRef = useRef<HTMLSelectElement>(null);

  // Preselect the service when arriving from a service page.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("service");
    if (p && serviceRef.current && services.some((s) => s.slug === p)) serviceRef.current.value = p;
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
      setStatus({ kind: "ok", message: "Request sent. James will reply to set up your free consultation." });
    } catch (err) {
      setStatus({
        kind: "err",
        message: `Your request did not send. Email ${site.email} instead and we will set up your consultation from there.`,
      });
      console.error(err);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="name">Your name</label>
        <input id="name" name="name" autoComplete="name" required />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="field">
        <label htmlFor="service">What would you like help with?</label>
        <select id="service" name="service" ref={serviceRef} defaultValue="not-sure">
          <option value="not-sure">Not sure yet</option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="location">Where are you based? (optional)</label>
        <span className="hint" id="location-hint">
          City and country, so we can suggest a time that suits your time zone.
        </span>
        <input id="location" name="location" autoComplete="address-level2" aria-describedby="location-hint" />
      </div>

      <div className="field">
        <label htmlFor="phone">Phone or WhatsApp (optional)</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" />
      </div>

      <div className="field">
        <label htmlFor="message">Tell us a little about your business</label>
        <span className="hint" id="message-hint">
          A few sentences is plenty.
        </span>
        <textarea id="message" name="message" aria-describedby="message-hint" />
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="consent">
        We use your details only to reply to you and arrange your consultation. See our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      <div>
        <button type="submit" className="btn btn-primary" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "Sending request" : "Request my free consultation"}
        </button>
      </div>

      <div aria-live="polite">
        {status.kind === "ok" && <p className="form-status ok">{status.message}</p>}
        {status.kind === "err" && <p className="form-status err">{status.message}</p>}
      </div>
    </form>
  );
}
