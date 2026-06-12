-- Phase 9: Enterprise Scale (P2–P3)
-- 9.1 Vendor Portal / EDI, 9.2 Commissary, 9.3 Cost Centers, 9.4 Bank Reconciliation, 9.5 Compliance

-- ═══════════════════════════════════════════════════════════════
-- 9.1 Vendor Portal / EDI
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.vendor_portal_access (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  email text NOT NULL,
  password_hash text,
  is_active boolean NOT NULL DEFAULT true,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_portal_email ON public.vendor_portal_access(email);
CREATE INDEX IF NOT EXISTS idx_vendor_portal_vendor ON public.vendor_portal_access(vendor_id);

CREATE TABLE IF NOT EXISTS public.vendor_catalog_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.items(id) ON DELETE SET NULL,
  vendor_sku text NOT NULL,
  vendor_item_name text NOT NULL,
  unit_price numeric(12,4) NOT NULL,
  uom text NOT NULL,
  lead_time_days integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_vendor_catalog_vendor ON public.vendor_catalog_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_catalog_item ON public.vendor_catalog_items(item_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_catalog_sku ON public.vendor_catalog_items(vendor_id, vendor_sku);

CREATE TABLE IF NOT EXISTS public.edi_config (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  protocol text NOT NULL CHECK (protocol IN ('AS2', 'SFTP', 'API', 'email', 'manual')),
  endpoint_url text,
  credentials jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_edi_config_vendor ON public.edi_config(vendor_id);

CREATE TABLE IF NOT EXISTS public.edi_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type text NOT NULL,
  payload jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_edi_transactions_vendor ON public.edi_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_edi_transactions_status ON public.edi_transactions(status);

-- ═══════════════════════════════════════════════════════════════
-- 9.2 Commissary / Central Kitchen
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.production_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  plan_date date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'in_progress', 'completed', 'cancelled')),
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_production_plans_restaurant ON public.production_plans(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_production_plans_date ON public.production_plans(plan_date);

CREATE TABLE IF NOT EXISTS public.production_plan_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_plan_id uuid NOT NULL REFERENCES public.production_plans(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  planned_qty numeric(12,4) NOT NULL,
  actual_qty numeric(12,4),
  uom text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_production_plan_items_plan ON public.production_plan_items(production_plan_id);

CREATE TABLE IF NOT EXISTS public.commissary_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  commissary_location_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  destination_restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_commissary_orders_commissary ON public.commissary_orders(commissary_location_id);
CREATE INDEX IF NOT EXISTS idx_commissary_orders_destination ON public.commissary_orders(destination_restaurant_id);

CREATE TABLE IF NOT EXISTS public.commissary_order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  commissary_order_id uuid NOT NULL REFERENCES public.commissary_orders(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  quantity_ordered numeric(12,4) NOT NULL,
  quantity_shipped numeric(12,4),
  quantity_received numeric(12,4),
  unit_price numeric(12,4) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_commissary_order_items_order ON public.commissary_order_items(commissary_order_id);

CREATE TABLE IF NOT EXISTS public.transfer_pricing_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_location_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  to_location_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.items(id) ON DELETE CASCADE,
  markup_percent numeric(7,4) NOT NULL DEFAULT 0,
  effective_from date NOT NULL,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_transfer_pricing_from ON public.transfer_pricing_rules(from_location_id);

-- ═══════════════════════════════════════════════════════════════
-- 9.3 Cost Centers / Profit Centers
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.cost_centers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  type text NOT NULL DEFAULT 'cost_center' CHECK (type IN ('cost_center', 'profit_center')),
  parent_id uuid REFERENCES public.cost_centers(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_cost_centers_restaurant ON public.cost_centers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_parent ON public.cost_centers(parent_id);

CREATE TABLE IF NOT EXISTS public.intercompany_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_center_id uuid NOT NULL REFERENCES public.cost_centers(id) ON DELETE CASCADE,
  to_center_id uuid NOT NULL REFERENCES public.cost_centers(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  description text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  is_eliminated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_intercompany_from ON public.intercompany_transactions(from_center_id);
CREATE INDEX IF NOT EXISTS idx_intercompany_to ON public.intercompany_transactions(to_center_id);
CREATE INDEX IF NOT EXISTS idx_intercompany_eliminated ON public.intercompany_transactions(is_eliminated) WHERE is_eliminated = false;

-- ═══════════════════════════════════════════════════════════════
-- 9.4 Bank Reconciliation
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  account_name text NOT NULL,
  account_number text NOT NULL,
  bank_name text NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_restaurant ON public.bank_accounts(restaurant_id);

CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_account_id uuid NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  transaction_date date NOT NULL,
  description text NOT NULL,
  amount numeric(14,2) NOT NULL,
  reference text,
  category text,
  is_reconciled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account ON public.bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON public.bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_reconciled ON public.bank_transactions(is_reconciled) WHERE is_reconciled = false;

CREATE TABLE IF NOT EXISTS public.reconciliation_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_transaction_id uuid NOT NULL REFERENCES public.bank_transactions(id) ON DELETE CASCADE,
  reconciled_to_type text NOT NULL CHECK (reconciled_to_type IN ('transaction', 'invoice', 'purchase')),
  reconciled_to_id uuid NOT NULL,
  amount numeric(14,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'unmatched')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_reconciliation_entries_bank ON public.reconciliation_entries(bank_transaction_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_entries_status ON public.reconciliation_entries(status);

-- ═══════════════════════════════════════════════════════════════
-- 9.5 Compliance Layer
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name text NOT NULL,
  retention_days integer NOT NULL,
  archive_to text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_data_retention_policies_table ON public.data_retention_policies(table_name);

CREATE TABLE IF NOT EXISTS public.pii_data_classification (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name text NOT NULL,
  column_name text NOT NULL,
  classification text NOT NULL CHECK (classification IN ('pii', 'sensitive', 'internal', 'public')),
  is_encrypted boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pii_classification_column ON public.pii_data_classification(table_name, column_name);

CREATE TABLE IF NOT EXISTS public.gdpr_export_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_type text NOT NULL CHECK (request_type IN ('export', 'rectify', 'erase', 'restrict')),
  requestor_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  data jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_gdpr_export_requests_status ON public.gdpr_export_requests(status);
