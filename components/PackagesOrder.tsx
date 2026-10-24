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

  const quoteReason = wantsQuote
    ? "You asked for a written quote."
    : flags.length > 0
      ? "Your project needs a written quote."
      : country !== "" && tier === null
        ? "We price your country by written quote."
        : "";

  return (
    <form className="order" onSubmit={onSubmit}>
      <div className="order-main">
        <div className="field country-field">
          <label htmlFor="country">Billing country</label>
          <select
            id="country"
            name="countryChoice"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            aria-describedby="country-hint"
          >
            <option value="" disabled>
              Choose your country to see prices
            </option>
            {countryOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
            <option value="OTHER">Another country (written quote)</option>
          </select>
          <span className="hint" id="country-hint">
            Regional pricing: set by the country on your payment card or billing address.
          </span>
        </div>

        <fieldset className="order-section">
          <legend>1. Choose what you need</legend>
          <div className="pkg-grid">
            {packages.filter(isCheckoutPackage).map((p) => (
              <label className="pkg-card" key={p.id} htmlFor={`pkg-${p.id}`}>
                <input
                  id={`pkg-${p.id}`}
                  type="checkbox"
                  checked={picked.includes(p.id)}
                  onChange={() => toggle(picked, setPicked, p.id)}
                />
                <span className="pkg-name">{p.name}</span>
                <span className="pkg-price">{tier ? money(priceFor(p, tier)) : "Choose country"}</span>
                <span className="pkg-sub">{p.summary}</span>
                <span className="pkg-meta">
                  {p.includes.join(" | ")}
                  {p.turnaround ? ` | ${p.turnaround}` : ""}
                </span>
              </label>
            ))}
          </div>
          <p className="hint">
            After launch we can add a care plan for $10 per month: text and image swaps only. Ask when we confirm your
            scope.
          </p>
        </fieldset>

        <details className="order-more">
          <summary>
            2. Add extras (optional){extras.length > 0 ? `, ${extras.length} selected` : ""}
          </summary>
          <p className="hint">Extras are priced in your written scope before work starts. They are not charged here.</p>
          <div className="chip-row">
            {addOns.map((a) => (
              <label className="chip" key={a} htmlFor={`extra-${a}`}>
                <input
                  id={`extra-${a}`}
                  type="checkbox"
                  checked={extras.includes(a)}
                  onChange={() => toggle(extras, setExtras, a)}
                />
                {a}
              </label>
            ))}
          </div>
        </details>

        <details className="order-more">
          <summary>
            3. Is your project bigger or more complex?{flags.length + (wantsQuote ? 1 : 0) > 0 ? `, ${flags.length + (wantsQuote ? 1 : 0)} selected` : ""}
          </summary>
          <p className="hint">If any of these apply, we quote it in writing instead of using checkout.</p>
          <div className="chip-row">
            {routeToConsultation.map((f) => (
              <label className="chip" key={f} htmlFor={`flag-${f}`}>
                <input
                  id={`flag-${f}`}
                  type="checkbox"
                  checked={flags.includes(f)}
                  onChange={() => toggle(flags, setFlags, f)}
                />
                {f}
              </label>
            ))}
            <label className="chip" htmlFor="quote-only">
              <input id="quote-only" type="checkbox" checked={wantsQuote} onChange={(e) => setWantsQuote(e.target.checked)} />
              I am not sure. Send me a written quote.
            </label>
          </div>
        </details>
      </div>

      <aside className="order-aside" aria-label="Your order">
        <h2 className="order-title">Your order</h2>

        {chosen.length > 0 ? (
          <ul className="order-lines">
            {chosen.map((p) => (
              <li key={p.id}>
                <span>{p.name}</span>
                <span>{tier ? money(priceFor(p, tier)) : ""}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hint">Pick a package to see your total, or ask for a written quote below.</p>
        )}

        {!needsQuote && tier && (
          <p className="order-total" aria-live="polite">
            <span>Total {money(total)}</span>
            <strong>Deposit today: {money(deposit)}</strong>
            <span className="hint">The {100 - depositPercent} percent balance is due at handover.</span>
          </p>
        )}
        {needsQuote && quoteReason && (
          <p className="order-total" aria-live="polite">
            <strong>{quoteReason}</strong>
            <span className="hint">No payment now. You receive a written quote within 24 hours.</span>
          </p>
        )}

        <div className="field">
          <label htmlFor="name">Your name</label>
          <input id="name" name="name" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="business">Business name (optional)</label>
          <input id="business" name="business" autoComplete="organization" />
        </div>
        <div className="field">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" name="notes" rows={3} aria-describedby="notes-hint" />
          <span className="hint" id="notes-hint">
            We confirm the exact scope with you in writing before any work starts.
          </span>
        </div>

        <div className="hp" aria-hidden="true">
          <label htmlFor="website">Leave this empty</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        {!needsQuote && tier && (
          <label className="agree" htmlFor="agree">
            <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
            <span>
              I have read and agree to the <Link href="/terms">terms of service</Link> and the{" "}
              <Link href="/refund-policy">refund policy</Link>.
            </span>
          </label>
        )}

        <button
          type="submit"
          className="btn btn-primary order-submit"
          disabled={status.kind === "sending" || country === "" || (!needsQuote && !agreed)}
        >
          {status.kind === "sending" ? "Sending" : needsQuote ? "Send my request for a written quote" : `Pay ${money(deposit)} deposit`}
        </button>

        <p className="consent">
          We use your details only to reply to you and deliver your order. See our <Link href="/privacy">privacy policy</Link>.
          Prefer to talk first? <Link href="/contact">Book a free consultation</Link>.
        </p>

        <div aria-live="polite">
          {status.kind === "ok" && <p className="form-status ok">{status.message}</p>}
          {status.kind === "err" && <p className="form-status err">{status.message}</p>}
        </div>
      </aside>
    </form>
  );
}
