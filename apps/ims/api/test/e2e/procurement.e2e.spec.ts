import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';
import { cleanDatabase } from '../helpers/database-cleanup';

describe('Procurement (e2e)', () => {
  let app: INestApplication;
  let vendorId: string;
  let poId: string;
  let catId: string;
  let itemId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await cleanDatabase(app);
    if (app) await app.close();
  });

  describe('Vendors', () => {
    it('GET /procurement/vendors should return vendor list', async () => {
      const res = await request(app.getHttpServer())
        .get('/procurement/vendors')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /procurement/vendors should create a new vendor', async () => {
      const res = await request(app.getHttpServer())
        .post('/procurement/vendors')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ name: `E2E Vendor ${Date.now()}`, contactEmail: 'vendor@e2e.com', franchiseGroupId: 'a0000000-0000-0000-0000-000000000001', restaurantId: null })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toContain('E2E Vendor');
      vendorId = res.body.data.id;
    });

    it('GET /procurement/vendors/:id should return vendor by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/procurement/vendors/${vendorId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data.id).toBe(vendorId);
    });

    it('PATCH /procurement/vendors/:id should update vendor', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/procurement/vendors/${vendorId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ contactEmail: 'updated@e2e.com' })
        .expect(200);

      expect(res.body).toHaveProperty('data');
    });

    it('POST /procurement/vendors should validate required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/procurement/vendors')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({})
        .expect(400);

      expect(res.body.error.message).toBe('Validation failed');
    });
  });

  describe('Purchase Orders', () => {
    let categoryId: string;

    beforeAll(async () => {
      const catRes = await request(app.getHttpServer())
        .post('/items/categories')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ name: `E2E PO Category ${Date.now()}` })
        .expect(201);

      categoryId = catRes.body?.data?.id ?? catRes.body?.id;
      catId = categoryId;

      const sku = `E2E-PO-ITEM-${Date.now()}`;
      const itemRes = await request(app.getHttpServer())
        .post('/items')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({
          name: 'E2E PO Item',
          categoryId,
          sku,
          type: 'INGREDIENTS',
          purchasingUom: 'kg',
          inventoryUom: 'kg',
        })
        .expect(201);

      itemId = itemRes.body?.data?.id ?? itemRes.body?.id;
    });

    it('GET /procurement/orders should return PO list', async () => {
      const res = await request(app.getHttpServer())
        .get('/procurement/orders')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /procurement/orders should create a draft PO', async () => {
      const res = await request(app.getHttpServer())
        .post('/procurement/orders')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({
          vendorId,
          referenceNumber: `PO-${Date.now()}`,
          lineItems: [
            { itemId, quantityOrdered: 10, rawUnitPrice: 2.50 },
          ],
        })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.status).toBe('DRAFT');
      poId = res.body.data.id;
    });

    it('GET /procurement/orders/:id should return PO by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/procurement/orders/${poId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data.id).toBe(poId);
    });

    it('GET /procurement/orders/:id/line-items should return line items', async () => {
      const res = await request(app.getHttpServer())
        .get(`/procurement/orders/${poId}/line-items`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('PATCH /procurement/orders/:id/submit should transition to SUBMITTED', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/procurement/orders/${poId}/submit`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data.status).toBe('SUBMITTED');
    });

    it('PATCH /procurement/orders/:id/cancel should cancel a submitted PO', async () => {
      const poRes = await request(app.getHttpServer())
        .post('/procurement/orders')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({
          vendorId,
          referenceNumber: `PO-CANCEL-${Date.now()}`,
          lineItems: [
            { itemId, quantityOrdered: 5, rawUnitPrice: 3.00 },
          ],
        })
        .expect(201);

      const cancelPoId = poRes.body.data.id;

      await request(app.getHttpServer())
        .patch(`/procurement/orders/${cancelPoId}/submit`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      const cancelRes = await request(app.getHttpServer())
        .patch(`/procurement/orders/${cancelPoId}/cancel`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(cancelRes.body).toHaveProperty('data');
    });

    it('POST /procurement/orders should validate required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/procurement/orders')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({})
        .expect(400);

      expect(res.body.error.message).toBe('Validation failed');
    });
  });

  describe('Inventory Batches', () => {
    it('GET /procurement/batches should return batch list', async () => {
      const res = await request(app.getHttpServer())
        .get('/procurement/batches')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
