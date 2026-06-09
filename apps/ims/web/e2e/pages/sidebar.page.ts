import { Page, Locator, expect } from '@playwright/test';

export class SidebarPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly nav: Locator;
  readonly restaurantName: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('aside');
    this.nav = this.sidebar.locator('nav');
    this.restaurantName = page.locator('aside nav + div span.font-medium');
  }

  get roleBadge() {
    return this.sidebar.locator('[class*="shrink-0"] + [class*="text-"]').first();
  }

  navLink(name: string) {
    return this.nav.getByRole('link', { name, exact: true }).first();
  }

  sectionButton(name: string) {
    return this.nav.locator('button').filter({ hasText: name }).first();
  }

  childLink(parentName: string, childName: string) {
    const parentSection = this.nav.locator('button').filter({ hasText: parentName }).locator('..');
    return parentSection.getByRole('link', { name: childName, exact: true }).first();
  }

  async expandSection(name: string) {
    const btn = this.sectionButton(name);
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await this.page.waitForTimeout(100);
    }
  }

  async expandAllSections() {
    const buttons = this.nav.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      await buttons.nth(i).click();
    }
    await this.page.waitForTimeout(200);
  }

  async clickNavItem(name: string) {
    const link = this.nav.getByRole('link', { name, exact: true }).first();
    const visible = await link.isVisible().catch(() => false);
    if (!visible) {
      await this.expandAllSections();
    }
    await link.click();
  }

  async assertRoleBadge(expected: string) {
    await expect(this.roleBadge).toHaveText(expected);
  }

  async assertNavItemVisible(name: string) {
    if (await this.nav.getByRole('link', { name, exact: true }).first().isVisible().catch(() => false)) {
      await expect(this.navLink(name)).toBeVisible();
    } else {
      await expect(this.sectionButton(name)).toBeVisible();
    }
  }

  async assertNavItemHidden(name: string) {
    await expect(this.navLink(name)).not.toBeVisible();
    await expect(this.sectionButton(name)).not.toBeVisible();
  }
}
