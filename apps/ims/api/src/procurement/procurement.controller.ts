import {
  Controller, Get, Post, Patch, Delete, Param, Body, Inject,
  HttpCode, HttpStatus, NotFoundException, BadRequestException,
  UseInterceptors, UploadedFile, ParseFilePipeBuilder, Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProcurementService } from './procurement.service';
import { PROCUREMENT_SERVICE_TOKEN } from './interfaces/i-procurement.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PERMISSION_CODES } from '@synculariti/types';
import type { JwtPayload } from '@synculariti/types';
import {
  createVendorSchema,
  updateVendorSchema,
  createPoSchema,
  receivePoSchema,
  vendorBulkRowSchema,
  deleteVendorsBulkSchema,
} from '@synculariti/validators';
import type { CreateVendorDto, UpdateVendorDto, CreatePoDto, ReceivePoDto, DeleteVendorsBulkDto } from '@synculariti/validators';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import * as xlsx from 'xlsx';

@Controller('procurement')
export class ProcurementController {
  constructor(
    @Inject(PROCUREMENT_SERVICE_TOKEN) private readonly procurementService: ProcurementService,
  ) {}

  // ── Vendors ────────────────────────────────────────────────────────────────

  @Get('vendors')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_READ)
  async listVendors(@CurrentUser() user: JwtPayload) {
    const data = await this.procurementService.listVendors(user.restaurantId, user.franchiseGroupId);
    return { data };
  }

  @Post('vendors')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_WRITE)
  async createVendor(@CurrentUser() user: JwtPayload, @Body(new ZodValidationPipe(createVendorSchema)) dto: CreateVendorDto) {
    const data = await this.procurementService.createVendor(user.restaurantId, user.franchiseGroupId, dto);
    return { data };
  }

  @Get('vendors/:id')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_READ)
  async getVendor(@Param('id') id: string) {
    const data = await this.procurementService.getVendor(id as any);
    return { data };
  }

  @Patch('vendors/:id')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_WRITE)
  async updateVendor(@Param('id') id: string, @Body(new ZodValidationPipe(updateVendorSchema)) dto: UpdateVendorDto) {
    const data = await this.procurementService.updateVendor(id as any, dto);
    return { data };
  }

  @Delete('vendors/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_WRITE)
  async deleteVendor(@Param('id') id: string) {
    await this.procurementService.deleteVendor(id as any);
  }

  @Post('vendors/bulk-delete')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_WRITE)
  async deleteVendorsBulk(@Body(new ZodValidationPipe(deleteVendorsBulkSchema)) dto: DeleteVendorsBulkDto) {
    await this.procurementService.deleteVendorsBulk(dto.ids as any);
    return { data: null };
  }

  @Get('vendors/upload/template')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_WRITE)
  async downloadVendorTemplate(): Promise<string> {
    return 'name,contactEmail,isActive\nAcme Provisions,supplier@acme.com,true\n';
  }

  @Post('vendors/upload')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_WRITE)
  @UseInterceptors(FileInterceptor('file'))
  async uploadVendors(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(csv|xlsx|xls|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)/i,
          skipMagicNumbersValidation: true,
        })
        .addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    ) file: Express.Multer.File,
    @Req() req: import('express').Request,
  ) {
    const { restaurantId, franchiseGroupId } = (req as unknown as { user: JwtPayload }).user;

    const workbook = xlsx.read(file.buffer, { type: 'buffer', codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestException('Uploaded file contains no sheets');
    }
    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, string | number | undefined>[] = xlsx.utils.sheet_to_json(sheet);

    if (rawRows.length === 0) {
      throw new BadRequestException('Uploaded file contains no data rows');
    }

    const errors: Array<{ row: number; item: string; message: string }> = [];
    const validRows: Array<{ name: string; contactEmail?: string | null; isActive?: boolean }> = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNum = i + 2;
      const name = String(row['name'] ?? '').trim();
      const contactEmail = String(row['contactEmail'] ?? row['contact_email'] ?? '').trim() || null;
      const isActiveRaw = String(row['isActive'] ?? row['is_active'] ?? '').trim();

      if (!name) {
        errors.push({ row: rowNum, item: '', message: 'Missing name' });
        continue;
      }

      const parsed = vendorBulkRowSchema.safeParse({
        name,
        contactEmail: contactEmail || undefined,
        isActive: isActiveRaw ? isActiveRaw.toLowerCase() === 'true' : true,
      });

      if (!parsed.success) {
        const details = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
        const msg = Object.entries(details).map(([k, v]) => `${k}: ${(v ?? []).join(', ')}`).join('; ');
        errors.push({ row: rowNum, item: name, message: msg });
        continue;
      }

      validRows.push(parsed.data);
    }

    let createdCount = 0;
    if (validRows.length > 0) {
      const created = await this.procurementService.bulkCreateVendors(restaurantId, franchiseGroupId, validRows);
      createdCount = created.length;
    }

    return {
      totalRows: rawRows.length,
      createdCount,
      errorCount: errors.length,
      errors,
    };
  }

  // ── Purchase Orders ────────────────────────────────────────────────────────

  @Get('orders')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_READ)
  async listPOs(@CurrentUser() user: JwtPayload) {
    const data = await this.procurementService.listPOs(user.restaurantId);
    return { data };
  }

  @Post('orders')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_WRITE)
  async createPO(@CurrentUser() user: JwtPayload, @Body(new ZodValidationPipe(createPoSchema)) dto: CreatePoDto) {
    const data = await this.procurementService.createDraftPO(user.restaurantId, dto);
    return { data };
  }

  @Get('orders/:id')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_READ)
  async getPO(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const data = await this.procurementService.getPOById(id as any);
    return { data };
  }

  @Get('orders/:id/line-items')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_READ)
  async getPOLineItems(@Param('id') id: string) {
    const data = await this.procurementService.getLineItems(id as any);
    return { data };
  }

  @Patch('orders/:id/submit')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_WRITE)
  async submitPO(@Param('id') id: string) {
    const data = await this.procurementService.submitPO(id as any);
    return { data };
  }

  @Patch('orders/:id/receive')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_WRITE)
  async receivePO(@Param('id') id: string, @Body(new ZodValidationPipe(receivePoSchema)) dto: ReceivePoDto) {
    await this.procurementService.receivePO(id as any, dto);
    return { data: null };
  }

  @Patch('orders/:id/cancel')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_WRITE)
  async cancelPO(@Param('id') id: string) {
    await this.procurementService.cancelPO(id as any);
    return { data: null };
  }

  // ── Inventory Batches ──────────────────────────────────────────────────────

  @Get('batches')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_READ)
  async listBatches(@CurrentUser() user: JwtPayload) {
    const data = await this.procurementService.listBatches(user.restaurantId);
    return { data };
  }

  @Get('batches/:id')
  @RequirePermission(PERMISSION_CODES.PROCUREMENT_READ)
  async getBatch(@Param('id') id: string) {
    const data = await this.procurementService.getBatch(id);
    if (!data) throw new NotFoundException(`Batch ${id} not found`);
    return { data };
  }
}
