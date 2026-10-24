"use client";

import { useState } from "react";

type Scene = {
  id: string;
  label: string;
  light: number; // 0 to 1
  warm: boolean;
  blinds: number; // 0 open to 1 closed
  locked: boolean;
  temp: number;
  tv: boolean;
  sky: string;
  summary: string[];
};

const scenes: Scene[] = [
  {
    id: "morning",
    label: "Good morning",
    light: 0.55,
    warm: false,
    blinds: 0,
    locked: false,
    temp: 22,
    tv: false,
    sky: "#9fd3f2",
    summary: ["Blinds open", "Lights at half, cool white", "Heating to 22°C", "Front door unlocked"],
  },
  {
    id: "movie",
    label: "Movie night",
    light: 0.18,
    warm: true,
    blinds: 1,
    locked: true,
    temp: 21,
    tv: true,
    sky: "#24365c",
    summary: ["Blinds closed", "Lights dimmed, warm", "TV on", "Front door locked"],
  },
  {
    id: "away",
    label: "Away",
    light: 0,
    warm: false,
    blinds: 0.5,
    locked: true,
    temp: 17,
    tv: false,
    sky: "#c7e3f4",
    summary: ["Lights off", "Eco temperature 17°C", "Front door locked", "Alerts sent to your phone"],
  },
  {
    id: "night",
    label: "Good night",
    light: 0.06,
    warm: true,
    blinds: 1,
    locked: true,
    temp: 19,
    tv: false,
    sky: "#111827",
    summary: ["Everything off but a night light", "Blinds closed", "Doors locked", "Cooler 19°C for sleep"],
  },
];

export default function SmartHomeScene() {
  const [id, setId] = useState("movie");
  const s = scenes.find((x) => x.id === id)!;
  const lampColor = s.warm ? "#ffb35c" : "#fff4d6";

  return (
    <div className="scene">
      <div className="scene-buttons" role="group" aria-label="Choose a scene">
        {scenes.map((x) => (
          <button key={x.id} type="button" className="chip chip-dark" aria-pressed={x.id === id} onClick={() => setId(x.id)}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="scene-stage">
        <svg viewBox="0 0 480 300" role="img" aria-label={`Sample living room in ${s.label} mode: ${s.summary.join(", ")}`}>
          <defs>
            <radialGradient id="glow" cx="50%" cy="0%" r="80%">
              <stop offset="0%" stopColor={lampColor} stopOpacity={0.9 * s.light} />
              <stop offset="100%" stopColor={lampColor} stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Room */}
          <rect x="0" y="0" width="480" height="300" fill="#e7e2da" />
          <rect x="0" y="0" width="480" height="300" fill="#111827" style={{ opacity: 0.62 - s.light * 0.6, transition: "opacity .6s" }} />
          <rect x="0" y="232" width="480" height="68" fill="#b98f6a" />
          <rect x="0" y="232" width="480" height="68" fill="#111827" style={{ opacity: 0.5 - s.light * 0.45, transition: "opacity .6s" }} />
          {/* Window */}
          <rect x="40" y="46" width="130" height="120" rx="4" fill={s.sky} style={{ transition: "fill .6s" }} />
          <rect x="40" y="46" width="130" height={120 * s.blinds} fill="#d9cfc2" style={{ transition: "height .6s" }} />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1="40" x2="170" y1={46 + i * 15} y2={46 + i * 15} stroke="#bfb3a3" strokeWidth="1" opacity={i * 15 < 120 * s.blinds ? 1 : 0} />
          ))}
          <rect x="40" y="46" width="130" height="120" rx="4" fill="none" stroke="#fff" strokeWidth="6" />
          {/* Ceiling light glow */}
          <rect x="0" y="0" width="480" height="300" fill="url(#glow)" style={{ transition: "all .6s" }} />
          <line x1="300" y1="0" x2="300" y2="34" stroke="#555" strokeWidth="2" />
          <path d="M282 34 h36 l-8 14 h-20z" fill="#2a2f3a" />
          <circle cx="300" cy="50" r="6" fill={s.light > 0 ? lampColor : "#666"} />
          {/* TV */}
          <rect x="210" y="104" width="150" height="86" rx="4" fill="#111827" />
          <rect x="216" y="110" width="138" height="74" rx="2" fill={s.tv ? "#3b82f6" : "#1f2937"} style={{ transition: "fill .4s" }} />
          {s.tv && <path d="M270 132 l22 14 -22 14z" fill="#fff" opacity=".9" />}
          {/* Sofa */}
          <rect x="196" y="196" width="180" height="40" rx="12" fill="#1b2a4a" />
          <rect x="186" y="186" width="24" height="54" rx="10" fill="#24365c" />
          <rect x="362" y="186" width="24" height="54" rx="10" fill="#24365c" />
          {/* Door */}
          <rect x="410" y="96" width="56" height="136" rx="3" fill="#8a6748" />
          <circle cx="420" cy="166" r="4" fill="#d6c3a5" />
          <g transform="translate(424 120)">
            <rect x="0" y="0" width="30" height="30" rx="8" fill={s.locked ? "#16a34a" : "#ff6b35"} style={{ transition: "fill .4s" }} />
            <path d={s.locked ? "M9 14 v-4 a6 6 0 0 1 12 0 v4" : "M9 14 v-4 a6 6 0 0 1 11 -2"} fill="none" stroke="#fff" strokeWidth="2.2" />
            <rect x="7" y="14" width="16" height="10" rx="2" fill="#fff" />
          </g>
          {/* Thermostat */}
          <circle cx="190" cy="80" r="17" fill="#fff" stroke="#c9ced6" strokeWidth="2" />
          <text x="190" y="85" textAnchor="middle" fontSize="13" fontWeight="700" fill="#111827" fontFamily="sans-serif">
            {s.temp}°
          </text>
          {/* Floor lamp */}
          <line x1="96" y1="232" x2="96" y2="196" stroke="#2a2f3a" strokeWidth="3" />
          <path d="M84 196 h24 l-5 -16 h-14z" fill={s.light > 0.1 ? lampColor : "#4b5563"} style={{ transition: "fill .6s" }} />
        </svg>
      </div>

      <ul className="scene-summary" aria-live="polite">
        {s.summary.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
