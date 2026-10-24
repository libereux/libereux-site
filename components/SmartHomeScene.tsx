"use client";

import Image from "next/image";
import { useState } from "react";

type Hotspot = {
  device: string;
  tip: string;
  x: number; // percent of image width
  y: number; // percent of image height
};

type Scene = {
  id: string;
  label: string;
  src: string;
  alt: string;
  summary: string[];
  hotspots: Hotspot[];
};

/*
  One plain example room, shown today and then as four scenes. All images share the same
  camera and room, so the crossfade reads as the room changing. Hotspot positions are
  percentages, so they hold at any screen width.
*/
const scenes: Scene[] = [
  {
    id: "today",
    label: "Your space today",
    src: "/scenes/base.webp",
    alt: "A plain living room with a sofa, coffee table and floor lamp, and no smart devices yet.",
    summary: ["A plain room, no smart devices", "Tap a scene to see the same room transform"],
    hotspots: [],
  },
  {
    id: "morning",
    label: "Good morning",
    src: "/scenes/good-morning.webp",
    alt: "The same living room at sunrise with the blinds open, warm light on, a smart thermostat on the wall and a smart speaker on the coffee table.",
    summary: ["Blinds open with the sunrise", "Thermostat warms to 21°C", "Kitchen lights ready", "Speaker reads your day"],
    hotspots: [
      { device: "Smart blinds", tip: "Open slowly at 6:30 with the sunrise.", x: 12, y: 35 },
      { device: "Smart thermostat", tip: "Warms the house to 21 degrees before you get up.", x: 41, y: 40 },
      { device: "Kitchen lights and speaker", tip: "Kitchen lights come on and the speaker reads your day.", x: 51, y: 71 },
    ],
  },
  {
    id: "movie",
    label: "Movie night",
    src: "/scenes/movie-night.webp",
    alt: "The same living room in the evening with the blinds closed, lights dimmed and a television glowing on the wall.",
    summary: ["Blinds closed", "Lights dimmed, warm", "TV and sound on", "Thermostat set for comfort"],
    hotspots: [
      { device: "Smart blinds", tip: "Close to block the glare.", x: 8, y: 30 },
      { device: "Smart lighting", tip: "Overhead lights off, the lamp dims low.", x: 21, y: 43 },
      { device: "TV and sound", tip: "TV and sound switch on and ready to play.", x: 72, y: 35 },
    ],
  },
  {
    id: "away",
    label: "Away",
    src: "/scenes/away.webp",
    alt: "The same living room in daylight with the lights off, a smart lock on the front door and a small security camera in the corner.",
    summary: ["Lights off", "Eco temperature", "Front door locked", "Camera armed, alerts to your phone"],
    hotspots: [
      { device: "Smart lock", tip: "The door locks itself when you leave.", x: 37, y: 45 },
      { device: "Smart thermostat", tip: "Drops to eco mode to save energy.", x: 42, y: 40 },
      { device: "Security camera", tip: "Arms and alerts your phone if anything moves.", x: 58, y: 25 },
    ],
  },
  {
    id: "night",
    label: "Good night",
    src: "/scenes/good-night.webp",
    alt: "The same living room late at night with the blinds closed, a low lamp, a night light along the floor and the front door locked.",
    summary: ["Everything off but a night light", "Blinds closed", "Door locked", "Cooler 18°C for sleep"],
    hotspots: [
      { device: "Smart lock", tip: "Checks that the door is locked.", x: 37, y: 44 },
      { device: "Night light path", tip: "A soft light guides you if you get up.", x: 73, y: 65 },
      { device: "Smart thermostat", tip: "Cools to 18 degrees for better sleep.", x: 43, y: 41 },
    ],
  },
];

export default function SmartHomeScene() {
  const [id, setId] = useState("today");
  const [openTip, setOpenTip] = useState<number | null>(null);
  const s = scenes.find((x) => x.id === id)!;
  const tip = openTip === null ? null : s.hotspots[openTip];

  function choose(next: string) {
    setId(next);
    setOpenTip(null);
  }

  return (
    <div className="scene">
      <div className="scene-buttons" role="group" aria-label="Choose a scene">
        {scenes.map((x) => (
          <button key={x.id} type="button" className="chip chip-dark" aria-pressed={x.id === id} onClick={() => choose(x.id)}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="scene-stage">
        <div className="scene-frame">
          {scenes.map((x, i) => (
            <Image
              key={x.id}
              src={x.src}
              alt={x.id === id ? x.alt : ""}
              aria-hidden={x.id === id ? undefined : true}
              fill
              unoptimized
              loading="eager"
              sizes="(max-width: 900px) 100vw, 720px"
              className={x.id === id ? "scene-img scene-img-on" : "scene-img"}
              preload={i === 0}
            />
          ))}

          {/* Re-keyed on every scene change so the dots fade in one after another. */}
          <div className="scene-dots" key={s.id}>
            {s.hotspots.map((h, i) => (
              <button
                key={h.device}
                type="button"
                className="scene-dot"
                style={{ left: `${h.x}%`, top: `${h.y}%`, ["--i" as string]: i }}
                aria-label={`${h.device}: ${h.tip}`}
                aria-pressed={openTip === i}
                onClick={() => setOpenTip(openTip === i ? null : i)}
              />
            ))}
          </div>

          {tip && (
            <div className="scene-tip" role="status">
              <strong>{tip.device}</strong>
              <span>{tip.tip}</span>
            </div>
          )}
        </div>
      </div>

      <ul className="scene-summary" aria-live="polite">
        {s.summary.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <p className="scene-note">Illustrative example. Devices and automations shown are examples of what can be set up.</p>
    </div>
  );
}
