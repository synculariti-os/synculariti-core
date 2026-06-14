import type {
  InventoryCountBatch,
  InventoryCountRow,
  CountBatchId,
  CountRowId,
  RestaurantId,
} from '@synculariti/types';

export interface CreateCountRowInput {
  item_id: string;
  expected_qty: number;
}

export interface ExportRow extends InventoryCountRow {
  itemName: string;
}

export interface IInventoryCountRepository {
  createBatch(db: unknown, restaurantId: RestaurantId): Promise<InventoryCountBatch>;
  findBatchById(batchId: CountBatchId, restaurantId?: RestaurantId): Promise<InventoryCountBatch | null>;
  findOpenBatchByRestaurant(restaurantId: RestaurantId): Promise<InventoryCountBatch | null>;
  updateBatchStatus(
    trx: unknown,
    batchId: CountBatchId,
    status: string,
    version: number,
  ): Promise<boolean>; // returns false on optimistic lock failure
  findRowsByBatchId(batchId: CountBatchId, restaurantId?: RestaurantId): Promise<InventoryCountRow[]>;
  findRowsWithItemName(batchId: CountBatchId): Promise<ExportRow[]>;
  updateCountRow(
    db: unknown,
    rowId: CountRowId,
    actualQty: number,
  ): Promise<InventoryCountRow>;
  createCountRows(
    db: unknown,
    batchId: CountBatchId,
    rows: CreateCountRowInput[],
  ): Promise<void>;
  listBatches(restaurantId: RestaurantId): Promise<InventoryCountBatch[]>;
}
