"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ALERT_STORAGE_KEY,
  buildSeverityData,
  buildTimeline,
  buildVectorData,
  normalizeAlertFeed,
  sampleAlerts,
  summarizeAlerts,
  type AlertRecord,
  type Severity,
} from "@/lib/alert-data";
import { exportDashboardPrintReport, exportDashboardReport } from "@/lib/report-export";

const ALERT_EVENT = "kavach-alert-feed-change";

function readStoredAlerts() {
  try {
    const raw = window.localStorage.getItem(ALERT_STORAGE_KEY);
    if (!raw) {
      return sampleAlerts;
    }

    const parsed = normalizeAlertFeed(JSON.parse(raw));
    return parsed.length > 0 ? parsed : sampleAlerts;
  } catch {
    return sampleAlerts;
  }
}

function useStoredAlerts() {
  const [alerts, setAlerts] = useState<AlertRecord[]>(sampleAlerts);

  useEffect(() => {
    const syncAlerts = () => {
      setAlerts(readStoredAlerts());
    };

    syncAlerts();
    window.addEventListener(ALERT_EVENT, syncAlerts);
    window.addEventListener("storage", syncAlerts);

    return () => {
      window.removeEventListener(ALERT_EVENT, syncAlerts);
      window.removeEventListener("storage", syncAlerts);
    };
  }, []);

  return alerts;
}

function severityColor(severity: AlertRecord["severity"]) {
  if (severity === "Critical") return "bg-rose-300";
  if (severity === "High") return "bg-cyan-300";
  if (severity === "Medium") return "bg-amber-200";
  return "bg-emerald-300";
}

export function DashboardClient() {
  const alerts = useStoredAlerts();
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "All">("All");
  const stats = summarizeAlerts(alerts);
  const timeline = buildTimeline(alerts);
  const severityData = buildSeverityData(alerts);
  const vectorData = buildVectorData(alerts);
  const filteredAlerts = alerts.filter((alert) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSeverity =
      severityFilter === "All" || alert.severity === severityFilter;
    const matchesQuery =
      query.length === 0 ||
      [alert.id, alert.title, alert.owner, alert.vector, alert.severity]
        .join(" ")
        .toLowerCase()
        .includes(query);

    return matchesSeverity && matchesQuery;
  });
  const topConfidenceAlerts = [...alerts]
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, 5);
  const maxSeverityCount = Math.max(...severityData.map((entry) => entry.count), 1);
  const maxVectorCount = Math.max(...vectorData.map((entry) => entry.count), 1);

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
            Alert data is driven by your parsed threat feed, so the dashboard can
            reflect real triage output instead of static shell data.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap justify-end gap-3">
            <Link
              href="/"
              className="rounded-full border border-line bg-panel px-5 py-2 text-sm font-semibold text-foreground transition hover:border-cyan-300/30 hover:bg-panel-strong"
            >
              Upload More Data
            </Link>
            <button
              type="button"
              onClick={() => exportDashboardReport(alerts)}
              className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Export TXT
            </button>
            <button
              type="button"
              onClick={() => exportDashboardPrintReport(alerts)}
              className="rounded-full bg-rose-200 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-rose-100"
            >
              Print/PDF Report
            </button>
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
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_0.85fr_1.15fr]">
        <div className="rounded-[1.75rem] border border-line bg-surface p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.35em] text-muted">
            Severity Map
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Alert distribution
          </h2>
          <div className="mt-6 space-y-4">
            {severityData.map((entry) => (
              <div key={entry.severity} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{entry.severity}</span>
                  <span className="text-muted">{entry.count}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-panel-strong">
                  <div
                    className={`h-full rounded-full ${severityColor(entry.severity)}`}
                    style={{ width: `${(entry.count / maxSeverityCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-line bg-surface p-6 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.35em] text-muted">
            Vector Intel
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Top attack patterns
          </h2>
          <div className="mt-6 space-y-4">
            {vectorData.length > 0 ? (
              vectorData.map((entry) => (
                <div key={entry.vector} className="rounded-2xl border border-line bg-panel p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">{entry.vector}</span>
                    <span className="text-muted">{entry.count} alerts</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-panel-strong">
                    <div
                      className="h-full rounded-full bg-cyan-300"
                      style={{ width: `${(entry.count / maxVectorCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-line bg-panel p-4 text-sm text-muted">
                No vectors available in the current alert feed.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-line bg-surface p-6 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-muted">
                Confidence Heat
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                Highest-risk signals
              </h2>
            </div>
            <span className="rounded-full border border-rose-300/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-100">
              Live feed
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {topConfidenceAlerts.map((alert) => (
              <Link
                key={alert.id}
                href={`/dashboard/${alert.id}`}
                className="block rounded-2xl border border-line bg-panel p-4 transition hover:border-cyan-300/30 hover:bg-panel-strong"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">
                      {alert.id}
                    </p>
                    <p className="mt-1 font-semibold text-foreground">{alert.title}</p>
                  </div>
                  <span className="text-lg font-semibold text-foreground">
                    {alert.confidence}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-panel-strong">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-amber-200 to-rose-300"
                    style={{ width: `${alert.confidence}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-line bg-surface p-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-muted">
                Alert Feed
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                Priority queue
              </h2>
            </div>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              {filteredAlerts.length} visible
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_12rem]">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search id, owner, vector, or alert title..."
              className="rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-cyan-300/45"
            />
            <select
              value={severityFilter}
              onChange={(event) =>
                setSeverityFilter(event.target.value as Severity | "All")
              }
              className="rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-foreground outline-none transition focus:border-cyan-300/45"
            >
              <option value="All">All severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="mt-5 space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
              <Link
                key={alert.id}
                href={`/dashboard/${alert.id}`}
                className="block rounded-2xl border border-line bg-panel p-4 transition hover:border-cyan-300/25 hover:bg-panel-strong"
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
              </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-line bg-panel p-6 text-sm text-muted">
                No alerts match the current search and severity filter.
              </div>
            )}
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
