# KAVACH App

KAVACH is a security investigation command center built with Next.js. It helps an analyst move from raw telemetry to structured triage: upload threat data, generate scored alerts, inspect incidents, write notes, and export reports.

## What KAVACH Does

- Accepts threat data in CSV, JSON, LOG/TXT, and XLSX formats.
- Converts raw telemetry into normalized security alerts.
- Scores confidence using failed logins, outbound traffic, privilege changes, lateral attempts, geo-velocity, and attack vector patterns.
- Shows a command center with alert counts, severity distribution, top attack vectors, confidence heat, timeline, and alert queue.
- Filters the analyst queue by search query and severity.
- Opens a detailed investigation page for each alert.
- Explains incident confidence with weighted risk signals.
- Saves analyst notes in browser storage so they survive refreshes.
- Exports command center and incident reports as text files or print/PDF-ready report views.
- Supports black and light themes.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- XLSX parsing with `xlsx`
- Browser localStorage for demo persistence
- Companion Python scoring engine in `../kavach-engine`

## Run Locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful routes:

- `/` - upload simulator and live triage preview.
- `/dashboard` - command center.
- `/dashboard/KV-240` - example incident detail after uploading the sample data.

## Demo Flow

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000`.
3. Upload `sample-data/kavach-sample-threats.csv`, `sample-data/kavach-sample-threats.json`, `sample-data/kavach-sample-threats.log`, or `sample-data/kavach-sample-threats.xlsx`.
4. Review the preview text.
5. Click `Analyze Threat Data`.
6. Open the command center.
7. Click a high-risk alert to inspect the incident.
8. Add analyst notes and export the incident or dashboard report.

## Architecture

```text
Raw CSV/JSON/LOG/XLSX
        |
        v
Client parser + normalizer
        |
        v
Risk scoring and alert generation
        |
        v
localStorage demo persistence
        |
        v
Dashboard, incident view, notes, reports
```

## Key Design Decisions

- The UI stores alerts in browser storage to keep the prototype easy to run without backend setup.
- The scoring rules are transparent so interviewers can understand why confidence changes.
- The Python engine mirrors the same scoring concept for offline/server-side evolution.
- Report export supports TXT and print/PDF-ready views without adding heavy PDF dependencies.

## Interview Talking Points

- Problem: analysts need help turning noisy telemetry into actionable investigation queues.
- Input: CSV, JSON, LOG/TXT, or Excel threat data.
- Processing: field normalization, risk scoring, severity mapping, timeline generation.
- Output: dashboard, incident detail, notes, and exportable reports.
- Tradeoff: localStorage is fine for a prototype; real production would need auth, backend APIs, database, audit logs, and SIEM integrations.

## Sample CSV Shape

```csv
timestamp,source,vector,failed_logins,bytes_out,privilege_change,lateral_attempts,geo_velocity
10:02,Admin gateway,SSH,18,21500,yes,4,high
```

## Quality Checks

```powershell
npm run lint
npm run build
```

## Current Scope

This is a portfolio-ready investigation copilot prototype. It is not a production SIEM replacement yet, but it demonstrates the full analyst loop: ingestion, scoring, dashboarding, incident review, notes, and reporting.
