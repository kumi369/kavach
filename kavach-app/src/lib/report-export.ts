import {
  buildSeverityData,
  buildTimeline,
  buildVectorData,
  summarizeAlerts,
  type AlertRecord,
} from "./alert-data";

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function sanitizeFilenamePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function openPrintReport(title: string, body: string) {
  const reportWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!reportWindow) return;

  reportWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          :root {
            color: #111827;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          body {
            margin: 0;
            background: #eef6ff;
            padding: 32px;
          }
          main {
            max-width: 900px;
            margin: 0 auto;
            border: 1px solid #dbeafe;
            border-radius: 28px;
            background: #ffffff;
            padding: 40px;
            box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
          }
          h1 {
            margin: 0 0 8px;
            font-size: 32px;
            letter-spacing: -0.03em;
          }
          pre {
            white-space: pre-wrap;
            word-break: break-word;
            font: 14px/1.7 "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          }
          .meta {
            margin-bottom: 28px;
            color: #52667f;
            font-size: 13px;
            letter-spacing: 0.24em;
            text-transform: uppercase;
          }
          .actions {
            margin: 0 auto 18px;
            max-width: 900px;
            text-align: right;
          }
          button {
            border: 0;
            border-radius: 999px;
            background: #67e8f9;
            color: #0f172a;
            cursor: pointer;
            font-weight: 700;
            padding: 10px 18px;
          }
          @media print {
            body {
              background: #ffffff;
              padding: 0;
            }
            main {
              border: 0;
              border-radius: 0;
              box-shadow: none;
              max-width: none;
              padding: 0;
            }
            .actions {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="actions">
          <button onclick="window.print()">Save as PDF / Print</button>
        </div>
        <main>
          <p class="meta">KAVACH Security Investigation Report</p>
          <h1>${escapeHtml(title)}</h1>
          <pre>${escapeHtml(body)}</pre>
        </main>
      </body>
    </html>
  `);
  reportWindow.document.close();
}

export function exportDashboardReport(alerts: AlertRecord[]) {
  const content = buildDashboardReport(alerts);
  downloadTextFile("kavach-command-center-report.txt", content);
}

export function exportDashboardPrintReport(alerts: AlertRecord[]) {
  openPrintReport("KAVACH Command Center Report", buildDashboardReport(alerts));
}

function buildDashboardReport(alerts: AlertRecord[]) {
  const stats = summarizeAlerts(alerts);
  const timeline = buildTimeline(alerts);
  const severityData = buildSeverityData(alerts);
  const vectorData = buildVectorData(alerts);
  const topConfidenceAlerts = [...alerts]
    .sort((left, right) => right.confidence - left.confidence)
    .slice(0, 5);
  const generatedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return [
    "KAVACH COMMAND CENTER REPORT",
    `Generated: ${generatedAt}`,
    "",
    "SUMMARY",
    `Open alerts: ${stats.openAlerts}`,
    `Critical alerts: ${stats.critical}`,
    `High-risk alerts: ${stats.highRisk}`,
    `Average confidence: ${stats.averageConfidence}%`,
    "",
    "SEVERITY DISTRIBUTION",
    ...severityData.map((entry) => `${entry.severity}: ${entry.count}`),
    "",
    "TOP ATTACK VECTORS",
    ...(vectorData.length > 0
      ? vectorData.map((entry, index) => `${index + 1}. ${entry.vector}: ${entry.count}`)
      : ["No vectors available."]),
    "",
    "HIGHEST-RISK SIGNALS",
    ...topConfidenceAlerts.map(
      (alert, index) => `${index + 1}. ${alert.id} | ${alert.title} | ${alert.confidence}%`
    ),
    "",
    "TIMELINE",
    ...timeline.map((entry, index) => `${index + 1}. ${entry}`),
    "",
    "ALERT FEED",
    ...alerts.flatMap((alert, index) => [
      `${index + 1}. ${alert.id} | ${alert.title}`,
      `   Severity: ${alert.severity}`,
      `   Owner: ${alert.owner}`,
      `   Time: ${alert.time}`,
      `   Vector: ${alert.vector}`,
      `   Confidence: ${alert.confidence}%`,
      `   Action: ${alert.action}`,
      `   Reasons: ${alert.reasons.join(" | ")}`,
      "",
    ]),
  ].join("\n");
}

export function exportIncidentReport(
  alert: AlertRecord,
  relatedAlerts: AlertRecord[],
  analystNote = ""
) {
  const content = buildIncidentReport(alert, relatedAlerts, analystNote);

  downloadTextFile(
    `kavach-incident-${sanitizeFilenamePart(alert.id)}.txt`,
    content
  );
}

export function exportIncidentPrintReport(
  alert: AlertRecord,
  relatedAlerts: AlertRecord[],
  analystNote = ""
) {
  openPrintReport(`KAVACH Incident ${alert.id}`, buildIncidentReport(alert, relatedAlerts, analystNote));
}

function buildIncidentReport(
  alert: AlertRecord,
  relatedAlerts: AlertRecord[],
  analystNote = ""
) {
  const generatedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return [
    "KAVACH INCIDENT REPORT",
    `Generated: ${generatedAt}`,
    "",
    "INCIDENT",
    `ID: ${alert.id}`,
    `Title: ${alert.title}`,
    `Severity: ${alert.severity}`,
    `Owner: ${alert.owner}`,
    `Observed at: ${alert.time}`,
    `Vector: ${alert.vector}`,
    `Confidence: ${alert.confidence}%`,
    `Recommended action: ${alert.action}`,
    "",
    "DETECTION REASONS",
    ...alert.reasons.map((reason, index) => `${index + 1}. ${reason}`),
    "",
    "ANALYST NOTES",
    analystNote.trim() || "No analyst notes added.",
    "",
    "RELATED ALERTS",
    ...(relatedAlerts.length > 0
      ? relatedAlerts.map(
          (relatedAlert, index) =>
            `${index + 1}. ${relatedAlert.id} | ${relatedAlert.title} | ${relatedAlert.time} | ${relatedAlert.vector}`
        )
      : ["No related alerts in current parsed feed."]),
  ].join("\n");
}
