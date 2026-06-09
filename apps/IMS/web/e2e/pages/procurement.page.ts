import { Page, Locator } from '@playwright/test';

export class VendorsPage {
  readonly page: Page;
  readonly table: Locator;
  readonly createButton: Locator;
  readonly uploadButton: Locator;
  readonly downloadTemplateButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.createButton = page.getByRole('button', { name: /create vendor|new vendor/i });
    this.uploadButton = page.getByRole('button', { name: /upload|import csv/i });
    this.downloadTemplateButton = page.getByRole('button', { name: /download template|template/i });
    this.searchInput = page.getByPlaceholder(/search|filter/i);
  }

  async goto() {
    await this.page.goto('/procurement/vendors');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async clickUpload() {
    await this.uploadButton.click();
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }

  async selectRow(index: number) {
    await this.table.locator('tbody tr').nth(index).locator('input[type="checkbox"]').click();
  }

  async clickBulkDelete() {
    await this.page.getByRole('button', { name: /bulk delete|delete selected/i }).click();
  }

  async clickEdit(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /edit/i }).click();
  }
}

export class PurchaseOrdersPage {
  readonly page: Page;
  readonly table: Locator;
  readonly createButton: Locator;
  readonly submitButton: Locator;
  readonly receiveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.createButton = page.getByRole('button', { name: /create po|new purchase order/i });
    this.submitButton = page.getByRole('button', { name: /submit/i });
    this.receiveButton = page.getByRole('button', { name: /receive/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
  }

  async goto() {
    await this.page.goto('/procurement/orders');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }

  async getRowStatus(index: number): Promise<string> {
    return await this.table.locator('tbody tr').nth(index).locator('td').nth(2).textContent() ?? '';
  }

  async clickRow(index: number) {
    await this.table.locator('tbody tr').nth(index).click();
    await this.page.waitForTimeout(200);
  }

  async expandRow(index: number) {
    await this.table.locator('tbody tr').nth(index).locator('button[aria-expanded]').click();
    await this.page.waitForTimeout(200);
  }

  async clickSubmitForRow(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /submit/i }).click();
  }

  async clickReceiveForRow(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /receive/i }).click();
  }

  async clickCancelForRow(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /cancel/i }).click();
  }
}
