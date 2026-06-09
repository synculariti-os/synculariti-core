import { test, expect, Page } from '@playwright/test';
import {
  setupApiMocks,
  seedAuthState,
  seedSupabaseSession,
} from '../fixtures/auth-helpers';
import { ItemsPage, CategoriesPage } from '../pages/items.page';
import {
  MOCK_ITEMS,
  MOCK_CATEGORIES,
  MOCK_RECIPES,
  MOCK_MENU_ITEM_MAPPINGS,
} from '../fixtures/mock-data';
import { InventoryPage, TransfersPage } from '../pages/inventory.page';
import { RecipesPage, MappingsPage } from '../pages/recipes.page';
import { SalesPage } from '../pages/sales.page';
import { assertPageHandlesDenial } from '../fixtures/denied-helpers';

const API = 'http://localhost:3001';

function setupItemMocks(page: Page) {
  return Promise.all([
    page.route(`${API}/items`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_ITEMS }),
      });
    }),
    page.route(`${API}/items/categories`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_CATEGORIES }),
      });
    }),
    page.route(`${API}/inventory/stock`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { itemId: 'item-001', restaurantId: 'rest-001', currentQty: 100 },
          { itemId: 'item-002', restaurantId: 'rest-001', currentQty: 50 },
        ]}),
      });
    }),
    page.route(`${API}/recipes`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_RECIPES }),
      });
    }),
    page.route(`${API}/recipes/mappings`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_MENU_ITEM_MAPPINGS }),
      });
    }),
    page.route(`${API}/sales-imports`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    }),
  ]);
}

test.describe('Restaurant Manager workflows', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthState(page, {
      permissions: [
        'ITEMS.READ', 'ITEMS.WRITE',
        'INVENTORY.READ',
        'RECIPE.READ', 'RECIPE.WRITE',
        'SALES.READ', 'SALES.WRITE',
      ],
      fullName: 'Restaurant Manager',
    });
    await setupApiMocks(page, true);
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await seedSupabaseSession(page);
  });

  test('W1 - Items: list', async ({ page }) => {
    await setupItemMocks(page);
    const items = new ItemsPage(page);
    await items.goto();
    const count = await items.getRowCount();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('W2 - Items: create', async ({ page }) => {
    await setupItemMocks(page);
    const items = new ItemsPage(page);
    await items.goto();
    await items.clickCreate();
  });

  test('W3 - Items: edit', async ({ page }) => {
    await setupItemMocks(page);
    const items = new ItemsPage(page);
    await items.goto();
    await items.clickEdit(0);
  });

  test('W4 - Categories: list', async ({ page }) => {
    await setupItemMocks(page);
    const cats = new CategoriesPage(page);
    await cats.goto();
    const count = await cats.getRowCount();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('W5 - Inventory: stock view', async ({ page }) => {
    await setupItemMocks(page);
    const inv = new InventoryPage(page);
    await inv.goto();
    await inv.switchToLiveStock();
  });

  test('W6 - Inventory: ledger view', async ({ page }) => {
    await setupItemMocks(page);
    const inv = new InventoryPage(page);
    await inv.goto();
    await inv.switchToTransactionLedger();
  });

  test('W7 - Inventory: transfers view', async ({ page }) => {
    await setupItemMocks(page);
    const transfers = new TransfersPage(page);
    await transfers.goto();
  });

  test('W8 - Recipes: list', async ({ page }) => {
    await setupItemMocks(page);
    const recipes = new RecipesPage(page);
    await recipes.goto();
    const count = await recipes.getRowCount();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('W9 - Recipes: create', async ({ page }) => {
    await setupItemMocks(page);
    const recipes = new RecipesPage(page);
    await recipes.goto();
    await recipes.clickCreate();
  });

  test('W10 - Recipes: mappings list', async ({ page }) => {
    await setupItemMocks(page);
    const mappings = new MappingsPage(page);
    await mappings.goto();
  });

  test('W11 - Sales: import list', async ({ page }) => {
    await setupItemMocks(page);
    const sales = new SalesPage(page);
    await sales.goto();
  });

  test('W12 - Sales: upload file', async ({ page }) => {
    await setupItemMocks(page);
    const sales = new SalesPage(page);
    await sales.goto();
    await sales.clickUpload();
  });

  test.describe('Denied pages', () => {
    const deniedUrls = [
      '/dashboard',
      '/procurement/vendors',
      '/procurement/orders',
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
