import { test, expect } from '@playwright/test';

test.describe('Landing page shows both workspaces', () => {

  test('landing page shows "Operations" and "Finance" for users with IMS + ET access', async ({ page }) => {
    // Log in via ET login
    await page.goto('/et/login');
    await expect(page.getByText('Synculariti Identity')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Secure enterprise access gatekeeper')).toBeVisible();

    await page.getByPlaceholder('name@company.com').fill('nikshanbhag@gmail.com');
    await page.getByPlaceholder('••••••••').fill('Demo123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should redirect to landing page (has both IMS and ET)
    await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 15000 });

    // Both workspace buttons should be visible
    await expect(page.getByText('Choose a workspace to continue')).toBeVisible();
    await expect(page.getByText('Operations')).toBeVisible();
    await expect(page.getByText('Finance')).toBeVisible();
  });

});
