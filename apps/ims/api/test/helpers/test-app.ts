import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Module, ExecutionContext } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { CoreModule } from '../../src/core/core.module';
import { AuthModule } from '../../src/auth/auth.module';
import { TenantModule } from '../../src/tenant/tenant.module';
import { ItemModule } from '../../src/item/item.module';
import { RecipeModule } from '../../src/recipe/recipe.module';
import { SalesModule } from '../../src/sales/sales.module';
import { InventoryModule } from '../../src/inventory/inventory.module';
import { ProcurementModule } from '../../src/procurement/procurement.module';
import { ReportingModule } from '../../src/reporting/reporting.module';
import { AuditModule } from '../../src/audit/audit.module';
import { AppController } from '../../src/app.controller';
import { TransformResponseInterceptor } from '../../src/common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { SupabaseAuthGuard } from '../../src/common/guards/supabase-auth.guard';
import { PermissionsGuard } from '../../src/common/guards/permissions.guard';
import type { JwtPayload, RestaurantId } from '@synculariti/types';
import { AUTH_SERVICE_TOKEN } from '../../src/auth/interfaces/i-auth.service';

const TEST_USER: JwtPayload = {
  sub: 'bde350b2-82f5-4f00-8cd2-76c79fe256fe' as any,
  email: 'pkrniit@gmail.com',
  restaurantId: 'b0000000-0000-0000-0000-000000000001' as RestaurantId,
  franchiseGroupId: 'a0000000-0000-0000-0000-000000000001' as any,
  permissions: [
    'ADMIN.TENANTS', 'ADMIN.ROLES', 'ADMIN.USERS',
    'PROCUREMENT.READ', 'PROCUREMENT.WRITE',
    'INVENTORY.READ', 'INVENTORY.WRITE', 'INVENTORY.COUNT',
    'RECIPE.READ', 'RECIPE.WRITE',
    'SALES.READ', 'SALES.IMPORT', 'REPORTING.READ',
  ] as any,
};

const mockAuthService = {
  verifyToken: async () => ({ sub: TEST_USER.sub, email: TEST_USER.email }),
  verifyAndEnrich: async () => TEST_USER,
  resolvePermissions: async () => TEST_USER.permissions,
  getProfile: async () => ({
    id: TEST_USER.sub, email: TEST_USER.email, fullName: 'Test User',
    phoneNumber: null, active: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  }),
  updateProfile: async () => ({}),
};

@Module({
  imports: [
    CoreModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    AuthModule,
    TenantModule,
    ItemModule,
    RecipeModule,
    SalesModule,
    InventoryModule,
    ProcurementModule,
    ReportingModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useValue: { canActivate: (ctx: ExecutionContext) => { ctx.switchToHttp().getRequest().user = TEST_USER; return true; } } },
    { provide: APP_INTERCEPTOR, useValue: { intercept: (ctx: ExecutionContext, next: any) => next.handle() } },
    { provide: APP_INTERCEPTOR, useClass: TransformResponseInterceptor },
    { provide: APP_INTERCEPTOR, useValue: { intercept: (ctx: ExecutionContext, next: any) => next.handle() } },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    SupabaseAuthGuard,
    PermissionsGuard,
  ],
})
class E2ETestModule {}

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [E2ETestModule],
  })
    .overrideProvider(AUTH_SERVICE_TOKEN)
    .useValue(mockAuthService)
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}
