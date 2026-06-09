import { Injectable, Inject, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ISalesService } from './interfaces/i-sales.service';
import { ISalesRepository, SALES_REPOSITORY_TOKEN } from './interfaces/i-sales.repository';
import { IRecipeService, RECIPE_SERVICE_TOKEN } from '../recipe/interfaces/i-recipe.service';
import { ILedgerService, LEDGER_SERVICE_TOKEN } from '../inventory/interfaces/i-ledger.service';
import { IStorageService, STORAGE_SERVICE_TOKEN } from './interfaces/i-storage.service';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import * as xlsx from 'xlsx';
import { Kysely } from 'kysely';
import { Database, asRestaurantId, asRecipeId, asItemId, PosRawImportInsert } from '@synculariti/types';

const POS_HEADER_MAP: Record<string, string> = {
  'PLU': 'plu',
  'Charakteristika 1': 'charakteristika_1',
  'Charakteristika 2': 'charakteristika_2',
  'Čiarový kód': 'barcode',
  'Názov': 'nazov',
  'Typ PLU (č)': 'plu_type_number',
  'Typ PLU (text)': 'plu_type_text',
  'Číslo skupiny': 'group_number',
  'Názov skupiny': 'group_name',
  'Číslo prevádzky': 'outlet_number',
  'Názov prevádzky': 'outlet_name',
  'Množstvo': 'quantity',
  'MJ': 'uom',
  'Celkom bez DPH': 'total_price_excl_vat',
  'Celkom s DPH': 'total_price_incl_vat',
  'Celkové náklady': 'total_cogs',
  'Pôvodná cena s DPH': 'original_price_incl_vat',
  'Zľava celkom': 'total_discount',
  'Voliteľný text 1': 'optional_text_1',
  'Voliteľný text 2': 'optional_text_2',
  'Voliteľný text 3': 'optional_text_3',
};

@Injectable()
export class SalesService implements ISalesService {
  constructor(
    @Inject(SALES_REPOSITORY_TOKEN) private readonly repo: ISalesRepository,
    @Inject(getQueueToken('sales_import')) private readonly salesQueue: Queue,
    @Inject('SUPABASE_ADMIN_CLIENT') private readonly supabase: SupabaseClient,
    @Inject(RECIPE_SERVICE_TOKEN) private readonly recipeService: IRecipeService,
    @Inject(LEDGER_SERVICE_TOKEN) private readonly ledgerService: ILedgerService,
    @Inject(STORAGE_SERVICE_TOKEN) private readonly storageService: IStorageService,
    @Inject('DB_CLIENT') private readonly db: Kysely<Database>,
  ) {}

  async uploadSalesFile(file: Express.Multer.File, dto: { businessDate: string }, restaurantId: string, franchiseId: string, userId: string): Promise<{ batchId: string }> {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${restaurantId}/${dto.businessDate}-${uuidv4()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('sales_raw_uploads')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      throw new InternalServerErrorException(uploadError.message);
    }

    const { data: urlData } = this.supabase.storage
      .from('sales_raw_uploads')
      .getPublicUrl(fileName);

    const batch = await this.repo.createBatch({
      restaurantId,
      businessDate: dto.businessDate,
      fileUrl: urlData.publicUrl,
      uploadedBy: userId,
    });

    await this.salesQueue.add('process-sales', { batchId: batch.id, restaurantId, franchiseId, filePath: fileName });

    return { batchId: batch.id };
  }

  async uploadPosFile(file: Express.Multer.File, dto: { businessDate: string }, restaurantId: string, userId: string): Promise<{ batchId: string }> {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `pos/${restaurantId}/${dto.businessDate}-${uuidv4()}.${fileExt}`;

    const { error: uploadError } = await this.supabase.storage
      .from('sales_raw_uploads')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      throw new InternalServerErrorException(uploadError.message);
    }

    const { data: urlData } = this.supabase.storage
      .from('sales_raw_uploads')
      .getPublicUrl(fileName);

    const workbook = xlsx.read(file.buffer, { type: 'buffer', codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, string | number | undefined>[] = xlsx.utils.sheet_to_json(sheet);
    const totalRows = rawRows.length;

    const batch = await this.repo.createBatch({
      restaurantId,
      businessDate: dto.businessDate,
      fileUrl: urlData.publicUrl,
      storagePath: fileName,
      uploadedBy: userId,
      originalFileName: file.originalname,
      totalRows,
    });

    return { batchId: batch.id };
  }

  async processPosBatch(batchId: string, restaurantId: string, franchiseGroupId: string): Promise<{ importedRows: number }> {
    const batch = await this.repo.findBatchById(batchId);
    if (!batch) throw new NotFoundException(`Batch ${batchId} not found`);
    if (batch.status !== 'PENDING') throw new BadRequestException(`Batch is in status ${batch.status}, expected PENDING`);

    await this.repo.updateBatchStatus(batchId, 'PROCESSING');

    if (!batch.storagePath) throw new BadRequestException('Batch has no storage path');

    try {
      const localFilePath = await this.storageService.downloadFile(batch.storagePath);
      const workbook = xlsx.readFile(localFilePath, { codepage: 65001 });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawRows: Record<string, string | number | undefined>[] = xlsx.utils.sheet_to_json(sheet);

      const mappedRows = rawRows.map(row => this.mapPosRow(row, batchId));
      const nonAnomalyRows = mappedRows.filter(r => (r.nazov?.trim().length ?? 0) > 0 && r.quantity !== 0);

      await this.db.transaction().execute(async (trx) => {
        await this.repo.insertPosRawImports(trx, mappedRows);

        const rawItemNames = [...new Set(nonAnomalyRows.map(r => r.nazov!.trim()))];
        const mappings = await this.recipeService.resolveRecipesByPosStrings(
          asRestaurantId(restaurantId),
          rawItemNames,
        );
        const mappingDict = new Map<string, string>();
        mappings.forEach(m => mappingDict.set(m.rawExcelString, m.recipeId));

        const rowsToInsert = nonAnomalyRows.map(r => ({
          batchId,
          rawItemName: r.nazov.trim(),
          quantitySold: r.quantity,
          isMapped: mappingDict.has(r.nazov.trim()),
          recipeId: mappingDict.get(r.nazov.trim()) || null,
        }));

        const depletionTasks: { itemId: string; consumedQty: number }[] = [];
        for (const row of rowsToInsert) {
          if (row.recipeId) {
            const bomExpansion = await this.recipeService.expandBOM(asRecipeId(row.recipeId), row.quantitySold);
            for (const item of bomExpansion) {
              depletionTasks.push({ itemId: item.itemId, consumedQty: item.consumedQty });
            }
          }
        }

        await this.repo.insertImportRows(trx, rowsToInsert);

        for (const task of depletionTasks) {
          await this.ledgerService.record(trx, {
            restaurantId: asRestaurantId(restaurantId),
            itemId: asItemId(task.itemId),
            changeAmount: -task.consumedQty,
            reasonCode: 'SALES_DEPLETION',
            referenceId: batchId,
          });
        }
      });

      await this.repo.updateBatchAfterUpload(batchId, { importedRows: nonAnomalyRows.length });

      return { importedRows: nonAnomalyRows.length };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      await this.repo.updateBatchStatus(batchId, 'FAILED', msg);
      throw error;
    }
  }

  async listBatches(restaurantId: string, page: number, limit: number): Promise<{ data: import('@synculariti/types').SalesImportBatch[], meta: import('@synculariti/types').PaginationMeta }> {
    const { data, total } = await this.repo.listBatches(restaurantId, page, limit);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  private mapPosRow(row: Record<string, string | number | undefined>, batchId: string): PosRawImportInsert {
    const mapped: Record<string, unknown> = { batch_id: batchId as any, nazov: '', quantity: 0 };
    for (const [slovakHeader, engField] of Object.entries(POS_HEADER_MAP)) {
      const val = row[slovakHeader];
      if (val !== undefined && val !== null) {
        if (typeof val === 'number') {
          mapped[engField] = val;
        } else {
          const str = String(val).trim();
          mapped[engField] = str.length > 0 ? str : null;
        }
      }
    }
    const rawJson: Record<string, unknown> = {};
    for (const key of Object.keys(row)) {
      rawJson[key] = row[key];
    }
    mapped.raw_json = rawJson;
    return mapped as unknown as PosRawImportInsert;
  }
}
