import { expect, Page } from '@playwright/test';
import { setupApiMocks, seedAuthState, seedSupabaseSessionCookie } from './auth-helpers';

/**
 * Set up auth for the Unknown role (no permissions, no restaurant context).
 * Called once in the `test.beforeEach` of `denied-access.spec.ts`.
 */
export async function setupDeniedAuth(page: Page) {
  await seedAuthState(page, {
    permissions: [],
    fullName: 'Unknown Role User',
    restaurantId: null,
    restaurantName: null,
  });
  await setupApiMocks(page, true);
  await seedSupabaseSessionCookie(page);
}

/**
 * Navigate to `url` and assert the page doesn't crash with an error boundary
 * or 500. Use this for any role's denied URL tests (auth is set up by the
 * spec's own `test.beforeEach`).
 */
export async function assertPageHandlesDenial(page: Page, url: string) {
  const resp = await page.goto(url, { waitUntil: 'networkidle' });
  const text = await page.locator('body').innerText();

  expect(text).not.toContain('Application error');
  expect(text).not.toContain('Internal Server Error');
  expect(text).not.toContain('Something went wrong');
  expect(text).not.toMatch(/[45]00\s*(Error|Internal Server Error)/i);

  return resp;
}
