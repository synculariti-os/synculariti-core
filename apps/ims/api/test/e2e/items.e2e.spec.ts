import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';
import { cleanDatabase } from '../helpers/database-cleanup';

describe('Items (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await cleanDatabase(app);
    if (app) await app.close();
  });

  describe('GET /items', () => {
    it('should return paginated items list', async () => {
      const res = await request(app.getHttpServer())
        .get('/items')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toMatchObject({
        total: expect.any(Number),
        page: 1,
        limit: 50,
        totalPages: expect.any(Number),
      });
    });

    it('should respect pagination params', async () => {
      const res = await request(app.getHttpServer())
        .get('/items?page=1&limit=5')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body.meta.limit).toBe(5);
    });
  });

  describe('GET /items/categories', () => {
    it('should return categories list', async () => {
      const res = await request(app.getHttpServer())
        .get('/items/categories')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /items/categories', () => {
    it('should create a new category', async () => {
      const res = await request(app.getHttpServer())
        .post('/items/categories')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ name: 'E2E Test Category', description: 'created during e2e' })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data.name).toBe('E2E Test Category');
    });
  });

  describe('POST /items', () => {
    it('should create a new item', async () => {
      const catRes = await request(app.getHttpServer())
        .post('/items/categories')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ name: 'E2E Veggies', description: '' })
        .expect(201);

      const categoryId = catRes.body.data.id;

      const sku = `E2E-TOMATO-${Date.now()}`;
      const res = await request(app.getHttpServer())
        .post('/items')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({
          name: 'E2E Test Tomato',
          categoryId,
          sku,
          type: 'INGREDIENTS',
          purchasingUom: 'kg',
          inventoryUom: 'kg',
        })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data.name).toBe('E2E Test Tomato');
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body.data).toHaveProperty('profile');
      expect(res.body.data).toHaveProperty('permissions');
      expect(res.body.data).toHaveProperty('restaurantId');
    });
  });
});
