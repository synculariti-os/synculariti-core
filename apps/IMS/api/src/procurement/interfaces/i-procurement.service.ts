import type { PurchaseOrder, PurchaseOrderId } from '@synculariti/types';
import type { CreatePoDto, ReceivePoDto } from '@synculariti/validators';

export const PROCUREMENT_SERVICE_TOKEN = Symbol('PROCUREMENT_SERVICE_TOKEN');

export interface IProcurementService {
  createDraftPO(dto: CreatePoDto): Promise<PurchaseOrder>;
  submitPO(poId: PurchaseOrderId): Promise<PurchaseOrder>;
  receivePO(poId: PurchaseOrderId, dto: ReceivePoDto): Promise<void>;
  cancelPO(poId: PurchaseOrderId): Promise<void>;
}
