import type { RestaurantId, FeatureFlag, FeatureFlagKey } from '@synculariti/types';

export const SETTINGS_SERVICE_TOKEN = Symbol('SETTINGS_SERVICE_TOKEN');

export interface ISettingsService {
  getFlags(restaurantId: RestaurantId): Promise<FeatureFlag[]>;
  upsertFlag(restaurantId: RestaurantId, flagKey: FeatureFlagKey, flagValue: boolean): Promise<FeatureFlag>;
}
