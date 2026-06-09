import { test } from '@playwright/test';
import { setupDeniedAuth, assertPageHandlesDenial } from '../fixtures/denied-helpers';

const DENIED_URLS = [
  '/dashboard',
  '/items',
  '/items/categories',
  '/inventory',
  '/inventory/transfers',
  '/inventory/counts',
  '/inventory/waste',
  '/inventory/prep',
  '/inventory/ledger',
  '/procurement/vendors',
  '/procurement/orders',
  '/recipes',
  '/recipes/mappings',
  '/sales/import',
  '/reports/variance',
  '/reports/snapshots',
  '/reports/par-alerts',
  '/admin/franchise-groups',
  '/admin/restaurants',
  '/admin/roles',
  '/admin/permissions',
  '/admin/assignments',
  '/admin/audit-logs',
];

test.describe('Unknown role — denied URL access', () => {
  test.beforeEach(async ({ page }) => {
    await setupDeniedAuth(page);
  });

  for (const url of DENIED_URLS) {
    test(`navigating ${url} does not crash`, async ({ page }) => {
      await assertPageHandlesDenial(page, url);
    });
  }
});
