"use client";

import { useCallback, useEffect, useState } from "react";

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
  status: "in_progress" | "completed" | "voided";
  completedAt?: string;
  current: number;
  pages: number;
  originalName: string;
  signers: Signer[];
  events: { at: string; type: string; actor: string; ip?: string; detail?: string }[];
};
type Data = { admin: string; properties: string[]; envelopes: Envelope[] };

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
    // Initial fetch of dashboard data from our own API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <NewEnvelope properties={data.properties} onSent={load} />
      <h2>All leases</h2>
      {data.envelopes.length === 0 && <p className="muted">Nothing sent yet.</p>}
      <ul className="esign-list">
        {data.envelopes.map((e) => (
          <EnvelopeCard key={e.id} env={e} onChange={load} />
        ))}
      </ul>
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

function NewEnvelope({ properties, onSent }: { properties: string[]; onSent: () => void }) {
  const [title, setTitle] = useState("");
  const [property, setProperty] = useState(properties[0] || "");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [signers, setSigners] = useState(blankSigners);
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
        if (!confirm(`Send "${title}" for signature?\n\nOrder:\n${list.map((s, i) => `${i + 1}. ${s.role}: ${s.name} <${s.email}>`).join("\n")}\n\nThe first signer gets an email right away.`)) return;
        setBusy(true);
        setMsg(null);
        const fd = new FormData();
        fd.set("title", title);
        fd.set("property", property);
        fd.set("notes", notes);
        fd.set("file", file);
        fd.set("signers", JSON.stringify(list));
        const r = await fetch("/api/esign/envelopes", { method: "POST", body: fd });
        const j = await r.json().catch(() => ({}));
        setBusy(false);
        if (!r.ok) return setMsg({ ok: false, text: j.error || `Error ${r.status}` });
        setMsg({
          ok: !!j.emailed,
          text: j.emailed
            ? `Sent. ${list[0].name} has the signing email now.`
            : `Saved, but the email did not go out (${j.error}). Use "Resend email" below.`,
        });
        setTitle("");
        setNotes("");
        setFile(null);
        setSigners(blankSigners());
        setFormKey((k) => k + 1);
        onSent();
      }}
    >
      <h2>Send a lease for signature</h2>
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
      <label className="esign-field">
        <span>Private notes (only you and Sharo see these)</span>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Sending…" : "Send for signature"}
      </button>
      {msg && (
        <p role="status" className={msg.ok ? "esign-ok" : "esign-err"}>
          {msg.text}
        </p>
      )}
    </form>
  );
}

function EnvelopeCard({ env, onChange }: { env: Envelope; onChange: () => void }) {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const act = async (action: "resend" | "void") => {
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
    setMsg(r.ok ? (action === "resend" ? "Email sent." : "Voided.") : j.error || "Failed.");
    onChange();
  };
  const badge = env.status === "completed" ? "Completed" : env.status === "voided" ? "Voided" : `Waiting on ${env.signers[env.current]?.name}`;

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
        {env.status !== "voided" && (
          <button className="btn btn-ghost" disabled={!!busy} onClick={() => act("resend")}>
            {busy === "resend" ? "Sending…" : env.status === "completed" ? "Re-email signed copy to all" : "Resend email"}
          </button>
        )}
        {env.status === "in_progress" && (
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
