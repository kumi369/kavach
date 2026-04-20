# KAVACH Interview Script

## 30-Second Intro

KAVACH is a cybersecurity investigation copilot prototype. It accepts raw threat telemetry in CSV, JSON, LOG/TXT, or Excel format, scores risky behavior, and converts it into an analyst-ready command center with alerts, severity, confidence, risk explanations, incident notes, and reports.

## 2-Minute Demo

1. Start on the upload simulator.
2. Upload `kavach-sample-threats.csv`.
3. Click `Analyze Threat Data`.
4. Open the command center.
5. Show metrics, severity distribution, top attack vectors, and confidence heat.
6. Use search or severity filter to show analyst queue controls.
7. Open `KV-240`.
8. Explain detection reasons and confidence breakdown.
9. Add a short analyst note.
10. Export TXT or open the print/PDF report view.

## Why This Project

Security teams get noisy alerts from multiple systems. KAVACH focuses on the workflow after raw logs arrive: normalize data, score risk, explain why the alert matters, and help the analyst move toward a report.

## Technical Explanation

- Frontend: Next.js, React, TypeScript, Tailwind CSS.
- Parsing: CSV, JSON, LOG/TXT, and XLSX support.
- State: localStorage for demo persistence.
- Scoring: rule-based risk signals for failed logins, outbound bytes, privilege change, lateral attempts, geo-velocity, and vector type.
- Reporting: TXT export plus print/PDF-ready report view.
- Python: dependency-free scoring engine for offline/server-side extension.

## What I Would Improve Next

- Add backend APIs and PostgreSQL persistence.
- Add authentication and role-based access.
- Connect real SIEM/log sources like Elastic, Splunk, or Microsoft Sentinel.
- Add audit logs and automated tests.
- Convert print/PDF view into direct server-generated PDF.

## Strong Closing Line

KAVACH is not just a dashboard. It demonstrates an end-to-end investigation workflow from raw telemetry to analyst-ready decisions and reports.
