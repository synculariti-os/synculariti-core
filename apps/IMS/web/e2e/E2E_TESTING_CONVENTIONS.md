# E2E Testing Conventions

> Standards and architecture for Playwright-based end-to-end tests in Synculariti OS IMS.

---

## 1. Architecture

### Current (Phase 1 — Mock Everything)
```
Browser → Next.js (E2E_TEST=true)
           ├── Supabase Auth → page.route() intercepted
           ├── NestJS API     → page.route() intercepted
           └── No real database
```

All Supabase and API calls are intercepted via Playwright's `page.route()`. Tests never touch a real database or backend. Auth is injected via `window.__supabase.setSession()` + localStorage seeding.

**When to use this mode:** Quick smoke tests, nav-only assertions, RBAC visibility checks, CI environments without a local DB.

### Target (Phase 2 — Real Local DB)
```
Browser → Next.js (E2E_TEST=true) → NestJS API (localhost:3001) → Local PostgreSQL
           └── Supabase Auth → mocked via page.route() only
```

The NestJS API runs with `E2E_TEST=true` and connects to a **dedicated local PostgreSQL database**. Tests drive the browser against the real frontend, which calls the real API, which reads/writes the real database. Only Supabase Auth remains mocked.

**When to use this mode:** Full workflow tests (CRUD, PO lifecycle, inventory ops), integration validation, regression detection.

### Decision Matrix

| What to test | Phase 1 (mock API) | Phase 2 (real DB) |
|---|---|---|
| Nav visibility per role | ✅ Yes | ✅ Yes |
| Page loads & data renders | ✅ Yes | ✅ Yes |
| RBAC 403/redirect behavior | ✅ Yes | ✅ Yes |
| Create/Edit/Delete flows | ⚠️ Partial (mock returns) | ✅ Yes |
| PO submit → receive → batch | ❌ No | ✅ Yes |
| Inventory count → close → ledger | ❌ No | ✅ Yes |
| Sales import → processing | ❌ No | ✅ Yes |
| Cross-entity consistency checks | ❌ No | ✅ Yes |

---

## 2. Database

### 2.1 Local PostgreSQL

- **Connection string:** `postgres://pkr:cbookair@localhost:5432/synculariti_e2e`
- **Dedicated database** — never shared with `synculariti` (dev) or any other environment
- Created via: `createdb synculariti_e2e`
- Dropped and recreated between full test suite runs for hermetic isolation

### 2.2 Schema Management

- Source of truth: `apps/api/src/database/migrations/` (numbered SQL files)
- Migration runner: Kysely Migrator (applied on API startup)
- Migrations are applied **once** at the start of the test run, not per test

### 2.3 Migration Files

| File | Purpose |
|---|---|
| `00001_initial_schema.sql` | All core tables, enums, indexes, RLS policies (623 lines) |
| `00002_auth_sync_trigger.sql` | Auth user sync trigger from Supabase |
| `00003_add_cascade_delete_recipes.sql` | Cascade delete for recipe ingredients |
| `00004_add_recipe_name_check.sql` | Recipe name validation constraint |
| `00005_add_price_vat_to_recipes.sql` | Price and VAT columns on recipes |

### 2.4 Schema Validation Protocol

**Rule:** Before every E2E test run, validate that the local database schema matches the remote Supabase project schema. Block the run if drift is detected.

```
┌──────────────────────────────────────────────┐
│            PRE-FLIGHT VALIDATION              │
├──────────────────────────────────────────────┤
│  1. Dump Supabase remote schema via           │
│     pg_dump --schema-only --no-owner          │
│     $SUPABASE_DB_URL > .schema-remote.sql     │
│                                               │
│  2. Dump local E2E schema via                 │
│     pg_dump --schema-only --no-owner          │
│     $DATABASE_URL > .schema-local.sql         │
│                                               │
│  3. Diff both files via                       │
│     diff .schema-remote.sql .schema-local.sql │
│                                               │
│  4. If diff non-empty ❌                      │
│       → Print diff + block test run           │
│     If diff empty ✅                          │
│       → Proceed with test execution           │
└──────────────────────────────────────────────┘
```

**When drift is allowed:** When intentionally testing a migration that hasn't been deployed to Supabase yet. In this case, set `SCHEMA_DRIFT_ALLOWED=true` and document the expected drift in the commit message.

### 2.5 Database Cleanup

| Scope | Strategy |
|---|---|
| Per test file | Truncate all tables (`TRUNCATE TABLE ... CASCADE`) |
| Per test `describe` block | Transaction rollback (if supported) or truncate |
| Full suite | Drop + recreate database |

---

## 3. Auth Strategy

### 3.1 Supabase Auth — Always Mocked

Supabase Auth is **always** intercepted via `page.route()`, even in Phase 2. Reason: the test user credentials and JWT tokens would need to exist in the real Supabase project, which couples tests to external infrastructure.

Current mock coverage in `auth-helpers.ts`:

| Endpoint | Mock behavior |
|---|---|
| `POST /auth/v1/token?grant_type=password` | Returns `MOCK_ACCESS_TOKEN` |
| `POST /auth/v1/token?grant_type=refresh_token` | Returns `MOCK_ACCESS_TOKEN` |
| `GET /auth/v1/user` | Returns mock user (or `null` for unauthenticated) |
| `POST /auth/v1/logout` | 204 No Content |

### 3.2 Local Storage Auth Seed

`seedAuthState()` writes `ims-auth-context` to localStorage before the page loads. This pre-populates the `useAuthStore` Zustand store with the correct permissions, restaurant context, and user info for the role under test.

### 3.3 Server-Side Auth Bypass

In `apps/web/src/proxy.ts`, the server-side `supabase.auth.getUser()` call is skipped when `E2E_TEST=true`. This prevents redirect loops when the mocked session hasn't been established yet on the server side.

### 3.4 Cookie-Based Session Injection

`seedSupabaseSessionCookie()` directly sets the `sb-{project-ref}-auth-token` cookie, bypassing the need for `window.__supabase.setSession()`. This is used for roles like `Unknown` where the AppShell would cause a redirect loop before `__supabase` is available.

---

## 4. Test Data Seeding

### 4.1 Seed Timing

| When | What |
|---|---|
| Migration apply | Schema created (tables, indexes, RLS) |
| `test.beforeEach()` per file | Role-specific seed data inserted via SQL |
| `test.beforeEach()` per block | Test-specific data inserted |

### 4.2 Seed Data Sources

Phase 1 (mock): `mock-data.ts` — in-memory TypeScript arrays returned by `page.route()` interceptors.

Phase 2 (real DB): SQL seed scripts + Kysely inserts. Seed data mirrors the mock data structure to maintain consistency between phases.

### 4.3 Required Seed Entities

| Entity | Required for |
|---|---|
| `franchise_groups` | All tests (restaurant context) |
| `restaurants` | All tests |
| `users` | Auth profile resolution |
| `roles` | RBAC |
| `permissions` | RBAC |
| `role_permissions` | RBAC |
| `user_restaurant_roles` | RBAC |
| `categories` | Item Master tests |
| `items` | All module tests |
| `vendors` | Procurement tests |
| `purchase_orders` + `po_line_items` | PO lifecycle tests |
| `inventory_batches` | PO receipt tests |
| `recipes` + `recipe_ingredients` | Recipe/BOM tests |
| `inventory_ledger` | Inventory ops tests |
| `inventory_count_batches` + `rows` | Count tests |
| `menu_item_mappings` | Sales import tests |
| `sales_import_batches` + `rows` | Sales import tests |
| `daily_inventory_snapshots` | Reporting tests |

### 4.4 Seed Data Stability

- All seed entities use **stable UUIDs** (hardcoded, e.g., `00000000-0000-0000-0000-000000000001`)
- Tests assert against these known IDs
- Seed data is version-controlled in `e2e/fixtures/` or as SQL files

---

## 5. Role-Based Workflow Tests

See `ROLE_WORKFLOWS.md` for the complete per-role workflow matrix.

### 5.1 Roles & Permission Profiles

| Role | Permissions | Sections Visible |
|---|---|---|
| **Administrator** | All 12 | All 7 |
| **Restaurant Manager** | `PROCUREMENT.WRITE`, `SALES.IMPORT`, `INVENTORY.READ/WRITE`, `RECIPE.READ` | Items, Inventory, Recipes, Sales |
| **Inventory Operator** | `INVENTORY.READ`, `INVENTORY.COUNT` | Items, Inventory (Stock, Counts, Ledger) |
| **Procurement Specialist** | `PROCUREMENT.READ/WRITE` | Procurement only |
| **Franchise Manager** | `PROCUREMENT.READ` | Procurement (read-only) |
| **Accountant** | `REPORTING.READ`, `ADMIN.USERS` | Reports, Admin (Audit + Assignments) |
| **Unknown** | (none) | None |

### 5.2 File Organization

```
e2e/specs/
├── auth.spec.ts              # Login flow (Phase 1)
├── navigation.spec.ts         # Nav link routing (Phase 1)
├── dashboard.spec.ts          # Dashboard loads (Phase 1)
├── role-nav.spec.ts           # Sidebar visibility per role (Phase 1)
├── denied-access.spec.ts      # 403/redirect for unauthorized access (Phase 1)
├── admin-workflows.spec.ts    # Administrator full CRUD (Phase 2)
├── restaurant-manager-workflows.spec.ts  # Restaurant Manager ops (Phase 2)
├── inventory-operator-workflows.spec.ts  # Count & stock workflows (Phase 2)
├── procurement-workflows.spec.ts         # Vendor & PO lifecycle (Phase 2)
├── franchise-manager-workflows.spec.ts   # Read-only procurement (Phase 2)
└── accountant-workflows.spec.ts          # Reports & audit (Phase 2)
```

### 5.3 Workflow Test Structure

Each workflow test follows this pattern:

```
1. Seed auth state for the role
2. Seed database data (Phase 2) or set up API mocks (Phase 1)
3. Navigate to starting page
4. Perform action sequence (click, fill, submit)
5. Assert state change (UI update, toast, list refresh)
6. Assert API was called correctly (Phase 1) or DB state changed (Phase 2)
```

### 5.4 Denied Access Pattern

Every role spec includes a `Denied` test group that verifies pages the role **should not** access:

```typescript
test.describe('Denied pages', () => {
  const forbidden = ['/admin/roles', '/reports/variance', ...];
  for (const url of forbidden) {
    test(`redirects from ${url}`, async ({ page }) => {
      await assertDenied(page, url);
    });
  }
});
```

`assertDenied()` navigates to `url` and asserts either:
- Redirect to `/login` (server-side guard in `proxy.ts`)
- 403 error page (client-side guard in page component)
- Empty state with "access denied" message

---

## 6. Environment Configuration

### 6.1 Environment Variables

| Variable | Phase 1 | Phase 2 | Description |
|---|---|---|---|
| `E2E_TEST` | `true` | `true` | Enables E2E mode (bypass server auth) |
| `BASE_URL` | `http://localhost:3000` | Same | Next.js frontend URL |
| `DATABASE_URL` | — | `postgres://pkr:cbookair@localhost:5432/synculariti_e2e` | Local PostgreSQL for test data |
| `SUPABASE_URL` | — | `https://ooljbdretyikzdfoshjv.supabase.co` | Remote Supabase (for schema validation only) |
| `SUPABASE_SERVICE_ROLE_KEY` | — | (set locally) | Service role key for schema dump |
| `SCHEMA_DRIFT_ALLOWED` | — | `false` | Set `true` to bypass schema validation |

### 6.2 `.env.e2e` File

```env
E2E_TEST=true
BASE_URL=http://localhost:3000
DATABASE_URL=postgres://pkr:cbookair@localhost:5432/synculariti_e2e
SUPABASE_URL=https://ooljbdretyikzdfoshjv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<local-only>
```

Load with: `dotenv -e .env.e2e -- npx playwright test`

### 6.3 Scripts (in `apps/web/package.json`)

```json
{
  "test:e2e": "playwright test --config=e2e/playwright.config.ts",
  "test:e2e:ui": "playwright test --config=e2e/playwright.config.ts --ui",
  "test:e2e:schema:validate": "node e2e/scripts/schema-validate.mjs",
  "test:e2e:db:setup": "node e2e/scripts/db-setup.mjs",
  "test:e2e:db:teardown": "node e2e/scripts/db-teardown.mjs",
  "test:e2e:full": "npm run test:e2e:db:setup && npm run test:e2e:schema:validate && npm run test:e2e"
}
```

---

## 7. Page Objects

### 7.1 Organization

```
e2e/pages/
├── login.page.ts              # Login form
├── sidebar.page.ts             # Navigation sidebar
├── dashboard.page.ts           # Dashboard stats
├── items.page.ts               # Item Master: items + categories (shared)
├── inventory.page.ts           # Stock, Transfers, Waste, Prep, Ledger
├── counts.page.ts              # Count batches + rows
├── procurement.page.ts         # Vendors + Purchase Orders
├── recipes.page.ts             # BOM + POS Mappings
├── sales.page.ts               # POS Import + History
├── reports.page.ts             # Variance, Snapshots, Par Alerts
└── admin.page.ts               # Franchise Groups, Restaurants, Roles, Permissions, Assignments, Audit
```

### 7.2 Per-Module Convention

Each page object class groups methods by sub-page:

```typescript
class InventoryPage {
  // Stock Levels
  async viewStockLevels(): Promise<StockLevel[]> { ... }
  async getStockCount(): Promise<number> { ... }
  
  // Transfers
  async createTransfer(from: string, to: string, items: TransferItem[]): Promise<void> { ... }
  async completeTransfer(id: string): Promise<void> { ... }
  
  // Counts
  async startCountBatch(): Promise<string> { ... }
  async submitCountRow(batchId: string, rowId: string, qty: number): Promise<void> { ... }
  async closeBatch(batchId: string): Promise<void> { ... }
  
  // Waste
  async logWaste(itemId: string, qty: number, reason: string): Promise<void> { ... }
  
  // Prep Production
  async logPrep(recipeId: string, qty: number): Promise<void> { ... }
  
  // Ledger
  async viewLedger(page?: number): Promise<LedgerEntry[]> { ... }
}
```

### 7.3 Locator Strategy

- **Data attributes preferred:** `[data-testid="..."]`
- **Text selectors** as fallback: `page.getByText(...)`
- **Role selectors** for accessibility: `page.getByRole('button', { name: '...' })`
- Avoid CSS class-based selectors (fragile to style changes)

---

## 8. Execution Flow

### Phase 1 (Current)
```
1. playwright.config.ts starts Next.js dev server with E2E_TEST=true
2. Each describe block:
   a. setupApiMocks() — register page.route() interceptors
   b. seedAuthState() — write localStorage
   c. Navigate → interact → assert
```

### Phase 2 (Target)
```
1. Pre-flight:
   a. schema-validate.mjs — compare local vs remote schema, block if drift
   b. db-setup.mjs — drop + recreate synculariti_e2e, apply migrations, seed base data

2. playwright.config.ts starts both:
   a. NestJS API (localhost:3001) with E2E_TEST=true, DATABASE_URL=synculariti_e2e
   b. Next.js frontend (localhost:3000) with E2E_TEST=true

3. Each describe block:
   a. Setup role-specific test data
   b. Navigate → interact → assert via real API

4. Post-run:
   a. db-teardown.mjs — drop synculariti_e2e
```

---

## 9. CI Integration

### GitHub Actions

```yaml
name: E2E Tests
on: [deployment_status]
jobs:
  e2e:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: synculariti_e2e
          POSTGRES_USER: pkr
          POSTGRES_PASSWORD: cbookair
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:e2e:schema:validate
      - run: npm run test:e2e:db:setup
      - run: npm run test:e2e
```

---

## 10. Anti-Patterns

| ❌ Don't | ✅ Do |
|---|---|
| Share test data between spec files | Each spec file seeds its own data |
| Use real Supabase Auth in tests | Mock all Supabase Auth via `page.route()` |
| Hardcode URLs or IDs in assertions | Import from `mock-data.ts` constants |
| Test against production Supabase | Use local PostgreSQL for data, mock for Auth |
| Rely on CSS classes for locators | Use `data-testid` or `getByRole` |
| Run tests in parallel (for now) | Use `workers: 1` until Phase 2 stabilizes |
| Write assertions for API internals | Assert on UI state changes visible to the user |

---

## 11. Quick Reference

```bash
# Run all E2E tests (Phase 1 — mocked)
npm run test:e2e

# Run a single spec file
npx playwright test --config=e2e/playwright.config.ts e2e/specs/auth.spec.ts

# Run with UI mode (debugging)
npm run test:e2e:ui

# Validate schema (Phase 2)
npm run test:e2e:schema:validate

# Full E2E with DB setup (Phase 2)
npm run test:e2e:full
```
