Overlay dismissal and debug test
===============================

What I changed
- Added a conservative, best-effort `dismissOverlays()` helper to `tests/pageObjects/BasePage.ts`.
- `goto()` now calls `dismissOverlays()` after navigation so tests get a consistent starting state.

Why
- The test suite was blocked by cookie banners and occasional modal/newsletter takeovers that prevented interactions (for example, the search input). The helper attempts to close common overlays safely to reduce flakiness.

How it works (summary)
- Tries `dismissCookieBanner()` and `closeModal()` first.
- Scans a list of overlay selectors and for each visible overlay attempts:
  - Click an obvious close button inside the overlay (several common selectors tried).
  - Press Escape and wait briefly as a fallback.
- Non-destructive and has small timeouts to avoid slowing the suite.

Run the focused overlay debug test
---------------------------------
To reproduce and capture artifacts for overlays run the debug test that was added earlier:

npx playwright test tests/debug/overlay-debug.spec.ts --project=chromium --output=test-results/debug --reporter=list

You can swap `--project` with `mobile-chrome` or `mobile-safari` to reproduce mobile-specific takeovers.

Notes & Next steps
- If the newsletter is conditional (geo/A-B/first-visit), run the debug test after clearing cookies/localStorage or set custom headers/referrers.
- If more overlay variants appear, add them to the `overlaySelectors` array in `BasePage.dismissOverlays()` and prefer stable testids when available.
