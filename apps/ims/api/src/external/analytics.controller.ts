import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('external-analytics')
@Public()
@Controller('api/analytics')
export class AnalyticsController {
  @Get('food-cost-variance')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Food cost variance report (not yet ported)' })
  async foodCostVariance(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return { error: 'Food cost variance not yet implemented in this server' };
  }
}
