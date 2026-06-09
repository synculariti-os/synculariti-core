# Synculariti Core — Migration Plan

## Status: Phase 0 (Reconnaissance) — Complete

## Schema Overview

### IMS (PrasanthSynculariti) — 28 tables
franchise_groups, restaurants, users, roles, permissions, role_permissions,
user_restaurant_roles, categories, items, item_restaurant_overrides, uom_conversions,
vendors, purchase_orders, po_line_items, inventory_batches, recipes, recipe_ingredients,
menu_item_mappings, inventory_ledger, inventory_transfers, inventory_count_batches,
inventory_count_rows, waste_logs, prep_production_logs, sales_import_batches,
sales_import_rows, daily_inventory_snapshots, audit_log

### ET (synculariti-ET) — 30 tables
activity_log, api_keys, app_users, chart_of_accounts, inventory_ledger,
graph_sync_queue, inventory_categories, inventory_items, invoice_items, invoices,
locations, outbox_events, po_line_items, purchase_orders, rate_limits, receipt_items,
system_telemetry, tenant_members, tenants, transactions, whatsapp_inbox,
whatsapp_outbox, purchases, purchase_anomaly_queue, pending_text_followups,
pos_batch_uploads, pos_transaction_staging, pos_data_gaps, cached_recipes,
cached_ingredients

### ⚠️ Overlapping Tables (exist in BOTH — need reconciliation)
- inventory_ledger
- purchase_orders
- po_line_items

## Dependency Tree

### IMS Packages
- @ims/types → kysely, typescript
- @ims/validators → zod, @ims/types
- @ims/translations → typescript (locale JSON)
- @ims/config → eslint, @typescript-eslint (shared tsconfig/eslint)

### IMS Apps
- @ims/api (NestJS) → @ims/types, @ims/validators, supabase, kysely, bullmq
- web (Next.js) → @ims/types, @ims/validators, @ims/translations, supabase, zustand, tailwindcss

### ET Packages
- @synculariti/whatsapp-client → jest, ts-jest (standalone)

### ET Apps
- @synculariti/et (Next.js) → @synculariti/whatsapp-client, supabase, neo4j-driver, groq-sdk

## Phase Checklist

### Phase 0: Reconnaissance
- [x] 0.0 Clone PrasanthSynculariti → /tmp/opencode/prasanth-src
- [x] 0.1 Clone synculariti-core → /home/nik/synculariti-core
- [x] 0.2 Audit both Supabase projects (schema from migration files)
- [x] 0.3 Compare schemas — identified 3 overlapping tables
- [x] 0.4 Map dependency tree
- [x] 0.5 Write PLAN.md

### Phase 1: Scaffold Monorepo (NEXT)
- [ ] 1.1 Install pnpm if needed
- [ ] 1.2 Initialize Turborepo in synculariti-core
- [ ] 1.3 Create apps/ims/ group folder (no package.json)
- [ ] 1.4 Create pnpm-workspace.yaml
- [ ] 1.5 Configure turbo.json
- [ ] 1.6 pnpm install + verify
- [ ] 1.7 git commit + push to synculariti-core

### Phase 2: Add IMS
- [ ] 2.1 Copy api/ → apps/ims/api; web/ → apps/ims/web
- [ ] 2.2 Update package names (@synculariti/ims-api, @synculariti/ims-web)
- [ ] 2.3 Fix workspace references (@ims/* → @synculariti/*)
- [ ] 2.4 Copy packages/ to root
- [ ] 2.5 Rename packages (@ims/* → @synculariti/*)
- [ ] 2.6 Fix transpilePackages in IMS web next.config
- [ ] 2.7 pnpm install + turbo build — verify

### Phase 3: Add ET
- [ ] 3.1 Copy v2/ → apps/ET/ (flatten)
- [ ] 3.2 Copy packages/whatsapp-client → root
- [ ] 3.3 Update package name (@synculariti/et) + workspace refs
- [ ] 3.4 Convert npm → pnpm
- [ ] 3.5 Fix transpilePackages in ET next.config
- [ ] 3.6 pnpm install + turbo build — verify

### Phase 4: Supabase Unification
- [x] 4.0 Create new unified Supabase project (aelonqxdhzfafzrfrvtl)
- [x] 4.1 Analyze 3 overlapping tables (inventory_ledger, purchase_orders, po_line_items → schema separation)
- [x] 4.2 Merge migrations in chronological order
- [x] 4.3 Apply to new project (IMS in `ims` schema, ET in `public` schema)
- [x] 4.4 Generate unified TypeScript types (combined ims+public schemas)
- [x] 4.5 Create @synculariti/shared-supabase package
- [x] 4.6 Point both apps to new project (ET .env.local updated)
- [ ] 4.7 Migrate any needed data

### Phase 5: Shared Packages
- [x] 5.1 @synculariti/shared-utils — errors, dates, numbers, UUID, HTTP, fetchWithRetry
- [x] 5.2 @synculariti/shared-supabase — combined types, SSR clients, service-role client
- [ ] 5.3 @synculariti/shared-ui — pending design system alignment
- [x] 5.4 Incremental adoption — deleted stale whatsapp-client duplicate in ET lib

### Phase 6: Styling Unification
- [ ] 6.1 Add Tailwind v4 to ET
- [ ] 6.2 Migrate ET design tokens → Tailwind @theme
- [ ] 6.3 Convert CSS modules to Tailwind (one module at a time)

### Phase 7: Production
- [ ] 7.1 Push to GitHub
- [ ] 7.2 Vercel project per app
- [ ] 7.3 Set env vars
- [ ] 7.4 Test preview deployments

## Blockers
- None currently

## Notes
- PrasanthSynculariti has NO supabase/migrations/ — uses single BOOTSTRAP_SUPABASE.sql
- Local synculariti-os-ims has 5 migrations — DO NOT USE (different repo)
- ET has 23 migrations
- 3 overlapping tables need schema reconciliation before Supabase unification
- IMS uses Tailwind v4; ET uses custom CSS — will migrate ET to Tailwind
