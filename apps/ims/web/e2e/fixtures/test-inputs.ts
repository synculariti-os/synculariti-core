/**
 * Test input fixtures for CSV upload, bulk insert, and bulk delete workflows.
 *
 * These are NOT seed data — they represent what a user submits via forms,
 * file uploads, or API calls. CSV strings here are designed to be parsed by
 * the xlsx library (used server-side) and must match the header formats
 * defined in each controller's CSV template endpoint.
 *
 * Usage in tests:
 *   import { ITEMS_CSV, BULK_DELETE_ITEMS, UPLOAD_RESPONSE_SUCCESS } from '../fixtures/test-inputs';
 *   await page.route(`${API}/items/upload`, ...) => fulfill with UPLOAD_RESPONSE_SUCCESS;
 */

// ──────────────────────────────────────────────
// CSV Content Strings
// ──────────────────────────────────────────────
// Each matches the header format from the corresponding
// GET .../upload/template endpoint.

// Items CSV template: name,sku,type,categoryName,purchasingUom,inventoryUom,recipeUom,invToRecipeRatio,isActive
export const ITEMS_CSV_HEADER = 'name,sku,type,categoryName,purchasingUom,inventoryUom,recipeUom,invToRecipeRatio,isActive';
export const ITEMS_CSV_SAMPLE_ROW = 'Sample Item,SMP-001,INGREDIENTS,Produce,lb,lb,,1.0,true';
export const ITEMS_CSV_VALID =
  'name,sku,type,categoryName,purchasingUom,inventoryUom,recipeUom,invToRecipeRatio,isActive\n' +
  'Garlic,GAR-001,INGREDIENTS,Vegetables,kg,kg,kg,1.0,true\n' +
  'Lemon,LEM-001,INGREDIENTS,Vegetables,kg,kg,kg,1.0,true\n' +
  'Chopped Herbs,HER-001,INGREDIENTS,Prepared Items,kg,kg,kg,1.0,true\n';
export const ITEMS_CSV_WITH_ERRORS =
  'name,sku,type,categoryName,purchasingUom,inventoryUom,recipeUom,invToRecipeRatio,isActive\n' +
  'Garlic,GAR-001,INGREDIENTS,Vegetables,kg,kg,kg,1.0,true\n' +
  ',MISSING-NAME,INGREDIENTS,Vegetables,kg,kg,kg,1.0,true\n' +
  'Invalid Type,INV-001,INVALID,Vegetables,kg,kg,kg,1.0,true\n' +
  'No Category,NOC-001,INGREDIENTS,,kg,kg,kg,1.0,true\n';
export const ITEMS_CSV_EMPTY = 'name,sku,type,categoryName,purchasingUom,inventoryUom,recipeUom,invToRecipeRatio,isActive\n';

// Categories CSV template: name,description
export const CATEGORIES_CSV_HEADER = 'name,description';
export const CATEGORIES_CSV_SAMPLE_ROW = 'Produce,Fresh fruits and vegetables';
export const CATEGORIES_CSV_VALID =
  'name,description\n' +
  'Spices,Cooking spices and seasonings\n' +
  'Beverages,Drinks and mixers\n';
export const CATEGORIES_CSV_WITH_ERRORS =
  'name,description\n' +
  'Spices,Cooking spices\n' +
  ',Missing name row\n';

// Recipes CSV template: producesItemSku,producesItemName,categoryName,recipeName,yieldQuantity,priceEur,vatRate,ingredientSku,ingredientName,quantityRequired,uom
export const RECIPES_CSV_HEADER = 'producesItemSku,producesItemName,categoryName,recipeName,yieldQuantity,priceEur,vatRate,ingredientSku,ingredientName,quantityRequired,uom';
export const RECIPES_CSV_SAMPLE_ROW = 'VEG-001,Vegetable Salad,Salads,,1,4.99,19,RAW-100,Tomato,0.5,kg';
export const RECIPES_CSV_VALID =
  'producesItemSku,producesItemName,categoryName,recipeName,yieldQuantity,priceEur,vatRate,ingredientSku,ingredientName,quantityRequired,uom\n' +
  'PREP-001,Garlic Butter,Prepared Items,,1,3.50,19,DAY-001,Butter,0.2,kg\n' +
  'PREP-001,Garlic Butter,Prepared Items,,1,3.50,19,GAR-001,Garlic,0.05,kg\n' +
  'PREP-002,Lemon Juice,Prepared Items,,1,2.00,19,LEM-001,Lemon,0.5,kg\n';
export const RECIPES_CSV_WITH_ERRORS =
  'producesItemSku,producesItemName,categoryName,recipeName,yieldQuantity,priceEur,vatRate,ingredientSku,ingredientName,quantityRequired,uom\n' +
  'PREP-001,Garlic Butter,Prepared Items,,1,3.50,19,DAY-001,Butter,0.2,kg\n' +
  ',,,Solo Recipe,,,,,,,0,\n' +
  ',BAD,Prepared Items,,0,0,19,DAY-001,Butter,0,kg\n';

// Vendors CSV template: name,contactEmail,isActive
export const VENDORS_CSV_HEADER = 'name,contactEmail,isActive';
export const VENDORS_CSV_SAMPLE_ROW = 'Acme Provisions,supplier@acme.com,true';
export const VENDORS_CSV_VALID =
  'name,contactEmail,isActive\n' +
  'Organic Farms,orders@organicfarms.example.com,true\n' +
  'Fish Market,sales@fishmarket.example.com,true\n' +
  'Retired Supplier,,false\n';
export const VENDORS_CSV_WITH_ERRORS =
  'name,contactEmail,isActive\n' +
  'Organic Farms,orders@organicfarms.example.com,true\n' +
  ',,true\n';

// Sales import CSV (no template endpoint — format inferred from usage)
export const SALES_CSV_HEADER = 'rawItemName,quantitySold';
export const SALES_CSV_VALID =
  'rawItemName,quantitySold\n' +
  'Tomato Soup,15\n' +
  'Diced Tom,8\n' +
  'Grilled Chicken,12\n';
export const SALES_CSV_WITH_UNMAPPED =
  'rawItemName,quantitySold\n' +
  'Tomato Soup,15\n' +
  'Unknown Item,3\n';

// Count import CSV (no template endpoint — format from inventory controller export)
export const COUNTS_CSV_HEADER = 'Item Name,Item ID,Expected Qty,Actual Qty';
export const COUNTS_CSV_VALID =
  'Item Name,Item ID,Expected Qty,Actual Qty\n' +
  '"Tomato",item-001,50,48\n' +
  '"Onion",item-002,30,30\n';
export const COUNTS_CSV_PARTIAL =
  'Item Name,Item ID,Expected Qty,Actual Qty\n' +
  '"Tomato",item-001,50,52\n';

// ──────────────────────────────────────────────
// CSV Upload Response Shapes
// ──────────────────────────────────────────────
// The server returns these shapes from POST .../upload endpoints.

export const UPLOAD_RESPONSE_SUCCESS = {
  totalRows: 3,
  createdCount: 3,
  errorCount: 0,
  errors: [],
  created: [
    { row: 2, name: 'Garlic', sku: 'GAR-001' },
    { row: 3, name: 'Lemon', sku: 'LEM-001' },
    { row: 4, name: 'Chopped Herbs', sku: 'HER-001' },
  ],
};

export const UPLOAD_RESPONSE_PARTIAL = {
  totalRows: 4,
  createdCount: 1,
  errorCount: 3,
  errors: [
    { row: 3, item: '', message: 'Missing name' },
    { row: 4, item: 'Invalid Type', message: 'type must be INGREDIENTS, PACKAGING, MERCHANDISE, SUPPLY, or MISCELLANEOUS' },
    { row: 5, item: 'No Category', message: 'Missing categoryName' },
  ],
  created: [
    { row: 2, name: 'Garlic', sku: 'GAR-001' },
  ],
};

export const UPLOAD_RESPONSE_EMPTY = {
  totalRows: 0,
  createdCount: 0,
  errorCount: 0,
  errors: [],
  created: [],
};

export const CATEGORY_UPLOAD_RESPONSE_SUCCESS = {
  totalRows: 2,
  createdCount: 2,
  errorCount: 0,
  errors: [],
  created: [
    { row: 2, name: 'Spices' },
    { row: 3, name: 'Beverages' },
  ],
};

export const VENDOR_UPLOAD_RESPONSE_SUCCESS = {
  totalRows: 3,
  createdCount: 3,
  errorCount: 0,
  errors: [],
};

export const RECIPE_UPLOAD_RESPONSE_SUCCESS = {
  totalRows: 3,
  createdCount: 2,
  skippedCount: 0,
  errorCount: 0,
  errors: [],
};

export const RECIPE_UPLOAD_RESPONSE_WITH_ERRORS = {
  totalRows: 3,
  createdCount: 1,
  skippedCount: 0,
  errorCount: 1,
  errors: [
    { row: 2, message: 'Either producesItemSku or recipeName is required' },
  ],
};

export const SALES_UPLOAD_RESPONSE_SUCCESS = {
  batchId: 'sales-batch-004',
  status: 'PENDING',
};

// ──────────────────────────────────────────────
// Bulk Delete Payloads
// ──────────────────────────────────────────────

export const BULK_DELETE_ITEMS = {
  ids: ['item-001', 'item-002'],
};

export const BULK_DELETE_CATEGORIES = {
  ids: ['cat-001', 'cat-003'],
};

export const BULK_DELETE_VENDORS = {
  ids: ['vendor-001', 'vendor-003'],
};

// ──────────────────────────────────────────────
// Bulk Insert Payloads (non-CSV, direct JSON)
// ──────────────────────────────────────────────

export const BULK_CREATE_VENDORS = [
  { name: 'Quick Supplier', contactEmail: 'quick@example.com', isActive: true },
  { name: 'Backup Vendor', contactEmail: null, isActive: true },
];

// ──────────────────────────────────────────────
// Mock File Objects (for page.route interceptors)
// ──────────────────────────────────────────────
// Represents what Multer.File looks like after upload (subset of Express.Multer.File).
// Use these when building route interceptors that need to simulate
// file processing (the server calls xlsx.read(file.buffer)).

interface MockMulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  stream: unknown;
  destination: string;
  filename: string;
  path: string;
}

export function createMockCsvFile(content: string, filename = 'test-upload.csv'): MockMulterFile {
  return {
    fieldname: 'file',
    originalname: filename,
    encoding: '7bit',
    mimetype: 'text/csv',
    buffer: Buffer.from(content, 'utf-8'),
    size: Buffer.byteLength(content, 'utf-8'),
    stream: null,
    destination: '',
    filename: '',
    path: '',
  };
}

export const MOCK_CSV_FILE_EXCEL: MockMulterFile = {
  fieldname: 'file',
  originalname: 'test-upload.xlsx',
  encoding: '7bit',
  mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  buffer: Buffer.from('mock-excel-binary', 'utf-8'),
  size: 18,
  stream: null,
  destination: '',
  filename: '',
  path: '',
};

export const MOCK_CSV_FILE_INVALID_TYPE: MockMulterFile = {
  fieldname: 'file',
  originalname: 'not-allowed.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  buffer: Buffer.from('%PDF-1.4 mock', 'utf-8'),
  size: 14,
  stream: null,
  destination: '',
  filename: '',
  path: '',
};
