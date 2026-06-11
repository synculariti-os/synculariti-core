-- Add columns to pos_transaction_staging that existed in original ET schema
ALTER TABLE IF EXISTS public.pos_transaction_staging
  ADD COLUMN IF NOT EXISTS theoretical_grams JSONB;
ALTER TABLE IF EXISTS public.pos_transaction_staging
  ADD COLUMN IF NOT EXISTS recipe_found BOOLEAN NOT NULL DEFAULT false;

-- Add email and invited_at to tenant_members (missing from unified schema)
ALTER TABLE IF EXISTS public.tenant_members
  ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
ALTER TABLE IF EXISTS public.tenant_members
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;

-- Add handle to franchise_groups (existed in original ET tenants table)
ALTER TABLE IF EXISTS public.franchise_groups
  ADD COLUMN IF NOT EXISTS handle TEXT;

-- Add ET columns to transactions table (lost during unification)
ALTER TABLE IF EXISTS public.transactions
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE IF EXISTS public.transactions
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.restaurants(id);
ALTER TABLE IF EXISTS public.transactions
  ADD COLUMN IF NOT EXISTS who TEXT;
ALTER TABLE IF EXISTS public.transactions
  ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE IF EXISTS public.transactions
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'EUR';
ALTER TABLE IF EXISTS public.transactions
  ADD COLUMN IF NOT EXISTS vat_detail JSONB;

-- Add ET columns to item_categories (lost during unification)
ALTER TABLE IF EXISTS public.item_categories
  ADD COLUMN IF NOT EXISTS item_type TEXT;
ALTER TABLE IF EXISTS public.item_categories
  ADD COLUMN IF NOT EXISTS category_group TEXT;

-- Add ET columns to items (lost during unification)
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'good';
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS purchasing_uom TEXT NOT NULL DEFAULT 'kg';
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS inventory_uom TEXT NOT NULL DEFAULT 'kg';
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS recipe_uom TEXT;
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS inv_to_recipe_ratio NUMERIC(10, 4) NOT NULL DEFAULT 1;
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS allergen_info TEXT;
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS supplier_sku TEXT;
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(10, 2);
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id);

-- Add idempotency_key to whatsapp_outbox
ALTER TABLE IF EXISTS public.whatsapp_outbox
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
CREATE INDEX IF NOT EXISTS idx_whatsapp_outbox_idempotency ON public.whatsapp_outbox(idempotency_key);

-- Add ET columns to receipt_items (lost during unification)
ALTER TABLE IF EXISTS public.receipt_items
  ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES public.transactions(id);
ALTER TABLE IF EXISTS public.receipt_items
  ADD COLUMN IF NOT EXISTS item_name TEXT;
ALTER TABLE IF EXISTS public.receipt_items
  ADD COLUMN IF NOT EXISTS vat_rate NUMERIC(5, 2);
ALTER TABLE IF EXISTS public.receipt_items
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE IF EXISTS public.receipt_items
  ADD COLUMN IF NOT EXISTS source_id TEXT NOT NULL DEFAULT '';

-- Add ET columns to system_telemetry
ALTER TABLE IF EXISTS public.system_telemetry
  ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE IF EXISTS public.system_telemetry
  ADD COLUMN IF NOT EXISTS component TEXT;
ALTER TABLE IF EXISTS public.system_telemetry
  ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE IF EXISTS public.system_telemetry
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add total_amount alias to purchases (ET column name)
ALTER TABLE IF EXISTS public.purchases
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12, 2) GENERATED ALWAYS AS (amount) STORED;
ALTER TABLE IF EXISTS public.purchases
  ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Add ET purchase orders table (was in ET schema but not unified)
CREATE TABLE IF NOT EXISTS public.et_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  location_id UUID REFERENCES public.restaurants(id),
  vendor_id UUID,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'RECEIVED', 'CANCELLED')),
  order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (char_length(currency) = 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add ET inventory ledger table and current_inventory view
CREATE TABLE IF NOT EXISTS public.et_inventory_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  location_id UUID REFERENCES public.restaurants(id),
  item_id UUID NOT NULL REFERENCES public.items(id),
  change_amount NUMERIC NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('RECEIPT', 'SALE', 'WASTE', 'ADJUSTMENT', 'TRANSFER')),
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE VIEW public.current_inventory AS
SELECT
  tenant_id,
  location_id,
  item_id,
  sum(change_amount) AS stock_level,
  max(created_at) AS last_movement
FROM public.et_inventory_ledger
GROUP BY tenant_id, location_id, item_id;

-- Add ET columns to items (inventory_items view)
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'RAW' CHECK (type IN ('RAW', 'PREP', 'SERVICE'));
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS purchasing_uom TEXT NOT NULL DEFAULT 'kg';
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS inventory_uom TEXT NOT NULL DEFAULT 'kg';
ALTER TABLE IF EXISTS public.items
  ADD COLUMN IF NOT EXISTS conversion_factor NUMERIC NOT NULL DEFAULT 1 CHECK (conversion_factor > 0);

-- Add recipient_phone alias to whatsapp_outbox (for OutboxRecord compatibility)
ALTER TABLE IF EXISTS public.whatsapp_outbox
  ADD COLUMN IF NOT EXISTS recipient_phone TEXT GENERATED ALWAYS AS (to_number) STORED;

-- Add whatsapp_message_id to whatsapp_outbox
ALTER TABLE IF EXISTS public.whatsapp_outbox
  ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT;

-- Add categories to franchise_groups (from ET tenants)
ALTER TABLE IF EXISTS public.franchise_groups
  ADD COLUMN IF NOT EXISTS categories JSONB NOT NULL DEFAULT '[]';

-- Add address to restaurants (ET location column)
ALTER TABLE IF EXISTS public.restaurants
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Add cached_ingredients table (from ET schema)
CREATE TABLE IF NOT EXISTS public.cached_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL,
  canonical_name TEXT NOT NULL,
  category TEXT,
  base_unit TEXT,
  perishability_days INTEGER,
  current_stock_grams NUMERIC,
  cost_per_gram NUMERIC,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, ingredient_id)
);

-- Fix cached_ingredients columns (unified schema has wrong columns)
ALTER TABLE IF EXISTS public.cached_ingredients
  ADD COLUMN IF NOT EXISTS ingredient_id TEXT;
ALTER TABLE IF EXISTS public.cached_ingredients
  ADD COLUMN IF NOT EXISTS canonical_name TEXT;
ALTER TABLE IF EXISTS public.cached_ingredients
  ADD COLUMN IF NOT EXISTS base_unit TEXT;
ALTER TABLE IF EXISTS public.cached_ingredients
  ADD COLUMN IF NOT EXISTS perishability_days INTEGER;
ALTER TABLE IF EXISTS public.cached_ingredients
  ADD COLUMN IF NOT EXISTS current_stock_grams NUMERIC;
ALTER TABLE IF EXISTS public.cached_ingredients
  ADD COLUMN IF NOT EXISTS cost_per_gram NUMERIC;
ALTER TABLE IF EXISTS public.cached_ingredients
  ADD COLUMN IF NOT EXISTS fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
-- Remove external_id if it exists (from unified schema)
-- Note: Can't easily drop columns in ALTER, but the type generator should handle both

-- Fix cached_recipes columns (unified schema has wrong columns)
ALTER TABLE IF EXISTS public.cached_recipes
  ADD COLUMN IF NOT EXISTS menu_item_id TEXT;
ALTER TABLE IF EXISTS public.cached_recipes
  ADD COLUMN IF NOT EXISTS menu_item_name TEXT;
ALTER TABLE IF EXISTS public.cached_recipes
  ADD COLUMN IF NOT EXISTS selling_price NUMERIC;
ALTER TABLE IF EXISTS public.cached_recipes
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE IF EXISTS public.cached_recipes
  ADD COLUMN IF NOT EXISTS ingredients JSONB;
ALTER TABLE IF EXISTS public.cached_recipes
  ADD COLUMN IF NOT EXISTS total_ingredient_cost NUMERIC;
ALTER TABLE IF EXISTS public.cached_recipes
  ADD COLUMN IF NOT EXISTS food_cost_pct NUMERIC;

-- Fix pos_batch_uploads columns (missing ET columns)
ALTER TABLE IF EXISTS public.pos_batch_uploads
  ADD COLUMN IF NOT EXISTS batch_id TEXT;
ALTER TABLE IF EXISTS public.pos_batch_uploads
  ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE IF EXISTS public.pos_batch_uploads
  ADD COLUMN IF NOT EXISTS total_receipts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS public.pos_batch_uploads
  ADD COLUMN IF NOT EXISTS approved_rows INTEGER NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS public.pos_batch_uploads
  ADD COLUMN IF NOT EXISTS quarantined_rows INTEGER NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS public.pos_batch_uploads
  ADD COLUMN IF NOT EXISTS period_start DATE;
ALTER TABLE IF EXISTS public.pos_batch_uploads
  ADD COLUMN IF NOT EXISTS period_end DATE;
ALTER TABLE IF EXISTS public.pos_batch_uploads
  ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.pos_batch_uploads
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- Recreate backward-compat views to pick up the new column
CREATE OR REPLACE VIEW public.tenants AS SELECT * FROM public.franchise_groups;
CREATE OR REPLACE VIEW public.locations AS SELECT * FROM public.restaurants;
