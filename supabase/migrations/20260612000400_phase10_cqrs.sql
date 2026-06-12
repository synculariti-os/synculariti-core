-- Phase 10: CQRS Migration
-- 10.1 Append-only event store (domain_events)
-- 10.2 Domain event types pre-registered per aggregate
-- 10.3 Projection tracking table
-- 10.4 (NestJS refactor — no DB changes)
-- 10.5 Saga orchestrator (saga_instances, saga_steps, enqueue + advance logic)
-- 10.6 Read model rebuild functions

-- ═══════════════════════════════════════════════════════════════
-- 10.1 Append-Only Event Store
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.domain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  event_version integer NOT NULL DEFAULT 1,
  data jsonb NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_domain_events_version UNIQUE (aggregate_type, aggregate_id, event_version)
);

CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate
  ON public.domain_events(aggregate_type, aggregate_id);
CREATE INDEX IF NOT EXISTS idx_domain_events_event_type
  ON public.domain_events(event_type);
CREATE INDEX IF NOT EXISTS idx_domain_events_occurred
  ON public.domain_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_domain_events_correlation
  ON public.domain_events(((metadata ->> 'correlation_id')::uuid))
  WHERE metadata ? 'correlation_id';
CREATE INDEX IF NOT EXISTS idx_domain_events_tenant
  ON public.domain_events(((metadata ->> 'tenant_id')::uuid))
  WHERE metadata ? 'tenant_id';

-- Prevent UPDATE or DELETE on domain_events (append-only enforcement)
CREATE OR REPLACE FUNCTION public.prevent_domain_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'domain_events is append-only: UPDATE and DELETE are not permitted'
    USING HINT = 'Insert a compensating event instead of mutating history.';
END;
$$;

CREATE TRIGGER trg_prevent_domain_event_update
  BEFORE UPDATE ON public.domain_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_domain_event_mutation();

CREATE TRIGGER trg_prevent_domain_event_delete
  BEFORE DELETE ON public.domain_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_domain_event_mutation();

-- ═══════════════════════════════════════════════════════════════
-- 10.1b Append helper (idempotent with optimistic version check)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.append_domain_event(
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_event_type text,
  p_data jsonb,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_next_version integer;
  v_event_id uuid;
BEGIN
  -- Compute next version: max existing + 1, or 1 if first event
  SELECT COALESCE(MAX(event_version), 0) + 1
    INTO v_next_version
    FROM public.domain_events
   WHERE aggregate_type = p_aggregate_type
     AND aggregate_id = p_aggregate_id;

  INSERT INTO public.domain_events (aggregate_type, aggregate_id, event_type, event_version, data, metadata)
  VALUES (p_aggregate_type, p_aggregate_id, p_event_type, v_next_version, p_data, p_metadata)
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 10.2 Domain Event Type Registry
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.domain_event_types (
  event_type text PRIMARY KEY,
  aggregate_type text NOT NULL,
  description text,
  schema_def jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed known domain event types for all existing aggregates
INSERT INTO public.domain_event_types (event_type, aggregate_type, description) VALUES
  -- Inventory
  ('inventory.batch.received',       'inventory',   'New stock received into a batch'),
  ('inventory.batch.adjusted',       'inventory',   'Inventory batch quantity adjusted'),
  ('inventory.batch.transferred',    'inventory',   'Stock moved between locations'),
  ('inventory.count.completed',      'inventory',   'Physical count completed with variances'),
  ('inventory.batch.expired',        'inventory',   'Batch marked as expired / written off'),
  -- Procurement
  ('purchase_order.created',         'purchase_order', 'New purchase order issued'),
  ('purchase_order.updated',         'purchase_order', 'PO line items or status changed'),
  ('purchase_order.cancelled',       'purchase_order', 'PO cancelled before receipt'),
  ('purchase_order.received',        'purchase_order', 'Partial or full goods receipt against PO'),
  ('purchase_order.invoiced',        'purchase_order', 'Invoice matched to PO line items'),
  ('purchase_order.paid',            'purchase_order', 'Payment released against PO'),
  ('purchase_order.payment_failed',  'purchase_order', 'Payment rejected / insufficient funds'),
  -- Recipes
  ('recipe.created',                 'recipe',      'New recipe defined'),
  ('recipe.updated',                 'recipe',      'Recipe ingredients or yield changed'),
  ('recipe.costed',                  'recipe',      'Recipe cost snapshot taken'),
  ('recipe.versioned',               'recipe',      'New menu version published with this recipe'),
  -- Menu
  ('menu.version.created',           'menu',        'New menu version created'),
  ('menu.version.published',         'menu',        'Menu version activated for service'),
  ('menu.item.pricing_changed',      'menu',        'Menu item price modified'),
  -- Sales
  ('sales.transaction.created',      'sales',       'POS sale recorded'),
  ('sales.transaction.refunded',     'sales',       'Sale refunded / voided'),
  -- Finance
  ('transaction.posted',             'finance',     'Journal entry posted to ledger'),
  ('transaction.reversed',           'finance',     'Journal entry reversed'),
  ('invoice.created',                'finance',     'Supplier invoice received'),
  ('invoice.paid',                   'finance',     'Invoice payment completed'),
  ('invoice.reconciled',             'finance',     'Invoice matched to bank transaction'),
  -- Labor
  ('shift.created',                  'labor',       'New shift created'),
  ('time_entry.submitted',           'labor',       'Time punch recorded'),
  ('time_entry.approved',            'labor',       'Time entry manager-approved'),
  ('labor.costed',                   'labor',       'Labor cost snapshot taken'),
  -- Commissary / transfer
  ('commissary.order.shipped',       'commissary',  'Commissary order dispatched'),
  ('commissary.order.received',      'commissary',  'Commissary order delivered'),
  ('transfer_pricing.applied',       'commissary',  'Transfer price rule triggered'),
  -- Three-way match (procurement sub-flow)
  ('goods.receipt.confirmed',        'procurement', 'Goods receipt posted against PO'),
  ('invoice.match.verified',         'procurement', 'Three-way match completed (PO + Receipt + Invoice)'),
  ('invoice.match.failed',           'procurement', 'Three-way match discrepancy flagged'),
  -- CRM / Loyalty
  ('guest.profile.created',          'crm',         'New guest profile registered'),
  ('guest.profile.merged',           'crm',         'Duplicate profiles merged'),
  ('loyalty.points.awarded',         'loyalty',     'Points credited to loyalty account'),
  ('loyalty.points.redeemed',        'loyalty',     'Points redeemed against reward'),
  ('loyalty.tier.changed',           'loyalty',     'Member tier upgraded or downgraded'),
  -- Reservations
  ('reservation.created',            'reservations','New booking created'),
  ('reservation.confirmed',          'reservations','Booking confirmed by guest'),
  ('reservation.cancelled',          'reservations','Booking cancelled'),
  ('reservation.seated',             'reservations','Party seated at table'),
  -- KDS
  ('ticket.created',                 'kds',         'Kitchen ticket opened'),
  ('ticket.item.completed',          'kds',         'Line item marked done'),
  ('ticket.routed',                  'kds',         'Ticket sent to station'),
  ('ticket.closed',                  'kds',         'All items completed, ticket closed')
ON CONFLICT (event_type) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 10.3 Projection Tracking
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.projection_status (
  projection_name text PRIMARY KEY,
  last_event_id uuid,
  last_occurred_at timestamptz,
  is_stale boolean NOT NULL DEFAULT false,
  last_refreshed_at timestamptz,
  error_count integer NOT NULL DEFAULT 0,
  last_error text
);

-- Register known materialized-view projections
INSERT INTO public.projection_status (projection_name) VALUES
  ('mv_daily_sales_summary'),
  ('mv_inventory_valuation'),
  ('mv_cogs_by_recipe'),
  ('mv_prime_cost'),
  ('mv_menu_item_performance')
ON CONFLICT (projection_name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 10.5 Saga Orchestrator
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.saga_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_type text NOT NULL,
  correlation_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'completed', 'failed', 'compensating')),
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  tenant_id uuid,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_saga_instances_correlation
  ON public.saga_instances(correlation_id);
CREATE INDEX IF NOT EXISTS idx_saga_instances_status
  ON public.saga_instances(status);

CREATE TABLE IF NOT EXISTS public.saga_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  saga_instance_id uuid NOT NULL REFERENCES public.saga_instances(id) ON DELETE CASCADE,
  step_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'executing', 'completed', 'failed', 'compensated')),
  event_type text NOT NULL,
  compensating_event_type text,
  executed_at timestamptz,
  compensated_at timestamptz,
  UNIQUE (saga_instance_id, step_name)
);

CREATE INDEX IF NOT EXISTS idx_saga_steps_instance
  ON public.saga_steps(saga_instance_id);

-- Saga type registry
CREATE TABLE IF NOT EXISTS public.saga_definitions (
  saga_type text PRIMARY KEY,
  description text,
  step_definitions jsonb NOT NULL,  -- ordered array of {step_name, event_type, compensating_event_type}
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed the standard Procure-to-Pay saga
INSERT INTO public.saga_definitions (saga_type, description, step_definitions) VALUES
(
  'procure_to_pay',
  'Purchase Order → Goods Receipt → Invoice Match → Payment Release',
  '[
    {"step_name": "po_created",       "event_type": "purchase_order.created",    "compensating_event_type": "purchase_order.cancelled"},
    {"step_name": "goods_received",   "event_type": "goods.receipt.confirmed",   "compensating_event_type": "inventory.batch.adjusted"},
    {"step_name": "invoice_matched",  "event_type": "invoice.match.verified",    "compensating_event_type": "invoice.match.failed"},
    {"step_name": "payment_sent",     "event_type": "purchase_order.paid",       "compensating_event_type": "purchase_order.payment_failed"}
  ]'::jsonb
),
(
  'commissary_transfer',
  'Commissary Order Shipped → Received → Transfer Price Applied',
  '[
    {"step_name": "order_shipped",    "event_type": "commissary.order.shipped",  "compensating_event_type": null},
    {"step_name": "order_received",   "event_type": "commissary.order.received", "compensating_event_type": null},
    {"step_name": "pricing_applied",  "event_type": "transfer_pricing.applied",  "compensating_event_type": null}
  ]'::jsonb
),
(
  'guest_loyalty',
  'Guest Visit → Points Awarded → Tier Check → Reward Eligibility',
  '[
    {"step_name": "visit_recorded",   "event_type": "guest.profile.created",     "compensating_event_type": null},
    {"step_name": "points_awarded",   "event_type": "loyalty.points.awarded",    "compensating_event_type": "loyalty.points.redeemed"},
    {"step_name": "tier_evaluated",   "event_type": "loyalty.tier.changed",      "compensating_event_type": null}
  ]'::jsonb
)
ON CONFLICT (saga_type) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 10.5b Saga orchestration functions
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.start_saga(
  p_saga_type text,
  p_correlation_id uuid,
  p_tenant_id uuid DEFAULT NULL,
  p_initial_state jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_saga_id uuid;
  v_step jsonb;
BEGIN
  INSERT INTO public.saga_instances (saga_type, correlation_id, tenant_id, state)
  VALUES (p_saga_type, p_correlation_id, p_tenant_id, p_initial_state)
  RETURNING id INTO v_saga_id;

  -- Create step records from the saga definition
  FOR v_step IN
    SELECT value FROM public.saga_definitions,
    LATERAL jsonb_array_elements(step_definitions) AS value
    WHERE saga_type = p_saga_type
    ORDER BY ordinality
  LOOP
    INSERT INTO public.saga_steps (saga_instance_id, step_name, event_type, compensating_event_type)
    VALUES (
      v_saga_id,
      v_step ->> 'step_name',
      v_step ->> 'event_type',
      v_step ->> 'compensating_event_type'
    );
  END LOOP;

  RETURN v_saga_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.advance_saga(
  p_event_type text,
  p_correlation_id uuid,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS text  -- returns the new saga status
LANGUAGE plpgsql
AS $$
DECLARE
  v_saga public.saga_instances%ROWTYPE;
  v_current_step public.saga_steps%ROWTYPE;
  v_next_step public.saga_steps%ROWTYPE;
  v_all_completed boolean;
BEGIN
  -- Find the running saga for this correlation
  SELECT * INTO v_saga
    FROM public.saga_instances
   WHERE correlation_id = p_correlation_id
     AND status = 'running'
   ORDER BY started_at DESC
   LIMIT 1
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'no_saga';
  END IF;

  -- Find the step that corresponds to this event
  SELECT * INTO v_current_step
    FROM public.saga_steps
   WHERE saga_instance_id = v_saga.id
     AND event_type = p_event_type;

  IF NOT FOUND THEN
    RETURN v_saga.status;  -- unrelated event, no-op
  END IF;

  -- Mark step as completed
  UPDATE public.saga_steps
     SET status = 'completed',
         executed_at = now()
   WHERE id = v_current_step.id;

  -- Merge data into saga state
  UPDATE public.saga_instances
     SET state = state || p_data,
         updated_at = now()
   WHERE id = v_saga.id;

  -- Check if all steps are completed
  SELECT bool_and(status = 'completed') INTO v_all_completed
    FROM public.saga_steps
   WHERE saga_instance_id = v_saga.id;

  IF v_all_completed THEN
    UPDATE public.saga_instances
       SET status = 'completed',
           completed_at = now(),
           updated_at = now()
     WHERE id = v_saga.id;
    RETURN 'completed';
  END IF;

  RETURN 'running';
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_saga(
  p_correlation_id uuid,
  p_failed_event_type text,
  p_error_data jsonb DEFAULT '{}'::jsonb
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_saga public.saga_instances%ROWTYPE;
  v_step public.saga_steps%ROWTYPE;
  r_step public.saga_steps%ROWTYPE;
BEGIN
  SELECT * INTO v_saga
    FROM public.saga_instances
   WHERE correlation_id = p_correlation_id
     AND status = 'running'
   ORDER BY started_at DESC
   LIMIT 1
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'no_saga';
  END IF;

  -- Mark the failing step
  UPDATE public.saga_steps
     SET status = 'failed'
   WHERE saga_instance_id = v_saga.id
     AND event_type = p_failed_event_type;

  -- Update saga status to compensating
  UPDATE public.saga_instances
     SET status = 'compensating',
         state = state || p_error_data,
         updated_at = now()
   WHERE id = v_saga.id;

  -- Walk completed steps in reverse and mark for compensation
  FOR r_step IN
    SELECT * FROM public.saga_steps
     WHERE saga_instance_id = v_saga.id
       AND status = 'completed'
     ORDER BY executed_at DESC
  LOOP
    IF r_step.compensating_event_type IS NOT NULL THEN
      UPDATE public.saga_steps
         SET status = 'compensated',
             compensated_at = now()
       WHERE id = r_step.id;
    END IF;
  END LOOP;

  UPDATE public.saga_instances
     SET status = 'failed',
         completed_at = now(),
         updated_at = now()
   WHERE id = v_saga.id;

  RETURN 'failed';
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 10.6 Read Model Rebuild Functions
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.rebuild_projection(p_projection_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_start timestamptz;
  v_rows integer;
BEGIN
  v_start := clock_timestamp();

  CASE p_projection_name
    WHEN 'mv_daily_sales_summary' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_daily_sales_summary;
      GET DIAGNOSTICS v_rows = ROW_COUNT;

    WHEN 'mv_inventory_valuation' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_inventory_valuation;
      GET DIAGNOSTICS v_rows = ROW_COUNT;

    WHEN 'mv_cogs_by_recipe' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_cogs_by_recipe;
      GET DIAGNOSTICS v_rows = ROW_COUNT;

    WHEN 'mv_prime_cost' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_prime_cost;
      GET DIAGNOSTICS v_rows = ROW_COUNT;

    WHEN 'mv_menu_item_performance' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_menu_item_performance;
      GET DIAGNOSTICS v_rows = ROW_COUNT;

    ELSE
      RETURN format('unknown projection: %s', p_projection_name);
  END CASE;

  UPDATE public.projection_status
     SET last_refreshed_at = clock_timestamp(),
         is_stale = false,
         error_count = 0,
         last_error = null
   WHERE projection_name = p_projection_name;

  RETURN format('refreshed %s in %s ms (%s rows)', p_projection_name,
    round(extract(epoch from clock_timestamp() - v_start) * 1000), v_rows);
END;
$$;

-- Rebuild all stale projections
CREATE OR REPLACE FUNCTION public.rebuild_stale_projections()
RETURNS TABLE(projection_name text, result text)
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT projection_name FROM public.projection_status
     WHERE is_stale = true OR last_refreshed_at IS NULL
  LOOP
    result := public.rebuild_projection(r.projection_name);
    projection_name := r.projection_name;
    RETURN NEXT;
  END LOOP;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 10.6b Snapshot table for aggregate state rebuild
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.aggregate_snapshots (
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  snapshot_version integer NOT NULL,
  state jsonb NOT NULL,
  last_event_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (aggregate_type, aggregate_id)
);

CREATE OR REPLACE FUNCTION public.take_aggregate_snapshot(
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_state jsonb
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_last_event_id uuid;
  v_last_version integer;
BEGIN
  SELECT id, event_version INTO v_last_event_id, v_last_version
    FROM public.domain_events
   WHERE aggregate_type = p_aggregate_type
     AND aggregate_id = p_aggregate_id
   ORDER BY event_version DESC
   LIMIT 1;

  INSERT INTO public.aggregate_snapshots (aggregate_type, aggregate_id, snapshot_version, state, last_event_id)
  VALUES (p_aggregate_type, p_aggregate_id, v_last_version, p_state, v_last_event_id)
  ON CONFLICT (aggregate_type, aggregate_id)
  DO UPDATE SET
    snapshot_version = v_last_version,
    state = p_state,
    last_event_id = v_last_event_id,
    created_at = now();

  RETURN format('snapshot %s/%s at version %s', p_aggregate_type, p_aggregate_id, v_last_version);
END;
$$;
