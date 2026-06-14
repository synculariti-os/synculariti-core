import { test, expect } from '@playwright/test';

test.describe('Login → Dashboard flow', () => {

  test('user can log in and see the operations dashboard', async ({ page }) => {
    await page.goto('/ims/login');

    // Wait for the SPA to hydrate
    const heading = page.getByRole('heading', { name: /Welcome back/i });
    await expect(heading).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Sign in to Synculariti OS IMS')).toBeVisible();

    // Fill credentials
    await page.getByPlaceholder('name@example.com').fill('nikshanbhag@gmail.com');
    await page.getByPlaceholder('••••••••').fill('Demo123!');
    await page.getByRole('button', { name: 'Continue' }).click();

    // After login → should see restaurant selector
    await expect(page.getByText('Select a restaurant')).toBeVisible({ timeout: 15000 });

    // Click the first restaurant button
    const restaurantButtons = page.getByRole('button').filter({ hasText: /Main|Restaurant/ });
    await restaurantButtons.first().click();

    // Should land on the Ops Dashboard
    await expect(page).toHaveURL(/\/ims\/dashboard/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Operations' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Kitchen command centre')).toBeVisible();

    // Stat cards should render
    await expect(page.getByText('Items')).toBeVisible();
    await expect(page.getByText('Vendors')).toBeVisible();
    await expect(page.getByText('Recipes')).toBeVisible();

    // Alert sections should render
    await expect(page.getByText('PAR Alerts')).toBeVisible();
    await expect(page.getByText('Recent Waste')).toBeVisible();
    await expect(page.getByText('Latest Count Variance')).toBeVisible();

    // Modules section should render
    await expect(page.getByText('Modules')).toBeVisible();
    await expect(page.getByText('Item Master')).toBeVisible();
    await expect(page.getByText('Insights')).toBeVisible();
  });

  test('dashboard links navigate to Insights page', async ({ page }) => {
    await page.goto('/ims/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible({ timeout: 15000 });

    await page.getByPlaceholder('name@example.com').fill('nikshanbhag@gmail.com');
    await page.getByPlaceholder('••••••••').fill('Demo123!');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Select a restaurant')).toBeVisible({ timeout: 15000 });

    const restaurantButtons = page.getByRole('button').filter({ hasText: /Main|Restaurant/ });
    await restaurantButtons.first().click();
    await expect(page).toHaveURL(/\/ims\/dashboard/, { timeout: 10000 });

    // Navigate to Insights via the Modules section
    await page.getByRole('link', { name: /Insights/ }).click();
    await expect(page).toHaveURL(/\/ims\/insights/, { timeout: 10000 });

    // Verify the Insights page header
    await expect(page.getByRole('heading', { name: 'Insights' })).toBeVisible();
    await expect(page.getByText('Variance waterfall & loss tunnel')).toBeVisible();
  });

});
