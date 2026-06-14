DO $$
DECLARE
  fg_id UUID := 'a0000000-0000-0000-0000-000000000001';
  r_id UUID := 'b0000000-0000-0000-0000-000000000001';

  cat_ids UUID[] := '{}'::UUID[];
  item_ids UUID[] := '{}'::UUID[];
  vendor_ids UUID[] := '{}'::UUID[];
  cat_id UUID;
  item_id UUID;
  vendor_id UUID;
  po_id UUID;
  batch_id UUID;

  day_offset INT;
  d DATE;
  day_name TEXT;
  is_friday BOOLEAN;
  is_weekend BOOLEAN;
  intensity NUMERIC;
  daily_revenue INT;
  transaction_count INT;
  num_items INT;
  qty NUMERIC;

  rnd REAL;
  idx INT;
  i INT;
  j INT;
  cat_count INT := 0;
  item_count INT := 0;
  vendor_count INT := 0;
BEGIN
  -- ════════════════════════════════════════════════════════════════
  -- 1. Create Categories (20)
  -- ════════════════════════════════════════════════════════════════
  FOR i IN 1..20 LOOP
    cat_id := gen_random_uuid();
    cat_ids := array_append(cat_ids, cat_id);
    cat_count := cat_count + 1;
  END LOOP;
  
  INSERT INTO item_categories (id, tenant_id, name, description, sort_order, is_active) VALUES
    (cat_ids[1], fg_id, 'Produce - Vegetables', 'Produce - Vegetables', 1, true),
    (cat_ids[2], fg_id, 'Produce - Fruits', 'Produce - Fruits', 2, true),
    (cat_ids[3], fg_id, 'Meat - Chicken', 'Meat - Chicken', 3, true),
    (cat_ids[4], fg_id, 'Meat - Beef', 'Meat - Beef', 4, true),
    (cat_ids[5], fg_id, 'Seafood', 'Seafood', 5, true),
    (cat_ids[6], fg_id, 'Dairy', 'Dairy', 6, true),
    (cat_ids[7], fg_id, 'Dry Goods', 'Dry Goods', 7, true),
    (cat_ids[8], fg_id, 'Spices & Seasonings', 'Spices & Seasonings', 8, true),
    (cat_ids[9], fg_id, 'Oils & Vinegars', 'Oils & Vinegars', 9, true),
    (cat_ids[10], fg_id, 'Beverages', 'Beverages', 10, true),
    (cat_ids[11], fg_id, 'Bakery', 'Bakery', 11, true),
    (cat_ids[12], fg_id, 'Cleaning Supplies', 'Cleaning Supplies', 12, true),
    (cat_ids[13], fg_id, 'Packaging', 'Packaging', 13, true),
    (cat_ids[14], fg_id, 'Alcoholic Beverages', 'Alcoholic Beverages', 14, true),
    (cat_ids[15], fg_id, 'Frozen Foods', 'Frozen Foods', 15, true),
    (cat_ids[16], fg_id, 'Condiments & Sauces', 'Condiments & Sauces', 16, true),
    (cat_ids[17], fg_id, 'Paper Goods', 'Paper Goods', 17, true),
    (cat_ids[18], fg_id, 'Equipment', 'Equipment', 18, true),
    (cat_ids[19], fg_id, 'Smallwares', 'Smallwares', 19, true),
    (cat_ids[20], fg_id, 'Uniforms', 'Uniforms', 20, true);
  RAISE NOTICE 'Created % categories', cat_count;

  -- ════════════════════════════════════════════════════════════════
  -- 2. Create Items (100)
  -- ════════════════════════════════════════════════════════════════
  item_count := 100;
  FOR i IN 1..item_count LOOP
    item_ids := array_append(item_ids, gen_random_uuid());
  END LOOP;

  INSERT INTO items (id, tenant_id, category_id, name, sku, unit, unit_price, par_level, is_active) VALUES
    (item_ids[1],  fg_id, cat_ids[1], 'Romaine Lettuce', 'VEG-001', 'lb', 2.15, 25, true),
    (item_ids[2],  fg_id, cat_ids[1], 'Tomato', 'VEG-002', 'lb', 1.80, 30, true),
    (item_ids[3],  fg_id, cat_ids[1], 'Red Onion', 'VEG-003', 'lb', 1.20, 20, true),
    (item_ids[4],  fg_id, cat_ids[1], 'White Onion', 'VEG-004', 'lb', 0.95, 15, true),
    (item_ids[5],  fg_id, cat_ids[1], 'Avocado', 'VEG-005', 'ea', 1.50, 48, true),
    (item_ids[6],  fg_id, cat_ids[1], 'Jalapeño', 'VEG-006', 'lb', 2.50, 5, true),
    (item_ids[7],  fg_id, cat_ids[1], 'Cilantro', 'VEG-007', 'bunch', 0.80, 10, true),
    (item_ids[8],  fg_id, cat_ids[1], 'Bell Pepper', 'VEG-008', 'lb', 2.00, 15, true),
    (item_ids[9],  fg_id, cat_ids[1], 'Mushroom', 'VEG-009', 'lb', 3.00, 10, true),
    (item_ids[10], fg_id, cat_ids[1], 'Garlic', 'VEG-010', 'lb', 4.00, 8, true),
    (item_ids[11], fg_id, cat_ids[2], 'Lime', 'FRT-001', 'ea', 0.35, 60, true),
    (item_ids[12], fg_id, cat_ids[2], 'Lemon', 'FRT-002', 'ea', 0.40, 20, true),
    (item_ids[13], fg_id, cat_ids[2], 'Strawberry', 'FRT-003', 'lb', 3.00, 10, true),
    (item_ids[14], fg_id, cat_ids[2], 'Banana', 'FRT-004', 'lb', 0.60, 15, true),
    (item_ids[15], fg_id, cat_ids[2], 'Orange', 'FRT-005', 'ea', 0.50, 25, true),
    (item_ids[16], fg_id, cat_ids[3], 'Chicken Breast', 'CHK-001', 'lb', 3.50, 60, true),
    (item_ids[17], fg_id, cat_ids[3], 'Chicken Thigh', 'CHK-002', 'lb', 2.80, 40, true),
    (item_ids[18], fg_id, cat_ids[3], 'Chicken Wings', 'CHK-003', 'lb', 3.00, 50, true),
    (item_ids[19], fg_id, cat_ids[3], 'Whole Chicken', 'CHK-004', 'ea', 5.00, 10, true),
    (item_ids[20], fg_id, cat_ids[3], 'Ground Chicken', 'CHK-005', 'lb', 3.20, 15, true),
    (item_ids[21], fg_id, cat_ids[4], 'Ground Beef 80/20', 'BEEF-001', 'lb', 4.20, 40, true),
    (item_ids[22], fg_id, cat_ids[4], 'Beef Steak', 'BEEF-002', 'lb', 8.50, 20, true),
    (item_ids[23], fg_id, cat_ids[4], 'Bacon', 'BEEF-003', 'lb', 5.00, 15, true),
    (item_ids[24], fg_id, cat_ids[4], 'Ground Beef 90/10', 'BEEF-004', 'lb', 5.00, 20, true),
    (item_ids[25], fg_id, cat_ids[4], 'Beef Brisket', 'BEEF-005', 'lb', 6.50, 15, true),
    (item_ids[26], fg_id, cat_ids[5], 'Salmon Fillet', 'SFD-001', 'lb', 9.00, 15, true),
    (item_ids[27], fg_id, cat_ids[5], 'Shrimp 16/20', 'SFD-002', 'lb', 7.50, 20, true),
    (item_ids[28], fg_id, cat_ids[5], 'Tilapia Fillet', 'SFD-003', 'lb', 5.00, 15, true),
    (item_ids[29], fg_id, cat_ids[5], 'Tuna Steak', 'SFD-004', 'lb', 10.00, 8, true),
    (item_ids[30], fg_id, cat_ids[5], 'Cod Fillet', 'SFD-005', 'lb', 8.00, 10, true),
    (item_ids[31], fg_id, cat_ids[6], 'Whole Milk', 'DRY-001', 'gal', 3.80, 8, true),
    (item_ids[32], fg_id, cat_ids[6], 'Heavy Cream', 'DRY-002', 'qt', 4.50, 6, true),
    (item_ids[33], fg_id, cat_ids[6], 'Butter Unsalted', 'DRY-003', 'lb', 4.00, 10, true),
    (item_ids[34], fg_id, cat_ids[6], 'Cheddar Cheese', 'DRY-004', 'lb', 5.50, 12, true),
    (item_ids[35], fg_id, cat_ids[6], 'Mozzarella', 'DRY-005', 'lb', 4.80, 15, true),
    (item_ids[36], fg_id, cat_ids[6], 'Sour Cream', 'DRY-006', 'qt', 3.20, 8, true),
    (item_ids[37], fg_id, cat_ids[6], 'Eggs Large', 'DRY-007', 'dozen', 3.00, 15, true),
    (item_ids[38], fg_id, cat_ids[6], 'Greek Yogurt', 'DRY-008', 'lb', 4.50, 8, true),
    (item_ids[39], fg_id, cat_ids[7], 'All-Purpose Flour', 'GRY-001', 'lb', 0.80, 25, true),
    (item_ids[40], fg_id, cat_ids[7], 'Sugar Granulated', 'GRY-002', 'lb', 0.90, 20, true),
    (item_ids[41], fg_id, cat_ids[7], 'Rice White', 'GRY-003', 'lb', 1.20, 30, true),
    (item_ids[42], fg_id, cat_ids[7], 'Pasta Spaghetti', 'GRY-004', 'lb', 1.50, 15, true),
    (item_ids[43], fg_id, cat_ids[7], 'Tortilla Flour 10"', 'GRY-005', 'ea', 0.45, 200, true),
    (item_ids[44], fg_id, cat_ids[7], 'Tortilla Corn 6"', 'GRY-006', 'ea', 0.30, 150, true),
    (item_ids[45], fg_id, cat_ids[7], 'Canned Black Beans', 'GRY-007', '#10', 4.00, 12, true),
    (item_ids[46], fg_id, cat_ids[7], 'Canned Tomatoes', 'GRY-008', '#10', 3.50, 10, true),
    (item_ids[47], fg_id, cat_ids[8], 'Cumin Ground', 'SPC-001', 'lb', 6.00, 2, true),
    (item_ids[48], fg_id, cat_ids[8], 'Chili Powder', 'SPC-002', 'lb', 5.50, 3, true),
    (item_ids[49], fg_id, cat_ids[8], 'Garlic Powder', 'SPC-003', 'lb', 4.50, 2, true),
    (item_ids[50], fg_id, cat_ids[8], 'Salt Kosher', 'SPC-004', 'lb', 1.50, 5, true),
    (item_ids[51], fg_id, cat_ids[8], 'Black Pepper Ground', 'SPC-005', 'lb', 8.00, 1, true),
    (item_ids[52], fg_id, cat_ids[8], 'Paprika', 'SPC-006', 'lb', 7.00, 1, true),
    (item_ids[53], fg_id, cat_ids[8], 'Oregano Dried', 'SPC-007', 'lb', 9.00, 1, true),
    (item_ids[54], fg_id, cat_ids[9], 'Vegetable Oil', 'OIL-001', 'gal', 5.00, 4, true),
    (item_ids[55], fg_id, cat_ids[9], 'Olive Oil Extra Virgin', 'OIL-002', 'gal', 18.00, 2, true),
    (item_ids[56], fg_id, cat_ids[9], 'White Vinegar', 'OIL-003', 'gal', 3.50, 2, true),
    (item_ids[57], fg_id, cat_ids[10], 'Cola 2L', 'BEV-001', 'btl', 1.80, 48, true),
    (item_ids[58], fg_id, cat_ids[10], 'Lemonade', 'BEV-002', 'gal', 4.00, 4, true),
    (item_ids[59], fg_id, cat_ids[10], 'Iced Tea', 'BEV-003', 'gal', 3.50, 4, true),
    (item_ids[60], fg_id, cat_ids[10], 'Bottled Water', 'BEV-004', 'ea', 0.50, 72, true),
    (item_ids[61], fg_id, cat_ids[10], 'Orange Juice', 'BEV-005', 'gal', 5.00, 4, true),
    (item_ids[62], fg_id, cat_ids[11], 'Hamburger Buns', 'BAK-001', 'ea', 0.60, 100, true),
    (item_ids[63], fg_id, cat_ids[11], 'Taco Shells', 'BAK-002', 'ea', 0.40, 100, true),
    (item_ids[64], fg_id, cat_ids[11], 'Bread White Loaf', 'BAK-003', 'ea', 2.50, 10, true),
    (item_ids[65], fg_id, cat_ids[11], 'Flour Tortilla 8"', 'BAK-004', 'ea', 0.35, 200, true),
    (item_ids[66], fg_id, cat_ids[12], 'Dish Soap', 'CLN-001', 'gal', 8.00, 2, true),
    (item_ids[67], fg_id, cat_ids[12], 'Sanitizer', 'CLN-002', 'gal', 10.00, 2, true),
    (item_ids[68], fg_id, cat_ids[12], 'Bleach', 'CLN-003', 'gal', 5.00, 1, true),
    (item_ids[69], fg_id, cat_ids[12], 'All-Purpose Cleaner', 'CLN-004', 'gal', 7.00, 2, true),
    (item_ids[70], fg_id, cat_ids[13], 'Takeout Container 8"', 'PKG-001', 'ea', 0.25, 500, true),
    (item_ids[71], fg_id, cat_ids[13], 'Takeout Container 6"', 'PKG-002', 'ea', 0.20, 300, true),
    (item_ids[72], fg_id, cat_ids[13], 'Plastic Cutlery Set', 'PKG-003', 'ea', 0.10, 500, true),
    (item_ids[73], fg_id, cat_ids[14], 'Beer Domestic Case', 'ALC-001', 'case', 28.00, 10, true),
    (item_ids[74], fg_id, cat_ids[14], 'Beer Import Case', 'ALC-002', 'case', 38.00, 5, true),
    (item_ids[75], fg_id, cat_ids[14], 'Wine House Red', 'ALC-003', 'btl', 8.00, 12, true),
    (item_ids[76], fg_id, cat_ids[14], 'Wine House White', 'ALC-004', 'btl', 8.00, 12, true),
    (item_ids[77], fg_id, cat_ids[15], 'Frozen French Fries', 'FRZ-001', 'lb', 2.00, 30, true),
    (item_ids[78], fg_id, cat_ids[15], 'Frozen Chicken Nuggets', 'FRZ-002', 'lb', 3.50, 20, true),
    (item_ids[79], fg_id, cat_ids[15], 'Frozen Fish Fillet', 'FRZ-003', 'lb', 4.50, 10, true),
    (item_ids[80], fg_id, cat_ids[15], 'Frozen Vegetables Mix', 'FRZ-004', 'lb', 2.50, 10, true),
    (item_ids[81], fg_id, cat_ids[15], 'Frozen Pizza Dough', 'FRZ-005', 'ea', 3.00, 20, true),
    (item_ids[82], fg_id, cat_ids[15], 'Ice Cream Vanilla', 'FRZ-006', 'gal', 6.00, 4, true),
    (item_ids[83], fg_id, cat_ids[16], 'Soy Sauce', 'CND-001', 'gal', 6.00, 2, true),
    (item_ids[84], fg_id, cat_ids[16], 'Hot Sauce', 'CND-002', 'gal', 8.00, 1, true),
    (item_ids[85], fg_id, cat_ids[16], 'Ketchup', 'CND-003', 'gal', 5.00, 2, true),
    (item_ids[86], fg_id, cat_ids[16], 'Mayonnaise', 'CND-004', 'gal', 7.00, 2, true),
    (item_ids[87], fg_id, cat_ids[16], 'BBQ Sauce', 'CND-005', 'gal', 6.50, 1, true),
    (item_ids[88], fg_id, cat_ids[17], 'Paper Napkins', 'PPR-001', 'pk', 3.00, 10, true),
    (item_ids[89], fg_id, cat_ids[17], 'Paper Towels', 'PPR-002', 'roll', 2.00, 20, true),
    (item_ids[90], fg_id, cat_ids[17], 'Toilet Paper', 'PPR-003', 'roll', 1.50, 30, true),
    (item_ids[91], fg_id, cat_ids[17], 'Aluminum Foil', 'PPR-004', 'roll', 4.00, 5, true),
    (item_ids[92], fg_id, cat_ids[17], 'Plastic Wrap', 'PPR-005', 'roll', 3.50, 5, true),
    (item_ids[93], fg_id, cat_ids[18], 'Chef Knife 8"', 'EQP-001', 'ea', 45.00, 2, true),
    (item_ids[94], fg_id, cat_ids[18], 'Cutting Board', 'EQP-002', 'ea', 20.00, 4, true),
    (item_ids[95], fg_id, cat_ids[19], 'Mixing Bowl Set', 'SWR-001', 'set', 25.00, 3, true),
    (item_ids[96], fg_id, cat_ids[19], 'Measuring Cups', 'SWR-002', 'set', 12.00, 2, true),
    (item_ids[97], fg_id, cat_ids[19], 'Spatula', 'SWR-003', 'ea', 8.00, 5, true),
    (item_ids[98], fg_id, cat_ids[20], 'Apron', 'UNI-001', 'ea', 15.00, 10, true),
    (item_ids[99], fg_id, cat_ids[20], 'Chef Coat', 'UNI-002', 'ea', 30.00, 8, true),
    (item_ids[100], fg_id, cat_ids[20], 'Non-Slip Shoes', 'UNI-003', 'pair', 45.00, 4, true);
  RAISE NOTICE 'Created % items', item_count;

  -- ════════════════════════════════════════════════════════════════
  -- 3. Item Restaurant Overrides
  -- ════════════════════════════════════════════════════════════════
  FOR i IN 1..item_count LOOP
    INSERT INTO item_restaurant_overrides (id, item_id, restaurant_id, par_level, is_active)
    VALUES (gen_random_uuid(), item_ids[i], r_id, (SELECT par_level FROM items WHERE id = item_ids[i]), true);
  END LOOP;
  RAISE NOTICE 'Created restaurant overrides for % items', item_count;

  -- ════════════════════════════════════════════════════════════════
  -- 4. Create Vendors (8)
  -- ════════════════════════════════════════════════════════════════
  vendor_count := 8;
  FOR i IN 1..vendor_count LOOP
    vendor_ids := array_append(vendor_ids, gen_random_uuid());
  END LOOP;

  INSERT INTO vendors (id, franchise_group_id, restaurant_id, name, contact_email, tenant_id, is_active) VALUES
    (vendor_ids[1], fg_id, r_id, 'Sysco Food Service', 'orders@sysco.com', fg_id, true),
    (vendor_ids[2], fg_id, r_id, 'US Foods', 'orders@usfoods.com', fg_id, true),
    (vendor_ids[3], fg_id, r_id, 'Performance Food Group', 'orders@pfgc.com', fg_id, true),
    (vendor_ids[4], fg_id, r_id, 'Gordon Food Service', 'orders@gfs.com', fg_id, true),
    (vendor_ids[5], fg_id, r_id, 'FreshPoint Produce', 'orders@freshpoint.com', fg_id, true),
    (vendor_ids[6], fg_id, r_id, 'Cheney Brothers', 'orders@cheney.com', fg_id, true),
    (vendor_ids[7], fg_id, r_id, 'Martin Brower', 'orders@martinbrower.com', fg_id, true),
    (vendor_ids[8], fg_id, r_id, 'Bunzl Distribution', 'orders@bunzl.com', fg_id, true);
  RAISE NOTICE 'Created % vendors', vendor_count;

  -- ════════════════════════════════════════════════════════════════
  -- 5. Daily Data (90 days)
  -- ════════════════════════════════════════════════════════════════
  RAISE NOTICE 'Generating 90 days of operational data...';

  FOR day_offset IN 0..89 LOOP
    d := (CURRENT_DATE - INTERVAL '1 day' * (89 - day_offset))::DATE;
    day_name := to_char(d, 'DY');
    IF day_name = 'Sun' THEN CONTINUE; END IF;

    is_friday := (day_name = 'FRI');
    is_weekend := (day_name = 'SAT');
    intensity := CASE WHEN is_friday THEN 1.3 WHEN is_weekend THEN 1.15 ELSE 1.0 END;

    daily_revenue := floor(random() * 5001 + 3000)::INT;
    transaction_count := floor(random() * 121 + 80)::INT;
    INSERT INTO sales_import_batches (id, restaurant_id, business_date, status)
    VALUES (gen_random_uuid(), r_id, d, 'COMPLETED');

    -- Purchase Orders
    FOR i IN 1..vendor_count LOOP
      rnd := random();
      IF rnd > 0.25 THEN CONTINUE; END IF;
      po_id := gen_random_uuid();
      num_items := floor(random() * 11 + 5)::INT;
      INSERT INTO purchase_orders (id, restaurant_id, vendor_id, status, order_date, expected_delivery_date,
        freight_charge, tax_amount, discount_amount, tenant_id)
      VALUES (po_id, r_id, vendor_ids[i], 'DELIVERED', d, d,
        floor(random() * 31 + 10)::NUMERIC, floor(random() * 16 + 5)::NUMERIC, floor(random() * 16)::NUMERIC, fg_id);
      FOR j IN 1..num_items LOOP
        idx := floor(random() * item_count + 1)::INT;
        qty := floor(random() * 50 + 5)::NUMERIC * intensity;
        INSERT INTO po_line_items (id, po_id, item_id, quantity_ordered, quantity_received, raw_unit_price)
        VALUES (gen_random_uuid(), po_id, item_ids[idx], qty, qty,
          (SELECT unit_price FROM items WHERE id = item_ids[idx]) * (0.9 + random() * 0.2));
      END LOOP;
      IF random() > 0.2 THEN
        FOR j IN 1..num_items LOOP
          IF random() > 0.4 THEN CONTINUE; END IF;
          idx := floor(random() * item_count + 1)::INT;
          qty := floor(random() * 40 + 10)::NUMERIC;
          INSERT INTO inventory_batches (id, restaurant_id, item_id, po_id, received_date, initial_qty, remaining_qty, landed_unit_cost)
          VALUES (gen_random_uuid(), r_id, item_ids[idx], po_id, d, qty, floor(qty * (0.7 + random() * 0.3)),
            (SELECT unit_price FROM items WHERE id = item_ids[idx]) * (0.9 + random() * 0.2));
        END LOOP;
      END IF;
    END LOOP;

    -- Inventory ledger
    num_items := floor(random() * 21 + 10)::INT;
    FOR i IN 1..num_items LOOP
      idx := floor(random() * item_count + 1)::INT;
      qty := -(floor(random() * 20 + 1)::NUMERIC * intensity);
      INSERT INTO inventory_ledger (id, restaurant_id, item_id, change_amount, reason_code, quantity, cost)
      VALUES (gen_random_uuid(), r_id, item_ids[idx], qty,
        CASE floor(random() * 5)::INT WHEN 0 THEN 'SALE' WHEN 1 THEN 'WASTE' WHEN 2 THEN 'TRANSFER_OUT' WHEN 3 THEN 'PREP_USE' ELSE 'SPOILAGE' END,
        qty, abs(qty) * (SELECT unit_price FROM items WHERE id = item_ids[idx]));
    END LOOP;

    -- Weekly counts (Mondays)
    IF day_name = 'MON' AND random() > 0.2 THEN
      batch_id := gen_random_uuid();
      INSERT INTO inventory_count_batches (id, restaurant_id, status, snapshot_timestamp)
      VALUES (batch_id, r_id, 'CLOSED', (d || 'T04:00:00Z')::TIMESTAMPTZ);
      FOR i IN 1..item_count LOOP
        IF random() > 0.2 THEN CONTINUE; END IF;
        INSERT INTO inventory_count_rows (id, batch_id, item_id, expected_qty, actual_qty, variance_qty)
        VALUES (gen_random_uuid(), batch_id, item_ids[i],
          floor(random() * 96 + 5)::NUMERIC, floor(random() * 93 + 3)::NUMERIC, floor(random() * 11 - 5)::NUMERIC);
      END LOOP;
    END IF;

    -- Waste logs
    IF random() > 0.3 THEN
      num_items := floor(random() * 5 + 1)::INT;
      FOR i IN 1..num_items LOOP
        idx := floor(random() * item_count + 1)::INT;
        INSERT INTO waste_logs (id, restaurant_id, item_id, quantity, reason, recorded_at)
        VALUES (gen_random_uuid(), r_id, item_ids[idx],
          floor(random() * 46 + 5)::NUMERIC / 10,
          CASE floor(random() * 5)::INT WHEN 0 THEN 'SPOILED' WHEN 1 THEN 'OVERPRODUCTION' WHEN 2 THEN 'DAMAGED' WHEN 3 THEN 'EXPIRED' ELSE 'MISTAKE' END,
          (d || 'T' || floor(random() * 13 + 10)::TEXT || ':00:00Z')::TIMESTAMPTZ);
      END LOOP;
    END IF;

    -- Prep production
    num_items := floor(random() * 8 + 3)::INT;
    FOR i IN 1..num_items LOOP
      idx := floor(random() * item_count + 1)::INT;
      INSERT INTO prep_production_logs (id, restaurant_id, prep_item_id, yield_qty_produced, produced_at)
      VALUES (gen_random_uuid(), r_id, item_ids[idx],
        floor(random() * 191 + 10)::NUMERIC / 10,
        (d || 'T' || floor(random() * 7 + 5)::TEXT || ':00:00Z')::TIMESTAMPTZ);
    END LOOP;

    IF day_offset % 15 = 0 THEN
      RAISE NOTICE '  Day %/90 complete', day_offset + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Seed complete! Categories: 20, Items: %, Vendors: %, 90 days data generated.', item_count, vendor_count;
END $$;
