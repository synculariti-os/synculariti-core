-- Ensure recipe_name is never null or empty
ALTER TABLE recipes ADD CONSTRAINT recipes_recipe_name_not_empty
CHECK (recipe_name IS NOT NULL AND recipe_name <> '');
