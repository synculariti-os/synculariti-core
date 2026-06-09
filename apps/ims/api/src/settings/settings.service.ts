import { Injectable, Inject } from '@nestjs/common';
import { SETTINGS_SERVICE_TOKEN, ISettingsService } from './interfaces/i-settings.service';
import { SETTINGS_REPOSITORY_TOKEN, ISettingsRepository } from './interfaces/i-settings.repository';
import type { RestaurantId, FeatureFlag, FeatureFlagKey } from '@synculariti/types';

@Injectable()
export class SettingsService implements ISettingsService {
  constructor(
    @Inject(SETTINGS_REPOSITORY_TOKEN)
    private readonly repository: ISettingsRepository,
  ) {}

  async getFlags(restaurantId: RestaurantId): Promise<FeatureFlag[]> {
    return this.repository.findFlagsByRestaurant(restaurantId);
  }

  async upsertFlag(restaurantId: RestaurantId, flagKey: FeatureFlagKey, flagValue: boolean): Promise<FeatureFlag> {
    return this.repository.upsertFlag(restaurantId, flagKey, flagValue);
  }
}
