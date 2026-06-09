import { Injectable, Inject } from '@nestjs/common';
import { ReportingRepository, REPORTING_REPOSITORY_TOKEN } from './reporting.repository';
import type { RestaurantId } from '@synculariti/types';

export const REPORTING_SERVICE_TOKEN = Symbol('IReportingService');

@Injectable()
export class ReportingService {
  constructor(
    @Inject(REPORTING_REPOSITORY_TOKEN) private readonly reportingRepo: ReportingRepository,
  ) {}

  async getVarianceAnalytics(restaurantId: RestaurantId) {
    return this.reportingRepo.findVarianceAnalytics(restaurantId);
  }

  async getDailySnapshots(restaurantId: RestaurantId, limit: number, offset: number) {
    return this.reportingRepo.findDailySnapshots(restaurantId, limit, offset);
  }

  async getParAlerts(restaurantId: RestaurantId) {
    return this.reportingRepo.findParAlerts(restaurantId);
  }
}
