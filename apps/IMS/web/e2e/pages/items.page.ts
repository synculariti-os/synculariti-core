import { Page, Locator } from '@playwright/test';

export class ItemsPage {
  readonly page: Page;
  readonly table: Locator;
  readonly createButton: Locator;
  readonly uploadButton: Locator;
  readonly downloadTemplateButton: Locator;
  readonly searchInput: Locator;
  readonly categoriesTab: Locator;
  readonly itemsTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.createButton = page.getByRole('button', { name: /create item|new item/i });
    this.uploadButton = page.getByRole('button', { name: /upload|import csv/i });
    this.downloadTemplateButton = page.getByRole('button', { name: /download template|template/i });
    this.searchInput = page.getByPlaceholder(/search|filter/i);
    this.categoriesTab = page.getByRole('tab', { name: /categories/i });
    this.itemsTab = page.getByRole('tab', { name: /items/i });
  }

  async goto() {
    await this.page.goto('/items');
    await this.page.waitForLoadState('networkidle');
  }

  async switchToItems() {
    await this.itemsTab.click();
    await this.page.waitForTimeout(200);
  }

  async switchToCategories() {
    await this.categoriesTab.click();
    await this.page.waitForTimeout(200);
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async clickUpload() {
    await this.uploadButton.click();
  }

  async clickDownloadTemplate() {
    await this.downloadTemplateButton.click();
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }

  async getRow(index: number): Promise<{ name: string; sku: string; type: string }> {
    const row = this.table.locator('tbody tr').nth(index);
    const cells = row.locator('td');
    return {
      name: await cells.nth(0).textContent() ?? '',
      sku: await cells.nth(1).textContent() ?? '',
      type: await cells.nth(2).textContent() ?? '',
    };
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300);
  }

  async selectRow(index: number) {
    await this.table.locator('tbody tr').nth(index).locator('input[type="checkbox"]').click();
  }

  async clickEdit(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /edit/i }).click();
  }

  async clickDelete(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /delete/i }).click();
  }

  async clickBulkDelete() {
    await this.page.getByRole('button', { name: /bulk delete|delete selected/i }).click();
  }
}

export class CategoriesPage {
  readonly page: Page;
  readonly table: Locator;
  readonly createButton: Locator;
  readonly uploadButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.createButton = page.getByRole('button', { name: /create category|new category/i });
    this.uploadButton = page.getByRole('button', { name: /upload|import csv/i });
  }

  async goto() {
    await this.page.goto('/items/categories');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async clickEdit(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /edit/i }).click();
  }

  async clickDelete(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /delete/i }).click();
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
}
