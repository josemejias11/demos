# QA Workshop Automation Framework# QA Workshop Automation Framework



Universal E2E automation with Playwright + TypeScript, dependency injection, selector intelligence, adaptive learning, and rich observability. Optional Kiwi TCMS and MCP server integrations included.Modern Playwright + TypeScript automation with DI, selector intelligence, adaptive learning, telemetry, and optional Kiwi TCMS integration.



- Language: TypeScript (Node 18+ recommended)- Language: TypeScript (Node 18+ recommended)

- Engine: Playwright- Runner: Playwright

- Highlights: DI orchestrator, knowledge-backed selectors, AST selector inventory, risk audits, OpenTelemetry metrics, Prometheus + Grafana dashboard, golden visual + A11y checks, minimal CLI- Extras: JSONL telemetry, OpenTelemetry metrics, AST-based selector inventory, risk audit, golden visual + A11y checks, minimal CLI



---## Quick start



## Quick start1) Install

- npm install

Prereqs- npx playwright install

- Node.js 18+

- Docker Desktop (optional, for Grafana/Prometheus stack)2) Configure

- Copy .env.example to .env

Install- Set BASE_URL (e.g., https://www.example.com)

- `npm install`

- `npx playwright install`3) Run something

- Audit (selector inventory + risk): npm run audit:project

Configure- DI smoke flow: BASE_URL=https://www.example.com npm run automation:run

- Copy `.env.example` to `.env`

- Set `BASE_URL` (e.g., `https://www.example.com`)## Environment variables



Run somethingRequired

- Project audit (inventory + risk): `npm run audit:project`- BASE_URL: Base URL for site under test

- Full DI flow: `BASE_URL=https://www.example.com npm run automation:run`

Optional

Tip: you can override any env var inline per command without changing `.env`.- HEADLESS=true

- OTEL_ENABLED=true

---- OTEL_SERVICE_NAME=qa-automation

- OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

## Environment variables- OTEL_METRICS_EXPORT_INTERVAL_MS=10000

- KIWI_URL, KIWI_USERNAME, KIWI_PASSWORD (optional integration)

Required

- `BASE_URL`Tip

- Override per command without changing .env:

Optional

- `HEADLESS=true````bash

- `OTEL_ENABLED=true`BASE_URL=https://www.example.com npm run automation:health

- `OTEL_SERVICE_NAME=qa-automation````

- `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`

- `OTEL_METRICS_EXPORT_INTERVAL_MS=10000`## Commands

- `KIWI_URL`, `KIWI_USERNAME`, `KIWI_PASSWORD` (optional)

Core

Examples- automation:run — DI-enabled bootstrap flow

- `BASE_URL=https://www.example.com npm run automation:health`- automation:health — framework health checks (uses BASE_URL)

- audit:project — selector inventory (AST-preferred) + risk → test-results/audit-report.md

---

Selectors & inventory

## Commands (most used)- selectors:inventory — regex-based scan → tests/artifacts/selectors-inventory.csv

- selectors:inventory:ast — AST-based scan (more accurate)

Core- selectors:risk — analyze inventory → test-results/selector-risk.json

- `automation:run` — DI-enabled bootstrap flow

- `automation:health` — health checks (uses `BASE_URL`)Observability

- `audit:project` — selector inventory (AST-preferred) + risk → `test-results/audit-report.md`- observability:up — start OTEL Collector + Prometheus + Grafana (Docker)

- observability:down — stop the stack

Selectors & inventory- observability:logs — tail logs

- `selectors:inventory` — regex scan → `tests/artifacts/selectors-inventory.csv`- observability:smoke — emit sample metrics without Playwright

- `selectors:inventory:ast` — AST scan (more accurate)

- `selectors:risk` — analyze inventory → `test-results/selector-risk.json`Testing

- test:unit — Vitest unit tests

Observability- test:unit:watch — watch mode

- `observability:up` — start OTEL Collector + Prometheus + Grafana (Docker)- test:pw — Playwright specs

- `observability:down` — stop the stack

- `observability:logs` — tail logsMaintenance

- `observability:smoke` — emit sample metrics without Playwright- typecheck, lint, lint:fix, format, format:check

- clean-reports, clean-cache, update-browsers, check-deps

Testing- telemetry:tail — tail telemetry JSONL

- `test:unit` — Vitest unit tests- telemetry:view — show merged telemetry tail

- `test:unit:watch` — watch mode

- `test:pw` — Playwright specsCLI & tools

- qa — minimal CLI (run with "npm run qa -- help")

Maintenance- probe — DOM probe utility

- `typecheck`, `lint`, `lint:fix`, `format`, `format:check`- golden:check — visual screenshot + axe-core A11y scan

- `clean-reports`, `clean-cache`, `update-browsers`, `check-deps`

- `telemetry:tail` — tail telemetry JSONLMCP server

- `telemetry:view` — show merged telemetry tail- automation:mcp — start MCP server (fg)

- mcp:start | mcp:status | mcp:stop | mcp:logs — background helpers

CLI & tools

- `qa` — minimal CLI (`npm run qa -- help`)Kiwi TCMS (optional)

- `probe` — DOM probe utility- kiwi:start | kiwi:stop | kiwi:logs

- `golden:check` — visual screenshot + axe-core A11y scan- kiwi:test | kiwi:status | kiwi:sync-cases | kiwi:sync-results



MCP server## Observability (Grafana + Prometheus + OTEL Collector)

- `automation:mcp` — start MCP server (fg)

- `mcp:start` | `mcp:status` | `mcp:stop` | `mcp:logs` — background helpersWe ship a local observability stack to view runtime metrics.



Kiwi TCMS (optional)What’s included

- `kiwi:start` | `kiwi:stop` | `kiwi:logs`- OTEL Collector: OTLP gRPC 4317, HTTP 4318; Prometheus scrape 8889

- `kiwi:test` | `kiwi:status` | `kiwi:sync-cases` | `kiwi:sync-results`- Prometheus: scrapes Collector at 8889

- Grafana: pre-provisioned dashboard "QA Automation - Locator Metrics"

---

Setup

## Observability (Grafana + Prometheus + OTEL Collector)1) In .env set:

	- OTEL_ENABLED=true

We ship a local observability stack to view runtime metrics.	- OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

2) Start stack: npm run observability:up

What’s included3) Generate metrics:

- OTEL Collector: OTLP gRPC 4317, HTTP 4318; Prometheus scrape 8889	- Quick smoke: npm run observability:smoke

- Prometheus: scrapes Collector at 8889	- or run: npm run audit:project

- Grafana: pre-provisioned dashboard "QA Automation - Locator Metrics"4) Open Grafana: http://localhost:3000 (admin/admin)

	- Prometheus: http://localhost:9090

Setup	- Collector metrics: http://localhost:8889/metrics

1) In `.env` set:

   - `OTEL_ENABLED=true`Metrics exported

   - `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318`- Histogram: locator.validation.latency_ms

2) Start stack: `npm run observability:up`- Counters: locator.validation.success, locator.validation.failure

3) Generate metrics:- Attributes: strategy, region

   - Quick smoke: `npm run observability:smoke`

   - or a real run: `npm run audit:project`Troubleshooting

4) Open Grafana: http://localhost:3000 (admin/admin)- Ensure Docker Desktop is running before observability:up

   - Prometheus: http://localhost:9090- No data? Confirm OTEL_ENABLED and OTLP endpoint, then generate traffic

   - Collector metrics: http://localhost:8889/metrics- Adjust Grafana time range to "Last 15 minutes"

- Port conflicts (3000/9090/4317/4318/8889): stop conflicting services or edit compose ports

Metrics exported

- Histogram: `locator.validation.latency_ms`## Selector tools

- Counters: `locator.validation.success`, `locator.validation.failure`

- Attributes: commonly include `strategy`, `region`- Inventory (regex): npm run selectors:inventory → tests/artifacts/selectors-inventory.csv

- Inventory (AST): npm run selectors:inventory:ast → tests/artifacts/selectors-inventory.csv

Troubleshooting- Risk analysis: npm run selectors:risk → prints summary; writes test-results/selector-risk.json

- Ensure Docker Desktop is running before `observability:up`

- No data? Confirm OTEL env vars then generate trafficCanonical paths

- Adjust Grafana time range to "Last 15 minutes"- CSV: tests/artifacts/selectors-inventory.csv

- Port conflicts (3000/9090/4317/4318/8889): stop conflicting services or edit compose ports- Risk JSON: test-results/selector-risk.json



---## Project audit



## Selector intelligence- npm run audit:project

- Writes test-results/audit-report.md

Inventory

- Regex inventory: `npm run selectors:inventory` → `tests/artifacts/selectors-inventory.csv`## Tests

- AST inventory: `npm run selectors:inventory:ast` → `tests/artifacts/selectors-inventory.csv`

- Playwright: npm run test:pw

Risk analysis- Unit: npm run test:unit (or :watch)

- `npm run selectors:risk` — prints summary; writes `test-results/selector-risk.json`- CI bundle: npm run ci (typecheck + lint + unit)



Canonical artifact paths## MCP server

- CSV: `tests/artifacts/selectors-inventory.csv`

- Risk JSON: `test-results/selector-risk.json`Foreground

- npm run automation:mcp

---

Background helpers

## Golden visual + A11y- npm run mcp:start — starts, logs to logs/mcp.out, PID at .mcp.pid

- `npm run golden:check` — takes a masked screenshot and runs an axe-core accessibility scan- npm run mcp:status — check

- Outputs into `test-results/golden/`- npm run mcp:logs — tail

- npm run mcp:stop — stop

---

## Kiwi TCMS

## MCP server

- Start: npm run kiwi:start (Docker)

Foreground- See package.json for sync and status commands

- `npm run automation:mcp`

## Artifacts & KB

Background helpers

- `npm run mcp:start` — starts, logs to `logs/mcp.out`, PID at `.mcp.pid`- Telemetry: automation-telemetry.jsonl (+ parts/) — merged on shutdown

- `npm run mcp:status` — check- KB: automation-locators-kb.jsonl (+ parts/) — updated on successful validations

- `npm run mcp:logs` — tail- Merge manually: npm run artifacts:merge or artifacts:merge:telemetry | :kb

- `npm run mcp:stop` — stop

## CI

---

GitHub Actions runs typecheck + lint + unit tests on push/PR. Optional nightly audit and risk gating can be enabled.

## Kiwi TCMS (optional)

## Structure

- Start: `npm run kiwi:start` (Docker)

- Sync and status commands available (see package.json)- automation/: DI core, orchestrator, locator resolver, knowledge, telemetry, integrations

- scripts/: audit-project, golden-check, CLI, helpers

---- tests/: Playwright specs and artifacts

- docker/observability/: OTEL Collector, Prometheus, Grafana compose stack

## Artifacts & knowledge base- docs/: deeper guides (architecture, MCP, integrations)



- Telemetry: `automation-telemetry.jsonl` (+ parts/) — merged on shutdown## Notes

- KB: `automation-locators-kb.jsonl` (+ parts/) — updated on successful validations

- Merge manually: `npm run artifacts:merge` or `artifacts:merge:telemetry` | `:kb`- Overlays are dismissed best-effort

- BASE_URL drives site context; no site-specific hardcoding is required

---- Strategy bandit and flake quarantine help improve stability over time

| `npm run automation:kb:export` | Export the knowledge base to a file. |

## CI| `npm run automation:kb:stats` | Show statistics about the knowledge base. |

| `npm run automation:branch:site` | Generate a new branch for a site (scaffolding). |

GitHub Actions runs typecheck + lint + unit tests on push/PR. Optional nightly audit and risk gating can be enabled.| `npm run automation:kb:view` | View the current knowledge base. |

| `npm run automation:kb:import` | Import selectors into the knowledge base. |

---

## Artifacts & Telemetry

## Repository structure

| Script | Description |

- `automation/` — DI core, orchestrator, locator resolver, knowledge, telemetry, integrations|--------|-------------|

- `scripts/` — audit-project, golden-check, CLI, helpers| `npm run artifacts:merge` | Merge all artifact parts into main files. |

- `tests/` — Playwright specs and artifacts| `npm run artifacts:merge:telemetry` | Merge telemetry artifact parts. |

- `docker/observability/` — OTEL Collector, Prometheus, Grafana compose stack| `npm run artifacts:merge:kb` | Merge knowledge base artifact parts. |

- `docs/` — deeper guides (architecture, MCP, integrations)| `npm run telemetry:view` | View the latest telemetry data. |

# QA Workshop Automation Framework

---| `npm run telemetry:tail` | Tail the telemetry log file. |



## NotesNotes



- Overlays are dismissed best-effort| Script | Description |

- `BASE_URL` drives site context; no site-specific hardcoding is required

- Strategy bandit and flake quarantine help improve stability over time|--------|-------------|


## Lint, Format, Typecheck
|--------|-------------|
| `npm run lint` | Run ESLint on the codebase. |
| `npm run format` | Format code with Prettier. |
| `npm run format:check` | Check code formatting with Prettier. |

## Testing
| Script | Description |
|--------|-------------|
## Coverage & Reports

|--------|-------------|
| `npm run coverage` | Run tests with coverage reporting. |
| `npm run clean-reports` | Clean test and coverage reports. |
| `npm run open-report` | Open the Playwright HTML report. |
| `npm run trace:latest` | Show the latest Playwright trace. |

## Maintenance & Utilities

| `npm run update-browsers` | Update Playwright browsers. |
| `npm run check-deps` | Check for missing or outdated dependencies. |
## Allure Reporting

| `npm run report:allure` | Generate and open the Allure report. |

|--------|-------------|
| `npm run kiwi:start` | Start Kiwi TCMS via Docker Compose. |
| `npm run kiwi:sync-cases` | Sync test cases with Kiwi TCMS. |
| `npm run kiwi:sync-results` | Sync test results with Kiwi TCMS. |

| Script | Description |
| `npm run mcp:status` | Show MCP server status. |
| `npm run mcp:stop` | Stop the MCP server. |
Tip
- If `BASE_URL` is not set, MCP returns a friendly guidance message instead of failing. Start it with:

```bash
BASE_URL=https://example.com npm run mcp:start
```
Modern Playwright + TypeScript automation with an AI agent, runtime knowledge base, and optional Kiwi TCMS integration.

CI: Typecheck + Lint + Unit tests run on every push/PR via GitHub Actions.

## Quick start

1) Install

2) Configure (required)

3) Run

## Commands

- DI bootstrap: npm run automation:run
We ship a minimal OpenTelemetry + Prometheus + Grafana stack so you can see live locator metrics locally.
- Grafana with a pre-provisioned dashboard "QA Automation - Locator Metrics"

Setup:
2) Start the stack:

```

3) Run any automation that emits metrics, e.g.:
npm run audit:project
```

- `npm run observability:logs` to see container logs
- `npm run observability:down` to stop everything

Notes:
- We export via OTLP HTTP to the Collector; Prometheus scrapes the Collector at :8889. If you already have an OTEL backend, point `OTEL_EXPORTER_OTLP_ENDPOINT` there instead.
- MCP server: npm run automation:mcp
- Discovery (one-shot): BASE_URL=https://example.com npm run -s automation:discover
- Clean artifacts: npm run clean-reports
- Clean caches: npm run clean-cache
Kiwi TCMS (optional)
- Start: npm run kiwi:start
- Status: npm run kiwi:status


Tip: Override BASE_URL for a one-off health run without changing your .env:

```bash
BASE_URL=https://www.example.com npm run automation:health
```

Optional
- HEADLESS=true
GitHub Actions manual workflow
- Discovery: Actions → Discovery → Run workflow → provide BASE_URL

## Structure

- tests/: Playwright specs
- automation/: DI core, locator resolver, knowledge, telemetry, MCP
- automation/domain/flows/: reusable flows (e.g., home smoke)
- docs/: deep dives (architecture, MCP, integrations)
- scripts/: shell helpers (cache, deps, report)

## Knowledge base & artifacts

- JSONL files: automation-telemetry.jsonl, automation-locators-kb.jsonl
- Parallel-safe writes with <file>.parts/; auto-merge on shutdown
- Manual merge: npm run artifacts:merge
- View KB: npm run automation:kb:view
	- Note: KB populates only when a selector is validated successfully during a run.
	- Telemetry logs live in automation-telemetry.jsonl (+ .parts/). KB lives in automation-locators-kb.jsonl (+ .parts/).

## Reporting

- Open Playwright report: npm run open-report
- Allure report: npm run allure:generate && npm run allure:open

## Notes

- The agent uses only the URL you set in BASE_URL.
- Overlay dismissal is conservative and site-specific.
- Mobile projects skip @ci-tagged tests by default.
- Discovery script uses a short-lived browser context and calls process.exit(0) when done to avoid lingering handles.
