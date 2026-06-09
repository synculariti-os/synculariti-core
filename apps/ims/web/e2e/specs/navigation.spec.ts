import { test, expect } from '@playwright/test';
import { SidebarPage } from '../pages/sidebar.page';
import {
  setupApiMocks,
  seedAuthState,
  seedSupabaseSession,
  clearAuthState,
} from '../fixtures/auth-helpers';

test.describe('Sidebar Navigation', () => {
  let sidebar: SidebarPage;

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    await seedAuthState(page);
    await setupApiMocks(page, true);

    // Load login page first so __supabase is available for session seed
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await seedSupabaseSession(page);

    sidebar = new SidebarPage(page);
  });

  test('should navigate to Dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await sidebar.clickNavItem('Dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate to Inventory', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await sidebar.clickNavItem('Stock Levels');
    await expect(page).toHaveURL(/\/inventory$/);
  });

  test('should navigate to Purchase Orders', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await sidebar.clickNavItem('Purchase Orders');
    await expect(page).toHaveURL(/\/procurement\/orders/);
  });

  test('should navigate to Vendors', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await sidebar.clickNavItem('Vendors');
    await expect(page).toHaveURL(/\/procurement\/vendors/);
  });

  test('should navigate to Items', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await sidebar.clickNavItem('Items');
    await expect(page).toHaveURL(/\/items$/);
  });

  test('should navigate to Recipes', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await sidebar.clickNavItem('Bill of Materials');
    await expect(page).toHaveURL(/\/recipes$/);
  });

  test('should navigate to Sales Import', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await sidebar.clickNavItem('Import POS');
    await expect(page).toHaveURL(/\/sales\/import/);
  });

  test('should navigate to Reports', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await sidebar.clickNavItem('Variance Analysis');
    await expect(page).toHaveURL(/\/reports\/variance/);
  });

  test('should highlight active link', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    await sidebar.clickNavItem('Stock Levels');
    const activeLink = sidebar.sidebar.getByRole('link', { current: 'page' });
    await expect(activeLink.first()).toBeVisible();
  });
});
