import { Injectable, Inject } from '@nestjs/common';
import { Database } from '@synculariti/types';
import { Kysely } from 'kysely';
import { SETTINGS_REPOSITORY_TOKEN, ISettingsRepository } from './interfaces/i-settings.repository';
import type { RestaurantId, FeatureFlag, FeatureFlagKey } from '@synculariti/types';

@Injectable()
export class SettingsRepository implements ISettingsRepository {
  constructor(
    @Inject('DB_CLIENT') private readonly db: Kysely<Database>,
  ) {}

  async findFlagsByRestaurant(restaurantId: RestaurantId): Promise<FeatureFlag[]> {
    const rows = await this.db
      .selectFrom('feature_flags')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .execute();

    return rows.map(this.mapRow);
  }

  async findFlag(restaurantId: RestaurantId, flagKey: FeatureFlagKey): Promise<FeatureFlag | null> {
    const row = await this.db
      .selectFrom('feature_flags')
      .selectAll()
      .where('restaurant_id', '=', restaurantId)
      .where('flag_key', '=', flagKey)
      .executeTakeFirst();

    return row ? this.mapRow(row) : null;
  }

  async upsertFlag(restaurantId: RestaurantId, flagKey: FeatureFlagKey, flagValue: boolean): Promise<FeatureFlag> {
    const row = await this.db
      .insertInto('feature_flags')
      .values({
        restaurant_id: restaurantId,
        flag_key: flagKey,
        flag_value: flagValue,
      })
      .onConflict((oc) =>
        oc.columns(['restaurant_id', 'flag_key']).doUpdateSet({
          flag_value: flagValue,
          updated_at: new Date().toISOString(),
        }),
      )
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapRow(row);
  }

  private mapRow(row: any): FeatureFlag {
    return {
      id: row.id,
      restaurantId: row.restaurant_id,
      flagKey: row.flag_key,
      flagValue: row.flag_value,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
