import { Controller, Get, Post, Patch, Delete, Param, Body, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ITenantService, TENANT_SERVICE_TOKEN } from './interfaces/i-tenant.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TokenOnly } from '../common/decorators/token-only.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PERMISSION_CODES } from '@synculariti/types';
import type { JwtPayload, UserId } from '@synculariti/types';
import {
  createFranchiseGroupSchema,
  updateFranchiseGroupSchema,
  createRestaurantSchema,
  updateRestaurantSchema,
  deleteFranchiseGroupsBulkSchema,
} from '@synculariti/validators';
import type { CreateFranchiseGroupDto, UpdateFranchiseGroupDto, CreateRestaurantDto, UpdateRestaurantDto, DeleteFranchiseGroupsBulkDto } from '@synculariti/validators';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('tenant')
export class TenantController {
  constructor(
    @Inject(TENANT_SERVICE_TOKEN) private readonly tenantService: ITenantService,
  ) {}

  @Get('context')
  @TokenOnly()
  async getContext(@CurrentUser() user: { sub: UserId }) {
    const data = await this.tenantService.listRestaurantsForUser(user.sub);
    return { data };
  }

  // ── Franchise Groups ───────────────────────────────────────────────────────

  @Get('franchise-groups')
  @RequirePermission(PERMISSION_CODES.ADMIN_TENANTS)
  async listFranchiseGroups() {
    const data = await this.tenantService.listFranchiseGroups();
    return { data };
  }

  @Post('franchise-groups')
  @RequirePermission(PERMISSION_CODES.ADMIN_TENANTS)
  async createFranchiseGroup(@Body(new ZodValidationPipe(createFranchiseGroupSchema)) dto: CreateFranchiseGroupDto) {
    const data = await this.tenantService.createFranchiseGroup(dto as any);
    return { data };
  }

  @Get('franchise-groups/:id')
  @RequirePermission(PERMISSION_CODES.ADMIN_TENANTS)
  async getFranchiseGroup(@Param('id') id: string) {
    const data = await this.tenantService.getFranchiseGroup(id as any);
    return { data };
  }

  @Patch('franchise-groups/:id')
  @RequirePermission(PERMISSION_CODES.ADMIN_TENANTS)
  async updateFranchiseGroup(@Param('id') id: string, @Body(new ZodValidationPipe(updateFranchiseGroupSchema)) dto: UpdateFranchiseGroupDto) {
    const data = await this.tenantService.updateFranchiseGroup(id, dto as any);
    return { data };
  }

  @Delete('franchise-groups/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION_CODES.ADMIN_TENANTS)
  async deactivateFranchiseGroup(@Param('id') id: string) {
    await this.tenantService.updateFranchiseGroup(id, { deleted_at: new Date().toISOString() });
  }

  @Post('franchise-groups/bulk-delete')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSION_CODES.ADMIN_TENANTS)
  async deleteFranchiseGroupsBulk(@Body(new ZodValidationPipe(deleteFranchiseGroupsBulkSchema)) dto: DeleteFranchiseGroupsBulkDto) {
    await this.tenantService.deleteFranchiseGroupsBulk(dto.ids);
    return { data: null };
  }

  // ── Restaurants ────────────────────────────────────────────────────────────

  @Get('restaurants')
  @RequirePermission(PERMISSION_CODES.ADMIN_TENANTS)
  async listRestaurants() {
    const data = await this.tenantService.listRestaurants();
    return { data };
  }

  @Post('restaurants')
  @RequirePermission(PERMISSION_CODES.ADMIN_TENANTS)
  async createRestaurant(@Body(new ZodValidationPipe(createRestaurantSchema)) dto: CreateRestaurantDto) {
    const data = await this.tenantService.createRestaurant(dto as any);
    return { data };
  }

  @Get('restaurants/:id')
  @RequirePermission(PERMISSION_CODES.ADMIN_TENANTS)
  async getRestaurant(@Param('id') id: string) {
    const data = await this.tenantService.getRestaurant(id as any);
    return { data };
  }

  @Patch('restaurants/:id')
  @RequirePermission(PERMISSION_CODES.ADMIN_TENANTS)
  async updateRestaurant(@Param('id') id: string, @Body(new ZodValidationPipe(updateRestaurantSchema)) dto: UpdateRestaurantDto) {
    const data = await this.tenantService.updateRestaurant(id, dto as any);
    return { data };
  }

  @Delete('restaurants/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission(PERMISSION_CODES.ADMIN_TENANTS)
  async deactivateRestaurant(@Param('id') id: string) {
    await this.tenantService.updateRestaurant(id, { deleted_at: new Date().toISOString() });
  }
}
