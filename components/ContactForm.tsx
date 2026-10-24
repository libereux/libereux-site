"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { services, site } from "@/lib/content";

type Status = { kind: "idle" | "sending" | "ok" | "err"; message?: string };

const dayKey = (ms: number, tz: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms));
const dayLabel = (ms: number, tz: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short" }).format(new Date(ms));
const timeLabel = (ms: number, tz: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(ms));

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const serviceRef = useRef<HTMLSelectElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [tz, setTz] = useState("UTC");
  const [slots, setSlots] = useState<number[]>([]);
  const [slotsReady, setSlotsReady] = useState(false);
  const [day, setDay] = useState<string>("");
  const [slot, setSlot] = useState<number | null>(null);

  function applySlots(data: { configured?: boolean; slots?: number[] }) {
    const list = data.configured && Array.isArray(data.slots) ? data.slots : [];
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    setSlots(list);
    setSlot((cur) => (cur !== null && list.includes(cur) ? cur : null));
    setSlotsReady(true);
  }

  async function loadSlots() {
    try {
      const res = await fetch("/api/slots", { cache: "no-store" });
      applySlots((await res.json()) as { configured?: boolean; slots?: number[] });
    } catch {
      applySlots({});
    }
  }

  useEffect(() => {
    let live = true;
    fetch("/api/slots", { cache: "no-store" })
      .then((res) => res.json() as Promise<{ configured?: boolean; slots?: number[] }>)
      .then((data) => live && applySlots(data))
      .catch(() => live && applySlots({}));
    return () => {
      live = false;
    };
  }, []);

  const days = Array.from(new Set(slots.map((s) => dayKey(s, tz))));
  const activeDay = days.includes(day) ? day : days[0] || "";
  const daySlots = slots.filter((s) => dayKey(s, tz) === activeDay);

  // Preselect the service when arriving from a service page.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("service");
    if (p && serviceRef.current && services.some((s) => s.slug === p)) serviceRef.current.value = p;
    // Arriving from a website check report pre-fills the note.
    const note = new URLSearchParams(window.location.search).get("note");
    if (note && messageRef.current && !messageRef.current.value) messageRef.current.value = note.slice(0, 1000);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: "sending" });
    try {
      if (slot !== null) {
        const res = await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, slot, timeZone: tz }),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string; whenLabel?: string };
        if (res.status === 409) {
          await loadSlots();
          setSlot(null);
          setStatus({ kind: "err", message: body.error || "That time was just taken. Please pick another." });
          return;
        }
        if (!res.ok) throw new Error(body.error || "Booking failed");
        form.reset();
        setSlot(null);
        loadSlots();
        setStatus({
          kind: "ok",
          message: `You are booked: ${body.whenLabel ?? "your time"}. A calendar invite with the video link is on its way to your email.`,
        });
        return;
      }
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
        <textarea id="message" name="message" ref={messageRef} aria-describedby="message-hint" />
      </div>

      {slotsReady && slots.length > 0 && (
        <fieldset className="slot-picker">
          <legend>Pick a time (optional)</legend>
          <p className="hint" id="slot-hint">
            Free 30 minute video call. Times are shown in your time zone ({tz.replace(/_/g, " ")}). No time that suits?
            Skip this and we will reply to find one.
          </p>
          <div className="slot-days" role="group" aria-label="Choose a day">
            {days.map((k) => {
              const first = slots.find((s) => dayKey(s, tz) === k) as number;
              return (
                <button
                  type="button"
                  key={k}
                  className="slot-btn"
                  aria-pressed={k === activeDay}
                  onClick={() => {
                    setDay(k);
                    setSlot(null);
                  }}
                >
                  {dayLabel(first, tz)}
                </button>
              );
            })}
          </div>
          <div className="slot-times" role="group" aria-label="Choose a time" aria-describedby="slot-hint">
            {daySlots.map((s) => (
              <button
                type="button"
                key={s}
                className="slot-btn"
                aria-pressed={slot === s}
                onClick={() => setSlot(slot === s ? null : s)}
              >
                {timeLabel(s, tz)}
              </button>
            ))}
          </div>
        </fieldset>
      )}

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
          {status.kind === "sending" ? "Sending" : slot !== null ? "Book my free consultation" : "Request my free consultation"}
        </button>
      </div>

      <div aria-live="polite">
        {status.kind === "ok" && <p className="form-status ok">{status.message}</p>}
        {status.kind === "err" && <p className="form-status err">{status.message}</p>}
      </div>
    </form>
  );
}
