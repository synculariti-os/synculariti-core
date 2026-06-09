import { Controller, Get, Put, Body, Inject, Param } from '@nestjs/common';
import { SETTINGS_SERVICE_TOKEN, ISettingsService } from './interfaces/i-settings.service';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { PERMISSION_CODES, FeatureFlagKey, RestaurantId } from '@synculariti/types';

@Controller('settings')
export class SettingsController {
  constructor(
    @Inject(SETTINGS_SERVICE_TOKEN)
    private readonly settingsService: ISettingsService,
  ) {}

  @Get('feature-flags')
  @RequirePermission(PERMISSION_CODES.ADMIN_FEATURE_FLAGS)
  async getFlags(@TenantId() restaurantId: RestaurantId) {
    const data = await this.settingsService.getFlags(restaurantId);
    return { data };
  }

  @Put('feature-flags/:flagKey')
  @RequirePermission(PERMISSION_CODES.ADMIN_FEATURE_FLAGS)
  async upsertFlag(
    @TenantId() restaurantId: RestaurantId,
    @Param('flagKey') flagKey: FeatureFlagKey,
    @Body() body: { flagValue: boolean },
  ) {
    const data = await this.settingsService.upsertFlag(restaurantId, flagKey, body.flagValue);
    return { data };
  }
}
