import { Injectable, Inject } from '@nestjs/common';
import { Kysely } from 'kysely';
import { randomUUID } from 'crypto';
import {
  Database,
  PurchaseOrder,
  PoLineItem,
  InventoryBatch,
  InventoryBatchId,
  PurchaseOrderId,
  RestaurantId,
  VendorId,
  FranchiseGroupId,
  asPurchaseOrderId,
  asRestaurantId,
  asVendorId,
  asPoLineItemId,
  asItemId,
  asInventoryBatchId,
  asFranchiseGroupId,
} from '@synculariti/types';
import { CreatePoDto } from '@synculariti/validators';
import { IProcurementRepository, CreateInventoryBatchInput } from './interfaces/i-procurement.repository';

@Injectable()
export class ProcurementRepository implements IProcurementRepository {
  constructor(@Inject('DB_CLIENT') private readonly db: Kysely<Database>) {}

  private mapPO(row: any): PurchaseOrder {
    return {
      id: asPurchaseOrderId(row.id),
      restaurantId: asRestaurantId(row.restaurant_id),
      vendorId: asVendorId(row.vendor_id),
      status: row.status as any,
      orderDate: row.order_date,
      expectedDeliveryDate: row.expected_delivery_date,
      freightCharge: row.freight_charge,
      taxAmount: row.tax_amount,
      discountAmount: row.discount_amount,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapPoLineItem(row: any): PoLineItem {
    return {
      id: asPoLineItemId(row.id),
      poId: asPurchaseOrderId(row.po_id),
      itemId: asItemId(row.item_id),
      quantityOrdered: row.quantity_ordered,
      quantityReceived: row.quantity_received,
      rawUnitPrice: row.raw_unit_price,
      createdAt: row.created_at,
    };
  }

  async createPO(restaurantId: RestaurantId, dto: CreatePoDto): Promise<PurchaseOrder> {
    const id = asPurchaseOrderId(randomUUID());
    
    return await this.db.transaction().execute(async (trx) => {
      const row = await trx
        .insertInto('purchase_orders')
        .values({
          id,
          restaurant_id: restaurantId,
          vendor_id: dto.vendorId as VendorId,
          status: 'DRAFT',
          order_date: new Date().toISOString(),
          expected_delivery_date: dto.expectedDeliveryDate || null,
          freight_charge: dto.freightCharge || 0,
          tax_amount: dto.taxAmount || 0,
          discount_amount: dto.discountAmount || 0,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      if (dto.lineItems && dto.lineItems.length > 0) {
        await trx
          .insertInto('po_line_items')
          .values(dto.lineItems.map(l => ({
            id: asPoLineItemId(randomUUID()),
            po_id: id,
            item_id: asItemId(l.itemId),
            quantity_ordered: l.quantityOrdered,
            raw_unit_price: l.rawUnitPrice ?? 0,
          })))
          .execute();
      }

      return this.mapPO(row);
    });
  }

  async findPOById(poId: PurchaseOrderId): Promise<PurchaseOrder | null> {
    const row = await this.db
      .selectFrom('purchase_orders')
      .selectAll()
      .where('id', '=', poId)
      .executeTakeFirst();
    return row ? this.mapPO(row) : null;
  }

  async updatePOStatus(poId: PurchaseOrderId, status: string): Promise<PurchaseOrder> {
    const row = await this.db
      .updateTable('purchase_orders')
      .set({ status: status as any, updated_at: new Date().toISOString() })
      .where('id', '=', poId)
      .returningAll()
      .executeTakeFirstOrThrow();
    return this.mapPO(row);
  }

  async findLineItemsByPOId(poId: PurchaseOrderId): Promise<PoLineItem[]> {
    const rows = await this.db
      .selectFrom('po_line_items')
      .selectAll()
      .where('po_id', '=', poId)
      .execute();
    return rows.map(r => this.mapPoLineItem(r));
  }

  async updateLineItemReceived(trx: unknown, lineItemId: string, qty: number): Promise<void> {
    const db = trx as Kysely<Database>;
    await db
      .updateTable('po_line_items')
      .set({ quantity_received: qty })
      .where('id', '=', lineItemId as any)
      .execute();
  }

  async findPOsByRestaurantId(restaurantId: RestaurantId): Promise<PurchaseOrder[]> {
    const rows = await this.db
      .selectFrom('purchase_orders')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .orderBy('created_at', 'desc')
      .execute();
    return rows.map(r => this.mapPO(r));
  }

  private mapVendor(row: Record<string, unknown>): Record<string, unknown> {
    return {
      id: row.id,
      franchiseGroupId: row.franchise_group_id ? asFranchiseGroupId(row.franchise_group_id as string) : null,
      restaurantId: row.restaurant_id ? asRestaurantId(row.restaurant_id as string) : null,
      name: row.name,
      contactEmail: row.contact_email ?? null,
      isActive: row.is_active ?? true,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async createVendor(input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const id = randomUUID();
    await this.db
      .insertInto('vendors')
      .values({ id, ...input } as any)
      .execute();
    return this.findVendorById(id) as Promise<Record<string, unknown>>;
  }

  async createVendorsBulk(inputs: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
    if (inputs.length === 0) return [];

    const rows = inputs.map((input) => ({
      id: randomUUID(),
      ...input,
    }));

    await this.db
      .insertInto('vendors')
      .values(rows as any)
      .execute();

    const ids = rows.map((r) => r.id);
    const dbRows = await this.db
      .selectFrom('vendors')
      .selectAll()
      .where('id', 'in', ids as any)
      .orderBy('name')
      .execute();
    return dbRows.map(r => this.mapVendor(r));
  }

  async findVendorById(vendorId: string): Promise<Record<string, unknown> | null> {
    const row = await this.db
      .selectFrom('vendors')
      .selectAll()
      .where('id', '=', vendorId as any)
      .executeTakeFirst();
    return row ? this.mapVendor(row) : null;
  }

  async findVendorsByScopedId(scopeField: string, scopeValue: string): Promise<Record<string, unknown>[]> {
    const rows = await this.db
      .selectFrom('vendors')
      .selectAll()
      .where(scopeField as any, '=', scopeValue as any)
      .orderBy('name')
      .execute();
    return rows.map(r => this.mapVendor(r));
  }

  async updateVendor(vendorId: string, input: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    const row = await this.db
      .updateTable('vendors')
      .set({ ...input, updated_at: new Date().toISOString() } as any)
      .where('id', '=', vendorId as any)
      .returningAll()
      .executeTakeFirst();
    return row ? this.mapVendor(row) : null;
  }

  async deleteVendor(vendorId: string): Promise<void> {
    await this.db
      .deleteFrom('vendors')
      .where('id', '=', vendorId as any)
      .execute();
  }

  async deleteVendorsBulk(vendorIds: string[]): Promise<void> {
    if (vendorIds.length === 0) return;
    await this.db
      .deleteFrom('vendors')
      .where('id', 'in', vendorIds as any)
      .execute();
  }

  async findBatchesByRestaurantId(restaurantId: RestaurantId): Promise<InventoryBatch[]> {
    const rows = await this.db
      .selectFrom('inventory_batches')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .orderBy('received_date', 'desc')
      .execute();
    return rows.map(r => ({
      id: r.id as any,
      restaurantId: r.restaurant_id as any,
      itemId: r.item_id as any,
      poId: r.po_id as any,
      receivedDate: r.received_date,
      initialQty: r.initial_qty,
      remainingQty: r.remaining_qty,
      landedUnitCost: r.landed_unit_cost,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async findBatchById(batchId: string): Promise<InventoryBatch | null> {
    const row = await this.db
      .selectFrom('inventory_batches')
      .selectAll()
      .where('id', '=', batchId as any)
      .executeTakeFirst();
    if (!row) return null;
    return {
      id: row.id as any,
      restaurantId: row.restaurant_id as any,
      itemId: row.item_id as any,
      poId: row.po_id as any,
      receivedDate: row.received_date,
      initialQty: row.initial_qty,
      remainingQty: row.remaining_qty,
      landedUnitCost: row.landed_unit_cost,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async createInventoryBatch(trx: unknown, input: CreateInventoryBatchInput): Promise<InventoryBatch> {
    const db = trx as Kysely<Database>;
    const row = await db
      .insertInto('inventory_batches')
      .values({
        id: asInventoryBatchId(randomUUID()),
        restaurant_id: input.restaurant_id,
        item_id: input.item_id as any,
        po_id: input.po_id,
        received_date: new Date().toISOString(),
        initial_qty: input.initial_qty,
        remaining_qty: input.remaining_qty,
        landed_unit_cost: input.landed_unit_cost,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
      
    return {
      id: asInventoryBatchId(row.id),
      restaurantId: asRestaurantId(row.restaurant_id),
      itemId: asItemId(row.item_id),
      poId: row.po_id ? asPurchaseOrderId(row.po_id) : null,
      receivedDate: row.received_date,
      initialQty: row.initial_qty,
      remainingQty: row.remaining_qty,
      landedUnitCost: row.landed_unit_cost,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
