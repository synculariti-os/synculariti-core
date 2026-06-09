DO $$
DECLARE
  -- Category lookups (resolved by name to work across environments)
  cat_buns            UUID;
  cat_beef            UUID;
  cat_bacon           UUID;
  cat_dressings       UUID;
  cat_mayo            UUID;
  cat_leafy_greens    UUID;
  cat_cheese          UUID;
  cat_pickled_items   UUID;
  cat_vegetables      UUID;
  cat_sriracha        UUID;
  cat_pork            UUID;
  cat_oil             UUID;
  cat_salt            UUID;
  cat_soft_drinks     UUID;
  cat_water           UUID;

  -- Tenant UUIDs
  fg_id CONSTANT UUID := 'a0000000-0000-0000-0000-000000000001';
  r_id  CONSTANT UUID := 'b0000000-0000-0000-0000-000000000001';

  -- Item variables
  v_bun UUID;
  v_patty UUID;
  v_bacon UUID;
  v_smash_sauce UUID;
  v_bacon_mayo UUID;
  v_lettuce UUID;
  v_irish_cheddar UUID;
  v_pickled_cucumber UUID;
  v_red_onion UUID;
  v_sriracha_mayo UUID;
  v_jalapeno UUID;
  v_caramelized_onion UUID;
  v_blue_cheese UUID;
  v_arugula UUID;
  v_pulled_pork UUID;
  v_coleslaw UUID;
  v_chipotle_mayo UUID;
  v_american_cheddar UUID;
  v_potatoes UUID;
  v_tallow UUID;
  v_salt UUID;
  v_cola UUID;
  v_cola_zero UUID;
  v_fanta UUID;
  v_sprite UUID;
  v_water_natura UUID;

  -- Recipe variables
  v_cheesy_smash UUID;
  v_cheesy_bacon_smash UUID;
  v_hott_shott_smash UUID;
  v_blue_heaven_smash UUID;
  v_smash_pulled_pork UUID;
  v_2x_cheesy_combo UUID;
  v_2x_cheesy_bacon_combo UUID;
  v_fries UUID;
  v_cola_recipe UUID;
  v_cola_zero_recipe UUID;
  v_fanta_recipe UUID;
  v_sprite_recipe UUID;
  v_water_natura_recipe UUID;
  v_sauce_smash_recipe UUID;

BEGIN

  -- Resolve category IDs by name (works across environments)
  SELECT id INTO STRICT cat_buns          FROM categories WHERE name = 'Buns';
  SELECT id INTO STRICT cat_beef          FROM categories WHERE name = 'Beef';
  SELECT id INTO STRICT cat_bacon         FROM categories WHERE name = 'Bacon';
  SELECT id INTO STRICT cat_dressings     FROM categories WHERE name = 'Dressings';
  SELECT id INTO STRICT cat_mayo          FROM categories WHERE name = 'Mayo';
  SELECT id INTO STRICT cat_leafy_greens  FROM categories WHERE name = 'Leafy Greens';
  SELECT id INTO STRICT cat_cheese        FROM categories WHERE name = 'Cheese';
  SELECT id INTO STRICT cat_pickled_items FROM categories WHERE name = 'Pickled Items';
  SELECT id INTO STRICT cat_vegetables    FROM categories WHERE name = 'Vegetables';
  SELECT id INTO STRICT cat_sriracha      FROM categories WHERE name = 'Sriracha';
  SELECT id INTO STRICT cat_pork          FROM categories WHERE name = 'Pork';
  SELECT id INTO STRICT cat_oil           FROM categories WHERE name = 'Oil';
  SELECT id INTO STRICT cat_salt          FROM categories WHERE name = 'Salt';
  SELECT id INTO STRICT cat_soft_drinks   FROM categories WHERE name = 'Soft Drinks';
  SELECT id INTO STRICT cat_water         FROM categories WHERE name = 'Water';

  -- ================================================================
  -- ITEMS (INGREDIENTS)
  -- ================================================================

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom)
  VALUES (fg_id, r_id, cat_buns, 'Potato Bun', 'BUN-001', 'INGREDIENTS', 'pcs', 'pcs')
  RETURNING id INTO v_bun;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom)
  VALUES (fg_id, r_id, cat_beef, 'Beef Patty 80g', 'BEEF-PTY-80', 'INGREDIENTS', 'pcs', 'pcs')
  RETURNING id INTO v_patty;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom)
  VALUES (fg_id, r_id, cat_bacon, 'American Bacon Slice', 'BACON-001', 'INGREDIENTS', 'pcs', 'pcs')
  RETURNING id INTO v_bacon;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_dressings, 'Smash Sauce', 'SAUCE-SMASH', 'INGREDIENTS', 'l', 'l', 'ml', 1000)
  RETURNING id INTO v_smash_sauce;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_mayo, 'Bacon Mayo', 'SAUCE-BMAYO', 'INGREDIENTS', 'l', 'l', 'ml', 1000)
  RETURNING id INTO v_bacon_mayo;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_leafy_greens, 'Iceberg Lettuce', 'LETT-ICE', 'INGREDIENTS', 'kg', 'kg', 'g', 1000)
  RETURNING id INTO v_lettuce;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_cheese, 'Irish Cheddar', 'CHED-IRISH', 'INGREDIENTS', 'kg', 'kg', 'g', 1000)
  RETURNING id INTO v_irish_cheddar;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom)
  VALUES (fg_id, r_id, cat_pickled_items, 'Pickled Cucumber', 'PICK-CUC', 'INGREDIENTS', 'pcs', 'pcs')
  RETURNING id INTO v_pickled_cucumber;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_vegetables, 'Red Onion', 'ONION-RED', 'INGREDIENTS', 'kg', 'kg', 'g', 1000)
  RETURNING id INTO v_red_onion;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_sriracha, 'Spicy Sriracha Mayo', 'SAUCE-SSRCH', 'INGREDIENTS', 'l', 'l', 'ml', 1000)
  RETURNING id INTO v_sriracha_mayo;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_pickled_items, 'Pickled Jalapeños', 'PICK-JALA', 'INGREDIENTS', 'kg', 'kg', 'g', 1000)
  RETURNING id INTO v_jalapeno;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_vegetables, 'Caramelized Onion', 'ONION-CARAM', 'INGREDIENTS', 'kg', 'kg', 'g', 1000)
  RETURNING id INTO v_caramelized_onion;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_cheese, 'Blue Cheese', 'CHEESE-BLUE', 'INGREDIENTS', 'kg', 'kg', 'g', 1000)
  RETURNING id INTO v_blue_cheese;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_leafy_greens, 'Arugula', 'ARUGULA', 'INGREDIENTS', 'kg', 'kg', 'g', 1000)
  RETURNING id INTO v_arugula;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_pork, 'Pulled Pork', 'PORK-PULLED', 'INGREDIENTS', 'kg', 'kg', 'g', 1000)
  RETURNING id INTO v_pulled_pork;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_dressings, 'Homemade Coleslaw', 'COLESLAW', 'INGREDIENTS', 'kg', 'kg', 'g', 1000)
  RETURNING id INTO v_coleslaw;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_mayo, 'Chipotle Mayo', 'SAUCE-CHPM', 'INGREDIENTS', 'l', 'l', 'ml', 1000)
  RETURNING id INTO v_chipotle_mayo;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_cheese, 'American Cheddar', 'CHED-AMER', 'INGREDIENTS', 'kg', 'kg', 'g', 1000)
  RETURNING id INTO v_american_cheddar;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_vegetables, 'Fresh Potatoes', 'POTATO-FRSH', 'INGREDIENTS', 'kg', 'kg', 'g', 1000)
  RETURNING id INTO v_potatoes;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_oil, 'Beef Tallow', 'TALLOW-BEEF', 'INGREDIENTS', 'l', 'l', 'ml', 1000)
  RETURNING id INTO v_tallow;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio)
  VALUES (fg_id, r_id, cat_salt, 'Salt', 'SALT-001', 'INGREDIENTS', 'kg', 'kg', 'g', 1000)
  RETURNING id INTO v_salt;

  -- ================================================================
  -- ITEMS (MERCHANDISE — drinks sold as-is)
  -- ================================================================

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom)
  VALUES (fg_id, r_id, cat_soft_drinks, 'Coca Cola 0.5L PET', 'DRINK-COLA-05', 'MERCHANDISE', 'pcs', 'pcs')
  RETURNING id INTO v_cola;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom)
  VALUES (fg_id, r_id, cat_soft_drinks, 'Coca Cola ZERO 0.5L PET', 'DRINK-COLZ-05', 'MERCHANDISE', 'pcs', 'pcs')
  RETURNING id INTO v_cola_zero;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom)
  VALUES (fg_id, r_id, cat_soft_drinks, 'FANTA ORANGE 0.5L PET', 'DRINK-FANT-05', 'MERCHANDISE', 'pcs', 'pcs')
  RETURNING id INTO v_fanta;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom)
  VALUES (fg_id, r_id, cat_soft_drinks, 'SPRITE 0.5L PET', 'DRINK-SPRT-05', 'MERCHANDISE', 'pcs', 'pcs')
  RETURNING id INTO v_sprite;

  INSERT INTO items (franchise_group_id, restaurant_id, category_id, name, sku, type, purchasing_uom, inventory_uom)
  VALUES (fg_id, r_id, cat_water, 'Natura Still Water 0.5L PET', 'WATER-NAT-05', 'MERCHANDISE', 'pcs', 'pcs')
  RETURNING id INTO v_water_natura;

  -- ================================================================
  -- RECIPES (Virtual — no produces_item_id)
  -- ================================================================

  -- CHEESY SMASH
  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, 'CHEESY SMASH', 1, 4.99, 10)
  RETURNING id INTO v_cheesy_smash;

  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES
    (v_cheesy_smash, v_bun, 1),
    (v_cheesy_smash, v_patty, 1),
    (v_cheesy_smash, v_smash_sauce, 30),
    (v_cheesy_smash, v_lettuce, 10),
    (v_cheesy_smash, v_irish_cheddar, 20),
    (v_cheesy_smash, v_pickled_cucumber, 2);

  -- CHEESY BACON SMASH
  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, 'CHEESY BACON SMASH', 1, 5.99, 10)
  RETURNING id INTO v_cheesy_bacon_smash;

  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES
    (v_cheesy_bacon_smash, v_bun, 1),
    (v_cheesy_bacon_smash, v_patty, 1),
    (v_cheesy_bacon_smash, v_bacon, 2),
    (v_cheesy_bacon_smash, v_bacon_mayo, 30),
    (v_cheesy_bacon_smash, v_lettuce, 10),
    (v_cheesy_bacon_smash, v_irish_cheddar, 20),
    (v_cheesy_bacon_smash, v_red_onion, 10);

  -- HOTT-SHOTT SMASH
  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, 'HOTT-SHOTT SMASH', 1, 5.99, 10)
  RETURNING id INTO v_hott_shott_smash;

  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES
    (v_hott_shott_smash, v_bun, 1),
    (v_hott_shott_smash, v_patty, 1),
    (v_hott_shott_smash, v_bacon, 2),
    (v_hott_shott_smash, v_sriracha_mayo, 30),
    (v_hott_shott_smash, v_lettuce, 10),
    (v_hott_shott_smash, v_irish_cheddar, 40),
    (v_hott_shott_smash, v_jalapeno, 15),
    (v_hott_shott_smash, v_pickled_cucumber, 2);

  -- BLUE HEAVEN SMASH
  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, 'BLUE HEAVEN SMASH', 1, 6.99, 10)
  RETURNING id INTO v_blue_heaven_smash;

  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES
    (v_blue_heaven_smash, v_bun, 1),
    (v_blue_heaven_smash, v_patty, 1),
    (v_blue_heaven_smash, v_bacon, 2),
    (v_blue_heaven_smash, v_caramelized_onion, 30),
    (v_blue_heaven_smash, v_smash_sauce, 30),
    (v_blue_heaven_smash, v_blue_cheese, 30),
    (v_blue_heaven_smash, v_arugula, 10);

  -- SMASH PULLED PORK
  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, 'SMASH PULLED PORK', 1, 7.99, 10)
  RETURNING id INTO v_smash_pulled_pork;

  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES
    (v_smash_pulled_pork, v_bun, 1),
    (v_smash_pulled_pork, v_pulled_pork, 120),
    (v_smash_pulled_pork, v_coleslaw, 50),
    (v_smash_pulled_pork, v_chipotle_mayo, 30),
    (v_smash_pulled_pork, v_american_cheddar, 30);

  -- 2x CHEESY SMASH COMBO (summed ingredients x2 + fries + extra sauce)
  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, '2 x CHEESY SMASH COMBO', 1, 12.99, 10)
  RETURNING id INTO v_2x_cheesy_combo;

  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES
    (v_2x_cheesy_combo, v_bun, 2),
    (v_2x_cheesy_combo, v_patty, 2),
    (v_2x_cheesy_combo, v_smash_sauce, 60),
    (v_2x_cheesy_combo, v_lettuce, 20),
    (v_2x_cheesy_combo, v_irish_cheddar, 40),
    (v_2x_cheesy_combo, v_pickled_cucumber, 4),
    (v_2x_cheesy_combo, v_potatoes, 200),
    (v_2x_cheesy_combo, v_tallow, 20),
    (v_2x_cheesy_combo, v_salt, 2),
    (v_2x_cheesy_combo, v_smash_sauce, 50);

  -- 2x CHEESY BACON SMASH COMBO (summed ingredients x2 + fries)
  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, '2 x CHEESY BACON SMASH COMBO', 1, 13.99, 10)
  RETURNING id INTO v_2x_cheesy_bacon_combo;

  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES
    (v_2x_cheesy_bacon_combo, v_bun, 2),
    (v_2x_cheesy_bacon_combo, v_patty, 2),
    (v_2x_cheesy_bacon_combo, v_bacon, 4),
    (v_2x_cheesy_bacon_combo, v_bacon_mayo, 60),
    (v_2x_cheesy_bacon_combo, v_lettuce, 20),
    (v_2x_cheesy_bacon_combo, v_irish_cheddar, 40),
    (v_2x_cheesy_bacon_combo, v_red_onion, 20),
    (v_2x_cheesy_bacon_combo, v_potatoes, 200),
    (v_2x_cheesy_bacon_combo, v_tallow, 20),
    (v_2x_cheesy_bacon_combo, v_salt, 2);

  -- HOMEMADE FRIES
  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, 'HOMEMADE FRIES', 1, 3.00, 10)
  RETURNING id INTO v_fries;

  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES
    (v_fries, v_potatoes, 200),
    (v_fries, v_tallow, 20),
    (v_fries, v_salt, 2);

  -- Drinks (self-consumption: each sold unit depletes one inventory unit)
  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, 'Coca Cola 0.5L PET', 1, 3.00, 23)
  RETURNING id INTO v_cola_recipe;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES (v_cola_recipe, v_cola, 1);

  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, 'Coca Cola ZERO 0.5L PET', 1, 3.00, 23)
  RETURNING id INTO v_cola_zero_recipe;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES (v_cola_zero_recipe, v_cola_zero, 1);

  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, 'FANTA ORANGE 0.5L PET', 1, 3.00, 23)
  RETURNING id INTO v_fanta_recipe;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES (v_fanta_recipe, v_fanta, 1);

  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, 'SPRITE 0.5L PET', 1, 3.00, 23)
  RETURNING id INTO v_sprite_recipe;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES (v_sprite_recipe, v_sprite, 1);

  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, 'Natura Still Water 0.5L PET', 1, 2.50, 10)
  RETURNING id INTO v_water_natura_recipe;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES (v_water_natura_recipe, v_water_natura, 1);

  -- Signature Smash Sauce (sold as side condiment)
  INSERT INTO recipes (franchise_group_id, restaurant_id, recipe_name, yield_quantity, price_eur, vat_rate)
  VALUES (fg_id, r_id, 'Signature Smash Sauce', 1, 1.50, 23)
  RETURNING id INTO v_sauce_smash_recipe;
  INSERT INTO recipe_ingredients (recipe_id, ingredient_item_id, quantity_required) VALUES (v_sauce_smash_recipe, v_smash_sauce, 50);

  -- ================================================================
  -- MENU ITEM MAPPINGS
  -- ================================================================

  INSERT INTO menu_item_mappings (restaurant_id, raw_excel_string, recipe_id) VALUES
    (r_id, 'CHEESY SMASH', v_cheesy_smash),
    (r_id, 'CHEESY BACON SMASH', v_cheesy_bacon_smash),
    (r_id, 'HOTT-SHOTT SMASH', v_hott_shott_smash),
    (r_id, 'BLUE HEAVEN SMASH', v_blue_heaven_smash),
    (r_id, 'SMASH PULLED PORK', v_smash_pulled_pork),
    (r_id, '2 x CHEESY SMASH COMBO', v_2x_cheesy_combo),
    (r_id, '2 x CHEESY BACON SMASH COMBO', v_2x_cheesy_bacon_combo),
    (r_id, 'Homemade fries', v_fries),
    (r_id, 'Coca Cola 0.5L PET', v_cola_recipe),
    (r_id, 'Coca Cola ZERO 0.5L PET', v_cola_zero_recipe),
    (r_id, 'FANTA ORANGE 0.5L PET', v_fanta_recipe),
    (r_id, 'SPRITE 0.5L PET', v_sprite_recipe),
    (r_id, 'Natura Still water 0.5L PET', v_water_natura_recipe),
    (r_id, 'Signature Smash', v_sauce_smash_recipe);

END $$;
