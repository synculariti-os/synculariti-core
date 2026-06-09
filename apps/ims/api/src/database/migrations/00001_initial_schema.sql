-- ===================================================================
-- Synculariti OS IMS — Initial Schema
-- Migration: 00001_initial_schema.sql
-- ===================================================================
-- This is a one-time bootstrapping migration. All subsequent changes
-- must be new migration files, not edits to this file.
-- ===================================================================

BEGIN;

-- ===================================================================
-- 0. Extensions
-- ===================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ===================================================================
-- 1. Helper Functions
-- ===================================================================

-- Tenant context setter — called by TenantContextDriver on every
-- connection checkout/release to scope queries via session variables.
CREATE OR REPLACE FUNCTION set_tenant_context(
  p_franchise_group_id UUID,
  p_restaurant_id      UUID
) RETURNS void
  LANGUAGE plpgsql
  AS $$
BEGIN
  PERFORM set_config('app.franchise_group_id', p_franchise_group_id::TEXT, true);
  PERFORM set_config('app.restaurant_id',      p_restaurant_id::TEXT,      true);
END;
$$;


-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
  LANGUAGE plpgsql
  AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ===================================================================
-- 2. Tenant Agent
-- ===================================================================

CREATE TABLE franchise_groups (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trg_franchise_groups_updated_at
  BEFORE UPDATE ON franchise_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE restaurants (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id UUID       NOT NULL REFERENCES franchise_groups(id),
  name              TEXT        NOT NULL,
  timezone          TEXT        NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_restaurants_franchise_group ON restaurants(franchise_group_id);
CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ===================================================================
-- 3. Auth Agent
-- ===================================================================

CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL,
  full_name     TEXT        NOT NULL,
  password_hash TEXT        NOT NULL,
  phone_number  TEXT,
  active        BOOLEAN    NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE roles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ
);

CREATE TRIGGER trg_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE permissions (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT    NOT NULL,
  description TEXT
);

CREATE UNIQUE INDEX idx_permissions_code ON permissions(code);


CREATE TABLE role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id),
  permission_id UUID NOT NULL REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);


CREATE TABLE user_restaurant_roles (
  user_id       UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  role_id       UUID NOT NULL REFERENCES roles(id),
  PRIMARY KEY (user_id, restaurant_id)
);

CREATE INDEX idx_user_restaurant_roles_user ON user_restaurant_roles(user_id);
CREATE INDEX idx_user_restaurant_roles_restaurant ON user_restaurant_roles(restaurant_id);


-- ===================================================================
-- 4. Item Master Agent
-- ===================================================================

CREATE TABLE categories (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id UUID,
  restaurant_id     UUID,
  name              TEXT        NOT NULL,
  description       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  FOREIGN KEY (franchise_group_id) REFERENCES franchise_groups(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE items (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id UUID,
  restaurant_id     UUID,
  category_id       UUID        NOT NULL REFERENCES categories(id),
  name              TEXT        NOT NULL,
  sku               TEXT        NOT NULL,
  type              TEXT        NOT NULL CHECK (type IN ('RAW', 'PACKAGING', 'MERCHANDISE', 'SUPPLY', 'MISCELLANEOUS')),
  purchasing_uom    TEXT        NOT NULL,
  inventory_uom     TEXT        NOT NULL,
  recipe_uom        TEXT,
  inv_to_recipe_ratio NUMERIC(12,4) NOT NULL DEFAULT 1,
  is_active         BOOLEAN    NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  FOREIGN KEY (franchise_group_id) REFERENCES franchise_groups(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE UNIQUE INDEX idx_items_sku ON items(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_type ON items(type);
CREATE TRIGGER trg_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE uom_conversions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id          UUID        NOT NULL REFERENCES items(id),
  from_uom         TEXT        NOT NULL,
  to_uom           TEXT        NOT NULL,
  multiplier_factor NUMERIC(12,4) NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE INDEX idx_uom_conversions_item ON uom_conversions(item_id);
CREATE TRIGGER trg_uom_conversions_updated_at
  BEFORE UPDATE ON uom_conversions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE item_restaurant_overrides (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id       UUID        NOT NULL REFERENCES items(id),
  restaurant_id UUID        NOT NULL REFERENCES restaurants(id),
  par_level     NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active     BOOLEAN    NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_item_restaurant_overrides_unique ON item_restaurant_overrides(item_id, restaurant_id) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_item_restaurant_overrides_updated_at
  BEFORE UPDATE ON item_restaurant_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ===================================================================
-- 5. Procurement Agent
-- ===================================================================

CREATE TABLE vendors (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id UUID,
  restaurant_id     UUID,
  name              TEXT        NOT NULL,
  contact_email     TEXT,
  is_active         BOOLEAN    NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  FOREIGN KEY (franchise_group_id) REFERENCES franchise_groups(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TRIGGER trg_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE purchase_orders (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id         UUID          NOT NULL REFERENCES restaurants(id),
  vendor_id             UUID          NOT NULL REFERENCES vendors(id),
  status                TEXT          NOT NULL DEFAULT 'DRAFT'
                                      CHECK (status IN ('DRAFT', 'SUBMITTED', 'RECEIVED', 'CANCELLED')),
  order_date            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  expected_delivery_date TIMESTAMPTZ,
  freight_charge        NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount            NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

CREATE INDEX idx_purchase_orders_restaurant ON purchase_orders(restaurant_id);
CREATE INDEX idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE TRIGGER trg_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE po_line_items (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id             UUID          NOT NULL REFERENCES purchase_orders(id),
  item_id           UUID          NOT NULL REFERENCES items(id),
  quantity_ordered  NUMERIC(12,2) NOT NULL,
  quantity_received NUMERIC(12,2) NOT NULL DEFAULT 0,
  raw_unit_price    NUMERIC(12,2) NOT NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_po_line_items_po ON po_line_items(po_id);
CREATE INDEX idx_po_line_items_item ON po_line_items(item_id);


CREATE TABLE inventory_batches (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     UUID          NOT NULL REFERENCES restaurants(id),
  item_id           UUID          NOT NULL REFERENCES items(id),
  po_id             UUID          REFERENCES purchase_orders(id),
  received_date     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  initial_qty       NUMERIC(12,2) NOT NULL,
  remaining_qty     NUMERIC(12,2) NOT NULL,
  landed_unit_cost  NUMERIC(12,2) NOT NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_batches_restaurant_item ON inventory_batches(restaurant_id, item_id);
CREATE INDEX idx_inventory_batches_po ON inventory_batches(po_id);
CREATE TRIGGER trg_inventory_batches_updated_at
  BEFORE UPDATE ON inventory_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ===================================================================
-- 6. Recipe / BOM Agent
-- ===================================================================

CREATE TABLE recipes (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id UUID,
  restaurant_id     UUID,
  produces_item_id  UUID        REFERENCES items(id),
  recipe_name       TEXT,
  yield_quantity    NUMERIC(12,2) NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,
  FOREIGN KEY (franchise_group_id) REFERENCES franchise_groups(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE INDEX idx_recipes_produces_item ON recipes(produces_item_id);
CREATE TRIGGER trg_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE recipe_ingredients (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id          UUID          NOT NULL REFERENCES recipes(id),
  ingredient_item_id UUID          REFERENCES items(id),
  sub_recipe_id      UUID          REFERENCES recipes(id),
  quantity_required  NUMERIC(12,4) NOT NULL,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_item_id);


CREATE TABLE menu_item_mappings (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID        NOT NULL REFERENCES restaurants(id),
  raw_excel_string TEXT       NOT NULL,
  recipe_id       UUID        NOT NULL REFERENCES recipes(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_menu_item_mappings_unique ON menu_item_mappings(restaurant_id, raw_excel_string) WHERE deleted_at IS NULL;
CREATE INDEX idx_menu_item_mappings_recipe ON menu_item_mappings(recipe_id);
CREATE TRIGGER trg_menu_item_mappings_updated_at
  BEFORE UPDATE ON menu_item_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ===================================================================
-- 7. Inventory Operations Agent
-- ===================================================================

CREATE TABLE inventory_ledger (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID          NOT NULL REFERENCES restaurants(id),
  item_id       UUID          NOT NULL REFERENCES items(id),
  change_amount NUMERIC(12,2) NOT NULL,
  reason_code   TEXT          NOT NULL
                CHECK (reason_code IN (
                  'PO_RECEIPT',
                  'SALES_DEPLETION',
                  'ADJUSTMENT',
                  'TRANSFER_IN',
                  'TRANSFER_OUT',
                  'WASTE',
                  'PREP_PRODUCTION',
                  'COUNT_ADJUSTMENT'
                )),
  reference_id  TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- This is the critical stock-aggregation index. Every stock-level
-- query sums change_amount over (restaurant_id, item_id).
CREATE INDEX idx_inventory_ledger_stock ON inventory_ledger(restaurant_id, item_id);
CREATE INDEX idx_inventory_ledger_reason ON inventory_ledger(reason_code);
CREATE INDEX idx_inventory_ledger_created ON inventory_ledger(created_at);


-- Append-only guard: prevent accidental UPDATE/DELETE on ledger.
-- If you need to correct an entry, insert an offsetting reversal.
CREATE OR REPLACE FUNCTION prevent_ledger_mutation()
RETURNS trigger
  LANGUAGE plpgsql
  AS $$
BEGIN
  RAISE EXCEPTION 'inventory_ledger is append-only. Use an offsetting reversal entry instead.';
END;
$$;

CREATE TRIGGER trg_inventory_ledger_append_only
  BEFORE UPDATE OR DELETE ON inventory_ledger
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_mutation();


CREATE TABLE inventory_transfers (
  id                       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_group_id       UUID          NOT NULL REFERENCES franchise_groups(id),
  origin_restaurant_id     UUID          NOT NULL REFERENCES restaurants(id),
  destination_restaurant_id UUID         NOT NULL REFERENCES restaurants(id),
  item_id                  UUID          NOT NULL REFERENCES items(id),
  qty                      NUMERIC(12,2) NOT NULL,
  status                   TEXT          NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED')),
  created_at               TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_transfers_origin ON inventory_transfers(origin_restaurant_id);
CREATE INDEX idx_inventory_transfers_destination ON inventory_transfers(destination_restaurant_id);
CREATE TRIGGER trg_inventory_transfers_updated_at
  BEFORE UPDATE ON inventory_transfers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE inventory_count_batches (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     UUID        NOT NULL REFERENCES restaurants(id),
  status            TEXT        NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN', 'SUBMITTED', 'CLOSED')),
  snapshot_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version           INTEGER     NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_count_batches_restaurant ON inventory_count_batches(restaurant_id);
CREATE INDEX idx_inventory_count_batches_status ON inventory_count_batches(status);
CREATE TRIGGER trg_inventory_count_batches_updated_at
  BEFORE UPDATE ON inventory_count_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE inventory_count_rows (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id      UUID          NOT NULL REFERENCES inventory_count_batches(id),
  item_id       UUID          NOT NULL REFERENCES items(id),
  expected_qty  NUMERIC(12,2) NOT NULL,
  actual_qty    NUMERIC(12,2),
  variance_qty  NUMERIC(12,2),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_count_rows_batch ON inventory_count_rows(batch_id);
CREATE TRIGGER trg_inventory_count_rows_updated_at
  BEFORE UPDATE ON inventory_count_rows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE waste_logs (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID        NOT NULL REFERENCES restaurants(id),
  item_id     UUID          NOT NULL REFERENCES items(id),
  quantity    NUMERIC(12,2) NOT NULL,
  reason      TEXT,
  recorded_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waste_logs_restaurant ON waste_logs(restaurant_id);
CREATE INDEX idx_waste_logs_recorded ON waste_logs(recorded_at);


CREATE TABLE prep_production_logs (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id    UUID          NOT NULL REFERENCES restaurants(id),
  prep_item_id     UUID          NOT NULL REFERENCES items(id),
  yield_qty_produced NUMERIC(12,2) NOT NULL,
  produced_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prep_production_logs_restaurant ON prep_production_logs(restaurant_id);


-- ===================================================================
-- 8. Sales Ingestion Agent
-- ===================================================================

CREATE TABLE sales_import_batches (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID        NOT NULL REFERENCES restaurants(id),
  business_date DATE,
  status        TEXT        NOT NULL DEFAULT 'PENDING'
                CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_import_batches_restaurant ON sales_import_batches(restaurant_id);
CREATE INDEX idx_sales_import_batches_status ON sales_import_batches(status);
CREATE TRIGGER trg_sales_import_batches_updated_at
  BEFORE UPDATE ON sales_import_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE sales_import_rows (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id      UUID          NOT NULL REFERENCES sales_import_batches(id),
  raw_item_name TEXT          NOT NULL,
  quantity_sold NUMERIC(12,2) NOT NULL,
  is_mapped     BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_import_rows_batch ON sales_import_rows(batch_id);
CREATE INDEX idx_sales_import_rows_mapped ON sales_import_rows(is_mapped) WHERE is_mapped = FALSE;


-- ===================================================================
-- 9. Reporting Agent
-- ===================================================================

CREATE TABLE daily_inventory_snapshots (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID          NOT NULL REFERENCES restaurants(id),
  item_id         UUID          NOT NULL REFERENCES items(id),
  business_date   DATE          NOT NULL,
  eod_qty         NUMERIC(12,2) NOT NULL DEFAULT 0,
  fifo_total_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_daily_snapshots_unique ON daily_inventory_snapshots(restaurant_id, item_id, business_date);
CREATE INDEX idx_daily_snapshots_date ON daily_inventory_snapshots(business_date);


CREATE MATERIALIZED VIEW mat_view_variance_analytics AS
SELECT
  s.restaurant_id,
  s.item_id,
  to_char(s.business_date, 'YYYY-MM')           AS reporting_month,
  SUM(s.eod_qty)                                 AS actual_qty,
  SUM(COALESCE(t.theoretical_qty, 0))            AS theoretical_qty,
  SUM(s.eod_qty - COALESCE(t.theoretical_qty, 0)) AS unexplained_variance_qty
FROM daily_inventory_snapshots s
LEFT JOIN (
  SELECT
    ri.ingredient_item_id AS item_id,
    sb.restaurant_id,
    to_char(sb.business_date, 'YYYY-MM') AS reporting_month,
    SUM(sr.quantity_sold * ri.quantity_required / r.yield_quantity) AS theoretical_qty
  FROM sales_import_rows sr
  JOIN sales_import_batches sb       ON sb.id = sr.batch_id
  JOIN menu_item_mappings mim       ON mim.restaurant_id = sb.restaurant_id
                                    AND mim.raw_excel_string = sr.raw_item_name
  JOIN recipes r                    ON r.id = mim.recipe_id
  JOIN recipe_ingredients ri        ON ri.recipe_id = r.id
  WHERE sb.status = 'COMPLETED'
    AND sr.is_mapped = TRUE
  GROUP BY ri.ingredient_item_id, sb.restaurant_id, to_char(sb.business_date, 'YYYY-MM')
) t ON t.item_id = s.item_id AND t.restaurant_id = s.restaurant_id AND t.reporting_month = to_char(s.business_date, 'YYYY-MM')
GROUP BY s.restaurant_id, s.item_id, to_char(s.business_date, 'YYYY-MM');

CREATE UNIQUE INDEX idx_mat_view_variance_unique ON mat_view_variance_analytics(restaurant_id, item_id, reporting_month);


-- ===================================================================
-- 10. Audit Agent
-- ===================================================================

CREATE TABLE audit_log (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        REFERENCES users(id),
  user_email        TEXT,
  action            TEXT        NOT NULL,
  entity_type       TEXT        NOT NULL,
  entity_id         TEXT        NOT NULL,
  old_value         JSONB,
  new_value         JSONB,
  success           BOOLEAN     NOT NULL,
  error_message     TEXT,
  source_ip         TEXT,
  user_agent        TEXT,
  restaurant_id     UUID        REFERENCES restaurants(id),
  franchise_group_id UUID       REFERENCES franchise_groups(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
CREATE INDEX idx_audit_log_restaurant ON audit_log(restaurant_id);


-- ===================================================================
-- 11. Seed: Permissions Reference Data
-- ===================================================================

INSERT INTO permissions (code, description) VALUES
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
  ('ADMIN.TENANTS',     'Manage franchise groups and restaurants'),
  ('ADMIN.FEATURE_FLAGS', 'Manage per-restaurant feature toggles')
ON CONFLICT (code) DO NOTHING;

COMMIT;
