import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ReportingService, REPORTING_SERVICE_TOKEN } from './reporting.service';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PERMISSION_CODES } from '@synculariti/types';
import type { JwtPayload } from '@synculariti/types';

@Controller('reports')
export class ReportingController {
  constructor(
    @Inject(REPORTING_SERVICE_TOKEN) private readonly reportingService: ReportingService,
  ) {}

  @Get('variance')
  @RequirePermission(PERMISSION_CODES.REPORTING_READ)
  async getVariance(@CurrentUser() user: JwtPayload) {
    const data = await this.reportingService.getVarianceAnalytics(user.restaurantId);
    return { data };
  }

  @Get('snapshots')
  @RequirePermission(PERMISSION_CODES.REPORTING_READ)
  async getSnapshots(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? Number(limit) : 50;
    const offsetNum = offset ? Number(offset) : 0;
    const data = await this.reportingService.getDailySnapshots(user.restaurantId, limitNum, offsetNum);
    return { data };
  }

  @Get('par-alerts')
  @RequirePermission(PERMISSION_CODES.REPORTING_READ)
  async getParAlerts(@CurrentUser() user: JwtPayload) {
    const data = await this.reportingService.getParAlerts(user.restaurantId);
    return { data };
  }
}
