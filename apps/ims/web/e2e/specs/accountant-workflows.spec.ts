import { test, expect, Page } from '@playwright/test';
import {
  setupApiMocks,
  seedAuthState,
  seedSupabaseSession,
} from '../fixtures/auth-helpers';
import { MOCK_LEDGER_ENTRIES, MOCK_AUDIT_LOG } from '../fixtures/mock-data';
import { InventoryPage } from '../pages/inventory.page';
import { VarianceReportPage, SnapshotsPage, ParAlertsPage } from '../pages/reports.page';
import { AuditLogsPage, UserAssignmentsPage } from '../pages/admin.page';
import { assertPageHandlesDenial } from '../fixtures/denied-helpers';

const API = 'http://localhost:3001';

function setupReportMocks(page: Page) {
  return Promise.all([
    page.route(`${API}/reports/variance`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { itemName: 'Tomato', expectedQty: 100, actualQty: 90, variance: -10 },
          { itemName: 'Onion', expectedQty: 80, actualQty: 85, variance: 5 },
        ]}),
      });
    }),
    page.route(`${API}/reports/snapshots`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { date: '2025-06-01', totalItems: 50, totalValue: 2500 },
          { date: '2025-06-02', totalItems: 48, totalValue: 2400 },
        ]}),
      });
    }),
    page.route(`${API}/reports/par-alerts`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { itemName: 'Tomato', currentQty: 10, parLevel: 100 },
          { itemName: 'Chicken Breast', currentQty: 5, parLevel: 40 },
        ]}),
      });
    }),
    page.route(`${API}/admin/audit-logs`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_AUDIT_LOG }),
      });
    }),
    page.route(`${API}/admin/user-restaurant-roles`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [
          { id: 'assgn-001', userId: 'user-001', restaurantId: 'rest-001', roleId: 'role-001' },
        ]}),
      });
    }),
  ]);
}

test.describe('Accountant workflows', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthState(page, {
      permissions: ['REPORTING.READ', 'ADMIN.USERS'],
      fullName: 'Accountant',
    });
    await setupApiMocks(page, true);
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await seedSupabaseSession(page);
  });

  test('W1 - Dashboard loads', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('W2 - Variance Analysis', async ({ page }) => {
    await setupReportMocks(page);
    const variance = new VarianceReportPage(page);
    await variance.goto();
    const count = await variance.getRowCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('W3 - Snapshots', async ({ page }) => {
    await setupReportMocks(page);
    const snapshots = new SnapshotsPage(page);
    await snapshots.goto();
  });

  test('W4 - Par Alerts', async ({ page }) => {
    await setupReportMocks(page);
    const alerts = new ParAlertsPage(page);
    await alerts.goto();
    const count = await alerts.getRowCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('W5 - Audit Logs (direct URL)', async ({ page }) => {
    await setupReportMocks(page);
    const audit = new AuditLogsPage(page);
    await audit.goto();
  });

  test('W6 - User Assignments (direct URL)', async ({ page }) => {
    await setupReportMocks(page);
    const assignments = new UserAssignmentsPage(page);
    await assignments.goto();
  });

  test.describe('Denied pages', () => {
    const deniedUrls = [
      '/items',
      '/items/categories',
      '/inventory',
      '/procurement/vendors',
      '/procurement/orders',
      '/recipes',
      '/recipes/mappings',
      '/sales/import',
      '/admin/franchise-groups',
      '/admin/restaurants',
      '/admin/roles',
      '/admin/permissions',
    ];

    for (const url of deniedUrls) {
      test(`navigating ${url} does not crash`, async ({ page }) => {
        await assertPageHandlesDenial(page, url);
      });
    }
  });
});
