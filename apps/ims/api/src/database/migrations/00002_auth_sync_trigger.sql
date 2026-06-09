-- ===================================================================
-- Synculariti OS IMS — Auth Sync
-- Migration: 00002_auth_sync_trigger.sql
-- ===================================================================
-- This migration sets up a trigger to automatically sync users from 
-- Supabase Auth (auth.users) to the public users table (public.users).
-- ===================================================================

BEGIN;

-- 1. Create the sync function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, active)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on auth.users
-- Note: This requires the migration to be run with sufficient privileges 
-- to access the 'auth' schema. In Supabase, this is usually the case 
-- when running via the SQL Editor or a privileged migration runner.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

COMMIT;
