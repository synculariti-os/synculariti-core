import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dns from 'dns';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response } from 'express';

// Fix ENETUNREACH on environments that don't support IPv6 (e.g., Render)
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Swagger/OpenAPI setup
  const config = new DocumentBuilder()
    .setTitle('Synculariti IMS API')
    .setDescription('Restaurant Inventory Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('items', 'Item management')
    .addTag('categories', 'Category management')
    .addTag('recipes', 'Recipe management')
    .addTag('inventory', 'Inventory operations')
    .addTag('sales', 'Sales import/management')
    .addTag('procurement', 'Procurement operations')
    .addTag('reporting', 'Reporting & analytics')
    .addTag('audit', 'Audit logging')
    .addTag('settings', 'Settings management')
    .addTag('auth', 'Authentication')
    .addTag('tenant', 'Tenant management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Also expose raw JSON spec at /api/json
  app.use('/api/json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  // Start the server
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger docs: ${await app.getUrl()}/api/docs`);
}

bootstrap();
