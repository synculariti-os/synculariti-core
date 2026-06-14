import { Injectable } from '@nestjs/common';
import neo4j from 'neo4j-driver';
import { IAnalyticsService, WaterfallResult, TunnelCategory } from './interfaces/i-analytics.service';

const TENANT_ID = 'a0000000-0000-0000-0000-000000000001';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
  private driver;

  constructor() {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER || '';
    const password = process.env.NEO4J_PASSWORD || '';
    this.driver = user && password
      ? neo4j.driver(uri, neo4j.auth.basic(user, password))
      : neo4j.driver(uri);
  }

  private async withSession<T>(fn: (s: any) => Promise<T>): Promise<T> {
    const session = this.driver.session();
    try { return await fn(session); }
    finally { await session.close(); }
  }

  async getWaterfall(tenantId: string, mode: 'kg' | 'eur'): Promise<WaterfallResult> {
    return this.withSession(async (session) => {
      // Total bought from ET Transaction nodes
      const boughtResult = await session.executeRead(async (tx: any) => {
        const r = await tx.run(
          'MATCH (t:Transaction {tenant_id: $tid}) RETURN sum(t.amount) AS total',
          { tid: tenantId },
        );
        return Number(r.records[0]?.get('total') || 0);
      });

      // Ledger aggregation
      const ledgerResult = await session.executeRead(async (tx: any) => {
        const r = await tx.run(
          `MATCH (le:LedgerEntry)
           RETURN le.reason_code AS reason,
                  sum(le.cost) AS total_cost,
                  sum(le.quantity) AS total_qty`,
        );
        return r.records.map((rec: any) => ({
          reason: rec.get('reason') as string,
          cost: Number(rec.get('total_cost') || 0),
          qty: Number(rec.get('total_qty') || 0),
        }));
      });

      // Last count batch
      const countResult = await session.executeRead(async (tx: any) => {
        const r = await tx.run(
          `MATCH (cr:CountRow)-[:PART_OF]->(ic:InventoryCount)
           WHERE ic.status = 'CLOSED'
           WITH ic ORDER BY ic.snapshot_date DESC LIMIT 1
           MATCH (cr)-[:PART_OF]->(ic)
           RETURN sum(cr.expected_qty) AS expected,
                  sum(cr.actual_qty) AS actual,
                  sum(cr.variance_qty) AS variance`,
        );
        return {
          expected: Number(r.records[0]?.get('expected') || 0),
          actual: Number(r.records[0]?.get('actual') || 0),
          variance: Number(r.records[0]?.get('variance') || 0),
        };
      });

      const m = new Map<string, { cost: number; qty: number }>();
      for (const r of ledgerResult) m.set(r.reason, r);

      const s = (k: string) => m.get(k) || { cost: 0, qty: 0 };
      const sold = s('SALE');
      const wasteCost = s('WASTE').cost + s('SPOILAGE').cost;
      const wasteQty = s('WASTE').qty + s('SPOILAGE').qty;
      const prep = s('PREP_USE');
      const transfer = s('TRANSFER_OUT');

      const totalBought = boughtResult;
      const totalSoldCost = sold.cost;
      const totalSoldQty = sold.qty;
      const totalLost = totalSoldCost + wasteCost + prep.cost + transfer.cost;
      const exp = countResult.expected;
      const expectedEndingEur = exp > 0 ? totalBought - totalSoldCost - wasteCost - prep.cost - transfer.cost : 0;
      const expectedEndingQty = exp - totalSoldQty - wasteQty - prep.qty - transfer.qty;
      const actualEur = countResult.actual > 0 ? countResult.actual * (totalBought / (exp || 1)) : 0;

      return {
        steps: [
          { label: 'Beginning (Purchases)', valueEur: totalBought, valueKg: exp, unit: 'total' },
          { label: 'Sales', valueEur: -totalSoldCost, valueKg: -totalSoldQty, unit: 'total', isLoss: true },
          { label: 'Waste & Spoilage', valueEur: -wasteCost, valueKg: -wasteQty, unit: 'total', isLoss: true },
          { label: 'Prep Use', valueEur: -prep.cost, valueKg: -prep.qty, unit: 'total', isLoss: true },
          { label: 'Transfers', valueEur: -transfer.cost, valueKg: -transfer.qty, unit: 'total', isLoss: true },
          { label: 'Expected Ending', valueEur: expectedEndingEur, valueKg: expectedEndingQty, unit: 'total', isSubtotal: true },
          { label: 'Actual Count', valueEur: actualEur, valueKg: countResult.actual, unit: 'total', isActual: true },
          { label: 'Unexplained Variance', valueEur: actualEur - expectedEndingEur, valueKg: countResult.variance, unit: 'total', isVariance: true },
        ],
        totalBought,
        totalSold: totalSoldCost,
        totalLost,
        totalVariance: countResult.variance,
        mode,
      };
    });
  }

  async getTunnelCategories(tenantId: string, mode: 'kg' | 'eur'): Promise<TunnelCategory[]> {
    return this.withSession(async (session) => {
      return session.executeRead(async (tx: any) => {
        const r = await tx.run(
          `MATCH (cat:Category)
           OPTIONAL MATCH (it:Item)-[:BELONGS_TO]->(cat)
           OPTIONAL MATCH (le:LedgerEntry)-[:RECORDS_CHANGE_OF]->(it)
           WITH cat,
                coalesce(sum(le.cost), 0) AS total_cost,
                coalesce(sum(le.quantity), 0) AS total_qty,
                count(DISTINCT it) AS item_count
           RETURN cat.name AS name, cat.category_id AS categoryId,
                  total_cost, total_qty, item_count
           ORDER BY total_cost DESC`,
        );
        return r.records.map((rec: any) => ({
          name: rec.get('name'),
          categoryId: rec.get('categoryId'),
          valueEur: Number(rec.get('total_cost') || 0),
          valueKg: Number(rec.get('total_qty') || 0),
          itemCount: Number(rec.get('item_count') || 0),
        }));
      });
    });
  }

  async getTunnelItems(categoryId: string, mode: 'kg' | 'eur'): Promise<any> {
    return this.withSession(async (session) => {
      return session.executeRead(async (tx: any) => {
        const r = await tx.run(
          `MATCH (it:Item)-[:BELONGS_TO]->(cat:Category {category_id: $catId})
           OPTIONAL MATCH (le:LedgerEntry)-[:RECORDS_CHANGE_OF]->(it)
           WITH it, cat,
                coalesce(sum(le.cost), 0) AS total_cost,
                coalesce(sum(le.quantity), 0) AS total_qty,
                count(le) AS entry_count
           RETURN cat.name AS categoryName,
                  collect({itemId: it.item_id, itemName: it.name,
                    cost: total_cost, qty: total_qty,
                    entries: entry_count
                  }) AS items
           ORDER BY total_cost DESC`,
          { catId: categoryId },
        );
        const row = r.records[0];
        if (!row) return null;
        return {
          categoryName: row.get('categoryName'),
          items: (row.get('items') as any[] || []).map((i: any) => ({
            itemId: i.itemId, itemName: i.itemName,
            cost: Number(i.cost), qty: Number(i.qty),
            entries: Number(i.entries),
          })),
        };
      });
    });
  }

  async getTunnelItemDetail(itemId: string): Promise<any> {
    return this.withSession(async (session) => {
      const item = await session.executeRead(async (tx: any) => {
        const r = await tx.run(
          `MATCH (it:Item {item_id: $itemId})
           OPTIONAL MATCH (le:LedgerEntry)-[:RECORDS_CHANGE_OF]->(it)
           WITH it, le.reason_code AS reason,
                sum(le.cost) AS total_cost,
                sum(le.quantity) AS total_qty
           WHERE reason IS NOT NULL
           RETURN it.name AS itemName, it.unit_price AS unitPrice,
                  collect({reason, cost: total_cost, qty: total_qty}) AS breakdown`,
          { itemId },
        );
        const row = r.records[0];
        if (!row) return null;
        return {
          itemName: row.get('itemName'),
          unitPrice: Number(row.get('unitPrice') || 0),
          breakdown: (row.get('breakdown') as any[] || []).map((b: any) => ({
            reason: b.reason, cost: Number(b.cost), qty: Number(b.qty),
          })),
        };
      });

      const waste = await session.executeRead(async (tx: any) => {
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

      const counts = await session.executeRead(async (tx: any) => {
        const r = await tx.run(
          `MATCH (cr:CountRow)-[:COUNTS]->(it:Item {item_id: $itemId})
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

      return { item, waste, counts };
    });
  }
}
