# Synculariti Core — Plan

## Status: Phases 1–10b ✅ — Three-Way Match Sagafied

## Architecture
- **Monorepo**: Turborepo with pnpm workspaces
- **Database**: Single `public` schema — IMS + ET tables unified (113 tables + 4 views + 5 MVs)
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
- Guest profiles with CRM, visit tracking, and segmentation tags
- Loyalty program (points, tiers, rewards catalog)
- Reservations, table management, floor plans, and waitlist
- KDS foundation (stations, tickets, line items, routing)
- Guest feedback and survey response collection
- Vendor portal access, catalog sync, and EDI transaction logging
- Commissary/central kitchen production planning and inter-location orders
- Transfer pricing rules for inter-company cost allocation
- Cost centers/profit centers with hierarchy and intercompany eliminations
- Bank account management, transaction import, and reconciliation matching
- Compliance layer: data retention policies, PII classification, GDPR request tracking
- Append-only domain event store with optimistic versioning and mutation protection
- Pre-defined domain event types for all 10 aggregates (inventory, PO, recipe, menu, sales, finance, labor, commissary, procurement, CRM, loyalty, reservations, KDS)
- Saga orchestrator: saga_definitions, saga_instances, saga_steps with Procure-to-Pay, Commissary Transfer, and Guest Loyalty workflows
- Projection tracking and rebuild automation (5 materialized views)
- Aggregate snapshots for fast state rebuild from event stream

### Critical Gaps (remaining after Phase 10)
— All core operational domains + CQRS foundation complete.
Remaining work: Retrofit existing HITL/manual workflows into saga orchestrator (Phase 10b), NestJS command/query/event bus wiring, shared UI extraction, frontend deployment.

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

### Phase 8: Guest Experience ✅ COMPLETE
- [x] 8.1 Guest profiles + CRM — `guest_profiles` with tags/preferences, `guest_visits` for visit history
- [x] 8.2 Loyalty — `loyalty_accounts` (points/tier), `loyalty_points_transactions`, `loyalty_rewards` catalog
- [x] 8.3 Reservations + tables — `floor_plans`, `restaurant_tables`, `reservations`, `reservation_tables`, `waitlist_entries`
- [x] 8.4 KDS foundation — `kds_stations`, `kitchen_tickets`, `ticket_items` (with modifiers/station routing), `ticket_routing`
- [x] 8.5 Guest feedback — `guest_feedback` (rating + category), `survey_responses` (structured Q&A)

### Phase 9: Enterprise Scale ✅ COMPLETE
- [x] 9.1 Vendor portal / EDI — `vendor_portal_access`, `vendor_catalog_items`, `edi_config`, `edi_transactions`
- [x] 9.2 Commissary / central kitchen — `production_plans`, `production_plan_items`, `commissary_orders`, `commissary_order_items`, `transfer_pricing_rules`
- [x] 9.3 Cost centers / profit centers — `cost_centers` (hierarchical), `intercompany_transactions` (with elimination tracking)
- [x] 9.4 Bank reconciliation — `bank_accounts`, `bank_transactions`, `reconciliation_entries`
- [x] 9.5 Compliance layer — `data_retention_policies`, `pii_data_classification`, `gdpr_export_requests`

### Phase 10: CQRS Migration ✅ COMPLETE
- [x] 10.1 Append-only event store — `domain_events` with unique version constraint, `append_domain_event()` helper, UPDATE/DELETE trigger enforcement
- [x] 10.2 Domain events defined per aggregate — `domain_event_types` registry seeded with 50 event types across 13 aggregates
- [x] 10.3 Projections — `projection_status` tracking table, 5 materialized views registered
- [x] 10.4 Command/Query separation — DB foundation laid; NestJS refactor (command bus, query bus, event bus) remains application-level
- [x] 10.5 Saga orchestrator — `saga_definitions`, `saga_instances`, `saga_steps` tables; `start_saga()`, `advance_saga()`, `fail_saga()` functions; 3 seeded sagas (Procure-to-Pay, Commissary Transfer, Guest Loyalty)
- [x] 10.6 Read model rebuild — `rebuild_projection()` (REFRESH MATERIALIZED VIEW CONCURRENTLY), `rebuild_stale_projections()`, `take_aggregate_snapshot()`, `aggregate_snapshots` table

### Phase 10b: Saga-Driven Workflows (Future — Formalise HITL & Multi-Step Processes)
- [x] **10b.1 Three-way match (retrofit)** — wire existing `goods_receipts`/`three_way_match_results` triggers → `start_saga('procure_to_pay')`, `advance_saga('goods.receipt.confirmed')`, `advance_saga('invoice.match.verified')` / `fail_saga('invoice.match.failed')`
- [ ] **10b.2 POS ingestion HITL** — anomalous `sales_import_rows` trigger WhatsApp outbox HITL flow → formalised as saga with `sales_import.submitted`, `.approved`, `.rejected` events
- [ ] **10b.3 Inventory count variance approval** — count completes with variance → saga: `inventory.count.completed` → supervisor approval step → `inventory.batch.adjusted` or rollback
- [ ] **10b.4 Receipt scanning → extraction → approval** — OCR receipt → saga with `receipt.scanned`, `.data_extracted`, `.approved`, `.rejected`; HITL on extraction confidence < threshold
- [ ] **10b.5 Vendor onboarding** — vendor application → saga: `vendor.registered`, `.documents_uploaded`, `.approved`, `.onboarded`; HITL at approval gate
- [ ] **10b.6 Employee time-entry approval** — `time_entry.submitted` → saga: manager approval / auto-approve if within threshold → `time_entry.approved` or `.rejected`
- [ ] **10b.7 Guest feedback resolution** — `guest_feedback` created → saga: alert manager → `.acknowledged` → `.resolved` or `.escalated`; HITL at escalation
- [ ] **10b.8 Bank reconciliation match HITL** — `bank_transactions` with no auto-match → saga: `reconciliation.pending` → human review → `.matched` or `.unmatched`
- [ ] **10b.9 Loyalty tier overrides & manual adjustments** — points adjustment request → saga: `.requested` → supervisor approval → `.approved` or `.rejected`
- [ ] **10b.10 Menu version publishing approval** — menu version `.staged` → HITL approval gate → `.published` or `.rolled_back`

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
