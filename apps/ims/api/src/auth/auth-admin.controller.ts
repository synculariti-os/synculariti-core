import {
  Controller, Get, Post, Patch, Delete, Param, Body, Inject,
  HttpCode, HttpStatus, NotFoundException, ConflictException,
} from '@nestjs/common';
import { PERMISSION_REPOSITORY_TOKEN, USER_REPOSITORY_TOKEN } from './auth.service';
import { IPermissionRepository } from './interfaces/i-permission.repository';
import { IUserRepository } from './interfaces/i-user.repository';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PERMISSION_CODES } from '@synculariti/types';
import {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionToRoleSchema,
  assignUserRestaurantRoleSchema,
} from '@synculariti/validators';
import type {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionToRoleDto,
  AssignUserRestaurantRoleDto,
} from '@synculariti/validators';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin')
export class AuthAdminController {
  constructor(
    @Inject(PERMISSION_REPOSITORY_TOKEN) private readonly permissionRepo: IPermissionRepository,
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
  ) {}

  // ── Roles ───────────────────────────────────────────────────────────────────

  @Get('roles')
  @RequirePermission(PERMISSION_CODES.ADMIN_ROLES)
  async listRoles() {
    const data = await this.permissionRepo.findAllRoles();
    return { data };
  }

  @Post('roles')
  @RequirePermission(PERMISSION_CODES.ADMIN_ROLES)
  async createRole(@Body(new ZodValidationPipe(createRoleSchema)) dto: CreateRoleDto) {
    const data = await this.permissionRepo.createRole(dto as any);
    return { data };
  }

  @Get('roles/:id')
  @RequirePermission(PERMISSION_CODES.ADMIN_ROLES)
  async getRole(@Param('id') id: string) {
    const data = await this.permissionRepo.findRoleById(id);
    if (!data) throw new NotFoundException(`Role ${id} not found`);
    return { data };
  }

  @Patch('roles/:id')
  @RequirePermission(PERMISSION_CODES.ADMIN_ROLES)
  async updateRole(@Param('id') id: string, @Body(new ZodValidationPipe(updateRoleSchema)) dto: UpdateRoleDto) {
    const data = await this.permissionRepo.updateRole(id, dto as any);
    if (!data) throw new NotFoundException(`Role ${id} not found`);
    return { data };
  }

  @Delete('roles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION_CODES.ADMIN_ROLES)
  async deleteRole(@Param('id') id: string) {
    await this.permissionRepo.deleteRole(id);
  }

  // ── Permissions ─────────────────────────────────────────────────────────────

  @Get('permissions')
  @RequirePermission(PERMISSION_CODES.ADMIN_ROLES)
  async listPermissions() {
    const data = await this.permissionRepo.findAllPermissions();
    return { data };
  }

  // ── Role-Permissions ────────────────────────────────────────────────────────

  @Get('role-permissions')
  @RequirePermission(PERMISSION_CODES.ADMIN_ROLES)
  async listRolePermissions() {
    const data = await this.permissionRepo.findAllRolePermissions();
    return { data };
  }

  @Post('role-permissions')
  @RequirePermission(PERMISSION_CODES.ADMIN_ROLES)
  async assignPermissionToRole(@Body(new ZodValidationPipe(assignPermissionToRoleSchema)) dto: AssignPermissionToRoleDto) {
    await this.permissionRepo.assignPermissionToRole(dto.roleId, dto.permissionId);
    return { data: null };
  }

  @Delete('role-permissions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION_CODES.ADMIN_ROLES)
  async removePermissionFromRole(@Body() dto: AssignPermissionToRoleDto) {
    await this.permissionRepo.removePermissionFromRole(dto.roleId, dto.permissionId);
  }

  // ── User-Restaurant-Roles ───────────────────────────────────────────────────

  @Get('user-restaurant-roles')
  @RequirePermission(PERMISSION_CODES.ADMIN_USERS)
  async listUserRestaurantRoles() {
    const data = await this.permissionRepo.findAllUserRestaurantRoles();
    return { data };
  }

  @Post('user-restaurant-roles')
  @RequirePermission(PERMISSION_CODES.ADMIN_USERS)
  async assignUserRestaurantRole(@Body(new ZodValidationPipe(assignUserRestaurantRoleSchema)) dto: AssignUserRestaurantRoleDto) {
    const data = await this.permissionRepo.assignUserRestaurantRole(dto as any);
    return { data };
  }

  @Delete('user-restaurant-roles')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION_CODES.ADMIN_USERS)
  async removeUserRestaurantRoleByComposite(@Body() dto: AssignUserRestaurantRoleDto) {
    await this.permissionRepo.removeUserRestaurantRoleByComposite(dto);
  }

  // ── Users ────────────────────────────────────────────────────────────────────

  @Get('users')
  @RequirePermission(PERMISSION_CODES.ADMIN_USERS)
  async listUsers() {
    const data = await this.userRepo.listAll();
    return { data };
  }
}
