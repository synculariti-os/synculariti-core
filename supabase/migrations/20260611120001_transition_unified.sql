-- ===================================================================
-- Synculariti Core — TRANSITION: schema-separated → unified
-- Creates canonical tables in public schema, migrates data from
-- ims schema (IMS) and existing public schema (ET).
-- ===================================================================

BEGIN;

-- ===================================================================
-- 1. HELPER FUNCTIONS
-- ===================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.safe_cast_uuid(p_val TEXT)
RETURNS UUID AS $$ BEGIN RETURN p_val::UUID; EXCEPTION WHEN OTHERS THEN RETURN NULL; END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.safe_cast_user_uuid(p_val TEXT)
RETURNS UUID AS $$ BEGIN RETURN p_val::UUID; EXCEPTION WHEN OTHERS THEN RETURN NULL; END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 2. CANONICAL TABLES
-- ===================================================================

-- franchise_groups
CREATE TABLE IF NOT EXISTS public.franchise_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, pin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
INSERT INTO public.franchise_groups (id, name, created_at, updated_at)
  SELECT id, name, created_at, updated_at FROM public.tenants ON CONFLICT (id) DO NOTHING;
INSERT INTO public.franchise_groups (id, name, created_at, updated_at)
  SELECT id, name, created_at, updated_at FROM ims.franchise_groups ON CONFLICT (id) DO NOTHING;

-- restaurants
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id UUID NOT NULL REFERENCES public.franchise_groups(id),
  name TEXT NOT NULL, timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
INSERT INTO public.restaurants (id, franchise_group_id, name, created_at, updated_at)
  SELECT id, tenant_id, name, COALESCE(created_at,NOW()), COALESCE(updated_at,NOW())
  FROM public.locations ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, franchise_group_id, name, timezone, created_at, updated_at)
  SELECT id, franchise_group_id, name, COALESCE(timezone,'UTC'), created_at, updated_at
  FROM ims.restaurants ON CONFLICT (id) DO NOTHING;

-- users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL, phone_number TEXT, avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
INSERT INTO public.users (id, email, full_name, phone_number, is_active, created_at, updated_at)
  SELECT id, email, full_name, phone_number, COALESCE(active,true), created_at, updated_at
  FROM ims.users ON CONFLICT (id) DO NOTHING;

-- app_users (existing ET, add missing columns)
ALTER TABLE IF EXISTS public.app_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';
ALTER TABLE IF EXISTS public.app_users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::JSONB;
ALTER TABLE IF EXISTS public.app_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- tenant_members (existing ET, add missing columns)
ALTER TABLE IF EXISTS public.tenant_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);
ALTER TABLE IF EXISTS public.tenant_members ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE IF EXISTS public.tenant_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- roles (reuse IMS)
CREATE TABLE IF NOT EXISTS public.roles (LIKE ims.roles INCLUDING ALL);
INSERT INTO public.roles SELECT * FROM ims.roles ON CONFLICT DO NOTHING;
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT false;

-- permissions (reuse IMS)
CREATE TABLE IF NOT EXISTS public.permissions (LIKE ims.permissions INCLUDING ALL);
INSERT INTO public.permissions SELECT * FROM ims.permissions ON CONFLICT DO NOTHING;
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.permissions ADD COLUMN IF NOT EXISTS module TEXT;

-- role_permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (LIKE ims.role_permissions INCLUDING ALL);
INSERT INTO public.role_permissions SELECT * FROM ims.role_permissions ON CONFLICT DO NOTHING;

-- user_restaurant_roles
CREATE TABLE IF NOT EXISTS public.user_restaurant_roles (LIKE ims.user_restaurant_roles INCLUDING ALL);
INSERT INTO public.user_restaurant_roles SELECT * FROM ims.user_restaurant_roles ON CONFLICT DO NOTHING;

-- item_categories (canonical schema, not IMS)
CREATE TABLE IF NOT EXISTS public.item_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.franchise_groups(id),
  name TEXT NOT NULL, description TEXT, sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
INSERT INTO public.item_categories (id, tenant_id, name, description, created_at, updated_at)
  SELECT id, franchise_group_id, name, description, created_at, updated_at
  FROM ims.categories ON CONFLICT DO NOTHING;

-- items (canonical schema, not IMS)
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.franchise_groups(id),
  category_id UUID REFERENCES public.item_categories(id),
  name TEXT NOT NULL, sku TEXT, barcode TEXT, unit TEXT NOT NULL DEFAULT 'kg',
  unit_price NUMERIC(10,2), par_level NUMERIC(10,3) DEFAULT 0,
  reorder_point NUMERIC(10,3) DEFAULT 0, stock_on_hand NUMERIC(10,3) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), deleted_at TIMESTAMPTZ
);
INSERT INTO public.items (id, tenant_id, category_id, name, sku, is_active, created_at, updated_at)
  SELECT id, franchise_group_id, category_id, name, sku, COALESCE(is_active,true), created_at, updated_at
  FROM ims.items ON CONFLICT DO NOTHING;

-- item_restaurant_overrides
CREATE TABLE IF NOT EXISTS public.item_restaurant_overrides (LIKE ims.item_restaurant_overrides INCLUDING ALL);
INSERT INTO public.item_restaurant_overrides SELECT * FROM ims.item_restaurant_overrides ON CONFLICT DO NOTHING;

-- uom_conversions
CREATE TABLE IF NOT EXISTS public.uom_conversions (LIKE ims.uom_conversions INCLUDING ALL);
INSERT INTO public.uom_conversions SELECT * FROM ims.uom_conversions ON CONFLICT DO NOTHING;

-- vendors
CREATE TABLE IF NOT EXISTS public.vendors (LIKE ims.vendors INCLUDING ALL);
INSERT INTO public.vendors SELECT * FROM ims.vendors ON CONFLICT DO NOTHING;
ALTER TABLE IF EXISTS public.vendors ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.franchise_groups(id);

-- purchase_orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (LIKE ims.purchase_orders INCLUDING ALL);
INSERT INTO public.purchase_orders SELECT * FROM ims.purchase_orders ON CONFLICT DO NOTHING;
ALTER TABLE IF EXISTS public.purchase_orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.franchise_groups(id);
ALTER TABLE IF EXISTS public.purchase_orders ADD COLUMN IF NOT EXISTS invoice_ref TEXT;

-- po_line_items
CREATE TABLE IF NOT EXISTS public.po_line_items (LIKE ims.po_line_items INCLUDING ALL);
INSERT INTO public.po_line_items SELECT * FROM ims.po_line_items ON CONFLICT DO NOTHING;

-- inventory_batches
CREATE TABLE IF NOT EXISTS public.inventory_batches (LIKE ims.inventory_batches INCLUDING ALL);
INSERT INTO public.inventory_batches SELECT * FROM ims.inventory_batches ON CONFLICT DO NOTHING;

-- inventory_ledger
CREATE TABLE IF NOT EXISTS public.inventory_ledger (LIKE ims.inventory_ledger INCLUDING ALL);
INSERT INTO public.inventory_ledger SELECT * FROM ims.inventory_ledger ON CONFLICT DO NOTHING;
ALTER TABLE IF EXISTS public.inventory_ledger ADD COLUMN IF NOT EXISTS total_cost NUMERIC(12,2);
ALTER TABLE IF EXISTS public.inventory_ledger ADD COLUMN IF NOT EXISTS reference_type TEXT;
ALTER TABLE IF EXISTS public.inventory_ledger ADD COLUMN IF NOT EXISTS reference_id UUID;
ALTER TABLE IF EXISTS public.inventory_ledger ADD COLUMN IF NOT EXISTS note TEXT;

-- inventory_transfers (IMS has from_restaurant_id, to_restaurant_id)
CREATE TABLE IF NOT EXISTS public.inventory_transfers (LIKE ims.inventory_transfers INCLUDING ALL);
INSERT INTO public.inventory_transfers SELECT * FROM ims.inventory_transfers ON CONFLICT DO NOTHING;

-- inventory_count_batches
CREATE TABLE IF NOT EXISTS public.inventory_count_batches (LIKE ims.inventory_count_batches INCLUDING ALL);
INSERT INTO public.inventory_count_batches SELECT * FROM ims.inventory_count_batches ON CONFLICT DO NOTHING;

-- inventory_count_rows
CREATE TABLE IF NOT EXISTS public.inventory_count_rows (LIKE ims.inventory_count_rows INCLUDING ALL);
INSERT INTO public.inventory_count_rows SELECT * FROM ims.inventory_count_rows ON CONFLICT DO NOTHING;

-- waste_logs
CREATE TABLE IF NOT EXISTS public.waste_logs (LIKE ims.waste_logs INCLUDING ALL);
INSERT INTO public.waste_logs SELECT * FROM ims.waste_logs ON CONFLICT DO NOTHING;

-- prep_production_logs
CREATE TABLE IF NOT EXISTS public.prep_production_logs (LIKE ims.prep_production_logs INCLUDING ALL);
INSERT INTO public.prep_production_logs SELECT * FROM ims.prep_production_logs ON CONFLICT DO NOTHING;

-- recipes
CREATE TABLE IF NOT EXISTS public.recipes (LIKE ims.recipes INCLUDING ALL);
INSERT INTO public.recipes SELECT * FROM ims.recipes ON CONFLICT DO NOTHING;
ALTER TABLE IF EXISTS public.recipes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.franchise_groups(id);

-- recipe_ingredients
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (LIKE ims.recipe_ingredients INCLUDING ALL);
INSERT INTO public.recipe_ingredients SELECT * FROM ims.recipe_ingredients ON CONFLICT DO NOTHING;

-- menu_item_mappings
CREATE TABLE IF NOT EXISTS public.menu_item_mappings (LIKE ims.menu_item_mappings INCLUDING ALL);
INSERT INTO public.menu_item_mappings SELECT * FROM ims.menu_item_mappings ON CONFLICT DO NOTHING;

-- sales_import_batches
CREATE TABLE IF NOT EXISTS public.sales_import_batches (LIKE ims.sales_import_batches INCLUDING ALL);
INSERT INTO public.sales_import_batches SELECT * FROM ims.sales_import_batches ON CONFLICT DO NOTHING;

-- sales_import_rows
CREATE TABLE IF NOT EXISTS public.sales_import_rows (LIKE ims.sales_import_rows INCLUDING ALL);
INSERT INTO public.sales_import_rows SELECT * FROM ims.sales_import_rows ON CONFLICT DO NOTHING;

-- daily_inventory_snapshots
CREATE TABLE IF NOT EXISTS public.daily_inventory_snapshots (LIKE ims.daily_inventory_snapshots INCLUDING ALL);
INSERT INTO public.daily_inventory_snapshots SELECT * FROM ims.daily_inventory_snapshots ON CONFLICT DO NOTHING;

-- audit_log
CREATE TABLE IF NOT EXISTS public.audit_log (LIKE ims.audit_log INCLUDING ALL);
INSERT INTO public.audit_log SELECT * FROM ims.audit_log ON CONFLICT DO NOTHING;
ALTER TABLE IF EXISTS public.audit_log ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.franchise_groups(id);

-- cached_recipes (ET-only, already exists)
ALTER TABLE IF EXISTS public.cached_recipes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.franchise_groups(id);

-- cached_ingredients (ET-only, already exists)
ALTER TABLE IF EXISTS public.cached_ingredients ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.franchise_groups(id);

-- feature_flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.franchise_groups(id),
  flag_key TEXT NOT NULL, flag_value JSONB NOT NULL DEFAULT 'false'::JSONB,
  description TEXT, is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, flag_key)
);

-- ===================================================================
-- 3. MISSING COLUMNS ON EXISTING ET TABLES
-- ===================================================================

ALTER TABLE IF EXISTS public.purchases ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id);
ALTER TABLE IF EXISTS public.purchases ADD COLUMN IF NOT EXISTS receipt_type TEXT DEFAULT 'manual';
ALTER TABLE IF EXISTS public.purchases ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.purchases ALTER COLUMN purchase_date SET DEFAULT CURRENT_DATE;
ALTER TABLE IF EXISTS public.whatsapp_inbox ADD COLUMN IF NOT EXISTS direction TEXT NOT NULL DEFAULT 'INBOUND';
ALTER TABLE IF EXISTS public.whatsapp_inbox ADD COLUMN IF NOT EXISTS is_processed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE IF EXISTS public.receipt_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.franchise_groups(id);
ALTER TABLE IF EXISTS public.receipt_items ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN NOT NULL DEFAULT false;

-- ===================================================================
-- 4. ET-STYLE FUNCTIONS
-- ===================================================================

-- Drop functions whose return type changed (confirmed by prior errors)
DROP FUNCTION IF EXISTS public.get_my_available_tenants();
DROP FUNCTION IF EXISTS public.get_tenant_bundle();
DROP FUNCTION IF EXISTS public.receive_purchase_order_v1(UUID);
DROP FUNCTION IF EXISTS public.process_batch_v1(UUID);

CREATE OR REPLACE FUNCTION public.get_my_tenant()
RETURNS UUID LANGUAGE plpgsql STABLE AS $$
DECLARE v_val TEXT; BEGIN v_val := current_setting('app.franchise_group_id', true);
IF v_val IS NULL OR v_val = '' THEN RETURN NULL; END IF; RETURN v_val::UUID;
EXCEPTION WHEN OTHERS THEN RETURN NULL; END;
$$;
CREATE OR REPLACE FUNCTION public.switch_tenant(p_tenant_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN PERFORM set_config('app.franchise_group_id', p_tenant_id::TEXT, true); END;
$$;
CREATE OR REPLACE FUNCTION public.set_tenant_context(p_franchise_group_id UUID, p_restaurant_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('app.franchise_group_id', p_franchise_group_id::TEXT, true);
  PERFORM set_config('app.restaurant_id', p_restaurant_id::TEXT, true);
END;
$$;
CREATE OR REPLACE FUNCTION public.get_my_available_tenants()
RETURNS SETOF public.franchise_groups LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN RETURN QUERY SELECT * FROM public.franchise_groups; END;
$$;
CREATE OR REPLACE FUNCTION public.get_tenant_bundle()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE v_tenant_id UUID; v_result JSONB;
BEGIN
  v_tenant_id := public.get_my_tenant(); IF v_tenant_id IS NULL THEN RETURN NULL; END IF;
  SELECT jsonb_build_object('tenant', row_to_json(fg.*)::JSONB,
    'locations', COALESCE((SELECT jsonb_agg(row_to_json(r.*)::JSONB) FROM public.restaurants r WHERE r.franchise_group_id = fg.id AND r.deleted_at IS NULL), '[]'::JSONB),
    'members', '[]'::JSONB,
    'chart_of_accounts', COALESCE((SELECT jsonb_agg(row_to_json(coa.*)::JSONB) FROM public.chart_of_accounts coa WHERE coa.tenant_id = fg.id), '[]'::JSONB),
    'inventory_categories', COALESCE((SELECT jsonb_agg(row_to_json(ic.*)::JSONB) FROM public.item_categories ic WHERE ic.tenant_id = fg.id AND ic.deleted_at IS NULL), '[]'::JSONB),
    'inventory_items', COALESCE((SELECT jsonb_agg(row_to_json(i.*)::JSONB) FROM public.items i JOIN public.item_categories ic ON ic.id = i.category_id WHERE ic.tenant_id = fg.id AND i.deleted_at IS NULL), '[]'::JSONB)
  ) INTO v_result FROM public.franchise_groups fg WHERE fg.id = v_tenant_id;
  RETURN v_result;
END;
$$;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name) VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.add_transaction_v3(p_transaction JSONB)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO public.transactions (tenant_id, account_id, amount, type, description, transaction_date, reference_type, reference_id)
  VALUES ((p_transaction->>'tenant_id')::UUID, (p_transaction->>'account_id')::UUID, (p_transaction->>'amount')::NUMERIC,
    COALESCE(p_transaction->>'type', 'DEBIT'), p_transaction->>'description',
    COALESCE((p_transaction->>'transaction_date')::DATE, CURRENT_DATE),
    p_transaction->>'reference_type', (p_transaction->>'reference_id')::UUID)
  RETURNING id INTO v_id; RETURN v_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.receive_purchase_order_v1(p_po_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN UPDATE public.purchase_orders SET status = 'received', delivered_date = CURRENT_DATE WHERE id = p_po_id AND status = 'approved'; END;
$$;
CREATE OR REPLACE FUNCTION public.upsert_app_user_v1(p_tenant_id UUID, p_user_id UUID, p_role TEXT DEFAULT 'member', p_permissions JSONB DEFAULT '[]'::JSONB)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.app_users (tenant_id, user_id, role, permissions) VALUES (p_tenant_id, p_user_id, p_role, p_permissions)
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = p_role, permissions = p_permissions, updated_at = NOW();
END;
$$;
CREATE OR REPLACE FUNCTION public.approve_purchase_v1(p_purchase_id UUID, p_queue_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.purchases SET quarantine_status = 'APPROVED', is_quarantined = false WHERE id = p_purchase_id;
  UPDATE public.purchase_anomaly_queue SET status = 'DISMISSED', reviewed_at = NOW() WHERE id = p_queue_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.reject_purchase_v1(p_purchase_id UUID, p_queue_id UUID, p_rejection_note TEXT DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.purchases SET quarantine_status = 'REJECTED' WHERE id = p_purchase_id;
  UPDATE public.purchase_anomaly_queue SET status = 'ESCALATED', reviewed_at = NOW() WHERE id = p_queue_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.process_batch_v1(p_batch_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.pos_batch_uploads SET status = 'COMPLETED', processed_transactions = (SELECT COUNT(*) FROM public.pos_transaction_staging WHERE batch_id = p_batch_id) WHERE id = p_batch_id;
END;
$$;

-- ===================================================================
-- 5. BACKWARD-COMPAT VIEWS (drop conflicting ET tables first)
-- ===================================================================

DROP TABLE IF EXISTS public.tenants CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.inventory_categories CASCADE;
DROP TABLE IF EXISTS public.inventory_items CASCADE;
CREATE OR REPLACE VIEW public.tenants AS SELECT * FROM public.franchise_groups;
CREATE OR REPLACE VIEW public.locations AS SELECT * FROM public.restaurants;
CREATE OR REPLACE VIEW public.inventory_categories AS SELECT * FROM public.item_categories;
CREATE OR REPLACE VIEW public.inventory_items AS SELECT * FROM public.items;

-- ===================================================================
-- 6. TRIGGERS
-- ===================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$ DECLARE rec RECORD;
BEGIN FOR rec IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN (
  'transactions','sales_import_rows','outbox_events','system_telemetry','invoice_items',
  'receipt_items','audit_log','daily_inventory_snapshots','inventory_ledger','inventory_transfers','rate_limits')
LOOP BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=rec.tablename AND column_name='updated_at') THEN
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I; CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', rec.tablename, rec.tablename, rec.tablename, rec.tablename);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL; END;
END LOOP; END;
$$;

-- ===================================================================
-- 7. RLS & GRANTS
-- ===================================================================

ALTER TABLE IF EXISTS public.franchise_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- ===================================================================
-- 8. SEED PERMISSIONS & ROLES
-- ===================================================================

INSERT INTO public.permissions (code, name, description, module) VALUES
  ('INVENTORY.READ','Read Inventory','View inventory items and stock','INVENTORY'),
  ('INVENTORY.WRITE','Write Inventory','Create and edit inventory items','INVENTORY'),
  ('INVENTORY.COUNT','Count Inventory','Perform physical inventory counts','INVENTORY'),
  ('PROCUREMENT.READ','Read Procurement','View vendors and purchase orders','PROCUREMENT'),
  ('PROCUREMENT.WRITE','Write Procurement','Create and edit purchase orders','PROCUREMENT'),
  ('PROCUREMENT.APPROVE','Approve Procurement','Approve purchase orders','PROCUREMENT'),
  ('RECIPE.READ','Read Recipes','View recipes and BOM','RECIPE'),
  ('RECIPE.WRITE','Write Recipes','Create and edit recipes','RECIPE'),
  ('SALES.IMPORT','Import Sales','Upload and process sales files','SALES'),
  ('SALES.READ','Read Sales','View sales data','SALES'),
  ('REPORTING.READ','Read Reports','View reports and analytics','REPORTING'),
  ('ADMIN.TENANTS','Manage Tenants','Manage franchise groups and restaurants','ADMIN'),
  ('ADMIN.USERS','Manage Users','Manage user accounts and roles','ADMIN'),
  ('ADMIN.PERMISSIONS','Manage Permissions','Configure roles and permissions','ADMIN'),
  ('FINANCE.READ','Read Finance','View financial transactions','FINANCE'),
  ('FINANCE.WRITE','Write Finance','Create and edit transactions','FINANCE'),
  ('WHATSAPP.READ','Read WhatsApp','View WhatsApp messages','WHATSAPP'),
  ('WHATSAPP.WRITE','Write WhatsApp','Send WhatsApp messages','WHATSAPP')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.roles (name, description, is_system)
SELECT v.name, v.description, v.is_system FROM (VALUES
  ('Franchise Owner'::TEXT,'Full access across the franchise group'::TEXT,true::BOOLEAN),
  ('Restaurant Manager'::TEXT,'Manage a single restaurant'::TEXT,true::BOOLEAN),
  ('Chef'::TEXT,'Recipe and prep management'::TEXT,true::BOOLEAN),
  ('Staff'::TEXT,'Basic read-only access'::TEXT,true::BOOLEAN),
  ('Accountant'::TEXT,'Financial management'::TEXT,true::BOOLEAN)
) AS v(name, description, is_system) WHERE NOT EXISTS (SELECT 1 FROM public.roles)
ON CONFLICT DO NOTHING;

-- Update tenant_id for migrated IMS data
UPDATE public.item_categories SET tenant_id = (SELECT id FROM public.franchise_groups LIMIT 1) WHERE tenant_id IS NULL;
UPDATE public.items SET tenant_id = (SELECT id FROM public.franchise_groups LIMIT 1) WHERE tenant_id IS NULL;

COMMIT;
