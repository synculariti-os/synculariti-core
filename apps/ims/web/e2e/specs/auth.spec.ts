import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import {
  setupApiMocks,
  clearAuthState,
  seedSupabaseSession,
} from '../fixtures/auth-helpers';

test.describe('Authentication Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
    loginPage = new LoginPage(page);
  });

  test('should show login form', async ({ page }) => {
    await setupApiMocks(page, false);
    await loginPage.goto();

    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.continueButton).toBeVisible();
  });

  test('should show restaurant selector after valid login', async ({ page }) => {
    await setupApiMocks(page, false);
    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();

    await loginPage.login('admin@example.com', 'password123');

    await seedSupabaseSession(page);
    await page.waitForTimeout(500);

    await expect(page.getByText('Select a Restaurant')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Downtown Bistro')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Uptown Kitchen')).toBeVisible();
  });

  test('should redirect to admin page after selecting a restaurant', async ({ page }) => {
    await setupApiMocks(page, false);
    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();

    await loginPage.login('admin@example.com', 'password123');

    await seedSupabaseSession(page);
    await page.waitForTimeout(500);

    await expect(page.getByText('Select a Restaurant')).toBeVisible({ timeout: 10000 });

    await page.getByText('Downtown Bistro').click();

    await page.waitForURL(/\/admin\//, { timeout: 15000 });
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await setupApiMocks(page, false);
    await page.route('https://ooljbdretyikzdfoshjv.supabase.co/auth/v1/token*', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Invalid login credentials',
        }),
      });
    });

    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();

    await loginPage.login('admin@example.com', 'wrong-password');

    await expect(page.getByText(/Invalid/i)).toBeVisible({ timeout: 5000 });
  });
});
