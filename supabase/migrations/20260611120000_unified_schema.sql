-- ===================================================================
-- Synculariti Core — UNIFIED SCHEMA
-- Merges IMS (PrasanthSynculariti) + ET (synculariti-ET)
-- Canonical naming: franchise_groups/restaurants (IMS)
-- Views: tenants/locations (ET) for backward compat
-- ===================================================================

BEGIN;

-- ===================================================================
-- 1. EXTENSIONS
-- ===================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

-- ===================================================================
-- 2. HELPER FUNCTIONS (no table references)
-- ===================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.safe_cast_uuid(p_val TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN p_val::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.safe_cast_user_uuid(p_val TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN p_val::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_tenant_context(p_franchise_group_id UUID, p_restaurant_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.franchise_group_id', p_franchise_group_id::TEXT, true);
  PERFORM set_config('app.restaurant_id',      p_restaurant_id::TEXT,      true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_my_tenant()
RETURNS UUID AS $$
DECLARE
  v_val TEXT;
BEGIN
  v_val := current_setting('app.franchise_group_id', true);
  IF v_val IS NULL OR v_val = '' THEN
    RETURN NULL;
  END IF;
  RETURN v_val::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.switch_tenant(p_tenant_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.franchise_group_id', p_tenant_id::TEXT, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- 3. CORE TENANT HIERARCHY
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.franchise_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ===================================================================
-- 4. USERS & AUTH
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ET-style app_users (legacy wrapper over users)
CREATE TABLE IF NOT EXISTS public.app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  permissions JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- ET-style tenant_members
CREATE TABLE IF NOT EXISTS public.tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- IMS RBAC
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  module TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_restaurant_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 5. ITEMS & CATEGORIES
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.item_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  category_id UUID NOT NULL REFERENCES public.item_categories(id),
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  unit TEXT NOT NULL DEFAULT 'kg',
  unit_price NUMERIC(10, 2),
  par_level NUMERIC(10, 3) DEFAULT 0,
  reorder_point NUMERIC(10, 3) DEFAULT 0,
  stock_on_hand NUMERIC(10, 3) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.item_restaurant_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  par_level NUMERIC(10, 3),
  reorder_point NUMERIC(10, 3),
  stock_on_hand NUMERIC(10, 3),
  is_active BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(item_id, restaurant_id)
);

CREATE TABLE IF NOT EXISTS public.uom_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  from_unit TEXT NOT NULL,
  to_unit TEXT NOT NULL,
  factor NUMERIC(10, 6) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, from_unit, to_unit)
);

-- ===================================================================
-- 6. VENDORS & PROCUREMENT
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  restaurant_id UUID REFERENCES public.restaurants(id),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  po_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE,
  delivered_date DATE,
  notes TEXT,
  total_amount NUMERIC(12, 2) DEFAULT 0,
  invoice_ref TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.po_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id),
  quantity_ordered NUMERIC(10, 3) NOT NULL,
  quantity_received NUMERIC(10, 3) DEFAULT 0,
  unit_cost NUMERIC(10, 2) NOT NULL,
  total_cost NUMERIC(12, 2) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 7. INVENTORY
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.inventory_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  item_id UUID NOT NULL REFERENCES public.items(id),
  batch_ref TEXT,
  quantity NUMERIC(10, 3) NOT NULL,
  unit_cost NUMERIC(10, 2) NOT NULL,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  item_id UUID NOT NULL REFERENCES public.items(id),
  entry_type TEXT NOT NULL,
  quantity NUMERIC(10, 3) NOT NULL,
  unit_cost NUMERIC(10, 2),
  total_cost NUMERIC(12, 2),
  reference_type TEXT,
  reference_id UUID,
  note TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  to_restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  item_id UUID NOT NULL REFERENCES public.items(id),
  quantity NUMERIC(10, 3) NOT NULL,
  transferred_by UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_count_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  counted_by UUID REFERENCES public.users(id),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_count_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.inventory_count_batches(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id),
  expected_qty NUMERIC(10, 3) NOT NULL DEFAULT 0,
  actual_qty NUMERIC(10, 3) NOT NULL DEFAULT 0,
  variance NUMERIC(10, 3) GENERATED ALWAYS AS (actual_qty - expected_qty) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.waste_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  item_id UUID NOT NULL REFERENCES public.items(id),
  quantity NUMERIC(10, 3) NOT NULL,
  reason TEXT NOT NULL,
  recorded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prep_production_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  recipe_id UUID NOT NULL,
  quantity_produced NUMERIC(10, 3) NOT NULL,
  produced_by UUID REFERENCES public.users(id),
  notes TEXT,
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 8. RECIPES & MENU
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  name TEXT NOT NULL,
  description TEXT,
  yield_qty NUMERIC(10, 3) NOT NULL DEFAULT 1,
  yield_unit TEXT NOT NULL DEFAULT 'portion',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id),
  quantity NUMERIC(10, 3) NOT NULL,
  unit TEXT NOT NULL,
  waste_percent NUMERIC(5, 2) DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_item_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id),
  menu_item_name TEXT NOT NULL,
  menu_item_sku TEXT,
  price NUMERIC(10, 2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(restaurant_id, menu_item_name)
);

CREATE TABLE IF NOT EXISTS public.cached_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  ingredients JSONB DEFAULT '[]'::JSONB,
  instructions TEXT,
  source TEXT DEFAULT 'external',
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, external_id)
);

CREATE TABLE IF NOT EXISTS public.cached_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, external_id)
);

-- ===================================================================
-- 9. SALES & POS
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.sales_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  filename TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  processed_rows INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  errors JSONB DEFAULT '[]'::JSONB,
  imported_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales_import_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.sales_import_batches(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category_name TEXT,
  quantity NUMERIC(10, 3) NOT NULL,
  unit TEXT,
  total_price NUMERIC(10, 2),
  sale_date DATE NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pos_raw_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  filename TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  imported_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  error_log JSONB DEFAULT '[]'::JSONB,
  imported_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pos_batch_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'STAGED',
  total_transactions INTEGER NOT NULL DEFAULT 0,
  processed_transactions INTEGER NOT NULL DEFAULT 0,
  failed_transactions INTEGER NOT NULL DEFAULT 0,
  error_details JSONB DEFAULT '[]'::JSONB,
  uploaded_by UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pos_transaction_staging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.pos_batch_uploads(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  transaction_date DATE NOT NULL,
  description TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  category TEXT,
  external_id TEXT,
  raw_data JSONB,
  flag TEXT NOT NULL DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pos_data_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  gap_start DATE NOT NULL,
  gap_end DATE NOT NULL,
  reason TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 10. ET FINANCE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  restaurant_id UUID REFERENCES public.restaurants(id),
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  category TEXT,
  receipt_type TEXT DEFAULT 'manual',
  receipt_url TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor_name TEXT,
  notes TEXT,
  is_quarantined BOOLEAN NOT NULL DEFAULT false,
  quarantine_status TEXT DEFAULT 'PENDING',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.purchase_anomaly_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'OPEN',
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pending_text_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  outbox_id UUID NOT NULL,
  contact_phone TEXT NOT NULL,
  followup_type TEXT NOT NULL DEFAULT 'APPROVAL',
  context JSONB DEFAULT '{}'::JSONB,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  account_id UUID REFERENCES public.chart_of_accounts(id),
  amount NUMERIC(12, 2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'DEBIT',
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_type TEXT,
  reference_id UUID,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  invoice_number TEXT NOT NULL,
  vendor_name TEXT,
  total_amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  invoice_date DATE NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 3) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 3) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL,
  category TEXT,
  receipt_type TEXT DEFAULT 'manual',
  receipt_image_url TEXT,
  raw_ocr_data JSONB,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 11. WHATSAPP & COMMUNICATION
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.whatsapp_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  from_number TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'TEXT',
  body TEXT,
  media_url TEXT,
  raw_payload JSONB,
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  is_processed BOOLEAN NOT NULL DEFAULT false,
  direction TEXT NOT NULL DEFAULT 'INBOUND',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  to_number TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'TEXT',
  body TEXT,
  media_url TEXT,
  template_name TEXT,
  template_data JSONB,
  status TEXT NOT NULL DEFAULT 'PENDING',
  priority INTEGER NOT NULL DEFAULT 0,
  payload JSONB,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 12. INTEGRATIONS & INFRASTRUCTURE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.graph_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  operation TEXT NOT NULL DEFAULT 'UPSERT',
  status TEXT NOT NULL DEFAULT 'PENDING',
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  endpoint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INTEGER NOT NULL DEFAULT 0,
  max_requests INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 13. SNAPSHOTS & AUDIT
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.daily_inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  item_id UUID NOT NULL REFERENCES public.items(id),
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity_on_hand NUMERIC(10, 3) NOT NULL,
  unit_cost NUMERIC(10, 2),
  total_value NUMERIC(12, 2) GENERATED ALWAYS AS (quantity_on_hand * unit_cost) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  restaurant_id UUID REFERENCES public.restaurants(id),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  flag_key TEXT NOT NULL,
  flag_value JSONB NOT NULL DEFAULT 'false'::JSONB,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, flag_key)
);

-- ===================================================================
-- 14. TABLE-REFERENCING FUNCTIONS
-- (created after all tables exist)
-- ===================================================================

-- Drop existing functions before recreating (handles return type changes)
DROP FUNCTION IF EXISTS public.get_my_available_tenants(UUID);
DROP FUNCTION IF EXISTS public.get_my_available_tenants();
DROP FUNCTION IF EXISTS public.get_tenant_bundle(UUID);
DROP FUNCTION IF EXISTS public.get_tenant_bundle();
DROP FUNCTION IF EXISTS public.handle_new_user(UUID);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.add_transaction_v3(JSONB);
DROP FUNCTION IF EXISTS public.add_transaction_v3();
DROP FUNCTION IF EXISTS public.receive_purchase_order_v1(UUID);
DROP FUNCTION IF EXISTS public.receive_purchase_order_v1();
DROP FUNCTION IF EXISTS public.upsert_app_user_v1(UUID, UUID, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.upsert_app_user_v1();
DROP FUNCTION IF EXISTS public.approve_purchase_v1(UUID, UUID);
DROP FUNCTION IF EXISTS public.approve_purchase_v1();
DROP FUNCTION IF EXISTS public.reject_purchase_v1(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS public.reject_purchase_v1(UUID, UUID);
DROP FUNCTION IF EXISTS public.reject_purchase_v1();
DROP FUNCTION IF EXISTS public.process_batch_v1(UUID);
DROP FUNCTION IF EXISTS public.process_batch_v1();

CREATE OR REPLACE FUNCTION public.get_my_available_tenants()
RETURNS SETOF public.franchise_groups AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.franchise_groups;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_tenant_bundle()
RETURNS JSONB AS $$
DECLARE
  v_tenant_id UUID;
  v_result JSONB;
BEGIN
  v_tenant_id := public.get_my_tenant();
  IF v_tenant_id IS NULL THEN RETURN NULL; END IF;

  SELECT jsonb_build_object(
    'tenant', row_to_json(fg.*)::JSONB,
    'locations', COALESCE((SELECT jsonb_agg(row_to_json(r.*)::JSONB) FROM public.restaurants r WHERE r.franchise_group_id = fg.id AND r.deleted_at IS NULL), '[]'::JSONB),
    'members', '[]'::JSONB,
    'chart_of_accounts', COALESCE((SELECT jsonb_agg(row_to_json(coa.*)::JSONB) FROM public.chart_of_accounts coa WHERE coa.tenant_id = fg.id), '[]'::JSONB),
    'inventory_categories', COALESCE((SELECT jsonb_agg(row_to_json(ic.*)::JSONB) FROM public.item_categories ic WHERE ic.tenant_id = fg.id AND ic.deleted_at IS NULL), '[]'::JSONB),
    'inventory_items', COALESCE((SELECT jsonb_agg(row_to_json(i.*)::JSONB) FROM public.items i JOIN public.item_categories ic ON ic.id = i.category_id WHERE ic.tenant_id = fg.id AND i.deleted_at IS NULL), '[]'::JSONB)
  ) INTO v_result
  FROM public.franchise_groups fg WHERE fg.id = v_tenant_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ET-style add_transaction
CREATE OR REPLACE FUNCTION public.add_transaction_v3(p_transaction JSONB)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.transactions (
    tenant_id, account_id, amount, type, description,
    transaction_date, reference_type, reference_id
  ) VALUES (
    (p_transaction->>'tenant_id')::UUID,
    (p_transaction->>'account_id')::UUID,
    (p_transaction->>'amount')::NUMERIC,
    COALESCE(p_transaction->>'type', 'DEBIT'),
    p_transaction->>'description',
    COALESCE((p_transaction->>'transaction_date')::DATE, CURRENT_DATE),
    p_transaction->>'reference_type',
    (p_transaction->>'reference_id')::UUID
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- IMS-style receive_purchase_order
CREATE OR REPLACE FUNCTION public.receive_purchase_order_v1(p_po_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.purchase_orders
  SET status = 'received', delivered_date = CURRENT_DATE
  WHERE id = p_po_id AND status = 'approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ET-style upsert_app_user
CREATE OR REPLACE FUNCTION public.upsert_app_user_v1(p_tenant_id UUID, p_user_id UUID, p_role TEXT DEFAULT 'member', p_permissions JSONB DEFAULT '[]'::JSONB)
RETURNS void AS $$
BEGIN
  INSERT INTO public.app_users (tenant_id, user_id, role, permissions)
  VALUES (p_tenant_id, p_user_id, p_role, p_permissions)
  ON CONFLICT (tenant_id, user_id)
  DO UPDATE SET role = p_role, permissions = p_permissions, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ET-style approve_purchase (from anomaly queue)
CREATE OR REPLACE FUNCTION public.approve_purchase_v1(p_purchase_id UUID, p_queue_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.purchases SET quarantine_status = 'APPROVED', is_quarantined = false WHERE id = p_purchase_id;
  UPDATE public.purchase_anomaly_queue SET status = 'DISMISSED', reviewed_at = NOW() WHERE id = p_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ET-style reject_purchase (from anomaly queue)
CREATE OR REPLACE FUNCTION public.reject_purchase_v1(p_purchase_id UUID, p_queue_id UUID, p_rejection_note TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  UPDATE public.purchases SET quarantine_status = 'REJECTED' WHERE id = p_purchase_id;
  UPDATE public.purchase_anomaly_queue SET status = 'ESCALATED', reviewed_at = NOW() WHERE id = p_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ET-style process_batch (POS)
CREATE OR REPLACE FUNCTION public.process_batch_v1(p_batch_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.pos_batch_uploads
  SET status = 'COMPLETED', processed_transactions = (
    SELECT COUNT(*) FROM public.pos_transaction_staging WHERE batch_id = p_batch_id
  )
  WHERE id = p_batch_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- 15. VIEWS (backward compat for ET)
-- ===================================================================

CREATE OR REPLACE VIEW public.tenants AS SELECT * FROM public.franchise_groups;
CREATE OR REPLACE VIEW public.locations AS SELECT * FROM public.restaurants;
CREATE OR REPLACE VIEW public.inventory_categories AS SELECT * FROM public.item_categories;
CREATE OR REPLACE VIEW public.inventory_items AS SELECT * FROM public.items;

-- ===================================================================
-- 16. TRIGGERS
-- ===================================================================

-- Auth trigger: sync auth.users → public.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers for all tables that have updated_at
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename NOT IN ('audit_log', 'daily_inventory_snapshots', 'inventory_ledger', 'inventory_transfers', 'invoice_items', 'outbox_events', 'po_line_items', 'rate_limits', 'receipt_items', 'sales_import_rows', 'system_telemetry')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;
      CREATE TRIGGER trg_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    ', rec.tablename, rec.tablename, rec.tablename, rec.tablename);
  END LOOP;
END;
$$;

-- ===================================================================
-- 17. RLS & GRANTS
-- ===================================================================

-- Enable RLS on all public tables
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', rec.tablename);
  END LOOP;
END;
$$;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Supabase native replication (for Realtime) auto-publishes new tables

-- ===================================================================
-- 18. SEED DATA
-- ===================================================================

-- Default IMS permissions
INSERT INTO public.permissions (code, name, description, module) VALUES
  ('INVENTORY.READ', 'Read Inventory', 'View inventory items and stock', 'INVENTORY'),
  ('INVENTORY.WRITE', 'Write Inventory', 'Create and edit inventory items', 'INVENTORY'),
  ('INVENTORY.COUNT', 'Count Inventory', 'Perform physical inventory counts', 'INVENTORY'),
  ('PROCUREMENT.READ', 'Read Procurement', 'View vendors and purchase orders', 'PROCUREMENT'),
  ('PROCUREMENT.WRITE', 'Write Procurement', 'Create and edit purchase orders', 'PROCUREMENT'),
  ('PROCUREMENT.APPROVE', 'Approve Procurement', 'Approve purchase orders', 'PROCUREMENT'),
  ('RECIPE.READ', 'Read Recipes', 'View recipes and BOM', 'RECIPE'),
  ('RECIPE.WRITE', 'Write Recipes', 'Create and edit recipes', 'RECIPE'),
  ('SALES.IMPORT', 'Import Sales', 'Upload and process sales files', 'SALES'),
  ('SALES.READ', 'Read Sales', 'View sales data', 'SALES'),
  ('REPORTING.READ', 'Read Reports', 'View reports and analytics', 'REPORTING'),
  ('ADMIN.TENANTS', 'Manage Tenants', 'Manage franchise groups and restaurants', 'ADMIN'),
  ('ADMIN.USERS', 'Manage Users', 'Manage user accounts and roles', 'ADMIN'),
  ('ADMIN.PERMISSIONS', 'Manage Permissions', 'Configure roles and permissions', 'ADMIN'),
  ('FINANCE.READ', 'Read Finance', 'View financial transactions', 'FINANCE'),
  ('FINANCE.WRITE', 'Write Finance', 'Create and edit transactions', 'FINANCE'),
  ('WHATSAPP.READ', 'Read WhatsApp', 'View WhatsApp messages', 'WHATSAPP'),
  ('WHATSAPP.WRITE', 'Write WhatsApp', 'Send WhatsApp messages', 'WHATSAPP')
ON CONFLICT (code) DO NOTHING;

-- Default roles
INSERT INTO public.roles (name, description, is_system) VALUES
  ('Franchise Owner', 'Full access across the franchise group', true),
  ('Restaurant Manager', 'Manage a single restaurant', true),
  ('Chef', 'Recipe and prep management', true),
  ('Staff', 'Basic read-only access', true),
  ('Accountant', 'Financial management', true)
ON CONFLICT DO NOTHING;

-- Default role-permission mappings
WITH role_data AS (
  SELECT id, name FROM public.roles WHERE is_system = true
), perm_data AS (
  SELECT id, code FROM public.permissions
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM role_data r, perm_data p
WHERE r.name = 'Franchise Owner'
  AND p.code IN ('INVENTORY.READ','INVENTORY.WRITE','INVENTORY.COUNT','PROCUREMENT.READ','PROCUREMENT.WRITE','PROCUREMENT.APPROVE','RECIPE.READ','RECIPE.WRITE','SALES.IMPORT','SALES.READ','REPORTING.READ','ADMIN.TENANTS','ADMIN.USERS','ADMIN.PERMISSIONS','FINANCE.READ','FINANCE.WRITE','WHATSAPP.READ','WHATSAPP.WRITE')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM role_data r, perm_data p
WHERE r.name = 'Restaurant Manager'
  AND p.code IN ('INVENTORY.READ','INVENTORY.WRITE','INVENTORY.COUNT','PROCUREMENT.READ','PROCUREMENT.WRITE','RECIPE.READ','SALES.IMPORT','SALES.READ','REPORTING.READ','FINANCE.READ')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM role_data r, perm_data p
WHERE r.name = 'Chef'
  AND p.code IN ('INVENTORY.READ','RECIPE.READ','RECIPE.WRITE','SALES.READ')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM role_data r, perm_data p
WHERE r.name = 'Staff'
  AND p.code IN ('INVENTORY.READ','RECIPE.READ')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM role_data r, perm_data p
WHERE r.name = 'Accountant'
  AND p.code IN ('FINANCE.READ','FINANCE.WRITE','REPORTING.READ','PROCUREMENT.READ')
ON CONFLICT DO NOTHING;

-- Demo franchise group (only if no groups exist)
INSERT INTO public.franchise_groups (id, name, pin)
SELECT '00000000-0000-0000-0000-000000000001', 'Demo Group', '1234'
WHERE NOT EXISTS (SELECT 1 FROM public.franchise_groups);

-- Demo restaurant
INSERT INTO public.restaurants (id, franchise_group_id, name, timezone)
SELECT '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Demo Restaurant', 'Europe/Bratislava'
WHERE NOT EXISTS (SELECT 1 FROM public.restaurants);

-- Default chart of accounts for demo tenant
INSERT INTO public.chart_of_accounts (tenant_id, code, name, type)
SELECT '00000000-0000-0000-0000-000000000001', code, name, type
FROM (VALUES
  ('1000', 'Cash', 'ASSET'),
  ('1100', 'Bank Account', 'ASSET'),
  ('2000', 'Accounts Payable', 'LIABILITY'),
  ('3000', 'Owner Equity', 'EQUITY'),
  ('4000', 'Food Revenue', 'INCOME'),
  ('5000', 'Food Cost', 'EXPENSE'),
  ('5100', 'Labor Cost', 'EXPENSE'),
  ('5200', 'Operating Expense', 'EXPENSE')
) AS t(code, name, type)
WHERE NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE tenant_id = '00000000-0000-0000-0000-000000000001');

COMMIT;
