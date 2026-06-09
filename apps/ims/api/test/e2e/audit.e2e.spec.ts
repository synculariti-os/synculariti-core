import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';

describe('Audit (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('GET /audit/logs', () => {
    it('should return paginated audit logs', async () => {
      const res = await request(app.getHttpServer())
        .get('/audit/logs')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should respect pagination params', async () => {
      const res = await request(app.getHttpServer())
        .get('/audit/logs?limit=5&offset=0')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /audit/logs/:id', () => {
    let logId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .get('/audit/logs')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      if (res.body.data.length > 0) {
        logId = res.body.data[0].id;
      }
    });

    it('should return audit log by id', async () => {
      if (!logId) return;

      const res = await request(app.getHttpServer())
        .get(`/audit/logs/${logId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data.id).toBe(logId);
    });

    it('should return 404 for non-existent log', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app.getHttpServer())
        .get(`/audit/logs/${fakeId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(404);

      expect(res.body.error.message).toContain('not found');
    });
  });
});
