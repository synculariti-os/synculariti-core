import { test, expect } from '@playwright/test';

test.describe('Insights page — variance waterfall & tunnel', () => {

  async function login(page: any) {
    await page.goto('/ims/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 15000 });
    await page.getByPlaceholder('name@example.com').fill('nikshanbhag@gmail.com');
    await page.getByPlaceholder('••••••••').fill('Demo123!');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Select a restaurant')).toBeVisible({ timeout: 15000 });
    const restaurantButtons = page.getByRole('button').filter({ hasText: /Main|Restaurant/ });
    await restaurantButtons.first().click();
    await expect(page).toHaveURL(/\/ims\/dashboard/, { timeout: 10000 });
  }

  test('insights page renders waterfall and tunnel sections', async ({ page }) => {
    await login(page);

    // Navigate to Insights via the dashboard Modules section
    await page.getByRole('link', { name: /Insights/ }).click();
    await expect(page).toHaveURL(/\/ims\/insights/, { timeout: 10000 });

    // Page header should be visible
    await expect(page.getByRole('heading', { name: 'Insights' })).toBeVisible();
    await expect(page.getByText('Variance waterfall & loss tunnel')).toBeVisible();

    // Waterfall section
    await expect(page.getByText('Variance Waterfall')).toBeVisible();

    // Loss tunnel section
    await expect(page.getByText('Loss Tunnel')).toBeVisible();

    // Unit cost derivation section
    await expect(page.getByText('Unit Cost Derivation')).toBeVisible();
  });

  test('kg↔€ toggle is visible and clickable', async ({ page }) => {
    await login(page);

    await page.getByRole('link', { name: /Insights/ }).click();
    await expect(page).toHaveURL(/\/ims\/insights/, { timeout: 10000 });

    // Both toggle buttons should be present
    const eurButton = page.getByRole('button', { name: '€' });
    const kgButton = page.getByRole('button', { name: 'kg' });
    await expect(eurButton).toBeVisible();
    await expect(kgButton).toBeVisible();

    // Click kg toggle
    await kgButton.click();

    // Mode indicator should change
    await expect(page.getByText('in units').first()).toBeVisible();
  });

  test('insights page is navigable directly via URL', async ({ page }) => {
    await login(page);

    await page.goto('/ims/insights');
    await expect(page).toHaveURL(/\/ims\/insights/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Insights' })).toBeVisible();
    await expect(page.getByText('Variance Waterfall')).toBeVisible();
    await expect(page.getByText('Loss Tunnel')).toBeVisible();
  });

});
