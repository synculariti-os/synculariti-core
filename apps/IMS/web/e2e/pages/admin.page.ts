import { Page, Locator } from '@playwright/test';

export class FranchiseGroupsPage {
  readonly page: Page;
  readonly table: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.createButton = page.getByRole('button', { name: /create franchise group|new franchise group/i });
  }

  async goto() {
    await this.page.goto('/admin/franchise-groups');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }
}

export class RestaurantsPage {
  readonly page: Page;
  readonly table: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.createButton = page.getByRole('button', { name: /create restaurant|new restaurant/i });
  }

  async goto() {
    await this.page.goto('/admin/restaurants');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }
}

export class RolesPage {
  readonly page: Page;
  readonly table: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.createButton = page.getByRole('button', { name: /create role|new role/i });
  }

  async goto() {
    await this.page.goto('/admin/roles');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }

  async clickEdit(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /edit/i }).click();
  }

  async clickDelete(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /delete/i }).click();
  }
}

export class PermissionsPage {
  readonly page: Page;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
  }

  async goto() {
    await this.page.goto('/admin/permissions');
    await this.page.waitForLoadState('networkidle');
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }
}

export class UserAssignmentsPage {
  readonly page: Page;
  readonly table: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.createButton = page.getByRole('button', { name: /assign role|create assignment|new assignment/i });
  }

  async goto() {
    await this.page.goto('/admin/assignments');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async clickDelete(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /delete|remove/i }).click();
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }
}

export class AuditLogsPage {
  readonly page: Page;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
  }

  async goto() {
    await this.page.goto('/admin/audit-logs');
    await this.page.waitForLoadState('networkidle');
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }
}
