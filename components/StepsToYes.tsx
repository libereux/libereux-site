"use client";

import { useState } from "react";

const before = [
  "Searches for a salon nearby",
  "Finds an old social media page",
  "Scrolls looking for a phone number",
  "Calls during a busy afternoon",
  "Gets voicemail",
  "Waits for a call back",
  "Misses the call back",
  "Calls again the next day",
  "Finally books a time",
];

const after = ["Searches for a salon nearby", "Taps Book on a fast mobile site", "Picks a time and is booked"];

export default function StepsToYes() {
  const [mode, setMode] = useState<"before" | "after">("before");
  const list = mode === "before" ? before : after;

  return (
    <div className="steps-yes">
      <div className="toggle" role="group" aria-label="Compare the customer journey">
        <button type="button" aria-pressed={mode === "before"} onClick={() => setMode("before")}>
          Before
        </button>
        <button type="button" aria-pressed={mode === "after"} onClick={() => setMode("after")}>
          After
        </button>
      </div>

      <div className="yes-grid">
        <div className="yes-count" aria-live="polite">
          <span className="yes-num" key={mode}>
            {list.length}
          </span>
          <span className="yes-label">steps from a search to a booking</span>
          <span className="yes-note">
            {mode === "before"
              ? "Every step is a chance for the customer to give up and book somewhere else."
              : "Same customer, same salon. Six fewer reasons to give up."}
          </span>
        </div>
        <ol className={`yes-list yes-${mode}`} key={mode}>
          {list.map((s, i) => (
            <li key={s} style={{ animationDelay: `${i * 60}ms` }}>
              {s}
            </li>
          ))}
        </ol>
      </div>
      <p className="demo-caption" style={{ textAlign: "left", maxWidth: "none" }}>
        <strong>Example journey.</strong> This is how we review every site and app we build: count the
        steps, then remove them.
      </p>
    </div>
  );
}
