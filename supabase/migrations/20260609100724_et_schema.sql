-- ===================================================================
-- ET Schema — unified for Synculariti Core
-- Renamed overlapping tables with et_ prefix to avoid collision with IMS
-- ===================================================================

-- === 20260525185942_remote_schema.sql ===



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."add_transaction_v3"("p_transaction" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_tenant_id UUID;
    v_new_id UUID;
    v_amount NUMERIC;
    v_date DATE;
BEGIN
    v_tenant_id := get_my_tenant();
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated or tenant context missing';
    END IF;

    BEGIN
        v_amount := (p_transaction->>'amount')::NUMERIC;
    EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Invalid numeric amount provided: %', p_transaction->>'amount';
    END;

    BEGIN
        v_date := (p_transaction->>'date')::DATE;
    EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Invalid date format provided: %', p_transaction->>'date';
    END;

    v_new_id := COALESCE((p_transaction->>'id')::UUID, gen_random_uuid());

    INSERT INTO transactions (
        id, tenant_id, location_id, who_id, who, category, amount, currency, date, description, ico, receipt_number, transacted_at, vat_detail, transaction_type
    ) VALUES (
        v_new_id, v_tenant_id, (p_transaction->>'location_id')::UUID, (p_transaction->>'who_id')::UUID, p_transaction->>'who', p_transaction->>'category', v_amount, COALESCE(p_transaction->>'currency', 'EUR'), v_date, p_transaction->>'description', p_transaction->>'ico', p_transaction->>'receipt_number', (p_transaction->>'transacted_at')::TIMESTAMP WITH TIME ZONE, p_transaction->'vat_detail', COALESCE(p_transaction->>'transaction_type', 'DEBIT')
    );

    PERFORM public.enqueue_graph_sync_internal(v_tenant_id, 'transaction', v_new_id, 'MERGE', p_transaction);

    RETURN v_new_id;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."add_transactions_bulk_v1"("p_transactions" "jsonb") RETURNS "uuid"[]
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_session_t_id UUID;
  v_results UUID[];
BEGIN
  -- 1. Resolve tenant context
  v_session_t_id := public.get_my_tenant();
  IF v_session_t_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Session tenant context missing.';
  END IF;

  -- 2. Security Validation: Ensure no rogue payloads bypass the session tenant
  IF EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(p_transactions) AS elem
    WHERE NULLIF(elem->>'tenant_id', '') IS NOT NULL 
      AND public.safe_cast_uuid(elem->>'tenant_id') != v_session_t_id
  ) THEN
    RAISE EXCEPTION 'Security Violation: Tenant Mismatch in bulk payload.';
  END IF;

  -- 3. High-Performance Atomic Set-Based Dual-Write (Transactions + Outbox)
  WITH prepared_elements AS (
    SELECT 
      COALESCE(public.safe_cast_uuid(elem->>'id'), gen_random_uuid()) AS id,
      v_session_t_id AS tenant_id,
      NULLIF(elem->>'amount', '')::NUMERIC AS amount,
      elem->>'category' AS category,
      NULLIF(elem->>'date', '')::DATE AS date,
      elem->>'who' AS who,
      public.safe_cast_user_uuid(elem->>'who_id') AS who_id, -- Safe polymorphic casting
      elem->>'description' AS description,
      COALESCE(NULLIF(elem->>'currency', ''), 'EUR') AS currency,
      public.safe_cast_uuid(elem->>'location_id') AS location_id, -- Safe cast
      COALESCE(NULLIF(elem->>'transaction_type', ''), 'DEBIT') AS transaction_type,
      elem AS raw_payload
    FROM jsonb_array_elements(p_transactions) AS elem
  ),
  inserted_rows AS (
    INSERT INTO public.transactions (
      id, tenant_id, amount, category, date, who, who_id, description, currency, location_id, transaction_type
    )
    SELECT id, tenant_id, amount, category, date, who, who_id, description, currency, location_id, transaction_type
    FROM prepared_elements
    RETURNING id
  ),
  inserted_outbox AS (
    INSERT INTO public.graph_sync_queue (
      tenant_id, entity_type, entity_id, operation, payload
    )
    SELECT 
      tenant_id, 
      'transaction', 
      id, 
      'MERGE', 
      to_jsonb(p) - 'raw_payload' -- Converts the validated, clean prepared row straight into clean JSONB
    FROM prepared_elements p
  )
  SELECT array_agg(id) INTO v_results FROM inserted_rows;

  RETURN COALESCE(v_results, '{}');
END;
$$;


CREATE OR REPLACE FUNCTION "public"."audit_expense_mutation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_log (tenant_id, action, description, actor_name)
    VALUES (NEW.tenant_id, 'EXPENSE_ADDED', 'Added ' || NEW.description || ' (€' || NEW.amount || ')', NEW.who);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_log (tenant_id, action, description, actor_name)
    VALUES (OLD.tenant_id, 'EXPENSE_DELETED', 'Removed ' || OLD.description, OLD.who);
  END IF;
  RETURN NULL;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."auto_invoice_outbox_signal"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- If status changed to PAID, emit a signal automatically in the same transaction
  IF (TG_OP = 'UPDATE') AND NEW.status = 'PAID' AND OLD.status != 'PAID' THEN
    INSERT INTO public.outbox_events (tenant_id, event_type, payload)
    VALUES (NEW.tenant_id, 'INVOICE_PAID', jsonb_build_object('invoice_id', NEW.id, 'vendor_id', NEW.vendor_id));
  END IF;
  RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."check_rate_limit"("p_ip_hash" "text", "p_action" "text", "p_max_attempts" integer DEFAULT 5, "p_window_minutes" integer DEFAULT 15, "p_block_minutes" integer DEFAULT 60) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_record public.rate_limits%ROWTYPE;
    v_now TIMESTAMPTZ := NOW();
    v_retry_after INT := 0;
BEGIN
    INSERT INTO public.rate_limits (ip_hash, action_type, attempt_count, window_start)
    VALUES (p_ip_hash, p_action, 1, v_now)
    ON CONFLICT (ip_hash, action_type) DO UPDATE SET
        attempt_count = CASE 
            WHEN rate_limits.window_start < v_now - (p_window_minutes || ' minutes')::INTERVAL 
            THEN 1 
            ELSE rate_limits.attempt_count + 1 
        END,
        window_start = CASE 
            WHEN rate_limits.window_start < v_now - (p_window_minutes || ' minutes')::INTERVAL 
            THEN v_now 
            ELSE rate_limits.window_start 
        END,
        blocked_until = CASE 
            -- Block if they hit the limit within the window OR they are already blocked
            WHEN (rate_limits.attempt_count + 1 >= p_max_attempts AND rate_limits.window_start >= v_now - (p_window_minutes || ' minutes')::INTERVAL)
                 OR (rate_limits.blocked_until > v_now)
            THEN GREATEST(COALESCE(rate_limits.blocked_until, v_now), v_now) + (p_block_minutes || ' minutes')::INTERVAL 
            ELSE NULL 
        END
    RETURNING * INTO v_record;
    
    IF v_record.blocked_until > v_now THEN
        v_retry_after := EXTRACT(EPOCH FROM (v_record.blocked_until - v_now))::INT;
    END IF;

    RETURN jsonb_build_object(
        'allowed', v_record.blocked_until IS NULL OR v_record.blocked_until < v_now,
        'remaining_attempts', GREATEST(0, p_max_attempts - v_record.attempt_count),
        'retry_after_seconds', v_retry_after
    );
END;
$$;


CREATE OR REPLACE FUNCTION "public"."check_tenant_pin"("h_id" "uuid", "input_pin" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.tenants 
        WHERE id = h_id 
          AND config->>'pin' = input_pin
    );
END;
$$;


CREATE OR REPLACE FUNCTION "public"."consume_procurement_signal"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_vendor_id UUID;
BEGIN
  IF NEW.event_type = 'PROCUREMENT_RECEIVED' THEN
    -- SAFE CAST: vendor_id
    BEGIN
      v_vendor_id := (NEW.payload->>'vendor_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_vendor_id := NULL; 
    END;

    INSERT INTO public.invoices (tenant_id, location_id, vendor_id, total_amount, currency, status, invoice_number)
    VALUES (
      NEW.tenant_id, 
      NULLIF(NEW.payload->>'location_id', '')::UUID, 
      v_vendor_id, 
      (NEW.payload->>'total_amount')::NUMERIC,
      COALESCE(NEW.payload->>'currency', 'EUR'),
      'PENDING',
      'PO-' || upper(substr(NEW.payload->>'po_id', 1, 8))
    );
  END IF;
  RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."create_inventory_item_v1"("p_item" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_tenant_id UUID;
    v_new_id UUID;
    v_conversion_factor NUMERIC;
    v_category_id UUID;
BEGIN
    v_tenant_id := get_my_tenant();
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- TYPE SAFETY: Handle broken payloads with clean error messages
    BEGIN
        v_conversion_factor := (p_item->>'conversion_factor')::NUMERIC;
    EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Invalid conversion factor: %', p_item->>'conversion_factor';
    END;

    BEGIN
        v_category_id := (p_item->>'category_id')::UUID;
    EXCEPTION WHEN others THEN
        v_category_id := NULL; -- Allow NULL categories if explicitly pushed as invalid
    END;

    v_new_id := gen_random_uuid();

    INSERT INTO inventory_items (
        id,
        tenant_id,
        name,
        sku,
        type,
        purchasing_uom,
        inventory_uom,
        conversion_factor,
        category_id
    )
    VALUES (
        v_new_id,
        v_tenant_id,
        p_item->>'name',
        p_item->>'sku',
        p_item->>'type',
        p_item->>'purchasing_uom',
        p_item->>'inventory_uom',
        v_conversion_factor,
        v_category_id
    );

    RETURN v_new_id;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."create_organization"("p_name" "text", "p_handle" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_tenant_id UUID;
    v_email TEXT;
BEGIN
    v_email := auth.jwt()->>'email';
    IF v_email IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Check if handle already exists
    IF EXISTS (SELECT 1 FROM public.tenants WHERE lower(handle) = lower(p_handle)) THEN
        RAISE EXCEPTION 'Access code % is already taken.', p_handle;
    END IF;

    -- Create Tenant
    v_tenant_id := gen_random_uuid();
    INSERT INTO public.tenants (id, name, handle)
    VALUES (v_tenant_id, p_name, lower(p_handle));

    -- Add Creator as OWNER
    INSERT INTO public.tenant_members (tenant_id, email, role)
    VALUES (v_tenant_id, v_email, 'OWNER');

    -- Auto-switch to the new organization
    PERFORM public.switch_tenant(v_tenant_id);

    RETURN v_tenant_id;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."enqueue_graph_sync_internal"("p_tenant_id" "uuid", "p_entity_type" "text", "p_entity_id" "uuid", "p_operation" "text", "p_payload" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO public.graph_sync_queue (tenant_id, entity_type, entity_id, operation, payload)
    VALUES (p_tenant_id, p_entity_type, p_entity_id, p_operation, p_payload);
END;
$$;


CREATE OR REPLACE FUNCTION "public"."get_function_security_state"("p_func_name" "text", "p_args_signature" "text") RETURNS TABLE("func_exists" boolean, "has_search_path_public" boolean, "is_revoked_from_public" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'public'
    AS $$
DECLARE
  v_exists BOOLEAN := FALSE;
  v_has_search_path BOOLEAN := FALSE;
  v_is_revoked BOOLEAN := FALSE;
  v_func_oid OID;
  v_proconfig TEXT[];
BEGIN
  -- 1. Check if the function exists in schema 'public' with the matching parameter type signature
  SELECT p.oid, p.proconfig INTO v_func_oid, v_proconfig
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname = p_func_name
    AND pg_catalog.oidvectortypes(p.proargtypes) = p_args_signature;

  IF v_func_oid IS NOT NULL THEN
    v_exists := TRUE;

    -- 2. Check if search_path = public is strictly set in the function config
    IF v_proconfig IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 
        FROM unnest(v_proconfig) cfg 
        WHERE lower(replace(cfg, ' ', '')) = 'search_path=public'
      ) INTO v_has_search_path;
    END IF;

    -- 3. Check if both 'anon' and 'public' roles do NOT have execute privilege
    IF NOT pg_catalog.has_function_privilege('anon', v_func_oid, 'EXECUTE')
       AND NOT pg_catalog.has_function_privilege('public', v_func_oid, 'EXECUTE') THEN
      v_is_revoked := TRUE;
    END IF;
  END IF;

  RETURN QUERY SELECT v_exists, v_has_search_path, v_is_revoked;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."get_my_available_tenants"() RETURNS TABLE("tenant_id" "uuid", "tenant_name" "text", "tenant_handle" "text", "user_role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as tenant_id,
        t.name as tenant_name,
        t.handle as tenant_handle,
        tm.role as user_role
    FROM public.tenants t
    JOIN public.tenant_members tm ON t.id = tm.tenant_id
    WHERE tm.email = auth.jwt()->>'email';
END;
$$;


CREATE OR REPLACE FUNCTION "public"."get_my_tenant"() RETURNS "uuid"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_t_id UUID;
BEGIN
  -- Check if we already cached it in this transaction
  v_t_id := NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
  
  IF v_t_id IS NULL THEN
    -- Look it up
    SELECT tenant_id INTO v_t_id FROM public.app_users WHERE id = auth.uid() LIMIT 1;
    
    -- Cache it for the rest of the transaction
    IF v_t_id IS NOT NULL THEN
      PERFORM set_config('app.current_tenant_id', v_t_id::TEXT, true);
    END IF;
  END IF;

  RETURN v_t_id;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."get_tenant_bundle"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_session_t_id UUID;
  v_bundle JSONB;
BEGIN
  -- 1. Resolve Tenant
  v_session_t_id := public.get_my_tenant();
  
  IF v_session_t_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- 2. Construct unified JSON payload
  SELECT jsonb_build_object(
    'tenant', (
        SELECT row_to_json(t) FROM (
            SELECT id, name, handle, categories, total_budget, config, created_at 
            FROM public.tenants 
            WHERE id = v_session_t_id
        ) t
    ),
    'user', (
        SELECT row_to_json(u) FROM (
            SELECT id, full_name, created_at 
            FROM public.app_users 
            WHERE id = auth.uid() AND tenant_id = v_session_t_id
        ) u
    ),
    'locations', (
        SELECT COALESCE(json_agg(row_to_json(l)), '[]'::json) FROM (
            SELECT id, name, address, metadata 
            FROM public.locations 
            WHERE tenant_id = v_session_t_id
        ) l
    ),
    'server_time', now()
  ) INTO v_bundle;

  RETURN v_bundle;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."is_tenant_management_privileged"("p_tenant_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_members 
        WHERE tenant_id = p_tenant_id
          AND email = auth.jwt()->>'email' 
          AND role IN ('OWNER', 'ADMIN')
    );
END;
$$;


CREATE OR REPLACE FUNCTION "public"."log_expense_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.activity_log (household_id, type, message, user_name)
    VALUES (NEW.household_id, 'EXPENSE_ADDED', 'Added ' || NEW.description || ' (€' || NEW.amount || ')', NEW.who);
  ELSIF (TG_OP = 'UPDATE') AND NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
    INSERT INTO public.activity_log (household_id, type, message, user_name)
    VALUES (NEW.household_id, 'EXPENSE_DELETED', 'Removed ' || OLD.description, NEW.who);
  END IF;
  RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."notify_outbox_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  PERFORM pg_notify('synculariti_finance_events', json_build_object(
    'id', NEW.id,
    'event_type', NEW.event_type,
    'tenant_id', NEW.tenant_id
  )::text);
  RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."purge_expired_whatsapp_logs"("days_to_keep" integer DEFAULT 30) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  DELETE FROM public.whatsapp_outbox 
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  DELETE FROM public.whatsapp_inbox 
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."receive_purchase_order_v1"("p_po_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_tenant_id UUID;
    v_po RECORD;
BEGIN
    v_tenant_id := get_my_tenant();
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- CONCURRENCY LOCKING: Prevent double-processing via FOR UPDATE
    SELECT * INTO v_po FROM et_purchase_orders 
    WHERE id = p_po_id AND tenant_id = v_tenant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase Order not found';
    END IF;

    IF v_po.status = 'RECEIVED' THEN
        RETURN jsonb_build_object('status', 'ALREADY_RECEIVED');
    END IF;

    -- Update PO Status
    -- This update triggers trg_signal_procurement_finance which handles:
    -- a) Validation of quantity_received
    -- b) Insertion into et_inventory_ledger (with UOM conversion)
    -- c) Emission of PROCUREMENT_RECEIVED outbox event
    UPDATE et_purchase_orders 
    SET status = 'RECEIVED', updated_at = NOW() 
    WHERE id = p_po_id;

    RETURN jsonb_build_object('status', 'SUCCESS', 'po_id', p_po_id);
END;
$$;


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."safe_cast_user_uuid"("p_val" "text") RETURNS "uuid"
    LANGUAGE "sql" IMMUTABLE STRICT
    SET "search_path" TO 'public'
    AS $_$
  SELECT CASE 
    -- Case A: Valid UUID (Length check prevents executing regex on short mock IDs)
    WHEN length(p_val) = 36 AND p_val ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' 
      THEN p_val::UUID
    -- Case B: Mock user IDs ('u1', 'u25', up to 12 digits to prevent lpad overflows)
    WHEN p_val ~ '^u[0-9]{1,12}$' 
      THEN ('00000000-0000-0000-0000-' || lpad(substring(p_val from 2), 12, '0'))::UUID
    -- Case C: Empty string
    WHEN p_val = '' 
      THEN NULL
    -- Case D: Fallback for unmappable non-empty strings (including mock overflow)
    ELSE '00000000-0000-0000-0000-000000000000'::UUID
  END;
$_$;


CREATE OR REPLACE FUNCTION "public"."safe_cast_uuid"("p_val" "text") RETURNS "uuid"
    LANGUAGE "sql" IMMUTABLE STRICT
    SET "search_path" TO 'public'
    AS $_$
  SELECT CASE 
    WHEN length(p_val) = 36 AND p_val ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' 
      THEN p_val::UUID
    ELSE NULL
  END;
$_$;


CREATE OR REPLACE FUNCTION "public"."save_receipt_v3"("p_expense" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN public.save_receipt_v3(p_expense, p_expense->'items', (p_expense->>'location_id')::UUID);
END;
$$;


CREATE OR REPLACE FUNCTION "public"."save_receipt_v3"("p_expense" "jsonb", "p_items" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN public.save_receipt_v3(p_expense, p_items, (p_expense->>'location_id')::UUID);
END;
$$;


CREATE OR REPLACE FUNCTION "public"."save_receipt_v3"("p_expense" "jsonb", "p_items" "jsonb", "p_location_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_transaction_id UUID;
  v_session_t_id UUID;
  v_currency TEXT;
BEGIN
  v_session_t_id := public.get_my_tenant();
  
  -- 1. Dual-Layer Validation
  IF (p_expense->>'tenant_id')::UUID != v_session_t_id THEN
    RAISE EXCEPTION 'Security Violation: Tenant Mismatch.';
  END IF;

  IF p_location_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.locations WHERE id = p_location_id AND tenant_id = v_session_t_id) THEN
      RAISE EXCEPTION 'Security Violation: Location does not belong to tenant.';
    END IF;
  END IF;

  -- 2. Currency Validation
  v_currency := COALESCE(p_expense->>'currency', 'EUR');
  IF char_length(v_currency) != 3 THEN
    RAISE EXCEPTION 'Validation Error: Currency must be a 3-letter ISO code.';
  END IF;

  -- 3. Insert Transaction
  INSERT INTO public.transactions (
    id, tenant_id, amount, category, date, who, who_id, description, currency, location_id, transaction_type
  ) VALUES (
    COALESCE((p_expense->>'id')::UUID, gen_random_uuid()),
    v_session_t_id,
    (p_expense->>'amount')::NUMERIC,
    p_expense->>'category',
    (p_expense->>'date')::DATE,
    p_expense->>'who',
    (p_expense->>'who_id')::UUID,
    p_expense->>'description',
    v_currency,
    p_location_id,
    COALESCE(p_expense->>'transaction_type', 'DEBIT')
  ) ON CONFLICT (id) DO UPDATE SET
    amount = EXCLUDED.amount,
    category = EXCLUDED.category,
    date = EXCLUDED.date,
    who = EXCLUDED.who,
    description = EXCLUDED.description,
    location_id = EXCLUDED.location_id,
    currency = EXCLUDED.currency
  RETURNING id INTO v_transaction_id;

  -- 4. Wipe old items to prevent duplication
  DELETE FROM public.receipt_items WHERE transaction_id = v_transaction_id;

  -- 5. Bulk Insert Items
  INSERT INTO public.receipt_items (id, transaction_id, tenant_id, name, amount, category, currency)
  SELECT 
    COALESCE(id, gen_random_uuid()), v_transaction_id, v_session_t_id, name, amount, category, v_currency
  FROM jsonb_to_recordset(p_items) AS x(id UUID, name TEXT, amount NUMERIC, category TEXT);

  RETURN v_transaction_id;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."save_receipt_v4"("p_transaction" "jsonb", "p_items" "jsonb", "p_location_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_transaction_id UUID;
  v_session_t_id UUID;
  v_currency TEXT;
BEGIN
  -- Security: Deriving tenant from session (RLS)
  v_session_t_id := public.get_my_tenant();
  IF v_session_t_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Session tenant context missing.';
  END IF;
  
  -- Dual-Layer Validation
  IF (p_transaction->>'tenant_id')::UUID != v_session_t_id THEN
    RAISE EXCEPTION 'Security Violation: Tenant Mismatch.';
  END IF;

  IF p_location_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.locations WHERE id = p_location_id AND tenant_id = v_session_t_id) THEN
      RAISE EXCEPTION 'Security Violation: Location Ownership Mismatch.';
    END IF;
  END IF;

  -- Currency Sanitization
  v_currency := COALESCE(NULLIF(p_transaction->>'currency', ''), 'EUR');
  IF char_length(v_currency) != 3 THEN
    RAISE EXCEPTION 'Validation Error: Invalid currency ISO code.';
  END IF;

  -- Generate or preserve ID
  v_transaction_id := COALESCE((p_transaction->>'id')::UUID, gen_random_uuid());

  -- Step 1: Atomic Transaction Upsert
  INSERT INTO public.transactions (
    id, tenant_id, location_id, amount, currency, category, date, who, who_id, description,
    ico, receipt_number, transacted_at, vat_detail, transaction_type
  ) VALUES (
    v_transaction_id,
    v_session_t_id,
    p_location_id,
    (p_transaction->>'amount')::NUMERIC,
    v_currency,
    p_transaction->>'category',
    (p_transaction->>'date')::DATE,
    p_transaction->>'who',
    public.safe_cast_user_uuid(p_transaction->>'who_id'), -- Safe polymorphic user uuid casting
    p_transaction->>'description',
    p_transaction->>'ico',
    p_transaction->>'receipt_number',
    (p_transaction->>'transacted_at')::TIMESTAMPTZ,
    (p_transaction->>'vat_detail')::JSONB,
    COALESCE(p_transaction->>'transaction_type', 'DEBIT')
  )
  ON CONFLICT (id) DO UPDATE SET
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    category = EXCLUDED.category,
    date = EXCLUDED.date,
    description = EXCLUDED.description,
    ico = EXCLUDED.ico,
    receipt_number = EXCLUDED.receipt_number,
    transacted_at = EXCLUDED.transacted_at,
    vat_detail = EXCLUDED.vat_detail,
    updated_at = now();

  -- Step 2: Atomic Item Re-sync (Clean & Insert using the correct transaction_id column)
  DELETE FROM public.receipt_items WHERE transaction_id = v_transaction_id;
  
  INSERT INTO public.receipt_items (id, transaction_id, tenant_id, name, amount, category, currency)
  SELECT 
    COALESCE((item->>'id')::UUID, gen_random_uuid()), 
    v_transaction_id, 
    v_session_t_id, 
    item->>'name', 
    (item->>'amount')::NUMERIC, 
    item->>'category', 
    v_currency
  FROM jsonb_array_elements(p_items) AS item;

  -- ENQUEUE FOR GRAPH
  PERFORM public.enqueue_graph_sync_internal(v_session_t_id, 'transaction', v_transaction_id, 'MERGE', p_transaction);

  RETURN v_transaction_id;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."signal_procurement_to_finance"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF (TG_OP = 'UPDATE') AND NEW.status = 'RECEIVED' AND OLD.status != 'RECEIVED' THEN
    INSERT INTO public.outbox_events (tenant_id, event_type, payload)
    VALUES (NEW.tenant_id, 'PROCUREMENT_RECEIVED', jsonb_build_object(
      'po_id', NEW.id,
      'location_id', NEW.location_id,
      'vendor_id', NEW.vendor_id,
      'total_amount', NEW.total_amount,
      'currency', NEW.currency
    ));
    
    INSERT INTO public.et_inventory_ledger (tenant_id, location_id, item_id, change_amount, reason, reference_id)
    SELECT 
      NEW.tenant_id, 
      NEW.location_id, 
      pli.item_id, 
      (pli.quantity_received * i.conversion_factor), 
      'RECEIPT', 
      NEW.id
    FROM public.et_po_line_items pli
    JOIN public.inventory_items i ON i.id = pli.item_id
    WHERE pli.po_id = NEW.id
      AND i.type != 'SERVICE';
  END IF;
  RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."soft_delete_transaction_v1"("p_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_tenant_id UUID;
    v_updated_at TIMESTAMP WITH TIME ZONE;
BEGIN
    v_tenant_id := get_my_tenant();
    IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

    UPDATE transactions
    SET is_deleted = true, updated_at = NOW()
    WHERE id = p_id AND tenant_id = v_tenant_id
    RETURNING updated_at INTO v_updated_at;

    IF NOT FOUND THEN RAISE EXCEPTION 'Not found'; END IF;

    PERFORM public.enqueue_graph_sync_internal(v_tenant_id, 'transaction', p_id, 'DELETE', '{}'::JSONB);

    RETURN jsonb_build_object('id', p_id, 'updated_at', v_updated_at);
END;
$$;


CREATE OR REPLACE FUNCTION "public"."switch_tenant"("p_tenant_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_email TEXT;
BEGIN
    v_email := auth.jwt()->>'email';
    
    -- Security Check: Ensure the user is actually a member
    IF NOT EXISTS (SELECT 1 FROM public.tenant_members WHERE tenant_id = p_tenant_id AND email = v_email) THEN
        RAISE EXCEPTION 'Access denied. You are not a member of this organization.';
    END IF;

    -- Update or Insert into app_users to set the "active" tenant
    INSERT INTO public.app_users (id, tenant_id)
    VALUES (auth.uid(), p_tenant_id)
    ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, updated_at = NOW();
    
    -- Clear session cache for the helper function
    PERFORM set_config('app.current_tenant_id', p_tenant_id::TEXT, true);
END;
$$;


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."update_tenant_config_v1"("p_config" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_tenant_id UUID;
    v_result JSONB;
BEGIN
    v_tenant_id := get_my_tenant();
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated or tenant context missing';
    END IF;

    -- Deep Merge JSONB using || operator (allows patch updates)
    UPDATE tenants
    SET config = config || p_config, updated_at = NOW()
    WHERE id = v_tenant_id
    RETURNING jsonb_build_object('id', id, 'updated_at', updated_at) INTO v_result;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tenant not found or access denied';
    END IF;

    RETURN v_result;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."update_transaction_v1"("p_id" "uuid", "p_transaction" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_tenant_id UUID;
    v_updated_at TIMESTAMP WITH TIME ZONE;
    v_full_row JSONB;
BEGIN
    v_tenant_id := get_my_tenant();
    IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;

    UPDATE transactions
    SET
        amount = COALESCE(NULLIF(p_transaction->>'amount', '')::NUMERIC, amount),
        category = COALESCE(p_transaction->>'category', category),
        date = COALESCE(NULLIF(p_transaction->>'date', '')::DATE, date),
        description = COALESCE(p_transaction->>'description', description),
        currency = COALESCE(p_transaction->>'currency', currency),
        vat_detail = COALESCE(p_transaction->'vat_detail', vat_detail),
        updated_at = NOW()
    WHERE id = p_id AND tenant_id = v_tenant_id
    RETURNING updated_at, to_jsonb(transactions.*) INTO v_updated_at, v_full_row;

    IF NOT FOUND THEN RAISE EXCEPTION 'Not found'; END IF;

    PERFORM public.enqueue_graph_sync_internal(v_tenant_id, 'transaction', p_id, 'MERGE', v_full_row);

    RETURN jsonb_build_object('id', p_id, 'updated_at', v_updated_at);
END;
$$;


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."upsert_app_user_v1"("p_tenant_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
BEGIN
    v_user_id := auth.uid();
    v_email := auth.jwt()->>'email';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Security Check to prevent user hopping: Check if the user's email is invited/linked to this tenant
    IF NOT EXISTS (SELECT 1 FROM tenant_members WHERE tenant_id = p_tenant_id AND email = v_email) THEN
        RAISE EXCEPTION 'Access denied. Email % is not authorized for tenant %', v_email, p_tenant_id;
    END IF;

    -- The UI passes a tenant_id to link the user context
    INSERT INTO app_users (id, tenant_id)
    VALUES (v_user_id, p_tenant_id)
    ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, updated_at = NOW();
END;
$$;


CREATE OR REPLACE FUNCTION "public"."verify_tenant_access"("input_code" "text") RETURNS TABLE("target_id" "uuid", "target_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT id, name
    FROM public.tenants
    WHERE lower(handle) = lower(input_code);
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "description" "text" NOT NULL,
    "actor_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


CREATE TABLE IF NOT EXISTS "public"."api_keys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "key_value" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."api_keys" FORCE ROW LEVEL SECURITY;


CREATE TABLE IF NOT EXISTS "public"."app_users" (
    "id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "full_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


CREATE TABLE IF NOT EXISTS "public"."chart_of_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "account_code" "text" NOT NULL,
    "account_name" "text" NOT NULL,
    "account_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "chart_of_accounts_account_type_check" CHECK (("account_type" = ANY (ARRAY['ASSET'::"text", 'LIABILITY'::"text", 'EQUITY'::"text", 'REVENUE'::"text", 'EXPENSE'::"text"])))
);


CREATE TABLE IF NOT EXISTS "public"."et_inventory_ledger" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "location_id" "uuid",
    "item_id" "uuid" NOT NULL,
    "change_amount" numeric NOT NULL,
    "reason" "text" NOT NULL,
    "reference_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "inventory_ledger_reason_check" CHECK (("reason" = ANY (ARRAY['RECEIPT'::"text", 'SALE'::"text", 'WASTE'::"text", 'ADJUSTMENT'::"text", 'TRANSFER'::"text"])))
);


CREATE OR REPLACE VIEW "public"."current_inventory" WITH ("security_invoker"='true') AS
 SELECT "tenant_id",
    "location_id",
    "item_id",
    "sum"("change_amount") AS "stock_level",
    "max"("created_at") AS "last_movement"
   FROM "public"."et_inventory_ledger"
  GROUP BY "tenant_id", "location_id", "item_id";


ALTER VIEW "public"."current_inventory" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."graph_sync_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "operation" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "retry_count" integer DEFAULT 0,
    "max_retries" integer DEFAULT 3,
    "last_error" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "processed_at" timestamp with time zone,
    CONSTRAINT "graph_sync_queue_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['transaction'::"text", 'merchant'::"text"]))),
    CONSTRAINT "graph_sync_queue_operation_check" CHECK (("operation" = ANY (ARRAY['MERGE'::"text", 'DELETE'::"text"]))),
    CONSTRAINT "graph_sync_queue_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'PROCESSING'::"text", 'COMPLETED'::"text", 'FAILED'::"text"])))
);


CREATE TABLE IF NOT EXISTS "public"."inventory_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


CREATE TABLE IF NOT EXISTS "public"."inventory_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "category_id" "uuid",
    "sku" "text" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "purchasing_uom" "text" NOT NULL,
    "inventory_uom" "text" NOT NULL,
    "conversion_factor" numeric DEFAULT 1 NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "inventory_items_conversion_factor_check" CHECK (("conversion_factor" > (0)::numeric)),
    CONSTRAINT "inventory_items_type_check" CHECK (("type" = ANY (ARRAY['RAW'::"text", 'PREP'::"text", 'SERVICE'::"text"])))
);


CREATE TABLE IF NOT EXISTS "public"."invoice_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "account_id" "uuid",
    "description" "text" NOT NULL,
    "quantity" numeric DEFAULT 1 NOT NULL,
    "unit_price" numeric NOT NULL,
    "tax_rate" numeric DEFAULT 0,
    "line_total" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "location_id" "uuid",
    "vendor_id" "uuid",
    "invoice_number" "text",
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "due_date" "date",
    "total_amount" numeric NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "raw_file_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "invoices_currency_check" CHECK (("char_length"("currency") = 3)),
    CONSTRAINT "invoices_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'APPROVED'::"text", 'PAID'::"text", 'CANCELLED'::"text"]))),
    CONSTRAINT "invoices_total_amount_check" CHECK (("total_amount" >= (0)::numeric))
);


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."locations" FORCE ROW LEVEL SECURITY;


CREATE TABLE IF NOT EXISTS "public"."outbox_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "processed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


CREATE TABLE IF NOT EXISTS "public"."et_po_line_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "po_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "quantity_ordered" numeric NOT NULL,
    "quantity_received" numeric DEFAULT 0 NOT NULL,
    "unit_price" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "tenant_id" "uuid" NOT NULL
);


CREATE TABLE IF NOT EXISTS "public"."et_purchase_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "location_id" "uuid",
    "vendor_id" "uuid",
    "status" "text" DEFAULT 'DRAFT'::"text" NOT NULL,
    "order_date" timestamp with time zone DEFAULT "now"(),
    "total_amount" numeric DEFAULT 0 NOT NULL,
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "purchase_orders_currency_check" CHECK (("char_length"("currency") = 3)),
    CONSTRAINT "purchase_orders_status_check" CHECK (("status" = ANY (ARRAY['DRAFT'::"text", 'SUBMITTED'::"text", 'RECEIVED'::"text", 'CANCELLED'::"text"])))
);


CREATE TABLE IF NOT EXISTS "public"."rate_limits" (
    "ip_hash" "text" NOT NULL,
    "action_type" "text" DEFAULT 'pin_auth'::"text" NOT NULL,
    "attempt_count" integer DEFAULT 1,
    "window_start" timestamp with time zone DEFAULT "now"(),
    "blocked_until" timestamp with time zone
);


CREATE TABLE IF NOT EXISTS "public"."receipt_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transaction_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "category" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    CONSTRAINT "receipt_items_currency_check" CHECK (("length"("currency") = 3))
);


CREATE TABLE IF NOT EXISTS "public"."system_telemetry" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "tenant_id" "uuid",
    "level" "text" NOT NULL,
    "component" "text" NOT NULL,
    "message" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


CREATE TABLE IF NOT EXISTS "public"."tenant_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'MEMBER'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."tenant_members" FORCE ROW LEVEL SECURITY;


CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "categories" "jsonb" DEFAULT '[]'::"jsonb",
    "total_budget" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "handle" "text",
    "config" "jsonb" DEFAULT '{}'::"jsonb"
);


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "category" "text" NOT NULL,
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "who" "text",
    "who_id" "uuid",
    "description" "text",
    "is_deleted" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "location_id" "uuid",
    "currency" "text" DEFAULT 'EUR'::"text" NOT NULL,
    "ico" "text",
    "receipt_number" "text",
    "transacted_at" timestamp with time zone,
    "vat_detail" "jsonb",
    "transaction_type" "text" DEFAULT 'DEBIT'::"text",
    "invoice_id" "uuid",
    "account_id" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "expenses_amount_check" CHECK (("amount" >= (0)::numeric)),
    CONSTRAINT "expenses_currency_check" CHECK (("length"("currency") = 3)),
    CONSTRAINT "transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['DEBIT'::"text", 'CREDIT'::"text"])))
);


CREATE TABLE IF NOT EXISTS "public"."whatsapp_inbox" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "outbox_id" "uuid",
    "sender_phone" "text" NOT NULL,
    "message_id" "text" NOT NULL,
    "message_type" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."whatsapp_inbox" FORCE ROW LEVEL SECURITY;


CREATE TABLE IF NOT EXISTS "public"."whatsapp_outbox" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "api_key_id" "uuid",
    "recipient_phone" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'PENDING'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "processed_at" timestamp with time zone,
    "whatsapp_message_id" "text",
    "webhook_url" "text",
    "webhook_secret" "text"
);

ALTER TABLE ONLY "public"."whatsapp_outbox" FORCE ROW LEVEL SECURITY;


ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_key_value_key" UNIQUE ("key_value");



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "app_state_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_users"
    ADD CONSTRAINT "app_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chart_of_accounts"
    ADD CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chart_of_accounts"
    ADD CONSTRAINT "chart_of_accounts_tenant_id_account_code_key" UNIQUE ("tenant_id", "account_code");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."graph_sync_queue"
    ADD CONSTRAINT "graph_sync_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_categories"
    ADD CONSTRAINT "inventory_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_categories"
    ADD CONSTRAINT "inventory_categories_tenant_id_name_key" UNIQUE ("tenant_id", "name");



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_tenant_id_sku_key" UNIQUE ("tenant_id", "sku");



ALTER TABLE ONLY "public"."et_inventory_ledger"
    ADD CONSTRAINT "inventory_ledger_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."outbox_events"
    ADD CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."et_po_line_items"
    ADD CONSTRAINT "po_line_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."et_purchase_orders"
    ADD CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("ip_hash", "action_type");



ALTER TABLE ONLY "public"."receipt_items"
    ADD CONSTRAINT "receipt_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_telemetry"
    ADD CONSTRAINT "system_telemetry_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_members"
    ADD CONSTRAINT "tenant_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_members"
    ADD CONSTRAINT "tenant_members_tenant_id_email_key" UNIQUE ("tenant_id", "email");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "unique_location_name_per_household" UNIQUE ("tenant_id", "name");



ALTER TABLE ONLY "public"."whatsapp_inbox"
    ADD CONSTRAINT "whatsapp_inbox_message_id_key" UNIQUE ("message_id");



ALTER TABLE ONLY "public"."whatsapp_inbox"
    ADD CONSTRAINT "whatsapp_inbox_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."whatsapp_outbox"
    ADD CONSTRAINT "whatsapp_outbox_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."whatsapp_outbox"
    ADD CONSTRAINT "whatsapp_outbox_whatsapp_message_id_key" UNIQUE ("whatsapp_message_id");



CREATE INDEX "idx_activity_log_household" ON "public"."activity_log" USING "btree" ("tenant_id");



CREATE INDEX "idx_expenses_household" ON "public"."transactions" USING "btree" ("tenant_id");



CREATE INDEX "idx_expenses_location_date" ON "public"."transactions" USING "btree" ("location_id", "date" DESC);



CREATE INDEX "idx_graph_sync_pending" ON "public"."graph_sync_queue" USING "btree" ("status", "created_at") WHERE ("status" = 'PENDING'::"text");



CREATE INDEX "idx_locations_household" ON "public"."locations" USING "btree" ("tenant_id");



CREATE INDEX "idx_locations_metadata" ON "public"."locations" USING "gin" ("metadata");



CREATE INDEX "idx_members_email" ON "public"."tenant_members" USING "btree" ("email");



CREATE INDEX "idx_receipt_items_expense" ON "public"."receipt_items" USING "btree" ("transaction_id");



CREATE INDEX "idx_tenant_members_email" ON "public"."tenant_members" USING "btree" ("email");



CREATE INDEX "idx_transactions_invoice" ON "public"."transactions" USING "btree" ("invoice_id");



CREATE OR REPLACE TRIGGER "trg_audit_expenses" AFTER INSERT OR DELETE ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."audit_expense_mutation"();



CREATE OR REPLACE TRIGGER "trg_auto_invoice_outbox_signal" AFTER UPDATE ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "public"."auto_invoice_outbox_signal"();



CREATE OR REPLACE TRIGGER "trg_consume_procurement_signal" AFTER INSERT ON "public"."outbox_events" FOR EACH ROW EXECUTE FUNCTION "public"."consume_procurement_signal"();



CREATE OR REPLACE TRIGGER "trg_invoices_updated_at" BEFORE UPDATE ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "trg_notify_outbox" AFTER INSERT ON "public"."outbox_events" FOR EACH ROW EXECUTE FUNCTION "public"."notify_outbox_event"();



CREATE OR REPLACE TRIGGER "trg_signal_procurement_to_finance" AFTER UPDATE ON "public"."et_purchase_orders" FOR EACH ROW EXECUTE FUNCTION "public"."signal_procurement_to_finance"();



CREATE OR REPLACE TRIGGER "trg_tenant_members_updated_at" BEFORE UPDATE ON "public"."tenant_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_update_app_state" BEFORE UPDATE ON "public"."tenants" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "trg_update_app_users" BEFORE UPDATE ON "public"."app_users" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "trg_update_locations" BEFORE UPDATE ON "public"."locations" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_household_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."app_users"
    ADD CONSTRAINT "app_users_household_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."app_users"
    ADD CONSTRAINT "app_users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chart_of_accounts"
    ADD CONSTRAINT "chart_of_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "expenses_household_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "expenses_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."graph_sync_queue"
    ADD CONSTRAINT "graph_sync_queue_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_categories"
    ADD CONSTRAINT "inventory_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."inventory_categories"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."inventory_items"
    ADD CONSTRAINT "inventory_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."et_inventory_ledger"
    ADD CONSTRAINT "inventory_ledger_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."et_inventory_ledger"
    ADD CONSTRAINT "inventory_ledger_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."et_inventory_ledger"
    ADD CONSTRAINT "inventory_ledger_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_items"
    ADD CONSTRAINT "invoice_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_household_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."outbox_events"
    ADD CONSTRAINT "outbox_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."et_po_line_items"
    ADD CONSTRAINT "po_line_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."et_po_line_items"
    ADD CONSTRAINT "po_line_items_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "public"."et_purchase_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."et_po_line_items"
    ADD CONSTRAINT "po_line_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."et_purchase_orders"
    ADD CONSTRAINT "purchase_orders_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."et_purchase_orders"
    ADD CONSTRAINT "purchase_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."receipt_items"
    ADD CONSTRAINT "receipt_items_household_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."receipt_items"
    ADD CONSTRAINT "receipt_items_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."system_telemetry"
    ADD CONSTRAINT "system_telemetry_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tenant_members"
    ADD CONSTRAINT "tenant_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."chart_of_accounts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."whatsapp_inbox"
    ADD CONSTRAINT "whatsapp_inbox_outbox_id_fkey" FOREIGN KEY ("outbox_id") REFERENCES "public"."whatsapp_outbox"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."whatsapp_inbox"
    ADD CONSTRAINT "whatsapp_inbox_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."whatsapp_outbox"
    ADD CONSTRAINT "whatsapp_outbox_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."whatsapp_outbox"
    ADD CONSTRAINT "whatsapp_outbox_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



CREATE POLICY "Enable insert for authenticated users" ON "public"."activity_log" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable insert for authenticated users" ON "public"."system_telemetry" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Members see own" ON "public"."tenant_members" FOR SELECT TO "authenticated" USING (("email" = "auth"."email"()));



CREATE POLICY "Service Role Only" ON "public"."graph_sync_queue" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Tenant Isolation" ON "public"."activity_log" FOR SELECT TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."app_users" FOR SELECT TO "authenticated" USING ((("id" = "auth"."uid"()) OR ("tenant_id" = "public"."get_my_tenant"())));



CREATE POLICY "Tenant Isolation" ON "public"."chart_of_accounts" TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."inventory_categories" TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."inventory_items" TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."et_inventory_ledger" TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."invoice_items" TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."invoices" TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."locations" USING (("tenant_id" = "public"."get_my_tenant"())) WITH CHECK (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."outbox_events" TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."et_po_line_items" TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."et_purchase_orders" TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."receipt_items" USING (("tenant_id" = "public"."get_my_tenant"())) WITH CHECK (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."system_telemetry" FOR SELECT TO "authenticated" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."tenants" USING (("id" = "public"."get_my_tenant"())) WITH CHECK (("id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant Isolation" ON "public"."transactions" USING (("tenant_id" = "public"."get_my_tenant"())) WITH CHECK (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant isolation api_keys" ON "public"."api_keys" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant isolation inbox" ON "public"."whatsapp_inbox" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant isolation outbox" ON "public"."whatsapp_outbox" USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant members can view other members" ON "public"."tenant_members" FOR SELECT USING (("tenant_id" = "public"."get_my_tenant"()));



CREATE POLICY "Tenant owners can manage members" ON "public"."tenant_members" USING ((("tenant_id" = "public"."get_my_tenant"()) AND "public"."is_tenant_management_privileged"("tenant_id")));



CREATE POLICY "Users can manage their own row" ON "public"."app_users" TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can view their own memberships" ON "public"."tenant_members" FOR SELECT USING (("email" = ("auth"."jwt"() ->> 'email'::"text")));



ALTER TABLE "public"."activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."api_keys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chart_of_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."graph_sync_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."et_inventory_ledger" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoice_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."outbox_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."et_po_line_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."et_purchase_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."receipt_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_telemetry" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenant_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."whatsapp_inbox" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."whatsapp_outbox" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































REVOKE ALL ON FUNCTION "public"."add_transaction_v3"("p_transaction" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."add_transaction_v3"("p_transaction" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_transaction_v3"("p_transaction" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."add_transactions_bulk_v1"("p_transactions" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."add_transactions_bulk_v1"("p_transactions" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_transactions_bulk_v1"("p_transactions" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."audit_expense_mutation"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."audit_expense_mutation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_expense_mutation"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."auto_invoice_outbox_signal"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."auto_invoice_outbox_signal"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_invoice_outbox_signal"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."check_rate_limit"("p_ip_hash" "text", "p_action" "text", "p_max_attempts" integer, "p_window_minutes" integer, "p_block_minutes" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_ip_hash" "text", "p_action" "text", "p_max_attempts" integer, "p_window_minutes" integer, "p_block_minutes" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_rate_limit"("p_ip_hash" "text", "p_action" "text", "p_max_attempts" integer, "p_window_minutes" integer, "p_block_minutes" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."check_tenant_pin"("h_id" "uuid", "input_pin" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."check_tenant_pin"("h_id" "uuid", "input_pin" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_tenant_pin"("h_id" "uuid", "input_pin" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."consume_procurement_signal"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."consume_procurement_signal"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."consume_procurement_signal"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_inventory_item_v1"("p_item" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_inventory_item_v1"("p_item" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_inventory_item_v1"("p_item" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_organization"("p_name" "text", "p_handle" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_organization"("p_name" "text", "p_handle" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_organization"("p_name" "text", "p_handle" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."enqueue_graph_sync_internal"("p_tenant_id" "uuid", "p_entity_type" "text", "p_entity_id" "uuid", "p_operation" "text", "p_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."enqueue_graph_sync_internal"("p_tenant_id" "uuid", "p_entity_type" "text", "p_entity_id" "uuid", "p_operation" "text", "p_payload" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_function_security_state"("p_func_name" "text", "p_args_signature" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_function_security_state"("p_func_name" "text", "p_args_signature" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_function_security_state"("p_func_name" "text", "p_args_signature" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_my_available_tenants"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_my_available_tenants"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_available_tenants"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_my_tenant"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_my_tenant"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_tenant"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_tenant_bundle"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_tenant_bundle"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_tenant_bundle"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_tenant_management_privileged"("p_tenant_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_tenant_management_privileged"("p_tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_tenant_management_privileged"("p_tenant_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."log_expense_activity"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."log_expense_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_expense_activity"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."notify_outbox_event"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notify_outbox_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_outbox_event"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."purge_expired_whatsapp_logs"("days_to_keep" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."purge_expired_whatsapp_logs"("days_to_keep" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."purge_expired_whatsapp_logs"("days_to_keep" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."receive_purchase_order_v1"("p_po_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."receive_purchase_order_v1"("p_po_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."receive_purchase_order_v1"("p_po_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."rls_auto_enable"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."safe_cast_user_uuid"("p_val" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."safe_cast_user_uuid"("p_val" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."safe_cast_user_uuid"("p_val" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."safe_cast_uuid"("p_val" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."safe_cast_uuid"("p_val" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."safe_cast_uuid"("p_val" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_receipt_v3"("p_expense" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_receipt_v3"("p_expense" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_receipt_v3"("p_expense" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_receipt_v3"("p_expense" "jsonb", "p_items" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_receipt_v3"("p_expense" "jsonb", "p_items" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_receipt_v3"("p_expense" "jsonb", "p_items" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_receipt_v3"("p_expense" "jsonb", "p_items" "jsonb", "p_location_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_receipt_v3"("p_expense" "jsonb", "p_items" "jsonb", "p_location_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_receipt_v3"("p_expense" "jsonb", "p_items" "jsonb", "p_location_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."save_receipt_v4"("p_transaction" "jsonb", "p_items" "jsonb", "p_location_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."save_receipt_v4"("p_transaction" "jsonb", "p_items" "jsonb", "p_location_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_receipt_v4"("p_transaction" "jsonb", "p_items" "jsonb", "p_location_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."signal_procurement_to_finance"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."signal_procurement_to_finance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."signal_procurement_to_finance"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."soft_delete_transaction_v1"("p_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."soft_delete_transaction_v1"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."soft_delete_transaction_v1"("p_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."switch_tenant"("p_tenant_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."switch_tenant"("p_tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."switch_tenant"("p_tenant_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_modified_column"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_tenant_config_v1"("p_config" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_tenant_config_v1"("p_config" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_tenant_config_v1"("p_config" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_transaction_v1"("p_id" "uuid", "p_transaction" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_transaction_v1"("p_id" "uuid", "p_transaction" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_transaction_v1"("p_id" "uuid", "p_transaction" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_updated_at_column"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_app_user_v1"("p_tenant_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_app_user_v1"("p_tenant_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_app_user_v1"("p_tenant_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."verify_tenant_access"("input_code" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."verify_tenant_access"("input_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_tenant_access"("input_code" "text") TO "service_role";


















GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."activity_log" TO "anon";
GRANT ALL ON TABLE "public"."activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."api_keys" TO "anon";
GRANT ALL ON TABLE "public"."api_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."api_keys" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."app_users" TO "anon";
GRANT ALL ON TABLE "public"."app_users" TO "authenticated";
GRANT ALL ON TABLE "public"."app_users" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."chart_of_accounts" TO "anon";
GRANT ALL ON TABLE "public"."chart_of_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."chart_of_accounts" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."et_inventory_ledger" TO "anon";
GRANT ALL ON TABLE "public"."et_inventory_ledger" TO "authenticated";
GRANT ALL ON TABLE "public"."et_inventory_ledger" TO "service_role";



GRANT ALL ON TABLE "public"."current_inventory" TO "anon";
GRANT ALL ON TABLE "public"."current_inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."current_inventory" TO "service_role";



GRANT ALL ON TABLE "public"."graph_sync_queue" TO "anon";
GRANT ALL ON TABLE "public"."graph_sync_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."graph_sync_queue" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."inventory_categories" TO "anon";
GRANT ALL ON TABLE "public"."inventory_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_categories" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."inventory_items" TO "anon";
GRANT ALL ON TABLE "public"."inventory_items" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_items" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."invoice_items" TO "anon";
GRANT ALL ON TABLE "public"."invoice_items" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_items" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."outbox_events" TO "anon";
GRANT ALL ON TABLE "public"."outbox_events" TO "authenticated";
GRANT ALL ON TABLE "public"."outbox_events" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."et_po_line_items" TO "anon";
GRANT ALL ON TABLE "public"."et_po_line_items" TO "authenticated";
GRANT ALL ON TABLE "public"."et_po_line_items" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."et_purchase_orders" TO "anon";
GRANT ALL ON TABLE "public"."et_purchase_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."et_purchase_orders" TO "service_role";



GRANT ALL ON TABLE "public"."rate_limits" TO "anon";
GRANT ALL ON TABLE "public"."rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."rate_limits" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."receipt_items" TO "anon";
GRANT ALL ON TABLE "public"."receipt_items" TO "authenticated";
GRANT ALL ON TABLE "public"."receipt_items" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."system_telemetry" TO "anon";
GRANT ALL ON TABLE "public"."system_telemetry" TO "authenticated";
GRANT ALL ON TABLE "public"."system_telemetry" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."tenant_members" TO "anon";
GRANT ALL ON TABLE "public"."tenant_members" TO "authenticated";
GRANT ALL ON TABLE "public"."tenant_members" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."whatsapp_inbox" TO "anon";
GRANT ALL ON TABLE "public"."whatsapp_inbox" TO "authenticated";
GRANT ALL ON TABLE "public"."whatsapp_inbox" TO "service_role";



GRANT ALL ON TABLE "public"."whatsapp_outbox" TO "anon";
GRANT ALL ON TABLE "public"."whatsapp_outbox" TO "authenticated";
GRANT ALL ON TABLE "public"."whatsapp_outbox" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































drop extension if exists "pg_net";

revoke delete on table "public"."activity_log" from "anon";

revoke update on table "public"."activity_log" from "anon";

revoke delete on table "public"."app_users" from "anon";

revoke insert on table "public"."app_users" from "anon";

revoke update on table "public"."app_users" from "anon";

revoke delete on table "public"."chart_of_accounts" from "anon";

revoke insert on table "public"."chart_of_accounts" from "anon";

revoke update on table "public"."chart_of_accounts" from "anon";

revoke delete on table "public"."inventory_categories" from "anon";

revoke insert on table "public"."inventory_categories" from "anon";

revoke update on table "public"."inventory_categories" from "anon";

revoke delete on table "public"."inventory_items" from "anon";

revoke insert on table "public"."inventory_items" from "anon";

revoke update on table "public"."inventory_items" from "anon";

revoke delete on table "public"."et_inventory_ledger" from "anon";

revoke insert on table "public"."et_inventory_ledger" from "anon";

revoke update on table "public"."et_inventory_ledger" from "anon";

revoke delete on table "public"."invoice_items" from "anon";

revoke insert on table "public"."invoice_items" from "anon";

revoke update on table "public"."invoice_items" from "anon";

revoke delete on table "public"."invoices" from "anon";

revoke insert on table "public"."invoices" from "anon";

revoke update on table "public"."invoices" from "anon";

revoke delete on table "public"."locations" from "anon";

revoke insert on table "public"."locations" from "anon";

revoke update on table "public"."locations" from "anon";

revoke delete on table "public"."outbox_events" from "anon";

revoke insert on table "public"."outbox_events" from "anon";

revoke update on table "public"."outbox_events" from "anon";

revoke delete on table "public"."et_po_line_items" from "anon";

revoke insert on table "public"."et_po_line_items" from "anon";

revoke update on table "public"."et_po_line_items" from "anon";

revoke delete on table "public"."et_purchase_orders" from "anon";

revoke insert on table "public"."et_purchase_orders" from "anon";

revoke update on table "public"."et_purchase_orders" from "anon";

revoke delete on table "public"."receipt_items" from "anon";

revoke insert on table "public"."receipt_items" from "anon";

revoke update on table "public"."receipt_items" from "anon";

revoke delete on table "public"."system_telemetry" from "anon";

revoke update on table "public"."system_telemetry" from "anon";

revoke delete on table "public"."tenant_members" from "anon";

revoke insert on table "public"."tenant_members" from "anon";

revoke update on table "public"."tenant_members" from "anon";

revoke delete on table "public"."tenants" from "anon";

revoke insert on table "public"."tenants" from "anon";

revoke update on table "public"."tenants" from "anon";

revoke delete on table "public"."transactions" from "anon";

revoke insert on table "public"."transactions" from "anon";

revoke update on table "public"."transactions" from "anon";




-- === 20260525220000_pos_architecture.sql ===
-- ==========================================
-- POS Data Architecture Prep
-- ==========================================

-- 1. Expand graph_sync_queue entity_type to support POS and other future data
ALTER TABLE public.graph_sync_queue DROP CONSTRAINT IF EXISTS graph_sync_queue_entity_type_check;
ALTER TABLE public.graph_sync_queue ADD CONSTRAINT graph_sync_queue_entity_type_check
  CHECK (entity_type IN ('transaction', 'merchant', 'sale', 'menu_item', 'inventory_adjustment'));

-- 2. Grant access to authenticated users
ALTER TABLE public.graph_sync_queue ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.graph_sync_queue TO authenticated;
GRANT ALL ON TABLE public.graph_sync_queue TO service_role;


-- === 20260526001_whatsapp_outbox_enhancements.sql ===
-- ==========================================
-- Migration 28: WhatsApp outbox enhancements
-- 1. Add PROCESSING status to CHECK constraint
-- 2. Add retry_count column for backoff
-- 3. Add idempotency_key column for dedup
-- ==========================================

ALTER TABLE public.whatsapp_outbox
  DROP CONSTRAINT IF EXISTS whatsapp_outbox_status_check;

ALTER TABLE public.whatsapp_outbox
  ADD CONSTRAINT whatsapp_outbox_status_check
  CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'COMPLETED'));

ALTER TABLE public.whatsapp_outbox
  ADD COLUMN IF NOT EXISTS retry_count INT DEFAULT 0;

ALTER TABLE public.whatsapp_outbox
  ADD COLUMN IF NOT EXISTS idempotency_key UUID;
CREATE INDEX IF NOT EXISTS idx_whatsapp_outbox_idempotency ON public.whatsapp_outbox(idempotency_key);


-- === 20260526002_claim_whatsapp_outbox_batch.sql ===
-- ==========================================
-- Migration 29: Atomic batch claim for outbox
-- Used by Vercel Cron safety net
-- SKIP LOCKED prevents concurrent processor conflicts
-- ==========================================

CREATE OR REPLACE FUNCTION public.claim_whatsapp_outbox_batch(
  p_batch_size INT DEFAULT 10
)
RETURNS SETOF public.whatsapp_outbox
LANGUAGE sql
SET search_path = public
AS $$
  UPDATE public.whatsapp_outbox
  SET status = 'PROCESSING', processed_at = NOW()
  WHERE id IN (
    SELECT id FROM public.whatsapp_outbox
    WHERE status IN ('PENDING', 'FAILED')
      AND (
        status = 'PENDING'
        OR processed_at < NOW() - (COALESCE(retry_count, 0) * INTERVAL '5 minutes')
      )
      AND retry_count < 5
    ORDER BY created_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_whatsapp_outbox_batch FROM public;
-- Processing routes use service_role (server-to-server, no session)
GRANT EXECUTE ON FUNCTION public.claim_whatsapp_outbox_batch TO service_role;


-- === 20260526003_complete_whatsapp_action_v1.sql ===
-- ==========================================
-- Migration 30: Atomic action completion RPC
-- Fixes ACID V-49 split-brain in dispatchDecision
-- Marks COMPLETED AND returns webhook config in one TX
-- ==========================================

;


-- === 20260528001_graph_sync_queue_rpcs.sql ===
-- ==========================================
-- Migration 35: Graph Sync Queue Status RPCs
-- Fixes ACID V-75 in sync-neo4j route
-- Replaces direct graph_sync_queue.update() with atomic RPCs
-- ==========================================

-- RPC 1: Update individual graph_sync_queue entry status
-- Used for claiming (PROCESSING) and error handling (FAILED/PENDING retry)
CREATE OR REPLACE FUNCTION public.update_graph_sync_queue_status_v1(
  p_id UUID,
  p_status TEXT,
  p_retry_count INT DEFAULT NULL,
  p_last_error TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.graph_sync_queue
  SET
    status = p_status,
    processed_at = NOW(),
    retry_count = COALESCE(p_retry_count, retry_count),
    last_error = COALESCE(p_last_error, last_error)
  WHERE id = p_id;
END;
$$;

-- RPC 2: Bulk-complete multiple graph_sync_queue entries
-- Used after successful Neo4j merge
CREATE OR REPLACE FUNCTION public.complete_graph_sync_batch_v1(
  p_ids UUID[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.graph_sync_queue
  SET
    status = 'COMPLETED',
    processed_at = NOW()
  WHERE id = ANY(p_ids);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_graph_sync_queue_status_v1 FROM public, anon;
GRANT EXECUTE ON FUNCTION public.update_graph_sync_queue_status_v1 TO authenticated;

REVOKE EXECUTE ON FUNCTION public.complete_graph_sync_batch_v1 FROM public, anon;
GRANT EXECUTE ON FUNCTION public.complete_graph_sync_batch_v1 TO authenticated;


-- === 20260528002_service_transaction_rpcs.sql ===
-- ==========================================
-- Migration 36: Service-Role Transaction RPCs
-- Fixes ACID V-74 in financeAudit.ts
-- Provides SECURITY DEFINER RPCs for service_role callers
-- (where get_my_tenant() returns NULL because auth.uid() is NULL)
-- ==========================================

-- RPC 1: Update transaction fields by explicit tenant_id
-- Used by webhook-based finance audit service (service_role client)
CREATE OR REPLACE FUNCTION public.service_update_transaction_v1(
  p_tenant_id UUID,
  p_id UUID,
  p_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_at TIMESTAMPTZ;
  v_full_row JSONB;
BEGIN
  UPDATE transactions
  SET
    vat_detail = COALESCE(p_updates->'vat_detail', vat_detail),
    updated_at = NOW()
  WHERE id = p_id AND tenant_id = p_tenant_id
  RETURNING updated_at, to_jsonb(transactions.*) INTO v_updated_at, v_full_row;

  IF NOT FOUND THEN RAISE EXCEPTION 'Transaction not found'; END IF;

  PERFORM public.enqueue_graph_sync_internal(p_tenant_id, 'transaction', p_id, 'MERGE', v_full_row);

  RETURN jsonb_build_object('id', p_id, 'updated_at', v_updated_at);
END;
$$;

-- RPC 2: Soft-delete transaction by explicit tenant_id
-- Used by webhook-based finance audit service (service_role client)
CREATE OR REPLACE FUNCTION public.service_soft_delete_transaction_v1(
  p_tenant_id UUID,
  p_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_at TIMESTAMPTZ;
BEGIN
  UPDATE transactions
  SET is_deleted = true, updated_at = NOW()
  WHERE id = p_id AND tenant_id = p_tenant_id
  RETURNING updated_at INTO v_updated_at;

  IF NOT FOUND THEN RAISE EXCEPTION 'Transaction not found'; END IF;

  PERFORM public.enqueue_graph_sync_internal(p_tenant_id, 'transaction', p_id, 'DELETE', '{}'::JSONB);

  RETURN jsonb_build_object('id', p_id, 'updated_at', v_updated_at);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.service_update_transaction_v1 FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.service_update_transaction_v1 TO service_role;

REVOKE EXECUTE ON FUNCTION public.service_soft_delete_transaction_v1 FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.service_soft_delete_transaction_v1 TO service_role;


-- === 20260528003_insert_whatsapp_outbox_v2.sql ===
-- ==========================================
-- Migration 37: Extended outbox insert for notify route
-- Fixes ACID V-78 in notify/route.ts
-- Adds optional fields: api_key_id, webhook_url, webhook_secret, idempotency_key
-- ==========================================

;



-- === 20260529001_two_table_quarantine.sql ===
-- ==========================================
-- B2B EVOLUTION: PHASE 0 - TWO-TABLE + QUARANTINE
-- ==========================================
-- Adds: purchases table (COGS), quarantine/reconciliation tables,
-- polymorphic receipt_items migration, chart_of_accounts seed,
-- and release/approve/reject RPCs.

BEGIN;

-- ==========================================
-- 1. PURCHASES TABLE (COGS Ledger)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.purchases (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    location_id       UUID NOT NULL REFERENCES public.locations(id),
    account_id        UUID NOT NULL REFERENCES public.chart_of_accounts(id),

    vendor_name       TEXT,
    invoice_number    TEXT,

    total_amount      NUMERIC(12,2) NOT NULL,
    currency          TEXT NOT NULL DEFAULT 'EUR',
    tax_amount        NUMERIC(12,2),
    tax_rate          NUMERIC(5,2),

    receipt_type      TEXT NOT NULL DEFAULT 'scanned'
                      CHECK (receipt_type IN ('scanned', 'ekasa', 'manual', 'imported')),
    receipt_hash      TEXT,
    source_image_url  TEXT,

    purchase_date     DATE NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    quarantine_status TEXT NOT NULL DEFAULT 'PENDING'
                      CHECK (quarantine_status IN ('PENDING', 'APPROVED', 'REJECTED', 'AUTO_RELEASED')),
    reviewed_at       TIMESTAMPTZ,
    reviewed_by       UUID,  -- validated at app layer, no FK (auth.users is in auth schema)
    rejection_reason  TEXT,
    rejection_note    TEXT,

    UNIQUE (tenant_id, receipt_hash)
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases FORCE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.purchases
    FOR ALL TO authenticated
    USING (tenant_id = public.get_my_tenant())
    WITH CHECK (tenant_id = public.get_my_tenant());

CREATE INDEX IF NOT EXISTS idx_purchases_tenant_date ON public.purchases(tenant_id, purchase_date);
CREATE INDEX IF NOT EXISTS idx_purchases_location ON public.purchases(tenant_id, location_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(tenant_id, quarantine_status);

DROP TRIGGER IF EXISTS trg_purchases_updated_at ON public.purchases;
CREATE TRIGGER trg_purchases_updated_at
    BEFORE UPDATE ON public.purchases
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


-- ==========================================
-- 2. PURCHASE ANOMALY QUEUE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.purchase_anomaly_queue (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    location_id         UUID NOT NULL REFERENCES public.locations(id),

    purchase_id         UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    receipt_item_id     UUID REFERENCES public.receipt_items(id),

    check_type          TEXT NOT NULL
                        CHECK (check_type IN (
                            'price_spike',
                            'quantity_spike',
                            'new_vendor',
                            'duplicate',
                            'missing_receipt',
                            'vendor_mismatch'
                        )),
    severity            TEXT NOT NULL DEFAULT 'medium'
                        CHECK (severity IN ('low', 'medium', 'high')),
    anomaly_score       NUMERIC,
    anomaly_detail      TEXT,

    status              TEXT NOT NULL DEFAULT 'OPEN'
                        CHECK (status IN ('OPEN', 'DISMISSED', 'ESCALATED')),
    outbox_id           UUID REFERENCES public.whatsapp_outbox(id),

    notification_sent_at    TIMESTAMPTZ,
    response_received_at    TIMESTAMPTZ,
    response_decision       TEXT,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.purchase_anomaly_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_anomaly_queue FORCE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.purchase_anomaly_queue
    FOR ALL TO authenticated
    USING (tenant_id = public.get_my_tenant())
    WITH CHECK (tenant_id = public.get_my_tenant());

CREATE INDEX IF NOT EXISTS idx_paq_tenant_status ON public.purchase_anomaly_queue(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_paq_purchase ON public.purchase_anomaly_queue(purchase_id);


-- ==========================================
-- 3. PENDING TEXT FOLLOWUPS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pending_text_followups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    outbox_id       UUID NOT NULL REFERENCES public.whatsapp_outbox(id),

    entity_type     TEXT NOT NULL,
    entity_id       UUID NOT NULL,

    status          TEXT NOT NULL DEFAULT 'AWAITING_REPLY'
                    CHECK (status IN ('AWAITING_REPLY', 'COMPLETED', 'TIMEOUT')),
    prompt          TEXT NOT NULL,
    response        TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.pending_text_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_text_followups FORCE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.pending_text_followups
    FOR ALL TO authenticated
    USING (tenant_id = public.get_my_tenant())
    WITH CHECK (tenant_id = public.get_my_tenant());

CREATE INDEX IF NOT EXISTS idx_ptf_status ON public.pending_text_followups(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_ptf_outbox ON public.pending_text_followups(outbox_id);


-- ==========================================
-- 4. RECEIPT ITEMS: POLYMORPHIC FK MIGRATION
-- ==========================================
ALTER TABLE public.receipt_items
    ADD COLUMN IF NOT EXISTS source_type TEXT;

ALTER TABLE public.receipt_items
    ADD COLUMN IF NOT EXISTS source_id UUID;

-- Backfill existing rows: map transaction_id → source_type='transaction', source_id=transaction_id
UPDATE public.receipt_items
SET source_type = 'transaction', source_id = transaction_id
WHERE source_type IS NULL AND transaction_id IS NOT NULL;

-- Catch orphaned rows (no transaction_id) → system guest UUID
UPDATE public.receipt_items
SET source_type = 'transaction', source_id = '00000000-0000-0000-0000-000000000000'
WHERE source_type IS NULL;

ALTER TABLE public.receipt_items ALTER COLUMN source_type SET NOT NULL;
ALTER TABLE public.receipt_items ALTER COLUMN source_id SET NOT NULL;

ALTER TABLE public.receipt_items
    ADD CONSTRAINT receipt_items_source_type_check
    CHECK (source_type IN ('purchase', 'transaction'));

CREATE INDEX IF NOT EXISTS idx_receipt_items_source
    ON public.receipt_items(source_type, source_id);


-- ==========================================
-- 5. CHART OF ACCOUNTS: STANDARD SEED
-- ==========================================
-- Seed COGS account for every existing tenant
INSERT INTO public.chart_of_accounts (tenant_id, account_code, account_name, account_type)
SELECT t.id, 'COGS-001', 'Food & Beverage Cost', 'EXPENSE'
FROM public.tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM public.chart_of_accounts ca
    WHERE ca.tenant_id = t.id AND ca.account_code = 'COGS-001'
);

-- Seed 8 standard OPEX accounts per tenant
INSERT INTO public.chart_of_accounts (tenant_id, account_code, account_name, account_type)
SELECT t.id, codes.code, codes.name, 'EXPENSE'
FROM public.tenants t
CROSS JOIN (
    VALUES
        ('OPEX-001', 'Rent & Utilities'),
        ('OPEX-002', 'Salaries & Wages'),
        ('OPEX-003', 'Marketing & Advertising'),
        ('OPEX-004', 'Equipment & Maintenance'),
        ('OPEX-005', 'Professional Services'),
        ('OPEX-006', 'Insurance'),
        ('OPEX-007', 'Office & General'),
        ('OPEX-008', 'Travel & Entertainment')
) AS codes(code, name)
WHERE NOT EXISTS (
    SELECT 1 FROM public.chart_of_accounts ca
    WHERE ca.tenant_id = t.id AND ca.account_code = codes.code
);


-- ==========================================
-- 6. RELEASE EXPIRED QUARANTINES RPC
-- ==========================================



-- ==========================================
-- 7. APPROVE PURCHASE RPC
-- ==========================================
CREATE OR REPLACE FUNCTION public.approve_purchase_v1(
    p_purchase_id UUID,
    p_queue_id UUID
)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.purchases
    SET quarantine_status = 'APPROVED', reviewed_at = NOW()
    WHERE id = p_purchase_id AND quarantine_status = 'PENDING';

    UPDATE public.purchase_anomaly_queue
    SET status = 'DISMISSED'
    WHERE id = p_queue_id AND status = 'OPEN';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.approve_purchase_v1(UUID, UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.approve_purchase_v1(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_purchase_v1(UUID, UUID) TO service_role;


-- ==========================================
-- 8. REJECT PURCHASE RPC
-- ==========================================
CREATE OR REPLACE FUNCTION public.reject_purchase_v1(
    p_purchase_id UUID,
    p_queue_id UUID,
    p_rejection_note TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    UPDATE public.purchases
    SET quarantine_status = 'REJECTED',
        reviewed_at = NOW(),
        rejection_note = p_rejection_note
    WHERE id = p_purchase_id AND quarantine_status = 'PENDING';

    UPDATE public.purchase_anomaly_queue
    SET status = 'DISMISSED'
    WHERE id = p_queue_id AND status = 'OPEN';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reject_purchase_v1(UUID, UUID, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.reject_purchase_v1(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_purchase_v1(UUID, UUID, TEXT) TO service_role;


COMMIT;


-- === 20260529002_pos_batch_staging.sql ===
-- ==========================================
-- Phase 1: POS Batch Staging Tables
-- Batch Ingestion & Food Cost Variance Pipeline
-- ==========================================
BEGIN;

-- ==========================================
-- 1. POS BATCH UPLOADS (batch metadata)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pos_batch_uploads (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    location_id       UUID NOT NULL REFERENCES public.locations(id),
    batch_id          TEXT,
    source            TEXT,

    status            TEXT NOT NULL DEFAULT 'STAGED'
                      CHECK (status IN ('STAGED', 'PROCESSING', 'COMPLETED', 'FAILED')),

    total_receipts    INTEGER NOT NULL DEFAULT 0,
    approved_rows     INTEGER NOT NULL DEFAULT 0,
    quarantined_rows  INTEGER NOT NULL DEFAULT 0,

    period_start      DATE,
    period_end        DATE,

    received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at      TIMESTAMPTZ,
    error_detail      JSONB,

    UNIQUE (tenant_id, batch_id)
);

ALTER TABLE public.pos_batch_uploads ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. POS TRANSACTION STAGING (item-level)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pos_transaction_staging (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id          UUID NOT NULL REFERENCES public.pos_batch_uploads(id) ON DELETE CASCADE,
    tenant_id         UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    location_id       UUID NOT NULL REFERENCES public.locations(id),
    line_number       INTEGER NOT NULL,

    raw_payload       JSONB NOT NULL,

    transaction_time  TIMESTAMPTZ NOT NULL,
    receipt_number    TEXT,

    item_sku          TEXT,
    item_name         TEXT,
    quantity          NUMERIC,
    revenue           NUMERIC,
    is_void           BOOLEAN DEFAULT false,
    is_comp           BOOLEAN DEFAULT false,

    recipe_found      BOOLEAN,
    theoretical_grams JSONB,

    anomaly_score     NUMERIC,
    anomaly_reason    TEXT,
    flag              TEXT NOT NULL DEFAULT 'PENDING'
                      CHECK (flag IN ('PENDING', 'APPROVED', 'QUARANTINED')),

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pos_transaction_staging ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_staging_batch
    ON public.pos_transaction_staging(batch_id, flag);
CREATE INDEX IF NOT EXISTS idx_staging_time
    ON public.pos_transaction_staging(tenant_id, transaction_time);
CREATE INDEX IF NOT EXISTS idx_staging_sku
    ON public.pos_transaction_staging(tenant_id, item_sku);

-- ==========================================
-- 3. POS DATA GAPS (expected-but-not-received)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.pos_data_gaps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    location_id     UUID NOT NULL REFERENCES public.locations(id),
    gap_date        DATE NOT NULL,
    notified_at     TIMESTAMPTZ,
    resolved_at     TIMESTAMPTZ,

    UNIQUE (tenant_id, location_id, gap_date)
);

ALTER TABLE public.pos_data_gaps ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. GRANT PERMISSIONS
-- ==========================================
GRANT ALL ON TABLE public.pos_batch_uploads TO authenticated;
GRANT ALL ON TABLE public.pos_batch_uploads TO service_role;

GRANT ALL ON TABLE public.pos_transaction_staging TO authenticated;
GRANT ALL ON TABLE public.pos_transaction_staging TO service_role;

GRANT ALL ON TABLE public.pos_data_gaps TO authenticated;
GRANT ALL ON TABLE public.pos_data_gaps TO service_role;

-- ==========================================
-- 5. QUARANTINE AUDIT VIEW
-- ==========================================
CREATE OR REPLACE VIEW public.v_quarantine_audit AS
SELECT
    b.id               AS batch_id,
    b.batch_id         AS ims_batch_id,
    b.received_at,
    s.line_number,
    s.transaction_time,
    s.item_sku,
    s.item_name,
    s.quantity,
    s.revenue,
    s.anomaly_score,
    s.anomaly_reason
FROM public.pos_transaction_staging s
JOIN public.pos_batch_uploads b ON b.id = s.batch_id
WHERE s.flag = 'QUARANTINED'
ORDER BY b.received_at DESC, s.line_number;

GRANT ALL ON TABLE public.v_quarantine_audit TO authenticated;
GRANT ALL ON TABLE public.v_quarantine_audit TO service_role;

-- ==========================================
-- 6. UTILITY RPCS FOR TESTING
-- ==========================================

-- Check if an index exists (used by test suite)
CREATE OR REPLACE FUNCTION public.get_index_exists(p_table TEXT, p_index TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SET search_path TO 'public'
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = p_table
    AND indexname = p_index
  );
$$;

REVOKE EXECUTE ON FUNCTION public.get_index_exists(TEXT, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_index_exists(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_index_exists(TEXT, TEXT) TO service_role;

-- Check if RLS is enabled on a table (used by test suite)
CREATE OR REPLACE FUNCTION public.get_table_rls_status(p_table TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SET search_path TO 'public'
STABLE
AS $$
  SELECT relrowsecurity
  FROM pg_class
  WHERE relname = p_table
    AND relnamespace = 'public'::regnamespace;
$$;

REVOKE EXECUTE ON FUNCTION public.get_table_rls_status(TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_table_rls_status(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_rls_status(TEXT) TO service_role;

-- ==========================================
-- 7. PROCESS BATCH V1 (anomaly detection)
-- ==========================================
CREATE OR REPLACE FUNCTION public.process_batch_v1(p_batch_id UUID)
RETURNS TABLE(total_rows INTEGER, approved INTEGER, quarantined INTEGER)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
    v_tenant_id UUID;
    v_batch_status TEXT;
    v_approved INTEGER := 0;
    v_quarantined INTEGER := 0;
    r RECORD;
    b RECORD;
    z_price NUMERIC;
    z_qty NUMERIC;
    max_z NUMERIC;
    reason TEXT;
BEGIN
    SELECT tenant_id, status INTO v_tenant_id, v_batch_status
    FROM public.pos_batch_uploads WHERE id = p_batch_id FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'Batch % not found', p_batch_id; END IF;
    IF v_batch_status != 'STAGED' THEN
        RAISE EXCEPTION 'Batch % is in % state', p_batch_id, v_batch_status;
    END IF;

    UPDATE public.pos_batch_uploads SET status = 'PROCESSING', processed_at = NOW()
    WHERE id = p_batch_id;

    FOR r IN SELECT * FROM public.pos_transaction_staging
             WHERE batch_id = p_batch_id ORDER BY line_number
    LOOP
        max_z := 0;
        reason := NULL;

        SELECT
            COUNT(*) AS n,
            AVG(revenue) AS mean_rev,
            COALESCE(STDDEV(revenue), 0) AS stddev_rev,
            AVG(quantity) AS mean_qty,
            COALESCE(STDDEV(quantity), 0) AS stddev_qty
        INTO b
        FROM public.pos_transaction_staging
        WHERE tenant_id = v_tenant_id
          AND item_sku = r.item_sku
          AND flag = 'APPROVED'
          AND created_at >= NOW() - INTERVAL '90 days';

        IF b.n >= 5 THEN
            IF b.stddev_rev > 0 THEN
                z_price := ABS(r.revenue - b.mean_rev) / b.stddev_rev;
                IF z_price > 3 THEN
                    max_z := GREATEST(max_z, z_price);
                    reason := COALESCE(reason || '; ', '')
                        || format('revenue Z=%.1f (>3σ)', z_price);
                END IF;
            END IF;

            IF b.stddev_qty > 0 THEN
                z_qty := ABS(r.quantity - b.mean_qty) / b.stddev_qty;
                IF z_qty > 3 THEN
                    max_z := GREATEST(max_z, z_qty);
                    reason := COALESCE(reason || '; ', '')
                        || format('quantity Z=%.1f (>3σ)', z_qty);
                END IF;
            END IF;

            IF r.quantity < 0 AND NOT r.is_void THEN
                max_z := GREATEST(max_z, 99);
                reason := COALESCE(reason || '; ', '') || 'negative quantity without void flag';
            END IF;
            IF r.revenue < 0 THEN
                max_z := GREATEST(max_z, 99);
                reason := COALESCE(reason || '; ', '') || 'negative revenue';
            END IF;
        END IF;

        IF max_z >= 3 THEN
            v_quarantined := v_quarantined + 1;
            UPDATE public.pos_transaction_staging
            SET flag = 'QUARANTINED', anomaly_score = max_z, anomaly_reason = reason
            WHERE id = r.id;
        ELSE
            v_approved := v_approved + 1;
            UPDATE public.pos_transaction_staging
            SET flag = 'APPROVED', anomaly_score = max_z
            WHERE id = r.id;
        END IF;
    END LOOP;

    UPDATE public.pos_batch_uploads
    SET status = 'COMPLETED',
        approved_rows = v_approved,
        quarantined_rows = v_quarantined,
        total_receipts = v_approved + v_quarantined
    WHERE id = p_batch_id;

    RETURN QUERY SELECT v_approved + v_quarantined, v_approved, v_quarantined;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_batch_v1(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.process_batch_v1(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_batch_v1(UUID) TO service_role;

COMMIT;


-- === 20260529003_recipe_cache.sql ===
-- ==========================================
-- Phase 2: Recipe Cache Tables
-- Batch Ingestion & Food Cost Variance Pipeline
-- ==========================================
BEGIN;

-- ==========================================
-- 1. CACHED RECIPES
-- Populated from IMS API, 24h TTL
-- ==========================================
CREATE TABLE IF NOT EXISTS public.cached_recipes (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    menu_item_id          TEXT NOT NULL,
    menu_item_name        TEXT NOT NULL,
    selling_price         NUMERIC,
    is_active             BOOLEAN DEFAULT true,
    ingredients           JSONB NOT NULL,
    total_ingredient_cost NUMERIC,
    food_cost_pct         NUMERIC,
    fetched_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, menu_item_id)
);

ALTER TABLE public.cached_recipes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_cached_recipes_lookup
    ON public.cached_recipes(tenant_id, menu_item_id);

-- ==========================================
-- 2. CACHED INGREDIENTS
-- Populated from IMS API, 24h TTL
-- ==========================================
CREATE TABLE IF NOT EXISTS public.cached_ingredients (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    ingredient_id       TEXT NOT NULL,
    canonical_name      TEXT NOT NULL,
    category            TEXT,
    base_unit           TEXT,
    perishability_days  INTEGER,
    current_stock_grams NUMERIC,
    cost_per_gram       NUMERIC,
    fetched_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, ingredient_id)
);

ALTER TABLE public.cached_ingredients ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_cached_ingredients_lookup
    ON public.cached_ingredients(tenant_id, ingredient_id);

-- ==========================================
-- 3. GRANT PERMISSIONS
-- ==========================================
GRANT ALL ON TABLE public.cached_recipes TO authenticated;
GRANT ALL ON TABLE public.cached_recipes TO service_role;

GRANT ALL ON TABLE public.cached_ingredients TO authenticated;
GRANT ALL ON TABLE public.cached_ingredients TO service_role;

COMMIT;


-- === 20260529004_purchases_ingredient.sql ===
-- Phase 0.5: Add ingredient columns to purchases
-- The FCV Report engine needs per-ingredient purchase granularity.
-- Each purchase row can optionally reference an ingredient_id for
-- food-cost-variance computation.

ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS ingredient_id   TEXT,
  ADD COLUMN IF NOT EXISTS ingredient_name TEXT;

CREATE INDEX IF NOT EXISTS idx_purchases_ingredient
  ON public.purchases(tenant_id, ingredient_id);


-- === 20260530001_fix_rpc_secdef_membership.sql ===
-- ==========================================
-- Migration 31/20260530: Fix dispatchDecision cross-tenant bug
-- Adds SECURITY DEFINER + explicit tenant_members check to
-- complete_whatsapp_action_v1.
-- 
-- The RLS policy on whatsapp_outbox scopes by get_my_tenant() which may
-- not match the outbox's tenant (user is member of multiple tenants).
-- SECURITY DEFINER bypasses this scope filter; membership is verified
-- explicitly via auth.jwt()->>'email' — same pattern as
-- is_tenant_management_privileged().
-- ==========================================

CREATE OR REPLACE FUNCTION public.complete_whatsapp_action_v1(
  p_outbox_id UUID,
  p_decision TEXT
)
RETURNS TABLE (
  status TEXT,
  webhook_url TEXT,
  webhook_secret TEXT,
  payload JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_status TEXT;
  v_webhook_url TEXT;
  v_webhook_secret TEXT;
  v_payload JSONB;
BEGIN
  -- 1. Read the outbox's tenant (SECURITY DEFINER bypasses RLS scope filter)
  SELECT wo.tenant_id INTO v_tenant_id
  FROM public.whatsapp_outbox wo
  WHERE wo.id = p_outbox_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'NOT_FOUND'::TEXT, NULL::TEXT, NULL::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  -- 2. Verify caller is a member of this tenant (explicit auth, not RLS)
  IF NOT EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = v_tenant_id
      AND tm.email = auth.jwt()->>'email'
  ) THEN
    RETURN QUERY SELECT 'NOT_FOUND'::TEXT, NULL::TEXT, NULL::TEXT, NULL::JSONB;
    RETURN;
  END IF;

  -- 3. Atomically mark COMPLETED (only if still pending/sent)
  UPDATE public.whatsapp_outbox AS wo
  SET status = 'COMPLETED', processed_at = NOW(),
      payload = jsonb_set(COALESCE(wo.payload, '{}'::jsonb), '{completed_decision}', to_jsonb(p_decision))
  WHERE wo.id = p_outbox_id AND wo.status IN ('PENDING', 'PROCESSING', 'SENT')
  RETURNING wo.status, wo.webhook_url, wo.webhook_secret, wo.payload
  INTO v_status, v_webhook_url, v_webhook_secret, v_payload;

  IF NOT FOUND THEN
    -- Already completed by sidecar/webhook race — return success without re-firing
    SELECT wo.status, wo.webhook_url, wo.webhook_secret, wo.payload
    INTO v_status, v_webhook_url, v_webhook_secret, v_payload
    FROM public.whatsapp_outbox wo
    WHERE wo.id = p_outbox_id;
    RETURN QUERY SELECT 'COMPLETED_SKIP_WEBHOOK'::TEXT, v_webhook_url, v_webhook_secret, v_payload;
    RETURN;
  END IF;

  RETURN QUERY SELECT v_status, v_webhook_url, v_webhook_secret, v_payload;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_whatsapp_action_v1 FROM public;
-- Server actions use session-based anon key (authenticated role)
GRANT EXECUTE ON FUNCTION public.complete_whatsapp_action_v1 TO authenticated;


-- === 20260530002_add_recipient_email.sql ===
-- ==========================================
-- Migration 20260530002: Add recipient_email to whatsapp_outbox
-- 
-- 1. Adds recipient_email column so we can filter by the current user
-- 2. Updates insert_whatsapp_outbox_v2 to store recipient_email
-- 3. Creates get_pending_approvals_v1 RPC that returns only the
--    current user's pending/SENT outbox records
-- ==========================================

-- Phase 1: Add recipient_email column
ALTER TABLE public.whatsapp_outbox
  ADD COLUMN IF NOT EXISTS recipient_email TEXT;

CREATE INDEX IF NOT EXISTS idx_whatsapp_outbox_recipient_email
  ON public.whatsapp_outbox(recipient_email);

-- Phase 2: Drop all existing overloads, then recreate with new param
DROP FUNCTION IF EXISTS public.insert_whatsapp_outbox_v2;
CREATE OR REPLACE FUNCTION public.insert_whatsapp_outbox_v2(
  p_tenant_id UUID,
  p_recipient_phone TEXT,
  p_payload JSONB,
  p_api_key_id UUID DEFAULT NULL,
  p_webhook_url TEXT DEFAULT NULL,
  p_webhook_secret TEXT DEFAULT NULL,
  p_idempotency_key UUID DEFAULT NULL,
  p_recipient_email TEXT DEFAULT NULL
)
RETURNS SETOF public.whatsapp_outbox
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.whatsapp_outbox
    (tenant_id, recipient_phone, payload, status, api_key_id, webhook_url, webhook_secret, idempotency_key, recipient_email)
  VALUES
    (p_tenant_id, p_recipient_phone, p_payload, 'PENDING', p_api_key_id, p_webhook_url, p_webhook_secret, p_idempotency_key, p_recipient_email)
  RETURNING *;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.insert_whatsapp_outbox_v2 FROM public, anon;
GRANT EXECUTE ON FUNCTION public.insert_whatsapp_outbox_v2 TO authenticated, service_role;

-- Phase 3: Create per-user pending approvals RPC
CREATE OR REPLACE FUNCTION public.get_pending_approvals_v1()
RETURNS TABLE (
  id UUID,
  payload JSONB,
  recipient_phone TEXT,
  recipient_email TEXT,
  tenant_id UUID,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT wo.id, wo.payload, wo.recipient_phone, wo.recipient_email,
         wo.tenant_id, wo.status, wo.created_at
  FROM public.whatsapp_outbox wo
  WHERE wo.tenant_id = public.get_my_tenant()
    AND wo.recipient_email = auth.jwt()->>'email'
    AND wo.status IN ('PENDING', 'SENT')
  ORDER BY wo.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_pending_approvals_v1 FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_pending_approvals_v1 TO authenticated;


-- === 20260530003_security_hardening_phase1.sql ===
-- Phase 1 Security Hardening
-- 1. Test-support RPCs for verifying anon privilege state
-- 2. Fix enqueue_graph_sync_internal (missing SECURITY DEFINER)
-- 3. Revoke excessive anon privileges on 6 tables
-- 4. Fix ALTER DEFAULT PRIVILEGES for anon
-- See AGENTS.md §8 for full audit context

-- ===== 1. Test-Support RPCs =====

-- Returns privilege state for a given table by role
CREATE OR REPLACE FUNCTION public.get_table_privilege_state_v1(
  p_table_name text
)
RETURNS TABLE(
  anon_has_select boolean,
  anon_has_insert boolean,
  anon_has_update boolean,
  anon_has_delete boolean,
  anon_has_references boolean,
  anon_has_trigger boolean,
  rls_enabled boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    has_table_privilege('anon', p_table_name, 'SELECT'),
    has_table_privilege('anon', p_table_name, 'INSERT'),
    has_table_privilege('anon', p_table_name, 'UPDATE'),
    has_table_privilege('anon', p_table_name, 'DELETE'),
    has_table_privilege('anon', p_table_name, 'REFERENCES'),
    has_table_privilege('anon', p_table_name, 'TRIGGER'),
    (SELECT relrowsecurity FROM pg_class WHERE oid = p_table_name::regclass);
END;
$$;

ALTER FUNCTION public.get_table_privilege_state_v1(text) OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.get_table_privilege_state_v1(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_table_privilege_state_v1(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_table_privilege_state_v1(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_privilege_state_v1(text) TO service_role;

-- Returns whether ALTER DEFAULT PRIVILEGES grants INSERT to anon for future tables
CREATE OR REPLACE FUNCTION public.check_default_privileges_v1()
RETURNS TABLE(anon_default_insert boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'pg_catalog', 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(bool_or(
    defaclacl::text LIKE '%anon%' AND defaclacl::text LIKE '%INSERT%'
  ), false)
  FROM pg_default_acl
  WHERE defaclnamespace = 'public'::regnamespace
    AND defaclobjtype = 'r';
END;
$$;

ALTER FUNCTION public.check_default_privileges_v1() OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.check_default_privileges_v1() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_default_privileges_v1() FROM anon;
GRANT EXECUTE ON FUNCTION public.check_default_privileges_v1() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_default_privileges_v1() TO service_role;

-- ===== 2. Fix enqueue_graph_sync_internal =====
-- This function is called by 4 SECURITY DEFINER RPCs (add_transaction_v3,
-- add_transactions_bulk_v1, soft_delete_transaction_v1, update_transaction_v1).
-- Without its own SECURITY DEFINER, it inherits the caller's permissions,
-- creating a "security sandwich" vulnerability where the DEFINER caller
-- elevates privileges and then drops into INVOKER context for the INSERT.

;

ALTER FUNCTION public.enqueue_graph_sync_internal(uuid, text, uuid, text, jsonb) OWNER TO postgres;

-- ===== 3. Revoke Excessive Anon Privileges =====
-- GRANT ALL to anon on these tables is overly permissive. RLS mitigates
-- INSERT/UPDATE/DELETE, but REFERENCES and TRIGGER bypass RLS.
-- We revoke ALL and grant only the minimum required privilege.

-- api_keys: zero anon access (contains secrets)
REVOKE ALL ON TABLE public.api_keys FROM anon;

-- current_inventory: read-only for public stock view
REVOKE ALL ON TABLE public.current_inventory FROM anon;
GRANT SELECT ON TABLE public.current_inventory TO anon;

-- graph_sync_queue: internal queue, zero anon access
REVOKE ALL ON TABLE public.graph_sync_queue FROM anon;

-- rate_limits: read-only for rate limit checks
REVOKE ALL ON TABLE public.rate_limits FROM anon;
GRANT SELECT ON TABLE public.rate_limits TO anon;

-- whatsapp_inbox: needs SELECT+INSERT for webhook inbound
REVOKE ALL ON TABLE public.whatsapp_inbox FROM anon;
GRANT SELECT, INSERT ON TABLE public.whatsapp_inbox TO anon;

-- whatsapp_outbox: internal queue, zero anon access
REVOKE ALL ON TABLE public.whatsapp_outbox FROM anon;

-- ===== 4. Fix ALTER DEFAULT PRIVILEGES =====
-- Current: GRANT ALL ON TABLES TO anon for future tables
-- Fixed: Remove default, then grant SELECT only
-- This prevents future migrations from auto-granting ALL to anon on new tables.

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT ON TABLES TO anon;

-- Also fix sequences: USAGE is sufficient for nextval()
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT USAGE ON SEQUENCES TO anon;


-- === 20260530004_fix_enqueue_searchpath.sql ===
-- Fix enqueue_graph_sync_internal search_path to match verification standard
-- All other SECURITY DEFINER functions use SET "search_path" TO 'public'
CREATE OR REPLACE FUNCTION public.enqueue_graph_sync_internal(
  p_tenant_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_operation text,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.graph_sync_queue (tenant_id, entity_type, entity_id, operation, payload)
    VALUES (p_tenant_id, p_entity_type, p_entity_id, p_operation, p_payload);
END;
$$;

ALTER FUNCTION public.enqueue_graph_sync_internal(uuid, text, uuid, text, jsonb) OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.enqueue_graph_sync_internal(uuid, text, uuid, text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_graph_sync_internal(uuid, text, uuid, text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.enqueue_graph_sync_internal(uuid, text, uuid, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_graph_sync_internal(uuid, text, uuid, text, jsonb) TO service_role;


-- === 20260531001_fix_release_expired_quarantines.sql ===
-- Fix: replace CTE-COUNT pattern with GET DIAGNOSTICS ROW_COUNT
-- Previous version overwrote v_released_purchases per tenant instead of accumulating
CREATE OR REPLACE FUNCTION public.release_expired_quarantines_v1()
RETURNS TABLE(released_purchases BIGINT, released_pending BIGINT, errors TEXT[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_released_purchases BIGINT := 0;
  v_released_pending BIGINT := 0;
  v_count BIGINT;
  v_errors TEXT[] := '{}';
  v_tenant RECORD;
BEGIN
  FOR v_tenant IN
    SELECT DISTINCT p.tenant_id
    FROM public.purchases p
    WHERE p.quarantine_status IN ('PENDING', 'REJECTED')
      AND p.created_at < NOW() - INTERVAL '30 days'
  LOOP
    BEGIN
      UPDATE public.purchases
      SET quarantine_status = 'RELEASED',
          updated_at = NOW(),
          released_at = NOW()
      WHERE tenant_id = v_tenant.tenant_id
        AND quarantine_status IN ('PENDING', 'REJECTED')
        AND created_at < NOW() - INTERVAL '30 days';
      GET DIAGNOSTICS v_count = ROW_COUNT;
      v_released_purchases := v_released_purchases + v_count;

      UPDATE public.purchase_anomaly_queue
      SET status = 'RESOLVED',
          resolved_at = NOW()
      WHERE tenant_id = v_tenant.tenant_id
        AND status = 'OPEN'
        AND created_at < NOW() - INTERVAL '30 days';
      GET DIAGNOSTICS v_count = ROW_COUNT;
      v_released_pending := v_released_pending + v_count;
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors || format('Tenant %s: %s', v_tenant.tenant_id, SQLERRM);
    END;
  END LOOP;
  RETURN QUERY SELECT v_released_purchases, v_released_pending, v_errors;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.release_expired_quarantines_v1() FROM anon, public;


-- === 20260531002_resolve_purchase_quarantine_v1.sql ===
-- Fix check constraints to accept RELEASED / RESOLVED values
-- Also implements the resolve_purchase_quarantine_v1 RPC

-- 1. Fix purchases.quarantine_status check constraint
ALTER TABLE public.purchases
  DROP CONSTRAINT IF EXISTS purchases_quarantine_status_check;

ALTER TABLE public.purchases
  ADD CONSTRAINT purchases_quarantine_status_check
  CHECK (quarantine_status IN ('PENDING', 'APPROVED', 'REJECTED', 'AUTO_RELEASED', 'RELEASED'));

-- 2. Fix purchase_anomaly_queue.status check constraint
ALTER TABLE public.purchase_anomaly_queue
  DROP CONSTRAINT IF EXISTS purchase_anomaly_queue_status_check;

ALTER TABLE public.purchase_anomaly_queue
  ADD CONSTRAINT purchase_anomaly_queue_status_check
  CHECK (status IN ('OPEN', 'DISMISSED', 'ESCALATED', 'RESOLVED'));

-- 3. Resolve purchase quarantine RPC
CREATE OR REPLACE FUNCTION public.resolve_purchase_quarantine_v1(
  p_purchase_id UUID,
  p_status TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate status
  IF p_status NOT IN ('RELEASED', 'REJECTED') THEN
    RETURN QUERY SELECT FALSE AS success, format('Invalid status: %s', p_status) AS message;
    RETURN;
  END IF;

  -- Update purchase
  UPDATE public.purchases
  SET quarantine_status = p_status,
      updated_at = NOW(),
      reviewed_at = NOW()
  WHERE id = p_purchase_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE AS success, 'Purchase not found' AS message;
    RETURN;
  END IF;

  -- Bulk resolve all anomaly queue rows for this purchase
  UPDATE public.purchase_anomaly_queue
  SET status = 'RESOLVED',
      resolved_at = NOW()
  WHERE purchase_id = p_purchase_id AND status = 'OPEN';

  RETURN QUERY SELECT TRUE AS success, format('Purchase %s resolved to %s', p_purchase_id, p_status) AS message;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.resolve_purchase_quarantine_v1(UUID, TEXT) FROM anon, public;


-- === 20260601003_fix_pos_rls_policies.sql ===
-- Fix: Add missing RLS policies for POS tables
-- pos_transaction_staging, pos_batch_uploads, and pos_data_gaps
-- all had RLS enabled but no policies, causing default-deny for authenticated users

-- ==========================================
-- 1. pos_transaction_staging
-- ==========================================
CREATE POLICY "Tenant isolation" ON public.pos_transaction_staging
    FOR ALL TO authenticated
    USING (tenant_id = public.get_my_tenant())
    WITH CHECK (tenant_id = public.get_my_tenant());

-- ==========================================
-- 2. pos_batch_uploads
-- ==========================================
CREATE POLICY "Tenant isolation" ON public.pos_batch_uploads
    FOR ALL TO authenticated
    USING (tenant_id = public.get_my_tenant())
    WITH CHECK (tenant_id = public.get_my_tenant());

-- ==========================================
-- 3. pos_data_gaps
-- ==========================================
CREATE POLICY "Tenant isolation" ON public.pos_data_gaps
    FOR ALL TO authenticated
    USING (tenant_id = public.get_my_tenant())
    WITH CHECK (tenant_id = public.get_my_tenant());


-- === 20260601004_copy_fcv_seed_data_to_user_tenant.sql ===
-- Copy FCV seed data from @demo-2026 (e3b20277) to demo-2026 (f039714b) user tenant
-- The seed script stored data into handle '@demo-2026' but the user logs into 'demo-2026'
-- These are separate tenant records with different UUIDs.

-- Constants
DO $$
DECLARE
    src_tenant CONSTANT uuid := 'e3b20277-a2c2-4bee-a69d-aa9f945486d3';
    dst_tenant CONSTANT uuid := 'f039714b-8276-4733-8172-58b049bd9163';
BEGIN

-- 1. pos_transaction_staging (5221 rows)
INSERT INTO public.pos_transaction_staging
    (tenant_id, batch_id, location_id, line_number, raw_payload,
     transaction_time, receipt_number, item_sku, item_name,
     quantity, revenue, is_void, is_comp,
     recipe_found, theoretical_grams, anomaly_score, anomaly_reason, flag,
     created_at)
SELECT
    dst_tenant, batch_id, location_id, line_number, raw_payload,
    transaction_time, receipt_number, item_sku, item_name,
    quantity, revenue, is_void, is_comp,
    recipe_found, theoretical_grams, anomaly_score, anomaly_reason, flag,
    created_at
FROM public.pos_transaction_staging
WHERE tenant_id = src_tenant
ON CONFLICT DO NOTHING;

-- 2. purchases (210 rows)
INSERT INTO public.purchases
    (tenant_id, location_id, account_id, vendor_name, invoice_number,
     total_amount, currency, tax_amount, tax_rate,
     receipt_type, receipt_hash, source_image_url,
     purchase_date, created_at, updated_at,
     quarantine_status, reviewed_at, reviewed_by, rejection_reason, rejection_note,
     ingredient_id, ingredient_name)
SELECT
    dst_tenant, location_id, account_id, vendor_name, invoice_number,
    total_amount, currency, tax_amount, tax_rate,
    receipt_type, receipt_hash, source_image_url,
    purchase_date, created_at, updated_at,
    quarantine_status, reviewed_at, reviewed_by, rejection_reason, rejection_note,
    ingredient_id, ingredient_name
FROM public.purchases
WHERE tenant_id = src_tenant
ON CONFLICT DO NOTHING;

-- 3. purchase_anomaly_queue (linked to purchases by purchase_id)
INSERT INTO public.purchase_anomaly_queue
    (tenant_id, location_id, purchase_id, receipt_item_id,
     check_type, severity, anomaly_score, anomaly_detail,
     status, outbox_id, notification_sent_at,
     response_received_at, response_decision, created_at)
SELECT
    dst_tenant, location_id, purchase_id, receipt_item_id,
    check_type, severity, anomaly_score, anomaly_detail,
    status, outbox_id, notification_sent_at,
    response_received_at, response_decision, created_at
FROM public.purchase_anomaly_queue
WHERE tenant_id = src_tenant
ON CONFLICT DO NOTHING;

-- 4. cached_recipes (6 rows)
INSERT INTO public.cached_recipes
    (tenant_id, menu_item_id, menu_item_name, selling_price,
     is_active, ingredients, total_ingredient_cost, food_cost_pct, fetched_at)
SELECT
    dst_tenant, menu_item_id, menu_item_name, selling_price,
    is_active, ingredients, total_ingredient_cost, food_cost_pct, fetched_at
FROM public.cached_recipes
WHERE tenant_id = src_tenant
ON CONFLICT DO NOTHING;

-- 5. cached_ingredients (10 rows)
INSERT INTO public.cached_ingredients
    (tenant_id, ingredient_id, canonical_name, category,
     base_unit, perishability_days, current_stock_grams,
     cost_per_gram, fetched_at)
SELECT
    dst_tenant, ingredient_id, canonical_name, category,
    base_unit, perishability_days, current_stock_grams,
    cost_per_gram, fetched_at
FROM public.cached_ingredients
WHERE tenant_id = src_tenant
ON CONFLICT DO NOTHING;

-- 6. chart_of_accounts (14 rows — merge with existing 9)
INSERT INTO public.chart_of_accounts
    (tenant_id, account_code, account_name, account_type, created_at)
SELECT
    dst_tenant, account_code, account_name, account_type, created_at
FROM public.chart_of_accounts
WHERE tenant_id = src_tenant
ON CONFLICT DO NOTHING;

-- 7. locations (3 rows — merge with existing 1)
INSERT INTO public.locations
    (tenant_id, name, address, metadata, created_at, updated_at)
SELECT
    dst_tenant, name, address, metadata, created_at, updated_at
FROM public.locations
WHERE tenant_id = src_tenant
ON CONFLICT DO NOTHING;

-- 8. Clear stale AI insight cache so new prompt takes effect
UPDATE public.tenants
SET config = config - 'ai_insight'
WHERE id = dst_tenant;

END $$;


-- === 20260605001_fix_record_event_who_id.sql ===
-- ========================================================
-- MIGRATION: 47_fix_record_event_who_id.sql
-- PURPOSE: Auto-capture who_id from the authenticated
--          session when p_who_id is NULL and who_type='user'
-- ========================================================

-- Rebuild record_event_v1 with auth.uid() fallback
CREATE OR REPLACE FUNCTION public.record_event_v1(
  p_action TEXT,
  p_who_type TEXT DEFAULT 'user',
  p_who_id UUID DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_source TEXT DEFAULT 'client',
  p_tenant_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
  v_inserted_id UUID;
BEGIN
  -- If server didn't explicitly pass tenant_id, derive from session
  IF p_tenant_id IS NULL THEN
    v_tenant_id := public.get_my_tenant();
  ELSE
    v_tenant_id := p_tenant_id;
  END IF;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'event_log: No tenant_id resolved';
  END IF;

  -- Auto-capture who_id from the authenticated session when
  -- the caller expects a user identity but didn't provide one.
  -- This fixes 12 call sites that forget to pass whoId.
  -- Service-role callers (createServiceClient) have no session,
  -- so auth.uid() returns NULL — they must pass whoId explicitly.
  IF p_who_id IS NULL AND p_who_type = 'user' THEN
    p_who_id := auth.uid();
  END IF;

  INSERT INTO public.event_log (
    tenant_id, action, who_id, who_type, entity_type, entity_id, description, metadata, source
  ) VALUES (
    v_tenant_id,
    p_action,
    p_who_id,
    p_who_type,
    p_entity_type,
    p_entity_id,
    p_description,
    COALESCE(p_metadata, '{}'::jsonb),
    p_source
  ) RETURNING id INTO v_inserted_id;

  RETURN v_inserted_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Revoke execute from anon to prevent unauthorized direct logging

-- Grant to authenticated (user sessions) and service_role (server-side)


-- === 20260605002_fix_tenant_members_updated_at.sql ===
ALTER TABLE public.tenant_members
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();


-- === 20260605003_fix_record_event_actor_name.sql ===
-- Resolve actor_name from auth.users into metadata at insert time.
-- This bypasses the app_users mismatch (app_users uses its own UUIDs,
-- not auth.uid()) so that resolveActorName has a name to display
-- for every user-type event, regardless of app_users having a row.

CREATE OR REPLACE FUNCTION public.record_event_v1(
  p_action TEXT,
  p_who_type TEXT DEFAULT 'user',
  p_who_id UUID DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_source TEXT DEFAULT 'client',
  p_tenant_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
  v_inserted_id UUID;
  v_actor_name TEXT;
BEGIN
  -- If server didn't explicitly pass tenant_id, derive from session
  IF p_tenant_id IS NULL THEN
    v_tenant_id := public.get_my_tenant();
  ELSE
    v_tenant_id := p_tenant_id;
  END IF;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'event_log: No tenant_id resolved';
  END IF;

  -- Auto-capture who_id from the authenticated session when
  -- the caller expects a user identity but didn't provide one.
  IF p_who_id IS NULL AND p_who_type = 'user' THEN
    p_who_id := auth.uid();
  END IF;

  -- Resolve actor_name from auth.users for user-type events.
  -- This ensures the name is embedded at insert time so
  -- resolveActorName can display it without joining to app_users
  -- (which uses different UUIDs than auth.users).
  IF p_who_id IS NOT NULL AND p_who_type = 'user' THEN
    SELECT COALESCE(
      raw_user_meta_data->>'full_name',
      email
    ) INTO v_actor_name FROM auth.users WHERE id = p_who_id;

    IF v_actor_name IS NOT NULL THEN
      p_metadata := COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object('actor_name', v_actor_name);
    END IF;
  END IF;

  INSERT INTO public.event_log (
    tenant_id, action, who_id, who_type, entity_type, entity_id, description, metadata, source
  ) VALUES (
    v_tenant_id,
    p_action,
    p_who_id,
    p_who_type,
    p_entity_type,
    p_entity_id,
    p_description,
    COALESCE(p_metadata, '{}'::jsonb),
    p_source
  ) RETURNING id INTO v_inserted_id;

  RETURN v_inserted_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

REVOKE EXECUTE ON FUNCTION public.record_event_v1 FROM anon;
GRANT EXECUTE ON FUNCTION public.record_event_v1 TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_event_v1 TO service_role;


-- === event_log table ===

-- event_log table (referenced by record_event_v1 but missing from migrations)
CREATE TABLE IF NOT EXISTS public.event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  description TEXT,
  actor_name TEXT,
  who_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimize event_log queries
CREATE INDEX IF NOT EXISTS idx_event_log_tenant ON public.event_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_event_log_created ON public.event_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_log_action ON public.event_log(tenant_id, action);
