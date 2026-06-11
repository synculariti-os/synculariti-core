-- Auto-generated migration to complete Phase 5
-- 5.3 Consolidate duplicate tables
ALTER TABLE IF EXISTS purchase_orders ADD COLUMN IF NOT EXISTS delivery_status text;
ALTER TABLE IF EXISTS purchase_orders ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE IF EXISTS inventory_ledger ADD COLUMN IF NOT EXISTS quantity numeric;
ALTER TABLE IF EXISTS inventory_ledger ADD COLUMN IF NOT EXISTS cost numeric;
ALTER TABLE IF EXISTS po_line_items ADD COLUMN IF NOT EXISTS discount numeric;
DROP TABLE IF EXISTS et_purchase_orders CASCADE;
DROP TABLE IF EXISTS et_inventory_ledger CASCADE;
DROP TABLE IF EXISTS et_po_line_items CASCADE;

-- 5.4 accounting_periods
CREATE TABLE IF NOT EXISTS accounting_periods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounting_periods_name ON accounting_periods(name);

-- 5.5 exchange_rates
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  currency text NOT NULL,
  rate numeric(18,6) NOT NULL,
  rate_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_exchange_rates_currency_date ON exchange_rates(currency, rate_date);

-- 5.6 tenant_settings
CREATE TABLE IF NOT EXISTS tenant_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES franchise_groups(id) ON DELETE CASCADE,
  branding jsonb,
  config jsonb,
  feature_flags jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant_id ON tenant_settings(tenant_id);

-- 5.7 unique constraint on recipe_ingredients
ALTER TABLE IF EXISTS recipe_ingredients ADD CONSTRAINT uq_recipe_ingredients_recipe_ingredient UNIQUE (recipe_id, ingredient_item_id);

-- 5.8 updated_at triggers
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for items if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_table='items' AND trigger_name='items_set_updated_at') THEN
    CREATE TRIGGER items_set_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END$$;

-- Trigger for recipes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_table='recipes' AND trigger_name='recipes_set_updated_at') THEN
    CREATE TRIGGER recipes_set_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END$$;

-- Trigger for vendors
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_table='vendors' AND trigger_name='vendors_set_updated_at') THEN
    CREATE TRIGGER vendors_set_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END$$;

-- Trigger for transactions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_table='transactions' AND trigger_name='transactions_set_updated_at') THEN
    CREATE TRIGGER transactions_set_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END$$;

-- 5.9 regenerate types (to be executed by CI/scripts)
COMMENT ON SCHEMA public IS 'Target schema for Supabase project';
