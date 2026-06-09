import { Module } from '@nestjs/common';
import { ReportingService, REPORTING_SERVICE_TOKEN } from './reporting.service';
import { ReportingRepository, REPORTING_REPOSITORY_TOKEN } from './reporting.repository';
import { ReportingController } from './reporting.controller';

@Module({
  controllers: [ReportingController],
  providers: [
    {
      provide: REPORTING_SERVICE_TOKEN,
      useClass: ReportingService,
    },
    {
      provide: REPORTING_REPOSITORY_TOKEN,
      useClass: ReportingRepository,
    },
  ],
  exports: [],
})
export class ReportingModule {}
