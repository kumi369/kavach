# KAVACH

KAVACH is an AI-style security investigation copilot prototype for analysts. It turns noisy threat telemetry into scored alerts, a command-center dashboard, incident investigation views, analyst notes, and exportable reports.

## Problem Statement

Security teams often receive noisy logs and alerts from many sources. A fresher/interview project usually stops at displaying data, but KAVACH demonstrates the full analyst loop:

1. Ingest raw telemetry.
2. Normalize it into security alerts.
3. Score the risk.
4. Explain why the alert matters.
5. Help the analyst investigate and export a report.

## Highlights

- Multi-format ingestion: CSV, JSON, LOG/TXT, and XLSX.
- Risk scoring using failed logins, outbound bytes, privilege changes, lateral movement, geo-velocity, and attack vector signals.
- Command center with severity distribution, top vectors, confidence heat, queue search, and severity filters.
- Incident detail page with detection reasoning, risk breakdown, recommended workflow, related alerts, and notes.
- TXT export and print/PDF-ready report views.
- Companion Python scoring engine for offline telemetry conversion.

## Project Layout

- `kavach-app/` - Next.js command center UI.
- `kavach-engine/` - Python threat scoring engine.
- `kavach-app/sample-data/` - CSV, JSON, LOG, and Excel demo files.
- `PROJECT_STATUS.md` - final status, demo script, and scope notes.

## Quick Start

```powershell
cd "C:\Users\cocna\Downloads\sitaram-codex\kavach-app"
npm run dev
```

Open `http://localhost:3000`.

If your folder has emoji in its name, keep using your exact local path. The command above is intentionally shown as an ASCII-safe example.

## Demo Flow

1. Open the upload simulator at `http://localhost:3000`.
2. Upload `kavach-app/sample-data/kavach-sample-threats.csv`.
3. Click `Analyze Threat Data`.
4. Open the command center.
5. Use search and severity filters.
6. Open `KV-240` for incident investigation.
7. Add analyst notes.
8. Export TXT or open the print/PDF report view.

## Python Engine Demo

```powershell
cd "C:\Users\cocna\Downloads\sitaram-codex"
python .\kavach-engine\score_threats.py .\kavach-app\sample-data\kavach-sample-threats.csv --out .\alerts.json --report .\kavach-report.txt
```

The generated JSON can be pasted into the KAVACH upload simulator or used as a standalone scored alert feed.

## Interview Pitch

KAVACH is a portfolio-grade cybersecurity investigation copilot. It accepts raw threat telemetry, scores suspicious behavior, explains the risk signals, and gives analysts a dashboard, incident view, notes, and reports. It is built as a polished prototype, not a production SIEM replacement.
