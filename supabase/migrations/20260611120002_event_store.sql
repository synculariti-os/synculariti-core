-- ===================================================================
-- Migration: Event Store Foundation
-- Domain events for CQRS readiness, audit, and projection rebuilds
-- ===================================================================

-- Event store: append-only, immutable, versioned per aggregate
CREATE TABLE IF NOT EXISTS public.domain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id UUID NOT NULL,
  aggregate_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent duplicate events per aggregate (idempotent replay)
CREATE UNIQUE INDEX IF NOT EXISTS idx_domain_events_aggregate_version
  ON public.domain_events (aggregate_id, aggregate_type, version);

-- Correlation chaining (traceability across aggregates)
CREATE INDEX IF NOT EXISTS idx_domain_events_correlation
  ON public.domain_events ((metadata->>'correlation_id'))
  WHERE metadata ? 'correlation_id';

-- Causation chaining (parent event)
CREATE INDEX IF NOT EXISTS idx_domain_events_causation
  ON public.domain_events ((metadata->>'causation_id'))
  WHERE metadata ? 'causation_id';

-- Event type queries for projection rebuilds
CREATE INDEX IF NOT EXISTS idx_domain_events_type_time
  ON public.domain_events (event_type, created_at);

-- Tenant-scoped queries
CREATE INDEX IF NOT EXISTS idx_domain_events_tenant
  ON public.domain_events ((metadata->>'tenant_id'))
  WHERE metadata ? 'tenant_id';

-- Append-only enforcement: prevent UPDATE/DELETE on domain_events
CREATE OR REPLACE FUNCTION public.prevent_event_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'domain_events is append-only: UPDATE/DELETE not allowed (event: %)',
    COALESCE(OLD.event_type, 'unknown');
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_domain_events_prevent_update ON public.domain_events;
CREATE TRIGGER trg_domain_events_prevent_update
  BEFORE UPDATE ON public.domain_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_event_mutation();

DROP TRIGGER IF EXISTS trg_domain_events_prevent_delete ON public.domain_events;
CREATE TRIGGER trg_domain_events_prevent_delete
  BEFORE DELETE ON public.domain_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_event_mutation();

-- Helper function: append a domain event with auto-versioning
CREATE OR REPLACE FUNCTION public.append_domain_event(
  p_aggregate_id UUID,
  p_aggregate_type TEXT,
  p_event_type TEXT,
  p_payload JSONB,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_next_version INT;
  v_event_id UUID;
BEGIN
  -- Get next version for this aggregate
  SELECT COALESCE(MAX(version), 0) + 1
  INTO v_next_version
  FROM public.domain_events
  WHERE aggregate_id = p_aggregate_id
    AND aggregate_type = p_aggregate_type;

  INSERT INTO public.domain_events (aggregate_id, aggregate_type, event_type, payload, metadata, version)
  VALUES (p_aggregate_id, p_aggregate_type, p_event_type, p_payload, p_metadata, v_next_version)
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- Helper function: replay all events for an aggregate
CREATE OR REPLACE FUNCTION public.get_aggregate_events(
  p_aggregate_id UUID,
  p_aggregate_type TEXT DEFAULT NULL
)
RETURNS SETOF public.domain_events
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.domain_events
  WHERE aggregate_id = p_aggregate_id
    AND (p_aggregate_type IS NULL OR aggregate_type = p_aggregate_type)
  ORDER BY version ASC;
$$;

-- Helper function: replay events by type within a time range
CREATE OR REPLACE FUNCTION public.get_events_by_type(
  p_event_type TEXT,
  p_from TIMESTAMPTZ DEFAULT '-infinity'::TIMESTAMPTZ,
  p_to TIMESTAMPTZ DEFAULT 'infinity'::TIMESTAMPTZ
)
RETURNS SETOF public.domain_events
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.domain_events
  WHERE event_type = p_event_type
    AND created_at >= p_from
    AND created_at <= p_to
  ORDER BY created_at ASC;
$$;

-- Grant access
GRANT ALL ON TABLE public.domain_events TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT SELECT, INSERT ON public.domain_events TO authenticated;

COMMENT ON TABLE public.domain_events IS 'Append-only event store for domain events. Foundation for CQRS, audit, projections, and temporal queries.';
COMMENT ON FUNCTION public.append_domain_event IS 'Append a domain event with auto-versioning per aggregate. Returns event ID.';
COMMENT ON FUNCTION public.get_aggregate_events IS 'Replay all events for an aggregate in order.';
COMMENT ON FUNCTION public.get_events_by_type IS 'Replay events by type within an optional time range.';
COMMENT ON FUNCTION public.prevent_event_mutation IS 'Trigger function enforcing append-only semantics.';
