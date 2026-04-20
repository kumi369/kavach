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

export type RiskSignal = {
  label: string;
  weight: number;
};

export const severityOrder: Severity[] = ["Critical", "High", "Medium", "Low"];

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

export type UploadFormat = "csv" | "json" | "log" | "excel";

type RawThreatRecord = Record<string, string>;

const fieldAliases: Record<string, string> = {
  alert_id: "id",
  alertid: "id",
  event_time: "timestamp",
  observed_at: "timestamp",
  time: "timestamp",
  owner: "source",
  host: "source",
  entity: "source",
  asset: "source",
  segment: "source",
  attack_vector: "vector",
  attack_type: "vector",
  category: "vector",
  failed_login: "failed_logins",
  failed_logins_count: "failed_logins",
  login_failures: "failed_logins",
  failures: "failed_logins",
  outbound_bytes: "bytes_out",
  bytes: "bytes_out",
  data_out: "bytes_out",
  privilege: "privilege_change",
  privileged: "privilege_change",
  privilege_escalation: "privilege_change",
  lateral: "lateral_attempts",
  lateral_movement: "lateral_attempts",
  lateral_connections: "lateral_attempts",
  geo: "geo_velocity",
  geovelocity: "geo_velocity",
  geo_velocity_risk: "geo_velocity",
};

function normalizeFieldName(key: string) {
  const normalized = key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  return fieldAliases[normalized] ?? normalized;
}

function hasUsefulThreatFields(record: RawThreatRecord) {
  return [
    "timestamp",
    "source",
    "vector",
    "failed_logins",
    "bytes_out",
    "privilege_change",
    "lateral_attempts",
    "geo_velocity",
  ].some((field) => Boolean(record[field]));
}

function isSeverity(value: unknown): value is Severity {
  return severityOrder.includes(value as Severity);
}

function isAlertRecord(value: unknown): value is AlertRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    isSeverity(record.severity) &&
    typeof record.owner === "string" &&
    typeof record.time === "string" &&
    typeof record.vector === "string" &&
    typeof record.action === "string" &&
    Array.isArray(record.reasons)
  );
}

function normalizeAlertRecord(record: AlertRecord): AlertRecord {
  return {
    ...record,
    confidence: Math.max(0, Math.min(Number(record.confidence) || 0, 99)),
    reasons: record.reasons.map(String).filter(Boolean),
  };
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      const nextCharacter = line[index + 1];

      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
}

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

  const headers = parseCsvLine(rows[0]).map(normalizeFieldName);
  const rawRecords = rows.slice(1).map((row) => {
    const values = parseCsvLine(row);
    return Object.fromEntries(
      headers.map((header, headerIndex) => [header, values[headerIndex] ?? ""])
    );
  });

  return mapRecordsToAlerts(rawRecords);
}

function normalizeRecordKeys(record: Record<string, unknown>): RawThreatRecord {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      normalizeFieldName(key),
      String(value ?? "").trim(),
    ])
  );
}

function mapRecordsToAlerts(records: RawThreatRecord[]) {
  return records.filter(hasUsefulThreatFields).map((record, index) => {
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

export function parseJsonToAlerts(jsonText: string): AlertRecord[] {
  const parsed = JSON.parse(jsonText) as unknown;
  const records = Array.isArray(parsed) ? parsed : [parsed];

  if (records.every(isAlertRecord)) {
    return records.map(normalizeAlertRecord);
  }

  return mapRecordsToAlerts(records.map(normalizeRecordKeys));
}

export function normalizeAlertFeed(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.filter(isAlertRecord).map(normalizeAlertRecord);
}

export function detectThreatTextFormat(text: string): UploadFormat {
  const trimmed = text.trim();

  if (!trimmed) return "csv";
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  if (/(source=|failed(?:_logins| logins)?=|bytes(?:_out)?=)/i.test(trimmed)) {
    return "log";
  }

  return "csv";
}

export function parseThreatText(text: string, format: UploadFormat) {
  if (format === "json") return parseJsonToAlerts(text);
  if (format === "log") return parseLogTextToAlerts(text);
  return parseCsvToAlerts(text);
}

export function parseLogTextToAlerts(logText: string): AlertRecord[] {
  const rows = logText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const records = rows.map((line) => {
    const timestampMatch = line.match(/^\d{2}:\d{2}/);
    const vectorMatch = line.match(/\b(SSH|Credential abuse|Port sweep|DNS anomaly|RDP)\b/i);
    const sourceMatch = line.match(/source=([^ ]+)/i);
    const failedMatch = line.match(/failed(?:_logins| logins)?=(\d+)/i);
    const bytesMatch = line.match(/bytes(?:_out)?=(\d+)/i);
    const privilegeMatch = line.match(/privilege(?:_change)?=(yes|no)/i);
    const lateralMatch = line.match(/lateral(?:_attempts)?=(\d+)/i);
    const geoMatch = line.match(/geo(?:_velocity)?=(high|medium|low)/i);

    return {
      timestamp: timestampMatch?.[0] ?? "",
      source: sourceMatch?.[1]?.replace(/_/g, " ") ?? "Log stream",
      vector: vectorMatch?.[0] ?? "Unknown",
      failed_logins: failedMatch?.[1] ?? "0",
      bytes_out: bytesMatch?.[1] ?? "0",
      privilege_change: privilegeMatch?.[1] ?? "no",
      lateral_attempts: lateralMatch?.[1] ?? "0",
      geo_velocity: geoMatch?.[1] ?? "low",
    };
  });

  return mapRecordsToAlerts(records);
}

export async function parseExcelToAlerts(file: File): Promise<AlertRecord[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return mapRecordsToAlerts(rows.map(normalizeRecordKeys));
}

export function buildTimeline(alerts: AlertRecord[]) {
  return alerts.slice(0, 4).map((alert) => {
    if (alert.severity === "Critical") {
      return `${alert.time} ${alert.title} escalated on ${alert.owner}`;
    }

    if (alert.severity === "High") {
      return `${alert.time} ${alert.title} flagged for analyst review`;
    }

    return `${alert.time} ${alert.vector} activity observed on ${alert.owner}`;
  });
}

export function buildSeverityData(alerts: AlertRecord[]) {
  return severityOrder.map((severity) => ({
    severity,
    count: alerts.filter((alert) => alert.severity === severity).length,
  }));
}

export function buildVectorData(alerts: AlertRecord[]) {
  const vectorCounts = alerts.reduce<Record<string, number>>((counts, alert) => {
    counts[alert.vector] = (counts[alert.vector] ?? 0) + 1;
    return counts;
  }, {});

  return Object.entries(vectorCounts)
    .map(([vector, count]) => ({ vector, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
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

export function buildRiskSignals(alert: AlertRecord): RiskSignal[] {
  const signals = alert.reasons.map((reason) => {
    const normalized = reason.toLowerCase();

    if (normalized.includes("authentication") || normalized.includes("login")) {
      return { label: "Identity anomaly", weight: 24 };
    }

    if (normalized.includes("outbound") || normalized.includes("traffic volume")) {
      return { label: "Data movement", weight: 12 };
    }

    if (normalized.includes("privilege")) {
      return { label: "Privilege change", weight: 22 };
    }

    if (normalized.includes("lateral")) {
      return { label: "Lateral movement", weight: 18 };
    }

    if (normalized.includes("geo")) {
      return { label: "Geo-velocity", weight: 14 };
    }

    if (normalized.includes("probing") || normalized.includes("reconnaissance")) {
      return { label: "Recon pattern", weight: 10 };
    }

    return { label: "Baseline deviation", weight: 28 };
  });

  const mergedSignals = signals.reduce<Record<string, RiskSignal>>((merged, signal) => {
    merged[signal.label] = {
      label: signal.label,
      weight: (merged[signal.label]?.weight ?? 0) + signal.weight,
    };
    return merged;
  }, {});

  return Object.values(mergedSignals)
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 6);
}
