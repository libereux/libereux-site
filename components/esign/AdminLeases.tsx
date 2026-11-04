"use client";

import { useCallback, useEffect, useState } from "react";
import FieldEditor from "./FieldEditor";
import PropertyCalendar from "./PropertyCalendar";

type Signer = {
  name: string;
  email: string;
  role: string;
  status: "waiting" | "sent" | "viewed" | "signed";
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  typedName?: string;
};
type Envelope = {
  id: string;
  title: string;
  property: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  status: "draft" | "in_progress" | "completed" | "voided";
  completedAt?: string;
  driveLink?: string;
  fields?: unknown[];
  source?: "signed_here" | "imported";
  lease?: { tenants: string; start: string; end: string; rent?: number };
  current: number;
  pages: number;
  originalName: string;
  signers: Signer[];
  events: { at: string; type: string; actor: string; ip?: string; detail?: string }[];
};
type Data = { admin: string; properties: string[]; drive: { available: boolean; connected: boolean; connectedAt?: string }; envelopes: Envelope[] };

const when = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) + " ET"
    : "";

const statusLabel: Record<Signer["status"], string> = {
  waiting: "Waiting",
  sent: "Email sent",
  viewed: "Opened",
  signed: "Signed",
};

const blankSigners = () => [
  { name: "", email: "", role: "Tenant" },
  { name: "", email: "", role: "Tenant" },
  { name: "Sharo Hyatt", email: "", role: "Property Manager" },
  { name: "James Collins", email: "holdings@libereux.com", role: "Landlord" },
];

export default function AdminLeases() {
  const [data, setData] = useState<Data | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [tab, setTab] = useState<"calendar" | "leases">("calendar");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/esign/envelopes", { cache: "no-store" });
      if (r.status === 401) return setNeedLogin(true);
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Error ${r.status}`);
      setNeedLogin(false);
      setData(await r.json());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load.");
    }
  }, []);

  useEffect(() => {
    // Initial fetch of dashboard data from our own API, plus any message from the Drive connection.
    const d = new URLSearchParams(window.location.search).get("drive");
    const notes: Record<string, string> = {
      connected: "Google Drive is connected. Signed leases will be saved there automatically.",
      failed: "Google Drive did not connect. Check the setup steps and try again.",
      declined: "Google Drive was not connected because access was not allowed.",
      expired: "That Drive connection attempt expired. Try again.",
      unavailable: "Google sign-in is not set up on this site yet.",
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (d && notes[d]) setNotice(notes[d]);
    load();
  }, [load]);

  if (needLogin) return <Login />;
  if (loadError) return <p role="alert">{loadError}</p>;
  if (!data) return <p className="muted">Loading leases…</p>;

  return (
    <div className="esign">
      <div className="esign-bar">
        <p className="muted">Signed in as {data.admin}</p>
        <button
          className="btn btn-ghost"
          onClick={async () => {
            await fetch("/api/esign/logout", { method: "POST" });
            setData(null);
            setNeedLogin(true);
          }}
        >
          Sign out
        </button>
      </div>
      {notice && (
        <p role="status" className="esign-card">
          {notice}
        </p>
      )}
      {!editing && (
        <div className="esign-tabs" role="tablist">
          <button role="tab" aria-selected={tab === "calendar"} className={`esign-tab ${tab === "calendar" ? "is-on" : ""}`} onClick={() => setTab("calendar")}>
            Calendar
          </button>
          <button role="tab" aria-selected={tab === "leases"} className={`esign-tab ${tab === "leases" ? "is-on" : ""}`} onClick={() => setTab("leases")}>
            Leases
          </button>
        </div>
      )}
      {!editing && tab === "calendar" ? (
        <PropertyCalendar />
      ) : editing ? (
        <FieldEditor
          id={editing}
          onClose={(sent) => {
            setEditing(null);
            setNotice(sent ? "Sent. The first signer has the email now." : "Saved as a draft. Open it from the list to finish.");
            load();
            window.scrollTo({ top: 0 });
          }}
        />
      ) : (
        <>
          <DriveCard drive={data.drive} />
          <NewEnvelope properties={data.properties} onCreated={(id) => setEditing(id)} />
          <ImportLease properties={data.properties} onDone={load} />
          <h2>All leases</h2>
          {data.envelopes.length === 0 && <p className="muted">Nothing sent yet.</p>}
          <ul className="esign-list">
            {data.envelopes.map((e) => (
              <EnvelopeCard key={e.id} env={e} onChange={load} onEdit={() => setEditing(e.id)} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const note = params?.get("login") === "expired" ? "That sign-in link expired or was already used. Request a new one." : params?.get("login") === "invalid" ? "That sign-in link is not valid." : "";
  return (
    <form
      className="esign-card"
      onSubmit={async (ev) => {
        ev.preventDefault();
        setState("busy");
        const r = await fetch("/api/esign/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (r.ok) setState("sent");
        else {
          setState("error");
          setMsg((await r.json().catch(() => ({}))).error || "Could not send.");
        }
      }}
    >
      <h2>Sign in</h2>
      {note && <p role="alert">{note}</p>}
      {state === "sent" ? (
        <p>If {email} has access, a sign-in link is on its way. It expires in 15 minutes.</p>
      ) : (
        <>
          <label className="esign-field">
            <span>Your email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <button className="btn btn-primary" disabled={state === "busy"}>
            {state === "busy" ? "Sending…" : "Email me a sign-in link"}
          </button>
          {state === "error" && <p role="alert">{msg}</p>}
        </>
      )}
    </form>
  );
}

function DriveCard({ drive }: { drive: Data["drive"] }) {
  if (drive.connected) return <p className="muted">Google Drive connected: signed leases save to the folder &ldquo;Libereux Signed Leases&rdquo;.</p>;
  return (
    <div className="esign-card">
      <h2>Save signed leases to Google Drive</h2>
      <p>Connect once, signed in as holdings@libereux.com. The site can only see the files it creates there.</p>
      {drive.available ? (
        <p>
          <a className="btn btn-primary" href="/api/esign/drive">
            Connect Google Drive
          </a>
        </p>
      ) : (
        <p className="muted">Google sign-in is not set up on this site yet.</p>
      )}
    </div>
  );
}

function NewEnvelope({ properties, onCreated }: { properties: string[]; onCreated: (id: string) => void }) {
  const [title, setTitle] = useState("");
  const [property, setProperty] = useState(properties[0] || "");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [signers, setSigners] = useState(blankSigners);
  const [lease, setLease] = useState({ start: "", end: "", rent: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [formKey, setFormKey] = useState(0);

  const update = (i: number, k: "name" | "email" | "role", v: string) =>
    setSigners((s) => s.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const move = (i: number, d: -1 | 1) =>
    setSigners((s) => {
      const n = [...s];
      const j = i + d;
      if (j < 0 || j >= n.length) return s;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <form
      key={formKey}
      className="esign-card"
      onSubmit={async (ev) => {
        ev.preventDefault();
        if (!file) return setMsg({ ok: false, text: "Attach the lease PDF." });
        const list = signers.filter((s) => s.name.trim() || s.email.trim());
        setBusy(true);
        setMsg(null);
        const fd = new FormData();
        fd.set("title", title);
        fd.set("property", property);
        fd.set("notes", notes);
        fd.set("file", file);
        fd.set("signers", JSON.stringify(list));
        fd.set("start", lease.start);
        fd.set("end", lease.end);
        fd.set("rent", lease.rent);
        const r = await fetch("/api/esign/envelopes", { method: "POST", body: fd });
        const j = await r.json().catch(() => ({}));
        setBusy(false);
        if (!r.ok) return setMsg({ ok: false, text: j.error || `Error ${r.status}` });
        setTitle("");
        setNotes("");
        setFile(null);
        setSigners(blankSigners());
        setLease({ start: "", end: "", rent: "" });
        setFormKey((k) => k + 1);
        onCreated(j.id);
      }}
    >
      <h2>Send a lease for signature</h2>
      <p className="muted">Step 1 of 2. Next you place the signature, date and other boxes on the lease.</p>
      <label className="esign-field">
        <span>Lease title</span>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Murry Trail Upstairs Lease, Nov 2026 to Feb 2027" />
      </label>
      <label className="esign-field">
        <span>Property</span>
        <select value={property} onChange={(e) => setProperty(e.target.value)}>
          {properties.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label className="esign-field">
        <span>Lease PDF (final version, under 4 MB)</span>
        <input type="file" accept="application/pdf" required onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>
      <fieldset className="esign-signers">
        <legend>Signing order</legend>
        <p className="muted">Each person gets an email only after the one before them signs. Leave a row blank to skip it.</p>
        {signers.map((s, i) => (
          <div className="esign-signer" key={i}>
            <span className="esign-num">{i + 1}</span>
            <input aria-label={`Signer ${i + 1} role`} value={s.role} onChange={(e) => update(i, "role", e.target.value)} />
            <input aria-label={`Signer ${i + 1} name`} placeholder="Full name" value={s.name} onChange={(e) => update(i, "name", e.target.value)} />
            <input aria-label={`Signer ${i + 1} email`} type="email" placeholder="Email" value={s.email} onChange={(e) => update(i, "email", e.target.value)} />
            <span className="esign-move">
              <button type="button" onClick={() => move(i, -1)} aria-label="Move up">↑</button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Move down">↓</button>
              <button type="button" onClick={() => setSigners((x) => x.filter((_, j) => j !== i))} aria-label="Remove">✕</button>
            </span>
          </div>
        ))}
        <button type="button" className="btn btn-ghost" onClick={() => setSigners((x) => [...x, { name: "", email: "", role: "Tenant" }])}>
          Add a signer
        </button>
      </fieldset>
      <fieldset className="esign-signers">
        <legend>For the calendar</legend>
        <div className="esign-grid">
          <label className="esign-field">
            <span>Move-in</span>
            <input type="date" value={lease.start} onChange={(e) => setLease({ ...lease, start: e.target.value })} />
          </label>
          <label className="esign-field">
            <span>Last night (lease end)</span>
            <input type="date" value={lease.end} onChange={(e) => setLease({ ...lease, end: e.target.value })} />
          </label>
          <label className="esign-field">
            <span>Monthly rent</span>
            <input inputMode="decimal" placeholder="4300" value={lease.rent} onChange={(e) => setLease({ ...lease, rent: e.target.value })} />
          </label>
        </div>
        <p className="muted">Shows on the calendar as soon as it is sent, and turns solid once everyone signs.</p>
      </fieldset>
      <label className="esign-field">
        <span>Private notes (only you and Sharo see these)</span>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Uploading…" : "Next: place the boxes"}
      </button>
      {msg && (
        <p role="status" className={msg.ok ? "esign-ok" : "esign-err"}>
          {msg.text}
        </p>
      )}
    </form>
  );
}

function EnvelopeCard({ env, onChange, onEdit }: { env: Envelope; onChange: () => void; onEdit: () => void }) {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const act = async (action: "resend" | "void" | "drive") => {
    if (action === "void" && !confirm("Void this lease? The signing links stop working.")) return;
    setBusy(action);
    setMsg("");
    const r = await fetch("/api/esign/envelope", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: env.id, action }),
    });
    const j = await r.json().catch(() => ({}));
    setBusy("");
    setMsg(r.ok ? ({ resend: "Email sent.", void: "Voided.", drive: "Saved to Google Drive." } as const)[action] : j.error || "Failed.");
    onChange();
  };
  const badge =
    env.status === "completed"
      ? "Completed"
      : env.status === "voided"
        ? "Voided"
        : env.status === "draft"
          ? "Draft, not sent"
          : `Waiting on ${env.signers[env.current]?.name}`;

  return (
    <li className="esign-card">
      <div className="esign-head">
        <div>
          <h3>{env.title}</h3>
          <p className="muted">
            {env.property} · sent {when(env.createdAt)}
            {env.completedAt ? ` · completed ${when(env.completedAt)}` : ""}
          </p>
        </div>
        <span className={`esign-badge esign-${env.status}`}>{badge}</span>
      </div>
      <ol className="esign-order">
        {env.signers.map((s, i) => (
          <li key={i} className={s.status === "signed" ? "is-signed" : i === env.current && env.status === "in_progress" ? "is-current" : ""}>
            <strong>{s.role}:</strong> {s.typedName || s.name} &lt;{s.email}&gt; · {statusLabel[s.status]}
            {s.signedAt ? ` ${when(s.signedAt)}` : s.viewedAt ? ` ${when(s.viewedAt)}` : s.sentAt ? ` ${when(s.sentAt)}` : ""}
          </li>
        ))}
      </ol>
      <LeaseDates env={env} onChange={onChange} />
      {env.notes && <p className="muted">Notes: {env.notes}</p>}
      <div className="btn-row">
        <a className="btn btn-ghost" href={`/api/esign/file?id=${env.id}&kind=original`} target="_blank" rel="noreferrer">
          Original
        </a>
        {env.status === "completed" && (
          <a className="btn btn-primary" href={`/api/esign/file?id=${env.id}&kind=signed&download=1`}>
            Download signed copy
          </a>
        )}
        {env.status === "draft" && (
          <button className="btn btn-primary" onClick={onEdit}>
            Place boxes and send
          </button>
        )}
        {env.status === "completed" &&
          (env.driveLink ? (
            <a className="btn btn-ghost" href={env.driveLink} target="_blank" rel="noreferrer">
              Open in Google Drive
            </a>
          ) : (
            <button className="btn btn-ghost" disabled={!!busy} onClick={() => act("drive")}>
              {busy === "drive" ? "Saving…" : "Save to Google Drive"}
            </button>
          ))}
        {(env.status === "in_progress" || (env.status === "completed" && env.source !== "imported")) && (
          <button className="btn btn-ghost" disabled={!!busy} onClick={() => act("resend")}>
            {busy === "resend" ? "Sending…" : env.status === "completed" ? "Re-email signed copy to all" : "Resend email"}
          </button>
        )}
        {(env.status === "in_progress" || env.status === "draft") && (
          <button className="btn btn-ghost" disabled={!!busy} onClick={() => act("void")}>
            Void
          </button>
        )}
      </div>
      {msg && <p role="status">{msg}</p>}
      <details>
        <summary>Audit trail ({env.events.length})</summary>
        <ul className="esign-events">
          {env.events.map((e, i) => (
            <li key={i}>
              {when(e.at)} · <strong>{e.type}</strong> · {e.actor}
              {e.ip ? ` · IP ${e.ip}` : ""}
              {e.detail ? ` · ${e.detail}` : ""}
            </li>
          ))}
        </ul>
      </details>
    </li>
  );
}

const day = (s: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(new Date(`${s}T00:00:00Z`));

function LeaseDates({ env, onChange }: { env: Envelope; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ tenants: env.lease?.tenants || "", start: env.lease?.start || "", end: env.lease?.end || "", rent: env.lease?.rent ? String(env.lease.rent) : "" });
  const [err, setErr] = useState("");
  if (env.status === "voided") return null;
  return (
    <div className="esign-lease">
      {env.lease ? (
        <p>
          <strong>Lease:</strong> {env.lease.tenants} · {day(env.lease.start)} to {day(env.lease.end)}
          {env.lease.rent ? ` · $${env.lease.rent.toLocaleString("en-US")}/month` : ""}
          {env.source === "imported" ? " · signed outside this site" : ""}
        </p>
      ) : (
        <p className="muted">Not on the calendar yet: add the lease dates.</p>
      )}
      <button type="button" className="esign-tool" onClick={() => setOpen(!open)}>
        {open ? "Cancel" : env.lease ? "Edit dates" : "Add dates"}
      </button>
      {open && (
        <form
          className="esign-grid"
          onSubmit={async (ev) => {
            ev.preventDefault();
            const r = await fetch("/api/esign/envelope", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: env.id, action: "lease", lease: f }),
            });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) return setErr(j.error || "Could not save.");
            setOpen(false);
            setErr("");
            onChange();
          }}
        >
          <label className="esign-field">
            <span>Tenants</span>
            <input value={f.tenants} onChange={(e) => setF({ ...f, tenants: e.target.value })} />
          </label>
          <label className="esign-field">
            <span>Move-in</span>
            <input type="date" required value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} />
          </label>
          <label className="esign-field">
            <span>Last night</span>
            <input type="date" required value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} />
          </label>
          <label className="esign-field">
            <span>Monthly rent</span>
            <input inputMode="decimal" value={f.rent} onChange={(e) => setF({ ...f, rent: e.target.value })} />
          </label>
          <div className="esign-wide">
            <button className="btn btn-primary">Save dates</button>
            {err && <p className="esign-err">{err}</p>}
          </div>
        </form>
      )}
    </div>
  );
}

function ImportLease({ properties, onDone }: { properties: string[]; onDone: () => void }) {
  const blank = { property: properties[0], tenants: "", start: "", end: "", rent: "", signedOn: "", title: "", notes: "" };
  const [f, setF] = useState(blank);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [key, setKey] = useState(0);
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <details className="esign-card" key={key}>
      <summary>
        <strong>Add a lease that was already signed</strong> <span className="muted">(paper or another e-sign service)</span>
      </summary>
      <form
        className="esign-grid"
        onSubmit={async (ev) => {
          ev.preventDefault();
          if (!file) return setMsg({ ok: false, text: "Attach the signed PDF." });
          setBusy(true);
          const fd = new FormData();
          Object.entries(f).forEach(([k, v]) => fd.set(k, v));
          fd.set("file", file);
          const r = await fetch("/api/esign/import", { method: "POST", body: fd });
          const j = await r.json().catch(() => ({}));
          setBusy(false);
          if (!r.ok) return setMsg({ ok: false, text: j.error || "Could not save." });
          setF(blank);
          setFile(null);
          setKey((k) => k + 1);
          onDone();
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
          <span>Tenants</span>
          <input required placeholder="Patrick Rivers, Yosha Rivers" value={f.tenants} onChange={set("tenants")} />
        </label>
        <label className="esign-field">
          <span>Lease start</span>
          <input type="date" required value={f.start} onChange={set("start")} />
        </label>
        <label className="esign-field">
          <span>Lease end (last night)</span>
          <input type="date" required value={f.end} onChange={set("end")} />
        </label>
        <label className="esign-field">
          <span>Monthly rent</span>
          <input inputMode="decimal" value={f.rent} onChange={set("rent")} />
        </label>
        <label className="esign-field">
          <span>Date signed</span>
          <input type="date" value={f.signedOn} onChange={set("signedOn")} />
        </label>
        <label className="esign-field">
          <span>Title (optional)</span>
          <input placeholder="Harrison Dr Lease 2026 to 2028" value={f.title} onChange={set("title")} />
        </label>
        <label className="esign-field">
          <span>Signed PDF</span>
          <input type="file" accept="application/pdf" required onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        <label className="esign-field esign-wide">
          <span>Private notes (optional)</span>
          <input value={f.notes} onChange={set("notes")} />
        </label>
        <div className="esign-wide">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Saving…" : "Add to records and calendar"}
          </button>
          {msg && <p className={msg.ok ? "esign-ok" : "esign-err"}>{msg.text}</p>}
        </div>
      </form>
    </details>
  );
}
