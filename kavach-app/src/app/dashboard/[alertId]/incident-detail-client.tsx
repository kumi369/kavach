"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ALERT_STORAGE_KEY,
  sampleAlerts,
  type AlertRecord,
} from "@/lib/alert-data";

function readStoredAlerts() {
  try {
    const raw = window.localStorage.getItem(ALERT_STORAGE_KEY);
    if (!raw) {
      return sampleAlerts;
    }

    const parsed = JSON.parse(raw) as AlertRecord[];
    return parsed.length > 0 ? parsed : sampleAlerts;
  } catch {
    return sampleAlerts;
  }
}

function severityTone(severity: AlertRecord["severity"]) {
  if (severity === "Critical") return "text-rose-200 bg-rose-400/12 border-rose-300/20";
  if (severity === "High") return "text-cyan-200 bg-cyan-300/10 border-cyan-300/20";
  if (severity === "Medium") return "text-amber-100 bg-amber-300/10 border-amber-300/20";
  return "text-emerald-100 bg-emerald-300/10 border-emerald-300/20";
}

export function IncidentDetailClient({ alertId }: { alertId: string }) {
  const [alerts, setAlerts] = useState<AlertRecord[]>(sampleAlerts);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAlerts(readStoredAlerts());
      setIsHydrated(true);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const alert = useMemo(
    () => alerts.find((entry) => entry.id.toLowerCase() === alertId.toLowerCase()) ?? null,
    [alertId, alerts]
  );

  const relatedAlerts = useMemo(() => {
    if (!alert) return [];
    return alerts
      .filter((entry) => entry.id !== alert.id && entry.owner === alert.owner)
      .slice(0, 3);
  }, [alert, alerts]);

  if (!isHydrated) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
        <section className="rounded-[2rem] border border-line bg-surface p-8 text-center shadow-[0_25px_80px_var(--shadow)]">
          <p className="text-sm uppercase tracking-[0.35em] text-muted">Incident View</p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">
            Loading incident
          </h1>
          <p className="mt-4 text-muted">
            Pulling the latest parsed alert feed into the investigation view.
          </p>
        </section>
      </main>
    );
  }

  if (!alert) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
        <section className="rounded-[2rem] border border-line bg-surface p-8 text-center shadow-[0_25px_80px_var(--shadow)]">
          <p className="text-sm uppercase tracking-[0.35em] text-muted">Incident View</p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">
            Alert not found
          </h1>
          <p className="mt-4 text-muted">
            This incident id is not available in the current alert feed.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Back to dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <section className="rounded-[2rem] border border-line bg-surface p-6 shadow-[0_25px_80px_var(--shadow)] backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.4em] text-muted">
              Incident Detail
            </p>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">{alert.id}</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
                {alert.title}
              </h1>
            </div>
            <p className="max-w-3xl text-base leading-7 text-muted">
              Deep investigation view for the selected alert. Review the confidence,
              root causes, related entities, and recommended analyst action before triage.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${severityTone(alert.severity)}`}
            >
              {alert.severity}
            </span>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-line bg-panel px-5 py-2 text-sm font-semibold text-foreground transition hover:border-cyan-300/30 hover:bg-panel-strong"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-line bg-panel p-4">
            <p className="text-sm text-muted">Owner</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{alert.owner}</p>
          </div>
          <div className="rounded-2xl border border-line bg-panel p-4">
            <p className="text-sm text-muted">Vector</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{alert.vector}</p>
          </div>
          <div className="rounded-2xl border border-line bg-panel p-4">
            <p className="text-sm text-muted">Confidence</p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {alert.confidence}%
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-panel p-4">
            <p className="text-sm text-muted">Observed at</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{alert.time}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-line bg-surface p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.35em] text-muted">
              Why Flagged
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Detection reasoning
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
              {alert.reasons.map((reason) => (
                <li
                  key={reason}
                  className="rounded-2xl border border-line bg-panel p-4"
                >
                  {reason}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[1.75rem] border border-line bg-surface p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.35em] text-muted">
              Analyst Workflow
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Recommended next steps
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-line bg-panel p-4">
                <p className="text-sm text-muted">Immediate action</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {alert.action}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-panel p-4">
                <p className="text-sm text-muted">Escalation level</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {alert.severity === "Critical" || alert.severity === "High"
                    ? "Escalate to senior analyst"
                    : "Monitor in active queue"}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-panel p-4">
                <p className="text-sm text-muted">Containment guidance</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  Inspect source host and review east-west movement
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-panel p-4">
                <p className="text-sm text-muted">Reporting note</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  Add incident snapshot to triage summary
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-line bg-surface p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.35em] text-muted">
              Investigation Notes
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Triage summary
            </h2>
            <div className="mt-5 space-y-3 text-sm text-muted">
              <div className="rounded-2xl border border-line bg-panel p-4">
                Primary entity `{alert.owner}` triggered a `{alert.vector}` pattern with
                `{alert.confidence}%` confidence.
              </div>
              <div className="rounded-2xl border border-line bg-panel p-4">
                Severity `{alert.severity}` indicates this event should be reviewed in the
                current investigation window.
              </div>
              <div className="rounded-2xl border border-line bg-panel p-4">
                Recommended action `{alert.action}` is based on the current rule-based
                scoring engine and should be verified by the analyst.
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-line bg-surface p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.35em] text-muted">
              Related Activity
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Linked alerts
            </h2>
            <div className="mt-5 space-y-3">
              {relatedAlerts.length > 0 ? (
                relatedAlerts.map((relatedAlert) => (
                  <Link
                    key={relatedAlert.id}
                    href={`/dashboard/${relatedAlert.id}`}
                    className="block rounded-2xl border border-line bg-panel p-4 text-sm text-muted transition hover:border-cyan-300/30 hover:bg-panel-strong"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                      {relatedAlert.id}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {relatedAlert.title}
                    </p>
                    <p className="mt-2">
                      {relatedAlert.time} | {relatedAlert.vector}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-line bg-panel p-4 text-sm text-muted">
                  No related alerts found for this owner in the current parsed feed.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
