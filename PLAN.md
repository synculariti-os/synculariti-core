# Synculariti Core — Plan

## Status: Schema Complete — Now in Schema Fortification Phase (Phase 5b Build Unblocking DONE)

## Architecture
- **Monorepo**: Turborepo with pnpm workspaces
- **Database**: Single `public` schema — IMS + ET tables unified (56 tables + 4 views)
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

## Schema Health Score: 7/10

### Strengths
- Multi-tenant (franchise_groups → restaurants, tenant_id on all core tables)
- Soft deletes + created_at/updated_at on all tables
- UUID PKs throughout, strong indexing (composite + partial indexes)
- Outbox pattern + event-driven queues
- RBAC complete (roles, permissions, role_permissions, user_restaurant_roles)
- Inventory with FIFO batches + ledger + UOM conversions
- Recipe/BOM with sub-recipes
- Finance with chart of accounts + double-entry transactions
- POS staging with anomaly detection + WhatsApp HITL workflow

### Critical Gaps
- **No event store** — CQRS blocker
- **No materialized read models** — Query performance at scale
- **No temporal/point-in-time queries** — Accounting P&L by period
- **Single inventory valuation (FIFO only)** — Multi-method needed
- **No accounting periods / period close**
- **Hardcoded EUR currency**
- **No labor management** — Prime cost = 0% tracked
- **No menu engineering / versioning**
- **No allergen/nutrition tracking**
- **No guest CRM / loyalty**
- **No table management / reservations**
- **No KDS foundation**
- **No vendor portal / EDI**
- **No commissary/central kitchen**
- **Schedule/seasonal menus not supported**

### Technical Gotchas (Will Hurt Later)
- `tenant_id` nullable on several tables — data integrity risk
- Dual hierarchy (`franchise_group_id` + `tenant_id`) — confusion
- `et_purchase_orders` vs `purchase_orders` — duplicate procurement
- `et_inventory_ledger` vs `inventory_ledger` — duplicate inventory
- `transactions` PK index named `expenses_pkey` (legacy)
- No unique constraint on `recipe_ingredients(recipe_id, ingredient_item_id)`
- No `updated_at` trigger on all tables (some missing)
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

### Phase 5: Schema Fortification (NOW — P0)
- [x] 5.1 Event store table (`domain_events`) — migration written (20260611120002_event_store.sql), needs apply to live Supabase
  - Columns: id UUID, aggregate_id UUID, aggregate_type TEXT, event_type TEXT, payload JSONB, metadata JSONB, version INT, correlation_id UUID, causation_id UUID, created_at TIMESTAMPTZ
  - Indexes: aggregate_id + version (unique), event_type, correlation_id
  - Append-only policy (trigger prevents UPDATE/DELETE)
- [ ] 5.2 Fix nullable `tenant_id` — add NOT NULL + backfill on items, recipes, vendors, transactions
- [ ] 5.3 Consolidate duplicate tables
  - Merge `et_purchase_orders` → `purchase_orders` (missed columns: delivery_status, notes)
  - Merge `et_inventory_ledger` → `inventory_ledger`
  - Merge `et_po_line_items` → `po_line_items`
- [ ] 5.4 Add `accounting_periods` table + period close function
- [ ] 5.5 Add `exchange_rates` table — EUR base rate per date
- [ ] 5.6 Add `tenant_settings` table (branding, config, feature flags targeting)
- [ ] 5.7 Add unique constraint on `recipe_ingredients(recipe_id, ingredient_item_id)`
- [ ] 5.8 Backfill missing `updated_at` triggers
- [ ] 5.9 Regenerate types after schema changes

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

### Phase 6: Read Models & Analytics (P1)
- [ ] 6.1 Materialized view: `mv_daily_sales_summary`
- [ ] 6.2 Materialized view: `mv_inventory_valuation` — cost by method (FIFO/Weighted)
- [ ] 6.3 Materialized view: `mv_cogs_by_recipe`
- [ ] 6.4 Materialized view: `mv_prime_cost` — COGS + labor by location/period
- [ ] 6.5 Recipe costing versioning (`recipe_cost_snapshots`)
- [ ] 6.6 Menu engineering tables (`menu_item_performance`)

### Phase 7: Domain Expansion (P1–P2)
- [ ] 7.1 Labor management
  - `shifts` (location, role, start/end, wage)
  - `time_entries` (clock-in/out, breaks)
  - `labor_standards` (scheduled labor % by revenue bucket)
  - `labor_cost_actuals` (daily/weekly per location)
- [ ] 7.2 Three-way match (procurement)
  - `goods_receipts` (receive against PO)
  - `three_way_match_results` (PO vs Receipt vs Invoice)
- [ ] 7.3 Menu versioning + seasonal menus
  - `menu_versions` (effective_date_from, effective_date_to)
  - `menu_version_items` (menu_version_id, item_id, price, available)
- [ ] 7.4 Allergen / dietary / nutrition on `items`
  - `item_allergens` (item_id, allergen)
  - `item_nutritionals` (item_id, serving_size, calories, fat, protein, carbs, sodium)

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
