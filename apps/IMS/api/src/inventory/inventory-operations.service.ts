import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { Kysely } from 'kysely';
import { sql } from 'kysely';
import { randomUUID } from 'crypto';

import type {
  Database,
  RestaurantId,
} from '@synculariti/types';
import { LEDGER_REASON_CODES, TRANSFER_STATUS, asRestaurantId, asItemId } from '@synculariti/types';
import type { CreateTransferDto, CreateWasteLogDto, CreatePrepLogDto, CreateOpeningBalanceDto } from '@synculariti/validators';

import { LEDGER_SERVICE_TOKEN, ILedgerService } from './interfaces/i-ledger.service';

export const INVENTORY_OPS_SERVICE_TOKEN = Symbol('IInventoryOpsService');

@Injectable()
export class InventoryOperationsService {
  constructor(
    @Inject('DB_CLIENT') private readonly db: Kysely<Database>,
    @Inject(LEDGER_SERVICE_TOKEN) private readonly ledger: ILedgerService,
  ) {}

  async createTransfer(dto: CreateTransferDto): Promise<any> {
    if (dto.originRestaurantId === dto.destinationRestaurantId) {
      throw new BadRequestException('Origin and destination must be different restaurants');
    }

    const id = randomUUID();
    await this.db
      .insertInto('inventory_transfers')
      .values({
        id: id as any,
        franchise_group_id: null as any,
        origin_restaurant_id: dto.originRestaurantId as any,
        destination_restaurant_id: dto.destinationRestaurantId as any,
        item_id: dto.itemId as any,
        qty: dto.qty,
        status: TRANSFER_STATUS.PENDING as any,
      })
      .execute();

    return this.getTransferById(id);
  }

  async listTransfers(restaurantId: RestaurantId): Promise<any[]> {
    return this.db
      .selectFrom('inventory_transfers')
      .selectAll()
      .where((eb) => eb.or([
        eb('origin_restaurant_id', '=', restaurantId as any),
        eb('destination_restaurant_id', '=', restaurantId as any),
      ]))
      .orderBy('created_at', 'desc')
      .execute();
  }

  async completeTransfer(transferId: string): Promise<void> {
    const [transfer] = await this.db
      .selectFrom('inventory_transfers')
      .selectAll()
      .where('id', '=', transferId as any)
      .execute();

    if (!transfer) throw new BadRequestException(`Transfer ${transferId} not found`);
    if (transfer.status !== TRANSFER_STATUS.PENDING) {
      throw new BadRequestException(`Transfer ${transferId} is already ${transfer.status}`);
    }

    await this.db.transaction().execute(async (trx) => {
      await trx
        .updateTable('inventory_transfers')
        .set({ status: TRANSFER_STATUS.COMPLETED as any, updated_at: new Date().toISOString() } as any)
        .where('id', '=', transferId as any)
        .execute();

      await this.ledger.record(trx, {
        restaurantId: asRestaurantId(transfer.origin_restaurant_id),
        itemId: asItemId(transfer.item_id),
        changeAmount: -transfer.qty,
        reasonCode: LEDGER_REASON_CODES.TRANSFER_OUT,
        referenceId: transferId,
      });

      await this.ledger.record(trx, {
        restaurantId: asRestaurantId(transfer.destination_restaurant_id),
        itemId: asItemId(transfer.item_id),
        changeAmount: transfer.qty,
        reasonCode: LEDGER_REASON_CODES.TRANSFER_IN,
        referenceId: transferId,
      });
    });
  }

  private async getTransferById(id: string): Promise<any | null> {
    const [row] = await this.db
      .selectFrom('inventory_transfers')
      .selectAll()
      .where('id', '=', id as any)
      .execute();
    return row || null;
  }

  // ── Opening Balance ────────────────────────────────────────────────────────

  async recordOpeningBalance(restaurantId: RestaurantId, dto: CreateOpeningBalanceDto): Promise<void> {
    const id = randomUUID();
    await this.db.transaction().execute(async (trx) => {
      await this.ledger.record(trx, {
        restaurantId,
        itemId: asItemId(dto.itemId),
        changeAmount: dto.quantity,
        reasonCode: LEDGER_REASON_CODES.OPENING_BALANCE,
        referenceId: id,
      });
    });
  }

  // ── Waste Logs ─────────────────────────────────────────────────────────────

  async createWasteLog(restaurantId: RestaurantId, dto: CreateWasteLogDto): Promise<any> {
    const id = randomUUID();
    await this.db.transaction().execute(async (trx) => {
      await trx
        .insertInto('waste_logs')
        .values({
          id: id as any,
          restaurant_id: restaurantId as any,
          item_id: dto.itemId as any,
          quantity: dto.quantity,
          reason: dto.reason || null,
          recorded_at: new Date().toISOString(),
        } as any)
        .execute();

      await this.ledger.record(trx, {
        restaurantId,
        itemId: asItemId(dto.itemId),
        changeAmount: -dto.quantity,
        reasonCode: LEDGER_REASON_CODES.WASTE,
        referenceId: id,
      });
    });

    const [row] = await this.db.selectFrom('waste_logs').selectAll().where('id', '=', id as any).execute();
    return row;
  }

  async listWasteLogs(restaurantId: RestaurantId): Promise<any[]> {
    return this.db
      .selectFrom('waste_logs')
      .selectAll()
      .where('restaurant_id', '=', restaurantId as any)
      .orderBy('recorded_at', 'desc')
      .execute();
  }

  // ── Prep Production Logs ──────────────────────────────────────────────────

  async createPrepLog(restaurantId: RestaurantId, dto: CreatePrepLogDto): Promise<any> {
    const id = randomUUID();
    await this.db.transaction().execute(async (trx) => {
      await trx
        .insertInto('prep_production_logs')
        .values({
          id: id as any,
          restaurant_id: restaurantId as any,
          prep_item_id: dto.prepItemId as any,
          yield_qty_produced: dto.yieldQtyProduced,
          produced_at: new Date().toISOString(),
        } as any)
        .execute();

      await this.ledger.record(trx, {
        restaurantId,
        itemId: asItemId(dto.prepItemId),
        changeAmount: dto.yieldQtyProduced,
        reasonCode: LEDGER_REASON_CODES.PREP_PRODUCTION,
        referenceId: id,
      });
    });

    const [row] = await this.db.selectFrom('prep_production_logs').selectAll().where('id', '=', id as any).execute();
    return row;
  }

  async listPrepLogs(restaurantId: RestaurantId): Promise<any[]> {
    return this.db
      .selectFrom('prep_production_logs')
      .selectAll()
      .where('restaurant_id', '=', restaurantId as any)
      .orderBy('produced_at', 'desc')
      .execute();
  }
}
