# msd.com — QA Automation Demo

Automated testing suite for [msd.com](https://www.msd.com) built with **Playwright** and **TypeScript**, demonstrating E2E, API, and accessibility testing using the **Page Object Model** pattern.

## Quick Start

```bash
npm install
npx playwright install --with-deps

# Run all tests (headless)
npm test

# Run with visible browser — great for demos
npm run test:headed

# Run in debug mode (step through tests)
npm run test:debug

# Run a specific suite
npx playwright test e2e/smoke.spec.ts
npx playwright test e2e/interactions.spec.ts
npx playwright test e2e/api.spec.ts
npx playwright test e2e/a11y.spec.ts

# Run a single test by name
npx playwright test -g "Search functionality works"

# Run on a specific browser
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project=chrome-mobile

# View HTML report after a run
npx playwright show-report test-results/html
```

## Test Suites

| Suite | File | Tests | Description |
|-------|------|:-----:|-------------|
| Smoke | `e2e/smoke.spec.ts` | 13 | Homepage load, status codes, images, console errors, meta tags, performance |
| Interactions | `e2e/interactions.spec.ts` | 9 | Menu open/close, sub-menu navigation, search flow, logo redirect, scrolling |
| API | `e2e/api.spec.ts` | 9 | HTTP methods, redirects, security headers, robots.txt, sitemap, response time |
| Accessibility | `e2e/a11y.spec.ts` | 7 | WCAG compliance: lang attr, landmarks, alt text, heading hierarchy, keyboard nav |

**38 tests × 4 browsers = 152 test runs**

## Browser Matrix

| Project | Browser | Viewport |
|---------|---------|----------|
| chromium | Chrome (desktop) | 1280×720 |
| firefox | Firefox (desktop) | 1280×720 |
| webkit | Safari (desktop) | 1280×720 |
| chrome-mobile | Chrome (Pixel 7) | 412×915 |

## Project Structure

```
├── e2e/                       # Test specs
│   ├── smoke.spec.ts          # Smoke & sanity checks
│   ├── interactions.spec.ts   # Interactive UI flows
│   ├── api.spec.ts            # API / HTTP-level tests
│   └── a11y.spec.ts           # Accessibility tests
├── pageObjects/               # Page Object Model
│   ├── basePage.ts            # Base class (navigation, cookie consent)
│   └── MsdComPage.ts          # msd.com-specific locators & actions
├── playwright.config.ts       # Playwright configuration
└── site.config.ts             # Site-specific selectors & settings
```

## Key Design Decisions

- **Cross-browser testing** — All tests run on Chrome, Firefox, Safari, and Chrome Mobile to catch browser-specific issues.
- **Page Object Model** — Locators and page actions are encapsulated in `pageObjects/`, keeping tests focused on behavior rather than selectors.
- **Cookie consent handling** — Automatically dismissed in `BasePage.navigate()` so tests aren't blocked by consent banners.
- **API tests use Playwright's `request` context** — No additional HTTP libraries needed; same framework for UI and API testing.
- **Artifacts on failure only** — Screenshots, videos, and traces are captured only when tests fail to keep runs fast.
