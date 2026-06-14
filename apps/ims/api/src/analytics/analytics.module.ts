import { Module } from '@nestjs/common';
import { ANALYTICS_SERVICE_TOKEN } from './interfaces/i-analytics.service';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  controllers: [AnalyticsController],
  providers: [
    {
      provide: ANALYTICS_SERVICE_TOKEN,
      useClass: AnalyticsService,
    },
  ],
  exports: [ANALYTICS_SERVICE_TOKEN],
})
export class AnalyticsModule {}
