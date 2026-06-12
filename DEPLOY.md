# Deployment Guide — Synculariti Core

## Architecture (post-consolidation)

A single NestJS process serves both the REST API and the static Next.js SPA.

| Component | Role | Build output |
|-----------|------|-------------|
| `apps/ims/api` (NestJS) | HTTP server, API routes, serves SPA | `dist/` (SWC) |
| `apps/web` (Next.js) | Build-time static export → `out/` | Static HTML/JS/CSS |

You can choose one of three deployment approaches:

1. **Railway + Vercel** – API on Railway (Docker) and static SPA on Vercel.
2. **Single Docker** – both API and SPA served from one Docker image (Railway, Render, Fly.io, etc.).
3. **Legacy Vercel** – historical multi‑app setup (kept for reference).

All steps are CLI‑driven.



---

## 1. Railway Deploy (recommended)

Railway auto-detects the root `Dockerfile`. No `railway.json` needed — one service, one domain.

### 1a. One-click setup

```bash
# 1. Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# 2. Login
railway login

# 3. From repo root
railway init

# 4. Link (creates a Railway project)
railway link
```

### 1b. Environment variables

Set these in Railway Dashboard → your project → Variables.

| Variable | Source |
|----------|--------|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` key |
| `DATABASE_URL` | Supabase Dashboard → Settings → Database → Connection string (with `?pgbouncer=true`) |
| `REDIS_URL` | Railway Redis plugin (or Upstash) |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → Anon key |
| `NEXT_PUBLIC_API_URL` | Leave blank (same-origin) |
| `PORT` | `3001` (Railway sets `PORT` automatically) |

### 1c. Deploy

```bash
railway up
# Or: connect GitHub repo → Railway auto-deploys on push
```

### 1d. Domains

Railway → your project → Settings → Domains → Generate Domain or add custom.

| Environment | Domain |
|-------------|--------|
| Production | `synculariti.railway.app` (or custom `app.synculariti.com`) |
| Preview | Railway generates `*.up.railway.app` per PR |

### 1e. Preview (PR) deployments

Railway supports PR environments. Enable in Project Settings → PR Deployments.

---

## 2. Vercel Deploy (SPA)

The static Next.js SPA (`apps/web`) can be deployed directly to Vercel using the Vercel CLI. The API remains hosted on Railway (or any Docker platform).

### 2a. Install Vercel CLI
```bash
npm i -g vercel
```

### 2b. Login & link project
```bash
# From the repo root
vercel login          # opens browser for auth

# Navigate to the SPA directory and link/create a Vercel project
cd apps/web
vercel link          # follow prompts to create a Vercel project (e.g., synculariti-spa)
```

### 2c. Set client‑side environment variables (Vercel stores them securely)
```bash
# Run these inside the `apps/web` directory
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Point the SPA to the API hosted on Railway (replace with your Railway URL)
vercel env add NEXT_PUBLIC_API_URL production
```

You can also add `development` and `preview` values if you use different URLs for those environments.

### 2d. Deploy the SPA
```bash
# Ensure the SPA build output is up‑to‑date (static export)
cd ../../          # back to repo root
pnpm build --filter=@synculariti/web

# Deploy to Vercel (from the `apps/web` directory)
cd apps/web
vercel --prod
```

Vercel will serve the static `out/` directory. The SPA will make API calls to the URL you set in `NEXT_PUBLIC_API_URL` (your Railway deployment).

### 2e. Preview (PR) deployments on Vercel
Vercel automatically creates preview URLs for each branch/pull request:
```bash
# From any branch, just run:
vercel
```
The preview will inherit the environment variables you set for the `preview` environment.

---

## 3. Manual Docker deploy (any platform)

```bash
# Build
docker build -t synculariti-core:latest .

# Run (with env vars)
docker run -d \
  -p 3001:3001 \
  -e SUPABASE_URL=... \
  -e SUPABASE_SERVICE_ROLE_KEY=... \
  -e DATABASE_URL=... \
  -e REDIS_URL=... \
  synculariti-core:latest
```

---

## 4. Environment Variables Reference

### Required (all deployments)

| Variable | Notes |
|----------|-------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret — do not expose to client |
| `DATABASE_URL` | Direct Postgres connection string (`postgresql://...`) |
| `REDIS_URL` | Redis connection string (`redis://...`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` — needed for client-side Supabase calls |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key — safe for client |

### Optional

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `3001` | Railway sets this automatically |
| `NEXT_PUBLIC_API_URL` | `''` (same-origin) | Override for proxied setups |
| `NODE_ENV` | `production` | |

---

### Loading environment variables from local `.env` files (CLI)

Both Railway and Vercel keep secrets out of the repository. You can populate them from the local `.env` you already have.

#### Railway
```bash
# From the repo root – ensure you are logged in (`railway login`)
# This script reads each KEY=VALUE line and sets it in Railway
while IFS='=' read -r key value; do
  # Skip empty lines and comments
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  railway variables set "$key" "$value"
done < .env
```
Alternatively, add them one‑by‑one:
```bash
railway variables set SUPABASE_URL "$(grep ^SUPABASE_URL .env | cut -d'=' -f2-)"
# repeat for each variable …
```
The values are stored securely in Railway’s dashboard and are injected at runtime.

#### Vercel
```bash
# From the `apps/web` directory (where Vercel project is linked)
while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  # Add to all three environments – adjust as needed
  vercel env add "$key" production <<< "$value"
  vercel env add "$key" preview   <<< "$value"
  vercel env add "$key" development <<< "$value"
done < ../../.env
```
`vercel env add` will prompt for the value; piping with `<<<` feeds it automatically.

> **Important:** Do **not** commit `.env` files. They are already ignored via `.gitignore`.

---


### Required (all deployments)

| Variable | Notes |
|----------|-------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret — do not expose to client |
| `DATABASE_URL` | Direct Postgres connection string (`postgresql://...`) |
| `REDIS_URL` | Redis connection string (`redis://...`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` — needed for client-side Supabase calls |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key — safe for client |

### Optional

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `3001` | Railway sets this automatically |
| `NEXT_PUBLIC_API_URL` | `''` (same-origin) | Override for proxied setups |
| `NODE_ENV` | `production` | |

---

## 5. Build troubleshooting

| Symptom | Fix |
|---------|-----|
| `pnpm install` fails with build scripts blocked | Add `--ignore-scripts` and `pnpm rebuild` for native deps (already in Dockerfile) |
| `sharp` errors during build | Only needed at build-time — not in runtime image. Use `--ignore-scripts` |
| Next.js `out/` not found | Ensure `next.config.ts` has `output: 'export'` and `distDir` is not set |
| API returns 404 for SPA routes | `renderPath: '*'` in `ServeStaticModule` catches all non-API paths |
| Redis `ECONNREFUSED` | Expected if no Redis. Non-blocking — BullMQ queues retry |
| `@swc/core` platform mismatch | Use `node:22-bookworm-slim` (glibc, not musl) in Dockerfile |

---

## 6. Appendix: Historical Vercel setup (pre-consolidation)

*Before the monolith merge, four separate apps were deployed on Vercel + Docker. This section is kept for reference only.*

### Old architecture

| App | Platform | Root dir |
|-----|----------|----------|
| Main web (`@synculariti/web`) | Vercel | `apps/web` |
| Expense Tracker (`@synculariti/et`) | Vercel | `apps/ET` |
| IMS Dashboard (`@synculariti/ims-web`) | Vercel | `apps/ims/web` |
| IMS API (`@synculariti/ims-api`) | Docker/Railway | `apps/ims/api` |

### Vercel project settings (for reference)

Each app was a separate Vercel project with:
- Root directory: `apps/<app>`
- Build command: `cd ../.. && pnpm build --filter=@synculariti/<app>`
- Framework: Next.js
- Node version: 20.x

### Reasoning for the merge

1. Single deploy → single domain → no CORS, no API URL config
2. No Vercel serverless limits (NestJS needs persistent connections)
3. Simpler CI/CD — one build, one push, one service
