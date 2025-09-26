# Svitla Demo Tests — README

## Installation guide

1. Install project dependencies:

```sh
npm install
npx playwright install
```

2. Optional environment variables:

- `BASE_URL` — override the base URL defined in `playwright.config.ts` (default: `https://svitla.com`)
- `HEADLESS` — set to `false` to run headed browsers locally

3. Run a specific svitla test in Chromium:

```sh
npx playwright test tests/svitla/footer.spec.ts --project=chromium
```

Or run the whole svitla suite:

```sh
npx playwright test tests/svitla
```


## Test coverage

This demo suite focuses on a small, deterministic set of smoke and visual checks for the Svitla site:

- Hero carousel visibility and basic navigation
- Solutions / Services dropdown interaction
- Industry tabs visibility and tab switching
- Footer visibility and expected content (privacy/cookie links)
- Basic performance metrics for hero and page load (lightweight)
- Cookie consent handling to allow uninterrupted flows

The intent is to demonstrate reliable, runnable examples rather than exhaustive test coverage.


## Technologies used

- Playwright (@playwright/test) — browser automation and test runner
- TypeScript — test implementation
- Node.js / npm — package management and scripts
- Playwright browser engines: Chromium, Firefox, WebKit (configurable in `playwright.config.ts`)


## Implementation approach

- Architecture: Page Object Model (POM) and small reusable test blocks (`SvitlaTestBlocks`) for readability and reuse.
- Selector strategy: prefer role/name/testid selectors and include fallback selectors for demo robustness.
- Resilience: rely on Playwright's auto-wait and targeted explicit waits; cookie overlays and basic modal fallbacks are handled.
- Mocks: lightweight DI/telemetry stubs are used so the demo runs without the full automation framework.
- Scope: conservative, deterministic checks suited for local demos and CI smoke runs.


If you'd like this converted into a full test plan (test cases, acceptance criteria, CI steps), I can generate that next.
