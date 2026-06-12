# Synculariti Core — Plan

## Goal
ONE app. One login. One UI. One DB. One process.

The schema is complete (118 tables, 5 materialized views, CQRS foundation, saga orchestrator, notification routing). All three legacy apps (`apps/web`, `apps/ET`, `apps/ims/web`, `apps/ims/api`) collapse into a single NestJS server that serves a static SPA frontend.

## Architecture target

```
┌──────────────────────────────────────────────────┐
│              One process: node dist/main          │
│  ┌──────────────┐     ┌────────────────────────┐ │
│  │  Next.js SPA  │     │      NestJS server      │ │
│  │  (static)     │◄────┤                          │ │
│  │  apps/web/out │     │  ┌── REST API ──────┐   │ │
│  └──────────────┘     │  │ /items /recipes    │   │ │
│                        │  │ /inventory /sales │   │ │
│                        │  │ /procurement /... │   │ │
│                        │  └───────────────────┘   │ │
│                        │  ┌── Workers ────────┐   │ │
│                        │  │ BullMQ (sales      │   │ │
│                        │  │ import, etc.)      │   │ │
│                        │  └───────────────────┘   │ │
│                        │  ┌── Static files ───┐   │ │
│                        │  │ SPA frontend,      │   │ │
│                        │  │ assets, favicon    │   │ │
│                        │  └───────────────────┘   │ │
│                        └────────────────────────┘ │
└──────────────────────────────────────────────────┘
                        │
                        ▼
           Supabase (DB + Auth + Realtime)
```

### What stays
- **Supabase** — DB, Auth, Realtime, Storage. No change.
- **NestJS business logic** — 8 service modules, 19 repositories, BullMQ workers. **No migration.**
- **Postgres schema** — 118 tables, triggers, functions, materialized views. **No change.**
- **`@synculariti/shared-supabase`** — DB types, typed clients. **No change.**

### What goes
- **`apps/ET`** — exact fork of `apps/web/(et)/`. Delete.
- **`apps/ims/web`** — IMS dashboard (pages already in `apps/web/(ims)/`). Delete.
- **Next.js as a server** — becomes a build-time tool only (static export).
- **Proxy route** — `apps/web/src/app/api/ims/[...path]/route.ts` no longer needed.

### What gets added
- **NestJS static file serving** — serves the SPA from `apps/web/out/`.
- **NestJS catch-all route** — any non-API request returns `index.html` (SPA routing).
- **Port Next.js API routes to NestJS** — WhatsApp webhook, cron, Neo4j sync, Groq AI, etc.

---

## Phase 1: Clean house + SPA export
- [ ] **1.1** Delete `apps/ET/` entirely — zero unique code
- [ ] **1.2** Delete `apps/ims/web/` — pages already live under `apps/web/(ims)/`
- [ ] **1.3** Configure `apps/web/next.config.ts` for static export (`output: 'export'`)
- [ ] **1.4** Remove unused deps: `@supabase/ssr` (no more server-side auth), `next-intl` server plugin
- [ ] **1.5** Update middleware: no SSR needed, client-side auth only
- [ ] **1.6** Build SPA: `cd apps/web && npx next build` → produces `apps/web/out/`
- [ ] **1.7** Verify the SPA works standalone (`npx serve apps/web/out`)

## Phase 2: NestJS serves the SPA
- [ ] **2.1** Add `@nestjs/serve-static` or manual `app.useStaticAssets()` in `main.ts`
- [ ] **2.2** Point static root to `apps/web/out/`
- [ ] **2.3** Add catch-all route: any non-API GET returns `index.html`
- [ ] **2.4** Remove the proxy route `apps/web/src/app/api/ims/[...path]`
- [ ] **2.5** Test: NestJS serves both API and SPA from single `node dist/main`

## Phase 3: Port Next.js API routes to NestJS
- [ ] **3.1** WhatsApp webhook → NestJS controller under `apps/ims/api/src/whatsapp/`
- [ ] **3.2** WhatsApp notify / process-outbox → NestJS controller
- [ ] **3.3** Groq AI routes → NestJS controller
- [ ] **3.4** Neo4j sync / backfill → NestJS controller
- [ ] **3.5** Cron release-quarantines → NestJS `@Cron` decorator (remove Next.js cron route)
- [ ] **3.6** Enable Banking → NestJS controller
- [ ] **3.7** ekasa proxy, health, export, analytics → NestJS controllers
- [ ] **3.8** Delete `apps/web/src/app/api/` entirely — all routes ported to NestJS
- [ ] **3.9** At this point, Next.js is a pure SPA build tool. Zero server-side code remains.

## Phase 4: One deploy
- [x] **4.1** Single Dockerfile at repo root (not inside `apps/ims/api/`)
- [~] **4.2** CI pipeline partially done — `pnpm build` works in Docker
- [~] **4.3** Docker image built & tested (`/health` → OK). Railway deploy setup documented in `DEPLOY.md`
- [~] **4.4** One domain — user will configure in Railway dashboard
- [ ] **4.5** Supabase Realtime consumed client-side for in-app notifications
- [x] **4.6** `Vercel.md` replaced with `DEPLOY.md` covering Railway + Docker
- [ ] **4.7** Delete `turbo.json` — single project, no monorepo build tooling needed

## Reference
- Schema: 118 tables, 4 views, 5 materialized views
- CQRS: Event store, saga orchestrator, notification routing (all built)
- NestJS API: 8 modules, 106 source files, SWC build
- Docker: Multi-stage (node:22-bookworm-slim), 1.1 GB image
- Frontend SPA: 347 components/pages, all under `apps/web/src/`

## Previously achieved (archived)
Phases 1–10b built the complete database schema: inventory, recipes, procurement, finance, POS, labor, menu versioning, three-way match, guest CRM/loyalty/reservations/KDS/feedback, vendor portal, commissary, cost centers, bank reconciliation, compliance, append-only event store, saga orchestrator, and notification routing. All migrated to Supabase, TypeScript types generated, build clean.
