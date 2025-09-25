# Infinite.com Playwright Test Strategy

## Testing Approach
This suite uses Playwright with TypeScript to automate and validate key user-facing features on https://www.infinite.com. The approach emphasizes:

- **Page Object Model (POM):** Encapsulates selectors and actions for maintainability.
- **Reusable Test Blocks:** Shared flows (cookie consent, carousel, tabs) via `InfiniteTestBlocks`.
- **Mocked Services:** All telemetry and service dependencies are mocked for reliability and CI compatibility.
- **Selector Strategy:** Prioritizes role, label, and testid selectors for resilience against UI changes.
- **Flake Mitigation:** Relies on Playwright's auto-wait, explicit waits, and robust overlay handling. No fixed sleeps.

## Features Covered
- **Hero Carousel Navigation:** Ensures carousel is interactive and displays expected content.
- **Services Carousel Functionality:** Validates carousel navigation and service visibility.
- **Industry Tabs Interaction:** Checks tab switching and content updates for industry sections.
- **Global Offices Verification:** Confirms page load and basic content for global offices section.
- **Cookie Consent Handling:** Automatically detects and accepts cookie banners for uninterrupted test flow.
- **Telemetry Recording:** Simulates event logging for each test case (mocked for CI).

## How to Run
Run all content tests in Chromium:
```sh
npx playwright test tests/infinite/content.spec.ts --project=chromium
```

Run in all browsers:
```sh
npx playwright test tests/infinite/content.spec.ts
```

View HTML report:
```sh
npx playwright show-report test-results/html
```

## Extending the Suite
- Add new scenarios to `content.spec.ts` using the POM and test block patterns.
- Update selectors in `infinite.config.ts` as the site evolves.
- Use/extend `InfiniteTestBlocks` for new reusable flows.

