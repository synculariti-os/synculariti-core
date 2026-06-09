import { Page, Locator } from '@playwright/test';

export class SalesPage {
  readonly page: Page;
  readonly fileUploader: Locator;
  readonly uploadButton: Locator;
  readonly batchesTable: Locator;
  readonly unmappedPanel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fileUploader = page.locator('input[type="file"]');
    this.uploadButton = page.getByRole('button', { name: /upload|import/i });
    this.batchesTable = page.locator('table').first();
    this.unmappedPanel = page.locator('text=Unmapped Items').locator('..');
  }

  async goto() {
    await this.page.goto('/sales/import');
    await this.page.waitForLoadState('networkidle');
  }

  async clickUpload() {
    await this.uploadButton.click();
  }

  async uploadFile(filePath: string) {
    await this.fileUploader.setInputFiles(filePath);
    await this.uploadButton.click();
    await this.page.waitForTimeout(500);
  }

  async getBatchRowCount() {
    return this.batchesTable.locator('tbody tr').count();
  }

  async getBatchStatus(index: number): Promise<string> {
    return await this.batchesTable.locator('tbody tr').nth(index).locator('td').last().textContent() ?? '';
  }
}
