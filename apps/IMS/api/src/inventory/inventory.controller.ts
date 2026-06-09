import {
  Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, Inject,
  UseGuards, UseInterceptors, Res, HttpCode, HttpStatus,
  UploadedFile, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { TenantContextInterceptor } from '../common/interceptors/tenant-context.interceptor';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PERMISSION_CODES } from '@synculariti/types';
import type { JwtPayload } from '@synculariti/types';
import { LEDGER_SERVICE_TOKEN, ILedgerService } from './interfaces/i-ledger.service';
import { INVENTORY_COUNT_SERVICE_TOKEN, IInventoryCountService } from './interfaces/i-inventory-count.service';
import { INVENTORY_OPS_SERVICE_TOKEN, InventoryOperationsService } from './inventory-operations.service';
import {
  createTransferSchema,
  submitCountRowSchema,
  closeCountBatchSchema,
  createWasteLogSchema,
  createPrepLogSchema,
  createOpeningBalanceSchema,
} from '@synculariti/validators';
import type { CreateTransferDto, SubmitCountRowDto, CloseCountBatchDto, CreateWasteLogDto, CreatePrepLogDto, CreateOpeningBalanceDto } from '@synculariti/validators';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('inventory')
@UseGuards(SupabaseAuthGuard, PermissionsGuard)
@UseInterceptors(TenantContextInterceptor)
export class InventoryController {
  constructor(
    @Inject(LEDGER_SERVICE_TOKEN) private readonly ledgerService: ILedgerService,
    @Inject(INVENTORY_COUNT_SERVICE_TOKEN) private readonly countService: IInventoryCountService,
    @Inject(INVENTORY_OPS_SERVICE_TOKEN) private readonly opsService: InventoryOperationsService,
  ) {}

  // ── Stock / Ledger (existing) ──────────────────────────────────────────────

  @Get('stock')
  @RequirePermission(PERMISSION_CODES.INVENTORY_READ)
  async getStock(@CurrentUser() user: JwtPayload) {
    const data = await this.ledgerService.getCurrentStockBulk(user.restaurantId);
    return { data };
  }

  @Get('ledger')
  @RequirePermission(PERMISSION_CODES.INVENTORY_READ)
  async getLedger(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? Number(limit) : 50;
    const offsetNum = offset ? Number(offset) : 0;
    const data = await this.ledgerService.getLedgerEntries(user.restaurantId, limitNum, offsetNum);
    return { data };
  }

  // ── Opening Balance ─────────────────────────────────────────────────────────

  @Post('adjustment')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSION_CODES.INVENTORY_WRITE)
  async recordOpeningBalance(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createOpeningBalanceSchema)) dto: CreateOpeningBalanceDto,
  ) {
    await this.opsService.recordOpeningBalance(user.restaurantId, dto);
    return { data: null };
  }

  // ── Transfers ──────────────────────────────────────────────────────────────

  @Post('transfers')
  @RequirePermission(PERMISSION_CODES.INVENTORY_WRITE)
  async createTransfer(@Body(new ZodValidationPipe(createTransferSchema)) dto: CreateTransferDto) {
    const data = await this.opsService.createTransfer(dto);
    return { data };
  }

  @Get('transfers')
  @RequirePermission(PERMISSION_CODES.INVENTORY_READ)
  async listTransfers(@CurrentUser() user: JwtPayload) {
    const data = await this.opsService.listTransfers(user.restaurantId);
    return { data };
  }

  @Patch('transfers/:id/complete')
  @RequirePermission(PERMISSION_CODES.INVENTORY_WRITE)
  async completeTransfer(@Param('id') id: string) {
    await this.opsService.completeTransfer(id as any);
    return { data: null };
  }

  // ── Counts ──────────────────────────────────────────────────────────────────

  @Post('counts/start')
  @RequirePermission(PERMISSION_CODES.INVENTORY_COUNT)
  async startCount(@CurrentUser() user: JwtPayload) {
    const data = await this.countService.startBatch(user.restaurantId);
    return { data };
  }

  @Get('counts')
  @RequirePermission(PERMISSION_CODES.INVENTORY_READ)
  async listCountBatches(@CurrentUser() user: JwtPayload) {
    const data = await this.countService.listBatches(user.restaurantId);
    return { data };
  }

  @Get('counts/:batchId/rows')
  @RequirePermission(PERMISSION_CODES.INVENTORY_READ)
  async getCountRows(@Param('batchId') batchId: string) {
    const batch = await this.countService.findBatchById(batchId as any);
    const data = batch ? await this.countService.findRowsByBatchId(batchId as any) : [];
    return { data };
  }

  @Put('counts/:batchId/rows/:rowId')
  @RequirePermission(PERMISSION_CODES.INVENTORY_COUNT)
  async submitCountRow(
    @Param('batchId') batchId: string,
    @Param('rowId') rowId: string,
    @Body(new ZodValidationPipe(submitCountRowSchema)) dto: SubmitCountRowDto,
  ) {
    const data = await this.countService.submitActualCount(batchId as any, rowId as any, dto);
    return { data };
  }

  @Post('counts/:batchId/close')
  @RequirePermission(PERMISSION_CODES.INVENTORY_COUNT)
  async closeCountBatch(
    @Param('batchId') batchId: string,
    @Body(new ZodValidationPipe(closeCountBatchSchema)) dto: CloseCountBatchDto,
  ) {
    const batch = await this.countService.findBatchById(batchId as any);
    if (!batch) throw new NotFoundException(`Count batch ${batchId} not found`);
    if (batch.status === 'CLOSED') throw new BadRequestException('Count batch is already closed');
    await this.countService.closeBatch(batchId as any, dto);
    return { data: { closed: true } };
  }

  @Get('counts/:batchId/export')
  @RequirePermission(PERMISSION_CODES.INVENTORY_READ)
  async exportCountCSV(@Param('batchId') batchId: string, @Res() res: Response) {
    const rows = await this.countService.exportBatch(batchId as any);

    const header = 'Item Name,Item ID,Expected Qty,Actual Qty\n';
    const csv = rows.map(r =>
      `"${r.itemName}",${r.itemId},${r.expectedQty},${r.actualQty ?? ''}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="count-batch-${batchId}.csv"`);
    res.send(header + csv);
  }

  @Post('counts/:batchId/import')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSION_CODES.INVENTORY_COUNT)
  @UseInterceptors(FileInterceptor('file'))
  async importCountCSV(
    @Param('batchId') batchId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('CSV file is required');

    const content = file.buffer.toString('utf-8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) throw new BadRequestException('CSV must have a header and at least one data row');

    const rows: { itemId: string; actualQty: number }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = parseCsvLine(lines[i]);
      const itemId = parts[1]?.trim();
      const actualQty = parseFloat(parts[3]?.trim());
      if (!itemId || isNaN(actualQty)) continue;
      rows.push({ itemId, actualQty });
    }

    const updated = await this.countService.importBatch(batchId as any, rows);
    return { data: { updated } };
  }

  // ── Waste ──────────────────────────────────────────────────────────────────

  @Post('waste')
  @RequirePermission(PERMISSION_CODES.INVENTORY_WRITE)
  async createWaste(@CurrentUser() user: JwtPayload, @Body(new ZodValidationPipe(createWasteLogSchema)) dto: CreateWasteLogDto) {
    const data = await this.opsService.createWasteLog(user.restaurantId, dto);
    return { data };
  }

  @Get('waste')
  @RequirePermission(PERMISSION_CODES.INVENTORY_READ)
  async listWaste(@CurrentUser() user: JwtPayload) {
    const data = await this.opsService.listWasteLogs(user.restaurantId);
    return { data };
  }

  // ── Prep Production ────────────────────────────────────────────────────────

  @Post('prep')
  @RequirePermission(PERMISSION_CODES.INVENTORY_WRITE)
  async createPrepLog(@CurrentUser() user: JwtPayload, @Body(new ZodValidationPipe(createPrepLogSchema)) dto: CreatePrepLogDto) {
    const data = await this.opsService.createPrepLog(user.restaurantId, dto);
    return { data };
  }

  @Get('prep')
  @RequirePermission(PERMISSION_CODES.INVENTORY_READ)
  async listPrepLogs(@CurrentUser() user: JwtPayload) {
    const data = await this.opsService.listPrepLogs(user.restaurantId);
    return { data };
  }
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}
