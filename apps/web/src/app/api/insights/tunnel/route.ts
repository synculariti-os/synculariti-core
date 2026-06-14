import { NextRequest, NextResponse } from 'next/server';
import { getNeo4jDriver } from '@/lib/neo4j';

interface TunnelLevel {
  name: string;
  valueEur: number;
  valueKg: number;
  itemCount: number;
  children?: TunnelLevel[];
}

export async function GET(req: NextRequest) {
  try {
    const mode = (req.nextUrl.searchParams.get('mode') || 'eur') as 'kg' | 'eur';
    const categoryId = req.nextUrl.searchParams.get('category_id');
    const itemId = req.nextUrl.searchParams.get('item_id');

    const driver = getNeo4jDriver();
    if (!driver) {
      return NextResponse.json({ error: 'Neo4j unavailable' }, { status: 503 });
    }

    const session = driver.session();
    try {
      // Level 1 → Category drill-down, Level 2 → Item drill-down, Level 3 → Variance detail
      if (itemId) {
        // Level 3: Single-item variance breakdown
        const result = await session.executeRead(async (tx) => {
          const r = await tx.run(
            `MATCH (it:Item {item_id: $itemId})
             OPTIONAL MATCH (le:LedgerEntry)-[:RECORDS_CHANGE_OF]->(it)
             WITH it, le.reason_code AS reason,
                  sum(le.cost) AS total_cost,
                  sum(le.quantity) AS total_qty
             WHERE reason IS NOT NULL
             RETURN it.name AS itemName, it.unit_price AS unitPrice,
                    collect({reason: reason, cost: total_cost, qty: total_qty}) AS breakdown
             ORDER BY total_cost DESC`,
            { itemId },
          );
          return r.records.map((rec) => ({
            itemName: rec.get('itemName'),
            unitPrice: Number(rec.get('unitPrice') || 0),
            breakdown: (rec.get('breakdown') as any[] || []).map((b: any) => ({
              reason: b.reason,
              cost: Number(b.cost),
              qty: Number(b.qty),
            })),
          }))[0];
        });

        // Get waste events and count variance for this item
        const wasteResult = await session.executeRead(async (tx) => {
          const r = await tx.run(
            `MATCH (we:WasteEvent)-[:WASTED]->(it:Item {item_id: $itemId})
             RETURN sum(we.quantity) AS total_waste, count(we) AS waste_events`,
            { itemId },
          );
          return {
            wasteQty: Number(r.records[0]?.get('total_waste') || 0),
            wasteEvents: Number(r.records[0]?.get('waste_events') || 0),
          };
        });

        const countResult = await session.executeRead(async (tx) => {
          const r = await tx.run(
            `MATCH (cr:CountRow)-[:COUNTS]->(it:Item {item_id: $itemId})
             WITH cr, it
             ORDER BY cr.row_id DESC LIMIT 5
             RETURN avg(cr.expected_qty) AS expected,
                    avg(cr.actual_qty) AS actual,
                    avg(cr.variance_qty) AS variance`,
            { itemId },
          );
          return {
            expected: Number(r.records[0]?.get('expected') || 0),
            actual: Number(r.records[0]?.get('actual') || 0),
            variance: Number(r.records[0]?.get('variance') || 0),
          };
        });

        return NextResponse.json({
          item: result,
          waste: wasteResult,
          counts: countResult,
          mode,
        });
      }

      if (categoryId) {
        // Level 2: Items within a category
        const result = await session.executeRead(async (tx) => {
          const r = await tx.run(
            `MATCH (it:Item)-[:BELONGS_TO]->(cat:Category {category_id: $catId})
             OPTIONAL MATCH (le:LedgerEntry)-[:RECORDS_CHANGE_OF]->(it)
             WITH it, cat,
                  coalesce(sum(le.cost), 0) AS total_cost,
                  coalesce(sum(le.quantity), 0) AS total_qty,
                  count(le) AS entry_count
             RETURN cat.name AS categoryName,
                    collect({
                      itemId: it.item_id,
                      itemName: it.name,
                      cost: total_cost,
                      qty: total_qty,
                      entries: entry_count
                    }) AS items
             ORDER BY total_cost DESC`,
            { catId: categoryId },
          );
          return r.records.map((rec) => ({
            categoryName: rec.get('categoryName'),
            items: (rec.get('items') as any[] || []).map((i: any) => ({
              itemId: i.itemId,
              itemName: i.itemName,
              cost: Number(i.cost),
              qty: Number(i.qty),
              entries: Number(i.entries),
            })),
          }))[0];
        });

        if (!result) {
          return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({
          category: result,
          mode,
        });
      }

      // Level 1: All categories with aggregated costs
      const result = await session.executeRead(async (tx) => {
        const r = await tx.run(
          `MATCH (cat:Category)
           OPTIONAL MATCH (it:Item)-[:BELONGS_TO]->(cat)
           OPTIONAL MATCH (le:LedgerEntry)-[:RECORDS_CHANGE_OF]->(it)
           WITH cat,
                coalesce(sum(le.cost), 0) AS total_cost,
                coalesce(sum(le.quantity), 0) AS total_qty,
                count(DISTINCT it) AS item_count
           RETURN cat.name AS name,
                  cat.category_id AS categoryId,
                  total_cost,
                  total_qty,
                  item_count
           ORDER BY total_cost DESC`,
        );
        return r.records.map((rec) => ({
          name: rec.get('name'),
          categoryId: rec.get('categoryId'),
          valueEur: Number(rec.get('total_cost') || 0),
          valueKg: Number(rec.get('total_qty') || 0),
          itemCount: (rec.get('item_count') as any)?.toNumber ? (rec.get('item_count') as any).toNumber() : Number(rec.get('item_count') || 0),
        }));
      });

      return NextResponse.json({
        categories: result,
        mode,
      } as { categories: TunnelLevel[]; mode: string });
    } finally {
      await session.close();
    }
  } catch (err) {
    console.error('Tunnel API error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
