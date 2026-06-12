# Vercel Deployment Guide — Synculariti Core

## What goes where

| App | Platform | Repo folder |
|-----|----------|-------------|
| **Main web** (`@synculariti/web`) | **Vercel** — `synculariti-web` | `apps/web` |
| **Expense Tracker** (`@synculariti/et`) | **Vercel** — `synculariti-et` | `apps/ET` |
| **IMS Dashboard** (`@synculariti/ims-web`) | **Vercel** — `synculariti-ims` | `apps/ims/web` |
| **IMS API** (`@synculariti/ims-api`) | **Docker / Cloud Run** — NOT Vercel | `apps/ims/api` |

The IMS API is a NestJS backend (not serverless-friendly). It has its own `Dockerfile` at `apps/ims/api/Dockerfile` and should be deployed on Railway, Render, or Cloud Run with Postgres + Redis.

---

## 1. Create a Vercel project per app

Each app gets its own Vercel project. They all share the **same GitHub repo** — Vercel's monorepo support handles this.

### 1a. synculariti-web (main app)

| Setting | Value |
|---------|-------|
| Git provider | GitHub |
| Repo | `synculariti-os/synculariti-core` |
| Root directory | `apps/web` |
| Framework preset | Next.js |
| Build command | `cd ../.. && pnpm build --filter=@synculariti/web` |
| Output directory | `.next` (automatic) |
| Install command | `pnpm install` |
| Node version | 20.x (set in Vercel project settings) |

### 1b. synculariti-et (Expense Tracker)

| Setting | Value |
|---------|-------|
| Root directory | `apps/ET` |
| Build command | `cd ../.. && pnpm build --filter=@synculariti/et` |
| All other settings | Same as web |

### 1c. synculariti-ims (IMS Dashboard)

| Setting | Value |
|---------|-------|
| Root directory | `apps/ims/web` |
| Build command | `cd ../.. && pnpm build --filter=@synculariti/ims-web` |
| All other settings | Same as web |

**Important:** When Vercel prompts "Configure a Root Directory?", say **Yes** and point it to the app subdirectory (e.g. `apps/web`). Vercel will auto-detect `next.config.ts` there.

---

## 2. Environment Variables

### All apps (required)

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → Anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` key (keep secret!) |

### synculariti-web + synculariti-et

| Variable | Where to get it |
|----------|----------------|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) — API keys |
| `NEO4J_URI` | Neo4j Aura dashboard → Connection URI (e.g. `neo4j+s://<id>.databases.neo4j.io`) |
| `NEO4J_USER` | Neo4j Aura → database credentials |
| `NEO4J_PASSWORD` | Neo4j Aura → database credentials |
| `CRON_SECRET` | Generate a random string: `openssl rand -hex 32` |
| `OPENWA_API_KEY` | OpenWA Gateway config |
| `OPENWA_BASE_URL` | Usually `http://34.66.35.89:2785` |
| `OPENWA_SESSION_ID` | Usually `synculariti-bot` |
| `OPENWA_WEBHOOK_SECRET` | OpenWA gateway webhook config |
| `ENABLE_BANKING_APP_ID` | Enable Banking developer dashboard |
| `ENABLE_BANKING_APP_SECRET` | Enable Banking developer dashboard |
| `ENABLE_BANKING_BASE_URL` | `https://api.enablebanking.com` |
| `PIN_DERIVATION_SECRET` | Generate a random string: `openssl rand -hex 32` |
| `SYNC_SECRET_KEY` | Generate a random string: `openssl rand -hex 32` |
| `SUPABASE_WEBHOOK_SECRET` | Supabase Dashboard → Database → Webhooks → your webhook's secret |
| `IMS_API_BASE_URL` | URL of the deployed IMS API (e.g. `https://ims-api.railway.app`) |
| `IMS_API_KEY` | A shared secret between web and IMS API |
| `NEXT_PUBLIC_APP_URL` | The deployed URL of this app (e.g. `https://www.synculariti.com`) |
| `NEXT_PUBLIC_BASE_URL` | Same as `NEXT_PUBLIC_APP_URL` |
| `NEXT_PUBLIC_API_URL` | Usually `https://ims-api.railway.app` (or `/api/ims` if proxied) |
| `NESTJS_API_URL` | Same as `IMS_API_BASE_URL` |
| `SIDEARM_HMAC_SECRET` | HMAC secret for WhatsApp sidecar verification |

### synculariti-ims only

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | URL of the IMS API backend |

---

## 3. GitHub repo connection

1. Go to **Vercel Dashboard → Add New → Project**
2. Import `synculariti-os/synculariti-core`
3. For *each* app (web, ET, ims), create a **separate Vercel project**
4. Set the root directory to the appropriate subfolder (see table in §1)
5. Paste the environment variables from §2 (use Vercel's "Environment Variables" tab)
6. Deploy

---

## 4. Domains

| App | Suggested domain |
|-----|-----------------|
| synculariti-web | `www.synculariti.com` |
| synculariti-et | `et.synculariti.com` |
| synculariti-ims | `ims.synculariti.com` |

Add these in Vercel → Project → Settings → Domains.

---

## 5. Preview deployments

Vercel creates preview deployments for every PR automatically. To make them useful:

1. Go to **Project → Settings → Git → Preview Deployments**
2. Enable for all branches (or just `main` + `develop`)
3. Set `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_BASE_URL` to `https://<preview-url>` — use Vercel's `VERCEL_URL` variable in code:
   ```ts
   const baseUrl = process.env.VERCEL_URL
     ? `https://${process.env.VERCEL_URL}`
     : process.env.NEXT_PUBLIC_APP_URL;
   ```
4. For preview envs that need the IMS API, create a staging IMS API deployment with Railway/Cloud Run.

---

## 6. CI Pipeline (GitHub Actions)

The existing CI is at `.github/workflows/ci.yml` but only checks TODO count. **Recommended additions:**

```yaml
# .github/workflows/ci.yml — add these jobs:

lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
      with: { version: 11 }
    - uses: actions/setup-node@v4
      with: { node-version: 20, cache: 'pnpm' }
    - run: pnpm install --frozen-lockfile
    - run: pnpm lint

type-check:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
      with: { version: 11 }
    - uses: actions/setup-node@v4
      with: { node-version: 20, cache: 'pnpm' }
    - run: pnpm install --frozen-lockfile
    - run: pnpm type-check

test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
      with: { version: 11 }
    - uses: actions/setup-node@v4
      with: { node-version: 20, cache: 'pnpm' }
    - run: pnpm install --frozen-lockfile
    - run: pnpm test
```

Add these jobs to `.github/workflows/ci.yml` after the existing `todo-check` job.

---

## 7. IMS API (NestJS) deployment

This does NOT go on Vercel. Use any Docker-friendly platform:

| Platform | Notes |
|----------|-------|
| **Railway** | Easiest — import repo, set root = `apps/ims/api`, Dockerfile auto-detected |
| **Google Cloud Run** | Build from Dockerfile, set concurrency = 1, min-instances = 1 |
| **Fly.io** | Use `fly launch` from `apps/ims/api` |
| **Render** | Web Service → Docker → root = `apps/ims/api` |

**Required env vars for IMS API:**

| Variable | Source |
|----------|--------|
| `SUPABASE_URL` | Same as `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as above |
| `DATABASE_URL` | Direct Postgres connection string (Supabase → Settings → Database → Connection string) |
| `REDIS_URL` | Redis provider (Upstash, Redis Cloud, or Railway Redis plugin) |
| `PORT` | `3001` |

---

## 8. Build troubleshooting

| Symptom | Fix |
|---------|-----|
| `Module not found: @synculariti/xxx` | Add it to `transpilePackages` in `next.config.ts` (all 3 apps already have this) |
| `Build fails with "Package not found"` | Ensure `pnpm-lock.yaml` is committed. Run `pnpm install` locally first. |
| `Supabase client errors during build` | The client has a build-time mock fallback — this should be silent. Check `packages/shared-supabase/src/client.ts` |
| `next-intl i18n not found` | Ensure `messages/` directory exists at app root with `en.json`, `sk.json` etc. |
| `Sharp` warnings | Vercel handles this automatically. Ignore. |

---

## 9. Quick reference cheat-sheet

```bash
# One-time: install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Link each project
cd apps/web && vercel link --project synculariti-web
cd apps/ET && vercel link --project synculariti-et
cd apps/ims/web && vercel link --project synculariti-ims

# Pull env vars (after linking)
vercel env pull

# Deploy a preview
cd apps/web && vercel
```
