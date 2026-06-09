import { Module } from '@nestjs/common';
import { SETTINGS_SERVICE_TOKEN } from './interfaces/i-settings.service';
import { SETTINGS_REPOSITORY_TOKEN } from './interfaces/i-settings.repository';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';
import { SettingsController } from './settings.controller';

@Module({
  controllers: [SettingsController],
  providers: [
    {
      provide: SETTINGS_SERVICE_TOKEN,
      useClass: SettingsService,
    },
    {
      provide: SETTINGS_REPOSITORY_TOKEN,
      useClass: SettingsRepository,
    },
  ],
  exports: [SETTINGS_SERVICE_TOKEN],
})
export class SettingsModule {}
