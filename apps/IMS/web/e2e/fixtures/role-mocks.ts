import { Page } from '@playwright/test';
import {
  MOCK_ITEMS,
  MOCK_CATEGORIES,
  MOCK_STOCK_LEVELS,
  MOCK_LEDGER_ENTRIES,
  MOCK_VENDORS,
  MOCK_PURCHASE_ORDERS,
  MOCK_RECIPES,
  MOCK_MENU_ITEM_MAPPINGS,
  MOCK_AUDIT_LOG,
  MOCK_INVENTORY_COUNT_BATCHES,
  MOCK_INVENTORY_COUNT_ROWS,
} from './mock-data';

const API = 'http://localhost:3001';

export function setupItemMocks(page: Page) {
  return Promise.all([
    page.route(`${API}/items`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_ITEMS }) }),
    ),
    page.route(`${API}/items/categories`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_CATEGORIES }) }),
    ),
  ]);
}

export function setupInventoryMocks(page: Page) {
  return Promise.all([
    page.route(`${API}/inventory/stock`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_STOCK_LEVELS }) }),
    ),
    page.route(`${API}/inventory/ledger`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_LEDGER_ENTRIES }) }),
    ),
    page.route(`${API}/inventory/counts`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_INVENTORY_COUNT_BATCHES }) }),
    ),
    page.route(`${API}/inventory/counts/*/rows`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_INVENTORY_COUNT_ROWS }) }),
    ),
    page.route(`${API}/inventory/stock/summary`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { totalItems: 3, totalQty: 100, alerts: 2 } }) }),
    ),
  ]);
}

export function setupProcurementMocks(page: Page) {
  return Promise.all([
    page.route(`${API}/procurement/vendors`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_VENDORS }) }),
    ),
    page.route(`${API}/procurement/orders`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_PURCHASE_ORDERS }) }),
    ),
  ]);
}

export function setupRecipeMocks(page: Page) {
  return Promise.all([
    page.route(`${API}/recipes`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_RECIPES }) }),
    ),
    page.route(`${API}/recipes/mappings`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_MENU_ITEM_MAPPINGS }) }),
    ),
  ]);
}

export function setupReportMocks(page: Page) {
  return Promise.all([
    page.route(`${API}/reports/variance`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ itemName: 'Tomato', expectedQty: 100, actualQty: 90, variance: -10 }] }) }),
    ),
    page.route(`${API}/reports/snapshots`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ date: '2025-06-01', totalItems: 50, totalValue: 2500 }] }) }),
    ),
    page.route(`${API}/reports/par-alerts`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ itemName: 'Tomato', currentQty: 10, parLevel: 100 }] }) }),
    ),
  ]);
}

export function setupAdminMocks(page: Page) {
  return Promise.all([
    page.route(`${API}/admin/franchise-groups`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ id: 'fg-001', name: 'East Coast Group' }] }) }),
    ),
    page.route(`${API}/admin/restaurants`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ id: 'rest-001', name: 'Downtown Bistro' }] }) }),
    ),
    page.route(`${API}/admin/roles`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ id: 'role-001', name: 'Administrator' }] }) }),
    ),
    page.route(`${API}/admin/permissions`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ id: 'perm-001', code: 'INVENTORY.READ' }] }) }),
    ),
    page.route(`${API}/admin/user-restaurant-roles`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ id: 'assgn-001', userId: 'user-001', restaurantId: 'rest-001', roleId: 'role-001' }] }) }),
    ),
    page.route(`${API}/admin/audit-logs`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: MOCK_AUDIT_LOG }) }),
    ),
  ]);
}

export function setupSalesMocks(page: Page) {
  return Promise.all([
    page.route(`${API}/sales-imports`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) }),
    ),
  ]);
}

export function setupTenantMocks(page: Page) {
  return Promise.all([
    page.route(`${API}/tenant/restaurants`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) }),
    ),
  ]);
}
