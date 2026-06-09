import type { RestaurantId, FeatureFlag, FeatureFlagKey } from '@synculariti/types';

export const SETTINGS_REPOSITORY_TOKEN = Symbol('SETTINGS_REPOSITORY_TOKEN');

export interface ISettingsRepository {
  findFlagsByRestaurant(restaurantId: RestaurantId): Promise<FeatureFlag[]>;
  upsertFlag(restaurantId: RestaurantId, flagKey: FeatureFlagKey, flagValue: boolean): Promise<FeatureFlag>;
  findFlag(restaurantId: RestaurantId, flagKey: FeatureFlagKey): Promise<FeatureFlag | null>;
}
