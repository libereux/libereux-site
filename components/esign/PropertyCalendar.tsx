"use client";

// Who is in each property and when: leases (signed here or imported), stays entered by hand,
// and Airbnb or VRBO bookings pulled from each listing's calendar link.
import { useCallback, useEffect, useState } from "react";

type Ev = {
  id: string;
  property: string;
  start: string;
  end: string; // checkout day
  title: string;
  kind: "lease" | "lease-pending" | "stay" | "feed" | "blocked";
  source: string;
  detail?: string;
  envelopeId?: string;
  bookingId?: string;
};
type Feed = { property: string; source: string; url: string };
type Data = {
  properties: string[];
  sources: string[];
  subscribeUrl: string;
  events: Ev[];
  feeds: Feed[];
  feedErrors: string[];
  conflicts: { property: string; a: string; b: string; from: string; to: string }[];
};

const DAY = 86_400_000;
const toDay = (d: Date) => d.toISOString().slice(0, 10);
const parse = (s: string) => new Date(`${s}T00:00:00Z`);
const addDays = (s: string, n: number) => toDay(new Date(parse(s).getTime() + n * DAY));
const addMonths = (s: string, n: number) => {
  const d = parse(s);
  d.setUTCMonth(d.getUTCMonth() + n, 1);
  return toDay(d);
};
const todayStr = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
const nice = (s: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(parse(s));
const monthName = (s: string, long = false) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: long ? "long" : "short", year: "numeric" }).format(parse(s));
const short = (p: string) => (p.startsWith("2098") ? "Morrow (Upstairs)" : p.startsWith("2707") ? "Lawrenceville" : p.split(",")[0]);

export const colorFor = (e: Ev) =>
  e.kind === "lease"
    ? "#1B2A4A"
    : e.kind === "lease-pending"
      ? "#C2410C"
      : e.kind === "blocked"
        ? "#9CA3AF"
        : e.source === "Airbnb"
          ? "#E0484E"
          : e.source === "VRBO"
            ? "#1E64C8"
            : e.source === "Booking.com"
              ? "#003580"
              : e.source === "Direct"
                ? "#15803D"
                : "#6B21A8";

export default function PropertyCalendar() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  const [span, setSpan] = useState<1 | 3 | 12>(3);
  const [from, setFrom] = useState(() => addMonths(todayStr(), 0));
  const [showBlocked, setShowBlocked] = useState(false);
  const [picked, setPicked] = useState<Ev | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/esign/calendar", { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setErr(j.error || "Could not load the calendar.");
    setData(j);
  }, []);
  useEffect(() => {
    // Initial fetch from our own API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const to = addMonths(from, span);
  const days = Math.round((parse(to).getTime() - parse(from).getTime()) / DAY);
  const today = todayStr();

  const visible = (data?.events || []).filter((e) => (showBlocked || e.kind !== "blocked") && e.start < to && e.end > from);

  if (err) return <p role="alert">{err}</p>;
  if (!data) return <p className="muted">Loading the calendar…</p>;

  const pct = (d: string) => (Math.min(Math.max(parse(d).getTime() - parse(from).getTime(), 0), days * DAY) / (days * DAY)) * 100;
  const ticks: { at: number; label: string }[] = [];
  if (span === 1) {
    for (let i = 0; i < days; i += 1) ticks.push({ at: (i / days) * 100, label: String(parse(addDays(from, i)).getUTCDate()) });
  } else {
    for (let m = 0; m < span; m++) ticks.push({ at: pct(addMonths(from, m)), label: monthName(addMonths(from, m)) });
  }

  return (
    <div className="esign">
      {data.conflicts.length > 0 && (
        <div className="esign-card esign-warn" role="alert">
          <strong>Double booking</strong>
          {data.conflicts.map((c, i) => (
            <p key={i}>
              {short(c.property)}: {c.a} and {c.b} overlap {nice(c.from)} to {nice(c.to)}.
            </p>
          ))}
        </div>
      )}
      {data.feedErrors.length > 0 && <p className="esign-err">{data.feedErrors.join(". ")}. Showing the last bookings we could read.</p>}

      <div className="esign-card">
        <div className="esign-cal-bar">
          <div className="btn-row">
            <button className="btn btn-ghost" onClick={() => setFrom(addMonths(from, -span))} aria-label="Earlier">
              ←
            </button>
            <button className="btn btn-ghost" onClick={() => setFrom(addMonths(todayStr(), 0))}>
              Today
            </button>
            <button className="btn btn-ghost" onClick={() => setFrom(addMonths(from, span))} aria-label="Later">
              →
            </button>
          </div>
          <strong>
            {span === 1 ? monthName(from, true) : `${monthName(from)} to ${monthName(addMonths(from, span - 1))}`}
          </strong>
          <div className="btn-row" role="group" aria-label="How much to show">
            {([1, 3, 12] as const).map((n) => (
              <button key={n} className={`esign-tool ${span === n ? "is-on" : ""}`} onClick={() => setSpan(n)}>
                {n === 1 ? "Month" : n === 3 ? "3 months" : "Year"}
              </button>
            ))}
          </div>
        </div>

        <div className="esign-timeline">
          <div className="esign-tl-head">
            <span />
            <div className="esign-tl-axis">
              {ticks.map((t, i) => (
                <span key={i} style={{ left: `${t.at}%` }}>
                  {t.label}
                </span>
              ))}
            </div>
          </div>
          {data.properties.map((p) => {
            const evs = visible.filter((e) => e.property === p);
            const lanes: string[] = [];
            const placed = evs.map((e) => {
              let lane = lanes.findIndex((endDay) => endDay <= e.start);
              if (lane === -1) lane = lanes.push(e.end) - 1;
              else lanes[lane] = e.end;
              return { e, lane };
            });
            const rows = Math.max(1, lanes.length);
            return (
              <div className="esign-tl-row" key={p}>
                <div className="esign-tl-name">{short(p)}</div>
                <div className="esign-tl-track" style={{ height: rows * 34 + 8 }}>
                  {span === 1 &&
                    Array.from({ length: days }).map((_, i) => (
                      <span key={i} className="esign-tl-grid" style={{ left: `${(i / days) * 100}%` }} />
                    ))}
                  {today >= from && today < to && <span className="esign-tl-today" style={{ left: `${pct(today)}%` }} title="Today" />}
                  {placed.length === 0 && <span className="esign-tl-empty">Vacant</span>}
                  {placed.map(({ e, lane }) => (
                    <button
                      key={e.id}
                      className={`esign-cal-event esign-k-${e.kind}`}
                      style={{
                        left: `${pct(e.start)}%`,
                        width: `max(6px, ${pct(e.end) - pct(e.start)}%)`,
                        top: 4 + lane * 34,
                        ["--c" as string]: colorFor(e),
                      }}
                      onClick={() => setPicked(e)}
                      title={`${e.title}, ${nice(e.start)} to ${nice(e.end)}`}
                    >
                      {e.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="esign-legend">
          {[
            ["#1B2A4A", "Signed lease"],
            ["#C2410C", "Lease awaiting signatures"],
            ["#15803D", "Direct stay"],
            ["#E0484E", "Airbnb"],
            ["#1E64C8", "VRBO"],
          ].map(([c, l]) => (
            <span key={l}>
              <i style={{ background: c }} /> {l}
            </span>
          ))}
          <label className="esign-inline">
            <input type="checkbox" checked={showBlocked} onChange={(e) => setShowBlocked(e.target.checked)} /> Show dates blocked on the platforms
          </label>
        </div>

        {picked && <EventDetail e={picked} onClose={() => setPicked(null)} onDeleted={() => (setPicked(null), load())} />}
      </div>

      <div className="esign-card">
        <h2>
          {span === 1 ? "This month" : "In this period"} ({visible.length})
        </h2>
        {visible.length === 0 ? (
          <p className="muted">Nothing booked.</p>
        ) : (
          <ul className="esign-cal-list">
            {visible.map((e) => (
              <li key={e.id}>
                <i style={{ background: colorFor(e) }} />
                <div>
                  <strong>{e.title}</strong>
                  <span className="muted">
                    {" "}
                    · {short(e.property)} · {nice(e.start)} to {nice(e.end)} {e.kind === "lease" || e.kind === "lease-pending" ? "(move-out)" : "(checkout)"} ·{" "}
                    {e.source}
                  </span>
                  {e.detail && <div className="muted">{e.detail}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddStay properties={data.properties} sources={data.sources} onAdded={load} />
      <Feeds data={data} onSaved={load} />
      <Subscribe url={data.subscribeUrl} onChanged={load} />
    </div>
  );
}

function EventDetail({ e, onClose, onDeleted }: { e: Ev; onClose: () => void; onDeleted: () => void }) {
  return (
    <div className="esign-detail" role="dialog" aria-label="Booking details">
      <strong>{e.title}</strong>
      <p>
        {short(e.property)} · {nice(e.start)} to {nice(e.end)} · {e.source}
      </p>
      {e.detail && <p className="muted">{e.detail}</p>}
      {e.kind === "feed" && <p className="muted">From the platform&apos;s calendar link. Guest names are only shown inside the platform.</p>}
      <div className="btn-row">
        {e.bookingId && (
          <button
            className="esign-tool esign-danger"
            onClick={async () => {
              if (!confirm("Delete this stay?")) return;
              await fetch("/api/esign/calendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete-stay", id: e.bookingId }),
              });
              onDeleted();
            }}
          >
            Delete stay
          </button>
        )}
        <button className="esign-tool" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

function AddStay({ properties, sources, onAdded }: { properties: string[]; sources: string[]; onAdded: () => void }) {
  const blank = { property: properties[0], start: "", end: "", guest: "", source: "Direct", phone: "", email: "", amount: "", notes: "" };
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <details className="esign-card">
      <summary>
        <strong>Add a stay by hand</strong> <span className="muted">(a guest who booked directly without a lease, or platform booking details)</span>
      </summary>
      <form
        className="esign-grid"
        onSubmit={async (ev) => {
          ev.preventDefault();
          const r = await fetch("/api/esign/calendar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "add-stay", ...f }),
          });
          const j = await r.json().catch(() => ({}));
          if (!r.ok) return setMsg({ ok: false, text: j.error || "Could not save." });
          setMsg({ ok: true, text: "Added to the calendar." });
          setF(blank);
          onAdded();
        }}
      >
        <label className="esign-field">
          <span>Property</span>
          <select value={f.property} onChange={set("property")}>
            {properties.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="esign-field">
          <span>Booked through</span>
          <select value={f.source} onChange={set("source")}>
            {sources.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="esign-field">
          <span>Guest name</span>
          <input required value={f.guest} onChange={set("guest")} />
        </label>
        <label className="esign-field">
          <span>Check-in</span>
          <input type="date" required value={f.start} onChange={set("start")} />
        </label>
        <label className="esign-field">
          <span>Check-out</span>
          <input type="date" required value={f.end} onChange={set("end")} />
        </label>
        <label className="esign-field">
          <span>Total paid (optional)</span>
          <input inputMode="decimal" value={f.amount} onChange={set("amount")} />
        </label>
        <label className="esign-field">
          <span>Phone (optional)</span>
          <input value={f.phone} onChange={set("phone")} />
        </label>
        <label className="esign-field">
          <span>Email (optional)</span>
          <input type="email" value={f.email} onChange={set("email")} />
        </label>
        <label className="esign-field esign-wide">
          <span>Notes (optional)</span>
          <input value={f.notes} onChange={set("notes")} />
        </label>
        <div className="esign-wide">
          <button className="btn btn-primary">Add to calendar</button>
          {msg && <p className={msg.ok ? "esign-ok" : "esign-err"}>{msg.text}</p>}
        </div>
      </form>
    </details>
  );
}

function Feeds({ data, onSaved }: { data: Data; onSaved: () => void }) {
  const [rows, setRows] = useState<Feed[]>(data.feeds.length ? data.feeds : [{ property: data.properties[0], source: "Airbnb", url: "" }]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <details className="esign-card" open={data.feeds.length === 0}>
      <summary>
        <strong>Airbnb and VRBO calendar links</strong> <span className="muted">({data.feeds.length} connected)</span>
      </summary>
      <p className="muted">
        Airbnb: Calendar, pick the listing, Availability, Connect calendars (Sync calendars), Export calendar, copy the link. VRBO: Calendar, Import and export, Export.
        Bookings appear here within a few hours of being made, which is how often the platforms refresh these links.
      </p>
      {rows.map((r, i) => (
        <div className="esign-feed" key={i}>
          <select aria-label="Property" value={r.property} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, property: e.target.value } : x)))}>
            {data.properties.map((p) => (
              <option key={p} value={p}>
                {short(p)}
              </option>
            ))}
          </select>
          <select aria-label="Platform" value={r.source} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, source: e.target.value } : x)))}>
            {data.sources
              .filter((s) => s !== "Direct")
              .map((s) => (
                <option key={s}>{s}</option>
              ))}
          </select>
          <input aria-label="Calendar link" placeholder="https://www.airbnb.com/calendar/ical/….ics" value={r.url} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
          <button type="button" className="esign-tool" aria-label="Remove" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
            ✕
          </button>
        </div>
      ))}
      <div className="btn-row">
        <button type="button" className="btn btn-ghost" onClick={() => setRows([...rows, { property: data.properties[0], source: "Airbnb", url: "" }])}>
          Add a link
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            const r = await fetch("/api/esign/calendar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "feeds", feeds: rows.filter((x) => x.url.trim()) }),
            });
            const j = await r.json().catch(() => ({}));
            setMsg(r.ok ? { ok: true, text: "Saved." } : { ok: false, text: j.error || "Could not save." });
            if (r.ok) onSaved();
          }}
        >
          Save links
        </button>
      </div>
      {msg && <p className={msg.ok ? "esign-ok" : "esign-err"}>{msg.text}</p>}
    </details>
  );
}

function Subscribe({ url, onChanged }: { url: string; onChanged: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <details className="esign-card">
      <summary>
        <strong>See this calendar in Google Calendar or on your phone</strong>
      </summary>
      <p>
        In Google Calendar on a computer: Other calendars, +, From URL, paste this link. It works for Sharo&apos;s calendar too. Google refreshes it every few
        hours.
      </p>
      <p className="esign-code">{url}</p>
      <div className="btn-row">
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
          }}
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={async () => {
            if (!confirm("Make a new link? Calendars using the old link stop updating until you add the new one.")) return;
            await fetch("/api/esign/calendar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "new-subscribe-link" }) });
            onChanged();
          }}
        >
          Replace link
        </button>
      </div>
      <p className="muted">Keep this link private: anyone with it can see who is staying and when.</p>
    </details>
  );
}
