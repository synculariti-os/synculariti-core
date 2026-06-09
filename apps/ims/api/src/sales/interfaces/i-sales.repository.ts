export const SALES_REPOSITORY_TOKEN = Symbol('SALES_REPOSITORY_TOKEN');

export interface ISalesRepository {
  createBatch(data: {
    restaurantId: string;
    businessDate: string;
    fileUrl: string;
    storagePath?: string;
    uploadedBy: string;
    originalFileName?: string;
    totalRows?: number;
  }): Promise<{ id: string; status: string; restaurantId: string; businessDate: string }>;
  updateBatchStatus(batchId: string, status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED', errorMessage?: string): Promise<void>;
  updateBatchAfterUpload(batchId: string, data: { importedRows: number }): Promise<void>;
  insertImportRows(trx: import('kysely').Kysely<import('@synculariti/types').Database>, rows: { batchId: string, rawItemName: string, quantitySold: number, isMapped: boolean }[]): Promise<void>;
  insertPosRawImports(trx: import('kysely').Kysely<import('@synculariti/types').Database>, rows: import('@synculariti/types').PosRawImportInsert[]): Promise<void>;
  findBatchById(batchId: string): Promise<import('@synculariti/types').SalesImportBatch | null>;
  listBatches(restaurantId: string, page: number, limit: number): Promise<{ data: import('@synculariti/types').SalesImportBatch[], total: number }>;
}
