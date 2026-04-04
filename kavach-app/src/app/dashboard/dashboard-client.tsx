"use client";

import { useMemo } from "react";
import {
  ALERT_STORAGE_KEY,
  buildTimeline,
  sampleAlerts,
  summarizeAlerts,
  type AlertRecord,
} from "@/lib/alert-data";

function useStoredAlerts() {
  return useMemo(() => {
    if (typeof window === "undefined") {
      return sampleAlerts;
    }

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
  }, []);
}

export function DashboardClient() {
  const alerts = useStoredAlerts();
  const stats = summarizeAlerts(alerts);
  const timeline = buildTimeline(alerts);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-line bg-surface p-6 backdrop-blur md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-muted">
            Command Center
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
            Analyst dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            Alert data is now driven by your parsed CSV feed, so the dashboard can
            reflect real triage output instead of static shell data.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div className="rounded-2xl border border-line bg-panel p-4">
            <p className="text-muted">Open alerts</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {stats.openAlerts}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-panel p-4">
            <p className="text-muted">Critical</p>
            <p className="mt-2 text-2xl font-semibold text-rose-200">
              {String(stats.critical).padStart(2, "0")}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-panel p-4">
            <p className="text-muted">High-risk</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-200">
              {String(stats.highRisk).padStart(2, "0")}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-panel p-4">
            <p className="text-muted">Avg confidence</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {stats.averageConfidence}%
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-line bg-surface p-6 backdrop-blur">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-muted">
                Alert Feed
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                Priority queue
              </h2>
            </div>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              Parsed feed
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl border border-line bg-panel p-4 transition hover:border-cyan-300/25 hover:bg-panel-strong"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">
                      {alert.id}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">
                      {alert.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-rose-400/12 px-3 py-1 text-xs font-semibold text-rose-100">
                    {alert.severity}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
                  <span>{alert.owner}</span>
                  <span>{alert.time}</span>
                  <span>{alert.vector}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-line bg-surface p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.35em] text-muted">
              Triage Snapshot
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Incident timeline
            </h2>
            <div className="mt-5 space-y-3">
              {timeline.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-line bg-panel p-4 text-sm text-muted"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-line bg-surface p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.35em] text-muted">
              Investigator Notes
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              First alert analysis
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
              {alerts[0].reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
