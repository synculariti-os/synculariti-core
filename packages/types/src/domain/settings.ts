import type { RestaurantId, FlagId } from '../branded';

export interface FeatureFlag {
  id: FlagId;
  restaurantId: RestaurantId;
  flagKey: string;
  flagValue: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FeatureFlagKey = 'MULTI_LANGUAGE';
