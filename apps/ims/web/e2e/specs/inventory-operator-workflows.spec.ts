import { test, expect, Page } from '@playwright/test';
import {
  setupApiMocks,
  seedAuthState,
  seedSupabaseSession,
} from '../fixtures/auth-helpers';
import {
  MOCK_STOCK_LEVELS,
  MOCK_LEDGER_ENTRIES,
  MOCK_INVENTORY_COUNT_BATCHES,
  MOCK_INVENTORY_COUNT_ROWS,
} from '../fixtures/mock-data';
import { InventoryPage } from '../pages/inventory.page';
import { CountsPage } from '../pages/counts.page';
import { setupDeniedAuth, assertPageHandlesDenial } from '../fixtures/denied-helpers';

const API = 'http://localhost:3001';

function setupInventoryMocks(page: Page) {
  return Promise.all([
    page.route(`${API}/inventory/stock`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_STOCK_LEVELS }),
      });
    }),
    page.route(`${API}/inventory/ledger`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_LEDGER_ENTRIES }),
      });
    }),
    page.route(`${API}/inventory/counts`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_INVENTORY_COUNT_BATCHES }),
      });
    }),
    page.route(`${API}/inventory/counts/*/rows`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_INVENTORY_COUNT_ROWS }),
      });
    }),
    page.route(`${API}/inventory/stock/summary`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { totalItems: 3, totalQty: 100, alerts: 2 } }),
      });
    }),
  ]);
}

test.describe('Inventory Operator workflows', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthState(page, {
      permissions: ['INVENTORY.READ', 'INVENTORY.COUNT'],
      fullName: 'Inventory Operator',
    });
    await setupApiMocks(page, true);
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await seedSupabaseSession(page);
  });

  test('W1 - Stock Levels view', async ({ page }) => {
    await setupInventoryMocks(page);
    const inventory = new InventoryPage(page);
    await inventory.goto();
    await inventory.switchToLiveStock();
    const count = await inventory.getStockRowCount();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('W2 - Count: start batch', async ({ page }) => {
    await setupInventoryMocks(page);
    const counts = new CountsPage(page);
    await counts.goto();
    const before = await counts.getBatchRowCount();
    await counts.clickStartCount();
    const after = await counts.getBatchRowCount();
    expect(after).toBeGreaterThanOrEqual(before);
  });

  test('W3 - Count: submit actual qty', async ({ page }) => {
    await setupInventoryMocks(page);
    const counts = new CountsPage(page);
    await counts.goto();
    await counts.expandBatchRow(0);
    await counts.submitActualQty(0, '48');
  });

  test('W4 - Count: close batch', async ({ page }) => {
    await setupInventoryMocks(page);
    const counts = new CountsPage(page);
    await counts.goto();
    await counts.expandBatchRow(0);
    await counts.clickCloseBatch();
  });

  test('W5 - Ledger view', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();
    await inventory.switchToTransactionLedger();
    const count = await inventory.getLedgerRowCount();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test.describe('Denied pages', () => {
    const deniedUrls = [
      '/inventory/transfers',
      '/inventory/waste',
      '/inventory/prep',
      '/procurement/vendors',
      '/procurement/orders',
      '/recipes',
      '/recipes/mappings',
      '/sales/import',
      '/reports/variance',
      '/admin/roles',
    ];

    for (const url of deniedUrls) {
      test(`navigating ${url} does not crash`, async ({ page }) => {
        await assertPageHandlesDenial(page, url);
      });
    }
  });
});
