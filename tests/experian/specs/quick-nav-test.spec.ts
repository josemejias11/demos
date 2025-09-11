import { test, expect } from '@playwright/test';
import { HomePage } from '../pageObjects/HomePage';

test('Quick navigation validation', async ({ page }) => {
  const homePage = new HomePage(page);
  await page.goto('https://www.experian.com');
  await page.waitForTimeout(3000);
  
  // Test each navigation button
  const navButtons = await homePage.getAllNavigationButtons();
  
  console.log('Testing navigation buttons:');
  
  // Test Credit
  const creditVisible = await navButtons.credit.isVisible();
  console.log('Credit button visible:', creditVisible);
  expect(creditVisible).toBe(true);
  
  // Test Protection  
  const protectionVisible = await navButtons.protection.isVisible();
  console.log('Protection button visible:', protectionVisible);
  expect(protectionVisible).toBe(true);
  
  // Test Money
  const moneyVisible = await navButtons.money.isVisible();
  console.log('Money button visible:', moneyVisible);
  expect(moneyVisible).toBe(true);
  
  // Test Credit Cards
  const creditCardsVisible = await navButtons.creditCards.isVisible();
  console.log('Credit Cards button visible:', creditCardsVisible);
  expect(creditCardsVisible).toBe(true);
  
  // Test Loans
  const loansVisible = await navButtons.loans.isVisible();
  console.log('Loans button visible:', loansVisible);
  expect(loansVisible).toBe(true);
  
  // Test Insurance
  const insuranceVisible = await navButtons.insurance.isVisible();
  console.log('Insurance button visible:', insuranceVisible);
  expect(insuranceVisible).toBe(true);
  
  console.log('All navigation buttons validated successfully! ✅');
});
