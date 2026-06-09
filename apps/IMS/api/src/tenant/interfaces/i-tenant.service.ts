import type { Restaurant, FranchiseGroup, RestaurantId, FranchiseGroupId, UserId } from '@synculariti/types';

export const TENANT_SERVICE_TOKEN = Symbol('TENANT_SERVICE_TOKEN');

export interface ITenantService {
  getRestaurant(restaurantId: RestaurantId): Promise<Restaurant>;
  getFranchiseGroup(franchiseGroupId: FranchiseGroupId): Promise<FranchiseGroup>;
  listRestaurantsForUser(userId: UserId): Promise<Restaurant[]>;
  createFranchiseGroup(dto: Record<string, unknown>): Promise<any>;
  updateFranchiseGroup(id: string, dto: Record<string, unknown>): Promise<any>;
  listFranchiseGroups(): Promise<any[]>;
  deleteFranchiseGroupsBulk(ids: string[]): Promise<void>;
  createRestaurant(dto: Record<string, unknown>): Promise<any>;
  updateRestaurant(id: string, dto: Record<string, unknown>): Promise<any>;
  listRestaurants(): Promise<any[]>;
}
