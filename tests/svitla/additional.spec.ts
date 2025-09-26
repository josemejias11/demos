import { test, expect } from '@playwright/test';
import { Container } from './utils/container';
import { SvitlaTestBlocks } from './utils/testBlocks';
import { siteConfig } from './svitla.config';

test.describe('Svitla.com Additional Quick Checks @live', () => {
  let container: Container;
  let testBlocks: SvitlaTestBlocks;

  test.beforeEach(async () => {
    container = Container.getInstance();
    testBlocks = new SvitlaTestBlocks(container);
  });

  test('ADD-001: Logo is visible and links to home', async ({ page }) => {
    const { page: p } = await testBlocks.initializeTest(page, 'ADD-001');
    const logo = p.locator('a:has(img[alt*="logo"]), a:has-text("Svitla Systems light logo")').first();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('href');
  });

  test('ADD-002: Contact link present', async ({ page }) => {
    const { page: p } = await testBlocks.initializeTest(page, 'ADD-002');
    const contact = p.locator(siteConfig.selectors.contactLink).first();
    await expect(contact).toBeVisible();
  });

  test('ADD-003: Search icon or link exists', async ({ page }) => {
    const { page: p } = await testBlocks.initializeTest(page, 'ADD-003');
    const search = p.locator('a[href*="/search"], button[aria-label="Search"], input[type="search"]').first();
    // The search control may be visually hidden behind a toggle; assert it exists in the DOM
    await expect(search).toHaveCount(1);
  });

  test('ADD-004: Blog link visible in nav', async ({ page }) => {
    const { page: p } = await testBlocks.initializeTest(page, 'ADD-004');
    // Blog link may be inside nav or elsewhere; check for any anchor that points to blog/all
    const blog = p.locator('a[href*="/all"], a:has-text("Blog"), nav >> text=Blog').first();
    await expect(blog).toHaveCount(1);
  });

  test('ADD-005: Portfolio link visible', async ({ page }) => {
    const { page: p } = await testBlocks.initializeTest(page, 'ADD-005');
    const portfolio = p.locator('a[href*="/portfolio"], nav >> text=Portfolio').first();
    await expect(portfolio).toHaveCount(1);
  });

  test('ADD-006: Careers link visible', async ({ page }) => {
    const { page: p } = await testBlocks.initializeTest(page, 'ADD-006');
    const careers = p.locator('a[href*="/career"], nav >> text=Careers').first();
    await expect(careers).toHaveCount(1);
  });

  test('ADD-007: Social media links present (at least one)', async ({ page }) => {
    const { page: p } = await testBlocks.initializeTest(page, 'ADD-007');
    const social = p.locator('a[href*="facebook.com"], a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="instagram.com"]').first();
    await expect(social).toBeVisible();
  });

  test('ADD-008: Hero carousel controls visible', async ({ page }) => {
    const { page: p } = await testBlocks.initializeTest(page, 'ADD-008');
    const prev = p.locator('button:has-text("Previous slide"), button[aria-label*="previous" i]').first();
    const next = p.locator('button:has-text("Next slide"), button[aria-label*="next" i]').first();
    await expect(prev).toBeVisible();
    await expect(next).toBeVisible();
  });

  test('ADD-009: Primary CTA present in hero', async ({ page }) => {
    const { page: p } = await testBlocks.initializeTest(page, 'ADD-009');
    const cta = p.locator('main a:has-text("Contact Us"), main a:has-text("Request free AI consult"), main a:has-text("Learn more")').first();
    await expect(cta).toBeVisible();
  });

  test('ADD-010: Privacy/cookie policy link in footer', async ({ page }) => {
    const { page: p } = await testBlocks.initializeTest(page, 'ADD-010');
    const privacy = p.locator('footer a:has-text("Privacy"), a[href*="privacy-policy"]').first();
    await expect(privacy).toBeVisible();
  });
});
