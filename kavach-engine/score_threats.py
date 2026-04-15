"""KAVACH threat scoring engine.

This small Python engine converts security telemetry into normalized KAVACH
alerts. It is intentionally dependency-free so it can run in college labs,
demo machines, and CI without extra setup.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path
from typing import Any


SEVERITY_ORDER = ("Critical", "High", "Medium", "Low")


def severity_from_score(score: int) -> str:
    if score >= 90:
        return "Critical"
    if score >= 72:
        return "High"
    if score >= 46:
        return "Medium"
    return "Low"


def title_from_vector(vector: str, severity: str) -> str:
    normalized = vector.lower()
    if "ssh" in normalized:
        return "Suspicious SSH burst"
    if "credential" in normalized:
        return "Credential abuse sequence"
    if "sweep" in normalized:
        return "Suspicious port sweep"
    if "dns" in normalized:
        return "DNS anomaly cluster"
    if severity == "Critical":
        return "Critical incident cluster"
    return "Anomalous traffic pattern"


def parse_bool(value: Any) -> bool:
    return str(value or "").strip().lower() in {"yes", "true", "1"}


def parse_int(value: Any) -> int:
    try:
        return int(float(str(value or "0").strip()))
    except ValueError:
        return 0


def normalize_record(record: dict[str, Any]) -> dict[str, str]:
    return {str(key).strip().lower(): str(value or "").strip() for key, value in record.items()}


def is_alert_record(record: dict[str, Any]) -> bool:
    return all(key in record for key in ("id", "title", "severity", "owner", "confidence", "vector"))


def normalize_existing_alert(record: dict[str, Any]) -> dict[str, Any]:
    severity = str(record.get("severity", "Low")).title()
    if severity not in SEVERITY_ORDER:
        severity = "Low"

    confidence = max(0, min(parse_int(record.get("confidence")), 99))
    reasons = record.get("reasons", [])
    if not isinstance(reasons, list):
        reasons = [str(reasons)]

    return {
        "id": str(record.get("id", "KV-000")),
        "title": str(record.get("title", "Imported KAVACH alert")),
        "severity": severity,
        "owner": str(record.get("owner", "Unknown segment")),
        "time": str(record.get("time", "unknown")),
        "confidence": confidence,
        "vector": str(record.get("vector", "Unknown")),
        "action": str(record.get("action", "Review and monitor")),
        "reasons": [str(reason) for reason in reasons if str(reason).strip()],
    }


def map_records_to_alerts(records: list[dict[str, str]]) -> list[dict[str, Any]]:
    alerts: list[dict[str, Any]] = []

    for index, record in enumerate(records):
        failed_logins = parse_int(record.get("failed_logins"))
        lateral_attempts = parse_int(record.get("lateral_attempts"))
        bytes_out = parse_int(record.get("bytes_out"))
        privilege_change = parse_bool(record.get("privilege_change"))
        geo_velocity_high = str(record.get("geo_velocity", "")).lower() == "high"
        vector = record.get("vector") or "Unknown"

        score = 28
        reasons = ["Traffic deviates from the baseline profile"]

        if failed_logins >= 8:
            score += 24
            reasons.append("Repeated authentication failures detected")
        if bytes_out >= 15000:
            score += 12
            reasons.append("Outbound traffic volume rose above expected range")
        if privilege_change:
            score += 22
            reasons.append("Privilege change observed after login activity")
        if lateral_attempts >= 2:
            score += 18
            reasons.append("Multiple lateral connection attempts were recorded")
        if geo_velocity_high:
            score += 14
            reasons.append("Geo-velocity spike suggests location inconsistency")
        if "sweep" in vector.lower():
            score += 10
            reasons.append("Sequential probing pattern indicates reconnaissance")

        confidence = min(score, 99)
        severity = severity_from_score(confidence)
        alerts.append(
            {
                "id": f"KV-{240 + index}",
                "title": title_from_vector(vector, severity),
                "severity": severity,
                "owner": record.get("source") or "Unknown segment",
                "time": record.get("timestamp") or f"{2 + index * 3} min ago",
                "confidence": confidence,
                "vector": vector,
                "action": (
                    "Isolate host"
                    if severity == "Critical"
                    else "Escalate to analyst"
                    if severity == "High"
                    else "Review and monitor"
                ),
                "reasons": reasons,
            }
        )

    return alerts


def parse_csv(path: Path) -> list[dict[str, Any]]:
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return [normalize_record(row) for row in csv.DictReader(handle)]


def parse_json(path: Path) -> list[dict[str, Any]]:
    parsed = json.loads(path.read_text(encoding="utf-8"))
    records = parsed if isinstance(parsed, list) else [parsed]
    if all(isinstance(record, dict) and is_alert_record(record) for record in records):
        return [normalize_existing_alert(record) for record in records]
    return map_records_to_alerts([normalize_record(record) for record in records if isinstance(record, dict)])


def parse_log(path: Path) -> list[dict[str, Any]]:
    records: list[dict[str, str]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue

        def find(pattern: str, default: str = "") -> str:
            match = re.search(pattern, line, re.IGNORECASE)
            return match.group(1) if match else default

        records.append(
            {
                "timestamp": find(r"^(\d{2}:\d{2})"),
                "source": find(r"source=([\w-]+)", "Log stream").replace("_", " "),
                "vector": find(r"\b(SSH|Credential abuse|Port sweep|DNS anomaly|RDP)\b", "Unknown"),
                "failed_logins": find(r"failed(?:_logins| logins)?=(\d+)", "0"),
                "bytes_out": find(r"bytes(?:_out)?=(\d+)", "0"),
                "privilege_change": find(r"privilege(?:_change)?=(yes|no)", "no"),
                "lateral_attempts": find(r"lateral(?:_attempts)?=(\d+)", "0"),
                "geo_velocity": find(r"geo(?:_velocity)?=(high|medium|low)", "low"),
            }
        )

    return map_records_to_alerts(records)


def parse_input(path: Path) -> list[dict[str, Any]]:
    suffix = path.suffix.lower()
    if suffix == ".json":
        return parse_json(path)
    if suffix in {".log", ".txt"}:
        return parse_log(path)
    return map_records_to_alerts(parse_csv(path))


def build_report(alerts: list[dict[str, Any]]) -> str:
    critical = sum(1 for alert in alerts if alert["severity"] == "Critical")
    high_risk = sum(1 for alert in alerts if alert["severity"] in {"Critical", "High"})
    average = round(sum(alert["confidence"] for alert in alerts) / len(alerts)) if alerts else 0

    lines = [
        "KAVACH PYTHON SCORING REPORT",
        "",
        "SUMMARY",
        f"Open alerts: {len(alerts)}",
        f"Critical alerts: {critical}",
        f"High-risk alerts: {high_risk}",
        f"Average confidence: {average}%",
        "",
        "ALERTS",
    ]

    for index, alert in enumerate(alerts, start=1):
        lines.extend(
            [
                f"{index}. {alert['id']} | {alert['title']} | {alert['severity']} | {alert['confidence']}%",
                f"   Owner: {alert['owner']}",
                f"   Vector: {alert['vector']}",
                f"   Action: {alert['action']}",
                f"   Reasons: {' | '.join(alert['reasons'])}",
            ]
        )

    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Score threat telemetry into KAVACH alerts.")
    parser.add_argument("input", type=Path, help="CSV, JSON, LOG, or TXT file to score")
    parser.add_argument("--out", type=Path, help="Optional path for generated alert JSON")
    parser.add_argument("--report", type=Path, help="Optional path for generated text report")
    args = parser.parse_args()

    alerts = parse_input(args.input)
    output = json.dumps(alerts, indent=2)

    if args.out:
        args.out.write_text(output + "\n", encoding="utf-8")
    else:
        print(output)

    if args.report:
        args.report.write_text(build_report(alerts) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
