#!/bin/bash
# ===================================================================
# Apply Unified Migration to Supabase
# Usage: ./scripts/apply-migration.sh <SUPABASE_DB_URL>
#
# The DB URL can be found in Supabase Dashboard -> Database -> Connection
# Format: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
# ===================================================================

set -euo pipefail

DB_URL="${1:-}"

if [ -z "$DB_URL" ]; then
  echo "Usage: $0 <SUPABASE_DB_URL>"
  echo ""
  echo "Example:"
  echo "  $0 'postgresql://postgres:xxxxx@db.aelonqxdhzfafzrfrvtl.supabase.co:5432/postgres'"
  echo ""
  echo "Get the DB URL from: Supabase Dashboard -> Database -> Connection -> Direct Connection"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MIGRATION_FILE="$SCRIPT_DIR/supabase/migrations/20260611120000_unified_schema.sql"

echo "=== Synculariti Core: Unified Migration ==="
echo "DB URL: ${DB_URL//:[^:@]*@/:****@}"
echo "Migration: $MIGRATION_FILE"
echo ""

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "ERROR: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "Dropping old IMS schema and ET-prefixed tables..."
psql "$DB_URL" -c "DROP SCHEMA IF EXISTS ims CASCADE;" 2>/dev/null || true
psql "$DB_URL" -c "DROP TABLE IF EXISTS public.et_inventory_ledger CASCADE;" 2>/dev/null || true
psql "$DB_URL" -c "DROP TABLE IF EXISTS public.et_purchase_orders CASCADE;" 2>/dev/null || true
psql "$DB_URL" -c "DROP TABLE IF EXISTS public.et_po_line_items CASCADE;" 2>/dev/null || true

echo "Applying unified schema..."
psql "$DB_URL" -f "$MIGRATION_FILE"

echo ""
echo "=== Migration applied successfully! ==="
echo ""
echo "Next steps:"
echo "  1. Delete old migration files: rm supabase/migrations/20260609100555_ims_schema.sql supabase/migrations/20260609100724_et_schema.sql"
echo "  2. Generate TypeScript types: pnpm supabase gen types typescript --project-id aelonqxdhzfafzrfrvtl --schema public > packages/shared-supabase/src/types.ts"
echo "  3. Build and verify: pnpm build"
