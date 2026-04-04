"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ALERT_STORAGE_KEY,
  buildTimeline,
  parseCsvToAlerts,
  sampleAlerts,
  sampleCsv,
  summarizeAlerts,
} from "@/lib/alert-data";
import { ThemeToggle } from "./theme-toggle";

export function HomeClient() {
  const [csvInput, setCsvInput] = useState(sampleCsv);
  const [status, setStatus] = useState("Sample threat data loaded. Ready for triage.");

  const parsedAlerts = useMemo(() => {
    const alerts = parseCsvToAlerts(csvInput);
    return alerts.length > 0 ? alerts : sampleAlerts;
  }, [csvInput]);

  const stats = useMemo(() => summarizeAlerts(parsedAlerts), [parsedAlerts]);
  const primaryAlert = parsedAlerts[0];
  const timeline = buildTimeline(parsedAlerts);

  function analyzeCsv() {
    const alerts = parseCsvToAlerts(csvInput);
    if (alerts.length === 0) {
      setStatus("No valid rows detected. Use the sample format or paste a valid CSV.");
      return;
    }

    window.localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(alerts));
    setStatus(
      `Parsed ${alerts.length} alerts. Dashboard data updated with ${alerts.filter((alert) => alert.severity === "Critical").length} critical events.`
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 py-8 md:px-10">
      <section className="rounded-[2rem] border border-line bg-surface p-6 shadow-[0_25px_80px_var(--shadow)] backdrop-blur xl:p-10">
        <div className="grid gap-10 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                  Security Investigation Copilot
                </span>
                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                  CSV Triage Flow
                </span>
              </div>
              <ThemeToggle />
            </div>

            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.5em] text-muted">
                KAVACH
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-foreground md:text-7xl">
                Detect suspicious activity.
                <span className="block text-accent">
                  Explain why it matters.
                </span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted md:text-xl">
                Paste a threat CSV, generate structured alerts, and push the result
                straight into the command center for investigation.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={analyzeCsv}
                className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Analyze Threat CSV
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-line bg-panel px-6 py-3 text-sm font-semibold text-foreground transition hover:border-cyan-300/45 hover:bg-panel-strong"
              >
                Open Command Center
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-line bg-panel p-4">
                <p className="text-3xl font-semibold text-foreground">
                  {stats.openAlerts}
                </p>
                <p className="mt-1 text-sm text-muted">Parsed alerts</p>
              </div>
              <div className="rounded-2xl border border-line bg-panel p-4">
                <p className="text-3xl font-semibold text-foreground">
                  {stats.highRisk}
                </p>
                <p className="mt-1 text-sm text-muted">High-risk events</p>
              </div>
              <div className="rounded-2xl border border-line bg-panel p-4">
                <p className="text-3xl font-semibold text-foreground">
                  {stats.averageConfidence}%
                </p>
                <p className="mt-1 text-sm text-muted">Average confidence</p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-line bg-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-muted">
                    Upload Simulator
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">
                    Threat CSV input
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setCsvInput(sampleCsv)}
                  className="rounded-full border border-line bg-panel-strong px-4 py-2 text-sm font-medium text-foreground transition hover:border-cyan-300/30"
                >
                  Reset sample
                </button>
              </div>

              <textarea
                value={csvInput}
                onChange={(event) => setCsvInput(event.target.value)}
                className="mt-5 min-h-52 w-full rounded-[1.25rem] border border-line bg-panel-strong p-4 font-mono text-sm leading-7 text-foreground outline-none transition focus:border-cyan-300/45"
                spellCheck={false}
              />

              <p className="mt-4 text-sm text-muted">{status}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-cyan-300/15 bg-panel-strong p-5 shadow-[0_0_60px_rgba(103,232,249,0.08)]">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-muted">
                    Live Triage
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">
                    Incident preview
                  </h2>
                </div>
                <span className="rounded-full bg-rose-400/15 px-3 py-1 text-xs font-semibold text-rose-200">
                  {primaryAlert.severity}
                </span>
              </div>

              <div className="space-y-4 py-5">
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
                  <p className="text-sm text-foreground">{primaryAlert.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-line bg-panel p-3">
                    <p className="text-muted">Confidence</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {primaryAlert.confidence}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-line bg-panel p-3">
                    <p className="text-muted">Owner</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {primaryAlert.owner}
                    </p>
                  </div>
                  <div className="rounded-xl border border-line bg-panel p-3">
                    <p className="text-muted">Top vector</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {primaryAlert.vector}
                    </p>
                  </div>
                  <div className="rounded-xl border border-line bg-panel p-3">
                    <p className="text-muted">Recommended action</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {primaryAlert.action}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-line bg-panel p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">
                    Why flagged
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted">
                    {primaryAlert.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <section className="rounded-[1.75rem] border border-line bg-surface p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.35em] text-accent">
                Parsed Timeline
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-foreground">
                Investigation sequence
              </h2>
              <div className="mt-5 space-y-3">
                {timeline.map((entry) => (
                  <div
                    key={entry}
                    className="rounded-2xl border border-line bg-panel p-4 text-sm text-muted"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
