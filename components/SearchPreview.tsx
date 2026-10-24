"use client";

import { useState } from "react";

export default function SearchPreview() {
  const [name, setName] = useState("Fade & Grace Studio");
  const [service, setService] = useState("Silk press and braids");
  const [city, setCity] = useState("Johannesburg");

  const slug = name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "") || "yourbusiness";
  const title = `${service || "Your service"} in ${city || "your city"} | ${name || "Your business"}`;
  const desc = `${name || "Your business"} offers ${(service || "your service").toLowerCase()} in ${
    city || "your city"
  }. See prices and opening hours, and book online in under a minute.`;

  const checks = [
    { ok: title.length <= 60, text: `Title is ${title.length} characters (aim for 60 or fewer so it is not cut off)` },
    { ok: desc.length <= 160, text: `Description is ${desc.length} characters (aim for 160 or fewer)` },
    { ok: Boolean(city.trim()), text: "Mentions your city, so local searches can match you" },
    { ok: Boolean(service.trim()), text: "Leads with what you do, in the words customers search" },
  ];

  return (
    <div className="serp">
      <div className="serp-form">
        <label>
          Business name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
        </label>
        <label>
          Main service
          <input value={service} onChange={(e) => setService(e.target.value)} maxLength={60} />
        </label>
        <label>
          City
          <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={40} />
        </label>
      </div>

      <div className="serp-preview" aria-live="polite">
        <span className="serp-tag">Search result preview</span>
        <span className="serp-url">{slug}.com</span>
        <span className="serp-title">{title.length > 60 ? `${title.slice(0, 58)}...` : title}</span>
        <span className="serp-desc">{desc.length > 160 ? `${desc.slice(0, 157)}...` : desc}</span>
        <ul className="serp-checks">
          {checks.map((c) => (
            <li key={c.text} className={c.ok ? "ok" : "warn"}>
              {c.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
