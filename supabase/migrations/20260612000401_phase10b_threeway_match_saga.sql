-- Phase 10b.1: Wire three-way match flow into saga orchestrator
-- purchase_order.created → saga:start → goods.receipt.confirmed → advance → invoice.match.verified → complete

-- ═══════════════════════════════════════════════════════════════
-- Helper: emit a domain event from a trigger
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.emit_domain_event(
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_event_type text,
  p_data jsonb,
  p_tenant_id uuid DEFAULT NULL,
  p_correlation_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_metadata jsonb := '{}'::jsonb;
BEGIN
  IF p_tenant_id IS NOT NULL THEN
    v_metadata := v_metadata || jsonb_build_object('tenant_id', p_tenant_id);
  END IF;
  IF p_correlation_id IS NOT NULL THEN
    v_metadata := v_metadata || jsonb_build_object('correlation_id', p_correlation_id);
  END IF;
  RETURN public.append_domain_event(p_aggregate_type, p_aggregate_id, p_event_type, p_data, v_metadata);
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 1. Purchase Order lifecycle triggers
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.trg_purchase_order_created()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_data jsonb;
  v_correlation_id uuid;
BEGIN
  v_data := jsonb_build_object(
    'po_id', NEW.id,
    'restaurant_id', NEW.restaurant_id,
    'vendor_id', NEW.vendor_id,
    'total_amount', COALESCE(NEW.freight_charge, 0) + COALESCE(NEW.tax_amount, 0) - COALESCE(NEW.discount_amount, 0),
    'currency', 'EUR'
  );

  PERFORM public.emit_domain_event(
    'purchase_order', NEW.id, 'purchase_order.created',
    v_data, NEW.tenant_id, NEW.id
  );

  -- Start the procure-to-pay saga
  PERFORM public.start_saga('procure_to_pay', NEW.id, NEW.tenant_id,
    jsonb_build_object('po_id', NEW.id, 'vendor_id', NEW.vendor_id)
  );

  -- Auto-complete the first step (PO was just created)
  PERFORM public.advance_saga('purchase_order.created', NEW.id,
    jsonb_build_object('po_id', NEW.id, 'vendor_id', NEW.vendor_id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_purchase_order_created ON public.purchase_orders;
CREATE TRIGGER trg_purchase_order_created
  AFTER INSERT ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.trg_purchase_order_created();

-- Track PO status changes (cancelled, paid, etc.)
CREATE OR REPLACE FUNCTION public.trg_purchase_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    PERFORM public.emit_domain_event(
      'purchase_order', NEW.id, 'purchase_order.cancelled',
      jsonb_build_object('po_id', NEW.id, 'previous_status', OLD.status),
      NEW.tenant_id, NEW.id
    );
  END IF;

  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    PERFORM public.emit_domain_event(
      'purchase_order', NEW.id, 'purchase_order.paid',
      jsonb_build_object('po_id', NEW.id, 'total_amount', COALESCE(NEW.freight_charge, 0) + COALESCE(NEW.tax_amount, 0) - COALESCE(NEW.discount_amount, 0)),
      NEW.tenant_id, NEW.id
    );
    -- Advance saga: payment sent
    PERFORM public.advance_saga('purchase_order.paid', NEW.id,
      jsonb_build_object('paid_at', now())
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_purchase_order_status_change ON public.purchase_orders;
CREATE TRIGGER trg_purchase_order_status_change
  AFTER UPDATE OF status ON public.purchase_orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.trg_purchase_order_status_change();

-- ═══════════════════════════════════════════════════════════════
-- 2. Goods Receipt → confirm receipt event + advance saga
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.trg_goods_receipt_created()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_data jsonb;
  v_po_tenant_id uuid;
BEGIN
  -- Get tenant_id from the purchase order
  SELECT tenant_id INTO v_po_tenant_id
    FROM public.purchase_orders
   WHERE id = NEW.po_id;

  v_data := jsonb_build_object(
    'goods_receipt_id', NEW.id,
    'po_id', NEW.po_id,
    'restaurant_id', NEW.restaurant_id,
    'received_date', NEW.received_date
  );

  PERFORM public.emit_domain_event(
    'procurement', NEW.id, 'goods.receipt.confirmed',
    v_data, v_po_tenant_id, NEW.po_id
  );

  -- Advance saga: goods received
  PERFORM public.advance_saga('goods.receipt.confirmed', NEW.po_id,
    jsonb_build_object('goods_receipt_id', NEW.id, 'received_date', NEW.received_date)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_goods_receipt_created ON public.goods_receipts;
CREATE TRIGGER trg_goods_receipt_created
  AFTER INSERT ON public.goods_receipts
  FOR EACH ROW EXECUTE FUNCTION public.trg_goods_receipt_created();

-- ═══════════════════════════════════════════════════════════════
-- 3. Three-way match result → verified or failed
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.trg_three_way_match_result()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_data jsonb;
  v_po_tenant_id uuid;
BEGIN
  -- Get tenant_id from the purchase order
  SELECT tenant_id INTO v_po_tenant_id
    FROM public.purchase_orders
   WHERE id = NEW.po_id;

  -- Guard: only act on status changes (INSERT always fires, UPDATE only if status changed)
  IF TG_OP = 'UPDATE' AND OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'matched' THEN
    v_data := jsonb_build_object(
      'match_id', NEW.id,
      'po_id', NEW.po_id,
      'goods_receipt_id', NEW.goods_receipt_id,
      'invoice_id', NEW.invoice_id,
      'variance_quantity', NEW.variance_quantity,
      'variance_price', NEW.variance_price
    );

    PERFORM public.emit_domain_event(
      'procurement', NEW.id, 'invoice.match.verified',
      v_data, v_po_tenant_id, NEW.po_id
    );

    PERFORM public.advance_saga('invoice.match.verified', NEW.po_id,
      jsonb_build_object(
        'match_id', NEW.id,
        'variance_quantity', NEW.variance_quantity,
        'variance_price', NEW.variance_price
      )
    );

  ELSIF NEW.status IN ('discrepancy', 'failed') THEN
    v_data := jsonb_build_object(
      'match_id', NEW.id,
      'po_id', NEW.po_id,
      'variance_quantity', NEW.variance_quantity,
      'variance_price', NEW.variance_price,
      'notes', NEW.notes
    );

    PERFORM public.emit_domain_event(
      'procurement', NEW.id, 'invoice.match.failed',
      v_data, v_po_tenant_id, NEW.po_id
    );

    PERFORM public.fail_saga(NEW.po_id, 'invoice.match.failed',
      jsonb_build_object(
        'match_id', NEW.id,
        'variance_quantity', NEW.variance_quantity,
        'variance_price', NEW.variance_price,
        'reason', COALESCE(NEW.notes, 'Three-way match discrepancy')
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_three_way_match_result ON public.three_way_match_results;
CREATE TRIGGER trg_three_way_match_result
  AFTER INSERT OR UPDATE OF status ON public.three_way_match_results
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_three_way_match_result();

-- ═══════════════════════════════════════════════════════════════
-- Register the new event types needed for the saga lifecycle
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.domain_event_types (event_type, aggregate_type, description) VALUES
  ('procurement.match.resolved',    'procurement', 'Human resolved a three-way match discrepancy')
ON CONFLICT (event_type) DO NOTHING;
