import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly statCards: Locator;
  readonly quickLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.statCards = page.locator('section.grid a');
    this.quickLinks = page.locator('section:has(h2) a');
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async getStatCount() {
    return this.statCards.count();
  }

  async getQuickLinkCount() {
    return this.quickLinks.count();
  }
}
