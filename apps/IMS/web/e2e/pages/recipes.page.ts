import { Page, Locator } from '@playwright/test';

export class RecipesPage {
  readonly page: Page;
  readonly table: Locator;
  readonly createButton: Locator;
  readonly uploadButton: Locator;
  readonly downloadTemplateButton: Locator;
  readonly ingredientsTab: Locator;
  readonly mappingsTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.createButton = page.getByRole('button', { name: /create recipe|new recipe/i });
    this.uploadButton = page.getByRole('button', { name: /upload|import csv/i });
    this.downloadTemplateButton = page.getByRole('button', { name: /download template|template/i });
    this.ingredientsTab = page.getByRole('tab', { name: /bill of materials|ingredients/i });
    this.mappingsTab = page.getByRole('tab', { name: /pos mappings|mappings/i });
  }

  async goto() {
    await this.page.goto('/recipes');
    await this.page.waitForLoadState('networkidle');
  }

  async switchToRecipes() {
    await this.ingredientsTab.click();
    await this.page.waitForTimeout(200);
  }

  async switchToMappings() {
    await this.mappingsTab.click();
    await this.page.waitForTimeout(200);
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async clickUpload() {
    await this.uploadButton.click();
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }

  async clickEdit(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /edit/i }).click();
  }

  async clickDelete(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /delete/i }).click();
  }
}

export class MappingsPage {
  readonly page: Page;
  readonly table: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.locator('table');
    this.createButton = page.getByRole('button', { name: /map|create mapping|new mapping/i });
  }

  async goto() {
    await this.page.goto('/recipes/mappings');
    await this.page.waitForLoadState('networkidle');
  }

  async clickCreate() {
    await this.createButton.click();
  }

  async getRowCount() {
    return this.table.locator('tbody tr').count();
  }

  async clickDelete(index: number) {
    await this.table.locator('tbody tr').nth(index).getByRole('button', { name: /delete/i }).click();
  }
}
