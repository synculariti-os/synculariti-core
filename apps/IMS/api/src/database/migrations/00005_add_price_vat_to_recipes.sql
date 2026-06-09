-- Add recipe pricing columns (already present on local DB, missing from Supabase)
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS price_eur numeric(10,2),
  ADD COLUMN IF NOT EXISTS vat_rate  numeric(5,2);
