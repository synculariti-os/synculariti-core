import type { Restaurant, FranchiseGroup, RestaurantId, FranchiseGroupId, UserId } from '@synculariti/types';

export const TENANT_REPOSITORY_TOKEN = Symbol('TENANT_REPOSITORY_TOKEN');

export interface FranchiseGroupRecord {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantRecord {
  id: string;
  franchise_group_id: string;
  name: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ITenantRepository {
  findById(restaurantId: RestaurantId): Promise<Restaurant>;
  findFranchiseGroupById(franchiseGroupId: FranchiseGroupId): Promise<FranchiseGroup>;
  findRestaurantsByUserId(userId: UserId): Promise<Restaurant[]>;
  createFranchiseGroup(data: Record<string, unknown>): Promise<FranchiseGroupRecord>;
  findAllFranchiseGroups(): Promise<FranchiseGroupRecord[]>;
  updateFranchiseGroup(id: string, data: Record<string, unknown>): Promise<FranchiseGroupRecord | null>;
  createRestaurant(data: Record<string, unknown>): Promise<RestaurantRecord>;
  findAllRestaurants(): Promise<RestaurantRecord[]>;
  updateRestaurant(id: string, data: Record<string, unknown>): Promise<RestaurantRecord | null>;
  deleteFranchiseGroupsBulk(ids: string[]): Promise<void>;
}
