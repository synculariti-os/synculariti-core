-- Phase 10b.11: Notification Routing System
-- Multi-channel (in-app + WhatsApp), role-based fan-out with per-user preferences
-- Also resolves the IMS (NestJS) → WhatsApp gap via the routing RPC

-- ═══════════════════════════════════════════════════════════════
-- 1. Notification Rules
-- Maps: event_type × role → channel
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.notification_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  scope_type text NOT NULL DEFAULT 'any' CHECK (scope_type IN ('any', 'franchise', 'restaurant', 'self')),
  scope_id uuid,
  target_role text NOT NULL,
  channel text NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'whatsapp', 'both')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  title_template text NOT NULL,
  body_template text,
  action_url_template text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  CONSTRAINT uq_notification_rules_event_role_channel UNIQUE (event_type, target_role, channel)
);

CREATE INDEX IF NOT EXISTS idx_notification_rules_event
  ON public.notification_rules(event_type, is_active)
  WHERE is_active = true;

-- ═══════════════════════════════════════════════════════════════
-- 2. User notification preferences
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('in_app', 'whatsapp')),
  is_enabled boolean NOT NULL DEFAULT true,
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  UNIQUE (user_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_user_notif_prefs_user
  ON public.user_notification_preferences(user_id);

-- ═══════════════════════════════════════════════════════════════
-- 3. Notification queue (one row per event to route)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  title text NOT NULL,
  body text,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  reference_type text,
  reference_id uuid,
  source text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL,
  franchise_group_id uuid REFERENCES public.franchise_groups(id) ON DELETE SET NULL,
  is_routed boolean NOT NULL DEFAULT false,
  routed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_unrouted
  ON public.notification_queue(created_at)
  WHERE is_routed = false;

-- ═══════════════════════════════════════════════════════════════
-- 4. Per-recipient, per-channel delivery tracking
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.notification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_queue_id uuid NOT NULL REFERENCES public.notification_queue(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('in_app', 'whatsapp')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  whatsapp_outbox_id uuid REFERENCES public.whatsapp_outbox(id) ON DELETE SET NULL,
  delivered_at timestamptz,
  read_at timestamptz,
  failed_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_attempts_user
  ON public.notification_attempts(user_id, status);

CREATE INDEX IF NOT EXISTS idx_notif_attempts_queue
  ON public.notification_attempts(notification_queue_id);

-- ═══════════════════════════════════════════════════════════════
-- 5. In-app inbox (persisted for each user)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.in_app_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_attempt_id uuid NOT NULL REFERENCES public.notification_attempts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  action_url text,
  reference_type text,
  reference_id uuid,
  priority text NOT NULL DEFAULT 'normal',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_in_app_notif_user
  ON public.in_app_notifications(user_id, is_read, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 6. Seed default notification rules
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.notification_rules (event_type, target_role, channel, priority, title_template, body_template) VALUES
  ('purchase_order.created',         'procurement_manager', 'both',     'normal',  'New PO #{metadata.po_number}',             'Purchase order created for {metadata.vendor_name} — #{metadata.po_number}'),
  ('purchase_order.cancelled',       'procurement_manager', 'both',     'high',    'PO Cancelled: #{metadata.po_number}',      'Purchase order {metadata.po_number} was cancelled'),
  ('goods.receipt.confirmed',        'procurement_manager', 'in_app',   'normal',  'Goods Received — PO #{metadata.po_number}','Receipt confirmed for PO {metadata.po_number}'),
  ('invoice.match.verified',         'procurement_manager', 'in_app',   'normal',  'Invoice Matched ✓',                         'Three-way match passed for PO {metadata.po_number}'),
  ('invoice.match.failed',           'procurement_manager', 'both',     'high',    'Match Failed ✗ — PO #{metadata.po_number}','Discrepancy detected: qty var {metadata.variance_quantity}, price var {metadata.variance_price}'),
  ('purchase_order.paid',            'procurement_manager', 'in_app',   'normal',  'PO Paid ✓',                                 'Payment released for PO {metadata.po_number}'),
  ('inventory.batch.expired',        'inventory_manager',   'in_app',   'normal',  'Batch Expired',                             'Batch {metadata.batch_ref} has expired'),
  ('inventory.count.completed',      'inventory_manager',   'in_app',   'normal',  'Count Completed',                           'Inventory count finished — {metadata.variance_count} variances found'),
  ('sales.transaction.refunded',     'finance_manager',     'in_app',   'normal',  'Refund Processed',                          'Sale {metadata.sale_ref} was refunded'),
  ('time_entry.approved',            'manager_on_duty',     'in_app',   'low',     'Time Entry Approved',                       'Time entry for {metadata.user_name} approved'),
  ('reservation.cancelled',          'manager_on_duty',     'in_app',   'normal',  'Reservation Cancelled',                     'Booking for {metadata.guest_name} cancelled')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 7. Routing engine
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.find_notification_recipients(
  p_event_type text,
  p_restaurant_id uuid,
  p_franchise_group_id uuid
)
RETURNS TABLE(user_id uuid, channel text)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT nr.target_role, nr.channel
      FROM public.notification_rules nr
     WHERE nr.event_type = p_event_type
       AND nr.is_active = true
  LOOP
    -- 'self' scope: handled by caller, not here
    IF r.target_role = 'franchise_owner' THEN
      RETURN QUERY
      SELECT DISTINCT urr.user_id, r.channel::text
        FROM public.user_restaurant_roles urr
        JOIN public.roles ro ON ro.id = urr.role_id
        WHERE urr.restaurant_id = p_restaurant_id
          AND ro.name = 'franchise_owner'
          AND (r.channel = 'both' OR r.channel = 'in_app');

    ELSIF r.target_role = 'manager_on_duty' THEN
      RETURN QUERY
      SELECT DISTINCT urr.user_id, r.channel::text
        FROM public.user_restaurant_roles urr
        JOIN public.roles ro ON ro.id = urr.role_id
        WHERE urr.restaurant_id = p_restaurant_id
          AND ro.name IN ('manager', 'general_manager', 'franchise_owner')
          AND (r.channel = 'both' OR r.channel = 'in_app');

    ELSIF r.target_role = 'procurement_manager' THEN
      RETURN QUERY
      SELECT DISTINCT urr.user_id, r.channel::text
        FROM public.user_restaurant_roles urr
        JOIN public.roles ro ON ro.id = urr.role_id
        WHERE urr.restaurant_id = p_restaurant_id
          AND ro.name IN ('procurement_manager', 'manager', 'general_manager')
          AND (r.channel = 'both' OR r.channel = 'in_app');

    ELSIF r.target_role = 'inventory_manager' THEN
      RETURN QUERY
      SELECT DISTINCT urr.user_id, r.channel::text
        FROM public.user_restaurant_roles urr
        JOIN public.roles ro ON ro.id = urr.role_id
        WHERE urr.restaurant_id = p_restaurant_id
          AND ro.name IN ('inventory_manager', 'manager', 'general_manager')
          AND (r.channel = 'both' OR r.channel = 'in_app');

    ELSIF r.target_role = 'finance_manager' THEN
      RETURN QUERY
      SELECT DISTINCT urr.user_id, r.channel::text
        FROM public.user_restaurant_roles urr
        JOIN public.roles ro ON ro.id = urr.role_id
        WHERE urr.restaurant_id = p_restaurant_id
          AND ro.name IN ('finance_manager', 'general_manager', 'franchise_owner')
          AND (r.channel = 'both' OR r.channel = 'in_app');
    END IF;
  END LOOP;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 8. Route a notification (the main RPC)
-- Called by: DB triggers, IMS NestJS, apps/web, apps/ET
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.route_notification(
  p_event_type text,
  p_title text,
  p_body text DEFAULT NULL,
  p_reference_type text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL,
  p_restaurant_id uuid DEFAULT NULL,
  p_franchise_group_id uuid DEFAULT NULL,
  p_source text DEFAULT 'system',
  p_priority text DEFAULT 'normal',
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_self_user_id uuid DEFAULT NULL  -- for 'self'-scoped notifications
)
RETURNS uuid  -- returns the notification_queue id
LANGUAGE plpgsql
AS $$
DECLARE
  v_queue_id uuid;
  v_recipient record;
  v_attempt_id uuid;
  v_outbox_id uuid;
  v_phone text;
  v_user_phone text;
BEGIN
  -- 1. Insert into queue
  INSERT INTO public.notification_queue (event_type, title, body, priority, reference_type, reference_id, source, metadata, restaurant_id, franchise_group_id)
  VALUES (p_event_type, p_title, p_body, p_priority, p_reference_type, p_reference_id, p_source, p_metadata, p_restaurant_id, p_franchise_group_id)
  RETURNING id INTO v_queue_id;

  -- 2. Find recipients and create attempts
  FOR v_recipient IN
    SELECT * FROM public.find_notification_recipients(p_event_type, p_restaurant_id, p_franchise_group_id)
    UNION
    -- If self_user_id is provided and there's a 'self' rule, add them
    SELECT p_self_user_id, 'in_app'
    WHERE p_self_user_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM public.notification_rules
                   WHERE event_type = p_event_type AND target_role = 'self' AND is_active = true)
  LOOP
    -- Skip if user has disabled this channel
    IF EXISTS (SELECT 1 FROM public.user_notification_preferences
                WHERE user_id = v_recipient.user_id
                  AND channel = v_recipient.channel
                  AND is_enabled = false) THEN
      CONTINUE;
    END IF;

    -- Create attempt
    INSERT INTO public.notification_attempts (notification_queue_id, user_id, channel, status)
    VALUES (v_queue_id, v_recipient.user_id, v_recipient.channel, 'pending')
    RETURNING id INTO v_attempt_id;

    -- 3. In-app: insert directly into user inbox
    IF v_recipient.channel = 'in_app' THEN
      INSERT INTO public.in_app_notifications (notification_attempt_id, user_id, title, body, action_url, reference_type, reference_id, priority)
      VALUES (v_attempt_id, v_recipient.user_id, p_title, p_body,
              CASE WHEN p_reference_type IS NOT NULL THEN '/' || p_reference_type || '/' || p_reference_id ELSE NULL END,
              p_reference_type, p_reference_id, p_priority);
    END IF;

    -- 4. WhatsApp: enqueue via existing outbox RPC
    IF v_recipient.channel = 'whatsapp' THEN
      -- Get user's phone number
      SELECT phone_number INTO v_user_phone
        FROM public.users
       WHERE id = v_recipient.user_id;

      IF v_user_phone IS NOT NULL AND v_user_phone != '' THEN
        v_outbox_id := public.insert_whatsapp_outbox_v2(
          p_tenant_id       => COALESCE(
            p_franchise_group_id,
            (SELECT franchise_group_id FROM public.restaurants WHERE id = p_restaurant_id),
            (p_metadata ->> 'tenant_id')::uuid,
            (p_metadata ->> 'franchise_group_id')::uuid
          ),
          p_recipient_phone => v_user_phone,
          p_payload         => jsonb_build_object(
            'title', p_title,
            'body', p_body,
            'event_type', p_event_type,
            'reference_type', p_reference_type,
            'reference_id', p_reference_id,
            'notification_queue_id', v_queue_id,
            'notification_attempt_id', v_attempt_id
          ),
          p_idempotency_key => gen_random_uuid()
        );

        UPDATE public.notification_attempts
           SET whatsapp_outbox_id = v_outbox_id
         WHERE id = v_attempt_id;
      END IF;
    END IF;
  END LOOP;

  -- 5. Mark queue as routed
  UPDATE public.notification_queue
     SET is_routed = true,
         routed_at = now()
   WHERE id = v_queue_id;

  RETURN v_queue_id;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 9. Trigger-based auto-routing from domain_events
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.trg_auto_route_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_restaurant_id uuid;
  v_franchise_id uuid;
  v_title text;
  v_body text;
BEGIN
  -- Try to derive restaurant + franchise from metadata or reference
  v_restaurant_id := (NEW.metadata ->> 'restaurant_id')::uuid;
  v_franchise_id := (NEW.metadata ->> 'tenant_id')::uuid;

  -- Build a human-readable title/body from the event (rule templates handle it better)
  v_title := NEW.event_type;

  PERFORM public.route_notification(
    p_event_type      => NEW.event_type,
    p_title           => v_title,
    p_body            => NULL,
    p_reference_type  => NEW.aggregate_type,
    p_reference_id    => NEW.aggregate_id,
    p_restaurant_id   => v_restaurant_id,
    p_franchise_group_id => v_franchise_id,
    p_source          => 'domain_event',
    p_priority        => 'normal',
    p_metadata        => NEW.data
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_route_notification ON public.domain_events;
CREATE TRIGGER trg_auto_route_notification
  AFTER INSERT ON public.domain_events
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_auto_route_notification();

-- ═══════════════════════════════════════════════════════════════
-- 10. POS Anomaly: dedicated rule + trigger
-- The existing POS ingestion HITL flow uses whatsapp_outbox directly.
-- This adds the in-app side automatically.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.notification_rules (event_type, target_role, channel, priority, title_template, body_template)
VALUES ('pos.anomaly.detected', 'self', 'in_app', 'high', 'POS Anomaly Detected', 'The POS file you uploaded at {metadata.upload_time} has discrepancies. Review needed.')
ON CONFLICT DO NOTHING;

-- Note: 'self' means the user who performed the action.
-- For POS anomalies, the IMS/web caller passes p_self_user_id = uploader.

-- ═══════════════════════════════════════════════════════════════
-- 11. Grant permissions
-- ═══════════════════════════════════════════════════════════════

-- The route_notification RPC needs to be accessible to authenticated roles
GRANT EXECUTE ON FUNCTION public.route_notification TO service_role;
GRANT EXECUTE ON FUNCTION public.route_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_notification_recipients TO service_role;
GRANT EXECUTE ON FUNCTION public.find_notification_recipients TO authenticated;

-- anon can read their own in-app notifications
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON public.in_app_notifications
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.notification_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own attempts" ON public.notification_attempts
  FOR SELECT USING (user_id = auth.uid());
