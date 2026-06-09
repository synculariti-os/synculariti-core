import type { PermissionCode, UserId, RestaurantId, FranchiseGroupId } from '@synculariti/types';

export interface IPermissionRepository {
  resolvePermissions(userId: UserId, restaurantId: RestaurantId): Promise<PermissionCode[]>;
  getFranchiseGroupForRestaurant(restaurantId: RestaurantId): Promise<FranchiseGroupId>;

  // Admin: Roles
  findAllRoles(): Promise<any[]>;
  findRoleById(roleId: string): Promise<any | null>;
  createRole(data: Record<string, unknown>): Promise<any>;
  updateRole(roleId: string, data: Record<string, unknown>): Promise<any | null>;
  deleteRole(roleId: string): Promise<void>;

  // Admin: Permissions
  findAllPermissions(): Promise<any[]>;

  // Admin: Role-Permissions
  findAllRolePermissions(): Promise<any[]>;
  assignPermissionToRole(roleId: string, permissionId: string): Promise<void>;
  removePermissionFromRole(roleId: string, permissionId: string): Promise<void>;

  // Admin: User-Restaurant-Roles
  findAllUserRestaurantRoles(): Promise<any[]>;
  assignUserRestaurantRole(data: Record<string, unknown>): Promise<any>;
  removeUserRestaurantRoleByComposite(dto: { userId: string; restaurantId: string; roleId: string }): Promise<void>;
}
