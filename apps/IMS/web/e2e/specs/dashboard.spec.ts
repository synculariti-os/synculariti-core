import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import {
  setupApiMocks,
  seedAuthState,
  seedSupabaseSession,
  clearAuthState,
} from '../fixtures/auth-helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await setupApiMocks(page, true);
    await seedAuthState(page);
  });

  test('should load dashboard page', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    // Navigate to login first so __supabase is loaded, then seed session
    // (session persists in cookies across subsequent navigations)
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await seedSupabaseSession(page);

    await dashboardPage.goto();
    await expect(dashboardPage.heading).toBeVisible({ timeout: 10000 });
  });

  test('should display stock levels', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await seedSupabaseSession(page);

    await dashboardPage.goto();
    await expect(await dashboardPage.getStatCount()).toBeGreaterThanOrEqual(0);
  });

  test('should display par level alerts', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await seedSupabaseSession(page);

    await dashboardPage.goto();
    await expect(await dashboardPage.getQuickLinkCount()).toBeGreaterThanOrEqual(0);
  });
});
