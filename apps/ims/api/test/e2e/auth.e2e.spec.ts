import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';
import { cleanDatabase } from '../helpers/database-cleanup';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let roleId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await cleanDatabase(app);
    if (app) await app.close();
  });

  describe('GET /auth/me', () => {
    it('should return current user profile with permissions', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('profile');
      expect(res.body.data).toHaveProperty('permissions');
      expect(res.body.data).toHaveProperty('restaurantId');
      expect(res.body.data.profile).toHaveProperty('email');
      expect(res.body.data.profile).toHaveProperty('fullName');
      expect(res.body.data.permissions).toBeInstanceOf(Array);
    });
  });

  describe('POST /auth/select-restaurant', () => {
    it('should return enriched payload for valid restaurant', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/select-restaurant')
        .set('Authorization', 'Bearer test-token')
        .send({ restaurantId: 'bbbbbbbb-0000-0000-0000-000000000001' })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('sub');
      expect(res.body.data).toHaveProperty('email');
      expect(res.body.data).toHaveProperty('restaurantId');
      expect(res.body.data).toHaveProperty('permissions');
    });

    it('should return 401 when restaurantId is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/select-restaurant')
        .set('Authorization', 'Bearer test-token')
        .send({})
        .expect(401);

      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('message');
    });
  });

  describe('Admin — Roles', () => {
    it('GET /admin/roles should return roles list', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/roles')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /admin/roles should create a new role', async () => {
      const res = await request(app.getHttpServer())
        .post('/admin/roles')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ name: `E2E Test Role ${Date.now()}`, description: 'created during e2e' })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toContain('E2E Test Role');
      roleId = res.body.data.id;
    });

    it('GET /admin/roles/:id should return role by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/admin/roles/${roleId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data.id).toBe(roleId);
    });

    it('PATCH /admin/roles/:id should update role', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/admin/roles/${roleId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ description: 'updated during e2e' })
        .expect(200);

      expect(res.body).toHaveProperty('data');
    });

    it('DELETE /admin/roles/:id should delete role', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/roles/${roleId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(204);
    });

    it('GET /admin/roles/:id should 404 for deleted role', async () => {
      await request(app.getHttpServer())
        .get(`/admin/roles/${roleId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(404);
    });
  });

  describe('Admin — Permissions', () => {
    it('GET /admin/permissions should return permissions list', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/permissions')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Admin — Role-Permissions', () => {
    let permId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/permissions')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);
      permId = res.body.data[0]?.id;
    });

    it('GET /admin/role-permissions should return role-permission assignments', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/role-permissions')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /admin/role-permissions should assign permission to role', async () => {
      const role = await request(app.getHttpServer())
        .post('/admin/roles')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ name: `E2E RP Role ${Date.now()}` })
        .expect(201);

      const rId = role.body.data.id;

      await request(app.getHttpServer())
        .post('/admin/role-permissions')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ roleId: rId, permissionId: permId })
        .expect(201);

      await request(app.getHttpServer())
        .delete('/admin/role-permissions')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ roleId: rId, permissionId: permId })
        .expect(204);

      await request(app.getHttpServer())
        .delete(`/admin/roles/${rId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(204);
    });

    it('DELETE /admin/role-permissions should remove permission from role', async () => {
      const role = await request(app.getHttpServer())
        .post('/admin/roles')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ name: `E2E RP Del ${Date.now()}` })
        .expect(201);

      const rId = role.body.data.id;

      await request(app.getHttpServer())
        .post('/admin/role-permissions')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ roleId: rId, permissionId: permId })
        .expect(201);

      await request(app.getHttpServer())
        .delete('/admin/role-permissions')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ roleId: rId, permissionId: permId })
        .expect(204);

      await request(app.getHttpServer())
        .delete(`/admin/roles/${rId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(204);
    });
  });

  describe('Admin — Users', () => {
    it('GET /admin/users should return users list', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/users')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Admin — User-Restaurant-Roles', () => {
    it('GET /admin/user-restaurant-roles should return list', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/user-restaurant-roles')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
