export const SALES_SERVICE_TOKEN = Symbol('SALES_SERVICE_TOKEN');

export interface ISalesService {
  uploadSalesFile(
    file: Express.Multer.File,
    dto: { businessDate: string },
    restaurantId: string,
    franchiseId: string,
    userId: string,
  ): Promise<{ batchId: string }>;
  listBatches(restaurantId: string, page: number, limit: number): Promise<{ data: import('@synculariti/types').SalesImportBatch[], meta: import('@synculariti/types').PaginationMeta }>;
  uploadPosFile(
    file: Express.Multer.File,
    dto: { businessDate: string },
    restaurantId: string,
    userId: string,
  ): Promise<{ batchId: string }>;
  processPosBatch(
    batchId: string,
    restaurantId: string,
    franchiseGroupId: string,
  ): Promise<{ importedRows: number }>;
}
