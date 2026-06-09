import { Injectable, Inject } from '@nestjs/common';
import { Database } from '@synculariti/types';
import { Kysely, sql } from 'kysely';
import { randomUUID } from 'crypto';
import { ITenantRepository, FranchiseGroupRecord, RestaurantRecord } from './interfaces/i-tenant.repository';
import type { Restaurant, FranchiseGroup, RestaurantId, FranchiseGroupId, UserId } from '@synculariti/types';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(
    @Inject('DB_CLIENT') private readonly db: Kysely<Database>,
  ) {}

  async findById(restaurantId: RestaurantId): Promise<Restaurant> {
    const restaurant = await this.db
      .selectFrom('restaurants')
      .selectAll()
      .where('id', '=', restaurantId)
      .executeTakeFirst();
    
    if (!restaurant) return undefined as unknown as Restaurant;
    
    return {
      id: restaurant.id,
      franchiseGroupId: restaurant.franchise_group_id,
      name: restaurant.name,
      timezone: restaurant.timezone,
      createdAt: restaurant.created_at,
      updatedAt: restaurant.updated_at,
    } as unknown as Restaurant;
  }

  async findFranchiseGroupById(franchiseGroupId: FranchiseGroupId): Promise<FranchiseGroup> {
    const group = await this.db
      .selectFrom('franchise_groups')
      .selectAll()
      .where('id', '=', franchiseGroupId)
      .executeTakeFirst();

    if (!group) return undefined as unknown as FranchiseGroup;

    return {
      id: group.id,
      name: group.name,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
    } as unknown as FranchiseGroup;
  }

  async findRestaurantsByUserId(userId: UserId): Promise<Restaurant[]> {
    const restaurants = await this.db
      .selectFrom('user_restaurant_roles')
      .innerJoin('restaurants', 'restaurants.id', 'user_restaurant_roles.restaurant_id')
      .selectAll('restaurants')
      .where('user_restaurant_roles.user_id', '=', userId)
      .execute();

    return restaurants.map(r => ({
      id: r.id,
      franchiseGroupId: r.franchise_group_id,
      name: r.name,
      timezone: r.timezone,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })) as unknown as Restaurant[];
  }

  async createFranchiseGroup(data: Record<string, unknown>): Promise<FranchiseGroupRecord> {
    const id = randomUUID();
    await this.db
      .insertInto('franchise_groups')
      .values({ id, ...data } as any)
      .execute();
    return this.db
      .selectFrom('franchise_groups')
      .selectAll()
      .where('id', '=', id as any)
      .executeTakeFirst() as Promise<FranchiseGroupRecord>;
  }

  async findAllFranchiseGroups(): Promise<FranchiseGroupRecord[]> {
    return this.db
      .selectFrom('franchise_groups')
      .select([
        sql<string>`id`.as('id'),
        sql<string>`name`.as('name'),
        sql<string>`created_at`.as('createdAt'),
        sql<string>`updated_at`.as('updatedAt'),
      ])
      .where('deleted_at', 'is', null)
      .orderBy('name')
      .execute() as any;
  }

  async updateFranchiseGroup(id: string, data: Record<string, unknown>): Promise<FranchiseGroupRecord | null> {
    const row = await this.db
      .updateTable('franchise_groups')
      .set({ ...data, updated_at: new Date().toISOString() } as any)
      .where('id', '=', id as any)
      .returningAll()
      .executeTakeFirst();
    return (row as FranchiseGroupRecord) || null;
  }

  async createRestaurant(data: Record<string, unknown>): Promise<RestaurantRecord> {
    const id = randomUUID();
    await this.db
      .insertInto('restaurants')
      .values({ id, ...data } as any)
      .execute();
    return this.db
      .selectFrom('restaurants')
      .selectAll()
      .where('id', '=', id as any)
      .executeTakeFirst() as Promise<RestaurantRecord>;
  }

  async findAllRestaurants(): Promise<RestaurantRecord[]> {
    return this.db
      .selectFrom('restaurants')
      .select([
        sql<string>`id`.as('id'),
        sql<string>`franchise_group_id`.as('franchiseGroupId'),
        sql<string>`name`.as('name'),
        sql<string>`timezone`.as('timezone'),
        sql<string>`created_at`.as('createdAt'),
        sql<string>`updated_at`.as('updatedAt'),
      ])
      .orderBy('name')
      .execute() as any;
  }

  async updateRestaurant(id: string, data: Record<string, unknown>): Promise<RestaurantRecord | null> {
    const row = await this.db
      .updateTable('restaurants')
      .set({ ...data, updated_at: new Date().toISOString() } as any)
      .where('id', '=', id as any)
      .returningAll()
      .executeTakeFirst();
    return (row as RestaurantRecord) || null;
  }

  async deleteFranchiseGroupsBulk(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db
      .deleteFrom('franchise_groups')
      .where('id', 'in', ids as any)
      .execute();
  }
}
