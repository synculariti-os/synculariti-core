import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { ANALYTICS_SERVICE_TOKEN, IAnalyticsService } from './interfaces/i-analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject(ANALYTICS_SERVICE_TOKEN)
    private readonly analyticsService: IAnalyticsService,
  ) {}

  @Get('waterfall')
  async getWaterfall(
    @Query('mode') mode?: string,
    @Query('tenant_id') tenantId?: string,
  ) {
    const m = mode === 'kg' ? 'kg' : 'eur';
    const tid = tenantId || 'a0000000-0000-0000-0000-000000000001';
    const data = await this.analyticsService.getWaterfall(tid, m);
    return { data };
  }

  @Get('tunnel')
  async getTunnel(
    @Query('mode') mode?: string,
    @Query('tenant_id') tenantId?: string,
    @Query('category_id') categoryId?: string,
    @Query('item_id') itemId?: string,
  ) {
    const m = mode === 'kg' ? 'kg' : 'eur';
    const tid = tenantId || 'a0000000-0000-0000-0000-000000000001';

    if (itemId) {
      const data = await this.analyticsService.getTunnelItemDetail(itemId);
      return { data };
    }
    if (categoryId) {
      const data = await this.analyticsService.getTunnelItems(categoryId, m);
      return { data };
    }
    const data = await this.analyticsService.getTunnelCategories(tid, m);
    return { data };
  }
}
