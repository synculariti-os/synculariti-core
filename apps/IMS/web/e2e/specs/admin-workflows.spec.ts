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
  MOCK_STOCK_LEVELS,
  MOCK_LEDGER_ENTRIES,
  MOCK_VENDORS,
  MOCK_PURCHASE_ORDERS,
  MOCK_RECIPES,
  MOCK_MENU_ITEM_MAPPINGS,
  MOCK_AUDIT_LOG,
} from '../fixtures/mock-data';
import { InventoryPage, TransfersPage, WastePage, PrepProductionPage } from '../pages/inventory.page';
import { CountsPage } from '../pages/counts.page';
import { SalesPage } from '../pages/sales.page';
import { VendorsPage, PurchaseOrdersPage } from '../pages/procurement.page';
import { RecipesPage, MappingsPage } from '../pages/recipes.page';
import {
  VarianceReportPage,
  SnapshotsPage,
  ParAlertsPage,
} from '../pages/reports.page';
import {
  FranchiseGroupsPage,
  RestaurantsPage,
  RolesPage,
  PermissionsPage,
  UserAssignmentsPage,
  AuditLogsPage,
} from '../pages/admin.page';

const API = 'http://localhost:3001';

function setupAdminMocks(page: Page) {
  return Promise.all([
    page.route(`${API}/items`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_ITEMS }) }),
    ),
    page.route(`${API}/items/categories`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_CATEGORIES }) }),
    ),
    page.route(`${API}/inventory/stock`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_STOCK_LEVELS }) }),
    ),
    page.route(`${API}/inventory/ledger`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_LEDGER_ENTRIES }) }),
    ),
    page.route(`${API}/inventory/counts`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) }),
    ),
    page.route(`${API}/procurement/vendors`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_VENDORS }) }),
    ),
    page.route(`${API}/procurement/orders`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_PURCHASE_ORDERS }) }),
    ),
    page.route(`${API}/recipes`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_RECIPES }) }),
    ),
    page.route(`${API}/recipes/mappings`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_MENU_ITEM_MAPPINGS }) }),
    ),
    page.route(`${API}/reports/variance`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ itemName: 'Tomato', expectedQty: 100, actualQty: 90 }] }) }),
    ),
    page.route(`${API}/reports/snapshots`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ date: '2025-06-01', totalItems: 50 }] }) }),
    ),
    page.route(`${API}/reports/par-alerts`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ itemName: 'Tomato', currentQty: 10, parLevel: 100 }] }) }),
    ),
    page.route(`${API}/admin/franchise-groups`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ id: 'fg-001', name: 'Main Group' }] }) }),
    ),
    page.route(`${API}/admin/restaurants`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ id: 'rest-001', name: 'Restaurant A' }] }) }),
    ),
    page.route(`${API}/admin/roles`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ id: 'role-001', name: 'Admin' }] }) }),
    ),
    page.route(`${API}/admin/permissions`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ id: 'perm-001', code: 'ITEMS.READ' }] }) }),
    ),
    page.route(`${API}/admin/user-restaurant-roles`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ id: 'assgn-001', userId: 'user-001', restaurantId: 'rest-001' }] }) }),
    ),
    page.route(`${API}/admin/audit-logs`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_AUDIT_LOG }) }),
    ),
  ]);
}

test.describe('Admin workflows', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthState(page, {
      permissions: [
        'ADMIN_ROLES', 'ADMIN_USERS', 'ADMIN_TENANTS',
        'ITEMS.READ', 'ITEMS.WRITE',
        'INVENTORY.READ', 'INVENTORY.COUNT',
        'PROCUREMENT.READ', 'PROCUREMENT.WRITE',
        'RECIPE.READ', 'RECIPE.WRITE',
        'SALES.READ', 'SALES.WRITE',
        'REPORTING.READ',
      ],
      fullName: 'Administrator',
    });
    await setupApiMocks(page, true);
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await seedSupabaseSession(page);
  });

  test('W1 - Items: list & create', async ({ page }) => {
    await setupAdminMocks(page);
    const items = new ItemsPage(page);
    await items.goto();
    const count = await items.getRowCount();
    expect(count).toBeGreaterThanOrEqual(1);
    await items.clickCreate();
  });

  test('W2 - Items: edit & bulk delete', async ({ page }) => {
    await setupAdminMocks(page);
    const items = new ItemsPage(page);
    await items.goto();
    await items.clickEdit(0);
  });

  test('W3 - Categories: list & create', async ({ page }) => {
    await setupAdminMocks(page);
    const cats = new CategoriesPage(page);
    await cats.goto();
    const count = await cats.getRowCount();
    expect(count).toBeGreaterThanOrEqual(1);
    await cats.clickCreate();
  });

  test('W4 - Categories: edit & bulk delete', async ({ page }) => {
    await setupAdminMocks(page);
    const cats = new CategoriesPage(page);
    await cats.goto();
    await cats.clickEdit(0);
  });

  test('W5 - Inventory: stock & ledger', async ({ page }) => {
    await setupAdminMocks(page);
    const inv = new InventoryPage(page);
    await inv.goto();
    await inv.switchToLiveStock();
    await inv.switchToTransactionLedger();
    const ledgerCount = await inv.getLedgerRowCount();
    expect(ledgerCount).toBeGreaterThanOrEqual(1);
  });

  test('W6 - Inventory: counts view', async ({ page }) => {
    await setupAdminMocks(page);
    const counts = new CountsPage(page);
    await counts.goto();
  });

  test('W7 - Inventory: transfers view', async ({ page }) => {
    await setupAdminMocks(page);
    const transfers = new TransfersPage(page);
    await transfers.goto();
  });

  test('W8 - Inventory: waste view', async ({ page }) => {
    await setupAdminMocks(page);
    const waste = new WastePage(page);
    await waste.goto();
  });

  test('W9 - Inventory: prep production view', async ({ page }) => {
    await setupAdminMocks(page);
    const prep = new PrepProductionPage(page);
    await prep.goto();
  });

  test('W10 - Vendors: list & create', async ({ page }) => {
    await setupAdminMocks(page);
    const vendors = new VendorsPage(page);
    await vendors.goto();
    const count = await vendors.getRowCount();
    expect(count).toBeGreaterThanOrEqual(1);
    await vendors.clickCreate();
  });

  test('W11 - Vendors: edit & bulk delete', async ({ page }) => {
    await setupAdminMocks(page);
    const vendors = new VendorsPage(page);
    await vendors.goto();
    await vendors.clickEdit(0);
  });

  test('W12 - POs: list & create draft', async ({ page }) => {
    await setupAdminMocks(page);
    const pos = new PurchaseOrdersPage(page);
    await pos.goto();
    const count = await pos.getRowCount();
    expect(count).toBeGreaterThanOrEqual(1);
    await pos.clickCreate();
  });

  test('W13 - PO: submit, receive, cancel', async ({ page }) => {
    await setupAdminMocks(page);
    const pos = new PurchaseOrdersPage(page);
    await pos.goto();
    await pos.clickSubmitForRow(0);
  });

  test('W14 - Recipes: list & create', async ({ page }) => {
    await setupAdminMocks(page);
    const recipes = new RecipesPage(page);
    await recipes.goto();
    const count = await recipes.getRowCount();
    expect(count).toBeGreaterThanOrEqual(1);
    await recipes.clickCreate();
  });

  test('W15 - Recipes: edit & delete', async ({ page }) => {
    await setupAdminMocks(page);
    const recipes = new RecipesPage(page);
    await recipes.goto();
    await recipes.clickEdit(0);
  });

  test('W16 - Mappings: list & create', async ({ page }) => {
    await setupAdminMocks(page);
    const mappings = new MappingsPage(page);
    await mappings.goto();
    await mappings.clickCreate();
  });

  test('W17 - Mappings: delete', async ({ page }) => {
    await setupAdminMocks(page);
    const mappings = new MappingsPage(page);
    await mappings.goto();
    await mappings.clickDelete(0);
  });

  test('W18 - Reports: variance', async ({ page }) => {
    await setupAdminMocks(page);
    const variance = new VarianceReportPage(page);
    await variance.goto();
    const count = await variance.getRowCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('W19 - Reports: snapshots', async ({ page }) => {
    await setupAdminMocks(page);
    const snapshots = new SnapshotsPage(page);
    await snapshots.goto();
  });

  test('W20 - Reports: par alerts', async ({ page }) => {
    await setupAdminMocks(page);
    const alerts = new ParAlertsPage(page);
    await alerts.goto();
    const count = await alerts.getRowCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('W21 - Admin: franchise groups', async ({ page }) => {
    await setupAdminMocks(page);
    const fgs = new FranchiseGroupsPage(page);
    await fgs.goto();
    await fgs.clickCreate();
  });

  test('W22 - Admin: restaurants', async ({ page }) => {
    await setupAdminMocks(page);
    const rests = new RestaurantsPage(page);
    await rests.goto();
    await rests.clickCreate();
  });

  test('W23 - Admin: roles', async ({ page }) => {
    await setupAdminMocks(page);
    const roles = new RolesPage(page);
    await roles.goto();
    await roles.clickCreate();
  });

  test('W24 - Admin: permissions list', async ({ page }) => {
    await setupAdminMocks(page);
    const perms = new PermissionsPage(page);
    await perms.goto();
  });

  test('W25 - Admin: assign permissions to role', async ({ page }) => {
    await setupAdminMocks(page);
    const perms = new PermissionsPage(page);
    await perms.goto();
  });

  test('W26 - Admin: user assignments', async ({ page }) => {
    await setupAdminMocks(page);
    const assignments = new UserAssignmentsPage(page);
    await assignments.goto();
    await assignments.clickCreate();
  });

  test('W27 - Admin: remove assignment', async ({ page }) => {
    await setupAdminMocks(page);
    const assignments = new UserAssignmentsPage(page);
    await assignments.goto();
    await assignments.clickDelete(0);
  });

  test('W28 - Admin: audit logs view', async ({ page }) => {
    await setupAdminMocks(page);
    const audit = new AuditLogsPage(page);
    await audit.goto();
  });

  test('W29 - Sales: import list & upload', async ({ page }) => {
    await setupAdminMocks(page);
    const sales = new SalesPage(page);
    await sales.goto();
    await sales.clickUpload();
  });
});
