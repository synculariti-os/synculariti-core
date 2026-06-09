import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { randomUUID } from 'crypto';
import { Database, PermissionCode, UserId, RestaurantId, FranchiseGroupId, asFranchiseGroupId } from '@synculariti/types';
import { IPermissionRepository } from './interfaces/i-permission.repository';
import type { AssignUserRestaurantRoleDto } from '@synculariti/validators';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(@Inject('DB_CLIENT') private readonly db: Kysely<Database>) {}

  async resolvePermissions(userId: UserId, restaurantId: RestaurantId): Promise<PermissionCode[]> {
    const result = await this.db
      .selectFrom('user_restaurant_roles as urr')
      .innerJoin('roles as r', 'r.id', 'urr.role_id')
      .innerJoin('role_permissions as rp', 'rp.role_id', 'r.id')
      .innerJoin('permissions as p', 'p.id', 'rp.permission_id')
      .select('p.code')
      .where('urr.user_id', '=', userId)
      .where('urr.restaurant_id', '=', restaurantId)
      .execute();

    return result.map(row => row.code as PermissionCode);
  }

  async getFranchiseGroupForRestaurant(restaurantId: RestaurantId): Promise<FranchiseGroupId> {
    const result = await this.db
      .selectFrom('restaurants')
      .select('franchise_group_id')
      .where('id', '=', restaurantId)
      .executeTakeFirst();

    if (!result) {
      throw new NotFoundException(`Restaurant ${restaurantId} not found`);
    }

    return asFranchiseGroupId(result.franchise_group_id);
  }

  // ── Roles ───────────────────────────────────────────────────────────────────

  async findAllRoles(): Promise<any[]> {
    return this.db
      .selectFrom('roles')
      .select([
        'id',
        'name',
        'description',
        sql<string>`created_at`.as('createdAt'),
      ])
      .orderBy('name')
      .execute();
  }

  async findRoleById(roleId: string): Promise<any | null> {
    return this.db
      .selectFrom('roles')
      .select([
        'id',
        'name',
        'description',
        sql<string>`created_at`.as('createdAt'),
      ])
      .where('id', '=', roleId as any)
      .executeTakeFirst();
  }

  async createRole(data: Record<string, unknown>): Promise<any> {
    const id = randomUUID();
    await this.db.insertInto('roles').values({ id, ...data } as any).execute();
    return this.findRoleById(id);
  }

  async updateRole(roleId: string, data: Record<string, unknown>): Promise<any | null> {
    const row = await this.db
      .updateTable('roles')
      .set(data as any)
      .where('id', '=', roleId as any)
      .returning(['id', 'name', 'description', sql<string>`created_at`.as('createdAt')])
      .executeTakeFirst();
    return row || null;
  }

  async deleteRole(roleId: string): Promise<void> {
    await this.db.deleteFrom('roles').where('id', '=', roleId as any).execute();
  }

  // ── Permissions ─────────────────────────────────────────────────────────────

  async findAllPermissions(): Promise<any[]> {
    const rows = await this.db.selectFrom('permissions').selectAll().orderBy('code').execute();
    return rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      createdAt: r.created_at,
    }));
  }

  // ── Role-Permissions ────────────────────────────────────────────────────────

  async findAllRolePermissions(): Promise<any[]> {
    const rows = await this.db
      .selectFrom('role_permissions as rp')
      .innerJoin('roles as r', 'r.id', 'rp.role_id')
      .innerJoin('permissions as p', 'p.id', 'rp.permission_id')
      .select([
        'rp.role_id',
        'rp.permission_id',
        sql<string>`r.name`.as('roleName'),
        sql<string>`p.code`.as('permissionCode'),
        sql<string>`p.code`.as('permissionName'),
      ])
      .execute();
    return rows.map(r => ({
      roleId: r.role_id,
      permissionId: r.permission_id,
      roleName: r.roleName,
      permissionCode: r.permissionCode,
      permissionName: r.permissionName,
    }));
  }

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await this.db
      .insertInto('role_permissions')
      .values({ role_id: roleId as any, permission_id: permissionId as any })
      .execute();
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.db
      .deleteFrom('role_permissions')
      .where('role_id', '=', roleId as any)
      .where('permission_id', '=', permissionId as any)
      .execute();
  }

  // ── User-Restaurant-Roles ───────────────────────────────────────────────────

  async findAllUserRestaurantRoles(): Promise<any[]> {
    return this.db
      .selectFrom('user_restaurant_roles as urr')
      .innerJoin('users as u', 'u.id', 'urr.user_id')
      .innerJoin('restaurants as r', 'r.id', 'urr.restaurant_id')
      .innerJoin('roles as rol', 'rol.id', 'urr.role_id')
      .select([
        sql<string>`urr.user_id`.as('userId'),
        sql<string>`urr.restaurant_id`.as('restaurantId'),
        sql<string>`urr.role_id`.as('roleId'),
        sql<string>`u.email`.as('email'),
        sql<string>`u.full_name`.as('fullName'),
        sql<string>`r.name`.as('restaurantName'),
        sql<string>`rol.name`.as('roleName'),
      ])
      .execute();
  }

  async assignUserRestaurantRole(data: Record<string, unknown>): Promise<any> {
    await this.db
      .insertInto('user_restaurant_roles')
      .values(data as any)
      .execute();
    return data;
  }

  async removeUserRestaurantRoleByComposite(dto: AssignUserRestaurantRoleDto): Promise<void> {
    await this.db
      .deleteFrom('user_restaurant_roles')
      .where('user_id', '=', dto.userId as any)
      .where('restaurant_id', '=', dto.restaurantId as any)
      .where('role_id', '=', dto.roleId as any)
      .execute();
  }
}
