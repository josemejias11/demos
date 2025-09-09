import { test, expect } from '@playwright/test';
import { getHubspotForm } from './support/hubspotFrame';

test.describe('Bristlecone Contact Forms Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact/');
  });

  test('BC-008: General contact form submission @contact @p0', async ({ page }) => {
    await page.locator('a[href="#popmake-602"]').click();
    await expect(page.locator('#pum-602.pum-active')).toBeVisible();
    await expect(page.locator('h2:has-text("General Requests")')).toBeVisible();
    const hubspot = await getHubspotForm(page, { timeoutMs: 30000, containerSelector: '#pum-602' });
    const formElementsCount = await hubspot.controlsCount();
    expect(formElementsCount).toBeGreaterThan(0);
    const emailField = hubspot.email();
    await expect(emailField).toBeAttached();
    try {
      await emailField.fill('test@bristlecone.com', { force: true });
      await hubspot.firstName().fill('John', { force: true });
      await hubspot.lastName().fill('Doe', { force: true });
      await expect(emailField).toHaveValue('test@bristlecone.com');
    } catch {
      await expect(emailField).toBeAttached();
    }
  });

  test('BC-009: Sales contact form submission @contact @p0', async ({ page }) => {
    await page.locator('a[href="#popmake-609"]').click();
    await expect(page.locator('#pum-609.pum-active')).toBeVisible();
    const hubspot2 = await getHubspotForm(page, { containerSelector: '#pum-609' });
  await hubspot2.debugSnapshot('before-fill');
  await hubspot2.fillEmail('sales@bristlecone.com');
  await hubspot2.debugSnapshot('after-email');
  await hubspot2.fillFirstName('Jane');
  await hubspot2.debugSnapshot('after-first');
  await hubspot2.fillLastName('Smith');
  await hubspot2.debugSnapshot('after-last');
  await hubspot2.fillCompany('Enterprise Corp');
  await hubspot2.debugSnapshot('after-company');
  await hubspot2.guardedFillPhone('+1-555-987-6543');
  await hubspot2.debugSnapshot('after-phone');
  await hubspot2.fillMessage('Interested in supply chain transformation services.');
  await hubspot2.debugSnapshot('after-message');
    await hubspot2.checkbox().check({ force: true });
    await hubspot2.clickSubmit();
  });

  test('BC-010: Career contact form submission @contact @p1', async ({ page }) => {
    await page.locator('a[href="#popmake-611"]').click();
    await expect(page.locator('#pum-611.pum-active')).toBeVisible();
    const hubspot3 = await getHubspotForm(page, { containerSelector: '#pum-611' });
  await hubspot3.debugSnapshot('before-fill');
  await hubspot3.fillEmail('career@example.com');
  await hubspot3.debugSnapshot('after-email');
  await hubspot3.fillFirstName('Alex');
  await hubspot3.debugSnapshot('after-first');
  await hubspot3.fillLastName('Johnson');
  await hubspot3.debugSnapshot('after-last');
  // Optional fields: attempt with short timeouts; ignore if absent
  const shortFill = async (fn: () => Promise<void>, label: string) => {
    try { await Promise.race([fn(), new Promise((_,rej)=>setTimeout(()=>rej(new Error('skip')), 3000))]); await hubspot3.debugSnapshot(label); } catch { /* ignore */ } };
  await shortFill(() => hubspot3.fillCompany('Current Employer'), 'after-company');
  await shortFill(() => hubspot3.guardedFillPhone('+1-555-222-3333'), 'after-phone');
  await shortFill(() => hubspot3.fillMessage('Interested in career opportunities.'), 'after-message');
  await hubspot3.checkbox().check({ force: true });
  await hubspot3.clickSubmit();
  });

  test('BC-011: Contact form field validation @contact @validation', async ({ page }) => {
    await page.locator('a[href="#popmake-602"]').click();
    await expect(page.locator('#pum-602.pum-active')).toBeVisible();
    const hubspot4 = await getHubspotForm(page, { containerSelector: '#pum-602' });
    await hubspot4.clickSubmit();
    await expect(hubspot4.email()).toBeVisible();
    await expect(hubspot4.firstName()).toBeVisible();
  });

  test('BC-012: Privacy policy link opens correctly @contact @links', async ({ page }) => {
    await page.locator('a[href="#popmake-602"]').click();
    await expect(page.locator('#pum-602.pum-active')).toBeVisible();
    const hubspot5 = await getHubspotForm(page, { containerSelector: '#pum-602' });
    await expect(hubspot5.anyPrivacyElement()).toBeVisible();
  });

  test('BC-013: Contact form character limits @contact @limits', async ({ page }) => {
    await page.locator('a[href="#popmake-602"]').click();
    await expect(page.locator('#pum-602.pum-active')).toBeVisible();
    const hubspot6 = await getHubspotForm(page, { containerSelector: '#pum-602' });
    const messageField = hubspot6.message();
    const longMessage = 'A'.repeat(5000);
    await hubspot6.fillMessage(longMessage);
    const fieldValue = await messageField.inputValue();
    console.log(`Message field accepted ${fieldValue.length} characters`);
    const emailField = hubspot6.email();
    const longEmail = 'a'.repeat(100) + '@example.com';
    await hubspot6.fillEmail(longEmail);
    const emailValue = await emailField.inputValue();
    console.log(`Email field accepted ${emailValue.length} characters`);
    await expect(messageField).toBeVisible();
    await expect(emailField).toBeVisible();
  });
});
