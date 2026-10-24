"use client";

import Link from "next/link";
import { useState } from "react";
import { services, site } from "@/lib/content";
import type { AuditCard, Card, RequestCard, RoadmapCard, SmartHomeCard } from "@/lib/assistant/types";

const svc = (slug: string) => services.find((s) => s.slug === slug);

export function CardView({ card, onNavigate }: { card: Card; onNavigate: () => void }) {
  switch (card.kind) {
    case "services":
      return (
        <div className="ac ac-services">
          {card.slugs.map((slug) => {
            const s = svc(slug);
            if (!s) return null;
            return (
              <Link key={slug} href={`/services/${slug}`} className="ac-service" onClick={onNavigate}>
                <strong>{s.name}</strong>
                <span>{s.short}</span>
              </Link>
            );
          })}
        </div>
      );
    case "audit":
      return <Audit card={card} />;
    case "roadmap":
      return <Roadmap card={card} />;
    case "smarthome":
      return <SmartHome card={card} onNavigate={onNavigate} />;
    case "request":
      return <Request card={card} />;
    case "page":
      return (
        <Link href={card.path} className="btn btn-ghost ac-page" onClick={onNavigate}>
          {card.label}
        </Link>
      );
  }
}

function ScoreRing({ score }: { score: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#ff6b35" : "#dc2626";
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" role="img" aria-label={`Score ${score} out of 100`}>
      <circle cx="34" cy="34" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
      <circle
        cx="34"
        cy="34"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * c} ${c}`}
        transform="rotate(-90 34 34)"
        className="ac-ring"
      />
      <text x="34" y="39" textAnchor="middle" fontSize="17" fontWeight="800" fill="#111827" fontFamily="sans-serif">
        {score}
      </text>
    </svg>
  );
}

function Audit({ card }: { card: AuditCard }) {
  const [showAll, setShowAll] = useState(false);
  const failed = card.checks.filter((c) => !c.ok);
  const passed = card.checks.filter((c) => c.ok);
  return (
    <div className="ac ac-audit">
      <div className="ac-audit-head">
        <ScoreRing score={card.score} />
        <div>
          <span className="ac-kicker">Website review</span>
          <strong className="ac-title">{card.host}</strong>
          <span className="ac-sub">
            {passed.length} of {card.checks.length} checks passed
          </span>
        </div>
      </div>
      <ul className="ac-checks">
        {failed.map((c) => (
          <li key={c.label} className="warn">
            <b>{c.label}</b>
            <span>{c.detail}</span>
          </li>
        ))}
        {showAll &&
          passed.map((c) => (
            <li key={c.label} className="ok">
              <b>{c.label}</b>
              <span>{c.detail}</span>
            </li>
          ))}
      </ul>
      {passed.length > 0 && (
        <button type="button" className="ac-link" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Hide passed checks" : `Show ${passed.length} passed checks`}
        </button>
      )}
    </div>
  );
}

function Roadmap({ card }: { card: RoadmapCard }) {
  return (
    <div className="ac ac-roadmap">
      <span className="ac-kicker">Your AI roadmap</span>
      <strong className="ac-title">{card.business}</strong>
      <ol className="ac-items">
        {card.items.map((i) => (
          <li key={i.title}>
            <b>{i.title}</b>
            <span>{i.detail}</span>
            <span className="ac-tags">
              <span className={`tag${i.impact === "High" ? " tag-high" : ""}`}>Impact: {i.impact}</span>
              <span className="tag">Effort: {i.effort}</span>
            </span>
          </li>
        ))}
      </ol>
      {card.firstStep && (
        <p className="ac-first">
          <b>Start this week:</b> {card.firstStep}
        </p>
      )}
    </div>
  );
}

function SmartHome({ card, onNavigate }: { card: SmartHomeCard; onNavigate: () => void }) {
  const [scene, setScene] = useState(0);
  return (
    <div className="ac ac-smart">
      <span className="ac-kicker">Smart home plan</span>
      <strong className="ac-title">{card.space}</strong>
      <ul className="ac-devices">
        {card.devices.map((d) => (
          <li key={d.type}>
            <b>{d.type}</b>
            <span>{d.why}</span>
          </li>
        ))}
      </ul>
      {card.scenes.length > 0 && (
        <div className="ac-scenes">
          <div className="chips" role="group" aria-label="Scenes">
            {card.scenes.map((s, i) => (
              <button key={s.name} type="button" className="chip" aria-pressed={i === scene} onClick={() => setScene(i)}>
                {s.name}
              </button>
            ))}
          </div>
          <p className="ac-scene-what" aria-live="polite">
            {card.scenes[scene]?.what}
          </p>
        </div>
      )}
      <p className="ac-note">
        You place the devices or hire a local installer. James sets everything up with you on a screen share, in your
        own accounts. <Link href="/services/smart-home" onClick={onNavigate}>How it works</Link>
      </p>
    </div>
  );
}

function Request({ card }: { card: RequestCard }) {
  const [name, setName] = useState(card.name);
  const [email, setEmail] = useState(card.email);
  const [location, setLocation] = useState(card.location);
  const [brief, setBrief] = useState(card.brief);
  const [state, setState] = useState<"edit" | "sending" | "sent" | "error">("edit");
  const [err, setErr] = useState("");

  async function send() {
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr("Add your name and a valid email so James can reply.");
      return;
    }
    setErr("");
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          location,
          service: card.interests[0] || "not-sure",
          message: `${brief}\n\nInterests: ${card.interests.join(", ") || "not specified"}\nPrepared with the website assistant and reviewed by the visitor before sending.`,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="ac ac-request ac-sent" role="status">
        <span className="ac-kicker">Request sent</span>
        <strong className="ac-title">James will reply to {email} to confirm a time.</strong>
      </div>
    );
  }

  return (
    <div className="ac ac-request">
      <span className="ac-kicker">Free 30-minute consultation</span>
      <strong className="ac-title">Review, then send</strong>
      <p className="ac-note">Nothing is sent until you press Send.</p>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </label>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" />
      </label>
      <label>
        City and country (optional)
        <input value={location} onChange={(e) => setLocation(e.target.value)} />
      </label>
      <label>
        Brief for James
        <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={4} />
      </label>
      {err && <p className="ac-err">{err}</p>}
      {state === "error" && (
        <p className="ac-err">
          It did not send. Email <a href={`mailto:${site.email}`}>{site.email}</a> instead.
        </p>
      )}
      <button type="button" className="btn btn-primary" onClick={send} disabled={state === "sending"}>
        {state === "sending" ? "Sending" : "Send request"}
      </button>
    </div>
  );
}
