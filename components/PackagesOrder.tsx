"use client";

import Link from "next/link";
import { useState } from "react";
import {
  addOns,
  countryOptions,
  depositPercent,
  isCheckoutPackage,
  packages,
  priceFor,
  routeToConsultation,
  tierForCountry,
} from "@/lib/pricing";

type Status = { kind: "idle" | "sending" | "ok" | "err"; message?: string };

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function PackagesOrder() {
  const [country, setCountry] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [wantsQuote, setWantsQuote] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const tier = tierForCountry(country);
  const needsQuote = wantsQuote || flags.length > 0 || (country !== "" && tier === null) || picked.length === 0;

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const chosen = packages.filter((p) => picked.includes(p.id));
  const total = tier ? chosen.reduce((sum, p) => sum + priceFor(p, tier), 0) : 0;
  const deposit = Math.round((total * depositPercent) / 100);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, country, packages: picked, flags, addOns: extras, wantsQuote, agreed }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; kind?: string; url?: string };
      if (!res.ok) throw new Error(body.error || "Request failed");
      if (body.kind === "checkout" && body.url) {
        window.location.href = body.url;
        return;
      }
      form.reset();
      setPicked([]);
      setFlags([]);
      setExtras([]);
      setWantsQuote(false);
      setAgreed(false);
      setStatus({
        kind: "ok",
        message: "Request sent. You will receive a written quote within 24 hours.",
      });
    } catch (err) {
      setStatus({
        kind: "err",
        message: "Your request did not send. Please email holdings@libereux.com and we will take it from there.",
      });
      console.error(err);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="country">Billing country</label>
        <span className="hint" id="country-hint">
          Your price is set by the country on your payment card or billing address.
        </span>
        <select
          id="country"
          name="countryChoice"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
          aria-describedby="country-hint"
        >
          <option value="" disabled>
            Choose your country
          </option>
          {countryOptions.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
          <option value="OTHER">Another country (written quote)</option>
        </select>
      </div>

      <fieldset>
        <legend>Choose what you need</legend>
        <p className="hint">Regional pricing applies. You pay a {depositPercent} percent deposit now and the rest at handover.</p>
        {packages.filter(isCheckoutPackage).map((p) => (
          <div className="field" key={p.id}>
            <label htmlFor={`pkg-${p.id}`}>
              <input
                id={`pkg-${p.id}`}
                type="checkbox"
                checked={picked.includes(p.id)}
                onChange={() => toggle(picked, setPicked, p.id)}
              />{" "}
              <strong>{p.name}</strong>
              {tier ? `: ${money(priceFor(p, tier))}` : ""}
            </label>
            <span className="hint">
              {p.summary} {p.includes.join(", ")}.{p.turnaround ? ` ${p.turnaround}.` : ""}
            </span>
          </div>
        ))}
        <p className="hint">
          After launch we can add a care plan for $10 per month: text and image swaps only. Ask when we confirm your
          scope.
        </p>
      </fieldset>

      <fieldset>
        <legend>Anything extra? (optional)</legend>
        <p className="hint">Extras are priced in your written scope before work starts. They are not charged here.</p>
        {addOns.map((a) => (
          <div className="field" key={a}>
            <label htmlFor={`extra-${a}`}>
              <input
                id={`extra-${a}`}
                type="checkbox"
                checked={extras.includes(a)}
                onChange={() => toggle(extras, setExtras, a)}
              />{" "}
              {a}
            </label>
          </div>
        ))}
      </fieldset>

      <fieldset>
        <legend>Does your project include any of these?</legend>
        <p className="hint">If so, we will quote it in writing instead of using checkout.</p>
        {routeToConsultation.map((f) => (
          <div className="field" key={f}>
            <label htmlFor={`flag-${f}`}>
              <input
                id={`flag-${f}`}
                type="checkbox"
                checked={flags.includes(f)}
                onChange={() => toggle(flags, setFlags, f)}
              />{" "}
              {f}
            </label>
          </div>
        ))}
        <div className="field">
          <label htmlFor="quote-only">
            <input id="quote-only" type="checkbox" checked={wantsQuote} onChange={(e) => setWantsQuote(e.target.checked)} />{" "}
            I am not sure what I need. Send me a written quote.
          </label>
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="name">Your name</label>
        <input id="name" name="name" autoComplete="name" required />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="business">Business name</label>
        <input id="business" name="business" autoComplete="organization" />
      </div>
      <div className="field">
        <label htmlFor="notes">Notes (optional)</label>
        <span className="hint" id="notes-hint">
          Tell us about your business and what you want. We confirm the exact scope with you in writing before any work
          starts.
        </span>
        <textarea id="notes" name="notes" aria-describedby="notes-hint" />
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {!needsQuote && tier && (
        <p aria-live="polite">
          <strong>Total: {money(total)}.</strong> Deposit due today: <strong>{money(deposit)}</strong>.
        </p>
      )}

      {!needsQuote && tier && (
        <div className="field">
          <label htmlFor="agree">
            <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />{" "}
            I have read and agree to the <Link href="/terms">terms of service</Link> and the{" "}
            <Link href="/refund-policy">refund policy</Link>.
          </label>
        </div>
      )}

      <p className="consent">
        We use your details only to reply to you and deliver your order. See our <Link href="/privacy">privacy policy</Link>.
        Prefer to talk first? <Link href="/contact">Book a free consultation</Link>.
      </p>

      <div>
        <button type="submit" className="btn btn-primary" disabled={status.kind === "sending" || country === "" || (!needsQuote && !agreed)}>
          {status.kind === "sending" ? "Sending" : needsQuote ? "Send my request for a written quote" : `Pay ${money(deposit)} deposit`}
        </button>
      </div>

      <div aria-live="polite">
        {status.kind === "ok" && <p className="form-status ok">{status.message}</p>}
        {status.kind === "err" && <p className="form-status err">{status.message}</p>}
      </div>
    </form>
  );
}
