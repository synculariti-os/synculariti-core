import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../helpers/test-app';
import { cleanDatabase } from '../helpers/database-cleanup';

describe('Recipe (e2e)', () => {
  let app: INestApplication;
  let recipeId: string;
  let mappingId: string;
  let rawItemId: string;
  let prepItemId: string;

  beforeAll(async () => {
    app = await createTestApp();

    const catRes = await request(app.getHttpServer())
      .post('/items/categories')
      .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
      .send({ name: `E2E Recipe Cat ${Date.now()}` })
      .expect(201);

    const categoryId = catRes.body?.data?.id ?? catRes.body?.id;

    const rawSku = `E2E-RAW-${Date.now()}`;
    const rawRes = await request(app.getHttpServer())
      .post('/items')
      .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
      .send({
        name: 'E2E RAW Ingredient',
        categoryId,
        sku: rawSku,
        type: 'INGREDIENTS',
        purchasingUom: 'kg',
        inventoryUom: 'kg',
      })
      .expect(201);
    rawItemId = rawRes.body?.data?.id ?? rawRes.body?.id;

    const prepSku = `E2E-PREP-${Date.now()}`;
    const prepRes = await request(app.getHttpServer())
      .post('/items')
      .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
      .send({
        name: 'E2E PREP Item',
        categoryId,
        sku: prepSku,
        type: 'INGREDIENTS',
        purchasingUom: 'kg',
        inventoryUom: 'kg',
        recipeUom: 'kg',
        invToRecipeRatio: 1,
      })
      .expect(201);
    prepItemId = prepRes.body?.data?.id ?? prepRes.body?.id;
  });

  afterAll(async () => {
    await cleanDatabase(app);
    if (app) await app.close();
  });

  describe('GET /recipes/upload/template', () => {
    it('should return CSV template', async () => {
      const res = await request(app.getHttpServer())
        .get('/recipes/upload/template')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.text).toContain('producesItemSku');
      expect(res.text).toContain('ingredientSku');
    });
  });

  describe('POST /recipes', () => {
    it('should create a standard recipe with ingredients', async () => {
      const res = await request(app.getHttpServer())
        .post('/recipes')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({
          producesItemId: prepItemId,
          recipeName: `E2E Standard Recipe ${Date.now()}`,
          yieldQuantity: 1,
          ingredients: [
            { lineType: 'ingredient', ingredientItemId: rawItemId, quantityRequired: 0.5 },
          ],
        })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      recipeId = res.body.data.id;
    });

    it('should create a virtual recipe by name', async () => {
      const res = await request(app.getHttpServer())
        .post('/recipes')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({
          recipeName: `E2E Virtual Recipe ${Date.now()}`,
          yieldQuantity: 1,
          ingredients: [
            { lineType: 'ingredient', ingredientItemId: rawItemId, quantityRequired: 0.25 },
          ],
          priceEur: 5.99,
          vatRate: 19,
        })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
    });

    it('should validate required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/recipes')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({})
        .expect(400);

      expect(res.body.error.message).toBe('Validation failed');
    });

    it('should reject recipe when recipeName is missing', async () => {
      const res = await request(app.getHttpServer())
        .post('/recipes')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({
          producesItemId: prepItemId,
          yieldQuantity: 1,
          ingredients: [
            { lineType: 'ingredient', ingredientItemId: rawItemId, quantityRequired: 0.5 },
          ],
        })
        .expect(400);

      expect(res.body.error.message).toBe('Validation failed');
    });
  });

  describe('POST /recipes/upload', () => {
    it('should upload a valid CSV and create recipes', async () => {
      const csv = `producesItemSku,producesItemName,categoryName,recipeName,yieldQuantity,priceEur,vatRate,ingredientSku,ingredientName,quantityRequired,uom
E2E-CSV-PROD-${Date.now()},E2E CSV Product,E2E Cat,E2E CSV Recipe,1,5.99,19,E2E-CSV-ING-${Date.now()},E2E CSV Ingredient,0.5,kg`;

      const res = await request(app.getHttpServer())
        .post('/recipes/upload')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .attach('file', Buffer.from(csv), 'test.csv')
        .expect(201);

      expect(res.body.createdCount).toBe(1);
      expect(res.body.errorCount).toBe(0);
    });

    it('should create recipes when recipeName is empty but producesItemSku is set', async () => {
      const csv = `producesItemSku,producesItemName,categoryName,recipeName,yieldQuantity,priceEur,vatRate,ingredientSku,ingredientName,quantityRequired,uom
E2E-CSV-FALLBACK-${Date.now()},E2E Fallback Product,E2E Cat,,1,5.99,19,E2E-CSV-ING2-${Date.now()},E2E Fallback Ingredient,0.3,kg`;

      const res = await request(app.getHttpServer())
        .post('/recipes/upload')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .attach('file', Buffer.from(csv), 'test.csv')
        .expect(201);

      expect(res.body.createdCount).toBe(1);
      expect(res.body.errorCount).toBe(0);
    });

    it('should return parse error when both producesItemSku and recipeName are missing', async () => {
      const csv = `producesItemSku,producesItemName,categoryName,recipeName,yieldQuantity,priceEur,vatRate,ingredientSku,ingredientName,quantityRequired,uom
,,E2E Cat,,1,5.99,19,E2E-CSV-ING3-${Date.now()},E2E Invalid Ingredient,0.3,kg`;

      const res = await request(app.getHttpServer())
        .post('/recipes/upload')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .attach('file', Buffer.from(csv), 'test.csv')
        .expect(201);

      expect(res.body.createdCount).toBe(0);
      expect(res.body.errorCount).toBe(1);
    });

    it('should reject CSV with no data rows', async () => {
      const csv = 'producesItemSku,producesItemName,categoryName,recipeName,yieldQuantity,priceEur,vatRate,ingredientSku,ingredientName,quantityRequired,uom';

      const res = await request(app.getHttpServer())
        .post('/recipes/upload')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .attach('file', Buffer.from(csv), 'test.csv')
        .expect(400);

      expect(res.body.error.message).toBe('Uploaded file contains no data rows');
    });
  });

  describe('GET /recipes', () => {
    it('should return recipes list', async () => {
      const res = await request(app.getHttpServer())
        .get('/recipes')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /recipes/:id/ingredients', () => {
    it('should return ingredients for a recipe', async () => {
      const res = await request(app.getHttpServer())
        .get(`/recipes/${recipeId}/ingredients`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PUT /recipes/:id', () => {
    it('should update recipe yield', async () => {
      const res = await request(app.getHttpServer())
        .put(`/recipes/${recipeId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({ yieldQuantity: 2 })
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.yieldQuantity).toBe(2);
    });
  });

  describe('Mappings', () => {
    it('POST /recipes/mappings should create a mapping', async () => {
      await request(app.getHttpServer())
        .post('/recipes/mappings')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .send({
          rawExcelString: `E2E Menu Item ${Date.now()}`,
          recipeId,
        })
        .expect(201);
    });

    it('GET /recipes/mappings should return mappings list', async () => {
      const res = await request(app.getHttpServer())
        .get('/recipes/mappings')
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);

      if (res.body.data.length > 0) {
        mappingId = res.body.data[0].id;
      }
    });

    it('DELETE /recipes/mappings/:id should delete a mapping', async () => {
      if (!mappingId) return;

      await request(app.getHttpServer())
        .delete(`/recipes/mappings/${mappingId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(204);
    });
  });

  describe('DELETE /recipes/:id', () => {
    it('should delete a recipe', async () => {
      const delRes = await request(app.getHttpServer())
        .delete(`/recipes/${recipeId}`)
        .set('x-restaurant-id', 'bbbbbbbb-0000-0000-0000-000000000001')
        .expect(204);
    });
  });
});
