# QA Test Suite

This project uses Playwright for end-to-end testing.

## Project Structure

```
tests/
  fixtures/
    testData.ts         # Test data and fixtures
  pageObjects/
    BasePage.ts         # Base page object
    ContactPage.ts      # Contact page object
    HomePage.ts         # Home page object
    ServicesPage.ts     # Services page object
  contact.spec.ts       # Contact page tests
  cookie-chatbot.spec.ts# Cookie chatbot tests
  homepage.spec.ts      # Homepage tests
  navigation.spec.ts    # Navigation tests
  services.spec.ts      # Services page tests
playwright.config.ts    # Playwright configuration
```

## Getting Started

### 1. Install dependencies

```
npm install
```

### 2. Run tests

```
npm run test
```

#### To run tests in headed mode:

```
npm run playwright -- --headed
```

## Additional Info
- All tests are located in the `tests/` directory.
- Page objects and fixtures are organized under `tests/pageObjects/` and `tests/fixtures/`.
- Playwright configuration is in `playwright.config.ts`.
