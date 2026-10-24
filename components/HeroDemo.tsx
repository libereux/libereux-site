"use client";

import { useState } from "react";

type Sample = {
  id: string;
  tab: string;
  name: string;
  title: string;
  cta: string;
  bg: string;
  ctaBg: string;
  ctaColor: string;
  label: string;
  rows: [string, string][];
  foot: [string, string];
  photos: [string, string, string];
};

// Invented sample businesses that show what a Starter site looks like.
const samples: Sample[] = [
  {
    id: "restaurant",
    tab: "Restaurant",
    name: "Mama Dee's Kitchen",
    title: "Soul food, made fresh every morning.",
    cta: "Call to order",
    bg: "#7a2e12",
    ctaBg: "#ffd27a",
    ctaColor: "#3a1505",
    label: "Today's plates",
    rows: [
      ["Smothered chicken", "$13"],
      ["Oxtails and rice", "$18"],
      ["Mac and greens", "$7"],
      ["Peach cobbler", "$5"],
    ],
    foot: ["Open 11 to 8", "Directions"],
    photos: ["#e0a64b", "#b8572a", "#f3d9a4"],
  },
  {
    id: "salon",
    tab: "Salon",
    name: "Fade & Grace Studio",
    title: "Your chair is ready when you are.",
    cta: "Book a time",
    bg: "#2f3d5c",
    ctaBg: "#f4c6d3",
    ctaColor: "#2f1a22",
    label: "Services",
    rows: [
      ["Silk press", "$65"],
      ["Braids, medium", "$140"],
      ["Cut and style", "$45"],
      ["Kids cut", "$20"],
    ],
    foot: ["Walk-ins Sat", "Call us"],
    photos: ["#f4c6d3", "#8a6f9e", "#d9c8b4"],
  },
  {
    id: "realtor",
    tab: "Realtor",
    name: "Renee Park Realty",
    title: "Find the home that fits your family.",
    cta: "See listings",
    bg: "#14463f",
    ctaBg: "#ffffff",
    ctaColor: "#14463f",
    label: "New this week",
    rows: [
      ["3 bed, Jonesboro", "$264k"],
      ["4 bed, Morrow", "$312k"],
      ["2 bed, Riverdale", "$198k"],
      ["Duplex, Forest Park", "$289k"],
    ],
    foot: ["Free home value", "Text Renee"],
    photos: ["#9cc5b5", "#d7c6a3", "#5f8f7f"],
  },
  {
    id: "contractor",
    tab: "Contractor",
    name: "Southside Roof & Repair",
    title: "Roofs, gutters and repairs done right.",
    cta: "Get a free quote",
    bg: "#17222d",
    ctaBg: "#ee6a1f",
    ctaColor: "#17222d",
    label: "What we fix",
    rows: [
      ["Roof replacement", "Free quote"],
      ["Leak repair", "Same week"],
      ["Gutters", "From $450"],
      ["Storm damage", "Insurance help"],
    ],
    foot: ["Licensed + insured", "See our work"],
    photos: ["#8a97a3", "#ee6a1f", "#c9d1d8"],
  },
];

export default function HeroDemo() {
  const [active, setActive] = useState(samples[0].id);
  const s = samples.find((x) => x.id === active) ?? samples[0];

  return (
    <div className="demo">
      <svg className="demo-trace" viewBox="0 0 400 600" fill="none" aria-hidden="true" preserveAspectRatio="none">
        <path d="M0 120 H90 V60 H200" stroke="currentColor" strokeWidth="2" />
        <path d="M400 200 H320 V140 H260" stroke="currentColor" strokeWidth="2" />
        <path d="M0 470 H70 V540 H180" stroke="currentColor" strokeWidth="2" />
        <path d="M400 420 H330 V500 H250" stroke="currentColor" strokeWidth="2" />
        <circle cx="200" cy="60" r="5" fill="#ee6a1f" />
        <circle cx="260" cy="140" r="5" fill="#17222d" />
        <circle cx="180" cy="540" r="5" fill="#17222d" />
        <circle cx="250" cy="500" r="5" fill="#ee6a1f" />
      </svg>

      <div className="demo-tabs" role="tablist" aria-label="Sample website by business type">
        {samples.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            id={`tab-${x.id}`}
            aria-selected={x.id === active}
            aria-controls="demo-panel"
            className="demo-tab"
            onClick={() => setActive(x.id)}
          >
            {x.tab}
          </button>
        ))}
      </div>

      <div className="phone">
        <div className="phone-screen">
          <span className="phone-notch" aria-hidden="true" />
          <div
            className="mini"
            key={s.id}
            id="demo-panel"
            role="tabpanel"
            aria-labelledby={`tab-${s.id}`}
            aria-label={`Sample website for ${s.name}`}
          >
            <div className="mini-hero" style={{ background: s.bg }}>
              <span className="mini-name">{s.name}</span>
              <span className="mini-title">{s.title}</span>
              <span className="mini-cta" style={{ background: s.ctaBg, color: s.ctaColor }}>
                {s.cta}
              </span>
            </div>
            <div className="mini-body">
              <div className="mini-photos" aria-hidden="true">
                {s.photos.map((c, i) => (
                  <span key={i} style={{ background: c }} />
                ))}
              </div>
              <span className="mini-label">{s.label}</span>
              {s.rows.map(([a, b]) => (
                <div className="mini-row" key={a}>
                  <span>{a}</span>
                  <b>{b}</b>
                </div>
              ))}
            </div>
            <div className="mini-foot">
              <span>{s.foot[0]}</span>
              <span>{s.foot[1]}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="demo-caption">Sample designs. Tap a business type to see how a Starter site could look.</p>
    </div>
  );
}
