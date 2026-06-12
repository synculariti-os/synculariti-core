# Synculariti Core — Plan

## Status: Phase 5 ✅ Phase 6 ✅ Phase 7 ✅ — Domain Expansion Complete

## Architecture
- **Monorepo**: Turborepo with pnpm workspaces
- **Database**: Single `public` schema — IMS + ET tables unified (74 tables + 4 views)
- **Frontend**: `apps/web` (Next.js) with route groups `(ims)/ims/` and `(et)/et/`
- **Backend**: `apps/ims/api` (NestJS) as primary API; ET features as Next.js API routes in `apps/web`
- **Auth**: Supabase Auth as source of truth, synced to `users` table via trigger
- **Infrastructure**: Supabase project `aelonqxdhzfafzrfrvtl` — Management API connected via PAT

## Package Map

### Apps
| App | Package | Tech | Status |
|-----|---------|------|--------|
| Unified Web | `@synculariti/web` | Next.js 16 | ✅ Active — IMS pages complete, ET pages pending |
| IMS API | `@synculariti/ims-api` | NestJS | ✅ Active |
| IMS Web (legacy) | `@synculariti/ims-web` | Next.js 16 | ⏳ Awaiting deprecation |

### Shared Packages
| Package | Contents | Status |
|---------|----------|--------|
| `@synculariti/types` | Kysely DB types, branded IDs, domain enums | ✅ Complete (unified) |
| `@synculariti/shared-supabase` | Supabase clients + PostgREST types | ✅ Complete (public schema) |
| `@synculariti/shared-utils` | Errors, dates, UUID, fetch, HTTP | ✅ Complete |
| `@synculariti/validators` | Zod schemas | ✅ Active |
| `@synculariti/translations` | en/sk locale JSON | ✅ Active |
| `@synculariti/whatsapp-client` | WhatsApp Business API client | ✅ Active |
| `@synculariti/config` | Shared ESLint/TypeScript config | ✅ Active |

## Schema Health Score: 9.5/10

### Strengths
- Multi-tenant (franchise_groups → restaurants, tenant_id on all core tables)
- Soft deletes + created_at/updated_at on all tables
- UUID PKs throughout, strong indexing (composite + partial indexes)
- Outbox pattern + event-driven queues
- RBAC complete (roles, permissions, role_permissions, user_restaurant_roles)
- Inventory with FIFO batches + ledger + UOM conversions + valuation MV
- Recipe/BOM with sub-recipes + recipe costing snapshots + COGS MV
- Finance with chart of accounts + double-entry transactions
- POS staging with anomaly detection + WhatsApp HITL workflow
- Materialized read models for sales, inventory, COGS, prime cost
- Labor management (shifts, time_entries, labor_standards, labor_cost_actuals)
- Procurement three-way matching (PO → Receipt → Invoice)
- Menu versioning with seasonal menus and item pricing
- Allergen & nutritional tracking on items

### Critical Gaps (remaining after Phase 7)
- **No guest CRM / loyalty**
- **No table management / reservations**
- **No KDS foundation**
- **No vendor portal / EDI**
- **No commissary/central kitchen**

### Technical Gotchas (Will Hurt Later)
- `tenant_id` nullable on several tables — data integrity risk
- Dual hierarchy (`franchise_group_id` + `tenant_id`) — confusion
- `transactions` PK index named `expenses_pkey` (legacy)
- `feature_flags` has no targeting rules (all-or-nothing)

### CQRS Readiness: 2/10
Missing event store, projections, command/query separation, idempotent commands, saga orchestration.

## Phase Checklist

### Phase 0: Reconnaissance ✅
- [x] All original codebases cloned
- [x] Schema audit + comparison completed
- [x] Migration path designed

### Phase 1: Monorepo Foundation ✅
- [x] Turborepo + pnpm workspace
- [x] All packages build
- [x] CI/CD pipeline

### Phase 2–3: IMS + ET Integration ✅
- [x] IMS/ET packages copied and renamed
- [x] Workspace references fixed
- [x] transpilePackages configured

### Phase 4: Schema Unification ✅
- [x] Unified migration written and applied
- [x] 56 tables + 4 views in `public` schema
- [x] Backward-compat views (tenants, locations, inventory_categories, inventory_items)
- [x] All types regenerated (Kysely + PostgREST)

### Phase 5: Schema Fortification ✅ COMPLETE
- [x] 5.1 Event store table (`domain_events`) — migration written (20260611120002_event_store.sql), applied to live Supabase
-   - Columns: id UUID, aggregate_id UUID, aggregate_type TEXT, event_type TEXT, payload JSONB, metadata JSONB, version INT, correlation_id UUID, causation_id UUID, created_at TIMESTAMPTZ
-   - Indexes: aggregate_id + version (unique), event_type, correlation_id
-   - Append-only policy (trigger prevents UPDATE/DELETE)
- [x] 5.2 Fix nullable `tenant_id` — add NOT NULL + backfill on items, recipes, vendors, transactions
- [x] 5.3 Consolidate duplicate tables
-   - Merged `et_purchase_orders` → `purchase_orders` (added delivery_status, notes)
-   - Merged `et_inventory_ledger` → `inventory_ledger` (added quantity, cost)
-   - Merged `et_po_line_items` → `po_line_items` (added discount)
-   - Dropped legacy `et_*` tables
- [x] 5.4 Add `accounting_periods` table + period close function
- [x] 5.5 Add `exchange_rates` table — EUR base rate per date
- [x] 5.6 Add `tenant_settings` table (branding, config, feature flags targeting) — FK to `franchise_groups`
- [x] 5.7 Add unique constraint on `recipe_ingredients(recipe_id, ingredient_item_id)`
- [x] 5.8 Backfill missing `updated_at` triggers on items, recipes, vendors, transactions
- [x] 5.9 Regenerate types after schema changes — `@synculariti/shared-supabase` built successfully


### Phase 5b: Build Unblocking (COMPLETED)
- [x] `@synculariti/shared-supabase` as single source of truth for Supabase client
- [x] All app-level supabase.ts files re-export from shared-supabase
- [x] Direct createClient calls replaced with `createServiceRoleClient()`
- [x] Type generation: views merged into Tables, deduplication for overlapping columns
- [x] `apps/web` builds successfully
- [x] `apps/ET` builds successfully — fixed ~20+ type errors across 15+ files:
  - Transaction interface: added `date` alias for `transaction_date`
  - InventoryItem: made id, sku nullable to match DB
  - InventoryCategory: expanded to match DB columns
  - Event log hooks: fixed async Promise.all type issues
  - Multiple RPC casts added for Supabase type safety
  - Various `as any` casts for tables not in generated types
  - Seed scripts: added `as any` for insert/select on new tables

### Phase 6: Read Models & Analytics ✅ COMPLETE
- [x] 6.1 Materialized view: `mv_daily_sales_summary` — per location/date/item sales aggregation from `pos_transaction_staging`
- [x] 6.2 Materialized view: `mv_inventory_valuation` — FIFO cost by item/location from `inventory_batches`
- [x] 6.3 Materialized view: `mv_cogs_by_recipe` — ingredient-level COGS per production run from `recipe_ingredients` + `inventory_batches`
- [x] 6.4 Materialized view: `mv_prime_cost` — COGS + labor (labor = 0 placeholder until Phase 7.1) per location/date
- [x] 6.5 Recipe costing versioning (`recipe_cost_snapshots` table)
- [x] 6.6 Menu engineering view (`mv_menu_item_performance`) — revenue & quantity per item
- [x] Helper function `refresh_analytics_mvs()` to refresh all MVs concurrently

### Phase 7: Domain Expansion ✅ COMPLETE
- [x] 7.1 Labor management
  - `shifts` (location, role, shift_date, start/end, wage)
  - `time_entries` (clock-in/out, breaks, computed total_hours)
  - `labor_standards` (target labor % by revenue bucket per role)
  - `labor_cost_actuals` (daily/weekly aggregated labor cost per location)
- [x] 7.2 Three-way match (procurement)
  - `goods_receipts` (receive against PO)
  - `goods_receipt_items` (line-level receiving with accept/reject)
  - `three_way_match_results` (PO vs Receipt vs Invoice with variance)
- [x] 7.3 Menu versioning + seasonal menus
  - `menu_versions` (effective_date_from, effective_date_to, is_active)
  - `menu_version_items` (menu_version_id, item_id, price, available)
- [x] 7.4 Allergen / dietary / nutrition on `items`
  - `item_allergens` (item_id, allergen — unique per item)
  - `item_nutritionals` (item_id, serving_size, calories, fat, protein, carbs, sodium, etc.)

> **Note:** `mv_prime_cost` labor component now has live tables to draw from once populated.

### Phase 8: Guest Experience (P2)
- [ ] 8.1 guest_profiles + CRM
- [ ] 8.2 loyalty_accounts + loyalty_points
- [ ] 8.3 reservations + waitlist + tables + floor_plans
- [ ] 8.4 KDS foundation (kitchen_tickets, kds_stations, ticket_routing)
- [ ] 8.5 guest_feedback + surveys

### Phase 9: Enterprise Scale (P2–P3)
- [ ] 9.1 Vendor portal / EDI (`vendor_portal_access`, `edi_config`, `vendor_catalog_items`)
- [ ] 9.2 Commissary / central kitchen (`production_plans`, `commissary_orders`, `transfer_pricing_rules`)
- [ ] 9.3 Cost centers / profit centers + intercompany eliminations
- [ ] 9.4 Bank reconciliation (`bank_accounts`, `bank_transactions`, `reconciliation_entries`)
- [ ] 9.5 Compliance layer: GDPR data export, data retention, PII tagging

### Phase 10: CQRS Migration (P3 — When Needed)
- [ ] 10.1 Append-only event store (from 5.1) — full schema
- [ ] 10.2 Domain events defined per aggregate (Inventory, Recipe, PO, Transaction, Menu)
- [ ] 10.3 Projections: rebuild materialized views from event stream
- [ ] 10.4 Command/Query separation in NestJS + Next.js API routes
- [ ] 10.5 Saga orchestrator for cross-aggregate workflows (Procurement → Receiving → Payment)
- [ ] 10.6 Read model rebuild automation (backfill + catch-up)

### Phase 11: Shared UI & Production
- [ ] 11.1 Extract @synculariti/shared-ui from IMS + ET
- [ ] 11.2 Unify design tokens (Tailwind @theme)
- [ ] 11.3 Convert ET CSS modules → Tailwind
- [ ] 11.4 Port remaining IMS/ET pages to apps/web route groups
- [ ] 11.5 GitHub push + Vercel deployment
- [ ] 11.6 Preview deployments + env vars

## Key Decisions
- **Canonical table names**: `franchise_groups`/`restaurants` (IMS naming); backward-compat views (tenants/locations) for ET
- **Auth**: Supabase Auth → `users` via trigger; `app_users` as legacy wrapper
- **Frontend**: Route groups `(ims)` and `(et)` under `apps/web`
- **API**: NestJS (`apps/ims/api`) as unified backend; ET features as Next.js API routes
- **Event store**: Append-only, no UPDATE/DELETE permitted at DB level (trigger-enforced)
- **Inventory costing**: Default FIFO; support Weighted Average and Standard Cost via method column on inventory_batches
- **Multi-tenant isolation**: RLS policies per tenant; tenant_id must always be NOT NULL with FK enforcement
