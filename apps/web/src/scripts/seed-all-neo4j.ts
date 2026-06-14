// @ts-nocheck
import './load-env';
import { createServiceClient } from '../lib/supabase-server';
import { getNeo4jDriver, neo4jBulkMerge, closeNeo4jDriver } from '../lib/neo4j';
import { buildSyncPayload, mapToOntologyItem } from '../lib/neo4j-ontology';
import type { TransactionSyncPayload, ReceiptItemSyncPayload } from '../lib/types';

const TENANT_ID = 'a0000000-0000-0000-0000-000000000001';
const R_ID = 'b0000000-0000-0000-0000-000000000001';
const PAGE_SIZE = 1000;

function uuid() { return crypto.randomUUID(); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const VENDORS = [
  { name: 'Metro Cash & Carry SR', cat: 'COGS - Dry Goods', items: ['Metro Chef Múka hladká 10x1kg', 'Cukor kryštálový 10x1kg', 'Slnečnicový olej 10l', 'Soľ jedlá 1kg', 'Mlieko 1L', 'Maslo 250g', 'Vajcia 30ks'] },
  { name: 'LUNYS s.r.o.', cat: 'COGS - Produce', items: ['Zemiaky neskoré prané', 'Cibuľa žltá', 'Mrkva praná', 'Citróny', 'Cesnak', 'Rajčiny kríčkové', 'Šalát ľadový', 'Mlieko 1L', 'Kuracie prsia 1kg', 'Bravčová krkovička'] },
  { name: 'Bidfood Slovakia', cat: 'COGS - Meat', items: ['Bravčová krkovička bez kosti', 'Hovädzie zadné', 'Kura chladené voľné', 'Zemiakové hranolky 4x2.5kg', 'Losos filet s kožou', 'Maslo 250g', 'Kuracie prsia 1kg'] },
  { name: 'Kofola a.s.', cat: 'COGS - Beverages', items: ['Kofola originál 50L KEG', 'Vinea biela 0.25l', 'Rajec jemne sýtený 0.33l'] },
  { name: 'Heineken Slovensko', cat: 'COGS - Alcohol', items: ['Zlatý Bažant 12% 50L KEG', 'Krušovice 10% 50L KEG', 'Zlatý Bažant 0.0% Radler'] },
  { name: 'ZSE Energia', cat: 'OPEX - Utilities', items: ['Záloha za elektrinu'] },
  { name: 'SPP', cat: 'OPEX - Utilities', items: ['Záloha za plyn'] },
  { name: 'O2 Slovakia', cat: 'OPEX - Telecom', items: ['Mesačný paušál Internet'] },
];

async function fetchAll<T>(table: string, select: string, filters: Record<string, any> = {}): Promise<T[]> {
  const supabase = createServiceClient();
  let all: T[] = [];
  let page = 0;
  while (true) {
    let q = supabase.from(table).select(select) as any;
    for (const [k, v] of Object.entries(filters)) {
      q = q.eq(k, v);
    }
    const { data, error } = await q.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error) throw new Error(`fetchAll(${table}): ${error.message}`);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < PAGE_SIZE) break;
    page++;
  }
  return all;
}

async function seedETTransactions() {
  const supabase = createServiceClient();
  console.log('=== STEP 1: Seed ET Transactions ===');

  const { count: existingCount } = await supabase
    .from('transactions').select('*', { count: 'exact', head: true })
    .eq('tenant_id', TENANT_ID);
  if (existingCount && existingCount > 0) {
    console.log(`  ${existingCount} transactions already exist, skipping ET seed.`);
    return true;
  }

  const TOTAL = 500;
  const BATCH = 100;
  const START_DATE = new Date('2026-05-01');
  const END_DATE = new Date('2026-06-14');
  let inserted = 0;

  for (let batchStart = 0; batchStart < TOTAL; batchStart += BATCH) {
    const txs: any[] = [];
    const items: any[] = [];
    const batchEnd = Math.min(batchStart + BATCH, TOTAL);

    for (let i = batchStart; i < batchEnd; i++) {
      const vendor = pick(VENDORS);
      const txId = uuid();
      const txDate = new Date(START_DATE.getTime() + Math.random() * (END_DATE.getTime() - START_DATE.getTime()));
      const dateStr = txDate.toISOString().split('T')[0];
      const itemCount = randInt(1, 4);
      let total = 0;

      for (let j = 0; j < itemCount; j++) {
        const price = Math.round((Math.random() * 80 + 5) * 100) / 100;
        total += price;
        items.push({
          id: uuid(), transaction_id: txId, tenant_id: TENANT_ID,
          name: pick(vendor.items), amount: price,
          category: vendor.cat, currency: 'EUR',
          source_type: 'transaction', source_id: txId,
        });
      }

      txs.push({
        id: txId, tenant_id: TENANT_ID, amount: Math.round(total * 100) / 100,
        currency: 'EUR', category: vendor.cat, date: dateStr,
        description: vendor.name, transaction_type: 'DEBIT',
        who_id: '00000000-0000-0000-0000-000000000001',
        transacted_at: txDate.toISOString(),
        receipt_number: `REC-SEED-${String(i + 1).padStart(4, '0')}`,
        is_deleted: false,
      });
    }

    const { error: txErr } = await supabase.from('transactions').insert(txs);
    if (txErr) { console.error(`  TX batch error: ${txErr.message}`); continue; }
    const { error: itemErr } = await supabase.from('receipt_items').insert(items);
    if (itemErr) { console.error(`  Item batch error: ${itemErr.message}`); continue; }
    inserted += txs.length;
    console.log(`  [${inserted}/${TOTAL}] inserted`);
  }
  console.log(`  ET seed complete: ${inserted} transactions`);
  return true;
}

async function seedNeo4j() {
  const supabase = createServiceClient();
  const driver = getNeo4jDriver();
  if (!driver) throw new Error('Neo4j driver unavailable');
  const session = driver.session();

  console.log('\n=== STEP 2: Clear Neo4j ===');
  await session.executeWrite(async (tx) => {
    await tx.run('MATCH (n) DETACH DELETE n');
  });
  console.log('  Cleared.');

  // ── A: ET MERCHANT PIPELINE ──
  console.log('\n=== A: ET Merchant Pipeline ===');
  const transactions = await fetchAll<any>('transactions',
    'id, amount, date, category, description, who, currency, tenant_id',
    { tenant_id: TENANT_ID, is_deleted: false },
  );
  // Map date→transaction_date for buildSyncPayload
  for (const tx of transactions) {
    tx.transaction_date = tx.date;
  }
  console.log(`  ${transactions.length} transactions`);

  const receiptItems = await fetchAll<any>('receipt_items',
    'id, transaction_id, name, amount, category, currency',
    { tenant_id: TENANT_ID },
  );
  console.log(`  ${receiptItems.length} receipt_items`);

  const itemsByTx: Record<string, any[]> = {};
  for (const item of receiptItems) {
    if (item.transaction_id) {
      if (!itemsByTx[item.transaction_id]) itemsByTx[item.transaction_id] = [];
      itemsByTx[item.transaction_id].push(item);
    }
  }

  const neoPayloads: TransactionSyncPayload[] = [];
  for (const tx of transactions) {
    const payload = buildSyncPayload(tx, itemsByTx[tx.id] || []);
    neoPayloads.push(payload);
  }
  console.log(`  ${neoPayloads.length} Neo4j payloads built`);

  let synced = 0;
  const ET_BATCH = 100;
  for (let i = 0; i < neoPayloads.length; i += ET_BATCH) {
    const chunk = neoPayloads.slice(i, i + ET_BATCH);
    const count = await neo4jBulkMerge(chunk, session);
    synced += count;
    if (synced % 200 === 0) console.log(`  Synced ${synced}/${neoPayloads.length} to Neo4j`);
  }
  console.log(`  Synced ${synced} ET transactions to Neo4j`);

  // ── B: IMS INVENTORY STRUCTURE ──
  console.log('\n=== B: IMS Inventory Structure ===');

  const categories = await fetchAll<any>('item_categories', 'id, name, description, sort_order', { tenant_id: TENANT_ID, is_active: true });
  console.log(`  ${categories.length} categories`);
  for (const c of categories) {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MERGE (cat:Category {category_id: $id})
         SET cat.name = $name, cat.description = $desc, cat.sort_order = $sort,
             cat.tenant_id = $tenant, cat.source = $src`,
        { id: c.id, name: c.name, desc: c.description || '', sort: c.sort_order, tenant: TENANT_ID, src: 'ims' },
      );
    });
  }

  const items = await fetchAll<any>('items', 'id, name, sku, unit, unit_price, par_level, category_id', { tenant_id: TENANT_ID, is_active: true });
  console.log(`  ${items.length} items`);
  for (const item of items) {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MERGE (it:Item {item_id: $id})
         SET it.name = $name, it.sku = $sku, it.unit = $unit, it.unit_price = $price,
             it.par_level = $par, it.tenant_id = $tenant, it.source = $src`,
        { id: item.id, name: item.name, sku: item.sku, unit: item.unit, price: item.unit_price, par: item.par_level, tenant: TENANT_ID, src: 'ims' },
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

  const vendors = await fetchAll<any>('vendors', 'id, name, contact_email', { tenant_id: TENANT_ID, is_active: true });
  console.log(`  ${vendors.length} vendors`);
  for (const v of vendors) {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MERGE (vendor:Vendor {vendor_id: $id})
         SET vendor.name = $name, vendor.email = $email, vendor.tenant_id = $tenant, vendor.source = $src`,
        { id: v.id, name: v.name, email: v.contact_email || '', tenant: TENANT_ID, src: 'ims' },
      );
    });
  }

  // Vendor-Item supply relations
  const poItems = await fetchAll<any>('po_line_items', 'item_id, po_id');
  const pos = await fetchAll<any>('purchase_orders', 'id, vendor_id, status, order_date', { tenant_id: TENANT_ID });
  const poVendor = new Map(pos.map((p: any) => [p.id, p.vendor_id]));
  const vendorItemMap = new Map<string, Set<string>>();
  for (const li of poItems) {
    const vid = poVendor.get(li.po_id);
    if (vid) {
      if (!vendorItemMap.has(vid)) vendorItemMap.set(vid, new Set());
      vendorItemMap.get(vid)!.add(li.item_id);
    }
  }
  let supplyCount = 0;
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
      supplyCount++;
    }
  }
  console.log(`  ${supplyCount} SUPPLIES relations`);

  // Restaurant
  await session.executeWrite(async (tx) => {
    await tx.run(
      `MERGE (r:Restaurant {restaurant_id: $id})
       SET r.name = $name, r.source = $src`,
      { id: R_ID, name: 'Main Restaurant', src: 'ims' },
    );
  });

  for (const item of items) {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MATCH (r:Restaurant {restaurant_id: $rid})
         MATCH (it:Item {item_id: $iid})
         MERGE (r)-[:HAS_INVENTORY]->(it)`,
        { rid: R_ID, iid: item.id },
      );
    });
  }
  console.log(`  ${items.length} HAS_INVENTORY relations`);

  // Purchase Orders
  console.log(`  ${pos.length} PurchaseOrders`);
  for (const po of pos) {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MERGE (po:PurchaseOrder {po_id: $id})
         SET po.status = $status, po.order_date = $date,
             po.tenant_id = $tenant, po.source = $src`,
        { id: po.id, status: po.status || 'UNKNOWN', date: po.order_date || null, tenant: TENANT_ID, src: 'ims' },
      );
      await tx.run(
        `MATCH (po:PurchaseOrder {po_id: $id})
         MATCH (r:Restaurant {restaurant_id: $rid})
         MERGE (r)-[:PLACED]->(po)`,
        { id: po.id, rid: R_ID },
      );
    });
  }

  const poLiMap = new Map<string, Array<{ item_id: string; qty: number; price: number }>>();
  for (const li of poItems) {
    if (!poLiMap.has(li.po_id)) poLiMap.set(li.po_id, []);
    poLiMap.get(li.po_id)!.push({ item_id: li.item_id, qty: li.quantity_ordered || 0, price: li.raw_unit_price || 0 });
  }
  let orderCount = 0;
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
      orderCount++;
    }
  }
  console.log(`  ${orderCount} ORDERS relations`);

  // ── C: OPERATIONS DATA ──
  console.log('\n=== C: Operations Data ===');

  const ledgerEntries = await fetchAll<any>('inventory_ledger', 'id, item_id, change_amount, reason_code, quantity, cost', { restaurant_id: R_ID });
  console.log(`  ${ledgerEntries.length} ledger entries`);
  for (const le of ledgerEntries) {
    const recordedAt = le.created_at || le.recorded_at || new Date().toISOString();
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MERGE (le:LedgerEntry {entry_id: $id})
         SET le.reason_code = $reason, le.quantity = $qty,
             le.cost = $cost, le.recorded_at = $recordedAt,
             le.source = $src`,
        { id: le.id, reason: le.reason_code, qty: le.quantity || 0, cost: le.cost || 0, recordedAt, src: 'ims' },
      );
      if (le.item_id) {
        await tx.run(
          `MATCH (le:LedgerEntry {entry_id: $id})
           MATCH (it:Item {item_id: $itemId})
           MERGE (le)-[:RECORDS_CHANGE_OF]->(it)`,
          { id: le.id, itemId: le.item_id },
        );
      }
    });
  }

  const wasteLogs = await fetchAll<any>('waste_logs', 'id, item_id, quantity, reason, recorded_at', { restaurant_id: R_ID });
  console.log(`  ${wasteLogs.length} waste events`);
  for (const w of wasteLogs) {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MERGE (we:WasteEvent {event_id: $id})
         SET we.quantity = $qty, we.reason = $reason, we.recorded_at = $recordedAt, we.source = $src`,
        { id: w.id, qty: w.quantity, reason: w.reason, recordedAt: w.recorded_at, src: 'ims' },
      );
      if (w.item_id) {
        await tx.run(
          `MATCH (we:WasteEvent {event_id: $id})
           MATCH (it:Item {item_id: $itemId})
           MERGE (we)-[:WASTED]->(it)`,
          { id: w.id, itemId: w.item_id },
        );
      }
    });
  }

  const prepLogs = await fetchAll<any>('prep_production_logs', 'id, prep_item_id, yield_qty_produced, produced_at', { restaurant_id: R_ID });
  console.log(`  ${prepLogs.length} prep events`);
  for (const p of prepLogs) {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MERGE (pe:PrepEvent {event_id: $id})
         SET pe.qty_produced = $qty, pe.produced_at = $producedAt, pe.source = $src`,
        { id: p.id, qty: p.yield_qty_produced || 0, producedAt: p.produced_at, src: 'ims' },
      );
      if (p.prep_item_id) {
        await tx.run(
          `MATCH (pe:PrepEvent {event_id: $id})
           MATCH (it:Item {item_id: $itemId})
           MERGE (pe)-[:PREPPED]->(it)`,
          { id: p.id, itemId: p.prep_item_id },
        );
      }
    });
  }

  const countBatches = await fetchAll<any>('inventory_count_batches', 'id, restaurant_id, status, snapshot_timestamp', { restaurant_id: R_ID });
  console.log(`  ${countBatches.length} count batches`);
  for (const cb of countBatches) {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `MERGE (ic:InventoryCount {batch_id: $id})
         SET ic.status = $status, ic.snapshot_date = $date, ic.source = $src`,
        { id: cb.id, status: cb.status, date: cb.snapshot_timestamp, src: 'ims' },
      );
      await tx.run(
        `MATCH (ic:InventoryCount {batch_id: $id})
         MATCH (r:Restaurant {restaurant_id: $rid})
         MERGE (ic)-[:COUNTED_AT]->(r)`,
        { id: cb.id, rid: R_ID },
      );
    });

    const rows = await fetchAll<any>('inventory_count_rows', 'id, batch_id, item_id, expected_qty, actual_qty, variance_qty', { batch_id: cb.id });
    for (const row of rows) {
      await session.executeWrite(async (tx) => {
        await tx.run(
          `MERGE (cr:CountRow {row_id: $id})
           SET cr.expected_qty = $exp, cr.actual_qty = $act,
               cr.variance_qty = $var, cr.source = $src`,
          { id: row.id, exp: row.expected_qty, act: row.actual_qty, var: row.variance_qty, src: 'ims' },
        );
        await tx.run(
          `MATCH (cr:CountRow {row_id: $id})
           MATCH (ic:InventoryCount {batch_id: $bid})
           MERGE (cr)-[:PART_OF]->(ic)`,
          { id: row.id, bid: cb.id },
        );
        if (row.item_id) {
          await tx.run(
            `MATCH (cr:CountRow {row_id: $id})
             MATCH (it:Item {item_id: $itemId})
             MERGE (cr)-[:COUNTS]->(it)`,
            { id: row.id, itemId: row.item_id },
          );
        }
      });
    }
  }

  // ── D: CROSS-DOMAIN BRIDGE ──
  console.log('\n=== D: Cross-Domain Bridge (Item ↔ Ingredient) ===');
  let bridgeCount = 0;
  for (const item of items) {
    const mapped = mapToOntologyItem(item.name, 'ims-bridge', 'EUR');
    if (mapped.baseUnit !== 'pcs') {
      await session.executeWrite(async (tx) => {
        await tx.run(
          `MATCH (it:Item {item_id: $itemId})
           MATCH (ing:Ingredient {ingredient_id: $ingId})
           MERGE (it)-[:CORRESPONDS_TO]->(ing)`,
          { itemId: item.id, ingId: mapped.canonicalIngredientId },
        );
      });
      bridgeCount++;
    }
  }
  console.log(`  ${bridgeCount} CORRESPONDS_TO bridges`);

  // ── VERIFICATION ──
  console.log('\n=== VERIFICATION ===');
  const counts = await session.executeRead(async (tx) => {
    const result = await tx.run(
      `MATCH (n)
       RETURN labels(n)[0] AS type, count(n) AS cnt
       ORDER BY cnt DESC`,
    );
    return result.records.map((r) => ({
      type: r.get('type') as string,
      cnt: Number(r.get('cnt') || 0),
    }));
  });
  for (const c of counts) {
    console.log(`  :${c.type}: ${c.cnt}`);
  }

  const relCount = await session.executeRead(async (tx) => {
    const result = await tx.run('MATCH ()-[r]->() RETURN count(r) AS total');
    return Number(result.records[0]?.get('total') || 0);
  });
  console.log(`  Total relationships: ${relCount}`);

  // ── INTELLIGENCE QUERIES ──
  console.log('\n=== INTELLIGENCE ===\n');

  console.log('1. BOUGHT (ET) vs SOLD (IMS) vs LOST (Waste/Spoilage):');
  const boughtVsSold = await session.executeRead(async (tx) => {
    const bought = await tx.run('MATCH (t:Transaction) WHERE t.tenant_id = $tid RETURN count(t) AS cnt, sum(t.amount) AS total', { tid: TENANT_ID });
    const sold = await tx.run("MATCH (le:LedgerEntry {reason_code: $rc}) RETURN count(le) AS cnt, sum(le.cost) AS total", { rc: 'SALE' });
    const lost = await tx.run("MATCH (le:LedgerEntry) WHERE le.reason_code IN [$r1,$r2,$r3] RETURN sum(le.cost) AS total", { r1: 'WASTE', r2: 'SPOILAGE', r3: 'PREP_USE' });
    return {
      bought: { cnt: Number(bought.records[0]?.get('cnt') || 0), total: Number(bought.records[0]?.get('total') || 0) },
      sold: { cnt: Number(sold.records[0]?.get('cnt') || 0), total: Number(sold.records[0]?.get('total') || 0) },
      lost: { total: Number(lost.records[0]?.get('total') || 0) },
    };
  });
  console.log(`  Bought:  €${boughtVsSold.bought.total.toFixed(2)} (${boughtVsSold.bought.cnt} txns)`);
  console.log(`  Sold:    €${boughtVsSold.sold.total.toFixed(2)} (${boughtVsSold.sold.cnt} ledger entries)`);
  console.log(`  Lost:    €${boughtVsSold.lost.total.toFixed(2)} (waste+spoilage+prep)`);

  console.log('\n2. Waste breakdown by reason code:');
  const wasteByReason = await session.executeRead(async (tx) => {
    const result = await tx.run(
      `MATCH (le:LedgerEntry)
       WHERE le.reason_code IN ['WASTE','SPOILAGE','PREP_USE','TRANSFER_OUT']
       RETURN le.reason_code AS reason, count(le) AS cnt, sum(le.cost) AS total_cost
       ORDER BY total_cost DESC`,
    );
    return result.records.map((r) => ({
      reason: r.get('reason'),
      cnt: Number(r.get('cnt') || 0),
      cost: Number(r.get('total_cost') || 0),
    }));
  });
  for (const r of wasteByReason) {
    console.log(`  ${r.reason}: ${r.cnt} events, €${r.cost.toFixed(2)}`);
  }

  console.log('\n3. Top items by count variance magnitude:');
  const topVariance = await session.executeRead(async (tx) => {
    const result = await tx.run(
      `MATCH (cr:CountRow)-[:COUNTS]->(it:Item)
       RETURN it.name AS item, avg(cr.variance_qty) AS avg_var,
              sum(abs(cr.variance_qty)) AS total_var
       ORDER BY total_var DESC LIMIT 10`,
    );
    return result.records.map((r) => ({
      item: r.get('item'),
      avgVar: Number(r.get('avg_var') || 0),
      magnitude: Number(r.get('total_var') || 0),
    }));
  });
  for (const r of topVariance) {
    console.log(`  ${r.item}: avg ${r.avgVar.toFixed(1)} units variance, total magnitude ${r.magnitude.toFixed(1)}`);
  }

  await session.close();
  await closeNeo4jDriver();
  console.log('\n=== DONE ===');
}

async function main() {
  await seedETTransactions();
  await seedNeo4j();
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
