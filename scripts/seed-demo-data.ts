import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const FG_ID = '00000000-0000-0000-0000-000000000001';
const R_ID = '00000000-0000-0000-0000-000000000011';

const now = new Date();
const START = new Date(now.getFullYear() - 1, now.getMonth(), 1);

function rand(min: number, max: number) { return Math.round((Math.random() * (max - min) + min) * 100) / 100; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function r4() { return randomUUID().slice(0, 8); }

const CATEGORIES = [
  { name: 'Produce - Vegetables', group: 'PRODUCE' }, { name: 'Produce - Fruits', group: 'PRODUCE' },
  { name: 'Meat - Chicken', group: 'PROTEIN' }, { name: 'Meat - Beef', group: 'PROTEIN' },
  { name: 'Seafood', group: 'PROTEIN' }, { name: 'Dairy', group: 'DAIRY' },
  { name: 'Dry Goods', group: 'GROCERY' }, { name: 'Spices & Seasonings', group: 'GROCERY' },
  { name: 'Oils & Vinegars', group: 'GROCERY' }, { name: 'Beverages', group: 'BEVERAGE' },
  { name: 'Bakery', group: 'BAKERY' }, { name: 'Cleaning Supplies', group: 'SUPPLIES' },
  { name: 'Packaging', group: 'SUPPLIES' }, { name: 'Alcoholic Beverages', group: 'BEVERAGE' },
  { name: 'Frozen Foods', group: 'GROCERY' }, { name: 'Condiments & Sauces', group: 'GROCERY' },
  { name: 'Paper Goods', group: 'SUPPLIES' }, { name: 'Equipment', group: 'EQUIPMENT' },
  { name: 'Smallwares', group: 'EQUIPMENT' }, { name: 'Uniforms', group: 'SUPPLIES' },
];

const ITEMS: Array<{ name: string; cat: string; uom: string; price: number; par: number }> = [
  { name: 'Romaine Lettuce', cat: 'Produce - Vegetables', uom: 'lb', price: 2.15, par: 25 },
  { name: 'Tomato', cat: 'Produce - Vegetables', uom: 'lb', price: 1.80, par: 30 },
  { name: 'Red Onion', cat: 'Produce - Vegetables', uom: 'lb', price: 1.20, par: 20 },
  { name: 'White Onion', cat: 'Produce - Vegetables', uom: 'lb', price: 0.95, par: 15 },
  { name: 'Avocado', cat: 'Produce - Vegetables', uom: 'ea', price: 1.50, par: 48 },
  { name: 'Jalapeño', cat: 'Produce - Vegetables', uom: 'lb', price: 2.50, par: 5 },
  { name: 'Cilantro', cat: 'Produce - Vegetables', uom: 'bunch', price: 0.80, par: 10 },
  { name: 'Lime', cat: 'Produce - Fruits', uom: 'ea', price: 0.35, par: 60 },
  { name: 'Lemon', cat: 'Produce - Fruits', uom: 'ea', price: 0.40, par: 20 },
  { name: 'Strawberry', cat: 'Produce - Fruits', uom: 'lb', price: 3.00, par: 10 },
  { name: 'Chicken Breast', cat: 'Meat - Chicken', uom: 'lb', price: 3.50, par: 60 },
  { name: 'Chicken Thigh', cat: 'Meat - Chicken', uom: 'lb', price: 2.80, par: 40 },
  { name: 'Chicken Wings', cat: 'Meat - Chicken', uom: 'lb', price: 3.00, par: 50 },
  { name: 'Ground Beef 80/20', cat: 'Meat - Beef', uom: 'lb', price: 4.20, par: 40 },
  { name: 'Beef Steak', cat: 'Meat - Beef', uom: 'lb', price: 8.50, par: 20 },
  { name: 'Bacon', cat: 'Meat - Beef', uom: 'lb', price: 5.00, par: 15 },
  { name: 'Salmon Fillet', cat: 'Seafood', uom: 'lb', price: 9.00, par: 15 },
  { name: 'Shrimp 16/20', cat: 'Seafood', uom: 'lb', price: 7.50, par: 20 },
  { name: 'Whole Milk', cat: 'Dairy', uom: 'gal', price: 3.80, par: 8 },
  { name: 'Heavy Cream', cat: 'Dairy', uom: 'qt', price: 4.50, par: 6 },
  { name: 'Butter Unsalted', cat: 'Dairy', uom: 'lb', price: 4.00, par: 10 },
  { name: 'Cheddar Cheese', cat: 'Dairy', uom: 'lb', price: 5.50, par: 12 },
  { name: 'Mozzarella', cat: 'Dairy', uom: 'lb', price: 4.80, par: 15 },
  { name: 'Sour Cream', cat: 'Dairy', uom: 'qt', price: 3.20, par: 8 },
  { name: 'Eggs Large', cat: 'Dairy', uom: 'dozen', price: 3.00, par: 15 },
  { name: 'All-Purpose Flour', cat: 'Dry Goods', uom: 'lb', price: 0.80, par: 25 },
  { name: 'Sugar Granulated', cat: 'Dry Goods', uom: 'lb', price: 0.90, par: 20 },
  { name: 'Rice White', cat: 'Dry Goods', uom: 'lb', price: 1.20, par: 30 },
  { name: 'Pasta Spaghetti', cat: 'Dry Goods', uom: 'lb', price: 1.50, par: 15 },
  { name: 'Tortilla Flour 10"', cat: 'Dry Goods', uom: 'ea', price: 0.45, par: 200 },
  { name: 'Tortilla Corn 6"', cat: 'Dry Goods', uom: 'ea', price: 0.30, par: 150 },
  { name: 'Canned Black Beans', cat: 'Dry Goods', uom: '#10', price: 4.00, par: 12 },
  { name: 'Canned Tomatoes', cat: 'Dry Goods', uom: '#10', price: 3.50, par: 10 },
  { name: 'Cumin Ground', cat: 'Spices & Seasonings', uom: 'lb', price: 6.00, par: 2 },
  { name: 'Chili Powder', cat: 'Spices & Seasonings', uom: 'lb', price: 5.50, par: 3 },
  { name: 'Garlic Powder', cat: 'Spices & Seasonings', uom: 'lb', price: 4.50, par: 2 },
  { name: 'Salt Kosher', cat: 'Spices & Seasonings', uom: 'lb', price: 1.50, par: 5 },
  { name: 'Black Pepper Ground', cat: 'Spices & Seasonings', uom: 'lb', price: 8.00, par: 1 },
  { name: 'Paprika', cat: 'Spices & Seasonings', uom: 'lb', price: 7.00, par: 1 },
  { name: 'Oregano Dried', cat: 'Spices & Seasonings', uom: 'lb', price: 9.00, par: 1 },
  { name: 'Vegetable Oil', cat: 'Oils & Vinegars', uom: 'gal', price: 5.00, par: 4 },
  { name: 'Olive Oil Extra Virgin', cat: 'Oils & Vinegars', uom: 'gal', price: 18.00, par: 2 },
  { name: 'White Vinegar', cat: 'Oils & Vinegars', uom: 'gal', price: 3.50, par: 2 },
  { name: 'Soy Sauce', cat: 'Condiments & Sauces', uom: 'gal', price: 6.00, par: 2 },
  { name: 'Hot Sauce', cat: 'Condiments & Sauces', uom: 'gal', price: 8.00, par: 1 },
  { name: 'Ketchup', cat: 'Condiments & Sauces', uom: 'gal', price: 5.00, par: 2 },
  { name: 'Mayonnaise', cat: 'Condiments & Sauces', uom: 'gal', price: 7.00, par: 2 },
  { name: 'BBQ Sauce', cat: 'Condiments & Sauces', uom: 'gal', price: 6.50, par: 1 },
  { name: 'Cola 2L', cat: 'Beverages', uom: 'btl', price: 1.80, par: 48 },
  { name: 'Lemonade', cat: 'Beverages', uom: 'gal', price: 4.00, par: 4 },
  { name: 'Iced Tea', cat: 'Beverages', uom: 'gal', price: 3.50, par: 4 },
  { name: 'Bottled Water', cat: 'Beverages', uom: 'ea', price: 0.50, par: 72 },
  { name: 'Beer Domestic Case', cat: 'Alcoholic Beverages', uom: 'case', price: 28.00, par: 10 },
  { name: 'Beer Import Case', cat: 'Alcoholic Beverages', uom: 'case', price: 38.00, par: 5 },
  { name: 'Wine House Red', cat: 'Alcoholic Beverages', uom: 'btl', price: 8.00, par: 12 },
  { name: 'Wine House White', cat: 'Alcoholic Beverages', uom: 'btl', price: 8.00, par: 12 },
  { name: 'Frozen French Fries', cat: 'Frozen Foods', uom: 'lb', price: 2.00, par: 30 },
  { name: 'Frozen Chicken Nuggets', cat: 'Frozen Foods', uom: 'lb', price: 3.50, par: 20 },
  { name: 'Frozen Fish Fillet', cat: 'Frozen Foods', uom: 'lb', price: 4.50, par: 10 },
  { name: 'Frozen Vegetables Mix', cat: 'Frozen Foods', uom: 'lb', price: 2.50, par: 10 },
  { name: 'Frozen Pizza Dough', cat: 'Frozen Foods', uom: 'ea', price: 3.00, par: 20 },
  { name: 'Ice Cream Vanilla', cat: 'Frozen Foods', uom: 'gal', price: 6.00, par: 4 },
  { name: 'Hamburger Buns', cat: 'Bakery', uom: 'ea', price: 0.60, par: 100 },
  { name: 'Taco Shells', cat: 'Bakery', uom: 'ea', price: 0.40, par: 100 },
  { name: 'Bread White Loaf', cat: 'Bakery', uom: 'ea', price: 2.50, par: 10 },
  { name: 'Flour Tortilla 8"', cat: 'Bakery', uom: 'ea', price: 0.35, par: 200 },
  { name: 'Dish Soap', cat: 'Cleaning Supplies', uom: 'gal', price: 8.00, par: 2 },
  { name: 'Sanitizer', cat: 'Cleaning Supplies', uom: 'gal', price: 10.00, par: 2 },
  { name: 'Bleach', cat: 'Cleaning Supplies', uom: 'gal', price: 5.00, par: 1 },
  { name: 'All-Purpose Cleaner', cat: 'Cleaning Supplies', uom: 'gal', price: 7.00, par: 2 },
  { name: 'Takeout Container 8"', cat: 'Packaging', uom: 'ea', price: 0.25, par: 500 },
  { name: 'Takeout Container 6"', cat: 'Packaging', uom: 'ea', price: 0.20, par: 300 },
  { name: 'Plastic Cutlery Set', cat: 'Packaging', uom: 'ea', price: 0.10, par: 500 },
  { name: 'Paper Napkins', cat: 'Paper Goods', uom: 'pk', price: 3.00, par: 10 },
  { name: 'Paper Towels', cat: 'Paper Goods', uom: 'roll', price: 2.00, par: 20 },
  { name: 'Toilet Paper', cat: 'Paper Goods', uom: 'roll', price: 1.50, par: 30 },
  { name: 'Aluminum Foil', cat: 'Paper Goods', uom: 'roll', price: 4.00, par: 5 },
  { name: 'Plastic Wrap', cat: 'Paper Goods', uom: 'roll', price: 3.50, par: 5 },
  { name: 'Chef Knife 8"', cat: 'Equipment', uom: 'ea', price: 45.00, par: 2 },
  { name: 'Cutting Board', cat: 'Equipment', uom: 'ea', price: 20.00, par: 4 },
  { name: 'Mixing Bowl Set', cat: 'Smallwares', uom: 'set', price: 25.00, par: 3 },
  { name: 'Measuring Cups', cat: 'Smallwares', uom: 'set', price: 12.00, par: 2 },
  { name: 'Spatula', cat: 'Smallwares', uom: 'ea', price: 8.00, par: 5 },
  { name: 'Apron', cat: 'Uniforms', uom: 'ea', price: 15.00, par: 10 },
  { name: 'Chef Coat', cat: 'Uniforms', uom: 'ea', price: 30.00, par: 8 },
  { name: 'Non-Slip Shoes', cat: 'Uniforms', uom: 'pair', price: 45.00, par: 4 },
];

const VENDORS = [
  { name: 'Sysco Food Service', email: 'orders@sysco.com' },
  { name: 'US Foods', email: 'orders@usfoods.com' },
  { name: 'Performance Food Group', email: 'orders@pfgc.com' },
  { name: 'Gordon Food Service', email: 'orders@gfs.com' },
  { name: 'FreshPoint Produce', email: 'orders@freshpoint.com' },
  { name: 'Cheney Brothers', email: 'orders@cheney.com' },
  { name: 'Martin Brower', email: 'orders@martinbrower.com' },
  { name: 'Bunzl Distribution', email: 'orders@bunzl.com' },
];

const SUPPLIER_DAYS: Record<string, string[]> = {
  'Sysco Food Service': ['Mon', 'Thu'],
  'US Foods': ['Tue', 'Fri'],
  'Performance Food Group': ['Wed'],
  'Gordon Food Service': ['Mon', 'Wed', 'Fri'],
  'FreshPoint Produce': ['Mon', 'Wed', 'Fri', 'Sat'],
  'Cheney Brothers': ['Tue', 'Thu'],
  'Martin Brower': ['Mon', 'Thu'],
  'Bunzl Distribution': ['Fri'],
};

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function dayName(d: Date) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
}

function formatDate(d: Date) { return d.toISOString().slice(0, 10); }

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── 1. Create Categories ────────────────────────────────────────────────
  console.log('Creating categories...');
  const catIds: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const id = randomUUID();
    await supabase.from('categories').upsert({
      id, name: c.name, category_group: c.group,
      franchise_group_id: FG_ID, restaurant_id: null,
    });
    catIds[c.name] = id;
  }

  // ── 2. Create Items ─────────────────────────────────────────────────────
  console.log('Creating items...');
  const itemIds: string[] = [];
  for (const it of ITEMS) {
    const id = randomUUID();
    const sku = `${it.cat.replace(/[^A-Z]/g, '').toUpperCase().slice(0, 4)}-${String(itemIds.length + 1).padStart(3, '0')}`;
    await supabase.from('items').upsert({
      id,
      franchise_group_id: FG_ID,
      category_id: catIds[it.cat],
      name: it.name,
      sku,
      type: 'INVENTORY',
      purchasing_uom: it.uom,
      inventory_uom: it.uom,
      recipe_uom: it.uom,
      inv_to_recipe_ratio: 1,
      is_active: true,
    });
    itemIds.push(id);

    await supabase.from('item_restaurant_overrides').upsert({
      id: randomUUID(),
      item_id: id,
      restaurant_id: R_ID,
      par_level: it.par,
      is_active: true,
    });
  }

  // ── 3. Create Vendors ───────────────────────────────────────────────────
  console.log('Creating vendors...');
  const vendorIds: string[] = [];
  for (const v of VENDORS) {
    const id = randomUUID();
    await supabase.from('vendors').upsert({
      id,
      franchise_group_id: FG_ID,
      restaurant_id: R_ID,
      name: v.name,
      contact_email: v.email,
      is_active: true,
    });
    vendorIds.push(id);
  }

  // ── 4. Daily Data: 1 year ───────────────────────────────────────────────
  console.log('Generating daily data for 365 days...');
  let totalPOs = 0, totalBatches = 0, totalLedger = 0, totalCounts = 0, totalWaste = 0, totalPrep = 0;
  let dayCount = 0;

  for (let d = new Date(START); d <= now; d = addDays(d, 1)) {
    dayCount++;
    const day = dayName(d);
    if (day === 'Sun') continue; // Closed Sundays

    const dateStr = formatDate(d);
    const isWeekend = day === 'Sat';
    const isFriday = day === 'Fri';
    const intensity = isFriday ? 1.3 : isWeekend ? 1.15 : 1.0;

    if (dayCount % 30 === 0) console.log(`  Processing day ${dayCount}/365`);

    // ── POs for vendors that deliver today ────────────────────────────────
    for (const v of VENDORS) {
      const deliversOn = SUPPLIER_DAYS[v.name];
      if (!deliversOn?.includes(day)) continue;
      if (Math.random() > 0.15) continue; // Not every delivery day

      const poId = randomUUID();
      const lineItems = [];
      let totalQty = 0;
      const numItems = rand(5, 15);

      for (let i = 0; i < numItems; i++) {
        const itemIdx = Math.floor(Math.random() * itemIds.length);
        const item = ITEMS[itemIdx];
        if (!item) continue;
        const qty = Math.round(rand(item.par * 0.5, item.par * 1.2) * intensity);
        lineItems.push({
          id: randomUUID(),
          po_id: poId,
          item_id: itemIds[itemIdx],
          quantity_ordered: qty,
          raw_unit_price: item.price,
        });
        totalQty += qty;
      }

      if (lineItems.length < 3) continue;

      await supabase.from('purchase_orders').insert({
        id: poId,
        restaurant_id: R_ID,
        vendor_id: pick(vendorIds),
        status: 'DELIVERED',
        order_date: dateStr,
        expected_delivery_date: dateStr,
        freight_charge: rand(10, 40),
        tax_amount: rand(5, 20),
        discount_amount: rand(0, 15),
      });
      await supabase.from('po_line_items').insert(lineItems);
      totalPOs++;

      // ── Create inventory batches from received POs ──────────────────────
      if (Math.random() > 0.1) {
        for (const li of lineItems) {
          if (Math.random() > 0.3) continue;
          const batchId = randomUUID();
          const qty = Math.round(li.quantity_ordered * rand(0.85, 1.0));
          await supabase.from('inventory_batches').insert({
            id: batchId,
            restaurant_id: R_ID,
            item_id: li.item_id,
            po_id: poId,
            received_date: dateStr,
            initial_qty: qty,
            remaining_qty: qty,
            landed_unit_cost: li.raw_unit_price * rand(0.95, 1.05),
          });
          totalBatches++;
        }
      }
    }

    // ── Sales (daily usage) ───────────────────────────────────────────────
    const dailyRevenue = Math.round(rand(3000, 8000) * intensity);
    const salesBatchId = randomUUID();
    await supabase.from('sales_import_batches').insert({
      id: salesBatchId,
      restaurant_id: R_ID,
      status: 'COMPLETED',
      total_amount: dailyRevenue,
      transaction_count: Math.round(rand(80, 200) * intensity),
      import_date: dateStr,
    });

    // ── Ledger entries (simulate usage) ───────────────────────────────────
    const usageCount = Math.round(rand(10, 30) * intensity);
    for (let i = 0; i < usageCount; i++) {
      const itemIdx = Math.floor(Math.random() * itemIds.length);
      const item = ITEMS[itemIdx];
      if (!item) continue;
      const qty = -Math.round(rand(0.5, item.par * 0.3) * 10) / 10;
      await supabase.from('inventory_ledger').insert({
        id: randomUUID(),
        restaurant_id: R_ID,
        item_id: itemIds[itemIdx],
        change_amount: qty,
        reason_code: pick(['SALE', 'WASTE', 'TRANSFER_OUT', 'PREP_USE', 'SPOILAGE']),
        reference_id: salesBatchId,
        recorded_at: `${dateStr}T${String(rand(6, 22)).padStart(2, '0')}:${String(rand(0, 59)).padStart(2, '0')}:00Z`,
      });
      totalLedger++;
    }

    // ── Weekly inventory counts ───────────────────────────────────────────
    if (day === 'Mon' && Math.random() > 0.2) {
      const batchId = randomUUID();
      await supabase.from('inventory_count_batches').insert({
        id: batchId,
        restaurant_id: R_ID,
        status: 'CLOSED',
        snapshot_timestamp: `${dateStr}T04:00:00Z`,
      });

      for (const itemId of itemIds) {
        if (Math.random() > 0.15) continue;
        await supabase.from('inventory_count_rows').insert({
          id: randomUUID(),
          batch_id: batchId,
          item_id: itemId,
          expected_qty: rand(5, 100),
          actual_qty: rand(3, 95),
          variance_qty: rand(-5, 5),
        });
        totalCounts++;
      }
    }

    // ── Waste logs (daily) ────────────────────────────────────────────────
    if (Math.random() > 0.3) {
      const wasteCount = Math.round(rand(1, 5) * intensity);
      for (let i = 0; i < wasteCount; i++) {
        const itemIdx = Math.floor(Math.random() * itemIds.length);
        await supabase.from('waste_logs').insert({
          id: randomUUID(),
          restaurant_id: R_ID,
          item_id: itemIds[itemIdx],
          quantity: Math.round(rand(0.5, 5) * 10) / 10,
          reason: pick(['SPOILED', 'OVERPRODUCTION', 'DAMAGED', 'EXPIRED', 'MISTAKE']),
          recorded_at: `${dateStr}T${String(rand(10, 22)).padStart(2, '0')}:00:00Z`,
        });
        totalWaste++;
      }
    }

    // ── Prep production (daily) ───────────────────────────────────────────
    const prepCount = Math.round(rand(3, 10) * intensity);
    for (let i = 0; i < prepCount; i++) {
      const itemIdx = Math.floor(Math.random() * itemIds.length);
      await supabase.from('prep_production_logs').insert({
        id: randomUUID(),
        restaurant_id: R_ID,
        prep_item_id: itemIds[itemIdx],
        yield_qty_produced: Math.round(rand(1, 20) * 10) / 10,
        produced_at: `${dateStr}T${String(rand(5, 11)).padStart(2, '0')}:00:00Z`,
      });
      totalPrep++;
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log(`
Seed complete!
  Days processed: ${dayCount}
  Categories: ${Object.keys(catIds).length}
  Items: ${itemIds.length}
  Vendors: ${vendorIds.length}
  Purchase Orders: ${totalPOs}
  Inventory Batches: ${totalBatches}
  Ledger Entries: ${totalLedger}
  Count Rows: ${totalCounts}
  Waste Logs: ${totalWaste}
  Prep Logs: ${totalPrep}
`);
}

main().catch(console.error);
