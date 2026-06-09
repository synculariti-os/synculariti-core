import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import type { Kysely } from 'kysely';

import type {
  Database,
  PurchaseOrder,
  PurchaseOrderId,
  RestaurantId,
  VendorId,
  InventoryBatch,
} from '@synculariti/types';
import { PURCHASE_ORDER_STATUS, LEDGER_REASON_CODES } from '@synculariti/types';
import type { CreatePoDto, ReceivePoDto, CreateVendorDto, UpdateVendorDto } from '@synculariti/validators';

import type { IProcurementRepository } from './interfaces/i-procurement.repository';
import type { ILedgerService } from '../inventory/interfaces/i-ledger.service';
import type { IItemReadService } from '../item/interfaces/i-item.service';
import { LEDGER_SERVICE_TOKEN } from '../inventory/interfaces/i-ledger.service';
import { ITEM_READ_SERVICE_TOKEN } from '../item/interfaces/i-item.service';

export const PROCUREMENT_REPOSITORY_TOKEN = Symbol('IProcurementRepository');

@Injectable()
export class ProcurementService {
  constructor(
    @Inject('DB_CLIENT')
    private readonly db: Kysely<Database>,
    @Inject(PROCUREMENT_REPOSITORY_TOKEN)
    private readonly procurementRepo: IProcurementRepository,
    @Inject(LEDGER_SERVICE_TOKEN) private readonly ledger: ILedgerService,
    @Inject(ITEM_READ_SERVICE_TOKEN) private readonly itemService: IItemReadService,
  ) {}

  async createDraftPO(restaurantId: RestaurantId, dto: CreatePoDto): Promise<PurchaseOrder> {
    return this.procurementRepo.createPO(restaurantId, dto);
  }

  async submitPO(poId: PurchaseOrderId): Promise<PurchaseOrder> {
    const po = await this.findOrThrow(poId);

    if (po.status !== PURCHASE_ORDER_STATUS.DRAFT) {
      throw new BadRequestException(
        `PO ${poId} cannot be submitted — current status is ${po.status}`,
      );
    }

    return this.procurementRepo.updatePOStatus(poId, PURCHASE_ORDER_STATUS.SUBMITTED);
  }

  async receivePO(poId: PurchaseOrderId, dto: ReceivePoDto): Promise<void> {
    const po = await this.findOrThrow(poId);

    if (po.status === PURCHASE_ORDER_STATUS.RECEIVED) {
      throw new ConflictException(`PO ${poId} has already been received`);
    }

    if (po.status !== PURCHASE_ORDER_STATUS.SUBMITTED) {
      throw new BadRequestException(
        `PO ${poId} cannot be received — current status is ${po.status}`,
      );
    }

    const lineItems = await this.procurementRepo.findLineItemsByPOId(poId);
    const lineCount = lineItems.length || 1;
    const proratedFreight = po.freightCharge / lineCount;

    await this.db.transaction().execute(async (trx) => {
      for (const receiveLine of dto.lineItems) {
        const lineItem = lineItems.find((l) => l.itemId === receiveLine.itemId);
        if (!lineItem) continue;

        const landedUnitCost = lineItem.rawUnitPrice + proratedFreight / lineItem.quantityOrdered;

        // 1. Update quantity received on the line item
        await this.procurementRepo.updateLineItemReceived(
          trx,
          lineItem.id,
          receiveLine.quantityReceived,
        );

        // 2. Create FIFO inventory batch
        await this.procurementRepo.createInventoryBatch(trx, {
          restaurant_id: po.restaurantId,
          item_id: lineItem.itemId,
          po_id: poId,
          initial_qty: receiveLine.quantityReceived,
          remaining_qty: receiveLine.quantityReceived,
          landed_unit_cost: landedUnitCost,
        });

        // 3. Write ledger entry — only via LedgerService
        await this.ledger.record(trx, {
          restaurantId: po.restaurantId,
          itemId: lineItem.itemId,
          changeAmount: receiveLine.quantityReceived,
          reasonCode: LEDGER_REASON_CODES.PO_RECEIPT,
          referenceId: poId,
        });
      }

      // 4. Update PO status
      await this.procurementRepo.updatePOStatus(poId, PURCHASE_ORDER_STATUS.RECEIVED);
    });
  }

  async cancelPO(poId: PurchaseOrderId): Promise<void> {
    const po = await this.findOrThrow(poId);

    if (po.status === PURCHASE_ORDER_STATUS.RECEIVED) {
      throw new ConflictException(`PO ${poId} cannot be cancelled — it has already been received`);
    }

    if (po.status === PURCHASE_ORDER_STATUS.CANCELLED) {
      throw new ConflictException(`PO ${poId} is already cancelled`);
    }

    await this.procurementRepo.updatePOStatus(poId, PURCHASE_ORDER_STATUS.CANCELLED);
  }

  async listPOs(restaurantId: RestaurantId): Promise<PurchaseOrder[]> {
    return this.procurementRepo.findPOsByRestaurantId(restaurantId);
  }

  async getLineItems(poId: PurchaseOrderId) {
    return this.procurementRepo.findLineItemsByPOId(poId);
  }

  async bulkCreateVendors(
    restaurantId: RestaurantId,
    franchiseGroupId: string | null,
    rows: Array<{ name: string; contactEmail?: string | null; isActive?: boolean }>,
  ): Promise<any[]> {
    const inputs: Record<string, unknown>[] = rows.map((row) => {
      const input: Record<string, unknown> = {
        name: row.name,
        contact_email: row.contactEmail || null,
        is_active: row.isActive ?? true,
      };
      if (restaurantId) {
        input.restaurant_id = restaurantId;
      } else if (franchiseGroupId) {
        input.franchise_group_id = franchiseGroupId;
      }
      return input;
    });

    return this.procurementRepo.createVendorsBulk(inputs);
  }

  async createVendor(restaurantId: RestaurantId, franchiseGroupId: string | null, dto: CreateVendorDto): Promise<any> {
    const data: Record<string, unknown> = {
      name: dto.name,
      contact_email: dto.contactEmail || null,
      is_active: dto.isActive ?? true,
    };
    if (dto.restaurantId) {
      data.restaurant_id = dto.restaurantId;
    } else if (dto.franchiseGroupId) {
      data.franchise_group_id = dto.franchiseGroupId;
    } else if (franchiseGroupId) {
      // fallback to user's franchise group if neither specified
      data.franchise_group_id = franchiseGroupId;
    }
    return this.procurementRepo.createVendor(data);
  }

  async listVendors(restaurantId: RestaurantId, franchiseGroupId: string | null): Promise<any[]> {
    if (franchiseGroupId) {
      const fgVendors = await this.procurementRepo.findVendorsByScopedId('franchise_group_id', franchiseGroupId);
      const rVendors = await this.procurementRepo.findVendorsByScopedId('restaurant_id', restaurantId);
      return [...fgVendors, ...rVendors];
    }
    return this.procurementRepo.findVendorsByScopedId('restaurant_id', restaurantId);
  }

  async getVendor(vendorId: VendorId): Promise<any> {
    const vendor = await this.procurementRepo.findVendorById(vendorId);
    if (!vendor) throw new NotFoundException(`Vendor ${vendorId} not found`);
    return vendor;
  }

  async updateVendor(vendorId: VendorId, dto: UpdateVendorDto): Promise<any> {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.contactEmail !== undefined) data.contact_email = dto.contactEmail;
    if (dto.isActive !== undefined) data.is_active = dto.isActive;
    const updated = await this.procurementRepo.updateVendor(vendorId, data);
    if (!updated) throw new NotFoundException(`Vendor ${vendorId} not found`);
    return updated;
  }

  async deleteVendor(vendorId: VendorId): Promise<void> {
    const vendor = await this.procurementRepo.findVendorById(vendorId);
    if (!vendor) throw new NotFoundException(`Vendor ${vendorId} not found`);
    await this.procurementRepo.deleteVendor(vendorId);
  }

  async deleteVendorsBulk(vendorIds: VendorId[]): Promise<void> {
    const existing = await Promise.all(
      vendorIds.map((id) => this.procurementRepo.findVendorById(id)),
    );
    const validIds = vendorIds.filter((_, i) => existing[i] !== null);
    if (validIds.length === 0) return;
    await this.procurementRepo.deleteVendorsBulk(validIds);
  }

  async listBatches(restaurantId: RestaurantId): Promise<InventoryBatch[]> {
    return this.procurementRepo.findBatchesByRestaurantId(restaurantId);
  }

  async getBatch(batchId: string): Promise<InventoryBatch | null> {
    return this.procurementRepo.findBatchById(batchId);
  }

  async getPOById(poId: PurchaseOrderId): Promise<PurchaseOrder> {
    return this.findOrThrow(poId);
  }

  private async findOrThrow(poId: PurchaseOrderId): Promise<PurchaseOrder> {
    const po = await this.procurementRepo.findPOById(poId);
    if (!po) {
      throw new NotFoundException(`Purchase order ${poId} not found`);
    }
    return po;
  }
}
