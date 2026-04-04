export const ALERT_STORAGE_KEY = "kavach-alert-feed";

export type Severity = "Low" | "Medium" | "High" | "Critical";

export type AlertRecord = {
  id: string;
  title: string;
  severity: Severity;
  owner: string;
  time: string;
  confidence: number;
  vector: string;
  action: string;
  reasons: string[];
};

export const sampleCsv = `timestamp,source,vector,failed_logins,bytes_out,privilege_change,lateral_attempts,geo_velocity
08:41,Identity perimeter,SSH,14,18400,yes,3,high
08:43,Edge network,Port sweep,0,9200,no,1,medium
08:46,Finance host,Credential abuse,9,12500,yes,2,high`;

export const sampleAlerts: AlertRecord[] = [
  {
    id: "KV-201",
    title: "Credential stuffing pattern",
    severity: "High",
    owner: "Identity perimeter",
    time: "2 min ago",
    confidence: 94,
    vector: "SSH",
    action: "Isolate host",
    reasons: [
      "Repeated authentication failures followed by success",
      "Unusual east-west traffic spike in a low-traffic segment",
      "Privilege change observed within 90 seconds of access",
    ],
  },
  {
    id: "KV-198",
    title: "Suspicious port sweep",
    severity: "Medium",
    owner: "Edge network",
    time: "8 min ago",
    confidence: 71,
    vector: "Port sweep",
    action: "Review edge firewall rules",
    reasons: [
      "Sequential connection attempts detected across multiple ports",
      "Source host exceeded baseline scan threshold",
    ],
  },
  {
    id: "KV-194",
    title: "Privilege escalation sequence",
    severity: "Critical",
    owner: "Finance host",
    time: "13 min ago",
    confidence: 97,
    vector: "Credential abuse",
    action: "Lock account and snapshot host",
    reasons: [
      "Privilege elevation followed high-confidence login anomaly",
      "Multiple lateral movement attempts targeted internal services",
    ],
  },
];

function formatRelativeTime(index: number, rawTimestamp: string | undefined) {
  const trimmed = (rawTimestamp ?? "").trim();
  if (trimmed) return trimmed;
  return `${2 + index * 3} min ago`;
}

function severityFromScore(score: number): Severity {
  if (score >= 90) return "Critical";
  if (score >= 72) return "High";
  if (score >= 46) return "Medium";
  return "Low";
}

function titleFromVector(vector: string, severity: Severity) {
  const normalized = vector.toLowerCase();
  if (normalized.includes("ssh")) return "Suspicious SSH burst";
  if (normalized.includes("credential")) return "Credential abuse sequence";
  if (normalized.includes("sweep")) return "Suspicious port sweep";
  if (normalized.includes("dns")) return "DNS anomaly cluster";
  if (severity === "Critical") return "Critical incident cluster";
  return "Anomalous traffic pattern";
}

export function parseCsvToAlerts(csvText: string): AlertRecord[] {
  const rows = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length < 2) return [];

  const headers = rows[0].split(",").map((header) => header.trim().toLowerCase());

  return rows.slice(1).map((row, index) => {
    const values = row.split(",").map((value) => value.trim());
    const record = Object.fromEntries(
      headers.map((header, headerIndex) => [header, values[headerIndex] ?? ""])
    );

    const failedLogins = Number(record.failed_logins ?? 0);
    const lateralAttempts = Number(record.lateral_attempts ?? 0);
    const bytesOut = Number(record.bytes_out ?? 0);
    const privilegeChange = (record.privilege_change ?? "").toLowerCase() === "yes";
    const geoVelocityHigh = (record.geo_velocity ?? "").toLowerCase() === "high";
    const vector = record.vector || "Unknown";

    let score = 28;
    const reasons = ["Traffic deviates from the baseline profile"];

    if (failedLogins >= 8) {
      score += 24;
      reasons.push("Repeated authentication failures detected");
    }
    if (bytesOut >= 15000) {
      score += 12;
      reasons.push("Outbound traffic volume rose above expected range");
    }
    if (privilegeChange) {
      score += 22;
      reasons.push("Privilege change observed after login activity");
    }
    if (lateralAttempts >= 2) {
      score += 18;
      reasons.push("Multiple lateral connection attempts were recorded");
    }
    if (geoVelocityHigh) {
      score += 14;
      reasons.push("Geo-velocity spike suggests location inconsistency");
    }
    if (vector.toLowerCase().includes("sweep")) {
      score += 10;
      reasons.push("Sequential probing pattern indicates reconnaissance");
    }

    const confidence = Math.min(score, 99);
    const severity = severityFromScore(confidence);

    return {
      id: `KV-${240 + index}`,
      title: titleFromVector(vector, severity),
      severity,
      owner: record.source || "Unknown segment",
      time: formatRelativeTime(index, record.timestamp),
      confidence,
      vector,
      action:
        severity === "Critical"
          ? "Isolate host"
          : severity === "High"
            ? "Escalate to analyst"
            : "Review and monitor",
      reasons,
    };
  });
}

export function buildTimeline(alerts: AlertRecord[]) {
  return alerts.slice(0, 4).map((alert) => {
    const reason = alert.reasons[0] ?? "Activity requires review";
    return `${alert.time} ${reason}`;
  });
}

export function summarizeAlerts(alerts: AlertRecord[]) {
  const critical = alerts.filter((alert) => alert.severity === "Critical").length;
  const highRisk = alerts.filter(
    (alert) => alert.severity === "Critical" || alert.severity === "High"
  ).length;
  const averageConfidence =
    alerts.length > 0
      ? Math.round(
          alerts.reduce((total, alert) => total + alert.confidence, 0) / alerts.length
        )
      : 0;

  return {
    openAlerts: alerts.length,
    critical,
    highRisk,
    averageConfidence,
  };
}
