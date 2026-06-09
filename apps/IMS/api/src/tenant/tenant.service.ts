import { Injectable, NotFoundException, Inject, ConflictException } from '@nestjs/common';
import type { ITenantService } from './interfaces/i-tenant.service';
import { ITenantRepository, TENANT_REPOSITORY_TOKEN } from './interfaces/i-tenant.repository';
import type { Restaurant, FranchiseGroup, RestaurantId, FranchiseGroupId, UserId } from '@synculariti/types';

@Injectable()
export class TenantService implements ITenantService {
  constructor(
    @Inject(TENANT_REPOSITORY_TOKEN) private readonly tenantRepository: ITenantRepository,
  ) {}

  async getRestaurant(restaurantId: RestaurantId): Promise<Restaurant> {
    const restaurant = await this.tenantRepository.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
    }
    return restaurant;
  }

  async getFranchiseGroup(franchiseGroupId: FranchiseGroupId): Promise<FranchiseGroup> {
    const franchiseGroup = await this.tenantRepository.findFranchiseGroupById(franchiseGroupId);
    if (!franchiseGroup) {
      throw new NotFoundException(`Franchise group with ID ${franchiseGroupId} not found`);
    }
    return franchiseGroup;
  }

  async listRestaurantsForUser(userId: UserId): Promise<Restaurant[]> {
    return this.tenantRepository.findRestaurantsByUserId(userId);
  }

  async createFranchiseGroup(dto: Record<string, unknown>): Promise<any> {
    const data: Record<string, unknown> = {
      name: dto.name,
    };
    return this.tenantRepository.createFranchiseGroup(data);
  }

  async updateFranchiseGroup(id: string, dto: Record<string, unknown>): Promise<any> {
    const updated = await this.tenantRepository.updateFranchiseGroup(id, dto);
    if (!updated) throw new NotFoundException(`Franchise group ${id} not found`);
    return updated;
  }

  async listFranchiseGroups(): Promise<any[]> {
    return this.tenantRepository.findAllFranchiseGroups();
  }

  async createRestaurant(dto: Record<string, unknown>): Promise<any> {
    return this.tenantRepository.createRestaurant({
      franchise_group_id: dto.franchiseGroupId,
      name: dto.name,
      timezone: dto.timezone,
    });
  }

  async updateRestaurant(id: string, dto: Record<string, unknown>): Promise<any> {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.timezone !== undefined) data.timezone = dto.timezone;
    const updated = await this.tenantRepository.updateRestaurant(id, data);
    if (!updated) throw new NotFoundException(`Restaurant ${id} not found`);
    return updated;
  }

  async listRestaurants(): Promise<any[]> {
    return this.tenantRepository.findAllRestaurants();
  }

  async deleteFranchiseGroupsBulk(ids: string[]): Promise<void> {
    const existing = await Promise.all(
      ids.map((id) => this.tenantRepository.findFranchiseGroupById(id as any)),
    );
    const validIds = ids.filter((_, i) => existing[i] !== null);
    if (validIds.length === 0) return;
    await this.tenantRepository.deleteFranchiseGroupsBulk(validIds);
  }
}
