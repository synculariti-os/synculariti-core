import { Injectable, Inject } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import crypto from 'crypto';
import { Database, Json, UserId, RestaurantId, FranchiseGroupId } from '@synculariti/types';
import { IAuditService } from './interfaces/i-audit.service';

@Injectable()
export class AuditService implements IAuditService {
  constructor(@Inject('DB_CLIENT') private readonly db: Kysely<Database>) {}

  async listLogs(restaurantId?: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    let query = this.db
      .selectFrom('audit_log')
      .select([
        'id',
        'action',
        'success',
        'user_agent',
        sql<string>`user_id`.as('userId'),
        sql<string>`user_email`.as('userEmail'),
        sql<string>`entity_type`.as('entityType'),
        sql<string>`entity_id`.as('entityId'),
        sql<string>`old_value`.as('oldValue'),
        sql<string>`new_value`.as('newValue'),
        sql<string>`error_message`.as('errorMessage'),
        sql<string>`source_ip`.as('sourceIp'),
        sql<string>`restaurant_id`.as('restaurantId'),
        sql<string>`franchise_group_id`.as('franchiseGroupId'),
        sql<string>`created_at`.as('createdAt'),
      ])
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (restaurantId) {
      query = query.where('restaurant_id', '=', restaurantId as any);
    }

    return query.execute();
  }

  async findLogById(id: string): Promise<any | null> {
    return this.db
      .selectFrom('audit_log')
      .select([
        'id',
        'action',
        'success',
        'user_agent',
        sql<string>`user_id`.as('userId'),
        sql<string>`user_email`.as('userEmail'),
        sql<string>`entity_type`.as('entityType'),
        sql<string>`entity_id`.as('entityId'),
        sql<string>`old_value`.as('oldValue'),
        sql<string>`new_value`.as('newValue'),
        sql<string>`error_message`.as('errorMessage'),
        sql<string>`source_ip`.as('sourceIp'),
        sql<string>`restaurant_id`.as('restaurantId'),
        sql<string>`franchise_group_id`.as('franchiseGroupId'),
        sql<string>`created_at`.as('createdAt'),
      ])
      .where('id', '=', id as any)
      .executeTakeFirst();
  }

  async logAction(params: {
    userId: string | null;
    userEmail: string | null;
    action: string;
    entityType: string;
    entityId: string;
    oldValue: Json | null;
    newValue: Json | null;
    success: boolean;
    errorMessage?: string;
    sourceIp?: string;
    userAgent?: string;
    restaurantId?: string;
    franchiseGroupId?: string;
  }): Promise<void> {
    try {
      await this.db
        .insertInto('audit_log')
        .values({
          id: crypto.randomUUID(),
          user_id: params.userId as UserId | null,
          user_email: params.userEmail,
          action: params.action,
          entity_type: params.entityType,
          entity_id: params.entityId,
          old_value: params.oldValue,
          new_value: params.newValue,
          success: params.success,
          error_message: params.errorMessage || null,
          source_ip: params.sourceIp || null,
          user_agent: params.userAgent || null,
          restaurant_id: (params.restaurantId as RestaurantId) || null,
          franchise_group_id: (params.franchiseGroupId as FranchiseGroupId) || null,
        })
        .execute();
    } catch (e) {
      console.error('Failed to write audit log:', e);
      // We don't throw here to avoid failing the business transaction if audit logging fails
    }
  }
}
