import { Injectable, Inject } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { Database, RestaurantId, VarianceAnalyticRow, DailyInventorySnapshot, SnapshotId, ItemId, asItemId } from '@synculariti/types';

export const REPORTING_REPOSITORY_TOKEN = Symbol('IReportingRepository');

@Injectable()
export class ReportingRepository {
  constructor(@Inject('DB_CLIENT') private readonly db: Kysely<Database>) {}

  async findVarianceAnalytics(restaurantId: RestaurantId): Promise<VarianceAnalyticRow[]> {
    const rows: Record<string, unknown>[] = await this.db
      .selectFrom('mat_view_variance_analytics as mva')
      .selectAll()
      .where('mva.restaurant_id', '=', restaurantId as any)
      .orderBy(sql`ABS(mva.unexplained_variance_qty)`, 'desc')
      .execute();
    return rows.map(r => ({
      restaurantId: r.restaurant_id as RestaurantId | null,
      itemId: r.item_id ? asItemId(r.item_id as string) : null,
      reportingMonth: r.reporting_month as string | null,
      actualQty: r.actual_qty != null ? Number(r.actual_qty) : null,
      theoreticalQty: r.theoretical_qty != null ? Number(r.theoretical_qty) : null,
      unexplainedVarianceQty: r.unexplained_variance_qty != null ? Number(r.unexplained_variance_qty) : null,
    }));
  }

  async findDailySnapshots(restaurantId: RestaurantId, limit: number, offset: number): Promise<DailyInventorySnapshot[]> {
    const rows: Record<string, unknown>[] = await this.db
      .selectFrom('daily_inventory_snapshots as dis')
      .selectAll()
      .where('dis.restaurant_id', '=', restaurantId as any)
      .orderBy(sql`dis.business_date`, 'desc')
      .limit(limit)
      .offset(offset)
      .execute();
    return rows.map(r => ({
      id: r.id as SnapshotId,
      restaurantId: r.restaurant_id as RestaurantId,
      itemId: asItemId(r.item_id as string),
      businessDate: r.business_date as string,
      eodQty: Number(r.eod_qty),
      fifoTotalValue: Number(r.fifo_total_value),
      createdAt: r.created_at as string,
    }));
  }

  async findParAlerts(restaurantId: RestaurantId) {
    const rows: Record<string, unknown>[] = await this.db
      .selectFrom('item_restaurant_overrides as iro')
      .innerJoin('items as i', 'i.id', 'iro.item_id')
      .leftJoin('inventory_ledger as il', (join) =>
        join
          .on(sql`il.item_id`, '=', sql`iro.item_id`)
          .on(sql`il.restaurant_id`, '=', sql`iro.restaurant_id`)
      )
      .select([
        'iro.item_id',
        'i.name as item_name',
        'i.sku',
        'iro.par_level',
        sql<number>`COALESCE(SUM(il.change_amount), 0)`.as('quantity_on_hand'),
      ])
      .where('iro.restaurant_id', '=', restaurantId as any)
      .where('iro.is_active', '=', true)
      .where('iro.par_level', '>', 0)
      .groupBy(['iro.item_id', 'i.name', 'i.sku', 'iro.par_level'])
      .having(sql`COALESCE(SUM(il.change_amount), 0)`, '<', sql.ref('iro.par_level'))
      .orderBy(sql`quantity_on_hand`, 'asc')
      .execute();
    return rows.map(r => ({
      itemId: asItemId(r.item_id as string),
      itemName: r.item_name as string,
      sku: r.sku as string,
      parLevel: Number(r.par_level),
      quantityOnHand: Number(r.quantity_on_hand),
    }));
  }
}
