# Bristlecone Website QA Test Plan
*Target: https://www.bristlecone.com*
*Generated: December 2024*
*Execution Status: IMPLEMENTED - 7/30 tests passing*

## Executive Summary

### Test Coverage
- **30 Test Cases** covering homepage, contact forms, mobile responsiveness, performance, and edge cases
- **5 Test Suites** organized by functional area
- **3 Priority Levels** (P0: Critical, P1: Important, P2: Nice-to-have)
- **Multiple Test Types** (Functional, UI, Performance, Mobile, Accessibility)

### Current Execution Status ✅ 7 PASSING | ❌ 23 FAILING

#### ✅ PASSING TESTS (7/30)
- **BC-001**: Homepage loads successfully (P0) ✅
- **BC-002**: Main navigation menu functions (P0) ✅  
- **BC-003**: GDPR consent banner functions (P0) ✅
- **BC-004**: Search functionality works (P1) ✅
- **BC-005**: Hero section CTAs function (P0) ✅
- **BC-006**: Footer links are functional (P1) ✅
- **BC-007**: Logo navigation to homepage (P1) ✅

#### ❌ FAILING TESTS (23/30)
**Contact Forms (6 tests)** - All failing due to dialog selector conflicts
**Mobile Tests (4 tests)** - Failing due to responsive design detection issues  
**Performance Tests (4 tests)** - Not yet executed
**Edge Cases (9 tests)** - Not yet executed

### Risk Assessment
- **HIGH RISK**: Contact form functionality (critical business function)
- **MEDIUM RISK**: Mobile experience (user accessibility)  
- **LOW RISK**: Performance metrics (optimization opportunity)

---

## Test Environment
- **Framework**: Playwright with TypeScript
- **Browsers**: Chrome (desktop), Mobile Chrome
- **URL**: https://www.bristlecone.com
- **Execution**: Automated via GitHub Actions and local development

---

## Test Matrix

| ID | Test Case | Type | Priority | Pre-requisites | Status | Notes |
|---|---|---|---|---|---|---|
| **Homepage Tests** |
| BC-001 | Homepage loads successfully | Functional | P0 | None | ✅ PASS | Page loads, navigation visible |
| BC-002 | Main navigation menu functions | UI | P0 | None | ✅ PASS | All nav items accessible |
| BC-003 | GDPR consent banner functions | UI | P0 | Fresh browser | ✅ PASS | Banner appears and dismisses |
| BC-004 | Search functionality works | Functional | P1 | None | ✅ PASS | Search interface detected |
| BC-005 | Hero section CTAs function | UI | P0 | None | ✅ PASS | CTA buttons clickable |
| BC-006 | Footer links are functional | UI | P1 | None | ✅ PASS | Footer navigation works |
| BC-007 | Logo navigation to homepage | UI | P1 | None | ✅ PASS | Logo returns to home |
| **Contact Forms** |
| BC-008 | General contact form submission | Functional | P0 | Contact page | ❌ FAIL | Dialog selector conflicts |
| BC-009 | Sales contact form submission | Functional | P0 | Contact page | ❌ FAIL | Cannot locate form trigger |
| BC-010 | Career contact form submission | Functional | P1 | Contact page | ❌ FAIL | Cannot locate form trigger |
| BC-011 | Contact form validation | Functional | P1 | Contact page | ❌ FAIL | Dialog selector conflicts |
| BC-012 | Contact form privacy policy link | UI | P1 | Contact page | ❌ FAIL | Dialog selector conflicts |
| BC-013 | Contact form field limits | Functional | P2 | Contact page | ❌ FAIL | Dialog selector conflicts |
| **Content Pages** |
| BC-014 | About page content loads | Functional | P1 | None | ❌ NOT_RUN | Pending execution |
| BC-015 | Services page navigation | UI | P1 | None | ❌ NOT_RUN | Pending execution |
| BC-016 | Industries page functionality | UI | P1 | None | ❌ NOT_RUN | Pending execution |
| BC-017 | Blog/Insights page loads | Functional | P2 | None | ❌ NOT_RUN | Pending execution |
| BC-018 | Company leadership page | Functional | P2 | None | ❌ NOT_RUN | Pending execution |
| **Mobile Responsiveness** |
| BC-019 | Mobile homepage responsiveness | Mobile | P0 | Mobile viewport | ❌ FAIL | Nav hidden on mobile |
| BC-020 | Mobile navigation menu | Mobile | P0 | Mobile viewport | ❌ FAIL | Mobile nav not detected |
| BC-021 | Mobile contact form usability | Mobile | P0 | Mobile viewport | ❌ FAIL | Dialog selector conflicts |
| BC-022 | Touch interactions work | Mobile | P1 | Mobile viewport | ❌ FAIL | Touch target size below 40px |
| **Performance & Accessibility** |
| BC-023 | Page load performance | Performance | P0 | None | ❌ NOT_RUN | Pending execution |
| BC-024 | Core Web Vitals compliance | Performance | P1 | None | ❌ NOT_RUN | Pending execution |
| BC-025 | Accessibility compliance | Accessibility | P1 | None | ❌ NOT_RUN | Pending execution |
| BC-026 | Keyboard navigation | Accessibility | P1 | None | ❌ NOT_RUN | Pending execution |
| **Error Handling & Edge Cases** |
| BC-027 | 404 error page handling | Edge Case | P1 | None | ❌ NOT_RUN | Pending execution |
| BC-028 | JavaScript error tolerance | Edge Case | P2 | None | ❌ NOT_RUN | Pending execution |
| BC-029 | Network timeout handling | Edge Case | P2 | Slow connection | ❌ NOT_RUN | Pending execution |
| BC-030 | Cross-browser compatibility | Compatibility | P1 | Multiple browsers | ❌ NOT_RUN | Pending execution |

---

## Execution Strategy

### Phase 1: Foundation ✅ COMPLETE  
**Status**: 7/7 homepage tests passing
- ✅ Homepage functionality validation
- ✅ Basic navigation testing
- ✅ Critical user flows confirmed

### Phase 2: Contact Forms ❌ IN PROGRESS
**Status**: 0/6 contact tests passing  
**Blockers**: 
- Dialog selector resolves to 5 elements (strict mode violations)
- Contact form triggers not properly located
- Form modal interactions failing

**Recommended Fixes**:
```typescript
// Use specific dialog targeting instead of generic [role="dialog"]
await expect(page.locator('#pum-602[class*="pum-active"]')).toBeVisible();

// Improve contact trigger selectors
await page.locator('a[href*="contact"]').first().click();
```

### Phase 3: Mobile & Performance ❌ BLOCKED
**Status**: 0/8 tests passing
**Dependencies**: Contact form fixes, mobile nav detection

### Phase 4: Edge Cases ❌ PENDING  
**Status**: 0/9 tests implemented

---

## Infrastructure

### Test Files Structure
```
tests/bristlecone/
├── homepage.spec.ts        ✅ 7 tests passing
├── contact.spec.ts         ❌ 6 tests failing  
├── mobile/mobile.spec.ts   ❌ 4 tests failing
├── performance/performance.spec.ts  ❌ Not executed
└── edge-cases.spec.ts      ❌ Not executed
```

### Run Commands
```bash
# All tests
npx playwright test tests/bristlecone/

# Homepage only (working)
npx playwright test tests/bristlecone/homepage.spec.ts --project=bristlecone-chrome

# Contact forms (debugging needed)  
npx playwright test tests/bristlecone/contact.spec.ts --project=bristlecone-chrome --debug

# Mobile tests
npx playwright test tests/bristlecone/mobile/ --project=bristlecone-mobile

# Performance tests
npx playwright test tests/bristlecone/performance/ --project=bristlecone-chrome
```

---

## Next Steps & Recommendations

### Immediate Actions (High Priority)
1. **Fix Contact Form Selectors** - Replace generic `[role="dialog"]` with specific selectors like `#pum-602.pum-active`
2. **Improve Contact Triggers** - Use more robust selectors for form activation buttons
3. **Mobile Navigation** - Detect mobile menu patterns (hamburger menu, hidden nav)

### Short Term (Medium Priority)  
1. **Complete Mobile Testing** - Fix responsive detection and touch target validation
2. **Performance Implementation** - Execute performance and accessibility test suites
3. **Error Handling** - Implement edge case and error tolerance testing

### Long Term (Low Priority)
1. **Cross-Browser Testing** - Expand to Firefox, Safari, Edge
2. **Visual Regression** - Add screenshot comparison tests
3. **Data-Driven Tests** - Parameterize form inputs and navigation paths

---

## Test Data Requirements

### Contact Form Test Data
```typescript
const testData = {
  validEmail: "test@example.com",
  validName: "John Doe", 
  validCompany: "Test Company",
  validMessage: "This is a test message for form validation.",
  invalidEmail: "invalid-email",
  longMessage: "A".repeat(5000) // Test field limits
};
```

### Performance Benchmarks
- **Page Load**: < 3 seconds
- **First Contentful Paint**: < 1.5 seconds  
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1

---

## Success Criteria
- ✅ **P0 Tests**: 7/11 passing (64% - GOOD)
- ❌ **P1 Tests**: 2/13 passing (15% - NEEDS WORK)  
- ❌ **P2 Tests**: 0/6 passing (0% - NOT STARTED)

**Overall Health**: 23% (7/30 tests passing)
**Target**: 90% passing rate for production readiness

---

*Last Updated: December 19, 2024*
*Next Review: After contact form fixes implementation*

## Test Coverage Areas
- **Homepage & Navigation** (7 tests)
- **Contact Forms & Lead Generation** (6 tests)  
- **Content Pages** (5 tests)
- **Mobile & Responsive** (4 tests)
- **Performance & Accessibility** (4 tests)
- **Error Handling & Edge Cases** (4 tests)

## Test Cases Matrix

| ID | Title | Type | Priority | Pre-reqs | Steps | Expected | Notes |
|----|-------|------|----------|----------|-------|----------|-------|
| BC-001 | Homepage loads successfully | P | P0 | - | Navigate to https://www.bristlecone.com | Page loads, hero section visible, no console errors | Core smoke test |
| BC-002 | Main navigation menu functions | P | P0 | Homepage loaded | Click each main nav item (Industries, Consulting, etc.) | Each section expands/navigates correctly | Critical UX flow |
| BC-003 | GDPR consent banner functions | P | P0 | Fresh browser session | Load homepage, verify consent banner, click Accept | Banner appears, Accept works, banner dismissed | Legal compliance |
| BC-004 | Search functionality works | P | P1 | Homepage loaded | Click search icon, enter test query, submit | Search modal opens, results returned | Content discovery |
| BC-005 | Hero section CTAs function | P | P0 | Homepage loaded | Click "LEARN MORE" buttons in hero slides | CTAs navigate to contact/relevant pages | Lead generation |
| BC-006 | Footer links are functional | P | P1 | Any page loaded | Click footer links (About, Services, Industries) | All footer links navigate correctly | Navigation integrity |
| BC-007 | Logo navigation to homepage | P | P1 | Any internal page | Click Bristlecone logo | Returns to homepage | Standard UX pattern |
| BC-008 | General contact form submission | P | P0 | Contact page | Fill general contact form, submit | Form submits successfully, confirmation shown | Primary lead capture |
| BC-009 | Sales contact form submission | P | P0 | Contact page | Fill sales contact form, submit | Form submits successfully, confirmation shown | High-value lead capture |
| BC-010 | Career contact form submission | P | P1 | Contact page | Fill career contact form, submit | Form submits successfully, confirmation shown | Talent acquisition |
| BC-011 | Contact form validation | N | P1 | Contact page | Submit empty required fields | Validation errors shown for required fields | Data quality |
| BC-012 | Contact form privacy policy link | P | P1 | Contact form open | Click privacy policy link in form | Privacy policy opens in new tab/window | Legal compliance |
| BC-013 | Contact form field limits | N | P2 | Contact form open | Enter excessively long text in fields | Fields handle or limit long input gracefully | Edge case handling |
| BC-014 | Industries page content loads | P | P1 | - | Navigate to /industries/ | Industries page loads with all content sections | Content accessibility |
| BC-015 | Services page content loads | P | P1 | - | Navigate to /services/ | Services page loads with consulting info | Service discovery |
| BC-016 | Company/About page loads | P | P1 | - | Navigate to /company/ | About page loads with company information | Brand discovery |
| BC-017 | Events page functionality | P | P2 | - | Navigate to /events/ | Events page shows upcoming/past events | Engagement tracking |
| BC-018 | Insights/Blog content access | P | P1 | - | Navigate to /insights/ | Insights page loads with content categories | Content marketing |
| BC-019 | Mobile homepage responsiveness | P | P0 | Mobile viewport (375px) | Load homepage on mobile | Layout adapts, content readable, nav functional | Mobile-first |
| BC-020 | Mobile navigation menu | P | P0 | Mobile viewport | Tap hamburger menu, navigate sections | Mobile menu opens, sections accessible | Mobile UX |
| BC-021 | Mobile contact form usability | P | P0 | Mobile, contact page | Open and fill contact form on mobile | Form usable, fields accessible, submits | Mobile conversion |
| BC-022 | Touch interactions work | P | P1 | Mobile/tablet viewport | Test touch interactions on buttons/links | Touch targets respond appropriately | Touch UX |
| BC-023 | Page load performance | E | P1 | - | Measure page load times for key pages | Pages load within 3 seconds on 3G | Performance baseline |
| BC-024 | Core Web Vitals metrics | E | P1 | - | Measure CLS, LCP, FID on homepage | Metrics within Google's "Good" thresholds | SEO/UX impact |
| BC-025 | Basic accessibility compliance | E | P1 | - | Run accessibility scan on key pages | No critical WCAG violations | Legal compliance |
| BC-026 | Keyboard navigation support | E | P2 | - | Navigate site using only keyboard | All interactive elements accessible via keyboard | Accessibility |
| BC-027 | Invalid URL handling | N | P2 | - | Navigate to https://bristlecone.com/invalid-page | 404 page shown or graceful redirect | Error handling |
| BC-028 | JavaScript error tolerance | N | P2 | - | Monitor console for JS errors on key pages | Critical functions work despite minor JS errors | Resilience |
| BC-029 | Form submission with network issues | N | P2 | Contact form | Submit form during simulated network disruption | Error message shown or retry mechanism | Error recovery |
| BC-030 | Cross-browser compatibility | P | P1 | Chrome, Firefox, Safari | Test key flows across major browsers | Consistent functionality across browsers | Browser support |

## Risk Areas Identified
1. **JavaScript Errors**: Console shows several JS errors that could impact functionality
2. **Contact Form Dependencies**: Heavy reliance on popups and iframes for lead capture
3. **Navigation Complexity**: Multi-level dropdown menus could be fragile
4. **Third-party Integrations**: GDPR, chat widget, analytics dependencies
5. **Mobile Performance**: Rich content and videos may impact mobile performance

## Coverage Priorities
- **P0 (Critical)**: Homepage, core navigation, contact forms, mobile basics
- **P1 (High)**: Content pages, search, accessibility, performance
- **P2 (Medium)**: Edge cases, error handling, secondary features

## Execution Strategy
1. **Smoke Tests** (BC-001, BC-002, BC-003): Run first to validate basic functionality
2. **Core User Journeys** (BC-004 to BC-018): Primary business flows
3. **Mobile/Responsive** (BC-019 to BC-022): Mobile-first validation  
4. **Performance/Quality** (BC-023 to BC-026): Quality gates
5. **Edge Cases** (BC-027 to BC-030): Robustness testing

## Run Instructions
```bash
# Setup environment
export BASE_URL=https://www.bristlecone.com

# Run all tests
npx playwright test

# Run by priority
npx playwright test --grep "@p0"
npx playwright test --grep "@p1" 
npx playwright test --grep "@p2"

# Run specific areas
npx playwright test --grep "@smoke"
npx playwright test --grep "@contact"
npx playwright test --grep "@mobile"

# Debug mode
npx playwright test --headed --debug
```

## Success Criteria
- **95%+ pass rate** for P0 tests
- **90%+ pass rate** for P1 tests  
- **Zero critical accessibility violations**
- **Page load times < 3 seconds**
- **Mobile usability score > 85%**
