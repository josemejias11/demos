# Plan A Technologies - QA Automation Suite

Comprehensive automated testing suite for **https://planatechnologies.com**

## Business Overview
Plan A Technologies is a B2B software development and engineering consulting firm providing custom software solutions, staffing, and technical advisory services.

## Site Classification
- **Type**: B2B Software Consulting/Staffing
- **Industry**: Technology Services
- **Key Features**: Contact forms, Service inquiry, Client portfolio, Technology stack display

## Test Coverage

### 📊 Test Statistics
- **Total Test Cases**: 20
- **Test Files**: 7 spec files
- **Categories**: 7 (Navigation, Forms, Interactive, Content, Responsive, Accessibility, SEO)
- **Priority P0 Tests**: 4
- **Priority P1 Tests**: 5
- **Estimated Execution Time**: 10-15 minutes

### 🧪 Test Breakdown

| Category | Tests | Files |
|----------|-------|-------|
| **Smoke Tests** | 3 | `smoke.spec.ts` |
| **Navigation** | 4 | `navigation.spec.ts` |
| **Forms** | 3 | `forms.spec.ts` |
| **Interactive Elements** | 3 | `interactive.spec.ts` |
| **Content Verification** | 2 | `content.spec.ts` |
| **Responsive Design** | 2 | `responsive.spec.ts` |
| **Accessibility (A11y)** | 2 | `a11y.spec.ts` |
| **SEO** | 1 | `seo.spec.ts` |

## Quick Start

```bash
# Run all tests for this site
npx playwright test tests/planatechnologies-com

# Run specific test category
npx playwright test tests/planatechnologies-com/e2e/smoke.spec.ts
npx playwright test tests/planatechnologies-com/e2e/forms.spec.ts
npx playwright test tests/planatechnologies-com/accessibility/a11y.spec.ts

# Run with UI mode
npx playwright test tests/planatechnologies-com --ui

# Run in headed mode (see browser)
npx playwright test tests/planatechnologies-com --headed

# Generate HTML report
npx playwright test tests/planatechnologies-com --reporter=html
```

## Test Details

### Priority 0 (Critical) Tests
1. **Test 1**: Homepage loads successfully
2. **Test 6**: Contact form is displayed
3. **Test 10**: Contact form validation
4. **Test 11**: Contact form submission

### Priority 1 (High) Tests
5. **Test 2**: About Us navigation
6. **Test 3**: Careers page load
7. **Test 7**: CTA buttons functional
8. **Test 13**: Homepage statistics display
9. **Test 18**: Keyboard navigation

### All 20 Test Cases
See `TEST_PLAN.md` for complete test case documentation.

## Site-Specific Information

### Key Pages Tested
- Homepage (/)
- About Us
- Careers
- Blog/News
- Contact/Forms
- Industry pages

### Interactive Elements
- "LET'S TALK" CTA buttons
- Contact forms (name, email, message, website fields)
- Client portfolio carousel
- Industry selector cards (6 industries)
- Technology stack display
- Navigation menu

### Expected Content
- **Statistics**: 400+ deployments, 75+ referrals, 30+ awards, 200+ clients
- **Service Models**: Project-based, Dedicated Talent, Consulting
- **Technology Stack**: Multiple tech logos/names displayed

### Special Handling
- **Cookie Consent**: May appear on first visit
- **Dynamic Content**: Async-loaded elements (wait strategies implemented)
- **Responsive Design**: Tested at mobile (375x667) and tablet (768x1024) viewports
- **Forms**: Validation implemented, actual submission avoided in tests

## Site-Specific Selectors

```typescript
// Navigation
navigationMenu: 'nav, .navigation, .main-nav, .navbar'
footerLinks: 'footer a, .footer a'

// Forms
contactForm: 'form, .contact-form, #contact-form'
emailInput: 'input[type="email"], input[name*="email"]'
nameInput: 'input[name*="name"]'
messageInput: 'textarea, input[name*="message"]'

// Interactive
ctaButtons: 'button, a' with text: /let'?s talk|contact|get started/i
clientLogos: 'img[alt*="client" i], img[alt*="logo" i]'
industryCards: '[class*="industry"], [class*="sector"]'

// Content
statistics: Body text matching /400\+|75\+|200\+|deployments|referrals|clients/i
techStack: 'img[alt*="tech" i]' or text matching /react|angular|node|python/i
```

## Page Objects

- `basePage.ts` - Base page with common methods
- `PlanatechnologiesComPage.ts` - Homepage specific methods
- Additional page objects can be added as needed

## Test Data

Located in `data/index.ts`:
- User test data
- Form validation data
- Expected content patterns

## Known Issues / Limitations

1. **Form Submission**: Tests verify form presence and validation but don't actually submit to avoid spamming
2. **Blog/News**: Test skips if section doesn't exist
3. **Video Player**: Unmute functionality not included in 20-test limit
4. **Playwright Browsers**: Run `npx playwright install` if browsers not installed

## Configuration

### Environment Variables
Set in root `.env`:
```bash
BASE_URL=https://planatechnologies.com
HEADLESS=true
```

### Playwright Config
See `playwright.config.ts` for site-specific overrides.

### Site Config
See `site.config.ts` for selectors and configuration.

## Maintenance

### Adding New Tests
1. Create spec file in appropriate directory (`e2e/` or `accessibility/`)
2. Follow existing patterns and use page objects
3. Update TEST_PLAN.md with new test details
4. Increment test count in this README

### Updating Selectors
1. Update selectors in `site.config.ts`
2. Run tests to verify changes
3. Consider using KB-enhanced selectors for resilience

## CI/CD Integration

```yaml
# Example GitHub Actions
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run Plan A Technologies Tests
  run: npx playwright test tests/planatechnologies-com

- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Documentation

- **Test Plan**: `TEST_PLAN.md` - Detailed test planning document
- **Test Results**: `playwright-report/` - HTML test results (after running tests)
- **Traces**: `test-results/` - Playwright traces for debugging

---

**Framework**: QA Workshop Auto v3 with KB-enhanced intelligence
**Generated**: 2025-10-24
**Test Count**: 20 tests
**Status**: ✅ Ready for execution
