import { INestApplication } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import type { Database } from '@synculariti/types';

const DB_CLIENT = 'DB_CLIENT';

export async function cleanDatabase(app: INestApplication): Promise<void> {
  const db = app.get<Kysely<Database>>(DB_CLIENT);

  // All E2E tests use 'E2E' prefix in name/sku/reason fields.
  // Delete in FK-safe order (children before parents).
  await db.transaction().execute(async (trx) => {
    // ── Children of items ──
    await sql`DELETE FROM inventory_ledger WHERE item_id IN (SELECT id FROM items WHERE name LIKE 'E2E%')`.execute(trx);
    await sql`DELETE FROM inventory_transfers WHERE item_id IN (SELECT id FROM items WHERE name LIKE 'E2E%')`.execute(trx);
    await sql`DELETE FROM waste_logs WHERE item_id IN (SELECT id FROM items WHERE name LIKE 'E2E%')`.execute(trx);
    await sql`DELETE FROM prep_production_logs WHERE prep_item_id IN (SELECT id FROM items WHERE name LIKE 'E2E%')`.execute(trx);
    await sql`DELETE FROM inventory_count_rows WHERE item_id IN (SELECT id FROM items WHERE name LIKE 'E2E%')`.execute(trx);
    await sql`DELETE FROM inventory_count_batches WHERE id IN (SELECT DISTINCT batch_id FROM inventory_count_rows WHERE item_id IN (SELECT id FROM items WHERE name LIKE 'E2E%'))`.execute(trx);
    await sql`DELETE FROM item_restaurant_overrides WHERE item_id IN (SELECT id FROM items WHERE name LIKE 'E2E%')`.execute(trx);
    await sql`DELETE FROM uom_conversions WHERE item_id IN (SELECT id FROM items WHERE name LIKE 'E2E%')`.execute(trx);

    // ── Children of recipes ──
    await sql`DELETE FROM recipe_ingredients WHERE recipe_id IN (SELECT id FROM recipes WHERE recipe_name LIKE 'E2E%' OR produces_item_id IN (SELECT id FROM items WHERE name LIKE 'E2E%'))`.execute(trx);
    await sql`DELETE FROM recipe_ingredients WHERE ingredient_item_id IN (SELECT id FROM items WHERE name LIKE 'E2E%')`.execute(trx);
    await sql`DELETE FROM recipe_ingredients WHERE sub_recipe_id IN (SELECT id FROM recipes WHERE recipe_name LIKE 'E2E%')`.execute(trx);
    await sql`DELETE FROM menu_item_mappings WHERE raw_excel_string LIKE 'E2E%'`.execute(trx);
    await sql`DELETE FROM menu_item_mappings WHERE recipe_id IN (SELECT id FROM recipes WHERE recipe_name LIKE 'E2E%' OR produces_item_id IN (SELECT id FROM items WHERE name LIKE 'E2E%'))`.execute(trx);
    await sql`DELETE FROM recipes WHERE recipe_name LIKE 'E2E%'`.execute(trx);
    await sql`DELETE FROM recipes WHERE produces_item_id IN (SELECT id FROM items WHERE name LIKE 'E2E%')`.execute(trx);

    // ── Children of vendors ──
    await sql`DELETE FROM po_line_items WHERE po_id IN (SELECT id FROM purchase_orders WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'E2E%'))`.execute(trx);
    await sql`DELETE FROM inventory_batches WHERE po_id IN (SELECT id FROM purchase_orders WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'E2E%'))`.execute(trx);
    await sql`DELETE FROM purchase_orders WHERE vendor_id IN (SELECT id FROM vendors WHERE name LIKE 'E2E%')`.execute(trx);

    // ── Items and categories ──
    await sql`DELETE FROM items WHERE name LIKE 'E2E%'`.execute(trx);
    await sql`DELETE FROM categories WHERE name LIKE 'E2E%'`.execute(trx);

    // ── Vendors ──
    await sql`DELETE FROM vendors WHERE name LIKE 'E2E%'`.execute(trx);

    // ── Children of roles ──
    await sql`DELETE FROM role_permissions WHERE role_id IN (SELECT id FROM roles WHERE name LIKE 'E2E%')`.execute(trx);
    await sql`DELETE FROM user_restaurant_roles WHERE role_id IN (SELECT id FROM roles WHERE name LIKE 'E2E%')`.execute(trx);
    await sql`DELETE FROM roles WHERE name LIKE 'E2E%'`.execute(trx);

    // ── Restaurants and franchise groups ──
    await sql`DELETE FROM restaurants WHERE name LIKE 'E2E%'`.execute(trx);
    await sql`DELETE FROM franchise_groups WHERE name LIKE 'E2E%'`.execute(trx);
  });
}
