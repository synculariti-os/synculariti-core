-- Wire POS anomaly detection into the notification routing system
-- Triggers when process_batch_v1() flags rows as QUARANTINED

-- ═══════════════════════════════════════════════════════════════
-- 1. Add notification rules for POS anomalies
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.notification_rules (event_type, target_role, channel, priority, title_template, body_template, action_url_template) VALUES
  ('pos.anomaly.detected', 'manager_on_duty', 'both', 'critical',
   '🚨 POS Anomaly: {metadata.anomaly_count} items flagged',
   'Z-score outlier detected at {metadata.restaurant_name}. {metadata.anomaly_reasons}',
   '/pos-batches/{metadata.batch_id}'),
  ('pos.anomaly.detected', 'self', 'in_app', 'high',
   'POS Anomaly Detected',
   'The POS batch you uploaded has {metadata.anomaly_count} items flagged for review.',
   '/pos-batches/{metadata.batch_id}')
ON CONFLICT (event_type, target_role, channel) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 2. Trigger on pos_transaction_staging: flag → quarantine
-- Fires per-row when process_batch_v1() sets flag = 'QUARANTINED'
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.trg_pos_anomaly_quarantine()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_batch public.pos_batch_uploads%ROWTYPE;
  v_quarantine_count integer;
  v_reasons text;
BEGIN
  -- Only fire on QUARANTINED transitions
  IF NEW.flag != 'QUARANTINED' THEN
    RETURN NEW;
  END IF;

  -- Get batch info
  SELECT * INTO v_batch
    FROM public.pos_batch_uploads
   WHERE id = NEW.batch_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Count quarantined rows for this batch and collect reason summary
  SELECT COUNT(*), string_agg(DISTINCT LEFT(NEW.anomaly_reason, 80), '; ')
    INTO v_quarantine_count, v_reasons
    FROM public.pos_transaction_staging
   WHERE batch_id = NEW.batch_id
     AND flag = 'QUARANTINED';

  -- Route notification (aggregated per-batch via the batch-level trigger below)
  -- We only route once below, not per-row. This per-row trigger just aggregates.
  -- The actual routing happens in the batch-level trigger.

  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 3. Batch-level trigger: fires once when batch processing completes
--    and there are quarantined rows
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.trg_pos_batch_anomaly_notify()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_quarantine_count integer;
  v_reasons text;
  v_batch_id uuid;
BEGIN
  -- Only fire when batch transitions to COMPLETED
  IF NEW.status != 'COMPLETED' OR (OLD IS NOT NULL AND OLD.status = 'COMPLETED') THEN
    RETURN NEW;
  END IF;

  v_batch_id := NEW.id;

  -- Check if any rows were quarantined
  SELECT COUNT(*), string_agg(DISTINCT LEFT(pts.anomaly_reason, 80), '; ')
    INTO v_quarantine_count, v_reasons
    FROM public.pos_transaction_staging pts
   WHERE pts.batch_id = v_batch_id
     AND pts.flag = 'QUARANTINED';

  IF v_quarantine_count IS NULL OR v_quarantine_count = 0 THEN
    RETURN NEW;
  END IF;

  -- Route notification to manager_on_duty + uploader
  PERFORM public.route_notification(
    p_event_type         => 'pos.anomaly.detected',
    p_title              => format('🚨 POS Anomaly: %s items flagged', v_quarantine_count),
    p_body               => format('Batch at %s has %s items with Z-score outliers. Reasons: %s',
                              COALESCE(NEW.location_id::text, 'unknown'),
                              v_quarantine_count,
                              COALESCE(v_reasons, 'N/A')),
    p_reference_type     => 'pos_batch_uploads',
    p_reference_id       => v_batch_id,
    p_restaurant_id      => NEW.location_id,
    p_franchise_group_id => NEW.tenant_id,
    p_source             => 'anomaly_detection',
    p_priority           => 'critical',
    p_metadata           => jsonb_build_object(
      'batch_id', v_batch_id,
      'anomaly_count', v_quarantine_count,
      'anomaly_reasons', v_reasons
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pos_batch_anomaly_notify ON public.pos_batch_uploads;
CREATE TRIGGER trg_pos_batch_anomaly_notify
  AFTER UPDATE OF status ON public.pos_batch_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_pos_batch_anomaly_notify();

-- Also wire the IMS sales_import_batches pipeline
-- When a batch fails or has import errors, notify the uploader

INSERT INTO public.notification_rules (event_type, target_role, channel, priority, title_template, body_template, action_url_template) VALUES
  ('sales.import.completed', 'self', 'in_app', 'normal',
   'Sales Import Complete ✓',
   '{metadata.imported_rows} rows imported from {metadata.file_name}',
   '/sales-imports/{metadata.batch_id}'),
  ('sales.import.failed', 'self', 'in_app', 'high',
   'Sales Import Failed ✗',
   'Import failed: {metadata.error_message}',
   '/sales-imports/{metadata.batch_id}')
ON CONFLICT (event_type, target_role, channel) DO NOTHING;

CREATE OR REPLACE FUNCTION public.trg_sales_import_notify()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_event_type text;
  v_title text;
  v_body text;
  v_uploader_id uuid;
BEGIN
  -- Get the uploader
  v_uploader_id := NEW.uploaded_by;

  IF v_uploader_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'COMPLETED' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'COMPLETED') THEN
    PERFORM public.route_notification(
      p_event_type         => 'sales.import.completed',
      p_title              => 'Sales Import Complete ✓',
      p_body               => format('%s rows imported from %s',
                                COALESCE(NEW.imported_rows, 0),
                                COALESCE(NEW.original_file_name, 'unknown file')),
      p_reference_type     => 'sales_import_batches',
      p_reference_id       => NEW.id,
      p_restaurant_id      => NEW.restaurant_id,
      p_source             => 'sales_import',
      p_priority           => 'normal',
      p_metadata           => jsonb_build_object(
        'batch_id', NEW.id,
        'total_rows', NEW.total_rows,
        'imported_rows', NEW.imported_rows,
        'file_name', NEW.original_file_name
      ),
      p_self_user_id       => v_uploader_id
    );

  ELSIF NEW.status = 'FAILED' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'FAILED') THEN
    PERFORM public.route_notification(
      p_event_type         => 'sales.import.failed',
      p_title              => 'Sales Import Failed ✗',
      p_body               => format('Import failed: %s', COALESCE(NEW.error_message, 'Unknown error')),
      p_reference_type     => 'sales_import_batches',
      p_reference_id       => NEW.id,
      p_restaurant_id      => NEW.restaurant_id,
      p_source             => 'sales_import',
      p_priority           => 'high',
      p_metadata           => jsonb_build_object(
        'batch_id', NEW.id,
        'error_message', NEW.error_message
      ),
      p_self_user_id       => v_uploader_id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sales_import_notify ON public.sales_import_batches;
CREATE TRIGGER trg_sales_import_notify
  AFTER UPDATE OF status ON public.sales_import_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_sales_import_notify();
