-- ===================================================================
-- IMS Schema — unified bootstrap for Synculariti Core
-- All IMS tables live in `ims` schema to avoid collision with ET tables
-- ===================================================================

CREATE SCHEMA IF NOT EXISTS ims;

-- ===================================================================
-- 1. EXTENSIONS
-- ===================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
-- vault extension requires superuser, skip (already enabled in Supabase projects)

-- ===================================================================
-- 2. HELPER FUNCTIONS (in ims schema)
-- ===================================================================
CREATE OR REPLACE FUNCTION ims.set_tenant_context(p_franchise_group_id UUID, p_restaurant_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.franchise_group_id', p_franchise_group_id::TEXT, true);
  PERFORM set_config('app.restaurant_id',      p_restaurant_id::TEXT,      true);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ims.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 3. IMS TABLES
-- ===================================================================

CREATE TABLE ims.franchise_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE ims.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id UUID NOT NULL REFERENCES ims.franchise_groups(id),
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE ims.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE ims.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.role_permissions (
  role_id UUID NOT NULL REFERENCES ims.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES ims.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE ims.user_restaurant_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES ims.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES ims.restaurants(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES ims.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

CREATE TABLE ims.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id UUID REFERENCES ims.franchise_groups(id),
  restaurant_id UUID REFERENCES ims.restaurants(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE ims.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id UUID REFERENCES ims.franchise_groups(id),
  restaurant_id UUID REFERENCES ims.restaurants(id),
  category_id UUID NOT NULL REFERENCES ims.categories(id),
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('RAW', 'PACKAGING', 'MERCHANDISE', 'SUPPLY', 'MISCELLANEOUS')),
  purchasing_uom TEXT NOT NULL,
  inventory_uom TEXT NOT NULL,
  recipe_uom TEXT,
  inv_to_recipe_ratio NUMERIC(12,4) NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE ims.item_restaurant_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES ims.items(id),
  restaurant_id UUID NOT NULL REFERENCES ims.restaurants(id),
  par_level NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(item_id, restaurant_id)
);

CREATE TABLE ims.uom_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES ims.items(id),
  from_uom TEXT NOT NULL,
  to_uom TEXT NOT NULL,
  multiplier_factor NUMERIC(12,4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE ims.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id UUID REFERENCES ims.franchise_groups(id),
  restaurant_id UUID REFERENCES ims.restaurants(id),
  name TEXT NOT NULL,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE ims.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES ims.restaurants(id),
  vendor_id UUID NOT NULL REFERENCES ims.vendors(id),
  status TEXT NOT NULL DEFAULT 'DRAFT',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  freight_charge NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE ims.po_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES ims.purchase_orders(id),
  item_id UUID NOT NULL REFERENCES ims.items(id),
  quantity_ordered NUMERIC(12,2) NOT NULL,
  quantity_received NUMERIC(12,2) DEFAULT 0,
  raw_unit_price NUMERIC(12,4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.inventory_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES ims.restaurants(id),
  item_id UUID NOT NULL REFERENCES ims.items(id),
  po_id UUID REFERENCES ims.purchase_orders(id),
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  initial_qty NUMERIC(12,2) NOT NULL,
  remaining_qty NUMERIC(12,2) NOT NULL,
  landed_unit_cost NUMERIC(12,4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id UUID REFERENCES ims.franchise_groups(id),
  restaurant_id UUID REFERENCES ims.restaurants(id),
  produces_item_id UUID REFERENCES ims.items(id),
  recipe_name TEXT,
  yield_quantity NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE ims.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES ims.recipes(id),
  ingredient_item_id UUID REFERENCES ims.items(id),
  sub_recipe_id UUID REFERENCES ims.recipes(id),
  quantity_required NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.menu_item_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES ims.restaurants(id),
  raw_excel_string TEXT NOT NULL,
  recipe_id UUID NOT NULL REFERENCES ims.recipes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.inventory_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES ims.restaurants(id),
  item_id UUID NOT NULL REFERENCES ims.items(id),
  change_amount NUMERIC(12,2) NOT NULL,
  reason_code TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id UUID NOT NULL REFERENCES ims.franchise_groups(id),
  origin_restaurant_id UUID NOT NULL REFERENCES ims.restaurants(id),
  destination_restaurant_id UUID NOT NULL REFERENCES ims.restaurants(id),
  item_id UUID NOT NULL REFERENCES ims.items(id),
  qty NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.inventory_count_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES ims.restaurants(id),
  status TEXT NOT NULL DEFAULT 'DRAFT',
  snapshot_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.inventory_count_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES ims.inventory_count_batches(id),
  item_id UUID NOT NULL REFERENCES ims.items(id),
  expected_qty NUMERIC(12,2) NOT NULL,
  actual_qty NUMERIC(12,2),
  variance_qty NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.waste_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES ims.restaurants(id),
  item_id UUID NOT NULL REFERENCES ims.items(id),
  quantity NUMERIC(12,2) NOT NULL,
  reason TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.prep_production_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES ims.restaurants(id),
  prep_item_id UUID NOT NULL REFERENCES ims.items(id),
  yield_qty_produced NUMERIC(12,2) NOT NULL,
  produced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.sales_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES ims.restaurants(id),
  business_date DATE,
  status TEXT NOT NULL DEFAULT 'PENDING',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.sales_import_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES ims.sales_import_batches(id),
  raw_item_name TEXT NOT NULL,
  quantity_sold NUMERIC(12,2) NOT NULL,
  is_mapped BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.daily_inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES ims.restaurants(id),
  item_id UUID NOT NULL REFERENCES ims.items(id),
  business_date DATE NOT NULL,
  eod_qty NUMERIC(12,2) NOT NULL DEFAULT 0,
  fifo_total_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ims.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES ims.users(id),
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  source_ip TEXT,
  user_agent TEXT,
  restaurant_id UUID REFERENCES ims.restaurants(id),
  franchise_group_id UUID REFERENCES ims.franchise_groups(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- 4. IMS INDEXES
-- ===================================================================
CREATE INDEX idx_ims_audit_log_entity ON ims.audit_log(entity_type, entity_id);
CREATE INDEX idx_ims_audit_log_user ON ims.audit_log(user_id);
CREATE INDEX idx_ims_audit_log_created ON ims.audit_log(created_at DESC);

-- ===================================================================
-- 5. IMS UPDATED_AT TRIGGERS
-- ===================================================================
CREATE TRIGGER trg_franchise_groups_updated_at BEFORE UPDATE ON ims.franchise_groups FOR EACH ROW EXECUTE FUNCTION ims.update_updated_at_column();
CREATE TRIGGER trg_restaurants_updated_at BEFORE UPDATE ON ims.restaurants FOR EACH ROW EXECUTE FUNCTION ims.update_updated_at_column();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON ims.users FOR EACH ROW EXECUTE FUNCTION ims.update_updated_at_column();
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON ims.roles FOR EACH ROW EXECUTE FUNCTION ims.update_updated_at_column();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON ims.categories FOR EACH ROW EXECUTE FUNCTION ims.update_updated_at_column();
CREATE TRIGGER trg_items_updated_at BEFORE UPDATE ON ims.items FOR EACH ROW EXECUTE FUNCTION ims.update_updated_at_column();
CREATE TRIGGER trg_vendors_updated_at BEFORE UPDATE ON ims.vendors FOR EACH ROW EXECUTE FUNCTION ims.update_updated_at_column();
CREATE TRIGGER trg_purchase_orders_updated_at BEFORE UPDATE ON ims.purchase_orders FOR EACH ROW EXECUTE FUNCTION ims.update_updated_at_column();
CREATE TRIGGER trg_recipes_updated_at BEFORE UPDATE ON ims.recipes FOR EACH ROW EXECUTE FUNCTION ims.update_updated_at_column();

-- ===================================================================
-- 6. IMS AUTH SYNC TRIGGER (from auth.users → ims.users)
-- ===================================================================
CREATE OR REPLACE FUNCTION ims.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO ims.users (id, email, full_name, active)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    true
  ) ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION ims.handle_new_user();
  END IF;
END $$;

-- ===================================================================
-- 7. IMS SEED DATA (Permissions + Roles + Bootstrap Tenant)
-- ===================================================================
INSERT INTO ims.permissions (code, description) VALUES
  ('INVENTORY.READ',    'View inventory stock levels and ledger'),
  ('INVENTORY.WRITE',   'Modify inventory (overrides, adjustments)'),
  ('INVENTORY.COUNT',   'Perform physical inventory counts'),
  ('PROCUREMENT.READ',  'View purchase orders and vendors'),
  ('PROCUREMENT.WRITE', 'Create and manage purchase orders'),
  ('RECIPE.READ',       'View recipes and BOMs'),
  ('RECIPE.WRITE',      'Create and modify recipes'),
  ('SALES.IMPORT',      'Upload and process sales files'),
  ('SALES.READ',        'View sales import history'),
  ('REPORTING.READ',    'View reports and analytics'),
  ('ADMIN.USERS',       'Manage user accounts'),
  ('ADMIN.ROLES',       'Manage roles and permissions'),
  ('ADMIN.TENANTS',     'Manage franchise groups and restaurants')
ON CONFLICT (code) DO NOTHING;

INSERT INTO ims.roles (id, name, description) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Administrator', 'Full access to all system modules'),
  ('f0000000-0000-0000-0000-000000000002', 'Restaurant Manager', 'Oversees day-to-day operations and inventory at a specific restaurant'),
  ('f0000000-0000-0000-0000-000000000003', 'Inventory Operator', 'Enters daily counts, waste, and prep logs on the kitchen floor'),
  ('f0000000-0000-0000-0000-000000000004', 'Procurement Specialist', 'Coordinates with vendors, manages Purchase Orders and logged deliveries'),
  ('f0000000-0000-0000-0000-000000000005', 'Franchise Manager', 'Cross-location viewer monitoring performance and regional reports'),
  ('f0000000-0000-0000-0000-000000000006', 'Accountant', 'Read-only access to reports, analytics, and audit logs')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ims.role_permissions (role_id, permission_id)
SELECT 'f0000000-0000-0000-0000-000000000001'::uuid, id FROM ims.permissions
ON CONFLICT DO NOTHING;

INSERT INTO ims.franchise_groups (id, name)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Primary Franchise')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ims.restaurants (id, franchise_group_id, name, timezone)
VALUES ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Main Restaurant', 'UTC')
ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- 8. SEARCH PATH — IMS schema first so ims.* is found by default
-- ===================================================================
ALTER ROLE anon SET search_path TO 'ims', 'public';
ALTER ROLE authenticator SET search_path TO 'ims', 'public';
ALTER ROLE service_role SET search_path TO 'ims', 'public';
