import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';

describe('Sales (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('GET /sales-imports', () => {
    it('should return paginated import batches', async () => {
      const res = await request(app.getHttpServer())
        .get('/sales-imports')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
    });
  });

  describe('POST /sales-imports/upload', () => {
    it('should reject upload without file', async () => {
      const res = await request(app.getHttpServer())
        .post('/sales-imports/upload')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .field('businessDate', '2024-01-15')
        .expect(422);

      expect(res.body).toHaveProperty('error');
    });
  });
});
