"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Report } from "@/lib/website-check/types";

type State = { kind: "idle" } | { kind: "running"; host: string } | { kind: "done"; report: Report } | { kind: "error"; message: string };

const STAGES = ["Reaching the website", "Reading the page", "Checking phones and speed", "Checking search details", "Ranking what matters most"];

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const tone = score >= 85 ? "good" : score >= 60 ? "fair" : "poor";
  return (
    <div className={`wc-ring wc-ring-${tone}`}>
      <svg viewBox="0 0 128 128" aria-hidden="true">
        <circle cx="64" cy="64" r={r} fill="none" strokeWidth="12" className="wc-ring-track" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`}
          transform="rotate(-90 64 64)"
          className="wc-ring-value"
        />
      </svg>
      <span className="wc-ring-num">
        {score}
        <small>/100</small>
      </span>
    </div>
  );
}

export default function WebsiteCheck() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [stage, setStage] = useState(0);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const run = useCallback(async (target: string) => {
    const clean = target.trim();
    if (!clean) return;
    setState({ kind: "running", host: clean.replace(/^https?:\/\//, "").replace(/\/$/, "") });
    setStage(0);
    try {
      const res = await fetch("/api/website-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: clean }),
      });
      const body = (await res.json().catch(() => ({}))) as { report?: Report; error?: string };
      if (!res.ok || !body.report) throw new Error(body.error || "We could not check that website. Please try again.");
      setState({ kind: "done", report: body.report });
      const share = new URL(window.location.href);
      share.searchParams.set("url", clean);
      window.history.replaceState(null, "", share.toString());
      setTimeout(() => resultRef.current?.focus(), 50);
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : "Something went wrong." });
    }
  }, []);

  // Shared links (?url=) run the check automatically.
  useEffect(() => {
    const u = new URLSearchParams(window.location.search).get("url");
    if (!u) return;
    const t = window.setTimeout(() => {
      setUrl(u);
      void run(u);
    }, 0);
    return () => window.clearTimeout(t);
  }, [run]);

  // Progress labels while the check runs (it usually takes a few seconds).
  useEffect(() => {
    if (state.kind !== "running") return;
    const t = window.setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 1100);
    return () => window.clearInterval(t);
  }, [state.kind]);

  const report = state.kind === "done" ? state.report : null;
  const failed = report ? report.checks.filter((c) => !c.ok) : [];
  const passed = report ? report.checks.filter((c) => c.ok) : [];

  const bookHref = report
    ? `/contact?service=website-updates-seo&note=${encodeURIComponent(
        `I ran the free website check on ${report.host} (score ${report.score}/100). ${
          report.topFixes.length ? `Top fixes: ${report.topFixes.map((f) => f.label).join(", ")}.` : ""
        } I'd like a walkthrough.`,
      )}`
    : "/contact";

  return (
    <div className="wc">
      <form
        className="wc-form"
        onSubmit={(e) => {
          e.preventDefault();
          void run(url);
        }}
      >
        <label htmlFor="wc-url">Your website address</label>
        <div className="wc-row">
          <input
            id="wc-url"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourbusiness.com"
            inputMode="url"
            autoComplete="url"
            required
          />
          <button type="submit" className="btn btn-primary" disabled={state.kind === "running"}>
            {state.kind === "running" ? "Checking" : "Check my website"}
          </button>
        </div>
        <p className="wc-hint">Free, no sign-up. We read the public page only and do not store results.</p>
      </form>

      <div aria-live="polite">
        {state.kind === "running" && (
          <div className="wc-running">
            <span className="wc-spinner" aria-hidden="true" />
            <div>
              <strong>Checking {state.host}</strong>
              <span>{STAGES[stage]}</span>
            </div>
          </div>
        )}
        {state.kind === "error" && <p className="form-status err">{state.message}</p>}
      </div>

      {report && (
        <div className="wc-report" ref={resultRef} tabIndex={-1} aria-labelledby="wc-report-title">
          <div className="wc-summary">
            <ScoreRing score={report.score} />
            <div className="wc-summary-text">
              <p className="wc-kicker">Website check for</p>
              <h2 id="wc-report-title">{report.host}</h2>
              <p className="wc-verdict">{report.verdict}</p>
              <p className="wc-meta">
                {passed.length} of {report.checks.length} checks passed. Checked{" "}
                {new Date(report.checkedAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}.
              </p>
            </div>
          </div>

          {report.topFixes.length > 0 ? (
            <section className="wc-fixes" aria-labelledby="wc-fixes-title">
              <h3 id="wc-fixes-title">Fix these first</h3>
              <ol>
                {report.topFixes.map((f) => (
                  <li key={f.id}>
                    <h4>{f.label}</h4>
                    <p className="wc-found">{f.detail}</p>
                    <p>
                      <strong>Why it matters.</strong> {f.why}
                    </p>
                    <p>
                      <strong>The fix.</strong> {f.fix}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ) : (
            <p className="wc-allgood">Every check passed. The next gains come from content and search visibility over time.</p>
          )}

          <details className="wc-all">
            <summary>See all {report.checks.length} checks</summary>
            <ul>
              {[...failed, ...passed].map((c) => (
                <li key={c.id} className={c.ok ? "ok" : "warn"}>
                  <span className="wc-dot" aria-hidden="true" />
                  <span>
                    <b>{c.label}</b>
                    <span className="sr-only">{c.ok ? ": passed." : ": needs attention."}</span>
                    <span className="wc-detail">{c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </details>

          <p className="wc-note">
            This check reads the page as our server receives it. Content that loads later by script may not be counted, and
            speed depends on our server&apos;s distance from yours.
          </p>

          <div className="wc-actions">
            <Link href={bookHref} className="btn btn-primary">
              Book a free consultation
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  /* clipboard unavailable */
                }
              }}
            >
              {copied ? "Link copied" : "Copy link to this report"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
              Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
