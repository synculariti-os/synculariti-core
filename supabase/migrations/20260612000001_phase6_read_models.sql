-- Phase 6: Read Models & Analytics (P1)
-- Materialized views, recipe_cost_snapshots, and menu_item_performance

-- 6.5 recipe_cost_snapshots table (store historical recipe cost snapshots)
CREATE TABLE IF NOT EXISTS public.recipe_cost_snapshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  cost_per_unit numeric(18,6),
  total_cost numeric(18,6),
  yield_qty numeric(18,6),
  ingredient_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recipe_cost_snapshots_date ON recipe_cost_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_recipe_cost_snapshots_recipe ON recipe_cost_snapshots(recipe_id);

-- 6.1 mv_daily_sales_summary — per-location, per-date, per-item sales aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_daily_sales_summary AS
SELECT
  p.location_id,
  p.transaction_time::date AS business_date,
  p.item_name,
  p.item_sku,
  COALESCE(SUM(p.quantity), 0) AS total_quantity,
  COALESCE(SUM(p.revenue), 0) AS total_revenue,
  COUNT(*) FILTER (WHERE p.is_void) AS total_voids,
  COUNT(*) FILTER (WHERE p.is_comp) AS total_comps,
  COUNT(*) FILTER (WHERE p.recipe_found) AS recipe_matched_count,
  COUNT(*) AS total_transactions,
  NOW() AS computed_at
FROM pos_transaction_staging p
WHERE NOT p.is_void
GROUP BY p.location_id, p.transaction_time::date, p.item_name, p.item_sku
WITH NO DATA;

-- Unique index for CONCURRENTLY refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_sales_summary_pk
ON public.mv_daily_sales_summary (location_id, business_date, COALESCE(item_name, ''), COALESCE(item_sku, ''));

-- 6.2 mv_inventory_valuation — FIFO cost by item/location
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_inventory_valuation AS
SELECT
  ib.restaurant_id AS location_id,
  ib.item_id,
  COALESCE(i.name, 'Unknown') AS item_name,
  COALESCE(SUM(ib.remaining_qty), 0) AS total_quantity,
  COALESCE(SUM(ib.remaining_qty * ib.landed_unit_cost), 0) AS total_value,
  CASE
    WHEN COALESCE(SUM(ib.remaining_qty), 0) > 0
    THEN COALESCE(SUM(ib.remaining_qty * ib.landed_unit_cost), 0) / SUM(ib.remaining_qty)
    ELSE 0
  END AS avg_unit_cost,
  'FIFO' AS valuation_method,
  NOW() AS computed_at
FROM inventory_batches ib
LEFT JOIN items i ON ib.item_id = i.id
WHERE ib.remaining_qty > 0
GROUP BY ib.restaurant_id, ib.item_id, i.name
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_inventory_valuation_pk
ON public.mv_inventory_valuation (location_id, item_id);

-- 6.3 mv_cogs_by_recipe — COGS per recipe based on ingredient consumption
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_cogs_by_recipe AS
SELECT
  ppl.restaurant_id AS location_id,
  r.id AS recipe_id,
  r.recipe_name,
  ppl.prep_item_id,
  ppl.produced_at::date AS production_date,
  ppl.yield_qty_produced,
  COUNT(DISTINCT ri.id) AS ingredient_count,
  COALESCE(SUM(ri.quantity_required), 0) AS total_ingredient_qty,
  -- Estimate ingredient cost using latest batch landed_unit_cost
  COALESCE(
    SUM(ri.quantity_required * COALESCE(ib.landed_unit_cost, 0)),
    0
  ) AS estimated_ingredient_cost,
  NOW() AS computed_at
FROM prep_production_logs ppl
JOIN recipes r ON r.produces_item_id = ppl.prep_item_id
LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
LEFT JOIN LATERAL (
  SELECT ib2.landed_unit_cost
  FROM inventory_batches ib2
  WHERE ib2.item_id = ri.ingredient_item_id
    AND ib2.remaining_qty > 0
  ORDER BY ib2.created_at DESC
  LIMIT 1
) ib ON true
GROUP BY ppl.restaurant_id, r.id, r.recipe_name, ppl.prep_item_id, ppl.produced_at, ppl.yield_qty_produced
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_cogs_by_recipe_pk
ON public.mv_cogs_by_recipe (location_id, recipe_id, production_date, COALESCE(prep_item_id::text, ''));

-- 6.4 mv_prime_cost — COGS + labor prime cost per location/period
-- NOTE: labor_cost = 0 placeholder until Phase 7.1 (labor management) is implemented
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_prime_cost AS
SELECT
  ppl.restaurant_id AS location_id,
  ppl.produced_at::date AS business_date,
  COALESCE(SUM(mv.estimated_ingredient_cost), 0) AS total_cogs,
  0 AS total_labor_cost, -- placeholder until Phase 7.1
  COALESCE(SUM(mv.estimated_ingredient_cost), 0) AS prime_cost,
  0 AS revenue, -- placeholder; sales revenue attribution by day/location available in mv_daily_sales_summary
  NOW() AS computed_at
FROM prep_production_logs ppl
LEFT JOIN mv_cogs_by_recipe mv ON mv.prep_item_id = ppl.prep_item_id AND mv.production_date = ppl.produced_at::date
GROUP BY ppl.restaurant_id, ppl.produced_at::date
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_prime_cost_pk
ON public.mv_prime_cost (location_id, business_date);

-- 6.6 mv_menu_item_performance — revenue & margin per menu item
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_menu_item_performance AS
SELECT
  p.location_id,
  p.transaction_time::date AS business_date,
  p.item_name,
  p.item_sku,
  COUNT(*) AS transaction_count,
  SUM(p.quantity) AS total_quantity_sold,
  SUM(p.revenue) AS total_revenue,
  AVG(p.revenue / NULLIF(p.quantity, 0)) AS avg_selling_price,
  COUNT(*) FILTER (WHERE p.recipe_found) AS recipe_matched_count,
  NOW() AS computed_at
FROM pos_transaction_staging p
WHERE NOT p.is_void
GROUP BY p.location_id, p.transaction_time::date, p.item_name, p.item_sku
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_menu_item_performance_pk
ON public.mv_menu_item_performance (location_id, business_date, COALESCE(item_name, ''), COALESCE(item_sku, ''));

-- Helper function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_mvs()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_daily_sales_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_inventory_valuation;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_cogs_by_recipe;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_prime_cost;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_menu_item_performance;
END;
$$ LANGUAGE plpgsql;

-- Initial data refresh
REFRESH MATERIALIZED VIEW public.mv_daily_sales_summary;
REFRESH MATERIALIZED VIEW public.mv_inventory_valuation;
REFRESH MATERIALIZED VIEW public.mv_cogs_by_recipe;
REFRESH MATERIALIZED VIEW public.mv_prime_cost;
REFRESH MATERIALIZED VIEW public.mv_menu_item_performance;
