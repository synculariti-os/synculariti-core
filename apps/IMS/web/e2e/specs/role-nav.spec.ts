import { test, expect } from '@playwright/test';
import { SidebarPage } from '../pages/sidebar.page';
import { ROLES, type RoleProfile } from '../fixtures/mock-data';
import {
  setupApiMocks,
  seedAuthState,
  seedSupabaseSession,
  seedSupabaseSessionCookie,
  clearAuthState,
} from '../fixtures/auth-helpers';

interface SectionExpectation {
  visible: string[];
  hidden: string[];
  childrenVisible?: Record<string, string[]>;
  childrenHidden?: Record<string, string[]>;
}

const expectations: Record<string, SectionExpectation> = {
  Administrator: {
    visible: ['Dashboard', 'Item Master', 'Inventory', 'Procurement', 'Recipes', 'Sales', 'Reports', 'Admin'],
    hidden: [],
    childrenVisible: {
      Admin: ['Franchise Groups', 'Restaurants', 'Roles', 'Permissions', 'User Assignments', 'Audit Logs'],
    },
  },
  'Restaurant Manager': {
    visible: ['Item Master', 'Inventory', 'Recipes', 'Sales'],
    hidden: ['Dashboard', 'Procurement', 'Reports', 'Admin'],
    childrenVisible: {
      Inventory: ['Stock Levels', 'Transfers', 'Waste', 'Prep Production', 'Ledger'],
    },
    childrenHidden: {
      Inventory: ['Counts'],
    },
  },
  'Inventory Operator': {
    visible: ['Item Master', 'Inventory'],
    hidden: ['Dashboard', 'Procurement', 'Recipes', 'Sales', 'Reports', 'Admin'],
    childrenVisible: {
      Inventory: ['Stock Levels', 'Counts', 'Ledger'],
    },
    childrenHidden: {
      Inventory: ['Transfers', 'Waste', 'Prep Production'],
    },
  },
  'Procurement Specialist': {
    visible: ['Procurement'],
    hidden: ['Dashboard', 'Item Master', 'Inventory', 'Recipes', 'Sales', 'Reports', 'Admin'],
    childrenVisible: {
      Procurement: ['Vendors', 'Purchase Orders'],
    },
  },
  Accountant: {
    visible: ['Dashboard', 'Reports'],
    hidden: ['Item Master', 'Inventory', 'Procurement', 'Recipes', 'Sales', 'Admin'],
    childrenVisible: {
      Reports: ['Variance Analysis', 'Snapshots', 'Par Alerts'],
    },
  },
  'Franchise Manager': {
    visible: ['Procurement'],
    hidden: ['Dashboard', 'Item Master', 'Inventory', 'Recipes', 'Sales', 'Reports', 'Admin'],
    childrenVisible: {
      Procurement: ['Vendors', 'Purchase Orders'],
    },
  },
  Unknown: {
    visible: [],
    hidden: ['Dashboard', 'Item Master', 'Inventory', 'Procurement', 'Recipes', 'Sales', 'Reports', 'Admin'],
  },
};

for (const role of ROLES) {
  test.describe(`Role: ${role.roleName}`, () => {
    const exp = expectations[role.roleName];

    test('correct role badge and nav visibility', async ({ page }) => {
      await clearAuthState(page);

      // Unknown has no permissions → AppShell's loadAuthProfile() would trigger
      // an infinite redirect loop. Seed without restaurantId to prevent this.
      const isUnknown = role.roleName === 'Unknown';
      await seedAuthState(page, {
        permissions: role.permissions,
        fullName: role.fullName,
        restaurantId: isUnknown ? null : undefined,
        restaurantName: isUnknown ? null : undefined,
      });
      await setupApiMocks(page, true);

      if (isUnknown) {
        // Unknown has no __supabase available (no prior page load).
        // Seed session cookie directly so dashboard can use apiClient.
        // The cookie will be read by @supabase/ssr on page load.
        await seedSupabaseSessionCookie(page);
      } else {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        await seedSupabaseSession(page);
      }

      const sidebar = new SidebarPage(page);
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Assert role badge
      await sidebar.assertRoleBadge(role.roleName);

      // Assert visible nav items exist
      for (const name of exp.visible) {
        await sidebar.assertNavItemVisible(name);
      }

      // Assert hidden nav items are completely absent
      for (const name of exp.hidden) {
        await expect(sidebar.navLink(name)).toHaveCount(0);
        await expect(sidebar.sectionButton(name)).toHaveCount(0);
      }

      // Assert visible children in expanded sections
      if (exp.childrenVisible) {
        for (const [section, children] of Object.entries(exp.childrenVisible)) {
          if (exp.hidden.includes(section)) continue;
          if (!isUnknown) await sidebar.expandSection(section);
          for (const child of children) {
            await expect(sidebar.childLink(section, child)).toBeVisible();
          }
        }
      }

      // Assert hidden children are absent
      if (exp.childrenHidden) {
        for (const [section, children] of Object.entries(exp.childrenHidden)) {
          if (exp.hidden.includes(section)) continue;
          if (!isUnknown) await sidebar.expandSection(section);
          for (const child of children) {
            await expect(sidebar.childLink(section, child)).toHaveCount(0);
          }
        }
      }
    });
  });
}
