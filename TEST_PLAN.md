# Test Plan: Plan A Technologies Website
**Target URL**: https://planatechnologies.com
**Site Type**: B2B Software Consulting/Staffing
**Test Count**: 20 test cases (maximum)
**Framework**: Playwright + TypeScript with KB-enhanced selectors

---

## Test Categories

### 1. Core Navigation & Page Load (5 tests)
1. **Homepage Load** - Verify homepage loads successfully with correct title and URL
2. **About Us Navigation** - Navigate to About Us page and verify content
3. **Careers Page Load** - Navigate to Careers section and verify job listings
4. **Blog/News Navigation** - Access Blog/News section and verify articles
5. **Footer Navigation** - Verify all footer links (Privacy, Terms, Cookies) are accessible

### 2. Interactive Elements (4 tests)
6. **Contact Form Display** - Verify contact form is visible and all fields present
7. **CTA Buttons Functional** - Test "LET'S TALK" call-to-action buttons across pages
8. **Client Portfolio Carousel** - Verify client logos carousel displays and navigates
9. **Industry Cards Clickable** - Test all 6 industry selector cards are clickable

### 3. Form Functionality (3 tests)
10. **Contact Form Validation** - Test form validation (required fields, email format)
11. **Contact Form Submission** - Submit valid contact form and verify confirmation
12. **Service Inquiry Form** - Test service inquiry form with different service types

### 4. Content Verification (3 tests)
13. **Homepage Statistics** - Verify key statistics are displayed (400+ products, 75+ referrals, etc.)
14. **Technology Stack Display** - Verify technology stack section shows multiple tech logos
15. **Service Model Cards** - Verify 3 service model cards (Project-based, Dedicated Talent, Consulting)

### 5. Responsive & Cross-Device (2 tests)
16. **Mobile Viewport Test** - Verify site renders correctly on mobile (375x667)
17. **Tablet Viewport Test** - Verify site renders correctly on tablet (768x1024)

### 6. Accessibility Basics (2 tests)
18. **Keyboard Navigation** - Verify tab navigation through main menu and forms
19. **ARIA Landmarks** - Verify proper ARIA roles (navigation, main, footer)

### 7. Performance & SEO (1 test)
20. **Meta Tags & SEO** - Verify meta description, Open Graph tags, and canonical URL

---

## Test Execution Priority

**P0 (Critical)**: Tests 1, 6, 10, 11
**P1 (High)**: Tests 2, 3, 7, 13, 18
**P2 (Medium)**: Tests 4, 5, 8, 9, 12, 14, 15, 19, 20
**P3 (Low)**: Tests 16, 17

---

## Expected Test Coverage

| Category | Tests | Coverage |
|----------|-------|----------|
| Navigation | 5 | 25% |
| Interactive Elements | 4 | 20% |
| Forms | 3 | 15% |
| Content | 3 | 15% |
| Responsive | 2 | 10% |
| Accessibility | 2 | 10% |
| Performance | 1 | 5% |
| **TOTAL** | **20** | **100%** |

---

## Test Data Requirements

### Contact Form Test Data
- Valid email: test@example.com
- Invalid email: invalid-email
- Name: John Doe
- Website: https://example.com
- Message: Test inquiry message

### Industry Cards Test Data
- Expected industries: 6 total (verify each is clickable)
- Technology stack: Multiple tech logos visible

### Statistics Test Data
- 400+ product deployments
- 75+ client referrals
- 30+ technology awards
- 200+ clients
- 0.4% hiring selectivity

---

## Special Considerations

1. **Cookie Consent**: Tests must handle cookie consent banner
2. **Dynamic Content**: Some content loads asynchronously (wait strategies needed)
3. **Video Player**: Unmute video functionality test (optional, not in 20)
4. **Client Logos**: May be loaded via CDN (verify image alt text)
5. **Form Submission**: May redirect or show inline confirmation

---

## Test File Structure

```
tests/planatechnologies-com/
├── e2e/
│   ├── smoke.spec.ts (tests 1, 6, 13)
│   ├── navigation.spec.ts (tests 2-5)
│   ├── forms.spec.ts (tests 10-12)
│   ├── interactive.spec.ts (tests 7-9)
│   ├── content.spec.ts (tests 14-15)
│   ├── responsive.spec.ts (tests 16-17)
│   └── seo.spec.ts (test 20)
├── accessibility/
│   └── a11y.spec.ts (tests 18-19)
└── pageObjects/
    ├── HomePage.ts
    ├── ContactPage.ts
    ├── CareersPage.ts
    └── basePage.ts
```

---

## Excluded from Scope (Future Enhancements)

- Video player interaction tests
- Detailed blog article content verification
- Form submission backend integration tests
- Advanced SEO audit (beyond meta tags)
- Performance metrics (LCP, FID, CLS)
- Social media link verification
- Newsletter signup functionality

---

**Status**: Test plan approved
**Estimated Execution Time**: 10-15 minutes
**Next Steps**: Implement test cases in Playwright
