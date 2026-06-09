export interface RoleWorkflows {
  role: string;
  permissions: string[];
  fullName: string;
  email: string;
  workflows: Record<string, string[]>;
  denied: string[];
}

export const ROLE_WORKFLOWS: RoleWorkflows[] = [
  {
    role: 'Administrator',
    permissions: ['INVENTORY.READ', 'INVENTORY.WRITE', 'INVENTORY.COUNT', 'PROCUREMENT.READ', 'PROCUREMENT.WRITE', 'RECIPE.READ', 'RECIPE.WRITE', 'SALES.IMPORT', 'SALES.READ', 'REPORTING.READ', 'ADMIN.TENANTS', 'ADMIN.ROLES', 'ADMIN.USERS'],
    fullName: 'Admin User',
    email: 'admin@example.com',
    workflows: {
      'W1 - Items: list': [
        'go to /items',
        'check that Items is visible',
      ],
      'W2 - Inventory: stock view': [
        'go to /inventory',
        'check that Stock is visible',
      ],
      'W3 - Vendors: list': [
        'go to /procurement/vendors',
      ],
      'W4 - Recipes: list': [
        'go to /recipes',
      ],
      'W5 - Reports: variance': [
        'go to /reports/variance',
      ],
      'W6 - Admin: franchise groups': [
        'go to /admin/franchise-groups',
      ],
      'W7 - Audit logs': [
        'go to /admin/audit-logs',
      ],
    },
    denied: [],
  },
  {
    role: 'Accountant',
    permissions: ['REPORTING.READ', 'ADMIN.USERS'],
    fullName: 'Accountant',
    email: 'accountant@example.com',
    workflows: {
      'W1 - Dashboard loads': [
        'go to /dashboard',
        'check that Dashboard is visible',
      ],
      'W2 - Variance Analysis': [
        'go to /reports/variance',
      ],
      'W3 - Snapshots': [
        'go to /reports/snapshots',
      ],
      'W4 - Par Alerts': [
        'go to /reports/par-alerts',
      ],
      'W5 - Audit Logs': [
        'go to /admin/audit-logs',
      ],
      'W6 - User Assignments': [
        'go to /admin/assignments',
      ],
    },
    denied: [
      '/items',
      '/items/categories',
      '/inventory',
      '/procurement/vendors',
      '/procurement/orders',
      '/recipes',
      '/recipes/mappings',
      '/sales/import',
      '/admin/franchise-groups',
      '/admin/restaurants',
      '/admin/roles',
      '/admin/permissions',
    ],
  },
  {
    role: 'Restaurant Manager',
    permissions: ['PROCUREMENT.WRITE', 'SALES.IMPORT', 'INVENTORY.READ', 'INVENTORY.WRITE', 'RECIPE.READ'],
    fullName: 'Restaurant Manager',
    email: 'manager@example.com',
    workflows: {
      'W1 - Items: list': [
        'go to /items',
      ],
      'W2 - Categories: list': [
        'go to /items/categories',
      ],
      'W3 - Stock view': [
        'go to /inventory',
      ],
      'W4 - Recipes: list': [
        'go to /recipes',
      ],
      'W5 - Sales: import list': [
        'go to /sales/import',
      ],
    },
    denied: [
      '/dashboard',
      '/procurement/vendors',
      '/procurement/orders',
      '/reports/variance',
      '/admin/roles',
    ],
  },
  {
    role: 'Inventory Operator',
    permissions: ['INVENTORY.READ', 'INVENTORY.COUNT'],
    fullName: 'Inventory Operator',
    email: 'inventory@example.com',
    workflows: {
      'W1 - Stock view': [
        'go to /inventory',
      ],
      'W2 - Count batches': [
        'go to /inventory/counts',
      ],
      'W3 - Ledger view': [
        'go to /inventory/ledger',
      ],
    },
    denied: [
      '/inventory/transfers',
      '/inventory/waste',
      '/inventory/prep',
      '/procurement/vendors',
      '/procurement/orders',
      '/recipes',
      '/recipes/mappings',
      '/sales/import',
      '/reports/variance',
      '/admin/roles',
    ],
  },
  {
    role: 'Procurement Specialist',
    permissions: ['PROCUREMENT.READ', 'PROCUREMENT.WRITE'],
    fullName: 'Procurement Specialist',
    email: 'procurement@example.com',
    workflows: {
      'W1 - Vendors: list': [
        'go to /procurement/vendors',
      ],
      'W2 - POs: list': [
        'go to /procurement/orders',
      ],
    },
    denied: [
      '/dashboard',
      '/items',
      '/items/categories',
      '/inventory',
      '/recipes',
      '/recipes/mappings',
      '/sales/import',
      '/reports/variance',
      '/admin/roles',
    ],
  },
  {
    role: 'Franchise Manager',
    permissions: ['PROCUREMENT.READ'],
    fullName: 'Franchise Manager',
    email: 'franchise@example.com',
    workflows: {
      'W1 - Vendors: list': [
        'go to /procurement/vendors',
      ],
      'W2 - POs: list': [
        'go to /procurement/orders',
      ],
    },
    denied: [
      '/dashboard',
      '/items',
      '/items/categories',
      '/inventory',
      '/recipes',
      '/recipes/mappings',
      '/sales/import',
      '/reports/variance',
      '/admin/roles',
    ],
  },
  {
    role: 'Unknown',
    permissions: [],
    fullName: 'Unknown Role User',
    email: 'unknown@example.com',
    workflows: {},
    denied: [
      '/dashboard',
      '/items',
      '/items/categories',
      '/inventory',
      '/inventory/transfers',
      '/inventory/counts',
      '/inventory/waste',
      '/inventory/prep',
      '/inventory/ledger',
      '/procurement/vendors',
      '/procurement/orders',
      '/recipes',
      '/recipes/mappings',
      '/sales/import',
      '/reports/variance',
      '/reports/snapshots',
      '/reports/par-alerts',
      '/admin/franchise-groups',
      '/admin/restaurants',
      '/admin/roles',
      '/admin/permissions',
      '/admin/assignments',
      '/admin/audit-logs',
    ],
  },
];
