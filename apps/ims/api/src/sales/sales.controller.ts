import { Controller, Post, UseInterceptors, UploadedFile, Body, Req, Inject, ParseFilePipeBuilder, HttpStatus, Get, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SALES_SERVICE_TOKEN, ISalesService } from './interfaces/i-sales.service';
import { uploadSalesFileDtoSchema, UploadSalesFileDto, listBatchesQuerySchema } from '@synculariti/validators';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { PERMISSION_CODES, JwtPayload } from '@synculariti/types';

@Controller('sales-imports')
export class SalesController {
  constructor(
    @Inject(SALES_SERVICE_TOKEN) private readonly salesService: ISalesService,
  ) {}

  @Post('upload')
  @RequirePermission(PERMISSION_CODES.SALES_IMPORT)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(csv|xlsx|xls|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)/i,
          skipMagicNumbersValidation: true,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024, // 10MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    ) file: Express.Multer.File,
    @Body() body: Record<string, unknown>,
    @Req() req: import('express').Request,
  ) {
    const dto = uploadSalesFileDtoSchema.parse(body);
    const { restaurantId, franchiseGroupId, sub } = (req as unknown as { user: JwtPayload }).user;

    const batch = await this.salesService.uploadSalesFile(file, dto, restaurantId, franchiseGroupId, sub);
    
    return batch;
  }

  @Post('pos-upload')
  @RequirePermission(PERMISSION_CODES.SALES_IMPORT)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPosFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(csv|xlsx|xls|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)/i,
          skipMagicNumbersValidation: true,
        })
        .addMaxSizeValidator({
          maxSize: 10 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    ) file: Express.Multer.File,
    @Body() body: Record<string, unknown>,
    @Req() req: import('express').Request,
  ) {
    const dto = uploadSalesFileDtoSchema.parse(body);
    const { restaurantId, sub } = (req as unknown as { user: JwtPayload }).user;

    const batch = await this.salesService.uploadPosFile(file, dto, restaurantId, sub);
    
    return batch;
  }

  @Post(':batchId/process')
  @RequirePermission(PERMISSION_CODES.SALES_IMPORT)
  async processPosBatch(
    @Param('batchId', ParseUUIDPipe) batchId: string,
    @Req() req: import('express').Request,
  ) {
    const { restaurantId, franchiseGroupId } = (req as unknown as { user: JwtPayload }).user;

    const result = await this.salesService.processPosBatch(batchId, restaurantId, franchiseGroupId);
    
    return result;
  }

  @Get()
  @RequirePermission(PERMISSION_CODES.SALES_IMPORT)
  async listBatches(
    @Req() req: import('express').Request,
    @Query(new ZodValidationPipe(listBatchesQuerySchema)) query: import('@synculariti/validators').ListBatchesQueryDto
  ) {
    const { restaurantId } = (req as unknown as { user: JwtPayload }).user;
    return this.salesService.listBatches(restaurantId, query.page, query.limit);
  }
}
