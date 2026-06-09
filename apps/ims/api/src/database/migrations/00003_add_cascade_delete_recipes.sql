-- ===================================================================
-- Synculariti OS IMS — Add ON DELETE CASCADE to Recipe Foreign Keys
-- Migration: 00003_add_cascade_delete_recipes.sql
-- ===================================================================
-- Adds ON DELETE CASCADE to recipe_ingredients.recipe_id and
-- menu_item_mappings.recipe_id so that deleting a recipe
-- automatically cleans up dependent rows.
-- ===================================================================

BEGIN;

ALTER TABLE recipe_ingredients
  DROP CONSTRAINT recipe_ingredients_recipe_id_fkey,
  ADD CONSTRAINT recipe_ingredients_recipe_id_fkey
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE;

ALTER TABLE menu_item_mappings
  DROP CONSTRAINT menu_item_mappings_recipe_id_fkey,
  ADD CONSTRAINT menu_item_mappings_recipe_id_fkey
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE;

COMMIT;
