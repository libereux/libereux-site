"use client";

import { useEffect, useState } from "react";

type Msg = { from: "customer" | "assistant"; text: string };

type Sample = {
  id: string;
  tab: string;
  name: string;
  status: string;
  time: string;
  accent: string;
  accentText: string;
  note: string;
  messages: Msg[];
};

// Invented sample businesses and conversations that show what an AI assistant can do.
const samples: Sample[] = [
  {
    id: "restaurant",
    tab: "Restaurant",
    name: "Mama Dee's Kitchen",
    status: "Assistant",
    time: "Friday, 10:52 pm",
    accent: "#1b2a4a",
    accentText: "#ffffff",
    note: "A late-night table request, handled while the owner is busy in the kitchen.",
    messages: [
      { from: "customer", text: "Are you still open tonight? We're a party of 6." },
      { from: "assistant", text: "We're open until midnight on Fridays. I can hold a table for 6 at 11:15. Want it?" },
      { from: "customer", text: "Yes please!" },
      { from: "assistant", text: "Done. Your table is held under this number. See you soon." },
    ],
  },
  {
    id: "salon",
    tab: "Salon",
    name: "Fade & Grace Studio",
    status: "Assistant",
    time: "Sunday, 11:08 pm",
    accent: "#7a3b5c",
    accentText: "#ffffff",
    note: "A booking made on Sunday night, without a missed call or a voicemail.",
    messages: [
      { from: "customer", text: "Can I get a silk press Saturday morning?" },
      { from: "assistant", text: "Grace has 9:30 or 11:00 open on Saturday. Which works for you?" },
      { from: "customer", text: "9:30" },
      { from: "assistant", text: "Booked. You'll get a reminder on Friday evening with directions." },
    ],
  },
  {
    id: "guesthouse",
    tab: "Guesthouse",
    name: "Casa Lumbre",
    status: "Asistente",
    time: "Martes, 2:14 am",
    accent: "#14463f",
    accentText: "#ffffff",
    note: "The guest writes in Spanish at 2 am, and the assistant answers in Spanish.",
    messages: [
      { from: "customer", text: "Hola, ¿tienen habitación para dos el viernes?" },
      { from: "assistant", text: "¡Hola! Sí, tenemos una habitación doble libre el viernes. ¿Se la reservo?" },
      { from: "customer", text: "Sí, por favor." },
      { from: "assistant", text: "Listo. Le envío la confirmación y cómo llegar desde el aeropuerto." },
    ],
  },
  {
    id: "contractor",
    tab: "Contractor",
    name: "Southside Roof & Repair",
    status: "Assistant",
    time: "Monday, 9:41 pm",
    accent: "#ff6b35",
    accentText: "#111827",
    note: "An urgent job captured with photos, so the owner calls back already knowing the problem.",
    messages: [
      { from: "customer", text: "My roof started leaking after the storm. Can someone look this week?" },
      { from: "assistant", text: "Sorry to hear that. Can you send two photos of the leak? I'll add you to Thursday's inspections." },
      { from: "customer", text: "Sent 2 photos" },
      { from: "assistant", text: "Got them. You're booked for Thursday at 10:00. The crew will call before they arrive." },
    ],
  },
];

export default function HeroDemo() {
  const [active, setActive] = useState(samples[0].id);
  // Everything is visible on first load. Messages only play in after someone picks a tab.
  const [shown, setShown] = useState(samples[0].messages.length);
  const s = samples.find((x) => x.id === active) ?? samples[0];
  const playing = shown < s.messages.length;

  useEffect(() => {
    if (!playing) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setShown((n) => n + 1), reduce ? 0 : 750);
    return () => window.clearTimeout(t);
  }, [playing, shown]);

  function pick(id: string) {
    if (id === active) return;
    setActive(id);
    setShown(1);
  }

  return (
    <div className="demo">
      <svg className="demo-trace" viewBox="0 0 400 600" fill="none" aria-hidden="true" preserveAspectRatio="none">
        <path d="M0 120 H90 V60 H200" stroke="currentColor" strokeWidth="2" />
        <path d="M400 200 H320 V140 H260" stroke="currentColor" strokeWidth="2" />
        <path d="M0 470 H70 V540 H180" stroke="currentColor" strokeWidth="2" />
        <path d="M400 420 H330 V500 H250" stroke="currentColor" strokeWidth="2" />
        <circle cx="200" cy="60" r="5" fill="#ff6b35" />
        <circle cx="260" cy="140" r="5" fill="#1b2a4a" />
        <circle cx="180" cy="540" r="5" fill="#1b2a4a" />
        <circle cx="250" cy="500" r="5" fill="#ff6b35" />
      </svg>

      <div className="demo-tabs" role="tablist" aria-label="Sample AI assistant by business type">
        {samples.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            id={`tab-${x.id}`}
            aria-selected={x.id === active}
            aria-controls="demo-panel"
            className="demo-tab"
            onClick={() => pick(x.id)}
          >
            {x.tab}
          </button>
        ))}
      </div>

      <div className="phone">
        <div className="phone-screen">
          <span className="phone-notch" aria-hidden="true" />
          <div className="chat" id="demo-panel" role="tabpanel" aria-labelledby={`tab-${s.id}`}>
            <div className="chat-head" style={{ background: s.accent, color: s.accentText }}>
              <span className="chat-avatar" aria-hidden="true">
                {s.name.charAt(0)}
              </span>
              <span>
                <span className="chat-name">{s.name}</span>
                <span className="chat-status">{s.status}</span>
              </span>
            </div>
            <div className="chat-body" aria-live="polite" lang={s.id === "guesthouse" ? "es" : undefined}>
              <span className="chat-time">{s.time}</span>
              {s.messages.slice(0, shown).map((m, i) => (
                <p
                  key={`${s.id}-${i}`}
                  className={`bubble bubble-${m.from}`}
                  style={m.from === "assistant" ? { background: s.accent, color: s.accentText } : undefined}
                >
                  {m.text}
                </p>
              ))}
              {playing && (
                <span className="typing" aria-label="Typing">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>
            <div className="chat-input" aria-hidden="true">
              <span>Message</span>
            </div>
          </div>
        </div>
      </div>

      <p className="demo-caption">
        <strong>Sample conversation.</strong> {s.note}
      </p>
    </div>
  );
}
