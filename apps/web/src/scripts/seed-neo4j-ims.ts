// @ts-nocheck
import './load-env';
import { createServiceClient } from '../lib/supabase-server';
import { getNeo4jDriver, closeNeo4jDriver } from '../lib/neo4j';

const FG_ID = 'a0000000-0000-0000-0000-000000000001';
const R_ID = 'b0000000-0000-0000-0000-000000000001';

async function seed() {
  const supabase = createServiceClient();
  const driver = getNeo4jDriver();
  if (!driver) throw new Error('Neo4j driver unavailable');
  const session = driver.session();

  console.log('Clearing existing IMS graph data...');
  await session.executeWrite(async (tx) => {
    await tx.run('MATCH (n) WHERE n.source = $src DETACH DELETE n', { src: 'ims' });
  });

  // ── Categories ──
  console.log('Fetching categories...');
  const { data: cats } = await supabase
    .from('item_categories')
    .select('id, name, description, sort_order')
    .eq('tenant_id', FG_ID)
    .eq('is_active', true)
    .order('sort_order');
  if (!cats || cats.length === 0) throw new Error('No categories found');

  console.log(`  ${cats.length} categories`);
  for (const c of cats) {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MERGE (cat:Category {category_id: $id})
         SET cat.name = $name,
             cat.description = $desc,
             cat.sort_order = $sort,
             cat.tenant_id = $tenant,
             cat.source = 'ims'`,
        { id: c.id, name: c.name, desc: c.description || '', sort: c.sort_order, tenant: FG_ID },
      );
    });
  }

  // ── Items with Category relation ──
  console.log('Fetching items...');
  const { data: items } = await supabase
    .from('items')
    .select('id, name, sku, unit, unit_price, par_level, category_id')
    .eq('tenant_id', FG_ID)
    .eq('is_active', true);
  if (!items) throw new Error('No items found');

  console.log(`  ${items.length} items`);
  for (const item of items) {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MERGE (it:Item {item_id: $id})
         SET it.name = $name,
             it.sku = $sku,
             it.unit = $unit,
             it.unit_price = $price,
             it.par_level = $par,
             it.tenant_id = $tenant,
             it.source = 'ims'`,
        { id: item.id, name: item.name, sku: item.sku, unit: item.unit, price: item.unit_price, par: item.par_level, tenant: FG_ID },
      );
      if (item.category_id) {
        await tx.run(
          `MATCH (it:Item {item_id: $itemId})
           MATCH (cat:Category {category_id: $catId})
           MERGE (it)-[:BELONGS_TO]->(cat)`,
          { itemId: item.id, catId: item.category_id },
        );
      }
    });
  }

  // ── Vendors ──
  console.log('Fetching vendors...');
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, name, contact_email')
    .eq('tenant_id', FG_ID)
    .eq('is_active', true);
  if (!vendors) throw new Error('No vendors found');

  console.log(`  ${vendors.length} vendors`);
  for (const v of vendors) {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MERGE (vendor:Vendor {vendor_id: $id})
         SET vendor.name = $name,
             vendor.email = $email,
             vendor.tenant_id = $tenant,
             vendor.source = 'ims'`,
        { id: v.id, name: v.name, email: v.contact_email || '', tenant: FG_ID },
      );
    });
  }

  // ── Vendor-Item supply relations from PO line items ──
  console.log('Building vendor-item supply relations...');
  const { data: poItems } = await supabase
    .from('po_line_items')
    .select('item_id, po_id')
    .limit(5000);
  const { data: pos } = await supabase
    .from('purchase_orders')
    .select('id, vendor_id')
    .eq('tenant_id', FG_ID)
    .limit(500);

  if (pos && poItems) {
    const vendorItemMap = new Map<string, Set<string>>();
    const poVendor = new Map(pos.map((p: any) => [p.id, p.vendor_id]));
    for (const li of poItems as any[]) {
      const vid = poVendor.get(li.po_id);
      if (vid) {
        if (!vendorItemMap.has(vid)) vendorItemMap.set(vid, new Set());
        vendorItemMap.get(vid)!.add(li.item_id);
      }
    }
    let relCount = 0;
    for (const [vid, itemIds] of vendorItemMap) {
      for (const iid of itemIds) {
        await session.executeWrite(async (tx) => {
          await tx.run(
            `MATCH (v:Vendor {vendor_id: $vid})
             MATCH (it:Item {item_id: $iid})
             MERGE (v)-[:SUPPLIES]->(it)`,
            { vid, iid },
          );
        });
        relCount++;
      }
    }
    console.log(`  ${relCount} SUPPLIES relations`);
  }

  // ── Restaurant + inventory ──
  console.log('Setting up restaurant node...');
  await session.executeWrite(async (tx) => {
    await tx.run(
      `MERGE (r:Restaurant {restaurant_id: $id})
       SET r.name = $name, r.source = 'ims'`,
      { id: R_ID, name: 'Main Restaurant' },
    );
  });

  // Link restaurant to all items
  for (const item of items!) {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MATCH (r:Restaurant {restaurant_id: $rid})
         MATCH (it:Item {item_id: $iid})
         MERGE (r)-[:HAS_INVENTORY]->(it)`,
        { rid: R_ID, iid: item.id },
      );
    });
  }
  console.log(`  ${items!.length} HAS_INVENTORY relations`);

  // ── Purchase Orders as nodes ──
  console.log('Creating Purchase Order nodes...');
  const { data: poData } = await supabase
    .from('purchase_orders')
    .select('id, status, order_date, freight_charge, tax_amount')
    .eq('tenant_id', FG_ID)
    .eq('restaurant_id', R_ID)
    .limit(200);

  if (poData) {
    for (const po of poData as any[]) {
      await session.executeWrite(async (tx) => {
        await tx.run(
          `MERGE (po:PurchaseOrder {po_id: $id})
           SET po.status = $status,
               po.order_date = $date,
               po.freight = $freight,
               po.tax = $tax,
               po.tenant_id = $tenant,
               po.source = 'ims'`,
          { id: po.id, status: po.status, date: po.order_date, freight: po.freight_charge || 0, tax: po.tax_amount || 0, tenant: FG_ID },
        );
        await tx.run(
          `MATCH (po:PurchaseOrder {po_id: $id})
           MATCH (r:Restaurant {restaurant_id: $rid})
           MERGE (r)-[:PLACED]->(po)`,
          { id: po.id, rid: R_ID },
        );
      });
    }
    console.log(`  ${poData.length} PurchaseOrder nodes`);
  }

  // ── PO line items linking POs to Items ──
  console.log('Linking POs to Items...');
  const poLiMap = new Map<string, Array<{ item_id: string; qty: number; price: number }>>();
  for (const li of poItems || []) {
    const pli = li as any;
    if (!poLiMap.has(pli.po_id)) poLiMap.set(pli.po_id, []);
    poLiMap.get(pli.po_id)!.push({ item_id: pli.item_id, qty: pli.quantity_ordered || 0, price: pli.raw_unit_price || 0 });
  }
  let orderRelCount = 0;
  for (const [poId, lineItems] of poLiMap) {
    for (const li of lineItems) {
      await session.executeWrite(async (tx) => {
        await tx.run(
          `MATCH (po:PurchaseOrder {po_id: $poId})
           MATCH (it:Item {item_id: $itemId})
           MERGE (po)-[:ORDERS {qty: $qty, unit_price: $price}]->(it)`,
          { poId, itemId: li.item_id, qty: li.qty, price: li.price },
        );
      });
      orderRelCount++;
    }
  }
  console.log(`  ${orderRelCount} ORDERS relations`);

  // ── Verification ──
  console.log('\n=== VERIFICATION ===');
  const counts = await session.executeRead(async (tx) => {
    const result = await tx.run(
      `MATCH (n) WHERE n.source = 'ims'
       RETURN labels(n)[0] AS type, count(n) AS cnt
       ORDER BY cnt DESC`,
    );
    return result.records.map((r) => ({
      type: r.get('type') as string,
      cnt: (r.get('cnt') as any).toNumber(),
    }));
  });
  for (const c of counts) {
    console.log(`  :${c.type}: ${c.cnt}`);
  }

  // ── Sample queries ──
  console.log('\n=== SAMPLE INTELLIGENCE ===');

  // 1. Items per category
  const catItems = await session.executeRead(async (tx) => {
    const result = await tx.run(
      `MATCH (it:Item)-[:BELONGS_TO]->(cat:Category)
       RETURN cat.name AS category, count(it) AS items
       ORDER BY items DESC`,
    );
    return result.records.map((r) => ({ category: r.get('category'), items: (r.get('items') as any).toNumber() }));
  });
  console.log('Items by Category:');
  for (const r of catItems.slice(0, 5)) {
    console.log(`  ${r.category}: ${r.items} items`);
  }

  // 2. Top vendors by item count supplied
  const topVendors = await session.executeRead(async (tx) => {
    const result = await tx.run(
      `MATCH (v:Vendor)-[:SUPPLIES]->(it:Item)
       RETURN v.name AS vendor, count(it) AS items_supplied
       ORDER BY items_supplied DESC
       LIMIT 5`,
    );
    return result.records.map((r) => ({ vendor: r.get('vendor'), items: (r.get('items_supplied') as any).toNumber() }));
  });
  console.log('Top Vendors (by items supplied):');
  for (const r of topVendors) {
    console.log(`  ${r.vendor}: ${r.items} items`);
  }

  // 3. Average unit price by category
  const avgPrice = await session.executeRead(async (tx) => {
    const result = await tx.run(
      `MATCH (it:Item)-[:BELONGS_TO]->(cat:Category)
       RETURN cat.name AS category, round(avg(it.unit_price), 2) AS avg_price
       ORDER BY avg_price DESC`,
    );
    return result.records.map((r) => ({ category: r.get('category'), avg: (r.get('avg_price') as any).toNumber() }));
  });
  console.log('Avg Unit Price by Category:');
  for (const r of avgPrice.slice(0, 5)) {
    console.log(`  ${r.category}: €${r.avg}`);
  }

  // 4. Items below PAR (potential reorder alerts)
  const lowStock = await session.executeRead(async (tx) => {
    const result = await tx.run(
      `MATCH (r:Restaurant)-[:HAS_INVENTORY]->(it:Item)
       RETURN it.name AS item, it.sku AS sku, it.par_level AS par
       ORDER BY it.par_level ASC
       LIMIT 10`,
    );
    return result.records.map((r) => ({ item: r.get('item'), sku: r.get('sku'), par: (r.get('par') as any).toNumber() }));
  });
  console.log('Items with lowest PAR levels:');
  for (const r of lowStock) {
    console.log(`  ${r.item} (${r.sku}): PAR=${r.par}`);
  }

  console.log('\nNeo4j IMS seed complete!');
  await session.close();
  await closeNeo4jDriver();
}

seed().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
