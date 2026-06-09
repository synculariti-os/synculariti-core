import { Page, Locator } from '@playwright/test';

export class VarianceReportPage {
  readonly page: Page;
  readonly table: Locator;
  readonly dateRangeInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.dateRangeInput = page.getByPlaceholder(/date range|from/i);
  }

  async goto() {
    await this.page.goto('/reports/variance');
    await this.page.waitForLoadState('networkidle');
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }
}

export class SnapshotsPage {
  readonly page: Page;
  readonly cards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cards = page.locator('[class*="card"]');
  }

  async goto() {
    await this.page.goto('/reports/snapshots');
    await this.page.waitForLoadState('networkidle');
  }

  async getCardCount() {
    return this.cards.count();
  }
}

export class ParAlertsPage {
  readonly page: Page;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
  }

  async goto() {
    await this.page.goto('/reports/par-alerts');
    await this.page.waitForLoadState('networkidle');
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }
}
