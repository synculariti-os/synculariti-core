-- Add config JSONB column back to franchise_groups (critical for WhatsApp, tenant settings, etc.)
ALTER TABLE public.franchise_groups ADD COLUMN IF NOT EXISTS config JSONB NOT NULL DEFAULT '{}'::jsonb;

-- The tenants view (SELECT * FROM franchise_groups) will automatically include config

-- Fix the RPC
DROP FUNCTION IF EXISTS public.update_tenant_config_v1(JSONB);
CREATE OR REPLACE FUNCTION public.update_tenant_config_v1(p_config JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.franchise_groups
  SET config = p_config
  WHERE id = COALESCE(
    (SELECT get_my_tenant()),
    (SELECT id FROM public.franchise_groups LIMIT 1)
  );
END;
$$;
