import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly stockTable: Locator;
  readonly ledgerTable: Locator;
  readonly liveStockTab: Locator;
  readonly transactionLedgerTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.stockTable = page.locator('table').first();
    this.ledgerTable = page.locator('table').nth(1);
    this.liveStockTab = page.getByRole('tab', { name: /live stock/i });
    this.transactionLedgerTab = page.getByRole('tab', { name: /transaction ledger|ledger/i });
  }

  async goto() {
    await this.page.goto('/inventory');
    await this.page.waitForLoadState('networkidle');
  }

  async switchToLiveStock() {
    await this.liveStockTab.click();
    await this.page.waitForTimeout(200);
  }

  async switchToTransactionLedger() {
    await this.transactionLedgerTab.click();
    await this.page.waitForTimeout(200);
  }

  async getStockRowCount() {
    return this.stockTable.locator('tbody tr').count();
  }

  async getLedgerRowCount() {
    return this.ledgerTable.locator('tbody tr').count();
  }
}

export class TransfersPage {
  readonly page: Page;
  readonly table: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.createButton = page.getByRole('button', { name: /create transfer|new transfer/i });
  }

  async goto() {
    await this.page.goto('/inventory/transfers');
    await this.page.waitForLoadState('networkidle');
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }

  async clickCreate() {
    await this.createButton.click();
  }
}

export class WastePage {
  readonly page: Page;
  readonly table: Locator;
  readonly recordButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.recordButton = page.getByRole('button', { name: /record waste|new waste/i });
    this.saveButton = page.getByRole('button', { name: /save|submit|record/i });
  }

  async goto() {
    await this.page.goto('/inventory/waste');
    await this.page.waitForLoadState('networkidle');
  }

  async clickRecordWaste() {
    await this.recordButton.click();
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }
}

export class PrepProductionPage {
  readonly page: Page;
  readonly table: Locator;
  readonly produceButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.produceButton = page.getByRole('button', { name: /produce|new prep/i });
    this.saveButton = page.getByRole('button', { name: /save|produce/i });
  }

  async goto() {
    await this.page.goto('/inventory/prep');
    await this.page.waitForLoadState('networkidle');
  }

  async clickProduce() {
    await this.produceButton.click();
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }
}

export class LedgerPage {
  readonly page: Page;
  readonly table: Locator;
  readonly entries: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.entries = this.table.locator('tbody tr');
  }

  async goto() {
    await this.page.goto('/inventory/ledger');
    await this.page.waitForLoadState('networkidle');
  }

  async getEntryCount() {
    return this.entries.count();
  }

  async getEntryReasonCodes(): Promise<string[]> {
    return this.entries.locator('td').nth(2).allTextContents();
  }
}
