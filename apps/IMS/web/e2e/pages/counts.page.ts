import { Page, Locator, expect } from '@playwright/test';

export class CountsPage {
  readonly page: Page;
  readonly table: Locator;
  readonly startCountButton: Locator;
  readonly closeBatchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.startCountButton = page.getByRole('button', { name: /start count|start batch/i });
    this.closeBatchButton = page.getByRole('button', { name: /close batch|close count/i });
  }

  async goto() {
    await this.page.goto('/inventory/counts');
    await this.page.waitForLoadState('networkidle');
  }

  async clickStartCount() {
    await this.startCountButton.click();
  }

  async getBatchRowCount() {
    return this.table.locator('tbody tr').count();
  }

  /**
   * Expand a batch row by index (0-based) to reveal count rows.
   */
  async expandBatchRow(index: number) {
    const row = this.table.locator('tbody tr').nth(index);
    await row.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Fill actual qty for a count row within an expanded batch.
   */
  async fillActualQty(countRowIndex: number, qty: string) {
    const input = this.page.locator('input[type="number"]').nth(countRowIndex);
    await input.fill(qty);
  }

  async clickCloseBatch() {
    await this.closeBatchButton.click();
  }

  async submitActualQty(index: number, qty: string) {
    const input = this.table.locator('tbody tr').nth(index).locator('input[type="number"]');
    await input.fill(qty);
    const saveButton = this.table.locator('tbody tr').nth(index).getByRole('button', { name: /save|submit/i });
    await saveButton.click();
    await this.page.waitForTimeout(200);
  }
}
