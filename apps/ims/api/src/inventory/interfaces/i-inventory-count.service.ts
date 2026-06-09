import type { InventoryCountBatch, InventoryCountRow, CountBatchId, CountRowId, RestaurantId } from '@synculariti/types';
import type { CloseCountBatchDto, SubmitCountRowDto } from '@synculariti/validators';
import type { ExportRow } from './i-inventory-count.repository';

export const INVENTORY_COUNT_SERVICE_TOKEN = Symbol('INVENTORY_COUNT_SERVICE_TOKEN');

export interface IInventoryCountService {
  startBatch(restaurantId: RestaurantId): Promise<InventoryCountBatch>;
  submitActualCount(batchId: CountBatchId, rowId: CountRowId, dto: SubmitCountRowDto): Promise<InventoryCountRow>;
  closeBatch(batchId: CountBatchId, dto: CloseCountBatchDto): Promise<void>;
  listBatches(restaurantId: RestaurantId): Promise<InventoryCountBatch[]>;
  findBatchById(batchId: CountBatchId): Promise<InventoryCountBatch | null>;
  findRowsByBatchId(batchId: CountBatchId): Promise<InventoryCountRow[]>;
  exportBatch(batchId: CountBatchId): Promise<ExportRow[]>;
  importBatch(batchId: CountBatchId, rows: { itemId: string; actualQty: number }[]): Promise<number>;
}
