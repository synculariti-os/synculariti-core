export const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

export const MOCK_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiZXhwIjoxODExODg4MTkyLCJpYXQiOjE3ODAzNTIxOTJ9.dGVzdC1zaWduYXR1cmU';
export const MOCK_REFRESH_TOKEN = 'mock-supabase-refresh-token';

// ──────────────────────────────────────────────
// 0. Tenant Agent — Franchise Groups & Restaurants
// ──────────────────────────────────────────────

export const MOCK_FRANCHISE_GROUPS = [
  { id: 'fg-001', name: 'East Coast Group', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

export const MOCK_RESTAURANTS = [
  {
    id: 'rest-001',
    name: 'Downtown Bistro',
    franchiseGroupId: 'fg-001',
    timezone: 'America/New_York',
    address: '123 Main St',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'rest-002',
    name: 'Uptown Kitchen',
    franchiseGroupId: 'fg-001',
    timezone: 'America/New_York',
    address: '456 Park Ave',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// ──────────────────────────────────────────────
// 1. Auth Agent — Users, Roles, Permissions
// ──────────────────────────────────────────────

export const MOCK_USERS = [
  { id: 'user-001', email: 'admin@example.com', fullName: 'Admin User', active: true, lastLoginAt: '2025-06-01T08:00:00Z', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-06-01T08:00:00Z' },
  { id: 'user-002', email: 'manager@example.com', fullName: 'Restaurant Manager', active: true, lastLoginAt: '2025-06-01T09:00:00Z', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-06-01T09:00:00Z' },
  { id: 'user-003', email: 'inventory@example.com', fullName: 'Inventory Operator', active: true, lastLoginAt: null, createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z' },
  { id: 'user-004', email: 'procurement@example.com', fullName: 'Procurement Specialist', active: true, lastLoginAt: '2025-05-28T14:00:00Z', createdAt: '2025-02-15T00:00:00Z', updatedAt: '2025-05-28T14:00:00Z' },
  { id: 'user-005', email: 'accountant@example.com', fullName: 'Accountant', active: true, lastLoginAt: null, createdAt: '2025-03-01T00:00:00Z', updatedAt: '2025-03-01T00:00:00Z' },
  { id: 'user-006', email: 'franchise@example.com', fullName: 'Franchise Manager', active: true, lastLoginAt: null, createdAt: '2025-03-15T00:00:00Z', updatedAt: '2025-03-15T00:00:00Z' },
  { id: 'user-007', email: 'unknown@example.com', fullName: 'Unknown Role User', active: true, lastLoginAt: null, createdAt: '2025-04-01T00:00:00Z', updatedAt: '2025-04-01T00:00:00Z' },
];

export const MOCK_ROLES = [
  { id: 'role-001', name: 'Administrator', description: 'Full system access', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'role-002', name: 'Restaurant Manager', description: 'Day-to-day restaurant operations', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'role-003', name: 'Inventory Operator', description: 'Stock counts and ledger views', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'role-004', name: 'Procurement Specialist', description: 'Vendor and PO management', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'role-005', name: 'Accountant', description: 'Reports and user admin', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'role-006', name: 'Franchise Manager', description: 'Cross-restaurant procurement view', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'role-007', name: 'Unknown', description: 'No assigned permissions', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

export const MOCK_PERMISSIONS = [
  { id: 'perm-001', code: 'INVENTORY.READ', description: 'View inventory stock levels and ledger' },
  { id: 'perm-002', code: 'INVENTORY.WRITE', description: 'Modify inventory (overrides, adjustments)' },
  { id: 'perm-003', code: 'INVENTORY.COUNT', description: 'Perform physical inventory counts' },
  { id: 'perm-004', code: 'PROCUREMENT.READ', description: 'View purchase orders and vendors' },
  { id: 'perm-005', code: 'PROCUREMENT.WRITE', description: 'Create and manage purchase orders' },
  { id: 'perm-006', code: 'RECIPE.READ', description: 'View recipes and BOMs' },
  { id: 'perm-007', code: 'RECIPE.WRITE', description: 'Create and modify recipes' },
  { id: 'perm-008', code: 'SALES.IMPORT', description: 'Upload and process sales files' },
  { id: 'perm-009', code: 'SALES.READ', description: 'View sales import history' },
  { id: 'perm-010', code: 'REPORTING.READ', description: 'View reports and analytics' },
  { id: 'perm-011', code: 'ADMIN.USERS', description: 'Manage user accounts' },
  { id: 'perm-012', code: 'ADMIN.ROLES', description: 'Manage roles and permissions' },
  { id: 'perm-013', code: 'ADMIN.TENANTS', description: 'Manage franchise groups and restaurants' },
];

export const MOCK_ROLE_PERMISSIONS = [
  // Administrator → all permissions
  { roleId: 'role-001', permissionId: 'perm-001' },
  { roleId: 'role-001', permissionId: 'perm-002' },
  { roleId: 'role-001', permissionId: 'perm-003' },
  { roleId: 'role-001', permissionId: 'perm-004' },
  { roleId: 'role-001', permissionId: 'perm-005' },
  { roleId: 'role-001', permissionId: 'perm-006' },
  { roleId: 'role-001', permissionId: 'perm-007' },
  { roleId: 'role-001', permissionId: 'perm-008' },
  { roleId: 'role-001', permissionId: 'perm-009' },
  { roleId: 'role-001', permissionId: 'perm-010' },
  { roleId: 'role-001', permissionId: 'perm-011' },
  { roleId: 'role-001', permissionId: 'perm-012' },
  { roleId: 'role-001', permissionId: 'perm-013' },
  // Restaurant Manager
  { roleId: 'role-002', permissionId: 'perm-005' },
  { roleId: 'role-002', permissionId: 'perm-008' },
  { roleId: 'role-002', permissionId: 'perm-001' },
  { roleId: 'role-002', permissionId: 'perm-002' },
  { roleId: 'role-002', permissionId: 'perm-006' },
  // Inventory Operator
  { roleId: 'role-003', permissionId: 'perm-001' },
  { roleId: 'role-003', permissionId: 'perm-003' },
  // Procurement Specialist
  { roleId: 'role-004', permissionId: 'perm-004' },
  { roleId: 'role-004', permissionId: 'perm-005' },
  // Accountant
  { roleId: 'role-005', permissionId: 'perm-010' },
  { roleId: 'role-005', permissionId: 'perm-011' },
  // Franchise Manager
  { roleId: 'role-006', permissionId: 'perm-004' },
  // Unknown → none
];

export const MOCK_USER_RESTAURANT_ROLES = [
  { userId: 'user-001', restaurantId: 'rest-001', roleId: 'role-001' },
  { userId: 'user-002', restaurantId: 'rest-001', roleId: 'role-002' },
  { userId: 'user-003', restaurantId: 'rest-001', roleId: 'role-003' },
  { userId: 'user-004', restaurantId: 'rest-001', roleId: 'role-004' },
  { userId: 'user-005', restaurantId: 'rest-001', roleId: 'role-005' },
  { userId: 'user-006', restaurantId: 'rest-001', roleId: 'role-006' },
  { userId: 'user-007', restaurantId: 'rest-001', roleId: 'role-007' },
];

// ──────────────────────────────────────────────
// Auth Profile (JWT-enriched context)
// ──────────────────────────────────────────────

export const MOCK_AUTH_PROFILE = {
  sub: MOCK_USER_ID,
  email: 'admin@example.com',
  restaurantId: 'rest-001',
  franchiseGroupId: 'fg-001',
  permissions: [
    'INVENTORY.READ',
    'INVENTORY.WRITE',
    'INVENTORY.COUNT',
    'PROCUREMENT.READ',
    'PROCUREMENT.WRITE',
    'RECIPE.READ',
    'RECIPE.WRITE',
    'SALES.IMPORT',
    'REPORTING.READ',
    'ADMIN.TENANTS',
    'ADMIN.ROLES',
    'ADMIN.USERS',
  ],
  fullName: 'Admin User',
};

// ──────────────────────────────────────────────
// 2. Item Master Agent — Categories, Items, UOM, Overrides
// ──────────────────────────────────────────────

export const MOCK_CATEGORIES = [
  { id: 'cat-001', franchiseGroupId: 'fg-001', restaurantId: null, name: 'Vegetables', description: 'Fresh vegetables', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'cat-002', franchiseGroupId: 'fg-001', restaurantId: null, name: 'Proteins', description: 'Meat, poultry, fish', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'cat-003', franchiseGroupId: 'fg-001', restaurantId: null, name: 'Prepared Items', description: 'Finished prep items', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'cat-004', franchiseGroupId: 'fg-001', restaurantId: null, name: 'Dairy & Chilled', description: 'Dairy products', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

export const MOCK_ITEMS = [
  { id: 'item-001', name: 'Tomato', sku: 'VEG-001', categoryId: 'cat-001', type: 'INGREDIENTS', purchasingUom: 'kg', inventoryUom: 'kg', recipeUom: 'kg', invToRecipeRatio: 1, isActive: true, franchiseGroupId: 'fg-001', restaurantId: null, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'item-002', name: 'Onion', sku: 'VEG-002', categoryId: 'cat-001', type: 'INGREDIENTS', purchasingUom: 'kg', inventoryUom: 'kg', recipeUom: 'kg', invToRecipeRatio: 1, isActive: true, franchiseGroupId: 'fg-001', restaurantId: null, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'item-003', name: 'Chicken Breast', sku: 'PRO-001', categoryId: 'cat-002', type: 'INGREDIENTS', purchasingUom: 'kg', inventoryUom: 'kg', recipeUom: 'kg', invToRecipeRatio: 1, isActive: true, franchiseGroupId: 'fg-001', restaurantId: null, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'item-004', name: 'Diced Tomatoes', sku: 'PREP-001', categoryId: 'cat-003', type: 'INGREDIENTS', purchasingUom: 'kg', inventoryUom: 'kg', recipeUom: 'kg', invToRecipeRatio: 1, isActive: true, franchiseGroupId: 'fg-001', restaurantId: null, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'item-005', name: 'Tomato Soup Base', sku: 'PREP-002', categoryId: 'cat-003', type: 'INGREDIENTS', purchasingUom: 'kg', inventoryUom: 'kg', recipeUom: 'kg', invToRecipeRatio: 1, isActive: true, franchiseGroupId: 'fg-001', restaurantId: null, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'item-006', name: 'Butter', sku: 'DAY-001', categoryId: 'cat-004', type: 'INGREDIENTS', purchasingUom: 'kg', inventoryUom: 'kg', recipeUom: 'kg', invToRecipeRatio: 1, isActive: true, franchiseGroupId: 'fg-001', restaurantId: null, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

export const MOCK_UOM_CONVERSIONS = [
  { id: 'uom-001', itemId: 'item-001', fromUom: 'kg', toUom: 'g', multiplierFactor: 1000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'uom-002', itemId: 'item-002', fromUom: 'kg', toUom: 'g', multiplierFactor: 1000, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

export const MOCK_ITEM_RESTAURANT_OVERRIDES = [
  { id: 'override-001', itemId: 'item-001', restaurantId: 'rest-001', parLevel: 100, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'override-002', itemId: 'item-003', restaurantId: 'rest-001', parLevel: 40, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'override-003', itemId: 'item-001', restaurantId: 'rest-002', parLevel: 80, isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

// ──────────────────────────────────────────────
// 3. Procurement Agent — Vendors, POs, Batches
// ──────────────────────────────────────────────

export const MOCK_VENDORS = [
  { id: 'vendor-001', franchiseGroupId: 'fg-001', restaurantId: null, name: 'Fresh Produce Co.', contactEmail: 'orders@freshproduce.example.com', isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'vendor-002', franchiseGroupId: 'fg-001', restaurantId: null, name: 'Meat Supply Inc.', contactEmail: 'sales@meatsupply.example.com', isActive: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'vendor-003', franchiseGroupId: 'fg-001', restaurantId: 'rest-001', name: 'Local Dairy', contactEmail: null, isActive: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-03-01T00:00:00Z' },
];

export const MOCK_PURCHASE_ORDERS = [
  { id: 'po-001', restaurantId: 'rest-001', vendorId: 'vendor-001', status: 'DRAFT', orderDate: '2025-06-10T08:00:00Z', expectedDeliveryDate: '2025-06-15T00:00:00Z', freightCharge: 0, taxAmount: 0, discountAmount: 0, createdAt: '2025-06-10T08:00:00Z', updatedAt: '2025-06-10T08:00:00Z' },
  { id: 'po-002', restaurantId: 'rest-001', vendorId: 'vendor-002', status: 'SUBMITTED', orderDate: '2025-06-08T09:00:00Z', expectedDeliveryDate: '2025-06-12T00:00:00Z', freightCharge: 25, taxAmount: 12.50, discountAmount: 0, createdAt: '2025-06-08T09:00:00Z', updatedAt: '2025-06-08T09:30:00Z' },
  { id: 'po-003', restaurantId: 'rest-001', vendorId: 'vendor-001', status: 'RECEIVED', orderDate: '2025-06-01T07:00:00Z', expectedDeliveryDate: '2025-06-03T00:00:00Z', freightCharge: 0, taxAmount: 0, discountAmount: 5, createdAt: '2025-06-01T07:00:00Z', updatedAt: '2025-06-03T14:00:00Z' },
  { id: 'po-004', restaurantId: 'rest-001', vendorId: 'vendor-002', status: 'CANCELLED', orderDate: '2025-05-20T10:00:00Z', expectedDeliveryDate: null, freightCharge: 0, taxAmount: 0, discountAmount: 0, createdAt: '2025-05-20T10:00:00Z', updatedAt: '2025-05-21T08:00:00Z' },
];

export const MOCK_PO_LINE_ITEMS = [
  { id: 'poli-001', poId: 'po-001', itemId: 'item-001', quantityOrdered: 50, quantityReceived: 0, rawUnitPrice: 2.50, createdAt: '2025-06-10T08:00:00Z' },
  { id: 'poli-002', poId: 'po-001', itemId: 'item-002', quantityOrdered: 30, quantityReceived: 0, rawUnitPrice: 1.20, createdAt: '2025-06-10T08:00:00Z' },
  { id: 'poli-003', poId: 'po-002', itemId: 'item-003', quantityOrdered: 20, quantityReceived: 0, rawUnitPrice: 8.00, createdAt: '2025-06-08T09:00:00Z' },
  { id: 'poli-004', poId: 'po-003', itemId: 'item-001', quantityOrdered: 30, quantityReceived: 30, rawUnitPrice: 2.40, createdAt: '2025-06-01T07:00:00Z' },
  { id: 'poli-005', poId: 'po-003', itemId: 'item-002', quantityOrdered: 25, quantityReceived: 25, rawUnitPrice: 1.15, createdAt: '2025-06-01T07:00:00Z' },
  { id: 'poli-006', poId: 'po-004', itemId: 'item-006', quantityOrdered: 10, quantityReceived: 0, rawUnitPrice: 5.00, createdAt: '2025-05-20T10:00:00Z' },
];

export const MOCK_INVENTORY_BATCHES = [
  { id: 'batch-001', restaurantId: 'rest-001', itemId: 'item-001', poId: 'po-003', receivedDate: '2025-06-03T14:00:00Z', initialQty: 30, remainingQty: 28, landedUnitCost: 2.50, createdAt: '2025-06-03T14:00:00Z', updatedAt: '2025-06-03T14:00:00Z' },
  { id: 'batch-002', restaurantId: 'rest-001', itemId: 'item-002', poId: 'po-003', receivedDate: '2025-06-03T14:00:00Z', initialQty: 25, remainingQty: 24, landedUnitCost: 1.20, createdAt: '2025-06-03T14:00:00Z', updatedAt: '2025-06-03T14:00:00Z' },
];

// ──────────────────────────────────────────────
// 4. Recipe / BOM Agent
// ──────────────────────────────────────────────

export const MOCK_RECIPES = [
  { id: 'recipe-001', franchiseGroupId: 'fg-001', restaurantId: null, producesItemId: 'item-004', recipeName: 'Diced Tomatoes', yieldQuantity: 1, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'recipe-002', franchiseGroupId: 'fg-001', restaurantId: null, producesItemId: 'item-005', recipeName: 'Tomato Soup Base', yieldQuantity: 1, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];

export const MOCK_RECIPE_INGREDIENTS = [
  { id: 'ri-001', recipeId: 'recipe-001', ingredientItemId: 'item-001', subRecipeId: null, quantityRequired: 1, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'ri-002', recipeId: 'recipe-002', ingredientItemId: 'item-001', subRecipeId: null, quantityRequired: 0.5, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'ri-003', recipeId: 'recipe-002', ingredientItemId: 'item-002', subRecipeId: null, quantityRequired: 0.3, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'ri-004', recipeId: 'recipe-002', ingredientItemId: 'item-006', subRecipeId: null, quantityRequired: 0.1, createdAt: '2025-01-01T00:00:00Z' },
];

export const MOCK_MENU_ITEM_MAPPINGS = [
  { id: 'mim-001', restaurantId: 'rest-001', rawExcelString: 'Tomato Soup', recipeId: 'recipe-002', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
  { id: 'mim-002', restaurantId: 'rest-001', rawExcelString: 'Diced Tom', recipeId: 'recipe-001', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
  { id: 'mim-003', restaurantId: 'rest-002', rawExcelString: 'Tomato Soup', recipeId: 'recipe-002', createdAt: '2025-01-20T00:00:00Z', updatedAt: '2025-01-20T00:00:00Z' },
];

// ──────────────────────────────────────────────
// 5. Inventory Operations Agent — Ledger, Transfers, Counts, Waste, Prep
// ──────────────────────────────────────────────

export const MOCK_LEDGER_ENTRIES = [
  { id: 'ledger-001', restaurantId: 'rest-001', itemId: 'item-001', changeAmount: 50, reasonCode: 'PO_RECEIPT', referenceId: 'po-003', createdAt: '2025-06-01T10:00:00Z' },
  { id: 'ledger-002', restaurantId: 'rest-001', itemId: 'item-002', changeAmount: -5, reasonCode: 'SALES_DEPLETION', referenceId: null, createdAt: '2025-06-01T11:00:00Z' },
  { id: 'ledger-003', restaurantId: 'rest-001', itemId: 'item-001', changeAmount: -2, reasonCode: 'WASTE', referenceId: 'waste-001', createdAt: '2025-06-02T08:00:00Z' },
  { id: 'ledger-004', restaurantId: 'rest-001', itemId: 'item-001', changeAmount: -10, reasonCode: 'TRANSFER_OUT', referenceId: 'transfer-002', createdAt: '2025-06-03T09:00:00Z' },
  { id: 'ledger-005', restaurantId: 'rest-002', itemId: 'item-001', changeAmount: 10, reasonCode: 'TRANSFER_IN', referenceId: 'transfer-002', createdAt: '2025-06-03T09:00:00Z' },
  { id: 'ledger-006', restaurantId: 'rest-001', itemId: 'item-001', changeAmount: 2, reasonCode: 'COUNT_ADJUSTMENT', referenceId: 'count-batch-002', createdAt: '2025-06-04T16:00:00Z' },
  { id: 'ledger-007', restaurantId: 'rest-001', itemId: 'item-004', changeAmount: 10, reasonCode: 'PREP_PRODUCTION', referenceId: 'prep-001', createdAt: '2025-06-05T06:00:00Z' },
  { id: 'ledger-008', restaurantId: 'rest-001', itemId: 'item-001', changeAmount: -10, reasonCode: 'SALES_DEPLETION', referenceId: null, createdAt: '2025-06-05T12:00:00Z' },
];

export const MOCK_INVENTORY_TRANSFERS = [
  { id: 'transfer-001', franchiseGroupId: 'fg-001', originRestaurantId: 'rest-001', destinationRestaurantId: 'rest-002', itemId: 'item-002', qty: 5, status: 'PENDING', createdAt: '2025-06-10T08:00:00Z', updatedAt: '2025-06-10T08:00:00Z' },
  { id: 'transfer-002', franchiseGroupId: 'fg-001', originRestaurantId: 'rest-001', destinationRestaurantId: 'rest-002', itemId: 'item-001', qty: 10, status: 'COMPLETED', createdAt: '2025-06-03T08:00:00Z', updatedAt: '2025-06-03T09:00:00Z' },
];

export const MOCK_INVENTORY_COUNT_BATCHES = [
  { id: 'count-batch-001', restaurantId: 'rest-001', status: 'OPEN', snapshotTimestamp: '2025-06-10T06:00:00Z', version: 1, createdAt: '2025-06-10T06:00:00Z', updatedAt: '2025-06-10T06:00:00Z' },
  { id: 'count-batch-002', restaurantId: 'rest-001', status: 'CLOSED', snapshotTimestamp: '2025-06-04T06:00:00Z', version: 1, createdAt: '2025-06-04T06:00:00Z', updatedAt: '2025-06-04T16:00:00Z' },
];

export const MOCK_INVENTORY_COUNT_ROWS = [
  { id: 'count-row-001', batchId: 'count-batch-001', itemId: 'item-001', expectedQty: 50, actualQty: null, varianceQty: null, createdAt: '2025-06-10T06:00:00Z', updatedAt: '2025-06-10T06:00:00Z' },
  { id: 'count-row-002', batchId: 'count-batch-001', itemId: 'item-002', expectedQty: 30, actualQty: null, varianceQty: null, createdAt: '2025-06-10T06:00:00Z', updatedAt: '2025-06-10T06:00:00Z' },
  { id: 'count-row-003', batchId: 'count-batch-002', itemId: 'item-001', expectedQty: 48, actualQty: 50, varianceQty: 2, createdAt: '2025-06-04T06:00:00Z', updatedAt: '2025-06-04T16:00:00Z' },
  { id: 'count-row-004', batchId: 'count-batch-002', itemId: 'item-002', expectedQty: 29, actualQty: 29, varianceQty: 0, createdAt: '2025-06-04T06:00:00Z', updatedAt: '2025-06-04T16:00:00Z' },
];

export const MOCK_WASTE_LOGS = [
  { id: 'waste-001', restaurantId: 'rest-001', itemId: 'item-001', quantity: 2, reason: 'Spoiled - bruised tomatoes', recordedAt: '2025-06-02T08:00:00Z', createdAt: '2025-06-02T08:00:00Z' },
];

export const MOCK_PREP_PRODUCTION_LOGS = [
  { id: 'prep-001', restaurantId: 'rest-001', prepItemId: 'item-004', yieldQtyProduced: 10, producedAt: '2025-06-05T06:00:00Z', createdAt: '2025-06-05T06:00:00Z' },
];

// ──────────────────────────────────────────────
// 6. Sales Ingestion Agent
// ──────────────────────────────────────────────

export const MOCK_SALES_IMPORT_BATCHES = [
  { id: 'sales-batch-001', restaurantId: 'rest-001', businessDate: '2025-06-05', status: 'COMPLETED', errorMessage: null, createdAt: '2025-06-05T18:00:00Z', updatedAt: '2025-06-05T18:05:00Z' },
  { id: 'sales-batch-002', restaurantId: 'rest-001', businessDate: '2025-06-06', status: 'PENDING', errorMessage: null, createdAt: '2025-06-06T18:00:00Z', updatedAt: '2025-06-06T18:00:00Z' },
  { id: 'sales-batch-003', restaurantId: 'rest-001', businessDate: '2025-06-03', status: 'FAILED', errorMessage: 'Invalid file format: unrecognized columns', createdAt: '2025-06-03T18:00:00Z', updatedAt: '2025-06-03T18:01:00Z' },
];

export const MOCK_SALES_IMPORT_ROWS = [
  { id: 'sales-row-001', batchId: 'sales-batch-001', rawItemName: 'Tomato Soup', quantitySold: 15, isMapped: true, createdAt: '2025-06-05T18:00:00Z' },
  { id: 'sales-row-002', batchId: 'sales-batch-001', rawItemName: 'Diced Tom', quantitySold: 8, isMapped: true, createdAt: '2025-06-05T18:00:00Z' },
  { id: 'sales-row-003', batchId: 'sales-batch-002', rawItemName: 'Unknown Item', quantitySold: 3, isMapped: false, createdAt: '2025-06-06T18:00:00Z' },
  { id: 'sales-row-004', batchId: 'sales-batch-002', rawItemName: 'Tomato Soup', quantitySold: 5, isMapped: false, createdAt: '2025-06-06T18:00:00Z' },
];

// ──────────────────────────────────────────────
// 7. Reporting Agent — Snapshots
// ──────────────────────────────────────────────

export const MOCK_DAILY_INVENTORY_SNAPSHOTS = [
  { id: 'snapshot-001', restaurantId: 'rest-001', itemId: 'item-001', businessDate: '2025-06-15', eodQty: 45, fifoTotalValue: 112.50, createdAt: '2025-06-15T23:59:00Z' },
  { id: 'snapshot-002', restaurantId: 'rest-001', itemId: 'item-002', businessDate: '2025-06-15', eodQty: 28, fifoTotalValue: 33.60, createdAt: '2025-06-15T23:59:00Z' },
  { id: 'snapshot-003', restaurantId: 'rest-001', itemId: 'item-003', businessDate: '2025-06-15', eodQty: 20, fifoTotalValue: 160.00, createdAt: '2025-06-15T23:59:00Z' },
];

// ──────────────────────────────────────────────
// 8. Audit Agent
// ──────────────────────────────────────────────

export const MOCK_AUDIT_LOG = [
  { id: 'audit-001', userId: 'user-001', userEmail: 'admin@example.com', action: 'CREATE', entityType: 'purchase_order', entityId: 'po-001', oldValue: null, newValue: { status: 'DRAFT', vendorId: 'vendor-001' }, success: true, errorMessage: null, sourceIp: '127.0.0.1', userAgent: 'Mozilla/5.0', restaurantId: 'rest-001', franchiseGroupId: 'fg-001', createdAt: '2025-06-10T08:00:00Z' },
  { id: 'audit-002', userId: 'user-002', userEmail: 'manager@example.com', action: 'UPDATE', entityType: 'item', entityId: 'item-001', oldValue: { parLevel: 100 }, newValue: { parLevel: 120 }, success: true, errorMessage: null, sourceIp: '127.0.0.1', userAgent: 'Mozilla/5.0', restaurantId: 'rest-001', franchiseGroupId: 'fg-001', createdAt: '2025-06-09T14:00:00Z' },
  { id: 'audit-003', userId: null, userEmail: null, action: 'LOGIN_FAILED', entityType: 'session', entityId: 'unknown@example.com', oldValue: null, newValue: null, success: false, errorMessage: 'Invalid credentials', sourceIp: '192.168.1.100', userAgent: 'curl/8.0', restaurantId: null, franchiseGroupId: null, createdAt: '2025-06-08T03:15:00Z' },
];

// ──────────────────────────────────────────────
// Computed / Derived Data (no DB table)
// ──────────────────────────────────────────────

export const MOCK_STOCK_LEVELS = [
  { itemId: 'item-001', itemName: 'Tomato', quantity: 50, unit: 'kg', parLevel: 100 },
  { itemId: 'item-002', itemName: 'Onion', quantity: 30, unit: 'kg', parLevel: 80 },
  { itemId: 'item-003', itemName: 'Chicken Breast', quantity: 20, unit: 'kg', parLevel: 40 },
];

// ──────────────────────────────────────────────
// Role Profiles (for role-based test parameterization)
// ──────────────────────────────────────────────

export interface RoleProfile {
  roleName: string;
  permissions: string[];
  fullName: string;
}

export const ROLES: RoleProfile[] = [
  {
    roleName: 'Administrator',
    permissions: [
      'ADMIN.TENANTS',
      'ADMIN.ROLES',
      'ADMIN.USERS',
      'REPORTING.READ',
      'INVENTORY.READ',
      'INVENTORY.WRITE',
      'INVENTORY.COUNT',
      'PROCUREMENT.READ',
      'PROCUREMENT.WRITE',
      'RECIPE.READ',
      'RECIPE.WRITE',
      'SALES.IMPORT',
    ],
    fullName: 'Admin User',
  },
  {
    roleName: 'Restaurant Manager',
    permissions: [
      'PROCUREMENT.WRITE',
      'SALES.IMPORT',
      'INVENTORY.READ',
      'INVENTORY.WRITE',
      'RECIPE.READ',
    ],
    fullName: 'Restaurant Manager',
  },
  {
    roleName: 'Inventory Operator',
    permissions: [
      'INVENTORY.READ',
      'INVENTORY.COUNT',
    ],
    fullName: 'Inventory Operator',
  },
  {
    roleName: 'Procurement Specialist',
    permissions: [
      'PROCUREMENT.READ',
      'PROCUREMENT.WRITE',
    ],
    fullName: 'Procurement Specialist',
  },
  {
    roleName: 'Accountant',
    permissions: [
      'REPORTING.READ',
      'ADMIN.USERS',
    ],
    fullName: 'Accountant',
  },
  {
    roleName: 'Franchise Manager',
    permissions: [
      'PROCUREMENT.READ',
    ],
    fullName: 'Franchise Manager',
  },
  {
    roleName: 'Unknown',
    permissions: [],
    fullName: 'Unknown Role User',
  },
];
