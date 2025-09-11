import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly creditScoreWidget: Locator;
  readonly creditScoreValue: Locator;
  readonly creditScoreRange: Locator;
  readonly accountSummary: Locator;
  readonly alertsSection: Locator;
  readonly activityFeed: Locator;
  readonly navigationMenu: Locator;
  readonly userProfile: Locator;
  readonly notificationsIcon: Locator;
  readonly settingsLink: Locator;

  // Credit monitoring elements
  readonly identityMonitoring: Locator;
  readonly creditChanges: Locator;
  readonly darkWebScanning: Locator;
  readonly fraudAlerts: Locator;

  // Quick actions
  readonly viewCreditReportButton: Locator;
  readonly disputeButton: Locator;
  readonly freezeCreditButton: Locator;
  readonly upgradeAccountButton: Locator;
  readonly addBankAccountButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Main dashboard elements
    this.welcomeMessage = page.locator('[data-testid*="welcome"], .welcome, h1:has-text("welcome")');
    this.creditScoreWidget = page.locator('[data-testid*="credit-score"], .credit-score, [class*="score-widget"]');
    this.creditScoreValue = page.locator('[data-testid*="score-value"], .score-number, [class*="score-display"]');
    this.creditScoreRange = page.locator('[data-testid*="score-range"], .score-range, [class*="score-meter"]');
    this.accountSummary = page.locator('[data-testid*="summary"], .account-summary, [class*="summary-section"]');
    this.alertsSection = page.locator('[data-testid*="alerts"], .alerts, [class*="notifications"]');
    this.activityFeed = page.locator('[data-testid*="activity"], .activity-feed, [class*="recent-activity"]');
    
    // Navigation
    this.navigationMenu = page.locator('[data-testid*="nav"], .main-nav, [role="navigation"]');
    this.userProfile = page.locator('[data-testid*="profile"], .user-profile, [class*="account-menu"]');
    this.notificationsIcon = page.locator('[data-testid*="notifications"], .notifications-icon, [class*="bell"]');
    this.settingsLink = page.locator('a[href*="settings"], a:has-text("settings"), a:has-text("preferences")');

    // Monitoring features
    this.identityMonitoring = page.locator('[data-testid*="identity"], :text("identity monitoring"), [class*="identity-protection"]');
    this.creditChanges = page.locator('[data-testid*="changes"], :text("credit changes"), [class*="credit-alerts"]');
    this.darkWebScanning = page.locator('[data-testid*="dark-web"], :text("dark web"), [class*="dark-web"]');
    this.fraudAlerts = page.locator('[data-testid*="fraud"], :text("fraud alerts"), [class*="fraud-protection"]');

    // Action buttons
    this.viewCreditReportButton = page.locator('button:has-text("view report"), a[href*="report"], button[data-testid*="report"]');
    this.disputeButton = page.locator('button:has-text("dispute"), a[href*="dispute"], button[data-testid*="dispute"]');
    this.freezeCreditButton = page.locator('button:has-text("freeze"), a[href*="freeze"], button[data-testid*="freeze"]');
    this.upgradeAccountButton = page.locator('button:has-text("upgrade"), a[href*="upgrade"], button[data-testid*="upgrade"]');
    this.addBankAccountButton = page.locator('button:has-text("add bank"), a[href*="bank"], button[data-testid*="bank"]');
  }

  async getCreditScore(): Promise<string> {
    await this.creditScoreWidget.waitFor({ state: 'visible' });
    return await this.creditScoreValue.textContent() || '0';
  }

  async getCreditScoreRange(): Promise<string> {
    return await this.creditScoreRange.textContent() || '';
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.welcomeMessage.textContent() || '';
  }

  async getAlertCount(): Promise<number> {
    const alerts = await this.alertsSection.locator('.alert-item, [data-testid*="alert"]').count();
    return alerts;
  }

  async getRecentActivity(): Promise<string[]> {
    const activities = await this.activityFeed.locator('.activity-item, [data-testid*="activity"]').allTextContents();
    return activities;
  }

  async navigateToSection(section: 'credit-report' | 'monitoring' | 'products' | 'settings') {
    const sectionMap = {
      'credit-report': 'a[href*="report"], button:has-text("credit report")',
      'monitoring': 'a[href*="monitoring"], button:has-text("monitoring")',
      'products': 'a[href*="products"], button:has-text("products")',
      'settings': 'a[href*="settings"], button:has-text("settings")'
    };
    
    await this.page.locator(sectionMap[section]).click();
  }

  async viewCreditReport() {
    await this.viewCreditReportButton.click();
  }

  async startDispute() {
    await this.disputeButton.click();
  }

  async freezeCredit() {
    await this.freezeCreditButton.click();
  }

  async upgradeAccount() {
    await this.upgradeAccountButton.click();
  }

  async isMonitoringActive(): Promise<boolean> {
    return await this.identityMonitoring.isVisible() && 
           await this.creditChanges.isVisible();
  }

  async getNotificationCount(): Promise<number> {
    const badge = this.notificationsIcon.locator('[class*="badge"], [data-testid*="count"]');
    const count = await badge.textContent();
    return count ? parseInt(count) : 0;
  }

  async waitForDashboardLoad() {
    await this.welcomeMessage.waitFor({ state: 'visible' });
    await this.creditScoreWidget.waitFor({ state: 'visible' });
  }

  // Finance-specific dashboard features
  async getCreditUtilization(): Promise<string> {
    const utilization = this.page.locator('[data-testid*="utilization"], :text("utilization"), [class*="utilization"]');
    return await utilization.textContent() || '0%';
  }

  async getAccountHealth(): Promise<string> {
    const health = this.page.locator('[data-testid*="health"], :text("account health"), [class*="health-score"]');
    return await health.textContent() || '';
  }

  async hasNewCreditChanges(): Promise<boolean> {
    const newChanges = this.page.locator('[class*="new"], [data-testid*="new"], .badge');
    return await newChanges.isVisible();
  }
}
