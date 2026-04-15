"use client";

import Link from "next/link";
import { useMemo, useState, type ChangeEvent } from "react";
import {
  ALERT_STORAGE_KEY,
  type AlertRecord,
  buildTimeline,
  detectThreatTextFormat,
  parseCsvToAlerts,
  parseExcelToAlerts,
  parseJsonToAlerts,
  parseLogTextToAlerts,
  parseThreatText,
  sampleAlerts,
  sampleCsv,
  summarizeAlerts,
  type UploadFormat,
} from "@/lib/alert-data";
import { ThemeToggle } from "./theme-toggle";

function safeParseThreatText(input: string, format: UploadFormat) {
  try {
    return parseThreatText(input, format);
  } catch {
    return [];
  }
}

export function HomeClient() {
  const [csvInput, setCsvInput] = useState(sampleCsv);
  const [status, setStatus] = useState("Sample threat data loaded. Ready for triage.");
  const [uploadLabel, setUploadLabel] = useState("No file selected yet.");
  const [stagedAlerts, setStagedAlerts] = useState<AlertRecord[] | null>(null);
  const [stagedInputKind, setStagedInputKind] = useState<"text" | "file">("text");
  const [textFormat, setTextFormat] = useState<UploadFormat>("csv");

  const parsedAlerts = useMemo(() => {
    if (stagedInputKind === "file" && stagedAlerts) {
      return stagedAlerts.length > 0 ? stagedAlerts : sampleAlerts;
    }

    const alerts = safeParseThreatText(csvInput, textFormat);
    return alerts.length > 0 ? alerts : sampleAlerts;
  }, [csvInput, stagedAlerts, stagedInputKind, textFormat]);

  const stats = useMemo(() => summarizeAlerts(parsedAlerts), [parsedAlerts]);
  const primaryAlert = parsedAlerts[0];
  const timeline = buildTimeline(parsedAlerts);

  function publishAlerts(alerts: AlertRecord[], message: string) {
    if (alerts.length === 0) {
      setStatus(
        "No valid threat records detected. Use the sample format or upload a supported file."
      );
      return;
    }

    try {
      window.localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(alerts));
      window.dispatchEvent(new Event("kavach-alert-feed-change"));
      setStatus(message);
    } catch {
      setStatus(
        "Alerts were parsed, but browser storage is blocked. Enable site storage to update the command center."
      );
    }
  }

  function analyzeCsv() {
    const alerts =
      stagedInputKind === "file" && stagedAlerts
        ? stagedAlerts
        : safeParseThreatText(csvInput, textFormat);

    publishAlerts(
      alerts,
      `Parsed ${alerts.length} alerts. Dashboard data updated with ${alerts.filter((alert) => alert.severity === "Critical").length} critical events.`
    );
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadLabel(file.name);
    const lower = file.name.toLowerCase();

    try {
      let alerts: AlertRecord[] = [];
      let displayText = "";
      let nextTextFormat: UploadFormat = "csv";

      if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
        alerts = await parseExcelToAlerts(file);
        displayText = JSON.stringify(alerts, null, 2);
        nextTextFormat = "json";
      } else {
        const text = await file.text();
        displayText = text;

        if (lower.endsWith(".csv")) {
          alerts = parseCsvToAlerts(text);
          nextTextFormat = "csv";
        } else if (lower.endsWith(".json")) {
          alerts = parseJsonToAlerts(text);
          nextTextFormat = "json";
        } else if (lower.endsWith(".log") || lower.endsWith(".txt")) {
          alerts = parseLogTextToAlerts(text);
          nextTextFormat = "log";
        } else {
          setStatus("Unsupported file type. Upload CSV, JSON, LOG/TXT, or Excel.");
          return;
        }
      }

      setCsvInput(displayText);
      setStagedAlerts(alerts);
      setStagedInputKind("file");
      setTextFormat(nextTextFormat);
      setStatus(
        `Loaded ${file.name}. Review the data and click Analyze Threat Data to push ${alerts.length} alerts to the command center.`
      );
    } catch {
      setStatus("Upload parsing failed. Check the file structure and try again.");
    }
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
                  Multi-Format Ingestion
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
                Paste or upload security data, generate structured alerts, and push
                the result straight into the command center for investigation.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={analyzeCsv}
                className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Analyze Threat Data
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

            <section className="grid gap-3 md:grid-cols-4">
              {[
                ["01", "Ingest", "Upload CSV, JSON, LOG/TXT, or Excel threat data."],
                ["02", "Score", "Convert raw events into confidence-ranked alerts."],
                ["03", "Investigate", "Open each incident with reasons, action, and notes."],
                ["04", "Report", "Export a command-center or incident-ready report."],
              ].map(([step, title, description]) => (
                <div
                  key={step}
                  className="rounded-2xl border border-line bg-panel p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                    {step}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {description}
                  </p>
                </div>
              ))}
            </section>

            <div className="rounded-[1.5rem] border border-line bg-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-muted">
                    Upload Simulator
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">
                    Threat data input
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-full border border-line bg-panel-strong px-4 py-2 text-sm font-medium text-foreground transition hover:border-cyan-300/30">
                    Upload file
                    <input
                      type="file"
                      accept=".csv,.json,.log,.txt,.xlsx,.xls"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCsvInput(sampleCsv);
                      setUploadLabel("No file selected yet.");
                      setStagedAlerts(null);
                      setStagedInputKind("text");
                      setTextFormat("csv");
                      setStatus("Sample threat data loaded. Ready for triage.");
                    }}
                    className="rounded-full border border-line bg-panel-strong px-4 py-2 text-sm font-medium text-foreground transition hover:border-cyan-300/30"
                  >
                    Reset sample
                  </button>
                </div>
              </div>

              <p className="mt-5 text-sm text-muted">
                Supported formats: CSV, JSON, LOG/TXT, XLSX
              </p>

              <textarea
                value={csvInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setCsvInput(nextValue);
                  if (stagedInputKind === "file") {
                    setStagedAlerts(null);
                    setStagedInputKind("text");
                    setUploadLabel("Manual input mode");
                  }
                  setTextFormat(detectThreatTextFormat(nextValue));
                }}
                onFocus={() => {
                  if (stagedInputKind === "file") {
                    setStatus(
                      "Uploaded data is loaded. Edit the text only if you want to switch back to manual input."
                    );
                  }
                }}
                className="mt-5 min-h-52 w-full rounded-[1.25rem] border border-line bg-panel-strong p-4 font-mono text-sm leading-7 text-foreground outline-none transition focus:border-cyan-300/45"
                spellCheck={false}
              />

              <p className="mt-4 text-sm text-muted">{uploadLabel}</p>
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
