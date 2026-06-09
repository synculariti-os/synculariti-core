import type { LedgerReasonCode, RestaurantId, ItemId, StockLevel } from '@synculariti/types';
import { LEDGER_REASON_CODES } from '@synculariti/types';

export interface LedgerEntryDto {
  restaurantId: RestaurantId;
  itemId: ItemId;
  changeAmount: number;
  reasonCode: LedgerReasonCode;
  referenceId?: string | null;
}
