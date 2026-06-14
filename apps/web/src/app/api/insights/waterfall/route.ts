import { NextRequest, NextResponse } from 'next/server';
import { getNeo4jDriver } from '@/lib/neo4j';
import { createServiceClient } from '@/lib/supabase-server';

interface WaterfallStep {
  label: string;
  valueEur: number;
  valueKg: number;
  unit: string;
  isSubtotal?: boolean;
  isActual?: boolean;
  isVariance?: boolean;
  isLoss?: boolean;
}

interface WaterfallResponse {
  steps: WaterfallStep[];
  mode: 'kg' | 'eur';
  totalBought: number;
  totalSold: number;
  totalLost: number;
  totalVariance: number;
}

export async function GET(req: NextRequest) {
  try {
    const mode = (req.nextUrl.searchParams.get('mode') || 'eur') as 'kg' | 'eur';
    const tenantId = req.nextUrl.searchParams.get('tenant_id') || 'a0000000-0000-0000-0000-000000000001';

    const driver = getNeo4jDriver();
    if (!driver) {
      return NextResponse.json({ error: 'Neo4j unavailable' }, { status: 503 });
    }

    const session = driver.session();
    try {
      const supabase = createServiceClient();

      // 1. Purchases: total amount from ET transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('tenant_id', tenantId)
        .eq('is_deleted', false);
      const totalBought = (txData || []).reduce((s: number, t: any) => s + Number(t.amount || 0), 0);

      // 2. Get ledger aggregations from Neo4j
      const ledgerResult = await session.executeRead(async (tx) => {
        const result = await tx.run(
          `MATCH (le:LedgerEntry)
           RETURN le.reason_code AS reason,
                  count(le) AS cnt,
                  sum(le.cost) AS total_cost,
                  sum(le.quantity) AS total_qty
           ORDER BY total_cost DESC`,
        );
        return result.records.map((r) => ({
          reason: r.get('reason') as string,
          cost: Number(r.get('total_cost') || 0),
          qty: Number(r.get('total_qty') || 0),
        }));
      });

      // 3. Get last count batch actual quantities
      const countResult = await session.executeRead(async (tx) => {
        const result = await tx.run(
          `MATCH (cr:CountRow)-[:PART_OF]->(ic:InventoryCount)
           WHERE ic.status = 'CLOSED'
           WITH ic, ic.snapshot_date AS sd
           ORDER BY sd DESC LIMIT 1
           MATCH (cr)-[:PART_OF]->(ic)
           RETURN sum(cr.expected_qty) AS total_expected,
                  sum(cr.actual_qty) AS total_actual,
                  sum(cr.variance_qty) AS total_variance`,
        );
        return {
          expected: Number(result.records[0]?.get('total_expected') || 0),
          actual: Number(result.records[0]?.get('total_actual') || 0),
          variance: Number(result.records[0]?.get('total_variance') || 0),
        };
      });

      // 4. Compute per-category breakdowns
      const ledgerMap = new Map<string, { cost: number; qty: number }>();
      for (const r of ledgerResult) {
        ledgerMap.set(r.reason, { cost: r.cost, qty: r.qty });
      }

      const sold = ledgerMap.get('SALE') || { cost: 0, qty: 0 };
      const waste = ledgerMap.get('WASTE') || { cost: 0, qty: 0 };
      const spoilage = ledgerMap.get('SPOILAGE') || { cost: 0, qty: 0 };
      const prep = ledgerMap.get('PREP_USE') || { cost: 0, qty: 0 };
      const transfer = ledgerMap.get('TRANSFER_OUT') || { cost: 0, qty: 0 };

      const totalSalesCost = sold.cost;
      const totalSalesQty = sold.qty;
      const totalWasteCost = waste.cost + spoilage.cost;
      const totalWasteQty = waste.qty + spoilage.qty;
      const totalPrepCost = prep.cost;
      const totalPrepQty = prep.qty;
      const totalTransferCost = transfer.cost;
      const totalTransferQty = transfer.qty;
      const totalKnownLosses = totalWasteCost + totalPrepCost + totalTransferCost;
      const totalKnownLossesQty = totalWasteQty + totalPrepQty + totalTransferQty;
      const totalLost = totalWasteCost + totalPrepCost + totalTransferCost + totalSalesCost;

      const expectedEndingEur = totalBought - totalSalesCost - totalKnownLosses;
      const expectedEndingQty = countResult.expected - totalSalesQty - totalKnownLossesQty;

      // Build waterfall
      const steps: WaterfallStep[] = [
        { label: 'Beginning (Purchases)', valueEur: totalBought, valueKg: countResult.expected, unit: 'total', isSubtotal: false },
        { label: 'Sales', valueEur: -totalSalesCost, valueKg: -totalSalesQty, unit: 'total', isLoss: true },
        { label: 'Waste & Spoilage', valueEur: -totalWasteCost, valueKg: -totalWasteQty, unit: 'total', isLoss: true },
        { label: 'Prep Use', valueEur: -totalPrepCost, valueKg: -totalPrepQty, unit: 'total', isLoss: true },
        { label: 'Transfers', valueEur: -totalTransferCost, valueKg: -totalTransferQty, unit: 'total', isLoss: true },
        { label: 'Expected Ending', valueEur: expectedEndingEur, valueKg: expectedEndingQty, unit: 'total', isSubtotal: true },
        { label: 'Actual Count', valueEur: countResult.actual * (totalBought / (countResult.expected || 1)), valueKg: countResult.actual, unit: 'total', isActual: true },
        { label: 'Unexplained Variance', valueEur: (countResult.actual * (totalBought / (countResult.expected || 1))) - expectedEndingEur, valueKg: countResult.variance, unit: 'total', isVariance: true },
      ];

      return NextResponse.json({
        steps,
        mode,
        totalBought,
        totalSold: totalSalesCost,
        totalLost,
        totalVariance: countResult.variance,
      } satisfies WaterfallResponse);
    } finally {
      await session.close();
    }
  } catch (err) {
    console.error('Waterfall API error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
