import { test, expect, Page } from '@playwright/test';
import { ROLE_WORKFLOWS } from '../fixtures/role-workflows';
import { parseStep, runStep } from '../fixtures/step-runner';
import {
  setupApiMocks,
  seedAuthState,
  seedSupabaseSession,
  seedSupabaseSessionCookie,
} from '../fixtures/auth-helpers';
import { assertPageHandlesDenial } from '../fixtures/denied-helpers';
import {
  setupItemMocks,
  setupInventoryMocks,
  setupProcurementMocks,
  setupRecipeMocks,
  setupReportMocks,
  setupAdminMocks,
  setupSalesMocks,
  setupTenantMocks,
} from '../fixtures/role-mocks';

const BASE_URL = 'http://localhost:3000';

async function setupAllMocks(page: Page) {
  await Promise.all([
    setupItemMocks(page),
    setupInventoryMocks(page),
    setupProcurementMocks(page),
    setupRecipeMocks(page),
    setupReportMocks(page),
    setupAdminMocks(page),
    setupSalesMocks(page),
    setupTenantMocks(page),
  ]);
}

async function runWorkflowSteps(page: Page, steps: string[]) {
  for (const raw of steps) {
    const step = parseStep(raw);
    const result = await runStep(page, step, { baseUrl: BASE_URL });
    expect(result.passed, `${raw} — ${result.error ?? 'failed'}`).toBeTruthy();
  }
}

for (const cfg of ROLE_WORKFLOWS) {
  const isUnknown = cfg.role === 'Unknown';

  test.describe(`${cfg.role} workflows`, () => {
    test.beforeEach(async ({ page }) => {
      await seedAuthState(page, {
        permissions: cfg.permissions,
        fullName: cfg.fullName,
        ...(isUnknown ? { restaurantId: null, restaurantName: null } : {}),
      });
      await setupApiMocks(page, true);

      if (isUnknown) {
        await seedSupabaseSessionCookie(page);
      } else {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        await seedSupabaseSession(page);
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
      }
    });

    for (const [name, steps] of Object.entries(cfg.workflows)) {
      test(name, async ({ page }) => {
        await setupAllMocks(page);
        await runWorkflowSteps(page, steps);
      });
    }

    if (cfg.denied.length > 0) {
      test.describe('Denied pages', () => {
        for (const url of cfg.denied) {
          test(`navigating ${url} does not crash`, async ({ page }) => {
            await assertPageHandlesDenial(page, url);
          });
        }
      });
    }
  });
}
