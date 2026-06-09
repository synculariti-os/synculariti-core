import { test, expect, Page } from '@playwright/test';
import {
  setupApiMocks,
  seedAuthState,
  seedSupabaseSession,
} from '../fixtures/auth-helpers';
import { MOCK_VENDORS, MOCK_PURCHASE_ORDERS } from '../fixtures/mock-data';
import { VendorsPage, PurchaseOrdersPage } from '../pages/procurement.page';
import { assertPageHandlesDenial } from '../fixtures/denied-helpers';

const API = 'http://localhost:3001';

function setupProcurementMocks(page: Page) {
  return Promise.all([
    page.route(`${API}/procurement/vendors`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_VENDORS }),
      });
    }),
    page.route(`${API}/procurement/orders`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_PURCHASE_ORDERS }),
      });
    }),
    page.route(`${API}/procurement/vendors/*`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_VENDORS[0] }),
      });
    }),
  ]);
}

test.describe('Procurement Specialist workflows', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthState(page, {
      permissions: ['PROCUREMENT.READ', 'PROCUREMENT.WRITE'],
      fullName: 'Procurement Specialist',
    });
    await setupApiMocks(page, true);
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await seedSupabaseSession(page);
  });

  test('W1 - Vendors: list view', async ({ page }) => {
    await setupProcurementMocks(page);
    const vendors = new VendorsPage(page);
    await vendors.goto();
    const count = await vendors.getRowCount();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('W2 - Vendors: create', async ({ page }) => {
    await setupProcurementMocks(page);
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.clickCreate();
  });

  test('W3 - Vendors: edit', async ({ page }) => {
    await setupProcurementMocks(page);
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.clickEdit(0);
  });

  test('W5 - POs: list view', async ({ page }) => {
    await setupProcurementMocks(page);
    const pos = new PurchaseOrdersPage(page);
    await pos.goto();
    const count = await pos.getRowCount();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('W6 - PO: create draft', async ({ page }) => {
    await setupProcurementMocks(page);
    const pos = new PurchaseOrdersPage(page);
    await pos.goto();
    await pos.clickCreate();
  });

  test('W9 - PO: cancel draft', async ({ page }) => {
    await setupProcurementMocks(page);
    const pos = new PurchaseOrdersPage(page);
    await pos.goto();
    const status = await pos.getRowStatus(0);
    if (status === 'DRAFT') {
      await pos.clickCancelForRow(0);
    }
  });

  test.describe('Denied pages', () => {
    const deniedUrls = [
      '/dashboard',
      '/items',
      '/items/categories',
      '/inventory',
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
