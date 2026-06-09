import type {
  PurchaseOrder,
  PoLineItem,
  InventoryBatch,
  PurchaseOrderId,
  RestaurantId,
} from '@synculariti/types';
import type { CreatePoDto } from '@synculariti/validators';

export interface CreateInventoryBatchInput {
  restaurant_id: RestaurantId;
  item_id: string;
  po_id: PurchaseOrderId;
  initial_qty: number;
  remaining_qty: number;
  landed_unit_cost: number;
}

export interface IProcurementRepository {
  createPO(restaurantId: RestaurantId, dto: CreatePoDto): Promise<PurchaseOrder>;
  findPOById(poId: PurchaseOrderId): Promise<PurchaseOrder | null>;
  findPOsByRestaurantId(restaurantId: RestaurantId): Promise<PurchaseOrder[]>;
  updatePOStatus(poId: PurchaseOrderId, status: string): Promise<PurchaseOrder>;
  findLineItemsByPOId(poId: PurchaseOrderId): Promise<PoLineItem[]>;
  updateLineItemReceived(trx: unknown, lineItemId: string, qty: number): Promise<void>;
  createInventoryBatch(trx: unknown, input: CreateInventoryBatchInput): Promise<InventoryBatch>;
  createVendor(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  createVendorsBulk(inputs: Record<string, unknown>[]): Promise<Record<string, unknown>[]>;
  findVendorById(vendorId: string): Promise<Record<string, unknown> | null>;
  findVendorsByScopedId(scopeField: string, scopeValue: string): Promise<Record<string, unknown>[]>;
  updateVendor(vendorId: string, input: Record<string, unknown>): Promise<Record<string, unknown> | null>;
  deleteVendor(vendorId: string): Promise<void>;
  deleteVendorsBulk(vendorIds: string[]): Promise<void>;
  findBatchesByRestaurantId(restaurantId: RestaurantId): Promise<InventoryBatch[]>;
  findBatchById(batchId: string): Promise<InventoryBatch | null>;
}
