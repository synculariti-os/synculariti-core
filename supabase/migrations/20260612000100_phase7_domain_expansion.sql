-- Phase 7: Domain Expansion (P1–P2)
-- 7.1 Labor Management, 7.2 Three-Way Match, 7.3 Menu Versioning, 7.4 Allergen/Nutrition

-- ═══════════════════════════════════════════════════════════════
-- 7.1 Labor Management
-- ═══════════════════════════════════════════════════════════════

-- shifts: planned shift with role and wage
CREATE TABLE IF NOT EXISTS public.shifts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  role text NOT NULL,
  shift_date date NOT NULL DEFAULT CURRENT_DATE,
  shift_start timestamptz NOT NULL,
  shift_end timestamptz NOT NULL,
  wage numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_shifts_restaurant ON public.shifts(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON public.shifts(shift_date);

-- time_entries: clock-in/out and breaks per employee
CREATE TABLE IF NOT EXISTS public.time_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id uuid REFERENCES public.shifts(id) ON DELETE SET NULL,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  employee_name text NOT NULL,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  clock_in timestamptz NOT NULL,
  clock_out timestamptz,
  break_start timestamptz,
  break_end timestamptz,
  total_hours numeric(6,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_time_entries_restaurant ON public.time_entries(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON public.time_entries(entry_date);

-- labor_standards: target labor % by revenue bucket
CREATE TABLE IF NOT EXISTS public.labor_standards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  revenue_min numeric(12,2) NOT NULL,
  revenue_max numeric(12,2),
  target_labor_percent numeric(5,2) NOT NULL,
  role text,
  effective_from date NOT NULL,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_labor_standards_restaurant ON public.labor_standards(restaurant_id);

-- labor_cost_actuals: daily/weekly aggregated labor cost per location
CREATE TABLE IF NOT EXISTS public.labor_cost_actuals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_hours numeric(10,2) NOT NULL DEFAULT 0,
  total_wages numeric(12,2) NOT NULL DEFAULT 0,
  revenue numeric(12,2),
  labor_percent numeric(5,2),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_labor_cost_actuals_restaurant ON public.labor_cost_actuals(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_labor_cost_actuals_period ON public.labor_cost_actuals(period_start, period_end);

-- ═══════════════════════════════════════════════════════════════
-- 7.2 Three-Way Match (Procurement)
-- ═══════════════════════════════════════════════════════════════

-- goods_receipts: receiving a purchase order
CREATE TABLE IF NOT EXISTS public.goods_receipts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  received_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'complete')),
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_po ON public.goods_receipts(po_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_restaurant ON public.goods_receipts(restaurant_id);

-- goods_receipt_items: line-level receiving details
CREATE TABLE IF NOT EXISTS public.goods_receipt_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goods_receipt_id uuid NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
  po_line_item_id uuid NOT NULL REFERENCES public.po_line_items(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  quantity_received numeric(12,4) NOT NULL,
  quantity_accepted numeric(12,4) NOT NULL,
  quantity_rejected numeric(12,4) NOT NULL DEFAULT 0,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_receipt ON public.goods_receipt_items(goods_receipt_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_po_line ON public.goods_receipt_items(po_line_item_id);

-- three_way_match_results: PO vs Receipt vs Invoice matching
CREATE TABLE IF NOT EXISTS public.three_way_match_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  goods_receipt_id uuid NOT NULL REFERENCES public.goods_receipts(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  po_line_item_id uuid NOT NULL REFERENCES public.po_line_items(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'mismatch')),
  po_quantity numeric(12,4),
  received_quantity numeric(12,4),
  invoice_quantity numeric(12,4),
  po_price numeric(12,4),
  invoice_price numeric(12,4),
  variance_quantity numeric(12,4),
  variance_price numeric(12,4),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_three_way_match_po ON public.three_way_match_results(po_id);
CREATE INDEX IF NOT EXISTS idx_three_way_match_status ON public.three_way_match_results(status);

-- ═══════════════════════════════════════════════════════════════
-- 7.3 Menu Versioning + Seasonal Menus
-- ═══════════════════════════════════════════════════════════════

-- menu_versions: named menu period with effective dates
CREATE TABLE IF NOT EXISTS public.menu_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  effective_from date NOT NULL,
  effective_to date,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_menu_versions_restaurant ON public.menu_versions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_versions_active ON public.menu_versions(is_active) WHERE is_active = true;

-- menu_version_items: items (recipes/items) in a menu version with pricing
CREATE TABLE IF NOT EXISTS public.menu_version_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_version_id uuid NOT NULL REFERENCES public.menu_versions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  price numeric(12,4) NOT NULL,
  available boolean NOT NULL DEFAULT true,
  sort_order integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_menu_version_items_version ON public.menu_version_items(menu_version_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_version_items_unique ON public.menu_version_items(menu_version_id, item_id);

-- ═══════════════════════════════════════════════════════════════
-- 7.4 Allergen / Dietary / Nutrition on Items
-- ═══════════════════════════════════════════════════════════════

-- item_allergens: allergens linked to items
CREATE TABLE IF NOT EXISTS public.item_allergens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  allergen text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_item_allergens_item ON public.item_allergens(item_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_item_allergens_unique ON public.item_allergens(item_id, allergen);

-- item_nutritionals: nutritional info per item
CREATE TABLE IF NOT EXISTS public.item_nutritionals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  serving_size text,
  calories numeric(8,2),
  fat_g numeric(8,2),
  saturated_fat_g numeric(8,2),
  protein_g numeric(8,2),
  carbs_g numeric(8,2),
  fiber_g numeric(8,2),
  sugar_g numeric(8,2),
  sodium_mg numeric(8,2),
  cholesterol_mg numeric(8,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_item_nutritionals_item ON public.item_nutritionals(item_id);
