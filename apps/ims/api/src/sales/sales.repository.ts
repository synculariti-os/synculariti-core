import { Injectable, Inject } from '@nestjs/common';
import { ISalesRepository } from './interfaces/i-sales.repository';
import { Kysely } from 'kysely';
import { v4 as uuidv4 } from 'uuid';
import {
  Database, SalesImportBatchId, SalesImportRowId, PosRawImportId, PosRawImportInsert,
  asRestaurantId, asSalesImportBatchId,
} from '@synculariti/types';

@Injectable()
export class SalesRepository implements ISalesRepository {
  constructor(@Inject('DB_CLIENT') private readonly db: Kysely<Database>) {}

  async createBatch(data: {
    restaurantId: string;
    businessDate: string;
    fileUrl: string;
    storagePath?: string;
    uploadedBy: string;
    originalFileName?: string;
    totalRows?: number;
  }): Promise<{ id: string; status: string; restaurantId: string; businessDate: string }> {
    const [batch] = await this.db
      .insertInto('sales_import_batches')
      .values({
        id: uuidv4() as SalesImportBatchId,
        restaurant_id: asRestaurantId(data.restaurantId),
        business_date: data.businessDate,
        status: 'PENDING',
        file_url: data.fileUrl,
        storage_path: data.storagePath || null,
        uploaded_by: data.uploadedBy as any,
        original_file_name: data.originalFileName || null,
        total_rows: data.totalRows || null,
      })
      .returningAll()
      .execute();

    return {
      id: batch.id,
      status: batch.status,
      restaurantId: batch.restaurant_id,
      businessDate: batch.business_date,
    };
  }

  async updateBatchStatus(batchId: string, status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED', errorMessage?: string): Promise<void> {
    await this.db
      .updateTable('sales_import_batches')
      .set({ status, error_message: errorMessage || null, updated_at: new Date().toISOString() })
      .where('id', '=', asSalesImportBatchId(batchId))
      .execute();
  }

  async updateBatchAfterUpload(batchId: string, data: { importedRows: number }): Promise<void> {
    await this.db
      .updateTable('sales_import_batches')
      .set({ imported_rows: data.importedRows, status: 'COMPLETED', updated_at: new Date().toISOString() })
      .where('id', '=', asSalesImportBatchId(batchId))
      .execute();
  }

  async insertImportRows(trx: Kysely<Database>, rows: { batchId: string, rawItemName: string, quantitySold: number, isMapped: boolean }[]): Promise<void> {
    if (rows.length === 0) return;
    await trx
      .insertInto('sales_import_rows')
      .values(
        rows.map(row => ({
          id: uuidv4() as SalesImportRowId,
          batch_id: row.batchId as SalesImportBatchId,
          raw_item_name: row.rawItemName,
          quantity_sold: row.quantitySold,
          is_mapped: row.isMapped,
        }))
      )
      .execute();
  }

  async insertPosRawImports(trx: Kysely<Database>, rows: PosRawImportInsert[]): Promise<void> {
    if (rows.length === 0) return;
    await trx
      .insertInto('pos_raw_imports')
      .values(rows.map(r => ({ ...r, id: uuidv4() as PosRawImportId })))
      .execute();
  }

  async findBatchById(batchId: string): Promise<import('@synculariti/types').SalesImportBatch | null> {
    const row = await this.db
      .selectFrom('sales_import_batches')
      .selectAll()
      .where('id', '=', asSalesImportBatchId(batchId))
      .executeTakeFirst();

    if (!row) return null;

    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      businessDate: row.business_date,
      status: row.status,
      errorMessage: row.error_message,
      fileUrl: row.file_url,
      storagePath: row.storage_path,
      uploadedBy: row.uploaded_by,
      originalFileName: row.original_file_name,
      totalRows: row.total_rows,
      importedRows: row.imported_rows,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async listBatches(restaurantId: string, page: number, limit: number): Promise<{ data: import('@synculariti/types').SalesImportBatch[], total: number }> {
    const offset = (page - 1) * limit;

    const [data, totalResult] = await Promise.all([
      this.db
        .selectFrom('sales_import_batches')
        .selectAll()
        .where('restaurant_id', '=', asRestaurantId(restaurantId))
        .orderBy('created_at', 'desc')
        .offset(offset)
        .limit(limit)
        .execute(),
      this.db
        .selectFrom('sales_import_batches')
        .select(this.db.fn.count<string>('id').as('total'))
        .where('restaurant_id', '=', asRestaurantId(restaurantId))
        .executeTakeFirst()
    ]);

    return {
      data: data.map(row => ({
        id: row.id,
        status: row.status,
        restaurantId: row.restaurant_id,
        businessDate: row.business_date,
        errorMessage: row.error_message,
        fileUrl: row.file_url,
        storagePath: row.storage_path,
        uploadedBy: row.uploaded_by,
        originalFileName: row.original_file_name,
        totalRows: row.total_rows,
        importedRows: row.imported_rows,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      total: totalResult?.total ? parseInt(totalResult.total, 10) : 0,
    };
  }
}
