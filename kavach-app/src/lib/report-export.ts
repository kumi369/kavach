import { buildTimeline, summarizeAlerts, type AlertRecord } from "./alert-data";

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

export function exportDashboardReport(alerts: AlertRecord[]) {
  const stats = summarizeAlerts(alerts);
  const timeline = buildTimeline(alerts);
  const generatedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const content = [
    "KAVACH COMMAND CENTER REPORT",
    `Generated: ${generatedAt}`,
    "",
    "SUMMARY",
    `Open alerts: ${stats.openAlerts}`,
    `Critical alerts: ${stats.critical}`,
    `High-risk alerts: ${stats.highRisk}`,
    `Average confidence: ${stats.averageConfidence}%`,
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

  downloadTextFile("kavach-command-center-report.txt", content);
}

export function exportIncidentReport(
  alert: AlertRecord,
  relatedAlerts: AlertRecord[],
  analystNote = ""
) {
  const generatedAt = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const content = [
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

  downloadTextFile(
    `kavach-incident-${sanitizeFilenamePart(alert.id)}.txt`,
    content
  );
}
