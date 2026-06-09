import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';
import { cleanDatabase } from '../helpers/database-cleanup';

describe('Tenant (e2e)', () => {
  let app: INestApplication;
  let fgId: string;
  let restaurantId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await cleanDatabase(app);
    if (app) await app.close();
  });

  describe('GET /tenant/context', () => {
    it('should return accessible restaurants for the user', async () => {
      const res = await request(app.getHttpServer())
        .get('/tenant/context')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Franchise Groups', () => {
    it('GET /tenant/franchise-groups should return list', async () => {
      const res = await request(app.getHttpServer())
        .get('/tenant/franchise-groups')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /tenant/franchise-groups should create a new franchise group', async () => {
      const res = await request(app.getHttpServer())
        .post('/tenant/franchise-groups')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ name: `E2E Franchise Group ${Date.now()}` })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toContain('E2E Franchise Group');
      fgId = res.body.data.id;
    });

    it('GET /tenant/franchise-groups/:id should return by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tenant/franchise-groups/${fgId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data.id).toBe(fgId);
    });

    it('PATCH /tenant/franchise-groups/:id should update name', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/tenant/franchise-groups/${fgId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ name: `E2E FG Updated ${Date.now()}` })
        .expect(200);

      expect(res.body).toHaveProperty('data');
    });

    it('DELETE /tenant/franchise-groups/:id should soft-delete', async () => {
      await request(app.getHttpServer())
        .delete(`/tenant/franchise-groups/${fgId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(204);
    });

    it('POST /tenant/franchise-groups should validate required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/tenant/franchise-groups')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({})
        .expect(400);

      expect(res.body.error.message).toBe('Validation failed');
    });
  });

  describe('Restaurants', () => {
    it('GET /tenant/restaurants should return list', async () => {
      const res = await request(app.getHttpServer())
        .get('/tenant/restaurants')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /tenant/restaurants should create a new restaurant', async () => {
      const fgRes = await request(app.getHttpServer())
        .post('/tenant/franchise-groups')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ name: `E2E FG for Restaurant ${Date.now()}` })
        .expect(201);

      const franchiseGroupId = fgRes.body.data.id;

      const res = await request(app.getHttpServer())
        .post('/tenant/restaurants')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ name: `E2E Restaurant ${Date.now()}`, franchiseGroupId, timezone: 'America/New_York' })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toContain('E2E Restaurant');
      restaurantId = res.body.data.id;
    });

    it('GET /tenant/restaurants/:id should return by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tenant/restaurants/${restaurantId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data.id).toBe(restaurantId);
    });

    it('PATCH /tenant/restaurants/:id should update', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/tenant/restaurants/${restaurantId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ name: `E2E Restaurant Updated ${Date.now()}` })
        .expect(200);

      expect(res.body).toHaveProperty('data');
    });

    it('DELETE /tenant/restaurants/:id should soft-delete', async () => {
      await request(app.getHttpServer())
        .delete(`/tenant/restaurants/${restaurantId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(204);
    });

    it('POST /tenant/restaurants should validate required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/tenant/restaurants')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ name: 'Missing Fields' })
        .expect(400);

      expect(res.body.error.message).toBe('Validation failed');
    });
  });
});
