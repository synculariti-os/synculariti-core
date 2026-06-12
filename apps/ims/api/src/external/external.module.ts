import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AnalyticsController } from './analytics.controller';
import { EkasaController } from './ekasa.controller';

@Module({
  controllers: [AiController, AnalyticsController, EkasaController],
})
export class ExternalModule {}
