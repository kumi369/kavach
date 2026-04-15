# KAVACH

KAVACH is an AI-style security investigation copilot that turns noisy threat telemetry into actionable analyst work: scored alerts, triage dashboards, incident details, notes, and exportable reports.

## Project Layout

- `kavach-app/` - Next.js command center UI.
- `kavach-engine/` - Python threat scoring engine.
- `kavach-app/sample-data/` - CSV, JSON, LOG, and Excel demo files.

## Quick Start

```powershell
cd "C:\Users\cocna\Downloads\sitaram🦚❤️codex\kavach-app"
npm run dev
```

Open `http://localhost:3000`.

## Python Engine Demo

```powershell
cd "C:\Users\cocna\Downloads\sitaram🦚❤️codex"
python .\kavach-engine\score_threats.py .\kavach-app\sample-data\kavach-sample-threats.csv --out .\alerts.json --report .\kavach-report.txt
```

The generated JSON can be pasted into the KAVACH upload simulator or used as a standalone scored alert feed.
