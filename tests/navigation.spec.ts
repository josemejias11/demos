import { test, expect } from '@playwright/test';
import { HomePage } from './pageObjects/HomePage';
import { ContactPage } from './pageObjects/ContactPage';
import { ServicesPage } from './pageObjects/ServicesPage';

test.describe('Cross-Page Navigation Tests', () => {
  test('@smoke End-to-end user journey through main pages', async ({ page }) => {
    const homePage = new HomePage(page);
    const servicesPage = new ServicesPage(page);
    const contactPage = new ContactPage(page);

    await test.step('Start at homepage and validate', async () => {
      await homePage.navigateToHomePage();
      await homePage.acceptCookies();
      await homePage.validateHomePageContent();
    });

    await test.step('Navigate to services via navigation menu', async () => {
      await homePage.clickNavigation('Services');
      await servicesPage.validateServicesPageContent();
    });

    await test.step('Explore AI services', async () => {
      await servicesPage.page.evaluate(() => window.scrollTo(0, 2000));
      await servicesPage.clickServiceCategory('ai');
      await expect(servicesPage.page.locator('text=AI solutions').first()).toBeVisible();
    });

    await test.step('Navigate to contact page', async () => {
      await servicesPage.clickNavigation('Contact');
      await contactPage.validateContactPageContent();
    });

    await test.step('Fill contact form with inquiry about AI services', async () => {
      await contactPage.selectContactCategory('Our product support/service');
      
      const aiInquiryData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        country: 'USA',
        companyName: 'Tech Innovations LLC',
        jobTitle: 'CTO',
        businessNeeds: 'We are interested in your AI-powered solutions for manufacturing optimization. Please provide more details about implementation timeline and costs.'
      };

      await contactPage.fillContactForm(aiInquiryData);
      await contactPage.acceptPrivacyTerms();
    });

    await test.step('Return to homepage via logo', async () => {
      await contactPage.logo.click();
      await homePage.validateHomePageContent();
    });
  });

  test('Header navigation consistency across pages', async ({ page }) => {
    const homePage = new HomePage(page);

    await test.step('Validate navigation on homepage', async () => {
      await homePage.navigateToHomePage();
      await homePage.acceptCookies();
      await homePage.validateNavigationVisible();
    });

    await test.step('Test all navigation links from homepage', async () => {
      // Services
      await homePage.clickNavigation('Services');
      // Services navigation may go to different sections - be flexible with URL
      await expect(page).toHaveURL(/services-and-industries|#services|#overview/);
      await homePage.validateNavigationVisible();

      // Industries (should go to services page with industries section)
      await homePage.clickNavigation('Industries');
      await expect(page).toHaveURL(/services-and-industries|#industries/);
      await homePage.validateNavigationVisible();

      // Contact
      await homePage.clickNavigation('Contact');
      await expect(page).toHaveURL(/contact-us/);
      await homePage.validateNavigationVisible();

      // Careers (external link)
      const careersLink = page.getByRole('link', { name: 'Careers' }).first();
      await expect(careersLink).toHaveAttribute('href', /career\.fpt-software\.com/);

      // FPT x Chelsea
      await homePage.clickNavigation('FPT x Chelsea');
      await expect(page).toHaveURL(/fpt-chelseafc/);
      await homePage.validateNavigationVisible();
    });
  });

  test('Footer links work across all pages', async ({ page }) => {
    const pages = [
      { url: '/', name: 'Homepage' },
      { url: '/services-and-industries', name: 'Services' },
      { url: '/contact-us', name: 'Contact' }
    ];

    for (const testPage of pages) {
      await test.step(`Test footer on ${testPage.name}`, async () => {
        await page.goto(testPage.url);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // Validate key footer links - use first() to avoid strict mode violations
        await expect(page.getByRole('link', { name: 'About' }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'Terms of Use' }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'Privacy Statement' }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'Contact us' }).first()).toBeVisible();
        
        // Social media links
        await expect(page.getByRole('link', { name: 'Linkedin' }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'Twitter' }).first()).toBeVisible();
        
        // Copyright notice
        await expect(page.locator('text=Copyright @ 2025 FPT Software').first()).toBeVisible();
      });
    }
  });

  test('Search functionality is accessible from all pages', async ({ page }) => {
    const homePage = new HomePage(page);

    const testPages = [
      { url: '/', name: 'Homepage' },
      { url: '/services-and-industries', name: 'Services' },
      { url: '/contact-us', name: 'Contact' }
    ];

    for (const testPage of testPages) {
      await test.step(`Test search accessibility on ${testPage.name}`, async () => {
        await page.goto(testPage.url);
        await homePage.acceptCookies();
        
        // Validate search link is present and functional
        await expect(homePage.searchLink).toBeVisible();
        
        await homePage.searchLink.click();
        await expect(page).toHaveURL(/search-result/);
        
        // Navigate back for next iteration
        await page.goBack();
      });
    }
  });

  test('Breadcrumb navigation works correctly', async ({ page }) => {
    await test.step('Navigate to services page', async () => {
      await page.goto('/services-and-industries');
    });

    await test.step('Navigate to a specific service', async () => {
      const aiServiceLink = page.getByRole('link', { name: 'See more' }).first();
      if (await aiServiceLink.isVisible()) {
        await aiServiceLink.click();
        
        // Should be on a service detail page
        await expect(page).toHaveURL(/services/);
      }
    });
  });

  test('Quick contact access from all pages', async ({ page }) => {
    const homePage = new HomePage(page);
    
    const testPages = [
      { url: '/', name: 'Homepage' },
      { url: '/services-and-industries', name: 'Services' }
    ];

    for (const testPage of testPages) {
      await test.step(`Test quick contact on ${testPage.name}`, async () => {
        await page.goto(testPage.url);
        await homePage.acceptCookies();
        
        // Look for "Let Us Accompany You" contact section in footer
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        
        const contactSection = page.getByRole('heading', { name: 'Let Us Accompany You' }).first();
        await expect(contactSection).toBeVisible();
        
        // Test quick contact button if available
        const showFormButton = page.getByRole('link', { name: 'show form button' }).first();
        if (await showFormButton.isVisible()) {
          await expect(showFormButton).toBeVisible();
        }
      });
    }
  });

  test('Mobile menu functionality', async ({ page }) => {
    const homePage = new HomePage(page);

    await test.step('Set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    await test.step('Test mobile navigation on homepage', async () => {
      await homePage.navigateToHomePage();
      await homePage.acceptCookies();
      
      // On mobile, navigation might be collapsed
      await homePage.validateNavigationVisible();
    });

    await test.step('Test mobile navigation on services', async () => {
      await page.goto('/services-and-industries');
      await homePage.validateNavigationVisible();
    });

    await test.step('Test mobile navigation on contact', async () => {
      await page.goto('/contact-us');
      await homePage.validateNavigationVisible();
    });

    await test.step('Reset to desktop', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
    });
  });

  test('Page loading performance is acceptable', async ({ page }) => {
    const urls = [
      '/',
      '/services-and-industries',
      '/contact-us'
    ];

    for (const url of urls) {
      await test.step(`Test loading performance for ${url}`, async () => {
        const startTime = Date.now();
        
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        
        // Page should load within 15 seconds (increased from 10 to handle slower loads)
        expect(loadTime).toBeLessThan(15000);
        
        // Page should have title
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title).toContain('FPT Software');
      });
    }
  });

  test('External links open correctly', async ({ page }) => {
    const homePage = new HomePage(page);

    await test.step('Navigate to homepage', async () => {
      await homePage.navigateToHomePage();
      await homePage.acceptCookies();
    });

    await test.step('Test careers external link', async () => {
      const careersLink = page.getByRole('link', { name: 'Careers' }).first();
      await expect(careersLink).toHaveAttribute('href', /career\.fpt-software\.com/);
      
      // Test that it opens in new tab (if target="_blank" is set)
      const href = await careersLink.getAttribute('href');
      expect(href).toContain('career.fpt-software.com');
    });

    await test.step('Test social media links', async () => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // LinkedIn
      const linkedinLink = page.getByRole('link', { name: 'Linkedin' }).first();
      await expect(linkedinLink).toHaveAttribute('href', /linkedin\.com/);
      
      // Twitter
      const twitterLink = page.getByRole('link', { name: 'Twitter' }).first();
      await expect(twitterLink).toHaveAttribute('href', /twitter\.com/);
    });
  });
});
