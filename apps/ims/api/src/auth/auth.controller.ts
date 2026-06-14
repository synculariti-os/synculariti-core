import { Controller, Get, Post, Inject, Body, Headers, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AUTH_SERVICE_TOKEN, IAuthService } from './interfaces/i-auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TokenOnly } from '../common/decorators/token-only.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PERMISSION_CODES } from '@synculariti/types';
import type { JwtPayload, UserId, RestaurantId, FranchiseGroupId } from '@synculariti/types';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE_TOKEN) private readonly authService: IAuthService,
  ) {}

  @Get('me')
  @TokenOnly()
  async getMe(@CurrentUser() user: JwtPayload) {
    const profile = await this.authService.getProfile(user.sub);
    if (!profile) {
      throw new UnauthorizedException('User profile not found');
    }
    return {
      profile,
      permissions: user.permissions ?? [],
      restaurantId: user.restaurantId ?? null,
      franchiseGroupId: user.franchiseGroupId ?? null,
    };
  }

  @Post('select-restaurant')
  @TokenOnly()
  async selectRestaurant(
    @Body('restaurantId') restaurantId: string,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }
    if (!restaurantId) {
      throw new UnauthorizedException('Missing restaurantId in body');
    }
    const payload = await this.authService.verifyAndEnrich(token, restaurantId as RestaurantId);
    return payload;
  }

  @Post('sudo-tenant')
  @TokenOnly()
  async sudoTenant(
    @Body('franchiseGroupId') franchiseGroupId: string,
    @Body('restaurantId') restaurantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!user.permissions?.includes(PERMISSION_CODES.ADMIN_TENANTS)) {
      throw new ForbiddenException('ADMIN.TENANTS permission required for sudo access');
    }
    if (!franchiseGroupId || !restaurantId) {
      throw new UnauthorizedException('Missing franchiseGroupId or restaurantId in body');
    }
    const payload = await this.authService.sudoTenant(
      user.sub,
      franchiseGroupId as FranchiseGroupId,
      restaurantId as RestaurantId,
    );
    return payload;
  }
}
