import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const res = await request(app.getHttpServer())
        .get('/')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toContain('Synculariti');
    });
  });

  describe('GET /health', () => {
    it('should return OK', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toBe('OK');
    });
  });
});
